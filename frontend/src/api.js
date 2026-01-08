// api.js - Complete API integration functions for React frontend


const API_BASE = process.env.REACT_APP_API_BASE;

// API Helper function
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Add body if it exists (for POST, PUT requests)
  if (options.body) {
    config.body = options.body;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    // Handle cases where response might not be JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

// ==============================================
// AUTH API FUNCTIONS
// ==============================================

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - Full name
 * @param {string} userData.email - TUT email address
 * @param {string} userData.password - Password
 * @param {string} userData.userType - 'customer' or 'seller'
 * @param {string} userData.campus - Campus ID
 */
export const registerUser = async (userData) => {
  try {
    console.log('📝 Registering user:', userData);
    
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    console.log('✅ Registration successful:', response);
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
    }

    return response;
  } catch (error) {
    console.error('❌ Registration failed:', error);
    throw new Error(error.message || 'Registration failed');
  }
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - TUT email address
 * @param {string} credentials.password - Password
 */
export const loginUser = async (credentials) => {
  try {
    console.log('🔑 Logging in user:', credentials.email);
    
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    console.log('✅ Login successful:', response);
    
    // Store token and user data in localStorage
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
    }

    return response;
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw new Error(error.message || 'Login failed');
  }
};

/**
 * Logout user (clear local storage)
 */
export const logoutUser = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  console.log('👋 User logged out');
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('auth_token');
  const user = getCurrentUser();
  return !!(token && user);
};

// ==============================================
// PRODUCT API FUNCTIONS
// ==============================================

/**
 * Get all products with filters
 * @param {Object} filters - Filter options
 * @param {string} filters.category - Category filter
 * @param {string} filters.campus - Campus filter
 * @param {string} filters.search - Search term
 * @param {number} filters.page - Page number
 * @param {number} filters.limit - Items per page
 */
export const getProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '' && filters[key] !== 'all') {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    console.log('📦 Getting products with filters:', filters);
    
    const response = await apiCall(endpoint);
    
    console.log(`✅ Retrieved ${response.products ? response.products.length : 0} products`);
    
    return response;
  } catch (error) {
    console.error('❌ Failed to get products:', error);
    throw new Error(error.message || 'Failed to retrieve products');
  }
};

/**
 * Get single product by ID
 * @param {string} productId - Product ID
 */
export const getProduct = async (productId) => {
  try {
    console.log('📦 Getting product:', productId);
    
    const response = await apiCall(`/products/${productId}`);
    
    console.log('✅ Product retrieved:', response.title);
    
    return response;
  } catch (error) {
    console.error('❌ Failed to get product:', error);
    throw new Error(error.message || 'Failed to retrieve product');
  }
};

/**
 * Get products by seller ID
 * @param {string} sellerId - Seller user ID
 */
export const getProductsBySeller = async (sellerId) => {
  try {
    console.log('📦 Getting products for seller _id:', sellerId);
    console.log('🔗 API endpoint:', `/products/seller/${sellerId}`);
    
    const response = await apiCall(`/products/seller/${sellerId}`);
    
    console.log('📊 Full API response:', response);
    console.log('📦 Products array:', response.products);
    console.log(`✅ Retrieved ${response.products ? response.products.length : 0} products for seller ${sellerId}`);
    
    return response.products || [];
  } catch (error) {
    console.error('❌ Failed to get seller products:', error);
    
    // Fallback: filter from all products if specific endpoint fails
    try {
      console.log('🔄 Attempting fallback method...');
      const allProductsResponse = await getProducts();
      console.log('📊 All products response:', allProductsResponse);
      
      const allProducts = allProductsResponse.products || allProductsResponse || [];
      // Fix: Compare with both _id and sellerId since your data might use different field names
      const sellerProducts = allProducts.filter(p => 
        p.sellerId === sellerId || 
        p.sellerId === parseInt(sellerId) ||
        p.seller?._id === sellerId ||
        p.sellerId === sellerId
      );
      
      console.log(`✅ Retrieved ${sellerProducts.length} products using fallback method`);
      return sellerProducts;
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
      throw new Error(error.message || 'Failed to retrieve seller products');
    }
  }
};

/**
 * Create a new product (requires seller subscription)
 * @param {Object} productData - Product data
 * @param {string} productData.title - Product title
 * @param {string} productData.description - Product description
 * @param {number} productData.price - Product price
 * @param {string} productData.category - Product category
 * @param {string} productData.type - 'product' or 'service'
 */
export const createProduct = async (productData) => {
  try {
    console.log('➕ Creating product:', productData);
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'category'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Ensure price is a number
    const productToSend = {
      ...productData,
      price: parseFloat(productData.price),
      type: productData.type || 'product'
    };

    const response = await apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(productToSend),
    });

    console.log('✅ Product created successfully:', response);
    
    return response;
  } catch (error) {
    console.error('❌ Failed to create product:', error);
    throw new Error(error.message || 'Failed to create product');
  }
};

/**
 * Update an existing product
 * @param {string} productId - Product ID
 * @param {Object} updateData - Data to update
 */
export const updateProduct = async (productId, updateData) => {
  try {
    console.log('✏️ Updating product:', productId, updateData);
    
    const response = await apiCall(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    console.log('✅ Product updated successfully');
    
    return response;
  } catch (error) {
    console.error('❌ Failed to update product:', error);
    throw new Error(error.message || 'Failed to update product');
  }
};

/**
 * Delete a product
 * @param {string} productId - Product ID
 */
export const deleteProduct = async (productId) => {
  try {
    console.log('🗑️ Deleting product:', productId);
    
    const response = await apiCall(`/products/${productId}`, {
      method: 'DELETE',
    });

    console.log('✅ Product deleted successfully');
    
    return response;
  } catch (error) {
    console.error('❌ Failed to delete product:', error);
    throw new Error(error.message || 'Failed to delete product');
  }
};

// ==============================================
// MESSAGE API FUNCTIONS (Backend Version)
// ==============================================

/**
 * Get messages for a conversation
 * @param {string} conversationId - Conversation ID
 */
export const getMessages = async (conversationId) => {
  try {
    console.log('💬 Getting messages for:', conversationId);
    
    const response = await apiCall(`/messages/${conversationId}`);
    
    console.log(`✅ Retrieved ${response.messages ? response.messages.length : 0} messages`);
    
    return response.messages || [];
  } catch (error) {
    console.error('❌ Failed to get messages:', error);
    // Fallback to mock data if API fails
    return getMockMessages(conversationId);
  }
};

/**
 * Send a message
 * @param {Object} messageData - Message data
 * @param {string} messageData.receiverId - Receiver user ID
 * @param {string} messageData.text - Message text
 * @param {string} messageData.conversationId - Conversation ID
 */
export const sendMessage = async (messageData) => {
  try {
    console.log('📤 Sending message:', messageData);
    
    const response = await apiCall('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });

    console.log('✅ Message sent successfully');
    
    return response;
  } catch (error) {
    console.error('❌ Failed to send message:', error);
    // Fallback to mock function if API fails
    return sendMockMessage(messageData);
  }
};

// ==============================================
// MOCK MESSAGE FUNCTIONS (Fallback)
// ==============================================

// Mock database for messages (fallback when backend is unavailable)
let messagesDB = [
  {
    id: 1,
    senderId: 1,
    receiverId: 2,
    text: "Hi there! Is this item still available?",
    timestamp: "2024-01-15T10:30:00Z",
    read: true
  },
  {
    id: 2,
    senderId: 2,
    receiverId: 1,
    text: "Yes, it's still available!",
    timestamp: "2024-01-15T10:35:00Z",
    read: true
  },
  {
    id: 3,
    senderId: 1,
    receiverId: 2,
    text: "Great! Can we meet on campus tomorrow?",
    timestamp: "2024-01-15T10:40:00Z",
    read: false
  }
];

let nextMessageId = 4;

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock message functions
const sendMockMessage = async (messageData) => {
  await delay(500);

  try {
    if (!messageData.senderId || !messageData.receiverId || !messageData.text.trim()) {
      throw new Error('Missing required message fields');
    }

    const newMessage = {
      id: nextMessageId++,
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      text: messageData.text.trim(),
      timestamp: messageData.timestamp || new Date().toISOString(),
      read: false
    };

    messagesDB.push(newMessage);
    console.log('✅ Mock message sent:', newMessage);
    return newMessage;

  } catch (error) {
    console.error('❌ Failed to send mock message:', error);
    throw new Error(error.message || 'Failed to send message');
  }
};

const getMockMessages = async (conversationId) => {
  await delay(300);

  try {
    // Parse user IDs from conversationId (format: "userId1-userId2")
    const [userId1, userId2] = conversationId.split('-').map(Number);
    
    const conversationMessages = messagesDB.filter(message =>
      (message.senderId === userId1 && message.receiverId === userId2) ||
      (message.senderId === userId2 && message.receiverId === userId1)
    );

    const sortedMessages = conversationMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    console.log(`✅ Loaded ${sortedMessages.length} mock messages`);
    return sortedMessages;

  } catch (error) {
    console.error('❌ Failed to get mock messages:', error);
    return [];
  }
};

// ==============================================
// USER API FUNCTIONS
// ==============================================

/**
 * Get user subscription status
 */
export const getSubscriptionStatus = async () => {
  try {
    console.log('💳 Getting subscription status');
    
    const response = await apiCall('/user/subscription-status');
    
    console.log('✅ Subscription status:', response);
    
    return response;
  } catch (error) {
    console.error('❌ Failed to get subscription status:', error);
    // Return mock subscription status
    return { subscribed: false, type: 'customer' };
  }
};

/**
 * Get user profile
 */
// api.js - Fix the getUserProfile function


/**
 * Update user profile
 */

export const updateUserProfile = async (userId, updateData) => {
  try {
    console.log('🌐 Updating profile for user ID:', userId);
    
    const response = await apiCall(`/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    console.log('✅ Profile update response:', response);
    return response.user;
    
  } catch (error) {
    console.error('❌ Failed to update profile:', error);
    
    // Enhanced error handling based on backend codes
    if (error.status === 409) {
      throw new Error('Email already exists. Please use a different email.');
    } else if (error.status === 404) {
      throw new Error('User not found. Please log in again.');
    } else if (error.status === 400) {
      throw new Error(error.message || 'Validation failed');
    } else if (error.status === 403) {
      throw new Error('You do not have permission to update this profile.');
    }
    
    throw new Error(error.message || 'Failed to update profile');
  }
};
/**
 * Upgrade user to seller
 */
export const upgradeUserToSeller = async (userId, subscriptionType = 'monthly') => {
  try {
    const response = await apiCall(`/users/${userId}/upgrade`, {
      method: 'POST',
      body: JSON.stringify({ subscriptionType }),
    });
    return response;
  } catch (error) {
    console.error('❌ Failed to upgrade account:', error);
    throw new Error(error.message || 'Failed to upgrade account');
  }
};

// ==============================================
// REFERENCE DATA API FUNCTIONS
// ==============================================

/**
 * Get all campuses
 */
export const getCampuses = async () => {
  try {
    const response = await apiCall('/campuses');
    return response.campuses || [];
  } catch (error) {
    console.error('❌ Failed to get campuses:', error);
    // Return default campuses if API fails
    return [
      { id: 'pretoria-main', name: 'Pretoria Main' },
      { id: 'soshanguve-S', name: 'Soshanguve South' },
      { id: 'soshanguve-N', name: 'Soshanguve North' },
      { id: 'ga-rankuwa', name: 'Ga-Rankuwa' },
      { id: 'pretoria-west', name: 'Pretoria West' },
      { id: 'arts', name: 'Arts' },
      { id: 'emalahleni', name: 'eMalahleni' },
      { id: 'mbombela', name: 'Mbombela' },
      { id: 'polokwane', name: 'Polokwane' }
    ];
  }
};

/**
 * Get all categories
 */
export const getCategories = async () => {
  try {
    const response = await apiCall('/categories');
    return response.categories || [];
  } catch (error) {
    console.error('❌ Failed to get categories:', error);
    // Return default categories if API fails
    return [
      { id: 'books', name: 'Books' },
      { id: 'electronics', name: 'Electronics' },
      { id: 'services', name: 'Services' },
      { id: 'clothing', name: 'Clothing' },
      { id: 'food', name: 'Food' },
      { id: 'transport', name: 'Transport' },
      { id: 'accommodation', name: 'Accommodation' },
      { id: 'other', name: 'Other' }
    ];
  }
};

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Test API connection
 */
export const testConnection = async () => {
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API connection successful');
      return true;
    } else {
      console.error('❌ API connection failed');
      return false;
    }
  } catch (error) {
    console.error('❌ API connection error:', error);
    return false;
  }
};

/**
 * Generate conversation ID between two users
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 */
export const generateConversationId = (userId1, userId2) => {
  const ids = [userId1, userId2].sort();
  return `${ids[0]}-${ids[1]}`;
};

// Additional messaging utility functions (for mock data)
export const getConversations = async (userId) => {
  await delay(400);

  try {
    const conversationPartners = new Set();
    
    messagesDB.forEach(message => {
      if (message.senderId === userId) conversationPartners.add(message.receiverId);
      if (message.receiverId === userId) conversationPartners.add(message.senderId);
    });

    const conversations = Array.from(conversationPartners).map(partnerId => {
      const messagesWithPartner = messagesDB.filter(msg =>
        (msg.senderId === userId && msg.receiverId === partnerId) ||
        (msg.senderId === partnerId && msg.receiverId === userId)
      );

      const lastMessage = messagesWithPartner.reduce((latest, current) => 
        new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
      );

      const unreadCount = messagesWithPartner.filter(msg => 
        msg.receiverId === userId && !msg.read
      ).length;

      return {
        userId: partnerId,
        lastMessage,
        unreadCount
      };
    });

    return conversations.sort((a, b) => 
      new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    );

  } catch (error) {
    console.error('❌ Failed to get conversations:', error);
    throw new Error('Failed to load conversations');
  }
};

export const markMessagesAsRead = async (userId, partnerId) => {
  await delay(200);

  try {
    messagesDB = messagesDB.map(message => {
      if (message.senderId === partnerId && message.receiverId === userId && !message.read) {
        return { ...message, read: true };
      }
      return message;
    });

    console.log(`✅ Marked messages from ${partnerId} as read for user ${userId}`);
  } catch (error) {
    console.error('❌ Failed to mark messages as read:', error);
    throw new Error('Failed to mark messages as read');
  }
};

export const getUnreadMessageCount = async (userId) => {
  await delay(100);

  try {
    const unreadMessages = messagesDB.filter(message => 
      message.receiverId === userId && !message.read
    );
    
    return unreadMessages.length;
  } catch (error) {
    console.error('❌ Failed to get unread message count:', error);
    return 0;
  }
};

// Export all functions as default
export default {
  // Auth
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  isAuthenticated,
  
  // Products
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsBySeller,
  
  // Messages
  getMessages,
  sendMessage,
  getConversations,
  markMessagesAsRead,
  getUnreadMessageCount,
  
  // User
  getSubscriptionStatus,
  //getUserProfile,
  updateUserProfile,
  upgradeUserToSeller,
  
  // Reference Data
  getCampuses,
  getCategories,
  
  // Utilities
  testConnection,
  generateConversationId
};