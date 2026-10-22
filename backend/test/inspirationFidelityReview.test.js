const assert = require("node:assert/strict");
const test = require("node:test");
const {
  buildInspirationReviewPayload,
  expectedDesignProfileConfiguration,
  parseInspirationReview,
  validateDesignProfiles,
} = require("../src/services/inspirationFidelityReview");
const { createProviderMessages, generateProject, validateSelectedAssetUsage } = require("../src/services/projectGenerationService");

const imageUrl = "data:image/png;base64,aW5zcGlyYXRpb24=";
const references = [
  { assetId: "brand-ref", role: "visual-inspiration", purpose: "design-reference", placement: "ai", placementDetails: "", customPurpose: "", instructions: "Use the warm editorial mood", url: imageUrl },
  { assetId: "hero-image", role: "visual-inspiration", purpose: "background", placement: "hero", placementDetails: "", customPurpose: "", instructions: "Keep the subject on the right", url: "data:image/png;base64,aGVybw==" },
];

function profile(reference, palette = ["#18231f", "#e7ba78"]) {
  return {
    referenceId: reference.assetId,
    purpose: reference.purpose,
    placement: reference.placement,
    placementDetails: reference.placementDetails,
    customPurpose: reference.customPurpose,
    instructions: reference.instructions,
    palette,
    contrast: "Dark foreground against warm light surfaces",
    typography: "Editorial serif headings with restrained sans-serif body text",
    navigation: "Compact horizontal navigation with clear active state",
    composition: "Asymmetric hero followed by compact content sections",
    spacing: "Generous section spacing with tight card internals",
    components: "Thin borders and restrained rounded corners",
    imageTreatment: "Wide crops with the subject kept visible",
    mood: "Warm, editorial, confident",
    distinctiveFeatures: ["Offset hero composition", "Muted amber accents"],
  };
}

function project(profiles = references.map((reference) => profile(reference))) {
  return {
    schemaVersion: 1,
    designProfiles: profiles,
    project: {
      name: "Cafe", summary: "A polished cafe website.",
      stack: ["React", "Vite", "Node.js", "Express", "MongoDB"],
      entrypoints: { frontend: "frontend/src/main.jsx", backend: "backend/src/server.js" },
    },
    files: [
      { path: "frontend/package.json", language: "json", content: '{"name":"cafe","version":"1.0.0","dependencies":{"react":"^19.0.0","react-dom":"^19.0.0"}}' },
      { path: "frontend/index.html", language: "html", content: '<!doctype html><html><body><div id="root"></div></body></html>' },
      { path: "frontend/src/main.jsx", language: "jsx", content: 'import App from "./App.jsx"; import "./style.css"; createRoot(document.getElementById("root")).render(<App />);' },
      { path: "frontend/src/App.jsx", language: "jsx", content: 'export default function App(){return <><nav><a href="/">Cafe</a></nav><main><h1>Seasonal dining</h1><section className="hero"><img src="https://res.cloudinary.com/demo/hero.png" alt="Cafe" /></section></main></>}' },
      { path: "frontend/src/style.css", language: "css", content: ':root{--ink:#18231f;--amber:#e7ba78}body{color:var(--ink);font-family:Georgia,serif}nav{display:flex;gap:1rem}main{max-width:72rem;margin:auto;padding:2rem}.hero{display:grid;grid-template-columns:1fr 1fr}.hero img{width:100%;height:auto}@media(max-width:700px){.hero{grid-template-columns:1fr}}' },
      { path: "backend/package.json", language: "json", content: '{"name":"cafe-api","version":"1.0.0","dependencies":{"express":"^5.0.0","mongoose":"^8.0.0"}}' },
      { path: "backend/src/server.js", language: "javascript", content: "const app = require('./app'); app.listen(3000);" },
      { path: "backend/src/app.js", language: "javascript", content: "module.exports = require('express')();" },
      { path: "README.md", language: "markdown", content: "# Cafe" },
      { path: ".gitignore", language: "text", content: "node_modules" },
      { path: ".env.example", language: "text", content: "MONGODB_URI=your_mongodb_uri_here" },
    ],
  };
}

function providerResponse(content) {
  return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(content) } }] }) };
}

test("visual design profiles retain the correct reference identity and independent asset settings", () => {
  const profiles = references.map((reference) => profile(reference));
  assert.deepEqual(validateDesignProfiles({ visualReferences: references }, profiles), []);
  assert.deepEqual(validateDesignProfiles({ visualReferences: references }, [profile(references[0]), profile(references[1], ["#fff"])]), []);
  const wronglyAssociated = profiles.map((item) => ({ ...item }));
  wronglyAssociated[1].instructions = "Use the warm editorial mood";
  assert.ok(validateDesignProfiles({ visualReferences: references }, wronglyAssociated)
    .some((issue) => issue.code === "PROFILE_CONFIGURATION_MISMATCH" && issue.fields.some((field) => field.field === "instructions")));
  assert.deepEqual(expectedDesignProfileConfiguration({ visualReferences: references })[0], {
    referenceId: "brand-ref", purpose: "design-reference", placement: "ai", placementDetails: "", customPurpose: "", instructions: "Use the warm editorial mood",
  });
});

function missingIndexStylesheet(candidate) {
  const next = JSON.parse(JSON.stringify(candidate));
  const main = next.files.find((file) => file.path === "frontend/src/main.jsx");
  main.content = main.content.replace('./style.css', './index.css');
  return next;
}

function addIndexStylesheet(candidate) {
  const next = JSON.parse(JSON.stringify(candidate));
  next.files.push({ path: "frontend/src/index.css", language: "css", content: '@import "./style.css";' });
  return next;
}

async function withGenerationProvider(responses, run) {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  const previousInfo = console.info;
  const previousWarn = console.warn;
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  console.warn = () => {};
  let call = 0;
  global.fetch = async () => providerResponse(responses[Math.min(call++, responses.length - 1)]);
  try { return await run(() => call); } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
    global.fetch = previousFetch;
    console.info = previousInfo;
    console.warn = previousWarn;
  }
}

test("saved profile configuration is restored while a missing stylesheet is repaired deterministically", async () => {
  const initial = missingIndexStylesheet(project());
  initial.designProfiles[0].placement = "hero";
  const configPatch = { designProfiles: [{ referenceId: "brand-ref", purpose: "design-reference", placement: "ai", placementDetails: "", customPurpose: "", instructions: "Use the warm editorial mood" }] };
  const result = await withGenerationProvider([initial, { substantialMismatch: false, score: 90, issues: [] }, configPatch, { substantialMismatch: false, score: 90, issues: [] }], async (getCalls) => {
    const value = await generateProject({ project: { prompt: "Cafe" }, requirements: {}, assetManifest: [], visualReferences: references });
    assert.equal(getCalls(), 4);
    return value;
  });
  assert.ok(result.generatedFiles.some((file) => file.path === "frontend/src/index.css"));
});

test("repair that restores the imported stylesheet and every reference profile passes validation", async () => {
  const initial = missingIndexStylesheet(project());
  initial.designProfiles[0].placement = "hero";
  const configPatch = { designProfiles: [{ referenceId: "brand-ref", purpose: "design-reference", placement: "ai", placementDetails: "", customPurpose: "", instructions: "Use the warm editorial mood" }] };
  const result = await withGenerationProvider([initial, { substantialMismatch: false, score: 90, issues: [] }, configPatch, { substantialMismatch: false, score: 90, issues: [] }], async (getCalls) => {
    const value = await generateProject({ project: { prompt: "Cafe" }, requirements: {}, assetManifest: [], visualReferences: references });
    assert.equal(getCalls(), 4);
    return value;
  });
  assert.ok(result.generatedFiles.some((file) => file.path === "frontend/src/index.css"));
  assert.deepEqual(require("../src/generation/validators/frontendQualityValidator").validateFrontendQuality(result.generatedFiles), []);
});

test("review request contains actual reference images, per-image instructions, and generated source", () => {
  const payload = buildInspirationReviewPayload({ project: { prompt: "Make a cafe site" }, visualReferences: references }, project().files, references.map((reference) => profile(reference)), "gpt-4.1-mini");
  const user = payload.messages.at(-1);
  assert.equal(user.content.filter((part) => part.type === "image_url").length, 2);
  assert.ok(user.content.some((part) => part.type === "image_url" && part.image_url.url === imageUrl));
  assert.match(user.content[0].text, /A URL match or a few matching colors alone is not evidence/i);
  assert.match(user.content[0].text, /Use the warm editorial mood/);
  assert.match(user.content[0].text, /Generated frontend source/);
  assert.equal(parseInspirationReview({ substantialMismatch: false, score: 82, issues: [] }).score, 82);
  assert.equal(parseInspirationReview({ substantialMismatch: true, issues: ["Material visual mismatch"] }).substantialMismatch, true);
  assert.equal(parseInspirationReview({ substantialMismatch: "false" }), null);
});

test("reference-only images guide design without becoming required page content, and explicit instructions win", () => {
  const messages = createProviderMessages({ visualReferences: [references[0]] });
  const userText = messages.find((message) => message.role === "user").content[0].text;
  assert.match(userText, /written requirements and explicit per-asset instructions take priority/i);
  assert.match(userText, /do not render the reference screenshot itself/i);
  assert.doesNotThrow(() => validateSelectedAssetUsage({ assetManifest: [{
    filename: "reference.png", purpose: "design-reference", content: "image-input",
    trustedReference: "https://res.cloudinary.com/demo/reference.png",
  }] }, [{ path: "frontend/src/App.jsx", content: "export default () => <main>Inspired composition</main>;" }]));
});

test("a confirmed source-level mismatch gets one targeted repair and retains per-reference image inputs", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  const previousInfo = console.info;
  const previousWarn = console.warn;
  const calls = [];
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  console.warn = () => {};
  global.fetch = async (_url, options) => {
    const request = JSON.parse(options.body);
    calls.push(request);
    if (calls.length === 1) return providerResponse(project());
    if (calls.length === 2) return providerResponse({ substantialMismatch: true, score: 35, issues: ["The source styles navigation as a browser-default vertical list and omits the reference's asymmetric section composition."] });
    if (calls.length === 3) return providerResponse({ files: project().files.filter((file) => file.path.startsWith("frontend/")).map(({ path, content }) => ({ path, content })) });
    return providerResponse({ substantialMismatch: false, score: 88, issues: [] });
  };

  try {
    const result = await generateProject({
      project: { prompt: "Create a cafe website with a menu and booking form" },
      requirements: { pages: ["Home", "Menu"] },
      assetManifest: [], visualReferences: references,
    });
    assert.equal(calls.length, 4);
    assert.ok(calls[0].messages.at(-1).content.some((part) => part.type === "image_url" && part.image_url.url === imageUrl));
    assert.match(calls[0].messages.at(-1).content[0].text, /SAVED DESIGN PROFILE CONFIGURATION/);
    assert.ok(calls[1].messages.at(-1).content.some((part) => part.type === "image_url" && part.image_url.url === imageUrl));
    const repairMessage = calls[2].messages.at(-1).content;
    assert.match(repairMessage, /INSPIRATION_FIDELITY_MISMATCH/);
    assert.match(repairMessage, /smallest changes/);
    assert.ok(calls[2].messages.find((message) => message.role === "user").content.some((part) => part.type === "image_url" && part.image_url.url === imageUrl));
    assert.equal(result.generatedFiles.some((file) => file.path === "frontend/src/style.css"), true);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
    global.fetch = previousFetch;
    console.info = previousInfo;
    console.warn = previousWarn;
  }
});

test("failed fidelity improvement retains the first valid project and valid alternative layouts need no repair", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  const previousInfo = console.info;
  const previousWarn = console.warn;
  let calls = 0;
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  console.warn = () => {};
  global.fetch = async () => {
    calls += 1;
    if (calls === 1) return providerResponse(project());
    if (calls === 2) return providerResponse({ substantialMismatch: true, score: 30, issues: ["Weak visual translation"] });
    return { ok: false, status: 503 };
  };
  try {
    const result = await generateProject({ project: { prompt: "Cafe" }, requirements: {}, assetManifest: [], visualReferences: references });
    assert.equal(calls, 3);
    assert.equal(result.projectName, "Cafe");
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
    global.fetch = previousFetch;
    console.info = previousInfo;
    console.warn = previousWarn;
  }
});
