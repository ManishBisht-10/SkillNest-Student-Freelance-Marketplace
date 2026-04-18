import { body, param } from "express-validator";

export const paramUserIdValidator = [
  param("id").isMongoId().withMessage("Invalid user id"),
];

export const updateMeValidator = [
  body("name").optional().isString().trim().isLength({ min: 2, max: 100 }),
  body("bio").optional().isString().trim().isLength({ min: 0, max: 2000 }),
  body("skills").optional(),
  body("course").optional().isString().trim().isLength({ min: 0, max: 150 }),
  body("university").optional().isString().trim().isLength({ min: 0, max: 200 }),
  body("year").optional().isString().trim().isLength({ min: 0, max: 20 }),
  body("semester").optional().isString().trim().isLength({ min: 0, max: 20 }),
  body("portfolioLinks").optional(),
  body("resumeUrl").optional().isString().trim().isLength({ min: 0, max: 2000 }),
  body("isAvailable").optional().isBoolean(),
  body("companyName")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 0, max: 200 }),
  body("website").optional().isString().trim().isLength({ min: 0, max: 500 }),
];

