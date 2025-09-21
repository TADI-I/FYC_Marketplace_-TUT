// middleware/auth.js - Authentication middleware
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

// Get database instance (will be injected from server.js)
let db;

const setDatabase = (database) => {
  db = database;
};

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'TOKEN_REQUIRED'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'tut_marketplace_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user has active subscription
const requireActiveSubscription = async (req, res, next) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(req.user.id) 
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is a seller with active subscription
    if (user.type !== 'seller' || !user.subscribed) {
      return res.status(403).json({ 
        error: 'Active seller subscription required',
        code: 'SUBSCRIPTION_REQUIRED'
      });
    }

    // Check if subscription has expired
    if (user.subscriptionEndDate && new Date() > new Date(user.subscriptionEndDate)) {
      // Update user status to expired
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
        error: 'Subscription has expired. Please renew to continue selling.',
        code: 'SUBSCRIPTION_EXPIRED'
      });
    }

    // Add user profile to request for use in other middleware/routes
    req.userProfile = user;
    next();

  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Error checking subscription status' });
  }
};

// Middleware to check if user owns the resource
const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!db) {
        return res.status(500).json({ error: 'Database connection not available' });
      }

      const resourceId = req.params.id;
      let resource;

      // Check ownership based on resource type
      switch (resourceType) {
        case 'product':
          resource = await db.collection('products').findOne({
            _id: new ObjectId(resourceId)
          });
          if (!resource) {
            return res.status(404).json({ error: 'Product not found' });
          }
          if (resource.sellerId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You can only modify your own products' });
          }
          break;

        case 'user':
          if (resourceId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You can only modify your own profile' });
          }
          break;

        default:
          return res.status(400).json({ error: 'Invalid resource type' });
      }

      req.resource = resource;
      next();

    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ error: 'Error checking resource ownership' });
    }
  };
};

// Middleware to check if user has admin privileges
const requireAdmin = async (req, res, next) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(req.user.id) 
    });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Admin privileges required',
        code: 'ADMIN_REQUIRED'
      });
    }

    next();

  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Error checking admin privileges' });
  }
};

// Middleware to validate TUT email
const validateTUTEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (!email || !email.endsWith('@tut.ac.za')) {
    return res.status(400).json({ 
      error: 'Please use a valid TUT email address (@tut.ac.za)',
      code: 'INVALID_EMAIL'
    });
  }
  
  next();
};

// Rate limiting middleware for sensitive operations
const createRateLimit = (windowMs, max, message) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip + (req.user ? req.user.id : '');
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old requests
    for (const [reqKey, timestamps] of requests.entries()) {
      const filteredTimestamps = timestamps.filter(time => time > windowStart);
      if (filteredTimestamps.length === 0) {
        requests.delete(reqKey);
      } else {
        requests.set(reqKey, filteredTimestamps);
      }
    }
    
    // Check current requests
    const userRequests = requests.get(key) || [];
    
    if (userRequests.length >= max) {
      return res.status(429).json({ 
        error: message || 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    userRequests.push(now);
    requests.set(key, userRequests);
    
    next();
  };
};

// Predefined rate limiters
const loginRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many login attempts, please try again in 15 minutes'
);

const registerRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  3, // 3 registrations
  'Too many registration attempts, please try again in 1 hour'
);

const messageRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  10, // 10 messages
  'You are sending messages too quickly, please slow down'
);

module.exports = {
  setDatabase,
  authenticateToken,
  requireActiveSubscription,
  requireOwnership,
  requireAdmin,
  validateTUTEmail,
  loginRateLimit,
  registerRateLimit,
  messageRateLimit
};