
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
  Calendar,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Info,
  Clock,
  Fingerprint,
  RotateCcw
} from 'lucide-react';

const NISFU_DATA = [
  {
    id: 'intro',
    title: 'Keutamaan Nisfu Syaban',
    description: 'Malam ke-15 bulan Syaban adalah malam penuh ampunan dan pengabulan doa.',
    content: [
      {
        subtitle: 'Countdown Nisfu Syaban 1448 H',
        isCountdown: true
      },
      {
        subtitle: 'Adab Mengamalkan',
        text: 'Amalan ini biasanya dilakukan setelah sholat Maghrib. Dianjurkan berjamaah dan dalam keadaan suci (berwudhu). Terdiri dari pembacaan Surah Yasin sebanyak 3 kali dengan niat yang berbeda-beda.'
      }
    ]
  },
  {
    id: 'yasin1',
    title: 'Surah Yasin Pertama',
    description: 'Niat: Memohon panjang umur dalam ketaatan dan ibadah kepada Allah SWT.',
    isYasin: true,
    content: [
      {
        subtitle: 'Langkah 1',
        text: 'Lakukan niat dalam hati: "Ya Allah, hamba mohon panjangkanlah umur hamba semata-mata untuk beribadah dan taat kepada-Mu".'
      },
      {
        subtitle: 'Bacaan',
        text: 'Bacalah Surah Yasin dari awal hingga akhir dengan khusyuk.'
      }
    ]
  },
  {
    id: 'yasin2',
    title: 'Surah Yasin Kedua',
    description: 'Niat: Memohon dijauhkan dari segala bala, musibah, dan diberikan rezeki yang halal.',
    isYasin: true,
    content: [
      {
        subtitle: 'Langkah 2',
        text: 'Lakukan niat dalam hati: "Ya Allah, hamba mohon jauhkanlah hamba dari segala mara bahaya dan fitnah, serta berilah hamba rezeki yang luas dan halal".'
      },
      {
        subtitle: 'Bacaan',
        text: 'Bacalah Surah Yasin untuk kedua kalinya.'
      }
    ]
  },
  {
    id: 'yasin3',
    title: 'Surah Yasin Ketiga',
    description: 'Niat: Memohon kekayaan hati (qanaah) dan husnul khatimah (akhir yang baik).',
    isYasin: true,
    content: [
      {
        subtitle: 'Langkah 3',
        text: 'Lakukan niat dalam hati: "Ya Allah, hamba mohon berilah hamba hati yang merasa cukup dan teguhkanlah iman hamba sehingga wafat dalam keadaan husnul khatimah".'
      },
      {
        subtitle: 'Bacaan',
        text: 'Bacalah Surah Yasin untuk ketiga kalinya.'
      }
    ]
  },
  {
    id: 'doa_nisfu',
    title: 'Doa Malam Nisfu Syaban',
    description: 'Dibaca setelah selesai membaca Surah Yasin 3 kali.',
    content: [
      {
        subtitle: 'Bismillah & Pujian',
        arabic: 'اللَّهُمَّ يَا ذَا الْمَنِّ وَلَا يُمَنُّ عَلَيْهِ، يَا ذَا الْجَلَالِ وَالْإِكْرَامِ، يَا ذَا الطَّوْلِ وَالْإِنْعَامِ ...',
        latin: 'Allaahumma yaa dhal manni walaa yumannu \'alaika, yaa dhal jalaali wal ikraami, yaa dhal thawli wal in\'aami...',
        translation: 'Ya Allah, wahai Dzat yang mempunyai anugerah dan tidak dianugerahi, wahai Dzat yang memiliki kebesaran dan kemuliaan, wahai Dzat yang memiliki kekuasaan dan kenikmatan...'
      },
      {
        subtitle: 'Inti Doa',
        arabic: 'اللَّهُمَّ إِنْ كُنْتَ كَتَبْتَنِي عِنْدَكَ فِي أُمِّ الْكِتَابِ شَقِيًّا أَوْ مَحْرُومًا أَوْ مَطْرُودًا أَوْ مُقَتَّرًا عَلَيَّ فِي الرِّزْقِ، فَامْحُ اللَّهُمَّ بِفَضْلِكَ شَقَاوَتِي وَحِرْمَانِي وَطَرْدِي وَإِقْتَارَ رِزْقِي ...',
        latin: 'Allaahumma in kunta katabtanii \'indaka fii ummil kitaabi syaqiyyan aw mahruuman aw mathruudan aw muqattaran \'alayya fir rizqi, famhuallaahumma bifadhlika syaqaawatii wa hirmaanii wa thardii wa iqtaara rizqii...',
        translation: 'Ya Allah, jika Engkau telah menulis namaku di sisi-Mu dalam Ummul Kitab sebagai orang yang celaka, terhalang, terusir, atau disempitkan rezekinya, maka hapuskanlah dengan anugerah-Mu akan kecelakaanku, keterhalanganku, pengusiranku, dan kesempitan rezekiku...'
      }
    ]
  },
  {
    id: 'doa_yunus',
    title: 'Dzikir Doa Nabi Yunus',
    description: 'Dianjurkan dibaca sebagai tambahan dzikir di malam Nisfu Syaban untuk kemudahan hajat.',
    target: 40,
    content: [
      {
        arabic: 'لَّا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
        latin: 'Laa ilaaha illaa anta subhaanaka innii kuntu minazh zhaalimiin.',
        translation: 'Tidak ada Tuhan selain Engkau. Maha Suci Engkau, sesungguhnya aku adalah termasuk orang-orang yang zalim.',
        isTasbih: true
      }
    ]
  }
];

const NisfuSyabanScreen: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<'base' | 'lg' | 'xl'>('lg');
  const [showMenu, setShowMenu] = useState(false);
  const [tasbihCount, setTasbihCount] = useState(0);

  useEffect(() => {
    setTasbihCount(0);
  }, [currentIndex]);

  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number}>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Estimasi Nisfu Syaban 1448 H
    // Syaban 15, 1448 H = Jan 24, 2027
    const targetDate = new Date('2027-01-24T18:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const totalPages = NISFU_DATA.length;
  const currentSection = NISFU_DATA[currentIndex];

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

  const fontSizeClasses = {
    base: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const incrementTasbih = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
    setTasbihCount(prev => prev + 1);
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
            <h1 className="text-sm font-black uppercase tracking-widest leading-none">Amalan Nisfu Syaban</h1>
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
        {/* Progress Bar Top */}
        <div className="mb-10 text-center">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              <Calendar size={12} /> Bagian {currentIndex + 1} dari {totalPages}
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

                {/* Countdown Block */}
                {item.isCountdown && (
                  <div className={`p-8 rounded-[3rem] text-center border-2 border-dashed ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                     <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'Hari', val: timeLeft.days },
                          { label: 'Jam', val: timeLeft.hours },
                          { label: 'Menit', val: timeLeft.minutes },
                          { label: 'Detik', val: timeLeft.seconds }
                        ].map((t, i) => (
                          <div key={i} className="flex flex-col items-center">
                             <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl md:text-2xl font-black shadow-lg">
                                {t.val}
                             </div>
                             <span className="mt-2 text-[9px] font-black uppercase text-slate-400 tracking-tighter">{t.label}</span>
                          </div>
                        ))}
                     </div>
                     <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                        <Clock size={12} className="text-emerald-500" />
                        Menuju 15 Syaban 1448 H
                     </p>
                  </div>
                )}

                {/* Arabic Card */}
                {item.arabic && (
                  <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border relative overflow-hidden ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    {item.isTasbih && (
                      <div className="absolute top-6 left-6 flex items-center gap-2">
                        <button 
                          onClick={() => setTasbihCount(0)}
                          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 active:rotate-180 transition-transform duration-500"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    )}
                    <div 
                      className={`font-arabic text-right leading-[2] dark:text-emerald-50 ${item.isTasbih ? 'text-center mb-8' : ''} ${fontSizeClasses[fontSize]}`} 
                      dir="rtl"
                    >
                      {item.arabic}
                    </div>

                    {item.isTasbih && (
                      <div className="flex flex-col items-center">
                        <button 
                          onClick={incrementTasbih}
                          className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all active:scale-95 overflow-hidden ${
                            isDarkMode ? 'bg-slate-800' : 'bg-slate-50'
                          } border border-slate-100 dark:border-slate-700 shadow-inner`}
                        >
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle 
                              cx="64" 
                              cy="64" 
                              r="60" 
                              fill="transparent" 
                              stroke="currentColor" 
                              strokeWidth="4" 
                              className="text-emerald-500/10"
                            />
                            <circle 
                              cx="64" 
                              cy="64" 
                              r="60" 
                              fill="transparent" 
                              stroke="currentColor" 
                              strokeWidth="4" 
                              strokeDasharray={377}
                              strokeDashoffset={377 - (377 * ((tasbihCount % (currentSection.target || 1)) / (currentSection.target || 1)))}
                              strokeLinecap="round"
                              className="text-emerald-500 transition-all duration-300"
                            />
                          </svg>

                          <span className="text-4xl font-black text-emerald-600 relative z-10">{tasbihCount}</span>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest relative z-10">
                            Total
                          </span>
                          <div className="absolute bottom-2 opacity-20">
                            <Fingerprint size={20} className="text-slate-400" />
                          </div>
                        </button>
                        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Ketuk untuk Tasbih</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Description Card */}
                {item.text && (
                  <div className={`p-6 rounded-[2rem] ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-100 shadow-sm'}`}>
                    <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                      {item.text}
                    </p>
                  </div>
                )}

                {/* Latin & Trans */}
                {(item.latin || item.translation) && (
                  <div className="grid gap-4">
                     {item.latin && (
                       <div className="p-6 rounded-3xl bg-emerald-600/5 border-l-4 border-emerald-500">
                          <p className="text-sm font-bold leading-relaxed italic text-slate-700 dark:text-slate-200">
                            {item.latin}
                          </p>
                       </div>
                     )}
                     {item.translation && (
                       <div className={`p-6 rounded-3xl border ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                          <p className="text-[11px] font-medium leading-relaxed text-slate-500 dark:text-slate-400 italic">
                            {item.translation}
                          </p>
                       </div>
                     )}
                  </div>
                )}
             </div>
           ))}

           {currentSection.isYasin && (
             <motion.button 
               whileTap={{ scale: 0.95 }}
               onClick={() => navigate('/yasin')}
               className="w-full mt-8 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-emerald-500/30 flex items-center justify-between group overflow-hidden relative"
             >
                <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 relative z-10">
                   <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center text-emerald-600">
                      <BookOpen size={24} />
                   </div>
                   <div className="text-left">
                      <h4 className="font-black text-sm uppercase tracking-tight leading-none mb-1">Buka Surah Yasin</h4>
                      <p className="text-[10px] font-bold text-slate-400">Gunakan Reading Mode Khusus</p>
                   </div>
                </div>
                <ChevronRight size={20} className="text-emerald-500 relative z-10" />
             </motion.button>
           )}
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

      {/* Mini Progress */}
      <div className="fixed bottom-28 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-full backdrop-blur-sm">
         {NISFU_DATA.map((_, i) => (
           <div 
             key={i} 
             className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
               i === currentIndex 
                 ? 'bg-emerald-500 w-6' 
                 : i < currentIndex ? 'bg-emerald-800/50' : 'bg-slate-300 dark:bg-slate-700'
             }`} 
           />
         ))}
      </div>
    </div>
  );
};

export default NisfuSyabanScreen;
