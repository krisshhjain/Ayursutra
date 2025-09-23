import mongoose from 'mongoose';
import TherapyTemplate from '../models/TherapyTemplate.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const defaultTherapyTemplates = [
  {
    name: 'Complete Panchakarma Detoxification',
    category: 'panchakarma',
    subcategory: 'full-detox',
    description: 'A comprehensive 21-day Panchakarma program for complete detoxification and rejuvenation. Includes preparatory procedures, main treatments, and post-therapy care.',
    totalDuration: 21,
    sessions: [
      {
        sessionNumber: 1,
        title: 'Initial Consultation & Assessment',
        duration: 60,
        description: 'Comprehensive health assessment, constitution analysis, and treatment planning.',
        preProcedureInstructions: [
          {
            instruction: 'Fast for 4 hours before consultation',
            timeBeforeSession: 240,
            category: 'dietary'
          },
          {
            instruction: 'Avoid heavy meals 24 hours before',
            timeBeforeSession: 1440,
            category: 'dietary'
          }
        ],
        postProcedureInstructions: [
          {
            instruction: 'Follow prescribed dietary guidelines',
            timeAfterSession: 0,
            category: 'dietary'
          }
        ],
        requiredMaterials: [],
        contraindications: ['Acute illness', 'Fever'],
        specialRequirements: ['Detailed medical history'],
        minimumGapDays: 1,
        maximumGapDays: 2
      },
      {
        sessionNumber: 2,
        title: 'Deepana Pachana (Digestive Fire Enhancement)',
        duration: 90,
        description: 'Herbal medicines and light treatments to enhance digestive fire and prepare for detoxification.',
        preProcedureInstructions: [
          {
            instruction: 'Take prescribed herbs 30 minutes before meals',
            timeBeforeSession: 30,
            category: 'medication'
          },
          {
            instruction: 'Light breakfast only (khichdi or fruits)',
            timeBeforeSession: 120,
            category: 'dietary'
          }
        ],
        postProcedureInstructions: [
          {
            instruction: 'Rest for 30 minutes',
            timeAfterSession: 30,
            category: 'rest'
          },
          {
            instruction: 'Drink warm water only for 2 hours',
            timeAfterSession: 120,
            category: 'dietary'
          }
        ],
        requiredMaterials: [
          { material: 'Digestive herbs', quantity: '5g', preparation: 'Powder form' },
          { material: 'Ginger tea', quantity: '200ml', preparation: 'Fresh preparation' }
        ],
        contraindications: ['Hyperacidity', 'Ulcers'],
        specialRequirements: [],
        minimumGapDays: 1,
        maximumGapDays: 2
      },
      {
        sessionNumber: 3,
        title: 'Snehana - Internal Oleation (Day 1)',
        duration: 120,
        description: 'First day of internal oleation with medicated ghee to prepare tissues for detoxification.',
        preProcedureInstructions: [
          {
            instruction: 'Empty stomach - no food for 8 hours',
            timeBeforeSession: 480,
            category: 'dietary'
          },
          {
            instruction: 'Warm oil bath 1 hour before',
            timeBeforeSession: 60,
            category: 'preparation'
          }
        ],
        postProcedureInstructions: [
          {
            instruction: 'No food until proper appetite returns',
            timeAfterSession: 240,
            category: 'dietary'
          },
          {
            instruction: 'Light activities only',
            timeAfterSession: 480,
            category: 'lifestyle'
          },
          {
            instruction: 'Warm water sips only',
            timeAfterSession: 120,
            category: 'dietary'
          }
        ],
        requiredMaterials: [
          { material: 'Medicated ghee', quantity: '30ml', preparation: 'Lukewarm' },
          { material: 'Ginger juice', quantity: '5ml', preparation: 'Fresh' }
        ],
        contraindications: ['High cholesterol', 'Liver disease', 'Diabetes'],
        specialRequirements: ['Monitor for nausea', 'Check digestion time'],
        minimumGapDays: 1,
        maximumGapDays: 1
      },
      {
        sessionNumber: 4,
        title: 'Snehana - Internal Oleation (Day 2)',
        duration: 120,
        description: 'Second day of internal oleation with increased quantity of medicated ghee.',
        preProcedureInstructions: [
          {
            instruction: 'Empty stomach - no food for 8 hours',
            timeBeforeSession: 480,
            category: 'dietary'
          }
        ],
        postProcedureInstructions: [
          {
            instruction: 'No food until proper appetite returns',
            timeAfterSession: 240,
            category: 'dietary'
          },
          {
            instruction: 'Light activities only',
            timeAfterSession: 480,
            category: 'lifestyle'
          }
        ],
        requiredMaterials: [
          { material: 'Medicated ghee', quantity: '60ml', preparation: 'Lukewarm' }
        ],
        contraindications: ['Nausea from previous day', 'Indigestion'],
        specialRequirements: ['Assess tolerance from Day 1'],
        minimumGapDays: 1,
        maximumGapDays: 1
      },
      {
        sessionNumber: 5,
        title: 'Abhyanga - Full Body Oil Massage',
        duration: 90,
        description: 'Therapeutic full-body massage with warm medicated oils to mobilize toxins.',
        preProcedureInstructions: [
          {
            instruction: 'Light breakfast 2 hours before',
            timeBeforeSession: 120,
            category: 'dietary'
          },
          {
            instruction: 'Shower with warm water',
            timeBeforeSession: 30,
            category: 'preparation'
          }
        ],
        postProcedureInstructions: [
          {
            instruction: 'Steam bath for 10-15 minutes',
            timeAfterSession: 15,
            category: 'followup'
          },
          {
            instruction: 'Rest for 1 hour',
            timeAfterSession: 60,
            category: 'rest'
          },
          {
            instruction: 'Warm shower after 2 hours',
            timeAfterSession: 120,
            category: 'followup'
          }
        ],
        requiredMaterials: [
          { material: 'Sesame oil', quantity: '100ml', preparation: 'Warm' },
          { material: 'Medicated oil', quantity: '50ml', preparation: 'Body temperature' }
        ],
        contraindications: ['Skin infections', 'Open wounds', 'Fever'],
        specialRequirements: ['Check oil temperature', 'Monitor for allergic reactions'],
        minimumGapDays: 1,
        maximumGapDays: 2
      }
    ],
    overallPreparation: [
      {
        instruction: 'Start light vegetarian diet',
        daysBeforeStart: 7,
        category: 'dietary'
      },
      {
        instruction: 'Avoid alcohol and smoking',
        daysBeforeStart: 14,
        category: 'lifestyle'
      },
      {
        instruction: 'Complete medical checkup',
        daysBeforeStart: 3,
        category: 'consultation'
      }
    ],
    overallPostCare: [
      {
        instruction: 'Continue light diet for 7 days',
        daysAfterCompletion: 7,
        category: 'dietary'
      },
      {
        instruction: 'Follow-up consultation',
        daysAfterCompletion: 14,
        category: 'followup'
      },
      {
        instruction: 'Gradual return to normal activities',
        daysAfterCompletion: 7,
        category: 'lifestyle'
      }
    ],
    requiredCertifications: ['Panchakarma Specialist', 'Ayurveda Practitioner'],
    experienceLevel: 'advanced',
    preferredTimeSlots: [
      { startTime: '09:00', endTime: '11:00', dayOfWeek: 'monday' },
      { startTime: '09:00', endTime: '11:00', dayOfWeek: 'tuesday' },
      { startTime: '09:00', endTime: '11:00', dayOfWeek: 'wednesday' },
      { startTime: '09:00', endTime: '11:00', dayOfWeek: 'thursday' },
      { startTime: '09:00', endTime: '11:00', dayOfWeek: 'friday' }
    ],
    estimatedCost: { currency: 'INR', amount: 45000 },
    isActive: true,
    version: 1
  },
  {
    name: 'Abhyanga Therapy Course',
    category: 'panchakarma',
    subcategory: 'massage-therapy',
    description: 'A 7-day therapeutic massage course using warm medicated oils for relaxation and toxin mobilization.',
    totalDuration: 7,
    sessions: [
      {
        sessionNumber: 1,
        title: 'Consultation and First Abhyanga',
        duration: 90,
        description: 'Initial assessment followed by the first therapeutic massage session.',
        preProcedureInstructions: [
          {
            instruction: 'Light meal 2 hours before',
            timeBeforeSession: 120,
            category: 'dietary'
          },
          {
            instruction: 'Warm shower',
            timeBeforeSession: 30,
            category: 'preparation'
          }
        ],
        postProcedureInstructions: [
          {
            instruction: 'Steam bath for 10 minutes',
            timeAfterSession: 10,
            category: 'followup'
          },
          {
            instruction: 'Rest for 30 minutes',
            timeAfterSession: 30,
            category: 'rest'
          }
        ],
        requiredMaterials: [
          { material: 'Sesame oil', quantity: '100ml', preparation: 'Warm' }
        ],
        contraindications: ['Fever', 'Skin conditions'],
        specialRequirements: [],
        minimumGapDays: 1,
        maximumGapDays: 1
      }
    ],
    overallPreparation: [
      {
        instruction: 'Avoid heavy meals',
        daysBeforeStart: 1,
        category: 'dietary'
      }
    ],
    overallPostCare: [
      {
        instruction: 'Maintain regular oil massage routine',
        daysAfterCompletion: 30,
        category: 'lifestyle'
      }
    ],
    requiredCertifications: ['Massage Therapy', 'Ayurveda Basic'],
    experienceLevel: 'intermediate',
    preferredTimeSlots: [
      { startTime: '10:00', endTime: '17:00', dayOfWeek: 'monday' },
      { startTime: '10:00', endTime: '17:00', dayOfWeek: 'tuesday' },
      { startTime: '10:00', endTime: '17:00', dayOfWeek: 'wednesday' },
      { startTime: '10:00', endTime: '17:00', dayOfWeek: 'thursday' },
      { startTime: '10:00', endTime: '17:00', dayOfWeek: 'friday' }
    ],
    estimatedCost: { currency: 'INR', amount: 8500 },
    isActive: true,
    version: 1
  },
  {
    name: 'Shirodhara Relaxation Therapy',
    category: 'panchakarma',
    subcategory: 'neurological',
    description: 'A 5-day Shirodhara therapy for stress relief, mental clarity, and nervous system rejuvenation.',
    totalDuration: 5,
    sessions: [
      {
        sessionNumber: 1,
        title: 'Preparatory Shirodhara Session',
        duration: 75,
        description: 'Initial Shirodhara session with constitutional assessment and customized oil selection.',
        preProcedureInstructions: [
          {
            instruction: 'Light breakfast only',
            timeBeforeSession: 120,
            category: 'dietary'
          },
          {
            instruction: 'Avoid caffeine for 4 hours',
            timeBeforeSession: 240,
            category: 'dietary'
          },
          {
            instruction: 'Head and shoulder massage',
            timeBeforeSession: 15,
            category: 'preparation'
          }
        ],
        postProcedureInstructions: [
          {
            instruction: 'Rest in quiet room for 20 minutes',
            timeAfterSession: 20,
            category: 'rest'
          },
          {
            instruction: 'Avoid washing hair for 4 hours',
            timeAfterSession: 240,
            category: 'followup'
          },
          {
            instruction: 'Light activities only',
            timeAfterSession: 180,
            category: 'lifestyle'
          }
        ],
        requiredMaterials: [
          { material: 'Medicated oil for Shirodhara', quantity: '500ml', preparation: 'Body temperature' },
          { material: 'Cotton cloth', quantity: '2 pieces', preparation: 'Clean and soft' }
        ],
        contraindications: ['Head injuries', 'Scalp infections', 'Recent head surgery'],
        specialRequirements: ['Oil temperature monitoring', 'Patient comfort check'],
        minimumGapDays: 1,
        maximumGapDays: 1
      }
    ],
    overallPreparation: [
      {
        instruction: 'Reduce stress and screen time',
        daysBeforeStart: 3,
        category: 'lifestyle'
      },
      {
        instruction: 'Light vegetarian diet',
        daysBeforeStart: 2,
        category: 'dietary'
      }
    ],
    overallPostCare: [
      {
        instruction: 'Continue stress management practices',
        daysAfterCompletion: 14,
        category: 'lifestyle'
      },
      {
        instruction: 'Regular meditation practice',
        daysAfterCompletion: 30,
        category: 'lifestyle'
      }
    ],
    requiredCertifications: ['Shirodhara Specialist', 'Ayurveda Practitioner'],
    experienceLevel: 'intermediate',
    preferredTimeSlots: [
      { startTime: '14:00', endTime: '17:00', dayOfWeek: 'monday' },
      { startTime: '14:00', endTime: '17:00', dayOfWeek: 'wednesday' },
      { startTime: '14:00', endTime: '17:00', dayOfWeek: 'friday' }
    ],
    estimatedCost: { currency: 'INR', amount: 12500 },
    isActive: true,
    version: 1
  }
];

async function seedTherapyTemplates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding therapy templates');

    // Clear existing templates (optional)
    const existingCount = await TherapyTemplate.countDocuments();
    console.log(`Found ${existingCount} existing therapy templates`);

    // Find an admin user to set as creator
    const adminUser = await mongoose.model('User').findOne({ userType: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`Using admin user: ${adminUser.name} (${adminUser._id})`);

    // Create templates
    for (const templateData of defaultTherapyTemplates) {
      const existingTemplate = await TherapyTemplate.findOne({ name: templateData.name });
      
      if (existingTemplate) {
        console.log(`Template "${templateData.name}" already exists, skipping...`);
        continue;
      }

      const template = new TherapyTemplate({
        ...templateData,
        createdBy: adminUser._id
      });

      // Validate session sequence
      const validation = template.validateSessionSequence();
      if (!validation.isValid) {
        console.error(`Validation failed for template "${templateData.name}":`, validation.errors);
        continue;
      }

      await template.save();
      console.log(`✅ Created therapy template: ${template.name}`);
    }

    console.log('\n🎉 Therapy template seeding completed successfully!');
    
    // Display summary
    const totalTemplates = await TherapyTemplate.countDocuments();
    console.log(`Total therapy templates in database: ${totalTemplates}`);
    
    const templatesByCategory = await TherapyTemplate.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    console.log('\nTemplates by category:');
    templatesByCategory.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} templates`);
    });

  } catch (error) {
    console.error('Error seeding therapy templates:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTherapyTemplates();
}

export default seedTherapyTemplates;