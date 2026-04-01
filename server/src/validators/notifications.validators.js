import { param } from "express-validator";

export const notificationIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid notification id"),
];
