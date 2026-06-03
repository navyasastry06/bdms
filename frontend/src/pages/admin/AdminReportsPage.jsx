import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, Heart, PieChart } from 'lucide-react';
import adminService from '../../services/adminService';

const AdminReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await adminService.getReports();
        if (res.success) {
          setReports(res.reports);
        }
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading reports data...</div>;
  if (!reports) return <div style={{ padding: '50px', textAlign: 'center' }}>Failed to retrieve reports.</div>;

  const maxDonationUnits = Math.max(...(reports.donationsByGroup || []).map(d => d.total), 1);
  const maxMonthlyUnits = Math.max(...(reports.monthlyDonations || []).map(m => m.units), 1);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div>
        <h1 style={{ color: 'var(--text-main)', fontSize: '1.75rem', marginBottom: '8px' }}>Reports & Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>Visualize donations by group, request metrics, monthly trends, and top donors.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Blood Group Share Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={18} style={{ color: 'var(--primary-red)' }} /> Donations by Blood Group (Units)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(reports.donationsByGroup || []).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No donation data recorded yet.</p>
            ) : (
              reports.donationsByGroup.map((group, idx) => {
                const percentage = (group.total / maxDonationUnits) * 100;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', fontWeight: '700', color: 'var(--primary-red)' }}>{group._id}</div>
                    <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', height: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                      <div style={{
                        width: `${percentage}%`,
                        backgroundColor: 'var(--primary-red)',
                        background: 'linear-gradient(90deg, var(--primary-red) 0%, var(--primary-red-hover) 100%)',
                        height: '100%',
                        borderRadius: '8px',
                        transition: 'width 1s ease'
                      }}></div>
                    </div>
                    <div style={{ width: '60px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '600' }}>{group.total} Units</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Requests by Status */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} style={{ color: '#2563eb' }} /> Request Approvals & Status Metrics
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(reports.requestsByStatus || []).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No requests recorded yet.</p>
            ) : (
              reports.requestsByStatus.map((status, idx) => {
                const totalCount = reports.requestsByStatus.reduce((acc, curr) => acc + curr.count, 0);
                const percentage = (status.count / totalCount) * 100;
                
                const getStatusColor = (name) => {
                  if (name === 'Pending') return '#f59e0b';
                  if (name === 'Approved') return '#2563eb';
                  if (name === 'Fulfilled') return '#10b981';
                  return '#e11d48'; // Rejected
                };

                const color = getStatusColor(status._id);

                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '80px', fontSize: '0.85rem', fontWeight: '600' }}>{status._id}</div>
                    <div style={{ flex: 1, backgroundColor: 'var(--bg-main)', height: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                      <div style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                        height: '100%',
                        borderRadius: '8px',
                        transition: 'width 1s ease'
                      }}></div>
                    </div>
                    <div style={{ width: '80px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '600' }}>
                      {status.count} ({Math.round(percentage)}%)
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Monthly Donation Trend */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} style={{ color: '#10b981' }} /> Monthly Donation Trend (Units Collected)
        </h3>
        
        {(reports.monthlyDonations || []).length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px' }}>No monthly data found for the last 6 months.</p>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '240px', paddingTop: '20px', borderBottom: '2px solid var(--border-light)' }}>
            {reports.monthlyDonations.map((m, idx) => {
              const heightPct = (m.units / maxMonthlyUnits) * 80; // scale to max 80% height
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>{m.units} u</span>
                  <div style={{
                    width: '32px',
                    height: `${Math.max(heightPct, 5)}px`,
                    background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 1s ease'
                  }}></div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>{m._id}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leaderboard - Top Donors */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} style={{ color: 'var(--primary-red)' }} /> Top Donors Leaderboard
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Rank</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Donor Name</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Email Address</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', textAlign: 'center' }}>Donations Logged</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', textAlign: 'right' }}>Total Units Collected</th>
              </tr>
            </thead>
            <tbody>
              {(reports.topDonors || []).length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No donation records found.
                  </td>
                </tr>
              ) : (
                reports.topDonors.map((donor, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '16px', fontWeight: '700', color: idx === 0 ? '#e11d48' : idx === 1 ? '#d97706' : 'var(--text-muted)' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: '16px', fontWeight: '600' }}>{donor.name}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{donor.email}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>{donor.totalDonations}</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: 'var(--primary-red)' }}>{donor.totalUnits} Units</td>
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

export default AdminReportsPage;
