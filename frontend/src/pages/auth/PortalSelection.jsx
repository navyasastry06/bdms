import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Heart, Building2, Droplet } from 'lucide-react';
import '../../assets/styles/auth.css';

const PortalSelection = () => {
  const { user, setActiveRole } = useAuth();
  const navigate = useNavigate();

  const selectPortal = (role) => {
    setActiveRole(role);
    if (role === 'donor') {
      navigate('/donor');
    } else if (role === 'hospital') {
      navigate('/hospital');
    }
  };

  return (
    <div className="auth-container" style={{ padding: '20px' }}>
      <div
        className="glass-panel auth-card animate-fade-in"
        style={{ maxWidth: '800px', width: '100%', padding: '48px 36px' }}
      >
        {/* Header */}
        <div className="auth-header" style={{ marginBottom: '12px', textAlign: 'center' }}>
          <h1
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '2.4rem',
              color: 'var(--primary-red)',
              margin: 0
            }}
          >
            <Droplet size={36} fill="var(--primary-red)" />
            Choose Portal
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '10px', lineHeight: '1.6' }}>
            Hello, <strong>{user?.name}</strong>. This account is registered as both a donor and a
            hospital. Select the portal you wish to access.
          </p>
        </div>

        {/* Portal Cards */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '32px' }}>

          {/* Donor Portal Card */}
          <div
            onClick={() => selectPortal('donor')}
            className="portal-card"
            style={cardStyle}
          >
            <div style={iconContainerStyle('var(--primary-red)', 'rgba(220,38,38,0.1)')}>
              <Heart size={44} color="var(--primary-red)" fill="var(--primary-red)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', margin: '16px 0 10px 0', color: 'var(--text-main)', fontWeight: '700' }}>
              Donor Portal
            </h3>
            <ul style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.7', textAlign: 'left', paddingLeft: '18px', flex: 1, margin: 0 }}>
              <li>Donation History</li>
              <li>Eligibility Status</li>
              <li>Donation Camps</li>
              <li>Notifications</li>
              <li>Profile</li>
            </ul>
            <button
              id="open-donor-portal-btn"
              className="btn-primary"
              style={{ width: '100%', marginTop: '24px' }}
            >
              Open Donor Portal
            </button>
          </div>

          {/* Hospital Portal Card */}
          <div
            onClick={() => selectPortal('hospital')}
            className="portal-card"
            style={cardStyle}
          >
            <div style={iconContainerStyle('#2563eb', 'rgba(37,99,235,0.1)')}>
              <Building2 size={44} color="#2563eb" />
            </div>
            <h3 style={{ fontSize: '1.4rem', margin: '16px 0 10px 0', color: 'var(--text-main)', fontWeight: '700' }}>
              Hospital Portal
            </h3>
            <ul style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.7', textAlign: 'left', paddingLeft: '18px', flex: 1, margin: 0 }}>
              <li>Patient Management</li>
              <li>Blood Requests</li>
              <li>Request Tracking</li>
              <li>Notifications</li>
              <li>Profile</li>
            </ul>
            <button
              id="open-hospital-portal-btn"
              className="btn-primary"
              style={{ width: '100%', marginTop: '24px', backgroundColor: '#2563eb', borderColor: '#2563eb' }}
            >
              Open Hospital Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  flex: '1 1 300px',
  background: 'rgba(255, 255, 255, 0.7)',
  border: '1px solid var(--border-light)',
  borderRadius: '20px',
  padding: '32px 28px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
};

const iconContainerStyle = (color, bg) => ({
  width: '84px',
  height: '84px',
  borderRadius: '22px',
  background: bg,
  border: `1.5px solid ${color}22`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

export default PortalSelection;
