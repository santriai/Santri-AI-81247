import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Trophy, 
  Check, 
  Lock,
  Unlock,
  Sparkles,
  Medal,
  Award,
  Brain,
  HelpCircle,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, subscribeToLeaderboard, subscribeToUserData } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { UserAvatar } from '../components/UserAvatar';

interface AvatarFrame {
  id: string;
  name: string;
  description: string;
  type: 'rank' | 'premium';
  rankRequirement?: number;
  gradient: string;
  previewColor: string;
  decorator?: 'crown' | 'trophy' | 'brain' | 'ai' | 'wings' | 'book' | 'star' | 'moon' | 'shield' | 'toga' | 'sultan';
}

const RANK_FRAMES: AvatarFrame[] = [
  {
    id: 'rank_1',
    name: 'Sang Juara 1',
    description: 'Mahkota Emas Juara Pertama Cerdas Cermat & Santri Miliarder',
    type: 'rank',
    rankRequirement: 1,
    gradient: 'from-amber-400 via-amber-200 to-amber-500',
    previewColor: 'bg-amber-400',
    decorator: 'trophy'
  },
  {
    id: 'rank_2',
    name: 'Runner Up',
    description: 'Medali Perak Peringkat Kedua Cerdas Cermat & Santri Miliarder',
    type: 'rank',
    rankRequirement: 2,
    gradient: 'from-slate-300 via-slate-100 to-slate-400',
    previewColor: 'bg-slate-300',
    decorator: 'star'
  },
  {
    id: 'rank_3',
    name: 'Top 3 Member',
    description: 'Peringkat Ketiga Berbakat Cerdas Cermat & Santri Miliarder',
    type: 'rank',
    rankRequirement: 3,
    gradient: 'from-orange-400 via-orange-200 to-orange-500',
    previewColor: 'bg-orange-400',
    decorator: 'star'
  },
  {
    id: 'rank_4',
    name: 'Top 4 - Santri Teladan',
    description: 'Bingkai Emas Mawar Lambang Santri Teladan Berbakat',
    type: 'rank',
    rankRequirement: 4,
    gradient: 'from-rose-500 via-pink-400 to-red-500',
    previewColor: 'bg-rose-500',
    decorator: 'shield'
  },
  {
    id: 'rank_5',
    name: 'Top 5 - Penjaga Kitab',
    description: 'Bingkai Zamrud Penjaga Kitab Kuning Pesantren',
    type: 'rank',
    rankRequirement: 5,
    gradient: 'from-emerald-500 via-teal-200 to-teal-600',
    previewColor: 'bg-emerald-500',
    decorator: 'book'
  },
  {
    id: 'rank_6',
    name: 'Top 6 - Ahli Hadis',
    description: 'Bingkai Biru Langit untuk Ahli Sanad & Matan Hadis',
    type: 'rank',
    rankRequirement: 6,
    gradient: 'from-cyan-500 via-cyan-150 to-blue-600',
    previewColor: 'bg-cyan-500',
    decorator: 'moon'
  },
  {
    id: 'rank_7',
    name: 'Top 7 - Hufaz Hebat',
    description: 'Bingkai Violet Mewah untuk Penjaga Ayat Suci Al-Qur\'an',
    type: 'rank',
    rankRequirement: 7,
    gradient: 'from-fuchsia-500 via-pink-200 to-rose-500',
    previewColor: 'bg-fuchsia-500',
    decorator: 'star'
  },
  {
    id: 'rank_8',
    name: 'Top 8 - Pemikir Islam',
    description: 'Bingkai Indigo Simbol Pemikir Falsafah Islam Modern',
    type: 'rank',
    rankRequirement: 8,
    gradient: 'from-indigo-500 via-purple-200 to-pink-500',
    previewColor: 'bg-indigo-500',
    decorator: 'brain'
  },
  {
    id: 'rank_9',
    name: 'Top 9 - Pencari Ilmu',
    description: 'Bingkai Toska Cerah bagi Penuntut Ilmu Sejati',
    type: 'rank',
    rankRequirement: 9,
    gradient: 'from-teal-500 via-emerald-100 to-green-600',
    previewColor: 'bg-teal-500',
    decorator: 'star'
  },
  {
    id: 'rank_10',
    name: 'Top 10 - Santri Elite',
    description: 'Bingkai Obsidian Emas Hitam Penanda Santri Elite 10 Besar',
    type: 'rank',
    rankRequirement: 10,
    gradient: 'from-slate-700 via-slate-400 to-slate-800',
    previewColor: 'bg-slate-700',
    decorator: 'brain'
  }
];

const AchievementFramesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [userData, setUserData] = useState<any>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setUserData(doc.data());
      }
    });

    const unsubLeaderboard = subscribeToLeaderboard((users) => {
      const idx = users.findIndex(u => u.id === user.uid);
      if (idx !== -1) {
        setUserRank(idx + 1);
      } else {
        setUserRank(null);
      }
      setLoading(false);
    });

    return () => {
      unsubUser();
      unsubLeaderboard();
    };
  }, [user]);

  const isFrameUnlocked = (frame: AvatarFrame) => {
    if (userData?.role === 'admin') return true;
    if (!frame.rankRequirement) return true;
    if (userRank !== null && userRank === frame.rankRequirement) {
      return true;
    }
    return false;
  };

  // Preset character URL for dynamic preview
  const demoPhotoURL = userData?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-xs px-4 py-3 flex items-center gap-3 transition-colors">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-black text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
          <Trophy size={20} className="text-amber-500 animate-pulse" />
          Daftar Bingkai Prestasi
        </h2>
      </div>

      <div className="p-4 max-w-xl mx-auto space-y-6">
        {/* User Current Rank Summary Card */}
        <div className="relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white p-6 shadow-xl shadow-emerald-500/10">
          {/* Islamic Arabesque Pattern overlay */}
          <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200/90 bg-emerald-500/30 px-3 py-1 rounded-full border border-emerald-400/20">
                Status Prestasi Anda
              </span>
              <h3 className="text-xl font-black tracking-tight mt-2">{userData?.displayName || 'Sahabat Santri'}</h3>
              <p className="text-xs text-emerald-100 font-semibold max-w-xs leading-relaxed">
                Setiap pengguna akan mendapatkan 1 bingkai prestasi secara eksklusif sesuai dengan peringkat persis Anda saat ini.
              </p>
            </div>

            <div className="flex items-center gap-3.5 bg-white/10 dark:bg-slate-950/20 backdrop-blur-md p-4 rounded-3xl border border-white/10 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                <Trophy size={24} className="text-amber-300" />
              </div>
              <div className="text-left">
                <span className="block text-[8px] font-bold text-emerald-200 uppercase tracking-widest leading-none mb-1">Peringkat Saat Ini</span>
                <span className="block text-xl font-black leading-none">
                  {loading ? '...' : userRank ? `#${userRank}` : 'Belum Masuk'}
                </span>
                <span className="block text-[9px] text-emerald-200/80 font-medium leading-none mt-1">Leaderboard Santri</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl border border-amber-500/20 p-4 flex gap-3 text-left">
          <Sparkles className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div>
            <h5 className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wide mb-1">Bagaimana Cara Mendapatkannya?</h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Mainkan fitur <strong>Cerdas Cermat</strong> atau game <strong>Santri Miliarder</strong> di menu utama, kumpulkan poin XP sebanyak-banyaknya, dan pertahankan peringkat Anda di 10 besar untuk membuka bingkai prestasi eksklusif ini!
            </p>
          </div>
        </div>

        {/* Frames List Section */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-3">
            Daftar Koleksi Bingkai Prestasi ({RANK_FRAMES.length})
          </p>

          <div className="space-y-3">
            {RANK_FRAMES.map((frame, index) => {
              const unlocked = isFrameUnlocked(frame);
              const rankIndex = frame.rankRequirement !== undefined ? frame.rankRequirement - 1 : undefined;
              
              return (
                <div 
                  key={frame.id}
                  className={`p-4 bg-white dark:bg-slate-900 rounded-[2rem] border transition-all duration-300 flex items-center justify-between gap-4 ${
                    unlocked 
                      ? 'border-emerald-500/40 dark:border-emerald-500/30 shadow-md shadow-emerald-500/5' 
                      : 'border-slate-100 dark:border-slate-800/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Visual Preview using real UserAvatar component */}
                    <div className="shrink-0">
                      <UserAvatar 
                        photoURL={demoPhotoURL}
                        displayName={userData?.displayName || 'S'}
                        size="lg"
                        avatarFrame={frame.id}
                        rankIndex={rankIndex}
                      />
                    </div>

                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight leading-none">
                          {frame.name}
                        </h4>
                        
                        {/* Lock/Unlock Badge */}
                        <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 border ${
                          unlocked 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30' 
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800'
                        }`}>
                          {unlocked ? (
                            <>
                              <Unlock size={8} /> Terbuka
                            </>
                          ) : (
                            <>
                              <Lock size={8} /> Terkunci
                            </>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-tight">
                        {frame.description}
                      </p>

                      <div className="flex items-center gap-1.5 pt-0.5">
                        {frame.rankRequirement === 1 ? (
                          <Trophy size={12} className="text-amber-500" />
                        ) : frame.rankRequirement === 2 ? (
                          <Medal size={12} className="text-slate-400" />
                        ) : frame.rankRequirement === 3 ? (
                          <Award size={12} className="text-orange-400" />
                        ) : (
                          <Brain size={12} className="text-emerald-500" />
                        )}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">
                          Syarat: Harus Peringkat {frame.rankRequirement}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side check mark or dynamic info */}
                  <div className="shrink-0 pr-1">
                    {unlocked ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 animate-pulse-slow">
                        <Check size={16} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800">
                        <Lock size={14} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Button to play quiz & compete */}
        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={() => navigate('/quiz')}
            className="w-full py-4 bg-santri-green hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg shadow-green-100 dark:shadow-none transition-all active:scale-95"
          >
            <Play size={14} fill="currentColor" /> Ikuti Cerdas Cermat Sekarang
          </button>

          <button
            onClick={() => navigate('/quiz-game')}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-lg shadow-amber-100 dark:shadow-none transition-all active:scale-95"
          >
            <Sparkles size={14} fill="currentColor" /> Main Santri Miliarder (Dapatkan XP)
          </button>
          
          <button
            onClick={() => navigate('/leaderboard')}
            className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all active:scale-95"
          >
            <Trophy size={14} className="text-amber-500" /> Lihat Papan Peringkat (Leaderboard)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementFramesScreen;
