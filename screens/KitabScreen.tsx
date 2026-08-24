
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Auth
import { UserAvatar } from '../components/UserAvatar';
import { subscribeUserBookmarks } from '../services/firebase'; // Firestore
import { ContentReportModal } from '../components/ContentReportModal';
import { openExternalLink } from '../utils/linkUtils';
import { PLAYSTORE_LINK } from '../constants';
import { useToast } from '../contexts/ToastContext';
import { 
  Search, 
  BookOpen,
  Keyboard, 
  Shield, 
  Scale, 
  Gavel, 
  Feather, 
  Heart, 
  Clock,
  Book,
  Save,
  ChevronRight,
  Scroll,
  Library,
  ArrowRight,
  Brain,
  Music2, // Changed from Music to Music2 as it's more specific for reading/recitation
  Star,
  List,
  Award,
  Sparkles,
  Hash,
  Flag
} from 'lucide-react';

type CategoryItem = { id: string; label: string; icon: any; desc: string; pro?: boolean };

const STATIC_CATEGORIES: CategoryItem[] = [
  { id: 'tafsir', label: 'Tafsir Al-Quran', icon: BookOpen, desc: 'Tafsir Jalalain, Ibnu Katsir, dll', pro: true },
  { id: 'hadits', label: 'Hadits', icon: Scroll, desc: 'Arba\'in Nawawi, Riyadhus Shalihin' },
  { id: 'akidah', label: 'Akidah (Tauhid)', icon: Shield, desc: 'Aqidatul Awam, Jauharatut Tauhid' },
  { id: 'fiqh', label: 'Fiqih', icon: Scale, desc: 'Fathul Qorib, Safinatun Najah' },
  { id: 'ushul_fiqh', label: 'Ushul Fiqih', icon: Gavel, desc: 'Al-Waraqat, Lathaiful Isyarat', pro: true },
  { id: 'nahwu', label: 'Nahwu & Shorof', icon: Feather, desc: 'Al-Jurumiyah, Imriti, Alfiyah' },
  { id: 'mantiq', label: 'Mantiq (Logika)', icon: Brain, desc: 'Sullamul Munawraq, Isaghuji', pro: true },
  { id: 'tasawuf', label: 'Akhlaq & Tasawuf', icon: Heart, desc: 'Ta\'lim Muta\'allim, Ihya Ulumuddin' },
  { id: 'tarikh', label: 'Tarikh (Sejarah)', icon: Clock, desc: 'Khulashoh Nurul Yaqin, Sirah Nabawiyah' },
  { id: 'sholawat', label: 'Kumpulan Sholawat', icon: Music2, desc: 'Burdah, Dala\'ilul Khairat', pro: true },
  { id: 'maulid', label: 'Kitab Maulid', icon: Star, desc: 'Simtudduror, Al-Barzanji, Diba\'' },
  { id: 'ratib', label: 'Kitab Ratib', icon: List, desc: 'Ratib Al-Haddad, Ratib Al-Athos' },
  { id: 'manaqib', label: 'Kitab Manaqib', icon: Award, desc: 'Nurul Burhan, Jawahirul Ma\'ani' },
  { id: 'hikmah', label: 'Ilmu Hikmah', icon: Sparkles, desc: 'Doa, wafaq, & amalan spiritual (Al-Aufaq, Syamsul Ma\'arif)', pro: true },
  { id: 'tajwid', label: 'Ilmu Tajwid', icon: Music2, desc: 'Hukum Nun Mati, Mad, Ghunnah, dll.' },
  { id: 'nadhom', label: 'Nadhom & Arudh', icon: Feather, desc: 'Bait Syi\'ir, rima puisi, bahr & ilmu arudh' }
];

const KitabScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [chapter, setChapter] = useState('');
  const [page, setPage] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [savedBooksCount, setSavedBooksCount] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Handle autoSearch from navigation state
  useEffect(() => {
    if (location.state && (location.state as any).autoSearch) {
      const searchVal = (location.state as any).autoSearch;
      setQuery(searchVal);
      // Small delay to ensure state update and transition feel right
      setTimeout(() => {
        handleSearchFromQuery(searchVal);
      }, 300);
    }
  }, [location, navigate]);

  const handleSearchFromQuery = (searchQuery: any) => {
    if (typeof searchQuery !== 'string' || !searchQuery.trim()) return;
    navigate('/book-detail', { state: { query: searchQuery.trim() } });
  };

  // Load Saved Books Count
  useEffect(() => {
    if (user) {
        // Realtime count from Firestore
        const unsubscribe = subscribeUserBookmarks(user.uid, 'kitab', (data) => {
            setSavedBooksCount(data.length);
        });
        return () => unsubscribe();
    } else {
        // LocalStorage for Guest
        const saved = localStorage.getItem('santriai_saved_books');
        if (saved) {
            setSavedBooksCount(JSON.parse(saved).length);
        }
    }
  }, [user]);

  const handleSearch = () => {
    if (!query.trim() && !chapter.trim() && !page.trim()) return;

    // If advanced fields are used, go to advanced search screen
    if (chapter.trim() || page.trim()) {
      navigate('/kitab-advanced-search', { 
        state: { 
          initialKeyword: query.trim(),
          initialChapter: chapter.trim(),
          initialPage: page.trim() 
        } 
      });
      return;
    }

    // Direct search -> Go to Book Detail
    navigate('/book-detail', { state: { query: query.trim() } });
  };

  const openAdvancedSearch = () => {
    navigate('/kitab-advanced-search');
  };

  const openCategory = (cat: CategoryItem) => {
    navigate('/category-books', { state: { id: cat.id, label: cat.label } });
  };

  const openSaved = () => {
    navigate('/category-books', { state: { id: 'saved', label: 'Koleksi Tersimpan' } });
  };

  return (
    <div className="pb-24 min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-x-hidden">
      {/* Header Banner */}
      <div className="bg-[#005a2b] dark:bg-emerald-950 pt-5 pb-4 px-4 rounded-b-[1.5rem] shadow-md mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-tight uppercase italic">
          <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg">
            <Book size={18} strokeWidth={3} className="text-santri-gold" />
          </div>
          Pusat Maktabah
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openExternalLink(PLAYSTORE_LINK)}
            className="px-2.5 py-1.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
            title="Beri Rating"
          >
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="hidden xs:inline">Rating</span>
          </button>
          <button
            onClick={() => setIsReportOpen(true)}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
            title="Laporkan"
          >
            <Flag size={14} />
            <span className="hidden xs:inline">Laporkan</span>
          </button>
          <button 
            onClick={() => navigate('/settings')} 
            className="relative active:scale-90 transition-all flex-shrink-0"
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

      <div className="px-4 relative z-10">
      
      {/* Search Banner & Expander */}
      <div className="px-4 mb-6">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-[2rem] border-2 border-emerald-100 dark:border-emerald-800/50 shadow-xl shadow-emerald-50/50 dark:shadow-none overflow-hidden transition-all duration-500">
          {!isSearchExpanded ? (
            <button 
              onClick={() => setIsSearchExpanded(true)}
              className="w-full p-5 flex items-center justify-between group active:scale-[0.98] transition-all bg-gradient-to-r from-emerald-500/5 to-teal-500/5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-santri-green shrink-0 shadow-sm border border-emerald-100 dark:border-emerald-900 group-hover:scale-110 transition-transform">
                  <Search size={22} strokeWidth={3} />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-none mb-1">Pencarian Kitab</h3>
                  <p className="text-[9px] text-santri-green dark:text-santri-gold font-bold uppercase tracking-widest leading-none">Cari Bab, Halaman & Kata Kunci</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-santri-green group-hover:text-white transition-all">
                <ChevronRight size={18} strokeWidth={3} />
              </div>
            </button>
          ) : (
            <div className="p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-1">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opsi Pencarian</h3>
                 <button onClick={() => setIsSearchExpanded(false)} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase">Tutup</button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 rounded-2xl flex items-center justify-center text-santri-green shrink-0">
                   <Search size={20} strokeWidth={3} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Kata Kunci / Judul</h3>
                  <input 
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Contoh: Niat Wudhu..."
                    className="w-full bg-transparent text-sm font-bold text-slate-800 dark:text-slate-100 outline-none placeholder:text-slate-300"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-2xl border border-transparent focus-within:border-santri-green/30 transition-all flex items-center gap-2">
                  <List size={14} className="text-slate-400 shrink-0" />
                  <input 
                    type="text" 
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    placeholder="Bab..."
                    className="w-full bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none"
                  />
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-2xl border border-transparent focus-within:border-santri-green/30 transition-all flex items-center gap-2">
                  <Hash size={14} className="text-slate-400 shrink-0" />
                  <input 
                    type="text" 
                    value={page}
                    onChange={(e) => setPage(e.target.value)}
                    placeholder="Halaman..."
                    className="w-full bg-transparent text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleSearch}
                className="w-full bg-santri-green hover:bg-santri-green-dark text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-green-100 dark:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Sparkles size={16} />
                Temukan Ibarah
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button 
          onClick={() => navigate('/input')}
          className="relative overflow-hidden p-4 rounded-[1.5rem] bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-orange-100 dark:shadow-none transition-transform active:scale-95 text-left flex flex-col justify-between h-32 group"
        >
          {/* Islamic Pattern Watermark */}
          <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z'/%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z' transform='rotate(45 60 60)'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '70px 70px'
          }}></div>
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 relative z-10">
             <Keyboard size={24} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-black uppercase tracking-tight leading-tight">Terjemahkan</h3>
            <p className="text-[8px] font-bold text-orange-200 mt-1 uppercase tracking-widest">Arab & Indonesia</p>
          </div>
        </button>
        <button 
          onClick={() => navigate('/munawwir')}
          className="relative overflow-hidden p-4 rounded-[1.5rem] bg-gradient-to-br from-teal-600 to-emerald-800 text-white shadow-xl shadow-emerald-100 dark:shadow-none transition-transform active:scale-95 text-left flex flex-col justify-between h-32 group"
        >
          {/* Islamic Pattern Watermark */}
          <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z'/%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z' transform='rotate(45 60 60)'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '70px 70px'
          }}></div>
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 relative z-10">
             <BookOpen size={24} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-black uppercase tracking-tight leading-tight">Kamus<br/>Munawwir</h3>
            <p className="text-[8px] font-bold text-emerald-200 mt-1 uppercase tracking-widest">Pencarian Akar Kata</p>
          </div>
        </button>
      </div>

      {/* Maktabah Syamilah & Kubro Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button 
          onClick={() => navigate('/category-books', { state: { id: 'syamilah', label: 'Maktabah Syamilah' } })}
          className="relative overflow-hidden p-4 rounded-[1.5rem] bg-gradient-to-br from-indigo-700 to-blue-900 text-white shadow-xl shadow-indigo-100 dark:shadow-none transition-transform active:scale-95 text-left flex flex-col justify-between h-40 group"
        >
          {/* Islamic Pattern Watermark */}
          <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z'/%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z' transform='rotate(45 60 60)'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '70px 70px'
          }}></div>
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 relative z-10">
             <Library size={24} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-1">
               <span className="text-[7px] font-black bg-indigo-500 px-1.5 py-0.5 rounded-full tracking-widest text-indigo-100 uppercase">Legacy Edition</span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-tight leading-tight">Maktabah<br/>Syamilah</h3>
            <p className="text-[8px] font-bold text-indigo-200 mt-1 uppercase tracking-widest">7,000+ Kitab Digital</p>
          </div>
        </button>
        <button 
          onClick={() => navigate('/category-books', { state: { id: 'kubro', label: 'Maktabah Kubro' } })}
          className="relative overflow-hidden p-4 rounded-[1.5rem] bg-gradient-to-br from-emerald-700 to-teal-900 text-white shadow-xl shadow-emerald-100 dark:shadow-none transition-transform active:scale-95 text-left flex flex-col justify-between h-40 group"
        >
          {/* Islamic Pattern Watermark */}
          <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z'/%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z' transform='rotate(45 60 60)'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '70px 70px'
          }}></div>
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 relative z-10">
             <Scroll size={24} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
             <div className="flex items-center gap-1.5 mb-1">
               <span className="text-[7px] font-black bg-emerald-500 px-1.5 py-0.5 rounded-full tracking-widest text-emerald-100 uppercase">Expanded Library</span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-tight leading-tight">Maktabah<br/>Kubro</h3>
            <p className="text-[8px] font-bold text-emerald-200 mt-1 uppercase tracking-widest">Ensiklopedia Komplit</p>
          </div>
        </button>
      </div>

      {/* Modern Ebook Banner */}
      <div className="mb-3 animate-in fade-in slide-in-from-top-4 duration-500">
        <button 
          onClick={() => navigate('/ebook')}
          className="w-full p-4 rounded-[1.5rem] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-200 dark:shadow-none flex items-center justify-between group overflow-hidden relative"
        >
           {/* Islamic Pattern Overlay */}
           <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <pattern id="islamic-pattern-ebook" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M20 2 L25 10 L35 10 L30 20 L35 30 L25 30 L20 38 L15 30 L5 30 L10 20 L5 10 L15 10 Z" 
                    fill="none" stroke="white" strokeWidth="1" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#islamic-pattern-ebook)" />
              </svg>
           </div>
           
           <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-110 transition-transform">
                 <Library size={24} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                 <h3 className="text-sm font-black uppercase tracking-tight leading-none mb-0.5">Ebook Islami</h3>
                 <p className="text-[8px] font-bold text-emerald-100/70 uppercase tracking-widest">Digital Shelf Library</p>
              </div>
           </div>
           <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform relative z-10">
              <ChevronRight size={14} strokeWidth={3} />
           </div>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="animate-in fade-in duration-500 space-y-3">
          
          {/* Saved Collection Button */}
          {savedBooksCount > 0 && (
            <button
                onClick={openSaved}
                className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-200 dark:shadow-none hover:scale-[1.01] transition-all text-left group mb-3 relative overflow-hidden"
            >
                {/* Islamic Pattern Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="islamic-pattern-saved" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M25 5 L31 15 L43 15 L36 25 L43 35 L31 35 L25 45 L19 35 L7 35 L14 25 L7 15 L19 15 Z" 
                        fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#islamic-pattern-saved)" />
                  </svg>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30">
                        <Save size={20} strokeWidth={3} className="text-white" />
                    </div>
                    <div>
                        <span className="font-black text-xs uppercase tracking-tight block">Koleksi Tersimpan</span>
                        <span className="text-[9px] text-blue-100 font-bold uppercase tracking-wider">{savedBooksCount} Kitab Dibedah</span>
                    </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform relative z-10">
                   <ArrowRight size={14} strokeWidth={3} className="text-white" />
                </div>
            </button>
          )}

          <div className="flex justify-between items-end px-1">
             <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-santri-gold animate-pulse" />
                Kategori Kitab
             </h3>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {STATIC_CATEGORIES.map((category, idx) => {
              const Icon = category.icon;
              const colors = [
                { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'group-hover:border-emerald-200' },
                { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'group-hover:border-blue-200' },
                { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'group-hover:border-amber-200' },
                { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', border: 'group-hover:border-rose-200' },
                { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'group-hover:border-indigo-200' },
                { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400', border: 'group-hover:border-cyan-200' },
                { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'group-hover:border-purple-200' },
                { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'group-hover:border-orange-200' },
                { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-400', border: 'group-hover:border-teal-200' },
              ];
              const color = colors[idx % colors.length];

              return (
                <button 
                  key={category.id} 
                  onClick={() => openCategory(category)}
                  className={`w-full flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md ${color.border} transition-all text-left group active:scale-[0.98]`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${color.bg} ${color.text} transition-transform group-hover:scale-110 duration-300`}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors flex items-center gap-1.5 mb-0.5">
                        {category.label}
                        {category.pro && (
                           <span className="bg-amber-400 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">PRO</span>
                        )}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-tight">
                            {category.desc}
                        </span>
                    </div>
                  </div>
                  <ChevronRight size={16} strokeWidth={3} className="text-slate-300 dark:text-slate-600 group-hover:text-santri-green dark:group-hover:text-santri-gold transition-colors" />
                </button>
              );
            })}
          </div>
      </div>

      {/* Content Report Modal */}
      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName="Pusat Kitab & Maktabah"
        contentSnippet="Koleksi Kitab Kuning"
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
    </div>
  );
};

export default KitabScreen;
