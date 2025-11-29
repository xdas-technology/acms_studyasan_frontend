import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { studentService } from '@/services/api';
import type { Student } from '@/types';
import { ArrowLeft, Edit, Loader2, Mail, Phone, Calendar, School, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchStudent(parseInt(id));
    }
  }, [id]);

  const fetchStudent = async (studentId: number) => {
    setIsLoading(true);
    try {
      const response = await studentService.getById(studentId);
      setStudent(response.data);
    } catch (error) {
      console.error('Failed to fetch student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Student not found</h1>
        <Button onClick={() => navigate('/dashboard/students')} className="mt-4">
          Back to Students
        </Button>
      </div>
    );
  }

  const getGenderDisplay = (gender: string | null) => {
    if (!gender) return '-';
    return gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : 'Other';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard/students')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{student.user.name}</h1>
            <p className="text-muted-foreground">Student Details</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/dashboard/students/${student.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Student
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Student contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{student.user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{student.user.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
            <CardDescription>Class and board details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Class</p>
              {student.class ? (
                <Badge variant="outline">{student.class.name}</Badge>
              ) : (
                <p className="text-sm text-muted-foreground">Not assigned</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Board</p>
              {student.board ? (
                <Badge variant="outline">{student.board.name}</Badge>
              ) : (
                <p className="text-sm text-muted-foreground">Not assigned</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Gender</p>
              <p className="text-sm text-muted-foreground">
                {getGenderDisplay(student.gender)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date of Birth</p>
                <p className="text-sm text-muted-foreground">
                  {student.date_of_birth
                    ? format(new Date(student.date_of_birth), 'PPP')
                    : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <School className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">School</p>
                <p className="text-sm text-muted-foreground">
                  {student.school || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Statistics</CardTitle>
            <CardDescription>Subject enrollment information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Enrollments</p>
                <p className="text-2xl font-bold">{student._count?.enrollments || 0}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate(`/dashboard/enrollments?student_id=${student.id}`)}
            >
              View Enrollments
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Account Timeline</CardTitle>
          <CardDescription>Important dates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Account Created</span>
            <span className="text-sm font-medium">
              {format(new Date(student.created_at), 'PPP')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Last Updated</span>
            <span className="text-sm font-medium">
              {format(new Date(student.updated_at), 'PPP')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}