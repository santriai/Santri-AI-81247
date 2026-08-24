
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Brain, 
  Layers, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Search,
  BookMarked,
  RefreshCw as RefreshIcon
} from 'lucide-react';
import { fetchEbookChapters } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';

interface Chapter {
  title: string;
  arabic: string;
  translation: string;
}

interface EbookData {
  profile: {
    name: string;
    originalTitle: string;
  };
  chapters: Chapter[];
}

const KITAB_LIST = [
  { id: 'safinatun-najah', name: 'Safinatun Najah', file: '/data/ebooks/safinatun-najah.json' },
  { id: 'matan-al-ajrumiyah', name: 'Al-Ajrumiyah', file: '/data/ebooks/matan-al-ajrumiyah.json' },
  { id: 'aqidatul-awam', name: 'Aqidatul Awam', file: '/data/ebooks/aqidatul-awam.json' },
  { id: 'alfiyah-ibnu-malik', name: 'Alfiyah Ibnu Malik', file: '/data/ebooks/alfiyah-ibnu-malik.json' },
  { id: 'sullamut-taufiq', name: 'Sullamut Taufiq', file: '/data/ebooks/sullamut-taufiq.json' },
  { id: 'matan-abu-syuja', name: 'Matan Abu Syuja', file: '/data/ebooks/matan-abu-syuja.json' },
];

const KitabLearningModuleScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [selectedKitab, setSelectedKitab] = useState<string | null>(null);
  const [ebookData, setEbookData] = useState<EbookData | null>(null);
  const [mode, setMode] = useState<'SELECT_KITAB' | 'SELECT_MODE' | 'FLASHCARDS' | 'QUIZ' | 'RESULT'>('SELECT_KITAB');
  const [loading, setLoading] = useState(false);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const fetchKitabData = async (kitabName: string, author: string = '') => {
    setLoading(true);
    try {
      const data = await fetchEbookChapters(kitabName, author);
      if (data && data.chapters) {
        setEbookData(data);
        setMode('SELECT_MODE');
      } else {
        throw new Error('Data tidak lengkap');
      }
    } catch (err) {
      showToast('Gagal memuat data kitab melalui Cloud/AI.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectKitab = (kitab: any) => {
    setSelectedKitab(kitab.name);
    fetchKitabData(kitab.name, kitab.author);
  };

  // Generate Quiz Questions
  const startQuiz = () => {
    if (!ebookData) return;
    const questions = ebookData.chapters
      .filter(ch => ch.arabic && ch.translation)
      .map((ch, idx, arr) => {
        // Simple multiple choice: "What is the translation of this Arabic?"
        const options = [ch.translation];
        while (options.length < 4) {
          const randomIdx = Math.floor(Math.random() * arr.length);
          const randomTrans = arr[randomIdx].translation;
          if (!options.includes(randomTrans)) {
            options.push(randomTrans);
          }
        }
        // Shuffle options
        const shuffledOptions = options.sort(() => Math.random() - 0.5);
        const correctIndex = shuffledOptions.indexOf(ch.translation);

        return {
          question: ch.arabic,
          options: shuffledOptions,
          correctIndex,
          title: ch.title
        };
      })
      .sort(() => Math.random() - 0.5)
      .slice(0, 10); // 10 questions per quiz

    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
    setMode('QUIZ');
  };

  const handleQuizAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    if (optionIndex === quizQuestions[currentQuestionIndex].correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      setMode('RESULT');
    }
  };

  const startFlashcards = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setMode('FLASHCARDS');
  };

  const filteredChapters = useMemo(() => {
    return ebookData?.chapters.filter(ch => ch.arabic && ch.translation) || [];
  }, [ebookData]);

  const renderContent = () => {
    switch (mode) {
      case 'SELECT_KITAB':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
              <h2 className="text-lg font-black text-slate-800 dark:text-white mb-2">Pilih Kitab Kuning</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kosakata & Kuis akan diambil dari teks asli kitab yang Anda pilih.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {KITAB_LIST.map((kitab, idx) => (
                <motion.button
                  key={kitab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectKitab(kitab)}
                  className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-santri-green/10 flex items-center justify-center text-santri-green group-hover:rotate-12 transition-transform">
                      <BookOpen size={24} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-800 dark:text-white">{kitab.name}</h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-0.5">Materi Terjemah</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300" />
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'SELECT_MODE':
        return (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-2 mb-8">
              <div className="w-20 h-20 bg-santri-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-santri-gold/30">
                <Brain size={40} className="text-santri-gold" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">{selectedKitab}</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Pilih Metode Belajar</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={startFlashcards}
                className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden group active:scale-95 transition-all text-left"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform"><BookMarked size={100} /></div>
                <h3 className="text-xl font-black mb-2">Flashcards</h3>
                <p className="text-indigo-100 text-[11px] font-medium leading-relaxed max-w-[70%]">Hafalkan potongan teks dan maknanya dengan kartu interaktif.</p>
                <div className="mt-6 inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-black backdrop-blur-md">
                  Mulai Belajar <ChevronRight size={14} />
                </div>
              </button>

              <button 
                onClick={startQuiz}
                className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 dark:shadow-none relative overflow-hidden group active:scale-95 transition-all text-left"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform"><Brain size={100} /></div>
                <h3 className="text-xl font-black mb-2">Kuis Interaktif</h3>
                <p className="text-emerald-100 text-[11px] font-medium leading-relaxed max-w-[70%]">Uji pemahaman Anda dengan soal-soal pilihan ganda.</p>
                <div className="mt-6 inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-black backdrop-blur-md">
                  Mulai Kuis <ChevronRight size={14} />
                </div>
              </button>
            </div>

            <button 
              onClick={() => setMode('SELECT_KITAB')}
              className="w-full py-4 text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors"
            >
              Ganti Kitab Lain
            </button>
          </div>
        );

      case 'FLASHCARDS':
        const currentCard = filteredChapters[currentCardIndex];
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center px-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Konten {currentCardIndex + 1} / {filteredChapters.length}</span>
              <div className="h-1.5 w-32 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-santri-green" style={{ width: `${((currentCardIndex + 1) / filteredChapters.length) * 100}%` }}></div>
              </div>
            </div>

            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative w-full h-[400px] perspective-1000 cursor-pointer"
            >
              <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-santri-green/20 p-8 flex flex-col items-center justify-center text-center shadow-xl">
                  <span className="text-[10px] font-black text-santri-green uppercase tracking-widest mb-6">Teks Arab</span>
                  <p className="font-arabic text-3xl leading-loose text-slate-800 dark:text-white" dir="rtl">{currentCard?.arabic}</p>
                  <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Ketuk untuk Lihat Terjemah</p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-santri-green rounded-[3rem] p-8 flex flex-col items-center justify-center text-center shadow-xl text-white">
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-6">Terjemahan</span>
                  <p className="text-lg font-bold leading-relaxed">{currentCard?.translation}</p>
                  <p className="mt-8 text-[10px] text-white/60 font-bold uppercase tracking-tighter">Ketuk untuk Kembali</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 px-4">
              <button 
                onClick={(e) => { e.stopPropagation(); if (currentCardIndex > 0) { setCurrentCardIndex(prev => prev - 1); setIsFlipped(false); } }}
                disabled={currentCardIndex === 0}
                className={`flex-1 py-4 rounded-3xl font-black text-sm transition-all flex items-center justify-center gap-2 ${currentCardIndex === 0 ? 'bg-slate-100 text-slate-300' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-white border border-slate-200'}`}
              >
                <ChevronLeft size={18} /> Prev
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); if (currentCardIndex < filteredChapters.length - 1) { setCurrentCardIndex(prev => prev + 1); setIsFlipped(false); } }}
                disabled={currentCardIndex === filteredChapters.length - 1}
                className={`flex-1 py-4 rounded-3xl font-black text-sm transition-all flex items-center justify-center gap-2 ${currentCardIndex === filteredChapters.length - 1 ? 'bg-slate-100 text-slate-300' : 'bg-santri-green text-white shadow-lg shadow-green-100'}`}
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
        );

      case 'QUIZ':
        const currentQ = quizQuestions[currentQuestionIndex];
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center px-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pertanyaan {currentQuestionIndex + 1} / {quizQuestions.length}</span>
                <span className="text-xs font-bold text-santri-green">Skor: {score}</span>
              </div>
              <div className="h-1.5 w-32 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl text-center">
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full uppercase tracking-tighter mb-4 inline-block">{currentQ?.title || 'Fikih'}</span>
              <p className="font-arabic text-2xl leading-loose text-slate-800 dark:text-white mt-4" dir="rtl">{currentQ?.question}</p>
              <p className="text-xs text-slate-400 font-bold mt-6 uppercase tracking-widest">Apa terjemahan yang tepat?</p>
            </div>

            <div className="space-y-3">
              {currentQ?.options.map((opt: string, idx: number) => {
                let btnStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300";
                if (isAnswered) {
                  if (idx === currentQ.correctIndex) btnStyle = "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200";
                  else if (idx === selectedOption) btnStyle = "bg-red-500 text-white border-red-500 shadow-lg shadow-red-200";
                  else btnStyle = "opacity-40 grayscale-[0.5]";
                } else if (selectedOption === idx) {
                  btnStyle = "border-emerald-500 ring-2 ring-emerald-500/20";
                }

                return (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuizAnswer(idx)}
                    className={`w-full p-5 rounded-3xl border-2 text-left text-sm font-bold transition-all relative ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] uppercase font-black shrink-0 ${isAnswered && idx === currentQ.correctIndex ? 'bg-white text-emerald-600' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isAnswered && idx === currentQ.correctIndex && <CheckCircle2 size={20} className="shrink-0" />}
                      {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && <XCircle size={20} className="shrink-0" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {isAnswered && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={nextQuestion}
                className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black shadow-xl shadow-emerald-100 dark:shadow-none flex items-center justify-center gap-2"
              >
                Pertanyaan Selanjutnya <ChevronRight size={18} />
              </motion.button>
            )}
          </div>
        );

      case 'RESULT':
        const percentage = (score / quizQuestions.length) * 100;
        return (
          <div className="text-center space-y-8 animate-in zoom-in-95 duration-500 py-10">
            <div className="relative inline-block">
              <div className="w-40 h-40 bg-santri-gold/10 rounded-full flex items-center justify-center mx-auto border-4 border-santri-gold/20">
                <Trophy size={80} className="text-santri-gold" />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-2xl font-black p-4 rounded-3xl shadow-xl border-4 border-white"
              >
                {Math.round(percentage)}%
              </motion.div>
            </div>

            <div className="space-y-2 px-6">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white">Alhamdulillah!</h2>
              <p className="text-sm font-medium text-slate-500">Anda berhasil menjawab {score} dari {quizQuestions.length} pertanyaan dengan benar dari Kitab {selectedKitab}.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 px-4 pt-6">
              <button 
                onClick={startQuiz}
                className="py-4 bg-emerald-600 text-white rounded-3xl font-black text-sm shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} /> Coba Lagi
              </button>
              <button 
                onClick={() => setMode('SELECT_MODE')}
                className="py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-white rounded-3xl font-black text-sm border border-slate-200 flex items-center justify-center gap-2"
              >
                Pilih Mode
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <div className="bg-santri-green p-6 rounded-b-[2.5rem] shadow-lg sticky top-0 z-[100] backdrop-blur-md bg-opacity-95">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <button 
            onClick={() => {
              if (mode === 'SELECT_KITAB') navigate(-1);
              else if (mode === 'SELECT_MODE') setMode('SELECT_KITAB');
              else if (mode === 'FLASHCARDS' || mode === 'QUIZ' || mode === 'RESULT') setMode('SELECT_MODE');
            }} 
            className="p-2.5 bg-white/20 rounded-2xl text-white outline-none active:scale-90 transition-transform border border-white/10"
          >
            <ArrowLeft size={20}/>
          </button>
          <div>
            <h1 className="text-lg font-black text-white leading-tight">Modul Belajar Kitab</h1>
            <p className="text-[10px] uppercase tracking-widest font-black text-green-100 opacity-80">Flashcard & Kuis Interaktif</p>
          </div>
          {loading && <RefreshIcon size={20} className="text-white animate-spin ml-auto" />}
        </div>
      </div>

      <div className="px-6 mt-8 max-w-2xl mx-auto">
        {renderContent()}
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default KitabLearningModuleScreen;
