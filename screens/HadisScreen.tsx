import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { askReligiousQuery } from '../services/geminiService';
import { getHadithBooks, getHadithRange, searchHadiths, SearchHadithResult } from '../services/hadithApiService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext'; 
import { UserAvatar } from '../components/UserAvatar';
import { saveUserBookmark, removeUserBookmark, subscribeUserBookmarks, deductWasilahForAI } from '../services/firebase'; 
import { useHistory } from '../contexts/HistoryContext';
import { HadithBook, HadithDetail } from '../types';
import { PLAYSTORE_LINK } from '../constants';
import CustomLoader from '../components/CustomLoader';
import { 
  Search, 
  Loader2, 
  Scroll, 
  Book, 
  ChevronLeft, 
  ChevronRight, 
  Brain,
  X,
  BookOpen,
  ArrowRight,
  WifiOff,
  RefreshCw,
  Bookmark,
  Trash2,
  Copy,
  Share2,
  Check,
  Quote,
  CheckCircle2,
  AlertCircle,
  History,
  Clock,
  User,
  Info,
  Star,
  Flag,
  ArrowLeft,
  Sparkles,
  Gem,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { validateIslamicQuote, analyzeHadith, generateKitabAnalysis, generateScholarBiography } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import ContentReportModal from '../components/ContentReportModal';
import { InsufficientWasilahModal } from '../components/InsufficientWasilahModal';
import { openRatingApp } from '../utils/linkUtils';
import { HighlightText } from '../components/HighlightText';

export interface HadithHistoryItem {
  id: string;
  type: 'pakar' | 'read' | 'search';
  title: string;
  subtitle?: string;
  timestamp: number;
  pakarTool?: 'quote' | 'hadith' | 'asbab' | 'bedah';
  pakarQuery?: string;
  pakarResult?: any;
  bookId?: string;
  bookName?: string;
  hadithNumber?: number;
  arabSnippet?: string;
  translationSnippet?: string;
  searchKeyword?: string;
  searchBookId?: string;
  searchBookName?: string;
  totalResults?: number;
}

interface BookmarkHadith extends HadithDetail {
  bookName: string;
  bookId: string;
  savedAt: string;
}

const BOOK_THEMES = [
  { header: 'bg-gradient-to-r from-emerald-600 to-teal-700', bg: 'bg-white/25', text: 'text-white', border: 'border-emerald-400/50', cardBg: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:from-emerald-600 hover:to-teal-600', hero: 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800', toolbar: 'bg-gradient-to-r from-emerald-600 to-teal-600', toolbarBorder: 'border-emerald-500/50' },
  { header: 'bg-gradient-to-r from-blue-600 to-indigo-700', bg: 'bg-white/25', text: 'text-white', border: 'border-blue-400/50', cardBg: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md hover:from-blue-600 hover:to-indigo-600', hero: 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800', toolbar: 'bg-gradient-to-r from-blue-600 to-indigo-600', toolbarBorder: 'border-blue-500/50' },
  { header: 'bg-gradient-to-r from-amber-600 to-orange-700', bg: 'bg-white/25', text: 'text-white', border: 'border-amber-400/50', cardBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600', hero: 'bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800', toolbar: 'bg-gradient-to-r from-amber-600 to-orange-600', toolbarBorder: 'border-amber-500/50' },
  { header: 'bg-gradient-to-r from-rose-600 to-pink-700', bg: 'bg-white/25', text: 'text-white', border: 'border-rose-400/50', cardBg: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md hover:from-rose-600 hover:to-pink-600', hero: 'bg-gradient-to-br from-rose-600 via-rose-700 to-pink-800', toolbar: 'bg-gradient-to-r from-rose-600 to-pink-600', toolbarBorder: 'border-rose-500/50' },
  { header: 'bg-gradient-to-r from-indigo-600 to-violet-700', bg: 'bg-white/25', text: 'text-white', border: 'border-indigo-400/50', cardBg: 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md hover:from-indigo-600 hover:to-violet-600', hero: 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800', toolbar: 'bg-gradient-to-r from-indigo-600 to-violet-600', toolbarBorder: 'border-indigo-500/50' },
  { header: 'bg-gradient-to-r from-cyan-600 to-sky-700', bg: 'bg-white/25', text: 'text-white', border: 'border-cyan-400/50', cardBg: 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-md hover:from-cyan-600 hover:to-sky-600', hero: 'bg-gradient-to-br from-cyan-600 via-cyan-700 to-sky-800', toolbar: 'bg-gradient-to-r from-cyan-600 to-sky-600', toolbarBorder: 'border-cyan-500/50' },
  { header: 'bg-gradient-to-r from-purple-600 to-fuchsia-700', bg: 'bg-white/25', text: 'text-white', border: 'border-purple-400/50', cardBg: 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-md hover:from-purple-600 hover:to-fuchsia-600', hero: 'bg-gradient-to-br from-purple-600 via-purple-700 to-fuchsia-800', toolbar: 'bg-gradient-to-r from-purple-600 to-fuchsia-600', toolbarBorder: 'border-purple-500/50' },
  { header: 'bg-gradient-to-r from-orange-600 to-red-700', bg: 'bg-white/25', text: 'text-white', border: 'border-orange-400/50', cardBg: 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:from-orange-600 hover:to-red-600', hero: 'bg-gradient-to-br from-orange-600 via-orange-700 to-red-800', toolbar: 'bg-gradient-to-r from-orange-600 to-red-600', toolbarBorder: 'border-orange-500/50' },
  { header: 'bg-gradient-to-r from-teal-600 to-emerald-700', bg: 'bg-white/25', text: 'text-white', border: 'border-teal-400/50', cardBg: 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md hover:from-teal-600 hover:to-emerald-600', hero: 'bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800', toolbar: 'bg-gradient-to-r from-teal-600 to-emerald-600', toolbarBorder: 'border-teal-500/50' },
];

const PAKAR_LOADING_CONFIG = {
  hadith: {
    title: "Mencari & Menelaah Hadis",
    subtitle: "Menelusuri matan hadis dalam 9 Kitab Utama, syarah muktabar, dan derajat kesahihan",
    steps: [
      "Menganalisis kata kunci & tema pencarian hadis...",
      "Menelusuri matan hadis dalam Kutubus Sittah & Tis'ah...",
      "Memeriksa derajat kesahihan, sanad, dan perawi hadis...",
      "Menyusun terjemahan dan syarah faidah hukum..."
    ]
  },
  asbab: {
    title: "Menganalisis Asbabun Wurud",
    subtitle: "Menggali latar belakang historis dan konteks sabda Nabi SAW",
    steps: [
      "Membuka literatur Asbabul Wurud (As-Suyuthi & Ibnu Hamzah)...",
      "Menganalisis konteks peristiwa & penanya hadis...",
      "Menghubungkan relevansi sabda dengan peristiwa zaman Nabi...",
      "Menyimpulkan hikmah dan 'illat hukum..."
    ]
  },
  quote: {
    title: "Memeriksa Kesahihan Kutipan",
    subtitle: "Memverifikasi apakah ucapan adalah Hadis Nabi atau Maqolah Ulama",
    steps: [
      "Mencocokkan lafadz kutipan dengan database Hadis...",
      "Mendeteksi status (Hadis Nabawi vs Maqolah Ulama)...",
      "Memeriksa derajat riwayat (Shahih / Hasan / Dha'if / Palsu)...",
      "Menyusun catatan ilmiah & status keaslian..."
    ]
  },
  bedah: {
    title: "Membedah Matan & Sanad Hadis",
    subtitle: "Analisis komprehensif struktur bahasa, faedah fiqih, dan syarah",
    steps: [
      "Menganalisis matan dan kosakata kunci hadis...",
      "Membuka syarah muktamad para imam muhadditsin...",
      "Mengurai faedah fiqih dan ibrah kehidupan...",
      "Menyusun ulasan ilmiah terpadu..."
    ]
  }
};

const HadisScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { user, userData } = useAuth();
  const { addToHistory } = useHistory();
  
  // Navigation State
  const [activeBook, setActiveBook] = useState<HadithBook | null>(null);
  const [viewMode, setViewMode] = useState<'books' | 'bookmarks' | 'ai' | 'history'>('books');
  const [hadithHistory, setHadithHistory] = useState<HadithHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('santriai_hadis_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [historyFilter, setHistoryFilter] = useState<'all' | 'pakar' | 'read' | 'search'>('all');
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  
  // Data State
  const [books, setBooks] = useState<HadithBook[]>([]);
  const [hadiths, setHadiths] = useState<HadithDetail[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkHadith[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingHadiths, setLoadingHadiths] = useState(false);
  const [errorBooks, setErrorBooks] = useState(false);
  const [errorHadiths, setErrorHadiths] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  
  // 9-Book Hadith Search State (Direct from Books without AI)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchBook, setSelectedSearchBook] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<SearchHadithResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState('');

  // AI State (General Search - Legacy fallback)
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Pakar AI Tool States
  const [activeTool, setActiveTool] = useState<'quote' | 'hadith' | 'asbab' | 'bedah'>('hadith');
  const [toolQuery, setToolQuery] = useState('');
  const [pakarQuerySnapshot, setPakarQuerySnapshot] = useState('');
  const [toolLoading, setToolLoading] = useState(false);
  const [toolResult, setToolResult] = useState<any>(null);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [pakarFontSizeDelta, setPakarFontSizeDelta] = useState<number>(0);
  const [isPakarCopied, setIsPakarCopied] = useState(false);
  const [isPakarReportOpen, setIsPakarReportOpen] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);

  // Local Search State (Inside Book)
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const isSharing = useRef(false);

  // Author Bio State
  const [authorBio, setAuthorBio] = useState<any>(null);
  const [loadingBio, setLoadingBio] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);

  // Author Mapper
  const getScholarName = (bookId: string) => {
    switch (bookId) {
      case 'abu-daud': return 'Imam Abu Daud';
      case 'bukhari': return 'Imam Bukhari';
      case 'muslim': return 'Imam Muslim';
      case 'tirmidzi': return 'Imam At-Tirmidzi';
      case 'nasai': return 'Imam An-Nasai';
      case 'ibnu-majah': return 'Imam Ibnu Majah';
      case 'ahmad': return 'Imam Ahmad bin Hanbal';
      case 'darimi': return 'Imam Ad-Darimi';
      case 'malik': return 'Imam Malik bin Anas';
      default: return null;
    }
  };

  // Fetch Bio when book changes
  useEffect(() => {
    if (activeBook) {
      const scholarName = getScholarName(activeBook.id);
      if (scholarName) {
        const fetchBio = async () => {
          setLoadingBio(true);
          try {
            const bio = await generateScholarBiography(scholarName, activeBook.name);
            setAuthorBio(bio);
          } catch (e) {
            console.error("Failed to fetch bio:", e);
            setAuthorBio(null);
          } finally {
            setLoadingBio(false);
          }
        };
        fetchBio();
      } else {
        setAuthorBio(null);
      }
    }
  }, [activeBook]);

  // Handle Navigation State from Settings
  useEffect(() => {
    if (location.state) {
      const state = location.state as any;
      if (state.tab === 'bookmark') {
        setViewMode('bookmarks');
      } else if (state.autoSearch) {
        setSearchQuery(state.autoSearch);
        setViewMode('books');
        // We need a small delay to ensure everything is initialized
        setTimeout(() => {
           handleAiSearchFromQuery(state.autoSearch);
        }, 500);
      }
    }
  }, [location]);

  const handleAiSearchFromQuery = async (query: string) => {
    if (!query.trim()) return;
    setIsAiLoading(true);
    setAiResponse('');
    try {
      const result = await askReligiousQuery('hadis', query);
      setAiResponse(result);
    } catch (e) {
      setAiResponse("Maaf, terjadi kesalahan koneksi.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Initial Load (Books)
  const fetchBooks = async () => {
    setLoadingBooks(true);
    setErrorBooks(false);
    try {
      const data = await getHadithBooks();
      if (data && data.length > 0) {
        setBooks(data);
      } else {
        throw new Error("No data");
      }
    } catch (e) {
      setErrorBooks(true);
    } finally {
      setLoadingBooks(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // --- BOOKMARKS SYNC ---
  useEffect(() => {
    if (user) {
        const unsubscribe = subscribeUserBookmarks(user.uid, 'hadis', (data) => {
            setBookmarks(data as BookmarkHadith[]);
        });
        return () => unsubscribe();
    } else {
        const saved = localStorage.getItem('santriai_hadis_bookmarks');
        if (saved) {
            setBookmarks(JSON.parse(saved));
        }
    }
  }, [user]);

  // Sync to LocalStorage for Guest Only
  useEffect(() => {
    if (!user) {
        localStorage.setItem('santriai_hadis_bookmarks', JSON.stringify(bookmarks));
    }
  }, [bookmarks, user]);

  // Fetch Hadiths when Book or Page changes
  useEffect(() => {
    if (activeBook) {
      const fetchRange = async () => {
        setLoadingHadiths(true);
        setErrorHadiths(false);
        const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
        const end = currentPage * ITEMS_PER_PAGE;
        const safeEnd = end > activeBook.available ? activeBook.available : end;
        
        try {
          if (start <= activeBook.available) {
            const data = await getHadithRange(activeBook.id, start, safeEnd);
            setHadiths(data);
          } else {
            setHadiths([]);
          }
        } catch (e) {
          setErrorHadiths(true);
        } finally {
          setLoadingHadiths(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
      fetchRange();
    }
  }, [activeBook, currentPage]);

  const handleBookSelect = (book: HadithBook) => {
    setActiveBook(book);
    setCurrentPage(1);
    setSearchQuery(''); 
    setAiResponse('');
    setLocalSearchQuery(''); 
  };

  const handleBack = () => {
    setActiveBook(null);
    setHadiths([]);
    setLocalSearchQuery('');
  };

  const handleNextPage = () => {
    if (activeBook && currentPage * ITEMS_PER_PAGE < activeBook.available) {
      setCurrentPage(p => p + 1);
      setLocalSearchQuery(''); 
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(p => p - 1);
      setLocalSearchQuery(''); 
    }
  };

  // Bookmark Logic
  const isBookmarked = (bookId: string, hadithNumber: number) => {
    return bookmarks.some(b => b.bookId === bookId && b.number === hadithNumber);
  };

  const toggleBookmark = async (hadith: HadithDetail, book: { id: string; name: string }) => {
    const docId = `hadis-${book.id}-${hadith.number}`;
    
    if (isBookmarked(book.id, hadith.number)) {
      if (user) {
          await removeUserBookmark(user.uid, docId);
      } else {
          setBookmarks(prev => prev.filter(b => !(b.bookId === book.id && b.number === hadith.number)));
      }
      showToast("Dihapus dari penanda", "info");
    } else {
      const newBookmark: BookmarkHadith = {
        ...hadith,
        bookName: book.name,
        bookId: book.id,
        savedAt: new Date().toISOString()
      };
      
      if (user) {
          await saveUserBookmark(user.uid, 'hadis', docId, newBookmark);
      } else {
          setBookmarks(prev => [newBookmark, ...prev]);
      }
      showToast("Disimpan ke penanda", "success");
    }
  };

  const deleteBookmark = async (bookId: string, hadithNumber: number) => {
    const docId = `hadis-${bookId}-${hadithNumber}`;
    if (user) {
        await removeUserBookmark(user.uid, docId);
    } else {
        setBookmarks(prev => prev.filter(b => !(b.bookId === bookId && b.number === hadithNumber)));
    }
    showToast("Penanda dihapus", "info");
  };

  // Copy & Share
  const handleCopy = (hadith: HadithDetail, bookName?: string) => {
    const name = bookName || activeBook?.name || "Hadis";
    const text = `${hadith.arab}\n\n${hadith.id}\n(${name} No. ${hadith.number})\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
    navigator.clipboard.writeText(text);
    const uniqueId = `${name}-${hadith.number}`;
    setCopiedId(uniqueId);
    setTimeout(() => setCopiedId(null), 2000);
    showToast("Teks hadis disalin", "success");
  };

  const handleShare = async (hadith: HadithDetail, bookName?: string) => {
    if (isSharing.current) return;
    isSharing.current = true;

    const name = bookName || activeBook?.name || "Hadis";
    const text = `${hadith.arab}\n\n${hadith.id}\n(${name} No. ${hadith.number})\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
    const title = `${name} No. ${hadith.number}`;
    
    if (window.AndroidNativeInterface?.shareText) {
      try {
        window.AndroidNativeInterface.shareText(title, text);
      } catch (e) {
        handleCopy(hadith, bookName);
      } finally {
        isSharing.current = false;
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text
        });
      } catch (e: any) {
        if (e.name !== 'AbortError') {
           handleCopy(hadith, bookName);
        }
      } finally {
        isSharing.current = false;
      }
    } else {
      handleCopy(hadith, bookName);
      isSharing.current = false;
    }
  };

  // 9-Book Hadith Direct Search (Without AI)
  const handleSearchHadith = async (bookIdToSearch?: string) => {
    const q = searchQuery.trim();
    if (!q) {
      showToast("Tulis kata kunci atau nomor hadis terlebih dahulu", "info");
      return;
    }

    const bookId = bookIdToSearch !== undefined ? bookIdToSearch : selectedSearchBook;
    setIsSearching(true);
    setHasSearched(true);
    setSearchedQuery(q);

    try {
      const results = await searchHadiths(q, bookId, 50);
      setSearchResults(results);
      if (results.length === 0) {
        showToast("Tidak ditemukan hadis yang cocok", "info");
      }

      // Record to history
      const selectedBookObj = books.find(b => b.id === bookId);
      const bookLabel = bookId === 'all' ? 'Semua Kitab (9 Kitab)' : (selectedBookObj?.name || bookId);
      addHadithHistory({
        type: 'search',
        title: `Pencarian "${q}"`,
        subtitle: `Di ${bookLabel} • ${results.length} hadis ditemukan`,
        searchKeyword: q,
        searchBookId: bookId,
        searchBookName: bookLabel,
        totalResults: results.length
      });
    } catch (error) {
      console.error("Search error:", error);
      showToast("Gagal mencari hadis, periksa koneksi", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setSearchedQuery('');
  };

  const handleOpenInBook = (result: SearchHadithResult) => {
    const targetBook = books.find(b => b.id === result.bookId) || {
      id: result.bookId,
      name: result.bookName,
      available: 5000
    };
    const targetPage = Math.max(1, Math.ceil(result.number / ITEMS_PER_PAGE));
    setActiveBook(targetBook);
    setCurrentPage(targetPage);
    setLocalSearchQuery(result.number.toString());

    // Record to history
    addHadithHistory({
      type: 'read',
      title: `${result.bookName} No. ${result.number}`,
      subtitle: result.id ? (result.id.length > 90 ? result.id.substring(0, 90) + '...' : result.id) : undefined,
      bookId: result.bookId,
      bookName: result.bookName,
      hadithNumber: result.number,
      arabSnippet: result.arab ? result.arab.substring(0, 120) : undefined,
      translationSnippet: result.id ? result.id.substring(0, 140) : undefined
    });
  };

  // AI Search (Global)
  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    if (!user) {
      showToast("Pustaka Hadis AI memerlukan login.", "info");
      navigate('/settings');
      return;
    }
    setIsAiLoading(true);
    setAiResponse('');
    try {
      const result = await askReligiousQuery('hadis', searchQuery);
      setAiResponse(result);
    } catch (e) {
      setAiResponse("Maaf, terjadi kesalahan koneksi.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Step timer for loading animation
  useEffect(() => {
    let interval: any;
    if (toolLoading) {
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % 4);
      }, 2500);
    } else {
      setLoadingStepIndex(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [toolLoading]);

  const handlePakarProcess = async () => {
    if (!toolQuery.trim()) {
      showToast("Tuliskan sesuatu terlebih dahulu", "info");
      return;
    }

    if (!user) {
      showToast("Alat Pakar AI memerlukan login.", "info");
      navigate('/settings');
      return;
    }

    const currentWasilah = Math.max(0, Number(userData?.wasilah ?? userData?.wasilahPoints ?? 0));
    if (userData?.isVIP !== true && currentWasilah < 2) {
      setShowInsufficientModal(true);
      return;
    }

    const queryToProcess = toolQuery.trim();
    setPakarQuerySnapshot(queryToProcess);
    setToolLoading(true);
    setToolResult(null);
    setLoadingStepIndex(0);

    try {
      let data;
      if (activeTool === 'quote') {
        data = await validateIslamicQuote(queryToProcess);
      } else if (activeTool === 'hadith') {
        data = await analyzeHadith(queryToProcess);
      } else if (activeTool === 'asbab') {
        data = await generateKitabAnalysis(queryToProcess, 'Kitab Hadis', queryToProcess, 'asbab');
      } else {
        data = await generateKitabAnalysis(queryToProcess, 'Umum', queryToProcess, 'hadits');
      }

      // Deduct 2 wasilah
      try {
        await deductWasilahForAI(user.uid, 2, `Pakar Hadis (${activeTool}) - ${queryToProcess.substring(0, 30)}`);
      } catch (deductErr) {
        console.warn("Deduct Wasilah error:", deductErr);
      }

      setToolResult(data);
      showToast("Analisis Pakar Hadis selesai! (Dipotong 2 Wasilah)", "success");

      // Record to history
      const toolLabel = activeTool === 'quote' ? 'Cek Kesahihan Kutipan' :
                        activeTool === 'asbab' ? 'Asbabun Wurud Hadis' :
                        activeTool === 'bedah' ? 'Bedah Hadis & Syarah' : 'Cari Hadis & Status';
      addHadithHistory({
        type: 'pakar',
        title: toolLabel,
        subtitle: queryToProcess,
        pakarTool: activeTool,
        pakarQuery: queryToProcess,
        pakarResult: data
      });
    } catch (e) {
      showToast("Gagal memproses permintaan AI", "error");
    } finally {
      setToolLoading(false);
    }
  };

  const getPakarShareText = () => {
    if (!toolResult) return '';
    const toolTitle = activeTool === 'quote' ? 'Cek Kesahihan Kutipan & Hadis' :
                      activeTool === 'asbab' ? 'Asbabun Wurud Hadis' :
                      activeTool === 'bedah' ? 'Bedah Hadis & Syarah' : 'Cari Hadis & Status Kesahihan';
    
    let text = `📜 *Hasil Analisis Pakar AI Santri - ${toolTitle}*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🔍 *Pertanyaan/Topik:* "${pakarQuerySnapshot || toolQuery}"\n\n`;

    if (activeTool === 'quote') {
      text += `🏷️ *Status:* ${toolResult.status || 'Analisis Kutipan'}\n`;
      if (toolResult.source) text += `📚 *Sumber/Rujukan:* ${toolResult.source}\n`;
      text += `\n💡 *Penjelasan Ilmiah:*\n${toolResult.explanation || ''}\n`;
    } else if (activeTool === 'hadith') {
      if (toolResult.arabic) text += `📖 *Matan Arab:*\n${toolResult.arabic}\n\n`;
      if (toolResult.translation) text += `📝 *Terjemahan:*\n"${toolResult.translation}"\n\n`;
      if (toolResult.source) text += `📚 *Perawi/Sumber:* ${toolResult.source}\n`;
      if (toolResult.status) text += `🏷️ *Derajat Hadis:* ${toolResult.status}\n\n`;
      if (toolResult.explanation) text += `💡 *Penjelasan:*\n${toolResult.explanation}\n`;
    } else {
      const matan = toolResult.matan || toolResult.arabic || toolResult.originalText;
      const trans = toolResult.modernTranslation || toolResult.translation;
      const syarah = activeTool === 'asbab' ? (toolResult.asbabulWurud || toolResult.syarah) : (toolResult.syarah || toolResult.explanation);
      const ref = toolResult.referensi || toolResult.source;

      if (matan) text += `📖 *Matan Arab:*\n${matan}\n\n`;
      if (trans) text += `📝 *Terjemahan:*\n"${trans}"\n\n`;
      if (ref) text += `📚 *Rujukan:* ${Array.isArray(ref) ? ref.join(', ') : ref}\n\n`;
      if (syarah) text += `💡 *${activeTool === 'asbab' ? 'Asbabun Wurud' : 'Syarah & Penjelasan'}:*\n${syarah}\n`;
    }

    text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `_Dianalisis melalui Aplikasi Santri AI_`;
    return text;
  };

  const handleCopyPakarResult = () => {
    const text = getPakarShareText();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setIsPakarCopied(true);
    showToast("Hasil analisis pakar berhasil disalin!", "success");
    setTimeout(() => setIsPakarCopied(false), 2000);
  };

  const handleSharePakarResult = async () => {
    const text = getPakarShareText();
    if (!text) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hasil Analisis Pakar Hadis - Santri AI',
          text: text,
        });
      } catch (err) {
        // User cancelled or unsupported
      }
    } else {
      navigator.clipboard.writeText(text);
      showToast("Teks hasil analisis berhasil disalin untuk dibagikan!", "success");
    }
  };

  const getPakarArabicFontClass = () => {
    if (pakarFontSizeDelta === -1) return 'text-lg leading-loose';
    if (pakarFontSizeDelta === 1) return 'text-2xl sm:text-3xl leading-[2.4]';
    if (pakarFontSizeDelta === 2) return 'text-3xl sm:text-4xl leading-[2.7]';
    return 'text-xl sm:text-2xl leading-loose';
  };

  const getPakarBodyFontClass = () => {
    if (pakarFontSizeDelta === -1) return 'text-xs leading-relaxed';
    if (pakarFontSizeDelta === 1) return 'text-base leading-relaxed';
    if (pakarFontSizeDelta === 2) return 'text-lg leading-relaxed';
    return 'text-sm leading-relaxed';
  };

  // Helper to format relative time for history
  const formatRelativeTime = (timestamp: number) => {
    if (!timestamp) return 'Baru saja';
    const diff = Math.max(0, Date.now() - timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} mnt lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    if (days < 7) return `${days} hari lalu`;
    return new Date(timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  // Add Hadith History
  const addHadithHistory = (item: Omit<HadithHistoryItem, 'id' | 'timestamp'> & { id?: string; timestamp?: number }) => {
    const newItem: HadithHistoryItem = {
      ...item,
      id: item.id || `hadis-hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: item.timestamp || Date.now()
    };

    setHadithHistory(prev => {
      const filtered = prev.filter(h => {
        if (h.type !== newItem.type) return true;
        if (h.type === 'pakar') {
          return !(h.pakarTool === newItem.pakarTool && h.pakarQuery?.trim().toLowerCase() === newItem.pakarQuery?.trim().toLowerCase());
        }
        if (h.type === 'read') {
          return !(h.bookId === newItem.bookId && h.hadithNumber === newItem.hadithNumber);
        }
        if (h.type === 'search') {
          return !(h.searchKeyword?.trim().toLowerCase() === newItem.searchKeyword?.trim().toLowerCase() && h.searchBookId === newItem.searchBookId);
        }
        return true;
      });
      const updated = [newItem, ...filtered].slice(0, 60);
      try {
        localStorage.setItem('santriai_hadis_history', JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save hadith history:", e);
      }
      return updated;
    });

    // Also sync to global activity history
    try {
      addToHistory({
        id: newItem.id,
        type: 'hadis',
        title: newItem.title,
        subtitle: newItem.subtitle || newItem.translationSnippet || newItem.pakarQuery,
        timestamp: new Date(newItem.timestamp).toISOString(),
        path: '/hadis',
        data: newItem
      });
    } catch (err) {}
  };

  const deleteHadithHistoryItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setHadithHistory(prev => {
      const updated = prev.filter(h => h.id !== id);
      try {
        localStorage.setItem('santriai_hadis_history', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
    showToast("Item riwayat dihapus", "info");
  };

  const clearAllHadithHistory = () => {
    setHadithHistory([]);
    try {
      localStorage.removeItem('santriai_hadis_history');
    } catch (err) {}
    setShowClearHistoryConfirm(false);
    showToast("Semua riwayat hadis telah dibersihkan", "success");
  };

  const handleOpenPakarHistory = (item: HadithHistoryItem) => {
    if (item.pakarTool) setActiveTool(item.pakarTool);
    if (item.pakarQuery) {
      setToolQuery(item.pakarQuery);
      setPakarQuerySnapshot(item.pakarQuery);
    }
    if (item.pakarResult) setToolResult(item.pakarResult);
    setViewMode('ai');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Membuka riwayat telaah "${item.subtitle || item.title}"`, 'info');
  };

  const handleOpenReadHistory = (item: HadithHistoryItem) => {
    if (!item.bookId) return;
    const defaultMeta: { [id: string]: { name: string; available: number } } = {
      'bukhari': { name: "Shahih Bukhari", available: 7008 },
      'muslim': { name: "Shahih Muslim", available: 5362 },
      'abu-daud': { name: "Sunan Abu Daud", available: 4590 },
      'tirmidzi': { name: "Sunan Tirmidzi", available: 3891 },
      'nasai': { name: "Sunan An-Nasa'i", available: 5614 },
      'ibnu-majah': { name: "Sunan Ibnu Majah", available: 4285 },
      'ahmad': { name: "Musnad Ahmad", available: 4305 },
      'malik': { name: "Muwatha' Malik", available: 1594 },
      'darimi': { name: "Sunan Ad-Darimi", available: 3367 }
    };
    const meta = defaultMeta[item.bookId] || { name: item.bookName || 'Kitab Hadis', available: 5000 };
    const targetBook = books.find(b => b.id === item.bookId) || {
      id: item.bookId,
      name: item.bookName || meta.name,
      available: meta.available
    };
    const num = item.hadithNumber || 1;
    const targetPage = Math.max(1, Math.ceil(num / ITEMS_PER_PAGE));
    setActiveBook(targetBook);
    setCurrentPage(targetPage);
    setLocalSearchQuery(num.toString());
    showToast(`Membuka ${targetBook.name} No. ${num}`, 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSearchHistory = (item: HadithHistoryItem) => {
    setSearchQuery(item.searchKeyword || '');
    if (item.searchBookId) setSelectedSearchBook(item.searchBookId);
    setViewMode('books');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      handleSearchHadith(item.searchBookId);
    }, 150);
  };

  // Helper to extract multiple reference items from string or array
  const extractReferenceBadges = (raw: string | string[]): string[] => {
    if (!raw) return [];
    const list: string[] = Array.isArray(raw) ? raw : [raw];
    const expanded: string[] = [];

    list.forEach(item => {
      if (typeof item === 'string') {
        const parts = item
          .split(/\s*(?:&|;|\bdan\b)\s*/i)
          .map(p => p.trim())
          .filter(p => p.length > 0);
        expanded.push(...(parts.length > 0 ? parts : [item.trim()]));
      }
    });

    return expanded.filter(Boolean);
  };

  // Helper to parse reference string into book ID and hadith number
  const parseHadithReference = (refText: string) => {
    if (!refText) return null;
    const lower = refText.toLowerCase();

    let bookId = '';
    let bookName = '';

    if (lower.includes('bukhari') || lower.includes('bukhori')) {
      bookId = 'bukhari';
      bookName = 'Shahih Bukhari';
    } else if (lower.includes('muslim')) {
      bookId = 'muslim';
      bookName = 'Shahih Muslim';
    } else if (lower.includes('abu daud') || lower.includes('abu dawud') || lower.includes('abudaud') || lower.includes('abu-daud')) {
      bookId = 'abu-daud';
      bookName = 'Sunan Abu Daud';
    } else if (lower.includes('tirmidzi') || lower.includes('turmudzi') || lower.includes('tirmidhi') || lower.includes('at-tirmidzi')) {
      bookId = 'tirmidzi';
      bookName = 'Sunan Tirmidzi';
    } else if (lower.includes('nasai') || lower.includes("nasa'i") || lower.includes('an-nasai') || lower.includes("an-nasa'i")) {
      bookId = 'nasai';
      bookName = "Sunan An-Nasa'i";
    } else if (lower.includes('ibnu majah') || lower.includes('ibnumajah') || lower.includes('ibn majah')) {
      bookId = 'ibnu-majah';
      bookName = 'Sunan Ibnu Majah';
    } else if (lower.includes('ahmad') || lower.includes('musnad')) {
      bookId = 'ahmad';
      bookName = 'Musnad Ahmad';
    } else if (lower.includes('malik') || lower.includes('muwatha') || lower.includes('muwatta') || lower.includes("muwatha'")) {
      bookId = 'malik';
      bookName = "Muwatha' Malik";
    } else if (lower.includes('darimi') || lower.includes('ad-darimi') || lower.includes('ad darimi')) {
      bookId = 'darimi';
      bookName = 'Sunan Ad-Darimi';
    }

    if (!bookId) return null;

    // Look for hadith number
    const numberMatch = refText.match(/(?:no\.?|nomor|#|ke-)?\s*(\d+)/i) || refText.match(/\b(\d+)\b/);
    const hadithNumber = numberMatch ? parseInt(numberMatch[1], 10) : null;

    return {
      bookId,
      bookName,
      hadithNumber
    };
  };

  const handleNavigateToReference = (refText: string) => {
    const parsed = parseHadithReference(refText);
    if (!parsed) {
      showToast(`Rujukan "${refText}" di luar 9 Kitab Utama.`, 'info');
      return;
    }

    const defaultBooksMeta: { [id: string]: { name: string; available: number } } = {
      'bukhari': { name: "Shahih Bukhari", available: 7008 },
      'muslim': { name: "Shahih Muslim", available: 5362 },
      'abu-daud': { name: "Sunan Abu Daud", available: 4590 },
      'tirmidzi': { name: "Sunan Tirmidzi", available: 3891 },
      'nasai': { name: "Sunan An-Nasa'i", available: 5614 },
      'ibnu-majah': { name: "Sunan Ibnu Majah", available: 4285 },
      'ahmad': { name: "Musnad Ahmad", available: 4305 },
      'malik': { name: "Muwatha' Malik", available: 1594 },
      'darimi': { name: "Sunan Ad-Darimi", available: 3367 }
    };

    const defaultMeta = defaultBooksMeta[parsed.bookId] || { name: parsed.bookName, available: 5000 };
    const targetBook = books.find(b => b.id === parsed.bookId) || {
      id: parsed.bookId,
      name: parsed.bookName || defaultMeta.name,
      available: defaultMeta.available
    };

    if (parsed.hadithNumber) {
      const targetPage = Math.max(1, Math.ceil(parsed.hadithNumber / ITEMS_PER_PAGE));
      setActiveBook(targetBook);
      setCurrentPage(targetPage);
      setLocalSearchQuery(parsed.hadithNumber.toString());
      showToast(`Membuka ${targetBook.name} No. ${parsed.hadithNumber}`, 'success');
    } else {
      setActiveBook(targetBook);
      setCurrentPage(1);
      setLocalSearchQuery('');
      showToast(`Membuka Kitab ${targetBook.name}`, 'success');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBedahHadis = (hadith: HadithDetail, bookName?: string) => {
    if (!user) {
      showToast("Filter Bedah Hadis memerlukan login.", "info");
      navigate('/settings');
      return;
    }
    const bName = bookName || activeBook?.name || "Kitab Hadis";
    navigate('/result', {
      state: {
        mode: 'kitab',
        query: `Hadis ${bName} No. ${hadith.number}`,
        source: bName,
        originalText: `${hadith.arab}\n\n${hadith.id}`
      }
    });
  };

  // Filter Logic for Local Search
  const filteredHadiths = hadiths.filter(hadith => {
    if (!localSearchQuery) return true;
    const q = localSearchQuery.toLowerCase();
    return (
      hadith.number.toString().includes(q) ||
      hadith.id.toLowerCase().includes(q) || 
      hadith.arab.includes(q) 
    );
  });

  if (!activeBook) {
    return (
      <div className="pb-24 min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 dark:from-slate-950 dark:via-emerald-950 dark:to-slate-900 pt-4 pb-4 px-4 rounded-b-2xl shadow-lg relative overflow-hidden mb-4 border-b border-emerald-600/30 dark:border-emerald-800/30">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l4 16 16 4-16 4-4 16-4-16-16-4 16-4z' fill='white'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }}></div>
          
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button 
                onClick={() => navigate('/')} 
                className="p-2 -ml-1 text-white/90 hover:text-white hover:bg-white/15 rounded-xl transition-all active:scale-95 flex-shrink-0"
                title="Kembali ke Beranda"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 shadow-inner flex-shrink-0">
                  <Scroll className="text-amber-300" size={18} />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-extrabold text-white tracking-tight leading-tight truncate">Pustaka Hadis</h1>
                  <p className="text-emerald-100/80 dark:text-emerald-300/70 text-[11px] font-medium leading-none mt-0.5 truncate">
                    9 Kitab Utama & Analisis Hadis
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/settings')} 
              className="relative active:scale-90 transition-all flex-shrink-0 p-0.5 hover:ring-2 hover:ring-amber-300/50 rounded-full"
              title="Profil & Pengaturan"
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

        <div className="px-4">
          <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1 mb-4 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <button
            onClick={() => setViewMode('books')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'books' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Daftar Kitab
          </button>
          <button
            onClick={() => setViewMode('ai')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'ai' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Pakar AI
          </button>
          <button
            onClick={() => setViewMode('bookmarks')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'bookmarks' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Penanda
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              viewMode === 'history' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <span>Riwayat</span>
            {hadithHistory.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                viewMode === 'history' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {hadithHistory.length}
              </span>
            )}
          </button>
        </div>

        {viewMode === 'books' ? (
          <div className="space-y-4">
            {/* Pencarian Hadis (9 Kitab Utama) - Non-AI Direct Search */}
            <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 p-3.5 sm:p-4 rounded-2xl shadow-md border border-emerald-500/30 text-white relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-[0.06] pointer-events-none" 
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l4 16 16 4-16 4-4 16-4-16-16-4 16-4z' fill='white'/%3E%3C/svg%3E")`,
                  backgroundSize: '60px 60px'
                }}
              />
              <div className="relative z-10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-100">
                    <Search size={15} className="text-amber-300" />
                    <span>Pencarian Hadis (9 Kitab Utama)</span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2 py-0.5 rounded-full">
                    9 Kitab Hadis
                  </span>
                </div>

                <div className="bg-white/15 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-inner flex items-center gap-1.5">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari hadis (kata: niat, sabar, shalat, atau no. hadis)..."
                    className="flex-1 bg-transparent px-3 py-1.5 outline-none text-white placeholder:text-emerald-100/70 text-xs sm:text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchHadith()}
                  />
                  {searchQuery && (
                    <button 
                      onClick={handleClearSearch}
                      className="p-1.5 text-white/70 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Hapus pencarian"
                    >
                      <X size={15} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleSearchHadith()}
                    disabled={isSearching || !searchQuery.trim()}
                    className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-3.5 py-1.5 rounded-lg disabled:opacity-40 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 text-xs cursor-pointer flex-shrink-0"
                  >
                    {isSearching ? (
                      <Loader2 size={15} className="animate-spin text-emerald-950" />
                    ) : (
                      <>
                        <Search size={15} className="text-emerald-950" />
                        <span className="hidden sm:inline">Cari</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Filter Pills for Books */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar pt-0.5">
                  <button
                    onClick={() => {
                      setSelectedSearchBook('all');
                      if (hasSearched && searchQuery.trim()) handleSearchHadith('all');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedSearchBook === 'all'
                        ? 'bg-amber-400 text-emerald-950 shadow-xs'
                        : 'bg-white/15 text-white/90 hover:bg-white/25'
                    }`}
                  >
                    Semua Kitab
                  </button>
                  {books.map(b => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedSearchBook(b.id);
                        if (hasSearched && searchQuery.trim()) handleSearchHadith(b.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedSearchBook === b.id
                          ? 'bg-amber-400 text-emerald-950 shadow-xs'
                          : 'bg-white/15 text-white/90 hover:bg-white/25'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Search Results */}
            {isSearching && (
              <div className="flex flex-col items-center justify-center py-8 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-slate-800 shadow-xs">
                <Loader2 size={28} className="animate-spin text-emerald-600 mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mencari di koleksi 9 Kitab Hadis...
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Mencocokkan teks matan Arab dan terjemahan
                </p>
              </div>
            )}

            {!isSearching && hasSearched && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-3 duration-300">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Search size={13} className="text-emerald-600" />
                      Hasil Pencarian
                    </h3>
                    <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {searchResults.length} Hadis
                    </span>
                  </div>
                  <button 
                    onClick={handleClearSearch} 
                    className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer bg-rose-50 dark:bg-rose-950/40 px-2 py-1 rounded-lg border border-rose-200 dark:border-rose-900/50"
                  >
                    <X size={12} /> Tutup Hasil
                  </button>
                </div>

                {searchResults.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <Info size={28} className="text-amber-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Tidak ditemukan hadis untuk kata kunci "{searchedQuery}"
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Coba gunakan kata kunci lain (misal: <em>niat</em>, <em>sabar</em>, <em>shalat</em>, <em>wudhu</em>, <em>sedekah</em>) atau masukkan nomor hadis langsung.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((result, idx) => {
                      const bookmarked = isBookmarked(result.bookId, result.number);
                      const isCopied = copiedId === `${result.bookName}-${result.number}`;

                      return (
                        <div 
                          key={`${result.bookId}-${result.number}-${idx}`}
                          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-emerald-400/50 transition-all space-y-3"
                        >
                          {/* Header Info */}
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800">
                                {result.bookName}
                              </span>
                              <span className="text-[11px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg">
                                No. {result.number}
                              </span>
                            </div>
                            <button
                              onClick={() => handleOpenInBook(result)}
                              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/80 cursor-pointer active:scale-95 transition-all"
                            >
                              <BookOpen size={13} /> Buka di Kitab
                            </button>
                          </div>

                          {/* Arab Text with Highlight */}
                          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                            <p 
                              dir="rtl" 
                              className="font-arabic text-xl sm:text-2xl text-right leading-loose text-slate-800 dark:text-slate-100"
                            >
                              <HighlightText 
                                text={result.arab} 
                                query={searchedQuery} 
                                highlightClassName="bg-amber-300 text-amber-950 dark:bg-amber-400/40 dark:text-amber-200 px-1 py-0.5 rounded-md font-bold"
                              />
                            </p>
                          </div>

                          {/* Indonesian Translation with Highlight */}
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              Terjemahan:
                            </p>
                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                              <HighlightText 
                                text={result.id} 
                                query={searchedQuery} 
                                highlightClassName="bg-amber-200 text-amber-950 dark:bg-amber-400/40 dark:text-amber-200 px-1 py-0.5 rounded font-bold shadow-xs"
                              />
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => handleCopy({ number: result.number, arab: result.arab, id: result.id }, result.bookName)}
                              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isCopied
                                  ? 'bg-emerald-500 text-white'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                              title="Salin Hadis"
                            >
                              {isCopied ? <Check size={14} /> : <Copy size={14} />}
                              <span className="text-[11px]">{isCopied ? 'Tersalin' : 'Salin'}</span>
                            </button>

                            <button
                              onClick={() => handleShare({ number: result.number, arab: result.arab, id: result.id }, result.bookName)}
                              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Bagikan Hadis"
                            >
                              <Share2 size={14} />
                              <span className="text-[11px]">Bagikan</span>
                            </button>

                            <button
                              onClick={() => toggleBookmark({ number: result.number, arab: result.arab, id: result.id }, { id: result.bookId, name: result.bookName })}
                              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                bookmarked 
                                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50' 
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                              title={bookmarked ? "Hapus Penanda" : "Simpan Penanda"}
                            >
                              <Bookmark size={14} className={bookmarked ? "fill-amber-500 text-amber-500" : ""} />
                              <span className="text-[11px]">{bookmarked ? 'Tersimpan' : 'Tandai'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Koleksi Kitab Section Header */}
            <div className="flex items-center justify-between pt-1 px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                  Koleksi Kitab
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                9 Kitab Utama
              </span>
            </div>

            {loadingBooks ? (
               <div className="grid grid-cols-1 gap-2.5">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className="h-18 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                 ))}
               </div>
            ) : errorBooks ? (
                <div className="flex flex-col items-center justify-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <WifiOff size={32} className="text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-slate-500 text-sm mb-4">Gagal memuat daftar kitab.</p>
                    <button 
                      onClick={fetchBooks}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                    >
                      <RefreshCw size={14} /> Coba Lagi
                    </button>
                </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {books.map((book, idx) => {
                  const color = BOOK_THEMES[idx % BOOK_THEMES.length];
                  
                  return (
                    <button
                      key={book.id}
                      onClick={() => handleBookSelect(book)}
                      className={`group relative overflow-hidden ${color.cardBg} p-3.5 rounded-2xl border ${color.border} shadow-xs hover:shadow-md transition-all text-left flex items-center justify-between active:scale-[0.99] cursor-pointer`}
                    >
                       <div className="flex items-center gap-3.5 z-10 relative">
                          <div className={`w-11 h-11 rounded-xl ${color.bg} ${color.text} flex items-center justify-center transition-transform group-hover:scale-110 duration-200 shadow-xs flex-shrink-0`}>
                             <Book size={20} />
                          </div>
                          <div>
                             <h4 className="font-extrabold text-white text-sm sm:text-base leading-tight drop-shadow-sm">
                               {book.name}
                             </h4>
                             <p className="text-[11px] text-white/90 font-medium mt-0.5">
                               Total: <strong className="text-white drop-shadow-sm">{book.available.toLocaleString('id-ID')}</strong> Hadis
                             </p>
                          </div>
                       </div>
                       <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition-all shadow-xs flex-shrink-0">
                          <ArrowRight size={15} />
                       </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : viewMode === 'ai' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
             {/* Tool Selectors */}
             <div className="bg-white dark:bg-slate-900 p-1.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <button
                  onClick={() => { setActiveTool('hadith'); setToolResult(null); setToolQuery(''); }}
                  className={`py-3 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTool === 'hadith' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <BookOpen size={15} />
                  <span>Cari Hadis</span>
                </button>
                <button
                  onClick={() => { setActiveTool('quote'); setToolResult(null); setToolQuery(''); }}
                  className={`py-3 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTool === 'quote' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Quote size={15} />
                  <span>Cek Kutipan</span>
                </button>
                <button
                  onClick={() => { setActiveTool('asbab'); setToolResult(null); setToolQuery(''); }}
                  className={`py-3 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTool === 'asbab' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <History size={15} />
                  <span>Asbab Wurud</span>
                </button>
                <button
                  onClick={() => { setActiveTool('bedah'); setToolResult(null); setToolQuery(''); }}
                  className={`py-3 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTool === 'bedah' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Brain size={15} />
                  <span>Bedah Hadis</span>
                </button>
             </div>

             {/* Query Input Box */}
             <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
               <div className="flex items-center justify-between">
                 <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                   {activeTool === 'quote' ? <Quote size={14} className="text-emerald-500" /> :
                    activeTool === 'asbab' ? <History size={14} className="text-emerald-500" /> :
                    <Brain size={14} className="text-emerald-500" />}
                   <span>
                     {activeTool === 'quote' ? 'Cek Kesahihan Kutipan / Hadis' :
                      activeTool === 'asbab' ? 'Telusuri Asbabun Wurud' :
                      activeTool === 'bedah' ? 'Bedah Matan & Syarah Hadis' : 'Cari Hadis & Status Kesahihan'}
                   </span>
                 </label>
                 <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                   <Gem size={11} className="text-amber-500" /> 2 Wasilah
                 </span>
               </div>

               <textarea
                 value={toolQuery}
                 onChange={(e) => setToolQuery(e.target.value)}
                 placeholder={
                   activeTool === 'quote' ? "Masukkan kutipan, hadis, atau ucapan yang ingin dicek status kesahihannya..." :
                   activeTool === 'asbab' ? "Tuliskan hadis atau peristiwa yang ingin dicari latar belakang Asbabul Wurud-nya..." :
                   activeTool === 'bedah' ? "Masukkan matan hadis atau tema hadis yang ingin dibedah secara mendalam..." :
                   "Tulis tema atau kata kunci hadits yang ingin dicari (misal: shalat berjamaah, menuntut ilmu, sedekah)..."
                 }
                 className="w-full h-32 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-sm border border-slate-200 dark:border-slate-700/60 focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none transition-all outline-none"
               />

               <div className="flex items-center gap-2">
                 <button
                   onClick={handlePakarProcess}
                   disabled={toolLoading}
                   className="flex-1 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                 >
                   {toolLoading ? (
                     <>
                       <Loader2 size={18} className="animate-spin" />
                       <span>MEMPROSES TELAAH...</span>
                     </>
                   ) : (
                     <>
                       <Brain size={18} />
                       <span>TANYA PAKAR AI</span>
                     </>
                   )}
                 </button>

                 {toolQuery.trim() && (
                   <button
                     onClick={() => setToolQuery('')}
                     className="p-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-2xl font-bold transition-all cursor-pointer"
                     title="Bersihkan teks"
                   >
                     <RotateCcw size={18} />
                   </button>
                 )}
               </div>
             </div>

             {/* Pakar AI Result Card */}
             <AnimatePresence mode="wait">
               {toolResult && (
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/50 shadow-md space-y-4"
                 >
                   {/* Header with Font Size Adjustment */}
                   <div className="flex items-center justify-between border-b border-emerald-50 dark:border-emerald-900/50 pb-3 gap-2 flex-wrap">
                     <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                       <CheckCircle2 size={18} />
                       <span>Hasil Analisis Pakar</span>
                     </div>

                     {/* Text Size Controls */}
                     <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
                       <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-1.5 hidden sm:inline">
                         Ukuran Teks:
                       </span>
                       <button
                         onClick={() => setPakarFontSizeDelta(prev => Math.max(-1, prev - 1))}
                         disabled={pakarFontSizeDelta <= -1}
                         className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-black shadow-2xs disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-0.5"
                         title="Perkecil Ukuran Teks"
                       >
                         <span>A</span>
                         <span className="text-[9px] -mt-1 font-bold">-</span>
                       </button>
                       <button
                         onClick={() => setPakarFontSizeDelta(0)}
                         className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                           pakarFontSizeDelta === 0 
                             ? 'bg-emerald-600 text-white shadow-2xs' 
                             : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                         }`}
                         title="Reset Ukuran Normal"
                       >
                         Normal
                       </button>
                       <button
                         onClick={() => setPakarFontSizeDelta(prev => Math.min(2, prev + 1))}
                         disabled={pakarFontSizeDelta >= 2}
                         className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-black shadow-2xs disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-0.5"
                         title="Perbesar Ukuran Teks"
                       >
                         <span>A</span>
                         <span className="text-[9px] -mt-1 font-bold">+</span>
                       </button>
                     </div>
                   </div>

                   {/* Content for Asbab & Bedah */}
                   {(activeTool === 'asbab' || activeTool === 'bedah') && (
                     <div className="space-y-4">
                       {(toolResult.matan || toolResult.arabic) && (
                         <div className={`text-right p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-arabic text-emerald-800 dark:text-emerald-200 border border-slate-100 dark:border-slate-800/60 ${getPakarArabicFontClass()}`} dir="rtl">
                           <HighlightText 
                             text={toolResult.matan || toolResult.arabic} 
                             query={pakarQuerySnapshot || toolQuery} 
                             highlightClassName="bg-amber-300 text-amber-950 dark:bg-amber-400/40 dark:text-amber-200 px-1 py-0.5 rounded-md font-bold"
                           />
                         </div>
                       )}
                       <div className="space-y-2">
                         <div className={`text-slate-700 dark:text-slate-200 font-medium ${getPakarBodyFontClass()}`}>
                           <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-0.5">Terjemahan:</span>
                           <span className="italic">
                             "
                             <HighlightText 
                               text={toolResult.modernTranslation || toolResult.translation || ''} 
                               query={pakarQuerySnapshot || toolQuery} 
                               highlightClassName="bg-amber-200 text-amber-950 dark:bg-amber-400/40 dark:text-amber-200 px-1 py-0.5 rounded font-bold"
                             />
                             "
                           </span>
                         </div>
                         <div className="flex flex-wrap gap-2 pt-1">
                            {(toolResult.referensi || toolResult.source) && extractReferenceBadges(toolResult.referensi || toolResult.source).map((refItem, idx) => {
                              const parsed = parseHadithReference(refItem);
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleNavigateToReference(refItem)}
                                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[11px] text-emerald-800 dark:text-emerald-200 font-bold rounded-xl border border-emerald-300/80 dark:border-emerald-700/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 group text-left"
                                  title="Klik untuk membuka hadis di 9 Kitab Utama"
                                >
                                  <BookOpen size={13} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                                  <span>📚 {refItem}</span>
                                  {parsed && (
                                    <span className="text-[10px] bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-0.5 ml-0.5 shadow-2xs">
                                      Buka ↗
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                         </div>
                       </div>
                       <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border-l-4 border-emerald-500 shadow-xs space-y-1.5">
                          <h4 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {activeTool === 'asbab' ? '📖 Asbabun Wurud (Latar Belakang Sabda)' : '💡 Syarah & Penjelasan Hadis'}
                          </h4>
                          <div className={`text-slate-700 dark:text-slate-300 whitespace-pre-line ${getPakarBodyFontClass()}`}>
                             <HighlightText 
                               text={activeTool === 'asbab' ? (toolResult.asbabulWurud || toolResult.syarah || '') : (toolResult.syarah || toolResult.explanation || '')} 
                               query={pakarQuerySnapshot || toolQuery} 
                               highlightClassName="bg-amber-200 text-amber-950 dark:bg-amber-400/40 dark:text-amber-200 px-1 py-0.5 rounded font-bold"
                             />
                          </div>
                       </div>
                     </div>
                   )}

                   {/* Content for Quote Check */}
                   {activeTool === 'quote' && (
                     <div className="space-y-4">
                       <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                         toolResult.status === 'Shahih' 
                           ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60' :
                         toolResult.status === 'Maqolah' 
                           ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60' :
                         'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                       }`}>
                         {toolResult.status === 'Shahih' ? <CheckCircle2 size={24} className="shrink-0 mt-0.5" /> : <AlertCircle size={24} className="shrink-0 mt-0.5" />}
                         <div className="flex-1 min-w-0">
                           <h4 className="text-sm font-black uppercase tracking-wider">{toolResult.status}</h4>
                           {toolResult.source && (
                             <div className="flex flex-wrap gap-1.5 mt-2">
                               {extractReferenceBadges(toolResult.source).map((refItem, idx) => {
                                 const parsed = parseHadithReference(refItem);
                                 return (
                                   <button
                                     key={idx}
                                     type="button"
                                     onClick={() => handleNavigateToReference(refItem)}
                                     className="px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-[11px] font-bold rounded-lg border border-current/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs text-left"
                                     title="Klik untuk membuka hadis di 9 Kitab Utama"
                                   >
                                     <BookOpen size={12} className="shrink-0" />
                                     <span>Rujukan: {refItem}</span>
                                     {parsed && (
                                       <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-extrabold ml-0.5">
                                         Buka ↗
                                       </span>
                                     )}
                                   </button>
                                 );
                               })}
                             </div>
                           )}
                         </div>
                       </div>

                       <div className="space-y-1.5">
                         <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Penjelasan Ilmiah:</h5>
                         <div className={`text-slate-700 dark:text-slate-300 leading-relaxed ${getPakarBodyFontClass()}`}>
                           <HighlightText 
                             text={toolResult.explanation || ''} 
                             query={pakarQuerySnapshot || toolQuery} 
                             highlightClassName="bg-amber-200 text-amber-950 dark:bg-amber-400/40 dark:text-amber-200 px-1 py-0.5 rounded font-bold"
                           />
                         </div>
                       </div>

                       {toolResult.isAuthorized && (
                         <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30 w-fit px-3 py-1 rounded-full">
                           <CheckCircle2 size={12} />
                           <span>TERVERIFIKASI ILMIAH</span>
                         </div>
                       )}
                     </div>
                   )}

                   {/* Content for Hadith Search */}
                   {activeTool === 'hadith' && (
                     <div className="space-y-4">
                       {toolResult.arabic && (
                         <div className={`text-right p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl font-arabic text-emerald-800 dark:text-emerald-200 border border-slate-100 dark:border-slate-800/60 ${getPakarArabicFontClass()}`} dir="rtl">
                           <HighlightText 
                             text={toolResult.arabic} 
                             query={pakarQuerySnapshot || toolQuery} 
                             highlightClassName="bg-amber-300 text-amber-950 dark:bg-amber-400/40 dark:text-amber-200 px-1 py-0.5 rounded-md font-bold"
                           />
                         </div>
                       )}
                       <div className="space-y-2">
                         <div className={`text-slate-700 dark:text-slate-200 font-medium ${getPakarBodyFontClass()}`}>
                           <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-0.5">Artinya:</span>
                           <span className="italic">
                             "
                             <HighlightText 
                               text={toolResult.translation || ''} 
                               query={pakarQuerySnapshot || toolQuery} 
                               highlightClassName="bg-amber-200 text-amber-950 dark:bg-amber-400/40 dark:text-amber-200 px-1 py-0.5 rounded font-bold"
                             />
                             "
                           </span>
                         </div>
                         <div className="flex flex-wrap items-center gap-2 pt-1">
                           {toolResult.source && (
                             <div className="flex flex-wrap gap-1.5">
                               {extractReferenceBadges(toolResult.source).map((refItem, idx) => {
                                 const parsed = parseHadithReference(refItem);
                                 return (
                                   <button
                                     key={idx}
                                     type="button"
                                     onClick={() => handleNavigateToReference(refItem)}
                                     className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-[11px] text-emerald-800 dark:text-emerald-200 font-bold rounded-xl border border-emerald-300/80 dark:border-emerald-700/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 group text-left"
                                     title="Klik untuk membuka hadis di 9 Kitab Utama"
                                   >
                                     <BookOpen size={13} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                                     <span>📚 {refItem}</span>
                                     {parsed && (
                                       <span className="text-[10px] bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-0.5 ml-0.5 shadow-2xs">
                                         Buka ↗
                                       </span>
                                     )}
                                   </button>
                                 );
                               })}
                             </div>
                           )}
                           {toolResult.status && (
                             <span className="px-2.5 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-[11px] text-blue-700 dark:text-blue-300 font-bold rounded-xl border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1">
                               🏷️ Status: {toolResult.status}
                             </span>
                           )}
                         </div>
                       </div>
                       <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border-l-4 border-emerald-500 shadow-xs space-y-1">
                         <h4 className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                           💡 Penjelasan & Faedah Hadis
                         </h4>
                         <div className={`text-slate-700 dark:text-slate-300 ${getPakarBodyFontClass()}`}>
                           <HighlightText 
                             text={toolResult.explanation || ''} 
                             query={pakarQuerySnapshot || toolQuery} 
                             highlightClassName="bg-amber-200 text-amber-950 dark:bg-amber-400/40 dark:text-amber-200 px-1 py-0.5 rounded font-bold"
                           />
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Bottom Action Buttons: Salin, Bagikan, Laporkan */}
                   <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-2 flex-wrap">
                     <div className="flex items-center gap-2">
                       <button
                         onClick={handleCopyPakarResult}
                         className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs ${
                           isPakarCopied 
                             ? 'bg-emerald-600 text-white' 
                             : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                         }`}
                         title="Salin Seluruh Hasil Analisis"
                       >
                         {isPakarCopied ? <Check size={14} /> : <Copy size={14} />}
                         <span>{isPakarCopied ? 'Tersalin!' : 'Salin'}</span>
                       </button>

                       <button
                         onClick={handleSharePakarResult}
                         className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
                         title="Bagikan Hasil Analisis"
                       >
                         <Share2 size={14} />
                         <span>Bagikan</span>
                       </button>
                     </div>

                     <button
                       onClick={() => setIsPakarReportOpen(true)}
                       className="px-3 py-2 text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                       title="Laporkan Kendala atau Koreksi"
                     >
                       <Flag size={13} />
                       <span>Laporkan</span>
                     </button>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>

             <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl text-[10px] text-slate-500 flex gap-3 items-start border border-slate-200 dark:border-slate-800">
               <AlertCircle size={14} className="shrink-0 text-amber-500" />
               <p>
                 Hasil analisis dihasilkan oleh Kecerdasan Buatan (AI) berdasarkan database hadis tepercaya. Harap tetap berkonsultasi dengan Guru atau Kiai secara langsung untuk bimbingan spiritual yang lebih mendalam.
               </p>
             </div>
          </div>
        ) : viewMode === 'bookmarks' ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            {bookmarks.length === 0 ? (
              <div className="text-center py-20 text-slate-400 dark:text-slate-600">
                 <Bookmark size={48} className="mx-auto mb-4 opacity-30" />
                 <p>Belum ada hadis yang disimpan.</p>
                 {!user && <p className="text-xs mt-2 text-santri-green">Masuk akun untuk sinkronisasi.</p>}
              </div>
            ) : (
              bookmarks.map((hadith, idx) => (
                <div key={`${hadith.bookId}-${hadith.number}-${idx}`} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 transition-colors">
                   <div className="flex justify-between items-center mb-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-medium">{hadith.bookName}</span>
                        <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold rounded w-fit mt-1">
                          No. {hadith.number}
                        </span>
                      </div>
                      <div className="flex gap-2">
                         <button 
                            onClick={() => handleCopy(hadith, hadith.bookName)}
                            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                         >
                           {copiedId === `${hadith.bookName}-${hadith.number}` ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                         </button>
                         <button 
                            onClick={() => handleShare(hadith, hadith.bookName)}
                            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                         >
                           <Share2 size={16} />
                         </button>
                         <button 
                            onClick={() => handleBedahHadis(hadith, hadith.bookName)}
                            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-amber-500 hover:bg-amber-50"
                         >
                           <Brain size={16} />
                         </button>
                         <button 
                            onClick={() => deleteBookmark(hadith.bookId, hadith.number)}
                            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-red-400 hover:text-red-600 hover:bg-red-50"
                         >
                           <Trash2 size={16} />
                         </button>
                      </div>
                   </div>

                   <p className="text-right font-arabic text-xl leading-[2.2] text-slate-800 dark:text-slate-100 mb-4 line-clamp-3" dir="rtl">
                     {hadith.arab}
                   </p>

                   <div className="border-t border-slate-50 dark:border-slate-800 pt-3">
                     <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed text-justify line-clamp-3">
                       {hadith.id}
                     </p>
                   </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* RIWAYAT TAB VIEW */
          <div className="space-y-4 animate-in fade-in duration-300 pb-8">
            {/* Riwayat Filter Tabs & Clear Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/50">
                    <History size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Riwayat Aktivitas Hadis</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Tersimpan otomatis saat Anda menelaah & membaca</p>
                  </div>
                </div>

                {hadithHistory.length > 0 && (
                  <button
                    onClick={() => setShowClearHistoryConfirm(true)}
                    className="px-2.5 py-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200/60 dark:border-rose-900/50 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Trash2 size={13} />
                    <span>Hapus Semua</span>
                  </button>
                )}
              </div>

              {/* Sub Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
                {[
                  { id: 'all', label: 'Semua', count: hadithHistory.length },
                  { id: 'pakar', label: 'Pakar AI', count: hadithHistory.filter(h => h.type === 'pakar').length },
                  { id: 'read', label: 'Dibaca', count: hadithHistory.filter(h => h.type === 'read').length },
                  { id: 'search', label: 'Pencarian', count: hadithHistory.filter(h => h.type === 'search').length }
                ].map(filterTab => (
                  <button
                    key={filterTab.id}
                    onClick={() => setHistoryFilter(filterTab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                      historyFilter === filterTab.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{filterTab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      historyFilter === filterTab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {filterTab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Clear All Confirmation Modal */}
            <AnimatePresence>
              {showClearHistoryConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                      <Trash2 size={24} />
                    </div>
                    <div className="text-center space-y-1">
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">Hapus Semua Riwayat?</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Seluruh rekaman telaah Pakar AI, pembacaan kitab, dan pencarian hadis akan dibersihkan dari memori perangkat.
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowClearHistoryConfirm(false)}
                        className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer active:scale-95"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={clearAllHadithHistory}
                        className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer active:scale-95 shadow-md shadow-rose-600/20"
                      >
                        Ya, Hapus Semua
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* History Items List */}
            {hadithHistory.filter(h => historyFilter === 'all' || h.type === historyFilter).length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <History size={28} className="opacity-40" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum Ada Riwayat {historyFilter !== 'all' ? (historyFilter === 'pakar' ? 'Pakar AI' : historyFilter === 'read' ? 'Bacaan' : 'Pencarian') : ''}</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    {historyFilter === 'pakar' 
                      ? 'Lakukan telaah hadis, cek kesahihan kutipan, atau asbabun wurud di tab Pakar AI.' 
                      : historyFilter === 'read'
                      ? 'Mulai membaca hadis dari salah satu dari 9 Kitab untuk mencatat riwayat bacaan.'
                      : 'Lakukan pencarian hadis atau telaah untuk merekam aktivitas Anda.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {hadithHistory
                  .filter(h => historyFilter === 'all' || h.type === historyFilter)
                  .map((item) => {
                    const isPakar = item.type === 'pakar';
                    const isRead = item.type === 'read';
                    const isSearch = item.type === 'search';

                    const handleCardClick = () => {
                      if (isPakar) handleOpenPakarHistory(item);
                      else if (isRead) handleOpenReadHistory(item);
                      else if (isSearch) handleOpenSearchHistory(item);
                    };

                    return (
                      <div
                        key={item.id}
                        onClick={handleCardClick}
                        className={`group relative rounded-2xl p-4 border transition-all cursor-pointer select-none active:scale-[0.99] shadow-xs ${
                          isPakar
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/25 border-emerald-200/70 dark:border-emerald-800/50 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md hover:shadow-emerald-500/5'
                            : isRead
                            ? 'bg-sky-50/50 dark:bg-sky-950/25 border-sky-200/70 dark:border-sky-800/50 hover:border-sky-400 dark:hover:border-sky-600 hover:shadow-md hover:shadow-sky-500/5'
                            : 'bg-indigo-50/50 dark:bg-indigo-950/25 border-indigo-200/70 dark:border-indigo-800/50 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md hover:shadow-indigo-500/5'
                        }`}
                      >
                        {/* Top Bar: Icon, Badges, Time, and Red Delete Button */}
                        <div className="flex items-center justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Visual Type Badge */}
                            {isPakar && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300/60 dark:border-emerald-700/50">
                                <Brain size={12} className="text-emerald-600 dark:text-emerald-400" />
                                <span>Pakar AI</span>
                                <span className="text-emerald-400 dark:text-emerald-600">•</span>
                                <span className="font-medium text-[10px]">{item.title}</span>
                              </span>
                            )}
                            {isRead && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-100/80 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border border-sky-300/60 dark:border-sky-700/50">
                                <BookOpen size={12} className="text-sky-600 dark:text-sky-400" />
                                <span>Baca Hadis</span>
                                <span className="text-sky-400 dark:text-sky-600">•</span>
                                <span className="font-medium text-[10px]">{item.bookName || 'Kitab'} No. {item.hadithNumber}</span>
                              </span>
                            )}
                            {isSearch && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-100/80 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border border-indigo-300/60 dark:border-indigo-700/50">
                                <Search size={12} className="text-indigo-600 dark:text-indigo-400" />
                                <span>Pencarian</span>
                              </span>
                            )}
                          </div>

                          {/* Time and Delete Action */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                              <Clock size={11} />
                              {formatRelativeTime(item.timestamp)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => deleteHadithHistoryItem(item.id, e)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white border border-rose-200 dark:border-rose-900/60 transition-all cursor-pointer active:scale-90"
                              title="Hapus riwayat ini"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="space-y-1.5">
                          {isPakar && (
                            <>
                              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                                "{item.pakarQuery || item.subtitle}"
                              </p>
                              {item.pakarResult && (
                                <div className="flex items-center gap-2 pt-1 flex-wrap">
                                  {item.pakarResult.status && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold border ${
                                      item.pakarResult.status === 'Shahih'
                                        ? 'bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                        : 'bg-amber-100/80 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                    }`}>
                                      Status: {item.pakarResult.status}
                                    </span>
                                  )}
                                  {item.pakarResult.source && (
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium truncate max-w-xs">
                                      <span>📚</span> {item.pakarResult.source}
                                    </span>
                                  )}
                                </div>
                              )}
                            </>
                          )}

                          {isRead && (
                            <>
                              {item.arabSnippet && (
                                <p dir="rtl" className="font-arabic text-sm sm:text-base text-right leading-relaxed text-slate-800 dark:text-slate-100 line-clamp-1 py-0.5">
                                  {item.arabSnippet}...
                                </p>
                              )}
                              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic leading-relaxed">
                                "{item.translationSnippet || item.subtitle}..."
                              </p>
                            </>
                          )}

                          {isSearch && (
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                                  Kata Kunci: <span className="text-indigo-600 dark:text-indigo-400">"{item.searchKeyword}"</span>
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Bottom Action Hint */}
                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-200/50 dark:border-slate-800/60">
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                            {isPakar ? 'Klik kartu untuk melihat hasil telaah' : isRead ? 'Klik kartu untuk membuka kitab' : 'Klik kartu untuk mencari ulang'}
                          </span>
                          <span className={`text-[11px] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform ${
                            isPakar
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : isRead
                              ? 'text-sky-700 dark:text-sky-300'
                              : 'text-indigo-700 dark:text-indigo-300'
                          }`}>
                            <span>{isPakar ? 'Buka Telaah' : isRead ? 'Buka Hadis' : 'Cari Ulang'}</span>
                            <ChevronRight size={13} />
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
  }

  const activeBookIndex = activeBook ? books.findIndex(b => b.id === activeBook.id) : 0;
  const activeTheme = BOOK_THEMES[activeBookIndex >= 0 ? activeBookIndex % BOOK_THEMES.length : 0];

  return (
    <div className="pb-24 pt-0 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* 1. Compact Top Navigation Bar */}
      <header className={`relative z-20 ${activeTheme.header} text-white backdrop-blur-md border-b border-white/20 px-3.5 py-2.5 flex items-center justify-between shadow-md transition-colors`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            onClick={handleBack} 
            className="p-2 -ml-1 text-white hover:bg-white/20 rounded-xl transition-all active:scale-95 cursor-pointer flex-shrink-0"
            title="Kembali ke Daftar Kitab"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate leading-tight drop-shadow-sm">
              {activeBook.name}
            </h1>
            <p className="text-[11px] text-white/90 font-semibold leading-none mt-0.5">
              Hal. {currentPage} • {activeBook.available.toLocaleString('id-ID')} Hadis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={openRatingApp}
            className="p-1.5 px-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            title="Beri Rating Aplikasi"
          >
            <Star size={13} className="fill-amber-300 text-amber-300" />
            <span className="hidden xs:inline text-[11px]">Rating</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="p-1.5 px-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            title="Laporkan Kendala"
          >
            <Flag size={13} className="text-rose-300" />
            <span className="hidden xs:inline text-[11px]">Lapor</span>
          </button>

          <button 
            onClick={() => navigate('/settings')} 
            className="relative active:scale-90 transition-all flex-shrink-0 ml-0.5 hover:ring-2 hover:ring-white/50 rounded-full shadow-sm"
            title="Profil Pengguna"
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
      </header>

      {/* 2. Scrollable Content Area */}
      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Book Profile Hero Card (In-flow scrollable, beautifully designed) */}
        <div className={`${activeTheme.hero} text-white rounded-2xl p-4 sm:p-5 shadow-md border border-white/10 relative overflow-hidden`}>
          {/* Watermark Islamic pattern */}
          <div 
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l4 16 16 4-16 4-4 16-4-16-16-4 16-4z' fill='white'/%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}
          />

          <div className="relative z-10 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner flex-shrink-0">
                  <BookOpen size={22} className="text-amber-300" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight leading-tight">
                    {activeBook.name}
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    {authorBio?.century || getScholarName(activeBook.id)}
                  </p>
                </div>
              </div>
            </div>

            {/* Scholar timeline info */}
            {authorBio && (
              <div className="flex flex-col gap-3 pt-2 border-t border-white/15">
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-white/90 font-medium">
                  {authorBio.birthYear && (
                    <span className="px-2 py-0.5 bg-white/10 rounded-md">
                      Lahir: {authorBio.birthYear}
                    </span>
                  )}
                  {authorBio.deathYear && (
                    <span className="px-2 py-0.5 bg-white/10 rounded-md">
                      Wafat: {authorBio.deathYear}
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={() => setShowBioModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-md border border-white/25 flex items-center justify-center gap-2 transition-all active:scale-95 text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Info size={14} className="text-amber-300" />
                  <span>Biografi selengkapnya</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation & Search Toolbar */}
        <div className={`sticky top-3 z-30 ${activeTheme.toolbar} rounded-2xl p-2.5 shadow-md border ${activeTheme.toolbarBorder} flex flex-col gap-2.5`}>
          {/* Pagination Controls */}
          <div className="flex items-center justify-between gap-2 px-1 sm:px-0">
            <span className="text-xs text-white/90 font-medium">
              Total: <strong className="text-white drop-shadow-sm">{activeBook.available.toLocaleString('id-ID')}</strong>
            </span>
            <div className="flex items-center gap-1 bg-white/15 backdrop-blur-sm p-1 rounded-xl border border-white/20">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center disabled:opacity-30 text-white hover:bg-white/30 active:scale-95 transition-all shadow-sm cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="px-2 font-mono font-bold text-xs text-white drop-shadow-sm">
                Hal. {currentPage}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage * ITEMS_PER_PAGE >= activeBook.available}
                className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center disabled:opacity-30 text-white hover:bg-white/30 active:scale-95 transition-all shadow-sm cursor-pointer"
                title="Halaman Selanjutnya"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Search box */}
          <div className="flex items-center px-3 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 shadow-inner">
            <Search size={16} className="text-white mr-2 flex-shrink-0" />
            <input 
              type="text" 
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              placeholder="Cari nomor atau kata hadis..."
              className="w-full bg-transparent py-2 outline-none text-white placeholder:text-white/80 text-xs sm:text-sm font-medium"
            />
            {localSearchQuery && (
              <button onClick={() => setLocalSearchQuery('')} className="ml-1 text-white hover:text-white/80 p-1 cursor-pointer">
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Hadith List */}
        <div className="space-y-4 pt-1">

        {loadingHadiths ? (
          <div className="py-20">
            <CustomLoader message="Membuka Pustaka Hadis..." />
          </div>
        ) : errorHadiths ? (
            <div className="flex flex-col items-center justify-center py-10">
                <WifiOff size={32} className="text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-slate-500 text-sm mb-4">Gagal memuat hadis.</p>
                <button 
                  onClick={() => {
                     setActiveBook({...activeBook}); 
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-200"
                >
                  <RefreshCw size={14} /> Coba Lagi
                </button>
            </div>
        ) : filteredHadiths.length === 0 && localSearchQuery ? (
             <div className="py-10 text-center text-slate-500 dark:text-slate-400">
                <p>Tidak ditemukan hadis yang cocok di halaman ini.</p>
             </div>
        ) : (
          filteredHadiths.map((hadith) => (
            <div key={hadith.number} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 transition-colors">
               <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-lg">
                    No. <HighlightText text={String(hadith.number)} query={localSearchQuery} highlightClassName="bg-amber-300 text-amber-950 px-1 rounded font-black shadow-xs" />
                  </span>
                  <div className="flex gap-2">
                     <button 
                       onClick={() => toggleBookmark(hadith, activeBook)}
                       className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${
                         isBookmarked(activeBook.id, hadith.number)
                         ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                         : 'bg-blue-50 dark:bg-blue-900/10 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-blue-100 dark:border-blue-800/50'
                       }`}
                     >
                       <Bookmark size={15} fill={isBookmarked(activeBook.id, hadith.number) ? "currentColor" : "none"} />
                     </button>
                     <button 
                        onClick={() => handleCopy(hadith)}
                        className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center transition-all"
                     >
                       {copiedId === `${activeBook.name}-${hadith.number}` ? <Check size={15} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={15} />}
                     </button>
                     <button 
                        onClick={() => handleShare(hadith)}
                        className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center transition-all"
                     >
                       <Share2 size={15} />
                     </button>
                     <button 
                        onClick={() => handleBedahHadis(hadith)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-santri-green dark:text-santri-gold text-xs font-bold hover:bg-green-50 dark:hover:bg-green-900/40 border border-santri-green/30 dark:border-santri-gold/30 shadow-sm"
                     >
                       <Brain size={14} /> Bedah
                     </button>
                  </div>
               </div>

               <p className="text-right font-arabic text-2xl leading-[2.2] text-slate-800 dark:text-slate-100 mb-6" dir="rtl">
                 <HighlightText 
                   text={hadith.arab} 
                   query={localSearchQuery} 
                   highlightClassName="bg-amber-200/90 text-emerald-950 dark:bg-amber-400/40 dark:text-amber-100 px-1 py-0.5 rounded font-bold shadow-xs" 
                 />
               </p>

               <div className="border-t border-slate-50 dark:border-slate-800 pt-4">
                 <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed text-justify">
                   <HighlightText 
                     text={hadith.id} 
                     query={localSearchQuery} 
                     highlightClassName="bg-amber-200 text-amber-950 dark:bg-amber-400/35 dark:text-amber-200 px-1 py-0.5 rounded font-semibold shadow-xs" 
                   />
                 </p>
               </div>
            </div>
          ))
        )}
        
        {!loadingHadiths && !errorHadiths && filteredHadiths.length > 0 && !localSearchQuery && (
          <div className="flex justify-center py-4">
            <button 
              onClick={handleNextPage}
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              Halaman Selanjutnya
            </button>
          </div>
        )}
        </div>
      </main>

      {/* Biography Modal */}
      <AnimatePresence>
        {showBioModal && authorBio && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBioModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="bg-emerald-600 p-6 text-white relative">
                 <button 
                  onClick={() => setShowBioModal(false)}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                 >
                   <X size={20} />
                 </button>
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
                       <User size={32} className="text-white" />
                    </div>
                    <div>
                       <h3 className="font-serif text-xl font-bold leading-tight">{authorBio.fullName}</h3>
                       <p className="text-white/70 text-xs mt-1 italic">{authorBio.titles}</p>
                    </div>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  <div className="grid grid-cols-3 gap-3">
                     <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-center">
                        <p className="text-[8px] font-bold text-emerald-600/60 uppercase">Lahir</p>
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-100">{authorBio.birthYear}</p>
                     </div>
                     <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-center">
                        <p className="text-[8px] font-bold text-emerald-600/60 uppercase">Wafat</p>
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-100">{authorBio.deathYear}</p>
                     </div>
                     <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800 text-center">
                        <p className="text-[8px] font-bold text-emerald-600/60 uppercase">Abad</p>
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-100">{authorBio.century}</p>
                     </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Brain size={12} className="text-santri-gold" /> Tentang Beliau
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">"{authorBio.intro || 'Memuat deskripsi...'}"</p>
                  </div>

                  {authorBio.narrativeSections?.map((section: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                         <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                         {section.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify whitespace-pre-line">{section.content}</p>
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-4">
                      {authorBio.teachers?.length > 0 && (
                        <div className="space-y-2">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guru Utama</h4>
                           <div className="flex flex-col gap-1">
                              {authorBio.teachers.map((t: string, i: number) => (
                                <span key={i} className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 py-1 border-b border-slate-50 dark:border-slate-800">• {t}</span>
                              ))}
                           </div>
                        </div>
                      )}
                      {authorBio.works?.length > 0 && (
                        <div className="space-y-2">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Karya Monumental</h4>
                           <div className="flex flex-col gap-1">
                              {authorBio.works.map((w: string, i: number) => (
                                <span key={i} className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 py-1 border-b border-emerald-50 dark:border-emerald-900/10">• {w}</span>
                              ))}
                           </div>
                        </div>
                      )}
                  </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-center">
                  <button 
                    onClick={() => setShowBioModal(false)}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    Tutup Biografi
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* POPUP INDIKATOR LOADING PAKAR AI (2 WASILAH) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {toolLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-emerald-200/80 dark:border-emerald-800/60 text-center space-y-5 relative overflow-hidden"
            >
              {/* Top Accent Gradient */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

              {/* Wasilah Cost Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 rounded-full text-xs font-extrabold text-amber-700 dark:text-amber-300">
                <Gem size={13} className="text-amber-500 animate-pulse" />
                <span>Biaya: 2 Wasilah</span>
              </div>

              {/* Central Glowing Icon */}
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-500/30 rounded-full animate-ping opacity-60" />
                <div className="absolute inset-1 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-full opacity-20 blur-md" />
                <div className="relative z-10 w-20 h-20 bg-gradient-to-tr from-emerald-700 via-teal-600 to-emerald-600 rounded-2xl shadow-xl flex items-center justify-center text-white border border-emerald-400/40">
                  {activeTool === 'quote' ? (
                    <Quote size={36} className="animate-pulse text-amber-300" />
                  ) : activeTool === 'asbab' ? (
                    <History size={36} className="animate-pulse text-amber-300" />
                  ) : (
                    <Brain size={36} className="animate-pulse text-amber-300" />
                  )}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {PAKAR_LOADING_CONFIG[activeTool]?.title || "Menganalisis Hadis"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                  {PAKAR_LOADING_CONFIG[activeTool]?.subtitle || "Sedang menelaah database hadis muktamad..."}
                </p>
              </div>

              {/* Animated Progress Steps */}
              <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-left space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-500 animate-spin" />
                    Proses Telaah AI Hadis
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Langkah {loadingStepIndex + 1} dari 4
                  </span>
                </div>

                <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40 shadow-2xs">
                  <Loader2 size={16} className="animate-spin text-emerald-600 shrink-0" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {PAKAR_LOADING_CONFIG[activeTool]?.steps[loadingStepIndex % 4]}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    initial={{ width: "25%" }}
                    animate={{ width: `${((loadingStepIndex + 1) / 4) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                Mohon tunggu sejenak, telaah hadis mendalam sedang berlangsung...
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Insufficient Wasilah Modal */}
      <InsufficientWasilahModal
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        requiredWasilah={2}
        featureName="Pakar AI Hadis"
      />

      {/* General Hadith Report Modal */}
      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName="Pustaka Hadis"
        contentSnippet="Laporan Kendala Pustaka Hadis & AI"
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      {/* Pakar AI Report Modal */}
      <ContentReportModal
        isOpen={isPakarReportOpen}
        onClose={() => setIsPakarReportOpen(false)}
        featureName={`Pakar AI Hadis (${activeTool})`}
        contentSnippet={`Topik: ${pakarQuerySnapshot || toolQuery}\n\nHasil: ${getPakarShareText().substring(0, 200)}...`}
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};

export default HadisScreen;