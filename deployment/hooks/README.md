# Agent Hooks

Copilot 에이전트가 특정 이벤트에 자동으로 응답하고 작업을 실행하도록 하는 훅(Hooks) 설정입니다.

## 🎯 개요

에이전트 훅은 다음과 같은 상황에서 자동으로 실행됩니다:

- **파일 변경 감지** → 해당 에이전트 활성화
- **브랜치 푸시** → 배포 파이프라인 시작
- **PR 생성** → 코드 리뷰 에이전트 활성화

## 📁 파일 구조

```
deployment/hooks/
├── README.md              (This file)
├── pre-deploy.sh          (배포 전 검증)
├── health-check.sh        (배포 후 헬스 체크)
└── agent-registry.yaml    (에이전트 훅 설정)
```

## 🔧 훅 설명

### 1. pre-deploy.sh (배포 전 훅)

**실행 시점**: 배포 시작 전

**작업**:
- ✓ Node.js 버전 확인
- ✓ 의존성 설치 (`npm ci`)
- ✓ TypeScript 타입 체크
- ✓ 빌드 테스트 (Backend & Frontend)
- ✓ 환경 변수 검증
- ✓ Git 상태 확인

**실패 조건**:
- 빌드 실패
- 타입 에러

### 2. health-check.sh (배포 후 훅)

**실행 시점**: Azure 배포 완료 후

**작업**:
- ✓ Backend 헬스 체크 (`/health` 엔드포인트)
- ✓ Frontend 접근성 검증
- ✓ API 엔드포인트 테스트 (`/api/analyze`)
- ✓ CORS 헤더 확인

**재시도**:
- 최대 30회 시도
- 10초 간격으로 재시도

### 3. agent-registry.yaml (에이전트 구성)

**정의된 훅**:
- `fe-on-frontend-change` - Frontend 파일 변경 시
- `be-on-backend-change` - Backend 파일 변경 시
- `deploy-on-main-push` - Main 브랜치 푸시 시
- `review-on-pr` - PR 생성 시
- `integrate-on-contract-change` - Shared 파일 변경 시

## 🚀 사용 방법

### 자동 실행

GitHub Actions workflow (`.github/workflows/deploy.yml`)에서 자동으로 실행됩니다:

```yaml
- name: Run Pre-deployment Hook
  run: bash deployment/hooks/pre-deploy.sh

- name: Run Post-deployment Hook
  run: bash deployment/hooks/health-check.sh
```

### 수동 실행

로컬 환경에서 수동으로 실행:

```bash
# 배포 전 검증
bash deployment/hooks/pre-deploy.sh

# 배포 후 헬스 체크
bash deployment/hooks/health-check.sh
```

## 🤖 Agent Hook Registry

### 활성 에이전트

| 에이전트 | 트리거 | 작업 |
|---------|------|------|
| **Frontend** | `frontend/**` 파일 변경 | 빌드 및 타입 체크 |
| **Backend** | `backend/**` 파일 변경 | API 검증 및 빌드 |
| **Deployment** | `main` 브랜치 푸시 | 자동 배포 |
| **Code Review** | PR 생성 | 코드 리뷰 |
| **Integration** | `shared/**` 파일 변경 | 타입 동기화 |

### 훅 흐름

```
파일 변경 감지
    ↓
agent-registry.yaml 확인
    ↓
조건 매칭 (path, event, branch)
    ↓
해당 에이전트 활성화
    ↓
hooks/ 스크립트 실행
    ↓
결과 리포팅
```

## 🔍 모니터링

### GitHub Actions에서 확인

1. Repository → Actions 탭
2. "Deploy to Azure" 워크플로우 선택
3. 각 단계(step)별 실행 로그 확인

### 로그 보기

```bash
# 최근 배포 로그
git log --oneline | grep -i deploy

# GitHub Actions URL
https://github.com/jyje/lipcoding-2026-challenge/actions
```

## ⚠️ 트러블슈팅

### Pre-deploy hook 실패

**문제**: Build failed
```bash
❌ Backend build failed
```

**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build --workspace=backend
npm run build --workspace=frontend

# 의존성 확인
npm install
```

### Health-check hook 실패

**문제**: Backend health check timeout
```bash
❌ Backend health check failed after 30 attempts
```

**해결**:
1. Azure Container Apps 배포 상태 확인
2. 환경 변수 설정 확인
3. 컨테이너 로그 확인:
   ```bash
   az containerapp logs show --name lifeos-backend --resource-group lifeos-rg
   ```

### 특정 에이전트가 활성화되지 않음

**확인**:
1. `agent-registry.yaml`에서 이벤트 조건 확인
2. 파일 경로가 정확한지 확인
3. 브랜치 이름이 일치하는지 확인

## 📝 설정 커스터마이징

### 새 훅 추가

`agent-registry.yaml`에 추가:

```yaml
- id: custom-hook
  name: "Custom Agent Hook"
  event: file-change
  path: "custom/**"
  agent: custom-agent
  action: run-custom-action
  commands:
    - npm run custom-script
```

### 재시도 정책 변경

`health-check.sh`에서 조정:

```bash
MAX_RETRIES=60    # 재시도 횟수 증가
RETRY_DELAY=5     # 재시도 간격 감소
```

## 🔗 관련 파일

- **CI/CD Pipeline**: `.github/workflows/deploy.yml`
- **Agent Rules**: `AGENTS.md`
- **Deployment Guide**: `deployment/README.md`

## 📚 더 알아보기

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Copilot Extensions](https://docs.github.com/copilot/using-github-copilot/copilot-extensions)
- [Azure Container Apps](https://learn.microsoft.com/azure/container-apps/)

---

**Status**: ✅ Agent hooks configured and integrated

Generated: 2026-06-20
