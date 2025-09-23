import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // Duration in minutes
    required: true,
    min: 15,
    max: 480 // 8 hours max
  },
  description: {
    type: String,
    required: true
  },
  preProcedureInstructions: [{
    instruction: { type: String, required: true },
    timeBeforeSession: { type: Number, required: true }, // Minutes before session
    category: {
      type: String,
      enum: ['dietary', 'preparation', 'medication', 'lifestyle'],
      required: true
    }
  }],
  postProcedureInstructions: [{
    instruction: { type: String, required: true },
    timeAfterSession: { type: Number, required: true }, // Minutes after session
    category: {
      type: String,
      enum: ['dietary', 'rest', 'medication', 'lifestyle', 'followup'],
      required: true
    }
  }],
  requiredMaterials: [{
    material: { type: String, required: true },
    quantity: { type: String },
    preparation: { type: String }
  }],
  contraindications: [String],
  specialRequirements: [String],
  // Minimum gap between this session and the next
  minimumGapDays: {
    type: Number,
    default: 0
  },
  // Maximum gap between this session and the next
  maximumGapDays: {
    type: Number,
    default: 7
  }
});

const therapyTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['panchakarma', 'rasayana', 'kayachikitsa', 'shalakya', 'general'],
    required: true
  },
  subcategory: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  totalDuration: {
    type: Number, // Total program duration in days
    required: true
  },
  sessions: [sessionSchema],
  
  // Program-level instructions
  overallPreparation: [{
    instruction: { type: String, required: true },
    daysBeforeStart: { type: Number, required: true },
    category: {
      type: String,
      enum: ['dietary', 'lifestyle', 'medication', 'consultation'],
      required: true
    }
  }],
  
  overallPostCare: [{
    instruction: { type: String, required: true },
    daysAfterCompletion: { type: Number, required: true },
    category: {
      type: String,
      enum: ['dietary', 'lifestyle', 'followup', 'monitoring'],
      required: true
    }
  }],

  // Practitioner requirements
  requiredCertifications: [String],
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  
  // Scheduling preferences
  preferredTimeSlots: [{
    startTime: String, // "09:00"
    endTime: String,   // "17:00"
    dayOfWeek: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }
  }],
  
  // Program metadata
  estimatedCost: {
    currency: { type: String, default: 'INR' },
    amount: { type: Number, required: true }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
therapyTemplateSchema.index({ category: 1, subcategory: 1 });
therapyTemplateSchema.index({ name: 1 });
therapyTemplateSchema.index({ isActive: 1 });
therapyTemplateSchema.index({ 'requiredCertifications': 1 });

// Virtual for total number of sessions
therapyTemplateSchema.virtual('totalSessions').get(function() {
  return this.sessions.length;
});

// Static method to find templates by category
therapyTemplateSchema.statics.findByCategory = function(category, subcategory = null) {
  const query = { category, isActive: true };
  if (subcategory) {
    query.subcategory = subcategory;
  }
  return this.find(query).sort({ name: 1 });
};

// Static method to find templates suitable for practitioner
therapyTemplateSchema.statics.findForPractitioner = function(practitionerId, experienceLevel, certifications = []) {
  return this.find({
    isActive: true,
    experienceLevel: { $in: ['beginner', experienceLevel] },
    $or: [
      { requiredCertifications: { $size: 0 } }, // No specific certifications required
      { requiredCertifications: { $in: certifications } } // Has required certifications
    ]
  }).sort({ category: 1, name: 1 });
};

// Method to validate session sequence
therapyTemplateSchema.methods.validateSessionSequence = function() {
  const errors = [];
  
  // Check if sessions are numbered correctly
  this.sessions.forEach((session, index) => {
    if (session.sessionNumber !== index + 1) {
      errors.push(`Session ${index + 1} has incorrect session number: ${session.sessionNumber}`);
    }
  });
  
  // Check for logical gaps between sessions
  for (let i = 0; i < this.sessions.length - 1; i++) {
    const currentSession = this.sessions[i];
    const nextSession = this.sessions[i + 1];
    
    if (currentSession.maximumGapDays < currentSession.minimumGapDays) {
      errors.push(`Session ${i + 1}: Maximum gap (${currentSession.maximumGapDays}) cannot be less than minimum gap (${currentSession.minimumGapDays})`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const TherapyTemplate = mongoose.models.TherapyTemplate || mongoose.model('TherapyTemplate', therapyTemplateSchema);

export default TherapyTemplate;