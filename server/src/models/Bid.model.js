import mongoose from "mongoose";

const { Schema } = mongoose;

const BidSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    proposalText: { type: String, required: true, trim: true, maxlength: 5000 },
    bidAmount: { type: Number, required: true, min: 0 },
    deliveryDays: { type: Number, required: true, min: 1, max: 365 },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

// A student can bid only once per job.
BidSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

const Bid = mongoose.model("Bid", BidSchema);
export default Bid;

