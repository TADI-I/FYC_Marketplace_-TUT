// controllers/analyticsController.js
const { ObjectId } = require('mongodb');

// Track WhatsApp redirect
exports.trackWhatsAppClick = async (req, res, db) => {
  try {
    const { productId } = req.params;
    
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        success: false
      });
    }

    // Increment whatsappRedirects counter
    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      { 
        $inc: { whatsappRedirects: 1 },
        $set: { lastRedirectAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        error: 'Product not found',
        success: false
      });
    }

    // Optionally, log the redirect for analytics
    await db.collection('analytics_events').insertOne({
      eventType: 'whatsapp_redirect',
      productId: new ObjectId(productId),
      timestamp: new Date(),
      userAgent: req.headers['user-agent'] || 'unknown',
      // If you want to track which user clicked (optional)
      userId: req.user ? new ObjectId(req.user.id) : null
    });

    res.json({
      success: true,
      message: 'Redirect tracked successfully'
    });

  } catch (error) {
    console.error('❌ Track WhatsApp click error:', error);
    res.status(500).json({ 
      error: 'Failed to track redirect',
      success: false
    });
  }
};

// Get product analytics (for seller to view)
exports.getProductAnalytics = async (req, res, db) => {
  try {
    const { productId } = req.params;
    
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        success: false
      });
    }

    const product = await db.collection('products').findOne(
      { _id: new ObjectId(productId) },
      { projection: { whatsappRedirects: 1, views: 1, lastRedirectAt: 1, createdAt: 1 } }
    );

    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        success: false
      });
    }

    // Get redirect history from analytics events (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRedirects = await db.collection('analytics_events')
      .find({
        eventType: 'whatsapp_redirect',
        productId: new ObjectId(productId),
        timestamp: { $gte: thirtyDaysAgo }
      })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();

    res.json({
      success: true,
      analytics: {
        totalWhatsAppClicks: product.whatsappRedirects || 0,
        totalViews: product.views || 0,
        lastRedirectAt: product.lastRedirectAt || null,
        createdAt: product.createdAt,
        recentRedirects: recentRedirects.map(r => ({
          timestamp: r.timestamp,
          userAgent: r.userAgent
        }))
      }
    });

  } catch (error) {
    console.error('❌ Get product analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve analytics',
      success: false
    });
  }
};