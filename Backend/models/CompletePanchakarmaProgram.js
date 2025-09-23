// Complete Panchakarma Program Template
// All 5 traditional procedures included as manageable steps

export const COMPLETE_PANCHAKARMA_PROGRAM = {
  name: 'Complete Panchakarma Therapy Program',
  description: 'Comprehensive Ayurvedic detoxification and rejuvenation program including all five traditional procedures',
  totalDuration: {
    min: 60,
    max: 120,
    default: 90 // 3 months typical duration
  },
  
  procedures: [
    {
      id: 'vamana',
      name: 'Vamana (Therapeutic Emesis)',
      description: 'Therapeutic emesis to eliminate Kapha dosha imbalances',
      order: 1,
      status: 'pending', // pending, active, completed, skipped
      duration: 13,
      phases: {
        purvaKarma: { days: 7, description: 'Snehana and Swedana preparation' },
        pradhanaKarma: { days: 1, description: 'Therapeutic emesis procedure' },
        paschatKarma: { days: 5, description: 'Samsarjana recovery diet' }
      },
      indications: ['Kapha disorders', 'Respiratory issues', 'Skin conditions', 'Obesity'],
      contraindications: ['Pregnancy', 'Severe heart conditions', 'Recent surgery']
    },
    {
      id: 'virechana',
      name: 'Virechana (Therapeutic Purgation)',
      description: 'Therapeutic purgation to eliminate Pitta dosha imbalances',
      order: 2,
      status: 'pending',
      duration: 9,
      phases: {
        purvaKarma: { days: 4, description: 'Ghrita Pana and oleation' },
        pradhanaKarma: { days: 1, description: 'Therapeutic purgation procedure' },
        paschatKarma: { days: 4, description: 'Samsarjana recovery diet' }
      },
      indications: ['Pitta disorders', 'Liver conditions', 'Skin diseases', 'Metabolic disorders'],
      contraindications: ['Pregnancy', 'Severe dehydration', 'Inflammatory bowel disease']
    },
    {
      id: 'basti',
      name: 'Basti (Enema Therapy)',
      description: 'Therapeutic enemas to eliminate Vata dosha imbalances',
      order: 3,
      status: 'pending',
      duration: 23,
      phases: {
        purvaKarma: { days: 3, description: 'Snehana and Swedana preparation' },
        pradhanaKarma: { days: 15, description: 'Kala Basti course (15 sessions)' },
        paschatKarma: { days: 5, description: 'Recovery and strengthening' }
      },
      indications: ['Vata disorders', 'Joint problems', 'Neurological issues', 'Chronic pain'],
      contraindications: ['Severe weakness', 'Rectal bleeding', 'Severe constipation'],
      courseOptions: [
        { name: 'Karma Basti', sessions: 8, description: 'Basic course for mild conditions' },
        { name: 'Kala Basti', sessions: 15, description: 'Standard course for moderate conditions' },
        { name: 'Yoga Basti', sessions: 30, description: 'Extended course for chronic conditions' }
      ]
    },
    {
      id: 'nasya',
      name: 'Nasya (Nasal Therapy)',
      description: 'Therapeutic nasal administration for head and neck disorders',
      order: 4,
      status: 'pending',
      duration: 10,
      phases: {
        purvaKarma: { days: 1, description: 'Nasal examination and steam preparation' },
        pradhanaKarma: { days: 7, description: 'Daily nasal medication administration' },
        paschatKarma: { days: 2, description: 'Recovery and post-care instructions' }
      },
      indications: ['Sinusitis', 'Headaches', 'Hair fall', 'Mental disorders'],
      contraindications: ['Acute sinusitis', 'Nasal bleeding', 'Head injury']
    },
    {
      id: 'raktamokshana',
      name: 'Raktamokshana (Bloodletting)',
      description: 'Therapeutic bloodletting for blood-related disorders',
      order: 5,
      status: 'pending',
      duration: 8,
      phases: {
        purvaKarma: { days: 2, description: 'Blood analysis and patient preparation' },
        pradhanaKarma: { days: 1, description: 'Bloodletting procedure' },
        paschatKarma: { days: 5, description: 'Recovery with iron-rich diet' }
      },
      indications: ['Skin diseases', 'Hypertension', 'Local inflammatory conditions'],
      contraindications: ['Anemia', 'Pregnancy', 'Severe weakness', 'Blood disorders']
    }
  ],

  managementPhases: [
    {
      phase: 'assessment',
      name: 'Initial Assessment',
      description: 'Complete health evaluation and program planning',
      duration: 3,
      activities: [
        'Prakriti (Constitution) Analysis',
        'Vikriti (Current State) Assessment',
        'Procedure Planning and Scheduling',
        'Patient Education and Consent'
      ]
    },
    {
      phase: 'procedures',
      name: 'Procedure Execution',
      description: 'Sequential execution of Panchakarma procedures',
      duration: 63, // Sum of all procedure durations
      activities: [
        'Individual procedure management',
        'Progress monitoring',
        'Adaptation based on patient response',
        'Inter-procedure recovery periods'
      ]
    },
    {
      phase: 'recovery',
      name: 'Final Recovery & Rasayana',
      description: 'Complete recovery and rejuvenation therapy',
      duration: 24,
      activities: [
        'Complete detoxification assessment',
        'Rasayana (rejuvenative) therapy',
        'Lifestyle and diet counseling',
        'Long-term maintenance planning'
      ]
    }
  ],

  totalDurationDays: 90,
  
  customization: {
    allowProcedureSkipping: true,
    allowDurationModification: true,
    allowSequenceModification: false, // Traditional sequence should be maintained
    mandatoryGaps: {
      betweenProcedures: 7, // Minimum 7 days between major procedures
      postProgramRecovery: 14 // 2 weeks final recovery
    }
  }
};

// Helper function to generate complete Panchakarma program schedule
export function generateCompletePanchakarmaProgram(startDate, customizations = {}) {
  const program = { ...COMPLETE_PANCHAKARMA_PROGRAM };
  const schedule = [];
  let currentDay = 1;

  // Assessment Phase
  const assessmentDuration = customizations.assessmentDuration || program.managementPhases[0].duration;
  for (let i = 0; i < assessmentDuration; i++) {
    const sessionDate = new Date(startDate);
    sessionDate.setDate(sessionDate.getDate() + currentDay - 1 + i);
    
    schedule.push({
      day: currentDay + i,
      date: sessionDate,
      phase: 'assessment',
      sessionName: `Assessment Day ${i + 1}`,
      activities: program.managementPhases[0].activities,
      type: 'assessment'
    });
  }
  currentDay += assessmentDuration;

  // Add gap after assessment
  currentDay += 2; // 2-day gap

  // Procedure Phases
  program.procedures.forEach((procedure, procedureIndex) => {
    if (customizations.excludeProcedures && customizations.excludeProcedures.includes(procedure.id)) {
      return; // Skip this procedure if excluded
    }

    // Add procedure sessions
    const procedureDuration = customizations[`${procedure.id}Duration`] || procedure.duration;
    
    for (let day = 0; day < procedureDuration; day++) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(sessionDate.getDate() + currentDay - 1 + day);
      
      let phaseInfo = 'general';
      let phaseName = procedure.name;
      
      // Determine which phase of the procedure this day belongs to
      if (day < procedure.phases.purvaKarma.days) {
        phaseInfo = 'purvaKarma';
        phaseName = `${procedure.name} - Purva Karma`;
      } else if (day < procedure.phases.purvaKarma.days + procedure.phases.pradhanaKarma.days) {
        phaseInfo = 'pradhanaKarma';
        phaseName = `${procedure.name} - Pradhana Karma`;
      } else {
        phaseInfo = 'paschatKarma';
        phaseName = `${procedure.name} - Paschat Karma`;
      }

      schedule.push({
        day: currentDay + day,
        date: sessionDate,
        phase: 'procedure',
        procedureId: procedure.id,
        procedureName: procedure.name,
        procedurePhase: phaseInfo,
        sessionName: `${phaseName} - Day ${day + 1}`,
        activities: [`${procedure.name} - ${phaseInfo} activities`],
        type: 'procedure',
        order: procedure.order,
        status: 'pending'
      });
    }
    
    currentDay += procedureDuration;
    
    // Add mandatory gap between procedures (except after last procedure)
    if (procedureIndex < program.procedures.length - 1) {
      currentDay += program.customization.mandatoryGaps.betweenProcedures;
    }
  });

  // Final Recovery Phase
  const recoveryDuration = customizations.recoveryDuration || program.managementPhases[2].duration;
  for (let i = 0; i < recoveryDuration; i++) {
    const sessionDate = new Date(startDate);
    sessionDate.setDate(sessionDate.getDate() + currentDay - 1 + i);
    
    schedule.push({
      day: currentDay + i,
      date: sessionDate,
      phase: 'recovery',
      sessionName: `Recovery & Rasayana Day ${i + 1}`,
      activities: program.managementPhases[2].activities,
      type: 'recovery'
    });
  }

  const expectedEndDate = new Date(startDate);
  expectedEndDate.setDate(expectedEndDate.getDate() + currentDay + recoveryDuration - 1);

  return {
    program,
    schedule,
    totalDays: currentDay + recoveryDuration - 1,
    expectedEndDate,
    proceduresSummary: program.procedures.map(p => ({
      id: p.id,
      name: p.name,
      duration: p.duration,
      status: p.status
    }))
  };
}