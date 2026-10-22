const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const jwt = require("jsonwebtoken");
const express = require("express");
const authMiddleware = require("../src/middleware/authMiddleware");
const router = require("../src/routes/assetRoutes");
const Asset = require("../src/models/Asset");
const Project = require("../src/models/Project");
const { updateProject } = require("../src/controllers/projectController");
const cloud = require("../src/services/cloudinaryService");

const USER_A = "507f1f77bcf86cd799439011";
const USER_B = "507f1f77bcf86cd799439012";
const ASSET_ID = "607f1f77bcf86cd799439011";
const PROJECT_ID = "707f1f77bcf86cd799439011";
const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
let server;
let baseUrl;
let records;
let cloudCalls;

function token(userId = USER_A) { return jwt.sign({ userId }, process.env.JWT_SECRET); }
function assetRecord(overrides = {}) {
  return { _id: ASSET_ID, owner: USER_A, project: null, category: "general", originalFilename: "logo.png", publicId: "devpilot/file", resourceType: "image", format: "png", mimeType: "image/png", size: png.length, secureUrl: "https://res.cloudinary.com/demo/image/upload/logo.png", status: "active", createdAt: new Date(), updatedAt: new Date(), save: async function save() { return this; }, ...overrides };
}
function setFile(name = "logo.png", type = "image/png", bytes = png) {
  const form = new FormData();
  form.append("category", "general");
  form.append("file", new Blob([bytes], { type }), name);
  return form;
}
async function request(path, { method = "GET", userId = USER_A, body, authenticate = true } = {}) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: authenticate ? { Authorization: `Bearer ${token(userId)}` } : {},
    body,
  });
}

test.before(async () => {
  process.env.JWT_SECRET = "test-only-secret";
  process.env.CLOUDINARY_CLOUD_NAME = "test";
  process.env.CLOUDINARY_API_KEY = "test";
  process.env.CLOUDINARY_API_SECRET = "test";
  const app = express();
  app.use("/api/assets", authMiddleware, (req, res, next) => {
    if (req.method === "POST" && !cloud.isConfigured()) return res.status(503).json({ success: false, message: "File uploads are not configured on this server." });
    return next();
  }, router);
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api/assets`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test.beforeEach(() => {
  records = [];
  cloudCalls = [];
  Asset.create = async (data) => {
    const record = assetRecord(data);
    records.push(record);
    return record;
  };
  Asset.find = (query) => ({ sort: () => ({ limit: async () => records.filter((record) => String(record.owner) === String(query.owner)) }) });
  Asset.findOne = async (query) => records.find((record) => String(record._id) === String(query._id) && String(record.owner) === String(query.owner)) || null;
  Asset.deleteOne = async ({ _id }) => { records = records.filter((record) => String(record._id) !== String(_id)); return { deletedCount: 1 }; };
  Project.findOne = ({ _id, user }) => ({ select: async () => String(_id) === PROJECT_ID && String(user) === USER_A ? { _id: PROJECT_ID } : null });
  cloud.ensureConfigured = () => {};
  cloud.uploadBuffer = async () => { cloudCalls.push("upload"); return { public_id: "devpilot/file", resource_type: "image", format: "png", secure_url: "https://res.cloudinary.com/demo/image/upload/logo.png" }; };
  cloud.deleteResource = async () => { cloudCalls.push("delete"); return { result: "ok" }; };
});

test("upload requires authentication and reports missing Cloudinary configuration", async () => {
  let response = await request("/", { method: "POST", body: setFile(), authenticate: false });
  assert.equal(response.status, 401);
  const configured = cloud.isConfigured;
  cloud.isConfigured = () => false;
  response = await request("/", { method: "POST", body: setFile() });
  assert.equal(response.status, 503);
  assert.match((await response.json()).message, /not configured/i);
  cloud.isConfigured = configured;
});

test("rejects unsupported and oversized files, and validates project ownership", async () => {
  let response = await request("/", { method: "POST", body: setFile("payload.exe", "application/octet-stream", Buffer.from("MZ")) });
  assert.equal(response.status, 415);
  const largeForm = setFile("large.png", "image/png", Buffer.alloc(4 * 1024 * 1024 + 1, 1));
  response = await request("/", { method: "POST", body: largeForm });
  assert.equal(response.status, 413);
  const form = setFile();
  form.set("projectId", "invalid");
  response = await request("/", { method: "POST", body: form });
  assert.equal(response.status, 400);
  const foreignForm = setFile();
  foreignForm.set("projectId", PROJECT_ID);
  response = await request("/", { method: "POST", userId: USER_B, body: foreignForm });
  assert.equal(response.status, 404);
  assert.deepEqual(cloudCalls, []);
});

test("persists upload metadata, scopes listing, and blocks cross-user read and deletion", async () => {
  let response = await request("/", { method: "POST", body: setFile() });
  assert.equal(response.status, 201);
  assert.equal((await response.json()).asset.originalFilename, "logo.png");
  assert.equal(records.length, 1);
  response = await request("/");
  assert.equal((await response.json()).assets.length, 1);
  response = await request("/", { userId: USER_B });
  assert.equal((await response.json()).assets.length, 0);
  response = await request(`/${ASSET_ID}`, { userId: USER_B });
  assert.equal(response.status, 404);
  response = await request(`/${ASSET_ID}`, { method: "DELETE", userId: USER_B });
  assert.equal(response.status, 404);
  assert.equal(records.length, 1);
  assert.equal(cloudCalls.filter((call) => call === "upload").length, 1);
});

test("cleans cloud file after metadata failure and reports cloud deletion failure", async () => {
  Asset.create = async () => { throw new Error("database unavailable"); };
  let response = await request("/", { method: "POST", body: setFile() });
  assert.equal(response.status, 502);
  assert.deepEqual(cloudCalls, ["upload", "delete"]);
  cloud.deleteResource = async () => { throw new Error("cleanup unavailable"); };
  response = await request("/", { method: "POST", body: setFile() });
  assert.equal(response.status, 502);
  assert.match((await response.json()).message, /may remain in cloud storage/i);
  records = [assetRecord()];
  cloud.deleteResource = async () => { throw new Error("cloud unavailable"); };
  response = await request(`/${ASSET_ID}`, { method: "DELETE" });
  assert.equal(response.status, 502);
  assert.equal(records[0].status, "active");
});

test("deletes cloud resource before removing metadata", async () => {
  records = [assetRecord()];
  const response = await request(`/${ASSET_ID}`, { method: "DELETE" });
  assert.equal(response.status, 200);
  assert.deepEqual(cloudCalls, ["delete"]);
  assert.equal(records.length, 0);
});

test("keeps a visible cleanup-pending record when database deletion fails", async () => {
  records = [assetRecord()];
  Asset.deleteOne = async () => { throw new Error("database unavailable"); };
  let response = await request(`/${ASSET_ID}`, { method: "DELETE" });
  assert.equal(response.status, 500);
  assert.equal(records[0].status, "delete_pending");
  response = await request("/");
  assert.equal((await response.json()).assets[0].status, "delete_pending");
});

test("project updates cannot attach another user's requirement or inspiration assets", async () => {
  const project = { requirements: { toObject: () => ({}) }, save: async () => {} };
  Project.findOne = async ({ _id, user }) => String(_id) === PROJECT_ID && String(user) === USER_A ? project : null;
  Asset.find = () => ({ select: async () => [] });
  Asset.findOne = async () => null;
  const response = {
    statusCode: 200,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.payload = data; return this; },
  };
  await updateProject({ params: { id: PROJECT_ID }, userId: USER_A, body: { requirements: { assetIds: [ASSET_ID] } } }, response);
  assert.equal(response.statusCode, 400);
  await updateProject({ params: { id: PROJECT_ID }, userId: USER_A, body: { inspirations: [{ source: "userAsset", assetId: ASSET_ID, imageUrl: "https://untrusted.example/image.png" }] } }, response);
  assert.equal(response.statusCode, 400);
});

test("project asset selections are owner-scoped and persist independent project purpose settings", async () => {
  const project = { requirements: { toObject: () => ({}) }, save: async () => {} };
  Project.findOne = async ({ _id, user }) => String(_id) === PROJECT_ID && String(user) === USER_A ? project : null;
  Asset.find = (query) => ({ select: async () => query.owner === USER_A ? [assetRecord()] : [] });
  const response = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(data) { this.payload = data; return this; } };
  const selection = { assetId: ASSET_ID, purpose: "logo", placement: "header", instructions: "Keep the original proportions" };
  await updateProject({ params: { id: PROJECT_ID }, userId: USER_A, body: { assetSelections: [selection] } }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(project.assetSelections[0].purpose, "logo");
  assert.equal(project.assetSelections[0].instructions, "Keep the original proportions");
  await updateProject({ params: { id: PROJECT_ID }, userId: USER_B, body: { assetSelections: [selection] } }, response);
  assert.equal(response.statusCode, 404);
  Project.findOne = async ({ _id }) => String(_id) === PROJECT_ID ? project : null;
  await updateProject({ params: { id: PROJECT_ID }, userId: USER_B, body: { assetSelections: [selection] } }, response);
  assert.equal(response.statusCode, 400);
  assert.match(response.payload.message, /unavailable/i);
  assert.equal(project.assetSelections[0].purpose, "logo");
});
