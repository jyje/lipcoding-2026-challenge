# AGENTS.md

여러 AI 에이전트가 autopilot으로 동시에 작업하는 저장소입니다. 충돌과 빌드 깨짐을 막기 위해 모든 에이전트는 아래 규칙을 반드시 따릅니다. 자세한 배경은 [plan/09-multi-agent-collaboration.md](plan/09-multi-agent-collaboration.md)를 참고하세요.

## 트랙 소유권 (자기 디렉터리만 편집)

| 트랙 | 소유 디렉터리 | 브랜치 prefix |
| --- | --- | --- |
| FE | `frontend/` | `feat/fe-*` |
| BE | `backend/` | `feat/be-*` |
| 통합/배포 | `infra/`, `deploy/`, CI 설정 | `feat/ops-*` |
| 공유 계약 | `shared/` | `contract/*` |

- 소유 경계 **밖 파일은 읽기만** 한다. 수정이 필요하면 해당 트랙 담당에게 요청한다.
- `shared/`(API·타입 계약)는 **한 번에 한 에이전트만** 편집하고, 변경 시 `[contract]` PR로 즉시 머지한다.

## 작업 루프

1. `git pull --rebase origin main`으로 최신을 흡수한다.
2. **작게, 자주** 커밋한다.
3. 머지 전 green gate를 통과한다(아래).
4. 머지는 fast-forward 또는 squash.

## Green gate (머지 전 필수)

```bash
npm run typecheck   # 타입 에러 0
npm run build       # 빌드 성공
npm test -- --run   # 스모크 테스트 통과(있으면)
```

하나라도 실패하면 **머지 금지** — 자기 브랜치에서 고친다.

## 깨졌을 때 (멈추지 말 것)

- 30초 내 고칠 수 있으면 **fix-forward 커밋**.
- 아니면 **즉시 `git revert <bad_sha>`** 로 main을 green으로 되돌리고, 원작업은 별도 브랜치에서 재시도.
- 복구/되돌림은 한 줄 공지(이슈/코멘트)로 공유해 중복 작업을 막는다.
- **main은 항상 green 상태를 유지한다. 완벽한 커밋보다 깨지지 않은 main이 우선이다.**

## 금지 (가드레일)

- 공유 브랜치에 `git push --force`, `git reset --hard` 금지.
- 미머지/진행 중 변경 임의 폐기 금지.
- `shared/` 계약 임의 변경 금지(`[contract]` PR로만).
- 자기 트랙 밖 파일 수정 금지.
- 충돌 시 한쪽을 추측으로 버리지 말고 양쪽 의도를 보존하며 해결.

## worktree 분리 (권장)

```bash
git worktree add ../thriveops-fe  -b feat/fe-skeleton
git worktree add ../thriveops-be  -b feat/be-skeleton
git worktree add ../thriveops-ops -b feat/ops-deploy
```

각 에이전트는 자기 worktree 폴더 안에서만 명령을 실행한다.
