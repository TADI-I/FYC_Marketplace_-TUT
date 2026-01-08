// server.js - Fixed version with proper db injection
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

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
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Database middleware - inject db into all requests
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Import controllers
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const userController = require('./controllers/userController');
const messageController = require('./controllers/messageController');
const referenceController = require('./controllers/referenceController');
const healthController = require('./controllers/healthController');

// Import middleware
const { 
  authenticateToken, 
  requireActiveSubscription,
  validateObjectId,
  requireOwnership 
} = require('./middleware/authMiddleware');

// Helper functions for middleware with db
const withSubscriptionCheck = (req, res, next) => {
  requireActiveSubscription(req, res, next, req.db);
};

const withOwnershipCheck = (resourceType) => (req, res, next) => {
  requireOwnership(resourceType)(req, res, next, req.db);
};

// ==============================================
// ROUTES
// ==============================================

// Health checks
app.get('/api/health', (req, res) => healthController.healthCheck(req, res, req.db));
app.get('/api/test-db', (req, res) => healthController.testDbConnection(req, res, req.db));

// Auth routes
app.post('/api/auth/register', (req, res) => authController.register(req, res, req.db));
app.post('/api/auth/login', (req, res) => authController.login(req, res, req.db));

// User routes
app.get('/api/users/me', authenticateToken, (req, res) => authController.getCurrentUser(req, res, req.db));
app.get('/api/users/:id', authenticateToken, validateObjectId('id'), (req, res) => userController.getUserProfile(req, res, req.db));
app.put('/api/users/:id', authenticateToken, validateObjectId('id'), withOwnershipCheck('user'), (req, res) => userController.updateUserProfile(req, res, req.db));
app.post('/api/users/:id/upgrade', authenticateToken, validateObjectId('id'), withOwnershipCheck('user'), (req, res) => userController.upgradeUserToSeller(req, res, req.db));
app.get('/api/user/subscription-status', authenticateToken, (req, res) => userController.getSubscriptionStatus(req, res, req.db));

// Product routes
app.get('/api/products', (req, res) => productController.getProducts(req, res, req.db));
app.get('/api/products/:id', validateObjectId('id'), (req, res) => productController.getProductById(req, res, req.db));
app.get('/api/products/seller/:sellerId', validateObjectId('sellerId'), (req, res) => productController.getProductsBySeller(req, res, req.db));

// ⚠️ REMOVE THIS DUPLICATE ROUTE LINE (LINE 113):
// app.post('/api/products', authenticateToken, withSubscriptionCheck, (req, res) => productController.createProduct(req, res, req.db));

// ⚠️ KEEP ONLY THIS ONE WITH MULTER UPLOAD:
app.post('/api/products', authenticateToken, withSubscriptionCheck, upload.single('image'), async (req, res) => {
  try {
    console.log('➕ Creating product with FormData:', req.body);
    console.log('📁 File received:', req.file);
    
    const { title, description, price, category, type, sellerName, sellerCampus } = req.body;

    // Validation
    if (!title || !description || !price || !category) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        error: 'All fields are required',
        success: false
      });
    }

    // Handle image URL
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Create product object
    const product = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      type: type || 'product',
      sellerId: new ObjectId(req.user.id),
      sellerName: sellerName || req.user.name,
      sellerCampus: sellerCampus || req.user.campus,
      image: imageUrl,
      rating: 0,
      reviews: [],
      images: imageUrl ? [imageUrl] : [],
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
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      error: 'Failed to create product: ' + error.message,
      success: false
    });
  }
});

app.put('/api/products/:id', authenticateToken, validateObjectId('id'), withOwnershipCheck('product'), (req, res) => productController.updateProduct(req, res, req.db));
app.delete('/api/products/:id', authenticateToken, validateObjectId('id'), withOwnershipCheck('product'), (req, res) => productController.deleteProduct(req, res, req.db));

// Message routes
app.get('/api/messages/:conversationId', authenticateToken, (req, res) => messageController.getMessages(req, res, req.db));
app.post('/api/messages', authenticateToken, (req, res) => messageController.sendMessage(req, res, req.db));

// Reference data routes
app.get('/api/campuses', referenceController.getCampuses);
app.get('/api/categories', referenceController.getCategories);

// Debug route for user update
app.put('/api/users/:id', (req, res) => {
  console.log('🎯 PUT /api/users/:id route HIT!');
  console.log('Request details:', {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path,
    params: req.params,
    body: req.body
  });
  
  res.json({ 
    success: true, 
    message: 'Debug route reached',
    userId: req.params.id 
  });
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
app.use('*', (req, res) => {
  console.log('🚫 404 Route not found:', req.originalUrl);
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
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('📁 Created uploads directory:', uploadsDir);
    }
    
    console.log(`📷 Image uploads will be stored in: ${uploadsDir}`);
    console.log(`🔗 Products route: http://localhost:${PORT}/api/products`);
    console.log(`🔗 Image access: http://localhost:${PORT}/uploads/filename.jpg`);
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