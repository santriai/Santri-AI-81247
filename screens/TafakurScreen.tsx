
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Wind, Sun, Moon, Cloud, TreePine, Mountain, Waves, 
  Sparkles, Quote, BookOpen, Heart, RefreshCw, Eye, Shrink, Maximize2
} from 'lucide-react';

interface ContemplationPrompt {
  id: string;
  category: 'nature' | 'universe' | 'self' | 'night';
  verse?: string;
  reference?: string;
  prompt: string;
  bgGradient: string;
  icon: any;
}

const PROMPTS: ContemplationPrompt[] = [
  {
    id: '1',
    category: 'nature',
    verse: 'Sesungguhnya dalam penciptaan langit dan bumi, dan silih bergantinya malam dan siang terdapat tanda-tanda bagi orang-orang yang berakal.',
    reference: 'QS. Ali Imran: 190',
    prompt: 'Pandanglah langit sejenak. Sadarilah betapa kokohnya ia berdiri tanpa tiang, mencerminkan keagungan yang tak berbatas.',
    bgGradient: 'from-sky-400 via-blue-500 to-indigo-600',
    icon: Cloud
  },
  {
    id: '2',
    category: 'nature',
    verse: 'Dan Dia-lah yang menurunkan air hujan dari langit, lalu Kami tumbuhkan dengan air itu segala macam tumbuh-tumbuhan.',
    reference: 'QS. Al-An\'am: 99',
    prompt: 'Pikirkan tentang satu tetes air. Bagaimana ia menghidupkan tanah yang mati, persis seperti harapan yang Allah tumbuhkan di hati kita.',
    bgGradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    icon: Waves
  },
  {
    id: '3',
    category: 'universe',
    verse: 'Maka apabila langit terbelah dan menjadi merah mawar seperti (kilapan) minyak.',
    reference: 'QS. Ar-Rahman: 37',
    prompt: 'Bayangkan luasnya semesta. Kita hanyalah titik debu di hadapan-Nya, namun Dia tetap mendengar setiap bisikan doa kita.',
    bgGradient: 'from-indigo-600 via-purple-700 to-slate-900',
    icon: Sparkles
  },
  {
    id: '4',
    category: 'self',
    verse: 'Dan pada dirimu sendiri. Maka apakah kamu tidak memperhatikan?',
    reference: 'QS. Adz-Dzariyat: 21',
    prompt: 'Rasakan detak jantungmu. Ia bekerja tanpa perintahmu, atas kehendak-Nya yang menjaga hidupmu setiap detik.',
    bgGradient: 'from-rose-400 via-pink-500 to-purple-600',
    icon: Heart
  },
  {
    id: '5',
    category: 'night',
    verse: 'Dan Kami jadikan malam sebagai pakaian.',
    reference: 'QS. An-Naba: 10',
    prompt: 'Di kesunyian malam, lepaskan segala beban dunia. Biarkan jiwamu berbisik pada Sang Pemilik Malam dalam keteduhan.',
    bgGradient: 'from-slate-800 via-slate-900 to-black',
    icon: Moon
  }
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
          <pattern id="islamic-grid-tafakur" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" />
            <path d="M12 5 L19 12 L12 19 L5 12 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
            <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#islamic-grid-tafakur)" />
      </svg>
    </div>
  );
};

const TafakurScreen: React.FC = () => {
  const navigate = useNavigate();
  const [currentPrompt, setCurrentPrompt] = useState<ContemplationPrompt>(PROMPTS[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextPrompt = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const remaining = PROMPTS.filter(p => p.id !== currentPrompt.id);
      const next = remaining[Math.floor(Math.random() * remaining.length)];
      setCurrentPrompt(next);
      setIsAnimating(false);
    }, 500);
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 relative overflow-hidden font-sans ${isFullscreen ? 'bg-black' : 'bg-slate-50 dark:bg-slate-950'}`}>
      {/* Background Immersive Layer */}
      <AnimatePresence mode="wait">
        <motion.div
           key={currentPrompt.id}
           initial={{ opacity: 0 }}
           animate={{ opacity: isFullscreen ? 1 : 0.05 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 1.5 }}
           className={`absolute inset-0 bg-gradient-to-br ${currentPrompt.bgGradient} z-0`}
        />
      </AnimatePresence>

      <div className="absolute inset-0 z-[1] pointer-events-none opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l2 10 10 2-10 2-2 10-2-10-10-2 10-2z' fill='white'/%3E%3C/svg%3E")`,
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        {!isFullscreen && (
          <header className="sticky top-0 z-30 bg-gradient-to-r from-teal-600 to-indigo-700 text-white shadow-md relative overflow-hidden px-4 py-4 flex items-center gap-3">
            <IslamicPattern className="text-white opacity-[0.14]" />
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 text-white/90 hover:text-white rounded-full relative z-10 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="relative z-10">
              <h1 className="text-lg font-extrabold tracking-tight leading-none text-white">Ruang Tafakur</h1>
              <p className="text-[9px] uppercase tracking-widest font-black text-teal-200 mt-1">Renungan & Kontemplasi</p>
            </div>
          </header>
        )}

        <main className={`flex-1 flex flex-col justify-center px-6 ${isFullscreen ? 'py-12' : 'py-6'}`}>
          <div className="max-w-md mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPrompt.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`relative p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-md border ${isFullscreen ? 'bg-white/10 border-white/20 text-white' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100'}`}
              >
                <div className={`w-16 h-16 rounded-3xl mb-8 flex items-center justify-center shadow-lg ${isFullscreen ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
                  <currentPrompt.icon size={32} className={isFullscreen ? 'text-white' : 'text-santri-green dark:text-santri-gold'} />
                </div>

                <div className="space-y-6">
                  {currentPrompt.verse && (
                    <div className="space-y-2">
                       <Quote size={20} className="opacity-30 mb-2" />
                       <p className={`text-lg md:text-xl font-serif italic leading-relaxed ${isFullscreen ? 'text-white/90' : 'text-slate-700 dark:text-slate-300'}`}>
                         "{currentPrompt.verse}"
                       </p>
                       <div className="flex items-center gap-2 pt-2">
                          <div className="h-0.5 w-6 bg-santri-green/30"></div>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            {currentPrompt.reference}
                          </span>
                       </div>
                    </div>
                  )}

                  <div className={`p-6 rounded-2xl ${isFullscreen ? 'bg-black/20' : 'bg-slate-50 dark:bg-slate-800'} border ${isFullscreen ? 'border-white/10' : 'border-slate-100 dark:border-slate-700'}`}>
                    <p className="text-sm font-medium leading-relaxed">
                      {currentPrompt.prompt}
                    </p>
                  </div>
                </div>

                <div className="absolute -top-3 -right-3">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${isFullscreen ? 'bg-white/20 border-black/30' : 'bg-santri-green border-white'} text-white shadow-lg`}>
                      <Wind size={20} className={isAnimating ? 'animate-spin-slow' : ''} />
                   </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Footer Actions */}
        <footer className={`px-6 py-10 flex flex-col items-center gap-6 ${isFullscreen ? 'text-white' : ''}`}>
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isFullscreen ? 'bg-white/20 border border-white/20 hover:bg-white/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'}`}
              >
                {isFullscreen ? <Shrink size={14} /> : <Maximize2 size={14} />}
                <span>{isFullscreen ? 'Keluar Fokus' : 'Mode Fokus'}</span>
              </button>

              <button 
                onClick={nextPrompt}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${isFullscreen ? 'bg-white text-black hover:bg-slate-100' : 'bg-santri-green text-white hover:opacity-90 shadow-green-200 dark:shadow-none'}`}
              >
                <RefreshCw size={16} className={isAnimating ? 'animate-spin' : ''} />
                <span>Renungan Lain</span>
              </button>
           </div>

           {!isFullscreen && (
             <p className="text-[10px] text-slate-400 font-bold text-center max-w-[250px] uppercase tracking-tighter leading-tight">
               "Tafakur sesaat lebih baik daripada ibadah setahun tanpa ilmu."
             </p>
           )}
        </footer>
      </div>
    </div>
  );
};

export default TafakurScreen;
