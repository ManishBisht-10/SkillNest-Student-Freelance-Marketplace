import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Job from "../models/Job.model.js";

function normalizeSkills(value) {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
}

export const createJob = asyncHandler(async (req, res) => {
  if (req.user.role !== "consumer") {
    throw new ApiError(403, "Only consumers can post jobs");
  }

  const {
    title,
    description,
    category,
    skillsRequired,
    budgetMin,
    budgetMax,
    deadline,
    attachments = [],
  } = req.body;

  const normalizedSkills = normalizeSkills(skillsRequired) || [];

  const job = await Job.create({
    title,
    description,
    category,
    skillsRequired: normalizedSkills,
    budgetMin,
    budgetMax,
    deadline,
    attachments,
    postedBy: req.user.id,
  });

  return res.status(201).json(job);
});

export const listJobs = asyncHandler(async (req, res) => {
  const {
    category,
    status,
    minBudget,
    maxBudget,
    skills,
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  if (category) query.category = category;
  if (status) query.status = status;

  if (minBudget || maxBudget) {
    query.budgetMin = {};
    if (minBudget) query.budgetMin.$gte = Number(minBudget);
    if (maxBudget) query.budgetMin.$lte = Number(maxBudget);
  }

  const skillsList = normalizeSkills(skills);
  if (skillsList && skillsList.length > 0) {
    query.skillsRequired = { $all: skillsList };
  }

  const numericPage = Number(page) || 1;
  const numericLimit = Number(limit) || 10;

  const [items, total] = await Promise.all([
    Job.find(query)
      .sort({ createdAt: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit)
      .populate("postedBy", "name role"),
    Job.countDocuments(query),
  ]);

  return res.status(200).json({
    page: numericPage,
    limit: numericLimit,
    total,
    items,
  });
});

export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate("postedBy", "name role");
  if (!job) throw new ApiError(404, "Job not found");
  return res.status(200).json(job);
});

export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, "Job not found");

  if (job.postedBy.toString() !== req.user.id) {
    throw new ApiError(403, "You are not the owner of this job");
  }

  if (job.status !== "open") {
    throw new ApiError(400, "Only open jobs can be updated");
  }

  const {
    title,
    description,
    category,
    skillsRequired,
    budgetMin,
    budgetMax,
    deadline,
    attachments,
  } = req.body;

  if (title != null) job.title = title;
  if (description != null) job.description = description;
  if (category != null) job.category = category;
  if (skillsRequired != null) job.skillsRequired = normalizeSkills(skillsRequired) || [];
  if (budgetMin != null) job.budgetMin = budgetMin;
  if (budgetMax != null) job.budgetMax = budgetMax;
  if (deadline != null) job.deadline = deadline;
  if (attachments != null) job.attachments = attachments;

  await job.save();

  return res.status(200).json(job);
});

export const cancelJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, "Job not found");

  if (job.postedBy.toString() !== req.user.id) {
    throw new ApiError(403, "You are not the owner of this job");
  }

  if (job.status === "cancelled") {
    return res.status(200).json(job);
  }

  job.status = "cancelled";
  await job.save();

  return res.status(200).json(job);
});

export const getMyPostedJobs = asyncHandler(async (req, res) => {
  if (req.user.role !== "consumer") {
    throw new ApiError(403, "Only consumers have posted jobs");
  }

  const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
  return res.status(200).json(jobs);
});

export const getMyAssignedJobs = asyncHandler(async (req, res) => {
  if (req.user.role !== "student") {
    throw new ApiError(403, "Only students have assigned jobs");
  }

  const jobs = await Job.find({ assignedTo: req.user.id }).sort({ createdAt: -1 });
  return res.status(200).json(jobs);
});

