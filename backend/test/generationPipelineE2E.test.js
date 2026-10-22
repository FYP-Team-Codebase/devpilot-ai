const assert = require("node:assert/strict");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");

const generationService = require("../src/services/projectGenerationService");
const controllerPath = path.resolve(__dirname, "../src/controllers/projectController.js");
const projectId = "507f1f77bcf86cd799439011";
const userId = "507f1f77bcf86cd799439012";
const priorFiles = [{ path: "frontend/src/Old.jsx", language: "jsx", content: "old saved implementation" }];
let projectStore;
let failRepairWithTruncation;
let capturedContext;

const mockProject = {
  async findOne() { return { ...projectStore }; },
  async findOneAndUpdate(query, update) {
    if (query.generationRunId) {
      if (failRepairWithTruncation && projectStore.generationRunId !== query.generationRunId) return null;
      Object.assign(projectStore, update.$set);
      return { ...projectStore };
    }
    Object.assign(projectStore, update.$set);
    return { ...projectStore };
  },
  async updateOne(query, update) {
    if (projectStore.generationRunId === query.generationRunId) Object.assign(projectStore, update.$set);
    return { modifiedCount: 1 };
  },
};

const originalLoad = Module._load;
Module._load = function loadWithPipelineMocks(request, parent, isMain) {
  if (parent?.filename === controllerPath && request === "../models/Project") return mockProject;
  if (parent?.filename === controllerPath && request === "../generation/context/projectGenerationContext") {
    return { buildProjectGenerationContext: async (project) => {
      // Skip Asset persists empty selection arrays; the request context must not
      // recover old uploads from process-global or stale generation state.
      assert.deepEqual(project.assetSelections, []);
      assert.deepEqual(project.requirements.assetIds, []);
      capturedContext = {
        project: { id: projectId, name: project.projectName, prompt: project.prompt },
        requirements: { projectType: "Cafe", pages: ["Home"], features: ["Menu"] },
        inspirations: [{ id: "cafe", source: "devpilot", title: "Cafe" }],
        visualReferences: [],
        assetManifest: [],
        attachments: [],
      };
      return capturedContext;
    } };
  }
  if (parent?.filename === controllerPath && request === "../services/projectGenerationService") return generationService;
  return originalLoad.call(this, request, parent, isMain);
};
const { generateProjectForUser } = require(controllerPath);
Module._load = originalLoad;

const sourceByPath = {
  "frontend/package.json": '{"name":"cafe","version":"1.0.0","dependencies":{"react":"^19.0.0","react-dom":"^19.0.0"}}',
  "frontend/index.html": '<!doctype html><html><body><div id="root"></div></body></html>',
  "frontend/src/main.jsx": 'import React from "react"; import { createRoot } from "react-dom/client"; import App from "./App.jsx"; import "./index.css"; createRoot(document.getElementById("root")).render(<App />);',
  "frontend/src/App.jsx": 'import Nav from "./components/Nav.jsx"; import Hero from "./components/Hero.jsx"; import Footer from "./components/Footer.jsx"; export default function App(){return <><Nav/><Hero/><Footer/></>}',
  "frontend/src/components/Nav.jsx": 'export default function Nav(){return <nav><a href="/">Cafe</a><a href="/menu">Menu</a></nav>}',
  "frontend/src/components/Hero.jsx": 'export default function Hero(){return <main><h1>Seasonal Cafe</h1><p>Fresh menu every day.</p></main>}',
  "frontend/src/components/Footer.jsx": 'export default function Footer(){return <footer>Visit us today</footer>}',
  "frontend/src/style.css": "/* imported stylesheet intentionally has no authored declarations yet */",
  "backend/package.json": '{"name":"cafe-api","version":"1.0.0","dependencies":{"express":"^5.0.0","mongoose":"^8.0.0"}}',
  "backend/src/server.js": 'const app = require("./app"); app.listen(3000);',
  "backend/src/app.js": 'module.exports = require("express")();',
  "backend/src/routes.js": 'module.exports = [];',
  "README.md": "# Provider README should be omitted in this fixture",
  ".gitignore": "node_modules\n.env",
  ".env.example": "MONGO_URI=mongodb://localhost:27017/example",
};

function stagedManifest({ omitReadme = true } = {}) {
  const descriptions = [
    ["frontend/package.json", "json", []],
    ["frontend/index.html", "html", ["frontend/src/main.jsx"]],
    ["frontend/src/main.jsx", "jsx", ["frontend/src/App.jsx"]],
    ["frontend/src/App.jsx", "jsx", ["frontend/src/components/Nav.jsx", "frontend/src/components/Hero.jsx", "frontend/src/components/Footer.jsx"]],
    ["frontend/src/components/Nav.jsx", "jsx", []],
    ["frontend/src/components/Hero.jsx", "jsx", []],
    ["frontend/src/components/Footer.jsx", "jsx", []],
    ["frontend/src/style.css", "css", []],
    ["backend/package.json", "json", []],
    ["backend/src/server.js", "javascript", ["backend/src/app.js"]],
    ["backend/src/app.js", "javascript", ["backend/src/routes.js"]],
    ["backend/src/routes.js", "javascript", []],
    [".gitignore", "text", []],
    [".env.example", "text", []],
  ];
  if (!omitReadme) descriptions.push(["README.md", "markdown", []]);
  return {
    schemaVersion: 1,
    project: {
      name: "Seasonal Cafe",
      summary: "A cafe website with a responsive menu and navigation.",
      stack: ["React", "Vite", "Node.js", "Express", "MongoDB"],
      entrypoints: { frontend: "frontend/src/main.jsx", backend: "backend/src/server.js" },
    },
    packageConfiguration: {
      frontendDependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
      backendDependencies: { express: "^5.0.0", mongoose: "^8.0.0" },
    },
    designProfiles: [],
    sharedContracts: "App exports default; entrypoint mounts App; backend exports the Express app.",
    files: descriptions.map(([filePath, language, dependencies]) => ({
      path: filePath,
      language,
      purpose: filePath === "README.md" ? "Project overview" : `Generated ${filePath}`,
      dependencies,
      assetIds: [],
    })),
  };
}

function jsonResponse(value, finishReason = "stop") {
  return { ok: true, json: async () => ({ choices: [{ finish_reason: finishReason, message: { content: JSON.stringify(value) } }] }) };
}

function limitedResponse() {
  return jsonResponse({ files: [{ path: "partial" }] }, "length");
}

function requestedFiles(body) {
  const user = body.messages.find((message) => message.role === "user");
  const texts = user.content.filter((part) => part.type === "text").map((part) => part.text);
  const match = texts.map((text) => text.match(/these requested paths, in this order: (\[[\s\S]*?\])\. Do not include/)).find(Boolean);
  assert.ok(match, "staged request lists its exact requested files");
  return JSON.parse(match[1]);
}

function resetProject() {
  projectStore = {
    _id: projectId,
    user: userId,
    projectName: "Seasonal Cafe",
    prompt: "Build a cafe site",
    requirements: { projectType: "Cafe", pages: ["Home"], features: ["Menu"], assetIds: [] },
    assetSelections: [],
    inspirations: [{ source: "devpilot", inspirationId: "cafe" }],
    generationStatus: "ready",
    generationRunId: "",
    generationStartedAt: null,
    generatedFiles: priorFiles.map((file) => ({ ...file })),
  };
  capturedContext = null;
}

async function invokeController() {
  const req = { params: { id: projectId }, userId, once() {}, on() {}, off() {} };
  const res = {
    statusCode: 200,
    destroyed: false,
    writableEnded: false,
    status(statusCode) { this.statusCode = statusCode; return this; },
    json(body) { this.body = body; this.writableEnded = true; return this; },
    once() {},
    off() {},
  };
  await generateProjectForUser(req, res);
  return res;
}

async function withProvider(mode, run) {
  const old = { key: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL, fetch: global.fetch, info: console.info, warn: console.warn, error: console.error };
  process.env.OPENAI_API_KEY = "mock-e2e-key";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
  let callCount = 0;
  let readmeRequested = false;
  const seenBodies = [];
  global.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    seenBodies.push(body);
    callCount += 1;
    const system = body.messages.find((message) => message.role === "system")?.content || "";
    if (callCount === 1) return limitedResponse();
    if (system.includes("Stage A manifest response only")) return jsonResponse(stagedManifest());
    const lastUser = body.messages.at(-1);
    if (typeof lastUser.content === "string" && lastUser.content.includes("Make only the smallest changes")) {
      if (mode === "truncated-repair") return limitedResponse();
      return jsonResponse({ files: [{ path: "frontend/src/index.css", content: "nav{display:flex;gap:1rem} nav a{text-decoration:none;color:#222} @media(max-width:600px){nav{flex-wrap:wrap}}" }] });
    }
    const requested = requestedFiles(body);
    if (requested.some((file) => file.path === "README.md")) readmeRequested = true;
    return jsonResponse({ files: requested.filter((file) => file.path !== "README.md").map(({ path: filePath, language }) => ({ path: filePath, language, content: sourceByPath[filePath] })) });
  };
  try {
    const value = await run({ get callCount() { return callCount; }, get readmeRequested() { return readmeRequested; }, seenBodies });
    return value;
  } finally {
    if (old.key === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = old.key;
    if (old.model === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = old.model;
    global.fetch = old.fetch;
    console.info = old.info;
    console.warn = old.warn;
    console.error = old.error;
  }
}

test("large staged generation repairs README and unresolved CSS import, then persists only validated output", async () => {
  resetProject();
  await withProvider("success", async (provider) => {
    const response = await invokeController();
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(projectStore.generationStatus, "completed");
    assert.ok(provider.callCount > 5, "the large project was split into bounded batches");
    assert.equal(provider.readmeRequested, true, "README was declared by the normalized manifest and requested");
    assert.ok(capturedContext);
    assert.deepEqual(capturedContext.assetManifest, [], "Skip Asset supplies no stale uploads");
    assert.ok(provider.seenBodies.every((body) => !body.messages.some((message) => Array.isArray(message.content) && message.content.some((part) => part.type === "image_url"))));
    assert.ok(provider.seenBodies.every((body) => !JSON.stringify(body).includes("old-upload.example")));
    const persisted = projectStore.generatedFiles;
    const paths = new Set(persisted.map((file) => file.path));
    assert.ok(paths.has("README.md"));
    assert.ok(paths.has("frontend/src/index.css"), "the exact imported stylesheet is repaired deterministically");
    assert.match(persisted.find((file) => file.path === "README.md").content, /Seasonal Cafe/);
    assert.match(persisted.find((file) => file.path === "README.md").content, /components\/Nav\.jsx/);
    assert.deepEqual(require("../src/generation/validators/frontendQualityValidator").validateFrontendQuality(persisted), []);
    const { validateGeneratedProject } = require("../src/generation/validators/generatedProjectValidator");
    assert.equal(validateGeneratedProject({ schemaVersion: 1, project: stagedManifest().project, files: persisted }).valid, true);
    assert.match(persisted.find((file) => file.path === "frontend/src/index.css").content, /nav\s*\{/);
    assert.notDeepEqual(persisted, priorFiles, "all output is persisted before the endpoint reports success");
  });
});

test("truncated targeted repair fails safely and leaves prior saved output intact", async () => {
  resetProject();
  await withProvider("truncated-repair", async (provider) => {
    const response = await invokeController();
    assert.equal(response.statusCode, 502);
    assert.equal(response.body.code, "QUALITY_REPAIR_PROVIDER_FAILED");
    assert.ok(response.body.requestId);
    assert.equal(projectStore.generationStatus, "failed");
    assert.deepEqual(projectStore.generatedFiles, priorFiles);
    assert.equal(provider.readmeRequested, true);
    assert.ok(provider.callCount > 5);
  });
});
