import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoute component that restricts access based on user roles.
 * @param {Object} props - Component props.
 * @param {Array<string>} props.allowedRoles - Array of roles allowed to access the route.
 * @param {string|null} props.role - The role of the current user. Null if not yet determined.
 * @param {boolean} [props.isLoading=false] - Whether the role information is still loading.
 */
const ProtectedRoute = ({ allowedRoles, role, isLoading = false }) => {
  // Show a loading indicator if role data is still being fetched
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check if the user's role is included in the allowed roles
  if (allowedRoles.includes(role)) {
    return <Outlet />;
  } else {
    // Redirect to an unauthorized page or login if role is not allowed
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;