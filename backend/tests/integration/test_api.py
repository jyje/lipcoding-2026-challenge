from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import create_app


def test_create_and_list_tasks_per_space_namespace() -> None:
    client = TestClient(create_app())

    create_resp = client.post(
        "/api/v1/spaces/work/tasks",
        json={
            "title": "회의 준비",
            "description": "오전 회의 전에 문서 정리",
            "priority": 1,
        },
    )
    assert create_resp.status_code == 201
    payload = create_resp.json()
    assert payload["space"] == "work"

    list_resp = client.get("/api/v1/spaces/work/tasks")
    assert list_resp.status_code == 200
    rows = list_resp.json()
    assert len(rows) == 1
    assert rows[0]["title"] == "회의 준비"


def test_overview_includes_all_three_spaces() -> None:
    client = TestClient(create_app())

    client.post(
        "/api/v1/spaces/career/tasks",
        json={
            "title": "이력서 업데이트",
            "description": "최근 프로젝트 반영",
            "priority": 2,
        },
    )

    overview_resp = client.get("/api/v1/goals/overview")
    assert overview_resp.status_code == 200
    overview = overview_resp.json()

    spaces = [entry["space"] for entry in overview["goals"]]
    assert spaces == ["work", "career", "tech"]
    assert overview["goals"][1]["top_task"]["title"] == "이력서 업데이트"


def test_update_task_status_done() -> None:
    client = TestClient(create_app())
    created = client.post(
        "/api/v1/spaces/tech/tasks",
        json={
            "title": "시스템 디자인 복습",
            "description": "핵심 패턴 정리",
            "priority": 3,
        },
    ).json()
    task_id = created["id"]

    update_resp = client.patch(
        f"/api/v1/spaces/tech/tasks/{task_id}",
        json={"status": "done"},
    )

    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "done"

