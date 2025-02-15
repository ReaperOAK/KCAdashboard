import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
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

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#f3f1f9]">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<DashboardRedirect />} />

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

            {/* Admin Routes */}
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
