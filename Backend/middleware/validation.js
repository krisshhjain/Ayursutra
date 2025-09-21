import { body } from 'express-validator';

// Validation rules for user registration
export const validateRegister = [
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
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('userType')
    .isIn(['patient', 'practitioner'])
    .withMessage('User type must be either "patient" or "practitioner"'),

  // Patient-specific validations
  body('age')
    .if(body('userType').equals('patient'))
    .isInt({ min: 1, max: 150 })
    .withMessage('Age must be between 1 and 150'),

  body('gender')
    .if(body('userType').equals('patient'))
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),

  // Practitioner-specific validations
  body('specialization')
    .if(body('userType').equals('practitioner'))
    .isIn(['panchakarma', 'general', 'rasayana', 'kayachikitsa'])
    .withMessage('Specialization must be one of: panchakarma, general, rasayana, kayachikitsa'),

  body('experience')
    .if(body('userType').equals('practitioner'))
    .isInt({ min: 0 })
    .withMessage('Experience must be a non-negative number')
];

// Validation rules for user login
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  body('userType')
    .isIn(['patient', 'practitioner'])
    .withMessage('User type must be either "patient" or "practitioner"')
];

// Validation rules for password change
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
];