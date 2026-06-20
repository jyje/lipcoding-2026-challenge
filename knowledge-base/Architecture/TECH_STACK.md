# 🛠️ Tech Stack

LifeOS Insight Coach에서 사용하는 기술 스택 및 선택 이유입니다.

## 💻 Backend Stack

### Runtime & Framework
| Technology | Version | Purpose | Why? |
|------------|---------|---------|------|
| Node.js | 18+ | Runtime environment | Fast, event-driven, JavaScript ecosystem |
| Fastify | 4.x | Web framework | High performance, low overhead, TypeScript support |
| TypeScript | 5.x | Language | Type safety, better IDE support, fewer runtime errors |

### Database & ORM
| Technology | Version | Purpose | Why? |
|------------|---------|---------|------|
| SQLite | 3.x | Database | File-based, zero-config, perfect for MVP, portable |
| sqlite3 | 5.x+ | Node.js adapter | Native binding, high performance |

### Validation & Security
| Technology | Version | Purpose | Why? |
|------------|---------|---------|------|
| Zod | 3.x | Schema validation | Runtime validation, TypeScript-first |
| @fastify/cors | 9.x | CORS handling | Secure cross-origin requests |

### Build & Development
| Technology | Version | Purpose | Why? |
|------------|---------|---------|------|
| TypeScript Compiler | 5.x | Compilation | Type checking, ES module transpilation |
| npm | 9.x+ | Package manager | Standard, widely used |

## 🎨 Frontend Stack

### Framework & UI
| Technology | Version | Purpose | Why? |
|------------|---------|---------|------|
| Next.js | 14.x | Framework | SSR/SSG, built-in optimization, great DX |
| React | 18.x | UI library | Component-based, large ecosystem, well-documented |
| TypeScript | 5.x | Language | Type safety for React components |

### State & Storage
| Technology | Version | Purpose | Why? |
|------------|---------|---------|------|
| localStorage | Native | Client-side persistence | No backend session needed, MVP compatible |

### Build & Development
| Technology | Version | Purpose | Why? |
|------------|---------|---------|------|
| npm | 9.x+ | Package manager | Standard for Node.js projects |

## 🐳 Deployment Stack

### Containerization
| Technology | Version | Purpose | Why? |
|------------|---------|---------|------|
| Docker | 24.x+ | Containerization | Consistent environments, easy deployment |

### Cloud Platform
| Technology | Version | Purpose | Why? |
|------------|---------|---------|------|
| Azure Container Apps | Latest | Deployment | Serverless containers, easy scaling |
| Azure SQL Database | - | (Future) | For production database |

### CI/CD
| Technology | Version | Purpose | Why? |
|------------|---------|---------|------|
| GitHub Actions | Native | Automation | Integrated with GitHub, free for public repos |

## 🤖 Agent & Automation Stack

### Agent Framework
| Technology | Purpose | Why? |
|-----------|---------|------|
| GitHub Copilot CLI | Task automation | Built-in integration with development workflow |
| Agent Hooks | Event-driven execution | Trigger actions on file changes, deployments |

### Skills & Extensions
| Technology | Purpose |
|-----------|---------|
| Custom Skills | Extend agent capabilities |
| git-commit-helper | Enforce commit format |
| frontend-design | Frontend guidance |
| backend | Backend patterns |

## 📊 Tech Stack Architecture

```
┌─────────────────────────────────────┐
│         Frontend (Next.js)          │
│     React + TypeScript + CSS        │
│     localStorage for persistence    │
└──────────────┬──────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────┐
│       Backend (Fastify)             │
│   TypeScript + Zod Validation       │
└──────────────┬──────────────────────┘
               │ SQL
┌──────────────▼──────────────────────┐
│     Database (SQLite)               │
│   File-based, portable              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      Deployment (Docker)            │
│  Container Apps on Azure            │
│  GitHub Actions for CI/CD           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│     Automation (Agents)             │
│  Copilot CLI + Custom Skills        │
│  Event-driven hooks                 │
└─────────────────────────────────────┘
```

## 📦 Key Dependencies

### Backend (package.json)
```json
{
  "dependencies": {
    "fastify": "^4.24.0",
    "sqlite3": "^5.1.6",
    "@fastify/cors": "^9.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "@types/node": "^20.x",
    "tsx": "^3.14.0"
  }
}
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "@types/react": "^18.2.0"
  }
}
```

## 🎯 Technology Decisions

### Why Fastify?
- ✅ High performance (benchmark tested)
- ✅ Native TypeScript support
- ✅ Lightweight, extensible
- ✅ Great ecosystem

### Why SQLite?
- ✅ Zero-config setup
- ✅ File-based, portable
- ✅ Perfect for MVP/small scale
- ✅ Easy to upgrade to PostgreSQL later

### Why Next.js?
- ✅ Full-stack React framework
- ✅ Built-in optimization (images, code splitting)
- ✅ API routes integration (future)
- ✅ Great developer experience

### Why TypeScript?
- ✅ Type safety across stack
- ✅ Early error detection
- ✅ Better refactoring support
- ✅ Self-documenting code

### Why localStorage?
- ✅ MVP speed (no server session needed)
- ✅ Works offline
- ✅ No session management complexity
- ✅ Easy user experience

## 🔄 Data Flow by Technology

```
User Input (React)
    ↓
API Call (fetch)
    ↓
Fastify Route Handler (TypeScript)
    ↓
Zod Validation
    ↓
Service Layer (TypeScript)
    ↓
SQLite Query (SQL)
    ↓
Database Response
    ↓
Response Formatter
    ↓
JSON Response (Fastify)
    ↓
State Update (React)
    ↓
UI Render (React)
```

## 📈 Scalability Path

### Current (MVP)
```
Single Node.js process
SQLite file database
No caching layer
Single server instance
```

### Phase 2 (Growth)
```
Horizontal scaling with load balancer
Redis for caching
PostgreSQL for database
Separate frontend CDN
```

### Phase 3 (Enterprise)
```
Kubernetes orchestration
Distributed tracing
Advanced monitoring
Database replication
```

## 🔐 Security Stack

| Layer | Technology |
|-------|-----------|
| Transport | HTTPS (in Azure) |
| CORS | @fastify/cors |
| Validation | Zod schemas |
| Database | Parameterized queries |
| Sessions | localStorage (future: JWT) |

## 🧪 Testing Stack (Optional)

For future test expansion:
- **Unit Testing**: Jest or Vitest
- **Integration Testing**: Supertest (Fastify)
- **E2E Testing**: Playwright or Cypress
- **Load Testing**: Artillery or k6

## 🔗 Integration Points

### Agent Integration
- Reads from: `knowledge-base/`, `.github/instructions/`
- Respects: git-commit-helper format
- Monitors: File changes, deployment status

### Continuous Integration
- GitHub Actions workflows
- Pre-deploy validation hooks
- Health check post-deploy

### Monitoring (Future)
- Application Insights (Azure)
- Custom metrics
- Error tracking

---

**마지막 업데이트**: 2026-06-20  
**다음**: [Design Principles](./DESIGN_PRINCIPLES.md) 읽기
