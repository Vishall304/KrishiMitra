import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Leaf, CloudSun, Calendar, ShoppingBag, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navItems = [
  { path: '/app', icon: Home, labelKey: 'nav_agent' },
  { path: '/app/disease', icon: Leaf, labelKey: 'nav_disease' },
  { path: '/app/weather', icon: CloudSun, labelKey: 'nav_weather' },
  { path: '/app/reminders', icon: Calendar, labelKey: 'nav_reminders' },
  { path: '/app/market', icon: ShoppingBag, labelKey: 'nav_market' },
  { path: '/app/profile', icon: User, labelKey: 'nav_profile' },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useApp();

  return (
    <nav 
      className="fixed bottom-0 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-[#E4EBE5] flex justify-around items-center h-20 px-2 pb-safe z-40 left-1/2 -translate-x-1/2"
      data-testid="bottom-navigation"
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || 
          (item.path === '/app' && location.pathname === '/app/');
        const Icon = item.icon;
        
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            data-testid={`nav-${item.labelKey}`}
            className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all min-w-[56px] ${
              isActive 
                ? 'text-[#2F6944] bg-[#2F6944]/5' 
                : 'text-[#5C7364] hover:text-[#2F6944]'
            }`}
          >
            <Icon 
              size={22} 
              strokeWidth={isActive ? 2.5 : 2}
              className="transition-all"
            />
            <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
              {t(item.labelKey)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNavigation;
