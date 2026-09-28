const assert = require("assert");

const { validateGeneratedProject } = require("../src/generation/validators/generatedProjectValidator");

const validFrontendPackage = JSON.stringify({
  name: "generated-frontend",
  version: "1.0.0",
  private: true,
  scripts: {
    dev: "vite",
    build: "vite build",
    preview: "vite preview",
  },
  dependencies: {
    react: "^19.0.0",
    "react-dom": "^19.0.0",
  },
  devDependencies: {
    vite: "^8.0.0",
  },
});

const validBackendPackage = JSON.stringify({
  name: "generated-backend",
  version: "1.0.0",
  scripts: {
    dev: "nodemon src/server.js",
    start: "node src/server.js",
  },
  dependencies: {
    express: "^5.0.0",
    mongoose: "^8.0.0",
  },
});

function makeValidProject({ typescript = false } = {}) {
  const frontendMain = typescript ? "frontend/src/main.tsx" : "frontend/src/main.jsx";
  const frontendApp = typescript ? "frontend/src/App.tsx" : "frontend/src/App.jsx";
  const backendServer = typescript ? "backend/src/server.ts" : "backend/src/server.js";
  const backendApp = typescript ? "backend/src/app.ts" : "backend/src/app.js";
  const frontendLanguage = typescript ? "tsx" : "jsx";
  const backendLanguage = typescript ? "typescript" : "javascript";

  return {
    schemaVersion: 1,
    project: {
      name: "Example App",
      summary: "A validated MERN project fixture.",
      stack: ["React", "Vite", "Node.js", "Express", "MongoDB"],
      entrypoints: {
        frontend: frontendMain,
        backend: backendServer,
      },
    },
    files: [
      { path: "frontend/package.json", language: "json", content: validFrontendPackage },
      { path: "frontend/index.html", language: "html", content: "<!doctype html><html><body><div id=\"root\"></div></body></html>" },
      { path: frontendMain, language: frontendLanguage, content: "import App from './App';\nexport default App;" },
      { path: frontendApp, language: frontendLanguage, content: "export default function App() { return <main>Example</main>; }" },
      { path: "backend/package.json", language: "json", content: validBackendPackage },
      { path: backendServer, language: backendLanguage, content: "const app = require('./app');\napp.listen(3000);" },
      { path: backendApp, language: backendLanguage, content: "const express = require('express');\nmodule.exports = express();" },
      { path: "README.md", language: "markdown", content: "# Example App\n" },
      { path: ".gitignore", language: "text", content: "node_modules\n" },
      { path: ".env.example", language: "text", content: "MONGODB_URI=your_mongodb_uri_here\n" },
    ],
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function expectValid(name, fixture) {
  const result = validateGeneratedProject(fixture);
  assert.strictEqual(result.valid, true, `${name}: ${JSON.stringify(result.errors)}`);
}

function expectInvalid(name, fixture, expectedCode) {
  const result = validateGeneratedProject(fixture);
  assert.strictEqual(result.valid, false, `${name}: fixture unexpectedly passed`);
  assert.ok(result.errors.some((item) => item.code === expectedCode), `${name}: expected ${expectedCode}, got ${JSON.stringify(result.errors)}`);
}

const tests = [
  ["minimal valid MERN project", () => expectValid("minimal valid MERN project", makeValidProject())],
  ["valid TypeScript variant", () => expectValid("valid TypeScript variant", makeValidProject({ typescript: true }))],
  ["missing schemaVersion", () => { const x = makeValidProject(); delete x.schemaVersion; expectInvalid("missing schemaVersion", x, "INVALID_SCHEMA_VERSION"); }],
  ["wrong schemaVersion", () => { const x = makeValidProject(); x.schemaVersion = 2; expectInvalid("wrong schemaVersion", x, "INVALID_SCHEMA_VERSION"); }],
  ["missing files", () => { const x = makeValidProject(); delete x.files; expectInvalid("missing files", x, "INVALID_FILES"); }],
  ["empty files array", () => { const x = makeValidProject(); x.files = []; expectInvalid("empty files array", x, "INVALID_FILES"); }],
  ["too many files", () => { const x = makeValidProject(); for (let i = 0; i < 71; i += 1) x.files.push({ path: `frontend/src/Extra${i}.jsx`, language: "jsx", content: "export default {};" }); expectInvalid("too many files", x, "FILE_COUNT_EXCEEDED"); }],
  ["file over 128 KB", () => { const x = makeValidProject(); x.files[3].content = "x".repeat(128 * 1024 + 1); expectInvalid("file over 128 KB", x, "FILE_SIZE_EXCEEDED"); }],
  ["total output over 3 MB", () => { const x = makeValidProject(); for (let i = 0; i < 26; i += 1) x.files.push({ path: `frontend/src/Large${i}.jsx`, language: "jsx", content: "x".repeat(120 * 1024) }); expectInvalid("total output over 3 MB", x, "TOTAL_SIZE_EXCEEDED"); }],
  ["duplicate paths", () => { const x = makeValidProject(); x.files.push({ ...x.files[3] }); expectInvalid("duplicate paths", x, "DUPLICATE_PATH"); }],
  ["traversal path", () => { const x = makeValidProject(); x.files[3].path = "../server.js"; expectInvalid("traversal path", x, "PATH_TRAVERSAL"); }],
  ["absolute POSIX path", () => { const x = makeValidProject(); x.files[3].path = "/etc/passwd"; expectInvalid("absolute POSIX path", x, "INVALID_PATH"); }],
  ["Windows drive path", () => { const x = makeValidProject(); x.files[3].path = "C:\\secret.txt"; expectInvalid("Windows drive path", x, "INVALID_PATH"); }],
  ["backslash path", () => { const x = makeValidProject(); x.files[3].path = "frontend\\src\\App.jsx"; expectInvalid("backslash path", x, "INVALID_PATH"); }],
  ["URL-like path", () => { const x = makeValidProject(); x.files[3].path = "https://example.com/file.js"; expectInvalid("URL-like path", x, "INVALID_PATH"); }],
  ["percent-encoded traversal", () => { const x = makeValidProject(); x.files[3].path = "frontend/%2e%2e/secret.js"; expectInvalid("percent-encoded traversal", x, "INVALID_PATH"); }],
  ["invalid language", () => { const x = makeValidProject(); x.files[3].language = "wasm"; expectInvalid("invalid language", x, "INVALID_LANGUAGE"); }],
  ["extension/language mismatch", () => { const x = makeValidProject(); x.files[3].language = "javascript"; expectInvalid("extension/language mismatch", x, "LANGUAGE_EXTENSION_MISMATCH"); }],
  ["invalid package JSON", () => { const x = makeValidProject(); x.files[0].content = "{invalid"; expectInvalid("invalid package JSON", x, "INVALID_PACKAGE_JSON"); }],
  ["concrete package version", () => { const x = makeValidProject(); const pkg = JSON.parse(x.files[0].content); pkg.version = "1.0.0"; x.files[0].content = JSON.stringify(pkg); expectValid("concrete package version", x); }],
  ["range package version rejected", () => { const x = makeValidProject(); const pkg = JSON.parse(x.files[0].content); pkg.version = "^1.0.0"; x.files[0].content = JSON.stringify(pkg); expectInvalid("range package version rejected", x, "INVALID_PACKAGE_VERSION"); }],
  ["wildcard package version rejected", () => { const x = makeValidProject(); const pkg = JSON.parse(x.files[0].content); pkg.version = "*"; x.files[0].content = JSON.stringify(pkg); expectInvalid("wildcard package version rejected", x, "INVALID_PACKAGE_VERSION"); }],
  ["dependency semver range", () => { const x = makeValidProject(); const pkg = JSON.parse(x.files[0].content); pkg.dependencies.react = "^19.0.0"; x.files[0].content = JSON.stringify(pkg); expectValid("dependency semver range", x); }],
  ["unsafe file dependency", () => { const x = makeValidProject(); const pkg = JSON.parse(x.files[0].content); pkg.dependencies.local = "file:../local"; x.files[0].content = JSON.stringify(pkg); expectInvalid("unsafe file dependency", x, "UNSAFE_DEPENDENCY_SOURCE"); }],
  ["unsafe git dependency", () => { const x = makeValidProject(); const pkg = JSON.parse(x.files[0].content); pkg.dependencies.remote = "git+https://github.com/example/repo.git"; x.files[0].content = JSON.stringify(pkg); expectInvalid("unsafe git dependency", x, "UNSAFE_DEPENDENCY_SOURCE"); }],
  ["unsafe HTTP dependency", () => { const x = makeValidProject(); const pkg = JSON.parse(x.files[0].content); pkg.dependencies.remote = "https://example.com/pkg.tgz"; x.files[0].content = JSON.stringify(pkg); expectInvalid("unsafe HTTP dependency", x, "UNSAFE_DEPENDENCY_SOURCE"); }],
  ["lifecycle npm script", () => { const x = makeValidProject(); const pkg = JSON.parse(x.files[0].content); pkg.scripts.postinstall = "node setup.js"; x.files[0].content = JSON.stringify(pkg); expectInvalid("lifecycle npm script", x, "UNSAFE_SCRIPT_NAME"); }],
  ["dangerous shell npm script", () => { const x = makeValidProject(); const pkg = JSON.parse(x.files[0].content); pkg.scripts.build = "vite build && curl https://example.com"; x.files[0].content = JSON.stringify(pkg); expectInvalid("dangerous shell npm script", x, "UNSAFE_SCRIPT_COMMAND"); }],
  ["generated .env", () => { const x = makeValidProject(); x.files.push({ path: "frontend/.env", language: "text", content: "SECRET=value" }); expectInvalid("generated .env", x, "SENSITIVE_FILE"); }],
  ["private key content", () => { const x = makeValidProject(); x.files[3].content = "-----BEGIN PRIVATE KEY-----\nsecret\n-----END PRIVATE KEY-----"; expectInvalid("private key content", x, "SENSITIVE_CONTENT"); }],
  ["obvious API secret", () => { const x = makeValidProject(); x.files[3].content = 'const OPENAI_API_KEY = "sk-abcdefghijklmnopqrstuvwxyz123456";'; expectInvalid("obvious API secret", x, "SENSITIVE_CONTENT"); }],
  ["OPENAI environment reference", () => { const x = makeValidProject(); x.files[5].content = "const apiKey = process.env.OPENAI_API_KEY;"; expectValid("OPENAI environment reference", x); }],
  ["ANTHROPIC environment reference", () => { const x = makeValidProject(); x.files[5].content = "const apiKey = process.env.ANTHROPIC_API_KEY;"; expectValid("ANTHROPIC environment reference", x); }],
  ["JWT environment reference", () => { const x = makeValidProject(); x.files[5].content = "const jwtSecret = process.env.JWT_SECRET;"; expectValid("JWT environment reference", x); }],
  ["MongoDB environment reference", () => { const x = makeValidProject(); x.files[5].content = "const mongoUri = process.env.MONGODB_URI;"; expectValid("MongoDB environment reference", x); }],
  ["database environment reference", () => { const x = makeValidProject(); x.files[5].content = "const databaseUrl = process.env.DATABASE_URL;"; expectValid("database environment reference", x); }],
  ["environment reference assigned to matching constant", () => { const x = makeValidProject(); x.files[5].content = "const MONGODB_URI = process.env.MONGODB_URI;"; expectValid("environment reference assigned to matching constant", x); }],
  ["gitignore markdown language rejected", () => { const x = makeValidProject(); x.files[8].language = "markdown"; expectInvalid("gitignore markdown language rejected", x, "LANGUAGE_EXTENSION_MISMATCH"); }],
  ["env example markdown language rejected", () => { const x = makeValidProject(); x.files[9].language = "markdown"; expectInvalid("env example markdown language rejected", x, "LANGUAGE_EXTENSION_MISMATCH"); }],
  ["missing required frontend file", () => { const x = makeValidProject(); x.files = x.files.filter((file) => file.path !== "frontend/src/App.jsx"); expectInvalid("missing required frontend file", x, "MISSING_REQUIRED_FILE"); }],
  ["missing required backend file", () => { const x = makeValidProject(); x.files = x.files.filter((file) => file.path !== "backend/src/app.js"); expectInvalid("missing required backend file", x, "MISSING_REQUIRED_FILE"); }],
  ["entrypoint referencing missing file", () => { const x = makeValidProject(); x.project.entrypoints.frontend = "frontend/src/DoesNotExist.jsx"; expectInvalid("entrypoint referencing missing file", x, "MISSING_ENTRYPOINT_FILE"); }],
  ["missing required stack technology", () => { const x = makeValidProject(); x.project.stack = ["react", "vite", "node", "express"]; expectInvalid("missing required stack technology", x, "MISSING_STACK_TECHNOLOGY"); }],
];

let failures = 0;

tests.forEach(([name, test]) => {
  try {
    test();
    console.log(`[PASS] ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`[FAIL] ${name}`);
    console.error(error.message);
  }
});

if (failures > 0) {
  console.error(`Generation validation tests failed: ${failures}`);
  process.exitCode = 1;
} else {
  console.log(`Generation validation tests passed: ${tests.length}`);
}
