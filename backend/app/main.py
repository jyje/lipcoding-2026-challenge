from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.analysis import OpenAIAnalyzer
from app.api import build_router
from app.repository import InMemoryTaskRepository
from app.service import TaskService


def create_app() -> FastAPI:
    app = FastAPI(
        title="ThriveOps API",
        version="0.1.0",
        description=(
            "목표 과업을 work/career/tech 네임스페이스로 구분해 관리하는 "
            "FastAPI 초안 백엔드입니다."
        ),
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3100",
            "http://127.0.0.1:3100",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    repository = InMemoryTaskRepository()
    service = TaskService(repository, analyzer=OpenAIAnalyzer())

    def get_service() -> TaskService:
        return service

    @app.get("/health", tags=["health"], summary="헬스 체크")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(build_router(get_service))
    return app


app = create_app()
