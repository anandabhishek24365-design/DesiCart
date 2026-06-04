import { rtdb, ref, rtdbSet, rtdbOnValue, rtdbOff, rtdbUpdate } from '../firebase';

export const trackingService = {
  // Update the live tracking data for an order (location, ETA, distance, etc.)
  updateTracking: (orderId, data) => {
    const trackingRef = ref(rtdb, `tracking/${orderId}`);
    return rtdbUpdate(trackingRef, {
      ...data,
      timestamp: Date.now()
    });
  },

  // Listen to live tracking updates for an order
  listenToTracking: (orderId, onUpdate) => {
    const trackingRef = ref(rtdb, `tracking/${orderId}`);
    rtdbOnValue(trackingRef, (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.val());
      } else {
        onUpdate(null);
      }
    });
    return () => rtdbOff(trackingRef);
  },

  // Delete/cleanup tracking data when order is completed
  clearTracking: (orderId) => {
    const trackingRef = ref(rtdb, `tracking/${orderId}`);
    return rtdbSet(trackingRef, null);
  }
};
