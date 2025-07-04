import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import TopNavbar from './components/TopNavbar';
import Sidebar from './components/Sidebar';
import Breadcrumbs from './components/Breadcrumbs';
import Profile from './pages/Profile';
import NotificationPreferences from './pages/notifications/NotificationPreferences';
import { adminRoutes } from './routes/adminRoutes';
import { teacherRoutes } from './routes/teacherRoutes';
import { studentRoutes } from './routes/studentRoutes';
import chessRoutes from './routes/chessRoutes';



function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}


const DASHBOARD_ROUTES = {
  student: '/student-dashboard',
  teacher: '/teacher-dashboard',
  admin: '/admin-dashboard',
};

const DashboardRedirect = React.memo(function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={DASHBOARD_ROUTES[user.role]} />;
});



const PUBLIC_ROUTES = ['/login', '/register', '/reset-password'];

const renderProtectedRoutes = (routes, allowedRoles) =>
  routes.map(route => (
    <Route
      key={route.path}
      path={route.path}
      element={
        <ProtectedRoute allowedRoles={allowedRoles}>
          <route.element />
        </ProtectedRoute>
      }
    />
  ));

const AppContent = React.memo(function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Only close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Accessibility: main content area has role and tabIndex
  return (
    <div className="min-h-screen bg-background-light">
      {user && !PUBLIC_ROUTES.includes(window.location.pathname) ? (
        <>
          <TopNavbar toggleSidebar={handleToggleSidebar} />
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={handleToggleSidebar} />
          <main
            className={
              [
                'transition-all duration-300 pt-16',
                'lg:ml-64',
                isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0',
                'min-h-[calc(100vh-4rem)]', // 4rem = 64px navbar
                'overflow-x-auto',
              ].join(' ')
            }
            role="main"
            tabIndex={-1}
          >
            <div className="px-2 py-4 sm:px-4 md:px-6 lg:px-8">
              <Breadcrumbs />
            </div>
            <Routes>
              <Route path="/" element={<DashboardRedirect />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications/preferences"
                element={
                  <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                    <NotificationPreferences />
                  </ProtectedRoute>
                }
              />
              {renderProtectedRoutes(adminRoutes, ['admin', 'teacher', 'student'])}
              {renderProtectedRoutes(teacherRoutes, ['teacher', 'admin', 'student'])}
              {renderProtectedRoutes(studentRoutes, ['student', 'admin', 'teacher'])}
              {renderProtectedRoutes(chessRoutes, ['student', 'teacher', 'admin'])}
            </Routes>
          </main>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/" element={<DashboardRedirect />} />
        </Routes>
      )}
    </div>
  );
});


const App = React.memo(function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
});

export default App;
