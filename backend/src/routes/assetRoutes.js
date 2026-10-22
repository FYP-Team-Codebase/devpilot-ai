const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const Asset = require("../models/Asset");
const Project = require("../models/Project");
const cloudinaryService = require("../services/cloudinaryService");

const router = express.Router();
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const ALLOWED = {
  "image/png": { extensions: [".png"], signature: (b) => b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), format: "png", resourceType: "image" },
  "image/jpeg": { extensions: [".jpg", ".jpeg"], signature: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff, format: "jpg", resourceType: "image" },
  "image/gif": { extensions: [".gif"], signature: (b) => b.subarray(0, 3).toString() === "GIF", format: "gif", resourceType: "image" },
  "image/webp": { extensions: [".webp"], signature: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP", format: "webp", resourceType: "image" },
  "application/pdf": { extensions: [".pdf"], signature: (b) => b.subarray(0, 5).toString() === "%PDF-", format: "pdf", resourceType: "raw" },
};
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 }, fileFilter(req, file, callback) {
  const type = ALLOWED[file.mimetype];
  const extension = require("node:path").extname(file.originalname).toLowerCase();
  if (!type || !type.extensions.includes(extension)) return callback(new Error("Unsupported file type. Upload PNG, JPG, GIF, WEBP, or PDF files."));
  callback(null, true);
} });

function safeAsset(asset) {
  return { id: String(asset._id), project: asset.project ? String(asset.project) : null, category: asset.category, originalFilename: asset.originalFilename, resourceType: asset.resourceType, format: asset.format, mimeType: asset.mimeType, size: asset.size, secureUrl: asset.secureUrl, status: asset.status, createdAt: asset.createdAt, updatedAt: asset.updatedAt };
}

router.post("/", (req, res, next) => {
  try { cloudinaryService.ensureConfigured(); } catch (error) { return res.status(503).json({ success: false, message: error.message }); }
  return upload.single("file")(req, res, next);
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "Choose a file to upload." });
  const detectedType = Object.entries(ALLOWED).find(([, value]) => value.signature(req.file.buffer));
  if (!detectedType || detectedType[0] !== req.file.mimetype || !detectedType[1].extensions.includes(require("node:path").extname(req.file.originalname).toLowerCase())) {
    return res.status(400).json({ success: false, message: "The file content does not match its file type." });
  }
  const category = req.body.category;
  if (!["general", "requirements", "inspiration"].includes(category)) return res.status(400).json({ success: false, message: "Invalid asset category." });
  let project = null;
  if (req.body.projectId) {
    if (!mongoose.Types.ObjectId.isValid(req.body.projectId)) return res.status(400).json({ success: false, message: "Invalid project ID." });
    project = await Project.findOne({ _id: req.body.projectId, user: req.userId }).select("_id");
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
  }
  if (category === "inspiration" && detectedType[1].resourceType !== "image") return res.status(400).json({ success: false, message: "Inspiration references must be images." });
  let cloudResult;
  let cloudCleanupFailed = false;
  try {
    const id = `devpilot/${req.userId}/${Date.now()}-${require("node:crypto").randomUUID()}`;
    cloudResult = await cloudinaryService.uploadBuffer(req.file.buffer, { public_id: id, resource_type: detectedType[1].resourceType, overwrite: false, unique_filename: false, filename_override: req.file.originalname, ...(detectedType[1].resourceType === "image" ? { format: detectedType[1].format } : {}) });
    const asset = await Asset.create({ owner: req.userId, project: project?._id || null, category, originalFilename: req.file.originalname.slice(0, 255), publicId: cloudResult.public_id, resourceType: cloudResult.resource_type, format: cloudResult.format || detectedType[1].format, mimeType: req.file.mimetype, size: req.file.size, secureUrl: cloudResult.secure_url });
    return res.status(201).json({ success: true, asset: safeAsset(asset) });
  } catch (error) {
    if (cloudResult?.public_id) {
      try { await cloudinaryService.deleteResource(cloudResult.public_id, cloudResult.resource_type); }
      catch (cleanupError) {
        cloudCleanupFailed = true;
        console.error("Cloudinary cleanup failed after metadata save failure:", cleanupError?.code || cleanupError?.name || "unknown error");
      }
    }
    console.error("Asset upload failed:", error?.code || error?.name || "unknown error");
    return res.status(502).json({ success: false, message: cloudCleanupFailed
      ? "Upload metadata could not be saved and cloud cleanup failed. The file may remain in cloud storage. Contact support before retrying."
      : "Could not save the uploaded file. Please try again." });
  }
});

router.get("/", async (req, res) => {
  const assets = await Asset.find({ owner: req.userId, status: { $in: ["active", "delete_pending"] } }).sort({ createdAt: -1 }).limit(200);
  return res.json({ success: true, assets: assets.map(safeAsset) });
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid asset ID." });
  const asset = await Asset.findOne({ _id: req.params.id, owner: req.userId, status: "active" });
  if (!asset) return res.status(404).json({ success: false, message: "Asset not found." });
  return res.json({ success: true, asset: safeAsset(asset) });
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid asset ID." });
  const asset = await Asset.findOne({ _id: req.params.id, owner: req.userId });
  if (!asset) return res.status(404).json({ success: false, message: "Asset not found." });
  asset.status = "delete_pending";
  await asset.save();
  try {
    const result = await cloudinaryService.deleteResource(asset.publicId, asset.resourceType);
    if (!result || !["ok", "not found"].includes(result.result)) throw new Error("Cloudinary did not confirm deletion.");
  } catch (error) {
    asset.status = "active";
    await asset.save().catch(() => {});
    console.error("Asset cloud deletion failed:", error?.code || error?.name || "unknown error");
    return res.status(502).json({ success: false, message: "Could not delete the cloud file. The asset is still available; try again." });
  }
  try {
    await Asset.deleteOne({ _id: asset._id, owner: req.userId });
  } catch (error) {
    console.error("Asset metadata deletion failed after cloud deletion:", error?.code || error?.name || "unknown error");
    return res.status(500).json({ success: false, message: "The cloud file was deleted, but its metadata cleanup is pending. Contact support if it remains listed." });
  }
  return res.json({ success: true, message: "Asset deleted successfully." });
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") return res.status(413).json({ success: false, message: "File is too large. The maximum upload size is 4 MB." });
  if (error instanceof multer.MulterError) return res.status(400).json({ success: false, message: "Upload one file at a time." });
  if (error.message?.startsWith("Unsupported file type")) return res.status(415).json({ success: false, message: error.message });
  console.error("Asset request failed:", error?.code || error?.name || "unknown error");
  return res.status(500).json({ success: false, message: "Could not process the asset request." });
});

module.exports = router;
