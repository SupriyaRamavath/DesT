const mongoose = require("mongoose");

const humanReviewSchema = new mongoose.Schema(
  {
    decision: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Decision",
      required: true,
      index: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["approve", "reject", "modify", "request_more_information"],
      default: "request_more_information",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "modified"],
      default: "pending",
      required: true,
    },
    modifiedOutput: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

humanReviewSchema.index({ decision: 1, createdAt: -1 });

module.exports = mongoose.model("HumanReview", humanReviewSchema);