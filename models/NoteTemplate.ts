import mongoose, { Schema, Document, Model } from "mongoose";
import { PracticeType } from "@/lib/constants";

/**
 * Defines the structure of a template field
 * (e.g., "Subjective", "Diagnosis", "DSM-5 Code", etc.)
 */
export interface ITemplateField {
  name: string;           // e.g., "Subjective", "DSM-5 Diagnosis"
  fieldType: "text" | "textarea" | "number" | "select" | "multiselect" | "date";
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[];    // For select/multiselect fields
  maxLength?: number;    // For text/textarea
}

/**
 * Note Template - Specialty-specific templates for session notes
 * Allows different practices to have their own note format
 */
export interface INoteTemplate extends Document {
  doctorId: mongoose.Types.ObjectId;
  name: string;                    // e.g., "Physical Therapy Standard", "Psychiatry Assessment"
  practiceType: PracticeType;
  description?: string;
  
  // Template fields define the structure
  fields: ITemplateField[];
  
  // Is this the default template for this practice type?
  isDefault: boolean;
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const TemplateFieldSchema = new Schema<ITemplateField>(
  {
    name: { type: String, required: true },
    fieldType: {
      type: String,
      enum: ["text", "textarea", "number", "select", "multiselect", "date"],
      required: true,
    },
    placeholder: { type: String },
    required: { type: Boolean, default: false },
    order: { type: Number, required: true },
    options: [{ type: String }],
    maxLength: { type: Number },
  },
  { _id: false }
);

const NoteTemplateSchema = new Schema<INoteTemplate>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    name: { type: String, required: true },
    practiceType: { type: String, required: true },
    description: { type: String },
    fields: [TemplateFieldSchema],
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

NoteTemplateSchema.index({ doctorId: 1, practiceType: 1 });
NoteTemplateSchema.index({ doctorId: 1, isDefault: 1 });

const NoteTemplate: Model<INoteTemplate> =
  mongoose.models.NoteTemplate ||
  mongoose.model<INoteTemplate>("NoteTemplate", NoteTemplateSchema);

export default NoteTemplate;
