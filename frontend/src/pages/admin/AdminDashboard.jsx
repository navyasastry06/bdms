import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Droplet, Calendar, TrendingUp } from 'lucide-react';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalHospitals: 0,
    pendingRequests: 0,
    inventory: []
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardRes = await adminService.getDashboard();
        if (dashboardRes.success) {
          setStats(dashboardRes.dashboard);
        }
        
        const requestsRes = await adminService.getRequests();
        if (requestsRes.success) {
          setRequests(requestsRes.requests);
        }
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalUnitsAvailable = stats.inventory?.reduce((acc, curr) => acc + curr.unitsAvailable, 0) || 0;

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading admin dashboard...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: '8px', color: 'var(--text-main)', fontSize: '1.75rem' }}>Overview</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>System-wide statistics and recent activity.</p>
        </div>
        <button className="btn-outline">
          <TrendingUp size={18} />
          View Full Report
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatCard title="Total Donors" value={stats.totalDonors} icon={<Users size={24} color="#e11d48" />} />
        <StatCard title="Registered Hospitals" value={stats.totalHospitals} icon={<Droplet size={24} color="#3b82f6" />} />
        <StatCard title="Pending Requests" value={stats.pendingRequests} icon={<FileText size={24} color="#f59e0b" />} />
        <StatCard title="Inventory Units" value={totalUnitsAvailable} icon={<Calendar size={24} color="#10b981" />} />
      </div>

      {/* Quick Access Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Recent Blood Requests</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {requests.length === 0 ? <p>No recent requests.</p> : requests.slice(0, 3).map((req, idx) => (
              <RequestRow key={idx} hospital={req.hospitalName} group={req.bloodGroup} urgency={req.urgency} status={req.status} />
            ))}
          </div>
          <button style={{ ...styles.textBtn, marginTop: '20px' }}>View all requests &rarr;</button>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Inventory Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats.inventory?.length === 0 ? <p>No inventory data.</p> : stats.inventory?.slice(0, 4).map((inv, idx) => {
               // Calculate a dummy percentage for display based on max 100 units expected
               const percentage = Math.min((inv.unitsAvailable / 100) * 100, 100);
               const colors = ['#10b981', '#f59e0b', '#e11d48', '#3b82f6'];
               return <InventoryBar key={idx} group={inv.bloodGroup} percentage={percentage} units={inv.unitsAvailable} color={colors[idx % colors.length]} />
            })}
          </div>
          <button style={{ ...styles.textBtn, marginTop: '20px' }}>Manage inventory &rarr;</button>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(225, 29, 72, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
    </div>
    <div>
      <h4 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>{title}</h4>
      <p style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)' }}>{value}</p>
    </div>
  </div>
);

const RequestRow = ({ hospital, group, urgency, status }) => {
  const getStatusColor = (s) => {
    switch(s) {
      case 'Pending': return '#f59e0b';
      case 'Approved': return '#3b82f6';
      case 'Fulfilled': return '#10b981';
      default: return '#64748b';
    }
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '8px' }}>
      <div>
        <h5 style={{ margin: 0, fontSize: '0.95rem' }}>{hospital}</h5>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Requested: {group} ({urgency})</span>
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', backgroundColor: `${getStatusColor(status)}20`, color: getStatusColor(status) }}>
        {status}
      </span>
    </div>
  );
};

const InventoryBar = ({ group, percentage, units, color }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
      <span>{group}</span>
      <span style={{ color: 'var(--text-muted)' }}>{units} units</span>
    </div>
    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: color, borderRadius: '4px' }}></div>
    </div>
  </div>
);

const styles = {
  textBtn: { background: 'none', border: 'none', color: 'var(--primary-red)', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', padding: 0 }
};

export default AdminDashboard;
