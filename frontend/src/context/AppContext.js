import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

// Translation dictionary
const translations = {
  en: {
    // Common
    app_name: "Krishi Voice Agent",
    tagline: "Your AI Farming Assistant",
    continue: "Continue",
    skip: "Skip",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    
    // Navigation
    nav_agent: "Agent",
    nav_disease: "Disease",
    nav_weather: "Weather",
    nav_reminders: "Reminders",
    nav_market: "Market",
    nav_profile: "Profile",
    
    // Splash
    splash_subtitle: "Voice-first AI Assistant for Indian Farmers",
    splash_description: "Get farming advice, check crop health, and connect with markets - all through voice",
    get_started: "Get Started",
    
    // Language Selection
    select_language: "Select Your Language",
    tap_or_say: "Tap or say your preferred language",
    
    // Auth
    login: "Login",
    signup: "Sign Up",
    email: "Email",
    password: "Password",
    confirm_password: "Confirm Password",
    name: "Full Name",
    phone: "Phone Number",
    forgot_password: "Forgot Password?",
    no_account: "Don't have an account?",
    have_account: "Already have an account?",
    continue_as_guest: "Continue as Guest",
    login_success: "Login successful!",
    signup_success: "Account created successfully!",
    
    // Profile Setup
    setup_profile: "Setup Your Profile",
    profile_subtitle: "Help us personalize your experience",
    village: "Village / Town",
    district: "District",
    state: "State",
    primary_crop: "Primary Crop",
    land_size: "Land Size (acres)",
    farming_type: "Farming Type",
    organic: "Organic",
    conventional: "Conventional",
    mixed: "Mixed",
    
    // Agent Home
    greeting: "Hello",
    how_can_help: "How can I help you today?",
    tap_to_speak: "Tap to speak",
    quick_actions: "Quick Actions",
    check_disease: "Check Crop Disease",
    weather_advice: "Weather Advice",
    set_reminder: "Set Reminder",
    sell_produce: "Sell Produce",
    recent_alerts: "Recent Alerts",
    todays_tips: "Today's Tips",
    
    // Disease
    disease_title: "Crop Disease Analysis",
    disease_subtitle: "Upload or capture image of affected crop",
    take_photo: "Take Photo",
    upload_image: "Upload Image",
    analyzing: "Analyzing...",
    analysis_result: "Analysis Result",
    disease_name: "Disease",
    confidence: "Confidence",
    severity: "Severity",
    treatment: "Treatment",
    prevention: "Prevention",
    set_treatment_reminder: "Set Treatment Reminder",
    recent_analyses: "Recent Analyses",
    
    // Weather
    weather_title: "Weather Advisory",
    current_weather: "Current Weather",
    temperature: "Temperature",
    humidity: "Humidity",
    wind_speed: "Wind Speed",
    precipitation: "Precipitation",
    farming_advice: "Farming Advice",
    forecast: "3-Day Forecast",
    
    // Reminders
    reminders_title: "Farming Reminders",
    add_reminder: "Add Reminder",
    add_by_voice: "Add by Voice",
    today: "Today",
    upcoming: "Upcoming",
    completed: "Completed",
    no_reminders: "No reminders yet",
    reminder_title: "Reminder Title",
    reminder_time: "Time",
    reminder_priority: "Priority",
    high: "High",
    medium: "Medium",
    low: "Low",
    
    // Market
    market_title: "Market Connect",
    sell_your_produce: "Sell Your Produce",
    create_listing: "Create Listing",
    active_listings: "Active Listings",
    crop_name: "Crop Name",
    quantity: "Quantity",
    expected_price: "Expected Price",
    nearby_buyers: "Nearby Buyers",
    market_trends: "Market Trends",
    no_listings: "No active listings",
    
    // Profile
    profile_title: "My Profile",
    edit_profile: "Edit Profile",
    language_preference: "Language",
    logout: "Logout",
    app_settings: "Settings",
    
    // Voice
    listening: "Listening...",
    speak_now: "Speak now",
    processing: "Processing...",
    voice_not_supported: "Voice not supported in this browser",
    type_message: "Type your message...",
  },
  hi: {
    // Common
    app_name: "कृषि वॉइस एजेंट",
    tagline: "आपका AI खेती सहायक",
    continue: "जारी रखें",
    skip: "छोड़ें",
    save: "सहेजें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    edit: "संपादित करें",
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफल",
    
    // Navigation
    nav_agent: "एजेंट",
    nav_disease: "रोग",
    nav_weather: "मौसम",
    nav_reminders: "रिमाइंडर",
    nav_market: "मार्केट",
    nav_profile: "प्रोफाइल",
    
    // Splash
    splash_subtitle: "भारतीय किसानों के लिए वॉइस-फर्स्ट AI सहायक",
    splash_description: "खेती सलाह प्राप्त करें, फसल स्वास्थ्य जांचें, और बाजारों से जुड़ें - सब कुछ आवाज से",
    get_started: "शुरू करें",
    
    // Language Selection
    select_language: "अपनी भाषा चुनें",
    tap_or_say: "अपनी पसंदीदा भाषा टैप करें या बोलें",
    
    // Auth
    login: "लॉगिन",
    signup: "साइन अप",
    email: "ईमेल",
    password: "पासवर्ड",
    confirm_password: "पासवर्ड की पुष्टि करें",
    name: "पूरा नाम",
    phone: "फोन नंबर",
    forgot_password: "पासवर्ड भूल गए?",
    no_account: "खाता नहीं है?",
    have_account: "पहले से खाता है?",
    continue_as_guest: "अतिथि के रूप में जारी रखें",
    login_success: "लॉगिन सफल!",
    signup_success: "खाता सफलतापूर्वक बनाया गया!",
    
    // Profile Setup
    setup_profile: "अपनी प्रोफाइल सेट करें",
    profile_subtitle: "अपने अनुभव को व्यक्तिगत बनाने में हमारी मदद करें",
    village: "गांव / कस्बा",
    district: "जिला",
    state: "राज्य",
    primary_crop: "मुख्य फसल",
    land_size: "जमीन का आकार (एकड़)",
    farming_type: "खेती का प्रकार",
    organic: "जैविक",
    conventional: "परंपरागत",
    mixed: "मिश्रित",
    
    // Agent Home
    greeting: "नमस्ते",
    how_can_help: "आज मैं आपकी कैसे मदद कर सकता हूं?",
    tap_to_speak: "बोलने के लिए टैप करें",
    quick_actions: "त्वरित कार्य",
    check_disease: "फसल रोग जांचें",
    weather_advice: "मौसम सलाह",
    set_reminder: "रिमाइंडर सेट करें",
    sell_produce: "उपज बेचें",
    recent_alerts: "हाल के अलर्ट",
    todays_tips: "आज की टिप्स",
    
    // Disease
    disease_title: "फसल रोग विश्लेषण",
    disease_subtitle: "प्रभावित फसल की तस्वीर अपलोड या कैप्चर करें",
    take_photo: "फोटो लें",
    upload_image: "चित्र अपलोड करें",
    analyzing: "विश्लेषण हो रहा है...",
    analysis_result: "विश्लेषण परिणाम",
    disease_name: "रोग",
    confidence: "विश्वास",
    severity: "गंभीरता",
    treatment: "उपचार",
    prevention: "रोकथाम",
    set_treatment_reminder: "उपचार रिमाइंडर सेट करें",
    recent_analyses: "हाल के विश्लेषण",
    
    // Weather
    weather_title: "मौसम सलाह",
    current_weather: "वर्तमान मौसम",
    temperature: "तापमान",
    humidity: "नमी",
    wind_speed: "हवा की गति",
    precipitation: "वर्षा",
    farming_advice: "खेती सलाह",
    forecast: "3-दिन का पूर्वानुमान",
    
    // Reminders
    reminders_title: "खेती रिमाइंडर",
    add_reminder: "रिमाइंडर जोड़ें",
    add_by_voice: "आवाज से जोड़ें",
    today: "आज",
    upcoming: "आगामी",
    completed: "पूर्ण",
    no_reminders: "अभी कोई रिमाइंडर नहीं",
    reminder_title: "रिमाइंडर शीर्षक",
    reminder_time: "समय",
    reminder_priority: "प्राथमिकता",
    high: "उच्च",
    medium: "मध्यम",
    low: "निम्न",
    
    // Market
    market_title: "मार्केट कनेक्ट",
    sell_your_produce: "अपनी उपज बेचें",
    create_listing: "लिस्टिंग बनाएं",
    active_listings: "सक्रिय लिस्टिंग",
    crop_name: "फसल का नाम",
    quantity: "मात्रा",
    expected_price: "अपेक्षित कीमत",
    nearby_buyers: "आसपास के खरीदार",
    market_trends: "बाजार रुझान",
    no_listings: "कोई सक्रिय लिस्टिंग नहीं",
    
    // Profile
    profile_title: "मेरी प्रोफाइल",
    edit_profile: "प्रोफाइल संपादित करें",
    language_preference: "भाषा",
    logout: "लॉगआउट",
    app_settings: "सेटिंग्स",
    
    // Voice
    listening: "सुन रहा हूं...",
    speak_now: "अभी बोलें",
    processing: "प्रोसेसिंग...",
    voice_not_supported: "इस ब्राउज़र में आवाज़ समर्थित नहीं है",
    type_message: "अपना संदेश टाइप करें...",
  },
  mr: {
    // Common
    app_name: "कृषी व्हॉइस एजंट",
    tagline: "तुमचा AI शेती सहाय्यक",
    continue: "पुढे जा",
    skip: "वगळा",
    save: "जतन करा",
    cancel: "रद्द करा",
    delete: "हटवा",
    edit: "संपादित करा",
    loading: "लोड होत आहे...",
    error: "त्रुटी",
    success: "यशस्वी",
    
    // Navigation
    nav_agent: "एजंट",
    nav_disease: "रोग",
    nav_weather: "हवामान",
    nav_reminders: "स्मरणपत्रे",
    nav_market: "बाजार",
    nav_profile: "प्रोफाइल",
    
    // Splash
    splash_subtitle: "भारतीय शेतकऱ्यांसाठी व्हॉइस-फर्स्ट AI सहाय्यक",
    splash_description: "शेती सल्ला मिळवा, पीक आरोग्य तपासा, आणि बाजारपेठांशी जोडा - सर्व आवाजाने",
    get_started: "सुरू करा",
    
    // Language Selection
    select_language: "तुमची भाषा निवडा",
    tap_or_say: "तुमची पसंतीची भाषा टॅप करा किंवा सांगा",
    
    // Auth
    login: "लॉगिन",
    signup: "साइन अप",
    email: "ईमेल",
    password: "पासवर्ड",
    confirm_password: "पासवर्ड पुष्टी करा",
    name: "पूर्ण नाव",
    phone: "फोन नंबर",
    forgot_password: "पासवर्ड विसरलात?",
    no_account: "खाते नाही?",
    have_account: "आधीच खाते आहे?",
    continue_as_guest: "पाहुणे म्हणून पुढे जा",
    login_success: "लॉगिन यशस्वी!",
    signup_success: "खाते यशस्वीरित्या तयार झाले!",
    
    // Profile Setup
    setup_profile: "तुमची प्रोफाइल सेट करा",
    profile_subtitle: "तुमचा अनुभव वैयक्तिकृत करण्यात आम्हाला मदत करा",
    village: "गाव / शहर",
    district: "जिल्हा",
    state: "राज्य",
    primary_crop: "मुख्य पीक",
    land_size: "जमिनीचा आकार (एकर)",
    farming_type: "शेतीचा प्रकार",
    organic: "सेंद्रिय",
    conventional: "पारंपारिक",
    mixed: "मिश्र",
    
    // Agent Home
    greeting: "नमस्कार",
    how_can_help: "आज मी तुमची कशी मदत करू शकतो?",
    tap_to_speak: "बोलण्यासाठी टॅप करा",
    quick_actions: "जलद क्रिया",
    check_disease: "पीक रोग तपासा",
    weather_advice: "हवामान सल्ला",
    set_reminder: "स्मरणपत्र सेट करा",
    sell_produce: "उत्पादन विका",
    recent_alerts: "अलीकडील अलर्ट",
    todays_tips: "आजच्या टिप्स",
    
    // Disease
    disease_title: "पीक रोग विश्लेषण",
    disease_subtitle: "प्रभावित पिकाची प्रतिमा अपलोड करा किंवा कॅप्चर करा",
    take_photo: "फोटो काढा",
    upload_image: "प्रतिमा अपलोड करा",
    analyzing: "विश्लेषण होत आहे...",
    analysis_result: "विश्लेषण निकाल",
    disease_name: "रोग",
    confidence: "विश्वास",
    severity: "तीव्रता",
    treatment: "उपचार",
    prevention: "प्रतिबंध",
    set_treatment_reminder: "उपचार स्मरणपत्र सेट करा",
    recent_analyses: "अलीकडील विश्लेषणे",
    
    // Weather
    weather_title: "हवामान सल्ला",
    current_weather: "सध्याचे हवामान",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    wind_speed: "वाऱ्याचा वेग",
    precipitation: "पाऊस",
    farming_advice: "शेती सल्ला",
    forecast: "3-दिवसांचा अंदाज",
    
    // Reminders
    reminders_title: "शेती स्मरणपत्रे",
    add_reminder: "स्मरणपत्र जोडा",
    add_by_voice: "आवाजाने जोडा",
    today: "आज",
    upcoming: "आगामी",
    completed: "पूर्ण",
    no_reminders: "अद्याप कोणतेही स्मरणपत्र नाही",
    reminder_title: "स्मरणपत्र शीर्षक",
    reminder_time: "वेळ",
    reminder_priority: "प्राधान्य",
    high: "उच्च",
    medium: "मध्यम",
    low: "निम्न",
    
    // Market
    market_title: "मार्केट कनेक्ट",
    sell_your_produce: "तुमचे उत्पादन विका",
    create_listing: "यादी तयार करा",
    active_listings: "सक्रिय याद्या",
    crop_name: "पिकाचे नाव",
    quantity: "प्रमाण",
    expected_price: "अपेक्षित किंमत",
    nearby_buyers: "जवळचे खरेदीदार",
    market_trends: "बाजार ट्रेंड",
    no_listings: "सक्रिय याद्या नाहीत",
    
    // Profile
    profile_title: "माझी प्रोफाइल",
    edit_profile: "प्रोफाइल संपादित करा",
    language_preference: "भाषा",
    logout: "लॉगआउट",
    app_settings: "सेटिंग्ज",
    
    // Voice
    listening: "ऐकत आहे...",
    speak_now: "आता बोला",
    processing: "प्रक्रिया होत आहे...",
    voice_not_supported: "या ब्राउझरमध्ये आवाज समर्थित नाही",
    type_message: "तुमचा संदेश टाइप करा...",
  }
};

export function AppProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('krishi_language') || 'en';
  });
  
  const [onboardingComplete, setOnboardingCompleteState] = useState(() => {
    return localStorage.getItem('krishi_onboarding') === 'true';
  });
  
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);

  // Check voice support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
  }, []);

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    localStorage.setItem('krishi_language', lang);
  }, []);

  const setOnboardingComplete = useCallback((value) => {
    setOnboardingCompleteState(value);
    localStorage.setItem('krishi_onboarding', value ? 'true' : 'false');
  }, []);

  // Translation function
  const t = useCallback((key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  }, [language]);

  // Text-to-speech function
  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language based on app language
      const langMap = {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'mr': 'mr-IN'
      };
      utterance.lang = langMap[language] || 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const value = {
    language,
    setLanguage,
    onboardingComplete,
    setOnboardingComplete,
    t,
    translations: translations[language],
    isVoiceListening,
    setIsVoiceListening,
    voiceTranscript,
    setVoiceTranscript,
    voiceSupported,
    speak,
    stopSpeaking,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
