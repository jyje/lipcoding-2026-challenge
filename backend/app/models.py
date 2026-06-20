from __future__ import annotations

from enum import Enum
from typing import Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class Space(str, Enum):
    work = "work"
    career = "career"
    tech = "tech"


class TaskStatus(str, Enum):
    pending = "pending"
    done = "done"


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(min_length=1, max_length=500)
    priority: Literal[1, 2, 3] = 2


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, min_length=1, max_length=500)
    priority: Literal[1, 2, 3] | None = None
    status: TaskStatus | None = None


class TaskRead(BaseModel):
    id: UUID
    space: Space
    title: str
    description: str
    priority: Literal[1, 2, 3]
    status: TaskStatus


class TaskEntity(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    space: Space
    title: str
    description: str
    priority: Literal[1, 2, 3]
    status: TaskStatus = TaskStatus.pending

    def to_read(self) -> TaskRead:
        return TaskRead(
            id=self.id,
            space=self.space,
            title=self.title,
            description=self.description,
            priority=self.priority,
            status=self.status,
        )


class SpaceGoal(BaseModel):
    space: Space
    top_task: TaskRead | None


class GoalOverviewResponse(BaseModel):
    goals: list[SpaceGoal]


class AnalyzeRequest(BaseModel):
    brain_dump: str = Field(min_length=5, max_length=4000)
    time_budget_min: int = Field(default=120, ge=15, le=600)


class AnalyzeAction(BaseModel):
    id: str
    title: str
    reason: str
    priority: Literal[1, 2, 3]
    estimate_min: int = Field(ge=15, le=240)
    done: bool = False


class AnalyzeResponse(BaseModel):
    summary: str
    top_actions: list[AnalyzeAction]
    risks: list[str]
    time_budget_min: int

