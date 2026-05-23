import React, { useState, useEffect } from 'react';
import { Award, Calendar, Heart, MapPin } from 'lucide-react';
import donorService from '../../services/donorService';

const DonationHistoryPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await donorService.getHistory();
        if (res.success) {
          setDonations(res.donations || []);
        }
      } catch (error) {
        console.error('Failed to load donation history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading history...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ color: 'var(--text-main)', fontSize: '1.75rem', marginBottom: '8px' }}>Donation History</h1>
        <p style={{ color: 'var(--text-muted)' }}>Thank you for your life-saving contributions. View all your recorded donations here.</p>
      </div>

      {donations.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Heart size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
          <h3>No donations recorded yet</h3>
          <p style={{ marginTop: '8px' }}>Your donation history will appear here once an admin records your blood donations.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {donations.map((don, idx) => (
            <div key={idx} className="glass-panel hover-red-outline" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Badge of units */}
                <div style={{
                  width: '64px', height: '64px', borderRadius: '16px',
                  backgroundColor: 'var(--secondary-red)', color: 'var(--primary-red)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border-light)'
                }}>
                  <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{don.units}</span>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Units</span>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-main)' }}>{don.bloodGroup} Blood Donation</h3>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> {new Date(don.donationDate).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {don.location}
                    </span>
                    {don.campId && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-red)', fontWeight: '600' }}>
                        <Award size={14} /> Camp: {don.campId.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {don.notes && (
                <div style={{
                  backgroundColor: 'var(--bg-main)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  maxWidth: '300px',
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-muted)'
                }}>
                  <strong>Notes:</strong> {don.notes}
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationHistoryPage;
