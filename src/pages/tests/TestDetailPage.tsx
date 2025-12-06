import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  FileText,
  Users,
  Calendar,
  Edit,
  Play,
  CheckCircle,
} from "lucide-react";
import { testService, testAttemptService } from "@/services/api";
import type { Test, Question } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import SuccessModal from "@/components/ui/successModal";
import ErrorModal from "@/components/ui/errorModal";
import ConfirmModal from "@/components/ui/confirmationModal";

export default function TestDetailPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const isTeacherOrAdmin = user?.role === "TEACHER" || user?.role === "ADMIN";
  const isStudent = user?.role === "STUDENT";

  // Modals state
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

  const fetchTest = useCallback(async () => {
    if (!testId) return;
    try {
      setLoading(true);
      const response = await testService.getById(Number(testId));
      setTest(response.data);
    } catch (error: unknown) {
      console.error("Error fetching test:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to load test"
      );
      setErrorOpen(true);
      navigate("/tests");
    } finally {
      setLoading(false);
    }
  }, [testId, navigate]);

  useEffect(() => {
    fetchTest();
  }, [fetchTest]);

  const handleStartTest = async () => {
    if (!testId) return;
    try {
      const response = await testAttemptService.startAttempt(Number(testId));
      navigate(`/test-attempts/${response.data.id}`);
    } catch (error: unknown) {
      console.error("Error starting test:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to start test");
      setErrorOpen(true);
    }
  };

  const handleTogglePublish = () => {
    if (!test) return;
    const action = test.is_published ? "unpublish" : "publish";

    setConfirmMessage(
      `Are you sure you want to ${action} "${test.title}" of "${test.subject?.name || "-"}"?`
    );

    setConfirmAction(() => async () => {
      try {
        await testService.update(test.id, { is_published: !test.is_published });
        setSuccessMessage(
          `Test "${test.title}" of "${test.subject?.name || "-"}" ${action}ed successfully!`
        );
        setSuccessOpen(true);
        fetchTest();
      } catch (error: unknown) {
        console.error(`Error ${action}ing test:`, error);
        setErrorMessage(error instanceof Error ? error.message : `Failed to ${action} test`);
        setErrorOpen(true);
      } finally {
        setConfirmOpen(false);
      }
    });

    setConfirmOpen(true);
  };

  const getTestStatus = () => {
    if (!test) return { label: "Unknown", color: "bg-gray-400", canAttempt: false };

    const now = new Date();
    const availableFrom = new Date(test.available_from);
    const availableUntil = new Date(test.available_until);

    if (!test.is_published)
      return { label: "Draft", color: "bg-gray-500", canAttempt: false };
    if (now < availableFrom)
      return { label: "Upcoming", color: "bg-blue-500", canAttempt: false };
    if (now > availableUntil)
      return { label: "Closed", color: "bg-red-500", canAttempt: false };
    return { label: "Active", color: "bg-green-500", canAttempt: true };
  };

  if (loading) return <div className="p-6 text-center">Loading test...</div>;
  if (!test) return <div className="p-6 text-center">Test not found</div>;

  const status = getTestStatus();

  return (
    <div className="space-y-6">
      {/* SUCCESS MODAL */}
      <SuccessModal
        open={successOpen}
        title={test.title}
        description={successMessage}
        showButtons
        okText="OK"
        onConfirm={() => setSuccessOpen(false)}
        onClose={() => setSuccessOpen(false)}
      />

      {/* ERROR MODAL */}
      <ErrorModal
        open={errorOpen}
        title={test?.title || "Error"}
        description={errorMessage}
        showButtons
        okText="Close"
        onConfirm={() => setErrorOpen(false)}
        onClose={() => setErrorOpen(false)}
      />

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={confirmOpen}
        title={test?.title || "Confirm Action"}
        description={confirmMessage}
        onConfirm={confirmAction}
        onClose={() => setConfirmOpen(false)}
        confirmText="Yes"
        cancelText="No"
      />

      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div
          onClick={() => navigate("/tests")}
          className="inline-flex items-center text-blue-600 hover:underline cursor-pointer text-sm mb-1"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tests
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-600">{test.title}</h1>
              <Badge className={`${status.color} text-sm flex-shrink-0`}>{status.label}</Badge>
            </div>
            <p className="text-gray-600 text-sm md:mt-0 mt-1">{test.subject?.name}</p>
          </div>

          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            {isTeacherOrAdmin && (
              <>
                <Button
                  variant={test.is_published ? "outline" : "default"}
                  onClick={handleTogglePublish}
                  className="flex items-center text-sm px-3 py-1"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {test.is_published ? "Unpublish" : "Publish"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/tests/${testId}/edit`)}
                  className="flex items-center text-sm px-3 py-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Add Questions
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/tests/${testId}/attempts`)}
                  className="flex items-center text-sm px-3 py-1"
                >
                  <Users className="w-4 h-4 mr-1" />
                  View Attempts
                </Button>
              </>
            )}
            {isStudent && status.canAttempt && (
              <Button
                onClick={handleStartTest}
                className="flex items-center text-sm px-3 py-1"
              >
                <Play className="w-4 h-4 mr-1" />
                Start Test
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Test Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-gray-600">Test Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-6">{test.description || "No description provided"}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-saBlue/50" />
              <div>
                <p className="text-sm text-gray-600">Questions</p>
                <p className="font-semibold">{test._count?.questions || 0}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-saBlue/50" />
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">{test.duration_minutes} min</p>
              </div>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-saBlue/50" />
              <div>
                <p className="text-sm text-gray-600">Total Marks</p>
                <p className="font-semibold">{test.total_marks}</p>
              </div>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-saBlue/50" />
              <div>
                <p className="text-sm text-gray-600">Passing Marks</p>
                <p className="font-semibold">{test.passing_marks}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t space-y-2">
            <div className="flex items-center text-sm text-gray-600 flex-wrap gap-2">
              <Calendar className="w-4 h-4 text-saBlue/50" />
              <span>
                Available from {new Date(test.available_from).toLocaleString()} to{" "}
                {new Date(test.available_until).toLocaleString()}
              </span>
            </div>
            {isTeacherOrAdmin && (
              <div className="flex items-center text-sm text-gray-600 gap-2 flex-wrap">
                <Users className="w-4 h-4 text-saBlue/50" />
                <span>{test._count?.test_attempts || 0} students have attempted this test</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions Preview */}
      {isTeacherOrAdmin && test.questions && test.questions.length > 0 && (
        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {test.questions.map((question: Question, index: number) => (
              <div key={question.id} className="border-b pb-4 last:border-b-0">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-2 gap-2 sm:gap-0">
                  <p className="font-medium text-sm sm:text-base">
                    {index + 1}. {question.question_text}
                  </p>
                  <Badge variant="outline">{question.marks}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Type: {question.question_type.replace("_", " ")}
                </p>

                {question.question_type === "MCQ" && question.options && question.options.length > 0 && (
                  <div className="ml-4 space-y-1">
                    {question.options.map((option: string, optIndex: number) => (
                      <p
                        key={optIndex}
                        className={`text-sm ${
                          option === question.correct_answer
                            ? "text-green-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                        {option === question.correct_answer && " ✓"}
                      </p>
                    ))}
                  </div>
                )}

                {question.question_type === "TRUE_FALSE" && (
                  <p className="ml-4 text-sm text-green-600 font-medium">
                    Correct Answer: {question.correct_answer}
                  </p>
                )}

                {question.question_type === "SHORT_ANSWER" && (
                  <p className="ml-4 text-sm text-gray-600">
                    Sample Answer: {question.correct_answer}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
