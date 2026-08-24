
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BrainCircuit, CheckCircle, XCircle, 
  Loader2, AlertCircle, Shuffle, Lightbulb, Check, LogIn,
  Coins, Gem, Trophy, User, Gift, Target, Flame, Timer, X
} from 'lucide-react';
import { QuizQuestion } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToQuizzes, QuizData } from '../services/firebase';
import { DEFAULT_QUIZ_BANK } from '../constants/defaultQuizBank';

const TOPICS = [
  { id: 'tafsir', label: 'Tafsir Al-Quran', color: 'emerald' },
  { id: 'hadits', label: 'Hadits', color: 'blue' },
  { id: 'akidah', label: 'Akidah (Tauhid)', color: 'indigo' },
  { id: 'fiqh', label: 'Fiqih', color: 'rose' },
  { id: 'ushul_fiqh', label: 'Ushul Fiqih', color: 'violet' },
  { id: 'nahwu', label: 'Nahwu & Shorof', color: 'teal' },
  { id: 'mantiq', label: 'Mantiq (Logika)', color: 'purple' },
  { id: 'tasawuf', label: 'Akhlaq & Tasawuf', color: 'rose' },
  { id: 'tarikh', label: 'Tarikh (Sejarah)', color: 'amber' },
  { id: 'sholawat', label: 'Kumpulan Sholawat', color: 'pink' },
  { id: 'maulid', label: 'Kitab Maulid', color: 'orange' },
  { id: 'ratib', label: 'Kitab Ratib', color: 'cyan' },
  { id: 'tajwid', label: 'Ilmu Tajwid', color: 'green' }
];

const REWARD_PRODUCTS = [
  { id: 1, name: 'Buku Fiqih Sunnah', points: 5000, icon: '📚' },
  { id: 2, name: 'Peci Hitam Premium', points: 3500, icon: '🧢' },
  { id: 3, name: 'Tasbih Digital LED', points: 2000, icon: '📿' },
  { id: 4, name: 'Voucher Kitab Kuning', points: 10000, icon: '🎫' },
];

const TIME_LIMIT = 60;

export default function CerdasCermatScreen() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
        navigate('/quiz-pro', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const [gameState, setGameState] = useState<'MENU' | 'PLAYING'>('MENU');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  
  const [currentMCQuestion, setCurrentMCQuestion] = useState<QuizQuestion | null>(null);
  const [selectedMCOption, setSelectedMCOption] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [lastRewardedMilestone, setLastRewardedMilestone] = useState(0);
  const [showRewardAdModal, setShowRewardAdModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [answerPopup, setAnswerPopup] = useState<{ show: boolean; isCorrect: boolean } | null>(null);

  // AdMob Interstitial handler (Native-only, no custom React UI)
  const triggerInterstitial = (callback: () => void) => {
    if (window.AndroidNativeInterface?.showInterstitialAd) {
      try {
        console.log(`[AdMob] Triggering native interstitial ad`);
        window.AndroidNativeInterface.showInterstitialAd();
      } catch (err) {
        console.error("Gagal memanggil native AdMob Interstitial:", err);
      }
    }
    callback();
  };

  const timerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- AUDIO SYSTEM ---
  const playSound = (type: 'TICK' | 'CORRECT' | 'WRONG' | 'TIMEOUT') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'TICK') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'CORRECT') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2); // E5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'WRONG') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now); // A3
        osc.frequency.linearRampToValueAtTime(110, now + 0.3); // A2
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'TIMEOUT') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.8);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
      }
    } catch (e) {
      console.warn("Audio playback failed", e);
    }
  };

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (gameState === 'PLAYING' && !isLoading && !isAnswerRevealed && currentMCQuestion && !answerPopup) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          // Play tick sound in last 10 seconds
          if (prev <= 11) {
            playSound('TICK');
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState, isLoading, isAnswerRevealed, currentMCQuestion, answerPopup]);

  const handleTimeOut = () => {
    setIsAnswerRevealed(true);
    playSound('TIMEOUT');
    setAnswerPopup({ show: true, isCorrect: false });
  };

  const handleStartGame = (topicLabel: string) => {
    setSelectedTopic(topicLabel);
    setGameState('PLAYING');
    setScore(0);
    setSessionCorrectCount(0);
    setLastRewardedMilestone(0);
    loadNewQuestion(topicLabel);
  };

  const [dbQuestions, setDbQuestions] = useState<QuizData[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([]);

  useEffect(() => {
    const unsub = subscribeToQuizzes((data) => {
      setDbQuestions(data as QuizData[]);
    });
    return () => unsub();
  }, []);

  const loadNewQuestion = async (topicLabel: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsLoading(true);
    setError(null);
    setSelectedMCOption(null);
    setIsAnswerRevealed(false);
    setAnswerPopup(null);
    setTimeLeft(TIME_LIMIT);
    
    let actualTopic = topicLabel;
    if (topicLabel === 'Campuran') {
       const randomIndex = Math.floor(Math.random() * TOPICS.length);
       actualTopic = TOPICS[randomIndex].label;
    }

    try {
       // Combine Firestore DB questions + Static default quiz bank
       const allQuestions: QuizQuestion[] = [
         ...dbQuestions.map(q => ({
            question: q.question,
            options: q.options,
            correctIndex: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
            explanation: q.explanation || "Soal dari Bank Soal SantriAI",
            topic: q.topic || "Umum"
         })),
         ...DEFAULT_QUIZ_BANK.map(q => ({
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation || "Soal dari Bank Soal SantriAI",
            topic: q.topic
         }))
       ];

       // Filter by topic if not 'Campuran'
       let matching = allQuestions.filter(q => topicLabel === 'Campuran' ? true : (q.topic === actualTopic || q.topic === topicLabel));
       if (matching.length === 0) {
         matching = allQuestions; // fallback to all
       }

       // Avoid recently used questions if possible
       const unused = matching.filter(q => !usedQuestionIds.includes(q.question));
       const candidates = unused.length > 0 ? unused : matching;

       const selected = candidates[Math.floor(Math.random() * candidates.length)];
       
       if (selected) {
         setUsedQuestionIds(prev => [...prev.slice(-20), selected.question]);
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

  const handleMCAnswer = (index: number) => {
    if (isAnswerRevealed || !currentMCQuestion) return;
    setSelectedMCOption(index);
    const isCorrect = index === currentMCQuestion.correctIndex;
    setIsAnswerRevealed(true);
    setAnswerPopup({ show: true, isCorrect });
    
    if (isCorrect) {
      setScore(prev => prev + 100); 
      setSessionCorrectCount(prev => prev + 1);
      playSound('CORRECT');
    } else {
      playSound('WRONG');
    }
  };

  const handleNext = () => {
    if (sessionCorrectCount > 0 && sessionCorrectCount % 5 === 0 && lastRewardedMilestone !== sessionCorrectCount) {
      setShowRewardAdModal(true);
      return;
    }
    if (selectedTopic) loadNewQuestion(selectedTopic);
  };

  const handleWatchRewardAd = () => {
    setLastRewardedMilestone(sessionCorrectCount);
    setShowRewardAdModal(false);
    if (window.AndroidNativeInterface?.showRewardedAd) {
      window.onRewardGranted = () => {
        if (selectedTopic) loadNewQuestion(selectedTopic);
      };
      try {
        window.AndroidNativeInterface.showRewardedAd();
      } catch (err) {
        console.error("Gagal memanggil native AdMob Rewarded Ad:", err);
        if (selectedTopic) loadNewQuestion(selectedTopic);
      }
    } else {
      if (selectedTopic) loadNewQuestion(selectedTopic);
    }
  };

  const handleRewardModalQuit = () => {
    setShowRewardAdModal(false);
    handleQuit();
  };

  const handleQuit = () => {
    setGameState('MENU');
    setCurrentMCQuestion(null);
  };

  const handleRedeemClick = () => {
    setShowLoginModal(true);
  };

  const getTopicCardStyle = (id: string) => {
    switch (id) {
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

  const getColorClass = (color: string) => {
    const colors: {[key: string]: string} = {
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200',
      emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200',
      indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200',
      amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200',
      teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200',
      rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200',
      violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200',
      purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200',
      pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200',
      orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200',
      cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200',
      green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200',
    };
    return colors[color] || colors['emerald'];
  };

  if (authLoading) {
      return (
          <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-32 flex flex-col animate-fade-in">
      
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 text-white shadow-md border-b border-purple-700/40 px-4 py-3.5">
         <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="p-2 -ml-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95">
                  <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-200" /> Cerdas Cermat
              </h2>
            </div>
            {gameState === 'PLAYING' && (
                <div className="bg-white/20 text-white backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-sm">
                    <Trophy className="w-3.5 h-3.5 text-amber-300 inline mr-0.5" />{score}
                </div>
            )}
         </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 py-6 flex-grow flex flex-col">
         
         {gameState === 'MENU' && (
            <div className="space-y-6 animate-slide-up">
               <div className="text-center py-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                  <Trophy className="w-16 h-16 mx-auto text-purple-500 mb-4 bg-purple-50 rounded-full p-3" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mode Tamu</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto mb-6">
                    Main untuk asah wawasan. Poin tidak akan tersimpan.
                  </p>
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-full hover:bg-purple-100 transition-colors"
                  >
                    <LogIn size={16} /> Masuk untuk Simpan Poin
                  </button>
               </div>

               <button 
                onClick={() => handleStartGame('Campuran')}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 flex items-center justify-center gap-2 transition-transform"
               >
                <Shuffle className="w-5 h-5" />
                <span>Acak Topik (Random)</span>
               </button>

               <div className="grid grid-cols-2 gap-3">
                  {TOPICS.map((topic) => {
                    const style = getTopicCardStyle(topic.id);
                    return (
                      <button
                        key={topic.id}
                        onClick={() => handleStartGame(topic.label)}
                        className={`p-4 rounded-3xl border shadow-sm active:scale-95 transition-all flex flex-col justify-between overflow-hidden group relative text-left hover:shadow-md ${style.cardBg}`}
                      >
                         <div className="mb-3 flex items-center justify-between">
                            <span className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm ${style.iconBg}`}>
                               {style.icon}
                            </span>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${style.badgeBg}`}>
                               Kuis
                            </span>
                         </div>
                         <div>
                            <h4 className={`font-black text-xs sm:text-sm tracking-tight line-clamp-1 ${style.textColor}`}>
                               {topic.label}
                            </h4>
                            <p className={`text-[10px] font-bold uppercase mt-0.5 tracking-wide ${style.subTextColor}`}>
                               Mulai Belajar
                            </p>
                         </div>
                      </button>
                    );
                  })}
               </div>

                   <div className="mt-4 bg-white dark:bg-gray-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                       <div className="flex items-center gap-2 mb-4">
                          <Gift className="w-5 h-5 text-amber-500" />
                          <h3 className="font-bold text-slate-800 dark:text-slate-100">Tukar Wasilah Santri</h3>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-3">
                          {REWARD_PRODUCTS.map((reward) => (
                             <button 
                               key={reward.id} 
                               onClick={handleRedeemClick}
                               className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 relative group overflow-hidden text-left hover:border-purple-200 transition-all"
                             >
                                <div className="text-3xl mb-2 text-center py-2">{reward.icon}</div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-xs mb-1 line-clamp-1">{reward.name}</h4>
                                <div className="flex items-center gap-1 text-amber-500">
                                   <Gem size={10} className="fill-current text-cyan-400" />
                                   <span className="text-xs font-bold">{reward.points.toLocaleString()}</span>
                                </div>
                             </button>
                          ))}
                       </div>
                   </div>
            </div>
         )}

         {gameState === 'PLAYING' && (
            <div className="flex-1 flex flex-col">
               {/* Progress Bar with Timer */}
               {!isLoading && !isAnswerRevealed && (
                  <div className="mb-4 flex items-center gap-3 px-2">
                     <Timer className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                     <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeLeft <= 10 ? 'bg-red-500' : 'bg-green-500'}`} 
                          style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
                        ></div>
                     </div>
                     <span className={`text-sm font-black w-8 text-right font-mono ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-500'}`}>{timeLeft}</span>
                  </div>
               )}

               {isLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                     <Loader2 size={48} className="text-purple-600 animate-spin" />
                     <p className="text-gray-500">Menyiapkan soal...</p>
                  </div>
               ) : error ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                     <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                     <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
                     <button onClick={() => selectedTopic && loadNewQuestion(selectedTopic)} className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold">Coba Lagi</button>
                  </div>
               ) : currentMCQuestion && (
                  <div className="flex flex-col h-full animate-slide-up">
                     <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-purple-100 dark:border-gray-700 shadow-lg mb-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-relaxed">{currentMCQuestion.question}</h3>
                     </div>
                     <div className="space-y-3 flex-1">
                        {currentMCQuestion.options.map((opt, idx) => {
                           let btnClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300";
                           if (isAnswerRevealed) {
                              if (idx === currentMCQuestion.correctIndex) btnClass = "bg-green-100 border-green-500 text-green-800";
                              else if (idx === selectedMCOption) btnClass = "bg-red-100 border-red-500 text-red-800";
                              else btnClass += " opacity-60";
                           } else if (selectedMCOption === idx) btnClass = "bg-purple-100 border-purple-500 text-purple-800";

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
                                    <span>{opt}</span>
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
                              <p className="text-sm text-gray-700 dark:text-gray-300">{currentMCQuestion.explanation}</p>
                           </div>
                           <button onClick={handleNext} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold shadow-lg">Soal Berikutnya</button>
                        </div>
                     )}
                     {!isAnswerRevealed && (
                        <div className="mt-6 flex justify-center">
                           <button onClick={handleQuit} className="text-gray-400 hover:text-red-500 text-sm font-medium">Keluar Permainan</button>
                        </div>
                     )}
                  </div>
               )}
            </div>
         )}

         {/* ANSWER RESULT MODAL */}
         {answerPopup && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-300 text-center">
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
                      ? 'Masya Allah! Jawaban Anda tepat. Poin bertambah, mari lanjutkan belajar!' 
                      : 'Maaf jawaban anda salah, tetap semangat silahkan coba lagi untuk soal berikutnya.'}
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

         {/* LOGIN MODAL */}
         {showLoginModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white dark:bg-gray-900 w-full max-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-300 text-center">
                  <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                     <User size={40} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Simpan Progresmu?</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed px-2">
                    Masuk ke akun untuk menyimpan skor tertinggi, peringkat, dan menukarkan poin hadiah.
                  </p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate('/settings')}
                      className="w-full py-3.5 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 dark:shadow-purple-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                      <LogIn size={18} /> Masuk / Daftar Akun
                    </button>
                    <button 
                      onClick={() => setShowLoginModal(false)}
                      className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95"
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
                      className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                      <Gift size={18} /> Tonton Iklan & Lanjutkan
                    </button>
                    <button 
                      onClick={handleRewardModalQuit}
                      className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95 flex items-center justify-center gap-2"
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
