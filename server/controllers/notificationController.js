const mongoose = require("mongoose");
const Notification = require("../models/Notification");

function recipientQuery(user) {
  return { recipient: user._id };
}

async function listNotifications(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const notifications = await Notification.find(recipientQuery(req.user))
      .populate("relatedDecision", "externalDecisionId title")
      .sort({ createdAt: -1 }).limit(limit).lean();
    return res.json({ success: true, data: notifications });
  } catch (error) { return next(error); }
}

async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany({ ...recipientQuery(req.user), isRead: false }, { $set: { isRead: true } });
    return res.json({ success: true });
  } catch (error) { return next(error); }
}

async function markRead(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid notification identifier." });
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, ...recipientQuery(req.user) }, { $set: { isRead: true } }, { new: true });
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found." });
    return res.json({ success: true, data: notification });
  } catch (error) { return next(error); }
}

async function deleteNotification(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid notification identifier." });
    const result = await Notification.deleteOne({ _id: req.params.id, ...recipientQuery(req.user) });
    if (!result.deletedCount) return res.status(404).json({ success: false, message: "Notification not found." });
    return res.json({ success: true });
  } catch (error) { return next(error); }
}

async function clearRead(req, res, next) {
  try {
    await Notification.deleteMany({ ...recipientQuery(req.user), isRead: true });
    return res.json({ success: true });
  } catch (error) { return next(error); }
}

module.exports = { listNotifications, markAllRead, markRead, deleteNotification, clearRead };