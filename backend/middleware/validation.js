// middleware/validation.js - Input validation middleware

// Validation helper functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  // At least 8 characters, contains letters and numbers
  return password && password.length >= 8 && /^(?=.*[A-Za-z])(?=.*\d)/.test(password);
};

const isValidCampus = (campus) => {
  const validCampuses = [
    'pretoria-main',
    'soshanguve',
    'ga-rankuwa',
    'pretoria-west',
    'arts',
    'emalahleni',
    'mbombela',
    'polokwane'
  ];
  return validCampuses.includes(campus);
};

const isValidCategory = (category) => {
  const validCategories = [
    'books',
    'electronics',
    'services',
    'clothing',
    'food',
    'transport',
    'accommodation',
    'other'
  ];
  return validCategories.includes(category);
};

const isValidUserType = (type) => {
  return ['customer', 'seller'].includes(type);
};

const isValidProductType = (type) => {
  return ['product', 'service'].includes(type);
};

// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '');
};

// Generic validation middleware factory
const validateFields = (rules) => {
  return (req, res, next) => {
    const errors = [];
    const data = { ...req.body };

    // Sanitize all string inputs
    for (const key in data) {
      if (typeof data[key] === 'string') {
        data[key] = sanitizeInput(data[key]);
      }
    }

    // Apply validation rules
    for (const field in rules) {
      const rule = rules[field];
      const value = data[field];

      // Check required fields
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip other validations if field is not provided and not required
      if (!value && !rule.required) continue;

      // Check minimum length
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters long`);
      }

      // Check maximum length
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field} must be no more than ${rule.maxLength} characters long`);
      }

      // Check custom validation function
      if (rule.validate && !rule.validate(value)) {
        errors.push(rule.message || `${field} is invalid`);
      }

      // Check numeric values
      if (rule.type === 'number') {
        const num = parseFloat(value);
        if (isNaN(num)) {
          errors.push(`${field} must be a valid number`);
        } else {
          if (rule.min !== undefined && num < rule.min) {
            errors.push(`${field} must be at least ${rule.min}`);
          }
          if (rule.max !== undefined && num > rule.max) {
            errors.push(`${field} must be no more than ${rule.max}`);
          }
          data[field] = num; // Convert to number
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
        code: 'VALIDATION_ERROR'
      });
    }

    // Update req.body with sanitized data
    req.body = data;
    next();
  };
};

// Specific validation middlewares
const validateRegistration = validateFields({
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Name must be between 2 and 50 characters'
  },
  email: {
    required: true,
    validate: (email) => isValidEmail(email),
    message: 'Please provide a valid email address'
  },
  password: {
    required: true,
    validate: isValidPassword,
    message: 'Password must be at least 8 characters with letters and numbers'
  },
  userType: {
    required: true,
    validate: isValidUserType,
    message: 'User type must be either customer or seller'
  },
  campus: {
    required: true,
    validate: isValidCampus,
    message: 'Please select a valid TUT campus'
  }
});

const validateLogin = validateFields({
  email: {
    required: true,
    validate: (email) => isValidEmail(email) && email.endsWith('@tut.ac.za'),
    message: 'Please provide a valid TUT email address'
  },
  password: {
    required: true,
    minLength: 1,
    message: 'Password is required'
  }
});

const validateProduct = validateFields({
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: 'Product title must be between 3 and 100 characters'
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 1000,
    message: 'Description must be between 10 and 1000 characters'
  },
  price: {
    required: true,
    type: 'number',
    min: 1,
    max: 100000,
    message: 'Price must be between R1 and R100,000'
  },
  category: {
    required: true,
    validate: isValidCategory,
    message: 'Please select a valid category'
  },
  type: {
    required: true,
    validate: isValidProductType,
    message: 'Product type must be either product or service'
  }
});

const validateProductUpdate = validateFields({
  title: {
    required: false,
    minLength: 3,
    maxLength: 100,
    message: 'Product title must be between 3 and 100 characters'
  },
  description: {
    required: false,
    minLength: 10,
    maxLength: 1000,
    message: 'Description must be between 10 and 1000 characters'
  },
  price: {
    required: false,
    type: 'number',
    min: 1,
    max: 100000,
    message: 'Price must be between R1 and R100,000'
  },
  category: {
    required: false,
    validate: isValidCategory,
    message: 'Please select a valid category'
  },
  type: {
    required: false,
    validate: isValidProductType,
    message: 'Product type must be either product or service'
  },
  status: {
    required: false,
    validate: (status) => ['active', 'inactive', 'sold'].includes(status),
    message: 'Status must be active, inactive, or sold'
  }
});

const validateMessage = validateFields({
  receiverId: {
    required: true,
    validate: (id) => id && id.length === 24, // MongoDB ObjectId length
    message: 'Valid receiver ID is required'
  },
  text: {
    required: true,
    minLength: 1,
    maxLength: 500,
    message: 'Message must be between 1 and 500 characters'
  },
  conversationId: {
    required: true,
    minLength: 1,
    message: 'Conversation ID is required'
  }
});

const validateProfileUpdate = validateFields({
  name: {
    required: false,
    minLength: 2,
    maxLength: 50,
    message: 'Name must be between 2 and 50 characters'
  },
  campus: {
    required: false,
    validate: isValidCampus,
    message: 'Please select a valid TUT campus'
  }
});

// Query parameter validation
const validateProductQuery = (req, res, next) => {
  const { category, campus, page, limit } = req.query;
  const errors = [];

  if (category && category !== 'all' && !isValidCategory(category)) {
    errors.push('Invalid category parameter');
  }

  if (campus && campus !== 'all' && !isValidCampus(campus)) {
    errors.push('Invalid campus parameter');
  }

  if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
    errors.push('Page must be a positive integer');
  }

  if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 50)) {
    errors.push('Limit must be between 1 and 50');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: errors,
      code: 'QUERY_VALIDATION_ERROR'
    });
  }

  next();
};

// MongoDB ObjectId validation
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        error: `Invalid ${paramName} format`,
        code: 'INVALID_ID'
      });
    }

    next();
  };
};

// File upload validation (for future image uploads)
const validateImageUpload = (req, res, next) => {
  if (!req.file) {
    return next(); // Optional file upload
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      code: 'INVALID_FILE_TYPE'
    });
  }

  if (req.file.size > maxSize) {
    return res.status(400).json({
      error: 'File too large. Maximum size is 5MB.',
      code: 'FILE_TOO_LARGE'
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProduct,
  validateProductUpdate,
  validateMessage,
  validateProfileUpdate,
  validateProductQuery,
  validateObjectId,
  validateImageUpload,
  sanitizeInput
};