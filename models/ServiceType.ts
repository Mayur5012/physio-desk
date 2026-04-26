import mongoose, { Schema, Document, Model } from "mongoose";
import { PracticeType } from "@/lib/constants";

/**
 * ServiceType - Defines services/procedures offered by a doctor
 * Examples:
 * - Physiotherapy: "Deep Tissue Massage", "Exercise Therapy", "Electrotherapy"
 * - Dentistry: "Root Canal", "Cleaning", "Whitening"
 * - Psychiatry: "Individual Therapy", "Group Therapy", "Medication Management"
 */
export interface IServiceType extends Document {
  doctorId: mongoose.Types.ObjectId;
  name: string;                    // e.g., "Root Canal Treatment"
  practiceType: PracticeType;
  description?: string;
  
  // Billing
  basePrice: number;               // Base fee for this service
  durationMins: number;           // Default duration
  
  // Procedures/Treatments
  procedures?: string[];          // Medical procedure codes (CPT, ICD)
  
  // Category for grouping
  category?: string;              // e.g., "Surgical", "Preventive", "Consultative"
  
  // Insurance
  requiresPreAuth?: boolean;      // Requires pre-authorization
  requiresPrescription?: boolean;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceTypeSchema = new Schema<IServiceType>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    name: { type: String, required: true },
    practiceType: { type: String, required: true },
    description: { type: String },
    basePrice: { type: Number, default: 0 },
    durationMins: { type: Number, default: 60 },
    procedures: [{ type: String }],
    category: { type: String },
    requiresPreAuth: { type: Boolean, default: false },
    requiresPrescription: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ServiceTypeSchema.index({ doctorId: 1, practiceType: 1 });
ServiceTypeSchema.index({ doctorId: 1, isActive: 1 });

const ServiceType: Model<IServiceType> =
  mongoose.models.ServiceType ||
  mongoose.model<IServiceType>("ServiceType", ServiceTypeSchema);

export default ServiceType;
