
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, Sparkles, PenTool, Mic, Music, ImageIcon, Download, Share2, 
  ChevronRight, Play, Pause, Loader2, Save, Trash2, 
  Layers, Volume2, Type, Layout, Send, BookOpen, Quote,
  Newspaper, Music2, Image as ImageLucide, Languages,
  LanguagesIcon, ArrowLeft, Video, Film, Gem
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { deductWasilahForAI } from '../services/firebase';
import { 
  generateNewsAI, generateNasheedLyrics, generateMusicAI, 
  generateImageAI, generateSpeech, QUOTE_THEMES 
} from '../services/geminiService';

type CreatorTab = 'writer' | 'audio' | 'music' | 'visual' | 'video';

const IslamicCreatorScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, userData, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      showToast("Creator AI memerlukan login.", "info");
      navigate('/settings');
    }
  }, [user, authLoading, navigate, showToast]);

  const [activeTab, setActiveTab] = useState<CreatorTab | null>(null);
  const [loading, setLoading] = useState(false);

  // Writer State
  const [writerInput, setWriterInput] = useState('');
  const [writerResult, setWriterResult] = useState<any>(null);

  // Audio State
  const [audioInput, setAudioInput] = useState('');
  const [isArabic, setIsArabic] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Music State
  const [musicPrompt, setMusicPrompt] = useState('');
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [musicLyrics, setMusicLyrics] = useState<string | null>(null);
  const [musicType, setMusicType] = useState<'clip' | 'pro'>('clip');

  // Visual State
  const [visualPrompt, setVisualPrompt] = useState('');
  const [visualResult, setVisualResult] = useState<string | null>(null);
  const [visualRatio, setVisualRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [quoteText, setQuoteText] = useState('');

  // Video State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleGenerateWriter = async () => {
    if (!writerInput.trim()) return;
    if (!user) { showToast("Silakan login terlebih dahulu", "error"); return; }
    if ((userData?.wasilah || 0) < 2) {
      showToast("Sisa Wasilah Anda kurang (Butuh 2 Wasilah)!", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await generateNewsAI(writerInput);
      await deductWasilahForAI(user.uid, 2, "Pena Santri (Berita/Artikel)");
      setWriterResult(res);
      showToast('Berita Islami berhasil dibuat! (Dipotong 2 Wasilah)', 'success');
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!audioInput.trim()) return;
    if (!user) { showToast("Silakan login terlebih dahulu", "error"); return; }
    if ((userData?.wasilah || 0) < 3) {
      showToast("Sisa Wasilah Anda kurang (Butuh 3 Wasilah)!", "warning");
      return;
    }
    setLoading(true);
    try {
      const url = await generateSpeech(audioInput, isArabic);
      await deductWasilahForAI(user.uid, 3, "Suara Santri (Text to Speech)");
      setAudioUrl(url);
      showToast('Audio berhasil dibuat! (Dipotong 3 Wasilah)', 'success');
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim()) return;
    if (!user) { showToast("Silakan login terlebih dahulu", "error"); return; }
    if ((userData?.wasilah || 0) < 5) {
      showToast("Sisa Wasilah Anda kurang (Butuh 5 Wasilah)!", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await generateMusicAI(musicPrompt, musicType);
      await deductWasilahForAI(user.uid, 5, "Irama Islami (Nasyid AI)");
      setMusicUrl(res.audioUrl);
      setMusicLyrics(res.lyrics || null);
      showToast('Nasyid berhasil dibuat! (Dipotong 5 Wasilah)', 'success');
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVisual = async () => {
    if (!visualPrompt.trim()) return;
    if (!user) { showToast("Silakan login terlebih dahulu", "error"); return; }
    if ((userData?.wasilah || 0) < 5) {
      showToast("Sisa Wasilah Anda kurang (Butuh 5 Wasilah)!", "warning");
      return;
    }
    setLoading(true);
    try {
      const url = await generateImageAI(visualPrompt, visualRatio);
      await deductWasilahForAI(user.uid, 5, "Kanvas Dakwah (Visual AI)");
      setVisualResult(url);
      showToast('Visual berhasil dibuat! (Dipotong 5 Wasilah)', 'success');
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return;
    if (!user) { showToast("Silakan login terlebih dahulu", "error"); return; }
    if ((userData?.wasilah || 0) < 8) {
      showToast("Sisa Wasilah Anda kurang (Butuh 8 Wasilah)!", "warning");
      return;
    }
    setLoading(true);
    try {
      // Use cinematic image gen as a placeholder/teaser for video
      const url = await generateImageAI(videoPrompt + " cinematic lighting, ultra detailed, depth of field, video production style, masterwork", '16:9');
      await deductWasilahForAI(user.uid, 8, "Sinema Santri (Teaser Video)");
      setVideoResult(url);
      showToast('Teaser Video Santri berhasil dibuat! (Dipotong 8 Wasilah)', 'success');
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24">
      {/* Small Consistent Header with Islamic Pattern background */}
      <div 
        className="sticky top-0 z-30 text-white border-b border-emerald-900 px-4 py-3.5 shadow-md relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to right, #065f46, #022c22), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='%23fcd34d' stroke-opacity='0.18' stroke-width='1'%3E%3Crect x='35' y='35' width='30' height='30'/%3E%3Crect x='35' y='35' width='30' height='30' transform='rotate(45 50 50)'/%3E%3Ccircle cx='50' cy='50' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '100% 100%, 40px 40px',
          backgroundRepeat: 'no-repeat, repeat',
          backgroundBlendMode: 'overlay',
          backgroundColor: '#065f46'
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (activeTab) {
                  setActiveTab(null);
                } else {
                  navigate(-1);
                }
              }} 
              className="p-2 -ml-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="font-black text-lg text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" /> Studio Santri
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
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
      </div>

      {/* Grid Menu when activeTab is null */}
      {activeTab === null && (
        <div className="max-w-3xl mx-auto w-full px-4 py-5">
          <div className="mb-4 text-center md:text-left">
            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Selamat Datang di Studio Santri
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pilih instrumen kecerdasan buatan Islami di bawah ini untuk memulai karya kreatif dakwah Anda.
            </p>
            {/* New position for Wasilah with Blue Diamond icon */}
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-500/10 dark:bg-cyan-500/25 rounded-full border border-cyan-500/20 text-[11px] font-black text-cyan-700 dark:text-cyan-300">
              <Gem size={12} className="text-cyan-500 dark:text-cyan-400 animate-pulse fill-cyan-500/10" />
              <span>{(userData?.wasilah || 0).toLocaleString()} Wasilah Tersedia</span>
            </div>
          </div>

          {/* MATERI DAKWAH & ACARA HIGHLIGHT CARD */}
          <div 
            onClick={() => navigate('/speech-material')}
            className="mb-4 p-4 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 text-white shadow-xl shadow-emerald-900/20 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all relative overflow-hidden group border border-emerald-500/30"
          >
            <div className="flex items-center justify-between gap-3 relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wide">
                  <Sparkles size={11} className="fill-amber-300" /> Fitur Unggulan Baru
                </div>
                <h4 className="text-base sm:text-lg font-black leading-snug flex items-center gap-2">
                  <span>Materi Public Speaking & Acara Islami</span>
                </h4>
                <p className="text-xs text-emerald-100/90 font-medium max-w-lg leading-relaxed">
                  Ceramah, Panduan Qori, Kultum 7 Menit, Naskah MC, Sambutan & Khutbah Jumat/Hari Raya (Isra Mi'raj, Maulid, Idul Fitri/Adha, dll).
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 shrink-0 group-hover:bg-amber-400 group-hover:text-emerald-950 transition-all">
                <ChevronRight size={22} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              {
                id: 'writer' as CreatorTab,
                title: 'Pena Santri',
                subtitle: 'Hasilkan rilis berita Islami, artikel blog, dan tulisan dakwah otomatis.',
                icon: PenTool,
                cost: '2 Wasilah',
                color: 'text-white bg-white/20 border-white/20',
                bgClass: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white',
                borderClass: 'border-0',
                shadowClass: 'shadow-lg shadow-blue-500/15 dark:shadow-blue-950/30',
                hoverBorder: 'hover:scale-[1.02] active:scale-[0.98]'
              },
              {
                id: 'audio' as CreatorTab,
                title: 'Suara Santri',
                subtitle: 'Ubah tulisan kajian menjadi audio narasi jernih dengan tajwid indah.',
                icon: Mic,
                cost: '3 Wasilah',
                color: 'text-white bg-white/20 border-white/20',
                bgClass: 'bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 text-white',
                borderClass: 'border-0',
                shadowClass: 'shadow-lg shadow-purple-500/15 dark:shadow-purple-950/30',
                hoverBorder: 'hover:scale-[1.02] active:scale-[0.98]'
              },
              {
                id: 'music' as CreatorTab,
                title: 'Irama Islami',
                subtitle: 'Komposisikan nasyid, selawat syahdu, atau instrumen hadrah religi.',
                icon: Music,
                cost: '5 Wasilah',
                color: 'text-white bg-white/20 border-white/20',
                bgClass: 'bg-gradient-to-br from-rose-600 via-pink-600 to-orange-500 text-white',
                borderClass: 'border-0',
                shadowClass: 'shadow-lg shadow-rose-500/15 dark:shadow-rose-950/30',
                hoverBorder: 'hover:scale-[1.02] active:scale-[0.98]'
              },
              {
                id: 'visual' as CreatorTab,
                title: 'Kanvas Gambar',
                subtitle: 'Buat poster kutipan dakwah kreatif, kaligrafi estetik, atau visual kustom.',
                icon: ImageIcon,
                cost: '5 Wasilah',
                color: 'text-white bg-white/20 border-white/20',
                bgClass: 'bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 text-white',
                borderClass: 'border-0',
                shadowClass: 'shadow-lg shadow-amber-500/15 dark:shadow-amber-950/30',
                hoverBorder: 'hover:scale-[1.02] active:scale-[0.98]'
              },
              {
                id: 'video' as CreatorTab,
                title: 'Video Santri',
                subtitle: 'Hasilkan video pendek reels, teaser sinematik dakwah Islami.',
                icon: Video,
                cost: '8 Wasilah',
                color: 'text-white bg-white/20 border-white/20',
                bgClass: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white',
                borderClass: 'border-0',
                shadowClass: 'shadow-lg shadow-emerald-500/15 dark:shadow-emerald-950/30',
                hoverBorder: 'hover:scale-[1.02] active:scale-[0.98]'
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col justify-between text-left p-4 h-full ${item.bgClass} ${item.borderClass} ${item.shadowClass} rounded-[2rem] transition-all cursor-pointer group ${item.hoverBorder} relative overflow-hidden`}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className={`p-2 rounded-2xl border ${item.color}`}>
                        <Icon size={20} strokeWidth={2.5} />
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 bg-white/20 text-white rounded-lg border border-white/20 flex items-center gap-0.5">
                        <Gem size={8} className="text-white fill-current animate-pulse" />
                        {item.cost}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-white leading-tight mb-1">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-white/80 leading-snug line-clamp-3 font-medium">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 mt-3.5 text-[10px] font-black text-white bg-white/20 hover:bg-white/35 px-3 py-1.5 rounded-xl w-fit border border-white/10 transition-all">
                    <span>Mulai</span>
                    <ChevronRight size={10} strokeWidth={3} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-4 mt-3 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'writer' && (
            <motion.div 
              key="writer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <button 
                onClick={() => setActiveTab(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors"
              >
                <ArrowLeft size={14} /> Kembali ke Menu
              </button>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                    <Newspaper size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">Pena Santri</h2>
                      <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-extrabold rounded-full">2 Wasilah</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">AI News & Blog Generator</p>
                  </div>
                </div>

                <textarea
                  value={writerInput}
                  onChange={(e) => setWriterInput(e.target.value)}
                  placeholder="Masukkan topik atau link berita Islami..."
                  className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-santri-green outline-none transition-all text-xs"
                />

                <button
                  onClick={handleGenerateWriter}
                  disabled={loading || !writerInput.trim()}
                  className="w-full mt-3 py-3.5 bg-santri-green hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Brain size={16} />}
                  Buat Berita Islami (Sewa 2 Wasilah)
                </button>
              </div>

              {writerResult && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[9px] font-black rounded-full uppercase tracking-widest border border-emerald-100">
                      {writerResult.category}
                    </span>
                    <button 
                      onClick={() => {
                        const blob = new Blob([`${writerResult.title}\n\n${writerResult.content}`], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        handleDownload(url, `Berita_${writerResult.title.replace(/\s+/g, '_')}.txt`);
                      }}
                      className="p-1 px-2 text-slate-400 hover:text-santri-green"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">{writerResult.title}</h3>
                  <p className="text-xs font-bold text-slate-500 italic">"{writerResult.excerpt}"</p>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>
                  <div className="prose dark:prose-invert max-w-none">
                    {writerResult.content.split('\n').map((p: string, i: number) => (
                      <p key={i} className="text-slate-600 dark:text-slate-400 text-[13px] leading-relaxed mb-3">{p}</p>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'audio' && (
            <motion.div 
              key="audio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <button 
                onClick={() => setActiveTab(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors"
              >
                <ArrowLeft size={14} /> Kembali ke Menu
              </button>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
                    <Volume2 size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">Suara Santri</h2>
                      <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-extrabold rounded-full">3 Wasilah</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">AI Text-to-Speech Hub</p>
                  </div>
                </div>

                <div className="flex gap-1.5 mb-3 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                  <button 
                    onClick={() => setIsArabic(false)}
                    className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition-all ${!isArabic ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400'}`}
                  >
                    INDONESIA
                  </button>
                  <button 
                    onClick={() => setIsArabic(true)}
                    className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition-all ${isArabic ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400'}`}
                  >
                    ARABIC (TAJWEED)
                  </button>
                </div>

                <textarea
                  value={audioInput}
                  onChange={(e) => setAudioInput(e.target.value)}
                  placeholder={isArabic ? "Masukkan teks Arab untuk dibacakan..." : "Masukkan naskah untuk dikonversi menjadi audio..."}
                  className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-santri-green outline-none transition-all text-xs"
                />

                <button
                  onClick={handleGenerateAudio}
                  disabled={loading || !audioInput.trim()}
                  className="w-full mt-3 py-3.5 bg-santri-green hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Mic size={16} />}
                  Buat Audio Santri (Sewa 3 Wasilah)
                </button>
              </div>

              {audioUrl && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#004d00] p-5 rounded-3xl shadow-xl text-white space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                      <Volume2 size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-200">Hasil Audio</p>
                      <p className="text-xs font-bold truncate">Narrasi_{new Date().getTime()}.mp3</p>
                    </div>
                  </div>
                  
                  <audio controls src={audioUrl} className="w-full h-8 accent-santri-gold rounded-full" />
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDownload(audioUrl, `Audio_Santri_${new Date().getTime()}.mp3`)}
                      className="flex-1 py-2.5 bg-white text-emerald-950 rounded-lg font-bold text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      <Download size={14} /> Download MP3
                    </button>
                    <button 
                      onClick={() => setAudioUrl(null)}
                      className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'music' && (
            <motion.div 
              key="music"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <button 
                onClick={() => setActiveTab(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors"
              >
                <ArrowLeft size={14} /> Kembali ke Menu
              </button>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-900/20 rounded-xl text-rose-600">
                    <Music size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">Irama Islami</h2>
                      <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-extrabold rounded-full">5 Wasilah</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">AI Islamic Music Composer</p>
                  </div>
                </div>

                <div className="flex gap-1.5 mb-3 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                  <button 
                    onClick={() => setMusicType('clip')}
                    className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition-all ${musicType === 'clip' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400'}`}
                  >
                    30s CLIP (Demo)
                  </button>
                  <button 
                    onClick={() => setMusicType('pro')}
                    className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition-all ${musicType === 'pro' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400'}`}
                  >
                    FULL TRACK (Pro)
                  </button>
                </div>

                <textarea
                  value={musicPrompt}
                  onChange={(e) => setMusicPrompt(e.target.value)}
                  placeholder="Deskripsikan suasana musik (akustik syahdu...)"
                  className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-santri-green outline-none transition-all text-xs"
                />

                <button
                  onClick={handleGenerateMusic}
                  disabled={loading || !musicPrompt.trim()}
                  className="w-full mt-3 py-3.5 bg-santri-green hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Music2 size={16} />}
                  Komposisi Musik (Sewa 5 Wasilah)
                </button>
              </div>

              {musicUrl && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900 p-5 rounded-3xl shadow-xl text-white space-y-3 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg animate-bounce">
                      <Music2 size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Mastered Track</p>
                      <p className="text-xs font-bold truncate">Nasyid_AI_{new Date().getTime()}</p>
                    </div>
                  </div>

                  <audio controls src={musicUrl} className="w-full h-8 rounded-full" />
                  
                  {musicLyrics && (
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10 max-h-32 overflow-y-auto no-scrollbar">
                       <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Lirik Rekomendasi</p>
                       <p className="text-[11px] italic text-slate-300 leading-loose">{musicLyrics}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDownload(musicUrl, `Nasyid_Santri_${new Date().getTime()}.wav`)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                    >
                      <Download size={14} /> Download WAV
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'visual' && (
            <motion.div 
              key="visual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <button 
                onClick={() => setActiveTab(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors"
              >
                <ArrowLeft size={14} /> Kembali ke Menu
              </button>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600">
                    <ImageIcon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">Kanvas Da'wah</h2>
                      <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-extrabold rounded-full">5 Wasilah</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">AI Visual Hub</p>
                  </div>
                </div>

                <div className="flex gap-1.5 mb-3 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
                  {['1:1', '16:9', '9:16'].map(ratio => (
                    <button 
                      key={ratio}
                      onClick={() => setVisualRatio(ratio as any)}
                      className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition-all ${visualRatio === ratio ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400'}`}
                    >
                      {ratio === '1:1' ? 'SQUARE' : ratio === '16:9' ? 'LAND' : 'STORY'}
                    </button>
                  ))}
                </div>

                <textarea
                  value={visualPrompt}
                  onChange={(e) => setVisualPrompt(e.target.value)}
                  placeholder="Deskripsikan gambar (contoh: Masjid saat matahari terbit...)"
                  className="w-full h-20 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-santri-green outline-none transition-all text-xs"
                />

                <input 
                  type="text"
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  placeholder="Kutipan (opsional)..."
                  className="w-full mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-santri-green outline-none transition-all text-xs"
                />

                <button
                  onClick={handleGenerateVisual}
                  disabled={loading || !visualPrompt.trim()}
                  className="w-full mt-3 py-3.5 bg-santri-green hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
                  Buat Visual Santri (Sewa 5 Wasilah)
                </button>
              </div>

              {visualResult && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group rounded-3xl overflow-hidden shadow-2xl border-2 border-white dark:border-slate-800"
                >
                  <img 
                    src={visualResult} 
                    alt="Generated Visual" 
                    className="w-full h-auto object-cover max-h-[300px]"
                    referrerPolicy="no-referrer"
                  />
                  
                  {quoteText && (
                    <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/20 backdrop-blur-[1px]">
                       <p className="text-white text-center font-serif italic text-sm shadow-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] leading-relaxed">
                        "{quoteText}"
                       </p>
                    </div>
                  )}

                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button 
                      onClick={() => handleDownload(visualResult!, `Visual_Santri_${new Date().getTime()}.png`)}
                      className="p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl text-slate-800 dark:text-white shadow-lg active:scale-90 transition-all"
                    >
                      <Download size={16} />
                    </button>
                    <button 
                      onClick={() => setVisualResult(null)}
                      className="p-2.5 bg-red-500/90 backdrop-blur-md rounded-xl text-white shadow-lg active:scale-90 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'video' && (
            <motion.div 
              key="video"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <button 
                onClick={() => setActiveTab(null)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors"
              >
                <ArrowLeft size={14} /> Kembali ke Menu
              </button>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600">
                    <Video size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-sm font-black text-slate-800 dark:text-slate-100">Sinema Santri</h2>
                      <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 font-extrabold rounded-full">8 Wasilah</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">AI Video Reel Generator</p>
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 mb-3">
                   <div className="flex items-center gap-2 mb-1">
                      <Brain size={12} className="text-emerald-600" />
                      <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Tips Kreator</span>
                   </div>
                   <p className="text-[10px] text-emerald-600/80 leading-relaxed italic">
                      "Gunakan deskripsi suasana yang mendetail untuk hasil sinematik terbaik (misal: Sinar mentari menembus jendela masjid yang berdebu)."
                   </p>
                </div>

                <textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Deskripsikan video yang ingin Anda buat..."
                  className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 focus:border-santri-green outline-none transition-all text-xs"
                />

                <button
                  onClick={handleGenerateVideo}
                  disabled={loading || !videoPrompt.trim()}
                  className="w-full mt-3 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Film size={16} />}
                  Buat Video Santri (Beta - Sewa 8 Wasilah)
                </button>
              </div>

              {videoResult && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group rounded-3xl overflow-hidden shadow-2xl border-2 border-white dark:border-slate-800 bg-black aspect-video"
                >
                  <img 
                    src={videoResult} 
                    alt="Produced Video Frame" 
                    className={`w-full h-full object-cover transition-transform duration-[5s] ease-linear ${isVideoPlaying ? 'scale-110 translate-x-2' : 'scale-100 translate-x-0'}`}
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6">
                     <p className="text-white font-black text-sm uppercase tracking-widest mb-1">PROYEK VIDEO SELESAI</p>
                     <p className="text-white/70 text-[10px] truncate max-w-[80%] italic">"{videoPrompt}"</p>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                     <button 
                       onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                       className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white hover:scale-110 active:scale-90 transition-all group-hover:bg-white/30"
                     >
                       {isVideoPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                     </button>
                  </div>

                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => handleDownload(videoResult!, `Video_Santri_${new Date().getTime()}.png`)}
                      className="p-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl text-slate-800 dark:text-white shadow-lg active:scale-90 transition-all"
                    >
                      <Download size={16} />
                    </button>
                    <button 
                      onClick={() => setVideoResult(null)}
                      className="p-2.5 bg-red-500/90 backdrop-blur-md rounded-xl text-white shadow-lg active:scale-90 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IslamicCreatorScreen;
