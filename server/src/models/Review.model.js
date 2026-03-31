import mongoose from "mongoose";

const { Schema } = mongoose;

const ReviewSchema = new Schema(
  {
    contractId: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    revieweeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", trim: true, maxlength: 2000 },
    role: { type: String, enum: ["student", "consumer"], required: true },
  },
  { timestamps: true }
);

// Prevent duplicate reviews for same contract + reviewer.
ReviewSchema.index(
  { contractId: 1, reviewerId: 1 },
  { unique: true }
);

const Review = mongoose.model("Review", ReviewSchema);
export default Review;

