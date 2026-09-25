const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const controller = require("../controllers/reviewController");

const router = express.Router();
router.use(requireAuth, requireRole("admin", "reviewer"));
router.get("/", controller.listReviews);
router.get("/decision/:decisionId", async (req, res, next) => {
  req.query.decision = req.params.decisionId;
  return controller.listReviews(req, res, next);
});
router.post("/", controller.createReview);
router.get("/:id", controller.getReview);
router.patch("/:id/approve", controller.setReviewStatus);
router.patch("/:id/reject", controller.setReviewStatus);
router.patch("/:id/modify", controller.setReviewStatus);
router.patch("/:id/request-more-information", controller.setReviewStatus);
router.patch("/:id", controller.updateReview);
router.delete("/:id", controller.deleteReview);
module.exports = router;