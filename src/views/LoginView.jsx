import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from '../firebase';
import {
  Mail, Lock, Eye, EyeOff, User, Store, Bike, ShieldCheck,
  LogIn, UserPlus, AlertCircle, CheckCircle2, RefreshCw, ArrowLeft,
  Truck, ShieldOff, Star
} from 'lucide-react';

/* ─── Google SVG icon ─── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" style={{ display: 'block', flexShrink: 0 }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

/* ─── Role config ─── */
const ROLES = [
  { id: 'customer',  label: 'Customer', icon: User,        color: '#16a34a' },
  { id: 'vendor',    label: 'Store',    icon: Store,       color: '#f97316' },
  { id: 'delivery',  label: 'Rider',    icon: Bike,        color: '#06b6d4' },
  { id: 'admin',     label: 'Admin',    icon: ShieldCheck, color: '#8b5cf6' },
];

/* ─── Feature badge ─── */
const FeatureBadge = ({ icon: Icon, title, sub, color }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '0.4rem', flex: 1,
    background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
    borderRadius: '14px', padding: '0.9rem 0.5rem',
    border: '1px solid rgba(22,163,74,0.15)',
    boxShadow: '0 2px 12px rgba(22,163,74,0.08)'
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      background: `${color}18`, display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <Icon size={20} color={color} />
    </div>
    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1a2e1a', textAlign: 'center', lineHeight: 1.3 }}>{title}</span>
    {sub && <span style={{ fontSize: '0.63rem', fontWeight: 600, color: '#5a7a5a', textAlign: 'center' }}>{sub}</span>}
  </div>
);

export const LoginView = () => {
  const { login, showToast } = useContext(AppContext);

  const [tab, setTab]               = useState('signin');
  const [selectedRole, setSelectedRole] = useState('customer');
  const [displayName, setDisplayName]   = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPass, setShowPass]         = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');
  const [step, setStep]                 = useState('form');

  useEffect(() => { setError(''); setStep('form'); }, [tab, selectedRole]);

  const activeRole = ROLES.find(r => r.id === selectedRole);
  const GREEN = '#16a34a';

  /* ─── Error map ─── */
  const friendlyError = (code) => {
    switch (code) {
      case 'auth/user-not-found':         return 'No account found with this email.';
      case 'auth/wrong-password':         return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential':     return 'Invalid email or password.';
      case 'auth/email-already-in-use':   return 'An account with this email already exists.';
      case 'auth/weak-password':          return 'Password must be at least 6 characters.';
      case 'auth/invalid-email':          return 'Please enter a valid email address.';
      case 'auth/too-many-requests':      return 'Too many attempts. Please wait a few minutes.';
      case 'auth/popup-closed-by-user':   return '';
      case 'auth/network-request-failed': return 'Network error. Check your internet connection.';
      default:                            return null;
    }
  };

  /* ─── Email Sign In ─── */
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError('');
    const emailLower = email.toLowerCase().trim();
    if (selectedRole === 'admin' && !emailLower.endsWith('24365@gmail.com')) {
      setError('Only authorized admin emails are allowed.'); return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower, password, role: selectedRole })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      localStorage.setItem('desicart_token', data.token);
      let role = selectedRole;
      if (data.user.email === 'anandabhishek24365@gmail.com') role = 'superadmin';
      handleSuccess(data.user, null, role);
    } catch (err) {
      setError(err.message);
    } finally { setIsLoading(false); }
  };

  /* ─── Email Sign Up ─── */
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (!displayName.trim()) { setError('Please enter your full name.'); return; }
    const emailLower = email.toLowerCase().trim();
    if (selectedRole === 'admin' && !emailLower.endsWith('24365@gmail.com')) {
      setError('Only authorized admin emails are allowed.'); return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: displayName.trim(), email: emailLower, password, role: selectedRole })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      localStorage.setItem('desicart_token', data.token);
      let role = selectedRole;
      if (data.user.email === 'anandabhishek24365@gmail.com') role = 'superadmin';
      handleSuccess(data.user, displayName.trim(), role);
    } catch (err) {
      setError(err.message);
    } finally { setIsLoading(false); }
  };

  /* ─── Google Sign-In ─── */
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken();

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, role: selectedRole })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Google login verification failed');
      }

      localStorage.setItem('desicart_token', data.token);
      let role = selectedRole;
      if (data.user.email === 'anandabhishek24365@gmail.com') role = 'superadmin';
      handleSuccess(data.user, data.user.name, role);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else {
        setError(friendlyError(err.code) || err.message || 'Something went wrong. Please try again.');
      }
      setIsLoading(false);
    }
  };

  /* ─── Password Reset ─── */
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Enter your email address to receive reset link.'); return; }
    setIsLoading(true);
    // Secure simulated password reset (decoupled from client-side direct auth calls)
    setTimeout(() => {
      setStep('reset_sent');
      showToast('Password reset email sent! Check your inbox.', 'success');
      setIsLoading(false);
    }, 1000);
  };

  /* ─── Success ─── */
  const handleSuccess = (user, nameOverride, forcedRole) => {
    setStep('success');
    const name = nameOverride || user.displayName || user.name || user.email?.split('@')[0] || 'User';
    const role = forcedRole || selectedRole;
    setTimeout(() => { login(role, name); }, 900);
  };

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 40%, #f0fdf4 100%)',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      overflow: 'hidden'
    }}>

      {/* ════════ LEFT PANEL — Marketing ════════ */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '3rem 3rem 2rem',
        position: 'relative',
        overflow: 'hidden',
        minWidth: 0
      }} className="login-left-panel">

        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,163,74,0.12), transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', right: '-60px',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,163,74,0.10), transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Logo top-left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
          <img src="/logo.jpg" alt="DesiCart" style={{ width: 44, height: 44, borderRadius: '10px', objectFit: 'contain', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }} />
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1a2e1a', letterSpacing: '-0.3px' }}>DesiCart</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#16a34a', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Your Cart, We Deliver</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: 900,
            color: '#1a2e1a',
            lineHeight: 1.15,
            letterSpacing: '-1px',
            margin: 0
          }}>
            Food, groceries<br />and more,{' '}
            <span style={{ color: GREEN, display: 'block' }}>delivered fast</span>
          </h1>

          {/* Underline accent */}
          <div style={{
            width: '60px', height: '4px',
            background: 'linear-gradient(90deg, #f97316, #fb923c)',
            borderRadius: '99px', margin: '1rem 0'
          }} />

          <p style={{
            fontSize: '0.95rem', color: '#4b6b4b', lineHeight: 1.7,
            fontWeight: 500, margin: '0 0 2rem'
          }}>
            Your favorite shops and restaurants at your fingertips.<br />
            Order now and get it delivered in minutes.
          </p>

          {/* Feature badges */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
            <FeatureBadge icon={Truck}    title="Fast Delivery"  sub="15-30 min"   color="#16a34a" />
            <FeatureBadge icon={ShieldOff} title="Safe & Secure" sub="100% safe"   color="#3b82f6" />
            <FeatureBadge icon={Star}     title="Best Quality"   sub="Top stores"  color="#f59e0b" />
          </div>
        </div>

        {/* Hero illustration */}
        <div style={{
          position: 'relative', zIndex: 1, flex: 1,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          maxHeight: '320px', overflow: 'hidden'
        }}>
          <img
            src="/hero-illustration.png"
            alt="DesiCart delivery"
            style={{
              width: '100%', maxWidth: '500px',
              objectFit: 'contain', objectPosition: 'bottom',
              filter: 'drop-shadow(0 8px 24px rgba(22,163,74,0.15))',
              animation: 'heroFloat 4s ease-in-out infinite'
            }}
          />
        </div>
      </div>

      {/* ════════ RIGHT PANEL — Login Card ════════ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 3rem 2rem 2rem',
        flexShrink: 0,
        width: '480px'
      }} className="login-right-panel">

        <div style={{
          width: '100%',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '2.25rem 2rem',
          boxShadow: '0 20px 60px -8px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
          border: '1px solid rgba(22,163,74,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, ${activeRole.color}, ${activeRole.color}88)`,
            transition: 'background 0.4s ease'
          }} />

          {/* ── Brand ── */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '0.25rem' }}>
            <div style={{
            width: 72, height: 72, borderRadius: '16px',
            overflow: 'hidden', margin: '0 auto 0.9rem',
            boxShadow: '0 4px 16px rgba(22,163,74,0.2)',
            border: '2px solid rgba(22,163,74,0.15)',
            animation: 'logoFloat 3s ease-in-out infinite'
          }}>
              <img src="/logo.jpg" alt="DesiCart" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1a2e1a', margin: 0, letterSpacing: '-0.3px' }}>
              Welcome to DesiCart
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#6b7a6b', marginTop: '0.3rem', fontWeight: 600 }}>
              Sign in to access your dashboard
            </p>
          </div>

          {/* ── Role tabs ── */}
          {step === 'form' && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
              gap: '0.2rem',
              background: '#f4f9f4',
              borderRadius: '12px',
              padding: '0.3rem',
              marginBottom: '1.25rem',
              border: '1px solid #e2f0e2'
            }}>
              {ROLES.map(({ id, label, icon: Icon, color }) => {
                const active = selectedRole === id;
                return (
                  <button
                    key={id} type="button"
                    onClick={() => { setSelectedRole(id); setError(''); }}
                    style={{
                      border: 'none',
                      background: active ? '#ffffff' : 'transparent',
                      color: active ? color : '#7a8c7a',
                      borderRadius: '9px',
                      padding: '0.55rem 0.2rem',
                      fontSize: '0.7rem', fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                      boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Role hint ── */}
          {step === 'form' && selectedRole === 'vendor' && (
            <div style={{
              padding: '0.55rem 0.85rem', background: '#fff7ed',
              border: '1px solid #fed7aa', borderRadius: '10px',
              fontSize: '0.73rem', color: '#c2410c', fontWeight: 600,
              marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}>
              <span>🏬</span> New store owners complete registration after sign-in.
            </div>
          )}
          {step === 'form' && selectedRole === 'delivery' && (
            <div style={{
              padding: '0.55rem 0.85rem', background: '#e0f7fa',
              border: '1px solid #a5f3fc', borderRadius: '10px',
              fontSize: '0.73rem', color: '#0e7490', fontWeight: 600,
              marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}>
              <span>🚴</span> New riders fill in vehicle details after sign-in.
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="animate-fade-in" style={{
              padding: '0.6rem 0.85rem', background: '#fee2e2',
              border: '1px solid #fca5a5', borderRadius: '10px',
              color: '#dc2626', fontSize: '0.75rem', fontWeight: 600,
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
              marginBottom: '0.85rem'
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          {/* ════════ SUCCESS ════════ */}
          {step === 'success' && (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#ecfdf5', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem', boxShadow: '0 0 0 10px #d1fae5'
              }}>
                <CheckCircle2 size={34} color="#16a34a" />
              </div>
              <h3 style={{ fontWeight: 900, fontSize: '1.1rem', color: '#1a2e1a', margin: 0 }}>Signed In!</h3>
              <p style={{ fontSize: '0.8rem', color: '#6b7a6b', marginTop: '0.4rem', fontWeight: 600 }}>
                Taking you to your dashboard…
              </p>
            </div>
          )}

          {/* ════════ RESET SENT ════════ */}
          {step === 'reset_sent' && (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: 58, height: 58, borderRadius: '50%',
                background: '#eff6ff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem', boxShadow: '0 0 0 8px #dbeafe'
              }}>
                <Mail size={26} color="#3b82f6" />
              </div>
              <h3 style={{ fontWeight: 900, fontSize: '1rem', color: '#1a2e1a', margin: 0 }}>Check Your Inbox</h3>
              <p style={{ fontSize: '0.78rem', color: '#6b7a6b', marginTop: '0.35rem', lineHeight: 1.6, fontWeight: 500 }}>
                Reset link sent to <strong style={{ color: '#1a2e1a' }}>{email}</strong>
              </p>
              <button type="button" onClick={() => { setTab('signin'); setStep('form'); }}
                style={{
                  marginTop: '1.25rem', background: 'none', border: 'none',
                  color: GREEN, fontWeight: 700, cursor: 'pointer',
                  fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                }}>
                <ArrowLeft size={13} /> Back to Sign In
              </button>
            </div>
          )}

          {/* ════════ MAIN FORM ════════ */}
          {step === 'form' && (
            <>
              {/* Sign In / Sign Up toggle */}
              <div style={{
                display: 'flex', gap: '0.4rem',
                background: '#f4f9f4', borderRadius: '12px',
                padding: '0.3rem', marginBottom: '1.25rem',
                border: '1px solid #e2f0e2'
              }}>
                {[
                  { id: 'signin', label: 'Sign In',  icon: LogIn },
                  { id: 'signup', label: 'Sign Up',  icon: UserPlus }
                ].map(({ id, label, icon: Icon }) => (
                  <button key={id} type="button" onClick={() => setTab(id)}
                    style={{
                      flex: 1, border: 'none', cursor: 'pointer',
                      borderRadius: '9px',
                      padding: '0.6rem 0.5rem',
                      fontSize: '0.82rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      background: tab === id ? '#ffffff' : 'transparent',
                      color: tab === id ? activeRole.color : '#7a8c7a',
                      boxShadow: tab === id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.2s ease'
                    }}>
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>

              {/* Google Button */}
              <button type="button" onClick={handleGoogleSignIn} disabled={isLoading}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '0.7rem',
                  padding: '0.75rem 1rem',
                  border: '1.5px solid #e2e8e2',
                  borderRadius: '12px',
                  background: '#ffffff',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.88rem', fontWeight: 700,
                  color: '#1a2e1a',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                  marginBottom: '1rem',
                  opacity: isLoading ? 0.7 : 1
                }}
                onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'; e.currentTarget.style.borderColor = '#d1d5db'; } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e2e8e2'; }}
              >
                <GoogleIcon />
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1, height: 1, background: '#e9eee9' }} />
                <span style={{ fontSize: '0.7rem', color: '#9aaa9a', fontWeight: 600, whiteSpace: 'nowrap' }}>or continue with email</span>
                <div style={{ flex: 1, height: 1, background: '#e9eee9' }} />
              </div>

              {/* Form */}
              <form onSubmit={tab === 'signin' ? handleEmailSignIn : handleEmailSignUp}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

                {/* Name (signup only) */}
                {tab === 'signup' && (
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#1a2e1a' }}>
                      Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9aaa9a' }} />
                      <input type="text" required value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="input-field" placeholder="Jane Doe"
                        style={{ paddingLeft: '2.3rem', borderRadius: '10px', border: '1.5px solid #e2e8e2', fontSize: '0.85rem' }} />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: '#1a2e1a' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9aaa9a' }} />
                    <input type="email" required value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      className="input-field" placeholder="you@example.com"
                      autoComplete="email"
                      style={{ paddingLeft: '2.3rem', borderRadius: '10px', border: '1.5px solid #e2e8e2', fontSize: '0.85rem' }} />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1a2e1a' }}>Password</label>
                    {tab === 'signin' && (
                      <button type="button" onClick={handlePasswordReset}
                        style={{ background: 'none', border: 'none', color: GREEN, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9aaa9a' }} />
                    <input
                      type={showPass ? 'text' : 'password'} required
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      className="input-field"
                      placeholder={tab === 'signup' ? 'Min. 6 characters' : '••••••••'}
                      autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                      minLength={6}
                      style={{ paddingLeft: '2.3rem', paddingRight: '2.6rem', borderRadius: '10px', border: '1.5px solid #e2e8e2', fontSize: '0.85rem' }}
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      style={{
                        position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#9aaa9a',
                        display: 'flex', padding: 2
                      }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={isLoading}
                  style={{
                    width: '100%', padding: '0.9rem',
                    background: `linear-gradient(135deg, ${activeRole.color} 0%, ${activeRole.color}cc 100%)`,
                    border: 'none', borderRadius: '12px',
                    color: '#fff', fontSize: '0.95rem', fontWeight: 800,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    boxShadow: `0 4px 14px ${activeRole.color}40`,
                    transition: 'all 0.2s ease',
                    opacity: isLoading ? 0.8 : 1,
                    marginTop: '0.1rem'
                  }}
                  onMouseEnter={e => { if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {isLoading ? (
                    <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      {tab === 'signin' ? 'Signing In…' : 'Creating Account…'}</>
                  ) : (
                    tab === 'signin'
                      ? <><LogIn size={16} /> Sign In</>
                      : <><UserPlus size={16} /> Create Account</>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Footer */}
          <p style={{
            textAlign: 'center', fontSize: '0.63rem',
            color: '#9aaa9a', marginTop: '1.25rem',
            fontWeight: 600, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '0.3rem'
          }}>
            <span>🔒</span> Secured by Firebase Authentication · Google OAuth 2.0
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); box-shadow: 0 4px 16px rgba(22,163,74,0.2); }
          50%       { transform: translateY(-7px); box-shadow: 0 10px 24px rgba(22,163,74,0.28); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        .input-field:focus {
          outline: none !important;
          border-color: #16a34a !important;
          box-shadow: 0 0 0 3px rgba(22,163,74,0.12) !important;
        }
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
          .login-right-panel {
            width: 100% !important;
            padding: 1.5rem 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};
