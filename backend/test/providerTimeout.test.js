const assert = require("node:assert/strict");
const test = require("node:test");
const {
  requestProviderProject,
  getProviderTimeoutMs,
  getGenerationBudgetMs,
  DEFAULT_PROVIDER_TIMEOUT_MS,
  DEFAULT_GENERATION_BUDGET_MS,
} = require("../src/services/projectGenerationService");

const quiet = async (fn) => {
  const original = console.error;
  console.error = () => {};
  try { return await fn(); } finally { console.error = original; }
};

test("provider and generation deadlines use bounded configurable defaults", () => {
  assert.equal(getProviderTimeoutMs(), DEFAULT_PROVIDER_TIMEOUT_MS);
  assert.equal(getGenerationBudgetMs(), DEFAULT_GENERATION_BUDGET_MS);
  const previousProvider = process.env.OPENAI_REQUEST_TIMEOUT_MS;
  const previousBudget = process.env.GENERATION_TOTAL_TIMEOUT_MS;
  process.env.OPENAI_REQUEST_TIMEOUT_MS = "120000";
  process.env.GENERATION_TOTAL_TIMEOUT_MS = "180000";
  try {
    assert.equal(getProviderTimeoutMs(), 120000);
    assert.equal(getGenerationBudgetMs(), 180000);
    process.env.OPENAI_REQUEST_TIMEOUT_MS = "999999";
    assert.equal(getProviderTimeoutMs(), DEFAULT_PROVIDER_TIMEOUT_MS);
  } finally {
    if (previousProvider === undefined) delete process.env.OPENAI_REQUEST_TIMEOUT_MS;
    else process.env.OPENAI_REQUEST_TIMEOUT_MS = previousProvider;
    if (previousBudget === undefined) delete process.env.GENERATION_TOTAL_TIMEOUT_MS;
    else process.env.GENERATION_TOTAL_TIMEOUT_MS = previousBudget;
  }
});

test("provider timeout aborts fetch and is not retried ambiguously", async () => {
  const previousFetch = global.fetch;
  let calls = 0;
  let requestSignal;
  global.fetch = async (_url, options) => {
    calls += 1;
    requestSignal = options.signal;
    return new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(options.signal.reason), { once: true }));
  };
  try {
    await quiet(() => assert.rejects(requestProviderProject({}, "test-key", {
      generationId: "timeout-test", deadlineAt: Date.now() + 2000, timeoutMs: 20,
    }), (error) => error.code === "PROVIDER_TIMEOUT" && error.phase === "initial-generation"));
    assert.equal(calls, 1);
    assert.equal(requestSignal.aborted, true);
  } finally { global.fetch = previousFetch; }
});

test("caller cancellation aborts the provider request and is classified separately", async () => {
  const previousFetch = global.fetch;
  const controller = new AbortController();
  let calls = 0;
  global.fetch = async (_url, options) => {
    calls += 1;
    return new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(options.signal.reason), { once: true }));
  };
  const pending = requestProviderProject({}, "test-key", {
    generationId: "cancel-test", deadlineAt: Date.now() + 2000, timeoutMs: 1000, signal: controller.signal,
  });
  controller.abort();
  try {
    await quiet(() => assert.rejects(pending, (error) => error.code === "GENERATION_CANCELLED"));
    assert.equal(calls, 1);
  } finally { global.fetch = previousFetch; }
});

test("an exhausted generation budget makes no provider request", async () => {
  const previousFetch = global.fetch;
  let calls = 0;
  global.fetch = async () => { calls += 1; throw new Error("must not execute"); };
  try {
    await quiet(() => assert.rejects(requestProviderProject({}, "test-key", {
      generationId: "budget-test", deadlineAt: Date.now() - 1,
    }), (error) => error.code === "GENERATION_BUDGET_EXHAUSTED"));
    assert.equal(calls, 0);
  } finally { global.fetch = previousFetch; }
});

test("a request limited by the remaining total budget reports budget exhaustion", async () => {
  const previousFetch = global.fetch;
  global.fetch = async (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener("abort", () => reject(options.signal.reason), { once: true });
  });
  try {
    await quiet(() => assert.rejects(requestProviderProject({}, "test-key", {
      generationId: "deadline-limited-test", deadlineAt: Date.now() + 25, timeoutMs: 1000,
    }), (error) => error.code === "GENERATION_BUDGET_EXHAUSTED"));
  } finally { global.fetch = previousFetch; }
});

test("a 429 may retry once, but provider retries remain bounded", async () => {
  const previousFetch = global.fetch;
  let calls = 0;
  global.fetch = async () => {
    calls += 1;
    return { ok: false, status: 429, headers: { get: (name) => name === "retry-after-ms" ? "0" : null }, json: async () => ({ error: { type: "rate_limit_error" } }) };
  };
  try {
    await quiet(() => assert.rejects(requestProviderProject({}, "test-key", {
      generationId: "retry-test", deadlineAt: Date.now() + 2000, timeoutMs: 1000,
    }), (error) => error.code === "PROVIDER_ERROR" && error.upstreamStatus === 429));
    assert.equal(calls, 2);
  } finally { global.fetch = previousFetch; }
});

test("timeout while reading provider response is classified as timeout", async () => {
  const previousFetch = global.fetch;
  global.fetch = async (_url, options) => ({
    ok: true,
    json: () => new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(options.signal.reason), { once: true })),
  });
  try {
    await quiet(() => assert.rejects(requestProviderProject({}, "test-key", {
      generationId: "body-timeout-test", deadlineAt: Date.now() + 2000, timeoutMs: 20,
    }), (error) => error.code === "PROVIDER_TIMEOUT"));
  } finally { global.fetch = previousFetch; }
});
