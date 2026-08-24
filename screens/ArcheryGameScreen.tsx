import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Target,
  Sparkles,
  Loader2,
  ExternalLink
} from 'lucide-react';

const ArcheryGameScreen: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col font-sans text-white overflow-hidden">
      {/* Immersive Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-500/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-500/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10"></div>
      </div>

      {/* Header - Modern Floating Style */}
      <header className="px-5 py-4 flex items-center justify-between absolute top-0 left-0 right-0 z-50">
        <button 
          onClick={() => navigate('/game')} 
          className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-all bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full border border-white/10 active:scale-90"
        >
          <X size={22} />
        </button>
        
        <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
          <span className="text-base leading-none select-none">🏹</span>
          <h1 className="text-[10px] font-black tracking-[0.2em] uppercase text-white/90">Panahan Sunnah</h1>
        </div>

        <button 
          onClick={() => window.open('https://archery.h5games.usercontent.goog/v/f12fb2aa-d64b-4074-8974-31705698e2e6/', '_blank')}
          className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-all bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full border border-white/10 active:scale-90"
        >
          <ExternalLink size={18} />
        </button>
      </header>

      <main className="flex-1 relative w-full h-full z-10">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-20">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-orange-500/20 blur-3xl animate-pulse"></div>
              <Loader2 size={48} className="text-orange-500 animate-spin relative z-10" />
            </div>
            <p className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase mb-4">Menyiapkan Arena Latihan</p>
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
               <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
               <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}

        <iframe 
          src="https://archery.h5games.usercontent.goog/v/f12fb2aa-d64b-4074-8974-31705698e2e6/"
          className={`w-full h-full border-none transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          title="Archery Game"
          onLoad={() => setIsLoading(false)}
          allow="autoplay; fullscreen; gamepad"
        />
        
        {/* Bottom Tip Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-max">
           <div className="bg-black/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-3 shadow-2xl">
              <div className="p-1.5 bg-amber-500/20 rounded-lg">
                <Sparkles size={16} className="text-amber-400" />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Tips Fokus</p>
                <p className="text-[9px] font-medium text-white/50 uppercase tracking-tighter leading-none">Berlatihlah ketepatan dan konsentrasi</p>
              </div>
           </div>
        </div>
      </main>

      {/* Decorative Corner info */}
      <div className="absolute bottom-2 right-4 text-[7px] text-white/10 font-bold tracking-widest uppercase z-30 pointer-events-none">
        Archery Master • H5G Edition
      </div>
    </div>
  );
};

export default ArcheryGameScreen;
