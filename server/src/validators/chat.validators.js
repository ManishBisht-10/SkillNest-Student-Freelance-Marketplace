import { body, param, query } from "express-validator";

export const roomIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid room id"),
];

export const listRoomMessagesQueryValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const sendMessageValidator = [
  ...roomIdParamValidator,
  body("text").optional().isString().trim().isLength({ max: 5000 }),
  body("attachmentUrl").optional().isString().trim().isLength({ max: 2000 }),
];
