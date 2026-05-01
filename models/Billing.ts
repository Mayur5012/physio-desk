import mongoose, { Schema, Document, Model } from "mongoose";

export type PaymentMode = "CASH" | "UPI" | "CARD";
export type PaymentStatus = "PAID" | "PENDING" | "PARTIAL";

export interface IBilling extends Document {
  doctorId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;

  date: Date;
  totalFee: number;
  taxPercentage: number;
  taxAmount: number;
  amountPaid: number;
  paymentMode: PaymentMode;
  status: PaymentStatus;
  notes?: string;

  // Customization
  includeClinicBranding: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const BillingSchema = new Schema<IBilling>(
  {
    doctorId:  { type: Schema.Types.ObjectId, ref: "Doctor",  required: true },
    clientId:  { type: Schema.Types.ObjectId, ref: "Client",  required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session" },

    date:        { type: Date,   default: Date.now },
    totalFee:    { type: Number, required: true },
    taxPercentage: { type: Number, default: 0 },
    taxAmount:   { type: Number, default: 0 },
    amountPaid:  { type: Number, default: 0 },
    paymentMode: { type: String, enum: ["CASH", "UPI", "CARD"], default: "CASH" },
    status:      { type: String, enum: ["PAID", "PENDING", "PARTIAL"], default: "PENDING" },
    notes:       { type: String },
    includeClinicBranding: { type: Boolean, default: true },
  },
  { timestamps: true }
);


BillingSchema.index({ doctorId: 1, date: -1 });
BillingSchema.index({ doctorId: 1, date: -1, status: 1 });
BillingSchema.index({ doctorId: 1, status: 1 });
BillingSchema.index({ doctorId: 1, clientId: 1, date: -1 });
BillingSchema.index({ clientId: 1, status: 1 });

const Billing: Model<IBilling> =
  mongoose.models.Billing || mongoose.model<IBilling>("Billing", BillingSchema);

export default Billing;
