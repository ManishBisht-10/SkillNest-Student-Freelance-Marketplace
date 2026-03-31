import bcrypt from "bcryptjs";
import crypto from "crypto";

function generateNumericOtp() {
  // 6-digit numeric OTP
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createOtpCode() {
  const code = generateNumericOtp();
  const codeHash = await bcrypt.hash(code, 10);
  return { code, codeHash };
}

export function sha256(input) {
  return crypto.createHash("sha256").update(String(input)).digest("hex");
}

