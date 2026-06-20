# ThriveOps Backend (FastAPI + uv)

## 실행

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 문서

- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## 테스트

```bash
cd backend
uv run pytest
```
