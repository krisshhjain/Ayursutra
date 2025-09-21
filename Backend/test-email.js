import dotenv from 'dotenv';
import NotificationService from './services/NotificationService.js';

// Load environment variables
dotenv.config();

async function testEmail() {
  console.log('🧪 Testing email functionality...');
  console.log('API Key exists:', process.env.BREVO_API_KEY ? 'Yes' : 'No');
  
  const notificationService = new NotificationService();
  
  // Test direct Brevo API call
  try {
    const result = await notificationService.brevoService.sendEmail(
      'test@example.com', // Replace with your email for testing
      'Test Email from AyurSutra',
      '<h1>Test Email</h1><p>This is a test email from the notification system.</p>',
      'Test Email - This is a test email from the notification system.'
    );
    
    console.log('📧 Email test result:', result);
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

testEmail();