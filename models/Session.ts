import mongoose, { Schema, Document, Model } from "mongoose";
import { BodySide } from "./Client";
import { PracticeType } from "@/lib/constants";

export type Progress = "IMPROVING" | "STABLE" | "WORSENING";

/**
 * Custom note field data - stores template field values
 */
export interface INoteFieldData {
  fieldName: string;
  value: any;
}

export interface ISession extends Document {
  doctorId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  templateId?: mongoose.Types.ObjectId;  // Reference to NoteTemplate used

  sessionNumber: number;
  
  // Generic practice type
  practiceType: PracticeType;
  
  // Legacy compatibility
  /** @deprecated Use practiceType instead */
  therapyType?: string;
  
  techniquesUsed: string[];
  
  // Body-specific (optional)
  bodyAreaTreated?: string;
  bodySide?: BodySide;
  durationMins: number;

  // Pain tracking (optional - not all practices use)
  painBefore?: number;
  painAfter?: number;

  // SOAP Notes (legacy)
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;

  // Template-based notes
  templateNotes?: INoteFieldData[];

  progress: Progress;
  privateNote?: string;

  createdAt: Date;
  updatedAt: Date;
}

const NoteFieldDataSchema = new Schema<INoteFieldData>(
  {
    fieldName: { type: String, required: true },
    value: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const SessionSchema = new Schema<ISession>(
  {
    doctorId:      { type: Schema.Types.ObjectId, ref: "Doctor",      required: true },
    clientId:      { type: Schema.Types.ObjectId, ref: "Client",      required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    templateId:    { type: Schema.Types.ObjectId, ref: "NoteTemplate" },

    sessionNumber:   { type: Number, required: true },
    
    // Generic practice type
    practiceType:    { type: String, required: true },
    
    // Legacy compatibility
    therapyType:     { type: String, enum: ["PHYSIOTHERAPY", "ACUPRESSURE", "COMBINED"] },
    
    techniquesUsed:  [{ type: String }],
    bodyAreaTreated: { type: String },
    bodySide:        { type: String, enum: ["LEFT", "RIGHT", "BOTH"], default: "BOTH" },
    durationMins:    { type: Number, default: 60 },

    painBefore: { type: Number, min: 0, max: 10 },
    painAfter:  { type: Number, min: 0, max: 10 },

    // SOAP Notes (legacy)
    subjective:  { type: String },
    objective:   { type: String },
    assessment:  { type: String },
    plan:        { type: String },

    // Template-based notes
    templateNotes: [NoteFieldDataSchema],

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
