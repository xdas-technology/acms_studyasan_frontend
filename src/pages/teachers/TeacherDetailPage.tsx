import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { teacherService } from '@/services/api';
import type { Teacher } from '@/types';
import { ArrowLeft, Edit, Loader2, Mail, Phone, BookOpen, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import AssignSubjectDialog from '@/components/teachers/AssignSubjectDialog';

export default function TeacherDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTeacher(parseInt(id));
    }
  }, [id]);

  const fetchTeacher = async (teacherId: number) => {
    setIsLoading(true);
    try {
      const response = await teacherService.getById(teacherId);
      setTeacher(response.data);
    } catch (error) {
      console.error('Failed to fetch teacher:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSubject = async (junctionId: number) => {
    if (!id) return;

    try {
      await teacherService.removeSubject(junctionId);
      fetchTeacher(parseInt(id));
    } catch (error) {
      console.error('Failed to remove subject:', error);
    }
  };

  const handleAssignSuccess = () => {
    if (id) {
      fetchTeacher(parseInt(id));
    }
    setShowAssignDialog(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg font-medium">Teacher not found</p>
        <Button onClick={() => navigate('/dashboard/teachers')} className="mt-4">
          Back to Teachers
        </Button>
      </div>
    );
  }

  const getGenderDisplay = (gender: string | null) => {
    if (!gender) return '-';
    return gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Other';
  };

  const formatSalary = (salary: number | null) => {
    if (!salary) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(salary);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/teachers')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{teacher.user.name}</h1>
            <p className="text-muted-foreground mt-2">Teacher Details</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/dashboard/teachers/${teacher.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Teacher
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Teacher contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{teacher.user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{teacher.user.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>Qualifications and experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Qualification</p>
              <p className="text-sm text-muted-foreground">
                {teacher.qualification || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Experience</p>
              <p className="text-sm text-muted-foreground">
                {teacher.experience || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Gender</p>
              <p className="text-sm text-muted-foreground">
                {getGenderDisplay(teacher.gender)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Salary Information */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Information</CardTitle>
            <CardDescription>Compensation details</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm font-medium mb-1">Monthly Salary</p>
              <p className="text-2xl font-bold">{formatSalary(teacher.salary)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Account Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Account Timeline</CardTitle>
            <CardDescription>Important dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Account Created</span>
              <span className="text-sm font-medium">
                {format(new Date(teacher.created_at), 'PPP')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-sm font-medium">
                {format(new Date(teacher.updated_at), 'PPP')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Subjects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assigned Subjects</CardTitle>
              <CardDescription>
                Subjects taught by this teacher ({teacher.teacher_subject_junctions?.length || 0})
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowAssignDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Assign Subject
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {teacher.teacher_subject_junctions && teacher.teacher_subject_junctions.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {teacher.teacher_subject_junctions.map((junction) => (
                <Card key={junction.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{junction.subject.name}</p>
                          {junction.subject.class && (
                            <Badge variant="outline" className="mt-1">
                              {junction.subject.class.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveSubject(junction.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No subjects assigned</p>
              <p className="text-sm">Click the button above to assign subjects</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Subject Dialog */}
      <AssignSubjectDialog
        teacherId={teacher.id}
        isOpen={showAssignDialog}
        onClose={() => setShowAssignDialog(false)}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
}