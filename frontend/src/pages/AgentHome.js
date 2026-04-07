import React, { useState, useEffect } from 'react';
import { Mic, Leaf, CloudSun, Calendar, ShoppingBag, Bell, Lightbulb, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const quickActions = [
  { icon: Leaf, labelKey: 'check_disease', path: '/app/disease', color: 'bg-emerald-500' },
  { icon: CloudSun, labelKey: 'weather_advice', path: '/app/weather', color: 'bg-blue-500' },
  { icon: Calendar, labelKey: 'set_reminder', path: '/app/reminders', color: 'bg-amber-500' },
  { icon: ShoppingBag, labelKey: 'sell_produce', path: '/app/market', color: 'bg-purple-500' },
];

export function AgentHome({ onVoiceOpen }) {
  const navigate = useNavigate();
  const { t, language } = useApp();
  const { user } = useAuth();
  
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const storedToken = localStorage.getItem('krishi_token');
      const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
      
      const response = await axios.get(`${API_URL}/api/alerts`, {
        withCredentials: true,
        headers
      });
      setAlerts(response.data);
    } catch (err) {
      // Set default alerts on error
      setAlerts([
        {
          id: 'default_tip',
          type: 'info',
          title: language === 'hi' ? 'खेती टिप' : language === 'mr' ? 'शेती टिप' : 'Farming Tip',
          message: language === 'hi' 
            ? 'सुबह 5-8 बजे सिंचाई का सबसे अच्छा समय है।'
            : language === 'mr'
            ? 'सकाळी 5-8 वाजता पाणी देणे उत्तम.'
            : 'Best irrigation time is early morning (5-8 AM).',
          category: 'tip'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = () => {
    if (user?.name) {
      return user.name.split(' ')[0];
    }
    return language === 'hi' ? 'किसान' : language === 'mr' ? 'शेतकरी' : 'Farmer';
  };

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return language === 'hi' ? 'सुप्रभात' : language === 'mr' ? 'सुप्रभात' : 'Good Morning';
    if (hour < 17) return language === 'hi' ? 'नमस्कार' : language === 'mr' ? 'नमस्कार' : 'Good Afternoon';
    return language === 'hi' ? 'शुभ संध्या' : language === 'mr' ? 'शुभ संध्याकाळ' : 'Good Evening';
  };

  return (
    <div 
      className="flex-1 px-4 pt-6 pb-4 overflow-y-auto hide-scrollbar"
      data-testid="agent-home-screen"
    >
      {/* Greeting Section */}
      <div className="mb-6 page-enter">
        <p className="text-[#5C7364] text-sm font-medium">{getGreetingTime()}</p>
        <h1 className="text-2xl font-bold text-[#1F2924] font-['Outfit']">
          {t('greeting')}, {getUserName()}! 👋
        </h1>
        <p className="text-[#5C7364] mt-1">{t('how_can_help')}</p>
      </div>

      {/* Voice Assistant Card */}
      <button
        onClick={onVoiceOpen}
        data-testid="voice-assistant-card"
        className="w-full bg-gradient-to-br from-[#2F6944] to-[#51A870] rounded-2xl p-6 mb-6 text-left relative overflow-hidden shadow-[0_8px_32px_rgba(47,105,68,0.25)] hover:shadow-[0_12px_40px_rgba(47,105,68,0.3)] transition-all active:scale-[0.98]"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex items-center gap-4">
          {/* Voice orb */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Mic className="w-7 h-7 text-white" />
            </div>
            {/* Pulse effect */}
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
          </div>
          
          <div className="flex-1">
            <h2 className="text-white font-semibold text-lg">{t('app_name')}</h2>
            <p className="text-white/80 text-sm">{t('tap_to_speak')}</p>
          </div>
          
          <ChevronRight className="text-white/60" size={24} />
        </div>
      </button>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#1F2924] mb-3 font-['Outfit']">
          {t('quick_actions')}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.labelKey}
                onClick={() => navigate(action.path)}
                data-testid={`quick-action-${action.labelKey}`}
                className="card flex items-center gap-3 hover:shadow-[0_8px_32px_rgba(47,105,68,0.1)] transition-all active:scale-[0.98] stagger-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center text-white`}>
                  <Icon size={20} />
                </div>
                <span className="text-[#1F2924] font-medium text-sm leading-tight text-left">
                  {t(action.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#1F2924] mb-3 font-['Outfit'] flex items-center gap-2">
          <Bell size={18} className="text-[#2F6944]" />
          {t('recent_alerts')}
        </h3>
        
        {loading ? (
          <div className="card animate-pulse">
            <div className="h-4 bg-[#E4EBE5] rounded w-3/4 mb-2" />
            <div className="h-3 bg-[#E4EBE5] rounded w-full" />
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert, index) => (
              <div 
                key={alert.id}
                className={`card border-l-4 stagger-item ${
                  alert.type === 'warning' 
                    ? 'border-l-amber-500 bg-amber-50/50' 
                    : 'border-l-[#2F6944] bg-[#2F6944]/5'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  {alert.type === 'warning' ? (
                    <Bell size={18} className="text-amber-500 mt-0.5" />
                  ) : (
                    <Lightbulb size={18} className="text-[#2F6944] mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-[#1F2924] text-sm">{alert.title}</p>
                    <p className="text-[#5C7364] text-xs mt-0.5">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-6">
            <Bell size={24} className="mx-auto text-[#5C7364] mb-2" />
            <p className="text-[#5C7364] text-sm">No alerts at the moment</p>
          </div>
        )}
      </div>

      {/* Today's Tips */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[#1F2924] mb-3 font-['Outfit'] flex items-center gap-2">
          <Lightbulb size={18} className="text-amber-500" />
          {t('todays_tips')}
        </h3>
        
        <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <p className="text-[#1F2924] text-sm leading-relaxed">
            {language === 'hi' 
              ? '💡 अपने पौधों को सुबह जल्दी या शाम को पानी दें। यह पानी के नुकसान को कम करता है और पौधों को बेहतर तरीके से पानी मिलता है।'
              : language === 'mr'
              ? '💡 तुमच्या रोपांना सकाळी लवकर किंवा संध्याकाळी पाणी द्या. यामुळे पाण्याचे बाष्पीभवन कमी होते.'
              : '💡 Water your plants early morning or evening. This reduces water loss through evaporation and ensures better absorption by plants.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AgentHome;
