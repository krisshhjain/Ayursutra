import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

async function testGmailEmail() {
  console.log('🧪 Testing Gmail email functionality...');
  console.log('Gmail User:', process.env.GMAIL_USER ? 'Found' : 'Not found');
  console.log('Gmail App Password:', process.env.GMAIL_APP_PASSWORD ? 'Found' : 'Not found');
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ Gmail credentials not found in environment variables');
    return;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, '') // Remove spaces
    }
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">AyurSutra</h1>
        <p style="color: white; margin: 5px 0;">Holistic Healing & Wellness</p>
      </div>
      
      <div style="padding: 30px 20px;">
        <h2 style="color: #22c55e;">🎉 Test Email from AyurSutra!</h2>
        
        <p>Dear Krish,</p>
        
        <p>This is a test email to verify that our new Gmail SMTP email system is working correctly!</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #16a34a;">Email System Details</h3>
          <p><strong>Email Service:</strong> Gmail SMTP via Nodemailer</p>
          <p><strong>Sender:</strong> ayursutraforayush@gmail.com</p>
          <p><strong>Test Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Test Time:</strong> ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #065f46;">✅ What This Means</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Email notifications are now working</li>
            <li>Appointment confirmations will be sent</li>
            <li>Practitioner notifications are active</li>
            <li>All scheduled reminders will work</li>
          </ul>
        </div>
        
        <p>If you received this email, the notification system is fully operational! 🎯</p>
        
        <p>Best regards,<br>The AyurSutra Development Team</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© 2025 AyurSutra. All rights reserved.</p>
        <p>This is a test email for system verification.</p>
      </div>
    </div>
  `;

  const textContent = `
🎉 Test Email from AyurSutra!

Dear Krish,

This is a test email to verify that our new Gmail SMTP email system is working correctly!

Email System Details:
- Email Service: Gmail SMTP via Nodemailer
- Sender: ayursutraforayush@gmail.com
- Test Date: ${new Date().toLocaleDateString()}
- Test Time: ${new Date().toLocaleTimeString()}

✅ What This Means:
- Email notifications are now working
- Appointment confirmations will be sent
- Practitioner notifications are active
- All scheduled reminders will work

If you received this email, the notification system is fully operational! 🎯

Best regards,
The AyurSutra Development Team

© 2025 AyurSutra. All rights reserved.
This is a test email for system verification.
  `;

  const mailOptions = {
    from: {
      name: 'AyurSutra',
      address: process.env.GMAIL_USER
    },
    to: 'krishjain710@gmail.com',
    subject: '🎉 AyurSutra Email System Test - Gmail SMTP Working!',
    html: htmlContent,
    text: textContent
  };

  try {
    console.log('📧 Sending test email to krishjain710@gmail.com...');
    const result = await transporter.sendMail(mailOptions);
    
    console.log('🎉 SUCCESS! Email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('✅ Check krishjain710@gmail.com for the test email');
    console.log('📬 Email sent from:', process.env.GMAIL_USER);
    
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('💡 Troubleshooting tips:');
      console.log('   1. Ensure 2-step verification is enabled on Gmail');
      console.log('   2. Check that app password is correct: czkm yyfn glcy oecp');
      console.log('   3. Verify less secure app access is allowed');
    }
  }
}

testGmailEmail();