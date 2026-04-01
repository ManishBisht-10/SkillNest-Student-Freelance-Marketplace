import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.model.js";
import Job from "../models/Job.model.js";
import Contract from "../models/Contract.model.js";
import Transaction from "../models/Transaction.model.js";
import Review from "../models/Review.model.js";
import { recalculateRevieweeRating } from "../utils/reviewRating.js";
import { netAmountAfterPlatformFee } from "../services/payments.service.js";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    roleBreakdown,
    totalJobs,
    revenueAgg,
    disputeContracts,
    signupsToday,
    activeContracts,
  ] = await Promise.all([
    User.countDocuments(),
    User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]),
    Job.countDocuments(),
    Transaction.aggregate([
      { $match: { type: "payment", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Contract.countDocuments({ status: "disputed" }),
    User.countDocuments({ createdAt: { $gte: startOfToday() } }),
    Contract.countDocuments({ status: "active" }),
  ]);

  const byRole = { admin: 0, student: 0, consumer: 0 };
  for (const row of roleBreakdown) {
    if (row._id && byRole[row._id] !== undefined) {
      byRole[row._id] = row.count;
    }
  }

  const totalRevenue = revenueAgg[0]?.total ?? 0;

  return res.status(200).json({
    totalUsers,
    usersByRole: byRole,
    totalJobs,
    totalRevenue,
    activeContracts,
    disputes: disputeContracts,
    newSignupsToday: signupsToday,
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { role, q } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (q) {
    filter.$or = [
      { name: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
      { email: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
    ];
  }

  const users = await User.find(filter)
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .limit(500);

  return res.status(200).json(users);
});

export const banUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { banned } = req.body;

  if (String(id) === String(req.user.id)) {
    throw new ApiError(400, "Cannot ban your own account");
  }

  const existing = await User.findById(id).select("role");
  if (!existing) throw new ApiError(404, "User not found");
  if (existing.role === "admin") {
    throw new ApiError(400, "Cannot ban an admin account");
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: { isBanned: banned } },
    { new: true, select: "-passwordHash" }
  );
  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json({
    message: banned ? "User banned" : "User unbanned",
    user,
  });
});

export const activateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  if (String(id) === String(req.user.id)) {
    throw new ApiError(400, "Cannot deactivate your own account");
  }

  const existing = await User.findById(id).select("role");
  if (!existing) throw new ApiError(404, "User not found");
  if (existing.role === "admin") {
    throw new ApiError(400, "Cannot deactivate an admin account");
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: { isActive: active } },
    { new: true, select: "-passwordHash" }
  );
  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json({
    message: active ? "User activated" : "User deactivated",
    user,
  });
});

export const listAllJobs = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const jobs = await Job.find(filter)
    .sort({ createdAt: -1 })
    .populate("postedBy", "name email role")
    .limit(500);

  return res.status(200).json(jobs);
});

export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) throw new ApiError(404, "Job not found");
  return res.status(200).json({ message: "Job removed", id: req.params.id });
});

export const listAllContracts = asyncHandler(async (req, res) => {
  const contracts = await Contract.find()
    .sort({ updatedAt: -1 })
    .populate("jobId", "title status")
    .populate("studentId", "name email")
    .populate("consumerId", "name email")
    .limit(500);

  return res.status(200).json(contracts);
});

export const listDisputes = asyncHandler(async (req, res) => {
  const contracts = await Contract.find({ status: "disputed" })
    .sort({ updatedAt: -1 })
    .populate("jobId")
    .populate("studentId", "name email")
    .populate("consumerId", "name email");

  return res.status(200).json(contracts);
});

export const resolveDispute = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body;

  const contract = await Contract.findById(id);
  if (!contract) throw new ApiError(404, "Contract not found");
  if (contract.status !== "disputed") {
    throw new ApiError(400, "Contract is not in dispute");
  }

  if (decision === "release") {
    const net = netAmountAfterPlatformFee(contract.agreedAmount);
    const existing = await Transaction.findOne({
      contractId: contract._id,
      type: "release",
    });
    if (!existing) {
      await Transaction.create({
        contractId: contract._id,
        amount: net,
        type: "release",
        paymentGatewayId: "",
        status: "completed",
      });
    }
    contract.status = "completed";
    contract.paymentStatus = "released";
    await contract.save();
    await Job.updateOne(
      { _id: contract.jobId },
      { $set: { status: "completed" } }
    );
  } else {
    await Transaction.create({
      contractId: contract._id,
      amount: contract.agreedAmount,
      type: "refund",
      paymentGatewayId: "",
      status: "completed",
    });
    contract.status = "cancelled";
    contract.paymentStatus = "refunded";
    await contract.save();
    await Job.updateOne(
      { _id: contract.jobId },
      { $set: { status: "cancelled" } }
    );
  }

  return res.status(200).json({
    message: `Dispute resolved: ${decision}`,
    contract,
  });
});

export const listTransactions = asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;

  const items = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .populate("contractId", "jobId agreedAmount status")
    .limit(500);

  return res.status(200).json(items);
});

export const listAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .sort({ createdAt: -1 })
    .populate("reviewerId", "name email role")
    .populate("revieweeId", "name email role")
    .populate("contractId")
    .limit(500);

  return res.status(200).json(reviews);
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");

  const revieweeId = review.revieweeId;
  await Review.deleteOne({ _id: review._id });

  await recalculateRevieweeRating(revieweeId);

  return res.status(200).json({ message: "Review deleted", id: req.params.id });
});
