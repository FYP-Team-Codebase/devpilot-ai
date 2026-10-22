const path = require("node:path");
const { findReachableFrontendFiles } = require("../validators/frontendQualityValidator");

function safePaletteColor(value) {
  return typeof value === "string" && /^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(value) ? value : null;
}

function luminance(color) {
  const hex = color.length === 4 ? color.slice(1).split("").map((character) => character + character).join("") : color.slice(1);
  const channels = [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function stylesheetContent(targetPath, existingStylesheets, profiles) {
  if (existingStylesheets.length) {
    const nearest = existingStylesheets.slice().sort((left, right) => {
      const leftDistance = path.posix.relative(path.posix.dirname(targetPath), left.path).split("/").length;
      const rightDistance = path.posix.relative(path.posix.dirname(targetPath), right.path).split("/").length;
      return leftDistance - rightDistance;
    })[0];
    let relative = path.posix.relative(path.posix.dirname(targetPath), nearest.path);
    if (!relative.startsWith(".")) relative = `./${relative}`;
    return `/* Preserve and reuse the project's existing generated styles. */\n@import ${JSON.stringify(relative)};\n`;
  }

  const palette = (profiles || []).flatMap((profile) => Array.isArray(profile?.palette) ? profile.palette : [])
    .map(safePaletteColor).filter(Boolean);
  const ink = palette.find((color) => luminance(color) <= 0.35) || "#202521";
  const paper = palette.find((color) => luminance(color) >= 0.78) || "#ffffff";
  const accent = palette.find((color) => color !== ink && color !== paper) || "#63786d";
  return `:root { color-scheme: light; --dp-ink: ${ink}; --dp-paper: ${paper}; --dp-accent: ${accent}; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }\n* { box-sizing: border-box; }\nbody { margin: 0; min-width: 320px; color: var(--dp-ink); background: var(--dp-paper); font-family: inherit; line-height: 1.5; }\nimg, video { display: block; max-width: 100%; height: auto; }\na { color: inherit; }\nbutton, input, select, textarea { font: inherit; }\nnav { display: flex; align-items: center; flex-wrap: wrap; gap: 1rem; }\nnav a { color: inherit; text-decoration: none; }\n:focus-visible { outline: 3px solid var(--dp-accent); outline-offset: 3px; }\n@media (max-width: 40rem) { nav { gap: .75rem; } }\n`;
}

// Repair only genuinely absent local CSS imports. Never replace generated files,
// accept an unresolved JS/module import, or mask an import whose casing is wrong.
function repairMissingStylesheets(files, profiles = []) {
  const { byPath, unresolved, caseMismatches } = findReachableFrontendFiles(files);
  const caseMismatchKeys = new Set(caseMismatches.map(({ importer, specifier }) => `${importer}\0${specifier}`));
  const missing = new Map();
  for (const issue of unresolved) {
    if (caseMismatchKeys.has(`${issue.importer}\0${issue.specifier}`)) continue;
    const cleanSpecifier = issue.specifier.split(/[?#]/, 1)[0];
    if (!/\.css$/i.test(cleanSpecifier)) continue;
    const targetPath = path.posix.normalize(path.posix.join(path.posix.dirname(issue.importer), cleanSpecifier));
    if (!targetPath.startsWith("frontend/") || byPath.has(targetPath)) continue;
    missing.set(targetPath, issue);
  }
  if (!missing.size) return { files, added: [] };

  const existingStylesheets = files.filter((file) => file.path.startsWith("frontend/") && /\.css$/i.test(file.path));
  const added = [...missing.keys()].map((targetPath) => ({
    path: targetPath,
    language: "css",
    content: stylesheetContent(targetPath, existingStylesheets, profiles),
  }));
  return { files: [...files, ...added], added: added.map(({ path: filePath }) => filePath) };
}

module.exports = { repairMissingStylesheets };
