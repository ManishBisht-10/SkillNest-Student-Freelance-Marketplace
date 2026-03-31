import ApiError from "../utils/ApiError.js";

export default function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-unused-vars
  const _unused = next;

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

