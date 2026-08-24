import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Search, ArrowRightLeft, BookOpen, Copy, Check, Star, 
  Sparkles, History, Bookmark, X, AlertCircle, RefreshCw, Layers, 
  HelpCircle, ChevronRight, Share2, Info, ExternalLink
} from 'lucide-react';
import { 
  searchMunawwirDictionary, 
  MunawwirWordDetail, 
  MunawwirSearchResult, 
  getMunawwirBookmarks, 
  toggleMunawwirBookmark, 
  isMunawwirBookmarked, 
  saveMunawwirHistory, 
  getMunawwirHistory, 
  clearMunawwirHistory,
  OFFLINE_MUNAWWIR_DATA,
  isArabicText
} from '../services/munawwirService';
import { HighlightText } from '../components/HighlightText';
import { useToast } from '../contexts/ToastContext';

// Quick Popular Categories / Words for Santri
const QUICK_SUGGESTIONS = [
  { ar: 'عِلْمٌ', id: 'Ilmu', root: 'ع - ل - م', category: 'Pondok' },
  { ar: 'كِتَابٌ', id: 'Buku / Kitab', root: 'ك - ت - ب', category: 'Pondok' },
  { ar: 'صَلَاةٌ', id: 'Sholat / Doa', root: 'ص - ل - و', category: 'Ibadah' },
  { ar: 'قَلْبٌ', id: 'Hati / Kalbu', root: 'ق - ل - ب', category: 'Akhlaq' },
  { ar: 'طَالِبٌ', id: 'Santri / Murid', root: 'ط - ل - ب', category: 'Pesantren' },
  { ar: 'شَيْخٌ', id: 'Guru / Kyai', root: 'ش - ي - خ', category: 'Pesantren' },
  { ar: 'نِيَّةٌ', id: 'Niat / Tekad', root: 'ن - ي - و', category: 'Fiqih' },
  { ar: 'بَرَكَةٌ', id: 'Berkah', root: 'ب - ر - ك', category: 'Hikmah' },
];

const ARABIC_SHORTCUT_CHARS = ['ء', 'آ', 'أ', 'إ', 'ئ', 'ؤ', 'ة', 'ى', 'ـ', 'ّ'];

export const MunawwirScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'ar-id' | 'id-ar'>('ar-id');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<MunawwirSearchResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Tabs: 'search' | 'bookmarks' | 'history'
  const [activeTab, setActiveTab] = useState<'search' | 'bookmarks' | 'history'>('search');
  const [bookmarks, setBookmarks] = useState<MunawwirWordDetail[]>([]);
  const [historyList, setHistoryList] = useState<Array<{ query: string; mode: 'ar-id' | 'id-ar'; timestamp: number }>>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBookmarks(getMunawwirBookmarks());
    setHistoryList(getMunawwirHistory());

    // Check if initial state passed via navigation
    if (location.state?.query) {
      const initialQ = location.state.query;
      const initialMode = isArabicText(initialQ) ? 'ar-id' : 'id-ar';
      setQuery(initialQ);
      setMode(initialMode);
      handleSearch(initialQ, initialMode);
    }
  }, [location.state]);

  const handleSearch = async (targetQuery?: string, targetMode?: 'ar-id' | 'id-ar') => {
    const q = (targetQuery !== undefined ? targetQuery : query).trim();
    if (!q) {
      showToast('Masukkan kata yang ingin dicari', 'info');
      return;
    }

    const currentMode = targetMode || mode;
    setLoading(true);
    setActiveTab('search');

    try {
      const res = await searchMunawwirDictionary(q, currentMode);
      setSearchResult(res);
      saveMunawwirHistory(q, currentMode);
      setHistoryList(getMunawwirHistory());

      if (!res.found || res.entries.length === 0) {
        showToast('Kata tidak ditemukan atau sedang dianalisis ulang', 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses pencarian kamus', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    const nextMode = mode === 'ar-id' ? 'id-ar' : 'ar-id';
    setMode(nextMode);
    if (query.trim()) {
      handleSearch(query, nextMode);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Teks berhasil disalin', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleBookmarkToggle = (word: MunawwirWordDetail) => {
    const saved = toggleMunawwirBookmark(word);
    setBookmarks(getMunawwirBookmarks());
    showToast(saved ? 'Kata disimpan ke daftar hafalan' : 'Kata dihapus dari hafalan', 'success');
  };

  const insertArabicChar = (char: string) => {
    setQuery(prev => prev + char);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#004d00] dark:bg-slate-900 border-b border-emerald-800/40 dark:border-slate-800 shadow-md backdrop-blur-md px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all cursor-pointer"
              title="Kembali"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-base font-black text-white tracking-wide flex items-center gap-1.5">
                <BookOpen size={18} className="text-amber-300" />
                Kamus Al-Munawwir
              </h1>
              <p className="text-[10px] text-emerald-100/80 font-medium">
                Rujukan Lengkap KH. A. Warson Munawwir
              </p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`p-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                activeTab === 'bookmarks'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Kosakata Tersimpan"
            >
              <Bookmark size={16} />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {bookmarks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Riwayat Pencarian"
            >
              <History size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-5">
        
        {/* Search Bar & Language Mode Switch */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              Mode Terjemahan
            </span>
            <button
              type="button"
              onClick={handleToggleMode}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-black shadow-xs hover:bg-emerald-100 active:scale-95 transition-all cursor-pointer"
            >
              <span>{mode === 'ar-id' ? 'العربية (Arab)' : 'Indonesia'}</span>
              <ArrowRightLeft size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>{mode === 'ar-id' ? 'Indonesia' : 'العربية (Arab)'}</span>
            </button>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  mode === 'ar-id'
                    ? 'Ketik kata Arab (misal: عِلْمٌ, كَتَبَ, قَلْبٌ)...'
                    : 'Ketik kata Indonesia (misal: Belajar, Menulis, Hati)...'
                }
                dir={mode === 'ar-id' ? 'rtl' : 'ltr'}
                className={`w-full px-4 py-3.5 pl-11 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  mode === 'ar-id' ? 'font-serif text-lg' : ''
                }`}
              />
              <Search 
                size={18} 
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" 
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Cari</span>
                  <Search size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Arabic Character Insertion helper (if mode ar-id) */}
          {mode === 'ar-id' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none pt-1">
              <span className="text-[10px] text-slate-400 font-bold shrink-0">Bantuan Huruf:</span>
              {ARABIC_SHORTCUT_CHARS.map((ch, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => insertArabicChar(ch)}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-serif text-sm font-bold flex items-center justify-center shrink-0 active:scale-90 transition-all"
                >
                  {ch}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* View Content depending on active tab */}

        {/* 1. BOOKMARKS TAB */}
        {activeTab === 'bookmarks' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Bookmark size={16} className="text-amber-500" />
                Kosakata Tersimpan ({bookmarks.length})
              </h3>
              {bookmarks.length > 0 && (
                <button
                  onClick={() => {
                    localStorage.removeItem('santri_munawwir_bookmarks');
                    setBookmarks([]);
                    showToast('Semua hafalan dibersihkan', 'info');
                  }}
                  className="text-[10px] font-bold text-rose-500 hover:underline"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            {bookmarks.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-6 space-y-2">
                <Bookmark size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
                <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400">Belum ada kosakata tersimpan</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Tandai kata dengan ikon bintang pada hasil pencarian untuk menyimpannya ke daftar hafalan Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bookmarks.map((b, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setQuery(b.arabic);
                      setMode('ar-id');
                      setSearchResult({
                        query: b.arabic,
                        mode: 'ar-id',
                        found: true,
                        entries: [b],
                        totalResults: 1,
                        source: 'offline'
                      });
                      setActiveTab('search');
                    }}
                    className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 transition-all cursor-pointer flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold font-serif text-emerald-600 dark:text-emerald-400">
                          {b.arabic}
                        </span>
                        <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold text-slate-500">
                          {b.wordTypeIndo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {b.meanings.join('; ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmarkToggle(b);
                      }}
                      className="p-1.5 text-amber-500 hover:text-rose-500 transition-colors"
                      title="Hapus dari tersimpan"
                    >
                      <Star size={18} className="fill-amber-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 2. HISTORY TAB */}
        {activeTab === 'history' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <History size={16} className="text-emerald-500" />
                Riwayat Pencarian Terakhir
              </h3>
              {historyList.length > 0 && (
                <button
                  onClick={() => {
                    clearMunawwirHistory();
                    setHistoryList([]);
                    showToast('Riwayat pencarian dibersihkan', 'info');
                  }}
                  className="text-[10px] font-bold text-rose-500 hover:underline"
                >
                  Hapus Riwayat
                </button>
              )}
            </div>

            {historyList.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-6 space-y-2">
                <History size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
                <h4 className="text-sm font-bold text-slate-600 dark:text-slate-400">Belum ada riwayat pencarian</h4>
              </div>
            ) : (
              <div className="space-y-2">
                {historyList.map((h, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setQuery(h.query);
                      setMode(h.mode);
                      handleSearch(h.query, h.mode);
                    }}
                    className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <Search size={15} className="text-slate-400" />
                      <div>
                        <p className={`text-sm font-bold text-slate-800 dark:text-slate-200 ${h.mode === 'ar-id' ? 'font-serif' : ''}`}>
                          {h.query}
                        </p>
                        <span className="text-[9px] text-slate-400">
                          {h.mode === 'ar-id' ? 'Arab ➔ Indonesia' : 'Indonesia ➔ Arab'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3. SEARCH TAB / RESULTS */}
        {activeTab === 'search' && (
          <div className="space-y-5">
            
            {/* If searching in progress */}
            {loading && (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                  <BookOpen size={24} className="animate-bounce" />
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                  Mencari di Lema Kamus Al-Munawwir...
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Menganalisis akar kata (jadzr), wazan shorof, makna kontekstual, dan contoh praktis santri.
                </p>
              </div>
            )}

            {/* Display Found Entry Result */}
            {!loading && searchResult && searchResult.found && searchResult.entries.length > 0 && (
              <div className="space-y-4">
                {searchResult.entries.map((entry, idx) => {
                  const isSaved = isMunawwirBookmarked(entry.arabic);
                  const pageNumber = entry.page || (entry.notes ? entry.notes.match(/hlm\.\s*(\d+)/i)?.[1] : null);
                  const archiveUrl = entry.referenceUrl || (pageNumber ? `https://archive.org/details/kamus-al-munawwir-arab-indonesia/page/n${pageNumber}/mode/2up` : 'https://archive.org/details/kamus-al-munawwir-arab-indonesia');

                  return (
                    <article
                      key={idx}
                      className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm border border-emerald-500/30 dark:border-emerald-500/20 space-y-5 text-left"
                    >
                      {/* Top Bar: Arabic Word & Action Buttons */}
                      <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <h2 
                              className="text-3xl sm:text-4xl font-bold font-serif text-emerald-600 dark:text-emerald-400 tracking-wide"
                              dir="rtl"
                            >
                              <HighlightText text={entry.arabicHarokat || entry.arabic} query={query} />
                            </h2>
                            <span className="text-xs text-slate-400 font-medium italic">
                              (<HighlightText text={entry.latin} query={query} />)
                            </span>
                          </div>
                          
                          {/* Tags: Root, Wazan, Class, Jamak, and Clickable Page Reference */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {entry.root && (
                              <button
                                type="button"
                                onClick={() => {
                                  const cleanRoot = entry.root.replace(/\s*-\s*/g, '');
                                  setQuery(cleanRoot);
                                  setMode('ar-id');
                                  handleSearch(cleanRoot, 'ar-id');
                                }}
                                className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full hover:bg-amber-100 transition-colors cursor-pointer"
                                title="Klik untuk mencari akar kata ini"
                              >
                                Akar: {entry.root}
                              </button>
                            )}
                            {entry.wazan && (
                              <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-full">
                                Wazan: {entry.wazan}
                              </span>
                            )}
                            {entry.wordTypeIndo && (
                              <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                                {entry.wordTypeIndo}
                              </span>
                            )}
                            {entry.plural && (
                              <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 rounded-full">
                                Jamak: {entry.plural}
                              </span>
                            )}

                            {/* Clickable Page Reference Badge */}
                            {pageNumber && (
                              <a
                                href={archiveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-0.5 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-colors cursor-pointer"
                                title="Buka dan baca halaman rujukan fisik Kamus Al-Munawwir di Internet Archive"
                              >
                                <span>Hlm. {pageNumber}</span>
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Bookmark & Copy Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleBookmarkToggle(entry)}
                            className={`p-2.5 rounded-2xl border active:scale-95 transition-all cursor-pointer ${
                              isSaved
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-500 border-amber-300 dark:border-amber-700'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-amber-500 border-slate-200 dark:border-slate-700'
                            }`}
                            title={isSaved ? "Hapus dari Simpanan" : "Simpan ke Daftar Hafalan"}
                          >
                            <Star size={18} className={isSaved ? 'fill-amber-500 text-amber-500' : ''} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(`${entry.arabic} (${entry.latin}): ${entry.meanings.join(', ')}`, 'main')}
                            className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all cursor-pointer"
                            title="Salin Definisi"
                          >
                            {copiedKey === 'main' ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Brief Tashrif Table (If available for fi'il) */}
                      {entry.tashrifBrief && (
                        <div className="bg-slate-50 dark:bg-slate-850/70 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                          <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                            Ringkasan Tashrif Istilahi
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                            {entry.tashrifBrief.madhi && (
                              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                                <span className="text-[9px] text-slate-400 block font-bold">Māḍī</span>
                                <span className="font-serif text-sm font-bold text-emerald-600 dark:text-emerald-400" dir="rtl">
                                  {entry.tashrifBrief.madhi}
                                </span>
                              </div>
                            )}
                            {entry.tashrifBrief.mudhari && (
                              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                                <span className="text-[9px] text-slate-400 block font-bold">Muḍāri'</span>
                                <span className="font-serif text-sm font-bold text-emerald-600 dark:text-emerald-400" dir="rtl">
                                  {entry.tashrifBrief.mudhari}
                                </span>
                              </div>
                            )}
                            {entry.tashrifBrief.mashdar && (
                              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                                <span className="text-[9px] text-slate-400 block font-bold">Maṣdar</span>
                                <span className="font-serif text-sm font-bold text-emerald-600 dark:text-emerald-400" dir="rtl">
                                  {entry.tashrifBrief.mashdar}
                                </span>
                              </div>
                            )}
                            {entry.tashrifBrief.fail && (
                              <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                                <span className="text-[9px] text-slate-400 block font-bold">Isim Fā'il</span>
                                <span className="font-serif text-sm font-bold text-emerald-600 dark:text-emerald-400" dir="rtl">
                                  {entry.tashrifBrief.fail}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Definisi Arti / Terjemahan Lengkap */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen size={14} className="text-emerald-500" />
                          Arti & Makna (Kamus Al-Munawwir)
                        </h4>
                        <ul className="space-y-1.5 pl-1">
                          {entry.meanings.map((meaning, mIdx) => (
                            <li key={mIdx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {mIdx + 1}
                              </span>
                              <span>
                                <HighlightText text={meaning} query={query} />
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Contextual Prepositions (Harf Jar Nuances) if any */}
                      {entry.contextualMeanings && entry.contextualMeanings.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Makna Kontekstual & Huruf Jar
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {entry.contextualMeanings.map((ctx, cIdx) => (
                              <div key={cIdx} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                                    {ctx.preposition || 'Frasa'}
                                  </span>
                                  <span className="font-serif text-sm font-bold text-slate-800 dark:text-slate-200" dir="rtl">
                                    {ctx.arabicPhrase}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                  <HighlightText text={ctx.meaning} query={query} />
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Examples (Amtsilah) */}
                      {entry.examples && entry.examples.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Contoh Penggunaan & Ayat / Syi'ir
                          </h4>
                          <div className="space-y-2">
                            {entry.examples.map((ex, eIdx) => (
                              <div key={eIdx} className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
                                <p className="text-base font-bold font-serif text-emerald-800 dark:text-emerald-300 text-right leading-loose" dir="rtl">
                                  <HighlightText text={ex.arabic} query={query} />
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-300 italic font-medium">
                                  "<HighlightText text={ex.translation} query={query} />"
                                </p>
                                {ex.context && (
                                  <span className="text-[9px] text-slate-400 font-semibold block">
                                    Sumber: {ex.context}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Derived Words (Musytaqqat) */}
                      {entry.derivedWords && entry.derivedWords.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Layers size={14} className="text-indigo-500" />
                            Kata-Kata Turunan (Musytaqqāt)
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            {entry.derivedWords.map((d, dIdx) => (
                              <div 
                                key={dIdx}
                                onClick={() => {
                                  setQuery(d.arabic);
                                  setMode('ar-id');
                                  handleSearch(d.arabic, 'ar-id');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer transition-all flex items-center gap-1.5 group"
                              >
                                <span className="font-serif font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                                  {d.arabic}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  ({d.meaning})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes / Lughah Insight / Clickable Reference */}
                      <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <Info size={16} className="shrink-0 mt-0.5 text-amber-600" />
                          <div className="leading-relaxed font-medium space-y-1">
                            <p>
                              {entry.notes || `Rujukan resmi lema menurut kaidah leksikografi Kamus Al-Munawwir Arab-Indonesia.`}
                            </p>
                            {pageNumber && (
                              <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 font-bold">
                                Halaman Rujukan: Hlm. {pageNumber} (Kamus Al-Munawwir Krapyak)
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Open Archive / Reference Link */}
                        <a
                          href={archiveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 text-[10px] font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                          title="Buka rujukan kitab asli di arsip digital"
                        >
                          <span>Buka Kitab</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Quick Suggestions / Popular Pesantren Vocabulary */}
            {(!searchResult || !searchResult.found) && !loading && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    Kosakata Populer Pesantren
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {QUICK_SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(item.ar);
                        setMode('ar-id');
                        handleSearch(item.ar, 'ar-id');
                      }}
                      className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs hover:shadow-md transition-all text-left space-y-1 group active:scale-95 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-serif font-bold text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform" dir="rtl">
                          {item.ar}
                        </span>
                        <span className="text-[8px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                        {item.id}
                      </p>
                      <span className="text-[9px] text-slate-400 block">
                        Akar: {item.root}
                      </span>
                    </button>
                  ))}
                </div>

                {/* About Kamus Munawwir Box */}
                <div className="p-4 bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 text-white rounded-3xl border border-emerald-700/40 shadow-lg space-y-2 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-amber-300">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Tentang Kamus Al-Munawwir</h4>
                      <p className="text-[10px] text-emerald-200/80">Karya Monumental KH. Ahmad Warson Munawwir (Krapyak)</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Kamus Al-Munawwir adalah kamus bahasa Arab-Indonesia terbesar dan paling otoritatif di kalangan pesantren dan akademisi Nusantara. Fitur digital ini menghadirkan pencarian lema berakar kata (*Jadzr*), kaidah nahwu-shorof, dan contoh penggunaan fusha secara instan.
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
};

export default MunawwirScreen;
