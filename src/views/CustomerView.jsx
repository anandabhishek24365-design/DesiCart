import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { MapMock } from '../components/MapMock';
import { INITIAL_CATEGORIES, BANNER_SLIDES } from '../data/initialData';
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
    requestGlobalGPS
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

  // Filter approved vendors based on selected category & search
  const filteredVendors = vendors.filter((v) => {
    if (!v.isApproved) return false;
    
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (filterRating) return b.rating - a.rating;
    if (filterFastest) {
      const timeA = parseInt(a.deliveryTime.split('-')[0]) || 99;
      const timeB = parseInt(b.deliveryTime.split('-')[0]) || 99;
      return timeA - timeB;
    }
    return 0;
  });

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId);
  const selectedVendorProducts = products.filter((p) => p.vendorId === selectedVendorId);

  const getMockDistance = (vendorId) => {
    if (globalCoords) {
      const charCodeSum = vendorId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const seed = Math.abs(Math.sin(globalCoords.lat) * charCodeSum);
      return (0.3 + (seed % 4.5)).toFixed(1) + ' km';
    }
    const distances = { vendor_1: '0.9 km', vendor_2: '1.4 km', vendor_3: '2.1 km', vendor_4: '1.8 km', vendor_5: '3.2 km' };
    return distances[vendorId] || '2.5 km';
  };

  // Active tracking order derived
  const trackingOrder = orders.find((o) => o.id === activeTrackingOrderId);

  // Handle store clicks
  const handleVendorSelect = (vendorId) => {
    setSelectedVendorId(vendorId);
    setActiveTab('store-detail');
  };

  // Perform checkout action
  const handlePlaceOrder = () => {
    if (!address.trim()) {
      alert('Please enter a delivery address');
      return;
    }
    const orderId = checkout(address, paymentMethod);
    if (orderId) {
      setActiveTrackingOrderId(orderId);
      setCheckoutStep(1);
      setActiveTab('tracking');
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>
            <MapPin size={16} style={{ color: 'var(--accent-orange)' }} />
            <span style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={globalAddress}>
              {globalAddress}
            </span>
            <button
              onClick={requestGlobalGPS}
              style={{
                background: 'var(--primary-green-light)',
                border: '1px solid var(--primary-green)',
                color: 'var(--primary-green-hover)',
                fontSize: '0.7rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                padding: '0.15rem 0.4rem',
                marginLeft: '0.25rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)'
              }}
            >
              Auto-detect
            </button>
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
              <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed var(--neutral-border)', borderRadius: 'var(--radius-xl)' }}>
                <AlertCircle size={40} style={{ color: 'var(--neutral-muted)', marginBottom: '0.75rem' }} />
                <h4 style={{ fontWeight: 700 }}>No Outlets Match Filter</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)', marginTop: '0.25rem' }}>
                  Try removing search keywords or filters to discover local shops.
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
        {activeTab === 'store-detail' && selectedVendor && (
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
        )}

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

                    <button
                      onClick={() => setCheckoutStep(2)}
                      className="btn btn-orange"
                      style={{ width: '100%', fontSize: '1rem', padding: '1rem' }}
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                ) : (
                  /* Step 2: Address & Payment Info */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-in">
                    <div className="card">
                      <h4 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={16} style={{ color: 'var(--primary-green)' }} />
                        <span>Delivery Destination Address</span>
                      </h4>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="input-field"
                        rows="3"
                        placeholder="Complete details (House no, Street name, Pincode)"
                      />
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
                      <button onClick={handlePlaceOrder} className="btn btn-orange" style={{ flex: 2, padding: '1rem', fontSize: '1rem' }}>
                        Place Order (₹{cart.total})
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
              <MapMock status={trackingOrder.status} />

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
                    { key: 'preparing', title: 'Food Preparation', desc: 'Store is baking/packing your items' },
                    { key: 'ready', title: 'Ready for Pickup', desc: 'Rider is picking up consignment' },
                    { key: 'out_for_delivery', title: 'Out For Delivery', desc: 'Rider moving to your location' },
                    { key: 'delivered', title: 'Delivered', desc: 'Package dropped off successfully' }
                  ].map((step, idx) => {
                    const statuses = ['pending', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
                    const currentIdx = statuses.indexOf(trackingOrder.status);
                    const stepIdx = statuses.indexOf(step.key);
                    const isCompleted = stepIdx <= currentIdx;
                    const isActive = step.key === trackingOrder.status;

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
      </div>
    </div>
  );
};
