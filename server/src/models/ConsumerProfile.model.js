import mongoose from "mongoose";

const { Schema } = mongoose;

const ConsumerProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, default: "", trim: true, maxlength: 200 },
    website: { type: String, default: "", trim: true, maxlength: 500 },
    totalJobsPosted: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

const ConsumerProfile = mongoose.model(
  "ConsumerProfile",
  ConsumerProfileSchema
);
export default ConsumerProfile;

