# Frontend Agent Instructions

## Track Ownership

**Owner**: Frontend (FE) Agent
**Directory**: `frontend/`
**Branch prefix**: `feat/fe-*`

## Responsibilities

- React component development
- Next.js page implementation
- TypeScript type definitions for UI
- Styling and layout (CSS/Tailwind)
- Frontend build configuration
- Component tests and E2E tests

## Design Guidelines

See `frontend-design.instructions.md` for comprehensive UI/UX design principles and visual design guidance.

### Quick Design Reference

1. **Visual Identity**: Make distinctive, intentional choices
2. **Typography**: Pair display and body faces deliberately
3. **Structure**: Make layout encode information, not just decoration
4. **Motion**: Use animation purposefully, not excessively
5. **Content**: Write copy as design material

### Help / Explanatory Text Pattern

Keep the visible UI concise. Do not render long instructional sentences inline.
Instead, surface a short label (with a dotted underline) and/or a small "?" button,
and reveal the detailed explanation in a tooltip on hover/focus.

- Reuse the shared `HelpHint` component (see `frontend/pages/index.tsx`) for this.
- The tooltip must be keyboard-accessible (`:focus-within`) and use `aria-label`/`role="tooltip"`.
- Prefer one concise surface line; move the "how it works" detail into the hint.


## Frontend Stack

- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Package Manager**: npm (workspaces)
- **Build**: `npm run build --workspace=frontend`
- **Dev**: `npm run dev:fe`

## Collaboration Rules

- **Read-only access**: `backend/`, `infra/`, CI/CD configuration
- **Full access**: `frontend/`, `shared/` (with approval)
- **Shared contracts**: Type definitions in `shared/schema.ts`

## Green Gate (Before Merging)

```bash
npm run typecheck --workspace=frontend
npm run build --workspace=frontend
npm test --workspace=frontend -- --run
```

All must pass before merging to main.
