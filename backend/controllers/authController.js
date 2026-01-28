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
    const { name, email, password, campus, whatsapp } = req.body;

    // simple normalize whatsapp: remove non-digits, allow leading country code (E.164 expected)
    const normalizedWhatsapp = whatsapp ? String(whatsapp).replace(/\D/g, '') : null;

    // Validation
    if (!name || !email || !password || !campus) {
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
    const userDoc = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      campus: campus || null,
      type: 'buyer',
      subscribed: false,
      subscriptionStatus: 'expired',
      createdAt: new Date(),
      // store normalized whatsapp (or null)
      whatsapp: normalizedWhatsapp,
      password: hashedPassword,
      updatedAt: new Date()
    };

    console.log('💾 Inserting user:', { ...userDoc, password: '[HIDDEN]' });

    // Insert user
    const result = await db.collection('users').insertOne(userDoc);
    userDoc._id = result.insertedId;

    // ✅ CREATE JWT TOKEN (THIS WAS MISSING!)
    const token = jwt.sign(
      { 
        id: userDoc._id.toString(), 
        email: userDoc.email, 
        type: userDoc.type, 
        campus: userDoc.campus 
      },
      process.env.JWT_SECRET || 'tut_marketplace_secret',
      { expiresIn: '7d' }
    );

    // Build safe user object (same fields as login)
    const safeUser = {
      _id: userDoc._id,
      name: userDoc.name,
      email: userDoc.email,
      type: userDoc.type,
      campus: userDoc.campus,
      subscribed: userDoc.subscribed,
      subscriptionStatus: userDoc.subscriptionStatus,
      subscriptionStartDate: userDoc.subscriptionStartDate,
      subscriptionEndDate: userDoc.subscriptionEndDate,
      whatsapp: userDoc.whatsapp || null,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt
    };

    console.log('✅ User registered successfully:', email);

    // ✅ RETURN TOKEN (THIS WAS MISSING!)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: safeUser,
      token  // ← THIS IS THE FIX!
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

    // Build safe user object (mirror getCurrentUser) so client always receives the same fields
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
      campus: user.campus,
      subscribed: user.subscribed,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      whatsapp: user.whatsapp || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
 
    console.log('✅ User logged in successfully:', email);
 
    res.json({
      success: true,
      message: 'Login successful',
      user: safeUser,
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
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    // Use the ObjectId already imported at the top of the file
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(userId) 
    });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // only return safe fields (include whatsapp)
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      type: user.type,
      campus: user.campus,
      subscribed: user.subscribed,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      whatsapp: user.whatsapp || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('getCurrentUser error', err);
    res.status(500).json({ success: false, error: 'Failed to fetch current user' });
  }
};