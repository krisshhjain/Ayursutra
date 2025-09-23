// Notification templates with placeholders for personalization
// Placeholders: {{patientName}}, {{practitionerName}}, {{therapy}}, {{date}}, {{time}}, {{clinicName}}, {{appointmentLink}}

export const NOTIFICATION_TEMPLATES = {
  '24h-before': {
    id: '24h-before',
    name: '24 Hour Reminder',
    subject: 'Upcoming Therapy Session Tomorrow - {{therapy}}',
    inApp: {
      title: 'Therapy Session Tomorrow',
      message: 'Hi {{patientName}}, your {{therapy}} session with {{practitionerName}} is scheduled for tomorrow at {{time}}. Please prepare accordingly.',
      actionText: 'View Details',
      actionUrl: '/patient-schedule'
    },
    email: {
      subject: 'Reminder: {{therapy}} Session Tomorrow at {{clinicName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">AyurSutra</h1>
            <p style="color: white; margin: 5px 0;">Holistic Healing & Wellness</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #22c55e;">Therapy Session Reminder</h2>
            
            <p>Dear {{patientName}},</p>
            
            <p>This is a friendly reminder that your <strong>{{therapy}}</strong> session is scheduled for <strong>tomorrow</strong>.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #16a34a;">Session Details</h3>
              <p><strong>Therapy:</strong> {{therapy}}</p>
              <p><strong>Practitioner:</strong> {{practitionerName}}</p>
              <p><strong>Date:</strong> {{date}}</p>
              <p><strong>Time:</strong> {{time}}</p>
              <p><strong>Location:</strong> {{clinicName}}</p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #d97706;">Pre-Session Preparations</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Drink warm water 30 minutes before your session</li>
                <li>Avoid heavy meals 2 hours before the treatment</li>
                <li>Wear comfortable, loose clothing</li>
                <li>Arrive 15 minutes early for consultation</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{appointmentLink}}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Appointment Details</a>
            </div>
            
            <p>If you need to reschedule or have any questions, please contact us or use the appointment link above.</p>
            
            <p>Wishing you healing and wellness,<br>The AyurSutra Team</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>© 2025 AyurSutra. All rights reserved.</p>
            <p><a href="{{unsubscribeLink}}" style="color: #6b7280;">Unsubscribe from notifications</a></p>
          </div>
        </div>
      `,
      text: `Dear {{patientName}},

This is a reminder that your {{therapy}} session is scheduled for tomorrow.

Session Details:
- Therapy: {{therapy}}
- Practitioner: {{practitionerName}}
- Date: {{date}}
- Time: {{time}}
- Location: {{clinicName}}

Pre-Session Preparations:
- Drink warm water 30 minutes before your session
- Avoid heavy meals 2 hours before the treatment
- Wear comfortable, loose clothing
- Arrive 15 minutes early for consultation

View your appointment: {{appointmentLink}}

If you need to reschedule, please contact us or use the link above.

Best regards,
The AyurSutra Team`
    }
  },

  '2h-before': {
    id: '2h-before',
    name: '2 Hour Reminder',
    inApp: {
      title: 'Session Starting Soon',
      message: 'Hi {{patientName}}, your {{therapy}} session with {{practitionerName}} starts at {{time}}. Please begin your pre-session preparations.',
      actionText: 'View Details',
      actionUrl: '/patient-schedule'
    },
    email: {
      subject: 'Session Starts in 2 Hours - {{therapy}} at {{time}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">AyurSutra</h1>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #22c55e;">Your Session Starts Soon!</h2>
            
            <p>Dear {{patientName}},</p>
            
            <p>Your <strong>{{therapy}}</strong> session with {{practitionerName}} starts in <strong>2 hours</strong> at {{time}}.</p>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #d97706;">Immediate Preparations</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>🥛 Drink warm water now (30 minutes before)</li>
                <li>🍽️ Avoid eating for the next 2 hours</li>
                <li>👕 Change into comfortable, loose clothing</li>
                <li>🧘 Take a few minutes to relax and center yourself</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{appointmentLink}}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Session Details</a>
            </div>
            
            <p>See you soon!</p>
          </div>
        </div>
      `,
      text: `Dear {{patientName}},

Your {{therapy}} session with {{practitionerName}} starts in 2 hours at {{time}}.

Immediate Preparations:
- Drink warm water now (30 minutes before)
- Avoid eating for the next 2 hours  
- Change into comfortable, loose clothing
- Take a few minutes to relax and center yourself

View session details: {{appointmentLink}}

See you soon!
The AyurSutra Team`
    }
  },

  'on-time': {
    id: 'on-time',
    name: 'Session Starting Now',
    inApp: {
      title: 'Session Time',
      message: 'Your {{therapy}} session with {{practitionerName}} is starting now. Please proceed to the treatment room.',
      actionText: 'Check In',
      actionUrl: '/patient-schedule'
    },
    email: {
      subject: 'Your {{therapy}} Session is Starting Now',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">AyurSutra</h1>
          </div>
          
          <div style="padding: 30px 20px; text-align: center;">
            <h2 style="color: #22c55e;">Your Session is Starting!</h2>
            
            <p>Dear {{patientName}},</p>
            
            <p>Your <strong>{{therapy}}</strong> session with {{practitionerName}} is starting now.</p>
            
            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #16a34a;">Please proceed to the treatment room</h3>
              <p style="font-size: 18px; margin: 0;">Enjoy your healing session! 🌿</p>
            </div>
          </div>
        </div>
      `,
      text: `Dear {{patientName}},

Your {{therapy}} session with {{practitionerName}} is starting now.

Please proceed to the treatment room.

Enjoy your healing session!
The AyurSutra Team`
    }
  },

  'immediate-post': {
    id: 'immediate-post',
    name: 'Post-Session Care',
    inApp: {
      title: 'Session Complete',
      message: 'Your {{therapy}} session is complete. Please follow the post-session care instructions for optimal benefits.',
      actionText: 'View Care Instructions',
      actionUrl: '/patient-schedule'
    },
    email: {
      subject: 'Post-Session Care Instructions - {{therapy}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">AyurSutra</h1>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #22c55e;">Session Complete - Important Care Instructions</h2>
            
            <p>Dear {{patientName}},</p>
            
            <p>Thank you for completing your <strong>{{therapy}}</strong> session with {{practitionerName}}. To maximize the benefits of your treatment, please follow these important post-session care instructions:</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #d97706;">Immediate Post-Session Care (Next 2-4 hours)</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>💧 Drink warm water regularly to aid detoxification</li>
                <li>🛌 Rest and avoid strenuous activities</li>
                <li>🍽️ Eat light, warm foods if hungry</li>
                <li>🚿 Avoid cold showers or exposure to cold air</li>
                <li>☀️ Stay away from direct sunlight for a few hours</li>
              </ul>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #374151;">What to Expect</h4>
              <p>You may experience mild fatigue, increased urination, or slight emotional release - these are normal signs of detoxification and healing.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{appointmentLink}}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Provide Session Feedback</a>
            </div>
            
            <p>If you experience any concerning symptoms, please contact us immediately.</p>
            
            <p>Thank you for choosing AyurSutra for your healing journey.</p>
          </div>
        </div>
      `,
      text: `Dear {{patientName}},

Thank you for completing your {{therapy}} session with {{practitionerName}}.

IMPORTANT POST-SESSION CARE (Next 2-4 hours):
- Drink warm water regularly to aid detoxification
- Rest and avoid strenuous activities  
- Eat light, warm foods if hungry
- Avoid cold showers or exposure to cold air
- Stay away from direct sunlight for a few hours

What to Expect:
You may experience mild fatigue, increased urination, or slight emotional release - these are normal signs of detoxification and healing.

Provide feedback: {{appointmentLink}}

If you experience any concerning symptoms, please contact us immediately.

Thank you for choosing AyurSutra for your healing journey.`
    }
  },

  '48h-post': {
    id: '48h-post',
    name: '48 Hour Follow-up',
    inApp: {
      title: 'How are you feeling?',
      message: 'It\'s been 48 hours since your {{therapy}} session. How are you feeling? Please share your experience to help us improve your care.',
      actionText: 'Provide Feedback',
      actionUrl: '/feedback'
    },
    email: {
      subject: 'How are you feeling? - Follow-up on your {{therapy}} session',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">AyurSutra</h1>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #22c55e;">How are you feeling?</h2>
            
            <p>Dear {{patientName}},</p>
            
            <p>It's been 48 hours since your <strong>{{therapy}}</strong> session with {{practitionerName}}. We hope you're feeling the positive effects of the treatment!</p>
            
            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #16a34a;">We'd love to hear from you</h4>
              <p>Your feedback helps us ensure you receive the best possible care and allows us to tailor future treatments to your needs.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{appointmentLink}}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Share Your Experience</a>
            </div>
            
            <p>Questions we'd love your feedback on:</p>
            <ul style="padding-left: 20px;">
              <li>How do you feel compared to before the session?</li>
              <li>Have you noticed any improvements in your symptoms?</li>
              <li>Were there any side effects or concerns?</li>
              <li>How was your overall experience?</li>
            </ul>
            
            <p>Thank you for being part of your healing journey with us.</p>
            
            <p>With gratitude,<br>The AyurSutra Team</p>
          </div>
        </div>
      `,
      text: `Dear {{patientName}},

It's been 48 hours since your {{therapy}} session with {{practitionerName}}. We hope you're feeling the positive effects!

We'd love to hear from you. Your feedback helps us ensure you receive the best possible care.

Share your experience: {{appointmentLink}}

Questions we'd love your feedback on:
- How do you feel compared to before the session?
- Have you noticed any improvements in your symptoms?  
- Were there any side effects or concerns?
- How was your overall experience?

Thank you for being part of your healing journey with us.

With gratitude,
The AyurSutra Team`
    }
  },

  'appointment-request': {
    id: 'appointment-request',
    name: 'New Appointment Request',
    subject: 'New Appointment Request - {{therapy}}',
    inApp: {
      title: 'New Appointment Request',
      message: 'Hi {{practitionerName}}, {{patientName}} has requested a {{therapy}} session on {{date}} at {{time}}. Please review and approve.',
      actionText: 'Review Request',
      actionUrl: '/practitioner-dashboard'
    },
    email: {
      subject: 'New Appointment Request - {{therapy}} Session',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">AyurSutra</h1>
            <p style="color: white; margin: 5px 0;">Holistic Healing & Wellness</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #22c55e;">New Appointment Request</h2>
            
            <p>Dear {{practitionerName}},</p>
            
            <p>You have received a new appointment request that requires your review and approval.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #16a34a;">Request Details</h3>
              <p><strong>Patient:</strong> {{patientName}}</p>
              <p><strong>Therapy:</strong> {{therapy}}</p>
              <p><strong>Requested Date:</strong> {{date}}</p>
              <p><strong>Requested Time:</strong> {{time}}</p>
              <p><strong>Location:</strong> {{clinicName}}</p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #d97706;">Action Required</h4>
              <p>Please log in to your practitioner dashboard to review this request and either approve or decline the appointment.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{appointmentLink}}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Review Request</a>
            </div>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <p>Best regards,<br>The AyurSutra Team</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>© 2025 AyurSutra. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `
Dear {{practitionerName}},

You have received a new appointment request that requires your review and approval.

Request Details:
- Patient: {{patientName}}
- Therapy: {{therapy}}
- Requested Date: {{date}}
- Requested Time: {{time}}
- Location: {{clinicName}}

Action Required:
Please log in to your practitioner dashboard to review this request and either approve or decline the appointment.

Review Request: {{appointmentLink}}

If you have any questions or need assistance, please contact our support team.

Best regards,
The AyurSutra Team
      `
    }
  },

  'appointment-confirmed': {
    id: 'appointment-confirmed',
    name: 'Appointment Confirmed',
    subject: 'Appointment Confirmed - {{therapy}}',
    inApp: {
      title: 'Appointment Confirmed!',
      message: 'Great news! Your {{therapy}} appointment with {{practitionerName}} on {{date}} at {{time}} has been confirmed.',
      actionText: 'View Details',
      actionUrl: '/patient-schedule'
    },
    email: {
      subject: '✅ Appointment Confirmed - {{therapy}} Session',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">AyurSutra</h1>
            <p style="color: white; margin: 5px 0;">Holistic Healing & Wellness</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #4CAF50;">🎉 Your Appointment is Confirmed!</h2>
            
            <p>Dear {{patientName}},</p>
            
            <p>Great news! Your appointment has been confirmed by {{practitionerName}}.</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #16a34a;">📅 Appointment Details</h3>
              <p><strong>Therapy:</strong> {{therapy}}</p>
              <p><strong>Practitioner:</strong> {{practitionerName}}</p>
              <p><strong>Date:</strong> {{date}}</p>
              <p><strong>Time:</strong> {{time}}</p>
              <p><strong>Location:</strong> {{clinicName}}</p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #d97706;">🧘 Prepare for Your Session</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Drink warm water 30 minutes before your session</li>
                <li>Avoid heavy meals 2 hours before the treatment</li>
                <li>Wear comfortable, loose clothing</li>
                <li>Arrive 15 minutes early for consultation</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{appointmentLink}}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Appointment Details</a>
            </div>
            
            <p>You'll receive reminder notifications as your appointment approaches. If you need to reschedule or have any questions, please contact us or use the appointment link above.</p>
            
            <p>We look forward to supporting your healing journey!</p>
            
            <p>With gratitude,<br>The AyurSutra Team</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>© 2025 AyurSutra. All rights reserved.</p>
            <p><a href="{{unsubscribeLink}}" style="color: #6b7280;">Unsubscribe from notifications</a></p>
          </div>
        </div>
      `,
      text: `Dear {{patientName}},

🎉 Great news! Your appointment has been confirmed by {{practitionerName}}.

📅 Appointment Details:
- Therapy: {{therapy}}
- Practitioner: {{practitionerName}}
- Date: {{date}}
- Time: {{time}}
- Location: {{clinicName}}

🧘 Prepare for Your Session:
- Drink warm water 30 minutes before your session
- Avoid heavy meals 2 hours before the treatment
- Wear comfortable, loose clothing
- Arrive 15 minutes early for consultation

View your appointment: {{appointmentLink}}

You'll receive reminder notifications as your appointment approaches. If you need to reschedule or have any questions, please contact us or use the link above.

We look forward to supporting your healing journey!

With gratitude,
The AyurSutra Team`
    }
  },

  'appointment-completed': {
    id: 'appointment-completed',
    name: 'Appointment Completed',
    subject: 'Session Complete - Share Your Experience',
    inApp: {
      title: 'Session Complete! 🌟',
      message: 'Your {{therapy}} session with {{practitionerName}} is complete. How was your experience? Please share your feedback and rating.',
      actionText: 'Rate & Review',
      actionUrl: '/patient-schedule'
    },
    email: {
      subject: '🌟 Session Complete - Share Your Experience with {{practitionerName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">AyurSutra</h1>
            <p style="color: white; margin: 5px 0;">Holistic Healing & Wellness</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #22c55e;">🌟 Your Session is Complete!</h2>
            
            <p>Dear {{patientName}},</p>
            
            <p>We hope you had a wonderful healing experience with {{practitionerName}} during your {{therapy}} session today.</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #16a34a;">📅 Session Summary</h3>
              <p><strong>Therapy:</strong> {{therapy}}</p>
              <p><strong>Practitioner:</strong> {{practitionerName}}</p>
              <p><strong>Date:</strong> {{date}}</p>
              <p><strong>Time:</strong> {{time}}</p>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #d97706;">🌟 Share Your Experience</h4>
              <p>Your feedback is incredibly valuable to us and helps other patients choose the right care. Please take a moment to:</p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Rate your overall experience (1-5 stars)</li>
                <li>Share what you liked about the session</li>
                <li>Tell us how you're feeling now</li>
                <li>Suggest any improvements</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{appointmentLink}}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Rate & Review Your Session</a>
            </div>
            
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #16a34a;">🌿 Continue Your Healing Journey</h4>
              <p>Remember to follow any post-session care instructions and stay hydrated. If you have any concerns or questions, don't hesitate to reach out.</p>
            </div>
            
            <p>Thank you for choosing AyurSutra for your wellness journey!</p>
            
            <p>With gratitude,<br>The AyurSutra Team</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>© 2025 AyurSutra. All rights reserved.</p>
            <p><a href="{{unsubscribeLink}}" style="color: #6b7280;">Unsubscribe from notifications</a></p>
          </div>
        </div>
      `,
      text: `Dear {{patientName}},

🌟 Your session is complete!

We hope you had a wonderful healing experience with {{practitionerName}} during your {{therapy}} session today.

📅 Session Summary:
- Therapy: {{therapy}}
- Practitioner: {{practitionerName}}
- Date: {{date}}
- Time: {{time}}

🌟 Share Your Experience:
Your feedback is incredibly valuable to us and helps other patients choose the right care. Please take a moment to:
- Rate your overall experience (1-5 stars)
- Share what you liked about the session
- Tell us how you're feeling now
- Suggest any improvements

Rate & Review: {{appointmentLink}}

🌿 Continue Your Healing Journey:
Remember to follow any post-session care instructions and stay hydrated. If you have any concerns or questions, don't hesitate to reach out.

Thank you for choosing AyurSutra for your wellness journey!

With gratitude,
The AyurSutra Team`
    }
  },

  'appointment-cancelled': {
    id: 'appointment-cancelled',
    name: 'Appointment Cancellation Notice',
    subject: 'Appointment Cancelled - {{therapy}}',
    inApp: {
      title: 'Appointment Cancelled',
      message: 'Your {{therapy}} session with {{practitionerName}} on {{date}} at {{time}} has been cancelled. {{reason}}',
      actionText: 'Reschedule',
      actionUrl: '/patient-schedule'
    },
    email: {
      subject: 'Important: Your {{therapy}} Appointment Has Been Cancelled',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">AyurSutra</h1>
            <p style="color: white; margin: 5px 0;">Holistic Healing & Wellness</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #ef4444;">Appointment Cancellation Notice</h2>
            
            <p>Dear {{patientName}},</p>
            
            <p>We regret to inform you that your upcoming appointment has been cancelled.</p>
            
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #ef4444;">📅 Cancelled Appointment Details</h4>
              <p><strong>Therapy:</strong> {{therapy}}</p>
              <p><strong>Practitioner:</strong> {{practitionerName}}</p>
              <p><strong>Original Date:</strong> {{date}}</p>
              <p><strong>Original Time:</strong> {{time}}</p>
              <p><strong>Reason:</strong> {{reason}}</p>
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #0369a1;">🔄 What's Next?</h4>
              <p>We sincerely apologize for any inconvenience this may cause. We'd be happy to help you reschedule your appointment:</p>
              <ul>
                <li>Visit your patient dashboard to book a new appointment</li>
                <li>Call us directly at our clinic</li>
                <li>Reply to this email with your preferred times</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{appointmentLink}}" style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Schedule New Appointment</a>
            </div>
            
            <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #16a34a;">💚 We're Here for You</h4>
              <p>Your health and wellness journey is important to us. If you have any questions or concerns, please don't hesitate to contact our support team.</p>
            </div>
            
            <p>Thank you for your understanding and continued trust in AyurSutra.</p>
            
            <p>With care,<br>The AyurSutra Team</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>© 2025 AyurSutra. All rights reserved.</p>
            <p><a href="{{unsubscribeLink}}" style="color: #6b7280;">Unsubscribe from notifications</a></p>
          </div>
        </div>
      `,
      text: `Dear {{patientName}},

❌ Appointment Cancelled

We regret to inform you that your upcoming appointment has been cancelled.

📅 Cancelled Appointment Details:
- Therapy: {{therapy}}
- Practitioner: {{practitionerName}}
- Original Date: {{date}}
- Original Time: {{time}}
- Reason: {{reason}}

🔄 What's Next?
We sincerely apologize for any inconvenience this may cause. We'd be happy to help you reschedule your appointment:

• Visit your patient dashboard to book a new appointment
• Call us directly at our clinic
• Reply to this email with your preferred times

Schedule New Appointment: {{appointmentLink}}

💚 We're Here for You
Your health and wellness journey is important to us. If you have any questions or concerns, please don't hesitate to contact our support team.

Thank you for your understanding and continued trust in AyurSutra.

With care,
The AyurSutra Team`
    }
  },

  'appointment-rescheduled': {
    id: 'appointment-rescheduled',
    name: 'Appointment Rescheduled Notice',
    subject: 'Appointment Rescheduled - {{therapy}}',
    inApp: {
      title: 'Appointment Rescheduled',
      message: 'Your {{therapy}} session with {{practitionerName}} has been rescheduled from {{oldDate}} at {{oldTime}} to {{newDate}} at {{newTime}}. {{reason}}',
      actionText: 'View Updated Details',
      actionUrl: '/patient-schedule'
    },
    email: {
      subject: 'Important: Your {{therapy}} Appointment Has Been Rescheduled',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">AyurSutra</h1>
            <p style="color: white; margin: 5px 0;">Holistic Healing & Wellness</p>
          </div>
          
          <div style="padding: 30px 20px;">
            <h2 style="color: #f59e0b;">🔄 Appointment Rescheduled</h2>
            
            <p>Dear {{patientName}},</p>
            
            <p>We wanted to inform you that your upcoming appointment has been rescheduled by {{practitionerName}}.</p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #d97706;">📅 Schedule Change Details</h4>
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <div style="flex: 1; margin-right: 20px;">
                  <h5 style="color: #991b1b; margin-bottom: 10px;">❌ Previous Schedule</h5>
                  <p><strong>Date:</strong> {{oldDate}}</p>
                  <p><strong>Time:</strong> {{oldTime}}</p>
                </div>
                <div style="flex: 1;">
                  <h5 style="color: #16a34a; margin-bottom: 10px;">✅ New Schedule</h5>
                  <p><strong>Date:</strong> {{newDate}}</p>
                  <p><strong>Time:</strong> {{newTime}}</p>
                </div>
              </div>
              <p><strong>Therapy:</strong> {{therapy}}</p>
              <p><strong>Practitioner:</strong> {{practitionerName}}</p>
              <p><strong>Reason for Change:</strong> {{reason}}</p>
            </div>
            
            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #16a34a;">✅ Your Appointment is Confirmed</h4>
              <p>Your rescheduled appointment is automatically confirmed. You'll receive reminder notifications as your new appointment time approaches.</p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #d97706;">🧘 Prepare for Your Session</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Drink warm water 30 minutes before your session</li>
                <li>Avoid heavy meals 2 hours before the treatment</li>
                <li>Wear comfortable, loose clothing</li>
                <li>Arrive 15 minutes early for consultation</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{appointmentLink}}" style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Updated Appointment</a>
            </div>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #0369a1;">❓ Need to Make Changes?</h4>
              <p>If the new time doesn't work for you, please contact us as soon as possible to discuss alternative options.</p>
            </div>
            
            <p>We apologize for any inconvenience this change may cause and appreciate your understanding.</p>
            
            <p>Thank you for your continued trust in AyurSutra.</p>
            
            <p>With care,<br>The AyurSutra Team</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>© 2025 AyurSutra. All rights reserved.</p>
            <p><a href="{{unsubscribeLink}}" style="color: #6b7280;">Unsubscribe from notifications</a></p>
          </div>
        </div>
      `,
      text: `Dear {{patientName}},

🔄 Appointment Rescheduled

We wanted to inform you that your upcoming appointment has been rescheduled by {{practitionerName}}.

📅 Schedule Change Details:

❌ Previous Schedule:
- Date: {{oldDate}}
- Time: {{oldTime}}

✅ New Schedule:
- Date: {{newDate}}
- Time: {{newTime}}

- Therapy: {{therapy}}
- Practitioner: {{practitionerName}}
- Reason for Change: {{reason}}

✅ Your Appointment is Confirmed
Your rescheduled appointment is automatically confirmed. You'll receive reminder notifications as your new appointment time approaches.

🧘 Prepare for Your Session:
- Drink warm water 30 minutes before your session
- Avoid heavy meals 2 hours before the treatment
- Wear comfortable, loose clothing
- Arrive 15 minutes early for consultation

View Updated Appointment: {{appointmentLink}}

❓ Need to Make Changes?
If the new time doesn't work for you, please contact us as soon as possible to discuss alternative options.

We apologize for any inconvenience this change may cause and appreciate your understanding.

Thank you for your continued trust in AyurSutra.

With care,
The AyurSutra Team`
    }
  }
};

// Helper function to get template by ID
export const getTemplate = (templateId) => {
  return NOTIFICATION_TEMPLATES[templateId] || null;
};

// Helper function to get all template IDs
export const getTemplateIds = () => {
  return Object.keys(NOTIFICATION_TEMPLATES);
};

// Default placeholder values for testing
export const DEFAULT_PLACEHOLDERS = {
  patientName: 'Patient',
  practitionerName: 'Dr. Practitioner',
  therapy: 'Ayurvedic Therapy',
  date: 'Today',
  time: '2:00 PM',
  clinicName: 'AyurSutra Wellness Center',
  appointmentLink: 'https://ayursutra.com/appointments',
  unsubscribeLink: 'https://ayursutra.com/unsubscribe'
};