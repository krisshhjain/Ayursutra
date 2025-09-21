import mongoose from 'mongoose';

const weeklyHourSchema = new mongoose.Schema({
  weekday: {
    type: Number,
    required: [true, 'Weekday is required'],
    min: [0, 'Weekday must be between 0 (Sunday) and 6 (Saturday)'],
    max: [6, 'Weekday must be between 0 (Sunday) and 6 (Saturday)']
  },
  start: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format']
  },
  end: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format']
  }
}, { _id: false });

const exceptionSchema = new mongoose.Schema({
  date: {
    type: String,
    required: [true, 'Exception date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
  },
  start: {
    type: String,
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format']
  },
  end: {
    type: String,
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format']
  },
  type: {
    type: String,
    enum: {
      values: ['block', 'partial'],
      message: '{VALUE} is not a valid exception type'
    },
    required: [true, 'Exception type is required']
  }
}, { _id: false });

const practitionerAvailabilitySchema = new mongoose.Schema({
  practitionerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner',
    required: [true, 'Practitioner ID is required'],
    unique: true
  },
  slotLength: {
    type: Number,
    default: 30,
    min: [15, 'Slot length must be at least 15 minutes'],
    max: [240, 'Slot length cannot exceed 240 minutes']
  },
  bufferBefore: {
    type: Number,
    default: 10,
    min: [0, 'Buffer before cannot be negative'],
    max: [60, 'Buffer before cannot exceed 60 minutes']
  },
  bufferAfter: {
    type: Number,
    default: 10,
    min: [0, 'Buffer after cannot be negative'],
    max: [60, 'Buffer after cannot exceed 60 minutes']
  },
  weeklyHours: {
    type: [weeklyHourSchema],
    default: [
      { weekday: 1, start: '09:00', end: '17:00' }, // Monday
      { weekday: 2, start: '09:00', end: '17:00' }, // Tuesday
      { weekday: 3, start: '09:00', end: '17:00' }, // Wednesday
      { weekday: 4, start: '09:00', end: '17:00' }, // Thursday
      { weekday: 5, start: '09:00', end: '17:00' }, // Friday
    ],
    validate: {
      validator: function(hours) {
        // Check for duplicate weekdays
        const weekdays = hours.map(h => h.weekday);
        return weekdays.length === new Set(weekdays).size;
      },
      message: 'Duplicate weekdays are not allowed'
    }
  },
  exceptions: {
    type: [exceptionSchema],
    default: []
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
    required: [true, 'Timezone is required']
  }
}, {
  timestamps: true
});

// Validation for weekly hours: start must be before end
weeklyHourSchema.pre('validate', function(next) {
  if (this.start && this.end && this.start >= this.end) {
    return next(new Error('Start time must be before end time'));
  }
  next();
});

// Validation for exceptions: if both start and end are provided, start must be before end
exceptionSchema.pre('validate', function(next) {
  if (this.start && this.end && this.start >= this.end) {
    return next(new Error('Exception start time must be before end time'));
  }
  next();
});

// Index for fast practitioner lookup
practitionerAvailabilitySchema.index({ practitionerId: 1 });

// Virtual to get working days count
practitionerAvailabilitySchema.virtual('workingDaysCount').get(function() {
  return this.weeklyHours ? this.weeklyHours.length : 0;
});

// Method to check if practitioner works on a specific weekday
practitionerAvailabilitySchema.methods.isWorkingDay = function(weekday) {
  return this.weeklyHours.some(hour => hour.weekday === weekday);
};

// Method to get working hours for a specific weekday
practitionerAvailabilitySchema.methods.getWorkingHours = function(weekday) {
  return this.weeklyHours.find(hour => hour.weekday === weekday);
};

// Method to check if a date has exceptions
practitionerAvailabilitySchema.methods.getExceptionForDate = function(dateString) {
  return this.exceptions.find(exception => exception.date === dateString);
};

// Static method to get or create default availability for a practitioner
practitionerAvailabilitySchema.statics.getOrCreateForPractitioner = async function(practitionerId) {
  let availability = await this.findOne({ practitionerId });
  
  if (!availability) {
    availability = new this({ practitionerId });
    await availability.save();
  }
  
  return availability;
};

// Ensure virtuals are included in JSON output
practitionerAvailabilitySchema.set('toJSON', { virtuals: true });
practitionerAvailabilitySchema.set('toObject', { virtuals: true });

const PractitionerAvailability = mongoose.models.PractitionerAvailability || mongoose.model('PractitionerAvailability', practitionerAvailabilitySchema);

export default PractitionerAvailability;