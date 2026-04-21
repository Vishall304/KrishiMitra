"""
KrishiMitra / AgriSathi backend.

Purpose: expose `/api/ai/chat` for the React frontend's AI assistant.
- Multilingual (Hindi / Marathi / English) farming advisor.
- Uses the Emergent Universal Key via `emergentintegrations` (Gemini 2.5 Flash default).
- Gracefully falls back to a local mock when the key is missing or the provider errors.
- Chat history is stored in Firestore by the frontend; this service is stateless.
"""

from __future__ import annotations

import logging
import os
import uuid
from typing import Literal, Optional

from dotenv import load_dotenv

load_dotenv()

from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("krishimitra")


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "").strip()
DEFAULT_MODEL_PROVIDER = os.environ.get("AI_PROVIDER", "gemini")
DEFAULT_MODEL_NAME = os.environ.get("AI_MODEL", "gemini-2.5-flash")
CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()]


# ---------------------------------------------------------------------------
# System prompts per language
# ---------------------------------------------------------------------------

SYSTEM_PROMPTS = {
    "en": (
        "You are KrishiMitra, a practical farming assistant for small Indian farmers. "
        "Answer clearly and briefly (3-6 short lines) in plain English. "
        "Focus on: crop care, irrigation, fertilizer doses, pest / disease control, "
        "sowing dates, weather-based advice, and general farm planning. "
        "Use local crop names when helpful. If a question needs a photo or soil test, say so. "
        "Never invent dosages — if unsure, recommend consulting a local Krishi Vigyan Kendra."
    ),
    "hi": (
        "आप KrishiMitra हैं — भारतीय छोटे किसानों के लिए एक व्यावहारिक कृषि सहायक। "
        "सरल हिंदी में संक्षिप्त उत्तर दें (3-6 छोटी पंक्तियाँ)। "
        "फसल देखभाल, सिंचाई, खाद की मात्रा, कीट/रोग नियंत्रण, बुवाई समय, "
        "मौसम-आधारित सलाह और फार्म योजना पर ध्यान दें। "
        "अगर फोटो या मिट्टी परीक्षण चाहिए तो स्पष्ट बताएं। "
        "अनुमान से कोई मात्रा न बताएं — संदेह हो तो नजदीकी KVK से संपर्क करने की सलाह दें।"
    ),
    "mr": (
        "तुम्ही KrishiMitra आहात — भारतीय लहान शेतकऱ्यांसाठी व्यावहारिक कृषी सहाय्यक. "
        "साध्या मराठीत थोडक्यात उत्तर द्या (3-6 छोट्या ओळी). "
        "पीक काळजी, सिंचन, खताचे प्रमाण, कीड/रोग नियंत्रण, पेरणी वेळा, "
        "हवामानानुसार सल्ला व शेती नियोजन यावर लक्ष द्या. "
        "फोटो किंवा माती परीक्षण लागल्यास स्पष्ट सांगा. "
        "अंदाजाने डोस देऊ नका — शंका असल्यास जवळच्या KVK शी संपर्क साधण्याचा सल्ला द्या."
    ),
}


# ---------------------------------------------------------------------------
# Fallback replies used when the LLM is unavailable
# ---------------------------------------------------------------------------

FALLBACK_REPLIES = {
    "en": (
        "I'm running in offline mode right now. Quick tips: water early morning, "
        "rotate crops each season, and take a photo of any pest damage so you can "
        "show it to your local KVK. Please try again in a moment for a detailed answer."
    ),
    "hi": (
        "अभी मैं ऑफ़लाइन मोड में हूँ। त्वरित सुझाव: सुबह-सुबह सिंचाई करें, "
        "हर मौसम में फसल बदलें, और किसी भी कीट/रोग की फोटो लें ताकि आप उसे "
        "नज़दीकी KVK को दिखा सकें। विस्तृत उत्तर के लिए कुछ देर बाद दुबारा प्रयास करें।"
    ),
    "mr": (
        "सध्या मी ऑफलाइन मोडमध्ये आहे. झटपट सल्ला: सकाळी लवकर पाणी द्या, "
        "प्रत्येक हंगामात पिक बदला, आणि किडीचे फोटो काढून जवळच्या KVK ला दाखवा. "
        "सविस्तर उत्तरासाठी काही वेळाने पुन्हा प्रयत्न करा."
    ),
}


def normalise_language(value: Optional[str]) -> Literal["en", "hi", "mr"]:
    """Map arbitrary language labels (from the UI) to our 3 supported codes."""
    if not value:
        return "en"
    v = value.strip().lower()
    if v in {"hi", "hindi", "हिंदी", "हिन्दी"}:
        return "hi"
    if v in {"mr", "marathi", "मराठी"}:
        return "mr"
    return "en"


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    language: Optional[str] = "en"
    session_id: Optional[str] = None
    history: Optional[list[ChatMessage]] = None  # last N turns from the client


class ChatResponse(BaseModel):
    reply: str
    language: Literal["en", "hi", "mr"]
    session_id: str
    source: Literal["llm", "fallback"]


# ---------------------------------------------------------------------------
# LLM call
# ---------------------------------------------------------------------------

async def call_llm(prompt: str, language: str, session_id: str, history: list[ChatMessage]) -> str:
    """Send one user turn to the LLM. Raises on failure so the caller can fall back."""
    if not EMERGENT_LLM_KEY:
        raise RuntimeError("EMERGENT_LLM_KEY is not configured")

    # Lazy import so the server still boots without the package in dev.
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=SYSTEM_PROMPTS[language],
    ).with_model(DEFAULT_MODEL_PROVIDER, DEFAULT_MODEL_NAME)

    # Prepend prior turns as a short transcript (keeps context without exceeding budget).
    transcript = ""
    for turn in history[-6:]:
        speaker = "User" if turn.role == "user" else "Assistant"
        transcript += f"{speaker}: {turn.content.strip()}\n"
    transcript += f"User: {prompt.strip()}"

    response = await chat.send_message(UserMessage(text=transcript))
    return str(response).strip()


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="KrishiMitra AI API", version="1.0.0")
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def health() -> dict:
    return {
        "status": "ok",
        "service": "krishimitra-ai",
        "llm_configured": bool(EMERGENT_LLM_KEY),
        "model": f"{DEFAULT_MODEL_PROVIDER}:{DEFAULT_MODEL_NAME}",
    }


@api_router.post("/ai/chat", response_model=ChatResponse)
async def ai_chat(payload: ChatRequest) -> ChatResponse:
    language = normalise_language(payload.language)
    session_id = payload.session_id or f"krishi-{uuid.uuid4().hex[:12]}"
    history = payload.history or []

    try:
        reply = await call_llm(payload.message, language, session_id, history)
        if not reply:
            raise RuntimeError("Empty LLM response")
        source: Literal["llm", "fallback"] = "llm"
    except Exception as exc:  # noqa: BLE001 — we want any failure to degrade gracefully
        logger.warning("LLM call failed, serving fallback: %s", exc)
        reply = FALLBACK_REPLIES[language]
        source = "fallback"

    return ChatResponse(
        reply=reply,
        language=language,
        session_id=session_id,
        source=source,
    )


# ---------------------------------------------------------------------------
# Weather placeholder (keeps the UI stable until a real provider is wired)
# ---------------------------------------------------------------------------

class WeatherSnapshot(BaseModel):
    place: str
    temp_c: float
    condition: str
    humidity: int
    rain_chance: int
    source: Literal["mock", "live"] = "mock"


@api_router.get("/weather", response_model=WeatherSnapshot)
async def weather(place: str = "Pune Region") -> WeatherSnapshot:
    """Deterministic mock weather — swap for a real provider later without UI change."""
    return WeatherSnapshot(
        place=place,
        temp_c=32.0,
        condition="Partly cloudy",
        humidity=58,
        rain_chance=30,
        source="mock",
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup() -> None:
    logger.info(
        "KrishiMitra AI API ready (llm_configured=%s, model=%s:%s)",
        bool(EMERGENT_LLM_KEY),
        DEFAULT_MODEL_PROVIDER,
        DEFAULT_MODEL_NAME,
    )
