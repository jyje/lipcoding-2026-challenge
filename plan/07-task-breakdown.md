# 07. Task Breakdown

## FE 트랙

1. 페이지 골격
- 입력 폼
- 결과 카드 영역
- 플랜 타임라인 영역

2. 상태 관리
- loading/error/success 상태
- analyze/replan API 호출 상태

3. 상호작용
- 완료 토글
- 시간 예산 변경 후 재계획

4. 마감 정리
- 빈 상태/오류 상태 UI
- 모바일 반응형 최소 대응

## BE 트랙

1. 프로젝트 골격
- Fastify 서버
- 라우트/서비스/스키마 분리

2. 분석 파이프라인
- 입력 정제
- SDK 호출
- 스키마 검증
- fallback

3. 저장/수정 API
- 액션 생성
- 완료 토글
- 재계획

4. 운영
- 요청 로그
- 헬스체크
- 환경변수 검증

5. 커리어 루프 핵심 기능
- 채용 공고 시드(약 10개) + 요구 역량 추출 (`GET /api/jobs/skills`)
- 지식기반 문제 해결 + 신규 지식 축적 (`POST /api/knowledge/solve`, `GET /api/knowledge`)
- 자동 반복 학습 루프 1회 실행/기록 (`POST /api/loop/run`)

## 통합 트랙

1. 공통 타입 싱크
- shared 타입 패키지 또는 파일 공유

2. 통합 테스트
- analyze -> 렌더 -> 토글

3. 배포
- BE 선배포
- FE 배포
- CORS 점검
