const express = require("express");
const { register, login, me, updateProfile, changePassword } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.patch("/profile", requireAuth, updateProfile);
router.patch("/password", requireAuth, changePassword);
router.post("/logout", (req, res) => res.json({ success: true }));

module.exports = router;