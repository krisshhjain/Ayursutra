import Notification from '../models/Notification.js';
import { getTemplate, DEFAULT_PLACEHOLDERS } from '../utils/notificationTemplates.js';
import nodemailer from 'nodemailer';

// Gmail email service using Nodemailer
class GmailEmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '') // Remove spaces from app password
      }
    });
  }

  async sendEmail(to, subject, htmlContent, textContent) {
    try {
      console.log(`📧 Gmail SMTP: Sending email to ${to} with subject: ${subject}`);
      
      const mailOptions = {
        from: {
          name: 'AyurSutra',
          address: process.env.GMAIL_USER
        },
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Gmail email sent successfully:`, result.messageId);
      return {
        success: true,
        messageId: result.messageId,
        response: result
      };
    } catch (error) {
      console.error(`❌ Gmail SMTP error:`, error.message);
      return {
        success: false,
        error: error.message,
        response: error
      };
    }
  }
}

class NotificationService {
  constructor() {
    this.emailService = new GmailEmailService();
  }

  // Create a single notification
  async createNotification(data) {
    try {
      // ensure recipientModel is set (default to Patient if not provided)
      if (!data.recipientModel) data.recipientModel = 'Patient';
      const notification = new Notification(data);
      await notification.save();
      return { success: true, notification };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Create multiple notifications for an appointment (all 5 reminder types)
  async createAppointmentNotifications(appointmentData, userPreferences = {}) {
    try {
      const {
        appointmentId,
        patientId,
        practitionerId,
        date,
        slotStartUtc,
        therapy = 'Ayurvedic Therapy',
        practitionerName = 'Dr. Practitioner',
        patientName = 'Patient'
      } = appointmentData;

      const notifications = [];
      const appointmentDateTime = new Date(slotStartUtc);
      const channels = userPreferences.channels || ['in-app', 'email'];
      
      // Variables for template substitution
      const variables = {
        patientName,
        practitionerName,
        therapy,
        date: appointmentDateTime.toLocaleDateString(),
        time: appointmentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        clinicName: 'AyurSutra Wellness Center',
        appointmentLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/patient-schedule`,
        unsubscribeLink: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/notifications/unsubscribe`
      };

      const now = new Date();
      const sessionDuration = appointmentData.duration || 60; // minutes

      // Define notification schedules with their times
      const notificationSchedules = [
        {
          templateId: '24h-before',
          scheduledAt: new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000)
        },
        {
          templateId: '2h-before',
          scheduledAt: new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000)
        },
        {
          templateId: 'on-time',
          scheduledAt: appointmentDateTime
        },
        {
          templateId: 'immediate-post',
          scheduledAt: new Date(appointmentDateTime.getTime() + (sessionDuration + 30) * 60 * 1000)
        },
        {
          templateId: '48h-post',
          scheduledAt: new Date(appointmentDateTime.getTime() + 48 * 60 * 60 * 1000)
        }
      ];

      // Only create notifications that are scheduled for future times
      notificationSchedules.forEach(schedule => {
        // Only add notification if it's scheduled for a future time (with 1 minute buffer)
        if (schedule.scheduledAt.getTime() > now.getTime() + 60 * 1000) {
          notifications.push({
            recipientId: patientId,
            recipientModel: 'Patient',
            appointmentId,
            channels,
            templateId: schedule.templateId,
            variables,
            scheduledAt: schedule.scheduledAt,
            createdBy: practitionerId
          });
        } else {
          console.log(`⏰ Skipping ${schedule.templateId} notification - scheduled time is in the past:`, schedule.scheduledAt.toLocaleString());
        }
      });

      // Save all notifications
      const savedNotifications = await Notification.insertMany(notifications);
      
      return { 
        success: true, 
        notifications: savedNotifications,
        count: savedNotifications.length 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get unread notifications for a user
  async getUnreadNotifications(userId, limit = 20) {
    try {
      const notifications = await Notification.findUnreadForUser(userId, limit);
      return { success: true, notifications };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mark notification as read
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

  // Create notification for practitioner when appointment is requested
  async createAppointmentRequestNotification(appointmentData) {
    try {
      const {
        appointmentId,
        patientId,
        practitionerId,
        date,
        slotStartUtc,
        therapy = 'Ayurvedic Therapy',
        practitionerName = 'Dr. Practitioner',
        patientName = 'Patient'
      } = appointmentData;

      const appointmentDateTime = new Date(slotStartUtc);
      
      // Variables for template substitution
      const variables = {
        patientName,
        practitionerName,
        therapy,
        date: appointmentDateTime.toLocaleDateString(),
        time: appointmentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        clinicName: 'AyurSutra Wellness Center',
        appointmentLink: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/practitioner-dashboard`,
        unsubscribeLink: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/notifications/unsubscribe`
      };

      // Create immediate notification for practitioner
      const notificationData = {
        recipientId: practitionerId,
        appointmentId,
        channels: ['in-app', 'email'],
        templateId: 'appointment-request',
        variables,
        scheduledAt: new Date(), // Send immediately
        createdBy: patientId
      };

      const result = await this.createNotification(notificationData);
      
      if (result.success) {
        console.log(`✅ Created appointment request notification for practitioner ${practitionerId}`);
        
        // Process immediately since it's scheduled for now
        const notification = await Notification.findById(result.notification._id).populate('recipientId');
        if (notification) {
          await this.processNotification(notification);
        }
      }

      return result;
    } catch (error) {
      console.error('❌ Error creating practitioner notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Find due notifications for processing
  async getDueNotifications() {
    try {
      const notifications = await Notification.findDue();
      return { success: true, notifications };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Process a notification (send via all channels)
  async processNotification(notification) {
    try {
      const template = getTemplate(notification.templateId);
      if (!template) {
        throw new Error(`Template not found: ${notification.templateId}`);
      }

      const results = [];
      
      // Mark as sending
      notification.status = 'sending';
      await notification.save();

      // Process each channel
      for (const channel of notification.channels) {
        if (channel === 'in-app') {
          // In-app notifications are "sent" when created
          const result = await notification.addAttempt('in-app', 'sent', null, null, { sentAt: new Date() });
          results.push({ channel: 'in-app', success: true, result });
        } else if (channel === 'email') {
          const emailResult = await this.sendEmail(notification, template);
          results.push({ channel: 'email', success: emailResult.success, result: emailResult });
        }
      }

      // Mark as sent and update sentAt timestamp
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();

      return { success: true, results };
    } catch (error) {
      // Mark as failed
      notification.status = 'failed';
      await notification.save();
      return { success: false, error: error.message };
    }
  }

  // Send email notification
  async sendEmail(notification, template) {
    try {
      if (!notification.recipientId.email) {
        throw new Error('Recipient email not found');
      }

      console.log(`📧 Sending email to: ${notification.recipientId.email} for template: ${notification.templateId}`);

      const emailTemplate = template.email;
      const variables = { ...DEFAULT_PLACEHOLDERS, ...notification.variables };
      
      // Replace placeholders in subject, html, and text
      const subject = this.replacePlaceholders(emailTemplate.subject, variables);
      const htmlContent = this.replacePlaceholders(emailTemplate.html, variables);
      const textContent = this.replacePlaceholders(emailTemplate.text, variables);

      console.log(`📧 Email subject: ${subject}`);

      const result = await this.emailService.sendEmail(
        notification.recipientId.email,
        subject,
        htmlContent,
        textContent
      );

      if (result.success) {
        console.log(`✅ Email sent successfully: ${result.messageId}`);
        await notification.addAttempt('email', 'sent', result.messageId, null, result.response);
        return { success: true, messageId: result.messageId };
      } else {
        console.error(`❌ Email failed to send: ${result.error}`);
        await notification.addAttempt('email', 'failed', null, result.error, result.response);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error(`❌ Email exception: ${error.message}`);
      await notification.addAttempt('email', 'failed', null, error.message, null);
      return { success: false, error: error.message };
    }
  }

  // Replace template placeholders
  replacePlaceholders(template, variables) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  // Cancel notifications for an appointment (when cancelled/rescheduled)
  async cancelAppointmentNotifications(appointmentId) {
    try {
      const result = await Notification.updateMany(
        { 
          appointmentId, 
          status: 'pending' 
        },
        { 
          status: 'cancelled',
          metadata: { cancelledAt: new Date() }
        }
      );

      return { success: true, modifiedCount: result.modifiedCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get notification statistics
  async getStats(userId = null) {
    try {
      const filter = userId ? { recipientId: userId } : {};
      
      const stats = await Notification.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const result = {
        total: 0,
        pending: 0,
        sent: 0,
        failed: 0,
        cancelled: 0
      };

      stats.forEach(stat => {
        result[stat._id] = stat.count;
        result.total += stat.count;
      });

      return { success: true, stats: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default NotificationService;