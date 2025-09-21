import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  userType: {
    type: String,
    default: 'admin',
    immutable: true
  },
  adminLevel: {
    type: String,
    required: true,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'admin'
  },
  department: {
    type: String,
    enum: ['operations', 'technical', 'medical', 'customer_service', 'analytics'],
    required: true
  },
  permissions: {
    // User Management
    canManageUsers: { type: Boolean, default: true },
    canDeleteUsers: { type: Boolean, default: false },
    canViewUserDetails: { type: Boolean, default: true },
    canModifyUserProfiles: { type: Boolean, default: true },
    
    // Practitioner Management
    canManagePractitioners: { type: Boolean, default: true },
    canVerifyPractitioners: { type: Boolean, default: false },
    canSetPractitionerRates: { type: Boolean, default: false },
    
    // System Management
    canAccessAnalytics: { type: Boolean, default: true },
    canManageSystemSettings: { type: Boolean, default: false },
    canViewSystemLogs: { type: Boolean, default: false },
    canManageAdmins: { type: Boolean, default: false },
    
    // Content Management
    canManageContent: { type: Boolean, default: true },
    canManageNotifications: { type: Boolean, default: true },
    canManageReports: { type: Boolean, default: true },
    
    // Financial
    canViewFinancials: { type: Boolean, default: false },
    canManagePayments: { type: Boolean, default: false }
  },
  profileImage: {
    type: String,
    default: null
  },
  employeeId: {
    type: String,
    unique: true,
    required: true
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    loginTime: Date,
    ipAddress: String,
    userAgent: String,
    success: Boolean
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspensionReason: {
    type: String
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String
  },
  sessionTimeout: {
    type: Number,
    default: 3600 // 1 hour in seconds
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// System Activity Log Schema
const activityLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'SUSPEND_USER',
      'CREATE_PRACTITIONER', 'UPDATE_PRACTITIONER', 'DELETE_PRACTITIONER', 'VERIFY_PRACTITIONER',
      'CREATE_ADMIN', 'UPDATE_ADMIN', 'DELETE_ADMIN',
      'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE',
      'SYSTEM_SETTINGS_UPDATE', 'VIEW_ANALYTICS', 'EXPORT_DATA',
      'SEND_NOTIFICATION', 'MODERATE_CONTENT'
    ]
  },
  targetType: {
    type: String,
    enum: ['patient', 'practitioner', 'admin', 'system', 'content'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// System Settings Schema
const systemSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['general', 'security', 'notifications', 'payments', 'analytics'],
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

// System Notification Schema (for admin announcements)
const systemNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error', 'announcement'],
    default: 'info'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'patients', 'practitioners', 'admins'],
    default: 'all'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  scheduledFor: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  readBy: [{
    userId: mongoose.Schema.Types.ObjectId,
    userType: String,
    readAt: Date
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware for password hashing
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt field before saving
adminSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get full name
adminSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Method to check specific permission
adminSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] || false;
};

// Method to check if super admin
adminSchema.methods.isSuperAdmin = function() {
  return this.adminLevel === 'super_admin';
};

// Static method to set default permissions based on admin level
adminSchema.statics.getDefaultPermissions = function(adminLevel, department) {
  const basePermissions = {
    canManageUsers: true,
    canDeleteUsers: false,
    canViewUserDetails: true,
    canModifyUserProfiles: true,
    canManagePractitioners: true,
    canVerifyPractitioners: false,
    canSetPractitionerRates: false,
    canAccessAnalytics: true,
    canManageSystemSettings: false,
    canViewSystemLogs: false,
    canManageAdmins: false,
    canManageContent: true,
    canManageNotifications: true,
    canManageReports: true,
    canViewFinancials: false,
    canManagePayments: false
  };

  // Super admin gets all permissions
  if (adminLevel === 'super_admin') {
    Object.keys(basePermissions).forEach(key => {
      basePermissions[key] = true;
    });
  }
  
  // Department-specific permissions
  if (department === 'technical') {
    basePermissions.canManageSystemSettings = true;
    basePermissions.canViewSystemLogs = true;
  }
  
  if (department === 'medical') {
    basePermissions.canVerifyPractitioners = true;
    basePermissions.canSetPractitionerRates = true;
  }
  
  if (department === 'analytics') {
    basePermissions.canViewFinancials = true;
  }

  return basePermissions;
};

// Indexes for better performance
adminSchema.index({ email: 1 });
adminSchema.index({ employeeId: 1 });
adminSchema.index({ adminLevel: 1 });
adminSchema.index({ isActive: 1 });

activityLogSchema.index({ adminId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ targetType: 1, targetId: 1 });

systemSettingsSchema.index({ key: 1 });
systemSettingsSchema.index({ category: 1 });

systemNotificationSchema.index({ targetAudience: 1, isActive: 1 });
systemNotificationSchema.index({ createdAt: -1 });

// Create models with overwrite protection
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
const SystemSettings = mongoose.models.SystemSettings || mongoose.model('SystemSettings', systemSettingsSchema);
const SystemNotification = mongoose.models.SystemNotification || mongoose.model('SystemNotification', systemNotificationSchema);

export { Admin, ActivityLog, SystemSettings, SystemNotification };