import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import TopNavbar from './components/TopNavbar';
import Sidebar from './components/Sidebar';
import Breadcrumbs from './components/Breadcrumbs';

// Lazy load components to reduce initial bundle size
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const PGNViewer = lazy(() => import('./pages/PGNViewer'));
const NotificationPreferences = lazy(() => import('./pages/notifications/NotificationPreferences'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
  </div>
);

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
  const [routes, setRoutes] = useState({
    admin: [],
    teacher: [],
    student: [],
    chess: []
  });
  const { user } = useAuth();
  const publicRoutes = ['/login', '/register', '/reset-password'];
  const location = useLocation();

  // Load routes dynamically
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const [adminR, teacherR, studentR, chessR] = await Promise.all([
          import('./routes/adminRoutes').then(module => module.default),
          import('./routes/teacherRoutes').then(module => module.default),
          import('./routes/studentRoutes').then(module => module.default),
          import('./routes/chessRoutes').then(module => module.default)
        ]);
        
        setRoutes({
          admin: adminR,
          teacher: teacherR,
          student: studentR,
          chess: chessR
        });
      } catch (error) {
        console.error('Failed to load routes:', error);
      }
    };
    
    loadRoutes();
  }, []);

  // Effect to handle route changes
  useEffect(() => {
    // Close sidebar on mobile when route changes
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const renderRoutes = (routes, allowedRoles) => {
    return routes.map(route => (
      <Route
        key={route.path}
        path={route.path}
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <Suspense fallback={<LoadingFallback />}>
              <route.element />
            </Suspense>
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
            <Suspense fallback={<LoadingFallback />}>
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
                {renderRoutes(routes.admin, ['admin'])}
                {renderRoutes(routes.teacher, ['teacher'])}
                {renderRoutes(routes.student, ['student'])}
                
                {/* Chess Routes - available to all user roles */}
                {renderRoutes(routes.chess, ['student', 'teacher', 'admin'])}
              </Routes>
            </Suspense>
          </div>
        </>
      )}
      {(!user || publicRoutes.includes(window.location.pathname)) && (
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<DashboardRedirect />} />
          </Routes>
        </Suspense>
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
