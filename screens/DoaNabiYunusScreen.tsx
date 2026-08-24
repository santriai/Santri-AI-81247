
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Settings, 
  Type, 
  CheckCircle2, 
  Scroll, 
  Fingerprint,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Info
} from 'lucide-react';

const DOA_DATA = [
  {
    id: 'doa_yunus',
    title: 'Doa Nabi Yunus (Dzikir Tasbih)',
    description: 'Doa yang dibaca Nabi Yunus AS di dalam perut ikan. Keutamaannya sangat luar biasa untuk keluar dari kesulitan.',
    target: 40, // Usually advised 40x or more
    content: [
      {
        arabic: 'لَّا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
        latin: 'Laa ilaaha illaa anta subhaanaka innii kuntu minazh zhaalimiin.',
        translation: 'Tidak ada Tuhan selain Engkau. Maha Suci Engkau, sesungguhnya aku adalah termasuk orang-orang yang zalim.'
      }
    ]
  },
  {
    id: 'explanation',
    title: 'Fadhilah Doa Nabi Yunus',
    description: 'Kenapa doa ini begitu dahsyat?',
    content: [
      {
        subtitle: 'Pengakuan Tauhid',
        text: 'Doa ini dimulai dengan pengakuan mutlak akan ketauhidan Allah SWT.'
      },
      {
        subtitle: 'Penyucian Allah',
        text: 'Dilanjutkan dengan mensucikan Allah dari segala kekurangan (Tasbih).'
      },
      {
        subtitle: 'Pengakuan Dosa',
        text: 'Diakhiri dengan pengakuan atas kezaliman diri sendiri (Istighfar). Kombinasi Tauhid, Tasbih, dan Istighfar inilah yang membuat doa ini sangat mustajab.'
      }
    ]
  }
];

const DoaNabiYunusScreen: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<'base' | 'lg' | 'xl'>('lg');
  const [showMenu, setShowMenu] = useState(false);
  const [count, setCount] = useState(0);

  const totalPages = DOA_DATA.length;
  const currentSection = DOA_DATA[currentIndex];

  useEffect(() => {
    setCount(0);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < totalPages - 1) {
      setCurrentIndex(currentIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const incrementCount = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    setCount(prev => prev + 1);
  };

  const fontSizeClasses = {
    base: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white/80'}`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest leading-none">Doa Nabi Yunus</h1>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter mt-1">{currentSection.title}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} ${showMenu ? 'bg-emerald-100 text-emerald-600' : ''}`}
          >
            <Settings size={20} />
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
            <div className="p-4 flex items-center justify-between max-w-2xl mx-auto">
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
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-2xl mx-auto px-4 pt-12 pb-40">
        <div className="mb-10 text-center">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkles size={12} /> Bagian {currentIndex + 1} dari {totalPages}
           </div>
           <h2 className="text-3xl font-black tracking-tight">{currentSection.title}</h2>
           <p className={`text-sm font-medium mt-3 leading-relaxed max-w-md mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
             {currentSection.description}
           </p>
        </div>

        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
           {currentSection.content.map((item, idx) => (
             <div key={idx} className="space-y-6">
                {item.subtitle && (
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <span className="text-xs font-black">{idx + 1}</span>
                     </div>
                     <h3 className="font-black text-xs uppercase tracking-widest text-emerald-600">{item.subtitle}</h3>
                  </div>
                )}

                {/* Arabic Card (Tasbih) */}
                {item.arabic && (
                  <div className={`bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-sm border relative overflow-hidden ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="absolute top-6 left-6 flex items-center gap-2">
                       <button 
                         onClick={() => setCount(0)}
                         className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 active:rotate-180 transition-transform duration-500"
                       >
                         <RotateCcw size={14} />
                       </button>
                    </div>

                    <div 
                      className={`font-arabic text-center leading-[1.8] dark:text-emerald-50 mb-12 ${fontSizeClasses[fontSize]}`} 
                      dir="rtl"
                    >
                      {item.arabic}
                    </div>

                    <div className="flex flex-col items-center">
                       <button 
                         onClick={incrementCount}
                         className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all active:scale-95 overflow-hidden ${
                           isDarkMode ? 'bg-slate-800' : 'bg-slate-50'
                         } border border-slate-100 dark:border-slate-700 shadow-inner`}
                       >
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle 
                              cx="80" 
                              cy="80" 
                              r="76" 
                              fill="transparent" 
                              stroke="currentColor" 
                              strokeWidth="4" 
                              className="text-emerald-500/10"
                            />
                            <circle 
                              cx="80" 
                              cy="80" 
                              r="76" 
                              fill="transparent" 
                              stroke="currentColor" 
                              strokeWidth="4" 
                              strokeDasharray={477}
                              strokeDashoffset={477 - (477 * (count % (DOA_DATA[0].target || 1) / (DOA_DATA[0].target || 1)))}
                              strokeLinecap="round"
                              className="text-emerald-500 transition-all duration-300"
                            />
                          </svg>

                          <span className="text-5xl font-black text-emerald-600 relative z-10">{count}</span>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest relative z-10">
                            Total Bacaan
                          </span>
                          <div className="absolute bottom-4 opacity-20">
                             <Fingerprint size={24} className="text-slate-400" />
                          </div>
                       </button>
                       <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Ketuk untuk Berdzikir</p>
                    </div>
                  </div>
                )}

                {/* Info Text */}
                {item.text && (
                  <div className={`p-6 rounded-[2rem] ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-100 shadow-sm'}`}>
                    <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                      {item.text}
                    </p>
                  </div>
                )}

                {/* Latin & Translation */}
                {(item.latin || item.translation) && (
                  <div className="grid gap-4">
                     {item.latin && (
                       <div className="p-6 rounded-3xl bg-emerald-600/5 border-l-4 border-emerald-500">
                           <div className="flex items-center gap-2 mb-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Teks Latin</span>
                          </div>
                          <p className="text-base font-bold leading-relaxed italic text-slate-700 dark:text-slate-200">
                            {item.latin}
                          </p>
                       </div>
                     )}
                     {item.translation && (
                       <div className={`p-6 rounded-3xl border ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                          <div className="flex items-center gap-2 mb-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Artinya</span>
                          </div>
                          <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                            {item.translation}
                          </p>
                       </div>
                     )}
                  </div>
                )}
             </div>
           ))}
        </motion.div>
      </main>

      {/* Navigation Footer */}
      <footer className={`fixed bottom-0 inset-x-0 p-4 pb-8 z-40 backdrop-blur-lg flex justify-center gap-4 ${isDarkMode ? 'bg-slate-950/80 border-t border-slate-800' : 'bg-white/80 border-t border-slate-200'}`}>
         <div className="w-full max-w-2xl flex items-center justify-between gap-4">
            <button 
              onClick={handleBack}
              disabled={currentIndex === 0}
              className={`flex-1 py-4 rounded-[2rem] flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                currentIndex === 0 
                  ? 'opacity-30 grayscale pointer-events-none' 
                  : isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 active:scale-95'
              }`}
            >
              <ChevronLeft size={18} /> Kembali
            </button>
            <button 
              onClick={currentIndex === totalPages - 1 ? () => navigate(-1) : handleNext}
              className="flex-[1.5] py-4 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
            >
              {currentIndex === totalPages - 1 ? 'Selesai' : 'Lanjut'} 
              {currentIndex === totalPages - 1 ? <CheckCircle2 size={18} /> : <ChevronRight size={18} />}
            </button>
         </div>
      </footer>
    </div>
  );
};

export default DoaNabiYunusScreen;
