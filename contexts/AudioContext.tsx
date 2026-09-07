import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Surah, Ayah, RadioStation, AudioLibraryItem } from '../types';
import { getSurahDetail } from '../services/quranApiService';
import { generateSpeech } from '../services/geminiService';
import { playIndonesianTranslationAudio, stopIndonesianTranslationAudio } from '../services/translationAudioService';
import { getSurahTranslationAudioUrl, ALL_SURAH_TRANSLATION_ITEMS } from '../services/surahTranslationAudioData';

interface TtsInfo {
  text: string;
  title: string;
  id: string;
  isArabic: boolean;
}

interface AudioContextType {
  isPlaying: boolean;
  isLooping: boolean;
  currentSurah: Surah | null;
  currentAyah: Ayah | null;
  currentRadio: RadioStation | null;
  currentTtsInfo: TtsInfo | null;
  currentLibraryItem: AudioLibraryItem | null;
  isTtsActive: boolean;
  isTranslationPlaying: boolean;
  audioCurrentTime: number;
  audioDuration: number;
  playbackProgress: number;
  autoPlayTranslation: boolean;
  setAutoPlayTranslation: (val: boolean) => void;
  mode: 'quran' | 'radio' | 'tts' | 'library';
  selectedQari: string;
  setSelectedQari: (qari: string) => void;
  playAyah: (surah: Surah, ayah: Ayah, playlist: Ayah[]) => void;
  playTranslationOnly: (surah: Surah, ayah: Ayah) => void;
  playRadio: (station: RadioStation) => void;
  playLibraryTrack: (item: AudioLibraryItem, playlist: AudioLibraryItem[]) => void;
  playSurahFullTranslation: (surahNumber: number, surahNameLatin: string) => void;
  speakTts: (text: string, isArabic: boolean, title: string, id: string) => Promise<void>;
  prefetchTts: (text: string, isArabic: boolean) => Promise<void>;
  togglePlay: () => void;
  toggleLoop: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  stop: () => void;
  stopTts: () => void;
  isLoading: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const AUDIO_BISMILLAH = "https://everyayah.com/data/Alafasy_128kbps/001001.mp3";
const DEFAULT_COVER = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj5xgiBRRnThfyCvkYoDUlJkMlkzdovttN9zu0HFTYnFeixBpPZNEBDfeHTJVTUg8gNhNSsoE9vOS7EMNVSalLfcSl9FHHxt906NvvBVPLuNc7QIyVoa7ruFZtwQqvg0sh8EUQrpD6fcbsl8pTeynswUkGG-_DZLK0r1YPeOehIIylvWJVRiIpSb1Csurr1/s320/logo%20santri%20modern%20warna.jpeg";

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(() => localStorage.getItem('santriai_audio_loop') === 'true');
  const [mode, setMode] = useState<'quran' | 'radio' | 'tts' | 'library'>('quran');
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [currentAyah, setCurrentAyah] = useState<Ayah | null>(null);
  const [currentRadio, setCurrentRadio] = useState<RadioStation | null>(null);
  const [currentLibraryItem, setCurrentLibraryItem] = useState<AudioLibraryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQari, setSelectedQariState] = useState<string>(() => {
    const saved = localStorage.getItem('santriai_quran_qari') || '05';
    const validQaris = ['05', '03', '06', '01', '02', '04', 'husary', 'minshawy'];
    return validQaris.includes(saved) ? saved : '05';
  });

  const setSelectedQari = useCallback((qari: string) => {
    setSelectedQariState(qari);
    localStorage.setItem('santriai_quran_qari', qari);
  }, []);

  const [isTranslationPlaying, setIsTranslationPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [autoPlayTranslation, setAutoPlayTranslationState] = useState(() => {
    return localStorage.getItem('santriai_quran_autoplay_translation') === 'true';
  });

  const playbackProgress = audioDuration > 0 ? Math.min(1, Math.max(0, audioCurrentTime / audioDuration)) : 0;

  const attachAudioListeners = useCallback((audio: HTMLAudioElement) => {
    setAudioCurrentTime(0);
    setAudioDuration(0);
    audio.ontimeupdate = () => {
      setAudioCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };
    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };
  }, []);

  const setAutoPlayTranslation = useCallback((val: boolean) => {
    setAutoPlayTranslationState(val);
    localStorage.setItem('santriai_quran_autoplay_translation', String(val));
  }, []);

  const [currentTtsInfo, setCurrentTtsInfo] = useState<TtsInfo | null>(null);
  const browserAudioRef = useRef<HTMLAudioElement | null>(null);
  const translationCancelRef = useRef<(() => void) | null>(null);

  const quranPlaylistRef = useRef<Ayah[]>([]);
  const libraryPlaylistRef = useRef<AudioLibraryItem[]>([]);
  const currentIndexRef = useRef<number>(-1);
  const isBismillahPlayingRef = useRef(false);
  const surahRef = useRef<Surah | null>(null);

  // Synchronized state refs for flawless asynchronous event access
  const autoPlayTranslationRef = useRef(autoPlayTranslation);
  autoPlayTranslationRef.current = autoPlayTranslation;

  const currentAyahRef = useRef(currentAyah);
  currentAyahRef.current = currentAyah;

  const currentSurahRef = useRef(currentSurah);
  currentSurahRef.current = currentSurah;

  const isTranslationPlayingRef = useRef(isTranslationPlaying);
  isTranslationPlayingRef.current = isTranslationPlaying;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const isLoopingRef = useRef(isLooping);
  isLoopingRef.current = isLooping;

  const selectedQariRef = useRef(selectedQari);
  selectedQariRef.current = selectedQari;

  const handleAudioEndedRef = useRef<() => void>(() => {});

  useEffect(() => {
    localStorage.setItem('santriai_audio_loop', String(isLooping));
  }, [isLooping]);

  const stopBrowserAudio = useCallback(() => {
    if (translationCancelRef.current) {
      translationCancelRef.current();
      translationCancelRef.current = null;
    }
    stopIndonesianTranslationAudio();
    setIsTranslationPlaying(false);
    isTranslationPlayingRef.current = false;
    setAudioCurrentTime(0);
    setAudioDuration(0);

    if (browserAudioRef.current) {
      browserAudioRef.current.pause();
      browserAudioRef.current.src = "";
      browserAudioRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (window.AndroidNativeInterface?.stopQuranAudio) {
      window.AndroidNativeInterface.stopQuranAudio();
    }
    stopBrowserAudio();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setIsLoading(false);
    setCurrentSurah(null);
    setCurrentAyah(null);
    setCurrentRadio(null);
    setCurrentTtsInfo(null);
    setCurrentLibraryItem(null);
  }, [stopBrowserAudio]);

  const stopTts = useCallback(() => {
    stop();
  }, [stop]);

  const playCurrentQuranAyah = useCallback(() => {
    const list = quranPlaylistRef.current;
    const idx = currentIndexRef.current;
    if (idx < 0 || idx >= list.length) return;
    const ayahToPlay = list[idx];
    const surahOfAyah = surahRef.current;
    if (!ayahToPlay || !surahOfAyah) return;

    const qari = selectedQariRef.current;
    const sPad = String(surahOfAyah.number).padStart(3, '0');
    const aPad = String(ayahToPlay.number).padStart(3, '0');
    const filename = `${sPad}${aPad}.mp3`;
    
    let audioUrl = "";
    let qariName = "Misyari Rasyid Al-Afasi";

    switch (qari) {
      case '03':
        audioUrl = (ayahToPlay as any).audioMap?.['03'] || `https://cdn.equran.id/audio-partial/Abdurrahman-as-Sudais/${filename}`;
        qariName = 'Abdurrahman As-Sudais';
        break;
      case '06':
        audioUrl = (ayahToPlay as any).audioMap?.['06'] || `https://cdn.equran.id/audio-partial/Yasser-Al-Dosari/${filename}`;
        qariName = 'Yasser Al-Dosari';
        break;
      case '01':
        audioUrl = (ayahToPlay as any).audioMap?.['01'] || `https://cdn.equran.id/audio-partial/Abdullah-Al-Juhany/${filename}`;
        qariName = 'Abdullah Al-Juhany';
        break;
      case '02':
        audioUrl = (ayahToPlay as any).audioMap?.['02'] || `https://cdn.equran.id/audio-partial/Abdul-Muhsin-Al-Qasim/${filename}`;
        qariName = 'Abdul-Muhsin Al-Qasim';
        break;
      case '04':
        audioUrl = (ayahToPlay as any).audioMap?.['04'] || `https://cdn.equran.id/audio-partial/Ibrahim-Al-Dossari/${filename}`;
        qariName = 'Ibrahim Al-Dossari';
        break;
      case 'saadalghamdi':
      case 'ar.saadalghamdi':
        audioUrl = `https://everyayah.com/data/Ghamadi_40kbps/${filename}`;
        qariName = 'Saad Al-Ghamidi';
        break;
      case 'hanirifai':
      case 'ar.hanirifai':
        audioUrl = `https://everyayah.com/data/Hani_Rifai_192kbps/${filename}`;
        qariName = 'Hani Ar-Rifai';
        break;
      case 'husary':
        audioUrl = `https://everyayah.com/data/Husary_128kbps/${filename}`;
        qariName = 'Mahmoud Khalil Al-Husary';
        break;
      case 'minshawy':
        audioUrl = `https://everyayah.com/data/Minshawy_Mujawwad_192kbps/${filename}`;
        qariName = 'Muhammad Siddiq Al-Minshawi';
        break;
      case '05':
      default:
        audioUrl = (ayahToPlay as any).audioMap?.['05'] || ayahToPlay.audio || `https://cdn.equran.id/audio-partial/Misyari-Rasyid-Al-Afasi/${filename}`;
        qariName = 'Misyari Rasyid Al-Afasi';
        break;
    }

    setIsLoading(true);
    setCurrentAyah(ayahToPlay);
    currentAyahRef.current = ayahToPlay;
    setIsTranslationPlaying(false);
    isTranslationPlayingRef.current = false;

    if (window.AndroidNativeInterface?.playQuranAudio) {
      window.AndroidNativeInterface.playQuranAudio(
        audioUrl,
        `QS. ${surahOfAyah.name_latin}: ${ayahToPlay.number}`,
        qariName,
        DEFAULT_COVER
      );
      setIsPlaying(true);
      isPlayingRef.current = true;
    } else {
      stopBrowserAudio();
      const audio = new Audio(audioUrl);
      browserAudioRef.current = audio;
      attachAudioListeners(audio);
      audio.onended = () => {
        handleAudioEndedRef.current();
      };
      audio.play().catch(console.error);
      setIsPlaying(true);
      isPlayingRef.current = true;
    }
    setIsLoading(false);
  }, [attachAudioListeners, stopBrowserAudio]);

  const playCurrentLibraryTrack = useCallback(() => {
    const list = libraryPlaylistRef.current;
    const idx = currentIndexRef.current;
    if (idx < 0 || idx >= list.length) return;
    const item = list[idx];

    setIsLoading(true);
    setCurrentLibraryItem(item);
    if (window.AndroidNativeInterface?.playQuranAudio) {
      window.AndroidNativeInterface.playQuranAudio(
        item.url,
        item.title,
        item.artist,
        item.cover || DEFAULT_COVER
      );
      setIsPlaying(true);
      isPlayingRef.current = true;
    } else {
      stopBrowserAudio();
      const audio = new Audio(item.url);
      browserAudioRef.current = audio;
      attachAudioListeners(audio);
      audio.onended = () => {
        handleAudioEndedRef.current();
      };
      audio.play().catch(console.error);
      setIsPlaying(true);
      isPlayingRef.current = true;
    }
    setIsLoading(false);
  }, [attachAudioListeners, stopBrowserAudio]);

  const playAyah = useCallback((surah: Surah, ayah: Ayah, playlistData: Ayah[]) => {
    stopBrowserAudio();
    setMode('quran');
    modeRef.current = 'quran';
    setCurrentRadio(null);
    setCurrentTtsInfo(null);
    setCurrentLibraryItem(null);
    quranPlaylistRef.current = playlistData;
    currentIndexRef.current = playlistData.findIndex(a => a.id === ayah.id);
    setCurrentSurah(surah);
    setCurrentAyah(ayah);
    surahRef.current = surah;
    currentSurahRef.current = surah;
    currentAyahRef.current = ayah;

    const isVerseOne = ayah.number === 1;
    const isAtTaubah = surah.number === 9;
    const isAlFatihah = surah.number === 1;

    if (isVerseOne && !isAtTaubah && !isAlFatihah) {
      isBismillahPlayingRef.current = true;
      if (window.AndroidNativeInterface?.playQuranAudio) {
        window.AndroidNativeInterface.playQuranAudio(AUDIO_BISMILLAH, "Basmalah", "Al-Afasy", DEFAULT_COVER);
        setIsPlaying(true);
        isPlayingRef.current = true;
      } else {
        stopBrowserAudio();
        const audio = new Audio(AUDIO_BISMILLAH);
        browserAudioRef.current = audio;
        attachAudioListeners(audio);
        audio.onended = () => {
          handleAudioEndedRef.current();
        };
        audio.play().catch(console.error);
        setIsPlaying(true);
        isPlayingRef.current = true;
      }
    } else {
      isBismillahPlayingRef.current = false;
      playCurrentQuranAyah();
    }
  }, [attachAudioListeners, playCurrentQuranAyah, stopBrowserAudio]);

  const playLibraryTrack = useCallback((item: AudioLibraryItem, playlist: AudioLibraryItem[]) => {
    stopBrowserAudio();
    setMode('library');
    modeRef.current = 'library';
    setCurrentSurah(null);
    setCurrentAyah(null);
    setCurrentRadio(null);
    setCurrentTtsInfo(null);
    libraryPlaylistRef.current = playlist;
    currentIndexRef.current = playlist.findIndex(i => i.id === item.id);
    playCurrentLibraryTrack();
  }, [playCurrentLibraryTrack, stopBrowserAudio]);

  const playSurahFullTranslation = useCallback((surahNumber: number, surahNameLatin: string) => {
    const item = ALL_SURAH_TRANSLATION_ITEMS.find(i => i.id === `surah_trans_${surahNumber}`) || {
      id: `surah_trans_${surahNumber}`,
      category: 'terjemahan_quran' as any,
      title: `QS. ${surahNumber}. ${surahNameLatin} (Terjemahan ID)`,
      artist: 'Misyari Rasyid & Narator ID',
      url: getSurahTranslationAudioUrl(surahNumber),
      cover: DEFAULT_COVER
    };
    playLibraryTrack(item, ALL_SURAH_TRANSLATION_ITEMS);
  }, [playLibraryTrack]);

  const nextTrack = useCallback(async () => {
    if (modeRef.current === 'radio' || modeRef.current === 'tts') return;
    
    if (modeRef.current === 'library') {
      if (currentIndexRef.current < libraryPlaylistRef.current.length - 1) {
        currentIndexRef.current += 1;
        playCurrentLibraryTrack();
      } else if (isLoopingRef.current) {
        currentIndexRef.current = 0;
        playCurrentLibraryTrack();
      } else {
        stop();
      }
      return;
    }

    // Quran Mode
    if (currentIndexRef.current < quranPlaylistRef.current.length - 1) {
      currentIndexRef.current += 1;
      playCurrentQuranAyah();
    } else {
      const currentSurahNum = surahRef.current?.number;
      if (currentSurahNum && currentSurahNum < 114) {
        try {
          setIsLoading(true);
          const nextSurah = await getSurahDetail(currentSurahNum + 1);
          setIsLoading(false);
          if (nextSurah?.ayahs?.length > 0) {
            playAyah(nextSurah, nextSurah.ayahs[0], nextSurah.ayahs);
          } else { 
            stop(); 
          }
        } catch { 
          stop(); 
        }
      } else { 
        stop(); 
      }
    }
  }, [playCurrentLibraryTrack, playCurrentQuranAyah, playAyah, stop]);

  const prevTrack = useCallback(() => {
    if (modeRef.current === 'radio' || modeRef.current === 'tts') return;
    if (currentIndexRef.current > 0) {
      currentIndexRef.current -= 1;
      if (modeRef.current === 'library') playCurrentLibraryTrack();
      else playCurrentQuranAyah();
    }
  }, [playCurrentLibraryTrack, playCurrentQuranAyah]);

  const playRadio = useCallback((station: RadioStation) => {
    stopBrowserAudio();
    setMode('radio');
    modeRef.current = 'radio';
    setCurrentSurah(null);
    setCurrentAyah(null);
    setCurrentTtsInfo(null);
    setCurrentLibraryItem(null);
    setCurrentRadio(station);
    setIsLoading(true);
    window.AndroidNativeInterface?.playQuranAudio(station.url, station.name, `Radio - ${station.location}`, station.logo || DEFAULT_COVER);
    setIsPlaying(true);
    isPlayingRef.current = true;
    setTimeout(() => setIsLoading(false), 1500);
  }, [stopBrowserAudio]);

  const speakTts = useCallback(async (text: string, isArabic: boolean, title: string, id: string) => {
    if (currentTtsInfo?.id === id) {
      togglePlay();
      return;
    }
    stop();
    setIsLoading(true);
    setMode('tts');
    modeRef.current = 'tts';
    setCurrentTtsInfo({ text, title, id, isArabic });
    try {
      const audioUrl = await generateSpeech(text, isArabic);
      if (!audioUrl) throw new Error("Audio URL failed.");
      if (window.AndroidNativeInterface?.playQuranAudio) {
        window.AndroidNativeInterface.playQuranAudio(audioUrl, title, text, DEFAULT_COVER);
        setIsPlaying(true);
        isPlayingRef.current = true;
      } else {
        const audio = new Audio(audioUrl);
        browserAudioRef.current = audio;
        audio.onended = () => { 
          setIsPlaying(false); 
          isPlayingRef.current = false;
          setCurrentTtsInfo(null); 
        };
        await audio.play();
      }
    } catch (e) {
      console.error(e);
      setCurrentTtsInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentTtsInfo, stop]);

  const prefetchTts = useCallback(async (text: string, isArabic: boolean) => {
    if (!text || text.length < 5) return;
    try {
      await generateSpeech(text, isArabic);
    } catch (e) {}
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      window.AndroidNativeInterface?.pauseQuranAudio();
      browserAudioRef.current?.pause();
      if (isTranslationPlayingRef.current) {
        stopIndonesianTranslationAudio();
      }
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      window.AndroidNativeInterface?.resumeQuranAudio();
      browserAudioRef.current?.play();
      setIsPlaying(true);
      isPlayingRef.current = true;
    }
  }, [isPlaying]);

  const toggleLoop = useCallback(() => {
    setIsLooping(prev => !prev);
  }, []);

  const playTranslationOnly = useCallback((surah: Surah, ayah: Ayah) => {
    stopBrowserAudio();
    setMode('quran');
    modeRef.current = 'quran';
    setCurrentSurah(surah);
    setCurrentAyah(ayah);
    surahRef.current = surah;
    currentSurahRef.current = surah;
    currentAyahRef.current = ayah;
    setIsPlaying(true);
    isPlayingRef.current = true;
    setIsTranslationPlaying(true);
    isTranslationPlayingRef.current = true;

    translationCancelRef.current = playIndonesianTranslationAudio(
      ayah.text,
      () => {
        setIsTranslationPlaying(true);
        isTranslationPlayingRef.current = true;
        setIsPlaying(true);
        isPlayingRef.current = true;
      },
      () => {
        setIsTranslationPlaying(false);
        isTranslationPlayingRef.current = false;
        setIsPlaying(false);
        isPlayingRef.current = false;
        translationCancelRef.current = null;
      },
      (err) => {
        console.error('Translation audio error:', err);
        setIsTranslationPlaying(false);
        isTranslationPlayingRef.current = false;
        setIsPlaying(false);
        isPlayingRef.current = false;
        translationCancelRef.current = null;
      }
    );
  }, [stopBrowserAudio]);

  // Master handler for audio ended events
  handleAudioEndedRef.current = () => {
    if (modeRef.current === 'tts') {
      stop();
      return;
    }
    if (modeRef.current === 'radio') return;
    
    if (isBismillahPlayingRef.current) {
      isBismillahPlayingRef.current = false;
      playCurrentQuranAyah();
      return;
    }

    // Auto-play Indonesian Translation if active
    const currentAyahItem = quranPlaylistRef.current[currentIndexRef.current] || currentAyahRef.current;
    if (modeRef.current === 'quran' && autoPlayTranslationRef.current && currentAyahItem && !isTranslationPlayingRef.current) {
      setIsTranslationPlaying(true);
      isTranslationPlayingRef.current = true;
      
      translationCancelRef.current = playIndonesianTranslationAudio(
        currentAyahItem.text,
        () => {
          setIsTranslationPlaying(true);
          isTranslationPlayingRef.current = true;
        },
        () => {
          setIsTranslationPlaying(false);
          isTranslationPlayingRef.current = false;
          translationCancelRef.current = null;
          nextTrack();
        },
        () => {
          setIsTranslationPlaying(false);
          isTranslationPlayingRef.current = false;
          translationCancelRef.current = null;
          nextTrack();
        }
      );
      return;
    }

    nextTrack();
  };

  useEffect(() => {
    (window as any).onNativeAudioEnded = () => handleAudioEndedRef.current();
    (window as any).setNativePlaybackState = (s: boolean) => {
      setIsPlaying(s);
      isPlayingRef.current = s;
    };

    // Sinkronisasi tombol bilah status bar Android (Play/Pause, Next, Prev)
    window.AppMediaControls = {
      togglePlay: () => {
        togglePlay();
      },
      playNext: () => {
        nextTrack();
      },
      playPrev: () => {
        prevTrack();
      },
      nextAyah: () => {
        nextTrack();
      },
      prevAyah: () => {
        prevTrack();
      }
    };

    return () => {
      delete (window as any).onNativeAudioEnded;
      delete (window as any).setNativePlaybackState;
    };
  }, [togglePlay, nextTrack, prevTrack]);

  // Live reload playing ayah audio if selected Qori changes during active playback
  useEffect(() => {
    if (mode === 'quran' && currentAyah && isPlaying && !isTranslationPlaying) {
      playCurrentQuranAyah();
    }
  }, [selectedQari]);

  return (
    <AudioContext.Provider value={{
      isPlaying, isLooping, currentSurah, currentAyah, currentRadio, currentTtsInfo, currentLibraryItem, isTtsActive: !!currentTtsInfo,
      isTranslationPlaying, audioCurrentTime, audioDuration, playbackProgress, autoPlayTranslation, setAutoPlayTranslation,
      mode, selectedQari, setSelectedQari,
      playAyah, playTranslationOnly, playRadio, playLibraryTrack, playSurahFullTranslation, speakTts, prefetchTts, togglePlay, toggleLoop, nextTrack, prevTrack, stop, stopTts, isLoading
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) throw new Error('useAudio error');
  return context;
};
