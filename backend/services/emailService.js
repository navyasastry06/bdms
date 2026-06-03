const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Check if SMTP options are set in env
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Automatically force Port 465 (SSL) for Gmail on Render to bypass their Port 587 outbound restrictions
    const isGmail = process.env.SMTP_HOST && process.env.SMTP_HOST.includes('gmail');
    const port = isGmail ? 465 : parseInt(process.env.SMTP_PORT || '587');
    const isSecure = isGmail ? true : (process.env.SMTP_SECURE === 'true' || port === 465);

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
      family: 4 // Force IPv4 routing
    });
    console.log('Nodemailer SMTP Transporter configured using env variables.');
    return transporter;
  }

  // Fallback: Try to create a test Ethereal account, or fall back to log to console
  try {
    console.log('SMTP settings not fully configured in env. Attempting to create an Ethereal test account...');
    // Ethereal creation is notoriously slow and hangs in production, so we limit it
    const testAccount = await Promise.race([
      nodemailer.createTestAccount(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Ethereal timeout')), 5000))
    ]);
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });
    console.log('Nodemailer Ethereal Transporter configured successfully.');
    console.log(`Ethereal email credentials: User: ${testAccount.user}, Pass: ${testAccount.pass}`);
    return transporter;
  } catch (err) {
    console.warn('Failed to configure Ethereal email fallback, console logging will be used instead:', err.message);
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('\n==================================================');
        console.log('--- MAIL SEND SIMULATED (No transporter configured) ---');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Body (Plain Text):\n${mailOptions.text}`);
        console.log('==================================================\n');
        return { messageId: 'simulated-id-' + Date.now(), previewUrl: null };
      }
    };
    return transporter;
  }
};

const sendOTPEmail = async (email, name, otp) => {
  try {
    const activeTransporter = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || '"BDMS Team" <noreply@bdms.com>';
    
    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: 'Verify your BDMS Account - OTP Verification Code',
      text: `Hello ${name},\n\nYour 6-digit OTP verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nThank you,\nBDMS Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #e11d48; text-align: center;">BDMS OTP Verification</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for registering on the Blood Donation Management System. Please verify your account using the 6-digit OTP below:</p>
          <div style="background-color: #ffe4e6; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #e11d48; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #666;">This code is valid for <strong>10 minutes</strong>. If you did not request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">Blood Donation Management System &copy; 2026</p>
        </div>
      `
    };

    // Log code to console for quick developer verification
    console.log(`[EMAIL SEND SIMULATION] OTP for ${email}: ${otp}`);

    const info = await activeTransporter.sendMail(mailOptions);
    
    // If it's an Ethereal message, log the preview URL
    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`Ethereal Email Preview URL: ${previewUrl}`);
      }
    }
    return info;
  } catch (error) {
    console.error('Error sending OTP email:', error.message);
    // We catch the error instead of throwing it so the API request doesn't crash.
    // The user can check the Render console for the OTP code.
    return false;
  }
};

const sendPasswordResetEmail = async (email, name, resetUrl) => {
  try {
    const activeTransporter = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || '"BDMS Team" <noreply@bdms.com>';
    
    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: 'Reset your BDMS Password',
      text: `Hello ${name},\n\nYou requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nThis link is valid for 1 hour.\n\nIf you did not request this, please ignore this email.\n\nThank you,\nBDMS Team`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #e11d48; text-align: center;">BDMS Password Reset</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>We received a request to reset your password for the Blood Donation Management System. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #666; word-break: break-all;">Or copy and paste this URL into your browser:<br/>${resetUrl}</p>
          <p style="font-size: 14px; color: #666; margin-top: 10px;">This link is valid for <strong>1 hour</strong>.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">Blood Donation Management System &copy; 2026</p>
        </div>
      `
    };

    console.log(`[EMAIL SEND SIMULATION] Password Reset Link for ${email}: ${resetUrl}`);

    const info = await activeTransporter.sendMail(mailOptions);
    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`Ethereal Email Preview URL: ${previewUrl}`);
      }
    }
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    throw new Error('Failed to send password reset email. Please try again.');
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail
};
