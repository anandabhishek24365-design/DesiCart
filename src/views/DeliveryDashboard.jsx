import React, { useContext, useState } from 'react';
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
  LogOut
} from 'lucide-react';

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
    globalAddress
  } = useContext(AppContext);

  // Active sub tab state
  // 'jobs' | 'earnings'
  const [activeTab, setActiveTab] = useState('jobs');

  // Find active rider details
  const currentRider = deliveryPartners.find((r) => r.id === currentRiderId);

  // Derive job state
  const availableOrders = orders.filter((o) => o.status === 'ready' && !o.deliveryPartnerId);
  const activeOrder = orders.find(
    (o) => o.deliveryPartnerId === currentRiderId && ['ready', 'out_for_delivery'].includes(o.status)
  );

  const completedDeliveries = orders.filter(
    (o) => o.deliveryPartnerId === currentRiderId && o.status === 'delivered'
  );

  // Toggle rider availability status
  const handleToggleStatus = () => {
    // Modify status inside context state (rider online/offline)
    // For simplicity, we can do this using a local state or sync if we add action to AppContext
    // In our context, deliveryPartners is a state, we can toggle it here:
    // Actually let's mock it inside AppContext or handle locally in standard ways
  };

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

                {/* Dispatch Progress Controls */}
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeOrder.status === 'ready' ? (
                    <button
                      onClick={() => updateOrderStatus(activeOrder.id, 'out_for_delivery', currentRiderId)}
                      className="btn btn-orange"
                      style={{ width: '100%' }}
                    >
                      Confirm Order Picked Up
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
    </div>
  );
};
