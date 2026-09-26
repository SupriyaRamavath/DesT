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

router.get("/:id", async (req, res, next) => {
  try {
    const app = await AIApplication.findOne({ _id: req.params.id, ...ownerFilter(req.user) }).lean();
    if (!app) return res.status(404).json({ success: false, message: "Application not found." });
    const [decisions, riskCounts, aggregateStats] = await Promise.all([
      Decision.find({ application: app._id }).sort({ createdAt: -1 }).limit(20).select("externalDecisionId output confidence riskLevel status createdAt").lean(),
      Decision.aggregate([
        { $match: { application: app._id } },
        { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
      ]),
      Decision.aggregate([
        { $match: { application: app._id } },
        { $group: { _id: null, total: { $sum: 1 }, highRisk: { $sum: { $cond: [{ $in: ["$riskLevel", ["high", "critical"]] }, 1, 0] } }, averageConfidence: { $avg: "$confidence" }, reviewRequired: { $sum: { $cond: [{ $or: [{ $eq: ["$status", "flagged"] }, { $eq: ["$output.decision", "human_review"] }] }, 1, 0] } } } },
      ]),
    ]);
    const aggregate = aggregateStats[0] || { total: 0, highRisk: 0, averageConfidence: null, reviewRequired: 0 };
    return res.json({
      success: true,
      data: {
        application: { ...app, apiKeyHash: undefined },
        decisions,
        stats: {
          totalDecisions: aggregate.total,
          decisionsToday: await Decision.countDocuments({ application: app._id, createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
          highRisk: aggregate.highRisk,
          averageConfidence: aggregate.averageConfidence,
          reviewRequired: aggregate.reviewRequired,
          riskDistribution: riskCounts,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id/activate", async (req, res, next) => {
  return changeStatus(req, res, next, "active");
});

router.patch("/:id/deactivate", async (req, res, next) => {
  return changeStatus(req, res, next, "inactive");
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

async function changeStatus(req, res, next, status) {
  try {
    const app = await AIApplication.findOneAndUpdate(
      { _id: req.params.id, ...ownerFilter(req.user) },
      { $set: { status } },
      { new: true, runValidators: true }
    ).lean();
    if (!app) return res.status(404).json({ success: false, message: "Application not found." });
    return res.json({ success: true, data: { ...app, apiKeyHash: undefined } });
  } catch (error) {
    return next(error);
  }
}

router.delete("/:id", async (req, res, next) => {
  try {
    async function performDelete(session) {
      const sessionOpt = session ? { session } : {};
      const app = await AIApplication.findOne({
        _id: req.params.id,
        ...(req.user.role === "admin" ? {} : { owner: req.user._id }),
      }).session(session || null);

      if (!app) {
        const error = new Error("Application not found.");
        error.statusCode = 404;
        throw error;
      }

      const decisions = await Decision.find({ application: app._id }).select("_id").session(session || null);
      const decisionIds = decisions.map((decision) => decision._id);

      await Promise.all([
        DecisionEvent.deleteMany({ decision: { $in: decisionIds } }, sessionOpt),
        Evidence.deleteMany({ decision: { $in: decisionIds } }, sessionOpt),
        HumanReview.deleteMany({ decision: { $in: decisionIds } }, sessionOpt),
        Notification.deleteMany({ relatedDecision: { $in: decisionIds } }, sessionOpt),
        AuditLog.create(
          [{
            actor: req.user._id,
            action: "application_deleted",
            resourceType: "AIApplication",
            resourceId: app._id,
            metadata: { decisionCount: decisionIds.length },
          }],
          sessionOpt
        ),
        Decision.deleteMany({ application: app._id }, sessionOpt),
        AIApplication.deleteOne({ _id: app._id }, sessionOpt),
      ]);
    }

    try {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await performDelete(session);
        });
      } finally {
        await session.endSession();
      }
    } catch (txError) {
      if (
        txError.statusCode === 404 ||
        (txError.message &&
          !txError.message.includes("replica set") &&
          !txError.message.includes("Transaction numbers") &&
          !txError.message.includes("This MongoDB deployment does not support"))
      ) {
        throw txError;
      }
      // Non-replica set fallback
      await performDelete(null);
    }

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;