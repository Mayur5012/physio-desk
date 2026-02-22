import mongoose, { Schema, Document, Model } from "mongoose";
import { TherapyType, BodySide } from "./Client";

export type Progress = "IMPROVING" | "STABLE" | "WORSENING";

export interface ISession extends Document {
  doctorId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;

  sessionNumber: number;
  therapyType: TherapyType;
  techniquesUsed: string[];
  bodyAreaTreated: string;
  bodySide: BodySide;
  durationMins: number;

  painBefore?: number;
  painAfter?: number;

  // SOAP
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;

  progress: Progress;
  privateNote?: string;

  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    doctorId:      { type: Schema.Types.ObjectId, ref: "Doctor",      required: true },
    clientId:      { type: Schema.Types.ObjectId, ref: "Client",      required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },

    sessionNumber:   { type: Number, required: true },
    therapyType:     { type: String, enum: ["PHYSIOTHERAPY", "ACUPRESSURE", "COMBINED"] },
    techniquesUsed:  [{ type: String }],
    bodyAreaTreated: { type: String },
    bodySide:        { type: String, enum: ["LEFT", "RIGHT", "BOTH"], default: "BOTH" },
    durationMins:    { type: Number, default: 60 },

    painBefore: { type: Number, min: 0, max: 10 },
    painAfter:  { type: Number, min: 0, max: 10 },

    subjective:  { type: String },
    objective:   { type: String },
    assessment:  { type: String },
    plan:        { type: String },

    progress:    { type: String, enum: ["IMPROVING", "STABLE", "WORSENING"], default: "STABLE" },
    privateNote: { type: String },
  },
  { timestamps: true }
);

SessionSchema.index({ doctorId: 1, clientId: 1 });
SessionSchema.index({ clientId: 1, createdAt: -1 });

const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema);

export default Session;
