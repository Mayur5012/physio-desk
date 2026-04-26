import mongoose, { Schema, Document, Model } from "mongoose";

export type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending" | "failed";

export interface IUserSubscription extends Document {
  doctorId: mongoose.Types.ObjectId;
  planId: string;
  razorpaySubscriptionId: string;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  currentStart: Date;
  currentEnd: Date;
  cancelAtPeriodEnd: boolean;
  
  // Payment history for this subscription
  payments: {
    paymentId: string;
    amount: number;
    status: string;
    method: string;
    capturedAt: Date;
    rawResponse?: any;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const UserSubscriptionSchema = new Schema<IUserSubscription>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    planId: { type: String, required: true },
    razorpaySubscriptionId: { type: String, required: true, unique: true },
    status: { type: String, enum: ["active", "expired", "cancelled", "pending", "failed"], default: "pending" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    currentStart: { type: Date },
    currentEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    
    payments: [
      {
        paymentId: { type: String },
        amount: { type: Number },
        status: { type: String },
        method: { type: String },
        capturedAt: { type: Date },
        rawResponse: { type: Schema.Types.Mixed },
      },
    ],
  },
  { timestamps: true }
);

UserSubscriptionSchema.index({ doctorId: 1 });

const UserSubscription: Model<IUserSubscription> =
  mongoose.models.UserSubscription || mongoose.model<IUserSubscription>("UserSubscription", UserSubscriptionSchema);

export default UserSubscription;
