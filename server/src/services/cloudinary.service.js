import path from "path";
import fs from "fs/promises";
import cloudinary from "cloudinary";

import ApiError from "../utils/ApiError.js";

function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function ensureFileExtension(mimeType = "") {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  return "img";
}

async function uploadToLocal(buffer, originalname, mimeType) {
  const avatarsDir = path.join(process.cwd(), "uploads", "avatars");
  await fs.mkdir(avatarsDir, { recursive: true });

  const ext = ensureFileExtension(mimeType);
  const safeOriginal =
    originalname?.replace(/[^a-zA-Z0-9_.-]/g, "") || "avatar";
  // Strip original extension to avoid `avatar.png.png`
  const safeBase =
    safeOriginal.replace(/\.[a-zA-Z0-9]+$/, "") || "avatar";
  const filename = `${Date.now()}-${safeBase}.${ext}`;
  const filePath = path.join(avatarsDir, filename);

  await fs.writeFile(filePath, buffer);

  return `/uploads/avatars/${filename}`;
}

export async function uploadAvatar({ buffer, originalname, mimetype }) {
  if (!buffer || buffer.length === 0) {
    throw new ApiError(400, "Avatar file is empty");
  }

  // If Cloudinary env isn't set, we still allow local dev by uploading to disk.
  if (!isCloudinaryConfigured()) {
    const url = await uploadToLocal(buffer, originalname, mimetype);
    return url;
  }

  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "skillnest/avatars",
        public_id: `avatar_${Date.now()}`,
        resource_type: "image",
        // Best-effort for local dev; Cloudinary will validate actual bytes.
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}

