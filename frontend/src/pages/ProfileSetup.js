import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Sprout, Ruler, Tractor, Loader2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const cropOptions = [
  'Rice (चावल)', 'Wheat (गेहूं)', 'Cotton (कपास)', 'Sugarcane (गन्ना)',
  'Tomato (टमाटर)', 'Onion (प्याज)', 'Potato (आलू)', 'Soybean (सोयाबीन)',
  'Maize (मक्का)', 'Groundnut (मूंगफली)', 'Chili (मिर्च)', 'Other'
];

const states = [
  'Maharashtra', 'Madhya Pradesh', 'Uttar Pradesh', 'Gujarat', 
  'Rajasthan', 'Karnataka', 'Punjab', 'Haryana', 
  'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Bihar', 'Other'
];

export function ProfileSetup() {
  const navigate = useNavigate();
  const { t, setOnboardingComplete, language } = useApp();
  const { user, updateProfile, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    village: '',
    district: '',
    state: '',
    primary_crop: '',
    land_size: '',
    farming_type: 'conventional',
    language: language
  });

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        village: user.village || '',
        district: user.district || '',
        state: user.state || '',
        primary_crop: user.primary_crop || '',
        land_size: user.land_size || '',
        farming_type: user.farming_type || 'conventional',
        language: language
      }));
    }
  }, [user, language]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setOnboardingComplete(true);
        navigate('/app');
      }
    } catch (err) {
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setOnboardingComplete(true);
    navigate('/app');
  };

  return (
    <div 
      className="min-h-screen min-h-[100dvh] w-full max-w-md mx-auto bg-[#F7F9F4] flex flex-col"
      data-testid="profile-setup-screen"
    >
      {/* Header */}
      <div className="flex-none pt-8 pb-4 px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2924] font-['Outfit']">
              {t('setup_profile')}
            </h1>
            <p className="text-[#5C7364] text-sm mt-1">{t('profile_subtitle')}</p>
          </div>
          <button
            onClick={handleSkip}
            data-testid="skip-profile-btn"
            className="text-[#5C7364] hover:text-[#2F6944] font-medium"
          >
            {t('skip')}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 px-6 pb-8 overflow-y-auto hide-scrollbar space-y-4">
        {/* Name */}
        <div className="space-y-2 stagger-item">
          <label className="block text-sm font-medium text-[#1F2924]">
            {t('name')}
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C7364]" size={20} />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              data-testid="profile-name-input"
              placeholder={t('name')}
              className="input-field pl-12"
            />
          </div>
        </div>

        {/* Village */}
        <div className="space-y-2 stagger-item">
          <label className="block text-sm font-medium text-[#1F2924]">
            {t('village')}
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C7364]" size={20} />
            <input
              type="text"
              name="village"
              value={formData.village}
              onChange={handleInputChange}
              data-testid="profile-village-input"
              placeholder={t('village')}
              className="input-field pl-12"
            />
          </div>
        </div>

        {/* District */}
        <div className="space-y-2 stagger-item">
          <label className="block text-sm font-medium text-[#1F2924]">
            {t('district')}
          </label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            data-testid="profile-district-input"
            placeholder={t('district')}
            className="input-field"
          />
        </div>

        {/* State */}
        <div className="space-y-2 stagger-item">
          <label className="block text-sm font-medium text-[#1F2924]">
            {t('state')}
          </label>
          <select
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            data-testid="profile-state-select"
            className="input-field appearance-none cursor-pointer"
          >
            <option value="">{t('state')}</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* Primary Crop */}
        <div className="space-y-2 stagger-item">
          <label className="block text-sm font-medium text-[#1F2924]">
            {t('primary_crop')}
          </label>
          <div className="relative">
            <Sprout className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C7364]" size={20} />
            <select
              name="primary_crop"
              value={formData.primary_crop}
              onChange={handleInputChange}
              data-testid="profile-crop-select"
              className="input-field pl-12 appearance-none cursor-pointer"
            >
              <option value="">{t('primary_crop')}</option>
              {cropOptions.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Land Size */}
        <div className="space-y-2 stagger-item">
          <label className="block text-sm font-medium text-[#1F2924]">
            {t('land_size')}
          </label>
          <div className="relative">
            <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C7364]" size={20} />
            <input
              type="text"
              name="land_size"
              value={formData.land_size}
              onChange={handleInputChange}
              data-testid="profile-land-input"
              placeholder={t('land_size')}
              className="input-field pl-12"
            />
          </div>
        </div>

        {/* Farming Type */}
        <div className="space-y-2 stagger-item">
          <label className="block text-sm font-medium text-[#1F2924]">
            {t('farming_type')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['organic', 'conventional', 'mixed'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, farming_type: type }))}
                data-testid={`farming-type-${type}`}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  formData.farming_type === type
                    ? 'bg-[#2F6944]/5 border-[#2F6944] text-[#2F6944]'
                    : 'bg-white border-[#E4EBE5] text-[#5C7364] hover:border-[#2F6944]/50'
                }`}
              >
                <Tractor size={20} />
                <span className="text-xs font-medium">{t(type)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          data-testid="profile-submit-btn"
          className="btn-primary mt-6 !flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              {t('save')}
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ProfileSetup;
