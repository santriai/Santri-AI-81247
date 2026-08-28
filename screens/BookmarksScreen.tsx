import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Bookmark, 
  Search, 
  Trash2, 
  BookOpen, 
  ExternalLink, 
  Sparkles, 
  Scroll, 
  Heart, 
  Newspaper, 
  MessageSquare, 
  Star, 
  Copy, 
  Check, 
  X,
  ChevronRight,
  Clock,
  Layers,
  BookMarked
} from 'lucide-react';
import { 
  getBedahKitabBookmarks, 
  removeBedahKitabBookmark, 
  BedahKitabBookmark,
  getBookmarkedFeatures,
  toggleBookmarkFeature,
  subscribeToBookmarkChanges,
  FeatureItem
} from '../services/bookmarkService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { removeUserBookmark } from '../services/firebase';

type BookmarkCategory = 'all' | 'kitab' | 'quran' | 'hadis' | 'doa' | 'munawwir' | 'news' | 'community' | 'features';

interface BookmarkUnifiedItem {
  id: string;
  type: 'kitab' | 'quran' | 'hadis' | 'doa' | 'munawwir' | 'news' | 'community' | 'features';
  title: string;
  subtitle?: string;
  arabic?: string;
  translation?: string;
  categoryLabel: string;
  color: string;
  icon: any;
  date?: string | number;
  raw: any;
}

export const BookmarksScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [activeCategory, setActiveCategory] = useState<BookmarkCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteModalItem, setDeleteModalItem] = useState<BookmarkUnifiedItem | null>(null);

  // States for each category
  const [kitabBookmarks, setKitabBookmarks] = useState<BedahKitabBookmark[]>([]);
  const [quranBookmarks, setQuranBookmarks] = useState<any[]>([]);
  const [hadisBookmarks, setHadisBookmarks] = useState<any[]>([]);
  const [doaBookmarks, setDoaBookmarks] = useState<any[]>([]);
  const [munawwirBookmarks, setMunawwirBookmarks] = useState<any[]>([]);
  const [newsBookmarks, setNewsBookmarks] = useState<any[]>([]);
  const [postBookmarks, setPostBookmarks] = useState<any[]>([]);
  const [featureBookmarks, setFeatureBookmarks] = useState<FeatureItem[]>([]);

  const loadAllBookmarks = () => {
    // 1. Bedah Kitab
    setKitabBookmarks(getBedahKitabBookmarks());

    // 2. Quran
    try {
      const q = localStorage.getItem('santriai_quran_bookmarks');
      setQuranBookmarks(q ? JSON.parse(q) : []);
    } catch {
      setQuranBookmarks([]);
    }

    // 3. Hadis
    try {
      const h = localStorage.getItem('santriai_hadis_bookmarks');
      setHadisBookmarks(h ? JSON.parse(h) : []);
    } catch {
      setHadisBookmarks([]);
    }

    // 4. Doa
    try {
      const d = localStorage.getItem('santriai_doa_bookmarks');
      setDoaBookmarks(d ? JSON.parse(d) : []);
    } catch {
      setDoaBookmarks([]);
    }

    // 5. Munawwir
    try {
      const m = localStorage.getItem('santri_munawwir_bookmarks');
      setMunawwirBookmarks(m ? JSON.parse(m) : []);
    } catch {
      setMunawwirBookmarks([]);
    }

    // 6. News
    try {
      const n = localStorage.getItem('santri_news_bookmarks');
      setNewsBookmarks(n ? JSON.parse(n) : []);
    } catch {
      setNewsBookmarks([]);
    }

    // 7. Community Posts
    try {
      const p = localStorage.getItem('santri_post_bookmarks');
      setPostBookmarks(p ? JSON.parse(p) : []);
    } catch {
      setPostBookmarks([]);
    }

    // 8. Pinned Features
    setFeatureBookmarks(getBookmarkedFeatures());
  };

  useEffect(() => {
    loadAllBookmarks();

    const unsubscribe = subscribeToBookmarkChanges(() => {
      loadAllBookmarks();
    });

    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.includes('bookmark')) {
        loadAllBookmarks();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Map into unified items
  const unifiedItems: BookmarkUnifiedItem[] = useMemo(() => {
    const list: BookmarkUnifiedItem[] = [];

    // Bedah Kitab
    kitabBookmarks.forEach(b => {
      list.push({
        id: `kitab-${b.id}`,
        type: 'kitab',
        title: b.title || 'Bedah Kitab',
        subtitle: b.source ? `Kitab: ${b.source}` : 'Analisis Teks Kitab',
        arabic: b.originalText || b.data?.matan || b.data?.originalText,
        translation: b.data?.modernTranslation || b.data?.syarah || b.data?.maknaGandul,
        categoryLabel: 'Bedah Kitab',
        color: 'bg-emerald-600 text-emerald-600',
        icon: Sparkles,
        date: b.createdAt,
        raw: b
      });
    });

    // Quran
    quranBookmarks.forEach(q => {
      list.push({
        id: `quran-${q.id || (q.surahNumber + '-' + q.ayahNumber)}`,
        type: 'quran',
        title: q.surahName ? `Surah ${q.surahName} : Ayat ${q.ayahNumber}` : `Ayat ${q.ayahNumber}`,
        subtitle: `Al-Qur'an Juz ${q.juz || '-'}`,
        arabic: q.arabic || q.arabicText,
        translation: q.translation || q.textTranslation,
        categoryLabel: 'Al-Qur\'an',
        color: 'bg-teal-600 text-teal-600',
        icon: BookOpen,
        date: q.createdAt || q.date,
        raw: q
      });
    });

    // Hadis
    hadisBookmarks.forEach(h => {
      list.push({
        id: `hadis-${h.id || (h.bookId + '-' + h.number)}`,
        type: 'hadis',
        title: h.bookName ? `${h.bookName} No. ${h.number}` : `Hadis No. ${h.number}`,
        subtitle: 'Koleksi Hadits Shahih',
        arabic: h.arab || h.arabic,
        translation: h.idTranslation || h.translation,
        categoryLabel: 'Hadits',
        color: 'bg-indigo-600 text-indigo-600',
        icon: Scroll,
        date: h.createdAt,
        raw: h
      });
    });

    // Doa
    doaBookmarks.forEach(d => {
      list.push({
        id: `doa-${d.id}`,
        type: 'doa',
        title: d.title || d.nama || 'Doa Harian',
        subtitle: d.source || d.kategori || 'Koleksi Doa & Dzikir',
        arabic: d.arabic || d.arab,
        translation: d.translation || d.artinya,
        categoryLabel: 'Doa & Dzikir',
        color: 'bg-cyan-600 text-cyan-600',
        icon: Heart,
        date: d.createdAt,
        raw: d
      });
    });

    // Munawwir
    munawwirBookmarks.forEach(m => {
      list.push({
        id: `munawwir-${m.word || m.arabic || Math.random()}`,
        type: 'munawwir',
        title: m.word || m.arabic || 'Mufradat',
        subtitle: m.root ? `Akar kata: ${m.root}` : 'Kamus Munawwir Arab-Indonesia',
        arabic: m.word || m.arabic,
        translation: m.meaning || m.arti || m.indonesian,
        categoryLabel: 'Kamus Munawwir',
        color: 'bg-amber-600 text-amber-600',
        icon: BookMarked,
        date: m.createdAt,
        raw: m
      });
    });

    // News
    newsBookmarks.forEach(n => {
      list.push({
        id: `news-${n.id}`,
        type: 'news',
        title: n.title || 'Warta Santri',
        subtitle: n.category || 'Berita & Artikel Santri',
        translation: n.excerpt || n.summary || (n.content ? n.content.slice(0, 100) + '...' : ''),
        categoryLabel: 'Warta Santri',
        color: 'bg-emerald-700 text-emerald-700',
        icon: Newspaper,
        date: n.createdAt || n.publishedAt,
        raw: n
      });
    });

    // Community
    postBookmarks.forEach(p => {
      list.push({
        id: `post-${p.id}`,
        type: 'community',
        title: p.authorName || p.author || 'Postingan Santri',
        subtitle: 'Komunitas Santri AI',
        translation: p.content ? (p.content.slice(0, 120) + (p.content.length > 120 ? '...' : '')) : '',
        categoryLabel: 'Komunitas',
        color: 'bg-violet-600 text-violet-600',
        icon: MessageSquare,
        date: p.createdAt,
        raw: p
      });
    });

    // Features
    featureBookmarks.forEach(f => {
      list.push({
        id: `feat-${f.label}`,
        type: 'features',
        title: f.label,
        subtitle: 'Fitur Favorit Santri AI',
        categoryLabel: 'Fitur Favorit',
        color: 'bg-amber-500 text-amber-500',
        icon: Star,
        raw: f
      });
    });

    return list;
  }, [kitabBookmarks, quranBookmarks, hadisBookmarks, doaBookmarks, munawwirBookmarks, newsBookmarks, postBookmarks, featureBookmarks]);

  // Filtered by category and search
  const filteredItems = useMemo(() => {
    let result = unifiedItems;

    if (activeCategory !== 'all') {
      result = result.filter(item => item.type === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => 
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.arabic && item.arabic.toLowerCase().includes(q)) ||
        (item.translation && item.translation.toLowerCase().includes(q)) ||
        (item.categoryLabel && item.categoryLabel.toLowerCase().includes(q))
      );
    }

    return result;
  }, [unifiedItems, activeCategory, searchQuery]);

  // Counts for tabs
  const counts = useMemo(() => ({
    all: unifiedItems.length,
    kitab: kitabBookmarks.length,
    quran: quranBookmarks.length,
    hadis: hadisBookmarks.length,
    doa: doaBookmarks.length,
    munawwir: munawwirBookmarks.length,
    news: newsBookmarks.length,
    community: postBookmarks.length,
    features: featureBookmarks.length,
  }), [unifiedItems, kitabBookmarks, quranBookmarks, hadisBookmarks, doaBookmarks, munawwirBookmarks, newsBookmarks, postBookmarks, featureBookmarks]);

  const handleOpenItem = (item: BookmarkUnifiedItem) => {
    switch (item.type) {
      case 'kitab':
        navigate('/result', {
          state: {
            result: item.raw.data,
            source: item.raw.source,
            query: item.raw.title,
            mode: 'kitab'
          }
        });
        break;
      case 'quran':
        if (item.raw.surahNumber) {
          navigate(`/quran/${item.raw.surahNumber}`, {
            state: { targetAyah: item.raw.ayahNumber }
          });
        } else {
          navigate('/quran', { state: { tab: 'bookmark' } });
        }
        break;
      case 'hadis':
        navigate('/hadis', { state: { tab: 'bookmark' } });
        break;
      case 'doa':
        navigate('/doa', { state: { autoSearch: item.title, tab: 'bookmark' } });
        break;
      case 'munawwir':
        navigate('/munawwir', { state: { initialSearch: item.title } });
        break;
      case 'news':
        navigate('/news-detail', { state: { news: item.raw } });
        break;
      case 'community':
        navigate('/community');
        break;
      case 'features':
        if (item.raw.path) {
          navigate(item.raw.path, { state: item.raw.state });
        }
        break;
    }
  };

  const handleCopyText = (e: React.MouseEvent, item: BookmarkUnifiedItem) => {
    e.stopPropagation();
    const textToCopy = [
      item.title,
      item.arabic,
      item.translation
    ].filter(Boolean).join('\n\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedId(item.id);
      showToast('Teks bookmark berhasil disalin', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const executeDeleteBookmark = async (item: BookmarkUnifiedItem) => {
    switch (item.type) {
      case 'kitab':
        removeBedahKitabBookmark(item.raw.id);
        if (user?.uid) {
          try { await removeUserBookmark(user.uid, item.raw.id); } catch {}
        }
        setKitabBookmarks(prev => prev.filter(b => b.id !== item.raw.id));
        break;

      case 'quran': {
        const updated = quranBookmarks.filter(q => (q.id || `${q.surahNumber}-${q.ayahNumber}`) !== (item.raw.id || `${item.raw.surahNumber}-${item.raw.ayahNumber}`));
        localStorage.setItem('santriai_quran_bookmarks', JSON.stringify(updated));
        setQuranBookmarks(updated);
        break;
      }

      case 'hadis': {
        const updated = hadisBookmarks.filter(h => (h.id || `${h.bookId}-${h.number}`) !== (item.raw.id || `${item.raw.bookId}-${item.raw.number}`));
        localStorage.setItem('santriai_hadis_bookmarks', JSON.stringify(updated));
        if (user?.uid && item.raw.id) {
          try { await removeUserBookmark(user.uid, item.raw.id); } catch {}
        }
        setHadisBookmarks(updated);
        break;
      }

      case 'doa': {
        const updated = doaBookmarks.filter(d => d.id !== item.raw.id);
        localStorage.setItem('santriai_doa_bookmarks', JSON.stringify(updated));
        setDoaBookmarks(updated);
        break;
      }

      case 'munawwir': {
        const updated = munawwirBookmarks.filter(m => (m.word || m.arabic) !== (item.raw.word || item.raw.arabic));
        localStorage.setItem('santri_munawwir_bookmarks', JSON.stringify(updated));
        setMunawwirBookmarks(updated);
        break;
      }

      case 'news': {
        const updated = newsBookmarks.filter(n => n.id !== item.raw.id);
        localStorage.setItem('santri_news_bookmarks', JSON.stringify(updated));
        setNewsBookmarks(updated);
        break;
      }

      case 'community': {
        const updated = postBookmarks.filter(p => p.id !== item.raw.id);
        localStorage.setItem('santri_post_bookmarks', JSON.stringify(updated));
        setPostBookmarks(updated);
        break;
      }

      case 'features':
        toggleBookmarkFeature(item.raw.label);
        setFeatureBookmarks(prev => prev.filter(f => f.label !== item.raw.label));
        break;
    }

    setDeleteModalItem(null);
    showToast(`Bookmark "${item.title}" dihapus`, 'info');
  };

  const categories = [
    { id: 'all' as BookmarkCategory, label: 'Semua', count: counts.all, icon: Layers },
    { id: 'kitab' as BookmarkCategory, label: 'Bedah Kitab', count: counts.kitab, icon: Sparkles },
    { id: 'quran' as BookmarkCategory, label: 'Al-Qur\'an', count: counts.quran, icon: BookOpen },
    { id: 'hadis' as BookmarkCategory, label: 'Hadits', count: counts.hadis, icon: Scroll },
    { id: 'doa' as BookmarkCategory, label: 'Doa & Dzikir', count: counts.doa, icon: Heart },
    { id: 'munawwir' as BookmarkCategory, label: 'Munawwir', count: counts.munawwir, icon: BookMarked },
    { id: 'news' as BookmarkCategory, label: 'Warta Santri', count: counts.news, icon: Newspaper },
    { id: 'community' as BookmarkCategory, label: 'Komunitas', count: counts.community, icon: MessageSquare },
    { id: 'features' as BookmarkCategory, label: 'Fitur Cepat', count: counts.features, icon: Star },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans pb-24">
      {/* Top Header */}
      <div 
        className="sticky top-0 z-30 text-white border-b border-emerald-900 px-4 pt-5 pb-4 shadow-md relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to right, #065f46, #022c22), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='%23fcd34d' stroke-opacity='0.15' stroke-width='1'%3E%3Crect x='35' y='35' width='30' height='30'/%3E%3Crect x='35' y='35' width='30' height='30' transform='rotate(45 50 50)'/%3E%3Ccircle cx='50' cy='50' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '100% 100%, 40px 40px',
          backgroundRepeat: 'no-repeat, repeat',
          backgroundBlendMode: 'overlay',
          backgroundColor: '#065f46'
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 -ml-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
              title="Kembali"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-extrabold text-lg md:text-xl text-white flex items-center gap-2">
                <Bookmark size={20} className="text-amber-300 fill-amber-300/30" />
                Bookmark Santri
              </h1>
              <p className="text-[11px] text-emerald-200 font-medium">
                Pusat data & konten tersimpan Anda
              </p>
            </div>
          </div>

          <div className="px-3 py-1 bg-white/10 rounded-full border border-white/20 text-xs font-bold text-emerald-100 backdrop-blur-xs flex items-center gap-1.5">
            <span>{counts.all}</span>
            <span className="text-[10px] font-normal opacity-80">item</span>
          </div>
        </div>

        {/* Search Bar inside Header */}
        <div className="max-w-2xl mx-auto mt-4 relative z-10">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dalam semua bookmark..."
              className="w-full pl-10 pr-10 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 border border-emerald-500/30 focus:outline-hidden focus:ring-2 focus:ring-amber-400/50 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs (Scrollable Horizontal) */}
      <div className="sticky top-[138px] z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 py-2.5 px-4 shadow-2xs">
        <div className="max-w-2xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs scale-102'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-amber-300' : 'text-slate-400'} />
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 pt-4 space-y-3">
        {/* Results Header */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Menampilkan {filteredItems.length} bookmark</span>
          {searchQuery && (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Filter: "{searchQuery}"
            </span>
          )}
        </div>

        {/* Bookmarks List */}
        <AnimatePresence mode="popLayout">
          {filteredItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center gap-3 shadow-2xs mt-4"
            >
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Bookmark size={30} className="stroke-[1.5]" />
              </div>
              <div className="max-w-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {searchQuery ? 'Tidak Ada Bookmark yang Cocok' : 'Belum Ada Bookmark'}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                  {searchQuery 
                    ? 'Coba gunakan kata kunci pencarian yang lain.'
                    : 'Gunakan ikon bookmark di fitur Bedah Kitab, Al-Qur\'an, Hadits, Doa, Munawwir, atau Warta untuk menyimpan konten favorit Anda di sini.'}
                </p>
              </div>
            </motion.div>
          ) : (
            filteredItems.map((item) => {
              const Icon = item.icon;
              const isCopied = copiedId === item.id;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  onClick={() => handleOpenItem(item)}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-600/40 shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                >
                  {/* Category Accent Line */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${item.color.split(' ')[0]}`} />

                  <div className="pl-2">
                    {/* Item Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white flex items-center gap-1 ${item.color.split(' ')[0]}`}>
                          <Icon size={12} />
                          {item.categoryLabel}
                        </span>
                        {item.subtitle && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            {item.subtitle}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {item.type !== 'features' && (
                          <button
                            onClick={(e) => handleCopyText(e, item)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Salin Teks"
                          >
                            {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModalItem(item);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                          title="Hapus Bookmark"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1.5 flex items-center justify-between">
                      <span className="line-clamp-1">{item.title}</span>
                      <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                    </h3>

                    {/* Arabic Text if exists */}
                    {item.arabic && (
                      <div 
                        dir="rtl" 
                        className="font-amiri text-base md:text-lg text-emerald-950 dark:text-emerald-200 leading-loose line-clamp-2 my-1.5 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30"
                      >
                        {item.arabic}
                      </div>
                    )}

                    {/* Translation / Content snippet */}
                    {item.translation && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mt-1">
                        {item.translation}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Hapus dari Bookmark?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Apakah Anda yakin ingin menghapus bookmark <span className="font-semibold text-slate-700 dark:text-slate-300">"{deleteModalItem.title}"</span>?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalItem(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => executeDeleteBookmark(deleteModalItem)}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/20"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
