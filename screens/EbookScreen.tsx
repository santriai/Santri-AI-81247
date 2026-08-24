
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { subscribeUserBookmarks } from '../services/firebase';
import { 
  ArrowLeft, 
  Search, 
  BookOpen, 
  Download, 
  Star, 
  ChevronRight,
  Library,
  Book as BookIcon,
  ShoppingBag,
  Info,
  LayoutGrid,
  List as ListIcon,
  TrendingUp,
  Bookmark,
  Loader2,
  Bell
} from 'lucide-react';

import CustomLoader from '../components/CustomLoader';

interface Ebook {
  id: string;
  title: string;
  author: string;
  category: string;
  rating: number;
  downloads: string;
  coverColor: string;
  coverImage?: string;
  summary: string;
  isNew?: boolean;
  pdfUrl?: string;
  pages?: number;
  isKitab?: boolean;
}

const EBOOKS: Ebook[] = [
  {
    id: 'safinatun-najah',
    title: 'Terjemah Safinatun Najah',
    author: 'Syaikh Salim bin Sumair Al-Hadhrami',
    category: 'Kitab Kuning',
    rating: 4.9,
    downloads: '15k+',
    coverColor: 'from-blue-700 to-blue-900',
    coverImage: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgQq9J_A33DdQoOZL6KNPDlr-xN25iFcgT0aPkh3SMAnxGxnxfL8ZZ6hQGGBDwLVQsvurYiOVHHb2Ss8UPdVmyrE7w-raNULzJUeeaMSXi4sK8VNsHsP-cXNa8gfKyK_Zte2CTOMIsyWpTjVjfAqjNfoMZUNgG9EqJGxSnnkhyphenhyphenJXLWtg6UG9N_q0mzy5Us/s1060/safina.png',
    summary: 'Kitab dasar fiqih dan aqidah bagi pemula dalam madzhab Syafi\'i.',
    pdfUrl: 'https://archive.org/download/safinatun_najah/safinatun_najah.pdf',
    pages: 48,
    isKitab: true
  },
  {
    id: 'alfiyah-ibnu-malik',
    title: 'Alfiyah Ibnu Malik',
    author: 'Imam Ibnu Malik',
    category: 'Kitab Kuning',
    rating: 5.0,
    downloads: '25k+',
    coverColor: 'from-red-700 to-red-900',
    coverImage: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjAlCxsUVf_MusdozeI71AJiigXc_Wh18QZpxfxzTEkpeWlkMe6287tcCAu8BTpNCI9tEURmurYhZuZmSC4-zezUfSugUjyhrSYxq5OL7sme7zQAtC2UuajYU8pllnkJJxsvbO0u-MgHKgvnifD4no3qCdw1zzc-yDgF4-kRYOAxbSyJueo10yXsiB5-p8/w434-h640-rw/alfiyah2.png',
    summary: 'Kitab legendaris ilmu Nahwu dan Sharraf dalam bentuk nadhom (puisi) 1000 bait.',
    pdfUrl: 'https://archive.org/download/alfiyah-ibnu-malik/alfiyah.pdf',
    pages: 1000,
    isKitab: true
  },
  {
    id: 'fathul-muin',
    title: 'Terjemah Fathul Muin',
    author: 'Ahmad bin Abdul Aziz Al-Malibari',
    category: 'Kitab Kuning',
    rating: 5.0,
    downloads: '8k+',
    coverColor: 'from-green-700 to-green-900',
    coverImage: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh-if3-yFktRS8MPw_tGP46j8VnFxgn0_AU5deXVXHxu2M-dyBp3UPYoui8BO7OvlCYEBULW59Pm930Ix1cw5P3kjx8-tKt8UXXheJ-jdcW7UBQPAFiEsIAv2_9x64tW2BS-aodCKJ7kVa7vqaGxQGp4UxMLQTVTiFNgtHUrKTfM-YG9pCXmiO4Ysj84O0/s1640/fathulmuin.png',
    summary: 'Kitab fiqih tingkat menengah (mutawassith) yang menjadi rujukan utama pesantren.',
    pdfUrl: 'https://archive.org/download/TerjemahFathulMuin/Terjemah%20Fathul%20Muin.pdf',
    pages: 450,
    isKitab: true
  },
  {
    id: 'aqidatul-awam',
    title: 'Aqidatul Awam',
    author: 'Syeikh Ahmad Al-Marzuqi',
    category: 'Kitab Kuning',
    rating: 5.0,
    downloads: '20k+',
    coverColor: 'from-purple-700 to-purple-900',
    coverImage: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh2a0g_3W1_IqI1XqQ7E_k9zS3V1vR5_S5v3jR5_v3jR5_v3jR5_v3jR5_v3jR5_v3jR5_v3jR5_v3jR5_v3jR5_v3jR5_v3/s1600/aqidatul-awam.png',
    summary: 'Kitab nadhom tauhid paling dasar yang wajib dihafal setiap muslim.',
    pdfUrl: 'https://archive.org/download/aqidatul-awam/aqida.pdf',
    pages: 20,
    isKitab: true
  },
  {
    id: 'matan-al-ajrumiyah',
    title: 'Matan Al-Ajrumiyah',
    author: 'Ibnu Ajrum',
    category: 'Kitab Kuning',
    rating: 4.9,
    downloads: '18k+',
    coverColor: 'from-amber-700 to-amber-900',
    summary: 'Kitab dasar tata bahasa Arab (Nahwu) yang sangat sistematis.',
    pdfUrl: 'https://archive.org/download/ajrumiyah/ajrum.pdf',
    pages: 35,
    isKitab: true
  },
  {
    id: 'matan-abu-syuja',
    title: 'Matan Al-Ghayah wa At-Taqrib',
    author: 'Abu Syuja',
    category: 'Kitab Kuning',
    rating: 5.0,
    downloads: '12k+',
    coverColor: 'from-cyan-700 to-cyan-900',
    summary: 'Kitab ringkasan fiqih Syafi\'i paling lengkap dan padat.',
    pdfUrl: 'https://archive.org/download/taqrib/taqrib.pdf',
    pages: 80,
    isKitab: true
  },
  {
    id: 'ilmu-tajwid-praktis',
    title: 'Ilmu Tajwid Praktis',
    author: 'Muhammad Amri Amir',
    category: 'Tajwid',
    rating: 4.8,
    downloads: '1.5k',
    coverColor: 'from-blue-600 to-cyan-800',
    summary: 'Panduan belajar tajwid Al-Quran secara praktis dan mudah dipahami untuk pemula.',
    pdfUrl: 'https://drive.google.com/file/d/1eVCqFp4LmkPSlA7yZskmcwxtzabkFt6b/view',
    pages: 64,
    isKitab: false
  },
  {
    id: 'sullamut-taufiq',
    title: 'Sullamut Taufiq',
    author: 'Abdullah bin Husain bin Thahir',
    category: 'Kitab Kuning',
    rating: 5.0,
    downloads: '14k+',
    coverColor: 'from-green-800 to-green-950',
    coverImage: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiK0fLh3pLRsqu4eNSAXnsgIQXXOD8vN2Ce526o2-tzlHjQlmMPPmb2cMjVVIF4lXakz6G3RUhkESwqEf7SgTnx3_s1ShDjcEv6IFKnIUycgErG9upgjFmu_Ki9Wg5JbNDqGjYxiSwi7yMbYRG3Tfd2VQsCco7fDnt_R7bJ188K04Ip8G0X3bGdnQdzu6o/w448-h640-rw/sullam2.jpeg',
    summary: 'Kitab ringkas yang membahas dasar-dasar ilmu agama mulai dari Aqidah, Fiqih, hingga Tasawuf.',
    pages: 120,
    isKitab: true
  },
  {
    id: 'k1',
    title: 'Fathul Qorib Al-Mujib',
    author: 'Syaikh Muhammad bin Qasim al-Ghazi',
    category: 'Kitab Kuning',
    rating: 5.0,
    downloads: '10k+',
    coverColor: 'from-emerald-700 to-emerald-900',
    summary: 'Kitab fiqih madzhab Syafi\'i yang sangat masyhur sebagai syarah dari Matan Taqrib.',
    pdfUrl: 'https://archive.org/download/fathul_qorib/fathul_qorib.pdf',
    pages: 156,
    isKitab: true
  },
  {
    id: 'k3',
    title: 'Riyadhus Shalihin',
    author: 'Imam An-Nawawi',
    category: 'Kitab Kuning',
    rating: 5.0,
    downloads: '25k+',
    coverColor: 'from-teal-700 to-teal-900',
    summary: 'Kumpulan hadits-hadits shahih tentang perilaku dan akhlak seorang Muslim.',
    pdfUrl: 'https://archive.org/download/riyadhus_shalihin/riyadhus_shalihin.pdf',
    pages: 600,
    isKitab: true
  },
  {
    id: '1',
    title: 'Fiqih Kontemporer',
    author: 'Dr. Yusuf Qardhawi',
    category: 'Fiqih',
    rating: 4.8,
    downloads: '1.2k',
    coverColor: 'from-emerald-600 to-teal-800',
    summary: 'Membahas hukum Islam dalam konteks modern.',
    isNew: true,
    pdfUrl: 'https://example.com/fiqih.pdf',
    pages: 450
  },
  {
    id: '2',
    title: 'Adab Berinteraksi dengan Al-Quran',
    author: 'Imam An-Nawawi',
    category: 'Akhlak',
    rating: 4.9,
    downloads: '2.5k',
    coverColor: 'from-blue-600 to-indigo-800',
    summary: 'Panduan lengkap mengenai etika membaca dan mengamalkan Al-Quran.',
    pdfUrl: 'https://example.com/adab.pdf',
    pages: 180
  },
  {
    id: '3',
    title: 'Sejarah Peradaban Islam',
    author: 'Prof. Dr. Hamka',
    category: 'Sejarah',
    rating: 4.7,
    downloads: '900',
    coverColor: 'from-amber-600 to-orange-800',
    summary: 'Menelusuri jejak kegemilangan Islam dari masa ke masa.',
    pdfUrl: 'https://example.com/sejarah.pdf',
    pages: 320
  },
  {
    id: '4',
    title: 'Parenting Nabawiyah',
    author: 'Budi Ashari, Lc',
    category: 'Keluarga',
    rating: 4.8,
    downloads: '3.1k',
    coverColor: 'from-rose-600 to-pink-800',
    summary: 'Mendidik anak sesuai tuntunan Rasulullah SAW.',
    isNew: true,
    pdfUrl: 'https://example.com/parenting.pdf',
    pages: 210
  },
  {
    id: 'k4',
    title: 'Tafsir Jalalain',
    author: 'Jalaluddin al-Mahalli & Jalaluddin as-Suyuthi',
    category: 'Kitab Kuning',
    rating: 5.0,
    downloads: '12k+',
    coverColor: 'from-purple-700 to-purple-900',
    summary: 'Tafsir Al-Quran ringkas yang menjadi rujukan di seluruh dunia Islam.',
    pdfUrl: 'https://archive.org/download/tafsir_jalalain/tafsir_jalalain.pdf',
    pages: 450,
    isKitab: true
  },
  {
    id: 'k5',
    title: 'Al-Umm',
    author: 'Imam Asy-Syafi\'i',
    category: 'Kitab Kuning',
    rating: 5.0,
    downloads: '8k+',
    coverColor: 'from-emerald-800 to-slate-900',
    summary: 'Kitab induk (masterpiece) dalam madzhab Syafi\'i yang mencakup berbagai hukum Islam.',
    pdfUrl: 'https://archive.org/download/AlUmm-Syafii/al-umm.pdf',
    pages: 1200,
    isKitab: true
  },
  {
    id: 'k8',
    title: 'Ta\'limul Muta\'allim',
    author: 'Imam Az-Zarnuji',
    category: 'Kitab Kuning',
    rating: 4.9,
    downloads: '18k+',
    coverColor: 'from-amber-700 to-yellow-900',
    summary: 'Panduan etika menuntut ilmu bagi para santri dan pelajar.',
    pdfUrl: 'https://archive.org/download/talim_mutaallim/talim_mutaallim.pdf',
    pages: 112,
    isKitab: true
  }
];

const CATEGORIES = ['Semua', 'Kitab Kuning', 'Fiqih', 'Akhlak', 'Sejarah', 'Keluarga', 'Ekonomi', 'Hadits', 'Koleksi Saya'];

const EbookScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const unreadCount = useUnreadCount();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [isDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [savedBooks, setSavedBooks] = useState<Ebook[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    if (selectedCategory === 'Koleksi Saya' && user) {
      setLoadingSaved(true);
      const unsubscribe = subscribeUserBookmarks(user.uid, 'kitab', (data) => {
        const formatted: Ebook[] = data.map((b: any) => ({
          id: b.id || b.firestoreId,
          title: b.name || b.title || 'Tanpa Judul',
          author: b.author || 'Pustaka Santri',
          category: b.category || 'Kitab Kuning',
          rating: 5.0,
          downloads: '-',
          coverColor: 'from-slate-600 to-slate-800',
          summary: b.desc || b.summary || '',
          pdfUrl: b.pdfUrl || '#',
          pages: b.pages || 100,
          isKitab: true
        }));
        setSavedBooks(formatted);
        setLoadingSaved(false);
      });
      return () => unsubscribe();
    }
  }, [selectedCategory, user]);

  const displayBooks = selectedCategory === 'Koleksi Saya' ? savedBooks : EBOOKS;

  const filteredEbooks = displayBooks.filter(ebook => {
    const title = ebook.title || '';
    const author = ebook.author || '';
    const search = searchQuery || '';
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                         author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || selectedCategory === 'Koleksi Saya' || ebook.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openPdf = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleReadBook = (ebook: Ebook) => {
    navigate('/book-detail', { 
        state: { 
            title: ebook.title, 
            author: ebook.author,
            coverImage: ebook.coverImage
        } 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">

      {/* Header Banner */}
      <div className="bg-[#005a2b] dark:bg-emerald-950 pt-5 pb-4 px-4 rounded-b-[1.5rem] shadow-md mb-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-black text-white leading-none uppercase italic tracking-tight">E-books</h1>
            <p className="text-[9px] font-bold text-emerald-100/70 uppercase tracking-[0.2em] leading-none mt-1">Digital Library</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2 rounded-xl bg-white/10 text-white active:scale-95 transition-all">
              <Bookmark size={18} />
           </button>
           <button 
             onClick={() => navigate('/notifications')} 
             className="relative p-2 rounded-xl bg-white/10 text-white active:scale-95 transition-all flex items-center justify-center h-9 w-9"
              title="Notifikasi"
           >
              <span className="text-base leading-none select-none">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full border border-emerald-600 dark:border-slate-950 shadow-sm flex items-center justify-center px-1 text-[9px] font-bold text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
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

      <main className="max-w-2xl mx-auto px-4 pt-4">
        {/* Modern Search */}
        <div className="mb-6">
           <div className={`flex items-center gap-3 p-1.5 rounded-2xl border transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 focus-within:border-emerald-500' : 'bg-white border-slate-100 shadow-sm focus-within:border-emerald-500'}`}>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 shrink-0 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-[0.15] text-emerald-600 pointer-events-none">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                       <path d="M50 10 L60 30 L85 30 L70 50 L85 70 L60 70 L50 90 L40 70 L15 70 L30 50 L15 30 L40 30 Z" fill="currentColor" />
                    </svg>
                 </div>
                 <Search size={18} strokeWidth={2.5} className="relative z-10" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul atau penulis..."
                className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-slate-800 dark:text-white placeholder:text-slate-400"
              />
           </div>
        </div>

        {/* Categories Shelf */}
        <div className="mb-10">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pilih Kategori</h2>
           </div>
           <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2 flex items-center gap-2 ${
                    selectedCategory === cat 
                      ? 'bg-emerald-600 border-emerald-700 text-white shadow-xl shadow-emerald-600/30 -translate-y-1' 
                      : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200/50 dark:border-slate-800'
                  }`}
                >
                  {cat === 'Semua' && <Library size={12} />}
                  {cat}
                </button>
              ))}
           </div>
        </div>

        {/* Dynamic Display */}
        <div className="mb-12">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
                    <TrendingUp size={16} />
                 </div>
                 <h2 className="text-[11px] font-black uppercase tracking-tight text-slate-800 dark:text-white italic">Koleksi Pilihan</h2>
              </div>
              
              <div className="flex gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl">
                 {(['grid', 'list', 'compact'] as const).map((mode) => (
                   <button 
                     key={mode}
                     onClick={() => setViewMode(mode)}
                     className={`p-1.5 rounded-lg transition-all ${viewMode === mode ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'text-slate-300'}`}
                   >
                      {mode === 'grid' && <LayoutGrid size={16} />}
                      {mode === 'list' && <ListIcon size={16} />}
                      {mode === 'compact' && <BookOpen size={16} />}
                   </button>
                 ))}
              </div>
           </div>

           {selectedCategory === 'Kitab Kuning' && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-between"
             >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-600 shadow-sm">
                      <Library size={20} />
                   </div>
                   <div>
                      <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">E-Book Kitab Kuning</h4>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Koleksi Terbatas</p>
                   </div>
                </div>
                <button 
                  onClick={() => navigate('/kitab')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                   Cari Lengkap
                </button>
             </motion.div>
           )}

           {loadingSaved ? (
             <div className="flex flex-col items-center justify-center py-20">
               <CustomLoader message="Memuat Koleksi Ebook Anda..." />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Koleksi Anda...</p>
             </div>
           ) : filteredEbooks.length > 0 ? (
             <motion.div 
               layout
               className={
                 viewMode === 'grid' ? "grid grid-cols-2 gap-4" : 
                 viewMode === 'list' ? "space-y-3" : 
                 "grid grid-cols-1 gap-2"
               }
             >
                <AnimatePresence mode="popLayout">
                  {filteredEbooks.map((ebook, idx) => (
                    <motion.div
                      layout
                      key={ebook.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      {viewMode === 'compact' ? (
                        /* COMPACT VIEW */
                        <button
                          onClick={() => handleReadBook(ebook)}
                          className="w-full flex items-center justify-between p-3 py-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl group transition-all"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-8 h-8 rounded-lg ${ebook.coverImage ? '' : `bg-gradient-to-br ${ebook.coverColor}`} flex items-center justify-center text-white shrink-0 overflow-hidden`}>
                               {ebook.coverImage ? (
                                 <img src={ebook.coverImage} alt={ebook.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                               ) : (
                                 <BookIcon size={14} />
                               )}
                            </div>
                            <div className="text-left overflow-hidden">
                               <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase truncate">{ebook.title}</h4>
                               <p className="text-[9px] font-bold text-slate-400 truncate tracking-tight">{ebook.author}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                             <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-emerald-600 uppercase">{ebook.category}</span>
                                <span className="text-[7px] font-bold text-slate-300 uppercase">{ebook.pages} Hal</span>
                             </div>
                             <ChevronRight size={14} className="text-slate-300" />
                          </div>
                        </button>
                      ) : (
                        /* GRID & LIST VIEW */
                        <div className={`relative group ${viewMode === 'grid' ? 'flex flex-col' : 'flex items-center gap-4 p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-[1.5rem]'}`}>
                          {/* Cover Area */}
                          <div 
                            onClick={() => handleReadBook(ebook)}
                            className={`relative cursor-pointer overflow-hidden rounded-[1.2rem] shadow-xl transition-all group-hover:-translate-y-1 ${ebook.coverImage ? 'bg-slate-100' : `bg-gradient-to-br ${ebook.coverColor}`} ${viewMode === 'grid' ? 'aspect-[3/4] mb-3' : 'w-24 h-32 shrink-0'}`}
                          >
                             {ebook.coverImage ? (
                               <img src={ebook.coverImage} alt={ebook.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                             ) : (
                               <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col items-center justify-center text-center">
                                  <BookIcon size={20} className="text-white/40 mb-1" />
                                  <h4 className="text-[8px] font-black text-white/90 uppercase tracking-widest line-clamp-2">{ebook.title}</h4>
                               </div>
                             )}
                             {ebook.isNew && <div className="absolute top-3 right-3 px-2 py-0.5 bg-amber-400 text-amber-950 text-[8px] font-black rounded-full">NEW</div>}
                          </div>

                          {/* Content Area */}
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-1">
                                <span className="text-[7px] font-black bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 px-1.5 py-0.5 rounded-full uppercase truncate">
                                   {ebook.category}
                                </span>
                                <div className="flex items-center gap-0.5">
                                   <Star size={8} className="text-amber-400" fill="currentColor" />
                                   <span className="text-[8px] font-black text-slate-500">{ebook.rating}</span>
                                </div>
                             </div>
                             <h4 
                                onClick={() => handleReadBook(ebook)}
                                className="font-black text-[12px] text-slate-800 dark:text-white truncate uppercase italic mb-0.5 cursor-pointer hover:text-emerald-600 transition-colors"
                              >
                                {ebook.title}
                              </h4>
                             <p className="text-[9px] font-bold text-slate-400 truncate mb-2">{ebook.author}</p>
                             
                             <div className="flex items-center gap-2">
                               <button 
                                 onClick={() => handleReadBook(ebook)}
                                 className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-emerald-700 transition-colors"
                               >
                                 <BookOpen size={10} /> Baca Kitab
                               </button>
                               <button className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                 <Download size={12} />
                               </button>
                             </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
             </motion.div>
           ) : (
             <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-400 relative">
                   <Search size={32} />
                   <motion.div 
                     animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className="absolute inset-0 bg-emerald-500/10 rounded-[2rem]"
                   />
                </div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2">Ebook Tidak Ditemukan</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose max-w-[200px] mx-auto">
                   Coba gunakan kata kunci lain atau pilih kategori yang berbeda
                </p>
             </div>
           )}
        </div>

        {/* Community Highlight Section */}
        <div className="mt-12 p-1 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 overflow-hidden group">
           <div className="p-8 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
              
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-600/20 mb-6 group-hover:rotate-12 transition-transform">
                 <BookOpen size={32} />
              </div>

              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter leading-none mb-3">
                 Perluas Cakrawala <br/> <span className="text-emerald-600">Ilmu Pengetahuan</span>
              </h2>
              
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mb-8">
                 Dapatkan akses ke materi-materi eksklusif yang dikurasi langsung oleh para asatidz dan cendekiawan muslim.
              </p>

              <div className="flex gap-3 w-full">
                 <button 
                   onClick={() => navigate('/kitab')}
                   className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                 >
                    Pustaka Kitab
                 </button>
                 <button 
                   onClick={() => navigate('/radio')}
                   className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all"
                 >
                   Podcast Ilmu
                 </button>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default EbookScreen;

