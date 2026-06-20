from __future__ import annotations

from collections import defaultdict
from typing import Protocol
from uuid import UUID

from app.models import Space, TaskCreate, TaskEntity, TaskUpdate


class TaskRepository(Protocol):
    async def create(self, space: Space, task: TaskCreate) -> TaskEntity: ...

    async def list_by_space(self, space: Space) -> list[TaskEntity]: ...

    async def get(self, space: Space, task_id: UUID) -> TaskEntity | None: ...

    async def update(
        self, space: Space, task_id: UUID, payload: TaskUpdate
    ) -> TaskEntity | None: ...


class InMemoryTaskRepository:
    def __init__(self) -> None:
        self._store: dict[Space, dict[UUID, TaskEntity]] = defaultdict(dict)

    async def create(self, space: Space, task: TaskCreate) -> TaskEntity:
        entity = TaskEntity(
            space=space,
            title=task.title,
            description=task.description,
            priority=task.priority,
        )
        self._store[space][entity.id] = entity
        return entity

    async def list_by_space(self, space: Space) -> list[TaskEntity]:
        values = list(self._store[space].values())
        return sorted(values, key=lambda item: (item.status.value, item.priority))

    async def get(self, space: Space, task_id: UUID) -> TaskEntity | None:
        return self._store[space].get(task_id)

    async def update(
        self, space: Space, task_id: UUID, payload: TaskUpdate
    ) -> TaskEntity | None:
        entity = self._store[space].get(task_id)
        if entity is None:
            return None

        if payload.title is not None:
            entity.title = payload.title
        if payload.description is not None:
            entity.description = payload.description
        if payload.priority is not None:
            entity.priority = payload.priority
        if payload.status is not None:
            entity.status = payload.status

        return entity

