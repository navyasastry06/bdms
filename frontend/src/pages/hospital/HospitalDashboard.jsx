import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, Activity, Plus } from 'lucide-react';
import hospitalService from '../../services/hospitalService';

const HospitalDashboard = () => {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    fulfilledRequests: 0,
    rejectedRequests: 0
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardRes = await hospitalService.getDashboard();
        setStats(dashboardRes.dashboard || stats);

        const requestsRes = await hospitalService.getMyRequests();
        if (requestsRes.success) {
          setRequests(requestsRes.requests || []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading dashboard...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ marginBottom: '8px', color: 'var(--text-main)', fontSize: '1.75rem' }}>Hospital Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage your blood requests and inventory needs.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/hospital/request-blood')}>
          <Plus size={18} />
          New Blood Request
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px'
      }}>
        <StatCard title="Total Requests" value={stats.totalRequests} icon={<FileText size={24} color="#3b82f6" />} />
        <StatCard title="Pending Approval" value={stats.pendingRequests} icon={<Clock size={24} color="#f59e0b" />} />
        <StatCard title="Fulfilled Requests" value={stats.fulfilledRequests} icon={<CheckCircle size={24} color="#10b981" />} />
        <StatCard title="Rejected / Cancelled" value={stats.rejectedRequests} icon={<Activity size={24} color="#e11d48" />} />
      </div>

      {/* Recent Activity */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Recent Requests Status</h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Patient Name</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Blood Group</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Units</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Urgency</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Date</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No requests found.</td></tr>
              ) : (
                requests.slice(0, 5).map((req, idx) => (
                  <TableRow 
                    key={idx} 
                    patient={req.patientName} 
                    group={req.bloodGroup} 
                    units={req.unitsRequired} 
                    urgency={req.urgency} 
                    date={new Date(req.createdAt).toLocaleDateString()} 
                    status={req.status} 
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <h4 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>{title}</h4>
        <p style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>{value}</p>
      </div>
    </div>
  </div>
);

const TableRow = ({ patient, group, units, urgency, date, status }) => {
  const getStatusColor = (s) => {
    switch(s) {
      case 'Pending': return { bg: '#fef3c7', text: '#d97706' };
      case 'Approved': return { bg: '#dbeafe', text: '#2563eb' };
      case 'Fulfilled': return { bg: '#d1fae5', text: '#059669' };
      case 'Rejected': return { bg: '#ffe4e6', text: '#e11d48' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };
  const urgencyStyle = urgency === 'Critical' ? { color: '#e11d48', fontWeight: '600' } : urgency === 'Urgent' ? { color: '#d97706', fontWeight: '600' } : {};
  return (
    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
      <td style={{ padding: '16px', fontWeight: '500' }}>{patient}</td>
      <td style={{ padding: '16px', color: 'var(--primary-red)', fontWeight: '600' }}>{group}</td>
      <td style={{ padding: '16px' }}>{units}</td>
      <td style={{ padding: '16px', ...urgencyStyle }}>{urgency}</td>
      <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{date}</td>
      <td style={{ padding: '16px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: '600', padding: '6px 12px', borderRadius: '20px', backgroundColor: getStatusColor(status).bg, color: getStatusColor(status).text }}>
          {status}
        </span>
      </td>
    </tr>
  );
};

export default HospitalDashboard;
