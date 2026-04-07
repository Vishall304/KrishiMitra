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
      className="min-h-screen min-h-[100dvh] w-full max-w-md mx-auto bg-[#F7F9F4] flex flex-col"
      data-testid="auth-screen"
    >
      {/* Header with background */}
      <div className="flex-none pt-12 pb-8 px-6 bg-gradient-to-br from-[#2F6944] to-[#51A870] rounded-b-[2rem]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white font-['Outfit'] mb-2">
            {t('app_name')}
          </h1>
          <p className="text-white/80">{t('tagline')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-none px-6 -mt-6">
        <div className="bg-white rounded-2xl p-1.5 shadow-[0_4px_24px_rgba(47,105,68,0.1)] flex">
          <button
            onClick={() => setIsLogin(true)}
            data-testid="login-tab"
            className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              isLogin 
                ? 'bg-[#2F6944] text-white' 
                : 'text-[#5C7364] hover:text-[#2F6944]'
            }`}
          >
            <LogIn size={18} />
            {t('login')}
          </button>
          <button
            onClick={() => setIsLogin(false)}
            data-testid="signup-tab"
            className={`flex-1 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              !isLogin 
                ? 'bg-[#2F6944] text-white' 
                : 'text-[#5C7364] hover:text-[#2F6944]'
            }`}
          >
            <UserPlus size={18} />
            {t('signup')}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 px-6 py-6 space-y-4">
        {/* Name (signup only) */}
        {!isLogin && (
          <div className="space-y-2 fade-in">
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
                data-testid="auth-name-input"
                placeholder={t('name')}
                className="input-field pl-12"
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#1F2924]">
            {t('email')}
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C7364]" size={20} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              data-testid="auth-email-input"
              placeholder={t('email')}
              className="input-field pl-12"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Phone (signup only) */}
        {!isLogin && (
          <div className="space-y-2 fade-in">
            <label className="block text-sm font-medium text-[#1F2924]">
              {t('phone')} <span className="text-[#5C7364]">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C7364]" size={20} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                data-testid="auth-phone-input"
                placeholder={t('phone')}
                className="input-field pl-12"
              />
            </div>
          </div>
        )}

        {/* Password */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#1F2924]">
            {t('password')}
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C7364]" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              data-testid="auth-password-input"
              placeholder={t('password')}
              className="input-field pl-12 pr-12"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5C7364] hover:text-[#2F6944]"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Confirm Password (signup only) */}
        {!isLogin && (
          <div className="space-y-2 fade-in">
            <label className="block text-sm font-medium text-[#1F2924]">
              {t('confirm_password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5C7364]" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                data-testid="auth-confirm-password-input"
                placeholder={t('confirm_password')}
                className="input-field pl-12"
                autoComplete="new-password"
              />
            </div>
          </div>
        )}

        {/* Error message */}
        {(localError || error) && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm fade-in" data-testid="auth-error">
            {localError || error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          data-testid="auth-submit-btn"
          className="btn-primary mt-6"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            isLogin ? t('login') : t('signup')
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-[#E4EBE5]" />
          <span className="text-[#5C7364] text-sm">or</span>
          <div className="flex-1 h-px bg-[#E4EBE5]" />
        </div>

        {/* Guest login */}
        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={loading}
          data-testid="guest-login-btn"
          className="btn-secondary"
        >
          {t('continue_as_guest')}
        </button>
      </form>
    </div>
  );
}

export default Auth;
