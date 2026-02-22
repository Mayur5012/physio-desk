import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRefreshToken extends Document {
  token: string;
  doctorId: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    token:     { type: String, required: true, unique: true },
    doctorId:  { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-delete expired tokens (MongoDB TTL index)
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken: Model<IRefreshToken> =
  mongoose.models.RefreshToken ||
  mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema);

export default RefreshToken;
