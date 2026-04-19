# Krishi Voice Agent - Product Requirements Document

## Original Problem Statement
Build a complete, polished, hackathon-ready, production-style web app called Krishi Voice Agent - a multilingual voice-first AI farming assistant for Indian farmers. Features include:
- Voice-first interaction in Hindi, Marathi, English
- Crop disease detection with image analysis
- Weather-based farming advice
- Smart farming reminders
- Market connect for selling produce
- Full onboarding flow with authentication

## Architecture
- **Frontend**: React with Tailwind CSS, Mobile-first design (max-w-md)
- **Backend**: FastAPI with MongoDB
- **AI**: Google Gemini via Emergent LLM Key for chat and image analysis
- **Weather**: Open-Meteo API for real-time weather data
- **Voice**: Web Speech API for recognition and synthesis
- **Auth**: JWT with httpOnly cookies

## User Personas
1. **Small-scale Farmer**: Uses voice primarily, needs simple UI, multilingual support
2. **Tech-savvy Farmer**: Uses all features, uploads images, creates reminders
3. **Market Seller**: Focuses on market listings and buyer connections

## Core Requirements (Static)
- [ ] Splash/Welcome screen
- [ ] Language selection (Hindi, Marathi, English)
- [ ] JWT Authentication (Login/Signup/Guest)
- [ ] Profile setup with farmer details
- [ ] Agent home with quick actions
- [ ] Disease analysis with image upload
- [ ] Weather advisory with farming tips
- [ ] Smart reminders system
- [ ] Market listings
- [ ] Profile management
- [ ] Floating voice assistant on all screens

## What's Been Implemented (April 7, 2026)

### Backend
- ✅ FastAPI server with MongoDB integration
- ✅ JWT authentication (register, login, logout, guest mode)
- ✅ User profile CRUD
- ✅ Reminders CRUD with priority levels
- ✅ Market listings CRUD
- ✅ Weather proxy to Open-Meteo API
- ✅ AI chat with Gemini (with fallback responses)
- ✅ Disease analysis with Gemini Vision (with mock fallback)
- ✅ Proactive alerts endpoint
- ✅ Chat history storage

### Frontend
- ✅ Mobile-first responsive design
- ✅ Splash screen with background image
- ✅ Language selection with 3 languages
- ✅ Premium auth screens (Login/Signup tabs)
- ✅ Profile setup form
- ✅ Agent home with greeting, quick actions, alerts, tips
- ✅ Disease analysis with camera/upload
- ✅ Weather advisory with farming advice
- ✅ Reminders with tabs (Today/Upcoming/Completed)
- ✅ Market connect with listings and nearby buyers
- ✅ Profile page with edit mode
- ✅ Bottom navigation (6 tabs)
- ✅ Floating voice button
- ✅ Voice overlay with text fallback
- ✅ Full translation system for all 3 languages

### API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/guest
- GET /api/auth/me
- GET/PUT /api/profile
- GET/POST/PUT/DELETE /api/reminders
- GET/POST/DELETE /api/market/listings
- GET /api/market/my-listings
- GET /api/weather
- POST /api/chat
- POST /api/analyze-disease
- GET /api/alerts
- GET /api/health

## Prioritized Backlog

### P0 (Critical) - DONE
- Authentication flow
- Main app navigation
- Voice assistant overlay
- Weather API integration

### P1 (High Priority)
- [ ] Push notifications for reminders
- [ ] Offline mode with service worker
- [ ] Image compression before upload
- [ ] Voice command parsing for reminders

### P2 (Medium Priority)
- [ ] Chat history display on home screen
- [ ] Disease analysis history gallery
- [ ] Market price trends visualization
- [ ] Regional crop recommendations

### P3 (Future)
- [ ] Community forum
- [ ] Expert consultation booking
- [ ] Crop calendar integration
- [ ] Government scheme information

## Test Credentials
- Admin: admin@krishi.app / admin123
- Test: test@krishi.app / test123

## Technical Notes
- EMERGENT_LLM_KEY configured in backend/.env
- Voice works best in Chrome
- Text fallback available for all browsers
- Mock data fallbacks for demo safety
