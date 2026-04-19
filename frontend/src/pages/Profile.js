import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Sprout, Ruler, Globe, LogOut, ChevronRight, Loader2, Edit2, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'mr', name: 'मराठी' },
];

export function Profile() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useApp();
  const { user, logout, updateProfile } = useAuth();
  
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    village: user?.village || '',
    district: user?.district || '',
    state: user?.state || '',
    primary_crop: user?.primary_crop || '',
    land_size: user?.land_size || '',
    farming_type: user?.farming_type || '',
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ ...formData, language });
      setEditing(false);
    } catch (err) {
      console.error('Update profile error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = async (code) => {
    setLanguage(code);
    try {
      await updateProfile({ language: code });
    } catch (err) {
      console.error('Update language error:', err);
    }
  };

  const profileItems = [
    { icon: MapPin, label: t('village'), value: user?.village, key: 'village' },
    { icon: MapPin, label: t('district'), value: user?.district, key: 'district' },
    { icon: MapPin, label: t('state'), value: user?.state, key: 'state' },
    { icon: Sprout, label: t('primary_crop'), value: user?.primary_crop, key: 'primary_crop' },
    { icon: Ruler, label: t('land_size'), value: user?.land_size, key: 'land_size' },
  ];

  return (
    <div 
      className="flex-1 px-4 pt-6 pb-4 overflow-y-auto hide-scrollbar"
      data-testid="profile-screen"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 page-enter">
        <h1 className="text-2xl font-bold text-[#1F2924] font-['Outfit']">
          {t('profile_title')}
        </h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            data-testid="edit-profile-btn"
            className="flex items-center gap-2 text-[#2F6944] font-medium"
          >
            <Edit2 size={18} />
            {t('edit_profile')}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              data-testid="cancel-edit-btn"
              className="w-9 h-9 rounded-lg bg-[#F7F9F4] flex items-center justify-center text-[#5C7364]"
            >
              <X size={18} />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              data-testid="save-profile-btn"
              className="w-9 h-9 rounded-lg bg-[#2F6944] flex items-center justify-center text-white"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="card mb-6" data-testid="profile-card">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#2F6944]/10 flex items-center justify-center">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={36} className="text-[#2F6944]" />
            )}
          </div>
          
          <div className="flex-1">
            {editing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                data-testid="profile-name-edit"
                className="input-field mb-1"
              />
            ) : (
              <h2 className="text-xl font-bold text-[#1F2924]">{user?.name || 'Farmer'}</h2>
            )}
            <p className="text-sm text-[#5C7364]">{user?.email}</p>
            {user?.is_guest && (
              <span className="badge badge-info mt-1">Guest</span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="space-y-3 mb-6">
        {profileItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.key}
              className="card flex items-center gap-4 stagger-item"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#F7F9F4] flex items-center justify-center text-[#2F6944]">
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#5C7364]">{item.label}</p>
                {editing ? (
                  <input
                    type="text"
                    value={formData[item.key]}
                    onChange={(e) => setFormData(prev => ({ ...prev, [item.key]: e.target.value }))}
                    data-testid={`profile-${item.key}-edit`}
                    className="w-full mt-1 p-2 border border-[#E4EBE5] rounded-lg text-[#1F2924] focus:outline-none focus:border-[#2F6944]"
                  />
                ) : (
                  <p className="font-medium text-[#1F2924]">
                    {item.value || '-'}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Language Preference */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[#1F2924] mb-3 font-['Outfit'] flex items-center gap-2">
          <Globe size={18} className="text-[#2F6944]" />
          {t('language_preference')}
        </h3>
        <div className="flex gap-2">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              data-testid={`lang-select-${lang.code}`}
              className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                language === lang.code
                  ? 'bg-[#2F6944] text-white'
                  : 'bg-[#F7F9F4] text-[#5C7364] hover:bg-[#E4EBE5]'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#2F6944]">0</p>
          <p className="text-sm text-[#5C7364]">
            {language === 'hi' ? 'रिमाइंडर' : language === 'mr' ? 'स्मरणपत्रे' : 'Reminders'}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#2F6944]">0</p>
          <p className="text-sm text-[#5C7364]">
            {language === 'hi' ? 'रोग जांच' : language === 'mr' ? 'रोग तपासणी' : 'Disease Checks'}
          </p>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        data-testid="logout-btn"
        className="w-full card flex items-center justify-between text-red-500 hover:bg-red-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <LogOut size={20} />
          <span className="font-medium">{t('logout')}</span>
        </div>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export default Profile;
