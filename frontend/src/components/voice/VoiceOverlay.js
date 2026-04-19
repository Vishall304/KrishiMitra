import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Mic, Send, Loader2, Keyboard, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function VoiceOverlay({ isOpen, onClose, onResult }) {
  const navigate = useNavigate();
  const { t, language, isVoiceListening, setIsVoiceListening, voiceSupported, speak, stopSpeaking } = useApp();
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognitionError, setRecognitionError] = useState('');
  
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);
  const retryCountRef = useRef(0);

  // Initialize speech recognition
  useEffect(() => {
    if (!voiceSupported) {
      setShowTextInput(true);
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      
      // Set language
      const langMap = {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'mr': 'mr-IN'
      };
      recognition.lang = langMap[language] || 'en-IN';

      recognition.onstart = () => {
        setIsVoiceListening(true);
        setRecognitionError('');
        retryCountRef.current = 0;
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';
        
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript + ' ';
          } else {
            interim += result[0].transcript;
          }
        }
        
        setTranscript(interim);
        if (final.trim()) {
          setFinalTranscript(prev => prev + final);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'no-speech') {
          // Retry a few times before giving up
          if (retryCountRef.current < 3 && isOpen) {
            retryCountRef.current++;
            setTimeout(() => {
              if (recognitionRef.current && isOpen) {
                try {
                  recognitionRef.current.start();
                } catch (e) {}
              }
            }, 100);
            return;
          }
          setRecognitionError(language === 'hi' ? 'कोई आवाज नहीं सुनाई दी' : language === 'mr' ? 'आवाज ऐकू आला नाही' : 'No speech detected');
        } else if (event.error === 'not-allowed') {
          setRecognitionError(language === 'hi' ? 'माइक्रोफोन की अनुमति नहीं' : language === 'mr' ? 'मायक्रोफोन परवानगी नाही' : 'Microphone permission denied');
          setShowTextInput(true);
        } else if (event.error === 'network') {
          setRecognitionError(language === 'hi' ? 'नेटवर्क त्रुटि' : language === 'mr' ? 'नेटवर्क त्रुटी' : 'Network error');
        }
        
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [voiceSupported, language, setIsVoiceListening, isOpen]);

  // Start listening when overlay opens
  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setFinalTranscript('');
      setResponse('');
      setRecognitionError('');
      
      if (voiceSupported && !showTextInput) {
        setTimeout(() => startListening(), 300);
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      setIsVoiceListening(false);
      stopSpeaking();
    };
  }, [isOpen, voiceSupported, showTextInput, setIsVoiceListening, stopSpeaking]);

  // Focus text input when shown
  useEffect(() => {
    if (showTextInput && inputRef.current && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showTextInput, isOpen]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isVoiceListening) {
      try {
        setTranscript('');
        setFinalTranscript('');
        setRecognitionError('');
        retryCountRef.current = 0;
        recognitionRef.current.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
        setShowTextInput(true);
      }
    }
  }, [isVoiceListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsVoiceListening(false);
    }
  }, [setIsVoiceListening]);

  // Parse reminder from text
  const parseReminderFromText = useCallback((text) => {
    const lowerText = text.toLowerCase();
    
    // Time patterns
    const timePatterns = [
      /(\d{1,2})\s*(am|pm|बजे|वाजता)/i,
      /(\d{1,2}):(\d{2})/,
      /morning|सुबह|सकाळी/i,
      /evening|शाम|संध्याकाळी/i,
      /afternoon|दोपहर|दुपारी/i,
    ];
    
    // Reminder keywords
    const reminderKeywords = [
      'remind', 'याद', 'आठवण', 'reminder', 'रिमाइंडर', 'स्मरणपत्र',
      'पानी', 'water', 'पाणी', 'spray', 'छिड़काव', 'फवारणी',
      'fertilizer', 'खाद', 'खत'
    ];
    
    const hasReminderIntent = reminderKeywords.some(kw => lowerText.includes(kw));
    const hasTimeIntent = timePatterns.some(pattern => pattern.test(text));
    
    if (hasReminderIntent || hasTimeIntent) {
      let reminderTime = new Date();
      let task = text;
      
      // Extract time
      const pmMatch = text.match(/(\d{1,2})\s*(pm|बजे|वाजता)/i);
      const amMatch = text.match(/(\d{1,2})\s*am/i);
      const fullTimeMatch = text.match(/(\d{1,2}):(\d{2})/);
      
      if (pmMatch) {
        let hour = parseInt(pmMatch[1]);
        if (hour < 12) hour += 12;
        reminderTime.setHours(hour, 0, 0, 0);
      } else if (amMatch) {
        reminderTime.setHours(parseInt(amMatch[1]), 0, 0, 0);
      } else if (fullTimeMatch) {
        reminderTime.setHours(parseInt(fullTimeMatch[1]), parseInt(fullTimeMatch[2]), 0, 0);
      } else if (/morning|सुबह|सकाळी/i.test(text)) {
        reminderTime.setHours(7, 0, 0, 0);
      } else if (/evening|शाम|संध्याकाळी/i.test(text)) {
        reminderTime.setHours(18, 0, 0, 0);
      } else if (/afternoon|दोपहर|दुपारी/i.test(text)) {
        reminderTime.setHours(14, 0, 0, 0);
      }
      
      // If time is in the past, set for tomorrow
      if (reminderTime <= new Date()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }
      
      return {
        isReminder: true,
        title: task.substring(0, 100),
        time: reminderTime.toISOString()
      };
    }
    
    return { isReminder: false };
  }, []);

  // Detect intent from message
  const detectIntent = useCallback((message) => {
    const lowerMsg = message.toLowerCase();
    
    // Disease check intent
    if (/disease|रोग|आजार|बीमारी|sick|infected|पत्ते|पाने|leaves/i.test(lowerMsg)) {
      return 'disease';
    }
    
    // Weather intent
    if (/weather|मौसम|हवामान|rain|बारिश|पाऊस|temperature|तापमान/i.test(lowerMsg)) {
      return 'weather';
    }
    
    // Reminder intent
    if (/remind|याद|आठवण|पानी|water|पाणी|spray|छिड़काव|फवारणी|fertilizer|खाद|खत/i.test(lowerMsg)) {
      return 'reminder';
    }
    
    return 'general';
  }, []);

  const processMessage = useCallback(async (message) => {
    if (!message.trim()) return;
    
    setIsProcessing(true);
    stopListening();
    stopSpeaking();
    
    try {
      const intent = detectIntent(message);
      const reminderData = parseReminderFromText(message);
      
      // If it's a reminder request, create the reminder
      if (reminderData.isReminder) {
        const storedToken = localStorage.getItem('krishi_token');
        const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
        
        try {
          await axios.post(
            `${API_URL}/api/reminders`,
            {
              title: reminderData.title,
              reminder_time: reminderData.time,
              priority: 'medium',
              category: 'voice'
            },
            { withCredentials: true, headers }
          );
          
          const confirmMsg = language === 'hi' 
            ? `रिमाइंडर सेट किया गया: ${reminderData.title}`
            : language === 'mr'
            ? `स्मरणपत्र सेट केले: ${reminderData.title}`
            : `Reminder set: ${reminderData.title}`;
          
          setResponse(confirmMsg);
          speak(confirmMsg);
          setIsSpeaking(true);
          
          if (onResult) {
            onResult({ message, response: confirmMsg, intent: 'reminder' });
          }
          
          return;
        } catch (err) {
          console.error('Failed to create reminder:', err);
        }
      }
      
      // Navigate based on intent
      if (intent === 'disease') {
        const navMsg = language === 'hi'
          ? 'फसल रोग जांच पेज खोल रहा हूं'
          : language === 'mr'
          ? 'पीक रोग तपासणी पान उघडत आहे'
          : 'Opening crop disease check';
        setResponse(navMsg);
        speak(navMsg);
        setTimeout(() => {
          onClose();
          navigate('/app/disease');
        }, 1500);
        return;
      }
      
      if (intent === 'weather') {
        const navMsg = language === 'hi'
          ? 'मौसम पेज खोल रहा हूं'
          : language === 'mr'
          ? 'हवामान पान उघडत आहे'
          : 'Opening weather page';
        setResponse(navMsg);
        speak(navMsg);
        setTimeout(() => {
          onClose();
          navigate('/app/weather');
        }, 1500);
        return;
      }
      
      // General chat with AI
      const storedToken = localStorage.getItem('krishi_token');
      const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
      
      const res = await axios.post(
        `${API_URL}/api/chat`,
        { message, language },
        { withCredentials: true, headers }
      );
      
      const aiResponse = res.data.response;
      setResponse(aiResponse);
      speak(aiResponse);
      setIsSpeaking(true);
      
      if (onResult) {
        onResult({ message, response: aiResponse, intent });
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = language === 'hi'
        ? 'कुछ गड़बड़ हुई। कृपया फिर से कोशिश करें।'
        : language === 'mr'
        ? 'काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.'
        : 'Something went wrong. Please try again.';
      setResponse(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [language, speak, onResult, stopListening, stopSpeaking, detectIntent, parseReminderFromText, navigate, onClose]);

  const handleSend = useCallback(() => {
    const message = (finalTranscript + transcript).trim() || textInput.trim();
    if (message) {
      processMessage(message);
      setTextInput('');
      setTranscript('');
      setFinalTranscript('');
    }
  }, [finalTranscript, transcript, textInput, processMessage]);

  const handleClose = useCallback(() => {
    stopListening();
    stopSpeaking();
    setTranscript('');
    setFinalTranscript('');
    setResponse('');
    setTextInput('');
    setShowTextInput(false);
    setRecognitionError('');
    onClose();
  }, [stopListening, stopSpeaking, onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const toggleSpeaking = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (response) {
      speak(response);
      setIsSpeaking(true);
    }
  }, [isSpeaking, response, speak, stopSpeaking]);

  if (!isOpen) return null;

  const currentTranscript = (finalTranscript + transcript).trim();

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      data-testid="voice-overlay"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Content */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 pb-8 mx-4 mb-0 sm:mb-0 animate-slideUp shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#1F2924] font-['Outfit']">
            {t('voice_assistant')}
          </h2>
          <button 
            onClick={handleClose}
            data-testid="voice-overlay-close"
            className="w-10 h-10 rounded-full bg-[#F7F9F4] flex items-center justify-center text-[#5C7364] hover:bg-[#E4EBE5] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Voice indicator */}
        {!showTextInput && !response && (
          <div className="text-center mb-6">
            {/* Animated mic */}
            <div className="relative inline-flex items-center justify-center mb-4">
              {isVoiceListening && (
                <>
                  <span className="absolute w-24 h-24 rounded-full bg-[#2F6944]/20 animate-ping" />
                  <span className="absolute w-20 h-20 rounded-full bg-[#2F6944]/30 animate-pulse" />
                </>
              )}
              <button
                onClick={isVoiceListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isVoiceListening 
                    ? 'bg-[#2F6944] text-white scale-110' 
                    : 'bg-[#F7F9F4] text-[#2F6944] hover:bg-[#E4EBE5]'
                }`}
              >
                <Mic size={28} />
              </button>
            </div>
            
            {/* Status */}
            <p className={`font-medium mb-2 ${isVoiceListening ? 'text-[#2F6944]' : 'text-[#5C7364]'}`}>
              {isProcessing ? t('processing') : isVoiceListening ? t('listening') : t('speak_now')}
            </p>
            
            {/* Error message */}
            {recognitionError && (
              <p className="text-red-500 text-sm mb-2">{recognitionError}</p>
            )}
            
            {/* Examples */}
            {!isVoiceListening && !currentTranscript && (
              <div className="text-sm text-[#5C7364]">
                <p className="mb-2">{t('try_saying')}</p>
                <div className="space-y-1">
                  {(t('voice_examples') || []).slice(0, 3).map((example, i) => (
                    <p key={i} className="text-[#2F6944]">"{example}"</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Waveform when listening */}
        {isVoiceListening && !showTextInput && (
          <div className="flex items-center justify-center gap-1 h-8 mb-4">
            {[...Array(7)].map((_, i) => (
              <div 
                key={i}
                className="w-1 bg-[#2F6944] rounded-full wave-bar"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}
        
        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex justify-center mb-6">
            <Loader2 className="w-8 h-8 text-[#2F6944] animate-spin" />
          </div>
        )}
        
        {/* Transcript display */}
        {currentTranscript && !showTextInput && (
          <div className="bg-[#F7F9F4] rounded-xl p-4 mb-4">
            <p className="text-sm text-[#5C7364] mb-1">
              {language === 'hi' ? 'आपने कहा:' : language === 'mr' ? 'तुम्ही म्हणालात:' : 'You said:'}
            </p>
            <p className="text-[#1F2924] text-lg">{currentTranscript}</p>
          </div>
        )}
        
        {/* Response display */}
        {response && (
          <div className="bg-[#2F6944]/5 border border-[#2F6944]/20 rounded-xl p-4 mb-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[#1F2924] flex-1">{response}</p>
              <button
                onClick={toggleSpeaking}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2F6944]/10 flex items-center justify-center text-[#2F6944] hover:bg-[#2F6944]/20 transition-colors"
              >
                {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          </div>
        )}
        
        {/* Text input fallback */}
        {showTextInput && (
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('type_message')}
                data-testid="voice-text-input"
                className="flex-1 h-12 px-4 bg-[#F7F9F4] border border-[#E4EBE5] rounded-xl text-[#1F2924] focus:outline-none focus:border-[#2F6944] focus:ring-2 focus:ring-[#2F6944]/20"
                disabled={isProcessing}
              />
              <button
                onClick={handleSend}
                disabled={!textInput.trim() || isProcessing}
                data-testid="voice-send-btn"
                className="w-12 h-12 rounded-xl bg-[#2F6944] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#224A30] transition-colors"
              >
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-3">
          {/* Toggle text/voice */}
          <button
            onClick={() => {
              if (showTextInput) {
                setShowTextInput(false);
                startListening();
              } else {
                stopListening();
                setShowTextInput(true);
              }
            }}
            disabled={isProcessing}
            data-testid="toggle-input-mode"
            className="flex-1 h-12 rounded-xl border-2 border-[#E4EBE5] text-[#5C7364] font-medium flex items-center justify-center gap-2 hover:border-[#2F6944] hover:text-[#2F6944] transition-colors disabled:opacity-50"
          >
            {showTextInput ? <Mic size={18} /> : <Keyboard size={18} />}
            {showTextInput ? (language === 'hi' ? 'आवाज' : language === 'mr' ? 'आवाज' : 'Voice') : (language === 'hi' ? 'टाइप करें' : language === 'mr' ? 'टाइप करा' : 'Type')}
          </button>
          
          {/* Send / New */}
          {!showTextInput && (
            <button
              onClick={response ? () => {
                setResponse('');
                setTranscript('');
                setFinalTranscript('');
                startListening();
              } : handleSend}
              disabled={isProcessing || (!response && !currentTranscript)}
              data-testid="voice-action-btn"
              className="flex-1 h-12 rounded-xl bg-[#2F6944] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#224A30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {response ? (
                <>
                  <Mic size={18} />
                  {language === 'hi' ? 'नया' : language === 'mr' ? 'नवीन' : 'New'}
                </>
              ) : (
                <>
                  <Send size={18} />
                  {t('send')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default VoiceOverlay;
