import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute component that restricts access based on user roles.
 * @param {Object} props - Component props.
 * @param {Array<string>} props.allowedRoles - Array of roles allowed to access the route.
 * @param {string} props.role - The role of the current user.
 */
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