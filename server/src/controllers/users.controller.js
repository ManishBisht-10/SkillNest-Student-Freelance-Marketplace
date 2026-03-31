import ApiError from "../utils/ApiError.js";
import User from "../models/User.model.js";
import StudentProfile from "../models/StudentProfile.model.js";
import ConsumerProfile from "../models/ConsumerProfile.model.js";
import { uploadAvatar } from "../services/cloudinary.service.js";

import { asyncHandler } from "../utils/asyncHandler.js";

function normalizeStringList(value) {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return undefined;
}

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  if (!user) throw new ApiError(404, "User not found");

  if (user.role === "student") {
    const profile = await StudentProfile.findOne({ userId: user._id });
    return res.status(200).json({
      user,
      profile: profile || null,
    });
  }

  if (user.role === "consumer") {
    const profile = await ConsumerProfile.findOne({ userId: user._id });
    return res.status(200).json({
      user,
      profile: profile || null,
    });
  }

  // admin: no profile object
  return res.status(200).json({ user, profile: null });
});

export const updateMe = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const { name } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found");

  if (name) user.name = name;
  await user.save();

  if (role === "student") {
    const update = {};
    if (req.body.bio != null) update.bio = req.body.bio;
    if (req.body.skills != null) update.skills = normalizeStringList(req.body.skills) || [];
    if (req.body.university != null) update.university = req.body.university;
    if (req.body.year != null) update.year = req.body.year;
    if (req.body.portfolioLinks != null)
      update.portfolioLinks = normalizeStringList(req.body.portfolioLinks) || [];
    if (req.body.resumeUrl != null) update.resumeUrl = req.body.resumeUrl;
    if (req.body.isAvailable != null) update.isAvailable = req.body.isAvailable;

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: user._id },
      { $set: update },
      { new: true, upsert: true }
    );

    const publicUser = user.toObject();
    delete publicUser.passwordHash;
    return res.status(200).json({ user: publicUser, profile });
  }

  if (role === "consumer") {
    const update = {};
    if (req.body.companyName != null) update.companyName = req.body.companyName;
    if (req.body.website != null) update.website = req.body.website;

    const profile = await ConsumerProfile.findOneAndUpdate(
      { userId: user._id },
      { $set: update },
      { new: true, upsert: true }
    );

    const publicUser = user.toObject();
    delete publicUser.passwordHash;
    return res.status(200).json({ user: publicUser, profile });
  }

  throw new ApiError(403, "Admins cannot update profile via this endpoint");
});

export const uploadMeAvatar = asyncHandler(async (req, res) => {
  // uploadAvatar middleware already parsed the file and validated type/size
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, "User not found");

  if (!req.file) throw new ApiError(400, "Avatar file is required");

  const url = await uploadAvatar({
    buffer: req.file.buffer,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
  });

  user.avatar = url;
  await user.save();

  return res.status(200).json({ message: "Avatar updated", avatar: user.avatar });
});

export const getStudentPublicProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const [user, profile] = await Promise.all([
    User.findById(userId).select("-passwordHash"),
    StudentProfile.findOne({ userId }),
  ]);

  if (!user || user.role !== "student") throw new ApiError(404, "Student not found");
  if (!profile) return res.status(200).json({ user, profile: null });

  return res.status(200).json({ user, profile });
});

export const getConsumerPublicProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const [user, profile] = await Promise.all([
    User.findById(userId).select("-passwordHash"),
    ConsumerProfile.findOne({ userId }),
  ]);

  if (!user || user.role !== "consumer") throw new ApiError(404, "Consumer not found");
  if (!profile) return res.status(200).json({ user, profile: null });

  return res.status(200).json({ user, profile });
});

