import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Patient', 'Practitioner']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  }
}, {
  _id: true
});

const chatSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  practitionerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practitioner', 
    required: true,
    index: true
  },
  messages: [messageSchema],
  lastMessage: {
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    sender: {
      type: String,
      enum: ['patient', 'practitioner']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  unreadCount: {
    patient: {
      type: Number,
      default: 0
    },
    practitioner: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
chatSchema.index({ patientId: 1, practitionerId: 1 });
chatSchema.index({ appointmentId: 1 }, { unique: true });
chatSchema.index({ 'lastMessage.timestamp': -1 });

// Virtual to populate appointment details
chatSchema.virtual('appointment', {
  ref: 'Appointment',
  localField: 'appointmentId',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate patient details
chatSchema.virtual('patient', {
  ref: 'Patient',
  localField: 'patientId',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate practitioner details
chatSchema.virtual('practitioner', {
  ref: 'Practitioner',
  localField: 'practitionerId',
  foreignField: '_id',
  justOne: true
});

// Method to add a new message
chatSchema.methods.addMessage = function(content, senderId, senderType) {
  const message = {
    content,
    sender: senderId,
    senderModel: senderType === 'patient' ? 'Patient' : 'Practitioner',
    timestamp: new Date(),
    isRead: false
  };
  
  this.messages.push(message);
  
  // Update last message
  this.lastMessage = {
    content,
    timestamp: new Date(),
    sender: senderType
  };
  
  // Update unread count
  if (senderType === 'patient') {
    this.unreadCount.practitioner += 1;
  } else {
    this.unreadCount.patient += 1;
  }
  
  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userType) {
  // Mark all messages as read for the specified user type
  this.messages.forEach(message => {
    const isFromOtherUser = (userType === 'patient' && message.senderModel === 'Practitioner') ||
                           (userType === 'practitioner' && message.senderModel === 'Patient');
    if (isFromOtherUser) {
      message.isRead = true;
    }
  });
  
  // Reset unread count
  if (userType === 'patient') {
    this.unreadCount.patient = 0;
  } else {
    this.unreadCount.practitioner = 0;
  }
  
  return this.save();
};

// Static method to find or create chat for an appointment
chatSchema.statics.findOrCreateByAppointment = async function(appointmentId, patientId, practitionerId) {
  let chat = await this.findOne({ appointmentId });
  
  if (!chat) {
    chat = new this({
      appointmentId,
      patientId,
      practitionerId,
      messages: [],
      isActive: true
    });
    await chat.save();
  }
  
  return chat;
};

// Static method to get chats for a user
chatSchema.statics.getChatsForUser = async function(userId, userType) {
  const filter = userType === 'patient' ? { patientId: userId } : { practitionerId: userId };
  
  return this.find(filter)
    .populate('appointment', 'date slotStartUtc status duration')
    .populate('patient', 'firstName lastName email')
    .populate('practitioner', 'firstName lastName specialization')
    .sort({ 'lastMessage.timestamp': -1 });
};

// Pre-save middleware to update lastMessage timestamp
chatSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    const lastMsg = this.messages[this.messages.length - 1];
    this.lastMessage = {
      content: lastMsg.content,
      timestamp: lastMsg.timestamp,
      sender: lastMsg.senderModel === 'Patient' ? 'patient' : 'practitioner'
    };
  }
  next();
});

// Ensure virtuals are included in JSON output
chatSchema.set('toJSON', { virtuals: true });
chatSchema.set('toObject', { virtuals: true });

const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);

export default Chat;