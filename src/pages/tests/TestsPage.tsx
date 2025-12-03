import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, Users, FileText, Calendar } from 'lucide-react';
import { testService } from '@/services/api';
import type { Test, Subject } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { subjectService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';

  useEffect(() => {
    fetchSubjects();
    fetchTests();
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const params: any = {};
      // For students, only fetch subjects they are enrolled in
      if (isStudent && user?.id) {
        params.user_id = user.id;
        params.role = user.role;
      }
      // For teachers, only fetch subjects they teach
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

  const fetchTests = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedSubject) params.subject_id = selectedSubject;
      
      // For students, only fetch tests from subjects they are enrolled in
      if (user?.role === 'STUDENT' && user?.id) {
        params.user_id = user.id;
        params.role = user.role;
      }
      // For teachers, only fetch tests from subjects they teach
      if (user?.role === 'TEACHER' && user?.id) {
        params.user_id = user.id;
        params.role = user.role;
      }
      
      const response = await testService.getAll(params);
      setTests(response.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId: number) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      await testService.delete(testId);
      fetchTests();
    } catch (error) {
      console.error('Error deleting test:', error);
      alert('Failed to delete test');
    }
  };

  const getTestStatus = (test: Test) => {
    const now = new Date();
    const availableFrom = new Date(test.available_from);
    const availableUntil = new Date(test.available_until);

    if (!test.is_published) return { label: 'Draft', color: 'bg-gray-500' };
    if (now < availableFrom) return { label: 'Upcoming', color: 'bg-blue-500' };
    if (now > availableUntil) return { label: 'Closed', color: 'bg-red-500' };
    return { label: 'Active', color: 'bg-green-500' };
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tests</h1>
          <p className="text-gray-600 mt-1">Manage and view all tests</p>
        </div>
        {isTeacherOrAdmin && (
          <Button onClick={() => navigate('/tests/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Test
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Filter by Subject</label>
              <select
                value={selectedSubject || ''}
                onChange={(e) => setSelectedSubject(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tests Grid */}
      {loading ? (
        <div className="text-center py-12">Loading tests...</div>
      ) : tests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No tests found</p>
            {isTeacherOrAdmin && (
              <Button onClick={() => navigate('/tests/create')} className="mt-4">
                Create Your First Test
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => {
            const status = getTestStatus(test);
            return (
              <Card
                key={test.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/tests/${test.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{test.subject?.name}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {test.description || 'No description'}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>{test._count?.questions || 0} questions</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{test.duration_minutes} minutes</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{test._count?.test_attempts || 0} attempts</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        {new Date(test.available_from).toLocaleDateString()} -{' '}
                        {new Date(test.available_until).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-gray-600">Marks: </span>
                      <span className="font-medium">{test.total_marks}</span>
                      <span className="text-gray-600"> (Pass: {test.passing_marks})</span>
                    </div>
                  </div>

                  {isTeacherOrAdmin && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tests/${test.id}/edit`);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTest(test.id);
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
