
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  School, 
  MapPin, 
  GraduationCap, 
  Star, 
  Phone, 
  Globe, 
  ExternalLink, 
  Loader2, 
  X,
  ChevronRight,
  Info,
  CheckCircle2,
  Sparkles,
  BookOpen,
  LayoutGrid,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import { recommendPesantrenAI } from '../services/geminiService';
import { usePrayer } from '../contexts/PrayerContext';

const PESANTREN_TYPES = ["Semua", "Modern", "Salaf", "Campuran"];
const FOCUS_AREAS = ["Semua", "Tahfidz", "Kitab Kuning", "Bahasa", "Entrepreneur", "Akademik"];

const PesantrenExplorerScreen: React.FC = () => {
  const navigate = useNavigate();
  const { locationName } = usePrayer();
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('Semua');
  const [selectedFocus, setSelectedFocus] = useState('Semua');
  const [isAswaja, setIsAswaja] = useState(true);
  const [isNearby, setIsNearby] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await recommendPesantrenAI(query, {
        type: selectedType === "Semua" ? undefined : selectedType,
        focus: selectedFocus === "Semua" ? undefined : selectedFocus,
        region: isNearby ? (locationName || "Area Sekitar Saya") : undefined,
        isAswaja
      });
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [selectedType, selectedFocus, isAswaja, isNearby]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 py-4 flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="font-black text-lg text-slate-800 dark:text-white leading-tight">Cari Pesantren</h1>
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Eksplorasi Global (Aswaja)</p>
        </div>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* Search & Filter Bar */}
        <div className="space-y-3">
          <div className="relative">
            <input 
              type="text"
              placeholder="Cari nama pesantren atau kota..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-12 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-800 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${showFilters ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <Filter size={18} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-4 pt-2"
              >
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tipe Pesantren</label>
                    <div className="flex flex-wrap gap-2">
                      {PESANTREN_TYPES.map(type => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${selectedType === type ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fokus Pembelajaran</label>
                    <div className="flex flex-wrap gap-2">
                      {FOCUS_AREAS.map(focus => (
                        <button
                          key={focus}
                          onClick={() => setSelectedFocus(focus)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${selectedFocus === focus ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
                        >
                          {focus}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setIsAswaja(!isAswaja)}
                      className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-100"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isAswaja ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                        <ShieldCheck size={16} />
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[10px] font-black text-slate-700 dark:text-slate-200 truncate">Aswaja</p>
                        <div className={`w-6 h-3 rounded-full relative transition-colors ${isAswaja ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                          <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${isAswaja ? 'left-3.5' : 'left-0.5'}`} />
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => setIsNearby(!isNearby)}
                      className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-100"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isNearby ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Navigation size={16} />
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[10px] font-black text-slate-700 dark:text-slate-200 truncate">Terdekat</p>
                        <div className={`w-6 h-3 rounded-full relative transition-colors ${isNearby ? 'bg-blue-500' : 'bg-slate-300'}`}>
                          <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${isNearby ? 'left-3.5' : 'left-0.5'}`} />
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {loading ? 'Mencari...' : `${results.length} Rekomendasi Pesantren`}
            </h3>
            <Sparkles className="text-amber-400 animate-pulse" size={16} />
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 flex flex-col items-center gap-4 text-center"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <GraduationCap className="text-indigo-200" size={24} />
                  </div>
                </div>
                <div>
                  <p className="font-black text-slate-800 dark:text-white">Menyusun Rekomendasi...</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI sedang mengevaluasi data pesantren</p>
                </div>
              </motion.div>
            ) : results.length > 0 ? (
              <div className="space-y-4 pb-12">
                {results.map((res, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                            <School size={24} />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">{res.name}</h4>
                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <MapPin size={10} /> {res.location}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-tighter">
                          {res.type}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Fokus</p>
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{res.focus}</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Kurikulum</p>
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{res.curriculum}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic border-l-4 border-indigo-200 dark:border-indigo-900 pl-3">
                        "{res.description}"
                      </p>

                      <div className="flex items-center gap-2 pt-2">
                        <a 
                          href={res.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20"
                        >
                          <ExternalLink size={14} /> Lokasi Maps
                        </a>
                        {res.website && (
                          <a 
                            href={res.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                          >
                            <Globe size={16} />
                          </a>
                        )}
                        {res.phone && (
                          <a 
                            href={`tel:${res.phone}`}
                            className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                          >
                            <Phone size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <LayoutGrid size={32} />
                </div>
                <div>
                  <p className="font-bold text-slate-500">Tidak ada hasil ditemukan</p>
                  <p className="text-[10px] text-slate-400 px-12">Coba ubah kriteria atau pastikan penulisan kota/nama benar.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PesantrenExplorerScreen;
