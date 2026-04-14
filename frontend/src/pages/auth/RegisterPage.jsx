import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BiDroplet, BiUserPlus, BiPlusMedical } from 'react-icons/bi';
import useAuth from '../../hooks/useAuth';
import { ROLE_CONFIG } from '../../utils/roleConfig';
import '../../assets/styles/auth.css';

const RegisterPage = () => {
  const [role, setRole] = useState('donor'); /* Default role */
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bloodGroup: '',
    phone: '',
    hospitalName: '',
    registrationNumber: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      /* Construct payload based on selected role */
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
        phone: formData.phone
      };

      if (role === 'donor') {
        if (!formData.bloodGroup) return setError('Blood group is required');
        payload.bloodGroup = formData.bloodGroup;
      } else if (role === 'hospital') {
        if (!formData.hospitalName || !formData.registrationNumber) {
          return setError('Hospital Name and Registration Number are required');
        }
        payload.hospitalName = formData.hospitalName;
        payload.registrationNumber = formData.registrationNumber;
      }

      /* Call API */
      const result = await register(payload);
      
      /* Redirect to specific dashboard */
      navigate(ROLE_CONFIG[result.user.role]?.dashboardPath || '/');

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card animate-fade-in" style={{ maxWidth: '500px' }}>
        <div className="auth-header" style={{ marginBottom: '20px' }}>
          <h1><BiDroplet /> BDMS</h1>
          <p>Create an account to join our network.</p>
        </div>

        <div className="role-selector">
          <div 
            className={`role-option ${role === 'donor' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('donor')}
          >
            <div className="role-option-icon"><BiUserPlus /></div>
            Donor
          </div>
          <div 
            className={`role-option ${role === 'hospital' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('hospital')}
          >
            <div className="role-option-icon"><BiPlusMedical /></div>
            Hospital
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} style={{ gap: '16px' }}>
          
          {/* Common Fields */}
          <div className="form-group">
            <label htmlFor="name">{role === 'hospital' ? 'Contact Person Name' : 'Full Name'}</label>
            <input type="text" id="name" name="name" className="input-base" placeholder="Enter name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" className="input-base" placeholder="Enter email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" className="input-base" placeholder="Enter phone number" value={formData.phone} onChange={handleChange} required />
          </div>

          {/* Donor Specific Field */}
          {role === 'donor' && (
            <div className="form-group animate-fade-in">
              <label htmlFor="bloodGroup">Blood Group</label>
              <select id="bloodGroup" name="bloodGroup" className="input-base" value={formData.bloodGroup} onChange={handleChange} required>
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          )}

          {/* Hospital Specific Fields */}
          {role === 'hospital' && (
            <>
              <div className="form-group animate-fade-in">
                <label htmlFor="hospitalName">Hospital Name</label>
                <input type="text" id="hospitalName" name="hospitalName" className="input-base" placeholder="Enter Hospital Name" value={formData.hospitalName} onChange={handleChange} required />
              </div>
              <div className="form-group animate-fade-in">
                <label htmlFor="registrationNumber">Registration Number</label>
                <input type="text" id="registrationNumber" name="registrationNumber" className="input-base" placeholder="Enter Registration Number" value={formData.registrationNumber} onChange={handleChange} required />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" className="input-base" placeholder="Enter password (min 8 chars)" value={formData.password} onChange={handleChange} required minLength="8" />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
