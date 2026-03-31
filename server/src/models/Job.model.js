import mongoose from "mongoose";

const { Schema } = mongoose;

const JobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true },
    skillsRequired: { type: [String], default: [] },
    budgetMin: { type: Number, required: true, min: 0 },
    budgetMax: { type: Number, required: true, min: 0 },
    deadline: { type: Date, required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "cancelled", "disputed"],
      default: "open",
      index: true,
    },
    category: { type: String, required: true, trim: true, maxlength: 100 },
    attachments: { type: [String], default: [] },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

JobSchema.pre("validate", function (next) {
  // Ensure consistent budget ordering.
  if (this.budgetMin != null && this.budgetMax != null) {
    if (this.budgetMin > this.budgetMax) {
      return next(
        new Error("Invalid budget: budgetMin must be <= budgetMax")
      );
    }
  }
  return next();
});

const Job = mongoose.model("Job", JobSchema);
export default Job;

