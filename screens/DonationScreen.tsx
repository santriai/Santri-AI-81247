import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { 
  ArrowLeft, 
  Heart,
  Handshake, 
  Check, 
  Gift, 
  Users, 
  Sparkles,
  Share2,
  Star,
  Flag,
  Gem,
  Tv,
  CreditCard,
  TrendingUp,
  MessageCircle,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { 
  isFirebaseReady, 
  addDonationRecord, 
  incrementUserPoints, 
  incrementUserXp,
  updateUserData,
  subscribeToCampaignStats,
  subscribeToDonations,
  likeDonationPrayer,
  DonationRecord
} from '../services/firebase';
import { shareText, openRatingApp } from '../utils/linkUtils';
import ContentReportModal from '../components/ContentReportModal';

// Format relative time helper
const formatRelativeTime = (timestamp: any): string => {
  if (!timestamp) return 'Baru saja';
  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (isNaN(diffInSec) || diffInSec < 60) return 'Baru saja';
    const diffInMin = Math.floor(diffInSec / 60);
    if (diffInMin < 60) return `${diffInMin} mnt lalu`;
    const diffInHours = Math.floor(diffInMin / 60);
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} hari lalu`;
  } catch (e) {
    return 'Baru saja';
  }
};

// Tipe Data Kampanye
interface Campaign {
  id: string;
  title: string;
  category: string;
  description: string;
  targetAmount: number;
  baseAmount: number;
  currentAmount: number;
  baseDonors: number;
  donorsCount: number;
  icon: any;
  color: string;
  badgeColor: string;
  cardBg: string;
}

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'ai_research',
    title: 'Riset & Infrastruktur Server AI Santri',
    category: 'Teknologi & Server',
    description: 'Mendanai biaya komputasi GPU, pemrosesan bahasa alami kitab kuning gundul berharakat, dan pemeliharaan asisten cerdas santri 24 jam gratis.',
    targetAmount: 15000000,
    baseAmount: 10450000,
    currentAmount: 10450000,
    baseDonors: 438,
    donorsCount: 438,
    icon: Sparkles,
    color: 'from-indigo-600 to-purple-700',
    badgeColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    cardBg: 'bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-white dark:from-indigo-950/40 dark:via-purple-950/25 dark:to-slate-900 border-indigo-200/90 dark:border-indigo-800/70'
  },
  {
    id: 'kitab_digital',
    title: 'Digitalisasi 1.000 Kitab Kuning & Terjemah',
    category: 'Literasi Turats',
    description: 'Digitalisasi naskah kitab salaf kuno, penyusunan makna gandul pegon interaktif, dan penambahan audio syarah asatidz nusantara.',
    targetAmount: 10000000,
    baseAmount: 7650000,
    currentAmount: 7650000,
    baseDonors: 320,
    donorsCount: 320,
    icon: Layers,
    color: 'from-emerald-600 to-teal-700',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    cardBg: 'bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-white dark:from-emerald-950/40 dark:via-teal-950/25 dark:to-slate-900 border-emerald-200/90 dark:border-emerald-800/70'
  },
  {
    id: 'server_maintenance',
    title: 'Pemeliharaan Server & Kuota Gratis Umat',
    category: 'Operasional Publik',
    description: 'Menjaga server aplikasi tetap super cepat, stabil, tanpa hambatan akses untuk para santri dan pembelajar di pelosok daerah.',
    targetAmount: 5000000,
    baseAmount: 4350000,
    currentAmount: 4350000,
    baseDonors: 265,
    donorsCount: 265,
    icon: TrendingUp,
    color: 'from-amber-600 to-orange-700',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    cardBg: 'bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-white dark:from-amber-950/40 dark:via-orange-950/25 dark:to-slate-900 border-amber-200/90 dark:border-amber-800/70'
  }
];

const DonationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, userData } = useAuth();

  // State Pilihan Metode Infaq: 'google_play' | 'wasilah'
  const [activeMethod, setActiveMethod] = useState<'google_play' | 'wasilah'>('google_play');

  // Daftar Kampanye Dakwah
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const totalDonors = campaigns.reduce((acc, c) => acc + (c.donorsCount || 0), 0);

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('ai_research');
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

  // Nominal Google Play Billing
  const billingNominals = [
    { 
      id: 'donation_10k', 
      label: 'Infaq Ringan', 
      amount: 'Rp 10.000', 
      value: 10000, 
      xpBonus: 100,
      desc: 'Dukung kebaikan dasar santri',
      bg: 'bg-gradient-to-br from-cyan-500 to-blue-700' 
    },
    { 
      id: 'donation_25k', 
      label: 'Infaq Berkah', 
      amount: 'Rp 25.000', 
      value: 25000, 
      xpBonus: 275,
      desc: 'Keberkahan untuk dakwah santri',
      bg: 'bg-gradient-to-br from-emerald-500 to-teal-700' 
    },
    { 
      id: 'donation_50k', 
      label: 'Infaq Sedang', 
      amount: 'Rp 50.000', 
      value: 50000, 
      xpBonus: 600,
      desc: 'Membantu operasional server utama',
      bg: 'bg-gradient-to-br from-indigo-500 to-purple-700' 
    },
    { 
      id: 'donation_100k', 
      label: 'Infaq Utama', 
      amount: 'Rp 100.000', 
      value: 100000, 
      xpBonus: 1350,
      desc: 'Menunjang riset & teknologi AI Islam',
      bg: 'bg-gradient-to-br from-violet-500 to-fuchsia-700' 
    },
    { 
      id: 'donation_200k', 
      label: 'Infaq Digital', 
      amount: 'Rp 200.000', 
      value: 200000, 
      xpBonus: 3000,
      desc: 'Amal jariyah infrastruktur dakwah',
      bg: 'bg-gradient-to-br from-amber-500 to-orange-600' 
    },
    { 
      id: 'donation_500k', 
      label: 'Infaq Dakwah', 
      amount: 'Rp 500.000', 
      value: 500000, 
      xpBonus: 8500,
      desc: 'Menjadi sponsor dakwah tanpa batas',
      bg: 'bg-gradient-to-br from-rose-500 to-pink-600' 
    },
  ];

  // Helper kalkulasi bonus XP untuk Google Play
  const getGooglePlayXpBonus = (value: number): number => {
    const found = billingNominals.find(n => n.value === value || n.id === `donation_${Math.round(value / 1000)}k`);
    if (found?.xpBonus) return found.xpBonus;
    return Math.max(50, Math.round(value * 0.012));
  };

  // Helper kalkulasi bonus XP untuk Koin Wasilah
  const getWasilahXpBonus = (wasilahAmount: number): number => {
    if (wasilahAmount <= 0) return 0;
    if (wasilahAmount === 100) return 35;
    if (wasilahAmount === 250) return 90;
    if (wasilahAmount === 500) return 200;
    if (wasilahAmount === 1000) return 450;
    if (wasilahAmount === 2500) return 1200;
    if (wasilahAmount === 5000) return 2600;
    return Math.max(10, Math.round(wasilahAmount * 0.45));
  };

  // Opsi Wasilah Coins
  const wasilahOptions = [100, 250, 500, 1000, 2500, 5000];
  const [selectedWasilahAmount, setSelectedWasilahAmount] = useState<number>(250);
  const [customWasilah, setCustomWasilah] = useState<string>('');

  // Form & modal states
  const [showInputModal, setShowInputModal] = useState<boolean>(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(false);
  const [selectedNominalObj, setSelectedNominalObj] = useState<any | null>(null);
  const [donorName, setDonorName] = useState<string>('');
  const [donorMessage, setDonorMessage] = useState<string>('');
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [purchaseSuccessItem, setPurchaseSuccessItem] = useState<any | null>(null);

  // Completed donation summary
  const [completedDonation, setCompletedDonation] = useState<{
    name: string;
    message: string;
    amount: string;
    label: string;
    campaignTitle: string;
  } | null>(null);

  // Real-time Firestore campaign synchronization
  useEffect(() => {
    if (!isFirebaseReady()) return;
    const unsubscribe = subscribeToCampaignStats((statsMap) => {
      setCampaigns(prev => prev.map(camp => {
        const stat = statsMap[camp.id];
        if (stat) {
          return {
            ...camp,
            currentAmount: camp.baseAmount + (stat.currentAmount || 0),
            donorsCount: camp.baseDonors + (stat.donorsCount || 0)
          };
        }
        return camp;
      }));
    });
    return () => unsubscribe();
  }, []);

  // Daftar Doa & Kebaikan Donatur Terbaru
  const [likedPrayers, setLikedPrayers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('santri_liked_prayers');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [recentPrayers, setRecentPrayers] = useState<Array<{
    id: string;
    userId?: string | null;
    name: string;
    userPhoto?: string;
    avatarFrame?: string;
    points?: number;
    verificationBadge?: string;
    amount: string;
    time: string;
    message: string;
    method: string;
    likes: number;
    hasLiked?: boolean;
    campaignTitle?: string;
  }>>([
    {
      id: 'default_1',
      name: 'Hamba Allah',
      amount: 'Rp 50.000',
      time: '10 menit yang lalu',
      message: 'Bismillah, semoga aplikasi Santri AI semakin berkah, luas manfaatnya dan memudahkan para santri dalam belajar agama.',
      method: 'Google Play',
      likes: 12,
      hasLiked: false
    },
    {
      id: 'default_2',
      name: 'Ahmad Fauzi',
      amount: '500 Wasilah',
      time: '35 menit yang lalu',
      message: 'Semoga menjadi amal jariyah untuk tim pengembang dan seluruh santri di Indonesia.',
      method: 'Koin Wasilah',
      likes: 8,
      hasLiked: false
    },
    {
      id: 'default_3',
      name: 'Santri Salaf',
      amount: 'Rp 100.000',
      time: '3 jam yang lalu',
      message: 'Keluarga besar kami sangat terbantu dengan adanya fitur AI Kitab Kuning. Berkah selalu.',
      method: 'Google Play',
      likes: 24,
      hasLiked: false
    }
  ]);

  // Real-time Firestore donations & prayers listener
  useEffect(() => {
    if (!isFirebaseReady()) return;
    const unsubscribe = subscribeToDonations((records) => {
      if (records && records.length > 0) {
        const livePrayers = records.map(r => {
          const prayerId = r.id || Math.random().toString();
          const isCurrentUser = Boolean(user?.uid && r.userId === user.uid);
          return {
            id: prayerId,
            userId: r.userId || null,
            name: r.userName || 'Hamba Allah',
            userPhoto: r.userPhoto || (isCurrentUser ? (userData?.photoURL || user?.photoURL || (userData as any)?.avatarUrl) : undefined),
            avatarFrame: r.avatarFrame || (isCurrentUser ? (userData?.avatarFrame || 'none') : 'none'),
            points: r.points !== undefined ? r.points : (isCurrentUser ? (userData?.points || 0) : 0),
            verificationBadge: r.verificationBadge || (isCurrentUser ? (userData?.verificationBadge || 'none') : 'none'),
            amount: r.amount || (r.value ? `Rp ${r.value.toLocaleString('id-ID')}` : 'Infaq Kebaikan'),
            time: formatRelativeTime(r.createdAt),
            message: r.message?.trim() || 'Semoga Allah senantiasa melimpahkan keberkahan dan membalas dengan pahala berlipat ganda.',
            method: r.paymentMethod || 'Google Play',
            likes: r.likes || 1,
            hasLiked: likedPrayers.includes(prayerId),
            campaignTitle: r.campaignTitle
          };
        });
        setRecentPrayers(livePrayers);
      }
    });
    return () => unsubscribe();
  }, [likedPrayers, user, userData]);

  // Handle klik kartu kampanye dakwah: buka modal detail infaq & pemilihan metode
  const handleOpenCampaignModal = (campId: string) => {
    setSelectedCampaignId(campId);
    
    // Siapkan default nominal sesuai tab aktif
    if (activeMethod === 'google_play') {
      setSelectedNominalObj(billingNominals[0]);
    } else {
      setSelectedNominalObj({
        id: `wasilah_${selectedWasilahAmount}`,
        label: `Infaq ${selectedWasilahAmount.toLocaleString('id-ID')} Wasilah`,
        amount: `${selectedWasilahAmount.toLocaleString('id-ID')} Wasilah`,
        value: selectedWasilahAmount,
        isWasilah: true,
        bg: 'bg-gradient-to-br from-cyan-600 to-teal-700'
      });
    }
    
    setIsAccordionOpen(false);
    setShowInputModal(true);
  };

  // Listener native Google Play Billing
  useEffect(() => {
    (window as any).onPurchaseSuccess = async (productId: string) => {
      setIsPurchasing(false);
      const found = billingNominals.find(n => n.id === productId);
      const xpEarned = found?.xpBonus || getGooglePlayXpBonus(found ? found.value : 50000);
      
      const finalName = (window as any).tempDonorName || userData?.displayName || user?.displayName || 'Hamba Allah';
      const finalMessage = (window as any).tempDonorMessage || '';

      if (user?.uid && isFirebaseReady()) {
        try {
          await incrementUserXp(user.uid, xpEarned);
        } catch (xpErr) {
          console.warn("Gagal menambahkan bonus XP:", xpErr);
        }
      }

      if (isFirebaseReady()) {
        try {
          const userPhoto = userData?.photoURL || user?.photoURL || (userData as any)?.avatarUrl || '';
          const avatarFrame = userData?.avatarFrame || 'none';
          const points = userData?.points || 0;
          const verificationBadge = userData?.verificationBadge || 'none';
          await addDonationRecord(
            user?.uid || null,
            finalName,
            user?.email || 'anonim@santrimodern.com',
            productId,
            found ? `${found.label} (+${xpEarned} XP) (${selectedCampaign.title})` : `Infaq Google Play (+${xpEarned} XP)`,
            found ? found.amount : 'Rp 50.000',
            found ? found.value : 50000,
            'Google Play Billing',
            finalMessage,
            selectedCampaign.id,
            selectedCampaign.title,
            userPhoto,
            avatarFrame,
            points,
            verificationBadge
          );
        } catch (dbErr) {
          console.error("Gagal menyimpan donasi ke dashboard:", dbErr);
        }
      }

      setCompletedDonation({
        name: finalName,
        message: finalMessage,
        amount: `${found ? found.amount : 'Rp 50.000'} (+${xpEarned} XP)`,
        label: found ? found.label : 'Infaq Google Play',
        campaignTitle: selectedCampaign.title
      });

      if (found) {
        setPurchaseSuccessItem({
          ...found,
          amount: `${found.amount} (+${xpEarned} XP)`
        });
        showToast(`Alhamdulillah! Infaq ${found.amount} Berhasil (+${xpEarned} XP)!`, 'success');
      } else {
        setPurchaseSuccessItem({ id: productId, label: 'Infaq Google Play', amount: `Terima kasih (+${xpEarned} XP)` });
        showToast(`Alhamdulillah! Infaq Berhasil (+${xpEarned} XP)!`, 'success');
      }
    };

    (window as any).onPurchaseCancelled = (error: string) => {
      setIsPurchasing(false);
      showToast(error ? `Infaq dibatalkan: ${error}` : 'Infaq dibatalkan', 'warning');
    };

    return () => {
      delete (window as any).onPurchaseSuccess;
      delete (window as any).onPurchaseCancelled;
    };
  }, [user, userData, selectedCampaign.id, selectedCampaign.title]);

  // Handle Google Play Billing Action
  const handleBillingPayment = (productId: string, nameInput?: string, messageInput?: string) => {
    const selected = billingNominals.find(n => n.id === productId);
    if (!selected) return;

    const finalName = nameInput?.trim() || userData?.displayName || user?.displayName || 'Hamba Allah';
    const finalMessage = messageInput?.trim() || '';
    const xpEarned = selected.xpBonus || getGooglePlayXpBonus(selected.value);

    if ((window as any).AndroidNativeInterface?.launchBillingFlow) {
      setIsPurchasing(true);
      try {
        (window as any).tempDonorName = finalName;
        (window as any).tempDonorMessage = finalMessage;
        (window as any).AndroidNativeInterface.launchBillingFlow(selected.id);
      } catch (err) {
        setIsPurchasing(false);
        showToast('Gagal memproses pembayaran via Google Play Store.', 'error');
      }
    } else {
      // Browser preview simulation flow
      setIsPurchasing(true);
      setTimeout(async () => {
        setIsPurchasing(false);
        
        if (user?.uid && isFirebaseReady()) {
          try {
            await incrementUserXp(user.uid, xpEarned);
          } catch (xpErr) {
            console.warn("Gagal menambahkan bonus XP simulasi:", xpErr);
          }
        }

        if (isFirebaseReady()) {
          try {
            const userPhoto = userData?.photoURL || user?.photoURL || (userData as any)?.avatarUrl || '';
            const avatarFrame = userData?.avatarFrame || 'none';
            const points = userData?.points || 0;
            const verificationBadge = userData?.verificationBadge || 'none';
            await addDonationRecord(
              user?.uid || null,
              finalName,
              user?.email || 'anonim@santrimodern.com',
              selected.id,
              `${selected.label} (+${xpEarned} XP) (${selectedCampaign.title})`,
              selected.amount,
              selected.value,
              'Google Play Billing',
              finalMessage,
              selectedCampaign.id,
              selectedCampaign.title,
              userPhoto,
              avatarFrame,
              points,
              verificationBadge
            );
          } catch (dbErr) {
            console.error("Gagal menyimpan simulasi donasi:", dbErr);
          }
        }

        setCompletedDonation({
          name: finalName,
          message: finalMessage,
          amount: `${selected.amount} (+${xpEarned} XP)`,
          label: selected.label,
          campaignTitle: selectedCampaign.title
        });
        setPurchaseSuccessItem({
          ...selected,
          amount: `${selected.amount} (+${xpEarned} XP)`
        });
        showToast(`[Simulasi] Alhamdulillah! Infaq ${selected.amount} via Google Play berhasil (+${xpEarned} XP)!`, 'success');
      }, 1200);
    }
  };

  // Handle Wasilah Coin Donation
  const handleWasilahDonation = async (amount: number, nameInput?: string, messageInput?: string) => {
    if (!user) {
      showToast('Silakan login terlebih dahulu untuk infaq Wasilah.', 'warning');
      return;
    }

    const currentPoints = userData?.points || 0;
    if (currentPoints < amount) {
      showToast(`Koin Wasilah tidak cukup (Saldo: ${currentPoints.toLocaleString('id-ID')} Wasilah).`, 'error');
      return;
    }

    const finalName = nameInput?.trim() || userData?.displayName || user?.displayName || 'Hamba Allah';
    const finalMessage = messageInput?.trim() || '';
    const xpEarned = getWasilahXpBonus(amount);

    setIsPurchasing(true);
    try {
      // Deduct wasilah from user account
      await incrementUserPoints(user.uid, -amount);

      // Add bonus XP to user account
      if (isFirebaseReady()) {
        try {
          await incrementUserXp(user.uid, xpEarned);
        } catch (xpErr) {
          console.warn("Gagal menambahkan bonus XP wasilah:", xpErr);
        }
      }

      // Record in firestore
      if (isFirebaseReady()) {
        const userPhoto = userData?.photoURL || user?.photoURL || (userData as any)?.avatarUrl || '';
        const avatarFrame = userData?.avatarFrame || 'none';
        const points = userData?.points || 0;
        const verificationBadge = userData?.verificationBadge || 'none';
        await addDonationRecord(
          user.uid,
          finalName,
          user.email || 'anonim@santrimodern.com',
          `wasilah_${amount}`,
          `Infaq Koin Wasilah (+${xpEarned} XP) (${selectedCampaign.title})`,
          `${amount.toLocaleString('id-ID')} Wasilah`,
          amount,
          'Koin Wasilah',
          finalMessage,
          selectedCampaign.id,
          selectedCampaign.title,
          userPhoto,
          avatarFrame,
          points,
          verificationBadge
        );
      }

      setCompletedDonation({
        name: finalName,
        message: finalMessage,
        amount: `${amount.toLocaleString('id-ID')} Wasilah (+${xpEarned} XP)`,
        label: 'Infaq Koin Wasilah',
        campaignTitle: selectedCampaign.title
      });

      setPurchaseSuccessItem({
        id: `wasilah_${amount}`,
        label: 'Infaq Koin Wasilah',
        amount: `${amount.toLocaleString('id-ID')} Wasilah (+${xpEarned} XP)`
      });

      showToast(`Alhamdulillah! Infaq ${amount.toLocaleString('id-ID')} Wasilah berhasil (+${xpEarned} XP)!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Gagal memproses infaq Wasilah: ' + err.message, 'error');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Like / Aamiin doa donatur (Hanya 1x per kartu donatur)
  const handleLikePrayer = async (prayerId: string) => {
    if (likedPrayers.includes(prayerId)) {
      showToast('Anda sudah mengaminkan doa ini (hanya 1x per kartu donatur).', 'info');
      return;
    }

    const updatedLiked = [...likedPrayers, prayerId];
    setLikedPrayers(updatedLiked);
    try {
      localStorage.setItem('santri_liked_prayers', JSON.stringify(updatedLiked));
    } catch (e) {
      console.warn('Error saving liked prayer:', e);
    }

    setRecentPrayers(prev => prev.map(p => {
      if (p.id === prayerId) {
        return {
          ...p,
          likes: (p.likes || 1) + 1,
          hasLiked: true
        };
      }
      return p;
    }));

    showToast("Aamiin ya Rabbal 'Alamin. Doa telah diaminkan!", 'success');

    if (isFirebaseReady() && prayerId && !prayerId.startsWith('default_')) {
      await likeDonationPrayer(prayerId, 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-800 dark:text-slate-100">
      {/* Header Ringkas */}
      <div className="bg-santri-green dark:bg-santri-green-dark px-5 py-3.5 rounded-b-2xl shadow-md sticky top-0 z-50">
        <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white active:scale-90 transition-transform cursor-pointer"
              title="Kembali"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-black text-white leading-tight">Infaq Dakwah</h1>
              <p className="text-[9px] uppercase tracking-widest font-bold text-green-100">Dukung Ekosistem Dakwah Digital</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/settings')} 
              className="relative active:scale-90 transition-all flex-shrink-0 cursor-pointer"
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
        </div>
      </div>

      <div className="px-4 sm:px-5 mt-4 max-w-2xl mx-auto space-y-5">
        {/* Banner Utama: Bantu Kami Terus Berkembang */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-600 via-emerald-800 to-teal-950 p-6 rounded-[2rem] text-center relative overflow-hidden shadow-lg border border-emerald-500/30"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md shadow-inner">
            <Handshake size={28} className="text-yellow-300" />
          </div>
          <h2 className="text-xl font-black text-white mb-1.5 tracking-tight">Bantu Kami Terus Berkembang</h2>
          <p className="text-xs text-emerald-100 leading-relaxed font-medium max-w-lg mx-auto">
            Setiap kontribusi Anda menjadi amal jariyah untuk biaya komputasi AI, pemeliharaan server, dan penyediaan ilmu agama gratis bagi seluruh santri & umat.
          </p>

          {/* Kutipan Hadis & Ayat Al-Qur'an Keutamaan Sedekah */}
          <div className="mt-4 p-3.5 bg-black/25 backdrop-blur-md rounded-2xl border border-white/15 text-center space-y-2 shadow-inner">
            <p className="font-arabic text-lg text-amber-200 leading-relaxed" dir="rtl">
              مَنْ ذَا الَّذِي يُقْرِضُ اللَّهَ قَرْضًا حَسَنًا فَيُضَاعِفَهُ لَهُ أَضْعَافًا كَثِيرَةً
            </p>
            <p className="text-[10px] text-emerald-100 font-medium italic leading-relaxed">
              "Siapakah yang mau memberi pinjaman kepada Allah, pinjaman yang baik (menafkahkan hartanya di jalan Allah), maka Allah akan melipat gandakan pembayaran kepadanya dengan lipat ganda yang banyak." (QS. Al-Baqarah: 245)
            </p>
            <div className="pt-1.5 border-t border-white/10 flex items-center justify-center gap-1.5 text-[9.5px] text-amber-100 font-semibold">
              <Sparkles size={11} className="text-yellow-300 shrink-0" />
              <span>"Sedekah tidaklah mengurangi harta, melainkan melipatgandakan keberkahan." (HR. Muslim)</span>
            </div>
          </div>

          {/* Action Buttons: Bagikan, Rating, Laporkan */}
          <div className="mt-4 pt-3.5 border-t border-white/10 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => shareText('Infaq Dakwah Santri AI', 'Mari dukung riset AI Islam & digitalisasi kitab kuning di Santri AI!\nhttps://play.google.com/store/apps/details?id=com.kitabkuningterjemahlengkap')}
              className="py-2 px-2 bg-indigo-500/25 hover:bg-indigo-500/35 text-indigo-100 border border-indigo-300/30 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer backdrop-blur-sm"
              title="Bagikan Infaq"
            >
              <Share2 size={12} className="text-indigo-200" />
              <span>Bagikan</span>
            </button>
            <button
              type="button"
              onClick={openRatingApp}
              className="py-2 px-2 bg-amber-400/25 hover:bg-amber-400/35 text-amber-100 border border-amber-300/30 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer backdrop-blur-sm"
              title="Beri Rating di Google Play"
            >
              <Star size={12} className="fill-amber-300 text-amber-300" />
              <span>Rating</span>
            </button>
            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="py-2 px-2 bg-rose-500/25 hover:bg-rose-500/35 text-rose-100 border border-rose-400/30 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer backdrop-blur-sm"
              title="Laporkan Kendala"
            >
              <Flag size={12} className="text-rose-300" />
              <span>Laporkan</span>
            </button>
          </div>
        </motion.div>

        {/* 1. SELEKSI KAMPANYE DAKWAH (PROGRES BAR & TARGET DANA) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50/40 dark:bg-emerald-950/20 rounded-[2rem] border border-emerald-200/70 dark:border-emerald-900/50 shadow-sm overflow-hidden"
        >
          {/* Header Kartu dengan Background Gradasi */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 backdrop-blur-md text-white rounded-xl shadow-xs">
                <TrendingUp size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white leading-none">Pilih Kampanye Dakwah</h3>
                <span className="text-[9px] text-emerald-100 font-bold uppercase tracking-wider">Target & Transparansi Kebaikan (Ketuk untuk Infaq)</span>
              </div>
            </div>
            <span className="text-[10px] font-black bg-white/20 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full border border-white/20">
              {campaigns.length} Program
            </span>
          </div>

          {/* List Kartu Kampanye Horizontal/Grid */}
          <div className="p-5 space-y-3 bg-emerald-50/20 dark:bg-emerald-950/10">
            {campaigns.map((camp) => {
              const isSelected = selectedCampaignId === camp.id;
              const percent = Math.min(100, Math.round((camp.currentAmount / camp.targetAmount) * 100));
              const CampIcon = camp.icon;

              return (
                <div
                  key={camp.id}
                  onClick={() => handleOpenCampaignModal(camp.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden active:scale-[0.99] shadow-xs hover:shadow-md ${camp.cardBg} ${
                    isSelected 
                      ? 'ring-2 ring-emerald-500/40 shadow-md' 
                      : 'hover:brightness-[0.98] dark:hover:brightness-110'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${camp.color} text-white shadow-xs shrink-0 mt-0.5`}>
                        <CampIcon size={16} />
                      </div>
                      <div>
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${camp.badgeColor} inline-block mb-1 shadow-xs`}>
                          {camp.category}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                          {camp.title}
                        </h4>
                      </div>
                    </div>
                    <span className="text-[9px] font-black bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-xl shrink-0 shadow-xs transition-colors">
                      Infaq
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium line-clamp-2 mb-3">
                    {camp.description}
                  </p>

                  {/* Progres Bar */}
                  <div className="space-y-1.5 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                    <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-600 dark:text-slate-400">
                        Terkumpul: <strong className="text-emerald-700 dark:text-emerald-300">Rp {camp.currentAmount.toLocaleString('id-ID')}</strong>
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {percent}% dari Rp {camp.targetAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 2. PILIHAN METODE INFAQ (GOOGLE PLAY / KOIN WASILAH / NONTON IKLAN) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-[2rem] border shadow-sm overflow-hidden transition-all duration-300 ${
            activeMethod === 'google_play'
              ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/70 dark:border-blue-900/50'
              : 'bg-cyan-50/40 dark:bg-cyan-950/20 border-cyan-200/70 dark:border-cyan-900/50'
          }`}
        >
          {/* Header Kartu dengan Background Gradasi */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 backdrop-blur-md text-white rounded-xl shadow-xs">
                <Gift size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white leading-none">Pilih Metode Infaq</h3>
                <p className="text-[9px] text-indigo-100 font-bold uppercase tracking-wider mt-0.5">Tujuan: "{selectedCampaign.title}"</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {/* Tab Selector Metode dengan Background Berwarna */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => setActiveMethod('google_play')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeMethod === 'google_play'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                }`}
              >
                <CreditCard size={14} />
                <span>Google Play</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMethod('wasilah')}
                className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeMethod === 'wasilah'
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md'
                    : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                }`}
              >
                <Gem size={14} />
                <span>Koin Wasilah</span>
              </button>
            </div>

            {/* KONTEN TAB 1: GOOGLE PLAY BILLING */}
            {activeMethod === 'google_play' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 dark:text-blue-300 px-1">
                  <span>Pilih Nominal Infaq:</span>
                  <span className="text-[9px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-extrabold">Resmi Google Play</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {billingNominals.map((nom) => (
                    <button
                      key={nom.id}
                      disabled={isPurchasing}
                      onClick={() => {
                        if (isPurchasing) return;
                        setSelectedNominalObj(nom);
                        setIsAccordionOpen(false);
                        setShowInputModal(true);
                      }}
                      className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden flex flex-col justify-between h-28 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-95 cursor-pointer ${nom.bg}`}
                    >
                      <div className="flex justify-between items-start w-full relative z-10">
                        <span className="text-[9px] font-black uppercase tracking-wider text-white bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md">
                          {nom.label}
                        </span>
                        <span className="text-[8.5px] font-black text-amber-200 bg-black/30 px-1.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-0.5">
                          <Sparkles size={9} className="text-yellow-300" />
                          +{nom.xpBonus} XP
                        </span>
                      </div>
                      <div className="relative z-10">
                        <p className="text-base font-black text-white leading-none">{nom.amount}</p>
                        <p className="text-[9px] text-white/80 font-bold leading-tight mt-1 line-clamp-1">{nom.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-center text-slate-400 dark:text-slate-500 font-bold italic pt-1">
                  *Ketuk salah satu nominal untuk menuliskan doa & berinfaq aman via Google Play.
                </p>
              </div>
            )}

            {/* KONTEN TAB 2: KOIN WASILAH */}
            {activeMethod === 'wasilah' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Saldo Wasilah User */}
                <div className="p-3.5 bg-gradient-to-r from-cyan-500/15 via-teal-500/15 to-indigo-500/15 dark:from-cyan-950/50 dark:to-indigo-950/50 rounded-2xl border border-cyan-300/80 dark:border-cyan-700/60 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                      <Gem size={20} className="fill-current/20" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block">Saldo Koin Anda</span>
                      <span className="text-sm font-black text-slate-800 dark:text-white">
                        {(userData?.points || 0).toLocaleString('id-ID')} Wasilah
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/wasilah-shop')}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    Top Up
                  </button>
                </div>

                {/* 1. INPUT CUSTOM WASILAH (DIPINDAHKAN KE ATAS) */}
                <div>
                  <label className="block text-[11px] font-black text-cyan-900 dark:text-cyan-300 uppercase tracking-wider mb-1.5">
                    Masukkan Jumlah Kustom:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={customWasilah}
                      onChange={(e) => {
                        setCustomWasilah(e.target.value);
                        if (e.target.value) {
                          setSelectedWasilahAmount(parseInt(e.target.value) || 0);
                        }
                      }}
                      placeholder="Ketik jumlah koin (Contoh: 1500)"
                      min="10"
                      max={userData?.points || 1000000}
                      className="w-full p-3 pl-9 bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-xs"
                    />
                    <Gem size={14} className="absolute left-3 top-3.5 text-cyan-500" />
                  </div>
                </div>

                {/* 2. PILIHAN NOMINAL CEPAT WASILAH */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Atau Pilih Cepat Nominal Koin Wasilah:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {wasilahOptions.map((amount) => {
                      const isSelected = selectedWasilahAmount === amount && !customWasilah;
                      return (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => {
                            setSelectedWasilahAmount(amount);
                            setCustomWasilah('');
                          }}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-cyan-500 bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 font-black shadow-sm ring-2 ring-cyan-500/20'
                              : 'border-cyan-200/70 dark:border-cyan-900/50 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 font-bold hover:bg-white dark:hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Gem size={12} className="text-cyan-500" />
                            <span className="text-xs">{amount.toLocaleString('id-ID')}</span>
                          </div>
                          <span className="text-[8px] text-amber-500 dark:text-amber-400 block mt-0.5 font-black">
                            +{getWasilahXpBonus(amount)} XP
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isPurchasing || (userData?.points || 0) < selectedWasilahAmount || selectedWasilahAmount <= 0}
                  onClick={() => {
                    setSelectedNominalObj({
                      id: `wasilah_${selectedWasilahAmount}`,
                      label: `Infaq ${selectedWasilahAmount.toLocaleString('id-ID')} Wasilah`,
                      amount: `${selectedWasilahAmount.toLocaleString('id-ID')} Wasilah`,
                      value: selectedWasilahAmount,
                      isWasilah: true,
                      bg: 'bg-gradient-to-br from-cyan-600 to-teal-700'
                    });
                    setIsAccordionOpen(false);
                    setShowInputModal(true);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:brightness-110 disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-cyan-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Gem size={15} />
                  <span>Infaqkan {selectedWasilahAmount.toLocaleString('id-ID')} Wasilah (+{getWasilahXpBonus(selectedWasilahAmount)} XP)</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* 3. FEED DOA & KEBAIKAN DONATUR TERBARU */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          {/* Header Kartu dengan Background Gradasi */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 backdrop-blur-md text-white rounded-xl shadow-xs">
                <MessageCircle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white leading-none">Doa-Doa Donatur</h3>
                <p className="text-[10px] text-amber-100 font-medium tracking-wide mt-1">
                  Untaian Kebaikan, Doa & Ukhuwah Santri
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-100">
              <Sparkles size={16} />
            </div>
          </div>

          {/* Sub Baris: Jumlah Donatur Berpartisipasi & Doa Terbaru dalam 1 Baris */}
          <div className="px-4 sm:px-5 py-2.5 bg-amber-50/80 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/40 flex items-center justify-between gap-2 text-amber-900 dark:text-amber-300">
            <span className="flex items-center gap-1.5 text-[10.5px] font-bold">
              <Users size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span><strong className="font-black text-amber-950 dark:text-amber-200">{totalDonors.toLocaleString('id-ID')}</strong> Donatur Berpartisipasi</span>
            </span>
            <span className="flex items-center gap-1 text-[9.5px] font-black bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2.5 py-0.5 rounded-full shadow-xs">
              <MessageCircle size={10} className="text-amber-700 dark:text-amber-300" />
              <span>{recentPrayers.length} Doa Terbaru</span>
            </span>
          </div>

          <div className="p-5 space-y-3">
            {recentPrayers.map((prayer) => {
              const isCurrentUser = Boolean(user?.uid && prayer.userId === user.uid);
              const currentPhoto = prayer.userPhoto || (isCurrentUser ? (userData?.photoURL || user?.photoURL || (userData as any)?.avatarUrl) : undefined);
              const currentFrame = prayer.avatarFrame || (isCurrentUser ? (userData?.avatarFrame || 'none') : 'none');
              const currentPoints = prayer.points !== undefined ? prayer.points : (isCurrentUser ? (userData?.points || 0) : 0);
              const currentBadge = prayer.verificationBadge || (isCurrentUser ? (userData?.verificationBadge || 'none') : 'none');

              return (
                <div 
                  key={prayer.id}
                  className="p-3.5 bg-slate-50/80 dark:bg-slate-850/60 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-2 text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0">
                        <UserAvatar 
                          photoURL={currentPhoto}
                          displayName={prayer.name}
                          points={currentPoints}
                          size="sm"
                          avatarFrame={currentFrame}
                          verificationBadge={currentBadge}
                        />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 leading-tight truncate">
                          {prayer.name}
                        </h5>
                        <span className="text-[8px] text-slate-400 font-semibold flex items-center gap-1">
                          <Clock size={9} /> {prayer.time} • <span className="text-emerald-600 dark:text-emerald-400 font-bold">{prayer.amount}</span>
                        </span>
                      </div>
                    </div>
                    <span className="text-[8px] font-black bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                      {prayer.method}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium italic leading-relaxed pl-1">
                    "{prayer.message}"
                  </p>

                  <div className="pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[9px] text-slate-400">Semoga diijabah Allah SWT</span>
                    <button
                      type="button"
                      onClick={() => handleLikePrayer(prayer.id)}
                      className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-xl transition-all active:scale-95 cursor-pointer border ${
                        prayer.hasLiked 
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 shadow-xs' 
                          : 'bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border-transparent hover:border-rose-200 dark:hover:border-rose-900'
                      }`}
                      title={prayer.hasLiked ? "Anda sudah mengaminkan doa ini" : "Klik untuk mengaminkan doa (Aamiin)"}
                    >
                      <Heart size={12} className={prayer.hasLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'} />
                      <span>Aamiin ({prayer.likes})</span>
                      {prayer.hasLiked && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block animate-pulse"></span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Input Modal Popup: Form Doa, Nama & Pilihan Kampanye Akordion */}
      {showInputModal && selectedNominalObj && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-6 shadow-2xl relative animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
            
            {/* Header Modal */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-2xl ${selectedNominalObj.bg || 'bg-santri-green'} text-white shadow-md shrink-0`}>
                <Heart size={22} className="fill-white/20" />
              </div>
              <div className="text-left min-w-0">
                <h3 className="text-sm font-black text-slate-800 dark:text-white leading-tight truncate">Detail Infaq Dakwah</h3>
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {selectedNominalObj.label} ({selectedNominalObj.amount})
                </p>
              </div>
            </div>

            {/* PILIHAN KAMPANYE DAKWAH (AKORDION WAJIB PILIH) */}
            <div className="mb-4 text-left">
              <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Pilih Program Kampanye (Wajib):</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">Terpilih</span>
              </label>

              <div className="border border-emerald-500/40 rounded-2xl overflow-hidden bg-emerald-50/30 dark:bg-emerald-950/20">
                {/* Header Akordion (Kampanye Terpilih) */}
                <button
                  type="button"
                  onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                  className="w-full p-3 flex items-center justify-between gap-2.5 text-left cursor-pointer hover:bg-emerald-500/10 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${selectedCampaign.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                      {React.createElement(selectedCampaign.icon, { size: 16 })}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] uppercase font-black tracking-wider text-emerald-700 dark:text-emerald-300 block leading-none mb-0.5">
                        {selectedCampaign.category}
                      </span>
                      <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight truncate">
                        {selectedCampaign.title}
                      </h4>
                    </div>
                  </div>
                  <div className="p-1 rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
                    {isAccordionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {/* Konten Akordion (Daftar Semua Kampanye) */}
                <AnimatePresence>
                  {isAccordionOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800"
                    >
                      {campaigns.map((c) => {
                        const isThisSelected = selectedCampaignId === c.id;
                        const CIcon = c.icon;
                        return (
                          <div
                            key={c.id}
                            onClick={() => {
                              setSelectedCampaignId(c.id);
                              setIsAccordionOpen(false);
                            }}
                            className={`p-3 flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                              isThisSelected 
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-black' 
                                : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c.color} text-white flex items-center justify-center shrink-0`}>
                                <CIcon size={13} />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[8px] uppercase font-bold text-slate-400 block leading-none mb-0.5">
                                  {c.category}
                                </span>
                                <p className="text-[11px] font-bold leading-tight truncate">
                                  {c.title}
                                </p>
                              </div>
                            </div>

                            {isThisSelected ? (
                              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                <Check size={12} className="stroke-[3]" />
                              </span>
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0"></span>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* PILIHAN / GANTI METODE INFAQ DI DALAM POPUP */}
            <div className="mb-3 text-left">
              <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Metode Pembayaran:
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMethod('google_play');
                    setSelectedNominalObj(billingNominals[0]);
                  }}
                  className={`py-1.5 px-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    activeMethod === 'google_play' && !selectedNominalObj.isWasilah
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <CreditCard size={11} />
                  <span>Google Play</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMethod('wasilah');
                    setSelectedNominalObj({
                      id: `wasilah_${selectedWasilahAmount}`,
                      label: `Infaq ${selectedWasilahAmount.toLocaleString('id-ID')} Wasilah`,
                      amount: `${selectedWasilahAmount.toLocaleString('id-ID')} Wasilah`,
                      value: selectedWasilahAmount,
                      isWasilah: true,
                      bg: 'bg-gradient-to-br from-cyan-600 to-teal-700'
                    });
                  }}
                  className={`py-1.5 px-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    selectedNominalObj.isWasilah
                      ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Gem size={11} />
                  <span>Wasilah</span>
                </button>
              </div>
            </div>

            {/* PILIHAN NOMINAL SESUAI METODE PEMBAYARAN */}
            {activeMethod === 'google_play' && (
              <div className="mb-4 text-left space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Pilih Nominal Infaq:
                  </label>
                  <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">
                    Google Play
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {billingNominals.map((nom) => {
                    const isSelected = selectedNominalObj?.id === nom.id;
                    return (
                      <button
                        key={nom.id}
                        type="button"
                        onClick={() => setSelectedNominalObj(nom)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20 font-black'
                            : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-[11px] block leading-tight">{nom.amount}</span>
                        <span className="text-[7.5px] text-amber-600 dark:text-amber-400 font-black block mt-0.5">+{nom.xpBonus} XP</span>
                        {isSelected && (
                          <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <Check size={9} className="stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeMethod === 'wasilah' && (
              <div className="mb-4 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Pilih / Masukkan Koin Wasilah:
                  </label>
                  <span className="text-[9px] text-cyan-700 dark:text-cyan-400 font-bold flex items-center gap-1">
                    <Gem size={10} /> Saldo: {(userData?.points || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Quick select chips */}
                <div className="grid grid-cols-3 gap-1.5">
                  {wasilahOptions.map((amount) => {
                    const isSelected = selectedNominalObj?.isWasilah && selectedNominalObj?.value === amount && !customWasilah;
                    return (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => {
                          setSelectedWasilahAmount(amount);
                          setCustomWasilah('');
                          setSelectedNominalObj({
                            id: `wasilah_${amount}`,
                            label: `Infaq ${amount.toLocaleString('id-ID')} Wasilah`,
                            amount: `${amount.toLocaleString('id-ID')} Wasilah`,
                            value: amount,
                            isWasilah: true,
                            bg: 'bg-gradient-to-br from-cyan-600 to-teal-700'
                          });
                        }}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 ring-2 ring-cyan-500/20 font-black'
                            : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-0.5">
                          <Gem size={10} className="text-cyan-500" />
                          <span className="text-[11px] leading-tight">{amount.toLocaleString('id-ID')}</span>
                        </div>
                        <span className="text-[7.5px] text-amber-600 dark:text-amber-400 font-black block mt-0.5">+{getWasilahXpBonus(amount)} XP</span>
                        {isSelected && (
                          <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-cyan-500 text-white flex items-center justify-center">
                            <Check size={9} className="stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Wasilah input */}
                <div className="relative pt-0.5">
                  <input
                    type="number"
                    value={customWasilah}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomWasilah(val);
                      const num = parseInt(val) || 0;
                      if (num > 0) {
                        setSelectedWasilahAmount(num);
                        setSelectedNominalObj({
                          id: `wasilah_${num}`,
                          label: `Infaq ${num.toLocaleString('id-ID')} Wasilah`,
                          amount: `${num.toLocaleString('id-ID')} Wasilah`,
                          value: num,
                          isWasilah: true,
                          bg: 'bg-gradient-to-br from-cyan-600 to-teal-700'
                        });
                      }
                    }}
                    placeholder="Atau ketik jumlah kustom (contoh: 1500)"
                    min="10"
                    max={userData?.points || 1000000}
                    className="w-full p-2.5 pl-8 bg-slate-50 dark:bg-slate-800/60 border border-cyan-200 dark:border-cyan-800/70 rounded-xl text-xs font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <Gem size={12} className="absolute left-2.5 top-3 text-cyan-500" />
                </div>

                {selectedNominalObj?.isWasilah && (selectedNominalObj?.value || 0) > 0 && (
                  <p className="text-[9px] text-cyan-700 dark:text-cyan-400 font-bold text-left flex items-center gap-1">
                    <Sparkles size={10} className="text-yellow-500" /> Bonus yang didapat: <strong className="text-amber-600 dark:text-amber-400">+{getWasilahXpBonus(selectedNominalObj.value)} XP</strong>
                  </p>
                )}

                {(userData?.points || 0) < (selectedNominalObj?.value || 0) && (
                  <p className="text-[10px] text-rose-500 font-bold text-left">
                    * Saldo koin Wasilah Anda tidak mencukupi untuk nominal ini.
                  </p>
                )}
              </div>
            )}

            {/* FORM NAMA & PESAN DOA */}
            <div className="space-y-3 text-left mb-5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Nama Lengkap (Opsional)
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Hamba Allah / Nama Anda"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-santri-green"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Pesan / Doa Kebaikan (Opsional)
                </label>
                <textarea
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  placeholder="Tuliskan doa atau pesan dukungan Anda untuk dakwah ini..."
                  rows={2}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-santri-green resize-none"
                />
              </div>
            </div>

            {/* Tombol Aksi Konfirmasi */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowInputModal(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-black text-xs active:scale-95 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={
                  isPurchasing ||
                  (selectedNominalObj.isWasilah && ((userData?.points || 0) < (selectedNominalObj.value || 0) || (selectedNominalObj.value || 0) <= 0))
                }
                onClick={() => {
                  setShowInputModal(false);
                  if (selectedNominalObj.isWasilah) {
                    handleWasilahDonation(selectedNominalObj.value, donorName, donorMessage);
                  } else {
                    handleBillingPayment(selectedNominalObj.id, donorName, donorMessage);
                  }
                }}
                className={`flex-1 py-3 text-white rounded-xl font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
                  selectedNominalObj.isWasilah && ((userData?.points || 0) < (selectedNominalObj.value || 0) || (selectedNominalObj.value || 0) <= 0)
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                    : 'bg-santri-green hover:brightness-110 cursor-pointer'
                }`}
              >
                <Check size={14} />
                <span>
                  {selectedNominalObj.isWasilah && ((userData?.points || 0) < (selectedNominalObj.value || 0))
                    ? 'Saldo Koin Kurang'
                    : 'Konfirmasi Infaq'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Success Modal */}
      {purchaseSuccessItem && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative animate-in zoom-in-95 duration-300 text-center border-t-4 border-santri-green">
            
            {/* Header Icon */}
            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-santri-green fill-santri-green/20 animate-pulse" />
            </div>

            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-1">
              Terima Kasih Banyak!
            </h2>
            <p className="text-slate-400 text-[10px] mb-4 uppercase tracking-widest font-bold">
              Infaq Kebaikan Terkonfirmasi
            </p>
            
            {/* Info Nominal & Program */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/50 mb-3">
              <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold mb-0.5">
                {purchaseSuccessItem.label}
              </p>
              <p className="text-xl font-black text-slate-800 dark:text-white">
                {purchaseSuccessItem.amount}
              </p>
              {completedDonation?.campaignTitle && (
                <p className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                  Program: {completedDonation.campaignTitle}
                </p>
              )}
              <p className="text-[9px] text-slate-400 mt-2">
                Semoga Allah SWT membalas dengan pahala yang berlipat ganda, melapangkan rezeki, dan mencatatnya sebagai amal jariyah yang mengalir selamanya. Aamiin.
              </p>
            </div>

            {completedDonation && (
              <div className="mb-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-left">
                <span className="text-[8px] uppercase font-bold text-slate-400 block mb-0.5">Atas Nama:</span>
                <p className="text-xs font-bold text-slate-700 dark:text-white">
                  {completedDonation.name || 'Hamba Allah'}
                </p>
                {completedDonation.message && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-1 font-medium">
                    "{completedDonation.message}"
                  </p>
                )}
              </div>
            )}

            <button 
              type="button"
              onClick={() => setPurchaseSuccessItem(null)}
              className="w-full py-3.5 bg-santri-green text-white rounded-xl font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Alhamdulillah, Selesai
            </button>
          </div>
        </div>
      )}

      {/* Modal Laporan Kendala */}
      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName="Infaq Dakwah"
        contentSnippet="Laporan Kendala Infaq Dakwah"
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};

export default DonationScreen;
