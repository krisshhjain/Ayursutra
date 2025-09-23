import mongoose from 'mongoose';
import TherapyTemplate from './models/TherapyTemplate.js';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ayursutra';

const panchakarmaTemplates = [
  {
    name: "Complete Vamana Karma (Therapeutic Emesis)",
    category: "panchakarma",
    subcategory: "vamana",
    description: "Complete Vamana Karma therapy for respiratory disorders, skin diseases, and kapha-related conditions. Includes proper purva karma preparation and paschat karma recovery.",
    totalDuration: 21,
    estimatedCost: {
      currency: "INR",
      amount: 35000
    },
    experienceLevel: "advanced",
    requiredCertifications: ["Panchakarma Specialist", "Ayurveda MD"],
    sessions: [
      {
        sessionNumber: 1,
        title: "Initial Assessment & Purva Karma Planning",
        duration: 90,
        description: "Comprehensive pulse diagnosis, prakriti assessment, and therapy planning",
        preProcedureInstructions: [
          {
            instruction: "Follow light vegetarian diet for 3 days",
            timeBeforeSession: 4320, // 3 days in minutes
            category: "dietary"
          },
          {
            instruction: "Avoid heavy meals 2 hours before consultation",
            timeBeforeSession: 120,
            category: "dietary"
          }
        ],
        postProcedureInstructions: [
          {
            instruction: "Begin prescribed herbal preparations",
            timeAfterSession: 60,
            category: "medication"
          }
        ],
        requiredMaterials: [
          { material: "Pulse diagnosis equipment", quantity: "1 set" },
          { material: "Assessment forms", quantity: "1 set" }
        ],
        minimumGapDays: 1,
        maximumGapDays: 3
      },
      {
        sessionNumber: 2,
        title: "Deepana Pachana (Digestive Fire Enhancement)",
        duration: 60,
        description: "Administration of digestive medicines to prepare for snehana",
        preProcedureInstructions: [
          {
            instruction: "Take prescribed deepana medicines as directed",
            timeBeforeSession: 1440, // 1 day
            category: "medication"
          },
          {
            instruction: "Light breakfast only",
            timeBeforeSession: 120,
            category: "dietary"
          }
        ],
        postProcedureInstructions: [
          {
            instruction: "Monitor appetite and digestion",
            timeAfterSession: 30,
            category: "monitoring"
          }
        ],
        requiredMaterials: [
          { material: "Deepana medicines", quantity: "As prescribed" }
        ],
        minimumGapDays: 2,
        maximumGapDays: 4
      },
      {
        sessionNumber: 3,
        title: "Snehana Day 1 (Internal Oleation)",
        duration: 45,
        description: "First day of internal ghee administration for tissue preparation",
        preProcedureInstructions: [
          {
            instruction: "Empty stomach - no food for 12 hours",
            timeBeforeSession: 720,
            category: "dietary"
          },
          {
            instruction: "Avoid cold water",
            timeBeforeSession: 60,
            category: "lifestyle"
          }
        ],
        postProcedureInstructions: [
          {
            instruction: "Take warm water only",
            timeAfterSession: 30,
            category: "dietary"
          },
          {
            instruction: "Light khichdi meal after full digestion",
            timeAfterSession: 180,
            category: "dietary"
          }
        ],
        requiredMaterials: [
          { material: "Medicated ghee", quantity: "50ml", preparation: "Warmed to body temperature" }
        ],
        minimumGapDays: 1,
        maximumGapDays: 1
      },
      {
        sessionNumber: 4,
        title: "Snehana Day 2 (Increased Oleation)",
        duration: 45,
        description: "Second day with increased ghee quantity",
        preProcedureInstructions: [
          {
            instruction: "Empty stomach - no food for 12 hours",
            timeBeforeSession: 720,
            category: "dietary"
          }
        ],
        postProcedureInstructions: [
          {
            instruction: "Monitor for signs of proper snehana",
            timeAfterSession: 60,
            category: "monitoring"
          }
        ],
        requiredMaterials: [
          { material: "Medicated ghee", quantity: "75ml", preparation: "Warmed to body temperature" }
        ],
        minimumGapDays: 1,
        maximumGapDays: 1
      },
      {
        sessionNumber: 5,
        title: "Snehana Day 3 (Maximum Oleation)",
        duration: 45,
        description: "Final day of internal oleation with maximum tolerable dose",
        preProcedureInstructions: [
          {
            instruction: "Empty stomach - no food for 12 hours",
            timeBeforeSession: 720,
            category: "dietary"
          }
        ],
        postProcedureInstructions: [
          {
            instruction: "Assess for samyak snigdha lakshana (proper oleation signs)",
            timeAfterSession: 30,
            category: "monitoring"
          }
        ],
        requiredMaterials: [
          { material: "Medicated ghee", quantity: "100ml", preparation: "Warmed to body temperature" }
        ],
        minimumGapDays: 1,
        maximumGapDays: 2
      },
      {
        sessionNumber: 6,
        title: "Swedana Day 1 (Sudation Therapy)",
        duration: 60,
        description: "Steam therapy to enhance tissue mobility",
        preProcedureInstructions: [
          {
            instruction: "Light meal 2 hours before",
            timeBeforeSession: 120,
            category: "dietary"
          }
        ],
        postProcedureInstructions: [
          {
            instruction: "Rest in warm room for 30 minutes",
            timeAfterSession: 30,
            category: "rest"
          },
          {
            instruction: "Avoid cold exposure for 24 hours",
            timeAfterSession: 1440,
            category: "lifestyle"
          }
        ],
        requiredMaterials: [
          { material: "Steam chamber", quantity: "1" },
          { material: "Medicated decoction for steam", quantity: "2 liters" }
        ],
        minimumGapDays: 1,
        maximumGapDays: 1
      },
      {
        sessionNumber: 7,
        title: "Swedana Day 2 (Intensive Sudation)",
        duration: 75,
        description: "Extended steam therapy with specific herbal preparations",
        preProcedureInstructions: [
          {
            instruction: "Light meal 2 hours before",
            timeBeforeSession: 120,
            category: "dietary"
          }
        ],
        postProcedureInstructions: [
          {
            instruction: "Monitor for proper swedana signs",
            timeAfterSession: 30,
            category: "monitoring"
          }
        ],
        requiredMaterials: [
          { material: "Steam chamber", quantity: "1" },
          { material: "Specialized herbal decoction", quantity: "3 liters" }
        ],
        minimumGapDays: 1,
        maximumGapDays: 1
      },
      {
        sessionNumber: 8,
        title: "Vamana Karma Day (Main Procedure)",
        duration: 240,
        description: "Main therapeutic emesis procedure with complete monitoring",
        preProcedureInstructions: [
          {
            instruction: "Complete fasting from midnight",
            timeBeforeSession: 480,
            category: "dietary"
          },
          {
            instruction: "Mental preparation and relaxation",
            timeBeforeSession: 60,
            category: "preparation"
          }
        ],
        postProcedureInstructions: [
          {
            instruction: "Complete rest for 4 hours",
            timeAfterSession: 240,
            category: "rest"
          },
          {
            instruction: "Light liquid diet only",
            timeAfterSession: 240,
            category: "dietary"
          }
        ],
        requiredMaterials: [
          { material: "Vamana dravya (emetic medicines)", quantity: "As per body weight" },
          { material: "Emergency medicines", quantity: "Full set" },
          { material: "Monitoring equipment", quantity: "Complete" }
        ],
        contraindications: ["Pregnancy", "Severe heart disease", "Acute infections"],
        minimumGapDays: 1,
        maximumGapDays: 2
      },
      {
        sessionNumber: 9,
        title: "Samsarjana Krama Day 1",
        duration: 30,
        description: "First day of graduated diet introduction",
        preProcedureInstructions: [
          {
            instruction: "Complete rest since vamana",
            timeBeforeSession: 1440,
            category: "rest"
          }
        ],
        postProcedureInstructions: [
          {
            instruction: "Peya (rice water) only",
            timeAfterSession: 0,
            category: "dietary"
          }
        ],
        requiredMaterials: [
          { material: "Organic rice", quantity: "50g" }
        ],
        minimumGapDays: 1,
        maximumGapDays: 1
      },
      {
        sessionNumber: 10,
        title: "Samsarjana Krama Day 2",
        duration: 30,
        description: "Second day with vilepi (thin rice porridge)",
        postProcedureInstructions: [
          {
            instruction: "Vilepi (thin rice porridge) introduction",
            timeAfterSession: 0,
            category: "dietary"
          }
        ],
        requiredMaterials: [
          { material: "Organic rice", quantity: "75g" }
        ],
        minimumGapDays: 1,
        maximumGapDays: 1
      }
    ],
    overallPreparation: [
      {
        instruction: "Complete health assessment and lab tests",
        daysBeforeStart: 7,
        category: "consultation"
      },
      {
        instruction: "Begin sattvavajaya chikitsa (psychological preparation)",
        daysBeforeStart: 5,
        category: "lifestyle"
      },
      {
        instruction: "Stop all unnecessary medications",
        daysBeforeStart: 3,
        category: "medication"
      }
    ],
    overallPostCare: [
      {
        instruction: "Follow rasayana therapy for rejuvenation",
        daysAfterCompletion: 1,
        category: "followup"
      },
      {
        instruction: "Regular follow-up consultations",
        daysAfterCompletion: 7,
        category: "monitoring"
      },
      {
        instruction: "Lifestyle modifications as per prakriti",
        daysAfterCompletion: 30,
        category: "lifestyle"
      }
    ],
    preferredTimeSlots: [
      {
        startTime: "06:00",
        endTime: "10:00",
        dayOfWeek: "any"
      }
    ]
  },
  {
    name: "Virechana Karma (Therapeutic Purgation)",
    category: "panchakarma",
    subcategory: "virechana",
    description: "Complete Virechana therapy for pitta disorders, skin diseases, and metabolic conditions",
    totalDuration: 15,
    estimatedCost: {
      currency: "INR",
      amount: 28000
    },
    experienceLevel: "intermediate",
    requiredCertifications: ["Panchakarma Specialist"],
    sessions: [
      {
        sessionNumber: 1,
        title: "Assessment & Virechana Planning",
        duration: 90,
        description: "Initial assessment for virechana eligibility and planning",
        preProcedureInstructions: [
          {
            instruction: "Light diet for 2 days",
            timeBeforeSession: 2880,
            category: "dietary"
          }
        ],
        postProcedureInstructions: [
          {
            instruction: "Begin preparatory medicines",
            timeAfterSession: 60,
            category: "medication"
          }
        ],
        requiredMaterials: [
          { material: "Assessment forms", quantity: "1 set" }
        ],
        minimumGapDays: 1,
        maximumGapDays: 2
      },
      {
        sessionNumber: 2,
        title: "Deepana Pachana for Virechana",
        duration: 45,
        description: "Digestive preparation specific for virechana",
        preProcedureInstructions: [
          {
            instruction: "Take prescribed medicines",
            timeBeforeSession: 1440,
            category: "medication"
          }
        ],
        postProcedureInstructions: [
          {
            instruction: "Monitor digestive capacity",
            timeAfterSession: 30,
            category: "monitoring"
          }
        ],
        requiredMaterials: [
          { material: "Deepana medicines", quantity: "As prescribed" }
        ],
        minimumGapDays: 2,
        maximumGapDays: 3
      },
      {
        sessionNumber: 3,
        title: "Snehana for Virechana Day 1",
        duration: 45,
        description: "Internal oleation with specific ghee preparations",
        preProcedureInstructions: [
          {
            instruction: "Empty stomach for 12 hours",
            timeBeforeSession: 720,
            category: "dietary"
          }
        ],
        postProcedureInstructions: [
          {
            instruction: "Appropriate diet after digestion",
            timeAfterSession: 180,
            category: "dietary"
          }
        ],
        requiredMaterials: [
          { material: "Virechana-specific ghee", quantity: "60ml" }
        ],
        minimumGapDays: 1,
        maximumGapDays: 1
      },
      {
        sessionNumber: 4,
        title: "Virechana Karma Day",
        duration: 180,
        description: "Main therapeutic purgation procedure",
        preProcedureInstructions: [
          {
            instruction: "Fasting from midnight",
            timeBeforeSession: 480,
            category: "dietary"
          }
        ],
        postProcedureInstructions: [
          {
            instruction: "Complete rest and monitoring",
            timeAfterSession: 240,
            category: "rest"
          }
        ],
        requiredMaterials: [
          { material: "Virechana dravya", quantity: "As per assessment" },
          { material: "Emergency kit", quantity: "Complete" }
        ],
        minimumGapDays: 1,
        maximumGapDays: 1
      }
    ],
    overallPreparation: [
      {
        instruction: "Complete medical evaluation",
        daysBeforeStart: 5,
        category: "consultation"
      }
    ],
    overallPostCare: [
      {
        instruction: "Gradual diet introduction",
        daysAfterCompletion: 1,
        category: "dietary"
      }
    ]
  },
  {
    name: "Abhyanga & Swedana Package",
    category: "panchakarma",
    subcategory: "general",
    description: "Preparatory panchakarma package with oil massage and steam therapy",
    totalDuration: 7,
    estimatedCost: {
      currency: "INR",
      amount: 12000
    },
    experienceLevel: "beginner",
    requiredCertifications: [],
    sessions: [
      {
        sessionNumber: 1,
        title: "Full Body Abhyanga & Steam",
        duration: 90,
        description: "Complete oil massage followed by herbal steam therapy",
        preProcedureInstructions: [
          {
            instruction: "Light meal 2 hours before",
            timeBeforeSession: 120,
            category: "dietary"
          }
        ],
        postProcedureInstructions: [
          {
            instruction: "Rest for 30 minutes",
            timeAfterSession: 30,
            category: "rest"
          },
          {
            instruction: "Warm bath after 2 hours",
            timeAfterSession: 120,
            category: "lifestyle"
          }
        ],
        requiredMaterials: [
          { material: "Medicated oils", quantity: "200ml" },
          { material: "Steam chamber", quantity: "1" }
        ],
        minimumGapDays: 1,
        maximumGapDays: 2
      }
    ],
    overallPreparation: [
      {
        instruction: "Avoid heavy meals day before",
        daysBeforeStart: 1,
        category: "dietary"
      }
    ],
    overallPostCare: [
      {
        instruction: "Maintain regular oil massage routine",
        daysAfterCompletion: 7,
        category: "lifestyle"
      }
    ]
  }
];

async function seedTherapyTemplates() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create a default admin user for templates (you might want to use an existing user ID)
    const adminUserId = new mongoose.Types.ObjectId(); // In practice, use actual admin user ID

    // Add createdBy field to each template
    const templatesWithCreator = panchakarmaTemplates.map(template => ({
      ...template,
      createdBy: adminUserId
    }));

    // Clear existing templates (optional - remove this line in production)
    console.log('Clearing existing panchakarma templates...');
    await TherapyTemplate.deleteMany({ category: 'panchakarma' });
    console.log('✅ Cleared existing templates');
    
    // Insert new templates
    console.log('Inserting new therapy templates...');
    const result = await TherapyTemplate.insertMany(templatesWithCreator);
    
    console.log(`✅ Successfully created ${result.length} therapy templates:`);
    result.forEach(template => {
      console.log(`   - ${template.name} (${template.subcategory})`);
    });

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error seeding therapy templates:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the seeding function
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTherapyTemplates();
}

export default seedTherapyTemplates;
