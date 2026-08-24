
import React from 'react';
import { 
  User as UserIcon, 
  Crown, 
  Trophy, 
  Brain, 
  Sparkles, 
  Cpu, 
  BookOpen, 
  Star,
  BadgeCheck,
  Medal,
  CheckCircle2,
  Award,
  Zap,
  Moon,
  Shield,
  GraduationCap
} from 'lucide-react';
import { getRankDetails } from '../services/firebase';

interface UserAvatarProps {
  photoURL?: string | null;
  displayName?: string | null;
  points?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  avatarFrame?: string;
  rankIndex?: number; // 0-based index for ranking
  verificationBadge?: string;
}

const FRAME_GRADIENTS: Record<string, string> = {
  'rank_1': 'from-amber-400 via-amber-200 to-amber-500',
  'rank_2': 'from-slate-300 via-slate-100 to-slate-400',
  'rank_3': 'from-orange-400 via-orange-200 to-orange-500',
  'rank_4': 'from-rose-500 via-pink-400 to-red-500',
  'rank_5': 'from-emerald-500 via-teal-200 to-teal-600',
  'rank_6': 'from-cyan-500 via-cyan-150 to-blue-600',
  'rank_7': 'from-fuchsia-500 via-pink-200 to-rose-500',
  'rank_8': 'from-indigo-500 via-purple-200 to-pink-500',
  'rank_9': 'from-teal-500 via-emerald-100 to-green-600',
  'rank_10': 'from-slate-700 via-slate-400 to-slate-800',
  'rank_top10': 'from-emerald-400 via-emerald-200 to-emerald-500',
  'premium_pemula': 'from-emerald-500 via-amber-300 to-teal-600',
  'premium_royal': 'from-purple-600 via-purple-300 to-purple-800',
  'premium_ai': 'from-blue-500 via-cyan-300 to-blue-700',
  'premium_gold': 'from-yellow-500 via-yellow-200 to-yellow-600',
  'premium_moon': 'from-indigo-600 via-sky-400 to-indigo-800',
  'premium_crescent': 'from-amber-400 via-yellow-200 to-orange-500',
  'premium_star': 'from-rose-400 via-amber-200 to-yellow-400',
  'premium_moonstar': 'from-cyan-500 via-violet-300 to-fuchsia-600',
  'premium_shield': 'from-emerald-500 via-teal-300 to-blue-600',
  'premium_book': 'from-emerald-600 via-green-300 to-teal-700',
  'premium_toga': 'from-rose-600 via-red-300 to-red-800',
  'premium_sultan_pro': 'from-yellow-500 via-amber-200 via-yellow-300 to-amber-600',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  photoURL, 
  displayName, 
  points = 0, 
  size = 'md',
  className = '',
  avatarFrame = 'none',
  rankIndex,
  verificationBadge = 'none'
}) => {
  const rank = getRankDetails(points);
  const frameGradient = avatarFrame !== 'none' ? FRAME_GRADIENTS[avatarFrame] : null;

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const ringSizes = {
    xs: '-inset-[1px]',
    sm: '-inset-[1.5px]',
    md: '-inset-[2px]',
    lg: '-inset-[3px]',
    xl: '-inset-[4px]'
  };

  const rankIconSizes = {
    xs: 'text-[6px]',
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-[12px]',
    xl: 'text-[16px]'
  };

  const renderDecorator = () => {
    const iconSize = size === 'xl' ? 24 : size === 'lg' ? 18 : 12;
    const decorators: React.ReactNode[] = [];
    
    // Priority 1: Ranking Decorators (podium & elite ranks)
    if (rankIndex === 0) {
      decorators.push(
        <div key="podium-1" className="absolute -top-3.5 left-0 right-0 mx-auto w-fit drop-shadow-lg z-30 animate-bounce">
          <span className="text-[17px] sm:text-[22px] leading-none select-none">🏆</span>
        </div>
      );
    } else if (rankIndex === 1) {
      decorators.push(
        <div key="podium-2" className="absolute -top-3 left-0 right-0 mx-auto w-fit drop-shadow-lg z-30 animate-bounce [animation-delay:200ms]">
          <span className="text-[16px] sm:text-[20px] leading-none select-none">👑</span>
        </div>
      );
    } else if (rankIndex === 2) {
      decorators.push(
        <div key="podium-3" className="absolute -top-3 left-0 right-0 mx-auto w-fit drop-shadow-lg z-30 animate-bounce [animation-delay:400ms]">
          <span className="text-[16px] sm:text-[20px] leading-none select-none">🌟</span>
        </div>
      );
    } else if (rankIndex === 3) {
      decorators.push(
        <div key="podium-4" className="absolute -top-2.5 left-0 right-0 mx-auto w-fit drop-shadow-md z-30 animate-bounce [animation-delay:100ms]">
          <span className="text-[15px] sm:text-[19px] leading-none select-none">🛡️</span>
        </div>
      );
    } else if (rankIndex === 4) {
      decorators.push(
        <div key="podium-5" className="absolute -top-2.5 left-0 right-0 mx-auto w-fit drop-shadow-md z-30 animate-bounce [animation-delay:200ms]">
          <span className="text-[15px] sm:text-[19px] leading-none select-none">📖</span>
        </div>
      );
    } else if (rankIndex === 5) {
      decorators.push(
        <div key="podium-6" className="absolute -top-2.5 -right-1 drop-shadow-md z-30 animate-bounce [animation-delay:300ms]">
          <span className="text-[15px] sm:text-[19px] leading-none select-none">🌜</span>
        </div>
      );
    } else if (rankIndex === 6) {
      decorators.push(
        <div key="podium-7" className="absolute -top-3 left-0 right-0 mx-auto w-fit drop-shadow-md z-30 animate-bounce [animation-delay:400ms]">
          <span className="text-[15px] sm:text-[19px] leading-none select-none">📿</span>
        </div>
      );
    } else if (rankIndex === 7) {
      decorators.push(
        <div key="podium-8" className="absolute -top-2.5 -right-1 drop-shadow-md z-30 animate-pulse">
          <span className="text-[15px] sm:text-[19px] leading-none select-none">🧠</span>
        </div>
      );
    } else if (rankIndex === 8) {
      decorators.push(
        <div key="podium-9" className="absolute -top-3 left-0 right-0 mx-auto w-fit drop-shadow-md z-30 animate-bounce [animation-delay:500ms]">
          <span className="text-[15px] sm:text-[19px] leading-none select-none">🎓</span>
        </div>
      );
    } else if (rankIndex === 9) {
      decorators.push(
        <div key="podium-10" className="absolute -top-2.5 -right-1 drop-shadow-md z-30 animate-pulse">
          <span className="text-[15px] sm:text-[19px] leading-none select-none">⚡</span>
        </div>
      );
    }

    // Priority 2: Frame Specific Decorators
    if (avatarFrame === 'premium_pemula') {
      decorators.push(
        <div key="frame-pemula" className="absolute -top-3 left-0 right-0 mx-auto w-fit drop-shadow-md z-30 animate-pulse">
          <span className="text-[16px] sm:text-[20px] leading-none select-none">✨</span>
        </div>
      );
    } else if (avatarFrame === 'premium_royal') {
      decorators.push(
        <div key="frame-crown" className={`absolute ${rankIndex === 0 ? '-top-6' : '-top-3.5'} left-0 right-0 mx-auto w-fit drop-shadow-lg z-[31] animate-bounce`}>
          <span className="text-[18px] sm:text-[24px] leading-none select-none">👑</span>
        </div>
      );
    } else if (avatarFrame === 'premium_ai') {
      decorators.push(
        <div key="frame-cpu" className="absolute -top-1.5 -left-1 drop-shadow-md z-30 animate-pulse">
          <span className="text-[15px] sm:text-[19px] leading-none select-none">💠</span>
        </div>
      );
    } else if (avatarFrame === 'premium_gold') {
      decorators.push(
        <React.Fragment key="frame-gold">
          <div className="absolute -bottom-2 left-0 right-0 mx-auto w-fit drop-shadow-md z-30 animate-pulse">
            <span className="text-[15px] sm:text-[19px] leading-none select-none">💖</span>
          </div>
        </React.Fragment>
      );
    } else if (avatarFrame === 'premium_moon') {
      decorators.push(
        <div key="frame-moon" className="absolute -top-2.5 -right-1 drop-shadow-md z-30 animate-bounce">
          <span className="text-[15px] sm:text-[19px] leading-none select-none">🌙</span>
        </div>
      );
    } else if (avatarFrame === 'premium_crescent') {
      decorators.push(
        <div key="frame-crescent" className="absolute -top-2.5 -left-1 drop-shadow-md z-30 animate-bounce [animation-delay:150ms]">
          <span className="text-[15px] sm:text-[19px] leading-none select-none">🌜</span>
        </div>
      );
    } else if (avatarFrame === 'premium_star') {
      decorators.push(
        <div key="frame-star" className="absolute -top-3.5 left-0 right-0 mx-auto w-fit drop-shadow-md z-30 animate-bounce delay-300">
          <span className="text-[16px] sm:text-[20px] leading-none select-none">⭐</span>
        </div>
      );
    } else if (avatarFrame === 'premium_moonstar') {
      decorators.push(
        <div key="frame-moonstar" className="absolute -top-3 left-0 right-0 mx-auto w-fit drop-shadow-lg z-30 flex items-center justify-center animate-bounce">
          <span className="text-[16px] sm:text-[20px] leading-none select-none">💫</span>
        </div>
      );
    } else if (avatarFrame === 'premium_shield') {
      decorators.push(
        <div key="frame-shield" className="absolute -top-2.5 left-0 right-0 mx-auto w-fit drop-shadow-md z-30 animate-bounce">
          <span className="text-[15px] sm:text-[19px] leading-none select-none">🛡️</span>
        </div>
      );
    } else if (avatarFrame === 'premium_book') {
      decorators.push(
        <div key="frame-book" className="absolute -top-3 left-0 right-0 mx-auto w-fit drop-shadow-md z-30 animate-bounce [animation-delay:200ms]">
          <span className="text-[15px] sm:text-[19px] leading-none select-none">📖</span>
        </div>
      );
    } else if (avatarFrame === 'premium_toga') {
      decorators.push(
        <div key="frame-toga" className="absolute -top-3 left-0 right-0 mx-auto w-fit drop-shadow-md z-[31] animate-bounce [animation-delay:100ms]">
          <span className="text-[16px] sm:text-[20px] leading-none select-none">🎓</span>
        </div>
      );
    } else if (avatarFrame === 'premium_sultan_pro') {
      decorators.push(
        <React.Fragment key="frame-sultan-pro">
          {/* Main bouncing Diamond icon */}
          <div className="absolute -top-5 left-0 right-0 mx-auto w-fit drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)] z-30 animate-bounce">
            <span className="text-[19px] sm:text-[26px] leading-none select-none">💎</span>
          </div>
          
          {/* Inner and outer rings with different colors pulsing/pinging rapidly outwards */}
          <div className="absolute inset-1 rounded-full border border-yellow-300 animate-ping [animation-duration:0.7s] z-0" />
          <div className="absolute inset-0.5 rounded-full border border-sky-400 animate-ping [animation-duration:0.9s] z-0" />
          <div className="absolute -inset-1 rounded-full border border-rose-400 animate-ping [animation-duration:1.1s] z-0" />
          <div className="absolute -inset-2 rounded-full border border-emerald-400 animate-ping [animation-duration:1.3s] z-0" />

          {/* Rapidly flashing core light halo */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400/20 via-sky-300/10 to-rose-400/20 animate-pulse [animation-duration:0.5s] z-0 blur-sm" />
          
          {/* Sparkles */}
          <div className="absolute -top-1 right-0 animate-pulse [animation-duration:0.4s] z-30">
            <span className="text-[10px] leading-none select-none">✨</span>
          </div>
          <div className="absolute bottom-1 -left-1 animate-pulse [animation-duration:0.6s] z-30">
            <span className="text-[10px] leading-none select-none">♻️</span>
          </div>
        </React.Fragment>
      );
    } else if (avatarFrame === 'rank_top10' && rankIndex === undefined) {
      decorators.push(
        <div key="frame-brain" className="absolute -top-2.5 -right-1 drop-shadow-md z-30 animate-pulse">
          <span className="text-[12px] sm:text-[15px] leading-none select-none">⚡</span>
        </div>
      );
    } else if (rankIndex === undefined) {
      // Show default frame decorators only if no podium rank
      if (avatarFrame === 'rank_1') {
        decorators.push(<div key="frame-rank1" className="absolute -top-3.5 left-0 right-0 mx-auto w-fit drop-shadow-md z-30 animate-bounce"><span className="text-[14px] sm:text-[18px] leading-none select-none">🏆</span></div>);
      } else if (avatarFrame === 'rank_2') {
        decorators.push(<div key="frame-rank2" className="absolute -top-3 left-0 right-0 mx-auto w-fit drop-shadow-md z-30 animate-bounce [animation-delay:200ms]"><span className="text-[13px] sm:text-[16px] leading-none select-none">👑</span></div>);
      } else if (avatarFrame === 'rank_3') {
        decorators.push(<div key="frame-rank3" className="absolute -top-3 left-0 right-0 mx-auto w-fit drop-shadow-md z-30 animate-bounce [animation-delay:400ms]"><span className="text-[13px] sm:text-[16px] leading-none select-none">🌟</span></div>);
      } else if (avatarFrame === 'rank_4') {
        decorators.push(<div key="frame-rank4" className="absolute -top-2.5 left-0 right-0 mx-auto w-fit drop-shadow-md z-30 animate-bounce [animation-delay:100ms]"><span className="text-[12px] sm:text-[15px] leading-none select-none">🛡️</span></div>);
      } else if (avatarFrame === 'rank_5') {
        decorators.push(<div key="frame-rank5" className="absolute -top-2.5 left-0 right-0 mx-auto w-fit drop-shadow-md z-30 animate-bounce [animation-delay:200ms]"><span className="text-[12px] sm:text-[15px] leading-none select-none">📖</span></div>);
      } else if (avatarFrame === 'rank_6') {
        decorators.push(<div key="frame-rank6" className="absolute -top-2.5 -right-1 drop-shadow-md z-30 animate-bounce [animation-delay:300ms]"><span className="text-[12px] sm:text-[15px] leading-none select-none">🌜</span></div>);
      } else if (avatarFrame === 'rank_7') {
        decorators.push(<div key="frame-rank7" className="absolute -top-3 left-0 right-0 mx-auto w-fit drop-shadow-md z-30 animate-bounce [animation-delay:400ms]"><span className="text-[12px] sm:text-[15px] leading-none select-none">📿</span></div>);
      } else if (avatarFrame === 'rank_8') {
        decorators.push(<div key="frame-rank8" className="absolute -top-2.5 -right-1 drop-shadow-md z-30 animate-pulse"><span className="text-[12px] sm:text-[15px] leading-none select-none">🧠</span></div>);
      } else if (avatarFrame === 'rank_9') {
        decorators.push(<div key="frame-rank9" className="absolute -top-3 left-0 right-0 mx-auto w-fit drop-shadow-md z-30 animate-bounce [animation-delay:500ms]"><span className="text-[12px] sm:text-[15px] leading-none select-none">🎓</span></div>);
      } else if (avatarFrame === 'rank_10') {
        decorators.push(<div key="frame-rank10" className="absolute -top-2.5 -right-1 drop-shadow-md z-30 animate-pulse"><span className="text-[12px] sm:text-[15px] leading-none select-none">⚡</span></div>);
      }
    }

    // Add Rank 1 sparkling and outward pulsing ring effects
    if (rankIndex === 0 || (rankIndex === undefined && avatarFrame === 'rank_1')) {
      decorators.push(
        <React.Fragment key="rank1-effects">
          {/* Gold pinging rings expanding outwards from main ring */}
          <div className="absolute inset-0 rounded-full border border-yellow-300 animate-ping [animation-duration:0.9s] z-0 opacity-80 pointer-events-none" />
          <div className="absolute -inset-1 rounded-full border border-amber-400/80 animate-ping [animation-duration:1.4s] z-0 opacity-60 pointer-events-none" />
          
          {/* Sparkles on the ring */}
          <div className="absolute -top-1.5 -right-1.5 text-yellow-300 animate-pulse [animation-duration:0.5s] z-30 pointer-events-none">
            <Sparkles size={size === 'xl' ? 14 : size === 'lg' ? 12 : 9} fill="currentColor" className="animate-spin [animation-duration:4s]" />
          </div>
          <div className="absolute -bottom-1.5 -left-1 text-amber-300 animate-pulse [animation-duration:0.8s] z-30 pointer-events-none">
            <Sparkles size={size === 'xl' ? 12 : size === 'lg' ? 10 : 8} fill="currentColor" />
          </div>
        </React.Fragment>
      );
    }

    return decorators;
  };

  const isPremium = avatarFrame?.startsWith('premium');

  // Check if we should render Rank Number Badge
  let rankNumber: string | null = null;
  let rankBadgeBg = '';
  
  if (avatarFrame === 'rank_1' || rankIndex === 0) {
    rankNumber = '1';
    rankBadgeBg = 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-amber-950 font-black shadow-lg shadow-amber-500/30 border border-white dark:border-slate-800';
  } else if (avatarFrame === 'rank_2' || rankIndex === 1) {
    rankNumber = '2';
    rankBadgeBg = 'bg-gradient-to-r from-slate-400 via-slate-100 to-slate-500 text-slate-900 font-black shadow-lg shadow-slate-400/30 border border-white dark:border-slate-800';
  } else if (avatarFrame === 'rank_3' || rankIndex === 2) {
    rankNumber = '3';
    rankBadgeBg = 'bg-gradient-to-r from-orange-500 via-orange-200 to-orange-600 text-orange-950 font-black shadow-lg shadow-orange-500/30 border border-white dark:border-slate-800';
  } else if (avatarFrame === 'rank_4' || rankIndex === 3) {
    rankNumber = '4';
    rankBadgeBg = 'bg-gradient-to-r from-rose-500 via-pink-400 to-red-500 text-rose-950 font-black shadow-lg shadow-rose-500/30 border border-white dark:border-slate-800';
  } else if (avatarFrame === 'rank_5' || rankIndex === 4) {
    rankNumber = '5';
    rankBadgeBg = 'bg-gradient-to-r from-emerald-500 via-teal-200 to-emerald-650 text-emerald-950 font-black shadow-lg shadow-emerald-550/30 border border-white dark:border-slate-800';
  } else if (avatarFrame === 'rank_6' || rankIndex === 5) {
    rankNumber = '6';
    rankBadgeBg = 'bg-gradient-to-r from-cyan-500 via-cyan-150 to-blue-600 text-blue-950 font-black shadow-lg shadow-cyan-550/30 border border-white dark:border-slate-800';
  } else if (avatarFrame === 'rank_7' || rankIndex === 6) {
    rankNumber = '7';
    rankBadgeBg = 'bg-gradient-to-r from-fuchsia-500 via-pink-200 to-rose-550 text-fuchsia-950 font-black shadow-lg shadow-fuchsia-550/30 border border-white dark:border-slate-800';
  } else if (avatarFrame === 'rank_8' || rankIndex === 7) {
    rankNumber = '8';
    rankBadgeBg = 'bg-gradient-to-r from-indigo-500 via-purple-200 to-pink-550 text-indigo-950 font-black shadow-lg shadow-indigo-550/30 border border-white dark:border-slate-800';
  } else if (avatarFrame === 'rank_9' || rankIndex === 8) {
    rankNumber = '9';
    rankBadgeBg = 'bg-gradient-to-r from-teal-500 via-emerald-100 to-green-600 text-teal-950 font-black shadow-lg shadow-teal-550/30 border border-white dark:border-slate-800';
  } else if (avatarFrame === 'rank_10' || avatarFrame === 'rank_top10' || rankIndex === 9) {
    rankNumber = '10';
    rankBadgeBg = 'bg-gradient-to-r from-slate-600 via-slate-350 to-slate-750 text-white font-black shadow-lg shadow-slate-600/30 border border-white dark:border-slate-800';
  }

  const rankBadgeSizes = {
    xs: 'h-3.5 w-3.5 text-[6.5px]',
    sm: 'h-4 w-4 text-[8px]',
    md: 'h-5 w-5 text-[10px]',
    lg: 'h-6 w-6 text-[12px]',
    xl: 'h-8 w-8 text-[15px]'
  };

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}>
      {/* Decorative Icons */}
      {renderDecorator()}

      <div className={`relative h-full w-full p-0.5 rounded-full z-10`}>
        {/* Avatar Frame Gradient */}
        {frameGradient && (
          <div className={`absolute ${ringSizes[size]} rounded-full bg-gradient-to-br ${frameGradient} animate-spin [animation-duration:8s] z-0 shadow-lg`} />
        )}

        {/* User Photo */}
        <div className={`relative w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-800 z-10 shadow-inner`}>
          {photoURL ? (
            <img 
              src={photoURL} 
              alt={displayName || 'User'} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('bg-emerald-600');
                const span = document.createElement('span');
                span.innerText = displayName?.charAt(0).toUpperCase() || 'S';
                span.className = `text-white font-black ${size === 'lg' || size === 'xl' ? 'text-lg' : 'text-xs'}`;
                e.currentTarget.parentElement?.appendChild(span);
              }}
            />
          ) : (
            <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white font-black uppercase">
              {displayName ? displayName.charAt(0) : <UserIcon size={size === 'xs' ? 12 : 18} />}
            </div>
          )}
        </div>
      </div>

      {/* Badges Container (Verified) */}
      {(isPremium || (verificationBadge && verificationBadge !== 'none')) && (
        <div className={`absolute ${
          size === 'xl' ? '-bottom-1.5 -right-1.5' :
          size === 'lg' ? '-bottom-1 -right-1' :
          size === 'md' ? '-bottom-0.5 -right-0.5' :
          size === 'sm' ? '-bottom-0.5 -right-0.5' :
          '-bottom-0.5 -right-0.5'
        } z-20 flex items-center gap-0.5`}>
            <div className={`bg-white dark:bg-slate-900 rounded-full ${
              size === 'xs' ? 'p-0.1' : 'p-0.5'
            } shadow-lg border border-slate-100 dark:border-slate-800`}>
              <BadgeCheck 
                size={
                  size === 'xl' ? 22 : 
                  size === 'lg' ? 18 : 
                  size === 'md' ? 14 : 
                  size === 'sm' ? 11 : 
                  9
                } 
                className={
                  verificationBadge === 'badge_purple' ? 'text-purple-500 fill-purple-500/10' :
                  verificationBadge === 'badge_blue' ? 'text-blue-500 fill-blue-500/10' :
                  verificationBadge === 'badge_red' ? 'text-red-500 fill-red-500/10' :
                  verificationBadge === 'badge_green' ? 'text-emerald-500 fill-emerald-500/10' :
                  verificationBadge === 'badge_gold' ? 'text-amber-500 fill-amber-500/10' :
                  'text-emerald-500 fill-emerald-500/10'
                } 
              />
            </div>
        </div>
      )}

      {/* Rank Number Badge */}
      {rankNumber && (
        <div 
          className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center rounded-full leading-none text-center select-none ${rankBadgeSizes[size]} ${rankBadgeBg}`}
          style={{ fontStyle: 'normal' }}
        >
          {rankNumber}
        </div>
      )}
    </div>
  );
};
