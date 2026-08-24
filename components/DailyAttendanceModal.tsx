import React, { useState } from 'react';
import { 
  X, 
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
  Award,
  Users
} from 'lucide-react';
import { handleDailyCheckIn, handleSaveStreak, DailyCheckInResult, subscribeToDailyAttendanceStats } from '../services/firebase';
import { getRandomDailyWisdom, DailyWisdom } from '../constants/dailyWisdom';
import { useToast } from '../contexts/ToastContext';
import { shareText } from '../utils/linkUtils';

interface DailyAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  userData: any;
  onSuccess?: () => void;
}

export const DailyAttendanceModal: React.FC<DailyAttendanceModalProps> = ({
  isOpen,
  onClose,
  user,
  userData,
  onSuccess
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [savingStreak, setSavingStreak] = useState(false);
  const [claimResult, setClaimResult] = useState<DailyCheckInResult | null>(null);
  const [claimedWisdom, setClaimedWisdom] = useState<DailyWisdom | null>(null);
  const [dailyCheckInCount, setDailyCheckInCount] = useState(0);

  React.useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToDailyAttendanceStats((data) => {
      setDailyCheckInCount(data.count);
    });
    return () => unsub();
  }, [isOpen]);

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const lastCheckIn = userData?.lastCheckIn || null;
  const loginStreak = userData?.loginStreak || 0;

  const isCheckedInToday = lastCheckIn === today;
  const isCheckedInYesterday = lastCheckIn === yesterday;
  const isMissedYesterday = lastCheckIn && lastCheckIn !== today && lastCheckIn !== yesterday;

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
    // Missed yesterday - active day will be 1 unless saved
    activeDayInCycle = 1;
  }

  React.useEffect(() => {
    if (isOpen && lastCheckIn === today && !claimedWisdom) {
      setClaimedWisdom(getRandomDailyWisdom());
    }
  }, [isOpen, lastCheckIn]);

  if (!isOpen) return null;

  // Handle Check-In
  const handleCheckIn = async () => {
    if (!user) {
      showToast("Silakan login terlebih dahulu untuk absen.", "info");
      return;
    }
    setLoading(true);
    try {
      const res = await handleDailyCheckIn(user.uid);
      setClaimResult(res);
      const wisdom = getRandomDailyWisdom();
      setClaimedWisdom(wisdom);
      showToast(res.message, res.isGrandDay ? "success" : "info");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(err.message || "Gagal melakukan absensi", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Streak Saver
  const handleSaveStreakAction = async (method: 'wasilah' | 'ad') => {
    if (!user) return;

    if (method === 'ad') {
      if ((window as any).AndroidNativeInterface?.showRewardedAd) {
        showToast("Menampilkan iklan video untuk menyelamatkan streak...", "info");
        (window as any).AndroidNativeInterface.showRewardedAd();
      }
    }

    setSavingStreak(true);
    try {
      const res = await handleSaveStreak(user.uid, method);
      showToast(res.message, "success");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showToast(err.message || "Gagal menyelamatkan streak", "error");
    } finally {
      setSavingStreak(false);
    }
  };

  // Share Mutiara Hikmah
  const handleShareHikmah = () => {
    if (!claimedWisdom) return;
    const shareContent = `✨ *Mutiara Hikmah Harian Santri AI* ✨\n\n${claimedWisdom.arabic ? `${claimedWisdom.arabic}\n\n` : ''}"${claimedWisdom.text}"\n\n— *${claimedWisdom.source}*\n\nMari tingkatkan keistiqomahan bersama Santri AI App!`;
    shareText("Mutiara Hikmah Santri AI", shareContent);
    showToast("Membuka menu berbagi...", "info");
  };

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="relative p-6 pb-4 bg-gradient-to-r from-emerald-600 via-teal-700 to-green-800 text-white shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-full hover:bg-white/20 transition-all active:scale-90"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
              <CalendarCheck size={24} className="text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Absensi Harian & Istiqomah</h2>
              <p className="text-xs text-emerald-100">Buka aplikasi tiap hari untuk klaim Wasilah & Bonus XP</p>
            </div>
          </div>

          {/* Streak Indicator Pill */}
          <div className="mt-4 flex items-center justify-between p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/30 rounded-xl text-amber-300 animate-pulse">
                <Flame size={18} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-200">Rantai Istiqomah</div>
                <div className="text-base font-black text-white">{loginStreak} Hari Berturut-turut</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-emerald-200">Rekor Tertinggi</div>
              <div className="text-sm font-bold text-amber-300">{userData?.maxLoginStreak || loginStreak} Hari</div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* 7-Day Cycle Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" /> Absensi 7 Hari
              </h3>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {isCheckedInToday ? 'Sudah Absen Hari Ini' : `Hari ke-${activeDayInCycle}`}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                const isCompleted = isCheckedInToday ? dayNum <= activeDayInCycle : dayNum < activeDayInCycle;
                const isActive = dayNum === activeDayInCycle && !isCheckedInToday;
                const isGrandDay = dayNum === 7;

                return (
                  <div
                    key={dayNum}
                    className={`relative p-2 rounded-2xl flex flex-col items-center justify-between text-center transition-all ${
                      isGrandDay 
                        ? 'col-span-1 bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20 ring-2 ring-amber-300' 
                        : isCompleted 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' 
                        : isActive 
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 text-amber-900 dark:text-amber-200 scale-105 shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className={`text-[10px] font-black uppercase ${isGrandDay ? 'text-amber-100' : 'text-slate-400'}`}>
                      H-{dayNum}
                    </span>

                    <div className="my-1.5">
                      {isCompleted ? (
                        <CheckCircle2 size={18} className={isGrandDay ? "text-white" : "text-emerald-500"} />
                      ) : isGrandDay ? (
                        <Gift size={20} className="text-white animate-bounce" />
                      ) : (
                        <div className="text-xs font-black">+10</div>
                      )}
                    </div>

                    <span className={`text-[9px] font-bold ${isGrandDay ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {isGrandDay ? '+50 XP' : '+1 Wasilah'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 100 Absen Hari Ini Komunitas Banner */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-green-900 text-white rounded-2xl p-4 shadow-md border border-emerald-600/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-400 text-slate-950 rounded-lg">
                  <Users size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-300">Target 100 Absen Hari Ini</h4>
                  <p className="text-[10px] text-emerald-100">Bonus 1.000 Wasilah + 10.000 XP (+10 Wasilah & +100 XP / Santri)</p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-300 px-2.5 py-1 bg-white/10 rounded-xl border border-white/10">
                {dailyCheckInCount} / 100
              </span>
            </div>

            <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden border border-white/10">
              <div 
                className="bg-gradient-to-r from-amber-400 to-teal-300 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min((dailyCheckInCount / 100) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Missed Day & Streak Saver Banner */}
          {isMissedYesterday && !isCheckedInToday && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-slate-800 dark:text-slate-200 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/60 text-rose-600 rounded-xl shrink-0 mt-0.5">
                  <Flame size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">Rantai Istiqomah Terputus!</h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                    Anda tidak melakukan absensi kemarin. 
                    {hasVerifiedBadge 
                      ? " Sebagai Santri ber-Lencana Verifikasi, Anda dapat menggunakan Penyelamat Streak!"
                      : " Rantai akan diset ulang ke Hari 1. Tingkatkan status ke Lencana Verifikasi untuk membuka Penyelamat Streak."}
                  </p>
                </div>
              </div>

              {/* Streak Saver Options for Verified Users */}
              {hasVerifiedBadge ? (
                <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSaveStreakAction('wasilah')}
                    disabled={savingStreak}
                    className="p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    {savingStreak ? <Loader2 size={14} className="animate-spin" /> : <Coins size={14} />}
                    3 Wasilah (Selamatkan)
                  </button>

                  <button
                    onClick={() => handleSaveStreakAction('ad')}
                    disabled={savingStreak}
                    className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    {savingStreak ? <Loader2 size={14} className="animate-spin" /> : <Tv size={14} />}
                    Tonton Iklan (Gratis)
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
                    <ShieldCheck size={14} /> Dapatkan Lencana Verifikasi
                  </span>
                  <span className="text-[10px] bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold">
                    Khusus Verifikasi
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mutiara Hikmah Claim Card (if claimed) */}
          {claimedWisdom && (
            <div className="p-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-purple-500/10 border border-amber-300/40 dark:border-amber-500/30 rounded-3xl space-y-3 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Quote size={16} /> Mutiara Hikmah Harian
                </span>
                <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/80 rounded-full text-[10px]">
                  {claimedWisdom.category}
                </span>
              </div>

              {claimedWisdom.arabic && (
                <div className="text-right text-lg font-serif font-bold text-amber-900 dark:text-amber-200 leading-relaxed font-arabic">
                  {claimedWisdom.arabic}
                </div>
              )}

              <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "{claimedWisdom.text}"
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-amber-200/50 dark:border-amber-800/40">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  — {claimedWisdom.source}
                </span>
                <button
                  onClick={handleShareHikmah}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                >
                  <Share2 size={12} /> Bagikan
                </button>
              </div>
            </div>
          )}

          {/* Action Button: Check In Now */}
          {!isCheckedInToday ? (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-2xl font-black text-base shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
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
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-1">
              <div className="text-emerald-700 dark:text-emerald-300 font-bold text-sm flex items-center justify-center gap-1.5">
                <CheckCircle2 size={18} className="text-emerald-500" />
                Alhamdulillah! Anda Sudah Absen Hari Ini
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kembalilah besok untuk mempertahankan rantai istiqomah & klaim Wasilah berikutnya.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default DailyAttendanceModal;
