const http = require("http");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const {
  connectDatabase,
  disconnectDatabase,
} = require("./config/db");
const {
  notFoundMiddleware,
  errorMiddleware,
} = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const decisionRoutes = require("./routes/decisionRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const auditRoutes = require("./routes/auditRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const server = http.createServer(app);

// Helper to normalize origins (strip trailing slashes, trim)
function normalizeOrigin(url) {
  if (!url) return "";
  return url.trim().replace(/\/+$/, "");
}

// Build list of allowed origins from CLIENT_URL
const configuredOrigins = (env.clientUrl || "*")
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const isWildcardAllowed = configuredOrigins.includes("*");

function isOriginAllowed(origin) {
  // Allow requests without an origin (curl, server-to-server, health check probes)
  if (!origin) return true;
  if (isWildcardAllowed) return true;

  const normalized = normalizeOrigin(origin);
  if (configuredOrigins.includes(normalized)) return true;

  // Always allow localhost in development or for local testing
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized)) {
    return true;
  }

  // Allow Vercel preview deployments if clientUrl is a vercel.app domain
  if (normalized.endsWith(".vercel.app") && configuredOrigins.some((o) => o.includes("vercel.app"))) {
    return true;
  }

  return false;
}

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, isOriginAllowed(origin));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.set("io", io);

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required."));
    socket.user = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
    return next();
  } catch {
    return next(new Error("Invalid or expired session."));
  }
});

io.on("connection", (socket) => {
  if (socket.user?.sub) {
    socket.join(`user:${socket.user.sub}`);
  }
});

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      // If origin is not strictly matched, allow it in non-production or log notice
      if (env.nodeEnv !== "production") {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));

// Health check handler for platforms like Render, Railway, AWS ALB, GCP, Kubernetes
function healthHandler(req, res) {
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const dbState = dbStates[mongoose.connection.readyState] || "unknown";

  res.status(200).json({
    success: true,
    status: "healthy",
    message: "DesT API is running",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: {
      status: dbState,
      connected: mongoose.connection.readyState === 1,
    },
    version: "1.0.0",
  });
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to DesT API",
    healthCheck: "/api/health",
  });
});

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

app.use("/api/auth", authRoutes);
app.use("/api/decisions", decisionRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

async function startServer() {
  try {
    const host = env.host || "0.0.0.0";

    // Bind to the port immediately so cloud providers detect health check without delay
    server.listen(env.port, host, () => {
      console.log(`DesT server running on http://${host}:${env.port}`);
      console.log(`Environment: ${env.nodeEnv}`);
      console.log(`Health check: http://${host}:${env.port}/api/health`);
    });

    // Connect to database in the background with retries
    connectDatabase().catch((dbError) => {
      console.error("Initial database connection error:", dbError.message);
    });
  } catch (error) {
    console.error("Unable to start DesT server:", error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down server gracefully.`);

  const forceTimeout = setTimeout(() => {
    console.error("Forceful shutdown after timeout.");
    process.exit(1);
  }, 5000);
  forceTimeout.unref();

  server.close(async (error) => {
    if (error) {
      console.error("Error closing HTTP server:", error.message);
    }
    try {
      await disconnectDatabase();
      console.log("Database disconnected.");
    } catch (disconnectError) {
      console.error("Error disconnecting MongoDB:", disconnectError.message);
    }
    process.exit(error ? 1 : 0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  server,
  io,
  startServer,
};

