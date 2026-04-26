import mongoose, { Schema, Document, Model } from "mongoose";
import { PracticeType } from "@/lib/constants";

export type Gender = "MALE" | "FEMALE" | "OTHER";
export type BodySide = "LEFT" | "RIGHT" | "BOTH";
/** @deprecated Use PracticeType instead */
export type TherapyType = "PHYSIOTHERAPY" | "ACUPRESSURE" | "COMBINED";
export type ClientType = "NEW" | "REGULAR" | "ONE_TIME";
export type ClientStatus = "ACTIVE" | "INACTIVE" | "DISCHARGED";

export interface IClient extends Document {
  doctorId: mongoose.Types.ObjectId;

  // Personal
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  photoUrl?: string;
  referralSource?: string;

  // Medical / Service Related
  chiefComplaint: string;

  // Body-specific (optional - not all practices track this)
  bodyPart?: string;
  bodySide?: BodySide;

  medicalHistory?: string;
  diagnosis?: string;

  // Practice types (multi-select supported)
  practiceTypes: PracticeType[];

  // Backward compatibility
  /** @deprecated Use practiceTypes instead */
  practiceType?: string;
  /** @deprecated Use practiceTypes instead */
  therapyType?: TherapyType;

  clientType: ClientType;
  status: ClientStatus;

  // Package
  totalSessionsPlanned?: number;
  sessionFee: number;
  reminderEnabled: boolean;

  // Insurance (for future use)
  insuranceProvider?: string;
  insuranceId?: string;
  insuranceActivation?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },

    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"], required: true },
    phone: { type: String, required: true },
    email: { type: String, lowercase: true },
    address: { type: String },
    emergencyContact: { type: String },
    photoUrl: { type: String },
    referralSource: { type: String },

    chiefComplaint: { type: String, required: true },
    bodyPart: { type: String },
    bodySide: { type: String, enum: ["LEFT", "RIGHT", "BOTH"], default: "BOTH" },
    medicalHistory: { type: String },
    diagnosis: { type: String },

    // Generic practice types (multi-select)
    practiceTypes: { type: [String], default: [] },

    // Backward compatibility
    practiceType: { type: String },
    therapyType: { type: String, enum: ["PHYSIOTHERAPY", "ACUPRESSURE", "COMBINED"] },

    clientType: { type: String, enum: ["NEW", "REGULAR", "ONE_TIME"], default: "NEW" },
    status: { type: String, enum: ["ACTIVE", "INACTIVE", "DISCHARGED"], default: "ACTIVE" },

    totalSessionsPlanned: { type: Number },
    sessionFee: { type: Number, default: 0 },
    reminderEnabled: { type: Boolean, default: true },

    // Insurance info
    insuranceProvider: { type: String },
    insuranceId: { type: String },
    insuranceActivation: { type: Date },
  },
  { timestamps: true }
);

// Indexes for high performance
ClientSchema.index({ doctorId: 1, status: 1 });
ClientSchema.index({ doctorId: 1, createdAt: -1 });
ClientSchema.index({ name: 1, doctorId: 1 });
ClientSchema.index({ phone: 1, doctorId: 1 });
ClientSchema.index({ doctorId: 1, name: "text", phone: "text" });

// Force schema refresh
if (mongoose.models.Client) {
  delete mongoose.models.Client;
}
const Client: Model<IClient> = mongoose.model<IClient>("Client", ClientSchema);

export default Client;