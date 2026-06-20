# 🤖 Agent Reference Guide

에이전트가 지식 기반을 효과적으로 활용하기 위한 가이드입니다.

## 📍 에이전트가 참조하는 경로

### 1. 에이전트 지침 (Agent Instructions)
```
.github/instructions/
  ├── frontend-design.instructions.md
  ├── frontend.instructions.md
  ├── backend.instructions.md
  └── ...
```
**용도**: 에이전트별 구체적인 작업 지침

### 2. 지식 기반 (Knowledge Base)
```
knowledge-base/
  ├── Architecture/      - 시스템 설계
  ├── How-To-Guides/     - 단계별 가이드
  ├── Best-Practices/    - 모범 사례
  ├── Troubleshooting/   - 문제 해결
  ├── Tools/             - 도구 참조
  ├── Onboarding/        - 온보딩 정보
  ├── Templates/         - 템플릿
  └── FAQs/              - 자주 묻는 질문
```
**용도**: 팀 전체 기술 지식

### 3. 배포 설정 (Deployment)
```
deployment/
  ├── README.md
  ├── AZURE_DEPLOYMENT.md
  ├── hooks/
  │   ├── agent-registry.yaml
  │   ├── pre-deploy.sh
  │   └── health-check.sh
```
**용도**: 배포 및 자동화 정보

### 4. 스킬 (Skills)
```
.agents/skills/
  ├── git-commit-helper/
  ├── frontend-design/
  ├── copilot-sdk/
  └── persistent-wiki-agent/
```
**용도**: 재사용 가능한 작업 모음

## 🎯 에이전트 작업별 참조 경로

### 프론트엔드 개발 에이전트
1. `.github/instructions/frontend.instructions.md` - 가이드 읽기
2. `knowledge-base/Architecture/Frontend/` - 아키텍처 확인
3. `knowledge-base/How-To-Guides/BUILD_FRONTEND.md` - 빌드 방법
4. `knowledge-base/Best-Practices/CODE_STYLE.md` - 코드 스타일
5. `knowledge-base/Templates/code/COMPONENT_TEMPLATE.tsx` - 컴포넌트 템플릿

### 백엔드 개발 에이전트
1. `.github/instructions/backend.instructions.md` - 가이드 읽기
2. `knowledge-base/Architecture/Backend/` - 아키텍처 확인
3. `knowledge-base/How-To-Guides/BUILD_BACKEND.md` - 빌드 방법
4. `knowledge-base/Best-Practices/API_DESIGN.md` - API 설계
5. `knowledge-base/Templates/code/ROUTE_TEMPLATE.ts` - 라우트 템플릿

### 배포 에이전트
1. `deployment/README.md` - 배포 개요
2. `deployment/AZURE_DEPLOYMENT.md` - Azure 배포
3. `deployment/hooks/agent-registry.yaml` - 훅 정의
4. `knowledge-base/How-To-Guides/DEPLOYMENT.md` - 배포 가이드
5. `.github/workflows/deploy.yml` - 워크플로우

### 코드 리뷰 에이전트
1. `knowledge-base/Best-Practices/CODE_REVIEW.md` - 리뷰 기준
2. `knowledge-base/Best-Practices/CODE_STYLE.md` - 코드 스타일
3. `knowledge-base/Best-Practices/SECURITY.md` - 보안 가이드
4. `knowledge-base/Best-Practices/TESTING.md` - 테스트 전략
5. `knowledge-base/Templates/code/` - 코드 템플릿

### 문제 해결 에이전트
1. `knowledge-base/Troubleshooting/README.md` - 진단 단계
2. 해당 카테고리 문서 참조
3. `knowledge-base/FAQs/` - 자주 묻는 질문
4. `knowledge-base/Onboarding/FAQ.md` - 온보딩 FAQ

## 📝 에이전트 작업 템플릿

### 문제 해결 요청 시
```
[에이전트] 다음 정보를 참조하여 문제 해결:
- 문제: [설명]
- 참조 경로:
  1. knowledge-base/Troubleshooting/
  2. knowledge-base/Architecture/
  3. knowledge-base/FAQs/
```

### 코드 작성 요청 시
```
[에이전트] 다음을 따라 코드 작성:
- 참조 경로:
  1. knowledge-base/Best-Practices/
  2. knowledge-base/Architecture/
  3. knowledge-base/Templates/code/
```

### 배포 요청 시
```
[에이전트] 배포 수행:
- 참조 경로:
  1. deployment/README.md
  2. deployment/AZURE_DEPLOYMENT.md
  3. knowledge-base/How-To-Guides/DEPLOYMENT.md
```

## 🔗 에이전트 호출 방식

### Copilot CLI에서
```bash
copilot task --path knowledge-base/
copilot refactor --agent backend --kb knowledge-base/
```

### GitHub Actions에서
```yaml
- name: Run Agent
  run: |
    copilot agent run backend \
      --context knowledge-base/ \
      --reference .github/instructions/backend.instructions.md
```

## 📚 지식 기반 유지보수

### 에이전트가 할 일
1. 작업 완료 후 관련 문서 검토
2. 업데이트 필요시 PR 제출
3. 새 패턴 발견시 Templates에 추가
4. 오류 발견시 Troubleshooting에 추가

### 검증 체크리스트
- [ ] 문서가 현재 코드와 일치
- [ ] 링크가 모두 유효
- [ ] 예제 코드가 실행 가능
- [ ] 지침이 명확하고 따르기 쉬움

---

**마지막 업데이트**: 2026-06-20  
**버전**: 1.0
