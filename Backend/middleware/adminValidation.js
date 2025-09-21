import { body } from 'express-validator';

// Validation rules for admin login
export const validateAdminLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for admin creation
export const validateAdminCreate = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('mobile')
    .matches(/^\d{10}$/)
    .withMessage('Please provide a valid 10-digit mobile number'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('adminLevel')
    .isIn(['super_admin', 'admin', 'moderator'])
    .withMessage('Admin level must be super_admin, admin, or moderator'),

  body('department')
    .isIn(['operations', 'technical', 'medical', 'customer_service', 'analytics'])
    .withMessage('Department must be one of: operations, technical, medical, customer_service, analytics'),

  body('employeeId')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Employee ID must contain only uppercase letters and numbers')
];

// Validation rules for admin update
export const validateAdminUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('mobile')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('Please provide a valid 10-digit mobile number'),

  body('adminLevel')
    .optional()
    .isIn(['super_admin', 'admin', 'moderator'])
    .withMessage('Admin level must be super_admin, admin, or moderator'),

  body('department')
    .optional()
    .isIn(['operations', 'technical', 'medical', 'customer_service', 'analytics'])
    .withMessage('Department must be one of: operations, technical, medical, customer_service, analytics'),

  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Validation rules for user suspension
export const validateUserSuspension = [
  body('suspend')
    .isBoolean()
    .withMessage('Suspend must be a boolean value'),

  body('reason')
    .if(body('suspend').equals(true))
    .notEmpty()
    .withMessage('Reason is required when suspending a user')
    .isLength({ max: 200 })
    .withMessage('Reason cannot exceed 200 characters')
];

// Validation rules for practitioner verification
export const validatePractitionerVerification = [
  body('verified')
    .isBoolean()
    .withMessage('Verified must be a boolean value'),

  body('notes')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Notes cannot exceed 300 characters')
];

// Validation rules for consultation fee update
export const validateConsultationFee = [
  body('consultationFee')
    .isNumeric()
    .withMessage('Consultation fee must be a number')
    .isFloat({ min: 0 })
    .withMessage('Consultation fee must be a positive number')
    .custom((value) => {
      if (value > 10000) {
        throw new Error('Consultation fee cannot exceed 10,000');
      }
      return true;
    })
];

// Validation rules for system settings
export const validateSystemSettings = [
  body('key')
    .trim()
    .notEmpty()
    .withMessage('Setting key is required')
    .matches(/^[a-zA-Z0-9_\.]+$/)
    .withMessage('Setting key can only contain letters, numbers, underscores, and dots'),

  body('value')
    .notEmpty()
    .withMessage('Setting value is required'),

  body('category')
    .isIn(['general', 'security', 'notifications', 'payments', 'analytics'])
    .withMessage('Category must be one of: general, security, notifications, payments, analytics'),

  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value')
];

// Validation rules for notifications
export const validateNotification = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Message must be between 10 and 500 characters'),

  body('type')
    .isIn(['info', 'warning', 'success', 'error', 'announcement'])
    .withMessage('Type must be one of: info, warning, success, error, announcement'),

  body('targetAudience')
    .isIn(['all', 'patients', 'practitioners', 'admins'])
    .withMessage('Target audience must be one of: all, patients, practitioners, admins'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),

  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date'),

  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiry date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.body.scheduledFor && new Date(value) <= new Date(req.body.scheduledFor)) {
        throw new Error('Expiry date must be after scheduled date');
      }
      return true;
    })
];

// Validation rules for analytics queries
export const validateAnalyticsQuery = [
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('userType')
    .optional()
    .isIn(['patient', 'practitioner', 'admin'])
    .withMessage('User type must be patient, practitioner, or admin'),

  body('groupBy')
    .optional()
    .isIn(['day', 'week', 'month'])
    .withMessage('Group by must be day, week, or month')
];

// Validation rules for data export
export const validateDataExport = [
  body('type')
    .isIn(['users', 'practitioners', 'admins', 'logs'])
    .withMessage('Export type must be one of: users, practitioners, admins, logs'),

  body('format')
    .optional()
    .isIn(['json', 'csv'])
    .withMessage('Format must be json or csv'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),

  body('filters')
    .optional()
    .isObject()
    .withMessage('Filters must be an object')
];