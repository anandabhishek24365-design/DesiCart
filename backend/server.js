import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'desicart_fallback_secret_key_24365';

// ─── IN-MEMORY MOCK DATABASES (FOR RESILIENT DECOUPLING) ────────────────────────
const users = [
  {
    email: 'customer@desicart.com',
    passwordHash: bcrypt.hashSync('password', 10),
    name: 'Jane Doe',
    role: 'customer'
  },
  {
    email: 'vendor_1@desicart.com',
    passwordHash: bcrypt.hashSync('password', 10),
    name: 'Fresh Mart Store',
    role: 'vendor'
  },
  {
    email: 'rider_1@desicart.com',
    passwordHash: bcrypt.hashSync('password', 10),
    name: 'Alex Rider',
    role: 'rider'
  },
  {
    email: 'anandabhishek24365@gmail.com',
    passwordHash: bcrypt.hashSync('password', 10),
    name: 'Abhishek Anand',
    role: 'superadmin'
  }
];

const orders = [];

// ─── AUTHENTICATION MIDDLEWARE ────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// ─── CONFIG ENDPOINTS ─────────────────────────────────────────────────────────
app.get('/api/config/razorpay-key', (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_T5IApVfQDdwrNE' });
});

// ─── AUTHENTICATION ENDPOINTS ─────────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const emailLower = email.toLowerCase().trim();
  const existingUser = users.find(u => u.email === emailLower);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    name,
    email: emailLower,
    passwordHash: hashedPassword,
    role
  };
  users.push(newUser);

  const token = jwt.sign({ email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { name: newUser.name, email: newUser.email, role: newUser.role } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const emailLower = email.toLowerCase().trim();
  const user = users.find(u => u.email === emailLower && u.role === role);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email, password, or role' });
  }

  const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
});

// ─── RAZORPAY PAYMENT ENDPOINTS ───────────────────────────────────────────────
app.post('/api/payment/create-order', authenticateToken, async (req, res) => {
  const { amount } = req.body; // in INR
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_T5IApVfQDdwrNE',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
    });

    const options = {
      amount: Math.round(amount * 100), // in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, orderId: order.id, amount: order.amount });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

app.post('/api/payment/verify', authenticateToken, (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment details' });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature === razorpay_signature) {
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid payment signature. Transaction failed.' });
  }
});

// ─── CHECKOUT & ORDER ENDPOINTS ───────────────────────────────────────────────
app.post('/api/checkout', authenticateToken, (req, res) => {
  const { cart, address, paymentMethod } = req.body;
  if (!cart || !cart.items || cart.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  // Server-side recalculation of cart pricing
  let subtotal = 0;
  cart.items.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  const deliveryFee = 40;
  const total = subtotal + deliveryFee - (cart.discount || 0);

  const orderId = 'order_' + Date.now();
  const newOrder = {
    id: orderId,
    customerEmail: req.user.email,
    items: cart.items,
    subtotal,
    discount: cart.discount || 0,
    deliveryFee,
    total,
    address,
    paymentMethod,
    status: 'pending',
    createdAt: new Date().toISOString(),
    deliveryPartnerId: null,
    customerName: req.user.email.split('@')[0]
  };

  orders.push(newOrder);
  res.json({ success: true, orderId });
});

app.get('/api/orders', authenticateToken, (req, res) => {
  const { email, role } = req.user;
  let filteredOrders = [];

  if (role === 'customer') {
    filteredOrders = orders.filter(o => o.customerEmail === email);
  } else if (role === 'vendor') {
    // In a real DB, filter by items originating from this vendor's store
    filteredOrders = orders; 
  } else if (role === 'rider') {
    filteredOrders = orders.filter(o => o.deliveryPartnerId === email || o.status === 'ready');
  } else {
    filteredOrders = orders; // Admin/Super Admin
  }

  res.json(filteredOrders);
});

app.post('/api/orders/update-status', authenticateToken, (req, res) => {
  const { orderId, status, riderId } = req.body;
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = status;
  if (riderId) {
    order.deliveryPartnerId = riderId;
  }

  // Notify WebSocket listeners for real-time tracking
  io.emit(`order_status_${orderId}`, { status, riderId, orderId });

  res.json({ success: true, order });
});

// ─── WEBSOCKET REALTIME RIDER TRACKING ────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // Rider coordinates updater
  socket.on('rider_location_update', (data) => {
    const { orderId, lat, lng, riderId } = data;
    // Broadcast coordinates to active order trackers (customers/admins)
    io.emit(`rider_location_${orderId}`, { lat, lng, riderId });
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`DesiCart Secure Backend running on port ${PORT}`);
});
