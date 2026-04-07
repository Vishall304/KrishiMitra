import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Mic, MicOff, Send, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function VoiceOverlay({ isOpen, onClose, onResult }) {
  const { t, language, isVoiceListening, setIsVoiceListening, voiceSupported, speak } = useApp();
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if (!voiceSupported) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      
      // Set language
      const langMap = {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'mr': 'mr-IN'
      };
      recognition.lang = langMap[language] || 'en-IN';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsVoiceListening(false);
        if (event.error === 'not-allowed' || event.error === 'no-speech') {
          setShowTextInput(true);
        }
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [voiceSupported, language, setIsVoiceListening]);

  // Start listening when overlay opens
  useEffect(() => {
    if (isOpen && voiceSupported && !showTextInput) {
      startListening();
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      setIsVoiceListening(false);
    };
  }, [isOpen, voiceSupported, showTextInput]);

  // Focus text input when shown
  useEffect(() => {
    if (showTextInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showTextInput]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isVoiceListening) {
      try {
        setTranscript('');
        setResponse('');
        recognitionRef.current.start();
        setIsVoiceListening(true);
      } catch (err) {
        console.error('Error starting recognition:', err);
        setShowTextInput(true);
      }
    }
  }, [isVoiceListening, setIsVoiceListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isVoiceListening) {
      recognitionRef.current.stop();
      setIsVoiceListening(false);
    }
  }, [isVoiceListening, setIsVoiceListening]);

  const processMessage = useCallback(async (message) => {
    if (!message.trim()) return;
    
    setIsProcessing(true);
    stopListening();
    
    try {
      const storedToken = localStorage.getItem('krishi_token');
      const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
      
      const res = await axios.post(
        `${API_URL}/api/chat`,
        { message, language },
        { withCredentials: true, headers }
      );
      
      const aiResponse = res.data.response;
      setResponse(aiResponse);
      
      // Speak the response
      speak(aiResponse);
      
      // Notify parent
      if (onResult) {
        onResult({ message, response: aiResponse });
      }
    } catch (err) {
      console.error('Chat error:', err);
      setResponse(t('error'));
    } finally {
      setIsProcessing(false);
    }
  }, [language, speak, onResult, t, stopListening]);

  const handleSend = useCallback(() => {
    const message = transcript || textInput;
    if (message.trim()) {
      processMessage(message);
      setTextInput('');
    }
  }, [transcript, textInput, processMessage]);

  const handleClose = useCallback(() => {
    stopListening();
    setTranscript('');
    setResponse('');
    setTextInput('');
    setShowTextInput(false);
    onClose();
  }, [stopListening, onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end justify-center"
      data-testid="voice-overlay"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Content */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl p-6 pb-8 animate-slideUp">
        {/* Close button */}
        <button 
          onClick={handleClose}
          data-testid="voice-overlay-close"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#F7F9F4] flex items-center justify-center text-[#5C7364] hover:bg-[#E4EBE5] transition-colors"
        >
          <X size={20} />
        </button>
        
        {/* Status text */}
        <p className="text-center text-[#5C7364] mb-6 font-medium">
          {isProcessing ? t('processing') : isVoiceListening ? t('listening') : t('speak_now')}
        </p>
        
        {/* Waveform / Voice indicator */}
        {isVoiceListening && !showTextInput && (
          <div className="flex items-center justify-center gap-1 h-12 mb-6">
            {[...Array(5)].map((_, i) => (
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
        {transcript && !showTextInput && (
          <div className="bg-[#F7F9F4] rounded-2xl p-4 mb-4 min-h-[60px]">
            <p className="text-[#1F2924] text-lg">{transcript}</p>
          </div>
        )}
        
        {/* Response display */}
        {response && (
          <div className="bg-[#2F6944]/5 border border-[#2F6944]/20 rounded-2xl p-4 mb-4">
            <p className="text-[#1F2924]">{response}</p>
          </div>
        )}
        
        {/* Text input fallback */}
        {showTextInput && (
          <div className="flex gap-2 mb-4">
            <input
              ref={inputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('type_message')}
              data-testid="voice-text-input"
              className="flex-1 input-field"
              disabled={isProcessing}
            />
            <button
              onClick={handleSend}
              disabled={!textInput.trim() || isProcessing}
              data-testid="voice-send-btn"
              className="w-14 h-14 rounded-xl bg-[#2F6944] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#224A30] transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        )}
        
        {/* Voice / Text toggle */}
        {!voiceSupported || showTextInput ? (
          <p className="text-center text-sm text-[#5C7364] mb-4">
            {!voiceSupported ? t('voice_not_supported') : ''}
          </p>
        ) : null}
        
        {/* Action buttons */}
        <div className="flex gap-3">
          {!showTextInput && voiceSupported && (
            <button
              onClick={() => setShowTextInput(true)}
              data-testid="switch-to-text-btn"
              className="flex-1 btn-secondary text-sm"
            >
              {t('type_message')}
            </button>
          )}
          
          {showTextInput && voiceSupported && (
            <button
              onClick={() => {
                setShowTextInput(false);
                startListening();
              }}
              data-testid="switch-to-voice-btn"
              className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
            >
              <Mic size={18} />
              {t('tap_to_speak')}
            </button>
          )}
          
          {!showTextInput && (
            <button
              onClick={isVoiceListening ? handleSend : startListening}
              disabled={isProcessing || (isVoiceListening && !transcript)}
              data-testid="voice-action-btn"
              className="flex-1 btn-primary text-sm flex items-center justify-center gap-2"
            >
              {isVoiceListening ? (
                <>
                  <Send size={18} />
                  {t('save')}
                </>
              ) : (
                <>
                  <Mic size={18} />
                  {t('tap_to_speak')}
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
