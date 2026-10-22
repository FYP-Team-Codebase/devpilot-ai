const assert = require("assert");

const {
  buildProjectGenerationContext,
  isSafePublicInspirationPath,
} = require("../src/generation/context/projectGenerationContext");

const validPath = "/inspirations/Agency%20Inspiration-1/Slice%202.png";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function manifestEntry(overrides = {}) {
  return {
    id: "Agency Inspiration-1",
    folder: "Agency Inspiration-1",
    title: " Creative Agency ",
    category: " Agency ",
    type: " Website ",
    style: " Creative ",
    tags: [" agency ", "", 42],
    description: "must not leak",
    designDirection: "must not leak",
    thumbnail: "/inspirations/thumb.png",
    galleryPreview: validPath,
    originalGalleryPreview: "/inspirations/original.png",
    fullPage: "/inspirations/full.png",
    images: [{ src: "/inspirations/first.png" }],
    ...overrides,
  };
}

function makeManifest(entries = [manifestEntry()]) {
  return { root: "/inspirations", count: entries.length, skipped: [], inspirations: entries };
}

function makeProject(overrides = {}) {
  return {
    _id: "507f1f77bcf86cd799439011",
    user: "507f1f77bcf86cd799439099",
    projectName: "  Example Project  ",
    prompt: "  Build a trusted app  ",
    requirements: {
      projectType: "  SaaS  ",
      designPreferences: [" Modern ", "", 4, "Minimal"],
      pages: [" Home ", null, "About", "  "],
      features: [" Auth ", false, "Search"],
      devices: [" Desktop ", 8, "Mobile"],
      notes: "  Keep it safe  ",
      targetAudience: "must not leak",
    },
    inspirations: [
      {
        source: " DevPilot ",
        inspirationId: "Agency Inspiration-1",
        imageUrl: "https://attacker.example/image.png",
      },
    ],
    generationStatus: "ready",
    credentials: "must not leak",
    ...overrides,
  };
}

function loaderFor(manifest) {
  return async () => clone(manifest);
}

function buildContext(project, options = {}) {
  return buildProjectGenerationContext(project, {
    assetLoader: async () => [],
    inspirationImageReader: async () => ({ bytes: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), mimeType: "image/png" }),
    assetReader: async () => Buffer.from("test"),
    pdfTextExtractor: async () => "",
    ...options,
  });
}

async function expectReject(task, code) {
  await assert.rejects(task, (error) => error && error.code === code);
}

async function run() {
  const context = await buildContext(makeProject(), {
    manifestLoader: loaderFor(makeManifest()),
  });

  assert.deepStrictEqual(context, {
    schemaVersion: 1,
    project: {
      id: "507f1f77bcf86cd799439011",
      name: "Example Project",
      prompt: "Build a trusted app",
    },
    requirements: {
      projectType: "SaaS",
      designPreferences: ["Modern", "Minimal"],
      pages: ["Home", "About"],
      features: ["Auth", "Search"],
      devices: ["Desktop", "Mobile"],
      notes: "Keep it safe",
    },
    assetManifest: [],
    attachments: [],
    inspirations: [{
      id: "Agency Inspiration-1",
      source: "devpilot",
      title: "Creative Agency",
      category: "Agency",
      type: "Website",
      style: "Creative",
      tags: ["agency"],
      referenceImage: { path: validPath },
    }],
    visualReferences: [{ inspirationId: "Agency Inspiration-1", category: "inspiration", role: "visual-inspiration", label: "Creative Agency", mimeType: "image/png", url: `data:image/png;base64,${Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).toString("base64")}` }],
    generation: {
      target: "mern-web-application",
      frontend: "react-vite",
      backend: "node-express",
      database: "mongodb",
      outputSchemaVersion: 1,
    },
  });

  assert.strictEqual(context.inspirations[0].referenceImage.path, validPath);
  assert.ok(!JSON.stringify(context).includes("must not leak"));

  const missingRequirements = await buildContext(
    makeProject({ requirements: undefined, inspirations: [] }),
    { manifestLoader: loaderFor(makeManifest([])) }
  );
  assert.deepStrictEqual(missingRequirements.requirements, {
    projectType: "",
    designPreferences: [],
    pages: [],
    features: [],
    devices: [],
    notes: "",
  });

  const priorityEntry = manifestEntry({
    galleryPreview: "https://invalid.example/image.png",
    thumbnail: "/inspirations/thumbnail.png",
    fullPage: "/inspirations/full.png",
    images: [{ src: "/inspirations/first.png" }],
  });
  const priorityContext = await buildContext(makeProject(), {
    manifestLoader: loaderFor(makeManifest([priorityEntry])),
  });
  assert.strictEqual(priorityContext.inspirations[0].referenceImage.path, "/inspirations/thumbnail.png");

  const firstOccurrence = makeProject({
    inspirations: [
      { source: "devpilot", inspirationId: "Agency Inspiration-1", imageUrl: "/bad/first.png" },
      { source: "devpilot", inspirationId: "Agency Inspiration-1", imageUrl: "/bad/second.png" },
    ],
  });
  const deduped = await buildContext(firstOccurrence, {
    manifestLoader: loaderFor(makeManifest()),
  });
  assert.strictEqual(deduped.inspirations.length, 1);

  const skipped = await buildContext(makeProject({
    inspirations: [
      { source: "user", inspirationId: "Agency Inspiration-1", imageUrl: validPath },
      { source: "other", inspirationId: "Agency Inspiration-1", imageUrl: validPath },
    ],
  }), { manifestLoader: loaderFor(makeManifest()) });
  assert.deepStrictEqual(skipped.inspirations, []);
  await expectReject(buildContext(makeProject({ inspirations: [{ source: "devpilot", inspirationId: "stale-id" }] }), {
    manifestLoader: loaderFor(makeManifest()),
  }), "INSPIRATION_UNAVAILABLE");

  const originalProject = makeProject();
  const before = clone(originalProject);
  await buildContext(originalProject, { manifestLoader: loaderFor(makeManifest()) });
  assert.deepStrictEqual(originalProject, before);
  assert.strictEqual(originalProject.generationStatus, "ready");

  assert.strictEqual(isSafePublicInspirationPath(validPath), true);
  [
    "https://example.com/image.png",
    "http://example.com/image.png",
    "//example.com/image.png",
    "/inspirations/../secret.png",
    "/inspirations/%2e%2e/secret.png",
    "/inspirations/%2Fsecret.png",
    "/inspirations/%5csecret.png",
    "/inspirations/%252e%252e/secret.png",
    "/inspirations/%252fsecret.png",
    "/inspirations/%255csecret.png",
    "C:\\secret.png",
    "/tmp/secret.png",
    "/inspirations\\secret.png",
  ].forEach((value) => assert.strictEqual(isSafePublicInspirationPath(value), false, value));

  const invalidPathCases = [
    "/inspirations/%2e%2e/secret.png",
    "https://example.com/image.png",
    "/tmp/secret.png",
  ];
  for (const invalidPath of invalidPathCases) {
    await expectReject(buildContext(makeProject(), {
      manifestLoader: loaderFor(makeManifest([manifestEntry({ galleryPreview: invalidPath, thumbnail: invalidPath, fullPage: invalidPath, images: [{ src: invalidPath }] })])),
    }), "INSPIRATION_UNAVAILABLE");
  }

  await expectReject(
    buildContext(null, { manifestLoader: loaderFor(makeManifest()) }),
    "MISSING_PROJECT"
  );
  await expectReject(
    buildContext(makeProject(), { manifestLoader: async () => { throw new Error("C:\\secret\\manifest.json"); } }),
    "INSPIRATION_MANIFEST_ERROR"
  );
  await expectReject(
    buildContext(makeProject(), { manifestLoader: async () => ({ inspirations: "invalid" }) }),
    "INVALID_INSPIRATION_MANIFEST"
  );

  const requirementId = "607f1f77bcf86cd799439011";
  const uploadedInspirationId = "607f1f77bcf86cd799439012";
  const requirementImageId = "607f1f77bcf86cd799439013";
  const ownedAssets = [
    { _id: requirementId, owner: makeProject().user, category: "requirements", originalFilename: "brief.pdf", mimeType: "application/pdf", size: 1200, resourceType: "raw", secureUrl: "https://res.cloudinary.com/demo/raw/upload/brief.pdf" },
    { _id: uploadedInspirationId, owner: makeProject().user, category: "inspiration", originalFilename: "reference.png", mimeType: "image/png", size: 900, resourceType: "image", secureUrl: "https://res.cloudinary.com/demo/image/upload/reference.png" },
    { _id: requirementImageId, owner: makeProject().user, category: "requirements", originalFilename: "brand-logo.png", mimeType: "image/png", size: 900, resourceType: "image", secureUrl: "https://res.cloudinary.com/demo/image/upload/brand-logo.png" },
  ];
  let receivedAssetQuery;
  const assetContext = await buildContext(makeProject({
    requirements: { assetIds: [requirementId, requirementImageId] },
    inspirations: [{ source: "userAsset", assetId: uploadedInspirationId }],
  }), {
    assetLoader: async (query) => { receivedAssetQuery = query; return ownedAssets; },
    assetReader: async (asset) => asset._id === requirementId ? Buffer.from("pdf") : Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pdfTextExtractor: async () => "Extracted client requirements",
  });
  assert.equal(String(receivedAssetQuery.owner), makeProject().user);
  assert.deepStrictEqual(assetContext.attachments, [{
    id: requirementId, filename: "brief.pdf", mimeType: "application/pdf", size: 1200,
    extraction: "text-extracted", extractedText: "Extracted client requirements",
  }, {
    id: requirementImageId, filename: "brand-logo.png", mimeType: "image/png", size: 900,
    extraction: "image-input", role: "content-asset", assetUrl: ownedAssets[2].secureUrl,
  }]);
  assert.ok(assetContext.visualReferences.some((reference) => reference.assetId === uploadedInspirationId && reference.role === "visual-inspiration" && reference.url.startsWith("data:image/png;base64,")));
  assert.ok(assetContext.visualReferences.some((reference) => reference.assetId === requirementImageId && reference.role === "content-asset" && reference.url.startsWith("data:image/png;base64,")));
  assert.ok(assetContext.inspirations.some((inspiration) => inspiration.id === uploadedInspirationId));

  const configuredIds = [
    "607f1f77bcf86cd799439021", "607f1f77bcf86cd799439022", "607f1f77bcf86cd799439023", "607f1f77bcf86cd799439024", "607f1f77bcf86cd799439025", "607f1f77bcf86cd799439026", "607f1f77bcf86cd799439027",
  ];
  const configuredAssets = configuredIds.map((id, index) => ({
    _id: id, owner: makeProject().user, category: "general", originalFilename: ["logo.png", "hero.png", "reference.png", "product.png", "product-two.png", "illustration.png", "brief.pdf"][index],
    mimeType: index === 6 ? "application/pdf" : "image/png", resourceType: index === 6 ? "raw" : "image", size: 100,
    secureUrl: `https://res.cloudinary.com/demo/${index === 6 ? "raw" : "image"}/upload/${index}.asset`,
  }));
  const purposes = ["logo", "background", "design-reference", "content-image", "content-image", "other", "requirements-document"];
  const mixedPurposeContext = await buildContext(makeProject({ inspirations: [], requirements: {}, assetSelections: configuredIds.map((assetId, index) => ({
    assetId, purpose: purposes[index], customPurpose: index === 5 ? "Use as a menu illustration" : "", placement: ["header", "hero", "ai", "product", "gallery", "section", "ai"][index], placementDetails: index === 5 ? "Menu section" : "", instructions: `instruction-${index}`,
  })) }), {
    assetLoader: async (query) => { assert.equal(String(query.owner), makeProject().user); return configuredAssets; },
    assetReader: async (asset) => asset.mimeType === "application/pdf" ? Buffer.from("pdf") : Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pdfTextExtractor: async () => "Extracted page and workflow requirements",
  });
  assert.deepEqual(mixedPurposeContext.assetManifest.map((item) => item.purpose), purposes);
  assert.equal(mixedPurposeContext.assetManifest[0].placement, "header");
  assert.equal(mixedPurposeContext.assetManifest[0].instructions, "instruction-0");
  assert.equal(mixedPurposeContext.assetManifest[4].placement, "gallery");
  assert.equal(mixedPurposeContext.assetManifest[5].customPurpose, "Use as a menu illustration");
  assert.equal(mixedPurposeContext.assetManifest[5].placementDetails, "Menu section");
  assert.equal(mixedPurposeContext.assetManifest[5].instructions, "instruction-5");
  assert.equal(mixedPurposeContext.assetManifest[6].extractedText, "Extracted page and workflow requirements");
  assert.equal(mixedPurposeContext.visualReferences.find((item) => item.assetId === configuredIds[5]).customPurpose, "Use as a menu illustration");
  assert.ok(mixedPurposeContext.visualReferences.some((item) => item.assetId === configuredIds[2] && item.role === "visual-inspiration"));
  assert.ok(mixedPurposeContext.visualReferences.some((item) => item.assetId === configuredIds[0] && item.role === "content-asset"));
  assert.ok(mixedPurposeContext.visualReferences.every((item) => item.url.startsWith("data:image/png;base64,")));

  await assert.rejects(buildContext(makeProject({ inspirations: [{ source: "userAsset", assetId: uploadedInspirationId }] }), {
    assetLoader: async () => [ownedAssets[1]],
    assetReader: async () => { throw new Error("Cloud asset fetch failed"); },
  }), (error) => error.code === "ASSET_PROCESSING_FAILED" && /could not be retrieved or read/i.test(error.message));
  await assert.rejects(buildContext(makeProject({ requirements: { assetIds: [requirementId] }, inspirations: [] }), {
    assetLoader: async () => [ownedAssets[0]],
    assetReader: async () => Buffer.from("pdf"),
    pdfTextExtractor: async () => "x".repeat(50001),
  }), (error) => error.code === "ASSET_PROCESSING_FAILED" && /more extracted text/i.test(error.message));
  await assert.rejects(buildContext(makeProject({ assetSelections: [{ assetId: requirementId, purpose: "requirements-document" }], requirements: {}, inspirations: [] }), {
    assetLoader: async () => [ownedAssets[0]],
    assetReader: async () => Buffer.from("pdf"),
    pdfTextExtractor: async () => "",
  }), (error) => error.code === "ASSET_PROCESSING_FAILED" && /no extractable text.*scanned PDFs are not supported/i.test(error.message));

  for (const unavailableAssets of [[], [ownedAssets[0]]]) {
    await expectReject(buildContext(makeProject({
      requirements: { assetIds: [requirementId] },
      inspirations: [{ source: "userAsset", assetId: uploadedInspirationId }],
    }), { assetLoader: async (query) => {
      assert.equal(String(query.owner), makeProject().user);
      return unavailableAssets;
    } }), "ASSET_UNAVAILABLE");
  }

  console.log("Project generation context tests passed.");
}

run().catch((error) => {
  console.error("Project generation context tests failed:", error);
  process.exitCode = 1;
});
