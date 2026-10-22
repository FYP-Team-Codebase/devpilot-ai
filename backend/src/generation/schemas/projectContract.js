// Canonical required paths for generated projects and staged manifests.
// Final validation may accept the documented TypeScript entrypoint variants.
const CANONICAL_REQUIRED_PROJECT_FILES = Object.freeze([
  "frontend/package.json",
  "frontend/index.html",
  "frontend/src/main.jsx",
  "frontend/src/App.jsx",
  "backend/package.json",
  "backend/src/server.js",
  "backend/src/app.js",
  "README.md",
  ".gitignore",
  ".env.example",
]);

const REQUIRED_ENTRYPOINT_FILE_GROUPS = Object.freeze([
  Object.freeze(["frontend/src/main.jsx", "frontend/src/main.tsx"]),
  Object.freeze(["frontend/src/App.jsx", "frontend/src/App.tsx"]),
  Object.freeze(["backend/src/server.js", "backend/src/server.ts"]),
  Object.freeze(["backend/src/app.js", "backend/src/app.ts"]),
]);

module.exports = { CANONICAL_REQUIRED_PROJECT_FILES, REQUIRED_ENTRYPOINT_FILE_GROUPS };
