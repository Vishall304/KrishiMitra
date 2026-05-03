"""
Vercel Python serverless function — KrishiMitra AI chat.

Deployed automatically by Vercel as POST /api/chat.
Keeps the API key server-side only (EMERGENT_LLM_KEY env var).
Mirrors the shape of /app/backend/server.py `/api/ai/chat` so the frontend
can target either one without changes.

Frontend default hits `/api/ai/chat`; to use THIS file on Vercel add the
rewrite in /app/vercel.json that forwards `/api/ai/chat` -> `/api/chat`.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import uuid
from http.server import BaseHTTPRequestHandler
from typing import Any

logger = logging.getLogger("krishimitra.vercel")

SYSTEM_PROMPTS = {
    "en": (
        "You are KrishiMitra, a practical farming assistant for small Indian farmers. "
        "Answer clearly and briefly (3-6 short lines) in plain English. "
        "Focus on crop care, irrigation, fertilizer doses, pest / disease control, "
        "sowing dates, weather-based advice, and farm planning. "
        "If a question needs a photo or soil test, say so. Never invent dosages — "
        "if unsure, recommend consulting a local Krishi Vigyan Kendra."
    ),
    "hi": (
        "आप KrishiMitra हैं — भारतीय छोटे किसानों के लिए व्यावहारिक कृषि सहायक। "
        "सरल हिंदी में संक्षिप्त उत्तर दें (3-6 छोटी पंक्तियाँ)। "
        "फसल देखभाल, सिंचाई, खाद मात्रा, कीट/रोग नियंत्रण, बुवाई समय, "
        "मौसम सलाह और फार्म योजना पर ध्यान दें। "
        "अनुमान से कोई मात्रा न बताएं — संदेह हो तो नजदीकी KVK से संपर्क करने को कहें।"
    ),
    "mr": (
        "तुम्ही KrishiMitra आहात — भारतीय लहान शेतकऱ्यांसाठी व्यावहारिक कृषी सहाय्यक. "
        "साध्या मराठीत थोडक्यात उत्तर द्या (3-6 छोट्या ओळी). "
        "पीक काळजी, सिंचन, खताचे प्रमाण, कीड/रोग नियंत्रण, पेरणी वेळा, "
        "हवामान सल्ला व शेती नियोजन यावर लक्ष द्या. "
        "अंदाजाने डोस देऊ नका — शंका असल्यास जवळच्या KVK शी संपर्क साधण्याचा सल्ला द्या."
    ),
}

FALLBACK_REPLIES = {
    "en": "I'm running in offline mode right now. Quick tips: water early morning, rotate crops, and photograph any pest damage to show your local KVK. Please try again shortly.",
    "hi": "अभी मैं ऑफ़लाइन मोड में हूँ। सुझाव: सुबह सिंचाई करें, फसल बदलें, कीट नुकसान की फोटो रखें और KVK को दिखाएँ। कृपया कुछ देर बाद पुनः प्रयास करें।",
    "mr": "सध्या मी ऑफलाइन मोडमध्ये आहे. सल्ला: सकाळी पाणी द्या, पीक बदला, किडीचे फोटो काढून KVK ला दाखवा. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.",
}


def normalise_language(value: str | None) -> str:
    if not value:
        return "en"
    v = value.strip().lower()
    if v in {"hi", "hindi", "हिंदी", "हिन्दी"}:
        return "hi"
    if v in {"mr", "marathi", "मराठी"}:
        return "mr"
    return "en"


async def _call_llm(message: str, language: str, session_id: str, history: list[dict]) -> str:
    from emergentintegrations.llm.chat import LlmChat, UserMessage  # type: ignore

    key = os.environ.get("EMERGENT_LLM_KEY", "").strip()
    if not key:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")

    chat = LlmChat(
        api_key=key,
        session_id=session_id,
        system_message=SYSTEM_PROMPTS[language],
    ).with_model(
        os.environ.get("AI_PROVIDER", "gemini"),
        os.environ.get("AI_MODEL", "gemini-2.5-flash"),
    )

    transcript = ""
    for turn in (history or [])[-6:]:
        role = turn.get("role", "user")
        content = str(turn.get("content", "")).strip()
        if not content:
            continue
        transcript += f"{'User' if role == 'user' else 'Assistant'}: {content}\n"
    transcript += f"User: {message.strip()}"

    response = await chat.send_message(UserMessage(text=transcript))
    return str(response).strip()


def generate_reply(payload: dict[str, Any]) -> dict[str, Any]:
    message = str(payload.get("message", "")).strip()
    if not message:
        return {"error": "message is required"}, 400  # type: ignore[return-value]
    language = normalise_language(payload.get("language"))
    session_id = str(payload.get("session_id") or f"krishi-{uuid.uuid4().hex[:12]}")
    history = payload.get("history") or []

    try:
        reply = asyncio.run(_call_llm(message, language, session_id, history))
        source = "llm"
    except Exception as exc:  # noqa: BLE001
        logger.warning("LLM call failed on Vercel function: %s", exc)
        reply = FALLBACK_REPLIES[language]
        source = "fallback"

    return {
        "reply": reply,
        "language": language,
        "session_id": session_id,
        "source": source,
    }


class handler(BaseHTTPRequestHandler):  # noqa: N801 — Vercel requires this name
    def _cors(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self) -> None:  # noqa: N802
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length).decode("utf-8") if length else "{}"
            payload = json.loads(raw or "{}")
        except (ValueError, json.JSONDecodeError):
            self.send_response(400)
            self._cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "invalid JSON"}).encode("utf-8"))
            return

        body = generate_reply(payload)
        status = 400 if isinstance(body, tuple) else 200
        if isinstance(body, tuple):
            body = body[0]

        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(body, ensure_ascii=False).encode("utf-8"))
