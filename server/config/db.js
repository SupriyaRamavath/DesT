const mongoose = require("mongoose");
const env = require("./env");

async function connectDatabase() {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected.");
  });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error.message);
  });

  await mongoose.connect(env.mongoUri);
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
};