import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Users, ShieldAlert, DollarSign, Activity, Settings, LogOut, Plus, Trash2,
  ShieldCheck, ShieldOff, UserCheck, RefreshCw, Sliders, Globe, FileText, Search, Clock
} from 'lucide-react';

export const SuperAdminDashboard = () => {
  const {
    admins,
    activityLog,
    platformSettings,
    updatePlatformSettings,
    createAdminAccount,
    toggleAdminStatus,
    deleteAdminAccount,
    vendors,
    deliveryPartners,
    orders,
    logout,
    showToast
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('overview');

  // Admin form state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');

  // Settings form state
  const [commissionRate, setCommissionRate] = useState(platformSettings.commissionRate);
  const [baseDeliveryPay, setBaseDeliveryPay] = useState(platformSettings.baseDeliveryPay);
  const [maintenanceMode, setMaintenanceMode] = useState(platformSettings.maintenanceMode);

  // Search & Filters for Activity Log
  const [logSearch, setLogSearch] = useState('');
  const [logRoleFilter, setLogRoleFilter] = useState('all');

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminName.trim()) {
      showToast('Please fill all fields', 'error');
      return;
    }
    const success = createAdminAccount(newAdminEmail.trim(), newAdminName.trim());
    if (success) {
      setNewAdminEmail('');
      setNewAdminName('');
    }
  };

  const handleUpdateSettings = (e) => {
    e.preventDefault();
    updatePlatformSettings({
      commissionRate: parseInt(commissionRate),
      baseDeliveryPay: parseInt(baseDeliveryPay),
      maintenanceMode
    });
  };

  // Derive metrics
  const totalSales = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.subtotal - o.discount, 0);
  const totalCommission = totalSales * (platformSettings.commissionRate / 100);
  const activeStores = vendors.filter(v => v.registrationStatus === 'approved').length;
  const activeRiders = deliveryPartners.filter(d => d.registrationStatus === 'approved').length;

  const filteredLogs = activityLog.filter(log => {
    const matchesSearch = log.email.toLowerCase().includes(logSearch.toLowerCase()) ||
                         log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
                         log.details.toLowerCase().includes(logSearch.toLowerCase());
    const matchesRole = logRoleFilter === 'all' || log.role === logRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '5rem' }} className="animate-fade-in">
      
      {/* Header bar */}
      <div className="card" style={{
        padding: '1.5rem',
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: 'var(--radius-xl)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <ShieldAlert size={26} color="#fbbf24" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>Super Command Control</h1>
              <p style={{ fontSize: '0.85rem', color: '#c7d2fe', fontWeight: 600, marginTop: '0.1rem' }}>
                Executive Overlord dashboard for `anandabhishek24365@gmail.com`
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn"
            style={{
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        backgroundColor: 'var(--neutral-light)',
        padding: '0.4rem',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--neutral-border)',
        overflowX: 'auto'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'admins', label: 'Manage Admins', icon: Users },
          { id: 'activity', label: 'Activity Logs', icon: FileText },
          { id: 'settings', label: 'System Settings', icon: Settings }
        ].map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`btn btn-sm ${active ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.85rem',
                color: active ? '#fff' : 'var(--neutral-muted)',
                backgroundColor: active ? 'var(--primary-green)' : 'transparent',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <Icon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Metrics */}
          <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {[
              { label: 'Gross Volume Sales', value: `₹${totalSales.toLocaleString('en-IN')}`, icon: DollarSign, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
              { label: 'Platform Commissions', value: `₹${totalCommission.toLocaleString('en-IN')}`, icon: Activity, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
              { label: 'Authorized Admins', value: admins.length, icon: Users, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
              { label: 'Active Store Outlets', value: activeStores, icon: Activity, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
              { label: 'Approved Riders', value: activeRiders, icon: Users, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' }
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: m.bg,
                    color: m.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>{m.label}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--neutral-text)' }}>{m.value}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick lists */}
          <div className="grid-responsive">
            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.85rem', color: 'var(--neutral-text)' }}>Active Store Categories</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {Array.from(new Set(vendors.map(v => v.category))).map(cat => (
                  <span key={cat} className="badge badge-pending" style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.85rem', color: 'var(--neutral-text)' }}>Platform Settings Snaps</h3>
              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--neutral-muted)' }}>Admin Commission Rate:</span>
                  <strong style={{ color: 'var(--primary-green)' }}>{platformSettings.commissionRate}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--neutral-muted)' }}>Base Payout per delivery:</span>
                  <strong style={{ color: 'var(--primary-green)' }}>₹{platformSettings.baseDeliveryPay}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--neutral-muted)' }}>System Maintenance:</span>
                  <strong style={{ color: platformSettings.maintenanceMode ? '#ef4444' : '#10b981' }}>
                    {platformSettings.maintenanceMode ? 'Active' : 'Offline'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: MANAGE ADMIN ACCOUNTS */}
      {activeTab === 'admins' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Create Admin Account Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={18} style={{ color: 'var(--primary-green)' }} />
              <span>Create Authorized Admin Account</span>
            </h3>
            <form onSubmit={handleCreateAdmin} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Admin Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. John Doe"
                  value={newAdminName}
                  onChange={e => setNewAdminName(e.target.value)}
                  className="input-field"
                  style={{ height: '38px', fontSize: '0.82rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Admin Email (Ends with @gmail.com and contains "24365")</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john24365@gmail.com"
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  className="input-field"
                  style={{ height: '38px', fontSize: '0.82rem' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '38px', fontWeight: 700, fontSize: '0.82rem' }}>
                Create Account
              </button>
            </form>
            <p style={{ fontSize: '0.68rem', color: 'var(--neutral-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
              ⚠️ Restriction enforcement: Email MUST end with `24365@gmail.com` to be authorized as an Admin.
            </p>
          </div>

          {/* Admin List */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.15rem' }}>Authorized System Admins ({admins.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {admins.map((adm) => (
                <div key={adm.email} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--neutral-border)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--neutral-light)',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{adm.name}</span>
                      <span className={`badge ${adm.status === 'active' ? 'badge-delivered' : 'badge-pending'}`} style={{ fontSize: '0.65rem' }}>
                        {adm.status}
                      </span>
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', fontWeight: 600, marginTop: '0.1rem' }}>
                      Email: {adm.email} • Created: {new Date(adm.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => toggleAdminStatus(adm.email)}
                      className="btn btn-sm btn-secondary"
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: adm.status === 'active' ? '#d97706' : '#059669',
                        borderColor: adm.status === 'active' ? '#fde68a' : '#bbf7d0'
                      }}
                    >
                      {adm.status === 'active' ? <ShieldOff size={12} /> : <ShieldCheck size={12} />}
                      <span style={{ marginLeft: '0.2rem' }}>{adm.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                    </button>
                    
                    <button
                      onClick={() => deleteAdminAccount(adm.email)}
                      className="btn btn-sm btn-secondary"
                      style={{ color: '#ef4444', borderColor: '#fca5a5', padding: '0.28rem 0.5rem' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SYSTEM ACTIVITY LOGS */}
      {activeTab === 'activity' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            {/* Filter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginRight: 'auto' }}>System Audit Trail</h3>
              
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-muted)' }} />
                <input
                  type="text"
                  placeholder="Search logs…"
                  value={logSearch}
                  onChange={e => setLogSearch(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2rem', paddingRight: '0.75rem', fontSize: '0.8rem', height: '36px', width: '180px' }}
                />
              </div>

              {/* Role Filter */}
              <select
                value={logRoleFilter}
                onChange={e => setLogRoleFilter(e.target.value)}
                className="input-field"
                style={{ height: '36px', width: '130px', fontSize: '0.8rem', padding: '0 0.5rem' }}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            {/* Log Feed */}
            {filteredLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-muted)' }}>
                <Clock size={32} style={{ color: 'var(--neutral-border)', marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem' }}>No activity logged matching the filters.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '450px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {filteredLogs.map((log) => (
                  <div key={log.id} style={{
                    padding: '0.75rem',
                    border: '1px solid var(--neutral-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--neutral-white)',
                    fontSize: '0.8rem',
                    borderLeft: `3.5px solid ${log.role === 'superadmin' ? '#fbbf24' : '#8b5cf6'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--neutral-text)' }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ color: 'var(--neutral-text)', marginBottom: '0.15rem' }}>{log.details}</p>
                    <div style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>
                      Operator: <span style={{ color: 'var(--neutral-text)' }}>{log.email}</span> ({log.role.toUpperCase()})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: SYSTEM SETTINGS EDITOR */}
      {activeTab === 'settings' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sliders size={18} style={{ color: 'var(--primary-green)' }} />
              <span>Modify Global System Parameters</span>
            </h3>
            
            <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Commission Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Platform Commission Rate (%)</label>
                  <span style={{ fontWeight: 800, color: 'var(--accent-orange)' }}>{commissionRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={commissionRate}
                  onChange={e => setCommissionRate(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--primary-green)' }}
                />
                <span style={{ fontSize: '0.68rem', color: 'var(--neutral-muted)' }}>
                  Applies to all order subtotals on store payouts. Default is 10%.
                </span>
              </div>

              {/* Delivery Base Pay */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Base Rider Delivery Pay (₹)
                </label>
                <input
                  type="number"
                  min="20"
                  max="150"
                  value={baseDeliveryPay}
                  onChange={e => setBaseDeliveryPay(e.target.value)}
                  className="input-field"
                  style={{ maxWidth: '180px' }}
                />
                <span style={{ fontSize: '0.68rem', color: 'var(--neutral-muted)', display: 'block', marginTop: '0.25rem' }}>
                  Fixed base rate paid to delivery riders per accepted job (excluding customer delivery fees).
                </span>
              </div>

              {/* Maintenance Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--neutral-border)', padding: '0.75rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--neutral-light)' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>Maintenance Lockdown Mode</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)' }}>
                    Forces a maintenance screen across Customer/Vendor dashboards.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(prev => !prev)}
                  className={`btn btn-sm ${maintenanceMode ? 'btn-orange' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', fontWeight: 700 }}
                >
                  {maintenanceMode ? 'Lockdown Active' : 'Lockdown Off'}
                </button>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', fontWeight: 700, fontSize: '0.9rem', width: '100%', marginTop: '0.5rem' }}>
                Save System Configuration
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
