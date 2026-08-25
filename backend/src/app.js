const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config({ quiet: true });
dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });

const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");

const app = express();

const getAllowedOrigins = () => {
  const configuredOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",")
    : ["http://localhost:5173"];

  return configuredOrigins.map((origin) => origin.trim()).filter(Boolean);
};

const corsOptions = {
  origin(origin, callback) {
    if (!origin || getAllowedOrigins().includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
};

const requireDatabase = async (req, res, next) => {
  try {
    await connectDB();
    return next();
  } catch (error) {
    console.error("Database connection failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "DevPilot API is running",
  });
});

app.use("/api/auth", requireDatabase, authRoutes);

module.exports = app;
