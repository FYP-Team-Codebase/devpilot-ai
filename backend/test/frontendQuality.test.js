const assert = require("node:assert/strict");
const test = require("node:test");
const { validateFrontendQuality } = require("../src/generation/validators/frontendQualityValidator");
const { repairMissingStylesheets } = require("../src/generation/repairs/missingStylesheets");

function frontendFiles({ app = "<main><h1>Welcome</h1></main>", css = "", appImports = "", main = 'import App from "./App.jsx"; import "./base.css"; createRoot(root).render(<App />);' } = {}) {
  return [
    { path: "frontend/src/main.jsx", content: main },
    { path: "frontend/src/App.jsx", content: `${appImports}\n${app}` },
    { path: "frontend/src/base.css", content: css },
  ];
}

test("quality validator flags browser-default navigation without reachable styles", () => {
  const issues = validateFrontendQuality(frontendFiles({
    main: 'import App from "./App.jsx"; createRoot(root).render(<App />);',
    app: "<nav><ul><li><a href='/'>Home</a></li></ul></nav>",
    css: "",
  }));

  assert.ok(issues.some((issue) => issue.code === "UNSTYLED_NAVIGATION"));
});

test("a font import alone does not count as styled navigation", () => {
  const issues = validateFrontendQuality(frontendFiles({
    app: "<nav><ul><li><a href='/'>Home</a></li></ul></nav>",
    css: "@import url('https://fonts.googleapis.com/css2?family=Inter');",
  }));

  assert.ok(issues.some((issue) => issue.code === "UNSTYLED_NAVIGATION"));
});

test("reachable authored CSS with responsive navigation passes quality checks", () => {
  const issues = validateFrontendQuality(frontendFiles({
    app: '<nav className="siteNav"><a href="/">Home</a></nav>',
    css: ".siteNav { display:flex; gap:1rem; } @media (max-width: 40rem) { .siteNav { flex-wrap:wrap; } }",
  }));

  assert.deepEqual(issues, []);
});

test("missing local CSS imports are reported while existing local CSS imports resolve", () => {
  const unresolved = validateFrontendQuality(frontendFiles({
    main: 'import App from "./App.jsx"; import "./missing.css"; createRoot(root).render(<App />);',
    app: "<main><h1>Welcome</h1></main>",
    css: ".page { color:#222; }",
  }));
  assert.ok(unresolved.some((issue) => issue.code === "UNRESOLVED_LOCAL_IMPORT" && /missing\.css/.test(issue.message)));

  const resolved = validateFrontendQuality(frontendFiles({
    main: 'import App from "./App.jsx"; import "./base.css"; createRoot(root).render(<App />);',
    app: "<main><h1>Welcome</h1></main>",
    css: ".page { color:#222; }",
  }));
  assert.deepEqual(resolved, []);
});

test("main.jsx resolves an exact index.css import and case mismatches are reported for Linux builds", () => {
  const files = [
    { path: "frontend/src/main.jsx", content: 'import App from "./App.jsx"; import "./index.css"; createRoot(root).render(<App />);' },
    { path: "frontend/src/App.jsx", content: "export default function App(){return <main />; }" },
    { path: "frontend/src/index.css", content: "body { margin:0; }" },
  ];
  assert.deepEqual(validateFrontendQuality(files), []);
  files[2].path = "frontend/src/Index.css";
  assert.ok(validateFrontendQuality(files).some((issue) => issue.code === "IMPORT_CASE_MISMATCH" && issue.actualPath.endsWith("Index.css")));
});

test("relative imports from nested generated components resolve against the importing file", () => {
  const files = [
    { path: "frontend/src/main.jsx", content: 'import App from "./pages/App.jsx"; import "./index.css"; createRoot(root).render(<App />);' },
    { path: "frontend/src/pages/App.jsx", content: 'import "../../styles/theme.css"; export default function App(){return <main />;}' },
    { path: "frontend/src/index.css", content: "body { margin:0; }" },
    { path: "frontend/styles/theme.css", content: "main { max-width:72rem; margin:auto; }" },
  ];
  assert.deepEqual(validateFrontendQuality(files), []);
});

test("missing imported stylesheets get a non-empty safe style file without replacing existing CSS", () => {
  const files = [
    { path: "frontend/src/main.jsx", content: 'import App from "./App.jsx"; import "./index.css"; createRoot(root).render(<App />);' },
    { path: "frontend/src/App.jsx", content: "export default function App(){return <main />; }" },
    { path: "frontend/src/theme.css", content: "body { color:#121212; }" },
  ];
  const result = repairMissingStylesheets(files);
  assert.deepEqual(result.added, ["frontend/src/index.css"]);
  assert.match(result.files.at(-1).content, /@import ["']\.\/theme\.css["']/);
  assert.equal(result.files.find((file) => file.path.endsWith("theme.css")).content, files[2].content);
  assert.deepEqual(validateFrontendQuality(result.files), []);
  const existingIndex = { path: "frontend/src/index.css", language: "css", content: "body { background:#fafafa; }" };
  const alreadyPresent = [...files, existingIndex];
  assert.deepEqual(repairMissingStylesheets(alreadyPresent).added, []);
  assert.equal(alreadyPresent.find((file) => file.path.endsWith("index.css")).content, existingIndex.content);
});

test("missing imported stylesheet with no style convention gets authored baseline CSS; missing JS remains an error", () => {
  const files = [
    { path: "frontend/src/main.jsx", content: 'import App from "./App.jsx"; import "./index.css"; createRoot(root).render(<App />);' },
    { path: "frontend/src/App.jsx", content: 'import "./missing.js"; export default function App(){return <main />; }' },
  ];
  const result = repairMissingStylesheets(files, [{ palette: ["#123456", "#fafafa"] }]);
  const css = result.files.find((file) => file.path.endsWith("index.css"));
  assert.ok(css.content.length > 50);
  assert.match(css.content, /--dp-ink: #123456/);
  assert.ok(validateFrontendQuality(result.files).some((issue) => issue.code === "UNRESOLVED_LOCAL_IMPORT" && issue.specifier === "./missing.js"));
});

test("uncompiled utility classes are reported unless authored rules exist", () => {
  const app = '<nav className="flex items-center gap-4"><a>Home</a></nav>';
  const unsupported = validateFrontendQuality(frontendFiles({ app, css: ".siteNav { display:flex; }" }));
  assert.ok(unsupported.some((issue) => issue.code === "UNCOMPILED_UTILITY_CLASSES"));

  const supported = validateFrontendQuality(frontendFiles({ app, css: ".flex { display:flex; } .items-center { align-items:center; } .gap-4 { gap:1rem; }" }));
  assert.deepEqual(supported, []);
});

test("Tailwind directives are rejected because preview does not run its CSS compiler", () => {
  const issues = validateFrontendQuality(frontendFiles({ css: '@import "tailwindcss";' }));
  assert.ok(issues.some((issue) => issue.code === "UNSUPPORTED_TAILWIND_PIPELINE"));
});

test("inline styled navigation and pages without navigation remain valid alternatives", () => {
  assert.deepEqual(validateFrontendQuality(frontendFiles({
    main: 'import App from "./App.jsx"; createRoot(root).render(<App />);',
    app: '<nav style={{ display: "flex" }}><a>Home</a></nav>',
    css: "",
  })).map((issue) => issue.code), []);

  assert.deepEqual(validateFrontendQuality(frontendFiles({
    main: 'import App from "./App.jsx"; createRoot(root).render(<App />);',
    app: "<main><h1>Dashboard</h1></main>",
    css: "",
  })), []);
});
