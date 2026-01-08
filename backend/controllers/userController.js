// controllers/userController.js
const { ObjectId } = require('mongodb');

// Get subscription status
exports.getSubscriptionStatus = async (req, res, db) => {
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
};

// Update user profile
exports.updateUserProfile = async (req, res, db) => {
  try {
    const userId = req.params.id;
    console.log('✏️ Updating user profile for user ID:', userId);
    console.log('👤 Authenticated user ID:', req.user.id);
    console.log('📦 Request body:', req.body);
    
    const { name, campus, email } = req.body;

    // Validation
    if (!name?.trim()) {
      return res.status(400).json({ 
        error: 'Name is required',
        success: false,
        code: 'NAME_REQUIRED'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Please enter a valid email address',
        success: false,
        code: 'INVALID_EMAIL_FORMAT'
      });
    }

    // Check if email already exists (for different user)
    const existingUser = await db.collection('users').findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: new ObjectId(userId) }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Email already exists. Please use a different email.',
        success: false,
        code: 'EMAIL_EXISTS'
      });
    }

    // Build update object
    const updateData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      updatedAt: new Date()
    };

    // Only include campus if provided
    if (campus) updateData.campus = campus;

    console.log('📤 Update data:', updateData);

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    console.log('✅ MongoDB update result:', result);

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        error: 'User not found',
        success: false,
        code: 'USER_NOT_FOUND'
      });
    }

    // Get updated user to return complete data
    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    console.log('✅ User profile updated successfully');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    
    // Handle invalid ObjectId error
    if (error.message.includes('ObjectId') || error.message.includes('hex string')) {
      return res.status(400).json({ 
        error: 'Invalid user ID format',
        success: false,
        code: 'INVALID_USER_ID'
      });
    }

    res.status(500).json({ 
      error: 'Failed to update profile',
      success: false,
      code: 'UPDATE_FAILED'
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res, db) => {
  try {
    const userId = req.params.id;
    console.log('👤 Getting user profile for ID:', userId);
    
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        error: 'Invalid user ID',
        success: false
      });
    }

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
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
    console.error('❌ Get user profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get user profile: ' + error.message,
      success: false
    });
  }
};

// Upgrade user to seller
exports.upgradeUserToSeller = async (req, res, db) => {
  try {
    const userId = req.params.id;
    const { subscriptionType = 'monthly' } = req.body;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        error: 'Invalid user ID',
        success: false
      });
    }

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) }
    );

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        success: false
      });
    }

    // Calculate subscription end date
    const subscriptionDays = subscriptionType === 'monthly' ? 30 : 365;
    const subscriptionEndDate = new Date(Date.now() + subscriptionDays * 24 * 60 * 60 * 1000);

    const updateData = {
      type: 'seller',
      subscribed: true,
      subscriptionType,
      subscriptionStartDate: new Date(),
      subscriptionEndDate,
      subscriptionStatus: 'active',
      updatedAt: new Date()
    };

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    res.json({
      success: true,
      message: 'Account upgraded to seller successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Upgrade user error:', error);
    res.status(500).json({ 
      error: 'Failed to upgrade account: ' + error.message,
      success: false
    });
  }
};