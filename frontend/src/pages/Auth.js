import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, UserPlus, LogIn } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export function Auth() {
  const navigate = useNavigate();
  const { t } = useApp();
  const { login, signup, guestLogin, isAuthenticated, user, error, clearError } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.profile_completed) {
        navigate('/app');
      } else {
        navigate('/profile-setup');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Clear errors on tab switch
  useEffect(() => {
    setLocalError('');
    clearError();
  }, [isLogin, clearError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError('');
  };

  const validateForm = () => {
    if (!isLogin && !formData.name.trim()) {
      setLocalError('Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      setLocalError('Please enter your email');
      return false;
    }
    if (!formData.password) {
      setLocalError('Please enter your password');
      return false;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return false;
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setLocalError('');
    
    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await signup(formData.name, formData.email, formData.password, formData.phone || null);
      }
      
      if (result.success) {
        if (result.user.profile_completed) {
          navigate('/app');
        } else {
          navigate('/profile-setup');
        }
      } else {
        setLocalError(result.error);
      }
    } catch (err) {
      setLocalError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setLocalError('');
    
    try {
      const result = await guestLogin();
      if (result.success) {
        navigate('/profile-setup');
      } else {
        setLocalError(result.error);
      }
    } catch (err) {
      setLocalError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-[#F7F9F4]"
      data-testid="auth-screen"
    >
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header with background */}
        <div className="flex-shrink-0 pt-12 pb-10 px-6 bg-gradient-to-br from-[#2F6944] to-[#51A870] rounded-b-[2.5rem]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white font-['Outfit'] mb-2">
              {t('app_name')}
            </h1>
            <p className="text-white/80 text-sm">{t('tagline')}</p>
          </div>
        </div>

        {/* Tabs - Floating */}
        <div className="px-6 -mt-7 relative z-10">
          <div className="bg-white rounded-2xl p-1.5 shadow-lg flex">
            <button
              onClick={() => setIsLogin(true)}
              data-testid="login-tab"
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                isLogin 
                  ? 'bg-[#2F6944] text-white shadow-md' 
                  : 'text-[#5C7364] hover:text-[#2F6944]'
              }`}
            >
              <LogIn size={16} />
              {t('login')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              data-testid="signup-tab"
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                !isLogin 
                  ? 'bg-[#2F6944] text-white shadow-md' 
                  : 'text-[#5C7364] hover:text-[#2F6944]'
              }`}
            >
              <UserPlus size={16} />
              {t('signup')}
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
          {/* Name (signup only) */}
          {!isLogin && (
            <div className="space-y-1.5 fade-in">
              <label className="block text-sm font-medium text-[#1F2924] pl-1">
                {t('name')}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C7364]" size={18} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  data-testid="auth-name-input"
                  placeholder={t('name')}
                  className="w-full h-12 bg-white border border-[#E4EBE5] rounded-xl pl-11 pr-4 text-[#1F2924] placeholder:text-[#5C7364]/50 focus:outline-none focus:border-[#2F6944] focus:ring-2 focus:ring-[#2F6944]/10 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#1F2924] pl-1">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C7364]" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                data-testid="auth-email-input"
                placeholder={t('email')}
                className="w-full h-12 bg-white border border-[#E4EBE5] rounded-xl pl-11 pr-4 text-[#1F2924] placeholder:text-[#5C7364]/50 focus:outline-none focus:border-[#2F6944] focus:ring-2 focus:ring-[#2F6944]/10 transition-all"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Phone (signup only) */}
          {!isLogin && (
            <div className="space-y-1.5 fade-in">
              <label className="block text-sm font-medium text-[#1F2924] pl-1">
                {t('phone')} <span className="text-[#5C7364] font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C7364]" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  data-testid="auth-phone-input"
                  placeholder={t('phone')}
                  className="w-full h-12 bg-white border border-[#E4EBE5] rounded-xl pl-11 pr-4 text-[#1F2924] placeholder:text-[#5C7364]/50 focus:outline-none focus:border-[#2F6944] focus:ring-2 focus:ring-[#2F6944]/10 transition-all"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#1F2924] pl-1">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C7364]" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                data-testid="auth-password-input"
                placeholder={t('password')}
                className="w-full h-12 bg-white border border-[#E4EBE5] rounded-xl pl-11 pr-11 text-[#1F2924] placeholder:text-[#5C7364]/50 focus:outline-none focus:border-[#2F6944] focus:ring-2 focus:ring-[#2F6944]/10 transition-all"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5C7364] hover:text-[#2F6944] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (signup only) */}
          {!isLogin && (
            <div className="space-y-1.5 fade-in">
              <label className="block text-sm font-medium text-[#1F2924] pl-1">
                {t('confirm_password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C7364]" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  data-testid="auth-confirm-password-input"
                  placeholder={t('confirm_password')}
                  className="w-full h-12 bg-white border border-[#E4EBE5] rounded-xl pl-11 pr-4 text-[#1F2924] placeholder:text-[#5C7364]/50 focus:outline-none focus:border-[#2F6944] focus:ring-2 focus:ring-[#2F6944]/10 transition-all"
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {(localError || error) && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm fade-in" data-testid="auth-error">
              {localError || error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            data-testid="auth-submit-btn"
            className="w-full h-12 bg-[#2F6944] text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[#224A30] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#2F6944]/20"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              isLogin ? t('login') : t('signup')
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-1">
            <div className="flex-1 h-px bg-[#E4EBE5]" />
            <span className="text-[#5C7364] text-xs uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[#E4EBE5]" />
          </div>

          {/* Guest login */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            data-testid="guest-login-btn"
            className="w-full h-12 bg-white text-[#2F6944] font-semibold rounded-xl flex items-center justify-center gap-2 border-2 border-[#E4EBE5] hover:border-[#2F6944] transition-colors disabled:opacity-60"
          >
            {t('continue_as_guest')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Auth;
