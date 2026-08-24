
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { 
  ArrowLeft, 
  Search, 
  Trophy, 
  History, 
  ChevronRight, 
  Scroll, 
  User, 
  BookOpen, 
  Clock,
  Sparkles,
  RefreshCw,
  Library
} from 'lucide-react';
import { generateScholarsByCentury } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';

const CENTURIES = Array.from({ length: 15 }, (_, i) => i + 1).reverse(); // 15H to 1H

const ScholarTimelineScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const [selectedCentury, setSelectedCentury] = useState<number>(15);
  const [scholars, setScholars] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchScholars(selectedCentury);
  }, [selectedCentury]);

  const fetchScholars = async (cent: number) => {
    setLoading(true);
    try {
      const data = await generateScholarsByCentury(cent);
      setScholars(data);
    } catch (e) {
      showToast("Gagal memuat daftar ulama.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleScholarClick = (name: string) => {
    navigate('/biography', { state: { author: name } });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/biography', { state: { author: searchQuery } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-[#005a2b] dark:bg-emerald-950 pt-5 pb-4 px-4 rounded-b-[1.5rem] shadow-md sticky top-0 z-50 transition-colors">
        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 overflow-hidden">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white active:scale-90 transition-transform flex-shrink-0"
            >
              <ArrowLeft size={20}/>
            </button>
            <div className="overflow-hidden">
              <h1 className="text-base md:text-lg font-black text-white leading-tight truncate">Biografi Ulama</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-100 truncate">Dari Abad ke Abad Penjaga Cahaya</p>
            </div>
          </div>

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

      <div className="px-5 mt-6 max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-emerald-100 dark:border-emerald-800/50 shadow-xl shadow-emerald-50/50 dark:shadow-none p-5 mb-8 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 leading-none">
              <Search size={12} strokeWidth={3} className="text-emerald-500" />
              Cari Biografi Ulama
            </h3>
          </div>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Cari Nama Ulama (mis: Imam Ghazali)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-20 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none font-medium"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              Cari
            </button>
          </div>
        </form>
        {/* Century Selector */}
        <div className="mb-8 overflow-hidden">
          <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Clock size={12} /> Pilih Abad Hijriyah
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {CENTURIES.map((cent) => (
              <button
                key={cent}
                onClick={() => setSelectedCentury(cent)}
                className={`shrink-0 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-sm ${
                  selectedCentury === cent 
                    ? 'bg-indigo-600 text-white scale-105 shadow-indigo-200 dark:shadow-none' 
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800'
                }`}
              >
                Abad {cent} H
              </button>
            ))}
          </div>
        </div>

        {/* Scholar List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
               Tokoh Ulama Abad ke-{selectedCentury}
               <Sparkles size={16} className="text-amber-400" />
            </h3>
            {loading && <RefreshCw size={16} className="text-indigo-500 animate-spin" />}
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
               <motion.div 
                 key="loading"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="py-12 flex flex-col items-center justify-center gap-4"
               >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900 animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Scroll size={24} className="text-indigo-500" />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-400 italic">Menelusuri Catatan Sejarah...</p>
               </motion.div>
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-4"
              >
                {scholars.map((scholar, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleScholarClick(scholar.name)}
                    className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm text-left group hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex gap-4 items-start">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-110 transition-transform">
                          <User size={24} />
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-800 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">{scholar.name}</h4>
                          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block mt-1">{scholar.specialty}</span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                            {scholar.summary}
                          </p>
                          <div className="flex items-center gap-3 mt-3">
                             <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                <Clock size={12} /> {scholar.birthDeath}
                             </div>
                             <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600">
                                <BookOpen size={12} /> {scholar.famousWork}
                             </div>
                          </div>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-500 transition-colors shrink-0" />
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info Card */}
        {!loading && scholars.length > 0 && (
          <div className="mt-8 bg-indigo-50 dark:bg-indigo-950/20 p-6 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-4">
             <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                <Library size={20} />
             </div>
             <div>
                <h4 className="font-black text-indigo-900 dark:text-indigo-300 text-sm mb-1 uppercase tracking-widest">Wawasan Abad ke-{selectedCentury}</h4>
                <p className="text-[11px] text-indigo-700/70 dark:text-indigo-400 leading-relaxed italic border-l-2 border-indigo-200 dark:border-indigo-800 pl-3 py-1">
                  Klik pada nama ulama untuk mempelajari biografi lengkap, daftar guru, murid, dan karya-karya beliau yang diwariskan untuk umat Islam hari ini.
                </p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarTimelineScreen;
