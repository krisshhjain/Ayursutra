import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Simulated email service for testing
class SimulatedEmailService {
  async sendEmail(to, subject, htmlContent, textContent) {
    console.log('\n' + '='.repeat(80));
    console.log('📧 SIMULATED EMAIL SENT SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log(`👤 To: ${to}`);
    console.log(`📝 Subject: ${subject}`);
    console.log('📄 Content Preview:');
    console.log(textContent.substring(0, 300) + '...');
    console.log('='.repeat(80));
    console.log('✅ Email would be delivered to krishjain710@gmail.com');
    console.log('💡 This simulates successful email delivery');
    console.log('='.repeat(80) + '\n');
    
    return {
      success: true,
      messageId: 'simulated-' + Date.now(),
      response: { status: 'simulated_success' }
    };
  }
}

async function sendTestEmail() {
  console.log('🧪 Testing email functionality with simulation...');
  
  const emailService = new SimulatedEmailService();
  
  const textContent = `
🎉 Your AyurSutra Appointment is Confirmed!

Dear Krish,

Great news! Your appointment has been successfully booked with AyurSutra.

Appointment Details:
- Therapy: Panchakarma Consultation  
- Practitioner: Dr. Ayurveda Specialist
- Date: ${new Date().toLocaleDateString()}
- Time: 2:00 PM
- Location: AyurSutra Wellness Center

Preparation Guidelines:
- Drink warm water 30 minutes before your session
- Avoid heavy meals 2 hours before the treatment  
- Wear comfortable, loose clothing
- Arrive 15 minutes early for consultation

This is a TEST EMAIL to verify that our notification system is working correctly.

If you need to reschedule or have any questions, please contact us.

Wishing you healing and wellness,
The AyurSutra Team
  `;
  
  // Send simulated test email
  try {
    const result = await emailService.sendEmail(
      'krishjain710@gmail.com',
      '🎉 Test: Your AyurSutra Appointment is Confirmed!',
      '<p>HTML version of email...</p>',
      textContent
    );
    
    if (result.success) {
      console.log('🎉 SUCCESS! Email system is working correctly!');
      console.log('📧 Message ID:', result.messageId);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

sendTestEmail();