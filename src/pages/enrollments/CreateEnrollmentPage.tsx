import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { enrollmentService, studentService, subjectService } from '@/services/api';
import type { Student, Subject, CreateEnrollmentData } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';

const CreateEnrollmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEnrollmentData>({
    student_id: 0,
    subject_id: 0,
  });
  const [errors, setErrors] = useState<Partial<CreateEnrollmentData>>({});

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard/enrollments');
      return;
    }
    fetchStudents();
    fetchSubjects();
  }, [isAdmin, navigate]);

  const fetchStudents = async () => {
    try {
      const response = await studentService.getAll({ limit: 100 });
      setStudents(response.data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const params: any = { limit: 100 };
      // For teachers, only show subjects they are assigned to
      if (user?.role === 'TEACHER' && user?.id) {
        params.user_id = user.id;
        params.role = user.role;
      }
      const response = await subjectService.getAll(params);
      setSubjects(response.data.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateEnrollmentData> = {};

    if (!formData.student_id) {
      newErrors.student_id = 0; // Using 0 as placeholder for error
    }

    if (!formData.subject_id) {
      newErrors.subject_id = 0; // Using 0 as placeholder for error
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await enrollmentService.create(formData);
      navigate('/dashboard/enrollments');
    } catch (error: any) {
      console.error('Error creating enrollment:', error);
      if (error.response?.data?.message) {
        // Handle specific error messages from backend
        alert(error.response.data.message);
      } else {
        alert('Failed to create enrollment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent = students.find(s => s.id === formData.student_id);
  const selectedSubject = subjects.find(s => s.id === formData.subject_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/enrollments')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Enrollments
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Enrollment</h1>
          <p className="text-gray-600 mt-1">Enroll a student in a subject</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Enrollment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student *
              </label>
              <Select
                value={formData.student_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, student_id: parseInt(value) })}
              >
                <SelectTrigger className={errors.student_id !== undefined ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{student.user.name}</span>
                        <span className="text-sm text-gray-500">
                          {student.user.email} • Class: {student.class?.name || 'N/A'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.student_id !== undefined && (
                <p className="mt-1 text-sm text-red-600">Please select a student</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <Select
                value={formData.subject_id.toString()}
                onValueChange={(value) => setFormData({ ...formData, subject_id: parseInt(value) })}
              >
                <SelectTrigger className={errors.subject_id !== undefined ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{subject.name}</span>
                        <span className="text-sm text-gray-500">
                          Class: {subject.class?.name || 'N/A'} • Board: {subject.board?.name || 'N/A'}
                          {subject.is_course && ' • Course'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subject_id !== undefined && (
                <p className="mt-1 text-sm text-red-600">Please select a subject</p>
              )}
            </div>

            {/* Preview */}
            {selectedStudent && selectedSubject && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Enrollment Preview</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Student:</strong> {selectedStudent.user.name}</p>
                  <p><strong>Email:</strong> {selectedStudent.user.email}</p>
                  <p><strong>Class:</strong> {selectedStudent.class?.name || 'N/A'}</p>
                  <p><strong>Board:</strong> {selectedStudent.board?.name || 'N/A'}</p>
                  <p><strong>Subject:</strong> {selectedSubject.name}</p>
                  <p><strong>Subject Class:</strong> {selectedSubject.class?.name || 'N/A'}</p>
                  <p><strong>Subject Board:</strong> {selectedSubject.board?.name || 'N/A'}</p>
                  <p><strong>Type:</strong> {selectedSubject.is_course ? 'Course' : 'Subject'}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/enrollments')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Enrollment
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEnrollmentPage;