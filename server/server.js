const http = require("http");
const jwt = require("jsonwebtoken");
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
const io = new Server(server, {
  cors: { origin: env.clientUrl.split(",").map((origin) => origin.trim()) },
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
  socket.join(`user:${socket.user.sub}`);
});

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  cors({
    origin: env.clientUrl.split(",").map((origin) => origin.trim()),
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: false,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to DesT API",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "DesT API is running",
  });
});

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
    await connectDatabase();

    server.listen(env.port, () => {
      console.log(
        `DesT server running on http://localhost:${env.port}`
      );
    });
  } catch (error) {
    console.error("Unable to start DesT server:", error.message);
    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down server.`);

  server.close(async (error) => {
    if (error) {
      console.error("Error closing HTTP server:", error.message);
      process.exitCode = 1;
    }

    try {
      await disconnectDatabase();
    } catch (disconnectError) {
      console.error(
        "Error disconnecting MongoDB:",
        disconnectError.message
      );
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  server,
  io,
  startServer,
};
