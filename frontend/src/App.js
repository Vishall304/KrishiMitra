import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { FloatingVoiceButton } from './components/voice/FloatingVoiceButton';
import { VoiceOverlay } from './components/voice/VoiceOverlay';
import { Toaster } from './components/ui/sonner';

// Pages
import { Splash } from './pages/Splash';
import { LanguageSelection } from './pages/LanguageSelection';
import { Auth } from './pages/Auth';
import { ProfileSetup } from './pages/ProfileSetup';
import { AgentHome } from './pages/AgentHome';
import { DiseaseAnalysis } from './pages/DiseaseAnalysis';
import { WeatherAdvisory } from './pages/WeatherAdvisory';
import { Reminders } from './pages/Reminders';
import { FarmHistory } from './pages/FarmHistory';
import { Profile } from './pages/Profile';

import './index.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9F4]">
        <div className="w-10 h-10 border-4 border-[#2F6944] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user === false) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

// App Layout with Navigation
function AppLayout() {
  const [voiceOpen, setVoiceOpen] = useState(false);

  const handleVoiceResult = (result) => {
    console.log('Voice result:', result);
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4]">
      <div className="max-w-2xl mx-auto min-h-screen flex flex-col pb-20">
        <Routes>
          <Route 
            path="/" 
            element={<AgentHome onVoiceOpen={() => setVoiceOpen(true)} />} 
          />
          <Route 
            path="/disease" 
            element={<DiseaseAnalysis />} 
          />
          <Route 
            path="/weather" 
            element={<WeatherAdvisory />} 
          />
          <Route 
            path="/reminders" 
            element={<Reminders onVoiceOpen={() => setVoiceOpen(true)} />} 
          />
          <Route 
            path="/history" 
            element={<FarmHistory />} 
          />
          <Route 
            path="/profile" 
            element={<Profile />} 
          />
        </Routes>
      </div>
      
      <BottomNavigation />
      <FloatingVoiceButton onClick={() => setVoiceOpen(true)} />
      <VoiceOverlay 
        isOpen={voiceOpen} 
        onClose={() => setVoiceOpen(false)}
        onResult={handleVoiceResult}
      />
    </div>
  );
}

// Main App Router
function AppRouter() {
  const { onboardingComplete } = useApp();
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Onboarding Routes */}
      <Route path="/" element={<Splash />} />
      <Route path="/language" element={<LanguageSelection />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/profile-setup" element={
        <ProtectedRoute>
          <ProfileSetup />
        </ProtectedRoute>
      } />
      
      {/* Main App Routes */}
      <Route path="/app/*" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      } />

      {/* Catch all - redirect based on state */}
      <Route path="*" element={
        onboardingComplete && isAuthenticated ? (
          <Navigate to="/app" replace />
        ) : (
          <Navigate to="/" replace />
        )
      } />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <div className="App bg-[#F7F9F4] min-h-screen">
            <AppRouter />
            <Toaster position="top-center" />
          </div>
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
