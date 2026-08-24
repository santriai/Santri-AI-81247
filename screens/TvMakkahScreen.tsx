

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tv, MapPin, Youtube, Play, Loader2, Server } from 'lucide-react';


const CHANNELS = [
  { 
    id: 'makkah_hls', 
    name: 'Makkah TV', 
    icon: '🕋',
    videoId: '',
    streamUrl: 'http://m.live.net.sa:1935/live/quran/playlist.m3u8',
    cover: 'https://images.pexels.com/photos/18996760/pexels-photo-18996760/free-photo-of-kota-tengara-penunjuk-penanda.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=1200',
    desc: 'Siaran Langsung Makkah',
    type: 'hls'
  },
  { 
    id: 'madinah_hls', 
    name: 'Madinah TV', 
    icon: '🕌',
    videoId: '',
    streamUrl: 'http://m.live.net.sa:1935/live/sunnah/playlist.m3u8',
    cover: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80&w=1200',
    desc: 'Siaran Langsung Madinah',
    type: 'hls'
  }
];

const TvMakkahScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const plyrContainerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);

  // --- LOGIKA BARU & DIPERBAIKI ---

  // Efek ini hanya untuk RESET state saat channel diganti
  useEffect(() => {
    setIsPlaying(false); // Berhenti memutar saat ganti channel
    setIsLoading(false);
  }, [activeChannel]);

  // Efek ini hanya untuk MEMBUAT dan MENGHANCURKAN instance player
  useEffect(() => {
    // Jika isPlaying, buat instance baru
    if (isPlaying && plyrContainerRef.current && activeChannel.type === 'youtube') {
        const Plyr = (window as any).Plyr;
        if (!Plyr) {
            console.error("Plyr script not loaded.");
            setIsPlaying(false);
            return;
        }

        // Cleanup previous instance if exists (Safety)
        if (playerInstanceRef.current) {
            try { playerInstanceRef.current.destroy(); } catch (e) {}
        }

        const instance = new Plyr(plyrContainerRef.current, {
            autoplay: true,
            muted: false,
            playsinline: true,
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
            youtube: { noCookie: false, rel: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 }
        });

        playerInstanceRef.current = instance;
        instance.on('ready', () => setIsLoading(false));
    }

    // Fungsi cleanup: Selalu hancurkan instance jika isPlaying menjadi false atau komponen unmount
    return () => {
        if (playerInstanceRef.current) {
            try { playerInstanceRef.current.destroy(); } catch (e) {}
            playerInstanceRef.current = null;
        }
    };
  }, [isPlaying]); // Hanya bergantung pada isPlaying

  // Efek ini hanya untuk MEMPERBARUI SUMBER VIDEO
  useEffect(() => {
    // Jika ada instance player, perbarui sumbernya saat channel berubah
    if (playerInstanceRef.current && activeChannel.type === 'youtube') {
        playerInstanceRef.current.source = {
            type: 'video',
            sources: [{
                src: activeChannel.videoId,
                provider: 'youtube',
            }],
        };
    }
  }, [activeChannel]); // Hanya bergantung pada activeChannel

  const handlePlay = () => {
    if (activeChannel.type === 'hls' && window.AndroidNativeInterface?.playIptvStream) {
      try {
        window.AndroidNativeInterface.playIptvStream(activeChannel.streamUrl || '', activeChannel.name);
        return;
      } catch (err) {
        console.error("Gagal memanggil native player:", err);
      }
    }
    setIsLoading(true);
    setIsPlaying(true);
  };

  const handleChannelChange = (channel: typeof CHANNELS[0]) => {
    // If clicking the same channel, do nothing
    if (channel.id === activeChannel.id) return;

    // Show Interstitial Ad if available
    if (window.AndroidNativeInterface?.showInterstitialAd) {
      console.log("Requesting interstitial ad...");
      window.AndroidNativeInterface.showInterstitialAd();
    }

    // Change the channel content
    setActiveChannel(channel);
  };

  // --- SISA KODE RENDER (SEBAGIAN BESAR TIDAK BERUBAH) ---

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft size={24} /></button>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2"><Tv size={20} className="text-red-600" /> TV Haramain</h2>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-3xl mx-auto w-full flex flex-col">
         <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-3 rounded-xl mb-4 flex gap-3 items-center">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0"></div>
            <p className="text-xs text-red-700 dark:text-red-400 font-medium">SIARAN LANGSUNG 24 JAM</p>
         </div>

         <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-xl mb-6 relative border-4 border-slate-200 dark:border-slate-800 group">
            {!isPlaying ? (
                <button onClick={handlePlay} className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-cover bg-center group cursor-pointer" style={{ backgroundImage: `url(${activeChannel.type === 'hls' ? activeChannel.cover : `https://img.youtube.com/vi/${activeChannel.videoId}/hqdefault.jpg`})` }}>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg z-10 scale-90 group-hover:scale-100 transition-transform">
                     <Play size={32} className="text-white ml-1" fill="currentColor" />
                  </div>
                  <span className="text-white font-bold mt-3 z-10 text-sm drop-shadow-md bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                    {activeChannel.type === 'hls' && window.AndroidNativeInterface?.playIptvStream ? "Putar di Video Player HP" : "Ketuk untuk Memutar"}
                  </span>
                </button>
            ) : (
                <>
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                            <div className="flex flex-col items-center">
                                <Loader2 size={32} className="text-white animate-spin mb-2" />
                                <span className="text-white text-xs">Menghubungkan...</span>
                            </div>
                        </div>
                    )}
                    
                    {activeChannel.type === 'youtube' ? (
                        <div ref={plyrContainerRef} className="js-player w-full h-full" data-plyr-provider="youtube" data-plyr-embed-id={activeChannel.videoId} />
                    ) : (
                        <video 
                            src={activeChannel.streamUrl} 
                            controls 
                            autoPlay 
                            playsInline 
                            onCanPlay={() => setIsLoading(false)}
                            className="w-full h-full object-contain bg-black"
                        />
                    )}
                </>
            )}
         </div>

         {/* Channel Switcher */}
         <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-3 px-1">Pilih Lokasi</h3>
         <div className="grid grid-cols-2 gap-3 mb-6">
            {CHANNELS.map(ch => {
               const isActive = activeChannel.id === ch.id;
               const isMakkah = ch.id === 'makkah_hls';
               return (
                <button
                    key={ch.id}
                    onClick={() => handleChannelChange(ch)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1.5 relative overflow-hidden group shadow-sm active:scale-[0.98] ${
                      isActive 
                        ? (isMakkah 
                            ? 'bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white border-amber-400 shadow-emerald-900/30 ring-2 ring-emerald-500/40' 
                            : 'bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white border-emerald-400 shadow-teal-900/30 ring-2 ring-teal-500/40')
                        : (isMakkah
                            ? 'bg-emerald-50/90 dark:bg-emerald-950/40 text-slate-800 dark:text-slate-100 border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                            : 'bg-teal-50/90 dark:bg-teal-950/40 text-slate-800 dark:text-slate-100 border-teal-200/80 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/50')
                    }`}
                >
                    <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl leading-none">{ch.icon}</span>
                          <span className={`font-black text-sm tracking-tight ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>{ch.name}</span>
                        </div>
                        {isActive && <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse border border-white shrink-0 shadow-xs"></div>}
                    </div>
                    <span className={`text-xs flex items-center gap-1 font-semibold ${isActive ? 'text-emerald-100' : 'text-slate-600 dark:text-slate-300'}`}>
                      <MapPin size={12} className={isActive ? 'text-amber-300' : (isMakkah ? 'text-emerald-600 dark:text-emerald-400' : 'text-teal-600 dark:text-teal-400')} /> {ch.desc}
                    </span>
                    {isActive && <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-400"></div>}
                </button>
               );
            })}
         </div>

         <div className="mt-auto text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">Sumber: Server Live Haramain</p>
         </div>
      </div>
    </div>
  );
};

export default TvMakkahScreen;
