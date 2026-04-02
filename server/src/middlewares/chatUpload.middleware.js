import multer from "multer";

const MAX_CHAT_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_CHAT_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!file) return cb(null, false);

  if (!ALLOWED_CHAT_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error("Invalid chat attachment type"), false);
  }
  return cb(null, true);
}

export const uploadChatAttachment = multer({
  storage,
  limits: { fileSize: MAX_CHAT_ATTACHMENT_SIZE_BYTES },
  fileFilter,
});
