import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BiDroplet, BiCheckCircle } from 'react-icons/bi';
import authService from '../../services/authService';
import '../../assets/styles/auth.css';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await authService.resetPassword(token, password);
      setMessage(result.message || 'Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired or is invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card animate-fade-in">
        <div className="auth-header">
          <h1><BiDroplet /> BDMS</h1>
          <p>Choose New Password</p>
        </div>

        {error && <div className="form-error">{error}</div>}
        {message && (
          <div style={{ color: '#059669', backgroundColor: '#ecfdf5', padding: '16px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '20px', border: '1px solid rgba(5, 150, 105, 0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', color: '#10b981', marginBottom: '8px' }}><BiCheckCircle style={{ display: 'inline-block' }} /></div>
            {message}
            <div style={{ marginTop: '12px' }}>
              <Link to="/login" style={{ fontWeight: 'bold', color: '#047857', textDecoration: 'underline' }}>Login now</Link>
            </div>
          </div>
        )}

        {!message && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '10px', textAlign: 'center' }}>
              Please enter and confirm your new password below (minimum 8 characters).
            </p>
            
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="input-base"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                required
                minLength="8"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="input-base"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                required
                minLength="8"
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={isLoading}>
              {isLoading ? 'Resetting password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {!message && (
          <div className="auth-footer">
            Cancel and <Link to="/login">return to login</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
