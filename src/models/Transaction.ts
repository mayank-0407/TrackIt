import { Schema, model, models, Types } from "mongoose";

const TransactionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    accountId: { type: Types.ObjectId, ref: "Account", required: true },
    transferAccountId: {
      type: Types.ObjectId,
      ref: "Account",
      required: false,
    },
    type: {
      type: String,
      enum: ["expense", "income", "transfer"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String },
    date: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

export default models.Transaction || model("Transaction", TransactionSchema);
