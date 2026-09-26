const mongoose = require("mongoose");
const env = require("./env");

let listenersAttached = false;

function setupConnectionListeners() {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully.");
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected.");
  });
}

async function connectDatabase(maxRetries = 5, retryDelayMs = 3000) {
  setupConnectionListeners();

  if (!env.mongoUri) {
    console.warn(
      "[MongoDB] Skipping connection: MONGODB_URI is not set. Database operations will be unavailable."
    );
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[MongoDB] Connecting to database (attempt ${attempt}/${maxRetries})...`);
      await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      return true;
    } catch (error) {
      console.error(`[MongoDB] Connection attempt ${attempt} failed: ${error.message}`);
      if (attempt < maxRetries) {
        console.log(`[MongoDB] Retrying in ${retryDelayMs / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      } else {
        console.error(
          "[MongoDB] Could not establish connection. If using MongoDB Atlas, make sure you have allowed access from anywhere (0.0.0.0/0) in Network Access, and verify your username and password."
        );
      }
    }
  }
  return false;
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
};