import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user, activeRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8f9fa' }}>
        <p style={{ color: '#dc2626', fontSize: '1.2rem', fontWeight: 'bold' }}>Loading BDMS...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isVerified) {
    return <Navigate to={`/otp-verify?email=${encodeURIComponent(user.email)}`} replace />;
  }

  /* Dual-role users must choose a portal before accessing any dashboard */
  if (user.isDualRole && !activeRole && location.pathname !== '/choose-portal') {
    return <Navigate to="/choose-portal" replace />;
  }

  /* Determine the effective role for this session */
  const effectiveRole = user.isDualRole ? (activeRole || user.role) : user.role;

  /* Dual-role: donor paths require activeRole = 'donor' */
  if (user.isDualRole && location.pathname.startsWith('/donor') && effectiveRole !== 'donor') {
    return <Navigate to="/hospital" replace />;
  }

  /* Dual-role: hospital paths require activeRole = 'hospital' */
  if (user.isDualRole && location.pathname.startsWith('/hospital') && effectiveRole !== 'hospital') {
    return <Navigate to="/donor" replace />;
  }

  /* Standard role check for single-role users */
  if (!user.isDualRole && allowedRoles && !allowedRoles.includes(effectiveRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
