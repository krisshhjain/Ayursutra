import mongoose from 'mongoose';

const sessionInstanceSchema = new mongoose.Schema({
  sessionNumber: {
    type: Number,
    required: true
  },
  templateSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Made optional for authentic Panchakarma procedures
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String, // "14:30"
    required: true
  },
  duration: {
    type: Number, // Duration in minutes
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled', 'no-show'],
    default: 'scheduled'
  },
  practitionerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  actualStartTime: Date,
  actualEndTime: Date,
  actualDuration: Number, // Actual duration in minutes
  
  // Session-specific notes and observations
  practitionerNotes: {
    preSession: String,
    duringSession: String,
    postSession: String,
    observations: String,
    modifications: String
  },
  
  // Patient feedback for this session
  patientFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comfort: {
      type: Number,
      min: 1,
      max: 5
    },
    effectiveness: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    sideEffects: [String],
    symptoms: [String],
    improvements: [String],
    submittedAt: Date
  },
  
  // Rescheduling history
  reschedulingHistory: [{
    originalDate: Date,
    originalTime: String,
    newDate: Date,
    newTime: String,
    reason: String,
    rescheduledBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      userType: { type: String, enum: ['patient', 'practitioner', 'admin'] }
    },
    rescheduledAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

const therapyProgramSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TherapyTemplate',
    required: false // Made optional for direct therapy program creation
  },
  programName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  
  // Program timeline
  startDate: {
    type: Date,
    required: true
  },
  expectedEndDate: {
    type: Date,
    required: true
  },
  actualEndDate: Date,
  
  // Primary practitioner for the program
  primaryPractitionerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Additional practitioners (for complex programs)
  assistingPractitioners: [{
    practitionerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: 'assistant' },
    sessions: [Number] // Which session numbers they handle
  }],
  
  // Program status
  status: {
    type: String,
    enum: ['scheduled', 'active', 'paused', 'completed', 'cancelled', 'suspended'],
    default: 'scheduled'
  },
  
  // All sessions in this program
  sessions: [sessionInstanceSchema],
  
  // Program-level tracking
  progress: {
    completedSessions: { type: Number, default: 0 },
    totalSessions: { type: Number, required: true },
    percentageComplete: { type: Number, default: 0 },
    currentPhase: { 
      type: String, 
      enum: ['preparation', 'purva-karma', 'pradhana-karma', 'paschat-karma', 'completed'],
      default: 'preparation'
    },
    phaseInfo: {
      name: String,
      description: String,
      nextAction: String
    },
    phaseProgress: {
      purvaKarma: {
        snehanaCompleted: { type: Boolean, default: false },
        swedanaCompleted: { type: Boolean, default: false },
        preparationDays: { type: Number, default: 0 }
      },
      pradhanaKarma: {
        procedure: { 
          type: String, 
          enum: ['vamana', 'virechana', 'basti', 'nasya', 'raktamokshana', 'combination']
        },
        sessionCount: { type: Number, default: 0 },
        completed: { type: Boolean, default: false }
      },
      paschatKarma: {
        samasarjanaKrama: { type: Boolean, default: false }, // Post-therapy diet regimen
        followUpDays: { type: Number, default: 0 }
      }
    },
    procedureProgress: [{ // For complete Panchakarma programs
      id: String,
      name: String,
      status: { type: String, enum: ['pending', 'active', 'completed', 'skipped'], default: 'pending' },
      completedDays: { type: Number, default: 0 },
      totalDays: Number,
      canStart: { type: Boolean, default: false },
      startDate: Date,
      completionDate: Date
    }],
    milestones: [{
      name: String,
      description: String,
      targetDate: Date,
      achievedDate: Date,
      status: { type: String, enum: ['pending', 'achieved', 'delayed'], default: 'pending' }
    }],
    percentageComplete: { type: Number, default: 0 },
    currentPhase: { 
      type: String, 
      enum: ['preparation', 'purva-karma', 'pradhana-karma', 'paschat-karma', 'completed'],
      default: 'preparation'
    },
    nextSessionDate: Date,
    nextSessionTime: String
  },
  
  // Patient's overall health metrics during program
  healthMetrics: [{
    date: { type: Date, required: true },
    weight: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    pulse: Number,
    temperature: Number,
    symptoms: [String],
    energyLevel: {
      type: Number,
      min: 1,
      max: 10
    },
    sleepQuality: {
      type: Number,
      min: 1,
      max: 10
    },
    appetite: {
      type: Number,
      min: 1,
      max: 10
    },
    overallWellbeing: {
      type: Number,
      min: 1,
      max: 10
    },
    notes: String,
    recordedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      userType: { type: String, enum: ['patient', 'practitioner'] }
    }
  }],
  
  // Program modifications and customizations
  customizations: {
    modifiedInstructions: [{
      sessionNumber: Number,
      type: { type: String, enum: ['pre', 'post', 'during'] },
      originalInstruction: String,
      modifiedInstruction: String,
      reason: String,
      modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      modifiedAt: { type: Date, default: Date.now }
    }],
    addedSessions: [{
      insertAfterSession: Number,
      sessionDetails: {
        title: String,
        duration: Number,
        description: String,
        reason: String
      },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      addedAt: { type: Date, default: Date.now }
    }],
    skippedSessions: [{
      sessionNumber: Number,
      reason: String,
      skippedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      skippedAt: { type: Date, default: Date.now }
    }]
  },
  
  // Program outcome and completion data
  outcome: {
    overallRating: {
      type: Number,
      min: 1,
      max: 5
    },
    effectiveness: {
      type: Number,
      min: 1,
      max: 5
    },
    patientSatisfaction: {
      type: Number,
      min: 1,
      max: 5
    },
    symptomsImproved: [String],
    symptomsResolved: [String],
    newSymptoms: [String],
    recommendations: [String],
    followUpRequired: Boolean,
    followUpDate: Date,
    completionNotes: String,
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: Date
  },
  
  // Authentic Panchakarma procedure details
  procedureDetails: [{
    type: {
      type: String,
      enum: ['vamana', 'virechana', 'basti', 'nasya', 'raktamokshana'],
      required: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    scheduledDates: {
      purvaKarma: Date,
      pradhanaKarma: Date,
      paschatKarma: Date
    },
    actualDates: {
      startedAt: Date,
      completedAt: Date
    },
    duration: {
      purvaKarma: Number,
      pradhanaKarma: Number,
      paschatKarma: Number
    },
    instructions: {
      preInstructions: String,
      postInstructions: String,
      dietaryRestrictions: String,
      medicineSchedule: String
    },
    notes: String,
    isCompleted: { type: Boolean, default: false },
    completedAt: Date
  }],
  
  // Financial information
  billing: {
    totalCost: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending'
    },
    paymentHistory: [{
      amount: Number,
      method: String,
      transactionId: String,
      date: { type: Date, default: Date.now },
      status: { type: String, enum: ['success', 'failed', 'pending'] }
    }]
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
therapyProgramSchema.index({ patientId: 1, status: 1 });
therapyProgramSchema.index({ primaryPractitionerId: 1, status: 1 });
therapyProgramSchema.index({ templateId: 1 });
therapyProgramSchema.index({ 'sessions.scheduledDate': 1, 'sessions.status': 1 });
therapyProgramSchema.index({ status: 1, 'progress.nextSessionDate': 1 });

// Virtual for upcoming sessions
therapyProgramSchema.virtual('upcomingSessions').get(function() {
  const now = new Date();
  return this.sessions.filter(session => 
    new Date(session.scheduledDate) >= now && 
    ['scheduled', 'confirmed'].includes(session.status)
  ).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
});

// Virtual for completed sessions count
therapyProgramSchema.virtual('completedSessionsCount').get(function() {
  return this.sessions.filter(session => session.status === 'completed').length;
});

// Static method to find active programs for a patient
therapyProgramSchema.statics.findActiveForPatient = function(patientId) {
  return this.find({
    patientId,
    status: { $in: ['scheduled', 'active'] }
  }).populate('templateId primaryPractitionerId');
};

// Static method to find programs for a practitioner
therapyProgramSchema.statics.findForPractitioner = function(practitionerId, status = null) {
  const query = {
    $or: [
      { primaryPractitionerId: practitionerId },
      { 'assistingPractitioners.practitionerId': practitionerId }
    ]
  };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('patientId templateId primaryPractitionerId')
    .sort({ 'progress.nextSessionDate': 1 });
};

// Method to get next session
therapyProgramSchema.methods.getNextSession = function() {
  const upcomingSessions = this.upcomingSessions;
  return upcomingSessions.length > 0 ? upcomingSessions[0] : null;
};

// Method to update progress
therapyProgramSchema.methods.updateProgress = function() {
  const completedCount = this.completedSessionsCount;
  const totalSessions = this.sessions.length;
  
  this.progress.completedSessions = completedCount;
  this.progress.totalSessions = totalSessions;
  this.progress.percentageComplete = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;
  
  // Update next session info
  const nextSession = this.getNextSession();
  if (nextSession) {
    this.progress.nextSessionDate = nextSession.scheduledDate;
    this.progress.nextSessionTime = nextSession.scheduledTime;
  } else {
    this.progress.nextSessionDate = null;
    this.progress.nextSessionTime = null;
  }
  
  // Update status based on progress
  if (completedCount === 0 && this.status === 'scheduled') {
    this.status = 'active';
  } else if (completedCount === totalSessions) {
    this.status = 'completed';
    this.actualEndDate = new Date();
  }
  
  return this.save();
};

// Method to complete a session
therapyProgramSchema.methods.completeSession = function(sessionNumber, practitionerNotes = {}, patientFeedback = {}) {
  const session = this.sessions.find(s => s.sessionNumber === sessionNumber);
  if (!session) {
    throw new Error(`Session ${sessionNumber} not found`);
  }
  
  session.status = 'completed';
  session.actualEndTime = new Date();
  session.practitionerNotes = { ...session.practitionerNotes, ...practitionerNotes };
  
  if (patientFeedback && Object.keys(patientFeedback).length > 0) {
    session.patientFeedback = { ...patientFeedback, submittedAt: new Date() };
  }
  
  return this.updateProgress();
};

const TherapyProgram = mongoose.models.TherapyProgram || mongoose.model('TherapyProgram', therapyProgramSchema);

export default TherapyProgram;