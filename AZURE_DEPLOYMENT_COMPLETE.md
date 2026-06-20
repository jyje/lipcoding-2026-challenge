# 🚀 Azure 배포 완료

## ✅ 배포 상태

배포가 **성공적으로 완료**되었습니다!

## 📱 배포된 서비스

### 백엔드 API
- **URL**: https://thriveops-backend.nicecoast-81d67825.eastus.azurecontainerapps.io
- **포트**: 8010 (Fastify)
- **이미지**: thriveopsregistry.azurecr.io/thriveops-backend:latest
- **사양**: 0.5 CPU, 1.0 GB RAM
- **확장**: 1~3 replicas (자동 스케일링)
- **상태**: ✅ Running

### 프론트엔드 웹앱
- **URL**: https://thriveops-frontend.nicecoast-81d67825.eastus.azurecontainerapps.io
- **포트**: 3000 (Next.js)
- **이미지**: thriveopsregistry.azurecr.io/thriveops-frontend:latest
- **사양**: 0.5 CPU, 1.0 GB RAM
- **확장**: 1~3 replicas (자동 스케일링)
- **상태**: ✅ Running

## 🔧 배포 설정

### Azure 리소스
- **리소스 그룹**: thriveops-rg (eastus)
- **Container Registry**: thriveopsregistry.azurecr.io
- **Container Apps 환경**: thriveops-env
- **Managed Environment**: Consumption workload profile (서버리스)

### 이미지 아키텍처
- **컴파일**: linux/amd64 (Azure Container Apps 요구사항)
- **기반 이미지**: Node.js 20-Alpine (경량)
- **최적화**: Multi-stage build (프로덕션용)

## 🛠️ 기술 스택

### 백엔드
- **프레임워크**: Fastify (Node.js)
- **언어**: TypeScript
- **AI 통합**: Copilot Extensions SDK
- **API 엔드포인트**: /api/v1/*
- **인증**: Bearer token (Authorization 헤더)

### 프론트엔드
- **프레임워크**: Next.js 16
- **언어**: TypeScript
- **배포 모드**: Standalone production build
- **포트**: 3000

## 🔍 API 엔드포인트

### 뇌 덤프 분석
```bash
POST /api/v1/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "brain_dump": "사용자의 생각과 목표 입력",
  "time_budget_min": 480
}
```

### 목표 개요
```bash
GET /api/v1/goals/overview
```

### 에이전트 채팅
```bash
POST /api/v1/agent/chat
Authorization: Bearer <token>
```

## 📊 배포 메트릭

| 메트릭 | 백엔드 | 프론트엔드 |
|--------|--------|-----------|
| **이미지 크기** | ~200MB | ~250MB |
| **시작 시간** | ~2초 | ~2초 |
| **메모리** | 1.0 GB | 1.0 GB |
| **CPU** | 0.5 | 0.5 |
| **자동 스케일링** | 1-3 | 1-3 |

## 🌐 도메인

- **Azure Container Apps 도메인**: .azurecontainerapps.io
- **커스텀 도메인**: 추가 가능 (Azure Portal에서 설정)
- **HTTPS**: 자동 활성화
- **CORS**: 프론트엔드-백엔드 간 통신 설정 필요

## 🔐 보안

### 컨테이너 레지스트리
- **접근 제어**: Azure AD 기반
- **인증**: 관리자 계정 + 암호
- **이미지 스캔**: Azure Defender for container registries

### 네트워크
- **진입점**: External ingress (인터넷 접근)
- **포트**: 8010 (백), 3000 (프론트)
- **프로토콜**: HTTP (내부), HTTPS (공개)

## 📝 로그 및 모니터링

### 로그 확인
```bash
# 백엔드 로그
az containerapp logs show --name thriveops-backend --resource-group thriveops-rg

# 프론트엔드 로그
az containerapp logs show --name thriveops-frontend --resource-group thriveops-rg
```

### 모니터링
- Azure Container Apps 메트릭 (CPU, 메모리, 요청)
- Application Insights (선택 사항)

## 🚀 다음 단계

1. **커스텀 도메인 설정** (선택)
   - Azure Portal에서 Custom domain 추가
   - DNS 레코드 설정

2. **환경 변수 설정**
   - COPILOT_API_KEY 추가
   - 데이터베이스 연결 문자열

3. **자동 배포 설정** (선택)
   - GitHub Actions와 Azure 통합
   - 푸시 시 자동 빌드 및 배포

4. **성능 최적화**
   - 캐싱 전략 구현
   - CDN 연결 (Azure Front Door)

## 📞 트러블슈팅

### 앱이 시작되지 않는 경우
```bash
az containerapp show --name thriveops-backend --resource-group thriveops-rg --query "properties.provisioningState"
```

### 성능 문제
- 로그에서 에러 확인
- 메모리/CPU 사용률 모니터링
- 스케일링 정책 검토

### 이미지 업데이트
```bash
# 새 이미지 빌드 및 푸시
docker build --platform linux/amd64 -f Dockerfile -t thriveopsregistry.azurecr.io/thriveops-backend:latest .
docker push thriveopsregistry.azurecr.io/thriveops-backend:latest

# Container App 업데이트
az containerapp update --name thriveops-backend --resource-group thriveops-rg --image thriveopsregistry.azurecr.io/thriveops-backend:latest
```

---

**배포 일시**: 2026-06-20 16:27 UTC
**상태**: ✅ 운영 중
**마지막 업데이트**: 2026-06-20
