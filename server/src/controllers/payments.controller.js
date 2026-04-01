import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Contract from "../models/Contract.model.js";
import Transaction from "../models/Transaction.model.js";
import {
  getRazorpayClient,
  isRazorpayConfigured,
  rupeesToPaise,
  verifyPaymentSignature,
  verifyWebhookSignature,
  netAmountAfterPlatformFee,
} from "../services/payments.service.js";

export const initiatePayment = asyncHandler(async (req, res) => {
  if (req.user.role !== "consumer") {
    throw new ApiError(403, "Only consumers can initiate payment");
  }
  if (!isRazorpayConfigured()) {
    throw new ApiError(503, "Payment gateway is not configured");
  }

  const { contractId } = req.body;
  const contract = await Contract.findById(contractId);
  if (!contract) throw new ApiError(404, "Contract not found");
  if (String(contract.consumerId) !== req.user.id) {
    throw new ApiError(403, "Forbidden");
  }
  if (contract.status !== "active") {
    throw new ApiError(400, "Contract is not active");
  }
  if (contract.paymentStatus !== "pending") {
    throw new ApiError(400, "Payment already processed or not pending");
  }

  const amountPaise = rupeesToPaise(contract.agreedAmount);
  if (amountPaise < 100) {
    throw new ApiError(400, "Amount too small for Razorpay (min ₹1)");
  }

  const razorpay = getRazorpayClient();
  const receipt = `sn_${String(contract._id).slice(-12)}`;

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt,
    notes: {
      contractId: String(contract._id),
      jobId: String(contract.jobId),
    },
  });

  contract.razorpayOrderId = order.id;
  await contract.save();

  return res.status(200).json({
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    contractId: contract._id,
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  if (req.user.role !== "consumer") {
    throw new ApiError(403, "Only the consumer can verify their payment");
  }
  if (!isRazorpayConfigured()) {
    throw new ApiError(503, "Payment gateway is not configured");
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const ok = verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );
  if (!ok) {
    throw new ApiError(400, "Invalid payment signature");
  }

  const contract = await Contract.findOne({ razorpayOrderId: razorpay_order_id });
  if (!contract) {
    throw new ApiError(404, "Contract not found for this order");
  }
  if (String(contract.consumerId) !== req.user.id) {
    throw new ApiError(403, "Forbidden");
  }
  if (contract.paymentStatus !== "pending") {
    return res.status(200).json({
      message: "Payment already recorded",
      contract,
    });
  }

  const existing = await Transaction.findOne({
    paymentGatewayId: razorpay_payment_id,
    type: "payment",
  });
  if (existing) {
    contract.paymentStatus = "held";
    await contract.save();
    return res.status(200).json({
      message: "Payment verified",
      contract,
    });
  }

  await Transaction.create({
    contractId: contract._id,
    amount: contract.agreedAmount,
    type: "payment",
    paymentGatewayId: razorpay_payment_id,
    status: "completed",
  });

  contract.paymentStatus = "held";
  await contract.save();

  return res.status(200).json({
    message: "Payment verified; funds marked as held in escrow",
    contract,
  });
});

/**
 * Razorpay webhooks — raw body signature uses `req.rawBody` (set in `app.js`).
 */
export const paymentWebhook = asyncHandler(async (req, res) => {
  if (!isRazorpayConfigured()) {
    return res.status(503).send("Gateway not configured");
  }

  const signature = req.get("X-Razorpay-Signature") || "";
  const rawBody = req.rawBody;
  if (!rawBody || !Buffer.isBuffer(rawBody)) {
    return res.status(400).send("Missing raw body");
  }

  if (!verifyWebhookSignature(rawBody, signature)) {
    return res.status(400).send("Invalid signature");
  }

  const payload = req.body;
  const event = payload?.event;
  const paymentEntity = payload?.payload?.payment?.entity;

  if (event === "payment.captured" && paymentEntity?.id && paymentEntity?.order_id) {
    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;

    const contract = await Contract.findOne({ razorpayOrderId: orderId });
    if (contract && contract.paymentStatus === "pending") {
      const dup = await Transaction.findOne({
        paymentGatewayId: paymentId,
        type: "payment",
      });
      if (!dup) {
        await Transaction.create({
          contractId: contract._id,
          amount: contract.agreedAmount,
          type: "payment",
          paymentGatewayId: paymentId,
          status: "completed",
        });
        contract.paymentStatus = "held";
        await contract.save();
      }
    }
  }

  return res.status(200).json({ received: true });
});

export const releasePaymentAdmin = asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.contractId);
  if (!contract) throw new ApiError(404, "Contract not found");
  if (contract.paymentStatus !== "held") {
    throw new ApiError(400, "Nothing to release (escrow not held)");
  }
  if (contract.status !== "active") {
    throw new ApiError(400, "Contract must be active to release");
  }

  const net = netAmountAfterPlatformFee(contract.agreedAmount);
  await Transaction.create({
    contractId: contract._id,
    amount: net,
    type: "release",
    paymentGatewayId: "",
    status: "completed",
  });

  contract.paymentStatus = "released";
  await contract.save();

  return res.status(200).json({
    message: "Release recorded (admin)",
    contract,
    netToStudent: net,
  });
});
