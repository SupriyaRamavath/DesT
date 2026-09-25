const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
  {
    decision: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Decision",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Evidence title is required."],
      trim: true,
      maxlength: 200,
    },
    source: {
      type: String,
      required: [true, "Evidence source is required."],
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: [true, "Evidence content is required."],
      maxlength: 10000,
    },
    relevanceScore: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    evidenceType: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "document",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evidence", evidenceSchema);