import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/common/ProtectedRoute';

import DashboardLayout from './components/layout/DashboardLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminDonorsPage from './pages/admin/AdminDonorsPage';
import AdminCampsPage from './pages/admin/AdminCampsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

import DonorDashboard from './pages/donor/DonorDashboard';
import DonorProfilePage from './pages/donor/DonorProfilePage';
import DonationHistoryPage from './pages/donor/DonationHistoryPage';
import DonorCampsPage from './pages/donor/DonorCampsPage';

import HospitalDashboard from './pages/hospital/HospitalDashboard';
import BloodRequestForm from './pages/hospital/BloodRequestForm';
import HospitalRequestsPage from './pages/hospital/HospitalRequestsPage';

import LandingPage from './pages/LandingPage';

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
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes Wrapper */}
          <Route element={<DashboardLayout />}>
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={['admin']}><AdminRequestsPage /></ProtectedRoute>} />
            <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['admin']}><AdminInventoryPage /></ProtectedRoute>} />
            <Route path="/admin/donors" element={<ProtectedRoute allowedRoles={['admin']}><AdminDonorsPage /></ProtectedRoute>} />
            <Route path="/admin/camps" element={<ProtectedRoute allowedRoles={['admin']}><AdminCampsPage /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReportsPage /></ProtectedRoute>} />

            {/* Donor Routes */}
            <Route path="/donor" element={<ProtectedRoute allowedRoles={['donor']}><DonorDashboard /></ProtectedRoute>} />
            <Route path="/donor/history" element={<ProtectedRoute allowedRoles={['donor']}><DonationHistoryPage /></ProtectedRoute>} />
            <Route path="/donor/camps" element={<ProtectedRoute allowedRoles={['donor']}><DonorCampsPage /></ProtectedRoute>} />
            <Route path="/donor/profile" element={<ProtectedRoute allowedRoles={['donor']}><DonorProfilePage /></ProtectedRoute>} />

            {/* Hospital Routes */}
            <Route path="/hospital" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalDashboard /></ProtectedRoute>} />
            <Route path="/hospital/request-blood" element={<ProtectedRoute allowedRoles={['hospital']}><BloodRequestForm /></ProtectedRoute>} />
            <Route path="/hospital/requests" element={<ProtectedRoute allowedRoles={['hospital']}><HospitalRequestsPage /></ProtectedRoute>} />

          </Route>

          {/* Fallback */}
          <Route path="*" element={<h1 style={{color: 'red', marginTop: '100px', textAlign: 'center'}}>DEBUG: Catch-All Route Hit! Path not recognized.</h1>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
