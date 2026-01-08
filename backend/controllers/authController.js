// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

// Validation helpers
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidCampus = (campus) => {
  const validCampuses = [
    'pretoria-main', 'soshanguve-S', 'soshanguve-N', 'ga-rankuwa', 'pretoria-west',
    'arts', 'emalahleni', 'mbombela', 'polokwane'
  ];
  return validCampuses.includes(campus);
};

// Register controller
exports.register = async (req, res, db) => {
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

    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        error: 'Please use a valid email address',
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
};

// Login controller
exports.login = async (req, res, db) => {
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
};

// Get current user
exports.getCurrentUser = async (req, res, db) => {
  try {
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        success: false
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to get user: ' + error.message,
      success: false
    });
  }
};