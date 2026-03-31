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
  // In local dev without SMTP, log the OTP for you to copy.
  if (!smtpConfigured()) {
    // eslint-disable-next-line no-console
    console.log(
      `[SkillNest][DEV] OTP for ${purpose} to ${to}: ${code}`
    );
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

  await transport.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
  });
}

