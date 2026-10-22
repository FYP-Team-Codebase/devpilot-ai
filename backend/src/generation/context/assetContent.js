const fs = require("node:fs/promises");
const path = require("node:path");
const cloudinaryService = require("../../services/cloudinaryService");

const PUBLIC_ROOT = path.resolve(__dirname, "../../../../public");

function mimeTypeForImagePath(imagePath) {
  const extension = path.extname(imagePath).toLowerCase();
  return ({ ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" })[extension] || "";
}

async function readTrustedInspirationImage(imagePath) {
  const decoded = decodeURIComponent(imagePath);
  const filePath = path.resolve(PUBLIC_ROOT, `.${decoded}`);
  if (!filePath.startsWith(`${PUBLIC_ROOT}${path.sep}`)) throw new Error("Trusted inspiration path is invalid.");
  const mimeType = mimeTypeForImagePath(filePath);
  if (!mimeType) throw new Error("Trusted inspiration format is unsupported.");
  const bytes = await fs.readFile(filePath);
  return { bytes, mimeType };
}

function imageDataUrl(buffer, mimeType) {
  const signatures = {
    "image/png": (bytes) => bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    "image/jpeg": (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
    "image/gif": (bytes) => ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString()),
    "image/webp": (bytes) => bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP",
  };
  if (!Buffer.isBuffer(buffer) || !signatures[mimeType]?.(buffer)) throw new Error("Image content did not match its stored file type.");
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

async function extractPdfText(buffer) {
  // pdf-parse's Node build needs DOMMatrix/ImageData/Path2D before it loads.
  // Its worker entry initializes those globals from @napi-rs/canvas and is
  // specifically recommended for serverless deployments. Keep both imports
  // lazy so app startup does not load native PDF/rendering modules.
  const { CanvasFactory } = require("pdf-parse/worker");
  const { PDFParse } = require("pdf-parse");
  const parser = new PDFParse({ data: buffer, CanvasFactory });
  try {
    const result = await parser.getText();
    return String(result.text || "").trim();
  } finally {
    await parser.destroy();
  }
}

async function readCloudAsset(asset) {
  return cloudinaryService.downloadAsset(asset);
}

module.exports = { extractPdfText, imageDataUrl, readCloudAsset, readTrustedInspirationImage };
