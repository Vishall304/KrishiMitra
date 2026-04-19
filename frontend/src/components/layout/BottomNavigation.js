import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Leaf, CloudSun, Calendar, History, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Updated nav items - replaced Market with History
const navItems = [
  { path: '/app', icon: Home, labelKey: 'nav_agent' },
  { path: '/app/disease', icon: Leaf, labelKey: 'nav_disease' },
  { path: '/app/weather', icon: CloudSun, labelKey: 'nav_weather' },
  { path: '/app/reminders', icon: Calendar, labelKey: 'nav_reminders' },
  { path: '/app/history', icon: History, labelKey: 'nav_history' },
  { path: '/app/profile', icon: User, labelKey: 'nav_profile' },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useApp();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E4EBE5] z-40"
      data-testid="bottom-navigation"
    >
      <div className="max-w-2xl mx-auto flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/app' && location.pathname === '/app/');
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              data-testid={`nav-${item.labelKey}`}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg transition-all ${
                isActive 
                  ? 'text-[#2F6944]' 
                  : 'text-[#5C7364] hover:text-[#2F6944]'
              }`}
            >
              <Icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2}
                className="transition-all"
              />
              <span className={`text-[10px] leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;
