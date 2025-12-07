import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { teacherService, subjectService } from "@/services/api";
import type { Teacher, Subject } from "@/types";
import {
  ArrowLeft,
  Edit,
  Loader2,
  Mail,
  Phone,
  BookOpen,
  User,
  Plus,
  X,
  IndianRupee,
} from "lucide-react";
import { format } from "date-fns";

// Custom modals
import SuccessModal from "@/components/ui/successModal";
import DeleteConfirmationModal from "@/components/ui/deleteConfirmationModal";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TeacherDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Assign Subject Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [subjectListLoading, setSubjectListLoading] = useState(false);

  // Success + Delete modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteJunctionId, setDeleteJunctionId] = useState<number | null>(null);

  // Fetch teacher
  useEffect(() => {
    if (id) fetchTeacher(parseInt(id));
  }, [id]);

  const fetchTeacher = async (teacherId: number) => {
    setIsLoading(true);
    try {
      const response = await teacherService.getById(teacherId);
      setTeacher(response.data);
    } catch (error) {
      console.error("Failed to fetch teacher:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ============= ASSIGN SUBJECT MODAL LOGIC ==================

  const openAssignModal = async () => {
    setShowAssignModal(true);
    setAssignError("");
    setSelectedSubject("");

    setSubjectListLoading(true);
    try {
      const res = await subjectService.getAll({ limit: 100 });
      setSubjects(res.data.data);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
    } finally {
      setSubjectListLoading(false);
    }
  };

  const handleAssignSubject = async () => {
    if (!selectedSubject) {
      setAssignError("Please select a subject");
      return;
    }

    setAssignLoading(true);
    setAssignError("");

    try {
      await teacherService.assignSubject({
        teacher_id: teacher!.id,
        subject_id: parseInt(selectedSubject),
      });

      setShowAssignModal(false);
      fetchTeacher(teacher!.id);
      setShowSuccessModal(true);
    } catch (err: any) {
      setAssignError(err.response?.data?.message || "Failed to assign subject");
    } finally {
      setAssignLoading(false);
    }
  };

  // ================= DELETE SUBJECT LOGIC ==================

  const handleRemoveSubject = async () => {
    if (!deleteJunctionId) return;

    try {
      await teacherService.removeSubject(deleteJunctionId);
      setShowDeleteModal(false);
      fetchTeacher(teacher!.id);
    } catch (err) {
      console.error("Failed to remove subject:", err);
    }
  };

  const getGenderDisplay = (g: string | null) =>
    !g ? "-" : g === "M" ? "Male" : g === "F" ? "Female" : "Other";

  const formatSalary = (salary: number | null) =>
    salary
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "INR",
        }).format(salary)
      : "-";

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  if (!teacher)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Teacher not found</h1>
        <Button onClick={() => navigate("/dashboard/teachers")}>
          Back to Teachers
        </Button>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col space-y-4">
        <button
          onClick={() => navigate("/dashboard/teachers")}
          className="flex items-center text-blue-600 text-sm hover:underline w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Teachers
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-600">{teacher.user.name}</h1>
            <p className="text-muted-foreground mt-1">Update teacher details</p>
          </div>

          <Button
            onClick={() => navigate(`/dashboard/teachers/${teacher.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Teacher
          </Button>
        </div>
      </div>

      {/* --- INFO CARDS --- */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-600">Contact Info</CardTitle>
            <CardDescription>Teacher contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-saBlue/50" />
              <div>
                <p className="font-medium text-gray-600">Email</p>
                <p className="text-muted-foreground">{teacher.user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-saBlue/50" />
              <div>
                <p className="font-medium text-gray-600">Phone</p>
                <p className="text-muted-foreground">{teacher.user.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-600">Professional Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-saBlue/50" />
              <div>
                <p className="font-medium">Qualification</p>
                <p className="text-muted-foreground">{teacher.qualification || "-"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-saBlue/50" />
              <div>
                <p className="font-medium">Experience</p>
                <p className="text-muted-foreground">{teacher.experience || "-"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-saBlue/50" />
              <div>
                <p className="font-medium">Gender</p>
                <p className="text-muted-foreground">{getGenderDisplay(teacher.gender)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-600">Salary Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <IndianRupee className="h-5 w-5 text-saBlue/50" />
              <div>
                <p className="font-medium">Monthly Salary</p>
                <p className="text-muted-foreground">{formatSalary(teacher.salary)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-600">Account Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Created</span>
              <span>{format(new Date(teacher.created_at), "PPP")}</span>
            </div>

            <div className="flex justify-between">
              <span>Last Updated</span>
              <span>{format(new Date(teacher.updated_at), "PPP")}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Subjects */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-gray-600">Assigned Subjects</CardTitle>
              <CardDescription>
                {teacher.teacher_subject_junctions?.length || 0} subjects assigned
              </CardDescription>
            </div>
            <Button size="sm" onClick={openAssignModal}>
              <Plus className="mr-2 h-4 w-4" />
              Assign Subject
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {teacher.teacher_subject_junctions?.length ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {teacher.teacher_subject_junctions.map((j) => (
                <Card key={j.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{j.subject.name}</p>
                          {j.subject.class && (
                            <Badge variant="outline">{j.subject.class.name}</Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeleteJunctionId(j.id);
                          setShowDeleteModal(true);
                        }}
                        className="text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4" />
              No subjects assigned.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ASSIGN SUBJECT – CUSTOM MODAL */}
      {showAssignModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <h2 className="text-xl font-semibold text-gray-800">Assign Subject</h2>
            <p className="text-sm text-gray-500 mt-1">
              Select a subject to assign to this teacher.
            </p>

            {/* Error */}
            {assignError && (
              <div className="bg-red-100 text-red-600 text-sm p-3 rounded-md mt-3">
                {assignError}
              </div>
            )}

            {/* Subject Selection */}
            <div className="mt-5">
              <Label className="font-medium">Subject</Label>

              {subjectListLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                  disabled={assignLoading}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>
                        {sub.name} {sub.class ? `(${sub.class.name})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAssignModal(false)}
                disabled={assignLoading}
              >
                Cancel
              </Button>

              <Button onClick={handleAssignSubject} disabled={assignLoading}>
                {assignLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Subject"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        title="Subject Assigned!"
        description="The subject has been successfully assigned to this teacher."
        okText="OK"
        onConfirm={() => setShowSuccessModal(false)}
        showButtons={true}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteModal}
        title="Remove Subject?"
        message="Are you sure you want to remove this subject from the teacher?"
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleRemoveSubject}
        onCancel={() => setShowDeleteModal(false)}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
