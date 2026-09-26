const mongoose = require("mongoose");
const AuditLog = require("../models/AuditLog");
const AIApplication = require("../models/AIApplication");
const Decision = require("../models/Decision");

async function scope(req) {
  if (req.user.role === "admin") return {};
  const apps = await AIApplication.find({ owner: req.user._id }).select("_id");
  const decisions = await Decision.find({ application: { $in: apps.map((item) => item._id) } }).select("_id");
  return { $or: [{ actor: req.user._id }, { resourceId: { $in: apps.map((item) => item._id).concat(decisions.map((item) => item._id)) } }] };
}

async function listAuditLogs(req, res, next) {
  try {
    const query = await scope(req);
    if (req.query.action) query.action = String(req.query.action).slice(0, 150);
    if (req.query.resourceType) query.resourceType = String(req.query.resourceType).slice(0, 100);
    if (req.query.from || req.query.to) {
      query.createdAt = {};
      if (req.query.from && !Number.isNaN(Date.parse(req.query.from))) query.createdAt.$gte = new Date(req.query.from);
      if (req.query.to && !Number.isNaN(Date.parse(req.query.to))) query.createdAt.$lte = new Date(req.query.to);
    }
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const logs = await AuditLog.find(query).populate("actor", "name email role").sort({ createdAt: -1 }).limit(limit);
    return res.json({ success: true, data: logs });
  } catch (error) { return next(error); }
}

async function getAuditLog(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid audit log identifier." });
    const log = await AuditLog.findById(req.params.id).populate("actor", "name email role");
    if (!log) return res.status(404).json({ success: false, message: "Audit log not found." });
    const allowed = req.user.role === "admin" || log.actor?._id?.toString() === req.user._id.toString() ||
      (await scope(req)).$or.some((item) => item.resourceId && item.resourceId.$in.some((id) => id.toString() === log.resourceId?.toString()));
    if (!allowed) return res.status(403).json({ success: false, message: "You do not have permission to access this audit log." });
    return res.json({ success: true, data: log });
  } catch (error) { return next(error); }
}

async function related(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid resource identifier." });
    const query = await scope(req);
    query.resourceId = req.params.id;
    const logs = await AuditLog.find(query).populate("actor", "name email role").sort({ createdAt: -1 }).limit(100);
    return res.json({ success: true, data: logs });
  } catch (error) { return next(error); }
}

async function stats(req, res, next) {
  try {
    const data = await AuditLog.aggregate([{ $match: await scope(req) }, { $group: { _id: "$action", count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    return res.json({ success: true, data });
  } catch (error) { return next(error); }
}

module.exports = { listAuditLogs, getAuditLog, related, stats };