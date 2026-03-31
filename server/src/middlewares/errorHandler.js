import ApiError from "../utils/ApiError.js";

export default function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-unused-vars
  const _unused = next;

  // Multer upload errors should become 400s.
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large" });
  }

  if (
    typeof err?.message === "string" &&
    err.message.toLowerCase().includes("invalid avatar file type")
  ) {
    return res.status(400).json({ message: "Invalid avatar file type" });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      errors: err.errors,
    });
  }

  // eslint-disable-next-line no-console
  console.error("[SkillNest] Unhandled error:", err);

  return res.status(500).json({
    message: "Internal server error",
  });
}

