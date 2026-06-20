from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import create_app


def test_analyze_requires_bearer_token() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/api/v1/analyze",
        json={"brain_dump": "오늘 배포와 회의 준비", "time_budget_min": 90},
    )

    assert response.status_code == 401
    body = response.json()
    assert body["detail"]["code"] == "unauthorized"


def test_analyze_returns_meaningful_structure(monkeypatch) -> None:
    monkeypatch.setenv("COPILOT_BEARER_TOKEN", "test-token")
    client = TestClient(create_app())

    response = client.post(
        "/api/v1/analyze",
        json={
            "brain_dump": "마감 임박 고객 회의 준비, 포트폴리오 정리",
            "time_budget_min": 120,
        },
        headers={"Authorization": "Bearer test-token"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["summary"]
    assert len(payload["top_actions"]) >= 1
    assert payload["top_actions"][0]["title"] == "마감 임박 고객 회의 준비"
    assert payload["top_actions"][0]["priority"] == 1
    assert payload["top_actions"][0]["reason"]


def test_latest_insight_roundtrip(monkeypatch) -> None:
    monkeypatch.setenv("COPILOT_BEARER_TOKEN", "roundtrip-token")
    client = TestClient(create_app())
    headers = {"Authorization": "Bearer roundtrip-token"}

    create_response = client.post(
        "/api/v1/analyze",
        json={"brain_dump": "오늘 마감 문서 제출", "time_budget_min": 60},
        headers=headers,
    )
    assert create_response.status_code == 200

    get_response = client.get("/api/v1/insights/latest", headers=headers)
    assert get_response.status_code == 200
    latest = get_response.json()
    assert latest["top_actions"][0]["title"] == "오늘 마감 문서 제출"
