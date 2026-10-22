const {
  createTrustedInspirationIndex,
  loadTrustedInspirationManifest,
} = require("./inspirationManifestReader");
const Asset = require("../../models/Asset");
const mongoose = require("mongoose");
const { extractPdfText, imageDataUrl, readCloudAsset, readTrustedInspirationImage } = require("./assetContent");

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

async function buildProjectGenerationContext(project, {
  manifestLoader = loadTrustedInspirationManifest,
  assetLoader = (query) => Asset.find(query),
  assetReader = readCloudAsset,
  pdfTextExtractor = extractPdfText,
  inspirationImageReader = readTrustedInspirationImage,
} = {}) {
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
  const visualReferences = [];
  const attachments = [];
  const assetManifest = [];
  let remainingExtractedTextChars = 50000;
  let imageBytesUsed = 0;
  const addImageReference = (reference) => {
    if (visualReferences.length >= 20) {
      throw new ProjectGenerationContextError("This project has more than 20 visual references. Remove some images before generating.", "ASSET_PROCESSING_FAILED");
    }
    const bytes = reference.bytes;
    const { bytes: _bytes, ...metadata } = reference;
    imageBytesUsed += bytes.length;
    if (imageBytesUsed > 12 * 1024 * 1024) {
      throw new ProjectGenerationContextError("The selected images exceed the generation limit. Remove some images and try again.", "ASSET_PROCESSING_FAILED");
    }
    visualReferences.push({ ...metadata, url: imageDataUrl(bytes, reference.mimeType) });
  };
  const requirementIds = Array.isArray(project.requirements?.assetIds) ? [...new Set(project.requirements.assetIds.map(String))] : [];
  const configuredSelections = Array.isArray(project.assetSelections) ? project.assetSelections : [];
  const configuredIds = new Set(configuredSelections.map((item) => String(item?.assetId || "")));
  const configuredSpecs = configuredSelections.map((item) => ({
    id: String(item?.assetId || ""),
    purpose: trimString(item?.purpose) || "content-image",
    customPurpose: trimString(item?.customPurpose),
    placement: trimString(item?.placement) || "ai",
    placementDetails: trimString(item?.placementDetails),
    instructions: trimString(item?.instructions),
  }));
  const selectedAssetIds = [
    ...configuredSpecs.map((item) => item.id),
    ...requirementIds,
    ...(Array.isArray(project.inspirations) ? project.inspirations
      .filter((item) => trimString(item?.source).toLowerCase() === "userasset")
      .map((item) => String(item?.assetId || "")) : []),
  ];
  const uniqueAssetIds = [...new Set(selectedAssetIds)];
  if (uniqueAssetIds.length > 20) {
    throw new ProjectGenerationContextError("This project has more than 20 attached files. Remove some assets before generating.", "ASSET_PROCESSING_FAILED");
  }
  if (uniqueAssetIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw new ProjectGenerationContextError("A selected upload is no longer available. Remove it and select an available asset.", "ASSET_UNAVAILABLE");
  }
  const assets = uniqueAssetIds.length
    ? await assetLoader({ _id: { $in: uniqueAssetIds }, owner: project.user, status: "active" })
    : [];
  const assetsById = new Map(assets.map((asset) => [String(asset._id), asset]));
  if (assetsById.size !== uniqueAssetIds.length) {
    throw new ProjectGenerationContextError("A selected upload is no longer available. Remove it and select an available asset.", "ASSET_UNAVAILABLE");
  }

  for (const selection of configuredSpecs) {
    const { id, purpose, customPurpose, placement, placementDetails, instructions } = selection;
    const asset = assetsById.get(id);
    if (!asset || !/^https:\/\//i.test(asset.secureUrl || "")) {
      throw new ProjectGenerationContextError("A selected asset is unavailable. Remove it from this project or reupload it before retrying.", "ASSET_UNAVAILABLE");
    }
    const isPdf = asset.mimeType === "application/pdf";
    if ((purpose === "requirements-document") !== isPdf) {
      throw new ProjectGenerationContextError("A selected asset purpose does not match its file type. Update the purpose and retry.", "ASSET_PROCESSING_FAILED");
    }
    const manifestItem = {
      assetId: id,
      filename: asset.originalFilename,
      trustedReference: asset.secureUrl,
      mimeType: asset.mimeType,
      size: asset.size,
      purpose,
      customPurpose,
      placement,
      placementDetails,
      instructions,
    };
    if (isPdf) {
      let extractedText;
      try {
        extractedText = await pdfTextExtractor(await assetReader(asset));
      } catch (error) {
        console.error("Generation attachment processing failed:", { assetId: id, category: "project-selection", reason: error?.code || error?.name || "unknown error" });
        throw new ProjectGenerationContextError(`The selected requirements document ${asset.originalFilename} could not be retrieved or read. Remove it or reupload it before retrying.`, "ASSET_PROCESSING_FAILED");
      }
      const text = String(extractedText || "");
      if (!text.trim()) {
        throw new ProjectGenerationContextError(`The requirements document ${asset.originalFilename} has no extractable text. Scanned PDFs are not supported; add its requirements in the project prompt or upload a text-based PDF.`, "ASSET_PROCESSING_FAILED");
      }
      if (text.length > remainingExtractedTextChars) {
        throw new ProjectGenerationContextError("The selected PDFs contain more extracted text than this generation can safely process. Reduce the number or size of the attachments and retry.", "ASSET_PROCESSING_FAILED");
      }
      remainingExtractedTextChars -= text.length;
      manifestItem.extraction = "text-extracted";
      manifestItem.extractedText = text;
      attachments.push({ id, filename: asset.originalFilename, mimeType: asset.mimeType, size: asset.size, extraction: manifestItem.extraction, extractedText: text });
    } else if (asset.resourceType === "image" && /^image\/(?:png|jpeg|gif|webp)$/.test(asset.mimeType)) {
      manifestItem.content = "image-input";
      try {
        addImageReference({ assetId: id, category: "project-selection", role: purpose === "design-reference" ? "visual-inspiration" : "content-asset", purpose, customPurpose, placement, placementDetails, instructions, label: asset.originalFilename, mimeType: asset.mimeType, bytes: await assetReader(asset) });
      } catch (error) {
        if (error instanceof ProjectGenerationContextError) throw error;
        console.error("Generation asset processing failed:", { assetId: id, category: "project-selection", reason: error?.code || error?.name || "unknown error" });
        throw new ProjectGenerationContextError(`The selected image ${asset.originalFilename} could not be retrieved or read. Remove it or reupload it before retrying.`, "ASSET_PROCESSING_FAILED");
      }
    } else {
      throw new ProjectGenerationContextError(`The selected asset ${asset.originalFilename} has an unsupported format. Use a supported image or PDF.`, "ASSET_PROCESSING_FAILED");
    }
    assetManifest.push(manifestItem);
  }

  for (const id of requirementIds.filter((assetId) => !configuredIds.has(assetId))) {
    const asset = assetsById.get(id);
    if (!asset || asset.category !== "requirements") {
      throw new ProjectGenerationContextError("A selected requirements attachment is no longer available. Remove it and select an available file.", "ASSET_UNAVAILABLE");
    }
    const attachment = {
      id,
      filename: asset.originalFilename,
      mimeType: asset.mimeType,
      size: asset.size,
    };
    if (asset.mimeType === "application/pdf") {
      let extractedText;
      try {
        extractedText = await pdfTextExtractor(await assetReader(asset));
      } catch (error) {
        console.error("Generation attachment processing failed:", { assetId: id, category: "requirements", reason: error?.code || error?.name || "unknown error" });
        throw new ProjectGenerationContextError("A selected requirements PDF could not be retrieved or read. Remove it or reupload it before retrying.", "ASSET_PROCESSING_FAILED");
      }
      const text = String(extractedText || "");
      if (!text.trim()) {
        throw new ProjectGenerationContextError(`The requirements document ${asset.originalFilename} has no extractable text. Scanned PDFs are not supported; add its requirements in the project prompt or upload a text-based PDF.`, "ASSET_PROCESSING_FAILED");
      }
      if (text.length > remainingExtractedTextChars) {
        throw new ProjectGenerationContextError("The selected PDFs contain more extracted text than this generation can safely process. Reduce the number or size of the attachments and retry.", "ASSET_PROCESSING_FAILED");
      }
      remainingExtractedTextChars -= text.length;
      attachment.extraction = "text-extracted";
      attachment.extractedText = text;
    } else if (asset.resourceType === "image" && /^image\/(?:png|jpeg|gif|webp)$/.test(asset.mimeType)) {
      attachment.extraction = "image-input";
      attachment.role = "content-asset";
      attachment.assetUrl = asset.secureUrl;
      try {
        addImageReference({ assetId: id, category: "requirements", role: "content-asset", label: asset.originalFilename, mimeType: asset.mimeType, bytes: await assetReader(asset) });
      } catch (error) {
        if (error instanceof ProjectGenerationContextError) throw error;
        console.error("Generation attachment processing failed:", { assetId: id, category: "requirements", reason: error?.code || error?.name || "unknown error" });
        throw new ProjectGenerationContextError("A selected image asset could not be retrieved or read. Remove it or reupload it before retrying.", "ASSET_PROCESSING_FAILED");
      }
    } else {
      throw new ProjectGenerationContextError("A selected requirements asset has an unsupported format. Use a PDF or PNG, JPG, GIF, or WEBP image.", "ASSET_PROCESSING_FAILED");
    }
    attachments.push(attachment);
    assetManifest.push({
      assetId: id,
      filename: asset.originalFilename,
      trustedReference: asset.secureUrl,
      mimeType: asset.mimeType,
      size: asset.size,
      purpose: asset.mimeType === "application/pdf" ? "requirements-document" : "content-image",
      customPurpose: "",
      placement: "ai",
      placementDetails: "",
      instructions: "",
      ...(asset.mimeType === "application/pdf" ? { extraction: attachment.extraction, extractedText: attachment.extractedText } : { content: "image-input" }),
    });
  }

  const seenIds = new Set();
  const persistedInspirations = Array.isArray(project.inspirations)
    ? project.inspirations
    : [];

  for (const persisted of persistedInspirations) {
    const source = trimString(persisted?.source).toLowerCase();
    const id = typeof persisted?.inspirationId === "string"
      ? persisted.inspirationId.trim()
      : "";

    if (source === "userasset") {
      const assetId = trimString(String(persisted?.assetId || ""));
      if (configuredIds.has(assetId)) continue;
      if (!mongoose.Types.ObjectId.isValid(assetId)) {
        throw new ProjectGenerationContextError("A selected inspiration is no longer available. Remove it and select an available image.", "ASSET_UNAVAILABLE");
      }
      if (seenIds.has(assetId)) continue;
      const asset = assetsById.get(assetId);
      if (!asset || asset.category !== "inspiration" || asset.resourceType !== "image" || !/^https:\/\//i.test(asset.secureUrl)) {
        throw new ProjectGenerationContextError("A selected inspiration is no longer available. Remove it and select an available image.", "ASSET_UNAVAILABLE");
      }
      seenIds.add(assetId);
      assetManifest.push({ assetId, filename: asset.originalFilename, trustedReference: asset.secureUrl, mimeType: asset.mimeType, size: asset.size, purpose: "design-reference", customPurpose: "", placement: "ai", placementDetails: "", instructions: "", content: "image-input" });
      inspirations.push({
        id: assetId,
        source: "userAsset",
        title: asset.originalFilename,
        category: "User upload",
        type: "Image reference",
        style: "Uploaded inspiration",
        referenceImage: { url: asset.secureUrl },
      });
      try {
        addImageReference({ assetId, category: "inspiration", role: "visual-inspiration", label: asset.originalFilename, mimeType: asset.mimeType, bytes: await assetReader(asset) });
      } catch (error) {
        if (error instanceof ProjectGenerationContextError) throw error;
        console.error("Generation inspiration processing failed:", { assetId, category: "inspiration", reason: error?.code || error?.name || "unknown error" });
        throw new ProjectGenerationContextError("A selected inspiration image could not be retrieved or read. Remove it or reupload it before retrying.", "ASSET_PROCESSING_FAILED");
      }
      continue;
    }
    if (source !== "devpilot") continue;
    if (!id) {
      throw new ProjectGenerationContextError("A selected gallery inspiration is invalid. Select an available inspiration before retrying.", "INSPIRATION_UNAVAILABLE");
    }
    if (seenIds.has(id)) continue;
    const resolved = projectManifestEntry(inspirationIndex.get(id), id);
    if (!resolved) {
      throw new ProjectGenerationContextError("A selected gallery inspiration is no longer available. Select it again before retrying.", "INSPIRATION_UNAVAILABLE");
    }
    seenIds.add(id);
    inspirations.push(resolved);
    try {
      const image = await inspirationImageReader(resolved.referenceImage.path);
      addImageReference({ inspirationId: resolved.id, category: "inspiration", role: "visual-inspiration", label: resolved.title || resolved.id, mimeType: image.mimeType, bytes: image.bytes });
    } catch (error) {
      if (error instanceof ProjectGenerationContextError) throw error;
      console.error("Generation inspiration processing failed:", { inspirationId: resolved.id, category: "inspiration", reason: error?.code || error?.name || "unknown error" });
      throw new ProjectGenerationContextError("A selected gallery inspiration could not be retrieved or read. Remove it and select it again.", "INSPIRATION_UNAVAILABLE");
    }
  }

  return {
    schemaVersion: 1,
    project: {
      id: normalizeProjectId(project._id),
      name: trimString(project.projectName),
      prompt: trimString(project.prompt),
    },
    requirements: normalizeRequirements(project.requirements),
    attachments,
    assetManifest,
    inspirations,
    visualReferences,
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
