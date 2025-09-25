// routes/users.js - User management routes
const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

// Import middleware
const { authenticateToken, requireOwnership, requireAdmin } = require('../middleware/auth');
const { validateProfileUpdate, validateObjectId } = require('../middleware/validation');

// Database instance (will be injected)
let db;

const setDatabase = (database) => {
  db = database;
};

// @route   GET /api/users
// @desc    Get all users (admin only) or search users
// @access  Private (Admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, campus, type, page = 1, limit = 20 } = req.query;
    
    // Build filter
    let filter = { isActive: true };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (campus && campus !== 'all') {
      filter.campus = campus;
    }
    
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Get total count
    const total = await db.collection('users').countDocuments(filter);
    
    // Get users with pagination
    const users = await db.collection('users')
      .find(filter, { 
        projection: { 
          password: 0, // Exclude password
          subscriptionStartDate: 0,
          subscriptionEndDate: 0
        } 
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .toArray();

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve users',
      code: 'GET_USERS_FAILED'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId), isActive: true },
      { 
        projection: { 
          password: 0, // Always exclude password
          // Include subscription info only for the user themselves or admins
          ...(req.user.id !== userId && req.user.role !== 'admin' && {
            subscriptionStartDate: 0,
            subscriptionEndDate: 0,
            subscriptionStatus: 0
          })
        } 
      }
    );
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Get user's products count if it's a seller
    if (user.type === 'seller') {
      const productCount = await db.collection('products').countDocuments({
        sellerId: new ObjectId(userId),
        status: 'active'
      });
      user.activeProducts = productCount;
    }

    res.json(user);

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve user profile',
      code: 'GET_USER_FAILED'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (Own profile only, unless admin)
router.put('/:id', authenticateToken, validateObjectId('id'), requireOwnership('user'), validateProfileUpdate, async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, campus, email} = req.body;

    // Build update object
    const updateData = {
      updatedAt: new Date()
    };

    if (name) updateData.name = name.trim();
    if (campus) updateData.campus = campus;
    if (email) updateData.email = email.trim().toLowerCase();

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Get updated user
    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      code: 'UPDATE_USER_FAILED'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Deactivate user account
// @access  Private (Own account only, unless admin)
router.delete('/:id', authenticateToken, validateObjectId('id'), requireOwnership('user'), async (req, res) => {
  try {
    const userId = req.params.id;

    // Soft delete - deactivate account instead of permanently deleting
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          isActive: false,
          deactivatedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Deactivate all user's products
    await db.collection('products').updateMany(
      { sellerId: new ObjectId(userId) },
      { 
        $set: { 
          status: 'inactive',
          updatedAt: new Date()
        } 
      }
    );

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      error: 'Failed to deactivate account',
      code: 'DELETE_USER_FAILED'
    });
  }
});

// @route   GET /api/users/:id/products
// @desc    Get products by user ID
// @access  Private
router.get('/:id/products', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { status = 'active', page = 1, limit = 12 } = req.query;
    
    // Build filter
    let filter = { sellerId: new ObjectId(userId) };
    
    if (status !== 'all') {
      filter.status = status;
    }
    
    // Only show all statuses to the seller themselves or admins
    if (req.user.id !== userId && req.user.role !== 'admin') {
      filter.status = 'active';
    }

    // Get total count
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
    console.error('Get user products error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve user products',
      code: 'GET_USER_PRODUCTS_FAILED'
    });
  }
});

// @route   GET /api/users/:id/stats
// @desc    Get user statistics (sales, ratings, etc.)
// @access  Private
router.get('/:id/stats', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verify user exists
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId), isActive: true },
      { projection: { name: 1, type: 1, joinedAt: 1 } }
    );
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const stats = {
      user: user,
      totalProducts: 0,
      activeProducts: 0,
      soldProducts: 0,
      totalViews: 0,
      totalMessages: 0,
      averageRating: 0,
      totalRatings: 0
    };

    if (user.type === 'seller') {
      // Get product statistics
      const productStats = await db.collection('products').aggregate([
        { $match: { sellerId: new ObjectId(userId) } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { 
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } 
            },
            sold: { 
              $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] } 
            },
            totalViews: { $sum: '$views' },
            avgRating: { $avg: '$rating' },
            totalRatings: { $sum: '$totalRatings' }
          }
        }
      ]).toArray();

      if (productStats.length > 0) {
        const productStat = productStats[0];
        stats.totalProducts = productStat.total;
        stats.activeProducts = productStat.active;
        stats.soldProducts = productStat.sold;
        stats.totalViews = productStat.totalViews || 0;
        stats.averageRating = Math.round((productStat.avgRating || 0) * 10) / 10;
        stats.totalRatings = productStat.totalRatings || 0;
      }

      // Get message statistics
      const messageCount = await db.collection('messages').countDocuments({
        $or: [
          { senderId: new ObjectId(userId) },
          { receiverId: new ObjectId(userId) }
        ]
      });
      stats.totalMessages = messageCount;
    }

    res.json(stats);

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve user statistics',
      code: 'GET_USER_STATS_FAILED'
    });
  }
});

// @route   POST /api/users/:id/upgrade
// @desc    Upgrade user to seller (initiate payment)
// @access  Private
router.post('/:id/upgrade', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { subscriptionType = 'monthly' } = req.body;

    // Verify user can upgrade their own account
    if (req.user.id !== userId) {
      return res.status(403).json({ 
        error: 'You can only upgrade your own account',
        code: 'UNAUTHORIZED_UPGRADE'
      });
    }

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId), isActive: true }
    );
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.type === 'seller' && user.subscribed) {
      return res.status(400).json({ 
        error: 'User already has an active seller subscription',
        code: 'ALREADY_SELLER'
      });
    }

    // Calculate subscription details
    const amount = subscriptionType === 'annual' ? 990 : 99;
    const paymentReference = `TUT_${userId}_${Date.now()}`;
    const startDate = new Date();
    const endDate = new Date();
    
    if (subscriptionType === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // TODO: Integrate with PayFast payment gateway
    // For now, we'll simulate successful payment in development
    if (process.env.NODE_ENV === 'development') {
      // Simulate payment success in development
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            type: 'seller',
            subscribed: true,
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
            subscriptionStatus: 'active',
            updatedAt: new Date()
          }
        }
      );

      return res.json({
        success: true,
        message: 'Upgrade successful (development mode)',
        subscriptionType,
        amount,
        paymentReference
      });
    }

    // In production, return payment URL
    res.json({
      success: true,
      message: 'Payment initiation required',
      paymentReference,
      amount,
      subscriptionType,
      // paymentUrl: 'https://www.payfast.co.za/eng/process?...' // PayFast URL
    });

  } catch (error) {
    console.error('User upgrade error:', error);
    res.status(500).json({ 
      error: 'Failed to initiate upgrade',
      code: 'UPGRADE_FAILED'
    });
  }
});

// @route   GET /api/users/:id/subscription-status
// @desc    Get user subscription status
// @access  Private
router.get('/:id/subscription-status', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const userId = req.params.id;

    // Users can only check their own subscription status unless admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'You can only check your own subscription status',
        code: 'UNAUTHORIZED_ACCESS'
      });
    }

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId), isActive: true },
      { 
        projection: { 
          type: 1, 
          subscribed: 1, 
          subscriptionStatus: 1,
          subscriptionStartDate: 1,
          subscriptionEndDate: 1
        } 
      }
    );
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    const hasActiveSubscription = user.subscribed && 
      user.type === 'seller' &&
      (!user.subscriptionEndDate || new Date() <= new Date(user.subscriptionEndDate));

    res.json({
      hasActiveSubscription,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      canSell: hasActiveSubscription,
      userType: user.type
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ 
      error: 'Failed to check subscription status',
      code: 'SUBSCRIPTION_CHECK_FAILED'
    });
  }
});

module.exports = {
  router,
  setDatabase
};