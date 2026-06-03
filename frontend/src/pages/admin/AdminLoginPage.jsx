import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  /* If already authenticated as admin, go straight to dashboard */
  useEffect(() => {
    if (!loading && isAuthenticated && user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData);
      const loggedInUser = result.user;

      if (loggedInUser.role !== 'admin') {
        setError('Access denied. This portal is for administrators only.');
        return;
      }

      navigate('/admin', { replace: true });
    } catch (err) {
      if (err.response?.data?.isVerified === false) {
        setError('Account not verified. Please contact the system administrator.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '20px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#1e293b',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '44px 36px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
        }}
      >
        {/* Icon + Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '64px', height: '64px', borderRadius: '18px',
              backgroundColor: 'rgba(220,38,38,0.15)',
              border: '1.5px solid rgba(220,38,38,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <ShieldCheck size={32} color="#dc2626" />
          </div>
          <h1 style={{ color: 'white', fontSize: '1.6rem', fontWeight: '700', margin: '0 0 6px' }}>
            Admin Access
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            Restricted area — administrators only
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)',
            color: '#fca5a5', padding: '12px 16px', borderRadius: '10px',
            fontSize: '0.88rem', marginBottom: '20px', textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              id="admin-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@domain.com"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px',
                backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', fontSize: '0.95rem', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              id="admin-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter admin password"
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '10px',
                backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', fontSize: '0.95rem', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            id="admin-login-btn"
            disabled={isLoading}
            style={{
              marginTop: '8px', padding: '13px', borderRadius: '10px',
              backgroundColor: isLoading ? '#7f1d1d' : '#dc2626',
              color: 'white', border: 'none', fontWeight: '700',
              fontSize: '1rem', cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {isLoading ? 'Verifying...' : 'Access Admin Panel'}
          </button>
        </form>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link
            to="/login"
            style={{ color: '#475569', fontSize: '0.82rem', textDecoration: 'none' }}
          >
            ← Return to main login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
