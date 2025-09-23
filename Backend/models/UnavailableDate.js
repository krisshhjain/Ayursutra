import mongoose from 'mongoose';

const unavailableDateSchema = new mongoose.Schema({
  practitionerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner',
    required: [true, 'Practitioner ID is required']
  },
  date: {
    type: String, // YYYY-MM-DD format
    required: [true, 'Date is required'],
    validate: {
      validator: function(date) {
        // Validate YYYY-MM-DD format
        return /^\d{4}-\d{2}-\d{2}$/.test(date);
      },
      message: 'Date must be in YYYY-MM-DD format'
    }
  },
  reason: {
    type: String,
    maxlength: [200, 'Reason cannot exceed 200 characters'],
    default: ''
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringType: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    required: function() {
      return this.isRecurring;
    }
  },
  recurringEndDate: {
    type: String, // YYYY-MM-DD format
    validate: {
      validator: function(date) {
        if (!date) return true; // Optional field
        return /^\d{4}-\d{2}-\d{2}$/.test(date);
      },
      message: 'Recurring end date must be in YYYY-MM-DD format'
    },
    required: function() {
      return this.isRecurring;
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner',
    required: [true, 'Creator is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure practitioner can't add duplicate unavailable dates
unavailableDateSchema.index({ practitionerId: 1, date: 1 }, { unique: true });

// Index for efficient queries
unavailableDateSchema.index({ practitionerId: 1, date: 1 });
unavailableDateSchema.index({ date: 1 });

// Virtual to check if date is in the past
unavailableDateSchema.virtual('isPastDate').get(function() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return this.date < today;
});

// Static method to find unavailable dates for a practitioner in a date range
unavailableDateSchema.statics.findForPractitioner = function(practitionerId, startDate, endDate) {
  const query = {
    practitionerId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  return this.find(query).sort({ date: 1 });
};

// Static method to check if a date is unavailable for a practitioner
unavailableDateSchema.statics.isDateUnavailable = async function(practitionerId, date) {
  const unavailableDate = await this.findOne({
    practitionerId,
    date
  });
  
  return !!unavailableDate;
};

// Static method to get all unavailable dates for a practitioner
unavailableDateSchema.statics.getAllForPractitioner = function(practitionerId) {
  return this.find({ practitionerId }).sort({ date: 1 });
};

// Instance method to check if this unavailable date conflicts with existing appointments
unavailableDateSchema.methods.checkAppointmentConflicts = async function() {
  const Appointment = mongoose.model('Appointment');
  
  const conflictingAppointments = await Appointment.find({
    practitionerId: this.practitionerId,
    date: this.date,
    status: { $in: ['requested', 'confirmed', 'rescheduled'] }
  }).populate('patientId', 'firstName lastName');
  
  return conflictingAppointments;
};

// Pre-save middleware to validate future dates only
unavailableDateSchema.pre('save', function(next) {
  if (this.isNew) {
    const today = new Date().toISOString().split('T')[0];
    if (this.date < today) {
      return next(new Error('Cannot add unavailable dates in the past'));
    }
  }
  
  // Validate recurring end date
  if (this.isRecurring && this.recurringEndDate && this.recurringEndDate <= this.date) {
    return next(new Error('Recurring end date must be after the start date'));
  }
  
  next();
});

// Pre-remove middleware to check for appointment conflicts
unavailableDateSchema.pre('remove', async function(next) {
  try {
    const conflicts = await this.checkAppointmentConflicts();
    if (conflicts.length > 0) {
      const patientNames = conflicts.map(apt => `${apt.patientId.firstName} ${apt.patientId.lastName}`);
      return next(new Error(`Cannot remove unavailable date. Existing appointments with: ${patientNames.join(', ')}`));
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Export model with check to prevent overwrite error
const UnavailableDate = mongoose.models.UnavailableDate || mongoose.model('UnavailableDate', unavailableDateSchema);
export default UnavailableDate;