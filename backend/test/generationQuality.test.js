const assert = require("node:assert/strict");
const test = require("node:test");
const { createProviderMessages, generateProject, makeQualityRepairPayload, normalizeManifestDesignProfiles, PROJECT_PROFILE_CONTRACT, validateDesignProfiles } = require("../src/services/projectGenerationService");
const { validateFrontendQuality } = require("../src/generation/validators/frontendQualityValidator");

function generatedProject({ styled = false } = {}) {
  return {
    schemaVersion: 1,
    project: {
      name: "Restaurant",
      summary: "A responsive restaurant website.",
      stack: ["React", "Vite", "Node.js", "Express", "MongoDB"],
      entrypoints: { frontend: "frontend/src/main.jsx", backend: "backend/src/server.js" },
    },
    files: [
      { path: "frontend/package.json", language: "json", content: '{"name":"restaurant","version":"1.0.0","dependencies":{"react":"^19.0.0","react-dom":"^19.0.0"}}' },
      { path: "frontend/index.html", language: "html", content: '<!doctype html><html><body><div id="root"></div></body></html>' },
      { path: "frontend/src/main.jsx", language: "jsx", content: `import App from "./App.jsx"; ${styled ? 'import "./style.css";' : ""} createRoot(document.getElementById("root")).render(<App />);` },
      { path: "frontend/src/App.jsx", language: "jsx", content: 'export default function App() { return <><nav><ul><li><a href="/">Menu</a></li></ul></nav><main><h1>Restaurant</h1></main></>; }' },
      { path: "frontend/src/style.css", language: "css", content: styled ? "nav { display:flex; gap:1rem; } a { color:#222; text-decoration:none; } @media (max-width:600px) { nav { flex-wrap:wrap; } }" : ".unused { color:red; }" },
      { path: "backend/package.json", language: "json", content: '{"name":"restaurant-api","version":"1.0.0","dependencies":{"express":"^5.0.0","mongoose":"^8.0.0"}}' },
      { path: "backend/src/server.js", language: "javascript", content: "const app = require('./app'); app.listen(3000);" },
      { path: "backend/src/app.js", language: "javascript", content: "module.exports = require('express')();" },
      { path: "README.md", language: "markdown", content: "# Restaurant" },
      { path: ".gitignore", language: "text", content: "node_modules" },
      { path: ".env.example", language: "text", content: "MONGODB_URI=your_mongodb_uri_here" },
    ],
  };
}

function mockProviderResponse(project) {
  return { ok: true, json: async () => ({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(project) } }] }) };
}

function mockRepairResponse(project) {
  const files = project.files.filter((file) => ["frontend/src/main.jsx", "frontend/src/App.jsx", "frontend/src/style.css"].includes(file.path))
    .map(({ path, content }) => ({ path, content }));
  return mockProviderResponse({ files });
}

test("one targeted repair fixes objective unstyled navigation while preserving the complete output", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  const previousInfo = console.info;
  const calls = [];
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  global.fetch = async (_url, options) => {
    calls.push(JSON.parse(options.body));
    return calls.length === 1 ? mockProviderResponse(generatedProject()) : mockRepairResponse(generatedProject({ styled: true }));
  };

  try {
    const result = await generateProject({
      project: { prompt: "Create a polished responsive restaurant site" },
      requirements: { pages: ["Home", "Menu"] },
      visualReferences: [],
      assetManifest: [],
    });
    assert.equal(calls.length, 2);
    assert.equal(calls[0].max_completion_tokens, 32768);
    assert.equal(result.generatedFiles.find((file) => file.path === "frontend/src/style.css").content.includes("@media"), true);
    assert.deepEqual(validateFrontendQuality(result.generatedFiles), []);
    assert.match(calls[1].messages.at(-1).content, /smallest changes/i);
    assert.equal(calls[1].messages.at(-2).role, "assistant");
    assert.deepEqual(Object.keys(JSON.parse(calls[1].messages.at(-2).content)), ["files"]);
    assert.equal(calls[1].messages.at(-1).content.includes("Return JSON only with this exact patch shape"), true);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
    global.fetch = previousFetch;
    console.info = previousInfo;
  }
});

test("failed repair is bounded to one attempt and returns actionable diagnostics", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  const previousInfo = console.info;
  let calls = 0;
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  global.fetch = async () => { calls += 1; return calls === 1 ? mockProviderResponse(generatedProject()) : mockRepairResponse(generatedProject()); };

  try {
    await assert.rejects(generateProject({
      project: { prompt: "Create a responsive restaurant site" },
      requirements: {},
      visualReferences: [],
      assetManifest: [],
    }), (error) => error.code === "QUALITY_REPAIR_FAILED" && /after one targeted repair attempt/i.test(error.message) && /navigation/i.test(error.message));
    assert.equal(calls, 2);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
    global.fetch = previousFetch;
    console.info = previousInfo;
  }
});

test("a missing imported stylesheet is restored before provider repair from existing project styles", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  const previousInfo = console.info;
  let calls = 0;
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  const candidate = generatedProject();
  candidate.files.find((file) => file.path === "frontend/src/main.jsx").content = 'import App from "./App.jsx"; import "./index.css"; createRoot(document.getElementById("root")).render(<App />);';
  global.fetch = async () => { calls += 1; return mockProviderResponse(candidate); };
  try {
    const result = await generateProject({ project: { prompt: "A responsive restaurant site" }, requirements: {}, visualReferences: [], assetManifest: [] });
    const generatedCss = result.generatedFiles.find((file) => file.path === "frontend/src/index.css");
    assert.equal(calls, 1);
    assert.match(generatedCss.content, /@import ["']\.\/style\.css["']/);
    assert.deepEqual(validateFrontendQuality(result.generatedFiles), []);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
    global.fetch = previousFetch;
    console.info = previousInfo;
  }
});

test("normal generation adds a concise README only when absent and preserves an existing README", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  const previousInfo = console.info;
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  const noReadme = generatedProject({ styled: true });
  noReadme.files = noReadme.files.filter((file) => file.path !== "README.md");
  global.fetch = async () => mockProviderResponse(noReadme);
  try {
    const result = await generateProject({ project: { prompt: "A responsive restaurant site" }, requirements: {}, visualReferences: [], assetManifest: [] });
    const readme = result.generatedFiles.find((file) => file.path === "README.md");
    assert.equal(readme.language, "markdown");
    assert.match(readme.content, /# Restaurant/);
    assert.match(readme.content, /A responsive restaurant website/);
    assert.match(readme.content, /frontend\/src\/App\.jsx/);
    assert.match(readme.content, /React/);

    const existing = generatedProject({ styled: true });
    const originalContent = existing.files.find((file) => file.path === "README.md").content;
    global.fetch = async () => mockProviderResponse(existing);
    const preserved = await generateProject({ project: { prompt: "A responsive restaurant site" }, requirements: {}, visualReferences: [], assetManifest: [] });
    assert.equal(preserved.generatedFiles.find((file) => file.path === "README.md").content, originalContent);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
    global.fetch = previousFetch;
    console.info = previousInfo;
  }
});

test("README fallback does not hide another missing required file", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  const previousInfo = console.info;
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  const candidate = generatedProject({ styled: true });
  candidate.files = candidate.files.filter((file) => !["README.md", "backend/src/app.js"].includes(file.path));
  global.fetch = async () => mockProviderResponse(candidate);
  try {
    await assert.rejects(generateProject({ project: { prompt: "A responsive restaurant site" }, visualReferences: [], assetManifest: [] }),
      (error) => error.code === "INVALID_GENERATED_PROJECT" && /backend\/src\/app\.js/.test(error.message));
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
    global.fetch = previousFetch;
    console.info = previousInfo;
  }
});

test("repair provider failure is distinct from repair validation and preserves initial rule findings", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  const previousInfo = console.info;
  const previousError = console.error;
  const logs = [];
  let calls = 0;
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  console.error = (...args) => logs.push(args.join(" "));
  global.fetch = async () => {
    calls += 1;
    return calls === 1 ? mockProviderResponse(generatedProject()) : { ok: false, status: 503 };
  };

  try {
    await assert.rejects(generateProject({
      project: { prompt: "Create a responsive restaurant site" },
      requirements: {}, visualReferences: [], assetManifest: [],
    }, { generationId: "gen-repair-test" }), (error) => error.code === "QUALITY_REPAIR_PROVIDER_FAILED"
      && error.generationId === "gen-repair-test"
      && error.phase === "quality-repair"
      && error.providerErrorCategory === "server_error"
      && /UNSTYLED_NAVIGATION/.test(error.message)
      && /repair-provider-http/.test(error.message)
      && /HTTP 503/.test(error.message));
    assert.equal(calls, 2);
    assert.match(logs.join("\n"), /initialIssueCodes.*UNSTYLED_NAVIGATION/);
    assert.match(logs.join("\n"), /upstreamStatus.*503/);
    assert.doesNotMatch(logs.join("\n"), /test-only|Authorization|Bearer/);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
    global.fetch = previousFetch;
    console.info = previousInfo;
    console.error = previousError;
  }
});

test("repair output that remains invalid reports both original and remaining quality rules", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  const previousInfo = console.info;
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  let calls = 0;
  global.fetch = async () => {
    calls += 1;
    return calls === 1 ? mockProviderResponse(generatedProject()) : mockRepairResponse(generatedProject());
  };
  try {
    await assert.rejects(generateProject({
      project: { prompt: "Create a responsive restaurant site" },
      requirements: {}, visualReferences: [], assetManifest: [],
    }), (error) => error.code === "QUALITY_REPAIR_FAILED"
      && /initial frontend quality checks failed \(1\)/i.test(error.message)
      && /UNSTYLED_NAVIGATION/.test(error.message)
      && /repair-quality-check/.test(error.message)
      && /REPAIR_QUALITY_NOT_PASSED/.test(error.message)
      && /repair validation findings \(1\): UNSTYLED_NAVIGATION/i.test(error.message));
    assert.equal(calls, 2);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
    global.fetch = previousFetch;
    console.info = previousInfo;
  }
});

test("repair request retains original multimodal prompt and reference parts", () => {
  const original = { model: "gpt-4.1-mini", messages: [{ role: "system", content: "Rules" }, { role: "user", content: [{ type: "text", text: "Original requirements" }, { type: "image_url", image_url: { url: "data:image/png;base64,cmVm" } }] }] };
  const repair = makeQualityRepairPayload(original, generatedProject(), [{ code: "UNRESOLVED_LOCAL_IMPORT", path: "frontend/src/main.jsx", specifier: "./index.css", message: "Add the required stylesheet." }], {
    visualReferences: [{ assetId: "ref-1", role: "visual-inspiration", purpose: "background", placement: "hero", placementDetails: "right side", customPurpose: "", instructions: "Keep the subject visible" }],
  });

  assert.equal(repair.messages[1].content.some((part) => part.type === "image_url"), false);
  assert.match(repair.messages.at(-1).content, /UNRESOLVED_LOCAL_IMPORT/);
  assert.match(repair.messages.at(-1).content, /smallest changes/);
  assert.match(repair.messages.at(-1).content, /frontend\/src\/main\.jsx/);
  assert.match(repair.messages.at(-1).content, /Saved design profile configuration/);
  assert.match(repair.messages.at(-1).content, /"placement":"hero"/);
  const contractText = JSON.stringify(PROJECT_PROFILE_CONTRACT);
  assert.ok(createProviderMessages({})[0].content.includes(contractText));
  assert.ok(repair.messages.at(-1).content.includes(contractText));
  assert.equal(JSON.parse(repair.messages.at(-2).content).files.length < generatedProject().files.length, true);

  const fidelityRepair = makeQualityRepairPayload(original, generatedProject(), [{ code: "INSPIRATION_FIDELITY_MISMATCH", message: "Reconcile the typography." }]);
  assert.equal(fidelityRepair.messages[1].content[1].image_url.url, "data:image/png;base64,cmVm");
});

test("saved design profile configuration is canonicalized before exact profile validation", () => {
  const context = { visualReferences: [{ assetId: "ref-1", role: "visual-inspiration", purpose: "palette", placement: "hero", placementDetails: "right aligned", customPurpose: "", instructions: "Keep subject visible" }] };
  const providerProfile = { referenceId: "ref-1", purpose: "style", placement: "center", placementDetails: "", customPurpose: "", instructions: "", contrast: "high", typography: "serif", navigation: "top", composition: "balanced", spacing: "wide", components: "cards", imageTreatment: "cropped", mood: "calm", palette: ["#fff"], distinctiveFeatures: ["lines"] };
  assert.equal(validateDesignProfiles(context, [providerProfile]).some((issue) => issue.code === "PROFILE_CONFIGURATION_MISMATCH"), true);
  const normalized = normalizeManifestDesignProfiles(context, [providerProfile]);
  assert.deepEqual(validateDesignProfiles(context, normalized), []);
  assert.equal(normalized[0].typography, "serif");
});

test("truncated targeted repair is reported as incomplete and never treated as a successful project", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  const previousInfo = console.info;
  const previousError = console.error;
  let calls = 0;
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  console.error = () => {};
  global.fetch = async () => {
    calls += 1;
    return calls === 1 ? mockProviderResponse(generatedProject())
      : { ok: true, json: async () => ({ choices: [{ finish_reason: "length", message: { content: "{\\\"files\\\":[" } }] }) };
  };
  try {
    await assert.rejects(generateProject({ project: { prompt: "Build a responsive site" }, visualReferences: [], assetManifest: [] }),
      (error) => error.code === "QUALITY_REPAIR_PROVIDER_FAILED" && error.providerErrorCategory === "token_limit" && error.phase === "quality-repair");
    assert.equal(calls, 2);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
    global.fetch = previousFetch;
    console.info = previousInfo;
    console.error = previousError;
  }
});

test("transient provider failure retries once then accepts a valid project", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  const previousInfo = console.info;
  let calls = 0;
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  global.fetch = async () => {
    calls += 1;
    return calls === 1 ? { ok: false, status: 429, headers: { get: (name) => name === "retry-after-ms" ? "0" : null }, json: async () => ({ error: { type: "rate_limit_error" } }) }
      : mockProviderResponse(generatedProject({ styled: true }));
  };
  try {
    const result = await generateProject({ project: { prompt: "Build a responsive site" }, visualReferences: [], assetManifest: [] }, { generationId: "gen-retry" });
    assert.equal(calls, 2);
    assert.equal(result.generatedFiles.length, generatedProject({ styled: true }).files.length);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
    global.fetch = previousFetch;
    console.info = previousInfo;
  }
});

test("token-truncated full output switches to a bounded manifest request without replaying the full prompt", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  const previousInfo = console.info;
  const sentPayloads = [];
  let calls = 0;
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  global.fetch = async (_url, options) => {
    calls += 1;
    sentPayloads.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ choices: [{ finish_reason: "length", message: { content: "{\"files\":[" } }] }) };
  };
  try {
    await assert.rejects(generateProject({ project: { prompt: "Build a large app" } }, { generationId: "gen-truncated" }), (error) =>
      error.code === "INCOMPLETE_PROVIDER_RESPONSE" && error.providerErrorCategory === "token_limit" && error.generationId === "gen-truncated");
    assert.equal(sentPayloads[0].max_completion_tokens, 32768);
    assert.equal(sentPayloads[1].max_completion_tokens, 4096);
    assert.match(sentPayloads[1].messages[0].content, /Stage A manifest response only/);
    assert.equal(calls, 2);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
    global.fetch = previousFetch;
    console.info = previousInfo;
  }
});
