import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { AnalyticsChart } from '../components/AnalyticsChart';
import {
  ShieldAlert, Users, Store, Ticket, DollarSign, TrendingUp,
  Plus, Trash2, Check, X, AlertCircle, LogOut, Search,
  Clock, ShieldCheck, ShieldOff, RefreshCw, MessageSquare,
  Bike, FileText, Phone, MapPin, Car, Bell, ChevronDown, User
} from 'lucide-react';

/* ── Status badge helper ── */
const StatusBadge = ({ status }) => {
  const map = {
    approved:  { bg: '#ecfdf5', color: '#059669', border: '#bbf7d0', label: 'Approved',  Icon: ShieldCheck },
    pending:   { bg: '#fef3c7', color: '#d97706', border: '#fde68a', label: 'Pending',   Icon: Clock },
    rejected:  { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5', label: 'Rejected',  Icon: X },
    suspended: { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db', label: 'Suspended', Icon: ShieldOff },
  };
  const { bg, color, border, label, Icon } = map[status] || map.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.28rem',
      backgroundColor: bg, color, border: `1px solid ${border}`,
      fontSize: '0.7rem', fontWeight: 700,
      padding: '0.22rem 0.6rem', borderRadius: '999px',
    }}>
      <Icon size={11} /> {label}
    </span>
  );
};

/* ── Detail row inside cards ── */
const DetailRow = ({ icon: Icon, label, value }) => value ? (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--neutral-muted)', padding: '0.15rem 0' }}>
    <Icon size={12} style={{ flexShrink: 0 }} />
    <span style={{ fontWeight: 600 }}>{label}:</span>
    <span style={{ color: 'var(--neutral-text)', fontWeight: 700, wordBreak: 'break-all' }}>{value}</span>
  </div>
) : null;

export const AdminDashboard = () => {
  const {
    vendors, orders, coupons, addCoupon, deleteCoupon,
    deliveryPartners, logout,
    adminApproveRegistration, adminRejectRegistration,
    adminSuspendAccount, adminReactivateAccount,
    adminNewRegistrationsCount, clearAdminNotifications,
    adminAddVendor, adminAddRider,
    supportTickets, resolveSupportTicket, updateOrderStatus
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('registrations');

  // Customer tab derived state
  const derivedCustomers = [];
  orders.forEach(o => {
    if (o.customerName && !derivedCustomers.some(c => c.name === o.customerName)) {
      derivedCustomers.push({
        name: o.customerName,
        phone: o.customerPhone || '+91 99999 00000',
        email: o.customerEmail || 'customer@desicart.com',
        ordersCount: orders.filter(ord => ord.customerName === o.customerName).length,
        totalSpend: orders.filter(ord => ord.customerName === o.customerName).reduce((sum, ord) => sum + ord.total, 0),
        status: 'active'
      });
    }
  });
  if (derivedCustomers.length === 0) {
    derivedCustomers.push({
      name: 'Jane Doe',
      phone: '+91 98765 00000',
      email: 'customer@desicart.com',
      ordersCount: 3,
      totalSpend: 540,
      status: 'active'
    });
  }

  // Active Order filters
  const [orderFilter, setOrderFilter] = useState('all');

  // Complaint replies state
  const [supportReply, setSupportReply] = useState('');
  const [replyingTicketId, setReplyingTicketId] = useState(null);

  // Category local state
  const [categories, setCategories] = useState([
    { id: 'grocery', name: 'Groceries & Staples', icon: 'ShoppingBag', color: '#10b981' },
    { id: 'food', name: 'Restaurants & Food', icon: 'Utensils', color: '#f97316' },
    { id: 'fruits-veg', name: 'Fruits & Vegetables', icon: 'Leaf', color: '#22c55e' },
    { id: 'medicine', name: 'Medicines & Health', icon: 'Activity', color: '#ef4444' },
    { id: 'essentials', name: 'Daily Essentials', icon: 'Package', color: '#06b6d4' }
  ]);
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState('#10b981');

  // Banners local state
  const [banners, setBanners] = useState([
    { id: 1, title: 'Super-Fast 10-Minute Delivery', subtitle: 'Groceries, Fresh Fruits, Vegetables, and daily essentials', bgGrad: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)', promoCode: 'BLINK50' },
    { id: 2, title: 'Craving Delicious Hot Food?', subtitle: 'Get top-rated dishes from top restaurants in your area', bgGrad: 'linear-gradient(135deg, #c2410c 0%, #f97316 100%)', promoCode: 'WELCOME75' }
  ]);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSub, setBannerSub] = useState('');
  const [bannerGrad, setBannerGrad] = useState('linear-gradient(135deg, #065f46 0%, #10b981 100%)');

  /* ── Registrations tab state ── */
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType,   setFilterType]   = useState('all'); // 'all' | 'vendor' | 'rider'
  const [searchQuery,  setSearchQuery]  = useState('');
  const [rejectingId,  setRejectingId]  = useState(null);  // id being rejected
  const [rejectReason, setRejectReason] = useState('');

  /* ── Coupon form state ── */
  const [couponCode, setCouponCode]           = useState('');
  const [couponType, setCouponType]           = useState('percentage');
  const [couponValue, setCouponValue]         = useState('');
  const [couponMinOrder, setCouponMinOrder]   = useState('');
  const [couponMaxDiscount, setCouponMaxDiscount] = useState('');
  const [couponDesc, setCouponDesc]           = useState('');

  /* ── Quick Add forms ── */
  const [vName, setVName]         = useState('');
  const [vCategory, setVCategory] = useState('grocery');
  const [vAddress, setVAddress]   = useState('');
  const [vMinOrder, setVMinOrder] = useState('99');
  const [rName, setRName]         = useState('');
  const [rPhone, setRPhone]       = useState('');

  /* ── Derived metrics ── */
  const allRegistrations = [
    ...vendors.map(v => ({ ...v, _type: 'vendor' })),
    ...deliveryPartners.map(d => ({ ...d, _type: 'rider' })),
  ];

  const pendingAll    = allRegistrations.filter(r => r.registrationStatus === 'pending');
  const approvedAll   = allRegistrations.filter(r => r.registrationStatus === 'approved');
  const rejectedAll   = allRegistrations.filter(r => r.registrationStatus === 'rejected');
  const suspendedAll  = allRegistrations.filter(r => r.registrationStatus === 'suspended');

  const filteredRegistrations = allRegistrations.filter(r => {
    const statusOk = filterStatus === 'all' || r.registrationStatus === filterStatus;
    const typeOk   = filterType   === 'all' || r._type === filterType;
    const searchOk = !searchQuery || r.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusOk && typeOk && searchOk;
  });

  const totalSales       = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.subtotal - o.discount, 0);
  const commissionEarned = totalSales * 0.1;
  const totalRidersOnline = deliveryPartners.filter(r => r.status === 'online').length;

  const handleApprove = (type, id) => {
    adminApproveRegistration(type, id);
  };

  const handleStartReject = (id) => {
    setRejectingId(id);
    setRejectReason('');
  };

  const handleConfirmReject = (type, id) => {
    if (!rejectReason.trim()) return;
    adminRejectRegistration(type, id, rejectReason.trim());
    setRejectingId(null);
    setRejectReason('');
  };

  const handleCouponCreate = (e) => {
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
    setCouponCode(''); setCouponValue(''); setCouponMinOrder(''); setCouponMaxDiscount(''); setCouponDesc('');
  };

  /* ── Tab config ── */
  const tabs = [
    { id: 'registrations', label: 'Registrations', badge: pendingAll.length },
    { id: 'customers',     label: 'Customers',     badge: null },
    { id: 'orders',        label: 'Orders',        badge: orders.filter(o => ['pending', 'ready', 'preparing'].includes(o.status)).length },
    { id: 'categories',    label: 'Categories & Banners', badge: null },
    { id: 'support',       label: 'Complaints',    badge: supportTickets.filter(t => t.status === 'pending').length },
    { id: 'coupons',       label: 'Coupons',       badge: null },
    { id: 'revenue',       label: 'Revenue',       badge: null }
  ];

  return (
    <div style={{ paddingBottom: '5rem' }} className="animate-fade-in">

      {/* ══ Header ══════════════════════════════════════════════════════════ */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.jpg" alt="DesiCart" style={{ width: 45, height: 45, borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-border)' }} />
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Admin Command Portal</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>
              Manage registrations, payouts, campaigns, and delivery metrics.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); if (t.id === 'registrations') clearAdminNotifications(); }}
              className={`btn btn-sm ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ position: 'relative' }}
            >
              {t.label}
              {t.badge > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#ef4444', color: '#fff',
                  fontSize: '0.6rem', fontWeight: 800,
                  width: 17, height: 17, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--neutral-white)',
                }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
          <button onClick={logout} className="btn btn-sm btn-secondary" style={{ borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>

      {/* ══ Stats cards ═══════════════════════════════════════════════════ */}
      <div className="grid-responsive" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {[
          { label: 'Platform Commission (10%)', value: `₹${commissionEarned.toFixed(0)}`, bg: 'var(--primary-green-light)', color: 'var(--primary-green)', Icon: DollarSign, tab: 'revenue' },
          { label: 'Gross Total Sales', value: `₹${totalSales.toFixed(0)}`, bg: 'var(--accent-orange-light)', color: 'var(--accent-orange)', Icon: TrendingUp, tab: 'revenue' },
          { label: 'Pending Approvals', value: `${pendingAll.length} waiting`, bg: '#fef3c7', color: '#d97706', Icon: Clock, tab: 'registrations' },
          { label: 'Approved Accounts', value: `${approvedAll.length} active`, bg: '#e0f7fa', color: '#00acc1', Icon: ShieldCheck, tab: 'registrations' },
          { label: 'Riders Online', value: `${totalRidersOnline} online`, bg: '#f3e8ff', color: '#7c3aed', Icon: Users, tab: 'registrations' },
        ].map(({ label, value, bg, color, Icon, tab }) => (
          <div key={label} className="card card-interactive" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', cursor: 'pointer' }} onClick={() => setActiveTab(tab)}>
            <div style={{ padding: '0.6rem', backgroundColor: bg, borderRadius: 'var(--radius-lg)', color }}>
              <Icon size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════ TAB: REGISTRATIONS ═══════════════════════════ */}
      {activeTab === 'registrations' && (
        <div className="animate-fade-in">
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            {/* Filter bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: 'auto' }}>
                <ShieldAlert size={18} style={{ color: 'var(--accent-orange)' }} />
                Registrations ({filteredRegistrations.length})
              </h3>

              {/* Search */}
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by name…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2rem', paddingRight: '0.75rem', fontSize: '0.8rem', height: '36px', width: '180px' }}
                />
              </div>

              {/* Type filter */}
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {[['all', 'All'], ['vendor', '🏪 Stores'], ['rider', '🚴 Riders']].map(([v, l]) => (
                  <button key={v} onClick={() => setFilterType(v)}
                    className={`btn btn-sm ${filterType === v ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.72rem', padding: '0.28rem 0.6rem' }}>
                    {l}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {[['all', 'All', '#6b7280'], ['pending', 'Pending', '#d97706'], ['approved', 'Approved', '#059669'], ['rejected', 'Rejected', '#dc2626'], ['suspended', 'Suspended', '#6b7280']].map(([v, l, c]) => (
                  <button key={v} onClick={() => setFilterStatus(v)}
                    className={`btn btn-sm ${filterStatus === v ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.72rem', padding: '0.28rem 0.6rem', ...(filterStatus === v ? { background: c, borderColor: c } : { color: c, borderColor: c }) }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Registration cards */}
            {filteredRegistrations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--neutral-muted)' }}>
                <Check size={32} style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem' }}>No registrations match your filter.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredRegistrations.map(reg => {
                  const isVendor  = reg._type === 'vendor';
                  const isRejecting = rejectingId === reg.id;

                  return (
                    <div key={reg.id} style={{
                      border: '1px solid var(--neutral-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1rem',
                      backgroundColor: reg.registrationStatus === 'pending' ? '#fffbeb' : 'var(--neutral-white)',
                      borderLeft: `3px solid ${isVendor ? '#f97316' : '#06b6d4'}`,
                    }}>
                      {/* Card header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{
                            padding: '0.4rem',
                            background: isVendor ? '#fff7ed' : '#e0f7fa',
                            borderRadius: 'var(--radius-md)',
                            color: isVendor ? '#f97316' : '#06b6d4',
                          }}>
                            {isVendor ? <Store size={16} /> : <Bike size={16} />}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{reg.name}</h4>
                            <span style={{
                              fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                              color: isVendor ? '#f97316' : '#06b6d4', letterSpacing: '0.04em'
                            }}>
                              {isVendor ? 'Store' : 'Rider'}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <StatusBadge status={reg.registrationStatus} />
                          {reg.registeredAt && (
                            <span style={{ fontSize: '0.66rem', color: 'var(--neutral-muted)', fontWeight: 500 }}>
                              {new Date(reg.registeredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.1rem 1.5rem', marginBottom: '0.75rem' }}>
                        {isVendor ? (
                          <>
                            <DetailRow icon={User}    label="Owner"    value={reg.ownerName} />
                            <DetailRow icon={FileText} label="GST"     value={reg.gstNumber} />
                            <DetailRow icon={Phone}   label="Mobile"   value={reg.mobile} />
                            <DetailRow icon={MapPin}  label="Address"  value={reg.address} />
                            <DetailRow icon={Store}   label="Category" value={reg.category} />
                          </>
                        ) : (
                          <>
                            <DetailRow icon={Phone}   label="Mobile"   value={reg.phone} />
                            <DetailRow icon={Car}     label="Vehicle"  value={reg.vehicleNumber} />
                            <DetailRow icon={Bike}    label="Type"     value={reg.vehicleType} />
                            <DetailRow icon={FileText} label="License" value={reg.licenseNumber || '—'} />
                          </>
                        )}
                      </div>

                      {/* Rejection reason display */}
                      {reg.rejectionReason && (
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem', marginBottom: '0.75rem', fontSize: '0.75rem', color: '#dc2626' }}>
                          <MessageSquare size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                          <span><strong>Rejection reason:</strong> {reg.rejectionReason}</span>
                        </div>
                      )}

                      {/* Reject reason input */}
                      {isRejecting && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <textarea
                            autoFocus
                            rows={2}
                            placeholder="Enter rejection reason (required)…"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            className="input-field"
                            style={{ resize: 'vertical', fontSize: '0.8rem', padding: '0.6rem' }}
                          />
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {reg.registrationStatus === 'pending' && (
                          <>
                            {isRejecting ? (
                              <>
                                <button onClick={() => handleConfirmReject(reg._type, reg.id)} className="btn btn-sm" disabled={!rejectReason.trim()}
                                  style={{ background: '#ef4444', color: '#fff', border: 'none', opacity: rejectReason.trim() ? 1 : 0.5 }}>
                                  <Check size={13} /> Confirm Reject
                                </button>
                                <button onClick={() => setRejectingId(null)} className="btn btn-sm btn-secondary">
                                  <X size={13} /> Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleApprove(reg._type, reg.id)} className="btn btn-sm btn-primary">
                                  <ShieldCheck size={13} /> Approve
                                </button>
                                <button onClick={() => handleStartReject(reg.id)} className="btn btn-sm btn-secondary" style={{ color: '#dc2626', borderColor: '#fca5a5' }}>
                                  <X size={13} /> Reject
                                </button>
                              </>
                            )}
                          </>
                        )}
                        {reg.registrationStatus === 'approved' && (
                          <button onClick={() => adminSuspendAccount(reg._type, reg.id)} className="btn btn-sm btn-secondary" style={{ color: '#d97706', borderColor: '#fde68a' }}>
                            <ShieldOff size={13} /> Suspend
                          </button>
                        )}
                        {reg.registrationStatus === 'suspended' && (
                          <button onClick={() => adminReactivateAccount(reg._type, reg.id)} className="btn btn-sm btn-secondary" style={{ color: '#059669', borderColor: '#bbf7d0' }}>
                            <RefreshCw size={13} /> Reactivate
                          </button>
                        )}
                        {reg.registrationStatus === 'rejected' && !isRejecting && (
                          <>
                            <button onClick={() => handleApprove(reg._type, reg.id)} className="btn btn-sm btn-primary">
                              <ShieldCheck size={13} /> Approve Instead
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {[
              { label: 'Pending',   count: pendingAll.length,   bg: '#fef3c7', color: '#d97706' },
              { label: 'Approved',  count: approvedAll.length,  bg: '#ecfdf5', color: '#059669' },
              { label: 'Rejected',  count: rejectedAll.length,  bg: '#fee2e2', color: '#dc2626' },
              { label: 'Suspended', count: suspendedAll.length, bg: '#f3f4f6', color: '#6b7280' },
            ].map(({ label, count, bg, color }) => (
              <div key={label} style={{ backgroundColor: bg, borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => setFilterStatus(label.toLowerCase())}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color }}>{count}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════ TAB: REVENUE ═════════════════════════════════ */}
      {activeTab === 'revenue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
          <AnalyticsChart
            title="Platform Commissions Log"
            labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
            data={[0.10, 0.18, 0.12, 0.08, 0.22, 0.20, 0.10].map(r => Math.round(commissionEarned * r))}
            color="var(--primary-green)" type="area"
          />
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Audited Payouts Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              {[
                { label: 'Gross Platform Billing',            value: `₹${totalSales.toFixed(2)}` },
                { label: 'Admin Share (10% Net)',              value: `₹${commissionEarned.toFixed(2)}`, green: true },
                { label: 'Vendor Share (90% Outflow)',        value: `₹${(totalSales * 0.9).toFixed(2)}` },
              ].map(({ label, value, green }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{label}</span>
                  <strong style={green ? { color: 'var(--primary-green)' } : {}}>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ TAB: COUPONS ═════════════════════════════════ */}
      {activeTab === 'coupons' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ticket size={18} style={{ color: 'var(--primary-green)' }} />
              Create Campaign Coupon Code
            </h3>
            <form onSubmit={handleCouponCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={formLabel}>Promo Code</label>
                  <input type="text" required placeholder="e.g. MEGA50" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label style={formLabel}>Discount Type</label>
                  <select value={couponType} onChange={e => setCouponType(e.target.value)} className="input-field" style={{ padding: '0.7rem' }}>
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="flat">Flat Rupees Off (₹)</option>
                    <option value="free-delivery">Free Delivery</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={formLabel}>Discount Value</label>
                  <input type="number" required disabled={couponType === 'free-delivery'} placeholder="e.g. 50" value={couponValue} onChange={e => setCouponValue(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label style={formLabel}>Min Order (₹)</label>
                  <input type="number" placeholder="Min Order" value={couponMinOrder} onChange={e => setCouponMinOrder(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label style={formLabel}>Max Cap (₹)</label>
                  <input type="number" placeholder="Max Cap" value={couponMaxDiscount} onChange={e => setCouponMaxDiscount(e.target.value)} className="input-field" />
                </div>
              </div>
              <div>
                <label style={formLabel}>Description</label>
                <input type="text" placeholder="e.g. 50% off up to ₹100 on orders above ₹200" value={couponDesc} onChange={e => setCouponDesc(e.target.value)} className="input-field" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                <Plus size={16} /> Create Coupon
              </button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Active Campaign Coupons</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {coupons.map(c => (
                <div key={c.code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-lg)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ backgroundColor: 'var(--primary-green-light)', color: 'var(--primary-green)', fontWeight: 800, fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary-green)' }}>
                        {c.code}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>Min Order: ₹{c.minOrder}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--neutral-muted)', marginTop: '0.25rem' }}>{c.description}</p>
                  </div>
                  <button onClick={() => deleteCoupon(c.code)} className="btn btn-ghost" style={{ color: '#ef4444', padding: '0.4rem' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ TAB: CUSTOMERS ═══════════════════════════════ */}
      {activeTab === 'customers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-in">
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Platform Customer Accounts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {derivedCustomers.map(cust => (
                <div key={cust.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--neutral-light)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>{cust.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', fontWeight: 600, marginTop: '0.15rem' }}>
                      Email: {cust.email} • Phone: {cust.phone}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '0.75rem', textAlign: 'right' }}>
                      <div>Orders Placed: <strong>{cust.ordersCount}</strong></div>
                      <div>Total Spent: <strong>₹{cust.totalSpend}</strong></div>
                    </div>
                    <span className="badge badge-delivered" style={{ fontSize: '0.65rem' }}>{cust.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ TAB: ORDERS ══════════════════════════════════ */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-in">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.15rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Platform Transactions Log</h3>
              
              {/* Status filter */}
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {[['all', 'All'], ['pending', 'Pending'], ['preparing', 'Preparing'], ['ready', 'Ready'], ['out_for_delivery', 'Out for Delivery'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']].map(([statusVal, labelText]) => (
                  <button
                    key={statusVal}
                    onClick={() => setOrderFilter(statusVal)}
                    className={`btn btn-sm ${orderFilter === statusVal ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                  >
                    {labelText}
                  </button>
                ))}
              </div>
            </div>

            {orders.filter(o => orderFilter === 'all' || o.status === orderFilter).length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)', textAlign: 'center', padding: '2rem' }}>
                No platform orders match this status filter.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {orders.filter(o => orderFilter === 'all' || o.status === orderFilter).map(order => (
                  <div key={order.id} style={{ padding: '1rem', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--neutral-white)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px dashed var(--neutral-border)', paddingBottom: '0.5rem' }}>
                      <div>
                        <span style={{ fontWeight: 800 }}>Order ID: {order.id.replace('order_', '#')}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', marginLeft: '0.5rem' }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`badge badge-${order.status}`}>{order.status.replace('_', ' ')}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--neutral-text)', marginBottom: '0.75rem' }}>
                      <div>Customer: <strong>{order.customerName}</strong> ({order.customerPhone})</div>
                      <div>Store Outlet: <strong>{order.vendorName}</strong></div>
                      <div>Total Value: <strong style={{ color: 'var(--accent-orange)' }}>₹{order.total}</strong> (via {order.paymentMethod.toUpperCase()})</div>
                      <div>Delivery Address: <span>{order.address}</span></div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {['pending', 'preparing', 'ready', 'out_for_delivery'].includes(order.status) && (
                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'cancelled');
                          }}
                          className="btn btn-sm btn-secondary"
                          style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                        >
                          Cancel Order
                        </button>
                      )}
                      
                      {/* Manual Status Override */}
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="input-field"
                        style={{ width: '130px', height: '30px', fontSize: '0.75rem', padding: '0 0.25rem', borderRadius: 'var(--radius-md)' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ TAB: CATEGORIES & BANNERS ════════════════════ */}
      {activeTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', flexWrap: 'wrap' }} className="animate-fade-in">
          {/* Categories Manager */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Catalog Categories</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {categories.map(cat => (
                <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: cat.color }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{cat.name}</span>
                  </div>
                  <button
                    onClick={() => setCategories(prev => prev.filter(c => c.id !== cat.id))}
                    className="btn btn-ghost"
                    style={{ color: '#ef4444', padding: '0.2rem' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Add New Category</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!catName.trim()) return;
              setCategories(prev => [...prev, { id: catName.trim().toLowerCase().replace(' ', '-'), name: catName.trim(), color: catColor }]);
              setCatName('');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input type="text" required placeholder="Category Name" value={catName} onChange={e => setCatName(e.target.value)} className="input-field" style={{ height: '34px', fontSize: '0.8rem' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700 }}>Accent Color:</label>
                <input type="color" value={catColor} onChange={e => setCatColor(e.target.value)} style={{ border: 'none', width: '32px', height: '32px', cursor: 'pointer', padding: 0 }} />
              </div>
              <button type="submit" className="btn btn-sm btn-primary">Create Category</button>
            </form>
          </div>

          {/* Banners Manager */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Homepage Promotion Banners</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {banners.map(ban => (
                <div key={ban.id} style={{ padding: '0.75rem', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-lg)', background: ban.bgGrad, color: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 900 }}>{ban.title}</h4>
                      <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>{ban.subtitle}</p>
                      <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.4rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.25rem', fontWeight: 700 }}>
                        Code: {ban.promoCode}
                      </span>
                    </div>
                    <button
                      onClick={() => setBanners(prev => prev.filter(b => b.id !== ban.id))}
                      className="btn btn-ghost"
                      style={{ color: '#fff', padding: '0.2rem', backgroundColor: 'rgba(0,0,0,0.2)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>Create Promo Slide</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!bannerTitle.trim()) return;
              setBanners(prev => [...prev, { id: Date.now(), title: bannerTitle.trim(), subtitle: bannerSub.trim(), bgGrad: bannerGrad, promoCode: 'NEWPROMO' }]);
              setBannerTitle(''); setBannerSub('');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input type="text" required placeholder="Banner Title" value={bannerTitle} onChange={e => setBannerTitle(e.target.value)} className="input-field" style={{ height: '34px', fontSize: '0.8rem' }} />
              <input type="text" placeholder="Banner Subtitle" value={bannerSub} onChange={e => setBannerSub(e.target.value)} className="input-field" style={{ height: '34px', fontSize: '0.8rem' }} />
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Select Theme Gradient:</label>
                <select value={bannerGrad} onChange={e => setBannerGrad(e.target.value)} className="input-field" style={{ height: '34px', fontSize: '0.8rem', padding: '0 0.5rem', borderRadius: 'var(--radius-md)' }}>
                  <option value="linear-gradient(135deg, #065f46 0%, #10b981 100%)">Green Forest</option>
                  <option value="linear-gradient(135deg, #c2410c 0%, #f97316 100%)">Orange Spice</option>
                  <option value="linear-gradient(135deg, #991b1b 0%, #ef4444 100%)">Red alert</option>
                  <option value="linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)">Indigo Sky</option>
                </select>
              </div>
              <button type="submit" className="btn btn-sm btn-primary">Create Slide</button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════ TAB: COMPLAINTS ═══════════════════════════════ */}
      {activeTab === 'support' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-in">
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.15rem' }}>Support Complaints & Support Tickets</h3>
            
            {supportTickets.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)', textAlign: 'center', padding: '2rem' }}>
                No active complaints filed by users.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {supportTickets.map(ticket => (
                  <div key={ticket.id} style={{ padding: '1rem', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-lg)', backgroundColor: ticket.status === 'pending' ? '#fffbeb' : 'var(--neutral-white)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>{ticket.subject}</span>
                      <span className={`badge ${ticket.status === 'resolved' ? 'badge-delivered' : 'badge-pending'}`} style={{ fontSize: '0.65rem' }}>
                        {ticket.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--neutral-text)', marginBottom: '0.5rem' }}>"{ticket.message}"</p>
                    <div style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', marginBottom: '0.50rem' }}>
                      Submitted by: <strong>{ticket.customerEmail}</strong> • Created: {new Date(ticket.createdAt).toLocaleString()}
                    </div>

                    {ticket.status === 'resolved' ? (
                      <div style={{ padding: '0.6rem', backgroundColor: 'var(--primary-green-light)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: 'var(--neutral-text)', borderLeft: '3px solid var(--primary-green)' }}>
                        <strong>Resolution reply:</strong> {ticket.reply}
                      </div>
                    ) : (
                      <div style={{ borderTop: '1px dashed var(--neutral-border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                        {replyingTicketId === ticket.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <textarea
                              rows={2}
                              placeholder="Write reply message to customer..."
                              value={supportReply}
                              onChange={e => setSupportReply(e.target.value)}
                              className="input-field"
                              style={{ fontSize: '0.8rem' }}
                            />
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => {
                                  if (!supportReply.trim()) return;
                                  resolveSupportTicket(ticket.id, supportReply.trim());
                                  setReplyingTicketId(null);
                                  setSupportReply('');
                                }}
                                className="btn btn-sm btn-primary"
                                style={{ fontWeight: 700 }}
                              >
                                Send Reply & Resolve
                              </button>
                              <button
                                onClick={() => { setReplyingTicketId(null); setSupportReply(''); }}
                                className="btn btn-sm btn-secondary"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReplyingTicketId(ticket.id)}
                            className="btn btn-sm btn-primary"
                            style={{ fontWeight: 700 }}
                          >
                            Reply & Resolve Ticket
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Small helpers ── */
const formLabel = { fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' };
