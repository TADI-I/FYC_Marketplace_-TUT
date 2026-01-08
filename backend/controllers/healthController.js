// controllers/healthController.js

// Health check
exports.healthCheck = (req, res, db) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    database: db ? 'Connected' : 'Disconnected',
    success: true
  });
};

// Test database connection
exports.testDbConnection = async (req, res, db) => {
  try {
    await db.admin().ping();
    res.json({ 
      success: true,
      message: 'Database connection is working!',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Database connection failed: ' + error.message
    });
  }
};