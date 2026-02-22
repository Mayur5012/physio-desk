import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  clinicName: string;
  email: string;
  phone: string;
  passwordHash: string;
  address?: string;
  logoUrl?: string;

  // Working hours
  workStartTime: string;
  workEndTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  defaultSlotMins: number;

  // Email config
  smtpEmail?: string;
  smtpPassword?: string;
  resendApiKey?: string;

  // Reminder settings
  reminderEnabled: boolean;
  reminderHoursBefore: number;
  digestEnabled: boolean;
  digestTime: string;
  noshowFollowup: boolean;
  inactiveAlertDays: number;

  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name:           { type: String, required: true },
    clinicName:     { type: String, required: true },
    email:          { type: String, required: true, unique: true, lowercase: true },
    phone:          { type: String, required: true },
    passwordHash:   { type: String, required: true },
    address:        { type: String },
    logoUrl:        { type: String },

    workStartTime:  { type: String, default: "07:00" },
    workEndTime:    { type: String, default: "21:00" },
    breakStartTime: { type: String },
    breakEndTime:   { type: String },
    defaultSlotMins:{ type: Number, default: 60 },

    smtpEmail:      { type: String },
    smtpPassword:   { type: String },
    resendApiKey:   { type: String },

    reminderEnabled:      { type: Boolean, default: true },
    reminderHoursBefore:  { type: Number,  default: 24 },
    digestEnabled:        { type: Boolean, default: true },
    digestTime:           { type: String,  default: "21:00" },
    noshowFollowup:       { type: Boolean, default: true },
    inactiveAlertDays:    { type: Number,  default: 7 },
  },
  { timestamps: true }
);

const Doctor: Model<IDoctor> =
  mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", DoctorSchema);

export default Doctor;
