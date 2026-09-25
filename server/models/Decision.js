const mongoose = require("mongoose");

const decisionSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AIApplication",
      required: true,
      index: true,
    },
    externalDecisionId: {
      type: String,
      required: [true, "External decision ID is required."],
      trim: true,
      maxlength: 200,
    },
    title: {
      type: String,
      required: [true, "Decision title is required."],
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: [true, "Decision category is required."],
      trim: true,
      maxlength: 100,
      index: true,
    },
    inputSummary: {
      type: String,
      required: [true, "Decision input summary is required."],
      trim: true,
      maxlength: 5000,
    },
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "flagged", "reviewed", "failed"],
      default: "pending",
      index: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
      index: true,
    },
    riskFlags: {
      type: [String],
      default: [],
    },
    model: {
      provider: { type: String, trim: true, default: "" },
      name: { type: String, trim: true, default: "" },
      version: { type: String, trim: true, default: "" },
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

decisionSchema.index({ application: 1, externalDecisionId: 1 }, { unique: true });
decisionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Decision", decisionSchema);