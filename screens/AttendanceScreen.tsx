import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Flame, 
  CheckCircle2, 
  Gift, 
  Sparkles, 
  CalendarCheck, 
  Share2, 
  ShieldCheck, 
  Tv, 
  Coins, 
  Loader2, 
  Quote,
  Trophy,
  PlusCircle,
  Users,
  Bell,
  X,
  Gem,
  Settings,
  Flag
} from 'lucide-react';
import { 
  handleDailyCheckIn, 
  handleSaveStreak, 
  DailyCheckInResult, 
  subscribeToStreakLeaderboard, 
  handleAttendanceAdReward,
  subscribeToDailyAttendanceStats,
  subscribeToUsersToNudge,
  handleNudgeUser,
  subscribeToReceivedNudges,
  getStableNudgeCandidates,
  handleClaimCommunityTargetReward
} from '../services/firebase';
import { getRandomDailyWisdom, DailyWisdom } from '../constants/dailyWisdom';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { shareText } from '../utils/linkUtils';
import { UserAvatar } from '../components/UserAvatar';
import { ContentReportModal } from '../components/ContentReportModal';

const STREAK_REWARDS = [
  { day: 1, wasilah: 1, xp: 0 },
  { day: 2, wasilah: 1, xp: 10 },
  { day: 3, wasilah: 3, xp: 30 },
  { day: 4, wasilah: 1, xp: 10 },
  { day: 5, wasilah: 1, xp: 20 },
  { day: 6, wasilah: 2, xp: 20 },
  { day: 7, wasilah: 5, xp: 50 },
];

export const AttendanceScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, userData } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [savingStreak, setSavingStreak] = useState(false);
  const [claimingAdReward, setClaimingAdReward] = useState(false);
  const [claimingCommunityReward, setClaimingCommunityReward] = useState(false);
  const [showAdOfferModal, setShowAdOfferModal] = useState(false);
  const [showStreakChoiceModal, setShowStreakChoiceModal] = useState(false);
  const [showNudgeCompletionModal, setShowNudgeCompletionModal] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [claimResult, setClaimResult] = useState<DailyCheckInResult | null>(null);
  const [claimedWisdom, setClaimedWisdom] = useState<DailyWisdom | null>(null);
  const [streakLeaderboard, setStreakLeaderboard] = useState<any[]>([]);
  
  // Senggol Absen States
  const [dailyCheckInCount, setDailyCheckInCount] = useState(0);
  const [usersToNudge, setUsersToNudge] = useState<any[]>([]);
  const [shuffledNudgeList, setShuffledNudgeList] = useState<any[]>([]);
  const [receivedNudges, setReceivedNudges] = useState<any[]>([]);
  const [nudgingIds, setNudgingIds] = useState<string[]>([]);

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const lastCheckIn = userData?.lastCheckIn || null;
  const loginStreak = userData?.loginStreak || 0;

  const isCheckedInToday = lastCheckIn === today;
  const isCheckedInYesterday = lastCheckIn === yesterday;
  const isMissedYesterday = lastCheckIn && lastCheckIn !== today && lastCheckIn !== yesterday;
  const dayBeforeYesterday = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
  const isExactlyOneDayMissed = lastCheckIn && lastCheckIn === dayBeforeYesterday;
  const isAdRewardClaimedToday = userData?.lastAttendanceAdRewardClaimed === today;
  const effectiveDailyNudgeCount = userData?.lastNudgeDate === today ? Math.min(userData?.dailyNudgeCount || 0, 4) : 0;

  // Verification Badge check for Streak Saver
  const userBadge = userData?.verificationBadge || userData?.badge || '';
  const hasVerifiedBadge = (userBadge && userBadge !== 'none') || userData?.isVerified === true || userData?.badgeVerified === true || userData?.isPremium === true;

  // Determine current active day in 7-day cycle (1-7)
  let activeDayInCycle = 1;
  if (isCheckedInToday) {
    activeDayInCycle = ((loginStreak - 1) % 7) + 1;
  } else if (isCheckedInYesterday) {
    activeDayInCycle = (loginStreak % 7) + 1;
  } else {
    activeDayInCycle = 1;
  }

  React.useEffect(() => {
    if (lastCheckIn === today && !claimedWisdom) {
      setClaimedWisdom(getRandomDailyWisdom());
    }
  }, [lastCheckIn]);

  React.useEffect(() => {
    const unsubscribe = subscribeToStreakLeaderboard((data) => {
      setStreakLeaderboard(data);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const unsubStats = subscribeToDailyAttendanceStats((data) => {
      setDailyCheckInCount(data.count);
    });
    return () => unsubStats();
  }, []);

  React.useEffect(() => {
    if (!user) return;
    const unsubNudges = subscribeToUsersToNudge(user.uid, (data) => {
      setUsersToNudge(data);
    });
    const unsubReceived = subscribeToReceivedNudges(user.uid, (data) => {
      setReceivedNudges(data);
    });
    return () => {
      unsubNudges();
      unsubReceived();
    };
  }, [user]);

  // Handle deterministic selection of nudge users list (keeps stable and synchronized with other pages)
  React.useEffect(() => {
    if (user && usersToNudge.length > 0) {
      const stableCandidates = getStableNudgeCandidates(usersToNudge, user.uid);
      setShuffledNudgeList(stableCandidates);
    } else {
      setShuffledNudgeList([]);
    }
  }, [usersToNudge, user]);

  // Handle Check-In
  const handleCheckIn = async (bypassMissedCheck = false) => {
    if (!user) {
      showToast("Silakan login terlebih dahulu untuk absen.", "info");
      return;
    }

    if (isExactlyOneDayMissed && !bypassMissedCheck) {
      setShowStreakChoiceModal(true);
      return;
    }

    setLoading(true);
    try {
      const res = await handleDailyCheckIn(user.uid);
      setClaimResult(res);
      const wisdom = getRandomDailyWisdom();
      setClaimedWisdom(wisdom);
      showToast(res.message, res.isGrandDay ? "success" : "info");
      
      // Auto-trigger the ad offer popup on successful check-in if not claimed yet today
      if (!isAdRewardClaimedToday) {
        setShowAdOfferModal(true);
      }
    } catch (err: any) {
      showToast(err.message || "Gagal melakukan absensi", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Ad Reward for 1 Extra Wasilah after checking in
  const handleClaimAdReward = async () => {
    if (!user) {
      showToast("Silakan login terlebih dahulu.", "info");
      return;
    }

    if ((window as any).AndroidNativeInterface?.showRewardedAd) {
      showToast("Menampilkan iklan video untuk klaim +1 Wasilah...", "info");
      (window as any).AndroidNativeInterface.showRewardedAd();
    }

    setClaimingAdReward(true);
    try {
      const res = await handleAttendanceAdReward(user.uid);
      showToast(res.message, "success");
    } catch (err: any) {
      showToast(err.message || "Gagal mengklaim Wasilah tambahan", "error");
    } finally {
      setClaimingAdReward(false);
    }
  };

  // Handle Community Target Reward Claim (+10 Wasilah & +100 XP)
  const handleClaimCommunityBonus = async () => {
    if (!user) return;
    setClaimingCommunityReward(true);
    try {
      const res = await handleClaimCommunityTargetReward(user.uid);
      showToast(res.message, "success");
    } catch (err: any) {
      showToast(err.message || "Gagal mengklaim bonus target komunitas", "error");
    } finally {
      setClaimingCommunityReward(false);
    }
  };

  // Handle Streak Saver
  const handleSaveStreakAction = async () => {
    if (!user) return;

    if (!hasVerifiedBadge) {
      showToast("Anda belum memiliki lencana verifikasi, segera upgrade untuk menggunakan streak ini.", "error");
      setTimeout(() => {
        navigate('/premium');
      }, 1500);
      return;
    }

    const currentWasilah = userData?.wasilah ?? 0;
    if (currentWasilah < 2) {
      showToast("Wasilah Anda tidak cukup untuk Penyelamat Streak (butuh 2 Wasilah).", "error");
      return;
    }

    if ((window as any).AndroidNativeInterface?.showRewardedAd) {
      showToast("Menampilkan iklan video untuk menyelamatkan streak...", "info");
      (window as any).AndroidNativeInterface.showRewardedAd();
    } else {
      showToast("Memutar iklan video untuk menyelamatkan streak...", "info");
    }

    setSavingStreak(true);
    try {
      const res = await handleSaveStreak(user.uid, 'combined');
      showToast(res.message, "success");
      setShowStreakChoiceModal(false);
      // Wait a bit and automatically check-in today's attendance to continue!
      setTimeout(() => {
        handleCheckIn(true);
      }, 500);
    } catch (err: any) {
      showToast(err.message || "Gagal menyelamatkan streak", "error");
    } finally {
      setSavingStreak(false);
    }
  };

  // Share Mutiara Hikmah
  const handleShareHikmah = () => {
    if (!claimedWisdom) return;
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.kitabkuningterjemahlengkap';
    const shareContent = `✨ *Mutiara Hikmah Harian Santri AI* ✨\n\n${claimedWisdom.arabic ? `${claimedWisdom.arabic}\n\n` : ''}"${claimedWisdom.text}"\n\n— *${claimedWisdom.source}*\n\nMari tingkatkan keistiqomahan bersama Santri AI App!\n\n📲 Download Aplikasi: ${playStoreUrl}`;
    shareText("Mutiara Hikmah Santri AI", shareContent);
    showToast("Membuka menu berbagi...", "info");
  };

  // Handle Share Attendance Progress
  const handleShareAttendance = () => {
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.kitabkuningterjemahlengkap';
    const shareContent = `Yuk istiqomah absen harian bersama Santri AI! 🌙✨\n\nSaya sudah ${loginStreak} hari berturut-turut absen dan belajar di Santri AI.\n\nMari tingkatkan amalan harianmu dan gabung bersama ribuan santri dari seluruh Indonesia!\n\n📲 Download Aplikasi: ${playStoreUrl}`;
    shareText("Absensi Harian Santri AI", shareContent);
    showToast("Membuka menu berbagi...", "info");
  };

  // Handle Share Nudge Mission Reward
  const handleShareNudgeReward = () => {
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.kitabkuningterjemahlengkap';
    const shareContent = `Alhamdulillah! Saya telah menyelesaikan Misi Senggol Absen Harian di Santri AI & menyenggol 4 santri untuk saling mengingatkan kebaikan! 🖐️✨\n\nDapatkan bonus +1 Wasilah & +100 XP harianmu juga. Yuk istiqomah belajar bersama Santri AI!\n\n📲 Download Aplikasi: ${playStoreUrl}`;
    shareText("Misi Senggol Absen Santri AI", shareContent);
    showToast("Membuka menu berbagi...", "info");
  };

  // Handle Nudge click
  const handleNudgeClick = async (targetUserId: string) => {
    if (!user) {
      showToast("Silakan login terlebih dahulu untuk menyenggol santri lain.", "info");
      return;
    }
    setNudgingIds((prev) => [...prev, targetUserId]);
    try {
      const res = await handleNudgeUser(user.uid, targetUserId);
      showToast(res.message, res.rewardEarned ? "success" : "info");

      // Check if mission reached 4/4
      if (res.rewardEarned || res.dailyNudgeCount === 4) {
        setShowNudgeCompletionModal(true);
        // Trigger Interstitial AdMob Ad
        if (window.AndroidNativeInterface?.showInterstitialAd) {
          try {
            console.log("[AdMob] Triggering native interstitial ad for Senggol 4 Santri");
            window.AndroidNativeInterface.showInterstitialAd();
          } catch (e) {
            console.error("Gagal memanggil native AdMob Interstitial:", e);
          }
        }
      }
    } catch (err: any) {
      showToast(err.message || "Gagal menyenggol santri.", "error");
    } finally {
      setNudgingIds((prev) => prev.filter((id) => id !== targetUserId));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-green-800 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-95 text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg hidden sm:block">
                <CalendarCheck size={24} className="text-amber-300" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight">Absensi Harian</h1>
              </div>
            </div>
          </div>

          {/* Wasilah Badge & Settings Icon */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/15 backdrop-blur-md rounded-full border border-white/25 shadow-sm">
              <Gem size={14} className="text-cyan-300 fill-cyan-300/30 animate-pulse" />
              <span className="text-xs font-black text-white">{(userData?.wasilah ?? 0).toLocaleString('id-ID')}</span>
            </div>
            <button 
              onClick={() => navigate('/settings')}
              className="p-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-2xl border border-white/25 text-white transition-all active:scale-95 shadow-sm"
              title="Pengaturan"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Streak Banner Card */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-white">
            <Flame size={180} />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="shrink-0 p-1 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-md">
                <UserAvatar 
                  photoURL={userData?.avatarUrl || userData?.photoURL || user?.photoURL}
                  displayName={user?.displayName || 'Santri'}
                  points={userData?.points || 0}
                  size="lg"
                  avatarFrame={userData?.avatarFrame}
                />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-emerald-200 tracking-wider block mb-0.5">Rantai Istiqomah Anda</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{loginStreak} Hari Hadir terus</h2>
                <p className="text-xs text-emerald-100/90 mt-1 font-medium">Buka aplikasi tiap hari untuk klaim Wasilah & Bonus XP</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-start sm:justify-end">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center sm:text-right flex-1 sm:flex-initial">
                <div className="text-[9px] uppercase font-bold text-emerald-200">Rekor Tertinggi</div>
                <div className="text-base font-black text-amber-300">{(userData?.maxLoginStreak || loginStreak).toLocaleString('id-ID')} Hari</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center sm:text-right flex-1 sm:flex-initial">
                <div className="text-[9px] uppercase font-bold text-emerald-200">Total XP</div>
                <div className="text-base font-black text-cyan-300">{(userData?.points || userData?.totalPoints || userData?.xp || 0).toLocaleString('id-ID')} XP</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 mt-4 border-t border-white/15 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-medium text-emerald-100">Sebarkan semangat istiqomah kepada sesama santri</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsReportOpen(true)}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur-md rounded-xl border border-rose-400/40 text-rose-100 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 shadow-sm"
              >
                <Flag size={13} className="text-rose-300" />
                <span>Laporkan</span>
              </button>
              <button
                onClick={handleShareAttendance}
                className="px-3.5 py-1.5 bg-sky-500/25 hover:bg-sky-500/35 backdrop-blur-md rounded-xl border border-sky-400/40 text-sky-100 text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 shrink-0 shadow-sm"
              >
                <Share2 size={13} className="text-sky-300" />
                <span>Bagikan Progress</span>
              </button>
            </div>
          </div>
        </div>

        {/* Nudges Received Alerts */}
        {!isCheckedInToday && receivedNudges.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-dashed border-amber-300 dark:border-amber-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-400 text-white rounded-2xl shrink-0">
                <Bell size={24} className="animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-800 dark:text-amber-300">Anda Disenggol Santri Lain! 👋</h4>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  Ada {receivedNudges.length} santri yang menyenggol Anda agar tidak lupa absen hari ini, termasuk <strong className="text-amber-800 dark:text-amber-300">{receivedNudges[0]?.fromName || 'Santri'}</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleCheckIn()}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs rounded-2xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <CalendarCheck size={14} />}
              Absen Sekarang!
            </button>
          </div>
        )}

        {/* Action Button: Check In Now / Bonus Ad Claim */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          {!isCheckedInToday ? (
            <button
              onClick={() => handleCheckIn()}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-2xl font-black text-base shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all animate-pulse"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Memproses Absensi...
                </>
              ) : (
                <>
                  <CalendarCheck size={20} />
                  Klaim Absensi Hari Ke-{activeDayInCycle}
                </>
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
                <div className="text-emerald-700 dark:text-emerald-300 font-bold text-base flex items-center justify-center gap-2">
                  <CheckCircle2 size={22} className="text-emerald-500" />
                  Alhamdulillah! Anda Sudah Absen Hari Ini
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Kembalilah besok untuk mempertahankan rantai istiqomah & klaim Wasilah berikutnya.
                </p>
              </div>

              {/* Bonus Wasilah from AdMob Rewarded Ad */}
              {!isAdRewardClaimedToday ? (
                <div className="p-5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/50 text-purple-600 rounded-xl">
                      <Tv size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">Klaim Tambahan +1 Wasilah</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Tonton video sponsor sebentar untuk melipatgandakan berkah</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClaimAdReward}
                    disabled={claimingAdReward}
                    className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all animate-pulse"
                  >
                    {claimingAdReward ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <PlusCircle size={14} />
                    )}
                    Ambil +1 Wasilah Gratis
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} className="text-purple-500" />
                  Bonus +1 Wasilah harian lewat iklan reward telah sukses diklaim harian Anda!
                </div>
              )}
            </div>
          )}
        </div>

        {/* 7-Day Cycle Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-500" /> Absensi 7 Hari
            </h3>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
              {isCheckedInToday ? 'Sudah Absen Hari Ini' : `Hari ke-${activeDayInCycle}`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-8 gap-3">
            {STREAK_REWARDS.map((reward) => {
              const dayNum = reward.day;
              const isCompleted = isCheckedInToday ? dayNum <= activeDayInCycle : dayNum < activeDayInCycle;
              const isActive = dayNum === activeDayInCycle && !isCheckedInToday;
              const isGrandDay = dayNum === 7;

              return (
                <div
                  key={dayNum}
                  className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-between text-center transition-all ${
                    isGrandDay 
                      ? (isCompleted 
                          ? 'col-span-2 sm:col-span-2 bg-emerald-600 border border-emerald-500 text-yellow-300 shadow-md font-black' 
                          : 'col-span-2 sm:col-span-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 border border-amber-300 shadow-md font-black')
                      : isCompleted 
                      ? 'bg-emerald-600 border border-emerald-500 text-yellow-300 shadow-md' 
                      : 'bg-rose-600 border border-rose-500 text-white shadow-md'
                  }`}
                >
                  <span className={`text-[11px] font-black uppercase ${isGrandDay && !isCompleted ? 'text-slate-950/80' : isCompleted ? 'text-yellow-200' : 'text-white/80'}`}>
                    Hari {dayNum}
                  </span>

                  <div className="my-2 flex flex-col items-center">
                    {isCompleted ? (
                      <CheckCircle2 size={22} className={isGrandDay && !isCompleted ? "text-slate-950" : "text-yellow-300"} />
                    ) : (
                      <X size={22} className={isGrandDay ? "text-slate-950" : "text-white"} />
                    )}
                  </div>

                  <span className={`text-[10px] font-bold ${isGrandDay && !isCompleted ? 'text-slate-950' : isCompleted ? 'text-yellow-300' : 'text-white'}`}>
                    {isGrandDay ? `+${reward.wasilah} Wasilah +${reward.xp} XP` : isCompleted ? 'Selesai' : `+${reward.wasilah} Wasilah`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Missed Day & Streak Saver Banner */}
        {isMissedYesterday && !isCheckedInToday && (
          <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-3xl text-slate-800 dark:text-slate-200">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-100 dark:bg-rose-900/60 text-rose-600 rounded-2xl shrink-0 mt-0.5">
                <Flame size={24} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-bold text-rose-900 dark:text-rose-200">Rantai Istiqomah Terputus!</h4>
                {isExactlyOneDayMissed ? (
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                    Anda terlewat absensi kemarin (1 hari terlewat). Silakan klik tombol hijau <strong>"Klaim Absensi Hari Ke-{activeDayInCycle}"</strong> di bawah untuk memilih opsi <strong>Selamatkan Streak</strong> atau <strong>Mulai Dari Awal</strong>.
                  </p>
                ) : (
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
                    Anda terlewat absensi lebih dari 1 hari. Sesuai ketentuan, penyelamat rantai hanya berlaku jika terlewat maksimal 1 hari. Silakan klik tombol hijau di bawah untuk memulai kembali rantai kebaikan Anda dari Hari Ke-1.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mutiara Hikmah Claim Card (if claimed) */}
        {claimedWisdom && (
          <div className="p-6 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-purple-500/10 border border-amber-300/50 dark:border-amber-500/30 rounded-3xl space-y-4 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
              <span className="flex items-center gap-2 text-sm font-black">
                <Quote size={18} /> Mutiara Hikmah Harian
              </span>
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/80 rounded-full text-[11px] font-bold">
                {claimedWisdom.category}
              </span>
            </div>

            {claimedWisdom.arabic && (
              <div className="text-right text-xl font-serif font-bold text-amber-900 dark:text-amber-200 leading-loose font-arabic">
                {claimedWisdom.arabic}
              </div>
            )}

            <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
              "{claimedWisdom.text}"
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-amber-200/50 dark:border-amber-800/40">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                — {claimedWisdom.source}
              </span>
              <button
                onClick={handleShareHikmah}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Share2 size={14} /> Bagikan Hikmah
              </button>
            </div>
          </div>
        )}

        {/* Absensi Berjamaah (100 Absen Hari Ini) Progress & Bonus */}
        <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-green-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-600/50 space-y-4 relative overflow-hidden">
          {/* Decorative Glows */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-300/40 rounded-full text-amber-300 text-[11px] font-black uppercase tracking-wider mb-2">
                <Sparkles size={13} className="animate-spin" /> Target Komunitas Harian
              </div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Users size={20} className="text-emerald-300" /> 100 Absen Hari Ini
              </h3>
              <p className="text-xs text-emerald-100/90 mt-1 font-medium">
                Ayo capai target 100 santri bersama! Total bonus <strong className="text-amber-300">1.000 Wasilah + 10.000 XP</strong> cair untuk komunitas.
              </p>
            </div>
            
            <div className="self-start sm:self-auto px-4 py-2 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 text-center shrink-0">
              <div className="text-[10px] uppercase font-bold text-emerald-200">Progress Absen</div>
              <div className="text-lg font-black text-amber-300">{dailyCheckInCount} / 100 Santri</div>
            </div>
          </div>

          {/* Real-time Percentage Progress bar */}
          <div className="relative z-10 space-y-1.5">
            <div className="w-full bg-black/30 backdrop-blur-md h-4 rounded-full overflow-hidden relative border border-white/15 shadow-inner">
              <div 
                className="bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 text-[10px] font-black text-slate-950 shadow-md"
                style={{ width: `${Math.min((dailyCheckInCount / 100) * 100, 100)}%` }}
              >
                {Math.round(Math.min((dailyCheckInCount / 100) * 100, 100)) > 5 && `${Math.round(Math.min((dailyCheckInCount / 100) * 100, 100))}%`}
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-emerald-200 font-bold">
              <span>Mulai</span>
              <span>Target: 100 Santri (+10 Wasilah & +100 XP / Santri)</span>
            </div>
          </div>

          {/* Bonus Detail Banner & Claim Button */}
          <div className="relative z-10 p-4 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-400 text-slate-950 rounded-xl shrink-0 font-black">
                <Gift size={20} />
              </div>
              <div>
                <div className="text-xs font-extrabold text-amber-300">
                  Bonus Komunitas: +10 Wasilah & +100 XP / Santri
                </div>
                <p className="text-[11px] text-emerald-100/90 leading-tight mt-0.5">
                  {dailyCheckInCount >= 100 
                    ? "Alhamdulillah! Target 100 absen tercapai! Setiap santri yang absen berhak klaim bonus."
                    : `Butuh ${Math.max(0, 100 - dailyCheckInCount)} santri lagi untuk membuka bonus 1.000 Wasilah + 10.000 XP!`}
                </p>
              </div>
            </div>

            {dailyCheckInCount >= 100 && isCheckedInToday && (
              userData?.lastCommunityTargetRewardClaimed === today ? (
                <div className="px-4 py-2 bg-emerald-500/30 border border-emerald-400/50 rounded-xl text-xs font-black text-emerald-200 flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                  <CheckCircle2 size={16} className="text-emerald-300" />
                  Bonus +10 Wasilah & +100 XP Diklaim!
                </div>
              ) : (
                <button
                  onClick={handleClaimCommunityBonus}
                  disabled={claimingCommunityReward}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs font-black rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 animate-bounce"
                >
                  {claimingCommunityReward ? <Loader2 size={14} className="animate-spin" /> : <Gift size={14} />}
                  Klaim +10 Wasilah & +100 XP
                </button>
              )
            )}
          </div>
        </div>

        {/* Senggol Santri Lain Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500 animate-pulse" /> Senggol Absen Santri
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Senggol 4 santri yang belum absen untuk klaim hadiah <strong className="text-emerald-600 dark:text-emerald-400">+100 XP & +1 Wasilah</strong>!
              </p>
            </div>
            
            {/* Daily Nudge Counter Badge */}
            <div className="self-start sm:self-auto px-4 py-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200/50 dark:border-amber-800/50 flex items-center gap-1.5 text-xs font-black">
              <span>Senggolan Harian:</span>
              <span className="text-sm text-amber-700 dark:text-amber-300">{effectiveDailyNudgeCount}/4</span>
            </div>
          </div>

          {effectiveDailyNudgeCount >= 4 ? (
            <div className="text-center py-8 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-5 space-y-3 animate-in fade-in duration-300">
              <span className="text-3xl">🎉</span>
              <h4 className="text-sm font-black text-emerald-800 dark:text-emerald-300">Misi Senggol Absen Selesai!</h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-450 font-bold max-w-md mx-auto">
                Alhamdulillah! Anda telah menyenggol 4 santri hari ini dan mengklaim bonus +100 XP & +1 Wasilah. Teruskan jalin silaturahmi berkah ini esok hari!
              </p>
              <button
                type="button"
                onClick={handleShareNudgeReward}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-black inline-flex items-center gap-2 shadow-md hover:brightness-105 active:scale-95 transition-all"
              >
                <Share2 size={14} />
                <span>Bagikan Keberhasilan</span>
              </button>
            </div>
          ) : shuffledNudgeList.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
              <p className="text-sm text-slate-400">Masya Allah! Semua santri di daftar ini sudah absen harian. 🎉</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {shuffledNudgeList.map((targetUser) => {
                const isNudging = nudgingIds.includes(targetUser.id);
                const hasNudgedToday = userData?.nudgedUserIds?.includes(targetUser.id) && userData?.lastNudgeDate === today;
                
                return (
                  <div 
                    key={targetUser.id} 
                    className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center space-y-3 relative group overflow-hidden transition-all hover:shadow-md"
                  >
                    <div className="relative">
                      {targetUser.photoURL ? (
                        <img 
                          src={targetUser.photoURL} 
                          alt={targetUser.displayName} 
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-lg">
                          {(targetUser.displayName || 'S')[0].toUpperCase()}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full" title="Belum Absen" />
                    </div>

                    <div className="space-y-0.5 w-full">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                        {targetUser.displayName || 'Santri AI'}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Streak: {targetUser.loginStreak || 0} Hari
                      </p>
                    </div>

                    <button
                      onClick={() => handleNudgeClick(targetUser.id)}
                      disabled={isNudging || hasNudgedToday}
                      className={`w-full py-2 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                        hasNudgedToday 
                          ? 'bg-slate-100 text-slate-400 dark:bg-slate-800/80 dark:text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-200 dark:shadow-none hover:brightness-105'
                      }`}
                    >
                      {isNudging ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <span>👋</span>
                      )}
                      {hasNudgedToday ? 'Disenggol' : 'Senggol'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Istiqomah Leaderboard Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" /> Top Istiqomah Santri
            </h3>
            <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
              Paling Konsisten
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {streakLeaderboard.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Memuat data peraih istiqomah tertinggi...
              </div>
            ) : (
              streakLeaderboard.slice(0, 10).map((u, index) => {
                const isCurrentUser = u.id === user?.uid;
                const userBadge = u.verificationBadge || u.badge || '';
                const isVerified = (userBadge && userBadge !== 'none') || u.isVerified === true || u.badgeVerified === true || u.isPremium === true;

                return (
                  <div key={u.id} className={`flex items-center justify-between py-3.5 ${isCurrentUser ? 'bg-emerald-500/5 -mx-4 px-4 rounded-2xl' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-center text-xs font-black ${
                        index === 0 ? 'text-xl' : index === 1 ? 'text-lg' : index === 2 ? 'text-lg' : 'text-slate-400'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                      </span>
                      <div className="relative">
                        <img 
                          src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.displayName || 'Santri'}`} 
                          alt={u.displayName} 
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                        {isVerified && (
                          <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border border-white dark:border-slate-900">
                            <ShieldCheck size={10} className="fill-white text-blue-500" />
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                          {u.displayName || 'Hamba Allah'}
                          {isCurrentUser && (
                            <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-md font-bold">
                              Anda
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Prestige: {u.points || 0} XP
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/5 px-2.5 py-1 rounded-full border border-amber-500/20 text-amber-600 dark:text-amber-400">
                      <Flame size={12} className="fill-amber-500" />
                      <span className="text-xs font-black">{u.loginStreak || 0} Hari</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Reward Ad Offer Modal */}
      {showAdOfferModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-5 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-7 shadow-2xl relative animate-in zoom-in-95 duration-300 text-center border border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tv size={32} className="text-amber-500 animate-bounce" />
            </div>
            
            <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">Misi Harian Selesai!</h3>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">Absensi Berhasil Diklaim</p>
            
            <div className="my-5 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Mau Tambahan Wasilah hari ini?
              </p>
              <p className="text-sm font-black text-amber-750 dark:text-amber-400 mt-1">
                Dapatkan +1 Wasilah Ekstra secara instan dengan menonton video singkat!
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAdOfferModal(false)}
                className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-2xl font-black text-xs active:scale-95 transition-all"
              >
                Nanti Saja
              </button>
              <button
                disabled={claimingAdReward}
                onClick={async () => {
                  setShowAdOfferModal(false);
                  await handleClaimAdReward();
                }}
                className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-black text-xs shadow-md shadow-amber-500/10 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                {claimingAdReward ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Tv size={14} />
                    Tonton Iklan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Streak Saver Choice Modal */}
      {showStreakChoiceModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-5 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-7 shadow-2xl relative animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flame size={32} className="text-rose-500 animate-pulse" />
            </div>
            
            <h3 className="text-xl font-black text-slate-800 dark:text-white text-center leading-tight">Rantai Istiqomah Terputus!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">Anda terlewat absensi kemarin. Silakan pilih opsi untuk melanjutkan:</p>

            <div className="my-5 space-y-4">
              {/* Option 1: Save Streak */}
              <div className="p-4 bg-gradient-to-br from-amber-500/10 to-rose-600/10 border border-amber-500/20 dark:border-rose-950/40 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-black text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  <Sparkles size={14} /> Opsi 1: Lanjutkan Rantai
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                  Gunakan <strong>2 Wasilah + 📺 Nonton Iklan</strong> untuk menganggap Anda hadir kemarin, sehingga Anda bisa mengklaim absensi hari ini sebagai <strong>Hari Ke-{((loginStreak + 1) % 7) + 1}</strong> tanpa terputus.
                </p>
                <button
                  onClick={handleSaveStreakAction}
                  disabled={savingStreak}
                  className="w-full mt-2 py-3.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white rounded-xl font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {savingStreak ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Gem size={14} className="text-cyan-200 fill-cyan-200/30" />
                      <Tv size={14} />
                    </>
                  )}
                  Selamatkan Streak (2 Wasilah + Iklan)
                </button>
              </div>

              {/* Option 2: Restart from scratch */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
                <div className="font-black text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Opsi 2: Mulai Dari Awal
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                  Rantai Istiqomah Anda akan disetel ulang ke Hari 1. Absensi hari ini akan dihitung sebagai <strong>Hari Ke-1</strong>.
                </p>
                <button
                  onClick={() => {
                    setShowStreakChoiceModal(false);
                    handleCheckIn(true);
                  }}
                  className="w-full mt-2 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-black text-xs active:scale-95 transition-all cursor-pointer"
                >
                  Mulai Kembali dari Hari Ke-1
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowStreakChoiceModal(false)}
              className="w-full py-2.5 text-center text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-450 font-bold"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Nudge Completion Modal */}
      {showNudgeCompletionModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-5 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-7 shadow-2xl relative animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800 text-center space-y-5">
            <button
              onClick={() => setShowNudgeCompletionModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full bg-slate-100 dark:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 text-4xl animate-bounce">
              👋
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
                Misi Senggol Absen Selesai! 🎉
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                Masya Allah! Anda telah berhasil menyenggol 4 santri hari ini untuk saling mengingatkan dalam keistiqomahan.
              </p>
            </div>

            {/* Reward Info */}
            <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block">
                Bonus Hadiah Ditambahkan Ke Saldo:
              </span>
              <div className="flex items-center justify-center gap-4 pt-1">
                <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                  <Gem size={18} className="text-cyan-500 fill-cyan-500/30 animate-pulse" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">+1 Wasilah</span>
                </div>
                <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                  <Trophy size={18} className="text-amber-500 fill-amber-500/30" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">+100 XP</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={handleShareNudgeReward}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                <span>Bagikan Keberhasilan</span>
              </button>

              <button
                onClick={() => setShowNudgeCompletionModal(false)}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-xs active:scale-95 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Report Modal */}
      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName="Absensi Harian & Rantai Istiqomah"
        contentSnippet={`Streak: ${loginStreak} Hari, Total Wasilah: ${userData?.wasilah ?? 0}`}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

    </div>
  );
};

export default AttendanceScreen;
