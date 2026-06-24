import { io } from 'socket.io-client';

// Establish a single shared socket connection
const socket = io();

export const trackingService = {
  // Update the live tracking data for an order (location, ETA, distance, etc.)
  updateTracking: (orderId, data) => {
    socket.emit('rider_location_update', {
      orderId,
      lat: data.location?.lat,
      lng: data.location?.lng,
      timestamp: Date.now()
    });
    return Promise.resolve();
  },

  // Listen to live tracking updates for an order
  listenToTracking: (orderId, onUpdate) => {
    const handleLocationUpdate = (data) => {
      onUpdate({
        location: { lat: data.lat, lng: data.lng },
        timestamp: data.timestamp
      });
    };
    
    socket.on(`rider_location_${orderId}`, handleLocationUpdate);
    
    return () => {
      socket.off(`rider_location_${orderId}`, handleLocationUpdate);
    };
  },

  // Delete/cleanup tracking data when order is completed
  clearTracking: (orderId) => {
    return Promise.resolve();
  }
};
