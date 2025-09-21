/**
 * Pluggable notification adapter for sending various types of notifications
 * Supports email, SMS, and in-app notifications
 */

// Simple in-memory notification store for development
// In production, replace with a proper database collection
const notificationStore = [];

/**
 * Send a notification to a user
 * @param {Object} options - Notification options
 * @param {string} options.toUserId - MongoDB ObjectId of recipient
 * @param {string} options.channel - 'email', 'sms', or 'in-app'
 * @param {string} options.template - Notification template name
 * @param {Object} options.data - Data to populate the template
 * @param {Object} options.metadata - Additional metadata
 * @returns {Promise<Object>} Result of notification sending
 */
export async function sendNotification({ toUserId, channel, template, data, metadata = {} }) {
  try {
    // Generate notification content based on template
    const content = generateNotificationContent(template, data);
    
    // Create notification record
    const notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      toUserId,
      channel,
      template,
      subject: content.subject,
      message: content.message,
      data,
      metadata,
      status: 'pending',
      createdAt: new Date(),
      sentAt: null,
      error: null
    };

    // Store notification (in production, save to database)
    notificationStore.push(notification);

    // Send notification based on channel
    let result;
    switch (channel) {
      case 'email':
        result = await sendEmailNotification(notification);
        break;
      case 'sms':
        result = await sendSMSNotification(notification);
        break;
      case 'in-app':
        result = await sendInAppNotification(notification);
        break;
      default:
        throw new Error(`Unsupported notification channel: ${channel}`);
    }

    // Update notification status
    notification.status = result.success ? 'sent' : 'failed';
    notification.sentAt = result.success ? new Date() : null;
    notification.error = result.error || null;

    console.log(`📧 Notification [${channel}] to ${toUserId}: ${content.subject}`);
    
    return {
      success: result.success,
      notificationId: notification.id,
      message: result.message
    };

  } catch (error) {
    console.error('Notification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate notification content based on template and data
 */
function generateNotificationContent(template, data) {
  const templates = {
    // Appointment request notifications
    'appointment-requested': {
      subject: 'New Appointment Request',
      message: `You have a new appointment request from ${data.patientName} for ${data.date} at ${data.time}. Therapy: ${data.therapy || 'Consultation'}`
    },
    'appointment-confirmed': {
      subject: 'Appointment Confirmed',
      message: `Your appointment with Dr. ${data.practitionerName} has been confirmed for ${data.date} at ${data.time}. Please arrive 10 minutes early.`
    },
    'appointment-rescheduled': {
      subject: 'Appointment Rescheduled',
      message: `Your appointment has been rescheduled to ${data.newDate} at ${data.newTime}. Previous time: ${data.oldDate} at ${data.oldTime}.`
    },
    'appointment-cancelled': {
      subject: 'Appointment Cancelled',
      message: `Your appointment for ${data.date} at ${data.time} has been cancelled. ${data.reason || ''}`
    },
    
    // Pre and post procedure notifications
    'pre-procedure-reminder': {
      subject: 'Pre-Procedure Instructions',
      message: `Your ${data.therapy} session is tomorrow at ${data.time}. Please follow these pre-procedure instructions: ${data.instructions || 'Drink warm water 30 minutes before therapy, avoid heavy meals 2 hours before session.'}`
    },
    'post-procedure-instructions': {
      subject: 'Post-Procedure Care Instructions',
      message: `Thank you for completing your ${data.therapy} session. Please follow these care instructions: ${data.instructions || 'Rest for 30 minutes, drink warm water, avoid cold foods for 2 hours.'}`
    },
    
    // Progress and feedback notifications
    'feedback-reminder': {
      subject: 'How was your therapy session?',
      message: `Please share your feedback about your recent ${data.therapy} session to help us improve your treatment plan.`
    },
    'progress-milestone': {
      subject: 'Treatment Progress Update',
      message: `Congratulations! You have completed ${data.sessionsCompleted} therapy sessions. Your progress: ${data.progressMessage}`
    }
  };

  const template_content = templates[template];
  if (!template_content) {
    return {
      subject: 'Notification',
      message: 'You have a new notification from AyurSutra.'
    };
  }

  return template_content;
}

/**
 * Send email notification
 * TODO: Integrate with SendGrid, Nodemailer, or other email service
 */
async function sendEmailNotification(notification) {
  // Placeholder for email sending logic
  // In production, integrate with email service provider
  
  console.log(`📧 EMAIL to ${notification.toUserId}:`);
  console.log(`   Subject: ${notification.subject}`);
  console.log(`   Message: ${notification.message}`);
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // TODO: Replace with actual email sending
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: userEmail,
  //   from: 'noreply@ayursutra.com',
  //   subject: notification.subject,
  //   text: notification.message,
  //   html: generateHTMLTemplate(notification)
  // });

  return {
    success: true,
    message: 'Email notification logged (not actually sent - configure email provider)'
  };
}

/**
 * Send SMS notification
 * TODO: Integrate with Twilio or other SMS service
 */
async function sendSMSNotification(notification) {
  // Placeholder for SMS sending logic
  
  console.log(`📱 SMS to ${notification.toUserId}:`);
  console.log(`   Message: ${notification.message}`);
  
  // Simulate SMS sending delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // TODO: Replace with actual SMS sending
  // Example with Twilio:
  // const twilio = require('twilio');
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   body: notification.message,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: userPhoneNumber
  // });

  return {
    success: true,
    message: 'SMS notification logged (not actually sent - configure SMS provider)'
  };
}

/**
 * Send in-app notification
 */
async function sendInAppNotification(notification) {
  // Store in-app notification for later retrieval
  console.log(`🔔 IN-APP to ${notification.toUserId}:`);
  console.log(`   Subject: ${notification.subject}`);
  console.log(`   Message: ${notification.message}`);
  
  // TODO: In production, save to notifications collection in database
  // TODO: Use WebSocket/Socket.IO for real-time delivery
  
  return {
    success: true,
    message: 'In-app notification stored'
  };
}

/**
 * Get notifications for a user (for in-app notification list)
 * @param {string} userId - User ID to get notifications for
 * @param {number} limit - Number of notifications to return
 * @returns {Array} Array of notifications
 */
export function getUserNotifications(userId, limit = 20) {
  return notificationStore
    .filter(notification => notification.toUserId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

/**
 * Mark notifications as read
 * @param {string} userId - User ID
 * @param {Array} notificationIds - Array of notification IDs to mark as read
 */
export function markNotificationsAsRead(userId, notificationIds) {
  notificationStore.forEach(notification => {
    if (notification.toUserId === userId && notificationIds.includes(notification.id)) {
      notification.metadata.readAt = new Date();
    }
  });
}

/**
 * Schedule a reminder notification
 * TODO: Integrate with a job queue like Bull/Agenda for proper scheduling
 * @param {Object} options - Reminder options
 * @param {Date} options.scheduledFor - When to send the reminder
 * @param {Object} options.notificationData - Notification data
 */
export function scheduleReminder({ scheduledFor, notificationData }) {
  const delay = scheduledFor.getTime() - Date.now();
  
  if (delay > 0) {
    setTimeout(async () => {
      await sendNotification(notificationData);
    }, delay);
    
    console.log(`⏰ Reminder scheduled for ${scheduledFor.toISOString()}`);
  } else {
    console.log(`⚠️ Cannot schedule reminder for past time: ${scheduledFor.toISOString()}`);
  }
}

export default {
  sendNotification,
  getUserNotifications,
  markNotificationsAsRead,
  scheduleReminder
};