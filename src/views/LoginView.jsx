import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Mail,
  Lock,
  User,
  Store,
  Bike,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  LogIn
} from 'lucide-react';

export const LoginView = () => {
  const { login, vendors, deliveryPartners } = useContext(AppContext);

  // Switch role tabs: 'customer' | 'vendor' | 'delivery' | 'admin'
  const [selectedRole, setSelectedRole] = useState('customer');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState('vendor_1');
  const [selectedRiderId, setSelectedRiderId] = useState('rider_1');

  // Loader state
  const [isLoading, setIsLoading] = useState(false);

  // Handles form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter your email or username!');
      return;
    }

    setIsLoading(true);

    // Simulate network delay for a real web app experience
    setTimeout(() => {
      setIsLoading(false);
      login(selectedRole, email, selectedVendorId, selectedRiderId);
    }, 900);
  };

  // Pre-fill helpers for different roles
  const handleQuickFill = (role, mockEmail, vendorId = 'vendor_1', riderId = 'rider_1') => {
    setSelectedRole(role);
    setEmail(mockEmail);
    setPassword('••••••••');
    setSelectedVendorId(vendorId);
    setSelectedRiderId(riderId);

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login(role, mockEmail, vendorId, riderId);
    }, 600);
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'radial-gradient(circle at 50% 50%, var(--primary-green-light) 0%, transparent 80%)'
      }}
      className="animate-fade-in"
    >
      <div
        className="card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '2rem',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--neutral-border)',
          backgroundColor: 'var(--neutral-white)',
          position: 'relative'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img
            src="/logo.jpg"
            alt="DesiCart Logo"
            style={{
              width: '140px',
              height: '140px',
              objectFit: 'contain',
              marginBottom: '0.5rem',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--neutral-border)'
            }}
            className="animate-float"
          />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--neutral-text)', lineHeight: 1.2, marginTop: '0.5rem' }}>
            Welcome to DesiCart
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--neutral-muted)', marginTop: '0.25rem', fontWeight: 600 }}>
            Hyperlocal Delivery Portal for Food, Groceries & Essentials
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.25rem',
            backgroundColor: 'var(--neutral-light)',
            padding: '0.3rem',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            border: '1px solid var(--neutral-border)'
          }}
        >
          {[
            { id: 'customer', label: 'User', icon: User },
            { id: 'vendor', label: 'Store', icon: Store },
            { id: 'delivery', label: 'Rider', icon: Bike },
            { id: 'admin', label: 'Admin', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedRole === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedRole(tab.id);
                  setEmail('');
                  setPassword('');
                }}
                type="button"
                style={{
                  border: 'none',
                  background: isSelected ? 'var(--neutral-white)' : 'transparent',
                  color: isSelected ? 'var(--primary-green)' : 'var(--neutral-muted)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.15rem',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                  transition: 'var(--transition-all)'
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          {/* Identity Email Field */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
              Email or Username
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--neutral-muted)'
                }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder={
                  selectedRole === 'customer'
                    ? 'customer@desicart.com'
                    : selectedRole === 'vendor'
                    ? 'merchant@desicart.com'
                    : selectedRole === 'delivery'
                    ? 'rider@desicart.com'
                    : 'admin@desicart.com'
                }
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--neutral-muted)'
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--neutral-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Dynamic Vendor Outlet Selector (if vendor is selected) */}
          {selectedRole === 'vendor' && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                Store Outlet Account
              </label>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="input-field"
                style={{ padding: '0.7rem' }}
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.category.replace('-', ' ')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dynamic Rider Selector (if rider is selected) */}
          {selectedRole === 'delivery' && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                Rider Account Profile
              </label>
              <select
                value={selectedRiderId}
                onChange={(e) => setSelectedRiderId(e.target.value)}
                className="input-field"
                style={{ padding: '0.7rem' }}
              >
                {deliveryPartners.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.vehicleType})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Remember me & Forget link */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginTop: '0.1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', color: 'var(--neutral-muted)', fontWeight: 600 }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary-green)' }} />
              <span>Remember me</span>
            </label>
            <span style={{ color: 'var(--primary-green)', fontWeight: 700, cursor: 'pointer' }}>
              Forgot Password?
            </span>
          </div>

          {/* Quick Testing Shortcuts Panel */}
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--neutral-light)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--neutral-border)',
              marginTop: '0.25rem'
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--neutral-muted)',
                marginBottom: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <Sparkles size={12} style={{ color: 'var(--primary-green)' }} />
              <span>Quick Test Logins (Click to prefill & enter):</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {selectedRole === 'customer' && (
                <button
                  type="button"
                  onClick={() => handleQuickFill('customer', 'jane.doe@desicart.com')}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.7rem', padding: '0.35rem', width: '100%', justifyContent: 'flex-start', borderStyle: 'dashed' }}
                >
                  ⚡ Customer: Jane Doe (customer@desicart.com)
                </button>
              )}

              {selectedRole === 'vendor' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {vendors.slice(0, 2).map((v) => (
                    <button
                      key={'quick-v-' + v.id}
                      type="button"
                      onClick={() => handleQuickFill('vendor', `${v.id.replace('_', '')}@desicart.com`, v.id)}
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: '0.7rem', padding: '0.35rem', width: '100%', justifyContent: 'flex-start', borderStyle: 'dashed', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      🏬 Vendor: {v.name}
                    </button>
                  ))}
                </div>
              )}

              {selectedRole === 'delivery' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {deliveryPartners.slice(0, 2).map((d) => (
                    <button
                      key={'quick-d-' + d.id}
                      type="button"
                      onClick={() => handleQuickFill('delivery', `${d.id.replace('_', '')}@desicart.com`, 'vendor_1', d.id)}
                      className="btn btn-sm btn-secondary"
                      style={{ fontSize: '0.7rem', padding: '0.35rem', width: '100%', justifyContent: 'flex-start', borderStyle: 'dashed' }}
                    >
                      🚴 Rider: {d.name}
                    </button>
                  ))}
                </div>
              )}

              {selectedRole === 'admin' && (
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', 'admin@desicart.com')}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.7rem', padding: '0.35rem', width: '100%', justifyContent: 'flex-start', borderStyle: 'dashed' }}
                >
                  🛡️ Admin: System Administrator
                </button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{
              padding: '0.85rem',
              fontSize: '1rem',
              marginTop: '0.25rem',
              position: 'relative'
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="animate-pulse-slow">Verifying credentials...</span>
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                <span>Log In securely</span>
                <LogIn size={16} />
              </span>
            )}
          </button>
        </form>

        {/* Help info footer */}
        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--neutral-muted)', marginTop: '1.25rem', fontWeight: 600 }}>
          Protected by local simulation guards. DesiCart uses web local storage sandboxing.
        </p>
      </div>
    </div>
  );
};
