import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Crown, 
  Check, 
  Zap, 
  ShieldCheck, 
  Star, 
  ChevronRight, 
  Coins, 
  Sparkles, 
  Loader2, 
  Info,
  Gem,
  Award,
  Share2,
  Flag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserAvatar } from '../components/UserAvatar';
import { 
  purchasePremiumPackageViaGooglePlay
} from '../services/firebase';
import { shareText, openRatingApp } from '../utils/linkUtils';
import ContentReportModal from '../components/ContentReportModal';

const PREMIUM_TIERS = [
  { 
    id: 'premium_pemula', 
    name: 'Pemula', 
    price: 50000, 
    duration: 'Sekali Beli / Selamanya', 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: Zap,
    desc: 'Bingkai premium Pemula bersemangat pembuka jalan kebaikan.',
    wasilahReward: 500,
    xpReward: 250
  },
  { 
    id: 'premium_ai', 
    name: 'AI Scientist', 
    price: 100000, 
    duration: 'Sekali Beli / Selamanya', 
    color: 'text-blue-500', 
    bg: 'bg-blue-50 dark:bg-blue-900/20', 
    border: 'border-blue-200 dark:border-blue-800',
    icon: Sparkles,
    desc: 'Bingkai AI Scientist bernuansa sirkuit neon masa depan teknologi.',
    wasilahReward: 1000,
    xpReward: 500
  },
  { 
    id: 'premium_gold', 
    name: 'Hafiz Wings', 
    price: 200000, 
    duration: 'Sekali Beli / Selamanya', 
    color: 'text-amber-500', 
    bg: 'bg-amber-50 dark:bg-amber-900/15', 
    border: 'border-amber-200 dark:border-amber-800',
    icon: Gem,
    desc: 'Bingkai Sayap Keemasan sayap kemuliaan para penjaga Al-Quran.',
    wasilahReward: 2000,
    xpReward: 1000
  },
  { 
    id: 'premium_moon', 
    name: 'Lentera Bulan', 
    price: 300000, 
    duration: 'Sekali Beli / Selamanya', 
    color: 'text-indigo-500', 
    bg: 'bg-indigo-50 dark:bg-indigo-900/20', 
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: Star,
    desc: 'Definisi bingkai rembulan bersinar temaram menenangkan relung hati.',
    wasilahReward: 3000,
    xpReward: 1500
  },
  { 
    id: 'premium_crescent', 
    name: 'Sinar Bulan Sabit', 
    price: 400000, 
    duration: 'Sekali Beli / Selamanya', 
    color: 'text-orange-500', 
    bg: 'bg-orange-50 dark:bg-orange-900/20', 
    border: 'border-orange-200 dark:border-orange-850',
    icon: Zap,
    desc: 'Bingkai hilal emas gemerlap perayaan idul fitri mulia nan berkah.',
    wasilahReward: 4000,
    xpReward: 2000
  },
  { 
    id: 'premium_star', 
    name: 'Mahkota Bintang', 
    price: 500000, 
    duration: 'Sekali Beli / Selamanya', 
    color: 'text-pink-500', 
    bg: 'bg-pink-50 dark:bg-pink-905/20', 
    border: 'border-pink-200 dark:border-pink-850',
    icon: Award,
    desc: 'Buka bingkai istimewa dengan serakan kristal bintang berkelip.',
    wasilahReward: 5000,
    xpReward: 2500
  },
  { 
    id: 'premium_moonstar', 
    name: 'Rembulan Bintang', 
    price: 600000, 
    duration: 'Sekali Beli / Selamanya', 
    color: 'text-cyan-500', 
    bg: 'bg-cyan-50 dark:bg-cyan-900/20', 
    border: 'border-cyan-200 dark:border-cyan-850',
    icon: Sparkles,
    desc: 'Simbol kedaulatan kedamaian agama berhiaskan rembulan bintang.',
    wasilahReward: 6000,
    xpReward: 3000
  },
  { 
    id: 'premium_shield', 
    name: 'Perisai Santri', 
    price: 700000, 
    duration: 'Sekali Beli / Selamanya', 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
    border: 'border-emerald-250 dark:border-emerald-850',
    icon: ShieldCheck,
    desc: 'Bingkai ketahanan laskar santri membela marwah persaudaraan tanah air.',
    wasilahReward: 7000,
    xpReward: 3500
  },
  { 
    id: 'premium_book', 
    name: 'Makrifah Kitab', 
    price: 800000, 
    duration: 'Sekali Beli / Selamanya', 
    color: 'text-teal-500', 
    bg: 'bg-teal-50 dark:bg-teal-900/20', 
    border: 'border-teal-200 dark:border-teal-850',
    icon: Info,
    desc: 'Bingkai kitab kuning terbuka mengalirkan mata air ilmu tanpa henti.',
    wasilahReward: 8000,
    xpReward: 4000
  },
  { 
    id: 'premium_toga', 
    name: 'Toga Wisuda', 
    price: 900000, 
    duration: 'Sekali Beli / Selamanya', 
    color: 'text-rose-500', 
    bg: 'bg-rose-50 dark:bg-rose-950/20', 
    border: 'border-rose-200 dark:border-rose-800',
    icon: Award,
    desc: 'Bingkai toga wisudawan lambang kelulusan ilmu syar\'i.',
    wasilahReward: 9000,
    xpReward: 4500
  },
  { 
    id: 'premium_royal', 
    name: 'Royal Premium', 
    price: 1000000, 
    duration: 'Sekali Beli / Selamanya', 
    color: 'text-purple-500', 
    bg: 'bg-purple-50 dark:bg-purple-950/20', 
    border: 'border-purple-200 dark:border-purple-800',
    icon: Crown,
    desc: 'Buka bingkai Mahkota Raja Premium Royal & semua AI fitur Pro.',
    wasilahReward: 10000,
    xpReward: 5000
  },
  { 
    id: 'premium_sultan_pro', 
    name: 'Sultan Pro', 
    price: 2000000, 
    duration: 'Sekali Beli / Selamanya', 
    color: 'text-yellow-600 dark:text-yellow-400', 
    bg: 'bg-yellow-50 dark:bg-yellow-950/20', 
    border: 'border-yellow-300 dark:border-yellow-700',
    icon: Crown,
    popular: true,
    desc: 'Kasta tertinggi! Bingkai paling mewah dan megah bergelimang kepuasan.',
    wasilahReward: 20000,
    xpReward: 10000
  }
];

const PremiumFrameShopScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Listening to real native/webview Google Play Billing callbacks
  useEffect(() => {
    window.onPurchaseSuccess = async (productId: string) => {
      if (!user) return;
      setLoading(true);
      try {
        const plan = PREMIUM_TIERS.find(p => p.id === productId);
        if (plan) {
          await purchasePremiumPackageViaGooglePlay(user.uid, plan.id, plan.name, plan.price, plan.wasilahReward, plan.xpReward);
          showToast(`Alhamdulillah! Pembayaran sukses via Google Play. Bingkai '${plan.name}' & status Santri Pro telah aktif seumur hidup beserta bonus Wasilah + XP.`, "success");
        } else {
          await purchasePremiumPackageViaGooglePlay(user.uid, productId, "AI Premium Frame", 100000, 0, 0);
          showToast(`Alhamdulillah! Pembayaran sukses via Google Play.`, "success");
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

  const handleOpenPlayBilling = (id: string, name: string, price: number, wasilahReward: number, xpReward: number) => {
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

  const isPremium = userData?.isPremium;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/20 pb-24 font-sans selection:bg-amber-100 selection:text-amber-900 transition-colors duration-300">
      
      {/* Navigation Header */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-teal-800 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/40 text-white backdrop-blur-xl border-b border-emerald-500/20 dark:border-slate-800/80 px-4 py-3 sticky top-0 z-40 shadow-md flex items-center justify-between transition-all">
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
              Bingkai Premium <Crown size={14} className="text-amber-300 animate-pulse fill-amber-300/20" />
            </h1>
            <p className="text-[8px] font-bold text-amber-100/80 dark:text-slate-500 uppercase tracking-wider">Bingkai Eksklusif Selamanya</p>
          </div>
        </div>

        {/* Wasilah Balance Display */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-white/15 dark:bg-amber-500/20 border border-white/20 dark:border-amber-500/30 rounded-full shadow-inner ml-1">
            <Gem size={12} className="text-cyan-400 fill-cyan-400/20 animate-pulse" />
            <span className="text-[10px] font-black text-white dark:text-amber-400">
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
          className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 rounded-3xl p-6 md:p-8 text-white border-0 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-12"></div>
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
              <Sparkles size={12} className="text-white animate-spin" /> Sekali Beli Selamanya
            </div>
            <h2 className="text-2xl font-black tracking-tight leading-tight uppercase text-shadow">Miliki Koleksi Bingkai Terbaik & Fitur Pro</h2>
            <p className="text-xs text-amber-50 max-w-md leading-relaxed font-medium">
              Dapatkan akses eksklusif ke seluruh custom avatar frames legendaris (seperti Royal Premium, AI Scientist, Sultan Pro) dan buka akses server AI prioritas berdedikasi tinggi secara permanen.
            </p>
          </div>
        </motion.div>

        {/* Premium Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PREMIUM_TIERS.map((plan) => {
            const Icon = plan.icon;
            const isUserPlan = userData?.premiumPackageId === plan.id;
            
            return (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 border transition-all flex flex-col justify-between shadow-sm hover:shadow-md ${
                  plan.popular 
                    ? 'border-yellow-400 dark:border-yellow-600' 
                    : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-yellow-500 text-white rounded-full text-[8px] font-black uppercase tracking-wider shadow-md">
                    Rekomendasi Utama
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 ${plan.bg} rounded-2xl flex items-center justify-center ${plan.color} shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight uppercase">{plan.name}</h3>
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mt-0.5">{plan.duration}</span>
                    </div>
                  </div>

                  {/* Live Avatar Preview */}
                  <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 my-2 shadow-inner">
                    <div className="flex items-center gap-2.5">
                      <div className="relative shrink-0 flex items-center justify-center py-2 px-1">
                        <UserAvatar 
                          photoURL={userData?.avatarUrl || userData?.photoURL || user?.photoURL} 
                          displayName={userData?.displayName || "Santri"}
                          points={userData?.points || 0}
                          size="sm"
                          avatarFrame={plan.id}
                          verificationBadge="none"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block leading-none">Contoh Bingkai</span>
                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 mt-1 block truncate max-w-[105px]">
                          {userData?.displayName || "Santri Modern"}
                        </span>
                      </div>
                    </div>
                    <span className="text-[8px] font-black bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-widest shrink-0">
                      Frame
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    {plan.desc}
                  </p>

                  {/* Bonus Rewards */}
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-xl text-[9px] font-black text-cyan-600 dark:text-cyan-400">
                      <Gem size={11} className="shrink-0 text-cyan-500 fill-cyan-500/25" />
                      <span>+{plan.wasilahReward?.toLocaleString('id-ID')} Wasilah</span>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl text-[9px] font-black text-purple-600 dark:text-purple-400 font-mono">
                      <Sparkles size={11} className="shrink-0 animate-pulse text-purple-500" />
                      <span>+{plan.xpReward?.toLocaleString('id-ID')} XP</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block -mb-0.5">Harga Sekali Beli</span>
                    <span className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                      Rp {plan.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 dark:border-slate-800 mt-5 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isUserPlan) {
                        handleOpenPlayBilling(plan.id, plan.name, plan.price, plan.wasilahReward, plan.xpReward);
                      }
                    }}
                    className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                      isUserPlan 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black cursor-default'
                        : isPremium
                        ? 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-600 dark:text-slate-400 hover:shadow-md active:scale-95'
                        : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-white shadow-md active:scale-95'
                    }`}
                  >
                    {isUserPlan ? 'Paket Aktif ✅' : 'Beli via Google Play'}
                  </button>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareText(`Paket Bingkai ${plan.name} - Santri AI`, `Dapatkan Paket Bingkai ${plan.name} (Bonus ${plan.wasilahReward} Wasilah & ${plan.xpReward} XP) di Santri AI:\nhttps://play.google.com/store/apps/details?id=com.kitabkuningterjemahlengkap`);
                      }}
                      className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs cursor-pointer"
                      title="Bagikan Paket"
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
      </div>

      {/* Background decor */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] dark:opacity-20"></div>
        <div className="absolute bottom-1/4 -left-20 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px] dark:opacity-20"></div>
      </div>

      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName="Paket Bingkai Premium"
        contentSnippet="Laporan Pembelian Bingkai Premium"
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};

export default PremiumFrameShopScreen;
