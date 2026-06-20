from __future__ import annotations

from app.analysis import HeuristicAnalyzer


def test_analyzer_prioritizes_deadline_and_impact() -> None:
    analyzer = HeuristicAnalyzer()
    result = analyzer.analyze(
        brain_dump="마감 임박 고객 배포 준비, 이력서 업데이트, 알고리즘 학습",
        time_budget_min=120,
    )

    assert result.top_actions, "최소 1개의 액션이 생성되어야 합니다."
    assert result.top_actions[0].title == "마감 임박 고객 배포 준비"
    assert "긴급도" in result.top_actions[0].reason
    assert result.top_actions[0].estimate_min >= 15
    assert any("마감" in risk for risk in result.risks)


def test_analyzer_keeps_action_count_bounded() -> None:
    analyzer = HeuristicAnalyzer()
    result = analyzer.analyze(
        brain_dump="\n".join([f"task-{idx}" for idx in range(10)]),
        time_budget_min=180,
    )

    assert len(result.top_actions) == 3
    assert result.time_budget_min == 180
