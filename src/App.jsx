import React, { useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import { CustomerView } from './views/CustomerView';
import { VendorDashboard } from './views/VendorDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { DeliveryDashboard } from './views/DeliveryDashboard';
import { LoginView } from './views/LoginView';
import { Bell, Info, AlertTriangle, AlertCircle } from 'lucide-react';

const AppContent = () => {
  const { activeRole, notifications, isLoggedIn } = useContext(AppContext);

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
            {activeRole === 'customer' && <CustomerView />}
            {activeRole === 'vendor' && <VendorDashboard />}
            {activeRole === 'admin' && <AdminDashboard />}
            {activeRole === 'delivery' && <DeliveryDashboard />}
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
          <p>© 2026 DesiCart Multi-Vendor Delivery Network. Built with React & Vanilla CSS.</p>
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
