# ThriveOps Backend (Node.js + Fastify + Copilot SDK)

## Quick Start

### Prerequisites
- Node.js 20+
- COPILOT_API_KEY (from GitHub Copilot Extensions dashboard)

### Setup

```bash
# Install dependencies
cd backend
npm install

# Create .env file (copy from .env.example)
cp ../.env.example ../.env

# Add your COPILOT_API_KEY to .env
echo "COPILOT_API_KEY=your_key_here" >> ../.env
```

### Development

```bash
cd backend
npm run dev
```

Server will start on `http://localhost:8010`

### Production Build

```bash
cd backend
npm run build
npm start
```

## API Endpoints

### Brain Dump Analysis
```
POST /api/v1/analyze
Authorization: Bearer {token}
Content-Type: application/json

{
  "brain_dump": "unstructured thoughts and tasks",
  "time_budget_min": 90
}
```

Response:
```json
{
  "summary": "brief analysis",
  "top_actions": [...],
  "risks": [...],
  "time_budget_min": 90,
  "tag": {
    "space": "work|career|tech",
    "career_signals": [...],
    "keywords": [...],
    "confidence": 0.0-1.0
  }
}
```

### Goals Overview
```
GET /api/v1/goals/overview
```

### Agent Chat
```
POST /api/v1/agent/chat
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "user message",
  "tasks": [...]
}
```

## Architecture

- **Framework**: Fastify (TypeScript)
- **AI Integration**: Copilot Extensions SDK
- **Database**: SQLite (backend/data/lifeos.db)
- **Authentication**: Bearer token (frontend provides)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| COPILOT_API_KEY | Yes | Copilot API key for LLM |
| PORT | No | Server port (default: 8010) |
| NODE_ENV | No | Environment (default: production) |

## Testing

```bash
cd backend
npm test
```

## Troubleshooting

### "COPILOT_API_KEY not found"
- Ensure .env file exists in project root
- Add valid COPILOT_API_KEY to .env

### "Cannot find module '@copilot-extensions/preview-sdk'"
- Run `npm install` to install dependencies
- Check node_modules is not in .gitignore

