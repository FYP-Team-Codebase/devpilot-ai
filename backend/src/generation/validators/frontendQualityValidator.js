const path = require("node:path");

const ENTRYPOINTS = ["frontend/src/main.jsx", "frontend/src/main.tsx", "frontend/src/main.js", "frontend/src/main.ts"];
const MODULE_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".json", ".css", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".woff", ".woff2", ".ttf", ".otf"];
const UTILITY_CLASS = /^(?:flex|inline-flex|grid|inline-grid|block|hidden|items-[\w-]+|justify-[\w-]+|gap-(?:\d|\[)|p[trblxy]?-(?:\d|\[)|m[trblxy]?-(?:\d|\[)|w-(?:full|screen|\d|\[)|h-(?:full|screen|\d|\[)|bg-[\w#\[]|text-(?:xs|sm|base|lg|xl|\d|white|black|transparent|[a-z]+-\d+)|rounded(?:-|$)|shadow(?:-|$)|font-(?:medium|semibold|bold|normal)|leading-[\w-]+|space-[xy]-)/i;

function normalizeFrontendPath(value) {
  const normalized = path.posix.normalize(value.replace(/\\/g, "/"));
  return normalized.startsWith("frontend/") && !normalized.includes("../") ? normalized : "";
}

function resolveImportPath(importer, specifier, files) {
  if (typeof specifier !== "string" || /^(?:[a-z]+:|\/\/)/i.test(specifier)) return "";
  const cleanSpecifier = specifier.split(/[?#]/, 1)[0];
  let base;
  if (cleanSpecifier.startsWith("@/")) base = `frontend/src/${cleanSpecifier.slice(2)}`;
  else if (cleanSpecifier.startsWith("/src/")) base = `frontend${cleanSpecifier}`;
  else if (cleanSpecifier.startsWith(".")) base = path.posix.join(path.posix.dirname(importer), cleanSpecifier);
  else return "";

  const normalized = normalizeFrontendPath(base);
  return getImportCandidates(normalized).find((candidate) => files.has(candidate)) || "";
}

function getImportCandidates(normalized) {
  return [normalized, ...MODULE_EXTENSIONS.map((extension) => `${normalized}${extension}`), ...MODULE_EXTENSIONS.map((extension) => `${normalized}/index${extension}`)];
}

function importedSpecifiers(content) {
  const result = [];
  const pattern = /\b(?:import|export)\s+(?:[^'";]*?\s+from\s*)?["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)|\brequire\(\s*["']([^"']+)["']\s*\)/g;
  for (const match of content.matchAll(pattern)) result.push(match[1] || match[2] || match[3]);
  const cssImport = /@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?\s*;/g;
  for (const match of content.matchAll(cssImport)) result.push(match[1]);
  return result;
}

function findReachableFrontendFiles(files) {
  const byPath = new Map((files || []).map((file) => [file.path, file.content]));
  const entry = ENTRYPOINTS.find((candidate) => byPath.has(candidate));
  const reached = new Set();
  const unresolved = [];
  const caseMismatches = [];
  if (!entry) return { byPath, reached, unresolved };

  const visit = (filePath) => {
    if (reached.has(filePath)) return;
    reached.add(filePath);
    for (const specifier of importedSpecifiers(byPath.get(filePath) || "")) {
      const resolved = resolveImportPath(filePath, specifier, byPath);
      if (resolved) visit(resolved);
      else if (specifier.startsWith(".") || specifier.startsWith("@/") || specifier.startsWith("/src/")) {
        const cleanSpecifier = specifier.split(/[?#]/, 1)[0];
        let base = cleanSpecifier.startsWith("@/") ? `frontend/src/${cleanSpecifier.slice(2)}`
          : cleanSpecifier.startsWith("/src/") ? `frontend${cleanSpecifier}`
            : path.posix.join(path.posix.dirname(filePath), cleanSpecifier);
        base = normalizeFrontendPath(base);
        const candidates = base ? getImportCandidates(base) : [];
        const actualPath = candidates.map((candidate) => [...byPath.keys()].find((existing) => existing.toLowerCase() === candidate.toLowerCase())).find(Boolean);
        if (actualPath) {
          caseMismatches.push({ importer: filePath, specifier, actualPath });
          visit(actualPath);
        } else unresolved.push({ importer: filePath, specifier });
      }
    }
  };
  visit(entry);
  return { byPath, reached, unresolved, caseMismatches };
}

function classNames(source) {
  const names = [];
  const pattern = /\bclass(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*["']([^"']*)["']\s*\})/g;
  for (const match of source.matchAll(pattern)) names.push(...(match[1] || match[2] || match[3] || "").split(/\s+/).filter(Boolean));
  return names;
}

function cssHasClassRule(css, className) {
  const baseClass = className.split(":").at(-1);
  const escaped = baseClass.replace(/([!#$%&()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
  return new RegExp(`\\.${escaped}(?=[\\s.{:#\\[]|$)`).test(css);
}

function validateFrontendQuality(files) {
  const { byPath, reached, unresolved, caseMismatches } = findReachableFrontendFiles(files);
  const sourceFiles = [...reached].filter((filePath) => /\.(?:jsx?|tsx?)$/i.test(filePath));
  const source = sourceFiles.map((filePath) => byPath.get(filePath) || "").join("\n");
  const stylesheets = [...reached].filter((filePath) => filePath.endsWith(".css"));
  const css = stylesheets.map((filePath) => byPath.get(filePath) || "").join("\n").replace(/\/\*[\s\S]*?\*\//g, "");
  const issues = [];
  const hasCssDeclarations = /\{[^{}]*[a-z-]+\s*:\s*[^{};]+;?[^{}]*\}/i.test(css);

  unresolved.slice(0, 5).forEach(({ importer, specifier }) => {
    issues.push({ code: "UNRESOLVED_LOCAL_IMPORT", path: importer, specifier, message: `The frontend import "${specifier}" from ${importer} does not match a generated local file.` });
  });
  caseMismatches.slice(0, 5).forEach(({ importer, specifier, actualPath }) => {
    issues.push({ code: "IMPORT_CASE_MISMATCH", path: importer, specifier, actualPath, message: `The import "${specifier}" from ${importer} differs in letter case from generated file ${actualPath}; imports must match for Linux/Vercel builds.` });
  });

  if (/@import\s+["']tailwindcss["']|@tailwind\s+(?:base|components|utilities)/i.test(css)) {
    issues.push({ code: "UNSUPPORTED_TAILWIND_PIPELINE", message: "The isolated preview does not compile Tailwind directives. Replace utility-only styling with authored CSS that is imported by the frontend entry point." });
  }

  const hasNavigation = /<nav\b/i.test(source);
  const hasInlineOrEmbeddedStyle = /<style\b|\bstyle\s*=|\bstyle\s*=\s*\{/i.test(source);
  if (hasNavigation && !hasCssDeclarations && !hasInlineOrEmbeddedStyle) {
    issues.push({ code: "UNSTYLED_NAVIGATION", message: "The generated navigation has no reachable stylesheet or inline styles. Add and import real CSS for navigation, links, and responsive layout." });
  }

  const utilities = [...new Set(classNames(source).filter((name) => UTILITY_CLASS.test(name) && !cssHasClassRule(css, name)))].slice(0, 8);
  if (utilities.length) {
    issues.push({ code: "UNCOMPILED_UTILITY_CLASSES", message: `These utility classes have no matching generated CSS rules and are not compiled in preview: ${utilities.join(", ")}. Add authored CSS rules or remove the unsupported utility classes.` });
  }

  return issues;
}

module.exports = { validateFrontendQuality, findReachableFrontendFiles, resolveImportPath };
