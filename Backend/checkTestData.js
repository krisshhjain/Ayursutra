import mongoose from 'mongoose';
import { User } from './models/User.js';
import Appointment from './models/Appointment.js';
import TherapyProgram from './models/TherapyProgram.js';
import TherapyTemplate from './models/TherapyTemplate.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ayursutra';

async function checkTestData() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check practitioners
    console.log('\n👨‍⚕️ PRACTITIONERS:');
    const practitioners = await User.find({ userType: 'practitioner' })
      .select('firstName lastName email specialization')
      .limit(5);
    
    if (practitioners.length === 0) {
      console.log('❌ No practitioners found');
    } else {
      practitioners.forEach((p, index) => {
        console.log(`${index + 1}. ${p.firstName} ${p.lastName} (${p.email}) - ${p.specialization || 'General'}`);
      });
    }

    // Check patients  
    console.log('\n👤 PATIENTS:');
    const patients = await User.find({ userType: 'patient' })
      .select('firstName lastName email')
      .limit(5);
    
    if (patients.length === 0) {
      console.log('❌ No patients found');
    } else {
      patients.forEach((p, index) => {
        console.log(`${index + 1}. ${p.firstName} ${p.lastName} (${p.email})`);
      });
    }

    // Check appointments
    console.log('\n📅 RECENT APPOINTMENTS:');
    const appointments = await Appointment.find()
      .populate('patientId', 'firstName lastName email')
      .populate('practitionerId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    if (appointments.length === 0) {
      console.log('❌ No appointments found');
    } else {
      appointments.forEach((apt, index) => {
        const patient = apt.patientId ? `${apt.patientId.firstName} ${apt.patientId.lastName}` : 'Unknown';
        const practitioner = apt.practitionerId ? `${apt.practitionerId.firstName} ${apt.practitionerId.lastName}` : 'Unknown';
        console.log(`${index + 1}. ${patient} → ${practitioner} | ${apt.status} | ${new Date(apt.date).toLocaleDateString()}`);
      });
    }

    // Check therapy templates
    console.log('\n🌿 THERAPY TEMPLATES:');
    const templates = await TherapyTemplate.find({ isActive: true })
      .select('name category subcategory totalSessions')
      .limit(10);
    
    if (templates.length === 0) {
      console.log('❌ No therapy templates found');
    } else {
      templates.forEach((t, index) => {
        console.log(`${index + 1}. ${t.name} (${t.category}/${t.subcategory}) - ${t.sessions?.length || 0} sessions`);
      });
    }

    // Check therapy programs
    console.log('\n🎯 THERAPY PROGRAMS:');
    const programs = await TherapyProgram.find()
      .populate('patientId', 'firstName lastName')
      .populate('primaryPractitionerId', 'firstName lastName')
      .select('programName status')
      .limit(5);
    
    if (programs.length === 0) {
      console.log('❌ No therapy programs found');
    } else {
      programs.forEach((p, index) => {
        const patient = p.patientId ? `${p.patientId.firstName} ${p.patientId.lastName}` : 'Unknown';
        const practitioner = p.primaryPractitionerId ? `${p.primaryPractitionerId.firstName} ${p.primaryPractitionerId.lastName}` : 'Unknown';
        console.log(`${index + 1}. ${p.programName} | ${p.status} | ${patient} ← ${practitioner}`);
      });
    }

    console.log('\n📋 TESTING CREDENTIALS:');
    console.log('For testing, you can use these credentials:');
    if (practitioners.length > 0) {
      console.log(`🔑 Practitioner: ${practitioners[0].email} (password: password123)`);
    }
    if (patients.length > 0) {
      console.log(`🔑 Patient: ${patients[0].email} (password: password123)`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Error checking test data:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the check
if (import.meta.url === `file://${process.argv[1]}`) {
  checkTestData();
}

export default checkTestData;