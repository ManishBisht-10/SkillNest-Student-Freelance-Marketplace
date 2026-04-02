import nodemailer from "nodemailer";

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

export async function sendOtpEmail({ to, code, purpose }) {
  const devLogOtp = () => {
    // eslint-disable-next-line no-console
    console.log(`[SkillNest][DEV] OTP for ${purpose} to ${to}: ${code}`);
  };

  // In local dev without SMTP, log the OTP for you to copy.
  if (!smtpConfigured()) {
    devLogOtp();
    return;
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // common convention
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
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
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
    });
  } catch (error) {
    // If SMTP is misconfigured or credentials are rejected, do not block auth.
    // Fall back to console OTP logging so registration/password reset still works in dev.
    // eslint-disable-next-line no-console
    console.warn(
      `[SkillNest] SMTP send failed for ${purpose} to ${to}; falling back to dev log.`,
      error?.message || error
    );
    devLogOtp();
  }
}

