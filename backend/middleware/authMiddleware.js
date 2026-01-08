// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

// JWT authentication middleware
exports.authenticateToken = (req, res, next) => {
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
exports.requireActiveSubscription = async (req, res, next, db) => {
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

// Validate ObjectId middleware
exports.validateObjectId = (paramName) => (req, res, next) => {
  const id = req.params[paramName];
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ 
      error: `Invalid ${paramName} ID format`,
      success: false
    });
  }
  next();
};

// Check ownership middleware
exports.requireOwnership = (resourceType) => async (req, res, next, db) => {
  try {
    const userId = req.user.id;
    const resourceId = req.params.id;
    
    let resource;
    
    switch(resourceType) {
      case 'user':
        resource = await db.collection('users').findOne({ _id: new ObjectId(resourceId) });
        break;
      case 'product':
        resource = await db.collection('products').findOne({ _id: new ObjectId(resourceId) });
        break;
      default:
        return res.status(500).json({ 
          error: 'Invalid resource type',
          success: false
        });
    }
    
    if (!resource) {
      return res.status(404).json({ 
        error: `${resourceType} not found`,
        success: false
      });
    }
    
    // Check if user owns the resource
    const ownerId = resourceType === 'user' ? resource._id.toString() : resource.sellerId.toString();
    
    if (ownerId !== userId && req.user.type !== 'admin') {
      return res.status(403).json({ 
        error: `You do not have permission to access this ${resourceType}`,
        success: false
      });
    }
    
    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    res.status(500).json({ 
      error: 'Error checking ownership',
      success: false
    });
  }
};