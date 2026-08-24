
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BookOpen, CheckCircle, Mic, MicOff, 
  Loader2, Trophy, Bookmark, Play, X, Star, Lock, Coins, Gem,
  AlignLeft, AlignRight, Check, BarChart, Calendar, Layers, Clock,
  Eye, Layout, Sparkles, RotateCcw
} from 'lucide-react';
import { getAllSurahs, getSurahDetail, getJuzDetail } from '../services/quranApiService';
import { Surah, Ayah } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { useToast } from '../contexts/ToastContext';
import AiFeatureAssistant from '../src/components/AiFeatureAssistant';
import { subscribeToTahfidz, updateTahfidzProgress, updateUserData, subscribeToUserData, incrementUserGameStats, subscribeToLeaderboard, subscribeToKhatam, updateKhatamProgress, updateKhatamLastAyah, subscribeToKhatamLastAyah } from '../services/firebase';

const TahfidzScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      showToast("Tahfidz Tracker memerlukan login.", "info");
      navigate('/settings');
    }
  }, [user, authLoading, navigate, showToast]);

  const [activeMode, setActiveMode] = useState<'hafalan' | 'surah' | 'juz'>('hafalan');

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedJuz, setSelectedJuz] = useState<{ number: number, ayahs: Ayah[] } | null>(null);
  
  const [memorizedAyahs, setMemorizedAyahs] = useState<number[]>([]);
  const [completedSurahs, setCompletedSurahs] = useState<number[]>([]);
  const [completedJuz, setCompletedJuz] = useState<number[]>([]);
  const [lastCompletedSurahId, setLastCompletedSurahId] = useState<number>(0); 
  const [loading, setLoading] = useState(true);
  
  const [userStats, setUserStats] = useState({ points: 0, wasilah: 0, correctAnswers: 0, rank: '-' });
  
  const [isRecording, setIsRecording] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [activeAyah, setActiveAyah] = useState<Ayah | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);
  const [ayahSegments, setAyahSegments] = useState<string[]>([]);
  const [completedSegments, setCompletedSegments] = useState<boolean[]>([]);

  // SpeechRecognition states & references
  const recognitionRef = useRef<any>(null);
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [khatamTargetText, setKhatamTargetText] = useState<string>("");
  const [khatamAyahIndex, setKhatamAyahIndex] = useState<number>(0);
  const [savedKhatamIndex, setSavedKhatamIndex] = useState<number | null>(null);
  const [showResumeModal, setShowResumeModal] = useState<boolean>(false);

  const [showDoaKhatam, setShowDoaKhatam] = useState(false);

  const splitAyahIntoSegments = (text: string): string[] => {
    const parts = text.split(/([\u06D6-\u06DC])/g);
    const segments: string[] = [];
    
    let buffer = "";
    for (let i = 0; i < parts.length; i++) {
        buffer += parts[i];
        if (/[\u06D6-\u06DC]/.test(parts[i]) || i === parts.length - 1) {
            if (buffer.trim()) segments.push(buffer.trim());
            buffer = "";
        }
    }
    return segments.length > 0 ? segments : [text];
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAllSurahs();
      setSurahs(data);
      setLoading(false);
    };
    fetchData();

    let unsubscribeUser: () => void;
    let unsubscribeLeaderboard: () => void;
    let unsubscribeKhatamSurah: () => void;
    let unsubscribeKhatamJuz: () => void;

    if (user) {
        unsubscribeUser = subscribeToUserData(user.uid, (data) => {
            if (data) {
                if (data.lastCompletedSurah !== undefined) setLastCompletedSurahId(data.lastCompletedSurah);
                setUserStats(prev => ({ ...prev, points: data.points || 0, wasilah: data.wasilah || 0, correctAnswers: data.correctAnswers || 0 }));
            }
        });
        
        unsubscribeLeaderboard = subscribeToLeaderboard((users) => {
            const rankIndex = users.findIndex(u => u.id === user.uid);
            if (rankIndex !== -1) {
                setUserStats(prev => ({ ...prev, rank: (rankIndex + 1).toString() }));
            }
        });

        unsubscribeKhatamSurah = subscribeToKhatam(user.uid, 'surah', setCompletedSurahs);
        unsubscribeKhatamJuz = subscribeToKhatam(user.uid, 'juz', setCompletedJuz);
    } else {
        const savedLast = localStorage.getItem('tahfidz_guest_last_surah');
        if (savedLast) setLastCompletedSurahId(parseInt(savedLast));

        const savedSurahs = localStorage.getItem('khatam_guest_surah');
        if (savedSurahs) setCompletedSurahs(JSON.parse(savedSurahs));

        const savedJuz = localStorage.getItem('khatam_guest_juz');
        if (savedJuz) setCompletedJuz(JSON.parse(savedJuz));
    }

    return () => {
        if (unsubscribeUser) unsubscribeUser();
        if (unsubscribeLeaderboard) unsubscribeLeaderboard();
        if (unsubscribeKhatamSurah) unsubscribeKhatamSurah();
        if (unsubscribeKhatamJuz) unsubscribeKhatamJuz();
    };
  }, [user]);

  const toggleKhatam = async (type: 'surah' | 'juz', id: number) => {
      const isDone = type === 'surah' ? completedSurahs.includes(id) : completedJuz.includes(id);
      
      if (user) {
          await updateKhatamProgress(user.uid, type, id, !isDone);
          if (!isDone) await incrementUserGameStats(user.uid, 50, 0);
      } else {
          const next = isDone 
            ? (type === 'surah' ? completedSurahs.filter(i => i !== id) : completedJuz.filter(i => i !== id))
            : (type === 'surah' ? [...completedSurahs, id] : [...completedJuz, id]);
          
          if (type === 'surah') {
              setCompletedSurahs(next);
              localStorage.setItem('khatam_guest_surah', JSON.stringify(next));
          } else {
              setCompletedJuz(next);
              localStorage.setItem('khatam_guest_juz', JSON.stringify(next));
          }
      }
      showToast(`${type === 'surah' ? 'Surat' : 'Juz'} berhasil diperbarui!`, "success");
  };

  const handleSelectKhatamSurah = async (surah: Surah) => {
      const lastKhatam = completedSurahs.length > 0 ? Math.max(...completedSurahs) : 0;
      const isLocked = surah.number > lastKhatam + 1;
      
      if (isLocked) {
          showToast("Selesaikan surat sebelumnya dahulu!", "warning");
          return;
      }

      setLoading(true);
      const detail = await getSurahDetail(surah.number);
      if (detail) setSelectedSurah(detail);
      setLoading(false);
  };

  const handleSelectKhatamJuz = async (juzNum: number) => {
      const lastKhatam = completedJuz.length > 0 ? Math.max(...completedJuz) : 0;
      const isLocked = juzNum > lastKhatam + 1;

      if (isLocked) {
          showToast("Selesaikan Juz sebelumnya dahulu!", "warning");
          return;
      }

      setLoading(true);
      const ayahs = await getJuzDetail(juzNum);
      if (ayahs.length > 0) {
          setSelectedJuz({ number: juzNum, ayahs });
      } else {
          showToast("Gagal memuat data Juz. Silakan periksa koneksi internet Anda.", "error");
      }
      setLoading(false);
  };

  const startSpeechRecognition = (targetText: string) => {
    setTranscribedText("");
    setIsRecording(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        setTranscribedText("Deteksi suara tidak didukung di perangkat/browser ini. Silakan baca mandiri.");
        return;
    }

    try {
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ar-SA'; // Transkripsi bahasa Arab

        recognition.onresult = (event: any) => {
            let currentTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                currentTranscript += event.results[i][0].transcript;
            }
            if (currentTranscript.trim()) {
                setTranscribedText(currentTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                showToast("Izin mikrofon ditolak. Silakan berikan izin mikrofon.", "warning");
            } else if (event.error === 'network') {
                showToast("Pengenalan suara membutuhkan koneksi internet.", "error");
            }
        };

        recognition.onend = () => {
            // Speech recognition selesai
        };

        recognitionRef.current = recognition;
        recognition.start();
    } catch (err) {
        console.error("Gagal memulai SpeechRecognition:", err);
        showToast("Gagal memulai pendeteksi suara.", "error");
        setIsRecording(false);
    }
  };

  const handleNextSegment = async () => {
    if (activeAyah) {
        const newCompleted = [...completedSegments];
        newCompleted[activeSegmentIndex] = true;
        setCompletedSegments(newCompleted);

        if (activeSegmentIndex >= ayahSegments.length - 1) {
            await handleAyahCompletion(activeAyah);
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    console.error(e);
                }
            }
            setIsRecording(false);
            setActiveAyah(null);
        } else {
            const nextIdx = activeSegmentIndex + 1;
            setActiveSegmentIndex(nextIdx);
            setTranscribedText("");
            
            const nextSegmentText = ayahSegments[nextIdx];
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    console.error(e);
                }
            }
            setTimeout(() => {
                startSpeechRecognition(nextSegmentText);
            }, 100);
        }
    } else {
        const isSurah = !!selectedSurah && activeMode === 'surah';
        const isJuz = !!selectedJuz && activeMode === 'juz';
        const ayahsList = isJuz ? selectedJuz?.ayahs : selectedSurah?.ayahs;
        
        if (ayahsList && khatamAyahIndex < ayahsList.length - 1) {
            const nextIdx = khatamAyahIndex + 1;
            setKhatamAyahIndex(nextIdx);
            setTranscribedText("");
            
            const nextAyahText = ayahsList[nextIdx].arab;
            setKhatamTargetText(nextAyahText);
            
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    console.error(e);
                }
            }
            setTimeout(() => {
                startSpeechRecognition(nextAyahText);
            }, 100);
        } else {
            if (isSurah && selectedSurah) {
                await toggleKhatam('surah', selectedSurah.number); 
                setSelectedSurah(null);
            } else if (isJuz && selectedJuz) {
                await toggleKhatam('juz', selectedJuz.number);
                setSelectedJuz(null);
            }
            
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    console.error(e);
                }
            }
            setIsRecording(false);
            showToast("Hafalan berhasil diperbarui!", "success");
        }
    }
  };

  const handleResetTranscription = () => {
      setTranscribedText("");
      const currentTarget = activeAyah ? (ayahSegments[activeSegmentIndex] || activeAyah.arab) : (khatamTargetText || "");
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
          setTranscribedText("Deteksi suara tidak didukung di perangkat/browser ini. Silakan baca mandiri.");
          return;
      }

      if (recognitionRef.current) {
          try {
              recognitionRef.current.abort();
          } catch (e) {
              console.error(e);
          }
      }
      setTimeout(() => {
          startSpeechRecognition(currentTarget);
      }, 100);
  };

  const saveKhatamProgress = async (type: 'surah' | 'juz', id: number, index: number) => {
      localStorage.setItem(`khatam_progress_${type}_${id}`, index.toString());
      if (user) {
          try {
              await updateKhatamLastAyah(user.uid, type, id, index);
          } catch (e) {
              console.error("Gagal menyimpan progress khatam ke Firestore:", e);
          }
      }
  };

  useEffect(() => {
      let unsubscribe: (() => void) | undefined;
      
      const checkSavedProgress = async () => {
          const isJuz = !!selectedJuz && activeMode === 'juz';
          const type = isJuz ? 'juz' : 'surah';
          const id = isJuz ? selectedJuz?.number : (selectedSurah && activeMode === 'surah' ? selectedSurah.number : null);
          
          if (!id) {
              setSavedKhatamIndex(null);
              setShowResumeModal(false);
              return;
          }

          let savedIndex = 0;
          const localSaved = localStorage.getItem(`khatam_progress_${type}_${id}`);
          if (localSaved !== null) {
              savedIndex = parseInt(localSaved, 10);
          }

          if (user) {
              unsubscribe = subscribeToKhatamLastAyah(user.uid, type, id, (val) => {
                  const maxIndex = Math.max(val, savedIndex);
                  if (maxIndex > 0) {
                      setSavedKhatamIndex(maxIndex);
                      setShowResumeModal(true);
                  } else {
                      setSavedKhatamIndex(null);
                      setShowResumeModal(false);
                  }
              });
          } else if (savedIndex > 0) {
              setSavedKhatamIndex(savedIndex);
              setShowResumeModal(true);
          } else {
              setSavedKhatamIndex(null);
              setShowResumeModal(false);
          }
      };

      checkSavedProgress();

      return () => {
          if (unsubscribe) unsubscribe();
      };
  }, [selectedSurah, selectedJuz, activeMode, user]);

  useEffect(() => {
      const isJuz = !!selectedJuz && activeMode === 'juz';
      const type = isJuz ? 'juz' : 'surah';
      const id = isJuz ? selectedJuz?.number : (selectedSurah && activeMode === 'surah' ? selectedSurah.number : null);
      if (id && khatamAyahIndex > 0) {
          saveKhatamProgress(type, id, khatamAyahIndex);
      }
  }, [khatamAyahIndex, selectedSurah, selectedJuz, activeMode]);

  const lastIndexRef = useRef(khatamAyahIndex);
  useEffect(() => {
      lastIndexRef.current = khatamAyahIndex;
  }, [khatamAyahIndex]);

  useEffect(() => {
      return () => {
          const isJuz = !!selectedJuz && activeMode === 'juz';
          const type = isJuz ? 'juz' : 'surah';
          const id = isJuz ? selectedJuz?.number : (selectedSurah && activeMode === 'surah' ? selectedSurah.number : null);
          if (id && lastIndexRef.current >= 0) {
              localStorage.setItem(`khatam_progress_${type}_${id}`, lastIndexRef.current.toString());
              if (user) {
                  updateKhatamLastAyah(user.uid, type, id, lastIndexRef.current).catch(err => {
                      console.error("Gagal menyimpan progress otomatis saat keluar:", err);
                  });
              }
          }
      };
  }, [selectedSurah, selectedJuz, activeMode, user]);

  const startKhatamRecording = (targetText: string, startIndex: number = 0) => {
      setActiveAyah(null);
      setKhatamAyahIndex(startIndex);
      setKhatamTargetText(targetText);
      startSpeechRecognition(targetText);
  };

  useEffect(() => {
    if (user && selectedSurah) {
      const unsubscribe = subscribeToTahfidz(user.uid, selectedSurah.number, (data) => {
        setMemorizedAyahs(data || []);
      });
      return () => unsubscribe();
    } else if (!user && selectedSurah) {
        const saved = localStorage.getItem(`tahfidz_guest_${selectedSurah.number}`);
        if(saved) setMemorizedAyahs(JSON.parse(saved));
        else setMemorizedAyahs([]);
    }
  }, [user, selectedSurah]);

  const handleSelectSurah = async (surah: Surah) => {
    const isLocked = surah.number > lastCompletedSurahId + 1;
    if (isLocked) {
        showToast("Selesaikan surat sebelumnya terlebih dahulu!", "warning");
        return;
    }

    setLoading(true);
    const detail = await getSurahDetail(surah.number);
    if (detail) {
      setSelectedSurah(detail);
    }
    setLoading(false);
  };

  const prepareRecording = (ayah: Ayah) => {
      const segments = splitAyahIntoSegments(ayah.arab);
      setAyahSegments(segments);
      setCompletedSegments(new Array(segments.length).fill(false));
      setActiveSegmentIndex(0); 
      setActiveAyah(ayah);
      setKhatamTargetText("");
      
      const firstSegment = segments[0] || ayah.arab;
      startSpeechRecognition(firstSegment);
  };

  const handleAyahCompletion = async (ayah: Ayah) => {
      const totalAyah = selectedSurah?.number_of_ayah || 0;
      
      if (user && selectedSurah) {
          // Progress is updated in Firestore, but no points/exp are awarded.
          await updateTahfidzProgress(user.uid, selectedSurah.number, selectedSurah.name_latin, ayah.number, true, totalAyah);
      } else {
          const newSet = [...memorizedAyahs, ayah.number];
          setMemorizedAyahs(newSet);
          if(selectedSurah) localStorage.setItem(`tahfidz_guest_${selectedSurah.number}`, JSON.stringify(newSet));
          
          if (newSet.length === totalAyah && selectedSurah) {
              const newLast = Math.max(lastCompletedSurahId, selectedSurah.number);
              setLastCompletedSurahId(newLast);
              localStorage.setItem('tahfidz_guest_last_surah', newLast.toString());
          }
      }
      showToast("Ayat berhasil dihafal!", "success");
  };

  if (selectedSurah || selectedJuz) {
      const isSurahMode = !!selectedSurah && activeMode === 'surah';
      const isHafalanMode = !!selectedSurah && activeMode === 'hafalan';
      const isJuzMode = !!selectedJuz;

      const title = isSurahMode ? selectedSurah?.name_latin : isHafalanMode ? selectedSurah?.name_latin : `Juz ${selectedJuz?.number}`;
      const subtitle = isJuzMode ? "One Day One Juz" : selectedSurah?.meaning;
      const ayahs = isJuzMode ? selectedJuz?.ayahs : selectedSurah?.ayahs;
      
      const progress = isHafalanMode 
        ? Math.round((memorizedAyahs.length / (selectedSurah?.number_of_ayah || 1)) * 100)
        : (isSurahMode && completedSurahs.includes(selectedSurah?.number || 0) ? 100 : isJuzMode && completedJuz.includes(selectedJuz?.number || 0) ? 100 : 0);

      // We use the first ayah as verification target for "Reading mode" verification
      const verificationTarget = ayahs && ayahs.length > 0 ? ayahs[0].arab : "";

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                    <button onClick={() => {
                        const isJuz = !!selectedJuz && activeMode === 'juz';
                        const type = isJuz ? 'juz' : 'surah';
                        const id = isJuz ? selectedJuz?.number : selectedSurah?.number;
                        if (id && activeMode !== 'hafalan') {
                            saveKhatamProgress(type, id, khatamAyahIndex);
                        }
                        setSelectedSurah(null); 
                        setSelectedJuz(null); 
                    }} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
                    </button>
                    <div>
                        <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">{title}</h2>
                        <p className="text-[10px] text-slate-500 font-medium">{subtitle}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-green-600">{progress}%</span>
                        <div className="w-16 bg-slate-200 dark:bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                            <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
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
            </div>

            <div className="p-4 space-y-4">
                {(isSurahMode || isJuzMode) && progress < 100 && (
                    <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl mb-6 flex flex-col items-center text-center gap-4">
                        <Mic size={48} className="text-blue-200" />
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight">Setoran Bacaan</h3>
                            <p className="text-blue-100 text-xs mt-1">Gunakan tombol di bawah untuk merekam pembacaan awal ayat sebagai konfirmasi penyelesaian {isSurahMode ? 'Surah' : 'Juz'} ini.</p>
                        </div>
                        <button 
                          onClick={() => {
                              if (savedKhatamIndex && savedKhatamIndex > 0) {
                                  const index = savedKhatamIndex;
                                  const ayahsList = isJuzMode ? selectedJuz?.ayahs : selectedSurah?.ayahs;
                                  const targetText = ayahsList && index < ayahsList.length ? ayahsList[index].arab : verificationTarget;
                                  startKhatamRecording(targetText, index);
                              } else {
                                  startKhatamRecording(verificationTarget, 0);
                              }
                          }} 
                          disabled={isRecording || isVerifying}
                          className="w-full bg-white text-blue-600 py-4 !rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                          {isVerifying ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} />}
                          {isRecording ? "Mendengarkan..." : (savedKhatamIndex && savedKhatamIndex > 0 ? `Lanjutkan Setoran (Ayat ${savedKhatamIndex + 1})` : "Rekam Suara & Verifikasi")}
                        </button>
                    </div>
                )}

                {isHafalanMode ? (
                    selectedSurah?.ayahs?.map(ayah => {
                        const isMemorized = memorizedAyahs.includes(ayah.number);
                        const isPreviousMemorized = ayah.number === 1 || memorizedAyahs.includes(ayah.number - 1);
                        const isLocked = !isPreviousMemorized && !isMemorized;
                        const isActive = activeAyah?.id === ayah.id;
    
                        return (
                            <div key={ayah.id} id={`ayah-${ayah.number}`} className={`p-5 rounded-3xl border transition-all ${isMemorized ? 'bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : isActive ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 shadow-inner' : isLocked ? 'bg-slate-50 dark:bg-slate-900/50 opacity-60 grayscale' : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 shadow-sm'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isMemorized ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        Ayat {ayah.number}
                                    </div>
                                    {isMemorized && <CheckCircle size={18} className="text-green-500" fill="white" />}
                                    {isLocked && <Lock size={18} className="text-slate-300" />}
                                </div>
                                
                                {isActive ? (
                                    <div className="space-y-4 mb-4">
                                        <div className="bg-amber-100/30 text-amber-600 p-2 rounded-lg text-[10px] font-bold text-center border border-amber-200/50">Hafalkan per potongan:</div>
                                        {ayahSegments.map((seg, idx) => {
                                            const isDone = completedSegments[idx];
                                            const isCurrent = idx === activeSegmentIndex;
                                            
                                            return (
                                                <div key={idx} className={`p-4 rounded-2xl border transition-all ${isDone ? 'bg-green-100/50 border-green-200 dark:bg-green-900/40' : isCurrent ? 'bg-white border-blue-400 ring-4 ring-blue-50 shadow-md' : 'bg-slate-50 border-slate-100 opacity-40'}`}>
                                                    <p className="font-arabic text-2xl text-right mb-3 leading-relaxed" dir="rtl">{seg}</p>
                                                    {isCurrent && !isDone && (
                                                        <button 
                                                          onClick={() => startSpeechRecognition(seg)} 
                                                          className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                                                        >
                                                            <Mic size={14} /> Baca Ayat
                                                        </button>
                                                    )}
                                                    {isDone && <div className="text-[10px] text-green-600 font-black uppercase flex items-center gap-1.5"><CheckCircle size={14} fill="currentColor" className="text-white"/> Selesai</div>}
                                                </div>
                                            );
                                        })}
                                        <button onClick={() => setActiveAyah(null)} className="w-full py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">Batal</button>
                                    </div>
                                ) : (
                                    <p className={`text-right font-arabic text-3xl leading-[2.5] mb-4 text-slate-800 dark:text-slate-100 transition-all ${isLocked ? 'blur-md select-none opacity-40' : ''}`} dir="rtl">
                                        {ayah.arab}
                                    </p>
                                )}
                                
                                {!isMemorized && !isActive && (
                                    <button 
                                      onClick={() => prepareRecording(ayah)} 
                                      disabled={isLocked} 
                                      className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${isLocked ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-100 hover:shadow-green-200 active:scale-[0.98]'}`}
                                    >
                                        {isLocked ? <Lock size={16} /> : <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-green-600"><Mic size={14} /></div>}
                                        {isLocked ? 'Terkunci' : 'Setor Hafalan'}
                                    </button>
                                )}
                                
                                {isMemorized && !isActive && (
                                    <div className="text-center text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 py-3 rounded-2xl border border-green-200">
                                        Masha Allah! Hafal ✅
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <>
                        {ayahs?.map((ayah, index) => (
                            <div key={index} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm mb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400">
                                        {ayah.number}
                                    </span>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Surat ke-{ayah.surahNumber}</p>
                                </div>
                                <p className="text-right font-arabic text-3xl leading-[2.5] text-slate-800 dark:text-slate-100" dir="rtl">
                                    {ayah.arab}
                                </p>
                                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                                    <p className="text-xs text-slate-500 italic font-medium leading-relaxed">{ayah.text}</p>
                                </div>
                            </div>
                        ))}

                        {selectedJuz?.number === 30 && (
                            <div className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 rounded-[2.5rem] border border-amber-200/40 dark:border-amber-900/30 text-center relative overflow-hidden group shadow-md animate-in slide-in-from-bottom duration-500">
                                <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 animate-bounce">
                                        <Sparkles size={28} className="fill-white" />
                                    </div>
                                    <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Alhamdulillah, Selesai Juz 30!</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">Sempurnakan tilawah Juz 30 dan Khatam Al-Qur'an Anda dengan doa penuh keberkahan.</p>
                                    
                                    <button
                                        onClick={() => setShowDoaKhatam(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-wider"
                                    >
                                        BACA DOA KHATAM JUZ 30
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {isRecording && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-red-500 animate-pulse">
                        <Mic size={40} className="text-white animate-bounce" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-widest text-red-400 mb-2">Membaca Ayat...</h3>
                    <p className="text-xs text-white/50 mb-6 font-bold uppercase tracking-widest">Suara Anda sedang dideteksi secara real-time</p>
                    
                    <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 space-y-4 text-left">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left mb-2">
                                {activeAyah ? "Ayat Target:" : `Ayat Target (Ayat ${khatamAyahIndex + 1} dari ${(selectedJuz?.ayahs || selectedSurah?.ayahs || []).length}):`}
                            </p>
                            <p className="text-right font-arabic text-2xl text-white leading-relaxed font-bold" dir="rtl">
                                {activeAyah ? (ayahSegments[activeSegmentIndex] || activeAyah.arab) : (khatamTargetText || "Setoran Bacaan")}
                            </p>
                        </div>
                        
                        <div className="h-px bg-white/10 my-4" />
                        
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left mb-2">Hasil Catatan Bacaan Anda:</p>
                            {transcribedText ? (
                                <p className="text-right font-arabic text-2xl text-emerald-450 leading-relaxed font-bold" dir="rtl">
                                    {transcribedText}
                                </p>
                            ) : (
                                <p className="text-center text-xs text-white/40 italic py-3 font-medium">
                                    Silakan mulai membaca, teks yang Anda baca akan otomatis tercatat di sini...
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full max-w-sm justify-center">
                        <button 
                          onClick={handleNextSegment} 
                          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-950/20 border border-emerald-500/30 flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={16} />
                          {activeAyah ? (
                              activeSegmentIndex >= ayahSegments.length - 1 ? "Selesai Hafalan" : "Ayat Berikutnya"
                          ) : (
                              (() => {
                                  const isJuz = !!selectedJuz && activeMode === 'juz';
                                  const ayahsList = isJuz ? selectedJuz?.ayahs : selectedSurah?.ayahs;
                                  if (ayahsList && khatamAyahIndex >= ayahsList.length - 1) {
                                      return "Selesai Khatam";
                                  }
                                  return "Ayat Berikutnya";
                              })()
                          )}
                        </button>
                        <div className="flex gap-2">
                            <button 
                              onClick={handleResetTranscription} 
                              className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 active:scale-95 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-500/20 shadow-lg shadow-amber-950/20 flex items-center justify-center gap-1"
                            >
                              <RotateCcw size={12} /> Ulangi
                            </button>
                            {!activeAyah && (
                                <button 
                                  onClick={async () => {
                                      const isJuz = !!selectedJuz && activeMode === 'juz';
                                      const type = isJuz ? 'juz' : 'surah';
                                      const id = isJuz ? selectedJuz?.number : selectedSurah?.number;
                                      if (id) {
                                          await saveKhatamProgress(type, id, khatamAyahIndex);
                                          showToast("Progres bacaan terakhir berhasil disimpan!", "success");
                                      }
                                      if (recognitionRef.current) {
                                          try { recognitionRef.current.abort(); } catch (e) { console.error(e); }
                                      }
                                      setIsRecording(false);
                                      setActiveAyah(null);
                                  }} 
                                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20 shadow-lg shadow-blue-950/20 flex items-center justify-center gap-1"
                                >
                                  <Bookmark size={12} /> Simpan
                                </button>
                            )}
                            <button 
                              onClick={() => {
                                  if (recognitionRef.current) {
                                      try { recognitionRef.current.abort(); } catch (e) { console.error(e); }
                                  }
                                  setIsRecording(false);
                                  setActiveAyah(null);
                              }} 
                              className="flex-1 py-3 bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20"
                            >
                              Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDoaKhatam && (
                <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl shadow-sm">
                                    <Sparkles size={20} className="fill-white" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm leading-tight">Doa Khatamil Qur'an</h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">Selasai Membaca Juz 30</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowDoaKhatam(false)} 
                                className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-650 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6 flex-1 space-y-6">
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/10 dark:to-orange-950/5 p-5 rounded-2xl border border-amber-100/60 dark:border-amber-900/30 text-center">
                                <p className="font-arabic text-2xl leading-[2.3] text-amber-900 dark:text-amber-200 mb-2 font-black" dir="rtl">
                                    اَللّٰهُمَّ ارْحَمْنِيْ بِالْقُرْآنِ. وَاجْعَلْهُ لِيْ إِمَامًا وَنُوْرًا وَهُدًى وَرَحْمَةً. اَللّٰهُمَّ ذَكِّرْنِيْ مِنْهُ مَانَسِيْتُ وَعَلِّمْنِيْ مِنْهُ مَا جَهِلْتُ. وَارْزُقْنِيْ تِلاَوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ NЕHَارِ. وَاجْعَلْهُ لِيْ حُجَّةً يَا رَبَّ الْعَالَمِيْنَ.
                                </p>
                                <div className="h-px bg-amber-200/50 dark:bg-amber-900/20 my-4" />
                                <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-2 leading-relaxed">
                                    "Allahummarhamni bil quran. Waj'alhu lii imaman wa nuran wa hudan wa rohmah. Allahumma dzakkirni minhu maa nasiitu wa 'allimni minhu maa jahiltu. Warzuqni tilaawatahu aana-allaili wa athroofan nahaar. Waj'alhu li hujjatan yaa robbal 'alamiin."
                                </p>
                            </div>
                            
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
                                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">Artinya:</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                                    "Ya Allah, rahmatilah aku dengan Al-Quran. Jadikanlah ia bagiku sebagai pemimpin, cahaya, petunjuk, dan rahmat. Ya Allah, ingatkanlah aku akan apa yang aku lupakan darinya, dan ajarkanlah kepadaku apa yang tidak aku ketahui darinya, dan berilah aku rezeki dengan membacanya di tengah malam dan di ujung siang, dan jadikanlah ia bagiku sebagai hujah (pembela), wahai Tuhan semesta alam."
                                </p>
                            </div>

                            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex gap-3 text-left">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <Trophy size={16} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-300">Fadhilah Khatam Qur'an</h4>
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 leading-relaxed">
                                        Rasulullah SAW bersabda: "Ketika khatam Al-Qur'an, diturunkanlah padanya rahmat dan didoakan oleh 60.000 malaikat." (HR. Ad-Dailami). Mari istiqomah membaca Al-Qur'an setiap hari.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 dark:border-slate-850 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                            <button 
                                onClick={() => setShowDoaKhatam(false)} 
                                className="w-full py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-md"
                            >
                                Selesai & Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <AiFeatureAssistant 
        featureName="Pakar Tahfidz" 
        placeholder="Tanyakan tips menghafal, cara muraja'ah, atau fadhilah hafidz Qur'an..." 
      />
        <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <ArrowLeft size={24} className="text-slate-600 dark:text-slate-300" />
                    </button>
                    <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <BookOpen size={20} className="text-green-600" /> Tahfidz Tracker
                    </h2>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Wasilah Badge */}
                    <button 
                      onClick={() => navigate('/premium')}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/15 active:scale-95 transition-all text-left"
                    >
                      <Gem size={12} className="text-cyan-500 fill-cyan-500/20 animate-pulse" />
                      <div className="flex flex-col">
                        <span className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase leading-none tracking-wider">Wasilah</span>
                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-100 leading-none mt-0.5">{userStats.wasilah.toLocaleString()}</span>
                      </div>
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
            </div>

            <div className="px-4 pb-3 flex justify-between gap-1.5">
                <button 
                  onClick={() => setActiveMode('hafalan')}
                  className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${activeMode === 'hafalan' ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                >
                  <Mic size={16} className="mb-0.5" />
                  <span className="text-[10px] font-black uppercase tracking-tight">Hafalan</span>
                </button>
                <button 
                  onClick={() => setActiveMode('surah')}
                  className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${activeMode === 'surah' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                >
                  <Layers size={16} className="mb-0.5" />
                  <span className="text-[10px] font-black uppercase tracking-tight">Khatam Surat</span>
                </button>
                <button 
                  onClick={() => setActiveMode('juz')}
                  className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${activeMode === 'juz' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                >
                  <Calendar size={16} className="mb-0.5" />
                  <span className="text-[10px] font-black uppercase tracking-tight">Khatam Juz</span>
                </button>
            </div>
       </div>

       <div className="p-4">
          <div className={`rounded-2xl p-6 text-white mb-6 shadow-lg relative overflow-hidden ${
              activeMode === 'hafalan' ? 'bg-gradient-to-br from-green-600 to-emerald-700' :
              activeMode === 'surah' ? 'bg-gradient-to-br from-blue-600 to-indigo-700' :
              'bg-gradient-to-br from-purple-600 to-violet-700'
          }`}>
              <div className="absolute inset-0 opacity-[0.14] pointer-events-none" style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z'/%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z' transform='rotate(45 60 60)'/%3E%3Cpath d='M60 30 L67 53 L90 60 L67 67 L60 90 L53 67 L30 60 L53 53 Z' stroke-width='1' opacity='0.7'/%3E%3Cpath d='M60 30 L67 53 L90 60 L67 67 L60 90 L53 67 L30 60 L53 53 Z' stroke-width='1' opacity='0.7' transform='rotate(45 60 60)'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '90px 90px'
              }}></div>
              <div className="relative z-10">
                  <h1 className="text-2xl font-black mb-2 uppercase tracking-tighter">
                      {activeMode === 'hafalan' ? 'Target Hafalan' : 
                       activeMode === 'surah' ? 'Khatam Surat' : 'Khatam Juz'}
                  </h1>
                  <p className="text-white/80 text-xs mb-4 font-medium italic">
                      {activeMode === 'hafalan' ? 'Setor hafalan ayat demi ayat untuk mendapatkan Wasilah.' : 
                       activeMode === 'surah' ? 'Catat kemajuan Anda menyelesaikan satu surat penuh.' : 
                       'Program One Day One Juz untuk mengkhatamkan Al-Quran.'}
                  </p>
                  
                  <div className="flex items-center gap-4">
                      <div className="flex-1">
                          <div className="flex justify-between items-end mb-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Progress</span>
                              <span className="text-sm font-black">
                                  {activeMode === 'hafalan' ? `${lastCompletedSurahId}/114` : 
                                   activeMode === 'surah' ? `${completedSurahs.length}/114` : 
                                   `${completedJuz.length}/30`}
                              </span>
                          </div>
                          <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-white transition-all duration-1000" 
                                style={{ 
                                    width: activeMode === 'hafalan' ? `${(lastCompletedSurahId/114)*100}%` :
                                           activeMode === 'surah' ? `${(completedSurahs.length/114)*100}%` :
                                           `${(completedJuz.length/30)*100}%`
                                }}
                               ></div>
                          </div>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                          <Trophy size={24} className="text-yellow-300" />
                      </div>
                  </div>
              </div>
          </div>

          {loading ? (
              <div className="flex justify-center py-10"><Loader2 size={32} className="animate-spin text-green-600" /></div>
          ) : (
              <div className="grid gap-3">
                  {activeMode === 'juz' ? (
                      Array.from({ length: 30 }, (_, i) => i + 1).map(juzNum => {
                          const isDone = completedJuz.includes(juzNum);
                          const isLocked = juzNum > (completedJuz.length > 0 ? Math.max(...completedJuz) + 1 : 1);
                          
                          return (
                              <button 
                                key={juzNum}
                                onClick={() => handleSelectKhatamJuz(juzNum)}
                                disabled={isLocked}
                                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                                    isDone ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' : isLocked ? 'bg-slate-100 dark:bg-slate-900 opacity-60' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                                }`}
                              >
                                  <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                                          isLocked ? 'bg-slate-200 text-slate-400' : isDone ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                      }`}>
                                          {isLocked ? <Lock size={14} /> : juzNum}
                                      </div>
                                      <div className="text-left">
                                          <h3 className={`font-black text-sm uppercase tracking-tight ${isLocked ? 'text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>Juz {juzNum}</h3>
                                          <p className="text-[10px] font-bold text-slate-400">One Day One Juz</p>
                                      </div>
                                  </div>
                                  {isDone ? (
                                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                          <Check size={18} strokeWidth={3} />
                                      </div>
                                  ) : isLocked ? null : (
                                      <div className="w-8 h-8 border-2 border-slate-100 dark:border-slate-800 rounded-full"></div>
                                  )}
                              </button>
                          );
                      })
                  ) : (
                      surahs.map(surah => {
                          const isMemorizationLocked = activeMode === 'hafalan' && (surah.number > lastCompletedSurahId + 1);
                          const isKhatamLocked = activeMode === 'surah' && (surah.number > (completedSurahs.length > 0 ? Math.max(...completedSurahs) + 1 : 1));
                          const isLocked = isMemorizationLocked || isKhatamLocked;

                          const isCompletedHafalan = activeMode === 'hafalan' && (surah.number <= lastCompletedSurahId);
                          const isKhatamSurah = completedSurahs.includes(surah.number);

                          return (
                          <button 
                            key={surah.number}
                            onClick={() => {
                                if (activeMode === 'hafalan') handleSelectSurah(surah);
                                else handleSelectKhatamSurah(surah);
                            }}
                            disabled={isLocked}
                            className={`p-4 rounded-2xl border flex items-center justify-between transition-all group relative overflow-hidden ${
                                isLocked 
                                ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70 cursor-not-allowed' 
                                : activeMode === 'hafalan' 
                                    ? (isCompletedHafalan ? 'bg-green-50 border-green-200 dark:bg-green-900/20' : 'bg-white dark:bg-slate-900 border-slate-100')
                                    : (isKhatamSurah ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-900 border-slate-100')
                            }`}
                          >
                              <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                                      isLocked 
                                      ? 'bg-slate-200 text-slate-500' 
                                      : activeMode === 'hafalan' 
                                        ? (isCompletedHafalan ? 'bg-green-600 text-white shadow-lg' : 'bg-green-100 text-green-700') 
                                        : (isKhatamSurah ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-100 text-blue-600')
                                  }`}>
                                      {isLocked ? <Lock size={16} /> : surah.number}
                                  </div>
                                  <div className="text-left">
                                      <h3 className={`font-black uppercase tracking-tight text-sm ${isLocked ? 'text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                                          {surah.name_latin}
                                      </h3>
                                      <p className="text-[10px] font-bold text-slate-400">{surah.number_of_ayah} Ayat</p>
                                  </div>
                              </div>
                              <div className="text-right flex items-center gap-2">
                                  {activeMode === 'hafalan' ? (
                                      isCompletedHafalan ? (
                                          <div className="bg-green-100 text-green-600 p-2 rounded-full shadow-sm"><Check size={16} strokeWidth={3} /></div>
                                      ) : isLocked ? null : (
                                          <span className="font-arabic text-lg text-green-600 dark:text-green-400">{surah.name}</span>
                                      )
                                  ) : (
                                      isKhatamSurah ? (
                                          <div className="bg-blue-100 text-blue-600 p-2 rounded-full shadow-sm"><Check size={16} strokeWidth={3} /></div>
                                      ) : isLocked ? null : (
                                          <div className="w-8 h-8 border-2 border-slate-100 dark:border-slate-800 rounded-full"></div>
                                      )
                                  )}
                              </div>
                          </button>
                      )})
                  )}
              </div>
          )}
       </div>

       {/* Resume Khatam Progress Modal */}
       {showResumeModal && savedKhatamIndex !== null && savedKhatamIndex > 0 && (
           <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                   <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none"></div>
                   
                   <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/10">
                       <BookOpen size={32} />
                   </div>
                   
                   <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Lanjutkan Membaca?</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
                       Anda memiliki progres membaca terakhir yang tersimpan di <span className="font-extrabold text-blue-600 dark:text-blue-400">Ayat ke-{savedKhatamIndex + 1}</span>. Apakah Anda ingin melanjutkan membaca dari ayat ini?
                   </p>
                   
                   <div className="space-y-2.5">
                       <button
                         onClick={() => {
                             const isJuz = !!selectedJuz && activeMode === 'juz';
                             const ayahsList = isJuz ? selectedJuz?.ayahs : selectedSurah?.ayahs;
                             if (ayahsList && savedKhatamIndex < ayahsList.length) {
                                 setShowResumeModal(false);
                                 startKhatamRecording(ayahsList[savedKhatamIndex].arab, savedKhatamIndex);
                             } else {
                                 setShowResumeModal(false);
                                 const firstArab = ayahsList && ayahsList.length > 0 ? ayahsList[0].arab : "";
                                 startKhatamRecording(firstArab, 0);
                             }
                         }}
                         className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-500/10 active:scale-95 transition-all uppercase tracking-wider"
                       >
                           Lanjutkan Membaca
                       </button>
                       
                       <button
                         onClick={() => {
                             setShowResumeModal(false);
                             const isJuz = !!selectedJuz && activeMode === 'juz';
                             const ayahsList = isJuz ? selectedJuz?.ayahs : selectedSurah?.ayahs;
                             const firstArab = ayahsList && ayahsList.length > 0 ? ayahsList[0].arab : "";
                             startKhatamRecording(firstArab, 0);
                         }}
                         className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black rounded-2xl active:scale-95 transition-all uppercase tracking-wider"
                       >
                           Mulai dari Awal
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default TahfidzScreen;
