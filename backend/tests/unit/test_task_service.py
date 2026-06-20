from __future__ import annotations

from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from app.models import Space, TaskCreate, TaskEntity, TaskStatus, TaskUpdate
from app.service import TaskService


@pytest.mark.asyncio
async def test_create_task_uses_repository_and_returns_task_read() -> None:
    repo = AsyncMock()
    entity = TaskEntity(
        id=uuid4(),
        space=Space.work,
        title="회의 아젠다 확정",
        description="오늘 회의용 아젠다를 정리한다.",
        priority=1,
        status=TaskStatus.pending,
    )
    repo.create.return_value = entity
    service = TaskService(repo)

    result = await service.create_task(
        Space.work,
        TaskCreate(
            title="회의 아젠다 확정",
            description="오늘 회의용 아젠다를 정리한다.",
            priority=1,
        ),
    )

    repo.create.assert_awaited_once()
    assert result.space == Space.work
    assert result.title == "회의 아젠다 확정"
    assert result.priority == 1


@pytest.mark.asyncio
async def test_update_task_returns_none_when_task_not_found() -> None:
    repo = AsyncMock()
    repo.update.return_value = None
    service = TaskService(repo)

    result = await service.update_task(
        Space.career,
        uuid4(),
        TaskUpdate(status=TaskStatus.done),
    )

    repo.update.assert_awaited_once()
    assert result is None


@pytest.mark.asyncio
async def test_goal_overview_returns_three_spaces() -> None:
    repo = AsyncMock()
    work_task = TaskEntity(
        id=uuid4(),
        space=Space.work,
        title="프로젝트 제안서 작성",
        description="핵심 요구사항 요약",
        priority=1,
    )
    repo.list_by_space.side_effect = [
        [work_task],
        [],
        [],
    ]
    service = TaskService(repo)

    result = await service.goal_overview()

    assert [item.space for item in result.goals] == [Space.work, Space.career, Space.tech]
    assert result.goals[0].top_task is not None
    assert result.goals[1].top_task is None
    assert result.goals[2].top_task is None

