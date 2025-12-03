import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, Users, Calendar, Edit, Play, CheckCircle } from 'lucide-react';
import { testService, testAttemptService } from '@/services/api';
import type { Test } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';

export default function TestDetailPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';

  useEffect(() => {
    if (testId) {
      fetchTest();
    }
  }, [testId]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      const response = await testService.getById(parseInt(testId!));
      setTest(response.data);
    } catch (error) {
      console.error('Error fetching test:', error);
      alert('Failed to load test');
      navigate('/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    try {
      const response = await testAttemptService.startAttempt(parseInt(testId!));
      navigate(`/test-attempts/${response.data.id}`);
    } catch (error: any) {
      console.error('Error starting test:', error);
      alert(error.response?.data?.message || 'Failed to start test');
    }
  };

  const handleTogglePublish = async () => {
    if (!test) return;
    
    const action = test.is_published ? 'unpublish' : 'publish';
    if (!confirm(`Are you sure you want to ${action} this test?`)) return;

    try {
      await testService.update(test.id, {
        is_published: !test.is_published,
      });
      alert(`Test ${action}ed successfully`);
      fetchTest(); // Refresh test data
    } catch (error: any) {
      console.error(`Error ${action}ing test:`, error);
      alert(error.response?.data?.message || `Failed to ${action} test`);
    }
  };

  const getTestStatus = () => {
    if (!test) return { label: 'Unknown', color: 'bg-gray-500', canAttempt: false };
    
    const now = new Date();
    const availableFrom = new Date(test.available_from);
    const availableUntil = new Date(test.available_until);

    if (!test.is_published) return { label: 'Draft', color: 'bg-gray-500', canAttempt: false };
    if (now < availableFrom) return { label: 'Upcoming', color: 'bg-blue-500', canAttempt: false };
    if (now > availableUntil) return { label: 'Closed', color: 'bg-red-500', canAttempt: false };
    return { label: 'Active', color: 'bg-green-500', canAttempt: true };
  };

  if (loading) {
    return <div className="p-6 text-center">Loading test...</div>;
  }

  if (!test) {
    return <div className="p-6 text-center">Test not found</div>;
  }

  const status = getTestStatus();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/tests')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tests
      </Button>

      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{test.title}</h1>
            <Badge className={status.color}>{status.label}</Badge>
          </div>
          <p className="text-gray-600">{test.subject?.name}</p>
        </div>
        <div className="flex gap-2">
          {isTeacherOrAdmin && (
            <>
              <Button 
                variant={test.is_published ? "outline" : "default"}
                onClick={handleTogglePublish}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {test.is_published ? 'Unpublish' : 'Publish'}
              </Button>
              <Button variant="outline" onClick={() => navigate(`/tests/${testId}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" onClick={() => navigate(`/tests/${testId}/attempts`)}>
                <Users className="w-4 h-4 mr-2" />
                View Attempts
              </Button>
            </>
          )}
          {isStudent && status.canAttempt && (
            <Button onClick={handleStartTest}>
              <Play className="w-4 h-4 mr-2" />
              Start Test
            </Button>
          )}
        </div>
      </div>

      {/* Test Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-6">{test.description || 'No description provided'}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Questions</p>
                <p className="font-semibold">{test._count?.questions || 0}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">{test.duration_minutes} min</p>
              </div>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Total Marks</p>
                <p className="font-semibold">{test.total_marks}</p>
              </div>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Passing Marks</p>
                <p className="font-semibold">{test.passing_marks}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                Available from {new Date(test.available_from).toLocaleString()} to{' '}
                {new Date(test.available_until).toLocaleString()}
              </span>
            </div>
            {isTeacherOrAdmin && (
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span>{test._count?.test_attempts || 0} students have attempted this test</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions Preview (for teachers/admin) */}
      {isTeacherOrAdmin && test.questions && test.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {test.questions.map((question, index) => (
                <div key={question.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">
                      {index + 1}. {question.question_text}
                    </p>
                    <Badge variant="outline">{question.marks} marks</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Type: {question.question_type.replace('_', ' ')}</p>

                  {question.question_type === 'MCQ' && question.options && (
                    <div className="ml-4 space-y-1">
                      {(question.options as string[]).map((option, optIndex) => (
                        <p
                          key={optIndex}
                          className={`text-sm ${
                            option === question.correct_answer ? 'text-green-600 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {option === question.correct_answer && ' ✓'}
                        </p>
                      ))}
                    </div>
                  )}

                  {question.question_type === 'TRUE_FALSE' && (
                    <p className="ml-4 text-sm text-green-600 font-medium">
                      Correct Answer: {question.correct_answer}
                    </p>
                  )}

                  {question.question_type === 'SHORT_ANSWER' && (
                    <p className="ml-4 text-sm text-gray-600">
                      Sample Answer: {question.correct_answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
