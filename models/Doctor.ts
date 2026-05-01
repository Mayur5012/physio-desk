import mongoose, { Schema, Document, Model } from "mongoose";
import { PracticeType } from "@/lib/constants";

/**
 * License/Certification interface
 */
export interface ILicense {
  name: string;                    // e.g., "DPT" (Doctor of Physical Therapy)
  issuingBody?: string;            // e.g., "American Physical Therapy Association"
  licenseNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  practiceTypes: PracticeType[];  // Which practice types this covers
}

export interface IDoctor extends Document {
  name: string;
  clinicName: string;
  email: string;
  phone: string;
  phoneCode?: string;
  passwordHash: string;
  address?: string;
  logoUrl?: string;

  // Password reset
  resetOTP?: string;
  resetOTPExpiry?: Date;
  resetToken?: string;
  lastLogin?: Date;

  // Practice specializations (can have multiple)
  specializations: PracticeType[];
  licenses: ILicense[];

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

  // Subscription fields
  trialStartedAt: Date;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'canceled';
  subscriptionExpiry: Date;
  razorpaySubscriptionId?: string;
  razorpayPlanId?: string;
  currency: string;
  region: string;

  createdAt: Date;
  updatedAt: Date;
}


const LicenseSchema = new Schema<ILicense>(
  {
    name: { type: String, required: true },
    issuingBody: { type: String },
    licenseNumber: { type: String },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    practiceTypes: [{ type: String }],
  },
  { _id: false }
);

const DoctorSchema = new Schema<IDoctor>(
  {
    name:           { type: String, required: true },
    clinicName:     { type: String, required: true },
    email:          { type: String, required: true, unique: true, lowercase: true },
    phone:          { type: String, required: true },
    phoneCode:      { type: String, default: "IN" },
    passwordHash:   { type: String, required: true },
    address:        { type: String },
    logoUrl:        { type: String },

    // Password reset
    resetOTP:       { type: String },
    resetOTPExpiry: { type: Date },
    resetToken:     { type: String },
    lastLogin:      { type: Date },

    // Specializations
    specializations: [{ type: String }],
    licenses:       [LicenseSchema],

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

    // Subscription
    trialStartedAt:       { type: Date,    default: Date.now },
    subscriptionStatus:   { type: String,  enum: ['trial', 'active', 'expired', 'canceled'], default: 'trial' },
    subscriptionExpiry:   { type: Date,    default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) }, // 3 days trial
    razorpaySubscriptionId: { type: String },
    razorpayPlanId:       { type: String },
    currency:             { type: String, default: "INR" },
    region:               { type: String, default: "IN" },
  },
  { timestamps: true }
);


const Doctor: Model<IDoctor> =
  mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", DoctorSchema);

export default Doctor;
