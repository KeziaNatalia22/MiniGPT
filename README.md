# Mini AI — Gemini Proxy (Full-stack)

This repository contains a minimal full-stack example: a React + Vite frontend and an Express + TypeScript backend that proxies prompts to the Gemini (Generative Language) API.

Structure

- `backend/` — Express + TypeScript server that stores GEMINI_API_KEY in `.env` and exposes `POST /api/ai`.
- `frontend/` — Vite + React + TypeScript app that sends prompts to `/api/ai` and displays responses.

Backend (summary)

- Endpoint: `POST /api/ai` — body: `{ text: string }`.
- Uses `GEMINI_API_KEY` (set in `.env`) to call the Gemini Generative Language API.

Files added (important)

Backend:
- `backend/package.json`
- `backend/tsconfig.json`
- `backend/src/index.ts`
- `backend/src/routes/ai.ts`
- `backend/src/services/geminiService.ts`
- `backend/.env.example`

Frontend:
- `frontend/package.json`
- `frontend/tsconfig.json`
- `frontend/vite.config.ts`
- `frontend/index.html`
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/api/aiClient.ts`
- `frontend/src/styles.css`

Environment variables

- Copy `backend/.env.example` -> `backend/.env` and set `GEMINI_API_KEY` to your Gemini API key.
- Optionally set `GEMINI_MODEL` to another model if desired.

Install & Run (Windows PowerShell)

1) Backend

```powershell
cd "e:/File Kezia/latihan/mini AI/backend"
npm install
# create .env using the example, then:
npm run dev
```

2) Frontend

```powershell
cd "e:/File Kezia/latihan/mini AI/frontend"
npm install
npm run dev
```

Notes

- The backend uses a simple REST POST call to the Generative Language API using an API key param. Update `GEMINI_API_BASE` or the service code if your organization requires OAuth or a different client library.
- Streaming is not implemented in this example; the backend returns full text responses.

Run both frontend & backend together

You can run both dev servers (frontend Vite and backend Express) from the project root using `concurrently`.

1) Install dependencies for both projects and the root helper:

```powershell
cd "e:/File Kezia/latihan/mini AI"
npm install
npm run install:all
```

2) Start frontend and backend together:

```powershell
cd "e:/File Kezia/latihan/mini AI"
npm run dev
```

This runs `backend` and `frontend` `dev` scripts in parallel (root `package.json` uses `concurrently`).

Security

- Keep `GEMINI_API_KEY` in the backend `.env`. Do not commit your `.env` to version control.

If you want, I can:
- Add streaming via Server-Sent Events (SSE) or WebSockets.
- Replace the REST call with the official Google Node SDK (if you prefer that client).

