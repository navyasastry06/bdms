import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Calendar, Award, CheckCircle } from 'lucide-react';
import donorService from '../../services/donorService';
import useAuth from '../../hooks/useAuth';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDonations: 0,
    bloodGroup: 'Not Sett',
    lastDonationDate: null,
    nextEligibleDate: null,
    isAvailable: true
  });
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardRes = await donorService.getDashboard();
        if (dashboardRes.success) {
          setStats(dashboardRes.dashboard);
        }

        const campsRes = await donorService.getUpcomingCamps();
        if (campsRes.success) {
          setCamps(campsRes.camps);
        }
      } catch (error) {
        console.error("Failed to fetch donor data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isEligibleToday = !stats.nextEligibleDate || new Date(stats.nextEligibleDate) <= new Date();

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading donor dashboard...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ marginBottom: '8px', color: 'var(--text-main)', fontSize: '1.75rem' }}>Donor Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Track your life-saving impact.</p>
        </div>
      </div>

      {/* Main Stats Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) minmax(240px, 1fr)', gap: '24px' }}>
        
        {/* Status Card */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.05) 0%, rgba(255,255,255,0.8) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Your Donation Status</h2>
              {isEligibleToday ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '600' }}>
                  <CheckCircle size={20} />
                  <span>You are eligible to donate!</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: '600' }}>
                  <Calendar size={20} />
                  <span>Eligible on {new Date(stats.nextEligibleDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--secondary-red)', color: 'var(--primary-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '700', border: '4px solid white', boxShadow: 'var(--shadow-soft)' }}>
              {stats.bloodGroup}
            </div>
          </div>
          
          <div style={{ marginTop: '32px' }}>
            <button className="btn-primary" onClick={() => navigate('/donor/camps')}>Find a Camp Near Me</button>
          </div>
        </div>

        {/* Stats Mini Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '12px', color: '#d97706' }}>
              <Award size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Donations</p>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{stats.totalDonations}</h3>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div style={{ background: '#dbeafe', padding: '12px', borderRadius: '12px', color: '#2563eb' }}>
              <Droplet size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Last Donated</p>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{stats.lastDonationDate ? new Date(stats.lastDonationDate).toLocaleDateString() : 'Never'}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Camps Suggestion */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Featured Camps Near You</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {camps.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No upcoming camps at the moment.</p> : camps.slice(0, 3).map((camp, idx) => (
            <CampCard 
              key={idx}
              title={camp.name}
              date={new Date(camp.date).toLocaleDateString()}
              time={camp.time}
              location={camp.venue}
              onRegister={() => navigate('/donor/camps')}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

const CampCard = ({ title, date, time, location, onRegister }) => (
  <div style={{ padding: '20px', border: '1px solid var(--border-light)', borderRadius: '12px', backgroundColor: 'var(--bg-card-solid)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary-red)' }}>{title}</h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calendar size={16} /> <span>{date} ({time})</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <Droplet size={16} style={{ marginTop: '2px' }} /> <span>{location}</span>
      </div>
    </div>
    <button className="btn-outline" style={{ marginTop: '8px', width: '100%' }} onClick={onRegister}>Register Now</button>
  </div>
);

export default DonorDashboard;
