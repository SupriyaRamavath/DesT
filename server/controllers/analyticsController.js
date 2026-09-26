const Decision = require("../models/Decision");
const AIApplication = require("../models/AIApplication");
const HumanReview = require("../models/HumanReview");

async function baseMatch(req) {
  if (req.user.role === "admin") return {};
  const apps = await AIApplication.find({ owner: req.user._id }).select("_id");
  return { application: { $in: apps.map((app) => app._id) } };
}
function dates(req, match) {
  if (req.query.from || req.query.to) {
    match.createdAt = {};
    if (req.query.from && !Number.isNaN(Date.parse(req.query.from))) match.createdAt.$gte = new Date(req.query.from);
    if (req.query.to && !Number.isNaN(Date.parse(req.query.to))) match.createdAt.$lte = new Date(req.query.to);
  }
  return match;
}
async function dashboard(req, res, next) {
  try {
    const match = dates(req, await baseMatch(req));
    const [totalDecisions, byStatus, byRisk, volume, outcomes, confidence, processing, reviewStats] = await Promise.all([
      Decision.countDocuments(match),
      Decision.aggregate([{ $match: match }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      Decision.aggregate([{ $match: match }, { $group: { _id: "$riskLevel", count: { $sum: 1 } } }]),
      Decision.aggregate([{ $match: match }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Decision.aggregate([{ $match: match }, { $group: { _id: "$output.decision", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Decision.aggregate([{ $match: match }, { $bucket: { groupBy: "$confidence", boundaries: [0, 0.2, 0.4, 0.6, 0.8, 1.01], default: "unknown", output: { count: { $sum: 1 } } } }]),
      Decision.aggregate([{ $match: match }, { $match: { startedAt: { $ne: null }, completedAt: { $ne: null } } }, { $project: { duration: { $subtract: ["$completedAt", "$startedAt"] } } }, { $group: { _id: null, averageMs: { $avg: "$duration" } } }]),
      (async () => {
        const decisions = await Decision.find(match).select("_id");
        return HumanReview.aggregate([{ $match: { decision: { $in: decisions.map((item) => item._id) } } }, { $group: { _id: "$status", count: { $sum: 1 } } }]);
      })(),
    ]);
    const statusCount = (name) => byStatus.find((item) => item._id === name)?.count || 0;
    const averageConfidence = await Decision.aggregate([{ $match: match }, { $group: { _id: null, value: { $avg: "$confidence" } } }]);
    return res.json({ success: true, data: {
      totalDecisions, byStatus, byRisk, volume, outcomes, confidence, reviewStats,
      averageConfidence: averageConfidence[0]?.value ?? null,
      averageProcessingMs: processing[0]?.averageMs ?? null,
      approvalRate: totalDecisions ? statusCount("completed") / totalDecisions : 0,
      reviewRate: totalDecisions ? (statusCount("flagged") + statusCount("reviewed")) / totalDecisions : 0,
      highRiskRate: totalDecisions ? byRisk.filter((item) => ["high", "critical"].includes(item._id)).reduce((sum, item) => sum + item.count, 0) / totalDecisions : 0,
    } });
  } catch (error) { return next(error); }
}
async function grouped(req, res, next) {
  try {
    const match = dates(req, await baseMatch(req));
    const group = req.path.endsWith("/risk") ? "$riskLevel" : "$status";
    const data = await Decision.aggregate([{ $match: match }, { $group: { _id: group, count: { $sum: 1 }, averageConfidence: { $avg: "$confidence" } } }, { $sort: { count: -1 } }]);
    return res.json({ success: true, data });
  } catch (error) { return next(error); }
}
async function applications(req, res, next) {
  try {
    const data = await Decision.aggregate([{ $match: dates(req, await baseMatch(req)) }, { $group: { _id: "$application", decisions: { $sum: 1 }, averageConfidence: { $avg: "$confidence" }, highRisk: { $sum: { $cond: [{ $in: ["$riskLevel", ["high", "critical"]] }, 1, 0] } }, reviews: { $sum: { $cond: [{ $in: ["$status", ["flagged", "reviewed"]] }, 1, 0] } } } }, { $lookup: { from: "aiapplications", localField: "_id", foreignField: "_id", as: "application" } }, { $unwind: "$application" }, { $project: { _id: 1, name: "$application.name", decisions: 1, averageConfidence: 1, highRisk: 1, reviews: 1 } }, { $sort: { decisions: -1 } }]);
    return res.json({ success: true, data });
  } catch (error) { return next(error); }
}
async function reviews(req, res, next) {
  try {
    const decisions = await Decision.find(await baseMatch(req)).select("_id");
    const data = await HumanReview.aggregate([{ $match: { decision: { $in: decisions.map((item) => item._id) } } }, { $group: { _id: "$action", count: { $sum: 1 } } }]);
    return res.json({ success: true, data });
  } catch (error) { return next(error); }
}
module.exports = { dashboard, grouped, applications, reviews, summary: dashboard };