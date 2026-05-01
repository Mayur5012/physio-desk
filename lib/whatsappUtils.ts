/*
import axios from "axios";

export async function sendWhatsAppReminder({
  phone,
  patientName,
  doctorName,
  clinicName,
  appointmentTime,
  appointmentDate,
}: {
  phone: string;
  patientName: string;
  doctorName: string;
  clinicName: string;
  appointmentTime: string;
  appointmentDate: string;
}) {
  const message = `Hello ${patientName}, this is a reminder for your appointment with Dr. ${doctorName} at ${clinicName} on ${appointmentDate} at ${appointmentTime}. See you there!`;

  console.log(`[WhatsApp Reminder] To: ${phone}, Message: ${message}`);

  // Example for Twilio (requires accountSid, authToken, fromNumber)
  / *
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);

  await client.messages.create({
     body: message,
     from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER,
     to: 'whatsapp:' + phone
   });
  * /

  // For now, return success to simulate the integration
  return { success: true, messageId: "simulated_id" };
}

export async function sendSessionFollowup({
  phone,
  patientName,
  clinicName,
}: {
  phone: string;
  patientName: string;
  clinicName: string;
}) {
  const message = `Hi ${patientName}, how are you feeling after your session at ${clinicName}? We'd love to hear your feedback!`;
  console.log(`[WhatsApp Followup] To: ${phone}, Message: ${message}`);
  return { success: true };
}
*/

