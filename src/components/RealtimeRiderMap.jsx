import React, { useEffect, useState, useRef } from 'react';
import { Bike, MapPin, Navigation, Compass } from 'lucide-react';
import { trackingService } from '../services/trackingService';
import { fetchRoute } from '../services/routeService';

export const RealtimeRiderMap = ({ order }) => {
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [eta, setEta] = useState('Calculating...');
  const [distanceRemaining, setDistanceRemaining] = useState('Calculating...');
  
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const storeMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  
  const prevCoordsRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // Load Leaflet CDN script and stylesheet
  useEffect(() => {
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
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);

    return () => {};
  }, []);

  // Listen to Realtime Database tracking updates
  useEffect(() => {
    if (!order?.id) return;
    
    const unsubscribe = trackingService.listenToTracking(order.id, (data) => {
      if (data) {
        setTrackingData(data);
        if (data.eta) setEta(data.eta);
        if (data.distance) setDistanceRemaining(data.distance);
      }
    });

    return () => unsubscribe();
  }, [order?.id]);

  // Calculate bearing angle for rotation
  const getBearing = (start, end) => {
    if (!start || !end) return 0;
    const lat1 = start.lat * Math.PI / 180;
    const lat2 = end.lat * Math.PI / 180;
    const dLon = (end.lng - start.lng) * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
  };

  // Initialize and maintain map instance
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || !order) return;

    const L = window.L;
    
    const customerPos = order.customerCoords || { lat: 28.62, lng: 77.36 };
    const storePos = order.vendorCoords || { lat: 28.62, lng: 77.36 };
    
    // Default initial rider pos: store coordinates if not tracking yet
    const riderPos = trackingData?.location || storePos;

    if (!leafletMapRef.current) {
      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [riderPos.lat, riderPos.lng],
        zoom: 15,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);
      leafletMapRef.current = map;

      // Add Store Marker
      const storeIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="background-color: #10b981; border: 2px solid white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.25);">
                <span style="font-size: 16px;">🏪</span>
               </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
      storeMarkerRef.current = L.marker([storePos.lat, storePos.lng], { icon: storeIcon }).addTo(map)
        .bindPopup(`<b>${order.vendorName}</b><br/>Order pick up point`);

      // Add Customer Marker
      const customerIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `<div style="background-color: #ef4444; border: 2px solid white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.25);">
                <span style="font-size: 16px;">🏠</span>
               </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
      customerMarkerRef.current = L.marker([customerPos.lat, customerPos.lng], { icon: customerIcon }).addTo(map)
        .bindPopup(`<b>You</b><br/>${order.address.split(',')[0]}`);

      // Add Rider Marker
      const bearing = getBearing(storePos, customerPos);
      const riderIcon = L.divIcon({
        className: 'custom-rider-icon',
        html: `<div id="rider-icon-container" style="transform: rotate(${bearing}deg); transition: transform 0.2s ease; background-color: #ffffff; border: 2.5px solid #16a34a; border-radius: 50%; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(22,163,74,0.35);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 13H17.5L16.2 9.5C15.9 8.6 15 8 14 8H10C9 8 8.1 8.6 7.8 9.5L6.5 13H5C4.4 13 4 13.4 4 14C4 14.6 4.4 15 5 15H6L7 18H17L18 15H19C19.6 15 20 14.6 20 14C20 13.4 19.6 13 19 13ZM10 10H14L15.1 13H8.9L10 10ZM8.5 16.5C8.5 15.7 9.2 15 10 15C10.8 15 11.5 15.7 11.5 16.5C11.5 17.3 10.8 18 10 18C9.2 18 8.5 17.3 8.5 16.5ZM14 16.5C14 15.7 14.7 15 15.5 15C16.3 15 17 15.7 17 16.5C17 17.3 16.3 18 15.5 18C14.7 18 14 17.3 14 16.5Z" fill="#16a34a"/>
                </svg>
               </div>`,
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      });
      riderMarkerRef.current = L.marker([riderPos.lat, riderPos.lng], { icon: riderIcon }).addTo(map)
        .bindPopup(`<b>Delivery Executive</b><br/>On the way`);

      // Initialize route polyline
      routePolylineRef.current = L.polyline([], {
        color: '#16a34a',
        weight: 5,
        opacity: 0.8,
        dashArray: '10, 8'
      }).addTo(map);

      // Fit bounds
      const bounds = L.latLngBounds([customerPos, storePos, riderPos]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {};
  }, [leafletLoaded, order]);

  // Handle updates to Rider Location (Draw route + Smoothly animate marker)
  useEffect(() => {
    if (!leafletMapRef.current || !riderMarkerRef.current || !order || !trackingData?.location) return;

    const L = window.L;
    const newLoc = trackingData.location;
    const startLoc = prevCoordsRef.current || riderMarkerRef.current.getLatLng();
    prevCoordsRef.current = newLoc;

    // Calculate heading angle
    const bearing = getBearing(startLoc, newLoc);
    
    // Rotate custom bike icon
    const iconContainer = document.getElementById('rider-icon-container');
    if (iconContainer) {
      iconContainer.style.transform = `rotate(${bearing}deg)`;
    }

    // Cancel any ongoing transition animations
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }

    // Smooth transition interpolation (Linear Tween over 2.5s)
    const animationDuration = 2500; // ms
    const startTime = performance.now();

    const animateStep = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      // Calculate current interpolated position
      const lat = startLoc.lat + (newLoc.lat - startLoc.lat) * progress;
      const lng = startLoc.lng + (newLoc.lng - startLoc.lng) * progress;

      // Update marker coordinates
      riderMarkerRef.current.setLatLng([lat, lng]);

      // Automatically keep the map centered / panning to keep the bike in view
      if (progress === 1) {
        // Center map gently once animation finishes
        leafletMapRef.current.panTo([newLoc.lat, newLoc.lng]);
      }

      if (progress < 1) {
        animationFrameIdRef.current = requestAnimationFrame(animateStep);
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(animateStep);

    // Fetch and update the path/route polyline from rider to customer
    const updateRoutePath = async () => {
      const destination = order.customerCoords || { lat: 28.62, lng: 77.36 };
      const routeData = await fetchRoute(newLoc, destination);
      if (routeData && routeData.coordinates && routePolylineRef.current) {
        const pathPoints = routeData.coordinates.map(pt => [pt.lat, pt.lng]);
        routePolylineRef.current.setLatLngs(pathPoints);
      }
    };
    updateRoutePath();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [trackingData?.location]);

  return (
    <div style={styles.container}>
      {/* Real-time details strip */}
      <div style={styles.detailStrip}>
        <div style={styles.statBox}>
          <Compass size={16} style={styles.statIcon} className="animate-spin-slow" />
          <div>
            <div style={styles.statLabel}>Delivery ETA</div>
            <div style={styles.statValue}>{eta}</div>
          </div>
        </div>
        
        <div style={styles.statDivider} />

        <div style={styles.statBox}>
          <Navigation size={16} style={{ ...styles.statIcon, transform: 'rotate(45deg)', color: '#ea580c' }} />
          <div>
            <div style={styles.statLabel}>Remaining Distance</div>
            <div style={styles.statValue}>{distanceRemaining}</div>
          </div>
        </div>
      </div>

      {/* Map DOM Element */}
      <div ref={mapContainerRef} style={styles.mapDom} />

      {/* Styles Injection */}
      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .custom-rider-icon {
          background: transparent !important;
          border: none !important;
        }
        .custom-map-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '350px',
    backgroundColor: 'var(--neutral-light)',
    border: '1px solid var(--neutral-border)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-md)',
    position: 'relative'
  },
  detailStrip: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '0.65rem 1rem',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid var(--neutral-border)',
    zIndex: 10
  },
  statBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  statIcon: {
    color: '#16a34a'
  },
  statLabel: {
    fontSize: '0.68rem',
    color: 'var(--neutral-muted)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.02em'
  },
  statValue: {
    fontSize: '0.9rem',
    fontWeight: 900,
    color: 'var(--neutral-text)'
  },
  statDivider: {
    width: '1px',
    height: '24px',
    backgroundColor: 'var(--neutral-border)'
  },
  mapDom: {
    flex: 1,
    width: '100%',
    height: '100%',
    zIndex: 1
  }
};
