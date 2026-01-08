// controllers/referenceController.js

// Get campuses
exports.getCampuses = (req, res) => {
  const campuses = [
    { id: 'pretoria-main', name: 'Pretoria Main Campus' },
    { id: 'soshanguve', name: 'Soshanguve Campus' },
    { id: 'ga-rankuwa', name: 'Ga-Rankuwa Campus' },
    { id: 'pretoria-west', name: 'Pretoria West Campus' },
    { id: 'arts', name: 'Arts Campus' },
    { id: 'emalahleni', name: 'eMalahleni Campus' },
    { id: 'mbombela', name: 'Mbombela Campus' },
    { id: 'polokwane', name: 'Polokwane Campus' }
  ];
  res.json({ success: true, campuses });
};

// Get categories
exports.getCategories = (req, res) => {
  const categories = [
    { id: 'books', name: 'Books' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'services', name: 'Services' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'food', name: 'Food' },
    { id: 'transport', name: 'Transport' },
    { id: 'accommodation', name: 'Accommodation' },
    { id: 'other', name: 'Other' }
  ];
  res.json({ success: true, categories });
};