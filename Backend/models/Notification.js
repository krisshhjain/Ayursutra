import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
  attemptedAt: {
    type: Date,
    default: Date.now
  },
  channel: {
    type: String,
    enum: ['in-app', 'email', 'sms'],
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'bounced', 'delivered'],
    required: true
  },
  providerId: String, // External provider's message ID
  errorMessage: String,
  responseData: mongoose.Schema.Types.Mixed
}, { _id: false });

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientModel',
    required: [true, 'Recipient ID is required']
  },
  recipientModel: {
    type: String,
    required: [true, 'Recipient model is required'],
    enum: ['Patient', 'Practitioner', 'User'],
    default: 'Patient'
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'Appointment ID is required']
  },
  channels: [{
    type: String,
    enum: ['in-app', 'email', 'sms'],
    required: true
  }],
  templateId: {
    type: String,
    enum: ['24h-before', '2h-before', 'on-time', 'immediate-post', '48h-post', 'appointment-confirmed', 'appointment-request', 'appointment-completed', 'appointment-cancelled', 'appointment-rescheduled'],
    required: [true, 'Template ID is required']
  },
  variables: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  scheduledAt: {
    type: Date,
    required: [true, 'Scheduled time is required'],
    index: true
  },
  sentAt: {
    type: Date,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'sending', 'sent', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  retryCount: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  attempts: [attemptSchema],
  readAt: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
notificationSchema.index({ scheduledAt: 1, status: 1 });
notificationSchema.index({ recipientId: 1, readAt: 1 });
notificationSchema.index({ appointmentId: 1, templateId: 1 });

// Virtual for checking if notification is read
notificationSchema.virtual('isRead').get(function() {
  return !!this.readAt;
});

// Virtual for checking if notification is overdue
notificationSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && this.scheduledAt < new Date();
});

// Static method to find due notifications
notificationSchema.statics.findDue = function() {
  return this.find({
    status: 'pending',
    scheduledAt: { $lte: new Date() }
  }).populate('recipientId appointmentId');
};

// Static method to find unread notifications for a user
notificationSchema.statics.findUnreadForUser = function(userId, limit = 20) {
  return this.find({
    recipientId: userId,
    readAt: null
  })
  .sort({ scheduledAt: -1 })
  .limit(limit)
  .populate('appointmentId');
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.readAt = new Date();
  return this.save();
};

// Instance method to add attempt
notificationSchema.methods.addAttempt = function(channel, status, providerId = null, errorMessage = null, responseData = null) {
  this.attempts.push({
    channel,
    status,
    providerId,
    errorMessage,
    responseData
  });
  this.retryCount += 1;
  
  if (status === 'sent' || status === 'delivered') {
    this.status = 'sent';
    this.sentAt = new Date();
  } else if (status === 'failed' && this.retryCount >= 3) {
    this.status = 'failed';
  }
  
  return this.save();
};

// Export model with check to prevent overwrite error
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export default Notification;