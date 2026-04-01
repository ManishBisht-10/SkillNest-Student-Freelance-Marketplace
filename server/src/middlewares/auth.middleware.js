import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.model.js";

export async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const bearer =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
  const token = bearer || req.cookies?.accessToken || null;

  if (!token) {
    return next(new ApiError(401, "Not authenticated"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("role isActive isBanned");
    if (!user) {
      return next(new ApiError(401, "Invalid or expired token"));
    }
    if (!user.isActive || user.isBanned) {
      return next(new ApiError(403, "Account suspended or inactive"));
    }
    req.user = {
      id: payload.sub,
      role: user.role,
    };
    return next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    return next(new ApiError(401, "Invalid or expired token"));
  }
}

export function checkRole(...allowedRoles) {
  return function (req, res, next) {
    const role = req.user?.role;
    if (!role) return next(new ApiError(403, "Forbidden"));
    if (!allowedRoles.includes(role)) {
      return next(new ApiError(403, "Forbidden"));
    }
    return next();
  };
}
