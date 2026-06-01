export const INITIAL_CATEGORIES = [
  { id: 'all', name: 'All Essentials', icon: 'Sparkles', color: '#8b5cf6' },
  { id: 'grocery', name: 'Groceries & Staples', icon: 'ShoppingBag', color: '#10b981' },
  { id: 'food', name: 'Restaurants & Food', icon: 'Utensils', color: '#f97316' },
  { id: 'fruits-veg', name: 'Fruits & Vegetables', icon: 'Leaf', color: '#22c55e' },
  { id: 'medicine', name: 'Medicines & Health', icon: 'Activity', color: '#ef4444' },
  { id: 'essentials', name: 'Daily Essentials', icon: 'Package', color: '#06b6d4' }
];

export const INITIAL_VENDORS = [
  {
    id: 'vendor_1',
    name: 'Blinky Grocers',
    category: 'grocery',
    rating: 4.6,
    reviewsCount: 120,
    deliveryTime: '10-15 mins',
    minOrder: 99,
    address: 'Sector 62, Noida',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    logoBg: '#10b981',
    isApproved: true,
    featured: true,
    bannerOffer: 'Flat 50% Off | Code: BLINK50'
  },
  {
    id: 'vendor_2',
    name: 'Burger Craft',
    category: 'food',
    rating: 4.8,
    reviewsCount: 450,
    deliveryTime: '20-25 mins',
    minOrder: 149,
    address: 'DLF CyberCity, Gurugram',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    logoBg: '#f97316',
    isApproved: true,
    featured: true,
    bannerOffer: 'Buy 1 Get 1 Free | Code: DOUBLE'
  },
  {
    id: 'vendor_3',
    name: 'GreenGrocer Fresh',
    category: 'fruits-veg',
    rating: 4.4,
    reviewsCount: 88,
    deliveryTime: '12-18 mins',
    minOrder: 79,
    address: 'Rohini Sector 11, Delhi',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff163e2c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    logoBg: '#22c55e',
    isApproved: true,
    featured: false,
    bannerOffer: 'Fresh Organic Crops | 20% Off'
  },
  {
    id: 'vendor_4',
    name: 'MediQuick Pharmacy',
    category: 'medicine',
    rating: 4.7,
    reviewsCount: 230,
    deliveryTime: '15-20 mins',
    minOrder: 49,
    address: 'Indiranagar, Bengaluru',
    image: 'https://images.unsplash.com/photo-1607619056574-7b8d304f2b23?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    logoBg: '#ef4444',
    isApproved: true,
    featured: true,
    bannerOffer: 'Free Delivery above ₹200'
  },
  {
    id: 'vendor_5',
    name: 'Pizza Express Cafe',
    category: 'food',
    rating: 4.5,
    reviewsCount: 312,
    deliveryTime: '25-30 mins',
    minOrder: 199,
    address: 'Saket, New Delhi',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    logoBg: '#ea580c',
    isApproved: true,
    featured: false,
    bannerOffer: '20% off on all pizzas'
  }
];

export const INITIAL_PRODUCTS = [
  // Grocery
  {
    id: 'prod_101',
    vendorId: 'vendor_1',
    name: 'Premium Basmati Rice',
    price: 120,
    rating: 4.5,
    description: 'Long grain aromatic basmati rice, perfect for biryani and daily meals.',
    category: 'grocery',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=60',
    stock: 120,
    tags: ['Best Seller', 'Staples']
  },
  {
    id: 'prod_102',
    vendorId: 'vendor_1',
    name: 'Cold Pressed Mustard Oil',
    price: 195,
    rating: 4.6,
    description: 'Pure, organic mustard oil extracted through traditional cold press method.',
    category: 'grocery',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=60',
    stock: 45,
    tags: ['Organic', 'Cooking Essential']
  },
  {
    id: 'prod_103',
    vendorId: 'vendor_1',
    name: 'Refined Sugar (1kg)',
    price: 48,
    rating: 4.2,
    description: 'Sulphur-free, clean refined sugar crystals for your everyday sweetening needs.',
    category: 'grocery',
    image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?w=300&auto=format&fit=crop&q=60',
    stock: 200,
    tags: ['Daily Need']
  },
  
  // Food - Burger Craft
  {
    id: 'prod_201',
    vendorId: 'vendor_2',
    name: 'Double Cheese Crunch Burger',
    price: 189,
    rating: 4.8,
    description: 'Double grilled veg patties with loaded cheddar, crunchy lettuce, and spicy mayo.',
    category: 'food',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=60',
    stock: 50,
    tags: ['Veg', 'Must Try']
  },
  {
    id: 'prod_202',
    vendorId: 'vendor_2',
    name: 'Peri Peri Crispy Chicken Burger',
    price: 220,
    rating: 4.9,
    description: 'Spicy peri-peri chicken breast fillet, crispy fried, layered with signature sauces.',
    category: 'food',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=300&auto=format&fit=crop&q=60',
    stock: 35,
    tags: ['Non-Veg', 'Best Seller']
  },
  {
    id: 'prod_203',
    vendorId: 'vendor_2',
    name: 'Salted French Fries (Large)',
    price: 99,
    rating: 4.4,
    description: 'Classic salted golden fries, crispy on the outside and soft inside.',
    category: 'food',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&auto=format&fit=crop&q=60',
    stock: 100,
    tags: ['Veg', 'Sides']
  },

  // Fruits & Veg
  {
    id: 'prod_301',
    vendorId: 'vendor_3',
    name: 'Fresh Organic Bananas (1 Dozen)',
    price: 60,
    rating: 4.5,
    description: 'Sweet, naturally ripened organic bananas directly sourced from local farms.',
    category: 'fruits-veg',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop&q=60',
    stock: 60,
    tags: ['Fresh Crop', 'High Fiber']
  },
  {
    id: 'prod_302',
    vendorId: 'vendor_3',
    name: 'Hydroponic Cherry Tomatoes (250g)',
    price: 85,
    rating: 4.7,
    description: 'Super sweet and juicy cherry tomatoes grown hydroponically, pesticide-free.',
    category: 'fruits-veg',
    image: 'https://images.unsplash.com/photo-1561131248-c52d886214c7?w=300&auto=format&fit=crop&q=60',
    stock: 30,
    tags: ['Gourmet', 'Exotic']
  },

  // Medicines
  {
    id: 'prod_401',
    vendorId: 'vendor_4',
    name: 'Multivitamin Supplements (30 Tabs)',
    price: 350,
    rating: 4.7,
    description: 'Daily multivitamin health supplements enriched with Zinc, Vitamin C, D3, and B12.',
    category: 'medicine',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=60',
    stock: 80,
    tags: ['OTC', 'Health Essential']
  },
  {
    id: 'prod_402',
    vendorId: 'vendor_4',
    name: 'Digital Termometer',
    price: 249,
    rating: 4.5,
    description: 'High-precision digital oral/underarm thermometer with auto-beep alert.',
    category: 'medicine',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=60',
    stock: 25,
    tags: ['Device']
  },

  // Food - Pizza Express
  {
    id: 'prod_501',
    vendorId: 'vendor_5',
    name: 'Farmhouse Garden Pizza (Medium)',
    price: 349,
    rating: 4.6,
    description: 'Loaded with crunchy capsicum, sweet corn, cherry tomatoes, and red onions with fresh mozzarella.',
    category: 'food',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=300&auto=format&fit=crop&q=60',
    stock: 40,
    tags: ['Veg', 'Top Seller']
  }
];

export const INITIAL_COUPONS = [
  { code: 'BLINK50', discountType: 'percentage', discountValue: 50, maxDiscount: 150, minOrder: 199, description: '50% off up to ₹150 on orders above ₹199' },
  { code: 'WELCOME75', discountType: 'flat', discountValue: 75, maxDiscount: 75, minOrder: 299, description: 'Flat ₹75 discount on orders above ₹299' },
  { code: 'FREEFAST', discountType: 'free-delivery', discountValue: 0, maxDiscount: 50, minOrder: 99, description: 'Free Express delivery on orders above ₹99' }
];

export const INITIAL_DELIVERY_PARTNERS = [
  { id: 'rider_1', name: 'Rahul Sharma', phone: '+91 98765 43210', status: 'online', currentOrderId: null, totalEarnings: 1240 },
  { id: 'rider_2', name: 'Amit Verma', phone: '+91 87654 32109', status: 'online', currentOrderId: null, totalEarnings: 850 },
  { id: 'rider_3', name: 'Vikram Singh', phone: '+91 76543 21098', status: 'offline', currentOrderId: null, totalEarnings: 0 }
];

export const BANNER_SLIDES = [
  {
    id: 1,
    title: 'Super-Fast 10-Minute Delivery',
    subtitle: 'Groceries, Fresh Fruits, Vegetables, and daily essentials delivered right to your doorstep.',
    bgGrad: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
    promoCode: 'BLINK50',
    img: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    title: 'Craving Delicious Hot Food?',
    subtitle: 'Get top-rated dishes from top restaurants in your area delivered fresh and piping hot.',
    bgGrad: 'linear-gradient(135deg, #c2410c 0%, #f97316 100%)',
    promoCode: 'WELCOME75',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: 3,
    title: 'Health & Medicines Instantly',
    subtitle: 'Prescribed medicines and healthcare devices delivered safely within 15 minutes.',
    bgGrad: 'linear-gradient(135deg, #991b1b 0%, #ef4444 100%)',
    promoCode: 'FREEFAST',
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&auto=format&fit=crop&q=60'
  }
];
