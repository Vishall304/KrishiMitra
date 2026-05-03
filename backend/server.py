<<<<<<< HEAD

=======
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
"""
KrishiMitra / AgriSathi backend.

Purpose: expose `/api/ai/chat` for the React frontend's AI assistant.
- Multilingual (Hindi / Marathi / English) farming advisor.
- Uses the Emergent Universal Key via `emergentintegrations` (Gemini 2.5 Flash default).
- Gracefully falls back to a local mock when the key is missing or the provider errors.
- Chat history is stored in Firestore by the frontend; this service is stateless.
"""
<<<<<<< HEAD
from __future__ import annotations 
import os
import uuid
import logging
import google.generativeai as genai
from fastapi import APIRouter, FastAPI, HTTPException, UploadFile, File, Form
import json
from typing import Literal, Optional
from dotenv import load_dotenv
=======

from __future__ import annotations

import logging
import os
import uuid
from typing import Literal, Optional

from dotenv import load_dotenv

load_dotenv()

from fastapi import APIRouter, FastAPI, HTTPException
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
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
<<<<<<< HEAD
load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
DEFAULT_MODEL_NAME = "gemini-2.5-flash"
CORS_ORIGINS = [
    o.strip()
    for o in os.environ.get("CORS_ORIGINS", "*").split(",")
    if o.strip()
]
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
=======

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "").strip()
DEFAULT_MODEL_PROVIDER = os.environ.get("AI_PROVIDER", "gemini")
DEFAULT_MODEL_NAME = os.environ.get("AI_MODEL", "gemini-2.5-flash")
CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()]
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3


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

<<<<<<< HEAD
class DiseaseAnalysisResponse(BaseModel):
    crop: str
    disease: str
    confidence: str
    urgency: str
    symptoms: list[str]
    causes: list[str]
    next_steps: list[str]
    prevention: list[str]
    language: Literal["en", "hi", "mr"]
    source: Literal["llm", "fallback"]
=======

>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
# ---------------------------------------------------------------------------
# LLM call
# ---------------------------------------------------------------------------

async def call_llm(prompt: str, language: str, session_id: str, history: list[ChatMessage]) -> str:
<<<<<<< HEAD
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    print("USING MODEL:", DEFAULT_MODEL_NAME)
    print("KEY LOADED:", bool(GEMINI_API_KEY))

    model = genai.GenerativeModel(
        DEFAULT_MODEL_NAME,
        system_instruction="You are an expert agriculture scientist. Always give detailed structured analysis."
    )

=======
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
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
    transcript = ""
    for turn in history[-6:]:
        speaker = "User" if turn.role == "user" else "Assistant"
        transcript += f"{speaker}: {turn.content.strip()}\n"
    transcript += f"User: {prompt.strip()}"

<<<<<<< HEAD
    try:
        response = model.generate_content(transcript)
        print("RAW GEMINI RESPONSE:", response)
        return response.text.strip()
    except Exception as exc:
        print("GEMINI ERROR:", repr(exc))
        raise

async def call_vision_llm(image_bytes: bytes, mime_type: str, language: str, crop: str = "") -> dict:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    model = genai.GenerativeModel(
        DEFAULT_MODEL_NAME,
        system_instruction=SYSTEM_PROMPTS[language],
    )

    # 🚀 ULTRA UPGRADED PROMPT
    prompt = f"""
You are KrishiMitra AI — an expert agricultural scientist helping Indian farmers.

Analyze the crop/plant image deeply and give a professional diagnosis.

Crop hint: {crop or "unknown"}

⚠️ Return ONLY valid JSON in this exact structure:

{{
  "crop": "exact crop name",
  "disease": "specific disease/pest/nutrient deficiency",
  "confidence": "low/medium/high",
  "urgency": "low/medium/high",

  "symptoms": [
    "detailed visible symptom 1",
    "detailed visible symptom 2",
    "pattern on leaves/stem/fruit"
  ],

  "causes": [
    "exact biological reason (fungus, pest, bacteria, deficiency)",
    "environmental reason (soil, irrigation, humidity)"
  ],

  "next_steps": [
    "step-by-step treatment",
    "immediate action farmer should take",
    "spray or solution guidance (NO exact chemical dosage)"
  ],

  "prevention": [
    "future prevention method",
    "best farming practices"

    
  ]
}}

🔥 VERY IMPORTANT:
- Give DETAILED explanation (not short)
- Answer in {language}
- Act like an agriculture expert
- If image unclear → say LOW confidence and ask for better image
- NEVER give fake chemical quantities
"""

    try:
        response = model.generate_content([
            prompt,
            {
                "mime_type": mime_type,
                "data": image_bytes,
            },
        ])

        text = response.text.strip()

        # remove markdown if exists
        if text.startswith("```"):
            text = text.replace("```json", "").replace("```", "").strip()

        result = json.loads(text)

        # 🧠 SAFE GUARD (missing fields fix)
        return {
            "crop": result.get("crop", crop or "unknown"),
            "disease": result.get("disease", "Not identified clearly"),
            "confidence": result.get("confidence", "low"),
            "urgency": result.get("urgency", "medium"),
            "symptoms": result.get("symptoms", []),
            "causes": result.get("causes", []),
            "next_steps": result.get("next_steps", []),
            "prevention": result.get("prevention", []),
        }

    except Exception as e:
        logger.exception("Vision AI failed, using fallback")

        return {
            "crop": crop or "unknown",
            "disease": "Image analysis failed",
            "confidence": "low",
            "urgency": "medium",
            "symptoms": ["Unable to analyze image clearly"],
            "causes": ["Image may be blurry or unclear"],
            "next_steps": [
                "Upload a clearer close-up image",
                "Capture leaf front and back",
                "Ensure good lighting"
            ],
            "prevention": ["Maintain healthy crop conditions"],
        }
=======
    response = await chat.send_message(UserMessage(text=transcript))
    return str(response).strip()


>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
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
<<<<<<< HEAD
        "llm_configured": bool(GEMINI_API_KEY),
        "model": f"gemini:{DEFAULT_MODEL_NAME}",
    }

@api_router.get("/ai/models")
async def list_models():
    models = []
    for m in genai.list_models():
        methods = getattr(m, "supported_generation_methods", [])
        if "generateContent" in methods:
            models.append({
                "name": m.name,
                "methods": methods
            })
    return {"models": models}
=======
        "llm_configured": bool(EMERGENT_LLM_KEY),
        "model": f"{DEFAULT_MODEL_PROVIDER}:{DEFAULT_MODEL_NAME}",
    }

>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3

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
<<<<<<< HEAD
    except Exception as exc:
        print("GEMINI ERROR:", repr(exc))
        logger.exception("LLM call failed, serving fallback")
=======
    except Exception as exc:  # noqa: BLE001 — we want any failure to degrade gracefully
        logger.warning("LLM call failed, serving fallback: %s", exc)
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
        reply = FALLBACK_REPLIES[language]
        source = "fallback"

    return ChatResponse(
        reply=reply,
        language=language,
        session_id=session_id,
        source=source,
    )

<<<<<<< HEAD
@api_router.post("/ai/disease", response_model=DiseaseAnalysisResponse)
async def analyze_disease(
    image: UploadFile = File(...),
    language: str = Form("en"),
    crop: str = Form(""),
) -> DiseaseAnalysisResponse:
    lang = normalise_language(language)

    try:
        image_bytes = await image.read()

        if not image.content_type or not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Please upload a valid image file")

        result = await call_vision_llm(
            image_bytes=image_bytes,
            mime_type=image.content_type,
            language=lang,
            crop=crop,
        )

        return DiseaseAnalysisResponse(
            crop=result.get("crop", crop or "unknown"),
            disease=result.get("disease", "Unable to identify clearly"),
            confidence=result.get("confidence", "low"),
            urgency=result.get("urgency", "medium"),
            symptoms=result.get("symptoms", []),
            causes=result.get("causes", []),
            next_steps=result.get("next_steps", []),
            prevention=result.get("prevention", []),
            language=lang,
            source="llm",
        )

    except HTTPException:
        raise
    except Exception:
        logger.exception("Disease image analysis failed")

        fallback = {
            "en": {
                "disease": "Image analysis is unavailable right now",
                "next_steps": [
                    "Take a clear close-up photo",
                    "Check both sides of leaves",
                    "Consult nearest KVK for exact diagnosis",
                ],
            },
            "hi": {
                "disease": "अभी इमेज विश्लेषण उपलब्ध नहीं है",
                "next_steps": [
                    "साफ़ क्लोज़-अप फोटो लें",
                    "पत्तों के दोनों तरफ जांच करें",
                    "सटीक सलाह के लिए नज़दीकी KVK से संपर्क करें",
                ],
            },
            "mr": {
                "disease": "सध्या इमेज विश्लेषण उपलब्ध नाही",
                "next_steps": [
                    "स्पष्ट जवळचा फोटो काढा",
                    "पानांच्या दोन्ही बाजू तपासा",
                    "अचूक सल्ल्यासाठी जवळच्या KVK शी संपर्क साधा",
                ],
            },
        }[lang]

        return DiseaseAnalysisResponse(
            crop=crop or "unknown",
            disease=fallback["disease"],
            confidence="low",
            urgency="medium",
            symptoms=[],
            causes=[],
            next_steps=fallback["next_steps"],
            prevention=[],
            language=lang,
            source="fallback",
        )
=======

>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
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
<<<<<<< HEAD
        bool(GEMINI_API_KEY),
        "gemini",
        DEFAULT_MODEL_NAME,
    )

=======
        bool(EMERGENT_LLM_KEY),
        DEFAULT_MODEL_PROVIDER,
        DEFAULT_MODEL_NAME,
    )
>>>>>>> f23ad11e638ed9dd75ca892b2f7fcb91e47d09b3
