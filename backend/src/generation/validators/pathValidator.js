const path = require("path");

const MAX_PATH_LENGTH = 180;
const ALLOWED_ROOT_FILES = new Set(["README.md", ".gitignore", ".env.example", "package.json", "vite.config.js"]);
const ALLOWED_ROOT_DIRECTORIES = ["frontend/", "backend/"];

function createError(code, message) {
  return { code, message };
}

function isAllowedRootPath(normalizedPath) {
  return (
    ALLOWED_ROOT_FILES.has(normalizedPath) ||
    ALLOWED_ROOT_DIRECTORIES.some((root) => normalizedPath.startsWith(root))
  );
}

function validateGeneratedPath(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { valid: false, error: createError("INVALID_PATH", "Generated file path must be a non-empty string.") };
  }

  const normalizedPath = value.trim();

  if (normalizedPath.length > MAX_PATH_LENGTH) {
    return { valid: false, error: createError("PATH_TOO_LONG", "Generated file path exceeds the maximum length.") };
  }

  if (normalizedPath.includes("\0")) {
    return { valid: false, error: createError("INVALID_PATH", "Generated file path contains a null byte.") };
  }

  if (normalizedPath.includes("\\")) {
    return { valid: false, error: createError("INVALID_PATH", "Generated file paths must use forward slashes.") };
  }

  if (normalizedPath.includes("%")) {
    return { valid: false, error: createError("INVALID_PATH", "Generated file paths must not contain encoded path segments.") };
  }

  if (
    normalizedPath.startsWith("/") ||
    normalizedPath.startsWith("//") ||
    /^[a-z]:/i.test(normalizedPath) ||
    /^[a-z][a-z\d+.-]*:\/\//i.test(normalizedPath)
  ) {
    return { valid: false, error: createError("INVALID_PATH", "Absolute, drive, UNC, and URL paths are not allowed.") };
  }

  const segments = normalizedPath.split("/");

  if (segments.some((segment) => segment.length === 0)) {
    return { valid: false, error: createError("INVALID_PATH", "Generated file paths must not contain empty segments.") };
  }

  if (segments.some((segment) => segment === "." || segment === "..")) {
    return { valid: false, error: createError("PATH_TRAVERSAL", "Generated file path traversal is not allowed.") };
  }

  const posixNormalized = path.posix.normalize(normalizedPath);
  if (posixNormalized !== normalizedPath || posixNormalized.startsWith("../")) {
    return { valid: false, error: createError("PATH_TRAVERSAL", "Generated file path traversal is not allowed.") };
  }

  if (!isAllowedRootPath(normalizedPath)) {
    return { valid: false, error: createError("INVALID_PATH", "Generated file path is outside the allowed project roots.") };
  }

  return { valid: true, normalizedPath };
}

module.exports = {
  ALLOWED_ROOT_FILES,
  ALLOWED_ROOT_DIRECTORIES,
  MAX_PATH_LENGTH,
  validateGeneratedPath,
};
