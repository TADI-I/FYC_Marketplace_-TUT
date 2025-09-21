// routes/auth.js - Authentication routes
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const router = express.Router();

// Import middleware
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { loginRateLimit, registerRateLimit, validateTUTEmail } = require('../middleware/auth');

// Database instance (will be injected)
let db;

const setDatabase = (database) => {
  db = database;
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id.toString(), 
      email: user.email, 
      type: user.type,
      campus: user.campus
    },
    process.env.JWT_SECRET || 'tut_marketplace_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerRateLimit, validateTUTEmail, validateRegistration, async (req, res) => {
  try {
    const { name, email, password, userType, campus } = req.body;

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'A user with this email address already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Calculate subscription dates for sellers
    const isSellerType = userType === 'seller';
    const subscriptionStartDate = isSellerType ? new Date() : null;
    const subscriptionEndDate = isSellerType ? 
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null; // 30 days

    // Create user object
    const newUser = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      type: userType,
      campus,
      subscribed: isSellerType,
      subscriptionStartDate,
      subscriptionEndDate,
      subscriptionStatus: isSellerType ? 'active' : null,
      role: 'user', // Default role
      isEmailVerified: false,
      profilePicture: null,
      phone: null,
      bio: null,
      rating: 0,
      totalRatings: 0,
      totalSales: 0,
      joinedAt: new Date(),
      lastLoginAt: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert user into database
    const result = await db.collection('users').insertOne(newUser);
    
    if (!result.insertedId) {
      throw new Error('Failed to create user account');
    }

    // Generate JWT token
    const user = { ...newUser, _id: result.insertedId };
    const token = generateToken(user);

    // Prepare response (exclude password)
    const { password: _, ...userResponse } = user;
    userResponse._id = result.insertedId;

    // Log successful registration
    console.log(`New user registered: ${email} (${userType}) - Campus: ${campus}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: userResponse,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed. Please try again.',
      code: 'REGISTRATION_FAILED'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginRateLimit, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await db.collection('users').findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ 
        error: 'Account has been deactivated. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if subscription has expired for sellers
    if (user.type === 'seller' && user.subscriptionEndDate) {
      if (new Date() > new Date(user.subscriptionEndDate)) {
        // Update user status to expired
        await db.collection('users').updateOne(
          { _id: user._id },
          { 
            $set: { 
              subscribed: false, 
              type: 'customer',
              subscriptionStatus: 'expired',
              updatedAt: new Date()
            } 
          }
        );
        
        // Update user object for response
        user.subscribed = false;
        user.type = 'customer';
        user.subscriptionStatus = 'expired';
      }
    }

    // Update last login time
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLoginAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    // Generate JWT token
    const token = generateToken(user);

    // Prepare response (exclude password)
    const { password: _, ...userResponse } = user;

    // Log successful login
    console.log(`User logged in: ${email} - IP: ${req.ip}`);

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed. Please try again.',
      code: 'LOGIN_FAILED'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Refresh token required',
        code: 'TOKEN_REQUIRED'
      });
    }

    // Verify the existing token (even if expired)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'tut_marketplace_secret');
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        // Allow refresh for expired tokens
        decoded = jwt.decode(token);
      } else {
        return res.status(403).json({ 
          error: 'Invalid token',
          code: 'TOKEN_INVALID'
        });
      }
    }

    // Get current user data
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.id) 
    });

    if (!user || !user.isActive) {
      return res.status(404).json({ 
        error: 'User not found or account deactivated',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new token
    const newToken = generateToken(user);

    // Prepare response (exclude password)
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      user: userResponse,
      token: newToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      error: 'Token refresh failed',
      code: 'REFRESH_FAILED'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', (req, res) => {
  // In a JWT system, logout is typically handled client-side
  // by removing the token from storage. This endpoint is for
  // consistency and potential future token blacklisting.
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.endsWith('@tut.ac.za')) {
      return res.status(400).json({ 
        error: 'Please provide a valid TUT email address',
        code: 'INVALID_EMAIL'
      });
    }

    const user = await db.collection('users').findOne({ 
      email: email.toLowerCase().trim() 
    });

    // Don't reveal if email exists or not for security
    res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.'
    });

    // If user exists, you would typically send an email here
    if (user) {
      // TODO: Implement email sending logic
      console.log(`Password reset requested for: ${email}`);
    }

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ 
      error: 'Password reset request failed',
      code: 'RESET_FAILED'
    });
  }
});

// @route   GET /api/auth/verify-token
// @desc    Verify if token is valid
// @access  Private
router.get('/verify-token', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        valid: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tut_marketplace_secret');
    
    // Check if user still exists and is active
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.id) 
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        valid: false,
        error: 'User not found or account deactivated'
      });
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        type: user.type,
        campus: user.campus,
        subscribed: user.subscribed
      }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        valid: false,
        error: 'Token expired'
      });
    }
    
    return res.status(401).json({ 
      valid: false,
      error: 'Invalid token'
    });
  }
});

module.exports = {
  router,
  setDatabase
};