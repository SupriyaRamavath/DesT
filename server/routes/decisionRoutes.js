const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");
const Decision = require("../models/Decision");
const DecisionEvent = require("../models/DecisionEvent");
const Evidence = require("../models/Evidence");
const HumanReview = require("../models/HumanReview");
const AuditLog = require("../models/AuditLog");
const AIApplication = require("../models/AIApplication");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();
router.use((req, res, next) => {
  if (req.path === "/ingest" && req.method === "POST") return next();
  return requireAuth(req, res, next);
});

function parseBoundedInteger(value, fallback, maximum) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
}

function ownedApplicationIds(userId) {
  return AIApplication.find({ owner: userId }).select("_id").lean();
}

function requestError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

router.get("/", async (req, res, next) => {
  try {
    const page = parseBoundedInteger(req.query.page, 1, 100000);
    const limit = parseBoundedInteger(req.query.limit, 20, 100);
    const applications = await ownedApplicationIds(req.user._id);
    const filter = { application: { $in: applications.map((item) => item._id) } };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel.toLowerCase();
    if (req.query.category) filter.category = req.query.category;
    if (req.query.application) filter.application = req.query.application;
    if (req.query.search) {
      filter.$or = [
        { externalDecisionId: { $regex: String(req.query.search).slice(0, 100), $options: "i" } },
        { title: { $regex: String(req.query.search).slice(0, 100), $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      Decision.find(filter)
        .select("application externalDecisionId title category output confidence riskLevel status startedAt completedAt createdAt")
        .populate("application", "name")
        .sort({ createdAt: req.query.sort === "oldest" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Decision.countDocuments(filter),
    ]);

    return res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    return next(error);
  }
});

router.post("/ingest", async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const body = req.body || {};
    const applicationId = body.applicationId || body.application;
    if (!applicationId || !body.externalDecisionId || !body.title || !body.category || !body.inputSummary) {
      return res.status(400).json({ success: false, message: "applicationId, externalDecisionId, title, category, and inputSummary are required." });
    }
    if (body.confidence !== undefined && (!Number.isFinite(body.confidence) || body.confidence < 0 || body.confidence > 1)) {
      return res.status(400).json({ success: false, message: "confidence must be between 0 and 1." });
    }
    if (body.events !== undefined && (!Array.isArray(body.events) || body.events.length > 100)) {
      return res.status(400).json({ success: false, message: "events must be an array containing at most 100 items." });
    }
    if (body.status && !["pending", "completed", "flagged", "reviewed", "failed"].includes(body.status)) {
      return res.status(400).json({ success: false, message: "status is invalid." });
    }
    if (body.riskLevel && !["low", "medium", "high", "critical"].includes(String(body.riskLevel).toLowerCase())) {
      return res.status(400).json({ success: false, message: "riskLevel is invalid." });
    }

    let response;
    await session.withTransaction(async () => {
      let applicationQuery = { _id: applicationId, status: "active" };
      const authorization = req.headers.authorization || "";
      if (authorization.startsWith("Bearer ")) {
        let payload;
        try {
          payload = jwt.verify(authorization.slice(7), env.jwtSecret, { algorithms: ["HS256"] });
        } catch {
          throw requestError(401, "Invalid or expired session.");
        }
        const user = await User.findById(payload.sub).select("_id isActive").session(session);
        if (!user || !user.isActive) throw requestError(401, "Invalid or inactive session.");
        req.user = user;
        applicationQuery.owner = user._id;
      } else if (req.headers["x-api-key"]) {
        applicationQuery.apiKeyHash = crypto.createHash("sha256").update(req.headers["x-api-key"]).digest("hex");
      } else {
        throw requestError(401, "Bearer token or application API key is required.");
      }
      const application = await AIApplication.findOne(applicationQuery).session(session);
      if (!application) {
        const error = new Error("Application not found or inactive.");
        error.statusCode = 404;
        throw error;
      }

      const [decision] = await Decision.create([{
        application: application._id,
        createdBy: application.owner,
        externalDecisionId: body.externalDecisionId,
        title: body.title,
        category: body.category,
        inputSummary: body.inputSummary,
        input: body.input || {},
        output: body.output || null,
        status: body.status || "completed",
        confidence: body.confidence ?? null,
        riskLevel: (body.riskLevel || "low").toLowerCase(),
        riskFlags: Array.isArray(body.riskFlags) ? body.riskFlags : [],
        model: body.model || {},
        startedAt: body.startedAt || new Date(),
        completedAt: body.completedAt || new Date(),
      }], { session });

      const events = (body.events || []).map((event, index) => ({
        decision: decision._id,
        sequence: event.stepNumber ?? index + 1,
        type: (event.eventType || "processing").toLowerCase(),
        name: event.title || `Step ${index + 1}`,
        description: event.description || "",
        data: { input: event.input || null, output: event.output || null, metadata: event.metadata || null },
        timestamp: event.timestamp || new Date(),
        durationMs: event.duration ?? null,
      }));
      if (events.length) await DecisionEvent.insertMany(events, { session });
      if (Array.isArray(body.evidence) && body.evidence.length) {
        const evidence = body.evidence.map((item) => ({
          decision: decision._id,
          title: item.title || "Evidence",
          source: item.source || "Unspecified source",
          content: item.description || item.content || "",
          relevanceScore: item.reliability ?? null,
          metadata: item.metadata || null,
        }));
        await Evidence.insertMany(evidence, { session });
      }
      await AuditLog.create([{
        actor: application.owner,
        action: "decision_ingested",
        resourceType: "Decision",
        resourceId: decision._id,
        metadata: { application: application._id, eventCount: events.length },
      }], { session });
      response = { decision, events };
    });
    req.app.get("io")?.to(`user:${response.decision.createdBy}`).emit("decision:created", {
      decisionId: response.decision._id,
      applicationId: response.decision.application,
    });
    return res.status(201).json({ success: true, data: response });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "externalDecisionId already exists for this application." });
    }
    return next(error);
  } finally {
    await session.endSession();
  }
});

router.get("/:id/replay", async (req, res, next) => {
  try {
    const applications = await ownedApplicationIds(req.user._id);
    const decision = await Decision.findOne({ _id: req.params.id, application: { $in: applications.map((item) => item._id) } }).populate("application", "name").lean();
    if (!decision) return res.status(404).json({ success: false, message: "Decision not found." });
    const [events, evidence, reviews, audit] = await Promise.all([
      DecisionEvent.find({ decision: decision._id }).sort({ sequence: 1, timestamp: 1 }).lean(),
      Evidence.find({ decision: decision._id }).sort({ createdAt: 1 }).lean(),
      HumanReview.find({ decision: decision._id }).populate("reviewer", "name email").sort({ reviewedAt: -1 }).lean(),
      AuditLog.find({ resourceType: "Decision", resourceId: decision._id }).sort({ createdAt: 1 }).lean(),
    ]);
    return res.json({ success: true, data: { decision, events, evidence, reviews, audit } });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const applications = await ownedApplicationIds(req.user._id);
    const decision = await Decision.findOne({ _id: req.params.id, application: { $in: applications.map((item) => item._id) } }).populate("application", "name").lean();
    if (!decision) return res.status(404).json({ success: false, message: "Decision not found." });
    return res.json({ success: true, data: decision });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
