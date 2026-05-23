import React, { useState, useEffect } from 'react';
import { Trash2, Search, Filter, Mail, Phone, Calendar, Heart } from 'lucide-react';
import adminService from '../../services/adminService';

const AdminDonorsPage = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('');

  const fetchDonors = async () => {
    try {
      const res = await adminService.getDonors();
      if (res.success) {
        setDonors(res.donors || []);
      }
    } catch (error) {
      console.error('Failed to fetch donors list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete donor ${name}?`)) return;
    try {
      const res = await adminService.deleteDonor(id);
      if (res.success) {
        alert('Donor successfully deleted!');
        await fetchDonors();
      }
    } catch (error) {
      alert('Failed to delete donor.');
    }
  };

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = 
      donor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      donor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.phone.includes(searchQuery);

    const matchesBloodGroup = filterBloodGroup ? donor.bloodGroup === filterBloodGroup : true;

    return matchesSearch && matchesBloodGroup;
  });

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading donors...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div>
        <h1 style={{ color: 'var(--text-main)', fontSize: '1.75rem', marginBottom: '8px' }}>Registered Donors</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage registered donors, search their profile details, and audit records.</p>
      </div>

      {/* Filter and Search controls */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search donors by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base"
            style={{ paddingLeft: '48px' }}
          />
        </div>
        <div style={{ minWidth: '180px' }}>
          <select 
            value={filterBloodGroup} 
            onChange={(e) => setFilterBloodGroup(e.target.value)} 
            className="input-base"
          >
            <option value="">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Donors Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Name</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Blood Group</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Contact info</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Total Donations</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Joined Date</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No donors match the search query parameters.
                  </td>
                </tr>
              ) : (
                filteredDonors.map((donor, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{donor.name}</div>
                    </td>
                    
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontWeight: '700', color: 'var(--primary-red)', backgroundColor: 'var(--secondary-red)',
                        padding: '4px 10px', borderRadius: '8px', fontSize: '0.9rem'
                      }}>
                        {donor.bloodGroup}
                      </span>
                    </td>

                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                          <Mail size={14} /> {donor.email}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                          <Phone size={14} /> {donor.phone}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '16px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                        <Heart size={14} fill="var(--primary-red)" color="var(--primary-red)" />
                        {donor.totalDonations} Donation(s)
                      </span>
                    </td>

                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: '600', padding: '4px 10px', borderRadius: '12px',
                        backgroundColor: donor.isAvailable ? '#d1fae5' : '#f1f5f9',
                        color: donor.isAvailable ? '#059669' : '#64748b'
                      }}>
                        {donor.isAvailable ? 'Active/Available' : 'Unavailable'}
                      </span>
                    </td>

                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /> {new Date(donor.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(donor.id, donor.name)} 
                        className="btn-outline" 
                        style={{ border: '1px solid #dc2626', color: '#dc2626', padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDonorsPage;
