import { Schema, model, models } from "mongoose";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    icon: {
      type: String,
      default: null,
    },

    color: {
      type: String,
      default: "#000000",
    },

    // null = system category
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Same user cannot create duplicate category names
CategorySchema.index(
  { userId: 1, name: 1 },
  { unique: true }
);

export default models.Category ||
  model("Category", CategorySchema);