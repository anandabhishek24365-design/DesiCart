import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { RealtimeRiderMap } from '../components/RealtimeRiderMap';
import { AddressSelector } from '../components/AddressSelector';
import { INITIAL_CATEGORIES, BANNER_SLIDES, MOCK_LOCATIONS } from '../data/initialData';
import {
  Search,
  ShoppingBag,
  Heart,
  Star,
  Clock,
  ChevronRight,
  Trash2,
  MapPin,
  CreditCard,
  Plus,
  Minus,
  X,
  CheckCircle,
  TrendingUp,
  Percent,
  ArrowLeft,
  Moon,
  Sun,
  Award,
  AlertCircle,
  AlertTriangle,
  LogOut
} from 'lucide-react';

export const CustomerView = () => {
  const {
    vendors,
    products,
    cart,
    wishlist,
    addToCart,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    toggleWishlist,
    checkout,
    orders,
    submitOrderReview,
    darkMode,
    setDarkMode,
    logout,
    globalCoords,
    globalAddress,
    isGpsActive,
    requestGlobalGPS,
    getDistanceToStore,
    setGlobalLocation,
    firebaseUser,
    savedAddresses,
    savedPayments,
    addCustomerAddress,
    deleteCustomerAddress,
    setDefaultAddress,
    addCustomerPayment,
    deleteCustomerPayment,
    updateCustomerProfile,
    submitComplaint,
    showToast
  } = useContext(AppContext);

  // Sub-navigation state
  // 'stores' | 'store-detail' | 'cart' | 'tracking' | 'history' | 'wishlist'
  const [activeTab, setActiveTab] = useState('stores');
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterRating, setFilterRating] = useState(false);
  const [filterFastest, setFilterFastest] = useState(false);

  // Cart & Checkout forms
  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = Review Cart, 2 = Checkout Form
  const [address, setAddress] = useState(globalAddress);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isCheckoutAddressModalOpen, setIsCheckoutAddressModalOpen] = useState(false);

  // Sync checkout address when globalAddress loads/changes
  useEffect(() => {
    setAddress(globalAddress);
  }, [globalAddress]);

  // Rating state
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewInput, setReviewInput] = useState('');

  // Banner cycling state
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Filter approved vendors based on selected category, search & 15 km distance radius
  const filteredVendors = vendors.filter((v) => {
    if (!v.isApproved) return false;

    // Filter out stores that are further than 15 km away
    const dist = getDistanceToStore(v.coords);
    if (dist === null || dist > 15) return false;
    
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    const distA = getDistanceToStore(a.coords) || 999;
    const distB = getDistanceToStore(b.coords) || 999;

    if (filterRating) return b.rating - a.rating;
    if (filterFastest) {
      const timeA = parseInt(a.deliveryTime.split('-')[0]) || 99;
      const timeB = parseInt(b.deliveryTime.split('-')[0]) || 99;
      return timeA - timeB;
    }
    // Default sorting: nearest distance first
    return distA - distB;
  });

  const anyStoresInRange = vendors.some(v => v.isApproved && getDistanceToStore(v.coords) <= 15);

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId);
  const selectedVendorProducts = products.filter((p) => p.vendorId === selectedVendorId);

  const getMockDistance = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor && vendor.coords) {
      const dist = getDistanceToStore(vendor.coords);
      return dist !== null ? `${dist.toFixed(1)} km away` : '1.2 km';
    }
    return '1.2 km';
  };

  // Active tracking order derived
  const trackingOrder = orders.find((o) => o.id === activeTrackingOrderId);

  // Cart active store and distance validation
  const activeCartStore = cart.items.length > 0 ? vendors.find(v => v.id === cart.items[0].vendorId) : null;
  const cartStoreDistance = activeCartStore ? getDistanceToStore(activeCartStore.coords) : null;
  const isCartStoreTooFar = cartStoreDistance !== null && cartStoreDistance > 15;

  // Handle store clicks
  const handleVendorSelect = (vendorId) => {
    setSelectedVendorId(vendorId);
    setActiveTab('store-detail');
  };

  // Perform checkout action
  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      alert('Please enter a delivery address');
      return;
    }

    if (paymentMethod === 'upi') {
      if (!window.Razorpay) {
        showToast('Razorpay payment gateway failed to load. Please check your network connection.', 'error');
        return;
      }

      try {
        const keyRes = await fetch('/api/config/razorpay-key');
        const keyData = await keyRes.json();
        const razorpayKey = keyData.keyId;

        const options = {
          key: razorpayKey,
          amount: Math.round(cart.total * 100), // in paise
          currency: 'INR',
          name: 'DesiCart',
          description: `Order from ${activeCartStore?.name || 'Local Store'}`,
          handler: async function (response) {
            const orderId = await checkout(address, paymentMethod);
            if (orderId) {
              setActiveTrackingOrderId(orderId);
              setCheckoutStep(1);
              setActiveTab('tracking');
              showToast(`Payment successful! Transaction ID: ${response.razorpay_payment_id}`, 'success');
            }
          },
          prefill: {
            name: firebaseUser?.displayName || 'Customer',
            email: firebaseUser?.email || 'customer@desicart.com',
            contact: '9876500000'
          },
          theme: {
            color: '#16a34a'
          },
          modal: {
            ondismiss: function () {
              showToast('UPI Payment cancelled by user.', 'warning');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        showToast('Failed to load payment credentials: ' + err.message, 'error');
      }
    } else {
      const orderId = await checkout(address, paymentMethod);
      if (orderId) {
        setActiveTrackingOrderId(orderId);
        setCheckoutStep(1);
        setActiveTab('tracking');
      }
    }
  };

  // Switch back to stores list
  const handleBackToStores = () => {
    setSelectedVendorId(null);
    setActiveTab('stores');
  };

  // Reorder utility
  const handleReorder = (order) => {
    order.items.forEach((item) => {
      // Find latest product in product list (to ensure price is fresh)
      const currentProd = products.find((p) => p.id === item.id) || item;
      addToCart(currentProd, order.vendorId);
    });
    setActiveTab('cart');
  };

  return (
    <div style={{ paddingBottom: '5rem' }} className="animate-fade-in">
      {/* Header bar */}
      <header
        className="glassmorphism"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          borderBottom: '1px solid var(--neutral-border)',
          padding: '0.75rem 0',
          marginBottom: '1.5rem'
        }}
      >
        <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={handleBackToStores}>
            <img
              src="/logo.jpg"
              alt="DesiCart"
              style={{
                height: '40px',
                width: '40px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-md)',
                objectPosition: 'top'
              }}
            />
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--neutral-text)' }}>
              Desi<span style={{ color: 'var(--accent-orange)' }}>Cart</span>
            </span>
          </div>

          {/* Quick Location Mock (GPS Interactive) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>
            <MapPin size={15} style={{ color: 'var(--accent-orange)' }} />
            <select
              value={globalAddress}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'gps') {
                  requestGlobalGPS();
                } else {
                  // Try to find in MOCK_LOCATIONS first
                  const matchedMock = MOCK_LOCATIONS.find(loc => loc.address === val);
                  if (matchedMock) {
                    setGlobalLocation(matchedMock.address, matchedMock.coords);
                  } else {
                    // Try to find in savedAddresses
                    const matchedSaved = savedAddresses.find(addr => addr.address === val);
                    if (matchedSaved) {
                      // Map to standard coordinates if we recognize Noida/Gurugram, otherwise default Noida
                      let coords = { lat: 28.62, lng: 77.36 };
                      if (val.toLowerCase().includes('cybercity') || val.toLowerCase().includes('gurugram')) {
                        coords = { lat: 28.495, lng: 77.088 };
                      }
                      setGlobalLocation(matchedSaved.address, coords);
                    }
                  }
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1.5px dashed var(--accent-orange)',
                fontWeight: 800,
                color: 'var(--neutral-text)',
                cursor: 'pointer',
                fontSize: '0.82rem',
                outline: 'none',
                maxWidth: '200px',
                padding: '0.1rem 0'
              }}
            >
              <option value="" disabled>-- Select Location --</option>
              <option value="gps">📡 Auto-Detect GPS Location</option>
              
              {!MOCK_LOCATIONS.some(loc => loc.address === globalAddress) && 
               !savedAddresses.some(addr => addr.address === globalAddress) && 
               globalAddress !== "" && globalAddress !== "gps" && (
                <option value={globalAddress}>
                  📍 {globalAddress.length > 25 ? globalAddress.slice(0, 25) + '...' : globalAddress}
                </option>
              )}

              <optgroup label="Predefined Locations">
                {MOCK_LOCATIONS.map((loc) => (
                  <option key={loc.address} value={loc.address}>
                    {loc.name.split(' (')[0]}
                  </option>
                ))}
              </optgroup>

              {savedAddresses.length > 0 && (
                <optgroup label="Saved Addresses">
                  {savedAddresses.map((addr) => (
                    <option key={addr.id} value={addr.address}>
                      🏠 {addr.tag}: {addr.address}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Tabs Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('stores')}
              className={`btn btn-sm ${activeTab === 'stores' || activeTab === 'store-detail' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Browse
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`btn btn-sm ${activeTab === 'wishlist' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Wishlist ({wishlist.length})
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`btn btn-sm ${activeTab === 'account' ? 'btn-primary' : 'btn-ghost'}`}
            >
              Account
            </button>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="btn btn-ghost"
              style={{ padding: '0.4rem', borderRadius: '50%' }}
            >
              {darkMode ? <Sun size={18} style={{ color: '#eab308' }} /> : <Moon size={18} />}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => {
                setCheckoutStep(1);
                setActiveTab('cart');
              }}
              className="btn btn-orange"
              style={{ position: 'relative', borderRadius: 'var(--radius-lg)' }}
            >
              <ShoppingBag size={18} />
              <span style={{ fontSize: '0.85rem' }}>₹{cart.total}</span>
              {cart.items.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: 'red',
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
                  {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="btn btn-ghost"
              style={{ padding: '0.4rem', borderRadius: '50%', color: '#ef4444' }}
              title="Log Out Session"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="app-container">
        {/* VIEW 1: BROWSE VENDORS */}
        {activeTab === 'stores' && (
          <div>
            {/* Banner Slider */}
            <div
              style={{
                width: '100%',
                height: '180px',
                borderRadius: 'var(--radius-xl)',
                background: BANNER_SLIDES[currentSlide].bgGrad,
                color: 'white',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow-md)',
                transition: 'var(--transition-all)'
              }}
            >
              <div style={{ maxWidth: '60%', zIndex: 2 }}>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Limited Period Offer
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem', lineHeight: '1.2' }}>
                  {BANNER_SLIDES[currentSlide].title}
                </h2>
                <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.25rem', display: 'none' }}>
                  {BANNER_SLIDES[currentSlide].subtitle}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button
                    onClick={() => {
                      setCouponCodeInput(BANNER_SLIDES[currentSlide].promoCode);
                      applyCoupon(BANNER_SLIDES[currentSlide].promoCode);
                    }}
                    className="btn btn-sm"
                    style={{ backgroundColor: 'white', color: 'black', fontWeight: 700 }}
                  >
                    Apply Code: {BANNER_SLIDES[currentSlide].promoCode}
                  </button>
                </div>
              </div>
              <img
                src={BANNER_SLIDES[currentSlide].img}
                alt="Offers"
                style={{
                  height: '120%',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-lg)',
                  opacity: 0.85,
                  transform: 'rotate(-5deg) translateY(-10px)',
                  boxShadow: 'var(--shadow-lg)'
                }}
              />
            </div>

            {/* Search and Filters Bar */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              {/* Search input */}
              <div style={{ position: 'relative' }}>
                <Search
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--neutral-muted)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Search restaurants, groceries, medicine, or stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              {/* Category selector */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  overflowX: 'auto',
                  paddingBottom: '0.5rem',
                  scrollbarWidth: 'none'
                }}
              >
                {INITIAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="btn btn-sm btn-secondary"
                    style={{
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      backgroundColor: selectedCategory === cat.id ? 'var(--primary-green)' : 'var(--neutral-white)',
                      color: selectedCategory === cat.id ? 'white' : 'var(--neutral-text)',
                      borderColor: selectedCategory === cat.id ? 'transparent' : 'var(--neutral-border)'
                    }}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Filters toggle */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    setFilterRating(!filterRating);
                    if (filterFastest) setFilterFastest(false);
                  }}
                  className={`btn btn-sm btn-secondary`}
                  style={{
                    backgroundColor: filterRating ? 'var(--primary-green-light)' : 'var(--neutral-white)',
                    color: filterRating ? 'var(--primary-green-hover)' : 'var(--neutral-text)',
                    borderColor: filterRating ? 'var(--primary-green)' : 'var(--neutral-border)'
                  }}
                >
                  <Star size={14} style={{ fill: filterRating ? 'var(--primary-green)' : 'none' }} />
                  <span>Rating 4.5+</span>
                </button>
                <button
                  onClick={() => {
                    setFilterFastest(!filterFastest);
                    if (filterRating) setFilterRating(false);
                  }}
                  className={`btn btn-sm btn-secondary`}
                  style={{
                    backgroundColor: filterFastest ? 'var(--primary-green-light)' : 'var(--neutral-white)',
                    color: filterFastest ? 'var(--primary-green-hover)' : 'var(--neutral-text)',
                    borderColor: filterFastest ? 'var(--primary-green)' : 'var(--neutral-border)'
                  }}
                >
                  <Clock size={14} />
                  <span>Fastest Delivery</span>
                </button>
              </div>
            </div>

            {/* Stores List */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--neutral-text)' }}>
                Nearby Outlets Available
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--neutral-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: 'var(--primary-green)', borderRadius: '50%' }}></span>
                <span>Showing approved delivery partners and vendors around your current location: <strong style={{ color: 'var(--neutral-text)' }}>{globalAddress}</strong></span>
              </p>
            </div>

            {filteredVendors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', border: '2px dashed var(--neutral-border)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--neutral-light)' }}>
                <AlertCircle size={44} style={{ color: 'var(--accent-orange)', marginBottom: '0.75rem' }} />
                <h4 style={{ fontWeight: 800, color: 'var(--neutral-text)' }}>
                  {!anyStoresInRange ? 'No stores are available in your area.' : 'No Outlets Match Filter'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)', marginTop: '0.35rem', maxWidth: '360px', margin: '0.35rem auto 0', lineHeight: 1.5 }}>
                  {!anyStoresInRange 
                    ? 'All registered shops exceed the 15 km service radius. Please try selecting a different location from the header.'
                    : 'Try removing search keywords or filters to discover local shops.'
                  }
                </p>
              </div>
            ) : (
              <div className="grid-responsive">
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="card card-interactive"
                    style={{ cursor: 'pointer', overflow: 'hidden', padding: 0 }}
                    onClick={() => handleVendorSelect(vendor.id)}
                  >
                    <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                      <img
                        src={vendor.image}
                        alt={vendor.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {vendor.featured && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: 'var(--accent-orange)',
                            color: 'white',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '0.25rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            textTransform: 'uppercase'
                          }}
                        >
                          Featured
                        </span>
                      )}
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '10px',
                          right: '10px',
                          background: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.4rem',
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        {vendor.deliveryTime}
                      </span>
                    </div>

                    <div style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                          {vendor.name}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--primary-green)', color: 'white', padding: '0.15rem 0.4rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 800 }}>
                          <span>{vendor.rating}</span>
                          <Star size={10} style={{ fill: 'white' }} />
                        </div>
                      </div>

                      <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', textTransform: 'capitalize', fontWeight: 600, marginBottom: '0.5rem' }}>
                        {vendor.category.replace('-', ' & ')} • Min: ₹{vendor.minOrder}
                      </p>

                      <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '75%' }}>{vendor.address}</span>
                        <span style={{ color: 'var(--primary-green)', fontWeight: 700, flexShrink: 0 }}>{getMockDistance(vendor.id)} away</span>
                      </p>

                      {vendor.bannerOffer && (
                        <div
                          style={{
                            marginTop: '0.75rem',
                            padding: '0.4rem',
                            backgroundColor: 'var(--accent-orange-light)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px dashed var(--accent-orange)',
                            color: 'var(--accent-orange-hover)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Percent size={12} />
                          <span>{vendor.bannerOffer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: STORE DETAIL MENU */}
        {activeTab === 'store-detail' && selectedVendor && (() => {
          const dist = getDistanceToStore(selectedVendor.coords);
          const isTooFar = dist !== null && dist > 15;
          if (isTooFar) {
            return (
              <div style={{ padding: '3.5rem 1rem', textAlign: 'center', maxWidth: '500px', margin: '2rem auto' }} className="card animate-fade-in">
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 0 0 8px rgba(254, 202, 202, 0.5)' }}>
                  <AlertTriangle size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#b91c1c', marginBottom: '0.5rem' }}>Out of Service Area</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--neutral-muted)', marginTop: '0.5rem', lineHeight: 1.5, fontWeight: 600 }}>
                  <strong>{selectedVendor.name}</strong> is located <strong>{dist.toFixed(1)} km</strong> away, which exceeds our maximum delivery radius of <strong>15 km</strong> from your current location.
                </p>
                <button className="btn btn-primary" onClick={handleBackToStores} style={{ marginTop: '1.5rem', fontWeight: 700 }}>
                  Back to Nearby Stores
                </button>
              </div>
            );
          }
          return (
            <div>
              {/* Back button */}
              <button
                onClick={handleBackToStores}
                className="btn btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--primary-green)', fontWeight: 700 }}
              >
                <ArrowLeft size={16} />
                <span>Back to Outlets</span>
              </button>

            {/* Store Cover Banner */}
            <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
              <div style={{ height: '180px', position: 'relative' }}>
                <img
                  src={selectedVendor.image}
                  alt={selectedVendor.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)' }} />
                
                <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', color: 'white' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {selectedVendor.name}
                  </h2>
                  <p style={{ fontSize: '0.85rem', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {selectedVendor.address}
                  </p>
                </div>
              </div>

              {/* Stats Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  textAlign: 'center',
                  padding: '1rem',
                  borderTop: '1px solid var(--neutral-border)',
                  backgroundColor: 'var(--neutral-white)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem', fontWeight: 800, color: 'var(--primary-green)' }}>
                    <span>{selectedVendor.rating}</span>
                    <Star size={14} style={{ fill: 'var(--primary-green)' }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>
                    {selectedVendor.reviewsCount} Ratings
                  </span>
                </div>
                <div style={{ borderLeft: '1px solid var(--neutral-border)', borderRight: '1px solid var(--neutral-border)' }}>
                  <div style={{ fontWeight: 800, color: 'var(--neutral-text)' }}>{selectedVendor.deliveryTime}</div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>Delivery Speed</span>
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--neutral-text)' }}>₹{selectedVendor.minOrder}</div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>Min Order</span>
                </div>
              </div>
            </div>

            {/* Menu Sections */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Products & Menu Catalog
            </h3>

            {selectedVendorProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--neutral-border)', borderRadius: 'var(--radius-xl)' }}>
                <AlertCircle size={35} style={{ color: 'var(--neutral-muted)', marginBottom: '0.5rem' }} />
                <h4 style={{ fontWeight: 700 }}>Menu is Empty</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)', marginTop: '0.25rem' }}>
                  This vendor hasn't uploaded products yet. Switch to Vendor view to list products!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedVendorProducts.map((product) => {
                  const wishlistActive = wishlist.includes(product.id);
                  // Find if item is in cart
                  const cartItem = cart.items.find((item) => item.id === product.id);
                  const isOutOfStock = product.stock <= 0;

                  return (
                    <div
                      key={product.id}
                      className="card"
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem'
                      }}
                    >
                      {/* Product image & wishlist overlay */}
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                        <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {isOutOfStock && (
                            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.65rem', fontWeight: 800 }}>
                              OUT OF STOCK
                            </div>
                          )}
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>{product.name}</h4>
                            {product.tags && product.tags.map((tag) => (
                              <span key={tag} style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem', backgroundColor: 'var(--neutral-light)', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-sm)', fontWeight: 700, textTransform: 'uppercase' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', marginTop: '0.2rem', maxWidth: '400px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {product.description}
                          </p>
                          <div style={{ marginTop: '0.4rem', fontWeight: 800, color: 'var(--neutral-text)', fontSize: '0.95rem' }}>
                            ₹{product.price}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Wishlist Button */}
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="btn btn-ghost"
                          style={{ color: wishlistActive ? 'red' : 'var(--neutral-muted)', padding: '0.4rem' }}
                        >
                          <Heart size={18} style={{ fill: wishlistActive ? 'red' : 'none' }} />
                        </button>

                        {/* Add to Cart Widget */}
                        {cartItem ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: 'var(--primary-green)',
                              color: 'white',
                              borderRadius: 'var(--radius-lg)',
                              overflow: 'hidden',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          >
                            <button
                              onClick={() => removeFromCart(product.id)}
                              style={{ padding: '0.4rem 0.6rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                            >
                              <Minus size={14} />
                            </button>
                            <span style={{ padding: '0 0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() => {
                                if (product.stock > cartItem.quantity) {
                                  addToCart(product, selectedVendorId);
                                } else {
                                  alert('Cannot add more. Limit exceeded!');
                                }
                              }}
                              style={{ padding: '0.4rem 0.6rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product, selectedVendorId)}
                            className="btn btn-sm btn-secondary"
                            disabled={isOutOfStock}
                            style={{
                              borderColor: 'var(--primary-green)',
                              color: 'var(--primary-green)',
                              fontWeight: 700
                            }}
                          >
                            Add +
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )})()}

        {/* VIEW 3: CART & CHECKOUT PAGE */}
        {activeTab === 'cart' && (
          <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag style={{ color: 'var(--primary-green)' }} />
              <span>Checkout Drawer</span>
            </h2>

            {cart.items.length === 0 ? (
              <div className="card animate-fade-in" style={{ textAlign: 'center', padding: '3rem' }}>
                <ShoppingBag size={45} style={{ color: 'var(--neutral-muted)', marginBottom: '0.75rem' }} />
                <h3 style={{ fontWeight: 700 }}>Your cart is empty</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)', marginTop: '0.25rem' }}>
                  Locate popular outlets to satisfy your cravings.
                </p>
                <button onClick={handleBackToStores} className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
                  Shop Now
                </button>
              </div>
            ) : (
              <div>
                {/* Steps Navigator */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <div style={{ flex: 1, padding: '0.5rem', borderBottom: `2px solid ${checkoutStep === 1 ? 'var(--primary-green)' : 'var(--neutral-border)'}`, fontWeight: 700, color: checkoutStep === 1 ? 'var(--primary-green)' : 'var(--neutral-muted)', textAlign: 'center' }}>
                    1. Review Basket
                  </div>
                  <div style={{ flex: 1, padding: '0.5rem', borderBottom: `2px solid ${checkoutStep === 2 ? 'var(--primary-green)' : 'var(--neutral-border)'}`, fontWeight: 700, color: checkoutStep === 2 ? 'var(--primary-green)' : 'var(--neutral-muted)', textAlign: 'center' }}>
                    2. Address & Pay
                  </div>
                </div>

                {checkoutStep === 1 ? (
                  /* Step 1: Review Items */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h4 style={{ fontWeight: 800, fontSize: '0.95rem', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.5rem', color: 'var(--neutral-muted)' }}>
                        Items from {vendors.find(v => v.id === cart.items[0].vendorId)?.name}
                      </h4>
                      {cart.items.map((item) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>
                              ₹{item.price} x {item.quantity}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="btn btn-ghost"
                              style={{ padding: '0.2rem', color: 'var(--neutral-muted)' }}
                            >
                              <Minus size={14} />
                            </button>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.quantity}</span>
                            <button
                              onClick={() => addToCart(item, item.vendorId)}
                              className="btn btn-ghost"
                              style={{ padding: '0.2rem', color: 'var(--neutral-muted)' }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div style={{ width: '60px', textAlign: 'right', fontWeight: 800, fontSize: '0.9rem' }}>
                            ₹{item.price * item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Apply coupon promo */}
                    <div className="card">
                      <h4 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem' }}>Promotional Offers</h4>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="ENTER COUPON (e.g. BLINK50)"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                          className="input-field"
                        />
                        <button
                          onClick={() => applyCoupon(couponCodeInput)}
                          className="btn btn-primary"
                        >
                          Apply
                        </button>
                      </div>

                      {cart.appliedCoupon && (
                        <div
                          style={{
                            marginTop: '0.75rem',
                            padding: '0.5rem',
                            backgroundColor: 'var(--primary-green-light)',
                            color: 'var(--primary-green-hover)',
                            border: '1px solid var(--primary-green)',
                            borderRadius: 'var(--radius-lg)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Percent size={14} />
                            <span>Discount code active: {cart.appliedCoupon.code}</span>
                          </div>
                          <button
                            onClick={removeCoupon}
                            style={{ background: 'none', border: 'none', color: 'var(--neutral-text)', cursor: 'pointer', fontWeight: 700 }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bill breakdown */}
                    <div className="card">
                      <h4 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.75rem' }}>Bill Details</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Subtotal</span>
                          <span style={{ fontWeight: 600 }}>₹{cart.subtotal}</span>
                        </div>
                        {cart.discount > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary-green-hover)' }}>
                            <span>Coupon Discount</span>
                            <span style={{ fontWeight: 700 }}>-₹{cart.discount}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Delivery Fee (Distance base)</span>
                          <span style={{ fontWeight: 600 }}>₹{cart.deliveryFee}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--neutral-border)', paddingTop: '0.5rem', fontSize: '1rem', fontWeight: 800 }}>
                          <span>Total Amount Payable</span>
                          <span style={{ color: 'var(--accent-orange)' }}>₹{cart.total}</span>
                        </div>
                      </div>
                    </div>

                    {isCartStoreTooFar && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fca5a5',
                        borderRadius: 'var(--radius-lg)',
                        color: '#b91c1c',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                      }}>
                        <AlertTriangle size={16} />
                        <span>Store out of range ({cartStoreDistance?.toFixed(1)} km away). Change address or clear cart to checkout.</span>
                      </div>
                    )}

                    <button
                      onClick={() => !isCartStoreTooFar && setCheckoutStep(2)}
                      disabled={isCartStoreTooFar}
                      className="btn btn-orange"
                      style={{
                        width: '100%',
                        fontSize: '1rem',
                        padding: '1rem',
                        opacity: isCartStoreTooFar ? 0.6 : 1,
                        cursor: isCartStoreTooFar ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isCartStoreTooFar ? 'Out of Delivery Range' : 'Proceed to Checkout'}
                    </button>
                  </div>
                ) : (
                  /* Step 2: Address & Payment Info */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-in">
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={16} style={{ color: 'var(--primary-green)' }} />
                          <span>Delivery Address Details</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsCheckoutAddressModalOpen(true)}
                          className="btn btn-sm btn-secondary"
                          style={{ color: 'var(--primary-green)', borderColor: 'var(--primary-green)', fontWeight: 700 }}
                        >
                          Change on Map
                        </button>
                      </div>

                      <div style={{
                        padding: '1rem',
                        backgroundColor: 'var(--neutral-light)',
                        border: '1px solid var(--neutral-border)',
                        borderRadius: 'var(--radius-lg)',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{ fontWeight: 700, color: 'var(--neutral-text)', marginBottom: '0.25rem' }}>
                          📍 Current Destination:
                        </div>
                        <div style={{ color: 'var(--neutral-text)', lineHeight: 1.4 }}>
                          {address || 'No address selected. Please use the map to set a precise delivery address.'}
                        </div>
                        {globalCoords && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--neutral-muted)', marginTop: '0.4rem', fontFamily: 'monospace' }}>
                            GPS: {globalCoords.lat.toFixed(5)}, {globalCoords.lng.toFixed(5)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="card">
                      <h4 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CreditCard size={16} style={{ color: 'var(--primary-green)' }} />
                        <span>Choose Payment Method</span>
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                          <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                          <span>Instant UPI Payment (PhonePe / GPay)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                          <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                          <span>Debit / Credit Cards</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                          <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                          <span>Cash on Delivery (CoD)</span>
                        </label>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={() => setCheckoutStep(1)} className="btn btn-secondary" style={{ flex: 1 }}>
                        Back
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isCartStoreTooFar}
                        className="btn btn-orange"
                        style={{
                          flex: 2,
                          padding: '1rem',
                          fontSize: '1rem',
                          opacity: isCartStoreTooFar ? 0.6 : 1,
                          cursor: isCartStoreTooFar ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isCartStoreTooFar ? 'Out of Delivery Range' : `Place Order (₹${cart.total})`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: LIVE ORDER TRACKING */}
        {activeTab === 'tracking' && trackingOrder && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Order Dispatch Tracker
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Animated Map Tracker */}
              <RealtimeRiderMap order={trackingOrder} />

              {/* GPS Geolocation details */}
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>GPS Location Tracking</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', marginTop: '0.1rem' }}>
                    {isGpsActive && globalCoords
                      ? `Live coordinates: ${globalCoords.lat.toFixed(5)}, ${globalCoords.lng.toFixed(5)}`
                      : 'Route simulation active. Click to use actual GPS.'}
                  </p>
                </div>
                <button
                  onClick={requestGlobalGPS}
                  className={`btn btn-sm ${isGpsActive ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <MapPin size={14} />
                  <span>{isGpsActive ? 'GPS Active' : 'Allow GPS'}</span>
                </button>
              </div>

              {/* Status Stepper Card */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>ID: {trackingOrder.id.replace('order_', '#')}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>
                      Store: {trackingOrder.vendorName}
                    </p>
                  </div>
                  <span className={`badge badge-${trackingOrder.status}`}>
                    {trackingOrder.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Vertical Progress Stepper */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '2rem' }}>
                  {/* Stepper bar background */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '8px',
                      top: '10px',
                      bottom: '10px',
                      width: '2px',
                      backgroundColor: 'var(--neutral-border)',
                      zIndex: 1
                    }}
                  />

                  {/* Stepper Steps */}
                  {[
                    { key: 'pending', title: 'Order Confirmed', desc: 'Awaiting store confirmation' },
                    { key: 'preparing', title: 'Store Preparing Order', desc: 'Store is baking/packing your items' },
                    { key: 'rider_assigned', title: 'Rider Assigned', desc: 'Rider accepts shipment consignment' },
                    { key: 'reached_store', title: 'Rider Reached Store', desc: 'Rider reached store and packing items' },
                    { key: 'out_for_delivery', title: 'Rider On The Way', desc: 'Rider moving along roads toward your address' },
                    { key: 'arriving_soon', title: 'Arriving Soon', desc: 'Rider is close by your location' },
                    { key: 'delivered', title: 'Delivered', desc: 'Package dropped off successfully' }
                  ].map((step, idx) => {
                    const statuses = ['pending', 'preparing', 'ready', 'rider_assigned', 'reached_store', 'out_for_delivery', 'arriving_soon', 'delivered'];
                    const currentIdx = statuses.indexOf(trackingOrder.status);
                    const stepIdx = statuses.indexOf(step.key);
                    
                    // Match step 'ready' mapping or simple index
                    const isCompleted = stepIdx <= currentIdx || (step.key === 'rider_assigned' && currentIdx >= statuses.indexOf('ready'));
                    const isActive = step.key === trackingOrder.status || (step.key === 'rider_assigned' && trackingOrder.status === 'ready');

                    return (
                      <div key={step.key} style={{ position: 'relative', zIndex: 2 }}>
                        {/* Dot indicator */}
                        <div
                          style={{
                            position: 'absolute',
                            left: '-29px',
                            top: '3px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? 'var(--primary-green)' : 'var(--neutral-white)',
                            border: `3px solid ${isCompleted ? 'var(--primary-green-light)' : 'var(--neutral-border)'}`,
                            transition: 'var(--transition-all)',
                            boxShadow: isActive ? '0 0 0 4px rgba(16,185,129,0.3)' : 'none'
                          }}
                        />
                        <div>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: isCompleted ? 'var(--neutral-text)' : 'var(--neutral-muted)' }}>
                            {step.title}
                          </h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review & Feedback Section (Only active if Delivered) */}
              {trackingOrder.status === 'delivered' && (
                <div className="card" style={{ border: '2px solid var(--primary-green-hover)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary-green-hover)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Award size={18} />
                    <span>How was your experience?</span>
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', marginBottom: '1rem' }}>
                    Submit a rating to help this local outlet improve.
                  </p>

                  {trackingOrder.ratings ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'var(--primary-green-light)', padding: '0.75rem', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary-green-hover)' }}>
                        <span>Your Rating: {trackingOrder.ratings} / 5</span>
                        <Star size={16} style={{ fill: 'var(--primary-green-hover)' }} />
                      </div>
                      <p style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>"{trackingOrder.reviews || 'No review comments left.'}"</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {/* Star selection */}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRatingInput(star)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: star <= ratingInput ? '#eab308' : 'var(--neutral-border)' }}
                          >
                            <Star size={24} style={{ fill: star <= ratingInput ? '#eab308' : 'none' }} />
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="Write a quick comment (e.g. Taste was amazing, fast delivery!)"
                        value={reviewInput}
                        onChange={(e) => setReviewInput(e.target.value)}
                        className="input-field"
                      />

                      <button
                        onClick={() => submitOrderReview(trackingOrder.id, ratingInput, reviewInput)}
                        className="btn btn-primary"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 5: ORDER HISTORY */}
        {activeTab === 'history' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Your Past Orders
            </h2>

            {orders.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <ShoppingBag size={40} style={{ color: 'var(--neutral-muted)', marginBottom: '0.75rem' }} />
                <h3 style={{ fontWeight: 700 }}>No orders placed yet</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)', marginTop: '0.25rem' }}>
                  Once you order, your items will be archived here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {orders.map((order) => (
                  <div key={order.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.5rem' }}>
                      <div>
                        <h4 style={{ fontWeight: 800, fontSize: '0.95rem' }}>{order.vendorName}</h4>
                        <span style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)' }}>
                          {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className={`badge badge-${order.status}`}>{order.status.replace('_', ' ')}</span>
                        <button
                          onClick={() => {
                            setActiveTrackingOrderId(order.id);
                            setActiveTab('tracking');
                          }}
                          className="btn btn-sm btn-ghost"
                          style={{ color: 'var(--primary-green)', fontWeight: 700 }}
                        >
                          Track
                        </button>
                      </div>
                    </div>

                    {/* Order Items list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      {order.items.map((item) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--neutral-muted)' }}>
                          <span>{item.name} x {item.quantity}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--neutral-border)', paddingTop: '0.4rem', fontWeight: 800, fontSize: '0.9rem' }}>
                        <span>Total Paid</span>
                        <span style={{ color: 'var(--accent-orange)' }}>₹{order.total}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleReorder(order)}
                      className="btn btn-sm btn-secondary"
                      style={{ width: '100%', borderColor: 'var(--accent-orange)', color: 'var(--accent-orange)', fontWeight: 700 }}
                    >
                      Reorder Basket Items
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 6: WISHLIST */}
        {activeTab === 'wishlist' && (
          <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart style={{ color: 'red', fill: 'red' }} />
              <span>Wishlisted Items</span>
            </h2>

            {wishlist.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <Heart size={40} style={{ color: 'var(--neutral-border)', marginBottom: '0.75rem' }} />
                <h3 style={{ fontWeight: 700 }}>Your wishlist is empty</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)', marginTop: '0.25rem' }}>
                  Tap the heart icon on any products to quickly retrieve them here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {products.filter((p) => wishlist.includes(p.id)).map((product) => (
                  <div key={product.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img src={product.image} alt={product.name} style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>{product.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>
                          Store: {vendors.find((v) => v.id === product.vendorId)?.name}
                        </span>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: '0.2rem' }}>₹{product.price}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="btn btn-ghost"
                        style={{ color: 'red' }}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          addToCart(product, product.vendorId);
                          showToast('Added to checkout cart!', 'success');
                        }}
                        className="btn btn-sm btn-primary"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 7: ACCOUNT MANAGER */}
        {activeTab === 'account' && (
          <AccountView
            firebaseUser={firebaseUser}
            savedAddresses={savedAddresses}
            savedPayments={savedPayments}
            addCustomerAddress={addCustomerAddress}
            deleteCustomerAddress={deleteCustomerAddress}
            setDefaultAddress={setDefaultAddress}
            addCustomerPayment={addCustomerPayment}
            deleteCustomerPayment={deleteCustomerPayment}
            updateCustomerProfile={updateCustomerProfile}
            submitComplaint={submitComplaint}
          />
        )}
        <AddressSelector
          isOpen={isCheckoutAddressModalOpen}
          onClose={() => setIsCheckoutAddressModalOpen(false)}
          onConfirm={(addrInfo) => {
            setAddress(addrInfo.address);
            setGlobalLocation(addrInfo.address, addrInfo.coords);
            setIsCheckoutAddressModalOpen(false);
          }}
          initialCoords={globalCoords}
          initialDetails={{
            locality: globalAddress
          }}
          userName={firebaseUser?.displayName || 'ABHISHEK ANAND'}
          userPhone={firebaseUser?.phoneNumber || ''}
        />
      </div>
    </div>
  );
};

/* ─── Premium Account/Profile Component ─── */
const AccountView = ({
  firebaseUser,
  savedAddresses,
  savedPayments,
  addCustomerAddress,
  deleteCustomerAddress,
  setDefaultAddress,
  addCustomerPayment,
  deleteCustomerPayment,
  updateCustomerProfile,
  submitComplaint
}) => {
  const [subTab, setSubTab] = useState('profile');
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Profile forms state
  const [editName, setEditName] = useState(firebaseUser?.displayName || 'Jane Doe');
  
  // Complaint form state
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Address form state
  const [newAddress, setNewAddress] = useState('');
  const [addressTag, setAddressTag] = useState('Home');

  // Payment form state
  const [payType, setPayType] = useState('upi');
  const [payDetail, setPayDetail] = useState('');
  const [payProvider, setPayProvider] = useState('Google Pay');

  const handleUpdateName = (e) => {
    e.preventDefault();
    updateCustomerProfile(editName);
  };

  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    if (!subject || !message) return;
    submitComplaint(subject, message);
    setSubject('');
    setMessage('');
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    addCustomerAddress(newAddress.trim(), addressTag);
    setNewAddress('');
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!payDetail.trim()) return;
    addCustomerPayment(payType, payDetail.trim(), payProvider);
    setPayDetail('');
  };

  return (
    <div className="card" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem', padding: '1.5rem', flexWrap: 'wrap' }}>
      
      {/* Sidebar navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderRight: '1px solid var(--neutral-border)', paddingRight: '1rem' }}>
        {[
          { id: 'profile', label: 'My Profile' },
          { id: 'addresses', label: 'Manage Addresses' },
          { id: 'payments', label: 'Manage Payments' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setSubTab(item.id)}
            className={`btn btn-sm ${subTab === item.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              justifyContent: 'flex-start',
              fontWeight: 700,
              color: subTab === item.id ? '#fff' : 'var(--neutral-text)',
              backgroundColor: subTab === item.id ? 'var(--primary-green)' : 'transparent',
              borderRadius: 'var(--radius-md)'
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main pane content */}
      <div className="animate-fade-in" style={{ flex: 1 }}>
        {/* SUBTAB: PROFILE */}
        {subTab === 'profile' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.15rem' }}>Personal Profile Info</h3>
            
            <form onSubmit={handleUpdateName} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', marginBottom: '2rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Your Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Email Address</label>
                <input
                  type="email"
                  disabled
                  value={firebaseUser?.email || 'customer@desicart.com'}
                  className="input-field"
                  style={{ backgroundColor: 'var(--neutral-light)', cursor: 'not-allowed' }}
                />
                <span style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)' }}>Email is verified and cannot be edited.</span>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>Save Changes</button>
            </form>

            <hr style={{ border: 'none', borderTop: '1px solid var(--neutral-border)', margin: '1.5rem 0' }} />

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Submit a Complaint / Help Query</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', marginBottom: '1rem' }}>
              Have an issue with a recent delivery or order? Reach out to support.
            </p>
            <form onSubmit={handleComplaintSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '500px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Subject</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Missing items in order, damaged packaging..."
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail what happened and what solution you require..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                />
              </div>
              <button type="submit" className="btn btn-orange" style={{ width: 'fit-content' }}>Submit Help Ticket</button>
            </form>
          </div>
        )}

        {/* SUBTAB: ADDRESSES */}
        {subTab === 'addresses' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Manage Delivery Addresses</h3>

            {/* List saved addresses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {savedAddresses.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--neutral-muted)' }}>No saved addresses. Add one below.</p>
              ) : (
                savedAddresses.map((addr) => (
                  <div key={addr.id} style={{
                    padding: '0.75rem 1rem',
                    border: `1.5px solid ${addr.isDefault ? 'var(--primary-green)' : 'var(--neutral-border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: addr.isDefault ? 'var(--primary-green-light)' : 'var(--neutral-white)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>{addr.tag}</span>
                        {addr.isDefault && <span className="badge badge-delivered" style={{ fontSize: '0.65rem' }}>Default</span>}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--neutral-text)', marginTop: '0.15rem' }}>{addr.address}</p>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {!addr.isDefault && (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="btn btn-sm btn-ghost"
                          style={{ color: 'var(--primary-green)', fontSize: '0.72rem', fontWeight: 700 }}
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => deleteCustomerAddress(addr.id)}
                        className="btn btn-sm btn-ghost"
                        style={{ color: '#ef4444' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--neutral-border)', margin: '1.5rem 0' }} />

            {/* Add Address Form */}
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.85rem' }}>Add New Address</h3>
            <div style={{ padding: '1.5rem', border: '1px dashed var(--neutral-border)', borderRadius: 'var(--radius-lg)', textAlign: 'center', backgroundColor: 'var(--neutral-light)' }}>
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={16} />
                <span>Locate & Add Address via Map</span>
              </button>
              <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', marginTop: '0.5rem' }}>
                Use our interactive geocoded map selector to save a highly accurate home or office address.
              </p>
            </div>

            <AddressSelector
              isOpen={isMapOpen}
              onClose={() => setIsMapOpen(false)}
              onConfirm={(addrInfo) => {
                addCustomerAddress(addrInfo.address, addrInfo.tag);
                setIsMapOpen(false);
              }}
              userName={firebaseUser?.displayName || 'Jane Doe'}
              userPhone={firebaseUser?.phoneNumber || ''}
            />
          </div>
        )}

        {/* SUBTAB: PAYMENTS */}
        {subTab === 'payments' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Saved Payout Accounts</h3>

            {/* List saved payments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {savedPayments.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--neutral-muted)' }}>No saved payment methods. Add one below.</p>
              ) : (
                savedPayments.map((pay) => (
                  <div key={pay.id} style={{
                    padding: '0.75rem 1rem',
                    border: '1px solid var(--neutral-border)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--neutral-light)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase' }}>
                          {pay.type === 'upi' ? 'UPI Account' : 'Payment Card'}
                        </span>
                        <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>{pay.provider}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--neutral-text)', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                        {pay.detail}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => deleteCustomerPayment(pay.id)}
                      className="btn btn-sm btn-ghost"
                      style={{ color: '#ef4444' }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--neutral-border)', margin: '1.5rem 0' }} />

            {/* Add Payment Form */}
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.85rem' }}>Save Payment Credentials</h3>
            <form onSubmit={handleAddPayment} style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Payment Type</label>
                <select
                  value={payType}
                  onChange={e => {
                    setPayType(e.target.value);
                    if (e.target.value === 'upi') {
                      setPayDetail('');
                      setPayProvider('Google Pay');
                    } else {
                      setPayDetail('');
                      setPayProvider('Visa');
                    }
                  }}
                  className="input-field"
                  style={{ width: '100px', padding: '0 0.5rem', height: '38px' }}
                >
                  <option value="upi">UPI ID</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  {payType === 'upi' ? 'UPI Virtual Address (e.g. name@upi)' : 'Card Number (e.g. VISA 16-digits)'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={payType === 'upi' ? 'username@upi' : '4111 2222 3333 4444'}
                  value={payDetail}
                  onChange={e => setPayDetail(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Provider</label>
                <input
                  type="text"
                  required
                  value={payProvider}
                  onChange={e => setPayProvider(e.target.value)}
                  className="input-field"
                  style={{ width: '110px' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '38px' }}>Save Method</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

