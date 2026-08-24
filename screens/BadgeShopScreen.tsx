import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  BadgeCheck, 
  ChevronRight, 
  Coins,
  Gem,
  X,
  Sparkles,
  ShoppingBag,
  Clock,
  Share2,
  Star,
  Flag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserAvatar } from '../components/UserAvatar';
import { 
  subscribeVerificationBadgeViaGooglePlay,
  updateUserData,
  buyBadgeWithWasilah
} from '../services/firebase';
import { shareText, openRatingApp } from '../utils/linkUtils';
import ContentReportModal from '../components/ContentReportModal';

const VERIFICATION_BADGES = [
  { 
    id: 'badge_purple', 
    name: 'Verifikasi Ungu', 
    price: 10000, 
    wasilahPrice: 100,
    color: 'purple', 
    colorClass: 'text-purple-500', 
    bg: 'bg-purple-50 dark:bg-purple-950/30', 
    border: 'border-purple-200 dark:border-purple-900',
    desc: 'Lencana keaslian santri berwarna ungu nan agung.',
    perks: [
      'Akses membuat "Bantu Doa" di Komunitas',
      '+3 Kesempatan Salah di Cerdas Cermat (Total 8)',
      '+5 XP Bonus per Jawaban Kuis Benar',
      '+1 Kuota Harian Kuis Multiplayer / Versus'
    ]
  },
  { 
    id: 'badge_blue', 
    name: 'Verifikasi Biru', 
    price: 50000, 
    wasilahPrice: 500,
    color: 'blue', 
    colorClass: 'text-blue-500', 
    bg: 'bg-blue-50 dark:bg-blue-950/30', 
    border: 'border-blue-200 dark:border-blue-900',
    desc: 'Lencana resmi selebritis santri & tokoh panutan.',
    perks: [
      'Akses membuat "Bantu Doa" di Komunitas',
      '+5 Kesempatan Salah di Cerdas Cermat (Total 10)',
      '+10 XP Bonus per Jawaban Kuis Benar',
      '+2 Kuota Harian Kuis Multiplayer / Versus'
    ]
  },
  { 
    id: 'badge_red', 
    name: 'Verifikasi Merah', 
    price: 100000, 
    wasilahPrice: 1000,
    color: 'red', 
    colorClass: 'text-red-500', 
    bg: 'bg-red-50 dark:bg-red-950/30', 
    border: 'border-red-200 dark:border-red-900',
    desc: 'Gelar kehormatan santri bersertifikat resmi.',
    perks: [
      'Akses membuat "Bantu Doa" di Komunitas',
      '+8 Kesempatan Salah di Cerdas Cermat (Total 13)',
      '+15 XP Bonus per Jawaban Kuis Benar',
      '+3 Kuota Harian Kuis Multiplayer / Versus'
    ]
  },
  { 
    id: 'badge_green', 
    name: 'Verifikasi Hijau', 
    price: 150000, 
    wasilahPrice: 1500,
    color: 'emerald', 
    colorClass: 'text-emerald-500', 
    bg: 'bg-emerald-50 dark:bg-emerald-950/30', 
    border: 'border-emerald-200 dark:border-emerald-900',
    desc: 'Lencana resmi penanda kontributor dakwah.',
    perks: [
      'Akses membuat "Bantu Doa" di Komunitas',
      '+10 Kesempatan Salah di Cerdas Cermat (Total 15)',
      '+20 XP Bonus per Jawaban Kuis Benar',
      '+4 Kuota Harian Kuis Multiplayer / Versus'
    ]
  },
  { 
    id: 'badge_gold', 
    name: 'Verifikasi Emas', 
    price: 200000, 
    wasilahPrice: 2000,
    color: 'amber', 
    colorClass: 'text-amber-500', 
    bg: 'bg-amber-50 dark:bg-amber-950/30', 
    border: 'border-amber-200 dark:border-amber-900',
    desc: 'Lencana kehormatan tertinggi emas lambang keteladanan.',
    perks: [
      'Akses membuat "Bantu Doa" di Komunitas',
      '+15 Kesempatan Salah di Cerdas Cermat (Total 20)',
      '+30 XP Bonus per Jawaban Kuis Benar',
      '+5 Kuota Harian Kuis Multiplayer / Versus'
    ]
  }
];

const BadgeShopScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const expiryStr = userData?.badgeUntil || userData?.badgeExpiry;
    if (!expiryStr || !userData?.verificationBadge || userData?.verificationBadge === 'none') {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const difference = +new Date(expiryStr) - +new Date();
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [userData?.badgeUntil, userData?.badgeExpiry, userData?.verificationBadge]);

  const handlePurchaseWithWasilah = async (badge: any) => {
    if (!user) {
      showToast("Silakan login atau daftar terlebih dahulu untuk melakukan transaksi.", "warning");
      return;
    }

    if ((userData?.wasilah || 0) < badge.wasilahPrice) {
      showToast("Saldo Wasilah Anda tidak mencukupi untuk melakukan penukaran lencana ini.", "warning");
      return;
    }

    setLoading(true);
    try {
      await buyBadgeWithWasilah(user.uid, badge.id, badge.name, badge.wasilahPrice);
      showToast(`Alhamdulillah! Penukaran lencana '${badge.name}' seharga ${badge.wasilahPrice} Wasilah berhasil!`, "success");
      setSelectedBadge(null);
    } catch (e) {
      console.error("Gagal membeli lencana dengan Wasilah:", e);
      showToast("Gagal memproses penukaran lencana dengan Wasilah.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Listening to real native/webview Google Play Billing callbacks
  useEffect(() => {
    window.onPurchaseSuccess = async (productId: string) => {
      if (!user) return;
      setLoading(true);
      try {
        if (productId.startsWith('badge_')) {
          const badge = VERIFICATION_BADGES.find(b => b.id === productId);
          if (badge) {
            await subscribeVerificationBadgeViaGooglePlay(user.uid, badge.id, badge.name, badge.price);
            showToast(`Alhamdulillah! Langganan sukses via Google Play. Lencana '${badge.name}' telah disematkan di profil Anda.`, "success");
          } else {
            await subscribeVerificationBadgeViaGooglePlay(user.uid, productId, "Lencana Verifikasi", 50000);
            showToast(`Alhamdulillah! Langganan sukses via Google Play.`, "success");
          }
        }
      } catch (e) {
        console.error("Gagal menyimpan pembelian sukses ke Firestore:", e);
        showToast("Transaksi Google Play sukses, namun terjadi kendala sinkronisasi database.", "error");
      } finally {
        setLoading(false);
      }
    };

    window.onPurchaseCancelled = (error: string) => {
      setLoading(false);
      showToast(error ? `Pembelian dibatalkan/gagal: ${error}` : 'Pembelian Google Play dibatalkan.', 'warning');
    };

    return () => {
      delete window.onPurchaseSuccess;
      delete window.onPurchaseCancelled;
    };
  }, [user, showToast]);

  const handleOpenPlayBilling = (id: string, name: string, price: number) => {
    if (!user) {
      showToast("Silakan login atau daftar terlebih dahulu untuk melakukan transaksi.", "warning");
      return;
    }

    // Check if running in a real Android native environment with Play Billing support
    if (window.AndroidNativeInterface?.launchBillingFlow) {
      try {
        setLoading(true);
        showToast(`Menghubungkan ke Google Play Billing untuk membeli '${name}'...`, "info");
        window.AndroidNativeInterface.launchBillingFlow(id);
      } catch (err) {
        setLoading(false);
        console.error("Gagal meluncurkan jembatan Google Play Billing:", err);
        showToast("Gagal memproses pembayaran via Google Play Store asli.", "error");
      }
      return;
    }

    showToast("Fitur pembayaran Google Play Billing ini hanya aktif jika dibuka melalui Aplikasi Android resmi Santri AI.", "info");
  };

  const handleEquipBadge = async (badgeId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await updateUserData(user.uid, { verificationBadge: badgeId });
      showToast("Lencana verifikasi Anda berhasil dipasang!", "success");
    } catch (e) {
      console.error("Gagal memasang lencana verifikasi:", e);
      showToast("Gagal memasang lencana verifikasi.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-100 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/20 pb-24 font-sans selection:bg-purple-100 selection:text-purple-900 transition-colors duration-300">
      
      {/* Navigation Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/40 text-white backdrop-blur-xl border-b border-purple-500/20 dark:border-slate-800/80 px-4 py-3 sticky top-0 z-40 shadow-md flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate(-1)} 
            className="p-1.5 bg-white/10 dark:bg-slate-800 text-white dark:text-slate-400 rounded-xl hover:bg-white/20 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm border border-white/10 dark:border-slate-700/50"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-black text-white leading-none flex items-center gap-1.5 mb-1 text-shadow-sm">
              Toko Lencana <BadgeCheck size={14} className="text-purple-300 animate-pulse fill-purple-300/20" />
            </h1>
            <p className="text-[8px] font-bold text-purple-100/80 dark:text-slate-500 uppercase tracking-wider">Lencana Verifikasi Elite</p>
          </div>
        </div>

        {/* Wasilah Balance Display */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-white/15 dark:bg-purple-500/20 border border-white/20 dark:border-purple-500/30 rounded-full shadow-inner ml-1">
            <Gem size={12} className="text-cyan-400 fill-cyan-400/20 animate-pulse" />
            <span className="text-[10px] font-black text-white dark:text-purple-400">
              {(userData?.wasilah || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Intro Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 rounded-3xl p-6 md:p-8 text-white border-0 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-12"></div>
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
              <BadgeCheck size={12} className="text-white animate-pulse" /> Langganan Bulanan Aman
            </div>
            <h2 className="text-2xl font-black tracking-tight leading-tight uppercase text-shadow">Tampil Kredibel Dengan Lencana</h2>
            <p className="text-xs text-purple-50 max-w-md leading-relaxed font-medium">
              Hiasi foto profil Anda dalam aplikasi dengan checklist status verifikasi elite. Pembayaran berulang sebulan sekali aman dan praktis via Google Play Subscriptions.
            </p>
          </div>
        </motion.div>

        {/* Active Badge & Countdown Banner */}
        {userData?.verificationBadge && userData?.verificationBadge !== 'none' && timeLeft && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 rounded-3xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 w-full md:w-auto">
              {(() => {
                const activeBadgeObj = VERIFICATION_BADGES.find(b => b.id === userData?.verificationBadge);
                if (!activeBadgeObj) return null;
                return (
                  <>
                    <div className={`w-12 h-12 ${activeBadgeObj.bg} rounded-2xl flex items-center justify-center ${activeBadgeObj.colorClass} shrink-0`}>
                      <BadgeCheck size={24} className="fill-current/10" />
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase text-purple-600 dark:text-purple-450 tracking-wider">Lencana Aktif Anda</span>
                      <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase leading-none mt-0.5">{activeBadgeObj.name}</h3>
                      <p className="text-[9px] text-slate-400 font-bold mt-1">Masa Aktif: Terverifikasi & Resmi</p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Live Countdown Display */}
            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-150 dark:border-slate-800/80 flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 shrink-0">
                <Clock size={16} className="animate-spin" style={{ animationDuration: '6s' }} />
                <span className="text-[9px] font-black uppercase tracking-wider">Sisa Waktu:</span>
              </div>
              <div className="flex gap-2">
                <div className="text-center min-w-8">
                  <span className="text-xs font-black text-slate-800 dark:text-white block leading-none">{timeLeft.days}</span>
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1 block">Hari</span>
                </div>
                <span className="text-xs font-bold text-slate-300 dark:text-slate-700">:</span>
                <div className="text-center min-w-8">
                  <span className="text-xs font-black text-slate-800 dark:text-white block leading-none">{timeLeft.hours}</span>
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1 block">Jam</span>
                </div>
                <span className="text-xs font-bold text-slate-300 dark:text-slate-700">:</span>
                <div className="text-center min-w-8">
                  <span className="text-xs font-black text-slate-800 dark:text-white block leading-none">{timeLeft.minutes}</span>
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1 block">Menit</span>
                </div>
                <span className="text-xs font-bold text-slate-300 dark:text-slate-700">:</span>
                <div className="text-center min-w-8">
                  <span className="text-xs font-black text-rose-500 block leading-none">{timeLeft.seconds}</span>
                  <span className="text-[8px] text-slate-400 font-extrabold uppercase mt-1 block">Detik</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Lencana Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VERIFICATION_BADGES.map((badge) => {
            const isCurrentlyEquipped = userData?.verificationBadge === badge.id;
            const hasPurchased = userData?.activeBadges?.includes(badge.id);

            return (
              <motion.div 
                key={badge.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative bg-white dark:bg-slate-900 rounded-[2rem] p-5 border transition-all flex flex-col justify-between shadow-sm hover:shadow-md ${badge.border}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${badge.bg} rounded-xl flex items-center justify-center ${badge.colorClass} shrink-0`}>
                        <BadgeCheck size={20} className="fill-current/10" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase leading-none">{badge.name}</h4>
                        <span className="text-[8px] text-slate-400 font-bold uppercase block mt-1">Langganan Bulanan</span>
                      </div>
                    </div>
                    {hasPurchased && (
                      <span className="text-[8px] font-black bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0">
                        Dibeli
                      </span>
                    )}
                  </div>

                  {/* Live Avatar Preview */}
                  <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 my-1 shadow-inner">
                    <div className="flex items-center gap-2">
                      <div className="relative shrink-0 flex items-center justify-center py-2 px-1">
                        <UserAvatar 
                          photoURL={userData?.avatarUrl || userData?.photoURL || user?.photoURL} 
                          displayName={userData?.displayName || "Santri"}
                          points={userData?.points || 0}
                          size="sm"
                          avatarFrame="none"
                          verificationBadge={badge.id}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[7px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Profildemo</p>
                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 mt-1 block truncate max-w-[80px]">
                          {userData?.displayName || "Santri Modern"}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide shrink-0 ${
                      badge.id === 'badge_purple' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-350' :
                      badge.id === 'badge_blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-350' :
                      badge.id === 'badge_red' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-350' :
                      badge.id === 'badge_green' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-350' :
                      badge.id === 'badge_gold' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-350' :
                      'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-350'
                    }`}>
                      Badge
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    {badge.desc}
                  </p>

                  {/* Keuntungan Spesifik Warna */}
                  {badge.perks && badge.perks.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1.5 text-left">
                      <span className="text-[8px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                        Keuntungan Khusus:
                      </span>
                      <ul className="space-y-1 text-[9px] text-slate-600 dark:text-slate-300 font-medium">
                        {badge.perks.map((perk: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-tight">
                            <span className="text-emerald-500 font-black shrink-0">✓</span>
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800/80 mt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[8px]">Google Play:</span>
                      <span className="text-purple-600 dark:text-purple-400 font-black">
                        Rp {badge.price.toLocaleString('id-ID')}<span className="text-[9px] text-slate-400 font-medium">/bln</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[8px]">Tukar Wasilah:</span>
                      <span className="text-cyan-500 dark:text-cyan-400 font-black flex items-center gap-1">
                        <Gem size={10} className="text-cyan-400 animate-pulse shrink-0 fill-cyan-400/10" />
                        {badge.wasilahPrice} Wasilah<span className="text-[9px] text-slate-400 font-medium">/bln</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (hasPurchased) {
                        if (!isCurrentlyEquipped) {
                          handleEquipBadge(badge.id);
                        }
                      } else {
                        setSelectedBadge(badge);
                      }
                    }}
                    className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                      isCurrentlyEquipped 
                        ? 'bg-purple-500 text-white font-black cursor-default'
                        : hasPurchased
                        ? 'bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 font-extrabold hover:bg-slate-200 active:scale-95'
                        : 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 hover:brightness-105 text-white shadow-sm active:scale-95'
                    }`}
                  >
                    {isCurrentlyEquipped ? 'Terpasang ✅' : hasPurchased ? 'Pakai Lencana' : 'Dapatkan Lencana'}
                  </button>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareText(`Lencana Verifikasi ${badge.name} - Santri AI`, `Dapatkan ${badge.name} resmi di Santri AI:\nhttps://play.google.com/store/apps/details?id=com.kitabkuningterjemahlengkap`);
                      }}
                      className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs cursor-pointer"
                      title="Bagikan Lencana"
                    >
                      <Share2 size={12} className="text-indigo-600 dark:text-indigo-400" />
                      <span>Bagikan</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsReportOpen(true);
                      }}
                      className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-rose-200/80 dark:border-rose-800/60 shadow-xs cursor-pointer"
                      title="Laporkan Kendala"
                    >
                      <Flag size={12} className="text-rose-600 dark:text-rose-400" />
                      <span>Laporkan</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Keuntungan Menggunakan Lencana */}
        <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm mt-6 text-left">
          <div className="flex items-center gap-2 mb-3">
            <BadgeCheck size={20} className="text-purple-500 shrink-0" />
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">Keuntungan Lencana Verifikasi</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <li className="flex items-start gap-2.5">
              <span className="text-purple-500 text-sm leading-none mt-0.5">✦</span>
              <p><strong>Fitur Permohonan Doa:</strong> Dapat membuat dan membagikan permohonan "Bantu Doa" khusus di ruang komunitas Santri AI.</p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-purple-500 text-sm leading-none mt-0.5">✦</span>
              <p><strong>Ekstra Jatah Cerdas Cermat:</strong> Mendapatkan penambahan kuota harian bermain game edukasi Cerdas Cermat & Kuis Santri.</p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-purple-500 text-sm leading-none mt-0.5">✦</span>
              <p><strong>Identitas & Centang Resmi:</strong> Tanda verifikasi eksklusif di samping nama profil, papan peringkat (Leaderboard), dan diskusi publik.</p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-purple-500 text-sm leading-none mt-0.5">✦</span>
              <p><strong>Prioritas Layanan AI:</strong> Respons AI lebih cepat dan prioritas akses fitur terbaru sebelum dirilis umum.</p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-purple-500 text-sm leading-none mt-0.5">✦</span>
              <p><strong>Dukungan Dakwah Digital:</strong> Ikut berkontribusi langsung dalam pemeliharaan server dan pengembangan aplikasi Santri AI.</p>
            </li>
          </ul>
        </div>
      </div>

      {/* Choose Payment Method Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden z-10 space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase">Aktivasi Lencana</h3>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Pilih Metode Pembayaran</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBadge(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Badge Summary Card */}
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className={`w-12 h-12 ${selectedBadge.bg} rounded-2xl flex items-center justify-center ${selectedBadge.colorClass} shrink-0`}>
                  <BadgeCheck size={24} className="fill-current/10" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase">{selectedBadge.name}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5 font-medium">
                    {selectedBadge.desc}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {/* Option 1: Wasilah (Recommended/New) */}
                <button
                  type="button"
                  onClick={() => handlePurchaseWithWasilah(selectedBadge)}
                  disabled={loading || (userData?.wasilah || 0) < selectedBadge.wasilahPrice}
                  className={`w-full p-4 rounded-2xl border text-left transition-all relative flex items-center justify-between group ${
                    (userData?.wasilah || 0) >= selectedBadge.wasilahPrice
                      ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/10 hover:border-amber-400 dark:hover:border-amber-700 active:scale-[0.98]'
                      : 'border-slate-100 dark:border-slate-800/60 bg-slate-50/20 dark:bg-slate-900/20 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                        <Gem size={12} className="text-cyan-500 animate-pulse fill-cyan-500/15" />
                        Tukar Wasilah
                      </span>
                      <span className="text-[8px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-750 px-1.5 py-0.5 rounded uppercase">Bebas Pajak</span>
                    </div>
                    <p className="text-[11px] text-slate-800 dark:text-slate-200 font-bold">
                      Aktivasi dengan {selectedBadge.wasilahPrice} Wasilah
                    </p>
                    <p className="text-[9px] text-slate-400 font-semibold">
                      Saldo Anda: {(userData?.wasilah || 0).toLocaleString()} Wasilah
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-amber-500/60 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>

                {/* Option 2: Google Play Billing */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBadge(null);
                    handleOpenPlayBilling(selectedBadge.id, selectedBadge.name, selectedBadge.price);
                  }}
                  disabled={loading}
                  className="w-full p-4 rounded-2xl border border-purple-100 dark:border-purple-950/60 bg-purple-50/20 dark:bg-purple-950/10 hover:border-purple-300 dark:hover:border-purple-800 text-left transition-all relative flex items-center justify-between group active:scale-[0.98]"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <ShoppingBag size={12} className="text-purple-500" />
                      Google Play Store
                    </span>
                    <p className="text-[11px] text-slate-800 dark:text-slate-200 font-bold">
                      Langganan Rp {selectedBadge.price.toLocaleString('id-ID')}/bulan
                    </p>
                    <p className="text-[9px] text-slate-400 font-semibold">
                      Metode pembayaran instan, pulsa, kartu kredit, GOPAY dll.
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-purple-500/60 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              </div>

              {/* Not Enough Warning */}
              {(userData?.wasilah || 0) < selectedBadge.wasilahPrice && (
                <p className="text-[9px] text-amber-600 dark:text-amber-450 font-bold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 leading-relaxed text-center">
                  ⚠️ Saldo Wasilah Anda belum cukup untuk melakukan penukaran lencana ini. Anda dapat menggunakan Google Play Store atau melakukan pengisian ulang Wasilah di halaman utama Toko Wasilah.
                </p>
              )}

              {/* Close Info */}
              <div className="text-center">
                <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest block">
                  SANTRI AI • TRANSPARAN & SYARIAH
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Background decor */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] dark:opacity-20"></div>
        <div className="absolute bottom-1/4 -left-20 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] dark:opacity-20"></div>
      </div>

      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName="Lencana Verifikasi"
        contentSnippet="Laporan Toko Lencana Verifikasi"
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};

export default BadgeShopScreen;
