import express from 'express';
import Review from '../models/Review.js';
import Appointment from '../models/Appointment.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/reviews/appointment/:appointmentId/exists
// @desc    Check if a review exists for an appointment
// @access  Private (Patient only)
router.get('/appointment/:appointmentId/exists', authorize('patient'), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const patientId = req.user._id;

    // Find appointment to verify patient ownership
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if patient owns the appointment
    if (appointment.patientId.toString() !== patientId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Check if review exists
    const existingReview = await Review.findOne({ appointmentId });
    
    res.json({
      success: true,
      hasReview: !!existingReview
    });
  } catch (error) {
    console.error('Error checking review existence:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking review'
    });
  }
});

// @route   POST /api/reviews
// @desc    Create a new review for a completed appointment
// @access  Private (Patient only)
router.post('/', authorize('patient'), async (req, res) => {
  try {
    const patientId = req.user._id;
    const {
      appointmentId,
      rating,
      reviewText,
      aspects,
      wouldRecommend,
      isAnonymous
    } = req.body;

    // Validate required fields
    if (!appointmentId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID and rating are required'
      });
    }

    // Find and validate appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if patient owns the appointment
    if (appointment.patientId.toString() !== patientId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own appointments'
      });
    }

    // Check if appointment is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed appointments'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ appointmentId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this appointment'
      });
    }

    // Create review
    const review = new Review({
      appointmentId,
      patientId,
      practitionerId: appointment.practitionerId,
      rating,
      reviewText: reviewText || '',
      aspects: aspects || {},
      wouldRecommend: wouldRecommend !== false, // Default to true
      isAnonymous: isAnonymous || false
    });

    await review.save();

    // Populate the review with appointment and patient details
    await review.populate([
      {
        path: 'appointmentId',
        select: 'date slotStartUtc notes'
      },
      {
        path: 'patientId',
        select: 'firstName lastName'
      }
    ]);

    res.status(201).json({
      success: true,
      data: {
        review
      },
      message: 'Review created successfully'
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
});

// @route   GET /api/reviews/practitioner/:practitionerId
// @desc    Get reviews for a practitioner
// @access  Public
router.get('/practitioner/:practitionerId', async (req, res) => {
  try {
    const { practitionerId } = req.params;
    const { page = 1, limit = 10, rating, sortBy = 'createdAt' } = req.query;

    console.log('Fetching reviews for practitioner:', practitionerId);

    // Build filter
    const filter = {
      practitionerId,
      isVisible: true
    };

    if (rating) {
      filter.rating = parseInt(rating);
    }

    // Build sort
    const sortOptions = {};
    switch (sortBy) {
      case 'rating-high':
        sortOptions.rating = -1;
        sortOptions.createdAt = -1;
        break;
      case 'rating-low':
        sortOptions.rating = 1;
        sortOptions.createdAt = -1;
        break;
      case 'helpful':
        sortOptions.helpfulCount = -1;
        sortOptions.createdAt = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    // Get reviews with pagination
    const reviews = await Review.find(filter)
      .populate([
        {
          path: 'appointmentId',
          select: 'date slotStartUtc notes'
        },
        {
          path: 'patientId',
          select: 'firstName lastName',
          transform: (doc, ret) => {
            // Handle anonymous reviews
            const review = ret.parent?.();
            if (review?.isAnonymous) {
              return {
                firstName: 'Anonymous',
                lastName: 'User'
              };
            }
            return ret;
          }
        }
      ])
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const totalReviews = await Review.countDocuments(filter);

    // Get practitioner statistics
    const stats = await Review.getPractitionerStats(practitionerId);
    console.log('Calculated stats for practitioner:', practitionerId, stats);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1
        },
        stats
      }
    });

  } catch (error) {
    console.error('Get practitioner reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

// @route   GET /api/reviews/patient/my-reviews
// @desc    Get patient's own reviews
// @access  Private (Patient only)
router.get('/patient/my-reviews', authorize('patient'), async (req, res) => {
  try {
    const patientId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ patientId })
      .populate([
        {
          path: 'appointmentId',
          select: 'date slotStartUtc notes'
        },
        {
          path: 'practitionerId',
          select: 'firstName lastName specialization'
        }
      ])
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments({ patientId });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get patient reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private (Patient only - own reviews)
router.put('/:id', authorize('patient'), async (req, res) => {
  try {
    const patientId = req.user._id;
    const { id } = req.params;
    const {
      rating,
      reviewText,
      aspects,
      wouldRecommend,
      isAnonymous
    } = req.body;

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.patientId.toString() !== patientId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (reviewText !== undefined) review.reviewText = reviewText;
    if (aspects !== undefined) review.aspects = { ...review.aspects, ...aspects };
    if (wouldRecommend !== undefined) review.wouldRecommend = wouldRecommend;
    if (isAnonymous !== undefined) review.isAnonymous = isAnonymous;

    await review.save();

    // Populate for response
    await review.populate([
      {
        path: 'appointmentId',
        select: 'date slotStartUtc notes'
      },
      {
        path: 'practitionerId',
        select: 'firstName lastName specialization'
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        review
      },
      message: 'Review updated successfully'
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private (Patient only - own reviews)
router.delete('/:id', authorize('patient'), async (req, res) => {
  try {
    const patientId = req.user._id;
    const { id } = req.params;

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.patientId.toString() !== patientId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark a review as helpful
// @access  Private
router.post('/:id/helpful', authorize(['patient', 'practitioner']), async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        helpfulCount: review.helpfulCount
      },
      message: 'Review marked as helpful'
    });

  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful',
      error: error.message
    });
  }
});

export default router;