# LifeOS Insight Coach - 개발 계획

이 폴더는 대회용 앱 `LifeOS Insight Coach`의 기획, 구현, 데모, 운영 계획을 담습니다.

## 문서 인덱스

1. [01-product-plan.md](01-product-plan.md): 제품 목표, 사용자 시나리오, MVP 범위
2. [02-architecture.md](02-architecture.md): 아키텍처, 데이터 모델, API 계약
3. [03-implementation-timeline.md](03-implementation-timeline.md): 3시간 대회 실행 타임라인
4. [04-delivery-checklist.md](04-delivery-checklist.md): 배포/검증/리스크 체크리스트
5. [05-demo-script.md](05-demo-script.md): 60초 데모 스크립트 + 심사 대응 포인트
6. [06-copilot-prompts.md](06-copilot-prompts.md): Copilot 프롬프트 모음
7. [07-task-breakdown.md](07-task-breakdown.md): FE/BE/통합 트랙별 작업 분해
8. [08-evaluation-strategy.md](08-evaluation-strategy.md): 평가/심사 대응 전략
9. [09-multi-agent-collaboration.md](09-multi-agent-collaboration.md): 멀티 에이전트 충돌 방지/복구 전략

## 핵심 컨셉 한 줄

업무, 커리어, 테크 지식 입력을 한 번에 받아 오늘의 최우선 행동과 실행 계획으로 바꿔주는 개인 인사이트 코치.

## 대회 성공 우선순위

1. 작동 안정성 (실패 없는 엔드 투 엔드)
2. Copilot SDK 주연화 (AI가 핵심 가치 생산)
3. 데모 임팩트 (30~60초 내 와우 포인트)
4. Azure 배포 완성도 (실제 URL에서 동작)

## 빠른 시작

1. `03-implementation-timeline.md`로 시간 배분 확인
2. `02-architecture.md`의 API/스키마 계약 먼저 합의
3. FE/BE 병렬 개발 착수
4. `04-delivery-checklist.md` 기준으로 배포/검증 마감
