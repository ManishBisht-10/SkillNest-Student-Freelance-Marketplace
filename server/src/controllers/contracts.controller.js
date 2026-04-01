import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Contract from "../models/Contract.model.js";
import Job from "../models/Job.model.js";
import Notification from "../models/Notification.model.js";
import Transaction from "../models/Transaction.model.js";
import { netAmountAfterPlatformFee } from "../services/payments.service.js";

function isParticipant(contract, userId) {
  const uid = String(userId);
  return (
    String(contract.studentId) === uid || String(contract.consumerId) === uid
  );
}

async function notifyUser(userId, message, type, link = "") {
  await Notification.create({ userId, message, type, link });
}

export const getMyContracts = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const contracts = await Contract.find({
    $or: [{ studentId: userId }, { consumerId: userId }],
  })
    .sort({ updatedAt: -1 })
    .populate("jobId", "title status category deadline")
    .populate("studentId", "name avatar")
    .populate("consumerId", "name avatar");

  return res.status(200).json(contracts);
});

export const getContractById = asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id)
    .populate("jobId")
    .populate("studentId", "name email avatar role")
    .populate("consumerId", "name email avatar role");

  if (!contract) throw new ApiError(404, "Contract not found");
  if (!isParticipant(contract, req.user.id) && req.user.role !== "admin") {
    throw new ApiError(403, "Forbidden");
  }

  return res.status(200).json(contract);
});

export const completeMilestone = asyncHandler(async (req, res) => {
  if (req.user.role !== "student") {
    throw new ApiError(403, "Only the student can complete milestones");
  }

  const contract = await Contract.findById(req.params.id);
  if (!contract) throw new ApiError(404, "Contract not found");
  if (String(contract.studentId) !== req.user.id) {
    throw new ApiError(403, "Forbidden");
  }
  if (contract.status !== "active") {
    throw new ApiError(400, "Contract is not active");
  }

  const milestone = contract.milestones.id(req.params.mId);
  if (!milestone) throw new ApiError(404, "Milestone not found");

  milestone.isCompleted = true;
  await contract.save();

  return res.status(200).json(contract);
});

export const completeContract = asyncHandler(async (req, res) => {
  if (req.user.role !== "student") {
    throw new ApiError(403, "Only the student can submit completion");
  }

  const contract = await Contract.findById(req.params.id);
  if (!contract) throw new ApiError(404, "Contract not found");
  if (String(contract.studentId) !== req.user.id) {
    throw new ApiError(403, "Forbidden");
  }
  if (contract.status !== "active") {
    throw new ApiError(400, "Contract is not active");
  }
  if (contract.completionSubmittedAt) {
    throw new ApiError(400, "Completion already submitted");
  }

  if (contract.milestones?.length > 0) {
    const allDone = contract.milestones.every((m) => m.isCompleted);
    if (!allDone) {
      throw new ApiError(400, "All milestones must be completed first");
    }
  }

  contract.completionSubmittedAt = new Date();
  await contract.save();

  await notifyUser(
    contract.consumerId,
    "The student has submitted work for your review.",
    "job",
    `/consumer/contracts/${contract._id}`
  );

  return res.status(200).json({
    message: "Completion submitted for consumer approval",
    contract,
  });
});

export const approveContract = asyncHandler(async (req, res) => {
  if (req.user.role !== "consumer") {
    throw new ApiError(403, "Only the consumer can approve completion");
  }

  const contract = await Contract.findById(req.params.id);
  if (!contract) throw new ApiError(404, "Contract not found");
  if (String(contract.consumerId) !== req.user.id) {
    throw new ApiError(403, "Forbidden");
  }
  if (contract.status !== "active") {
    throw new ApiError(400, "Contract cannot be approved in current state");
  }
  if (!contract.completionSubmittedAt) {
    throw new ApiError(400, "Student has not submitted completion yet");
  }
  if (contract.paymentStatus !== "held") {
    throw new ApiError(
      400,
      "Escrow payment must be completed before approval (consumer must pay first)"
    );
  }

  const existingRelease = await Transaction.findOne({
    contractId: contract._id,
    type: "release",
  });
  if (!existingRelease) {
    const net = netAmountAfterPlatformFee(contract.agreedAmount);
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

  await notifyUser(
    contract.studentId,
    "Your contract was approved and payment has been released.",
    "payment",
    `/student/contracts/${contract._id}`
  );

  return res.status(200).json({
    message: "Contract approved; payment released (escrow)",
    contract,
  });
});

export const disputeContract = asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id);
  if (!contract) throw new ApiError(404, "Contract not found");

  const uid = req.user.id;
  const isStudent = String(contract.studentId) === uid;
  const isConsumer = String(contract.consumerId) === uid;
  if (!isStudent && !isConsumer) {
    throw new ApiError(403, "Forbidden");
  }

  if (contract.status === "completed" || contract.status === "cancelled") {
    throw new ApiError(400, "Cannot dispute this contract");
  }
  if (contract.status === "disputed") {
    return res.status(200).json(contract);
  }

  contract.status = "disputed";
  await contract.save();

  await Job.updateOne({ _id: contract.jobId }, { $set: { status: "disputed" } });

  const otherId = isStudent ? contract.consumerId : contract.studentId;
  await notifyUser(
    otherId,
    `A dispute was raised on contract ${contract._id}.`,
    "system",
    `/contracts/${contract._id}`
  );

  return res.status(200).json({
    message: "Dispute recorded",
    contract,
  });
});
