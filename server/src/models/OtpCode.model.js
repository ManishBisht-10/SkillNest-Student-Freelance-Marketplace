import mongoose from "mongoose";

const { Schema } = mongoose;

const OtpCodeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    purpose: {
      type: String,
      required: true,
      enum: ["verify_email", "forgot_password"],
      index: true,
    },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

OtpCodeSchema.index({ email: 1, purpose: 1, expiresAt: 1 });

const OtpCode = mongoose.model("OtpCode", OtpCodeSchema);
export default OtpCode;

