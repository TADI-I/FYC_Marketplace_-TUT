// server.js - Main Express server for TUT Marketplace
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const uri = "mongodb+srv://tadiwasongore_db_user:BigdaddyT@sales.o3ww0ii.mongodb.net/?retryWrites=true&w=majority&appName=sales";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await client.connect();
    db = client.db('tut_marketplace');
    console.log("Successfully connected to MongoDB!");
    
    // Create indexes for better performance
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('products').createIndex({ sellerId: 1 });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ sellerCampus: 1 });
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// JWT middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'tut_marketplace_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user has active subscription
const requireActiveSubscription = async (req, res, next) => {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.type !== 'seller' || !user.subscribed) {
      return res.status(403).json({ 
        error: 'Active seller subscription required',
        code: 'SUBSCRIPTION_REQUIRED'
      });
    }

    // Check if subscription is still valid
    if (user.subscriptionEndDate && new Date() > new Date(user.subscriptionEndDate)) {
      // Update user status
      await db.collection('users').updateOne(
        { _id: new ObjectId(req.user.id) },
        { 
          $set: { 
            subscribed: false, 
            type: 'customer',
            subscriptionStatus: 'expired'
          } 
        }
      );
      
      return res.status(403).json({ 
        error: 'Subscription has expired',
        code: 'SUBSCRIPTION_EXPIRED'
      });
    }

    req.userProfile = user;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Error checking subscription' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, userType, campus } = req.body;

    // Validate TUT email
    if (!email.endsWith('@tut.ac.za')) {
      return res.status(400).json({ error: 'Please use a valid TUT email address' });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const user = {
      name,
      email,
      password: hashedPassword,
      type: userType,
      campus,
      subscribed: userType === 'seller',
      subscriptionStartDate: userType === 'seller' ? new Date() : null,
      subscriptionEndDate: userType === 'seller' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null, // 30 days
      subscriptionStatus: userType === 'seller' ? 'active' : null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert user
    const result = await db.collection('users').insertOne(user);
    
    // Create JWT token
    const token = jwt.sign(
      { id: result.insertedId, email, type: userType },
      process.env.JWT_SECRET || 'tut_marketplace_secret',
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userResponse } = user;
    userResponse._id = result.insertedId;

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, type: user.type },
      process.env.JWT_SECRET || 'tut_marketplace_secret',
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userResponse } = user;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User Routes
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const users = await db.collection('users')
      .find({}, { projection: { password: 0 } })
      .toArray();
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await db.collection('users')
      .findOne(
        { _id: new ObjectId(req.params.id) },
        { projection: { password: 0 } }
      );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { name, campus } = req.body;
    const userId = req.params.id;

    // Ensure user can only update their own profile or admin
    if (req.user.id !== userId && req.user.type !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const updateData = {
      ...(name && { name }),
      ...(campus && { campus }),
      updatedAt: new Date()
    };

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const { category, campus, search, page = 1, limit = 12 } = req.query;
    
    // Build filter query
    let filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (campus && campus !== 'all') {
      filter.sellerCampus = campus;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await db.collection('products').countDocuments(filter);
    
    // Get products with pagination
    const products = await db.collection('products')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .toArray();

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.collection('products')
      .findOne({ _id: new ObjectId(req.params.id) });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});

app.post('/api/products', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const { title, description, price, category, type } = req.body;

    // Validate required fields
    if (!title || !description || !price || !category) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create product object
    const product = {
      title,
      description,
      price: parseFloat(price),
      category,
      type: type || 'product',
      sellerId: new ObjectId(req.user.id),
      sellerName: req.userProfile.name,
      sellerCampus: req.userProfile.campus,
      rating: 0,
      reviews: [],
      images: [], // Will be populated when image upload is implemented
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('products').insertOne(product);
    
    res.status(201).json({
      message: 'Product created successfully',
      productId: result.insertedId,
      product: { ...product, _id: result.insertedId }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const productId = req.params.id;
    const { title, description, price, category, type, status } = req.body;

    // Find product and verify ownership
    const existingProduct = await db.collection('products')
      .findOne({ _id: new ObjectId(productId) });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (existingProduct.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this product' });
    }

    // Update product
    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(price && { price: parseFloat(price) }),
      ...(category && { category }),
      ...(type && { type }),
      ...(status && { status }),
      updatedAt: new Date()
    };

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      { $set: updateData }
    );

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;

    // Find product and verify ownership
    const product = await db.collection('products')
      .findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this product' });
    }

    // Delete product
    await db.collection('products').deleteOne({ _id: new ObjectId(productId) });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get products by seller
app.get('/api/users/:id/products', authenticateToken, async (req, res) => {
  try {
    const sellerId = req.params.id;
    
    const products = await db.collection('products')
      .find({ sellerId: new ObjectId(sellerId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(products);
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ error: 'Failed to retrieve seller products' });
  }
});

// Messages Routes
app.get('/api/messages/:conversationId', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    
    const messages = await db.collection('messages')
      .find({ conversationId })
      .sort({ createdAt: 1 })
      .toArray();

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { receiverId, text, conversationId } = req.body;

    const message = {
      senderId: new ObjectId(req.user.id),
      receiverId: new ObjectId(receiverId),
      conversationId,
      text,
      read: false,
      createdAt: new Date()
    };

    const result = await db.collection('messages').insertOne(message);
    
    res.status(201).json({
      message: 'Message sent successfully',
      messageId: result.insertedId
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Subscription status endpoint
app.get('/api/user/subscription-status', authenticateToken, async (req, res) => {
  try {
    const user = await db.collection('users')
      .findOne({ _id: new ObjectId(req.user.id) });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hasActiveSubscription = user.subscribed && 
      (!user.subscriptionEndDate || new Date() <= new Date(user.subscriptionEndDate));

    res.json({
      hasActiveSubscription,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndDate: user.subscriptionEndDate,
      canSell: hasActiveSubscription
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
});

// Campus and category reference data
app.get('/api/campuses', (req, res) => {
  const campuses = [
    { id: 'pretoria-main', name: 'Pretoria Main Campus' },
    { id: 'soshanguve', name: 'Soshanguve Campus' },
    { id: 'ga-rankuwa', name: 'Ga-Rankuwa Campus' },
    { id: 'pretoria-west', name: 'Pretoria West Campus' },
    { id: 'arts', name: 'Arts Campus' },
    { id: 'emalahleni', name: 'eMalahleni Campus' },
    { id: 'mbombela', name: 'Mbombela Campus' },
    { id: 'polokwane', name: 'Polokwane Campus' }
  ];
  res.json(campuses);
});

app.get('/api/categories', (req, res) => {
  const categories = [
    { id: 'books', name: 'Books' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'services', name: 'Services' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'food', name: 'Food' },
    { id: 'transport', name: 'Transport' },
    { id: 'accommodation', name: 'Accommodation' },
    { id: 'other', name: 'Other' }
  ];
  res.json(categories);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    database: db ? 'Connected' : 'Disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  await client.close();
  process.exit(0);
});

startServer().catch(console.error);

module.exports = app;