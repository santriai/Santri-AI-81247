import { 
  Heart, Moon, Baby, HeartPulse, Clock, Home, Sun, Scale, Navigation, ShieldCheck, 
  Activity, Calculator, Coins, UserX, Droplets, Map, Brain, BookHeart, BookOpen, 
  Scroll, Trophy, Gamepad2, Library, Disc, Tv, Video, Radio, Fingerprint, User, 
  MapPin, School, GraduationCap, Star, Compass, Calendar, Wind, History as HistoryIcon,
  LayoutGrid, Sparkles, MessageSquare, CalendarClock, Gem, ShoppingBag, Store, StickyNote,
  HeartHandshake, Mic, CalendarCheck, Newspaper, Crown, Settings, Keyboard
} from 'lucide-react';
import { OpenHandsIcon } from '../components/OpenHandsIcon';
import { CupidHeartIcon } from '../components/CupidHeartIcon';
import {
  BrokenHeartIcon,
  HandshakeIcon,
  BabyEmojiIcon,
  BreastfeedingIcon,
  CompassEmojiIcon,
  KaabaIcon,
  MosqueIcon,
  TrophyEmojiIcon,
  MemoIcon,
  AlarmClockEmojiIcon,
  SleepingPersonIcon,
  CowIcon,
  RadioEmojiIcon,
  TelevisionIcon,
  MovieCameraIcon,
  BalanceScaleIcon,
  OrangeBookIcon,
  OpenBookEmojiIcon,
  CalendarEmojiIcon,
  PrayerBeadsIcon,
  GlobeEmojiIcon,
  PalmDownIcon,
  GemEmojiIcon,
  TurbanScholarIcon,
  CrescentMoonIcon,
  StudentEmojiIcon,
  WorldMapIcon,
  VideoGameIcon,
  MoneyBagIcon,
  SettingsEmojiIcon,
  SwordsEmojiIcon,
  ArcheryEmojiIcon
} from '../components/EmojiIcon';

export interface FeatureItem {
  id?: string;
  icon: any;
  label: string;
  color: string;
  path: string;
  state?: any;
}

export const SUB_FEATURES: Record<string, FeatureItem[]> = {
  belajar: [
    { id: 'terjemahan', icon: Keyboard, label: "Terjemahkan", color: "bg-amber-500", path: "/input" },
    { id: 'munawwir', icon: BookOpen, label: "Kamus Munawwir", color: "bg-emerald-600", path: "/munawwir" },
    { id: 'mutiara_ulama', icon: Sparkles, label: "Mutiara Ulama", color: "bg-teal-600", path: "/mutiara" },
    { id: 'speech_material', icon: Mic, label: "Materi Dakwah", color: "bg-emerald-600", path: "/speech-material" },
    { icon: Map, label: "Kurikulum Santri", color: "bg-orange-600", path: "/kurikulum" },
    { icon: OpenBookEmojiIcon, label: "Belajar Quran", color: "bg-emerald-600", path: "/learning-quran" },
    { icon: OrangeBookIcon, label: "Belajar Kitab", color: "bg-yellow-500", path: "/learning-kitab" },
    { icon: GraduationCap, label: "Latihan Baca", color: "bg-green-600", path: "/latihan" },
    { icon: Library, label: "Ebook Islami", color: "bg-emerald-600", path: "/ebook" },
    { icon: TurbanScholarIcon, label: "Biografi Ulama", color: "bg-indigo-600", path: "/scholars" },
    { icon: VideoGameIcon, label: "Game Islami", color: "bg-orange-500", path: "/game" },
    { id: 'bahtsul_masail', icon: MessageSquare, label: "Bahtsul Masail", color: "bg-emerald-700", path: "/bahtsul-masail" },
    { icon: HistoryIcon, label: "Sejarah Islam", color: "bg-slate-600", path: "/islamic-history" },
    { icon: Star, label: "Rukun Islam", color: "bg-amber-500", path: "/rukun-islam" },
    { icon: ShieldCheck, label: "Rukun Iman", color: "bg-indigo-500", path: "/rukun-iman" },
    { icon: Library, label: "Studi Mawdhui", color: "bg-indigo-500", path: "/mawdhui-study" },
  ],
  harian: [
    { id: 'chat_admin', icon: MessageSquare, label: "Chat Admin", color: "bg-emerald-600", path: "/chat-admin" },
    { id: 'mutiara_ulama', icon: Sparkles, label: "Mutiara Ulama", color: "bg-teal-600", path: "/mutiara" },
    { id: 'warta_santri', icon: Newspaper, label: "Warta Santri", color: "bg-emerald-600", path: "/news" },
    { icon: CalendarCheck, label: "Absensi Harian", color: "bg-emerald-600", path: "/attendance" },
    { id: 'minta_doa', icon: OpenHandsIcon, label: "Bantu Doa", color: "bg-amber-600", path: "/prayer-request-create" },
    { icon: MemoIcon, label: "Catatan Santri", color: "bg-teal-600", path: "/notes" },
    { icon: CalendarClock, label: "Jurnal Amal", color: "bg-emerald-600", path: "/mutabaah" },
    { icon: Scale, label: "Ruang Muhasabah", color: "bg-rose-500", path: "/muhasabah" },
    { icon: Heart, label: "Meditasi Dzikir", color: "bg-rose-400", path: "/dzikir-meditation" },
    { icon: GlobeEmojiIcon, label: "Tafakur", color: "bg-blue-400", path: "/tafakur" },
    { icon: AlarmClockEmojiIcon, label: "Jadwal Sholat", color: "bg-green-600", path: "/prayer-times" },
    { icon: BookHeart, label: "Doa-doa", color: "bg-cyan-500", path: "/doa" },
    { id: 'jumat', icon: Brain, label: "Barokah Jumat", color: "bg-indigo-600", path: "/friday-barokah" },
    { icon: CalendarEmojiIcon, label: "Kalender", color: "bg-orange-500", path: "/calendar" },
    { icon: SleepingPersonIcon, label: "Tafsir Mimpi", color: "bg-emerald-700", path: "/expert-consultation" },
  ],
  wanita: [
    { icon: CupidHeartIcon, label: "Suami Istri", color: "bg-pink-100", path: "/marriage" },
    { icon: CrescentMoonIcon, label: "Hitung Haid", color: "bg-rose-500", path: "/haid" },
    { icon: BreastfeedingIcon, label: "Hitung Nifas", color: "bg-pink-500", path: "/nifas" },
    { icon: PalmDownIcon, label: "Bayar Fidyah", color: "bg-rose-600", path: "/zakat", state: { activeTab: 'fidyah' } },
    { icon: BrokenHeartIcon, label: "Masa Iddah", color: "bg-violet-500", path: "/iddah" },
    { icon: BabyEmojiIcon, label: "Nama Islami", color: "bg-indigo-500", path: "/islamic-names" },
  ],
  hitung: [
    { id: 'mosque', icon: MosqueIcon, label: "Harta Masjid", color: "bg-emerald-700", path: "/mosque-management" },
    { icon: Sun, label: "Idul Adha Hub", color: "bg-sky-600", path: "/idul-adha" },
    { icon: BalanceScaleIcon, label: "Hukum & Fatwa", color: "bg-yellow-500", path: "/fatwa" },
    { icon: KaabaIcon, label: "Haji Umroh", color: "bg-sky-500", path: "/hajj-umrah" },
    { icon: CowIcon, label: "Panduan Kurban", color: "bg-emerald-600", path: "/qurban" },
    { icon: Moon, label: "Ramadhan Hub", color: "bg-emerald-600", path: "/ramadhan" },
    { icon: PrayerBeadsIcon, label: "Tasbih", color: "bg-teal-500", path: "/tasbih" }, 
    { icon: Calculator, label: "Waris", color: "bg-pink-500", path: "/waris" }, 
    { icon: PalmDownIcon, label: "Zakat & Fidyah", color: "bg-emerald-500", path: "/zakat" }, 
    { icon: PalmDownIcon, label: "Bayar Fidyah", color: "bg-rose-500", path: "/zakat" },
    { icon: UserX, label: "Kematian", color: "bg-slate-500", path: "/death-anniversary" },
    { icon: Droplets, label: "Cek 2 Qullah", color: "bg-cyan-500", path: "/water" },
    { icon: WorldMapIcon, label: "Jarak Safar", color: "bg-blue-500", path: "/travel" },
    { icon: CalendarEmojiIcon, label: "Kalender", color: "bg-orange-500", path: "/calendar" },
    { icon: CompassEmojiIcon, label: "Arah Kiblat", color: "bg-blue-600", path: "/qibla" },
  ],
  media: [
    { id: 'mutiara_ulama', icon: Sparkles, label: "Mutiara Ulama", color: "bg-teal-600", path: "/mutiara" },
    { id: 'warta_santri', icon: Newspaper, label: "Warta Santri", color: "bg-emerald-600", path: "/news" },
    { id: 'speech_material', icon: Mic, label: "Materi Dakwah", color: "bg-emerald-600", path: "/speech-material" },
    { id: 'creator', icon: Brain, label: "Creator AI", color: "bg-purple-600", path: "/creator-hub" },
    { icon: RadioEmojiIcon, label: "Radio Islami", color: "bg-teal-500", path: "/radio" },
    { icon: Disc, label: "Playlist Mp3", color: "bg-blue-500", path: "/playlist" },
    { icon: TelevisionIcon, label: "TV Mekkah", color: "bg-red-500", path: "/tv-mekkah" }, 
    { icon: MovieCameraIcon, label: "Video Islami", color: "bg-red-600", path: "/video-islami" }, 
  ],
  amalan: [
    { icon: Moon, label: "Ramadhan Hub", color: "bg-emerald-600", path: "/ramadhan" },
    { icon: Sun, label: "Idul Adha Hub", color: "bg-sky-600", path: "/idul-adha" },
    { icon: Fingerprint, label: "Doa N. Yunus", color: "bg-emerald-800", path: "/doa-nabi-yunus" },
    { icon: OpenBookEmojiIcon, label: "Surah Yasin", color: "bg-emerald-600", path: "/yasin" },
    { icon: Scroll, label: "Tahlil Lengkap", color: "bg-emerald-700", path: "/tahlil" },
    { icon: Sparkles, label: "Nisfu Syaban", color: "bg-purple-600", path: "/nisfu-syaban" },
  ],
  more: [
    { id: 'guide', icon: BookOpen, label: "Panduan Penggunaan", color: "bg-emerald-600", path: "/info/guide" },
    { id: 'chat_admin', icon: MessageSquare, label: "Chat Admin", color: "bg-emerald-600", path: "/chat-admin" },
    { id: 'mutiara_ulama', icon: Sparkles, label: "Mutiara Ulama", color: "bg-teal-600", path: "/mutiara" },
    { id: 'minta_doa', icon: OpenHandsIcon, label: "Bantu Doa", color: "bg-amber-600", path: "/prayer-request-create" },
    { id: 'shopee_marketplace', icon: Store, label: "Toko Santri", color: "bg-orange-600", path: "/marketplace" },
    { id: 'mosque', icon: MosqueIcon, label: "Harta Masjid", color: "bg-emerald-700", path: "/mosque-management" },
    { id: 'upgrade_pro', icon: Crown, label: "Upgrade Pro", color: "bg-amber-600", path: "/premium" },
    { id: 'settings', icon: SettingsEmojiIcon, label: "Pengaturan", color: "bg-slate-500", path: "/settings" },
    { id: 'avatar_selection', icon: Sparkles, label: "Bingkai", color: "bg-indigo-500", path: "/avatar-selection" },
    { icon: OpenBookEmojiIcon, label: "Al-Quran", color: "bg-emerald-600", path: "/quran" },
    { icon: Scroll, label: "Hadis Utama", color: "bg-indigo-600", path: "/hadis" },
    { id: 'top', icon: TrophyEmojiIcon, label: "Top Santri", color: "bg-lime-400", path: "/leaderboard" },
    { icon: Brain, label: "Cerdas Cermat", color: "bg-purple-500", path: "/quiz" },
    { icon: MoneyBagIcon, label: "Santri Miliarder", color: "bg-purple-600", path: "/quiz-game" },
    { icon: MapPin, label: "Ziarah Wali", color: "bg-emerald-600", path: "/ziarah" },
    { icon: MosqueIcon, label: "Masjid Terdekat", color: "bg-emerald-600", path: "/nearby?type=masjid" },
    { icon: School, label: "Cari Pesantren", color: "bg-indigo-600", path: "/pesantren-explorer" },
    { icon: HandshakeIcon, label: "Infaq/Sedekah", color: "bg-rose-500", path: "/donation" },
    { icon: SleepingPersonIcon, label: "Tafsir Mimpi", color: "bg-emerald-700", path: "/expert-consultation" },
  ]
};

// All sub-features flat array
export const ALL_SUB_FEATURES: FeatureItem[] = [
  ...SUB_FEATURES.belajar,
  ...SUB_FEATURES.harian,
  ...SUB_FEATURES.wanita,
  ...SUB_FEATURES.hitung,
  ...SUB_FEATURES.media,
  ...SUB_FEATURES.amalan,
  ...SUB_FEATURES.more
];

const LOCAL_STORAGE_KEY = 'santri_ai_bookmarked_features';
const EVENT_NAME = 'santri_ai_bookmarks_changed';

// Get lists of bookmarked feature labels
export const getBookmarkedFeatureLabels = (): string[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Gagal mengambil penanda fitur:", e);
    return [];
  }
};

// Toggle a bookmark
export const toggleBookmarkFeature = (label: string): boolean => {
  try {
    const bookmarks = getBookmarkedFeatureLabels();
    const isBookmarked = bookmarks.includes(label);
    let newBookmarks: string[];

    if (isBookmarked) {
      newBookmarks = bookmarks.filter(b => b !== label);
    } else {
      newBookmarks = [...bookmarks, label];
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newBookmarks));
    
    // Dispatch event to trigger react state updates
    window.dispatchEvent(new Event(EVENT_NAME));
    return !isBookmarked;
  } catch (e) {
    console.error("Gagal mengubah penanda fitur:", e);
    return false;
  }
};

// Check if a feature is bookmarked
export const isFeatureBookmarked = (label: string): boolean => {
  return getBookmarkedFeatureLabels().includes(label);
};

// Get the resolved FeatureItems for all bookmarks
export const getBookmarkedFeatures = (): FeatureItem[] => {
  const labels = getBookmarkedFeatureLabels();
  const result: FeatureItem[] = [];
  
  // Find matching features from ALL_SUB_FEATURES
  labels.forEach(label => {
    // Avoid adding duplicates (e.g. Bayar Fidyah is both in wanita & hitung)
    if (result.some(item => item.label === label)) return;

    const matched = ALL_SUB_FEATURES.find(feat => feat.label === label);
    if (matched) {
      result.push(matched);
    }
  });

  return result;
};

// Subscribe to bookmark changes
export const subscribeToBookmarkChanges = (callback: () => void): () => void => {
  window.addEventListener(EVENT_NAME, callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
  };
};
