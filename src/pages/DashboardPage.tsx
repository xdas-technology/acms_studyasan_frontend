import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  Users,
  BookOpen,
  UserCheck,
  GraduationCap,
  Plus,
} from "lucide-react";
import {
  studentService,
  teacherService,
  subjectService,
  enrollmentService,
} from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import StatsCard from "@/components/dashboard/StatsCard";

interface ActivityItem {
  id: number;
  user: string;
  action: string;
  time: Date;
  type: "enrollment" | "subject" | "student" | "teacher";
}

// Mock data - replace with real data from API
const mockActivities: ActivityItem[] = [
  {
    id: 1,
    user: "John Doe",
    action: "enrolled in Mathematics",
    time: new Date(Date.now() - 1000 * 60 * 5),
    type: "enrollment",
  },
  {
    id: 2,
    user: "Jane Smith",
    action: "created new subject Physics",
    time: new Date(Date.now() - 1000 * 60 * 15),
    type: "subject",
  },
  {
    id: 3,
    user: "Admin",
    action: "added new student Mike Johnson",
    time: new Date(Date.now() - 1000 * 60 * 30),
    type: "student",
  },
];

function RecentActivity() {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "enrollment":
        return "bg-blue-500";
      case "subject":
        return "bg-green-500";
      case "student":
        return "bg-purple-500";
      case "teacher":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
        <CardDescription>Latest activities in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className={`${getActivityColor(
                    activity.type
                  )} text-white text-xs`}
                >
                  {getInitials(activity.user)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="text-muted-foreground">
                    {activity.action}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.time, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    subjects: 0,
    enrollments: 0,
  });
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN";
  const isTeacher = user?.role === "TEACHER";
  const isStudent = user?.role === "STUDENT";

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch counts based on user role
      const [studentsRes, teachersRes, subjectsRes, enrollmentsRes] =
        await Promise.all([
          studentService.getAll({ limit: 1 }),
          teacherService.getAll({ limit: 1 }),
          subjectService.getAll({
            limit: 1,
            ...(isTeacher && { teacher_id: user?.id }),
            ...(isStudent && { student_id: user?.id }),
          }),
          enrollmentService.getAll({
            limit: 1,
            ...(isStudent && { student_id: user?.id }),
          }),
        ]);

      setStats({
        students: studentsRes.data.pagination.total || 0,
        teachers: teachersRes.data.pagination.total || 0,
        subjects: subjectsRes.data.pagination.total || 0,
        enrollments: enrollmentsRes.data.pagination.total || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "Total Students",
      value: loading ? "..." : stats.students.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      link: "/students",
      show: true,
    },
    {
      title: "Total Teachers",
      value: loading ? "..." : stats.teachers.toString(),
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-100",
      link: "/teachers",
      show: isAdmin,
    },
    {
      title: "Total Subjects",
      value: loading ? "..." : stats.subjects.toString(),
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      link: "/subjects",
      show: true,
    },
    {
      title: "Total Enrollments",
      value: loading ? "..." : stats.enrollments.toString(),
      icon: UserCheck,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      link: "/enrollments",
      show: true,
    },
  ].filter((card) => card.show);

  return (
    <div className="space-y-6">
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-2">
  <div>
    <h1 className="text-2xl sm:text-3xl font-bold text-gray-600">
      Dashboard
    </h1>
    <p className="text-gray-400 mt-1 text-sm sm:text-base">
      Welcome back, {user?.name}!
    </p>
  </div>

  {isAdmin && (
    <div className="flex flex-wrap gap-2 w-full md:w-auto">
      <Link to="/students/new" className="flex-1 md:flex-none">
        <Button
          variant="outline"
          className="border border-saBlue w-full md:w-auto justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </Link>
      <Link to="/dashboard/enrollments/new" className="flex-1 md:flex-none">
        <Button className="w-full md:w-auto justify-center">
          <UserCheck className="h-4 w-4 mr-2" />
          New Enrollment
        </Button>
      </Link>
    </div>
  )}
</div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <Link key={index} to="#">
            <StatsCard title={card.title} value={card.value} icon={card.icon} />
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isAdmin && (
                <>
                  <Link to="/students/new">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Add New Student
                    </Button>
                  </Link>
                  <Link to="/teachers/new">
                    <Button variant="outline" className="w-full justify-start">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Add New Teacher
                    </Button>
                  </Link>
                  <Link to="/subjects/new">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Create New Subject
                    </Button>
                  </Link>
                </>
              )}
              <Link to="/dashboard/enrollments">
                <Button variant="outline" className="w-full justify-start">
                  <UserCheck className="h-4 w-4 mr-2" />
                  View Enrollments
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/dashboard/enrollments/bulk">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Bulk Enrollment
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
