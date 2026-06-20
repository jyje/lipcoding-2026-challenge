# 마이크로서비스 아키텍처 설계

## 현재 구조 (단일 서비스)

```
Fastify Backend (8010)
├── /api/v1/analyze       (뇌덤프 분석)
├── /api/v1/agent/chat    (에이전트 채팅)
├── /api/v1/goals/overview (목표 조회)
└── /api/users/*          (사용자 관리)
```

## 마이크로서비스 설계 (권장)

```
API Gateway (8010)
├── Auth Service (8011)
│   └── Bearer token validation
│   └── User session management
│
├── Analysis Service (8012) — Copilot SDK
│   ├── /analyze          (뇌덤프 분석)
│   └── /replan           (재계획)
│
├── Agent Service (8013) — Copilot Agent
│   └── /chat             (에이전트 채팅)
│
├── Goal Service (8014)
│   └── /overview         (목표 조회)
│   └── /update           (목표 업데이트)
│
└── User Service (8015)
    └── /register         (사용자 등록)
    └── /profile          (프로필 조회)

External Services:
├── Azure Blob Storage    (Mock data, config files)
├── Azure Key Vault       (API keys, secrets)
└── Azure CosmosDB        (Session data)
```

## 마이크로서비스 분리 계획

### 1단계: API Gateway 패턴
- 단일 진입점 (포트 8010)
- 각 서비스로 요청 라우팅
- 공통 인증 처리

### 2단계: 서비스 분리
- **Auth Service**: JWT/Bearer 토큰 검증
- **Analysis Service**: Copilot SDK 통합 (뇌덤프 분석)
- **Agent Service**: 에이전트 채팅 로직
- **Goal Service**: 목표 관리
- **User Service**: 사용자 데이터

### 3단계: 클라우드 리소스 통합
- **Azure Blob Storage**: Mock data, configuration
- **Azure Key Vault**: API keys, secrets
- **Azure CosmosDB**: 세션 데이터
- **Azure Service Bus**: 서비스 간 메시지 (선택사항)

## 현재 상태 분석

### ✅ 이미 외부화된 설정
```typescript
// backend/src/database.ts
const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'backend/data/thriveops.db');

// backend/src/index.ts
const port = parseInt(process.env.PORT || '8010', 10);

// backend/src/services/analyzeService.ts
token: process.env.COPILOT_API_KEY || ''

// frontend/pages/index.tsx
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8010';
```

### ⚠️ 개선 필요 부분
1. 데이터베이스 경로: Azure Blob Storage 또는 Azure SQL로 이동 고려
2. 에러 메시지: 하드코딩된 한글 문자열 → 외부 리소스에서 로드
3. 서비스 포트: 동적 할당 또는 설정 파일

## Azure 리소스 통합 예시

### Blob Storage에서 설정 로드
```typescript
import { BlobServiceClient } from "@azure/storage-blob";

async function loadConfigFromBlob(containerName: string, blobName: string) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING || ''
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  const downloadBlockBlobResponse = await blockBlobClient.download(0);
  const downloaded = await streamToString(downloadBlockBlobResponse.readableStreamBody);
  return JSON.parse(downloaded);
}
```

### Key Vault에서 시크릿 로드
```typescript
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();
const client = new SecretClient(
  `https://${process.env.KEYVAULT_NAME}.vault.azure.net/`,
  credential
);

const copilotKey = await client.getSecret("COPILOT-API-KEY");
```

## 단계별 마이그레이션 로드맵

### Phase 1: 설정 외부화 (1주)
- [ ] .env.local 파일 작성 (develop, staging, production)
- [ ] Azure Key Vault 통합
- [ ] 환경별 설정 분리

### Phase 2: 마이크로서비스 준비 (2주)
- [ ] API Gateway 패턴 구현 (express.js 또는 traefik)
- [ ] 서비스 간 통신 (gRPC 또는 REST)
- [ ] 서비스 디스커버리 설정

### Phase 3: 서비스 분리 (3주)
- [ ] Auth Service 분리
- [ ] Analysis Service 분리
- [ ] Agent Service 분리
- [ ] Goal Service 분리
- [ ] User Service 분리

### Phase 4: 클라우드 리소스 (2주)
- [ ] Blob Storage 연동
- [ ] CosmosDB 마이그레이션
- [ ] Service Bus 메시지 큐 구성

## 현재 권장사항

**단기 (MVP)**: 단일 서비스 유지
- 현재 Fastify 백엔드 유지
- Azure 환경변수/Key Vault로 설정 관리
- Blob Storage에서 Mock data 로드

**장기**: 마이크로서비스로 진화
- 각 도메인별 독립 서비스
- API Gateway로 통합
- 스케일링 및 장애 격리 개선
