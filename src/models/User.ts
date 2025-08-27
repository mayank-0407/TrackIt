import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true }, // hashed
    image: { type: String },
    isVerified: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
