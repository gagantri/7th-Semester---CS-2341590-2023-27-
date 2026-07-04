"""AI Provider abstraction.

Isolates all LLM calls behind an ``AIProvider`` interface so business logic
never depends on a specific vendor. ``ClaudeProvider`` is the default; more
providers can be plugged in without changing callers.

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

_TRANSIENT_MARKERS = (
    "budget",
    "rate",
    "timeout",
    "temporarily",
    "503",
    "502",
    "connection",
)

_MAX_RETRIES = 3


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


# ---------------------------------------------------------------------------
# JSON extraction helpers
# ---------------------------------------------------------------------------


def _find_fenced_json(text: str) -> Optional[str]:
    match = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", text, re.IGNORECASE)
    return match.group(1) if match else None


def _find_balanced_json(text: str, start: int) -> str:
    """Return the balanced JSON object substring starting at ``text[start]``."""
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
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start : i + 1]
    raise AIProviderError("Unterminated JSON object in response")


def _extract_json_block(text: str) -> str:
    """Best-effort extractor for a JSON object from a model response.

    Handles ```json fenced blocks, ``` fenced blocks, and stray prose.
    """
    if not text:
        raise AIProviderError("Empty model response")

    fenced = _find_fenced_json(text)
    if fenced is not None:
        return fenced

    start = text.find("{")
    if start == -1:
        raise AIProviderError(f"No JSON object found in response: {text[:200]}")
    return _find_balanced_json(text, start)


def _is_transient(exc: Exception) -> bool:
    msg = str(exc).lower()
    return any(marker in msg for marker in _TRANSIENT_MARKERS)


# ---------------------------------------------------------------------------
# Claude implementation
# ---------------------------------------------------------------------------


class ClaudeProvider(AIProvider):
    """Anthropic Claude via Emergent Universal LLM Key."""

    name = "anthropic"

    _STRICT_SUFFIX = (
        "\n\nSTRICT OUTPUT RULES:\n"
        "- Respond with a SINGLE JSON object matching the schema.\n"
        "- Do NOT include prose, markdown, or code fences outside the JSON.\n"
        "- All numeric fields must be numbers (not strings).\n"
        "- Use INR (\u20b9) values in `amount_inr` fields as integers "
        "(no commas).\n"
        "- If uncertain, say so via `confidence` (low|medium|high) and "
        "`caveats`."
    )

    def __init__(self, model: Optional[str] = None) -> None:
        settings = get_settings()
        if not settings.emergent_llm_key:
            raise AIProviderError(
                "EMERGENT_LLM_KEY is not configured. Add it to backend/.env."
            )
        self._api_key = settings.emergent_llm_key
        self._model = model or settings.default_ai_model

    def _build_chat(
        self, *, system_prompt: str, session_id: str, max_tokens: int
    ) -> LlmChat:
        return (
            LlmChat(
                api_key=self._api_key,
                session_id=session_id,
                system_message=system_prompt + self._STRICT_SUFFIX,
            )
            .with_model("anthropic", self._model)
            .with_params(max_tokens=max_tokens)
        )

    async def _send_with_retry(
        self, chat: LlmChat, user_prompt: str
    ) -> str:
        last_exc: Optional[Exception] = None
        for attempt in range(_MAX_RETRIES):
            try:
                response = await chat.send_message(UserMessage(text=user_prompt))
                return response if isinstance(response, str) else str(response)
            except Exception as exc:  # pragma: no cover (network/provider)
                last_exc = exc
                if _is_transient(exc):
                    logger.warning(
                        "Transient LLM error (attempt %s/%s): %s",
                        attempt + 1,
                        _MAX_RETRIES,
                        exc,
                    )
                    await asyncio.sleep(1.5 * (attempt + 1))
                    continue
                logger.exception("Claude call failed (non-transient)")
                raise AIProviderError(str(exc)) from exc
        logger.exception("Claude call failed after retries")
        raise AIProviderError(str(last_exc)) from last_exc

    def _parse_json(self, text: str) -> Dict[str, Any]:
        try:
            block = _extract_json_block(text)
        except AIProviderError as exc:
            logger.error(
                "JSON extraction failed. Response tail: %r",
                text[-500:] if text else "",
            )
            raise AIProviderError(
                f"{exc}. Model likely truncated output; "
                f"try lowering prompt size or raising max_tokens."
            ) from exc
        try:
            return json.loads(block)
        except json.JSONDecodeError as exc:
            logger.error("Invalid JSON from Claude: %s", block[:500])
            raise AIProviderError(f"Invalid JSON: {exc}") from exc

    async def generate_json(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        session_id: Optional[str] = None,
        temperature: Optional[float] = None,  # noqa: ARG002 (interface compat)
        max_tokens: int = 4000,
    ) -> Dict[str, Any]:
        sid = session_id or f"sess_{uuid.uuid4().hex[:12]}"
        chat = self._build_chat(
            system_prompt=system_prompt,
            session_id=sid,
            max_tokens=max_tokens,
        )
        raw_text = await self._send_with_retry(chat, user_prompt)
        return self._parse_json(raw_text)


def get_ai_provider(name: Optional[str] = None) -> AIProvider:
    """Factory returning the configured provider (default: Claude)."""
    settings = get_settings()
    provider_name = (name or settings.default_ai_provider).lower()
    if provider_name in {"anthropic", "claude"}:
        return ClaudeProvider()
    raise AIProviderError(f"Unsupported provider: {provider_name}")
