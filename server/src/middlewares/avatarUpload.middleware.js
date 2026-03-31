import multer from "multer";

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!file) return cb(null, false);

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    // Reject non-image types
    return cb(new Error("Invalid avatar file type"), false);
  }
  return cb(null, true);
}

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
  fileFilter,
});

