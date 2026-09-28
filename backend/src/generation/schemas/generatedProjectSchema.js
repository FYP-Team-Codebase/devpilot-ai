const ALLOWED_LANGUAGES = new Set([
  "javascript",
  "jsx",
  "typescript",
  "tsx",
  "json",
  "html",
  "css",
  "markdown",
  "svg",
  "text",
]);

const REQUIRED_STACK = ["react", "vite", "node", "express", "mongodb"];

const STACK_ALIASES = new Map([
  ["react", "react"],
  ["react.js", "react"],
  ["vite", "vite"],
  ["node", "node"],
  ["node.js", "node"],
  ["nodejs", "node"],
  ["express", "express"],
  ["express.js", "express"],
  ["mongodb", "mongodb"],
  ["mongo", "mongodb"],
  ["mongo db", "mongodb"],
]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeStackValue(value) {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  return STACK_ALIASES.get(normalized) || normalized;
}

function normalizeStack(stack) {
  return stack.map(normalizeStackValue);
}

module.exports = {
  ALLOWED_LANGUAGES,
  REQUIRED_STACK,
  isPlainObject,
  isNonEmptyString,
  normalizeStack,
};
