import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Crown, 
  Check, 
  Zap, 
  ShieldCheck, 
  Star, 
  CreditCard, 
  History, 
  ChevronRight, 
  Coins, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  Gem,
  Award,
  Lock,
  Smartphone,
  Info,
  Clock,
  ArrowDown,
  ArrowUpRight,
  Wallet,
  QrCode,
  BadgeCheck,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { UserAvatar } from '../components/UserAvatar';
import { 
  subscribeToTransactions, 
  TransactionData,
  purchasePremiumPackageViaGooglePlay,
  subscribeVerificationBadgeViaGooglePlay,
  topUpWasilahViaGooglePlay,
  updateUserData
} from '../services/firebase';

// 1. Wasilah Packages (Top-Up) - Rates requested by the user
const WASILAH_PACKAGES = [
  { id: 'ibtidaiyah', label: 'Top-Up Koin Wasilah Ibtidaiyah', amount: 100, price: 10000, desc: 'Starter pack top-up berisi koin kebaikan sebanyak 100 Wasilah.' },
  { id: 'tsanawiyah', label: 'Top-Up Koin Wasilah Tsanawiyah', amount: 500, price: 45000, desc: 'Paket hemat koin kebaikan sebanyak 500 Wasilah (Diskon 10%).', popular: true },
  { id: 'aliyah', label: 'Top-Up Koin Wasilah Aliyah', amount: 1000, price: 80000, desc: 'Paket super hemat berisi koin kebaikan sebanyak 1.000 Wasilah (Diskon 20%).' },
  { id: 'istiqomah', label: 'Top-Up Koin Wasilah Istiqomah', amount: 2000, price: 150000, desc: 'Paket Kasta Agung berisi koin kebaikan sebanyak 2.000 Wasilah (Diskon 25%).' }
];

// 2. Direct Google Play Billing Premium Tiers - single buy (sekali beli) 
// and named directly to match premium frames in AvatarSelectionScreen
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

// 3. Verification badges - monthly subscriptions paid via Google Play
const VERIFICATION_BADGES = [
  { 
    id: 'badge_purple', 
    name: 'Verifikasi Ungu', 
    price: 10000, 
    color: 'purple', 
    colorClass: 'text-purple-500', 
    bg: 'bg-purple-50 dark:bg-purple-950/30', 
    border: 'border-purple-200 dark:border-purple-900',
    desc: 'Lencanachecklist keaslian berwarna ungu nan agung.' 
  },
  { 
    id: 'badge_blue', 
    name: 'Verifikasi Biru', 
    price: 50000, 
    color: 'blue', 
    colorClass: 'text-blue-500', 
    bg: 'bg-blue-50 dark:bg-blue-950/30', 
    border: 'border-blue-200 dark:border-blue-900',
    desc: 'Lencana resmi selebritis santri & tokoh panutan ekosistem.' 
  },
  { 
    id: 'badge_red', 
    name: 'Verifikasi Merah', 
    price: 100000, 
    color: 'red', 
    colorClass: 'text-red-500', 
    bg: 'bg-red-50 dark:bg-red-950/30', 
    border: 'border-red-200 dark:border-red-900',
    desc: 'Gelar kehormatan tertinggi santri sejati bersertifikat resmi.' 
  }
];

const FAQ_ITEMS = [
  {
    question: "Apa itu Koin Wasilah dan bagaimana cara kerjanya?",
    answer: "Koin Wasilah adalah mata uang kebaikan di ekosistem Santri AI. Digunakan sebagai sarana (wasilah) untuk mengakses fitur premium seperti bertanya ke AI, analisis teks/kitab tingkat lanjut, melakukan ikhtiar digital, serta program doa dan hajat bersama di aplikasi. Setiap kebaikan yang Anda lakukan mendatangkan berkah, dan koin ini mempermudah pembiayaan integrasi sistem cloud kami untuk melayani umat lebih baik."
  },
  {
    question: "Apa perbedaan antara jenis Lencana Verifikasi (Badge)?",
    answer: "Santri AI menyediakan lencana verifikasi checklist untuk membedakan kontribusi pengguna:\n• Lencana Biru (Santri Teladan): Menandakan pengguna yang aktif berkontribusi dalam diskusi Islami, kuis harian, dan kajian kitab.\n• Lencana Emas (Ustadz Verified): Khusus diberikan kepada asatidz, akademisi, atau rujukan ilmu agama yang telah terverifikasi keilmuan dan sanadnya oleh tim Santri AI.\n• Lencana Hijau (Donatur/Muhsinin): Bentuk apresiasi bagi pengguna yang membantu pembiayaan server & operasional dakwah digital Santri AI secara konsisten."
  },
  {
    question: "Apa keuntungan memiliki Lencana Verifikasi di Profil?",
    answer: "Selain memperindah tampilan foto profil, lencana verifikasi meningkatkan rasa percaya (trust) di antara sesama jamaah saat berdiskusi, memberikan prioritas dalam sesi tanya-jawab interaktif dengan AI/Asatidz, serta memberikan booster XP harian lebih besar untuk meningkatkan level kebaikan Anda."
  },
  {
    question: "Apa manfaat dari Bingkai Avatar Premium (Santri Pro)?",
    answer: "Dengan membeli paket Bingkai Avatar Premium (Pemula, Menengah, Utama, atau Khidmat), Anda secara otomatis menjadi anggota Santri Pro seumur hidup. Akun Anda akan dilengkapi bingkai bercahaya emas/emerald di seluruh halaman diskusi, bebas dari batasan pemakaian harian dasar, mendapatkan bonus ribuan koin Wasilah instan, serta booster XP permanen hingga +150%."
  },
  {
    question: "Apakah transaksi ini aman dan sesuai Syariat?",
    answer: "Insya Allah sangat aman. Seluruh transaksi menggunakan gerbang pembayaran resmi Google Play Billing yang terenkripsi aman, transparan, dan tanpa biaya tambahan tersembunyi. Dana yang terkumpul dari pembelian ini dialokasikan untuk pemeliharaan server berkinerja tinggi, pengembangan kecerdasan buatan Islami, serta operasional dakwah digital gratis bagi ribuan santri di pelosok nusantara."
  }
];

const PremiumScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'plan' | 'badge' | 'topup' | 'history' | null>('plan');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToTransactions(user.uid, (data) => {
        setTransactions(data);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Listening to real native/webview Google Play Billing callbacks
  useEffect(() => {
    window.onPurchaseSuccess = async (productId: string) => {
      if (!user) return;
      setLoading(true);
      try {
        // Find which item corresponds to this productId
        if (productId.startsWith('premium_')) {
          const plan = PREMIUM_TIERS.find(p => p.id === productId);
          if (plan) {
            await purchasePremiumPackageViaGooglePlay(user.uid, plan.id, plan.name, plan.price, plan.wasilahReward, plan.xpReward);
            showToast(`Alhamdulillah! Pembayaran sukses via Google Play. Bingkai '${plan.name}' & status Santri Pro telah aktif seumur hidup beserta bonus Wasilah + XP.`, "success");
          } else {
            await purchasePremiumPackageViaGooglePlay(user.uid, productId, "AI Premium Frame", 100000, 0, 0);
            showToast(`Alhamdulillah! Pembayaran sukses via Google Play.`, "success");
          }
        } else if (productId.startsWith('badge_')) {
          const badge = VERIFICATION_BADGES.find(b => b.id === productId);
          if (badge) {
            await subscribeVerificationBadgeViaGooglePlay(user.uid, badge.id, badge.name, badge.price);
            showToast(`Alhamdulillah! Langganan sukses via Google Play. Lencana '${badge.name}' telah disematkan di profil Anda.`, "success");
          } else {
            await subscribeVerificationBadgeViaGooglePlay(user.uid, productId, "Lencana Verifikasi", 50000);
            showToast(`Alhamdulillah! Langganan sukses via Google Play.`, "success");
          }
        } else {
          // If it is regular Wasilah pack
          const wasilah = WASILAH_PACKAGES.find(w => w.id === productId);
          if (wasilah) {
            await topUpWasilahViaGooglePlay(user.uid, wasilah.id, wasilah.amount, wasilah.price, wasilah.label);
            showToast(`Alhamdulillah! Pengisian koin berhasil via Google Play. ${wasilah.amount.toLocaleString()} Wasilah telah masuk ke saldo Anda.`, "success");
          } else {
            await topUpWasilahViaGooglePlay(user.uid, productId, 100, 10000, "Ibtidaiyah");
            showToast(`Alhamdulillah! Pengisian koin berhasil via Google Play.`, "success");
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

  const handleOpenPlayBilling = (type: 'premium' | 'badge' | 'wasilah', id: string, name: string, price: number, extra?: any) => {
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

  const isPremium = userData?.isPremium;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-300">
      
      {/* Dynamic Navigation Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/40 text-white backdrop-blur-xl border-b border-emerald-500/20 dark:border-slate-800/80 px-4 py-3 sticky top-0 z-40 shadow-md flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate(-1)} 
            className="p-1.5 bg-white/10 dark:bg-slate-800 text-white dark:text-slate-400 rounded-xl hover:bg-white/20 dark:hover:bg-slate-705 transition-all active:scale-95 shadow-sm border border-white/10 dark:border-slate-700/50"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-sm font-black text-white leading-none flex items-center gap-1.5 mb-1 text-shadow-sm">
              Toko Premium <Crown size={14} className="text-amber-300 animate-pulse fill-amber-300/20" />
            </h1>
            <p className="text-[8px] font-bold text-emerald-100/80 dark:text-slate-500 uppercase tracking-wider">Akses Billing Terpercaya</p>
          </div>
        </div>

        {/* Wasilah Balance Display */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/15 dark:bg-emerald-500/20 border border-white/20 dark:border-emerald-500/30 rounded-full shadow-inner">
          <Gem size={12} className="text-cyan-400 fill-cyan-400/20 animate-pulse" />
          <span className="text-[10px] font-black text-white dark:text-emerald-400">
            {(userData?.wasilah || 0).toLocaleString()} Wasilah
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Status Premium Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {isPremium ? (
            <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-6 md:p-8 text-white border border-amber-400/30 shadow-[0_10px_30px_rgba(245,158,11,0.2)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-12 -translate-y-12"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <Crown size={12} fill="currentColor" /> Santri Pro Aktif
                  </div>
                  <h2 className="text-2xl font-black tracking-tight uppercase">Akun Premium Aktif</h2>
                  <p className="text-xs text-amber-100 font-medium leading-relaxed">
                    Terima kasih atas kontribusi mulia Anda! Semua custom bingkai avatar premium eksklusif Anda telah diaktifkan untuk selamanya.
                  </p>
                  {userData?.premiumPackageName && (
                    <div className="inline-block mt-1 text-[10px] bg-black/25 px-3 py-1 rounded-lg font-bold">
                      Paket Terpasang: <span className="text-yellow-300 font-black">{userData.premiumPackageName}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="p-4 bg-white/10 rounded-2xl border border-white/25">
                     <ShieldCheck size={36} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 dark:bg-slate-900 rounded-3xl p-6 md:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl transform translate-x-20 -translate-y-12"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <Sparkles size={12} className="text-amber-500 animate-spin" /> Sekali Beli Selamanya
                  </div>
                  <h2 className="text-2xl font-black tracking-tight leading-tight">Miliki Koleksi Bingkai Terbaik & Fitur Pro</h2>
                  <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                    Dapatkan akses eksklusif ke seluruh custom avatar frames legendaris (seperti Royal Premium, AI Scientist, Sultan Pro) dan buka akses server AI prioritas berdedikasi tinggi secara permanen.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/frame-shop')}
                  className="px-6 py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap shrink-0"
                >
                  Pilih Paket
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Separated Clickable Banner Cards Container */}
        <div className="space-y-4">
          
          {/* 3. KARTU WASILAH */}
          <motion.div 
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/wasilah-shop')}
            className="cursor-pointer bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-[2rem] border-0 hover:brightness-105 shadow-md shadow-emerald-500/10 transition-all duration-300 overflow-hidden"
          >
            <div className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 select-none hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-white/20 text-white rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
                  <Gem size={20} className="fill-current text-white/90" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-tight leading-tight">Pengisian Wasilah (Koin)</h3>
                  <p className="text-[10px] text-emerald-50/90 font-bold uppercase tracking-wider mt-0.5">Top-up Saldo Keperluan Doa & Hajat</p>
                </div>
              </div>
              <div className="p-1.5 bg-white/20 text-white rounded-xl">
                <ChevronRight size={14} />
              </div>
            </div>
          </motion.div>

          {/* 1. KARTU PREMIUM (BINGKAI) */}
          <motion.div 
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/frame-shop')}
            className="cursor-pointer bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white rounded-[2rem] border-0 hover:brightness-105 shadow-md shadow-amber-500/10 transition-all duration-300 overflow-hidden"
          >
            <div className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 select-none hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-white/20 text-white rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
                  <Crown size={20} className="fill-white/10" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-tight leading-tight">Paket Bingkai Premium</h3>
                  <p className="text-[10px] text-amber-50/90 font-bold uppercase tracking-wider mt-0.5">Miliki Bingkai Eksklusif Selamanya</p>
                </div>
              </div>
              <div className="p-1.5 bg-white/20 text-white rounded-xl">
                <ChevronRight size={14} />
              </div>
            </div>
          </motion.div>

          {/* 2. KARTU LENCANA */}
          <motion.div 
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => navigate('/badge-shop')}
            className="cursor-pointer bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white rounded-[2rem] border-0 hover:brightness-105 shadow-md shadow-purple-500/10 transition-all duration-300 overflow-hidden"
          >
            <div className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 select-none hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-white/20 text-white rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
                  <BadgeCheck size={20} className="fill-white/10" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-tight leading-tight">Lencana Verifikasi (Badge)</h3>
                  <p className="text-[10px] text-purple-50/90 font-bold uppercase tracking-wider mt-0.5">Lencana checklist warna di samping foto profil</p>
                </div>
              </div>
              <div className="p-1.5 bg-white/20 text-white rounded-xl">
                <ChevronRight size={14} />
              </div>
            </div>
          </motion.div>

          {/* 4. KARTU RIWAYAT */}
          <div className={`bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500 rounded-[2rem] border-0 transition-all duration-300 overflow-hidden ${
            activeTab === 'history' 
              ? 'shadow-lg ring-2 ring-emerald-300/30' 
              : 'hover:brightness-105 shadow-md shadow-emerald-500/10'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'history' ? null : 'history')}
              className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 select-none hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-white/20 text-white rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
                  <History size={20} className={activeTab === 'history' ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-tight leading-none mb-1">Riwayat Transaksi</h3>
                  <p className="text-[10px] text-teal-50/90 font-bold uppercase tracking-wider">Catatan historis pembelian Google Play Billing</p>
                </div>
              </div>
              <div className={`p-1.5 bg-white/20 text-white rounded-xl transition-transform duration-300 ${activeTab === 'history' ? 'rotate-90 text-yellow-300' : ''}`}>
                <ChevronRight size={14} />
              </div>
            </button>

            <AnimatePresence initial={false}>
              {activeTab === 'history' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden border-t border-white/10 bg-white/10"
                >
                  <div className="p-6 space-y-4">
                    {transactions.length === 0 ? (
                      <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl p-12 text-center border border-white/10 shadow-inner">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-emerald-500 dark:text-emerald-400 mb-4 animate-bounce">
                          <History size={28} />
                        </div>
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">Tidak Ada Riwayat</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed font-semibold">
                          Belum ada riwayat transaksi Google Play Billing atau penukaran wasilah di akun Anda saat ini.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl border border-white/10 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                        {transactions.map((tx) => (
                          <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                            <div className="flex gap-4 items-center">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                tx.type === 'topup' 
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300' 
                                  : 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300'
                              }`}>
                                {tx.type === 'topup' ? <ArrowDown size={18} /> : <Crown size={18} />}
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight leading-none mb-1">
                                  {tx.item}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                  {formatDate(tx.createdAt)}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className={`text-sm font-black ${
                                tx.type === 'topup' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                              }`}>
                                {tx.type === 'topup' ? '+' : '-'} {tx.currency === 'IDR' || tx.item?.toLowerCase().includes('google play') ? `Rp ${tx.amount.toLocaleString('id-ID')}` : `${tx.amount} Wasilah`}
                              </p>
                              <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                                Sukses
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* FAQ Section */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/80 p-6 md:p-8 shadow-sm text-left"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Tanya Jawab (FAQ)</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Membangun Transparansi & Kepercayaan Jamaah</p>
            </div>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 pb-4 last:pb-0"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 py-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group select-none"
                  >
                    <span className="text-xs font-black text-slate-750 dark:text-slate-250 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors uppercase tracking-tight leading-normal">
                      {item.question}
                    </span>
                    <span className={`p-1 bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-550 rounded-lg group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/20 group-hover:text-emerald-500 transition-all shrink-0 ${isOpen ? 'rotate-90 text-emerald-500' : ''}`}>
                      <ChevronRight size={14} />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium whitespace-pre-line bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100/50 dark:border-slate-850/50">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center gap-4 justify-between bg-slate-50/40 dark:bg-slate-950/10 p-4 rounded-2xl">
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight leading-none mb-1">100% Aman & Sesuai Syariat</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Otorisasi Resmi Google Play Billing</p>
              </div>
            </div>
            <div className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Terverifikasi Halal Digital
            </div>
          </div>
        </motion.div>

      </div>

      {/* Ambient background decoration */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] dark:opacity-20"></div>
        <div className="absolute bottom-1/4 -left-20 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] dark:opacity-20"></div>
      </div>

    </div>
  );
};

export default PremiumScreen;
