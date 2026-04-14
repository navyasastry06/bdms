import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/common/ProtectedRoute';

/* Temporary Placeholders for Dashboards (will build these fully next) */
const AdminDashboard = () => <div style={{padding:'50px', textAlign:'center'}}><h1>Admin Dashboard</h1><p>Welcome, Admin!</p></div>;
const DonorDashboard = () => <div style={{padding:'50px', textAlign:'center'}}><h1>Donor Dashboard</h1><p>Welcome, Donor!</p></div>;
const HospitalDashboard = () => <div style={{padding:'50px', textAlign:'center'}}><h1>Hospital Dashboard</h1><p>Welcome, Hospital!</p></div>;

const Unauthorized = () => (
  <div style={{padding:'50px', textAlign:'center', color:'var(--primary-red)'}}>
    <h1>403 - Unauthorized</h1>
    <p>You do not have permission to view this page.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin/*" 
            element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} 
          />

          {/* Protected Donor Routes */}
          <Route 
            path="/donor/*" 
            element={<ProtectedRoute allowedRoles={['donor']}><DonorDashboard /></ProtectedRoute>} 
          />

          {/* Protected Hospital Routes */}
          <Route 
            path="/hospital/*" 
            element={<ProtectedRoute allowedRoles={['hospital']}><HospitalDashboard /></ProtectedRoute>} 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
