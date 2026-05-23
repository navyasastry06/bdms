import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, ShieldAlert, Check } from 'lucide-react';
import donorService from '../../services/donorService';

const DonorCampsPage = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  const fetchCamps = async () => {
    try {
      const res = await donorService.getUpcomingCamps();
      if (res.success) {
        setCamps(res.camps || []);
      }
    } catch (error) {
      console.error('Failed to load upcoming camps:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, []);

  const handleRegister = async (campId) => {
    setActionLoading(campId);
    setMessage('');
    try {
      const res = await donorService.registerForCamp(campId);
      if (res.success) {
        setMessage('Successfully registered for the camp!');
        await fetchCamps();
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to register for camp.';
      alert(errMsg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnregister = async (campId) => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    setActionLoading(campId);
    setMessage('');
    try {
      const res = await donorService.unregisterFromCamp(campId);
      if (res.success) {
        setMessage('Successfully cancelled camp registration.');
        await fetchCamps();
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to unregister.';
      alert(errMsg);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading camps...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ color: 'var(--text-main)', fontSize: '1.75rem', marginBottom: '8px' }}>Upcoming Donation Camps</h1>
        <p style={{ color: 'var(--text-muted)' }}>Find and register for local blood donation events.</p>
      </div>

      {message && (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: '#d1fae5',
          color: '#065f46',
          border: '1px solid #10b981',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600'
        }}>
          <Check size={18} />
          <span>{message}</span>
        </div>
      )}

      {camps.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ShieldAlert size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
          <h3>No camps available right now</h3>
          <p style={{ marginTop: '8px' }}>Please check back later or contact administrators for update queries.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {camps.map((camp, idx) => {
            const isFull = camp.registeredDonors?.length >= camp.maxParticipants;
            return (
              <div key={idx} className="glass-panel hover-red-outline" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-red)', marginBottom: '16px' }}>{camp.name}</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Calendar size={16} />
                      <span>{new Date(camp.date).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Clock size={16} />
                      <span>{camp.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <MapPin size={16} style={{ marginTop: '3px' }} />
                      <span>{camp.venue}, {camp.city}, {camp.state}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Users size={16} />
                      <span>
                        Registered: {camp.registeredDonors?.length || 0} / {camp.maxParticipants}
                      </span>
                    </div>
                  </div>

                  {camp.description && (
                    <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                      {camp.description}
                    </p>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                  {camp.isRegistered ? (
                    <button 
                      onClick={() => handleUnregister(camp._id)} 
                      disabled={actionLoading === camp._id} 
                      className="btn-outline" 
                      style={{ width: '100%', border: '1px solid #dc2626', color: '#dc2626' }}
                    >
                      {actionLoading === camp._id ? 'Processing...' : 'Cancel Registration'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleRegister(camp._id)} 
                      disabled={isFull || actionLoading === camp._id} 
                      className="btn-primary" 
                      style={{ width: '100%' }}
                    >
                      {isFull ? 'Camp is Full' : actionLoading === camp._id ? 'Registering...' : 'Register for Camp'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DonorCampsPage;
