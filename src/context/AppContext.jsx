import React, { createContext, useState, useEffect, useRef } from 'react';
import {
  INITIAL_VENDORS,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_DELIVERY_PARTNERS
} from '../data/initialData';
import { auth, isFirebaseEnabled } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Firebase Auth user state
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Active Role switcher state
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('delivery_platform_role') || 'customer';
  });

  // Global Mock Database States
  const [vendors, setVendors] = useState(() => {
    const saved = localStorage.getItem('delivery_platform_vendors');
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('delivery_platform_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('delivery_platform_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [deliveryPartners, setDeliveryPartners] = useState(() => {
    const saved = localStorage.getItem('delivery_platform_delivery_partners');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERY_PARTNERS;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('delivery_platform_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Current logins for simulation
  const [currentVendorId, setCurrentVendorId] = useState('vendor_1');
  const [currentRiderId, setCurrentRiderId] = useState('rider_1');

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('delivery_platform_logged_in') === 'true';
  });

  // Customer states (Cart & Wishlist)
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('delivery_platform_cart');
    return saved ? JSON.parse(saved) : { items: [], subtotal: 0, discount: 0, deliveryFee: 40, total: 0, appliedCoupon: null };
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('delivery_platform_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Toast notifications state
  const [notifications, setNotifications] = useState([]);

  // Admin notification count for new pending registrations
  const [adminNewRegistrationsCount, setAdminNewRegistrationsCount] = useState(() => {
    const saved = localStorage.getItem('delivery_platform_admin_new_reg');
    return saved ? parseInt(saved) : 0;
  });

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('delivery_platform_dark') === 'true';
  });

  // Admins state
  const [admins, setAdmins] = useState(() => {
    const saved = localStorage.getItem('delivery_platform_admins');
    return saved ? JSON.parse(saved) : [
      { email: 'testadmin24365@gmail.com', name: 'Test Administrator', status: 'active', createdAt: new Date().toISOString() }
    ];
  });

  // Activity Log
  const [activityLog, setActivityLog] = useState(() => {
    const saved = localStorage.getItem('delivery_platform_activity_log');
    return saved ? JSON.parse(saved) : [];
  });

  // Saved customer addresses
  const [savedAddresses, setSavedAddresses] = useState(() => {
    const saved = localStorage.getItem('delivery_platform_saved_addresses');
    return saved ? JSON.parse(saved) : [
      { id: 'addr_1', address: 'Noida Sector 62, UP', tag: 'Home', isDefault: true },
      { id: 'addr_2', address: 'DLF CyberCity, Building 5, Gurugram', tag: 'Office', isDefault: false }
    ];
  });

  // Saved customer payments
  const [savedPayments, setSavedPayments] = useState(() => {
    const saved = localStorage.getItem('delivery_platform_saved_payments');
    return saved ? JSON.parse(saved) : [
      { id: 'pay_1', type: 'upi', detail: 'jane@paytm', provider: 'Paytm' },
      { id: 'pay_2', type: 'card', detail: 'VISA •••• 4242', provider: 'HDFC Bank' }
    ];
  });

  // Platform global settings
  const [platformSettings, setPlatformSettings] = useState(() => {
    const saved = localStorage.getItem('delivery_platform_settings');
    return saved ? JSON.parse(saved) : { commissionRate: 10, baseDeliveryPay: 45, maintenanceMode: false };
  });

  // Customer support tickets
  const [supportTickets, setSupportTickets] = useState(() => {
    const saved = localStorage.getItem('delivery_platform_support_tickets');
    return saved ? JSON.parse(saved) : [
      { id: 'ticket_1', customerEmail: 'customer@desicart.com', subject: 'Refund for missing items in order #101', message: 'I ordered Premium Basmati Rice and mustard oil, but mustard oil was missing from the bag. Please refund ₹195.', status: 'pending', createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), reply: null },
      { id: 'ticket_2', customerEmail: 'customer@desicart.com', subject: 'Rider delayed delivery', message: 'The rider took 40 minutes instead of the estimated 15 minutes. The food was cold.', status: 'resolved', createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), reply: 'Apologies for the delay. We have processed a coupon refund.' }
    ];
  });

  // Global Geolocation States
  const [globalCoords, setGlobalCoords] = useState(() => {
    const saved = localStorage.getItem('delivery_platform_coords');
    return saved ? JSON.parse(saved) : { lat: 28.62, lng: 77.36 };
  });

  const [globalAddress, setGlobalAddress] = useState(() => {
    return localStorage.getItem('delivery_platform_address') || 'Noida Sector 62, UP';
  });

  const [isGpsActive, setIsGpsActive] = useState(false);

  // Haversine distance calculator helper (Earth radius R = 6371 km)
  const getDistanceToStore = (storeCoords) => {
    if (!globalCoords || !storeCoords) return null;
    const lat1 = globalCoords.lat;
    const lon1 = globalCoords.lng;
    const lat2 = storeCoords.lat;
    const lon2 = storeCoords.lng;
    
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // distance in km
  };

  const setGlobalLocation = (address, coords) => {
    setGlobalAddress(address);
    setGlobalCoords(coords);
    localStorage.setItem('delivery_platform_address', address);
    localStorage.setItem('delivery_platform_coords', JSON.stringify(coords));
  };

  const requestGlobalGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setGlobalLocation(`Live Location: (${lat.toFixed(4)}, ${lng.toFixed(4)})`, { lat, lng });
          setIsGpsActive(true);
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            if (response.ok) {
              const data = await response.json();
              if (data && data.display_name) {
                setGlobalLocation(data.display_name, { lat, lng });
                showToast('Live location synced automatically from GPS!', 'success');
                return;
              }
            }
          } catch (err) {
            console.error('OSM Nominatim reverse geocoding failed:', err);
          }
          showToast('Live coordinates synced from GPS!', 'success');
        },
        (error) => {
          console.warn('GPS Geolocation permission denied or failed:', error);
          showToast('GPS access denied. Using default location.', 'warning');
        }
      );
    } else {
      showToast('Geolocation is not supported by your browser.', 'error');
    }
  };

  // Refs to give auth listener stable access to latest vendors/riders without re-registering
  const vendorsRef = useRef(vendors);
  const deliveryPartnersRef = useRef(deliveryPartners);
  useEffect(() => { vendorsRef.current = vendors; }, [vendors]);
  useEffect(() => { deliveryPartnersRef.current = deliveryPartners; }, [deliveryPartners]);

  // Listen to Firebase Auth state — registered only once using refs for stable data access
  useEffect(() => {
    if (isFirebaseEnabled && auth) {
      let isFirstLoad = true;
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setFirebaseUser(user);
          setIsLoggedIn(true);

          const emailLower = user.email ? user.email.toLowerCase() : '';

          // Determine user role based on database records first
          let role = null;
          if (emailLower === 'anandabhishek24365@gmail.com') {
            role = 'superadmin';
          } else if (emailLower.endsWith('24365@gmail.com')) {
            role = 'admin';
          } else {
            // Use refs so this listener never needs to re-register
            const vendor = vendorsRef.current.find(
              v => v.firebaseUid === user.uid || (user.email && v.email?.toLowerCase() === emailLower)
            );
            if (vendor) {
              role = 'vendor';
              if (!vendor.firebaseUid) {
                vendor.firebaseUid = user.uid;
                setVendors([...vendorsRef.current]);
              }
            } else {
              const rider = deliveryPartnersRef.current.find(
                d => d.firebaseUid === user.uid || (user.email && d.email?.toLowerCase() === emailLower)
              );
              if (rider) {
                role = 'delivery';
                if (!rider.firebaseUid) {
                  rider.firebaseUid = user.uid;
                  setDeliveryPartners([...deliveryPartnersRef.current]);
                }
              }
            }
          }

          // If no existing account role resolved, use the persisted role or default to customer
          if (!role) {
            role = localStorage.getItem('delivery_platform_role') || 'customer';
          }

          setActiveRole(role);

          if (isFirstLoad) {
            isFirstLoad = false;
          } else {
            const name = user.displayName || user.email?.split('@')[0] || 'User';
            showToast(`Welcome back! Logged in as ${name}.`, 'success');
          }
        } else {
          setFirebaseUser(null);
          setIsLoggedIn(false);
          isFirstLoad = false;
        }
      });
      return unsubscribe;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // stable — uses refs for vendors/deliveryPartners

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('delivery_platform_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('delivery_platform_logged_in', isLoggedIn.toString());
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('delivery_platform_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('delivery_platform_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('delivery_platform_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('delivery_platform_delivery_partners', JSON.stringify(deliveryPartners));
  }, [deliveryPartners]);

  useEffect(() => {
    localStorage.setItem('delivery_platform_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('delivery_platform_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('delivery_platform_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('delivery_platform_dark', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('delivery_platform_admin_new_reg', adminNewRegistrationsCount.toString());
  }, [adminNewRegistrationsCount]);

  useEffect(() => {
    localStorage.setItem('delivery_platform_admins', JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem('delivery_platform_activity_log', JSON.stringify(activityLog));
  }, [activityLog]);

  useEffect(() => {
    localStorage.setItem('delivery_platform_saved_addresses', JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  useEffect(() => {
    localStorage.setItem('delivery_platform_saved_payments', JSON.stringify(savedPayments));
  }, [savedPayments]);

  useEffect(() => {
    localStorage.setItem('delivery_platform_settings', JSON.stringify(platformSettings));
  }, [platformSettings]);

  useEffect(() => {
    localStorage.setItem('delivery_platform_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  // Toast system helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // ─── REGISTRATION HELPERS ────────────────────────────────────────────────────

  /**
   * Look up an existing vendor or rider by Firebase UID.
   * Returns { type: 'vendor'|'rider', record } or null.
   */
  const getRegistrationByUid = (uid) => {
    if (!uid) return null;
    const vendor = vendors.find(v => v.firebaseUid === uid);
    if (vendor) return { type: 'vendor', record: vendor };
    const rider = deliveryPartners.find(d => d.firebaseUid === uid);
    if (rider) return { type: 'rider', record: rider };
    return null;
  };

  /** Submit a new Store registration (from StoreRegistrationView) */
  const submitVendorRegistration = (formData) => {
    const uid = firebaseUser?.uid;
    if (!uid) { showToast('Authentication error. Please log in again.', 'error'); return false; }

    // Duplicate GST check
    const gstExists = vendors.some(v => v.gstNumber?.toUpperCase() === formData.gstNumber?.toUpperCase());
    if (gstExists) {
      showToast('This GST Number is already registered.', 'error');
      return false;
    }

    // Duplicate Email check
    const emailExists = vendors.some(v => v.email?.toLowerCase() === formData.email?.toLowerCase()) ||
                        deliveryPartners.some(d => d.email?.toLowerCase() === formData.email?.toLowerCase()) ||
                        admins.some(a => a.email?.toLowerCase() === formData.email?.toLowerCase());
    if (emailExists) {
      showToast('This Email Address is already registered to an account.', 'error');
      return false;
    }

    const newVendor = {
      id: 'vendor_' + Date.now(),
      name: formData.storeName,
      ownerName: formData.ownerName,
      gstNumber: formData.gstNumber.toUpperCase(),
      mobile: formData.mobile,
      email: formData.email,
      category: formData.category || 'grocery',
      address: formData.address,
      coords: formData.coords || { lat: 28.62, lng: 77.36 },
      minOrder: parseInt(formData.minOrder) || 99,
      rating: 5.0,
      reviewsCount: 0,
      deliveryTime: '20-30 mins',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
      logoBg: ['#10b981', '#f97316', '#22c55e', '#ef4444', '#06b6d4'][Math.floor(Math.random() * 5)],
      isApproved: false,
      registrationStatus: 'pending',
      firebaseUid: uid,
      registeredAt: new Date().toISOString(),
      rejectionReason: null,
      featured: false,
      bannerOffer: null,
    };

    setVendors(prev => [...prev, newVendor]);
    setCurrentVendorId(newVendor.id);
    setAdminNewRegistrationsCount(c => c + 1);
    showToast('Store registration submitted! Awaiting Admin approval.', 'info');
    return true;
  };

  /** Submit a new Rider registration (from RiderRegistrationView) */
  const submitRiderRegistration = (formData) => {
    const uid = firebaseUser?.uid;
    if (!uid) { showToast('Authentication error. Please log in again.', 'error'); return false; }

    // Duplicate vehicle number check
    const vehicleExists = deliveryPartners.some(
      d => d.vehicleNumber?.toUpperCase() === formData.vehicleNumber?.toUpperCase()
    );
    if (vehicleExists) {
      showToast('This Vehicle Number is already registered.', 'error');
      return false;
    }

    // Duplicate Email check
    const emailExists = vendors.some(v => v.email?.toLowerCase() === formData.email?.toLowerCase()) ||
                        deliveryPartners.some(d => d.email?.toLowerCase() === formData.email?.toLowerCase()) ||
                        admins.some(a => a.email?.toLowerCase() === formData.email?.toLowerCase());
    if (emailExists) {
      showToast('This Email Address is already registered to an account.', 'error');
      return false;
    }

    const newRider = {
      id: 'rider_' + Date.now(),
      name: formData.riderName,
      phone: formData.mobile,
      email: formData.email,
      vehicleNumber: formData.vehicleNumber.toUpperCase(),
      vehicleType: formData.vehicleType,
      licenseNumber: formData.licenseNumber || null,
      status: 'offline',
      currentOrderId: null,
      totalEarnings: 0,
      registrationStatus: 'pending',
      firebaseUid: uid,
      registeredAt: new Date().toISOString(),
      rejectionReason: null,
    };

    setDeliveryPartners(prev => [...prev, newRider]);
    setCurrentRiderId(newRider.id);
    setAdminNewRegistrationsCount(c => c + 1);
    showToast('Rider registration submitted! Awaiting Admin approval.', 'info');
    return true;
  };

  /** Admin: approve a vendor or rider registration */
  const adminApproveRegistration = (type, id) => {
    if (type === 'vendor') {
      setVendors(prev => prev.map(v =>
        v.id === id ? { ...v, registrationStatus: 'approved', isApproved: true, rejectionReason: null } : v
      ));
      showToast('Store account approved successfully!', 'success');
      logActivity('Approve Registration', `Approved Store registration for ID: ${id}`);
    } else {
      setDeliveryPartners(prev => prev.map(d =>
        d.id === id ? { ...d, registrationStatus: 'approved', status: 'online', rejectionReason: null } : d
      ));
      showToast('Rider account approved successfully!', 'success');
      logActivity('Approve Registration', `Approved Rider registration for ID: ${id}`);
    }
    setAdminNewRegistrationsCount(c => Math.max(0, c - 1));
  };

  /** Admin: reject a vendor or rider registration with a reason */
  const adminRejectRegistration = (type, id, reason) => {
    if (type === 'vendor') {
      setVendors(prev => prev.map(v =>
        v.id === id ? { ...v, registrationStatus: 'rejected', isApproved: false, rejectionReason: reason || 'Application did not meet requirements.' } : v
      ));
      logActivity('Reject Registration', `Rejected Store registration for ID: ${id}. Reason: ${reason}`);
    } else {
      setDeliveryPartners(prev => prev.map(d =>
        d.id === id ? { ...d, registrationStatus: 'rejected', rejectionReason: reason || 'Application did not meet requirements.' } : d
      ));
      logActivity('Reject Registration', `Rejected Rider registration for ID: ${id}. Reason: ${reason}`);
    }
    setAdminNewRegistrationsCount(c => Math.max(0, c - 1));
    showToast('Registration rejected.', 'warning');
  };

  /** Admin: suspend an approved vendor or rider */
  const adminSuspendAccount = (type, id) => {
    if (type === 'vendor') {
      setVendors(prev => prev.map(v =>
        v.id === id ? { ...v, registrationStatus: 'suspended', isApproved: false } : v
      ));
      logActivity('Suspend Account', `Suspended Store account for ID: ${id}`);
    } else {
      setDeliveryPartners(prev => prev.map(d =>
        d.id === id ? { ...d, registrationStatus: 'suspended', status: 'offline' } : d
      ));
      logActivity('Suspend Account', `Suspended Rider account for ID: ${id}`);
    }
    showToast('Account suspended.', 'warning');
  };

  /** Admin: reactivate a suspended vendor or rider */
  const adminReactivateAccount = (type, id) => {
    if (type === 'vendor') {
      setVendors(prev => prev.map(v =>
        v.id === id ? { ...v, registrationStatus: 'approved', isApproved: true } : v
      ));
      logActivity('Reactivate Account', `Reactivated Store account for ID: ${id}`);
    } else {
      setDeliveryPartners(prev => prev.map(d =>
        d.id === id ? { ...d, registrationStatus: 'approved', status: 'online' } : d
      ));
      logActivity('Reactivate Account', `Reactivated Rider account for ID: ${id}`);
    }
    showToast('Account reactivated successfully!', 'success');
  };

  /**
   * User-side: clear a rejected registration so they can resubmit.
   * Removes the old rejected entry — the registration form will show again.
   */
  const clearRejectedRegistration = (type, id) => {
    if (type === 'vendor') {
      setVendors(prev => prev.filter(v => v.id !== id));
    } else {
      setDeliveryPartners(prev => prev.filter(d => d.id !== id));
    }
  };

  /** Clear admin new-registration notification badge */
  const clearAdminNotifications = () => {
    setAdminNewRegistrationsCount(0);
  };

  // ─── VENDOR MANAGEMENT (Admin direct-add / legacy) ───────────────────────────

  const registerVendor = (newVendor) => {
    const vendorId = 'vendor_' + Date.now();
    const vendorData = {
      ...newVendor,
      id: vendorId,
      rating: 5.0,
      reviewsCount: 0,
      isApproved: false,
      registrationStatus: 'pending',
      firebaseUid: null,
      registeredAt: new Date().toISOString(),
      rejectionReason: null,
      logoBg: ['#10b981', '#f97316', '#22c55e', '#ef4444', '#06b6d4'][Math.floor(Math.random() * 5)]
    };
    setVendors((prev) => [...prev, vendorData]);
    showToast('Vendor registration submitted! Awaiting Admin approval.', 'info');
    return vendorData;
  };

  const approveVendor = (vendorId) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, isApproved: true, registrationStatus: 'approved' } : v))
    );
    showToast('Vendor approved successfully!', 'success');
  };

  const rejectVendor = (vendorId) => {
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    showToast('Vendor application rejected/removed.', 'warning');
  };

  // Product Management (Vendor Side)
  const addProduct = (vendorId, productData) => {
    const newProduct = {
      ...productData,
      id: 'prod_' + Date.now(),
      vendorId,
      rating: 5.0,
      price: parseFloat(productData.price)
    };
    setProducts((prev) => [...prev, newProduct]);
    showToast('Product added successfully!', 'success');
  };

  const editProduct = (productId, updatedData) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updatedData, price: parseFloat(updatedData.price) } : p))
    );
    showToast('Product updated successfully!', 'success');
  };

  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('Product removed from catalog.', 'warning');
  };

  // Delivery Partner Management
  const registerDeliveryPartner = (newPartner) => {
    const id = 'rider_' + Date.now();
    const rider = {
      ...newPartner,
      id,
      status: 'online',
      currentOrderId: null,
      totalEarnings: 0,
      registrationStatus: 'pending',
      firebaseUid: null,
      registeredAt: new Date().toISOString(),
      rejectionReason: null,
    };
    setDeliveryPartners((prev) => [...prev, rider]);
    showToast('Delivery Partner registered successfully!', 'success');
    setCurrentRiderId(id);
  };

  const adminAddVendor = (newVendor) => {
    const vendorId = 'vendor_' + Date.now();
    const vendorData = {
      ...newVendor,
      id: vendorId,
      rating: 5.0,
      reviewsCount: 0,
      isApproved: true,
      registrationStatus: 'approved',
      firebaseUid: null,
      registeredAt: new Date().toISOString(),
      rejectionReason: null,
      logoBg: ['#10b981', '#f97316', '#22c55e', '#ef4444', '#06b6d4'][Math.floor(Math.random() * 5)]
    };
    setVendors((prev) => [...prev, vendorData]);
    showToast('Vendor added & approved instantly!', 'success');
    return vendorData;
  };

  const adminAddRider = (newRider) => {
    const id = 'rider_' + Date.now();
    const rider = {
      ...newRider,
      id,
      status: 'online',
      currentOrderId: null,
      totalEarnings: 0,
      registrationStatus: 'approved',
      firebaseUid: null,
      registeredAt: new Date().toISOString(),
      rejectionReason: null,
    };
    setDeliveryPartners((prev) => [...prev, rider]);
    showToast('Delivery Rider added instantly!', 'success');
    return rider;
  };

  // Auth Operations
  const login = (role, identifier) => {
    setActiveRole(role);
    setIsLoggedIn(true);

    let name = 'User';
    if (role === 'customer') {
      name = identifier || 'Jane Doe (Customer)';
    } else if (role === 'vendor') {
      name = identifier || 'Store Partner';
    } else if (role === 'delivery') {
      name = identifier || 'Delivery Partner';
    } else if (role === 'admin') {
      name = identifier || 'System Administrator';
    } else if (role === 'superadmin') {
      name = identifier || 'Super Admin';
    }

    showToast(`Welcome back! Logged in as ${name}.`, 'success');
  };

  const logout = async () => {
    if (isFirebaseEnabled && auth) {
      try {
        await auth.signOut();
      } catch (err) {
        console.error('Firebase SignOut error:', err);
      }
    }
    setIsLoggedIn(false);
    setFirebaseUser(null);
    showToast('Logged out successfully.', 'info');
  };

  // Customer Cart Operations
  const addToCart = (product, vendorId) => {
    setCart((prev) => {
      const isDifferentVendor = prev.items.length > 0 && prev.items[0].vendorId !== vendorId;
      let items = isDifferentVendor ? [] : [...prev.items];
      
      if (isDifferentVendor) {
        showToast('Cart cleared! Added item from new store.', 'info');
      }

      const existingIndex = items.findIndex((i) => i.id === product.id);
      if (existingIndex >= 0) {
        items[existingIndex].quantity += 1;
      } else {
        items.push({ ...product, quantity: 1 });
      }

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      let appliedCoupon = prev.appliedCoupon;
      let discount = 0;
      if (appliedCoupon) {
        if (subtotal >= appliedCoupon.minOrder) {
          if (appliedCoupon.discountType === 'percentage') {
            discount = Math.min((subtotal * appliedCoupon.discountValue) / 100, appliedCoupon.maxDiscount);
          } else if (appliedCoupon.discountType === 'flat') {
            discount = appliedCoupon.discountValue;
          } else if (appliedCoupon.discountType === 'free-delivery') {
            discount = 0;
          }
        } else {
          appliedCoupon = null;
          showToast('Coupon removed! Order subtotal fell below requirement.', 'warning');
        }
      }

      const deliveryFee = (appliedCoupon && appliedCoupon.discountType === 'free-delivery') ? 0 : 40;
      const total = Math.max(0, subtotal - discount + deliveryFee);

      return { items, subtotal, discount, deliveryFee, total, appliedCoupon };
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      let items = prev.items.map((i) =>
        i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
      ).filter((i) => i.quantity > 0);

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      let appliedCoupon = prev.appliedCoupon;
      let discount = 0;
      if (appliedCoupon) {
        if (subtotal >= appliedCoupon.minOrder) {
          if (appliedCoupon.discountType === 'percentage') {
            discount = Math.min((subtotal * appliedCoupon.discountValue) / 100, appliedCoupon.maxDiscount);
          } else if (appliedCoupon.discountType === 'flat') {
            discount = appliedCoupon.discountValue;
          }
        } else {
          appliedCoupon = null;
          showToast('Coupon removed! Subtotal fell below requirement.', 'warning');
        }
      }

      const deliveryFee = (appliedCoupon && appliedCoupon.discountType === 'free-delivery') ? 0 : 40;
      const total = Math.max(0, subtotal - discount + deliveryFee);

      return { items, subtotal, discount, deliveryFee, total, appliedCoupon };
    });
  };

  const applyCoupon = (code) => {
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) {
      showToast('Invalid Coupon Code!', 'error');
      return false;
    }

    if (cart.subtotal < coupon.minOrder) {
      showToast(`Minimum order value of ₹${coupon.minOrder} required for this coupon!`, 'error');
      return false;
    }

    setCart((prev) => {
      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = Math.min((prev.subtotal * coupon.discountValue) / 100, coupon.maxDiscount);
      } else if (coupon.discountType === 'flat') {
        discount = coupon.discountValue;
      }
      
      const deliveryFee = coupon.discountType === 'free-delivery' ? 0 : prev.deliveryFee;
      const total = Math.max(0, prev.subtotal - discount + deliveryFee);

      showToast(`Coupon ${coupon.code} applied successfully!`, 'success');
      return { ...prev, appliedCoupon: coupon, discount, deliveryFee, total };
    });
    return true;
  };

  const removeCoupon = () => {
    setCart((prev) => {
      const deliveryFee = 40;
      const total = prev.subtotal + deliveryFee;
      showToast('Coupon removed.', 'info');
      return { ...prev, appliedCoupon: null, discount: 0, deliveryFee, total };
    });
  };

  // Toggle wishlist
  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist.', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Added to wishlist!', 'success');
        return [...prev, productId];
      }
    });
  };

  // Checkout Execution
  const checkout = (address, paymentMethod) => {
    if (cart.items.length === 0) {
      showToast('Cart is empty!', 'error');
      return null;
    }

    const vendorId = cart.items[0].vendorId;
    const vendor = vendors.find((v) => v.id === vendorId);
    const vendorName = vendor?.name || 'Local Vendor';

    // Verify store is within 15 km service radius before creating order
    if (vendor && vendor.coords) {
      const dist = getDistanceToStore(vendor.coords);
      if (dist === null || dist > 15) {
        showToast(`Checkout failed: ${vendorName} is outside our 15 km delivery area (${dist ? dist.toFixed(1) : 'unknown'} km away).`, 'error');
        return null;
      }
    }

    const orderId = 'order_' + Date.now();

    const newOrder = {
      id: orderId,
      vendorId,
      vendorName,
      items: [...cart.items],
      subtotal: cart.subtotal,
      discount: cart.discount,
      deliveryFee: cart.deliveryFee,
      total: cart.total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      address,
      paymentMethod,
      deliveryPartnerId: null,
      customerName: firebaseUser?.displayName || 'Customer',
      customerPhone: '+91 98765 00000',
      ratings: null,
      reviews: null
    };

    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = cart.items.find((item) => item.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    setCart({ items: [], subtotal: 0, discount: 0, deliveryFee: 40, total: 0, appliedCoupon: null });
    showToast('Order placed successfully! Tracking live state.', 'success');
    
    return orderId;
  };

  // Update order status (Vendor & Rider Actions)
  const updateOrderStatus = (orderId, status, riderId = null) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== orderId) return order;

        const updatedOrder = { ...order, status };
        if (riderId) {
          updatedOrder.deliveryPartnerId = riderId;
        }

        if (status === 'delivered') {
          setDeliveryPartners((riders) =>
            riders.map((r) => {
              if (r.id === (riderId || order.deliveryPartnerId)) {
                return { ...r, totalEarnings: r.totalEarnings + 45 + order.deliveryFee, currentOrderId: null };
              }
              return r;
            })
          );
        }

        return updatedOrder;
      })
    );

    let statusText = status.replace('_', ' ');
    statusText = statusText.charAt(0).toUpperCase() + statusText.slice(1);
    showToast(`Order status updated to: ${statusText}`, 'info');
  };

  // Delivery accept job
  const acceptDeliveryJob = (orderId, riderId) => {
    setDeliveryPartners((prev) =>
      prev.map((r) => (r.id === riderId ? { ...r, currentOrderId: orderId } : r))
    );
    updateOrderStatus(orderId, 'out_for_delivery', riderId);
    showToast('Delivery job accepted! Navigate to pickup.', 'success');
  };

  // Submit order review
  const submitOrderReview = (orderId, rating, comment) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, ratings: rating, reviews: comment } : order
      )
    );
    
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setVendors((prevVendors) =>
        prevVendors.map((v) => {
          if (v.id === order.vendorId) {
            const count = v.reviewsCount + 1;
            const newRating = parseFloat(((v.rating * v.reviewsCount + rating) / count).toFixed(1));
            return { ...v, rating: newRating, reviewsCount: count };
          }
          return v;
        })
      );
    }

    showToast('Thank you for your rating!', 'success');
  };

  // Coupon manager (Admin side)
  const addCoupon = (couponData) => {
    setCoupons((prev) => [...prev, couponData]);
    showToast(`Coupon ${couponData.code} added.`, 'success');
    logActivity('Add Coupon', `Created coupon: ${couponData.code} (${couponData.description})`);
  };

  const deleteCoupon = (code) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    showToast(`Coupon ${code} removed.`, 'warning');
    logActivity('Delete Coupon', `Deleted coupon: ${code}`);
  };

  // Activity Log
  const logActivity = (action, details) => {
    const newLog = {
      id: 'log_' + Date.now() + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      email: firebaseUser?.email || 'unknown@desicart.com',
      role: activeRole,
      action,
      details
    };
    setActivityLog((prev) => [newLog, ...prev]);
  };

  // Super Admin functions
  const createAdminAccount = (email, name) => {
    if (!email.toLowerCase().endsWith('24365@gmail.com')) {
      showToast('Admin email must end with 24365@gmail.com', 'error');
      return false;
    }
    if (admins.some(a => a.email.toLowerCase() === email.toLowerCase())) {
      showToast('Admin account already exists!', 'error');
      return false;
    }
    const newAdmin = {
      email: email.toLowerCase(),
      name,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    setAdmins(prev => [...prev, newAdmin]);
    logActivity('Create Admin', `Created Admin account for ${email} (${name})`);
    showToast(`Admin ${email} created successfully!`, 'success');
    return true;
  };

  const toggleAdminStatus = (email) => {
    setAdmins(prev => prev.map(a => {
      if (a.email.toLowerCase() === email.toLowerCase()) {
        const newStatus = a.status === 'active' ? 'inactive' : 'active';
        logActivity('Toggle Admin Status', `Changed Admin status for ${email} to ${newStatus}`);
        showToast(`Admin status changed to ${newStatus}`, 'info');
        return { ...a, status: newStatus };
      }
      return a;
    }));
  };

  const deleteAdminAccount = (email) => {
    setAdmins(prev => prev.filter(a => a.email.toLowerCase() !== email.toLowerCase()));
    logActivity('Remove Admin', `Deleted Admin account for ${email}`);
    showToast(`Admin ${email} removed.`, 'warning');
  };

  const updatePlatformSettings = (settings) => {
    setPlatformSettings(settings);
    logActivity('Update Platform Settings', `Settings updated: Commission ${settings.commissionRate}%, Base Pay ₹${settings.baseDeliveryPay}, Maint. Mode: ${settings.maintenanceMode}`);
    showToast('Platform settings updated successfully!', 'success');
  };

  const resolveSupportTicket = (ticketId, reply) => {
    setSupportTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        logActivity('Resolve Ticket', `Resolved support ticket ${ticketId} with reply: ${reply}`);
        showToast('Support ticket resolved!', 'success');
        return { ...t, status: 'resolved', reply };
      }
      return t;
    }));
  };

  const submitComplaint = (subject, message) => {
    const newTicket = {
      id: 'ticket_' + Date.now(),
      customerEmail: firebaseUser?.email || 'customer@desicart.com',
      subject,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      reply: null
    };
    setSupportTickets(prev => [newTicket, ...prev]);
    showToast('Support ticket submitted successfully!', 'success');
  };

  // Customer Profile functions
  const updateCustomerProfile = (name) => {
    if (isFirebaseEnabled && auth.currentUser) {
      updateProfile(auth.currentUser, { displayName: name })
        .then(() => {
          setFirebaseUser({ ...auth.currentUser });
          showToast('Profile updated successfully!', 'success');
        })
        .catch(err => {
          showToast('Failed to update profile: ' + err.message, 'error');
        });
    } else {
      showToast('Profile updated!', 'success');
    }
  };

  const addCustomerAddress = (address, tag) => {
    const newAddr = {
      id: 'addr_' + Date.now(),
      address,
      tag: tag || 'Home',
      isDefault: savedAddresses.length === 0
    };
    setSavedAddresses(prev => [...prev, newAddr]);
    showToast('Address added successfully!', 'success');
  };

  const deleteCustomerAddress = (id) => {
    setSavedAddresses(prev => {
      const filtered = prev.filter(a => a.id !== id);
      if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
    showToast('Address removed.', 'warning');
  };

  const setDefaultAddress = (id) => {
    setSavedAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
    const addr = savedAddresses.find(a => a.id === id);
    if (addr) setGlobalAddress(addr.address);
    showToast('Default address updated!', 'success');
  };

  const addCustomerPayment = (type, detail, provider) => {
    const newPay = {
      id: 'pay_' + Date.now(),
      type,
      detail,
      provider
    };
    setSavedPayments(prev => [...prev, newPay]);
    showToast('Payment method saved!', 'success');
  };

  const deleteCustomerPayment = (id) => {
    setSavedPayments(prev => prev.filter(p => p.id !== id));
    showToast('Payment method removed.', 'warning');
  };

  // Store profile update for Vendor
  const updateVendorProfile = (vendorId, updateData) => {
    setVendors(prev => prev.map(v => {
      if (v.id === vendorId) {
        showToast('Store profile updated successfully!', 'success');
        return { ...v, ...updateData };
      }
      return v;
    }));
  };

  // Rider Profile updates
  const updateRiderProfile = (riderId, updateData) => {
    setDeliveryPartners(prev => prev.map(d => {
      if (d.id === riderId) {
        showToast('Rider profile updated!', 'success');
        return { ...d, ...updateData };
      }
      return d;
    }));
  };

  const toggleRiderStatus = (riderId) => {
    setDeliveryPartners(prev => prev.map(d => {
      if (d.id === riderId) {
        const newStatus = d.status === 'online' ? 'offline' : 'online';
        showToast(`You are now ${newStatus}!`, 'info');
        return { ...d, status: newStatus };
      }
      return d;
    }));
  };

  return (
    <AppContext.Provider
      value={{
        activeRole,
        setActiveRole,
        isLoggedIn,
        setIsLoggedIn,
        firebaseUser,
        isFirebaseEnabled,
        login,
        logout,
        vendors,
        products,
        coupons,
        deliveryPartners,
        orders,
        currentVendorId,
        setCurrentVendorId,
        currentRiderId,
        setCurrentRiderId,
        cart,
        wishlist,
        notifications,
        darkMode,
        setDarkMode,
        showToast,
        // Registration flow
        getRegistrationByUid,
        submitVendorRegistration,
        submitRiderRegistration,
        adminApproveRegistration,
        adminRejectRegistration,
        adminSuspendAccount,
        adminReactivateAccount,
        clearRejectedRegistration,
        adminNewRegistrationsCount,
        clearAdminNotifications,
        // Legacy/admin direct-add
        registerVendor,
        approveVendor,
        rejectVendor,
        addProduct,
        editProduct,
        deleteProduct,
        registerDeliveryPartner,
        addToCart,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        toggleWishlist,
        checkout,
        updateOrderStatus,
        acceptDeliveryJob,
        submitOrderReview,
        addCoupon,
        deleteCoupon,
        adminAddVendor,
        adminAddRider,
        globalCoords,
        globalAddress,
        isGpsActive,
        requestGlobalGPS,
        getDistanceToStore,
        setGlobalLocation,
        // New features
        admins,
        activityLog,
        savedAddresses,
        savedPayments,
        platformSettings,
        supportTickets,
        logActivity,
        createAdminAccount,
        toggleAdminStatus,
        deleteAdminAccount,
        updatePlatformSettings,
        resolveSupportTicket,
        submitComplaint,
        updateCustomerProfile,
        addCustomerAddress,
        deleteCustomerAddress,
        setDefaultAddress,
        addCustomerPayment,
        deleteCustomerPayment,
        updateVendorProfile,
        updateRiderProfile,
        toggleRiderStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
