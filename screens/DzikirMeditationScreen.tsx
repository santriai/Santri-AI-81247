
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { 
  ArrowLeft, Wind, Heart, Sparkles, Play, Pause, RotateCcw, 
  Volume2, VolumeX, Moon, Sun, Cloud, Waves, Shrink, Maximize2, Zap
} from 'lucide-react';

type MeditationPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

interface MeditationTheme {
  id: string;
  name: string;
  gradient: string;
  icon: any;
  textColor: string;
  accentColor: string;
}

const THEMES: MeditationTheme[] = [
  { id: 'dawn', name: 'Fajr', gradient: 'from-orange-200 via-rose-100 to-indigo-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900', icon: Sun, textColor: 'text-orange-900 dark:text-orange-100', accentColor: 'bg-orange-500' },
  { id: 'forest', name: 'Nature', gradient: 'from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900', icon: Cloud, textColor: 'text-emerald-900 dark:text-emerald-100', accentColor: 'bg-emerald-500' },
  { id: 'deep', name: 'Deep', gradient: 'from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-black', icon: Moon, textColor: 'text-blue-900 dark:text-blue-100', accentColor: 'bg-blue-500' },
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
          <pattern id="islamic-grid-meditation" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" />
            <path d="M12 5 L19 12 L12 19 L5 12 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
            <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#islamic-grid-meditation)" />
      </svg>
    </div>
  );
};

const DzikirMeditationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<MeditationPhase>('Rest');
  const [seconds, setSeconds] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<MeditationTheme>(THEMES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Phase Configuration (Seconds)
  const DURATIONS = {
    Inhale: 4,
    Hold: 4,
    Exhale: 4,
    Rest: 2
  };

  const DZIKIR = {
    Inhale: 'Subhanallah',
    Hold: 'Alhamdulillah',
    Exhale: 'Allahu Akbar',
    Rest: 'Bismillah'
  };

  const INSTRUCTIONS = {
    Inhale: 'Tarik nafas perlahan lewat hidung',
    Hold: 'Tahan nafas dengan tenang',
    Exhale: 'Hembuskan perlahan lewat mulut',
    Rest: 'Siapkan diri untuk siklus berikutnya'
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    const currentDuration = DURATIONS[phase];
    if (seconds >= currentDuration) {
      setSeconds(0);
      switch (phase) {
        case 'Rest': setPhase('Inhale'); break;
        case 'Inhale': setPhase('Hold'); break;
        case 'Hold': setPhase('Exhale'); break;
        case 'Exhale': 
          setPhase('Rest'); 
          setCycleCount(prev => prev + 1);
          break;
      }
    }
  }, [seconds, phase]);

  const toggleSession = () => {
    if (!isPlaying) {
      setPhase('Inhale');
      setSeconds(0);
    }
    setIsPlaying(!isPlaying);
  };

  const resetSession = () => {
    setIsPlaying(false);
    setPhase('Rest');
    setSeconds(0);
    setCycleCount(0);
  };

  const currentDzikir = isPlaying ? DZIKIR[phase] : 'Siap Berdzikir?';
  const progressPercent = (seconds / DURATIONS[phase]) * 100;

  return (
    <div className={`min-h-screen transition-all duration-1000 relative overflow-hidden font-sans bg-gradient-to-br ${currentTheme.gradient}`}>
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/20 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-currentTheme.accentColor/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        {!isFullscreen && (
          <header className="sticky top-0 z-30 bg-[#005a2b] dark:bg-emerald-950 text-white shadow-md relative overflow-hidden pt-5 pb-4 px-4 rounded-b-[1.5rem] flex items-center justify-between">
            <IslamicPattern className="text-white opacity-[0.14]" />
            <div className="flex items-center gap-3 relative z-10">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-base md:text-lg font-extrabold tracking-tight leading-none text-white">Meditasi Dzikir</h1>
                <p className="text-[9px] uppercase tracking-widest font-black text-emerald-200 mt-1">Nafas & Ketenangan Jiwa</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 relative z-10">
               <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 bg-white/15 hover:bg-white/20 text-white rounded-full transition-colors mr-1"
               >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
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
        )}

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-2 md:py-8 gap-4 md:gap-8">
           {/* Breathing Visualizer */}
           <div className="relative w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center">
              {/* Outer Pulsing Glow */}
              <AnimatePresence>
                {isPlaying && (
                  <motion.div
                    key="glow"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ 
                      scale: phase === 'Inhale' ? 1.5 : (phase === 'Exhale' ? 1 : 1.2),
                      opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ 
                      duration: phase === 'Rest' ? 2 : 4, 
                      ease: "easeInOut",
                      repeat: Infinity
                    }}
                    className={`absolute inset-0 rounded-full blur-3xl ${currentTheme.accentColor} opacity-20`}
                  />
                )}
              </AnimatePresence>

              {/* Main Breathing Circle */}
              <motion.div
                animate={{
                  scale: phase === 'Inhale' ? 1.2 : (phase === 'Hold' ? 1.2 : (phase === 'Exhale' ? 0.8 : 0.85)),
                  borderRadius: phase === 'Rest' ? "40%" : "50%",
                  rotate: phase === 'Rest' ? 45 : 0
                }}
                transition={{
                  duration: DURATIONS[phase],
                  ease: "easeInOut"
                }}
                className={`w-full h-full border-4 border-white/30 backdrop-blur-xl flex flex-col items-center justify-center p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl bg-white/10`}
              >
                 {/* Inner Progress Ring */}
                 <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="48%"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeDasharray="301" // Approximate circumference
                      strokeDashoffset={301 - (301 * progressPercent) / 100}
                      className={`text-white transition-all duration-300 ${isPlaying ? 'opacity-40' : 'opacity-0'}`}
                    />
                 </svg>

                 <motion.div
                    key={currentDzikir}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${currentTheme.textColor}`}
                 >
                    <div className="flex justify-center mb-1 md:mb-2">
                       <Zap size={20} className={isPlaying ? 'animate-pulse' : 'opacity-30'} />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] block mb-1 md:mb-2 opacity-60">
                       {isPlaying ? phase : 'Persiapan'}
                    </span>
                    <h2 className="text-xl md:text-3xl font-black tracking-tight leading-tight">
                       {currentDzikir}
                    </h2>
                    {isPlaying && (
                      <p className="text-[8px] md:text-[10px] mt-1 md:mt-2 font-medium opacity-50 uppercase tracking-widest italic">
                        Ucapkan di dalam hati
                      </p>
                    )}
                 </motion.div>
              </motion.div>
           </div>

           {/* Phase Instructions - RELOCATED below visualizer with more prominent color */}
           <div className="h-12 flex items-center justify-center">
             <AnimatePresence mode="wait">
                {isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className={`px-5 py-2 rounded-full text-center shadow-lg transition-colors border border-white/20 ${currentTheme.id === 'dawn' ? 'bg-orange-500 text-white' : currentTheme.id === 'forest' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}
                  >
                     <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em]">
                        {INSTRUCTIONS[phase]}
                     </p>
                  </motion.div>
                )}
             </AnimatePresence>
           </div>

           {/* Stats Labels */}
           <div className={`flex items-center gap-6 md:gap-8 ${currentTheme.textColor}`}>
              <div className="text-center">
                 <p className="text-[9px] md:text-[10px] font-bold uppercase opacity-50 tracking-widest">Siklus</p>
                 <p className="text-lg md:text-xl font-black">{cycleCount}</p>
              </div>
              <div className="w-px h-6 md:h-8 bg-currentTheme.textColor opacity-20"></div>
              <div className="text-center">
                 <p className="text-[9px] md:text-[10px] font-bold uppercase opacity-50 tracking-widest">Waktu</p>
                 <p className="text-lg md:text-xl font-black">
                    {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                 </p>
              </div>
           </div>
        </main>

        {/* Action Controls */}
        <footer className={`px-6 pt-6 pb-8 md:pt-12 md:pb-10 flex flex-col items-center gap-4 md:gap-8 ${currentTheme.textColor}`}>
           {/* Theme Selector */}
           {!isFullscreen && (
             <div className="flex gap-4 p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setCurrentTheme(t)}
                    className={`p-3 rounded-xl transition-all ${currentTheme.id === t.id ? 'bg-white shadow-lg text-slate-900' : 'hover:bg-white/10'}`}
                  >
                    <t.icon size={20} />
                  </button>
                ))}
             </div>
           )}

           {/* Media Controls */}
           <div className="flex items-center gap-6">
              <button 
                onClick={resetSession}
                className="p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-all active:scale-90"
              >
                <RotateCcw size={20} />
              </button>

              <button 
                onClick={toggleSession}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-2xl ${isPlaying ? 'bg-white text-slate-900 ring-8 ring-white/10' : 'bg-white text-slate-900 ring-8 ring-white/20'}`}
              >
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
              </button>

              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-all active:scale-90"
              >
                {isFullscreen ? <Shrink size={20} /> : <Maximize2 size={20} />}
              </button>
           </div>

           {!isFullscreen && (
             <div className="text-center max-w-sm px-4">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3">Manfaat Meditasi Dzikir</p>
                <div className="grid grid-cols-2 gap-3 text-left">
                   <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <p className="text-[9px] font-bold uppercase mb-1 opacity-60">Ketenangan</p>
                      <p className="text-[10px] leading-tight opacity-90">Menurunkan kadar stres & menenangkan detak jantung.</p>
                   </div>
                   <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <p className="text-[9px] font-bold uppercase mb-1 opacity-60">Fokus</p>
                      <p className="text-[10px] leading-tight opacity-90">Meningkatkan konsentrasi & kesadaran spiritual.</p>
                   </div>
                </div>
                <p className="mt-4 text-[11px] font-medium italic leading-relaxed opacity-80">
                   "Ingatlah, hanya dengan mengingati Allah-lah hati menjadi tenteram. Mutiara Al-Qur'an (QS. Ar-Ra'd: 28)"
                </p>
             </div>
           )}
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite alternate ease-in-out;
        }
      `}} />
    </div>
  );
};

export default DzikirMeditationScreen;
