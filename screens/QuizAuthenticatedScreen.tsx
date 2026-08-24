
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, Trophy, CheckCircle, XCircle, Loader2, AlertCircle, Lightbulb, Check, X, Coins, User, Star, Target, LogOut, Timer, Gift, ShoppingBag, Crown, BarChart, Mic, BookOpen, CalendarCheck, Sparkles, LogIn, Video, Gem, Heart, BadgeCheck, Users, Swords, Share2, Eye, Clock, PlusCircle, Play, Pause, Volume2, RotateCw, Radio, Headphones } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { MultiplayerQuizView } from '../components/MultiplayerQuizView';
import { 
  playCountdownTick, 
  playCountdownHurry, 
  playSoundCorrect, 
  playSoundIncorrect, 
  playSoundWinner,
  stopAllQuizLoops,
  speakAndroidText
} from '../utils/quizSound';
import { QuizQuestion } from '../types';
import { DEFAULT_QUIZ_BANK } from '../constants/defaultQuizBank';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext'; 
import { useHistory } from '../contexts/HistoryContext'; 
import { subscribeToQuizzes, QuizData, subscribeToRewards, requestRedemption, RewardData, subscribeToUserData, incrementUserGameStats, updateUserData, subscribeToLeaderboard, handleDailyCheckIn, handleAdReward } from '../services/firebase'; 
import { subscribeToPublicQuizRooms, QuizRoom, processScheduledRoomLogic } from '../services/multiplayerQuizService';
import ConfirmationModal from '../components/ConfirmationModal'; 
import { v4 as uuidv4 } from 'uuid'; 

const TOPICS = [
  { id: 'sambung_ayat', label: 'Sambung Ayat (Audio)', color: 'emerald' },
  { id: 'tebak_ayat', label: 'Tebak Ayat & Surat (Audio)', color: 'teal' },
  { id: 'alquran', label: 'Al-Quran', color: 'emerald' },
  { id: 'tafsir', label: 'Tafsir Al-Quran', color: 'emerald' },
  { id: 'hadits', label: 'Hadits', color: 'blue' },
  { id: 'akidah', label: 'Akidah (Tauhid)', color: 'indigo' },
  { id: 'fiqh', label: 'Fiqih', color: 'rose' },
  { id: 'ushul_fiqh', label: 'Ushul Fiqih', color: 'violet' },
  { id: 'nahwu', label: 'Nahwu & Shorof', color: 'teal' },
  { id: 'mantiq', label: 'Mantiq (Logika)', color: 'purple' },
  { id: 'tasawuf', label: 'Akhlak & Tasawuf', color: 'rose' },
  { id: 'tarikh', label: 'Tarikh (Sejarah)', color: 'amber' },
  { id: 'sholawat', label: 'Kumpulan Sholawat', color: 'pink' },
  { id: 'maulid', label: 'Kitab Maulid', color: 'orange' },
  { id: 'ratib', label: 'Kitab Ratib', color: 'cyan' },
  { id: 'tajwid', label: 'Ilmu Tajwid', color: 'green' }
];

interface UserProfile { name: string; totalPoints: number; wasilah: number; level: string; correctAnswers: number; rank: number | string; photoURL: string; lastCheckIn: string | null; avatarFrame?: string; }

const TIME_LIMIT = 60;

const LEVEL_SYSTEM = [
  { name: 'Ibtidaiyah', min: 0, max: 99999, color: 'text-slate-500', bg: 'bg-slate-100' },
  { name: 'Tsanawiyah', min: 100000, max: 299999, color: 'text-green-600', bg: 'bg-green-100' },
  { name: 'Aliyah', min: 300000, max: 699999, color: 'text-blue-600', bg: 'bg-blue-100' },
  { name: 'Istiqomah', min: 700000, max: 999999, color: 'text-amber-600', bg: 'bg-amber-100' },
  { name: 'Sultan', min: 1000000, max: Infinity, color: 'text-purple-600', bg: 'bg-purple-100' }
];

const getLevelInfo = (points: number) => {
  return LEVEL_SYSTEM.find(l => points >= l.min && points <= l.max) || LEVEL_SYSTEM[LEVEL_SYSTEM.length - 1];
};

const getTopicCardStyle = (id: string) => {
  switch (id) {
    case 'sambung_ayat':
      return {
        cardBg: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-emerald-900/60 border-emerald-300 dark:border-emerald-700/80',
        iconBg: 'bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none',
        textColor: 'text-emerald-950 dark:text-emerald-100',
        subTextColor: 'text-emerald-700 dark:text-emerald-300',
        badgeBg: 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200',
        icon: '🎧'
      };
    case 'tebak_ayat':
      return {
        cardBg: 'bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100 dark:from-teal-950/70 dark:via-cyan-950/50 dark:to-teal-900/60 border-teal-300 dark:border-teal-700/80',
        iconBg: 'bg-teal-600 text-white shadow-teal-200 dark:shadow-none',
        textColor: 'text-teal-950 dark:text-teal-100',
        subTextColor: 'text-teal-700 dark:text-teal-300',
        badgeBg: 'bg-teal-200/80 text-teal-800 dark:bg-teal-900/70 dark:text-teal-200',
        icon: '📻'
      };
    case 'RANDOM':
    case 'random':
      return {
        cardBg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/70 dark:via-orange-950/50 dark:to-amber-900/60 border-amber-300 dark:border-amber-700/80',
        iconBg: 'bg-amber-500 text-white shadow-amber-200 dark:shadow-none',
        textColor: 'text-amber-950 dark:text-amber-100',
        subTextColor: 'text-amber-800 dark:text-amber-300',
        badgeBg: 'bg-amber-200/80 text-amber-900 dark:bg-amber-900/70 dark:text-amber-200',
        icon: '🎲'
      };
    case 'alquran':
      return {
        cardBg: 'bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-emerald-950/70 dark:via-green-950/50 dark:to-emerald-900/60 border-emerald-200 dark:border-emerald-800/80',
        iconBg: 'bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none',
        textColor: 'text-emerald-950 dark:text-emerald-100',
        subTextColor: 'text-emerald-700 dark:text-emerald-300',
        badgeBg: 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200',
        icon: '📖'
      };
    case 'tafsir':
      return {
        cardBg: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-emerald-900/60 border-emerald-200 dark:border-emerald-800/80',
        iconBg: 'bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none',
        textColor: 'text-emerald-950 dark:text-emerald-100',
        subTextColor: 'text-emerald-700 dark:text-emerald-300',
        badgeBg: 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200',
        icon: '📖'
      };
    case 'hadits':
      return {
        cardBg: 'bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 dark:from-blue-950/70 dark:via-sky-950/50 dark:to-indigo-900/60 border-blue-200 dark:border-blue-800/80',
        iconBg: 'bg-blue-600 text-white shadow-blue-200 dark:shadow-none',
        textColor: 'text-blue-950 dark:text-blue-100',
        subTextColor: 'text-blue-700 dark:text-blue-300',
        badgeBg: 'bg-blue-200/80 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200',
        icon: '📜'
      };
    case 'akidah':
      return {
        cardBg: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 dark:from-indigo-950/70 dark:via-purple-950/50 dark:to-indigo-900/60 border-indigo-200 dark:border-indigo-800/80',
        iconBg: 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none',
        textColor: 'text-indigo-950 dark:text-indigo-100',
        subTextColor: 'text-indigo-700 dark:text-indigo-300',
        badgeBg: 'bg-indigo-200/80 text-indigo-800 dark:bg-indigo-900/70 dark:text-indigo-200',
        icon: '☪️'
      };
    case 'fiqh':
      return {
        cardBg: 'bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 dark:from-rose-950/70 dark:via-pink-950/50 dark:to-rose-900/60 border-rose-200 dark:border-rose-800/80',
        iconBg: 'bg-rose-600 text-white shadow-rose-200 dark:shadow-none',
        textColor: 'text-rose-950 dark:text-rose-100',
        subTextColor: 'text-rose-700 dark:text-rose-300',
        badgeBg: 'bg-rose-200/80 text-rose-800 dark:bg-rose-900/70 dark:text-rose-200',
        icon: '🕌'
      };
    case 'ushul_fiqh':
      return {
        cardBg: 'bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 dark:from-violet-950/70 dark:via-purple-950/50 dark:to-violet-900/60 border-violet-200 dark:border-violet-800/80',
        iconBg: 'bg-violet-600 text-white shadow-violet-200 dark:shadow-none',
        textColor: 'text-violet-950 dark:text-violet-100',
        subTextColor: 'text-violet-700 dark:text-violet-300',
        badgeBg: 'bg-violet-200/80 text-violet-800 dark:bg-violet-900/70 dark:text-violet-200',
        icon: '⚖️'
      };
    case 'nahwu':
      return {
        cardBg: 'bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100 dark:from-teal-950/70 dark:via-emerald-950/50 dark:to-teal-900/60 border-teal-200 dark:border-teal-800/80',
        iconBg: 'bg-teal-600 text-white shadow-teal-200 dark:shadow-none',
        textColor: 'text-teal-950 dark:text-teal-100',
        subTextColor: 'text-teal-700 dark:text-teal-300',
        badgeBg: 'bg-teal-200/80 text-teal-800 dark:bg-teal-900/70 dark:text-teal-200',
        icon: '✒️'
      };
    case 'mantiq':
      return {
        cardBg: 'bg-gradient-to-br from-purple-50 via-fuchsia-50 to-purple-100 dark:from-purple-950/70 dark:via-fuchsia-950/50 dark:to-purple-900/60 border-purple-200 dark:border-purple-800/80',
        iconBg: 'bg-purple-600 text-white shadow-purple-200 dark:shadow-none',
        textColor: 'text-purple-950 dark:text-purple-100',
        subTextColor: 'text-purple-700 dark:text-purple-300',
        badgeBg: 'bg-purple-200/80 text-purple-800 dark:bg-purple-900/70 dark:text-purple-200',
        icon: '🧠'
      };
    case 'tasawuf':
      return {
        cardBg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/70 dark:via-orange-950/50 dark:to-amber-900/60 border-amber-200 dark:border-amber-800/80',
        iconBg: 'bg-amber-600 text-white shadow-amber-200 dark:shadow-none',
        textColor: 'text-amber-950 dark:text-amber-100',
        subTextColor: 'text-amber-700 dark:text-amber-300',
        badgeBg: 'bg-amber-200/80 text-amber-800 dark:bg-amber-900/70 dark:text-amber-200',
        icon: '📿'
      };
    case 'tarikh':
      return {
        cardBg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950/70 dark:via-amber-950/50 dark:to-orange-900/60 border-orange-200 dark:border-orange-800/80',
        iconBg: 'bg-orange-600 text-white shadow-orange-200 dark:shadow-none',
        textColor: 'text-orange-950 dark:text-orange-100',
        subTextColor: 'text-orange-700 dark:text-orange-300',
        badgeBg: 'bg-orange-200/80 text-orange-800 dark:bg-orange-900/70 dark:text-orange-200',
        icon: '🏛️'
      };
    case 'sholawat':
      return {
        cardBg: 'bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 dark:from-pink-950/70 dark:via-rose-950/50 dark:to-pink-900/60 border-pink-200 dark:border-pink-800/80',
        iconBg: 'bg-pink-600 text-white shadow-pink-200 dark:shadow-none',
        textColor: 'text-pink-950 dark:text-pink-100',
        subTextColor: 'text-pink-700 dark:text-pink-300',
        badgeBg: 'bg-pink-200/80 text-pink-800 dark:bg-pink-900/70 dark:text-pink-200',
        icon: '✨'
      };
    case 'maulid':
      return {
        cardBg: 'bg-gradient-to-br from-fuchsia-50 via-pink-50 to-fuchsia-100 dark:from-fuchsia-950/70 dark:via-pink-950/50 dark:to-fuchsia-900/60 border-fuchsia-200 dark:border-fuchsia-800/80',
        iconBg: 'bg-fuchsia-600 text-white shadow-fuchsia-200 dark:shadow-none',
        textColor: 'text-fuchsia-950 dark:text-fuchsia-100',
        subTextColor: 'text-fuchsia-700 dark:text-fuchsia-300',
        badgeBg: 'bg-fuchsia-200/80 text-fuchsia-800 dark:bg-fuchsia-900/70 dark:text-fuchsia-200',
        icon: '🌸'
      };
    case 'ratib':
      return {
        cardBg: 'bg-gradient-to-br from-cyan-50 via-sky-50 to-cyan-100 dark:from-cyan-950/70 dark:via-sky-950/50 dark:to-cyan-900/60 border-cyan-200 dark:border-cyan-800/80',
        iconBg: 'bg-cyan-600 text-white shadow-cyan-200 dark:shadow-none',
        textColor: 'text-cyan-950 dark:text-cyan-100',
        subTextColor: 'text-cyan-700 dark:text-cyan-300',
        badgeBg: 'bg-cyan-200/80 text-cyan-800 dark:bg-cyan-900/70 dark:text-cyan-200',
        icon: '💎'
      };
    case 'tajwid':
      return {
        cardBg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/70 dark:via-emerald-950/50 dark:to-green-900/60 border-green-200 dark:border-green-800/80',
        iconBg: 'bg-green-600 text-white shadow-green-200 dark:shadow-none',
        textColor: 'text-green-950 dark:text-green-100',
        subTextColor: 'text-green-700 dark:text-green-300',
        badgeBg: 'bg-green-200/80 text-green-800 dark:bg-green-900/70 dark:text-green-200',
        icon: '🎙️'
      };
    default:
      return {
        cardBg: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-800',
        iconBg: 'bg-purple-600 text-white shadow-purple-200 dark:shadow-none',
        textColor: 'text-slate-900 dark:text-slate-100',
        subTextColor: 'text-slate-600 dark:text-slate-400',
        badgeBg: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
        icon: '📚'
      };
  }
};

const QuizAuthenticatedScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData } = useAuth();
  const { showToast } = useToast(); 
  const { addToHistory } = useHistory(); 
  
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'RESULT'>('MENU');
  const [quizMode, setQuizMode] = useState<'SINGLE' | 'MULTIPLAYER'>('SINGLE');
  const [selectedTopic, setSelectedTopic] = useState<{id: string, label: string} | null>(null);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({ 
      name: user?.displayName || 'Santri', 
      totalPoints: 0, 
      wasilah: 0,
      level: 'Ibtidaiyah', 
      correctAnswers: 0, 
      rank: '-',
      photoURL: user?.photoURL || '',
      lastCheckIn: null
  });

  const [dbQuestions, setDbQuestions] = useState<QuizData[]>([]);
  const [rewards, setRewards] = useState<RewardData[]>([]);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [publicRooms, setPublicRooms] = useState<QuizRoom[]>([]);
  const [selectedRoomCode, setSelectedRoomCode] = useState<string | null>(null);
  const [selectedRoomAction, setSelectedRoomAction] = useState<'join' | 'spectate' | 'create'>('join');
  const [isMultiplayerMatchActive, setIsMultiplayerMatchActive] = useState(false);

  // Audio Player State for Sambung & Tebak Ayat
  const [isQuestionAudioPlaying, setIsQuestionAudioPlaying] = useState(false);
  const [isQuestionAudioLoading, setIsQuestionAudioLoading] = useState(false);
  const questionAudioRef = useRef<HTMLAudioElement | null>(null);

  const [currentMCQuestion, setCurrentMCQuestion] = useState<QuizQuestion | null>(null);
  const [selectedMCOption, setSelectedMCOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [answerPopup, setAnswerPopup] = useState<{ show: boolean; isCorrect: boolean; points?: number } | null>(null);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);

  const timerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [lastRewardedMilestone, setLastRewardedMilestone] = useState(0);
  const [showRewardAdModal, setShowRewardAdModal] = useState(false);

  // Absensi states
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isAdProcessing, setIsAdProcessing] = useState(false);
  const [showAdOfferModal, setShowAdOfferModal] = useState(false);

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
      setIsQuestionAudioLoading(false);
    };

    audio.onerror = () => {
      setIsQuestionAudioPlaying(false);
      setIsQuestionAudioLoading(false);
      showToast("Gagal memutar audio ayat", "error");
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

  useEffect(() => {
    if (gameState === 'PLAYING' && currentMCQuestion?.audioUrl && !isAnswerRevealed) {
      toggleQuestionAudio(currentMCQuestion.audioUrl);
    } else {
      stopQuestionAudio();
    }
  }, [currentMCQuestion, gameState, isAnswerRevealed]);

  useEffect(() => {
    if (location.state?.initialRoomCode) {
      setSelectedRoomCode(location.state.initialRoomCode);
      setSelectedRoomAction(location.state.initialAction || 'join');
      setQuizMode('MULTIPLAYER');
      // Clear state so it doesn't re-trigger on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    return () => {
      stopAllQuizLoops();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToPublicQuizRooms(
      (rooms) => {
        setPublicRooms(rooms);
        rooms.forEach((r) => {
          if (r.status === 'waiting') {
            processScheduledRoomLogic(r, user?.uid).catch(console.error);
          }
        });
      },
      (err) => {
        console.error('Error fetching public rooms in quiz screen:', err);
      }
    );

    // Periodic 5-second interval to check room timers
    const timer = setInterval(() => {
      setPublicRooms((prevRooms) => {
        prevRooms.forEach((r) => {
          if (r.status === 'waiting') {
            processScheduledRoomLogic(r, user?.uid).catch(console.error);
          }
        });
        return prevRooms;
      });
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [user?.uid]);
  
  // AdMob Interstitial handler (Native-only, no custom React UI)
  const triggerInterstitial = (action: string, callback?: () => void) => {
    if (window.AndroidNativeInterface?.showInterstitialAd) {
      try {
        console.log(`[AdMob] Triggering native interstitial ad for: ${action}`);
        window.AndroidNativeInterface.showInterstitialAd();
      } catch (err) {
        console.error("Gagal memanggil native AdMob Interstitial:", err);
      }
    }
    if (callback) callback();
  };

  const [feedbackModal, setFeedbackModal] = useState<'TIMEOUT' | null>(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState<{show: boolean, newLevel: string} | null>(null);
  const [showLimitReachedModal, setShowLimitReachedModal] = useState(false);
  const [isExtraChancePending, setIsExtraChancePending] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean; title: string; message: string; action: () => void}>({ isOpen: false, title: '', message: '', action: () => {} });

  // Check if daily ad extra chance has been used today
  const hasUsedDailyAdExtraToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (userData?.lastAdExtraDate !== todayStr) return false;
    return !!userData?.dailyAdExtraUsed;
  };

  const grantExtraChanceReward = async () => {
    if (!user) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMistakes = getTodayMistakesCount();
    const newMistakeCount = Math.max(0, currentMistakes - 1);

    try {
      await updateUserData(user.uid, {
        dailyMistakesCount: newMistakeCount,
        lastMistakeDate: todayStr,
        dailyAdExtraUsed: true,
        lastAdExtraDate: todayStr
      });
      showToast("Alhamdulillah! +1x Kesempatan salah ekstra berhasil ditambahkan!", "success");
      setShowLimitReachedModal(false);
    } catch (e) {
      console.error("Gagal menambah kesempatan ekstra", e);
      showToast("Gagal memperbarui kesempatan. Silakan coba lagi.", "error");
    } finally {
      setIsExtraChancePending(false);
      setIsAdProcessing(false);
    }
  };

  const handleWatchAdForExtraChance = () => {
    if (hasUsedDailyAdExtraToday()) {
      showToast("Anda telah menggunakan 1x jatah iklan ekstra untuk hari ini.", "info");
      return;
    }
    setIsAdProcessing(true);
    setIsExtraChancePending(true);

    if (window.AndroidNativeInterface?.showRewardedAd) {
      showToast("Menampilkan iklan untuk bonus kesempatan...", "info");
      window.AndroidNativeInterface.showRewardedAd();
    } else if (window.AndroidNativeInterface?.showInterstitialAd) {
      window.AndroidNativeInterface.showInterstitialAd();
      grantExtraChanceReward();
    } else {
      setTimeout(() => {
        grantExtraChanceReward();
      }, 1000);
    }
  };

  // Verification Badge extra mistakes & XP bonus helpers
  const getMaxMistakesAllowed = () => {
    const base = 5;
    const badge = userData?.verificationBadge;
    if (!badge || badge === 'none') return base;
    if (badge === 'badge_purple' || badge === 'badge_purple_star') return base + 3;
    if (badge === 'badge_blue') return base + 5;
    if (badge === 'badge_red') return base + 8;
    if (badge === 'badge_green') return base + 10;
    if (badge === 'badge_gold') return base + 15;
    return base;
  };

  const getTodayMistakesCount = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (userData?.lastMistakeDate !== todayStr) return 0;
    return userData?.dailyMistakesCount || 0;
  };

  const getBadgeXPBonus = () => {
    const badge = userData?.verificationBadge;
    if (!badge || badge === 'none') return 0;
    if (badge === 'badge_purple' || badge === 'badge_purple_star') return 5;
    if (badge === 'badge_blue') return 10;
    if (badge === 'badge_red') return 15;
    if (badge === 'badge_green') return 20;
    if (badge === 'badge_gold') return 30;
    return 0;
  };

  const recordMistake = async () => {
    if (!user) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMistakes = getTodayMistakesCount();
    const newMistakes = currentMistakes + 1;
    const maxAllowed = getMaxMistakesAllowed();

    try {
      await updateUserData(user.uid, {
        dailyMistakesCount: newMistakes,
        lastMistakeDate: todayStr
      });
    } catch (e) {
      console.error("Gagal menyimpan kesalahan harian", e);
    }

    if (newMistakes >= maxAllowed) {
      setShowLimitReachedModal(true);
      speakAndroidText("Kesempatan bermain Anda hari ini sudah habis. Silakan tingkatkan lencana Anda untuk mendapat jatah tambahan salah.");
    }
  };

  // --- AUDIO SYSTEM ---
  const playSound = (type: 'TICK' | 'CORRECT' | 'WRONG' | 'TIMEOUT') => {
    try {
      if (type === 'TICK') {
        if (timeLeft <= 10) {
          playCountdownHurry();
        } else {
          playCountdownTick();
        }
      } else if (type === 'CORRECT') {
        playSoundCorrect();
      } else if (type === 'WRONG') {
        playSoundIncorrect();
      } else if (type === 'TIMEOUT') {
        playSoundIncorrect();
      }
    } catch (e) {
      console.warn("Audio playback failed", e);
    }
  };

  useEffect(() => { 
      const unsubscribeQuizzes = subscribeToQuizzes((data) => { setDbQuestions(data as QuizData[]); }); 
      const unsubscribeRewards = subscribeToRewards((data) => { setRewards(data); }); 
      
      const unsubscribeLeaderboard = subscribeToLeaderboard((users) => {
          if (user) {
              const rankIndex = users.findIndex(u => u.id === user.uid);
              if (rankIndex !== -1) {
                  setUserProfile(prev => ({ ...prev, rank: rankIndex + 1 }));
              }
          }
      });

      return () => { unsubscribeQuizzes(); unsubscribeRewards(); unsubscribeLeaderboard(); }; 
  }, [user]);
  
  useEffect(() => { 
    let unsubscribeUser: () => void; 
    if (user) { 
      unsubscribeUser = subscribeToUserData(user.uid, (data) => { 
        if (data) { 
          const currentCorrectAnswers = data.correctAnswers || 0;
          const currentPoints = data.points || 0;
          const correctLevelInfo = getLevelInfo(currentPoints);
          
          if (data.level !== correctLevelInfo.name) {
             updateUserData(user.uid, { level: correctLevelInfo.name });
          }

          setUserProfile(prev => ({ 
              ...prev,
              name: data.displayName || user.displayName || 'Santri', 
              totalPoints: currentPoints, 
              wasilah: data.wasilah || 0,
              level: correctLevelInfo.name,
              correctAnswers: currentCorrectAnswers,
              photoURL: data.photoURL || user.photoURL || '',
              lastCheckIn: data.lastCheckIn || null,
              avatarFrame: data.avatarFrame
          })); 
        } 
      }); 
    } else { 
      navigate('/quiz'); 
    } 
    return () => { if (unsubscribeUser) unsubscribeUser(); }; 
  }, [user, navigate]);

  useEffect(() => { 
    if (gameState === 'PLAYING' && !isLoading && !isAnswerRevealed && feedbackModal === null && currentMCQuestion && !answerPopup) { 
      timerRef.current = setInterval(() => { 
        setTimeLeft((prev) => { 
          if (prev <= 1) { 
            handleTimeOut(); 
            return 0; 
          } 
          playSound('TICK');
          return prev - 1; 
        }); 
      }, 1000); 
    } else { 
      if (timerRef.current) clearInterval(timerRef.current); 
    } 
    return () => { if (timerRef.current) clearInterval(timerRef.current); }; 
  }, [gameState, isLoading, isAnswerRevealed, feedbackModal, currentMCQuestion, answerPopup, timeLeft]);

  // Intercept browser/hardware back button & page refresh during active play
  useEffect(() => {
    if (gameState === 'PLAYING' && !isAnswerRevealed) {
      window.handleAndroidBackPress = () => {
        handleQuit();
        return true;
      };
    } else {
      delete window.handleAndroidBackPress;
    }
    return () => {
      delete window.handleAndroidBackPress;
    };
  }, [gameState, isAnswerRevealed]);

  useEffect(() => {
    if (gameState !== 'PLAYING' || isAnswerRevealed) return;

    const currentHash = window.location.hash || '#/quiz-pro';
    window.history.pushState({ inCerdasCermatGame: true }, '', currentHash);

    const handlePopState = () => {
      window.history.pushState({ inCerdasCermatGame: true }, '', currentHash);
      handleQuit();
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Permainan Cerdas Cermat sedang berlangsung. Mengundurkan diri akan menganggap Anda kalah.';
      return e.returnValue;
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [gameState, isAnswerRevealed]);

  useEffect(() => {
    window.onRewardGranted = async () => {
      if (isExtraChancePending && user) {
          await grantExtraChanceReward();
      } else if (showAdOfferModal && user) {
          try {
              await handleAdReward(user.uid);
              showToast("Alhamdulillah! +1 Wasilah & +100 Poin bonus berhasil diterima.", "success");
          } catch (e) {
              console.error("Failed to sync ad reward", e);
          } finally {
              setIsAdProcessing(false);
              setShowAdOfferModal(false);
          }
      } else {
          showToast("Terima kasih! Melanjutkan ke soal berikutnya.", "success");
          if (selectedTopic) {
            loadNewQuestion(selectedTopic.label, streak);
          }
      }
    };
    return () => { delete window.onRewardGranted; };
  }, [selectedTopic, streak, showAdOfferModal, user, isExtraChancePending]); 

  const updateProfilePoints = async (earnedPoints: number) => {
    if (user) {
      try {
        const newTotalPoints = userProfile.totalPoints + earnedPoints;
        const newCorrectCount = userProfile.correctAnswers + 1;
        const oldLevel = userProfile.level;
        const newLevelInfo = getLevelInfo(newCorrectCount);
        
        // Wasilah awarded & ad triggered every 5 correct answers
        const isWasilahEarned = newCorrectCount > 0 && newCorrectCount % 5 === 0;
        const wasilahIncrement = isWasilahEarned ? 1 : 0;

        await incrementUserGameStats(user.uid, earnedPoints, 1, wasilahIncrement);
        
        if (isWasilahEarned) {
           showToast("Alhamdulillah! +1 Wasilah diperoleh (Bonus 5 Jawaban Benar)!", "success");
        }

        if (newLevelInfo.name !== oldLevel) {
           await updateUserData(user.uid, { level: newLevelInfo.name });
           setShowLevelUpModal({ show: true, newLevel: newLevelInfo.name });
           speakAndroidText(`Mabruk! Anda naik tingkat menjadi level ${newLevelInfo.name}!`);
        }

        setUserProfile(prev => ({ 
          ...prev, 
          totalPoints: newTotalPoints, 
          correctAnswers: newCorrectCount, 
          wasilah: prev.wasilah + wasilahIncrement, 
          level: newLevelInfo.name 
        }));
      } catch (e) {
        console.error("Failed to sync points", e);
      }
    }
  };

  const handleAbsensi = async () => {
    if (!user) return;
    triggerInterstitial("Absensi", async () => {
      setIsCheckingIn(true);
      try {
          await handleDailyCheckIn(user.uid);
          showToast("Alhamdulillah! +1 Wasilah & +10 XP berhasil diterima.", "success");
          setTimeout(() => setShowAdOfferModal(true), 1500);
      } catch (e: any) {
          console.error("Daily check-in error in QuizAuthenticatedScreen:", e);
          showToast(`Gagal melakukan absensi: ${e.message || e}`, "error");
      } finally {
          setIsCheckingIn(false);
      }
    });
  };

  const handleWatchAdReward = () => {
    if (!user) return;
    if (window.AndroidNativeInterface?.showRewardedAd) {
        setIsAdProcessing(true);
        window.AndroidNativeInterface.showRewardedAd();
    } else {
        showToast("Fitur bonus video hanya tersedia di aplikasi Android.", "info");
        setShowAdOfferModal(false);
    }
  };

  const isAlreadyCheckedIn = () => {
    const today = new Date().toISOString().split('T')[0];
    return userProfile.lastCheckIn === today;
  };

  const handleRedeemReward = async (reward: RewardData) => {
      if (!user) return;
      if (userProfile.wasilah < reward.points) { showToast(`Wasilah tidak cukup. Kurang ${reward.points - userProfile.wasilah} wasilah lagi.`, "warning"); return; }
      setConfirmModal({ isOpen: true, title: "Tukar Wasilah?", message: `Tukar ${reward.points} wasilah untuk "${reward.name}"?`, action: async () => { setRedeemingId(reward.id || null); try { await requestRedemption(user, reward); showToast("Permintaan terkirim! Admin akan memprosesnya.", "success"); } catch (e) { showToast("Gagal menukar wasilah. Coba lagi.", "error"); } finally { setRedeemingId(null); setConfirmModal(prev => ({...prev, isOpen: false})); } } });
  };

  // Helper: persistent answered questions tracking
  const getCorrectlyAnsweredKeys = (): string[] => {
    try {
      const stored = localStorage.getItem('santri_quiz_answered_questions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const markQuestionAsCorrectlyAnswered = (questionText: string) => {
    try {
      const current = getCorrectlyAnsweredKeys();
      if (!current.includes(questionText)) {
        const updated = [...current, questionText];
        localStorage.setItem('santri_quiz_answered_questions', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn("Gagal menyimpan riwayat soal terjawab:", e);
    }
  };

  // Helper: shuffle question options dynamically
  const shuffleQuestionOptions = (q: QuizQuestion): QuizQuestion => {
    const originalCorrectText = q.options[q.correctIndex];
    const shuffledOptions = [...q.options];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    const newCorrectIndex = shuffledOptions.indexOf(originalCorrectText);
    return {
      ...q,
      arabicQuestion: q.arabicQuestion,
      audioUrl: q.audioUrl,
      surahRef: q.surahRef,
      options: shuffledOptions,
      correctIndex: newCorrectIndex !== -1 ? newCorrectIndex : q.correctIndex
    };
  };

  // Format question text (hide QS. reference in Sambung Ayat questions)
  const formatQuestionText = (q: QuizQuestion) => {
    if (!q || !q.question) return '';
    if (selectedTopic?.id === 'sambung_ayat' || q.topic === 'Sambung Ayat (Audio)' || q.topic === 'sambung_ayat') {
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

  // Helper: Fisher-Yates array shuffle for questions pool
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const loadNewQuestion = async (topicLabel: string, currentStreak: number) => { 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    stopQuestionAudio();
    setIsLoading(true); 
    setError(null); 
    setSelectedMCOption(null); 
    setIsAnswerRevealed(false); 
    setFeedbackModal(null); 
    setAnswerPopup(null);
    setTimeLeft(TIME_LIMIT); 
    
    let actualTopic = topicLabel; 
    if (topicLabel === 'Campuran' || topicLabel === 'Topik Random' || topicLabel === 'Random' || topicLabel === 'Topik Random (Campuran)') { 
      const subjectTopics = TOPICS.filter(t => t.id !== 'RANDOM');
      const randomIndex = Math.floor(Math.random() * subjectTopics.length); 
      actualTopic = subjectTopics[randomIndex].label; 
    } 
    
    try { 
      // Prioritaskan Soal Admin dari Firestore DB (`dbQuestions`) terlebih dahulu
      const adminQuestions: QuizQuestion[] = dbQuestions.map(q => ({
        question: q.question,
        options: q.options,
        correctIndex: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        explanation: q.explanation || "Soal dari Admin Bank Soal SantriAI",
        topic: q.topic || "Umum"
      }));

      const defaultQuestions: QuizQuestion[] = DEFAULT_QUIZ_BANK.map(q => ({
        question: q.question,
        arabicQuestion: q.arabicQuestion,
        audioUrl: q.audioUrl,
        surahRef: q.surahRef,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation || "Soal dari Bank Soal SantriAI",
        topic: q.topic
      }));

      // Combine dengan menaruh Soal Admin di bagian terdepan
      const allQuestions: QuizQuestion[] = [
        ...adminQuestions,
        ...defaultQuestions
      ];

      // Find topic object for flexible matching (ID or label)
      const topicObj = TOPICS.find(t => t.label === topicLabel || t.id === topicLabel || t.label === actualTopic || t.id === actualTopic);

      // Filter by topic if not 'Campuran'
      let matching = allQuestions.filter(q => {
        if (topicLabel === 'Campuran') return true;
        if (!q.topic) return false;
        const qTopicLower = q.topic.toLowerCase();
        const labelLower = topicLabel.toLowerCase();
        const actualLower = actualTopic.toLowerCase();
        const idLower = topicObj ? topicObj.id.toLowerCase() : '';
        const topicLabelFromObj = topicObj ? topicObj.label.toLowerCase() : '';

        return (
          q.topic === topicLabel ||
          q.topic === actualTopic ||
          (topicObj && q.topic === topicObj.id) ||
          (topicObj && q.topic === topicObj.label) ||
          qTopicLower === labelLower ||
          qTopicLower === actualLower ||
          qTopicLower === idLower ||
          qTopicLower === topicLabelFromObj ||
          qTopicLower.includes(labelLower) ||
          labelLower.includes(qTopicLower)
        );
      });

      if (matching.length === 0) {
        matching = allQuestions; // fallback to all Bank Soal questions
      }

      // Filter out questions the user HAS ALREADY ANSWERED CORRECTLY in past games
      const answeredKeys = getCorrectlyAnsweredKeys();
      let unused = matching.filter(q => !answeredKeys.includes(q.question) && !usedQuestionIds.includes(q.question));

      // If user has answered all questions in this topic correctly, reset the pool filter so they can keep playing smoothly
      if (unused.length === 0) {
        unused = matching.filter(q => !usedQuestionIds.includes(q.question));
        if (unused.length === 0) {
          unused = matching;
        }
      }

      // Shuffle candidates array randomly
      const shuffledPool = shuffleArray(unused);
      const rawSelected = shuffledPool[Math.floor(Math.random() * shuffledPool.length)];
      
      if (rawSelected) {
        // Shuffle options order every time question is served
        const selected = shuffleQuestionOptions(rawSelected);
        setUsedQuestionIds(prev => [...prev.slice(-30), selected.question]);
        setCurrentMCQuestion(selected);
      } else {
        setError("Soal tidak ditemukan.");
      }
    } catch (err) { 
      setError("Gagal memuat soal. Silakan coba lagi."); 
    } finally { 
      setIsLoading(false); 
    } 
  };
  
  const handleStartGame = (topic: {id: string, label: string}) => { 
    const currentMistakes = getTodayMistakesCount();
    const maxAllowed = getMaxMistakesAllowed();
    if (currentMistakes >= maxAllowed) {
      setShowLimitReachedModal(true);
      speakAndroidText("Jatah bermain Anda hari ini telah habis. Silakan tingkatkan lencana Anda di toko lencana.");
      return;
    }
    setSelectedTopic(topic); 
    setGameState('PLAYING'); 
    setScore(0); 
    setStreak(0); 
    setQuestionsAnswered(0); 
    setSessionCorrectCount(0);
    setLastRewardedMilestone(0);
    loadNewQuestion(topic.label, 0); 
    speakAndroidText("Selamat datang di Cerdas Cermat. Selamat berjuang!");
  };
  const handleMulaiBermainClick = () => { handleStartGame({ id: 'RANDOM', label: 'Campuran' }); };
  
  const handleTimeOut = () => { 
      setIsAnswerRevealed(true); 
      setStreak(0); 
      setAnswerPopup({ show: true, isCorrect: false });
      playSound('TIMEOUT');
      speakAndroidText("Waktu habis! Jawaban Anda dianggap kurang tepat.");
      recordMistake();
      saveSessionToHistory(); 
  };
  
  const handleMCAnswer = (index: number) => { 
      if (isAnswerRevealed || !currentMCQuestion) return; 
      setSelectedMCOption(index); 
      setIsAnswerRevealed(true); 
      const isCorrect = index === currentMCQuestion.correctIndex;
      
      if (isCorrect) { 
          markQuestionAsCorrectlyAnswered(currentMCQuestion.question);
          const badgeBonus = getBadgeXPBonus();
          const pointsEarned = 100 + (streak * 10) + badgeBonus; 
          setScore(prev => prev + pointsEarned); 
          setStreak(prev => prev + 1); 
          setSessionCorrectCount(prev => prev + 1);
          updateProfilePoints(pointsEarned); 
          playSound('CORRECT');
          speakAndroidText("Jawaban Anda benar!");
          setAnswerPopup({ show: true, isCorrect: true, points: pointsEarned });
      } else { 
          setStreak(0); 
          playSound('WRONG');
          speakAndroidText("Sayang sekali, jawaban kurang tepat.");
          setAnswerPopup({ show: true, isCorrect: false });
          recordMistake();
          saveSessionToHistory(); 
      } 
  };
  
  const handleNext = () => { 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (sessionCorrectCount > 0 && sessionCorrectCount % 5 === 0 && lastRewardedMilestone !== sessionCorrectCount) {
        setShowRewardAdModal(true);
        return;
    }
    if (selectedTopic) {
        const nextCount = questionsAnswered + 1;
        setQuestionsAnswered(nextCount);
        loadNewQuestion(selectedTopic.label, streak);
    } 
  };

  const handleWatchRewardAd = () => {
    setLastRewardedMilestone(sessionCorrectCount);
    setShowRewardAdModal(false);
    if (window.AndroidNativeInterface?.showRewardedAd) {
      window.onRewardGranted = () => {
        showToast("Terima kasih! Melanjutkan ke soal berikutnya.", "success");
        if (selectedTopic) {
          loadNewQuestion(selectedTopic.label, streak);
        }
      };
      try {
        window.AndroidNativeInterface.showRewardedAd();
      } catch (err) {
        console.error("Gagal memanggil native AdMob Rewarded Ad:", err);
        if (selectedTopic) loadNewQuestion(selectedTopic.label, streak);
      }
    } else {
      showToast("Terima kasih! Melanjutkan ke soal berikutnya.", "success");
      if (selectedTopic) loadNewQuestion(selectedTopic.label, streak);
    }
  };

  const handleRewardModalQuit = () => {
    setShowRewardAdModal(false);
    handleQuit();
  };
  
  const saveSessionToHistory = () => {
      if (score > 0 && selectedTopic) {
          addToHistory({
              id: uuidv4(),
              type: 'quiz',
              title: `Kuis ${selectedTopic.label}`,
              subtitle: `Skor: ${score} (Pilgan)`,
              timestamp: new Date().toISOString(),
              path: '/quiz-pro'
          });
      }
  };

  const handleQuit = (targetPath?: string) => {
    // If answer is already revealed (wrong/correct outcome already recorded) or game not playing mid-question, exit directly without deducting quota!
    if (gameState !== 'PLAYING' || isAnswerRevealed) {
      saveSessionToHistory();
      setFeedbackModal(null);
      if (targetPath) {
        navigate(targetPath);
      } else {
        setGameState('MENU');
        setCurrentMCQuestion(null);
      }
      return;
    }

    // Only if user forfeits actively while answering an active question:
    setConfirmModal({ 
        isOpen: true, 
        title: "Peringatan: Menyerah & Dinyatakan Kalah?", 
        message: "Mengundurkan diri saat pertanyaan sedang berlangsung akan menganggap Anda KALAH/SALAH dan mengurangi 1 jatah kesempatan bermain hari ini. Apakah Anda yakin ingin keluar?", 
        action: async () => { 
            await recordMistake();
            setStreak(0);
            saveSessionToHistory(); 
            setFeedbackModal(null); 
            setConfirmModal(prev => ({...prev, isOpen: false})); 
            showToast("Anda mengundurkan diri. Dinyatakan kalah & 1x jatah bermain berkurang.", "error");
            if (targetPath) {
                navigate(targetPath);
            } else {
                setGameState('MENU'); 
                setCurrentMCQuestion(null); 
            }
        } 
    });
  };

  const currentLevelInfo = getLevelInfo(userProfile.totalPoints);
  const nextLevelInfo = LEVEL_SYSTEM[LEVEL_SYSTEM.indexOf(currentLevelInfo) + 1];
  const progressPercent = nextLevelInfo ? Math.min(100, Math.max(0, ((userProfile.totalPoints - currentLevelInfo.min) / (nextLevelInfo.min - currentLevelInfo.min)) * 100)) : 100;

  const isMatchHeaderHidden = gameState === 'PLAYING' || isMultiplayerMatchActive;

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-32 flex flex-col animate-fade-in">
        {!isMatchHeaderHidden && (
          <div className="sticky top-0 z-30 bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 text-white shadow-md border-b border-purple-700/40 px-4 py-3.5">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/')} 
                        className="p-2 -ml-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
                        title="Kembali"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="font-bold text-lg text-white flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-purple-200" /> Cerdas Cermat
                    </h2>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => navigate('/profile')}
                        className="p-0.5 rounded-full ring-2 ring-white/60 hover:ring-white transition-all active:scale-95 shadow-sm flex items-center justify-center cursor-pointer"
                        title="Profil Saya"
                    >
                        <UserAvatar
                            photoURL={userProfile.photoURL || userData?.photoURL}
                            displayName={userProfile.name || userData?.displayName || 'Santri'}
                            size="sm"
                            avatarFrame={userData?.avatarFrame}
                            verificationBadge={userData?.verificationBadge}
                        />
                    </button>
                </div>
            </div>
        </div>
        )}

      <div className="max-w-2xl mx-auto w-full px-4 py-6 flex-grow flex flex-col">
         {gameState === 'MENU' && (
            <div className="space-y-6 animate-slide-up">
               {quizMode === 'MULTIPLAYER' ? (
                  <MultiplayerQuizView 
                     topics={TOPICS} 
                     initialRoomCode={selectedRoomCode} 
                     initialAction={selectedRoomAction}
                     onMatchActiveChange={setIsMultiplayerMatchActive}
                     onBackToSinglePlayer={() => { 
                        setQuizMode('SINGLE'); 
                        setSelectedRoomCode(null); 
                        setSelectedRoomAction('join');
                        setIsMultiplayerMatchActive(false);
                     }} 
                  />
               ) : (
                  <>
               {/* Combined Hero & Progress Card */}
               <div className="bg-gradient-to-br from-purple-700 via-indigo-600 to-indigo-800 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                  
                  <div className="relative z-10 space-y-4">
                     {/* Embedded Progress & Stats Box */}
                     <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-3.5">
                        {/* Top row: Level & Wasilah */}
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center font-black shadow-sm text-lg select-none">
                                 🏆
                              </div>
                              <div>
                                 <div className="flex items-center gap-2">
                                    <span className="font-black text-sm text-white">{currentLevelInfo.name}</span>
                                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/20 text-white">
                                       Level {LEVEL_SYSTEM.indexOf(currentLevelInfo) + 1}
                                    </span>
                                 </div>
                                 <span className="text-[10px] font-semibold text-indigo-200 block">Level Santri AI</span>
                              </div>
                           </div>

                           {/* Wasilah counter */}
                           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/20 border border-amber-300/30 rounded-xl backdrop-blur-sm">
                              <Gem size={15} className="text-amber-300 fill-amber-300" />
                              <div className="text-right">
                                 <span className="text-[9px] font-black text-amber-200 block uppercase tracking-wider">Wasilah</span>
                                 <span className="font-black text-xs text-amber-100">{(userData?.wasilah ?? userProfile.wasilah ?? 0).toLocaleString()}</span>
                              </div>
                           </div>
                        </div>

                        {/* Progress Bar & XP */}
                        <div className="space-y-1.5 pt-2 border-t border-white/10">
                           <div className="flex justify-between items-center text-xs">
                              <span className="text-indigo-100 font-bold flex items-center gap-1.5">
                                 <Coins size={14} className="text-amber-300" />
                                 <span>Poin XP:</span>
                                 <span className="font-black text-white">{(userData?.totalPoints ?? userProfile.totalPoints ?? 0).toLocaleString()} XP</span>
                              </span>
                              <span className="text-[11px] font-black text-amber-300">
                                 {nextLevelInfo ? `${progressPercent.toFixed(0)}% menuju ${nextLevelInfo.name}` : 'Level Maksimal'}
                              </span>
                           </div>
                           <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/20">
                              <div 
                                 className="h-full bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
                                 style={{ width: `${progressPercent}%` }}
                              />
                           </div>

                           {/* Daily Mistakes Chances */}
                           <div className="flex justify-between items-center text-xs pt-2 border-t border-white/10">
                              <span className="text-indigo-100 font-bold flex items-center gap-1.5">
                                 <Heart size={14} className="text-rose-400 fill-rose-400" />
                                 <span>Sisa Kesempatan Salah:</span>
                              </span>
                              <span className={`font-black px-2.5 py-0.5 rounded-full text-[11px] ${
                                 (getMaxMistakesAllowed() - getTodayMistakesCount()) <= 0 
                                    ? 'bg-rose-500/30 text-rose-200 border border-rose-400/40' 
                                    : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                              }`}>
                                 {Math.max(0, getMaxMistakesAllowed() - getTodayMistakesCount())} / {getMaxMistakesAllowed()} x
                              </span>
                           </div>
                        </div>
                     </div>

                     {/* Action Buttons under progress */}
                     <div className="space-y-2.5 pt-1">
                        {/* Button 1: Mulai Bermain Sendiri */}
                        <button 
                           onClick={() => setShowTopicModal(true)} 
                           className="w-full py-3.5 bg-white text-indigo-900 hover:bg-indigo-50 active:scale-98 text-sm font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                           <Target size={18} className="text-purple-600" /> Mulai Bermain Sendiri
                        </button>

                        {/* Button 2: Main Bareng (Multiplayer) directly under Mulai Bermain Sendiri */}
                        <button 
                           onClick={() => {
                              setSelectedRoomAction('join');
                              setQuizMode('MULTIPLAYER');
                           }}
                           className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-amber-950 active:scale-98 text-sm font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                           <Users size={18} className="text-amber-950" /> Main Bareng (Multiplayer)
                           <span className="bg-amber-950 text-amber-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse ml-1">
                              Rame 🔥
                           </span>
                        </button>
                     </div>
                  </div>
               </div>

               {/* Arena Versus Tersedia Section */}
               <div className="space-y-3 pt-2">
                  <div className="text-left flex items-center justify-between">
                     <div>
                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-base mb-0.5 flex items-center gap-2">
                           <span className="text-lg select-none">⚔️</span> Arena Versus Tersedia
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                           Pilih arena versus aktif untuk masuk atau melihat pertandingan secara real-time.
                        </p>
                     </div>
                     <button
                        onClick={() => {
                           setSelectedRoomAction('create');
                           setQuizMode('MULTIPLAYER');
                        }}
                        className="px-4 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap min-h-[44px] flex items-center justify-center gap-1.5"
                     >
                        <span>⚔️</span> + Buat Room
                     </button>
                  </div>

                  {publicRooms.filter(r => r.status !== 'cancelled').length === 0 ? (
                     <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-purple-100 dark:border-purple-900/50 shadow-xs text-center space-y-3">
                        <div className="w-12 h-12 mx-auto bg-purple-50 dark:bg-purple-950/60 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-300">
                           <Users size={24} />
                        </div>
                        <div>
                           <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                              Belum Ada Arena Versus Aktif
                           </h5>
                           <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                              Jadilah pembuat arena versus pertama! Buat room baru dan ajak santri lain bertanding.
                           </p>
                        </div>
                        <button
                           onClick={() => {
                              setSelectedRoomAction('create');
                              setQuizMode('MULTIPLAYER');
                           }}
                           className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-sm shadow-md transition-all cursor-pointer active:scale-95 min-h-[46px] inline-flex items-center justify-center gap-2"
                        >
                           <PlusCircle size={16} /> + Buat Room Versus Sekarang
                        </button>
                     </div>
                  ) : (
                     <div className="space-y-3">
                        {publicRooms.filter(r => r.status !== 'cancelled').map((pRoom, idx) => {
                           const playerCount = Object.keys(pRoom.players || {}).length;
                           const maxAllowed = pRoom.maxPlayers || 100;
                           const isFull = playerCount >= maxAllowed;
                           const scheduledMs = pRoom.scheduledStartTime || pRoom.createdAt;
                           const diffMs = scheduledMs - Date.now();
                           const CARD_BG_STYLES = [
                              'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white border border-indigo-400/40 shadow-md hover:shadow-xl transition-all',
                              'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white border border-emerald-400/40 shadow-md hover:shadow-xl transition-all',
                              'bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white border border-amber-400/40 shadow-md hover:shadow-xl transition-all',
                              'bg-gradient-to-br from-fuchsia-600 via-pink-600 to-purple-600 text-white border border-fuchsia-400/40 shadow-md hover:shadow-xl transition-all'
                           ];
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

                           const isLive = pRoom.status === 'playing' || pRoom.status === 'question_result';

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
                                          <span className="text-xs">🏆</span> Selesai
                                       </span>
                                    ) : isLive ? (
                                       <span className="bg-rose-500 text-white font-black text-[10px] px-2.5 py-0.5 rounded-lg flex items-center gap-1 animate-pulse shadow-2xs border border-white/40">
                                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> LIVE
                                       </span>
                                    ) : (
                                       <span className="bg-amber-300 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                                          <Clock size={11} /> {timeText}
                                       </span>
                                     )}
                                  </div>

                                  {/* Order: 1. Masuk Room, 2. Share, 3. Lihat */}
                                 <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 border-t border-white/20">
                                    {/* 1. Masuk Room */}
                                    {pRoom.status === 'waiting' && (
                                       <button
                                          disabled={isFull}
                                          onClick={() => {
                                             setSelectedRoomCode(pRoom.roomCode);
                                             setSelectedRoomAction('join');
                                             setQuizMode('MULTIPLAYER');
                                          }}
                                          className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                                             isFull
                                                ? 'bg-black/30 text-white/50 border border-white/20 cursor-not-allowed shadow-none'
                                                : 'bg-emerald-500 hover:bg-emerald-400 text-white active:scale-95 shadow-md border border-emerald-300/40'
                                          }`}
                                          title={isFull ? 'Room Sudah Penuh' : 'Masuk dan Bertanding di Room Ini'}
                                       >
                                          <span className="text-xs select-none">⚔️</span> <span>Masuk Room</span>
                                       </button>
                                    )}

                                    {/* 2. Share */}
                                    <button
                                       type="button"
                                       onClick={() => {
                                          const title = `Arena Versus: ${pRoom.roomName}`;
                                          const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.kitabkuningterjemahlengkap';
                                          const shareText = `Ayo bergabung Cerdas Cermat untuk menambah wawasan keilmuan, mempertajam kemampuan daya ingat dan mengasah otak di Arena Versus "${pRoom.roomName}" ID Arena: #${pRoom.roomCode}.\nMari bergabung di aplikasi Santri AI pada fitur cerdas cermat\n${playStoreUrl}`;

                                          if ((window as any).AndroidNativeInterface && typeof (window as any).AndroidNativeInterface.shareText === 'function') {
                                             try {
                                                (window as any).AndroidNativeInterface.shareText(title, shareText);
                                                showToast('Membuka menu berbagi Android...', 'info');
                                                return;
                                             } catch (e) {
                                                console.error('AndroidNativeInterface share error:', e);
                                             }
                                          }

                                          if ((window as any).AndroidInterface && typeof (window as any).AndroidInterface.share === 'function') {
                                             try {
                                                (window as any).AndroidInterface.share(shareText);
                                                showToast('Membuka menu berbagi Android...', 'info');
                                                return;
                                             } catch (e) {
                                                console.error('AndroidInterface share error:', e);
                                             }
                                          }

                                          if (navigator.share) {
                                             navigator.share({ title, text: shareText })
                                                .then(() => showToast('Berhasil membagikan undangan room!', 'success'))
                                                .catch((err) => {
                                                   if (err?.name !== 'AbortError' && navigator.clipboard) {
                                                      navigator.clipboard.writeText(shareText);
                                                      showToast('Link arena disalin!', 'success');
                                                   }
                                                });
                                          } else if (navigator.clipboard) {
                                             navigator.clipboard.writeText(shareText);
                                             showToast('Link arena disalin!', 'success');
                                          }
                                       }}
                                       className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                                       title="Bagikan & Ajak Pengguna Lain"
                                    >
                                       <Share2 size={13} />
                                       <span>Share</span>
                                    </button>

                                    {/* 3. Lihat */}
                                    {(pRoom.status === 'playing' || pRoom.status === 'question_result' || pRoom.status === 'finished') && (
                                       <button
                                          type="button"
                                          onClick={() => {
                                             setSelectedRoomCode(pRoom.roomCode);
                                             setSelectedRoomAction('spectate');
                                             setQuizMode('MULTIPLAYER');
                                          }}
                                          className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-200 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                                          title="Lihat Room Ini (Sebagai Penonton)"
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
                  )}
               </div>
                  </>
               )}
            </div>
         )}

         {gameState === 'PLAYING' && (
            <div className="flex-1 flex flex-col">
               {/* Floating Sticky Gradient Header (Soal, Timer, Kesempatan Salah, Skor, Keluar & Progress) */}
               <div className="sticky top-2 z-30 bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-purple-500/40 shadow-xl backdrop-blur-md space-y-2.5 mb-4 animate-fade-in">
                  <div className="flex items-center justify-between gap-2">
                     <div className="flex items-center gap-2 min-w-0">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-black text-xs sm:text-sm whitespace-nowrap shadow-xs">
                           Soal {streak + 1}
                        </span>
                        <span className="text-xs font-bold text-purple-200 truncate hidden sm:inline">
                           📚 {selectedTopic?.label || 'Umum'}
                        </span>
                     </div>

                     <div className="flex items-center gap-2 shrink-0">
                        <div className="bg-white/20 text-white backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-xs" title="Sisa Kesempatan Salah">
                           <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
                           <span>{Math.max(0, getMaxMistakesAllowed() - getTodayMistakesCount())}/{getMaxMistakesAllowed()}</span>
                        </div>
                        <div className="bg-white/20 text-white backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-xs" title="Skor Poin XP">
                           <span className="text-xs select-none">🏆</span>
                           <span>{score}</span>
                        </div>
                        {!isLoading && !isAnswerRevealed && feedbackModal === null && (
                           <div
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-xs sm:text-sm shadow-sm transition-all ${
                                 timeLeft <= 10
                                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/50'
                                    : 'bg-amber-400 text-slate-950 border border-amber-300'
                              }`}
                           >
                              <Timer size={14} className={timeLeft <= 10 ? 'animate-spin' : ''} />
                              <span>{timeLeft}s</span>
                           </div>
                        )}
                        <button
                           onClick={() => handleQuit()}
                           className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white px-3 py-1 rounded-full text-xs font-black transition-all flex items-center gap-1 border border-rose-300/40 shadow-sm cursor-pointer whitespace-nowrap"
                           title="Keluar Permainan"
                        >
                           <LogOut size={13} />
                           <span>Keluar</span>
                        </button>
                     </div>
                  </div>

                  {/* Time Progress Bar */}
                  {!isLoading && !isAnswerRevealed && feedbackModal === null && (
                     <div className="w-full bg-black/30 h-2 rounded-full overflow-hidden p-0.5 border border-white/20">
                        <div 
                           className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                              timeLeft <= 10 ? 'bg-rose-400' : 'bg-gradient-to-r from-cyan-400 via-amber-300 to-emerald-400 shadow-xs'
                           }`} 
                           style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
                        ></div>
                     </div>
                  )}
               </div>

               {isLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                     <Loader2 size={48} className="text-purple-600 animate-spin" />
                     <p className="text-gray-500">Menyiapkan soal...</p>
                  </div>
               ) : error ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                     <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                     <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
                     <button onClick={() => selectedTopic && loadNewQuestion(selectedTopic.label, streak)} className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold">Coba Lagi</button>
                  </div>
               ) : (
                  <div className="flex flex-col h-full animate-slide-up">
                     {currentMCQuestion && (
                        <>
                           <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-purple-100 dark:border-gray-700 shadow-lg mb-6 relative overflow-hidden">
                              {/* Arabic Verse text if available (for Tebak Ayat, show only after answer reveal) */}
                              {currentMCQuestion.arabicQuestion && (selectedTopic?.id !== 'tebak_ayat' || isAnswerRevealed) && (
                                 <div className="mb-4 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-right">
                                    <p className="font-arabic text-2xl leading-loose font-bold text-slate-800 dark:text-amber-100" dir="rtl">
                                       {currentMCQuestion.arabicQuestion}
                                    </p>
                                 </div>
                              )}

                              {/* Question text */}
                              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-relaxed relative z-10">{formatQuestionText(currentMCQuestion)}</h3>

                              {/* Audio Player Box below question */}
                              {currentMCQuestion.audioUrl && (
                                 <div className="mt-4 pt-4 border-t border-purple-100 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                       <button
                                          onClick={() => toggleQuestionAudio(currentMCQuestion.audioUrl)}
                                          disabled={isQuestionAudioLoading}
                                          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-sm cursor-pointer ${
                                             isQuestionAudioPlaying 
                                                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 animate-pulse' 
                                                : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
                                          }`}
                                       >
                                          {isQuestionAudioLoading ? (
                                             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          ) : isQuestionAudioPlaying ? (
                                             <>
                                                <Pause size={18} fill="currentColor" />
                                                <span>Sedang Memutar Audio... (Jeda)</span>
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
                                                toggleQuestionAudio(currentMCQuestion.audioUrl);
                                             }}
                                             className="p-3 rounded-xl bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 transition-colors shadow-xs"
                                             title="Ulangi Audio dari Awal"
                                          >
                                             <RotateCw size={18} />
                                          </button>
                                       )}
                                    </div>
                                 </div>
                              )}
                           </div>
                           <div className="space-y-3 flex-1">
                              {currentMCQuestion.options.map((opt, idx) => { 
                                 let btnClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"; 
                                 if (isAnswerRevealed) { 
                                    if (idx === currentMCQuestion.correctIndex) btnClass = "bg-green-100 border-green-500 text-green-800"; 
                                    else if (idx === selectedMCOption) btnClass = "bg-red-100 border-red-500 text-red-800"; 
                                    else btnClass += " opacity-60"; 
                                 } else if (selectedMCOption === idx) btnClass = "bg-purple-100 border-purple-500 text-purple-800"; 
                                 
                                 const isArabicOption = /[\u0600-\u06FF]/.test(opt);

                                 return (
                                    <button key={idx} onClick={() => handleMCAnswer(idx)} disabled={isAnswerRevealed} className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all flex items-center justify-between gap-3 ${btnClass}`}>
                                       <div className="flex items-center gap-3 w-full">
                                          <span className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center shrink-0 border text-sm transition-colors ${
                                             isAnswerRevealed && idx === currentMCQuestion.correctIndex 
                                                ? "bg-green-600 text-white border-green-600" 
                                                : isAnswerRevealed && idx === selectedMCOption 
                                                ? "bg-red-600 text-white border-red-600" 
                                                : selectedMCOption === idx 
                                                ? "bg-purple-600 text-white border-purple-600" 
                                                : "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                          }`}>
                                             {['A', 'B', 'C', 'D'][idx] || (idx + 1)}
                                          </span>
                                          <span className={isArabicOption ? "font-arabic text-xl font-bold leading-relaxed w-full text-right" : "font-medium"} dir={isArabicOption ? "rtl" : "ltr"}>{opt}</span>
                                       </div>
                                       {isAnswerRevealed && idx === currentMCQuestion.correctIndex && <CheckCircle className="w-5 h-5 text-green-600 shrink-0 ml-2" />}
                                       {isAnswerRevealed && idx === selectedMCOption && idx !== currentMCQuestion.correctIndex && <XCircle className="w-5 h-5 text-red-600 shrink-0 ml-2" />}
                                    </button>
                                 ); 
                              })}
                           </div>
                           {isAnswerRevealed && (
                              <div className="mt-6 animate-slide-down">
                                 <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 mb-4">
                                    <h4 className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Penjelasan</h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{currentMCQuestion.explanation || "Jawaban sudah diverifikasi."}</p>
                                 </div>
                                 <button onClick={handleNext} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold shadow-lg">Soal Berikutnya</button>
                              </div>
                           )}
                        </>
                     )}
                     {(!isAnswerRevealed && feedbackModal === null) && (
                        <div className="mt-6 flex justify-center">
                           <button onClick={() => handleQuit()} className="flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm font-medium"><LogOut className="w-4 h-4" /> Keluar</button>
                        </div>
                     )}
                  </div>
               )}
            </div>
         )}

         {/* ANSWER RESULT MODAL */}
         {answerPopup && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-900 w-full max-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-300 text-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${answerPopup.isCorrect ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                     {answerPopup.isCorrect ? (
                        <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
                     ) : (
                        <XCircle size={48} className="text-red-600 dark:text-red-400" />
                     )}
                  </div>
                  <h2 className={`text-xl font-bold mb-2 ${answerPopup.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {answerPopup.isCorrect ? 'Jawaban Benar!' : 'Belum Tepat'}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed px-2">
                    {answerPopup.isCorrect 
                      ? `Jawaban anda benar! Poin anda bertambah (+${answerPopup.points} Poin${getBadgeXPBonus() > 0 ? ` termasuk bonus lencana +${getBadgeXPBonus()} XP` : ''})${userProfile.correctAnswers > 0 && userProfile.correctAnswers % 5 === 0 ? ' & +1 Wasilah!' : ''}, silahkan lanjutkan belajar!` 
                      : `Maaf jawaban anda salah. Sisa kesempatan salah hari ini: ${Math.max(0, getMaxMistakesAllowed() - getTodayMistakesCount())}/${getMaxMistakesAllowed()}.`}
                  </p>
                  <button 
                    onClick={() => setAnswerPopup(null)}
                    className={`w-full py-3.5 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 ${answerPopup.isCorrect ? 'bg-green-600 shadow-green-200 dark:shadow-none' : 'bg-red-600 shadow-red-200 dark:shadow-none'}`}
                  >
                    Lanjutkan
                  </button>
               </div>
            </div>
         )}
         
         {feedbackModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="h-24 w-full absolute top-0 left-0 bg-red-500"></div>
                  <div className="relative z-10 flex justify-center mt-12 mb-4">
                     <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center shadow-md bg-white text-gray-800">
                        <X size={48} className="text-red-600" />
                     </div>
                  </div>
                  <div className="px-6 pb-6 text-center overflow-y-auto">
                     <h2 className="text-2xl font-bold mb-2 text-red-600">Waktu Habis!</h2>
                     <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl mb-4 text-left text-sm text-slate-600 dark:text-slate-300">
                        Waktu habis! Jangan menyerah.
                     </div>
                     <button onClick={() => { setFeedbackModal(null); handleNext(); }} className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold shadow-lg">Lanjut</button>
                  </div>
               </div>
            </div>
         )}
         
         {showLevelUpModal && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
               <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl relative animate-in zoom-in-95 duration-500 overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/confetti.png')]"></div>
                  <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 animate-bounce">
                     <Crown size={48} className="text-yellow-500 fill-yellow-500" />
                  </div>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600 mb-2 uppercase tracking-wide relative z-10">Level Up!</h2>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 relative z-10">Selamat! Pangkat Anda naik menjadi:</p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-400 p-4 rounded-xl mb-8 relative z-10 transform scale-110">
                     <span className="text-xl font-bold text-yellow-700 dark:text-yellow-400">{showLevelUpModal.newLevel}</span>
                  </div>
                  <button onClick={() => setShowLevelUpModal(null)} className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-bold shadow-lg relative z-10 hover:scale-105 transition-transform">Alhamdulillah</button>
               </div>
            </div>
         )}

         {/* MISTAKE LIMIT REACHED MODAL */}
         {showLimitReachedModal && (
            <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
               <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl border border-rose-100 dark:border-rose-900/50 text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-800 shadow-inner">
                     <Heart size={32} className="fill-rose-500 text-rose-600 animate-pulse" />
                  </div>
                  
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                     Batas Kesempatan Salah Habis!
                  </h2>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                     Anda telah salah <strong className="text-rose-600 dark:text-rose-400">{getTodayMistakesCount()}x</strong> hari ini (Maksimal: {getMaxMistakesAllowed()}x). Jatah salah akan di-reset otomatis <strong className="text-indigo-600 dark:text-indigo-400">besok</strong>.
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-4 mb-5 border border-slate-200/80 dark:border-slate-700/80 text-left space-y-2.5">
                     <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
                        <BadgeCheck size={16} className="text-purple-600 dark:text-purple-400" />
                        <span>Bonus Tambahan Kesempatan & XP per Lencana:</span>
                     </div>
                     <div className="grid grid-cols-1 gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <div className="flex items-center justify-between bg-purple-500/10 p-2 rounded-xl border border-purple-500/20">
                           <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-purple-500" /> Verifikasi Ungu</span>
                           <span className="text-purple-600 dark:text-purple-400 font-black">+3x Kesempatan & +5 XP</span>
                        </div>
                        <div className="flex items-center justify-between bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
                           <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-blue-500" /> Verifikasi Biru</span>
                           <span className="text-blue-600 dark:text-blue-400 font-black">+5x Kesempatan & +10 XP</span>
                        </div>
                        <div className="flex items-center justify-between bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                           <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-red-500" /> Verifikasi Merah</span>
                           <span className="text-red-600 dark:text-red-400 font-black">+8x Kesempatan & +15 XP</span>
                        </div>
                        <div className="flex items-center justify-between bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                           <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-emerald-500" /> Verifikasi Hijau</span>
                           <span className="text-emerald-600 dark:text-emerald-400 font-black">+10x Kesempatan & +20 XP</span>
                        </div>
                        <div className="flex items-center justify-between bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                           <span className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-amber-500" /> Verifikasi Emas</span>
                           <span className="text-amber-600 dark:text-amber-400 font-black">+15x Kesempatan & +30 XP</span>
                        </div>
                     </div>
                  </div>

                  {/* Extra Chance Watch Ad Option (1x/day) */}
                  {!hasUsedDailyAdExtraToday() ? (
                     <button 
                        onClick={handleWatchAdForExtraChance}
                        disabled={isAdProcessing}
                        className="w-full mb-3 py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs rounded-xl shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 border border-emerald-400/30"
                     >
                        <Video size={16} className="text-emerald-200 animate-pulse" />
                        <span>Tonton Iklan (+1x Kesempatan Ekstra)</span>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold ml-1">1x/hari</span>
                     </button>
                  ) : (
                     <div className="w-full mb-3 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span>Kesempatan iklan ekstra hari ini sudah digunakan (1x/hari).</span>
                     </div>
                  )}

                  <div className="flex items-center gap-2.5">
                     <button 
                        onClick={() => { setShowLimitReachedModal(false); navigate('/badge-shop'); }}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-1.5"
                     >
                        <BadgeCheck size={16} /> Beli / Tingkatkan Lencana
                     </button>
                     <button 
                        onClick={() => setShowLimitReachedModal(false)}
                        className="px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 transition-all"
                     >
                        Tutup
                     </button>
                  </div>
               </div>
            </div>
         )}

         <ConfirmationModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.action} onCancel={() => setConfirmModal(prev => ({...prev, isOpen: false}))} isDestructive={true} />

         {showTopicModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
               <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col space-y-4 animate-scale-up">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                     <div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                           <BookOpen size={20} className="text-purple-600" /> Pilih Topik Kuis
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                           Pilih disiplin ilmu atau mode Random untuk mulai bermain sendiri.
                        </p>
                     </div>
                     <button 
                        onClick={() => setShowTopicModal(false)}
                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
                     >
                        <X size={18} />
                     </button>
                  </div>

                  <div className="overflow-y-auto pr-1 space-y-2.5 flex-1 max-h-[60vh]">
                     {/* Random Topic Card */}
                     <button
                        onClick={() => {
                           handleStartGame({ id: 'RANDOM', label: 'Topik Random' });
                           setShowTopicModal(false);
                        }}
                        className="w-full p-4 rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/20 hover:border-amber-400 active:scale-98 transition-all flex items-center justify-between text-left cursor-pointer shadow-xs"
                     >
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                              🎲
                           </div>
                           <div>
                              <h4 className="font-black text-sm text-slate-800 dark:text-slate-100">
                                 Topik Random (Acak Semua)
                              </h4>
                              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                 Soal acak dari seluruh disiplin ilmu keislaman
                              </p>
                           </div>
                        </div>
                        <span className="bg-amber-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                           Populer 🔥
                        </span>
                     </button>

                     {/* Individual Academic Topics */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {TOPICS.map((topic) => {
                           const style = getTopicCardStyle(topic.id);
                           return (
                              <button
                                 key={topic.id}
                                 onClick={() => {
                                    handleStartGame(topic);
                                    setShowTopicModal(false);
                                 }}
                                 className={`p-3.5 rounded-2xl border shadow-2xs active:scale-98 transition-all flex items-center gap-3 text-left hover:shadow-xs cursor-pointer ${style.cardBg}`}
                              >
                                 <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ${style.iconBg}`}>
                                    {style.icon}
                                 </span>
                                 <div className="min-w-0">
                                    <h4 className={`font-black text-xs sm:text-sm tracking-tight truncate ${style.textColor}`}>
                                       {topic.label}
                                    </h4>
                                    <span className={`text-[10px] font-bold block uppercase tracking-wide mt-0.5 ${style.subTextColor}`}>
                                       Mulai Kuis
                                    </span>
                                 </div>
                              </button>
                           );
                        })}
                     </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                     <button
                        onClick={() => setShowTopicModal(false)}
                        className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-extrabold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
                     >
                        Tutup
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* REWARD AD MODAL (5 JAWABAN BENAR) */}
         {showRewardAdModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-300 text-center">
                  <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Gift size={40} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                    Hebat! 5 Jawaban Benar
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed px-2">
                    Anda telah berhasil menjawab {sessionCorrectCount} pertanyaan. Tonton iklan reward untuk melanjutkan ke soal berikutnya atau kembali ke menu.
                  </p>
                  <div className="space-y-3">
                    <button 
                      onClick={handleWatchRewardAd}
                      className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Gift size={18} /> Tonton Iklan & Lanjutkan
                    </button>
                    <button 
                      onClick={handleRewardModalQuit}
                      className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft size={18} /> Kembali
                    </button>
                  </div>
               </div>
            </div>
         )}

         
      </div>
    </div>
  );
};

export default QuizAuthenticatedScreen;
