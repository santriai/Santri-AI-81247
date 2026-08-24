
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Settings, 
  Type, 
  Play, 
  Pause, 
  Volume2, 
  ChevronRight, 
  ChevronLeft,
  BookOpen,
  Info,
  RotateCcw,
  Languages
} from 'lucide-react';
import { getSurahDetail } from '../services/quranApiService';
import { Surah, Ayah } from '../types';

const YasinScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [surah, setSurah] = useState<Surah | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<'base' | 'lg' | 'xl'>('lg');
  const [showMenu, setShowMenu] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showLatin, setShowLatin] = useState(true);

  useEffect(() => {
    const fetchYasin = async () => {
      setLoading(true);
      const data = await getSurahDetail(36);
      setSurah(data);
      setLoading(false);
    };
    fetchYasin();
  }, []);

  const fontSizeClasses = {
    base: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Memuat Surah Yasin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#005a2b] dark:bg-emerald-950 text-white pt-5 pb-4 px-4 rounded-b-[1.5rem] shadow-md flex items-center justify-between gap-3 transition-colors mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 -ml-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base md:text-lg font-black uppercase tracking-widest leading-none">Surah Yasin</h1>
            <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-tighter mt-1">Makkah • 83 Ayat</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="p-2 rounded-xl transition-colors hover:bg-white/10 text-white"
          >
            {isDarkMode ? <Sun size={20} className="text-amber-300" /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className={`p-2 rounded-xl transition-colors hover:bg-white/10 ${showMenu ? 'bg-white/20 text-white' : 'text-white'}`}
          >
            <Settings size={20} />
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
      </header>

      {/* Settings Panel */}
      <AnimatePresence>
        {showMenu && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`overflow-hidden border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
          >
            <div className="p-4 space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase">
                  <Type size={14} /> Ukuran Huruf
                </div>
                <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {(['base', 'lg', 'xl'] as const).map((size) => (
                    <button 
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${
                        fontSize === size 
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'text-slate-400'
                      }`}
                    >
                      {size === 'base' ? 'Kecil' : size === 'lg' ? 'Normal' : 'Besar'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                 <button 
                   onClick={() => setShowLatin(!showLatin)}
                   className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-2xl text-[10px] font-black uppercase transition-all ${showLatin ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}
                 >
                   Latin {showLatin ? 'ON' : 'OFF'}
                 </button>
                 <button 
                   onClick={() => setShowTranslation(!showTranslation)}
                   className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-2xl text-[10px] font-black uppercase transition-all ${showTranslation ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}
                 >
                   Artinya {showTranslation ? 'ON' : 'OFF'}
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-2xl mx-auto px-4 pt-12 pb-40">
        {/* Surah Intro */}
        <div className="mb-12 text-center uppercase">
           <div className="text-emerald-600 mb-2">
              <BookOpen size={32} className="mx-auto" />
           </div>
           <h2 className="text-4xl font-black tracking-tighter">يس</h2>
           <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 mt-2">Surah Yasin</p>
           
           <div className={`mt-8 p-8 rounded-[3rem] ${isDarkMode ? 'bg-slate-900' : 'bg-white shadow-sm border border-slate-100'}`}>
              <div 
                className="text-4xl font-arabic text-center leading-[1.8] text-emerald-600" 
                dir="rtl"
              >
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </div>
           </div>
        </div>

        {/* Verses */}
        <div className="space-y-12">
          {surah?.ayahs?.map((ayah) => (
            <div key={ayah.id} className="scroll-mt-32">
              {/* Verse Number & Header */}
              <div className="flex items-center justify-between mb-6">
                 <div className="w-10 h-10 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-600 text-xs font-black">
                   {ayah.number}
                 </div>
                 <div className="w-px flex-1 mx-4 h-px bg-slate-200 dark:bg-slate-800" />
                 <div className="flex items-center gap-3">
                    <button className="p-2 text-slate-300 hover:text-emerald-500 transition-colors">
                       <Volume2 size={18} />
                    </button>
                 </div>
              </div>

              {/* Arabic Text */}
              <div 
                className={`font-arabic text-right leading-[2] dark:text-emerald-50 mb-8 ${fontSizeClasses[fontSize]}`} 
                dir="rtl"
              >
                {ayah.arab}
              </div>

              {/* Latin */}
              {showLatin && (
                <div className="mb-4">
                  <p className="text-base font-bold italic text-emerald-600/80 leading-relaxed">
                    {ayah.latin}
                  </p>
                </div>
              )}

              {/* Translation */}
              {showTranslation && (
                <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                  <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {ayah.text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Floating Audio (Mini) */}
      {surah?.audioFull && (
        <div className="fixed bottom-8 right-4 z-50">
           <button className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-600/40 active:scale-90 transition-all border-4 border-white dark:border-slate-900">
             <Play size={24} fill="currentColor" />
           </button>
        </div>
      )}
    </div>
  );
};

export default YasinScreen;
