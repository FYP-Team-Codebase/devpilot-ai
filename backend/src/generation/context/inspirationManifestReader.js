const fs = require("fs");
const path = require("path");

const MANIFEST_PATH = path.resolve(__dirname, "../../../../public/inspirations/manifest.json");

class InspirationManifestError extends Error {
  constructor(message, code = "INSPIRATION_MANIFEST_ERROR") {
    super(message);
    this.name = "InspirationManifestError";
    this.code = code;
  }
}

function parseManifest(contents) {
  let manifest;

  try {
    manifest = JSON.parse(contents);
  } catch {
    throw new InspirationManifestError(
      "Trusted inspiration manifest is malformed.",
      "MALFORMED_INSPIRATION_MANIFEST"
    );
  }

  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new InspirationManifestError(
      "Trusted inspiration manifest is invalid.",
      "INVALID_INSPIRATION_MANIFEST"
    );
  }

  if (!Array.isArray(manifest.inspirations)) {
    throw new InspirationManifestError(
      "Trusted inspiration manifest is invalid.",
      "INVALID_INSPIRATION_MANIFEST"
    );
  }

  return manifest;
}

async function loadTrustedInspirationManifest({ readFile = fs.promises.readFile } = {}) {
  let contents;

  try {
    contents = await readFile(MANIFEST_PATH, "utf8");
  } catch {
    throw new InspirationManifestError(
      "Trusted inspiration manifest could not be loaded.",
      "MISSING_INSPIRATION_MANIFEST"
    );
  }

  return parseManifest(contents);
}

function createTrustedInspirationIndex(manifest) {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new InspirationManifestError(
      "Trusted inspiration manifest is invalid.",
      "INVALID_INSPIRATION_MANIFEST"
    );
  }

  if (!Array.isArray(manifest.inspirations)) {
    throw new InspirationManifestError(
      "Trusted inspiration manifest is invalid.",
      "INVALID_INSPIRATION_MANIFEST"
    );
  }

  const index = new Map();

  manifest.inspirations.forEach((entry) => {
    if (typeof entry?.id !== "string" || !entry.id.trim()) return;
    if (!index.has(entry.id)) index.set(entry.id, entry);
  });

  return index;
}

module.exports = {
  MANIFEST_PATH,
  InspirationManifestError,
  createTrustedInspirationIndex,
  loadTrustedInspirationManifest,
  parseManifest,
};
