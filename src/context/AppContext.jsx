import React, { createContext, useState, useEffect } from 'react';
import {
  INITIAL_VENDORS,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_DELIVERY_PARTNERS
} from '../data/initialData';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
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

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('delivery_platform_dark') === 'true';
  });

  // Global Geolocation States
  const [globalCoords, setGlobalCoords] = useState(null);
  const [globalAddress, setGlobalAddress] = useState('Noida Sector 62, UP');
  const [isGpsActive, setIsGpsActive] = useState(false);

  const requestGlobalGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setGlobalCoords({ lat, lng });
          setIsGpsActive(true);
          
          setGlobalAddress(`Locating... (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'Accept-Language': 'en'
                }
              }
            );
            if (response.ok) {
              const data = await response.json();
              if (data && data.display_name) {
                setGlobalAddress(data.display_name);
                showToast('Live location synced automatically from Google Maps / GPS!', 'success');
                return;
              }
            }
          } catch (err) {
            console.error('OSM Nominatim reverse geocoding failed:', err);
          }
          
          // Fallback if reverse lookup fails
          setGlobalAddress(`Live Location: Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`);
          showToast('Live coordinates synced from GPS!', 'success');
        },
        (error) => {
          console.warn('GPS Geolocation permission denied or failed:', error);
        }
      );
    }
  };

  // Run on application load automatically
  useEffect(() => {
    requestGlobalGPS();
  }, []);

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

  // Toast system helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // Vendor Registration & Profile
  const registerVendor = (newVendor) => {
    const vendorId = 'vendor_' + Date.now();
    const vendorData = {
      ...newVendor,
      id: vendorId,
      rating: 5.0,
      reviewsCount: 0,
      isApproved: false, // Needs Admin approval
      logoBg: ['#10b981', '#f97316', '#22c55e', '#ef4444', '#06b6d4'][Math.floor(Math.random() * 5)]
    };
    setVendors((prev) => [...prev, vendorData]);
    showToast('Vendor registration submitted! Awaiting Admin approval.', 'info');
    return vendorData;
  };

  const approveVendor = (vendorId) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, isApproved: true } : v))
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
      totalEarnings: 0
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
      isApproved: true, // Instant approval
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
      totalEarnings: 0
    };
    setDeliveryPartners((prev) => [...prev, rider]);
    showToast('Delivery Rider added instantly!', 'success');
    return rider;
  };

  // Auth Operations
  const login = (role, email, vendorId = 'vendor_1', riderId = 'rider_1') => {
    setActiveRole(role);
    setIsLoggedIn(true);
    
    let name = 'User';
    if (role === 'customer') {
      name = email || 'Jane Doe (Customer)';
    } else if (role === 'vendor') {
      setCurrentVendorId(vendorId);
      const vend = vendors.find(v => v.id === vendorId);
      name = vend ? vend.name : 'Store Partner';
    } else if (role === 'delivery') {
      setCurrentRiderId(riderId);
      const rider = deliveryPartners.find(d => d.id === riderId);
      name = rider ? rider.name : 'Delivery Partner';
    } else if (role === 'admin') {
      name = 'System Administrator';
    }

    showToast(`Welcome back! Logged in successfully as ${name}.`, 'success');
  };

  const logout = () => {
    setIsLoggedIn(false);
    showToast('Logged out successfully.', 'info');
  };

  // Customer Cart Operations
  const addToCart = (product, vendorId) => {
    setCart((prev) => {
      // Check if buying from a different vendor (Zomato/Blinkit limits cart to one store at a time)
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

      // Recalculate Subtotal
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      // Keep applied coupon if minOrder is still met
      let appliedCoupon = prev.appliedCoupon;
      let discount = 0;
      if (appliedCoupon) {
        if (subtotal >= appliedCoupon.minOrder) {
          if (appliedCoupon.discountType === 'percentage') {
            discount = Math.min((subtotal * appliedCoupon.discountValue) / 100, appliedCoupon.maxDiscount);
          } else if (appliedCoupon.discountType === 'flat') {
            discount = appliedCoupon.discountValue;
          } else if (appliedCoupon.discountType === 'free-delivery') {
            discount = 0; // Handled in delivery fee
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

    const orderId = 'order_' + Date.now();
    const vendorId = cart.items[0].vendorId;
    const vendorName = vendors.find((v) => v.id === vendorId)?.name || 'Local Vendor';

    const newOrder = {
      id: orderId,
      vendorId,
      vendorName,
      items: [...cart.items],
      subtotal: cart.subtotal,
      discount: cart.discount,
      deliveryFee: cart.deliveryFee,
      total: cart.total,
      status: 'pending', // pending -> preparing -> ready -> out_for_delivery -> delivered
      createdAt: new Date().toISOString(),
      address,
      paymentMethod,
      deliveryPartnerId: null,
      customerName: 'Jane Doe (Customer)',
      customerPhone: '+91 98765 00000',
      ratings: null,
      reviews: null
    };

    // Deduct stock
    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = cart.items.find((item) => item.id === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      })
    );

    // Save order
    setOrders((prev) => [newOrder, ...prev]);

    // Clear cart
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

        // Adjust finances if completed
        if (status === 'delivered') {
          // Update rider earnings
          setDeliveryPartners((riders) =>
            riders.map((r) => {
              if (r.id === (riderId || order.deliveryPartnerId)) {
                // Base pay $45 + delivery fee
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
    
    // Recalculate vendor overall ratings
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
  };

  const deleteCoupon = (code) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    showToast(`Coupon ${code} removed.`, 'warning');
  };

  return (
    <AppContext.Provider
      value={{
        activeRole,
        setActiveRole,
        isLoggedIn,
        setIsLoggedIn,
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
        requestGlobalGPS
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
