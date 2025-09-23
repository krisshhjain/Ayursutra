import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import UnavailableDate from '../models/UnavailableDate.js';
import Appointment from '../models/Appointment.js';
import { Practitioner } from '../models/User.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/unavailable-dates
// @desc    Get all unavailable dates for the authenticated practitioner
// @access  Private (Practitioner only)
router.get('/', authorize('practitioner'), async (req, res) => {
  try {
    const practitionerId = req.user._id;
    const { startDate, endDate } = req.query;

    let query = { practitionerId };

    // Add date range filter if provided
    if (startDate && endDate) {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const unavailableDates = await UnavailableDate.find(query)
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      message: 'Unavailable dates retrieved successfully',
      data: unavailableDates
    });

  } catch (error) {
    console.error('Get unavailable dates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve unavailable dates',
      error: error.message
    });
  }
});

// @route   POST /api/unavailable-dates
// @desc    Add new unavailable date(s) for the authenticated practitioner
// @access  Private (Practitioner only)
router.post('/', authorize('practitioner'), async (req, res) => {
  try {
    const practitionerId = req.user._id;
    const { date, dates, reason, isRecurring, recurringType, recurringEndDate } = req.body;

    // Validate that either date or dates is provided
    if (!date && (!dates || !Array.isArray(dates) || dates.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Either date or dates array is required'
      });
    }

    // Validate practitioner exists
    const practitioner = await Practitioner.findById(practitionerId);
    if (!practitioner) {
      return res.status(404).json({
        success: false,
        message: 'Practitioner not found'
      });
    }

    const datesToAdd = date ? [date] : dates;
    const results = [];
    const errors = [];

    for (const dateToAdd of datesToAdd) {
      try {
        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateToAdd)) {
          errors.push({ date: dateToAdd, error: 'Invalid date format. Use YYYY-MM-DD' });
          continue;
        }

        // Check if date is not in the past
        const today = new Date().toISOString().split('T')[0];
        if (dateToAdd < today) {
          errors.push({ date: dateToAdd, error: 'Cannot add unavailable dates in the past' });
          continue;
        }

        // Check if date already exists
        const existingDate = await UnavailableDate.findOne({
          practitionerId,
          date: dateToAdd
        });

        if (existingDate) {
          errors.push({ date: dateToAdd, error: 'Date already marked as unavailable' });
          continue;
        }

        // Check for existing appointments on this date
        const existingAppointments = await Appointment.find({
          practitionerId,
          date: dateToAdd,
          status: { $in: ['requested', 'confirmed', 'rescheduled'] }
        }).populate('patientId', 'firstName lastName');

        if (existingAppointments.length > 0) {
          const patientNames = existingAppointments.map(apt => 
            `${apt.patientId.firstName} ${apt.patientId.lastName}`
          );
          errors.push({ 
            date: dateToAdd, 
            error: `Existing appointments with: ${patientNames.join(', ')}`,
            appointments: existingAppointments.length
          });
          continue;
        }

        // Create unavailable date
        const unavailableDate = new UnavailableDate({
          practitionerId,
          date: dateToAdd,
          reason: reason || '',
          isRecurring: isRecurring || false,
          recurringType: isRecurring ? recurringType : undefined,
          recurringEndDate: isRecurring ? recurringEndDate : undefined,
          createdBy: practitionerId
        });

        await unavailableDate.save();
        results.push(unavailableDate);

      } catch (error) {
        if (error.code === 11000) {
          errors.push({ date: dateToAdd, error: 'Date already marked as unavailable' });
        } else {
          errors.push({ date: dateToAdd, error: error.message });
        }
      }
    }

    // Return results
    const response = {
      success: results.length > 0,
      message: `${results.length} date(s) added successfully`,
      data: {
        added: results,
        failed: errors,
        summary: {
          total: datesToAdd.length,
          successful: results.length,
          failed: errors.length
        }
      }
    };

    // Set appropriate status code
    if (results.length === 0) {
      response.success = false;
      response.message = 'No dates were added';
      return res.status(400).json(response);
    } else if (errors.length > 0) {
      response.message = `${results.length} date(s) added, ${errors.length} failed`;
      return res.status(207).json(response); // Multi-status
    }

    res.status(201).json(response);

  } catch (error) {
    console.error('Add unavailable date error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add unavailable date',
      error: error.message
    });
  }
});

// @route   DELETE /api/unavailable-dates/:id
// @desc    Remove an unavailable date
// @access  Private (Practitioner only)
router.delete('/:id', authorize('practitioner'), async (req, res) => {
  try {
    const { id } = req.params;
    const practitionerId = req.user._id;

    // Find the unavailable date
    const unavailableDate = await UnavailableDate.findById(id);

    if (!unavailableDate) {
      return res.status(404).json({
        success: false,
        message: 'Unavailable date not found'
      });
    }

    // Check if practitioner owns this unavailable date
    if (unavailableDate.practitionerId.toString() !== practitionerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only remove your own unavailable dates'
      });
    }

    // Check for existing appointments on this date
    const conflictingAppointments = await unavailableDate.checkAppointmentConflicts();
    
    if (conflictingAppointments.length > 0) {
      const patientNames = conflictingAppointments.map(apt => 
        `${apt.patientId.firstName} ${apt.patientId.lastName}`
      );
      return res.status(409).json({
        success: false,
        message: `Cannot remove unavailable date. Existing appointments with: ${patientNames.join(', ')}`,
        conflicts: conflictingAppointments.length
      });
    }

    // Remove the unavailable date
    await UnavailableDate.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Unavailable date removed successfully',
      data: unavailableDate
    });

  } catch (error) {
    console.error('Delete unavailable date error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove unavailable date',
      error: error.message
    });
  }
});

// @route   DELETE /api/unavailable-dates/date/:date
// @desc    Remove an unavailable date by date
// @access  Private (Practitioner only)
router.delete('/date/:date', authorize('practitioner'), async (req, res) => {
  try {
    const { date } = req.params;
    const practitionerId = req.user._id;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Find the unavailable date
    const unavailableDate = await UnavailableDate.findOne({
      practitionerId,
      date
    });

    if (!unavailableDate) {
      return res.status(404).json({
        success: false,
        message: 'Unavailable date not found'
      });
    }

    // Check for existing appointments on this date
    const conflictingAppointments = await unavailableDate.checkAppointmentConflicts();
    
    if (conflictingAppointments.length > 0) {
      const patientNames = conflictingAppointments.map(apt => 
        `${apt.patientId.firstName} ${apt.patientId.lastName}`
      );
      return res.status(409).json({
        success: false,
        message: `Cannot remove unavailable date. Existing appointments with: ${patientNames.join(', ')}`,
        conflicts: conflictingAppointments.length
      });
    }

    // Remove the unavailable date
    await UnavailableDate.findByIdAndDelete(unavailableDate._id);

    res.status(200).json({
      success: true,
      message: 'Unavailable date removed successfully',
      data: unavailableDate
    });

  } catch (error) {
    console.error('Delete unavailable date by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove unavailable date',
      error: error.message
    });
  }
});

// @route   GET /api/unavailable-dates/check/:date
// @desc    Check if a specific date is unavailable for the authenticated practitioner
// @access  Private (Practitioner only)
router.get('/check/:date', authorize('practitioner'), async (req, res) => {
  try {
    const { date } = req.params;
    const practitionerId = req.user._id;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const isUnavailable = await UnavailableDate.isDateUnavailable(practitionerId, date);

    res.status(200).json({
      success: true,
      data: {
        date,
        isUnavailable,
        practitionerId
      }
    });

  } catch (error) {
    console.error('Check unavailable date error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check date availability',
      error: error.message
    });
  }
});

// @route   POST /api/unavailable-dates/bulk-remove
// @desc    Remove multiple unavailable dates
// @access  Private (Practitioner only)
router.post('/bulk-remove', authorize('practitioner'), async (req, res) => {
  try {
    const { dates } = req.body;
    const practitionerId = req.user._id;

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dates array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const date of dates) {
      try {
        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          errors.push({ date, error: 'Invalid date format. Use YYYY-MM-DD' });
          continue;
        }

        // Find the unavailable date
        const unavailableDate = await UnavailableDate.findOne({
          practitionerId,
          date
        });

        if (!unavailableDate) {
          errors.push({ date, error: 'Unavailable date not found' });
          continue;
        }

        // Check for existing appointments on this date
        const conflictingAppointments = await unavailableDate.checkAppointmentConflicts();
        
        if (conflictingAppointments.length > 0) {
          const patientNames = conflictingAppointments.map(apt => 
            `${apt.patientId.firstName} ${apt.patientId.lastName}`
          );
          errors.push({ 
            date, 
            error: `Existing appointments with: ${patientNames.join(', ')}`,
            appointments: conflictingAppointments.length
          });
          continue;
        }

        // Remove the unavailable date
        await UnavailableDate.findByIdAndDelete(unavailableDate._id);
        results.push({ date, removed: true });

      } catch (error) {
        errors.push({ date, error: error.message });
      }
    }

    // Return results
    const response = {
      success: results.length > 0,
      message: `${results.length} date(s) removed successfully`,
      data: {
        removed: results,
        failed: errors,
        summary: {
          total: dates.length,
          successful: results.length,
          failed: errors.length
        }
      }
    };

    // Set appropriate status code
    if (results.length === 0) {
      response.success = false;
      response.message = 'No dates were removed';
      return res.status(400).json(response);
    } else if (errors.length > 0) {
      response.message = `${results.length} date(s) removed, ${errors.length} failed`;
      return res.status(207).json(response); // Multi-status
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Bulk remove unavailable dates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove unavailable dates',
      error: error.message
    });
  }
});

export default router;