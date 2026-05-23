import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Plus, Edit2, Trash2, Heart, Award, Clock, X, Check, Save } from 'lucide-react';
import adminService from '../../services/adminService';

const AdminCampsPage = () => {
  const [camps, setCamps] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCampModal, setShowCampModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);

  // Forms
  const [campForm, setCampForm] = useState({
    name: '', venue: '', city: '', state: '', date: '', time: '',
    description: '', maxParticipants: 50, status: 'Upcoming'
  });
  
  const [donationForm, setDonationForm] = useState({
    donorId: '', bloodGroup: 'A+', units: 1, notes: ''
  });

  const [savingCamp, setSavingCamp] = useState(false);
  const [savingDonation, setSavingDonation] = useState(false);

  const initData = async () => {
    try {
      const [campsRes, donorsRes] = await Promise.all([
        adminService.getCamps(),
        adminService.getDonors()
      ]);
      if (campsRes.success) setCamps(campsRes.camps || []);
      if (donorsRes.success) setDonors(donorsRes.donors || []);
    } catch (error) {
      console.error('Failed to load camps data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const openCreateModal = () => {
    setSelectedCamp(null);
    setCampForm({
      name: '', venue: '', city: '', state: '', date: '', time: '',
      description: '', maxParticipants: 50, status: 'Upcoming'
    });
    setShowCampModal(true);
  };

  const openEditModal = (camp) => {
    setSelectedCamp(camp);
    // Format date string to YYYY-MM-DD
    const dateFormatted = camp.date ? new Date(camp.date).toISOString().split('T')[0] : '';
    setCampForm({
      name: camp.name || '',
      venue: camp.venue || '',
      city: camp.city || '',
      state: camp.state || '',
      date: dateFormatted,
      time: camp.time || '',
      description: camp.description || '',
      maxParticipants: camp.maxParticipants || 50,
      status: camp.status || 'Upcoming'
    });
    setShowCampModal(true);
  };

  const openDonationModal = (camp) => {
    setSelectedCamp(camp);
    setDonationForm({
      donorId: '',
      bloodGroup: 'A+',
      units: 1,
      notes: ''
    });
    setShowDonationModal(true);
  };

  const handleCampFormChange = (e) => {
    const { name, value } = e.target;
    setCampForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDonationFormChange = (e) => {
    const { name, value } = e.target;
    
    // Automatically select the donor's blood group if donor is selected
    if (name === 'donorId' && value) {
      const selectedDonor = donors.find(d => d.id === value);
      setDonationForm(prev => ({
        ...prev,
        donorId: value,
        bloodGroup: selectedDonor ? selectedDonor.bloodGroup : 'A+'
      }));
    } else {
      setDonationForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveCamp = async (e) => {
    e.preventDefault();
    setSavingCamp(true);
    try {
      let res;
      if (selectedCamp) {
        res = await adminService.updateCamp(selectedCamp._id, campForm);
      } else {
        res = await adminService.createCamp(campForm);
      }
      if (res.success) {
        alert(selectedCamp ? 'Camp updated successfully!' : 'Camp created successfully!');
        setShowCampModal(false);
        await initData();
      }
    } catch (error) {
      alert('Failed to save camp details.');
    } finally {
      setSavingCamp(false);
    }
  };

  const handleDeleteCamp = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation camp?')) return;
    try {
      const res = await adminService.deleteCamp(id);
      if (res.success) {
        alert('Camp successfully deleted!');
        await initData();
      }
    } catch (error) {
      alert('Failed to delete camp.');
    }
  };

  const handleRecordDonation = async (e) => {
    e.preventDefault();
    if (!donationForm.donorId) return alert('Please select a donor.');
    setSavingDonation(true);
    try {
      const res = await adminService.recordDonation({
        donorId: donationForm.donorId,
        bloodGroup: donationForm.bloodGroup,
        units: Number(donationForm.units),
        location: selectedCamp.name,
        campId: selectedCamp._id,
        notes: donationForm.notes
      });
      if (res.success) {
        alert('Donation successfully recorded and inventory updated!');
        setShowDonationModal(false);
        await initData();
      }
    } catch (error) {
      alert('Failed to record donation.');
    } finally {
      setSavingDonation(false);
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading camps...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'var(--text-main)', fontSize: '1.75rem', marginBottom: '8px' }}>Manage Donation Camps</h1>
          <p style={{ color: 'var(--text-muted)' }}>Create, edit, and delete blood donation camps, and record collected units.</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add New Camp
        </button>
      </div>

      {camps.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
          <h3>No camps created yet</h3>
          <button onClick={openCreateModal} className="btn-outline" style={{ marginTop: '16px' }}>Schedule First Camp</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {camps.map((camp, idx) => (
            <div key={idx} className="glass-panel hover-red-outline" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-red)', margin: 0 }}>{camp.name}</h3>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: '600', padding: '4px 10px', borderRadius: '12px',
                    backgroundColor: camp.status === 'Completed' ? '#cbd5e1' : camp.status === 'Active' ? '#d1fae5' : '#dbeafe',
                    color: camp.status === 'Completed' ? '#475569' : camp.status === 'Active' ? '#059669' : '#2563eb'
                  }}>
                    {camp.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={16} />
                    <span>{new Date(camp.date).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={16} />
                    <span>{camp.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <MapPin size={16} style={{ marginTop: '3px' }} />
                    <span>{camp.venue}, {camp.city}, {camp.state}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Award size={16} style={{ color: 'var(--primary-red)' }} />
                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                      Units Collected: {camp.totalUnitsCollected || 0}
                    </span>
                  </div>
                </div>

                {camp.description && (
                  <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                    {camp.description}
                  </p>
                )}
              </div>

              {/* Actions panel */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <button 
                  onClick={() => openDonationModal(camp)} 
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem', backgroundColor: '#10b981' }}
                >
                  <Heart size={14} /> Record Donation
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => openEditModal(camp)} 
                    className="btn-outline" 
                    style={{ padding: '8px 12px' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteCamp(camp._id)} 
                    className="btn-outline" 
                    style={{ border: '1px solid #dc2626', color: '#dc2626', padding: '8px 12px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal for Camp Create/Edit */}
      {showCampModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div className="glass-panel" style={{ backgroundColor: 'white', padding: '32px', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: 'var(--shadow-float)', overflowY: 'auto', maxHeight: '90vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>{selectedCamp ? 'Edit Donation Camp' : 'Schedule Donation Camp'}</h2>
              <button onClick={() => setShowCampModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleSaveCamp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>Camp Name</label>
                <input type="text" name="name" value={campForm.name} onChange={handleCampFormChange} className="input-base" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>Date</label>
                  <input type="date" name="date" value={campForm.date} onChange={handleCampFormChange} className="input-base" required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>Time</label>
                  <input type="text" name="time" placeholder="e.g. 9:00 AM - 3:00 PM" value={campForm.time} onChange={handleCampFormChange} className="input-base" required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>Venue Address</label>
                <input type="text" name="venue" value={campForm.venue} onChange={handleCampFormChange} className="input-base" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>City</label>
                  <input type="text" name="city" value={campForm.city} onChange={handleCampFormChange} className="input-base" required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>State</label>
                  <input type="text" name="state" value={campForm.state} onChange={handleCampFormChange} className="input-base" required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>Max Participants</label>
                  <input type="number" name="maxParticipants" value={campForm.maxParticipants} onChange={handleCampFormChange} className="input-base" required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>Status</label>
                  <select name="status" value={campForm.status} onChange={handleCampFormChange} className="input-base">
                    <option value="Upcoming">Upcoming</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>Description (optional)</label>
                <textarea name="description" value={campForm.description} onChange={handleCampFormChange} className="input-base" style={{ minHeight: '80px' }}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                <button type="button" onClick={() => setShowCampModal(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary" disabled={savingCamp}>
                  {savingCamp ? 'Saving...' : 'Save Camp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Recording Donation */}
      {showDonationModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div className="glass-panel" style={{ backgroundColor: 'white', padding: '32px', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: 'var(--shadow-float)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Record Donation</h2>
              <button onClick={() => setShowDonationModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Recording donation for camp: <strong>{selectedCamp?.name}</strong>. This updates both the donor profile and the blood inventory automatically.
            </p>

            <form onSubmit={handleRecordDonation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>Select Registered Donor</label>
                <select 
                  name="donorId" 
                  value={donationForm.donorId} 
                  onChange={handleDonationFormChange} 
                  className="input-base"
                  required
                >
                  <option value="">-- Choose Donor --</option>
                  {donors.map(donor => (
                    <option key={donor.id} value={donor.id}>
                      {donor.name} ({donor.bloodGroup} | {donor.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>Blood Group</label>
                  <input 
                    type="text" 
                    name="bloodGroup" 
                    value={donationForm.bloodGroup} 
                    className="input-base" 
                    readOnly 
                    style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>Units Collected</label>
                  <input 
                    type="number" 
                    name="units" 
                    min="1" 
                    max="5"
                    value={donationForm.units} 
                    onChange={handleDonationFormChange} 
                    className="input-base" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: '600' }}>Coordinator Comments (optional)</label>
                <textarea 
                  name="notes" 
                  value={donationForm.notes} 
                  onChange={handleDonationFormChange} 
                  placeholder="Notes about donor health or camp collection details..."
                  className="input-base" 
                  style={{ minHeight: '80px' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                <button type="button" onClick={() => setShowDonationModal(false)} className="btn-outline">Cancel</button>
                <button type="submit" className="btn-primary" disabled={savingDonation}>
                  {savingDonation ? 'Recording...' : 'Submit Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCampsPage;
