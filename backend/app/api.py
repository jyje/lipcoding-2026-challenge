from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import AuthContext, require_bearer_auth
from app.models import (
    AnalyzeRequest,
    AnalyzeResponse,
    GoalOverviewResponse,
    Space,
    TaskCreate,
    TaskRead,
    TaskUpdate,
)
from app.service import TaskService


def build_router(get_service):
    router = APIRouter(prefix="/api/v1", tags=["goals"])

    @router.post(
        "/spaces/{space}/tasks",
        response_model=TaskRead,
        status_code=status.HTTP_201_CREATED,
        summary="네임스페이스(space)별 과업 생성",
    )
    async def create_task(
        space: Space,
        payload: TaskCreate,
        service: TaskService = Depends(get_service),
    ) -> TaskRead:
        return await service.create_task(space, payload)

    @router.get(
        "/spaces/{space}/tasks",
        response_model=list[TaskRead],
        summary="네임스페이스(space)별 과업 목록 조회",
    )
    async def list_tasks(
        space: Space,
        service: TaskService = Depends(get_service),
    ) -> list[TaskRead]:
        return await service.list_tasks(space)

    @router.get(
        "/spaces/{space}/tasks/{task_id}",
        response_model=TaskRead,
        summary="네임스페이스(space)별 단일 과업 조회",
    )
    async def get_task(
        space: Space,
        task_id: UUID,
        service: TaskService = Depends(get_service),
    ) -> TaskRead:
        task = await service.get_task(space, task_id)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return task

    @router.patch(
        "/spaces/{space}/tasks/{task_id}",
        response_model=TaskRead,
        summary="네임스페이스(space)별 과업 수정",
    )
    async def update_task(
        space: Space,
        task_id: UUID,
        payload: TaskUpdate,
        service: TaskService = Depends(get_service),
    ) -> TaskRead:
        task = await service.update_task(space, task_id, payload)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return task

    @router.get(
        "/goals/overview",
        response_model=GoalOverviewResponse,
        summary="work/career/tech 3개 목표 네임스페이스 요약",
    )
    async def goal_overview(
        service: TaskService = Depends(get_service),
    ) -> GoalOverviewResponse:
        return await service.goal_overview()

    @router.post(
        "/analyze",
        response_model=AnalyzeResponse,
        summary="브레인 덤프를 분석해 상위 액션과 리스크를 반환",
    )
    async def analyze(
        payload: AnalyzeRequest,
        service: TaskService = Depends(get_service),
        _auth: AuthContext = Depends(require_bearer_auth),
    ) -> AnalyzeResponse:
        return await service.analyze(payload)

    @router.get(
        "/insights/latest",
        response_model=AnalyzeResponse,
        summary="가장 최근 분석 결과 조회",
    )
    async def latest_insight(
        service: TaskService = Depends(get_service),
        _auth: AuthContext = Depends(require_bearer_auth),
    ) -> AnalyzeResponse:
        result = await service.latest_insight()
        if result is None:
            raise HTTPException(status_code=404, detail="No insight found")
        return result

    return router

