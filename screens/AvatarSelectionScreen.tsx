import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Crown, 
  Trophy, 
  Check, 
  Lock,
  Sparkles,
  Camera,
  BadgeCheck,
  Image
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, auth, handleFirestoreError, subscribeToLeaderboard, updateUserProfileAuth } from '../services/firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { UserAvatar } from '../components/UserAvatar';
import { ISLAMIC_PRESETS } from '../constants/avatarPresets';

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

const AVATAR_FRAMES: AvatarFrame[] = [
  {
    id: 'none',
    name: 'Tanpa Bingkai',
    description: 'Tampilan standar tanpa hiasan',
    type: 'rank',
    gradient: 'from-transparent to-transparent',
    previewColor: 'bg-slate-200'
  },
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
  },
  {
    id: 'premium_pemula',
    name: 'Pemula',
    description: 'Bingkai awal penuh semangat bagi pencari ilmu',
    type: 'premium',
    gradient: 'from-emerald-500 via-amber-300 to-teal-600',
    previewColor: 'bg-emerald-500',
    decorator: 'star'
  },
  {
    id: 'premium_royal',
    name: 'Royal Premium',
    description: 'Mahkota Raja Premium Eksklusif',
    type: 'premium',
    gradient: 'from-purple-600 via-purple-300 to-purple-800',
    previewColor: 'bg-purple-600',
    decorator: 'crown'
  },
  {
    id: 'premium_ai',
    name: 'AI Scientist',
    description: 'Simbol AI & Teknologi Masa Depan',
    type: 'premium',
    gradient: 'from-blue-500 via-cyan-300 to-blue-700',
    previewColor: 'bg-blue-500',
    decorator: 'ai'
  },
  {
    id: 'premium_gold',
    name: 'Hafiz Wings',
    description: 'Sayap Keemasan & Buku Terbuka',
    type: 'premium',
    gradient: 'from-yellow-500 via-yellow-200 to-yellow-600',
    previewColor: 'bg-yellow-500',
    decorator: 'wings'
  },
  {
    id: 'premium_moon',
    name: 'Lentera Bulan',
    description: 'Bingkai premium benderang berhias sirkon rembulan',
    type: 'premium',
    gradient: 'from-indigo-600 via-sky-400 to-indigo-800',
    previewColor: 'bg-indigo-600',
    decorator: 'moon'
  },
  {
    id: 'premium_crescent',
    name: 'Sinar Bulan Sabit',
    description: 'Bingkai cahaya bulan sabit penanda hilal yang estetik',
    type: 'premium',
    gradient: 'from-amber-400 via-yellow-200 to-orange-500',
    previewColor: 'bg-amber-400',
    decorator: 'moon'
  },
  {
    id: 'premium_star',
    name: 'Mahkota Bintang',
    description: 'Bingkai gemerlap bintang berkilau lambang harapan',
    type: 'premium',
    gradient: 'from-rose-400 via-amber-200 to-yellow-400',
    previewColor: 'bg-amber-300',
    decorator: 'star'
  },
  {
    id: 'premium_moonstar',
    name: 'Rembulan Bintang',
    description: 'Bingkai klasik perpaduan simbol kedamaian Islam',
    type: 'premium',
    gradient: 'from-cyan-500 via-violet-300 to-fuchsia-600',
    previewColor: 'bg-violet-600',
    decorator: 'moon'
  },
  {
    id: 'premium_shield',
    name: 'Perisai Santri',
    description: 'Bingkai pelindung kokoh lambang kemandirian santri',
    type: 'premium',
    gradient: 'from-emerald-500 via-teal-300 to-blue-600',
    previewColor: 'bg-emerald-600',
    decorator: 'shield'
  },
  {
    id: 'premium_book',
    name: 'Makrifah Kitab',
    description: 'Bingkai halaman kitab terbuka sumber ilmu pengetahuan',
    type: 'premium',
    gradient: 'from-emerald-600 via-green-300 to-teal-700',
    previewColor: 'bg-teal-600',
    decorator: 'book'
  },
  {
    id: 'premium_toga',
    name: 'Toga Wisuda',
    description: 'Bingkai toga wisudawan lambang kelulusan ilmu syar\'i',
    type: 'premium',
    gradient: 'from-rose-600 via-red-300 to-red-800',
    previewColor: 'bg-rose-600',
    decorator: 'toga'
  },
  {
    id: 'premium_sultan_pro',
    name: 'Sultan Pro',
    description: 'Bingkai kemegahan sultan dengan mahkota melompat dan cincin cahaya berdenyut cepat bersemi kemilau',
    type: 'premium',
    gradient: 'from-yellow-500 via-amber-200 via-yellow-300 to-amber-600',
    previewColor: 'bg-yellow-500',
    decorator: 'sultan'
  }
];

export interface VerificationBadge {
  id: string;
  name: string;
  description: string;
  color: 'purple' | 'blue' | 'red' | 'emerald';
  pointsRequirement: number;
}

export const VERIFICATION_BADGES: VerificationBadge[] = [
  {
    id: 'none',
    name: 'Tanpa Lencana',
    description: 'Kembalikan tampilan profil tanpa lencana hiasan',
    color: 'emerald',
    pointsRequirement: 0
  },
  {
    id: 'badge_purple',
    name: 'Lencana Ungu',
    description: 'Lencana verifikasi checklist warna ungu premium',
    color: 'purple',
    pointsRequirement: 1000
  },
  {
    id: 'badge_blue',
    name: 'Lencana Biru',
    description: 'Lencana verifikasi checklist warna biru istimewa',
    color: 'blue',
    pointsRequirement: 2500
  },
  {
    id: 'badge_red',
    name: 'Lencana Merah',
    description: 'Lencana verifikasi checklist warna merah kehormatan',
    color: 'red',
    pointsRequirement: 5000
  }
];

export default function AvatarSelectionScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [selectedFrame, setSelectedFrame] = useState('none');
  const [previewFrame, setPreviewFrame] = useState('none');
  const [selectedBadge, setSelectedBadge] = useState('none');
  const [previewBadge, setPreviewBadge] = useState('none');
  const [hasInitializedPreview, setHasInitializedPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserData(data);
        const equipped = data.avatarFrame || 'none';
        setSelectedFrame(equipped);
        const equippedBadge = data.verificationBadge || 'none';
        setSelectedBadge(equippedBadge);
        if (!hasInitializedPreview) {
          setPreviewFrame(equipped);
          setPreviewBadge(equippedBadge);
          setHasInitializedPreview(true);
        }
      }
    }, (error) => {
      handleFirestoreError(error, 'get', `users/${user.uid}`);
    });

    const unsubLeaderboard = subscribeToLeaderboard((users) => {
      const idx = users.findIndex(u => u.id === user.uid);
      if (idx !== -1) {
        setUserRank(idx + 1);
      }
    });

    return () => {
      unsub();
      unsubLeaderboard();
    };
  }, [user, hasInitializedPreview]);

  const isBadgeLocked = (badge: VerificationBadge) => {
    if (badge.id === 'none') return false;
    
    // Admin bypass lock
    if (userData?.role === 'admin') return false;

    // Direct subscription unlock check (must be subscribed/purchased to use verification badges)
    if (userData?.activeBadges?.includes(badge.id)) {
      return false;
    }

    // Must be purchased/subscribed to use
    return true;
  };

  const isFrameLocked = (frame: AvatarFrame) => {
    if (frame.id === 'none') return false;
    
    // Admin bypass lock
    if (userData?.role === 'admin') return false;

    // Check rank-based frames (Strict Rank Requirement - No points bypass allowed)
    if (frame.type === 'rank' && frame.rankRequirement) {
      if (userRank !== null && userRank === frame.rankRequirement) {
        return false;
      }
      return true;
    }
    
    // Check premium frames
    if (frame.type === 'premium') {
      if (userData?.isPremium) {
        return false;
      }
    }
    
    return true;
  };

  const handleSelectFrame = async (frameId: string, isLocked: boolean) => {
    const frameObj = AVATAR_FRAMES.find(f => f.id === frameId);
    if (!frameObj || isFrameLocked(frameObj)) return;
    
    setLoading(true);
    try {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          avatarFrame: frameId
        });
        setSelectedFrame(frameId);
      }
    } catch (error) {
      console.error('Error updating frame:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBadge = async (badgeId: string, isLocked: boolean) => {
    const badgeObj = VERIFICATION_BADGES.find(b => b.id === badgeId);
    if (!badgeObj || isBadgeLocked(badgeObj)) return;
    
    setLoading(true);
    try {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          verificationBadge: badgeId
        });
        setSelectedBadge(badgeId);
      }
    } catch (error) {
      console.error('Error updating badge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal adalah 2MB');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        if (user) {
          await updateUserProfileAuth(user, { photoURL: base64String });
          await updateDoc(doc(db, 'users', user.uid), {
            avatarUrl: base64String,
            photoURL: base64String
          });
        }
      } catch (error) {
        console.error('Error updating profile picture:', error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = async (dataUrl: string) => {
    setLoading(true);
    try {
      if (user) {
        await updateUserProfileAuth(user, { photoURL: dataUrl });
        await updateDoc(doc(db, 'users', user.uid), {
          avatarUrl: dataUrl,
          photoURL: dataUrl
        });
      }
    } catch (error) {
      console.error('Error updating preset avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter lists of frames & badges to only those owned by the user
  const ownedRankFrames = AVATAR_FRAMES.filter(f => f.type === 'rank' && !isFrameLocked(f));
  const ownedPremiumFrames = AVATAR_FRAMES.filter(f => f.type === 'premium' && !isFrameLocked(f));
  const ownedVerificationBadges = VERIFICATION_BADGES.filter(b => !isBadgeLocked(b));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header with dynamic gradient and user profile account */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md border-b border-emerald-500/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-all active:scale-95">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="font-black text-white text-base md:text-lg leading-tight">Pilih Bingkai Avatar</h1>
            <p className="text-[9px] text-emerald-100 font-medium uppercase tracking-wider">Hias Profil Santrimu</p>
          </div>
        </div>

        {/* Profile account widget on the Top Right */}
        {userData && (
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 shadow-sm">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-white leading-none max-w-[120px] truncate">
                {userData.displayName || 'Muslim Santri'}
              </p>
              <p className="text-[9px] text-yellow-300 font-extrabold tracking-tight mt-0.5 whitespace-nowrap">
                {(userData.points || 0).toLocaleString()} Poin • {(userData.wasilah || 0).toLocaleString()} Wasilah
              </p>
            </div>
            <div className="text-right sm:hidden">
              <p className="text-[10.5px] font-black text-yellow-300 tracking-tight leading-none">
                {(userData.wasilah || 0).toLocaleString()} 🌟
              </p>
            </div>
            <div className="relative shrink-0 pr-0.5">
              <UserAvatar 
                photoURL={userData?.avatarUrl || userData?.photoURL}
                displayName={userData?.displayName}
                points={userData?.points || 0}
                size="sm"
                avatarFrame={previewFrame}
                verificationBadge={previewBadge}
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pt-8">
        {/* Preview Container */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center mb-10 overflow-hidden relative animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-santri-green/5 rounded-full -mr-16 -mt-16"></div>
          
          <div className="relative mb-6 group">
            <UserAvatar 
              photoURL={userData?.avatarUrl || userData?.photoURL}
              displayName={userData?.displayName}
              points={userData?.points || 0}
              size="xl"
              avatarFrame={previewFrame}
              verificationBadge={previewBadge}
            />
            <input
              type="file"
              id="avatar-file-input"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          
          <h2 className="font-black text-xl text-slate-800 dark:text-white mb-1">
            {userData?.displayName || 'Muslim Santri'}
          </h2>
          {(previewFrame !== selectedFrame || previewBadge !== selectedBadge) && (
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-1">
              {previewFrame !== selectedFrame && (
                <button
                  onClick={() => handleSelectFrame(previewFrame, isFrameLocked(AVATAR_FRAMES.find(f => f.id === previewFrame)!))}
                  disabled={loading || isFrameLocked(AVATAR_FRAMES.find(f => f.id === previewFrame)!)}
                  className={`text-xs text-white font-bold uppercase tracking-widest py-1 px-3 rounded-full flex items-center gap-1 transition-all active:scale-95 shadow ${
                    isFrameLocked(AVATAR_FRAMES.find(f => f.id === previewFrame)!)
                      ? 'bg-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                  }`}
                >
                  {isFrameLocked(AVATAR_FRAMES.find(f => f.id === previewFrame)!) ? (
                    <>
                      <Lock size={12} /> Bingkai Terkunci
                    </>
                  ) : (
                    <>
                      <Check size={12} strokeWidth={3} /> Pasang Bingkai
                    </>
                  )}
                </button>
              )}
              {previewBadge !== selectedBadge && (
                <button
                  onClick={() => handleSelectBadge(previewBadge, isBadgeLocked(VERIFICATION_BADGES.find(b => b.id === previewBadge)!))}
                  disabled={loading || isBadgeLocked(VERIFICATION_BADGES.find(b => b.id === previewBadge)!)}
                  className={`text-xs text-white font-bold uppercase tracking-widest py-1 px-3 rounded-full flex items-center gap-1 transition-all active:scale-95 shadow ${
                    isBadgeLocked(VERIFICATION_BADGES.find(b => b.id === previewBadge)!)
                      ? 'bg-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
                  }`}
                >
                  {isBadgeLocked(VERIFICATION_BADGES.find(b => b.id === previewBadge)!) ? (
                    <>
                      <Lock size={12} /> Lencana Terkunci
                    </>
                  ) : (
                    <>
                      <Check size={12} strokeWidth={3} /> Pasang Lencana
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Preset Islamic Avatars */}
          <div className="w-full mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
            <h3 className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest mb-3 px-1 text-center">
              Pilih Karakter Avatar Islami
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-3 justify-items-center">
              {/* Option 1: Custom Galeri Foto Button */}
              <button
                onClick={() => document.getElementById('avatar-file-input')?.click()}
                disabled={loading}
                title="Unggah dari Galeri Foto"
                className="relative p-1 rounded-full border-2 border-dashed border-emerald-500 hover:border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 transition-all active:scale-95 flex items-center justify-center w-14 h-14 cursor-pointer shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-300">
                  <Image size={18} />
                  <span className="text-[7.5px] font-black leading-none mt-0.5">GALERI</span>
                </div>
              </button>

              {ISLAMIC_PRESETS.map((preset, idx) => {
                const isSelected = (userData?.avatarUrl || userData?.photoURL) === preset.dataUrl;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(preset.dataUrl)}
                    disabled={loading}
                    className={`relative p-1 rounded-full border-2 transition-all active:scale-95 flex items-center justify-center ${
                      isSelected 
                        ? 'border-emerald-500 scale-105 shadow-md bg-emerald-50 dark:bg-emerald-950/20' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <img 
                      src={preset.dataUrl} 
                      alt={preset.name}
                      className="w-12 h-12 rounded-full object-cover shadow-sm bg-slate-50 dark:bg-slate-800"
                    />
                    {isSelected && (
                      <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-sm">
                        <Check size={8} strokeWidth={4} />
                      </div>
                    )}
                    <span className="sr-only">{preset.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center uppercase tracking-wide mt-3 font-semibold">
              Ketuk salah satu karakter Islami di atas atau ikon kamera untuk mengganti foto Anda
            </p>
          </div>
        </div>

        {/* Section: Rank Frames */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Trophy size={18} className="text-amber-500" />
            <h3 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest">
              Bingkai Prestasi
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {ownedRankFrames.map((frame) => {
              const locked = isFrameLocked(frame);
              const isEquipped = selectedFrame === frame.id;
              const isCurrentlyPreviewed = previewFrame === frame.id;
              
              return (
                <button
                  key={frame.id}
                  disabled={loading}
                  onClick={() => {
                    setPreviewFrame(frame.id);
                    if (!locked) {
                      handleSelectFrame(frame.id, false);
                    }
                  }}
                  className={`relative p-4 rounded-3xl border transition-all text-left flex flex-col gap-3 group dynamic-preview-btn ${
                    isCurrentlyPreviewed 
                      ? 'bg-white dark:bg-slate-800 border-santri-green shadow-lg ring-2 ring-santri-green ring-offset-2 dark:ring-offset-slate-900' 
                      : locked 
                        ? 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="relative">
                    <UserAvatar 
                      photoURL={userData?.avatarUrl || userData?.photoURL}
                      displayName={userData?.displayName}
                      points={userData?.points || 0}
                      size="md"
                      avatarFrame={frame.id}
                    />
                    {locked ? (
                      <div className="absolute -bottom-1 -right-1 bg-slate-500 text-white rounded-full p-1 shadow">
                        <Lock size={10} />
                      </div>
                    ) : isEquipped ? (
                      <div className="absolute -bottom-1 -right-1 bg-santri-green text-white rounded-full p-1 shadow">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white mb-0.5">{frame.name}</h4>
                    <p className="text-[9px] text-slate-500 leading-tight">{frame.description}</p>
                    {locked && frame.rankRequirement && (
                      <p className="text-[8px] text-amber-600 font-bold mt-1">Butuh Rank {frame.rankRequirement}</p>
                    )}
                  </div>
                </button>
              );
            })}
            {ownedRankFrames.length <= 1 && (
              <div className="col-span-2 p-6 bg-slate-100 dark:bg-slate-900/40 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 text-center flex flex-col items-center justify-center gap-2">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                  Belum Ada Bingkai Prestasi Aktif
                </p>
                <p className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wide leading-relaxed">
                  Raih peringkat Top 10 di Leaderboard Cerdas Cermat untuk membukanya!
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => navigate('/achievement-frames')}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white font-black uppercase tracking-widest rounded-2xl text-[10px] shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Trophy size={14} className="text-white fill-white/20" /> Lihat Bingkai Prestasi
            </button>
          </div>
        </div>

        {/* Section: Premium Frames */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Crown size={18} className="text-purple-500" />
            <h3 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest">
              Bingkai Premium
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {ownedPremiumFrames.length === 0 ? (
              <div className="col-span-2 p-6 bg-purple-50/40 dark:bg-purple-950/10 rounded-3xl border border-purple-100/50 dark:border-purple-900/20 text-center flex flex-col items-center justify-center gap-2">
                <p className="text-xs text-purple-750 dark:text-purple-300 font-black uppercase tracking-wider">
                  Belum Memiliki Bingkai Premium
                </p>
                <p className="text-[9.5px] text-purple-650 dark:text-purple-400 mt-1 uppercase tracking-wide max-w-xs leading-relaxed font-semibold">
                  Buka Toko Bingkai untuk melihat koleksi bingkai mewah eksklusif seumur hidup!
                </p>
              </div>
            ) : (
              ownedPremiumFrames.map((frame) => {
                const locked = isFrameLocked(frame);
                const isEquipped = selectedFrame === frame.id;
                const isCurrentlyPreviewed = previewFrame === frame.id;
                
                return (
                  <button
                    key={frame.id}
                    disabled={loading}
                    onClick={() => {
                      setPreviewFrame(frame.id);
                      if (!locked) {
                        handleSelectFrame(frame.id, false);
                      }
                    }}
                    className={`relative p-4 rounded-3xl border transition-all text-left flex flex-col gap-3 group overflow-hidden ${
                      isCurrentlyPreviewed 
                        ? 'bg-white dark:bg-slate-800 border-purple-500 shadow-lg ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-slate-900' 
                        : locked 
                          ? 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60' 
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="relative">
                      <UserAvatar 
                        photoURL={userData?.avatarUrl || userData?.photoURL}
                        displayName={userData?.displayName}
                        points={userData?.points || 0}
                        size="md"
                        avatarFrame={frame.id}
                      />
                      {locked ? (
                        <div className="absolute -bottom-1 -right-1 bg-slate-500 text-white rounded-full p-1 shadow">
                          <Lock size={10} />
                        </div>
                      ) : isEquipped ? (
                        <div className="absolute -bottom-1 -right-1 bg-purple-500 text-white rounded-full p-1 shadow">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      ) : null}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white mb-0.5">{frame.name}</h4>
                      <p className="text-[9px] text-slate-500 leading-tight font-medium uppercase tracking-tighter text-purple-600 dark:text-purple-400">Premium Exclusive</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => navigate('/frame-shop')}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 hover:from-purple-700 hover:via-fuchsia-600 hover:to-pink-600 text-white font-black uppercase tracking-widest rounded-2xl text-[10px] shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Crown size={14} className="text-white fill-white/20" /> Kunjungi Toko Bingkai
            </button>
          </div>
        </div>

        {/* Section: Lencana Verifikasi */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 px-1">
            <BadgeCheck size={18} className="text-purple-500" />
            <h3 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest">
              Lencana Verifikasi (Lencana Checklist)
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {ownedVerificationBadges.map((badge) => {
              const locked = isBadgeLocked(badge);
              const isEquipped = selectedBadge === badge.id;
              const isCurrentlyPreviewed = previewBadge === badge.id;
              
              // Define badge preview classes and colors
              let badgeColorClass = 'text-emerald-500 bg-emerald-50';
              if (badge.color === 'purple') badgeColorClass = 'text-purple-500 bg-purple-50 dark:bg-purple-950/20';
              if (badge.color === 'blue') badgeColorClass = 'text-blue-500 bg-blue-50 dark:bg-blue-950/20';
              if (badge.color === 'red') badgeColorClass = 'text-red-500 bg-red-50 dark:bg-red-950/20';

              return (
                <button
                  key={badge.id}
                  disabled={loading}
                  onClick={() => {
                    setPreviewBadge(badge.id);
                    if (!locked) {
                      handleSelectBadge(badge.id, false);
                    }
                  }}
                  className={`relative p-4 rounded-3xl border transition-all text-left flex flex-col gap-3 group overflow-hidden ${
                    isCurrentlyPreviewed 
                      ? badge.color === 'purple' 
                        ? 'bg-white dark:bg-slate-800 border-purple-500 shadow-lg ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-slate-900'
                        : badge.color === 'blue'
                        ? 'bg-white dark:bg-slate-800 border-blue-500 shadow-lg ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900'
                        : badge.color === 'red'
                        ? 'bg-white dark:bg-slate-800 border-red-500 shadow-lg ring-2 ring-red-500 ring-offset-2 dark:ring-offset-slate-900'
                        : 'bg-white dark:bg-slate-800 border-emerald-500 shadow-lg ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900'
                      : locked 
                        ? 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="relative flex items-center justify-between">
                    <div className="relative">
                      <UserAvatar 
                        photoURL={userData?.avatarUrl || userData?.photoURL}
                        displayName={userData?.displayName}
                        points={userData?.points || 0}
                        size="md"
                        // Display badge on mini avatar for exact live look
                        verificationBadge={badge.id}
                      />
                      {locked ? (
                        <div className="absolute -bottom-1 -right-1 bg-slate-500 text-white rounded-full p-1 shadow">
                          <Lock size={10} />
                        </div>
                      ) : isEquipped ? (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      ) : null}
                    </div>

                    <div className={`p-2 rounded-2xl ${badgeColorClass} flex items-center justify-center`}>
                      <BadgeCheck size={20} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <h4 className="font-bold text-xs text-slate-800 dark:text-white">{badge.name}</h4>
                      {locked && <Lock size={10} className="text-slate-400" />}
                    </div>
                    <p className="text-[9px] text-slate-500 leading-tight">{badge.description}</p>
                    {locked && (
                      <p className="text-[8px] text-purple-600 dark:text-purple-400 font-bold mt-1">Butuh Langganan Santri Pro / Google Play</p>
                    )}
                  </div>
                </button>
              );
            })}
            {ownedVerificationBadges.length <= 1 && (
              <div className="col-span-2 p-6 bg-purple-50/40 dark:bg-purple-950/10 rounded-3xl border border-purple-100/50 dark:border-purple-900/20 text-center flex flex-col items-center justify-center gap-2">
                <p className="text-xs text-purple-750 dark:text-purple-300 font-black uppercase tracking-wider">
                  Belum Memiliki Lencana Verifikasi
                </p>
                <p className="text-[9.5px] text-purple-650 dark:text-purple-400 mt-1 uppercase tracking-wide max-w-xs leading-relaxed font-semibold">
                  Dapatkan Lencana Checklist berwarna di Toko Lencana untuk langsung disematkan di profil Anda!
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => navigate('/badge-shop')}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-black uppercase tracking-widest rounded-2xl text-[10px] shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <BadgeCheck size={14} className="text-white fill-white/20" /> Beli Lencana Verifikasi
            </button>
          </div>
        </div>


      </div>

      <p className="mt-10 px-6 text-[10px] text-slate-400 dark:text-slate-600 text-center uppercase tracking-widest leading-relaxed">
        Buktikan prestasimu dan hiasi profilmu dengan bingkai eksklusif Santri Pro
      </p>
    </div>
  );
}
