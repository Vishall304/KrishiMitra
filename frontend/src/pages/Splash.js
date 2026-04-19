import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Splash() {
  const navigate = useNavigate();
  const { t, onboardingComplete } = useApp();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content after a brief delay
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // If onboarding is complete, redirect to app
    if (onboardingComplete) {
      navigate('/app');
    }
  }, [onboardingComplete, navigate]);

  const handleContinue = () => {
    navigate('/language');
  };

  return (
    <div 
      className="min-h-screen min-h-[100dvh] w-full max-w-md mx-auto relative overflow-hidden"
      data-testid="splash-screen"
    >
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/9542614/pexels-photo-9542614.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#2F6944]/90 via-[#2F6944]/80 to-[#1E4D2E]/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen min-h-[100dvh] px-6 py-12">
        {/* Logo area */}
        <div className={`flex-1 flex flex-col items-center justify-center transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* App icon */}
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center">
              <Mic className="w-8 h-8 text-[#2F6944]" />
            </div>
          </div>

          {/* App name */}
          <h1 className="text-4xl font-bold text-white mb-3 font-['Outfit'] tracking-tight text-center">
            {t('app_name')}
          </h1>

          {/* Tagline */}
          <p className="text-white/90 text-lg font-medium mb-4 text-center">
            {t('tagline')}
          </p>

          {/* Description */}
          <p className="text-white/70 text-center max-w-xs leading-relaxed">
            {t('splash_description')}
          </p>
        </div>

        {/* Bottom CTA */}
        <div className={`transition-all duration-700 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button
            onClick={handleContinue}
            data-testid="splash-continue-btn"
            className="w-full h-14 rounded-2xl bg-white text-[#2F6944] font-semibold text-lg flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/95 active:scale-[0.98] transition-all"
          >
            {t('get_started')}
            <ChevronRight size={20} />
          </button>

          {/* Decorative leaf pattern */}
          <div className="flex justify-center mt-8 gap-2 opacity-30">
            <div className="w-2 h-2 rounded-full bg-white" />
            <div className="w-2 h-2 rounded-full bg-white/60" />
            <div className="w-2 h-2 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Splash;
