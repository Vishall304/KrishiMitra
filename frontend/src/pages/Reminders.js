import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Mic, Calendar, Clock, Bell, Check, Trash2, Loader2, X, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const priorityColors = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200'
};

export function Reminders({ onVoiceOpen }) {
  const { t, language, showReminderAlert, reminderAlert, dismissReminderAlert } = useApp();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const checkIntervalRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_time: '',
    priority: 'medium',
    category: 'general'
  });

  useEffect(() => {
    fetchReminders();
    
    // Set up reminder check interval
    checkIntervalRef.current = setInterval(checkDueReminders, 30000); // Check every 30 seconds
    
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const storedToken = localStorage.getItem('krishi_token');
      const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
      
      const response = await axios.get(`${API_URL}/api/reminders`, {
        withCredentials: true,
        headers
      });
      setReminders(response.data || []);
    } catch (err) {
      console.error('Fetch reminders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkDueReminders = useCallback(() => {
    const now = new Date();
    reminders.forEach(reminder => {
      if (reminder.completed) return;
      
      const reminderTime = new Date(reminder.reminder_time);
      const diffMs = reminderTime - now;
      
      // If reminder is due (within 1 minute window)
      if (diffMs >= -60000 && diffMs <= 60000) {
        showReminderAlert(reminder);
        
        // Mark as notified (could add a 'notified' field)
        handleToggleComplete(reminder);
      }
    });
  }, [reminders, showReminderAlert]);

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.reminder_time) return;
    
    setSubmitting(true);
    try {
      const storedToken = localStorage.getItem('krishi_token');
      const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
      
      await axios.post(
        `${API_URL}/api/reminders`,
        formData,
        { withCredentials: true, headers }
      );
      
      setFormData({
        title: '',
        description: '',
        reminder_time: '',
        priority: 'medium',
        category: 'general'
      });
      setShowForm(false);
      fetchReminders();
    } catch (err) {
      console.error('Create reminder error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (reminder) => {
    try {
      const storedToken = localStorage.getItem('krishi_token');
      const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
      
      await axios.put(
        `${API_URL}/api/reminders/${reminder.id}`,
        { completed: !reminder.completed },
        { withCredentials: true, headers }
      );
      
      setReminders(prev => 
        prev.map(r => r.id === reminder.id ? { ...r, completed: !r.completed } : r)
      );
    } catch (err) {
      console.error('Toggle reminder error:', err);
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      const storedToken = localStorage.getItem('krishi_token');
      const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
      
      await axios.delete(`${API_URL}/api/reminders/${id}`, {
        withCredentials: true,
        headers
      });
      
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Delete reminder error:', err);
    }
  };

  const filterReminders = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    switch (activeTab) {
      case 'today':
        return reminders.filter(r => {
          const reminderDate = new Date(r.reminder_time);
          reminderDate.setHours(0, 0, 0, 0);
          return reminderDate.getTime() === today.getTime() && !r.completed;
        });
      case 'upcoming':
        return reminders.filter(r => {
          const reminderDate = new Date(r.reminder_time);
          return reminderDate > new Date() && !r.completed;
        }).sort((a, b) => new Date(a.reminder_time) - new Date(b.reminder_time));
      case 'completed':
        return reminders.filter(r => r.completed);
      default:
        return reminders;
    }
  }, [reminders, activeTab]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return language === 'hi' ? 'आज' : language === 'mr' ? 'आज' : 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return language === 'hi' ? 'कल' : language === 'mr' ? 'उद्या' : 'Tomorrow';
    }
    
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  const filteredReminders = filterReminders();

  return (
    <div 
      className="flex-1 px-4 pt-6 pb-4 overflow-y-auto"
      data-testid="reminders-screen"
    >
      {/* Reminder Alert Modal */}
      {reminderAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-bounce-in">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mx-auto mb-4">
              <Bell size={32} className="text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-[#1F2924] text-center mb-2">
              {t('reminder_due')}
            </h3>
            <p className="text-[#5C7364] text-center mb-4">{reminderAlert.title}</p>
            <button
              onClick={dismissReminderAlert}
              className="w-full h-12 bg-[#2F6944] text-white font-semibold rounded-xl hover:bg-[#224A30] transition-colors"
            >
              {language === 'hi' ? 'ठीक है' : language === 'mr' ? 'ठीक आहे' : 'OK'}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 page-enter">
        <h1 className="text-2xl font-bold text-[#1F2924] font-['Outfit']">
          {t('reminders_title')}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={onVoiceOpen}
            data-testid="reminder-voice-btn"
            className="w-10 h-10 rounded-xl bg-[#2F6944] flex items-center justify-center text-white hover:bg-[#224A30] transition-colors"
            title={t('add_by_voice')}
          >
            <Mic size={18} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            data-testid="add-reminder-btn"
            className="w-10 h-10 rounded-xl bg-[#F7F9F4] flex items-center justify-center text-[#2F6944] hover:bg-[#E4EBE5] transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Voice hint */}
      <div className="bg-[#2F6944]/5 border border-[#2F6944]/20 rounded-xl p-3 mb-6">
        <p className="text-sm text-[#2F6944]">
          <Mic size={14} className="inline mr-2" />
          {language === 'hi' 
            ? '"3 बजे पौधों को पानी देना याद दिलाना" बोलें'
            : language === 'mr'
            ? '"3 वाजता झाडांना पाणी द्यायची आठवण करा" बोला'
            : 'Say "Remind me to water plants at 3 PM"'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-[#F7F9F4] p-1.5 rounded-xl">
        {['today', 'upcoming', 'completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            data-testid={`tab-${tab}`}
            className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all ${
              activeTab === tab
                ? 'bg-white text-[#2F6944] shadow-sm'
                : 'text-[#5C7364] hover:text-[#2F6944]'
            }`}
          >
            {t(tab)}
          </button>
        ))}
      </div>

      {/* Add Reminder Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-4 mb-6 border border-[#E4EBE5] shadow-lg" data-testid="reminder-form">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1F2924]">{t('add_reminder')}</h3>
            <button 
              onClick={() => setShowForm(false)}
              className="w-8 h-8 rounded-full bg-[#F7F9F4] flex items-center justify-center text-[#5C7364] hover:bg-[#E4EBE5]"
            >
              <X size={16} />
            </button>
          </div>
          
          <form onSubmit={handleCreateReminder} className="space-y-3">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('reminder_title')}
              data-testid="reminder-title-input"
              className="w-full h-12 bg-[#F7F9F4] border border-[#E4EBE5] rounded-xl px-4 text-[#1F2924] placeholder:text-[#5C7364]/50 focus:outline-none focus:border-[#2F6944] focus:ring-2 focus:ring-[#2F6944]/10"
              required
            />
            
            <input
              type="datetime-local"
              value={formData.reminder_time}
              onChange={(e) => setFormData(prev => ({ ...prev, reminder_time: e.target.value }))}
              data-testid="reminder-time-input"
              className="w-full h-12 bg-[#F7F9F4] border border-[#E4EBE5] rounded-xl px-4 text-[#1F2924] focus:outline-none focus:border-[#2F6944] focus:ring-2 focus:ring-[#2F6944]/10"
              required
            />
            
            <div className="flex gap-2">
              {['high', 'medium', 'low'].map(priority => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority }))}
                  data-testid={`priority-${priority}`}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                    formData.priority === priority
                      ? priorityColors[priority]
                      : 'bg-white border-[#E4EBE5] text-[#5C7364]'
                  }`}
                >
                  {t(priority)}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 h-11 rounded-xl border-2 border-[#E4EBE5] text-[#5C7364] font-medium hover:border-[#2F6944] hover:text-[#2F6944] transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                data-testid="save-reminder-btn"
                className="flex-1 h-11 rounded-xl bg-[#2F6944] text-white font-medium hover:bg-[#224A30] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reminders List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#2F6944]" />
        </div>
      ) : filteredReminders.length > 0 ? (
        <div className="space-y-3">
          {filteredReminders.map((reminder) => (
            <div 
              key={reminder.id}
              className={`bg-white rounded-xl p-4 border border-[#E4EBE5] ${
                reminder.completed ? 'opacity-60' : ''
              }`}
              data-testid={`reminder-${reminder.id}`}
            >
              <div className="flex items-start gap-3">
                {/* Complete checkbox */}
                <button
                  onClick={() => handleToggleComplete(reminder)}
                  data-testid={`toggle-reminder-${reminder.id}`}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    reminder.completed
                      ? 'bg-[#2F6944] border-[#2F6944] text-white'
                      : 'border-[#E4EBE5] hover:border-[#2F6944]'
                  }`}
                >
                  {reminder.completed && <Check size={14} />}
                </button>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-[#1F2924] ${
                    reminder.completed ? 'line-through' : ''
                  }`}>
                    {reminder.title}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-[#5C7364]">
                      <Calendar size={12} />
                      {formatDate(reminder.reminder_time)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#5C7364]">
                      <Clock size={12} />
                      {formatTime(reminder.reminder_time)}
                    </span>
                  </div>
                  
                  {/* Priority badge */}
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                    priorityColors[reminder.priority]
                  }`}>
                    {t(reminder.priority)}
                  </span>
                </div>
                
                {/* Delete button */}
                <button
                  onClick={() => handleDeleteReminder(reminder.id)}
                  data-testid={`delete-reminder-${reminder.id}`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C7364] hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16" data-testid="no-reminders">
          <div className="w-16 h-16 rounded-full bg-[#F7F9F4] flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="text-[#5C7364]" />
          </div>
          <p className="text-[#5C7364] font-medium">{t('no_reminders')}</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 h-10 px-6 bg-[#2F6944] text-white font-medium rounded-xl hover:bg-[#224A30] transition-colors inline-flex items-center gap-2"
          >
            <Plus size={18} />
            {t('add_reminder')}
          </button>
        </div>
      )}
      
      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Reminders;
