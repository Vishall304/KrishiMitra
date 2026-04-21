"""Backend tests for KrishiMitra AI API (iteration 3).

Covers:
- /api/ health + config reporting
- /api/ai/chat success for en / hi / mr, with source='llm'
- /api/ai/chat validation (empty message -> 422)
- /api/ai/chat multi-turn history context retention
- /api/weather deterministic mock
"""
from __future__ import annotations

import os
import re
import uuid

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or \
    "https://7412125f-3f7d-4d5d-b16f-b514b88920cd.preview.emergentagent.com"


# --- Unicode helpers ---------------------------------------------------------
DEVANAGARI_RE = re.compile(r"[\u0900-\u097F]")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- /api/ health ------------------------------------------------------------
class TestHealth:
    def test_health(self, api):
        r = api.get(f"{BASE_URL}/api/", timeout=20)
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "ok"
        assert body["llm_configured"] is True
        assert body["model"] == "gemini:gemini-2.5-flash"


# --- /api/ai/chat ------------------------------------------------------------
class TestAIChat:
    def test_chat_english_llm(self, api):
        sid = f"pytest-{uuid.uuid4().hex[:8]}"
        r = api.post(
            f"{BASE_URL}/api/ai/chat",
            json={
                "message": "Quick irrigation tip for 1 acre tomato in July",
                "language": "en",
                "session_id": sid,
            },
            timeout=60,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["language"] == "en"
        assert body["session_id"] == sid
        assert body["source"] == "llm", f"Expected llm source, got {body}"
        assert isinstance(body["reply"], str) and len(body["reply"].strip()) > 0

    def test_chat_hindi_devanagari(self, api):
        r = api.post(
            f"{BASE_URL}/api/ai/chat",
            json={
                "message": "टमाटर की फसल में सिंचाई कब करें?",
                "language": "हिंदी",
            },
            timeout=60,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["language"] == "hi"
        assert body["source"] == "llm", body
        assert DEVANAGARI_RE.search(body["reply"]), f"No Devanagari chars: {body['reply']}"

    def test_chat_marathi_devanagari(self, api):
        r = api.post(
            f"{BASE_URL}/api/ai/chat",
            json={
                "message": "कांदा पिकासाठी सिंचन सल्ला द्या",
                "language": "मराठी",
            },
            timeout=60,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["language"] == "mr"
        assert body["source"] == "llm", body
        assert DEVANAGARI_RE.search(body["reply"])

    def test_chat_empty_message_422(self, api):
        r = api.post(
            f"{BASE_URL}/api/ai/chat",
            json={"message": "", "language": "en"},
            timeout=20,
        )
        assert r.status_code == 422

    def test_chat_history_context(self, api):
        sid = f"pytest-hist-{uuid.uuid4().hex[:8]}"
        # Prior assistant reply explicitly mentions urea so the follow-up 'and the dosage?'
        # must resolve to urea dosage for the model to demonstrate history use.
        history = [
            {"role": "user", "content": "Which fertilizer is good for 1 acre wheat at tillering stage?"},
            {"role": "assistant", "content": "For 1 acre wheat at tillering, a top-dress of urea is typically recommended."},
        ]
        r = api.post(
            f"{BASE_URL}/api/ai/chat",
            json={
                "message": "And the dosage?",
                "language": "en",
                "session_id": sid,
                "history": history,
            },
            timeout=60,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["source"] == "llm", body
        reply_lower = body["reply"].lower()
        # Must reference the earlier topic (urea / wheat / tillering) - otherwise no context was used.
        assert any(tok in reply_lower for tok in ["urea", "wheat", "tiller", "nitrogen"]), (
            f"Reply did not reference prior context: {body['reply']!r}"
        )


# --- /api/weather ------------------------------------------------------------
class TestWeather:
    def test_weather_mock(self, api):
        r = api.get(f"{BASE_URL}/api/weather", timeout=20)
        assert r.status_code == 200
        body = r.json()
        assert body["source"] == "mock"
        assert body["place"]
        assert isinstance(body["temp_c"], (int, float))
        assert isinstance(body["humidity"], int)
        assert isinstance(body["rain_chance"], int)
        assert body["condition"]
