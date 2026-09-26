const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt,
});

const issueToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    algorithm: "HS256",
  });

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ success: false, message: "Name, email and a password of at least 8 characters are required." });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
      role: "developer",
    });
    return res.status(201).json({ success: true, token: issueToken(user), user: serializeUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const user = await User.findOne({ email: (req.body.email || "").trim().toLowerCase() }).select("+passwordHash");
    if (!user || !user.isActive || !(await bcrypt.compare(req.body.password || "", user.passwordHash))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }
    user.lastLoginAt = new Date();
    await user.save();
    return res.json({ success: true, token: issueToken(user), user: serializeUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const updates = {};
    if (typeof req.body.name === "string") updates.name = req.body.name.trim();
    if (typeof req.body.email === "string") updates.email = req.body.email.trim().toLowerCase();
    if (!updates.name || !updates.email) return res.status(400).json({ success: false, message: "Name and email are required." });
    const existing = await User.findOne({ email: updates.email, _id: { $ne: req.user._id } });
    if (existing) return res.status(409).json({ success: false, message: "That email is already in use." });
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
    return res.json({ success: true, user: serializeUser(user) });
  } catch (error) { return next(error); }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) return res.status(400).json({ success: false, message: "Current password and a new password of at least 8 characters are required." });
    const user = await User.findById(req.user._id).select("+passwordHash");
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) return res.status(400).json({ success: false, message: "Current password is incorrect." });
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    return res.json({ success: true, message: "Password changed successfully." });
  } catch (error) { return next(error); }
}

function me(req, res) {
  return res.json({ success: true, user: serializeUser(req.user) });
}

module.exports = { register, login, me, updateProfile, changePassword };