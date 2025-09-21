import express from 'express';
import mongoose from 'mongoose';
import NotificationService from '../services/NotificationService.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const notificationService = new NotificationService();

// Apply authentication to all routes
router.use(authenticate);

// Get unread notifications for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;
    const userId = req.user._id;

    if (status === 'unread') {
      const result = await notificationService.getUnreadNotifications(userId, parseInt(limit));
      
      if (!result.success) {
        return res.status(400).json({ success: false, message: result.error });
      }

      return res.json({
        success: true,
        notifications: result.notifications,
        count: result.notifications.length
      });
    }

    // Get all notifications for user (with pagination)
    const Notification = (await import('../models/Notification.js')).default;
    const notifications = await Notification.find({ 
      recipientId: userId,
      status: 'sent' // Only show sent notifications to users
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

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await notificationService.markAsRead(id, userId);
    
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

    const appointmentData = {
      appointmentId: appointment._id,
      patientId: appointment.patientId._id,
      practitionerId: appointment.practitionerId._id,
      date: appointment.date,
      slotStartUtc: appointment.slotStartUtc,
      therapy: appointment.therapy || 'Ayurvedic Therapy',
      practitionerName: `${appointment.practitionerId.firstName} ${appointment.practitionerId.lastName}`,
      patientName: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
      duration: appointment.duration
    };

    const result = await notificationService.createAppointmentNotifications(
      appointmentData,
      userPreferences
    );
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.status(201).json({
      success: true,
      message: `Created ${result.count} notifications for appointment`,
      notifications: result.notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

// Process due notifications (admin/system endpoint)
router.post('/process-due', authorize(['admin']), async (req, res) => {
  try {
    const result = await notificationService.getDueNotifications();
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    const processResults = [];
    
    for (const notification of result.notifications) {
      const processResult = await notificationService.processNotification(notification);
      processResults.push({
        notificationId: notification._id,
        templateId: notification.templateId,
        success: processResult.success,
        results: processResult.results || [],
        error: processResult.error
      });
    }

    res.json({
      success: true,
      message: `Processed ${processResults.length} notifications`,
      results: processResults
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel notifications for an appointment
router.delete('/appointment/:appointmentId', authorize(['practitioner', 'admin']), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const result = await notificationService.cancelAppointmentNotifications(appointmentId);
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    res.json({
      success: true,
      message: `Cancelled ${result.modifiedCount} pending notifications`,
      modifiedCount: result.modifiedCount
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