import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, allowedRoles, role, ...rest }) => {
  return (
    <Route
      {...rest}
      element={
        allowedRoles.includes(role) ? (
          <Component />
        ) : (
          <Navigate to="/" replace />
        )
      }
    />
  );
};

export default ProtectedRoute;