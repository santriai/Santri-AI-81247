
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Send, Brain, User, 
  ChevronRight, BookOpen, HeartPulse, Scroll, 
  Paperclip, Smile,
  Loader2, Mic, X, BookHeart, Trophy, MapPin, Calculator,
  Copy, Volume2, Share2, MessageSquareText, Lightbulb, History, Zap,
  Search, Play, RefreshCw, AudioLines, Moon, Trash2, Coins, ArrowRight,
  Gem, ExternalLink, CalendarCheck, GraduationCap, Crown, Gamepad2,
  Star, Flag, Sparkles
} from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { openExternalLink, shareWaGroup } from '../utils/linkUtils';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { GEMINI_MODEL, PLAYSTORE_LINK } from '../constants';
import { saveToGitHub, fetchFromGitHub, fetchSimilarFromGitHub } from '../services/githubDataService';
import { getRotatedGeminiClient, getRotatedGeminiModel } from '../services/geminiService';
import ConfirmationModal from '../components/ConfirmationModal';
import { ContentReportModal } from '../components/ContentReportModal';
import { deductWasilahForAI } from '../services/firebase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  recommendations?: any[];
}

interface ChatAiScreenProps {
  settings: any;
}

const ICON_MAP: Record<string, any> = {
  BookOpen,
  HeartPulse,
  BookHeart,
  Calculator,
  Scroll,
  Moon,
  MapPin,
  Trophy,
  Sparkles
};

const SUGGESTIONS = [
  { 
    label: 'Panduan Penggunaan', 
    iconName: 'BookOpen', 
    color: 'text-emerald-600 dark:text-emerald-400',
    isGuideNav: true,
    desc: 'Buku panduan lengkap & petunjuk penggunaan fitur'
  },
  { 
    label: 'Tanya Hukum Fiqih', 
    iconName: 'BookOpen', 
    color: 'text-emerald-500',
    desc: 'Konsultasikan masalah ibadah, bersuci & muamalah'
  },
  { 
    label: 'Tanya Fitur Aplikasi Santri AI', 
    iconName: 'Sparkles', 
    color: 'text-amber-500',
    desc: 'Jelajahi berbagai fitur & fasilitas islami kami'
  },
  { 
    label: 'Cek Jadwal Sholat', 
    iconName: 'HeartPulse', 
    color: 'text-rose-500',
    desc: 'Jadwal sholat presisi otomatis sesuai lokasi Anda'
  },
  { 
    label: 'Cari Doa Harian', 
    iconName: 'BookHeart', 
    color: 'text-cyan-500',
    desc: 'Kumpulan doa shahih untuk amalan harian'
  },
];

const APP_FEATURES_MAP = [
  { keywords: ['quran', 'ngaji', 'baca', 'surat', 'ayat', 'mushaf', 'tilawah', 'al quran', 'alquran', 'baca quran', 'tafsir', 'tajwid', 'surah'], label: 'Al-Quran Digital', path: '/quran', iconName: 'BookOpen', color: 'bg-emerald-500' },
  { keywords: ['doa', 'dzikir', 'wirid', 'istighfar', 'tasbih', 'sholawat', 'selawat', 'tahlil', 'zikir'], label: 'Kumpulan Doa', path: '/doa', iconName: 'BookHeart', color: 'bg-cyan-500' },
  { keywords: ['hadis', 'hadits', 'bukhari', 'muslim', 'sunnah', 'perkataan nabi', 'sabda', 'riwayat', 'shahih'], label: 'Hadis Utama', path: '/hadis', iconName: 'Scroll', color: 'bg-indigo-500' },
  { keywords: ['hukum', 'fatwa', 'syariat', 'halal', 'haram', 'fiqih', 'bolehkah', 'sah', 'batal', 'najis', 'suci', 'makruh', 'wajib', 'fardhu', 'sunnah', 'mubah'], label: 'Hukum & Fatwa', path: '/fatwa', iconName: 'Scroll', color: 'bg-amber-600' },
  { keywords: ['zakat', 'harta', 'hitung', 'mal', 'fitrah', 'kalkulator', 'nishab', 'nisab', 'perak', 'emas', 'penghasilan', 'kalkulator zakat'], label: 'Kalkulator Zakat', path: '/zakat', iconName: 'Calculator', color: 'bg-amber-500' },
  { keywords: ['ramadhan', 'puasa', 'imsakiyah', 'tarawih', 'fidyah', 'tebus', 'buka puasa', 'sahur', 'takjil'], label: 'Ramadhan Hub & Fidyah', path: '/ramadhan', iconName: 'Moon', color: 'bg-emerald-600' },
  { keywords: ['sholat', 'jadwal', 'waktu sholat', 'subuh', 'dzuhur', 'ashar', 'maghrib', 'isya', 'adzan', 'azan', 'waktu', 'jam sholat', 'solat'], label: 'Jadwal Sholat', path: '/prayer-times', iconName: 'HeartPulse', color: 'bg-rose-500' },
  { keywords: ['kiblat', 'arah kiblat', 'kompas', 'kakbah', 'ka\'bah', 'makkah', 'mecca'], label: 'Arah Kiblat', path: '/qibla', iconName: 'MapPin', color: 'bg-blue-500' },
  { keywords: ['juara', 'top', 'poin', 'ranking', 'leaderboard', 'peringkat', 'skor', 'wasilah'], label: 'Top Santri', path: '/leaderboard', iconName: 'Trophy', color: 'bg-amber-400' },
];

const ChatAiScreen: React.FC<ChatAiScreenProps> = ({ settings }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { user, userData, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      showToast("Tanya Santri memerlukan login.", "info");
      navigate('/settings');
    }
  }, [user, authLoading, navigate, showToast]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('santriai_chat_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [isTyping, setIsTyping] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [activeVoice, setActiveVoice] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNoWasilahModal, setShowNoWasilahModal] = useState(false);
  const [reportSnippet, setReportSnippet] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const localHistory = useMemo(() => {
    return messages.filter(m => m.role === 'user').reverse().slice(0, 20);
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('santriai_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const initialQuery = location.state?.query;
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, [location.state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedText]);

  // Auto-focus input field on mount or navigation to trigger mobile keyboard / typing mode (like Gemini)
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 250);
    return () => clearTimeout(focusTimer);
  }, []);

  const findRecommendations = (text: string) => {
    const lowerText = text.toLowerCase();
    return APP_FEATURES_MAP.filter(feature => 
      feature.keywords.some(keyword => lowerText.includes(keyword))
    );
  };

  const sanitizeResponse = (text: string, isFinal: boolean = false): string => {
    if (!text) return '';
    
    let cleaned = text;

    // Replace blockquote markers like "> " or ">" at the beginning of lines
    cleaned = cleaned.replace(/^\s*>\s*/gm, '');

    // Strip any literal HTML blockquote tags
    cleaned = cleaned.replace(/<\/?blockquote>/gi, '');

    // Strip/replace markdown headers like #, ##, ###, ####, etc.
    cleaned = cleaned.replace(/#+/g, '');

    // Strip markdown bold/italic markers (* or **) but keep the text
    cleaned = cleaned.replace(/\*+/g, '');

    // Make list items look neat: if lines start with "- " or "* ", replace with "• "
    cleaned = cleaned.replace(/^\s*[-*]\s+/gm, '• ');

    if (isFinal) {
      // Ensure it ends with "Wallahu a'lam bishawab" if not already present
      const trimmed = cleaned.trim();
      const lower = trimmed.toLowerCase();
      if (!lower.includes("wallahu a'lam") && !lower.includes("wallahu alam") && !lower.includes("wallahu 'alam")) {
        cleaned = cleaned.trim() + "\n\nWallahu a'lam bishawab.";
      }
    }

    return cleaned;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Teks berhasil disalin!", "success");
  };

  const handleShare = async (text: string) => {
    // Prioritaskan Native Android Interface
    const androidInterface = (window as any).AndroidNativeInterface;
    if (androidInterface && typeof androidInterface.shareText === 'function') {
      try {
        androidInterface.shareText('Tanya Santri AI', text);
        return;
      } catch (e) {
        console.error("Native share failed", e);
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tanya Santri AI',
          text: text,
          url: window.location.href
        });
        showToast("Berhasil membagikan jawaban!", "success");
      } catch (err) {
        console.warn("Share cancelled or failed:", err);
      }
    } else {
      navigator.clipboard.writeText(text);
      showToast("Teks disalin ke papan klip untuk dibagikan!", "success");
    }
  };

  const speakText = (text: string, id: string) => {
    if (activeVoice === id) {
      window.speechSynthesis.cancel();
      setActiveVoice(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.onend = () => setActiveVoice(null);
    window.speechSynthesis.speak(utterance);
    setActiveVoice(id);
  };

  const handleClearChat = () => {
    setConfirmModal({
      isOpen: true,
      title: "Bersihkan Percakapan",
      message: "Apakah Anda yakin ingin bersihkan seluruh percakapan ini?",
      onConfirm: () => {
        setMessages([]);
        showToast("Percakapan dibersihkan", "info");
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast(`File ${file.name} terpilih (Fitur analisis dokumen segera hadir)`, "info");
    }
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Browser Anda tidak mendukung pengenalan suara", "error");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.onstart = () => showToast("Mendengarkan...", "info");
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
    };
    recognition.start();
  };

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim() || isTyping) return;

    if (!user) {
      showToast("Silakan login terlebih dahulu untuk bertanya", "warning");
      navigate('/settings');
      return;
    }

    const currentWasilah = Number(userData?.wasilah ?? userData?.wasilahPoints ?? 0);
    if (currentWasilah < 2) {
      setShowNoWasilahModal(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setStreamedText('');

    try {
      // Potong 2 Wasilah untuk aktivitas bertanya (dengan proteksi server-side)
      await deductWasilahForAI(user.uid, 2, `Tanya Santri AI - ${text.substring(0, 30)}...`);

      // 1. Cek GitHub Terlebih Dahulu (menggunakan pencarian kemiripan/similarity)
      const cachedResponse = await fetchSimilarFromGitHub('ai-knowledge', text, 0.55);
      if (cachedResponse && cachedResponse.answer) {
        console.log("[SantriAI] Menggunakan jawaban dari Pangkalan Data GitHub");
        
        // Simulasikan efek mengetik cepat untuk jawaban dari cache agar terasa natural
        let typed = '';
        const fullAnswer = sanitizeResponse(cachedResponse.answer, true);
        const chunks = fullAnswer.match(/.{1,10}/g) || [];
        
        for (const chunk of chunks) {
          typed += chunk;
          setStreamedText(typed);
          await new Promise(r => setTimeout(r, 10)); // Sangat cepat
        }

        const recs = findRecommendations(fullAnswer + " " + text);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullAnswer,
          timestamp: new Date(),
          recommendations: recs.length > 0 ? recs : undefined,
        };

        setMessages(prev => [...prev, assistantMessage]);
        setStreamedText('');
        setIsTyping(false);
        return;
      }

      // 2. Jika tidak ada di GitHub, panggil Gemini dengan rotasi API Key & Model
      const systemPrompt = `
        Anda adalah "Santri AI Pro", asisten virtual islami tercanggih dari aplikasi Santri AI.
        
        MANHAJ & KEILMUAN:
        - Anda WAJIB menjawab setiap pertanyaan secara LENGKAP, MENDALAM, dan KOMPREHENSIF (BUKAN sepotong-sepotong).
        - Setiap jawaban hukum, fiqih, tafsir, hadis, dan akidah harus bersandar penuh pada manhaj Ahlussunnah wal Jama'ah (Asy'ariyah/Maturidiyah dalam akidah, serta mengacu pada 4 Madzhab fiqih utama dengan prioritas/fokus utama pada Madzhab Syafi'i).
        - Anda harus mencantumkan dalil-dalil yang shahih, jelas, dan valid (baik berupa ayat Al-Quran beserta nama surat & nomor ayat, maupun Hadis beserta perawinya seperti Bukhari, Muslim, Abu Dawud, dll).
        - Sertakan penjelasan/pendapat dari para ulama mu'tabar (ulama kredibel) dari kalangan Ahlussunnah wal Jama'ah untuk memperjelas dan memperkuat keilmuan jawaban Anda agar mantap serta menenangkan hati penanya.

        KARAKTER: Bijak, sangat sopan dan santun (menggunakan 'Anda' atau 'Sahabat Santri'), ilmiah, berwibawa, dan solutif.
        
        KEMAMPUAN: 
        1. Menjawab pertanyaan fiqih, tafsir, hadis, dan sejarah Islam secara detail dengan dalil yang valid (Aswaja).
        2. Mampu memberikan motivasi spiritual dan nasihat bijak.
        3. Sebagai 'Pintu Gerbang' aplikasi: Jika pengguna butuh fitur tertentu, arahkan ke fitur yang ada di aplikasi.
        
        FITUR INTERNAL APLIKASI: Al-Quran (Surat/Ayat), Jadwal Sholat, Arah Kiblat, Kalkulator Zakat & Fidyah, Leaderboard (Top Santri), Community, Hadis Utama, Kumpulan Doa.
        
        GAYA & STRUKTUR TULISAN:
        - Jangan pernah menggunakan tanda '#' (pagar) untuk judul/header. Gunakan teks biasa dengan huruf kapital untuk judul jika diperlukan.
        - Jangan gunakan tanda '*' atau '**' (bintang) untuk menebalkan teks atau penekanan. Tuliskan teks secara biasa/polos agar rapi, bersih, dan indah dibaca.
        - Jangan gunakan tanda '>' atau blockquote untuk kutipan. Gunakan kutipan biasa dengan tanda petik ganda.
        - Untuk daftar/list, gunakan poin biasa seperti '•' atau nomor '1.', '2.', dst.
        - Gunakan bahasa Indonesia yang baik namun tetap akrab. Berikan salam hangat khas santri.
        - DI AKHIR JAWABAN: Selalu gunakan penutup kalimat dengan kata "Wallahu a'lam bishawab."
        
        PANDUAN INTERAKSI: Anda adalah chatbot cerdas. Jika pengguna bertanya hal baru, berikan jawaban yang mendalam. Jika pengguna bertanya hal yang sudah dibahas, berikan ringkasan atau poin tambahan.
        HINDARI: Hindari jawaban yang sepotong-sepotong, terlalu singkat, kaku, atau kurang dalil. Jadilah asisten yang mencerahkan pikiran dan membimbing kebaikan umat.
      `;

      const chatHistory = messages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      let fullResponse = '';
      let streamSuccess = false;
      const maxAttempts = 3;

      for (let attempt = 0; attempt < maxAttempts && !streamSuccess; attempt++) {
        try {
          const ai = getRotatedGeminiClient(attempt);
          const modelName = getRotatedGeminiModel(attempt);

          const result = await ai.models.generateContentStream({
            model: modelName,
            contents: [
              ...chatHistory,
              { role: 'user', parts: [{ text: text }] }
            ],
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.7,
              maxOutputTokens: 4096,
            }
          });

          fullResponse = '';
          for await (const chunk of result) {
            const chunkText = chunk.text || '';
            fullResponse += chunkText;
            setStreamedText(sanitizeResponse(fullResponse, false));
          }

          if (fullResponse.trim().length > 0) {
            streamSuccess = true;
          }
        } catch (streamErr) {
          console.warn(`[Tanya Santri AI] Streaming attempt ${attempt + 1} error:`, streamErr);
          if (attempt === maxAttempts - 1) throw streamErr;
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      const cleanResponse = sanitizeResponse(fullResponse, true);
      const recs = findRecommendations(cleanResponse + " " + text);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanResponse,
        timestamp: new Date(),
        recommendations: recs.length > 0 ? recs : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamedText('');

      // 3. Simpan ke GitHub untuk Publik (Knowledge Sharing)
      try {
        saveToGitHub('ai-knowledge', text, {
          question: text,
          answer: cleanResponse,
          timestamp: new Date().toISOString(),
          category: 'ai-chat'
        });
      } catch (e) {
        console.warn("[GitHub] Gagal menyimpan pengetahuan baru:", e);
      }
    } catch (error: any) {
      console.error("Gemini Error:", error);
      let content = "Maaf, daya intelektual saya sedang mengalami sinkronisasi ulang. Bisakah Anda mengulangi pertanyaannya?";
      
      if (error?.message?.includes('429') || error?.message?.includes('quota')) {
        content = "Maaf, Sahabat Santri. Kuota harian saya sedang penuh karena banyaknya santri yang bertanya. Silakan coba lagi beberapa saat lagi ya.";
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: content,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white dark:bg-slate-950 font-sans transition-colors duration-300 overflow-hidden">
      {/* Premium Navigation Header with Islamic Pattern background */}
      <div 
        className="sticky top-0 z-[100] text-white border-b border-emerald-900 px-3 py-2.5 sm:px-4 sm:py-3 shadow-md relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to right, #065f46, #022c22), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='%23fcd34d' stroke-opacity='0.18' stroke-width='1'%3E%3Crect x='35' y='35' width='30' height='30'/%3E%3Crect x='35' y='35' width='30' height='30' transform='rotate(45 50 50)'/%3E%3Ccircle cx='50' cy='50' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '100% 100%, 40px 40px',
          backgroundRepeat: 'no-repeat, repeat',
          backgroundBlendMode: 'overlay',
          backgroundColor: '#065f46'
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3 relative z-10">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
            <button onClick={() => navigate('/')} className="p-1.5 -ml-1 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0 cursor-pointer">
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="text-xs sm:text-base font-black text-white flex items-center gap-1 uppercase tracking-tight truncate">
                Santri AI <span className="text-[9px] sm:text-[10px] bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full font-black shadow-xs shrink-0">PRO</span>
              </h1>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0"></div>
                <span className="text-[8px] sm:text-[9px] font-bold text-emerald-200 tracking-wider truncate">INTELIGENSI AKTIF</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Wasilah Display - positioned nicely near History icon */}
            <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-white/10 shadow-inner shrink-0">
              <Gem size={11} className="text-cyan-300 animate-pulse fill-cyan-300/20 shrink-0" />
              <span className="text-[11px] sm:text-xs font-black text-cyan-200">
                {(userData?.wasilah || 0).toLocaleString()}
              </span>
            </div>

            <button 
              onClick={() => navigate('/info/guide')} 
              title="Panduan Penggunaan"
              className="p-1.5 sm:p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-colors flex items-center justify-center cursor-pointer shrink-0"
            >
              <BookOpen size={18} />
            </button>

            <button 
              onClick={() => setShowHistory(true)} 
              title="Riwayat Percakapan Lokal"
              className="p-1.5 sm:p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0"
            >
              <History size={18} />
            </button>

            <button 
              onClick={() => navigate('/settings')} 
              className="relative active:scale-90 transition-all shrink-0"
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

      {/* Main Conversation Area */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-6 md:p-8 space-y-6 scroll-smooth touch-pan-y" 
        id="chat-messages-container"
        style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
      >
        <div className="pb-32"> {/* Bottom safe space */}
        <AnimatePresence>
          {messages.length === 0 && !isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-6 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl flex items-center justify-center shadow-2xl mb-4 transform rotate-6 hover:rotate-0 transition-transform">
                <Brain size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-1">Ahlan wa Sahlan!</h2>
              <p className="max-w-[280px] text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed">Saya asisten virtual cerdas Anda. Apa yang ingin kita bahas hari ini?</p>
              
              {/* WhatsApp Group Santri AI Banner */}
              <a
                href="https://chat.whatsapp.com/Jr6Aq0VrJgxItOyoBwnSrs?s=sh&p=a&mlu=4"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => shareWaGroup(e, showToast)}
                className="flex items-center justify-between gap-3 p-3.5 mt-4 w-full max-w-sm bg-gradient-to-r from-emerald-700 via-[#005a2b] to-teal-800 text-white rounded-2xl shadow-md border border-emerald-500/30 hover:brightness-105 transition-all group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0 border border-white/25">
                    <WhatsAppIcon size={22} colored={true} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-white truncate">Grup WhatsApp Santri AI</h4>
                      <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 text-[8px] font-black rounded uppercase shrink-0">Resmi</span>
                    </div>
                    <p className="text-[9.5px] text-emerald-100/90 font-medium leading-tight truncate">Silaturahmi & Diskusi</p>
                  </div>
                </div>
                <div className="p-1.5 bg-white text-emerald-800 rounded-lg group-hover:bg-amber-300 group-hover:text-amber-950 transition-colors shrink-0 shadow-xs">
                  <ExternalLink size={13} />
                </div>
              </a>

              {/* Quick Actions / Suggestions */}
              <div className="grid grid-cols-1 gap-2.5 mt-5 w-full max-w-sm">
                  {SUGGESTIONS.map((s, i) => {
                    const SuggestionIcon = ICON_MAP[s.iconName] || Sparkles;
                    if (s.isGuideNav) {
                      return (
                        <button 
                          key={i} 
                          onClick={() => navigate('/info/guide')}
                          className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white rounded-2xl shadow-md hover:brightness-105 transition-all group text-left cursor-pointer border border-emerald-500/40"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-white/20 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                              <SuggestionIcon size={18} className="text-amber-300" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-black text-white flex items-center gap-1.5 truncate">
                                {s.label}
                                <span className="text-[8px] bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded font-black uppercase shrink-0">Petunjuk</span>
                              </span>
                              <span className="text-[10px] text-emerald-100/90 font-medium truncate">{s.desc}</span>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-emerald-200 group-hover:translate-x-0.5 transition-transform shrink-0" />
                        </button>
                      );
                    }

                    return (
                      <button 
                        key={i} 
                        onClick={() => handleSend(s.label)}
                        className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all group text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                            <SuggestionIcon className={s.color} size={18} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{s.label}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">{s.desc}</span>
                          </div>
                        </div>
                        <Send size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 shrink-0 transition-colors" />
                      </button>
                    );
                  })}
              </div>
            </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
            >
              <div className={`flex gap-4 max-w-[90%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-md overflow-hidden transition-transform hover:scale-110 ${
                  msg.role === 'user' 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50' 
                    : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white'
                }`}>
                  {msg.role === 'user' ? (
                    (() => {
                      const photo = userData?.avatarUrl || userData?.photoURL || user?.photoURL;
                      return photo ? (
                        <img 
                          src={photo} 
                          alt="User" 
                          className="w-full h-full object-cover rounded-2xl" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User size={20} />
                      );
                    })()
                  ) : (
                    <div className="relative">
                      <Brain size={20} className="text-white" />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                    </div>
                  )}
                </div>
                
                <div className={`space-y-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`
                    p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700' 
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-emerald-100 dark:border-emerald-900/50'
                    }
                  `}>
                    <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                    
                    {/* Actions inside assistant's bubble at the end of the text */}
                    {msg.role === 'assistant' && (
                      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-2.5">
                        <div className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-bold italic tracking-wide flex items-center gap-1.5">
                          <MessageSquareText size={12} className="text-emerald-500" />
                          <span>Jika jawaban ini bermanfaat silahkan dibagikan:</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button 
                              onClick={() => copyToClipboard(msg.content)}
                              title="Salin Jawaban"
                              className="p-1.5 px-2.5 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/30 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 border border-slate-200/60 dark:border-slate-700/60 rounded-xl transition-all flex items-center gap-1.5 font-bold text-[11px]"
                            >
                              <Copy size={13} />
                              <span>Salin</span>
                            </button>
                            <button 
                              onClick={() => speakText(msg.content, msg.id)}
                              title="Dengarkan Suara"
                              className={`p-1.5 px-2.5 rounded-xl transition-all border flex items-center gap-1.5 font-bold text-[11px] ${
                                activeVoice === msg.id 
                                  ? 'bg-emerald-600 border-emerald-600 text-white animate-pulse' 
                                  : 'bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/30 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 border-slate-200/60 dark:border-slate-700/60'
                              }`}
                            >
                              {activeVoice === msg.id ? <AudioLines size={13} /> : <Volume2 size={13} />}
                              <span>{activeVoice === msg.id ? 'Memutar' : 'Dengar'}</span>
                            </button>
                            <button 
                              onClick={() => handleShare(msg.content)}
                              title="Bagikan Jawaban"
                              className="p-1.5 px-2.5 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/30 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 border border-slate-200/60 dark:border-slate-700/60 rounded-xl transition-all flex items-center gap-1.5 font-bold text-[11px]"
                            >
                              <Share2 size={13} />
                              <span>Bagikan</span>
                            </button>
                            <button 
                              onClick={() => openExternalLink(PLAYSTORE_LINK)}
                              title="Beri Rating Aplikasi di Play Store"
                              className="p-1.5 px-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 rounded-xl transition-all flex items-center gap-1.5 font-bold text-[11px]"
                            >
                              <Star size={13} className="text-amber-500 fill-amber-500" />
                              <span>Beri Rating</span>
                            </button>
                            <button 
                              onClick={() => setReportSnippet(msg.content)}
                              title="Laporkan / Koreksi Jawaban ke Admin"
                              className="p-1.5 px-2.5 bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200/60 dark:border-slate-700/60 rounded-xl transition-all flex items-center gap-1.5 font-bold text-[11px]"
                            >
                              <Flag size={13} />
                              <span>Laporkan</span>
                            </button>
                          </div>
                          
                          <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* WhatsApp Group Link Banner at end of answer */}
                        <a
                          href="https://chat.whatsapp.com/Jr6Aq0VrJgxItOyoBwnSrs?s=sh&p=a&mlu=4"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => shareWaGroup(e, showToast)}
                          className="w-full flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl transition-all border border-emerald-200/70 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-100 group mt-2 overflow-hidden"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white dark:bg-emerald-900 rounded-lg flex items-center justify-center shrink-0 shadow-xs border border-emerald-200/60 dark:border-emerald-700/60">
                              <WhatsAppIcon size={16} colored={true} />
                            </div>
                            <div className="min-w-0 text-left flex-1">
                              <p className="text-[10px] sm:text-[11px] font-black text-emerald-800 dark:text-emerald-200 leading-tight truncate">
                                Grup WhatsApp Santri AI
                              </p>
                              <p className="text-[8.5px] sm:text-[9.5px] text-emerald-600 dark:text-emerald-400 font-semibold leading-tight truncate">
                                Silaturahmi & Diskusi
                              </p>
                            </div>
                          </div>
                          <div className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-wider group-hover:bg-emerald-700 transition-colors shrink-0 flex items-center gap-1 shadow-xs">
                            <span>Gabung</span> <ExternalLink size={10} />
                          </div>
                        </a>
                      </div>
                    )}
                    
                     {/* Recommendations inside response */}
                    {msg.role === 'assistant' && msg.recommendations && (
                      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1 uppercase tracking-wider">
                          <Lightbulb size={11} className="text-emerald-500 animate-pulse" />
                          <span>Rekomendasi Fitur Terkait</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.recommendations.map((rec, i) => {
                            const FeatureIcon = ICON_MAP[rec.iconName] || Search;
                            return (
                              <button 
                                key={i} 
                                onClick={() => navigate(rec.path)}
                                className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 rounded-xl transition-all border border-slate-100 dark:border-slate-800/50 hover:border-emerald-200"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg ${rec.color} flex items-center justify-center text-white shadow-sm`}>
                                    <FeatureIcon size={15} />
                                  </div>
                                  <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tighter">{rec.label}</span>
                                </div>
                                <ChevronRight size={14} className="text-slate-400" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
 
                  {/* Actions for user messages */}
                  {msg.role === 'user' && (
                    <div className="flex items-center gap-3 px-1 flex-row-reverse">
                      <button 
                        onClick={() => copyToClipboard(msg.content)}
                        title="Salin Pertanyaan"
                        className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                      >
                        <Copy size={13} />
                      </button>
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Dynamic Thinking/Streaming State */}
        {(isTyping || streamedText) && (
          <div className="flex gap-4 items-start">
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex-shrink-0 flex items-center justify-center shadow-md">
                <Brain size={20} className="text-white animate-pulse" />
             </div>
             <div className="flex-1 space-y-2 max-w-[90%] md:max-w-[75%]">
                {streamedText ? (
                   <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-emerald-100 dark:border-emerald-900/50 shadow-sm text-sm font-medium whitespace-pre-wrap">
                      {streamedText}
                   </div>
                ) : (
                   <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 w-fit">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      <span className="text-[11px] font-bold text-emerald-400 ml-2 tracking-widest uppercase">Memproses Jawaban...</span>
                   </div>
                )}
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Modern High-Tier Input Bar */}
      <div className="p-4 safe-area-bottom bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 relative z-[150]">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileUpload}
        />
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] p-1.5 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all border border-slate-200 dark:border-slate-700 shadow-sm">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"><Paperclip size={22} /></button>
            <textarea 
              ref={inputRef}
              rows={1}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                e.target.style.height = 'inherit';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Tanya apa saja seputar Islam atau aplikasi..."
              className="flex-1 bg-transparent border-none focus:ring-0 py-2.5 px-1.5 text-[15px] font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 max-h-48 overflow-y-auto no-scrollbar outline-none"
            />
            
            <AnimatePresence mode="wait">
              {inputValue.trim() ? (
                <motion.button 
                  key="send"
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 45 }}
                  onClick={() => handleSend()}
                  className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-700 active:scale-95 transition-all mb-0.5 mr-0.5"
                >
                  <Send size={20} fill="currentColor" />
                </motion.button>
              ) : (
                <motion.button 
                  key="mic"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={startVoiceRecognition}
                  className="w-10 h-10 bg-white dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center shadow-sm hover:text-emerald-500 transition-all mb-0.5 mr-0.5"
                >
                  <Mic size={20} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <div className="flex justify-between items-center px-2">
            <p className="text-[9px] font-bold text-slate-400 tracking-wide uppercase">AI dapat melakukan kesalahan. Harap verifikasi informasi penting.</p>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500">
               <Zap size={10} fill="currentColor" /> 
               SANTRI AI 3.1 PRO • 2 WASILAH
            </div>
          </div>
        </div>
      </div>
      {/* Chat History Drawer Overlay */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xs bg-white dark:bg-slate-900 z-[210] shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Riwayat Percakapan</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tersimpan di Perangkat</p>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {localHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                    <History size={32} className="mb-3 opacity-20" />
                    <p className="text-xs font-medium">Belum ada riwayat</p>
                  </div>
                ) : (
                  localHistory.map((msg, i) => (
                    <button
                      key={msg.id}
                      onClick={() => {
                        handleSend(msg.content);
                        setShowHistory(false);
                      }}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl border border-slate-100 dark:border-slate-800 text-left transition-all group"
                    >
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {msg.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <ArrowRight size={12} className="text-slate-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={handleClearChat}
                  className="w-full py-3 bg-white dark:bg-slate-800 border border-rose-100 dark:border-rose-900/30 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={14} /> Hapus Semua Riwayat
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Insufficient Wasilah Modal */}
      <AnimatePresence>
        {showNoWasilahModal && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl relative border-t-8 border-amber-500 animate-in zoom-in-95 duration-200 text-center space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
              <button 
                onClick={() => setShowNoWasilahModal(false)} 
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"
              >
                <X size={18} />
              </button>

              <div className="space-y-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center shadow-inner">
                  <Gem size={32} className="text-amber-500 fill-amber-500/20 animate-pulse" />
                </div>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Wasilah Tidak Mencukupi</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Fitur <span className="font-bold text-slate-800 dark:text-slate-200">Tanya Santri AI</span> memerlukan minimal <span className="font-bold text-amber-600 dark:text-amber-500">2 Wasilah</span> per pesan. Saldo Wasilah tidak dapat bernilai minus.
                </p>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-bold inline-block">
                  💰 Sisa Wasilah Anda: <span className="text-base font-black ml-1 text-amber-600 dark:text-amber-400">{Math.max(0, userData?.wasilah ?? userData?.wasilahPoints ?? 0)}</span> Wasilah
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 text-left">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Pilih Solusi Tambah Wasilah / Akses Pro:</p>

                {/* Priority Option 1: Upgrade Santri PRO */}
                <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl gap-3 shadow-xs hover:border-amber-400 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                      <Crown size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                        Upgrade Santri PRO
                        <span className="text-[9px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-1.5 py-0.5 rounded font-black">VIP</span>
                      </h4>
                      <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80">Akses tanpa batas, bebas wasilah & bonus harian</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setShowNoWasilahModal(false); navigate('/premium'); }}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] px-3.5 py-2 rounded-xl shadow-xs active:scale-95 transition-all whitespace-nowrap shrink-0"
                  >
                    Upgrade PRO
                  </button>
                </div>

                {/* Priority Option 2: Main Game Islami */}
                <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl gap-3 shadow-xs hover:border-indigo-400 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                      <Gamepad2 size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        Main Game Islami
                        <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-black">GRATIS</span>
                      </h4>
                      <p className="text-[10px] text-indigo-800/80 dark:text-indigo-300/80">Kuis Cerdas Cermat & Miliarder berhadiah Wasilah</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={() => { setShowNoWasilahModal(false); navigate('/quiz'); }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-2.5 py-2 rounded-xl shadow-xs active:scale-95 transition-all whitespace-nowrap"
                    >
                      Kuis
                    </button>
                    <button 
                      onClick={() => { setShowNoWasilahModal(false); navigate('/quiz-game'); }}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] px-2.5 py-2 rounded-xl shadow-xs active:scale-95 transition-all whitespace-nowrap"
                    >
                      Miliarder
                    </button>
                  </div>
                </div>

                {/* Option 3: Top Up Wasilah */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl gap-3 hover:border-cyan-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                      <Gem size={18} className="text-cyan-500 fill-cyan-500/20" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Top Up Wasilah</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Tambah saldo Wasilah instan dengan praktis</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setShowNoWasilahModal(false); navigate('/wasilah-shop'); }}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-[10px] px-3 py-2 rounded-xl shadow-xs active:scale-95 transition-all whitespace-nowrap shrink-0"
                  >
                    Top Up
                  </button>
                </div>

                {/* Option 4: Absensi Harian */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl gap-3 hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                      <CalendarCheck size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Absensi Harian</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">+1 Wasilah & +10 XP gratis tiap hari</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setShowNoWasilahModal(false); navigate('/attendance'); }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3 py-2 rounded-xl shadow-xs active:scale-95 transition-all whitespace-nowrap shrink-0"
                  >
                    Absen
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setShowNoWasilahModal(false)}
                className="w-full py-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold transition-colors"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={true}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      <ContentReportModal
        isOpen={!!reportSnippet}
        onClose={() => setReportSnippet(null)}
        featureName="Tanya Santri AI"
        contentSnippet={reportSnippet || ''}
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};

export default ChatAiScreen;
