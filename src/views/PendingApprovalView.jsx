import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Clock, ShieldOff, Loader2, LogOut, Bell } from 'lucide-react';

/**
 * PendingApprovalView
 * Props:
 *   type        – 'vendor' | 'rider'
 *   status      – 'pending' | 'suspended'
 *   record      – the vendor/rider object from context
 */
export const PendingApprovalView = ({ type, status = 'pending', record }) => {
  const { logout } = useContext(AppContext);

  const isSuspended = status === 'suspended';
  const isVendor    = type === 'vendor';

  const color      = isSuspended ? '#ef4444' : isVendor ? '#f97316' : '#06b6d4';
  const lightColor = isSuspended ? '#fee2e2' : isVendor ? '#fff7ed' : '#e0f7fa';
  const ringColor  = isSuspended ? '#fca5a5' : isVendor ? '#fed7aa' : '#a5f3fc';

  const Icon = isSuspended ? ShieldOff : Clock;

  const title = isSuspended
    ? 'Account Suspended'
    : 'Registration Under Review';

  const message = isSuspended
    ? 'Your account has been suspended by the Admin. Please contact support for more information.'
    : 'Your registration is under review. Please wait for admin approval.\nThis usually takes 1–2 business days.';

  const submittedDate = record?.registeredAt
    ? new Date(record.registeredAt).toLocaleString('en-IN', {
        dateStyle: 'medium', timeStyle: 'short'
      })
    : null;

  return (
    <div style={styles.page} className="animate-fade-in">
      <div style={styles.card}>
        {/* Icon */}
        <div style={{ ...styles.iconRing, background: lightColor, boxShadow: `0 0 0 12px ${ringColor}40` }}>
          <Icon size={40} color={color} />
        </div>

        {/* Title & Message */}
        <h2 style={{ ...styles.heading, color: isSuspended ? '#dc2626' : 'var(--neutral-text)' }}>
          {title}
        </h2>
        <p style={styles.sub}>
          {message.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
        </p>

        {/* Status badge */}
        <div style={{ ...styles.badge, background: lightColor, color, borderColor: ringColor }}>
          {isSuspended
            ? <><ShieldOff size={13} /> Account Suspended</>
            : <><Loader2 size={13} style={{ animation: 'spin 1.4s linear infinite' }} /> Pending Approval</>
          }
        </div>

        {/* Details card */}
        {record && (
          <div style={styles.detailBox}>
            <p style={styles.detailRow}>
              <span style={styles.detailLabel}>
                {isVendor ? 'Store Name' : 'Rider Name'}
              </span>
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
            {submittedDate && (
              <p style={styles.detailRow}>
                <span style={styles.detailLabel}>Submitted</span>
                <span style={styles.detailValue}>{submittedDate}</span>
              </p>
            )}
          </div>
        )}

        {/* Info notice */}
        {!isSuspended && (
          <div style={styles.infoBox}>
            <Bell size={14} style={{ flexShrink: 0, color }} />
            <span>
              You'll be able to access your dashboard as soon as the Admin approves your account.
              Feel free to check back later.
            </span>
          </div>
        )}

        <button onClick={logout} style={styles.logoutBtn}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    padding: '2rem 1rem',
    background: 'radial-gradient(ellipse at 50% 0%, #f0fdf4 0%, transparent 60%)',
  },
  card: {
    width: '100%', maxWidth: 440,
    backgroundColor: 'var(--neutral-white)',
    borderRadius: 'var(--radius-xl)', padding: '2.5rem 2rem',
    boxShadow: '0 32px 64px -12px rgba(0,0,0,.12)',
    border: '1px solid var(--neutral-border)',
    textAlign: 'center',
  },
  iconRing: {
    width: 90, height: 90, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1.5rem',
  },
  heading: {
    fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem',
  },
  sub: {
    fontSize: '0.84rem', color: 'var(--neutral-muted)',
    fontWeight: 500, lineHeight: 1.6, marginBottom: '1.25rem',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    fontWeight: 700, fontSize: '0.8rem',
    padding: '0.5rem 1.1rem', borderRadius: '999px',
    border: '1px solid', marginBottom: '1.25rem',
  },
  detailBox: {
    backgroundColor: 'var(--neutral-light)',
    border: '1px solid var(--neutral-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '0.9rem 1rem',
    marginBottom: '1rem',
    textAlign: 'left',
  },
  detailRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '0.8rem', padding: '0.25rem 0',
    borderBottom: '1px solid var(--neutral-border)',
  },
  detailLabel: { color: 'var(--neutral-muted)', fontWeight: 600 },
  detailValue: { fontWeight: 700, color: 'var(--neutral-text)' },
  infoBox: {
    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
    backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
    borderRadius: 'var(--radius-lg)', padding: '0.75rem',
    fontSize: '0.76rem', color: '#15803d', fontWeight: 500,
    lineHeight: 1.5, textAlign: 'left', marginBottom: '1rem',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.35rem', background: 'none', border: 'none',
    color: 'var(--neutral-muted)', fontSize: '0.78rem',
    fontWeight: 600, cursor: 'pointer', marginTop: '0.75rem', width: '100%',
  },
};
