const assert = require("node:assert/strict");
const { Writable } = require("node:stream");
const { inflateRawSync } = require("node:zlib");
const Project = require("../src/models/Project");
const { exportProject } = require("../src/controllers/projectController");

class Response extends Writable {
  constructor() {
    super();
    this.headers = {};
    this.chunks = [];
    this.code = 200;
  }
  _write(chunk, _encoding, callback) { this.chunks.push(Buffer.from(chunk)); callback(); }
  status(code) { this.code = code; return this; }
  set(headers) { Object.assign(this.headers, headers); return this; }
  json(body) { this.body = body; return this; }
  get bodyBuffer() { return Buffer.concat(this.chunks); }
}

function readZip(buffer) {
  const files = new Map();
  let offset = buffer.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  while (offset >= 0 && offset + 46 <= buffer.length && buffer.readUInt32LE(offset) === 0x02014b50) {
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const nameStart = offset + 46;
    const name = buffer.toString("utf8", nameStart, nameStart + nameLength);
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
    files.set(name, method === 8 ? inflateRawSync(compressed).toString("utf8") : compressed.toString("utf8"));
    offset = buffer.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]), nameStart + nameLength + extraLength + commentLength);
  }
  return files;
}

async function invoke(id, userId) {
  const response = new Response();
  await exportProject({ params: { id }, userId }, response);
  if (response.code === 200 && !response.body && !response.writableFinished) await new Promise((resolve, reject) => {
    response.once("finish", resolve);
    response.once("error", reject);
  });
  return response;
}

async function main() {
  const originalFindOne = Project.findOne;
  const originalFindById = Project.findById;
  try {
    let queried;
    Project.findOne = async (query) => { queried = query; return null; };
    Project.findById = () => ({
      select(fields) { assert.equal(fields, "_id user"); return this; },
      lean: async () => ({ _id: "0123456789abcdef01234567", user: "owner-a" }),
    });
    const invalid = await invoke("bad-id", "owner-a");
    assert.equal(invalid.code, 400);
    assert.equal(invalid.body.message, "Invalid project ID.");
    assert.equal(queried, undefined);

    const foreign = await invoke("0123456789abcdef01234567", "owner-b");
    assert.equal(foreign.code, 404);
    assert.deepEqual(queried, { _id: "0123456789abcdef01234567", user: "owner-b" });

    Project.findOne = async (query) => {
      queried = query;
      return {
        user: "owner-a",
        projectName: "Cafe Project",
        generationStatus: "completed",
        generatedFiles: [
          { path: "package.json", content: '{"name":"cafe-project"}' },
          { path: "vite.config.js", content: "export default {};" },
          { path: "frontend/index.html", content: "<html><body><div id=\"root\"></div></body></html>" },
          { path: "frontend/src/nested/App.jsx", content: "const savedSourceEdit = true;" },
          { path: "frontend/public/assets/logo.svg", content: "<svg><title>雪だるま</title></svg>" },
          { path: "backend/src/server.js", content: "const app = 'backend';" },
        ],
        editorDesign: { pages: { "/": { elements: { "body>p:nth-of-type(1)": { content: "Latest visual edit" } } } } },
      };
    };
    const response = await invoke("0123456789abcdef01234567", "owner-a");
    assert.equal(response.code, 200);
    assert.equal(response.headers["Content-Type"], "application/zip");
    assert.match(response.headers["Content-Disposition"], /attachment; filename="Cafe-Project\.zip"/);
    assert.deepEqual(queried, { _id: "0123456789abcdef01234567", user: "owner-a" });
    const files = readZip(response.bodyBuffer);
    assert.equal(files.get("package.json"), '{"name":"cafe-project"}');
    assert.equal(files.get("vite.config.js"), "export default {};");
    assert.equal(files.get("frontend/src/nested/App.jsx"), "const savedSourceEdit = true;");
    assert.equal(files.get("frontend/public/assets/logo.svg"), "<svg><title>雪だるま</title></svg>");
    assert.equal(files.get("backend/src/server.js"), "const app = 'backend';");
    assert.match(files.get("frontend/index.html"), /devpilot-editor-design\.js/);
    assert.match(files.get("frontend/public/devpilot-editor-design.json"), /Latest visual edit/);
    assert.match(files.get("frontend/public/devpilot-editor-design.js"), /MutationObserver/);
    console.log("Project export tests passed: invalid ID, ownership scoping, ZIP structure, latest source and visual editor state.");
  } finally {
    Project.findOne = originalFindOne;
    Project.findById = originalFindById;
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
