import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BiDroplet, BiUserPlus, BiPlusMedical } from 'react-icons/bi';
import useAuth from '../../hooks/useAuth';
import { ROLE_CONFIG } from '../../utils/roleConfig';
import '../../assets/styles/auth.css';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const RegisterPage = () => {
  const [role, setRole] = useState('donor');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    /* Donor specific */
    bloodGroup: '',
    age: '',
    gender: '',
    /* Hospital specific */
    hospitalName: '',
    licenseNumber: '',
    /* Shared address */
    street: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      navigate(ROLE_CONFIG[user.role]?.dashboardPath || '/');
    }
  }, [isAuthenticated, user, loading, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccessMsg('');
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const cleanedPhone = formData.phone.replace(/\D/g, '');
      if (!/^[0-9]{10}$/.test(cleanedPhone)) {
        setError('Phone number must be exactly 10 digits.');
        return;
      }

      /* Build shared address object */
      const address = {
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim()
      };

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        phone: cleanedPhone,
        address
      };

      if (role === 'donor') {
        if (!formData.bloodGroup) { setError('Blood group is required.'); return; }
        if (!formData.age || isNaN(formData.age) || formData.age < 18 || formData.age > 60) {
          setError('Age must be between 18 and 60.'); return;
        }
        if (!formData.gender) { setError('Gender is required.'); return; }
        payload.bloodGroup = formData.bloodGroup;
        payload.age = Number(formData.age);
        payload.gender = formData.gender;
      } else if (role === 'hospital') {
        if (!formData.hospitalName || !formData.licenseNumber) {
          setError('Hospital Name and License Number are required.'); return;
        }
        payload.hospitalName = formData.hospitalName;
        payload.licenseNumber = formData.licenseNumber;
      }

      const result = await register(payload);

      /* Second profile added to existing account (dual registration) */
      if (result.isVerified === true && result.success) {
        setSuccessMsg(result.message || 'Profile added! You can now log in and choose your portal.');
        return;
      }

      /* New account — redirect to OTP verification */
      if (result.isVerified === false) {
        navigate(`/otp-verify?email=${encodeURIComponent(result.email)}`);
      } else {
        navigate(ROLE_CONFIG[result.user?.role]?.dashboardPath || '/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card animate-fade-in" style={{ maxWidth: '540px' }}>
        <div className="auth-header" style={{ marginBottom: '20px' }}>
          <h1><BiDroplet /> BDMS</h1>
          <p>Create an account to join our network.</p>
        </div>

        {/* Role Selector */}
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
        {successMsg && (
          <div className="form-success" style={{
            backgroundColor: '#d1fae5', border: '1px solid #6ee7b7',
            color: '#065f46', padding: '12px 16px', borderRadius: '10px',
            fontSize: '0.9rem', marginBottom: '8px', textAlign: 'center'
          }}>
            {successMsg} <Link to="/login" style={{ fontWeight: '700', color: '#065f46' }}>Login now →</Link>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} style={{ gap: '14px' }}>

          {/* Common: Name */}
          <div className="form-group">
            <label htmlFor="reg-name">{role === 'hospital' ? 'Contact Person Name' : 'Full Name'}</label>
            <input
              type="text" id="reg-name" name="name" className="input-base"
              placeholder="Enter full name" value={formData.name} onChange={handleChange} required
            />
          </div>

          {/* Hospital: Hospital Name */}
          {role === 'hospital' && (
            <div className="form-group animate-fade-in">
              <label htmlFor="hospitalName">Hospital Name</label>
              <input
                type="text" id="hospitalName" name="hospitalName" className="input-base"
                placeholder="Enter hospital name" value={formData.hospitalName} onChange={handleChange} required
              />
            </div>
          )}

          {/* Common: Email */}
          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input
              type="email" id="reg-email" name="email" className="input-base"
              placeholder="Enter email" value={formData.email} onChange={handleChange} required
            />
          </div>

          {/* Donor: Age + Gender (row) */}
          {role === 'donor' && (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="age">Age</label>
                <input
                  type="number" id="age" name="age" className="input-base"
                  placeholder="18 – 60" value={formData.age} onChange={handleChange}
                  min="18" max="60" required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="gender">Gender</label>
                <select id="gender" name="gender" className="input-base" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Donor: Blood Group */}
          {role === 'donor' && (
            <div className="form-group animate-fade-in">
              <label htmlFor="bloodGroup">Blood Group</label>
              <select id="bloodGroup" name="bloodGroup" className="input-base" value={formData.bloodGroup} onChange={handleChange} required>
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          )}

          {/* Common: Phone */}
          <div className="form-group">
            <label htmlFor="reg-phone">Phone Number</label>
            <input
              type="tel" id="reg-phone" name="phone" className="input-base"
              placeholder="10-digit phone number" value={formData.phone} onChange={handleChange}
              required maxLength="10"
            />
          </div>

          {/* Address Section */}
          <fieldset style={{ border: '1px solid var(--border-light)', borderRadius: '10px', padding: '14px 16px', margin: 0 }}>
            <legend style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', padding: '0 6px' }}>
              {role === 'hospital' ? 'Hospital Address' : 'Address'}
            </legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text" name="street" className="input-base"
                placeholder="Street / Area" value={formData.street} onChange={handleChange}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="text" name="city" className="input-base"
                  placeholder="City" value={formData.city} onChange={handleChange}
                />
                <input
                  type="text" name="state" className="input-base"
                  placeholder="State" value={formData.state} onChange={handleChange}
                />
              </div>
              <input
                type="text" name="pincode" className="input-base"
                placeholder="Pincode" value={formData.pincode} onChange={handleChange} maxLength="6"
              />
            </div>
          </fieldset>

          {/* Hospital: License Number */}
          {role === 'hospital' && (
            <div className="form-group animate-fade-in">
              <label htmlFor="licenseNumber">License Number</label>
              <input
                type="text" id="licenseNumber" name="licenseNumber" className="input-base"
                placeholder="Hospital license number" value={formData.licenseNumber} onChange={handleChange} required
              />
            </div>
          )}

          {/* Password */}
          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              type="password" id="reg-password" name="password" className="input-base"
              placeholder="Minimum 8 characters" value={formData.password} onChange={handleChange}
              required minLength="8"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '6px' }} disabled={isLoading}>
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
