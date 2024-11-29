import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, allowedRoles, role }) => {
  return allowedRoles.includes(role) ? (
    <Component />
  ) : (
    <Navigate to="/" replace />
  );
};

export default ProtectedRoute;