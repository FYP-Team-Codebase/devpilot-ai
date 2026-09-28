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

async function expectReject(task, code) {
  await assert.rejects(task, (error) => error && error.code === code);
}

async function run() {
  const context = await buildProjectGenerationContext(makeProject(), {
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

  const missingRequirements = await buildProjectGenerationContext(
    makeProject({ requirements: undefined }),
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
  const priorityContext = await buildProjectGenerationContext(makeProject(), {
    manifestLoader: loaderFor(makeManifest([priorityEntry])),
  });
  assert.strictEqual(priorityContext.inspirations[0].referenceImage.path, "/inspirations/thumbnail.png");

  const firstOccurrence = makeProject({
    inspirations: [
      { source: "devpilot", inspirationId: "Agency Inspiration-1", imageUrl: "/bad/first.png" },
      { source: "devpilot", inspirationId: "Agency Inspiration-1", imageUrl: "/bad/second.png" },
    ],
  });
  const deduped = await buildProjectGenerationContext(firstOccurrence, {
    manifestLoader: loaderFor(makeManifest()),
  });
  assert.strictEqual(deduped.inspirations.length, 1);

  const skipped = await buildProjectGenerationContext(makeProject({
    inspirations: [
      { source: "user", inspirationId: "Agency Inspiration-1", imageUrl: validPath },
      { source: "devpilot", inspirationId: "agency inspiration-1", imageUrl: validPath },
      { source: "devpilot", inspirationId: "stale-id", imageUrl: validPath },
      { source: "other", inspirationId: "Agency Inspiration-1", imageUrl: validPath },
    ],
  }), { manifestLoader: loaderFor(makeManifest()) });
  assert.deepStrictEqual(skipped.inspirations, []);

  const originalProject = makeProject();
  const before = clone(originalProject);
  await buildProjectGenerationContext(originalProject, { manifestLoader: loaderFor(makeManifest()) });
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
    const result = await buildProjectGenerationContext(makeProject(), {
      manifestLoader: loaderFor(makeManifest([manifestEntry({ galleryPreview: invalidPath, thumbnail: invalidPath, fullPage: invalidPath, images: [{ src: invalidPath }] })])),
    });
    assert.deepStrictEqual(result.inspirations, []);
  }

  await expectReject(
    buildProjectGenerationContext(null, { manifestLoader: loaderFor(makeManifest()) }),
    "MISSING_PROJECT"
  );
  await expectReject(
    buildProjectGenerationContext(makeProject(), { manifestLoader: async () => { throw new Error("C:\\secret\\manifest.json"); } }),
    "INSPIRATION_MANIFEST_ERROR"
  );
  await expectReject(
    buildProjectGenerationContext(makeProject(), { manifestLoader: async () => ({ inspirations: "invalid" }) }),
    "INVALID_INSPIRATION_MANIFEST"
  );

  console.log("Project generation context tests passed: 37 assertions");
}

run().catch((error) => {
  console.error("Project generation context tests failed:", error);
  process.exitCode = 1;
});
