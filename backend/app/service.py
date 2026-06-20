from __future__ import annotations

from uuid import UUID

from app.analysis import AnalyzerProtocol
from app.models import (
    AgentChatRequest,
    AgentChatResponse,
    AnalyzeRequest,
    AnalyzeResponse,
    GoalOverviewResponse,
    Space,
    SpaceGoal,
    TaskCreate,
    TaskRead,
    TaskStatus,
    TaskUpdate,
)
from app.repository import TaskRepository


class TaskService:
    def __init__(self, repository: TaskRepository, analyzer: AnalyzerProtocol) -> None:
        self._repository = repository
        self._analyzer = analyzer
        self._latest_insight: AnalyzeResponse | None = None

    async def create_task(self, space: Space, payload: TaskCreate) -> TaskRead:
        entity = await self._repository.create(space, payload)
        return entity.to_read()

    async def list_tasks(self, space: Space) -> list[TaskRead]:
        entities = await self._repository.list_by_space(space)
        return [entity.to_read() for entity in entities]

    async def get_task(self, space: Space, task_id: UUID) -> TaskRead | None:
        entity = await self._repository.get(space, task_id)
        return entity.to_read() if entity else None

    async def update_task(
        self, space: Space, task_id: UUID, payload: TaskUpdate
    ) -> TaskRead | None:
        entity = await self._repository.update(space, task_id, payload)
        return entity.to_read() if entity else None

    async def goal_overview(self) -> GoalOverviewResponse:
        goals: list[SpaceGoal] = []
        for space in (Space.work, Space.career, Space.tech):
            items = await self._repository.list_by_space(space)
            top_pending = next((item for item in items if item.status == TaskStatus.pending), None)
            goals.append(
                SpaceGoal(
                    space=space,
                    top_task=top_pending.to_read() if top_pending else None,
                )
            )
        return GoalOverviewResponse(goals=goals)

    async def analyze(self, payload: AnalyzeRequest) -> AnalyzeResponse:
        result = self._analyzer.analyze(
            brain_dump=payload.brain_dump,
            time_budget_min=payload.time_budget_min,
        )
        self._latest_insight = result
        return result

    async def latest_insight(self) -> AnalyzeResponse | None:
        return self._latest_insight

    async def agent_chat(self, payload: AgentChatRequest) -> AgentChatResponse:
        return self._analyzer.chat(payload)

