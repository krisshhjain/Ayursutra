import dotenv from 'dotenv';
import NotificationService from './services/NotificationService.js';

// Load environment variables
dotenv.config();

async function testNotificationService() {
  console.log('🧪 Testing NotificationService with Gmail...');
  
  const notificationService = new NotificationService();
  
  // Create a mock notification object
  const mockNotification = {
    recipientId: {
      email: 'krishjain710@gmail.com',
      firstName: 'Krish',
      lastName: 'Jain'
    },
    templateId: '24h-before',
    variables: {
      patientName: 'Krish Jain',
      practitionerName: 'Dr. Ayurveda Specialist',
      therapy: 'Panchakarma Consultation',
      date: new Date().toLocaleDateString(),
      time: '2:00 PM',
      clinicName: 'AyurSutra Wellness Center',
      appointmentLink: 'http://localhost:8080/patient-schedule',
      unsubscribeLink: 'http://localhost:8080/notifications/unsubscribe'
    },
    addAttempt: function(channel, status, messageId, error, response) {
      console.log(`📝 Attempt logged: ${channel} - ${status}`, messageId ? `(${messageId})` : '');
      return Promise.resolve();
    }
  };

  try {
    // Import template function
    const { getTemplate } = await import('./utils/notificationTemplates.js');
    const template = getTemplate('24h-before');
    
    if (!template) {
      console.error('❌ Template not found');
      return;
    }

    console.log('📧 Sending notification email...');
    const result = await notificationService.sendEmail(mockNotification, template);
    
    if (result.success) {
      console.log('🎉 SUCCESS! Notification email sent via NotificationService');
      console.log('📧 Message ID:', result.messageId);
    } else {
      console.error('❌ Failed to send notification:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNotificationService();