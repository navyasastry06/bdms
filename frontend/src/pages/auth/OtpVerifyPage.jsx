import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { BiDroplet, BiShieldQuarter } from 'react-icons/bi';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import { ROLE_CONFIG } from '../../utils/roleConfig';
import '../../assets/styles/auth.css';

const OtpVerifyPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { verifyOtp, user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if already verified
  useEffect(() => {
    if (user && user.isVerified) {
      if (user.isDualRole) {
        navigate('/portal-select');
      } else {
        const role = user.role;
        navigate(ROLE_CONFIG[role]?.dashboardPath || '/');
      }
    }
  }, [user, navigate]);

  // Redirect if email is missing
  useEffect(() => {
    if (!email && !(user && user.isVerified)) {
      navigate('/login');
    }
  }, [email, user, navigate]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (e) => {
    // Only allow digits and max length of 6
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setOtpCode(value);
      setError('');
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      return setError('Please enter a valid 6-digit OTP code.');
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await verifyOtp(email, otpCode);
      const verifiedUser = result.user;
      if (verifiedUser.isDualRole) {
        navigate('/portal-select');
      } else {
        const role = verifiedUser.role;
        navigate(ROLE_CONFIG[role]?.dashboardPath || '/');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message;
      if (errMsg === 'Account is already verified.') {
        try {
          const verifiedUser = await refreshUser();
          if (verifiedUser.isDualRole) {
            navigate('/portal-select');
          } else {
            const role = verifiedUser.role;
            navigate(ROLE_CONFIG[role]?.dashboardPath || '/');
          }
          return;
        } catch (refreshErr) {
          console.error("Failed to refresh user on verification bypass", refreshErr);
        }
      }
      setError(errMsg || 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await authService.resendOtp(email);
      setMessage(result.message || 'A new OTP has been sent successfully.');
      setResendTimer(60);
      setCanResend(false);
      setOtpCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card animate-fade-in">
        <div className="auth-header">
          <h1><BiDroplet /> BDMS</h1>
          <p>Verify Your Email</p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', color: 'var(--primary-red)', marginBottom: '12px' }}>
            <BiShieldQuarter style={{ display: 'inline-block' }} />
          </div>
          <p>We've sent a 6-digit verification code to:</p>
          <strong style={{ color: 'var(--text-main)', display: 'block', marginTop: '4px', wordBreak: 'break-all' }}>{email}</strong>
        </div>

        {error && <div className="form-error">{error}</div>}
        {message && <div style={{ color: '#059669', backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '16px', border: '1px solid rgba(5, 150, 105, 0.2)', textAlign: 'center' }}>{message}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="otpCode" style={{ textAlign: 'center', width: '100%', marginBottom: '10px', fontWeight: '600' }}>Enter 6-Digit OTP</label>
            <input
              type="text"
              id="otpCode"
              name="otpCode"
              className="input-base"
              placeholder="••••••"
              value={otpCode}
              onChange={handleChange}
              maxLength="6"
              required
              style={{
                textAlign: 'center',
                fontSize: '1.8rem',
                letterSpacing: '12px',
                padding: '8px 0',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                color: 'var(--primary-red)'
              }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={isLoading || otpCode.length !== 6}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '24px' }}>
          {canResend ? (
            <p>Didn't receive the code? <button onClick={handleResend} style={{ background: 'none', border: 'none', color: 'var(--primary-red)', fontWeight: 'bold', cursor: 'pointer', padding: 0, font: 'inherit', textDecoration: 'underline' }}>Resend OTP</button></p>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Resend code in <strong style={{ color: 'var(--text-main)' }}>{resendTimer}s</strong></p>
          )}
          <div style={{ marginTop: '16px' }}>
            <Link to="/login" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerifyPage;
