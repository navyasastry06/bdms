import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet } from 'lucide-react';
import hospitalService from '../../services/hospitalService';

const BloodRequestForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: '',
    unitsRequired: 1,
    urgency: 'Normal',
    hospitalName: 'My Hospital', /* In reality, fetch from user profile */
    contactNumber: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await hospitalService.createRequest(formData);
      navigate('/hospital'); /* Back to dashboard on success */
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '20px' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ backgroundColor: 'var(--secondary-red)', padding: '12px', borderRadius: '12px', color: 'var(--primary-red)' }}>
          <Droplet size={24} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>Request Blood</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Submit an urgent requirement to the central inventory.</p>
        </div>
      </div>

      <form className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleSubmit}>
        {error && <div style={{ color: 'var(--primary-red)', backgroundColor: 'var(--secondary-red)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Patient Name</label>
          <input type="text" className="input-base" name="patientName" value={formData.patientName} onChange={handleChange} required placeholder="e.g. John Doe" />
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Blood Group</label>
            <select className="input-base" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
              <option value="" disabled>Select Group</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Units Required</label>
            <input type="number" className="input-base" name="unitsRequired" min="1" max="10" value={formData.unitsRequired} onChange={handleChange} required />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
             <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Urgency Level</label>
             <select className="input-base" name="urgency" value={formData.urgency} onChange={handleChange}>
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Critical">Critical</option>
             </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Contact Number</label>
            <input type="text" className="input-base" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required placeholder="10-digit number" />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Reason / Notes</label>
          <textarea className="input-base" name="reason" value={formData.reason} onChange={handleChange} rows="3" placeholder="Optional notes for the admin..."></textarea>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
          <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => navigate('/hospital')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BloodRequestForm;
