import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BiDroplet, BiMailSend } from 'react-icons/bi';
import authService from '../../services/authService';
import '../../assets/styles/auth.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Email address is required.');

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await authService.forgotPassword(email);
      setMessage(result.message || 'If that email address exists, a password reset link has been sent.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send password reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card animate-fade-in">
        <div className="auth-header">
          <h1><BiDroplet /> BDMS</h1>
          <p>Reset Your Password</p>
        </div>

        {error && <div className="form-error">{error}</div>}
        {message && (
          <div style={{ color: '#059669', backgroundColor: '#ecfdf5', padding: '16px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '20px', border: '1px solid rgba(5, 150, 105, 0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', color: '#10b981', marginBottom: '8px' }}><BiMailSend style={{ display: 'inline-block' }} /></div>
            {message}
          </div>
        )}

        {!message && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '10px', textAlign: 'center' }}>
              Enter your registered email address below, and we'll send you a link to reset your password.
            </p>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="input-base"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={isLoading}>
              {isLoading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Remembered your password? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
