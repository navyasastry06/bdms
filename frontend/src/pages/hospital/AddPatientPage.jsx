import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const AddPatientPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    medicalCondition: '',
    unitsRequired: '1'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.patientName.trim()) {
        setError('Patient name is required.'); setIsLoading(false); return;
      }
      if (!formData.bloodGroup) {
        setError('Blood group is required.'); setIsLoading(false); return;
      }
      if (formData.phone) {
        const clean = formData.phone.replace(/\D/g, '');
        if (clean.length !== 10) {
          setError('Phone number must be 10 digits.'); setIsLoading(false); return;
        }
      }

      const payload = {
        patientName: formData.patientName.trim(),
        bloodGroup: formData.bloodGroup,
        unitsRequired: Number(formData.unitsRequired) || 1,
        medicalCondition: formData.medicalCondition || 'None'
      };
      if (formData.age) payload.age = Number(formData.age);
      if (formData.gender) payload.gender = formData.gender;
      if (formData.phone) payload.phone = formData.phone.replace(/\D/g, '');

      await api.post('/patient/add', payload);
      navigate('/hospital/patients', { state: { message: 'Patient added successfully.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add patient. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '620px', margin: '0 auto' }}>

      {/* Back Button */}
      <button
        onClick={() => navigate('/hospital/patients')}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '24px', padding: 0 }}
      >
        <ArrowLeft size={18} /> Back to Patients
      </button>

      <div className="glass-panel" style={{ padding: '36px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'var(--secondary-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={26} color="var(--primary-red)" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-main)' }}>Add Patient</h1>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Add a patient record under your hospital account.
            </p>
          </div>
        </div>

        {error && <div className="form-error" style={{ marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Patient Name */}
          <div className="form-group">
            <label htmlFor="patientName">Patient Name <span style={{ color: 'var(--primary-red)' }}>*</span></label>
            <input
              type="text" id="patientName" name="patientName" className="input-base"
              placeholder="Full name of patient"
              value={formData.patientName} onChange={handleChange} required
            />
          </div>

          {/* Age + Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="pat-age">Age</label>
              <input
                type="number" id="pat-age" name="age" className="input-base"
                placeholder="Patient age" min="0" max="120"
                value={formData.age} onChange={handleChange}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="pat-gender">Gender</label>
              <select id="pat-gender" name="gender" className="input-base" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Blood Group + Units */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="pat-bloodGroup">Blood Group <span style={{ color: 'var(--primary-red)' }}>*</span></label>
              <select id="pat-bloodGroup" name="bloodGroup" className="input-base" value={formData.bloodGroup} onChange={handleChange} required>
                <option value="">Select</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="unitsRequired">Units Required</label>
              <input
                type="number" id="unitsRequired" name="unitsRequired" className="input-base"
                min="1" max="20"
                value={formData.unitsRequired} onChange={handleChange}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="pat-phone">Contact Number</label>
            <input
              type="tel" id="pat-phone" name="phone" className="input-base"
              placeholder="10-digit phone number"
              value={formData.phone} onChange={handleChange} maxLength="10"
            />
          </div>

          {/* Medical Condition */}
          <div className="form-group">
            <label htmlFor="medicalCondition">Medical Condition</label>
            <textarea
              id="medicalCondition" name="medicalCondition" className="input-base"
              placeholder="Any relevant medical history or diagnosis (optional)"
              value={formData.medicalCondition} onChange={handleChange}
              rows={3}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Patient'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/hospital/patients')}
              style={{ flex: 1, padding: '12px', border: '1px solid var(--border-light)', borderRadius: '10px', cursor: 'pointer', background: 'white', fontWeight: '500' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientPage;
