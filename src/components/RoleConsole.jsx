import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import {
  User,
  Store,
  ShieldCheck,
  Bike,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Settings,
  Bell
} from 'lucide-react';

export const RoleConsole = () => {
  const {
    activeRole,
    setActiveRole,
    orders,
    vendors,
    deliveryPartners,
    currentVendorId,
    currentRiderId,
    setCurrentVendorId,
    setCurrentRiderId,
    setIsLoggedIn
  } = useContext(AppContext);

  const [isOpen, setIsOpen] = useState(true);

  // Derive indicators for role actions
  const pendingVendorOrdersCount = orders.filter(
    (o) => o.vendorId === currentVendorId && o.status === 'pending'
  ).length;

  const pendingAdminApprovalsCount = vendors.filter((v) => !v.isApproved).length;

  const pendingDeliveryJobsCount = orders.filter((o) => o.status === 'ready').length;

  const activeRiderJob = orders.find(
    (o) => o.deliveryPartnerId === currentRiderId && o.status === 'out_for_delivery'
  );

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 100,
        fontFamily: 'var(--font-sans)',
        maxWidth: '380px',
        width: 'calc(100vw - 2rem)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        transition: 'var(--transition-all)',
        border: '2px solid var(--primary-green)'
      }}
      className="glassmorphism animate-fade-in"
    >
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '0.75rem 1rem',
          background: 'linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-hover) 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
          <Sparkles size={16} />
          <span>Interactive Testing Console</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </div>
      </div>

      {/* Panel Body */}
      {isOpen && (
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>
            This clone uses shared local state. Place an order as Customer, accept/prepare it as Vendor, route it as Delivery, or approve stores as Admin.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem'
            }}
          >
            {/* Customer Button */}
            <button
              onClick={() => {
                setActiveRole('customer');
                setIsLoggedIn(true);
              }}
              className={`btn btn-sm ${activeRole === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', gap: '0.4rem', border: activeRole === 'customer' ? 'none' : '1px solid var(--neutral-border)' }}
            >
              <User size={15} />
              <span>Customer</span>
            </button>
 
            {/* Vendor Button */}
            <button
              onClick={() => {
                setActiveRole('vendor');
                setIsLoggedIn(true);
              }}
              className={`btn btn-sm ${activeRole === 'vendor' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                justifyContent: 'flex-start',
                gap: '0.4rem',
                border: activeRole === 'vendor' ? 'none' : '1px solid var(--neutral-border)',
                position: 'relative'
              }}
            >
              <Store size={15} />
              <span>Vendor</span>
              {pendingVendorOrdersCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: 'var(--accent-orange)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse-slow 1.5s infinite'
                  }}
                >
                  {pendingVendorOrdersCount}
                </span>
              )}
            </button>
 
            {/* Delivery Button */}
            <button
              onClick={() => {
                setActiveRole('delivery');
                setIsLoggedIn(true);
              }}
              className={`btn btn-sm ${activeRole === 'delivery' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                justifyContent: 'flex-start',
                gap: '0.4rem',
                border: activeRole === 'delivery' ? 'none' : '1px solid var(--neutral-border)',
                position: 'relative'
              }}
            >
              <Bike size={15} />
              <span>Delivery</span>
              {(pendingDeliveryJobsCount > 0 || activeRiderJob) && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: 'var(--accent-orange)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse-slow 1.5s infinite'
                  }}
                >
                  {activeRiderJob ? '1' : pendingDeliveryJobsCount}
                </span>
              )}
            </button>
 
            {/* Admin Button */}
            <button
              onClick={() => {
                setActiveRole('admin');
                setIsLoggedIn(true);
              }}
              className={`btn btn-sm ${activeRole === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                justifyContent: 'flex-start',
                gap: '0.4rem',
                border: activeRole === 'admin' ? 'none' : '1px solid var(--neutral-border)',
                position: 'relative'
              }}
            >
              <ShieldCheck size={15} />
              <span>Admin</span>
              {pendingAdminApprovalsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: 'var(--accent-orange)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {pendingAdminApprovalsCount}
                </span>
              )}
            </button>

            {/* Super Admin Button */}
            <button
              onClick={() => {
                setActiveRole('superadmin');
                setIsLoggedIn(true);
              }}
              className={`btn btn-sm ${activeRole === 'superadmin' ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                justifyContent: 'flex-start',
                gap: '0.4rem',
                border: activeRole === 'superadmin' ? 'none' : '1px solid var(--neutral-border)',
                gridColumn: 'span 2'
              }}
            >
              <ShieldCheck size={15} style={{ color: '#fbbf24' }} />
              <span>👑 Super Admin</span>
            </button>
          </div>

          {/* Quick Context Switchers */}
          {activeRole === 'vendor' && (
            <div
              style={{
                marginTop: '0.25rem',
                padding: '0.5rem',
                background: 'var(--neutral-light)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                border: '1px solid var(--neutral-border)'
              }}
            >
              <span style={{ fontWeight: 600 }}>Active Shop:</span>
              <select
                value={currentVendorId}
                onChange={(e) => setCurrentVendorId(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontWeight: 700,
                  color: 'var(--primary-green)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} {!v.isApproved ? '(Pending Approval)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeRole === 'delivery' && (
            <div
              style={{
                marginTop: '0.25rem',
                padding: '0.5rem',
                background: 'var(--neutral-light)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                border: '1px solid var(--neutral-border)'
              }}
            >
              <span style={{ fontWeight: 600 }}>Active Rider:</span>
              <select
                value={currentRiderId}
                onChange={(e) => setCurrentRiderId(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontWeight: 700,
                  color: 'var(--primary-green)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {deliveryPartners.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Metrics */}
          <div
            style={{
              fontSize: '0.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--neutral-border)',
              paddingTop: '0.5rem',
              color: 'var(--neutral-muted)'
            }}
          >
            <span>Total Orders: <strong>{orders.length}</strong></span>
            <span>Active Stores: <strong>{vendors.filter((v) => v.isApproved).length}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
