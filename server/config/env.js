const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";

const parsedPort = Number.parseInt(process.env.PORT || "5000", 10);
const port = !Number.isNaN(parsedPort) && parsedPort >= 1 && parsedPort <= 65535 ? parsedPort : 5000;
if (Number.isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
  console.warn(`[DesT Config] Invalid PORT "${process.env.PORT}". Falling back to port 5000.`);
}

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (nodeEnv === "production") {
    console.warn(
      "[DesT Config] WARNING: JWT_SECRET is not configured in production. Generating a temporary secret. For persistent sessions across restarts, set JWT_SECRET (32+ chars) in your environment variables."
    );
    jwtSecret = crypto.randomBytes(32).toString("hex");
  } else {
    jwtSecret = "dest-local-development-secret-change-me-32-chars";
  }
} else if (nodeEnv === "production" && jwtSecret.length < 32) {
  console.warn(
    `[DesT Config] WARNING: JWT_SECRET has only ${jwtSecret.length} characters (recommended: 32+). Using configured secret.`
  );
}

let clientUrl = process.env.CLIENT_URL;
if (!clientUrl) {
  if (nodeEnv === "production") {
    console.warn(
      "[DesT Config] NOTICE: CLIENT_URL is not configured in production. Defaulting to allow all origins (*). Set CLIENT_URL to your frontend domain (e.g. https://dest-app.vercel.app) to restrict access."
    );
    clientUrl = "*";
  } else {
    clientUrl = "http://localhost:5173";
  }
}

let mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  if (nodeEnv === "production") {
    console.error(
      "[DesT Config] CRITICAL: MONGODB_URI is not configured in production! Please set MONGODB_URI in your environment settings."
    );
    mongoUri = "";
  } else {
    mongoUri = "mongodb://127.0.0.1:27017/decisiontrace";
  }
}

const env = {
  nodeEnv,
  port,
  host: process.env.HOST || "0.0.0.0",
  clientUrl,
  mongoUri,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  aiApiKey: process.env.AI_API_KEY || "",
};

module.exports = env;