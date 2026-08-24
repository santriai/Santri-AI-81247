
import React, { useState } from 'react';
// Fix: Added Loader2 to lucide-react imports
import { Play, Pause, X, Music, ChevronDown, Radio, Megaphone, SkipBack, SkipForward, Repeat, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../contexts/AudioContext';

const MiniPlayer: React.FC = () => {
  const { 
    isPlaying, isLooping, currentSurah, currentAyah, currentRadio, currentTtsInfo, currentLibraryItem, isTtsActive,
    mode, togglePlay, toggleLoop, stop, stopTts, isLoading, nextTrack, prevTrack
  } = useAudio();
  
  const navigate = useNavigate();
  const [isMinimized, setIsMinimized] = useState(false);

  const hasContent = (isTtsActive && currentTtsInfo) || (mode === 'quran' && currentSurah && currentAyah) || (mode === 'radio' && currentRadio) || (mode === 'library' && currentLibraryItem);
  if (!hasContent) return null;

  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)}
        className={`fixed right-4 z-[1000] w-14 h-14 bg-gradient-to-br ${isTtsActive || mode === 'library' ? 'from-amber-700 to-slate-900' : 'from-emerald-900 to-slate-900'} backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in`}
        style={{ bottom: 'calc(18px + env(safe-area-inset-bottom))' }}
      >
        <div className={isPlaying ? 'animate-pulse' : ''}>
           {isTtsActive ? <Megaphone size={24} className="text-amber-400" /> : 
            mode === 'radio' ? <Radio size={24} className="text-amber-400" /> :
            mode === 'library' ? <Music size={24} className="text-amber-400" /> :
            <Music size={24} className="text-emerald-400" />}
        </div>
      </button>
    );
  }

  const isLibrary = mode === 'library';

  return (
    <div className="fixed left-3 right-3 z-[1000] animate-in slide-in-from-bottom-4" style={{ bottom: 'calc(15px + env(safe-area-inset-bottom))' }}>
      <div className={`bg-gradient-to-r ${isTtsActive || isLibrary ? 'from-slate-950 via-slate-900 to-slate-950' : 'from-slate-950 via-emerald-950 to-slate-950'} backdrop-blur-xl text-white rounded-2xl p-2.5 shadow-2xl border border-white/10 flex items-center w-full max-w-3xl mx-auto transition-all`}>
        
        {/* Info Area - Placed Left */}
        <div className="flex-1 min-w-0 flex flex-col justify-center pl-3 cursor-pointer" onClick={() => !isTtsActive && (mode === 'quran' ? navigate('/quran', { state: { surahNumber: currentSurah?.number } }) : isLibrary ? navigate('/playlist') : navigate('/radio'))}>
          {isLibrary && currentLibraryItem ? (
             <>
               <h4 className="font-bold text-xs sm:text-sm text-amber-50 truncate">{currentLibraryItem.title}</h4>
               <p className="text-[9px] text-amber-400 font-black uppercase tracking-widest truncate">{currentLibraryItem.artist}</p>
             </>
          ) : isTtsActive && currentTtsInfo ? (
            <>
              <h4 className="font-bold text-xs sm:text-sm text-amber-50 truncate">{currentTtsInfo.title}</h4>
              <p className="text-[9px] text-amber-200/70 italic truncate">"{currentTtsInfo.text}"</p>
            </>
          ) : mode === 'quran' ? (
            <>
              <h4 className="font-bold text-xs sm:text-sm truncate">QS. {currentSurah?.name_latin}</h4>
              <p className="text-[9px] text-emerald-400 font-black uppercase">Ayat {currentAyah?.number}</p>
            </>
          ) : (
            <>
              <h4 className="font-bold text-xs sm:text-sm truncate">{currentRadio?.name}</h4>
              <p className="text-[9px] text-amber-400 font-black uppercase">LIVE • {currentRadio?.location}</p>
            </>
          )}
        </div>

        {/* Controls Area - Order exactly as per user screenshot red box */}
        <div className="flex items-center gap-0.5 sm:gap-1 pr-1">
          {/* Loop Button - Next to text */}
          {isLibrary && (
            <button 
              onClick={(e) => { e.stopPropagation(); toggleLoop(); }} 
              className={`p-2 transition-colors ${isLooping ? 'text-amber-400' : 'text-slate-500'}`}
              title="Ulangi Playlist"
            >
              <Repeat size={18} />
            </button>
          )}

          {/* Prev Navigation */}
          {(isLibrary || mode === 'quran') && (
            <button onClick={(e) => { e.stopPropagation(); prevTrack(); }} className="p-2 text-slate-400 hover:text-white active:scale-90 transition-transform">
              <SkipBack size={18} fill="currentColor" />
            </button>
          )}

          {/* Main Play/Pause - Gold for Library, Emerald for Quran */}
          <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className={`w-10 h-10 rounded-full ${isLibrary ? 'bg-amber-600 shadow-amber-900/40' : 'bg-emerald-600 shadow-green-900/40'} flex items-center justify-center shadow-lg active:scale-90 transition-transform`}>
            {isLoading ? <Loader2 size={18} className="animate-spin text-white" /> : isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>

          {/* Next Navigation */}
          {(isLibrary || mode === 'quran') && (
            <button onClick={(e) => { e.stopPropagation(); nextTrack(); }} className="p-2 text-slate-400 hover:text-white active:scale-90 transition-transform">
              <SkipForward size={18} fill="currentColor" />
            </button>
          )}

          {/* Actions at the far right */}
          <div className="flex items-center ml-1 border-l border-white/10 pl-1">
            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }} className="p-2 text-slate-500 hover:text-white"><ChevronDown size={18} /></button>
            <button onClick={(e) => { e.stopPropagation(); isTtsActive ? stopTts() : stop(); }} className="p-2 text-slate-500 hover:text-red-400"><X size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
