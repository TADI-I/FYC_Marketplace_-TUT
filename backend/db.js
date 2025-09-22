// db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'tut_marketplace',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tls: true,                      // enforce TLS
      tlsAllowInvalidCertificates: true, // Render workaround for TLS
    });

    console.log('✅ MongoDB connected successfully on Render');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

export default connectDB;
