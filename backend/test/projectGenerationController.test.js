const assert = require("node:assert/strict");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");

const controllerPath = path.resolve(__dirname, "../src/controllers/projectController.js");
const projectStore = { _id: "507f1f77bcf86cd799439011", user: "user-a", projectName: "Old name", prompt: "Build a cafe website", requirements: { pages: ["Home"] }, inspirations: [{ inspirationId: "minimal" }], generationStatus: "ready", generatedFiles: [{ path: "old.txt", content: "keep previous output" }] };
let claimAvailable;
let generateMode;
let generationCalls;
let savedBeforeResponse;
let supersedeOnCommit;
let lastClaimFilter;

class MockGenerationError extends Error {
  constructor(message, code) { super(message); this.name = "ProjectGenerationError"; this.code = code; }
}

const mockProject = {
  async findOne() { return { ...projectStore, requirements: projectStore.requirements, inspirations: projectStore.inspirations }; },
  async findOneAndUpdate(query, update) {
    if (query.generationRunId) {
      if (supersedeOnCommit) return null;
      if (generateMode === "save-fails") throw new Error("private database detail");
      Object.assign(projectStore, update.$set);
      savedBeforeResponse = true;
      return { ...projectStore };
    }
    lastClaimFilter = query;
    if (!claimAvailable) return null;
    claimAvailable = false;
    Object.assign(projectStore, update.$set);
    return {
      ...projectStore,
      generatedFiles: projectStore.generatedFiles,
    };
  },
  async updateOne(_query, update) {
    projectStore.generationStatus = update.$set.generationStatus;
    projectStore.generationError = update.$set.generationError;
  },
};

const originalLoad = Module._load;
Module._load = function loadWithGenerationMocks(request, parent, isMain) {
  if (parent?.filename === controllerPath && request === "../models/Project") return mockProject;
  if (parent?.filename === controllerPath && request === "../generation/context/projectGenerationContext") return { buildProjectGenerationContext: async () => ({}) };
  if (parent?.filename === controllerPath && request === "../services/projectGenerationService") return {
    ProjectGenerationError: MockGenerationError,
    getGenerationBudgetMs: () => 270000,
    async generateProject() {
      generationCalls += 1;
      if (generateMode === "provider-fails") throw new MockGenerationError("safe provider failure", "PROVIDER_ERROR");
      if (generateMode === "staged-late-fails") throw new MockGenerationError("safe staged file failure", "STAGED_FILE_INCOMPLETE");
      if (generateMode === "staged-malformed") throw new MockGenerationError("staged files were malformed", "STAGED_FILE_INVALID");
      return { projectName: "New name", generatedFiles: [{ path: "new.txt", content: "new output" }], generationMetadata: {} };
    },
  };
  return originalLoad.call(this, request, parent, isMain);
};
const { generateProjectForUser } = require(controllerPath);
Module._load = originalLoad;

function setup(mode = "success") {
  Object.assign(projectStore, { projectName: "Old name", generationStatus: "ready", generationError: "", generatedFiles: [{ path: "old.txt", content: "keep previous output" }] });
  projectStore.generationStartedAt = null;
  projectStore.generationRunId = "";
  claimAvailable = true;
  generateMode = mode;
  generationCalls = 0;
  savedBeforeResponse = false;
  supersedeOnCommit = false;
  lastClaimFilter = null;
}

async function invoke() {
  const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  await generateProjectForUser({ params: { id: projectStore._id }, userId: "user-a" }, res);
  return res;
}

test("generation persists files before returning success", async () => {
  setup();
  const res = await invoke();
  assert.equal(res.statusCode, 200);
  assert.equal(savedBeforeResponse, true);
  assert.equal(projectStore.generationStatus, "completed");
  assert.equal(projectStore.generatedFiles[0].path, "new.txt");
});

test("provider failure marks the attempt failed and preserves previous generated files", async () => {
  setup("provider-fails");
  const res = await invoke();
  assert.equal(res.statusCode, 502);
  assert.equal(res.body.code, "PROVIDER_ERROR");
  assert.ok(res.body.requestId);
  assert.equal(projectStore.generationStatus, "failed");
  assert.equal(projectStore.generatedFiles[0].content, "keep previous output");
});

test("a later staged-file failure preserves the previously saved project output", async () => {
  setup("staged-late-fails");
  const res = await invoke();
  assert.equal(res.statusCode, 502);
  assert.equal(res.body.code, "STAGED_FILE_INCOMPLETE");
  assert.equal(projectStore.generationStatus, "failed");
  assert.deepEqual(projectStore.generatedFiles, [{ path: "old.txt", content: "keep previous output" }]);
});

test("staged assembly validation failure preserves the previously saved project output", async () => {
  setup("staged-malformed");
  const res = await invoke();
  assert.equal(res.statusCode, 422);
  assert.equal(res.body.code, "STAGED_FILE_INVALID");
  assert.equal(projectStore.generationStatus, "failed");
  assert.deepEqual(projectStore.generatedFiles, [{ path: "old.txt", content: "keep previous output" }]);
});

test("persistence failure marks generation failed and leaves the prior files intact", async () => {
  setup("save-fails");
  const res = await invoke();
  assert.equal(res.statusCode, 500);
  assert.equal(projectStore.generationStatus, "failed");
  assert.equal(projectStore.generatedFiles[0].content, "keep previous output");
});

test("competing generate requests cannot both claim and write a project", async () => {
  setup();
  const responses = await Promise.all([invoke(), invoke()]);
  assert.deepEqual(responses.map((response) => response.statusCode).sort(), [200, 409]);
  assert.equal(generationCalls, 1);
  assert.equal(projectStore.generationStatus, "completed");
});

test("a superseded generation cannot overwrite the newer run's project files", async () => {
  setup();
  supersedeOnCommit = true;
  const res = await invoke();
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.code, "GENERATION_SUPERSEDED");
  assert.equal(projectStore.generatedFiles[0].content, "keep previous output");
});

test("a stale generating record can be reclaimed using the lease timestamp", async () => {
  setup();
  projectStore.generationStatus = "generating";
  projectStore.updatedAt = new Date(Date.now() - 16 * 60 * 1000);
  const res = await invoke();
  assert.equal(res.statusCode, 200);
  assert.ok(lastClaimFilter.$or.some((branch) => branch.generationStatus === "generating" && branch.generationStartedAt === null && branch.updatedAt.$lt instanceof Date));
  assert.equal(projectStore.generationStatus, "completed");
});
