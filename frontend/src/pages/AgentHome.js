import React, { useState, useEffect } from 'react';
import { Mic, Leaf, CloudSun, Calendar, History, Bell, Lightbulb, ChevronRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const quickActions = [
  { icon: Leaf, labelKey: 'check_disease', path: '/app/disease', color: 'bg-emerald-500' },
  { icon: CloudSun, labelKey: 'weather_advice', path: '/app/weather', color: 'bg-blue-500' },
  { icon: Calendar, labelKey: 'set_reminder', path: '/app/reminders', color: 'bg-amber-500' },
  { icon: History, labelKey: 'view_history', path: '/app/history', color: 'bg-purple-500' },
];

export function AgentHome({ onVoiceOpen }) {
  const navigate = useNavigate();
  const { t, language } = useApp();
  const { user } = useAuth();
  
  const [alerts, setAlerts] = useState([]);
  const [nextReminder, setNextReminder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const storedToken = localStorage.getItem('krishi_token');
      const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
      
      // Fetch alerts and reminders in parallel
      const [alertsRes, remindersRes] = await Promise.all([
        axios.get(`${API_URL}/api/alerts`, { withCredentials: true, headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/reminders`, { withCredentials: true, headers }).catch(() => ({ data: [] }))
      ]);
      
      setAlerts(alertsRes.data || []);
      
      // Find next upcoming reminder
      const upcomingReminders = (remindersRes.data || [])
        .filter(r => !r.completed && new Date(r.reminder_time) > new Date())
        .sort((a, b) => new Date(a.reminder_time) - new Date(b.reminder_time));
      
      if (upcomingReminders.length > 0) {
        setNextReminder(upcomingReminders[0]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
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

  const formatReminderTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const timeStr = date.toLocaleTimeString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    if (date.toDateString() === today.toDateString()) {
      return `${language === 'hi' ? 'आज' : language === 'mr' ? 'आज' : 'Today'} ${timeStr}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `${language === 'hi' ? 'कल' : language === 'mr' ? 'उद्या' : 'Tomorrow'} ${timeStr}`;
    }
    
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short'
    }) + ' ' + timeStr;
  };

  return (
    <div 
      className="flex-1 px-4 pt-6 pb-4 overflow-y-auto"
      data-testid="agent-home-screen"
    >
      {/* Greeting Section */}
      <div className="mb-6 page-enter">
        <p className="text-[#5C7364] text-sm font-medium">{getGreetingTime()}</p>
        <h1 className="text-2xl font-bold text-[#1F2924] font-['Outfit']">
          {t('greeting')}, {getUserName()}!
        </h1>
        <p className="text-[#5C7364] mt-1 text-sm">{t('how_can_help')}</p>
      </div>

      {/* Voice Assistant Card */}
      <button
        onClick={onVoiceOpen}
        data-testid="voice-assistant-card"
        className="w-full bg-gradient-to-br from-[#2F6944] to-[#51A870] rounded-2xl p-5 mb-6 text-left relative overflow-hidden shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex items-center gap-4">
          {/* Voice orb */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            {/* Pulse effect */}
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
          </div>
          
          <div className="flex-1">
            <h2 className="text-white font-semibold text-lg">{t('voice_assistant')}</h2>
            <p className="text-white/80 text-sm">{t('tap_to_speak')}</p>
          </div>
          
          <ChevronRight className="text-white/60" size={22} />
        </div>
      </button>

      {/* Next Reminder Card */}
      {nextReminder && (
        <div 
          className="card mb-6 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-transparent cursor-pointer hover:shadow-md transition-all"
          onClick={() => navigate('/app/reminders')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-amber-600 font-medium mb-0.5">{t('next_reminder')}</p>
              <p className="text-[#1F2924] font-medium truncate">{nextReminder.title}</p>
              <p className="text-[#5C7364] text-xs">{formatReminderTime(nextReminder.reminder_time)}</p>
            </div>
            <ChevronRight size={18} className="text-[#5C7364]" />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-[#1F2924] mb-3 font-['Outfit']">
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
                className="bg-white rounded-xl p-4 flex items-center gap-3 border border-[#E4EBE5] hover:border-[#2F6944]/30 hover:shadow-md transition-all active:scale-[0.98]"
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
      {alerts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-base font-semibold text-[#1F2924] mb-3 font-['Outfit'] flex items-center gap-2">
            <Bell size={16} className="text-[#2F6944]" />
            {t('recent_alerts')}
          </h3>
          
          <div className="space-y-2">
            {alerts.slice(0, 2).map((alert, index) => (
              <div 
                key={alert.id}
                className={`bg-white rounded-xl p-4 border border-[#E4EBE5] ${
                  alert.type === 'warning' 
                    ? 'border-l-4 border-l-amber-500' 
                    : 'border-l-4 border-l-[#2F6944]'
                }`}
              >
                <div className="flex items-start gap-3">
                  {alert.type === 'warning' ? (
                    <Bell size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Lightbulb size={16} className="text-[#2F6944] mt-0.5 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-[#1F2924] text-sm">{alert.title}</p>
                    <p className="text-[#5C7364] text-xs mt-0.5 line-clamp-2">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Tips */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#1F2924] mb-3 font-['Outfit'] flex items-center gap-2">
          <Lightbulb size={16} className="text-amber-500" />
          {t('todays_tips')}
        </h3>
        
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
          <p className="text-[#1F2924] text-sm leading-relaxed">
            {language === 'hi' 
              ? 'अपने पौधों को सुबह जल्दी या शाम को पानी दें। यह पानी के नुकसान को कम करता है और पौधों को बेहतर तरीके से पानी मिलता है।'
              : language === 'mr'
              ? 'तुमच्या रोपांना सकाळी लवकर किंवा संध्याकाळी पाणी द्या. यामुळे पाण्याचे बाष्पीभवन कमी होते.'
              : 'Water your plants early morning or evening. This reduces water loss through evaporation and ensures better absorption by plants.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AgentHome;
