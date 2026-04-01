import mongoose from "mongoose";

const { Schema } = mongoose;

const MilestoneSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    dueDate: { type: Date, required: true },
    isCompleted: { type: Boolean, default: false },
  },
  { _id: true }
);

const ContractSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    consumerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    agreedAmount: { type: Number, required: true, min: 0 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    milestones: { type: [MilestoneSchema], default: [] },
    status: {
      type: String,
      enum: ["active", "completed", "disputed", "cancelled"],
      default: "active",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "held", "released", "refunded"],
      default: "pending",
      index: true,
    },
    /** Latest Razorpay order id for escrow payment (initiate). */
    razorpayOrderId: { type: String, default: "" },
    /** Set when student calls `PUT /contracts/:id/complete` (awaiting consumer approval). */
    completionSubmittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Ensure one contract per job.
ContractSchema.index({ jobId: 1 }, { unique: true });

const Contract = mongoose.model("Contract", ContractSchema);
export default Contract;

