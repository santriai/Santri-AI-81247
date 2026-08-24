
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  List, 
  AlignLeft, 
  Quote, 
  Share2, 
  Copy, 
  Check,
  Search,
  AlertCircle,
  Volume2,     
  StopCircle,   
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Coins,
  Gem,
  CalendarCheck,
  GraduationCap,
  Trophy
} from 'lucide-react';
import { askReligiousQuery } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { deductWasilahForAI } from '../services/firebase';
import { UserAvatar } from '../components/UserAvatar';
import { useHistory } from '../contexts/HistoryContext'; 
import { useAudio } from '../contexts/AudioContext'; 
import { v4 as uuidv4 } from 'uuid'; 
import CustomLoader from '../components/CustomLoader';
import { PLAYSTORE_LINK } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface ExplanationData {
  title: string;
  summary: string;
  points: string[];
  analysis: string;
  dalil?: string;
  source?: string;
}

const ExplanationScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { user, userData, loading: authLoading } = useAuth();
  const { addToHistory } = useHistory(); 

  useEffect(() => {
    if (!authLoading && !user) {
      showToast("Tanya Santri AI memerlukan login.", "info");
      navigate('/settings');
    }
  }, [user, authLoading, navigate, showToast]);
  const { isPlaying, currentTtsInfo, speakTts, prefetchTts, isLoading: isAudioLoading } = useAudio();
  const { query } = (location.state as { query: string }) || {};

  const [data, setData] = useState<ExplanationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasNoWasilah, setHasNoWasilah] = useState(false);
  const [rawText, setRawText] = useState('');
  const [copied, setCopied] = useState(false);
  const isSharing = useRef(false);
  const lastQueryRef = useRef<string | null>(null);

  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dalil: true,
    analysis: true,
    points: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (!query) {
      navigate('/kitab');
      return;
    }

    const fetchData = async () => {
      if (authLoading) return;
      if (!user) {
        showToast("Silakan login terlebih dahulu", "error");
        navigate('/settings');
        return;
      }
      if (!userData) {
        // Wait for userData to stream in from Firestore
        return;
      }
      if ((userData?.wasilah || 0) < 2) {
        setHasNoWasilah(true);
        setLoading(false);
        return;
      }

      // Avoid multiple execution for the same query
      if (lastQueryRef.current === query) {
        return;
      }
      lastQueryRef.current = query;

      setHasNoWasilah(false);
      setData(null); // Clear previous data immediately
      setLoading(true);
      window.scrollTo(0, 0);
      
      const prompt = `
        Bertindaklah sebagai ahli Kitab Kuning dan Ulama yang mendalam ilmunya.
        Analisis pertanyaan/topik berikut: "${query}"
        
        Sajikan jawaban dalam format JSON valid (tanpa markdown \`\`\`) dengan struktur:
        {
          "title": "Judul Topik/Bab yang Relevan (Singkat Padat)",
          "summary": "Ringkasan inti dari penjelasan (1-2 kalimat)",
          "points": ["Poin utama 1", "Poin utama 2", "Poin utama 3", "dst..."],
          "analysis": "Penjelasan mendalam dan komprehensif (paragraf panjang, boleh ada line break)",
          "dalil": "Teks Arab/Ibarah Kitab yang relevan (jika ada, jika tidak kosongkan)",
          "source": "Nama Kitab / Referensi Rujukan"
        }
      `;

      try {
        const result = await askReligiousQuery('kitab', prompt);
        await deductWasilahForAI(user.uid, 2, `Tanya AI - ${query}`);
        showToast("Berhasil memproses jawaban! (Dipotong 2 Wasilah)", "success");
        setRawText(result);

        const cleanJson = result.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
        
        let parsedData: ExplanationData;
        try {
            parsedData = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error("JSON Parse Error", parseError);
            parsedData = {
                title: query,
                summary: "Penjelasan dari AI",
                points: [],
                analysis: result,
                source: "Analisis AI Santri"
            };
        }
        
        setData(parsedData);

        addToHistory({
            id: uuidv4(),
            type: 'kitab', 
            title: parsedData.title || query,
            subtitle: parsedData.summary,
            timestamp: new Date().toISOString(),
            path: '/explanation',
            data: { query: query } 
        });

      } catch (error) {
        console.error("AI Error", error);
        showToast("Gagal memuat analisis AI", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, navigate, addToHistory, showToast, location.key, user, userData, authLoading]);

  // Trigger Prefetch when data is loaded
  useEffect(() => {
    if (data) {
      if (data.analysis) prefetchTts(data.analysis, false);
      if (data.dalil) prefetchTts(data.dalil, true);
    }
  }, [data, prefetchTts]);

  const handleCopy = () => {
    const text = data 
      ? `*${data.title}*\n\n${data.summary}\n\n${data.analysis}\n\nSumber: ${data.source}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`
      : `${rawText}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Disalin ke clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (isSharing.current) return;
    isSharing.current = true;

    const text = data 
      ? `*${data.title}*\n\n${data.summary}\n\n${data.analysis}\n\nSumber: ${data.source}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`
      : `${rawText}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
    const title = data?.title || 'Penjelasan Kitab';

    if (window.AndroidNativeInterface?.shareText) {
      try {
        window.AndroidNativeInterface.shareText(title, text);
      } catch (e) {
        handleCopy();
      } finally {
        isSharing.current = false;
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
           handleCopy();
        }
      } finally {
        isSharing.current = false;
      }
    } else {
      handleCopy();
      isSharing.current = false;
    }
  };

  const handleSpeakText = async (text: string | undefined, id: string, isArabic: boolean) => {
    if (!text) return;
    speakTts(text, isArabic, data?.title || "Penjelasan Santri", id);
  };

  const handleGlobalSearch = () => {
    if (!globalSearchQuery.trim()) return;
    navigate('/explanation', { state: { query: globalSearchQuery } });
    setGlobalSearchQuery(''); 
  };

  return (
    <div key={query} className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans">
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
            <button 
                onClick={() => navigate(-1)} 
                className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
                <ArrowLeft size={24} />
            </button>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                <Sparkles size={20} className="text-amber-500" />
                Penjelasan AI
            </h2>
        </div>
        <div className="flex items-center gap-2">
            {!loading && data && (
                <div className="flex gap-1">
                    <button onClick={handleCopy} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                    </button>
                    <button onClick={handleShare} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <Share2 size={20} />
                    </button>
                </div>
            )}
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

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        
        <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-santri-green/60 dark:border-santri-gold shadow-sm flex gap-2 transition-colors">
            <div className="flex-1 flex items-center px-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
               <Search size={20} strokeWidth={3} className="text-slate-400 dark:text-slate-500 mr-2" />
               <input 
                type="text" 
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Cari penjelasan topik lain..."
                className="flex-1 bg-transparent py-2.5 outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium"
                onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
              />
            </div>
            <button 
              onClick={handleGlobalSearch}
              disabled={!globalSearchQuery.trim()}
              className="bg-santri-green text-white px-5 rounded-lg font-bold text-sm disabled:opacity-50 active:scale-95 transition-transform shadow-sm shadow-green-200 dark:shadow-green-900/30 flex items-center justify-center min-w-[70px]"
            >
              Cari
            </button>
        </div>


        {loading ? (
             <CustomLoader message={`Sedang membedah topik: "${query}"`} />
        ) : hasNoWasilah ? (
             <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 rounded-3xl p-6 shadow-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="text-center space-y-3">
                 <div className="mx-auto w-16 h-16 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-500 flex items-center justify-center shadow-inner animate-pulse">
                   <Gem size={32} className="text-cyan-400 fill-cyan-400/20" />
                 </div>
                 <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Wasilah Anda Tidak Cukup</h2>
                 <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                   Fitur <span className="font-bold text-slate-800 dark:text-slate-200">Tanya Santri AI</span> membutuhkan <span className="font-bold text-amber-600 dark:text-amber-500">2 Wasilah</span> per pertanyaan untuk menghadirkan jawaban dari kecerdasan buatan Islami kami.
                 </p>
                 <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/20 rounded-xl text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed max-w-sm mx-auto">
                   💡 Sisa Wasilah Anda saat ini: <span className="font-extrabold text-base bg-amber-500 text-white px-2 py-0.5 rounded-full inline-block ml-1">0</span>
                 </div>
               </div>

               <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Dapatkan Wasilah Gratis / Top Up:</h3>
                 
                 {/* Option 1: Daily Attendance */}
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl gap-3 hover:translate-x-1 transition-transform duration-200">
                   <div className="flex items-start gap-3">
                     <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mt-0.5">
                       <CalendarCheck size={20} />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Absensi Harian</h4>
                       <p className="text-xs text-slate-500 dark:text-slate-400">Dapatkan +1 Wasilah & +10 XP gratis setiap hari.</p>
                     </div>
                   </div>
                   <button 
                     onClick={() => navigate('/settings', { state: { triggerCheckIn: true } })}
                     className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all text-center"
                   >
                     Mulai Absen
                   </button>
                 </div>

                 {/* Option 2: Quiz Game */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl gap-3 hover:translate-x-1 transition-transform duration-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mt-0.5">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Bermain Cerdas Cermat</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Jawab kuis keislaman untuk mengumpulkan poin & Wasilah gratis.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate("/quiz")}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all text-center"
                    >
                      Bermain Kuis
                    </button>
                  </div>

                  {/* Option 3: Santri Miliarder */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl gap-3 hover:translate-x-1 transition-transform duration-200">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 mt-0.5">
                        <Trophy size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Santri Miliarder</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Tantang 100 tingkat ilmu keislaman & raih bonus Wasilah melimpah.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate("/quiz-game")}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all text-center"
                    >
                      Main Miliarder
                    </button>
                  </div>

                  {/* Option 3: Top Up Wasilah */}
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl gap-3 hover:translate-x-1 transition-transform duration-200">
                   <div className="flex items-start gap-3">
                     <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 mt-0.5">
                       <Gem size={20} className="text-cyan-500 fill-cyan-500/20 animate-pulse" />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Top Up Wasilah Instan</h4>
                       <p className="text-xs text-slate-500 dark:text-slate-400">Dukung operasional aplikasi melalui pembelian via Google Play.</p>
                     </div>
                   </div>
                   <button 
                     onClick={() => navigate('/wasilah-shop')}
                     className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm shadow-amber-200 dark:shadow-none active:scale-95 transition-all text-center"
                   >
                     Top Up Sekarang
                   </button>
                 </div>
               </div>

               <div className="text-center pt-2">
                 <button 
                   onClick={() => navigate(-1)} 
                   className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:underline transition-all"
                 >
                   Kembali ke halaman sebelumnya
                 </button>
               </div>
             </div>
        ) : data ? (
             <div className="space-y-5 animate-in slide-in-from-bottom-8 duration-500">
                
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><BookOpen size={100} className="text-amber-500" /></div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-2 block flex items-center gap-2">
                        <Search size={14} /> Topik Pembahasan
                    </span>
                    <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100 leading-tight mb-2 relative z-10">
                        {data.title}
                    </h1>
                    {data.source && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 relative z-10">
                            <BookOpen size={12} />
                            Rujukan: {data.source}
                        </div>
                    )}
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-center gap-3 mb-3">
                        <Lightbulb size={20} className="text-amber-600 dark:text-amber-500" />
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Intisari</h3>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                        {data.summary}
                    </p>
                </div>

                {data.dalil && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div 
                            onClick={() => toggleSection('dalil')}
                            className="w-full flex items-center justify-between p-5 text-left bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <Quote size={20} className="text-santri-green" />
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-xs">Matan / Ibarah Dalil</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSpeakText(data.dalil, 'dalil', true);
                                    }} 
                                    className={`p-2 rounded-full transition-colors shrink-0 ${
                                        currentTtsInfo?.id === 'dalil' 
                                            ? 'bg-green-100 text-santri-green dark:bg-green-900/30 dark:text-santri-gold' 
                                            : 'text-slate-400 hover:text-santri-green dark:hover:text-santri-gold'
                                    }`}
                                >
                                    {isAudioLoading && currentTtsInfo?.id === 'dalil' ? <Loader2 size={18} className="animate-spin" /> : currentTtsInfo?.id === 'dalil' && isPlaying ? <StopCircle size={18} /> : <Volume2 size={18} />}
                                </button>
                                {expandedSections.dalil ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                            </div>
                        </div>
                        
                        <AnimatePresence>
                            {expandedSections.dalil && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-6 pt-2">
                                        <p className="font-arabic text-2xl leading-[2.5] text-right text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-inner" dir="rtl">
                                            {data.dalil}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div 
                        onClick={() => toggleSection('analysis')}
                        className="w-full flex items-center justify-between p-5 text-left bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <AlignLeft size={20} className="text-blue-600" />
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-xs">Analisis & Penjelasan Lengkap</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSpeakText(data.analysis, 'analysis', false);
                                }} 
                                className={`p-2 rounded-full transition-colors shrink-0 ${
                                    currentTtsInfo?.id === 'analysis' 
                                        ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' 
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                            >
                                {isAudioLoading && currentTtsInfo?.id === 'analysis' ? <Loader2 size={18} className="animate-spin" /> : currentTtsInfo?.id === 'analysis' && isPlaying ? <StopCircle size={18} /> : <Volume2 size={18} />}
                            </button>
                            {expandedSections.analysis ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                        </div>
                    </div>

                    <AnimatePresence>
                        {expandedSections.analysis && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 pt-2">
                                    <div className="prose prose-sm max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-justify whitespace-pre-line font-medium bg-indigo-50/20 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20">
                                        {data.analysis}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {data.points && data.points.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div 
                            onClick={() => toggleSection('points')}
                            className="w-full flex items-center justify-between p-5 text-left bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <List size={20} className="text-emerald-600 dark:text-emerald-400" />
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-xs">Poin-Poin Penting</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                {expandedSections.points ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                            </div>
                        </div>
                        
                        <AnimatePresence>
                            {expandedSections.points && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-6 pt-2">
                                        <ul className="space-y-3">
                                            {data.points.map((point, idx) => {
                                                const pointId = `point-${idx}`;
                                                const isCurrentSpeaking = currentTtsInfo?.id === pointId;

                                                return (
                                                    <li key={pointId}>
                                                        <div
                                                            onClick={() => navigate('/explanation', { state: { query: point } })}
                                                            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-left hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group active:scale-[0.98] cursor-pointer"
                                                        >
                                                            <div className="flex items-start gap-3 flex-1">
                                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                                    {idx + 1}
                                                                </span>
                                                                <span 
                                                                    className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors font-bold"
                                                                >
                                                                    {point}
                                                                </span>
                                                            </div>
                                                            
                                                            <button 
                                                                onClick={(e) => { 
                                                                    e.stopPropagation(); 
                                                                    handleSpeakText(point, pointId, false); 
                                                                }}
                                                                className={`p-2 rounded-full transition-colors shrink-0 ${
                                                                    isCurrentSpeaking 
                                                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                                        : 'text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                                                                }`}
                                                            >
                                                                {isAudioLoading && isCurrentSpeaking ? <Loader2 size={16} className="animate-spin" /> : isCurrentSpeaking && isPlaying ? <StopCircle size={16} /> : <Volume2 size={16} />}
                                                            </button>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

             </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
               <AlertCircle size={48} className="text-slate-300 mb-4" />
               <p className="text-slate-500 dark:text-slate-400 mb-4">Gagal memuat data.</p>
               <button onClick={() => navigate(-1)} className="text-santri-green font-bold">Kembali</button>
            </div>
        )}

      </div>
    </div>
  );
};

export default ExplanationScreen;
