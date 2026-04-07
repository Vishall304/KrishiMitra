import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Mic, Calendar, Clock, Bell, Check, Trash2, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const priorityColors = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-green-100 text-green-700 border-green-200'
};

export function Reminders({ onVoiceOpen }) {
  const { t, language } = useApp();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_time: '',
    priority: 'medium',
    category: 'general'
  });

  useEffect(() => {
    fetchReminders();
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
      setReminders(response.data);
    } catch (err) {
      console.error('Fetch reminders error:', err);
    } finally {
      setLoading(false);
    }
  };

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
    const today = new Date().toDateString();
    
    switch (activeTab) {
      case 'today':
        return reminders.filter(r => {
          const reminderDate = new Date(r.reminder_time).toDateString();
          return reminderDate === today && !r.completed;
        });
      case 'upcoming':
        return reminders.filter(r => {
          const reminderDate = new Date(r.reminder_time);
          return reminderDate > new Date() && !r.completed;
        });
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
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  const filteredReminders = filterReminders();

  return (
    <div 
      className="flex-1 px-4 pt-6 pb-4 overflow-y-auto hide-scrollbar"
      data-testid="reminders-screen"
    >
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-[#F7F9F4] p-1.5 rounded-xl">
        {['today', 'upcoming', 'completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            data-testid={`tab-${tab}`}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
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
        <form 
          onSubmit={handleCreateReminder}
          className="card mb-6 fade-in"
          data-testid="reminder-form"
        >
          <h3 className="font-semibold text-[#1F2924] mb-4">{t('add_reminder')}</h3>
          
          <div className="space-y-3">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t('reminder_title')}
              data-testid="reminder-title-input"
              className="input-field"
              required
            />
            
            <input
              type="datetime-local"
              value={formData.reminder_time}
              onChange={(e) => setFormData(prev => ({ ...prev, reminder_time: e.target.value }))}
              data-testid="reminder-time-input"
              className="input-field"
              required
            />
            
            <div className="flex gap-2">
              {['high', 'medium', 'low'].map(priority => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority }))}
                  data-testid={`priority-${priority}`}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    formData.priority === priority
                      ? priorityColors[priority]
                      : 'bg-white border-[#E4EBE5] text-[#5C7364]'
                  }`}
                >
                  {t(priority)}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 btn-secondary"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                data-testid="save-reminder-btn"
                className="flex-1 btn-primary"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : t('save')}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Reminders List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#2F6944]" />
        </div>
      ) : filteredReminders.length > 0 ? (
        <div className="space-y-3">
          {filteredReminders.map((reminder, index) => (
            <div 
              key={reminder.id}
              className={`card flex items-start gap-4 stagger-item ${
                reminder.completed ? 'opacity-60' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
              data-testid={`reminder-${reminder.id}`}
            >
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
                
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-[#5C7364]">
                    <Calendar size={14} />
                    {formatDate(reminder.reminder_time)}
                  </span>
                  <span className="flex items-center gap-1 text-[#5C7364]">
                    <Clock size={14} />
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
          ))}
        </div>
      ) : (
        <div className="card text-center py-12" data-testid="no-reminders">
          <Bell size={40} className="mx-auto text-[#E4EBE5] mb-3" />
          <p className="text-[#5C7364]">{t('no_reminders')}</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary mt-4 max-w-[200px] mx-auto"
          >
            <Plus size={18} />
            {t('add_reminder')}
          </button>
        </div>
      )}
    </div>
  );
}

export default Reminders;
