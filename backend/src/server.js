const dotenv = require("dotenv");

dotenv.config({ quiet: true });

const app = require("./app");
const connectDB = require("./config/database");

const PORT = process.env.PORT || 5000;

connectDB().catch((error) => {
  console.error("MongoDB connection failed:", error.message);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`DevPilot API running on port ${PORT}`);
});
