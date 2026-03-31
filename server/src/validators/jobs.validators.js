import { body, param, query } from "express-validator";

export const createJobValidator = [
  body("title").isString().trim().isLength({ min: 4, max: 200 }),
  body("description").isString().trim().isLength({ min: 10 }),
  body("category").isString().trim().isLength({ min: 2, max: 100 }),
  body("skillsRequired")
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) return true;
      if (typeof value === "string") return true;
      throw new Error("skillsRequired must be an array or comma-separated string");
    }),
  body("budgetMin").isNumeric().toFloat(),
  body("budgetMax").isNumeric().toFloat(),
  body("deadline").isISO8601().toDate(),
  body("attachments").optional().isArray(),
];

export const updateJobValidator = [
  param("id").isMongoId().withMessage("Invalid job id"),
  body("title").optional().isString().trim().isLength({ min: 4, max: 200 }),
  body("description").optional().isString().trim().isLength({ min: 10 }),
  body("category").optional().isString().trim().isLength({ min: 2, max: 100 }),
  body("skillsRequired")
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) return true;
      if (typeof value === "string") return true;
      throw new Error("skillsRequired must be an array or comma-separated string");
    }),
  body("budgetMin").optional().isNumeric().toFloat(),
  body("budgetMax").optional().isNumeric().toFloat(),
  body("deadline").optional().isISO8601().toDate(),
  body("attachments").optional().isArray(),
];

export const jobIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid job id"),
];

export const listJobsValidator = [
  query("category").optional().isString().trim().isLength({ min: 1 }),
  query("status")
    .optional()
    .isIn(["open", "in-progress", "completed", "cancelled", "disputed"]),
  query("minBudget").optional().isNumeric().toFloat(),
  query("maxBudget").optional().isNumeric().toFloat(),
  query("skills")
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) return true;
      if (typeof value === "string") return true;
      throw new Error("skills must be an array or comma-separated string");
    }),
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

