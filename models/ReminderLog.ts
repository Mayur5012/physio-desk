import mongoose, { Schema, Document, Model } from "mongoose";

export type ReminderType =
  | "APPOINTMENT_REMINDER"
  | "DAILY_DIGEST"
  | "NO_SHOW_FOLLOWUP"
  | "INACTIVE_ALERT";

export type ReminderStatus = "SENT" | "FAILED";

export interface IReminderLog extends Document {
  doctorId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  type: ReminderType;
  recipientEmail: string;
  status: ReminderStatus;
  errorMessage?: string;
  sentAt: Date;
}

const ReminderLogSchema = new Schema<IReminderLog>(
  {
    doctorId:       { type: Schema.Types.ObjectId, ref: "Doctor",      required: true },
    appointmentId:  { type: Schema.Types.ObjectId, ref: "Appointment" },
    type:           { type: String, enum: ["APPOINTMENT_REMINDER","DAILY_DIGEST","NO_SHOW_FOLLOWUP","INACTIVE_ALERT"], required: true },
    recipientEmail: { type: String, required: true },
    status:         { type: String, enum: ["SENT", "FAILED"], default: "SENT" },
    errorMessage:   { type: String },
    sentAt:         { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ReminderLogSchema.index({ doctorId: 1, sentAt: -1 });

const ReminderLog: Model<IReminderLog> =
  mongoose.models.ReminderLog ||
  mongoose.model<IReminderLog>("ReminderLog", ReminderLogSchema);

export default ReminderLog;
