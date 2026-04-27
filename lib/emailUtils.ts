/**
 * Email Utilities for Password Reset OTP
 * Sends OTP via SMTP (Gmail app password)
 */

import nodemailer from "nodemailer";

/**
 * Create SMTP transporter using Gmail app password
 */
export function createEmailTransporter() {
  const email = process.env.SMTP_EMAIL || process.env.GMAIL_EMAIL;
  const appPassword = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;

  if (!email || !appPassword) {
    throw new Error("SMTP_EMAIL and SMTP_PASSWORD environment variables are required");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: appPassword, // Gmail app password, NOT your regular password
    },
  });

  return transporter;
}

/**
 * Send OTP to email
 */
export async function sendOTPEmail(
  toEmail: string,
  otp: string,
  doctorName: string
): Promise<void> {
  try {
    const transporter = createEmailTransporter();
    const senderEmail = process.env.SMTP_EMAIL || process.env.GMAIL_EMAIL;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px; }
            .otp-box { 
              background: white; 
              border: 2px solid #667eea; 
              border-radius: 8px; 
              padding: 30px; 
              text-align: center; 
              margin: 30px 0; 
            }
            .otp-code { 
              font-size: 48px; 
              font-weight: bold; 
              letter-spacing: 8px; 
              color: #667eea; 
              font-family: monospace; 
            }
            .notice { 
              background: #fef3c7; 
              border-left: 4px solid #f59e0b; 
              padding: 15px; 
              margin: 20px 0; 
              border-radius: 4px; 
            }
            .footer { 
              text-align: center; 
              color: #6b7280; 
              font-size: 12px; 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${doctorName}</strong>,</p>
              
              <p>We received a request to reset your CliDesk password. Use the OTP below to verify your identity:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="color: #6b7280; margin-top: 15px;">Valid for 5 minutes</p>
              </div>
              
              <div class="notice">
                <strong>⚠️ Security Notice:</strong> 
                <p style="margin: 8px 0 0 0;">Never share this OTP with anyone. CliDesk support will never ask for it.</p>
              </div>
              
              <p>If you didn't request a password reset, you can safely ignore this email. Your account is secure.</p>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>CliDesk Team</strong>
              </p>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>© 2026 CliDesk. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
      Password Reset Request

      Hello ${doctorName},

      Your OTP for password reset is: ${otp}
      Valid for 5 minutes.

      If you didn't request this, please ignore this email.

      CliDesk Team
    `;

    await transporter.sendMail({
      from: senderEmail,
      to: toEmail,
      subject: "🔐 CliDesk Password Reset - OTP",
      text: textContent,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw new Error("Failed to send OTP. Please try again later.");
  }
}

/**
 * Send password reset confirmation email
 */
export async function sendPasswordResetConfirmation(
  toEmail: string,
  doctorName: string
): Promise<void> {
  try {
    const transporter = createEmailTransporter();
    const senderEmail = process.env.SMTP_EMAIL || process.env.GMAIL_EMAIL;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px; }
            .success-box { 
              background: white; 
              border-left: 4px solid #10b981; 
              padding: 20px; 
              margin: 20px 0; 
              border-radius: 4px; 
            }
            .footer { 
              text-align: center; 
              color: #6b7280; 
              font-size: 12px; 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #e5e7eb; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Reset Successful</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${doctorName}</strong>,</p>
              
              <div class="success-box">
                <p style="margin: 0; color: #10b981;"><strong>Your password has been successfully reset!</strong></p>
              </div>
              
              <p>You can now log in to CliDesk using your new password.</p>
              
              <p>If you didn't make this change, please contact our support team immediately.</p>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>CliDesk Team</strong>
              </p>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>© 2026 CliDesk. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: senderEmail,
      to: toEmail,
      subject: "✅ CliDesk Password Reset Successful",
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send password reset confirmation:", error);
    // Don't throw error here as password is already reset
  }
}
