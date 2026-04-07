from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from bson import ObjectId
import base64
import httpx

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ.get("JWT_SECRET", "default_secret_change_me")

# Create the main app
app = FastAPI(title="Krishi Voice Agent API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# =====================
# MODELS
# =====================

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: Optional[str] = None
    language: Optional[str] = "en"
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    primary_crop: Optional[str] = None
    land_size: Optional[str] = None
    farming_type: Optional[str] = None
    phone: Optional[str] = None

class ReminderCreate(BaseModel):
    title: str
    description: Optional[str] = None
    reminder_time: str
    priority: Optional[str] = "medium"
    category: Optional[str] = "general"

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    reminder_time: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    completed: Optional[bool] = None

class MarketListingCreate(BaseModel):
    crop_name: str
    quantity: str
    unit: Optional[str] = "kg"
    price_per_unit: Optional[float] = None
    description: Optional[str] = None
    location: Optional[str] = None

class ChatMessage(BaseModel):
    message: str
    language: Optional[str] = "en"
    context: Optional[dict] = None

class DiseaseAnalysis(BaseModel):
    image_base64: str
    language: Optional[str] = "en"
    crop_type: Optional[str] = None

# =====================
# PASSWORD UTILITIES
# =====================

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# =====================
# JWT UTILITIES
# =====================

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=60),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(request: Request) -> Optional[dict]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

# =====================
# AUTH ROUTES
# =====================

@api_router.post("/auth/register")
async def register(user_data: UserCreate, response: Response):
    email = user_data.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = hash_password(user_data.password)
    user_doc = {
        "email": email,
        "password_hash": hashed,
        "name": user_data.name,
        "phone": user_data.phone,
        "language": "en",
        "profile_completed": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "role": "user"
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "id": user_id,
        "email": email,
        "name": user_data.name,
        "phone": user_data.phone,
        "language": "en",
        "profile_completed": False,
        "access_token": access_token
    }

@api_router.post("/auth/login")
async def login(user_data: UserLogin, response: Response):
    email = user_data.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "id": user_id,
        "email": user["email"],
        "name": user.get("name", ""),
        "phone": user.get("phone"),
        "language": user.get("language", "en"),
        "profile_completed": user.get("profile_completed", False),
        "village": user.get("village"),
        "district": user.get("district"),
        "state": user.get("state"),
        "primary_crop": user.get("primary_crop"),
        "land_size": user.get("land_size"),
        "farming_type": user.get("farming_type"),
        "access_token": access_token
    }

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

@api_router.post("/auth/guest")
async def guest_login(response: Response):
    """Create a temporary guest session"""
    guest_id = str(uuid.uuid4())
    guest_email = f"guest_{guest_id[:8]}@krishi.app"
    
    user_doc = {
        "email": guest_email,
        "password_hash": hash_password(guest_id),
        "name": "Guest User",
        "language": "en",
        "profile_completed": False,
        "is_guest": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "role": "guest"
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, guest_email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "id": user_id,
        "email": guest_email,
        "name": "Guest User",
        "language": "en",
        "profile_completed": False,
        "is_guest": True,
        "access_token": access_token
    }

# =====================
# PROFILE ROUTES
# =====================

@api_router.put("/profile")
async def update_profile(profile_data: UserProfile, request: Request):
    user = await get_current_user(request)
    user_id = user["_id"]
    
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    update_data["profile_completed"] = True
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0, "_id": 0})
    updated_user["id"] = user_id
    return updated_user

@api_router.get("/profile")
async def get_profile(request: Request):
    user = await get_current_user(request)
    return user

# =====================
# REMINDERS ROUTES
# =====================

@api_router.post("/reminders")
async def create_reminder(reminder_data: ReminderCreate, request: Request):
    user = await get_current_user(request)
    
    reminder_doc = {
        "user_id": user["_id"],
        "title": reminder_data.title,
        "description": reminder_data.description,
        "reminder_time": reminder_data.reminder_time,
        "priority": reminder_data.priority,
        "category": reminder_data.category,
        "completed": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.reminders.insert_one(reminder_doc)
    reminder_doc["id"] = str(result.inserted_id)
    del reminder_doc["_id"]
    return reminder_doc

@api_router.get("/reminders")
async def get_reminders(request: Request):
    user = await get_current_user(request)
    reminders = await db.reminders.find({"user_id": user["_id"]}, {"_id": 0}).to_list(100)
    
    # Get reminders with IDs
    reminders_with_ids = []
    async for reminder in db.reminders.find({"user_id": user["_id"]}):
        reminder["id"] = str(reminder["_id"])
        del reminder["_id"]
        reminders_with_ids.append(reminder)
    
    return reminders_with_ids

@api_router.put("/reminders/{reminder_id}")
async def update_reminder(reminder_id: str, reminder_data: ReminderUpdate, request: Request):
    user = await get_current_user(request)
    
    update_data = {k: v for k, v in reminder_data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.reminders.update_one(
        {"_id": ObjectId(reminder_id), "user_id": user["_id"]},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    return {"message": "Reminder updated", "id": reminder_id}

@api_router.delete("/reminders/{reminder_id}")
async def delete_reminder(reminder_id: str, request: Request):
    user = await get_current_user(request)
    
    result = await db.reminders.delete_one(
        {"_id": ObjectId(reminder_id), "user_id": user["_id"]}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    return {"message": "Reminder deleted"}

# =====================
# MARKET ROUTES
# =====================

@api_router.post("/market/listings")
async def create_listing(listing_data: MarketListingCreate, request: Request):
    user = await get_current_user(request)
    
    listing_doc = {
        "user_id": user["_id"],
        "seller_name": user.get("name", "Anonymous"),
        "crop_name": listing_data.crop_name,
        "quantity": listing_data.quantity,
        "unit": listing_data.unit,
        "price_per_unit": listing_data.price_per_unit,
        "description": listing_data.description,
        "location": listing_data.location or user.get("village", ""),
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.market_listings.insert_one(listing_doc)
    listing_doc["id"] = str(result.inserted_id)
    del listing_doc["_id"]
    return listing_doc

@api_router.get("/market/listings")
async def get_listings(request: Request):
    listings = []
    async for listing in db.market_listings.find({"status": "active"}).sort("created_at", -1).limit(50):
        listing["id"] = str(listing["_id"])
        del listing["_id"]
        listing["user_id"] = str(listing["user_id"])
        listings.append(listing)
    return listings

@api_router.get("/market/my-listings")
async def get_my_listings(request: Request):
    user = await get_current_user(request)
    listings = []
    async for listing in db.market_listings.find({"user_id": user["_id"]}):
        listing["id"] = str(listing["_id"])
        del listing["_id"]
        listing["user_id"] = str(listing["user_id"])
        listings.append(listing)
    return listings

@api_router.delete("/market/listings/{listing_id}")
async def delete_listing(listing_id: str, request: Request):
    user = await get_current_user(request)
    
    result = await db.market_listings.delete_one(
        {"_id": ObjectId(listing_id), "user_id": user["_id"]}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    return {"message": "Listing deleted"}

# =====================
# WEATHER ROUTES
# =====================

@api_router.get("/weather")
async def get_weather(lat: float = 20.5937, lon: float = 78.9629):
    """Get weather data from Open-Meteo API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
                    "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
                    "timezone": "Asia/Kolkata",
                    "forecast_days": 3
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "current": {
                        "temperature": data["current"]["temperature_2m"],
                        "humidity": data["current"]["relative_humidity_2m"],
                        "precipitation": data["current"]["precipitation"],
                        "wind_speed": data["current"]["wind_speed_10m"],
                        "weather_code": data["current"]["weather_code"]
                    },
                    "daily": data.get("daily", {}),
                    "location": {"lat": lat, "lon": lon}
                }
            else:
                # Fallback mock data
                return get_mock_weather()
    except Exception as e:
        logger.error(f"Weather API error: {e}")
        return get_mock_weather()

def get_mock_weather():
    return {
        "current": {
            "temperature": 28,
            "humidity": 65,
            "precipitation": 0,
            "wind_speed": 12,
            "weather_code": 1
        },
        "daily": {
            "time": ["2024-01-15", "2024-01-16", "2024-01-17"],
            "temperature_2m_max": [32, 33, 31],
            "temperature_2m_min": [22, 23, 21],
            "precipitation_probability_max": [10, 30, 60]
        },
        "location": {"lat": 20.5937, "lon": 78.9629},
        "is_mock": True
    }

# =====================
# AI CHAT ROUTES
# =====================

@api_router.post("/chat")
async def chat_with_agent(chat_data: ChatMessage, request: Request):
    """Chat with the AI farming assistant using Gemini"""
    user = await get_optional_user(request)
    
    # Build context from user profile
    profile_context = ""
    if user:
        profile_context = f"""
User Profile:
- Name: {user.get('name', 'Farmer')}
- Primary Crop: {user.get('primary_crop', 'Not specified')}
- Location: {user.get('village', '')}, {user.get('district', '')}, {user.get('state', '')}
- Land Size: {user.get('land_size', 'Not specified')}
- Farming Type: {user.get('farming_type', 'Not specified')}
"""

    language_instruction = {
        "hi": "Respond in Hindi (हिंदी में जवाब दें).",
        "mr": "Respond in Marathi (मराठीत उत्तर द्या).",
        "en": "Respond in English."
    }.get(chat_data.language, "Respond in English.")

    system_prompt = f"""You are Krishi Voice Agent, an AI farming assistant for Indian farmers.
You help with:
- Crop disease identification and treatment
- Weather-based farming advice
- Irrigation and water management
- Pest control recommendations
- Market information and selling advice
- General farming guidance

{language_instruction}

{profile_context}

Be helpful, concise, and practical. Use simple language that farmers can understand.
If asked about specific diseases, give treatment recommendations.
If asked about weather, provide farming-relevant advice.
"""

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise ValueError("EMERGENT_LLM_KEY not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"krishi_{user['_id'] if user else 'guest'}_{datetime.now().timestamp()}",
            system_message=system_prompt
        )
        chat.with_model("gemini", "gemini-3-flash-preview")
        
        user_message = UserMessage(text=chat_data.message)
        response = await chat.send_message(user_message)
        
        # Save chat history
        if user:
            await db.chat_history.insert_one({
                "user_id": user["_id"],
                "message": chat_data.message,
                "response": response,
                "language": chat_data.language,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        
        return {"response": response, "language": chat_data.language}
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        # Fallback responses based on keywords
        return get_fallback_response(chat_data.message, chat_data.language)

def get_fallback_response(message: str, language: str) -> dict:
    """Provide fallback responses when AI is unavailable"""
    message_lower = message.lower()
    
    responses = {
        "en": {
            "weather": "Based on current conditions, ensure proper irrigation in morning hours. Avoid spraying pesticides if rain is expected.",
            "disease": "For crop disease, please share an image of the affected plant. Common treatments include neem-based organic sprays and proper spacing between plants.",
            "water": "Water your crops early morning or late evening to reduce evaporation. Check soil moisture before irrigation.",
            "pest": "For pest control, use integrated pest management. Neem oil spray is effective for many common pests.",
            "sell": "To sell your produce, create a listing with quantity, expected price, and your location. Buyers in your area will contact you.",
            "default": "I'm your farming assistant. I can help with crop diseases, weather advice, reminders, and market connections. How can I help you today?"
        },
        "hi": {
            "weather": "मौसम के अनुसार, सुबह के समय सिंचाई करें। अगर बारिश की संभावना है तो कीटनाशक छिड़काव न करें।",
            "disease": "फसल की बीमारी के लिए, प्रभावित पौधे की तस्वीर भेजें। नीम-आधारित स्प्रे और उचित दूरी रखना लाभदायक है।",
            "water": "अपनी फसलों को सुबह जल्दी या शाम को पानी दें। सिंचाई से पहले मिट्टी की नमी जांचें।",
            "pest": "कीट नियंत्रण के लिए एकीकृत कीट प्रबंधन का उपयोग करें। नीम का तेल कई आम कीटों के लिए प्रभावी है।",
            "sell": "अपनी उपज बेचने के लिए, मात्रा, अपेक्षित कीमत और अपने स्थान के साथ एक लिस्टिंग बनाएं।",
            "default": "मैं आपका कृषि सहायक हूं। फसल रोग, मौसम सलाह, रिमाइंडर और बाजार कनेक्शन में मदद कर सकता हूं। आज मैं आपकी कैसे मदद कर सकता हूं?"
        },
        "mr": {
            "weather": "हवामानानुसार, सकाळी पाणी द्या. पाऊस अपेक्षित असल्यास कीटकनाशक फवारणी टाळा.",
            "disease": "पिकावरील रोगासाठी, प्रभावित रोपाचा फोटो पाठवा. कडुनिंबावर आधारित फवारणी आणि योग्य अंतर फायदेशीर आहे.",
            "water": "तुमच्या पिकांना सकाळी लवकर किंवा संध्याकाळी पाणी द्या. पाणी देण्यापूर्वी मातीचा ओलावा तपासा.",
            "pest": "कीड नियंत्रणासाठी एकात्मिक कीड व्यवस्थापन वापरा. कडुनिंबाचे तेल अनेक सामान्य कीटकांसाठी प्रभावी आहे.",
            "sell": "तुमचे उत्पादन विकण्यासाठी, प्रमाण, अपेक्षित किंमत आणि तुमचे स्थान यासह यादी तयार करा.",
            "default": "मी तुमचा शेती सहाय्यक आहे. पीक रोग, हवामान सल्ला, स्मरणपत्रे आणि बाजार कनेक्शनमध्ये मदत करू शकतो. आज मी तुम्हाला कशी मदत करू शकतो?"
        }
    }
    
    lang_responses = responses.get(language, responses["en"])
    
    # Keyword matching
    if any(kw in message_lower for kw in ["weather", "मौसम", "हवामान", "rain", "बारिश", "पाऊस"]):
        return {"response": lang_responses["weather"], "language": language, "is_fallback": True}
    elif any(kw in message_lower for kw in ["disease", "रोग", "आजार", "sick", "बीमार"]):
        return {"response": lang_responses["disease"], "language": language, "is_fallback": True}
    elif any(kw in message_lower for kw in ["water", "पानी", "पाणी", "irrigation", "सिंचाई"]):
        return {"response": lang_responses["water"], "language": language, "is_fallback": True}
    elif any(kw in message_lower for kw in ["pest", "कीट", "कीड", "insect"]):
        return {"response": lang_responses["pest"], "language": language, "is_fallback": True}
    elif any(kw in message_lower for kw in ["sell", "बेच", "विक", "market", "बाजार"]):
        return {"response": lang_responses["sell"], "language": language, "is_fallback": True}
    else:
        return {"response": lang_responses["default"], "language": language, "is_fallback": True}

# =====================
# DISEASE ANALYSIS ROUTES
# =====================

@api_router.post("/analyze-disease")
async def analyze_disease(analysis_data: DiseaseAnalysis, request: Request):
    """Analyze crop disease from image using Gemini Vision"""
    user = await get_optional_user(request)
    
    language_instruction = {
        "hi": "Respond in Hindi (हिंदी में जवाब दें).",
        "mr": "Respond in Marathi (मराठीत उत्तर द्या).",
        "en": "Respond in English."
    }.get(analysis_data.language, "Respond in English.")
    
    system_prompt = f"""You are an expert agricultural disease analyst for Indian crops.
Analyze the provided crop image and identify any diseases or issues.

{language_instruction}

Provide your analysis in this exact JSON format:
{{
    "disease_name": "Name of the disease or 'Healthy' if no disease",
    "confidence": "High/Medium/Low",
    "severity": "Mild/Moderate/Severe/None",
    "symptoms": ["list", "of", "visible", "symptoms"],
    "treatment": ["step 1", "step 2", "step 3"],
    "prevention": ["tip 1", "tip 2"],
    "urgency": "Immediate/Soon/Monitor/None"
}}

Be accurate and practical. If you cannot identify the issue clearly, indicate low confidence.
"""

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
        
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            raise ValueError("EMERGENT_LLM_KEY not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"disease_{datetime.now().timestamp()}",
            system_message=system_prompt
        )
        chat.with_model("gemini", "gemini-3-flash-preview")
        
        # Create message with image
        image_content = ImageContent(image_base64=analysis_data.image_base64)
        user_message = UserMessage(
            text=f"Analyze this crop image for diseases. Crop type: {analysis_data.crop_type or 'Unknown'}",
            file_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        # Try to parse JSON from response
        import json
        try:
            # Find JSON in response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                analysis_result = json.loads(response[json_start:json_end])
            else:
                analysis_result = {"raw_response": response}
        except json.JSONDecodeError:
            analysis_result = {"raw_response": response}
        
        # Save analysis history
        if user:
            await db.disease_analyses.insert_one({
                "user_id": user["_id"],
                "crop_type": analysis_data.crop_type,
                "result": analysis_result,
                "language": analysis_data.language,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        
        return {"analysis": analysis_result, "language": analysis_data.language}
        
    except Exception as e:
        logger.error(f"Disease analysis error: {e}")
        # Return mock analysis
        return get_mock_disease_analysis(analysis_data.language)

def get_mock_disease_analysis(language: str) -> dict:
    """Return mock disease analysis for demo"""
    if language == "hi":
        return {
            "analysis": {
                "disease_name": "पत्ती झुलसा (Leaf Blight)",
                "confidence": "Medium",
                "severity": "Moderate",
                "symptoms": ["पीले धब्बे", "पत्तियों का मुड़ना", "भूरे किनारे"],
                "treatment": [
                    "प्रभावित पत्तियों को हटाएं",
                    "कॉपर-आधारित फफूंदनाशक का छिड़काव करें",
                    "पौधों के बीच उचित दूरी रखें"
                ],
                "prevention": ["जल निकासी में सुधार करें", "फसल चक्र अपनाएं"],
                "urgency": "Soon"
            },
            "language": language,
            "is_mock": True
        }
    elif language == "mr":
        return {
            "analysis": {
                "disease_name": "पानाचा करपा (Leaf Blight)",
                "confidence": "Medium",
                "severity": "Moderate",
                "symptoms": ["पिवळे डाग", "पाने वाकणे", "तपकिरी कडा"],
                "treatment": [
                    "प्रभावित पाने काढून टाका",
                    "तांबे-आधारित बुरशीनाशक फवारणी करा",
                    "रोपांमध्ये योग्य अंतर ठेवा"
                ],
                "prevention": ["निचरा सुधारा", "पीक फेरपालट करा"],
                "urgency": "Soon"
            },
            "language": language,
            "is_mock": True
        }
    else:
        return {
            "analysis": {
                "disease_name": "Leaf Blight",
                "confidence": "Medium",
                "severity": "Moderate",
                "symptoms": ["Yellow spots", "Curling leaves", "Brown edges"],
                "treatment": [
                    "Remove affected leaves",
                    "Apply copper-based fungicide spray",
                    "Maintain proper spacing between plants"
                ],
                "prevention": ["Improve drainage", "Practice crop rotation"],
                "urgency": "Soon"
            },
            "language": language,
            "is_mock": True
        }

# =====================
# HISTORY ROUTES
# =====================

@api_router.get("/chat-history")
async def get_chat_history(request: Request, limit: int = 20):
    user = await get_current_user(request)
    history = []
    async for chat in db.chat_history.find({"user_id": user["_id"]}).sort("timestamp", -1).limit(limit):
        chat["id"] = str(chat["_id"])
        del chat["_id"]
        chat["user_id"] = str(chat["user_id"])
        history.append(chat)
    return history

@api_router.get("/disease-history")
async def get_disease_history(request: Request, limit: int = 10):
    user = await get_current_user(request)
    history = []
    async for analysis in db.disease_analyses.find({"user_id": user["_id"]}).sort("timestamp", -1).limit(limit):
        analysis["id"] = str(analysis["_id"])
        del analysis["_id"]
        analysis["user_id"] = str(analysis["user_id"])
        history.append(analysis)
    return history

# =====================
# ALERTS ROUTES
# =====================

@api_router.get("/alerts")
async def get_alerts(request: Request):
    """Get proactive alerts for the user"""
    user = await get_optional_user(request)
    
    # Generate contextual alerts
    alerts = []
    
    # Weather-based alert
    try:
        weather = await get_weather()
        if weather["current"]["humidity"] > 80:
            alerts.append({
                "id": "humidity_alert",
                "type": "warning",
                "title": "High Humidity Alert",
                "message": "High humidity may increase fungal disease risk. Monitor crops closely.",
                "category": "weather"
            })
        if weather["current"]["temperature"] > 35:
            alerts.append({
                "id": "heat_alert",
                "type": "warning",
                "title": "Heat Stress Warning",
                "message": "High temperature detected. Ensure adequate irrigation for crops.",
                "category": "weather"
            })
    except:
        pass
    
    # Default helpful tips
    alerts.append({
        "id": "tip_1",
        "type": "info",
        "title": "Farming Tip",
        "message": "Best irrigation time is early morning (5-8 AM) to reduce water loss.",
        "category": "tip"
    })
    
    return alerts

# =====================
# STARTUP
# =====================

@app.on_event("startup")
async def startup_event():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.reminders.create_index("user_id")
    await db.market_listings.create_index("user_id")
    await db.chat_history.create_index("user_id")
    await db.disease_analyses.create_index("user_id")
    
    # Seed admin user
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@krishi.app")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "language": "en",
            "profile_completed": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user created: {admin_email}")
    
    # Write test credentials
    Path("/app/memory").mkdir(exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write(f"""# Test Credentials for Krishi Voice Agent

## Admin Account
- Email: {admin_email}
- Password: {admin_password}
- Role: admin

## Test User
- Email: test@krishi.app
- Password: test123
- Role: user

## Auth Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/auth/guest
""")
    
    logger.info("Krishi Voice Agent API started successfully")

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        os.environ.get("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:3000",
        "https://crops-ai-voice.preview.emergentagent.com"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Root endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "app": "Krishi Voice Agent"}
