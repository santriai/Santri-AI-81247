import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, 
  PlusCircle, 
  Check, 
  Crown, 
  Sparkles, 
  Trophy, 
  Timer, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle, 
  XCircle, 
  Play, 
  Pause,
  RotateCw,
  LogOut,
  AlertCircle,
  Award,
  Swords,
  Globe,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
  Video,
  Coins,
  ShieldCheck,
  Share2,
  Copy,
  Eye,
  Trash2,
  Gem,
  Star,
  Flag
} from 'lucide-react';
import { shareText, openRatingApp } from '../utils/linkUtils';
import ContentReportModal from './ContentReportModal';
import { 
  playCountdownTick, 
  playCountdownHurry, 
  playSoundCorrect, 
  playSoundIncorrect, 
  playSoundWinner,
  playSoundCancelled,
  stopSoundWinner,
  stopSoundCancelled,
  startSoundWaitingLoop,
  stopSoundWaiting,
  stopAllQuizLoops,
  speakAndroidText
} from '../utils/quizSound';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserAvatar } from './UserAvatar';
import { 
  createQuizRoom, 
  joinQuizRoom, 
  togglePlayerReady, 
  startQuizRoom, 
  submitRoomAnswer, 
  advanceQuizRoom, 
  addTieBreakerQuestionAndAdvance,
  leaveQuizRoom, 
  deleteQuizRoom,
  reassignHostInGame,
  subscribeToQuizRoom, 
  subscribeToPublicQuizRooms,
  checkMultiplayerQuota,
  watchAdForMultiplayer,
  cancelAndRefundRoom,
  processScheduledRoomLogic,
  calculateMultiplayerReward,
  ISLAMIC_ROOM_NAMES,
  QuizRoom 
} from '../services/multiplayerQuizService';
import { incrementUserGameStats } from '../services/firebase';

interface Props {
  topics: Array<{ id: string; label: string; color: string }>;
  onBackToSinglePlayer: () => void;
  initialRoomCode?: string | null;
  initialAction?: 'join' | 'spectate' | 'create';
  onMatchActiveChange?: (isActive: boolean) => void;
}

const CSSConfetti: React.FC = () => {
  const pieces = useMemo(() => {
    const colors = [
      '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
      '#EC4899', '#06B6D4', '#FACC15', '#34D399', '#FB7185',
      '#6366F1', '#A855F7'
    ];
    const shapes = ['rounded-none', 'rounded-full', 'rounded-sm'];
    return Array.from({ length: 28 }).map((_, i) => {
      const left = ((i * 3.7) + (i * 11) % 5) % 100;
      const color = colors[i % colors.length];
      const shape = shapes[i % shapes.length];
      const width = 8 + ((i * 3) % 7); // 8px - 14px
      const height = 10 + ((i * 5) % 11); // 10px - 20px
      const duration = 2.5 + (i % 6) * 0.4; // 2.5s - 4.5s
      const delay = (i % 8) * 0.3; // 0s - 2.1s
      return {
        id: i,
        left: `${left}%`,
        color,
        shape,
        width: `${width}px`,
        height: `${height}px`,
        duration: `${duration}s`,
        delay: `${delay}s`,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          85% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
      {pieces.map((p) => (
        <div
          key={p.id}
          className={`absolute top-0 ${p.shape}`}
          style={{
            left: p.left,
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            animation: `fall ${p.duration} linear ${p.delay} infinite`,
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
};

const formatQuestionText = (q: any, topicName?: string) => {
  if (!q || !q.question) return '';
  const isSambung = (topicName && topicName.toLowerCase().includes('sambung')) || (q.topic && q.topic.toLowerCase().includes('sambung'));
  if (isSambung) {
    return q.question
      .replace(/\s*\([^)]*QS\.[^)]*\)/gi, '')
      .replace(/\s*\([^)]*Surat[^)]*\)/gi, '')
      .replace(/\s*QS\.\s+[A-Za-z' -]+(?:\s*:\s*\d+)?/gi, '')
      .replace(/\s*Surat\s+[A-Za-z' -]+\s+ayat\s+\d+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return q.question;
};

export const MultiplayerQuizView: React.FC<Props> = ({ topics, onBackToSinglePlayer, initialRoomCode, initialAction = 'join', onMatchActiveChange }) => {
  const { user, userData } = useAuth();
  const { showToast } = useToast();

  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(initialRoomCode || null);
  const [room, setRoom] = useState<QuizRoom | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const autoJoinedCodeRef = useRef<string | null>(null);

  useEffect(() => {
    const isMatchActive = Boolean(room && (room.status === 'playing' || room.status === 'question_result'));
    onMatchActiveChange?.(isMatchActive);
  }, [room?.status, onMatchActiveChange]);

  useEffect(() => {
    if (initialRoomCode) {
      setActiveRoomCode(initialRoomCode);
    }
  }, [initialRoomCode]);

  useEffect(() => {
    if (!activeRoomCode) {
      autoJoinedCodeRef.current = null;
    }
  }, [activeRoomCode]);

  useEffect(() => {
    if (initialAction === 'create' && !room) {
      setShowCreateModal(true);
    }
  }, [initialAction, room]);

  // Quota state
  const [quotaInfo, setQuotaInfo] = useState<{
    canPlay: boolean;
    playsUsed: number;
    maxPlays: number;
    basePlays: number;
    verificationBonus: number;
    adsWatched: number;
    maxAds: number;
    remainingPlays: number;
  }>({
    canPlay: true,
    playsUsed: 0,
    maxPlays: 3,
    basePlays: 3,
    verificationBonus: 0,
    adsWatched: 0,
    maxAds: 5,
    remainingPlays: 3
  });

  // Modal & Form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoomName, setSelectedRoomName] = useState('Majlis Ilmi');
  const [customRoomName, setCustomRoomName] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('Random');
  const [startTimeOption, setStartTimeOption] = useState('5 Menit Lagi');
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timePerQuestion, setTimePerQuestion] = useState<number>(30);
  const [maxPlayers, setMaxPlayers] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab state for Arena Aktif vs Riwayat Permainan
  const [arenaTab, setArenaTab] = useState<'active' | 'history'>('active');

  // Ad simulation modal
  const [showAdModal, setShowAdModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [isAdPlaying, setIsAdPlaying] = useState(false);

  // Interstitial ad state after match finishes
  const [showFinishedInterstitialModal, setShowFinishedInterstitialModal] = useState(false);
  const [finishedAdCountdown, setFinishedAdCountdown] = useState(3);
  const adShownForFinishedRef = useRef<boolean>(false);

  // Public Rooms list
  const [publicRooms, setPublicRooms] = useState<QuizRoom[]>([]);
  const [nowTime, setNowTime] = useState<number>(Date.now());

  // Playing question state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [resultCountdown, setResultCountdown] = useState<number>(10);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const rewardClaimedRef = useRef<boolean>(false);

  // Question Audio Player states
  const [isQuestionAudioPlaying, setIsQuestionAudioPlaying] = useState(false);
  const [isQuestionAudioLoading, setIsQuestionAudioLoading] = useState(false);
  const questionAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopQuestionAudio = () => {
    if (questionAudioRef.current) {
      questionAudioRef.current.pause();
      questionAudioRef.current.currentTime = 0;
      questionAudioRef.current = null;
    }
    setIsQuestionAudioPlaying(false);
    setIsQuestionAudioLoading(false);
  };

  const toggleQuestionAudio = (url?: string) => {
    if (!url) return;

    if (isQuestionAudioPlaying && questionAudioRef.current) {
      questionAudioRef.current.pause();
      setIsQuestionAudioPlaying(false);
      return;
    }

    stopQuestionAudio();
    setIsQuestionAudioLoading(true);

    const audio = new Audio(url);
    questionAudioRef.current = audio;

    audio.oncanplay = () => {
      setIsQuestionAudioLoading(false);
    };

    audio.onended = () => {
      setIsQuestionAudioPlaying(false);
    };

    audio.play()
      .then(() => {
        setIsQuestionAudioPlaying(true);
        setIsQuestionAudioLoading(false);
      })
      .catch(() => {
        setIsQuestionAudioPlaying(false);
        setIsQuestionAudioLoading(false);
      });
  };

  useEffect(() => {
    return () => {
      stopQuestionAudio();
    };
  }, []);

  const activeQuestion = room && room.questions && room.questions[room.currentQuestionIndex];

  useEffect(() => {
    if (room?.status === 'playing' && activeQuestion?.audioUrl) {
      toggleQuestionAudio(activeQuestion.audioUrl);
    } else {
      stopQuestionAudio();
    }
  }, [activeQuestion?.id, room?.status, room?.currentQuestionIndex]);

  // Card background styling palette for room items with vibrant bright gradients
  const CARD_BG_STYLES = [
    "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white border border-indigo-400/40 shadow-md hover:shadow-xl transition-all",
    "bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white border border-emerald-400/40 shadow-md hover:shadow-xl transition-all",
    "bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white border border-amber-400/40 shadow-md hover:shadow-xl transition-all",
    "bg-gradient-to-br from-fuchsia-600 via-pink-600 to-purple-600 text-white border border-fuchsia-400/40 shadow-md hover:shadow-xl transition-all"
  ];

  // Handle share room invitation
  const handleShareRoom = (roomCode: string, roomName: string) => {
    const title = `Arena Versus: ${roomName}`;
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.kitabkuningterjemahlengkap';
    const shareText = `Ayo bergabung Cerdas Cermat untuk menambah wawasan keilmuan, mempertajam kemampuan daya ingat dan mengasah otak di Arena Versus "${roomName}" ID Arena: #${roomCode}.\nMari bergabung di aplikasi Santri AI pada fitur cerdas cermat\n${playStoreUrl}`;

    // Priority 1: Official AndroidNativeInterface bridge used across Santri AI
    if ((window as any).AndroidNativeInterface && typeof (window as any).AndroidNativeInterface.shareText === 'function') {
      try {
        (window as any).AndroidNativeInterface.shareText(title, shareText);
        showToast('Membuka menu berbagi Android...', 'info');
        return;
      } catch (e) {
        console.error('AndroidNativeInterface share error:', e);
      }
    }

    // Priority 2: Alternative AndroidInterface bridge
    if ((window as any).AndroidInterface && typeof (window as any).AndroidInterface.share === 'function') {
      try {
        (window as any).AndroidInterface.share(shareText);
        showToast('Membuka menu berbagi Android...', 'info');
        return;
      } catch (e) {
        console.error('AndroidInterface share error:', e);
      }
    }

    // Priority 3: Standard Web Share API
    if (navigator.share) {
      navigator.share({
        title: title,
        text: shareText,
      }).then(() => {
        showToast('Berhasil membagikan undangan room!', 'success');
      }).catch((err: any) => {
        if (err?.name !== 'AbortError' && navigator.clipboard) {
          navigator.clipboard.writeText(shareText);
          showToast('Teks undangan & link Play Store berhasil disalin!', 'success');
        }
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      showToast('Teks undangan & link Play Store berhasil disalin!', 'success');
    } else {
      showToast(`ID Room: #${roomCode}`, 'info');
    }
  };

  // Refresh quota
  const refreshQuota = async () => {
    if (user?.uid) {
      const q = await checkMultiplayerQuota(user.uid, userData?.verificationBadge || userData?.badge);
      setQuotaInfo(q);
    }
  };

  useEffect(() => {
    refreshQuota();
  }, [user?.uid, userData?.verificationBadge, userData?.badge]);

  // Real-time clock ticker for countdown timers (1 second interval)
  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to public versus rooms
  useEffect(() => {
    if (activeRoomCode) return;

    const unsubscribe = subscribeToPublicQuizRooms(
      (rooms) => {
        setPublicRooms(rooms);
      },
      (err) => {
        console.error('Error fetching public rooms:', err);
      }
    );

    return () => unsubscribe();
  }, [activeRoomCode]);

  // Subscribe to active room updates
  useEffect(() => {
    if (!activeRoomCode) {
      setRoom(null);
      rewardClaimedRef.current = false;
      return;
    }

    const unsubscribe = subscribeToQuizRoom(
      activeRoomCode,
      (updatedRoom) => {
        setRoom(updatedRoom);
      },
      (err) => {
        showToast('Gagal memuat data room multiplayer.', 'error');
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeRoomCode]);

  // Auto-join room when room is loaded and initialAction is 'join'
  useEffect(() => {
    if (!room || !user) return;
    if (initialAction === 'spectate') return;

    if (autoJoinedCodeRef.current !== room.roomCode) {
      if (room.status === 'waiting' && (!room.players || !room.players[user.uid])) {
        autoJoinedCodeRef.current = room.roomCode;
        handleJoinDirectRoom(room.roomCode);
      }
    }
  }, [room, user, initialAction]);

  // Auto Start, Host Transfer, or Auto Cancel logic when scheduled start time is reached in lobby
  useEffect(() => {
    if (!room) return;

    if (room.status === 'cancelled') {
      showToast(`Arena Versus "${room.roomName || 'Majlis Ilmi'}" telah dibatalkan otomatis karena kurang dari 2 pemain saat waktu mulai.`, 'error');
      setActiveRoomCode(null);
      setRoom(null);
      refreshQuota();
      return;
    }

    if (room.status === 'waiting') {
      processScheduledRoomLogic(room, user?.uid).catch(console.error);
    }
  }, [nowTime, room, user?.uid]);

  // Reset selected option on new question
  useEffect(() => {
    if (room?.status === 'playing') {
      setSelectedOption(null);
      setTimeLeft(room.timePerQuestion || 30);
    }
  }, [room?.status, room?.currentQuestionIndex]);

  // Award stats & points upon game finished
  useEffect(() => {
    if (room?.status === 'finished') {
      if (user && !rewardClaimedRef.current) {
        // Count how many players actually answered at least one question
        const playerList = Object.values(room.players || {});
        const activePlayersWhoAnswered = playerList.filter(p => {
          if (!p.answers) return false;
          const answerList = Object.values(p.answers);
          if (answerList.length === 0) return false;
          return answerList.some(ans => ans && ans.answerIndex !== undefined && ans.answerIndex !== -1);
        });

        if (activePlayersWhoAnswered.length <= 1) {
          rewardClaimedRef.current = true;
          console.log("Only 1 player answered. No rewards awarded.");
          return;
        }

        rewardClaimedRef.current = true;
        const myPlayer = room.players[user.uid];
        if (myPlayer) {
          const totalCorrect = Object.values(myPlayer.answers || {}).filter((a) => a.isCorrect).length;
          const reward = calculateMultiplayerReward(room.questionCount);
          
          incrementUserGameStats(user.uid, reward.xpEarned, totalCorrect, reward.wasilahEarned)
            .then(() => {
              showToast(`🎉 Selamat! Anda mendapatkan +${reward.xpEarned} XP dan +${reward.wasilahEarned} Wasilah!`, 'success');
            })
            .catch(console.error);
        }
      }
    }
  }, [room?.status, user?.uid]);

  // Trigger Interstitial Ad when game finishes before displaying results
  useEffect(() => {
    if (room?.status === 'finished') {
      if (!adShownForFinishedRef.current) {
        adShownForFinishedRef.current = true;
        const win = window as any;

        if (win.AndroidNativeInterface && typeof win.AndroidNativeInterface.showInterstitialAd === 'function') {
          try {
            console.log('[AdMob] Triggering native interstitial ad after Cerdas Cermat Versus match finished');
            win.AndroidNativeInterface.showInterstitialAd();
          } catch (err) {
            console.error('Failed to show native interstitial ad:', err);
          }
        }

        setShowFinishedInterstitialModal(true);
        setFinishedAdCountdown(3);
      }
    } else {
      adShownForFinishedRef.current = false;
    }
  }, [room?.status]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (showFinishedInterstitialModal && finishedAdCountdown > 0) {
      timer = setInterval(() => {
        setFinishedAdCountdown((prev) => {
          if (prev <= 1) {
            if (timer) clearInterval(timer);
            setShowFinishedInterstitialModal(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showFinishedInterstitialModal, finishedAdCountdown]);

  // Play sounds on game status transitions
  useEffect(() => {
    if (!room) {
      stopAllQuizLoops();
      return;
    }

    if (room.status === 'question_result') {
      stopAllQuizLoops();
      const myPlayer = user ? room.players[user.uid] : null;
      if (myPlayer) {
        const myAns = myPlayer.answers?.[room.currentQuestionIndex];
        if (myAns?.isCorrect) {
          playSoundCorrect();
          speakAndroidText("Luar biasa, jawaban Anda benar!");
        } else {
          playSoundIncorrect();
          speakAndroidText("Sayang sekali, jawaban kurang tepat.");
        }
      }
    } else if (room.status === 'finished') {
      const playersList = Object.values(room.players || {}).filter(p => !p.isForfeited);
      const activePlayersWhoAnswered = playersList.filter(p => {
        if (!p.answers) return false;
        const answerList = Object.values(p.answers);
        if (answerList.length === 0) return false;
        return answerList.some(ans => ans && ans.answerIndex !== undefined && ans.answerIndex !== -1);
      });
      const isOnlyOnePlayerAnswered = activePlayersWhoAnswered.length <= 1;

      if (isOnlyOnePlayerAnswered) {
        stopSoundWinner();
        playSoundCancelled();
        speakAndroidText("Permainan dibatalkan karena hanya satu pemain yang aktif.");
      } else {
        stopSoundCancelled();
        playSoundWinner();
        const sorted = [...playersList].sort((a, b) => b.score - a.score);
        const topWinner = sorted[0];
        if (topWinner) {
          if (user && topWinner.uid === user.uid) {
            speakAndroidText(`Mabruk! Anda menjadi Juara 1 dengan nilai ${topWinner.score} poin!`);
          } else {
            speakAndroidText(`Pertandingan selesai! Juara satu diraih oleh ${topWinner.displayName || 'Santri'} dengan nilai ${topWinner.score} poin.`);
          }
        } else {
          speakAndroidText("Pertandingan selesai! Selamat kepada semua peserta!");
        }
      }
    } else {
      stopAllQuizLoops();
      if (room.status === 'playing' && room.currentQuestionIndex === 0) {
        speakAndroidText("Selamat datang di Cerdas Cermat Versus. Pertandingan dimulai, selamat berjuang!");
      }
    }

    return () => {
      stopAllQuizLoops();
    };
  }, [room?.status, room?.currentQuestionIndex, user?.uid]);

  // Audio waiting loop
  useEffect(() => {
    if (room?.status === 'waiting') {
      startSoundWaitingLoop();
    } else {
      stopSoundWaiting();
    }
    return () => {
      stopSoundWaiting();
    };
  }, [room?.status]);

  // Question timer logic
  useEffect(() => {
    if (room?.status !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          
          // Auto submit timeout answer (-1) if not answered
          if (user && selectedOption === null && room) {
            const currentQ = room.questions[room.currentQuestionIndex];
            if (currentQ) {
              submitRoomAnswer(
                room.roomCode,
                user.uid,
                room.currentQuestionIndex,
                -1,
                room.timePerQuestion,
                room.timePerQuestion,
                currentQ.correctIndex
              ).catch(console.error);
            }
          }

          // If Host, auto advance to question result after time expires
          if (user && room && room.hostId === user.uid) {
            setTimeout(() => {
              advanceQuizRoom(room.roomCode, 'question_result');
            }, 1000);
          }

          // If NOT Host, monitor if host doesn't play (does not answer)
          if (user && room && room.hostId !== user.uid) {
            setTimeout(async () => {
              try {
                const res = await reassignHostInGame(room.roomCode, room.currentQuestionIndex, room.hostId);
                if (res.success) {
                  showToast("Host tidak aktif/tidak menjawab. Memindahkan status Host ke pemain lain...", "info");
                  if (res.newHostId === user.uid) {
                    showToast("Anda sekarang adalah Host! Melanjutkan permainan...", "success");
                    await advanceQuizRoom(room.roomCode, 'question_result');
                  }
                }
              } catch (err) {
                console.error("Gagal memeriksa keaktifan host:", err);
              }
            }, 3000); // Wait 3 seconds to ensure host has time to answer/auto-submit
          }

          return 0;
        }
        
        const nextTime = prev - 1;
        if (nextTime > 0) {
          if (nextTime <= 10) {
            playCountdownHurry();
          } else {
            playCountdownTick();
          }
        }
        return nextTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [room?.status, room?.currentQuestionIndex, selectedOption, user?.uid]);

  // Auto-advance if I am the newly assigned host and the time has expired but room is still playing
  useEffect(() => {
    if (!room || !user || room.status !== 'playing') return;
    
    if (room.hostId === user.uid && timeLeft === 0) {
      console.log("Newly assigned host auto-advancing expired question room...");
      const timerDelay = setTimeout(() => {
        advanceQuizRoom(room.roomCode, 'question_result').catch(console.error);
      }, 1000);
      return () => clearTimeout(timerDelay);
    }
  }, [room?.hostId, room?.status, room?.currentQuestionIndex, user?.uid, timeLeft]);

  // Auto-terminate game if only 1 player is active/answering after 2 questions (index >= 1) or when game is playing
  useEffect(() => {
    if (!room || !user || room.status !== 'question_result') return;

    // Check who is the primary advancer to avoid duplicate trigger calls
    const activePlayerUids = Object.keys(room.players || {}).filter((id) => !room.players[id]?.isForfeited);
    const primaryAdvancerUid = activePlayerUids.includes(room.hostId) ? room.hostId : activePlayerUids[0];
    if (user.uid !== primaryAdvancerUid) return;

    // We check after the second question (index >= 1, meaning question 1 and question 2 have finished)
    // Or if the room has total questions fewer than 2, we can check at index >= 0
    const limitIndex = room.questions.length < 2 ? 0 : 1;

    if (room.currentQuestionIndex >= limitIndex) {
      const playerList = Object.values(room.players || {});
      const activePlayersWhoAnswered = playerList.filter(p => {
        if (!p.answers) return false;
        const answerList = Object.values(p.answers);
        if (answerList.length === 0) return false;
        return answerList.some(ans => ans && ans.answerIndex !== undefined && ans.answerIndex !== -1);
      });

      if (activePlayersWhoAnswered.length <= 1) {
        console.log("Auto-terminating room because only 1 player answered after questions:", room.currentQuestionIndex + 1);
        advanceQuizRoom(room.roomCode, 'finished').catch(console.error);
      }
    }
  }, [room?.status, room?.currentQuestionIndex, room?.players, user?.uid]);

  // 10-second auto-advance countdown timer logic for question_result
  useEffect(() => {
    if (room?.status !== 'question_result') {
      setResultCountdown(10);
      return;
    }

    setResultCountdown(10);
    const interval = setInterval(() => {
      setResultCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [room?.status, room?.currentQuestionIndex, user?.uid]);

  // Handle ad watch with native AdMob Reward Ad integration
  const handleStartWatchAd = () => {
    if (quotaInfo.adsWatched >= quotaInfo.maxAds) {
      showToast('Anda telah mencapai batas maksimal 5x tonton iklan hari ini.', 'error');
      return;
    }
    
    const win = window as any;

    // Native Android AdMob Rewarded Ad integration
    if (win.AndroidNativeInterface?.showRewardedAd) {
      showToast("Memuat iklan AdMob...", "info");
      win.onRewardGranted = async () => {
        try {
          if (user) {
            const res = await watchAdForMultiplayer(user.uid);
            if (res.success) {
              showToast('🎉 Alhamdulillah! +1 Tambahan Jatah Bermain Versus berhasil diperoleh.', 'success');
              await refreshQuota();
            } else {
              showToast(res.message || 'Gagal klaim jatah bermain.', 'error');
            }
          }
        } catch (e) {
          console.error("Gagal klaim reward iklan AdMob:", e);
        } finally {
          delete win.onRewardGranted;
        }
      };
      try {
        win.AndroidNativeInterface.showRewardedAd();
        return;
      } catch (e) {
        console.error("Error calling native showRewardedAd:", e);
      }
    }

    if (win.AndroidNativeInterface?.showRewardedInterstitialAd) {
      showToast("Memuat iklan AdMob...", "info");
      win.onRewardedInterstitialGranted = async () => {
        try {
          if (user) {
            const res = await watchAdForMultiplayer(user.uid);
            if (res.success) {
              showToast('🎉 Alhamdulillah! +1 Tambahan Jatah Bermain Versus berhasil diperoleh.', 'success');
              await refreshQuota();
            } else {
              showToast(res.message || 'Gagal klaim jatah bermain.', 'error');
            }
          }
        } catch (e) {
          console.error("Gagal klaim reward iklan AdMob:", e);
        } finally {
          delete win.onRewardedInterstitialGranted;
        }
      };
      try {
        win.AndroidNativeInterface.showRewardedInterstitialAd();
        return;
      } catch (e) {
        console.error("Error calling native showRewardedInterstitialAd:", e);
      }
    }

    if (win.AndroidNativeInterface?.showInterstitialAd) {
      win.AndroidNativeInterface.showInterstitialAd();
      if (user) {
        watchAdForMultiplayer(user.uid).then((res) => {
          if (res.success) {
            showToast('🎉 Alhamdulillah! +1 Tambahan Jatah Bermain Versus berhasil diperoleh.', 'success');
            refreshQuota();
          }
        });
      }
      return;
    }

    // Fallback for Web preview (simulation modal) if native AdMob is not attached
    setShowAdModal(true);
    setAdCountdown(5);
    setIsAdPlaying(true);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (showAdModal && isAdPlaying) {
      interval = setInterval(() => {
        setAdCountdown((prev) => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            setIsAdPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showAdModal, isAdPlaying]);

  const handleClaimAdReward = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const res = await watchAdForMultiplayer(user.uid);
      if (res.success) {
        showToast('🎉 Berhasil menonton iklan! +1 Tambahan Jatah Bermain Versus diperoleh.', 'success');
        setShowAdModal(false);
        await refreshQuota();
      } else {
        showToast(res.message || 'Gagal klaim jatah bermain.', 'error');
      }
    } catch (err: any) {
      showToast('Gagal memproses iklan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get list of active room names to hide/disable in selection
  const activeRoomNames = publicRooms.map((r) => r.roomName);
  const availableRoomNames = ISLAMIC_ROOM_NAMES.filter((name) => !activeRoomNames.includes(name));

  // Check if user has verified badge
  const userBadge = userData?.verificationBadge || userData?.badge || '';
  const hasVerifiedBadge = (userBadge && userBadge !== 'none');

  // Handle create room
  const handleCreateRoom = async () => {
    if (!user) {
      showToast('Silakan login terlebih dahulu untuk membuat room.', 'error');
      return;
    }

    if (!quotaInfo.canPlay) {
      showToast('Jatah bermain hari ini telah habis. Tonton iklan (+1) untuk mendapat jatah tambahan.', 'error');
      return;
    }

    const finalRoomName = (hasVerifiedBadge && customRoomName.trim()) 
      ? customRoomName.trim() 
      : selectedRoomName;

    setIsSubmitting(true);
    try {
      const roomCode = await createQuizRoom(
        {
          uid: user.uid,
          displayName: userData?.displayName || user.displayName || 'Santri',
          photoURL: userData?.photoURL || user.photoURL || ''
        },
        finalRoomName,
        selectedTopic,
        questionCount,
        timePerQuestion,
        true, // Always public versus
        startTimeOption,
        userData?.verificationBadge || userData?.badge,
        maxPlayers
      );

      setActiveRoomCode(roomCode);
      setShowCreateModal(false);
      await refreshQuota();
      showToast(`Room Versus "${finalRoomName}" berhasil dibuat!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Gagal membuat room.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle spectating a room
  const handleSpectateRoom = async (roomCode: string) => {
    if (!user) {
      setActiveRoomCode(roomCode);
      showToast('Masuk dalam mode penonton live.', 'info');
      return;
    }

    // If user was previously joined as a player in this room, remove them from players
    const targetRoom = publicRooms.find((r) => r.roomCode === roomCode) || (room?.roomCode === roomCode ? room : null);
    if (targetRoom && targetRoom.players && targetRoom.players[user.uid]) {
      try {
        await leaveQuizRoom(roomCode, user.uid);
      } catch (err) {
        console.error(err);
      }
    }

    setActiveRoomCode(roomCode);
    showToast('Masuk dalam mode penonton live.', 'info');
  };

  // Handle joining public versus room directly
  const handleJoinDirectRoom = async (roomCode: string) => {
    if (!user) {
      showToast('Silakan login terlebih dahulu untuk bertanding.', 'error');
      return;
    }

    const targetRoom = publicRooms.find((r) => r.roomCode === roomCode) || (room?.roomCode === roomCode ? room : null);
    const isGameActive = targetRoom && (targetRoom.status === 'playing' || targetRoom.status === 'question_result');

    if (isGameActive) {
      // Game in progress -> automatically enter spectator mode
      setActiveRoomCode(roomCode);
      showToast('Pertandingan sedang berlangsung. Anda otomatis masuk ke mode penonton live!', 'info');
      return;
    }

    if (!quotaInfo.canPlay) {
      showToast('Jatah bermain hari ini telah habis. Tonton iklan (+1) untuk mendapat jatah tambahan.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await joinQuizRoom(
        {
          uid: user.uid,
          displayName: userData?.displayName || user.displayName || 'Santri',
          photoURL: userData?.photoURL || user.photoURL || ''
        },
        roomCode,
        userData?.verificationBadge || userData?.badge
      );

      setActiveRoomCode(roomCode);
      await refreshQuota();
      showToast('Berhasil bergabung ke arena Versus!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Gagal masuk ke room versus.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle ready status
  const handleToggleReady = async () => {
    if (!user || !room) return;
    const myPlayer = room.players[user.uid];
    if (!myPlayer) return;

    try {
      await togglePlayerReady(room.roomCode, user.uid, myPlayer.isReady);
    } catch (err: any) {
      showToast('Gagal mengubah status Siap.', 'error');
    }
  };

  // Submit answer during playing
  const handleAnswer = async (optionIdx: number) => {
    if (selectedOption !== null || !user || !room || room.status !== 'playing') return;

    setSelectedOption(optionIdx);
    const currentQ = room.questions[room.currentQuestionIndex];
    if (!currentQ) return;

    const timeTaken = room.timePerQuestion - timeLeft;

    try {
      await submitRoomAnswer(
        room.roomCode,
        user.uid,
        room.currentQuestionIndex,
        optionIdx,
        timeTaken,
        room.timePerQuestion,
        currentQ.correctIndex
      );

      // Check if all players have answered
      const playerList = Object.values(room.players || {});
      const answeredCount = playerList.filter(
        (p) => p.answers && p.answers[room.currentQuestionIndex] !== undefined
      ).length + 1;

      if (answeredCount >= playerList.length && room.hostId === user.uid) {
        setTimeout(() => {
          advanceQuizRoom(room.roomCode, 'question_result');
        }, 800);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Next question or finish
  const handleNextQuestion = async () => {
    if (!room || !user) return;
    const activePlayerUids = Object.keys(room.players || {}).filter((id) => !room.players[id]?.isForfeited);
    const primaryAdvancerUid = activePlayerUids.includes(room.hostId) ? room.hostId : activePlayerUids[0];
    if (user.uid !== primaryAdvancerUid) return;

    const nextIdx = room.currentQuestionIndex + 1;
    if (nextIdx >= room.questions.length) {
      // Check if top players have the same score (tie for 1st place)
      const playerList = Object.values(room.players || {}).filter((p) => !p.isForfeited);
      playerList.sort((a, b) => (b.score || 0) - (a.score || 0));

      const isTieForFirst = playerList.length >= 2 && (playerList[0].score || 0) === (playerList[1].score || 0);

      if (isTieForFirst) {
        showToast('Skor seri! Menambahkan Soal Penentuan (Tie Breaker)...', 'info');
        await addTieBreakerQuestionAndAdvance(room.roomCode, room.questions, room.topic);
      } else {
        await advanceQuizRoom(room.roomCode, 'finished');
      }
    } else {
      await advanceQuizRoom(room.roomCode, 'playing', nextIdx);
    }
  };

  // Leave room, delete room (if host), or stop spectating
  const handleLeaveRoom = async () => {
    stopAllQuizLoops();
    if (!room || !user) {
      setActiveRoomCode(null);
      setRoom(null);
      return;
    }

    // If user is just a spectator (not registered in room.players)
    if (!room.players || !room.players[user.uid]) {
      setActiveRoomCode(null);
      setRoom(null);
      showToast('Selesai menonton room live.', 'info');
      return;
    }

    const isGameActive = room.status === 'playing' || room.status === 'question_result';
    
    if (isGameActive) {
      const confirmExit = window.confirm('Apakah Anda yakin ingin keluar? Keluar saat pertandingan berlangsung akan dianggap KALAH.');
      if (!confirmExit) return;
    }

    const isHost = user.uid === room.hostId;

    try {
      if (isHost && room.status === 'waiting') {
        await deleteQuizRoom(room.roomCode);
        setActiveRoomCode(null);
        setRoom(null);
        showToast('Room berhasil dihapus.', 'info');
      } else {
        await leaveQuizRoom(room.roomCode, user.uid);
        setActiveRoomCode(null);
        setRoom(null);
        if (isGameActive) {
          showToast('Anda telah keluar dari permainan dan dianggap kalah.', 'warning');
        } else {
          showToast('Anda telah keluar dari room.', 'info');
        }
      }
      refreshQuota();
    } catch (err: any) {
      console.error(err);
      setActiveRoomCode(null);
      setRoom(null);
    }
  };

  // -------------------------------------------------------------
  // ACTIVE ROOM SCREEN (Lobby, Playing, Question Result, Finished)
  // -------------------------------------------------------------
  if (room) {
    const isHost = user?.uid === room.hostId;
    const playerList = Object.values(room.players || {}).sort((a, b) => b.score - a.score);
    const myPlayer = user ? room.players[user.uid] : null;
    const currentQ = room.questions[room.currentQuestionIndex];

    const isSpectator = !myPlayer;

    // Format countdown time to scheduled start
    const scheduledMs = room.scheduledStartTime || room.createdAt;
    const diffMs = Math.max(0, scheduledMs - nowTime);
    const mins = Math.floor(diffMs / (1000 * 60));
    const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
    const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // LOBBY STATE
    if (room.status === 'waiting') {
      const reward = calculateMultiplayerReward(room.questionCount);

      return (
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/50 shadow-xs">
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              {isSpectator ? (
                <>
                  <LogOut size={16} /> Keluar Nonton
                </>
              ) : isHost ? (
                <>
                  <Trash2 size={16} /> Hapus Room
                </>
              ) : (
                <>
                  <LogOut size={16} /> Keluar Room
                </>
              )}
            </button>
            <div className="flex items-center gap-1.5 text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3.5 py-1.5 rounded-full border border-purple-200 dark:border-purple-800">
              <Users size={14} /> {playerList.length}/{room.maxPlayers || 100} Pemain (Min. 2)
            </div>
          </div>

          {/* Room Header Card */}
          <div className="bg-gradient-to-br from-purple-800 via-indigo-700 to-indigo-900 rounded-3xl p-6 text-white text-center shadow-xl relative overflow-hidden space-y-3">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-300">
              <Swords size={12} /> ARENA VERSUS ONLINE
            </div>
            
            <h3 className="text-2xl font-black text-amber-300 drop-shadow-md">
              {room.roomName || 'Majlis Ilmi'}
            </h3>

            <p className="text-xs text-purple-100">
              Topik: <strong className="font-extrabold text-amber-300">{room.topic}</strong> • ID Arena: <strong className="font-black text-amber-300">#{room.roomCode}</strong> • <strong>{room.questionCount}</strong> Soal • <strong>{room.timePerQuestion}s</strong>/Soal
            </p>

            {/* Countdown Banner */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex items-center justify-center gap-2 text-amber-200">
              <Clock size={16} className="animate-spin-slow text-amber-400" />
              <span className="text-xs font-bold">
                Permainan Dimulai Otomatis Dalam: <strong className="font-mono text-sm text-white">{timeFormatted}</strong>
              </span>
            </div>

            {/* Hadiah Pemenang & Tombol Share */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs font-extrabold text-amber-300 border-t border-white/15">
              <span>🏆 Hadiah: +{reward.wasilahEarned} Wasilah & +{reward.xpEarned} XP</span>
              <button
                type="button"
                onClick={() => handleShareRoom(room.roomCode, room.roomName)}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-purple-950 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Share2 size={14} /> Ajak Teman Bergabung
              </button>
            </div>
          </div>

          {/* Countdown & Start Rule Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-500/15 via-purple-900/40 to-indigo-900/40 dark:bg-slate-900 border border-amber-400/40 rounded-2xl text-xs space-y-1.5 shadow-sm text-center">
            <div className="flex items-center justify-center gap-1.5 font-black text-amber-600 dark:text-amber-300 uppercase tracking-wide">
              <Clock size={16} className="text-amber-500 animate-spin-slow" /> ATURAN WAKTU MULAI ARENA
            </div>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-[11px] font-medium">
              Permainan <strong>AKAN DIMULAI OTOMATIS SETELAH WAKTU HITUNG MUNDUR HABIS</strong> dengan <strong>MINIMAL 2 PENGGUNA BERGABUNG</strong>. Jika waktu hitung mundur belum habis, <strong>permainan tidak dapat dimulai</strong> walaupun {room.maxPlayers || 100} pemain sudah bergabung.
            </p>
          </div>

          {/* Warning minimal 2 players */}
          {playerList.length < 2 && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-amber-600" />
              <span>
                <strong>Menunggu Pemain Lain...</strong> Diperlukan minimal 2 pemain agar permainan dapat dimulai. Jika waktu mundur habis dan hanya ada 1 pemain, room akan dibatalkan & kuota dikembalikan.
              </span>
            </div>
          )}

          {/* Player Grid */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-purple-100 dark:border-purple-900/50 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" /> Peserta Arena ({playerList.length}/{room.maxPlayers || 100})
              </span>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-bold">
                Versus Mode
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {playerList.map((p) => {
                const isRoomHost = p.uid === room.hostId;
                return (
                  <div
                    key={p.uid}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        photoURL={p.photoURL}
                        displayName={p.displayName}
                        size="sm"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 max-w-[110px] truncate">
                            {p.displayName}
                          </span>
                          {isRoomHost && (
                            <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <Crown size={10} /> Host
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {p.isReady ? '✅ Siap Bertanding' : '⏳ Menunggu...'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        p.isReady
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                      }`}
                    >
                      {p.isReady ? 'Ready' : 'Not Ready'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              {!isHost && myPlayer && (
                <button
                  onClick={handleToggleReady}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
                    myPlayer.isReady
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                  }`}
                >
                  {myPlayer.isReady ? 'Batalkan Siap' : 'Saya Siap Bertanding!'}
                </button>
              )}

              {isHost && (
                <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                  💡 Permainan akan berjalan otomatis begitu hitung mundur selesai.
                </p>
              )}
            </div>
          </div>

          {/* Banner Penonton Live (Paling Bawah) */}
          {isSpectator ? (
            <div className="p-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs font-bold shadow-md">
              <span className="flex items-center gap-2 font-black uppercase tracking-wide">
                <Eye size={18} className="animate-pulse text-amber-200" /> Mode Penonton Live (Real-Time)
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleJoinDirectRoom(room.roomCode)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer transition-all active:scale-95 flex items-center gap-1 shadow-xs"
                >
                  <Swords size={13} /> Masuk Room Versus
                </button>
                <button
                  onClick={handleLeaveRoom}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-black cursor-pointer transition-all active:scale-95"
                >
                  Keluar Nonton
                </button>
              </div>
            </div>
          ) : (
            !isHost && (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => handleSpectateRoom(room.roomCode)}
                  className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/80 dark:hover:bg-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Eye size={14} />
                  <span>Beralih ke Mode Nonton Live</span>
                </button>
              </div>
            )
          )}
        </div>
      );
    }

    // PLAYING STATE
    if (room.status === 'playing' && currentQ) {
      const playerAnswers = myPlayer?.answers?.[room.currentQuestionIndex];
      const hasAnswered = isSpectator || playerAnswers !== undefined || selectedOption !== null;

      return (
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto">

          {/* Floating Sticky Gradient Header (Soal, Timer, Tombol Keluar & Progress) */}
          <div className="sticky top-2 z-30 bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-purple-500/40 shadow-xl backdrop-blur-md space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {currentQ.isTieBreaker ? (
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 text-slate-950 font-black text-xs sm:text-sm rounded-full flex items-center gap-1 shadow-md animate-pulse">
                    ⚔️ TIE BREAKER
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-black text-xs sm:text-sm whitespace-nowrap shadow-xs">
                    Soal {room.currentQuestionIndex + 1} / {room.questions.length}
                  </span>
                )}
                <span className="text-xs font-bold text-purple-200 truncate hidden sm:inline">
                  📚 {room.topic}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-xs sm:text-sm shadow-sm transition-all ${
                    timeLeft <= 5
                      ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/50'
                      : 'bg-amber-400 text-slate-950 border border-amber-300'
                  }`}
                >
                  <Timer size={14} className={timeLeft <= 5 ? 'animate-spin' : ''} />
                  <span>{timeLeft}s</span>
                </div>
                <button
                  onClick={handleLeaveRoom}
                  className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white px-3.5 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1.5 border border-rose-300/40 shadow-sm cursor-pointer whitespace-nowrap"
                  title="Keluar Room (Dianggap Kalah)"
                >
                  <LogOut size={13} />
                  <span>{isSpectator ? 'Keluar' : 'Keluar'}</span>
                </button>
              </div>
            </div>

            {/* Time Progress Bar */}
            <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden p-0.5 border border-white/20">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                  timeLeft <= 5 ? 'bg-rose-400' : 'bg-gradient-to-r from-cyan-400 via-amber-300 to-emerald-400 shadow-xs'
                }`}
                style={{ width: `${(timeLeft / room.timePerQuestion) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Tie Breaker Banner */}
          {currentQ.isTieBreaker && (
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white p-3.5 rounded-2xl font-black text-xs text-center flex items-center justify-center gap-2 shadow-lg border border-amber-300/40 animate-pulse">
              <Swords size={18} className="text-amber-200 shrink-0" />
              <span>BABAK PENENTUAN: Skor Seri! Jawab dengan benar dan tercepat untuk menang!</span>
            </div>
          )}

          {/* Question Card */}
          <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden space-y-4">
            {/* Arabic Verse text if available */}
            {currentQ.arabicQuestion && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-right">
                <p className="font-arabic text-2xl leading-loose font-bold text-amber-100" dir="rtl">
                  {currentQ.arabicQuestion}
                </p>
              </div>
            )}

            <p className="text-base sm:text-lg font-bold leading-relaxed">
              {formatQuestionText(currentQ, room?.topic)}
            </p>

            {/* Audio Player Box below question */}
            {currentQ.audioUrl && (
              <div className="pt-4 border-t border-purple-700/50">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleQuestionAudio(currentQ.audioUrl)}
                    disabled={isQuestionAudioLoading}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-sm cursor-pointer ${
                      isQuestionAudioPlaying
                        ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 animate-pulse'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-98'
                    }`}
                  >
                    {isQuestionAudioLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isQuestionAudioPlaying ? (
                      <>
                        <Pause size={18} fill="currentColor" />
                        <span>Sedang Memutar Audio Ayat... (Jeda)</span>
                      </>
                    ) : (
                      <>
                        <Play size={18} className="fill-current ml-0.5" />
                        <span>Dengarkan Audio Ayat</span>
                      </>
                    )}
                  </button>

                  {isQuestionAudioPlaying && (
                    <button
                      onClick={() => {
                        stopQuestionAudio();
                        toggleQuestionAudio(currentQ.audioUrl);
                      }}
                      className="p-3 rounded-xl bg-purple-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-purple-900 transition-colors shadow-xs"
                      title="Ulangi Audio dari Awal"
                    >
                      <RotateCw size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx || playerAnswers?.answerIndex === idx;

              return (
                <button
                  key={idx}
                  disabled={hasAnswered}
                  onClick={() => handleAnswer(idx)}
                  className={`p-4 rounded-2xl text-left font-bold text-sm transition-all flex items-center justify-between border cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-500 shadow-lg scale-[1.01]'
                      : hasAnswered
                      ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-900 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                        isSelected
                          ? 'bg-white text-purple-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isSelected && <CheckCircle size={18} className="text-amber-300" />}
                </button>
              );
            })}
          </div>

          {/* Real-Time Spectator Player Choices Widget */}
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50/70 to-pink-50/50 dark:from-purple-950/60 dark:via-indigo-950/50 dark:to-gray-900 rounded-3xl p-5 border border-purple-200/80 dark:border-purple-800/60 shadow-md space-y-3">
            <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-black">
                <Users size={16} /> Jawaban pemain lain
              </span>
              <span className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                🔴 Live
              </span>
            </h4>

            {(() => {
              const answeredList = playerList
                .filter((p) => {
                  const ans = p.answers?.[room.currentQuestionIndex];
                  return ans !== undefined && ans.answerIndex !== undefined && ans.answerIndex >= 0;
                })
                .sort((a, b) => {
                  const timeA = a.answers?.[room.currentQuestionIndex]?.answeredAt || a.answers?.[room.currentQuestionIndex]?.timeTaken || 0;
                  const timeB = b.answers?.[room.currentQuestionIndex]?.answeredAt || b.answers?.[room.currentQuestionIndex]?.timeTaken || 0;
                  return timeA - timeB;
                });

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {playerList.map((p) => {
                    const ans = p.answers?.[room.currentQuestionIndex];
                    const hasChosen = ans !== undefined && ans.answerIndex !== undefined && ans.answerIndex >= 0;
                    const orderIndex = answeredList.findIndex((item) => item.uid === p.uid);
                    const orderNo = orderIndex !== -1 ? orderIndex + 1 : null;

                    return (
                      <div key={p.uid} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          {orderNo !== null && (
                            <span className="font-mono font-black text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-300/60 shadow-2xs">
                              #{orderNo}
                            </span>
                          )}
                          <UserAvatar photoURL={p.photoURL} displayName={p.displayName} size="xs" />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-100 block">{p.displayName}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-extrabold">{p.score} pts</span>
                          </div>
                        </div>
                        <div>
                          {hasChosen ? (
                            <span className="bg-purple-600 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-xs flex items-center gap-1">
                              {orderNo ? <span className="text-amber-300 font-mono">{orderNo}.</span> : null} Memilih [{String.fromCharCode(65 + ans.answerIndex)}]
                            </span>
                          ) : (
                            <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-[10px] font-extrabold px-2 py-1 rounded-xl border border-amber-300/50 flex items-center gap-1 animate-pulse">
                              <Clock size={11} /> Berpikir...
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Live answering status */}
          <div className="bg-purple-50 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-100 dark:border-purple-900/40 text-center">
            <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">
              {isSpectator
                ? '👁️ Anda sedang menonton pertandingan secara real-time.'
                : hasAnswered
                ? '✅ Jawaban Anda tersimpan! Menunggu pemain lain selesai...'
                : 'Pilih satu jawaban terbaik sebelum waktu habis!'}
            </span>
          </div>
        </div>
      );
    }

    // QUESTION RESULT STATE
    if (room.status === 'question_result' && currentQ) {
      const myAns = myPlayer?.answers?.[room.currentQuestionIndex];
      const correctPlayers = playerList.filter(
        (p) => p.answers?.[room.currentQuestionIndex]?.isCorrect
      );
      const isLastQuestion = room.currentQuestionIndex + 1 >= room.questions.length;
      const sortedActivePlayers = Object.values(room.players || {}).filter(p => !p.isForfeited).sort((a, b) => (b.score || 0) - (a.score || 0));
      const isTieForFirstNow = isLastQuestion && sortedActivePlayers.length >= 2 && (sortedActivePlayers[0].score || 0) === (sortedActivePlayers[1].score || 0);

      return (
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
          {/* Floating Sticky Gradient Header & Exit */}
          <div className="sticky top-2 z-30 bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-purple-500/40 shadow-xl backdrop-blur-md flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {currentQ.isTieBreaker ? (
                <span className="px-3 py-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 text-slate-950 font-black text-xs sm:text-sm rounded-full flex items-center gap-1 shadow-md">
                  ⚔️ Hasil Soal Penentuan (Tie Breaker)
                </span>
              ) : (
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-black text-xs sm:text-sm whitespace-nowrap shadow-xs">
                  Hasil Soal {room.currentQuestionIndex + 1} / {room.questions.length}
                </span>
              )}
              <span className="text-xs font-bold text-purple-200 truncate hidden sm:inline">
                📚 {room.topic}
              </span>
            </div>
            <button
              onClick={handleLeaveRoom}
              className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white px-3.5 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 border border-rose-300/40 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <LogOut size={13} />
              <span>{isSpectator ? 'Keluar Nonton' : 'Keluar'}</span>
            </button>
          </div>

          {/* Banner Penonton Live */}
          {isSpectator && (
            <div className="p-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl flex items-center justify-between text-xs font-bold shadow-md">
              <span className="flex items-center gap-2 font-black uppercase tracking-wide">
                <Eye size={18} className="animate-pulse text-amber-200" /> Mode Penonton Live (Real-Time)
              </span>
            </div>
          )}

          {/* Personal Answer Feedback Banner */}
          {!isSpectator && myPlayer && (
            <div>
              {myAns?.isCorrect ? (
                <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl shadow-lg flex items-center gap-3 border-2 border-emerald-300 animate-bounce-once">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle size={28} className="text-white" />
                  </div>
                  <div>
                    <span className="bg-white/25 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Hasil Jawaban Anda
                    </span>
                    <h3 className="font-black text-sm sm:text-base mt-0.5">
                      🎉 Selamat! Jawaban Anda Benar (+{myAns.points || 0} Poin{myAns.points >= 150 ? ' 🔥 Tercepat!' : ''})
                    </h3>
                  </div>
                </div>
              ) : myAns ? (
                <div className="p-4 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-3xl shadow-lg flex items-center gap-3 border-2 border-rose-300">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <XCircle size={28} className="text-white" />
                  </div>
                  <div>
                    <span className="bg-white/25 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Hasil Jawaban Anda
                    </span>
                    <h3 className="font-black text-sm sm:text-base mt-0.5">
                      ❌ Maaf, Jawaban Anda Salah (0 Poin)
                    </h3>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-3xl shadow-lg flex items-center gap-3 border-2 border-amber-300">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <Clock size={28} className="text-white" />
                  </div>
                  <div>
                    <span className="bg-white/25 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Hasil Jawaban Anda
                    </span>
                    <h3 className="font-black text-sm sm:text-base mt-0.5">
                      ⏰ Waktu Habis! Anda Tidak Sempat Menjawab (0 Poin)
                    </h3>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question & Arabic Verse Card */}
          <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950 text-white p-5 rounded-3xl shadow-lg space-y-3">
            {currentQ.arabicQuestion && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-right">
                <p className="font-arabic text-2xl leading-loose font-bold text-amber-100" dir="rtl">
                  {currentQ.arabicQuestion}
                </p>
              </div>
            )}
            <p className="text-sm sm:text-base font-bold leading-relaxed">
              {formatQuestionText(currentQ, room?.topic)}
            </p>
            {currentQ.audioUrl && (
              <div className="pt-2">
                <button
                  onClick={() => toggleQuestionAudio(currentQ.audioUrl)}
                  disabled={isQuestionAudioLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  {isQuestionAudioLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isQuestionAudioPlaying ? (
                    <>
                      <Pause size={16} fill="currentColor" />
                      <span>Jeda Audio Ayat</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} className="fill-current ml-0.5" />
                      <span>Putar Ulang Audio Ayat</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Answer Key */}
          <div className="bg-emerald-500 text-white p-5 rounded-3xl shadow-lg space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              Kunci Jawaban Benar
            </span>
            <h4 className="text-base font-bold">
              {currentQ.options[currentQ.correctIndex]}
            </h4>
            {currentQ.explanation && (
              <p className="text-xs text-emerald-100 pt-1 border-t border-white/20">
                💡 {currentQ.explanation}
              </p>
            )}
          </div>

          {/* Summary Box: Who answered correctly */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 border border-purple-100 dark:border-purple-900/50 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                <Users size={16} /> Status Jawaban Pemain
              </span>
              <span className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                {correctPlayers.length} / {playerList.length} Benar
              </span>
            </div>

            {correctPlayers.length > 0 ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 text-xs font-semibold text-emerald-950 dark:text-emerald-200 flex items-start gap-2">
                <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-emerald-800 dark:text-emerald-300 block mb-0.5">
                    Pengguna yang Menjawab dengan Benar:
                  </span>
                  <span className="font-bold">
                    {correctPlayers.map((p) => p.displayName + (p.uid === user?.uid ? ' (Anda)' : '')).join(', ')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200/80 dark:border-rose-800/80 text-xs font-semibold text-rose-950 dark:text-rose-200 flex items-center gap-2">
                <XCircle size={16} className="text-rose-500 shrink-0" />
                <span>Tidak ada pengguna yang menjawab dengan benar pada soal ini.</span>
              </div>
            )}
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-purple-100 dark:border-purple-900/50 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Papan Skor Sementara
            </h4>

            <div className="space-y-2">
              {playerList.map((p, idx) => {
                const ans = p.answers?.[room.currentQuestionIndex];
                const isMe = p.uid === user?.uid;

                return (
                  <div
                    key={p.uid}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isMe
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-xs text-slate-400 w-5 text-center">
                        #{idx + 1}
                      </span>
                      <UserAvatar photoURL={p.photoURL} displayName={p.displayName} size="sm" />
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">
                          {p.displayName} {isMe && '(Anda)'}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {p.isForfeited ? (
                            <span className="text-slate-400 font-extrabold flex items-center gap-1">
                              <LogOut size={11} /> Keluar / Kalah
                            </span>
                          ) : ans?.isCorrect ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle size={11} /> Benar (+{ans.points} Poin{ans.points >= 150 ? ' 🔥 Tercepat' : ''})
                            </span>
                          ) : ans ? (
                            <span className="text-rose-500 font-bold flex items-center gap-1">
                              <XCircle size={11} /> Salah (0 Poin)
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-1">
                              <Clock size={11} /> Waktu Habis
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-purple-700 dark:text-purple-300 block">
                        {p.score} pts
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Auto-advance indicator & Host Button */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className={`p-3 rounded-2xl border text-center flex items-center justify-center gap-2 ${
                isTieForFirstNow 
                  ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700' 
                  : 'bg-purple-100 dark:bg-purple-950/80 border-purple-200 dark:border-purple-800'
              }`}>
                <Clock size={16} className={`${isTieForFirstNow ? 'text-amber-700 dark:text-amber-300' : 'text-purple-700 dark:text-purple-300'} animate-spin`} />
                <span className={`text-xs font-black ${isTieForFirstNow ? 'text-amber-950 dark:text-amber-100' : 'text-purple-900 dark:text-purple-200'}`}>
                  {isTieForFirstNow ? (
                    <>⚡ SKOR SERI ({sortedActivePlayers[0]?.score || 0} Pts)! Otomatis lanjut ke <span className="text-rose-600 dark:text-rose-400 text-sm font-black">Soal Penentu (Tie Breaker)</span> dalam <span className="text-amber-600 dark:text-amber-400 text-sm font-black">{resultCountdown}s</span></>
                  ) : (
                    <>Otomatis lanjut ke {isLastQuestion ? 'Hasil Akhir' : 'Soal Berikutnya'} dalam <span className="text-amber-600 dark:text-amber-400 text-sm font-black">{resultCountdown}s</span></>
                  )}
                </span>
              </div>

              {isHost && (
                <button
                  onClick={handleNextQuestion}
                  className={`w-full py-3.5 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
                    isTieForFirstNow
                      ? 'bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 hover:from-amber-600 hover:to-rose-700'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
                  }`}
                >
                  <span>
                    {isTieForFirstNow
                      ? '⚔️ Lanjut Ke Soal Penentuan (Tie Breaker) Sekarang'
                      : isLastQuestion
                      ? 'Lihat Hasil Akhir Sekarang'
                      : 'Lanjut Soal Berikutnya Sekarang'}
                  </span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // FINISHED STATE
    if (room.status === 'finished') {
      if (showFinishedInterstitialModal) {
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-slate-900 border border-purple-500/30 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative overflow-hidden">
              <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-400/40 text-purple-400 animate-pulse">
                <Video size={32} />
              </div>

              <div className="space-y-1">
                <div className="inline-block text-[10px] bg-purple-500/20 text-purple-300 font-extrabold uppercase px-2.5 py-1 rounded-full border border-purple-400/30 tracking-wider">
                  📢 Google AdMob Interstitial
                </div>
                <h3 className="text-lg font-black text-white">
                  Pertandingan Versus Selesai!
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Menampilkan hasil akhir pertandingan Cerdas Cermat Versus dalam beberapa detik...
                </p>
              </div>

              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
                <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                  Memuat Hasil Pertandingan
                </p>
                <div className="text-3xl font-mono font-black text-white">
                  00:0{finishedAdCountdown}
                </div>
              </div>

              <button
                onClick={() => setShowFinishedInterstitialModal(false)}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 border border-purple-400/30"
              >
                Lanjutkan ke Hasil Pertandingan
              </button>
            </div>
          </div>
        );
      }

      // Count how many players actually answered at least one question
      const activePlayersWhoAnswered = playerList.filter(p => {
        if (!p.answers) return false;
        const answerList = Object.values(p.answers);
        if (answerList.length === 0) return false;
        return answerList.some(ans => ans && ans.answerIndex !== undefined && ans.answerIndex !== -1);
      });

      const isOnlyOnePlayerAnswered = activePlayersWhoAnswered.length <= 1;

      if (isOnlyOnePlayerAnswered) {
        return (
          <div className="space-y-6 animate-fade-in max-w-xl mx-auto text-center relative overflow-hidden">
            {/* Warning Header */}
            <div className="bg-gradient-to-br from-rose-500 via-red-600 to-rose-700 rounded-3xl p-6 text-white shadow-xl space-y-4 relative overflow-hidden">
              <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center border border-white/30 text-3xl animate-pulse">
                ⚠️
              </div>
              <h3 className="text-xl font-black text-white">⚠️ Permainan Dibatalkan</h3>
              <p className="text-xs sm:text-sm text-rose-50 font-bold leading-relaxed">
                Maaf, Room {room.roomCode} Terdeteksi hanya 1 pengguna yang bermain dan permainan akan dibatalkan dan dianggap tidak ada pemenang dalam room ini
              </p>
              <p className="text-xs text-rose-200">
                Terima kasih banyak dan silahkan masuk ke room lain atau membuat room sendiri
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-rose-100 dark:border-rose-950/50 shadow-xs space-y-3">
              <button
                onClick={handleLeaveRoom}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md animate-bounce"
              >
                Kembali ke Menu Utama
              </button>
            </div>
          </div>
        );
      }

      const winner = playerList[0];
      const reward = calculateMultiplayerReward(room.questionCount || room.questions?.length || 5);

      return (
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto text-center relative overflow-hidden">
          <CSSConfetti />
          {/* Banner Penonton Live */}
          {isSpectator && (
            <div className="p-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl flex items-center justify-between text-xs font-bold shadow-md text-left">
              <span className="flex items-center gap-2 font-black uppercase tracking-wide">
                <Eye size={18} className="animate-pulse text-amber-200" /> Mode Penonton Live (Selesai)
              </span>
              <button
                onClick={handleLeaveRoom}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-xl text-[11px] font-black cursor-pointer transition-all active:scale-95"
              >
                Keluar Nonton
              </button>
            </div>
          )}

          {/* Trophy Header */}
          <div className="bg-gradient-to-br from-amber-500 via-purple-700 to-indigo-900 rounded-3xl p-6 text-white shadow-xl space-y-3 relative overflow-hidden">
            <div className="w-16 h-16 mx-auto bg-amber-400/20 rounded-full flex items-center justify-center border border-amber-300/40 text-4xl animate-bounce shadow-lg">
              🏆
            </div>
            <h3 className="text-2xl font-black text-amber-300">Permainan Selesai!</h3>
            <p className="text-xs text-purple-100">
              Juara 1 Dimenangkan oleh <strong>{winner?.displayName || 'Santri'}</strong> dengan total {winner?.score || 0} Poin! 🎉
            </p>

            {/* Reward Card */}
            <div className="pt-2 flex items-center justify-center gap-3 bg-white/10 rounded-2xl p-3 border border-white/15">
              <div className="flex items-center gap-1.5 text-xs font-black text-cyan-300 bg-cyan-950/50 px-3 py-1.5 rounded-xl border border-cyan-400/40 shadow-xs">
                <Gem size={16} className="text-cyan-400 fill-cyan-400/30 animate-pulse" /> +{reward.wasilahEarned} Wasilah
              </div>
              <div className="flex items-center gap-1.5 text-xs font-black text-purple-200 bg-purple-950/50 px-3 py-1.5 rounded-xl border border-purple-400/30 shadow-xs">
                <Sparkles size={16} className="text-purple-300" /> +{reward.xpEarned} XP
              </div>
            </div>
          </div>

          {/* Final Scoreboard */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-purple-100 dark:border-purple-900/50 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 text-left flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" /> Hasil Akhir Pertandingan Versus
            </h4>

            <div className="space-y-2 text-left">
              {playerList.map((p, idx) => (
                <div
                  key={p.uid}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    idx === 0
                      ? 'bg-gradient-to-r from-amber-100 via-amber-200/90 to-yellow-100 dark:from-amber-950/90 dark:via-amber-900/80 dark:to-yellow-950/90 border-2 border-amber-400/90 shadow-md text-amber-950 dark:text-amber-100'
                      : idx === 1
                      ? 'bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-slate-800/80 border border-slate-300 dark:border-slate-700'
                      : idx === 2
                      ? 'bg-gradient-to-r from-amber-700/15 via-orange-600/10 to-amber-700/15 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 border border-amber-600/30'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm w-6 text-center">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <UserAvatar photoURL={p.photoURL} displayName={p.displayName} size="sm" />
                    <div>
                      <span className={`font-bold text-xs block ${idx === 0 ? 'text-amber-950 dark:text-amber-100 font-extrabold' : 'text-slate-800 dark:text-slate-100'}`}>
                        {p.displayName} 
                        {idx === 0 && <span className="inline-block text-[9px] bg-amber-500 text-amber-950 font-black px-1.5 py-0.5 rounded-md ml-1 border border-amber-300 uppercase shadow-2xs">Juara 1</span>}
                        {p.isForfeited && <span className="inline-block text-[9px] bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black px-1.5 py-0.5 rounded-md ml-1 uppercase shadow-2xs">Menyerah</span>}
                      </span>
                    </div>
                  </div>

                  <span className={`font-mono font-black text-sm ${idx === 0 ? 'text-amber-900 dark:text-amber-300' : 'text-purple-700 dark:text-purple-300'}`}>
                    {p.score} Pts
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons: Bagikan, Beri Rating, Laporkan */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  shareText(
                    'Hasil Cerdas Cermat Versus Santri AI',
                    `Alhamdulillah! Saya baru saja menyelesaikan pertandingan Cerdas Cermat Versus di Santri AI!\n\nJuara 1: ${winner?.displayName || 'Santri'} (${winner?.score || 0} Pts)\n\nYuk ikutan asah wawasan keislamanmu di Santri AI!\nhttps://play.google.com/store/apps/details?id=com.kitabkuningterjemahlengkap`
                  );
                }}
                className="py-2.5 px-3 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Share2 size={14} />
                <span>Bagikan</span>
              </button>

              <button
                type="button"
                onClick={openRatingApp}
                className="py-2.5 px-3 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span>Rating</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="py-2.5 px-3 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Flag size={14} />
                <span>Lapor</span>
              </button>
            </div>

            <button
              onClick={handleLeaveRoom}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Kembali ke Menu Utama
            </button>
          </div>
        </div>
      );
    }
  }

  // -------------------------------------------------------------
  // DEFAULT MAIN MULTIPLAYER VERSUS LOBBY MENU
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToSinglePlayer}
          className="flex items-center gap-2 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 px-3.5 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer w-fit border border-purple-200 dark:border-purple-800/60"
        >
          <ArrowLeft size={16} /> Mode Single Player
        </button>
      </div>

      {/* Hero Banner Moved to Top */}
      <div className="bg-gradient-to-br from-purple-800 via-indigo-700 to-purple-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden space-y-3">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-300 border border-white/20">
          <Swords size={12} /> Cerdas Cermat Versus Online
        </div>
        <h3 className="text-2xl font-black text-white">Mode Versus Online</h3>
        <p className="text-xs text-purple-100 leading-relaxed font-medium space-y-1">
          <span>Ayo bergabung Cerdas Cermat Versus untuk menambah wawasan keilmuan, mempertajam kemampuan daya ingat dan mengasah otak di Arena Versus secara langsung</span>
          <br />
          <span className="font-bold text-amber-300">Silahkan Pilih salah Satu Room dibawah ini</span>
        </p>
      </div>

      {/* Daily Quota Indicator & Ad Watch Button */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 border shadow-sm ${
            quotaInfo.canPlay 
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-400/40 shadow-emerald-900/10'
              : 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white border-rose-400/40 shadow-rose-900/10'
          }`}>
            <Flame size={16} className="text-amber-300 animate-pulse fill-amber-300/30" />
            <span>Jatah Main: {quotaInfo.remainingPlays}/{quotaInfo.maxPlays} Tersedia</span>
          </div>

          <button
            disabled={quotaInfo.remainingPlays > 0 || quotaInfo.adsWatched >= quotaInfo.maxAds}
            onClick={handleStartWatchAd}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all border ${
              quotaInfo.remainingPlays > 0
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border-slate-300 dark:border-slate-700 shadow-none'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white active:scale-95 cursor-pointer border-amber-300/40 shadow-lg'
            }`}
            title={quotaInfo.remainingPlays > 0 ? 'Jatah bermain masih ada, tombol +1 aktif jika jatah habis' : 'Tonton Iklan Reward AdMob (+1x Jatah Bermain)'}
          >
            <Video size={15} /> +1 Bermain
          </button>
        </div>

        {/* Quota Detail Banner with Gradient */}
        <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 dark:from-purple-950 dark:via-indigo-950 dark:to-slate-950 p-3.5 sm:p-4 rounded-2xl border border-purple-500/30 text-xs text-white shadow-md space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-2 text-purple-200">
              <ShieldCheck size={16} className="text-amber-400" /> Kuota Harian:
            </span>
            <span className="text-amber-300 font-mono font-black text-xs bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-400/30 shadow-2xs">
              3 Dasar {quotaInfo.verificationBonus > 0 && `+ ${quotaInfo.verificationBonus} Verifikasi`} {quotaInfo.adsWatched > 0 && `+ ${quotaInfo.adsWatched} Iklan`}
            </span>
          </div>
        </div>
      </div>

      {/* ROOM VERSUS ONLINE LIST */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs Filter: Arena Aktif & Riwayat Permainan */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setArenaTab('active')}
              className={`px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                arenaTab === 'active'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Globe size={13} className={arenaTab === 'active' ? 'animate-spin-slow' : ''} />
              <span>Arena Aktif</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${arenaTab === 'active' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                {publicRooms.filter(r => r.status !== 'finished').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setArenaTab('history')}
              className={`px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                arenaTab === 'history'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Trophy size={13} />
              <span>Riwayat Permainan</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${arenaTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                {publicRooms.filter(r => r.status === 'finished').length}
              </span>
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0 active:scale-95 border border-purple-400/30 min-h-[48px]"
          >
            <PlusCircle size={18} /> Buat Room Versus
          </button>
        </div>

        {(() => {
          const displayedRooms = publicRooms.filter((r) => 
            arenaTab === 'active' ? (r.status !== 'finished' && r.status !== 'cancelled') : r.status === 'finished'
          );

          if (displayedRooms.length === 0) {
            return (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center border border-dashed border-purple-200 dark:border-purple-900/50 space-y-3">
                <div className="w-14 h-14 mx-auto bg-purple-50 dark:bg-purple-950/60 rounded-full flex items-center justify-center text-purple-600">
                  {arenaTab === 'active' ? <Swords size={28} /> : <Trophy size={28} />}
                </div>
                <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                  {arenaTab === 'active' ? 'Belum Ada Arena Versus Aktif' : 'Belum Ada Riwayat Permainan'}
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {arenaTab === 'active'
                    ? 'Jadilah pembuat arena versus pertama! Pilih salah satu dari 33 Nama Room Islami dan bertanding dengan hingga 100 pemain.'
                    : 'Ruangan permainan yang telah selesai tidak akan dihapus dan riwayat hasil tanding akan ditampilkan di sini.'}
                </p>
                {arenaTab === 'active' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    + Buat Room Versus Sekarang
                  </button>
                )}
              </div>
            );
          }

          return (
            <div className="space-y-3">
              {displayedRooms.map((pRoom, idx) => {
                const playerCount = Object.keys(pRoom.players || {}).length;
                const maxAllowed = pRoom.maxPlayers || 100;
                const isFull = playerCount >= maxAllowed;
                const scheduledMs = pRoom.scheduledStartTime || pRoom.createdAt;
                const diffMs = scheduledMs - nowTime;
                const bgClass = CARD_BG_STYLES[idx % CARD_BG_STYLES.length];
                
                let timeText = 'Mulai: Sekarang';
                if (pRoom.startTimeOption && pRoom.startTimeOption !== 'Sekarang') {
                  if (diffMs <= 0) {
                    timeText = 'Mulai: Segera';
                  } else {
                    const mins = Math.floor(diffMs / (1000 * 60));
                    const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
                    timeText = mins > 0 ? `Mulai: ${mins}m lagi` : `Mulai: ${secs}s lagi`;
                  }
                }

                return (
                  <div
                    key={pRoom.roomCode}
                    className={`${bgClass} rounded-2xl sm:rounded-3xl p-4 sm:p-4.5 border transition-all duration-300 flex flex-col gap-3 relative overflow-hidden`}
                  >
                    {/* Header Row: Host Info & Capacity Badge */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar photoURL={pRoom.hostPhoto} displayName={pRoom.hostName} size="sm" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-sm text-white truncate drop-shadow-xs">
                              {pRoom.roomName || 'Majlis Ilmi'}
                            </span>
                            <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-md border border-white/30 shrink-0">
                              Host: {pRoom.hostName}
                            </span>
                          </div>
                          <span className="text-[10px] text-white/80 font-mono font-semibold">
                            ID Arena <strong className="font-black text-white">#{pRoom.roomCode}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Capacity Badge */}
                      <div className="bg-black/30 backdrop-blur-md text-white border border-white/30 px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 shadow-xs shrink-0">
                        <Users size={12} className="text-amber-300" />
                        <span>{playerCount}/{maxAllowed}</span>
                      </div>
                    </div>

                    {/* Metadata Tags Row */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="bg-white/25 backdrop-blur-md text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-lg border border-white/30 shadow-2xs">
                        📚 {pRoom.topic}
                      </span>
                      <span className="bg-black/25 backdrop-blur-md text-white font-bold text-[10px] px-2 py-0.5 rounded-lg border border-white/20">
                        ❓ {pRoom.questionCount} Soal
                      </span>
                      <span className="bg-black/25 backdrop-blur-md text-white font-bold text-[10px] px-2 py-0.5 rounded-lg border border-white/20">
                        ⏱️ {pRoom.timePerQuestion}s / Soal
                      </span>
                      {pRoom.status === 'finished' ? (
                        <span className="bg-slate-900/80 backdrop-blur-md text-white font-black text-[10px] px-2.5 py-0.5 rounded-lg border border-white/30 flex items-center gap-1">
                          <Trophy size={11} className="text-amber-300" /> Selesai
                        </span>
                      ) : (pRoom.status === 'playing' || pRoom.status === 'question_result') ? (
                        <span className="bg-rose-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-lg flex items-center gap-1 animate-pulse shadow-2xs border border-white/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> LIVE
                        </span>
                      ) : (
                        <span className="bg-amber-300 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                          <Clock size={11} /> {timeText}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons based on status */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 border-t border-white/20">
                      {/* 1. Masuk Room (Hanya tampil jika belum mulai / status waiting) */}
                      {pRoom.status === 'waiting' && (
                        <button
                          disabled={isFull || isSubmitting || !quotaInfo.canPlay}
                          onClick={() => handleJoinDirectRoom(pRoom.roomCode)}
                          className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                            isFull || !quotaInfo.canPlay
                              ? 'bg-black/30 text-white/50 border border-white/20 cursor-not-allowed shadow-none'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-white active:scale-95 shadow-md border border-emerald-300/40'
                          }`}
                          title={isFull ? 'Room Sudah Penuh' : 'Masuk dan Bertanding di Room Ini'}
                        >
                          <Swords size={14} /> <span>Masuk Room</span>
                        </button>
                      )}

                      {/* 2. Share */}
                      <button
                        type="button"
                        onClick={() => handleShareRoom(pRoom.roomCode, pRoom.roomName)}
                        className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Bagikan & Ajak Pengguna Lain"
                      >
                        <Share2 size={13} />
                        <span>Share</span>
                      </button>

                      {/* 3. Lihat (Hanya tampil jika game sedang berlangsung / playing, question_result, atau finished) */}
                      {(pRoom.status === 'playing' || pRoom.status === 'question_result' || pRoom.status === 'finished') && (
                        <button
                          type="button"
                          onClick={() => handleSpectateRoom(pRoom.roomCode)}
                          className="flex-1 sm:flex-initial px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-200 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 touch-manipulation"
                          title={pRoom.status === 'finished' ? 'Lihat Hasil Permainan Ini' : 'Lihat Room Ini (Sebagai Penonton)'}
                        >
                          <Eye size={13} />
                          <span>Lihat</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* CREATE ROOM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-6 max-w-md w-full border border-purple-100 dark:border-purple-900/50 shadow-2xl space-y-4 my-auto max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <PlusCircle className="text-purple-600" /> Buat Room Versus
            </h3>

            {!quotaInfo.canPlay && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Kuota Habis:</strong> Jatah bermain versus Anda telah habis hari ini. Tonton iklan untuk mendapatkan tambahan +1.
                </span>
              </div>
            )}

            <div className="space-y-4 text-left">
              {/* Nama Custom Room untuk Lencana Verifikasi (Opsional) */}
              {hasVerifiedBadge && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-purple-600" />
                    <span>Custom Nama Room (Terverifikasi)</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                      VIP
                    </span>
                  </label>
                  <input
                    type="text"
                    value={customRoomName}
                    onChange={(e) => setCustomRoomName(e.target.value)}
                    placeholder="Tulis Nama Custom Room Anda (opsional)..."
                    className="w-full p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[10px] text-purple-600 dark:text-purple-300 mt-1 font-semibold">
                    ✨ Kosongkan jika ingin memilih Nama Room dari 33 Syariat Islam di bawah.
                  </p>
                </div>
              )}

              {/* Pilih Nama Room dari 33 Syariat Islam */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Pilih Nama Room (33 Syariat Islam)
                </label>
                <select
                  value={selectedRoomName}
                  onChange={(e) => setSelectedRoomName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {availableRoomNames.map((name) => (
                    <option key={name} value={name}>
                      🕌 {name}
                    </option>
                  ))}
                  {availableRoomNames.length === 0 && (
                    <option value="">Semua nama ruangan sedang digunakan</option>
                  )}
                </select>
                {!hasVerifiedBadge && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    🔒 *Ingin Custom Nama Room? Dapatkan Lencana Verifikasi untuk membuka akses Custom Nama Room.
                  </p>
                )}
              </div>

              {/* Topik Soal (Default: Random) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Pilih Topik Soal
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Random">
                    🎲 Random
                  </option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.label}>
                      📖 {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Waktu Dimulainya Permainan dengan Accordion 1 - 24 Jam */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
                  <Clock size={13} className="text-purple-600" /> Waktu Kapan Dimulainya Permainan
                </label>
                
                {/* Quick time selection */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-2">
                  {['3 Menit Lagi', '5 Menit Lagi', '10 Menit Lagi', '15 Menit Lagi', '30 Menit Lagi'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setStartTimeOption(opt)}
                      className={`p-2 rounded-xl font-bold text-[11px] border cursor-pointer ${
                        startTimeOption === opt
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {/* Accordion 1 Jam - 24 Jam */}
                <div className="border border-purple-200 dark:border-purple-800 rounded-2xl overflow-hidden bg-purple-50/50 dark:bg-purple-950/30">
                  <button
                    type="button"
                    onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                    className="w-full p-2.5 flex items-center justify-between text-xs font-bold text-purple-800 dark:text-purple-200 hover:bg-purple-100/50 dark:hover:bg-purple-900/50 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} /> Pilihan Waktu Jam (1 Jam - 24 Jam)
                    </span>
                    {isAccordionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isAccordionOpen && (
                    <div className="p-2.5 border-t border-purple-200 dark:border-purple-800 grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
                      {Array.from({ length: 24 }, (_, i) => `${i + 1} Jam Lagi`).map((hOpt) => (
                        <button
                          key={hOpt}
                          type="button"
                          onClick={() => {
                            setStartTimeOption(hOpt);
                            setIsAccordionOpen(false);
                          }}
                          className={`p-1.5 rounded-lg font-bold text-[10px] text-center border cursor-pointer ${
                            startTimeOption === hOpt
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {hOpt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {startTimeOption.includes('Jam') && (
                  <p className="text-[10px] text-purple-600 dark:text-purple-300 font-bold mt-1">
                    ⏱️ Pilihan waktu aktif: {startTimeOption}
                  </p>
                )}
              </div>

              {/* Jumlah Soal: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Jumlah Soal
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`p-2 rounded-xl font-bold text-[11px] border cursor-pointer ${
                        questionCount === cnt
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
                {/* Reward Preview */}
                <div className="mt-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-300 flex items-center justify-between bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
                  <span>🏆 Hadiah:</span>
                  <span>+{calculateMultiplayerReward(questionCount).wasilahEarned} Wasilah & +{calculateMultiplayerReward(questionCount).xpEarned} XP</span>
                </div>
              </div>

              {/* Waktu Jawab per Soal */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Waktu Jawab per Soal
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 60].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setTimePerQuestion(sec)}
                      className={`p-2.5 rounded-xl font-bold text-xs border cursor-pointer ${
                        timePerQuestion === sec
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {sec} Detik
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                disabled={isSubmitting || !quotaInfo.canPlay}
                onClick={handleCreateRoom}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                {isSubmitting ? 'Membuat...' : 'Buat Room'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AD SIMULATION MODAL */}
      {showAdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full border border-purple-100 dark:border-purple-900/50 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-950 rounded-full flex items-center justify-center text-amber-600">
              <Video size={32} className="animate-pulse" />
            </div>

            <h3 className="font-black text-lg text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5">
              Iklan Reward AdMob
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selesaikan menonton video iklan reward AdMob ini untuk mendapatkan <strong>+1 Tambahan Jatah Bermain Versus</strong>.
            </p>

            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-700 space-y-2">
              {isAdPlaying ? (
                <>
                  <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    Google AdMob Reward Video Berlangsung
                  </p>
                  <div className="text-3xl font-mono font-black text-white">
                    00:0{adCountdown}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Mohon tunggu hingga hitungan selesai...
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                    ✅ Iklan Selesai Ditonton!
                  </p>
                  <p className="text-xs text-slate-200">
                    Klik tombol di bawah untuk mengklaim kuota Anda.
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                disabled={isAdPlaying}
                onClick={() => setShowAdModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                disabled={isAdPlaying || isSubmitting}
                onClick={handleClaimAdReward}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Klaim +1 Jatah
              </button>
            </div>
          </div>
        </div>
      )}

      <ContentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        featureName="Cerdas Cermat Versus"
        contentSnippet="Laporan Pertandingan Cerdas Cermat Versus"
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};
