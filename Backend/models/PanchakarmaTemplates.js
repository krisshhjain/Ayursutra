// Authentic Panchakarma Procedure Templates
// Based on traditional Ayurvedic protocols

export const PANCHAKARMA_PROCEDURES = {
  vamana: {
    name: 'Vamana (Therapeutic Emesis)',
    description: 'Therapeutic emesis to eliminate Kapha dosha imbalances',
    phases: {
      purvaKarma: {
        name: 'Purva Karma (Preparation)',
        duration: { min: 5, max: 7, default: 7 },
        sessions: [
          { day: 1, name: 'Initial Assessment', procedures: ['Prakriti Analysis', 'Vikriti Assessment'] },
          { day: 2, name: 'Snehana Day 1', procedures: ['Internal Oleation', 'External Oleation'] },
          { day: 3, name: 'Snehana Day 2', procedures: ['Internal Oleation', 'Abhyanga'] },
          { day: 4, name: 'Snehana Day 3', procedures: ['Internal Oleation', 'Shirodhara'] },
          { day: 5, name: 'Swedana Day 1', procedures: ['Steam Therapy', 'Preparatory Diet'] },
          { day: 6, name: 'Swedana Day 2', procedures: ['Steam Therapy', 'Pre-Vamana Diet'] },
          { day: 7, name: 'Pre-Vamana Preparation', procedures: ['Final Assessment', 'Vamana Preparation'] }
        ]
      },
      pradhanaKarma: {
        name: 'Pradhana Karma (Main Procedure)',
        duration: { min: 1, max: 1, default: 1 },
        sessions: [
          { day: 1, name: 'Vamana Day', procedures: ['Therapeutic Emesis', 'Post-Vamana Care'] }
        ]
      },
      paschatKarma: {
        name: 'Paschat Karma (Post Care)',
        duration: { min: 3, max: 7, default: 5 },
        sessions: [
          { day: 1, name: 'Samsarjana Day 1', procedures: ['Peya (Rice Water)', 'Rest'] },
          { day: 2, name: 'Samsarjana Day 2', procedures: ['Vilepi (Thin Rice Gruel)', 'Gentle Activities'] },
          { day: 3, name: 'Samsarjana Day 3', procedures: ['Yavagu (Thick Rice Gruel)', 'Light Yoga'] },
          { day: 4, name: 'Samsarjana Day 4', procedures: ['Anna (Light Rice)', 'Normal Activities'] },
          { day: 5, name: 'Final Assessment', procedures: ['Post-Treatment Analysis', 'Lifestyle Guidance'] }
        ]
      }
    },
    totalDuration: { min: 9, max: 15, default: 13 },
    contraindications: ['Pregnancy', 'Severe heart conditions', 'Recent surgery'],
    indications: ['Kapha disorders', 'Respiratory issues', 'Skin conditions', 'Obesity']
  },

  virechana: {
    name: 'Virechana (Therapeutic Purgation)',
    description: 'Therapeutic purgation to eliminate Pitta dosha imbalances',
    phases: {
      purvaKarma: {
        name: 'Purva Karma (Preparation)',
        duration: { min: 3, max: 5, default: 4 },
        sessions: [
          { day: 1, name: 'Initial Assessment', procedures: ['Prakriti Analysis', 'Agni Assessment'] },
          { day: 2, name: 'Snehana Day 1', procedures: ['Ghrita Pana', 'Abhyanga'] },
          { day: 3, name: 'Snehana Day 2', procedures: ['Ghrita Pana', 'Swedana'] },
          { day: 4, name: 'Pre-Virechana Preparation', procedures: ['Light Diet', 'Mental Preparation'] }
        ]
      },
      pradhanaKarma: {
        name: 'Pradhana Karma (Main Procedure)',
        duration: { min: 1, max: 1, default: 1 },
        sessions: [
          { day: 1, name: 'Virechana Day', procedures: ['Therapeutic Purgation', 'Monitoring'] }
        ]
      },
      paschatKarma: {
        name: 'Paschat Karma (Post Care)',
        duration: { min: 3, max: 5, default: 4 },
        sessions: [
          { day: 1, name: 'Samsarjana Day 1', procedures: ['Peya', 'Complete Rest'] },
          { day: 2, name: 'Samsarjana Day 2', procedures: ['Vilepi', 'Gradual Activity'] },
          { day: 3, name: 'Samsarjana Day 3', procedures: ['Yavagu', 'Light Movement'] },
          { day: 4, name: 'Recovery Assessment', procedures: ['Final Check', 'Diet Planning'] }
        ]
      }
    },
    totalDuration: { min: 7, max: 11, default: 9 },
    contraindications: ['Pregnancy', 'Severe dehydration', 'Inflammatory bowel disease'],
    indications: ['Pitta disorders', 'Liver conditions', 'Skin diseases', 'Metabolic disorders']
  },

  basti: {
    name: 'Basti (Enema Therapy)',
    description: 'Therapeutic enemas to eliminate Vata dosha imbalances',
    phases: {
      purvaKarma: {
        name: 'Purva Karma (Preparation)',
        duration: { min: 2, max: 3, default: 3 },
        sessions: [
          { day: 1, name: 'Assessment & Preparation', procedures: ['Vata Analysis', 'Diet Planning'] },
          { day: 2, name: 'Snehana', procedures: ['Internal Oleation', 'Abhyanga'] },
          { day: 3, name: 'Swedana', procedures: ['Steam Therapy', 'Basti Preparation'] }
        ]
      },
      pradhanaKarma: {
        name: 'Pradhana Karma (Main Course)',
        duration: { min: 8, max: 30, default: 15 },
        courseTypes: {
          karma: { sessions: 8, description: 'Basic Basti course for mild conditions' },
          kala: { sessions: 15, description: 'Standard Basti course for moderate conditions' },
          yoga: { sessions: 30, description: 'Extended course for chronic conditions' }
        },
        sessionPattern: 'Alternating Anuvasana (oil) and Niruha (decoction) Basti'
      },
      paschatKarma: {
        name: 'Paschat Karma (Post Care)',
        duration: { min: 3, max: 7, default: 5 },
        sessions: [
          { day: 1, name: 'Initial Recovery', procedures: ['Rest', 'Light Diet'] },
          { day: 2, name: 'Activity Restoration', procedures: ['Gentle Exercise', 'Normal Diet'] },
          { day: 3, name: 'Strength Building', procedures: ['Yoga', 'Nutritious Diet'] },
          { day: 4, name: 'Lifestyle Integration', procedures: ['Regular Activities', 'Diet Guidelines'] },
          { day: 5, name: 'Final Assessment', procedures: ['Progress Review', 'Future Planning'] }
        ]
      }
    },
    totalDuration: { min: 13, max: 40, default: 23 },
    contraindications: ['Severe weakness', 'Rectal bleeding', 'Severe constipation'],
    indications: ['Vata disorders', 'Joint problems', 'Neurological issues', 'Chronic pain']
  },

  nasya: {
    name: 'Nasya (Nasal Therapy)',
    description: 'Therapeutic nasal administration for head and neck disorders',
    phases: {
      purvaKarma: {
        name: 'Purva Karma (Preparation)',
        duration: { min: 1, max: 2, default: 1 },
        sessions: [
          { day: 1, name: 'Assessment & Preparation', procedures: ['Nasal Examination', 'Steam Inhalation'] }
        ]
      },
      pradhanaKarma: {
        name: 'Pradhana Karma (Main Treatment)',
        duration: { min: 7, max: 21, default: 7 },
        sessions: Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          name: `Nasya Day ${i + 1}`,
          procedures: ['Nasal Administration', 'Head Massage', 'Steam Inhalation']
        }))
      },
      paschatKarma: {
        name: 'Paschat Karma (Post Care)',
        duration: { min: 1, max: 3, default: 2 },
        sessions: [
          { day: 1, name: 'Recovery Day 1', procedures: ['Gentle Activities', 'Avoid Cold'] },
          { day: 2, name: 'Final Assessment', procedures: ['Progress Check', 'Home Care Instructions'] }
        ]
      }
    },
    totalDuration: { min: 9, max: 26, default: 10 },
    contraindications: ['Acute sinusitis', 'Nasal bleeding', 'Head injury'],
    indications: ['Sinusitis', 'Headaches', 'Hair fall', 'Mental disorders']
  },

  raktamokshana: {
    name: 'Raktamokshana (Bloodletting)',
    description: 'Therapeutic bloodletting for blood-related disorders',
    phases: {
      purvaKarma: {
        name: 'Purva Karma (Preparation)',
        duration: { min: 2, max: 3, default: 2 },
        sessions: [
          { day: 1, name: 'Assessment & Preparation', procedures: ['Blood Analysis', 'Patient Preparation'] },
          { day: 2, name: 'Pre-procedure Care', procedures: ['Snehana', 'Mental Preparation'] }
        ]
      },
      pradhanaKarma: {
        name: 'Pradhana Karma (Main Procedure)',
        duration: { min: 1, max: 3, default: 1 },
        sessions: [
          { day: 1, name: 'Raktamokshana Session', procedures: ['Bloodletting Procedure', 'Immediate Care'] }
        ],
        note: 'Additional sessions may be scheduled 7-15 days apart based on condition'
      },
      paschatKarma: {
        name: 'Paschat Karma (Post Care)',
        duration: { min: 3, max: 7, default: 5 },
        sessions: [
          { day: 1, name: 'Immediate Recovery', procedures: ['Rest', 'Iron-rich Diet'] },
          { day: 2, name: 'Strength Building', procedures: ['Light Activities', 'Nutritious Food'] },
          { day: 3, name: 'Normal Activities', procedures: ['Regular Diet', 'Gentle Exercise'] },
          { day: 4, name: 'Progress Review', procedures: ['Health Assessment', 'Blood Check'] },
          { day: 5, name: 'Final Evaluation', procedures: ['Complete Assessment', 'Future Care Plan'] }
        ]
      }
    },
    totalDuration: { min: 6, max: 13, default: 8 },
    contraindications: ['Anemia', 'Pregnancy', 'Severe weakness', 'Blood disorders'],
    indications: ['Skin diseases', 'Hypertension', 'Local inflammatory conditions']
  }
};

// Helper function to generate session schedule
export function generateProcedureSchedule(procedureType, customDurations = {}) {
  const template = PANCHAKARMA_PROCEDURES[procedureType];
  if (!template) throw new Error(`Unknown procedure type: ${procedureType}`);

  const schedule = [];
  let currentDay = 1;

  // Purva Karma
  const purvaKarmaDuration = customDurations.purvaKarma || template.phases.purvaKarma.duration.default;
  const purvaKarmaSessions = template.phases.purvaKarma.sessions.slice(0, purvaKarmaDuration);
  
  purvaKarmaSessions.forEach((session, index) => {
    schedule.push({
      ...session,
      day: currentDay + index,
      phase: 'purvaKarma',
      phaseDay: index + 1
    });
  });
  currentDay += purvaKarmaDuration;

  // Pradhana Karma
  const pradhanaKarmaDuration = customDurations.pradhanaKarma || template.phases.pradhanaKarma.duration.default;
  
  if (procedureType === 'basti') {
    // Special handling for Basti courses
    const courseType = customDurations.bastiCourse || 'kala';
    const sessions = template.phases.pradhanaKarma.courseTypes[courseType].sessions;
    
    for (let i = 0; i < sessions; i++) {
      const sessionType = i % 2 === 0 ? 'Anuvasana Basti' : 'Niruha Basti';
      schedule.push({
        day: currentDay + i,
        name: `${sessionType} ${i + 1}`,
        procedures: [sessionType, 'Post-Basti Care'],
        phase: 'pradhanaKarma',
        phaseDay: i + 1
      });
    }
    currentDay += sessions;
  } else {
    // Standard pradhana karma sessions
    const pradhanaSessions = template.phases.pradhanaKarma.sessions || 
      Array.from({ length: pradhanaKarmaDuration }, (_, i) => ({
        day: i + 1,
        name: `${template.name} Day ${i + 1}`,
        procedures: [`${template.name} Procedure`]
      }));

    pradhanaSessions.forEach((session, index) => {
      schedule.push({
        ...session,
        day: currentDay + index,
        phase: 'pradhanaKarma',
        phaseDay: index + 1
      });
    });
    currentDay += pradhanaKarmaDuration;
  }

  // Paschat Karma
  const paschatKarmaDuration = customDurations.paschatKarma || template.phases.paschatKarma.duration.default;
  const paschatKarmaSessions = template.phases.paschatKarma.sessions.slice(0, paschatKarmaDuration);
  
  paschatKarmaSessions.forEach((session, index) => {
    schedule.push({
      ...session,
      day: currentDay + index,
      phase: 'paschatKarma',
      phaseDay: index + 1
    });
  });

  return {
    procedure: template,
    schedule,
    totalDays: currentDay + paschatKarmaDuration - 1,
    phases: {
      purvaKarma: purvaKarmaDuration,
      pradhanaKarma: pradhanaKarmaDuration,
      paschatKarma: paschatKarmaDuration
    }
  };
}