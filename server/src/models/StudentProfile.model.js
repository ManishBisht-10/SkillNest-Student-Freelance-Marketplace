import mongoose from "mongoose";

const { Schema } = mongoose;

const StudentProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bio: { type: String, default: "", trim: true, maxlength: 2000 },
    skills: { type: [String], default: [] },
    university: { type: String, default: "", trim: true, maxlength: 200 },
    year: { type: String, default: "", trim: true, maxlength: 20 },
    portfolioLinks: { type: [String], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    completedJobs: { type: Number, default: 0, min: 0 },
    resumeUrl: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const StudentProfile = mongoose.model("StudentProfile", StudentProfileSchema);
export default StudentProfile;

