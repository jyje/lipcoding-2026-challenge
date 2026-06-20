# ThriveOps

ThriveOps is an AI-powered daily action coach that connects work, career, and technical notes into one executable workspace.

## What it does

- Capture work items, career items, and technical notes in one place
- Analyze incoming input and suggest next actions with AI
- Support a bottom dialogue area for task registration, URL pasting, file drop, and conversational commands
- Keep frontend and backend in a single monorepo for easy local development

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript
- Backend: Fastify, TypeScript, SQLite, Copilot Extensions SDK
- Tooling: npm workspaces, Docker, Azure deployment assets

## Repository Layout

- `frontend/` - Next.js UI
- `backend/` - API server and analysis logic
- `infra/` - Azure Bicep infrastructure
- `deployment/` - deployment guides and operational docs
- `plan/` - product, architecture, demo, and delivery plans
- `scripts/` - helper scripts

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

This starts both apps:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8010`

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Environment Variables

The app expects environment variables for the backend and frontend auth flow.

- `COPILOT_API_KEY` - AI provider key for backend analysis
- `COPILOT_BEARER_TOKEN` - bearer token used by the frontend to call the backend
- `NEXT_PUBLIC_API_URL` - backend base URL for the frontend
- `NEXT_PUBLIC_API_BEARER_TOKEN` - default bearer token shown in the UI

## Deployment

Deployment guidance lives in [deployment/README.md](deployment/README.md). The main infrastructure entrypoint is [infra/main.bicep](infra/main.bicep).

## Documentation

- [plan/README.md](plan/README.md)
- [deployment/README.md](deployment/README.md)
- [backend/README.md](backend/README.md)
