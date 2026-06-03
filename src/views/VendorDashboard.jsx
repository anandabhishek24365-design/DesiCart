import React, { useContext, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { AddressSelector } from '../components/AddressSelector';
import {
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Star,
  Users,
  Store,
  DollarSign,
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Sparkles,
  LogOut,
  MapPin
} from 'lucide-react';

const CATEGORY_TEMPLATES = {
  grocery: [
    { name: 'Flour / Atta Bag', url: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=400&auto=format&fit=crop&q=60' },
    { name: 'Fresh Milk', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=60' },
    { name: 'Basmati Rice', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=60' },
    { name: 'Pure Sugar Pack', url: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=400&auto=format&fit=crop&q=60' },
    { name: 'Cooking Mustard Oil', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=60' },
    { name: 'Masoor Lentils / Dal', url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=60' }
  ],
  food: [
    { name: 'Spicy Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=60' },
    { name: 'Veg Cheese Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=60' },
    { name: 'Shahi Chicken Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=60' },
    { name: 'Crispy Punjabi Samosas', url: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=400&auto=format&fit=crop&q=60' },
    { name: 'Garlic Butter Naan', url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&auto=format&fit=crop&q=60' },
    { name: 'Paneer Butter Masala', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=60' }
  ],
  'fruits-veg': [
    { name: 'Fresh Red Apples', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=60' },
    { name: 'Organic Spinach (Palak)', url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop&q=60' },
    { name: 'Yellow Bananas', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=60' },
    { name: 'Salad Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=60' },
    { name: 'Fresh Onions (Alloo)', url: 'https://images.unsplash.com/photo-1508747703725-719ae2c73ee8?w=400&auto=format&fit=crop&q=60' },
    { name: 'New Potatoes', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop&q=60' }
  ],
  medicine: [
    { name: 'Paracetamol Tablets', url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&auto=format&fit=crop&q=60' },
    { name: 'Bandages & Tape Pack', url: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&auto=format&fit=crop&q=60' },
    { name: 'Vitamin C Capsules', url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop&q=60' },
    { name: 'Cough Formula Syrup', url: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&auto=format&fit=crop&q=60' },
    { name: 'Antiseptic Solution', url: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=400&auto=format&fit=crop&q=60' }
  ],
  essentials: [
    { name: 'Liquid Handwash Refill', url: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&auto=format&fit=crop&q=60' },
    { name: 'Fragrant Toilet Soap', url: 'https://images.unsplash.com/photo-1607006342411-92fc0a41a89e?w=400&auto=format&fit=crop&q=60' },
    { name: 'Concentrated Detergent', url: 'https://images.unsplash.com/photo-1610557892470-76d747e29499?w=400&auto=format&fit=crop&q=60' },
    { name: 'Bathroom Tissues Roll', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=60' },
    { name: 'AA Power Batteries', url: 'https://images.unsplash.com/photo-1585366119957-e57b84bbfa3c?w=400&auto=format&fit=crop&q=60' }
  ]
};

const STORE_BANNER_TEMPLATES = {
  grocery: [
    { name: 'Indian Grocery Market', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80' },
    { name: 'Supermarket Shelves', url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80' },
    { name: 'Indian Spices & Pulses', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80' }
  ],
  food: [
    { name: 'Delicious Biryani Feast', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80' },
    { name: 'Pizzas & Burgers', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80' },
    { name: 'Traditional Tandoori', url: 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=800&auto=format&fit=crop&q=80' }
  ],
  'fruits-veg': [
    { name: 'Fresh Greens & Fruits', url: 'https://images.unsplash.com/photo-1610832958506-ee5633619144?w=800&auto=format&fit=crop&q=80' },
    { name: 'Organic Produce Stall', url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=800&auto=format&fit=crop&q=80' },
    { name: 'Farmer\'s Market', url: 'https://images.unsplash.com/photo-1488459718432-36c55e9b602d?w=800&auto=format&fit=crop&q=80' }
  ],
  medicine: [
    { name: 'Modern Apothecary', url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80' },
    { name: 'Medical Wellness Supplies', url: 'https://images.unsplash.com/photo-1607619056574-7b8f304f3c6f?w=800&auto=format&fit=crop&q=80' }
  ],
  essentials: [
    { name: 'Essentials Cabinet', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80' },
    { name: 'Home Organization Store', url: 'https://images.unsplash.com/photo-1610557892470-76d747e29499?w=800&auto=format&fit=crop&q=80' }
  ]
};

export const VendorDashboard = () => {
  const {
    vendors,
    products,
    orders,
    currentVendorId,
    addProduct,
    editProduct,
    deleteProduct,
    updateOrderStatus,
    showToast,
    logout,
    updateVendorProfile
  } = useContext(AppContext);

  // Active sub-tab state
  // 'orders' | 'catalog' | 'analytics' | 'reviews'
  const [activeTab, setActiveTab] = useState('orders');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('grocery');
  const [formImage, setFormImage] = useState('');
  const [formStock, setFormStock] = useState(10);
  const [formTag, setFormTag] = useState('');

  // Image Helper states & refs for uploader & template galleries
  const [imageTab, setImageTab] = useState('gallery'); // 'gallery' | 'upload' | 'url'
  const [editImageTab, setEditImageTab] = useState('gallery'); // 'gallery' | 'upload' | 'url'
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [showAllEditTemplates, setShowAllEditTemplates] = useState(false);
  
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  // Find active vendor details
  const currentVendor = vendors.find((v) => v.id === currentVendorId);

  // Filter vendor's items & orders
  const vendorProducts = products.filter((p) => p.vendorId === currentVendorId);
  const vendorOrders = orders.filter((o) => o.vendorId === currentVendorId);

  // Derived stats
  const pendingOrders = vendorOrders.filter((o) => o.status === 'pending');
  const activeOrders = vendorOrders.filter((o) => ['preparing', 'ready', 'out_for_delivery'].includes(o.status));
  const completedOrders = vendorOrders.filter((o) => o.status === 'delivered');

  const grossEarnings = completedOrders.reduce((sum, o) => sum + o.subtotal - o.discount, 0);
  const adminCommissionRate = 0.1; // 10% commission
  const platformFee = grossEarnings * adminCommissionRate;
  const netEarnings = grossEarnings - platformFee;

  const lowStockCount = vendorProducts.filter((p) => p.stock <= 5).length;

  // Handle open Add Modal
  const openAddModal = () => {
    setFormName('');
    setFormPrice('');
    setFormDescription('');
    setFormCategory(currentVendor?.category || 'grocery');
    setFormImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=60');
    setFormStock(20);
    setFormTag('');
    setShowAddModal(true);
  };

  // Handle open Edit Modal
  const openEditModal = (prod) => {
    setEditingProductId(prod.id);
    setFormName(prod.name);
    setFormPrice(prod.price);
    setFormDescription(prod.description);
    setFormCategory(prod.category);
    setFormImage(prod.image);
    setFormStock(prod.stock);
    setFormTag(prod.tags?.[0] || '');
    setShowEditModal(true);
  };

  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formPrice) return;
    addProduct(currentVendorId, {
      name: formName,
      price: parseFloat(formPrice),
      description: formDescription,
      category: formCategory,
      image: formImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=60',
      stock: parseInt(formStock) || 0,
      tags: formTag ? [formTag] : []
    });
    setShowAddModal(false);
  };

  const handleEditProductSubmit = (e) => {
    e.preventDefault();
    if (!formName || !formPrice) return;
    editProduct(editingProductId, {
      name: formName,
      price: parseFloat(formPrice),
      description: formDescription,
      category: formCategory,
      image: formImage,
      stock: parseInt(formStock) || 0,
      tags: formTag ? [formTag] : []
    });
    setShowEditModal(false);
  };

  return (
    <div style={{ paddingBottom: '5rem' }} className="animate-fade-in">
      {/* Header Panel */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{currentVendor?.name || 'Store Panel'}</h2>
              {!currentVendor?.isApproved && (
                <span className="badge badge-cancelled" style={{ fontSize: '0.65rem' }}>
                  Awaiting Admin Approval
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>
              Store Category: <span style={{ textTransform: 'capitalize' }}>{currentVendor?.category}</span> • ID: {currentVendorId}
            </p>
          </div>
        </div>

        {/* Dashboard sub tabs selector */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          <button
            onClick={() => setActiveTab('orders')}
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Orders Feed ({pendingOrders.length + activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`btn btn-sm ${activeTab === 'catalog' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Catalog Inventory
          </button>
          <button
            onClick={() => {
              setFormName('');
              setFormPrice('');
              setFormDescription('');
              setFormCategory(currentVendor?.category || 'grocery');
              setFormImage('');
              setFormStock(20);
              setFormTag('');
              setActiveTab('add-item');
            }}
            className={`btn btn-sm ${activeTab === 'add-item' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}
          >
            <Plus size={14} /> Add Items
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`btn btn-sm ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Sales Analytics
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`btn btn-sm ${activeTab === 'reviews' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Reviews ({currentVendor?.reviewsCount || 0})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`btn btn-sm ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Store Profile
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

      {/* Grid Stats cards */}
      <div className="grid-responsive" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ padding: '0.6rem', backgroundColor: 'var(--primary-green-light)', borderRadius: 'var(--radius-lg)', color: 'var(--primary-green)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>Net Earnings (Post fee)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{netEarnings.toFixed(2)}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ padding: '0.6rem', backgroundColor: 'var(--accent-orange-light)', borderRadius: 'var(--radius-lg)', color: 'var(--accent-orange)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>Total Sales (Gross)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{grossEarnings.toFixed(2)}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ padding: '0.6rem', backgroundColor: '#dbeafe', borderRadius: 'var(--radius-lg)', color: '#2563eb' }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>Orders Dispatched</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{completedOrders.length}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <div style={{ padding: '0.6rem', backgroundColor: lowStockCount > 0 ? '#fee2e2' : '#f1f5f9', borderRadius: 'var(--radius-lg)', color: lowStockCount > 0 ? '#ef4444' : 'var(--neutral-muted)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>Low Stock Alerts</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: lowStockCount > 0 ? '#ef4444' : 'inherit' }}>{lowStockCount} items</div>
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: ORDERS FEED */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Incoming requests (Pending Approval from Vendor) */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-orange)' }}>
              <Clock size={18} />
              <span>Incoming Order Requests ({pendingOrders.length})</span>
            </h3>

            {pendingOrders.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)', textAlign: 'center', padding: '1.5rem' }}>
                No active orders at the moment. Keep your profile updated to draw clients!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingOrders.map((order) => (
                  <div key={order.id} style={{ padding: '1rem', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--neutral-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>ID: {order.id.replace('order_', '#')}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div style={{ fontSize: '0.85rem', margin: '0.5rem 0' }}>
                      {order.items.map((i) => (
                        <div key={i.id} style={{ color: 'var(--neutral-muted)' }}>
                          • {i.name} <strong>x {i.quantity}</strong>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', borderTop: '1px dashed var(--neutral-border)', paddingTop: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Total: ₹{order.total}</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="btn btn-sm btn-secondary"
                          style={{ borderColor: '#ef4444', color: '#ef4444' }}
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="btn btn-sm btn-primary"
                        >
                          Accept & Prepare
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preparing and Dispatch phase orders */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={18} />
              <span>Active Orders In-Progress ({activeOrders.length})</span>
            </h3>

            {activeOrders.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)', textAlign: 'center', padding: '1.5rem' }}>
                No food in preparation currently.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {activeOrders.map((order) => (
                  <div key={order.id} style={{ padding: '1rem', border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 800 }}>{order.id.replace('order_', '#')}</span>
                      <span className={`badge badge-${order.status}`}>{order.status.replace('_', ' ')}</span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--neutral-muted)', margin: '0.5rem 0' }}>
                      {order.items.map((i) => (
                        <div key={i.id}>
                          {i.name} x {i.quantity}
                        </div>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px dashed var(--neutral-border)', paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--neutral-muted)' }}>
                        Payout: ₹{order.subtotal}
                      </span>
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="btn btn-sm btn-orange"
                        >
                          Mark Prepared
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-ready)', fontWeight: 700, textTransform: 'uppercase' }}>
                          Awaiting Rider Pickup
                        </span>
                      )}
                      {order.status === 'out_for_delivery' && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-out-for-delivery)', fontWeight: 700, textTransform: 'uppercase' }}>
                          Out with Delivery Agent
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW: ADD ITEM (USER-FRIENDLY DIRECT PANEL WITH LIVE PREVIEW) */}
      {activeTab === 'add-item' && (
        <div className="animate-fade-in" style={{ width: '100%' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
            
            {/* Form Container */}
            <div className="card" style={{ flex: '1 1 500px', minWidth: '320px', padding: '1.75rem', boxShadow: 'var(--shadow-md)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={22} style={{ color: 'var(--primary-green)' }} />
                <span>Add New Item to Menu Catalog</span>
              </h3>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!formName) {
                  showToast('Please enter an Item Name!', 'warning');
                  return;
                }
                if (!formPrice || parseFloat(formPrice) <= 0) {
                  showToast('Please enter a valid price/cost above ₹0!', 'warning');
                  return;
                }
                if (!formImage) {
                  showToast('Please select or upload a Photo for the item!', 'warning');
                  return;
                }

                addProduct(currentVendorId, {
                  name: formName,
                  price: parseFloat(formPrice),
                  description: formDescription,
                  category: formCategory,
                  image: formImage,
                  stock: parseInt(formStock) || 20,
                  tags: formTag ? [formTag] : []
                });
                setActiveTab('catalog'); // redirect to inventory list
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Item Name */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span>Item Name <span style={{ color: 'red' }}>*</span></span>
                    {formName && <span style={{ color: 'var(--primary-green)', fontSize: '0.75rem', fontWeight: 700 }}>✓ Valid</span>}
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="input-field"
                    placeholder="e.g. Butter Paneer Masala, Aloo Bhujia, Paracetamol"
                  />
                </div>

                {/* Price and Stock Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span>Price / Cost (₹) <span style={{ color: 'red' }}>*</span></span>
                      {formPrice && parseFloat(formPrice) > 0 && <span style={{ color: 'var(--primary-green)', fontSize: '0.75rem', fontWeight: 700 }}>✓ ₹{parseFloat(formPrice).toFixed(2)}</span>}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--neutral-muted)' }}>₹</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="input-field"
                        placeholder="0.00"
                        style={{ paddingLeft: '1.75rem' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Initial Stock (Units)</label>
                    <input
                      type="number"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                      className="input-field"
                      placeholder="e.g. 20"
                    />
                  </div>
                </div>

                {/* Category and Offer Tag Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Category</label>
                    <select value={formCategory} onChange={(e) => {
                      setFormCategory(e.target.value);
                      setFormImage(''); // Reset template selection on category swap
                    }} className="input-field" style={{ padding: '0.7rem' }}>
                      <option value="grocery">Grocery & Staples</option>
                      <option value="food">Restaurant & Food</option>
                      <option value="fruits-veg">Fruits & Veg</option>
                      <option value="medicine">Medicines & Pharmacy</option>
                      <option value="essentials">Daily Essentials</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Offer Tag / Badge</label>
                    <input
                      type="text"
                      value={formTag}
                      onChange={(e) => setFormTag(e.target.value)}
                      className="input-field"
                      placeholder="e.g. Best Seller, Veg, 10% Off"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="input-field"
                    rows="2"
                    placeholder="Provide a description, weight details, etc. (e.g. Freshly baked, 500g)..."
                  />
                </div>

                {/* Image Section Tabs */}
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Item Photo / Image <span style={{ color: 'red' }}>*</span></span>
                    {formImage && <span style={{ color: 'var(--primary-green)', fontSize: '0.75rem', fontWeight: 700 }}>✓ Image Selected</span>}
                  </label>
                  
                  {/* Photo tabs */}
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--neutral-border)', marginBottom: '0.75rem', gap: '1rem' }}>
                    {[
                      { id: 'gallery', label: 'Preset Gallery', icon: Sparkles },
                      { id: 'upload', label: 'Upload Photo File', icon: Upload },
                      { id: 'url', label: 'Web Image URL', icon: ImageIcon }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setImageTab(tab.id)}
                          style={{
                            padding: '0.5rem 0.25rem',
                            border: 'none',
                            background: 'none',
                            borderBottom: imageTab === tab.id ? '2px solid var(--primary-green)' : '2px solid transparent',
                            color: imageTab === tab.id ? 'var(--primary-green)' : 'var(--neutral-muted)',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            transition: 'var(--transition-all)'
                          }}
                        >
                          <Icon size={14} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Photo Tab Content */}
                  {imageTab === 'gallery' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>
                          High quality presets for <strong>{formCategory}</strong> items:
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAllTemplates(!showAllTemplates)}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: 'var(--primary-green)',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {showAllTemplates ? 'Show Category Only' : 'Show All Presets'}
                        </button>
                      </div>
                      
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                          gap: '0.5rem',
                          maxHeight: '180px',
                          overflowY: 'auto',
                          padding: '0.2rem',
                          border: '1px solid var(--neutral-border)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--neutral-light)'
                        }}
                      >
                        {(showAllTemplates
                          ? Object.values(CATEGORY_TEMPLATES).flat()
                          : (CATEGORY_TEMPLATES[formCategory] || CATEGORY_TEMPLATES['grocery'])
                        ).map((item, idx) => {
                          const isSelected = formImage === item.url;
                          return (
                            <div
                              key={item.name + '-' + idx}
                              onClick={() => setFormImage(item.url)}
                              style={{
                                border: isSelected ? '2px solid var(--primary-green)' : '1px solid var(--neutral-border)',
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                textAlign: 'center',
                                backgroundColor: 'var(--neutral-white)',
                                position: 'relative',
                                transition: 'var(--transition-all)'
                              }}
                            >
                              <img src={item.url} alt={item.name} style={{ width: '100%', height: '55px', objectFit: 'cover' }} />
                              <span
                                style={{
                                  fontSize: '0.65rem',
                                  display: 'block',
                                  padding: '0.15rem 0.2rem',
                                  fontWeight: 600,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {item.name}
                              </span>
                              {isSelected && (
                                <span
                                  style={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: '2px',
                                    backgroundColor: 'var(--primary-green)',
                                    color: 'white',
                                    width: '14px',
                                    height: '14px',
                                    fontSize: '0.5rem',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800
                                  }}
                                >
                                  ✓
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {imageTab === 'upload' && (
                    <div>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          border: '2.5px dashed var(--neutral-border)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.75rem 1rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                          backgroundColor: 'var(--neutral-light)',
                          transition: 'var(--transition-all)'
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.borderColor = 'var(--primary-green)';
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.borderColor = 'var(--neutral-border)';
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.borderColor = 'var(--neutral-border)';
                          const file = e.dataTransfer.files[0];
                          if (file && file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormImage(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      >
                        <Upload size={28} style={{ color: 'var(--neutral-muted)', marginBottom: '0.5rem' }} />
                        <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          Drag & drop image file here, or <span style={{ color: 'var(--primary-green)' }}>browse files</span>
                        </p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)', marginTop: '0.2rem' }}>
                          Supports PNG, JPG, JPEG (processed locally)
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormImage(reader.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                      </div>
                      {formImage && formImage.startsWith('data:') && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--primary-green)', fontWeight: 600 }}>
                          <Check size={14} />
                          <span>Custom photo file processed successfully!</span>
                        </div>
                      )}
                    </div>
                  )}

                  {imageTab === 'url' && (
                    <div>
                      <input
                        type="url"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        className="input-field"
                        placeholder="Paste image web link (e.g. https://images.unsplash.com/...)"
                      />
                      <p style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)', marginTop: '0.2rem' }}>
                        Paste any online web URL of a JPG/PNG/WebP photo.
                      </p>
                    </div>
                  )}
                </div>

                {/* Validation Indicator & Submit Button */}
                <div style={{ marginTop: '0.5rem' }}>
                  {!formName || !formPrice || !formImage ? (
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--accent-orange-light)',
                      border: '1px solid var(--accent-orange)',
                      color: 'var(--accent-orange-hover)',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                      fontWeight: 600
                    }}>
                      <AlertTriangle size={14} />
                      <span>Name, Price/Cost, and Photo are required before adding to DesiCart.</span>
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
                  >
                    Add Item to Store Menu Catalog
                  </button>
                </div>

              </form>
            </div>

            {/* Live Preview Column */}
            <div style={{ flex: '1 1 300px', minWidth: '280px', position: 'sticky', top: '90px' }}>
              <div style={{ padding: '0.5rem 0', fontWeight: 800, fontSize: '0.9rem', color: 'var(--neutral-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Sparkles size={14} style={{ color: 'var(--primary-green)' }} />
                <span>Real-Time Customer Preview</span>
              </div>
              
              <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--neutral-border)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ position: 'relative', height: '160px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {formImage ? (
                    <img src={formImage} alt="Product Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--neutral-muted)' }}>
                      <ImageIcon size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Awaiting Photo Selection</span>
                    </div>
                  )}
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'var(--neutral-white)',
                      color: 'var(--neutral-text)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-sm)',
                      textTransform: 'uppercase'
                    }}
                  >
                    {formCategory.replace('-', ' & ')}
                  </span>
                  
                  {formTag && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'var(--accent-orange)',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-sm)',
                        textTransform: 'uppercase'
                      }}
                    >
                      {formTag}
                    </span>
                  )}
                </div>
                
                <div style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary-green)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                    {currentVendor?.name || 'Your DesiCart Store'}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--neutral-text)', marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formName || 'Item Title Preview'}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', marginBottom: '0.75rem', minHeight: '36px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>
                    {formDescription || 'Enter a description to attract customers to order this product.'}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--neutral-border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)', display: 'block' }}>Cost / Price</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--neutral-text)' }}>
                        ₹{formPrice ? parseFloat(formPrice).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    
                    <button
                      className="btn btn-sm btn-secondary"
                      type="button"
                      style={{
                        borderColor: 'var(--primary-green)',
                        color: 'var(--primary-green)',
                        fontWeight: 700,
                        pointerEvents: 'none'
                      }}
                    >
                      Add +
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB-VIEW 2: CATALOG INVENTORY */}
      {activeTab === 'catalog' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Manage Store Inventory</h3>
            <button
              onClick={() => {
                setFormName('');
                setFormPrice('');
                setFormDescription('');
                setFormCategory(currentVendor?.category || 'grocery');
                setFormImage('');
                setFormStock(20);
                setFormTag('');
                setImageTab('gallery');
                setActiveTab('add-item');
              }}
              className="btn btn-sm btn-primary"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          </div>

          {vendorProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <AlertTriangle size={30} style={{ color: 'var(--neutral-muted)', marginBottom: '0.5rem' }} />
              <h4 style={{ fontWeight: 700 }}>No Products Added Yet</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)', marginTop: '0.25rem' }}>
                Get started by listing your first grocery or food item.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {vendorProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    border: '1px solid var(--neutral-border)',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <img src={p.image} alt={p.name} style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800 }}>{p.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: p.stock <= 5 ? '#ef4444' : 'var(--neutral-muted)', fontWeight: 600 }}>
                        Stock: {p.stock} units {p.stock <= 5 && '(Low Stock)'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 800 }}>₹{p.price}</span>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        onClick={() => openEditModal(p)}
                        className="btn btn-ghost"
                        style={{ padding: '0.4rem', color: 'var(--primary-green)' }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="btn btn-ghost"
                        style={{ padding: '0.4rem', color: '#ef4444' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: SALES ANALYTICS */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AnalyticsChart
            title="Weekly Revenue Growth"
            labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
            data={[
              Math.round(grossEarnings * 0.12),
              Math.round(grossEarnings * 0.15),
              Math.round(grossEarnings * 0.10),
              Math.round(grossEarnings * 0.08),
              Math.round(grossEarnings * 0.20),
              Math.round(grossEarnings * 0.25),
              Math.round(grossEarnings * 0.10)
            ]}
            color="var(--accent-orange)"
            type="area"
          />

          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Deductions & Commission Ledger</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between' }}>
                <span>Gross Order Revenue</span>
                <strong>₹{grossEarnings.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between', color: '#ef4444' }}>
                <span>Admin Commission Fee (10%)</span>
                <strong>-₹{platformFee.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyItems: 'space-between', justifyContent: 'space-between', borderTop: '1px solid var(--neutral-border)', paddingTop: '0.5rem', fontSize: '0.95rem', fontWeight: 800 }}>
                <span>Net Transfer Amount (Settled)</span>
                <span style={{ color: 'var(--primary-green)' }}>₹{netEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem' }}>Customer Ratings & Feedback</h3>

          {/* Star breakdowns */}
          <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem', backgroundColor: 'var(--neutral-light)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-green)' }}>{currentVendor?.rating}</h2>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#eab308' }}>
                <Star size={16} style={{ fill: '#eab308' }} />
                <Star size={16} style={{ fill: '#eab308' }} />
                <Star size={16} style={{ fill: '#eab308' }} />
                <Star size={16} style={{ fill: '#eab308' }} />
                <Star size={16} style={{ fill: currentVendor?.rating >= 4.5 ? '#eab308' : 'none' }} />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>
                {currentVendor?.reviewsCount} reviews
              </span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>5 Star</span>
                <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--neutral-border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '80%', height: '100%', backgroundColor: 'var(--primary-green)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>4 Star</span>
                <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--neutral-border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', backgroundColor: 'var(--primary-green)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>3 Star</span>
                <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--neutral-border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '5%', height: '100%', backgroundColor: '#eab308' }} />
                </div>
              </div>
            </div>
          </div>

          {/* List reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {vendorOrders.filter((o) => o.ratings !== null).length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)', textAlign: 'center', padding: '1.5rem' }}>
                No reviews yet from customers.
              </p>
            ) : (
              vendorOrders.filter((o) => o.ratings !== null).map((o) => (
                <div key={o.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--neutral-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Anonymous Customer</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#eab308', fontSize: '0.8rem', fontWeight: 800 }}>
                      <span>{o.ratings}</span>
                      <Star size={12} style={{ fill: '#eab308' }} />
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--neutral-muted)' }}>
                    "{o.reviews || 'No review comments left.'}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 5: STORE PROFILE */}
      {activeTab === 'profile' && (
        <StoreProfileView
          currentVendor={currentVendor}
          updateVendorProfile={updateVendorProfile}
          currentVendorId={currentVendorId}
        />
      )}

      {/* INVENTORY FORMS MODALS (MOCKED WITH CSS LIGHTBOXES) */}
      {(showAddModal || showEditModal) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div className="card animate-fade-in" style={{ maxWidth: '450px', width: '100%', backgroundColor: 'var(--neutral-white)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--neutral-border)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontWeight: 800 }}>{showAddModal ? 'Add Catalog Product' : 'Modify Product'}</h3>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-text)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleAddProductSubmit : handleEditProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Product Name</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required className="input-field" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Price (₹)</label>
                  <input type="number" step="0.01" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} required className="input-field" />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Stock Count</label>
                  <input type="number" value={formStock} onChange={(e) => setFormStock(e.target.value)} required className="input-field" />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Description</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="input-field" rows="2" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Category</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="input-field" style={{ padding: '0.7rem' }}>
                    <option value="grocery">Grocery</option>
                    <option value="food">Restaurant Food</option>
                    <option value="fruits-veg">Fruits & Veg</option>
                    <option value="medicine">Medicine</option>
                    <option value="essentials">Daily Essentials</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Offer Tag (e.g. Veg, Best Seller)</label>
                  <input type="text" value={formTag} onChange={(e) => setFormTag(e.target.value)} className="input-field" placeholder="Must Try" />
                </div>
              </div>

              {/* Image Tabs (Edit Modal) */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Item Photo / Image <span style={{ color: 'red' }}>*</span></span>
                  {formImage && <span style={{ color: 'var(--primary-green)', fontSize: '0.65rem' }}>✓ Loaded</span>}
                </label>
                
                {/* Mini Tabs Header */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--neutral-border)', marginBottom: '0.5rem', gap: '0.75rem' }}>
                  {[
                    { id: 'gallery', label: 'Presets', icon: Sparkles },
                    { id: 'upload', label: 'Upload File', icon: Upload },
                    { id: 'url', label: 'URL Link', icon: ImageIcon }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={'edit-tab-' + tab.id}
                        type="button"
                        onClick={() => setEditImageTab(tab.id)}
                        style={{
                          padding: '0.25rem 0',
                          border: 'none',
                          background: 'none',
                          borderBottom: editImageTab === tab.id ? '2px solid var(--primary-green)' : '2px solid transparent',
                          color: editImageTab === tab.id ? 'var(--primary-green)' : 'var(--neutral-muted)',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          transition: 'var(--transition-all)'
                        }}
                      >
                        <Icon size={12} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Edit Tabs Content */}
                {editImageTab === 'gallery' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)' }}>Suggestions matching category:</span>
                      <button
                        type="button"
                        onClick={() => setShowAllEditTemplates(!showAllEditTemplates)}
                        style={{ border: 'none', background: 'none', color: 'var(--primary-green)', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {showAllEditTemplates ? 'Category Only' : 'View All'}
                      </button>
                    </div>
                    
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '0.4rem',
                        maxHeight: '100px',
                        overflowY: 'auto',
                        padding: '0.1rem',
                        border: '1px solid var(--neutral-border)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--neutral-light)'
                      }}
                    >
                      {(showAllEditTemplates
                        ? Object.values(CATEGORY_TEMPLATES).flat()
                        : (CATEGORY_TEMPLATES[formCategory] || CATEGORY_TEMPLATES['grocery'])
                      ).map((item, idx) => {
                        const isSelected = formImage === item.url;
                        return (
                          <div
                            key={'edit-preset-' + idx}
                            onClick={() => setFormImage(item.url)}
                            style={{
                              border: isSelected ? '1.5px solid var(--primary-green)' : '1px solid var(--neutral-border)',
                              borderRadius: 'var(--radius-md)',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              textAlign: 'center',
                              backgroundColor: 'var(--neutral-white)',
                              position: 'relative'
                            }}
                          >
                            <img src={item.url} alt={item.name} style={{ width: '100%', height: '40px', objectFit: 'cover' }} />
                            {isSelected && (
                              <span style={{ position: 'absolute', top: '1px', right: '1px', backgroundColor: 'var(--primary-green)', color: 'white', width: '10px', height: '10px', fontSize: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {editImageTab === 'upload' && (
                  <div>
                    <div
                      onClick={() => editFileInputRef.current?.click()}
                      style={{
                        border: '1.5px dashed var(--neutral-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: 'var(--neutral-light)',
                        transition: 'var(--transition-all)'
                      }}
                    >
                      <Upload size={16} style={{ color: 'var(--neutral-muted)', marginBottom: '0.15rem' }} />
                      <p style={{ fontSize: '0.7rem', fontWeight: 600 }}>Click to choose a new photo file</p>
                      <input
                        type="file"
                        ref={editFileInputRef}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormImage(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>
                )}

                {editImageTab === 'url' && (
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="input-field"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    placeholder="e.g. https://images.unsplash.com/..."
                  />
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                Save & Update Catalog
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Premium Store Operations Settings ─── */
const StoreProfileView = ({ currentVendor, updateVendorProfile, currentVendorId }) => {
  const [storeName, setStoreName] = useState(currentVendor?.name || '');
  const [ownerName, setOwnerName] = useState(currentVendor?.ownerName || '');
  const [mobile, setMobile] = useState(currentVendor?.mobile || '');
  const [category, setCategory] = useState(currentVendor?.category || 'grocery');
  const [address, setAddress] = useState(currentVendor?.address || '');
  const [minOrder, setMinOrder] = useState(currentVendor?.minOrder || 99);
  const [image, setImage] = useState(currentVendor?.image || '');
  const [isOpen, setIsOpen] = useState(currentVendor?.isOpen !== false);
  const [coords, setCoords] = useState(currentVendor?.coords || null);

  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionSuccess, setDetectionSuccess] = useState(!!currentVendor?.coords);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const [bannerTab, setBannerTab] = useState('gallery'); // 'gallery' | 'upload' | 'url'
  const [showAllBanners, setShowAllBanners] = useState(false);
  const bannerFileInputRef = useRef(null);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });
        setDetectionSuccess(true);
        setIsDetecting(false);
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (response.ok) {
            const data = await response.json();
            if (data && data.display_name) {
              setAddress(data.display_name);
              return;
            }
          }
        } catch (err) {
          console.error('Nominatim reverse geocoding failed:', err);
        }
        setAddress(`Coordinates: (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      },
      (error) => {
        console.error('GPS Geolocation error:', error);
        setIsDetecting(false);
        alert('Failed to access location services. Please check permissions.');
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateVendorProfile(currentVendorId, {
      name: storeName,
      ownerName,
      mobile,
      category,
      address,
      coords,
      minOrder: parseInt(minOrder),
      image,
      isOpen
    });
  };

  return (
    <div className="card animate-fade-in">
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span>Store Profile & Operations Settings</span>
      </h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Toggle open/closed */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          backgroundColor: isOpen ? 'var(--primary-green-light)' : '#fee2e2',
          border: `1px solid ${isOpen ? 'var(--primary-green)' : '#fca5a5'}`,
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1rem'
        }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: isOpen ? 'var(--neutral-text)' : '#b91c1c' }}>
              Store Status: {isOpen ? '🟢 Open for Orders' : '🔴 Closed'}
            </h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--neutral-muted)', marginTop: '0.1rem' }}>
              Toggle whether customers can place new orders from your store.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`btn btn-sm ${isOpen ? 'btn-primary' : 'btn-orange'}`}
            style={{ fontWeight: 700 }}
          >
            {isOpen ? 'Close Store' : 'Open Store'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Store Name</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Owner Full Name</label>
            <input
              type="text"
              required
              value={ownerName}
              onChange={e => setOwnerName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Mobile Number</label>
            <input
              type="text"
              required
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>GST Number (Read-only)</label>
            <input
              type="text"
              disabled
              value={currentVendor?.gstNumber || 'N/A'}
              className="input-field"
              style={{ backgroundColor: 'var(--neutral-light)', cursor: 'not-allowed' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Minimum Order Amount (₹)</label>
            <input
              type="number"
              required
              value={minOrder}
              onChange={e => setMinOrder(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="input-field"
              style={{ height: '38px', padding: '0 0.5rem' }}
            >
              <option value="grocery">Groceries</option>
              <option value="food">Restaurants & Food</option>
              <option value="fruits-veg">Fruits & Vegetables</option>
              <option value="medicine">Medicines & Health</option>
              <option value="essentials">Daily Essentials</option>
            </select>
          </div>
        </div>

        {/* Store Location Map Selector */}
        <div style={{
          padding: '1.25rem',
          backgroundColor: 'var(--neutral-light)',
          border: '1px solid var(--neutral-border)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--neutral-text)' }}>Store Location & Address</label>
            <button
              type="button"
              onClick={() => setIsMapOpen(true)}
              className="btn btn-sm btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: coords ? 'var(--primary-green)' : 'var(--accent-orange)',
                borderColor: coords ? 'var(--primary-green)' : 'var(--accent-orange)',
                fontWeight: 700
              }}
            >
              <MapPin size={13} />
              <span>{coords ? 'Edit on Map' : 'Locate on Map'}</span>
            </button>
          </div>

          <div style={{
            fontSize: '0.8rem',
            color: 'var(--neutral-text)',
            padding: '0.75rem',
            backgroundColor: 'var(--neutral-white)',
            border: '1px solid var(--neutral-border)',
            borderRadius: 'var(--radius-md)',
            minHeight: '40px',
            lineHeight: 1.4
          }}>
            {address ? (
              <div>
                <strong>📍 Current Store Address:</strong>
                <div style={{ marginTop: '0.25rem' }}>
                  {address}
                </div>
                {coords && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                    GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </div>
                )}
              </div>
            ) : (
              <span style={{ color: 'var(--neutral-muted)' }}>No location selected. Tap "Locate on Map" to pick your store location.</span>
            )}
          </div>
        </div>

        <AddressSelector
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          onConfirm={(addrInfo) => {
            setAddress(addrInfo.address);
            setCoords(addrInfo.coords);
            setDetectionSuccess(true);
            setIsMapOpen(false);
          }}
          initialCoords={coords || { lat: 28.62, lng: 77.36 }}
          initialDetails={{
            flat: address ? address.split(', ')[0] : '',
            locality: address ? address.substring(address.indexOf(', ') + 2) : ''
          }}
          title="Update Store Location"
          confirmBtnText="Confirm Store Location"
          hideTags={true}
          userName={ownerName}
          userPhone={mobile}
        />

        {/* Banner upload/select section */}
        <div style={{ borderTop: '1px solid var(--neutral-border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Store Banner Design</span>
            {image && <span style={{ color: 'var(--primary-green)', fontSize: '0.75rem', fontWeight: 700 }}>✓ Banner Set</span>}
          </label>

          {/* Banner tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--neutral-border)', marginBottom: '0.75rem', gap: '1rem' }}>
            {[
              { id: 'gallery', label: 'Preset Gallery', icon: Sparkles },
              { id: 'upload', label: 'Upload Banner File', icon: Upload },
              { id: 'url', label: 'Web Image URL', icon: ImageIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setBannerTab(tab.id)}
                  style={{
                    padding: '0.5rem 0.25rem',
                    border: 'none',
                    background: 'none',
                    borderBottom: bannerTab === tab.id ? '2px solid var(--primary-green)' : '2px solid transparent',
                    color: bannerTab === tab.id ? 'var(--primary-green)' : 'var(--neutral-muted)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'var(--transition-all)'
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Preset Banners Tab */}
          {bannerTab === 'gallery' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', fontWeight: 600 }}>
                  High quality banners for <strong>{category}</strong> outlets:
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllBanners(!showAllBanners)}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--primary-green)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {showAllBanners ? 'Show Category Only' : 'Show All Banners'}
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '0.5rem',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  padding: '0.25rem',
                  border: '1px solid var(--neutral-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--neutral-light)'
                }}
              >
                {(showAllBanners
                  ? Object.values(STORE_BANNER_TEMPLATES).flat()
                  : (STORE_BANNER_TEMPLATES[category] || STORE_BANNER_TEMPLATES['grocery'])
                ).map((item, idx) => {
                  const isSelected = image === item.url;
                  return (
                    <div
                      key={'banner-preset-' + idx}
                      onClick={() => setImage(item.url)}
                      style={{
                        border: isSelected ? '2px solid var(--primary-green)' : '1px solid var(--neutral-border)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        textAlign: 'center',
                        backgroundColor: 'var(--neutral-white)',
                        position: 'relative',
                        transition: 'var(--transition-all)'
                      }}
                    >
                      <img src={item.url} alt={item.name} style={{ width: '100%', height: '60px', objectFit: 'cover' }} />
                      <span
                        style={{
                          fontSize: '0.62rem',
                          display: 'block',
                          padding: '0.15rem 0.2rem',
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.name}
                      </span>
                      {isSelected && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            backgroundColor: 'var(--primary-green)',
                            color: 'white',
                            width: '14px',
                            height: '14px',
                            fontSize: '0.5rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload Banner Tab */}
          {bannerTab === 'upload' && (
            <div style={{ marginBottom: '1rem' }}>
              <div
                onClick={() => bannerFileInputRef.current?.click()}
                style={{
                  border: '2.5px dashed var(--neutral-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem 1rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--neutral-light)',
                  transition: 'var(--transition-all)'
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'var(--primary-green)';
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'var(--neutral-border)';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'var(--neutral-border)';
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImage(reader.result);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              >
                <Upload size={28} style={{ color: 'var(--neutral-muted)', marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Drag & drop banner image file here, or <span style={{ color: 'var(--primary-green)' }}>browse files</span>
                </p>
                <p style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)', marginTop: '0.2rem' }}>
                  Supports PNG, JPG, JPEG (processed locally)
                </p>
                <input
                  type="file"
                  ref={bannerFileInputRef}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImage(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              {image && image.startsWith('data:') && (
                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--primary-green)', fontWeight: 600 }}>
                  <Check size={14} />
                  <span>Custom store banner processed successfully!</span>
                </div>
              )}
            </div>
          )}

          {/* Web URL Tab */}
          {bannerTab === 'url' && (
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                required
                value={image}
                onChange={e => setImage(e.target.value)}
                className="input-field"
                placeholder="e.g. https://images.unsplash.com/..."
              />
            </div>
          )}

          {/* Live Preview Pane */}
          {image && (
            <div style={{ marginTop: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Banner Live Preview:
              </span>
              <div style={{
                position: 'relative',
                width: '100%',
                height: '130px',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                border: '1.5px solid var(--neutral-border)',
                boxShadow: 'var(--shadow-md)'
              }}>
                <img src={image} alt="Store Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  padding: '1rem',
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end'
                }}>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.6)', margin: 0 }}>
                    {storeName || 'Store Name'}
                  </h4>
                  <p style={{ fontSize: '0.75rem', textShadow: '0 1px 2px rgba(0,0,0,0.6)', opacity: 0.9, marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    📍 {address || 'Store Address'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', fontWeight: 700, padding: '0.6rem 1.5rem', marginTop: '0.5rem' }}>
          Save Store Changes
        </button>
      </form>
    </div>
  );
};
