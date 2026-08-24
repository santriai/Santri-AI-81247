
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, Book, List, Hash, Sparkles, Loader2, ChevronRight, BookOpen } from 'lucide-react';
import { advancedKitabSearch } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';
import CustomLoader from '../components/CustomLoader';

const AdvancedKitabSearchScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  
  const [keyword, setKeyword] = useState('');
  const [kitab, setKitab] = useState('');
  const [chapter, setChapter] = useState('');
  const [page, setPage] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const state = location.state as any;
    if (state) {
      if (state.initialKeyword) setKeyword(state.initialKeyword);
      if (state.initialChapter) setChapter(state.initialChapter);
      if (state.initialPage) setPage(state.initialPage);
      
      // Auto trigger if initial values present
      if (state.initialKeyword || state.initialChapter || state.initialPage) {
        // We use a timeout or a separate function to ensure state is set
        const performInitialSearch = async () => {
          setLoading(true);
          try {
            const searchResults = await advancedKitabSearch({
              keyword: state.initialKeyword || '',
              kitab: '',
              chapter: state.initialChapter || '',
              page: state.initialPage || ''
            });
            setResults(searchResults);
          } catch (e) {
            console.error(e);
          } finally {
            setLoading(false);
          }
        };
        performInitialSearch();
      }
    }
  }, [location.state]);

  const handleSearch = async () => {
    if (!keyword && !chapter && !page) {
      showToast("Masukkan setidaknya satu parameter pencarian.", "info");
      return;
    }

    setLoading(true);
    try {
      const searchResults = await advancedKitabSearch({
        keyword,
        kitab,
        chapter,
        page
      });
      setResults(searchResults);
      if (searchResults.length === 0) {
        showToast("Tidak ada hasil yang ditemukan.", "info");
      }
    } catch (error) {
      console.error(error);
      showToast("Gagal melakukan pencarian.", "error");
    } finally {
      setLoading(false);
    }
  };

  const goToResult = (item: any) => {
    navigate('/result', {
      state: {
        mode: 'kitab',
        query: item.bab || item.keyword || keyword,
        source: item.kitab || kitab || 'Umum',
        originalText: item.ibarah,
        data: item // Pass the full item as data to avoid re-analysis if possible
      }
    });
  };

  return (
    <div className="pb-24 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="sticky top-0 z-50 bg-[#005a2b] dark:bg-emerald-950 text-white shadow-md pt-5 pb-4 px-4 rounded-b-[1.5rem] flex items-center justify-between gap-3 transition-colors mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/95 hover:text-white rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="font-bold text-white text-base md:text-lg leading-tight">Pencarian Lanjutan</h2>
            <p className="text-[10px] text-emerald-100">Filter Kitab Kuning</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kata Kunci</label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 border border-transparent focus-within:border-santri-green/30 transition-all">
              <Search size={18} className="text-slate-400 mr-3" />
              <input 
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Contoh: Niat Sholat, Haid, Zakat..."
                className="flex-1 bg-transparent py-4 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Kitab (Opsional)</label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 border border-transparent focus-within:border-santri-green/30 transition-all">
              <Book size={18} className="text-slate-400 mr-3" />
              <input 
                type="text"
                value={kitab}
                onChange={(e) => setKitab(e.target.value)}
                placeholder="Contoh: Fathul Qorib, Safinatun Najah..."
                className="flex-1 bg-transparent py-4 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bab</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 border border-transparent focus-within:border-santri-green/30 transition-all">
                <List size={18} className="text-slate-400 mr-3" />
                <input 
                  type="text"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="Bab Sholat..."
                  className="flex-1 bg-transparent py-4 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Halaman</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 border border-transparent focus-within:border-santri-green/30 transition-all">
                <Hash size={18} className="text-slate-400 mr-3" />
                <input 
                  type="text"
                  value={page}
                  onChange={(e) => setPage(e.target.value)}
                  placeholder="Hal 15..."
                  className="flex-1 bg-transparent py-4 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-santri-green hover:bg-santri-green-dark text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-green-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            Cari Mendalam
          </button>
        </div>

        {loading ? (
          <div className="py-12">
            <CustomLoader message="Sedang menyisir Maktabah Digital..." />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hasil Pencarian ({results.length})</h3>
            </div>
            <div className="grid gap-3">
              {results.map((res, idx) => (
                <button 
                  key={idx}
                  onClick={() => goToResult(res)}
                  className="w-full text-left bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-santri-green/30 transition-all group flex gap-4"
                >
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
                    <BookOpen size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-santri-green transition-colors truncate pr-4">{res.bab || 'Tanpa Bab'}</h4>
                      <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full shrink-0">Hal {res.halaman || '-'}</span>
                    </div>
                    <p className="text-[10px] text-santri-green dark:text-santri-gold font-bold mb-2 truncate italic">{res.kitab}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl italic">
                      "{res.ibarah.substring(0, 100)}..."
                    </p>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <ChevronRight size={20} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : !loading && results.length === 0 && (keyword || chapter || page) ? (
          <div className="py-20 text-center text-slate-400">
            <Search size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm font-medium">Klik "Cari Mendalam" untuk memulai.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdvancedKitabSearchScreen;
