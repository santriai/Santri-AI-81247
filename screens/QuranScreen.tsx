
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAudio } from '../contexts/AudioContext';
import { useHistory } from '../contexts/HistoryContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { getAllSurahs, getSurahDetail, getTafsir, searchAllQuran, loadQuranSearchIndex, QuranSearchAyahItem, QuranSearchResult } from '../services/quranApiService';
import { saveUserBookmark, removeUserBookmark, subscribeUserBookmarks } from '../services/firebase';
import { JUZ_MAPPING, JUZ_INFO, PLAYSTORE_LINK } from '../constants';
import CustomLoader from '../components/CustomLoader';
import { ContentReportModal } from '../components/ContentReportModal';
import { openExternalLink } from '../utils/linkUtils';
import { HighlightText } from '../components/HighlightText';
import { playIndonesianTranslationAudio } from '../services/translationAudioService';
import { 
  Search, 
  Loader2, 
  BookOpen, 
  ChevronLeft, 
  Play, 
  Pause, 
  MoreVertical, 
  Bookmark, 
  Copy, 
  Sparkles,
  AlignLeft,
  Trash2,
  Share2,
  Info,
  X,
  Layers,
  ToggleLeft,
  ToggleRight,
  Palette,
  Check,
  PlayCircle,
  GraduationCap,
  Heart,
  ShieldCheck,
  Flag,
  Brain,
  Lightbulb,
  ChevronDown,
  Volume2,
  VolumeX,
  ChevronRight,
  Star,
  Clock,
  History,
  Settings,
  Sun,
  Moon,
  Monitor,
  Headphones
} from 'lucide-react';
import { Surah, Ayah, BookmarkItem } from '../types';

// Helper to convert to Arabic numerals
const toArabicNumerals = (n: number) => {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return n.toString().replace(/\d/g, (d) => arabicDigits[parseInt(d)]);
};

const POPULAR_SECTIONS = [
  {
    id: 'yasin',
    title: 'Surah Yasin',
    subtitle: 'Surah ke-36 (Jantung Quran)',
    icon: '✨',
    color: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 border-amber-200/50 dark:border-amber-900/30 text-amber-600 dark:text-amber-400',
    action: 'surah',
    surahNumber: 36
  },
  {
    id: 'al-kahfi',
    title: 'Al-Kahfi',
    subtitle: 'Surah ke-18 (Penerang Jumat)',
    icon: '🕌',
    color: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10 border-emerald-200/50 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    action: 'surah',
    surahNumber: 18
  },
  {
    id: 'al-waqiah',
    title: 'Al-Waqi\'ah',
    subtitle: 'Surah ke-56 (Penarik Rezeki)',
    icon: '💎',
    color: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10 border-blue-200/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400',
    action: 'surah',
    surahNumber: 56
  },
  {
    id: 'al-mulk',
    title: 'Al-Mulk',
    subtitle: 'Surah ke-67 (Penyelamat Siksa)',
    icon: '🌌',
    color: 'from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/10 border-violet-200/50 dark:border-violet-900/30 text-violet-600 dark:text-violet-400',
    action: 'surah',
    surahNumber: 67
  },
  {
    id: 'ar-rahman',
    title: 'Ar-Rahman',
    subtitle: 'Surah ke-55 (Nikmat Allah)',
    icon: '🌸',
    color: 'from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/10 border-rose-200/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-400',
    action: 'surah',
    surahNumber: 55
  },
  {
    id: 'ayat-kursi',
    title: 'Ayat Kursi',
    subtitle: 'Al-Baqarah: 255 (Perisai)',
    icon: '🛡️',
    color: 'from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/10 border-indigo-200/50 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    action: 'verse',
    surahNumber: 2,
    ayahNumber: 255
  },
  {
    id: 'ayat-1000-dinar',
    title: 'Ayat 1000 Dinar',
    subtitle: 'At-Talaq: 2-3 (Rezeki)',
    icon: '💰',
    color: 'from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/10 border-yellow-200/50 dark:border-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    action: 'verse',
    surahNumber: 65,
    ayahNumber: 2
  },
  {
    id: 'ruqyah',
    title: 'Ruqyah Syar\'iyyah',
    subtitle: 'Syifa\' & Perlindungan Diri',
    icon: '🌿',
    color: 'from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/10 border-teal-200/50 dark:border-teal-900/30 text-teal-600 dark:text-teal-400',
    action: 'ruqyah'
  }
];

const QuranScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    isPlaying, 
    currentAyah, 
    currentSurah, 
    currentLibraryItem,
    mode,
    audioCurrentTime,
    audioDuration,
    playbackProgress,
    playAyah, 
    playTranslationOnly, 
    playSurahFullTranslation,
    isTranslationPlaying, 
    autoPlayTranslation, 
    setAutoPlayTranslation, 
    togglePlay, 
    stop,
    selectedQari, 
    setSelectedQari 
  } = useAudio();
  const { addToHistory } = useHistory();
  const { showToast } = useToast();
  const { user, userData } = useAuth();
  const { surahId } = useParams();

  // Navigation State
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  
  // Data State
  const [allSurahs, setAllSurahs] = useState<Surah[]>([]);
  const [surahDetail, setSurahDetail] = useState<Surah | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // List View State
  const [activeTab, setActiveTab] = useState<'surah' | 'juz' | 'bookmark' | 'history'>('surah');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<QuranSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilter, setSearchFilter] = useState<'all' | 'surah' | 'ayah'>('all');
  const [quranSearchHistory, setQuranSearchHistory] = useState<{
    id: string;
    query: string;
    surahFilterName?: string;
    totalResults: number;
    timestamp: number;
  }[]>(() => {
    try {
      const saved = localStorage.getItem('santriai_quran_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Last Read State
  const [lastRead, setLastRead] = useState<{
    surahNumber: number;
    surahName: string;
    ayahNumber: number;
    timestamp: string;
  } | null>(null);

  // Detail View State
  const scrollToAyahRef = useRef<number | null>(null);
  const [isTajwidMode, setIsTajwidMode] = useState(false);
  const [isAyahSearchOpen, setIsAyahSearchOpen] = useState(false);
  const [ayahSearchQuery, setAyahSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const isSharing = useRef(false);

  // Quran Settings States
  const [isQuranSettingsOpen, setIsQuranSettingsOpen] = useState(false);
  const [quranTheme, setQuranTheme] = useState<'default' | 'sepia' | 'dark' | 'emerald'>(() => {
    return (localStorage.getItem('santriai_quran_theme') as any) || 'default';
  });
  const [arabicFont, setArabicFont] = useState<string>(() => {
    return localStorage.getItem('santriai_quran_font') || 'uthmanic';
  });
  const [arabicStandard, setArabicStandard] = useState<string>(() => {
    return localStorage.getItem('santriai_quran_standard') || 'madinah';
  });
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('santriai_quran_font_size');
    return saved ? parseInt(saved, 10) : 32;
  });
  const [isTajwidActive, setIsTajwidActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('santriai_quran_tajwid');
    return saved !== null ? saved === 'true' : false;
  });
  const [showTranslation, setShowTranslation] = useState<boolean>(() => {
    const saved = localStorage.getItem('santriai_quran_translation');
    return saved !== null ? saved === 'true' : true;
  });
  const [showLatin, setShowLatin] = useState<boolean>(() => {
    const saved = localStorage.getItem('santriai_quran_latin');
    return saved !== null ? saved === 'true' : true;
  });
  const [isWordHighlightActive, setIsWordHighlightActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('santriai_quran_word_highlight');
    return saved !== null ? saved === 'true' : true;
  });
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isPreviewTranslationPlaying, setIsPreviewTranslationPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewTranslationCancelRef = useRef<(() => void) | null>(null);

  const handleTogglePreviewTranslationAudio = () => {
    if (isPreviewTranslationPlaying) {
      if (previewTranslationCancelRef.current) {
        previewTranslationCancelRef.current();
        previewTranslationCancelRef.current = null;
      }
      setIsPreviewTranslationPlaying(false);
      return;
    }

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
      setIsPreviewPlaying(false);
    }

    setIsPreviewTranslationPlaying(true);
    previewTranslationCancelRef.current = playIndonesianTranslationAudio(
      "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Segala puji bagi Allah, Tuhan semesta alam.",
      () => {
        setIsPreviewTranslationPlaying(true);
      },
      () => {
        setIsPreviewTranslationPlaying(false);
        previewTranslationCancelRef.current = null;
      },
      () => {
        setIsPreviewTranslationPlaying(false);
        previewTranslationCancelRef.current = null;
      }
    );
  };

  const handleTogglePreviewAudio = () => {
    if (isPreviewTranslationPlaying) {
      if (previewTranslationCancelRef.current) {
        previewTranslationCancelRef.current();
        previewTranslationCancelRef.current = null;
      }
      setIsPreviewTranslationPlaying(false);
    }

    if (isPreviewPlaying && previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
      setIsPreviewPlaying(false);
      return;
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    const sampleUrl = selectedQari === '03' 
      ? 'https://cdn.equran.id/audio-partial/Abdurrahman-as-Sudais/001001.mp3'
      : selectedQari === '06'
        ? 'https://cdn.equran.id/audio-partial/Yasser-Al-Dosari/001001.mp3'
        : selectedQari === '01'
          ? 'https://cdn.equran.id/audio-partial/Abdullah-Al-Juhany/001001.mp3'
          : selectedQari === '02'
            ? 'https://cdn.equran.id/audio-partial/Abdul-Muhsin-Al-Qasim/001001.mp3'
            : selectedQari === '04'
              ? 'https://cdn.equran.id/audio-partial/Ibrahim-Al-Dossari/001001.mp3'
              : selectedQari === 'saadalghamdi' || selectedQari === 'ar.saadalghamdi'
                ? 'https://everyayah.com/data/Ghamadi_40kbps/001001.mp3'
                : selectedQari === 'hanirifai' || selectedQari === 'ar.hanirifai'
                  ? 'https://everyayah.com/data/Hani_Rifai_192kbps/001001.mp3'
                  : selectedQari === 'husary'
                    ? 'https://everyayah.com/data/Husary_128kbps/001001.mp3'
                    : selectedQari === 'minshawy'
                      ? 'https://everyayah.com/data/Minshawy_Mujawwad_192kbps/001001.mp3'
                      : 'https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/001001.mp3';

    const audio = new Audio(sampleUrl);
    previewAudioRef.current = audio;
    setIsPreviewPlaying(true);
    audio.play().catch(() => {
      setIsPreviewPlaying(false);
    });
    audio.onended = () => {
      setIsPreviewPlaying(false);
      previewAudioRef.current = null;
    };
    audio.onerror = () => {
      setIsPreviewPlaying(false);
      previewAudioRef.current = null;
    };
  };

  const [appTheme, setAppTheme] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const saved = localStorage.getItem('santriai_settings');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.theme) return p.theme;
      }
    } catch(e) {}
    return 'system';
  });

  const handleAppThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setAppTheme(mode);
    try {
      const saved = localStorage.getItem('santriai_settings');
      const p = saved ? JSON.parse(saved) : {};
      const newSettings = { ...p, theme: mode };
      localStorage.setItem('santriai_settings', JSON.stringify(newSettings));
      
      const root = document.documentElement;
      if (mode === 'dark') {
        root.classList.add('dark');
      } else if (mode === 'light') {
        root.classList.remove('dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) root.classList.add('dark');
        else root.classList.remove('dark');
      }
      window.dispatchEvent(new Event('storage'));
    } catch(e) {}
  };
  
  // AI/Tafsir Modal State
  const [modalData, setModalData] = useState<{
    show: boolean, 
    title: string, 
    subtitle?: string,
    content: string, 
    loading: boolean,
    isAi: boolean,
    type?: 'guide' | 'tafsir' | 'guide_list' | 'ruqyah'
  }>({
    show: false, title: '', content: '', loading: false, isAi: false
  });

  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const QURAN_GUIDES = [
    {
      id: 'start',
      title: 'Cara Memulai',
      icon: <PlayCircle size={20} />,
      color: 'bg-blue-500',
      description: 'Panduan awal sebelum membaca Al-Quran',
      content: `### 1. Niat yang Ikhlas\nMulailah dengan niat semata-mata karena Allah SWT untuk mengharap ridha-Nya dan petunjuk-Nya.\n\n### 2. Berwudhu & Bersuci\nSangat dianjurkan (menurut mayoritas ulama wajib) untuk berada dalam keadaan suci dari hadats sebelum menyentuh Mushaf Al-Quran.\n\n### 3. Memilih Tempat yang Layak\nBacalah di tempat yang bersih, tenang, dan terhormat. Masjid adalah tempat utama, namun di rumah pun pastikan kebersihannya terjaga.\n\n### 4. Menghadap Kiblat\nDisunnahkan duduk dengan sopan dan menghadap ke arah Kiblat sebagai bentuk penghormatan.\n\n### 5. Membaca Ta'awudz & Basmalah\nUcapkan *A'udzubillahi minasy-syaitanir-rajim* untuk memohon perlindungan dari gangguan setan, kemudian awali dengan *Bismillahir-rahmanir-rahim* (kecuali pada Surah At-Taubah).`
    },
    {
      id: 'learn',
      title: 'Cara Belajar',
      icon: <GraduationCap size={20} />,
      color: 'bg-emerald-500',
      description: 'Langkah efektif mempelajari bacaan Quran',
      content: `### 1. Mencari Guru (Talaqqi)\nCara terbaik belajar Quran adalah melalui metode *Talaqqi* (berhadapan langsung) agar makhraj dan tajwid dikoreksi secara langsung oleh ahli.\n\n### 2. Mulai dari Metode Dasar\nJangan terburu-buru. Mulailah dari metode pengenalan huruf seperti Iqra, Yanbu'a, atau metode dasar lainnya secara bertahap.\n\n### 3. Konsistensi (Istiqomah)\nLebih baik belajar 15 menit setiap hari dengan rutin daripada belajar 3 jam namun hanya sebulan sekali.\n\n### 4. Memanfaatkan Media Audio\nMendengarkan rekaman Qari ternama (seperti Syaikh Al-Husari) membantu telinga terbiasa dengan nada dan pelafalan yang benar.\n\n### 5. Sabar dan Berdoa\nBelajar membaca Quran adalah ibadah. Jangan putus asa jika terasa sulit, karena Allah menjanjikan pahala dua kali lipat bagi yang terbata-bata saat belajar.`
    },
    {
      id: 'dua',
      title: 'Doa Memulai',
      icon: <Heart size={20} />,
      color: 'bg-rose-500',
      description: 'Doa memohon keberkahan saat membaca',
      content: `### Doa Memohon Rahmat Al-Quran\n**اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ، وَاجْعَلْهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً**\n\n*Allahummarhamni bil Quran, waj’alhu li imaman wa nuran wa hudan wa rahmah.*\n\n**Artinya:** "Ya Allah, rahmatilah aku dengan Al-Quran, jadikanlah ia bagiku sebagai pemimpin, cahaya, petunjuk, dan rahmat."\n\n### Doa Memohon Pemahaman\n**اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نُسِّيتُ وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ**\n\n*Allahumma dzakkirni minhu ma nussitu wa ‘allimni minhu ma jahiltu.*\n\n**Artinya:** "Ya Allah, ingatkanlah aku apa yang aku lupa darinya, ajarkanlah aku apa yang tidak aku ketahui darinya."\n\n### Waktu Membaca Doa\nDoa ini umum dibaca sebelum memulai atau saat akan mengakhiri (Khatam) Al-Quran sebagai permohonan agar ilmu yang dibaca bermanfaat dunia dan akhirat.`
    },
    {
      id: 'adab',
      title: 'Adab Membaca',
      icon: <ShieldCheck size={20} />,
      color: 'bg-indigo-500',
      description: 'Etika dan kesopanan saat berinteraksi',
      content: `### 1. Khusyuk dan Tadabbur\nBerusahalah untuk tenang dan merenungi setiap makna ayat yang dibaca. Quran bukan sekadar teks, tapi pesan dari Sang Pencipta.\n\n### 2. Membaca dengan Tartil\nBacalah dengan perlahan, jelas, dan sesuai hukum tajwid. Jangan terburu-buru mengejar target tanpa memperhatikan kualitas bacaan.\n\n### 3. Memperindah Suara\nDisunnahkan menghias bacaan dengan suara merdu selama tidak merubah hukum tajwid. Ini membantu hati lebih tersentuh.\n\n### 4. Menghindari Gangguan\nHindari berbicara hal sia-sia atau tertawa-tawa saat Mushaf terbuka. Fokuskan perhatian sepenuhnya pada firman Allah.\n\n### 5. Melakukan Sujud Tilawah\nJika membaca atau mendengar ayat-ayat Sajdah, disunnahkan untuk melakukan Sujud Tilawah sebagai bentuk ketundukan.`
    },
    {
      id: 'khatam',
      title: 'Cara Khatam',
      icon: <Flag size={20} />,
      color: 'bg-amber-500',
      description: 'Strategi menyelesaikan bacaan 30 Juz',
      content: `### 1. Strategi Sholat Fardhu\nIni adalah metode termudah: Bacalah **2 lembar (4 halaman)** setiap selesai sholat 5 waktu. \n10 lembar (20 halaman) = 1 Juz per hari = Khatam dalam 30 hari.\n\n### 2. One Day One Juz\nAlokasikan waktu khusus (misal setelah Subuh atau sebelum tidur) untuk menyelesaikan 1 juz penuh tanpa terputus.\n\n### 3. Memanfaatkan Waktu Dhuha\nWaktu Dhuha adalah saat yang tenang. Gunakan 20-30 menit untuk menambah progres khataman Anda.\n\n### 4. Gunakan Aplikasi Pelacak\nManfaatkan fitur riwayat/bookmark untuk menandai sejauh mana progres Anda agar semangat tetap terjaga.\n\n### 5. Kolektif Bersama Teman\nMembuat grup khataman bersama teman atau keluarga bisa memacu motivasi untuk saling berlomba dalam kebaikan.`
    },
    {
      id: 'hafal',
      title: 'Cara Hafal',
      icon: <Brain size={20} />,
      color: 'bg-purple-500',
      description: 'Tips menghafal Quran bagi pemula',
      content: `### 1. Metode Tikrar (Pengulangan)\nUlangi satu ayat sebanyak 20-60 kali sampai lisan terbiasa. Jangan pindah ke ayat berikutnya sebelum hafalan benar-benar lancar.\n\n### 2. Memahami Makna (Tadabbur)\nMenghafal akan jauh lebih mudah jika Anda memahami arti dan alur cerita dalam ayat-ayat tersebut.\n\n### 3. Mendengarkan Audio Murottal\nDengarkan terus-menerus ayat yang ingin dihafal melalui headphone. Ini membantu hafalan masuk ke memori jangka panjang.\n\n### 4. Setoran & Koreksi\nWajib memiliki partner atau guru untuk menyimak hafalan Anda guna memastikan tidak ada kesalahan harakat atau huruf.\n\n### 5. Menjauhkan Diri dari Maksiat\nIlmu Allah adalah cahaya, dan cahaya Allah tidak akan masuk ke hati yang penuh dengan noda maksiat. Jaga pandangan, lisan, dan hati.`
    },
    {
      id: 'ilmu',
      title: 'Ilmu Baca',
      icon: <Lightbulb size={20} />,
      color: 'bg-orange-500',
      description: 'Dasar-dasar ilmu tajwid dan tahsin',
      content: `### 1. Makharijul Huruf\nIlmu tentang tempat keluarnya bunyi huruf dari tenggorokan, lisan, bibir, hingga rongga hidung.\n\n### 2. Sifatul Huruf\nKarakteristik suara huruf, apakah mengalir udaranya (Hams), memantul (Qalqalah), atau tebal (Istila').\n\n### 3. Hukum Nun & Tanwin\nAturan saat Nun Sukun bertemu huruf hijaiyah: Ikhfa (samar), Idzhar (jelas), Iqlab (berubah jadi M), atau Idgham (melebur).\n\n### 4. Hukum Mad (Panjang-Pendek)\nMengenali kapan bacaan harus dibaca 2, 4, atau 6 harakat agar tidak merubah arti ayat.\n\n### 5. Waqaf & Ibtida'\nIlmu tentang di mana harus berhenti dan dari mana harus memulai kembali saat napas tidak sampai, tanpa merusak makna kalimat.`
    },
    {
      id: 'doa_khatam',
      title: 'Doa Khatam & Tahlil',
      icon: <Sparkles size={20} />,
      color: 'bg-amber-500',
      description: 'Panduan lengkap khataman, tahlil ringkas & doa',
      content: `### 1. Rangkaian Surah Pendek\nSangat dianjurkan setelah membaca Surah An-Nas, dilanjutkan dengan membaca:\n\n**Surah Al-Fatihah**\n**Surah Al-Baqarah (Ayat 1-5)**\n\n### 2. Tahlil Ringkas\nSetelah itu membaca Kalimat Thayyibah sebagai bentuk syukur:\n\n**لَا اِلَهَ اِلَّا اللهُ وَاللهُ اَكْبَرُ، وَلِلهِ الْحَمْدُ**\n\n*Laa ilaha illallahu wallahu akbar, walillahil hamd.*\n\n**سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ الْعَظِيْمِ**\n\n*Subhanallahi wa bihamdihi subhanallahil 'adzim.*\n\n### 3. Doa Khatmil Quran\nIni adalah inti doa setelah mengkhatamkan 30 Juz:\n\n**اَللّٰهُمَّ ارْحَمْنِيْ بِالْقُرْآنِ. وَاجْعَلْهُ لِيْ إِمَامًا وَنُوْرًا وَهُدًى وَرَحْمَةً. اَللّٰهُمَّ ذَكِّرْنِيْ مِنْهُ مَانَسِيْتُ وَعَلِّمْنِيْ مِنْهُ مَا جَهِلْتُ. وَارْزُقْنِيْ تِلاَوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ. وَاجْعَلْهُ لِيْ حُجَّةً يَا رَبَّ الْعَالَمِيْنَ.**\n\n*Allahummarhamni bil quran. Waj'alhu lii imaman wa nuran wa hudan wa rohmah. Allahumma dzakkirni minhu maa nasiitu wa 'allimni minhu maa jahiltu. Warzuqni tilaawatahu aana-allaili wa athroofan nahaar. Waj'alhu li hujjatan yaa robbal 'alamiin.*\n\n### 4. Terjemah Doa\n"Ya Allah, rahmatilah aku dengan Al-Quran. Jadikanlah ia bagiku sebagai pemimpin, cahaya, petunjuk, dan rahmat. Ya Allah, ingatkanlah aku akan apa yang aku lupakan darinya, dan ajarkanlah kepadaku apa yang tidak aku ketahui darinya, dan berilah aku rezeki dengan membacanya di tengah malam dan di ujung siang, dan jadikanlah ia bagiku sebagai hujah (pembela), wahai Tuhan semesta alam."\n\n### 5. Adab Khataman\n1. Mengundang keluarga atau kerabat (Sangat dianjurkan).\n2. Membaca doa khatam dengan penuh kekhusyukan.\n3. Dianjurkan berpuasa pada hari khataman.\n4. Memulai kembali bacaan dari Al-Fatihah setelah selesai (Al-Hal wal Murtahil).`
    }
  ];

  const getCurrentJuz = (surahNum: number, ayahNum: number) => {
    for (let j = 30; j >= 1; j--) {
        const start = JUZ_MAPPING[j];
        if (start) {
            if (surahNum > start.surah || (surahNum === start.surah && ayahNum >= start.ayah)) {
                return j;
            }
        }
    }
    return 1;
  };

  const getWordSyncIndex = (words: string[], currentTime: number, duration: number): number => {
    if (!words.length || duration <= 0) return 0;
    
    // Qari recitation characteristics:
    // 1. Initial breath / start pause (~0.25s or 5% of duration)
    // 2. Trailing pause / waqaf hold (~0.35s or 7% of duration)
    const headOffset = Math.min(0.3, duration * 0.05);
    const tailOffset = Math.min(0.5, duration * 0.08);
    const effectiveDuration = Math.max(0.1, duration - headOffset - tailOffset);
    const effectiveCurrentTime = Math.max(0, Math.min(effectiveDuration, currentTime - headOffset));

    // Calculate phonetic weight per word:
    // - Base character count
    // - Extra weight for Mad characters (ا, و, ي, ٰ, ۧ, ۨ, ٓ, ~)
    // - Extra weight for Shaddah (ّ) and Tanwin (ً, ٍ, ٌ)
    // - Extra weight for last word (waqaf elongation)
    const weights = words.map((w, idx) => {
      let weight = Math.max(2, w.length);
      const isLastWord = idx === words.length - 1;
      
      // Bonus weight for elongated phonetic characters
      for (const char of w) {
        if (/[\u064E\u064F\u0650\u0651\u0652\u0653\u0670]/.test(char)) {
          weight += 0.8;
        }
        if (/[اوي]/.test(char)) {
          weight += 1.2;
        }
        if (char === 'ّ') {
          weight += 1.5;
        }
      }
      
      if (isLastWord) {
        weight *= 1.4; // Waqaf stretching at the end of ayah
      }
      
      return weight;
    });

    const totalWeight = weights.reduce((acc, curr) => acc + curr, 0);
    const progressTime = (effectiveCurrentTime / effectiveDuration) * totalWeight;

    let cumulative = 0;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (progressTime <= cumulative || i === weights.length - 1) {
        return i;
      }
    }
    return 0;
  };

  useEffect(() => {
    if (allSurahs.length > 0) {
      if (surahId) {
        const surah = allSurahs.find(s => s.number === parseInt(surahId));
        if (surah) handleSurahClick(surah);
      } else if (location.state) {
        const state = location.state as any;
        if (state.tab === 'bookmark') {
            setActiveTab('bookmark');
        } 
        else if (state.surahNumber) {
            const surah = allSurahs.find(s => s.number === state.surahNumber);
            if (surah) handleSurahClick(surah, state.targetAyah || 1);
        }
        else if (state.autoSearch) {
          handleAutoSearch(state.autoSearch);
        }
      }
    }
  }, [location, allSurahs, surahId]); 

  const handleAutoSearch = (query: string) => {
    if (!query) return;
    // Basic parser for "QS. Al-Baqarah: 183" or "Al-Baqarah:183"
    // Remove "QS." or "Q.S" if exists
    const cleanSearch = query.replace(/q\.?s\.?/gi, '').trim();
    const parts = cleanSearch.split(':');
    const surahPart = parts[0]?.trim();
    const ayahPart = parts[1]?.trim();

    if (surahPart) {
      // Find surah by name (latin)
      const surah = allSurahs.find(s => 
        (s.name_latin || '').toLowerCase().includes(surahPart.toLowerCase()) ||
        surahPart.toLowerCase().includes((s.name_latin || '').toLowerCase())
      );
      
      if (surah) {
        const ayahNum = ayahPart ? parseInt(ayahPart) : 1;
        handleSurahClick(surah, ayahNum);
      }
    }
  };
  useEffect(() => {
    const fetchList = async () => {
      setLoadingList(true);
      const data = await getAllSurahs();
      setAllSurahs(data);
      setLoadingList(false);
    };
    fetchList();

    const saved = localStorage.getItem('santriai_quran_last_read');
    if (saved) {
      try {
        setLastRead(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    // Pre-warm the search index in background
    loadQuranSearchIndex();
  }, []);

  const addQuranSearchHistory = (queryStr: string, totalResultsCount: number = 0) => {
    const q = queryStr.trim();
    if (!q) return;
    const newItem = {
      id: `quran-sh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      query: q,
      totalResults: totalResultsCount,
      timestamp: Date.now()
    };
    setQuranSearchHistory(prev => {
      const filtered = prev.filter(h => h.query.toLowerCase() !== newItem.query.toLowerCase());
      const updated = [newItem, ...filtered].slice(0, 20);
      try {
        localStorage.setItem('santriai_quran_search_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const deleteQuranSearchHistoryItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setQuranSearchHistory(prev => {
      const updated = prev.filter(h => h.id !== id);
      try {
        localStorage.setItem('santriai_quran_search_history', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToast("Riwayat pencarian dihapus", "info");
  };

  const clearAllQuranSearchHistory = () => {
    setQuranSearchHistory([]);
    try {
      localStorage.removeItem('santriai_quran_search_history');
    } catch (e) {}
    showToast("Seluruh riwayat pencarian Al-Qur'an dibersihkan", "success");
  };

  // Clear search results when query is empty
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleManualSearchQuran = async (overrideQuery?: string) => {
    const q = (overrideQuery !== undefined ? overrideQuery : searchQuery).trim();
    if (!q) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const res = await searchAllQuran(q, allSurahs);
      setSearchResults(res);
      addQuranSearchHistory(q, res.totalMatches);
    } catch (err) {
      console.error("Quran search error:", err);
      showToast("Gagal melakukan pencarian Al-Qur'an", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleBookmarkFromSearch = async (item: QuranSearchAyahItem) => {
    const surahObj = allSurahs.find(s => s.number === item.surahNumber);
    const surahName = surahObj ? surahObj.name_latin : item.surahNameLatin;
    updateLastRead(item.surahNumber, surahName, item.ayahNumber);

    const id = `surah-${item.surahNumber}-ayah-${item.ayahNumber}`;
    const exists = bookmarks.find(b => b.id === id);

    if (exists) {
      if (user) await removeUserBookmark(user.uid, id);
      else setBookmarks(prev => prev.filter(b => b.id !== id));
      showToast("Ayat dihapus dari penanda", "info");
    } else {
      const newBookmark: BookmarkItem = {
        id,
        surahNumber: item.surahNumber,
        surahName: surahName,
        ayah: {
          number: item.ayahNumber,
          arab: item.arab,
          latin: item.latin || '',
          text: item.text,
          audio: item.audio || '',
          id: parseInt(`${item.surahNumber}${item.ayahNumber}`),
          surahNumber: item.surahNumber
        },
        savedAt: new Date().toISOString()
      };
      if (user) await saveUserBookmark(user.uid, 'quran', id, newBookmark);
      else setBookmarks(prev => [newBookmark, ...prev]);
      showToast("Ayat disimpan ke penanda", "success");
    }
  };

  const handleOpenSearchResultAyah = (item: QuranSearchAyahItem) => {
    const surah = allSurahs.find(s => s.number === item.surahNumber);
    if (surah) {
      handleSurahClick(surah, item.ayahNumber);
    }
  };

  const handleCopySearchAyah = (item: QuranSearchAyahItem) => {
    const text = `${item.arab}\n\n${item.latin ? item.latin + '\n\n' : ''}${item.text}\n(QS. ${item.surahNameLatin}: ${item.ayahNumber})\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
    navigator.clipboard.writeText(text);
    setCopiedId(parseInt(`${item.surahNumber}${item.ayahNumber}`));
    setTimeout(() => setCopiedId(null), 2000);
    showToast("Teks ayat disalin", "success");
  };

  const handleShareSearchAyah = async (item: QuranSearchAyahItem) => {
    if (isSharing.current) return;
    isSharing.current = true;
    const text = `${item.arab}\n\n${item.latin ? item.latin + '\n\n' : ''}${item.text}\n(QS. ${item.surahNameLatin}: ${item.ayahNumber})\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
    const title = `QS. ${item.surahNameLatin}: ${item.ayahNumber}`;
    if (window.AndroidNativeInterface?.shareText) {
      try { window.AndroidNativeInterface.shareText(title, text); } catch (e) { handleCopySearchAyah(item); } finally { isSharing.current = false; }
    } else if (navigator.share) {
      try { await navigator.share({ title, text }); } catch (e: any) { if (e.name !== 'AbortError') handleCopySearchAyah(item); } finally { isSharing.current = false; }
    } else {
      handleCopySearchAyah(item);
      isSharing.current = false;
    }
  };

  const handlePlaySearchAyah = async (item: QuranSearchAyahItem) => {
    const surah = allSurahs.find(s => s.number === item.surahNumber);
    if (surah) {
      const detail = await getSurahDetail(item.surahNumber);
      if (detail && detail.ayahs) {
        const targetAyah = detail.ayahs.find(a => a.number === item.ayahNumber);
        if (targetAyah) {
          if (currentAyah?.id === targetAyah.id && isPlaying) {
            togglePlay();
          } else {
            playAyah(detail, targetAyah, detail.ayahs);
          }
          return;
        }
      }
    }
    if (item.audio) {
      const audio = new Audio(item.audio);
      audio.play().catch(e => console.warn(e));
    }
  };

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeUserBookmarks(user.uid, 'quran', (data) => {
        setBookmarks(data as BookmarkItem[]);
      });
      return () => unsubscribe();
    } else {
      const saved = localStorage.getItem('santriai_quran_bookmarks');
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('santriai_quran_bookmarks', JSON.stringify(bookmarks));
    }
  }, [bookmarks, user]);

  useEffect(() => {
    if (!loadingDetail && surahDetail && scrollToAyahRef.current) {
      const timer = setTimeout(() => {
        const pseudoId = parseInt(`${surahDetail.number}${scrollToAyahRef.current!.toString().padStart(3, '0')}`);
        const el = document.getElementById(`ayah-${pseudoId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          scrollToAyahRef.current = null;
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loadingDetail, surahDetail]);

  useEffect(() => {
      if (currentAyah && surahDetail && currentAyah.surahNumber === surahDetail.number) {
          const el = document.getElementById(`ayah-${currentAyah.id}`);
          if (el) {
             el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }
  }, [currentAyah, surahDetail]);

  // Auto-scroll follow for Full Surah + Indonesian Translation Audio (Library Track)
  useEffect(() => {
    if (isPlaying && mode === 'library' && currentLibraryItem?.id?.startsWith('surah_trans_') && surahDetail && surahDetail.ayahs && surahDetail.ayahs.length > 0 && audioDuration > 0) {
      const match = currentLibraryItem.id.match(/surah_trans_(\d+)/);
      const librarySurahNum = match ? parseInt(match[1], 10) : null;
      
      if (librarySurahNum === surahDetail.number) {
        // Calculate estimated active ayah based on playback progress
        const ayahCount = surahDetail.ayahs.length;
        const estimatedAyahIdx = Math.min(ayahCount - 1, Math.max(0, Math.floor(playbackProgress * ayahCount)));
        const targetAyah = surahDetail.ayahs[estimatedAyahIdx];
        if (targetAyah) {
          const el = document.getElementById(`ayah-${targetAyah.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    }
  }, [isPlaying, mode, currentLibraryItem, surahDetail, playbackProgress, audioDuration]);

  useEffect(() => {
    if (isPlaying && currentSurah && surahDetail && currentSurah.number !== surahDetail.number) {
       handleSurahClick(currentSurah);
    }
  }, [currentSurah, isPlaying]);

  const filteredSurahs = allSurahs.filter(s => 
    s.name_latin.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateLastRead = (surahNumber: number, surahName: string, ayahNumber: number) => {
    const lrData = {
      surahNumber,
      surahName,
      ayahNumber,
      timestamp: new Date().toISOString()
    };
    setLastRead(lrData);
    localStorage.setItem('santriai_quran_last_read', JSON.stringify(lrData));
  };

  const handleSurahClick = async (surah: Surah, targetAyah: number = 1) => {
    setView('detail');
    setLoadingDetail(true);
    setSurahDetail(surah);
    setSelectedSurah(surah);
    setIsAyahSearchOpen(false);
    setAyahSearchQuery('');
    
    updateLastRead(surah.number, surah.name_latin, targetAyah);
    
    addToHistory({
      id: `quran-${surah.number}-${Date.now()}`,
      type: 'quran',
      title: `QS. ${surah.name_latin}: ${targetAyah}`,
      subtitle: `${surah.meaning} • ${surah.number_of_ayah} Ayat`,
      timestamp: new Date().toISOString(),
      path: '/quran',
      data: { surahNumber: surah.number, targetAyah: targetAyah } 
    });

    const detail = await getSurahDetail(surah.number);
    if (detail) {
      setSurahDetail(detail);
      setSelectedSurah(detail);
    }
    
    if (targetAyah > 1) {
      scrollToAyahRef.current = targetAyah;
    } else {
      window.scrollTo(0, 0);
    }

    setLoadingDetail(false);
  };

  const handleJuzClick = (juzNumber: number) => {
    const mapping = JUZ_MAPPING[juzNumber];
    if (mapping) {
      const surah = allSurahs.find(s => s.number === mapping.surah);
      if (surah) {
        handleSurahClick(surah, mapping.ayah);
      }
    }
  };

  const handlePopularItemClick = async (item: any) => {
    if (item.action === 'surah') {
      const surah = allSurahs.find(s => s.number === item.surahNumber);
      if (surah) {
        handleSurahClick(surah);
      } else {
        showToast("Gagal membuka surah", "error");
      }
    } else if (item.action === 'verse') {
      const surah = allSurahs.find(s => s.number === item.surahNumber);
      if (surah) {
        handleSurahClick(surah, item.ayahNumber);
      } else {
        showToast("Gagal membuka ayat", "error");
      }
    } else if (item.action === 'ruqyah') {
      setModalData({
        show: true,
        title: "Ruqyah Syar'iyyah",
        subtitle: "Ayat-ayat Al-Quran untuk Syifa' (Penyembuhan) & Perlindungan",
        content: '',
        loading: false,
        isAi: false,
        type: 'ruqyah'
      });
    }
  };

  const handleBack = () => {
    setView('list');
    setSurahDetail(null);
    setIsAyahSearchOpen(false);
    setAyahSearchQuery('');
  };

  const handleBookmark = async (ayah: Ayah) => {
    if (!surahDetail) return;
    updateLastRead(surahDetail.number, surahDetail.name_latin, ayah.number);
    const id = `surah-${surahDetail.number}-ayah-${ayah.number}`;
    const exists = bookmarks.find(b => b.id === id);

    if (exists) {
      if (user) await removeUserBookmark(user.uid, id);
      else setBookmarks(prev => prev.filter(b => b.id !== id));
      showToast("Ayat dihapus dari penanda", "info");
    } else {
      const newBookmark: BookmarkItem = {
        id,
        surahNumber: surahDetail.number,
        surahName: surahDetail.name_latin,
        ayah: { ...ayah, surahNumber: surahDetail.number },
        savedAt: new Date().toISOString()
      };
      if (user) await saveUserBookmark(user.uid, 'quran', id, newBookmark);
      else setBookmarks(prev => [newBookmark, ...prev]);
      showToast("Ayat disimpan ke penanda", "success");
    }
  };

  const isBookmarked = (surahNum: number, ayahNum: number) => {
    return bookmarks.some(b => b.id === `surah-${surahNum}-ayah-${ayahNum}`);
  };

  const handleDeleteBookmark = async (id: string) => {
     if (user) await removeUserBookmark(user.uid, id);
     else setBookmarks(prev => prev.filter(b => b.id !== id));
     showToast("Penanda dihapus", "info");
  };

  const openBookmark = (item: BookmarkItem) => {
    const surah = allSurahs.find(s => s.number === item.surahNumber);
    if (surah) handleSurahClick(surah, item.ayah.number);
  };

  const handleCopy = (ayah: Ayah) => {
    if (surahDetail) {
      updateLastRead(surahDetail.number, surahDetail.name_latin, ayah.number);
    }
    const text = `${ayah.arab}\n\n${ayah.text}\n(QS. ${surahDetail?.name_latin}: ${ayah.number})\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
    navigator.clipboard.writeText(text);
    setCopiedId(ayah.id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast("Teks ayat disalin", "success");
  };

  const handleShare = async (ayah: Ayah) => {
    if (isSharing.current) return;
    if (surahDetail) {
      updateLastRead(surahDetail.number, surahDetail.name_latin, ayah.number);
    }
    isSharing.current = true;
    const text = `${ayah.arab}\n\n${ayah.text}\n(QS. ${surahDetail?.name_latin}: ${ayah.number})\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
    const title = `QS. ${surahDetail?.name_latin}: ${ayah.number}`;
    
    if (window.AndroidNativeInterface?.shareText) {
      try { window.AndroidNativeInterface.shareText(title, text); } catch (error) { handleCopy(ayah); } finally { isSharing.current = false; }
    } else if (navigator.share) {
      try { await navigator.share({ title: title, text: text }); } catch (error: any) { if (error.name !== 'AbortError') handleCopy(ayah); } finally { isSharing.current = false; }
    } else {
      handleCopy(ayah);
      isSharing.current = false;
    }
  };

  const handleShareBookmarkItem = async (item: BookmarkItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSharing.current) return;
    isSharing.current = true;
    const text = `${item.ayah.arab}\n\n${item.ayah.text}\n(QS. ${item.surahName}: ${item.ayah.number})\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
    const title = `QS. ${item.surahName}: ${item.ayah.number}`;

    if (window.AndroidNativeInterface?.shareText) {
      try { window.AndroidNativeInterface.shareText(title, text); } catch (error) {
        navigator.clipboard.writeText(text);
        showToast("Disalin", "success");
      } finally { isSharing.current = false; }
    } else if (navigator.share) {
      try { await navigator.share({ title: title, text: text }); } catch (error: any) {
        if (error.name !== 'AbortError') {
          navigator.clipboard.writeText(text);
          showToast("Disalin", "success");
        }
      } finally { isSharing.current = false; }
    } else {
      navigator.clipboard.writeText(text);
      showToast("Teks ayat disalin", "success");
      isSharing.current = false;
    }
  };

  const colorizeTajwid = (text: string) => {
    let colored = text;
    colored = colored.replace(/(اللَّهِ|اللَّهُ|اللَّهَ|لِلَّهِ|بِاللَّهِ)/g, '<span class="text-amber-500 font-bold">$1</span>');
    colored = colored.replace(/([ن|م]\u0651)/g, '<span class="text-red-600 font-bold">$1</span>');
    colored = colored.replace(/([ق|ط|ب|ج|د]\u0652)/g, '<span class="text-blue-600 font-bold">$1</span>');
    colored = colored.replace(/([\u0621-\u064A]\u0653)/g, '<span class="text-purple-600 font-bold">$1</span>');
    colored = colored.replace(/(\u06E2|\u06D8)/g, '<span class="text-teal-600 font-bold">$1</span>');
    colored = colored.replace(/([ل|ر]\u0651)/g, '<span class="text-yellow-500 font-bold">$1</span>');
    colored = colored.replace(/(\u064B|\u064C|\u064D)/g, '<span class="text-green-500 font-bold">$1</span>'); 
    colored = colored.replace(/([^نملر]\u0651)/g, '<span class="text-fuchsia-500">$1</span>');
    return colored;
  };

  const handlePlayAyah = (ayah: Ayah) => {
      if (surahDetail) {
        updateLastRead(surahDetail.number, surahDetail.name_latin, ayah.number);
      }
      if (currentAyah?.id === ayah.id) togglePlay();
      else if (surahDetail && surahDetail.ayahs) playAyah(surahDetail, ayah, surahDetail.ayahs);
  };

  const handleTools = async (type: 'Tafsir' | 'Asbabun Nuzul' | 'Bedah AI' | 'Munasabah', ayah: Ayah) => {
    const subtitle = `QS. ${surahDetail?.name_latin} Ayat ${ayah.number}`;
    if (surahDetail) {
      updateLastRead(surahDetail.number, surahDetail.name_latin, ayah.number);
    }
    
    if (type === 'Tafsir') {
      setModalData({ show: true, title: 'Tafsir Kemenag', subtitle, content: '', loading: true, isAi: false });
      try {
        if (!surahDetail) throw new Error("No surah selected");
        const tafsirData = await getTafsir(surahDetail.number);
        const ayatTafsir = tafsirData.find((t: any) => t.ayat === ayah.number);
        setModalData(prev => ({ ...prev, content: ayatTafsir ? ayatTafsir.teks : "Tafsir tidak ditemukan.", loading: false }));
      } catch (e) { setModalData(prev => ({ ...prev, content: "Gagal memuat Tafsir.", loading: false })); }
      return;
    }

    const query = `Surah ${surahDetail?.name_latin} Ayat ${ayah.number}`;
    const originalText = `Teks Arab: ${ayah.arab}\nTerjemahan: ${ayah.text}`;
    
    // Mapping focus keys for ResultScreen
    const focusMap: Record<string, string> = {
        'Asbabun Nuzul': 'asbab',
        'Munasabah': 'munasabah',
        'Bedah AI': '' // empty means show full grid
    };

    navigate('/result', {
        state: {
            mode: 'kitab',
            query: `${type} - ${query}`,
            source: "Al-Quran",
            originalText: originalText,
            focus: focusMap[type] || ''
        }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {view === 'list' ? (
        <>
          {/* Header Banner */}
          <div className="bg-[#004d00] dark:bg-emerald-950 pt-3.5 pb-2.5 px-5 rounded-b-2xl shadow-xl relative overflow-hidden mb-4">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l4 16 16 4-16 4-4 16-4-16-16-4 16-4z' fill='white'/%3E%3C/svg%3E")`,
            }} />
            {/* Animated Glows */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-santri-gold/20 rounded-full blur-[50px] animate-pulse"></div>
            
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => navigate('/')}
                  className="p-1.5 bg-white/10 hover:bg-white/20 active:scale-90 text-white rounded-xl transition-all flex-shrink-0 cursor-pointer"
                  title="Kembali ke Beranda"
                >
                  <ChevronLeft size={22} />
                </button>
                <div className="p-1.5 bg-gradient-to-br from-santri-gold to-orange-500 rounded-lg shadow-lg shadow-santri-gold/20 flex-shrink-0">
                  <BookOpen className="text-white" size={16} />
                </div>
                <div>
                  <h1 className="text-lg font-black text-white tracking-tighter uppercase italic leading-none">Al-Quran</h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsQuranSettingsOpen(true)}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                  title="Pengaturan Al-Quran"
                >
                  <Settings size={18} className="text-amber-300" />
                </button>
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

          <div className="pb-24 pt-2 px-4">
          {/* Main Tabs (Surah, Juz, Penanda) - Normal Flow without sticky collisions */}
          <div className="flex bg-emerald-100/70 dark:bg-slate-800/90 rounded-2xl p-1.5 mb-4 shadow-sm border border-emerald-200/80 dark:border-slate-700/80 transition-colors">
            {[
              { id: 'surah', label: 'Surah', icon: <BookOpen size={18} /> },
              { id: 'juz', label: 'Juz', icon: <Layers size={18} /> },
              { id: 'bookmark', label: 'Penanda', icon: <Bookmark size={18} /> },
              { id: 'history', label: 'Riwayat', icon: <History size={18} /> }
            ].map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (searchQuery) setSearchQuery('');
                }} 
                className={`flex-1 py-2 px-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all cursor-pointer ${
                  activeTab === tab.id && !searchQuery 
                    ? 'bg-emerald-600 dark:bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold' 
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700/80'
                }`}
              >
                {tab.icon}
                <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Pencarian Seluruh Al-Quran (Non-AI Direct Search) */}
          <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-5 transition-colors">
            {/* Search Input Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <Search size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleManualSearchQuran();
                    }
                  }}
                  placeholder="Cari kata di Al-Quran (puasa, shalat, rezeki, no. ayat 2:183, nama surah)..." 
                  className="flex-1 bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm font-sans" 
                />
                {isSearching && (
                  <Loader2 size={16} className="text-emerald-500 animate-spin shrink-0" />
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors shrink-0 cursor-pointer"
                    title="Hapus Pencarian"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                onClick={() => handleManualSearchQuran()}
                disabled={!searchQuery.trim() || isSearching}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer shrink-0 active:scale-95"
              >
                {isSearching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                <span className="hidden sm:inline">Cari</span>
              </button>
            </div>
          </div>

          {/* ACTIVE SEARCH VIEW (When searchQuery is present) */}
          {searchQuery.trim() ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Search Summary & Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50/70 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {isSearching ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 size={13} className="animate-spin text-emerald-600" />
                      Mencari di seluruh Al-Quran...
                    </span>
                  ) : (
                    <span>
                      Ditemukan <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{searchResults?.totalMatches || 0}</strong> hasil untuk &ldquo;<strong>{searchQuery}</strong>&rdquo;
                    </span>
                  )}
                </div>

                {searchResults && searchResults.totalMatches > 0 && (
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-emerald-200/50 dark:border-slate-800 text-[11px] font-bold">
                    <button
                      onClick={() => setSearchFilter('all')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        searchFilter === 'all'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      Semua ({searchResults.totalMatches})
                    </button>
                    <button
                      onClick={() => setSearchFilter('surah')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        searchFilter === 'surah'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      Surah ({searchResults.surahs.length})
                    </button>
                    <button
                      onClick={() => setSearchFilter('ayah')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        searchFilter === 'ayah'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      Ayat ({searchResults.ayahs.length})
                    </button>
                  </div>
                )}
              </div>

              {/* No Search Results State */}
              {!isSearching && searchResults && searchResults.totalMatches === 0 && (
                <div className="py-14 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in">
                  <Search size={44} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">
                    Tidak Ada Hasil Ditemukan
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-5 leading-relaxed">
                    Tidak ditemukan surah atau ayat yang memuat kata &ldquo;{searchQuery}&rdquo;. Pastikan ejaan kata tepat atau coba kata kunci lainnya.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-md mx-auto">
                    {['Puasa', 'Shalat', 'Sabar', 'Orang Tua', 'Rezeki', 'Surga', 'Ayat Kursi', 'Al-Baqarah 183', '36:1'].map((kw) => (
                      <button
                        key={kw}
                        onClick={() => setSearchQuery(kw)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Surahs */}
              {searchResults && searchResults.surahs.length > 0 && (searchFilter === 'all' || searchFilter === 'surah') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={14} className="text-emerald-600" />
                      <span>Surah Terkait ({searchResults.surahs.length})</span>
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {searchResults.surahs.map((surah) => (
                      <button 
                        key={surah.number} 
                        onClick={() => handleSurahClick(surah)} 
                        className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-all flex items-center justify-between group cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-santri-green dark:text-santri-gold font-black flex items-center justify-center text-sm group-hover:bg-santri-green group-hover:text-white transition-colors shrink-0">
                            <HighlightText text={String(surah.number)} query={searchQuery} highlightClassName="bg-amber-300 text-amber-950 px-1 rounded font-black shadow-xs" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base flex items-center gap-1.5">
                              <HighlightText text={surah.name_latin} query={searchQuery} highlightClassName="bg-amber-200 text-amber-950 dark:bg-amber-400/35 dark:text-amber-200 px-1 py-0.5 rounded font-bold shadow-xs" />
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full uppercase">
                                {surah.place}
                              </span>
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                              <HighlightText text={surah.meaning} query={searchQuery} highlightClassName="bg-amber-200 text-amber-950 dark:bg-amber-400/35 dark:text-amber-200 px-1 py-0.5 rounded font-semibold shadow-xs" /> • {surah.number_of_ayah} Ayat
                            </p>
                          </div>
                        </div>
                        <div className="text-santri-green dark:text-santri-gold font-arabic text-xl font-bold shrink-0">{surah.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Ayat (Full-Text Verses) */}
              {searchResults && searchResults.ayahs.length > 0 && (searchFilter === 'all' || searchFilter === 'ayah') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-500" />
                      <span>Ayat yang Ditemukan ({searchResults.ayahs.length})</span>
                    </h3>
                  </div>
                  <div className="space-y-3.5">
                    {searchResults.ayahs.map((ayah) => {
                      const ayahKey = `${ayah.surahNumber}-${ayah.ayahNumber}`;
                      const isThisCopied = copiedId === parseInt(`${ayah.surahNumber}${ayah.ayahNumber}`);
                      const ayahJuz = getCurrentJuz(ayah.surahNumber, ayah.ayahNumber);
                      const isPlayingThis = currentAyah?.surahNumber === ayah.surahNumber && currentAyah?.number === ayah.ayahNumber && isPlaying;

                      return (
                        <div 
                          key={ayahKey}
                          className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3 text-left"
                        >
                          {/* Ayat Card Header */}
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-black rounded-lg border border-emerald-200/60 dark:border-emerald-900/40">
                                QS. {ayah.surahNameLatin}: {ayah.ayahNumber}
                              </span>
                              <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-md border border-amber-200/50 dark:border-amber-900/40">
                                Juz {ayahJuz}
                              </span>
                            </div>

                            <button
                              onClick={() => handleOpenSearchResultAyah(ayah)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-600 text-slate-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-600 dark:hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                              title="Buka Ayat di Mushaf"
                            >
                              <span>Buka Ayat</span>
                              <ChevronRight size={13} />
                            </button>
                          </div>

                          {/* Arabic Text */}
                          <p 
                            className="font-arabic text-xl sm:text-2xl text-right text-slate-800 dark:text-slate-100 leading-[2.2] py-1" 
                            dir="rtl"
                          >
                            {ayah.arab}
                            <span className="mr-2 text-santri-gold font-serif text-lg">
                              ۝{toArabicNumerals(ayah.ayahNumber)}
                            </span>
                          </p>

                          {/* Latin Transliteration */}
                          {ayah.latin && (
                            <p className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-400 leading-relaxed">
                              <HighlightText 
                                text={ayah.latin} 
                                query={searchQuery} 
                                highlightClassName="bg-amber-200 text-amber-950 dark:bg-amber-400/40 dark:text-amber-200 px-1 py-0.5 rounded font-bold shadow-xs" 
                              />
                            </p>
                          )}

                          {/* Indonesian Translation with Highlight */}
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              Terjemahan:
                            </p>
                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                              <HighlightText 
                                text={ayah.text} 
                                query={searchQuery} 
                                highlightClassName="bg-amber-200 text-amber-950 dark:bg-amber-400/40 dark:text-amber-200 px-1 py-0.5 rounded font-bold shadow-xs" 
                              />
                            </p>
                          </div>

                          {/* Action Toolbar */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => handlePlaySearchAyah(ayah)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isPlayingThis
                                  ? 'bg-santri-green text-white shadow-sm'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                              title="Putar Audio Ayat"
                            >
                              {isPlayingThis ? <Pause size={13} fill="currentColor" /> : <Play size={13} className="ml-0.5" />}
                              <span>{isPlayingThis ? 'Jeda' : 'Putar'}</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleBookmarkFromSearch(ayah)}
                                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                  bookmarks.some(b => b.id === `surah-${ayah.surahNumber}-ayah-${ayah.ayahNumber}`)
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                                title="Penanda Ayat"
                              >
                                <Bookmark 
                                  size={14} 
                                  className={bookmarks.some(b => b.id === `surah-${ayah.surahNumber}-ayah-${ayah.ayahNumber}`) ? 'fill-amber-500 text-amber-500' : ''} 
                                />
                                <span className="text-[11px]">
                                  {bookmarks.some(b => b.id === `surah-${ayah.surahNumber}-ayah-${ayah.ayahNumber}`) ? 'Tersimpan' : 'Penanda'}
                                </span>
                              </button>

                              <button
                                onClick={() => handleCopySearchAyah(ayah)}
                                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                  isThisCopied
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                                title="Salin Ayat"
                              >
                                {isThisCopied ? <Check size={14} /> : <Copy size={14} />}
                                <span className="text-[11px]">{isThisCopied ? 'Tersalin' : 'Salin'}</span>
                              </button>

                              <button
                                onClick={() => handleShareSearchAyah(ayah)}
                                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                title="Bagikan Ayat"
                              >
                                <Share2 size={14} />
                                <span className="text-[11px]">Bagikan</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* DEFAULT NORMAL VIEW (When searchQuery is empty) */
            <>
              {activeTab === 'surah' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                  {/* Terakhir Dibaca - Clean Layout with no z-index overlap bug */}
                  {lastRead && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-3 duration-300">
                      <div
                        onClick={() => {
                          const surah = allSurahs.find(s => s.number === lastRead.surahNumber);
                          if (surah) handleSurahClick(surah, lastRead.ayahNumber);
                        }}
                        className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10 rounded-[2rem] border border-emerald-100/60 dark:border-emerald-900/30 p-4 flex items-center justify-between shadow-sm relative overflow-hidden group cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 transition-all active:scale-[0.98]"
                      >
                        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                        <div className="flex items-center gap-3.5 relative z-10">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
                            <BookOpen size={24} />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Terakhir Dibaca
                            </span>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">
                              QS. {lastRead.surahName}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Ayat ke-{lastRead.ayahNumber}</p>
                          </div>
                        </div>
                        <div className="px-4 py-2 bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-black rounded-full shadow-md shadow-emerald-500/20 transition-all uppercase tracking-wider shrink-0 z-10">
                          Lanjutkan
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quran Guides Card */}
                  <div className="mb-8">
                    <button
                      onClick={() => {
                        setModalData({
                          show: true,
                          title: 'Panduan & Adab Al-Quran',
                          subtitle: 'Kumpulan panduan membaca, menghafal, dan memahami Al-Quran',
                          content: '',
                          loading: false,
                          isAi: false,
                          type: 'guide_list'
                        });
                      }}
                      className="w-full bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 text-white p-5 rounded-[2rem] shadow-xl shadow-emerald-600/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center gap-5 group active:scale-[0.98] cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                      <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-md text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0 border border-white/30">
                        <BookOpen size={28} />
                      </div>
                      <div className="flex-1 text-left relative z-10">
                        <h3 className="font-black text-white text-base leading-tight mb-1">Panduan Al-Quran</h3>
                        <p className="text-xs text-emerald-100 font-medium">Cara belajar, doa, adab, hingga tips menghafal</p>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:translate-x-1 transition-transform relative z-10 border border-white/20">
                        <ChevronRight size={20} />
                      </div>
                    </button>
                  </div>

                  {/* Popular Surahs and Verses Grid */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4 px-1">
                      <span className="p-1 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <Sparkles size={16} className="fill-current" />
                      </span>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs tracking-wider uppercase">Ayat & Surah Pilihan</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {POPULAR_SECTIONS.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handlePopularItemClick(item)}
                          className={`flex flex-col text-left p-4 rounded-2xl border bg-gradient-to-br ${item.color} shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] relative overflow-hidden group cursor-pointer`}
                        >
                          <div className="absolute right-1 bottom-1 text-4xl opacity-[0.08] group-hover:scale-110 group-hover:rotate-6 transition-transform">
                            {item.icon}
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{item.icon}</span>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs tracking-tight line-clamp-1">{item.title}</h4>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">{item.subtitle}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {loadingList ? (
                    <div className="py-20">
                      <CustomLoader message="Membuka Mushaf Al-Quran..." />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allSurahs.map((surah) => (
                        <button 
                          key={surah.number} 
                          onClick={() => handleSurahClick(surah)} 
                          className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-santri-green/30 dark:hover:border-santri-gold/30 transition-all flex items-center justify-between group cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 text-santri-green dark:text-santri-gold font-bold flex items-center justify-center text-sm group-hover:bg-santri-green group-hover:text-white transition-colors shrink-0">
                              {surah.number}
                            </div>
                            <div className="text-left">
                              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                                {surah.name_latin}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {surah.meaning} • {surah.number_of_ayah} Ayat
                              </p>
                            </div>
                          </div>
                          <div className="text-santri-green dark:text-santri-gold font-arabic text-xl font-bold shrink-0">{surah.name}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Khatam Card at the bottom of the list */}
                  {!loadingList && (
                    <button
                      onClick={() => setModalData({
                        show: true,
                        title: 'Doa Khatam Al-Quran',
                        subtitle: 'Amalan terbaik setelah menyelesaikan 30 Juz',
                        content: QURAN_GUIDES.find(g => g.id === 'doa_khatam')?.content || '',
                        loading: false,
                        isAi: false,
                        type: 'guide'
                      })}
                      className="w-full mt-6 mb-10 p-5 rounded-[2rem] bg-gradient-to-br from-amber-500/10 to-santri-gold/5 border border-santri-gold/20 dark:border-santri-gold/10 flex items-center justify-between group overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 cursor-pointer"
                    >
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <Sparkles size={120} className="text-santri-gold" />
                      </div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-santri-gold text-white flex items-center justify-center shadow-lg shadow-santri-gold/20 group-hover:rotate-6 transition-transform shrink-0">
                          <Flag size={28} />
                        </div>
                        <div className="text-left">
                          <h3 className="font-black text-slate-800 dark:text-slate-100 text-base leading-tight">Selesai Membaca?</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Buka Doa Khatam Al-Quran</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-santri-gold shadow-md group-hover:translate-x-1 transition-transform relative z-10 shrink-0">
                        <ChevronRight size={22} />
                      </div>
                    </button>
                  )}
                </div>
              )}
            {activeTab === 'juz' && (
              <div className="space-y-3 animate-in fade-in duration-300">
                {lastRead && (
                  <div className="mb-6 animate-in fade-in slide-in-from-top-3 duration-300">
                    <div
                      onClick={() => {
                        const surah = allSurahs.find(s => s.number === lastRead.surahNumber);
                        if (surah) handleSurahClick(surah, lastRead.ayahNumber);
                      }}
                      className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10 rounded-[2rem] border border-emerald-100/60 dark:border-emerald-900/30 p-4 flex items-center justify-between shadow-sm relative overflow-hidden group cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 transition-all active:scale-[0.98]"
                    >
                      <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                          <Layers size={22} />
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Terakhir Dibaca
                          </span>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">
                            QS. {lastRead.surahName}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Ayat ke-{lastRead.ayahNumber} (Juz {getCurrentJuz(lastRead.surahNumber, lastRead.ayahNumber)})</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-black rounded-full shadow-lg shadow-emerald-500/20 transition-all uppercase tracking-wider shrink-0 z-10">
                        Lanjutkan
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {JUZ_INFO.map((item) => {
                    const mapping = JUZ_MAPPING[item.id];
                    const startSurah = allSurahs.find(s => s.number === mapping?.surah);
                    const isLastReadJuz = lastRead && getCurrentJuz(lastRead.surahNumber, lastRead.ayahNumber) === item.id;
                    return (
                      <button 
                        key={item.id} 
                        onClick={() => handleJuzClick(item.id)} 
                        className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group active:scale-[0.98] ${
                          isLastReadJuz 
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-905/40 shadow-sm shadow-emerald-100/50 dark:shadow-none' 
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border transition-all group-hover:bg-santri-green group-hover:text-white ${
                            isLastReadJuz 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30' 
                              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                          }`}>
                            {item.id}
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Juz {item.id}</h3>
                              {isLastReadJuz && (
                                <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded-md animate-pulse uppercase tracking-wider shadow-sm shrink-0">
                                  Terakhir Baca
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-santri-green dark:text-santri-gold font-normal uppercase tracking-wider mb-0.5">Mulai: {startSurah?.name_latin || '...'}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{item.range}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`font-arabic text-2xl group-hover:scale-110 transition-transform ${
                            isLastReadJuz ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-santri-green dark:text-santri-gold'
                          }`}>{item.start}</span>
                          <div className={`h-1 w-8 rounded-full mt-1 ${isLastReadJuz ? 'bg-emerald-500/20' : 'bg-santri-green/10'}`}></div>
                        </div>
                      </button>
                    );
                  })}

                  <div className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 rounded-2xl border border-amber-200/50 dark:border-amber-900/30 text-center relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 mb-3 animate-pulse">
                        <Sparkles size={20} className="fill-white" />
                      </div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm leading-tight">Doa Selesai Membaca Al-Qur'an</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-4">Sempurnakan tilawah Juz 30 dan Khatam Al-Qur'an dengan membaca kumpulan doa mustajab.</p>
                      <button
                        onClick={() => {
                          const g = QURAN_GUIDES.find(g => g.id === 'doa_khatam');
                          if (g) {
                            setModalData({
                              show: true,
                              title: g.title,
                              subtitle: g.description,
                              content: g.content,
                              loading: false,
                              isAi: false,
                              type: 'guide'
                            });
                          }
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-[11px] font-black rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-wider"
                      >
                        Buka Doa Khatam & Tahlil
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          {activeTab === 'bookmark' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {bookmarks.length === 0 ? (
                <div className="text-center py-20 text-slate-400 dark:text-slate-600">
                  <Bookmark size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Belum ada ayat yang disimpan.</p>
                </div>
              ) : (
                bookmarks.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => openBookmark(item)}
                    className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm relative cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-santri-green dark:text-santri-gold text-[10px] font-bold rounded">
                          {item.surahName} : {item.ayah.number}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.savedAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const text = `${item.ayah.arab}\n\n${item.ayah.text}\n(QS. ${item.surahName}: ${item.ayah.number})\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
                            navigator.clipboard.writeText(text);
                            showToast("Disalin", "success");
                          }}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Salin Ayat"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={(e) => handleShareBookmarkItem(item, e)}
                          className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Bagikan Ayat"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBookmark(item.id);
                          }}
                          className="text-red-300 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Penanda"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="font-arabic text-right text-xl text-slate-800 dark:text-slate-100 mb-2 truncate" dir="rtl">
                      {item.ayah.arab}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {item.ayah.text}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBookmark(item);
                      }}
                      className="w-full py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors"
                    >
                      Buka Ayat
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <History size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                    Riwayat Pencarian Al-Qur'an
                  </h3>
                </div>
                {quranSearchHistory.length > 0 && (
                  <button
                    onClick={clearAllQuranSearchHistory}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Hapus Semua</span>
                  </button>
                )}
              </div>

              {quranSearchHistory.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                  <History size={44} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-bold">Belum ada riwayat pencarian</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Kata kunci atau topik Al-Qur'an yang Anda cari akan tersimpan di sini.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {quranSearchHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSearchQuery(item.query);
                        handleManualSearchQuran(item.query);
                      }}
                      className="group bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700/50 hover:shadow-md transition-all flex items-center justify-between cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <Search size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">
                              &ldquo;{item.query}&rdquo;
                            </h4>
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-md shrink-0">
                              {item.totalResults} Hasil
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                            <Clock size={11} />
                            <span>{new Date(item.timestamp).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => deleteQuranSearchHistoryItem(item.id, e)}
                          className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                          title="Hapus riwayat ini"
                        >
                          <Trash2 size={16} />
                        </button>
                        <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
            </>
          )}
        </div>
        </>
      ) : (
        <div className="pb-32 pt-0 relative">
          <div className="sticky top-0 z-30 w-full">
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center justify-between transition-colors relative z-20">
              <div className="flex items-center gap-2">
                <button onClick={handleBack} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <ChevronLeft size={24} />
                </button>
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-slate-100 leading-tight text-base">{surahDetail?.name_latin || selectedSurah?.name_latin}</h2>
                  <span className="text-[10px] font-bold text-santri-green dark:text-santri-gold uppercase tracking-wider block mt-0.5">{(surahDetail?.place || selectedSurah?.place || '...')} • {(surahDetail?.number_of_ayah || selectedSurah?.number_of_ayah || '...')} AYAT</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setIsQuranSettingsOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 transition-all border border-amber-200/60 dark:border-amber-800/60 cursor-pointer"
                  title="Pengaturan Bacaan"
                >
                  <Settings size={14} className="text-amber-600 dark:text-amber-400" />
                  <span className="hidden xs:inline">Atur</span>
                </button>
                <button 
                  onClick={() => {
                    setIsAyahSearchOpen(!isAyahSearchOpen);
                    if (isAyahSearchOpen) setAyahSearchQuery('');
                  }} 
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    isAyahSearchOpen || ayahSearchQuery 
                      ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800 shadow-sm' 
                      : 'bg-blue-50 border-blue-200/60 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60 hover:bg-blue-100'
                  }`}
                  title="Cari Ayat"
                >
                  <Search size={14} className="text-blue-600 dark:text-blue-400" />
                  <span className="hidden xs:inline">Cari</span>
                </button>
                <button onClick={() => setIsTajwidMode(!isTajwidMode)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border transition-all ${isTajwidMode ? 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800 shadow-sm' : 'bg-purple-50 border-purple-200/60 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60 hover:bg-purple-100'}`}>
                  <Palette size={14} className="text-purple-600 dark:text-purple-400" />
                  <span className="hidden xs:inline">Tajwid</span>
                </button>
              </div>
            </div>
            {isAyahSearchOpen && (
              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-md px-4 py-3 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={ayahSearchQuery}
                      onChange={(e) => setAyahSearchQuery(e.target.value)}
                      placeholder={`Cari nomor ayat (1-${surahDetail?.number_of_ayah || selectedSurah?.number_of_ayah || '...'}), terjemahan, atau bacaan...`}
                      className="w-full pl-9 pr-8 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs rounded-xl border border-transparent focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                      autoFocus
                    />
                    {ayahSearchQuery && (
                      <button
                        onClick={() => setAyahSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setIsAyahSearchOpen(false);
                      setAyahSearchQuery('');
                    }}
                    className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
                  >
                    Tutup
                  </button>
                </div>
                {ayahSearchQuery.trim() && (
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                    <span>
                      Ditemukan <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{surahDetail?.ayahs ? surahDetail.ayahs.filter(a => {
                        const q = ayahSearchQuery.toLowerCase().trim();
                        return String(a.number) === q || a.arab.includes(q) || a.latin.toLowerCase().includes(q) || a.text.toLowerCase().includes(q);
                      }).length : 0}</strong> ayat cocok
                    </span>
                    {surahDetail?.ayahs && !isNaN(Number(ayahSearchQuery.trim())) && Number(ayahSearchQuery.trim()) >= 1 && Number(ayahSearchQuery.trim()) <= (surahDetail.number_of_ayah || 999) && (
                      <button
                        onClick={() => {
                          const targetAyah = Number(ayahSearchQuery.trim());
                          const pseudoId = parseInt(`${surahDetail.number}${targetAyah.toString().padStart(3, '0')}`);
                          const el = document.getElementById(`ayah-${pseudoId}`) || document.getElementById(`ayah-${targetAyah}`);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        Lompat ke Ayat {ayahSearchQuery.trim()} →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            {isTajwidMode && (<div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-lg z-10 px-4 py-4 animate-in slide-in-from-top-2 fade-in duration-200"><div className="flex justify-between items-center mb-3"><h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">KETERANGAN WARNA TAJWID</h3><button onClick={() => setIsTajwidMode(false)} className="p-1 rounded-full bg-slate-100 text-slate-400"><X size={14}/></button></div><div className="grid grid-cols-2 gap-y-2 gap-x-4"><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span><span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Ghunnah</span></div><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span><span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Ikhfa' Haqiqi</span></div><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500"></span><span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Idgham Bighunnah</span></div><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span><span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Izhar Halqi</span></div><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span><span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Qalqalah</span></div><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span><span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Iqlab</span></div><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span><span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Idgham Bilaghunnah</span></div><div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span><span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Mad</span></div></div></div>)}
          </div>
          <div className="px-4 pt-6">
            {(() => {
              const isCurrentSurahTransPlaying = mode === 'library' && currentLibraryItem?.id === `surah_trans_${surahDetail?.number}` && isPlaying;
              return (
                <div className="bg-santri-green text-white rounded-3xl p-6 mb-8 text-center relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
                  <div className="relative z-10">
                    <h1 className="font-arabic text-4xl mb-2">{surahDetail?.number !== 9 ? "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" : "أعُوذُ بِاللهِ مِنَ الشَّيْطَانِ الرَّجِيمِ"}</h1>
                    <h2 className="font-bold text-xl mb-1">{surahDetail?.name_latin}</h2>
                    <p className="text-green-100 text-xs mb-4">{surahDetail?.meaning} • {surahDetail?.number_of_ayah} Ayat</p>
                    
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button 
                        onClick={() => {
                          if (!surahDetail) return;
                          if (isCurrentSurahTransPlaying) {
                            togglePlay();
                          } else {
                            playSurahFullTranslation(surahDetail.number, surahDetail.name_latin);
                            showToast(`Memutar Full Surat + Terjemahan: QS. ${surahDetail.name_latin}`, 'info');
                          }
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                          isCurrentSurahTransPlaying 
                            ? 'bg-amber-400 text-slate-900 ring-2 ring-white/70 animate-pulse' 
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white'
                        }`}
                        title="Dengarkan rekaman audio penuh murottal beserta narator terjemahan Indonesia"
                      >
                        {isCurrentSurahTransPlaying ? (
                          <>
                            <Pause size={14} className="fill-current" />
                            <span>Jeda Audio Terjemahan</span>
                          </>
                        ) : (
                          <>
                            <Headphones size={14} />
                            <span>Audio Full Surat + Terjemahan ID</span>
                          </>
                        )}
                      </button>

                      <button onClick={() => setIsAyahSearchOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 active:scale-95 rounded-full text-xs font-medium text-white backdrop-blur-xs border border-white/20 transition-all cursor-pointer shadow-xs">
                        <Search size={13} />
                        <span>Cari Ayat</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
            {loadingDetail ? (
              <div className="py-20">
                <CustomLoader message="Mengunduh Ayat-Ayat Al-Quran..." />
              </div>
            ) : (() => {
              const filteredAyahs = (surahDetail?.ayahs || []).filter((ayah) => {
                if (!ayahSearchQuery.trim()) return true;
                const q = ayahSearchQuery.toLowerCase().trim();
                const isNumMatch = String(ayah.number) === q;
                const isArabMatch = ayah.arab.toLowerCase().includes(q);
                const isLatinMatch = ayah.latin.toLowerCase().includes(q);
                const isTextMatch = ayah.text.toLowerCase().includes(q);
                return isNumMatch || isArabMatch || isLatinMatch || isTextMatch;
              });

              if (filteredAyahs.length === 0 && ayahSearchQuery.trim()) {
                return (
                  <div className="py-14 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in">
                    <Search size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">Ayat Tidak Ditemukan</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4">
                      Tidak ditemukan ayat yang memuat kata &ldquo;{ayahSearchQuery}&rdquo; dalam Surah {surahDetail?.name_latin}.
                    </p>
                    <button
                      onClick={() => setAyahSearchQuery('')}
                      className="px-4 py-2 bg-santri-green hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      Hapus Pencarian
                    </button>
                  </div>
                );
              }

              const currentNum = surahDetail?.number || 1;
              const prevSurah = allSurahs.find(s => s.number === currentNum - 1);
              const nextSurah = allSurahs.find(s => s.number === currentNum + 1);

              return (
                <div className="space-y-4">
                  {filteredAyahs.map((ayah) => {
                    const isPlayingThis = currentAyah?.id === ayah.id && isPlaying;
                    const isCopied = copiedId === ayah.id;
                    const ayahJuz = surahDetail ? getCurrentJuz(surahDetail.number, ayah.number) : 1;
                    const words = ayah.arab.trim().split(/\s+/).filter(Boolean);
                    const activeWordIndex = (isWordHighlightActive && isPlayingThis && !isTranslationPlaying && words.length > 0)
                      ? getWordSyncIndex(words, audioCurrentTime, audioDuration)
                      : -1;

                    return (
                      <div key={ayah.id} id={`ayah-${ayah.id}`} className={`scroll-mt-32 transition-all duration-500 rounded-2xl border p-5 shadow-sm mb-4 ${
                        currentAyah?.id === ayah.id 
                          ? 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-800 shadow-md ring-1 ring-emerald-400/30' 
                          : quranTheme === 'sepia' 
                            ? 'bg-[#fbf0d9] dark:bg-[#342a1b] text-[#3d3220] dark:text-[#fde68a] border-amber-200 dark:border-amber-900/40' 
                            : quranTheme === 'dark' 
                              ? 'bg-slate-950 text-slate-100 border-slate-800' 
                              : quranTheme === 'emerald' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-50 border-emerald-200 dark:border-emerald-800/50' 
                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                      }`}>
                        <div className="w-full mb-4 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {/* Badge Nomor Ayat Timbul & Kontras */}
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-700/30 ring-2 ring-emerald-400/50 shrink-0">
                              <HighlightText text={String(ayah.number)} query={ayahSearchQuery} highlightClassName="bg-amber-300 text-amber-950 px-1 rounded font-black shadow-xs" />
                            </div>

                            {/* Tombol Play Murottal (Di samping No Ayat dengan Label Teks) */}
                            <button 
                              onClick={() => handlePlayAyah(ayah)} 
                              className={`h-9 sm:h-10 px-3 rounded-xl flex items-center gap-1.5 border transition-all shrink-0 shadow-sm cursor-pointer text-xs font-bold ${
                                isPlayingThis && !isTranslationPlaying 
                                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30 ring-2 ring-emerald-300 animate-pulse' 
                                  : 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700'
                              }`} 
                              title={isPlayingThis && !isTranslationPlaying ? "Jeda Murottal" : "Putar Audio Murottal"}
                            >
                              {isPlayingThis && !isTranslationPlaying ? (
                                <>
                                  <Pause size={15} fill="currentColor" />
                                  <span>Jeda</span>
                                </>
                              ) : (
                                <>
                                  <Play size={15} className="fill-current" />
                                  <span>Play</span>
                                </>
                              )}
                            </button>

                            {/* Tombol Speaker Terjemahan (Di samping No Ayat) */}
                            <button 
                              onClick={() => {
                                if (surahDetail) {
                                  if (currentAyah?.id === ayah.id && isPlaying && isTranslationPlaying) {
                                    stop();
                                  } else {
                                    playTranslationOnly(surahDetail, ayah);
                                    showToast(`Membacakan terjemahan QS. ${surahDetail.name_latin}: ${ayah.number}`, "info");
                                  }
                                }
                              }} 
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border transition-all shrink-0 shadow-sm cursor-pointer ${
                                currentAyah?.id === ayah.id && isPlaying && isTranslationPlaying 
                                  ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/30 ring-2 ring-amber-300 animate-pulse' 
                                  : 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-700'
                              }`}
                              title={currentAyah?.id === ayah.id && isPlaying && isTranslationPlaying ? "Hentikan Suara Terjemahan" : "Dengarkan Suara Terjemahan (ID)"}
                            >
                              {currentAyah?.id === ayah.id && isPlaying && isTranslationPlaying ? <VolumeX size={17} /> : <Volume2 size={17} />}
                            </button>

                            {isPlayingThis && (
                              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-xs animate-pulse">
                                <Volume2 size={12} />
                                <span>{isTranslationPlaying ? 'Terjemahan' : 'Dibacakan'}</span>
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={() => {
                              setView('list');
                              setActiveTab('juz');
                              showToast(`Membuka Daftar Juz`, "info");
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-100 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all shadow-sm active:scale-95"
                          >
                            <Layers size={13} className="text-amber-500" />
                            <span>Juz {ayahJuz}</span>
                          </button>
                        </div>
                        <p 
                          className={`text-right leading-[2.8] mb-6 px-1 ${arabicFont === 'scheherazade' ? 'font-serif' : 'font-arabic'} ${quranTheme === 'sepia' ? 'text-[#3d3220] dark:text-[#FFD700]' : quranTheme === 'dark' ? 'text-slate-100' : quranTheme === 'emerald' ? 'text-emerald-950 dark:text-[#4ade80]' : 'text-slate-800 dark:text-slate-100'}`} 
                          dir="rtl" 
                          style={{ fontSize: `${arabicFontSize}px` }}
                        >
                          {words.map((word, wIdx) => {
                            const isCurrentWordActive = isWordHighlightActive && isPlayingThis && !isTranslationPlaying && wIdx === activeWordIndex;
                            const coloredWordHtml = isTajwidActive || isTajwidMode ? colorizeTajwid(word) : word;
                            return (
                              <span
                                key={wIdx}
                                className={`inline-block transition-all duration-200 rounded-lg px-1 py-0.5 mx-0.5 ${
                                  isCurrentWordActive
                                    ? 'bg-amber-300/40 dark:bg-amber-400/30 text-amber-900 dark:text-amber-200 font-extrabold ring-2 ring-amber-400 shadow-md scale-105'
                                    : ''
                                }`}
                                dangerouslySetInnerHTML={{ __html: coloredWordHtml }}
                              />
                            );
                          })}
                          <span className="mr-1 text-santri-gold font-serif text-2xl inline-block select-none align-middle">
                            ۝{toArabicNumerals(ayah.number)}
                          </span>
                        </p>
                        {showLatin && (
                          <p className="text-santri-green dark:text-santri-gold font-medium text-sm mb-2 leading-relaxed text-left">
                            <HighlightText text={ayah.latin} query={ayahSearchQuery} highlightClassName="bg-amber-200 text-amber-950 dark:bg-amber-400/35 dark:text-amber-200 px-1 py-0.5 rounded font-bold shadow-xs" />
                          </p>
                        )}
                        {showTranslation && (
                          <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed text-justify">
                            <HighlightText text={ayah.text} query={ayahSearchQuery} highlightClassName="bg-amber-200 text-amber-950 dark:bg-amber-400/35 dark:text-amber-200 px-1 py-0.5 rounded font-semibold shadow-xs" />
                          </p>
                        )}
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                          <button onClick={() => handleBookmark(ayah)} className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all shrink-0 ${surahDetail && isBookmarked(surahDetail.number, ayah.number) ? 'bg-green-50 text-santri-green border-green-200' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`} title="Tandai / Bookmark">
                            <Bookmark size={18} fill={surahDetail && isBookmarked(surahDetail.number, ayah.number) ? "currentColor" : "none"} />
                          </button>
                          <button onClick={() => handleCopy(ayah)} className="w-10 h-10 rounded-full flex items-center justify-center border bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 shrink-0" title="Salin Teks Ayat">
                            {isCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                          </button>
                          <button onClick={() => handleShare(ayah)} className="w-10 h-10 rounded-full flex items-center justify-center border bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 shrink-0" title="Bagikan Ayat">
                            <Share2 size={18} />
                          </button>
                          <button onClick={() => handleTools('Asbabun Nuzul', ayah)} className="px-4 h-10 rounded-full border border-red-200 bg-red-50 text-red-600 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:bg-red-100 transition-colors">
                            <BookOpen size={14} /> Asbabun Nuzul
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-2 overflow-x-auto no-scrollbar pb-2">
                          <button onClick={() => handleTools('Munasabah', ayah)} className="px-4 py-2 rounded-lg bg-teal-50 text-teal-600 text-[11px] font-bold border border-teal-100 whitespace-nowrap active:scale-95 transition-transform">Munasabah</button>
                          <button onClick={() => handleTools('Tafsir', ayah)} className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-bold border border-blue-200 whitespace-nowrap flex items-center gap-1.5 active:scale-95 transition-transform"><BookOpen size={13} /> Tafsir</button>
                          <button onClick={() => handleTools('Bedah AI', ayah)} className="px-4 py-2 rounded-lg bg-[#FFF9E6] text-amber-600 text-[11px] font-bold border border-amber-200 whitespace-nowrap flex items-center gap-1 active:scale-95 transition-transform"><Brain size={14} /> Bedah AI</button>
                        </div>
                        
                        {surahDetail?.number === 114 && ayah.number === 6 && (
                          <div className="mt-8 pt-8 border-t border-dashed border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-10 duration-1000">
                            <div className="text-center mb-6">
                              <div className="inline-block px-4 py-1.5 bg-amber-500 text-white text-[10px] font-black rounded-full uppercase tracking-[0.25em] shadow-lg shadow-amber-500/20 mb-3">
                                TAMAT AL-QURAN
                              </div>
                              <h3 className="font-black text-slate-800 dark:text-white text-lg">Alhamdulillah, Khatam!</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sempurnakan dengan Doa Khatam & Tahlil</p>
                            </div>
                            
                            <button 
                              onClick={() => {
                                const g = QURAN_GUIDES.find(g => g.id === 'doa_khatam');
                                if (g) {
                                  setModalData({
                                    show: true,
                                    title: g.title,
                                    subtitle: g.description,
                                    content: g.content,
                                    loading: false,
                                    isAi: false,
                                    type: 'guide'
                                  });
                                }
                              }}
                              className="w-full bg-gradient-to-br from-amber-400 to-orange-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-amber-500/30 group active:scale-[0.98] transition-all relative overflow-hidden"
                            >
                               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                               <div className="relative z-10 flex items-center justify-between">
                                 <div className="flex items-center gap-4 text-left">
                                   <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner group-hover:scale-110 transition-transform">
                                     <Sparkles size={28} className="text-white fill-white" />
                                   </div>
                                   <div>
                                     <h4 className="font-black text-base">Panduan Khatam</h4>
                                     <p className="text-[10px] font-bold text-amber-100 opacity-90 uppercase tracking-widest">Klik untuk lihat Doa & Tahlil</p>
                                   </div>
                                 </div>
                                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                   <ChevronRight size={20} />
                                 </div>
                               </div>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Tombol Selanjutnya (Kiri - Hijau) & Sebelumnya (Kanan - Kuning/Amber) dalam 1 Baris */}
                  {!ayahSearchQuery.trim() && (
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between gap-2.5 sm:gap-3">
                      {/* Selanjutnya (Kiri - Hijau Padat) */}
                      {nextSurah ? (
                        <button
                          onClick={() => handleSurahClick(nextSurah)}
                          className="flex-1 min-w-0 p-3 sm:p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 sm:gap-3 cursor-pointer group text-left active:scale-[0.98]"
                        >
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 text-white group-hover:bg-white/30 flex items-center justify-center shrink-0 transition-colors">
                            <ChevronLeft size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider block">
                              Selanjutnya
                            </span>
                            <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                              {nextSurah.number}. {nextSurah.name_latin}
                            </h4>
                          </div>
                        </button>
                      ) : (
                        <div className="flex-1 min-w-0"></div>
                      )}

                      {/* Sebelumnya (Kanan - Kuning/Amber Padat) */}
                      {prevSurah ? (
                        <button
                          onClick={() => handleSurahClick(prevSurah)}
                          className="flex-1 min-w-0 p-3 sm:p-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-white rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-between gap-2 sm:gap-3 cursor-pointer group text-right active:scale-[0.98]"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-amber-950/80 dark:text-amber-100 uppercase tracking-wider block">
                              Sebelumnya
                            </span>
                            <h4 className="font-bold text-slate-950 dark:text-white text-xs sm:text-sm truncate">
                              {prevSurah.number}. {prevSurah.name_latin}
                            </h4>
                          </div>
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/10 dark:bg-white/20 text-slate-950 dark:text-white group-hover:bg-black/20 dark:group-hover:bg-white/30 flex items-center justify-center shrink-0 transition-colors">
                            <ChevronRight size={18} />
                          </div>
                        </button>
                      ) : (
                        <div className="flex-1 min-w-0"></div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
      
      {modalData.show && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[85vh] border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
              <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 shrink-0"><div className="flex items-center gap-3"><div className={`p-2 rounded-full ${modalData.isAi ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>{modalData.isAi ? <Brain size={20} /> : <BookOpen size={20} />}</div><div><h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{modalData.title}</h3>{modalData.subtitle && (<p className="text-xs text-slate-500 dark:text-slate-400">{modalData.subtitle}</p>)}</div></div><button onClick={() => setModalData({ ...modalData, show: false })} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600"><X size={20} /></button></div>
              <div className="overflow-y-auto p-6 flex-1">
                {modalData.loading ? (
                  <CustomLoader message={modalData.isAi ? "AI sedang menganalisis ayat..." : "Memuat data..."} />
                ) : (
                  <div className={`prose prose-sm max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-justify ${modalData.isAi || modalData.type === 'guide' || modalData.type === 'guide_list' ? 'whitespace-pre-line' : ''}`}>
                    {modalData.type === 'guide' ? (
                      <div className="space-y-4">
                        {modalData.content.split('\n\n').map((para, i) => {
                          if (para.startsWith('###')) {
                            return <h4 key={i} className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-4 border-b border-emerald-50 dark:border-emerald-900/30 pb-2">{para.replace(/###\s?/, '')}</h4>;
                          }
                          return <p key={i} className="text-xs text-slate-600 dark:text-slate-400" dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
                        })}
                      </div>
                    ) : modalData.type === 'guide_list' ? (
                      <div className="space-y-3 pb-4">
                        {QURAN_GUIDES.map((guide) => {
                          const isOpen = activeAccordion === guide.id;
                          return (
                            <div key={guide.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
                              <button 
                                onClick={() => setActiveAccordion(isOpen ? null : guide.id)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-xl ${guide.color} text-white flex items-center justify-center shadow-sm`}>
                                    {React.cloneElement(guide.icon as React.ReactElement<any>, { size: 16 })}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{guide.title}</h4>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{guide.description}</p>
                                  </div>
                                </div>
                                <div className={`text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                  <ChevronDown size={18} />
                                </div>
                              </button>
                              {isOpen && (
                                <div className="px-4 pb-4 pt-1 animate-in slide-in-from-top-2 duration-300">
                                  <div className="h-px bg-slate-100 dark:bg-slate-800 mb-4 w-full" />
                                  <div className="space-y-4">
                                    {guide.content.split('\n\n').map((para, i) => {
                                      if (para.startsWith('###')) {
                                        return <h4 key={i} className="text-emerald-600 dark:text-emerald-400 font-black text-[11px] uppercase tracking-wider mt-4 border-l-2 border-emerald-500 pl-2">{para.replace(/###\s?/, '')}</h4>;
                                      }
                                      return <p key={i} className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : modalData.type === 'ruqyah' ? (
                      <div className="space-y-4 pb-4 font-sans">
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-xs text-emerald-850 dark:text-emerald-300 leading-relaxed">
                          <strong>Tentang Ruqyah Syar'iyyah:</strong> Ruqyah adalah metode penyembuhan & perlindungan dengan membacakan ayat Al-Quran dan doa sesuai syariat Islam untuk membentengi diri dari gangguan penyakit, pandangan mata jahat (Al-Ain), hasad, dan gangguan setan/jin.
                        </div>
                        
                        <div className="space-y-3">
                          {[
                            {
                              id: 'ruqyah-fatihah',
                              title: '1. Surah Al-Fatihah (Ayat 1-7)',
                              arab: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
                              benefit: 'Sebagai pembuka pintu kesembuhan (Syifa) dan perlindungan menyeluruh.'
                            },
                            {
                              id: 'ruqyah-kursi',
                              title: '2. Ayat Kursi (Al-Baqarah: 255)',
                              arab: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
                              benefit: 'Perlindungan utama dari kejahatan setan dan gangguan di waktu siang maupun malam.'
                            },
                            {
                              id: 'ruqyah-baqarah-akhir',
                              title: '3. Akhir Al-Baqarah (Ayat 285-286)',
                              arab: 'آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ وَقَالُوا سَمِعْنَا وَأَطَعْنَا غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
                              benefit: 'Mencukupi kebutuhan jasmani dan rohani serta melindungi pembacanya dari segala keburukan di malam hari.'
                            },
                            {
                              id: 'ruqyah-ikhlas',
                              title: '4. Surah Al-Ikhlas (3x)',
                              arab: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَد * وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
                              benefit: 'Setara sepertiga Al-Quran, meneguhkan keesaan Allah yang mutlak.'
                            },
                            {
                              id: 'ruqyah-falaq',
                              title: '5. Surah Al-Falaq (3x)',
                              arab: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
                              benefit: 'Pelindung dari sihir (hembusan buhul), kejahatan malam, dan kedengkian.'
                            },
                            {
                              id: 'ruqyah-nas',
                              title: '6. Surah An-Nas (3x)',
                              arab: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
                              benefit: 'Pelindung dari bisikan setan tersembunyi, baik jin maupun manusia.'
                            }
                          ].map((r) => (
                            <div key={r.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/30">
                              <h4 className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-wide">{r.title}</h4>
                              <p className="font-arabic text-right text-lg text-slate-800 dark:text-slate-100 leading-[2.2] mb-3" dir="rtl">{r.arab}</p>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-2 font-medium">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 mr-1">Fadhilah:</span> {r.benefit}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : modalData.content}
                  </div>
                )}
              </div>
              <div className="h-2 shrink-0"></div>
           </div>
        </div>
      )}
      {/* QURAN SETTINGS MODAL */}
      <AnimatePresence>
        {isQuranSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1050] bg-black/60 backdrop-blur-sm flex items-center justify-center sm:p-4 overflow-hidden"
            onClick={() => setIsQuranSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-[2.5rem] shadow-2xl border-0 sm:border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-santri-green dark:text-santri-gold flex items-center justify-center font-bold">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Pengaturan Al-Quran</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Sesuaikan tampilan & audio bacaan</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQuranSettingsOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 no-scrollbar">
                
                {/* 1. Mode Tampilan Aplikasi */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2.5">
                    1. Mode Tampilan Aplikasi (Tema)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'light', label: 'Putih', icon: Sun },
                      { id: 'dark', label: 'Hitam', icon: Moon },
                      { id: 'system', label: 'Bawaan Perangkat', icon: Monitor },
                    ].map(t => {
                      const IconComp = t.icon;
                      const isActive = appTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => handleAppThemeChange(t.id as any)}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${isActive ? 'bg-santri-green text-white border-santri-green shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'}`}
                        >
                          <IconComp size={16} />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Mode Warna Bacaan */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2.5">
                    2. Mode Warna Bacaan (Surah)
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 'default', label: 'Putih Bersih (Default)', bg: 'bg-white text-slate-800 border-slate-200' },
                      { id: 'sepia', label: 'Sepia (Krem Hangat)', bg: 'bg-[#fbf0d9] dark:bg-[#342a1b] text-[#3d3220] dark:text-[#FFD700] border-amber-200 dark:border-amber-900/40' },
                      { id: 'dark', label: 'Mode Gelap (Dark)', bg: 'bg-slate-950 text-slate-100 border-slate-800' },
                      { id: 'emerald', label: 'Hijau Santri (Mint)', bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-[#4ade80] border-emerald-200 dark:border-emerald-800/50' },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setQuranTheme(item.id as any);
                          localStorage.setItem('santriai_quran_theme', item.id);
                        }}
                        className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${item.bg} ${quranTheme === item.id ? 'ring-2 ring-santri-green shadow-sm' : 'opacity-80 hover:opacity-100'}`}
                      >
                        <span>{item.label}</span>
                        {quranTheme === item.id && <Check size={16} className="text-santri-green" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Ukuran Huruf Arab & Pratinjau Teks */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      3. Ukuran & Pratinjau Huruf Arab ({arabicFontSize}px)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newSize = Math.max(22, arabicFontSize - 2);
                          setArabicFontSize(newSize);
                          localStorage.setItem('santriai_quran_font_size', String(newSize));
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-200"
                      >
                        -
                      </button>
                      <button
                        onClick={() => {
                          const newSize = Math.min(48, arabicFontSize + 2);
                          setArabicFontSize(newSize);
                          localStorage.setItem('santriai_quran_font_size', String(newSize));
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="22"
                    max="48"
                    step="2"
                    value={arabicFontSize}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setArabicFontSize(val);
                      localStorage.setItem('santriai_quran_font_size', String(val));
                    }}
                    className="w-full accent-santri-green cursor-pointer mb-3"
                  />
                  {/* Pratinjau teks mengikuti jenis font yang dipilih */}
                  <div className={`text-center py-3 px-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 leading-loose ${arabicFont === 'scheherazade' ? 'font-serif' : arabicFont === 'indopak' ? 'font-serif' : 'font-arabic'}`} style={{ fontSize: `${arabicFontSize}px` }}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                </div>

                {/* 4. Standar Penulisan (Rasm & Dhabt) */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2.5">
                    4. Standar Penulisan (Rasm & Dhabt)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'madinah', label: 'Utsmani Madinah' },
                      { id: 'kemenag', label: 'Standar Kemenag' },
                      { id: 'indopak', label: 'IndoPak' },
                    ].map(r => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setArabicStandard(r.id);
                          localStorage.setItem('santriai_quran_standard', r.id);
                        }}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                          arabicStandard === r.id 
                            ? 'bg-santri-green text-white border-santri-green shadow-sm' 
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Gaya Font (Tampilan Visual) */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2.5">
                    5. Gaya Font (Tampilan Visual)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'scheherazade', label: 'Scheherazade' },
                      { id: 'amiri', label: 'Amiri Classic' },
                      { id: 'uthmanic', label: 'LPMQ / Uthmanic' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setArabicFont(f.id);
                          localStorage.setItem('santriai_quran_font', f.id);
                        }}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${arabicFont === f.id ? 'bg-santri-green text-white border-santri-green shadow-sm' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'}`}
                      >
                        <span>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Tajwid & Panduan Tajwid */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">4. Tajwid Berwarna</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Tampilkan warna hukum tajwid pada teks Arab</p>
                    </div>
                    <button
                      onClick={() => {
                        const newVal = !isTajwidActive;
                        setIsTajwidActive(newVal);
                        setIsTajwidMode(newVal);
                        localStorage.setItem('santriai_quran_tajwid', String(newVal));
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative p-1 ${isTajwidActive ? 'bg-santri-green' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isTajwidActive ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setIsQuranSettingsOpen(false);
                      setIsTajwidMode(true);
                    }}
                    className="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/40 text-santri-green dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
                  >
                    <span>📖 Buka Panduan & Keterangan Tajwid</span>
                  </button>
                </div>

                {/* 5. Terjemahan & Latin */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">5. Terjemahan Indonesia</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Tampilkan arti/terjemahan ayat</p>
                    </div>
                    <button
                      onClick={() => {
                        const newVal = !showTranslation;
                        setShowTranslation(newVal);
                        localStorage.setItem('santriai_quran_translation', String(newVal));
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative p-1 ${showTranslation ? 'bg-santri-green' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${showTranslation ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">6. Teks Latin (Transliterasi)</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Tampilkan bacaan latin ayat</p>
                    </div>
                    <button
                      onClick={() => {
                        const newVal = !showLatin;
                        setShowLatin(newVal);
                        localStorage.setItem('santriai_quran_latin', String(newVal));
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative p-1 ${showLatin ? 'bg-santri-green' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${showLatin ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">7. Sorotan Kata Saat Audio Berputar</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Efek sorotan kata Arab per kata dari kanan ke kiri mengikuti qori</p>
                    </div>
                    <button
                      onClick={() => {
                        const newVal = !isWordHighlightActive;
                        setIsWordHighlightActive(newVal);
                        localStorage.setItem('santriai_quran_word_highlight', String(newVal));
                        showToast(newVal ? "Sorotan kata aktif" : "Sorotan kata dinonaktifkan", "info");
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${isWordHighlightActive ? 'bg-santri-green' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isWordHighlightActive ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* 8. Pilih Qori & Pratinjau Audio */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      8. Pilih Qori (Audio Murottal)
                    </label>
                    <button
                      onClick={handleTogglePreviewAudio}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                        isPreviewPlaying 
                          ? 'bg-amber-500 text-white border-amber-600 shadow-md animate-pulse' 
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-santri-green dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                      }`}
                      title="Dengarkan Contoh Suara Qori"
                    >
                      {isPreviewPlaying ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                          <span>Hentikan Suara</span>
                        </>
                      ) : (
                        <>
                          <span>▶️ Pratinjau Suara</span>
                        </>
                      )}
                    </button>
                  </div>
                  <select
                    value={selectedQari}
                    onChange={(e) => {
                      setSelectedQari(e.target.value);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-santri-green"
                  >
                    <option value="05">Misyari Rasyid Al-Afasi (Rekomendasi / Super Cepat)</option>
                    <option value="saadalghamdi">Saad Al-Ghamidi (Suara Merdu & Syahdu)</option>
                    <option value="hanirifai">Hani Ar-Rifai (Sangat Khusyuk)</option>
                    <option value="03">Abdurrahman As-Sudais (Imam Masjidil Haram)</option>
                    <option value="06">Yasser Al-Dosari (Imam Masjidil Haram)</option>
                    <option value="01">Abdullah Al-Juhany (Imam Masjidil Haram)</option>
                    <option value="02">Abdul-Muhsin Al-Qasim (Imam Masjid Nabawi)</option>
                    <option value="04">Ibrahim Al-Dossari</option>
                    <option value="husary">Mahmoud Khalil Al-Husary (Tajwid Standar)</option>
                    <option value="minshawy">Muhammad Siddiq Al-Minshawi (Mujawwad)</option>
                  </select>
                </div>

                {/* 9. Audio Terjemahan Bahasa Indonesia */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">9. Audio Terjemahan (Bahasa Indonesia)</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Putar suara arti/terjemahan setelah ayat Murottal</p>
                    </div>
                    <button
                      onClick={() => {
                        const newVal = !autoPlayTranslation;
                        setAutoPlayTranslation(newVal);
                        showToast(newVal ? "Audio terjemahan otomatis diaktifkan" : "Audio terjemahan otomatis dinonaktifkan", "info");
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${autoPlayTranslation ? 'bg-santri-green' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoPlayTranslation ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                    <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Volume2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                      Pratinjau Suara Terjemahan
                    </span>
                    <button
                      onClick={handleTogglePreviewTranslationAudio}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        isPreviewTranslationPlaying
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs animate-pulse'
                          : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50'
                      }`}
                    >
                      {isPreviewTranslationPlaying ? '⏹ Hentikan' : '▶ Tes Suara ID'}
                    </button>
                  </div>
                </div>

                {/* 8, 9, 10, 11: Panduan Membaca, Khatam & Laporkan */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setIsQuranSettingsOpen(false);
                      const g = QURAN_GUIDES.find(g => g.id === 'ilmu');
                      if (g) {
                        setModalData({
                          show: true,
                          title: g.title,
                          subtitle: g.description,
                          content: g.content,
                          loading: false,
                          isAi: false,
                          type: 'guide'
                        });
                      }
                    }}
                    className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-2xl text-xs font-bold border border-blue-200 dark:border-blue-800 text-left hover:bg-blue-100 transition-colors"
                  >
                    📖 Panduan Membaca
                  </button>
                  <button
                    onClick={() => {
                      setIsQuranSettingsOpen(false);
                      const g = QURAN_GUIDES.find(g => g.id === 'doa_khatam');
                      if (g) {
                        setModalData({
                          show: true,
                          title: g.title,
                          subtitle: g.description,
                          content: g.content,
                          loading: false,
                          isAi: false,
                          type: 'guide'
                        });
                      }
                    }}
                    className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-2xl text-xs font-bold border border-amber-200 dark:border-amber-800 text-left hover:bg-amber-100 transition-colors"
                  >
                    ✨ Doa & Khatam Quran
                  </button>
                  <button
                    onClick={() => {
                      setIsQuranSettingsOpen(false);
                      setIsReportOpen(true);
                    }}
                    className="col-span-2 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-2xl text-xs font-bold border border-rose-200 dark:border-rose-800 text-center hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Flag size={14} />
                    <span>Laporkan Masalah / Kesalahan Teks</span>
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Report Modal */}
      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName="Al-Qur'an Digital"
        contentSnippet={surahDetail?.name_latin ? `Surah ${surahDetail.name_latin}` : 'Al-Qur\'an Digital'}
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};

export default QuranScreen;
