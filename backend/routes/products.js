// routes/products.js - Product management routes
const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

// Import middleware
const { authenticateToken, requireActiveSubscription, requireOwnership } = require('../middleware/auth');
const { 
  validateProduct, 
  validateProductUpdate, 
  validateProductQuery, 
  validateObjectId 
} = require('../middleware/validation');

// Database instance (will be injected)
let db;

const setDatabase = (database) => {
  db = database;
};

// @route   GET /api/products
// @desc    Get products with filtering and pagination
// @access  Public
router.get('/', validateProductQuery, async (req, res) => {
  try {
    const { 
      category, 
      campus, 
      search, 
      type,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1, 
      limit = 12 
    } = req.query;
    
    // Build filter query
    let filter = { status: 'active' };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (campus && campus !== 'all') {
      filter.sellerCampus = campus;
    }
    
    if (type && type !== 'all') {
      filter.type = type;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sellerName: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortObj = {};
    const validSortFields = ['createdAt', 'price', 'rating', 'title'];
    if (validSortFields.includes(sortBy)) {
      sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortObj.createdAt = -1; // Default sort
    }

    // Get total count for pagination
    const total = await db.collection('products').countDocuments(filter);
    
    // Get products with pagination
    const products = await db.collection('products')
      .find(filter)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .toArray();

    // Increment view count for search queries
    if (search && products.length > 0) {
      const productIds = products.map(p => p._id);
      await db.collection('products').updateMany(
        { _id: { $in: productIds } },
        { $inc: { views: 1 } }
      );
    }

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
        limit: parseInt(limit)
      },
      filters: {
        category,
        campus,
        search,
        type,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve products',
      code: 'GET_PRODUCTS_FAILED'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', validateObjectId('id'), async (req, res) => {
  try {
    const productId = req.params.id;
    
    const product = await db.collection('products')
      .findOne({ _id: new ObjectId(productId) });
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    // Increment view count
    await db.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      { 
        $inc: { views: 1 },
        $set: { lastViewedAt: new Date() }
      }
    );

    // Get seller information
    const seller = await db.collection('users').findOne(
      { _id: product.sellerId },
      { 
        projection: { 
          name: 1, 
          campus: 1, 
          rating: 1, 
          totalRatings: 1,
          joinedAt: 1,
          profilePicture: 1
        } 
      }
    );

    if (seller) {
      product.seller = seller;
    }

    // Get related products (same category, different seller)
    const relatedProducts = await db.collection('products')
      .find({
        category: product.category,
        sellerId: { $ne: product.sellerId },
        status: 'active',
        _id: { $ne: product._id }
      })
      .limit(4)
      .toArray();

    product.relatedProducts = relatedProducts;
    product.views = (product.views || 0) + 1;

    res.json(product);

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve product',
      code: 'GET_PRODUCT_FAILED'
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Sellers only)
router.post('/', authenticateToken, requireActiveSubscription, validateProduct, async (req, res) => {
  try {
    const { title, description, price, category, type } = req.body;

    // Get seller information
    const seller = req.userProfile;

    // Create product object
    const product = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      type: type || 'product',
      sellerId: new ObjectId(req.user.id),
      sellerName: seller.name,
      sellerCampus: seller.campus,
      rating: 0,
      totalRatings: 0,
      reviews: [],
      images: [], // Will be populated when image upload is implemented
      views: 0,
      favorites: 0,
      status: 'active',
      featured: false,
      tags: [],
      lastViewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('products').insertOne(product);
    
    if (!result.insertedId) {
      throw new Error('Failed to create product');
    }

    // Increment seller's product count
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { 
        $inc: { totalProducts: 1 },
        $set: { updatedAt: new Date() }
      }
    );

    const createdProduct = { ...product, _id: result.insertedId };
    
    console.log(`New product created: ${title} by ${seller.name} (${seller.campus})`);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId: result.insertedId,
      product: createdProduct
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      error: 'Failed to create product',
      code: 'CREATE_PRODUCT_FAILED'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Product owner only)
router.put('/:id', authenticateToken, validateObjectId('id'), requireOwnership('product'), validateProductUpdate, async (req, res) => {
  try {
    const productId = req.params.id;
    const { title, description, price, category, type, status } = req.body;

    // Build update object
    const updateData = {
      updatedAt: new Date()
    };

    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (price) updateData.price = parseFloat(price);
    if (category) updateData.category = category;
    if (type) updateData.type = type;
    if (status) updateData.status = status;
    id

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ 
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    // Get updated product
    const updatedProduct = await db.collection('products')
      .findOne({ _id: new ObjectId(productId) });

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      error: 'Failed to update product',
      code: 'UPDATE_PRODUCT_FAILED'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Product owner only)
router.delete('/:id', authenticateToken, validateObjectId('id'), requireOwnership('product'), async (req, res) => {
  try {
    const productId = req.params.id;

    const result = await db.collection('products').deleteOne({ 
      _id: new ObjectId(productId) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    // Decrement seller's product count
    await db.collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { 
        $inc: { totalProducts: -1 },
        $set: { updatedAt: new Date() }
      }
    );

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      error: 'Failed to delete product',
      code: 'DELETE_PRODUCT_FAILED'
    });
  }
});

// @route   POST /api/products/:id/favorite
// @desc    Add/remove product from favorites
// @access  Private
router.post('/:id/favorite', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;

    const product = await db.collection('products')
      .findOne({ _id: new ObjectId(productId) });
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      });
    }

    // Check if already favorited
    const existingFavorite = await db.collection('favorites').findOne({
      userId: new ObjectId(userId),
      productId: new ObjectId(productId)
    });

    if (existingFavorite) {
      // Remove from favorites
      await db.collection('favorites').deleteOne({
        userId: new ObjectId(userId),
        productId: new ObjectId(productId)
      });

      await db.collection('products').updateOne({
        _id: new ObjectId(productId)
      }, {
        $inc: { favorites: -1 }
      });

      return res.json({
        success: true,
        message: 'Product removed from favorites'
      });
    } else {
      // Add to favorites
      await db.collection('favorites').insertOne({
        userId: new ObjectId(userId),
        productId: new ObjectId(productId),
        createdAt: new Date()
      });

      await db.collection('products').updateOne({
        _id: new ObjectId(productId)
      }, {
        $inc: { favorites: 1 }
      });

      return res.json({
        success: true,
        message: 'Product added to favorites'
      });
    }

  } catch (error) {
    console.error('Favorite product error:', error);
    res.status(500).json({ 
      error: 'Failed to update favorites',
      code: 'FAVORITE_PRODUCT_FAILED'
    });
  }
});

module.exports = { router, setDatabase };