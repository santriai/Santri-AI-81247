
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Sparkles, 
  ShieldAlert, 
  Heart, 
  ArrowRight, 
  Info, 
  HelpCircle,
  X,
  Loader2,
  BookOpen,
  Scale,
  RefreshCw
} from 'lucide-react';
import { analyzeSinAndRepentance } from '../services/geminiService';

const COMMON_SINS = [
  "Zinah", "Meninggalkan Sholat", "Ghibah / Menggunjing", "Mencuri", 
  "Tidak Menutup Aurat", "Berbohong", "Durhaka Orang Tua", "Riba"
];

const IslamicPattern: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}>
      <svg 
        className="w-full h-full fill-current"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="islamic-grid-muhasabah" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" />
            <path d="M12 5 L19 12 L12 19 L5 12 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
            <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#islamic-grid-muhasabah)" />
      </svg>
    </div>
  );
};

const MuhasabahScreen: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (forcedQuery?: string) => {
    const searchQuery = forcedQuery || query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeSinAndRepentance(searchQuery);
      setResult(data);
      if (forcedQuery) setQuery(forcedQuery);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans text-left">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md relative overflow-hidden px-4 py-4 flex items-center gap-3">
        <IslamicPattern className="text-white opacity-[0.14]" />
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 text-white/90 hover:text-white rounded-full relative z-10 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="relative z-10">
          <h1 className="font-extrabold text-lg text-white leading-tight">Ruang Muhasabah</h1>
          <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest">Taubat & Perbaikan Diri</p>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        {/* Intro Card */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
              Bimbingan Taubat <Sparkles className="text-amber-400" size={24} />
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              "Setiap anak Adam pasti pernah berbuat salah, dan sebaik-baik orang yang bersalah adalah yang bertaubat." (HR. Tirmidzi)
            </p>
            <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/10 flex items-start gap-3">
              <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-300 leading-relaxed italic">
                Gunakan ruang ini untuk mencari tahu hukum suatu perbuatan dan langkah-langkah bertaubat yang benar sesuai syariat. Allah Maha Pengampun.
              </p>
            </div>
          </div>
          <Heart className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 text-rose-500 rotate-12" />
        </div>

        {/* Search Section */}
        <div className="space-y-4">
          {/* Quick Tags */}
          <div className="flex flex-wrap gap-2 px-1">
            {COMMON_SINS.map((sin) => (
              <button
                key={sin}
                onClick={() => handleSearch(sin)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 text-[10px] font-black text-slate-500 rounded-full transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30 uppercase tracking-widest"
              >
                {sin}
              </button>
            ))}
          </div>

          {/* Search Bar Input */}
          <div className="relative">
            <input 
              type="text"
              placeholder="Apa yang ingin Anda konsultasikan? (Misal: Berbohong, Ghibah, dll)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-bold text-slate-800 dark:text-white shadow-sm focus:ring-2 focus:ring-rose-500 transition-all outline-none"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            {query && (
              <button 
                onClick={() => { setQuery(''); setResult(null); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <button 
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="w-full py-4 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-700 hover:to-red-800 text-white font-black text-sm rounded-[1.5rem] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-rose-600/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Menganalisis Kitab...</span>
              </>
            ) : (
              <>
                <Scale size={18} />
                <span>Cek Hukum & Cara Taubat</span>
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {result.isFound ? (
                <>
                  {/* Basic Info */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{result.sinName}</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${result.category.toLowerCase().includes('besar') ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
                         Dosa {result.category}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20">
                        <div className="flex items-center gap-2 mb-2 text-rose-600">
                           <ShieldAlert size={16} />
                           <h4 className="text-[10px] font-black uppercase tracking-widest">Hukuman & Konsekuensi</h4>
                        </div>
                        <p className="text-xs text-rose-800 dark:text-rose-300 font-medium leading-relaxed">
                          {result.consequences}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-2 text-slate-500">
                           <BookOpen size={16} />
                           <h4 className="text-[10px] font-black uppercase tracking-widest">Dalil Ancaman</h4>
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-400 font-medium italic leading-relaxed">
                          "{result.dalilPunishment}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Repentance & Mercy */}
                  <div className="bg-emerald-600 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-2">
                        <RefreshCw size={24} className="text-emerald-300" />
                        <h3 className="text-xl font-black">Langkah Bertaubat</h3>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                        <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap">
                          {result.repentanceMethod}
                        </p>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/20 rounded-full">
                           <Heart size={20} className="fill-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black mb-1">Maha Luas Ampunan-Nya</h4>
                          <p className="text-[11px] text-emerald-100 italic leading-relaxed">
                            "{result.dalilMercy}"
                          </p>
                        </div>
                      </div>
                    </div>
                    <Sparkles className="absolute -left-4 -top-4 w-32 h-32 opacity-10" />
                  </div>

                  <button 
                    onClick={() => { setQuery(''); setResult(null); }}
                    className="w-full py-4 text-slate-400 hover:text-slate-600 font-bold text-sm flex items-center justify-center gap-2"
                  >
                    Konsultasi Ke Kasus Lain <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                     <HelpCircle size={32} className="text-slate-300" />
                  </div>
                  <h4 className="font-black text-slate-800 dark:text-white mb-2">Kasus Tidak Spesifik</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Mohon masukkan detail kesalahan atau perilaku yang ingin dikonsultasikan hukumnya secara lebih jelas.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MuhasabahScreen;
