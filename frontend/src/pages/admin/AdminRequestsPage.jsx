import React, { useState, useEffect } from 'react';
import { Check, X, CheckSquare, Clock, Filter, AlertTriangle } from 'lucide-react';
import adminService from '../../services/adminService';

const AdminRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [notesInputs, setNotesInputs] = useState({}); // maps reqId -> note content
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await adminService.getRequests();
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    setActionLoading(id);
    const note = notesInputs[id] || '';
    try {
      const res = await adminService.updateRequestStatus(id, { status, notes: note });
      if (res.success) {
        alert(`Request status updated to ${status}!`);
        await fetchRequests();
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to update request.';
      alert(errMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleNoteChange = (id, value) => {
    setNotesInputs(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const filteredRequests = requests.filter(req => {
    if (filterStatus === 'All') return true;
    return req.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return { border: '1px solid #f59e0b', bg: '#fef3c7', text: '#d97706' };
      case 'Approved': return { border: '1px solid #3b82f6', bg: '#dbeafe', text: '#2563eb' };
      case 'Fulfilled': return { border: '1px solid #10b981', bg: '#d1fae5', text: '#059669' };
      case 'Rejected': return { border: '1px solid #e11d48', bg: '#ffe4e6', text: '#e11d48' };
      default: return {};
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading requests...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: 'var(--text-main)', fontSize: '1.75rem', marginBottom: '8px' }}>Manage Blood Requests</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review and approve emergency requests from hospitals and patients.</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Pending', 'Approved', 'Fulfilled', 'Rejected', 'All'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className="glass-panel"
              style={{
                padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600',
                border: filterStatus === status ? '1.5px solid var(--primary-red)' : '1px solid var(--border-light)',
                backgroundColor: filterStatus === status ? 'var(--secondary-red)' : 'white',
                color: filterStatus === status ? 'var(--primary-red)' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Clock size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
          <h3>No requests in "{filterStatus}" list</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredRequests.map((req, idx) => {
            const config = getStatusColor(req.status);
            return (
              <div key={idx} className="glass-panel hover-red-outline" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{req.patientName}</h3>
                      <span style={{
                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
                        backgroundColor: req.urgency === 'Critical' ? '#ffe4e6' : '#fffbeb',
                        color: req.urgency === 'Critical' ? '#e11d48' : '#d97706',
                        border: req.urgency === 'Critical' ? '1px solid #fda4af' : '1px solid #fde68a'
                      }}>
                        {req.urgency} Urgency
                      </span>
                      <span style={{
                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
                        ...config
                      }}>
                        {req.status}
                      </span>
                    </div>

                    <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Requested by: <strong>{req.hospitalName}</strong> ({req.contactNumber})
                    </p>
                    {req.reason && (
                      <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Reason: "{req.reason}"
                      </p>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-red)' }}>
                      {req.bloodGroup}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Requested: {req.unitsRequired} Units
                    </div>
                  </div>

                </div>

                {/* Operations & Comments panel */}
                <div style={{
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  {req.status === 'Pending' || req.status === 'Approved' ? (
                    <div style={{ flex: 1, display: 'flex', gap: '16px', alignItems: 'center', minWidth: '300px' }}>
                      <input 
                        type="text" 
                        placeholder="Admin notes/comments (optional)..."
                        value={notesInputs[req._id] || ''}
                        onChange={(e) => handleNoteChange(req._id, e.target.value)}
                        className="input-base"
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      />
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong>Comments:</strong> {req.notes || 'None'}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {req.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(req._id, 'Approved')} 
                          disabled={actionLoading === req._id}
                          className="btn-primary"
                          style={{ padding: '8px 16px', fontSize: '0.85rem', backgroundColor: '#2563eb' }}
                        >
                          <Check size={16} /> Approve
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(req._id, 'Rejected')} 
                          disabled={actionLoading === req._id}
                          className="btn-primary"
                          style={{ padding: '8px 16px', fontSize: '0.85rem', backgroundColor: '#e11d48' }}
                        >
                          <X size={16} /> Reject
                        </button>
                      </>
                    )}

                    {req.status === 'Approved' && (
                      <button 
                        onClick={() => handleStatusUpdate(req._id, 'Fulfilled')} 
                        disabled={actionLoading === req._id}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.85rem', backgroundColor: '#10b981' }}
                      >
                        <CheckSquare size={16} /> Fulfill & Deduct Stock
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default AdminRequestsPage;
