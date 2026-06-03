import React, { useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import { CustomerView } from './views/CustomerView';
import { VendorDashboard } from './views/VendorDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { DeliveryDashboard } from './views/DeliveryDashboard';
import { LoginView } from './views/LoginView';
import { StoreRegistrationView } from './views/StoreRegistrationView';
import { RiderRegistrationView } from './views/RiderRegistrationView';
import { PendingApprovalView } from './views/PendingApprovalView';
import { RejectionView } from './views/RejectionView';

import { SuperAdminDashboard } from './views/SuperAdminDashboard';
import { Bell, Info, AlertTriangle, AlertCircle, ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

/* ─── Premium Access Denied Screen ─── */
const AccessDenied = ({ requiredRole, reason }) => {
  const { logout } = useContext(AppContext);
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.08) 0%, transparent 70%)'
    }} className="animate-fade-in">
      <div className="card" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid #fca5a5',
        backgroundColor: 'var(--neutral-white)',
        borderRadius: 'var(--radius-xl)',
        position: 'relative'
      }}>
        {/* Top Warning Highlight */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          backgroundColor: '#ef4444', borderRadius: '999px 999px 0 0'
        }} />
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          boxShadow: '0 0 0 8px rgba(254, 202, 202, 0.5)'
        }}>
          <ShieldAlert size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#b91c1c', marginBottom: '0.5rem' }}>
          Access Denied
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--neutral-muted)', fontWeight: 600, marginBottom: '1.25rem' }}>
          You do not have permission to view the <strong style={{ color: 'var(--neutral-text)' }}>{requiredRole} Dashboard</strong>.
        </p>
        
        {reason && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: 'var(--neutral-light)',
            border: '1px solid var(--neutral-border)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.78rem',
            color: 'var(--neutral-text)',
            fontWeight: 600,
            marginBottom: '1.5rem',
            textAlign: 'left',
            lineHeight: 1.4
          }}>
            <span style={{ color: '#ef4444' }}>⚠️</span> <strong>Security Notice:</strong> {reason}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ borderColor: '#ef4444', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <LogOut size={15} /> Sign Out Session
          </button>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const {
    activeRole,
    notifications,
    isLoggedIn,
    firebaseUser,
    getRegistrationByUid,
    setCurrentVendorId,
    setCurrentRiderId,
    admins,
  } = useContext(AppContext);

  // Sync current vendor/rider ID to context in an effect to avoid setting state during render
  React.useEffect(() => {
    if (firebaseUser) {
      const result = getRegistrationByUid(firebaseUser.uid);
      if (result) {
        if (result.type === 'vendor') {
          setCurrentVendorId(result.record.id);
        } else if (result.type === 'rider') {
          setCurrentRiderId(result.record.id);
        }
      }
    }
  }, [firebaseUser, getRegistrationByUid, setCurrentVendorId, setCurrentRiderId]);

  /**
   * Resolves which view to show for logged-in vendor / rider users.
   * Returns one of: 'dashboard' | 'register' | 'pending' | 'rejected' | 'suspended'
   */
  const resolveVendorRiderRoute = (type) => {
    if (!firebaseUser) return 'register';
    const result = getRegistrationByUid(firebaseUser.uid);
    if (!result || result.type !== type) return 'register';

    const { record } = result;

    switch (record.registrationStatus) {
      case 'approved':   return 'dashboard';
      case 'pending':    return 'pending';
      case 'rejected':   return 'rejected';
      case 'suspended':  return 'suspended';
      default:           return 'register';
    }
  };

  const renderVendorRoute = () => {
    const route = resolveVendorRiderRoute('vendor');
    const record = firebaseUser ? getRegistrationByUid(firebaseUser.uid)?.record : null;
    switch (route) {
      case 'dashboard':  return <VendorDashboard />;
      case 'pending':    return <PendingApprovalView type="vendor" status="pending" record={record} />;
      case 'rejected':   return <RejectionView type="vendor" record={record} />;
      case 'suspended':  return <PendingApprovalView type="vendor" status="suspended" record={record} />;
      default:           return <StoreRegistrationView />;
    }
  };

  const renderRiderRoute = () => {
    const route = resolveVendorRiderRoute('rider');
    const record = firebaseUser ? getRegistrationByUid(firebaseUser.uid)?.record : null;
    switch (route) {
      case 'dashboard':  return <DeliveryDashboard />;
      case 'pending':    return <PendingApprovalView type="rider" status="pending" record={record} />;
      case 'rejected':   return <RejectionView type="rider" record={record} />;
      case 'suspended':  return <PendingApprovalView type="rider" status="suspended" record={record} />;
      default:           return <RiderRegistrationView />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Overlay Notifications */}
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          pointerEvents: 'none'
        }}
      >
        {notifications.map((toast) => (
          <div
            key={toast.id}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: toast.type === 'error' ? '#fee2e2' : toast.type === 'warning' ? '#fff7ed' : '#ecfdf5',
              border: `1px solid ${toast.type === 'error' ? '#ef4444' : toast.type === 'warning' ? '#f97316' : '#10b981'}`,
              color: toast.type === 'error' ? '#ef4444' : toast.type === 'warning' ? '#ea580c' : '#059669',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              pointerEvents: 'auto',
              minWidth: '280px',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
            className="animate-slide-in-right"
          >
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.type === 'warning' && <AlertTriangle size={16} />}
            {toast.type === 'info' && <Info size={16} />}
            {toast.type === 'success' && <CheckCircleIcon />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {!isLoggedIn ? (
          <LoginView />
        ) : (
          <>
            {activeRole === 'customer'  && <CustomerView />}
            {activeRole === 'vendor'    && renderVendorRoute()}
            {activeRole === 'delivery'  && renderRiderRoute()}
            {activeRole === 'admin'     && (
              !firebaseUser?.email?.endsWith('24365@gmail.com') ? (
                <AccessDenied requiredRole="Admin" reason="Email domain unauthorized for administrative access." />
              ) : (
                (firebaseUser?.email?.toLowerCase() === 'anandabhishek24365@gmail.com' ||
                 admins.some(a => a.email.toLowerCase() === firebaseUser?.email?.toLowerCase() && a.status === 'active')) ? (
                  <AdminDashboard />
                ) : (
                  <AccessDenied requiredRole="Admin" reason="Your Admin account has not been authorized or has been deactivated by the Super Admin." />
                )
              )
            )}
            {activeRole === 'superadmin' && (
              firebaseUser?.email?.toLowerCase() !== 'anandabhishek24365@gmail.com' ? (
                <AccessDenied requiredRole="Super Admin" reason="This dashboard is exclusively accessible by anandabhishek24365@gmail.com." />
              ) : (
                <SuperAdminDashboard />
              )
            )}
          </>
        )}
      </main>


      {/* Shared Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--neutral-border)',
          backgroundColor: 'var(--neutral-white)',
          padding: '1.5rem 0',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--neutral-muted)',
          marginTop: 'auto'
        }}
      >
        <div className="app-container">
          <p>© 2026 DesiCart Multi-Vendor Delivery Network. Built with React &amp; Vanilla CSS.</p>
          <p style={{ marginTop: '0.25rem', fontSize: '0.7rem' }}>
            Interactive Local Simulation Mode active. Order state synced via LocalStorage.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Check icon helper
const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
