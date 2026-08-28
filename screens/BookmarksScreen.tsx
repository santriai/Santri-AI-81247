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
  BookMarked,
  Video,
  Music2,
  Play
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
import { removeUserBookmark, subscribeAllUserBookmarks } from '../services/firebase';
import { VIDEO_PLAYLIST, IslamicVideo } from './IslamicVideosScreen';
import { AUDIO_DATA } from './PlaylistScreen';

type BookmarkCategory = 'all' | 'kitab' | 'quran' | 'hadis' | 'doa' | 'video' | 'audio' | 'community' | 'munawwir' | 'news' | 'features';

interface BookmarkUnifiedItem {
  id: string;
  type: BookmarkCategory;
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

// Color mapping for card backgrounds based on bookmark type
const getCategoryCardStyle = (type: BookmarkCategory) => {
  switch (type) {
    case 'kitab':
      return 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200/80 dark:border-emerald-800/50 hover:border-emerald-400 dark:hover:border-emerald-600';
    case 'quran':
      return 'bg-teal-50/70 dark:bg-teal-950/25 border-teal-200/80 dark:border-teal-800/50 hover:border-teal-400 dark:hover:border-teal-600';
    case 'hadis':
      return 'bg-indigo-50/70 dark:bg-indigo-950/25 border-indigo-200/80 dark:border-indigo-800/50 hover:border-indigo-400 dark:hover:border-indigo-600';
    case 'doa':
      return 'bg-cyan-50/70 dark:bg-cyan-950/25 border-cyan-200/80 dark:border-cyan-800/50 hover:border-cyan-400 dark:hover:border-cyan-600';
    case 'video':
      return 'bg-rose-50/70 dark:bg-rose-950/25 border-rose-200/80 dark:border-rose-800/50 hover:border-rose-400 dark:hover:border-rose-600';
    case 'audio':
      return 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-200/80 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-600';
    case 'community':
      return 'bg-purple-50/70 dark:bg-purple-950/25 border-purple-200/80 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600';
    case 'munawwir':
      return 'bg-orange-50/70 dark:bg-orange-950/25 border-orange-200/80 dark:border-orange-800/50 hover:border-orange-400 dark:hover:border-orange-600';
    case 'news':
      return 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200/80 dark:border-emerald-800/50 hover:border-emerald-400 dark:hover:border-emerald-600';
    case 'features':
      return 'bg-yellow-50/70 dark:bg-yellow-950/25 border-yellow-200/80 dark:border-yellow-800/50 hover:border-yellow-400 dark:hover:border-yellow-600';
    default:
      return 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800';
  }
};

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
  const [videoBookmarks, setVideoBookmarks] = useState<string[]>([]);
  const [audioBookmarks, setAudioBookmarks] = useState<string[]>([]);
  const [munawwirBookmarks, setMunawwirBookmarks] = useState<any[]>([]);
  const [newsBookmarks, setNewsBookmarks] = useState<any[]>([]);
  const [postBookmarks, setPostBookmarks] = useState<any[]>([]);
  const [featureBookmarks, setFeatureBookmarks] = useState<FeatureItem[]>([]);

  // Cloud bookmarks for logged in user
  const [firebaseBookmarks, setFirebaseBookmarks] = useState<any[]>([]);

  const loadAllLocalBookmarks = () => {
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

    // 5. Video Islami Favorites
    try {
      const v = localStorage.getItem('santri_video_favorites');
      setVideoBookmarks(v ? JSON.parse(v) : []);
    } catch {
      setVideoBookmarks([]);
    }

    // 6. Audio MP3 Favorites
    try {
      const a = localStorage.getItem('santri_audio_favorites');
      setAudioBookmarks(a ? JSON.parse(a) : []);
    } catch {
      setAudioBookmarks([]);
    }

    // 7. Munawwir
    try {
      const m = localStorage.getItem('santri_munawwir_bookmarks');
      setMunawwirBookmarks(m ? JSON.parse(m) : []);
    } catch {
      setMunawwirBookmarks([]);
    }

    // 8. News
    try {
      const n = localStorage.getItem('santri_news_bookmarks');
      setNewsBookmarks(n ? JSON.parse(n) : []);
    } catch {
      setNewsBookmarks([]);
    }

    // 9. Community Posts
    try {
      const p = localStorage.getItem('santri_post_bookmarks');
      setPostBookmarks(p ? JSON.parse(p) : []);
    } catch {
      setPostBookmarks([]);
    }

    // 10. Pinned Features
    setFeatureBookmarks(getBookmarkedFeatures());
  };

  useEffect(() => {
    loadAllLocalBookmarks();

    const unsubscribeService = subscribeToBookmarkChanges(() => {
      loadAllLocalBookmarks();
    });

    const handleStorage = (e: StorageEvent) => {
      if (e.key && (e.key.includes('bookmark') || e.key.includes('favorite'))) {
        loadAllLocalBookmarks();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribeService();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Sync Firebase Bookmarks if user is logged in
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = subscribeAllUserBookmarks(user.uid, (data) => {
        setFirebaseBookmarks(data || []);
      });
      return () => unsubscribe();
    } else {
      setFirebaseBookmarks([]);
    }
  }, [user]);

  // Merge and Map into unified items
  const unifiedItems: BookmarkUnifiedItem[] = useMemo(() => {
    const list: BookmarkUnifiedItem[] = [];
    const seenIds = new Set<string>();

    // Helper to add unique
    const addUnique = (item: BookmarkUnifiedItem) => {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        list.push(item);
      }
    };

    // 1. Bedah Kitab (Local)
    kitabBookmarks.forEach(b => {
      addUnique({
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

    // 2. Quran (Local)
    quranBookmarks.forEach(q => {
      const surahNum = q.surahNumber || q.ayah?.surahNumber;
      const ayahNum = q.ayah?.number || q.ayahNumber || q.number || 1;
      const surahName = q.surahName || q.surahLatin || (surahNum ? `Surah ${surahNum}` : 'Surah');
      const arab = q.ayah?.arab || q.arab || q.arabic || q.arabicText || '';
      const trans = q.ayah?.text || q.text || q.translation || q.textTranslation || '';

      addUnique({
        id: `quran-${q.id || `${surahNum}-${ayahNum}`}`,
        type: 'quran',
        title: `${surahName} : Ayat ${ayahNum}`,
        subtitle: `Al-Qur'an ${q.juz ? `Juz ${q.juz}` : ''}`,
        arabic: arab,
        translation: trans,
        categoryLabel: 'Al-Qur\'an',
        color: 'bg-teal-600 text-teal-600',
        icon: BookOpen,
        date: q.savedAt || q.createdAt || q.date,
        raw: { ...q, surahNumber: surahNum, ayahNumber: ayahNum, surahName }
      });
    });

    // 3. Hadis (Local)
    hadisBookmarks.forEach(h => {
      const bookName = h.bookName || (h.bookId ? h.bookId.toUpperCase() : 'Hadis');
      const num = h.number || h.hadithNumber;
      const arab = h.arab || h.arabic || '';
      const trans = h.idTranslation || h.translation || h.id || '';

      addUnique({
        id: `hadis-${h.id || `${h.bookId}-${num}`}`,
        type: 'hadis',
        title: `${bookName} No. ${num}`,
        subtitle: 'Koleksi Hadits Shahih',
        arabic: arab,
        translation: trans,
        categoryLabel: 'Hadits',
        color: 'bg-indigo-600 text-indigo-600',
        icon: Scroll,
        date: h.savedAt || h.createdAt,
        raw: { ...h, bookName, number: num }
      });
    });

    // 4. Doa (Local)
    doaBookmarks.forEach(d => {
      const title = d.title || d.nama || 'Doa Harian';
      const arab = d.arabic || d.arab || '';
      const trans = d.translation || d.arti || d.artinya || '';
      const subtitle = d.source || d.riwayat || d.category || d.kategori || 'Koleksi Doa & Dzikir';

      addUnique({
        id: `doa-${d.id}`,
        type: 'doa',
        title: title,
        subtitle: subtitle,
        arabic: arab,
        translation: trans,
        categoryLabel: 'Doa & Dzikir',
        color: 'bg-cyan-600 text-cyan-600',
        icon: Heart,
        date: d.savedAt || d.createdAt,
        raw: d
      });
    });

    // 5. Firebase Bookmarks (Cloud)
    firebaseBookmarks.forEach(fb => {
      const type = fb.type;
      if (type === 'quran') {
        const surahNum = fb.surahNumber || fb.ayah?.surahNumber;
        const ayahNum = fb.ayah?.number || fb.ayahNumber || fb.number || 1;
        const surahName = fb.surahName || fb.surahLatin || (surahNum ? `Surah ${surahNum}` : 'Surah');
        const arab = fb.ayah?.arab || fb.arab || fb.arabic || fb.arabicText || '';
        const trans = fb.ayah?.text || fb.text || fb.translation || fb.textTranslation || '';

        addUnique({
          id: `quran-${fb.id || `${surahNum}-${ayahNum}`}`,
          type: 'quran',
          title: `${surahName} : Ayat ${ayahNum}`,
          subtitle: `Al-Qur'an ${fb.juz ? `Juz ${fb.juz}` : ''}`,
          arabic: arab,
          translation: trans,
          categoryLabel: 'Al-Qur\'an',
          color: 'bg-teal-600 text-teal-600',
          icon: BookOpen,
          date: fb.createdAt?.seconds ? fb.createdAt.seconds * 1000 : fb.savedAt,
          raw: { ...fb, surahNumber: surahNum, ayahNumber: ayahNum, surahName }
        });
      } else if (type === 'hadis') {
        const bookName = fb.bookName || (fb.bookId ? fb.bookId.toUpperCase() : 'Hadis');
        const num = fb.number || fb.hadithNumber;
        const arab = fb.arab || fb.arabic || '';
        const trans = fb.idTranslation || fb.translation || fb.id || '';

        addUnique({
          id: `hadis-${fb.id || `${fb.bookId}-${num}`}`,
          type: 'hadis',
          title: `${bookName} No. ${num}`,
          subtitle: 'Koleksi Hadits Shahih',
          arabic: arab,
          translation: trans,
          categoryLabel: 'Hadits',
          color: 'bg-indigo-600 text-indigo-600',
          icon: Scroll,
          date: fb.createdAt?.seconds ? fb.createdAt.seconds * 1000 : fb.savedAt,
          raw: { ...fb, bookName, number: num }
        });
      } else if (type === 'doa') {
        const title = fb.title || fb.nama || 'Doa Harian';
        const arab = fb.arabic || fb.arab || '';
        const trans = fb.translation || fb.arti || fb.artinya || '';
        const subtitle = fb.source || fb.riwayat || fb.category || fb.kategori || 'Koleksi Doa & Dzikir';

        addUnique({
          id: `doa-${fb.id}`,
          type: 'doa',
          title: title,
          subtitle: subtitle,
          arabic: arab,
          translation: trans,
          categoryLabel: 'Doa & Dzikir',
          color: 'bg-cyan-600 text-cyan-600',
          icon: Heart,
          date: fb.createdAt?.seconds ? fb.createdAt.seconds * 1000 : fb.savedAt,
          raw: fb
        });
      } else if (type === 'bedah_kitab' || type === 'kitab') {
        addUnique({
          id: `kitab-${fb.id}`,
          type: 'kitab',
          title: fb.title || 'Bedah Kitab',
          subtitle: fb.source ? `Kitab: ${fb.source}` : 'Analisis Teks Kitab',
          arabic: fb.originalText || fb.data?.matan || fb.data?.originalText,
          translation: fb.data?.modernTranslation || fb.data?.syarah || fb.data?.maknaGandul,
          categoryLabel: 'Bedah Kitab',
          color: 'bg-emerald-600 text-emerald-600',
          icon: Sparkles,
          date: fb.createdAt?.seconds ? fb.createdAt.seconds * 1000 : fb.savedAt,
          raw: fb
        });
      }
    });

    // 6. Video Islami Favorites
    videoBookmarks.forEach(vid => {
      const vidId = typeof vid === 'string' ? vid : (vid as any)?.id;
      const videoObj = VIDEO_PLAYLIST.find(v => v.id === vidId) || (typeof vid === 'object' ? vid : null);
      if (videoObj) {
        addUnique({
          id: `video-${vidId}`,
          type: 'video',
          title: videoObj.title,
          subtitle: `${videoObj.speaker} • Durasi: ${videoObj.duration}`,
          translation: videoObj.description,
          categoryLabel: 'Video Islami',
          color: 'bg-rose-600 text-rose-600',
          icon: Video,
          date: videoObj.publishedAt,
          raw: videoObj
        });
      }
    });

    // 7. Galeri Audio MP3 Favorites
    audioBookmarks.forEach(aud => {
      const audId = typeof aud === 'string' ? aud : (aud as any)?.id;
      const audioObj = AUDIO_DATA.find(a => a.id === audId) || (typeof aud === 'object' ? aud : null);
      if (audioObj) {
        addUnique({
          id: `audio-${audId}`,
          type: 'audio',
          title: audioObj.title,
          subtitle: `${audioObj.artist} • Kategori: ${audioObj.category.toUpperCase()}`,
          categoryLabel: 'Galeri Audio',
          color: 'bg-amber-600 text-amber-600',
          icon: Music2,
          raw: audioObj
        });
      }
    });

    // 8. Community Post Bookmarks
    postBookmarks.forEach(p => {
      const author = p.authorName || p.author || p.userName || 'Santri';
      const previewText = p.content ? (p.content.slice(0, 140) + (p.content.length > 140 ? '...' : '')) : '';

      addUnique({
        id: `community-${p.id}`,
        type: 'community',
        title: `Postingan oleh ${author}`,
        subtitle: p.category ? `Kategori: ${p.category}` : 'Komunitas Santri AI',
        translation: previewText,
        categoryLabel: 'Postingan',
        color: 'bg-violet-600 text-violet-600',
        icon: MessageSquare,
        date: p.createdAt,
        raw: p
      });
    });

    // 9. Munawwir
    munawwirBookmarks.forEach(m => {
      const word = m.word || m.arabic || 'Mufradat';
      addUnique({
        id: `munawwir-${word}`,
        type: 'munawwir',
        title: word,
        subtitle: m.root ? `Akar kata: ${m.root}` : 'Kamus Munawwir Arab-Indonesia',
        arabic: word,
        translation: m.meaning || m.arti || m.indonesian,
        categoryLabel: 'Kamus Munawwir',
        color: 'bg-amber-700 text-amber-700',
        icon: BookMarked,
        date: m.createdAt,
        raw: m
      });
    });

    // 10. News
    newsBookmarks.forEach(n => {
      addUnique({
        id: `news-${n.id}`,
        type: 'news',
        title: n.title || 'Warta Santri',
        subtitle: n.category || 'Berita & Artikel Santri',
        translation: n.excerpt || n.summary || (n.content ? n.content.slice(0, 120) + '...' : ''),
        categoryLabel: 'Warta Santri',
        color: 'bg-emerald-700 text-emerald-700',
        icon: Newspaper,
        date: n.createdAt || n.publishedAt,
        raw: n
      });
    });

    // 11. Features
    featureBookmarks.forEach(f => {
      addUnique({
        id: `feat-${f.label}`,
        type: 'features',
        title: f.label,
        subtitle: 'Akses Cepat Fitur Santri AI',
        categoryLabel: 'Fitur Cepat',
        color: 'bg-orange-500 text-orange-500',
        icon: Star,
        raw: f
      });
    });

    return list;
  }, [
    kitabBookmarks, 
    quranBookmarks, 
    hadisBookmarks, 
    doaBookmarks, 
    firebaseBookmarks, 
    videoBookmarks, 
    audioBookmarks, 
    postBookmarks, 
    munawwirBookmarks, 
    newsBookmarks, 
    featureBookmarks
  ]);

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
  const counts = useMemo(() => {
    const map: Record<string, number> = {
      all: unifiedItems.length,
      kitab: 0,
      quran: 0,
      hadis: 0,
      doa: 0,
      video: 0,
      audio: 0,
      community: 0,
      munawwir: 0,
      news: 0,
      features: 0
    };
    unifiedItems.forEach(item => {
      if (map[item.type] !== undefined) {
        map[item.type]++;
      }
    });
    return map;
  }, [unifiedItems]);

  // Handle direct item click with Deep Linking
  const handleOpenItem = (item: BookmarkUnifiedItem) => {
    switch (item.type) {
      case 'kitab':
        navigate('/result', {
          state: {
            result: item.raw.data || item.raw,
            source: item.raw.source || 'Kitab',
            query: item.raw.title || item.title,
            mode: 'kitab'
          }
        });
        break;

      case 'quran': {
        const surahNum = item.raw.surahNumber || item.raw.ayah?.surahNumber || 1;
        const ayahNum = item.raw.ayahNumber || item.raw.ayah?.number || 1;
        navigate('/quran', { 
          state: { 
            surahNumber: Number(surahNum), 
            targetAyah: Number(ayahNum) 
          } 
        });
        break;
      }

      case 'hadis': {
        const bookId = item.raw.bookId || 'bukhari';
        const hadithNum = item.raw.number || item.raw.hadithNumber || 1;
        navigate('/hadis', { 
          state: { 
            tab: 'bookmark', 
            bookId: bookId, 
            hadithNumber: hadithNum 
          } 
        });
        break;
      }

      case 'doa': {
        const doaId = item.raw.id;
        const doaTitle = item.raw.title || item.raw.nama || item.title;
        navigate('/doa', { 
          state: { 
            tab: 'bookmark', 
            doaId: doaId, 
            autoSearch: doaTitle 
          } 
        });
        break;
      }

      case 'video': {
        const videoId = item.raw.id || item.raw;
        navigate('/video-islami', {
          state: {
            videoId: videoId,
            tab: 'favorit'
          }
        });
        break;
      }

      case 'audio': {
        const audioId = item.raw.id || item.raw;
        navigate('/playlist', {
          state: {
            audioId: audioId,
            tab: 'favorit'
          }
        });
        break;
      }

      case 'community': {
        const postId = item.raw.id || item.raw.postId;
        navigate('/community', {
          state: {
            targetId: postId,
            highlightPostId: postId,
            tab: 'feed'
          }
        });
        break;
      }

      case 'munawwir':
        navigate('/munawwir', { state: { initialSearch: item.title } });
        break;

      case 'news':
        navigate('/news-detail', { state: { news: item.raw } });
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
        if (user?.uid && item.raw.id) {
          try { await removeUserBookmark(user.uid, item.raw.id); } catch {}
        }
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
        if (user?.uid && item.raw.id) {
          try { await removeUserBookmark(user.uid, item.raw.id); } catch {}
        }
        setDoaBookmarks(updated);
        break;
      }

      case 'video': {
        const updated = videoBookmarks.filter(id => id !== item.raw.id);
        localStorage.setItem('santri_video_favorites', JSON.stringify(updated));
        setVideoBookmarks(updated);
        break;
      }

      case 'audio': {
        const updated = audioBookmarks.filter(id => id !== item.raw.id);
        localStorage.setItem('santri_audio_favorites', JSON.stringify(updated));
        setAudioBookmarks(updated);
        break;
      }

      case 'community': {
        const updated = postBookmarks.filter(p => p.id !== item.raw.id);
        localStorage.setItem('santri_post_bookmarks', JSON.stringify(updated));
        setPostBookmarks(updated);
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
    { id: 'video' as BookmarkCategory, label: 'Video Islami', count: counts.video, icon: Video },
    { id: 'audio' as BookmarkCategory, label: 'Galeri Audio', count: counts.audio, icon: Music2 },
    { id: 'community' as BookmarkCategory, label: 'Postingan', count: counts.community, icon: MessageSquare },
    { id: 'munawwir' as BookmarkCategory, label: 'Munawwir', count: counts.munawwir, icon: BookMarked },
    { id: 'news' as BookmarkCategory, label: 'Warta Santri', count: counts.news, icon: Newspaper },
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
                    : 'Gunakan ikon bookmark di fitur Bedah Kitab, Al-Qur\'an, Hadits, Doa, Video Islami, Audio MP3, atau Komunitas untuk menyimpan konten favorit Anda di sini.'}
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
                  className={`rounded-2xl p-4 border shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${getCategoryCardStyle(item.type)}`}
                >
                  {/* Category Accent Line */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${item.color.split(' ')[0]}`} />

                  <div className="pl-2">
                    {/* Item Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold text-white flex items-center gap-1 shadow-xs ${item.color.split(' ')[0]}`}>
                          <Icon size={12} />
                          {item.categoryLabel}
                        </span>
                        {item.subtitle && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                            {item.subtitle}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.type !== 'features' && (
                          <button
                            onClick={(e) => handleCopyText(e, item)}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 transition-all shadow-2xs cursor-pointer active:scale-95"
                            title="Salin Teks"
                          >
                            {isCopied ? <Check size={14} className="text-emerald-600 stroke-[2.5]" /> : <Copy size={14} />}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModalItem(item);
                          }}
                          className="p-1.5 text-rose-600 dark:text-rose-400 hover:text-white bg-rose-100/90 dark:bg-rose-950/70 hover:bg-rose-600 dark:hover:bg-rose-600 rounded-lg border border-rose-200 dark:border-rose-900/60 transition-all shadow-2xs cursor-pointer active:scale-95"
                          title="Hapus Bookmark"
                        >
                          <Trash2 size={14} className="stroke-[2.2]" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1.5 flex items-center justify-between">
                      <span className="line-clamp-1">{item.title}</span>
                      <ChevronRight size={16} className="text-slate-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                    </h3>

                    {/* Arabic Text if exists */}
                    {item.arabic && (
                      <div 
                        dir="rtl" 
                        className="font-amiri text-base md:text-lg text-emerald-950 dark:text-emerald-100 leading-loose line-clamp-2 my-2 bg-white/80 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xs"
                      >
                        {item.arabic}
                      </div>
                    )}

                    {/* Translation / Content snippet */}
                    {item.translation && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed mt-1">
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

