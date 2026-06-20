# Backend Agent Instructions

## Track Ownership

**Owner**: Backend (BE) Agent
**Directory**: `backend/`
**Branch prefix**: `feat/be-*`

## Responsibilities

- Fastify API route implementation
- Business logic and service layer
- Database operations (SQLite)
- Copilot Extensions SDK integration
- API request validation and error handling
- Backend build configuration
- Unit and integration tests

## Backend Stack

- **Framework**: Fastify
- **Language**: TypeScript
- **Runtime**: Node.js 18+
- **Package Manager**: npm (workspaces)
- **Build**: `npm run build --workspace=backend`
- **Dev**: `npm run dev:be`
- **AI SDK**: `@copilot-extensions/preview-sdk`

## API Contract

See `../../../plan/02-architecture.md` for API specifications:
- `POST /api/analyze` - Brain dump analysis
- `GET /api/actions` - List actions
- `PATCH /api/actions/:id` - Update action (toggle done)
- `POST /api/replan` - Replan with remaining time
- `GET /health` - Health check

## Collaboration Rules

- **Read-only access**: `frontend/`, `infra/`, CI/CD configuration
- **Full access**: `backend/`, `shared/` (with approval)
- **Shared contracts**: Type definitions in `shared/schema.ts`
- Coordinate with FE on type changes

## Green Gate (Before Merging)

```bash
npm run typecheck --workspace=backend
npm run build --workspace=backend
npm test --workspace=backend -- --run
```

All must pass before merging to main.

## Error Handling

- Return structured errors with `code` and `message`
- Use Zod for request validation
- Implement retry logic for SDK calls (1 retry + fallback)
- Log all errors with requestId and latencyMs
