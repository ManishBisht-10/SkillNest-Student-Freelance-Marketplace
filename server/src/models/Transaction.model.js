import mongoose from "mongoose";

const { Schema } = mongoose;

const TransactionSchema = new Schema(
  {
    contractId: { type: Schema.Types.ObjectId, ref: "Contract", required: true },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ["payment", "release", "refund"],
      required: true,
    },
    paymentGatewayId: { type: String, default: "" },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

TransactionSchema.index({ contractId: 1, createdAt: -1 });

const Transaction = mongoose.model("Transaction", TransactionSchema);
export default Transaction;

