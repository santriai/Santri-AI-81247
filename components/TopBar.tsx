
import React from 'react';
import { BookOpen, User, Bell, Crown, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from './UserAvatar';
import { useUnreadCount } from '../hooks/useUnreadCount';

const TopBar: React.FC<{ title?: string, showBack?: boolean }> = ({ title = "Santri Modern", showBack = false }) => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const unreadCount = useUnreadCount();

  return (
    <header className="fixed top-0 left-0 right-0 bg-santri-green dark:bg-santri-green-dark text-white px-4 py-3 flex items-center justify-between shadow-md z-50 transition-colors duration-300 border-b border-santri-gold/30 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {showBack ? (
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-lg transition-all active:scale-90">
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
        ) : (
          <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm border border-santri-gold/50">
            <BookOpen size={18} strokeWidth={3} className="text-santri-gold" />
          </div>
        )}
        <h1 className="text-base font-black tracking-tight text-white uppercase">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/notifications')} className="relative p-1.5 text-white/90 bg-white/10 rounded-lg hover:bg-white/20 transition-all active:scale-90 flex items-center justify-center border border-white/5 h-8 w-8" title="Notifikasi">
          <span className="text-base leading-none select-none">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full border border-white dark:border-slate-900 shadow-sm flex items-center justify-center px-1 text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => navigate('/profile')} 
          className="relative active:scale-90 transition-all"
        >
          <UserAvatar 
            photoURL={userData?.photoURL || user?.photoURL}
            displayName={user?.displayName}
            points={userData?.points || 0}
            size="sm"
          />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
