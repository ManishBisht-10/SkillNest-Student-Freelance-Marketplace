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
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "application/msword") return "doc";
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }
  if (mimeType === "text/plain") return "txt";
  return "img";
}

async function uploadToLocal(buffer, originalname, mimeType, folder) {
  const targetDir = path.join(process.cwd(), "uploads", folder);
  await fs.mkdir(targetDir, { recursive: true });

  const ext = ensureFileExtension(mimeType);
  const safeOriginal =
    originalname?.replace(/[^a-zA-Z0-9_.-]/g, "") || "avatar";
  // Strip original extension to avoid `avatar.png.png`
  const safeBase =
    safeOriginal.replace(/\.[a-zA-Z0-9]+$/, "") || "avatar";
  const filename = `${Date.now()}-${safeBase}.${ext}`;
  const filePath = path.join(targetDir, filename);

  await fs.writeFile(filePath, buffer);

  return `/uploads/${folder}/${filename}`;
}

export async function uploadAvatar({ buffer, originalname, mimetype }) {
  if (!buffer || buffer.length === 0) {
    throw new ApiError(400, "Avatar file is empty");
  }

  // If Cloudinary env isn't set, we still allow local dev by uploading to disk.
  if (!isCloudinaryConfigured()) {
    const url = await uploadToLocal(buffer, originalname, mimetype, "avatars");
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

export async function uploadChatAttachmentToStorage({
  buffer,
  originalname,
  mimetype,
}) {
  if (!buffer || buffer.length === 0) {
    throw new ApiError(400, "Attachment file is empty");
  }

  if (!isCloudinaryConfigured()) {
    return uploadToLocal(buffer, originalname, mimetype, "chat");
  }

  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: "skillnest/chat",
        public_id: `chat_${Date.now()}`,
        resource_type: "auto",
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}

