const express = require("express");
const crypto = require("crypto");
const AIApplication = require("../models/AIApplication");
const Decision = require("../models/Decision");
const DecisionEvent = require("../models/DecisionEvent");
const Evidence = require("../models/Evidence");
const HumanReview = require("../models/HumanReview");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");
const mongoose = require("mongoose");
const { requireRole } = require("../middleware/roleMiddleware");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(requireAuth);
router.use(requireRole("admin", "developer"));
const ownerFilter = (user) => user.role === "admin" ? {} : { owner: user._id };

router.get("/", async (req, res, next) => {
  try {
    const applications = await AIApplication.find(ownerFilter(req.user)).sort({ createdAt: -1 });
    const counts = await Decision.aggregate([
      { $match: { application: { $in: applications.map((item) => item._id) } } },
      { $group: { _id: "$application", count: { $sum: 1 } } },
    ]);
    const countByApp = new Map(counts.map((item) => [item._id.toString(), item.count]));
    return res.json({ success: true, data: applications.map((item) => ({
      id: item._id,
      name: item.name,
      description: item.description,
      environment: item.environment,
      status: item.status,
      decisions: countByApp.get(item._id.toString()) || 0,
      createdAt: item.createdAt,
    })) });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    if (!req.body.name?.trim()) return res.status(400).json({ success: false, message: "Application name is required." });
    const apiKey = `dt_${crypto.randomBytes(20).toString("hex")}`;
    const app = await AIApplication.create({
      name: req.body.name.trim(),
      description: req.body.description || "",
      environment: (req.body.environment || "development").toLowerCase(),
      owner: req.user._id,
      apiKeyHash: crypto.createHash("sha256").update(apiKey).digest("hex"),
    });
    return res.status(201).json({
      success: true,
      data: {
        id: app._id,
        name: app.name,
        description: app.description,
        environment: app.environment,
        status: app.status,
        createdAt: app.createdAt,
        apiKey,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const app = await AIApplication.findOneAndUpdate(
      { _id: req.params.id, ...(req.user.role === "admin" ? {} : { owner: req.user._id }) },
      { $set: { name: req.body.name, description: req.body.description, environment: req.body.environment?.toLowerCase() } },
      { new: true, runValidators: true }
    );
    if (!app) return res.status(404).json({ success: false, message: "Application not found." });
    return res.json({ success: true, data: app });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const session = await mongoose.startSession();
    let app;
    try {
      await session.withTransaction(async () => {
        app = await AIApplication.findOne({ _id: req.params.id, ...(req.user.role === "admin" ? {} : { owner: req.user._id }) }).session(session);
        if (!app) {
          const error = new Error("Application not found.");
          error.statusCode = 404;
          throw error;
        }
        const decisions = await Decision.find({ application: app._id }).select("_id").session(session);
        const decisionIds = decisions.map((decision) => decision._id);
        await Promise.all([
          DecisionEvent.deleteMany({ decision: { $in: decisionIds } }, { session }),
          Evidence.deleteMany({ decision: { $in: decisionIds } }, { session }),
          HumanReview.deleteMany({ decision: { $in: decisionIds } }, { session }),
          Notification.deleteMany({ relatedDecision: { $in: decisionIds } }, { session }),
          AuditLog.create([{ actor: req.user._id, action: "application_deleted", resourceType: "AIApplication", resourceId: app._id, metadata: { decisionCount: decisionIds.length } }], { session }),
          Decision.deleteMany({ application: app._id }, { session }),
          AIApplication.deleteOne({ _id: app._id }, { session }),
        ]);
      });
    } finally {
      await session.endSession();
    }
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;