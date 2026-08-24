
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHistory } from '../contexts/HistoryContext';
import { useAuth } from '../contexts/AuthContext';
import { usePrayer } from '../contexts/PrayerContext';
import { useToast } from '../contexts/ToastContext'; 
import { getAllSurahs } from '../services/quranApiService';
import { getHadithBooks } from '../services/hadithApiService';
import { isFirebaseReady, handleDailyCheckIn, handleAdReward, subscribeToNotifications, createNotification } from '../services/firebase';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { motion } from 'motion/react';
import { 
  Sparkles, CalendarCheck, History as HistoryIcon, MapPin, GraduationCap, Brain, Activity, Compass, Calendar, Coins, Calculator, HeartHandshake, Heart, ShieldCheck, Keyboard, ArrowRight, Search, X, Book, BookOpen, Scroll, Settings, User, Clock, Tv, LayoutGrid, Trophy, Mic, RefreshCw, Quote, Video, Share2, PlayCircle, Loader2, Library, Radio, BookHeart, CalendarClock, Star, Droplets, Map, Moon, Baby, Disc, MessageSquare, Newspaper, ImageIcon, UserX, Bell, Navigation, Scale, Crown, School, HeartPulse, Sun, Home, Fingerprint, Eye, EyeOff, Gamepad2, ChevronRight, Globe, PenTool, Music2, AlertTriangle, AlertCircle, Info, Wind, Gift, Gem, Store, ShoppingBag, ExternalLink
} from 'lucide-react';
// DailyAttendanceModal replaced with AttendanceScreen
import { UserAvatar } from '../components/UserAvatar';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { openExternalLink, shareWaGroup } from '../utils/linkUtils';
import HistoryScreen from './HistoryScreen';
import { MutiaraData } from '../types'; // Import MutiaraData interface
import { QUOTE_THEMES } from '../services/geminiService'; 
import { fetchListFromGitHub } from '../services/githubDataService';
import { PLAYSTORE_LINK } from '../constants';
import { 
  SUB_FEATURES, 
  ALL_SUB_FEATURES,
  getBookmarkedFeatureLabels, 
  toggleBookmarkFeature, 
  subscribeToBookmarkChanges
} from '../services/bookmarkService';
import {
  MosqueIcon,
  OpenBookEmojiIcon,
  OrangeBookIcon,
  GlobeEmojiIcon,
  AlarmClockEmojiIcon,
  SleepingPersonIcon,
  HandshakeIcon,
  StudentEmojiIcon,
  TurbanScholarIcon,
  VideoGameIcon,
  SettingsEmojiIcon,
  SwordsEmojiIcon,
  TrophyEmojiIcon,
  ArcheryEmojiIcon
} from '../components/EmojiIcon';

interface HomeScreenProps { fontSize: number; settings?: any; }

const ISLAMIC_EVENTS = [
  { name: 'Tahun Baru Hijriyah', month: 1, day: 1, isHoliday: true },
  { name: 'Hari Tasu\'a (9 Muharram)', month: 1, day: 9, isHoliday: false },
  { name: 'Hari Asyura (10 Muharram)', month: 1, day: 10, isHoliday: true },
  { name: 'Maulid Nabi SAW', month: 3, day: 12, isHoliday: true },
  { name: 'Isra Mi\'raj', month: 7, day: 27, isHoliday: true },
  { name: 'Awal Ramadhan', month: 9, day: 1, isHoliday: false },
  { name: 'Nuzulul Qur\'an', month: 9, day: 17, isHoliday: false },
  { name: 'Idul Fitri 1 Syawal', month: 10, day: 1, isHoliday: true },
  { name: 'Idul Fitri 2 Syawal', month: 10, day: 2, isHoliday: true },
  { name: 'Idul Adha', month: 12, day: 10, isHoliday: true },
  { name: 'Hari Tasyrik 1', month: 12, day: 11, isHoliday: false },
  { name: 'Hari Tasyrik 2', month: 12, day: 12, isHoliday: false },
  { name: 'Hari Tasyrik 3', month: 12, day: 13, isHoliday: false },
];

const ISLAMIC_EVENT_DETAILS: Record<string, { desc: string, icon: string, bg: string, text: string }> = {
  'Tahun Baru Hijriyah': {
    desc: 'Selamat Tahun Baru Hijriyah! Mari buka lembaran baru dengan meningkatkan ketaatan, mempererat ukhuwah, serta bertekad menjadi pribadi yang lebih baik dari tahun sebelumnya.',
    icon: '✨',
    bg: 'from-amber-500 via-amber-600 to-yellow-700',
    text: 'text-white'
  },
  'Hari Tasu\'a (9 Muharram)': {
    desc: 'Hari ini adalah Hari Tasu\'a. Disunnahkan melaksanakan ibadah puasa sunnah hari ini sebagai pembeda dengan kebiasaan kaum Yahudi sebelum menyambut puasa Asyura esok hari.',
    icon: '🌙',
    bg: 'from-emerald-600 via-teal-700 to-teal-800',
    text: 'text-white'
  },
  'Hari Asyura (10 Muharram)': {
    desc: 'Hari ini adalah Hari Asyura. Disunnahkan berpuasa hari ini. Rasulullah SAW bersabda bahwa puasa Asyura dapat menghapus dosa-dosa kecil setahun yang lalu.',
    icon: '⭐',
    bg: 'from-emerald-600 via-teal-700 to-cyan-800',
    text: 'text-white'
  },
  'Maulid Nabi SAW': {
    desc: 'Selamat memperingati hari kelahiran Baginda Agung Nabi Muhammad SAW. Mari perbanyak membaca shalawat dan senantiasa meneladani kemuliaan akhlak beliau di kehidupan sehari-hari.',
    icon: '🕌',
    bg: 'from-amber-500 via-amber-600 to-yellow-600',
    text: 'text-white'
  },
  'Isra Mi\'raj': {
    desc: 'Selamat memperingati peristiwa mukjizat Isra Mi\'raj Nabi Muhammad SAW. Mari kita jadikan momentum ini untuk meningkatkan kekhusyukan dan kedisiplinan dalam mendirikan shalat lima waktu.',
    icon: '🌌',
    bg: 'from-indigo-600 via-violet-700 to-purple-800',
    text: 'text-white'
  },
  'Awal Ramadhan': {
    desc: 'Marhaban ya Ramadhan! Selamat menyambut bulan suci penuh berkah, rahmat, dan ampunan. Mari persiapkan diri untuk meraih takwa dengan puasa, tarawih, dan membaca Al-Qur\'an.',
    icon: '🌙',
    bg: 'from-emerald-600 via-teal-700 to-green-800',
    text: 'text-white'
  },
  'Nuzulul Qur\'an': {
    desc: 'Memperingati Nuzulul Qur\'an, malam diturunkannya kitab suci Al-Qur\'an kepada Rasulullah SAW. Mari perbanyak tadarus, tadabbur, dan mengamalkan tuntunan agung Al-Qur\'an.',
    icon: '📖',
    bg: 'from-indigo-600 via-blue-700 to-sky-800',
    text: 'text-white'
  },
  'Idul Fitri 1 Syawal': {
    desc: 'Selamat Hari Raya Idul Fitri! Taqabbalallahu minna wa minkum, minal aidin wal faizin. Semoga Allah menerima seluruh amal ibadah puasa kita dan menganugerahkan kesucian hati.',
    icon: '🎉',
    bg: 'from-amber-500 via-amber-600 to-yellow-700',
    text: 'text-white'
  },
  'Idul Fitri 2 Syawal': {
    desc: 'Selamat Hari Raya Idul Fitri! Taqabbalallahu minna wa minkum. Mari kita lanjutkan silaturahmi dengan sanak keluarga dan menjaga amalan baik selepas bulan Ramadhan.',
    icon: '🤝',
    bg: 'from-amber-500 via-amber-600 to-yellow-700',
    text: 'text-white'
  },
  'Idul Adha': {
    desc: 'Selamat Hari Raya Idul Adha! Mari hayati keikhlasan Nabi Ibrahim AS dan Nabi Ismail AS dalam berkurban, serta tingkatkan kepedulian sosial kita kepada sesama umat muslim.',
    icon: '🐏',
    bg: 'from-emerald-600 via-teal-700 to-green-800',
    text: 'text-white'
  },
  'Hari Tasyrik 1': {
    desc: 'Hari Tasyrik Pertama. Hari di mana umat islam dilarang berpuasa, dianjurkan memperbanyak dzikir, bertakbir, serta menikmati hidangan makan dan minum sebagai bentuk syukur kepada Allah SWT.',
    icon: '🍖',
    bg: 'from-amber-600 via-orange-600 to-yellow-700',
    text: 'text-white'
  },
  'Hari Tasyrik 2': {
    desc: 'Hari Tasyrik Kedua. Waktu yang utama untuk terus mengumandangkan takbir muqayyad setelah shalat fardhu dan menikmati rezeki serta kebersamaan dengan memperbanyak rasa syukur.',
    icon: '🍖',
    bg: 'from-amber-600 via-orange-600 to-yellow-700',
    text: 'text-white'
  },
  'Hari Tasyrik 3': {
    desc: 'Hari Tasyrik Ketiga. Hari terakhir diperbolehkannya menyembelih hewan kurban sebelum masuknya waktu maghrib. Mari maksimalkan ibadah, dzikir, dan syukur kita hari ini.',
    icon: '🍖',
    bg: 'from-amber-600 via-orange-600 to-yellow-700',
    text: 'text-white'
  }
};

// 8 Kotak Grid Utama
const MAIN_FEATURES = [ 
  { id: 'belajar', icon: StudentEmojiIcon, label: "Belajar", color: "bg-indigo-600" },
  { id: 'harian', icon: CalendarClock, label: "Harian", color: "bg-emerald-600" }, 
  { id: 'media', icon: Video, label: "Media", color: "bg-red-600" }, 
  { id: 'amalan', icon: BookHeart, label: "Amalan", color: "bg-amber-600" }, 
  { id: 'tahfidz', icon: Mic, label: "Tahfidz", path: "/tahfidz", color: "bg-emerald-500" }, 
  { id: 'wanita', icon: Moon, label: "Khusus", color: "bg-rose-500" }, 
  { id: 'hitung', icon: Calculator, label: "Alat", color: "bg-amber-500" },
  { id: 'more', icon: LayoutGrid, label: "Lainnya", color: "bg-slate-500" }, 
];

// Sub-menu Data is imported from bookmarkService

const SEARCHABLE_FEATURES = [ 
  { icon: Store, label: "Toko Santri", color: "bg-orange-600", path: "/marketplace" },
  ...MAIN_FEATURES.filter(i => !['wanita', 'hitung', 'more', 'belajar', 'harian', 'media', 'amalan'].includes(i.id)), 
  ...SUB_FEATURES.belajar,
  ...SUB_FEATURES.harian,
  ...SUB_FEATURES.wanita,
  ...SUB_FEATURES.hitung,
  ...SUB_FEATURES.media,
  ...SUB_FEATURES.amalan,
  ...SUB_FEATURES.more,
  { icon: Scale, label: "Ruang Muhasabah", color: "bg-rose-500", path: "/muhasabah" },
  { icon: Brain, label: "Konsultasi Pakar AI", color: "bg-emerald-700", path: "/expert-consultation" },
  { icon: MosqueIcon, label: "Masjid Terdekat", color: "bg-emerald-600", path: "/nearby?type=masjid" },
  { icon: School, label: "Cari Pesantren", color: "bg-indigo-600", path: "/pesantren-explorer" },
  { icon: OpenBookEmojiIcon, label: "Belajar Quran", color: "bg-emerald-600", path: "/learning-quran" },
  { icon: OrangeBookIcon, label: "Belajar Kitab", color: "bg-yellow-500", path: "/learning-kitab" },
  { icon: Star, label: "Rukun Islam", color: "bg-amber-500", path: "/rukun-islam" },
  { icon: ShieldCheck, label: "Rukun Iman", color: "bg-indigo-500", path: "/rukun-iman" },
  { icon: GlobeEmojiIcon, label: "Tafakur", color: "bg-blue-400", path: "/tafakur" },
  { icon: Heart, label: "Meditasi Dzikir", color: "bg-rose-400", path: "/dzikir-meditation" },
  { icon: Brain, label: "Barokah Jumat", color: "bg-indigo-600", path: "/friday-barokah" },
  { icon: Map, label: "Kurikulum Santri", color: "bg-orange-600", path: "/kurikulum" },
  { icon: Droplets, label: "Thaharah", color: "bg-cyan-600", path: "/thaharah" },
  { icon: VideoGameIcon, label: "Game Islami", color: "bg-orange-500", path: "/game" },
  { icon: Brain, label: "Cerdas Cermat", color: "bg-purple-500", path: "/quiz" }, 
  { icon: OrangeBookIcon, label: "Kitab Kuning", color: "bg-amber-600", path: "/kitab" }, 
  { icon: OpenBookEmojiIcon, label: "Al-Quran", color: "bg-emerald-600", path: "/quran" }, 
  { icon: Scroll, label: "Hadis", color: "bg-blue-600", path: "/hadis" }, 
  { icon: AlarmClockEmojiIcon, label: "Jadwal Sholat", color: "bg-green-600", path: "/prayer-times" }, 
  { icon: Sparkles, label: "Nisfu Syaban", color: "bg-purple-600", path: "/nisfu-syaban" },
  { icon: Scroll, label: "Tahlil Lengkap", color: "bg-emerald-700", path: "/tahlil" },
  { icon: Library, label: "Ebook Islami", color: "bg-emerald-600", path: "/ebook" },
  { icon: OpenBookEmojiIcon, label: "Surah Yasin", color: "bg-emerald-600", path: "/yasin" },
  { icon: TurbanScholarIcon, label: "Biografi Ulama", color: "bg-slate-600", path: "/biography" }, 
  { icon: SettingsEmojiIcon, label: "Pengaturan", color: "bg-slate-500", path: "/settings" }, 
];

const HIJRI_MONTHS_ID: Record<string, string> = { "Muharram": "Muharram", "Safar": "Safar", "Rabi' al-Awwal": "Rabiul Awal", "Rabi' al-Thani": "Rabiul Akhir", "Jumada al-Ula": "Jumadil Awal", "Jumada al-Akhirah": "Jumadil Akhir", "Rajab": "Rajab", "Sha'ban": "Sya'ban", "Ramadan": "Ramadhan", "Shawwal": "Syawal", "Dhu al-Qi'dah": "Dzulkaidah", "Dhu al-Hijjah": "Dzulhijjah", "Rabi al-Awwal": "Rabiul Awal", "Rabi al-Thani": "Rabiul Akhir", "Jumada al-Awwal": "Jumadil Awal", "Jumada al-Thani": "Jumadil Akhir", "Dhul Qidah": "Dzulkaidah", "Dhul Hijjah": "Dzulhijjah", "Rabiʻ I": "Rabiul Awal", "Rabiʻ II": "Rabiul Akhir" };

const FeatureButton: React.FC<{ 
  item: any; 
  onClick: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (e: React.MouseEvent) => void;
  showBookmarkStar?: boolean;
}> = ({ item, onClick, isBookmarked = false, onToggleBookmark, showBookmarkStar = false }) => { 
  const Icon = item.icon; 
  const bgClass = item.color || 'bg-slate-100';
  
  return ( 
    <div className="flex flex-col items-center gap-1.5 group w-full relative"> 
      <button 
        type="button"
        className="flex flex-col items-center gap-1.5 w-full cursor-pointer outline-none" 
        onClick={onClick}
      >
        <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center shadow-md group-hover:scale-105 transition-all relative`}> 
          <Icon size={22} strokeWidth={2.5} className="text-white" /> 
        </div> 
        <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight"> 
          {item.label} 
        </span> 
      </button> 

      {showBookmarkStar && onToggleBookmark && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(e);
          }}
          className={`absolute -top-1.5 -right-1.5 p-1.5 rounded-full shadow-md border hover:scale-115 active:scale-90 transition-all cursor-pointer z-20 ${
            isBookmarked 
              ? "bg-emerald-600 border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500 text-white shadow-emerald-500/10" 
              : "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/80 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
          }`}
          title={isBookmarked ? "Hapus Penanda" : "Tandai Fitur"}
        >
          <Star 
            size={11} 
            className={`transition-all ${isBookmarked ? "fill-amber-300 text-amber-300" : "text-emerald-600 dark:text-emerald-400"}`} 
          />
        </button>
      )}
    </div> 
  ); 
};

const HomeScreen: React.FC<HomeScreenProps> = ({ fontSize, settings }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const historyRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hasTriggeredCheckInNotificationRef = useRef(false);
  const { history } = useHistory();
  const { user, userData, loading: authLoading } = useAuth();
  const { showToast } = useToast(); 
  
  const [bookmarkedLabels, setBookmarkedLabels] = useState<string[]>([]);

  useEffect(() => {
    setBookmarkedLabels(getBookmarkedFeatureLabels());
    const unsubscribe = subscribeToBookmarkChanges(() => {
      setBookmarkedLabels(getBookmarkedFeatureLabels());
    });
    return () => unsubscribe();
  }, []);
  
  // Daily Attendance and Ad Reward Integration directly in HomeScreen.tsx
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showAdOfferModal, setShowAdOfferModal] = useState(false);
  const [isAdProcessing, setIsAdProcessing] = useState(false);

  // AdMob Interstitial handler (Native-only, no custom React UI)
  const triggerInterstitial = (action: "Absensi" | "Cerdas Cermat", callback: () => void) => {
    if (window.AndroidNativeInterface?.showInterstitialAd) {
      try {
        console.log(`[AdMob] Triggering native interstitial ad for: ${action}`);
        window.AndroidNativeInterface.showInterstitialAd();
      } catch (err) {
        console.error("Gagal memanggil native AdMob Interstitial:", err);
      }
    }
    callback();
  };

  useEffect(() => {
    (window as any).onRewardGranted = async () => {
      if (user) {
        try {
          setIsAdProcessing(true);
          await handleAdReward(user.uid);
          showToast("Alhamdulillah! +1 Wasilah & +100 Poin bonus berhasil diterima.", "success");
        } catch (qe) {
          console.error("Failed to sync ad reward in HomeScreen:", qe);
        } finally {
          setIsAdProcessing(false);
          setShowAdOfferModal(false);
        }
      }
    };
    return () => {
      delete (window as any).onRewardGranted;
    };
  }, [user, showToast]);

  const handleHomeCheckIn = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!user) {
      showToast("Silakan masuk (login) terlebih dahulu untuk mengisi absensi.", "info");
      navigate('/settings');
      return;
    }
    navigate('/attendance');
  };

  const handleWatchAdReward = () => {
    if (!user) return;
    if (window.AndroidNativeInterface?.showRewardedAd) {
      setIsAdProcessing(true);
      window.AndroidNativeInterface.showRewardedAd();
    } else {
      showToast("Fitur bonus video hanya tersedia di aplikasi Android resmi.", "info");
      setShowAdOfferModal(false);
    }
  }; 
  
  const { prayerData, locationName, nextPrayer, countdown, refreshLocation, loading: prayerLoading, getHijriDate } = usePrayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [surahs, setSurahs] = useState<any[]>([]);
  const [hadiths, setHadiths] = useState<any[]>([]);
  const [doas, setDoas] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);

  const [searchResults, setSearchResults] = useState<{
    features: any[],
    surahs: any[],
    hadiths: any[],
    doas: any[],
    history: any[]
  }>({ features: [], surahs: [], hadiths: [], doas: [], history: [] });

  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const unreadCount = useUnreadCount();
  const [mutiaraItems, setMutiaraItems] = useState<MutiaraData[]>([]);
  const [mutiaraLoading, setMutiaraLoading] = useState(true);
  const [mutiaraError, setMutiaraError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSharingImage, setIsSharingImage] = useState<string | null>(null);
  const [selectedHolidayDetail, setSelectedHolidayDetail] = useState<{ name: string; desc: string; icon: string; bg: string; } | null>(null);

  const eventCountdown = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 366; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const hijri = getHijriDate(checkDate, true);
        const event = ISLAMIC_EVENTS.find(e => e.month === hijri.month && e.day === hijri.day);
        if (event) return { name: event.name, days: i, isHoliday: event.isHoliday };
    }
    return null;
  }, [getHijriDate]);

  // Automatically trigger the popup modal when today is an Islamic holiday/event
  useEffect(() => {
    if (eventCountdown && eventCountdown.days === 0) {
      const sessionKey = `shown_holiday_${eventCountdown.name}`;
      const hasShown = sessionStorage.getItem(sessionKey);
      if (!hasShown) {
        const detail = ISLAMIC_EVENT_DETAILS[eventCountdown.name] || {
          desc: `Hari ini adalah ${eventCountdown.name}. Hari yang istimewa dan mulia bagi seluruh umat Islam. Mari isi dengan amalan kebaikan, dzikir, dan mempererat tali silaturahmi.`,
          icon: '🌟',
          bg: 'from-emerald-600 via-teal-700 to-green-800',
          text: 'text-white'
        };
        setSelectedHolidayDetail({
          name: eventCountdown.name,
          ...detail
        });
        sessionStorage.setItem(sessionKey, 'true');
      }
    }
  }, [eventCountdown]);

  // Automatically send notification to database when today is an Islamic holiday/event
  useEffect(() => {
    if (user?.uid && eventCountdown && eventCountdown.days === 0 && isFirebaseReady()) {
      const todayStr = new Date().toISOString().split('T')[0];
      const notifKey = `notified_holiday_${user.uid}_${eventCountdown.name}_${todayStr}`;
      const hasNotified = localStorage.getItem(notifKey);
      
      if (!hasNotified) {
        const detail = ISLAMIC_EVENT_DETAILS[eventCountdown.name] || {
          desc: `Hari ini adalah ${eventCountdown.name}. Hari yang istimewa dan mulia bagi seluruh umat Islam. Mari isi dengan amalan kebaikan, dzikir, dan mempererat tali silaturahmi.`,
          icon: '🌟'
        };
        
        createNotification(
          user.uid,
          'holiday',
          eventCountdown.name,
          detail.desc,
          {
            senderId: 'system',
            senderName: 'Santri AI',
            targetId: 'holiday_detail'
          }
        ).then(() => {
          localStorage.setItem(notifKey, 'true');
        }).catch((err) => {
          console.error("Failed to create holiday notification:", err);
        });
      }
    }
  }, [user, eventCountdown]);

  // Handle opening holiday popup from notifications (location state)
  useEffect(() => {
    if (location.state && (location.state as any).openHolidayPopup) {
      const holidayName = (location.state as any).holidayName;
      if (holidayName) {
        const detail = ISLAMIC_EVENT_DETAILS[holidayName] || {
          desc: `Hari ini adalah ${holidayName}. Hari yang istimewa dan mulia bagi seluruh umat Islam. Mari isi dengan amalan kebaikan, dzikir, dan mempererat tali silaturahmi.`,
          icon: '🌟',
          bg: 'from-emerald-600 via-teal-700 to-green-800',
          text: 'text-white'
        };
        setSelectedHolidayDetail({
          name: holidayName,
          ...detail
        });
      }
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surahData, hadithData, newsData] = await Promise.all([
          getAllSurahs(), 
          getHadithBooks(),
          fetchListFromGitHub('news').catch(() => [])
        ]);
        setSurahs(surahData);
        setHadiths(hadithData);

        let mergedNews: any[] = [];
        const local = localStorage.getItem('santri_news_list');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) mergedNews = parsed;
          } catch (e) {}
        }
        if (Array.isArray(newsData)) {
          mergedNews = [...mergedNews, ...newsData.flat(Infinity)];
        }
        
        // Initial feature news fallback
        const initialFeatureNews = [
          {
            id: 'news-fitur-hitung-haid',
            title: 'Fitur Hitung Haid Santri AI: Solusi Digital Fiqih Wanita Membedakan Darah Haid, Nifas, dan Istihadhah',
            excerpt: 'Santri AI menghadirkan kalkulator pintar fiqih kewanitaan berbasis rujukan kitab klasik mazhab Syafi\'i untuk membantu muslimah mencatat dan menghitung masa suci serta ibadah dengan tepat.',
            category: 'Tekno-Islam',
            image_url: 'https://image.pollinations.ai/prompt/photorealistic%20editorial%20photo%20of%20indonesian%20muslim%20santriwati%20wearing%20modest%20hijab%20studying%20islamic%20books%20with%20tablet%20in%20pesantren%20library%2C%20fully%20covered%20aurat%2C%20natural%20lighting%2C%208k?width=1200&height=675&nologo=true&seed=101',
            author: 'Redaksi Santri AI',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            source: 'Warta Santri'
          },
          {
            id: 'news-fitur-jadwal-sholat',
            title: 'Akurat & Tepat Waktu: Fitur Jadwal Sholat dan Kompas Arah Kiblat Santri AI Berbasis Geolocation',
            excerpt: 'Memadukan algoritma hisab falak kontemporer dan GPS presisi tinggi, Santri AI memastikan pengingat adzan lima waktu dan kompas kiblat hadir akurat di manapun santri berada.',
            category: 'Warta',
            image_url: 'https://image.pollinations.ai/prompt/photorealistic%20editorial%20photo%20of%20indonesian%20santri%20wearing%20black%20peci%20songkok%20and%20koko%20shirt%20praying%20in%20majestic%20mosque%2C%20peaceful%20islamic%20atmosphere%2C%20natural%20lighting%2C%208k?width=1200&height=675&nologo=true&seed=202',
            author: 'Redaksi Santri AI',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            source: 'Warta Santri'
          },
          {
            id: 'news-fitur-warta-santri',
            title: 'Warta Santri AI: Wadah Jurnalisme Positif & Kolaborasi Literasi Digital Pesantren Nusantara',
            excerpt: 'Portal Warta Santri membuka ruang bagi santri untuk menulis kabar, hikmah, dan kajian pesantren dengan bantuan asisten redaksi AI serta ilustrasi foto jurnalistik yang syar\'i.',
            category: 'Pesantren',
            image_url: 'https://image.pollinations.ai/prompt/photorealistic%20editorial%20photo%20of%20indonesian%20santri%20students%20collaborating%20writing%20articles%20in%20pesantren%2C%20wearing%20black%20peci%20songkok%20and%20modest%20hijab%2C%208k?width=1200&height=675&nologo=true&seed=303',
            author: 'Redaksi Santri AI',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
            source: 'Warta Santri'
          }
        ];

        mergedNews = [...mergedNews, ...initialFeatureNews];
        const seenIds = new Set<string>();
        const finalNewsList: any[] = [];
        for (const item of mergedNews.flat(Infinity)) {
          if (item && item.id && !seenIds.has(item.id)) {
            seenIds.add(item.id);
            finalNewsList.push(item);
          }
        }
        setNews(finalNewsList);
        
        const doaRes = await fetch('https://raw.githubusercontent.com/Kopeahku/hadisku/main/assets/file/doa-harian.json');
        if (doaRes.ok) {
            const doaData = await doaRes.json();
            setDoas(doaData);
        }
      } catch (e) { /* */ }
    };
    fetchData();
  }, []);

  // Daily Attendance Reminder Notification trigger
  useEffect(() => {
    if (user && userData) {
      const isReminderEnabled = settings?.dailyAttendanceReminderEnabled !== false;
      const today = new Date().toISOString().split('T')[0];
      const hasCheckedInToday = userData.lastCheckIn === today;

      if (isReminderEnabled && !hasCheckedInToday && !hasTriggeredCheckInNotificationRef.current) {
        hasTriggeredCheckInNotificationRef.current = true;
        
        // Android or Browser HTML5 Notifications
        const title = "Klaim Wasilah Gratis Hari Ini! 🌟";
        const message = "Assalamu'alaikum Santri! Anda belum melakukan absensi harian. Klaim +1 Wasilah & +10 XP sekarang.";
        
        if (window.AndroidNativeInterface && typeof window.AndroidNativeInterface.showNotification === 'function') {
          try {
            window.AndroidNativeInterface.showNotification(title, message, 'broadcast');
          } catch (e) {
            console.error("Gagal memicu notifikasi Android:", e);
          }
        } else if (typeof Notification !== 'undefined') {
          if (Notification.permission === "granted") {
            new Notification(title, { body: message });
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
              if (permission === "granted") {
                new Notification(title, { body: message });
              }
            });
          }
        }
      }
    }
  }, [user, userData, settings]);

  useEffect(() => {
    if (!searchQuery.trim()) { setIsSearching(false); return; }
    setIsSearching(true);
    const q = searchQuery.toLowerCase();
    
    const matchedFeatures = SEARCHABLE_FEATURES.filter(f => f.label.toLowerCase().includes(q)).slice(0, 3);
    const matchedSurahs = surahs.filter(s => s.name_latin.toLowerCase().includes(q)).slice(0, 3);
    const matchedHadiths = hadiths.filter(h => h.name.toLowerCase().includes(q)).slice(0, 2);
    const matchedDoas = doas.filter(d => d.nama.toLowerCase().includes(q)).slice(0, 3);
    const matchedHist = history.filter(h => h.title.toLowerCase().includes(q) || (h.subtitle && h.subtitle.toLowerCase().includes(q))).slice(0, 3);

    setSearchResults({ 
      features: matchedFeatures, 
      surahs: matchedSurahs, 
      hadiths: matchedHadiths, 
      doas: matchedDoas, 
      history: matchedHist 
    });
  }, [searchQuery, history, surahs, hadiths, doas]);

  useEffect(() => {
    if (location.state && (location.state as any).tab === 'history') {
      setTimeout(() => { historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // NEW: Fetch Mutiara from Supabase
  useEffect(() => {
    setMutiaraLoading(true); 
    setMutiaraError(null);
    const loadMutiaraData = async () => {
        try {
            const data = await fetchListFromGitHub('mutiara'); // Fetch all then slice
            const textOnly = (data as MutiaraData[]).filter(i => i.type === 'quote');
            const sorted = textOnly.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
            setMutiaraItems(sorted); 
        } catch (e) { 
            //
            setMutiaraError("Gagal memuat mutiara."); 
        } finally {
            setMutiaraLoading(false); 
        }
    };
    loadMutiaraData();
  }, [refreshKey]); 

  const handleMutiaraShare = async (item: MutiaraData, e: React.MouseEvent) => {
    e.stopPropagation();
    const cardId = `mutiara-card-${item.id}`;
    const element = document.getElementById(cardId);
    
    if (!element) {
        const text = item.type === 'quote' 
          ? `"${item.content}" - ${item.scholar}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}` 
          : `Tonton Kajian: ${item.title}\n${item.url}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
        if (window.AndroidNativeInterface?.shareText) {
            window.AndroidNativeInterface.shareText('Mutiara Ulama', text);
        } else if (navigator.share) {
            await navigator.share({ title: 'Mutiara Ulama', text });
        }
        return;
    }

    setIsSharingImage(item.id || null);
    showToast('Sedang menyiapkan gambar...', 'info');

    try {
        const html2canvas = (window as any).html2canvas;
        if (!html2canvas) throw new Error('html2canvas not loaded');

        const canvas = await html2canvas(element, {
            scale: 2, 
            useCORS: true,
            backgroundColor: null,
            logging: false
        });

        const scholarName = item.scholar.replace(/\s+/g, '_');
        if (window.AndroidNativeInterface?.shareImage) {
            const base64Image = canvas.toDataURL("image/png");
            window.AndroidNativeInterface.shareImage(base64Image, `Mutiara_${scholarName}.png`);
            setIsSharingImage(null);
            return;
        }

        canvas.toBlob(async (blob: Blob | null) => {
            if (!blob) return;
            
            const file = new File([blob], `Mutiara_${scholarName}.png`, { type: 'image/png' });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Mutiara Ulama',
                        text: `Nasehat dari ${item.scholar}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`
                    });
                } catch (shareErr) {
                    //
                }
            } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Mutiara_${item.scholar}.png`;
                a.click();
                showToast('Gambar diunduh (Browser tidak mendukung share file)', 'success');
            }
            setIsSharingImage(null);
        }, 'image/png');

    } catch (err) {
        //
        showToast('Gagal memproses gambar. Membagikan teks saja.', 'warning');
        const text = item.type === 'quote' 
          ? `"${item.content}" - ${item.scholar}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}` 
          : `${item.title || ''}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
        if (window.AndroidNativeInterface?.shareText) {
            window.AndroidNativeInterface.shareText('Mutiara Ulama', text);
        } else if (navigator.share) {
            await navigator.share({ title: 'Mutiara Ulama', text });
        }
        setIsSharingImage(null);
    }
  };

  const activePrayerLabel = useMemo(() => {
    if (!prayerData) return null;
    const now = new Date();
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const times = [
      { label: 'SUBUH', time: prayerData.timings.Fajr.replace(/\s*\(.*?\)\s*/g, '').trim() },
      { label: 'DZUHUR', time: prayerData.timings.Dhuhr.replace(/\s*\(.*?\)\s*/g, '').trim() },
      { label: 'ASHAR', time: prayerData.timings.Asr.replace(/\s*\(.*?\)\s*/g, '').trim() },
      { label: 'MAGHRIB', time: prayerData.timings.Maghrib.replace(/\s*\(.*?\)\s*/g, '').trim() },
      { label: 'ISYA', time: prayerData.timings.Isha.replace(/\s*\(.*?\)\s*/g, '').trim() },
    ];

    let active = null;
    for (let i = 0; i < times.length; i++) {
        if (currentTimeStr >= times[i].time) {
            active = times[i].label;
        }
    }
    
    if (!active) {
        // Jika belum subuh, maka periode aktif adalah Isya
        active = 'ISYA';
    }
    
    return active;
  }, [prayerData]);

  const handleAiSearch = () => { 
    if (!searchQuery.trim()) return; 
    if (!user) {
      showToast("Tanya Santri (AI Search) memerlukan login.", "info");
      navigate('/settings');
      return;
    }
    navigate('/explanation', { state: { query: searchQuery } }); 
    setSearchQuery(''); 
    setIsSearching(false); 
  };
  const handleRefreshLocation = (e: React.MouseEvent) => { e.stopPropagation(); refreshLocation(); };
  
  const handleFeatureClick = (item: any) => {
    // Pengecekan status login untuk fitur-fitur yang dibatasi
    const restrictedIds = ['top', 'com', 'creator', 'tahfidz', 'terjemah', 'bahtsul_masail'];
    if (restrictedIds.includes(item.id) && !user) {
      let reason = 'Menu ini';
      if (item.id === 'com') reason = 'Silaturahmi';
      else if (item.id === 'top') reason = 'Papan Peringkat';
      else if (item.id === 'creator') reason = 'Creator AI';
      else if (item.id === 'tahfidz') reason = 'Tahfidz Tracker';
      else if (item.id === 'terjemah') reason = 'Fitur Terjemahan';
      else if (item.id === 'bahtsul_masail') reason = 'Bahtsul Masail';

      showToast(`${reason} memerlukan login. Silakan masuk terlebih dahulu.`, "info");
      navigate('/settings', { state: { from: item.id } });
      return;
    }

    if (['media', 'amalan', 'wanita', 'hitung', 'more', 'belajar', 'harian'].includes(item.id)) { 
      setActiveSubMenu(item.id); 
      return; 
    }
    if (item.path) { 
      if (item.path.startsWith('http')) window.open(item.path, '_blank'); 
      else if (item.path === '/quiz' || item.label === "Cerdas Cermat") {
        triggerInterstitial("Cerdas Cermat", () => {
          navigate(item.path, { state: item.state });
          setActiveSubMenu(null);
        });
      }
      else { navigate(item.path, { state: item.state }); setActiveSubMenu(null); } 
    } 
    else { showToast('Fitur akan segera hadir!', 'info'); }
  };

  const handleOpenQuiz = () => {
    triggerInterstitial("Cerdas Cermat", () => {
      if (user) navigate('/quiz-pro'); 
      else navigate('/quiz');
    });
  };
  const getIndoHijriMonth = (en: string) => HIJRI_MONTHS_ID[en] || en;
  const formatIndoDate = (dateStr?: string) => { if (!dateStr) return ''; const date = new Date(dateStr); return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date); };
  const filteredHistory = history.filter(item => { if (!searchQuery) return true; const q = searchQuery.toLowerCase(); return (item.title.toLowerCase().includes(q) || (item.subtitle && item.subtitle.toLowerCase().includes(q))); });

  return (
    <div className="pb-24 pt-0 min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 relative">
      <header className="px-5 py-2 flex items-center justify-between bg-[#004d00] dark:bg-santri-green-dark border-b border-white/10 sticky top-0 z-[60] backdrop-blur-md transition-colors relative overflow-hidden">
        {/* Premium Geometric Star Pattern Background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 0l4 12 12 4-12 4-4 12-4-12-12-4 12-4z' fill='white' fill-opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }}></div>

        {/* 8-Pointed Star Ornaments (Corners) */}
        <div className="absolute top-0 right-0 p-1 text-white/10 rotate-12">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
          </svg>
        </div>
        <div className="absolute -bottom-4 -left-4 p-1 text-white/5 -rotate-12">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
          </svg>
        </div>

        <div className="w-full h-full grid grid-cols-3 items-center relative z-10">
          {/* Left Side: Wasilah Balance */}
          <div className="flex items-center justify-start">
             <div className="flex items-center bg-cyan-500/10 hover:bg-cyan-500/20 rounded-full border border-cyan-500/25 shadow-sm transition-all backdrop-blur-md overflow-hidden h-8">
                <button 
                  onClick={() => navigate(user ? '/redeem' : '/settings')} 
                  className="flex items-center gap-1.5 pl-2.5 py-1.5 pr-2 border-r border-cyan-500/15 active:scale-95 transition-transform"
                >
                   <Gem size={14} className="text-cyan-400 fill-cyan-400/20 animate-pulse" />
                   <div className="flex items-baseline gap-1">
                     <span className="text-[10px] sm:text-[11px] font-black text-cyan-50 tracking-tight">
                       {showBalance ? (user ? (userData?.wasilah || 0).toLocaleString() : '0') : '••••'}
                     </span>
                     <span className="hidden xs:inline text-[7px] font-bold text-cyan-200/60 uppercase tracking-widest leading-none">Wasilah</span>
                   </div>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowBalance(!showBalance); }}
                  className="px-2 h-full flex items-center justify-center text-amber-200/40 hover:text-amber-100 active:scale-90 transition-all"
                >
                  {showBalance ? <Eye size={11} /> : <EyeOff size={11} />}
                </button>
             </div>
          </div>

          {/* Center: App Name */}
          <div className="flex items-center justify-center pointer-events-none">
             <h1 className="text-sm sm:text-lg font-black tracking-[0.2em] sm:tracking-[0.3em] text-white drop-shadow-md text-nowrap">SANTRI AI</h1>
          </div>

          {/* Right Side: Notifications & Profile */}
          <div className="flex items-center justify-end gap-1.5">
             <button onClick={() => navigate('/notifications')} className="relative p-1.5 text-white bg-white/10 rounded-lg hover:bg-white/20 transition-all active:scale-90 flex items-center justify-center border border-white/5 h-8 w-8" title="Notifikasi">
                <span className="text-base leading-none select-none">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full border border-white dark:border-slate-900 shadow-sm flex items-center justify-center px-1 text-[9px] font-bold text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
             </button>

              <button 
                onClick={() => navigate('/profile')} 
                className="relative active:scale-90 transition-all"
              >
                <UserAvatar 
                  photoURL={userData?.avatarUrl || userData?.photoURL || user?.photoURL}
                  displayName={user?.displayName}
                  points={userData?.points || 0}
                  size="sm"
                  avatarFrame={userData?.avatarFrame}
                  verificationBadge={userData?.verificationBadge || 'none'}
                />
              </button>
          </div>
        </div>
      </header>

      {/* Running Announcement Text (Marquee) */}
      {(() => {
        const todayHijri = getHijriDate(new Date(), true);
        const isNewYearPeriod = (todayHijri.month === 12 && todayHijri.day >= 29) || (todayHijri.month === 1 && todayHijri.day === 1);
        if (!isNewYearPeriod) return null;
        return (
          <div className="bg-amber-500 dark:bg-amber-600 text-slate-950 dark:text-slate-950 text-[11px] font-bold uppercase flex items-center py-1.5 px-4 shadow-sm border-b border-amber-400 relative z-50">
            <span className="bg-slate-950 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm mr-3 shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
              PENTING ✨
            </span>
            {/* @ts-ignore */}
            <marquee className="flex-1 whitespace-nowrap text-xs font-bold tracking-wide" scrollamount="4">
              🕌 REMINDER AKHIR TAHUN HIJRIAH: JANGAN LEWATKAN UNTUK MEMBACA DOA AKHIR TAHUN SEBELUM MASUK WAKTU MAGHRIB, DAN DOA AWAL TAHUN SETELAH MEMASUKI WAKTU MAGHRIB (1 MUHARRAM) UNTUK KEBERKAHAN SEPANJANG TAHUN. KLIK MENU KALENDER UNTUK MEMBUKA PANDUAN TIAP TANGGAL MERAH, LAFADZ ARAB, SEJARAH, DAN ARTINYA SECARA LENGKAP!
            {/* @ts-ignore */}
            </marquee>
          </div>
        );
      })()}

      {/* Config Warning */}
      {!isFirebaseReady() && (
        <div className="bg-amber-50 dark:bg-amber-950/20 px-5 py-3 border-b border-amber-200 dark:border-amber-900/40 flex items-start gap-3 animate-in slide-in-from-top duration-300">
           <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600">
              <AlertTriangle size={20} />
           </div>
           <div className="flex-1">
              <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider mb-0.5">Firebase Belum Aktif</h4>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium leading-tight">
                Sistem mendeteksi kunci API placeholder. Fitur cloud (Poin, Chat AI, Community) mungkin tidak berjalan lancar.
              </p>
           </div>
           <button 
            onClick={() => navigate('/settings')}
            className="px-3 py-1.5 bg-amber-600 text-white text-[9px] font-black rounded-lg shadow-sm active:scale-95 transition-transform"
           >
              KONFIGURASI
           </button>
        </div>
      )}

      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div onClick={() => navigate('/prayer-times')} className="relative overflow-hidden bg-[#e6ce9e] dark:bg-santri-green-dark text-white shadow-xl mb-0 cursor-pointer active:opacity-95 transition-all">
            
            {/* Layer 1: Background Geometric Pattern (Proper Rub el Hizb) */}
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='%23d4af37' stroke-width='1.2'%3E%3Crect x='30' y='30' width='40' height='40'/%3E%3Crect x='30' y='30' width='40' height='40' transform='rotate(45 50 50)'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '80px 80px'
            }}></div>

            {/* Layer 2: Main Emerald Arch with Lattice */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
               <div className="absolute inset-0 bg-gradient-to-b from-[#004d00] to-[#003300] shadow-[inset_0_0_60px_rgba(0,0,0,0.6)]" style={{
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)'
               }}>
                  {/* Lattice Mesh Overlay */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='none' stroke='white' stroke-width='0.5'%3E%3Crect x='10' y='10' width='20' height='20'/%3E%3Crect x='10' y='10' width='20' height='20' transform='rotate(45 20 20)'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '25px 25px'
                  }}></div>
               </div>
               
               {/* Golden Border for Arch */}
               <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                  <path d="M0,85 Q50,100 100,85" fill="none" stroke="#D4AF37" strokeWidth="3" className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]" />
               </svg>
            </div>

            <div className="relative z-10">
              <div className="grid grid-cols-5 text-center border-b border-white/10 bg-black/20 backdrop-blur-sm">
              {[{ label: 'SUBUH', time: prayerData?.timings.Fajr || '--:--' }, { label: 'DZUHUR', time: prayerData?.timings.Dhuhr || '--:--' }, { label: 'ASHAR', time: prayerData?.timings.Asr || '--:--' }, { label: 'MAGHRIB', time: prayerData?.timings.Maghrib || '--:--' }, { label: 'ISYA', time: prayerData?.timings.Isha || '--:--' }].map((p, i) => { 
                const displayTime = p.time.replace(/\s*\(.*?\)\s*/g, ''); 
                const isNext = p.label.toLowerCase() === nextPrayer?.name.toLowerCase(); 
                const isActive = p.label === activePrayerLabel;
                
                let highlightClass = '';
                let labelClass = 'text-green-50 opacity-80';
                let timeClass = 'font-bold text-white';
                
                if (isActive) {
                  highlightClass = 'bg-red-500 text-white animate-pulse';
                  labelClass = 'text-white font-black';
                  timeClass = 'font-black text-white';
                } else if (isNext) {
                  highlightClass = 'border-b-2 border-santri-gold';
                  labelClass = 'text-santri-gold font-black';
                  timeClass = 'font-bold text-white';
                }

                return ( 
                  <div key={i} className={`py-0.5 pt-1.5 flex flex-col items-center justify-center transition-all duration-300 relative ${highlightClass}`}> 
                    <span className={`text-[8px] uppercase tracking-wider mb-0 ${labelClass}`}>{p.label}</span> 
                    <span className={`text-xs ${timeClass}`}>{displayTime}</span> 
                  </div> 
                ); 
              })}
            </div>
            <div className="flex justify-between items-center px-4 py-1 bg-black/10 backdrop-blur-sm">
                <div onClick={handleRefreshLocation} className="flex items-center gap-2 cursor-pointer active:opacity-70 transition-opacity hover:bg-white/5 p-1 rounded-lg">
                  <MapPin size={18} strokeWidth={2} className="text-santri-gold" />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-white leading-tight">{locationName}</span>
                    <span className="text-[10px] text-green-200 font-medium underline decoration-green-300/50 hover:text-white flex items-center gap-1">
                      {prayerLoading ? <Loader2 size={10} className="animate-spin" /> : null} Ganti Lokasi
                    </span>
                  </div>
                </div>
              <div onClick={(e) => { e.stopPropagation(); navigate('/calendar'); }} className="flex flex-col items-end cursor-pointer active:opacity-70 transition-opacity hover:bg-white/5 p-1 rounded-lg">
                <div className="text-xs font-bold text-santri-gold flex items-center gap-1">
                  <span>{(() => {
                    const h = getHijriDate(new Date());
                    return h.day ? `${h.day} ${h.monthName} ${h.yearStr} H` : '--';
                  })()}</span>
                  <ArrowRight size={12} strokeWidth={3} />
                </div>
                <span className="text-[11px] text-green-100 font-medium mr-1">{formatIndoDate(prayerData?.date.readable)}</span>
              </div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-md border-t border-white/10 overflow-hidden h-8 flex items-center relative">
               <div className="flex whitespace-nowrap animate-marquee">
                 <div className="flex items-center gap-4 px-10">
                    <div className="flex items-center gap-2">
                       <div className="text-santri-gold animate-pulse"><Activity size={18} strokeWidth={3} /></div>
                       <span className="text-xs font-bold tracking-widest uppercase text-white/90">MENUJU {nextPrayer?.name || 'SHOLAT'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="font-mono text-xl font-black text-santri-gold tracking-tight">{countdown || "00:00:00"}</span>
                       
                    </div>
                 </div>

                 {eventCountdown && (
                    <div className="flex items-center gap-4 px-10 border-l border-white/10">
                       <div className="flex items-center gap-2">
                          <div className="text-amber-400"><CalendarClock size={18} strokeWidth={3} /></div>
                          <span className="text-xs font-bold tracking-widest uppercase text-white/90">{eventCountdown.days === 0 ? "HARI INI" : `${eventCountdown.days} HARI LAGI`}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-santri-gold tracking-tight uppercase">{eventCountdown.name}</span>
                          <div className="p-1 bg-white/20 rounded-full"><Star size={10} className="fill-current text-yellow-300" /></div>
                       </div>
                    </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 pt-4">
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          {/* Islamic Event/Holiday Celebration Banner Card */}
          {eventCountdown && eventCountdown.days === 0 && (
            <div 
              onClick={() => {
                const detail = ISLAMIC_EVENT_DETAILS[eventCountdown.name] || {
                  desc: `Hari ini adalah ${eventCountdown.name}. Hari yang istimewa dan mulia bagi seluruh umat Islam. Mari isi dengan amalan kebaikan, dzikir, dan mempererat tali silaturahmi.`,
                  icon: '🌟',
                  bg: 'from-emerald-600 via-teal-700 to-green-800',
                  text: 'text-white'
                };
                setSelectedHolidayDetail({
                  name: eventCountdown.name,
                  ...detail
                });
              }}
              className={`mb-4 relative overflow-hidden bg-gradient-to-r ${
                (ISLAMIC_EVENT_DETAILS[eventCountdown.name] || {}).bg || 'from-emerald-600 via-teal-700 to-green-800'
              } rounded-3xl p-4 text-white shadow-xl shadow-emerald-100 dark:shadow-none cursor-pointer group animate-in fade-in slide-in-from-top-4 duration-300 border border-white/10`}
            >
              {/* Islamic Elegant Background watermark */}
              <div 
                className="absolute inset-0 opacity-[0.12] pointer-events-none"
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z'/%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z' transform='rotate(45 60 60)'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '90px 90px'
                }}
              />
              
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0 text-2xl">
                    {(ISLAMIC_EVENT_DETAILS[eventCountdown.name] || {}).icon || '✨'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-black tracking-widest text-yellow-300 uppercase leading-none">HARI BESAR ISLAM</span>
                      {eventCountdown.isHoliday && (
                        <span className="text-[8px] font-black bg-red-500/80 text-white px-1.5 py-0.5 rounded-full leading-none">HARI LIBUR</span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold tracking-tight text-white line-clamp-1 leading-snug">
                      {eventCountdown.name}
                    </h3>
                    <p className="text-[10px] text-emerald-100 dark:text-teal-100 font-medium line-clamp-1 mt-0.5">
                      {(ISLAMIC_EVENT_DETAILS[eventCountdown.name] || {}).desc || 'Klik untuk melihat keutamaan dan amalan hari ini.'}
                    </p>
                  </div>
                </div>
                
                <div className="shrink-0 animate-pulse">
                  <div className="bg-yellow-400 p-2.5 rounded-full text-slate-900 shadow-lg group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={14} strokeWidth={4} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Daily Attendance Reminder Banner Card */}
          {user && userData && (settings?.dailyAttendanceReminderEnabled !== false) && userData.lastCheckIn !== new Date().toISOString().split('T')[0] && (
            <div 
              onClick={isCheckingIn ? undefined : handleHomeCheckIn}
              className={`mb-4 relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-700 to-green-800 rounded-3xl p-4 text-white shadow-xl shadow-emerald-100 dark:shadow-none cursor-pointer group animate-in fade-in slide-in-from-top-4 duration-300 ${isCheckingIn ? 'opacity-80 cursor-default' : ''}`}
            >
              {/* Decorative Subtle Star Pattern */}
              <div 
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '80px 80px'
                }}
              />
              
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                    {isCheckingIn ? (
                      <Loader2 size={20} className="text-white animate-spin" />
                    ) : (
                      <CalendarCheck size={22} className="text-yellow-300 animate-bounce" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[10px] font-black tracking-wider text-yellow-300 uppercase leading-none mb-1">PENGINGAT ABSEN</h4>
                    <h3 className="text-sm font-extrabold tracking-tight text-white line-clamp-1 leading-snug">
                      {isCheckingIn ? 'Sedang Melakukan Absensi...' : 'Klaim Wasilah & Poin Gratis Hari Ini!'}
                    </h3>
                    <p className="text-[10px] text-emerald-100 font-medium">
                      {isCheckingIn ? 'Harap tunggu sebentar, data Anda sedang disimpan.' : 'Klik untuk check-in sekarang dan dapatkan free Wasilah.'}
                    </p>
                  </div>
                </div>
                
                <div className="shrink-0 animate-pulse">
                  <div className="bg-yellow-400 p-2 rounded-full text-slate-900 shadow-lg group-hover:translate-x-1 transition-transform">
                    {isCheckingIn ? (
                      <Loader2 size={14} className="text-slate-900 animate-spin" />
                    ) : (
                      <ArrowRight size={14} strokeWidth={4} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4 Banners 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* 1. Banner Tanya Santri AI */}
            <div 
              onClick={() => { 
                if (!user) {
                  showToast("Tanya Santri memerlukan login.", "info");
                  navigate('/settings');
                  return;
                }
                navigate('/chat-ai', { state: { query: searchQuery } }); 
                setSearchQuery(''); 
              }}
              className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-800 rounded-3xl p-3.5 text-white shadow-lg shadow-indigo-500/10 cursor-pointer group active:scale-[0.97] transition-all flex flex-col justify-between border border-indigo-400/20"
            >
              <div className="absolute inset-0 opacity-[0.1] pointer-events-none" style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z'/%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z' transform='rotate(45 60 60)'/%3E%3Cpath d='M60 30 L67 53 L90 60 L67 67 L60 90 L53 67 L30 60 L53 53 Z' stroke-width='1' opacity='0.7'/%3E%3Cpath d='M60 30 L67 53 L90 60 L67 67 L60 90 L53 67 L30 60 L53 53 Z' stroke-width='1' opacity='0.7' transform='rotate(45 60 60)'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '80px 80px'
              }}></div>

              <div className="relative z-10 flex items-center justify-between mb-2">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/25 shadow-md group-hover:scale-110 transition-transform shrink-0">
                  <Brain size={18} className="text-amber-300" />
                </div>
                <span className="bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-white/30 backdrop-blur-md flex items-center gap-0.5">
                  TANYA <ChevronRight size={10} />
                </span>
              </div>

              <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-tight text-white line-clamp-1">TANYA SANTRI AI</h3>
                <p className="text-white/80 text-[10px] font-medium leading-tight line-clamp-1 mt-0.5">Bimbingan & Konsultasi AI</p>
              </div>
            </div>

            {/* 2. Banner Creator AI */}
            <div 
              onClick={() => {
                if (!user) {
                  showToast("Creator AI memerlukan login.", "info");
                  navigate('/settings');
                  return;
                }
                navigate('/creator-hub');
              }}
              className="relative overflow-hidden bg-slate-900 rounded-3xl p-3.5 text-white shadow-lg border border-purple-500/30 cursor-pointer group active:scale-[0.97] transition-all flex flex-col justify-between"
            >
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-purple-600/20 rounded-full blur-[25px]"></div>
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l4 16 16 4-16 4-4 16-4-16-16-4 16-4z' fill='white'/%3E%3C/svg%3E")`,
                backgroundSize: '20px 20px'
              }}></div>

              <div className="relative z-10 flex items-center justify-between mb-2">
                <div className="w-9 h-9 bg-purple-500/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-purple-500/30 shadow-md group-hover:scale-110 transition-transform shrink-0">
                  <Sparkles size={18} className="text-purple-300" />
                </div>
                <span className="bg-amber-400 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">BETA</span>
              </div>

              <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-tight text-white line-clamp-1">CREATOR AI</h3>
                <p className="text-white/80 text-[10px] font-medium leading-tight line-clamp-1 mt-0.5">Audio, Nasyid & Visual</p>
              </div>
            </div>

            {/* 3. Banner Toko Santri AI */}
            <div 
              onClick={() => navigate('/marketplace')}
              className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-600 to-red-600 rounded-3xl p-3.5 text-white shadow-lg shadow-orange-500/10 cursor-pointer group active:scale-[0.97] transition-all flex flex-col justify-between border border-orange-400/30"
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l4 16 16 4-16 4-4 16-4-16-16-4 16-4z' fill='white'/%3E%3C/svg%3E")`,
                backgroundSize: '20px 20px'
              }}></div>

              <div className="relative z-10 flex items-center justify-between mb-2">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/25 shadow-md group-hover:scale-110 transition-transform shrink-0">
                  <Store size={18} className="text-yellow-200" />
                </div>
                <span className="bg-yellow-400 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">KATALOG</span>
              </div>

              <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-tight text-white line-clamp-1">TOKO SANTRI</h3>
                <p className="text-white/90 text-[10px] font-medium leading-tight line-clamp-1 mt-0.5">Kitab, Busana & Karya</p>
              </div>
            </div>

            {/* 4. Banner Upgrade Santri Pro */}
            <div 
              onClick={() => navigate('/premium')}
              className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-3.5 text-white shadow-lg border border-amber-500/30 cursor-pointer group active:scale-[0.97] transition-all flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl"></div>

              <div className="relative z-10 flex items-center justify-between mb-2">
                <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform shrink-0 border border-amber-300/30">
                  <Crown size={18} className="text-slate-950 fill-slate-950/10" />
                </div>
                <span className="bg-amber-400 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">PRO</span>
              </div>

              <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-tight text-white line-clamp-1">
                  {userData?.isPremium ? 'SANTRI PRO' : 'UPGRADE PRO'}
                </h3>
                <p className="text-white/80 text-[10px] font-medium leading-tight line-clamp-1 mt-0.5">
                  {userData?.isPremium ? 'Akses Fitur Premium' : 'Ilmu Hikmah & Premium'}
                </p>
              </div>
            </div>
          </div>

          {/* Bookmarked / Pinned Quick Access (if any) */}
          {(() => {
            const pinnedFeatures = ALL_SUB_FEATURES.filter(item => bookmarkedLabels.includes(item.label));
            if (pinnedFeatures.length === 0) return null;
            
            return (
              <div className="mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-1.5 px-1 mb-2 text-amber-500 dark:text-amber-400 font-extrabold text-[10.5px] uppercase tracking-wider">
                  <Star size={12} className="fill-amber-500 text-amber-500" />
                  <span>Akses Cepat Tersemat</span>
                </div>
                <div className="grid grid-cols-4 gap-3 bg-gradient-to-br from-amber-500/10 to-orange-500/5 dark:from-amber-950/20 dark:to-orange-950/10 p-4 rounded-[2rem] border border-amber-200/50 dark:border-amber-900/30">
                  {pinnedFeatures.map((item, idx) => (
                    <FeatureButton 
                      key={`quick-pinned-${idx}`} 
                      item={item} 
                      onClick={() => handleFeatureClick(item)} 
                      isBookmarked={true}
                      onToggleBookmark={() => {
                        toggleBookmarkFeature(item.label);
                        showToast(`Penanda untuk "${item.label}" dihapus`, "success");
                      }}
                      showBookmarkStar={true}
                    />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Main 8-Box Grid */}
          <div className="mb-4 grid grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 relative z-0">
            {MAIN_FEATURES.map((item, idx) => (
              <FeatureButton key={idx} item={item} onClick={() => handleFeatureClick(item)} />
            ))}
          </div>

          {/* Quick Game Access Banner */}
          <div 
            onClick={() => navigate('/game')}
            className="mb-6 relative overflow-hidden bg-gradient-to-r from-orange-400 to-amber-500 rounded-3xl p-4 text-white shadow-lg shadow-orange-100 dark:shadow-none cursor-pointer group active:scale-[0.98] transition-all"
          >
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 text-2xl select-none">
                  🎮
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight">Main Game Islami</h3>
                  <p className="text-white/80 text-[10px] font-medium">Uji Wawasan & Dapat Wasilah</p>
                </div>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-white/30 backdrop-blur-md flex items-center gap-1">
                MAIN <ChevronRight size={12} />
              </div>
            </div>
            {/* Animated Stars */}
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="absolute -right-4 -top-4 text-white/10"
            >
               <Sparkles size={60} />
            </motion.div>
          </div>

          {/* WhatsApp Group Santri AI Banner */}
          <motion.a
            href="https://chat.whatsapp.com/Jr6Aq0VrJgxItOyoBwnSrs?s=sh&p=a&mlu=4"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => shareWaGroup(e, showToast)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="mb-6 flex items-center justify-between p-4 bg-gradient-to-r from-emerald-800 via-[#005a2b] to-teal-800 text-white rounded-3xl shadow-lg shadow-emerald-900/10 hover:shadow-xl transition-all border border-emerald-500/30 group relative overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
            <div className="relative z-10 flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/25 shadow-xs">
                <WhatsAppIcon size={24} colored={true} />
              </div>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white truncate">Grup WhatsApp Santri AI</h3>
                  <span className="px-2 py-0.5 bg-amber-400 text-amber-950 text-[8px] font-black rounded-full uppercase shrink-0">Resmi</span>
                </div>
                <p className="text-emerald-100/90 text-[10px] font-medium leading-tight mt-0.5 truncate">Silaturahmi & Diskusi</p>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-widest group-hover:bg-amber-300 group-hover:text-amber-950 transition-colors shadow-xs shrink-0">
              GABUNG <ExternalLink size={12} />
            </div>
          </motion.a>

          {/* Banners Grid (Left-Right) */}
          <div className="mb-6 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4">
            {/* Banner Top Santri */}
            <div 
              onClick={() => {
                if (!user) {
                  showToast("Papan Peringkat memerlukan login. Silakan masuk terlebih dahulu.", "info");
                  navigate('/settings', { state: { from: 'top' } });
                } else {
                  navigate('/leaderboard');
                }
              }}
              className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-3xl p-4 text-white shadow-lg shadow-amber-100 dark:shadow-none cursor-pointer group active:scale-[0.98] transition-all duration-300"
            >
              {/* Islamic Pattern Watermark */}
              <div className="absolute inset-0 opacity-[0.1] pointer-events-none" style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z'/%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z' transform='rotate(45 60 60)'/%3E%3Cpath d='M60 30 L67 53 L90 60 L67 67 L60 90 L53 67 L30 60 L53 53 Z' stroke-width='1' opacity='0.7'/%3E%3Cpath d='M60 30 L67 53 L90 60 L67 67 L60 90 L53 67 L30 60 L53 53 Z' stroke-width='1' opacity='0.7' transform='rotate(45 60 60)'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '100px 100px'
              }}></div>

              <div className="relative z-10">
                <div className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-lg mb-3 group-hover:scale-110 transition-transform text-2xl select-none">
                  🏆
                </div>
                <h3 className="text-sm font-black uppercase tracking-tighter leading-none mb-1">Top Santri</h3>
                <p className="text-white/80 text-[9px] font-medium leading-tight">Peringkat & Poin Prestasi Santri.</p>
              </div>
            </div>

            {/* Banner Dukung Dakwah (Infaq) */}
            <div 
              onClick={() => navigate('/donation')}
              className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-700 to-santri-green-dark rounded-3xl p-4 text-white shadow-lg shadow-green-100 dark:shadow-none cursor-pointer group active:scale-[0.98] transition-all duration-300"
            >
              {/* Islamic Pattern Watermark */}
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z'/%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z' transform='rotate(45 60 60)'/%3E%3Cpath d='M60 30 L67 53 L90 60 L67 67 L60 90 L53 67 L30 60 L53 53 Z' stroke-width='1' opacity='0.7'/%3E%3Cpath d='M60 30 L67 53 L90 60 L67 67 L60 90 L53 67 L30 60 L53 53 Z' stroke-width='1' opacity='0.7' transform='rotate(45 60 60)'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '100px 100px'
              }}></div>

              <div className="relative z-10">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-lg mb-3 group-hover:scale-110 transition-transform">
                  <HeartHandshake size={20} className="text-white" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-tighter leading-none mb-1">Infaq Dakwah</h3>
                <p className="text-white/80 text-[9px] font-medium leading-tight">Salurkan infaq untuk dakwah santri.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
            <button 
              onClick={() => {
                if (!user) {
                  showToast("Fitur Terjemahan memerlukan login.", "info");
                  navigate('/settings');
                  return;
                }
                navigate('/input');
              }}
              className="w-full bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-3 border-2 border-amber-300 dark:border-amber-500 shadow-sm flex flex-col gap-3 group hover:border-amber-500 dark:hover:border-amber-600 transition-all relative overflow-hidden"
            >
              {/* Islamic Pattern Watermark */}
              <div className="absolute inset-0 opacity-[0.12] pointer-events-none" style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z'/%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z' transform='rotate(45 60 60)'/%3E%3Cpath d='M60 30 L67 53 L90 60 L67 67 L60 90 L53 67 L30 60 L53 53 Z' stroke-width='1' opacity='0.7'/%3E%3Cpath d='M60 30 L67 53 L90 60 L67 67 L60 90 L53 67 L30 60 L53 53 Z' stroke-width='1' opacity='0.7' transform='rotate(45 60 60)'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '100px 100px'
              }}></div>
              <div className="flex items-center justify-between w-full relative z-10">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center text-amber-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
                  <Keyboard size={20} strokeWidth={3} />
                </div>
                <div className="flex items-center gap-1 bg-yellow-100/50 dark:bg-amber-100/20 px-2 py-1 rounded-lg border border-yellow-200/50">
                  <span className="text-[9px] font-black text-slate-800">INPUT</span>
                  <Sparkles size={10} strokeWidth={3} className="text-amber-700" />
                </div>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">Terjemahan</h3>
                <p className="text-slate-800 text-[10px] sm:text-xs font-medium mt-1 leading-tight line-clamp-2">Ketik Arab atau Indonesia</p>
              </div>
            </button>

            <button onClick={handleOpenQuiz} className="w-full bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-3 shadow-lg shadow-purple-200 dark:shadow-purple-900/20 text-white flex flex-col gap-3 group relative overflow-hidden">
              {/* Islamic Pattern Watermark */}
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z'/%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z' transform='rotate(45 60 60)'/%3E%3Cpath d='M60 30 L67 53 L90 60 L67 67 L60 90 L53 67 L30 60 L53 53 Z' stroke-width='1' opacity='0.7'/%3E%3Cpath d='M60 30 L67 53 L90 60 L67 67 L60 90 L53 67 L30 60 L53 53 Z' stroke-width='1' opacity='0.7' transform='rotate(45 60 60)'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '100px 100px'
              }}></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
              <div className="flex items-center justify-between w-full relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <Brain size={20} strokeWidth={2.5} />
                </div>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowRight size={14} />
                </div>
              </div>
              <div className="text-left relative z-10">
                <h3 className="font-bold text-xs sm:text-sm leading-tight">Cerdas Cermat</h3>
                <p className="text-[10px] sm:text-xs text-purple-100 font-medium opacity-90 mt-1 leading-tight line-clamp-2">Uji wawasan keislamanmu</p>
              </div>
            </button>
          </div>
          
          <div className="mb-10">
             <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Newspaper size={18} className="text-emerald-500" /> Warta Santri
                </h3>
                <button onClick={() => navigate('/news')} className="text-xs font-bold text-santri-green dark:text-santri-gold hover:underline">Lihat Semua</button>
             </div>

             {news.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-400">Belum ada berita terbaru hari ini.</p>
                </div>
             ) : (
                <div className="grid grid-cols-2 gap-3">
                    {news.slice(0, 4).map((item, index) => (
                        <button 
                            key={item.id || `news-${index}`} 
                            onClick={() => navigate('/news-detail', { state: { news: item } })}
                            className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col group text-left transition-all active:scale-95"
                        >
                            <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={24}/></div>
                                )}
                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600 text-white text-[8px] font-black rounded-full uppercase tracking-widest">{item.category}</div>
                            </div>
                            <div className="p-3 flex-1 flex flex-col justify-between">
                                <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug mb-2 group-hover:text-emerald-600 transition-colors">{item.title}</h4>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">{new Date(item.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
                                    <ArrowRight size={10} className="text-slate-300 group-hover:text-emerald-500 transition-all group-hover:translate-x-0.5" />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
             )}
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-3 px-1">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Sparkles size={18} className="text-amber-500 fill-amber-500" /> Mutiara Ulama </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setRefreshKey(prev => prev + 1)} className="text-slate-400 hover:text-santri-green transition-colors"><RefreshCw size={16} className={mutiaraLoading ? 'animate-spin' : ''} /></button>
                <button onClick={() => navigate('/mutiara')} className="text-xs font-bold text-santri-green dark:text-santri-gold hover:underline flex items-center gap-1">Lihat Semua <ArrowRight size={14} /></button>
              </div>
            </div>
            {mutiaraError ? (
              <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl text-center text-red-500 text-sm border border-red-100 dark:border-red-900/30">{mutiaraError}</div>
            ) : mutiaraLoading ? (
              <div className="flex justify-center py-12"><Loader2 size={24} className="text-santri-green animate-spin" /></div>
            ) : mutiaraItems.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl text-center text-slate-400 text-sm border border-slate-100 dark:border-slate-800">Belum ada konten mutiara.</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {mutiaraItems.slice(0, 4).map((item, index) => (
                  <div 
                    key={item.id || `mutiara-${index}`} 
                    id={`mutiara-card-${item.id}`}
                    onClick={() => navigate('/mutiara')} 
                    className={`w-full p-4 rounded-3xl flex flex-col justify-between cursor-pointer transition-transform active:scale-95 relative overflow-hidden shadow-lg aspect-[4/5] ${QUOTE_THEMES.find(t => t.id === item.theme)?.class || QUOTE_THEMES[0].class}`}
                  >
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
                    {item.type === 'quote' && (
                      <div className="flex flex-col h-full justify-between relative z-10">
                        <div className="mb-2 flex-grow flex items-center justify-center">
                          <p className="text-sm md:text-base font-serif italic leading-relaxed text-center drop-shadow-md">
                            "{item.content}"
                          </p>
                        </div>
                        <div className="mt-auto pt-3 border-t border-white/20 flex justify-between items-end">
                          <div className="flex-1 min-w-0 pr-1 text-left">
                            <p className="text-[10px] font-bold truncate">{item.scholar}</p>
                            <p className="text-[9px] opacity-80 truncate">{item.role}</p>
                          </div>
                          <button 
                            onClick={(e) => handleMutiaraShare(item, e)} 
                            disabled={isSharingImage === item.id}
                            className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-all border border-white/20 shadow-sm"
                          >
                            {isSharingImage === item.id ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} className="text-white" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div ref={historyRef} className="mt-4 mb-8 border-t-2 border-slate-100 dark:border-slate-800 pt-6"><h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-4 flex items-center gap-2"><HistoryIcon size={22} strokeWidth={3} className="text-santri-green dark:text-santri-gold" /> Riwayat Aktivitas</h3><HistoryScreen history={searchQuery ? filteredHistory : history} /></div>
        </div>
      </div>

      {/* Sub-menu Modal */}
      {activeSubMenu && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setActiveSubMenu(null)}></div>
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl relative z-10 animate-in slide-in-from-bottom-full duration-300 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-start p-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 capitalize">
                  {activeSubMenu === 'more' 
                    ? 'Fitur Lainnya' 
                    : activeSubMenu === 'hitung' 
                    ? 'Hitung Umum' 
                    : activeSubMenu === 'belajar' 
                    ? 'Menu Belajar' 
                    : activeSubMenu === 'harian' 
                    ? 'Menu Harian' 
                    : activeSubMenu === 'wanita' 
                    ? 'Khusus Wanita' 
                    : activeSubMenu === 'media'
                    ? 'Menu Media'
                    : activeSubMenu === 'amalan'
                    ? 'Menu Amalan'
                    : activeSubMenu}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                  <Star size={12} className="text-amber-500 fill-amber-500/20 shrink-0" /> Klik bintang untuk disematkan
                </p>
              </div>
              <button onClick={() => setActiveSubMenu(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* SECTION 1: PINNED FEATURES (if any) */}
              {(() => {
                const allItems = SUB_FEATURES[activeSubMenu] || [];
                const pinnedItems = allItems.filter(item => bookmarkedLabels.includes(item.label));
                
                if (pinnedItems.length === 0) return null;
                
                return (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 px-1 text-amber-500 font-extrabold text-[11px] uppercase tracking-wider">
                      <Star size={12} className="fill-amber-500 text-amber-500" />
                      <span>Disematkan</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 bg-amber-50/40 dark:bg-amber-950/10 p-4 rounded-2xl border border-amber-200/40 dark:border-amber-900/20">
                      {pinnedItems.map((item, idx) => (
                        <FeatureButton 
                          key={`pinned-${idx}`} 
                          item={item} 
                          onClick={() => handleFeatureClick(item)} 
                          isBookmarked={true}
                          onToggleBookmark={() => {
                            toggleBookmarkFeature(item.label);
                            showToast(`Penanda untuk "${item.label}" dihapus`, "success");
                          }}
                          showBookmarkStar={true}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* SECTION 2: ALL FEATURES */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-slate-400 dark:text-slate-500 font-extrabold text-[11px] uppercase tracking-wider">
                    Semua Fitur ({activeSubMenu === 'more' ? 'A-Z' : 'Abjad'})
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {(() => {
                    const allItems = SUB_FEATURES[activeSubMenu] || [];
                    // Sort alphabetically by label property
                    const sortedItems = [...allItems].sort((a, b) => a.label.localeCompare(b.label));
                    
                    return sortedItems.map((item, idx) => {
                      const isBookmarked = bookmarkedLabels.includes(item.label);
                      return (
                        <FeatureButton 
                          key={`all-${idx}`} 
                          item={item} 
                          onClick={() => handleFeatureClick(item)} 
                          isBookmarked={isBookmarked}
                          onToggleBookmark={() => {
                            const added = toggleBookmarkFeature(item.label);
                            showToast(
                              added 
                                ? `"${item.label}" disematkan ke atas` 
                                : `Penanda untuk "${item.label}" dihapus`, 
                              "success"
                            );
                          }}
                          showBookmarkStar={true}
                        />
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AD REWARD OFFER MODAL */}
      {showAdOfferModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 text-center border-t-4 border-amber-400">
              <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Gift size={40} className="text-amber-500 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Bonus Reward!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                Mau tambahan <strong>1 Wasilah & 100 Poin</strong> lagi? Cukup tonton video sebentar!
              </p>
              <div className="space-y-3">
                 <button 
                   onClick={handleWatchAdReward} 
                   disabled={isAdProcessing}
                   className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-amber-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                    {isAdProcessing ? <Loader2 size={18} className="animate-spin" /> : <Video size={18} />} 
                    Ambil Bonus Sekarang
                 </button>
                 <button 
                   onClick={() => setShowAdOfferModal(false)}
                   className="w-full py-3 text-slate-400 dark:text-slate-500 font-bold text-xs hover:text-slate-600 transition-colors"
                 >
                    Nanti Saja
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Holiday Detail Modal */}
      {selectedHolidayDetail && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setSelectedHolidayDetail(null)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 overflow-hidden">
            {/* Header with Background Gradient matching holiday theme */}
            <div className={`p-6 bg-gradient-to-br ${selectedHolidayDetail.bg} text-white relative`}>
              <div 
                className="absolute inset-0 opacity-[0.1] pointer-events-none"
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z'/%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z' transform='rotate(45 60 60)'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '80px 80px'
                }}
              />
              <button 
                onClick={() => setSelectedHolidayDetail(null)}
                className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/30 rounded-full text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg text-3xl">
                  {selectedHolidayDetail.icon}
                </div>
                <div>
                  <span className="text-[9px] font-black tracking-widest text-yellow-300 uppercase">Detail Hari Istimewa</span>
                  <h3 className="text-lg font-black leading-tight mt-0.5">{selectedHolidayDetail.name}</h3>
                  <div className="text-[10px] text-white/90 mt-1 font-bold flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full w-fit">
                    <Calendar size={10} />
                    <span>{(() => {
                      const h = getHijriDate(new Date());
                      return h.day ? `${h.day} ${h.monthName} ${h.yearStr} H` : '--';
                    })()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content area */}
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Deskripsi & Hikmah</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedHolidayDetail.desc}
                </p>
              </div>
              
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30">
                <h4 className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-emerald-600" />
                  Amalan & Sunnah Hari Ini
                </h4>
                <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4 font-medium">
                  {selectedHolidayDetail.name.includes('Ramadhan') && (
                    <>
                      <li>Niat puasa wajib sebulan penuh / harian</li>
                      <li>Sahur tepat waktu dan menyegerakan berbuka puasa</li>
                      <li>Perbanyak tadarus Al-Qur'an dan shalat tarawih</li>
                      <li>Memperbanyak sedekah dan memberi makan orang berpuasa</li>
                    </>
                  )}
                  {selectedHolidayDetail.name.includes('Idul Fitri') && (
                    <>
                      <li>Mandilah sebelum berangkat shalat Id</li>
                      <li>Memakai pakaian terbaik dan wewangian</li>
                      <li>Makan sebelum berangkat shalat Idul Fitri</li>
                      <li>Saling berkunjung dan menyambung tali silaturahmi</li>
                    </>
                  )}
                  {selectedHolidayDetail.name.includes('Idul Adha') && (
                    <>
                      <li>Tidak makan sebelum melaksanakan shalat Id</li>
                      <li>Mendengarkan khutbah Idul Adha hingga selesai</li>
                      <li>Melaksanakan penyembelihan hewan kurban bagi yang mampu</li>
                      <li>Membagikan daging kurban kepada kaum dhuafa</li>
                    </>
                  )}
                  {selectedHolidayDetail.name.includes('Tasyrik') && (
                    <>
                      <li>Diharamkan berpuasa di hari ini</li>
                      <li>Perbanyak membaca takbir mutlaq</li>
                      <li>Memperbanyak dzikir dan doa kepada Allah</li>
                      <li>Menikmati hidangan makan dan minum secara bersyukur</li>
                    </>
                  )}
                  {(selectedHolidayDetail.name.includes('Asyura') || selectedHolidayDetail.name.includes('Tasu\'a')) ? (
                    <>
                      <li>Melaksanakan puasa sunnah (Tasu'a/Asyura)</li>
                      <li>Memperbanyak amalan sedekah kepada anak yatim</li>
                      <li>Melapangkan nafkah keluarga pada hari ini</li>
                      <li>Perbanyak istighfar dan bertaubat kepada Allah</li>
                    </>
                  ) : (
                    !selectedHolidayDetail.name.includes('Ramadhan') && !selectedHolidayDetail.name.includes('Idul Fitri') && !selectedHolidayDetail.name.includes('Idul Adha') && !selectedHolidayDetail.name.includes('Tasyrik') && (
                      <>
                        <li>Membaca shalawat Nabi sebanyak-banyaknya</li>
                        <li>Meningkatkan shalat berjamaah di masjid</li>
                        <li>Mempelajari sirah (sejarah) perjuangan Rasulullah SAW</li>
                        <li>Memperbanyak doa kebaikan untuk umat Islam dunia</li>
                      </>
                    )
                  )}
                </ul>
              </div>
              
              <button 
                onClick={() => setSelectedHolidayDetail(null)}
                className="w-full bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] cursor-pointer"
              >
                Tutup & Sambut Hari Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance is now a dedicated page at /attendance */}
   </div>
  );
};

export default HomeScreen;
