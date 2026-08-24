import React from 'react';
import { Home, Book, BookOpen, Scroll, MessageSquare, Crown } from 'lucide-react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData } = useAuth();
  const { t } = useLanguage();

  // Hide NavBar on specific routes
  const isHiddenRoute = location.pathname === '/input' || location.pathname === '/admin' || location.pathname === '/community' || location.pathname.startsWith('/quran') || location.pathname.startsWith('/learning-quran') || location.pathname === '/qibla' || location.pathname.startsWith('/qibla');

  if (isHiddenRoute) return null;

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, icon: Icon, label, activeColor }: { path: string, icon: any, label: string, activeColor: string }) => (
    <button
      onClick={() => navigate(path)}
      className={`flex flex-col items-center gap-1 min-w-[55px] transition-all active:scale-90 relative ${activeColor}`}
    >
      <div className={`p-1 transition-all duration-300 ${isActive(path) ? 'scale-110' : 'scale-100'}`}>
        <Icon 
          size={24} 
          strokeWidth={isActive(path) ? 3 : 2} 
          fill={isActive(path) ? "currentColor" : "none"}
          className="transition-all" 
        />
      </div>
      <span className={`text-[10px] tracking-tight transition-all ${isActive(path) ? 'font-black scale-105 opacity-100' : 'font-bold opacity-70'}`}>
        {label}
      </span>
    </button>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t-2 border-slate-100 dark:border-slate-800 px-2 py-2 flex justify-around items-center z-50 safe-area-bottom shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] dark:shadow-none transition-colors duration-300">
      <NavItem path="/" icon={Home} label={t('nav.home', 'Beranda')} activeColor="text-emerald-600 dark:text-emerald-400" />
      <NavItem path="/kitab" icon={Book} label={t('nav.kitab', 'Kitab')} activeColor="text-amber-600 dark:text-amber-400" />
      <NavItem path="/quran" icon={BookOpen} label={t('nav.quran', 'Al-Quran')} activeColor="text-blue-600 dark:text-blue-400" />
      <NavItem path="/hadis" icon={Scroll} label={t('nav.hadis', 'Hadis')} activeColor="text-rose-600 dark:text-rose-400" />
      <NavItem path="/community" icon={MessageSquare} label={t('nav.community', 'Silaturahmi')} activeColor="text-amber-600 dark:text-amber-400" />
    </nav>
  );
};

export default NavBar;