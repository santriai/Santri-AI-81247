import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Search, 
  Loader2, 
  ShieldCheck, 
  Ban, 
  Gift, 
  CheckCircle, 
  ShoppingBag, 
  X, 
  List, 
  Sparkles, 
  RefreshCw,
  Check, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Database,
  Brain,
  LayoutGrid,
  Coins,
  BookOpen,
  User,
  Megaphone,
  Send,
  Image as ImageIcon,
  Quote,
  Eye,
  Wand2,
  Camera,
  Award,
  Palette,
  Newspaper,
  Link,
  Globe,
  AlertCircle,
  MessageSquare,
  Heart,
  Settings,
  Store,
  AlertTriangle,
  Filter,
  Tag,
  Clock,
  Calendar,
  Pencil,
  Flag,
  Maximize2
} from 'lucide-react';
import { PLAYSTORE_LINK } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { generateJson, QUOTE_THEMES, generateNewsAI } from '../services/geminiService'; 
import { 
  subscribeToQuizzes, 
  addQuiz, 
  deleteQuiz,
  updateQuiz, 
  subscribeToRewards, 
  subscribeToRedemptions, 
  addReward, 
  deleteReward,
  approveRedemption, 
  rejectRedemption, 
  subscribeToAllUsers, 
  updateUserStatus, 
  adminUpdateUserData,
  subscribeToReferralRequests,
  approveReferralRequest,
  rejectReferralRequest,
  isFirebaseReady,
  subscribeToBroadcasts,
  sendBroadcast,
  deleteBroadcast,
  subscribeToAllSupportChats,
  subscribeToSupportMessages,
  sendSupportMessage,
  SupportChat,
  SupportChatMessage,
  subscribeToPostReports,
  updatePostReportStatus,
  deleteCommunityPost,
  subscribeToDonations,
  subscribeToUpdateConfig,
  updateUpdateConfig,
  subscribeToNewsCategories,
  updateNewsCategories,
  subscribeToAdPopupConfig,
  updateAdPopupConfig,
  subscribeToAllTransactions,
  TransactionData,
  subscribeToMarketplaceProducts,
  deleteMarketplaceProduct,
  subscribeToMarketplaceReports,
  deleteMarketplaceReport,
  resolveMarketplaceReport,
  subscribeToContentReports,
  updateContentReportStatus,
  deleteContentReport,
  AppContentReport
} from '../services/firebase';
import { 
  fetchFromGitHub,
  saveToGitHub,
  fetchListFromGitHub,
  deleteFromGitHub
} from '../services/githubDataService';
import { UserAvatar } from '../components/UserAvatar';
import ConfirmationModal from '../components/ConfirmationModal';
import CustomLoader from '../components/CustomLoader';
import { MutiaraData } from '../types'; // Import MutiaraData interface

interface UserItem {
  id: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  role?: 'user' | 'admin';
  status?: 'Active' | 'Inactive' | 'Banned';
  createdAt?: any;
  updatedAt?: any;
  points?: number;
  wasilah?: number; 
  correctAnswers?: number;
  referralCode?: string;
  isOnline?: boolean;
  lastActive?: any;
  isVerified?: boolean;
  verificationBadge?: string;
  isPremium?: boolean;
  plan?: string;
}

const QUIZ_TOPICS = [
    { id: 'alquran', label: 'Al-Quran' },
    { id: 'tafsir', label: 'Tafsir Al-Quran' },
    { id: 'hadits', label: 'Hadits' },
    { id: 'akidah', label: 'Akidah (Tauhid)' },
    { id: 'fiqih', label: 'Fiqih' },
    { id: 'ushul_fiqh', label: 'Ushul Fiqih' },
    { id: 'nahwu', label: 'Nahwu & Shorof' },
    { id: 'mantiq', label: 'Mantiq (Logika)' },
    { id: 'tasawuf', label: 'Akhlaq & Tasawuf' },
    { id: 'tarikh', label: 'Tarikh (Sejarah)' },
    { id: 'sholawat', label: 'Kumpulan Sholawat' },
    { id: 'maulid', label: 'Kitab Maulid' },
    { id: 'ratib', label: 'Kitab Ratib' },
    { id: 'tajwid', label: 'Ilmu Tajwid' }
];

export const FEATURE_ROUTE_CATEGORIES = [
  {
    category: 'Layanan Utama & Ibadah',
    icon: Sparkles,
    color: 'text-amber-500',
    routes: [
      { name: 'Pembuat Naskah Pidato & Qori (Wasilah AI)', path: '/speech-material', desc: 'Pembuat ceramah, khutbah & tilawah Qori AI' },
      { name: 'Toko Wasilah & Top Up', path: '/wasilah-shop', desc: 'Pembelian paket Wasilah AI & poin' },
      { name: 'Al-Qur\'an Digital', path: '/quran', desc: 'Baca Al-Qur\'an, murottal & tafsir lengkap' },
      { name: 'Jadwal Sholat & Azan', path: '/prayer-times', desc: 'Jadwal waktu sholat & pengingat otomatis' },
      { name: 'Kompas Arah Kiblat', path: '/qibla', desc: 'Petunjuk arah kiblat akurat' },
      { name: 'Doa & Dzikir Harian', path: '/doa', desc: 'Kumpulan doa-doa shahih harian' },
      { name: 'Ensiklopedia Hadits', path: '/hadis', desc: 'Koleksi hadits shahih 9 imam' },
      { name: 'Kalkulator Zakat', path: '/zakat', desc: 'Hitung zakat maal, penghasilan, & fitrah' },
    ]
  },
  {
    category: 'Edukasi & Pembelajaran Kitab',
    icon: BookOpen,
    color: 'text-emerald-500',
    routes: [
      { name: 'Kajian Kitab Kuning', path: '/learning-kitab', desc: 'Pembelajaran kitab turats & terjemah' },
      { name: 'Learning Path Santri', path: '/learning-path', desc: 'Jalur belajar terstruktur santri' },
      { name: 'Belajar Tajwid & Tahsin', path: '/learning-quran', desc: 'Modul tajwid Al-Qur\'an interaktif' },
      { name: 'Cerdas Cermat Islam', path: '/cerdas-cermat', desc: 'Kuis interaktif wawasan keislaman' },
      { name: 'Game Edukasi Santri', path: '/game-hub', desc: 'Mini games edukatif Islami' },
      { name: 'Forum Bahtsul Masail', path: '/bahtsul-masail', desc: 'Diskusi & keputusan hukum Fiqh' },
      { name: 'Konsultasi Fatwa Syariah', path: '/fatwa', desc: 'Tanya jawab seputar hukum Islam' },
    ]
  },
  {
    category: 'Komunitas & Media Islami',
    icon: Newspaper,
    color: 'text-blue-500',
    routes: [
      { name: 'Komunitas & Feed Santri', path: '/community', desc: 'Posting, diskusi, & jejaring santri' },
      { name: 'Berita & Artikel Islam', path: '/news', desc: 'Berita terbaru dunia Islam & pesantren' },
      { name: 'Video Kajian Islami', path: '/videos', desc: 'Video dakwah, ceramah, & tutorial' },
      { name: 'Radio Dakwah Online', path: '/radio', desc: 'Streaming radio Islami 24 jam' },
      { name: 'Live TV Makkah & Madinah', path: '/tv-makkah', desc: 'Siaran langsung Haramain' },
      { name: 'Portal Kreator Islami', path: '/creator', desc: 'Peluang bergabung menjadi konten kreator' },
    ]
  },
  {
    category: 'Pasar & Layanan Ummat',
    icon: Store,
    color: 'text-purple-500',
    routes: [
      { name: 'Marketplace Santri', path: '/marketplace', desc: 'Toko produk herbal, busana, & atribut' },
      { name: 'Donasi, Infaq & Sedekah', path: '/donation', desc: 'Penyaluran donasi & program kebaikan' },
      { name: 'Layanan Qurban Online', path: '/qurban', desc: 'Pemesanan hewan qurban' },
      { name: 'Panduan Haji & Umrah', path: '/hajj-umrah', desc: 'Manasik & pendaftaran umrah' },
      { name: 'Manajemen Masjid', path: '/mosque-management', desc: 'Pengelolaan kas & agenda masjid' },
      { name: 'Langganan VIP / Premium', path: '/premium', desc: 'Keuntungan akun VIP & fitur khusus' },
    ]
  },
  {
    category: 'Kalkulator Syariah & Khusus',
    icon: Coins,
    color: 'text-rose-500',
    routes: [
      { name: 'Kalkulator Waris (Faraidh)', path: '/waris', desc: 'Hitung pembagian harta warisan' },
      { name: 'Kalkulator Safar / Travel', path: '/travel-calculator', desc: 'Hitung jarak jamak & qashar' },
      { name: 'Kalkulator Masa Iddah', path: '/iddah-calculator', desc: 'Perhitungan masa iddah wanita' },
      { name: 'Kalkulator Haid & Nifas', path: '/nifas-calculator', desc: 'Pencatatan siklus nifas & bersuci' },
      { name: 'Konsultasi Pernikahan', path: '/marriage', desc: 'Panduan fiqh munakahat' },
    ]
  }
];

const ADMIN_TABS = [
  { id: 'overview', label: 'Ringkasan', icon: LayoutGrid, color: 'text-indigo-500' },
  { id: 'tokoproducts', label: 'Katalog Produk Toko', icon: Store, color: 'text-orange-500' },
  { id: 'tokoreports', label: 'Laporan Produk Toko', icon: AlertTriangle, color: 'text-rose-500' },
  { id: 'donations', label: 'Infaq & Donasi', icon: Heart, color: 'text-rose-500' },
  { id: 'transactions', label: 'Transaksi & Koin', icon: Coins, color: 'text-amber-500' },
  { id: 'appconfig', label: 'Konfigurasi Pembaruan', icon: Settings, color: 'text-amber-600' },
  { id: 'news', label: 'Rilis Berita', icon: Newspaper, color: 'text-emerald-600' },
  { id: 'users', label: 'Pengguna', icon: Users, color: 'text-blue-500' },
  { id: 'broadcast', label: 'Pemberitahuan & Pop-up Iklan', icon: Megaphone, color: 'text-rose-500' },
  { id: 'supportchat', label: 'Chat Admin', icon: MessageSquare, color: 'text-pink-500' },
  { id: 'postreports', label: 'Laporan Post', icon: AlertCircle, color: 'text-rose-500' },
  { id: 'mutiara', label: 'Mutiara', icon: Sparkles, color: 'text-amber-500' },
  { id: 'pustaka', label: 'Pustaka', icon: BookOpen, color: 'text-emerald-500' },
  { id: 'quiz', label: 'Bank Soal', icon: Brain, color: 'text-purple-500' },
  { id: 'redemption', label: 'Penukaran', icon: Gift, color: 'text-amber-500' },
  { id: 'referrals', label: 'Referral', icon: Gift, color: 'text-emerald-500' },
  { id: 'aicache', label: 'Memory AI', icon: Database, color: 'text-teal-500' },
];

const MOBILE_NAV_ITEMS = ADMIN_TABS.slice(0, 5);

export default function AdminDashboardScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth(); 
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'users' | 'broadcast' | 'pustaka' | 'quiz' | 'redemption' | 'mutiara' | 'aicache' | 'supportchat' | 'postreports' | 'donations' | 'appconfig' | 'transactions' | 'referrals' | 'tokoproducts' | 'tokoreports'>('overview');
  const [redemptionView, setRedemptionView] = useState<'requests' | 'catalog'>('requests');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');

  useEffect(() => {
    if (location.state && location.state.chatUserId) {
      setActiveTab('supportchat');
      setActiveChatUserId(location.state.chatUserId);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  // App Config States
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('Pembaruan Aplikasi Tersedia!');
  const [updateMessage, setUpdateMessage] = useState('Silakan dapatkan pembaruan versi terbaru di Google Play Store untuk menikmati stabilitas dan fitur baru.');
  const [playStoreUrl, setPlayStoreUrl] = useState(PLAYSTORE_LINK);
  const [isOptional, setIsOptional] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    if (activeTab === 'appconfig') {
      const unsubscribe = subscribeToUpdateConfig((config) => {
        if (config) {
          setShowUpdatePopup(config.showUpdatePopup ?? false);
          setUpdateTitle(config.updateTitle || 'Pembaruan Aplikasi Tersedia!');
          setUpdateMessage(config.updateMessage || 'Silakan dapatkan pembaruan versi terbaru di Google Play Store untuk menikmati stabilitas dan fitur baru.');
          setPlayStoreUrl(config.playStoreUrl || PLAYSTORE_LINK);
          setIsOptional(config.isOptional !== undefined ? config.isOptional : true);
        }
      });
      return () => unsubscribe();
    }
  }, [activeTab]);

  const handleSaveAppConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await updateUpdateConfig({
        showUpdatePopup,
        updateTitle,
        updateMessage,
        playStoreUrl,
        isOptional
      });
      showToast('Konfigurasi pembaruan berhasil disimpan!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Gagal menyimpan konfigurasi.', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  const [users, setUsers] = useState<UserItem[]>([]);
  const [postReports, setPostReports] = useState<any[]>([]);
  const [contentReports, setContentReports] = useState<AppContentReport[]>([]);
  const [reportSubTab, setReportSubTab] = useState<'community' | 'features'>('features');
  const [donations, setDonations] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilterTab, setUserFilterTab] = useState<'all' | 'online' | 'active' | 'banned'>('all');
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    displayName: '',
    wasilah: 0,
    points: 0,
    role: 'user' as 'user' | 'admin',
    status: 'Active' as 'Active' | 'Banned',
    isVerified: false,
    isPremium: false,
  });
  const [savingUser, setSavingUser] = useState(false);

  const getUserOnlineInfo = (u: UserItem) => {
    if (u.isOnline === false) {
      return { label: 'Offline', isOnline: false };
    }

    const isOnlineFlag = Boolean(u.isOnline);
    const lastActive = u.lastActive || u.updatedAt || u.createdAt;

    if (!lastActive) {
      if (isOnlineFlag) return { label: 'Online Sekarang', isOnline: true };
      return { label: 'Belum aktif', isOnline: false };
    }

    try {
      let date: Date;
      if (lastActive?.toDate) {
        date = lastActive.toDate();
      } else if (lastActive?.seconds) {
        date = new Date(lastActive.seconds * 1000);
      } else {
        date = new Date(lastActive);
      }

      const timeMs = date.getTime();
      if (isNaN(timeMs)) {
        return { label: 'Belum aktif', isOnline: false };
      }

      const diffMs = Date.now() - timeMs;
      const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
      const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
      
      if (diffMs < THREE_HOURS_MS) {
        return { label: 'Online Sekarang', isOnline: true };
      }

      const diffDays = Math.floor(diffMs / TWENTY_FOUR_HOURS_MS);
      if (diffDays < 7) return { label: `${diffDays === 0 ? 'Hari ini' : diffDays + ' hr lalu'}`, isOnline: false };

      return { 
        label: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), 
        isOnline: false 
      };
    } catch (e) {
      return { label: 'Belum aktif', isOnline: false };
    }
  };

  // Toko Santri Marketplace Admin States
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [adminReports, setAdminReports] = useState<any[]>([]);
  const [adminProductCategoryFilter, setAdminProductCategoryFilter] = useState<string>('semua');
  const [adminProductSearch, setAdminProductSearch] = useState<string>('');
  const [rewards, setRewards] = useState<any[]>([]);
  const [rewardForm, setRewardForm] = useState({ name: '', points: '', icon: '' });
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [referralRequests, setReferralRequests] = useState<any[]>([]);

  // News States
  const [newsList, setNewsList] = useState<any[]>([]);
  const [newsForm, setNewsForm] = useState({ title: '', excerpt: '', content: '', image_url: '', source_url: '', category: 'Warta' });
  const [categories, setCategories] = useState<string[]>(['Warta', 'Pesantren', 'Hikmah', 'Tekno-Islam', 'Internasional']);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isUpdatingCategories, setIsUpdatingCategories] = useState(false);
  const [aiNewsLoading, setAiNewsLoading] = useState(false);
  const [savingNews, setSavingNews] = useState(false);
  const [newsSourceInput, setNewsSourceInput] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToNewsCategories((config) => {
      if (config && config.categories && config.categories.length > 0) {
        setCategories(config.categories);
        setNewsForm(prev => {
          if (!config.categories.includes(prev.category)) {
            return { ...prev, category: config.categories[0] };
          }
          return prev;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Refs for Image Uploads
  const rewardImageInputRef = useRef<HTMLInputElement>(null);

  // Mutiara States
  const [mutiaraList, setMutiaraList] = useState<MutiaraData[]>([]);
  const [mutiaraForm, setMutiaraForm] = useState<Partial<MutiaraData>>({
    type: 'quote', scholar: '', role: '', content: '', theme: 'grad-emerald-gold'
  });
  const [savingMutiara, setSavingMutiara] = useState(false);
  const [aiMutiaraLoading, setAiMutiaraLoading] = useState(false);

  // Broadcast States
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', image: '', audience: 'all' });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Ad / Announcement Popup States
  const [showAdPopup, setShowAdPopup] = useState(false);
  const [adTitle, setAdTitle] = useState('Promo & Pemberitahuan Terbaru!');
  const [adMessage, setAdMessage] = useState('Dapatkan Wasilah gratis & ikuti kajian materi dakwah terlengkap.');
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adActionText, setAdActionText] = useState('Lihat Promo Sekarang');
  const [adActionUrl, setAdActionUrl] = useState('/speech-material');
  const [adBadgeTag, setAdBadgeTag] = useState('PROMO');
  const [adIsDismissible, setAdIsDismissible] = useState(true);
  const [savingAdConfig, setSavingAdConfig] = useState(false);
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(0);

  useEffect(() => {
    if (activeTab === 'broadcast') {
      const unsubscribe = subscribeToAdPopupConfig((config) => {
        if (config) {
          setShowAdPopup(config.showAdPopup ?? false);
          setAdTitle(config.adTitle || 'Promo & Pemberitahuan Terbaru!');
          setAdMessage(config.adMessage || 'Dapatkan Wasilah gratis & ikuti kajian materi dakwah terlengkap.');
          setAdImageUrl(config.imageUrl || '');
          setAdActionText(config.actionText || 'Lihat Sekarang');
          setAdActionUrl(config.actionUrl || '/speech-material');
          setAdBadgeTag(config.badgeTag || 'PROMO');
          setAdIsDismissible(config.isDismissible !== undefined ? config.isDismissible : true);
        }
      });
      return () => unsubscribe();
    }
  }, [activeTab]);

  const handleSaveAdConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAdConfig(true);
    try {
      await updateAdPopupConfig({
        showAdPopup,
        adTitle,
        adMessage,
        imageUrl: adImageUrl,
        actionText: adActionText,
        actionUrl: adActionUrl,
        badgeTag: adBadgeTag,
        isDismissible: adIsDismissible,
      });
      showToast('Pop-up Iklan & Pemberitahuan berhasil disimpan!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Gagal menyimpan konfigurasi pop-up iklan.', 'error');
    } finally {
      setSavingAdConfig(false);
    }
  };

  const [quizList, setQuizList] = useState<any[]>([]);
  const [quizForm, setQuizForm] = useState({
    question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 0, topic: 'fiqh', explanation: '' 
  });
  const [aiQuizLoading, setAiQuizLoading] = useState(false);
  const [selectedQuizCategoryFilter, setSelectedQuizCategoryFilter] = useState<string>('semua');
  const [quizSearchQuery, setQuizSearchQuery] = useState<string>('');
  const [editingQuiz, setEditingQuiz] = useState<any | null>(null);

  const [aiCacheList, setAiCacheList] = useState<any[]>([]);
  const [loadingAiCache, setLoadingAiCache] = useState(false);

  const [publicBooks, setPublicBooks] = useState<any[]>([]);
  const [loadingPustaka, setLoadingPustaka] = useState(false);

  // Support Chat States
  const [supportChats, setSupportChats] = useState<SupportChat[]>([]);
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<SupportChatMessage[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminChatImage, setAdminChatImage] = useState<string | null>(null);
  const [adminChatImageModal, setAdminChatImageModal] = useState<string | null>(null);
  const [sendingReply, setSendingReply] = useState(false);
  const adminChatEndRef = useRef<HTMLDivElement>(null);
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  const compressChatImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 1000;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.75));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => reject(new Error("Gagal memproses gambar"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Gagal membaca file"));
      reader.readAsDataURL(file);
    });
  };

  const handleAdminImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Pilih file gambar (JPG, PNG, WEBP)", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("Maksimal ukuran file 10MB", "warning");
      return;
    }

    try {
      const compressed = await compressChatImage(file);
      setAdminChatImage(compressed);
    } catch (err) {
      showToast("Gagal memuat gambar", "error");
    } finally {
      if (adminFileInputRef.current) adminFileInputRef.current.value = '';
    }
  };

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; onConfirm: () => void; isDestructive?: boolean;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {}, isDestructive: false });

  // Subscribe to active support chat messages
  useEffect(() => {
    if (!activeChatUserId) {
      setActiveChatMessages([]);
      return;
    }
    const unsubscribe = subscribeToSupportMessages(activeChatUserId, (data) => {
      setActiveChatMessages(data);
      setTimeout(() => {
        adminChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });
    return () => {
      unsubscribe();
    };
  }, [activeChatUserId]);

  useEffect(() => {
    if (loading) return;
    const allowedAdminEmails = ['rumahupdate@gmail.com', 'devsantriai@gmail.com', 'admin@santrimodern.com', 'alwasilahid@gmail.com'];
    if (!isFirebaseReady() || !user || !allowedAdminEmails.includes(user.email || '')) {
        return;
    }

    const unsubUsers = subscribeToAllUsers((data) => setUsers(data as UserItem[]));
    const unsubQuiz = subscribeToQuizzes((data) => setQuizList(data));
    const unsubRewards = subscribeToRewards((data) => setRewards(data));
    const unsubRedemptions = subscribeToRedemptions((data) => setRedemptions(data));
    const unsubBroadcasts = subscribeToBroadcasts((data) => setBroadcasts(data));
    const unsubSupportChats = subscribeToAllSupportChats((data) => setSupportChats(data));
    const unsubReferrals = subscribeToReferralRequests((data) => setReferralRequests(data));
    
    // NEW: Subscribe to GitHub Mutiara
    const loadMutiaraData = async () => {
      try {
        const data = await fetchListFromGitHub('mutiara');
        setMutiaraList(data);
      } catch (e) {
        console.error("Gagal memuat mutiara dari GitHub:", e);
      }
    };
    loadMutiaraData(); // Initial load
    // Note: Supabase doesn't have real-time subscriptions like Firebase out-of-the-box
    // for simple tables, so we'll rely on periodic refreshes or manual trigger.
    // For now, refreshing on tab switch and after saving/deleting should suffice.
    
    return () => {
        unsubUsers(); 
        unsubQuiz(); 
        unsubRewards(); 
        unsubRedemptions(); 
        unsubBroadcasts(); 
        unsubSupportChats();
        unsubReferrals();
    };
  }, [user, loading]);

  useEffect(() => {
    if (activeTab === 'news') loadNews();
    if (activeTab === 'aicache') loadAiCache();
    if (activeTab === 'pustaka') loadPublicBooks();
    if (activeTab === 'mutiara') loadMutiara(); // NEW: Load mutiara when tab is active

    if (activeTab === 'postreports') {
      const unsubPost = subscribeToPostReports((data) => {
        setPostReports(data);
      });
      const unsubContent = subscribeToContentReports((data) => {
        setContentReports(data);
      });
      return () => {
        unsubPost();
        unsubContent();
      };
    }

    if (activeTab === 'donations') {
      const unsub = subscribeToDonations((data) => {
        setDonations(data);
      });
      return unsub;
    }

    if (activeTab === 'transactions') {
      const unsub = subscribeToAllTransactions((data) => {
        setTransactions(data);
      });
      return unsub;
    }

    if (activeTab === 'tokoproducts') {
      const unsub = subscribeToMarketplaceProducts((data) => {
        setAdminProducts(data);
      });
      return unsub;
    }

    if (activeTab === 'tokoreports') {
      const unsub = subscribeToMarketplaceReports((data) => {
        setAdminReports(data);
      });
      return unsub;
    }
  }, [activeTab]);

  const loadNews = async () => {
    const data = await fetchListFromGitHub('news');
    setNewsList(data);
  };

  const handleAiGenerateNews = async () => {
    if (!newsSourceInput) {
        showToast("Masukkan URL atau Topik terlebih dahulu", "warning");
        return;
    }
    setAiNewsLoading(true);
    try {
        const res = await generateNewsAI(newsSourceInput);
        if (res) {
            setNewsForm({
                title: res.title,
                excerpt: res.excerpt,
                content: res.content,
                category: res.category || 'Warta',
                image_url: newsForm.image_url,
                source_url: res.grounding_source || (newsSourceInput.startsWith('http') ? newsSourceInput : '')
            });
            showToast("Berita berhasil dibuat oleh AI!", "success");
        }
    } catch (e) {
        showToast("Gagal generate berita", "error");
    } finally {
        setAiNewsLoading(false);
    }
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.content) return;
    setSavingNews(true);
    try {
        const timestamp = new Date().getTime();
        const newsWithId = { ...newsForm, id: `news-${timestamp}`, created_at: new Date().toISOString() };
        await saveToGitHub('news', newsWithId.title + '-' + newsWithId.id, newsWithId);
        showToast("Berita berhasil diterbitkan!", "success");
        setNewsForm({ title: '', excerpt: '', content: '', image_url: '', source_url: '', category: 'Warta' });
        setNewsSourceInput('');
        loadNews();
    } catch (e) {
        showToast("Gagal menyimpan berita", "error");
    } finally {
        setSavingNews(false);
    }
  };

  const handleDeleteNews = (id: string, title: string) => {
    setConfirmModal({
        isOpen: true, title: "Hapus Berita?", message: "Berita akan dihapus permanen dari GitHub.", isDestructive: true,
        onConfirm: async () => {
            try { await deleteFromGitHub('news', title + '-' + id); showToast("Dihapus", "info"); loadNews(); } catch (e) { showToast("Gagal", "error"); }
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  // Toko Santri Marketplace Admin Handlers
  const handleDeleteAdminProduct = (productId: string, productName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Produk Marketplace?',
      message: `Apakah Anda yakin ingin menghapus produk "${productName}" secara permanen dari Toko Santri?`,
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteMarketplaceProduct(productId);
          showToast(`Produk "${productName}" berhasil dihapus!`, 'success');
        } catch (err: any) {
          console.error(err);
          showToast('Gagal menghapus produk.', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await resolveMarketplaceReport(reportId);
      showToast('Laporan telah ditandai Selesai!', 'success');
    } catch (err) {
      showToast('Gagal mengubah status laporan.', 'error');
    }
  };

  const handleDeleteReportAndProduct = (reportId: string, productId: string, productName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Produk & Selesaikan Laporan?',
      message: `Produk "${productName}" akan dihapus dari marketplace dan laporan akan ditandai Selesai.`,
      isDestructive: true,
      onConfirm: async () => {
        try {
          if (productId) {
            await deleteMarketplaceProduct(productId);
          }
          await resolveMarketplaceReport(reportId);
          showToast(`Produk "${productName}" telah dihapus dan laporan diselesaikan!`, 'success');
        } catch (err) {
          console.error(err);
          showToast('Gagal memproses laporan.', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      await deleteMarketplaceReport(reportId);
      showToast('Laporan berhasil diabaikan/dihapus.', 'info');
    } catch (err) {
      showToast('Gagal menghapus laporan.', 'error');
    }
  };

  const handleAddCategory = async () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      showToast("Kategori sudah ada!", "warning");
      return;
    }
    const updated = [...categories, trimmed];
    setIsUpdatingCategories(true);
    try {
      await updateNewsCategories(updated);
      showToast("Kategori baru berhasil ditambahkan!", "success");
      setNewCategoryInput('');
    } catch (error) {
      showToast("Gagal menambahkan kategori", "error");
    } finally {
      setIsUpdatingCategories(false);
    }
  };

  const handleDeleteCategory = async (catToDelete: string) => {
    if (categories.length <= 1) {
      showToast("Harus menyisakan minimal 1 kategori!", "warning");
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: "Hapus Kategori?",
      message: `Hapus kategori "${catToDelete}"? Berita yang menggunakan kategori ini tidak akan bisa difilter di aplikasi berdasarkan kategori ini lagi.`,
      isDestructive: true,
      onConfirm: async () => {
        const updated = categories.filter(c => c !== catToDelete);
        setIsUpdatingCategories(true);
        try {
          await updateNewsCategories(updated);
          showToast(`Kategori "${catToDelete}" berhasil dihapus`, "info");
        } catch (error) {
          showToast("Gagal menghapus kategori", "error");
        } finally {
          setIsUpdatingCategories(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // NEW: Load Mutiara from GitHub
  const loadMutiara = async () => {
    try {
      const data = await fetchListFromGitHub('mutiara');
      setMutiaraList(data);
    } catch (e) {
      console.error("Gagal memuat mutiara dari GitHub:", e);
    }
  };

  const handleAiGenerateMutiara = async () => {
    setAiMutiaraLoading(true);
    try {
        const res = await generateJson(
            `Buat kutipan mutiara hikmah yang unik dan mendalam dari seorang Ulama Aswaja secara acak. 
            Tokoh yang dipilih HARUS bervariasi, contoh: Buya Yahya, Gus Baha, Habib Luthfi, Habib Umar bin Hafidz, Habib Ali Al-Jufri, KH Hasyim Asy'ari, KH Ahmad Dahlan, atau Ulama Klasik seperti Imam Syafi'i, Imam Ghazali, atau Syaikh Abdul Qadir Al-Jailani. 
            Pastikan kutipan tidak repetitif dan memiliki pesan spiritual yang kuat.
            Pilih tema warna dari list: ${QUOTE_THEMES.map(t => t.id).join(', ')}. 
            JSON format: {"scholar": "...", "role": "...", "content": "...", "theme": "..."}`,
            "Pakar hikmah Islam and sastra Arab.",
            true
        );
        if (res) {
            setMutiaraForm({
                ...mutiaraForm,
                scholar: res.scholar,
                role: res.role,
                content: res.content,
                theme: res.theme || 'grad-emerald-gold',
                type: 'quote'
            });
            showToast("Hikmah unik berhasil dibuat!", "success");
        }
    } catch (e) {
        showToast("Gagal generate hikmah", "error");
    } finally {
        setAiMutiaraLoading(false);
    }
  };

  // NEW: Save Mutiara to GitHub
  const handleSaveMutiara = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mutiaraForm.scholar || !mutiaraForm.role || !mutiaraForm.content) {
        showToast("Mohon lengkapi semua data (Tokoh, Gelar, dan Kutipan)", "warning");
        return;
    }
    setSavingMutiara(true);
    try {
        const timestamp = new Date().getTime();
        const mutiaraId = `mutiara-${timestamp}`;
        const finalData = { ...mutiaraForm, id: mutiaraId, type: 'quote', date: new Date().toISOString() } as MutiaraData;
        await saveToGitHub('mutiara', finalData.scholar + '-' + mutiaraId, finalData);
        showToast("Mutiara berhasil dipublikasikan!", "success");
        setMutiaraForm({ type: 'quote', scholar: '', role: '', content: '', theme: 'grad-emerald-gold' });
        loadMutiara(); // Refresh list after saving
    } catch (e) {
        console.error("Gagal menyimpan mutiara:", e);
        showToast("Gagal menyimpan mutiara", "error");
    } finally {
        setSavingMutiara(false);
    }
  };

  // NEW: Delete Mutiara from GitHub
  const handleDeleteMutiara = (id: string, scholar: string) => {
    setConfirmModal({
        isOpen: true, title: "Hapus Mutiara?", message: "Konten ini akan hilang dari timeline user.", isDestructive: true,
        onConfirm: async () => {
            try { await deleteFromGitHub('mutiara', scholar + '-' + id); showToast("Berhasil dihapus", "info"); loadMutiara(); } catch (e) { showToast("Gagal", "error"); }
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  const loadAiCache = async () => {
    setLoadingAiCache(true);
    try {
        const data = await fetchListFromGitHub('ai-cache');
        setAiCacheList(data);
    } catch (e: any) { showToast("Gagal memuat cache", "error"); } finally { setLoadingAiCache(false); }
  };

  const loadPublicBooks = async () => {
    setLoadingPustaka(true);
    try {
        const data = await fetchListFromGitHub('ebooks'); // Changed from 'pustaka' to 'ebooks' to match the request
        setPublicBooks(data);
    } catch (e: any) { showToast("Gagal memuat pustaka", "error"); } finally { setLoadingPustaka(false); }
  };

  useEffect(() => {
    if (loading) return; 
    const allowedAdminEmails = ['rumahupdate@gmail.com', 'devsantriai@gmail.com', 'admin@santrimodern.com', 'alwasilahid@gmail.com'];
    if (!user || !allowedAdminEmails.includes(user.email || '')) {
      showToast("Akses Terbatas!", "error");
      navigate('/settings');
    }
  }, [user, loading, navigate, showToast]);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
        showToast("Judul dan isi pesan wajib diisi", "warning");
        return;
    }
    setSendingBroadcast(true);
    try {
        await sendBroadcast(broadcastForm);
        showToast("Pesan broadcast berhasil terkirim!", "success");
        setBroadcastForm({ title: '', message: '', image: '', audience: 'all' });
    } catch (e) {
        showToast("Gagal mengirim broadcast", "error");
    } finally {
        setSendingBroadcast(false);
    }
  };

  const handleDeleteBroadcast = (id: string) => {
    setConfirmModal({
        isOpen: true, title: "Hapus Broadcast?", message: "Pesan ini akan dihapus dari riwayat notifikasi pengguna.", isDestructive: true,
        onConfirm: async () => {
            try { await deleteBroadcast(id); showToast("Berhasil dihapus", "info"); } catch (e) { showToast("Gagal", "error"); }
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  const handleUpdateUserStatus = async (id: string, status: 'Active' | 'Banned') => {
    try { await updateUserStatus(id, status); showToast("Status diupdate", "success"); } catch (e) { showToast("Gagal", "error"); }
  };

  const handleOpenEditUser = (u: UserItem) => {
    setEditingUser(u);
    setEditUserForm({
      displayName: u.displayName || '',
      wasilah: Math.max(0, u.wasilah || 0),
      points: Math.max(0, u.points || 0),
      role: (u.role as 'user' | 'admin') || 'user',
      status: (u.status as 'Active' | 'Banned') || 'Active',
      isVerified: Boolean(u.isVerified || (u.verificationBadge && u.verificationBadge !== 'none')),
      isPremium: Boolean(u.isPremium || (u as any).plan === 'premium' || (u as any).plan === 'pro'),
    });
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingUser(true);
    try {
      const clampedWasilah = Math.max(0, Math.round(Number(editUserForm.wasilah) || 0));
      const clampedPoints = Math.max(0, Math.round(Number(editUserForm.points) || 0));
      
      await adminUpdateUserData(editingUser.id, {
        displayName: editUserForm.displayName.trim() || undefined,
        wasilah: clampedWasilah,
        points: clampedPoints,
        role: editUserForm.role,
        status: editUserForm.status,
        isVerified: editUserForm.isVerified,
        isPremium: editUserForm.isPremium,
      });

      showToast(`Data santri ${editUserForm.displayName || editingUser.email} berhasil diperbarui!`, "success");
      setEditingUser(null);
    } catch (err: any) {
      console.error("Gagal update santri:", err);
      showToast(err.message || "Gagal memperbarui data santri.", "error");
    } finally {
      setSavingUser(false);
    }
  };

  const handleApproveRedemption = async (id: string) => {
    try { await approveRedemption(id); showToast("Disetujui", "success"); } catch (e) { showToast("Gagal", "error"); }
  };

  const handleRejectRedemption = async (id: string) => {
    try { await rejectRedemption(id); showToast("Ditolak", "info"); } catch (e) { showToast("Gagal", "error"); }
  };

  const handleRewardImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 250 * 1024) { 
        showToast("Ukuran foto maksimal 250KB", "warning");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setRewardForm(prev => ({ ...prev, icon: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveReward = async () => {
    if (!rewardForm.name || !rewardForm.points) {
      showToast("Nama dan Poin wajib diisi", "warning");
      return;
    }
    if (!rewardForm.icon) {
      showToast("Foto barang wajib diupload", "warning");
      return;
    }
    try {
        await addReward({ name: rewardForm.name, points: parseInt(rewardForm.points), icon: rewardForm.icon });
        showToast("Hadiah ditambahkan", "success");
        setShowRewardModal(false);
        setRewardForm({ name: '', points: '', icon: '' });
    } catch (e) { showToast("Gagal", "error"); }
  };

  const matchesTopic = (qTopic: string, topicId: string) => {
    if (!qTopic) return false;
    const qt = qTopic.toLowerCase().trim();
    const tid = topicId.toLowerCase().trim();
    if (qt === tid) return true;
    if (tid === 'tafsir' && (qt.includes('tafsir') || qt.includes('quran') || qt.includes('alquran'))) return true;
    if (tid === 'hadits' && (qt.includes('hadis') || qt.includes('hadits'))) return true;
    if (tid === 'akidah' && (qt.includes('akidah') || qt.includes('tauhid'))) return true;
    if (tid === 'fiqih' && qt.includes('fiqih') && !qt.includes('ushul')) return true;
    if (tid === 'ushul_fiqh' && (qt.includes('ushul') || qt.includes('ushul_fiqh'))) return true;
    if (tid === 'nahwu' && (qt.includes('nahwu') || qt.includes('shorof') || qt.includes('sarf'))) return true;
    if (tid === 'mantiq' && (qt.includes('mantiq') || qt.includes('logika'))) return true;
    if (tid === 'tasawuf' && (qt.includes('tasawuf') || qt.includes('akhlaq') || qt.includes('akhlak'))) return true;
    if (tid === 'tarikh' && (qt.includes('tarikh') || qt.includes('sejarah') || qt.includes('sirah'))) return true;
    if (tid === 'sholawat' && qt.includes('sholawat')) return true;
    if (tid === 'maulid' && qt.includes('maulid')) return true;
    if (tid === 'ratib' && qt.includes('ratib')) return true;
    if (tid === 'tajwid' && (qt.includes('tajwid') || qt.includes('qiraat'))) return true;
    return false;
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizForm.question) return;
    try {
        await addQuiz({ 
          question: quizForm.question, 
          options: [quizForm.optionA, quizForm.optionB, quizForm.optionC, quizForm.optionD], 
          correctAnswer: quizForm.correctAnswer, 
          topic: quizForm.topic,
          explanation: quizForm.explanation || ''
        });
        setQuizForm({ ...quizForm, question: '', optionA: '', optionB: '', optionC: '', optionD: '', explanation: '' });
        showToast("Soal disimpan ke Bank Soal", "success");
    } catch (e) { showToast("Gagal menyimpan soal", "error"); }
  };

  const handleUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuiz || !editingQuiz.question) return;
    try {
      await updateQuiz(editingQuiz.id, {
        question: editingQuiz.question,
        options: editingQuiz.options,
        correctAnswer: editingQuiz.correctAnswer,
        topic: editingQuiz.topic,
        explanation: editingQuiz.explanation || ''
      });
      showToast("Soal kuis berhasil diperbarui & dikoreksi!", "success");
      setEditingQuiz(null);
    } catch (err) {
      console.error(err);
      showToast("Gagal memperbarui soal.", "error");
    }
  };

  const handleDeleteQuizItem = (quizId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Soal Kuis?",
      message: "Soal ini akan dihapus permanen dari Bank Soal aplikasi.",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteQuiz(quizId);
          showToast("Soal berhasil dihapus!", "info");
        } catch (err) {
          showToast("Gagal menghapus soal.", "error");
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAiGenerateQuiz = async () => {
    setAiQuizLoading(true);
    try {
        const topicLabel = QUIZ_TOPICS.find(t => t.id === quizForm.topic)?.label || "Umum";
        const existingQuestionsStr = quizList
          .filter(q => q.question)
          .slice(-30)
          .map(q => `"${q.question}"`)
          .join(', ');

        const randomSeed = Math.floor(Math.random() * 1000000);

        let quranRules = "";
        if (quizForm.topic === 'alquran') {
            quranRules = `\n          6. KHUSUS TOPIK AL-QURAN: Buatlah soal unik seputar nama surah, letak halaman/juz, pertanyaan sambung ayat, potongan ayat, terjemahan ayat spesifik, tempat diturunkan surah (Makkiyah/Madaniyah), atau pertanyaan yang mencantumkan jawaban dari isi Al-Quran (misal: "Berapa lama Ashabul Kahfi tertidur menurut Al-Quran?", "Siapakah satu-satunya nama sahabat yang disebut dalam Al-Quran?").`;
        }

        const res = await generateJson(
          `Buat 1 soal kuis pilihan ganda yang SANGAT UNIK, MENANTANG & SULIT (tingkat menengah-lanjut / Bahtsul Masail / Kitab Turats) tentang ilmu ${topicLabel} sesuai dengan pemahaman Ahlussunnah wal Jama'ah (Aswaja).
          
          Aturan Wajib Pembuatan Soal:
          1. Kategori: ${topicLabel}
          2. Tingkat Kesulitan: SULIT & SPESIFIK (mengenai hukum fiqih turats, istilah kaidah nahwu/shorof/mantiq, tafsir ayat ahkam, atau mukhtalif hadits).
          3. SANGAT DILARANG membuat soal dasar/umum yang terlalu gampang.
          4. Pengacak Seed ID: ${randomSeed}.
          5. PENTING - HINDARI DAN DILARANG MEMBUAT SOAL YANG SAMA ATAU SERUPA DENGAN DAFTAR SOAL BERIKUT:
          [ ${existingQuestionsStr || "Belum ada soal"} ]${quranRules}

          Berikan 4 pilihan jawaban (A, B, C, D) yang mutakhir, mengecoh, dan ilmiah. Tunjukkan indeks jawaban yang benar (0-3).
          Sertakan juga penjelasan/syarah/referensi kitab ringkas dalam field 'explanation'.
          Format JSON wajib: {"question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0, "explanation": "..."}`, 
          "Pakar ilmu Islam, ahli Kitab Kuning, dan perumus soal Bahtsul Masail Aswaja.", 
          true
        );
        if (res && res.options && Array.isArray(res.options) && res.options.length === 4) {
            setQuizForm({ 
              ...quizForm, 
              question: res.question, 
              optionA: res.options[0], 
              optionB: res.options[1], 
              optionC: res.options[2], 
              optionD: res.options[3], 
              correctAnswer: typeof res.correctIndex === 'number' ? res.correctIndex : 0,
              explanation: res.explanation || ''
            });
            showToast("Soal unik & menantang berhasil dibuat oleh AI", "success");
        } else {
            showToast("Gagal memformat soal dari AI, silakan coba lagi", "warning");
        }
    } catch (e) { 
        showToast("Gagal generate soal AI", "error"); 
    } finally { 
        setAiQuizLoading(false); 
    }
  };

  const handleDeleteBook = (id: string, title: string) => {
    setConfirmModal({
        isOpen: true, title: "Hapus Kitab?", message: "Kitab akan dihapus dari pustaka publik.", isDestructive: true,
        onConfirm: async () => {
            try { await deleteFromGitHub('ebooks', title + '-' + id); showToast("Dihapus", "info"); loadPublicBooks(); } catch (e) { showToast("Gagal", "error"); }
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!adminReplyText.trim() && !adminChatImage) || !activeChatUserId || !user) return;
    
    const replyText = adminReplyText.trim();
    const imageToSend = adminChatImage;

    setAdminReplyText('');
    setAdminChatImage(null);
    setSendingReply(true);
    
    try {
      await sendSupportMessage(
        activeChatUserId,
        'admin',
        'TIM ADMIN',
        replyText,
        undefined,
        imageToSend || undefined
      );
    } catch (err) {
      console.error(err);
      showToast("Gagal membalas pesan", "error");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 md:pb-0 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR (Desktop) */}
      <div className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 shadow-sm z-40 transition-colors">
         <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 bg-santri-green rounded-xl flex items-center justify-center text-white shadow-lg"><LayoutDashboard size={22} /></div>
            <div>
                <h1 className="font-bold text-slate-800 dark:text-slate-100">Admin Panel</h1>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online</span></div>
            </div>
         </div>
         <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-sidebar-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
            {ADMIN_TABS.map(tab => (
               <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group ${activeTab === tab.id ? 'bg-santri-green text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><div className="flex items-center gap-3"><tab.icon size={20} className={activeTab === tab.id ? 'text-white' : tab.color} />{tab.label}</div>{activeTab !== tab.id && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}</button>
            ))}
         </nav>
         <div className="p-6 border-t border-slate-100 dark:border-slate-800"><button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs"><ArrowLeft size={16} /> Kembali</button></div>
      </div>

      {/* MOBILE TOP HEADER & HORIZONTAL TABS */}
      <div className="md:hidden sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-xs">
         <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
               <div className="w-9 h-9 bg-santri-green rounded-xl flex items-center justify-center text-white shadow-md shadow-green-600/20 shrink-0">
                  <LayoutDashboard size={20} />
               </div>
               <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                     <h1 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm tracking-tight truncate">Panel Admin</h1>
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0"></span>
                  </div>
                  <p className="text-[10px] font-bold text-santri-green truncate flex items-center gap-1">
                     {(() => {
                        const current = ADMIN_TABS.find(t => t.id === activeTab);
                        const CurrentIcon = current?.icon || LayoutGrid;
                        return (
                           <>
                              <CurrentIcon size={12} className={current?.color} />
                              <span className="truncate">{current?.label}</span>
                           </>
                        );
                     })()}
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-2">
               <button 
                  onClick={() => setShowMobileMenu(true)}
                  className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200/80 dark:border-emerald-800/80 flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
               >
                  <LayoutGrid size={16} />
                  <span>Semua Menu</span>
               </button>
               <button 
                  onClick={() => navigate('/')} 
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
                  title="Kembali ke Beranda"
               >
                  <ArrowLeft size={18}/>
               </button>
            </div>
         </div>

         {/* Horizontal Scrollable Tab Pills Bar */}
         <div className="px-3 pb-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {ADMIN_TABS.map((tab) => {
               const isActive = activeTab === tab.id;
               const TabIcon = tab.icon;

               // Badge counts for pending items
               let badgeCount = 0;
               if (tab.id === 'redemption') badgeCount = redemptions.filter(r => r.status === 'Pending').length;
               if (tab.id === 'tokoreports') badgeCount = adminReports.filter(r => r.status === 'pending').length;
               if (tab.id === 'postreports') badgeCount = postReports.filter(r => r.status === 'pending').length;
               if (tab.id === 'supportchat') badgeCount = supportChats.filter(c => c.lastSenderId !== 'admin').length;
               if (tab.id === 'referrals') badgeCount = referralRequests.filter(r => r.status === 'Pending').length;

               return (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 border ${
                        isActive
                           ? 'bg-santri-green text-white border-santri-green shadow-md shadow-green-600/20 scale-[1.02]'
                           : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100'
                     }`}
                  >
                     <TabIcon size={15} className={isActive ? 'text-white' : tab.color} />
                     <span>{tab.label}</span>
                     {badgeCount > 0 && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                           isActive ? 'bg-white text-santri-green' : 'bg-rose-500 text-white'
                        }`}>
                           {badgeCount}
                        </span>
                     )}
                  </button>
               );
            })}
         </div>
      </div>

      <div className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full pb-32 md:pb-10 transition-colors">
         
         <div className="hidden md:flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 capitalize">{ADMIN_TABS.find(t => t.id === activeTab)?.label}</h2>
            <div className="flex items-center gap-3">
                <div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Admin</p><p className="text-sm font-bold text-slate-700 dark:text-slate-300">{user?.email}</p></div>
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shadow-sm"><User size={20}/></div>
            </div>
         </div>

         {/* 1. OVERVIEW TAB */}
         {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
                    {[
                        { label: 'Total Santri', value: users.length, icon: Users, color: 'from-blue-500 to-indigo-600', sub: 'Aktif', tabId: 'users' },
                        { label: 'Warta Santri', value: newsList.length, icon: Newspaper, color: 'from-emerald-500 to-teal-600', sub: 'Rilis', tabId: 'news' },
                        { label: 'Broadcast', value: broadcasts.length, icon: Megaphone, color: 'from-rose-500 to-pink-600', sub: 'Terkirim', tabId: 'broadcast' },
                        { label: 'Mutiara Hikmah', value: mutiaraList.length, icon: Sparkles, color: 'from-amber-500 to-orange-600', sub: 'Konten', tabId: 'mutiara' },
                        { label: 'Bank Soal', value: quizList.length, icon: Brain, color: 'from-purple-500 to-violet-600', sub: 'Kuis', tabId: 'quiz' },
                    ].map((stat, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => stat.tabId && setActiveTab(stat.tabId as any)}
                          className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group overflow-hidden relative cursor-pointer hover:border-emerald-400/50 dark:hover:border-emerald-600/50 hover:shadow-md active:scale-98 transition-all"
                        >
                            <div className={`p-3 rounded-2xl text-white w-fit mb-5 bg-gradient-to-br ${stat.color}`}><stat.icon size={24} /></div>
                            <h3 className="text-slate-400 text-[10px] font-bold uppercase mb-1 tracking-widest">{stat.label}</h3>
                            <div className="flex items-baseline gap-2"><p className="text-3xl font-black text-slate-800 dark:text-slate-100">{stat.value}</p><span className="text-[10px] font-bold text-slate-400">{stat.sub}</span></div>
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-8 flex items-center gap-3"><Users size={22} className="text-blue-500"/> Santri Terbaru</h3>
                        <div className="space-y-4">
                            {users.slice(0, 5).map(u => {
                              const onlineInfo = getUserOnlineInfo(u);
                              return (
                                <div key={u.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                    <UserAvatar 
                                        photoURL={u.photoURL}
                                        displayName={u.displayName}
                                        points={u.points}
                                        size="md"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{u.displayName || 'Santri'}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tight">{u.status || 'ACTIVE'}</p>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <p className="text-[9px] text-green-600 font-bold uppercase tracking-tight">{u.wasilah || 0} WASILAH</p>
                                        </div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-semibold">
                                            <span className={`w-2 h-2 rounded-full ${onlineInfo.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                                            <span>Aktivitas: {onlineInfo.label}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-amber-500">{u.points || 0}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Poin XP</p>
                                        </div>
                                        <button 
                                            onClick={() => handleOpenEditUser(u)}
                                            className="p-2 rounded-xl bg-slate-200/70 hover:bg-amber-100 text-slate-600 hover:text-amber-600 dark:bg-slate-700 dark:hover:bg-amber-950/60 dark:text-slate-300 dark:hover:text-amber-300 transition-all shrink-0"
                                            title="Edit Wasilah / Poin Santri"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                    </div>
                                </div>
                              );
                            })}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-8 flex items-center gap-3"><Gift size={22} className="text-amber-500"/> Penukaran Wasilah</h3>
                        <div className="space-y-4">{redemptions.filter(r => r.status === 'Pending').slice(0, 5).map(r => (<div key={r.id} className="flex items-center gap-4 p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100/30"><div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center"><ShoppingBag size={20}/></div><div className="flex-1 min-w-0"><h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{r.rewardName}</h4><p className="text-[10px] text-slate-500 font-medium">Oleh: {r.userName}</p><p className="text-[9px] font-black text-amber-600">{r.pointsCost} WASILAH</p></div><div className="flex gap-2"><button onClick={() => handleApproveRedemption(r.id!)} className="px-5 py-2.5 bg-green-500 text-white rounded-xl shadow-md"><Check size={16}/></button><button onClick={() => handleRejectRedemption(r.id!)} className="px-5 py-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"><X size={16}/></button></div></div>))}{redemptions.filter(r => r.status === 'Pending').length === 0 && (<div className="py-12 text-center text-slate-400 text-sm italic">Semua permintaan telah diproses.</div>)}</div>
                    </div>
                </div>
            </div>
         )}

         {/* UPDATED: NEWS RELEASE TAB MATCHING SCREENSHOT */}
         {activeTab === 'news' && (
            <div className="space-y-8 animate-in fade-in">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <h3 className="font-bold text-2xl flex items-center gap-4"><Newspaper size={32} className="text-emerald-600"/> Rilis Berita AI</h3>
                        
                        {/* INTEGRATED SEARCH/GENERATE BAR - MATCHING SCREENSHOT */}
                        <div className="flex items-center w-full md:w-auto p-1.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-inner group-focus-within:border-emerald-300 transition-all">
                            <div className="flex-1 flex items-center px-4">
                                <Search size={20} className="text-slate-400 mr-3" />
                                <input 
                                    value={newsSourceInput} 
                                    onChange={e => setNewsSourceInput(e.target.value)}
                                    placeholder="Cari atau masukkan link (Web/YouTube)..." 
                                    className="bg-transparent py-3 outline-none text-sm w-64 md:w-96 font-medium text-slate-700 dark:text-slate-200"
                                    onKeyDown={e => e.key === 'Enter' && handleAiGenerateNews()}
                                />
                            </div>
                            <button 
                                onClick={handleAiGenerateNews} 
                                disabled={aiNewsLoading || !newsSourceInput}
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-[1.2rem] text-sm font-black hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-50"
                            >
                                {aiNewsLoading ? <Loader2 className="animate-spin" size={18}/> : <Wand2 size={18}/>}
                                Buat Berita
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSaveNews} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 block">JUDUL BERITA</label>
                                <input value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-base font-bold outline-none border-2 border-transparent focus:border-emerald-100 focus:bg-white dark:focus:bg-slate-900 transition-all" placeholder="Judul berita akan muncul otomatis..."/>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 block">KATEGORI & GAMBAR</label>
                                    <div className="flex flex-col gap-4">
                                        <select value={newsForm.category} onChange={e => setNewsForm({...newsForm, category: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-bold border-2 border-transparent outline-none focus:border-emerald-100">
                                            {categories.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <input value={newsForm.image_url} onChange={e => setNewsForm({...newsForm, image_url: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs outline-none border-2 border-transparent focus:border-emerald-100" placeholder="URL Gambar Utama..."/>
                                    </div>
                                </div>

                                {/* KELOLA KATEGORI BERITA */}
                                <div className="p-5 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/30">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest block">Kelola Kategori</label>
                                        <Sparkles size={12} className="text-emerald-600 animate-pulse" />
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1.5 mb-3.5">
                                        {categories.map((cat) => (
                                            <div 
                                                key={cat} 
                                                className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900 group"
                                            >
                                                <span>{cat}</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDeleteCategory(cat)}
                                                    className="p-0.5 text-slate-400 group-hover:text-red-500 rounded transition-colors"
                                                    title="Hapus Kategori"
                                                >
                                                    <X size={10} strokeWidth={3} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <input 
                                            type="text"
                                            value={newCategoryInput}
                                            onChange={e => setNewCategoryInput(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddCategory();
                                                }
                                            }}
                                            placeholder="Kategori baru..."
                                            className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl text-xs font-semibold outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100"
                                            disabled={isUpdatingCategories}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCategory}
                                            disabled={isUpdatingCategories || !newCategoryInput.trim()}
                                            className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer aspect-square shrink-0"
                                        >
                                            {isUpdatingCategories ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} strokeWidth={3} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 block">RINGKASAN (EXCERPT)</label>
                            <input value={newsForm.excerpt} onChange={e => setNewsForm({...newsForm, excerpt: e.target.value})} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-medium border-2 border-transparent outline-none focus:border-emerald-100 focus:bg-white transition-all" placeholder="Ringkasan singkat artikel..."/>
                        </div>
                        <div>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3 block">ISI ARTIKEL BERITA</label>
                            <textarea value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} className="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] text-sm leading-relaxed border-2 border-transparent outline-none focus:border-emerald-100 focus:bg-white transition-all min-h-[350px]" placeholder="Isi berita lengkap akan digenerate di sini..."/>
                        </div>
                        
                        {/* FULL WIDTH BUTTON - MATCHING SCREENSHOT */}
                        <div className="pt-4">
                           <button type="submit" disabled={savingNews || !newsForm.title} className="w-full py-6 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-emerald-200 dark:shadow-none hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-4">
                              {savingNews ? <Loader2 className="animate-spin" size={24}/> : <Check size={24} strokeWidth={3}/>} 
                              TERBITKAN SEKARANG
                           </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-xl mb-10 flex items-center gap-4"><List size={28} className="text-emerald-600"/> Daftar Berita Terbit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {newsList.map((news, index) => (
                            <div key={news.id || `news-${index}`} className="bg-slate-50 dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-700 group transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className="h-48 bg-slate-200 relative overflow-hidden">
                                    {news.image_url ? (
                                        <img src={news.image_url} alt={news.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={48}/></div>
                                    )}
                                    <div className="absolute top-4 left-4 px-4 py-1.5 bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg">{news.category}</div>
                                </div>
                                <div className="p-6">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base line-clamp-2 mb-3 leading-snug group-hover:text-emerald-600 transition-colors">{news.title}</h4>
                                    <div className="flex justify-between items-center mt-6">
                                        <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{new Date(news.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
                                        <button onClick={() => handleDeleteNews(news.id, news.title)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20}/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
         )}

         {/* 2. BROADCAST & POPUP IKLAN TAB */}
         {activeTab === 'broadcast' && (
            <div className="space-y-8 animate-in fade-in">
                {/* Form Pop-up Iklan & Promosi */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-3 text-slate-800 dark:text-slate-100">
                        <Sparkles size={22} className="text-amber-500"/> Pop-up Iklan & Pemberitahuan Promosi Modal
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Buat pengumuman atau iklan banner melayang yang langsung muncul saat pengguna membuka aplikasi.
                      </p>
                    </div>
                    
                    <label className="flex items-center gap-3 cursor-pointer bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Status Pop-up: <strong className={showAdPopup ? "text-emerald-500" : "text-rose-500"}>{showAdPopup ? "AKTIF" : "NONAKTIF"}</strong>
                      </span>
                      <input 
                        type="checkbox" 
                        checked={showAdPopup} 
                        onChange={(e) => setShowAdPopup(e.target.checked)} 
                        className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Form Inputs */}
                    <form onSubmit={handleSaveAdConfig} className="lg:col-span-7 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Judul Iklan / Pemberitahuan</label>
                          <input 
                            value={adTitle} 
                            onChange={(e) => setAdTitle(e.target.value)} 
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-amber-500" 
                            placeholder="Judul iklan atau promo..."
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Label Tag / Badge</label>
                          <select 
                            value={adBadgeTag} 
                            onChange={(e) => setAdBadgeTag(e.target.value)} 
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-amber-500"
                          >
                            <option value="PROMO">PROMO</option>
                            <option value="IKLAN">IKLAN</option>
                            <option value="PEMBERITAHUAN">PEMBERITAHUAN</option>
                            <option value="EVENT">EVENT</option>
                            <option value="INFO BARU">INFO BARU</option>
                            <option value="UPDATE">UPDATE</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">URL Gambar Banner (Opsional)</label>
                        <input 
                          value={adImageUrl} 
                          onChange={(e) => setAdImageUrl(e.target.value)} 
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-amber-500" 
                          placeholder="https://... (URL gambar banner iklan)"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Isi Pesan / Deskripsi Iklan</label>
                        <textarea 
                          value={adMessage} 
                          onChange={(e) => setAdMessage(e.target.value)} 
                          className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-amber-500" 
                          rows={3} 
                          placeholder="Tuliskan deskripsi iklan/promo secara singkat dan menarik..."
                          required
                        />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Teks Tombol Aksi</label>
                          <input 
                            value={adActionText} 
                            onChange={(e) => setAdActionText(e.target.value)} 
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-amber-500 font-medium" 
                            placeholder="misal: Lihat Promo Sekarang"
                          />
                        </div>

                        {/* PILIHAN AKORDEON FITUR APLIKASI */}
                        <div className="space-y-2.5 pt-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                              Pilih Target Fitur Aplikasi (Sistem Akordeon)
                            </label>
                            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                              <Link size={12}/> Route Terpilih: <strong>{adActionUrl || '(Belum Dipilih)'}</strong>
                            </span>
                          </div>

                          {/* List Akordeon Kategori Fitur */}
                          <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 max-h-[380px] overflow-y-auto custom-scrollbar">
                            {FEATURE_ROUTE_CATEGORIES.map((cat, catIdx) => {
                              const isExpanded = openAccordionIndex === catIdx;
                              const CatIcon = cat.icon;
                              const hasActiveRoute = cat.routes.some(r => r.path === adActionUrl);

                              return (
                                <div key={cat.category} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-700/90 overflow-hidden shadow-xs transition-all">
                                  <button
                                    type="button"
                                    onClick={() => setOpenAccordionIndex(isExpanded ? null : catIdx)}
                                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                                        <CatIcon size={16} className={cat.color} />
                                      </div>
                                      <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                                        {cat.category}
                                      </span>
                                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                        {cat.routes.length} Fitur
                                      </span>
                                      {hasActiveRoute && (
                                        <span className="text-[9px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                                          Aktif
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-slate-400 p-1">
                                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                  </button>

                                  {isExpanded && (
                                    <div className="p-2.5 pt-1 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      {cat.routes.map((route) => {
                                        const isSelected = adActionUrl === route.path;
                                        return (
                                          <button
                                            key={route.path}
                                            type="button"
                                            onClick={() => setAdActionUrl(route.path)}
                                            className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 active:scale-95 cursor-pointer ${
                                              isSelected
                                                ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-400/40'
                                                : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xs'
                                            }`}
                                          >
                                            <div className="space-y-0.5 min-w-0 flex-1">
                                              <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-black truncate leading-tight">{route.name}</span>
                                              </div>
                                              <p className={`text-[10px] line-clamp-1 ${isSelected ? 'text-amber-50' : 'text-slate-400 dark:text-slate-500'}`}>
                                                {route.desc}
                                              </p>
                                              <span className={`text-[9px] font-mono block pt-0.5 ${isSelected ? 'text-amber-100 font-bold' : 'text-amber-600 dark:text-amber-400'}`}>
                                                {route.path}
                                              </span>
                                            </div>
                                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center border shrink-0 mt-0.5 transition-all ${
                                              isSelected ? 'bg-white text-amber-600 border-white shadow-xs' : 'border-slate-300 dark:border-slate-600 bg-transparent'
                                            }`}>
                                              {isSelected && <Check size={12} strokeWidth={3} />}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Input Override / Custom URL */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                            Atau Tuliskan Link / Route Custom (URL Eksternal / Khusus)
                          </label>
                          <div className="relative">
                            <input 
                              value={adActionUrl} 
                              onChange={(e) => setAdActionUrl(e.target.value)} 
                              className="w-full p-3.5 pl-10 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-mono border-none outline-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-amber-500" 
                              placeholder="misal: /wasilah-shop atau https://website-kamu.com"
                            />
                            <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <input 
                          type="checkbox" 
                          id="adDismissible" 
                          checked={adIsDismissible} 
                          onChange={(e) => setAdIsDismissible(e.target.checked)} 
                          className="w-4 h-4 accent-amber-600 rounded"
                        />
                        <label htmlFor="adDismissible" className="text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                          Pengguna dapat menutup pop-up iklan ini (Tombol "Tutup Iklan")
                        </label>
                      </div>

                      <button 
                        type="submit" 
                        disabled={savingAdConfig} 
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-[1.5rem] font-bold shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        {savingAdConfig ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                        Simpan Konfigurasi Pop-up Iklan
                      </button>
                    </form>

                    {/* Live Preview Column */}
                    <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Eye size={14} className="text-amber-500" /> Live Preview Pop-up Iklan
                      </div>

                      {/* Simulated Modal Card */}
                      <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 relative transition-all">
                        {adImageUrl ? (
                          <div className="relative h-36 w-full bg-slate-200 dark:bg-slate-800">
                            <img src={adImageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            {adBadgeTag && (
                              <span className="absolute top-3 left-3 bg-rose-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                                {adBadgeTag}
                              </span>
                            )}
                          </div>
                        ) : adBadgeTag ? (
                          <div className="pt-4 text-center">
                            <span className="inline-block bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                              {adBadgeTag}
                            </span>
                          </div>
                        ) : null}

                        <div className="p-5 text-center space-y-2">
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 leading-snug">
                            {adTitle || 'Judul Iklan / Promo'}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                            {adMessage || 'Isi deskripsi iklan akan ditampilkan di sini.'}
                          </p>

                          <div className="pt-2 space-y-1.5">
                            <div className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl text-xs font-bold shadow-md text-center">
                              {adActionText || 'Buka Link'}
                            </div>
                            {adIsDismissible && (
                              <div className="text-[10px] text-slate-400 font-semibold py-1">
                                Tutup Iklan
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 italic mt-3 text-center">
                        {showAdPopup ? "🟢 Pop-up saat ini AKTIF untuk seluruh pengguna" : "🔴 Pop-up saat ini NONAKTIF"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Kirim Broadcast Realtime */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-3"><Send size={22} className="text-rose-500"/> Kirim Broadcast / Pemberitahuan Realtime</h3>
                    <form onSubmit={handleSendBroadcast} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Judul Pesan</label><input value={broadcastForm.title} onChange={(e) => setBroadcastForm({...broadcastForm, title: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-100 dark:ring-slate-700" placeholder="Judul pengumuman..."/></div>
                            <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">URL Gambar (Opsional)</label><input value={broadcastForm.image} onChange={(e) => setBroadcastForm({...broadcastForm, image: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-100 dark:ring-slate-700" placeholder="https://..."/></div>
                        </div>
                        <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Isi Pesan</label><textarea value={broadcastForm.message} onChange={(e) => setBroadcastForm({...broadcastForm, message: e.target.value})} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl text-sm outline-none border-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-rose-300" rows={4} placeholder="Pesan pengumuman..."/></div>
                        <button type="submit" disabled={sendingBroadcast} className="w-full py-4 bg-rose-600 text-white rounded-[1.5rem] font-bold shadow-xl flex items-center justify-center gap-2">{sendingBroadcast ? <Loader2 className="animate-spin" size={20}/> : <Send size={20}/>} Kirim Broadcast</button>
                    </form>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-3"><Megaphone size={22} className="text-rose-500"/> Riwayat Broadcast</h3>
                    <div className="space-y-4">{broadcasts.map(msg => (<div key={msg.id} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 flex justify-between items-start"><div className="flex-1 min-w-0 flex gap-4">{msg.image && <img src={msg.image} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="Thumb"/>}<div className="min-w-0"><h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1 truncate">{msg.title}</h4><p className="text-xs text-slate-500 line-clamp-2">{msg.message}</p></div></div><button onClick={() => handleDeleteBroadcast(msg.id!)} className="p-2 text-red-300 hover:text-red-500 ml-4"><Trash2 size={18}/></button></div>))}{broadcasts.length === 0 && <p className="text-center py-10 text-slate-400 italic">Belum ada broadcast.</p>}</div>
                </div>
            </div>
         )}

         {/* SUPPORT CHAT TAB (Admin Side) */}
         {activeTab === 'supportchat' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[calc(100vh-160px)] md:h-[650px] animate-in fade-in">
                
                {/* Left Panel: Active Chat Threads */}
                <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col h-full overflow-hidden ${activeChatUserId ? 'hidden md:flex' : 'flex'}`}>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-6 flex items-center gap-2">
                        <MessageSquare size={18} className="text-pink-500" />
                        Obrolan Aktif ({supportChats.length})
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                        {supportChats.length === 0 ? (
                           <div className="text-center py-12 text-slate-400 dark:text-slate-500 italic text-xs">
                               Belum ada obrolan masuk.
                           </div>
                        ) : (
                          supportChats.map((chat) => {
                            const isSelected = activeChatUserId === chat.userId;
                            const isNew = chat.lastSenderId !== 'admin';
                            
                            return (
                              <button
                                key={chat.userId}
                                onClick={() => setActiveChatUserId(chat.userId)}
                                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-left border transition-all ${
                                  isSelected
                                    ? 'bg-pink-50/50 dark:bg-pink-955/20 border-pink-200 dark:border-pink-900/30 ring-1 ring-pink-100 dark:ring-pink-900/10'
                                    : 'bg-slate-50/50 dark:bg-slate-850 border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                                }`}
                              >
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 font-bold text-xs relative">
                                  {chat.userName ? chat.userName.charAt(0).toUpperCase() : 'S'}
                                  {isNew && !isSelected && (
                                    <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full animate-bounce"></span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <h4 className={`text-xs font-bold truncate ${isNew && !isSelected ? 'text-pink-600 dark:text-pink-400 font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}>
                                      {chat.userName}
                                    </h4>
                                    {chat.lastMessageTime && (
                                      <span className="text-[9px] text-slate-400 shrink-0">
                                        {chat.lastMessageTime?.seconds 
                                          ? new Date(chat.lastMessageTime.seconds * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                          : 'Baru saja'}
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-[11px] truncate mt-1 ${isNew && !isSelected ? 'text-slate-800 dark:text-slate-100 font-bold' : 'text-slate-400'}`}>
                                    {chat.lastMessage}
                                  </p>
                                </div>
                              </button>
                            );
                          })
                        )}
                    </div>
                </div>

                {/* Right Panel: Selected Chat Room */}
                <div className={`md:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col h-full relative ${!activeChatUserId ? 'hidden md:flex' : 'flex'}`}>
                  {activeChatUserId ? (
                    <>
                      {/* Active Chat Header */}
                      <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/35 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <button
                               onClick={() => setActiveChatUserId(null)}
                               className="md:hidden p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
                               title="Kembali ke Daftar Obrolan"
                            >
                               <ArrowLeft size={16} />
                            </button>
                            <div>
                               <h4 className="text-xs font-bold text-slate-800 dark:text-slate-150">
                                 {supportChats.find(c => c.userId === activeChatUserId)?.userName || 'Obrolan'}
                               </h4>
                               <p className="text-[9px] text-slate-400 font-medium">UserId: {activeChatUserId}</p>
                            </div>
                         </div>
                         <button 
                            onClick={() => setActiveChatUserId(null)}
                            className="hidden md:block text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                         >
                            Tutup
                         </button>
                      </div>

                      {/* Active Chat Panel Messages */}
                      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/10 dark:bg-slate-950/20 no-scrollbar">
                         {activeChatMessages.map((msg, idx) => {
                            const isMe = msg.senderId === 'admin';
                            return (
                              <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[80%] rounded-[1.5rem] p-4 shadow-sm ${
                                   isMe 
                                     ? 'bg-pink-600 text-white rounded-br-sm' 
                                     : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800/80 rounded-bl-sm'
                                 }`}>
                                    {msg.imageUrl && (
                                      <div 
                                        className="mb-2 rounded-2xl overflow-hidden cursor-pointer group relative border border-black/10 dark:border-white/10"
                                        onClick={() => setAdminChatImageModal(msg.imageUrl || null)}
                                      >
                                        <img 
                                          src={msg.imageUrl} 
                                          alt="Lampiran Chat" 
                                          className="max-h-60 w-full object-cover rounded-2xl group-hover:scale-[1.02] transition-transform duration-200" 
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                          <Maximize2 size={22} className="drop-shadow-md" />
                                        </div>
                                      </div>
                                    )}
                                    {msg.content && (
                                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    )}
                                    <p className={`text-[9px] text-right mt-1.5 font-medium ${isMe ? 'text-pink-100' : 'text-slate-400'}`}>
                                      {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' }) : 'Baru saja'}
                                    </p>
                                 </div>
                              </div>
                            );
                         })}
                         <div ref={adminChatEndRef} />
                      </div>

                      {/* Active Chat Panel Input */}
                      <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                        {adminChatImage && (
                          <div className="p-2 mb-2 relative inline-block bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <img src={adminChatImage} alt="Pratinjau Gambar Admin" className="h-20 w-auto rounded-xl object-cover" />
                            <button
                              type="button"
                              onClick={() => setAdminChatImage(null)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors"
                              title="Hapus gambar"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}

                        <form onSubmit={handleSendAdminReply} className="flex items-end gap-3">
                           <input 
                             type="file" 
                             ref={adminFileInputRef} 
                             onChange={handleAdminImageSelect} 
                             accept="image/*" 
                             className="hidden" 
                           />

                           <button
                             type="button"
                             onClick={() => adminFileInputRef.current?.click()}
                             disabled={sendingReply}
                             className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-pink-600 transition-colors flex items-center justify-center shrink-0 mb-0.5 cursor-pointer"
                             title="Kirim Gambar"
                           >
                             <ImageIcon size={18} />
                           </button>

                           <textarea
                             value={adminReplyText}
                             onChange={(e) => {
                               setAdminReplyText(e.target.value);
                               e.target.style.height = 'auto';
                               e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                             }}
                             onKeyDown={(e) => {
                               if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                 e.preventDefault();
                                 handleSendAdminReply(e);
                               }
                             }}
                             placeholder="Ketik balasan admin... (Tekan Enter untuk baris baru)"
                             disabled={sendingReply}
                             rows={1}
                             className="flex-1 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-2xl text-xs outline-none text-slate-850 dark:text-slate-150 placeholder:text-slate-400 resize-none max-h-32 min-h-[40px] no-scrollbar"
                           />
                           
                           <button
                             type="submit"
                             disabled={sendingReply || (!adminReplyText.trim() && !adminChatImage)}
                             className="w-11 h-11 rounded-full bg-pink-600 hover:bg-pink-700 hover:scale-105 active:scale-95 disabled:opacity-40 transition-all text-white flex items-center justify-center shrink-0 shadow-lg shadow-pink-100 dark:shadow-none mb-0.5 cursor-pointer"
                           >
                              {sendingReply ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                           </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                       <div className="w-14 h-14 bg-pink-50 dark:bg-pink-900/10 text-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm animate-bounce">
                          <MessageSquare size={28} />
                       </div>
                       <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">Pilih Obrolan</h4>
                       <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-xs">
                          Klik salah satu obrolan pengguna di sebelah kiri untuk melihat pesan masuk dan mengirimkan balasan langsung.
                       </p>
                    </div>
                  )}
                </div>

            </div>
         )}

         {/* TAB: KATALOG PRODUK TOKO SANTRI */}
         {activeTab === 'tokoproducts' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-lg flex items-center gap-2.5 text-slate-900 dark:text-white">
                      <Store size={22} className="text-orange-500" />
                      <span>Katalog Produk Toko Santri AI</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kelola semua produk yang dijual santri & pengguna di marketplace Toko Santri
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 rounded-2xl text-xs font-bold border border-orange-200 dark:border-orange-800">
                      Total: {adminProducts.length} Produk
                    </span>
                  </div>
                </div>

                {/* Search & Category Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={adminProductSearch}
                      onChange={(e) => setAdminProductSearch(e.target.value)}
                      placeholder="Cari nama produk, deskripsi, atau nama penjual..."
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs outline-none border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[
                      { id: 'semua', label: 'Semua Kategori' },
                      { id: 'kitab', label: 'Kitab & Buku' },
                      { id: 'busana', label: 'Busana Muslim' },
                      { id: 'sholat', label: 'Perlengkapan Sholat' },
                      { id: 'herbal', label: 'Herbal & Thibb' },
                      { id: 'aksesoris', label: 'Aksesoris & Lainnya' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setAdminProductCategoryFilter(cat.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          adminProductCategoryFilter === cat.id
                            ? 'bg-orange-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Grid / List */}
                {(() => {
                  const filtered = adminProducts.filter((p) => {
                    const matchCategory =
                      adminProductCategoryFilter === 'semua' || p.category === adminProductCategoryFilter;
                    const matchSearch =
                      !adminProductSearch ||
                      p.name?.toLowerCase().includes(adminProductSearch.toLowerCase()) ||
                      p.sellerName?.toLowerCase().includes(adminProductSearch.toLowerCase()) ||
                      p.description?.toLowerCase().includes(adminProductSearch.toLowerCase());
                    return matchCategory && matchSearch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                        <Store size={36} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-xs text-slate-500 font-bold">Tidak ada produk ditemukan</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                      {filtered.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3 hover:border-orange-300 transition-all shadow-xs"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={prod.imageUrl || (prod.imageUrls && prod.imageUrls[0]) || 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&q=80&w=200'}
                              alt={prod.name}
                              className="w-16 h-16 rounded-2xl object-cover bg-slate-200 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 rounded-full inline-block mb-1">
                                {prod.category || 'Umum'}
                              </span>
                              <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white">{prod.name}</h4>
                              <p className="text-sm font-black text-[#EE4D2D]">
                                Rp{Number(prod.price || 0).toLocaleString('id-ID')}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                Penjual: <span className="font-semibold text-slate-700 dark:text-slate-300">{prod.sellerName || 'Santri Seller'}</span>
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg">
                              Stok: {prod.stock ?? 10}
                            </span>
                            <button
                              onClick={() => handleDeleteAdminProduct(prod.id, prod.name)}
                              className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors flex items-center gap-1"
                            >
                              <Trash2 size={14} />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB: LAPORAN PRODUK TOKO SANTRI */}
          {activeTab === 'tokoreports' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-lg flex items-center gap-2.5 text-slate-900 dark:text-white">
                      <AlertTriangle size={22} className="text-rose-500" />
                      <span>Laporan Produk Toko Santri AI</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daftar pelaporan produk bermasalah dari pengguna untuk ditinjau oleh Admin
                    </p>
                  </div>
                  <span className="px-3 py-1.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-bold border border-rose-200 dark:border-rose-800 w-fit">
                    Total Laporan: {adminReports.length}
                  </span>
                </div>

                {adminReports.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                    <CheckCircle size={40} className="mx-auto text-emerald-500 mb-2" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Tidak ada laporan produk bermasalah saat ini</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Semua produk di Toko Santri AI terpantau aman dan kondusif.</p>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    {adminReports.map((rep) => {
                      const isPending = rep.status === 'pending';
                      return (
                        <div
                          key={rep.id}
                          className={`p-5 rounded-3xl border transition-all ${
                            isPending
                              ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-75'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-2 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    isPending
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-emerald-600 text-white'
                                  }`}
                                >
                                  {isPending ? 'Perlu Ditinjau' : 'Selesai'}
                                </span>
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                  Alasan: <span className="text-rose-600 dark:text-rose-400">{rep.reason}</span>
                                </span>
                              </div>

                              {rep.note && (
                                <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                                  "{rep.note}"
                                </p>
                              )}

                              <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                                <span>Pelapor: <strong className="text-slate-700 dark:text-slate-200">{rep.reporterName}</strong></span>
                                <span>•</span>
                                <span>
                                  {rep.createdAt?.seconds
                                    ? new Date(rep.createdAt.seconds * 1000).toLocaleString('id-ID')
                                    : 'Baru saja'}
                                </span>
                              </div>
                            </div>

                            {/* Reported Product Box */}
                            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 min-w-[240px] flex items-center gap-3">
                              <img
                                src={rep.productImage || 'https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&q=80&w=200'}
                                alt={rep.productName}
                                className="w-12 h-12 rounded-xl object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{rep.productName || 'Nama Produk'}</h5>
                                <p className="text-[11px] font-black text-[#EE4D2D]">
                                  Rp{Number(rep.productPrice || 0).toLocaleString('id-ID')}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">Penjual: {rep.sellerName}</p>
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2">
                            <button
                              onClick={() => handleDismissReport(rep.id)}
                              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-300 transition-colors"
                            >
                              Abaikan / Hapus Laporan
                            </button>

                            {isPending && (
                              <button
                                onClick={() => handleResolveReport(rep.id)}
                                className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-1"
                              >
                                <Check size={14} />
                                <span>Tandai Selesai</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteReportAndProduct(rep.id, rep.productId, rep.productName)}
                              className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 shadow-sm transition-colors flex items-center gap-1"
                            >
                              <Trash2 size={14} />
                              <span>Hapus Produk & Selesaikan</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. MUTIARA TAB */}
         {activeTab === 'mutiara' && (
            <div className="space-y-8 animate-in fade-in">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg flex items-center gap-3"><Plus size={22} className="text-amber-500"/> Tambah Mutiara Hikmah</h3>
                        <button 
                            type="button" 
                            onClick={handleAiGenerateMutiara} 
                            disabled={aiMutiaraLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-200 transition-all disabled:opacity-50"
                        >
                            {aiMutiaraLoading ? <Loader2 className="animate-spin" size={14}/> : <Wand2 size={14}/>}
                            Bantu Buat dengan AI
                        </button>
                    </div>
                    
                    <div className="mb-6 flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-2xl w-fit">
                        <button className="px-5 py-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-xs font-bold text-amber-600 flex items-center gap-2">
                           <Quote size={14} /> Kutipan Teks
                        </button>
                    </div>

                    <form onSubmit={handleSaveMutiara} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">NAMA ULAMA/TOKOH</label><input value={mutiaraForm.scholar} onChange={e => setMutiaraForm({...mutiaraForm, scholar: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-100 dark:ring-slate-700" placeholder="Contoh: Gus Baha"/></div>
                            <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">GELAR/JABATAN</label><input value={mutiaraForm.role} onChange={e => setMutiaraForm({...mutiaraForm, role: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-100 dark:ring-slate-700" placeholder="Contoh: Rais Syuriyah PBNU"/></div>
                        </div>

                        <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">ISI KUTIPAN</label><textarea value={mutiaraForm.content} onChange={e => setMutiaraForm({...mutiaraForm, content: e.target.value})} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl text-sm outline-none border-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-amber-300" rows={4} placeholder="Tulis mutiara hikmah..."/></div>
                        
                        <div className="pt-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-4 block flex items-center gap-2">
                                <Palette size={14} className="text-amber-500" /> PILIH TEMA VISUAL
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4">
                                {QUOTE_THEMES.map(theme => (
                                    <button 
                                        key={theme.id} 
                                        type="button" 
                                        onClick={() => setMutiaraForm({...mutiaraForm, theme: theme.id})} 
                                        className={`h-20 rounded-2xl border-4 transition-all relative overflow-hidden flex flex-col items-center justify-center group ${theme.class.split(' ')[0]} ${mutiaraForm.theme === theme.id ? 'border-amber-500 scale-105 shadow-xl ring-4 ring-amber-100 dark:ring-amber-900/30 z-10' : 'border-white dark:border-slate-700 opacity-80 hover:opacity-100 shadow-sm'}`}
                                    >
                                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
                                        <div className="flex flex-col items-center gap-1 z-10">
                                            {mutiaraForm.theme === theme.id ? <CheckCircle size={24} className="drop-shadow-md opacity-90" /> : <div className="w-6 h-6 rounded-full border-2 border-current opacity-40" />}
                                            <span className="text-[9px] font-black uppercase tracking-tighter drop-shadow-md">{theme.name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <button type="submit" disabled={savingMutiara} className="w-full py-5 bg-amber-600 text-white rounded-[1.5rem] font-black shadow-xl flex items-center justify-center gap-2 hover:bg-amber-700 transition-all active:scale-95 text-base">
                           {savingMutiara ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>} PUBLIKASIKAN MUTIARA
                        </button>
                    </form>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-3"><List size={22} className="text-amber-500"/> Daftar Mutiara</h3>
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left">
                            <thead><tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-50 dark:border-slate-800"><th className="px-4 py-4">Tokoh</th><th className="px-4 py-4">Tema</th><th className="px-4 py-4">Isi Kutipan</th><th className="px-4 py-4 text-center">Aksi</th></tr></thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {mutiaraList.map((item, index) => (
                                    <tr key={item.id || `mutiara-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                        <td className="px-4 py-4 min-w-[120px]"><p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.scholar}</p><p className="text-[10px] text-slate-400">{item.role}</p></td>
                                        <td className="px-4 py-4">
                                            <div className={`w-10 h-10 rounded-xl shadow-sm border border-white/20 ${QUOTE_THEMES.find(t => t.id === item.theme)?.class.split(' ')[0] || 'bg-slate-200'}`} />
                                        </td>
                                        <td className="px-4 py-4 max-w-[200px]"><p className="text-xs text-slate-600 dark:text-slate-400 truncate">{item.content}</p></td>
                                        <td className="px-4 py-4 text-center"><button onClick={() => handleDeleteMutiara(item.id!, item.scholar)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 size={18}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {mutiaraList.length === 0 && <p className="text-center py-10 text-slate-400 italic text-sm">Belum ada konten mutiara.</p>}
                    </div>
                </div>
            </div>
         )}

          {/* 4. USERS TAB */}
          {activeTab === 'users' && (() => {
             const rawOnlineCount = users.filter(u => getUserOnlineInfo(u).isOnline).length;
             const onlineCount = Number(`1${rawOnlineCount > 0 ? rawOnlineCount : 1}`);
             const activeCount = users.filter(u => u.status === 'Active').length;
             const bannedCount = users.filter(u => u.status === 'Banned').length;

             const filteredUsers = users.filter((u) => {
               const name = (u.displayName || 'Santri').toLowerCase();
               const email = (u.email || '').toLowerCase();
               const term = userSearchTerm.toLowerCase();
               const matchesSearch = name.includes(term) || email.includes(term);

               if (!matchesSearch) return false;

               const onlineInfo = getUserOnlineInfo(u);
               if (userFilterTab === 'online') return onlineInfo.isOnline;
               if (userFilterTab === 'active') return u.status === 'Active';
               if (userFilterTab === 'banned') return u.status === 'Banned';
               return true;
             });

             return (
               <div className="space-y-6 bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in">
                   {/* HEADER & SUMMARY STATS */}
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                       <div>
                           <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                              <Users className="text-blue-500" size={28} />
                              Daftar Pengguna Santri
                           </h2>
                           <p className="text-xs text-slate-400 mt-1 font-medium">
                              Kelola seluruh akun santri, pantau status kehadiran online, dan hak akses aplikasi.
                           </p>
                       </div>
                       <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                          <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-900">
                             Total: {users.length} Santri
                          </span>
                          <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 rounded-xl border border-emerald-100 dark:border-emerald-900 flex items-center gap-1.5">
                             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                             Online: {onlineCount}
                          </span>
                       </div>
                   </div>

                   {/* FILTER TABS & SEARCH */}
                   <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                       {/* FILTER TABS */}
                       <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
                           {[
                              { id: 'all', label: `Semua (${users.length})` },
                              { id: 'online', label: `🟢 Online (${onlineCount})` },
                              { id: 'active', label: `Aktif (${activeCount})` },
                              { id: 'banned', label: `🚫 Diblokir (${bannedCount})` },
                           ].map((tab) => (
                              <button
                                 key={tab.id}
                                 onClick={() => setUserFilterTab(tab.id as any)}
                                 className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    userFilterTab === tab.id
                                       ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm'
                                       : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                 }`}
                              >
                                 {tab.label}
                              </button>
                           ))}
                       </div>

                       {/* SEARCH INPUT */}
                       <div className="relative w-full md:w-80">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                           <input 
                              type="text" 
                              value={userSearchTerm} 
                              onChange={(e) => setUserSearchTerm(e.target.value)} 
                              placeholder="Cari nama atau email santri..." 
                              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm outline-none border border-slate-200/80 dark:border-slate-700 focus:border-blue-500 transition-all"
                           />
                           {userSearchTerm && (
                              <button onClick={() => setUserSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                 <X size={16} />
                              </button>
                           )}
                       </div>
                   </div>

                   {/* USERS TABLE */}
                   <div className="overflow-x-auto no-scrollbar rounded-2xl border border-slate-100 dark:border-slate-800">
                       <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="bg-slate-50/80 dark:bg-slate-800/60 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                 <th className="px-5 py-4">Santri</th>
                                 <th className="px-5 py-4">Terakhir Online</th>
                                 <th className="px-5 py-4">Poin & Wasilah</th>
                                 <th className="px-5 py-4">Status</th>
                                 <th className="px-5 py-4 text-center">Aksi</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                              {filteredUsers.map((u) => {
                                 const onlineInfo = getUserOnlineInfo(u);
                                 const isBanned = u.status === 'Banned';

                                 return (
                                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors text-sm">
                                       {/* SANTRI INFO */}
                                       <td className="px-5 py-4">
                                          <div className="flex items-center gap-3.5">
                                             <div className="relative shrink-0">
                                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm overflow-hidden shadow-xs border border-blue-100 dark:border-slate-700">
                                                   {u.photoURL ? (
                                                      <img src={u.photoURL} alt={u.displayName || 'Santri'} className="w-full h-full object-cover" />
                                                   ) : (
                                                      (u.displayName?.[0] || 'S').toUpperCase()
                                                   )}
                                                </div>
                                                <span 
                                                   className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                                                      onlineInfo.isOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                                                   }`} 
                                                   title={onlineInfo.isOnline ? 'Online Sekarang' : 'Offline'}
                                                />
                                             </div>
                                             <div className="min-w-0 max-w-[200px] md:max-w-[280px]">
                                                <div className="flex items-center gap-2">
                                                   <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{u.displayName || 'Santri AI'}</p>
                                                   {u.role === 'admin' && (
                                                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 rounded-md">Admin</span>
                                                   )}
                                                </div>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{u.email || 'Tanpa Email'}</p>
                                             </div>
                                          </div>
                                       </td>

                                       {/* TERAKHIR ONLINE */}
                                       <td className="px-5 py-4">
                                          {onlineInfo.isOnline ? (
                                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                Online Sekarang
                                             </span>
                                          ) : (
                                             <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                <Calendar size={14} className="text-slate-400 shrink-0" />
                                                {onlineInfo.label}
                                             </span>
                                          )}
                                       </td>

                                       {/* POIN & WASILAH */}
                                       <td className="px-5 py-4">
                                          <div className="flex items-center gap-3">
                                             <div>
                                                <span className="text-xs font-bold text-amber-500 dark:text-amber-400 font-mono">{(u.points || 0).toLocaleString()}</span>
                                                <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-tight">Poin</span>
                                             </div>
                                             <div className="h-6 w-[1px] bg-slate-100 dark:bg-slate-800" />
                                             <div>
                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{u.wasilah || 0}</span>
                                                <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-tight">Wasilah</span>
                                             </div>
                                          </div>
                                       </td>

                                       {/* STATUS */}
                                       <td className="px-5 py-4">
                                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                             isBanned 
                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900' 
                                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                                          }`}>
                                             {isBanned ? 'Diblokir' : 'Aktif'}
                                          </span>
                                       </td>

                                       {/* AKSI */}
                                       <td className="px-5 py-4 text-center">
                                          <div className="flex items-center justify-center gap-1.5">
                                             <button 
                                                onClick={() => handleOpenEditUser(u)}
                                                className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:hover:bg-amber-900 dark:text-amber-300 transition-all"
                                                title="Edit Santri (Wasilah, Poin, Peran, Status)"
                                             >
                                                <Pencil size={16} />
                                             </button>
                                             <button 
                                                onClick={() => {
                                                   setActiveChatUserId(u.id);
                                                   setActiveTab('supportchat');
                                                }}
                                                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:hover:bg-blue-900 dark:text-blue-300 transition-all"
                                                title="Kirim pesan / Chat"
                                             >
                                                <MessageSquare size={16} />
                                             </button>
                                             <button 
                                                onClick={() => {
                                                   if (window.confirm(`Apakah Anda yakin ingin ${isBanned ? 'membuka blokir' : 'memblokir'} santri (${u.displayName || u.email})?`)) {
                                                      handleUpdateUserStatus(u.id, isBanned ? 'Active' : 'Banned');
                                                   }
                                                }} 
                                                className={`p-2 rounded-xl transition-all ${
                                                   isBanned 
                                                      ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300' 
                                                      : 'text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300'
                                                }`}
                                                title={isBanned ? 'Buka Blokir' : 'Blokir Santri'}
                                             >
                                                {isBanned ? <ShieldCheck size={16}/> : <Ban size={16}/>}
                                             </button>
                                          </div>
                                       </td>
                                    </tr>
                                 );
                              })}
                           </tbody>
                       </table>

                       {filteredUsers.length === 0 && (
                          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                             <Users size={32} className="mx-auto mb-2 opacity-40" />
                             <p className="text-sm font-semibold">Tidak ada data pengguna ditemukan.</p>
                             <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau tab filter.</p>
                          </div>
                       )}
                   </div>
               </div>
             );
          })()}

         {/* 5. PUSTAKA TAB */}
         {activeTab === 'pustaka' && (
            <div className="space-y-8 bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-4"><BookOpen size={28} className="text-emerald-500" /> Pustaka Kitab</h2>
                        <p className="text-xs text-slate-400 font-medium mt-1">Kelola database Kitab Kuning di GitHub.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <button onClick={loadPublicBooks} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><RefreshCw size={20} className={loadingPustaka ? 'animate-spin' : ''} /></button>
                    </div>
                </div>

                {loadingPustaka ? (
                  <div className="py-20 scale-75">
                    <CustomLoader message="Sedang Sinkronisasi Maktabah..." />
                  </div>
                ) : publicBooks.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 italic font-medium">
                    Belum ada kitab tersimpan di GitHub.
                  </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {publicBooks.map((book: any) => (
                            <div key={book.id || book.profile?.name} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-transparent hover:border-emerald-200 transition-all relative group">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-16 bg-white dark:bg-slate-700 rounded-xl shadow-sm flex items-center justify-center text-emerald-600 border border-slate-100 dark:border-slate-600"><BookOpen size={28}/></div>
                                    <div className="flex-1 min-w-0 pr-8">
                                        <h4 className="font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1">{book.profile?.name || book.name}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold mb-3 uppercase tracking-widest">{book.profile?.originalTitle || 'Kitab Kuning'}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">{book.chapters?.length || 0} BAB</span>
                                            <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Cloud Storage</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDeleteBook(book.id || book.profile?.name, book.profile?.name || book.name)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
         )}

         {/* 6. BANK SOAL TAB */}
         {activeTab === 'quiz' && (
            <div className="space-y-8 animate-in fade-in">
                {/* Header & Stats */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                               <Brain className="text-purple-500" size={28} /> Bank Soal & Koreksi Jawaban
                            </h2>
                            <p className="text-slate-400 text-xs mt-1">
                                Total {quizList.length} soal tersimpan di database. Kelola, tinjau jumlah per kategori, dan koreksi jawaban jika ada yang tidak sesuai.
                            </p>
                        </div>
                    </div>

                    {/* Category Counts Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
                        <button
                          onClick={() => setSelectedQuizCategoryFilter('semua')}
                          className={`p-4 rounded-2xl border text-left transition-all ${selectedQuizCategoryFilter === 'semua' ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-purple-300'}`}
                        >
                           <span className="text-[10px] uppercase font-bold opacity-80 block mb-1">Semua Kategori</span>
                           <span className="text-2xl font-black">{quizList.length} Soal</span>
                        </button>
                        {QUIZ_TOPICS.map(topic => {
                           const count = quizList.filter(q => matchesTopic(q.topic, topic.id)).length;
                           const isSelected = selectedQuizCategoryFilter === topic.id;
                           return (
                               <button
                                 key={topic.id}
                                 onClick={() => {
                                    setSelectedQuizCategoryFilter(topic.id);
                                    setQuizForm(prev => ({ ...prev, topic: topic.id }));
                                 }}
                                 className={`p-4 rounded-2xl border text-left transition-all ${isSelected ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-purple-300'}`}
                               >
                                  <span className="text-[10px] uppercase font-bold opacity-80 block mb-1 truncate">{topic.label}</span>
                                  <span className="text-2xl font-black">{count} Soal</span>
                               </button>
                           );
                        })}
                    </div>
                </div>

                {/* Tambah Soal Baru Form */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-3"><Plus size={22} className="text-santri-green"/> Tambah Soal Baru</h3>
                    <form onSubmit={handleSaveQuiz} className="space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Kategori Soal</label>
                          <select value={quizForm.topic} onChange={(e) => setQuizForm({...quizForm, topic: e.target.value})} className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-100 dark:ring-slate-700 mb-6">
                              {QUIZ_TOPICS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                          </select>
                          
                          <button type="button" onClick={handleAiGenerateQuiz} disabled={aiQuizLoading} className="w-full py-4 bg-purple-100 text-purple-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-sm hover:bg-purple-200 transition-all disabled:opacity-50">
                              {aiQuizLoading ? <Loader2 size={20} className="animate-spin text-purple-700"/> : <Wand2 size={20} className="text-purple-700"/>} 
                              <span>Bantu Buat Soal Unik AI</span>
                          </button>
                        </div>

                        <div className="space-y-4">
                          <textarea value={quizForm.question} onChange={(e) => setQuizForm({...quizForm, question: e.target.value})} className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl text-sm outline-none border-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-santri-green/30" rows={3} placeholder="Ketik Pertanyaan..."/>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[
                                { key: 'optionA', label: 'A' },
                                { key: 'optionB', label: 'B' },
                                { key: 'optionC', label: 'C' },
                                { key: 'optionD', label: 'D' }
                              ].map((opt, i) => (
                                  <div key={opt.key} className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-santri-green/40 text-xs">{opt.label}</span>
                                      <input 
                                        value={(quizForm as any)[opt.key]} 
                                        onChange={(e) => setQuizForm({...quizForm, [opt.key]: e.target.value})} 
                                        className="w-full pl-10 pr-12 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm outline-none border-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-santri-green/30" 
                                        placeholder="Ketik Jawaban..."
                                      />
                                      <button type="button" onClick={() => setQuizForm({...quizForm, correctAnswer: i})} className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${quizForm.correctAnswer === i ? 'bg-green-500 text-white shadow-md' : 'text-slate-200 hover:text-slate-400'}`}>
                                        <Check size={16} strokeWidth={4} />
                                      </button>
                                  </div>
                              ))}
                          </div>

                          <input 
                            value={quizForm.explanation} 
                            onChange={(e) => setQuizForm({...quizForm, explanation: e.target.value})} 
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm outline-none border-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-santri-green/30" 
                            placeholder="Penjelasan / Referensi / Syarah (Opsional)..."
                          />
                        </div>

                        <button type="submit" className="w-full py-5 bg-santri-green text-white rounded-3xl font-black shadow-xl shadow-green-100 dark:shadow-none hover:bg-green-700 active:scale-[0.98] transition-all">Simpan Soal</button>
                    </form>
                </div>

                {/* List of Questions with Category Filter & Search */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <h3 className="font-bold text-lg flex items-center gap-3">
                            <List size={22} className="text-purple-500"/> 
                            Daftar Pertanyaan ({quizList.filter(q => (selectedQuizCategoryFilter === 'semua' || matchesTopic(q.topic, selectedQuizCategoryFilter)) && (!quizSearchQuery || q.question.toLowerCase().includes(quizSearchQuery.toLowerCase()))).length})
                        </h3>
                        
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="text"
                              value={quizSearchQuery}
                              onChange={(e) => setQuizSearchQuery(e.target.value)}
                              placeholder="Cari teks soal..."
                              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {quizList
                          .filter(q => (selectedQuizCategoryFilter === 'semua' || matchesTopic(q.topic, selectedQuizCategoryFilter)) && (!quizSearchQuery || q.question.toLowerCase().includes(quizSearchQuery.toLowerCase())))
                          .map((q, idx) => {
                             const topicObj = QUIZ_TOPICS.find(t => t.id === q.topic || matchesTopic(q.topic, t.id));
                             return (
                                 <div key={q.id || idx} className="p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-3 relative group">
                                     <div className="flex items-center justify-between gap-2">
                                         <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-purple-100 text-purple-700 rounded-xl">
                                             {topicObj?.label || q.topic || 'Umum'}
                                         </span>
                                         <div className="flex items-center gap-2">
                                             <button onClick={() => setEditingQuiz({...q})} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-200 transition-colors flex items-center gap-1.5">
                                                 Koreksi / Edit
                                             </button>
                                             <button onClick={() => handleDeleteQuizItem(q.id)} className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors">
                                                 <Trash2 size={16}/>
                                             </button>
                                         </div>
                                     </div>

                                     <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                                         {idx + 1}. {q.question}
                                     </h4>

                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                         {q.options && q.options.map((opt: string, optIdx: number) => {
                                             const isCorrect = q.correctAnswer === optIdx;
                                             const optLabel = ['A', 'B', 'C', 'D'][optIdx] || String.fromCharCode(65 + optIdx);
                                             return (
                                                 <div key={optIdx} className={`p-3 rounded-2xl text-xs flex items-center justify-between border ${isCorrect ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800 text-green-800 dark:text-green-300 font-extrabold' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}>
                                                     <span className="truncate pr-2">
                                                         <span className="font-black mr-2 opacity-60">{optLabel}.</span>
                                                         {opt}
                                                     </span>
                                                     {isCorrect && (
                                                         <span className="flex items-center gap-1 text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-lg shrink-0">
                                                             <Check size={12} strokeWidth={3} /> Benar
                                                         </span>
                                                     )}
                                                 </div>
                                             );
                                         })}
                                     </div>

                                     {q.explanation && (
                                         <div className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                                             <span className="font-bold text-purple-600 dark:text-purple-400">Penjelasan / Syarah:</span> {q.explanation}
                                         </div>
                                     )}
                                 </div>
                             );
                        })}

                        {quizList.filter(q => (selectedQuizCategoryFilter === 'semua' || matchesTopic(q.topic, selectedQuizCategoryFilter)) && (!quizSearchQuery || q.question.toLowerCase().includes(quizSearchQuery.toLowerCase()))).length === 0 && (
                            <div className="py-12 text-center text-slate-400 text-sm font-medium">
                                Tidak ada soal ditemukan pada kategori atau pencarian ini.
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Quiz Modal */}
                {editingQuiz && (
                    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 max-w-2xl w-full border border-slate-100 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    ✏️ Koreksi / Edit Soal Kuis
                                </h3>
                                <button onClick={() => setEditingQuiz(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateQuiz} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Kategori</label>
                                    <select
                                      value={editingQuiz.topic || 'fiqh'}
                                      onChange={(e) => setEditingQuiz({...editingQuiz, topic: e.target.value})}
                                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700"
                                    >
                                        {QUIZ_TOPICS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Pertanyaan</label>
                                    <textarea
                                      value={editingQuiz.question || ''}
                                      onChange={(e) => setEditingQuiz({...editingQuiz, question: e.target.value})}
                                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm outline-none border-none ring-1 ring-slate-200 dark:ring-slate-700"
                                      rows={3}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Pilihan Jawaban (Klik centang untuk menandai jawaban benar)</label>
                                    {editingQuiz.options && editingQuiz.options.map((opt: string, optIdx: number) => {
                                        const optLabel = ['A', 'B', 'C', 'D'][optIdx];
                                        const isCorrect = editingQuiz.correctAnswer === optIdx;
                                        return (
                                            <div key={optIdx} className="relative flex items-center">
                                                <span className="absolute left-4 font-black text-slate-400 text-xs">{optLabel}</span>
                                                <input
                                                  type="text"
                                                  value={opt}
                                                  onChange={(e) => {
                                                      const newOpts = [...editingQuiz.options];
                                                      newOpts[optIdx] = e.target.value;
                                                      setEditingQuiz({...editingQuiz, options: newOpts});
                                                  }}
                                                  className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm outline-none border-none ring-1 ring-slate-200 dark:ring-slate-700"
                                                />
                                                <button
                                                  type="button"
                                                  onClick={() => setEditingQuiz({...editingQuiz, correctAnswer: optIdx})}
                                                  className={`absolute right-3 p-1.5 rounded-xl transition-all ${isCorrect ? 'bg-green-500 text-white shadow-md' : 'text-slate-300 hover:text-slate-500 bg-slate-200/50 dark:bg-slate-700'}`}
                                                  title="Tandai sebagai jawaban benar"
                                                >
                                                    <Check size={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Penjelasan / Syarah</label>
                                    <input
                                      type="text"
                                      value={editingQuiz.explanation || ''}
                                      onChange={(e) => setEditingQuiz({...editingQuiz, explanation: e.target.value})}
                                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm outline-none border-none ring-1 ring-slate-200 dark:ring-slate-700"
                                      placeholder="Penjelasan jawaban..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingQuiz(null)}
                                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                      type="submit"
                                      className="flex-1 py-4 bg-santri-green text-white rounded-2xl font-black text-sm shadow-lg shadow-green-600/20"
                                    >
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
         )}

         {/* 7. REDEMPTION TAB */}
         {activeTab === 'redemption' && (
            <div className="space-y-6 animate-in fade-in">
                <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 w-fit mb-8 shadow-sm">
                    <button onClick={() => setRedemptionView('requests')} className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all ${redemptionView === 'requests' ? 'bg-santri-green text-white shadow-lg shadow-green-100' : 'text-slate-500 hover:bg-slate-50'}`}>Permintaan Tukar</button>
                    <button onClick={() => setRedemptionView('catalog')} className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all ${redemptionView === 'catalog' ? 'bg-santri-green text-white shadow-lg shadow-green-100' : 'text-slate-500 hover:bg-slate-50'}`}>Katalog Hadiah</button>
                </div>
                {redemptionView === 'requests' ? (
                    <div className="space-y-4">
                        {redemptions.map(r => (
                            <div key={r.id} className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-[1.2rem] bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center border border-amber-100 dark:border-amber-900/50"><ShoppingBag size={24}/></div>
                                    <div><h4 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight mb-1">{r.rewardName}</h4><p className="text-[10px] text-slate-400">Oleh {r.userName} • {r.pointsCost} Poin</p></div>
                                </div>
                                {r.status === 'Pending' ? (
                                    <div className="flex gap-2"><button onClick={() => handleApproveRedemption(r.id!)} className="px-5 py-2.5 bg-green-500 text-white rounded-xl font-bold text-xs">Selesaikan</button><button onClick={() => handleRejectRedemption(r.id!)} className="px-5 py-2.5 bg-red-50 text-red-500 rounded-xl font-bold text-xs">Tolak</button></div>
                                ) : (<span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${r.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-8">
                        <button onClick={() => { setRewardForm({name:'', points:'', icon:''}); setShowRewardModal(true); }} className="w-full p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] text-slate-400 font-bold flex flex-col items-center gap-2 hover:text-santri-green transition-all"><Plus size={32}/> Tambah Hadiah</button>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                            {rewards.map(r => (
                                <div key={r.id} className="p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col items-center relative group shadow-sm"><button onClick={() => deleteReward(r.id!)} className="absolute top-4 right-4 p-2 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button><div className="w-20 h-20 mb-4 bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center">{(r.icon && (r.icon.startsWith('data:') || r.icon.startsWith('http'))) ? <img src={r.icon} className="w-full h-full object-cover" alt={r.name} /> : <span className="text-4xl">{r.icon || '🎁'}</span>}</div><h4 className="font-bold text-slate-800 dark:text-slate-100 text-center text-sm mb-2">{r.name}</h4><div className="bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full text-amber-700 font-black text-xs">{r.points.toLocaleString()} Poin</div></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
         )}

         {/* 8. AICACHE TAB */}
         {activeTab === 'aicache' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in">
                <div className="flex justify-between items-center mb-8"><div><h2 className="text-2xl font-bold">Memory AI</h2></div><button onClick={loadAiCache} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 transition-colors"><RefreshCw size={20} className={loadingAiCache ? 'animate-spin' : ''}/></button></div>
                {loadingAiCache ? (
                  <div className="py-12 scale-75">
                    <CustomLoader message="Membuka Memori AI..." />
                  </div>
                ) : (
                  <div className="space-y-3">{aiCacheList.slice(0, 50).map(item => (<div key={item.prompt_hash} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent hover:border-teal-200 transition-all group relative overflow-hidden"><div className={`absolute left-0 top-0 h-full w-1 ${item.type === 'translation' ? 'bg-blue-500' : 'bg-teal-500'}`}></div><button onClick={() => deleteFromGitHub('ai-cache', item.prompt_hash).then(loadAiCache)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-red-400 bg-white dark:bg-slate-900 rounded-lg shadow-sm transition-all"><Trash2 size={16}/></button><div className="flex items-center gap-2 mb-2"><span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${item.type === 'translation' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>{item.type}</span><span className="text-[10px] text-slate-400 font-medium italic">Hash: {item.prompt_hash}</span></div><p className="text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-1">"{item.prompt_text}"</p></div>))}</div>
                )}
            </div>
         )}

         {/* REFERRALS TAB */}
         {activeTab === 'referrals' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in text-left">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                           <Gift className="text-emerald-500" size={26} /> Riwayat & Permintaan Referral
                        </h2>
                        <p className="text-slate-400 text-xs mt-1">Pantau rincian bergabungnya pengguna baru melalui undangan dan bonus wasilah yang dibagikan</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-emerald-50/40 dark:bg-emerald-950/10 p-6 rounded-[2rem] border border-emerald-100/40 dark:border-emerald-900/30">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Total Undangan Terlaksana</span>
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{referralRequests.length}</span>
                  </div>
                  <div className="bg-blue-50/45 dark:bg-blue-950/10 p-6 rounded-[2rem] border border-blue-100/40 dark:border-blue-900/30">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Bonus Wasilah Dibagikan</span>
                    <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{(referralRequests.length * 40).toLocaleString()}</span>
                  </div>
                  <div className="bg-amber-50/40 dark:bg-amber-950/10 p-6 rounded-[2rem] border border-amber-100/40 dark:border-amber-900/30">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Pengundang Aktif</span>
                    <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                      {Array.from(new Set(referralRequests.map(r => r.referrerId))).filter(Boolean).length} Orang
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase text-slate-400 font-bold">
                                <th className="pb-4 pt-2 pl-4">No</th>
                                <th className="pb-4 pt-2">Pengguna Baru (Undangan)</th>
                                <th className="pb-4 pt-2">Pengundang (Referrer)</th>
                                <th className="pb-4 pt-2">Kode Referral</th>
                                <th className="pb-4 pt-2">Tanggal Bergabung</th>
                                <th className="pb-4 pt-2 pr-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-850/60 text-sm">
                            {referralRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-slate-400 italic">
                                        Tidak ada data undangan referral ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                referralRequests.map((req, idx) => (
                                    <tr key={req.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                                        <td className="py-4 pl-4 font-bold text-slate-400">{idx + 1}</td>
                                        <td className="py-4">
                                            <div className="font-bold text-slate-800 dark:text-slate-100">
                                              {req.newUserName || 'User'}
                                            </div>
                                            <div className="text-xs text-slate-400">{req.newUserEmail || ''}</div>
                                        </td>
                                        <td className="py-4 font-bold text-slate-700 dark:text-slate-300">
                                            {req.referrerName || 'Seseorang'} 
                                            <span className="block text-[10px] text-slate-400 font-normal">ID: {req.referrerId || ''}</span>
                                        </td>
                                        <td className="py-4">
                                            <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md">
                                                {req.referrerCode || '-'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-slate-400 text-xs">
                                            {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleString('id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            }) : '-'}
                                        </td>
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                                    req.status === 'Success' 
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                                        : req.status === 'Rejected'
                                                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                                }`}>
                                                    {req.status || 'Pending'}
                                                </span>

                                                {(req.status === 'Pending' || !req.status) && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm(`Setujui rujukan ini? Pengundang (${req.referrerName}) akan mendapat +30 Wasilah & Pengguna baru (${req.newUserName}) mendapat +10 Wasilah.`)) {
                                                                  try {
                                                                    await approveReferralRequest(req.id);
                                                                    showToast("Klaim rujukan berhasil disetujui!", "success");
                                                                  } catch (err: any) {
                                                                    showToast(err.message || "Gagal menyetujui rujukan.", "error");
                                                                  }
                                                                }
                                                            }}
                                                            className="text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded-xl transition-colors font-sans"
                                                        >
                                                            Setujui
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (window.confirm(`Tolak klaim rujukan ini?`)) {
                                                                  try {
                                                                    await rejectReferralRequest(req.id);
                                                                    showToast("Klaim rujukan berhasil ditolak.", "info");
                                                                  } catch (err: any) {
                                                                    showToast(err.message || "Gagal menolak rujukan.", "error");
                                                                  }
                                                                }
                                                            }}
                                                            className="text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-3 py-1 rounded-xl border border-rose-200 dark:border-rose-900 transition-colors font-sans"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
         )}

         {/* 9. POST & CONTENT REPORTS TAB */}
         {activeTab === 'postreports' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                           <AlertCircle className="text-rose-500 animate-pulse" size={26} /> Pusat Laporan & Koreksi
                        </h2>
                        <p className="text-slate-400 text-xs mt-1">Tinjau laporan konten/fitur dari pengguna dan moderasi postingan komunitas</p>
                    </div>

                    {/* Sub-tab switcher */}
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                      <button
                        onClick={() => setReportSubTab('features')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                          reportSubTab === 'features'
                            ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        <Flag size={14} />
                        <span>Laporan Fitur & AI</span>
                        {contentReports.filter(r => r.status === 'Pending').length > 0 && (
                          <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-black">
                            {contentReports.filter(r => r.status === 'Pending').length}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => setReportSubTab('community')}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                          reportSubTab === 'community'
                            ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        <MessageSquare size={14} />
                        <span>Postingan Komunitas</span>
                        {postReports.filter(r => r.status === 'Pending').length > 0 && (
                          <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-black">
                            {postReports.filter(r => r.status === 'Pending').length}
                          </span>
                        )}
                      </button>
                    </div>
                </div>

                {reportSubTab === 'features' ? (
                  <div className="space-y-6">
                    {contentReports.length === 0 ? (
                      <div className="text-center py-20 text-slate-400 italic text-sm">
                        Belum ada laporan kendala atau koreksi konten dari pengguna.
                      </div>
                    ) : (
                      contentReports.map((report) => (
                        <div 
                          key={report.id}
                          className={`p-6 rounded-[2rem] border relative flex flex-col md:flex-row gap-6 justify-between transition-all ${
                            report.status === 'Pending' 
                              ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-200/80 dark:border-amber-900/30' 
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                report.status === 'Pending' 
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300' 
                                  : report.status === 'Actioned' 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300' 
                                    : 'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {report.status || 'Pending'}
                              </span>
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-200 dark:border-emerald-900/40">
                                {report.featureName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">
                                {report.createdAt ? new Date(report.createdAt.toDate ? report.createdAt.toDate() : report.createdAt).toLocaleString('id-ID') : 'Baru Saja'}
                              </span>
                            </div>

                            {/* Reason badge */}
                            <div className="bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 px-3.5 py-2 rounded-xl text-xs font-black border border-rose-200/80 dark:border-rose-900/50">
                              Kategori Masalah: {report.reason}
                            </div>

                            {/* Additional details */}
                            {report.details && (
                              <div className="p-3 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Catatan Pengguna:</p>
                                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                                  {report.details}
                                </p>
                              </div>
                            )}

                            {/* Content snippet */}
                            {report.contentSnippet && (
                              <div className="p-3 bg-slate-100/70 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 max-h-32 overflow-y-auto">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cuplikan Konten Yang Dilaporkan:</p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                                  {report.contentSnippet}
                                </p>
                              </div>
                            )}

                            <div className="text-xs font-bold text-slate-500">
                              Pelapor: <span className="text-slate-800 dark:text-slate-200 font-black">{report.reportedByName}</span> ({report.reportedByEmail || report.reportedById})
                            </div>
                          </div>

                          {/* Action controls */}
                          <div className="flex flex-col gap-2 shrink-0 md:justify-center md:w-44">
                            {report.status === 'Pending' && (
                              <>
                                <button
                                  onClick={async () => {
                                    try {
                                      await updateContentReportStatus(report.id!, 'Actioned');
                                      showToast("Laporan ditandai sebagai Selesai Ditindaklanjuti.", "success");
                                    } catch (e) {
                                      showToast("Gagal memperbarui status.", "error");
                                    }
                                  }}
                                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                                >
                                  <Check size={14} strokeWidth={3} />
                                  <span>Tandai Selesai</span>
                                </button>

                                <button
                                  onClick={async () => {
                                    try {
                                      await updateContentReportStatus(report.id!, 'Ignored');
                                      showToast("Laporan telah diabaikan.", "info");
                                    } catch (e) {
                                      showToast("Gagal mengabaikan laporan.", "error");
                                    }
                                  }}
                                  className="w-full py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                                >
                                  <span>Abaikan</span>
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: "Hapus Data Laporan?",
                                  message: "Laporan ini akan dihapus permanen dari riwayat admin.",
                                  isDestructive: true,
                                  onConfirm: async () => {
                                    try {
                                      await deleteContentReport(report.id!);
                                      showToast("Laporan berhasil dihapus.", "success");
                                    } catch (e) {
                                      showToast("Gagal menghapus laporan.", "error");
                                    }
                                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                  }
                                });
                              }}
                              className="w-full py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                            >
                              <Trash2 size={13} />
                              <span>Hapus Riwayat</span>
                            </button>

                            {report.reportedById && (
                              <button
                                onClick={() => {
                                  setActiveTab('supportchat');
                                  setActiveChatUserId(report.reportedById);
                                }}
                                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                              >
                                <MessageSquare size={13} />
                                <span>Chat Pelapor</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                <div className="space-y-6">
                    {postReports.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 italic text-sm">
                            Tidak ada laporan postingan saat ini. Komunitas aman dan kondusif!
                        </div>
                    ) : (
                        postReports.map((report) => (
                            <div 
                                key={report.id} 
                                className={`p-6 rounded-[2rem] border relative flex flex-col md:flex-row gap-6 justify-between transition-all ${
                                    report.status === 'Pending' 
                                        ? 'bg-rose-50/40 dark:bg-rose-950/5 border-rose-100 dark:border-rose-900/20' 
                                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
                                }`}
                            >
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                            report.status === 'Pending' 
                                                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                                : report.status === 'Actioned' 
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                                    : 'bg-slate-200 text-slate-700 border border-slate-300'
                                        }`}>
                                            {report.status}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold">
                                            {report.createdAt ? new Date(report.createdAt.toDate ? report.createdAt.toDate() : report.createdAt).toLocaleString('id-ID') : 'Baru Saja'}
                                        </span>
                                    </div>

                                    {/* Reported content recap */}
                                    <div className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">Content Postingan</p>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-pre-line leading-relaxed italic">
                                            "{report.postContent}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Penulis Postingan</p>
                                            <p className="text-slate-800 dark:text-slate-200">{report.postUserName}</p>
                                            <p className="text-[10px] text-slate-400 font-medium font-mono">ID: {report.postUserId}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pelapor</p>
                                            <p className="text-slate-800 dark:text-slate-200">{report.reportedByName}</p>
                                            <p className="text-[10px] text-slate-400 font-medium font-mono">ID: {report.reportedById}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Alasan Laporan</p>
                                        <div className="bg-rose-50/25 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-rose-100/50 dark:border-rose-900/30">
                                            {report.reason}
                                        </div>
                                    </div>
                                </div>

                                {/* Report Action controls */}
                                <div className="flex flex-col gap-2 shrink-0 md:justify-end md:w-48">
                                    {report.status === 'Pending' && (
                                        <>
                                            <button 
                                                onClick={() => {
                                                    setConfirmModal({
                                                        isOpen: true,
                                                        title: "Hapus Postingan & Selesaikan Laporan?",
                                                        message: "Postingan ini akan langsung dihapus dari komunitas selamanya, dan laporan ditandai sebagai Selesai Tindakan.",
                                                        isDestructive: true,
                                                        onConfirm: async () => {
                                                            try {
                                                                await deleteCommunityPost(report.postId);
                                                                await updatePostReportStatus(report.id!, 'Actioned');
                                                                showToast("Postingan berhasil dihapus & status diperbarui!", "success");
                                                            } catch (e) {
                                                                showToast("Gagal menghapus postingan.", "error");
                                                            }
                                                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                        }
                                                    });
                                                }}
                                                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/10 active:scale-95 transition-all"
                                            >
                                                <Trash2 size={13} />
                                                <span>Hapus Postingan</span>
                                            </button>

                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        await updatePostReportStatus(report.id!, 'Ignored');
                                                        showToast("Laporan telah diabaikan.", "info");
                                                    } catch (e) {
                                                        showToast("Gagal mengabaikan laporan.", "error");
                                                    }
                                                }}
                                                className="w-full py-2.5 bg-slate-150 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all border border-slate-200"
                                            >
                                                <Check size={13} strokeWidth={3} />
                                                <span>Abaikan</span>
                                            </button>

                                            <button 
                                                onClick={() => {
                                                    setConfirmModal({
                                                        isOpen: true,
                                                        title: "Ban / Blokir Santri?",
                                                        message: `Apakah Anda yakin ingin memblokir santri "${report.postUserName}"? Akun tersebut tidak akan dapat mempublikasikan status di forum lagi.`,
                                                        isDestructive: true,
                                                        onConfirm: async () => {
                                                            try {
                                                                await updateUserStatus(report.postUserId, 'Banned');
                                                                showToast(`Santri ${report.postUserName} telah diblokir!`, "success");
                                                            } catch (e) {
                                                                showToast("Gagal memblokir.", "error");
                                                            }
                                                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                        }
                                                    });
                                                }}
                                                className="w-full py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-950/30 text-red-650 dark:text-red-450 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                                            >
                                                <Ban size={13} />
                                                <span>Blokir Penulis</span>
                                            </button>
                                        </>
                                    )}

                                    {/* Support Chat with user */}
                                    <button 
                                        onClick={() => {
                                            setActiveTab('supportchat');
                                            setActiveChatUserId(report.postUserId);
                                        }}
                                        className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-150 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                                    >
                                        <MessageSquare size={13} />
                                        <span>Chat Penulis</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                )}
            </div>
         )}

         {/* 10. DONATIONS TAB */}
         {activeTab === 'donations' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                       <Heart className="text-rose-500 fill-rose-500/10 animate-pulse" size={26} /> Riwayat Infaq & Donasi
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">Pantau dan rekap seluruh dana masuk dari para donatur/santri via Google Play Billing</p>
                </div>

                {/* Donasi Stat Overview Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl text-white shadow-md shadow-emerald-500/10">
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-90">Total Infaq Terkumpul</p>
                    <p className="text-2xl font-black mt-1">
                      Rp {donations.reduce((acc, curr) => acc + (curr.value || 0), 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Donatur</p>
                    <p className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">
                      {donations.length} Transaksi
                    </p>
                  </div>
                  <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Rata-Rata Donasi</p>
                    <p className="text-2xl font-black mt-1 text-slate-850 dark:text-slate-100">
                      Rp {donations.length > 0 ? Math.round(donations.reduce((acc, curr) => acc + (curr.value || 0), 0) / donations.length).toLocaleString('id-ID') : '0'}
                    </p>
                  </div>
                </div>

                {/* Filter and Search */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama pendonor atau email..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border-none outline-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-santri-green/50 placeholder-slate-400 transition-all text-slate-700 dark:text-slate-200"
                  />
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto no-scrollbar -mx-8 px-8">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                        <th className="pb-3 text-[10px] font-black uppercase tracking-wider">Pendonor</th>
                        <th className="pb-3 text-[10px] font-black uppercase tracking-wider">Produk / Paket</th>
                        <th className="pb-3 text-[10px] font-black uppercase tracking-wider">Jumlah</th>
                        <th className="pb-3 text-[10px] font-black uppercase tracking-wider">Metode</th>
                        <th className="pb-3 text-[10px] font-black uppercase tracking-wider">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {donations
                        .filter(item => {
                          const query = userSearchTerm.toLowerCase();
                          return (
                            (item.userName || '').toLowerCase().includes(query) ||
                            (item.userEmail || '').toLowerCase().includes(query)
                          );
                        })
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="py-4 pr-3">
                              <p className="font-extrabold text-slate-800 dark:text-slate-100">{item.userName || 'Pendonor Anonim'}</p>
                              <p className="text-[10px] text-slate-400 font-medium font-mono">{item.userEmail || '-'}</p>
                            </td>
                            <td className="py-4">
                              <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-santri-green rounded-lg text-[10px]">
                                {item.label || 'Infaq'}
                              </span>
                            </td>
                            <td className="py-4 text-slate-900 dark:text-white font-black">
                              {item.amount || 'Rp ' + (item.value || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="py-4 text-slate-500 dark:text-slate-400 text-[10px]">
                              {item.paymentMethod || 'Google Play'}
                            </td>
                            <td className="py-4 text-slate-400 text-[10px] font-mono">
                              {item.createdAt ? new Date(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleString('id-ID') : 'Baru Saja'}
                            </td>
                          </tr>
                        ))
                      }
                      {donations.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-450 italic">
                            Belum ada riwayat infaq masuk yang terrekam.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
            </div>
         )}

         {/* TRANSACTIONS & KOIN TAB */}
         {activeTab === 'transactions' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                       <Coins className="text-amber-500 fill-amber-500/10 animate-bounce" size={26} /> Transaksi Koin & Pembelian Premium
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">Pantau pembelian lencana badge, frame avatar, top-up Wasilah, dan pemakaian koin AI oleh seluruh pengguna secara real-time.</p>
                </div>

                {/* Stat Overview Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl text-white shadow-md shadow-amber-500/10">
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-90">Estimasi Pendapatan Google Play</p>
                    <p className="text-2xl font-black mt-1">
                      Rp {transactions
                        .filter(t => t.currency === 'IDR' && t.status === 'success')
                        .reduce((acc, curr) => acc + (curr.amount || 0), 0)
                        .toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Wasilah Terpakai untuk AI</p>
                    <p className="text-2xl font-black mt-1 text-slate-850 dark:text-slate-100">
                      {transactions
                        .filter(t => t.currency === 'WASILAH')
                        .reduce((acc, curr) => acc + (curr.amount || 0), 0)
                        .toLocaleString()} Wasilah
                    </p>
                  </div>
                  <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Jumlah Riwayat Log</p>
                    <p className="text-2xl font-black mt-1 text-slate-850 dark:text-slate-100">
                      {transactions.length} Entri Log
                    </p>
                  </div>
                </div>

                {/* Filter and Search */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    placeholder="Cari nama, email, tipe item, koin, atau status..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-5 py-4 bg-slate-50 dark:bg-slate-800 border-none outline-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-amber-500/50 placeholder-slate-400 transition-all text-slate-700 dark:text-slate-200"
                  />
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto no-scrollbar -mx-8 px-8">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                        <th className="pb-3 text-[10px] font-black uppercase tracking-wider">Pengguna</th>
                        <th className="pb-3 text-[10px] font-black uppercase tracking-wider">Item Transaksi</th>
                        <th className="pb-3 text-[10px] font-black uppercase tracking-wider">Nominal pembelian</th>
                        <th className="pb-3 text-[10px] font-black uppercase tracking-wider">Kategori / Status</th>
                        <th className="pb-3 text-[10px] font-black uppercase tracking-wider">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {transactions
                        .map(item => {
                          const associatedUser = users.find(u => u.id === item.userId);
                          const userNameResolved = associatedUser?.displayName || item.userName || 'Santri User';
                          const userEmailResolved = associatedUser?.email || item.userEmail || '-';
                          return {
                            ...item,
                            userNameResolved,
                            userEmailResolved
                          };
                        })
                        .filter(item => {
                          const query = userSearchTerm.toLowerCase();
                          return (
                            (item.userNameResolved || '').toLowerCase().includes(query) ||
                            (item.userEmailResolved || '').toLowerCase().includes(query) ||
                            (item.item || '').toLowerCase().includes(query) ||
                            (item.type || '').toLowerCase().includes(query) ||
                            (item.status || '').toLowerCase().includes(query)
                          );
                        })
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors animate-in fade-in">
                            <td className="py-4 pr-3">
                              <p className="font-extrabold text-slate-850 dark:text-slate-100 leading-snug">{item.userNameResolved}</p>
                              <p className="text-[10px] text-slate-400 font-medium font-mono mt-0.5">{item.userEmailResolved}</p>
                            </td>
                            <td className="py-4">
                              <p className="text-slate-800 dark:text-slate-200 font-bold leading-normal">{item.item}</p>
                              <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">UID: {item.userId?.substring(0, 8) || 'unknown'}...</p>
                            </td>
                            <td className="py-4">
                              {item.currency === 'IDR' ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-black font-mono">
                                  Rp {(item.amount || 0).toLocaleString('id-ID')}
                                </span>
                              ) : (
                                <span className="text-amber-500 font-black font-mono">
                                  {item.amount || 0} Wasilah
                                </span>
                              )}
                            </td>
                            <td className="py-4 space-y-1">
                              <div>
                                <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                  item.type === 'topup' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600'
                                }`}>
                                  {item.type}
                                </span>
                              </div>
                              <div className="pl-1">
                                <span className={`text-[9px] font-extrabold capitalize ${
                                  item.status === 'success' ? 'text-emerald-500' : 'text-rose-500'
                                }`}>
                                  ● {item.status}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 text-slate-400 text-[10px] font-mono leading-none">
                              {item.createdAt ? new Date(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleString('id-ID') : 'Baru Saja'}
                            </td>
                          </tr>
                        ))
                      }
                      {transactions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                            Belum ada riwayat transaksi / pembelian masuk yang terrekam.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
            </div>
         )}

         {/* 11. APP CONFIG TAB */}
         {activeTab === 'appconfig' && (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                       <Settings className="text-amber-600 animate-spin-slow" size={26} /> Konfigurasi Pembaruan Aplikasi
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">Kelola popup info pembaruan versi terbaru dan ajakan beri rating bintang 5 di Google Play Store secara manual.</p>
                </div>

                <form onSubmit={handleSaveAppConfig} className="space-y-6">
                    <div className="flex items-center justify-between p-5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 rounded-3xl">
                        <div>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">Tampilkan Popup Pembaruan</span>
                            <span className="text-slate-400 text-[10px] sm:text-xs">Aktifkan untuk memunculkan modal popup pembaruan ke seluruh pengguna saat membuka aplikasi.</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowUpdatePopup(!showUpdatePopup)}
                            className={`w-14 h-8 rounded-full transition-colors relative flex items-center p-1 ${showUpdatePopup ? 'bg-santri-green' : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                            <span className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${showUpdatePopup ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Judul Popup</label>
                            <input
                                type="text"
                                required
                                value={updateTitle}
                                onChange={(e) => setUpdateTitle(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-santri-green/50 placeholder-slate-400 border-none outline-none transition-all text-slate-800 dark:text-slate-100"
                                placeholder="Contoh: Pembaruan Aplikasi Tersedia!"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Link Play Store</label>
                            <input
                                type="text"
                                required
                                value={playStoreUrl}
                                onChange={(e) => setPlayStoreUrl(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-santri-green/50 placeholder-slate-400 border-none outline-none transition-all text-slate-800 dark:text-slate-100"
                                placeholder="Contoh: https://play.google.com/store/apps/details?id=com.app"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Isi Pesan Pendukung / Keterangan Pembaruan</label>
                        <textarea
                            required
                            rows={3}
                            value={updateMessage}
                            onChange={(e) => setUpdateMessage(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-santri-green/50 placeholder-slate-400 border-none outline-none transition-all text-slate-800 dark:text-slate-100"
                            placeholder="Jelaskan perubahan terbaru atau ajakan memberi rating bintang 5 di Play Store..."
                        />
                    </div>

                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/15 rounded-3xl">
                        <div>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">Sifat Pembaruan Opsional (Dapat Dilewati)</span>
                            <span className="text-slate-400 text-[10px] sm:text-xs">Jika aktif, pengguna dapat menutup popup ini dengan tombol "Nanti Saja". Jika dinonaktifkan, pengguna wajib mengupdate.</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOptional(!isOptional)}
                            className={`w-14 h-8 rounded-full transition-colors relative flex items-center p-1 ${isOptional ? 'bg-santri-green' : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                            <span className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${isOptional ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={savingConfig}
                            className="px-8 py-4 bg-santri-green hover:bg-green-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-lg shadow-green-200 dark:shadow-none flex items-center gap-2 transition-all active:scale-95"
                        >
                            {savingConfig ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                        </button>
                    </div>
                </form>
            </div>
         )}

         <ConfirmationModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal({...confirmModal, isOpen: false})} isDestructive={confirmModal.isDestructive} />
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-2 flex justify-around items-center z-[100] safe-area-bottom shadow-2xl transition-colors">
         {[
            { id: 'overview', label: 'Ringkasan', icon: LayoutGrid, color: 'text-indigo-500' },
            { id: 'tokoproducts', label: 'Toko Santri', icon: Store, color: 'text-orange-500' },
            { id: 'supportchat', label: 'Chat Admin', icon: MessageSquare, color: 'text-pink-500', badge: supportChats.filter(c => c.lastSenderId !== 'admin').length },
            { id: 'users', label: 'Pengguna', icon: Users, color: 'text-blue-500' },
         ].map((item) => {
            const isActive = activeTab === item.id;
            const ItemIcon = item.icon;
            return (
               <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex flex-col items-center gap-1 transition-all min-w-[56px] py-1 relative ${
                     isActive ? 'text-santri-green' : 'text-slate-400 dark:text-slate-500'
                  }`}
               >
                  <ItemIcon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'scale-110' : ''} />
                  <span className={`text-[10px] ${isActive ? 'font-black' : 'font-semibold'}`}>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                     <span className="absolute top-0.5 right-3 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                  ) : null}
               </button>
            );
         })}

         <button
            onClick={() => setShowMobileMenu(true)}
            className="flex flex-col items-center gap-1 transition-all min-w-[56px] py-1 text-slate-500 dark:text-slate-400 hover:text-santri-green"
         >
            <LayoutGrid size={20} />
            <span className="text-[10px] font-semibold">Semua Tab</span>
         </button>
      </nav>

      {/* MOBILE ALL TABS BOTTOM SHEET DRAWER */}
      <AnimatePresence>
        {showMobileMenu && (
          <div className="fixed inset-0 z-[200] flex flex-col justify-end bg-black/60 backdrop-blur-xs md:hidden">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="bg-white dark:bg-slate-900 rounded-t-[2.5rem] border-t border-slate-200 dark:border-slate-800 max-h-[88vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Handle & Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-santri-green/10 text-santri-green flex items-center justify-center font-bold">
                    <LayoutGrid size={22} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Menu Admin ({ADMIN_TABS.length})</h3>
                    <p className="text-[11px] text-slate-400">Pilih modul kelola aplikasi</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search Input in Modal */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={mobileSearchQuery}
                    onChange={(e) => setMobileSearchQuery(e.target.value)}
                    placeholder="Cari menu admin (misal: Produk, Kuis, User, Berita)..."
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 rounded-2xl text-xs font-bold outline-none border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-santri-green/40"
                  />
                  {mobileSearchQuery && (
                    <button
                      onClick={() => setMobileSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Tab Grid grouped by category */}
              <div className="flex-1 p-5 overflow-y-auto space-y-6 no-scrollbar">
                {(() => {
                  const categories = [
                    {
                      title: '🛍️ Toko & Keuangan',
                      tabs: ['tokoproducts', 'tokoreports', 'donations', 'transactions', 'redemption', 'referrals']
                    },
                    {
                      title: '📰 Konten & Pustaka',
                      tabs: ['news', 'mutiara', 'pustaka', 'broadcast', 'postreports']
                    },
                    {
                      title: '👥 Pengguna & Layanan',
                      tabs: ['users', 'supportchat']
                    },
                    {
                      title: '⚙️ Sistem & AI',
                      tabs: ['overview', 'quiz', 'aicache', 'appconfig']
                    }
                  ];

                  const filteredTabs = ADMIN_TABS.filter((t) =>
                    t.label.toLowerCase().includes(mobileSearchQuery.toLowerCase())
                  );

                  if (mobileSearchQuery.trim()) {
                    return (
                      <div className="grid grid-cols-2 gap-3">
                        {filteredTabs.map((tab) => {
                          const TabIcon = tab.icon;
                          const isActive = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => {
                                setActiveTab(tab.id as any);
                                setShowMobileMenu(false);
                                setMobileSearchQuery('');
                              }}
                              className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border transition-all ${
                                isActive
                                  ? 'bg-santri-green text-white border-santri-green shadow-lg'
                                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <TabIcon size={24} className={isActive ? 'text-white' : tab.color} />
                              <span className="text-xs font-bold leading-tight">{tab.label}</span>
                            </button>
                          );
                        })}
                        {filteredTabs.length === 0 && (
                          <div className="col-span-2 text-center py-8 text-slate-400 text-xs italic">
                            Tidak ada menu admin cocok dengan kata kunci.
                          </div>
                        )}
                      </div>
                    );
                  }

                  return categories.map((catGroup, idx) => (
                    <div key={idx} className="space-y-3">
                      <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {catGroup.title}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {catGroup.tabs.map((tabId) => {
                          const tab = ADMIN_TABS.find((t) => t.id === tabId);
                          if (!tab) return null;
                          const TabIcon = tab.icon;
                          const isActive = activeTab === tab.id;

                          let badgeCount = 0;
                          if (tab.id === 'redemption') badgeCount = redemptions.filter(r => r.status === 'Pending').length;
                          if (tab.id === 'tokoreports') badgeCount = adminReports.filter(r => r.status === 'pending').length;
                          if (tab.id === 'postreports') badgeCount = postReports.filter(r => r.status === 'pending').length;
                          if (tab.id === 'supportchat') badgeCount = supportChats.filter(c => c.lastSenderId !== 'admin').length;
                          if (tab.id === 'referrals') badgeCount = referralRequests.filter(r => r.status === 'Pending').length;

                          return (
                            <button
                              key={tab.id}
                              onClick={() => {
                                setActiveTab(tab.id as any);
                                setShowMobileMenu(false);
                              }}
                              className={`p-3.5 rounded-2xl flex items-center gap-3 border text-left transition-all relative ${
                                isActive
                                  ? 'bg-santri-green text-white border-santri-green shadow-md'
                                  : 'bg-slate-50/80 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-white dark:bg-slate-900 shadow-xs'}`}>
                                <TabIcon size={18} className={isActive ? 'text-white' : tab.color} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-extrabold truncate block">{tab.label}</span>
                              </div>
                              {badgeCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white shadow-xs">
                                  {badgeCount}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div>
                <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Pencil size={20} className="text-amber-500" />
                  Edit Data Santri
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ID: <span className="font-mono">{editingUser.id}</span>
                </p>
              </div>
              <button 
                onClick={() => setEditingUser(null)} 
                className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-5">
              {/* User Email & Photo preview */}
              <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold text-base overflow-hidden shrink-0">
                  {editingUser.photoURL ? (
                    <img src={editingUser.photoURL} alt={editingUser.displayName || 'Santri'} className="w-full h-full object-cover" />
                  ) : (
                    (editingUser.displayName?.[0] || 'S').toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{editingUser.displayName || 'Santri AI'}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{editingUser.email || 'Tanpa email'}</p>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  Nama Lengkap / Santri
                </label>
                <input 
                  type="text" 
                  value={editUserForm.displayName} 
                  onChange={e => setEditUserForm({ ...editUserForm, displayName: e.target.value })} 
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-amber-500 text-slate-800 dark:text-slate-100" 
                  placeholder="Nama santri..."
                />
              </div>

              {/* Wasilah & Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                    <span>Saldo Wasilah</span>
                    <span className="text-[10px] text-emerald-600 font-bold">Min. 0 (Tanpa Minus)</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="0"
                      value={editUserForm.wasilah} 
                      onChange={e => setEditUserForm({ ...editUserForm, wasilah: Math.max(0, parseInt(e.target.value) || 0) })} 
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-amber-500 font-mono font-bold text-emerald-600 dark:text-emerald-400" 
                      placeholder="0"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Saldo Wasilah dibatasi minimal 0.</p>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                    Poin XP Santri
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    value={editUserForm.points} 
                    onChange={e => setEditUserForm({ ...editUserForm, points: Math.max(0, parseInt(e.target.value) || 0) })} 
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-amber-500 font-mono font-bold text-amber-500" 
                    placeholder="0"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Poin untuk peringkat & leaderboard.</p>
                </div>
              </div>

              {/* Status & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                    Status Akun
                  </label>
                  <select 
                    value={editUserForm.status} 
                    onChange={e => setEditUserForm({ ...editUserForm, status: e.target.value as 'Active' | 'Banned' })}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-amber-500 text-slate-800 dark:text-slate-100 font-semibold"
                  >
                    <option value="Active">🟢 Aktif (Active)</option>
                    <option value="Banned">🔴 Diblokir (Banned)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                    Peran / Hak Akses
                  </label>
                  <select 
                    value={editUserForm.role} 
                    onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value as 'user' | 'admin' })}
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border border-slate-200 dark:border-slate-700 outline-none focus:border-amber-500 text-slate-800 dark:text-slate-100 font-semibold"
                  >
                    <option value="user">👤 Santri Biasa (User)</option>
                    <option value="admin">👑 Administrator (Admin)</option>
                  </select>
                </div>
              </div>

              {/* Toggles: Verified Badge & Premium */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={editUserForm.isVerified} 
                    onChange={e => setEditUserForm({ ...editUserForm, isVerified: e.target.checked })} 
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      Lencana Verified
                      <ShieldCheck size={14} className="text-blue-500" />
                    </p>
                    <p className="text-[10px] text-slate-400">Centang biru akun terverifikasi</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={editUserForm.isPremium} 
                    onChange={e => setEditUserForm({ ...editUserForm, isPremium: e.target.checked })} 
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      Member PRO / VIP
                      <Sparkles size={14} className="text-amber-500" />
                    </p>
                    <p className="text-[10px] text-slate-400">Akses fitur premium gratis</p>
                  </div>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)} 
                  className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={savingUser}
                  className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-amber-200/50 dark:shadow-none flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {savingUser ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REWARD MODAL */}
      {showRewardModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 text-center">
                <div className="flex justify-between items-center mb-8"><h3 className="font-bold text-xl">Tambah Hadiah</h3><button onClick={() => setShowRewardModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400"><X size={20}/></button></div>
                <div className="space-y-5">
                    <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nama Barang</label><input value={rewardForm.name} onChange={e => setRewardForm({...rewardForm, name: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border-none outline-none focus:ring-2 focus:ring-amber-300" placeholder="Contoh: Peci Eksklusif"/></div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Poin</label><input type="number" value={rewardForm.points} onChange={e => setRewardForm({...rewardForm, points: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border-none outline-none focus:ring-2 focus:ring-amber-300" placeholder="5000"/></div>
                        
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Upload Foto</label>
                            <div 
                                onClick={() => rewardImageInputRef.current?.click()}
                                className="w-full h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-amber-300 transition-all overflow-hidden"
                            >
                                {rewardForm.icon ? (
                                    <img src={rewardForm.icon} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <Camera size={20} className="text-slate-400" />
                                )}
                            </div>
                            <input 
                                type="file" 
                                ref={rewardImageInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleRewardImageChange}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-6"><button onClick={() => setShowRewardModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-sm text-slate-500">Batal</button><button onClick={handleSaveReward} className="flex-1 py-4 bg-santri-green text-white rounded-2xl font-bold text-sm shadow-xl shadow-green-100 dark:shadow-none">Simpan</button></div>
                </div>
            </div>
        </div>
      )}

      {/* ADMIN CHAT LIGHTBOX MODAL */}
      <AnimatePresence>
        {adminChatImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAdminChatImageModal(null)}
            className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <button
              onClick={() => setAdminChatImageModal(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={adminChatImageModal}
              alt="Gambar Penuh"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}