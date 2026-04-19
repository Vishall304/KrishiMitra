import React, { useState, useEffect, useCallback } from 'react';
import { History, Leaf, CloudSun, Calendar, Clock, Filter, Loader2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function FarmHistory() {
  const navigate = useNavigate();
  const { t, language } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const storedToken = localStorage.getItem('krishi_token');
      const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
      
      // Fetch all history data in parallel
      const [remindersRes, diseaseRes, chatRes] = await Promise.all([
        axios.get(`${API_URL}/api/reminders`, { withCredentials: true, headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/disease-history`, { withCredentials: true, headers }).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/chat-history`, { withCredentials: true, headers }).catch(() => ({ data: [] }))
      ]);
      
      // Combine and format activities
      const allActivities = [];
      
      // Add reminders
      (remindersRes.data || []).forEach(r => {
        allActivities.push({
          id: `reminder-${r.id}`,
          type: 'reminder',
          title: r.title,
          timestamp: r.created_at || r.reminder_time,
          status: r.completed ? 'completed' : 'pending',
          icon: Calendar,
          color: 'amber'
        });
      });
      
      // Add disease checks
      (diseaseRes.data || []).forEach(d => {
        allActivities.push({
          id: `disease-${d.id}`,
          type: 'disease',
          title: d.result?.disease_name || (language === 'hi' ? 'फसल रोग जांच' : language === 'mr' ? 'पीक रोग तपासणी' : 'Crop Disease Check'),
          timestamp: d.timestamp,
          status: d.result?.severity || 'checked',
          icon: Leaf,
          color: 'emerald'
        });
      });
      
      // Add chat activities
      (chatRes.data || []).slice(0, 10).forEach(c => {
        allActivities.push({
          id: `chat-${c.id}`,
          type: 'assistant',
          title: c.message?.substring(0, 50) + (c.message?.length > 50 ? '...' : ''),
          timestamp: c.timestamp,
          status: 'completed',
          icon: History,
          color: 'blue'
        });
      });
      
      // Sort by timestamp (newest first)
      allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setActivities(allActivities);
    } catch (err) {
      console.error('Fetch history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = useCallback(() => {
    switch (activeTab) {
      case 'disease':
        return activities.filter(a => a.type === 'disease');
      case 'reminders':
        return activities.filter(a => a.type === 'reminder');
      case 'assistant':
        return activities.filter(a => a.type === 'assistant');
      default:
        return activities;
    }
  }, [activities, activeTab]);

  const formatTimestamp = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return language === 'hi' ? 'अभी' : language === 'mr' ? 'आता' : 'Just now';
    if (diffMins < 60) return `${diffMins} ${language === 'hi' ? 'मिनट पहले' : language === 'mr' ? 'मिनिटापूर्वी' : 'min ago'}`;
    if (diffHours < 24) return `${diffHours} ${language === 'hi' ? 'घंटे पहले' : language === 'mr' ? 'तासापूर्वी' : 'hours ago'}`;
    if (diffDays < 7) return `${diffDays} ${language === 'hi' ? 'दिन पहले' : language === 'mr' ? 'दिवसापूर्वी' : 'days ago'}`;
    
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getStatusBadge = (activity) => {
    if (activity.type === 'reminder') {
      return activity.status === 'completed' 
        ? { text: t('completed'), class: 'bg-green-100 text-green-700' }
        : { text: t('upcoming'), class: 'bg-amber-100 text-amber-700' };
    }
    if (activity.type === 'disease') {
      const severityMap = {
        'Severe': { text: language === 'hi' ? 'गंभीर' : language === 'mr' ? 'गंभीर' : 'Severe', class: 'bg-red-100 text-red-700' },
        'Moderate': { text: language === 'hi' ? 'मध्यम' : language === 'mr' ? 'मध्यम' : 'Moderate', class: 'bg-amber-100 text-amber-700' },
        'Mild': { text: language === 'hi' ? 'हल्का' : language === 'mr' ? 'सौम्य' : 'Mild', class: 'bg-green-100 text-green-700' },
      };
      return severityMap[activity.status] || { text: language === 'hi' ? 'जांचा गया' : language === 'mr' ? 'तपासले' : 'Checked', class: 'bg-blue-100 text-blue-700' };
    }
    return null;
  };

  const filteredActivities = filterActivities();

  const tabs = [
    { key: 'all', labelKey: 'all_activities' },
    { key: 'disease', labelKey: 'disease_checks' },
    { key: 'reminders', labelKey: 'reminders_history' },
  ];

  return (
    <div 
      className="flex-1 px-4 pt-6 pb-4 overflow-y-auto"
      data-testid="history-screen"
    >
      {/* Header */}
      <div className="mb-6 page-enter">
        <h1 className="text-2xl font-bold text-[#1F2924] font-['Outfit']">
          {t('history_title')}
        </h1>
        <p className="text-[#5C7364] text-sm mt-1">{t('history_subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-[#F7F9F4] p-1.5 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            data-testid={`history-tab-${tab.key}`}
            className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white text-[#2F6944] shadow-sm'
                : 'text-[#5C7364] hover:text-[#2F6944]'
            }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Activity List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#2F6944]" />
        </div>
      ) : filteredActivities.length > 0 ? (
        <div className="space-y-3">
          {filteredActivities.map((activity, index) => {
            const Icon = activity.icon;
            const colorMap = {
              amber: 'bg-amber-100 text-amber-600',
              emerald: 'bg-emerald-100 text-emerald-600',
              blue: 'bg-blue-100 text-blue-600',
              purple: 'bg-purple-100 text-purple-600'
            };
            const statusBadge = getStatusBadge(activity);
            
            return (
              <div 
                key={activity.id}
                className="bg-white rounded-xl p-4 border border-[#E4EBE5] hover:border-[#2F6944]/30 hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  if (activity.type === 'reminder') navigate('/app/reminders');
                  else if (activity.type === 'disease') navigate('/app/disease');
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${colorMap[activity.color]} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1F2924] text-sm truncate">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#5C7364] flex items-center gap-1">
                        <Clock size={12} />
                        {formatTimestamp(activity.timestamp)}
                      </span>
                      {statusBadge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <ChevronRight size={18} className="text-[#5C7364] flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16" data-testid="no-history">
          <div className="w-16 h-16 rounded-full bg-[#F7F9F4] flex items-center justify-center mx-auto mb-4">
            <History size={28} className="text-[#5C7364]" />
          </div>
          <p className="text-[#5C7364] font-medium">{t('no_history')}</p>
          <p className="text-[#5C7364] text-sm mt-1">
            {language === 'hi' 
              ? 'आपकी गतिविधियां यहां दिखाई देंगी'
              : language === 'mr'
              ? 'तुमचे क्रियाकलाप येथे दिसतील'
              : 'Your activities will appear here'}
          </p>
        </div>
      )}
    </div>
  );
}

export default FarmHistory;
