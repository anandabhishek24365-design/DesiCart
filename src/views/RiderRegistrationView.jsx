import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Bike, User, Phone, Car, FileText,
  CheckCircle2, AlertCircle, Loader2, ArrowRight, LogOut, ChevronDown
} from 'lucide-react';

const VEHICLE_TYPES = [
  { value: 'bike',    label: '🏍️  Motorcycle / Bike' },
  { value: 'scooter', label: '🛵  Scooter' },
  { value: 'cycle',   label: '🚲  Bicycle' },
  { value: 'car',     label: '🚗  Car' },
  { value: 'ev',      label: '⚡  Electric Vehicle' },
  { value: 'other',   label: '📦  Other' },
];

export const RiderRegistrationView = () => {
  const { submitRiderRegistration, logout } = useContext(AppContext);

  const [form, setForm] = useState({
    riderName: '', mobile: '', vehicleNumber: '',
    vehicleType: 'bike', licenseNumber: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.riderName.trim())     errs.riderName     = 'Full name is required.';
    if (!form.mobile.trim())        errs.mobile        = 'Mobile number is required.';
    else if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\s+/g, '').replace('+91', '')))
      errs.mobile = 'Enter a valid 10-digit Indian mobile number.';
    if (!form.vehicleNumber.trim()) errs.vehicleNumber = 'Vehicle registration number is required.';
    else if (!/^[A-Z]{2}\s?\d{2}\s?[A-Z]{1,2}\s?\d{4}$/i.test(form.vehicleNumber.trim()))
      errs.vehicleNumber = 'Enter a valid vehicle number (e.g. DL 01 AB 1234).';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const ok = submitRiderRegistration(form);
    setIsLoading(false);
    if (ok) setSubmitted(true);
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, maxWidth: 460, textAlign: 'center' }} className="animate-fade-in">
          <div style={styles.successRing}>
            <CheckCircle2 size={44} color="#06b6d4" />
          </div>
          <h2 style={styles.heading}>Registration Submitted!</h2>
          <p style={styles.sub}>
            Your rider profile has been sent for Admin review.<br />
            You'll get access to the delivery dashboard once approved.
          </p>
          <div style={{ ...styles.pendingBadge, background: '#e0f7fa', color: '#0e7490', borderColor: '#a5f3fc' }}>
            <Loader2 size={14} style={{ animation: 'spin 1.4s linear infinite' }} />
            Awaiting Admin Approval
          </div>
          <button onClick={logout} style={styles.logoutBtn}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <div style={styles.page} className="animate-fade-in">
      <div style={{ ...styles.card, maxWidth: 520 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={styles.iconRing('#06b6d4')}>
            <Bike size={28} color="#06b6d4" />
          </div>
          <h2 style={styles.heading}>Register as a Rider</h2>
          <p style={styles.sub}>
            Share your vehicle details to join the DesiCart delivery network.<br />
            Your profile will go active after Admin approval.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {/* Rider Name */}
          <Field icon={<User size={15} />} label="Full Name" id="riderName" type="text"
            placeholder="e.g. Rahul Sharma" value={form.riderName} onChange={set('riderName')} error={errors.riderName} />

          {/* Mobile */}
          <Field icon={<Phone size={15} />} label="Mobile Number" id="mobile" type="tel"
            placeholder="e.g. 9876543210" value={form.mobile} onChange={set('mobile')} error={errors.mobile} />

          {/* Vehicle Number */}
          <Field icon={<Car size={15} />} label="Vehicle Registration Number" id="vehicleNumber" type="text"
            placeholder="e.g. DL 01 AB 1234"
            value={form.vehicleNumber}
            onChange={(e) => { setForm(f => ({ ...f, vehicleNumber: e.target.value.toUpperCase() })); setErrors(er => ({ ...er, vehicleNumber: '' })); }}
            error={errors.vehicleNumber}
            hint="As printed on your vehicle's registration certificate (RC Book)"
          />

          {/* Vehicle Type */}
          <div>
            <label style={styles.label} htmlFor="vehicleType">Vehicle Type</label>
            <div style={{ position: 'relative' }}>
              <Bike size={14} style={styles.inputIcon} />
              <select id="vehicleType" value={form.vehicleType} onChange={set('vehicleType')}
                className="input-field"
                style={{ paddingLeft: '2.25rem', paddingRight: '2rem', appearance: 'none' }}>
                {VEHICLE_TYPES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-muted)', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* License (optional) */}
          <Field icon={<FileText size={15} />} label="Driving License Number (Optional)" id="licenseNumber" type="text"
            placeholder="e.g. DL-2010-0112345" value={form.licenseNumber} onChange={set('licenseNumber')} error={errors.licenseNumber}
            hint="Leave blank if you don't have a license (for cycles/EVs)" />

          <button type="submit" disabled={isLoading}
            style={{ ...styles.submitBtn, background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
            className="btn btn-primary">
            {isLoading
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
              : <><ArrowRight size={16} /> Submit for Approval</>}
          </button>
        </form>

        <button onClick={logout} style={styles.logoutBtn}>
          <LogOut size={13} /> Sign out and use a different account
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

/* ── Reusable field component ── */
const Field = ({ icon, label, id, type, placeholder, value, onChange, error, hint }) => (
  <div>
    <label style={styles.label} htmlFor={id}>{label}</label>
    <div style={{ position: 'relative' }}>
      {icon && <span style={styles.inputIcon}>{icon}</span>}
      <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="input-field"
        style={{ paddingLeft: icon ? '2.25rem' : '0.85rem', borderColor: error ? '#ef4444' : undefined }} />
    </div>
    {error && <p style={styles.errorText}><AlertCircle size={12} /> {error}</p>}
    {hint && !error && <p style={styles.hintText}>{hint}</p>}
  </div>
);

/* ── Inline styles ── */
const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '2rem 1rem',
    background: 'radial-gradient(ellipse at 70% 10%, #e0f7fa 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, #ecfdf5 0%, transparent 50%)',
  },
  card: {
    width: '100%', backgroundColor: 'var(--neutral-white)',
    borderRadius: 'var(--radius-xl)', padding: '2.25rem',
    boxShadow: '0 32px 64px -12px rgba(0,0,0,.12)',
    border: '1px solid var(--neutral-border)',
  },
  iconRing: (color) => ({
    width: 68, height: 68, borderRadius: '50%',
    background: `${color}18`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1rem', boxShadow: `0 0 0 8px ${color}10`,
  }),
  heading: { fontSize: '1.35rem', fontWeight: 800, color: 'var(--neutral-text)', marginBottom: '0.35rem' },
  sub: { fontSize: '0.82rem', color: 'var(--neutral-muted)', fontWeight: 500, lineHeight: 1.55 },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' },
  label: { fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem', color: 'var(--neutral-text)' },
  inputIcon: {
    position: 'absolute', left: 12, top: '50%',
    transform: 'translateY(-50%)', color: 'var(--neutral-muted)',
    display: 'flex', alignItems: 'center',
  },
  errorText: {
    display: 'flex', alignItems: 'center', gap: '0.25rem',
    color: '#ef4444', fontSize: '0.7rem', fontWeight: 600, marginTop: '0.3rem',
  },
  hintText: { color: 'var(--neutral-muted)', fontSize: '0.68rem', fontWeight: 500, marginTop: '0.25rem' },
  submitBtn: {
    padding: '0.9rem', fontSize: '0.95rem', marginTop: '0.25rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
  },
  successRing: {
    width: 80, height: 80, borderRadius: '50%', background: '#cffafe',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1.25rem', boxShadow: '0 0 0 10px #e0f7fa',
  },
  pendingBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    fontWeight: 700, fontSize: '0.8rem',
    padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid',
    marginTop: '1.25rem', marginBottom: '0.5rem',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.35rem', background: 'none', border: 'none',
    color: 'var(--neutral-muted)', fontSize: '0.75rem',
    fontWeight: 600, cursor: 'pointer', marginTop: '1.25rem', width: '100%',
  },
};
