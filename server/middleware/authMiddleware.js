const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }
    const payload = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
    const user = await User.findById(payload.sub).select("-passwordHash");
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Your session is no longer valid." });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired session." });
  }
}

module.exports = { requireAuth };