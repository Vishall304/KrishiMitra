import React from 'react';
import { Mic } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function FloatingVoiceButton({ onClick }) {
  const { isVoiceListening } = useApp();

  return (
    <button
      onClick={onClick}
      data-testid="floating-voice-btn"
      className="fixed bottom-24 right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-50"
      aria-label="Voice Assistant"
    >
      {/* Pulse rings */}
      {isVoiceListening && (
        <>
          <span className="absolute inset-0 w-16 h-16 rounded-full bg-[#51A870]/30 voice-pulse" />
          <span className="absolute inset-0 w-16 h-16 rounded-full bg-[#51A870]/20 voice-pulse-2" />
          <span className="absolute inset-0 w-16 h-16 rounded-full bg-[#51A870]/10 voice-pulse-3" />
        </>
      )}
      
      {/* Main button */}
      <div className={`relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#2F6944] to-[#51A870] flex items-center justify-center text-white shadow-[0_8px_32px_rgba(81,168,112,0.4)] transition-transform hover:scale-105 active:scale-95 ${
        isVoiceListening ? 'animate-pulse' : ''
      }`}>
        <Mic size={26} strokeWidth={2.5} />
      </div>
    </button>
  );
}

export default FloatingVoiceButton;
