from __future__ import annotations

from dataclasses import dataclass

from app.models import AnalyzeAction, AnalyzeResponse


@dataclass(frozen=True)
class CandidateTask:
    title: str
    score: int
    reason: str


class HeuristicAnalyzer:
    """Deterministic analyzer for predictable tests and stable local behavior."""

    urgency_keywords = ("긴급", "마감", "오늘", "urgent", "deadline")
    impact_keywords = ("고객", "면접", "배포", "회의", "release")
    growth_keywords = ("학습", "커리어", "포트폴리오", "study", "career")

    def analyze(self, brain_dump: str, time_budget_min: int) -> AnalyzeResponse:
        raw_tasks = [line.strip(" -\t") for line in brain_dump.replace(",", "\n").splitlines()]
        tasks = [task for task in raw_tasks if task]
        if not tasks:
            tasks = ["핵심 업무 정리"]

        candidates = [self._score_task(task) for task in tasks]
        candidates.sort(key=lambda item: item.score, reverse=True)
        selected = candidates[:3]

        slot = max(15, time_budget_min // max(1, len(selected)))
        top_actions = [
            AnalyzeAction(
                id=f"a{index + 1}",
                title=item.title,
                reason=item.reason,
                priority=min(3, index + 1),
                estimate_min=slot,
                done=False,
            )
            for index, item in enumerate(selected)
        ]

        risks: list[str] = []
        if any("마감" in task or "deadline" in task.lower() for task in tasks):
            risks.append("마감 이슈가 있어 오늘 안에 착수하지 않으면 지연 위험이 큽니다.")
        if len(tasks) > 5:
            risks.append("작업 수가 많아 우선순위 없는 병렬 진행 시 집중력이 분산될 수 있습니다.")

        summary = f"우선순위 1순위는 '{top_actions[0].title}' 입니다."
        return AnalyzeResponse(
            summary=summary,
            top_actions=top_actions,
            risks=risks,
            time_budget_min=time_budget_min,
        )

    def _score_task(self, title: str) -> CandidateTask:
        lowered = title.lower()
        score = 10
        reasons: list[str] = []

        if any(keyword in lowered for keyword in self.urgency_keywords):
            score += 8
            reasons.append("긴급도 높음")
        if any(keyword in lowered for keyword in self.impact_keywords):
            score += 5
            reasons.append("영향도 높음")
        if any(keyword in lowered for keyword in self.growth_keywords):
            score += 3
            reasons.append("장기 역량 강화")

        reason = ", ".join(reasons) if reasons else "기본 우선순위 규칙 적용"
        return CandidateTask(title=title, score=score, reason=reason)
