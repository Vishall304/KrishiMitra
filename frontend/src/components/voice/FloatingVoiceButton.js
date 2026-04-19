import React from 'react';
import { Mic } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function FloatingVoiceButton({ onClick }) {
  const { isVoiceListening } = useApp();

  return (
    <button
      onClick={onClick}
      data-testid="floating-voice-btn"
      className="fixed bottom-20 right-4 z-50"
      aria-label="Voice Assistant"
    >
      {/* Pulse rings */}
      {isVoiceListening && (
        <>
          <span className="absolute inset-0 w-14 h-14 rounded-full bg-[#51A870]/30 voice-pulse" />
          <span className="absolute inset-0 w-14 h-14 rounded-full bg-[#51A870]/20 voice-pulse-2" />
        </>
      )}
      
      {/* Main button */}
      <div className={`relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#2F6944] to-[#51A870] flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${
        isVoiceListening ? 'animate-pulse' : ''
      }`}>
        <Mic size={24} strokeWidth={2.5} />
      </div>
    </button>
  );
}

export default FloatingVoiceButton;
