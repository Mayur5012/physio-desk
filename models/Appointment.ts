import mongoose, { Schema, Document, Model } from "mongoose";
import { PracticeType } from "@/lib/constants";

export type AppointmentType = "NEW_CONSULTATION" | "FOLLOWUP" | "ONE_TIME";
export type AppointmentStatus =
  | "SCHEDULED" | "PRESENT" | "ABSENT"
  | "CANCELLED" | "RESCHEDULED" | "NO_SHOW";
export type RecurrencePattern = "DAILY" | "EVERY_N_DAYS" | "CUSTOM";

export interface IAppointment extends Document {
  doctorId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  serviceTypeId?: mongoose.Types.ObjectId;  // Link to ServiceType

  date: Date;
  startTime: string;     // "07:00"
  endTime: string;       // "08:00"
  durationMins: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes?: string;

  // Practice type for flexibility
  practiceType: PracticeType;

  // Recurrence
  isRecurring: boolean;
  recurrenceGroupId?: string;
  recurrencePattern?: RecurrencePattern;
  recurrenceEveryN?: number;
  recurrenceEndDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    doctorId:  { type: Schema.Types.ObjectId, ref: "Doctor",      required: true },
    clientId:  { type: Schema.Types.ObjectId, ref: "Client",      required: true },
    serviceTypeId: { type: Schema.Types.ObjectId, ref: "ServiceType" },

    date:        { type: Date,   required: true },
    startTime:   { type: String, required: true },
    endTime:     { type: String, required: true },
    durationMins:{ type: Number, default: 60 },
    type:        { type: String, enum: ["NEW_CONSULTATION", "FOLLOWUP", "ONE_TIME"], default: "FOLLOWUP" },
    status:      { type: String, enum: ["SCHEDULED","PRESENT","ABSENT","CANCELLED","RESCHEDULED","NO_SHOW"], default: "SCHEDULED" },
    notes:       { type: String },

    practiceType: { type: String, required: true },

    isRecurring:        { type: Boolean, default: false },
    recurrenceGroupId:  { type: String },
    recurrencePattern:  { type: String, enum: ["DAILY", "EVERY_N_DAYS", "CUSTOM"] },
    recurrenceEveryN:   { type: Number },
    recurrenceEndDate:  { type: Date },
  },
  { timestamps: true }
);

AppointmentSchema.index({ doctorId: 1, date: 1 });
AppointmentSchema.index({ doctorId: 1, date: -1 });
AppointmentSchema.index({ doctorId: 1, status: 1, date: 1 });
AppointmentSchema.index({ doctorId: 1, clientId: 1 });
AppointmentSchema.index({ recurrenceGroupId: 1 });

const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;
