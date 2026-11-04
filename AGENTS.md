# DevPilot AI — Codex Project Context

This file is the permanent working context for Codex sessions operating in this repository.

DevPilot AI is an existing Final Year Project. Preserve the current implementation and improve it incrementally. Do not rebuild the application or replace working subsystems without evidence and a clear reason.

## Project purpose

DevPilot AI is an AI-powered platform that generates complete MERN applications from user prompts, structured requirements, uploaded assets, and visual inspiration references.

The project uses:

- React and Vite for the frontend
- Node.js and Express for the backend
- MongoDB Atlas and Mongoose for persistence
- JWT authentication
- OpenAI API with a configurable model
- Cloudinary for uploaded assets
- Vercel for deployment

## Repository structure

### `frontend/`

React/Vite client application.

- `frontend/src/App.jsx` — browser routing and protected routes
- `frontend/src/pages/` — landing, authentication, dashboard, prompt, requirements, generation, preview, editor, export, pricing, and account pages
- `frontend/src/components/` — reusable layout, authentication, upload, workflow, and dashboard components
- `frontend/src/services/` — browser API clients and preview/generation helpers
- `frontend/src/utils/` — project resume, subscription, export, routing, and document utilities
- `frontend/public/` — favicon and trusted inspiration assets/manifests
- `frontend/scripts/` — inspiration metadata and manifest generation
- `frontend/test/` — frontend unit tests
- `frontend/package.json` — Vite, React, lint, and preview scripts

The frontend uses `VITE_API_URL` when configured and otherwise calls `/api`. Vite development proxies `/api` to `http://localhost:5000`.

### `backend/`

Node.js/CommonJS Express API.

- `backend/src/server.js` — local server startup and MongoDB connection
- `backend/src/app.js` — Express app, CORS, JSON parsing, database readiness, and route mounting
- `backend/src/routes/` — authentication, projects, subscriptions, and assets
- `backend/src/controllers/` — request handling and persistence orchestration
- `backend/src/models/` — `User`, `Project`, and `Asset` Mongoose models
- `backend/src/middleware/authMiddleware.js` — JWT bearer-token authentication
- `backend/src/generation/context/` — normalized project, asset, and inspiration context
- `backend/src/generation/schemas/` — generated-project contracts and required entrypoints
- `backend/src/generation/validators/` — path, package, generated-project, and frontend-quality validation
- `backend/src/generation/repairs/` — targeted generated-output repairs
- `backend/src/services/projectGenerationService.js` — OpenAI requests, staged generation, retries, timeouts, validation, quality checks, and repair
- `backend/src/services/inspirationFidelityReview.js` — visual-inspiration profile and source review
- `backend/test/` — backend tests

### `api/`

`api/index.js` exports the backend Express app for the Vercel serverless function.

### Root files

- `vercel.json` — Vercel build, output, rewrite, and function configuration
- `.env.example` — documented environment-variable placeholders
- `README.md` — local development instructions
- `.gitignore` — ignored secrets, dependencies, build output, and editor files
- `skills-lock.json` and `.agents/` — Codex/project support metadata

## Verified implementation

The following behavior is present in the source code. Presence in source does not guarantee successful runtime operation in the current environment.

- Signup with name, email, password, and required persona selection
- Email verification and verification-code resend
- Login using JWT authentication
- Password-reset request, OTP verification, and password reset
- User accounts and protected routes
- Project creation, listing, loading, updating, and deletion
- Structured requirements collection
- Inspiration selection from the trusted local manifest
- User asset uploads through Cloudinary
- Requirement documents and image assets
- Project-specific asset-purpose and placement selections
- OpenAI project generation
- Staged generation: manifest planning followed by file generation
- Provider timeouts, retries, generation deadlines, and bounded provider-call budgets
- Generated-file path, package, schema, size, and entrypoint validation
- Frontend quality validation
- Targeted quality repair and inspiration-fidelity review
- Persisted generated files and generation status/error information
- Generated-project preview with dependency and import diagnostics
- Technical-user source editing
- Visual editor changes with constrained design data
- ZIP export
- Simulated Pro subscription checkout and cancellation
- Vercel deployment configuration

## Runtime verification boundary

The items above were verified by repository inspection. They still require runtime verification after dependencies, environment variables, MongoDB, OpenAI, Cloudinary, email, and deployment credentials are available.

Do not describe a feature as fully working based only on its source files. When reporting status, distinguish:

- **Source-verified:** the relevant implementation and route/model/service wiring exists.
- **Test-verified:** relevant automated tests pass in the current environment.
- **Runtime-verified:** the feature was exercised against its required services and configuration.
- **Unverified:** the repository has not yet provided enough evidence.

## Git and repository state

Current verified state:

- Git installed: yes — `git version 2.53.0.windows.3`
- Git worktree detected: no — `git rev-parse --show-toplevel` failed
- Remote configured: unknown/not available — `git remote -v` could not run because no worktree was detected
- Branch verified: no — `git branch --show-current` could not run because no worktree was detected
- Commits authorized: no — explicit user approval is required

The downloaded project folder is not currently connected to a Git worktree. This must be investigated before assuming repository history, branch state, remotes, or commit availability.

### Git setup workflow

When Git is available, perform these read-only checks first:

```cmd
git --version
git rev-parse --show-toplevel
git status --short --branch
git remote -v
git branch --show-current
```

If the folder is not a worktree, tell the user clearly. Do not run `git init`, add a remote, fetch, pull, switch branches, or create a commit unless the user explicitly approves that operation and provides any required repository or remote details.

After the user provides the correct repository or remote details and explicitly requests Git setup:

1. Verify the exact project folder.
2. Verify the remote URL.
3. Verify the current branch.
4. Inspect the working tree and existing files.
5. Review the changes and status before the first commit.
6. Report whether Git is installed, a worktree is detected, a remote is configured, the branch is verified, and commits are authorized.

## Known gaps and supervisor priorities

### User personas

The `User` model persists `designer`, `technical`, and `non-technical`. Signup sends and returns the selected value. Technical users are currently allowed to edit generated source files.

The selected persona is not yet clearly carried from the prompt UI into persisted project context or the AI generation prompt. Define the desired behavior for beginner/non-technical, designer/UI-UX, and technical users before changing it. Persist and enforce persona behavior consistently.

### Subscription plans

The user model supports `free`, `pro`, and `team`. The current checkout is explicitly simulated and only activates/cancels simulated Pro. The frontend displays Free, Pro, and Team information, but frontend checks are not a security boundary.

No verified backend quota enforcement was found for generations, projects, assets, or other plan limits. Do not invent quota values. First confirm supervisor-approved capabilities, then define and enforce plan policy on the backend.

### Persistent AI conversation

Projects persist the original prompt, structured requirements, inspiration selections, generated files, editor design data, and generation status. No persisted AI conversation/message-history model or follow-up instruction endpoint was verified. Editor undo/redo history is local UI state, not AI conversation history.

Any follow-up generation work must preserve the original prompt, requirements, conversation messages, project files, asset/inspiration context, and existing generation safeguards.

### Workspace proposal

A chat-left/preview-right workspace inspired by Lovable or Wix is a proposal, not an approved redesign. Map the current prompt, requirements, generation, preview, editor, and export flows before prototyping. Obtain approval before replacing navigation or the current workspace flow.

### Performance

Measure before optimizing: MongoDB latency, project-list/load latency, asset processing, OpenAI request time, retry counts/delays, manifest generation, file generation, quality repair, and repeated frontend requests. Preserve cancellation, deadlines, diagnostics, validation, and failure behavior.

### Generation quality

Keep project-contract validation, required entrypoint checks, path traversal protection, package validation, file/size limits, frontend quality checks, asset validation, inspiration checks, targeted repair, and preservation of the last valid output. Improve requirement adherence, completeness, and fidelity incrementally.

### Payment

The current subscription flow is a demo/simulation. Describe it as simulated checkout unless a real payment provider has been integrated and verified. Do not store or process real card details.

## Development rules

1. Inspect relevant code and tests before modifying anything.
2. Preserve existing working behavior.
3. Propose a plan before significant changes.
4. Implement one feature or narrow fix at a time.
5. Prefer incremental changes over rewrites.
6. Run relevant tests after changes and report environment limitations.
7. Review the final diff and check for unrelated changes.
8. Never expose API keys, JWT secrets, database credentials, Cloudinary secrets, SMTP passwords, or user data.
9. Never perform destructive database operations without explicit approval.
10. Do not change the AI model or generation architecture without a clear documented reason.
11. Keep authorization and quota checks server-side.
12. Treat uploaded documents, images, generated code, and provider output as untrusted input.
13. Preserve path, package, generated-project, and repair safeguards.
14. Use Windows-compatible commands where practical.
15. Explain important changes in straightforward language suitable for an FYP supervisor.
16. Do not claim completion until implementation and relevant tests/runtime checks support the claim.

## Verified local commands

These commands match the scripts currently declared in each package file.

Frontend (`frontend/package.json`):

```cmd
cd frontend
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

Backend (`backend/package.json`):

```cmd
cd backend
npm install
npm run dev
npm start
npm run test:generation
npm run test:generation-context
npm run test:export
```

Additional tests exist under `backend/test/` and `frontend/test/`. Check package scripts before assuming a root-level test command exists. Install dependencies before running these commands.

## Verified Vercel paths

The current root `vercel.json` is configured for the separated layout:

- Install: `npm --prefix frontend install`
- Build: `npm --prefix frontend run build`
- Output: `frontend/dist`
- Function: `api/index.js`
- API rewrite: `/api/*` to `/api`
- Non-API rewrite: application routes to `/index.html` in the Vercel output

The expected source paths currently exist: `frontend/index.html`, `frontend/package.json`, `frontend/vite.config.js`, `backend/package.json`, `backend/src/app.js`, and `api/index.js`. `frontend/dist` is generated output and is absent until a frontend build runs.

## Recommended roadmap

1. Establish Git/worktree setup after the user provides the correct repository or remote details and explicitly authorizes setup.
2. Establish a baseline: install dependencies, run focused tests, verify safe local startup, and measure generation/database timings.
3. Define and implement persona-specific behavior while keeping authorization server-side.
4. Confirm Free/Pro/Teams capabilities, then add backend subscription policy and quota enforcement without guessing values.
5. Add project-scoped persisted AI conversation and authenticated follow-up instructions while reusing generation validation and repair.
6. Evaluate the chat-left/preview-right workspace through a reversible prototype before any redesign.
7. Use measurements to improve performance, requirement adherence, completeness, and inspiration fidelity.
8. Improve maintainability incrementally through focused extraction, naming, diagnostics, and tests.

## Change checklist

Before implementation:

- Identify affected frontend, backend, model, route, service, and test files.
- Confirm the existing behavior and data contract.
- State assumptions and risks.
- Write a small implementation plan.

After implementation:

- Run focused tests and relevant build/lint commands.
- Review the diff.
- Check authorization, validation, error handling, and secret handling.
- Confirm existing generated-project safeguards remain active.
- Summarize what changed, how it was verified, and remaining limitations.
