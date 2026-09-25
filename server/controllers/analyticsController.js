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
    const [totalDecisions, byStatus, byRisk] = await Promise.all([
      Decision.countDocuments(match),
      Decision.aggregate([{ $match: match }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      Decision.aggregate([{ $match: match }, { $group: { _id: "$riskLevel", count: { $sum: 1 } } }]),
    ]);
    return res.json({ success: true, data: { totalDecisions, byStatus, byRisk } });
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
    const data = await Decision.aggregate([{ $match: dates(req, await baseMatch(req)) }, { $group: { _id: "$application", decisions: { $sum: 1 }, averageConfidence: { $avg: "$confidence" } } }, { $sort: { decisions: -1 } }]);
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