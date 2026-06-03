import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { AddressSelector } from '../components/AddressSelector';
import {
  Store, User, FileText, Phone, MapPin, ChevronDown,
  CheckCircle2, AlertCircle, Loader2, ArrowRight, LogOut, Package
} from 'lucide-react';

const CATEGORIES = [
  { value: 'grocery',    label: 'Grocery & Staples' },
  { value: 'food',       label: 'Restaurant & Food' },
  { value: 'fruits-veg', label: 'Fruits & Vegetables' },
  { value: 'medicine',   label: 'Medicines & Health' },
  { value: 'essentials', label: 'Daily Essentials' },
];

export const StoreRegistrationView = () => {
  const { submitVendorRegistration, logout, showToast } = useContext(AppContext);

  const [form, setForm] = useState({
    storeName: '', ownerName: '', gstNumber: '',
    mobile: '', extraAddress: '', detectedAddress: '', category: 'grocery', minOrder: '99',
    coords: null
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionSuccess, setDetectionSuccess] = useState(false);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by this browser.', 'error');
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (response.ok) {
            const data = await response.json();
            if (data && data.display_name) {
              setForm(f => ({
                ...f,
                detectedAddress: data.display_name,
                coords: { lat, lng }
              }));
              setDetectionSuccess(true);
              setIsDetecting(false);
              showToast('Store location auto-detected successfully!', 'success');
              return;
            }
          }
        } catch (err) {
          console.error('Nominatim reverse geocoding failed:', err);
        }
        
        // Fallback if geocoding fails but GPS coordinates are retrieved
        setForm(f => ({
          ...f,
          detectedAddress: `Coordinates: (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          coords: { lat, lng }
        }));
        setDetectionSuccess(true);
        setIsDetecting(false);
        showToast('Store GPS coordinates captured!', 'success');
      },
      (error) => {
        console.error('GPS Geolocation error:', error);
        setIsDetecting(false);
        showToast('Failed to access location services. Please check permissions.', 'error');
      }
    );
  };

  // Run automatically on page load
  useEffect(() => {
    detectLocation();
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.storeName.trim())  errs.storeName  = 'Store name is required.';
    if (!form.ownerName.trim())  errs.ownerName  = 'Owner name is required.';
    if (!form.gstNumber.trim())  errs.gstNumber  = 'GST number is required.';
    else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber.trim().toUpperCase()))
      errs.gstNumber = 'Enter a valid 15-digit GST number.';
    if (!form.mobile.trim())     errs.mobile     = 'Mobile number is required.';
    else if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\s+/g, '').replace('+91', '')))
      errs.mobile = 'Enter a valid 10-digit Indian mobile number.';
    if (!form.coords)            errs.coords     = 'Store GPS location detection is required.';
    if (!form.extraAddress.trim()) errs.extraAddress = 'Manual address details are required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));

    // Combine manual address details with the geocoded address
    const fullAddress = `${form.extraAddress.trim()}, ${form.detectedAddress}`;
    const ok = submitVendorRegistration({
      ...form,
      address: fullAddress
    });
    setIsLoading(false);
    if (ok) setSubmitted(true);
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.card, maxWidth: 460, textAlign: 'center' }} className="animate-fade-in">
          <div style={styles.successRing}>
            <CheckCircle2 size={44} color="#10b981" />
          </div>
          <h2 style={styles.heading}>Registration Submitted!</h2>
          <p style={styles.sub}>
            Your store details have been sent to the Admin for review.<br />
            You will gain access to the dashboard once approved.
          </p>
          <div style={styles.pendingBadge}>
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
      <div style={{ ...styles.card, maxWidth: 560 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={styles.iconRing('#f97316')}>
            <Store size={28} color="#f97316" />
          </div>
          <h2 style={styles.heading}>Register Your Store</h2>
          <p style={styles.sub}>
            Fill in your business details. Your account will go live after Admin approval.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          {/* Store Name */}
          <Field
            icon={<Store size={15} />}
            label="Store / Business Name"
            id="storeName"
            type="text"
            placeholder="e.g. Sharma Grocers"
            value={form.storeName}
            onChange={set('storeName')}
            error={errors.storeName}
          />

          {/* Owner Name */}
          <Field
            icon={<User size={15} />}
            label="Owner / Proprietor Name"
            id="ownerName"
            type="text"
            placeholder="e.g. Rakesh Sharma"
            value={form.ownerName}
            onChange={set('ownerName')}
            error={errors.ownerName}
          />

          {/* GST Number */}
          <Field
            icon={<FileText size={15} />}
            label="GST Registration Number"
            id="gstNumber"
            type="text"
            placeholder="e.g. 07AAACB2230M1ZX"
            value={form.gstNumber}
            onChange={(e) => { setForm(f => ({ ...f, gstNumber: e.target.value.toUpperCase() })); setErrors(er => ({ ...er, gstNumber: '' })); }}
            error={errors.gstNumber}
            hint="15-character alphanumeric GST identification number"
          />

          {/* Mobile */}
          <Field
            icon={<Phone size={15} />}
            label="Business Mobile Number"
            id="mobile"
            type="tel"
            placeholder="e.g. 9876543210"
            value={form.mobile}
            onChange={set('mobile')}
            error={errors.mobile}
          />

          {/* Store Location Map Selector */}
          <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--neutral-light)',
            border: '1px solid var(--neutral-border)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ ...styles.label, marginBottom: 0 }}>Store Location & Address</label>
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className="btn btn-sm btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: form.coords ? 'var(--primary-green)' : 'var(--accent-orange)',
                  borderColor: form.coords ? 'var(--primary-green)' : 'var(--accent-orange)',
                  fontWeight: 700
                }}
              >
                <MapPin size={13} />
                <span>{form.coords ? 'Edit on Map' : 'Locate on Map'}</span>
              </button>
            </div>

            <div style={{
              fontSize: '0.8rem',
              color: 'var(--neutral-text)',
              padding: '0.75rem',
              backgroundColor: 'var(--neutral-white)',
              border: '1px solid var(--neutral-border)',
              borderRadius: 'var(--radius-md)',
              minHeight: '40px',
              lineHeight: 1.4
            }}>
              {form.detectedAddress ? (
                <div>
                  <strong>📍 Selected Location:</strong>
                  <div style={{ marginTop: '0.25rem' }}>
                    {form.extraAddress ? `${form.extraAddress}, ` : ''}{form.detectedAddress}
                  </div>
                  {form.coords && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                      GPS: {form.coords.lat.toFixed(5)}, {form.coords.lng.toFixed(5)}
                    </div>
                  )}
                </div>
              ) : (
                <span style={{ color: 'var(--neutral-muted)' }}>No location selected. Tap "Locate on Map" to pick your store location.</span>
              )}
            </div>

            {errors.coords && (
              <p style={styles.errorText}>
                <AlertCircle size={12} /> {errors.coords}
              </p>
            )}
            {errors.extraAddress && (
              <p style={styles.errorText}>
                <AlertCircle size={12} /> {errors.extraAddress}
              </p>
            )}
          </div>

          <AddressSelector
            isOpen={isMapOpen}
            onClose={() => setIsMapOpen(false)}
            onConfirm={(addrInfo) => {
              setForm(f => ({
                ...f,
                detectedAddress: addrInfo.details.locality,
                extraAddress: addrInfo.details.flat + (addrInfo.details.floor ? `, Floor ${addrInfo.details.floor}` : '') + (addrInfo.details.landmark ? ` (Landmark: ${addrInfo.details.landmark})` : ''),
                coords: addrInfo.coords
              }));
              setErrors(er => ({ ...er, coords: '', extraAddress: '' }));
              setIsMapOpen(false);
            }}
            initialCoords={form.coords || { lat: 28.62, lng: 77.36 }}
            initialDetails={{
              flat: form.extraAddress ? form.extraAddress.split(', Floor')[0] : '',
              locality: form.detectedAddress
            }}
            title="Set Store Location"
            confirmBtnText="Confirm Store Location"
            hideTags={true}
            userName={form.ownerName || ''}
            userPhone={form.mobile || ''}
          />

          {/* Category + Min Order */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label style={styles.label} htmlFor="category">Category</label>
              <div style={{ position: 'relative' }}>
                <Package size={14} style={styles.inputIcon} />
                <select
                  id="category"
                  value={form.category}
                  onChange={set('category')}
                  className="input-field"
                  style={{ paddingLeft: '2.25rem', paddingRight: '2rem', appearance: 'none' }}
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-muted)', pointerEvents: 'none' }} />
              </div>
            </div>
            <Field
              label="Min Order (₹)"
              id="minOrder"
              type="number"
              placeholder="99"
              value={form.minOrder}
              onChange={set('minOrder')}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={styles.submitBtn('#f97316')}
            className="btn btn-primary"
          >
            {isLoading
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
              : <><ArrowRight size={16} /> Submit for Approval</>
            }
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
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field"
        style={{
          paddingLeft: icon ? '2.25rem' : '0.85rem',
          borderColor: error ? '#ef4444' : undefined
        }}
      />
    </div>
    {error && (
      <p style={styles.errorText}>
        <AlertCircle size={12} /> {error}
      </p>
    )}
    {hint && !error && <p style={styles.hintText}>{hint}</p>}
  </div>
);

/* ── Inline styles ── */
const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    background: 'radial-gradient(ellipse at 70% 10%, #fff7ed 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, #ecfdf5 0%, transparent 50%)',
  },
  card: {
    width: '100%',
    backgroundColor: 'var(--neutral-white)',
    borderRadius: 'var(--radius-xl)',
    padding: '2.25rem',
    boxShadow: '0 32px 64px -12px rgba(0,0,0,.12)',
    border: '1px solid var(--neutral-border)',
  },
  iconRing: (color) => ({
    width: 68, height: 68, borderRadius: '50%',
    background: `${color}18`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1rem',
    boxShadow: `0 0 0 8px ${color}10`,
  }),
  heading: {
    fontSize: '1.35rem', fontWeight: 800,
    color: 'var(--neutral-text)', marginBottom: '0.35rem',
  },
  sub: {
    fontSize: '0.82rem', color: 'var(--neutral-muted)',
    fontWeight: 500, lineHeight: 1.55,
  },
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
  hintText: {
    color: 'var(--neutral-muted)', fontSize: '0.68rem', fontWeight: 500, marginTop: '0.25rem',
  },
  submitBtn: (color) => ({
    padding: '0.9rem',
    fontSize: '0.95rem',
    marginTop: '0.25rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
  }),
  successRing: {
    width: 80, height: 80, borderRadius: '50%',
    background: '#ecfdf5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1.25rem',
    boxShadow: '0 0 0 10px #d1fae5',
  },
  pendingBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    backgroundColor: '#fef3c7', color: '#d97706',
    fontWeight: 700, fontSize: '0.8rem',
    padding: '0.5rem 1rem', borderRadius: '999px',
    border: '1px solid #fde68a',
    marginTop: '1.25rem', marginBottom: '0.5rem',
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.35rem', background: 'none', border: 'none',
    color: 'var(--neutral-muted)', fontSize: '0.75rem',
    fontWeight: 600, cursor: 'pointer',
    marginTop: '1.25rem', width: '100%',
  },
};
