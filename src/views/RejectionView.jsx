import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { XCircle, RefreshCw, LogOut, MessageSquare } from 'lucide-react';

/**
 * RejectionView
 * Props:
 *   type   – 'vendor' | 'rider'
 *   record – the rejected vendor/rider object
 */
export const RejectionView = ({ type, record }) => {
  const { clearRejectedRegistration, logout } = useContext(AppContext);

  const isVendor = type === 'vendor';
  const reason   = record?.rejectionReason || 'Your application did not meet the platform requirements.';

  const handleResubmit = () => {
    clearRejectedRegistration(type, record.id);
    // After clearing, App.jsx re-evaluates routing → shows registration form again
  };

  return (
    <div style={styles.page} className="animate-fade-in">
      <div style={styles.card}>
        {/* Icon */}
        <div style={styles.iconRing}>
          <XCircle size={44} color="#ef4444" />
        </div>

        {/* Title */}
        <h2 style={styles.heading}>Registration Rejected</h2>
        <p style={styles.sub}>
          Your {isVendor ? 'store' : 'rider'} registration was not approved.<br />
          You may review the reason below and resubmit with updated details.
        </p>

        {/* Rejection reason */}
        <div style={styles.reasonBox}>
          <div style={styles.reasonHeader}>
            <MessageSquare size={14} />
            <span>Reason from Admin</span>
          </div>
          <p style={styles.reasonText}>{reason}</p>
        </div>

        {/* Details summary */}
        {record && (
          <div style={styles.detailBox}>
            <p style={styles.detailRow}>
              <span style={styles.detailLabel}>{isVendor ? 'Store Name' : 'Rider Name'}</span>
              <span style={styles.detailValue}>{record.name}</span>
            </p>
            {isVendor && record.gstNumber && (
              <p style={styles.detailRow}>
                <span style={styles.detailLabel}>GST Number</span>
                <span style={styles.detailValue}>{record.gstNumber}</span>
              </p>
            )}
            {!isVendor && record.vehicleNumber && (
              <p style={styles.detailRow}>
                <span style={styles.detailLabel}>Vehicle No.</span>
                <span style={styles.detailValue}>{record.vehicleNumber}</span>
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div style={styles.actions}>
          <button
            onClick={handleResubmit}
            className="btn btn-primary"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
          >
            <RefreshCw size={15} /> Resubmit Application
          </button>
        </div>

        <button onClick={logout} style={styles.logoutBtn}>
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '2rem 1rem',
    background: 'radial-gradient(ellipse at 50% 10%, #fee2e2 0%, transparent 50%)',
  },
  card: {
    width: '100%', maxWidth: 440,
    backgroundColor: 'var(--neutral-white)',
    borderRadius: 'var(--radius-xl)', padding: '2.5rem 2rem',
    boxShadow: '0 32px 64px -12px rgba(239,68,68,.15)',
    border: '1px solid #fca5a5',
    textAlign: 'center',
  },
  iconRing: {
    width: 84, height: 84, borderRadius: '50%',
    background: '#fee2e2',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1.5rem',
    boxShadow: '0 0 0 12px #fecaca40',
  },
  heading: {
    fontSize: '1.35rem', fontWeight: 800,
    color: '#dc2626', marginBottom: '0.5rem',
  },
  sub: {
    fontSize: '0.84rem', color: 'var(--neutral-muted)',
    fontWeight: 500, lineHeight: 1.6, marginBottom: '1.25rem',
  },
  reasonBox: {
    backgroundColor: '#fef2f2', border: '1px solid #fca5a5',
    borderRadius: 'var(--radius-lg)', padding: '0.9rem 1rem',
    marginBottom: '1rem', textAlign: 'left',
  },
  reasonHeader: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    fontSize: '0.72rem', fontWeight: 800,
    color: '#dc2626', marginBottom: '0.4rem',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  reasonText: {
    fontSize: '0.84rem', color: '#7f1d1d', fontWeight: 500, lineHeight: 1.55,
  },
  detailBox: {
    backgroundColor: 'var(--neutral-light)',
    border: '1px solid var(--neutral-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '0.9rem 1rem', marginBottom: '1.25rem', textAlign: 'left',
  },
  detailRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '0.8rem', padding: '0.25rem 0',
    borderBottom: '1px solid var(--neutral-border)',
  },
  detailLabel: { color: 'var(--neutral-muted)', fontWeight: 600 },
  detailValue: { fontWeight: 700, color: 'var(--neutral-text)' },
  actions: {
    display: 'flex', gap: '0.75rem', marginBottom: '0.75rem',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.35rem', background: 'none', border: 'none',
    color: 'var(--neutral-muted)', fontSize: '0.78rem',
    fontWeight: 600, cursor: 'pointer', width: '100%',
  },
};
