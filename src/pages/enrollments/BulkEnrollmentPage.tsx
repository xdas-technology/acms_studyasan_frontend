import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Users, Check } from 'lucide-react';
import { enrollmentService, studentService, subjectService } from '@/services/api';
import type { Student, Subject, BulkEnrollmentData } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';

const BulkEnrollmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BulkEnrollmentData>({
    student_ids: [],
    subject_id: 0,
  });
  const [errors, setErrors] = useState<Partial<BulkEnrollmentData>>({});

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
    const newErrors: Partial<BulkEnrollmentData> = {};

    if (formData.student_ids.length === 0) {
      newErrors.student_ids = [];
    }

    if (!formData.subject_id) {
      newErrors.subject_id = 0;
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
      await enrollmentService.bulkCreate(formData);
      navigate('/dashboard/enrollments');
    } catch (error: any) {
      console.error('Error creating bulk enrollments:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to create enrollments. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStudentToggle = (studentId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      student_ids: checked
        ? [...prev.student_ids, studentId]
        : prev.student_ids.filter(id => id !== studentId)
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      student_ids: checked ? students.map(s => s.id) : []
    }));
  };

  const selectedSubject = subjects.find(s => s.id === formData.subject_id);
  const selectedStudents = students.filter(s => formData.student_ids.includes(s.id));

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
          <h1 className="text-3xl font-bold text-gray-900">Bulk Enrollment</h1>
          <p className="text-gray-600 mt-1">Enroll multiple students in a subject</p>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Enrollment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Selection */}
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

            {/* Student Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Students *
                </label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={formData.student_ids.length === students.length && students.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm text-gray-700">
                    Select All ({students.length})
                  </label>
                </div>
              </div>

              <div className={`border rounded-lg p-4 max-h-96 overflow-y-auto ${errors.student_ids !== undefined ? 'border-red-500' : ''}`}>
                {students.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No students available</p>
                ) : (
                  <div className="space-y-3">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          id={`student-${student.id}`}
                          checked={formData.student_ids.includes(student.id)}
                          onCheckedChange={(checked) => handleStudentToggle(student.id, checked as boolean)}
                        />
                        <label htmlFor={`student-${student.id}`} className="flex-1 cursor-pointer">
                          <div className="flex flex-col">
                            <span className="font-medium">{student.user.name}</span>
                            <span className="text-sm text-gray-500">
                              {student.user.email} • Class: {student.class?.name || 'N/A'} • Board: {student.board?.name || 'N/A'}
                            </span>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.student_ids !== undefined && (
                <p className="mt-1 text-sm text-red-600">Please select at least one student</p>
              )}
            </div>

            {/* Preview */}
            {selectedSubject && selectedStudents.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Enrollment Preview</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Subject:</strong> {selectedSubject.name} ({selectedSubject.class?.name || 'N/A'})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudents.map((student) => (
                        <Badge key={student.id} variant="secondary" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          {student.user.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Total Enrollments:</strong> {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}
                  </p>
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
                    Creating Enrollments...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create {formData.student_ids.length} Enrollment{formData.student_ids.length !== 1 ? 's' : ''}
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

export default BulkEnrollmentPage;