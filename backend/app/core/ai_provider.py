"""AI Provider abstraction.

This module isolates all LLM calls behind an ``AIProvider`` interface so that
business logic never depends on a specific vendor. Today we ship a
``ClaudeProvider`` backed by the Emergent Universal LLM Key. Tomorrow, we can
add ``OpenAIProvider`` or ``GeminiProvider`` without changing callers.

All healthcare-critical prompts include:
  * Strict JSON output contract
  * Confidence + caveats
  * Medical disclaimer language
"""
from __future__ import annotations

import asyncio
import json
import logging
import re
import uuid
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

from emergentintegrations.llm.chat import LlmChat, UserMessage

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class AIProviderError(Exception):
    """Raised for any LLM call failure or invalid model output."""


class AIProvider(ABC):
    """Abstract base class for all LLM providers."""

    name: str

    @abstractmethod
    async def generate_json(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        session_id: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: int = 4000,
    ) -> Dict[str, Any]:
        """Return a Python dict parsed from a strict-JSON model response."""


def _extract_json_block(text: str) -> str:
    """Best-effort extractor for a JSON object from a model response.

    Handles ```json fenced blocks, ``` fenced blocks, and stray prose.
    """
    if not text:
        raise AIProviderError("Empty model response")

    # Try fenced blocks first
    fence = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", text, re.IGNORECASE)
    if fence:
        return fence.group(1)

    # Fallback: first {...} balanced substring using a simple scanner
    start = text.find("{")
    if start == -1:
        raise AIProviderError(f"No JSON object found in response: {text[:200]}")

    depth = 0
    in_str = False
    esc = False
    for i in range(start, len(text)):
        ch = text[i]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start : i + 1]

    raise AIProviderError("Unterminated JSON object in response")


class ClaudeProvider(AIProvider):
    """Anthropic Claude provider via Emergent Universal LLM Key."""

    name = "anthropic"

    def __init__(self, model: Optional[str] = None) -> None:
        settings = get_settings()
        if not settings.emergent_llm_key:
            raise AIProviderError(
                "EMERGENT_LLM_KEY is not configured. Add it to backend/.env."
            )
        self._api_key = settings.emergent_llm_key
        self._model = model or settings.default_ai_model

    async def generate_json(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        session_id: Optional[str] = None,
        temperature: Optional[float] = None,  # noqa: ARG002 (kept for interface compat)
        max_tokens: int = 4000,
    ) -> Dict[str, Any]:
        sid = session_id or f"sess_{uuid.uuid4().hex[:12]}"
        strict_system = (
            system_prompt
            + "\n\nSTRICT OUTPUT RULES:\n"
            + "- Respond with a SINGLE JSON object matching the schema.\n"
            + "- Do NOT include prose, markdown, or code fences outside the JSON.\n"
            + "- All numeric fields must be numbers (not strings).\n"
            + "- Use INR (\u20b9) values in `amount_inr` fields as integers (no commas).\n"
            + "- If uncertain, say so via `confidence` (low|medium|high) and `caveats`."
        )

        chat = (
            LlmChat(
                api_key=self._api_key,
                session_id=sid,
                system_message=strict_system,
            )
            .with_model("anthropic", self._model)
            .with_params(max_tokens=max_tokens)
        )

        # Retry a couple of times to survive transient proxy/budget hiccups.
        last_exc: Optional[Exception] = None
        for attempt in range(3):
            try:
                response = await chat.send_message(UserMessage(text=user_prompt))
                break
            except Exception as exc:  # pragma: no cover (network / provider)
                last_exc = exc
                msg = str(exc).lower()
                # Retry transient budget / rate errors; fail fast otherwise
                if any(
                    t in msg
                    for t in (
                        "budget",
                        "rate",
                        "timeout",
                        "temporarily",
                        "503",
                        "502",
                        "connection",
                    )
                ):
                    logger.warning(
                        "Transient LLM error (attempt %s/3): %s",
                        attempt + 1,
                        exc,
                    )
                    await asyncio.sleep(1.5 * (attempt + 1))
                    continue
                logger.exception("Claude call failed")
                raise AIProviderError(str(exc)) from exc
        else:
            logger.exception("Claude call failed after retries")
            raise AIProviderError(str(last_exc)) from last_exc

        text = response if isinstance(response, str) else str(response)
        try:
            block = _extract_json_block(text)
        except AIProviderError as exc:
            logger.error(
                "JSON extraction failed. Response tail: %r",
                text[-500:] if text else "",
            )
            raise AIProviderError(
                f"{exc}. Model likely truncated output; try lowering prompt size or "
                f"raising max_tokens."
            ) from exc
        try:
            return json.loads(block)
        except json.JSONDecodeError as exc:
            logger.error("Invalid JSON from Claude: %s", block[:500])
            raise AIProviderError(f"Invalid JSON: {exc}") from exc


def get_ai_provider(name: Optional[str] = None) -> AIProvider:
    """Factory returning the configured provider (default: Claude)."""
    settings = get_settings()
    provider_name = (name or settings.default_ai_provider).lower()
    if provider_name in {"anthropic", "claude"}:
        return ClaudeProvider()
    raise AIProviderError(f"Unsupported provider: {provider_name}")
