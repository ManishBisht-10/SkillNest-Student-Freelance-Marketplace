import { body, param, query } from "express-validator";

export const userIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid user id"),
];

export const jobIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid job id"),
];

export const contractIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid contract id"),
];

export const reviewIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid review id"),
];

export const banUserValidator = [
  body("banned").isBoolean().toBoolean(),
];

export const activateUserValidator = [
  body("active").isBoolean().toBoolean(),
];

export const listUsersQueryValidator = [
  query("role").optional().isIn(["admin", "student", "consumer"]),
  query("status").optional().isIn(["active", "inactive", "banned"]),
  query("q").optional().isString().trim().isLength({ max: 200 }),
];

export const listTransactionsQueryValidator = [
  query("type").optional().isIn(["payment", "release", "refund"]),
  query("status").optional().isString().trim(),
];

export const resolveDisputeValidator = [
  body("decision").isIn(["release", "refund"]).withMessage("decision must be release or refund"),
];
