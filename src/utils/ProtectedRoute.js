import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute component that restricts access based on user roles
 * and handles authentication states.
 */
const ProtectedRoute = ({ allowedRoles, role, isLoading = false, isAuthenticated = false }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect based on role
    switch (role) {
      case 'student':
        return <Navigate to="/student/dashboard" replace />;
      case 'teacher':
        return <Navigate to="/teacher/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;