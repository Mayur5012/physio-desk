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
/**
 * Send appointment reminder email to patient
 */
export async function sendAppointmentReminderEmail({
  toEmail,
  patientName,
  doctorName,
  clinicName,
  appointmentDate,
  appointmentTime,
}: {
  toEmail: string;
  patientName: string;
  doctorName: string;
  clinicName: string;
  appointmentDate: string;
  appointmentTime: string;
}): Promise<void> {
  try {
    const transporter = createEmailTransporter();
    const senderEmail = process.env.SMTP_EMAIL || process.env.GMAIL_EMAIL;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .header { background: #111827; color: #ffffff; padding: 32px; text-align: center; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase; font-style: italic; }
            .header .brand { color: #3b82f6; }
            .content { padding: 32px; }
            .greeting { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #111827; }
            .details-box { background: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #f3f4f6; }
            .detail-item { margin-bottom: 12px; }
            .detail-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 4px; }
            .detail-value { font-size: 15px; font-weight: 700; color: #111827; }
            .footer { text-align: center; padding: 32px; color: #9ca3af; font-size: 12px; }
            .footer p { margin: 4px 0; }
            .phobolytics { font-weight: 700; color: #6b7280; margin-top: 16px !important; }
            @media (max-width: 600px) {
              .container { padding: 10px; }
              .content { padding: 24px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <h1>ClinDesk<span class="brand">.</span></h1>
              </div>
              <div class="content">
                <div class="greeting">Appointment Reminder</div>
                <p>Hello <strong>${patientName}</strong>,</p>
                <p>This is a reminder for your upcoming clinical appointment at <strong>${clinicName}</strong>.</p>
                
                <div class="details-box">
                  <div class="detail-item">
                    <div className="detail-label">Provider</div>
                    <div className="detail-value">Dr. ${doctorName}</div>
                  </div>
                  <div class="detail-item">
                    <div className="detail-label">Date</div>
                    <div className="detail-value">${appointmentDate}</div>
                  </div>
                  <div class="detail-item">
                    <div className="detail-label">Time</div>
                    <div className="detail-value">${appointmentTime}</div>
                  </div>
                </div>
                
                <p>If you need to reschedule or cancel, please contact the clinic directly.</p>
                <p>We look forward to seeing you!</p>
              </div>
              <div class="footer">
                <p>Managed by <strong>ClinDesk</strong> Health Platform</p>
                <p class="phobolytics">A Product by Phobolytics Technologies</p>
                <p>&copy; 2026 Phobolytics Technologies. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"ClinDesk" <${senderEmail}>`,
      to: toEmail,
      subject: `Appointment Reminder: ${appointmentDate} at ${appointmentTime}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Failed to send appointment reminder email:", error);
  }
}
