
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Volume2, StopCircle, Play, Bell, BellOff, VolumeX, Square, Circle } from 'lucide-react';
import { usePrayer } from '../contexts/PrayerContext';
import { useToast } from '../contexts/ToastContext';

interface SoundOption {
  id: string;
  label: string;
  type: 'system' | 'audio';
  src?: string; 
  cover?: string; 
}

// Daftar Pilihan Audio dengan Gambar
const SOUND_OPTIONS: SoundOption[] = [
  { id: 'off', label: 'Matikan Notifikasi', type: 'system' },
  { id: 'default', label: 'Suara Bawaan', type: 'system' },
  { id: 'silent', label: 'Senyap (Notifikasi Tanpa Suara)', type: 'system' },
  { 
    id: 'ass_santri_ai', 
    label: 'Ass Santri AI', 
    type: 'audio', 
    src: 'https://ia601600.us.archive.org/1/items/assalamualaikumsantriai/assalamualaikum%2CsantriAI.mp3',
    cover: 'https://i.imgur.com/8G5I4Z5.jpg'
  },
  { 
    id: 'adzan_mekkah', 
    label: 'Adzan - Makkah', 
    type: 'audio',
    src: 'https://ia601304.us.archive.org/21/items/Mp3CollectionAdzan/adzan-makkah1%20-.mp3',
    cover: 'https://i.imgur.com/8G5I4Z5.jpg' // Gambar Ka'bah
  },
  { 
    id: 'adzan_madinah', 
    label: 'Adzan - Madinah', 
    type: 'audio', 
    src: 'https://ia800502.us.archive.org/10/items/adzan_201409/Adzan%20H.%20Muammar%20ZA.mp3',
    cover: 'https://i.imgur.com/sC4x03a.png' // Gambar Masjid Nabawi (Contoh)
  },
  { 
    id: 'adzan_aqsa', 
    label: 'Adzan - Al Aqsa', 
    type: 'audio', 
    src: 'https://pondokislami.com/wp-content/uploads/2024/02/download-suara-adzan-al-aqsa1.mp3',
    cover: 'https://i.imgur.com/sC4x03a.png' // Gambar Masjid Al Aqsa (Contoh)
  },
  { id: 'adzan_indonesia', label: 'Adzan - Indonesia', type: 'audio', src: 'https://pondokislami.com/wp-content/uploads/2024/02/download-suara-adzan-indonesia.mp3' },
  { id: 'adzan_subuh', label: 'Adzan Subuh', type: 'audio', src: 'https://pondokislami.com/wp-content/uploads/2024/02/download-suara-adzan-subuh.mp3' },
  { id: 'adzan_subuh_madinah', label: 'Adzan Subuh (Madinah)', type: 'audio', src: 'https://pondokislami.com/wp-content/uploads/2024/02/download-suara-adzan-subuh-madinah.mp3' },
  { id: 'adzan_subuh_abu_hazim', label: 'Adzan Subuh (Abu Hazim)', type: 'audio', src: 'https://pondokislami.com/wp-content/uploads/2024/02/download-suara-adzan-subuh-abu-hazim.mp3' },
  { id: 'adzan_abdul_basit', label: 'Adzan - Abdul Basit', type: 'audio', src: 'https://pondokislami.com/wp-content/uploads/2024/02/download-suara-adzan-abdul-basset.mp3' },
  { id: 'adzan_anak', label: 'Adzan - Anak (A. Saud)', type: 'audio', src: 'https://pondokislami.com/wp-content/uploads/2024/02/download-suara-adzan-anak-ahmad-saud.mp3' },
];

const NotificationSelectorScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { soundSettings, setSoundSetting, setNotificationStatus, notifications } = usePrayer(); 
  const { showToast } = useToast();
  
  const prayerName = (location.state as any)?.prayerName || 'Subuh';
  
  const isActive = notifications[prayerName];
  const currentSoundId = isActive ? (soundSettings?.[prayerName] || 'default') : 'off';
  
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSelectSound = (sound: SoundOption) => {
    if (sound.id === 'off') {
        setNotificationStatus(prayerName, false);
        navigate(-1);
        return;
    }

    setNotificationStatus(prayerName, true);
    setSoundSetting(prayerName, sound.id);

    if (sound.type === 'audio' && sound.src) {
      if (window.AndroidNativeInterface && typeof window.AndroidNativeInterface.setAdhanAudio === 'function') {
        try {
          window.AndroidNativeInterface.setAdhanAudio(prayerName, sound.src, sound.cover || '');
          showToast(`Suara ${sound.label} berhasil disimpan`, 'success');
          try {
            const stored = localStorage.getItem('santriai_synced_adhan_audios');
            const map = stored ? JSON.parse(stored) : {};
            map[prayerName] = sound.src;
            localStorage.setItem('santriai_synced_adhan_audios', JSON.stringify(map));
          } catch (e) {}
        } catch (e) {
          console.error("Gagal mengirim perintah unduh ke Android:", e);
        }
      }
    } else {
        // Handle reset untuk 'default' atau 'silent'
        if (window.AndroidNativeInterface && typeof window.AndroidNativeInterface.setAdhanAudio === 'function') {
          // Mengirim string kosong untuk memberi tahu Android agar menghapus setelan kustom
          window.AndroidNativeInterface.setAdhanAudio(prayerName, "", "");
          try {
            const stored = localStorage.getItem('santriai_synced_adhan_audios');
            if (stored) {
              const map = JSON.parse(stored);
              delete map[prayerName];
              localStorage.setItem('santriai_synced_adhan_audios', JSON.stringify(map));
            }
          } catch (e) {}
        }
    }
  };

  const handlePreview = (sound: SoundOption, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Jika sedang memutar suara yang sama, hentikan
    if (playingId === sound.id) {
      if (window.AndroidNativeInterface && typeof window.AndroidNativeInterface.stopQuranAudio === 'function') {
        try {
          window.AndroidNativeInterface.stopQuranAudio();
        } catch (err) {}
      }
      setPlayingId(null);
      return;
    }

    if (sound.type === 'audio' && sound.src) {
      // 1. Coba gunakan Native Android MediaPlayer jika ada (lebih handal dan tanpa blokir WebView)
      if (window.AndroidNativeInterface && typeof window.AndroidNativeInterface.playQuranAudio === 'function') {
        try {
          window.AndroidNativeInterface.playQuranAudio(
            sound.src,
            `Pratinjau: ${sound.label}`,
            'Santri AI Adzan Preview',
            sound.cover || ''
          );
          setPlayingId(sound.id);
          return;
        } catch (nativeErr) {
          console.warn("Native audio play failed, falling back to Web Audio:", nativeErr);
        }
      }

      // 2. Fallback HTML5 Audio jika berjalan di Browser Web biasa
      try {
        const audio = new Audio(sound.src);
        audioRef.current = audio;
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setPlayingId(sound.id);
            })
            .catch(error => {
              console.error("Playback failed:", error);
              if (error.name !== 'AbortError') {
                 showToast("Gagal memutar pratinjau audio.", "error");
              }
              setPlayingId(null);
            });
        }

        audio.onended = () => setPlayingId(null);
        audio.onerror = () => {
          showToast("Gagal memuat audio.", "error");
          setPlayingId(null);
        };
      } catch (audioErr) {
        showToast("Audio tidak didukung perangkat.", "error");
        setPlayingId(null);
      }
    }
  };

  useEffect(() => {
    // Request battery optimization exemption for uninterrupted adzan notifications
    if (window.AndroidNativeInterface && typeof window.AndroidNativeInterface.requestBatteryOptimizationExemption === 'function') {
      try {
        window.AndroidNativeInterface.requestBatteryOptimizationExemption();
      } catch (e) {
        console.error("Failed to request battery exemption:", e);
      }
    }

    return () => {
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
      }
    };
  }, []);

  const getIcon = (option: SoundOption) => {
    if (option.id === 'off') return <BellOff size={20} />;
    if (option.id === 'default') return <Bell size={20} />;
    if (option.id === 'silent') return <VolumeX size={20} />;
    return <Volume2 size={20} />;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <div className="sticky top-0 z-30 bg-santri-green text-white shadow-md px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-lg">Notifikasi {prayerName}</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4">Pilih Mode / Suara</h3>
          
          <div className="flex flex-col">
            {SOUND_OPTIONS.map((option) => {
              const isSelected = currentSoundId === option.id;
              const isPlaying = playingId === option.id;

              return (
                <div 
                  key={option.id}
                  onClick={() => handleSelectSound(option)}
                  className={`flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors ${
                    isSelected ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-slate-500 ${isSelected ? 'text-santri-green' : ''}`}>
                       {getIcon(option)}
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? 'text-santri-green font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                      {option.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {option.type === 'audio' && (
                      <button
                        type="button"
                        onClick={(e) => handlePreview(option, e)}
                        onTouchEnd={(e) => handlePreview(option, e)}
                        aria-label={`Dengarkan ${option.label}`}
                        className={`min-w-[44px] min-h-[44px] p-2.5 rounded-full flex items-center justify-center transition-all active:scale-95 z-10 relative ${
                          isPlaying 
                            ? 'text-santri-green bg-green-100 dark:bg-green-900/40 shadow-sm' 
                            : 'text-slate-400 hover:text-santri-green hover:bg-slate-100 dark:hover:bg-slate-700/60 active:bg-slate-200'
                        }`}
                      >
                        {isPlaying ? <StopCircle size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                      </button>
                    )}

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-santri-green' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 bg-santri-green rounded-full"></div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSelectorScreen;