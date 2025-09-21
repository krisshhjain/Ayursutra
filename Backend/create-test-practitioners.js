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

// Create test practitioners
const createTestPractitioners = async () => {
  try {
    await connectDB();

    // Check if practitioners already exist
    const existingCount = await Practitioner.countDocuments();
    if (existingCount > 0) {
      console.log(`${existingCount} practitioners already exist in the database.`);
      process.exit(0);
    }

    const testPractitioners = [
      {
        firstName: 'Dr. Rajesh',
        lastName: 'Sharma',
        email: 'rajesh.sharma@ayursutra.com',
        password: 'password123',
        mobile: '9876543210',
        age: 45,
        userType: 'practitioner',
        specialization: 'panchakarma',
        experience: 15,
        qualifications: ['BAMS', 'MD (Ayurveda)', 'Panchakarma Certification'],
        isActive: true,
        isVerified: true,
        rating: 4.8
      },
      {
        firstName: 'Dr. Priya',
        lastName: 'Nair',
        email: 'priya.nair@ayursutra.com',
        password: 'password123',
        mobile: '9876543211',
        age: 38,
        userType: 'practitioner',
        specialization: 'rasayana',
        experience: 12,
        qualifications: ['BAMS', 'PhD (Ayurveda)', 'Herbalism Certification'],
        isActive: true,
        isVerified: true,
        rating: 4.9
      },
      {
        firstName: 'Dr. Arun',
        lastName: 'Kumar',
        email: 'arun.kumar@ayursutra.com',
        password: 'password123',
        mobile: '9876543212',
        age: 52,
        userType: 'practitioner',
        specialization: 'general',
        experience: 20,
        qualifications: ['BAMS', 'MD (Ayurveda)', 'Pulse Diagnosis Expert'],
        isActive: true,
        isVerified: true,
        rating: 4.7
      },
      {
        firstName: 'Dr. Sita',
        lastName: 'Devi',
        email: 'sita.devi@ayursutra.com',
        password: 'password123',
        mobile: '9876543213',
        age: 42,
        userType: 'practitioner',
        specialization: 'kayachikitsa',
        experience: 18,
        qualifications: ['BAMS', 'Women Health Specialist', 'Prenatal Care'],
        isActive: true,
        isVerified: true,
        rating: 4.6
      },
      {
        firstName: 'Dr. Ramesh',
        lastName: 'Iyer',
        email: 'ramesh.iyer@ayursutra.com',
        password: 'password123',
        mobile: '9876543214',
        age: 35,
        userType: 'practitioner',
        specialization: 'general',
        experience: 8,
        qualifications: ['BAMS', 'Nutrition Certification', 'Diet Planning'],
        isActive: true,
        isVerified: true,
        rating: 4.5
      }
    ];

    const createdPractitioners = await Practitioner.insertMany(testPractitioners);
    console.log(`✅ Successfully created ${createdPractitioners.length} test practitioners:`);
    
    createdPractitioners.forEach(practitioner => {
      console.log(`- ${practitioner.firstName} ${practitioner.lastName} (${practitioner.specialization})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating test practitioners:', error);
    process.exit(1);
  }
};

createTestPractitioners();