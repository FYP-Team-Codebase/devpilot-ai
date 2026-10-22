const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null, index: true },
  category: { type: String, enum: ["general", "requirements", "inspiration"], required: true, index: true },
  originalFilename: { type: String, required: true, trim: true, maxlength: 255 },
  publicId: { type: String, required: true, unique: true },
  resourceType: { type: String, enum: ["image", "raw"], required: true },
  format: { type: String, required: true, lowercase: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true, min: 1, max: 4 * 1024 * 1024 },
  secureUrl: { type: String, required: true },
  status: { type: String, enum: ["active", "delete_pending"], default: "active", index: true },
}, { timestamps: true });

module.exports = mongoose.models.Asset || mongoose.model("Asset", assetSchema);
