const mongoose = require("mongoose");

const decisionEventSchema = new mongoose.Schema(
  {
    decision: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Decision",
      required: true,
      index: true,
    },
    sequence: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: [
        "input",
        "processing",
        "extraction",
        "evidence",
        "decision",
        "risk",
        "review",
        "error",
      ],
      required: true,
    },
    name: {
      type: String,
      required: [true, "Event name is required."],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    durationMs: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  { timestamps: true }
);

decisionEventSchema.index({ decision: 1, sequence: 1 }, { unique: true });

module.exports = mongoose.model("DecisionEvent", decisionEventSchema);