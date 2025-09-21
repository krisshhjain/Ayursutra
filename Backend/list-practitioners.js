import mongoose from 'mongoose';
import { Practitioner } from './models/User.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ayursutra');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// List all practitioners for testing
const listPractitioners = async () => {
  try {
    await connectDB();

    const practitioners = await Practitioner.find({ isActive: true }).select('firstName lastName email specialization');
    
    if (practitioners.length === 0) {
      console.log('No practitioners found. Run create-test-practitioners.js first.');
      process.exit(0);
    }

    console.log('\n🏥 Available Practitioners for Testing:\n');
    console.log('=' .repeat(60));
    
    practitioners.forEach((practitioner, index) => {
      console.log(`${index + 1}. Dr. ${practitioner.firstName} ${practitioner.lastName}`);
      console.log(`   Email: ${practitioner.email}`);
      console.log(`   Password: password123`);
      console.log(`   Specialization: ${practitioner.specialization}`);
      console.log(`   ID: ${practitioner._id}`);
      console.log('-'.repeat(60));
    });

    console.log('\n📋 Instructions:');
    console.log('1. Login to the frontend with any practitioner email and password: password123');
    console.log('2. Navigate to /practitioner-schedule-new');
    console.log('3. You should see any appointment requests made by patients');
    console.log('4. Click "Confirm Appointment" to approve patient requests');
    console.log('\n🔄 To test the full flow:');
    console.log('• Login as patient (test.patient@ayursutra.com / password123)');
    console.log('• Book an appointment with any practitioner');
    console.log('• Logout and login as practitioner');
    console.log('• Check the practitioner schedule to see and confirm the request');

    process.exit(0);
  } catch (error) {
    console.error('Error listing practitioners:', error);
    process.exit(1);
  }
};

listPractitioners();