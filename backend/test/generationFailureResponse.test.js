const assert = require("node:assert/strict");
const test = require("node:test");
const { getGenerationFailureResponse } = require("../src/services/generationFailureResponse");
const { buildGenerationDiagnostic } = require("../src/services/generationDiagnostics");

test("provider failures retain gateway status with safe actionable messages", () => {
  assert.equal(getGenerationFailureResponse({ code: "PROVIDER_UNAVAILABLE" }).status, 502);
  assert.match(getGenerationFailureResponse({ code: "PROVIDER_UNAVAILABLE" }).message, /AI provider/);
  assert.equal(getGenerationFailureResponse({ code: "PROVIDER_ERROR" }).status, 502);
  assert.equal(getGenerationFailureResponse({ code: "MALFORMED_PROVIDER_RESPONSE" }).status, 502);
  assert.equal(getGenerationFailureResponse({ code: "INVALID_GENERATED_PROJECT" }).status, 422);
  assert.deepEqual(
    (({ status, code, requestId }) => ({ status, code, requestId }))(getGenerationFailureResponse({ code: "PROVIDER_ERROR", generationId: "gen-123" })),
    { status: 502, code: "PROVIDER_ERROR", requestId: "gen-123" },
  );
});

test("configuration and project validation failures use distinct statuses", () => {
  assert.equal(getGenerationFailureResponse({ code: "PROVIDER_NOT_CONFIGURED" }).status, 503);
  assert.equal(getGenerationFailureResponse({ code: "QUALITY_REPAIR_FAILED", message: "specific safe validation detail" }).status, 422);
  assert.equal(getGenerationFailureResponse({ code: "QUALITY_REPAIR_FAILED", message: "specific safe validation detail" }).message, "specific safe validation detail");
  assert.equal(getGenerationFailureResponse({ code: "QUALITY_REPAIR_PROVIDER_FAILED", message: "validation findings and safe provider failure detail" }).status, 502);
  assert.equal(getGenerationFailureResponse({ code: "QUALITY_REPAIR_PROVIDER_FAILED", message: "validation findings and safe provider failure detail" }).message, "validation findings and safe provider failure detail");
});

test("unexpected internal failures are not mislabeled as gateway failures", () => {
  const result = getGenerationFailureResponse(new Error("private internal detail"));
  assert.equal(result.status, 500);
  assert.doesNotMatch(result.message, /private internal detail/);
});

test("unexpected local failures log stage, safe type/code, and stack frames without error text", () => {
  const error = new Error("token=private-value https://private.example/path");
  error.code = "ELOCAL_FAILURE";
  const diagnostic = buildGenerationDiagnostic(error, { stage: "persist-generated-project", status: 500 });
  assert.equal(diagnostic.stage, "persist-generated-project");
  assert.equal(diagnostic.errorType, "Error");
  assert.equal(diagnostic.errorCode, "ELOCAL_FAILURE");
  assert.equal(diagnostic.httpStatus, 500);
  assert.ok(diagnostic.stack.length > 0);
  assert.doesNotMatch(JSON.stringify(diagnostic), /private-value|private\.example/);
});

test("expected provider failures keep their upstream status and do not log a stack", () => {
  const diagnostic = buildGenerationDiagnostic(
    Object.assign(new Error("private provider response"), { name: "ProjectGenerationError", code: "PROVIDER_ERROR" }),
    { stage: "provider-generation", status: 502, expected: true },
  );
  assert.equal(diagnostic.errorCode, "PROVIDER_ERROR");
  assert.equal(diagnostic.httpStatus, 502);
  assert.equal("stack" in diagnostic, false);
});

test("generation diagnostics whitelist provider messages and include correlation metadata", () => {
  const diagnostic = buildGenerationDiagnostic(Object.assign(new Error("secret prompt sk-secret-value"), {
    name: "ProjectGenerationError",
    code: "PROVIDER_ERROR",
    generationId: "gen-safe-1",
    phase: "quality-repair",
    upstreamStatus: 429,
    providerErrorCategory: "rate_limit",
    providerMessage: "Provider quota or rate limit reached.",
  }), { stage: "provider-generation", status: 502, expected: true });
  assert.equal(diagnostic.generationId, "gen-safe-1");
  assert.equal(diagnostic.phase, "quality-repair");
  assert.equal(diagnostic.upstreamStatus, 429);
  assert.equal(diagnostic.providerErrorCategory, "rate_limit");
  assert.equal(diagnostic.providerMessage, "Provider quota or rate limit reached.");
  assert.doesNotMatch(JSON.stringify(diagnostic), /secret prompt|sk-secret-value/);

  const unsafe = buildGenerationDiagnostic(Object.assign(new Error(""), {
    providerErrorCategory: "raw provider details",
    providerMessage: "raw provider prompt echo",
  }), { expected: true });
  assert.equal(unsafe.providerErrorCategory, "unknown");
  assert.equal(unsafe.providerMessage, null);
});
