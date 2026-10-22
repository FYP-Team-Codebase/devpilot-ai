const cloudinary = require("cloudinary").v2;
const { Readable } = require("node:stream");
const MAX_ASSET_BYTES = 4 * 1024 * 1024;

const isConfigured = () => Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

function ensureConfigured() {
  if (!isConfigured()) {
    const error = new Error("File uploads are not configured on this server.");
    error.code = "CLOUDINARY_NOT_CONFIGURED";
    throw error;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function uploadBuffer(buffer, options) {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    Readable.from(buffer).pipe(upload);
  });
}

async function deleteResource(publicId, resourceType) {
  ensureConfigured();
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
}

async function downloadAsset(asset) {
  ensureConfigured();
  const url = new URL(asset?.secureUrl || "");
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" || url.pathname.split("/")[1] !== cloudName) {
    throw new Error("Stored asset delivery URL is invalid.");
  }
  const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15000) });
  if (!response.ok || response.status >= 300) throw new Error("Stored asset could not be downloaded.");
  const declaredSize = Number(response.headers.get("content-length") || 0);
  if (declaredSize > MAX_ASSET_BYTES || (asset.size && declaredSize && declaredSize > asset.size + 1024)) throw new Error("Stored asset exceeds the processing limit.");
  const chunks = [];
  let total = 0;
  for await (const chunk of response.body) {
    total += chunk.length;
    if (total > MAX_ASSET_BYTES || (asset.size && total > asset.size + 1024)) {
      await response.body.cancel().catch(() => {});
      throw new Error("Stored asset exceeds the processing limit.");
    }
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks, total);
  if (!buffer.length || buffer.length > MAX_ASSET_BYTES) throw new Error("Stored asset exceeds the processing limit.");
  return buffer;
}

module.exports = { isConfigured, ensureConfigured, uploadBuffer, deleteResource, downloadAsset };
