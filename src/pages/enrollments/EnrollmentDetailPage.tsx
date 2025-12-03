import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, BookOpen, Clock, Trash2 } from 'lucide-react';
import { enrollmentService } from '@/services/api';
import type { Enrollment } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeleteEnrollmentDialog } from '@/components/enrollments/DeleteEnrollmentDialog';
import { useAuthStore } from '@/store/authStore';

const EnrollmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';

  useEffect(() => {
    if (id) {
      fetchEnrollment(parseInt(id));
    }
  }, [id]);

  const fetchEnrollment = async (enrollmentId: number) => {
    try {
      setLoading(true);
      const response = await enrollmentService.getById(enrollmentId);
      const enrollmentData = response.data;

      // Role-based access control
      if (isStudent && enrollmentData.student_id !== user?.id) {
        navigate('/dashboard/enrollments');
        return;
      }

      setEnrollment(enrollmentData);
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      navigate('/dashboard/enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!enrollment) return;

    try {
      await enrollmentService.delete(enrollment.id);
      navigate('/dashboard/enrollments');
    } catch (error) {
      console.error('Error deleting enrollment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEnrollmentTimeline = () => {
    if (!enrollment) return [];

    return [
      {
        date: enrollment.created_on,
        event: 'Enrolled',
        description: `Student enrolled in ${enrollment.subject.name}`,
      },
      {
        date: enrollment.updated_on,
        event: 'Last Updated',
        description: 'Enrollment details were last modified',
      },
    ].filter((item, index, arr) => {
      // Remove duplicates if created_on and updated_on are the same
      return index === 0 || item.date !== arr[index - 1].date;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading enrollment details...</p>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enrollment not found</h2>
        <p className="text-gray-600 mb-4">The enrollment you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link to="/dashboard/enrollments">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Enrollments
          </Button>
        </Link>
      </div>
    );
  }

  const timeline = getEnrollmentTimeline();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/enrollments')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Enrollments
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enrollment Details</h1>
            <p className="text-gray-600 mt-1">Enrollment #{enrollment.id}</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Enrollment
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-lg font-semibold text-gray-900">{enrollment.student.user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{enrollment.student.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{enrollment.student.user.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Class</label>
                  <p className="text-gray-900">{enrollment.student.class?.name || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Board</label>
                  <p className="text-gray-900">{enrollment.student.board?.name || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subject Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Subject Name</label>
                  <p className="text-lg font-semibold text-gray-900">{enrollment.subject.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <Badge variant={enrollment.subject.is_course ? 'default' : 'secondary'}>
                    {enrollment.subject.is_course ? 'Course' : 'Subject'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Class</label>
                  <p className="text-gray-900">{enrollment.subject.class?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Board</label>
                  <p className="text-gray-900">{enrollment.subject.board?.name || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      {index < timeline.length - 1 && (
                        <div className="w-px h-8 bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{item.event}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to={`/dashboard/students/${enrollment.student.id}`}>
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  View Student Profile
                </Button>
              </Link>
              <Link to={`/dashboard/subjects/${enrollment.subject.id}`}>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Subject Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteEnrollmentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        enrollment={enrollment}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default EnrollmentDetailPage;