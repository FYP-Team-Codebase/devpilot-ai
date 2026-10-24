const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const express = require("express");
const authMiddleware = require("../src/middleware/authMiddleware");
const router = require("../src/routes/subscriptionRoutes");
const User = require("../src/models/User");
const { login } = require("../src/controllers/authController");

const USER_A = "507f1f77bcf86cd799439011";
const USER_B = "507f1f77bcf86cd799439012";
let server;
let baseUrl;
let users;
const originals = { findById: User.findById, findOne: User.findOne, findOneAndUpdate: User.findOneAndUpdate, rawFind: User.collection.findOne };
const previousSecret = process.env.JWT_SECRET;

function query(result) {
  const promise = Promise.resolve(result);
  promise.select = () => promise;
  return promise;
}

function token(userId = USER_A) { return jwt.sign({ userId }, process.env.JWT_SECRET); }

async function request(path, { method = "GET", body, userId = USER_A, authenticate = true } = {}) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: { ...(authenticate ? { Authorization: `Bearer ${token(userId)}` } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

test.before(async () => {
  process.env.JWT_SECRET = "subscription-test-only-secret";
  const app = express();
  app.use(express.json());
  app.use("/api/subscriptions", authMiddleware, router);
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api/subscriptions`;
});

test.beforeEach(() => {
  users = new Map([
    [USER_A, { _id: USER_A, email: "a@example.com", subscription: { plan: "free", status: "inactive", simulated: false, activatedAt: null, canceledAt: null } }],
    [USER_B, { _id: USER_B, email: "b@example.com", subscription: { plan: "free", status: "inactive", simulated: false, activatedAt: null, canceledAt: null } }],
  ]);
  User.findById = (id) => query(users.get(String(id)) || null);
  User.findOneAndUpdate = async (filter, update) => {
    const user = users.get(String(filter._id));
    if (!user) return null;
    const subscription = user.subscription;
    const statusFilter = filter["subscription.status"];
    if (statusFilter?.$ne && subscription.status === statusFilter.$ne) return null;
    if (statusFilter && typeof statusFilter === "string" && subscription.status !== statusFilter) return null;
    if (filter["subscription.plan"] && subscription.plan !== filter["subscription.plan"]) return null;
    for (const [key, value] of Object.entries(update.$set || {})) {
      if (key === "subscription") user.subscription = value;
      else if (key.startsWith("subscription.")) user.subscription[key.slice("subscription.".length)] = value;
    }
    return user;
  };
  User.findOne = (filter) => query(users.get(String(filter.email) === "a@example.com" ? USER_A : USER_B) || null);
  User.collection.findOne = async () => ({ isEmailVerified: true });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  User.findById = originals.findById;
  User.findOne = originals.findOne;
  User.findOneAndUpdate = originals.findOneAndUpdate;
  User.collection.findOne = originals.rawFind;
  if (previousSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = previousSecret;
});

test("requires authentication for confirmation and subscription cancellation", async () => {
  let response = await request("/demo-checkout", { method: "POST", body: { outcome: "success" }, authenticate: false });
  assert.equal(response.status, 401);
  response = await request("/cancel", { method: "POST", authenticate: false });
  assert.equal(response.status, 401);
});

test("successful confirmation uses server pricing, persists Pro, refreshes from server, and is idempotent", async () => {
  let response = await request("/demo-checkout");
  let summary = await response.json();
  assert.equal(response.status, 200);
  assert.equal(summary.plan.amount, 19);
  assert.equal(summary.plan.interval, "month");
  assert.equal(summary.accountEmail, "a@example.com");

  response = await request("/demo-checkout", { method: "POST", body: { outcome: "success", amount: 0.01, plan: "team", userId: USER_B } });
  let first = await response.json();
  assert.equal(response.status, 200);
  assert.equal(first.subscription.plan, "pro");
  assert.equal(first.subscription.status, "active");
  assert.equal(first.subscription.simulated, true);
  assert.ok(first.subscription.activatedAt);
  assert.equal(users.get(USER_A).subscription.plan, "pro");
  assert.equal(users.get(USER_B).subscription.plan, "free");
  const firstActivation = first.subscription.activatedAt;

  response = await request("/demo-checkout", { method: "POST", body: { outcome: "success" } });
  first = await response.json();
  assert.equal(first.subscription.activatedAt, firstActivation);
  response = await request("/demo-checkout");
  summary = await response.json();
  assert.equal(summary.subscription.status, "active");
  assert.equal(summary.subscription.plan, "pro");
});

test("fresh login returns the active subscription persisted in MongoDB", async () => {
  const user = users.get(USER_A);
  user.name = "Demo Account";
  user.password = await bcrypt.hash("demo-password", 4);
  user.isEmailVerified = true;
  user.subscription = { plan: "pro", status: "active", simulated: true, activatedAt: new Date(), canceledAt: null };
  let response;
  const res = { status(code) { this.statusCode = code; return this; }, json(data) { response = data; return this; } };
  await login({ body: { email: user.email, password: "demo-password" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(response.user.subscription.plan, "pro");
  assert.equal(response.user.subscription.status, "active");
});

test("checkout failure, cancellation, and invalid outcomes never activate Pro", async () => {
  let response = await request("/demo-checkout", { method: "POST", body: { outcome: "failure" } });
  assert.equal(response.status, 200);
  assert.equal(users.get(USER_A).subscription.status, "inactive");
  response = await request("/demo-checkout", { method: "POST", body: { outcome: "cancel" } });
  assert.equal(response.status, 200);
  assert.equal(users.get(USER_A).subscription.plan, "free");
  response = await request("/demo-checkout", { method: "POST", body: { outcome: "approved" } });
  assert.equal(response.status, 400);
  assert.equal(users.get(USER_A).subscription.status, "inactive");
});

test("only the authenticated account is changed even when the body names another user", async () => {
  const response = await request("/demo-checkout", { method: "POST", userId: USER_B, body: { outcome: "success", userId: USER_A } });
  assert.equal(response.status, 200);
  assert.equal(users.get(USER_B).subscription.plan, "pro");
  assert.equal(users.get(USER_A).subscription.plan, "free");
});

test("cancellation persists, revokes Pro, is idempotent, and allows later reactivation", async () => {
  await request("/demo-checkout", { method: "POST", body: { outcome: "success" } });
  const activatedAt = users.get(USER_A).subscription.activatedAt;
  let response = await request("/cancel", { method: "POST", body: { userId: USER_B, plan: "team", amount: 0 } });
  let result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.canceled, true);
  assert.equal(result.subscription.status, "canceled");
  assert.ok(result.subscription.canceledAt);
  assert.equal(result.subscription.activatedAt, activatedAt.toISOString());
  assert.equal(users.get(USER_A).subscription.plan, "pro");

  const canceledAt = result.subscription.canceledAt;
  response = await request("/cancel", { method: "POST" });
  result = await response.json();
  assert.equal(result.canceled, false);
  assert.equal(result.subscription.status, "canceled");
  assert.equal(result.subscription.canceledAt, canceledAt);
  response = await request("/demo-checkout");
  assert.equal((await response.json()).subscription.status, "canceled");

  response = await request("/cancel", { method: "POST", userId: USER_B });
  assert.equal((await response.json()).canceled, false);
  response = await request("/demo-checkout", { method: "POST", body: { outcome: "success" } });
  result = await response.json();
  assert.equal(result.subscription.status, "active");
  assert.equal(result.subscription.canceledAt, null);
  assert.ok(result.subscription.activatedAt);
});
