import express from 'express';
import { Practitioner } from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/practitioners
// @desc    Get all verified practitioners with optional gender filter
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { gender } = req.query;
    const filter = { isActive: true, isVerified: true };

    if (gender && gender !== 'any') {
      filter.gender = gender;
    }

    const practitioners = await Practitioner.find(filter).select('-password');
    
    res.status(200).json({
      success: true,
      data: practitioners
    });

  } catch (error) {
    console.error('Get practitioners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get practitioners data',
      error: error.message
    });
  }
});

export default router;
