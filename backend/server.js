// server.js - Complete working server with all routes integrated
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
const uri = process.env.MONGODB_URI || "mongodb+srv://tadiwasongore_db_user:BigdaddyT@sales.o3ww0ii.mongodb.net/tut_marketplace?retryWrites=true&w=majority&appName=sales";
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
    console.log("✅ Successfully connected to MongoDB!");
    
    // Create indexes for better performance
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('products').createIndex({ sellerId: 1 });
      await db.collection('products').createIndex({ category: 1 });
      await db.collection('products').createIndex({ sellerCampus: 1 });
      console.log("✅ Database indexes created successfully");
    } catch (indexError) {
      console.log("📝 Indexes already exist or error creating indexes:", indexError.message);
    }
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// JWT middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      success: false
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'tut_marketplace_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        success: false
      });
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
      return res.status(404).json({ 
        error: 'User not found',
        success: false
      });
    }

    if (user.type !== 'seller' || !user.subscribed) {
      return res.status(403).json({ 
        error: 'Active seller subscription required',
        code: 'SUBSCRIPTION_REQUIRED',
        success: false
      });
    }

    // Check if subscription has expired
    if (user.subscriptionEndDate && new Date() > new Date(user.subscriptionEndDate)) {
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
        code: 'SUBSCRIPTION_EXPIRED',
        success: false
      });
    }

    req.userProfile = user;
    next();

  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ 
      error: 'Error checking subscription',
      success: false
    });
  }
};

// Validation helpers
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidCampus = (campus) => {
  const validCampuses = [
    'pretoria-main', 'soshanguve', 'ga-rankuwa', 'pretoria-west',
    'arts', 'emalahleni', 'mbombela', 'polokwane'
  ];
  return validCampuses.includes(campus);
};

const isValidCategory = (category) => {
  const validCategories = [
    'books', 'electronics', 'services', 'clothing', 'food', 'transport', 'accommodation', 'other'
  ];
  return validCategories.includes(category);
};

// ==============================================
// AUTH ROUTES
// ==============================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt:', req.body);
    
    const { name, email, password, userType, campus } = req.body;

    // Validation
    if (!name || !email || !password || !userType || !campus) {
      return res.status(400).json({ 
        error: 'All fields are required',
        success: false
      });
    }

    if (!email.endsWith('@tut.ac.za')) {
      return res.status(400).json({ 
        error: 'Please use a valid TUT email address',
        success: false
      });
    }

    if (!isValidCampus(campus)) {
      return res.status(400).json({ 
        error: 'Please select a valid campus',
        success: false
      });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists with this email',
        success: false
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user object
    const isSellerType = userType === 'seller';
    const user = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      type: userType,
      campus,
      subscribed: isSellerType,
      subscriptionStartDate: isSellerType ? new Date() : null,
      subscriptionEndDate: isSellerType ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      subscriptionStatus: isSellerType ? 'active' : null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('💾 Inserting user:', { ...user, password: '[HIDDEN]' });

    // Insert user
    const result = await db.collection('users').insertOne(user);
    console.log('✅ User insertion result:', result.insertedId);
    
    // Create JWT token
    const token = jwt.sign(
      { id: result.insertedId.toString(), email, type: userType, campus },
      process.env.JWT_SECRET || 'tut_marketplace_secret',
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userResponse } = user;
    userResponse._id = result.insertedId;

    console.log('✅ User registered successfully:', email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed: ' + error.message,
      success: false
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔑 Login attempt:', req.body.email);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        success: false
      });
    }

    // Find user
    const user = await db.collection('users').findOne({ 
      email: email.toLowerCase() 
    });
    
    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid email or password',
        success: false
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ 
        error: 'Invalid email or password',
        success: false
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, type: user.type, campus: user.campus },
      process.env.JWT_SECRET || 'tut_marketplace_secret',
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userResponse } = user;

    console.log('✅ User logged in successfully:', email);

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      error: 'Login failed: ' + error.message,
      success: false
    });
  }
});

// ==============================================
// PRODUCT ROUTES
// ==============================================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Getting products with filters:', req.query);
    
    const { category, campus, search, page = 1, limit = 12 } = req.query;
    
    // Build filter query
    let filter = { status: 'active' };
    
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

    console.log('🔍 Filter:', filter);

    // Get total count
    const total = await db.collection('products').countDocuments(filter);
    
    // Get products with pagination
    const products = await db.collection('products')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .toArray();

    console.log(`✅ Found ${products.length} products out of ${total} total`);

    res.json({
      success: true,
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
    console.error('❌ Get products error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve products: ' + error.message,
      success: false
    });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('📦 Getting product:', productId);
    
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        success: false
      });
    }
    
    const product = await db.collection('products')
      .findOne({ _id: new ObjectId(productId) });
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        success: false
      });
    }

    console.log('✅ Product found:', product.title);
    
    res.json({
      success: true,
      ...product
    });

  } catch (error) {
    console.error('❌ Get product error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve product: ' + error.message,
      success: false
    });
  }
});

// Create product
app.post('/api/products', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    console.log('➕ Creating product:', req.body);
    console.log('👤 User:', req.user);
    
    const { title, description, price, category, type } = req.body;

    // Validation
    if (!title || !description || !price || !category) {
      return res.status(400).json({ 
        error: 'All fields are required',
        success: false
      });
    }

    if (!isValidCategory(category)) {
      return res.status(400).json({ 
        error: 'Invalid category',
        success: false
      });
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return res.status(400).json({ 
        error: 'Price must be a positive number',
        success: false
      });
    }

    // Get seller information
    const seller = req.userProfile;

    // Create product object
    const product = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      type: type || 'product',
      sellerId: new ObjectId(req.user.id),
      sellerName: seller.name,
      sellerCampus: seller.campus,
      rating: 0,
      reviews: [],
      images: [],
      status: 'active',
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('💾 Inserting product:', product);

    const result = await db.collection('products').insertOne(product);
    console.log('✅ Product insertion result:', result.insertedId);
    
    const createdProduct = { ...product, _id: result.insertedId };

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId: result.insertedId,
      product: createdProduct
    });

  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({ 
      error: 'Failed to create product: ' + error.message,
      success: false
    });
  }
});

// Update product
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('✏️ Updating product:', productId);
    
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        success: false
      });
    }

    // Check if product exists and user owns it
    const existingProduct = await db.collection('products')
      .findOne({ _id: new ObjectId(productId) });

    if (!existingProduct) {
      return res.status(404).json({ 
        error: 'Product not found',
        success: false
      });
    }

    if (existingProduct.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ 
        error: 'You can only update your own products',
        success: false
      });
    }

    const { title, description, price, category, type, status } = req.body;

    // Build update object
    const updateData = { updatedAt: new Date() };
    
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (price) updateData.price = parseFloat(price);
    if (category && isValidCategory(category)) updateData.category = category;
    if (type) updateData.type = type;
    if (status) updateData.status = status;

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      { $set: updateData }
    );

    console.log('✅ Product updated');

    res.json({
      success: true,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({ 
      error: 'Failed to update product: ' + error.message,
      success: false
    });
  }
});

// Delete product
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const productId = req.params.id;
    console.log('🗑️ Deleting product:', productId);
    
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        success: false
      });
    }

    // Check if product exists and user owns it
    const existingProduct = await db.collection('products')
      .findOne({ _id: new ObjectId(productId) });

    if (!existingProduct) {
      return res.status(404).json({ 
        error: 'Product not found',
        success: false
      });
    }

    if (existingProduct.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ 
        error: 'You can only delete your own products',
        success: false
      });
    }

    const result = await db.collection('products').deleteOne({ 
      _id: new ObjectId(productId) 
    });

    console.log('✅ Product deleted');

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({ 
      error: 'Failed to delete product: ' + error.message,
      success: false
    });
  }
});

// ==============================================
// MESSAGE ROUTES
// ==============================================

// Get messages for conversation
app.get('/api/messages/:conversationId', authenticateToken, async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    console.log('💬 Getting messages for:', conversationId);
    
    const messages = await db.collection('messages')
      .find({ conversationId })
      .sort({ createdAt: 1 })
      .toArray();

    res.json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve messages: ' + error.message,
      success: false
    });
  }
});

// Send message
app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    console.log('📤 Sending message:', req.body);
    
    const { receiverId, text, conversationId } = req.body;

    if (!receiverId || !text || !conversationId) {
      return res.status(400).json({ 
        error: 'All fields are required',
        success: false
      });
    }

    const message = {
      senderId: new ObjectId(req.user.id),
      receiverId: new ObjectId(receiverId),
      conversationId,
      text: text.trim(),
      read: false,
      createdAt: new Date()
    };

    const result = await db.collection('messages').insertOne(message);
    console.log('✅ Message sent');
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      messageId: result.insertedId
    });

  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({ 
      error: 'Failed to send message: ' + error.message,
      success: false
    });
  }
});

// ==============================================
// REFERENCE DATA ROUTES
// ==============================================

// Get campuses
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
  res.json({ success: true, campuses });
});

// Get categories
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
  res.json({ success: true, categories });
});

// Get subscription status
app.get('/api/user/subscription-status', authenticateToken, async (req, res) => {
  try {
    const user = await db.collection('users')
      .findOne({ _id: new ObjectId(req.user.id) });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        success: false
      });
    }

    const hasActiveSubscription = user.subscribed && 
      (!user.subscriptionEndDate || new Date() <= new Date(user.subscriptionEndDate));

    res.json({
      success: true,
      hasActiveSubscription,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndDate: user.subscriptionEndDate,
      canSell: hasActiveSubscription
    });

  } catch (error) {
    console.error('❌ Subscription status error:', error);
    res.status(500).json({ 
      error: 'Failed to check subscription status: ' + error.message,
      success: false
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    database: db ? 'Connected' : 'Disconnected',
    success: true
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    await db.admin().ping();
    res.json({ 
      success: true,
      message: 'Database connection is working!',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Database connection failed: ' + error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    success: false
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    success: false
  });
});

// Start server
const startServer = async () => {
  await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔗 Test DB: http://localhost:${PORT}/api/test-db`);
    console.log(`📊 Database: ${db ? '✅ Connected' : '❌ Disconnected'}`);
  });
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await client.close();
  process.exit(0);
});

startServer().catch(console.error);

module.exports = app;