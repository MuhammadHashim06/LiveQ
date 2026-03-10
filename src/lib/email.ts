import nodemailer from 'nodemailer';

// Create a reusable transporter using SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com', // e.g. smtp.gmail.com or smtp.sendgrid.net
    port: parseInt(process.env.SMTP_PORT || '587'), // usually 587 or 465
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // your SMTP username (e.g., email address)
        pass: process.env.SMTP_PASS, // your SMTP password or app password
    },
});

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * Core utility function to send emails.
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    try {
        const from = process.env.SMTP_FROM_EMAIL || '"LiveQ" <noreply@liveq.com>';

        const info = await transporter.sendMail({
            from,
            to,
            subject,
            html,
        });

        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email: ', error);
        return { success: false, error };
    }
}

// ---------------------------------------------------------------------------
// Email Templates
// ---------------------------------------------------------------------------

/**
 * Email template for when a user joins a queue or receives a queue status update.
 */
export const queueUpdateTemplate = (customerName: string, businessName: string, message: string) => `
<div style="font-family: sans-serif; max-w-xl; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
  <h2 style="color: #E53E3E; margin-bottom: 20px;">LiveQ Update</h2>
  <p style="font-size: 16px; color: #333;">Hi ${customerName},</p>
  <p style="font-size: 16px; color: #333;">You have an update regarding your queue at <strong>${businessName}</strong>:</p>
  <div style="background-color: #FFF5F5; padding: 15px; border-left: 4px solid #E53E3E; margin: 20px 0;">
    <p style="margin: 0; font-size: 16px; font-weight: bold; color: #C53030;">${message}</p>
  </div>
  <p style="font-size: 14px; color: #666; margin-top: 30px;">
    Thanks,<br>
    The LiveQ Team
  </p>
</div>
`;

/**
 * Email template for password resets.
 */
export const passwordResetTemplate = (resetLink: string) => `
<div style="font-family: sans-serif; max-w-xl; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
  <h2 style="color: #E53E3E; margin-bottom: 20px;">Reset Your Password</h2>
  <p style="font-size: 16px; color: #333;">We received a request to reset your password for your LiveQ account.</p>
  <p style="font-size: 16px; color: #333;">Click the button below to set a new password:</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${resetLink}" style="background-color: #E53E3E; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
  </div>
  <p style="font-size: 14px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
  <p style="font-size: 14px; color: #666; margin-top: 30px;">
    Thanks,<br>
    The LiveQ Team
  </p>
</div>
`;

/**
 * Email template for appointment confirmations.
 */
export const appointmentConfirmationTemplate = (customerName: string, businessName: string, serviceName: string, time: string) => `
<div style="font-family: sans-serif; max-w-xl; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
  <h2 style="color: #3182CE; margin-bottom: 20px;">Appointment Confirmed!</h2>
  <p style="font-size: 16px; color: #333;">Hi ${customerName},</p>
  <p style="font-size: 16px; color: #333;">Your appointment at <strong>${businessName}</strong> has been confirmed.</p>
  
  <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Service:</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${serviceName}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Time:</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${new Date(time).toLocaleString()}</td>
    </tr>
  </table>

  <p style="font-size: 14px; color: #666; margin-top: 30px;">
    We look forward to seeing you!<br>
    The LiveQ Team
  </p>
</div>
`;

/**
 * Email template for when a business is verified by an admin.
 */
export const businessVerificationTemplate = (ownerName: string, businessName: string) => `
<div style="font-family: sans-serif; max-w-xl; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <div style="background-color: #F0FFF4; color: #38A169; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 30px;">
      ✓
    </div>
  </div>
  <h2 style="color: #38A169; text-align: center; margin-bottom: 20px;">Your Business is Verified!</h2>
  <p style="font-size: 16px; color: #333;">Hi ${ownerName},</p>
  <p style="font-size: 16px; color: #333;">Great news! Your business profile for <strong>${businessName}</strong> has been reviewed and verified by our administrative team.</p>
  <p style="font-size: 16px; color: #333;">Your business is now <strong>live and visible</strong> to all customers on the LiveQ discovery page. You can now start accepting queues and appointments immediately.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/business" style="background-color: #E53E3E; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Go to Dashboard</a>
  </div>

  <p style="font-size: 14px; color: #666; margin-top: 30px;">
    Welcome to LiveQ!<br>
    The LiveQ Team
  </p>
</div>
`;

/**
 * Email template for when a user signs up.
 */
export const welcomeEmailTemplate = (userName: string, role: string) => `
<div style="font-family: sans-serif; max-w-xl; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
  <h2 style="color: #E53E3E; margin-bottom: 20px;">Welcome to LiveQ!</h2>
  <p style="font-size: 16px; color: #333;">Hi ${userName},</p>
  <p style="font-size: 16px; color: #333;">We're thrilled to have you on board. You've successfully registered as a ${role === 'business' ? 'Business Partner' : 'Customer'}.</p>
  
  ${role === 'business' ? `
  <p style="font-size: 16px; color: #333;">As a business, your next step is to complete your onboarding profile and submit it for verification so customers can start finding you!</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/business/onboarding" style="background-color: #E53E3E; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Complete Onboarding</a>
  </div>
  ` : `
  <p style="font-size: 16px; color: #333;">You can now discover businesses, join live queues, and book appointments directly from your dashboard.</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/customer/find" style="background-color: #E53E3E; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Find a Business</a>
  </div>
  `}

  <p style="font-size: 14px; color: #666; margin-top: 30px;">
    Cheers,<br>
    The LiveQ Team
  </p>
</div>
`;

/**
 * Email template for when an appointment status changes (e.g., approved, rejected).
 */
export const appointmentStatusUpdateTemplate = (customerName: string, businessName: string, status: string) => `
<div style="font-family: sans-serif; max-w-xl; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
  <h2 style="color: ${status === 'approved' ? '#38A169' : '#E53E3E'}; margin-bottom: 20px;">
    Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}
  </h2>
  <p style="font-size: 16px; color: #333;">Hi ${customerName},</p>
  <p style="font-size: 16px; color: #333;">Your appointment at <strong>${businessName}</strong> has been marked as <strong>${status}</strong>.</p>
  
  <p style="font-size: 14px; color: #666; margin-top: 30px;">
    Thank you,<br>
    The LiveQ Team
  </p>
</div>
`;

/**
 * Email template for when a customer successfully joins a live queue.
 */
export const queueJoinedTemplate = (customerName: string, businessName: string, position: number | string) => `
<div style="font-family: sans-serif; max-w-xl; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
  <h2 style="color: #3182CE; margin-bottom: 20px;">You're in line!</h2>
  <p style="font-size: 16px; color: #333;">Hi ${customerName},</p>
  <p style="font-size: 16px; color: #333;">You have successfully joined the live queue for <strong>${businessName}</strong>.</p>
  
  <div style="background-color: #EBF8FF; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
    <p style="font-size: 14px; color: #2B6CB0; margin: 0; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Current Position</p>
    <p style="font-size: 48px; color: #2B6CB0; font-weight: 900; margin: 10px 0;">#${position}</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/customer/queue" style="background-color: #3182CE; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">View Live Status</a>
  </div>

  <p style="font-size: 14px; color: #666; margin-top: 30px;">
    We'll notify you when it's your turn.<br>
</div>
`;

/**
 * Email template for verifying a new user's email address using a 6-digit OTP.
 */
export const verifyEmailTemplate = (userName: string, otpCode: string) => `
<div style="font-family: sans-serif; max-w-xl; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <div style="background-color: #EBF8FF; color: #3182CE; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 30px;">
      ✉️
    </div>
  </div>
  <h2 style="color: #3182CE; text-align: center; margin-bottom: 20px;">Verify Your Email</h2>
  <p style="font-size: 16px; color: #333;">Hi ${userName},</p>
  <p style="font-size: 16px; color: #333;">Welcome to LiveQ! Please enter the 6-digit verification code below to activate your account.</p>
  
  <div style="background-color: #F7FAFC; border: 1px dashed #CBD5E0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
    <p style="font-size: 14px; color: #4A5568; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Your Verification Code</p>
    <p style="font-size: 42px; color: #2B6CB0; font-weight: 900; letter-spacing: 8px; margin: 0;">${otpCode}</p>
  </div>

  <p style="font-size: 14px; color: #666;">This code will expire in 15 minutes.</p>
  <p style="font-size: 14px; color: #666; margin-top: 30px;">
    Thanks,<br>
    The LiveQ Team
  </p>
</div>
`;
