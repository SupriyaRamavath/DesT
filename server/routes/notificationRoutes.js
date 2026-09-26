const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const controller = require("../controllers/notificationController");

const router = express.Router();
router.use(requireAuth);
router.get("/", controller.listNotifications);
router.patch("/read-all", controller.markAllRead);
router.delete("/read", controller.clearRead);
router.patch("/:id/read", controller.markRead);
router.delete("/:id", controller.deleteNotification);

module.exports = router;