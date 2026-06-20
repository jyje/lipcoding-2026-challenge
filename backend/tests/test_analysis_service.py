from __future__ import annotations

import json

from app.analysis import OpenAIAnalyzer


class _FakeResponse:
    def __init__(self, payload: dict) -> None:
        self._payload = json.dumps(payload).encode("utf-8")

    def read(self) -> bytes:
        return self._payload

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


def test_openai_analyzer_parses_structured_response(monkeypatch) -> None:
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test-key")
    analyzer = OpenAIAnalyzer()

    provider_payload = {
        "choices": [
            {
                "message": {
                    "content": json.dumps(
                        {
                            "summary": "핵심 업무를 우선 처리하세요.",
                            "top_actions": [
                                {
                                    "id": "a1",
                                    "title": "마감 임박 고객 배포 준비",
                                    "reason": "마감 영향도가 높음",
                                    "priority": 1,
                                    "estimate_min": 45,
                                    "done": False,
                                }
                            ],
                            "risks": ["마감 지연 위험"],
                            "time_budget_min": 120,
                            "tag": {
                                "space": "work",
                                "career_signals": ["문제해결"],
                                "keywords": ["배포", "고객"],
                                "confidence": 0.82,
                            },
                        }
                    )
                }
            }
        ]
    }

    monkeypatch.setattr(
        "app.analysis.request.urlopen",
        lambda *_args, **_kwargs: _FakeResponse(provider_payload),
    )

    result = analyzer.analyze(
        brain_dump="마감 임박 고객 배포 준비, 이력서 업데이트, 알고리즘 학습",
        time_budget_min=120,
    )

    assert result.top_actions, "최소 1개의 액션이 생성되어야 합니다."
    assert result.top_actions[0].title == "마감 임박 고객 배포 준비"
    assert "영향도" in result.top_actions[0].reason
    assert result.top_actions[0].estimate_min >= 15
    assert any("마감" in risk for risk in result.risks)
    assert result.tag.space.value == "work"


def test_openai_analyzer_requires_sk_token(monkeypatch) -> None:
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    analyzer = OpenAIAnalyzer()

    try:
        analyzer.analyze(brain_dump="task-1", time_budget_min=60)
        assert False, "OPENAI_API_KEY 누락 시 예외가 발생해야 합니다."
    except RuntimeError as exc:
        assert "OPENAI_API_KEY" in str(exc)
