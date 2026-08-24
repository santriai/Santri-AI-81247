
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Info, 
  Calendar,
  ChevronRight,
  ChevronLeft,
  Quote,
  Target,
  Trophy,
  History,
  Search,
  X,
  Loader2,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { updateWorshipLog, subscribeToWorshipLog, WorshipLog } from '../services/firebase';
import { searchWorshipAct } from '../services/geminiService';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';

interface WorshipItem {
  id: string;
  name: string;
  category: 'wajib' | 'sunnah';
  fadilah: string;
  source: string;
  points: number;
}

const WORSHIP_DATABASE: WorshipItem[] = [
  { 
    id: 'shubuh', 
    name: 'Shalat Shubuh', 
    category: 'wajib', 
    fadilah: 'Barangsiapa yang shalat subuh maka ia berada dalam jaminan Allah.', 
    source: 'HR. Muslim',
    points: 100
  },
  { 
    id: 'zhuhur', 
    name: 'Shalat Zhuhur', 
    category: 'wajib', 
    fadilah: 'Amalan yang paling dicintai Allah adalah shalat pada waktunya.', 
    source: 'HR. Bukhari',
    points: 100
  },
  { 
    id: 'ashar', 
    name: 'Shalat Ashar', 
    category: 'wajib', 
    fadilah: 'Barangsiapa yang shalat bardain (subuh dan ashar) maka ia masuk syurga.', 
    source: 'HR. Bukhari',
    points: 100
  },
  { 
    id: 'maghrib', 
    name: 'Shalat Maghrib', 
    category: 'wajib', 
    fadilah: 'Shalat adalah tiang agama.', 
    source: 'Hadits',
    points: 100
  },
  { 
    id: 'isya', 
    name: 'Shalat Isya', 
    category: 'wajib', 
    fadilah: 'Barangsiapa shalat isya berjamaah, maka seolah-olah ia shalat separuh malam.', 
    source: 'HR. Muslim',
    points: 100
  },
  { 
    id: 'tahajjud', 
    name: 'Shalat Tahajjud', 
    category: 'sunnah', 
    fadilah: 'Shalat yang paling utama setelah shalat fardhu adalah shalat malam.', 
    source: 'HR. Muslim',
    points: 200
  },
  { 
    id: 'dhuha', 
    name: 'Shalat Dhuha', 
    category: 'sunnah', 
    fadilah: 'Mencukupi sedekah bagi seluruh persendian tubuh.', 
    source: 'HR. Muslim',
    points: 150
  },
  { 
    id: 'rawatib', 
    name: 'Sunnah Rawatib', 
    category: 'sunnah', 
    fadilah: 'Allah akan membangunkan sebuah rumah di surga bagi yang shalat sunnah 12 rakaat sehari semalam.', 
    source: 'HR. Muslim',
    points: 120
  },
  { 
    id: 'tilawah', 
    name: 'Tilawah Al-Quran', 
    category: 'sunnah', 
    fadilah: 'Satu huruf Al-Quran dibalas dengan 10 kebaikan.', 
    source: 'HR. Tirmidzi',
    points: 150
  },
  { 
    id: 'dzikir', 
    name: 'Dzikir Pagi/Petang', 
    category: 'sunnah', 
    fadilah: 'Hati menjadi tenang dengan mengingat Allah.', 
    source: 'QS. Ar-Ra\'d: 28',
    points: 100
  },
  { 
    id: 'sedekah', 
    name: 'Sedekah', 
    category: 'sunnah', 
    fadilah: 'Sedekah dapat menghapus dosa sebagaimana air memadamkan api.', 
    source: 'HR. Tirmidzi',
    points: 150
  }
];

const MutabaahScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [log, setLog] = useState<WorshipLog | null>(null);
  const [selectedFadilah, setSelectedFadilah] = useState<WorshipItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  // AI Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [isSearchingAI, setIsSearchingAI] = useState(false);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsubscribe = subscribeToWorshipLog(user.uid, dateStr, (data) => {
      setLog(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, dateStr]);

  const handleToggle = async (worshipId: string) => {
    if (!user) return;
    const currentValue = log?.completed?.[worshipId] || false;
    try {
      await updateWorshipLog(user.uid, dateStr, worshipId, !currentValue);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingAI(true);
    setSearchResult(null);
    try {
      const result = await searchWorshipAct(searchQuery);
      setSearchResult(result);
    } catch (e) {
      console.error("AI Search Failed:", e);
    } finally {
      setIsSearchingAI(false);
    }
  };

  const completedCount = WORSHIP_DATABASE.filter(item => log?.completed?.[item.id]).length;
  const progressPercent = (completedCount / WORSHIP_DATABASE.length) * 100;

  const totalPointsAwarded = WORSHIP_DATABASE.reduce((acc, item) => {
    return log?.completed?.[item.id] ? acc + item.points : acc;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="font-black text-lg text-slate-800 dark:text-white leading-tight">Jurnal Amal</h1>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Istiqomah & Berkah</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
             <Trophy size={14} className="text-emerald-500" />
             <span className="text-xs font-black text-emerald-600">+{totalPointsAwarded} Pahala</span>
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
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        {/* Date Selector */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <button 
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-sm font-black text-slate-800 dark:text-white">
              {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: id })}
            </span>
            {isSameDay(selectedDate, new Date()) && (
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Hari Ini</span>
            )}
          </div>
          <button 
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* AI Worship Search */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 px-1">
             <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
               <Sparkles size={16} className="text-indigo-500" />
             </div>
             <div>
               <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Tanya Amal Lainnya</h3>
               <p className="text-[10px] font-bold text-slate-400">Cari amalan yang tidak ada di list harian</p>
             </div>
          </div>
          
          <div className="relative">
            <input 
              type="text"
              placeholder="Contoh: Shalat Istikharah, Shalat Awwabin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setSearchResult(null); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <button 
            onClick={handleAISearch}
            disabled={isSearchingAI || !searchQuery.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isSearchingAI ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Mencari dalam Kitab...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Cari Fadilah & Tata Cara</span>
              </>
            )}
          </button>

          <AnimatePresence>
            {searchResult && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4"
              >
                {searchResult.isFound ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="font-black text-emerald-700 dark:text-emerald-400">{searchResult.name}</h4>
                          <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase">+{searchResult.points} Pahala</span>
                       </div>
                       <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed italic">
                         "{searchResult.fadilah}"
                       </p>
                       <p className="mt-2 text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest">— {searchResult.source}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-indigo-500" />
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cara Mengamalkan</h5>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                        {searchResult.howTo}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-2">
                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                       <X size={24} />
                    </div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white">Ibadah Tidak Ditemukan</h4>
                    <p className="text-xs text-slate-400">Maaf, kami tidak menemukan amalan tersebut dalam referensi kami. Coba kata kunci lain.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress Stats */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-500 rounded-[2.5rem] p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-2xl font-black">{completedCount}/{WORSHIP_DATABASE.length}</h3>
                <p className="text-xs opacity-80 font-bold uppercase tracking-widest">Amalan Selesai</p>
              </div>
              <div className="text-right">
                 <h4 className="text-lg font-black">{Math.round(progressPercent)}%</h4>
                 <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Progress Hari Ini</p>
              </div>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
               <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full bg-white rounded-full"
               />
            </div>
            <p className="mt-4 text-sm font-medium leading-relaxed italic opacity-90">
              "Amalan yang paling dicintai Allah adalah amalan yang kontinyu (istiqomah) walaupun sedikit." (HR. Muslim)
            </p>
          </div>
          <Target className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
        </motion.div>

        {/* Worship Categories */}
        <div className="space-y-6">
          {/* Mandatory */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
              <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">Amalan Wajib</h2>
            </div>
            <div className="grid gap-3">
              {WORSHIP_DATABASE.filter(item => item.category === 'wajib').map((item) => (
                <WorshipCard 
                  key={item.id} 
                  item={item} 
                  isCompleted={log?.completed?.[item.id] || false}
                  onToggle={() => handleToggle(item.id)}
                  onInfo={() => setSelectedFadilah(item)}
                />
              ))}
            </div>
          </section>

          {/* Sunnah */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
              <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">Amalan Sunnah</h2>
            </div>
            <div className="grid gap-3">
              {WORSHIP_DATABASE.filter(item => item.category === 'sunnah').map((item) => (
                <WorshipCard 
                  key={item.id} 
                  item={item} 
                  isCompleted={log?.completed?.[item.id] || false}
                  onToggle={() => handleToggle(item.id)}
                  onInfo={() => setSelectedFadilah(item)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Fadilah Modal */}
      <AnimatePresence>
        {selectedFadilah && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFadilah(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sparkles size={120} />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className={`p-4 rounded-3xl ${selectedFadilah.category === 'wajib' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                  <Sparkles size={32} />
                </div>
                <div>
                   <h3 className="font-black text-xl text-slate-800 dark:text-white">{selectedFadilah.name}</h3>
                   <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${selectedFadilah.category === 'wajib' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                     Fadilah {selectedFadilah.category}
                   </span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative mb-8">
                <Quote size={24} className="text-slate-200 dark:text-slate-700 absolute -top-2 -left-2" />
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">
                  "{selectedFadilah.fadilah}"
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">— {selectedFadilah.source}</span>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-xs text-slate-500">
                   <Info size={16} className="text-emerald-500" />
                   <p>Mengetahui keutamaan amal dapat meningkatkan motivasi dan keikhlasan dalam beribadah.</p>
                 </div>
                 <button 
                  onClick={() => setSelectedFadilah(null)}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white font-black rounded-2xl active:scale-95 transition-transform"
                 >
                   Mengerti
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface WorshipCardProps {
  item: WorshipItem;
  isCompleted: boolean;
  onToggle: () => void;
  onInfo: () => void;
}

const WorshipCard: React.FC<WorshipCardProps> = ({ item, isCompleted, onToggle, onInfo }) => {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      className={`p-4 rounded-[2rem] border transition-all flex items-center justify-between ${
        isCompleted 
        ? 'bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/30 shadow-sm' 
        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-80'
      }`}
    >
      <div className="flex items-center gap-4 flex-1" onClick={onToggle}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
          isCompleted 
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
        }`}>
          {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </div>
        <div className="flex-1">
          <h4 className={`text-sm font-black transition-colors ${isCompleted ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
            {item.name}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">+{item.points} Pahala</span>
          </div>
        </div>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onInfo();
        }}
        className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-emerald-500 transition-colors"
      >
        <Info size={18} />
      </button>
    </motion.div>
  );
};

export default MutabaahScreen;
