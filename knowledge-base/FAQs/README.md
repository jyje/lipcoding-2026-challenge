# ❓ FAQs

자주 묻는 질문과 답변입니다.

## 🚀 시작하기

### Q: 프로젝트는 뭐예요?
**A**: LifeOS Insight Coach는 사용자 개인화 기능이 있는 AI 지원 애플리케이션입니다.
- 사용자 닉네임 기반 등록
- SQLite 데이터베이스 저장
- 에이전트 기반 자동화

### Q: 개발을 시작하려면?
**A**: [Onboarding Guide](../Onboarding/WELCOME.md)를 따르세요.
1. 저장소 클론
2. 의존성 설치: `npm install`
3. 환경 설정: `.env` 파일 생성
4. 백엔드 실행: `npm run dev`
5. 프론트엔드 실행: `cd frontend && npm run dev`

### Q: 어떤 기술을 사용하나요?
**A**: 
- **백엔드**: Node.js + Fastify + TypeScript + SQLite
- **프론트엔드**: Next.js + React + TypeScript
- **배포**: Docker + Azure Container Apps + GitHub Actions

## 🔧 개발

### Q: 로컬에서 데이터베이스는?
**A**: SQLite 파일 기반입니다.
- 위치: `backend/data/lifeos.db`
- 자동 생성됨 (첫 실행 시)
- 초기화: 파일 삭제 후 재시작

### Q: 환경 변수는 어디에?
**A**: 루트에 `.env` 파일 생성:
```
BACKEND_PORT=3001
FRONTEND_PORT=3000
DATABASE_URL=backend/data/lifeos.db
```

### Q: 테스트는 어떻게 실행?
**A**: 
```bash
npm test                 # 모든 테스트
npm test -- --watch     # 감시 모드
npm run test:cov        # 커버리지 보고
```

### Q: 빌드는?
**A**:
```bash
npm run build           # 백엔드 & 프론트엔드
npm run build:backend   # 백엔드만
npm run build:frontend  # 프론트엔드만
```

## 🚢 배포

### Q: 로컬에서 Docker로 테스트?
**A**:
```bash
docker build -f Dockerfile.backend -t lifeos-backend .
docker run -p 3001:3001 lifeos-backend
```

### Q: Azure에 배포하려면?
**A**: [Azure Deployment Guide](../deployment/AZURE_DEPLOYMENT.md)를 참고하세요.

### Q: CI/CD는?
**A**: GitHub Actions 자동 실행:
- 푸시 → 테스트 실행 → 빌드 → 배포
- 워크플로우: `.github/workflows/deploy.yml`

## 🤖 에이전트

### Q: 에이전트 훅은?
**A**: 자동 작업 트리거:
- 파일 변경 감지
- 배포 전/후 검증
- 헬스 체크 실행

### Q: 스킬(Skills)은?
**A**: 에이전트 확장 기능:
- `.agents/skills/` 폴더에 정의
- 예: `git-commit-helper`, `frontend-design`
- 필요시 커스텀 스킬 추가 가능

### Q: 에이전트는 어디 참조?
**A**: 다음 위치 자동 참조:
- `.github/instructions/` - 에이전트 지침
- `knowledge-base/` - 팀 지식
- `deployment/` - 배포 설정

## 📚 문서

### Q: 지식 관리는?
**A**: `knowledge-base/` 폴더:
- 아키텍처
- 가이드
- 모범 사례
- 문제 해결
- 템플릿

### Q: 새 문서는?
**A**: 해당 섹션에 추가:
1. 폴더선택: Architecture, How-To, etc.
2. README 참고
3. 템플릿 사용
4. PR로 제출

## 🆘 도움말

### Q: 문제 해결은?
**A**: 순서대로:
1. [Troubleshooting Guide](../Troubleshooting/README.md) 확인
2. 팀 Slack 검색
3. 팀 멤버 질문
4. 에이전트 로그 확인

### Q: 누가 도와줄 수 있나?
**A**: 
- 기술 멘토: 기술 질문
- 팀 리더: 프로세스 질문
- 온보딩 담당: 처음 질문

### Q: 에러 리포트는?
**A**: GitHub 이슈로:
1. 명확한 제목
2. 재현 단계
3. 예상 vs 실제 동작
4. 환경 정보 (OS, 버전)

---

**마지막 업데이트**: 2026-06-20
