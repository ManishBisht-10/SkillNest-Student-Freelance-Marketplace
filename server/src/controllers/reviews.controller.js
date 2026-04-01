import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Review from "../models/Review.model.js";
import Contract from "../models/Contract.model.js";
import User from "../models/User.model.js";
import StudentProfile from "../models/StudentProfile.model.js";
import ConsumerProfile from "../models/ConsumerProfile.model.js";

async function recalculateRevieweeRating(revieweeId) {
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

export const createReview = asyncHandler(async (req, res) => {
  const { contractId, rating, comment = "", role } = req.body;

  if (req.user.role !== role) {
    throw new ApiError(400, "role must match your account role");
  }

  const contract = await Contract.findById(contractId);
  if (!contract) throw new ApiError(404, "Contract not found");
  if (contract.status !== "completed") {
    throw new ApiError(400, "Reviews are only allowed after contract completion");
  }

  const uid = req.user.id;
  const isStudent = String(contract.studentId) === uid;
  const isConsumer = String(contract.consumerId) === uid;
  if (!isStudent && !isConsumer) {
    throw new ApiError(403, "You are not a party to this contract");
  }

  if (role === "student" && !isStudent) {
    throw new ApiError(403, "Only the student on this contract can submit this review");
  }
  if (role === "consumer" && !isConsumer) {
    throw new ApiError(403, "Only the consumer on this contract can submit this review");
  }

  const revieweeId =
    role === "student" ? contract.consumerId : contract.studentId;

  try {
    const review = await Review.create({
      contractId,
      reviewerId: uid,
      revieweeId,
      rating,
      comment,
      role,
    });

    await recalculateRevieweeRating(revieweeId);

    const populated = await Review.findById(review._id)
      .populate("reviewerId", "name avatar role")
      .populate("revieweeId", "name avatar role");

    return res.status(201).json(populated);
  } catch (err) {
    if (err?.code === 11000) {
      throw new ApiError(409, "You have already reviewed for this contract");
    }
    throw err;
  }
});

export const getReviewsForUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const reviews = await Review.find({ revieweeId: userId })
    .sort({ createdAt: -1 })
    .populate("reviewerId", "name avatar role")
    .populate("contractId", "jobId agreedAmount status");

  return res.status(200).json(reviews);
});
