const assert = require("node:assert/strict");
const test = require("node:test");
const { extractPdfText } = require("../src/generation/context/assetContent");
const {
  buildProviderPayload,
  createProviderMessages,
  generateProject,
  modelSupportsImageInput,
  summarizeProviderPayload,
  getMaxCompletionTokens,
  DEFAULT_MAX_COMPLETION_TOKENS,
} = require("../src/services/projectGenerationService");

function createTextPdf(text) {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(`BT /F1 12 Tf 72 720 Td (${text}) Tj ET`)} >>\nstream\nBT /F1 12 Tf 72 720 Td (${text}) Tj ET\nendstream`,
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { body += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(body);
}

test("extracts actual text from PDF attachments", async () => {
  const text = await extractPdfText(createTextPdf("Build a calm booking dashboard"));
  assert.match(text, /Build a calm booking dashboard/);
});

test("sends selected visual references as Chat Completions image_url content parts", () => {
  const messages = createProviderMessages({
    project: { prompt: "Build a studio site" },
    attachments: [{ filename: "brief.pdf", extractedText: "Include booking and pricing" }],
    inspirations: [{ source: "userAsset", title: "Reference" }],
    visualReferences: [
      { role: "visual-inspiration", label: "Reference", mimeType: "image/png", url: "data:image/png;base64,cmVm" },
      { role: "content-asset", label: "Brand logo", mimeType: "image/png", url: "data:image/png;base64,dGVzdA==" },
    ],
  });
  const user = messages.find((message) => message.role === "user");
  assert.equal(Array.isArray(user.content), true);
  assert.match(user.content[0].text, /Include booking and pricing/);
  assert.match(user.content[0].text, /layout, hierarchy, palette, spacing, typography, and component style/i);
  assert.match(user.content[0].text, /logo: preserve the original mark/i);
  assert.match(user.content[0].text, /design-reference: inspect the supplied image/i);
  assert.match(user.content[0].text, /Convert each requested feature/i);
  assert.equal(user.content.slice(1).map((part) => part.type).join(","), "text,image_url,text,image_url");
  assert.match(user.content[1].text, /purpose=design-reference/);
  assert.match(user.content[3].text, /purpose=content-image/);
  assert.equal(user.content[2].image_url.url, "data:image/png;base64,cmVm");
  assert.equal(user.content[4].image_url.url, "data:image/png;base64,dGVzdA==");
});

test("final prompt carries per-project asset roles and instructions while image content reaches the provider", () => {
  const context = {
    project: { prompt: "Build a shop" }, requirements: {}, inspirations: [], attachments: [],
    assetManifest: [
      { assetId: "logo-id", filename: "mark.png", trustedReference: "https://res.cloudinary.com/demo/logo.png", mimeType: "image/png", size: 12, purpose: "logo", customPurpose: "Brand mark", placement: "header", placementDetails: "Top left", instructions: "Keep its proportions", content: "image-input" },
      { assetId: "pdf-id", filename: "spec.pdf", mimeType: "application/pdf", size: 10, purpose: "requirements-document", extractedText: "Add appointment booking" },
    ],
    visualReferences: [{ assetId: "logo-id", label: "mark.png", mimeType: "image/png", role: "content-asset", purpose: "logo", customPurpose: "Brand mark", placement: "header", placementDetails: "Top left", instructions: "Keep its proportions", url: "data:image/png;base64,bG9nbw==" }],
  };
  const payload = buildProviderPayload(context, "gpt-4.1-mini");
  const user = payload.messages.find((message) => message.role === "user");
  assert.match(user.content[0].text, /trustedReference/);
  assert.match(user.content[0].text, /trustedReference is the authoritative HTTPS Cloudinary secureUrl/i);
  assert.match(user.content[0].text, /<img src=/i);
  assert.match(user.content[0].text, /Keep its proportions/);
  assert.match(user.content[0].text, /customPurpose.*Brand mark/);
  assert.match(user.content[0].text, /Add appointment booking/);
  assert.match(user.content[0].text, /design-reference.*do not render the reference screenshot/i);
  assert.match(user.content[0].text, /preview does not run Tailwind\/PostCSS utilities/i);
  assert.match(user.content.find((part) => part.type === "text" && part.text.startsWith("ASSET IMAGE")).text, /placement=header \(Top left\); instructions=Keep its proportions/);
  assert.ok(user.content.some((part) => part.type === "image_url" && part.image_url.url === "data:image/png;base64,bG9nbw=="));
});

test("final serialized provider payload preserves image roles, UI asset URLs, and extracted PDF requirements", () => {
  const context = {
    project: { prompt: "Build a booking dashboard" },
    requirements: { features: ["Calendar booking"] },
    inspirations: [{ source: "devpilot", title: "Agency", referenceImage: { path: "/private/backend/path.png" } }],
    attachments: [{ id: "asset-pdf", filename: "brief.pdf", mimeType: "application/pdf", extraction: "text-extracted", extractedText: "Require recurring bookings and email confirmations" }, {
      id: "asset-logo", filename: "logo.png", mimeType: "image/png", role: "content-asset", assetUrl: "https://res.cloudinary.com/demo/image/upload/logo.png",
    }],
    visualReferences: [
      { inspirationId: "agency-1", category: "inspiration", role: "visual-inspiration", label: "Agency reference", mimeType: "image/png", url: "data:image/png;base64,aW5zcGlyYXRpb24=" },
      { assetId: "asset-logo", category: "requirements", role: "content-asset", label: "logo.png", mimeType: "image/png", url: "data:image/png;base64,bG9nbw==" },
    ],
  };
  const payload = buildProviderPayload(context, "gpt-4.1-mini");
  assert.equal(payload.max_completion_tokens, DEFAULT_MAX_COMPLETION_TOKENS);
  const serialized = JSON.stringify(payload);
  const user = payload.messages.find((message) => message.role === "user");
  assert.equal(user.content.filter((part) => part.type === "image_url").length, 2);
  assert.ok(serialized.includes("data:image/png;base64,aW5zcGlyYXRpb24="));
  assert.ok(serialized.includes("data:image/png;base64,bG9nbw=="));
  assert.ok(user.content[0].text.includes("Require recurring bookings and email confirmations"));
  assert.ok(user.content[0].text.includes("https://res.cloudinary.com/demo/image/upload/logo.png"));
  assert.ok(!user.content[0].text.includes("/private/backend/path.png"));
  const metadata = summarizeProviderPayload(payload, context);
  assert.deepEqual(metadata.contentPartTypes, ["text", "text", "image_url", "text", "image_url"]);
  assert.equal(metadata.imagePartCount, 2);
  assert.equal(metadata.attachmentCount, 2);
  assert.ok(!JSON.stringify(metadata).includes("recurring bookings"));
  assert.ok(!JSON.stringify(metadata).includes("base64"));
  assert.ok(!JSON.stringify(metadata).includes("asset-logo"));
  assert.ok(!JSON.stringify(metadata).includes("Agency reference"));
});

test("output-token limit is configurable and capped at the configured model maximum", () => {
  const previous = process.env.OPENAI_MAX_COMPLETION_TOKENS;
  try {
    delete process.env.OPENAI_MAX_COMPLETION_TOKENS;
    assert.equal(getMaxCompletionTokens(), 32768);
    process.env.OPENAI_MAX_COMPLETION_TOKENS = "24000";
    assert.equal(getMaxCompletionTokens(), 24000);
    process.env.OPENAI_MAX_COMPLETION_TOKENS = "999999";
    assert.equal(getMaxCompletionTokens(), 32768);
    assert.equal(buildProviderPayload({ visualReferences: [] }, "gpt-4.1-mini").max_completion_tokens, 32768);
    assert.equal(buildProviderPayload({ visualReferences: [] }, "gpt-4o-mini").max_completion_tokens, undefined);
  } finally {
    if (previous === undefined) delete process.env.OPENAI_MAX_COMPLETION_TOKENS;
    else process.env.OPENAI_MAX_COMPLETION_TOKENS = previous;
  }
});

test("generateProject sends the verified multimodal payload to its configured Chat Completions endpoint", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  const previousInfo = console.info;
  let requestUrl;
  let requestOptions;
  let diagnostic;
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  global.fetch = async (url, options) => {
    requestUrl = url;
    requestOptions = options;
    return { ok: false, status: 400 };
  };
  console.info = (_message, metadata) => { diagnostic = metadata; };
  try {
    await assert.rejects(generateProject({
      project: { prompt: "Build a booking dashboard" },
      requirements: { features: ["Calendar booking"] },
      inspirations: [],
      attachments: [{ id: "pdf-id", mimeType: "application/pdf", extraction: "text-extracted", extractedText: "Add recurring bookings" }],
      visualReferences: [{ assetId: "image-id", category: "inspiration", role: "visual-inspiration", label: "Reference", mimeType: "image/png", url: "data:image/png;base64,aW1hZ2U=" }],
    }), (error) => error.code === "PROVIDER_ERROR");
    assert.equal(requestUrl, "https://api.openai.com/v1/chat/completions");
    const sent = JSON.parse(requestOptions.body);
    const user = sent.messages.find((message) => message.role === "user");
    assert.equal(sent.model, "gpt-4.1-mini");
    assert.equal(sent.max_completion_tokens, 32768);
    assert.ok(user.content.some((part) => part.type === "image_url" && part.image_url.url === "data:image/png;base64,aW1hZ2U="));
    assert.ok(user.content[0].text.includes("Add recurring bookings"));
    assert.equal(diagnostic.imagePartCount, 1);
    assert.ok(diagnostic.contentPartTypes.includes("image_url"));
    assert.equal("imageReferences" in diagnostic, false);
    assert.equal(JSON.stringify(diagnostic).includes("base64"), false);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
    global.fetch = previousFetch;
    console.info = previousInfo;
  }
});

test("provider diagnostics retain safe category and status without logging or returning raw provider messages", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  const previousInfo = console.info;
  const previousError = console.error;
  const logs = [];
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  console.error = (...args) => logs.push(args.join(" "));
  global.fetch = async () => ({ ok: false, status: 429, json: async () => ({ error: {
    type: "rate_limit_error", code: "rate_limit_exceeded", message: "private prompt text and sk-secret-value",
  } }) });
  try {
    await assert.rejects(generateProject({ project: { prompt: "private project prompt" } }, { generationId: "gen-test-1" }), (error) => {
      assert.equal(error.code, "PROVIDER_ERROR");
      assert.equal(error.upstreamStatus, 429);
      assert.equal(error.generationId, "gen-test-1");
      assert.equal(error.phase, "initial-generation");
      assert.equal(error.providerErrorCategory, "rate_limit");
      assert.equal(error.providerMessage, "Provider quota or rate limit reached.");
      return true;
    });
    const serializedLogs = logs.join("\n");
    assert.match(serializedLogs, /gen-test-1/);
    assert.match(serializedLogs, /rate_limit/);
    assert.match(serializedLogs, /429/);
    assert.doesNotMatch(serializedLogs, /private prompt|sk-secret-value|private project prompt/);
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

test("long provider Retry-After values are honored by not retrying early", async () => {
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
    return { ok: false, status: 429, headers: { get: (name) => name === "retry-after" ? "30" : null }, json: async () => ({ error: { type: "rate_limit_error" } }) };
  };
  try {
    await assert.rejects(generateProject({ project: { prompt: "Build a site" } }), (error) => error.code === "PROVIDER_ERROR" && error.upstreamStatus === 429);
    assert.equal(calls, 1);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
    global.fetch = previousFetch;
    console.info = previousInfo;
  }
});

test("malformed provider content has a correlated phase diagnostic without content disclosure", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  const previousInfo = console.info;
  const previousError = console.error;
  const logs = [];
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-4.1-mini";
  console.info = () => {};
  console.error = (...args) => logs.push(args.join(" "));
  global.fetch = async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: "private generated source" } }] }) });
  try {
    await assert.rejects(generateProject({ project: { prompt: "private project prompt" } }, { generationId: "gen-malformed-1" }), (error) => {
      assert.equal(error.code, "MALFORMED_PROVIDER_RESPONSE");
      assert.equal(error.generationId, "gen-malformed-1");
      assert.equal(error.phase, "initial-generation");
      assert.equal(error.providerErrorCategory, "invalid_json");
      return true;
    });
    assert.match(logs.join("\n"), /gen-malformed-1.*invalid_json/);
    assert.doesNotMatch(logs.join("\n"), /private generated source|private project prompt/);
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

test("an image reference that cannot be encoded is rejected instead of omitted", () => {
  assert.throws(() => createProviderMessages({ visualReferences: [{
    role: "visual-inspiration", label: "broken image", mimeType: "image/png", url: "https://untrusted.example/image.png",
  }] }), (error) => error.code === "ASSET_PROCESSING_FAILED");
});

test("rejects generated output that silently omits a selected renderable image", () => {
  const { validateSelectedAssetUsage } = require("../src/services/projectGenerationService");
  const selected = { assetManifest: [{ filename: "Gemini_Generated_Image_50l8l850l8l850l8.jpg", purpose: "content-image", content: "image-input", trustedReference: "https://res.cloudinary.com/demo/image/upload/v123/Gemini_Generated_Image_50l8l850l8l850l8.jpg" }] };
  const reference = selected.assetManifest[0].trustedReference;
  const rejects = (generatedFiles) => assert.throws(() => validateSelectedAssetUsage(selected, generatedFiles), (error) => error.code === "ASSET_NOT_USED");
  rejects([{ path: "frontend/src/App.jsx", content: "const App = () => <div />" }]);
  rejects([{ path: "frontend/src/App.jsx", content: `// <img src="${reference}" />\nconst note = "${reference}"; export default () => <div />;` }]);
  rejects([
    { path: "frontend/src/assets.js", content: `const logoUrl = "${reference}";` },
    { path: "frontend/src/App.jsx", content: "export default () => <img src={logoUrl} />;" },
  ]);
  assert.doesNotThrow(() => validateSelectedAssetUsage(selected, [{ path: "frontend/src/App.jsx", content: `<img src="${reference}" alt="Brand" />` }]));
  assert.doesNotThrow(() => validateSelectedAssetUsage(selected, [{ path: "frontend/src/App.jsx", content: `const brandMark = new URL("${reference}"); export default () => <img src={brandMark} alt="Brand" />;` }]));
  assert.doesNotThrow(() => validateSelectedAssetUsage(selected, [{ path: "frontend/src/theme.css", content: `.hero { background-image: url("${reference}"); }` }]));
  assert.doesNotThrow(() => validateSelectedAssetUsage(selected, [
    { path: "frontend/src/assets.js", content: `export const logoUrl = "${reference}";` },
    { path: "frontend/src/App.jsx", content: 'import { logoUrl as mark } from "./assets.js"; export default () => <img src={mark} />;' },
  ]));
  assert.doesNotThrow(() => validateSelectedAssetUsage({ assetManifest: [{ ...selected.assetManifest[0], purpose: "design-reference" }] }, [{ path: "frontend/src/App.jsx", content: "const App = () => <div />" }]));
});

test("default model supports image input and text-only models are detected", () => {
  assert.equal(modelSupportsImageInput("gpt-4.1-mini"), true);
  assert.equal(modelSupportsImageInput("gpt-4o-mini"), true);
  assert.equal(modelSupportsImageInput("gpt-3.5-turbo"), false);
});

test("a model without image input is rejected before any provider request", async () => {
  const previousKey = process.env.OPENAI_API_KEY;
  const previousModel = process.env.OPENAI_MODEL;
  const previousFetch = global.fetch;
  let fetchCalled = false;
  process.env.OPENAI_API_KEY = "test-only";
  process.env.OPENAI_MODEL = "gpt-3.5-turbo";
  global.fetch = async () => { fetchCalled = true; throw new Error("unexpected provider request"); };
  try {
    await assert.rejects(generateProject({ visualReferences: [{ role: "visual-inspiration", url: "data:image/png;base64,dGVzdA==" }] }), (error) => error.code === "VISION_MODEL_REQUIRED");
    assert.equal(fetchCalled, false);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.OPENAI_MODEL;
    else process.env.OPENAI_MODEL = previousModel;
    global.fetch = previousFetch;
  }
});
