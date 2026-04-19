import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Mic, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

const languages = [
  { code: 'hi', name: 'हिंदी', subtitle: 'Hindi', icon: '🇮🇳' },
  { code: 'mr', name: 'मराठी', subtitle: 'Marathi', icon: '🇮🇳' },
  { code: 'en', name: 'English', subtitle: 'English', icon: '🌐' },
];

export function LanguageSelection() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useApp();
  const [selectedLang, setSelectedLang] = useState(language);

  const handleSelect = (code) => {
    setSelectedLang(code);
    setLanguage(code);
  };

  const handleContinue = () => {
    navigate('/auth');
  };

  return (
    <div 
      className="min-h-screen min-h-[100dvh] w-full max-w-md mx-auto bg-[#F7F9F4] flex flex-col"
      data-testid="language-selection-screen"
    >
      {/* Header */}
      <div className="flex-none pt-12 pb-8 px-6">
        <div className="w-16 h-16 rounded-2xl bg-[#2F6944]/10 flex items-center justify-center mb-6 mx-auto">
          <Globe className="w-8 h-8 text-[#2F6944]" />
        </div>
        
        <h1 className="text-2xl font-bold text-[#1F2924] text-center font-['Outfit'] mb-2">
          {t('select_language')}
        </h1>
        
        <p className="text-[#5C7364] text-center flex items-center justify-center gap-2">
          <Mic size={16} />
          {t('tap_or_say')}
        </p>
      </div>

      {/* Language cards */}
      <div className="flex-1 px-6 space-y-3 pb-8">
        {languages.map((lang, index) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            data-testid={`lang-${lang.code}`}
            className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-4 stagger-item ${
              selectedLang === lang.code
                ? 'bg-[#2F6944]/5 border-[#2F6944] shadow-[0_4px_24px_rgba(47,105,68,0.1)]'
                : 'bg-white border-[#E4EBE5] hover:border-[#2F6944]/50'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Language icon/flag */}
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
              selectedLang === lang.code ? 'bg-[#2F6944]/10' : 'bg-[#F7F9F4]'
            }`}>
              {lang.icon}
            </div>
            
            {/* Language text */}
            <div className="flex-1 text-left">
              <p className={`text-xl font-semibold ${
                selectedLang === lang.code ? 'text-[#2F6944]' : 'text-[#1F2924]'
              }`}>
                {lang.name}
              </p>
              <p className="text-[#5C7364] text-sm">{lang.subtitle}</p>
            </div>
            
            {/* Check mark */}
            {selectedLang === lang.code && (
              <div className="w-8 h-8 rounded-full bg-[#2F6944] flex items-center justify-center">
                <Check size={18} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Continue button */}
      <div className="flex-none px-6 pb-8 pt-4">
        <button
          onClick={handleContinue}
          data-testid="language-continue-btn"
          className="btn-primary"
        >
          {t('continue')}
        </button>
      </div>
    </div>
  );
}

export default LanguageSelection;
