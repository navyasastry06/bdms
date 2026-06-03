import React, { useState, useEffect } from 'react';
import patientService from '../../services/patientService';
import { FileText, Clock, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const PatientDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      setError('');
      const data = await patientService.getRequests();
      if (data.success) {
        setRequests(data.requests || []);
      } else {
        setError(data.message || 'Failed to load blood requests.');
      }
    } catch (err) {
      console.error('Fetch patient requests error:', err);
      setError(err.response?.data?.message || 'Error connecting to the server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getUrgencyBadge = (urgency) => {
    let color = '#3b82f6';
    let bg = 'rgba(59, 130, 246, 0.1)';
    if (urgency === 'Critical') {
      color = '#e11d48';
      bg = 'rgba(225, 29, 72, 0.1)';
    } else if (urgency === 'Urgent') {
      color = '#ea580c';
      bg = 'rgba(234, 88, 12, 0.1)';
    }
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '700',
        color,
        backgroundColor: bg,
        display: 'inline-block'
      }}>
        {urgency}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    let color = '#f59e0b';
    let bg = 'rgba(245, 158, 11, 0.1)';
    let icon = <Clock size={14} />;
    
    if (status === 'Approved') {
      color = '#059669';
      bg = 'rgba(5, 150, 105, 0.1)';
      icon = <CheckCircle size={14} />;
    } else if (status === 'Fulfilled') {
      color = '#10b981';
      bg = 'rgba(16, 185, 129, 0.15)';
      icon = <CheckCircle size={14} />;
    } else if (status === 'Rejected') {
      color = '#dc2626';
      bg = 'rgba(220, 38, 38, 0.1)';
      icon = <XCircle size={14} />;
    }

    return (
      <span style={{
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
        color,
        backgroundColor: bg,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {icon}
        {status}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '30px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)',
        border: '1px solid var(--border-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', margin: 0, fontWeight: '700' }}>Patient Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0 0', fontSize: '0.95rem' }}>
            Track and monitor the status of blood requests created on your behalf by hospitals.
          </p>
        </div>
        <button 
          onClick={() => fetchRequests(true)} 
          disabled={loading || refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '12px',
            backgroundColor: 'white',
            border: '1px solid var(--border-light)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: 'var(--text-main)',
            boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
          }}
          className="hover-scale"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          color: '#dc2626',
          border: '1px solid rgba(220, 38, 38, 0.2)',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <p style={{ color: 'var(--primary-red)', fontWeight: 'bold', fontSize: '1.1rem' }}>Loading request queue...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-panel" style={{
          padding: '60px 20px',
          textAlign: 'center',
          borderRadius: '16px',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <FileText size={64} color="var(--text-muted)" style={{ opacity: 0.5 }} />
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>No blood requests found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
            There are currently no active or past blood requests matching your registered phone number. Requests created by hospitals using your contact number will automatically appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {requests.map((req) => (
            <div 
              key={req._id} 
              className="glass-panel" 
              style={{
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'all 0.2s'
              }}
            >
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: '700' }}>
                    Request for {req.patientName}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', fontSize: '0.85rem' }}>
                    Submitted by: <strong style={{ color: 'var(--text-main)' }}>{req.hospitalName}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {getUrgencyBadge(req.urgency)}
                  {getStatusBadge(req.status)}
                </div>
              </div>

              {/* Grid details */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '16px',
                padding: '16px 0',
                borderTop: '1px solid var(--border-light)',
                borderBottom: '1px solid var(--border-light)'
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Blood Group</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-red)' }}>{req.bloodGroup}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Units Needed</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>{req.unitsRequired} Units</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Number</span>
                  <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' }}>{req.contactNumber}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Request Date</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-main)' }}>
                    {new Date(req.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Reason / Admin Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {req.reason && (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <strong>Reason:</strong> {req.reason}
                  </p>
                )}
                {req.notes && (
                  <div style={{ 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    backgroundColor: 'var(--bg-main)', 
                    borderLeft: '4px solid var(--primary-red)', 
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)' 
                  }}>
                    <strong>Admin Note:</strong> {req.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
