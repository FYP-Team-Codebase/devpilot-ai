const { validateGeneratedProject } = require("../generation/validators/generatedProjectValidator");

// Assessment: Project already stores context/status/files; trusted context building and
// strict output validation also exist. This adapter is the missing provider boundary.
// Flow: authenticated project route -> persisted context builder -> this provider ->
// existing validator -> controller persists validated files/status -> GenerationPage.
const SYSTEM_PROMPT = `You generate complete, runnable MERN applications, not UI mockups. Build a React + Vite frontend and a Node.js + Express backend using MongoDB. Implement the requested pages and features end to end, including appropriate API routes, data models, validation, and responsive styling. For frontend dependencies, use React and ReactDOM, and only these optional browser packages: lucide-react, framer-motion, motion, react-router-dom, clsx, tailwind-merge, date-fns, recharts, axios, zustand, and @radix-ui packages. Do not import packages outside that set. Use normal relative imports within frontend/src. Keep the initial route usable without backend credentials or API data. Use supplied inspiration image URLs when relevant, use valid remote image URLs for other imagery, and keep the image source in the rendered frontend. Local public assets may be SVG files.

Return only one JSON object matching schemaVersion 1 and this shape: {"schemaVersion":1,"project":{"name":"...","summary":"...","stack":["React","Vite","Node.js","Express","MongoDB"],"entrypoints":{"frontend":"frontend/src/main.jsx","backend":"backend/src/server.js"}},"files":[{"path":"relative/path","language":"...","content":"complete file text"}]}.

PATH RULES:
- Root-level files allowed and required: README.md, .gitignore, and .env.example.
- Frontend files MUST be under frontend/.
- Backend files MUST be under backend/.
- NEVER create backend/.env.example or frontend/.env.example.
- The ONLY .env.example file must be exactly .env.example at the repository root.
- Do not put any other files at the repository root.

REQUIRED FILES (include every path exactly as written):
- frontend/package.json
- frontend/index.html
- frontend/src/main.jsx
- frontend/src/App.jsx
- backend/package.json
- backend/src/server.js
- backend/src/app.js
- README.md
- .gitignore
- .env.example

LANGUAGE MAPPING (set each file's language to the exact value shown; do not infer or guess):
- .jsx => "jsx"
- .js => "javascript"
- .tsx => "tsx"
- .ts => "typescript"
- .json => "json"
- .html => "html"
- .css => "css"
- .md => "markdown"
- .svg => "svg"
- .txt => "text"
- .env.example and .gitignore => "text"

ENVIRONMENT FILE:
- The root .env.example must contain ONLY safe placeholder/example values.
- Never include real API keys, JWT secrets, passwords, private keys, tokens, or credentials.
- Use clearly fake placeholders, for example OPENAI_API_KEY=your_openai_api_key_here, JWT_SECRET=your_jwt_secret_here, and MONGO_URI=mongodb://localhost:27017/devpilot. Use similarly obvious placeholders for any other environment variables.

For frontend dependencies, use React and ReactDOM, and only these optional browser packages: lucide-react, framer-motion, motion, react-router-dom, clsx, tailwind-merge, date-fns, recharts, axios, zustand, and @radix-ui packages. Do not import packages outside that set. Keep files concise enough to fit within the output limits.`;

class ProjectGenerationError extends Error {
  constructor(message, code = "GENERATION_FAILED") {
    super(message);
    this.name = "ProjectGenerationError";
    this.code = code;
  }
}

async function generateProject(context) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ProjectGenerationError("AI generation is not configured. Set OPENAI_API_KEY on the backend.", "PROVIDER_NOT_CONFIGURED");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  let response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(180000),
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Generate the complete project from this normalized context:\n${JSON.stringify(context)}` },
        ],
      }),
    });
  } catch {
    throw new ProjectGenerationError("Could not reach the AI provider. Please try again.", "PROVIDER_UNAVAILABLE");
  }

  if (!response.ok) {
    // Provider response bodies can contain operational details; never forward or log them.
    throw new ProjectGenerationError("The AI provider could not complete this generation. Please try again.", "PROVIDER_ERROR");
  }

  let payload;
  try {
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("Missing model content");
    payload = JSON.parse(content);
  } catch {
    throw new ProjectGenerationError("The AI provider returned malformed project data. Please retry generation.", "MALFORMED_PROVIDER_RESPONSE");
  }

  const validation = validateGeneratedProject(payload);
  if (!validation.valid) {
    const details = validation.errors.slice(0, 3).map((item) => item.message).join(" ");
    throw new ProjectGenerationError(`The generated project did not pass validation. ${details}`, "INVALID_GENERATED_PROJECT");
  }

  return {
    projectName: validation.value.project.name,
    generatedFiles: validation.value.files,
    generationMetadata: validation.value.project,
  };
}

module.exports = { generateProject, ProjectGenerationError };
