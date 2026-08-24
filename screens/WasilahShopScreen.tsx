import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Gem,
  Share2,
  Star,
  Flag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  topUpWasilahViaGooglePlay
} from '../services/firebase';
import { shareText, openRatingApp } from '../utils/linkUtils';
import ContentReportModal from '../components/ContentReportModal';

const WASILAH_PACKAGES = [
  { id: 'ibtidaiyah', label: 'Top-Up Koin Wasilah Ibtidaiyah', amount: 100, price: 10000, desc: 'Starter pack top-up berisi koin kebaikan sebanyak 100 Wasilah.' },
  { id: 'tsanawiyah', label: 'Top-Up Koin Wasilah Tsanawiyah', amount: 500, price: 45000, desc: 'Paket hemat koin kebaikan sebanyak 500 Wasilah (Diskon 10%).', popular: true },
  { id: 'aliyah', label: 'Top-Up Koin Wasilah Aliyah', amount: 1000, price: 80000, desc: 'Paket super hemat berisi koin kebaikan sebanyak 1.000 Wasilah (Diskon 20%).' },
  { id: 'istiqomah', label: 'Top-Up Koin Wasilah Istiqomah', amount: 2000, price: 150000, desc: 'Paket Kasta Agung berisi koin kebaikan sebanyak 2.000 Wasilah (Diskon 25%).' }
];

const WasilahShopScreen: React.FC = () => {
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
        const wasilah = WASILAH_PACKAGES.find(w => w.id === productId);
        if (wasilah) {
          await topUpWasilahViaGooglePlay(user.uid, wasilah.id, wasilah.amount, wasilah.price, wasilah.label);
          showToast(`Alhamdulillah! Pengisian koin berhasil via Google Play. ${wasilah.amount.toLocaleString()} Wasilah telah masuk ke saldo Anda.`, "success");
        } else {
          await topUpWasilahViaGooglePlay(user.uid, productId, 100, 10000, "Ibtidaiyah");
          showToast(`Alhamdulillah! Pengisian koin berhasil via Google Play.`, "success");
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

  const handleOpenPlayBilling = (id: string, name: string, price: number, amount: number) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30 pb-24 font-sans selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-300">
      
      {/* Navigation Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/40 text-white backdrop-blur-xl border-b border-emerald-500/20 dark:border-slate-800/80 px-4 py-3 sticky top-0 z-40 shadow-md flex items-center justify-between transition-all">
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
              Toko Wasilah <Gem size={14} className="text-cyan-400 animate-pulse fill-cyan-400/20" />
            </h1>
            <p className="text-[8px] font-bold text-emerald-100/80 dark:text-slate-500 uppercase tracking-wider">Top-up Saldo Koin Wasilah</p>
          </div>
        </div>

        {/* Wasilah Balance Display */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-white/15 dark:bg-emerald-500/20 border border-white/20 dark:border-emerald-500/30 rounded-full shadow-inner ml-1">
            <Gem size={12} className="text-cyan-400 fill-cyan-400/20" />
            <span className="text-[10px] font-black text-white dark:text-emerald-400">
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
          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 md:p-8 text-white border-0 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl transform translate-x-20 -translate-y-12"></div>
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
              <Gem size={12} className="text-cyan-300 animate-pulse fill-cyan-300/20" /> Wasilah Kebaikan
            </div>
            <h2 className="text-2xl font-black tracking-tight leading-tight uppercase text-shadow">Pengisian Ulang Wasilah (Koin)</h2>
            <p className="text-xs text-emerald-50 max-w-md leading-relaxed font-medium">
              Wasilah melambangkan koin kebaikan terintegrasi di platform. Gunakan Wasilah untuk membeli fitur khusus, kitab premium, atau bertukar hadiah di Cerdas Cermat.
            </p>
          </div>
        </motion.div>

        {/* Wasilah Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {WASILAH_PACKAGES.map((pkg) => (
            <motion.div 
              key={pkg.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4 hover:border-amber-500/30 transition-all group relative overflow-hidden"
            >
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-black px-2 py-0.5 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg uppercase tracking-wide">
                    {pkg.label}
                  </span>
                  {pkg.popular && (
                    <span className="text-[8px] font-black px-2 py-0.5 bg-amber-500 text-white rounded-full uppercase tracking-wider">
                      Pilihan Terbaik
                    </span>
                  )}
                </div>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">{pkg.amount.toLocaleString('id-ID')}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase">Wasilah</span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  {pkg.desc}
                </p>

                <div className="space-y-0.5 text-left pt-1">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none font-semibold">
                    Nilai Konversi: Rp {(pkg.amount * 100).toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs font-black text-amber-600 dark:text-amber-400 mt-1">
                    Google Play: Rp {pkg.price.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenPlayBilling(pkg.id, pkg.label, pkg.price, pkg.amount)}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:brightness-110 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-md shadow-cyan-500/10 cursor-pointer"
                >
                  <Gem size={14} className="shrink-0 animate-pulse text-cyan-200 fill-cyan-200/25" />
                  <span>Beli via Google Play</span>
                </button>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      shareText(`Paket Wasilah ${pkg.label} - Santri AI`, `Top-up Koin Wasilah ${pkg.label} (${pkg.amount.toLocaleString('id-ID')} Wasilah) di Santri AI:\nhttps://play.google.com/store/apps/details?id=com.kitabkuningterjemahlengkap`);
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
          ))}
        </div>
      </div>

      {/* Background decor */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] dark:opacity-20"></div>
        <div className="absolute bottom-1/4 -left-20 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px] dark:opacity-20"></div>
      </div>

      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName="Pengisian Wasilah"
        contentSnippet="Laporan Pengisian Koin Wasilah"
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};

export default WasilahShopScreen;
