import { Schema, model, models, Types } from "mongoose";

const AccountSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["cash", "bank", "credit", "other"],
      default: "other",
    },
    currency: { type: String, default: "INR" },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Account || model("Account", AccountSchema);
