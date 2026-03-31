import jwt from "jsonwebtoken";

function getAccessSecret() {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");
  return process.env.JWT_SECRET;
}

function getRefreshSecret() {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET not set");
  }
  return process.env.JWT_REFRESH_SECRET;
}

export function signAccessToken(user) {
  return jwt.sign(
    { role: user.role },
    getAccessSecret(),
    {
      subject: user._id.toString(),
      expiresIn: "15m",
    }
  );
}

export function signRefreshToken(user, tokenId) {
  return jwt.sign(
    { tokenId, role: user.role },
    getRefreshSecret(),
    {
      subject: user._id.toString(),
      expiresIn: "7d",
    }
  );
}

