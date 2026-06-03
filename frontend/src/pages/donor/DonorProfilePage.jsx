import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Activity, Save, Check } from 'lucide-react';
import donorService from '../../services/donorService';

const DonorProfilePage = () => {
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    phone: '',
    address: { street: '', city: '', state: '', pincode: '' },
    medicalConditions: '',
    isAvailable: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await donorService.getProfile();
        if (res.success && res.profile) {
          setProfile({
            age: res.profile.age || '',
            gender: res.profile.gender || '',
            phone: res.profile.phone || '',
            address: {
              street: res.profile.address?.street || '',
              city: res.profile.address?.city || '',
              state: res.profile.address?.state || '',
              pincode: res.profile.address?.pincode || ''
            },
            medicalConditions: res.profile.medicalConditions || 'None',
            isAvailable: res.profile.isAvailable ?? true
          });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to load profile details.' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleCheckboxChange = (e) => {
    const { checked } = e.target;
    setProfile(prev => ({
      ...prev,
      isAvailable: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await donorService.updateProfile(profile);
      if (res.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to update profile.' });
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Error occurred while saving profile.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading profile...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: 'var(--text-main)', fontSize: '1.75rem', marginBottom: '8px' }}>My Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal details, donation availability, and medical records.</p>
      </div>

      {message.text && (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          backgroundColor: message.type === 'success' ? '#d1fae5' : '#ffe4e6',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#10b981' : '#f43f5e'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={18} />
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Availability Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>Active Donor Availability</h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toggle to display yourself as available for emergency requests.</p>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px' }}>
            <input 
              type="checkbox" 
              checked={profile.isAvailable} 
              onChange={handleCheckboxChange} 
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: profile.isAvailable ? 'var(--primary-red)' : '#cbd5e1',
              transition: '0.4s', borderRadius: '34px'
            }}>
              <span style={{
                position: 'absolute', content: '""', height: '20px', width: '20px', left: '4px', bottom: '4px',
                backgroundColor: 'white', transition: '0.4s', borderRadius: '50%',
                transform: profile.isAvailable ? 'translateX(24px)' : 'none'
              }}></span>
            </span>
          </label>
        </div>

        {/* General Info */}
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-red)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} /> General Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600' }}>Age (18-60)</label>
              <input 
                type="number" 
                name="age" 
                min="18" 
                max="60" 
                value={profile.age} 
                onChange={handleChange} 
                className="input-base" 
                placeholder="Enter age" 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600' }}>Gender</label>
              <select 
                name="gender" 
                value={profile.gender} 
                onChange={handleChange} 
                className="input-base" 
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600' }}>Phone Number (10 digits)</label>
              <input 
                type="tel" 
                name="phone" 
                pattern="[0-9]{10}" 
                value={profile.phone} 
                onChange={handleChange} 
                className="input-base" 
                placeholder="10 digit phone number" 
                required 
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-red)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} /> Address Location
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600' }}>Street Address</label>
              <input 
                type="text" 
                name="street" 
                value={profile.address.street} 
                onChange={handleAddressChange} 
                className="input-base" 
                placeholder="Apartment, Street Name" 
                required 
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600' }}>City</label>
                <input 
                  type="text" 
                  name="city" 
                  value={profile.address.city} 
                  onChange={handleAddressChange} 
                  className="input-base" 
                  placeholder="City" 
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600' }}>State</label>
                <input 
                  type="text" 
                  name="state" 
                  value={profile.address.state} 
                  onChange={handleAddressChange} 
                  className="input-base" 
                  placeholder="State" 
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600' }}>Pincode</label>
                <input 
                  type="text" 
                  name="pincode" 
                  value={profile.address.pincode} 
                  onChange={handleAddressChange} 
                  className="input-base" 
                  placeholder="Pincode" 
                  required 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-red)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} /> Medical Details
          </h3>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600' }}>Any Chronic Illness or Conditions</label>
            <textarea 
              name="medicalConditions" 
              value={profile.medicalConditions} 
              onChange={handleChange} 
              className="input-base" 
              style={{ minHeight: '100px', resize: 'vertical' }} 
              placeholder="e.g., Diabetes, Hypertension, or write 'None'"
            ></textarea>
          </div>
        </div>

        {/* Submit */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default DonorProfilePage;
