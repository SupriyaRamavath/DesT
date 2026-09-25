const dotenv = require("dotenv");

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const port = Number.parseInt(process.env.PORT || "5000", 10);

if (Number.isNaN(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port number.");
}

const env = {
  nodeEnv,
  port,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/decisiontrace",
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  aiApiKey: process.env.AI_API_KEY,
};

if (nodeEnv === "production") {
  if (!env.jwtSecret || env.jwtSecret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters in production.");
  }

  if (nodeEnv !== "test" && !env.jwtSecret) {
    throw new Error("JWT_SECRET must be configured outside test environments.");
  }
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be configured in production.");
  }
  if (!process.env.CLIENT_URL) {
    throw new Error("CLIENT_URL must be configured in production.");
  }
}

module.exports = env;