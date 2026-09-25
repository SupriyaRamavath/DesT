const mongoose = require("mongoose");
const HumanReview = require("../models/HumanReview");
const Decision = require("../models/Decision");
const AIApplication = require("../models/AIApplication");
const AuditLog = require("../models/AuditLog");

const isPrivileged = (user) => ["admin", "reviewer"].includes(user.role);

async function decisionForUser(id, user) {
  if (!mongoose.isValidObjectId(id)) return null;
  const query = { _id: id };
  if (!isPrivileged(user)) {
    const apps = await AIApplication.find({ owner: user._id }).select("_id");
    query.application = { $in: apps.map((app) => app._id) };
  }
  return Decision.findOne(query);
}

function reviewQuery(user) {
  return isPrivileged(user)
    ? {}
    : { decision: { $in: [] } };
}

async function listReviews(req, res, next) {
  try {
    const query = reviewQuery(req.user);
    if (!isPrivileged(req.user)) {
      const apps = await AIApplication.find({ owner: req.user._id }).select("_id");
      const decisions = await Decision.find({ application: { $in: apps.map((app) => app._id) } }).select("_id");
      query.decision = { $in: decisions.map((decision) => decision._id) };
    }
    if (req.query.action) query.action = req.query.action;
    if (req.query.decision) {
      if (!mongoose.isValidObjectId(req.query.decision)) return res.status(400).json({ success: false, message: "Invalid decision identifier." });
      query.decision = req.query.decision;
    }
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const reviews = await HumanReview.find(query)
      .populate("decision", "externalDecisionId title status riskLevel application")
      .populate("reviewer", "name email role")
      .sort({ createdAt: -1 }).limit(limit);
    return res.json({ success: true, data: reviews });
  } catch (error) { return next(error); }
}

async function getReview(req, res, next) {
  try {
    const review = await HumanReview.findById(req.params.id)
      .populate("decision", "externalDecisionId title status riskLevel application")
      .populate("reviewer", "name email role");
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    if (!isPrivileged(req.user) && !(await decisionForUser(review.decision._id, req.user))) {
      return res.status(403).json({ success: false, message: "You do not have permission to access this review." });
    }
    return res.json({ success: true, data: review });
  } catch (error) { return next(error); }
}

async function createReview(req, res, next) {
  try {
    const decision = await decisionForUser(req.body.decision, req.user);
    if (!decision) return res.status(404).json({ success: false, message: "Decision not found." });
    const action = req.body.action || "request_more_information";
    if (!["approve", "reject", "modify", "request_more_information"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid review action." });
    }
    if (["reject", "modify", "request_more_information"].includes(action) && !req.body.comment?.trim()) {
      return res.status(400).json({ success: false, message: "A comment is required for this review action." });
    }
    const review = await HumanReview.create({
      decision: decision._id, reviewer: req.user._id,
      action,
      status: action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "modify" ? "modified" : "pending",
      comment: typeof req.body.comment === "string" ? req.body.comment.trim() : "",
    });
    await Decision.updateOne({ _id: decision._id }, { $set: { status: "flagged" } });
    await AuditLog.create({ actor: req.user._id, action: "review_created", resourceType: "HumanReview", resourceId: review._id, metadata: { decision: decision._id } });
    req.app.get("io")?.to(`user:${decision.createdBy}`).emit("review:created", { reviewId: review._id, decisionId: decision._id });
    return res.status(201).json({ success: true, data: review });
  } catch (error) { return next(error); }
}

async function updateReview(req, res, next) {
  try {
    const review = await HumanReview.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    if (!isPrivileged(req.user) && !(await decisionForUser(review.decision, req.user))) return res.status(403).json({ success: false, message: "You do not have permission to update this review." });
    const allowed = {};
    if (typeof req.body.comment === "string") allowed.comment = req.body.comment.trim();
    if (req.body.modifiedOutput !== undefined) allowed.modifiedOutput = req.body.modifiedOutput;
    if (req.body.action) {
      if (!["approve", "reject", "modify", "request_more_information"].includes(req.body.action)) return res.status(400).json({ success: false, message: "Invalid review action." });
      if (["reject", "modify", "request_more_information"].includes(req.body.action) && !req.body.comment?.trim()) return res.status(400).json({ success: false, message: "A comment is required for this review action." });
      allowed.action = req.body.action;
      allowed.status = req.body.action === "approve" ? "approved" : req.body.action === "reject" ? "rejected" : req.body.action === "modify" ? "modified" : "pending";
      allowed.reviewedAt = new Date();
    }
    Object.assign(review, allowed);
    await review.save();
    return res.json({ success: true, data: review });
  } catch (error) { return next(error); }
}

async function setReviewStatus(req, res, next) {
  try {
    const review = await HumanReview.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    const action = req.path.endsWith("/approve") ? "approve" : req.path.endsWith("/reject") ? "reject" : req.path.endsWith("/modify") ? "modify" : "request_more_information";
    if (["reject", "modify", "request_more_information"].includes(action) && !req.body.comment?.trim()) return res.status(400).json({ success: false, message: "A comment is required for this review action." });
    if (action === "modify" && req.body.modifiedOutput === undefined) return res.status(400).json({ success: false, message: "modifiedOutput is required." });
    review.action = action;
    review.status = action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "modify" ? "modified" : "pending";
    review.reviewedAt = new Date();
    if (typeof req.body.comment === "string") review.comment = req.body.comment.trim();
    if (action === "modify") review.modifiedOutput = req.body.modifiedOutput;
    await review.save();
    await Decision.updateOne({ _id: review.decision }, { $set: { status: "reviewed" } });
    await AuditLog.create({ actor: req.user._id, action: `review_${action}`, resourceType: "HumanReview", resourceId: review._id });
    req.app.get("io")?.to(`user:${review.reviewer}`).emit("review:created", { reviewId: review._id, decisionId: review.decision });
    return res.json({ success: true, data: review });
  } catch (error) { return next(error); }
}

async function deleteReview(req, res, next) {
  try {
    const review = await HumanReview.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });
    if (review.reviewer.toString() !== req.user._id.toString() && req.user.role !== "admin") return res.status(403).json({ success: false, message: "Only the reviewer or an admin can delete this review." });
    await review.deleteOne();
    return res.json({ success: true });
  } catch (error) { return next(error); }
}

module.exports = { listReviews, getReview, createReview, updateReview, setReviewStatus, deleteReview };