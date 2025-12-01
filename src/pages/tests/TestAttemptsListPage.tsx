import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { testService, testAttemptService } from '@/services/api';
import type { Test, TestAttempt } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TestAttemptsListPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (testId) {
      fetchTest();
      fetchAttempts();
    }
  }, [testId]);

  const fetchTest = async () => {
    try {
      const response = await testService.getById(parseInt(testId!));
      setTest(response.data);
    } catch (error) {
      console.error('Error fetching test:', error);
    }
  };

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const response = await testAttemptService.getTestAttempts(parseInt(testId!));
      setAttempts(response.data);
    } catch (error) {
      console.error('Error fetching attempts:', error);
      alert('Failed to load attempts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Button variant="ghost" onClick={() => navigate(`/tests/${testId}`)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Test
      </Button>

      <h1 className="text-3xl font-bold mb-2">Test Attempts</h1>
      <p className="text-gray-600 mb-6">{test?.title}</p>

      {loading ? (
        <div className="text-center py-12">Loading attempts...</div>
      ) : attempts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">No attempts yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <User className="w-10 h-10 text-gray-400" />
                    <div>
                      <p className="font-semibold">{attempt.student?.user.name}</p>
                      <p className="text-sm text-gray-600">{attempt.student?.user.email}</p>
                      <p className="text-sm text-gray-500">
                        Submitted: {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : 'In Progress'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {attempt.is_graded ? (
                      <div className="text-right">
                        <Badge variant={attempt.is_passed ? 'default' : 'destructive'}>
                          {attempt.score} / {attempt.total_marks}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {attempt.is_passed ? 'Passed' : 'Failed'}
                        </p>
                      </div>
                    ) : attempt.submitted_at ? (
                      <Badge variant="outline">Pending Grading</Badge>
                    ) : (
                      <Badge variant="outline">In Progress</Badge>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/test-attempts/${attempt.id}/grade`)}
                      disabled={!attempt.submitted_at}
                    >
                      {attempt.is_graded ? 'View' : 'Grade'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
