import Notification from '../models/Notification.js';
import { getTemplate } from '../utils/notificationTemplates.js';
import nodemailer from 'nodemailer';

/**
 * Enhanced Notification Service for Therapy Sessions
 * Focuses on 4 specific notifications:
 * 1. 24 hours before appointment
 * 2. 2 hours before appointment  
 * 3. At appointment time (immediately before)
 * 4. Post-procedure follow-up
 */
class TherapyNotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '') // Remove spaces
      }
    });
  }

  /**
   * Create focused notifications for therapy sessions
   * Only creates the 4 essential notifications, no vague ones
   */
  async createTherapyNotifications(appointmentData) {
    try {
      const {
        appointmentId,
        patientId,
        practitionerId,
        appointmentDate,
        appointmentTime,
        therapyType = 'Ayurvedic Therapy',
        practitionerName = 'Dr. Practitioner',
        patientName = 'Patient',
        duration = 60 // minutes
      } = appointmentData;

      const appointments = [];
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      const now = new Date();

      // Notification variables
      const variables = {
        patientName,
        practitionerName,
        therapy: therapyType,
        date: appointmentDateTime.toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: appointmentDateTime.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        clinicName: 'AyurSutra Wellness Center',
        appointmentLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/patient-schedule`,
        unsubscribeLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/notifications/unsubscribe`
      };

      // Define the 4 specific notification schedules
      const notificationSchedules = [
        {
          templateId: '24h-before',
          scheduledAt: new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000),
          description: 'Preparation reminder sent 1 day before appointment'
        },
        {
          templateId: '2h-before', 
          scheduledAt: new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000),
          description: 'Final preparation reminder sent 2 hours before appointment'
        },
        {
          templateId: 'on-time',
          scheduledAt: appointmentDateTime,
          description: 'Session starting notification sent at appointment time'
        },
        {
          templateId: 'immediate-post',
          scheduledAt: new Date(appointmentDateTime.getTime() + (duration + 15) * 60 * 1000),
          description: 'Post-procedure care instructions sent after session completion'
        }
      ];

      // Only create notifications for future times (with 2-minute buffer to avoid edge cases)
      for (const schedule of notificationSchedules) {
        if (schedule.scheduledAt.getTime() > now.getTime() + 2 * 60 * 1000) {
          const notification = {
            recipientId: patientId,
            recipientModel: 'Patient',
            appointmentId,
            channels: ['in-app', 'email'],
            templateId: schedule.templateId,
            variables,
            scheduledAt: schedule.scheduledAt,
            status: 'pending',
            metadata: {
              therapyType,
              description: schedule.description,
              createdBy: 'TherapyNotificationService',
              appointmentDateTime: appointmentDateTime.toISOString()
            },
            createdBy: practitionerId
          };

          appointments.push(notification);
          console.log(`📅 Scheduled ${schedule.templateId} notification for ${schedule.scheduledAt.toLocaleString()}`);
        } else {
          console.log(`⏰ Skipping ${schedule.templateId} - scheduled time ${schedule.scheduledAt.toLocaleString()} is in the past`);
        }
      }

      // Remove any existing vague notifications for this appointment
      await this.cleanupVagueNotifications(appointmentId);

      // Save the focused notifications
      if (appointments.length > 0) {
        const savedNotifications = await Notification.insertMany(appointments);
        console.log(`✅ Created ${savedNotifications.length} focused therapy notifications for appointment ${appointmentId}`);
        
        return {
          success: true,
          notifications: savedNotifications,
          count: savedNotifications.length,
          message: `Created ${savedNotifications.length} focused therapy notifications`
        };
      } else {
        return {
          success: true,
          notifications: [],
          count: 0,
          message: 'No notifications needed - appointment time is in the past'
        };
      }

    } catch (error) {
      console.error('❌ Error creating therapy notifications:', error);
      return {
        success: false,
        error: error.message,
        notifications: [],
        count: 0
      };
    }
  }

  /**
   * Remove vague, generic notifications that are not helpful
   */
  async cleanupVagueNotifications(appointmentId) {
    try {
      // List of vague notification types to remove
      const vagueTemplateIds = [
        'follow-up-care',
        'care-instructions', 
        'beginning-now',
        'starting-soon',
        'general-reminder',
        'generic-notification'
      ];

      const result = await Notification.deleteMany({
        appointmentId,
        $or: [
          { templateId: { $in: vagueTemplateIds } },
          { 'metadata.description': { $regex: /follow-up care|care instructions|beginning now|starting soon/i } }
        ]
      });

      if (result.deletedCount > 0) {
        console.log(`🧹 Removed ${result.deletedCount} vague notifications for appointment ${appointmentId}`);
      }

      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      console.error('❌ Error cleaning up vague notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process due notifications and send them via appropriate channels
   */
  async processDueNotifications() {
    try {
      const dueNotifications = await Notification.find({
        status: 'pending',
        scheduledAt: { $lte: new Date() }
      }).populate('recipientId appointmentId');

      console.log(`📬 Processing ${dueNotifications.length} due notifications`);

      const results = [];
      for (const notification of dueNotifications) {
        try {
          const result = await this.processNotification(notification);
          results.push({ notificationId: notification._id, result });
        } catch (error) {
          console.error(`❌ Error processing notification ${notification._id}:`, error);
          results.push({ notificationId: notification._id, error: error.message });
        }
      }

      return {
        success: true,
        processed: results.length,
        results
      };
    } catch (error) {
      console.error('❌ Error processing due notifications:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process individual notification
   */
  async processNotification(notification) {
    try {
      const template = getTemplate(notification.templateId);
      if (!template) {
        throw new Error(`Template not found: ${notification.templateId}`);
      }

      notification.status = 'sending';
      await notification.save();

      const results = [];

      // Process each channel
      for (const channel of notification.channels) {
        if (channel === 'in-app') {
          // In-app notifications are considered "sent" when saved to database
          await notification.addAttempt('in-app', 'sent', null, null, { 
            sentAt: new Date(),
            message: template.inApp?.message || 'Notification created'
          });
          results.push({ channel: 'in-app', success: true });
        } else if (channel === 'email') {
          const emailResult = await this.sendEmailNotification(notification, template);
          results.push({ channel: 'email', success: emailResult.success, result: emailResult });
        }
      }

      // Mark as sent
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();

      console.log(`✅ Processed notification ${notification._id} (${notification.templateId})`);
      return { success: true, results };

    } catch (error) {
      notification.status = 'failed';
      await notification.save();
      console.error(`❌ Failed to process notification ${notification._id}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(notification, template) {
    try {
      if (!notification.recipientId?.email) {
        throw new Error('Recipient email not found');
      }

      const emailTemplate = template.email;
      const variables = { ...notification.variables };
      
      // Replace placeholders
      const subject = this.replacePlaceholders(emailTemplate.subject, variables);
      const htmlContent = this.replacePlaceholders(emailTemplate.html, variables);
      const textContent = this.replacePlaceholders(emailTemplate.text, variables);

      const mailOptions = {
        from: {
          name: 'AyurSutra Wellness Center',
          address: process.env.GMAIL_USER
        },
        to: notification.recipientId.email,
        subject: subject,
        html: htmlContent,
        text: textContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      await notification.addAttempt('email', 'sent', result.messageId, null, result);
      console.log(`📧 Email sent successfully to ${notification.recipientId.email} (${notification.templateId})`);
      
      return { success: true, messageId: result.messageId };

    } catch (error) {
      await notification.addAttempt('email', 'failed', null, error.message, null);
      console.error(`❌ Email failed for notification ${notification._id}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Replace template placeholders
   */
  replacePlaceholders(template, variables) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  /**
   * Get unread notifications for a user (filtered to exclude vague ones)
   */
  async getUnreadNotifications(userId, limit = 20) {
    try {
      const notifications = await Notification.find({
        recipientId: userId,
        readAt: null,
        templateId: { $in: ['24h-before', '2h-before', 'on-time', 'immediate-post', 'appointment-confirmed', 'appointment-request'] }
      })
      .sort({ scheduledAt: -1 })
      .limit(limit)
      .populate('appointmentId');

      return { success: true, notifications };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel notifications for an appointment
   */
  async cancelAppointmentNotifications(appointmentId) {
    try {
      const result = await Notification.updateMany(
        { 
          appointmentId, 
          status: 'pending' 
        },
        { 
          status: 'cancelled',
          metadata: { 
            cancelledAt: new Date(),
            cancelledBy: 'TherapyNotificationService'
          }
        }
      );

      console.log(`🚫 Cancelled ${result.modifiedCount} notifications for appointment ${appointmentId}`);
      return { success: true, cancelledCount: result.modifiedCount };
    } catch (error) {
      console.error(`❌ Error cancelling notifications for appointment ${appointmentId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipientId: userId
      });

      if (!notification) {
        return { success: false, error: 'Notification not found' };
      }

      await notification.markAsRead();
      return { success: true, notification };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default TherapyNotificationService;