import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { studentService } from "@/services/api";
import type { Student } from "@/types";
import {
  ArrowLeft,
  Edit,
  Loader2,
  Mail,
  Phone,
  Calendar,
  School,
  Users,
  User,
  BookOpen
} from "lucide-react";
import { format } from "date-fns";

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
      console.error("Failed to fetch student:", error);
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
        <Button
          onClick={() => navigate("/dashboard/students")}
          className="mt-4"
        >
          Back to Students
        </Button>
      </div>
    );
  }

  const getGenderDisplay = (gender: string | null) => {
    if (!gender) return "-";
    return gender === "M" ? "Male" : gender === "F" ? "Female" : "Other";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        {/* First Row: Back button */}
        <div>
          <button
            onClick={() => navigate("/dashboard/students")}
            className="flex items-center text-blue-600 text-sm hover:underline w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Students
          </button>
        </div>

        {/* Second Row: Name + Edit button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          {/* Student Name */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-600">
              {student.user.name}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Update student details
            </p>
          </div>

          {/* Edit Button */}
          <div className="flex-shrink-0">
            <Button
              onClick={() => navigate(`/dashboard/students/${student.id}/edit`)}
              className="w-full sm:w-auto"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Student
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-600">
              Contact Information
            </CardTitle>
            <CardDescription>Student contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-saBlue/50" />
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-sm text-muted-foreground">
                  {student.user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-saBlue/50" />
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <p className="text-sm text-muted-foreground">
                  {student.user.phone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-600">
              Academic Information
            </CardTitle>
            <CardDescription>Class and board details</CardDescription>
          </CardHeader>

<CardContent className="space-y-4">
  {/* Class */}
  <div className="flex items-center space-x-3">
    <BookOpen className="h-5 w-5 text-saBlue/50" />
    <div>
      <p className="text-sm font-medium text-gray-600 mb-1">Class</p>
      {student.class ? (
        <span className="text-sm text-muted-foreground">
          {student.class.name}
        </span>
      ) : (
        <p className="text-sm text-muted-foreground">Not assigned</p>
      )}
    </div>
  </div>

  {/* Board */}
  <div className="flex items-center space-x-3">
    <Users className="h-5 w-5 text-saBlue/50" />
    <div>
      <p className="text-sm font-medium text-gray-600 mb-1">Board</p>
      {student.board ? (
        <span className="text-sm text-muted-foreground">
          {student.board.name}
        </span>
      ) : (
        <p className="text-sm text-muted-foreground">Not assigned</p>
      )}
    </div>
  </div>
</CardContent>

        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-600">
              Personal Information
            </CardTitle>
            <CardDescription>Personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-saBlue/50" />
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Gender</p>
                <p className="text-sm text-muted-foreground">
                  {getGenderDisplay(student.gender)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-saBlue/50" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Date of Birth
                </p>
                <p className="text-sm text-muted-foreground">
                  {student.date_of_birth
                    ? format(new Date(student.date_of_birth), "PPP")
                    : "-"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <School className="h-5 w-5 text-saBlue/50" />
              <div>
                <p className="text-sm font-medium text-gray-600">School</p>
                <p className="text-sm text-muted-foreground">
                  {student.school || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollment Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-gray-600">
              Enrollment Statistics
            </CardTitle>
            <CardDescription>Subject enrollment information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-saBlue/50" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Enrollments
                </p>
                <p className="text-medium text-muted-foreground">
                  {student._count?.enrollments || 0}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 text-gray-600 border-saBlue/50"
              onClick={() =>
                navigate(`/dashboard/enrollments?student_id=${student.id}`)
              }
            >
              View Enrollments
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-600">
            Account Timeline
          </CardTitle>
          <CardDescription>Important dates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Account Created
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {format(new Date(student.created_at), "PPP")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Last Updated</span>
            <span className="text-sm font-medium text-muted-foreground">
              {format(new Date(student.updated_at), "PPP")}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
