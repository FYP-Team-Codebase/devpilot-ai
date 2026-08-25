const mongoose = require("mongoose");

let connectionPromise = null;
let hasLoggedConnection = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: Number(
          process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000
        ),
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  await connectionPromise;

  if (!hasLoggedConnection) {
    console.log("MongoDB connected successfully");
    hasLoggedConnection = true;
  }

  return mongoose.connection;
};

module.exports = connectDB;
