import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8f9fa' }}>
        <p style={{ color: '#dc2626', fontSize: '1.2rem', fontWeight: 'bold' }}>Loading BDMS...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    /* Redirect to login and save the location they were trying to go to */
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    /* User is logged in but doesn't have the right role */
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
