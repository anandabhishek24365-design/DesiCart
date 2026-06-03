import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from '../firebase';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Store,
  Bike,
  ShieldCheck,
  Sparkles,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  KeyRound
} from 'lucide-react';

/* ─── Google SVG icon (no external dependency) ─── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" style={{ display: 'block' }}>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

/* ─── Role tabs config ─── */
const ROLES = [
  { id: 'customer',  label: 'Customer', icon: User,        color: '#10b981' },
  { id: 'vendor',    label: 'Store',    icon: Store,       color: '#f97316' },
  { id: 'delivery',  label: 'Rider',    icon: Bike,        color: '#06b6d4' },
  { id: 'admin',     label: 'Admin',    icon: ShieldCheck, color: '#8b5cf6' },
];

export const LoginView = () => {
  const { login, showToast } = useContext(AppContext);

  /* ── Tab: 'signin' | 'signup' | 'reset' ── */
  const [tab, setTab] = useState('signin');

  /* ── Role selector ── */
  const [selectedRole, setSelectedRole] = useState('customer');

  /* ── Form fields ── */
  const [displayName, setDisplayName] = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);

  /* ── UI helpers ── */
  const [isLoading, setIsLoading]   = useState(false);
  const [error,     setError]       = useState('');
  const [step,      setStep]        = useState('form'); // 'form' | 'success' | 'reset_sent'

  /* Reset errors when switching tabs */
  useEffect(() => { setError(''); setStep('form'); }, [tab, selectedRole]);

  // Handled globally in AppContext.jsx

  const activeRole = ROLES.find(r => r.id === selectedRole);

  /* ─── Map Firebase error codes → friendly messages ─── */
  const friendlyError = (code) => {
    switch (code) {
      case 'auth/user-not-found':          return 'No account found with this email.';
      case 'auth/wrong-password':          return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential':      return 'Invalid email or password.';
      case 'auth/email-already-in-use':    return 'An account with this email already exists. Sign in instead.';
      case 'auth/weak-password':           return 'Password must be at least 6 characters.';
      case 'auth/invalid-email':           return 'Please enter a valid email address.';
      case 'auth/too-many-requests':       return 'Too many attempts. Please wait a few minutes.';
      case 'auth/popup-closed-by-user':    return 'Google sign-in was cancelled. Please try again.';
      case 'auth/network-request-failed':  return 'Network error. Check your internet connection.';
      default:                             return 'Something went wrong. Please try again.';
    }
  };

  /* ─── Sign In with Email ─── */
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError('');

    const emailLower = email.trim().toLowerCase();
    const isSuperAdminEmail = emailLower === 'anandabhishek24365@gmail.com';
    const isAdminEmail = emailLower.endsWith('24365@gmail.com');

    if (selectedRole === 'admin') {
      if (!isAdminEmail) {
        setError('Only authorized admin emails are allowed.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      let role = selectedRole;
      if (result.user.email.toLowerCase() === 'anandabhishek24365@gmail.com') {
        role = 'superadmin';
      }
      handleSuccess(result.user, null, role);
    } catch (err) {
      console.error("Email Sign-In Error:", err);
      setError(`${friendlyError(err.code)} (Code: ${err.code || 'unknown'})`);
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Sign Up with Email ─── */
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError('');
    if (!displayName.trim()) { setError('Please enter your full name.'); return; }

    const emailLower = email.trim().toLowerCase();
    const isAdminEmail = emailLower.endsWith('24365@gmail.com');

    if (selectedRole === 'admin') {
      if (!isAdminEmail) {
        setError('Only authorized admin emails are allowed.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: displayName.trim() });
      let role = selectedRole;
      if (result.user.email.toLowerCase() === 'anandabhishek24365@gmail.com') {
        role = 'superadmin';
      }
      handleSuccess(result.user, displayName.trim(), role);
    } catch (err) {
      console.error("Email Sign-Up Error:", err);
      setError(`${friendlyError(err.code)} (Code: ${err.code || 'unknown'})`);
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Google Sign-In ─── */
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    
    // Save current selected role to local storage to persist it across redirect
    localStorage.setItem('delivery_platform_auth_attempt_role', selectedRole);

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    try {
      if (isLocalhost) {
        // Use fast popup on localhost
        const result = await signInWithPopup(auth, googleProvider);
        const emailLower = result.user.email.toLowerCase();
        const isAdminEmail = emailLower.endsWith('24365@gmail.com');

        let role = selectedRole;
        if (role === 'admin' && !isAdminEmail) {
          setError('Only authorized admin emails are allowed.');
          await auth.signOut();
          return;
        }

        if (emailLower === 'anandabhishek24365@gmail.com') {
          role = 'superadmin';
        }

        handleSuccess(result.user, null, role);
      } else {
        // Use 100% reliable redirect on Vercel production
        await signInWithRedirect(auth, googleProvider);
      }
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setError(`${friendlyError(err.code)} (Code: ${err.code || 'unknown'})`);
      setIsLoading(false);
    }
  };

  /* ─── Password Reset ─── */
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Enter your email address above to receive reset link.'); return; }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setStep('reset_sent');
      showToast('Password reset email sent! Check your inbox.', 'success');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── After successful auth ─── */
  const handleSuccess = (user, nameOverride, forcedRole) => {
    setStep('success');
    const name = nameOverride || user.displayName || user.email?.split('@')[0] || 'User';
    const role = forcedRole || selectedRole;
    setTimeout(() => {
      login(role, name);
    }, 900);
  };

  /* ─── Quick fill (dev) ─── */
  const quickFill = (em, pass, name = '') => {
    setEmail(em); setPassword(pass);
    if (name) setDisplayName(name);
    setError('');
  };

  /* ════════════════════════════════════ RENDER ════════════════════════════════════ */
  return (
    <div
      className="animate-fade-in"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
        background: `radial-gradient(ellipse at 65% 0%, ${activeRole?.color}20 0%, transparent 60%),
                     radial-gradient(ellipse at 15% 100%, var(--primary-green-light) 0%, transparent 55%)`
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 460,
          width: '100%',
          padding: '2rem',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,.15)',
          border: '1px solid var(--neutral-border)',
          backgroundColor: 'var(--neutral-white)',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative top bar */}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 4,
            background: `linear-gradient(90deg, ${activeRole?.color}, ${activeRole?.color}aa)`,
            borderRadius: '999px 999px 0 0',
            transition: 'background 0.4s ease'
          }}
        />

        {/* ── Brand header ── */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
          <img
            src="/logo.jpg"
            alt="DesiCart"
            className="animate-float"
            style={{
              width: 84, height: 84, objectFit: 'contain',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
              border: '2px solid var(--neutral-border)',
              marginBottom: '0.75rem'
            }}
          />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--neutral-text)', lineHeight: 1.2 }}>
            Welcome to DesiCart
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--neutral-muted)', marginTop: '0.2rem', fontWeight: 600 }}>
            Sign in to access your dashboard
          </p>
        </div>

        {/* ── Role selector ── */}
        {step === 'form' && (
          <div
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.25rem',
              backgroundColor: 'var(--neutral-light)', padding: '0.3rem',
              borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem',
              border: '1px solid var(--neutral-border)'
            }}
          >
            {ROLES.map(({ id, label, icon: Icon, color }) => {
              const active = selectedRole === id;
              return (
                <button
                  key={id} type="button"
                  onClick={() => { setSelectedRole(id); setError(''); }}
                  style={{
                    border: 'none',
                    background: active ? 'var(--neutral-white)' : 'transparent',
                    color: active ? color : 'var(--neutral-muted)',
                    borderRadius: 'var(--radius-md)', padding: '0.5rem 0.25rem',
                    fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem',
                    boxShadow: active ? 'var(--shadow-sm)' : 'none',
                    transition: 'var(--transition-all)'
                  }}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Role hint for vendor/delivery ── */}
        {step === 'form' && selectedRole === 'vendor' && (
          <div style={{
            padding: '0.6rem 0.85rem',
            backgroundColor: '#fff7ed', border: '1px solid #fed7aa',
            borderRadius: 'var(--radius-lg)', fontSize: '0.75rem',
            color: '#c2410c', fontWeight: 600, marginBottom: '0.75rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}>
            <span>🏬</span> New store owners will complete registration after sign-in.
          </div>
        )}
        {step === 'form' && selectedRole === 'delivery' && (
          <div style={{
            padding: '0.6rem 0.85rem',
            backgroundColor: '#e0f7fa', border: '1px solid #a5f3fc',
            borderRadius: 'var(--radius-lg)', fontSize: '0.75rem',
            color: '#0e7490', fontWeight: 600, marginBottom: '0.75rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem'
          }}>
            <span>🚴</span> New riders will fill in their vehicle details after sign-in.
          </div>
        )}

        {/* ── Error banner ── */}
        {error && (
          <div
            className="animate-fade-in"
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: '#fee2e2', border: '1px solid #fca5a5',
              borderRadius: 'var(--radius-lg)', color: '#dc2626',
              fontSize: '0.75rem', fontWeight: 600,
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
              marginBottom: '1rem'
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ════════════ SUCCESS SCREEN ════════════ */}
        {step === 'success' && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: 68, height: 68, borderRadius: '50%',
              background: '#ecfdf5', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 1rem',
              boxShadow: '0 0 0 8px #d1fae5'
            }}>
              <CheckCircle2 size={36} color="#10b981" />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--neutral-text)' }}>Signed In!</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-muted)', marginTop: '0.35rem', fontWeight: 600 }}>
              Taking you to your dashboard…
            </p>
          </div>
        )}

        {/* ════════════ RESET EMAIL SENT ════════════ */}
        {step === 'reset_sent' && (
          <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: '#eff6ff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 1rem',
              boxShadow: '0 0 0 8px #dbeafe'
            }}>
              <Mail size={28} color="#3b82f6" />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--neutral-text)' }}>Check Your Inbox</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--neutral-muted)', marginTop: '0.35rem', fontWeight: 500, lineHeight: 1.5 }}>
              A password reset link was sent to <strong style={{ color: 'var(--neutral-text)' }}>{email}</strong>
            </p>
            <button
              type="button"
              onClick={() => { setTab('signin'); setStep('form'); }}
              style={{
                marginTop: '1.25rem', background: 'none', border: 'none',
                color: 'var(--primary-green)', fontWeight: 700, cursor: 'pointer',
                fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
              }}
            >
              <ArrowLeft size={13} /> Back to Sign In
            </button>
          </div>
        )}

        {/* ════════════ MAIN FORM ════════════ */}
        {step === 'form' && (
          <>
            {/* ── Sign In / Sign Up tabs ── */}
            <div
              style={{
                display: 'flex', gap: '0',
                backgroundColor: 'var(--neutral-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.25rem',
                marginBottom: '1.25rem',
                border: '1px solid var(--neutral-border)'
              }}
            >
              {[
                { id: 'signin', label: 'Sign In',  icon: LogIn     },
                { id: 'signup', label: 'Sign Up',  icon: UserPlus  }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id} type="button"
                  onClick={() => setTab(id)}
                  style={{
                    flex: 1, border: 'none', cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.55rem 0.5rem',
                    fontSize: '0.8rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                    background: tab === id ? 'var(--neutral-white)' : 'transparent',
                    color: tab === id ? activeRole?.color : 'var(--neutral-muted)',
                    boxShadow: tab === id ? 'var(--shadow-sm)' : 'none',
                    transition: 'var(--transition-all)'
                  }}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* ── Google Sign-In Button ── */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.6rem', padding: '0.72rem 1rem',
                border: '1.5px solid var(--neutral-border)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--neutral-white)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem', fontWeight: 700,
                color: 'var(--neutral-text)',
                boxShadow: '0 1px 3px rgba(0,0,0,.06)',
                transition: 'var(--transition-all)',
                marginBottom: '1rem',
                opacity: isLoading ? 0.7 : 1
              }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'; }}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* ── Divider ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--neutral-border)' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>or continue with email</span>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--neutral-border)' }} />
            </div>

            {/* ── Email / Password Form ── */}
            <form
              onSubmit={tab === 'signin' ? handleEmailSignIn : handleEmailSignUp}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
            >
              {/* Display name (sign up only) */}
              {tab === 'signup' && (
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: 'var(--neutral-text)' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-muted)' }} />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      className="input-field"
                      placeholder="Jane Doe"
                      style={{ paddingLeft: '2.25rem' }}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: 'var(--neutral-text)' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-muted)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    className="input-field"
                    placeholder="you@example.com"
                    autoComplete="email"
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--neutral-text)' }}>
                    Password
                  </label>
                  {tab === 'signin' && (
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-green)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-muted)' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    className="input-field"
                    placeholder={tab === 'signup' ? 'Min. 6 characters' : '••••••••'}
                    autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                    minLength={6}
                    style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-muted)',
                      display: 'flex', padding: 2
                    }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {tab === 'signup' && (
                  <p style={{ fontSize: '0.67rem', color: 'var(--neutral-muted)', marginTop: '0.25rem', fontWeight: 500 }}>
                    Use at least 6 characters including letters and numbers.
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  marginTop: '0.1rem',
                  background: `linear-gradient(135deg, ${activeRole?.color}, ${activeRole?.color}cc)`,
                  opacity: isLoading ? 0.8 : 1
                }}
              >
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    {tab === 'signin' ? 'Signing In…' : 'Creating Account…'}
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                    {tab === 'signin' ? <><LogIn size={16} /> Sign In</> : <><UserPlus size={16} /> Create Account</>}
                  </span>
                )}
              </button>
            </form>
          </>
        )}

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--neutral-muted)', marginTop: '1.25rem', fontWeight: 600 }}>
          🔒 Secured by Firebase Authentication · Google OAuth 2.0
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
