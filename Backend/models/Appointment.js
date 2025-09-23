import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  practitionerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner',
    required: [true, 'Practitioner ID is required']
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required']
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
  },
  slotStartUtc: {
    type: Date,
    required: [true, 'Start time is required']
  },
  slotEndUtc: {
    type: Date,
    required: [true, 'End time is required']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [240, 'Duration cannot exceed 240 minutes']
  },
  status: {
    type: String,
    enum: {
      values: ['requested', 'confirmed', 'rescheduled', 'cancelled', 'completed'],
      message: '{VALUE} is not a valid status'
    },
    default: 'requested'
  },
  completedAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: String,
    enum: {
      values: ['patient', 'practitioner'],
      message: '{VALUE} is not a valid creator'
    },
    required: [true, 'Creator is required']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Therapy-related fields
  type: {
    type: String,
    enum: ['consultation', 'therapy', 'follow-up', 'emergency'],
    default: 'consultation'
  },
  therapyType: {
    type: String,
    enum: ['panchakarma', 'rasayana', 'kayachikitsa', 'shalakya', 'general'],
    required: function() {
      return this.type === 'therapy';
    }
  },
  therapyProgramId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TherapyProgram'
  },
  sessionNumber: {
    type: Number,
    min: 1
  },
  time: {
    type: String, // "14:30" format for backward compatibility
    required: true
  },
  meta: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Validation: slotEndUtc must be after slotStartUtc
appointmentSchema.pre('validate', function(next) {
  if (this.slotStartUtc && this.slotEndUtc && this.slotStartUtc >= this.slotEndUtc) {
    return next(new Error('End time must be after start time'));
  }
  next();
});

// Validation: duration should match time difference
appointmentSchema.pre('validate', function(next) {
  if (this.slotStartUtc && this.slotEndUtc && this.duration) {
    const calculatedDuration = Math.round((this.slotEndUtc - this.slotStartUtc) / (1000 * 60));
    if (Math.abs(calculatedDuration - this.duration) > 1) {
      return next(new Error('Duration does not match start and end times'));
    }
  }
  next();
});

// Indexes for performance and uniqueness
appointmentSchema.index({ practitionerId: 1, date: 1 });
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ status: 1, date: 1 });

// Partial unique index to prevent double-booking for active statuses
// This prevents overlapping appointments for the same practitioner
appointmentSchema.index(
  { practitionerId: 1, slotStartUtc: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { 
      status: { $in: ['requested', 'confirmed'] } 
    },
    name: 'prevent_double_booking'
  }
);

// Virtual for local time display (computed field)
appointmentSchema.virtual('localStartTime').get(function() {
  return this.slotStartUtc ? this.slotStartUtc.toISOString() : null;
});

appointmentSchema.virtual('localEndTime').get(function() {
  return this.slotEndUtc ? this.slotEndUtc.toISOString() : null;
});

// Ensure virtuals are included in JSON output
appointmentSchema.set('toJSON', { virtuals: true });
appointmentSchema.set('toObject', { virtuals: true });

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

export default Appointment;