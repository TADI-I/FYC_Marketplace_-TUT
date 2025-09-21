// scripts/seedData.js - Database seeding script for TUT Marketplace
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb+srv://tadiwasongore_db_user:BigdaddyT@sales.o3ww0ii.mongodb.net/tut_marketplace?retryWrites=true&w=majority&authSource=admin&appName=sales";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Sample data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@tut.ac.za',
    password: 'password123', // Will be hashed
    type: 'seller',
    campus: 'pretoria-main',
    subscribed: true,
    subscriptionStartDate: new Date(),
    subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    subscriptionStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Sarah Smith',
    email: 'sarah@tut.ac.za',
    password: 'password123',
    type: 'customer',
    campus: 'soshanguve',
    subscribed: false,
    subscriptionStartDate: null,
    subscriptionEndDate: null,
    subscriptionStatus: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Mike Johnson',
    email: 'mike@tut.ac.za',
    password: 'password123',
    type: 'seller',
    campus: 'ga-rankuwa',
    subscribed: true,
    subscriptionStartDate: new Date(),
    subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    subscriptionStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Lisa Williams',
    email: 'lisa@tut.ac.za',
    password: 'password123',
    type: 'seller',
    campus: 'pretoria-west',
    subscribed: true,
    subscriptionStartDate: new Date(),
    subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    subscriptionStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'David Brown',
    email: 'david@tut.ac.za',
    password: 'password123',
    type: 'customer',
    campus: 'arts',
    subscribed: false,
    subscriptionStartDate: null,
    subscriptionEndDate: null,
    subscriptionStatus: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const sampleProducts = [
  {
    title: 'Engineering Textbooks Bundle',
    description: 'Complete set of engineering textbooks for first year students. Includes Mathematics, Physics, Chemistry, and Engineering Drawing books. All in excellent condition.',
    price: 1500,
    category: 'books',
    type: 'product',
    sellerId: null, // Will be populated with actual user ID
    sellerName: 'John Doe',
    sellerCampus: 'pretoria-main',
    rating: 4.8,
    reviews: [],
    images: [],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Math Tutoring Services',
    description: 'Professional mathematics tutoring for all levels. Specialized in Calculus, Linear Algebra, and Statistics. Available for one-on-one or group sessions.',
    price: 200,
    category: 'services',
    type: 'service',
    sellerId: null,
    sellerName: 'Mike Johnson',
    sellerCampus: 'ga-rankuwa',
    rating: 4.9,
    reviews: [],
    images: [],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Dell Inspiron Laptop',
    description: 'Used Dell Inspiron 15 laptop, perfect for programming and assignments. Intel Core i5, 8GB RAM, 256GB SSD. Great condition, battery holds charge well.',
    price: 8500,
    category: 'electronics',
    type: 'product',
    sellerId: null,
    sellerName: 'John Doe',
    sellerCampus: 'pretoria-main',
    rating: 4.5,
    reviews: [],
    images: [],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Graphic Design Services',
    description: 'Professional graphic design services for logos, posters, flyers, and presentations. Quick turnaround time and unlimited revisions.',
    price: 300,
    category: 'services',
    type: 'service',
    sellerId: null,
    sellerName: 'Lisa Williams',
    sellerCampus: 'pretoria-west',
    rating: 4.7,
    reviews: [],
    images: [],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'TUT Branded Hoodies',
    description: 'Official TUT branded hoodies in various sizes. Comfortable cotton blend material. Perfect for campus wear. Available in navy blue and gray.',
    price: 450,
    category: 'clothing',
    type: 'product',
    sellerId: null,
    sellerName: 'Lisa Williams',
    sellerCampus: 'pretoria-west',
    rating: 4.6,
    reviews: [],
    images: [],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Homemade Meals Delivery',
    description: 'Healthy homemade meals delivered to your campus. Daily specials include traditional South African dishes. Orders must be placed 24 hours in advance.',
    price: 80,
    category: 'food',
    type: 'service',
    sellerId: null,
    sellerName: 'Mike Johnson',
    sellerCampus: 'ga-rankuwa',
    rating: 4.8,
    reviews: [],
    images: [],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Scientific Calculator',
    description: 'Casio FX-991ES Plus scientific calculator. Essential for engineering and science students. Barely used, still have original packaging.',
    price: 350,
    category: 'electronics',
    type: 'product',
    sellerId: null,
    sellerName: 'John Doe',
    sellerCampus: 'pretoria-main',
    rating: 4.4,
    reviews: [],
    images: [],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Essay Writing & Editing',
    description: 'Professional essay writing and editing services. Help with research, structure, grammar, and citations. Experienced in APA, MLA, and Harvard referencing styles.',
    price: 150,
    category: 'services',
    type: 'service',
    sellerId: null,
    sellerName: 'Lisa Williams',
    sellerCampus: 'pretoria-west',
    rating: 4.9,
    reviews: [],
    images: [],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('tut_marketplace');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await db.collection('users').deleteMany({});
    await db.collection('products').deleteMany({});
    await db.collection('messages').deleteMany({});
    
    // Hash passwords for users
    console.log('Preparing user data...');
    const usersToInsert = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    );
    
    // Insert users
    console.log('Inserting users...');
    const userResult = await db.collection('users').insertMany(usersToInsert);
    console.log(`Inserted ${userResult.insertedCount} users`);
    
    // Get inserted user IDs
    const insertedUsers = await db.collection('users').find({}).toArray();
    const userMap = {};
    insertedUsers.forEach(user => {
      userMap[user.name] = user._id;
    });
    
    // Update products with correct seller IDs
    const productsToInsert = sampleProducts.map(product => ({
      ...product,
      sellerId: userMap[product.sellerName]
    }));
    
    // Insert products
    console.log('Inserting products...');
    const productResult = await db.collection('products').insertMany(productsToInsert);
    console.log(`Inserted ${productResult.insertedCount} products`);
    
    // Create indexes
    console.log('Creating indexes...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('products').createIndex({ sellerId: 1 });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ title: 'text', description: 'text' });
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();