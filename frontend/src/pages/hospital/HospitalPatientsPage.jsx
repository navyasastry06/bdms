import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Trash2, Edit3, Activity, Heart, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const statusConfig = {
  Active: { bg: '#d1fae5', text: '#065f46', icon: <CheckCircle size={14} /> },
  Critical: { bg: '#fee2e2', text: '#b91c1c', icon: <AlertTriangle size={14} /> },
  Discharged: { bg: '#f1f5f9', text: '#475569', icon: <Activity size={14} /> }
};

const HospitalPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [bloodFilter, setBloodFilter] = useState('All');
  const [updateModal, setUpdateModal] = useState(null); // { id, status }
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patient/all');
      if (res.data.success) {
        setPatients(res.data.patients || []);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleStatusUpdate = async () => {
    try {
      await api.patch(`/patient/${updateModal.id}/status`, { status: updateModal.status });
      setMessage('Patient status updated.');
      setUpdateModal(null);
      fetchPatients();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/patient/${deleteConfirm}`);
      setMessage('Patient record removed.');
      setDeleteConfirm(null);
      fetchPatients();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed.');
    }
  };

  const filtered = patients.filter(p => {
    const statusMatch = statusFilter === 'All' || p.status === statusFilter;
    const bloodMatch = bloodFilter === 'All' || p.bloodGroup === bloodFilter;
    return statusMatch && bloodMatch;
  });

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading patients...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--text-main)' }}>Patient Management</h1>
          <p style={{ color: 'var(--text-muted)', margin: '6px 0 0' }}>
            {patients.length} patient{patients.length !== 1 ? 's' : ''} under your hospital
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/hospital/add-patient')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Patient
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7', fontSize: '0.9rem' }}>
          {message}
          <button onClick={() => setMessage('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}>✕</button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '8px' }}>Status:</label>
          {['All', 'Active', 'Critical', 'Discharged'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '5px 12px', borderRadius: '20px', fontSize: '0.82rem', marginRight: '6px', cursor: 'pointer',
                border: '1px solid var(--border-light)',
                backgroundColor: statusFilter === s ? 'var(--primary-red)' : 'transparent',
                color: statusFilter === s ? 'white' : 'var(--text-muted)',
                fontWeight: statusFilter === s ? '600' : '400'
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '8px' }}>Blood:</label>
          <select
            value={bloodFilter}
            onChange={e => setBloodFilter(e.target.value)}
            style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--text-main)' }}
          >
            <option value="All">All Groups</option>
            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ fontSize: '1rem' }}>No patients found.</p>
            <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/hospital/add-patient')}>
              Add First Patient
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  {['Patient Name', 'Age / Gender', 'Blood Group', 'Units Req.', 'Condition', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.82rem', textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const sc = statusConfig[p.status] || statusConfig.Active;
                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{p.patientName}</td>
                      <td style={{ padding: '14px', color: 'var(--text-muted)' }}>
                        {p.age ? `${p.age} yrs` : '—'} {p.gender ? `/ ${p.gender}` : ''}
                      </td>
                      <td style={{ padding: '14px', color: 'var(--primary-red)', fontWeight: '700' }}>{p.bloodGroup}</td>
                      <td style={{ padding: '14px' }}>{p.unitsRequired} unit{p.unitsRequired !== 1 ? 's' : ''}</td>
                      <td style={{ padding: '14px', color: 'var(--text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.medicalCondition || '—'}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600', backgroundColor: sc.bg, color: sc.text }}>
                          {sc.icon} {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            title="Update Status"
                            onClick={() => setUpdateModal({ id: p._id, status: p.status })}
                            style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            title="Remove Patient"
                            onClick={() => setDeleteConfirm(p._id)}
                            style={{ background: 'none', border: '1px solid #fee2e2', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#dc2626' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {updateModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px', width: '360px', backgroundColor: 'white' }}>
            <h3 style={{ marginTop: 0 }}>Update Patient Status</h3>
            <select
              value={updateModal.status}
              onChange={e => setUpdateModal({ ...updateModal, status: e.target.value })}
              className="input-base"
              style={{ marginBottom: '20px' }}
            >
              <option value="Active">Active</option>
              <option value="Critical">Critical</option>
              <option value="Discharged">Discharged</option>
            </select>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleStatusUpdate}>Update</button>
              <button onClick={() => setUpdateModal(null)} style={{ flex: 1, padding: '12px', border: '1px solid var(--border-light)', borderRadius: '10px', cursor: 'pointer', background: 'white' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px', width: '360px', backgroundColor: 'white', textAlign: 'center' }}>
            <Trash2 size={40} color="#dc2626" style={{ marginBottom: '12px' }} />
            <h3 style={{ marginTop: 0 }}>Remove Patient?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>This will permanently delete the patient record. This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={handleDelete} style={{ flex: 1, padding: '12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Remove</button>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '12px', border: '1px solid var(--border-light)', borderRadius: '10px', cursor: 'pointer', background: 'white' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalPatientsPage;
