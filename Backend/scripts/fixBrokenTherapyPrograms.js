import mongoose from 'mongoose';
import { User, Patient, Practitioner } from '../models/User.js';
import TherapyProgram from '../models/TherapyProgram.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('Connecting to MongoDB:', mongoUri ? mongoUri.replace(/\/\/.*:.*@/, '//***:***@') : 'No URI found');
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const fixBrokenPrograms = async () => {
  try {
    console.log('🔍 Looking for therapy programs...');
    
    // Find all programs
    const allPrograms = await TherapyProgram.find({});
    console.log(`Found ${allPrograms.length} total programs`);
    
    for (const program of allPrograms) {
      console.log(`\nProgram ID: ${program._id}`);
      console.log(`PatientId: ${program.patientId}`);
      console.log(`PrimaryPractitioner: ${program.primaryPractitionerId}`);
      console.log(`ProcedureDetails type: ${typeof program.procedureDetails}`);
      console.log(`ProcedureDetails isArray: ${Array.isArray(program.procedureDetails)}`);
      
      // Try to populate using the correct models
      const populatedProgram = await TherapyProgram.findById(program._id)
        .populate({
          path: 'patientId',
          model: 'Patient',
          select: 'firstName lastName email'
        })
        .populate({
          path: 'primaryPractitionerId', 
          model: 'Practitioner',
          select: 'firstName lastName email'
        });
      
      console.log(`After population - Patient: ${populatedProgram.patientId ? populatedProgram.patientId.firstName + ' ' + populatedProgram.patientId.lastName : 'null'}`);
      console.log(`After population - Practitioner: ${populatedProgram.primaryPractitionerId ? populatedProgram.primaryPractitionerId.firstName + ' ' + populatedProgram.primaryPractitionerId.lastName : 'null'}`);
    }
    
    // Now check for problems
    const brokenPrograms = await TherapyProgram.find({}).populate('patientId').populate('primaryPractitionerId');
    const problematicPrograms = brokenPrograms.filter(p => !p.patientId || !p.primaryPractitionerId);
    
    console.log(`\nFound ${problematicPrograms.length} problematic programs`);
    
    if (problematicPrograms.length === 0) {
      console.log('✅ No problematic programs found!');
      return;
    }
    
    // Find available patients and practitioners
    const allPatients = await Patient.find({});
    const allPractitioners = await Practitioner.find({});
    
    console.log(`\nFound ${allPatients.length} total patients in database`);
    allPatients.forEach(patient => {
      console.log(`Patient: ${patient.firstName} ${patient.lastName} - Email: ${patient.email} - ID: ${patient._id}`);
    });
    
    console.log(`\nFound ${allPractitioners.length} total practitioners in database`);
    allPractitioners.forEach(practitioner => {
      console.log(`Practitioner: ${practitioner.firstName} ${practitioner.lastName} - Email: ${practitioner.email} - ID: ${practitioner._id}`);
    });
    
    if (allPatients.length === 0 || allPractitioners.length === 0) {
      console.log('❌ No patients or practitioners found in database.');
      return;
    }
    
    const defaultPatient = allPatients[0];
    const defaultPractitioner = allPractitioners[0];
    
    console.log(`Using patient: ${defaultPatient.firstName} ${defaultPatient.lastName}`);
    console.log(`Using practitioner: ${defaultPractitioner.firstName} ${defaultPractitioner.lastName}`);
    
    for (const program of problematicPrograms) {
      console.log(`\n🔧 Fixing program: ${program._id}`);
      
      if (!program.patientId) {
        program.patientId = defaultPatient._id;
        console.log('Fixed patientId');
      }
      
      if (!program.primaryPractitionerId) {
        program.primaryPractitionerId = defaultPractitioner._id;
        console.log('Fixed primaryPractitionerId');
      }
      
      // Fix procedureDetails if it's not an array
      if (!Array.isArray(program.procedureDetails)) {
        console.log('Converting procedureDetails to array format...');
        program.procedureDetails = [
          {
            type: 'vamana',
            status: 'scheduled',
            scheduledDates: {},
            actualDates: {},
            duration: { purvaKarma: 7, pradhanaKarma: 1, paschatKarma: 5 },
            instructions: {
              preInstructions: 'Complete purva karma preparation',
              postInstructions: 'Follow paschat karma guidelines',
              dietaryRestrictions: 'Light, easily digestible food',
              medicineSchedule: 'As prescribed by practitioner'
            },
            notes: '',
            isCompleted: false
          },
          {
            type: 'virechana',
            status: 'scheduled',
            scheduledDates: {},
            actualDates: {},
            duration: { purvaKarma: 4, pradhanaKarma: 1, paschatKarma: 4 },
            instructions: {
              preInstructions: 'Snehana and swedana preparation',
              postInstructions: 'Proper rest and diet management',
              dietaryRestrictions: 'Avoid heavy and spicy foods',
              medicineSchedule: 'Virechana medicines as per schedule'
            },
            notes: '',
            isCompleted: false
          },
          {
            type: 'basti',
            status: 'scheduled',
            scheduledDates: {},
            actualDates: {},
            duration: { purvaKarma: 3, pradhanaKarma: 15, paschatKarma: 5 },
            instructions: {
              preInstructions: 'Oil massage and fomentation',
              postInstructions: 'Complete rest and dietary guidelines',
              dietaryRestrictions: 'Light, warm food only',
              medicineSchedule: 'Basti course as prescribed'
            },
            notes: '',
            isCompleted: false
          },
          {
            type: 'nasya',
            status: 'scheduled',
            scheduledDates: {},
            actualDates: {},
            duration: { purvaKarma: 1, pradhanaKarma: 7, paschatKarma: 2 },
            instructions: {
              preInstructions: 'Face and head massage',
              postInstructions: 'Avoid cold exposure',
              dietaryRestrictions: 'Warm, nourishing foods',
              medicineSchedule: 'Nasya drops as scheduled'
            },
            notes: '',
            isCompleted: false
          },
          {
            type: 'raktamokshana',
            status: 'scheduled',
            scheduledDates: {},
            actualDates: {},
            duration: { purvaKarma: 2, pradhanaKarma: 1, paschatKarma: 5 },
            instructions: {
              preInstructions: 'Blood purification preparation',
              postInstructions: 'Complete rest and monitoring',
              dietaryRestrictions: 'Blood-purifying diet',
              medicineSchedule: 'Post-procedure medications'
            },
            notes: '',
            isCompleted: false
          }
        ];
      }
      
      await program.save();
      console.log(`✅ Fixed program: ${program._id}`);
    }
    
    console.log('\n✅ All problematic programs have been fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing programs:', error);
  }
};

// Direct database queries to check collections
const checkCollections = async () => {
  try {
    console.log('\n=== COLLECTION ANALYSIS ===');
    
    // Check users collection directly
    const usersCollection = mongoose.connection.db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log('Direct users collection count:', userCount);
    
    if (userCount > 0) {
      const users = await usersCollection.find({}).toArray();
      console.log('Users in collection:', users.map(u => ({ _id: u._id, email: u.email, role: u.role })));
    }
    
    // Check if it's in a different collection name
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      if (col.name.toLowerCase().includes('user')) {
        const count = await mongoose.connection.db.collection(col.name).countDocuments();
        console.log(`Collection "${col.name}" has ${count} documents`);
        
        if (count > 0) {
          const docs = await mongoose.connection.db.collection(col.name).find({}).limit(5).toArray();
          console.log(`Sample docs from ${col.name}:`, docs.map(d => ({ _id: d._id, email: d.email })));
        }
      }
    }
    
    // Check therapy programs collection
    const therapyCollection = mongoose.connection.db.collection('therapyprograms');
    const therapyCount = await therapyCollection.countDocuments();
    console.log('Direct therapy programs collection count:', therapyCount);
    
  } catch (error) {
    console.error('Error checking collections:', error);
  }
};

const main = async () => {
  await connectDB();
  
  // Check collections directly
  await checkCollections();
  
  await fixBrokenPrograms();
  await mongoose.disconnect();
  console.log('🔚 Script completed');
};

main().catch(console.error);