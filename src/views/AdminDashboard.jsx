import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { AnalyticsChart } from '../components/AnalyticsChart';
import {
  ShieldAlert,
  Users,
  Store,
  Ticket,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  Percent,
  Plus,
  Trash2,
  Check,
  X,
  AlertCircle,
  LogOut
} from 'lucide-react';

export const AdminDashboard = () => {
  const {
    vendors,
    orders,
    coupons,
    addCoupon,
    deleteCoupon,
    approveVendor,
    rejectVendor,
    deliveryPartners,
    adminAddVendor,
    adminAddRider,
    logout
  } = useContext(AppContext);

  // Active sub-tab
  // 'approvals' | 'coupons' | 'revenue' | 'delivery'
  const [activeTab, setActiveTab] = useState('approvals');

  // Coupon Form State
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState('percentage');
  const [couponValue, setCouponValue] = useState('');
  const [couponMinOrder, setCouponMinOrder] = useState('');
  const [couponMaxDiscount, setCouponMaxDiscount] = useState('');
  const [couponDesc, setCouponDesc] = useState('');

  // Quick Add forms states
  const [vName, setVName] = useState('');
  const [vCategory, setVCategory] = useState('grocery');
  const [vAddress, setVAddress] = useState('');
  const [vMinOrder, setVMinOrder] = useState('99');
  const [vImage, setVImage] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60');

  const [rName, setRName] = useState('');
  const [rPhone, setRPhone] = useState('');

  // Derived metrics
  const pendingVendors = vendors.filter((v) => !v.isApproved);
  const activeVendors = vendors.filter((v) => v.isApproved);

  const totalSales = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.subtotal - o.discount, 0);
  const commissionEarned = totalSales * 0.1; // 10% platform commission cut
  const totalRidersOnline = deliveryPartners.filter(r => r.status === 'online').length;

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!couponCode || !couponValue) return;

    addCoupon({
      code: couponCode.toUpperCase(),
      discountType: couponType,
      discountValue: parseFloat(couponValue),
      maxDiscount: parseFloat(couponMaxDiscount) || 100,
      minOrder: parseFloat(couponMinOrder) || 0,
      description: couponDesc || `${couponValue}% off discount`
    });

    // Reset Form
    setCouponCode('');
    setCouponValue('');
    setCouponMinOrder('');
    setCouponMaxDiscount('');
    setCouponDesc('');
  };

  return (
    <div style={{ paddingBottom: '5rem' }} className="animate-fade-in">
      {/* Header Panel */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/logo.jpg"
            alt="DesiCart"
            style={{
              width: '45px',
              height: '45px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--neutral-border)'
            }}
          />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Command Portal</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>
              Oversee registrations, payouts, campaigns, and delivery metrics.
            </p>
          </div>
        </div>

        {/* Admin Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`btn btn-sm ${activeTab === 'approvals' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Approvals ({pendingVendors.length})
          </button>
          <button
            onClick={() => setActiveTab('quick-add')}
            className={`btn btn-sm ${activeTab === 'quick-add' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Add Riders/Vendors
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`btn btn-sm ${activeTab === 'coupons' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Campaign Coupons ({coupons.length})
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`btn btn-sm ${activeTab === 'revenue' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Platform Revenue
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`btn btn-sm ${activeTab === 'delivery' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Riders ({deliveryPartners.length})
          </button>
          
          <button
            onClick={logout}
            className="btn btn-sm btn-secondary"
            style={{ borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
          >
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Overview Stats (Enabled Clickable Shortcuts) */}
      <div className="grid-responsive" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        <div
          className="card card-interactive"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', cursor: 'pointer' }}
          onClick={() => setActiveTab('revenue')}
        >
          <div style={{ padding: '0.6rem', backgroundColor: 'var(--primary-green-light)', borderRadius: 'var(--radius-lg)', color: 'var(--primary-green)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>Platform Commissions (10%)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{commissionEarned.toFixed(2)}</div>
          </div>
        </div>

        <div
          className="card card-interactive"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', cursor: 'pointer' }}
          onClick={() => setActiveTab('revenue')}
        >
          <div style={{ padding: '0.6rem', backgroundColor: 'var(--accent-orange-light)', borderRadius: 'var(--radius-lg)', color: 'var(--accent-orange)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>Gross Total Sales</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{totalSales.toFixed(2)}</div>
          </div>
        </div>

        <div
          className="card card-interactive"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', cursor: 'pointer' }}
          onClick={() => setActiveTab('approvals')}
        >
          <div style={{ padding: '0.6rem', backgroundColor: '#e0f7fa', borderRadius: 'var(--radius-lg)', color: '#00acc1' }}>
            <Store size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>Approved Outlets</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{activeVendors.length} active</div>
          </div>
        </div>

        <div
          className="card card-interactive"
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', cursor: 'pointer' }}
          onClick={() => setActiveTab('delivery')}
        >
          <div style={{ padding: '0.6rem', backgroundColor: '#f3e8ff', borderRadius: 'var(--radius-lg)', color: '#7c3aed' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>Riders Status</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{totalRidersOnline} Online</div>
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: VENDOR REGISTRATION APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} style={{ color: 'var(--accent-orange)' }} />
            <span>Pending Registration Approvals ({pendingVendors.length})</span>
          </h3>

          {pendingVendors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-muted)' }}>
              <Check size={32} style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.85rem' }}>All vendor applications are processed and up-to-date.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    border: '1px solid var(--neutral-border)',
                    borderRadius: 'var(--radius-lg)',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{vendor.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>
                      Location: {vendor.address} • Category: <strong style={{ textTransform: 'capitalize' }}>{vendor.category}</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => rejectVendor(vendor.id)}
                      className="btn btn-sm btn-secondary"
                      style={{ color: '#ef4444', borderColor: '#ef4444' }}
                    >
                      <X size={14} /> Reject
                    </button>
                    <button
                      onClick={() => approveVendor(vendor.id)}
                      className="btn btn-sm btn-primary"
                    >
                      <Check size={14} /> Approve Store
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW: QUICK ADD VENDORS / RIDERS */}
      {activeTab === 'quick-add' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }} className="animate-fade-in">
          {/* Add Vendor Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-green)' }}>
              <Store size={18} />
              <span>Add New Store / Restaurant</span>
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if(!vName) return;
              adminAddVendor({
                name: vName,
                category: vCategory,
                address: vAddress || 'New Market, Delhi',
                image: vImage,
                minOrder: parseFloat(vMinOrder) || 99
              });
              setVName('');
              setVAddress('');
              setVMinOrder('99');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Store Name</label>
                <input type="text" required value={vName} onChange={(e) => setVName(e.target.value)} className="input-field" placeholder="e.g. Punjabi Tadka" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Category</label>
                  <select value={vCategory} onChange={(e) => setVCategory(e.target.value)} className="input-field" style={{ padding: '0.7rem' }}>
                    <option value="grocery">Grocery & Staples</option>
                    <option value="food">Restaurant & Food</option>
                    <option value="fruits-veg">Fruits & Veg</option>
                    <option value="medicine">Medicines & Health</option>
                    <option value="essentials">Daily Essentials</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Min Order (₹)</label>
                  <input type="number" value={vMinOrder} onChange={(e) => setVMinOrder(e.target.value)} className="input-field" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Store Address</label>
                <input type="text" value={vAddress} onChange={(e) => setVAddress(e.target.value)} className="input-field" placeholder="e.g. Sector 18, Noida" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Image URL</label>
                <input type="text" value={vImage} onChange={(e) => setVImage(e.target.value)} className="input-field" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                <Plus size={16} /> Create & Approve Store
              </button>
            </form>
          </div>

          {/* Add Rider Form */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-orange)' }}>
              <Users size={18} />
              <span>Add New Delivery Rider</span>
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if(!rName) return;
              adminAddRider({
                name: rName,
                phone: rPhone || '+91 99999 88888'
              });
              setRName('');
              setRPhone('');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Rider Full Name</label>
                <input type="text" required value={rName} onChange={(e) => setRName(e.target.value)} className="input-field" placeholder="e.g. Ramesh Kumar" />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Contact Number</label>
                <input type="text" value={rPhone} onChange={(e) => setRPhone(e.target.value)} className="input-field" placeholder="e.g. +91 99887 76655" />
              </div>
              <button type="submit" className="btn btn-orange" style={{ marginTop: '0.5rem' }}>
                <Plus size={16} /> Create Active Rider
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: CAMPAIGN COUPONS BUILDER */}
      {activeTab === 'coupons' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Create coupon form */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ticket size={18} style={{ color: 'var(--primary-green)' }} />
              <span>Create Campaign Coupon Code</span>
            </h3>

            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Promo Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MEGA50"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Discount Type</label>
                  <select value={couponType} onChange={(e) => setCouponType(e.target.value)} className="input-field" style={{ padding: '0.7rem' }}>
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="flat">Flat Rupees Off (₹)</option>
                    <option value="free-delivery">Free Delivery</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Discount Value</label>
                  <input
                    type="number"
                    required
                    disabled={couponType === 'free-delivery'}
                    placeholder="Value (e.g. 50)"
                    value={couponValue}
                    onChange={(e) => setCouponValue(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Min Order (₹)</label>
                  <input
                    type="number"
                    placeholder="Min Order"
                    value={couponMinOrder}
                    onChange={(e) => setCouponMinOrder(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Max Cap (₹)</label>
                  <input
                    type="number"
                    placeholder="Max Cap"
                    value={couponMaxDiscount}
                    onChange={(e) => setCouponMaxDiscount(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Description Text</label>
                <input
                  type="text"
                  placeholder="e.g. 50% discount up to ₹100 on orders above ₹200"
                  value={couponDesc}
                  onChange={(e) => setCouponDesc(e.target.value)}
                  className="input-field"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                <Plus size={16} /> Create Coupon
              </button>
            </form>
          </div>

          {/* Active coupon list */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Active Campaign Coupons</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {coupons.map((c) => (
                <div
                  key={c.code}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    border: '1px solid var(--neutral-border)',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          backgroundColor: 'var(--primary-green-light)',
                          color: 'var(--primary-green)',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px dashed var(--primary-green)'
                        }}
                      >
                        {c.code}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>
                        Min Order: ₹{c.minOrder}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--neutral-muted)', marginTop: '0.25rem' }}>
                      {c.description}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteCoupon(c.code)}
                    className="btn btn-ghost"
                    style={{ color: '#ef4444', padding: '0.4rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: REVENUE ANALYTICS */}
      {activeTab === 'revenue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AnalyticsChart
            title="Platform Commissions Log"
            labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
            data={[
              Math.round(commissionEarned * 0.10),
              Math.round(commissionEarned * 0.18),
              Math.round(commissionEarned * 0.12),
              Math.round(commissionEarned * 0.08),
              Math.round(commissionEarned * 0.22),
              Math.round(commissionEarned * 0.20),
              Math.round(commissionEarned * 0.10)
            ]}
            color="var(--primary-green)"
            type="area"
          />

          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Audited Payouts Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between' }}>
                <span>Gross Platform Billing</span>
                <strong>₹{totalSales.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between' }}>
                <span>Admin Share (10% Net Platform cut)</span>
                <strong style={{ color: 'var(--primary-green)' }}>₹{commissionEarned.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between' }}>
                <span>Vendor Share (90% Outflow Settlements)</span>
                <strong>₹{(totalSales * 0.9).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: RIDERS */}
      {activeTab === 'delivery' && (
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Registered Delivery Partners</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {deliveryPartners.map((r) => (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  border: '1px solid var(--neutral-border)',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>{r.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>
                    Phone: {r.phone} • Status: <strong style={{ color: r.status === 'online' ? 'var(--primary-green)' : 'var(--neutral-muted)' }}>{r.status.toUpperCase()}</strong>
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>₹{r.totalEarnings}</div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>Accumulated Rider Pay</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
