import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

// Gmail email service using Nodemailer
class GmailEmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '') // Remove spaces
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

async function sendTestEmail() {
  console.log('🧪 Testing email functionality...');
  console.log('Gmail User:', process.env.GMAIL_USER ? 'Found' : 'Not found');
  console.log('Gmail App Password:', process.env.GMAIL_APP_PASSWORD ? 'Found' : 'Not found');
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ Gmail credentials not found in environment variables');
    return;
  }
  
  const emailService = new GmailEmailService();
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">AyurSutra</h1>
        <p style="color: white; margin: 5px 0;">Holistic Healing & Wellness</p>
      </div>
      
      <div style="padding: 30px 20px;">
        <h2 style="color: #22c55e;">🎉 Your Appointment is Confirmed!</h2>
        
        <p>Dear Krish,</p>
        
        <p>Great news! Your appointment has been successfully booked with AyurSutra.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #16a34a;">Appointment Details</h3>
          <p><strong>Therapy:</strong> Panchakarma Consultation</p>
          <p><strong>Practitioner:</strong> Dr. Ayurveda Specialist</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Time:</strong> 2:00 PM</p>
          <p><strong>Location:</strong> AyurSutra Wellness Center</p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #d97706;">Preparation Guidelines</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Drink warm water 30 minutes before your session</li>
            <li>Avoid heavy meals 2 hours before the treatment</li>
            <li>Wear comfortable, loose clothing</li>
            <li>Arrive 15 minutes early for consultation</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="http://localhost:8080/patient-schedule" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View My Appointments</a>
        </div>
        
        <p>This is a <strong>test email</strong> to verify that our notification system is working correctly.</p>
        
        <p>If you need to reschedule or have any questions, please contact us.</p>
        
        <p>Wishing you healing and wellness,<br>The AyurSutra Team</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© 2025 AyurSutra. All rights reserved.</p>
        <p>This is a test email for system verification purposes.</p>
      </div>
    </div>
  `;

  const textContent = `
Dear Krish,

🎉 Your Appointment is Confirmed!

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

View My Appointments: http://localhost:8080/patient-schedule

Wishing you healing and wellness,
The AyurSutra Team

© 2025 AyurSutra. All rights reserved.
This is a test email for system verification purposes.
  `;
  
  // Send test email
  try {
    const result = await emailService.sendEmail(
      'krishjain710@gmail.com',
      '🎉 Test: Your AyurSutra Appointment is Confirmed!',
      htmlContent,
      textContent
    );
    
    if (result.success) {
      console.log('🎉 SUCCESS! Test email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('✅ Check krishjain710@gmail.com for the test email');
    } else {
      console.error('❌ Failed to send test email:', result.error);
    }
  } catch (error) {
    console.error('❌ Test email exception:', error);
  }
}

sendTestEmail();