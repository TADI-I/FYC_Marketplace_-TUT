// server.js - Fixed GridFS Implementation
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId, GridFSBucket } = require('mongodb');
const multer = require('multer');
const path = require('path');
const verificationController = require('./controllers/verificationController');



const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;
let gridfsBucket;
let upload; // We'll initialize this after DB connection

// Connect to MongoDB with GridFS
async function connectToMongoDB() {
  try {
    await client.connect();
    db = client.db('tut_marketplace');
    
    // Initialize GridFS Bucket
    gridfsBucket = new GridFSBucket(db, {
      bucketName: 'images'
    });
  
    
    // Create indexes for better performance
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('products').createIndex({ sellerId: 1 });
      await db.collection('products').createIndex({ category: 1 });
      await db.collection('products').createIndex({ sellerCampus: 1 });
      await db.collection('images.files').createIndex({ filename: 1 });
    } catch (indexError) {
    }
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

const requireUpload = (fieldName) => (req, res, next) => {
  if (!upload) {
    return res.status(503).json({
      error: 'Upload service not initialized',
      success: false
    });
  }

  upload.single(fieldName)(req, res, next);
};


// Configure multer storage with GridFS (after DB connection)
function initializeGridFSStorage() {
  const storage = multer.memoryStorage(); // Use memory storage temporarily
  
  upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
      }
    }
  });
  

}

// Helper function to upload buffer to GridFS
async function uploadToGridFS(buffer, filename, mimetype, metadata = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = gridfsBucket.openUploadStream(filename, {
      contentType: mimetype,
      metadata: metadata
    });
    
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      // The file ID is available on the uploadStream itself
      resolve({
        id: uploadStream.id,
        filename: filename,
        contentType: mimetype,
        uploadDate: new Date()
      });
    });
    
    uploadStream.end(buffer);
  });
}

// Database middleware - inject db into all requests
app.use((req, res, next) => {
  req.db = db;
  req.gridfsBucket = gridfsBucket;
  next();
});

// Import controllers and middleware
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const userController = require('./controllers/userController');
const messageController = require('./controllers/messageController');
const referenceController = require('./controllers/referenceController');
const healthController = require('./controllers/healthController');

const { 
  authenticateToken, 
  requireActiveSubscription,
  validateObjectId,
  requireOwnership,
  requireAdmin
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

// Replace ONLY the verification image endpoint in server.js
// This should be placed BEFORE any other /api/verification routes

// THIS MUST COME FIRST - Before any other /api/verification routes
app.get('/api/verification/image/:imageId', async (req, res) => {
  try {
    const imageId = req.params.imageId;
    
    console.log('🖼️ IMAGE REQUEST - imageId:', imageId);

    if (!ObjectId.isValid(imageId)) {
      return res.status(400).send('Invalid image ID');
    }

    const bucket = new GridFSBucket(db, { bucketName: 'verification_images' });

    const files = await db
      .collection('verification_images.files')
      .find({ _id: new ObjectId(imageId) })
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).send('Image not found');
    }

    const file = files[0];

    // FORCE NO CACHE
    res.setHeader('Content-Type', file.contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.removeHeader('ETag');

    const downloadStream = bucket.openDownloadStream(new ObjectId(imageId));
    downloadStream.pipe(res);

  } catch (error) {
    console.error('❌ Image error:', error);
    res.status(500).send('Server error');
  }
});

// Admin: Get all verification requests
app.get(
  '/api/verification-requests',
  authenticateToken,
  requireAdmin,
  (req, res) => verificationController.getVerificationRequests(req, res, req.db)
);

// Admin: Process a verification request
app.post(
  '/api/verification-requests/:requestId/process',
  authenticateToken,
  requireAdmin,
  validateObjectId('requestId'),
  (req, res) => verificationController.processVerificationRequest(req, res, req.db)
);

// User: Submit verification request
app.post(
  '/api/verification/:userId/submit',
  authenticateToken,
  validateObjectId('userId'),
  requireUpload('idPhoto'),
  (req, res) => verificationController.submitVerificationRequest(req, res, req.db)
);

// User: Get verification status
app.get(
  '/api/verification/:userId/status',
  authenticateToken,
  validateObjectId('userId'),
  (req, res) => verificationController.getVerificationStatus(req, res, req.db)
);

// Auth routes
app.post('/api/auth/register', (req, res) => authController.register(req, res, req.db));
app.post('/api/auth/login', (req, res) => authController.login(req, res, req.db));

// User routes
app.get('/api/users/me', authenticateToken, (req, res) => authController.getCurrentUser(req, res, req.db));
app.get('/api/users/:id', authenticateToken, validateObjectId('id'), (req, res) => userController.getUserProfile(req, res, req.db));
app.put('/api/users/:id', authenticateToken, validateObjectId('id'), withOwnershipCheck('user'), (req, res) => userController.updateUserProfile(req, res, req.db));
app.post('/api/users/:id/upgrade', authenticateToken, validateObjectId('id'), withOwnershipCheck('user'), (req, res) => userController.upgradeUserToSeller(req, res, req.db));
app.get('/api/user/subscription-status', authenticateToken, (req, res) => userController.getSubscriptionStatus(req, res, req.db));
// User can create a reactivation request (sent to admin)
app.post('/api/users/:id/reactivate-request', authenticateToken, validateObjectId('id'), (req, res) => {
  return userController.createReactivationRequest(req, res, req.db);
});
// Add this route with your other admin routes
app.get('/api/admin/users', 
  authenticateToken, 
  requireAdmin, 
  (req, res) => userController.getAllUsers(req, res, req.db)
);

// Admin endpoints: list and process reactivation requests
app.get('/api/admin/reactivation-requests', authenticateToken, requireAdmin, (req, res) => {
  return userController.getReactivationRequests(req, res, req.db);
});
app.post('/api/admin/reactivation-requests/:requestId/process',
  authenticateToken,
  requireAdmin,
  validateObjectId('requestId'),
  (req, res) => userController.processReactivationRequest(req, res, req.db)
);

// Product routes
app.get('/api/products', (req, res) => productController.getProducts(req, res, req.db));
app.get('/api/products/:id', validateObjectId('id'), (req, res) => productController.getProductById(req, res, req.db));
app.get('/api/products/seller/:sellerId', validateObjectId('sellerId'), (req, res) => productController.getProductsBySeller(req, res, req.db));

// POST route with GridFS - using upload middleware
app.post('/api/products', authenticateToken, withSubscriptionCheck, (req, res, next) => {upload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({ 
        error: err.message,
        success: false
      });
    }
    
    try {

      
      const { title, description, price, category, type } = req.body;

      // Validation
      if (!title || !description || !price || !category) {
        return res.status(400).json({ 
          error: 'All fields are required',
          success: false
        });
      }

      // Upload image to GridFS if provided
      let imageInfo = null;
      if (req.file) {
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
        
        imageInfo = await uploadToGridFS(
          req.file.buffer,
          filename,
          req.file.mimetype,
          {
            userId: req.user.id,
            originalName: req.file.originalname,
            uploadDate: new Date()
          }
        );
        
      }

      // Create product object with GridFS reference
      const product = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        type: type || 'product',
        sellerId: new ObjectId(req.user.id),
        sellerName: req.userProfile.name,
        sellerCampus: req.userProfile.campus,
        image: imageInfo,
        rating: 0,
        reviews: [],
        status: 'active',
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };


      const result = await db.collection('products').insertOne(product);
      
      const createdProduct = { 
        ...product, 
        _id: result.insertedId,
        imageUrl: imageInfo ? `/api/images/${imageInfo.id}` : null
      };

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        productId: result.insertedId,
        product: createdProduct
      });

    } catch (error) {
      console.error('❌ Create product error:', error);
      // Clean up uploaded file on error
      if (req.file && imageInfo && imageInfo.id) {
        try {
          await req.gridfsBucket.delete(new ObjectId(imageInfo.id));
        } catch (deleteError) {
          console.error('Failed to delete image on error:', deleteError);
        }
      }
      res.status(500).json({ 
        error: 'Failed to create product: ' + error.message,
        success: false
      });
    }
  });
});

// PUT route with GridFS
app.put('/api/products/:id', authenticateToken, validateObjectId('id'), withOwnershipCheck('product'), (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({ 
        error: err.message,
        success: false
      });
    }
    
    try {
      const productId = req.params.id;

      
      const existingProduct = await db.collection('products').findOne({ 
        _id: new ObjectId(productId) 
      });

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

      const { title, description, price, category, type, status, removeImage } = req.body;

      const updateData = { updatedAt: new Date() };
      
      if (title) updateData.title = title.trim();
      if (description) updateData.description = description.trim();
      if (price) updateData.price = parseFloat(price);
      if (category) updateData.category = category;
      if (type) updateData.type = type;
      if (status) updateData.status = status;

      // Handle image update
      if (req.file) {
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(req.file.originalname)}`;
        
        const imageInfo = await uploadToGridFS(
          req.file.buffer,
          filename,
          req.file.mimetype,
          {
            userId: req.user.id,
            originalName: req.file.originalname,
            uploadDate: new Date()
          }
        );
        
        updateData.image = imageInfo;
        
        // Delete old image from GridFS if it exists
        if (existingProduct.image && existingProduct.image.id) {
          try {
            await req.gridfsBucket.delete(new ObjectId(existingProduct.image.id));
          } catch (deleteError) {
            console.error('Failed to delete old image:', deleteError);
          }
        }
      } else if (removeImage === 'true' && existingProduct.image) {
        updateData.image = null;
        
        // Delete old image from GridFS
        if (existingProduct.image.id) {
          try {
            await req.gridfsBucket.delete(new ObjectId(existingProduct.image.id));
          } catch (deleteError) {
            console.error('Failed to delete image:', deleteError);
          }
        }
      }

      const result = await db.collection('products').updateOne(
        { _id: new ObjectId(productId) },
        { $set: updateData }
      );

      // Fetch the updated product to return complete data
      const updatedProduct = await db.collection('products').findOne({ 
        _id: new ObjectId(productId) 
      });

      res.json({
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct,
        imageUrl: updateData.image ? `/api/images/${updateData.image.id}` : null
      });

    } catch (error) {
      console.error('❌ Update product error:', error);
      res.status(500).json({ 
        error: 'Failed to update product: ' + error.message,
        success: false
      });
    }
  });
});

// DELETE route
app.delete('/api/products/:id', authenticateToken, validateObjectId('id'), withOwnershipCheck('product'), async (req, res) => {
  try {
    const productId = req.params.id;

    const existingProduct = await db.collection('products').findOne({ 
      _id: new ObjectId(productId) 
    });

    if (!existingProduct) {
      return res.status(404).json({ 
        error: 'Product not found',
        success: false
      });
    }

    // Delete associated image from GridFS
    if (existingProduct.image && existingProduct.image.id) {
      try {
        await req.gridfsBucket.delete(new ObjectId(existingProduct.image.id));
      } catch (deleteError) {
      }
    }

    const result = await db.collection('products').deleteOne({ 
      _id: new ObjectId(productId) 
    });

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

// Image retrieval endpoints
app.get('/api/images/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    
    if (!ObjectId.isValid(fileId)) {
      return res.status(400).json({ 
        error: 'Invalid image ID',
        success: false
      });
    }

    const files = await db.collection('images.files').find({ 
      _id: new ObjectId(fileId) 
    }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ 
        error: 'Image not found',
        success: false
      });
    }

    const file = files[0];
    
    res.set('Content-Type', file.contentType);
    res.set('Cache-Control', 'public, max-age=31536000');
    
    const downloadStream = req.gridfsBucket.openDownloadStream(new ObjectId(fileId));
    
    downloadStream.pipe(res);
    
    downloadStream.on('error', (error) => {
      console.error('GridFS stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Error streaming image',
          success: false
        });
      }
    });

  } catch (error) {
    console.error('❌ Get image error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve image',
      success: false
    });
  }
});

// Get image by product ID
app.get('/api/products/:id/image', async (req, res) => {
  try {
    const productId = req.params.id;
    
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        success: false
      });
    }

    const product = await db.collection('products').findOne(
      { _id: new ObjectId(productId) },
      { projection: { image: 1 } }
    );

    if (!product || !product.image) {
      return res.status(404).json({ 
        error: 'Image not found',
        success: false
      });
    }

    res.redirect(`/api/images/${product.image.id}`);

  } catch (error) {
    console.error('❌ Get product image error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve product image',
      success: false
    });
  }
});

// Message routes
app.get('/api/messages/:conversationId', authenticateToken, (req, res) => messageController.getMessages(req, res, req.db));
app.post('/api/messages', authenticateToken, (req, res) => messageController.sendMessage(req, res, req.db));

// Reference data routes
app.get('/api/campuses', referenceController.getCampuses);
app.get('/api/categories', referenceController.getCategories);

// Error handling
app.use((err, req, res, next) => {
  console.error('🚨 Server error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    success: false
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    success: false
  });
});

// Start server
const startServer = async () => {
  await connectToMongoDB();
  initializeGridFSStorage(); // Initialize multer AFTER DB connection
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
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