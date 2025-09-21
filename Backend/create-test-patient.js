import mongoose from 'mongoose';
import { Patient } from './models/User.js';

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

// Create test patient
const createTestPatient = async () => {
  try {
    await connectDB();

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email: 'test.patient@ayursutra.com' });
    if (existingPatient) {
      console.log('Test patient already exists:', existingPatient.email);
      console.log('Patient ID:', existingPatient._id);
      process.exit(0);
    }

    const testPatient = new Patient({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test.patient@ayursutra.com',
      password: 'password123',
      mobile: '9876543200',
      age: 35,
      gender: 'male',
      userType: 'patient',
      isActive: true,
      isVerified: true
    });

    const createdPatient = await testPatient.save();
    console.log('✅ Successfully created test patient:');
    console.log('Email:', createdPatient.email);
    console.log('Password: password123');
    console.log('Patient ID:', createdPatient._id);

    process.exit(0);
  } catch (error) {
    console.error('Error creating test patient:', error);
    process.exit(1);
  }
};

createTestPatient();