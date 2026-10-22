const assert = require("node:assert/strict");
const test = require("node:test");
const {
  generateProject,
  getStagedGenerationLimits,
  normalizeStagedFileEntries,
  validateGenerationManifest,
  validateStagedFileResponse,
  summarizeManifestShape,
  makeStagedFilePayload,
  makeStagedManifestPayload,
  makeStagedManifestRepairPayload,
  normalizeStagedManifest,
} = require("../src/services/projectGenerationService");
const { validateFrontendQuality } = require("../src/generation/validators/frontendQualityValidator");
const { validateGeneratedProject } = require("../src/generation/validators/generatedProjectValidator");

const files = [
  { path: "frontend/package.json", language: "json", purpose: "Frontend dependencies", dependencies: [], assetIds: [] },
  { path: "frontend/index.html", language: "html", purpose: "Frontend document", dependencies: [], assetIds: [] },
  { path: "frontend/src/main.jsx", language: "jsx", purpose: "Frontend entrypoint", dependencies: ["frontend/src/App.jsx"], assetIds: [] },
  { path: "frontend/src/App.jsx", language: "jsx", purpose: "Main page", dependencies: [], assetIds: [] },
  { path: "backend/package.json", language: "json", purpose: "Backend dependencies", dependencies: [], assetIds: [] },
  { path: "backend/src/server.js", language: "javascript", purpose: "Backend entrypoint", dependencies: ["backend/src/app.js"], assetIds: [] },
  { path: "backend/src/app.js", language: "javascript", purpose: "Express app", dependencies: [], assetIds: [] },
  { path: "README.md", language: "markdown", purpose: "Project instructions", dependencies: [], assetIds: [] },
  { path: ".gitignore", language: "text", purpose: "Ignored files", dependencies: [], assetIds: [] },
  { path: ".env.example", language: "text", purpose: "Safe environment placeholders", dependencies: [], assetIds: [] },
];

const manifest = () => ({
  schemaVersion: 1,
  project: {
    name: "Cafe",
    summary: "A small cafe website.",
    stack: ["React", "Vite", "Node.js", "Express", "MongoDB"],
    entrypoints: { frontend: "frontend/src/main.jsx", backend: "backend/src/server.js" },
  },
  packageConfiguration: {
    frontendDependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
    backendDependencies: { express: "^5.0.0", mongoose: "^8.0.0" },
  },
  designProfiles: [],
  sharedContracts: "Keep the frontend entrypoint and application component exports consistent.",
  files: files.map((file) => ({ ...file })),
});

const sourceByPath = {
  "frontend/package.json": '{"name":"cafe","version":"1.0.0","dependencies":{"react":"^19.0.0","react-dom":"^19.0.0"}}',
  "frontend/index.html": '<!doctype html><html><body><div id="root"></div></body></html>',
  "frontend/src/main.jsx": 'import React from "react"; import { createRoot } from "react-dom/client"; import App from "./App.jsx"; createRoot(document.getElementById("root")).render(<App />);',
  "frontend/src/App.jsx": 'export default function App() { return <main><h1>Cafe</h1><p>Welcome.</p></main>; }',
  "backend/package.json": '{"name":"cafe-api","version":"1.0.0","dependencies":{"express":"^5.0.0","mongoose":"^8.0.0"}}',
  "backend/src/server.js": 'const app = require("./app"); app.listen(3000);',
  "backend/src/app.js": 'module.exports = require("express")();',
  "README.md": "# Cafe\nA generated cafe website.",
  ".gitignore": "node_modules\n.env",
  ".env.example": "MONGO_URI=mongodb://localhost:27017/example",
};

function repairedQualityProject() {
  return {
    schemaVersion: 1,
    project: manifest().project,
    designProfiles: [],
    files: [
      ...Object.entries(sourceByPath).map(([path, content]) => ({
        path,
        language: files.find((file) => file.path === path).language,
        content: path === "frontend/src/main.jsx" ? content.replace('import App from "./App.jsx";', 'import "./style.css"; import App from "./App.jsx";')
          : path === "frontend/src/App.jsx" ? 'export default function App() { return <><nav><a href="/">Home</a></nav><main><h1>Cafe</h1></main></>; }'
            : content,
      })),
      { path: "frontend/src/style.css", language: "css", content: "nav { display:flex; gap:1rem; } a { color:#222; text-decoration:none; } @media (max-width:600px) { nav { flex-wrap:wrap; } }" },
    ],
  };
}

const context = () => ({
  project: { prompt: "Create a small cafe website" },
  requirements: { pages: ["Home"] },
  visualReferences: [],
  assetManifest: [],
  attachments: [],
});

const visualContext = () => ({
  ...context(),
  visualReferences: [{
    assetId: "reference-cafe",
    role: "visual-inspiration",
    purpose: "design-reference",
    placement: "hero",
    placementDetails: "Use for the landing page hero style",
    customPurpose: "",
    instructions: "Use the warm palette",
    label: "Cafe reference",
    mimeType: "image/png",
    url: "data:image/png;base64,dGVzdA==",
  }],
});

function validDesignProfile(overrides = {}) {
  return {
    referenceId: "reference-cafe",
    purpose: "design-reference",
    placement: "hero",
    placementDetails: "Use for the landing page hero style",
    customPurpose: "",
    instructions: "Use the warm palette",
    palette: ["warm cream", "dark brown"],
    contrast: "High contrast between headings and background",
    typography: "Serif display headings with sans-serif body text",
    navigation: "Compact top navigation",
    composition: "Centered hero with image and text columns",
    spacing: "Generous section spacing",
    components: "Rounded cards and outlined buttons",
    imageTreatment: "Wide crop with rounded corners",
    mood: "Warm and welcoming",
    distinctiveFeatures: ["Large serif headline"],
    ...overrides,
  };
}

function successResponse(value) {
  return { ok: true, json: async () => ({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(value) } }] }) };
}

function limitedResponse() {
  return { ok: true, json: async () => ({ choices: [{ finish_reason: "length", message: { content: "{\"files\":[" } }] }) };
}

function requestedFilesFromBody(body) {
  const userMessage = body.messages.find((message) => message.role === "user");
  const texts = userMessage.content.filter((part) => part.type === "text").map((part) => part.text);
  const match = texts.map((text) => text.match(/these requested paths, in this order: (\[[\s\S]*?\])\. Do not include/)).find(Boolean);
  assert.ok(match, "stage request includes a JSON file allowlist");
  return JSON.parse(match[1]);
}

async function withProvider(run) {
  const previous = {
    key: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL,
    fetch: global.fetch,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
  try { return await run(); } finally {
    if (previous.key === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous.key;
    if (previous.model === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previous.model;
    global.fetch = previous.fetch;
    console.info = previous.info;
    console.warn = previous.warn;
    console.error = previous.error;
  }
}

test("small projects recover from a truncated full response through a staged manifest and bounded file batches", async () => {
  await withProvider(async () => {
    let calls = 0;
    const stages = [];
    global.fetch = async (_url, options) => {
      calls += 1;
      const body = JSON.parse(options.body);
      const system = body.messages.find((message) => message.role === "system").content;
      if (calls === 1) { stages.push("initial"); return limitedResponse(); }
      if (system.includes("Stage A manifest response only")) { stages.push("manifest"); return successResponse(manifest()); }
      stages.push("files");
      const requested = requestedFilesFromBody(body);
      return successResponse({ files: requested.map(({ path, language }) => ({ path, language, content: sourceByPath[path] })) });
    };
    const result = await generateProject(context(), { generationId: "staged-small" });
    assert.equal(calls, 5); // initial + manifest + three bounded batches
    assert.deepEqual(stages, ["initial", "manifest", "files", "files", "files"]);
    assert.equal(result.generatedFiles.length, 10);
    assert.equal(result.projectName, "Cafe");
    assert.ok(result.generatedFiles.every((file) => Object.keys(file).sort().join(",") === "content,language,path"));
    const canonical = validateGeneratedProject({ schemaVersion: 1, project: manifest().project, files: result.generatedFiles });
    assert.equal(canonical.valid, true);
  });
});

test("staged generation declares README.md and synthesizes it when omitted from a file batch", async () => {
  await withProvider(async () => {
    let calls = 0;
    const stagedManifest = manifest();
    stagedManifest.files = stagedManifest.files.filter((file) => file.path !== "README.md");
    global.fetch = async (_url, options) => {
      calls += 1;
      const body = JSON.parse(options.body);
      const system = body.messages.find((message) => message.role === "system").content;
      if (calls === 1) return limitedResponse();
      if (system.includes("Stage A manifest response only")) return successResponse(stagedManifest);
      const requested = requestedFilesFromBody(body).filter((file) => file.path !== "README.md");
      return successResponse({ files: requested.map(({ path, language }) => ({ path, language, content: sourceByPath[path] })) });
    };
    const result = await generateProject(context(), { generationId: "staged-readme-fallback" });
    const readme = result.generatedFiles.find((file) => file.path === "README.md");
    assert.ok(readme);
    assert.equal(readme.language, "markdown");
    assert.match(readme.content, /# Cafe/);
    assert.match(readme.content, /A small cafe website/);
    assert.match(readme.content, /frontend\/src\/App\.jsx/);
    assert.equal(calls, 5);
  });
});

test("staged README recovery does not waive any other required manifest file", async () => {
  await withProvider(async () => {
    let calls = 0;
    const stagedManifest = manifest();
    stagedManifest.files = stagedManifest.files.filter((file) => file.path !== "README.md" && file.path !== "backend/src/app.js");
    global.fetch = async (_url, options) => {
      calls += 1;
      if (calls === 1) return limitedResponse();
      return successResponse(stagedManifest);
    };
    await assert.rejects(generateProject(context(), { generationId: "staged-readme-other-required" }),
      (error) => error.code === "GENERATION_MANIFEST_INVALID");
    assert.equal(calls, 2);
  });
});

test("staged manifest canonicalizes README casing before final project assembly", () => {
  const stagedManifest = manifest();
  stagedManifest.files.find((file) => file.path === "README.md").path = "readme.md";
  const normalized = normalizeStagedManifest(stagedManifest, context());
  assert.ok(normalized.files.some((file) => file.path === "README.md"));
  assert.equal(normalized.files.some((file) => file.path === "readme.md"), false);
  assert.equal(validateGenerationManifest(normalized, context(), getStagedGenerationLimits()).valid, true);
});

test("staged generation succeeds with a selected image and uses its trusted URL", async () => {
  await withProvider(async () => {
    const trustedReference = "https://res.cloudinary.com/demo/image/upload/v1/cafe.jpg";
    const assetContext = {
      ...context(),
      assetManifest: [{ assetId: "asset-123", filename: "cafe.jpg", trustedReference, purpose: "content-image", content: "image-input" }],
      visualReferences: [{ assetId: "asset-123", role: "content-asset", label: "cafe.jpg", purpose: "content-image", url: "data:image/png;base64,dGVzdA==" }],
    };
    const assetManifest = manifest();
    assetManifest.files.find((file) => file.path === "frontend/src/App.jsx").assetIds = ["asset-123"];
    let calls = 0;
    let fileCallIncludedTrustedReference = false;
    global.fetch = async (_url, options) => {
      calls += 1;
      const body = JSON.parse(options.body);
      if (calls === 1) return limitedResponse();
      const system = body.messages.find((message) => message.role === "system").content;
      if (system.includes("Stage A manifest response only")) return successResponse(assetManifest);
      const requested = requestedFilesFromBody(body);
      fileCallIncludedTrustedReference ||= JSON.stringify(body.messages).includes(trustedReference);
      return successResponse({ files: requested.map(({ path, language }) => ({
        path,
        language,
        content: path === "frontend/src/App.jsx"
          ? `<main><img src="${trustedReference}" alt="Cafe" /><h1>Cafe</h1></main>`
          : sourceByPath[path],
      })) });
    };
    const result = await generateProject(assetContext, { generationId: "staged-with-image" });
    assert.equal(result.generatedFiles.length, 10);
    assert.equal(fileCallIncludedTrustedReference, true);
    assert.doesNotThrow(() => require("../src/services/projectGenerationService").validateSelectedAssetUsage(assetContext, result.generatedFiles));
  });
});

test("staged assembly rejects the exact three-string file-entry shape before canonical validation", async () => {
  await withProvider(async () => {
    let calls = 0;
    global.fetch = async (_url, options) => {
      calls += 1;
      const body = JSON.parse(options.body);
      if (calls === 1) return limitedResponse();
      if (body.messages.find((message) => message.role === "system").content.includes("Stage A manifest response only")) return successResponse(manifest());
      const requested = requestedFilesFromBody(body);
      return successResponse({ files: requested.map(({ path, language }, index) => index < 3
        ? sourceByPath[path]
        : { path, language, content: sourceByPath[path] }) });
    };
    await assert.rejects(generateProject(context(), { generationId: "staged-three-string-files" }), (error) =>
      error.code === "STAGED_FILE_INVALID" && error.stage === "staged-file-validation");
    assert.equal(calls, 3);
  });
});

test("a complete response with three non-object files is recovered through manifest-based staging", async () => {
  await withProvider(async () => {
    const initial = {
      schemaVersion: 1,
      project: manifest().project,
      files: files.map((file, index) => index < 3
        ? sourceByPath[file.path]
        : { path: file.path, language: file.language, content: sourceByPath[file.path] }),
    };
    let calls = 0;
    global.fetch = async (_url, options) => {
      calls += 1;
      if (calls === 1) return successResponse(initial);
      const body = JSON.parse(options.body);
      const system = body.messages.find((message) => message.role === "system").content;
      if (system.includes("Stage A manifest response only")) return successResponse(manifest());
      const requested = requestedFilesFromBody(body);
      return successResponse({ files: requested.map(({ path, language }) => ({ path, language, content: sourceByPath[path] })) });
    };
    const result = await generateProject(context(), { generationId: "malformed-initial-files" });
    assert.equal(calls, 5);
    assert.equal(result.generatedFiles.length, 10);
    assert.equal(validateGeneratedProject({ schemaVersion: 1, project: manifest().project, files: result.generatedFiles }).valid, true);
  });
});

test("canonical assembly normalizes valid staged entries and refuses malformed values", () => {
  const normalized = normalizeStagedFileEntries([
    { path: "frontend/src/App.jsx", language: "JSX", content: "export default function App() {}" },
  ], "assembly-normalize-test");
  assert.deepEqual(normalized, [{ path: "frontend/src/App.jsx", language: "jsx", content: "export default function App() {}" }]);
  assert.throws(() => normalizeStagedFileEntries(["first", "second", "third"], "assembly-malformed-test"), (error) =>
    error.code === "STAGED_FILE_INVALID" && error.stage === "staged-assembly-validation");
});

test("a truncated file batch is split and only a truncated individual file gets one targeted recovery", async () => {
  await withProvider(async () => {
    let calls = 0;
    const recoveredPaths = [];
    global.fetch = async (_url, options) => {
      calls += 1;
      const body = JSON.parse(options.body);
      const system = body.messages.find((message) => message.role === "system").content;
      if (calls === 1) return limitedResponse();
      if (system.includes("Stage A manifest response only")) return successResponse(manifest());
      const requested = requestedFilesFromBody(body);
      const userText = body.messages.find((message) => message.role === "user").content.filter((part) => part.type === "text").at(-1).text;
      if (requested.length > 1 && recoveredPaths.length === 0) return limitedResponse();
      if (requested.length === 1 && requested[0].path === "frontend/src/App.jsx" && !userText.includes("Targeted recovery")) return limitedResponse();
      if (userText.includes("Targeted recovery")) recoveredPaths.push(requested[0].path);
      return successResponse({ files: requested.map(({ path, language }) => ({ path, language, content: sourceByPath[path] })) });
    };
    const result = await generateProject(context(), { generationId: "staged-targeted-recovery" });
    assert.ok(result.generatedFiles.some((file) => file.path === "frontend/src/App.jsx"));
    assert.deepEqual(recoveredPaths, ["frontend/src/App.jsx"]);
    assert.equal(calls, 10);
  });
});

test("assembled staged output runs through the existing quality repair pipeline", async () => {
  await withProvider(async () => {
    const stagedManifest = manifest();
    stagedManifest.files.push({ path: "frontend/src/style.css", language: "css", purpose: "Page styling", dependencies: [], assetIds: [] });
    const unstyledSources = { ...sourceByPath, "frontend/src/App.jsx": 'export default function App() { return <><nav><a href="/">Home</a></nav><main><h1>Cafe</h1></main></>; }' };
    let calls = 0;
    let sawRepair = false;
    global.fetch = async (_url, options) => {
      calls += 1;
      const body = JSON.parse(options.body);
      const system = body.messages.find((message) => message.role === "system").content;
      if (calls === 1) return limitedResponse();
      if (system.includes("Stage A manifest response only")) return successResponse(stagedManifest);
      const lastUser = body.messages.at(-1);
      if (typeof lastUser.content === "string" && lastUser.content.includes("smallest changes")) {
        sawRepair = true;
        return successResponse({ files: repairedQualityProject().files
          .filter((file) => ["frontend/src/main.jsx", "frontend/src/App.jsx", "frontend/src/style.css"].includes(file.path))
          .map(({ path, content }) => ({ path, content })) });
      }
      const requested = requestedFilesFromBody(body);
      return successResponse({ files: requested.map(({ path, language }) => ({ path, language, content: path === "frontend/src/style.css" ? ".unused { color:red; }" : unstyledSources[path] })) });
    };
    const result = await generateProject(context(), { generationId: "staged-quality-repair" });
    assert.equal(sawRepair, true);
    assert.equal(calls, 6);
    assert.deepEqual(validateFrontendQuality(result.generatedFiles), []);
  });
});

test("invalid, unsafe, duplicate, and excessive manifests are rejected before file generation", async () => {
  const limits = getStagedGenerationLimits();
  for (const mutate of [
    (value) => { value.files[0].path = "frontend/../../outside.js"; },
    (value) => { value.files[1].path = value.files[0].path; },
    (value) => { value.files.push({ ...value.files.at(-1), path: "frontend/src/Extra.jsx" }); },
    (value) => { value.files.push({ path: "frontend/src/unknown.bin", language: "javascript", purpose: "Unsupported file", dependencies: [], assetIds: [] }); },
  ]) {
    const value = manifest();
    mutate(value);
    const result = validateGenerationManifest(value, context(), { ...limits, maxFiles: 10 });
    assert.equal(result.valid, false);
  }
  const invalidSchema = validateGenerationManifest({ files: [] }, context(), limits);
  assert.deepEqual(invalidSchema.issues, ["INVALID_MANIFEST_SCHEMA"]);
});

test("manifest diagnostics report exact safe schema findings and response shape only", () => {
  const invalid = manifest();
  invalid.packageConfiguration = { frontend: "private project detail" };
  invalid.files[0].language = "jsx";
  const checked = validateGenerationManifest(invalid, context(), getStagedGenerationLimits());
  assert.equal(checked.valid, false);
  assert.ok(checked.issues.includes("INVALID_PACKAGE_CONFIGURATION"));
  const shape = summarizeManifestShape(invalid);
  assert.equal(shape.rootType, "object");
  assert.equal(shape.fileCount, 10);
  assert.equal(shape.fileEntryTypes.object, 10);
  assert.equal(JSON.stringify(shape).includes("private project detail"), false);
  assert.equal(JSON.stringify(shape).includes("frontend/src/App.jsx"), false);
});

test("manifest design profiles follow the actual fidelity validator schema and trusted configuration", () => {
  const design = visualContext();
  const missing = manifest();
  assert.ok(validateGenerationManifest(missing, design, getStagedGenerationLimits()).issues.includes("INVALID_DESIGN_PROFILES"));

  const complete = manifest();
  complete.designProfiles = [validDesignProfile({ placement: "wrong", instructions: "provider changed this" })];
  const normalized = normalizeStagedManifest(complete, design);
  assert.equal(normalized.designProfiles[0].placement, "hero");
  assert.equal(normalized.designProfiles[0].instructions, "Use the warm palette");
  assert.equal(validateGenerationManifest(normalized, design, getStagedGenerationLimits()).valid, true);

  const incomplete = manifest();
  incomplete.designProfiles = [validDesignProfile({ mood: "" })];
  assert.ok(validateGenerationManifest(normalizeStagedManifest(incomplete, design), design, getStagedGenerationLimits()).issues.includes("INVALID_DESIGN_PROFILES"));
});

test("manifest prompt specifies the exact profile schema and saved reference configuration", () => {
  const design = visualContext();
  const providerPayload = {
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "Return only one JSON object matching schemaVersion 1 and this shape: {\"schemaVersion\":1}." },
      { role: "user", content: [{ type: "text", text: "project request" }, { type: "image_url", image_url: { url: design.visualReferences[0].url } }] },
    ],
  };
  const payload = makeStagedManifestPayload(providerPayload, providerPayload.model, getStagedGenerationLimits(), design);
  const system = payload.messages.find((message) => message.role === "system").content;
  const userText = payload.messages.filter((message) => message.role === "user").map((message) => Array.isArray(message.content)
    ? message.content.filter((part) => part.type === "text").map((part) => part.text).join("\n")
    : message.content).join("\n");
  assert.match(system, /saved configuration supplied as user data/);
  assert.match(system, /non-empty string arrays palette and distinctiveFeatures/);
  assert.match(system, /return exactly one designProfiles object/);
  assert.match(userText, /reference-cafe/);
  assert.doesNotMatch(system, /Use the warm palette|Use for the landing page hero style/);
});

test("manifest dependency normalization resolves relative, slash, and case variants to declared canonical paths", () => {
  const value = manifest();
  value.files.find((file) => file.path === "frontend/src/main.jsx").dependencies = [".\\app.jsx"];
  const normalized = normalizeStagedManifest(value, context());
  assert.deepEqual(normalized.files.find((file) => file.path === "frontend/src/main.jsx").dependencies, ["frontend/src/App.jsx"]);
  assert.equal(validateGenerationManifest(normalized, context(), getStagedGenerationLimits()).valid, true);
});

test("unknown and cyclic manifest dependencies are reported without deleting edges", () => {
  const unknown = manifest();
  unknown.files.find((file) => file.path === "frontend/src/main.jsx").dependencies = ["./Missing.jsx"];
  const unknownNormalized = normalizeStagedManifest(unknown, context());
  assert.deepEqual(unknownNormalized.files.find((file) => file.path === "frontend/src/main.jsx").dependencies, ["frontend/src/Missing.jsx"]);
  assert.ok(validateGenerationManifest(unknownNormalized, context(), getStagedGenerationLimits()).issues.includes("UNKNOWN_FILE_DEPENDENCY"));

  const cyclic = manifest();
  cyclic.files.find((file) => file.path === "frontend/src/App.jsx").dependencies = ["frontend/src/main.jsx"];
  const cyclicNormalized = normalizeStagedManifest(cyclic, context());
  assert.ok(validateGenerationManifest(cyclicNormalized, context(), getStagedGenerationLimits()).issues.includes("CYCLIC_FILE_DEPENDENCIES"));
  assert.deepEqual(cyclicNormalized.files.find((file) => file.path === "frontend/src/App.jsx").dependencies, ["frontend/src/main.jsx"]);
});

test("one bounded manifest correction repairs all three reported findings before file generation", async () => {
  await withProvider(async () => {
    const design = visualContext();
    const invalid = manifest();
    invalid.designProfiles = [];
    invalid.files.find((file) => file.path === "frontend/src/main.jsx").dependencies = ["./Missing.jsx"];
    invalid.files.find((file) => file.path === "frontend/src/App.jsx").dependencies = ["frontend/src/main.jsx"];
    const corrected = manifest();
    corrected.designProfiles = [validDesignProfile()];
    let calls = 0;
    let observedRepairFindings = false;
    let observedRepairProfileContext = false;
    global.fetch = async (_url, options) => {
      calls += 1;
      const body = JSON.parse(options.body);
      const system = body.messages.find((message) => message.role === "system")?.content || "";
      const user = body.messages.filter((message) => message.role === "user").at(-1);
      const userText = Array.isArray(user?.content) ? user.content.filter((part) => part.type === "text").map((part) => part.text).join("\n") : String(user?.content || "");
      if (calls === 1) return limitedResponse();
      if (userText.includes("Correct this Stage A manifest")) {
        observedRepairFindings = userText.includes("INVALID_DESIGN_PROFILES") && userText.includes("UNKNOWN_FILE_DEPENDENCY") && userText.includes("CYCLIC_FILE_DEPENDENCIES");
        const serializedMessages = JSON.stringify(body.messages);
        observedRepairProfileContext = serializedMessages.includes("reference-cafe") && serializedMessages.includes("required observational fields");
        return successResponse(corrected);
      }
      if (system.includes("Stage A manifest response only")) return successResponse(invalid);
      if (system.includes("visual design fidelity reviewer")) return successResponse({ substantialMismatch: false, issues: [], score: 95 });
      const requested = requestedFilesFromBody(body);
      return successResponse({ files: requested.map(({ path, language }) => ({ path, language, content: sourceByPath[path] })) });
    };
    const result = await generateProject(design, { generationId: "manifest-bounded-repair" });
    assert.equal(result.generatedFiles.length, 10);
    assert.equal(observedRepairFindings, true, "repair prompt includes all exact validator findings");
    assert.equal(observedRepairProfileContext, true, "repair prompt retains the expected visual profile contract");
    assert.equal(calls, 7); // initial + manifest + one repair + 3 file batches + advisory review
  });
});

test("invalid provider manifests log issue codes and shape without user content", async () => {
  await withProvider(async () => {
    let calls = 0;
    const logs = [];
    console.error = (...args) => logs.push(args.join(" "));
    global.fetch = async (_url, options) => {
      calls += 1;
      if (calls === 1) return limitedResponse();
      const body = JSON.parse(options.body);
      if (body.messages.find((message) => message.role === "system").content.includes("Stage A manifest response only")) {
        const invalid = manifest();
        invalid.files[0].language = "jsx";
        return successResponse(invalid);
      }
      throw new Error("unexpected file generation call");
    };
    await assert.rejects(generateProject({ ...context(), project: { prompt: "private user requirement" } }, { generationId: "manifest-diagnostic" }), (error) =>
      error.code === "GENERATION_MANIFEST_INVALID");
    const logged = logs.join("\n");
    assert.match(logged, /UNSUPPORTED_MANIFEST_FILE_TYPE/);
    assert.match(logged, /responseShape/);
    assert.doesNotMatch(logged, /private user requirement|frontend\/src\/App\.jsx|Cafe/);
    assert.equal(calls, 2);
  });
});

test("staged manifest must assign selected renderable assets to a file", () => {
  const selectedContext = {
    ...context(),
    visualReferences: [{ assetId: "asset-123", role: "content-asset" }],
  };
  const unassigned = validateGenerationManifest(manifest(), selectedContext, getStagedGenerationLimits());
  assert.ok(unassigned.issues.includes("REQUIRED_CONTENT_ASSET_UNASSIGNED"));
  const assignedManifest = manifest();
  assignedManifest.files.find((file) => file.path === "frontend/src/App.jsx").assetIds = ["asset-123"];
  const assigned = validateGenerationManifest(assignedManifest, selectedContext, getStagedGenerationLimits());
  assert.equal(assigned.valid, true);
});

test("file-generation calls receive the assigned trusted URL and relevant image input", () => {
  const trustedReference = "https://res.cloudinary.com/demo/image/upload/v1/hero.jpg";
  const payload = {
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "Return only one JSON object matching schemaVersion 1 and this shape: {\"schemaVersion\":1}." },
      { role: "user", content: [{ type: "text", text: "project requirements" }, { type: "text", text: "ASSET IMAGE 1: referenceId=asset-123; Hero; purpose=content-image. The next image part is the actual image input." }, { type: "image_url", image_url: { url: "data:image/png;base64,dGVzdA==" } }] },
    ],
  };
  const requested = [{ path: "frontend/src/App.jsx", language: "jsx", purpose: "Hero", dependencies: [], assetIds: ["asset-123"] }];
  const manifestValue = manifest();
  const result = makeStagedFilePayload(payload, manifestValue, requested, [], new Map([[
    "asset-123", { label: "ASSET IMAGE 1: referenceId=asset-123", image: { type: "image_url", image_url: { url: "data:image/png;base64,dGVzdA==" } } },
  ]]), getStagedGenerationLimits(), false, [{ assetId: "asset-123", purpose: "content-image", trustedReference }]);
  const serialized = JSON.stringify(result.messages);
  assert.ok(serialized.includes(trustedReference));
  assert.ok(serialized.includes("requestedAssets"));
  assert.ok(serialized.includes('"type":"image_url"'));
  assert.ok(serialized.includes("exact trustedReference URL"));
});

test("staged limits are configurable but cannot exceed canonical schema bounds", () => {
  const old = Object.fromEntries(["GENERATION_STAGED_MAX_FILES", "GENERATION_STAGED_MAX_CALLS", "GENERATION_STAGED_BATCH_SIZE", "GENERATION_STAGED_MAX_FILE_BYTES", "GENERATION_STAGED_MAX_TOTAL_BYTES"].map((name) => [name, process.env[name]]));
  process.env.GENERATION_STAGED_MAX_FILES = "24";
  process.env.GENERATION_STAGED_MAX_CALLS = "18";
  process.env.GENERATION_STAGED_BATCH_SIZE = "3";
  process.env.GENERATION_STAGED_MAX_FILE_BYTES = "32000";
  process.env.GENERATION_STAGED_MAX_TOTAL_BYTES = "500000";
  try {
    assert.deepEqual(getStagedGenerationLimits(), { maxFiles: 24, maxCalls: 18, batchSize: 3, maxFileBytes: 32000, maxTotalBytes: 500000 });
    process.env.GENERATION_STAGED_MAX_FILES = "1000";
    assert.equal(getStagedGenerationLimits().maxFiles, 32);
  } finally {
    for (const [name, value] of Object.entries(old)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test("a provider-call budget exhaustion stops staged generation before another request", async () => {
  await withProvider(async () => {
    const previous = process.env.GENERATION_STAGED_MAX_CALLS;
    process.env.GENERATION_STAGED_MAX_CALLS = "3";
    let calls = 0;
    global.fetch = async (_url, options) => {
      calls += 1;
      const body = JSON.parse(options.body);
      if (calls === 1) return limitedResponse();
      if (body.messages.find((message) => message.role === "system").content.includes("Stage A manifest response only")) return successResponse(manifest());
      const requested = requestedFilesFromBody(body);
      return successResponse({ files: requested.map(({ path, language }) => ({ path, language, content: sourceByPath[path] })) });
    };
    try {
      await assert.rejects(generateProject(context(), { generationId: "staged-call-budget" }), (error) => error.code === "GENERATION_CALL_LIMIT_EXCEEDED");
      assert.equal(calls, 3);
    } finally {
      if (previous === undefined) delete process.env.GENERATION_STAGED_MAX_CALLS;
      else process.env.GENERATION_STAGED_MAX_CALLS = previous;
    }
  });
});

test("cancellation during a staged file request stops subsequent batches", async () => {
  await withProvider(async () => {
    const controller = new AbortController();
    let calls = 0;
    global.fetch = async (_url, options) => {
      calls += 1;
      const body = JSON.parse(options.body);
      if (calls === 1) return limitedResponse();
      if (body.messages.find((message) => message.role === "system").content.includes("Stage A manifest response only")) return successResponse(manifest());
      controller.abort();
      const error = new Error("cancelled");
      error.name = "AbortError";
      throw error;
    };
    await assert.rejects(generateProject(context(), {
      generationId: "staged-cancel", signal: controller.signal,
    }), (error) => error.code === "GENERATION_CANCELLED");
    assert.equal(calls, 3);
  });
});

test("staged file responses enforce the per-file byte limit immediately", () => {
  const requested = [{ path: "frontend/src/App.jsx", language: "jsx" }];
  const response = { files: [{ ...requested[0], content: "x".repeat(16) }] };
  const result = validateStagedFileResponse(response, requested, { maxFileBytes: 8 });
  assert.equal(result.valid, false);
  assert.ok(result.issues.includes("STAGED_FILE_SIZE_EXCEEDED"));
});

test("staged package files must match the manifest dependency contract", () => {
  const requested = [{ path: "frontend/package.json", language: "json" }];
  const response = { files: [{ ...requested[0], content: JSON.stringify({
    name: "cafe", version: "1.0.0", dependencies: { react: "^18.0.0" },
  }) }] };
  const result = validateStagedFileResponse(response, requested, { maxFileBytes: 4096 }, manifest().packageConfiguration);
  assert.equal(result.valid, false);
  assert.ok(result.issues.includes("PACKAGE_CONFIGURATION_MISMATCH"));
});

test("staged JSON files are parsed before they are accepted", () => {
  const requested = [{ path: "frontend/package.json", language: "json" }];
  const result = validateStagedFileResponse({ files: [{ ...requested[0], content: "{\"incomplete\":" }] }, requested, { maxFileBytes: 4096 });
  assert.equal(result.valid, false);
  assert.ok(result.issues.includes("INVALID_JSON_FILE"));
});
