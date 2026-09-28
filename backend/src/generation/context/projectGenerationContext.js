const {
  createTrustedInspirationIndex,
  loadTrustedInspirationManifest,
} = require("./inspirationManifestReader");

const GENERATION_METADATA = Object.freeze({
  target: "mern-web-application",
  frontend: "react-vite",
  backend: "node-express",
  database: "mongodb",
  outputSchemaVersion: 1,
});

const REQUIREMENT_ARRAY_FIELDS = [
  "designPreferences",
  "pages",
  "features",
  "devices",
];

const REQUIREMENT_STRING_FIELDS = ["projectType", "notes"];

class ProjectGenerationContextError extends Error {
  constructor(message, code = "PROJECT_CONTEXT_ERROR") {
    super(message);
    this.name = "ProjectGenerationContextError";
    this.code = code;
  }
}

function trimString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeRequirements(requirements) {
  const source = requirements && typeof requirements === "object" && !Array.isArray(requirements)
    ? requirements
    : {};

  const normalized = {};

  REQUIREMENT_STRING_FIELDS.forEach((field) => {
    normalized[field] = trimString(source[field]);
  });

  REQUIREMENT_ARRAY_FIELDS.forEach((field) => {
    normalized[field] = normalizeStringArray(source[field]);
  });

  return {
    projectType: normalized.projectType,
    designPreferences: normalized.designPreferences,
    pages: normalized.pages,
    features: normalized.features,
    devices: normalized.devices,
    notes: normalized.notes,
  };
}

function hasUnsafePercentEncoding(value) {
  let current = value;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (/%(?:2e|2f|5c)/i.test(current)) return true;

    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) return false;
      current = decoded;
    } catch {
      return true;
    }
  }

  return /%(?:2e|2f|5c)/i.test(current);
}

function isSafePublicInspirationPath(value) {
  if (typeof value !== "string" || !value.trim()) return false;

  const candidate = value.trim();

  if (!candidate.startsWith("/inspirations/")) return false;
  if (candidate.includes("\\") || candidate.includes("\0")) return false;
  if (candidate.includes("?") || candidate.includes("#")) return false;
  if (candidate.startsWith("//")) return false;
  if (/^(?:https?:)?\/\//i.test(candidate)) return false;
  if (/^[a-zA-Z]:[\\/]/.test(candidate)) return false;
  if (/(^|\/)\.\.?($|\/)/.test(candidate)) return false;
  if (hasUnsafePercentEncoding(candidate)) return false;

  let decoded;
  try {
    decoded = decodeURIComponent(candidate);
  } catch {
    return false;
  }

  if (!decoded.startsWith("/inspirations/")) return false;
  if (decoded.includes("\\") || decoded.includes("\0")) return false;

  const segments = decoded.split("/");
  if (segments.slice(1).some((segment) => segment === "" || segment === "." || segment === "..")) {
    return false;
  }

  return true;
}

function getTrustedReferencePath(entry) {
  const candidates = [entry?.galleryPreview, entry?.thumbnail, entry?.fullPage];

  if (Array.isArray(entry?.images)) {
    candidates.push(...entry.images.map((image) => image?.src));
  }

  return candidates.find(isSafePublicInspirationPath) || "";
}

function normalizeManifestText(value) {
  return trimString(value);
}

function normalizeManifestTags(value) {
  return normalizeStringArray(value);
}

function projectManifestEntry(entry, persistedId) {
  if (typeof entry?.id !== "string" || entry.id !== persistedId) return null;

  const referencePath = getTrustedReferencePath(entry);
  if (!referencePath) return null;

  return {
    id: entry.id,
    source: "devpilot",
    title: normalizeManifestText(entry.title),
    category: normalizeManifestText(entry.category),
    type: normalizeManifestText(entry.type),
    style: normalizeManifestText(entry.style),
    tags: normalizeManifestTags(entry.tags),
    referenceImage: {
      path: referencePath,
    },
  };
}

function normalizeProjectId(value) {
  if (value === null || value === undefined) return "";
  return trimString(String(value));
}

async function buildProjectGenerationContext(project, { manifestLoader = loadTrustedInspirationManifest } = {}) {
  if (!project || typeof project !== "object") {
    throw new ProjectGenerationContextError(
      "A persisted project is required to build generation context.",
      "MISSING_PROJECT"
    );
  }

  let manifest;
  try {
    manifest = await manifestLoader();
  } catch (error) {
    if (error instanceof ProjectGenerationContextError) throw error;

    const wrapped = new ProjectGenerationContextError(
      "Trusted inspiration manifest could not be loaded.",
      "INSPIRATION_MANIFEST_ERROR"
    );
    throw wrapped;
  }

  let inspirationIndex;
  try {
    inspirationIndex = createTrustedInspirationIndex(manifest);
  } catch (error) {
    const wrapped = new ProjectGenerationContextError(
      "Trusted inspiration manifest is invalid.",
      "INVALID_INSPIRATION_MANIFEST"
    );
    throw wrapped;
  }

  const inspirations = [];
  const seenIds = new Set();
  const persistedInspirations = Array.isArray(project.inspirations)
    ? project.inspirations
    : [];

  persistedInspirations.forEach((persisted) => {
    const source = trimString(persisted?.source).toLowerCase();
    const id = typeof persisted?.inspirationId === "string"
      ? persisted.inspirationId.trim()
      : "";

    if (source !== "devpilot" || !id || seenIds.has(id)) return;

    const resolved = projectManifestEntry(inspirationIndex.get(id), id);
    if (!resolved) return;

    seenIds.add(id);
    inspirations.push(resolved);
  });

  return {
    schemaVersion: 1,
    project: {
      id: normalizeProjectId(project._id),
      name: trimString(project.projectName),
      prompt: trimString(project.prompt),
    },
    requirements: normalizeRequirements(project.requirements),
    inspirations,
    generation: {
      ...GENERATION_METADATA,
    },
  };
}

module.exports = {
  ProjectGenerationContextError,
  buildProjectGenerationContext,
  isSafePublicInspirationPath,
  normalizeRequirements,
};
