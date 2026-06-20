from __future__ import annotations

import json
import os
from typing import Protocol
from urllib import error, request

from app.models import AgentChange, AgentChatRequest, AgentChatResponse, AnalyzeResponse


class AnalyzerProtocol(Protocol):
    def analyze(self, brain_dump: str, time_budget_min: int) -> AnalyzeResponse: ...
    def chat(self, request: AgentChatRequest) -> AgentChatResponse: ...


class OpenAIAnalyzer:
    """LLM-backed analyzer that requires an `sk-` API key."""

    def __init__(self) -> None:
        self._api_key = os.getenv("OPENAI_API_KEY", "")
        self._base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
        self._model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    def analyze(self, brain_dump: str, time_budget_min: int) -> AnalyzeResponse:
        if not self._api_key.startswith("sk-"):
            raise RuntimeError(
                "OPENAI_API_KEY is missing or invalid. Provide a valid `sk-...` key."
            )

        system_prompt = (
            "You are a strict JSON planner for productivity and career growth. "
            "Return ONLY valid JSON following the requested schema."
        )
        user_prompt = (
            "다음 브레인덤프를 분석하세요.\n"
            f"brain_dump: {brain_dump}\n"
            f"time_budget_min: {time_budget_min}\n"
            "조건:\n"
            "1) top_actions는 1~3개\n"
            "2) priority는 1~3 정수\n"
            "3) estimate_min은 15~240\n"
            "4) tag.space는 work/career/tech 중 하나\n"
            "5) tag.career_signals는 한국어 역량 신호 리스트\n"
            "6) risks는 0개 이상\n"
        )

        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "task_analysis",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "summary": {"type": "string"},
                            "top_actions": {
                                "type": "array",
                                "minItems": 1,
                                "maxItems": 3,
                                "items": {
                                    "type": "object",
                                    "additionalProperties": False,
                                    "properties": {
                                        "id": {"type": "string"},
                                        "title": {"type": "string"},
                                        "reason": {"type": "string"},
                                        "priority": {"type": "integer", "enum": [1, 2, 3]},
                                        "estimate_min": {
                                            "type": "integer",
                                            "minimum": 15,
                                            "maximum": 240,
                                        },
                                        "done": {"type": "boolean"},
                                    },
                                    "required": [
                                        "id",
                                        "title",
                                        "reason",
                                        "priority",
                                        "estimate_min",
                                        "done",
                                    ],
                                },
                            },
                            "risks": {
                                "type": "array",
                                "items": {"type": "string"},
                            },
                            "time_budget_min": {"type": "integer"},
                            "tag": {
                                "type": "object",
                                "additionalProperties": False,
                                "properties": {
                                    "space": {
                                        "type": "string",
                                        "enum": ["work", "career", "tech"],
                                    },
                                    "career_signals": {
                                        "type": "array",
                                        "items": {"type": "string"},
                                    },
                                    "keywords": {
                                        "type": "array",
                                        "items": {"type": "string"},
                                    },
                                    "confidence": {
                                        "type": "number",
                                        "minimum": 0,
                                        "maximum": 1,
                                    },
                                },
                                "required": ["space", "career_signals", "keywords", "confidence"],
                            },
                        },
                        "required": [
                            "summary",
                            "top_actions",
                            "risks",
                            "time_budget_min",
                            "tag",
                        ],
                    },
                },
            },
        }

        endpoint = f"{self._base_url}/chat/completions"
        body = json.dumps(payload).encode("utf-8")
        req = request.Request(
            endpoint,
            data=body,
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with request.urlopen(req, timeout=25) as response:
                raw = response.read().decode("utf-8")
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"AI provider HTTP error: {exc.code} {detail}") from exc
        except error.URLError as exc:
            raise RuntimeError(f"AI provider network error: {exc.reason}") from exc

        parsed = json.loads(raw)
        content = parsed["choices"][0]["message"]["content"]
        normalized_content = content.strip()
        if normalized_content.startswith("```"):
            normalized_content = normalized_content.strip("`")
            if normalized_content.startswith("json"):
                normalized_content = normalized_content[4:].strip()

        model_output = json.loads(normalized_content)
        return AnalyzeResponse.model_validate(model_output)

    def chat(self, request: AgentChatRequest) -> AgentChatResponse:
        if not self._api_key.startswith("sk-"):
            raise RuntimeError(
                "OPENAI_API_KEY is missing or invalid. Provide a valid `sk-...` key."
            )

        tasks_text = json.dumps(
            [{"id": t.id, "title": t.title, "status": t.status,
              "priority": t.priority, "space": t.space, "date": t.date}
             for t in request.tasks],
            ensure_ascii=False,
        )

        system_prompt = (
            "You are ThriveOps AI, a Korean-language task management assistant. "
            "Return ONLY valid JSON following the schema."
        )
        user_prompt = (
            f"현재 업무 목록 (JSON):\n{tasks_text}\n\n"
            f"사용자 메시지: {request.message}\n\n"
            "위 메시지를 분석해 업무 변경사항(changes)과 한국어 응답(reply)을 반환하세요.\n"
            "변경 가능한 type: task_update, task_delete, reply_only\n"
            "task_update 시 field는 status(todo/doing/done) | priority(1/2/3) | "
            "space(work/career/tech) | title | date 중 하나. "
            "해당 없는 필드(target_id, field, value)는 빈 문자열\"\"로 채우세요."
        )

        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "agent_response",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "reply": {"type": "string"},
                            "changes": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "additionalProperties": False,
                                    "properties": {
                                        "type": {
                                            "type": "string",
                                            "enum": ["task_update", "task_delete", "reply_only"],
                                        },
                                        "target_id": {"type": "string"},
                                        "field": {"type": "string"},
                                        "value": {"type": "string"},
                                    },
                                    "required": ["type", "target_id", "field", "value"],
                                },
                            },
                        },
                        "required": ["reply", "changes"],
                    },
                },
            },
        }

        endpoint = f"{self._base_url}/chat/completions"
        body = json.dumps(payload).encode("utf-8")
        req = request.Request(
            endpoint,
            data=body,
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with request.urlopen(req, timeout=25) as response:
                raw = response.read().decode("utf-8")
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"AI provider HTTP error: {exc.code} {detail}") from exc
        except error.URLError as exc:
            raise RuntimeError(f"AI provider network error: {exc.reason}") from exc

        parsed = json.loads(raw)
        content = parsed["choices"][0]["message"]["content"]
        normalized_content = content.strip()
        if normalized_content.startswith("```"):
            normalized_content = normalized_content.strip("`")
            if normalized_content.startswith("json"):
                normalized_content = normalized_content[4:].strip()

        model_output = json.loads(normalized_content)
        changes = [
            AgentChange(
                type=c["type"],
                target_id=c.get("target_id", ""),
                field=c.get("field", ""),
                value=c.get("value", ""),
            )
            for c in model_output.get("changes", [])
        ]
        return AgentChatResponse(reply=model_output["reply"], changes=changes)
