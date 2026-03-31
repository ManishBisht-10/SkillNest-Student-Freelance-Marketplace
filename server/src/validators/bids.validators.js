import { body, param } from "express-validator";

export const createBidValidator = [
  body("jobId").isMongoId().withMessage("Invalid jobId"),
  body("proposalText").isString().trim().isLength({ min: 10, max: 5000 }),
  body("bidAmount").isNumeric().toFloat(),
  body("deliveryDays").isInt({ min: 1, max: 365 }).toInt(),
];

export const bidIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid bid id"),
];

export const jobIdParamValidator = [
  param("jobId").isMongoId().withMessage("Invalid job id"),
];

