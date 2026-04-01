import { body, param } from "express-validator";

export const createReviewValidator = [
  body("contractId").isMongoId().withMessage("Invalid contract id"),
  body("rating").isInt({ min: 1, max: 5 }).toInt(),
  body("comment").optional().isString().trim().isLength({ max: 2000 }),
  body("role")
    .isIn(["student", "consumer"])
    .withMessage("role must be student or consumer (reviewer role)"),
];

export const userIdParamValidator = [
  param("userId").isMongoId().withMessage("Invalid user id"),
];
