import { body, param } from "express-validator";

export const contractIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid contract id"),
];

export const milestoneCompleteValidator = [
  param("id").isMongoId().withMessage("Invalid contract id"),
  param("mId").isMongoId().withMessage("Invalid milestone id"),
];

export const disputeValidator = [
  body("reason").optional().isString().trim().isLength({ max: 2000 }),
];
