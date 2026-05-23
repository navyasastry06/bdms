import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle, Check, Save } from 'lucide-react';
import adminService from '../../services/adminService';

const AdminInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null); // stores active edit blood group row
  const [editForm, setEditForm] = useState({ unitsAvailable: '', thresholdLevel: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchInventory = async () => {
    try {
      const res = await adminService.getInventory();
      if (res.success) {
        setInventory(res.inventory || []);
      }
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleEditClick = (item) => {
    setEditingItem(item.bloodGroup);
    setEditForm({
      unitsAvailable: item.unitsAvailable,
      thresholdLevel: item.thresholdLevel || 10
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleSave = async (bloodGroup) => {
    setSaving(true);
    setMessage('');
    try {
      const res = await adminService.updateInventory({
        bloodGroup,
        unitsAvailable: editForm.unitsAvailable,
        thresholdLevel: editForm.thresholdLevel
      });
      if (res.success) {
        setMessage(`Successfully updated stock for ${bloodGroup}!`);
        setEditingItem(null);
        await fetchInventory();
      }
    } catch (error) {
      alert('Failed to update inventory.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading inventory...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'var(--text-main)', fontSize: '1.75rem', marginBottom: '8px' }}>Blood Stock Inventory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage stock levels and low-stock alerts threshold parameters.</p>
        </div>
        <button onClick={fetchInventory} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {message && (
        <div style={{
          padding: '16px', borderRadius: '8px', backgroundColor: '#d1fae5', color: '#065f46',
          border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600'
        }}>
          <Check size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Stock</h4>
          <h2 style={{ fontSize: '2.25rem', marginTop: '8px' }}>
            {inventory.reduce((acc, curr) => acc + curr.unitsAvailable, 0)} Units
          </h2>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Low-Stock Groups</h4>
          <h2 style={{ fontSize: '2.25rem', marginTop: '8px', color: 'var(--primary-red)' }}>
            {inventory.filter(item => item.unitsAvailable <= (item.thresholdLevel || 10)).length}
          </h2>
        </div>
      </div>

      {/* Inventory table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Blood Group</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Units Available</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Alert Threshold</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Last Updated</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, idx) => {
                const threshold = item.thresholdLevel || 10;
                const isLow = item.unitsAvailable <= threshold;
                const isEditing = editingItem === item.bloodGroup;

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: isLow ? 'rgba(225, 29, 72, 0.02)' : 'transparent' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        backgroundColor: 'var(--secondary-red)', color: 'var(--primary-red)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700'
                      }}>
                        {item.bloodGroup}
                      </div>
                    </td>
                    
                    <td style={{ padding: '16px' }}>
                      {isEditing ? (
                        <input 
                          type="number" 
                          name="unitsAvailable" 
                          value={editForm.unitsAvailable} 
                          onChange={handleEditFormChange} 
                          className="input-base" 
                          style={{ maxWidth: '100px', padding: '6px 10px' }} 
                        />
                      ) : (
                        <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>{item.unitsAvailable} Units</span>
                      )}
                    </td>

                    <td style={{ padding: '16px' }}>
                      {isEditing ? (
                        <input 
                          type="number" 
                          name="thresholdLevel" 
                          value={editForm.thresholdLevel} 
                          onChange={handleEditFormChange} 
                          className="input-base" 
                          style={{ maxWidth: '100px', padding: '6px 10px' }} 
                        />
                      ) : (
                        <span>{threshold} Units</span>
                      )}
                    </td>

                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        fontSize: '0.8rem', fontWeight: '600', padding: '4px 10px', borderRadius: '12px',
                        backgroundColor: isLow ? '#ffe4e6' : '#d1fae5',
                        color: isLow ? '#e11d48' : '#059669'
                      }}>
                        {isLow ? <AlertTriangle size={14} /> : null}
                        {isLow ? 'Low Stock' : 'Good Stock'}
                      </span>
                    </td>

                    <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {new Date(item.lastUpdated || item.updatedAt).toLocaleString()}
                    </td>

                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleSave(item.bloodGroup)} 
                            disabled={saving} 
                            className="btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#10b981' }}
                          >
                            <Save size={14} /> Save
                          </button>
                          <button 
                            onClick={() => setEditingItem(null)} 
                            className="btn-outline" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleEditClick(item)} 
                          className="btn-outline" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          Modify
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminInventoryPage;
