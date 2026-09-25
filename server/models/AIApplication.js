const mongoose = require("mongoose");

const aiApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Application name is required."],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    apiKeyHash: {
      type: String,
      required: [true, "Application API key hash is required."],
      select: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    environment: {
      type: String,
      enum: ["development", "staging", "production"],
      default: "development",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIApplication", aiApplicationSchema);