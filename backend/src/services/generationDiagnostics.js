function safeLabel(value, fallback) {
  return typeof value === "string" && /^[A-Za-z0-9_.-]{1,80}$/.test(value) ? value : fallback;
}

function safeStackFrames(stack) {
  if (typeof stack !== "string") return [];
  return stack.split("\n").slice(1, 7)
    .map((line) => line.trim())
    .filter((line) => /^at\s/.test(line))
    .map((line) => line
      .replace(/\bBearer\s+\S+/gi, "Bearer [redacted]")
      .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, "[redacted-key]")
      .replace(/https?:\/\/[^\s)]+/gi, "[redacted-url]")
      .replace(/[\r\n\u0000-\u001f]/g, " ")
      .slice(0, 240));
}

function buildGenerationDiagnostic(error, { stage, status, expected = false } = {}) {
  const diagnostic = {
    stage: safeLabel(stage, "unknown"),
    errorType: safeLabel(error?.name, "Error"),
    errorCode: safeLabel(error?.code, "UNKNOWN"),
    httpStatus: Number.isInteger(status) ? status : 500,
    generationId: safeLabel(error?.generationId, "unknown"),
    phase: safeLabel(error?.phase, "unknown"),
    upstreamStatus: Number.isInteger(error?.upstreamStatus) ? error.upstreamStatus : null,
    providerErrorCategory: safeLabel(error?.providerErrorCategory, "unknown"),
    providerMessage: safeProviderMessage(error?.providerMessage),
  };
  if (!expected) diagnostic.stack = safeStackFrames(error?.stack);
  return diagnostic;
}

function safeProviderMessage(value) {
  const allowed = new Set([
    "The provider request could not be completed.",
    "Provider quota or rate limit reached.",
    "Provider authentication or permission was rejected.",
    "The configured provider model was not found or is unavailable.",
    "The provider request exceeded the model context limit.",
    "The provider reported a server-side failure.",
    "The provider rejected the generation request.",
    "The provider response did not contain generated content.",
    "The provider response content was not valid JSON.",
    "The provider stopped before completing the JSON output because it reached its token limit.",
    "The provider filtered the generated response.",
    "The provider returned an unexpected response format.",
    "The provider request timed out.",
  ]);
  return allowed.has(value) ? value : null;
}

module.exports = { buildGenerationDiagnostic, safeStackFrames };
