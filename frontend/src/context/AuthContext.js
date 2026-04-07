import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Configure axios defaults
axios.defaults.withCredentials = true;

// Helper to format API error details
function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export function AuthProvider({ children }) {
  // null = checking, false = not authenticated, object = authenticated
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check localStorage for token (in case httpOnly cookies don't work)
      const storedToken = localStorage.getItem('krishi_token');
      const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
      
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true,
        headers
      });
      setUser(response.data);
    } catch (err) {
      setUser(false);
      localStorage.removeItem('krishi_token');
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );
      
      // Store token as backup
      if (response.data.access_token) {
        localStorage.setItem('krishi_token', response.data.access_token);
      }
      
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (err) {
      const errorMessage = formatApiErrorDetail(err.response?.data?.detail) || err.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const signup = useCallback(async (name, email, password, phone = null) => {
    setError(null);
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        { name, email, password, phone },
        { withCredentials: true }
      );
      
      // Store token as backup
      if (response.data.access_token) {
        localStorage.setItem('krishi_token', response.data.access_token);
      }
      
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (err) {
      const errorMessage = formatApiErrorDetail(err.response?.data?.detail) || err.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const guestLogin = useCallback(async () => {
    setError(null);
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/guest`,
        {},
        { withCredentials: true }
      );
      
      // Store token as backup
      if (response.data.access_token) {
        localStorage.setItem('krishi_token', response.data.access_token);
      }
      
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (err) {
      const errorMessage = formatApiErrorDetail(err.response?.data?.detail) || err.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      // Ignore logout errors
    } finally {
      setUser(false);
      localStorage.removeItem('krishi_token');
      localStorage.removeItem('krishi_onboarding');
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    setError(null);
    try {
      const storedToken = localStorage.getItem('krishi_token');
      const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
      
      const response = await axios.put(
        `${API_URL}/api/profile`,
        profileData,
        { withCredentials: true, headers }
      );
      
      setUser(prev => ({ ...prev, ...response.data }));
      return { success: true, user: response.data };
    } catch (err) {
      const errorMessage = formatApiErrorDetail(err.response?.data?.detail) || err.message;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user && user !== false,
    login,
    signup,
    guestLogin,
    logout,
    updateProfile,
    checkAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
