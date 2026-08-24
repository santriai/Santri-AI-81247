import React from 'react';
import { usePrayer } from '../contexts/PrayerContext';
import { Volume2, Square, BellRing, X } from 'lucide-react';

export const AdzanBanner: React.FC = () => {
  const { isAdzanPlaying, activePrayerName, stopAdzan, locationName } = usePrayer();

  if (!isAdzanPlaying || !activePrayerName) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[9999] max-w-md mx-auto animate-in slide-in-from-top-6 duration-300">
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white p-4 rounded-2xl shadow-2xl border border-emerald-400/30 backdrop-blur-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
            <Volume2 className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-emerald-100 font-medium">
              <BellRing className="w-3.5 h-3.5 animate-bounce" />
              <span>Waktu Sholat tiba</span>
            </div>
            <h3 className="text-base font-bold text-white truncate leading-tight">
              Adzan {activePrayerName}
            </h3>
            <p className="text-[11px] text-emerald-100/80 truncate">
              {locationName || 'Wilayah Anda'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={stopAdzan}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 border border-white/50"
            title="Hentikan Suara Adzan"
          >
            <Square className="w-3.5 h-3.5 fill-emerald-800" />
            <span>Stop</span>
          </button>
          <button
            onClick={stopAdzan}
            className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-100 hover:text-white transition-colors"
            title="Tutup Banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
