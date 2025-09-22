// api.js - Complete API integration functions for React frontend

const API_BASE = 'http://localhost:5001/api';

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

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
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
    
    console.log(`✅ Retrieved ${response.products.length} products`);
    
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
// MESSAGE API FUNCTIONS
// ==============================================

/**
 * Get messages for a conversation
 * @param {string} conversationId - Conversation ID
 */
export const getMessages = async (conversationId) => {
  try {
    console.log('💬 Getting messages for:', conversationId);
    
    const response = await apiCall(`/messages/${conversationId}`);
    
    console.log(`✅ Retrieved ${response.messages.length} messages`);
    
    return response;
  } catch (error) {
    console.error('❌ Failed to get messages:', error);
    throw new Error(error.message || 'Failed to retrieve messages');
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
    throw new Error(error.message || 'Failed to send message');
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
    throw new Error(error.message || 'Failed to get subscription status');
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
    return response.campuses;
  } catch (error) {
    console.error('❌ Failed to get campuses:', error);
    // Return default campuses if API fails
    return [
      { id: 'pretoria-main', name: 'Pretoria Main ' },
      { id: 'soshanguve', name: 'Soshanguve ' },
      { id: 'ga-rankuwa', name: 'Ga-Rankuwa ' },
      { id: 'pretoria-west', name: 'Pretoria West ' },
      { id: 'arts', name: 'Arts ' },
      { id: 'emalahleni', name: 'eMalahleni ' },
      { id: 'mbombela', name: 'Mbombela ' },
      { id: 'polokwane', name: 'Polokwane ' }
    ];
  }
};

/**
 * Get all categories
 */
export const getCategories = async () => {
  try {
    const response = await apiCall('/categories');
    return response.categories;
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

export const getUserProfile = async (userId) => {
  try {
    const response = await apiCall(`/users/${userId}`);
    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to get user profile');
  }
};

export const updateUserProfile = async (userId, updateData) => {
  try {
    const response = await apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to update profile');
  }
};

export const upgradeUserToSeller = async (userId, subscriptionType = 'monthly') => {
  try {
    const response = await apiCall(`/users/${userId}/upgrade`, {
      method: 'POST',
      body: JSON.stringify({ subscriptionType }),
    });
    return response;
  } catch (error) {
    throw new Error(error.message || 'Failed to upgrade account');
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
  
  // Messages
  getMessages,
  sendMessage,
  
  // User
  getSubscriptionStatus,
  
  // Reference Data
  getCampuses,
  getCategories,
  
  // Utilities
  testConnection,
  generateConversationId
};