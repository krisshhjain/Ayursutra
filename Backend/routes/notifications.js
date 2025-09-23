import express from 'express';
import mongoose from 'mongoose';
import NotificationService from '../services/NotificationService.js';
import TherapyNotificationService from '../services/TherapyNotificationService.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const notificationService = new NotificationService();
const therapyNotificationService = new TherapyNotificationService();

// Apply authentication to all routes
router.use(authenticate);

// Get unread notifications for the authenticated user (using focused therapy notifications)
router.get('/', async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;
    const userId = req.user._id;

    if (status === 'unread') {
      // Use the focused therapy notification service for better filtering
      const result = await therapyNotificationService.getUnreadNotifications(userId, parseInt(limit));
      
      if (!result.success) {
        return res.status(400).json({ success: false, message: result.error });
      }

      return res.json({
        success: true,
        notifications: result.notifications,
        count: result.notifications.length
      });
    }

    // Get all notifications for user (with pagination) - filter out vague notifications
    const Notification = (await import('../models/Notification.js')).default;
    const notifications = await Notification.find({ 
      recipientId: userId,
      status: 'sent',
      templateId: { $in: ['24h-before', '2h-before', 'on-time', 'immediate-post', 'appointment-confirmed', 'appointment-request'] }
    })
      .sort({ sentAt: -1, scheduledAt: -1 })
      .limit(parseInt(limit))
      .populate('appointmentId');

    res.json({
      success: true,
      notifications,
      count: notifications.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark notification as read (use therapy notification service)
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await therapyNotificationService.markAsRead(id, userId);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification: result.notification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create notification (admin/system use)
router.post('/', authorize(['admin', 'practitioner']), async (req, res) => {
  try {
    const {
      recipientId,
      appointmentId,
      channels,
      templateId,
      variables,
      scheduledAt
    } = req.body;

    const notificationData = {
      recipientId,
      appointmentId,
      channels: channels || ['in-app'],
      templateId,
      variables: variables || {},
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      createdBy: req.user._id
    };

    const result = await notificationService.createNotification(notificationData);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification: result.notification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create appointment notifications (called when appointment is created)
router.post('/appointment/:appointmentId', authorize(['practitioner']), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { userPreferences } = req.body;

    // Get appointment details
    const Appointment = (await import('../models/Appointment.js')).default;
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId practitionerId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Use the focused therapy notification service instead of the old one
    const appointmentData = {
      appointmentId: appointment._id,
      patientId: appointment.patientId._id,
      practitionerId: appointment.practitionerId._id,
      appointmentDate: appointment.date,
      appointmentTime: appointment.slotStartUtc ? new Date(appointment.slotStartUtc).toTimeString().slice(0, 5) : '10:00',
      therapyType: appointment.therapy || 'Ayurvedic Therapy',
      practitionerName: `${appointment.practitionerId.firstName} ${appointment.practitionerId.lastName}`,
      patientName: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
      duration: appointment.duration || 60
    };

    // Create focused therapy notifications (only the 4 specific ones)
    const result = await therapyNotificationService.createTherapyNotifications(appointmentData);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.status(201).json({
      success: true,
      message: result.message,
      notifications: result.notifications,
      count: result.count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create focused therapy notifications endpoint
router.post('/therapy', authorize(['practitioner']), async (req, res) => {
  try {
    const {
      appointmentId,
      patientId,
      appointmentDate,
      appointmentTime,
      therapyType,
      practitionerName,
      patientName,
      duration
    } = req.body;

    // Validate required fields
    if (!appointmentId || !patientId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: appointmentId, patientId, appointmentDate, appointmentTime'
      });
    }

    const appointmentData = {
      appointmentId,
      patientId,
      practitionerId: req.user._id,
      appointmentDate,
      appointmentTime,
      therapyType: therapyType || 'Ayurvedic Therapy',
      practitionerName: practitionerName || req.user.name || 'Dr. Practitioner',
      patientName: patientName || 'Patient',
      duration: duration || 60
    };

    const result = await therapyNotificationService.createTherapyNotifications(appointmentData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        data: result.notifications,
        count: result.count,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error creating therapy notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create therapy notifications'
    });
  }
});

// Clean up vague notifications endpoint
router.delete('/cleanup-vague/:appointmentId', authorize(['practitioner', 'admin']), async (req, res) => {
  try {
    const result = await therapyNotificationService.cleanupVagueNotifications(req.params.appointmentId);
    
    if (result.success) {
      res.json({
        success: true,
        deletedCount: result.deletedCount,
        message: `Removed ${result.deletedCount} vague notifications`
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Error cleaning up vague notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup notifications'
    });
  }
});

// Get notification statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.userType === 'admin' ? null : req.user._id;
    
    const result = await notificationService.getStats(userId);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.json({
      success: true,
      stats: result.stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Process due notifications (admin/system endpoint) - Use focused therapy notification service
router.post('/process-due', authorize(['admin']), async (req, res) => {
  try {
    const result = await therapyNotificationService.processDueNotifications();
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.json({
      success: true,
      message: `Processed ${result.processed} notifications`,
      processed: result.processed,
      results: result.results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel notifications for an appointment (use therapy notification service)
router.delete('/appointment/:appointmentId', authorize(['practitioner', 'admin']), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const result = await therapyNotificationService.cancelAppointmentNotifications(appointmentId);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.json({
      success: true,
      message: `Cancelled ${result.cancelledCount} pending notifications`,
      cancelledCount: result.cancelledCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test email endpoint (for debugging)
router.post('/test-email', async (req, res) => {
  try {
    // Get user details
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user._id);
    
    if (!user || !user.email) {
      return res.status(400).json({
        success: false,
        message: 'User email not found'
      });
    }

    // Create a test notification object
    const Notification = (await import('../models/Notification.js')).default;
    
    const testNotification = new Notification({
      recipientId: user._id,
      appointmentId: new mongoose.Types.ObjectId(),
      channels: ['email'],
      templateId: '24h-before',
      variables: {
        patientName: user.name || 'Test Patient',
        practitionerName: 'Dr. Test',
        therapy: 'Test Therapy',
        date: new Date().toLocaleDateString(),
        time: '10:00 AM',
        clinicName: 'AyurSutra Wellness Center',
        appointmentLink: 'http://localhost:8080/patient-schedule',
        unsubscribeLink: 'http://localhost:8080/notifications/unsubscribe'
      },
      scheduledAt: new Date(),
      createdBy: user._id
    });

    // Populate the recipient email
    testNotification.recipientId = user;

    // Process the notification
    const result = await notificationService.processNotification(testNotification);
    
    res.json({
      success: true,
      message: 'Test email sent',
      result
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

export default router;