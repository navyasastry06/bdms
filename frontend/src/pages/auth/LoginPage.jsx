import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { BiDroplet } from 'react-icons/bi';
import useAuth from '../../hooks/useAuth';
import { ROLE_CONFIG } from '../../utils/roleConfig';
import '../../assets/styles/auth.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.isDualRole) {
        navigate('/choose-portal');
      } else {
        navigate(ROLE_CONFIG[user.role]?.dashboardPath || '/');
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); /* clear error on type */
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login(formData);
      const loggedInUser = result.user;

      /* Admin users — redirect straight to admin dashboard */
      if (loggedInUser.role === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }

      if (loggedInUser.isDualRole) {
        navigate('/choose-portal', { replace: true });
        return;
      }

      const role = loggedInUser.role;

      /* Redirect logic: Check if they tried to access a protected route before logging in */
      let origin = location.state?.from?.pathname || ROLE_CONFIG[role]?.dashboardPath || '/';

      /* Sanitize legacy '/dashboard' paths */
      if (origin.endsWith('/dashboard')) {
        origin = origin.replace('/dashboard', '');
      }

      /* Validate if the user's role is allowed to access the origin path */
      const isRouteAllowedForRole = (path, userRole) => {
        if (path.startsWith('/admin') && userRole !== 'admin') return false;
        if (path.startsWith('/donor') && userRole !== 'donor') return false;
        if (path.startsWith('/hospital') && userRole !== 'hospital') return false;
        return true;
      };

      if (!isRouteAllowedForRole(origin, role)) {
        origin = ROLE_CONFIG[role]?.dashboardPath || '/';
      }

      navigate(origin, { replace: true });
      
    } catch (err) {
      if (err.response?.data?.isVerified === false) {
        const unverifiedEmail = err.response.data.email || formData.email;
        navigate(`/otp-verify?email=${encodeURIComponent(unverifiedEmail)}`);
      } else {
        setError(err.response?.data?.message || 'Failed to login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card animate-fade-in">
        <div className="auth-header">
          <h1><BiDroplet /> BDMS</h1>
          <p>Welcome back! Please login to your account.</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="input-base"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', fontWeight: '500' }}>Forgot Password?</Link>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              className="input-base"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
