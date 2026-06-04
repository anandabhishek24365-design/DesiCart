import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Bike,
  Navigation,
  CheckCircle,
  MapPin,
  Phone,
  DollarSign,
  AlertCircle,
  Clock,
  Briefcase,
  LogOut,
  Play,
  Pause,
  Compass
} from 'lucide-react';
import { trackingService } from '../services/trackingService';
import { fetchRoute } from '../services/routeService';

export const DeliveryDashboard = () => {
  const {
    deliveryPartners,
    orders,
    currentRiderId,
    updateOrderStatus,
    acceptDeliveryJob,
    vendors,
    logout,
    globalCoords,
    isGpsActive,
    requestGlobalGPS,
    globalAddress,
    updateRiderProfile,
    toggleRiderStatus,
    showToast
  } = useContext(AppContext);

  // Active sub tab state
  // 'jobs' | 'earnings'
  const [activeTab, setActiveTab] = useState('jobs');

  // Simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStepIndex, setSimStepIndex] = useState(0);
  const [simRoutePoints, setSimRoutePoints] = useState([]);
  const [simTotalDistance, setSimTotalDistance] = useState(0);
  const [simTotalDuration, setSimTotalDuration] = useState(0);
  const simIntervalIdRef = useRef(null);

  // Find active rider details
  const currentRider = deliveryPartners.find((r) => r.id === currentRiderId);

  // Derive job state
  const availableOrders = orders.filter((o) => o.status === 'ready' && !o.deliveryPartnerId);
  const activeOrder = orders.find(
    (o) => o.deliveryPartnerId === currentRiderId && 
    ['ready', 'rider_assigned', 'reached_store', 'out_for_delivery', 'arriving_soon'].includes(o.status)
  );

  const completedDeliveries = orders.filter(
    (o) => o.deliveryPartnerId === currentRiderId && o.status === 'delivered'
  );

  // Toggle rider availability status
  const handleToggleStatus = () => {
    toggleRiderStatus(currentRiderId);
  };

  // Handle simulation initialization when order status transitions
  useEffect(() => {
    if (!activeOrder) {
      setIsSimulating(false);
      setSimRoutePoints([]);
      setSimStepIndex(0);
      return;
    }

    const loadSimRoute = async () => {
      const store = vendors.find(v => v.id === activeOrder.vendorId);
      const storeCoords = store?.coords || { lat: 28.62, lng: 77.36 };
      const customerCoords = activeOrder.customerCoords || { lat: 28.62, lng: 77.36 };

      let startCoords, endCoords;

      if (activeOrder.status === 'rider_assigned') {
        // Start simulated location 1.5 km away from store
        startCoords = { lat: storeCoords.lat + 0.008, lng: storeCoords.lng - 0.008 };
        endCoords = storeCoords;
      } else if (activeOrder.status === 'out_for_delivery' || activeOrder.status === 'arriving_soon') {
        startCoords = storeCoords;
        endCoords = customerCoords;
      } else {
        // ready or reached_store, no movement
        setSimRoutePoints([]);
        setSimStepIndex(0);
        return;
      }

      const routeData = await fetchRoute(startCoords, endCoords);
      if (routeData && routeData.coordinates && routeData.coordinates.length > 0) {
        setSimRoutePoints(routeData.coordinates);
        setSimTotalDistance(routeData.distance);
        setSimTotalDuration(routeData.duration);
        setSimStepIndex(0);
        setIsSimulating(true); // Auto-start simulation for convenience
      }
    };

    loadSimRoute();
  }, [activeOrder?.id, activeOrder?.status]);

  // Run simulation interval
  useEffect(() => {
    if (!isSimulating || simRoutePoints.length === 0 || !activeOrder) {
      if (simIntervalIdRef.current) clearInterval(simIntervalIdRef.current);
      return;
    }

    simIntervalIdRef.current = setInterval(() => {
      setSimStepIndex((prevIdx) => {
        const nextIdx = prevIdx + 1;
        if (nextIdx >= simRoutePoints.length) {
          // Reached destination!
          clearInterval(simIntervalIdRef.current);
          setIsSimulating(false);

          // Handle automatic transitions on arrival
          if (activeOrder.status === 'rider_assigned') {
            updateOrderStatus(activeOrder.id, 'reached_store', currentRiderId);
            showToast('Rider arrived at store!', 'success');
          } else if (activeOrder.status === 'out_for_delivery' || activeOrder.status === 'arriving_soon') {
            updateOrderStatus(activeOrder.id, 'arriving_soon', currentRiderId);
            showToast('Rider has arrived at delivery destination!', 'info');
          }
          return prevIdx;
        }

        const currentPt = simRoutePoints[nextIdx];
        const pctRemaining = (simRoutePoints.length - 1 - nextIdx) / (simRoutePoints.length - 1);
        
        const remDistMeters = simTotalDistance * pctRemaining;
        const remDistStr = (remDistMeters / 1000).toFixed(1) + " km";
        const remDurationSeconds = simTotalDuration * pctRemaining;
        const remEtaStr = Math.ceil(remDurationSeconds / 60) + " mins";

        // Auto trigger arriving_soon status when close (< 300 meters)
        if (activeOrder.status === 'out_for_delivery' && remDistMeters < 300) {
          updateOrderStatus(activeOrder.id, 'arriving_soon', currentRiderId);
        }

        // Push update to Realtime Database
        trackingService.updateTracking(activeOrder.id, {
          location: currentPt,
          eta: remEtaStr,
          distance: remDistStr,
          status: activeOrder.status
        }).catch(console.error);

        return nextIdx;
      });
    }, 3000); // Step every 3 seconds

    return () => {
      if (simIntervalIdRef.current) clearInterval(simIntervalIdRef.current);
    };
  }, [isSimulating, simRoutePoints, activeOrder?.id, activeOrder?.status, simTotalDistance, simTotalDuration]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '5rem' }} className="animate-fade-in">
      {/* Header Profile Panel */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/logo.jpg"
              alt="DesiCart"
              style={{
                width: '45px',
                height: '45px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--neutral-border)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{currentRider?.name || 'Rider Console'}</h2>
                <span className={`badge ${currentRider?.status === 'online' ? 'badge-delivered' : 'badge-pending'}`} style={{ fontSize: '0.65rem' }}>
                  {currentRider?.status}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>
                Phone: {currentRider?.phone} • ID: {currentRiderId}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`btn btn-sm ${activeTab === 'jobs' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Jobs
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`btn btn-sm ${activeTab === 'earnings' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Earnings
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`btn btn-sm ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Profile
            </button>
            <button
              onClick={logout}
              className="btn btn-sm btn-secondary"
              style={{ borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Geolocation Status bar */}
      <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
          <MapPin size={16} style={{ color: isGpsActive ? 'var(--primary-green)' : 'var(--neutral-muted)' }} />
          <span style={{ fontWeight: 600 }}>
            {isGpsActive && globalCoords 
              ? `GPS Live Position: ${globalCoords.lat.toFixed(5)}, ${globalCoords.lng.toFixed(5)}` 
              : 'GPS Tracker status: Simulation. Grant browser permission?'}
          </span>
        </div>
        <button
          onClick={requestGlobalGPS}
          className={`btn btn-sm ${isGpsActive ? 'btn-secondary' : 'btn-primary'}`}
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
        >
          {isGpsActive ? 'Active' : 'Allow GPS'}
        </button>
      </div>

      {/* SUB-VIEW 1: JOBS BOARD */}
      {activeTab === 'jobs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Job (Rider accepted but not delivered) */}
          {activeOrder ? (
            <div className="card" style={{ border: '2px solid var(--primary-green)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Navigation className="animate-pulse-slow" size={18} />
                <span>Active Routing Task</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Store Pickup location */}
                <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '-12px', width: '2px', backgroundColor: 'var(--neutral-border)' }} />
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary-green-light)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    1
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>Store Pickup Outlet</h4>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '0.1rem' }}>{activeOrder.vendorName}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={12} />
                      <span>{vendors.find(v => v.id === activeOrder.vendorId)?.address}</span>
                    </p>
                  </div>
                </div>

                {/* Customer Drop-off location */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--accent-orange-light)', color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    2
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>Customer Drop Destination</h4>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '0.1rem' }}>{activeOrder.customerName}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={12} />
                      <span>{activeOrder.address}</span>
                    </p>
                  </div>
                </div>

                {/* Package Details */}
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--neutral-light)', borderRadius: 'var(--radius-lg)', marginTop: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--neutral-muted)', marginBottom: '0.25rem' }}>Order Consignment Details:</h4>
                  {activeOrder.items.map((i) => (
                    <div key={i.id} style={{ fontSize: '0.8rem', color: 'var(--neutral-text)' }}>
                      • {i.name} x {i.quantity}
                    </div>
                  ))}
                </div>

                 {/* Simulation Control Card */}
                <div style={{ padding: '1rem', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--neutral-light)', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--neutral-text)', display: 'flex', alignItems: 'center', gap: '0.35rem', margin: 0 }}>
                      <Bike size={16} style={{ color: '#16a34a' }} />
                      <span>Live Simulation Engine</span>
                    </h4>
                    <span className={`badge ${isSimulating ? 'badge-delivered' : 'badge-pending'}`} style={{ fontSize: '0.62rem' }}>
                      {isSimulating ? 'SIMULATOR ACTIVE' : 'SIMULATOR PAUSED'}
                    </span>
                  </div>

                  {simRoutePoints.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {/* Stats */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--neutral-border)' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)', fontWeight: 700, textTransform: 'uppercase' }}>SIM ROUTE POINTS</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--neutral-text)' }}>{simStepIndex + 1} / {simRoutePoints.length}</div>
                        </div>
                        <div style={{ padding: '0.5rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--neutral-border)' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)', fontWeight: 700, textTransform: 'uppercase' }}>TARGET LOCATION</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--neutral-text)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {activeOrder.status === 'rider_assigned' ? 'Pickup Store' : 'Customer Address'}
                          </div>
                        </div>
                      </div>

                      {/* Play/Pause controls */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <button
                          type="button"
                          onClick={() => setIsSimulating(!isSimulating)}
                          className={`btn btn-sm ${isSimulating ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', height: '32px', fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          {isSimulating ? (
                            <><Pause size={14} /> Pause Simulator</>
                          ) : (
                            <><Play size={14} /> Start Simulator</>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', textAlign: 'center', padding: '0.5rem 0' }}>
                      Rider stationary. Simulation will initialize automatically when transitioning coordinates.
                    </div>
                  )}
                </div>

                {/* Dispatch Progress Controls */}
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeOrder.status === 'ready' || activeOrder.status === 'rider_assigned' ? (
                    <>
                      <button
                        onClick={() => updateOrderStatus(activeOrder.id, 'reached_store', currentRiderId)}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                      >
                        📍 Reached Store (Arrived)
                      </button>
                      <button
                        onClick={() => {
                          updateOrderStatus(activeOrder.id, 'ready', null);
                          showToast('Delivery job rejected / returned to pool.', 'warning');
                        }}
                        className="btn btn-secondary"
                        style={{ width: '100%', color: '#ef4444', borderColor: '#fca5a5' }}
                      >
                        Reject Delivery Assignment
                      </button>
                    </>
                  ) : activeOrder.status === 'reached_store' ? (
                    <button
                      onClick={() => updateOrderStatus(activeOrder.id, 'out_for_delivery', currentRiderId)}
                      className="btn btn-orange"
                      style={{ width: '100%' }}
                    >
                      📦 Confirm Order Picked Up
                    </button>
                  ) : (
                    <button
                      onClick={() => updateOrderStatus(activeOrder.id, 'delivered', currentRiderId)}
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      <CheckCircle size={16} /> Confirm Package Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Available jobs Feed */
            <div className="card">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={18} />
                <span>Available Jobs Pool ({availableOrders.length})</span>
              </h3>

              {availableOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <AlertCircle size={32} style={{ color: 'var(--neutral-muted)', marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)' }}>
                    No packages ready for pickup at this moment.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {availableOrders.map((order) => (
                    <div key={order.id} style={{ padding: '1rem', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--neutral-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 800 }}>Task ID: {order.id.replace('order_', '#')}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                          <Clock size={12} /> Ready
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--neutral-muted)', marginBottom: '0.75rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--neutral-text)' }}>Pickup: {order.vendorName}</div>
                        <div>Drop: {order.address.split(',')[0]} (Customer address)</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--neutral-border)', paddingTop: '0.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-green)' }}>
                            Payout: ₹{order.deliveryFee + 45}
                          </div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)' }}>Base pay + delivery fee</span>
                        </div>
                        <button
                          onClick={() => acceptDeliveryJob(order.id, currentRiderId)}
                          className="btn btn-sm btn-primary"
                        >
                          Accept Delivery
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: EARNINGS ANALYTICS */}
      {activeTab === 'earnings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-green-light)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>Total Life Earnings</div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900 }}>₹{currentRider?.totalEarnings || 0}</h1>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Completed Shipments log ({completedDeliveries.length})</h3>

            {completedDeliveries.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)', textAlign: 'center', padding: '1.5rem' }}>
                Complete delivery jobs to see entries here.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {completedDeliveries.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      borderBottom: '1px solid var(--neutral-border)'
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>{order.vendorName}</h4>
                      <p style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)' }}>
                        ID: {order.id.replace('order_', '#')} • Paid via: {order.paymentMethod.toUpperCase()}
                      </p>
                    </div>

                    <div style={{ textRendering: 'optimizeSpeed' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-green)' }}>
                        +₹{order.deliveryFee + 45}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: PROFILE & VEHICLE */}
      {activeTab === 'profile' && (
        <RiderProfileView
          currentRider={currentRider}
          currentRiderId={currentRiderId}
          updateRiderProfile={updateRiderProfile}
          toggleRiderStatus={toggleRiderStatus}
        />
      )}
    </div>
  );
};

/* ─── Premium Rider Profile Component ─── */
const RiderProfileView = ({ currentRider, currentRiderId, updateRiderProfile, toggleRiderStatus }) => {
  const [name, setName] = useState(currentRider?.name || '');
  const [phone, setPhone] = useState(currentRider?.phone || '');
  const [vehicleNumber, setVehicleNumber] = useState(currentRider?.vehicleNumber || '');
  const [vehicleType, setVehicleType] = useState(currentRider?.vehicleType || 'bike');
  const [licenseNumber, setLicenseNumber] = useState(currentRider?.licenseNumber || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    updateRiderProfile(currentRiderId, {
      name,
      phone,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType,
      licenseNumber
    });
  };

  return (
    <div className="card animate-fade-in">
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem' }}>Profile & Vehicle Specifications</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Toggle online/offline status */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          backgroundColor: currentRider?.status === 'online' ? 'var(--primary-green-light)' : 'var(--neutral-light)',
          border: `1px solid ${currentRider?.status === 'online' ? 'var(--primary-green)' : 'var(--neutral-border)'}`,
          borderRadius: 'var(--radius-lg)'
        }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>
              Duty Status: {currentRider?.status === 'online' ? '🟢 Online (Accepting Jobs)' : '⚪ Offline'}
            </h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--neutral-muted)', marginTop: '0.1rem' }}>
              Change whether you are available to pick up pending delivery orders.
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleRiderStatus(currentRiderId)}
            className={`btn btn-sm ${currentRider?.status === 'online' ? 'btn-orange' : 'btn-primary'}`}
            style={{ fontWeight: 700, borderRadius: 'var(--radius-md)' }}
          >
            {currentRider?.status === 'online' ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Contact Mobile</label>
            <input
              type="text"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Vehicle Plate Number</label>
            <input
              type="text"
              required
              value={vehicleNumber}
              onChange={e => setVehicleNumber(e.target.value)}
              className="input-field"
              placeholder="e.g. DL 01 AB 1234"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Vehicle Type</label>
            <select
              value={vehicleType}
              onChange={e => setVehicleType(e.target.value)}
              className="input-field"
              style={{ height: '38px', padding: '0 0.5rem', borderRadius: 'var(--radius-md)' }}
            >
              <option value="bike">Motorcycle 🏍️</option>
              <option value="scooter">Scooter 🛵</option>
              <option value="cycle">Bicycle 🚲</option>
              <option value="car">Car 🚗</option>
              <option value="other">Other 📦</option>
            </select>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Driving License Number (Optional)</label>
            <input
              type="text"
              value={licenseNumber}
              onChange={e => setLicenseNumber(e.target.value)}
              className="input-field"
              placeholder="e.g. DL-2015-XXXXXXXX"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', fontWeight: 700, padding: '0.6rem 1.5rem', marginTop: '0.5rem' }}>
          Save Profile Updates
        </button>
      </form>
    </div>
  );
};
