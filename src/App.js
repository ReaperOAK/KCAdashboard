import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import TopNavbar from './components/TopNavbar';
import Sidebar from './components/Sidebar';
import Breadcrumbs from './components/Breadcrumbs';
import Profile from './pages/Profile';
import PGNViewer from './pages/PGNViewer';
import NotificationPreferences from './pages/notifications/NotificationPreferences';

import adminRoutes from './routes/adminRoutes';
import teacherRoutes from './routes/teacherRoutes';
import studentRoutes from './routes/studentRoutes';

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
  const publicRoutes = ['/login', '/register', '/reset-password'];
  const location = useLocation();

  // Effect to handle route changes
  useEffect(() => {
    // Close sidebar on mobile when route changes
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const renderRoutes = (routes, allowedRoles) => {
    return routes.map(route => (
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
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[#f3f1f9]">
      {user && !publicRoutes.includes(window.location.pathname) && (
        <>
          <TopNavbar toggleSidebar={toggleSidebar} />
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          <div 
            className={`transition-all duration-300 pt-16 ${
              isSidebarOpen 
                ? 'ml-0 md:ml-64' 
                : 'ml-0'
            } lg:ml-64`}
          >
            {!window.location.pathname.startsWith('/pgn-viewer') && (
              <div className="p-8">
                <Breadcrumbs />
              </div>
            )}
            <Routes>
              {/* Common Routes */}
              <Route path="/" element={<DashboardRedirect />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Add Notification Preferences Route */}
              <Route 
                path="/notifications/preferences" 
                element={
                  <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                    <NotificationPreferences />
                  </ProtectedRoute>
                } 
              />
              
              {/* PGN Viewer Standalone Route */}
              <Route 
                path="/pgn-viewer/:id" 
                element={
                  <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                    <PGNViewer />
                  </ProtectedRoute>
                }
              />

              {/* Role-based Routes */}
              {renderRoutes(adminRoutes, ['admin'])}
              {renderRoutes(teacherRoutes, ['teacher'])}
              {renderRoutes(studentRoutes, ['student'])}
            </Routes>
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
