import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardPage from '@/pages/DashboardPage';

// Student imports
import StudentsPage from '@/pages/students/StudentsPage';
import CreateStudentPage from '@/pages/students/CreateStudentPage';
import EditStudentPage from '@/pages/students/EditStudentPage';
import StudentDetailPage from '@/pages/students/StudentDetailPage';

// Teacher imports
import TeachersPage from '@/pages/teachers/TeachersPage';
import CreateTeacherPage from '@/pages/teachers/CreateTeacherPage';
import EditTeacherPage from '@/pages/teachers/EditTeacherPage';
import TeacherDetailPage from '@/pages/teachers/TeacherDetailPage';

// Subject imports
import SubjectsPage from '@/pages/subjects/SubjectsPage';
import CreateSubjectPage from '@/pages/subjects/CreateSubjectPage';
import EditSubjectPage from '@/pages/subjects/EditSubjectPage';
import SubjectDetailPage from '@/pages/subjects/SubjectDetailPage';

// Enrollment imports
import EnrollmentsPage from '@/pages/enrollments/EnrollmentsPage';
import CreateEnrollmentPage from '@/pages/enrollments/CreateEnrollmentPage';
import BulkEnrollmentPage from '@/pages/enrollments/BulkEnrollmentPage';
import EnrollmentDetailPage from '@/pages/enrollments/EnrollmentDetailPage';

// Board imports
import BoardsPage from '@/pages/boards/BoardsPage';
import CreateBoardPage from '@/pages/boards/CreateBoardPage';

// Class imports
import ClassesPage from '@/pages/classes/ClassesPage';
import CreateClassPage from '@/pages/classes/CreateClassPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Public Route Component (redirects to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          
          {/* Student Routes */}
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/new" element={<CreateStudentPage />} />
          <Route path="students/:id" element={<StudentDetailPage />} />
          <Route path="students/:id/edit" element={<EditStudentPage />} />
          
          {/* Teacher Routes */}
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="teachers/new" element={<CreateTeacherPage />} />
          <Route path="teachers/:id" element={<TeacherDetailPage />} />
          <Route path="teachers/:id/edit" element={<EditTeacherPage />} />
          
          {/* Subject Routes */}
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="subjects/new" element={<CreateSubjectPage />} />
          <Route path="subjects/:id" element={<SubjectDetailPage />} />
          <Route path="subjects/:id/edit" element={<EditSubjectPage />} />
          
          {/* Enrollment Routes */}
          <Route path="enrollments" element={<EnrollmentsPage />} />
          <Route path="enrollments/new" element={<CreateEnrollmentPage />} />
          <Route path="enrollments/bulk" element={<BulkEnrollmentPage />} />
          <Route path="enrollments/:id" element={<EnrollmentDetailPage />} />
          
          {/* Board Routes */}
          <Route path="boards" element={<BoardsPage />} />
          <Route path="boards/new" element={<CreateBoardPage />} />
          
          {/* Class Routes */}
          <Route path="classes" element={<ClassesPage />} />
          <Route path="classes/new" element={<CreateClassPage />} />
          
          <Route path="profile" element={<div>Profile Page - Coming Soon</div>} />
          <Route path="settings" element={<div>Settings Page - Coming Soon</div>} />
        </Route>

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 Not Found */}
        <Route path="*" element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold">404</h1>
              <p className="text-muted-foreground mt-2">Page not found</p>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;