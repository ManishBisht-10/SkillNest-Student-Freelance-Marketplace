import crypto from "crypto";
import Razorpay from "razorpay";

function getKeyId() {
  return process.env.RAZORPAY_KEY_ID || "";
}

function getKeySecret() {
  return process.env.RAZORPAY_KEY_SECRET || "";
}

function getWebhookSecret() {
  return process.env.RAZORPAY_WEBHOOK_SECRET || "";
}

export function isRazorpayConfigured() {
  return Boolean(getKeyId() && getKeySecret());
}

export function getRazorpayClient() {
  if (!isRazorpayConfigured()) {
    throw new Error("Razorpay is not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)");
  }
  return new Razorpay({
    key_id: getKeyId(),
    key_secret: getKeySecret(),
  });
}

/** INR amount (rupees) → paise integer for Razorpay. */
export function rupeesToPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

export function verifyPaymentSignature(orderId, paymentId, signature) {
  const secret = getKeySecret();
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

/**
 * Razorpay webhook signature verification (raw JSON body).
 * @param {Buffer} rawBody
 * @param {string} signature from header X-Razorpay-Signature
 */
export function verifyWebhookSignature(rawBody, signature) {
  const secret = getWebhookSecret();
  if (!secret || !signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}

export function getPlatformFeePercent() {
  const n = Number(process.env.PLATFORM_FEE_PERCENT);
  if (Number.isFinite(n) && n >= 0 && n <= 100) return n;
  return 10;
}

export function netAmountAfterPlatformFee(agreedAmountRupee) {
  const pct = getPlatformFeePercent();
  const net = (Number(agreedAmountRupee) * (100 - pct)) / 100;
  return Math.round(net * 100) / 100;
}
