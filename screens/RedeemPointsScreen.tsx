import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Gift, 
  History,
  ShoppingBag, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Sparkles,
  BadgeCheck,
  ChevronRight,
  Gem
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  subscribeToUserData, 
  subscribeToRewards, 
  subscribeToUserRedemptions, 
  requestRedemption, 
  RewardData, 
  RedemptionData 
} from '../services/firebase';
import ConfirmationModal from '../components/ConfirmationModal'; // Import

const RedeemPointsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');
  const [userWasilah, setUserWasilah] = useState(0);
  const [rewards, setRewards] = useState<RewardData[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Load Data
  useEffect(() => {
    if (!user) {
        navigate('/settings'); // Redirect to login if not authenticated
        return;
    }

    // 1. User Data (Wasilah Balance)
    const unsubUser = subscribeToUserData(user.uid, (data) => {
        if (data) setUserWasilah(data.wasilah || 0);
    });

    // 2. Rewards Catalog
    const unsubRewards = subscribeToRewards((data) => {
        setRewards(data);
        setLoading(false);
    });

    // 3. User History
    const unsubHistory = subscribeToUserRedemptions(user.uid, (data) => {
        setRedemptions(data as RedemptionData[]);
    });

    return () => {
        unsubUser();
        unsubRewards();
        unsubHistory();
    };
  }, [user, navigate]);

  const handleRedeem = (reward: RewardData) => {
      if (!user) return;
      if (userWasilah < reward.points) { // reward.points is the cost in wasilah now
          showToast(`Wasilah tidak cukup. Kurang ${reward.points - userWasilah} wasilah.`, "warning");
          return;
      }

      // Open Modal
      setConfirmModal({
        isOpen: true,
        title: "Tukar Wasilah?",
        message: `Apakah Anda yakin ingin menukar ${reward.points.toLocaleString()} wasilah untuk "${reward.name}"?`,
        onConfirm: async () => {
            setRedeemingId(reward.id || null);
            try {
                await requestRedemption(user, reward);
                showToast("Permintaan berhasil dikirim! Tunggu persetujuan admin.", "success");
                setActiveTab('history');
            } catch (e) {
                console.error(e);
                showToast("Gagal memproses penukaran.", "error");
            } finally {
                setRedeemingId(null);
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        }
      });
  };

  const formatDate = (timestamp: any) => {
      if (!timestamp) return '-';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('id-ID', { 
          day: 'numeric', month: 'short', year: 'numeric', 
          hour: '2-digit', minute: '2-digit' 
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-700 px-4 py-4 flex items-center justify-between shadow-lg overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
        {/* Rub el Hizb SVG pattern */}
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 text-white/10 rotate-12 pointer-events-none">
           <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.645 2.09c.2-.12.44-.12.64 0l2.5 1.5c.19.12.33.31.39.53l.8 2.8c.06.22.21.41.42.52l2.6 1.4c.21.11.36.31.42.54l.7 2.8c.06.24 0 .49-.16.68l-1.9 2.1c-.16.18-.24.41-.22.65l.3 2.9c.02.24-.09.48-.3.62l-2.4 1.7c-.2.13-.34.34-.39.57l-.6 2.8c-.05.23-.21.42-.43.52l-2.6 1.2c-.21.1-.46.1-.67 0l-2.6-1.2c-.22-.1-.38-.29-.43-.52l-.6-2.8c-.05-.23-.19-.44-.39-.57l-2.4-1.7c-.21-.14-.32-.38-.3-.62l.3-2.9c.02-.24-.06-.47-.22-.65l-1.9-2.1c-.16-.19-.22-.44-.16-.68l.7-2.8c.06-.23.21-.43.42-.54l2.6-1.4c.21-.11.36-.3.42-.52l.8-2.8c.06-.22.2-.41.39-.53l2.5-1.5z" /></svg>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-white hover:bg-white/20 rounded-full transition-colors active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-black text-white text-lg flex items-center gap-2 uppercase tracking-tight">
            <Gift size={20} className="text-yellow-300 animate-bounce" />
            Tukar Wasilah
          </h2>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
         
         {/* Points Card */}
         <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden ring-4 ring-white/10 group">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700">
               <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.645 2.09c.2-.12.44-.12.64 0l2.5 1.5c.19.12.33.31.39.53l.8 2.8c.06.22.21.41.42.52l2.6 1.4c.21.11.36.31.42.54l.7 2.8c.06.24 0 .49-.16.68l-1.9 2.1c-.16.18-.24.41-.22.65l.3 2.9c.02.24-.09.48-.3.62l-2.4 1.7c-.2.13-.34.34-.39.57l-.6 2.8c-.05.23-.21.42-.43.52l-2.6 1.2c-.21.1-.46.1-.67 0l-2.6-1.2c-.22-.1-.38-.29-.43-.52l-.6-2.8c-.05-.23-.19-.44-.39-.57l-2.4-1.7c-.21-.14-.32-.38-.3-.62l.3-2.9c.02-.24-.06-.47-.22-.65l-1.9-2.1c-.16-.19-.22-.44-.16-.68l.7-2.8c.06-.23.21-.43.42-.54l2.6-1.4c.21-.11.36-.3.42-.52l.8-2.8c.06-.22.2-.41.39-.53l2.5-1.5z" /></svg>
            </div>
            <div className="relative z-10 text-center py-2">
                <p className="text-white/70 text-xs font-black uppercase tracking-[0.3em] mb-3 drop-shadow-sm">Saldo Wasilah</p>
                <div className="flex items-center justify-center gap-3">
                    <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/25 shadow-[0_0_20px_rgba(34,211,238,0.3)] animate-pulse flex items-center justify-center">
                        <Gem size={32} className="text-cyan-300 fill-cyan-300/30 filter drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
                    </div>
                    <div className="flex flex-col items-start leading-none">
                        <h1 className="text-5xl font-black font-mono tracking-tighter drop-shadow-lg">{userWasilah.toLocaleString()}</h1>
                        <span className="text-[10px] font-black text-white/50 uppercase tracing-widest">Digital Points</span>
                    </div>
                </div>
            </div>
         </div>

         {/* Tabs */}
         <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button 
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'catalog' 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
               <Gift size={16} /> Katalog
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'history' 
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
               <History size={16} /> Riwayat
            </button>
         </div>

         {/* Content */}
         {activeTab === 'catalog' ? (
             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 size={32} className="animate-spin mb-2" />
                        <p className="text-sm">Memuat katalog...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {/* Lencana Verifikasi Eksklusif (Bento double-span card) */}
                        <div 
                          onClick={() => navigate('/badge-shop')}
                          className="col-span-2 bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500 rounded-3xl p-5 text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden group cursor-pointer active:scale-[0.98]"
                        >
                          {/* Decorative pattern overlays */}
                          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
                          
                          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/30 shadow-inner relative">
                                <BadgeCheck size={32} className="text-yellow-300 animate-pulse" />
                                <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-lg text-[8px] font-black leading-none">
                                  HOT
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md text-white">
                                    HADIAH DIGITAL EKSKLUSIF
                                  </span>
                                  <Sparkles size={12} className="text-yellow-200 animate-bounce" />
                                </div>
                                <h3 className="font-black text-white text-base leading-tight uppercase">
                                  Lencana Verifikasi (30 Hari)
                                </h3>
                                <p className="text-[11px] text-purple-100 leading-relaxed font-semibold">
                                  Dapatkan lencana verifikasi premium (Ungu, Biru, Merah, Hijau, atau Emas) di profil Anda.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between md:flex-col md:items-end gap-2 pt-3 md:pt-0 border-t border-white/20 md:border-none">
                              <div>
                                <p className="text-[9px] text-purple-200 font-extrabold uppercase">Biaya Penukaran</p>
                                <div className="flex items-center gap-1 text-yellow-300 font-black text-sm">
                                  <Gem size={14} className="fill-current text-cyan-300 animate-pulse" />
                                  <span>100 - 2.000 Wasilah</span>
                                </div>
                              </div>
                              
                              <button 
                                type="button"
                                className="px-4 py-2 bg-white text-purple-700 hover:bg-purple-50 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 shadow-md active:scale-95"
                              >
                                Pilih Warna
                                <ChevronRight size={12} className="stroke-[3]" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {rewards.map(reward => (
                            <div key={reward.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all flex flex-col h-full relative overflow-hidden group">
                                {/* Image / Icon */}
                                <div className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                                    {(reward.icon.startsWith('data:') || reward.icon.startsWith('http')) ? (
                                        <img src={reward.icon} alt={reward.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl">{reward.icon}</span>
                                    )}
                                </div>
                                
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-2 mb-1">{reward.name}</h3>
                                    <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                                        <Gem size={12} className="fill-current" />
                                        {reward.points.toLocaleString()}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleRedeem(reward)}
                                    disabled={redeemingId === reward.id || userWasilah < reward.points}
                                    className={`w-full mt-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                        userWasilah >= reward.points 
                                        ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-200 dark:shadow-none' 
                                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                                    }`}
                                >
                                    {redeemingId === reward.id ? <Loader2 size={12} className="animate-spin" /> : <Gift size={12} />}
                                    {redeemingId === reward.id ? 'Memproses...' : (userWasilah >= reward.points ? 'Tukar Sekarang' : 'Wasilah Kurang')}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
             </div>
         ) : (
             /* History Tab */
             <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                {redemptions.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <History size={48} className="mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-500 text-sm">Belum ada riwayat penukaran.</p>
                    </div>
                ) : (
                    redemptions.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                    item.status === 'Approved' ? 'bg-green-100 text-green-600' :
                                    item.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                                    'bg-yellow-100 text-yellow-600'
                                }`}>
                                    {item.status === 'Approved' ? <CheckCircle size={24} /> :
                                     item.status === 'Rejected' ? <XCircle size={24} /> :
                                     <Clock size={24} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{item.rewardName}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{formatDate(item.createdAt)}</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                        item.status === 'Approved' ? 'bg-green-50 text-green-700' :
                                        item.status === 'Rejected' ? 'bg-red-50 text-red-700' :
                                        'bg-yellow-50 text-yellow-700'
                                    }`}>
                                        {item.status === 'Approved' ? 'Berhasil' : 
                                         item.status === 'Rejected' ? 'Ditolak (Wasilah Kembali)' : 'Menunggu Konfirmasi'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-amber-600 dark:text-amber-400 text-sm">-{item.pointsCost}</p>
                                <p className="text-[10px] text-slate-400">Wasilah</p>
                            </div>
                        </div>
                    ))
                )}
             </div>
         )}

         <ConfirmationModal 
            isOpen={confirmModal.isOpen}
            title={confirmModal.title}
            message={confirmModal.message}
            onConfirm={confirmModal.onConfirm}
            onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
         />

      </div>
    </div>
  );
};

export default RedeemPointsScreen;