import React, { useState, useEffect } from 'react';
import { Search, ListFilter, ClipboardList, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import hospitalService from '../../services/hospitalService';

const HospitalRequestsPage = () => {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'search'
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [searchGroup, setSearchGroup] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await hospitalService.getMyRequests();
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  const fetchInventory = async (group = '') => {
    try {
      const res = await hospitalService.searchBlood(group);
      if (res.success) {
        setInventory(res.inventory || []);
      }
    } catch (error) {
      console.error('Failed to load inventory stock:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchRequests(), fetchInventory()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetchInventory(searchGroup);
    setLoading(false);
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Pending': return { bg: '#fef3c7', text: '#d97706', icon: <Clock size={14} /> };
      case 'Approved': return { bg: '#dbeafe', text: '#2563eb', icon: <CheckCircle size={14} /> };
      case 'Fulfilled': return { bg: '#d1fae5', text: '#059669', icon: <CheckCircle size={14} /> };
      case 'Rejected': return { bg: '#ffe4e6', text: '#e11d48', icon: <AlertCircle size={14} /> };
      default: return { bg: '#f1f5f9', text: '#475569', icon: null };
    }
  };

  if (loading && requests.length === 0 && inventory.length === 0) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading hospital requests...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: 'var(--text-main)', fontSize: '1.75rem', marginBottom: '8px' }}>Requests & Stock Search</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track emergency requests and search real-time blood bank availability.</p>
        </div>

        {/* Tab Buttons */}
        <div className="glass-panel" style={{ display: 'flex', padding: '6px', borderRadius: '12px' }}>
          <button 
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
              backgroundColor: activeTab === 'requests' ? 'var(--primary-red)' : 'transparent',
              color: activeTab === 'requests' ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
            onClick={() => setActiveTab('requests')}
          >
            My Requests
          </button>
          <button 
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
              backgroundColor: activeTab === 'search' ? 'var(--primary-red)' : 'transparent',
              color: activeTab === 'search' ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
            onClick={() => setActiveTab('search')}
          >
            Search Blood Stock
          </button>
        </div>
      </div>

      {activeTab === 'requests' ? (
        /* Requests History Tab */
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={20} /> Request Audit Log
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Patient Name</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Blood Group</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Units Needed</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Urgency</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Request Date</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Admin Comments</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No blood requests created yet.
                    </td>
                  </tr>
                ) : (
                  requests.map((req, idx) => {
                    const statusConfig = getStatusStyle(req.status);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '16px', fontWeight: '500' }}>{req.patientName}</td>
                        <td style={{ padding: '16px', color: 'var(--primary-red)', fontWeight: '600' }}>{req.bloodGroup}</td>
                        <td style={{ padding: '16px' }}>{req.unitsRequired}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            color: req.urgency === 'Critical' ? '#e11d48' : req.urgency === 'Urgent' ? '#d97706' : 'var(--text-muted)',
                            fontWeight: '600'
                          }}>{req.urgency}</span>
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            fontSize: '0.8rem', fontWeight: '600', padding: '6px 12px', borderRadius: '20px',
                            backgroundColor: statusConfig.bg, color: statusConfig.text
                          }}>
                            {statusConfig.icon}
                            {req.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {req.notes || <span style={{ fontStyle: 'italic' }}>None</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Blood Search Tab */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Search Form Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600' }}>Filter Blood Group</label>
                <select 
                  value={searchGroup} 
                  onChange={(e) => setSearchGroup(e.target.value)} 
                  className="input-base"
                >
                  <option value="">All Blood Groups</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary">
                <Search size={18} />
                Search Stock
              </button>
            </form>
          </div>

          {/* Results Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {inventory.length === 0 ? (
              <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', gridColumn: '1/-1', color: 'var(--text-muted)' }}>
                No blood inventory found.
              </div>
            ) : (
              inventory.map((inv, idx) => {
                const colors = ['#e11d48', '#3b82f6', '#10b981', '#f59e0b'];
                const isLow = inv.unitsAvailable <= (inv.thresholdLevel || 10);
                return (
                  <div key={idx} className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        backgroundColor: 'var(--secondary-red)', color: 'var(--primary-red)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem', fontWeight: '700'
                      }}>
                        {inv.bloodGroup}
                      </div>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: '600', padding: '4px 10px', borderRadius: '12px',
                        backgroundColor: isLow ? '#ffe4e6' : '#d1fae5',
                        color: isLow ? '#e11d48' : '#059669'
                      }}>
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>

                    <div style={{ marginTop: '24px' }}>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Units Available</p>
                      <h2 style={{ margin: '4px 0 0', fontSize: '2rem' }}>{inv.unitsAvailable}</h2>
                    </div>

                    <p style={{ margin: '16px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Last Updated: {new Date(inv.lastUpdated || inv.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default HospitalRequestsPage;
