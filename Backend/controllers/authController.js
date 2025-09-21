import { validationResult } from 'express-validator';
import { Patient, Practitioner } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

// Register a new user (Patient or Practitioner)
export const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userType, email, ...userData } = req.body;

    // Check if user already exists
    let existingUser;
    if (userType === 'patient') {
      existingUser = await Patient.findOne({ email });
    } else if (userType === 'practitioner') {
      existingUser = await Practitioner.findOne({ email });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user based on userType
    let newUser;
    if (userType === 'patient') {
      newUser = new Patient({
        ...userData,
        email,
        userType: 'patient'
      });
    } else if (userType === 'practitioner') {
      newUser = new Practitioner({
        ...userData,
        email,
        userType: 'practitioner'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be either "patient" or "practitioner"'
      });
    }

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id, userType);

    // Remove password from response
    const userResponse = {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      mobile: newUser.mobile,
      userType: newUser.userType,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt
    };

    // Add user type specific fields to response
    if (userType === 'patient') {
      userResponse.age = newUser.age;
      userResponse.gender = newUser.gender;
    } else if (userType === 'practitioner') {
      userResponse.specialization = newUser.specialization;
      userResponse.experience = newUser.experience;
      userResponse.isVerified = newUser.isVerified;
      userResponse.rating = newUser.rating;
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, userType } = req.body;

    // Find user based on userType
    let user = null;
    if (userType === 'patient') {
      user = await Patient.findOne({ email });
    } else if (userType === 'practitioner') {
      user = await Practitioner.findOne({ email });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be either "patient" or "practitioner"'
      });
    }

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token using the userType from request (should match the collection we found user in)
    const token = generateToken(user._id, userType);

    // Prepare user response
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      userType: userType, // Use the userType from request since we found user in the correct collection
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    // Add user type specific fields to response
    if (userType === 'patient') {
      userResponse.age = user.age;
      userResponse.gender = user.gender;
    } else if (userType === 'practitioner') {
      userResponse.specialization = user.specialization;
      userResponse.experience = user.experience;
      userResponse.isVerified = user.isVerified;
      userResponse.rating = user.rating;
      userResponse.totalReviews = user.totalReviews;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      userType: user.userType,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    // Add user type specific fields to response
    if (user.userType === 'patient') {
      userResponse.age = user.age;
      userResponse.gender = user.gender;
      userResponse.medicalHistory = user.medicalHistory;
      userResponse.allergies = user.allergies;
      userResponse.currentMedications = user.currentMedications;
    } else if (user.userType === 'practitioner') {
      userResponse.specialization = user.specialization;
      userResponse.experience = user.experience;
      userResponse.qualifications = user.qualifications;
      userResponse.licenseNumber = user.licenseNumber;
      userResponse.consultationFee = user.consultationFee;
      userResponse.availability = user.availability;
      userResponse.isVerified = user.isVerified;
      userResponse.rating = user.rating;
      userResponse.totalReviews = user.totalReviews;
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message
    });
  }
};

// Logout user (optional - mainly for client-side token removal)
export const logout = async (req, res) => {
  try {
    // In a stateless JWT implementation, logout is mainly handled client-side
    // You could maintain a blacklist of tokens in a database/cache for enhanced security
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
};