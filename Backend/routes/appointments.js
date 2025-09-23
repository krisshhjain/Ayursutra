import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Appointment from '../models/Appointment.js';
import { Patient, Practitioner } from '../models/User.js';
import { generateSlots, validateSlotAvailability, getNextAvailableSlots } from '../lib/slotGenerator.js';
import { sendNotification, scheduleReminder } from '../lib/notifications.js';
import NotificationService from '../services/NotificationService.js';

const router = express.Router();
const notificationService = new NotificationService();

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/appointments/practitioners
// @desc    Get available practitioners for booking
// @access  Private (Authenticated users)
router.get('/practitioners', async (req, res) => {
  try {
    // Get all active practitioners with basic info for booking
    const practitioners = await Practitioner.find({ 
      isActive: true,
      isVerified: true 
    })
    .select('firstName lastName specialization experience qualifications profileImage rating')
    .sort({ rating: -1, experience: -1 }); // Sort by rating and experience

    const formattedPractitioners = practitioners.map(practitioner => {
      // Map specialization to user-friendly names
      const specializationMap = {
        'panchakarma': 'Panchakarma Specialist',
        'general': 'General Ayurvedic Consultation',
        'rasayana': 'Rasayana & Rejuvenation Therapy',
        'kayachikitsa': 'Kayachikitsa & Internal Medicine'
      };

      return {
        _id: practitioner._id,
        firstName: practitioner.firstName,
        lastName: practitioner.lastName,
        name: `${practitioner.firstName} ${practitioner.lastName}`,
        specialization: specializationMap[practitioner.specialization] || practitioner.specialization,
        experience: practitioner.experience || 0,
        qualifications: practitioner.qualifications || [],
        profileImage: practitioner.profileImage,
        rating: practitioner.rating || 0
      };
    });

    res.status(200).json({
      success: true,
      message: 'Practitioners retrieved successfully',
      data: formattedPractitioners
    });

  } catch (error) {
    console.error('Get practitioners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch practitioners',
      error: error.message
    });
  }
});

// @route   GET /api/practitioner/:practitionerId/availability
// @desc    Get available slots for a practitioner on a specific date
// @access  Private (Authenticated users)
router.get('/practitioner/:practitionerId/availability', async (req, res) => {
  try {
    const { practitionerId } = req.params;
    const { date, slotLength } = req.query;

    // Validate required parameters
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required (YYYY-MM-DD format)'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
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

    // Parse optional slot length
    const options = {};
    if (slotLength) {
      const parsedSlotLength = parseInt(slotLength);
      if (isNaN(parsedSlotLength) || parsedSlotLength < 15 || parsedSlotLength > 240) {
        return res.status(400).json({
          success: false,
          message: 'Slot length must be between 15 and 240 minutes'
        });
      }
      options.slotLength = parsedSlotLength;
    }

    // Generate slots
    const slotsData = await generateSlots(practitionerId, date, options);

    res.status(200).json({
      success: true,
      data: slotsData
    });

  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get availability',
      error: error.message
    });
  }
});

// @route   POST /api/appointments
// @desc    Create a new appointment request (patient requests a slot)
// @access  Private (Patient only)
router.post('/', authorize('patient'), async (req, res) => {
  try {
    const { practitionerId, date, slotStartUtc, duration, notes } = req.body;
    const patientId = req.user._id;

    // Validate required fields
    if (!practitionerId || !date || !slotStartUtc) {
      return res.status(400).json({
        success: false,
        message: 'Practitioner ID, date, and slot start time are required'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Validate and parse slot start time
    let startTime, endTime;
    try {
      startTime = new Date(slotStartUtc);
      if (isNaN(startTime.getTime())) {
        throw new Error('Invalid start time');
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slot start time. Use ISO 8601 format'
      });
    }

    // Validate duration
    const slotDuration = duration || 30;
    if (slotDuration < 15 || slotDuration > 240) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be between 15 and 240 minutes'
      });
    }

    // Calculate end time
    endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + slotDuration);

    // Validate practitioner exists
    const practitioner = await Practitioner.findById(practitionerId);
    if (!practitioner) {
      return res.status(404).json({
        success: false,
        message: 'Practitioner not found'
      });
    }

    // Validate patient exists (should be guaranteed by auth, but double-check)
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Validate slot availability
    const validation = await validateSlotAvailability(practitionerId, date, startTime, endTime);
    if (!validation.isValid) {
      // Get next available slots to help user
      const nextSlots = await getNextAvailableSlots(practitionerId, date, 3);
      
      return res.status(409).json({
        success: false,
        message: validation.reason,
        nextAvailableSlots: nextSlots
      });
    }

    // Create appointment
    const appointment = new Appointment({
      practitionerId,
      patientId,
      date,
      time: startTime.toTimeString().substring(0, 5), // Extract HH:MM format
      slotStartUtc: startTime,
      slotEndUtc: endTime,
      duration: slotDuration,
      status: 'requested',
      createdBy: 'patient',
      notes: notes || ''
    });

    try {
      await appointment.save();
      
      // Populate practitioner and patient details for response
      await appointment.populate([
        { path: 'practitionerId', select: 'firstName lastName specialization' },
        { path: 'patientId', select: 'firstName lastName' }
      ]);

      // Send notification to practitioner about new appointment request
      const notificationData = {
        appointmentId: appointment._id,
        patientId: appointment.patientId._id,
        practitionerId: appointment.practitionerId._id,
        date: appointment.date,
        slotStartUtc: appointment.slotStartUtc,
        therapy: appointment.notes || 'Ayurvedic Consultation',
        practitionerName: `${appointment.practitionerId.firstName} ${appointment.practitionerId.lastName}`,
        patientName: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`
      };

      const practitionerNotification = await notificationService.createAppointmentRequestNotification(notificationData);
      
      if (practitionerNotification.success) {
        console.log(`✅ Sent appointment request notification to practitioner ${appointment.practitionerId.firstName} ${appointment.practitionerId.lastName}`);
      } else {
        console.error('❌ Failed to send practitioner notification:', practitionerNotification.error);
      }

      res.status(201).json({
        success: true,
        message: 'Appointment request created successfully',
        data: appointment
      });

    } catch (error) {
      // Handle duplicate key error (double booking attempt)
      if (error.code === 11000) {
        // Get next available slots to help user
        const nextSlots = await getNextAvailableSlots(practitionerId, date, 3);
        
        return res.status(409).json({
          success: false,
          message: 'This time slot is no longer available. Please choose another slot.',
          nextAvailableSlots: nextSlots
        });
      }
      
      throw error; // Re-throw other errors
    }

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message
    });
  }
});

// @route   GET /api/appointments
// @desc    Get appointments for current user
// @access  Private (Patient or Practitioner)
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.userType;
    const { status, dateFrom, dateTo, page = 1, limit = 10 } = req.query;

    // Build query based on user type
    let query = {};
    if (userType === 'patient') {
      query.patientId = userId;
    } else if (userType === 'practitioner') {
      query.practitionerId = userId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add status filter if provided
    if (status) {
      const validStatuses = ['requested', 'confirmed', 'rescheduled', 'cancelled', 'completed'];
      if (validStatuses.includes(status)) {
        query.status = status;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Valid values: ' + validStatuses.join(', ')
        });
      }
    }

    // Add date range filter if provided
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid dateFrom format. Use YYYY-MM-DD'
          });
        }
        query.date.$gte = dateFrom;
      }
      if (dateTo) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid dateTo format. Use YYYY-MM-DD'
          });
        }
        query.date.$lte = dateTo;
      }
    }

    // Parse pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 per page
    const skip = (pageNum - 1) * limitNum;

    // Get appointments with pagination
    const appointments = await Appointment.find(query)
      .populate('practitionerId', 'firstName lastName specialization')
      .populate('patientId', 'firstName lastName')
      .sort({ date: -1, slotStartUtc: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalCount = await Appointment.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalAppointments: totalCount,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: error.message
    });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get a specific appointment
// @access  Private (Patient or Practitioner - must be related to the appointment)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userType = req.user.userType;

    // Find appointment
    const appointment = await Appointment.findById(id)
      .populate('practitionerId', 'firstName lastName specialization')
      .populate('patientId', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const isAuthorized = (
      (userType === 'patient' && appointment.patientId._id.toString() === userId.toString()) ||
      (userType === 'practitioner' && appointment.practitionerId._id.toString() === userId.toString())
    );

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment',
      error: error.message
    });
  }
});

// @route   PATCH /api/appointments/:id
// @desc    Update appointment (reschedule/cancel)
// @access  Private (Patient can cancel own, Practitioner can reschedule/cancel)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, newDate, newSlotStartUtc, reason } = req.body;
    const userId = req.user._id;
    const userType = req.user.userType;

    // Validate action
    const validActions = ['cancel', 'reschedule'];
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Valid action is required: cancel, reschedule'
      });
    }

    // Find appointment
    const appointment = await Appointment.findById(id)
      .populate('practitionerId', 'firstName lastName')
      .populate('patientId', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const isPatient = userType === 'patient' && appointment.patientId._id.toString() === userId.toString();
    const isPractitioner = userType === 'practitioner' && appointment.practitionerId._id.toString() === userId.toString();

    if (!isPatient && !isPractitioner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if appointment can be modified
    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot modify ${appointment.status} appointment`
      });
    }

    if (action === 'cancel') {
      // Cancel appointment
      appointment.status = 'cancelled';
      appointment.notes += reason ? ` | Cancelled: ${reason}` : ' | Cancelled';
      await appointment.save();

      // Cancel any pending notifications for this appointment
      const cancelResult = await notificationService.cancelAppointmentNotifications(appointment._id);
      if (cancelResult.success) {
        console.log(`🚫 Cancelled ${cancelResult.modifiedCount} pending notifications for appointment ${appointment._id}`);
      }

      // Send immediate cancellation notification to the other party
      const recipientId = isPatient ? appointment.practitionerId._id : appointment.patientId._id;
      const recipientModel = isPatient ? 'Practitioner' : 'Patient';

      // Send legacy in-app notification
      await sendNotification({
        toUserId: recipientId,
        channel: 'in-app',
        template: 'appointment-cancelled',
        data: {
          date: appointment.date,
          time: appointment.slotStartUtc.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          reason: reason || 'No reason provided'
        }
      });

      // If practitioner is cancelling, send immediate email to patient
      if (isPractitioner) {
        try {
          const cancellationNotificationData = {
            recipientId: appointment.patientId._id,
            recipientModel: 'Patient',
            appointmentId: appointment._id,
            channels: ['in-app', 'email'],
            templateId: 'appointment-cancelled',
            variables: {
              patientName: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
              practitionerName: `${appointment.practitionerId.firstName} ${appointment.practitionerId.lastName}`,
              date: appointment.date,
              time: appointment.slotStartUtc.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              therapy: appointment.notes?.split(' | Cancelled')[0] || 'Consultation',
              reason: reason || 'Schedule adjustment',
              clinicName: 'AyurSutra Wellness Center',
              appointmentLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/patient-schedule`,
              unsubscribeLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/notifications/unsubscribe`
            },
            scheduledAt: new Date(), // Send immediately
            createdBy: userId
          };

          const created = await notificationService.createNotification(cancellationNotificationData);
          if (created.success && created.notification) {
            // Populate recipient to ensure email address is available
            const notif = await created.notification.populate('recipientId');
            if (notif) {
              const processResult = await notificationService.processNotification(notif);
              if (processResult.success) {
                console.log(`✅ Sent immediate cancellation email to patient ${appointment.patientId.firstName} ${appointment.patientId.lastName}`);
              } else {
                console.error('❌ Failed to send cancellation email:', processResult.error);
              }
            }
          } else {
            console.error('❌ Failed to create cancellation notification:', created.error);
          }
        } catch (emailError) {
          console.error('❌ Error sending cancellation email notification:', emailError);
          // Don't fail the cancellation if email fails
        }
      }

      res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        data: appointment
      });

    } else if (action === 'reschedule') {
      // Only practitioners can reschedule for now
      if (!isPractitioner) {
        return res.status(403).json({
          success: false,
          message: 'Only practitioners can reschedule appointments'
        });
      }

      // Validate reschedule data
      if (!newDate || !newSlotStartUtc) {
        return res.status(400).json({
          success: false,
          message: 'New date and slot start time are required for rescheduling'
        });
      }

      // Validate new date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid new date format. Use YYYY-MM-DD'
        });
      }

      // Parse new slot time
      let newStartTime, newEndTime;
      try {
        newStartTime = new Date(newSlotStartUtc);
        if (isNaN(newStartTime.getTime())) {
          throw new Error('Invalid start time');
        }
        newEndTime = new Date(newStartTime);
        newEndTime.setMinutes(newEndTime.getMinutes() + appointment.duration);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid new slot start time. Use ISO 8601 format'
        });
      }

      // Validate new slot availability
      const validation = await validateSlotAvailability(
        appointment.practitionerId._id, 
        newDate, 
        newStartTime, 
        newEndTime
      );

      if (!validation.isValid) {
        const nextSlots = await getNextAvailableSlots(appointment.practitionerId._id, newDate, 3);
        return res.status(409).json({
          success: false,
          message: validation.reason,
          nextAvailableSlots: nextSlots
        });
      }

      // Store old appointment details for notification
      const oldDate = appointment.date;
      const oldTime = appointment.slotStartUtc.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // Update appointment
      appointment.date = newDate;
      appointment.slotStartUtc = newStartTime;
      appointment.slotEndUtc = newEndTime;
      appointment.status = 'rescheduled';
      appointment.notes += reason ? ` | Rescheduled: ${reason}` : ' | Rescheduled by practitioner';

      try {
        await appointment.save();

        // Cancel old notifications and create new ones for rescheduled appointment
        const cancelResult = await notificationService.cancelAppointmentNotifications(appointment._id);
        if (cancelResult.success) {
          console.log(`🚫 Cancelled ${cancelResult.modifiedCount} old notifications for rescheduled appointment`);
        }

        // Create new notifications for the rescheduled appointment
        const appointmentData = {
          appointmentId: appointment._id,
          patientId: appointment.patientId._id,
          practitionerId: appointment.practitionerId._id,
          date: newDate,
          slotStartUtc: newStartTime,
          therapy: appointment.notes || 'Ayurvedic Therapy',
          practitionerName: `${appointment.practitionerId.firstName} ${appointment.practitionerId.lastName}`,
          patientName: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
          duration: appointment.duration
        };

        const userPreferences = {
          notificationChannels: ['in-app', 'email'],
          timezone: 'UTC'
        };

        const notificationResult = await notificationService.createAppointmentNotifications(
          appointmentData,
          userPreferences
        );

        if (notificationResult.success) {
          console.log(`✅ Created ${notificationResult.count} new notifications for rescheduled appointment`);
        }

        // Send rescheduling notification to patient
        await sendNotification({
          toUserId: appointment.patientId._id,
          channel: 'in-app',
          template: 'appointment-rescheduled',
          data: {
            practitionerName: `${appointment.practitionerId.firstName} ${appointment.practitionerId.lastName}`,
            oldDate,
            oldTime,
            newDate,
            newTime: newStartTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            reason: reason || 'Schedule adjustment'
          }
        });

        // Send immediate reschedule email notification to patient
        try {
          const rescheduleNotificationData = {
            recipientId: appointment.patientId._id,
            recipientModel: 'Patient',
            appointmentId: appointment._id,
            channels: ['in-app', 'email'],
            templateId: 'appointment-rescheduled',
            variables: {
              patientName: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
              practitionerName: `${appointment.practitionerId.firstName} ${appointment.practitionerId.lastName}`,
              oldDate,
              oldTime,
              newDate,
              newTime: newStartTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              therapy: appointment.notes?.split(' | Rescheduled')[0] || 'Consultation',
              reason: reason || 'Schedule adjustment',
              clinicName: 'AyurSutra Wellness Center',
              appointmentLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/patient-schedule`,
              unsubscribeLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/notifications/unsubscribe`
            },
            scheduledAt: new Date(), // Send immediately
            createdBy: userId
          };

          const created = await notificationService.createNotification(rescheduleNotificationData);
          if (created.success && created.notification) {
            // Populate recipient to ensure email address is available
            const notif = await created.notification.populate('recipientId');
            if (notif) {
              const processResult = await notificationService.processNotification(notif);
              if (processResult.success) {
                console.log(`✅ Sent immediate reschedule email to patient ${appointment.patientId.firstName} ${appointment.patientId.lastName}`);
              } else {
                console.error('❌ Failed to send reschedule email:', processResult.error);
              }
            }
          } else {
            console.error('❌ Failed to create reschedule notification:', created.error);
          }
        } catch (emailError) {
          console.error('❌ Error sending reschedule email notification:', emailError);
          // Don't fail the reschedule if email fails
        }

        res.status(200).json({
          success: true,
          message: 'Appointment rescheduled successfully',
          data: appointment
        });

      } catch (error) {
        if (error.code === 11000) {
          return res.status(409).json({
            success: false,
            message: 'The new time slot is no longer available'
          });
        }
        throw error;
      }
    }

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
});

// @route   POST /api/appointments/:id/confirm
// @desc    Confirm a requested appointment (practitioner only)
// @access  Private (Practitioner only)
router.post('/:id/confirm', authorize('practitioner'), async (req, res) => {
  try {
    const { id } = req.params;
    const practitionerId = req.user._id;

    // Find appointment
    const appointment = await Appointment.findById(id)
      .populate('practitionerId', 'firstName lastName specialization')
      .populate('patientId', 'firstName lastName');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if practitioner owns this appointment
    if (appointment.practitionerId._id.toString() !== practitionerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only confirm your own appointments'
      });
    }

    // Check if appointment can be confirmed
    if (appointment.status !== 'requested') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm ${appointment.status} appointment. Only requested appointments can be confirmed.`
      });
    }

    // Confirm appointment
    appointment.status = 'confirmed';
    await appointment.save();

    // Send immediate confirmation notification using old system
    await sendNotification({
      toUserId: appointment.patientId._id,
      channel: 'in-app',
      template: 'appointment-confirmed',
      data: {
        practitionerName: `${appointment.practitionerId.firstName} ${appointment.practitionerId.lastName}`,
        date: appointment.date,
        time: appointment.slotStartUtc.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        therapy: appointment.notes || 'Consultation'
      }
    });

    // Also create and process an immediate appointment-confirmed notification via NotificationService
    try {
      const immediateNotificationData = {
        recipientId: appointment.patientId._id,
        recipientModel: 'Patient',
        appointmentId: appointment._id,
        channels: ['in-app', 'email'],
        templateId: 'appointment-confirmed',
        variables: {
          practitionerName: `${appointment.practitionerId.firstName} ${appointment.practitionerId.lastName}`,
          date: appointment.date,
          time: appointment.slotStartUtc.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          therapy: appointment.notes || 'Consultation'
        },
        scheduledAt: new Date(),
        createdBy: practitionerId
      };

      const created = await notificationService.createNotification(immediateNotificationData);
      if (created.success && created.notification) {
        // Populate recipient to ensure email address is available to send
        const notif = await created.notification.populate('recipientId');
        if (notif) {
          const proc = await notificationService.processNotification(notif);
          if (!proc.success) {
            console.error('Failed to process immediate appointment confirmation notification:', proc.error);
          }
        }
      } else {
        console.error('Failed to create immediate appointment confirmation notification:', created.error);
      }
    } catch (err) {
      console.error('Error sending immediate appointment confirmation notification:', err);
    }

    // Create comprehensive appointment notifications using new notification service
    const appointmentData = {
      appointmentId: appointment._id,
      patientId: appointment.patientId._id,
      practitionerId: appointment.practitionerId._id,
      date: appointment.date,
      slotStartUtc: appointment.slotStartUtc,
      therapy: appointment.notes || 'Ayurvedic Therapy',
      practitionerName: `${appointment.practitionerId.firstName} ${appointment.practitionerId.lastName}`,
      patientName: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
      duration: appointment.duration
    };

    // Default user preferences - could be enhanced to get from user profile
    const userPreferences = {
      notificationChannels: ['in-app', 'email'],
      timezone: 'UTC' // TODO: Get from user profile
    };

    // Create the 5-stage notification workflow
    const notificationResult = await notificationService.createAppointmentNotifications(
      appointmentData,
      userPreferences
    );

    if (!notificationResult.success) {
      console.error('Failed to create appointment notifications:', notificationResult.error);
      // Don't fail the confirmation, just log the error
    } else {
      console.log(`✅ Created ${notificationResult.count} notifications for appointment ${appointment._id}`);
    }

    // TODO: Generate calendar invite (ICS file)
    const calendarInfo = {
      title: `Ayurvedic Therapy Session with Dr. ${appointment.practitionerId.firstName} ${appointment.practitionerId.lastName}`,
      startTime: appointment.slotStartUtc,
      endTime: appointment.slotEndUtc,
      description: appointment.notes || 'Ayurvedic therapy session',
      location: 'AyurSutra Clinic' // TODO: Get from practitioner profile
    };

    res.status(200).json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: {
        appointment,
        calendarInfo, // Frontend can use this to generate calendar events
        notificationsCreated: notificationResult.success ? notificationResult.count : 0
      }
    });

  } catch (error) {
    console.error('Confirm appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm appointment',
      error: error.message
    });
  }
});

// @route   POST /api/appointments/:id/complete
// @desc    Mark a confirmed appointment as completed (practitioner only)
// @access  Private (Practitioner only)
router.post('/:id/complete', authorize('practitioner'), async (req, res) => {
  try {
    const { id } = req.params;
    const practitionerId = req.user._id;
    const { sessionNotes, completionTime } = req.body;

    // Find appointment
    const appointment = await Appointment.findById(id)
      .populate('practitionerId', 'firstName lastName specialization')
      .populate('patientId', 'firstName lastName email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if practitioner owns this appointment
    if (appointment.practitionerId._id.toString() !== practitionerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only complete your own appointments'
      });
    }

    // Check if appointment can be completed
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete ${appointment.status} appointment. Only confirmed appointments can be completed.`
      });
    }

    // Mark appointment as completed
    appointment.status = 'completed';
    appointment.completedAt = completionTime ? new Date(completionTime) : new Date();
    if (sessionNotes) {
      appointment.notes = sessionNotes;
    }
    
    await appointment.save();

    // Create completion notification for patient
    try {
      const immediateNotificationData = {
        recipientId: appointment.patientId._id,
        recipientModel: 'Patient',
        appointmentId: appointment._id,
        channels: ['in-app', 'email'],
        templateId: 'appointment-completed',
        variables: {
          patientName: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
          practitionerName: `${appointment.practitionerId.firstName} ${appointment.practitionerId.lastName}`,
          date: appointment.date,
          time: appointment.slotStartUtc.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          therapy: appointment.notes || 'Consultation',
          clinicName: 'AyurSutra Wellness Center',
          appointmentLink: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/patient-schedule`,
          unsubscribeLink: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/notifications/unsubscribe`
        },
        scheduledAt: new Date(),
        createdBy: practitionerId
      };

      const created = await notificationService.createNotification(immediateNotificationData);
      if (created.success && created.notification) {
        const notif = await created.notification.populate('recipientId');
        if (notif) {
          await notificationService.processNotification(notif);
        }
      }
    } catch (err) {
      console.error('Error sending appointment completion notification:', err);
    }

    res.status(200).json({
      success: true,
      data: {
        appointment
      },
      message: 'Appointment completed successfully'
    });

  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete appointment',
      error: error.message
    });
  }
});

export default router;