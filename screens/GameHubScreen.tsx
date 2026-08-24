
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { 
  Gamepad2, 
  Target, 
  Brain, 
  ChevronRight, 
  Trophy, 
  ArrowLeft,
  Sparkles,
  Gem,
  Sword,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { getRankDetails, subscribeToLeaderboard } from '../services/firebase';
import { LevelInfoModal } from '../components/LevelInfoModal';
import { MoneyBagIcon, ArcheryEmojiIcon, SwordsEmojiIcon } from '../components/EmojiIcon';

const GameHubScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  const [ranking, setRanking] = useState<number | null>(null);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToLeaderboard((data) => {
      const myRankIndex = data.findIndex((u: any) => u.id === user.uid);
      if (myRankIndex !== -1) {
        setRanking(myRankIndex + 1);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const points = userData?.points || 0;
  const wasilah = userData?.wasilah || 0;
  const rank = getRankDetails(points);

  let currentRangeMin = 0;
  let nextRangeMax = 100000;
  let nextRankName = 'Tsanawiyah';

  if (points >= 1000000) {
    currentRangeMin = 1000000;
    nextRangeMax = 1000000;
    nextRankName = 'Sultan (Maksimal)';
  } else if (points >= 700000) {
    currentRangeMin = 700000;
    nextRangeMax = 1000000;
    nextRankName = 'Sultan';
  } else if (points >= 300000) {
    currentRangeMin = 300000;
    nextRangeMax = 700000;
    nextRankName = 'Istiqomah';
  } else if (points >= 100000) {
    currentRangeMin = 100000;
    nextRangeMax = 300000;
    nextRankName = 'Aliyah';
  } else {
    currentRangeMin = 0;
    nextRangeMax = 100000;
    nextRankName = 'Tsanawiyah';
  }

  const progressPercent = nextRangeMax === currentRangeMin 
    ? 100 
    : Math.min(100, Math.max(0, ((points - currentRangeMin) / (nextRangeMax - currentRangeMin)) * 100));

  const games = [
    {
      id: 'quiz',
      title: 'Cerdas Cermat',
      desc: 'Uji wawasan seputar Kitab Kuning, Fiqih, Tafsir, Hadits & Akidah.',
      icon: SwordsEmojiIcon,
      color: 'from-purple-600 to-indigo-700',
      path: '/quiz',
      reward: 'Bonus Wasilah x2',
      bg: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 text-white',
      border: 'border-0',
      shadow: 'shadow-lg shadow-purple-500/20 dark:shadow-purple-950/40'
    },
    {
      id: 'miliarder',
      title: 'Santri Miliarder',
      desc: 'Jawab 15 kuis keislaman untuk meraih Rp 1 Miliar dan Wasilah melimpah!',
      icon: MoneyBagIcon,
      color: 'from-indigo-600 to-purple-700',
      path: '/quiz-game',
      reward: 'Wasilah Premium',
      bg: 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white',
      border: 'border-0',
      shadow: 'shadow-lg shadow-purple-500/15 dark:shadow-purple-950/30'
    },
    {
      id: 'archery',
      title: 'Panahan Sunnah',
      desc: 'Latih fokus dan ketepatan memanahmu.',
      icon: ArcheryEmojiIcon,
      color: 'from-orange-500 to-amber-600',
      path: '/archery',
      reward: 'Bonus Wasilah x3',
      bg: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white',
      border: 'border-0',
      shadow: 'shadow-lg shadow-amber-500/15 dark:shadow-orange-950/30'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      <header className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-700 via-indigo-700 to-emerald-700 text-white shadow-lg sticky top-0 z-50 transition-all border-b border-white/10">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl select-none leading-none">🎮</span>
          <h1 className="text-sm font-black tracking-widest uppercase text-white drop-shadow-sm">GAMES HUB</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/leaderboard')} className="p-1.5 text-xl hover:scale-105 transition-all select-none leading-none" title="Papan Peringkat">
            🏆
          </button>
          <button 
            onClick={() => navigate('/settings')} 
            className="relative active:scale-90 transition-all flex-shrink-0"
          >
            <UserAvatar 
              photoURL={userData?.avatarUrl || userData?.photoURL || user?.photoURL}
              displayName={user?.displayName}
              points={userData?.points || 0}
              size="sm"
              avatarFrame={userData?.avatarFrame}
            />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4 max-w-xl mx-auto w-full">
        {/* User Progress Profile Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-[2rem] p-5 text-white shadow-xl shadow-emerald-200 dark:shadow-none border border-emerald-500/30">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-4">
            {/* Header info */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/settings')}
                className="hover:scale-105 active:scale-95 transition-transform duration-200 text-left focus:outline-none shrink-0"
                title="Klik untuk ubah profil"
              >
                <UserAvatar 
                  photoURL={userData?.avatarUrl || userData?.photoURL || user?.photoURL}
                  displayName={user?.displayName || "Santri Baru"}
                  points={points}
                  size="lg"
                  avatarFrame={userData?.avatarFrame}
                  verificationBadge={userData?.verificationBadge}
                />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-200">Profil Progres Santri</p>
                <h2 className="text-base font-black truncate leading-tight mt-0.5">{user?.displayName || "Santri Baru"}</h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[16px]" role="img" aria-label="rank-icon">{rank.icon}</span>
                  <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider">{rank.name}</span>
                </div>
              </div>
            </div>

            {/* Four Bento Stat Panels: Jenjang, Point XP, Wasilah, Ranking */}
            <div className="grid grid-cols-4 gap-2">
              {/* Stat 1: Tingkatan (Class/Level) */}
              <button 
                onClick={() => setIsLevelModalOpen(true)}
                className="bg-white/10 hover:bg-white/15 active:scale-95 transition-all backdrop-blur-md rounded-2xl p-2 text-center flex flex-col justify-between items-center min-h-[64px]"
                title="Klik untuk info jenjang"
              >
                <span className="text-[8px] font-black text-emerald-200/90 uppercase tracking-wider mb-1 leading-none">Jenjang</span>
                <span className="text-[10px] font-black text-white flex flex-col items-center gap-0.5 leading-none w-full">
                  <span className="text-sm" role="img" aria-label="level-indicator">{rank.icon}</span>
                  <span className="truncate max-w-full text-[9px]">{rank.name}</span>
                </span>
              </button>

              {/* Stat 2: Point XP */}
              <button 
                onClick={() => navigate('/leaderboard')}
                className="bg-white/10 hover:bg-white/15 active:scale-95 transition-all backdrop-blur-md rounded-2xl p-2 text-center flex flex-col justify-between items-center min-h-[64px]"
                title="Klik untuk papan peringkat"
              >
                <span className="text-[8px] font-black text-emerald-200/90 uppercase tracking-wider mb-1 leading-none">Point XP</span>
                <span className="text-[10px] font-black text-amber-300 flex flex-col items-center gap-0.5 leading-none w-full">
                  <Star size={12} className="fill-amber-300 stroke-none animate-pulse mb-0.5" />
                  <span className="text-[9px] truncate w-full">{points.toLocaleString()}</span>
                </span>
              </button>

              {/* Stat 3: Wasilah balance */}
              <button 
                onClick={() => navigate('/premium')}
                className="bg-white/10 hover:bg-white/15 active:scale-95 transition-all backdrop-blur-md rounded-2xl p-2 text-center flex flex-col justify-between items-center min-h-[64px]"
                title="Klik untuk top up wasilah"
              >
                <span className="text-[8px] font-black text-emerald-200/90 uppercase tracking-wider mb-1 leading-none">Wasilah</span>
                <span className="text-[10px] font-black text-amber-300 flex flex-col items-center gap-0.5 leading-none w-full">
                  <Gem size={12} className="fill-amber-300 stroke-amber-300 mb-0.5 animate-pulse" />
                  <span className="text-[9px] truncate w-full">{wasilah.toLocaleString()}</span>
                </span>
              </button>

              {/* Stat 4: Ranking */}
              <button 
                onClick={() => navigate('/leaderboard')}
                className="bg-white/10 hover:bg-white/15 active:scale-95 transition-all backdrop-blur-md rounded-2xl p-2 text-center flex flex-col justify-between items-center min-h-[64px]"
                title="Klik untuk lihat ranking"
              >
                <span className="text-[8px] font-black text-emerald-200/90 uppercase tracking-wider mb-1 leading-none">Ranking</span>
                <span className="text-[10px] font-black text-yellow-300 flex flex-col items-center gap-0.5 leading-none w-full">
                  <span className="text-xs select-none leading-none mb-0.5">🏆</span>
                  <span className="text-[9px] font-extrabold truncate w-full">{ranking !== null ? `#${ranking}` : '-'}</span>
                </span>
              </button>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[9px] font-bold text-emerald-200">
                <span>Progres ke {nextRankName}</span>
                <span>{progressPercent.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden p-[2px] border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 shadow-md shadow-amber-500/20"
                ></motion.div>
              </div>
              <div className="flex justify-between items-center text-[8px] font-bold text-emerald-100/70">
                <span>{points.toLocaleString()} XP</span>
                {points < 1000000 ? (
                  <span>Butuh {(nextRangeMax - points).toLocaleString()} XP Lagi</span>
                ) : (
                  <span>Tingkat Maksimal Tercapai! 👑</span>
                )}
              </div>
            </div>
          </div>

          {/* Decorative rotating sparkles */}
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute -right-8 -top-8 text-white/5 pointer-events-none"
          >
            <Sparkles size={160} />
          </motion.div>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center justify-between px-1 mb-0.5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pilih Permainan</p>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-santri-green">
              <span className="w-1.5 h-1.5 bg-santri-green rounded-full animate-pulse"></span>
              <span>Online Now</span>
            </div>
          </div>
          
          {games.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => {
                if (game.id === 'miliarder' && window.AndroidNativeInterface?.showInterstitialAd) {
                  try {
                    window.AndroidNativeInterface.showInterstitialAd();
                  } catch (err) {
                    console.error("Gagal menampilkan Interstitial Ad:", err);
                  }
                }
                navigate(game.path);
              }}
              className={`${game.bg || 'bg-white dark:bg-slate-900'} rounded-[2rem] p-5 shadow-lg ${game.shadow || ''} ${game.border || 'border-slate-100 dark:border-slate-800'} flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer group relative overflow-hidden`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shadow-inner border border-white/25 shrink-0">
                <game.icon size={26} strokeWidth={2.5} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black text-white leading-tight mb-1">{game.title}</h3>
                <p className="text-[10px] text-white/80 leading-snug line-clamp-1 mb-2 font-medium">{game.desc}</p>
                <div className="bg-white/20 w-fit px-2.5 py-0.5 rounded-lg text-[8px] font-black text-white flex items-center gap-1 border border-white/20">
                  <Gem size={8} className="fill-current text-white animate-pulse" /> {game.reward}
                </div>
              </div>
              
              <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center transition-all group-hover:scale-105 shrink-0">
                <ChevronRight size={16} strokeWidth={3} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-auto p-4 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
           <Sword size={20} className="text-slate-300 mx-auto mb-2" />
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Segera Hadir: Perang Khaybar!</p>
        </div>
        {/* Level details / Jenjang info popup modal */}
        <LevelInfoModal 
          isOpen={isLevelModalOpen} 
          onClose={() => setIsLevelModalOpen(false)} 
          currentPoints={points} 
        />
      </main>
    </div>
  );
};

export default GameHubScreen;
