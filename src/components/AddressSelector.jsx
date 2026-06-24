import React, { useState, useEffect, useRef } from 'react';
import { Home, Briefcase, Building, MapPin, Search, X, Navigation, Loader2, User, Phone, Check } from 'lucide-react';

export const AddressSelector = ({
  isOpen,
  onClose,
  onConfirm,
  initialCoords,
  initialDetails = {},
  title = "Enter complete address",
  confirmBtnText = "Confirm Address",
  hideTags = false,
  userName = "",
  userPhone = ""
}) => {
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isPanning, setIsPanning] = useState(false);

  // Map state
  const [tempCoords, setTempCoords] = useState(initialCoords || { lat: 28.62, lng: 77.36 });
  const [locality, setLocality] = useState(initialDetails.locality || 'Locality detection pending...');

  // Form states
  const [tag, setTag] = useState(initialDetails.tag || 'Home');
  const [flat, setFlat] = useState(initialDetails.flat || '');
  const [floor, setFloor] = useState(initialDetails.floor || '');
  const [landmark, setLandmark] = useState(initialDetails.landmark || '');
  const [name, setName] = useState(initialDetails.name || userName);
  const [phone, setPhone] = useState(initialDetails.phone || userPhone);
  const [errors, setErrors] = useState({});

  const mapContainerRef = useRef(null);
  const leafletMapInstanceRef = useRef(null);

  // Sync state if initial props change
  useEffect(() => {
    if (initialCoords) {
      setTempCoords(initialCoords);
    }
  }, [initialCoords]);

  // Load Leaflet CDN script and stylesheet dynamically
  useEffect(() => {
    if (!isOpen) return;

    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Elements persist to avoid reloading multiple times if closed/opened
    };
  }, [isOpen]);

  // Initialize Map
  useEffect(() => {
    if (!isOpen || !leafletLoaded || !mapContainerRef.current) return;

    const L = window.L;
    const startCenter = tempCoords || { lat: 28.62, lng: 77.36 };

    // Avoid double initialization
    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.setView([startCenter.lat, startCenter.lng], 16);
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: [startCenter.lat, startCenter.lng],
      zoom: 16,
      zoomControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Zoom buttons in topright
    L.control.zoom({ position: 'topright' }).addTo(map);

    leafletMapInstanceRef.current = map;

    // Trigger initial reverse geocoding
    handleReverseGeocode(startCenter.lat, startCenter.lng);

    // Listen to panning events for central pin animation
    map.on('movestart', () => {
      setIsPanning(true);
    });

    map.on('move', () => {
      // Can continuously track center coords if needed
    });

    map.on('moveend', () => {
      setIsPanning(false);
      const center = map.getCenter();
      handleReverseGeocode(center.lat, center.lng);
    });

    return () => {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, [isOpen, leafletLoaded]);

  async function handleReverseGeocode(lat, lng) {
    setLoadingAddress(true);
    setTempCoords({ lat, lng });
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          // Process display name to make it slightly cleaner/shorter for locality
          setLocality(data.display_name);
        }
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (response.ok) {
        const data = await response.json();
        setSearchSuggestions(data);
      }
    } catch (err) {
      console.error('Search query geocoding error:', err);
    } finally {
      setSearching(false);
    }
  };

  const selectSuggestion = (sug) => {
    const lat = parseFloat(sug.lat);
    const lng = parseFloat(sug.lon);
    
    if (leafletMapInstanceRef.current) {
      leafletMapInstanceRef.current.setView([lat, lng], 16);
    }
    
    setSearchQuery(sug.display_name);
    setSearchSuggestions([]);
    handleReverseGeocode(lat, lng);
  };

  const handleGoToCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoadingAddress(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (leafletMapInstanceRef.current) {
            leafletMapInstanceRef.current.setView([lat, lng], 16);
          }
          handleReverseGeocode(lat, lng);
        },
        (error) => {
          console.error('Current location access denied:', error);
          setLoadingAddress(false);
          alert('GPS Geolocation access denied or failed. Please check browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const validate = () => {
    const errs = {};
    if (!flat.trim()) errs.flat = 'Flat / House No. / Building is required';
    if (!locality.trim() || locality === 'Locality detection pending...') {
      errs.locality = 'Valid geocoded locality is required';
    }
    if (!name.trim()) errs.name = 'Contact name is required';
    return errs;
  };

  const handleConfirmSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Build the complete combined address string
    let fullAddr = `${flat.trim()}`;
    if (floor.trim()) fullAddr += `, Floor ${floor.trim()}`;
    fullAddr += `, ${locality.trim()}`;
    if (landmark.trim()) fullAddr += ` (Landmark: ${landmark.trim()})`;

    onConfirm({
      address: fullAddr,
      coords: tempCoords,
      tag: hideTags ? 'Store' : tag,
      details: {
        flat,
        floor,
        locality,
        landmark,
        name,
        phone,
        tag: hideTags ? 'Store' : tag
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div style={styles.backdrop}>
      <div style={styles.modalContainer} className="animate-fade-in">
        
        {/* MAP CONTAINER (LEFT SIDE) */}
        <div style={styles.mapSection}>
          {/* Geocoding Search Overlay */}
          <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <div style={styles.searchContainer}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search for your street, area or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSearchSuggestions([]); }}
                  style={styles.clearSearchBtn}
                >
                  <X size={16} />
                </button>
              )}
              <button type="submit" disabled={searching} style={styles.searchBtn}>
                {searching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {searchSuggestions.length > 0 && (
              <div style={styles.suggestionsContainer}>
                {searchSuggestions.map((sug) => (
                  <div
                    key={sug.place_id}
                    onClick={() => selectSuggestion(sug)}
                    style={styles.suggestionItem}
                  >
                    <MapPin size={16} style={{ color: 'var(--neutral-muted)', flexShrink: 0 }} />
                    <span style={styles.suggestionText}>{sug.display_name}</span>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Leaflet Map element */}
          <div ref={mapContainerRef} style={styles.mapElement} />

          {/* Central Swiggy/Zomato Pin Overlay */}
          <div style={{
            ...styles.centerPinContainer,
            transform: isPanning ? 'translate(-50%, -100%) translateY(-12px)' : 'translate(-50%, -100%)',
            transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)'
          }}>
            {/* Custom SVG marker pin */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="9" r="3" fill="#ffffff" />
            </svg>
            {/* Pin shadow at absolute map center */}
            <div style={{
              ...styles.pinShadow,
              opacity: isPanning ? 0.3 : 0.7,
              transform: `scale(${isPanning ? 0.5 : 1})`,
              transition: 'all 0.2s ease'
            }} />
          </div>

          {/* Go to current location button */}
          <button onClick={handleGoToCurrentLocation} style={styles.currentLocBtn}>
            <Navigation size={16} style={{ transform: 'rotate(45deg)' }} />
            <span>Go to current location</span>
          </button>

          {/* Delivering to status bar */}
          <div style={styles.deliveryStatusCard}>
            <div style={styles.deliveryPinRing}>
              <div style={styles.deliveryPinDot} />
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={styles.statusTitle}>
                {hideTags ? 'Store Location' : 'Delivering your order to'}
              </div>
              <div style={styles.statusAddress} title={locality}>
                {loadingAddress ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--neutral-muted)' }}>
                    <Loader2 size={12} className="animate-spin" /> Geocoding address...
                  </span>
                ) : (
                  locality
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS FORM (RIGHT SIDE) */}
        <div style={styles.formSection}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>{title}</h3>
            <button onClick={onClose} style={styles.closeBtn}>
              <X size={20} />
            </button>
          </div>

          <div style={styles.formBody}>
            {/* TAG SELECTOR */}
            {!hideTags && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={styles.fieldLabel}>Save address as</label>
                <div style={styles.tagGroup}>
                  {[
                    { id: 'Home', label: 'Home', icon: <Home size={15} />, color: '#10b981' },
                    { id: 'Work', label: 'Work', icon: <Briefcase size={15} />, color: '#f97316' },
                    { id: 'Hotel', label: 'Hotel', icon: <Building size={15} />, color: '#eab308' },
                    { id: 'Other', label: 'Other', icon: <MapPin size={15} />, color: '#6366f1' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTag(t.id)}
                      style={{
                        ...styles.tagButton,
                        borderColor: tag === t.id ? 'var(--primary-green)' : 'var(--neutral-border)',
                        backgroundColor: tag === t.id ? 'var(--primary-green-light)' : 'var(--neutral-white)',
                        color: tag === t.id ? 'var(--neutral-text)' : 'var(--neutral-muted)'
                      }}
                    >
                      <span style={{ color: tag === t.id ? 'var(--primary-green)' : t.color, display: 'flex' }}>
                        {t.icon}
                      </span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* FLAT / HOUSE NO */}
            <div style={styles.inputContainer}>
              <label style={styles.fieldLabel}>Flat / House no / Building name *</label>
              <input
                type="text"
                placeholder="e.g. Flat 302, Green Apartments"
                value={flat}
                onChange={(e) => { setFlat(e.target.value); setErrors(p => ({ ...p, flat: '' })); }}
                style={{
                  ...styles.formInput,
                  borderColor: errors.flat ? '#ef4444' : 'var(--neutral-border)'
                }}
              />
              {errors.flat && <span style={styles.errorText}>{errors.flat}</span>}
            </div>

            {/* FLOOR */}
            <div style={styles.inputContainer}>
              <label style={styles.fieldLabel}>Floor (optional)</label>
              <input
                type="text"
                placeholder="e.g. 3rd Floor"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                style={styles.formInput}
              />
            </div>

            {/* AREA / LOCALITY */}
            <div style={styles.inputContainer}>
              <label style={styles.fieldLabel}>Area / Sector / Locality *</label>
              <textarea
                placeholder="Geocoded location address details..."
                value={locality}
                onChange={(e) => { setLocality(e.target.value); setErrors(p => ({ ...p, locality: '' })); }}
                rows="2"
                style={{
                  ...styles.formTextarea,
                  borderColor: errors.locality ? '#ef4444' : 'var(--neutral-border)'
                }}
              />
              {errors.locality && <span style={styles.errorText}>{errors.locality}</span>}
            </div>

            {/* NEARBY LANDMARK */}
            <div style={styles.inputContainer}>
              <label style={styles.fieldLabel}>Nearby landmark (optional)</label>
              <input
                type="text"
                placeholder="e.g. Opposite St. Xavier High School"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                style={styles.formInput}
              />
            </div>

            <div style={styles.dividerTitle}>
              Contact details for delivery
            </div>

            {/* CONTACT NAME */}
            <div style={styles.inputContainer}>
              <label style={styles.fieldLabel}>Contact Name *</label>
              <div style={styles.formInputWithIconContainer}>
                <User size={15} style={styles.inputFieldIcon} />
                <input
                  type="text"
                  placeholder="Receiver's name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                  style={{
                    ...styles.formInputWithIcon,
                    borderColor: errors.name ? '#ef4444' : 'var(--neutral-border)'
                  }}
                />
              </div>
              {errors.name && <span style={styles.errorText}>{errors.name}</span>}
            </div>

            {/* CONTACT PHONE */}
            <div style={styles.inputContainer}>
              <label style={styles.fieldLabel}>Phone number (optional)</label>
              <div style={styles.formInputWithIconContainer}>
                <Phone size={15} style={styles.inputFieldIcon} />
                <input
                  type="tel"
                  placeholder="Receivers mobile"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={styles.formInputWithIcon}
                />
              </div>
            </div>
          </div>

          {/* CONFIRM BUTTON */}
          <div style={styles.formFooter}>
            <button
              onClick={handleConfirmSubmit}
              disabled={loadingAddress}
              style={{
                ...styles.confirmBtn,
                opacity: loadingAddress ? 0.7 : 1,
                cursor: loadingAddress ? 'not-allowed' : 'pointer'
              }}
            >
              {loadingAddress ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Geocoding location...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>{confirmBtnText}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    boxSizing: 'border-box'
  },
  modalContainer: {
    backgroundColor: 'var(--neutral-white)',
    borderRadius: 'var(--radius-xl)',
    width: '100%',
    maxWidth: '960px',
    height: '640px',
    display: 'flex',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    border: '1px solid var(--neutral-border)',
    flexDirection: 'row',
    fontFamily: 'var(--font-sans)',
    '@media (maxWidth: 768px)': {
      flexDirection: 'column',
      height: '90vh'
    }
  },
  mapSection: {
    flex: 1.1,
    position: 'relative',
    height: '100%',
    backgroundColor: '#cbd5e1',
    display: 'flex',
    flexDirection: 'column'
  },
  mapElement: {
    width: '100%',
    height: '100%',
    zIndex: 1
  },
  centerPinContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -100%)',
    pointerEvents: 'none',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  pinShadow: {
    width: '12px',
    height: '4px',
    background: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '50%',
    marginTop: '-2px'
  },
  searchForm: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    right: '12px',
    zIndex: 110,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--neutral-white)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    padding: '0.25rem 0.5rem',
    border: '1px solid var(--neutral-border)',
    height: '46px'
  },
  searchIcon: {
    color: 'var(--neutral-muted)',
    marginLeft: '8px',
    marginRight: '8px',
    flexShrink: 0
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '0.88rem',
    color: 'var(--neutral-text)',
    backgroundColor: 'transparent',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    paddingRight: '6px'
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--neutral-muted)',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%'
  },
  searchBtn: {
    backgroundColor: 'var(--primary-green)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '0.5rem 1rem',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'var(--transition-all)',
    marginLeft: '4px',
    fontFamily: 'var(--font-sans)',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  suggestionsContainer: {
    backgroundColor: 'var(--neutral-white)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--neutral-border)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '180px',
    overflowY: 'auto'
  },
  suggestionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    borderBottom: '1px solid var(--neutral-border)',
    transition: 'background-color 0.2s ease'
  },
  suggestionText: {
    fontSize: '0.78rem',
    color: 'var(--neutral-text)',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontWeight: 500
  },
  currentLocBtn: {
    position: 'absolute',
    bottom: '96px',
    left: '12px',
    zIndex: 100,
    backgroundColor: 'var(--neutral-white)',
    color: 'var(--primary-green)',
    border: '1px solid var(--primary-green)',
    borderRadius: 'var(--radius-md)',
    padding: '0.5rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: 'var(--shadow-md)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    transition: 'var(--transition-all)',
    fontFamily: 'var(--font-sans)'
  },
  deliveryStatusCard: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    right: '12px',
    zIndex: 100,
    backgroundColor: 'var(--neutral-white)',
    borderRadius: 'var(--radius-lg)',
    padding: '0.75rem 1rem',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    border: '1px solid var(--neutral-border)'
  },
  deliveryPinRing: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  deliveryPinDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-green)'
  },
  statusTitle: {
    fontSize: '0.75rem',
    color: 'var(--neutral-muted)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.02em'
  },
  statusAddress: {
    fontSize: '0.8rem',
    color: 'var(--neutral-text)',
    fontWeight: 600,
    marginTop: '0.1rem',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  formSection: {
    flex: 0.9,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    borderLeft: '1px solid var(--neutral-border)',
    backgroundColor: 'var(--neutral-white)'
  },
  formHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--neutral-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  formTitle: {
    fontSize: '1.1rem',
    fontWeight: 800,
    color: 'var(--neutral-text)'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--neutral-muted)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s ease'
  },
  formBody: {
    flex: 1,
    padding: '1.25rem 1.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  fieldLabel: {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: 'var(--neutral-text)',
    marginBottom: '0.35rem'
  },
  tagGroup: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  tagButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.85rem',
    border: '1px solid',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    transition: 'var(--transition-all)'
  },
  inputContainer: {
    marginBottom: '1rem'
  },
  formInput: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--neutral-border)',
    fontSize: '0.88rem',
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
    color: 'var(--neutral-text)',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  },
  formTextarea: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--neutral-border)',
    fontSize: '0.85rem',
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
    color: 'var(--neutral-text)',
    outline: 'none',
    resize: 'none',
    transition: 'border-color 0.2s ease'
  },
  dividerTitle: {
    fontSize: '0.7rem',
    color: 'var(--neutral-muted)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '0.5rem',
    marginBottom: '0.85rem',
    borderBottom: '1px dashed var(--neutral-border)',
    paddingBottom: '0.35rem'
  },
  formInputWithIconContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputFieldIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--neutral-muted)'
  },
  formInputWithIcon: {
    width: '100%',
    padding: '0.65rem 0.85rem 0.65rem 2.25rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--neutral-border)',
    fontSize: '0.88rem',
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
    color: 'var(--neutral-text)',
    outline: 'none'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.7rem',
    fontWeight: 600,
    marginTop: '0.25rem',
    display: 'block'
  },
  formFooter: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid var(--neutral-border)',
    backgroundColor: 'var(--neutral-light)'
  },
  confirmBtn: {
    width: '100%',
    backgroundColor: 'var(--primary-green)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    padding: '0.85rem',
    fontSize: '0.95rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    transition: 'var(--transition-all)',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
  }
};
