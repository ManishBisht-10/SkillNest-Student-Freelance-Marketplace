import Review from "../models/Review.model.js";
import User from "../models/User.model.js";
import StudentProfile from "../models/StudentProfile.model.js";
import ConsumerProfile from "../models/ConsumerProfile.model.js";

export async function recalculateRevieweeRating(revieweeId) {
  const user = await User.findById(revieweeId);
  if (!user) return;

  const agg = await Review.aggregate([
    { $match: { revieweeId: revieweeId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const avg = agg[0]?.avg ?? 0;
  const rounded = Math.round(avg * 100) / 100;

  if (user.role === "student") {
    await StudentProfile.updateOne(
      { userId: revieweeId },
      { $set: { rating: rounded }, $setOnInsert: { userId: revieweeId } },
      { upsert: true }
    );
  } else if (user.role === "consumer") {
    await ConsumerProfile.updateOne(
      { userId: revieweeId },
      { $set: { rating: rounded }, $setOnInsert: { userId: revieweeId } },
      { upsert: true }
    );
  }
}
