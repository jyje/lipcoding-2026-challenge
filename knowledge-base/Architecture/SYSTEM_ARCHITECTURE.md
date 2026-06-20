# 🏗️ System Architecture

LifeOS Insight Coach의 전체 시스템 아키텍처입니다.

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Client Layer                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (React + TypeScript)          │  │
│  │  - User Registration UI                         │  │
│  │  - Main Application Interface                   │  │
│  │  - localStorage for session persistence         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                    HTTP/REST API
                           │
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Fastify Backend (TypeScript)                   │  │
│  │  - API Routes                                   │  │
│  │  - Business Logic (Services)                    │  │
│  │  - User Management                              │  │
│  │  - CORS & Security Middleware                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                  Database Query
                           │
┌─────────────────────────────────────────────────────────┐
│                   Data Layer                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  SQLite Database                                │  │
│  │  - users table                                  │  │
│  │  - sessions table                               │  │
│  │  - insights table                               │  │
│  │  Location: backend/data/lifeos.db               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Component Interaction

### User Registration Flow
```
User Input (Frontend)
    ↓
POST /api/users/register
    ↓
Validate Nickname (UserService)
    ↓
Check Duplicate (Database)
    ↓
Create User (Database)
    ↓
Return User ID
    ↓
Save to localStorage (Frontend)
    ↓
Redirect to Main App
```

### User Lookup Flow
```
Page Load (Frontend)
    ↓
Check localStorage
    ↓
If User ID found:
    GET /api/users/:userId
        ↓
    Update lastAccessAt (Database)
        ↓
    Return User Data
        ↓
    Load Main App
```

## 📁 Directory Structure

```
lipcoding-2026-challenge/
├── backend/
│   ├── src/
│   │   ├── index.ts                 # Entry point
│   │   ├── database.ts              # SQLite connection & schema
│   │   ├── models/
│   │   │   └── user.ts              # User types & validation
│   │   ├── services/
│   │   │   └── userService.ts       # Business logic
│   │   └── routes/
│   │       └── user.ts              # API endpoints
│   ├── data/
│   │   └── lifeos.db                # SQLite database file
│   └── package.json
│
├── frontend/
│   ├── pages/
│   │   └── index.tsx                # Main UI
│   ├── public/
│   └── package.json
│
├── deployment/
│   ├── README.md
│   ├── AZURE_DEPLOYMENT.md
│   └── hooks/
│       ├── agent-registry.yaml
│       ├── pre-deploy.sh
│       └── health-check.sh
│
├── knowledge-base/                  # 👈 This folder
│   ├── Architecture/                # Design docs
│   ├── How-To-Guides/              # Step-by-step guides
│   ├── Best-Practices/             # Best practices
│   ├── Troubleshooting/            # Problem solving
│   ├── Tools/                      # Tool references
│   ├── Onboarding/                 # New developer guides
│   ├── Templates/                  # Document templates
│   └── FAQs/                       # Frequently asked questions
│
├── .github/
│   ├── instructions/
│   │   ├── frontend.instructions.md
│   │   ├── backend.instructions.md
│   │   └── ...
│   └── workflows/
│       └── deploy.yml
│
├── Dockerfile.backend
├── Dockerfile.frontend
└── .gitignore
```

## 🔌 API Endpoints

### User Management API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/users/register` | Register new user |
| GET | `/api/users/:userId` | Get user by ID |
| GET | `/api/users/check/:nickname` | Check if nickname exists |
| GET | `/api/users/lookup/:nickname` | Lookup user by nickname |

### Request/Response Examples

```typescript
// Register User
POST /api/users/register
{
  "nickname": "john_doe"
}

Response:
{
  "id": "a1b2c3d4e5f6g7h8",
  "nickname": "john_doe",
  "createdAt": "2026-06-20T13:00:00Z",
  "lastAccessAt": "2026-06-20T13:00:00Z"
}
```

```typescript
// Get User
GET /api/users/a1b2c3d4e5f6g7h8

Response:
{
  "id": "a1b2c3d4e5f6g7h8",
  "nickname": "john_doe",
  "createdAt": "2026-06-20T13:00:00Z",
  "lastAccessAt": "2026-06-20T13:05:00Z"
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  nickname TEXT UNIQUE NOT NULL,
  createdAt TEXT NOT NULL,
  lastAccessAt TEXT NOT NULL
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expiresAt TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### Insights Table
```sql
CREATE TABLE insights (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

## 🔐 Security Considerations

### Authentication
- Currently: nickname-based (MVP)
- Future: JWT token-based
- Session: localStorage on client side

### Data Validation
- Nickname: 2-50 characters
- Input sanitization: Zod validation
- SQL injection prevention: Parameterized queries

### CORS
- Configured for frontend domain
- Credentials allowed
- Specific methods whitelisted

## 📊 Data Flow

### Startup Sequence
```
1. Backend starts (Fastify)
2. Database initialized
   - Creates data/ directory if needed
   - Opens/creates lifeos.db
   - Runs schema migrations
3. Routes registered
4. Server listens on port 3001
5. Frontend loads (Next.js)
6. localStorage checked for user ID
7. If user exists: fetch from API
8. Main app loads
```

### Request Lifecycle
```
1. Frontend makes HTTP request
2. CORS middleware validates
3. Route handler processes
4. Service executes business logic
5. Database query executed
6. Response formatted
7. Sent back to frontend
```

## 🚀 Deployment Architecture

### Local Development
```
npm run dev
├── Backend: Fastify on :3001
├── Frontend: Next.js on :3000
└── Database: SQLite local file
```

### Docker Containers
```
Docker Image (Backend)
├── Node.js runtime
├── TypeScript compiled code
├── SQLite binary
└── Listens on :3001

Docker Image (Frontend)
├── Node.js runtime
├── Next.js built app
└── Listens on :3000
```

### Azure Container Apps
```
Container Apps Instance
├── Backend container
├── Frontend container (optional)
└── Persistent storage for database
```

## 🔄 Agent Integration Points

### Pre-deployment Hook
- Validates Node.js version
- Installs dependencies
- Runs TypeScript checks
- Builds both frontend & backend

### Health Check Hook
- Tests backend API endpoints
- Verifies database connectivity
- Checks frontend accessibility
- Retries on transient failures

### Registry Hook
- Defines 5 event-driven agents
- Routes file changes to appropriate agent
- Enables multi-agent orchestration

## 📈 Performance Considerations

### Frontend
- Static file caching
- localStorage for user session
- Lazy loading components
- Code splitting

### Backend
- Connection pooling (planned)
- Query optimization
- Response compression
- Rate limiting (planned)

### Database
- Indexed lookups on userId, nickname
- Efficient schema design
- Auto-cleanup of expired sessions

---

**마지막 업데이트**: 2026-06-20  
**다음**: [Tech Stack](./TECH_STACK.md) 읽기
