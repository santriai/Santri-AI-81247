import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  HelpCircle, 
  Users, 
  UserCheck, 
  Scissors, 
  Coins, 
  Timer, 
  Shield, 
  ArrowLeft, 
  Sparkles, 
  Check, 
  X, 
  Volume2, 
  VolumeX,
  Play,
  Award,
  Zap,
  Info,
  ChevronRight,
  Gem,
  DollarSign,
  AlertCircle,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  playCountdownTick, 
  playCountdownHurry, 
  playSoundCorrect, 
  playSoundIncorrect, 
  playSoundWinner,
  speakAndroidText,
  startMiliarderLobbyLoop,
  stopMiliarderLobbyLoop,
  startMiliarderSuspenseLoop,
  stopMiliarderSuspenseLoop,
  startMiliarderGameOverLoop,
  stopMiliarderGameOverLoop,
  playMiliarderLockAnswer,
  playMiliarderCorrect,
  playMiliarderWrong,
  playMiliarderGameOver,
  playMiliarderApplause,
  playMiliarderLifeline5050,
  playMiliarderLifelinePhone,
  playMiliarderLifelineAudience,
  playMiliarderLifelineTime,
  playMiliarderCashout,
  stopAllQuizLoops
} from '../utils/quizSound';
import { updateUserData, subscribeToMiliarderLeaderboard, subscribeToQuizzes } from '../services/firebase';
import { UserAvatar } from '../components/UserAvatar';

import { Question, MILIARDER_QUESTIONS as QUESTIONS_POOL } from './miliarderQuestions';
import { DEFAULT_QUIZ_BANK } from '../constants/defaultQuizBank';
import { PLAYSTORE_LINK } from '../constants';

export interface LevelTier {
  level: number;
  prizeMoney: string;
  wasilahReward: number;
  xpReward: number;
  isSafeHaven: boolean;
}

export const getPrizeMoney = (lvl: number): string => {
  if (lvl <= 0) return "Rp 0";
  if (lvl === 100) return "Rp 1 Miliar";
  let amountMillion = 0;
  if (lvl <= 10) {
    return `Rp ${lvl * 100} Ribu`;
  } else if (lvl <= 20) {
    amountMillion = 1 + (lvl - 10) * 0.2;
  } else if (lvl <= 30) {
    amountMillion = 3 + (lvl - 20) * 0.5;
  } else if (lvl <= 40) {
    amountMillion = 8 + (lvl - 30) * 1;
  } else if (lvl <= 50) {
    amountMillion = 18 + (lvl - 40) * 3.2;
  } else if (lvl <= 60) {
    amountMillion = 50 + (lvl - 50) * 5;
  } else if (lvl <= 70) {
    amountMillion = 100 + (lvl - 60) * 15;
  } else if (lvl <= 80) {
    amountMillion = 250 + (lvl - 70) * 25;
  } else if (lvl <= 90) {
    amountMillion = 500 + (lvl - 80) * 25;
  } else {
    amountMillion = 750 + (lvl - 90) * 25;
  }
  
  if (Number.isInteger(amountMillion)) {
    return `Rp ${amountMillion} Juta`;
  } else {
    return `Rp ${amountMillion.toFixed(1).replace('.', ',')} Juta`;
  }
};

export const getWasilahReward = (lvl: number): number => {
  if (lvl <= 0) return 0;
  return Math.floor(lvl / 10) * 5 + Math.floor((lvl % 10) / 2);
};

export const getXpReward = (lvl: number): number => {
  if (lvl <= 0) return 0;
  return Math.floor(lvl / 10) * 50 + (lvl % 10) * 5;
};

export const getSafeHavenLevel = (failedAtLevel: number): number => {
  const completedLevel = failedAtLevel - 1;
  return Math.floor(completedLevel / 10) * 10;
};

export const LEVEL_TIERS: LevelTier[] = Array.from({ length: 100 }, (_, i) => {
  const lvl = 100 - i;
  return {
    level: lvl,
    prizeMoney: getPrizeMoney(lvl),
    wasilahReward: getWasilahReward(lvl),
    xpReward: getXpReward(lvl),
    isSafeHaven: lvl % 10 === 0
  };
});


export const getMaxPlaysAllowed = (userData: any): number => {
  let base = 3;
  const badge = userData?.verificationBadge || 'none';
  const activeBadges = userData?.activeBadges || [];
  
  const hasPurple = badge === 'badge_purple' || activeBadges.includes('badge_purple');
  const hasBlue = badge === 'badge_blue' || activeBadges.includes('badge_blue');
  const hasRed = badge === 'badge_red' || activeBadges.includes('badge_red');
  
  if (hasRed) {
    base += 7;
  } else if (hasBlue) {
    base += 5;
  } else if (hasPurple) {
    base += 3;
  }
  return base;
};


const IslamicGameScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  
  // Game states
  const [gameState, setGameState] = useState<'start' | 'playing' | 'cashout' | 'gameover' | 'victory'>('start');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  
  // Lifelines used tracker
  const [lifelines, setLifelines] = useState({
    fiftyFifty: false,
    askExpert: false,
    askAudience: false,
    addTime: false
  });

  // Lifelines reminder & pause states
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [hasShownReminder, setHasShownReminder] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);
  const [selectedLifelineForAd, setSelectedLifelineForAd] = useState<'addTime' | 'fiftyFifty' | 'askExpert' | 'askAudience' | null>(null);
  const [isShowingAd, setIsShowingAd] = useState(false);
  const isShowingAdRef = useRef(false);
  const setShowingAdWithRef = useCallback((val: boolean) => {
    setIsShowingAd(val);
    isShowingAdRef.current = val;
  }, []);
  const [adConfirmationModal, setAdConfirmationModal] = useState<'playQuota' | 'continueGame' | 'lifeline_addTime' | 'lifeline_fiftyFifty' | 'lifeline_askExpert' | 'lifeline_askAudience' | null>(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [hasContinuedThisGame, setHasContinuedThisGame] = useState(false);
  const [showQuitConfirmModal, setShowQuitConfirmModal] = useState(false);
  const [pendingQuitPath, setPendingQuitPath] = useState<string>('/game');
  const [lifelineContinueModal, setLifelineContinueModal] = useState<'addTime' | 'fiftyFifty' | 'askExpert' | 'askAudience' | null>(null);
  
  // Active dialogue or modal states for lifelines
  const [activeLifelineModal, setActiveLifelineModal] = useState<'expert' | 'audience' | null>(null);
  const [expertDialogue, setExpertDialogue] = useState('');
  const [audienceVotes, setAudienceVotes] = useState<number[]>([0, 0, 0, 0]);

  // Audio / Sound states
  const [isMuted, setIsMuted] = useState(false);

  // Leaderboard states
  const [topUsers, setTopUsers] = useState<any[]>([]);

  // Cerdas Cermat Quizzes bank from Firestore
  const [cerdasCermatQuizzes, setCerdasCermatQuizzes] = useState<any[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<number[]>([]);

  // Ad limits configuration for play quota
  const todayDateStr = new Date().toISOString().split('T')[0];
  const adsWatchedToday = userData?.miliarderAdQuotaDate === todayDateStr ? (userData?.miliarderAdQuotaCount || 0) : 0;
  const maxAdsPerDay = 3;

  // Subscribe to Cerdas Cermat quizzes
  useEffect(() => {
    const unsubscribe = subscribeToQuizzes((data) => {
      if (data) {
        setCerdasCermatQuizzes(data);
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Subscribe to leaderboard for game's top players
  useEffect(() => {
    const unsubscribe = subscribeToMiliarderLeaderboard((data) => {
      if (data && data.length > 0) {
        setTopUsers(data.slice(0, 3));
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Intercept hardware/browser back button & page unload during active play
  useEffect(() => {
    if (gameState === 'playing') {
      window.handleAndroidBackPress = () => {
        setPendingQuitPath('/game');
        setShowQuitConfirmModal(true);
        return true;
      };
    } else {
      delete window.handleAndroidBackPress;
    }
    return () => {
      delete window.handleAndroidBackPress;
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const currentHash = window.location.hash || '#/quiz-game';
    window.history.pushState({ inMiliarderGame: true }, '', currentHash);

    const handlePopState = () => {
      window.history.pushState({ inMiliarderGame: true }, '', currentHash);
      setPendingQuitPath('/game');
      setShowQuitConfirmModal(true);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Permainan Santri Miliarder sedang berlangsung. Mengundurkan diri akan menganggap Anda kalah.';
      return e.returnValue;
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameState]);

  // Time remaining per question
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 10-second delay state after answering incorrectly or time out before going to Game Over
  const [wrongCountdown, setWrongCountdown] = useState<number | null>(null);

  // Helper function to share game link & achievements
  const handleShareGame = async (levelNum?: number, isCashout?: boolean) => {
    const shareText = isCashout
      ? `Saya berhasil membawa pulang hadiah Wasilah & XP di Level ${levelNum || currentLevel} dalam Kuis Santri Miliarder! 💰 Uji wawasan Islammu sekarang!\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`
      : `Ayo mainkan Kuis Santri Miliarder! 🕌 100 tingkat pengetahuan Tajwid, Al-Quran, Fiqih, & Aqidah Islam! Bisakah kamu jadi Miliarder selanjutnya?\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;

    const title = 'Santri Miliarder - Kuis Islami';

    if ((window as any).AndroidNativeInterface?.shareText) {
      try {
        (window as any).AndroidNativeInterface.shareText(title, shareText);
        return;
      } catch (e) {
        // Fallback
      }
    } else if ((window as any).AndroidInterface?.shareText) {
      try {
        (window as any).AndroidInterface.shareText(title, shareText);
        return;
      } catch (e) {
        // Fallback
      }
    } else if ((window as any).AndroidInterface?.share) {
      try {
        (window as any).AndroidInterface.share(shareText);
        return;
      } catch (e) {
        // Fallback
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: window.location.origin });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(shareText);
            showToast("Link game berhasil disalin!", "success");
          } catch (e) {
            showToast("Gagal membagikan link.", "error");
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast("Link game berhasil disalin!", "success");
      } catch (e) {
        showToast("Gagal membagikan link.", "error");
      }
    }
  };

  // Helper to shuffle question options and adjust correct index
  const shuffleMiliarderQuestion = (q: Question): Question => {
    const originalCorrectText = q.options[q.correct];
    const shuffledOptions = [...q.options];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    const newCorrectIndex = shuffledOptions.indexOf(originalCorrectText);
    return {
      ...q,
      options: shuffledOptions,
      correct: newCorrectIndex !== -1 ? newCorrectIndex : q.correct
    };
  };

  // Load a random question for the current level
  const loadQuestionForLevel = useCallback((levelNum: number, currentHistory?: number[]) => {
    // Determine pool candidates based on difficulty tier of levelNum
    let minLvl = 1;
    let maxLvl = 100;
    if (levelNum <= 10) {
      minLvl = 1;
      maxLvl = 15;
    } else if (levelNum <= 25) {
      minLvl = 11;
      maxLvl = 30;
    } else if (levelNum <= 50) {
      minLvl = 31;
      maxLvl = 55;
    } else if (levelNum <= 75) {
      minLvl = 51;
      maxLvl = 80;
    } else {
      minLvl = 76;
      maxLvl = 100;
    }

    const history = currentHistory !== undefined ? currentHistory : usedQuestionIds;

    // Read persistent correctly answered questions from localStorage
    let persistentAnswered: string[] = [];
    try {
      const stored = localStorage.getItem('santri_miliarder_answered_questions');
      if (stored) persistentAnswered = JSON.parse(stored);
    } catch (e) {}

    // Prioritaskan 100% Soal Admin dari Firestore (`cerdasCermatQuizzes`)
    const adminQuizzes = cerdasCermatQuizzes && cerdasCermatQuizzes.length > 0 ? cerdasCermatQuizzes : [];
    
    // Combine Admin Quizzes + DEFAULT_QUIZ_BANK
    const combinedBankSoal = [
      ...adminQuizzes,
      ...DEFAULT_QUIZ_BANK.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctIndex,
        topic: q.topic
      }))
    ];

    let selectedQ: Question | null = null;
    
    if (combinedBankSoal.length > 0) {
      // 1. Cari soal Admin Firestore yang belum digunakan
      const unusedAdmin = adminQuizzes.filter(q => {
        const tempId = q.id ? (typeof q.id === 'string' ? q.id.charCodeAt(0) : q.id) : 0;
        return !history.includes(tempId) && !persistentAnswered.includes(q.question);
      });

      // 2. Jika ada soal Admin yang belum digunakan, PAKAI SOAL ADMIN!
      const candidateList = unusedAdmin.length > 0 
        ? unusedAdmin 
        : combinedBankSoal.filter(q => {
            const tempId = q.id ? (typeof q.id === 'string' ? q.id.charCodeAt(0) : q.id) : 0;
            return !history.includes(tempId) && !persistentAnswered.includes(q.question);
          });

      const activeQuizzes = candidateList.length > 0 ? candidateList : combinedBankSoal;
      const randomQuiz = activeQuizzes[Math.floor(Math.random() * activeQuizzes.length)];
      const tempId = randomQuiz.id ? (typeof randomQuiz.id === 'string' ? randomQuiz.id.charCodeAt(0) + Math.floor(Math.random() * 100000) : randomQuiz.id) : Math.floor(Math.random() * 1000000);
      
      selectedQ = {
        id: tempId,
        level: levelNum,
        question: randomQuiz.question,
        options: randomQuiz.options,
        correct: typeof randomQuiz.correctAnswer === 'number' ? randomQuiz.correctAnswer : (typeof randomQuiz.correct === 'number' ? randomQuiz.correct : 0),
        category: randomQuiz.topic || randomQuiz.category || "Cerdas Cermat"
      };
    }
    
    // If no cerdas cermat question selected, pick from local MILIARDER_QUESTIONS
    if (!selectedQ) {
      const candidates: Question[] = [];
      for (let l = minLvl; l <= maxLvl; l++) {
        const levelQuestions = QUESTIONS_POOL[l];
        if (levelQuestions) {
          candidates.push(...levelQuestions);
        }
      }
      
      // Filter out already used and correctly answered questions
      const unusedCandidates = candidates.filter(q => !history.includes(q.id) && !persistentAnswered.includes(q.question));
      const activeCandidates = unusedCandidates.length > 0 
        ? unusedCandidates 
        : candidates.filter(q => !history.includes(q.id));
      const finalCandidates = activeCandidates.length > 0 ? activeCandidates : candidates;

      const randomIndex = Math.floor(Math.random() * finalCandidates.length);
      selectedQ = finalCandidates[randomIndex];
    }

    if (selectedQ) {
      const shuffledQ = shuffleMiliarderQuestion(selectedQ);
      setCurrentQuestion(shuffledQ);
      setUsedQuestionIds(prev => [...prev, selectedQ!.id]);
    }

    setEliminatedOptions([]);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsLocking(false);
    setIsCorrectAnswer(null);
    setTimeLeft(60);
    setHasShownReminder(false);
    setWrongCountdown(null);
  }, [cerdasCermatQuizzes, usedQuestionIds]);

  // Web Audio Synthesis speech (Indonesian voice cues)
  const speakCue = useCallback((text: string) => {
    speakAndroidText(text, isMuted);
  }, [isMuted]);

  // Start fresh game
  const handleStartGame = async () => {
    // Check daily limit
    const todayDate = new Date().toISOString().split('T')[0];
    const maxPlays = getMaxPlaysAllowed(userData);
    const playedToday = userData?.miliarderLastPlayedDate === todayDate ? (userData?.miliarderPlayCount || 0) : 0;
    
    if (playedToday >= maxPlays) {
      setShowQuotaModal(true);
      return;
    }

    // Increment play count in database
    if (user) {
      try {
        await updateUserData(user.uid, {
          miliarderPlayCount: playedToday + 1,
          miliarderLastPlayedDate: todayDate
        });
      } catch (err) {
        console.error("Gagal memperbarui batas bermain harian:", err);
      }
    }

    setGameState('playing');
    setCurrentLevel(1);
    setUsedQuestionIds([]);
    setLifelines({
      fiftyFifty: false,
      askExpert: false,
      askAudience: false,
      addTime: false
    });
    setHasShownReminder(false);
    setShowReminderPopup(false);
    setIsGamePaused(false);
    setHasContinuedThisGame(false);
    setWrongCountdown(null);
    loadQuestionForLevel(1, []);
    speakCue("Selamat datang di kuis santri miliarder. Semoga berhasil!");
  };

  const saveRewardsToFirebase = useCallback(async (rewardWasilah: number, rewardXp: number, reason: string) => {
    if (!user) return;
    try {
      const currentWasilah = userData?.wasilah || 0;
      const currentPoints = userData?.points || 0;
      const currentMiliarderXp = userData?.miliarderXp || 0;
      const newWasilah = currentWasilah + rewardWasilah;
      const newPoints = currentPoints + rewardXp;
      const newMiliarderXp = currentMiliarderXp + rewardXp;
      await updateUserData(user.uid, { 
        wasilah: newWasilah,
        points: newPoints,
        miliarderXp: newMiliarderXp
      });
      if (rewardWasilah > 0 || rewardXp > 0) {
        showToast(`Alhamdulillah! +${rewardWasilah} Wasilah & +${rewardXp} XP ditambahkan (${reason})`, 'success');
      }
    } catch (err) {
      console.error("Gagal menyimpan hadiah Wasilah & XP:", err);
    }
  }, [user, userData, showToast]);

  // Handle wrong answer or time limit up
  const handleGameLost = useCallback(() => {
    if (!isMuted) playMiliarderWrong();
    const safeHavenLvl = getSafeHavenLevel(currentLevel);
    setGameState('gameover');
    if (safeHavenLvl > 0) {
      const rewardWasilah = getWasilahReward(safeHavenLvl);
      const rewardXp = getXpReward(safeHavenLvl);
      saveRewardsToFirebase(rewardWasilah, rewardXp, `Titik Aman Level ${safeHavenLvl}`);
      speakCue(`Waktu habis atau jawaban kurang tepat. Tapi Anda tetap membawa pulang hadiah titik aman sebesar ${rewardWasilah} Wasilah dan ${rewardXp} XP.`);
    } else {
      speakCue("Sayang sekali, Anda belum mencapai titik aman pertama.");
    }

    // Trigger AdMob Interstitial Ad
    if (!isShowingAdRef.current && window.AndroidNativeInterface?.showInterstitialAd) {
      try {
        setShowingAdWithRef(true);
        window.AndroidNativeInterface.showInterstitialAd();
        // Reset flag after 6 seconds as a safety fallback
        setTimeout(() => setShowingAdWithRef(false), 6000);
      } catch (err) {
        console.error("Gagal menampilkan Interstitial Ad:", err);
        setShowingAdWithRef(false);
      }
    }
  }, [currentLevel, saveRewardsToFirebase, speakCue, isMuted]);

  // Walk away with currently secure reward
  const handleCashOut = () => {
    if (!isMuted) playMiliarderCashout();
    setGameState('cashout');
    const cashOutLevel = currentLevel - 1;
    if (cashOutLevel > 0) {
      const rewardWasilah = getWasilahReward(cashOutLevel);
      const rewardXp = getXpReward(cashOutLevel);
      saveRewardsToFirebase(rewardWasilah, rewardXp, `Mundur dengan Terhormat Level ${cashOutLevel}`);
      speakCue(`Keputusan cerdas. Anda membawa pulang ${rewardWasilah} Wasilah dan ${rewardXp} XP.`);
    } else {
      speakCue("Anda memutuskan mundur tanpa hadiah.");
    }

    // Trigger AdMob Interstitial Ad
    if (!isShowingAdRef.current && window.AndroidNativeInterface?.showInterstitialAd) {
      try {
        setShowingAdWithRef(true);
        window.AndroidNativeInterface.showInterstitialAd();
        // Reset flag after 6 seconds as a safety fallback
        setTimeout(() => setShowingAdWithRef(false), 6000);
      } catch (err) {
        console.error("Gagal menampilkan Interstitial Ad:", err);
        setShowingAdWithRef(false);
      }
    }
  };

  // Main Lobby Theme Sound Loop (Who Wants to Be a Millionaire Indonesia style)
  useEffect(() => {
    if (gameState === 'start' && !isMuted) {
      startMiliarderLobbyLoop();
    } else {
      stopMiliarderLobbyLoop();
    }
    return () => {
      stopMiliarderLobbyLoop();
    };
  }, [gameState, isMuted]);

  // Game Over Sound Loop
  useEffect(() => {
    if (gameState === 'gameover' && !isMuted) {
      startMiliarderGameOverLoop();
    } else {
      stopMiliarderGameOverLoop();
    }
    return () => {
      stopMiliarderGameOverLoop();
    };
  }, [gameState, isMuted]);

  // Play sound on victory
  useEffect(() => {
    if (!isMuted && gameState === 'victory') {
      playMiliarderCorrect(100);
    }
  }, [gameState, isMuted]);

  // Suspense sound loop for Santri Miliarder (Who Wants to Be a Millionaire style)
  useEffect(() => {
    if (gameState === 'playing' && !isAnswered && !isLocking && !isGamePaused && !isMuted) {
      startMiliarderSuspenseLoop(currentLevel);
    } else {
      stopMiliarderSuspenseLoop();
    }
    return () => {
      stopMiliarderSuspenseLoop();
    };
  }, [gameState, isAnswered, isLocking, isGamePaused, isMuted, currentLevel]);

  // Timer tick effect
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !isAnswered && !isLocking && !isGamePaused && wrongCountdown === null) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => {
          const nextTime = prev - 1;
          if (nextTime > 0 && !isMuted) {
            if (nextTime <= 10) {
              playCountdownHurry();
            } else {
              playCountdownTick();
            }
          }
          return nextTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered && !isLocking && gameState === 'playing' && !isGamePaused && wrongCountdown === null) {
      setIsAnswered(true);
      if (!isMuted) playMiliarderWrong();
      speakCue("Sayang sekali, waktu telah habis.");
      setWrongCountdown(10);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isAnswered, isLocking, gameState, isGamePaused, handleGameLost, isMuted, wrongCountdown, speakCue]);

  // 10-second delay countdown after wrong answer or timeout before transitioning to Game Over
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (wrongCountdown !== null && wrongCountdown > 0) {
      timer = setInterval(() => {
        setWrongCountdown(prev => (prev !== null && prev > 1 ? prev - 1 : 0));
      }, 1000);
    } else if (wrongCountdown === 0) {
      setWrongCountdown(null);
      handleGameLost();
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [wrongCountdown, handleGameLost]);

  // Trigger reminder popup at 15 seconds remaining
  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 15 && !isAnswered && !isLocking && !hasShownReminder) {
      setIsGamePaused(true);
      setShowReminderPopup(true);
      setHasShownReminder(true);
      speakCue("Waktu sisa lima belas detik. Silakan gunakan bantuan sebelum terlambat!");
    }
  }, [timeLeft, gameState, isAnswered, isLocking, hasShownReminder, speakCue]);

  // Global ad callback cleanup on component unmount
  useEffect(() => {
    return () => {
      delete window.onRewardGranted;
    };
  }, []);

  // Answer handler (Millionaire "Lock Answer" -> Suspense -> Reveal)
  const handleAnswerOption = (index: number) => {
    if (isAnswered || isLocking || !currentQuestion) return;

    setSelectedOption(index);
    setIsLocking(true);

    if (!isMuted) {
      playMiliarderLockAnswer();
    }

    // Suspense delay (~1.3 seconds) before revealing answer
    setTimeout(() => {
      setIsLocking(false);
      setIsAnswered(true);

      const isCorrect = index === currentQuestion.correct;
      setIsCorrectAnswer(isCorrect);

      if (!isMuted) {
        if (isCorrect) {
          playMiliarderCorrect(currentLevel);
        } else {
          playMiliarderWrong();
        }
      }

      if (isCorrect) {
        if (currentQuestion) {
          try {
            const stored = localStorage.getItem('santri_miliarder_answered_questions');
            const list: string[] = stored ? JSON.parse(stored) : [];
            if (!list.includes(currentQuestion.question)) {
              list.push(currentQuestion.question);
              localStorage.setItem('santri_miliarder_answered_questions', JSON.stringify(list));
            }
          } catch (e) {}
        }
        speakCue("Jawaban Anda luar biasa, benar!");
        // Proceed to next level or win
        setTimeout(() => {
          if (currentLevel === 100) {
            // Grand victory!
            setGameState('victory');
            const finalWasilah = getWasilahReward(100);
            const finalXp = getXpReward(100);
            saveRewardsToFirebase(finalWasilah, finalXp, "Juara Santri Miliarder!");
            speakCue("Mabruk! Anda telah menjawab ke-100 pertanyaan dengan sempurna dan sah menjadi Santri Miliarder!");
            
            // Trigger AdMob Interstitial Ad
            if (!isShowingAdRef.current && window.AndroidNativeInterface?.showInterstitialAd) {
              try {
                setShowingAdWithRef(true);
                window.AndroidNativeInterface.showInterstitialAd();
                // Reset flag after 6 seconds as a safety fallback
                setTimeout(() => setShowingAdWithRef(false), 6000);
              } catch (err) {
                console.error("Gagal menampilkan Interstitial Ad:", err);
                setShowingAdWithRef(false);
              }
            }
          } else {
            const nextLvl = currentLevel + 1;
            setCurrentLevel(nextLvl);
            loadQuestionForLevel(nextLvl);
            showToast(`Benar! Naik ke Level ${nextLvl}`, 'success');
          }
        }, 2200);
      } else {
        speakCue("Sayang sekali, jawaban kurang tepat. Pelajari jawaban yang benar.");
        setWrongCountdown(10);
      }
    }, 1300);
  };

  // LIFELINES (Bantuan)
  
  // Trigger a lifeline and show rewarded ad
  const triggerLifelineWithAd = (type: 'addTime' | 'fiftyFifty' | 'askExpert' | 'askAudience') => {
    if (isShowingAdRef.current) {
      showToast("Iklan sedang ditampilkan, silakan tunggu.", "warning");
      return;
    }

    setSelectedLifelineForAd(type);
    setShowingAdWithRef(true);
    setIsGamePaused(true);

    // Safety fallback timer to prevent getting stuck if AdMob fails/cancels
    const adTimeout = setTimeout(() => {
      if (isShowingAdRef.current) {
        console.warn("Lifeline Ad display timed out, force resetting ad state.");
        setShowingAdWithRef(false);
        setSelectedLifelineForAd(null);
        setIsGamePaused(false);
      }
    }, 45000); // 45 seconds fallback

    window.onRewardGranted = () => {
      clearTimeout(adTimeout);
      setShowingAdWithRef(false);
      setSelectedLifelineForAd(null);
      setShowReminderPopup(false);
      setIsGamePaused(true);

      if (type === 'addTime') {
        setLifelines(prev => ({ ...prev, addTime: true }));
        setTimeLeft(prev => prev + 30);
        if (!isMuted) playMiliarderLifelineTime();
        showToast("Bantuan Tambahan Waktu: +30 detik berhasil ditambahkan!", "success");
        speakCue("Waktu Anda telah ditambahkan tiga puluh detik.");
      } else if (type === 'fiftyFifty') {
        setLifelines(prev => ({ ...prev, fiftyFifty: true }));
        if (!isMuted) playMiliarderLifeline5050();
        if (currentQuestion) {
          const correctIdx = currentQuestion.correct;
          const wrongIndices = [0, 1, 2, 3].filter(idx => idx !== correctIdx);
          const toEliminate = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
          setEliminatedOptions(toEliminate);
          speakCue("Sistem telah mengeliminasi dua jawaban salah.");
          showToast("Bantuan 50:50 Aktif!", "info");
        }
      } else if (type === 'askExpert') {
        setLifelines(prev => ({ ...prev, askExpert: true }));
        if (!isMuted) playMiliarderLifelinePhone();
        if (currentQuestion) {
          const correctIdx = currentQuestion.correct;
          const correctLetter = ["A", "B", "C", "D"][correctIdx];
          const optionText = currentQuestion.options[correctIdx];
          const scholars = [
            "Ustadz Adi Hidayat",
            "Ustadz Hanan Attaki",
            "Gus Baha",
            "Ustadz Abdul Somad"
          ];
          const scholarName = scholars[Math.floor(Math.random() * scholars.length)];
          const isScholarRight = Math.random() < 0.85;
          let text = "";
          if (isScholarRight) {
            text = `Bismillahirrahmannirrahim. Berdasarkan referensi kitab keislaman yang muktabar, saya condong kepada pilihan ${correctLetter} ("${optionText}"). Insyaallah itu jawaban yang paling rajih (unggul). Wallahu a'lam.`;
          } else {
            const otherIdx = [0, 1, 2, 3].find(idx => idx !== correctIdx) || 0;
            const otherLetter = ["A", "B", "C", "D"][otherIdx];
            const otherText = currentQuestion.options[otherIdx];
            text = `Bismillah. Saya sedikit ragu, namun sekilas ingatan saya condong ke pilihan ${otherLetter} ("${otherText}"). Tapi tolong kaji kembali ya, karena ilmu saya masih terbatas.`;
          }
          setExpertDialogue(`[${scholarName}]: "${text}"`);
          speakCue(`Menghubungi ${scholarName}. Silakan dengarkan sarannya.`);
        }
      } else if (type === 'askAudience') {
        setLifelines(prev => ({ ...prev, askAudience: true }));
        if (!isMuted) playMiliarderLifelineAudience();
        if (currentQuestion) {
          const correctIdx = currentQuestion.correct;
          const votes = [0, 0, 0, 0];
          const correctShare = Math.floor(Math.random() * 25) + 55; // 55% to 80%
          votes[correctIdx] = correctShare;
          let remaining = 100 - correctShare;
          const incorrectIndices = [0, 1, 2, 3].filter(idx => idx !== correctIdx);
          const share1 = Math.floor(Math.random() * (remaining - 5));
          votes[incorrectIndices[0]] = share1;
          remaining -= share1;
          const share2 = Math.floor(Math.random() * remaining);
          votes[incorrectIndices[1]] = share2;
          remaining -= share2;
          votes[incorrectIndices[2]] = remaining;
          setAudienceVotes(votes);
          speakCue("Para santri di majelis sedang memberikan suara mereka.");
        }
      }
      
      setLifelineContinueModal(type);
      delete window.onRewardGranted;
    };

    if (window.AndroidNativeInterface?.showRewardedAd) {
      try {
        window.AndroidNativeInterface.showRewardedAd();
      } catch (err) {
        console.error("Gagal menampilkan Rewarded Ad:", err);
        showToast("Menampilkan iklan simulasi...", "info");
        setTimeout(() => {
          if (window.onRewardGranted) window.onRewardGranted();
        }, 1500);
      }
    } else {
      showToast("Menampilkan iklan simulasi...", "info");
      setTimeout(() => {
        if (window.onRewardGranted) window.onRewardGranted();
      }, 1500);
    }
  };

  const handleLifelineClick = (type: 'addTime' | 'fiftyFifty' | 'askExpert' | 'askAudience') => {
    if (lifelines[type] || isAnswered) return;
    setIsGamePaused(true);
    setAdConfirmationModal(`lifeline_${type}` as any);
  };

  const handleCancelLifelineAd = () => {
    setAdConfirmationModal(null);
    if (!showReminderPopup) {
      setIsGamePaused(false);
    }
  };

  // Trigger a rewarded ad for +1 play quota
  const handleWatchAdForQuota = () => {
    if (adsWatchedToday >= maxAdsPerDay) {
      showToast("Batas menonton iklan harian tercapai! Maksimal 3x sehari.", "warning");
      return;
    }

    if (isShowingAdRef.current) {
      showToast("Iklan sedang ditampilkan, silakan tunggu.", "warning");
      return;
    }

    setShowingAdWithRef(true);
    setAdConfirmationModal(null);

    // Safety fallback timer to prevent getting stuck if AdMob fails/cancels
    const adTimeout = setTimeout(() => {
      if (isShowingAdRef.current) {
        console.warn("Quota Ad display timed out, force resetting ad state.");
        setShowingAdWithRef(false);
      }
    }, 45000); // 45 seconds fallback

    window.onRewardGranted = async () => {
      clearTimeout(adTimeout);
      setShowingAdWithRef(false);
      const todayDate = new Date().toISOString().split('T')[0];
      const playedToday = userData?.miliarderLastPlayedDate === todayDate ? (userData?.miliarderPlayCount || 0) : 0;
      
      if (user) {
        try {
          await updateUserData(user.uid, {
            miliarderPlayCount: Math.max(0, playedToday - 1),
            miliarderLastPlayedDate: todayDate,
            miliarderAdQuotaCount: adsWatchedToday + 1,
            miliarderAdQuotaDate: todayDate
          });
          showToast(`Alhamdulillah! +1 kesempatan bermain ditambahkan gratis. (Iklan harian: ${adsWatchedToday + 1}/${maxAdsPerDay})`, "success");
          speakCue("Kesempatan bermain Anda telah ditambahkan. Silakan mulai perjuangan Anda!");
        } catch (err) {
          console.error("Gagal menambah jatah bermain harian:", err);
          showToast("Gagal memperbarui jatah bermain di server.", "error");
        }
      } else {
        showToast("Alhamdulillah! Kesempatan bermain simulasi ditambahkan.", "success");
      }
      delete window.onRewardGranted;
    };

    if (window.AndroidNativeInterface?.showRewardedAd) {
      try {
        window.AndroidNativeInterface.showRewardedAd();
      } catch (err) {
        console.error("Gagal menampilkan Rewarded Ad:", err);
        showToast("Menampilkan iklan simulasi...", "info");
        setTimeout(() => {
          if (window.onRewardGranted) window.onRewardGranted();
        }, 1500);
      }
    } else {
      showToast("Menampilkan iklan simulasi...", "info");
      setTimeout(() => {
        if (window.onRewardGranted) window.onRewardGranted();
      }, 1500);
    }
  };

  // Trigger a rewarded ad to continue the current game session
  const handleWatchAdForContinue = () => {
    if (isShowingAdRef.current) {
      showToast("Iklan sedang ditampilkan, silakan tunggu.", "warning");
      return;
    }

    setShowingAdWithRef(true);
    setAdConfirmationModal(null);

    // Safety fallback timer to prevent getting stuck if AdMob fails/cancels
    const adTimeout = setTimeout(() => {
      if (isShowingAdRef.current) {
        console.warn("Continue Game Ad display timed out, force resetting ad state.");
        setShowingAdWithRef(false);
      }
    }, 45000); // 45 seconds fallback

    window.onRewardGranted = () => {
      clearTimeout(adTimeout);
      setShowingAdWithRef(false);
      setHasContinuedThisGame(true);
      setGameState('playing');
      setTimeLeft(60);
      setIsAnswered(false);
      setIsCorrectAnswer(null);
      setSelectedOption(null);
      setEliminatedOptions([]);
      setIsGamePaused(false);
      
      // Load a fresh question for this level so they have a fresh chance
      loadQuestionForLevel(currentLevel);
      
      showToast(`Permainan dilanjutkan dari Level ${currentLevel}!`, "success");
      speakCue("Permainan dilanjutkan. Semoga sukses!");
      delete window.onRewardGranted;
    };

    if (window.AndroidNativeInterface?.showRewardedAd) {
      try {
        window.AndroidNativeInterface.showRewardedAd();
      } catch (err) {
        console.error("Gagal menampilkan Rewarded Ad:", err);
        showToast("Menampilkan iklan simulasi...", "info");
        setTimeout(() => {
          if (window.onRewardGranted) window.onRewardGranted();
        }, 1500);
      }
    } else {
      showToast("Menampilkan iklan simulasi...", "info");
      setTimeout(() => {
        if (window.onRewardGranted) window.onRewardGranted();
      }, 1500);
    }
  };

  // 1. 50:50
  const useFiftyFifty = () => {
    if (lifelines.fiftyFifty || isAnswered || !currentQuestion) return;
    setLifelines(prev => ({ ...prev, fiftyFifty: true }));
    
    // Pick two wrong options to eliminate
    const correctIdx = currentQuestion.correct;
    const wrongIndices = [0, 1, 2, 3].filter(idx => idx !== correctIdx);
    
    // Shuffle and pick 2 to eliminate
    const toEliminate = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
    setEliminatedOptions(toEliminate);
    speakCue("Sistem telah mengeliminasi dua jawaban salah.");
    showToast("Bantuan 50:50 Aktif!", "info");
  };

  // 2. Tanya Ustadz (Virtual Islamic Scholar)
  const useAskExpert = () => {
    if (lifelines.askExpert || isAnswered || !currentQuestion) return;
    setLifelines(prev => ({ ...prev, askExpert: true }));

    const correctIdx = currentQuestion.correct;
    const correctLetter = ["A", "B", "C", "D"][correctIdx];
    const optionText = currentQuestion.options[correctIdx];

    const scholars = [
      "Ustadz Adi Hidayat",
      "Ustadz Hanan Attaki",
      "Gus Baha",
      "Ustadz Abdul Somad"
    ];
    const scholarName = scholars[Math.floor(Math.random() * scholars.length)];

    // 85% probability of giving the correct answer, 15% unsure/wrong
    const isScholarRight = Math.random() < 0.85;
    let text = "";
    if (isScholarRight) {
      text = `Bismillahirrahmannirrahim. Berdasarkan referensi kitab keislaman yang muktabar, saya condong kepada pilihan ${correctLetter} ("${optionText}"). Insyaallah itu jawaban yang paling rajih (unggul). Wallahu a'lam.`;
    } else {
      const otherIdx = [0, 1, 2, 3].find(idx => idx !== correctIdx) || 0;
      const otherLetter = ["A", "B", "C", "D"][otherIdx];
      const otherText = currentQuestion.options[otherIdx];
      text = `Bismillah. Saya sedikit ragu, namun sekilas ingatan saya condong ke pilihan ${otherLetter} ("${otherText}"). Tapi tolong kaji kembali ya, karena ilmu saya masih terbatas.`;
    }

    setExpertDialogue(`[${scholarName}]: "${text}"`);
    setActiveLifelineModal('expert');
    speakCue(`Menghubungi ${scholarName}. Silakan dengarkan sarannya.`);
  };

  // 3. Tanya Santri (Ask the Audience / Santri Community poll)
  const useAskAudience = () => {
    if (lifelines.askAudience || isAnswered || !currentQuestion) return;
    setLifelines(prev => ({ ...prev, askAudience: true }));

    const correctIdx = currentQuestion.correct;
    
    // Distribute 100% among A, B, C, D favoring correct option heavily
    const votes = [0, 0, 0, 0];
    const correctShare = Math.floor(Math.random() * 25) + 55; // 55% to 80%
    votes[correctIdx] = correctShare;

    let remaining = 100 - correctShare;
    const incorrectIndices = [0, 1, 2, 3].filter(idx => idx !== correctIdx);

    // Distribute remaining randomly among wrong options
    const share1 = Math.floor(Math.random() * (remaining - 5));
    votes[incorrectIndices[0]] = share1;
    remaining -= share1;

    const share2 = Math.floor(Math.random() * remaining);
    votes[incorrectIndices[1]] = share2;
    remaining -= share2;

    votes[incorrectIndices[2]] = remaining;

    setAudienceVotes(votes);
    setActiveLifelineModal('audience');
    speakCue("Para santri di majelis sedang memberikan suara mereka.");
  };

  // Scroll active level into view and keep user focused on top
  useEffect(() => {
    if (gameState === 'playing') {
      // Always scroll window to top so user is directly focused on the question
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Only scroll the tier list if we are on a larger screen (desktop)
      const activeElement = document.getElementById(`tier-row-${currentLevel}`);
      if (activeElement && window.innerWidth >= 1024) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentLevel, gameState]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* Header (Standard Header when not playing, or 2-Row Floating Game Control Header when playing) */}
      {gameState === 'playing' ? (
        <header className="px-3 sm:px-6 py-2 bg-slate-950/95 backdrop-blur-md sticky top-0 z-50 border-b border-indigo-900/40 shadow-lg shadow-indigo-950/40 space-y-1.5">
          {/* BARIS 1: Exit, Level, Timer, Sound */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Exit */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setPendingQuitPath('/game');
                  setShowQuitConfirmModal(true);
                }} 
                className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-xl bg-slate-900/80 border border-slate-800 shrink-0"
                title="Kembali"
              >
                <ArrowLeft size={18} />
              </button>
            </div>

            {/* Right: Level, Timer & Sound Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Level Tag */}
              <div className="bg-indigo-950/90 border border-indigo-500/40 px-2 sm:px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-wider">LEVEL</span>
                <span className="text-xs font-black text-white">{currentLevel}/100</span>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 px-2 sm:px-2.5 py-1 rounded-xl shadow-sm">
                <Timer size={13} className={timeLeft < 10 ? "text-red-500 animate-ping" : "text-indigo-400"} />
                <span className={`text-xs font-black font-mono ${timeLeft < 10 ? "text-red-500" : "text-white"}`}>
                  {timeLeft}s
                </span>
              </div>

              {/* Sound Toggle */}
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-xl bg-slate-900/80 border border-slate-800/80"
                title={isMuted ? "Aktifkan Suara" : "Matikan Suara"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
          </div>

          {/* BARIS 2: Lifelines (+30s, 50:50, Ustadz, Santri) */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-900/60">
            <div className="flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Tambah Waktu (+30s) */}
              <button 
                onClick={() => handleLifelineClick('addTime')}
                disabled={lifelines.addTime || isAnswered || isLocking}
                className={`px-2 sm:px-2.5 py-1 rounded-xl border flex items-center gap-1 transition-all ${
                  lifelines.addTime 
                    ? 'bg-slate-950/50 border-slate-900/30 text-slate-700 cursor-not-allowed' 
                    : 'bg-indigo-950/70 border-indigo-500/40 text-indigo-300 hover:bg-indigo-900 active:scale-90 shadow-md shadow-indigo-950/30'
                }`}
                title="Tambah Waktu (+30 Detik)"
              >
                <Timer size={13} />
                <span className="text-[10px] font-extrabold">+30s</span>
              </button>

              {/* 50:50 */}
              <button 
                onClick={() => handleLifelineClick('fiftyFifty')}
                disabled={lifelines.fiftyFifty || isAnswered || isLocking}
                className={`px-2 sm:px-2.5 py-1 rounded-xl border flex items-center gap-1 transition-all ${
                  lifelines.fiftyFifty 
                    ? 'bg-slate-950/50 border-slate-900/30 text-slate-700 cursor-not-allowed' 
                    : 'bg-amber-950/70 border-amber-500/40 text-amber-300 hover:bg-amber-900 active:scale-90 shadow-md shadow-amber-950/30'
                }`}
                title="Bantuan 50:50"
              >
                <Scissors size={13} />
                <span className="text-[10px] font-extrabold">50:50</span>
              </button>

              {/* Tanya Ustadz */}
              <button 
                onClick={() => handleLifelineClick('askExpert')}
                disabled={lifelines.askExpert || isAnswered || isLocking}
                className={`px-2 sm:px-2.5 py-1 rounded-xl border flex items-center gap-1 transition-all ${
                  lifelines.askExpert 
                    ? 'bg-slate-950/50 border-slate-900/30 text-slate-700 cursor-not-allowed' 
                    : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 active:scale-90 shadow-md shadow-emerald-950/30'
                }`}
                title="Tanya Ustadz"
              >
                <UserCheck size={13} />
                <span className="text-[10px] font-extrabold">Ustadz</span>
              </button>

              {/* Tanya Santri */}
              <button 
                onClick={() => handleLifelineClick('askAudience')}
                disabled={lifelines.askAudience || isAnswered || isLocking}
                className={`px-2 sm:px-2.5 py-1 rounded-xl border flex items-center gap-1 transition-all ${
                  lifelines.askAudience 
                    ? 'bg-slate-950/50 border-slate-900/30 text-slate-700 cursor-not-allowed' 
                    : 'bg-sky-950/70 border-sky-500/40 text-sky-300 hover:bg-sky-900 active:scale-90 shadow-md shadow-sky-950/30'
                }`}
                title="Tanya Santri (Poling)"
              >
                <Users size={13} />
                <span className="text-[10px] font-extrabold">Santri</span>
              </button>
            </div>
          </div>
        </header>
      ) : (
        <header className="px-6 py-4 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
          <button 
            onClick={() => {
              navigate('/game');
            }} 
            className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
            title="Kembali"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="p-2 text-slate-400 hover:text-white transition-colors mr-1"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            {user && (
              <button 
                onClick={() => {
                  navigate('/profile');
                }}
                className="flex items-center gap-2 border-l border-slate-900 pl-3 hover:opacity-80 transition-opacity text-left cursor-pointer focus:outline-none"
              >
                <UserAvatar 
                  photoURL={userData?.photoURL || user?.photoURL}
                  displayName={userData?.displayName || user?.displayName}
                  points={userData?.points || 0}
                  avatarFrame={userData?.avatarFrame || 'none'}
                  verificationBadge={userData?.verificationBadge || 'none'}
                  size="sm"
                />
                <div className="hidden md:block text-left">
                  <p className="text-[10px] font-black text-white truncate max-w-[80px]">
                    {userData?.displayName || user?.displayName || 'Santri'}
                  </p>
                  <p className="text-[8px] font-bold text-amber-400 uppercase tracking-widest">
                    {userData?.wasilah || 0} Wasilah
                  </p>
                </div>
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main Game Interface */}
      <main className="flex-1 p-4 max-w-5xl mx-auto w-full flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: ACTIVE QUIZ AREA */}
        <div className="flex-1 flex flex-col justify-between gap-6 min-w-0">
          
          {gameState === 'start' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-12 px-6"
            >
              <div className="relative mb-6">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-indigo-600 rounded-full blur-2xl opacity-20"
                ></motion.div>
                <div className="relative w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-indigo-900 to-slate-950 border-2 border-indigo-500/30 flex items-center justify-center shadow-2xl">
                  <span className="text-5xl leading-none drop-shadow-[0_4px_12px_rgba(234,179,8,0.5)] animate-pulse select-none">💰</span>
                </div>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-white mb-2">Santri Miliarder</h2>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-6">Who Wants to Be a Millionaire Islami</p>
              
              <p className="text-slate-400 text-xs leading-relaxed max-w-md mb-8">
                Jawab 100 tingkatan kuis tajwid, Al-Quran, Fiqih Syafi'i, Aqidah 20, dan Aswaja. Gunakan 3 bantuan krusial dan capai titik aman untuk melipatgandakan <span className="text-amber-400 font-extrabold">Wasilah & XP (Points)</span> Anda!
              </p>

              {/* Checkpoints info */}
              <div className="grid grid-cols-1 gap-3 w-full max-w-md mb-6">
                <div className="bg-slate-900/60 rounded-2xl p-4 border border-indigo-950/50 text-center">
                  <Shield size={20} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-[11px] font-black text-white uppercase tracking-wider">SKEMA HADIAH TITIK AMAN (KELIPATAN 10 LEVEL)</p>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                    Setiap mencapai titik aman kelipatan 10 level (10, 20, ..., 100), hadiah bertambah kelipatan <span className="text-amber-400 font-black">+5 Wasilah & +50 XP</span> secara permanen!
                  </p>
                </div>
              </div>

              {/* Leaderboard Podium (Top 3 Santri Miliarder) */}
              {topUsers && topUsers.length > 0 && (
                <div className="w-full max-w-md bg-slate-900/40 border border-indigo-950/45 rounded-3xl p-5 mb-8 text-center backdrop-blur-sm shadow-xl shadow-indigo-950/10">
                  <div className="flex items-center justify-center gap-1.5 mb-5">
                    <Trophy size={14} className="text-amber-500 animate-pulse" />
                    <p className="text-[10px] font-black tracking-widest text-slate-300 uppercase">Top 3 Santri Miliarder</p>
                  </div>
                  
                  <div className="flex items-end justify-center gap-2 select-none">
                    {/* Rank 2 */}
                    {topUsers[1] && (
                      <div className="flex flex-col items-center w-1/3">
                        <div className="relative mb-2">
                          <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200">
                            <UserAvatar 
                              photoURL={topUsers[1].photoURL}
                              displayName={topUsers[1].displayName}
                              points={topUsers[1].points}
                              size="sm"
                              avatarFrame={topUsers[1].avatarFrame || 'none'}
                              verificationBadge={topUsers[1].verificationBadge || 'none'}
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-400 border-2 border-slate-950 text-[10px] font-black text-slate-950 flex items-center justify-center shadow">
                            2
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-200 truncate w-full max-w-[75px]">
                          {topUsers[1].displayName}
                        </p>
                        <div className="bg-slate-950/40 border border-slate-900/60 rounded-xl px-2 py-0.5 mt-1.5">
                          <p className="text-[8px] font-extrabold text-indigo-400">
                            {(topUsers[1].miliarderXp || 0).toLocaleString()} XP
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Rank 1 */}
                    {topUsers[0] && (
                      <div className="flex flex-col items-center w-[38%] scale-110 -translate-y-1 z-10">
                        <div className="relative mb-2">
                          <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-200 to-orange-400 animate-pulse">
                            <UserAvatar 
                              photoURL={topUsers[0].photoURL}
                              displayName={topUsers[0].displayName}
                              points={topUsers[0].points}
                              size="md"
                              avatarFrame={topUsers[0].avatarFrame || 'none'}
                              verificationBadge={topUsers[0].verificationBadge || 'none'}
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-amber-550 to-yellow-400 border-2 border-slate-950 text-[11px] font-black text-slate-950 flex items-center justify-center shadow">
                            1
                          </div>
                        </div>
                        <p className="text-[11px] font-black text-amber-400 truncate w-full max-w-[85px]">
                          {topUsers[0].displayName}
                        </p>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-2 py-0.5 mt-1.5 shadow-sm">
                          <p className="text-[8px] font-black text-amber-400 flex items-center gap-0.5 justify-center">
                            <Sparkles size={8} className="text-amber-400 fill-amber-400 animate-spin-slow" />
                            {(topUsers[0].miliarderXp || 0).toLocaleString()} XP
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Rank 3 */}
                    {topUsers[2] && (
                      <div className="flex flex-col items-center w-1/3">
                        <div className="relative mb-2">
                          <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-orange-500 to-orange-300">
                            <UserAvatar 
                              photoURL={topUsers[2].photoURL}
                              displayName={topUsers[2].displayName}
                              points={topUsers[2].points}
                              size="sm"
                              avatarFrame={topUsers[2].avatarFrame || 'none'}
                              verificationBadge={topUsers[2].verificationBadge || 'none'}
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-orange-500 border-2 border-slate-950 text-[10px] font-black text-slate-950 flex items-center justify-center shadow">
                            3
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-300 truncate w-full max-w-[75px]">
                          {topUsers[2].displayName}
                        </p>
                        <div className="bg-slate-950/40 border border-slate-900/60 rounded-xl px-2 py-0.5 mt-1.5">
                          <p className="text-[8px] font-extrabold text-indigo-400">
                            {(topUsers[2].miliarderXp || 0).toLocaleString()} XP
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Daily Limit Widget */}
              {user && (
                <div className="w-full max-w-md bg-slate-900/60 rounded-3xl p-5 border border-indigo-950/50 mb-6 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <Zap size={18} className="text-amber-400 animate-bounce" />
                      <span className="text-xs font-black text-white uppercase tracking-wider">Kesempatan Bermain Hari Ini</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold">
                      {Math.max(0, getMaxPlaysAllowed(userData) - (userData?.miliarderLastPlayedDate === new Date().toISOString().split('T')[0] ? (userData?.miliarderPlayCount || 0) : 0))} / {getMaxPlaysAllowed(userData)} Sisa
                    </span>
                  </div>
                  
                  {/* Progress Bar of plays */}
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden mb-4">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(0, Math.min(100, ((getMaxPlaysAllowed(userData) - (userData?.miliarderLastPlayedDate === new Date().toISOString().split('T')[0] ? (userData?.miliarderPlayCount || 0) : 0)) / getMaxPlaysAllowed(userData)) * 100))}%` 
                      }}
                    ></div>
                  </div>

                  <div className="text-left bg-slate-950/45 p-3.5 rounded-2xl border border-indigo-950/30 text-[11px] text-slate-300 leading-relaxed space-y-2">
                    <p className="font-bold text-slate-200">
                      Bonus Limit Bermain dengan Lencana Verifikasi:
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 font-medium">
                      <li className="flex items-center gap-1.5 bg-purple-950/35 px-2 py-1.5 rounded-lg border border-purple-500/15 text-purple-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        Ungu: +3 Main (6x/Hari)
                      </li>
                      <li className="flex items-center gap-1.5 bg-blue-950/35 px-2 py-1.5 rounded-lg border border-blue-500/15 text-blue-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Biru: +5 Main (8x/Hari)
                      </li>
                      <li className="flex items-center gap-1.5 bg-red-950/35 px-2 py-1.5 rounded-lg border border-red-500/15 text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Merah: +7 Main (10x/Hari)
                      </li>
                    </ul>
                    
                    {/* Link to Shop if they want more */}
                    <div className="pt-2.5 border-t border-indigo-950/40 flex justify-between items-center mt-2.5">
                      <span className="text-[10px] text-slate-500">Upgrade sekarang untuk bermain tanpa batas standard!</span>
                      <button 
                        onClick={() => navigate('/premium')}
                        className="text-[10px] font-black text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg transition-colors border border-amber-500/20"
                      >
                        Ke Toko Premium <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {user && (getMaxPlaysAllowed(userData) - (userData?.miliarderLastPlayedDate === new Date().toISOString().split('T')[0] ? (userData?.miliarderPlayCount || 0) : 0)) <= 0 ? (
                <div className="text-center w-full max-w-xs space-y-3 bg-slate-900/60 p-5 rounded-3xl border border-indigo-500/10">
                  <div className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1.5 mb-1">
                    <Sparkles size={14} className="text-amber-400 animate-spin" /> Jatah Bermain Habis
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                    Batas bermain harian Anda sudah habis. Tonton video singkat untuk kesempatan gratis atau berlangganan lencana untuk jatah bermain harian lebih banyak!
                  </p>
                  <div className="flex flex-col gap-2">
                    {adsWatchedToday < maxAdsPerDay ? (
                      <button 
                        onClick={() => setAdConfirmationModal('playQuota')}
                        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-950/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-amber-400/20"
                      >
                        📺 Tonton Iklan (+1 Kesempatan)
                        <span className="text-[9px] font-bold opacity-80 block">({maxAdsPerDay - adsWatchedToday}x tersisa)</span>
                      </button>
                    ) : (
                      <div className="w-full py-3 px-2 bg-slate-950/60 text-slate-500 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center gap-0.5">
                        <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">Batas Iklan Tercapai ({maxAdsPerDay}/{maxAdsPerDay})</span>
                        <span className="text-[8px] text-slate-400 text-center leading-normal">Batas tontonan gratis hari ini telah habis. Silakan kembali besok atau upgrade!</span>
                      </div>
                    )}
                    <button 
                      onClick={() => navigate('/premium')}
                      className="w-full py-3 bg-slate-800/80 hover:bg-slate-850 text-amber-400 hover:text-amber-300 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-amber-500/10"
                    >
                      ⭐ Berlangganan Lencana Premium
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium pt-1">Besok kesempatan bermain Anda akan di-reset otomatis.</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                  <button 
                    onClick={handleStartGame}
                    className="flex-1 py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-black text-base tracking-widest uppercase shadow-xl shadow-indigo-950/60 active:scale-95 transition-all flex items-center justify-center gap-2.5 border border-indigo-400/30 px-6"
                  >
                    <Play size={20} fill="currentColor" /> Mulai Bermain
                  </button>
                  <button 
                    onClick={() => handleShareGame()}
                    className="py-4 px-5 bg-slate-900/90 hover:bg-slate-850 text-indigo-300 hover:text-white rounded-2xl font-black text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 border border-indigo-500/20 shadow-md shrink-0"
                    title="Bagikan Game Ini"
                  >
                    <Share2 size={18} className="text-indigo-400" />
                    <span>Bagikan</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {gameState === 'playing' && currentQuestion && (
            <div className={`flex-1 flex flex-col justify-between transition-all duration-300 ${lifelineContinueModal !== null ? 'filter blur-md pointer-events-none select-none' : ''}`}>
              
              {/* 10-second delay banner on wrong answer or time out */}
              {wrongCountdown !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-950/90 border border-red-500/50 rounded-2xl p-3.5 mb-4 flex items-center justify-between gap-3 shadow-lg shadow-red-950/40"
                >
                  <div className="flex items-center gap-2 text-red-200 font-extrabold text-xs">
                    <AlertCircle size={18} className="text-red-400 shrink-0 animate-bounce" />
                    <span>Jawaban kurang tepat! Pelajari jawaban yang benar di bawah ini.</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="bg-red-500/30 border border-red-400/40 px-2.5 py-1 rounded-xl text-red-100 font-mono font-black text-xs">
                      {wrongCountdown}s
                    </div>
                    <button 
                      onClick={() => {
                        setWrongCountdown(null);
                        handleGameLost();
                      }}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                    >
                      Lanjut &rarr;
                    </button>
                  </div>
                </motion.div>
              )}

              {/* QUESTION CONTAINER */}
              <div className="bg-slate-900/60 rounded-[2rem] p-6 md:p-8 border border-slate-900/80 shadow-xl relative overflow-hidden flex-1 flex flex-col justify-center min-h-[160px] md:min-h-[200px] mb-6">
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
                
                <div className="relative z-10 text-center">
                  <div className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit px-3.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase mb-4 mx-auto">
                    Kategori: {currentQuestion.category}
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold leading-relaxed text-white">
                    {currentQuestion.question}
                  </h3>
                </div>
              </div>

              {/* OPTIONS LIST */}
              <div className="grid grid-cols-1 gap-3.5 mb-6">
                {currentQuestion.options.map((option, idx) => {
                  const letter = ["A", "B", "C", "D"][idx];
                  const isEliminated = eliminatedOptions.includes(idx);
                  const isSelected = selectedOption === idx;
                  
                  if (isEliminated) {
                    return (
                      <div key={idx} className="min-h-[3.5rem] md:min-h-[4rem] rounded-2xl border-2 border-slate-900/30 bg-slate-950/20 opacity-20 pointer-events-none flex items-center px-4">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 text-slate-700 flex items-center justify-center font-black text-xs shrink-0">{letter}</span>
                      </div>
                    );
                  }

                  let buttonStyle = "bg-slate-900/60 border-slate-800/80 text-slate-200 shadow-sm";
                  let badgeStyle = "bg-slate-800 text-slate-300";

                  if (isLocking && isSelected) {
                    buttonStyle = "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-300 text-slate-950 shadow-lg shadow-amber-500/50 animate-pulse font-extrabold";
                    badgeStyle = "bg-amber-300 text-amber-950 font-black";
                  } else if (isAnswered) {
                    if (idx === currentQuestion.correct) {
                      buttonStyle = "bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-950/50 font-extrabold";
                      badgeStyle = "bg-emerald-400 text-emerald-950 font-black";
                    } else if (isSelected) {
                      buttonStyle = "bg-red-600 border-red-400 text-white shadow-lg shadow-red-950/50 font-extrabold";
                      badgeStyle = "bg-red-400 text-red-950 font-black";
                    } else {
                      buttonStyle = "bg-slate-950/40 border-slate-900/50 text-slate-600 pointer-events-none";
                      badgeStyle = "bg-slate-950 text-slate-800";
                    }
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnswerOption(idx)}
                      disabled={isAnswered || isLocking}
                      className={`group w-full min-h-[3.5rem] md:min-h-[4rem] py-3.5 px-4 rounded-2xl border-2 flex items-center justify-between text-left transition-all ${buttonStyle}`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm transition-colors ${badgeStyle}`}>
                          {letter}
                        </span>
                        <span className="leading-relaxed font-bold text-xs sm:text-sm md:text-base break-words flex-1 min-w-0 text-white/95">
                          {option}
                        </span>
                      </div>

                      {isLocking && isSelected && (
                        <span className="px-2.5 py-1 bg-amber-950/60 text-amber-950 rounded-lg text-[10px] font-black uppercase tracking-wider animate-pulse border border-amber-400/50 shrink-0 ml-2">
                          KUNCI JAWABAN...
                        </span>
                      )}
                      {isAnswered && idx === currentQuestion.correct && (
                        <Check size={20} className="text-white shrink-0 ml-2" strokeWidth={3.5} />
                      )}
                      {isAnswered && isSelected && idx !== currentQuestion.correct && (
                        <X size={20} className="text-white shrink-0 ml-2" strokeWidth={3.5} />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* BOTTOM ACTIONS: CASH OUT */}
              <div className="flex justify-between items-center mt-auto border-t border-slate-900/50 pt-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Titik Aman Terakhir: <span className="text-emerald-400">{getSafeHavenLevel(currentLevel) > 0 ? `Level ${getSafeHavenLevel(currentLevel)}` : "Belum Ada"}</span>
                </p>

                <button
                  onClick={handleCashOut}
                  disabled={isAnswered || currentLevel === 1}
                  className={`text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                    isAnswered || currentLevel === 1
                      ? 'border-slate-900 text-slate-700 cursor-not-allowed'
                      : 'bg-amber-950/30 hover:bg-amber-900/30 border-amber-900/30 text-amber-500 hover:text-amber-400 active:scale-95'
                  }`}
                >
                  <Gem size={12} className="fill-current text-cyan-400 animate-pulse" /> Amankan Hadiah (Cash Out)
                </button>
              </div>

            </div>
          )}

          {/* CASHOUT, GAMEOVER, AND VICTORY SCREENS */}
          {(gameState === 'cashout' || gameState === 'gameover' || gameState === 'victory') && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-10 px-6"
            >
              <div className="relative mb-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl ${
                  gameState === 'victory' 
                    ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' 
                    : gameState === 'cashout' 
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                }`}>
                  {gameState === 'victory' ? (
                    <Trophy size={36} className="animate-bounce" />
                  ) : gameState === 'cashout' ? (
                    <Gem size={36} className="fill-current text-cyan-400 animate-pulse" />
                  ) : (
                    <X size={36} />
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-black text-white mb-2">
                {gameState === 'victory' ? 'MABRUK! JUARA!' : gameState === 'cashout' ? 'Berhasil Cash Out!' : 'Sayang Sekali!'}
              </h2>
              
              <p className="text-slate-400 text-xs max-w-sm mb-8 leading-relaxed">
                {gameState === 'victory' 
                  ? 'Luar biasa! Anda menjawab semua 100 tingkat ilmu agama Islam dengan cemerlang dan berhak dinobatkan sebagai Santri Miliarder!' 
                  : gameState === 'cashout'
                  ? 'Keputusan yang sangat bijaksana untuk membawa pulang hasil jerih payah ilmu agama Anda secara aman.'
                  : 'Jawaban kurang tepat atau waktu habis telah mengakhiri permainan. Teruslah belajar untuk mencapai puncak tertinggi!'}
              </p>

              {/* STATS BOX */}
              <div className="bg-slate-900/40 border border-slate-900 w-full max-w-sm p-5 rounded-3xl mb-8">
                <div className="grid grid-cols-3 divide-x divide-slate-800">
                  <div className="px-2 text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Tingkat</p>
                    <p className="text-sm font-extrabold text-white">Lvl {gameState === 'victory' ? 100 : gameState === 'cashout' ? currentLevel - 1 : currentLevel}</p>
                  </div>
                  <div className="px-2 text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Wasilah</p>
                    <p className="text-sm font-extrabold text-amber-400 flex items-center justify-center gap-0.5">
                      <Gem size={12} className="fill-current text-cyan-400" />
                      +{gameState === 'victory' ? getWasilahReward(100) : gameState === 'cashout' ? getWasilahReward(currentLevel - 1) : getWasilahReward(getSafeHavenLevel(currentLevel))}
                    </p>
                  </div>
                  <div className="px-2 text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider mb-1.5">XP (Points)</p>
                    <p className="text-sm font-extrabold text-indigo-400 flex items-center justify-center gap-0.5">
                      <Award size={12} className="text-indigo-400" />
                      +{gameState === 'victory' ? getXpReward(100) : gameState === 'cashout' ? getXpReward(currentLevel - 1) : getXpReward(getSafeHavenLevel(currentLevel))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full max-w-xs">
                {gameState === 'cashout' && (
                  <button 
                    onClick={() => handleShareGame(currentLevel - 1, true)}
                    className="w-full py-3.5 bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 border border-cyan-400/20"
                  >
                    <Share2 size={16} /> Bagikan Hasil Cash Out
                  </button>
                )}

                {gameState === 'gameover' && !hasContinuedThisGame ? (
                  <>
                    <button 
                      onClick={() => setAdConfirmationModal('continueGame')}
                      className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-indigo-400/20"
                    >
                      📺 Lanjutkan Permainan Lvl {currentLevel}
                    </button>
                    <button 
                      onClick={handleStartGame}
                      className="w-full py-3.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all border border-slate-700/50"
                    >
                      Mulai Dari Awal
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleStartGame}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                  >
                    Mainkan Lagi
                  </button>
                )}
                <button 
                  onClick={() => navigate('/game')}
                  className="w-full py-3 text-slate-400 font-bold hover:text-white transition-colors text-xs"
                >
                  Kembali ke Hub Game
                </button>
              </div>
            </motion.div>
          )}

        </div>

        {/* RIGHT COLUMN: PRIZE LADDER (Scrollable block with 100 levels) */}
        <div className={`w-full lg:w-72 shrink-0 bg-slate-900/40 rounded-[2rem] p-5 border border-slate-900 flex-col justify-between max-h-[560px] ${gameState === 'playing' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="overflow-hidden flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800/60 pb-3">
              <Trophy size={16} className="text-amber-500" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Papan Hadiah Miliarder</p>
            </div>

            <div className="flex flex-col gap-1 overflow-y-auto pr-1 flex-1">
              {LEVEL_TIERS.map((tier) => {
                const isCurrent = currentLevel === tier.level && gameState === 'playing';
                const isPassed = currentLevel > tier.level;
                
                let textStyle = "text-slate-500 font-medium";
                let containerStyle = "border-transparent bg-transparent";

                if (isCurrent) {
                  containerStyle = "bg-indigo-950/60 border-indigo-500/40 text-white font-black shadow-lg shadow-indigo-950/40 scale-[1.02]";
                  textStyle = "text-white";
                } else if (isPassed) {
                  textStyle = "text-amber-500/70 line-through font-bold";
                } else if (tier.isSafeHaven) {
                  textStyle = "text-emerald-400 font-extrabold";
                }

                return (
                  <div 
                    id={`tier-row-${tier.level}`}
                    key={tier.level}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-[10px] transition-all ${containerStyle}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-black ${
                        isCurrent 
                          ? 'bg-indigo-500 text-white' 
                          : isPassed 
                          ? 'bg-amber-500/20 text-amber-500' 
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {tier.level}
                      </span>
                      <span className={`${textStyle} font-bold`}>
                        +{tier.wasilahReward} Wasilah
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-[8px] text-slate-400">
                      {tier.isSafeHaven && !isCurrent && !isPassed && (
                        <Shield size={10} className="text-emerald-400 shrink-0" />
                      )}
                      <span className="text-indigo-400 font-bold">+{tier.xpReward} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400">
              <Info size={12} />
              <span>Titik Aman: Kelipatan 10 Level</span>
            </div>
          </div>
        </div>

      </main>

      {/* LIFELINE MODALS / POPUPS */}
      <AnimatePresence>
        {activeLifelineModal === 'expert' && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-indigo-950 rounded-[2.5rem] p-6 max-w-sm w-full shadow-2xl relative"
            >
              <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-4">
                <UserCheck size={28} />
              </div>
              
              <h4 className="text-sm font-black uppercase text-center text-indigo-400 tracking-wider mb-2">Saran Ustadz Ahli</h4>
              <p className="text-slate-300 text-xs italic text-center leading-relaxed mb-6">
                {expertDialogue}
              </p>

              <button 
                onClick={() => setActiveLifelineModal(null)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-colors"
              >
                Kembali Bermain
              </button>
            </motion.div>
          </div>
        )}

        {activeLifelineModal === 'audience' && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-indigo-950 rounded-[2.5rem] p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-4">
                <Users size={28} />
              </div>
              
              <h4 className="text-sm font-black uppercase text-center text-indigo-400 tracking-wider mb-4">Hasil Poling Para Santri</h4>
              
              {/* Poll Chart representation */}
              <div className="flex flex-col gap-3.5 mb-6">
                {audienceVotes.map((pct, idx) => {
                  const letter = ["A", "B", "C", "D"][idx];
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Pilihan {letter}</span>
                        <span className="text-white">{pct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => setActiveLifelineModal(null)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-colors"
              >
                Kembali Bermain
              </button>
            </motion.div>
          </div>
        )}

        {showReminderPopup && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-amber-500/40 rounded-[2.5rem] p-6 max-w-md w-full shadow-2xl relative overflow-hidden my-auto"
            >
              {/* Decorative arabesque / pattern background overlay */}
              <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4 animate-bounce">
                  <Timer size={32} />
                </div>
                
                <h4 className="text-base font-black uppercase text-center text-amber-400 tracking-wider mb-2 leading-snug">
                  ⚠️ Peringatan 15 Detik Terakhir!
                </h4>
                
                <p className="text-slate-300 text-xs text-center leading-relaxed mb-6">
                  Waktu kritis terdeteksi! Gunakan bantuan (Lifeline) di bawah ini untuk menyelamatkan posisi Anda, atau pilih mundur dengan terhormat untuk mengamankan hadiah Anda saat ini.
                </p>

                {/* Grid for 4 Lifelines */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Bantuan 1: Tambah Waktu */}
                  <button
                    disabled={lifelines.addTime}
                    onClick={() => handleLifelineClick('addTime')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                      lifelines.addTime
                        ? 'bg-slate-950/40 border-slate-950 text-slate-600 cursor-not-allowed opacity-50'
                        : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/70 hover:border-indigo-400 active:scale-95'
                    }`}
                  >
                    <Timer size={20} className={lifelines.addTime ? "text-slate-600" : "text-indigo-400"} />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block">Tambah Waktu</span>
                    <span className="text-[8px] text-indigo-400 font-bold block">{lifelines.addTime ? 'Sudah Dipakai' : '+30 Detik (Iklan)'}</span>
                  </button>

                  {/* Bantuan 2: 50:50 */}
                  <button
                    disabled={lifelines.fiftyFifty}
                    onClick={() => handleLifelineClick('fiftyFifty')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                      lifelines.fiftyFifty
                        ? 'bg-slate-950/40 border-slate-950 text-slate-600 cursor-not-allowed opacity-50'
                        : 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-950/70 hover:border-amber-400 active:scale-95'
                    }`}
                  >
                    <Scissors size={20} className={lifelines.fiftyFifty ? "text-slate-600" : "text-amber-400"} />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block">Bantuan 50:50</span>
                    <span className="text-[8px] text-amber-400 font-bold block">{lifelines.fiftyFifty ? 'Sudah Dipakai' : '2 Salah Hilang (Iklan)'}</span>
                  </button>

                  {/* Bantuan 3: Tanya Ustadz */}
                  <button
                    disabled={lifelines.askExpert}
                    onClick={() => handleLifelineClick('askExpert')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                      lifelines.askExpert
                        ? 'bg-slate-950/40 border-slate-950 text-slate-600 cursor-not-allowed opacity-50'
                        : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/70 hover:border-emerald-400 active:scale-95'
                    }`}
                  >
                    <UserCheck size={20} className={lifelines.askExpert ? "text-slate-600" : "text-emerald-400"} />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block">Tanya Ustadz</span>
                    <span className="text-[8px] text-emerald-400 font-bold block">{lifelines.askExpert ? 'Sudah Dipakai' : 'Hubungi Ahli (Iklan)'}</span>
                  </button>

                  {/* Bantuan 4: Vote Audiens */}
                  <button
                    disabled={lifelines.askAudience}
                    onClick={() => handleLifelineClick('askAudience')}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                      lifelines.askAudience
                        ? 'bg-slate-950/40 border-slate-950 text-slate-600 cursor-not-allowed opacity-50'
                        : 'bg-sky-950/40 border-sky-500/30 text-sky-300 hover:bg-sky-950/70 hover:border-sky-400 active:scale-95'
                    }`}
                  >
                    <Users size={20} className={lifelines.askAudience ? "text-slate-600" : "text-sky-400"} />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block">Vote Audiens</span>
                    <span className="text-[8px] text-sky-400 font-bold block">{lifelines.askAudience ? 'Sudah Dipakai' : 'Poling Santri (Iklan)'}</span>
                  </button>
                </div>

                {/* Cashout / Lanjutkan Tanpa Bantuan actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setShowReminderPopup(false);
                      setIsGamePaused(false);
                      handleCashOut();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-amber-950/25 active:scale-98"
                  >
                    💰 Mundur & Amankan Poin
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowReminderPopup(false);
                      setIsGamePaused(false);
                      speakCue("Kembali ke permainan.");
                    }}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-extrabold text-xs uppercase tracking-widest transition-colors active:scale-98"
                  >
                    Lanjutkan Tanpa Bantuan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isShowingAd && (
          <div className="fixed inset-0 bg-slate-950 z-[999] flex flex-col justify-center items-center text-center p-6">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-bold text-white mb-2">Menampilkan Iklan Reward...</p>
            <p className="text-sm text-slate-400">Harap tunggu beberapa detik untuk mendapatkan bantuan gratis Anda.</p>
          </div>
        )}

        {adConfirmationModal === 'playQuota' && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-amber-500/30 rounded-[2.5rem] p-6 max-w-sm w-full shadow-2xl relative overflow-hidden text-center"
            >
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 mx-auto mb-4">
                <Sparkles size={28} className="animate-pulse" />
              </div>
              
              <h4 className="text-base font-black uppercase text-amber-400 tracking-wider mb-2 leading-tight">
                Dapatkan Jatah Bermain
              </h4>
              
              <p className="text-slate-300 text-xs leading-relaxed mb-6">
                Tonton satu video iklan reward sampai selesai untuk mendapatkan 1 jatah bermain Santri Miliarder tambahan secara gratis hari ini.
                <span className="block mt-1.5 text-amber-400 font-bold">Sisa iklan hari ini: {maxAdsPerDay - adsWatchedToday}x</span>
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleWatchAdForQuota}
                  disabled={adsWatchedToday >= maxAdsPerDay}
                  className={`w-full py-3.5 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-98 ${
                    adsWatchedToday >= maxAdsPerDay
                      ? 'bg-slate-850 text-slate-600 border border-slate-800 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700'
                  }`}
                >
                  {adsWatchedToday >= maxAdsPerDay ? 'Batas Harian Tercapai' : '🎬 Setuju & Tonton Iklan'}
                </button>
                
                <button
                  onClick={() => setAdConfirmationModal(null)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl font-extrabold text-xs uppercase tracking-widest transition-colors active:scale-98"
                >
                  Nanti Saja
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {adConfirmationModal === 'continueGame' && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-indigo-500/30 rounded-[2.5rem] p-6 max-w-sm w-full shadow-2xl relative overflow-hidden text-center"
            >
              <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-4">
                <Play size={28} className="text-indigo-400 ml-1" fill="currentColor" />
              </div>
              
              <h4 className="text-base font-black uppercase text-indigo-400 tracking-wider mb-2 leading-tight">
                Lanjutkan Permainan?
              </h4>
              
              <p className="text-slate-300 text-xs leading-relaxed mb-6">
                Tonton video iklan reward untuk melanjutkan perjuangan dakwah ilmiah Anda di tingkat ke-<strong>{currentLevel}</strong> tanpa mengulang dari awal.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleWatchAdForContinue}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-98"
                >
                  🎬 Setuju & Tonton Iklan
                </button>
                
                <button
                  onClick={() => setAdConfirmationModal(null)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl font-extrabold text-xs uppercase tracking-widest transition-colors active:scale-98"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {adConfirmationModal && adConfirmationModal.startsWith('lifeline_') && (() => {
          const type = adConfirmationModal.replace('lifeline_', '') as 'addTime' | 'fiftyFifty' | 'askExpert' | 'askAudience';
          
          const config = {
            addTime: {
              title: "Tambah Waktu",
              desc: "Tonton video singkat untuk menambahkan +30 detik agar Anda memiliki cukup waktu menjawab pertanyaan penting ini.",
              icon: <Timer size={28} className="text-indigo-400" />,
              borderColor: "border-indigo-500/30",
              textColor: "text-indigo-400",
              gradient: "from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600",
              bgColor: "bg-indigo-500/10 border-indigo-500/20"
            },
            fiftyFifty: {
              title: "Bantuan 50:50",
              desc: "Tonton video singkat untuk mengeliminasi dua pilihan salah agar tersisa dua pilihan jawaban saja.",
              icon: <Scissors size={28} className="text-amber-400" />,
              borderColor: "border-amber-500/30",
              textColor: "text-amber-400",
              gradient: "from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700",
              bgColor: "bg-amber-500/10 border-amber-500/20"
            },
            askExpert: {
              title: "Tanya Ustadz",
              desc: "Tonton video singkat untuk mendapatkan bimbingan/saran dari Ustadz terpercaya mengenai jawaban pertanyaan ini.",
              icon: <UserCheck size={28} className="text-emerald-400" />,
              borderColor: "border-emerald-500/30",
              textColor: "text-emerald-400",
              gradient: "from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600",
              bgColor: "bg-emerald-500/10 border-emerald-500/20"
            },
            askAudience: {
              title: "Tanya Santri (Poling)",
              desc: "Tonton video singkat untuk melihat hasil poling (suara terbanyak) dari komunitas santri mengenai jawaban kuis ini.",
              icon: <Users size={28} className="text-sky-400" />,
              borderColor: "border-sky-500/30",
              textColor: "text-sky-400",
              gradient: "from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600",
              bgColor: "bg-sky-500/10 border-sky-500/20"
            }
          }[type];

          return (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`bg-slate-900 border ${config.borderColor} rounded-[2.5rem] p-6 max-w-sm w-full shadow-2xl relative overflow-hidden text-center`}
              >
                <div className={`w-14 h-14 ${config.bgColor} border rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse`}>
                  {config.icon}
                </div>
                
                <h4 className={`text-base font-black uppercase ${config.textColor} tracking-wider mb-2 leading-tight`}>
                  Gunakan {config.title}?
                </h4>
                
                <p className="text-slate-300 text-xs leading-relaxed mb-6">
                  {config.desc}
                </p>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => {
                      setAdConfirmationModal(null);
                      triggerLifelineWithAd(type);
                    }}
                    className={`w-full py-3.5 bg-gradient-to-r ${config.gradient} text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-98`}
                  >
                    🎬 Setuju & Tonton Iklan
                  </button>
                  
                  <button
                    onClick={handleCancelLifelineAd}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl font-extrabold text-xs uppercase tracking-widest transition-colors active:scale-98"
                  >
                    Nanti Saja
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}

        {lifelineContinueModal && (() => {
          const config = {
            addTime: {
              title: "Bantuan +30s Berhasil!",
              desc: "Sisa waktu Anda telah bertambah +30 detik. Klik Lanjutkan untuk kembali menjawab.",
              icon: <Timer size={32} className="text-indigo-400" />,
              borderColor: "border-indigo-500/40",
              bgColor: "bg-indigo-500/10 border-indigo-500/20",
            },
            fiftyFifty: {
              title: "Bantuan 50:50 Berhasil!",
              desc: "Dua pilihan jawaban salah telah dieliminasi dari layar. Klik Lanjutkan untuk memilih jawaban.",
              icon: <Scissors size={32} className="text-amber-400" />,
              borderColor: "border-amber-500/40",
              bgColor: "bg-amber-500/10 border-amber-500/20",
            },
            askExpert: {
              title: "Saran Ustadz Diterima!",
              desc: "Ustadz telah memberikan bimbingannya untuk pertanyaan ini:",
              icon: <UserCheck size={32} className="text-emerald-400" />,
              borderColor: "border-emerald-500/40",
              bgColor: "bg-emerald-500/10 border-emerald-500/20",
            },
            askAudience: {
              title: "Poling Santri Diterima!",
              desc: "Berikut adalah hasil poling suara dari komunitas santri:",
              icon: <Users size={32} className="text-sky-400" />,
              borderColor: "border-sky-500/40",
              bgColor: "bg-sky-500/10 border-sky-500/20",
            }
          }[lifelineContinueModal];

          return (
            <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[250]">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`bg-slate-900 border ${config.borderColor} rounded-[2.5rem] p-6 max-w-sm w-full shadow-2xl relative overflow-hidden text-center`}
              >
                <div className={`w-16 h-16 ${config.bgColor} border rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce`}>
                  {config.icon}
                </div>
                
                <h4 className="text-base font-black uppercase text-white tracking-wider mb-2 leading-tight">
                  {config.title}
                </h4>
                
                <p className="text-slate-300 text-xs leading-relaxed mb-4">
                  {config.desc}
                </p>

                {lifelineContinueModal === 'askExpert' && expertDialogue && (
                  <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-3.5 mb-5 text-left text-xs text-emerald-200 italic leading-relaxed font-serif">
                    {expertDialogue}
                  </div>
                )}

                {lifelineContinueModal === 'askAudience' && (
                  <div className="flex flex-col gap-2.5 mb-5 text-left bg-slate-950/90 border border-sky-500/30 p-3.5 rounded-2xl">
                    {audienceVotes.map((pct, idx) => {
                      const letter = ["A", "B", "C", "D"][idx];
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400">
                            <span>Pilihan {letter}</span>
                            <span className="text-sky-300 font-extrabold">{pct}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${pct}%` }} 
                              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={() => {
                    setLifelineContinueModal(null);
                    setIsGamePaused(false);
                    speakCue("Lanjut bermain.");
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-indigo-600 to-indigo-700 hover:from-emerald-500 hover:to-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-98 shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 border border-indigo-400/20"
                >
                  <Play size={16} fill="currentColor" /> Lanjutkan
                </button>
              </motion.div>
            </div>
          );
        })()}

        {showQuitConfirmModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-rose-500/30 rounded-[2.5rem] p-6 max-w-sm w-full shadow-2xl relative overflow-hidden text-center"
            >
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400 mx-auto mb-4">
                <AlertCircle size={28} className="animate-pulse text-rose-500" />
              </div>
              
              <h4 className="text-base font-black uppercase text-rose-400 tracking-wider mb-2 leading-tight">
                Peringatan: Menyerah & Keluar?
              </h4>
              
              <p className="text-slate-300 text-xs leading-relaxed mb-6">
                Mengundurkan diri saat permainan berlangsung akan menganggap Anda KALAH dan mengakhiri sesi permainan saat ini. Apakah Anda yakin ingin keluar?
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setShowQuitConfirmModal(false);
                    handleGameLost();
                    navigate(pendingQuitPath || '/game');
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-98"
                >
                  Ya, Menyerah & Keluar
                </button>
                
                <button
                  onClick={() => setShowQuitConfirmModal(false)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl font-extrabold text-xs uppercase tracking-widest transition-colors active:scale-98"
                >
                  Lanjut Bermain
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showQuotaModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[200] overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-amber-500/40 rounded-[2.5rem] p-6 max-w-md w-full shadow-2xl relative overflow-hidden text-center my-auto"
            >
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 mx-auto mb-4">
                <Sparkles size={32} className="animate-bounce" />
              </div>
              
              <h4 className="text-lg font-black uppercase text-amber-400 tracking-wider mb-2 leading-tight">
                Jatah Bermain Habis!
              </h4>
              
              <p className="text-slate-300 text-xs leading-relaxed mb-5">
                Jatah bermain harian Anda telah habis ({getMaxPlaysAllowed(userData)}/{getMaxPlaysAllowed(userData)}x hari ini). Tonton iklan untuk kesempatan gratis atau pilih Lencana Verifikasi untuk jatah harian lebih banyak!
              </p>

              <div className="space-y-4 mb-6">
                {/* Watch Ad Option */}
                {adsWatchedToday < maxAdsPerDay && (
                  <button
                    onClick={() => {
                      setShowQuotaModal(false);
                      setAdConfirmationModal('playQuota');
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-950/30 active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-400/20"
                  >
                    <span>📺 Tonton Iklan (+1 Kesempatan Gratis)</span>
                    <span className="text-[9px] font-bold opacity-80">({maxAdsPerDay - adsWatchedToday}x tersisa)</span>
                  </button>
                )}

                {/* Verification Badges Selection Section */}
                <div className="pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] font-extrabold text-indigo-300 uppercase tracking-wider block mb-3">
                    Pilihan Lencana Verifikasi:
                  </span>
                  
                  <div className="grid grid-cols-1 gap-2.5 text-left">
                    {/* Lencana Ungu */}
                    <button
                      onClick={() => {
                        setShowQuotaModal(false);
                        navigate('/premium');
                        showToast('Pilih Lencana Ungu di Toko Premium untuk +3 Jatah Bermain Harian!', 'info');
                      }}
                      className="p-3 bg-purple-950/40 border border-purple-500/30 hover:border-purple-400/60 rounded-2xl flex items-center justify-between group transition-all active:scale-98"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-500/20 border border-purple-500/40 rounded-xl flex items-center justify-center text-purple-400 shrink-0">
                          <Award size={20} />
                        </div>
                        <div>
                          <div className="text-xs font-black text-purple-200">Lencana Ungu</div>
                          <div className="text-[10px] font-semibold text-purple-400/90">+3 Jatah Bermain Harian (Total 6x)</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-[9px] font-black uppercase tracking-wider border border-purple-400/30 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                        Pilih &rarr;
                      </span>
                    </button>

                    {/* Lencana Biru */}
                    <button
                      onClick={() => {
                        setShowQuotaModal(false);
                        navigate('/premium');
                        showToast('Pilih Lencana Biru di Toko Premium untuk +5 Jatah Bermain Harian!', 'info');
                      }}
                      className="p-3 bg-blue-950/40 border border-blue-500/30 hover:border-blue-400/60 rounded-2xl flex items-center justify-between group transition-all active:scale-98"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-500/20 border border-blue-500/40 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                          <Shield size={20} />
                        </div>
                        <div>
                          <div className="text-xs font-black text-blue-200">Lencana Biru</div>
                          <div className="text-[10px] font-semibold text-blue-400/90">+5 Jatah Bermain Harian (Total 8x)</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-[9px] font-black uppercase tracking-wider border border-blue-400/30 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        Pilih &rarr;
                      </span>
                    </button>

                    {/* Lencana Merah */}
                    <button
                      onClick={() => {
                        setShowQuotaModal(false);
                        navigate('/premium');
                        showToast('Pilih Lencana Merah di Toko Premium untuk +7 Jatah Bermain Harian!', 'info');
                      }}
                      className="p-3 bg-red-950/40 border border-red-500/30 hover:border-red-400/60 rounded-2xl flex items-center justify-between group transition-all active:scale-98"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center justify-center text-red-400 shrink-0">
                          <Gem size={20} />
                        </div>
                        <div>
                          <div className="text-xs font-black text-red-200">Lencana Merah</div>
                          <div className="text-[10px] font-semibold text-red-400/90">+7 Jatah Bermain Harian (Total 10x)</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-red-500/20 text-red-300 rounded-lg text-[9px] font-black uppercase tracking-wider border border-red-400/30 group-hover:bg-red-500 group-hover:text-white transition-colors">
                        Pilih &rarr;
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowQuotaModal(false)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-extrabold text-xs uppercase tracking-widest transition-colors active:scale-98 border border-slate-700/60"
              >
                Tutup
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default IslamicGameScreen;
