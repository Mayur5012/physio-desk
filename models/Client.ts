import mongoose, { Schema, Document, Model } from "mongoose";

export type Gender = "MALE" | "FEMALE" | "OTHER";
export type BodySide = "LEFT" | "RIGHT" | "BOTH";
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

  // Medical
  chiefComplaint: string;
  bodyPart: string;
  bodySide: BodySide;
  medicalHistory?: string;
  diagnosis?: string;
  therapyType: TherapyType;
  clientType: ClientType;
  status: ClientStatus;

  // Package
  totalSessionsPlanned?: number;
  sessionFee: number;
  reminderEnabled: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    doctorId:        { type: Schema.Types.ObjectId, ref: "Doctor", required: true },

    name:            { type: String, required: true },
    age:             { type: Number, required: true },
    gender:          { type: String, enum: ["MALE", "FEMALE", "OTHER"], required: true },
    phone:           { type: String, required: true },
    email:           { type: String, lowercase: true },
    address:         { type: String },
    emergencyContact:{ type: String },
    photoUrl:        { type: String },
    referralSource:  { type: String },

    chiefComplaint:  { type: String, required: true },
    bodyPart:        { type: String, required: true },
    bodySide:        { type: String, enum: ["LEFT", "RIGHT", "BOTH"], default: "BOTH" },
    medicalHistory:  { type: String },
    diagnosis:       { type: String },
    therapyType:     { type: String, enum: ["PHYSIOTHERAPY", "ACUPRESSURE", "COMBINED"], required: true },
    clientType:      { type: String, enum: ["NEW", "REGULAR", "ONE_TIME"], default: "NEW" },
    status:          { type: String, enum: ["ACTIVE", "INACTIVE", "DISCHARGED"], default: "ACTIVE" },

    totalSessionsPlanned: { type: Number },
    sessionFee:           { type: Number, default: 0 },
    reminderEnabled:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index for fast doctor-based queries
ClientSchema.index({ doctorId: 1, status: 1 });
ClientSchema.index({ doctorId: 1, name: "text", phone: "text" });

const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);

export default Client;
