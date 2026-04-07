import nodemailer from "nodemailer";

function smtpConfigured() {
  const smtpUser = String(process.env.SMTP_USER || "").trim();
  const smtpPass = String(process.env.SMTP_PASS || "")
    .trim()
    .replace(/\s+/g, "");

  const hasPlaceholderCreds =
    smtpUser.toLowerCase() === "your_email@gmail.com" ||
    smtpPass.toLowerCase() === "your_app_password";

  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      smtpUser &&
      smtpPass &&
      !hasPlaceholderCreds
  );
}

function canReturnOtpPreview() {
  return process.env.NODE_ENV !== "production";
}

export async function sendOtpEmail({ to, code, purpose }) {
  const devLogOtp = () => {
    // eslint-disable-next-line no-console
    console.log(`[SkillNest][DEV] OTP for ${purpose} to ${to}: ${code}`);
  };

  // In local dev without SMTP, log the OTP for you to copy.
  if (!smtpConfigured()) {
    devLogOtp();
    return {
      delivered: false,
      reason: "smtp_not_configured",
      otpPreview: canReturnOtpPreview() ? code : undefined,
    };
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // common convention
    auth: {
      user: process.env.SMTP_USER,
      pass: String(process.env.SMTP_PASS || "")
        .trim()
        .replace(/\s+/g, ""),
    },
  });

  const subject =
    purpose === "verify_email"
      ? "SkillNest email verification code"
      : "SkillNest password reset code";

  const text =
    `Your OTP is: ${code}\n\n` +
    `This code will expire shortly.`;

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
    });
    return { delivered: true };
  } catch (error) {
    // If SMTP is misconfigured or credentials are rejected, do not block auth.
    // Fall back to console OTP logging so registration/password reset still works in dev.
    // eslint-disable-next-line no-console
    console.warn(
      `[SkillNest] SMTP send failed for ${purpose} to ${to}; falling back to dev log.`,
      error?.message || error
    );
    devLogOtp();
    return {
      delivered: false,
      reason: "smtp_send_failed",
      otpPreview: canReturnOtpPreview() ? code : undefined,
    };
  }
}

