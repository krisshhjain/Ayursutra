import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ayursutra');
    console.log('✅ Connected to MongoDB successfully');
    
    // Test basic operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    // Close connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

testDatabaseConnection();