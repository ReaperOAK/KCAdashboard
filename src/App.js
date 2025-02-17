import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClassroomPage from './pages/student/ClassroomPage';
import ClassroomDetails from './pages/student/ClassroomDetails';
import ResourceCenter from './pages/student/ResourceCenter';
import QuizPage from './pages/student/QuizPage';
import TournamentsPage from './pages/student/TournamentsPage';
import BatchManagement from './pages/teacher/BatchManagement';
import ReportsAnalytics from './pages/teacher/ReportsAnalytics';
import GradingFeedback from './pages/teacher/GradingFeedback';
import PGNDatabase from './pages/teacher/PGNDatabase';
import ClassroomManagement from './pages/teacher/ClassroomManagement';
import UserManagement from './pages/admin/UserManagement';
import AttendanceSystem from './pages/admin/AttendanceSystem';
import PlatformAnalytics from './pages/admin/PlatformAnalytics';
import SupportSystem from './pages/admin/SupportSystem';
import TopNavbar from './components/TopNavbar';
import Sidebar from './components/Sidebar';
import Breadcrumbs from './components/Breadcrumbs';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  const dashboardRoutes = {
    student: '/student-dashboard',
    teacher: '/teacher-dashboard',
    admin: '/admin-dashboard'
  };
  
  return <Navigate to={dashboardRoutes[user.role]} />;
};

const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const publicRoutes = ['/login', '/register', '/reset-password'];

  return (
    <div className="min-h-screen bg-[#f3f1f9]">
      {user && !publicRoutes.includes(window.location.pathname) && (
        <>
          <TopNavbar toggleSidebar={toggleSidebar} />
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <div className="lg:ml-64 pt-16">
            <div className="p-8">
              <Breadcrumbs />
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<DashboardRedirect />} />

                {/* Common Protected Routes */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />

                {/* Protected Routes */}
                {/* Student Routes */}
                <Route 
                  path="/student-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student/classes" 
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <ClassroomPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student/classes/:id" 
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <ClassroomDetails />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student/resources" 
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <ResourceCenter />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student/quiz" 
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <QuizPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student/tournaments" 
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <TournamentsPage />
                    </ProtectedRoute>
                  } 
                />

                {/* Teacher Routes */}
                <Route 
                  path="/teacher-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <TeacherDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/teacher/batches" 
                  element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <BatchManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/teacher/analytics" 
                  element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <ReportsAnalytics />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/teacher/grading" 
                  element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <GradingFeedback />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/teacher/pgn" 
                  element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <PGNDatabase />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/teacher/classroom" 
                  element={
                    <ProtectedRoute allowedRoles={['teacher']}>
                      <ClassroomManagement />
                    </ProtectedRoute>
                  } 
                />

                {/* Admin Routes */}
                <Route 
                  path="/admin-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/users" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UserManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/attendance" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AttendanceSystem />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/analytics" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <PlatformAnalytics />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/support" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <SupportSystem />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </div>
          </div>
        </>
      )}
      {(!user || publicRoutes.includes(window.location.pathname)) && (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={<DashboardRedirect />} />
        </Routes>
      )}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
