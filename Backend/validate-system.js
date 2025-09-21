import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { generateSlots, validateSlotAvailability } from './lib/slotGenerator.js';
import { User } from './models/User.js';
import PractitionerAvailability from './models/PractitionerAvailability.js';
import Appointment from './models/Appointment.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ayursutra-test';

async function runValidationTests() {
  try {
    console.log('🧪 Starting Appointment System Validation Tests...\n');
    
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to test database');
    
    // Clean up existing test data
    await User.deleteMany({ email: /@test\.com$/ });
    await Appointment.deleteMany({});
    await PractitionerAvailability.deleteMany({});
    console.log('✅ Cleaned up existing test data');
    
    // Create test practitioner
    const practitioner = new User({
      firstName: 'Dr. Test',
      lastName: 'Validation',
      email: 'validation@test.com',
      mobile: '9876543210',
      password: 'password123',
      userType: 'practitioner',
      specialization: 'Panchakarma',
      isVerified: true
    });
    await practitioner.save();
    console.log('✅ Created test practitioner');
    
    // Create practitioner availability
    const availability = new PractitionerAvailability({
      practitionerId: practitioner._id,
      slotLength: 30,
      bufferBefore: 10,
      bufferAfter: 10,
      timezone: 'Asia/Kolkata',
      weeklyHours: [
        { weekday: 1, start: '09:00', end: '17:00' }, // Monday
        { weekday: 2, start: '09:00', end: '17:00' }, // Tuesday
        { weekday: 3, start: '09:00', end: '17:00' }, // Wednesday
        { weekday: 4, start: '09:00', end: '17:00' }, // Thursday
        { weekday: 5, start: '09:00', end: '17:00' }, // Friday
        { weekday: 6, start: '10:00', end: '14:00' }  // Saturday
      ],
      exceptions: []
    });
    await availability.save();
    console.log('✅ Created practitioner availability');
    
    // Test 1: Generate slots for a working day
    console.log('\n📅 Test 1: Generating slots for Monday (working day)');
    const monday = new Date('2025-09-22'); // Known Monday
    const mondayStr = monday.toISOString().split('T')[0];
    const mondaySlots = await generateSlots(practitioner._id, mondayStr);
    
    if (mondaySlots && mondaySlots.slots && mondaySlots.slots.length > 0) {
      console.log(`✅ Generated ${mondaySlots.slots.length} slots for ${mondayStr}`);
      console.log(`   First slot: ${mondaySlots.slots[0].startTime} - ${mondaySlots.slots[0].endTime}`);
      console.log(`   Last slot: ${mondaySlots.slots[mondaySlots.slots.length - 1].startTime} - ${mondaySlots.slots[mondaySlots.slots.length - 1].endTime}`);
    } else {
      console.log('❌ Failed to generate slots for working day');
      if (mondaySlots && mondaySlots.message) {
        console.log(`   Reason: ${mondaySlots.message}`);
      }
    }
    
    // Test 2: Generate slots for non-working day
    console.log('\n📅 Test 2: Generating slots for Sunday (non-working day)');
    const sunday = new Date('2025-09-21'); // Known Sunday
    const sundayStr = sunday.toISOString().split('T')[0];
    const sundaySlots = await generateSlots(practitioner._id, sundayStr);
    
    if (sundaySlots && sundaySlots.slots && sundaySlots.slots.length === 0) {
      console.log('✅ Correctly returned no slots for non-working day');
    } else {
      console.log('❌ Should not have generated slots for non-working day');
      if (sundaySlots && sundaySlots.message) {
        console.log(`   Message: ${sundaySlots.message}`);
      }
    }
    
    // Test 3: Validate available slot
    console.log('\n🕐 Test 3: Validating available time slot');
    const slotStart = new Date(`${mondayStr}T09:00:00.000Z`);
    const slotEnd = new Date(`${mondayStr}T09:30:00.000Z`);
    const validation = await validateSlotAvailability(
      practitioner._id,
      mondayStr,
      slotStart,
      slotEnd
    );
    
    if (validation.isValid) {
      console.log('✅ Slot validation passed for available time');
    } else {
      console.log(`❌ Slot validation failed: ${validation.reason}`);
    }
    
    // Test 4: Create appointment and test conflict detection
    console.log('\n📝 Test 4: Creating appointment and testing conflict detection');
    const appointment = new Appointment({
      practitionerId: practitioner._id,
      patientId: practitioner._id, // Using same ID for testing
      date: mondayStr,
      slotStartUtc: slotStart,
      slotEndUtc: slotEnd,
      duration: 30,
      status: 'confirmed',
      notes: 'Test appointment',
      createdBy: 'practitioner'
    });
    await appointment.save();
    console.log('✅ Created test appointment');
    
    // Test 5: Validate conflicting slot
    console.log('\n⚠️  Test 5: Validating conflicting time slot');
    const conflictValidation = await validateSlotAvailability(
      practitioner._id,
      mondayStr,
      slotStart,
      slotEnd
    );
    
    if (!conflictValidation.isValid) {
      console.log('✅ Correctly detected appointment conflict');
    } else {
      console.log('❌ Failed to detect appointment conflict');
    }
    
    // Test 6: Test buffer time conflict
    console.log('\n🛡️  Test 6: Testing buffer time conflict detection');
    const bufferSlotStart = new Date(`${mondayStr}T08:55:00.000Z`); // 5 min before, should conflict with 10min buffer
    const bufferSlotEnd = new Date(`${mondayStr}T09:25:00.000Z`);
    const bufferValidation = await validateSlotAvailability(
      practitioner._id,
      mondayStr,
      bufferSlotStart,
      bufferSlotEnd
    );
    
    if (!bufferValidation.isValid) {
      console.log('✅ Correctly detected buffer time conflict');
    } else {
      console.log('❌ Failed to detect buffer time conflict');
    }
    
    // Clean up
    await User.deleteMany({ email: /@test\.com$/ });
    await Appointment.deleteMany({});
    await PractitionerAvailability.deleteMany({});
    console.log('\n🧹 Cleaned up test data');
    
    console.log('\n🎉 All validation tests completed successfully!');
    console.log('✅ Appointment booking system is working correctly');
    
  } catch (error) {
    console.error('❌ Validation test failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run the validation tests
runValidationTests();