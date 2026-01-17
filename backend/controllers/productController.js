// controllers/productController.js
const { ObjectId } = require('mongodb');

const isValidCategory = (category) => {
  const validCategories = [
    'books', 'electronics', 'services', 'clothing', 'food', 'transport', 'accommodation', 'other'
  ];
  return validCategories.includes(category);
};

// Get all products
exports.getProducts = async (req, res, db) => {
  try {
    console.log('📦 Getting products with filters:', req.query);
    
    const { category, campus, search, page = 1, limit = 12 } = req.query;
    
    // Build filter query (products status)
    let filter = { status: 'active' };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (campus && campus !== 'all') {
      filter.sellerCampus = campus;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('🔍 Filter:', filter);

    // Aggregation pipeline to exclude products whose seller account is not active
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageLimit = Math.max(parseInt(limit, 10) || 12, 1);
    const skip = (pageNum - 1) * pageLimit;
    const now = new Date();

    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'seller'
        }
      },
      { $unwind: '$seller' },
      // seller must be subscribed and subscription not expired (or no end date)
      {
        $match: {
          'seller.subscribed': true,
          $or: [
            { 'seller.subscriptionEndDate': { $exists: false } },
            { 'seller.subscriptionEndDate': { $gte: now } }
          ]
        }
      },
      // project seller fields removed to keep response shape similar
      { $project: { seller: 0 } },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: pageLimit }
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ];

    const aggResult = await db.collection('products').aggregate(pipeline).toArray();
    const facet = aggResult[0] || { data: [], totalCount: [] };
    const products = facet.data || [];
    const total = (facet.totalCount[0] && facet.totalCount[0].count) ? facet.totalCount[0].count : 0;

    console.log(`✅ Returning ${products.length} products (filtered) out of ${total} total`);

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / pageLimit),
        totalProducts: total,
        hasNext: pageNum * pageLimit < total,
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve products: ' + error.message,
      success: false
    });
  }
};

// Get single product
exports.getProductById = async (req, res, db) => {
  try {
    const productId = req.params.id;
    console.log('📦 Getting product:', productId);
    
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        success: false
      });
    }
    
    // Lookup product and seller, ensure seller active
    const pipeline = [
      { $match: { _id: new ObjectId(productId), status: 'active' } },
      {
        $lookup: {
          from: 'users',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'seller'
        }
      },
      { $unwind: '$seller' },
      {
        $match: {
          'seller.subscribed': true,
          $or: [
            { 'seller.subscriptionEndDate': { $exists: false } },
            { 'seller.subscriptionEndDate': { $gte: new Date() } }
          ]
        }
      },
      { $project: { seller: 0 } }
    ];

    const results = await db.collection('products').aggregate(pipeline).toArray();
    const product = results[0];

    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        success: false
      });
    }

    console.log('✅ Product found:', product.title);
    
    res.json({
      success: true,
      ...product
    });

  } catch (error) {
    console.error('❌ Get product error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve product: ' + error.message,
      success: false
    });
  }
};

// Get products by seller
exports.getProductsBySeller = async (req, res, db) => {
  try {
    const sellerId = req.params.sellerId;
    console.log('📦 Getting products for seller:', sellerId);
    
    if (!ObjectId.isValid(sellerId)) {
      return res.status(400).json({ 
        error: 'Invalid seller ID',
        success: false
      });
    }

    // Ensure seller exists and is active
    const seller = await db.collection('users').findOne({ _id: new ObjectId(sellerId) });
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found', success: false });
    }
    const hasActiveSubscription = seller.subscribed && (!seller.subscriptionEndDate || new Date() <= new Date(seller.subscriptionEndDate));
    if (!hasActiveSubscription) {
      return res.status(404).json({ error: 'Seller account not active', success: false });
    }

    const products = await db.collection('products')
      .find({ 
        sellerId: new ObjectId(sellerId),
        status: 'active'
      })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`✅ Found ${products.length} products for seller ${sellerId}`);
    
    res.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('❌ Get seller products error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve seller products: ' + error.message,
      success: false
    });
  }
};

// Create product
exports.createProduct = async (req, res, db) => {
  try {
    console.log('➕ Creating product:', req.body);
    console.log('👤 User:', req.user);
    
    const { title, description, price, category, type } = req.body;

    // Validation
    if (!title || !description || !price || !category) {
      return res.status(400).json({ 
        error: 'All fields are required',
        success: false
      });
    }

    if (!isValidCategory(category)) {
      return res.status(400).json({ 
        error: 'Invalid category',
        success: false
      });
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return res.status(400).json({ 
        error: 'Price must be a positive number',
        success: false
      });
    }

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
      reviews: [],
      images: [],
      status: 'active',
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('💾 Inserting product:', product);

    const result = await db.collection('products').insertOne(product);
    console.log('✅ Product insertion result:', result.insertedId);
    
    const createdProduct = { ...product, _id: result.insertedId };

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId: result.insertedId,
      product: createdProduct
    });

  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({ 
      error: 'Failed to create product: ' + error.message,
      success: false
    });
  }
};

// Update product
exports.updateProduct = async (req, res, db) => {
  try {
    const productId = req.params.id;
    console.log('✏️ Updating product:', productId);
    
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        success: false
      });
    }

    // Check if product exists and user owns it
    const existingProduct = await db.collection('products')
      .findOne({ _id: new ObjectId(productId) });

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

    const { title, description, price, category, type, status } = req.body;

    // Build update object
    const updateData = { updatedAt: new Date() };
    
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (price) updateData.price = parseFloat(price);
    if (category && isValidCategory(category)) updateData.category = category;
    if (type) updateData.type = type;
    if (status) updateData.status = status;

    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(productId) },
      { $set: updateData }
    );

    console.log('✅ Product updated');

    res.json({
      success: true,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({ 
      error: 'Failed to update product: ' + error.message,
      success: false
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res, db) => {
  try {
    const productId = req.params.id;
    console.log('🗑️ Deleting product:', productId);
    
    if (!ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        error: 'Invalid product ID',
        success: false
      });
    }

    // Check if product exists and user owns it
    const existingProduct = await db.collection('products')
      .findOne({ _id: new ObjectId(productId) });

    if (!existingProduct) {
      return res.status(404).json({ 
        error: 'Product not found',
        success: false
      });
    }

    if (existingProduct.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ 
        error: 'You can only delete your own products',
        success: false
      });
    }

    const result = await db.collection('products').deleteOne({ 
      _id: new ObjectId(productId) 
    });

    console.log('✅ Product deleted');

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
};