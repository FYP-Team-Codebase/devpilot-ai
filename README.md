# DevPilot

DevPilot is organized as a two-part application:

- `frontend/` contains the React + Vite client.
- `backend/` contains the Node.js + Express API.
- `api/` contains the Vercel serverless API entry point.

## Development

Install and run the frontend from `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

Run the backend in a second terminal:

```bash
cd backend
npm install
npm run dev
```

The frontend proxies `/api` requests to `http://localhost:5000` during development.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
