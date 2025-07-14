import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import TopNavbar from './components/TopNavbar';
import Sidebar from './components/Sidebar';
import Breadcrumbs from './components/Breadcrumbs';
import { adminRoutes } from './routes/adminRoutes';
import { teacherRoutes } from './routes/teacherRoutes';
import { studentRoutes } from './routes/studentRoutes';
import chessRoutes from './routes/chessRoutes';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const Profile = lazy(() => import('./pages/Profile'));
const UploadsViewerPage = lazy(() => import('./pages/common/UploadsViewerPage'));
const NotificationPreferences = lazy(() => import('./pages/notifications/NotificationPreferences'));



function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-2xl text-primary font-semibold mb-2">Access Denied</h2>
      <p className="text-gray-light mb-4">You do not have permission to view this page.</p>
      <a href="/" className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary transition-colors">Go Home</a>
    </div>
  );
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
  return <Navigate to={DASHBOARD_ROUTES[user.role]} replace />;
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
  const [loading, setLoading] = useState(false);

  // Only close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  }, [location.pathname]);

  // Show loading spinner on route change
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Accessibility: main content area has role and tabIndex
  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {user && !PUBLIC_ROUTES.includes(window.location.pathname) ? (
        <>
          <TopNavbar toggleSidebar={handleToggleSidebar} />
          <div className="flex flex-1">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={handleToggleSidebar} />
            <main
              className={[
                'transition-all duration-300 w-full',
                'lg:ml-64',
                isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0',
                'min-h-[calc(100vh-4rem)]',
                'overflow-x-auto',
              ].join(' ')}
              role="main"
              tabIndex={-1}
            >
              <div className="px-2 py-4 sm:px-4 md:px-6 lg:px-8">
                <Breadcrumbs />
              </div>
              <Suspense fallback={<div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div></div>}>
                {loading && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 pointer-events-none">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-accent"></div>
                  </div>
                )}
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
                  {renderProtectedRoutes(adminRoutes, ['admin'])}
                  {renderProtectedRoutes(teacherRoutes, ['teacher'])}
                  {renderProtectedRoutes(studentRoutes, ['student'])}
                  {renderProtectedRoutes(chessRoutes, ['student', 'teacher', 'admin'])}
                  <Route
                    path="/uploads/view/:resourceId"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                        <UploadsViewerPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </main>
          </div>
        </>
      ) : (
        <div className="flex flex-col min-h-screen justify-center items-center bg-background-light">
          <Suspense fallback={<div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div></div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/" element={<DashboardRedirect />} />
            </Routes>
          </Suspense>
        </div>
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
