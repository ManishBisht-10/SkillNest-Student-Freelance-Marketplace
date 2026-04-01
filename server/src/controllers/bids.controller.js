import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import Bid from "../models/Bid.model.js";
import Job from "../models/Job.model.js";
import Contract from "../models/Contract.model.js";
import ChatRoom from "../models/ChatRoom.model.js";

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days));
  return d;
}

export const createBid = asyncHandler(async (req, res) => {
  if (req.user.role !== "student") {
    throw new ApiError(403, "Only students can bid on jobs");
  }

  const { jobId, proposalText, bidAmount, deliveryDays } = req.body;

  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, "Job not found");
  if (job.status !== "open") throw new ApiError(400, "Job is not open for bidding");
  if (job.postedBy.toString() === req.user.id) {
    throw new ApiError(400, "You cannot bid on your own job");
  }

  try {
    const bid = await Bid.create({
      jobId,
      studentId: req.user.id,
      proposalText,
      bidAmount,
      deliveryDays,
    });
    return res.status(201).json(bid);
  } catch (err) {
    if (err?.code === 11000) {
      throw new ApiError(409, "You have already bid on this job");
    }
    throw err;
  }
});

export const getBidsForJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, "Job not found");

  const isOwner = job.postedBy.toString() === req.user.id;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Only the job owner or admin can view bids");
  }

  const bids = await Bid.find({ jobId })
    .sort({ createdAt: -1 })
    .populate("studentId", "name avatar role");

  return res.status(200).json(bids);
});

export const getMyBids = asyncHandler(async (req, res) => {
  if (req.user.role !== "student") {
    throw new ApiError(403, "Only students have bids");
  }

  const bids = await Bid.find({ studentId: req.user.id })
    .sort({ createdAt: -1 })
    .populate("jobId");

  return res.status(200).json(bids);
});

export const acceptBid = asyncHandler(async (req, res) => {
  const bidId = req.params.id;

  const bid = await Bid.findById(bidId);
  if (!bid) throw new ApiError(404, "Bid not found");

  const job = await Job.findById(bid.jobId);
  if (!job) throw new ApiError(404, "Job not found");

  const isOwner = job.postedBy.toString() === req.user.id;
  if (!isOwner) throw new ApiError(403, "Only the job owner can accept a bid");

  if (job.status !== "open") {
    throw new ApiError(400, "Only open jobs can accept bids");
  }

  // Note: MongoDB transactions require a replica set.
  // For local development (standalone Mongo), we do best-effort atomic steps.

  // 1) Accept chosen bid (atomic)
  const updatedBid = await Bid.findOneAndUpdate(
    { _id: bid._id, status: "pending" },
    { $set: { status: "accepted" } },
    { new: true }
  );
  if (!updatedBid) throw new ApiError(400, "Bid cannot be accepted");

  // 2) Reject all other pending bids for this job
  await Bid.updateMany(
    { jobId: job._id, _id: { $ne: bid._id }, status: "pending" },
    { $set: { status: "rejected" } }
  );

  // 3) Update job (only if still open)
  const jobUpdate = await Job.findOneAndUpdate(
    { _id: job._id, status: "open" },
    { $set: { status: "in-progress", assignedTo: bid.studentId } },
    { new: true }
  );
  if (!jobUpdate) {
    throw new ApiError(400, "Job cannot be moved to in-progress");
  }

  // 4) Create or fetch contract (unique by jobId)
  const endDate = addDays(new Date(), bid.deliveryDays);
  let contract;
  try {
    contract = await Contract.create({
      jobId: job._id,
      studentId: bid.studentId,
      consumerId: job.postedBy,
      agreedAmount: bid.bidAmount,
      endDate,
      milestones: [],
      status: "active",
      paymentStatus: "pending",
    });
  } catch (err) {
    // If contract already exists due to race, return it
    if (err?.code === 11000) {
      contract = await Contract.findOne({ jobId: job._id });
    } else {
      throw err;
    }
  }

  // 5) Create or fetch chat room (unique by contractId)
  let chatRoom;
  try {
    chatRoom = await ChatRoom.create({
      contractId: contract._id,
      participants: [job.postedBy, bid.studentId],
    });
  } catch (err) {
    if (err?.code === 11000) {
      chatRoom = await ChatRoom.findOne({ contractId: contract._id });
    } else {
      throw err;
    }
  }

  return res.status(200).json({
    message: "Bid accepted",
    contract,
    chatRoom,
  });
});

export const rejectBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id);
  if (!bid) throw new ApiError(404, "Bid not found");

  const job = await Job.findById(bid.jobId);
  if (!job) throw new ApiError(404, "Job not found");

  const isOwner = job.postedBy.toString() === req.user.id;
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "Not allowed");
  }

  if (bid.status !== "pending") {
    return res.status(200).json(bid);
  }

  bid.status = "rejected";
  await bid.save();

  return res.status(200).json(bid);
});

