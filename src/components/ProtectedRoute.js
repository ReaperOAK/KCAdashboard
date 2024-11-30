import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles, role }) => {
  // Check if the user's role is included in the allowed roles
  if (allowedRoles.includes(role)) {
    return <Outlet />;
  } else {
    // Redirect to the login page if the user's role is not allowed
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;