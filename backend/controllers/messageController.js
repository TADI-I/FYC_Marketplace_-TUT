// controllers/messageController.js
const { ObjectId } = require('mongodb');

// Get messages for conversation
exports.getMessages = async (req, res, db) => {
  try {
    const conversationId = req.params.conversationId;
    console.log('💬 Getting messages for:', conversationId);
    
    const messages = await db.collection('messages')
      .find({ conversationId })
      .sort({ createdAt: 1 })
      .toArray();

    res.json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve messages: ' + error.message,
      success: false
    });
  }
};

// Send message
exports.sendMessage = async (req, res, db) => {
  try {
    console.log('📤 Sending message:', req.body);
    
    const { receiverId, text, conversationId } = req.body;

    if (!receiverId || !text || !conversationId) {
      return res.status(400).json({ 
        error: 'All fields are required',
        success: false
      });
    }

    const message = {
      senderId: new ObjectId(req.user.id),
      receiverId: new ObjectId(receiverId),
      conversationId,
      text: text.trim(),
      read: false,
      createdAt: new Date()
    };

    const result = await db.collection('messages').insertOne(message);
    console.log('✅ Message sent');
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      messageId: result.insertedId
    });

  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({ 
      error: 'Failed to send message: ' + error.message,
      success: false
    });
  }
};