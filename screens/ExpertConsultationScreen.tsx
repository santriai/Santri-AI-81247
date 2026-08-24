import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Brain, Loader2, Moon, CheckCircle2, AlertCircle, BookOpen, 
  ChevronDown, Share2, Copy, Check, Flag, History, Trash2, Sparkles, 
  ExternalLink, X, ShieldCheck, HeartHandshake, ScrollText, Bookmark,
  RotateCcw
} from 'lucide-react';
import { generateDreamInterpretation } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { deductWasilahForAI } from '../services/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { ContentReportModal } from '../components/ContentReportModal';

const IslamicPattern: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}>
      <svg 
        className="w-full h-full fill-current"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="islamic-grid-dream" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" />
            <path d="M12 5 L19 12 L12 19 L5 12 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
            <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#islamic-grid-dream)" />
      </svg>
    </div>
  );
};

interface DreamHistoryItem {
  id: string;
  timestamp: number;
  query: string;
  result: any;
}

const STORAGE_KEY_PREFIX = 'santri_ai_dream_history_';

const LOADING_STEPS = [
  "Menganalisis Simbol & Unsur Kunci dalam Mimpi...",
  "Membuka Literatur Kitab Tafsir Ulama Salaf (Ibnu Sirin & An-Nabulsi)...",
  "Menyelaraskan Takwil dengan Kaidah Syariat & Hadits...",
  "Menyusun Nasehat Hikmah, Doa & Panduan Amalan Syar'i..."
];

const ExpertConsultationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, userData } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [showDreamGuide, setShowDreamGuide] = useState(false);
  
  // Modals & States
  const [showRefModal, setShowRefModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState<DreamHistoryItem[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedAmalan, setCopiedAmalan] = useState(false);

  // Load History from localStorage
  const getHistoryKey = () => `${STORAGE_KEY_PREFIX}${user?.uid || 'guest'}`;

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem(getHistoryKey());
      if (saved) {
        setHistoryList(JSON.parse(saved));
      } else {
        setHistoryList([]);
      }
    } catch (e) {
      console.error("Gagal memuat riwayat tafsir mimpi:", e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user?.uid]);

  // Loading Step Ticker
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2400);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const saveToHistory = (dreamQuery: string, data: any) => {
    try {
      const key = getHistoryKey();
      const newItem: DreamHistoryItem = {
        id: 'dream_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        timestamp: Date.now(),
        query: dreamQuery,
        result: data
      };
      const existing = localStorage.getItem(key);
      let parsed: DreamHistoryItem[] = existing ? JSON.parse(existing) : [];
      // Prevent duplicate exact query at head
      parsed = [newItem, ...parsed.filter(h => h.query.trim().toLowerCase() !== dreamQuery.trim().toLowerCase())].slice(0, 30);
      localStorage.setItem(key, JSON.stringify(parsed));
      setHistoryList(parsed);
    } catch (e) {
      console.error("Gagal menyimpan riwayat:", e);
    }
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const key = getHistoryKey();
      const updated = historyList.filter(item => item.id !== id);
      localStorage.setItem(key, JSON.stringify(updated));
      setHistoryList(updated);
      showToast("Riwayat berhasil dihapus", "info");
    } catch (e) {
      console.error("Gagal menghapus riwayat:", e);
    }
  };

  const handleClearAllHistory = () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus semua riwayat tafsir mimpi?")) return;
    try {
      const key = getHistoryKey();
      localStorage.removeItem(key);
      setHistoryList([]);
      showToast("Semua riwayat telah dibersihkan", "success");
    } catch (e) {
      console.error("Gagal membersihkan riwayat:", e);
    }
  };

  const handleSelectHistoryItem = (item: DreamHistoryItem) => {
    setQuery(item.query);
    setResult(item.result);
    setShowHistoryModal(false);
    showToast("Memuat hasil tafsir dari riwayat", "info");
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleProcess = async () => {
    if (!query.trim()) {
      showToast("Tuliskan cerita mimpi Anda terlebih dahulu", "info");
      return;
    }

    if (!user) {
      showToast("Silakan login terlebih dahulu", "error");
      return;
    }
    if ((userData?.wasilah || 0) < 1) {
      showToast("Sisa Wasilah Anda tidak cukup (Butuh 1 Wasilah)!", "warning");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const data = await generateDreamInterpretation(query);
      await deductWasilahForAI(user.uid, 1, `Tafsir Mimpi - ${query.substring(0, 40)}`);
      setResult(data);
      saveToHistory(query, data);
      showToast("Tafsir mimpi berhasil dianalisis! (Dipotong 1 Wasilah)", "success");
    } catch (e) {
      showToast("Gagal memproses permintaan AI, silakan coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper getters for backward compatibility
  const getReferenceTitle = () => {
    if (!result?.reference) return "Kitab Tafsirul Ahlam (Ibnu Sirin) & Ta'thirul Anam";
    if (typeof result.reference === 'string') return result.reference;
    return result.reference.title || "Kitab Tafsir Klasik Ahlussunnah";
  };

  const getReferenceAuthor = () => {
    if (!result?.reference || typeof result.reference === 'string') return "Imam Muhammad bin Sirin / Ulama Salaf";
    return result.reference.author || "Imam Ibnu Sirin & Ulama Mufassirin";
  };

  const getReferenceDetail = () => {
    if (!result?.reference || typeof result.reference === 'string') {
      return "Penafsiran ini diselaraskan dengan kaidah ilmu ta'bir mimpi dalam khazanah Islam klasik, membedakan antara ru'ya shalihah (mimpi baik pembawa kabar gembira) dan bisikan jiwa.";
    }
    return result.reference.detail || "Rujukan takwil berakar pada kaidah takwil simbol dan makna keilmuan para ulama.";
  };

  // Helper for Amalan data
  const amalanData = result?.amalan || (result?.recommendedAmalan ? result.recommendedAmalan : null);

  // Copy Full Result
  const handleCopyFullResult = () => {
    if (!result) return;
    const shareText = `🌙 *Tafsir Mimpi Islami - Santri AI*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `📝 *Mimpi:* "${query}"\n` +
      (result.category ? `🏷️ *Kategori:* ${result.category}\n` : '') +
      `\n✨ *Takwil / Penjelasan:*\n${result.interpretation || ''}\n\n` +
      `📚 *Referensi Kitab:* ${getReferenceTitle()} (${getReferenceAuthor()})\n` +
      (result.advice ? `\n💡 *Nasehat Spiritual:*\n${result.advice}\n` : '') +
      (amalanData?.arabic ? `\n🤲 *Amalan & Doa (${amalanData.title || 'Amalan Bimbingan'}):*\n${amalanData.arabic}\n_${amalanData.latin || ''}_\n"${amalanData.translation || ''}"\n*Tata Cara:* ${amalanData.fadhilah || 'Dibaca istiqomah.'}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Dianalisis melalui Aplikasi Santri AI_`;

    navigator.clipboard.writeText(shareText);
    setCopiedAll(true);
    showToast("Hasil tafsir & amalan berhasil disalin!", "success");
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Copy Amalan only
  const handleCopyAmalan = () => {
    if (!amalanData) return;
    const amalanText = `🤲 *${amalanData.title || 'Amalan & Doa'}*\n\n` +
      `${amalanData.arabic || ''}\n\n` +
      `_${amalanData.latin || ''}_\n\n` +
      `Artinya: "${amalanData.translation || ''}"\n\n` +
      `📌 *Kaifiyah / Tata Cara:* ${amalanData.fadhilah || 'Dibaca secara ikhlas dan istiqomah.'}`;

    navigator.clipboard.writeText(amalanText);
    setCopiedAmalan(true);
    showToast("Teks amalan & doa berhasil disalin!", "success");
    setTimeout(() => setCopiedAmalan(false), 2000);
  };

  // Share Result
  const handleShare = async () => {
    if (!result) return;
    const shareText = `🌙 *Tafsir Mimpi Islami - Santri AI*\n\n` +
      `Mimpi: "${query}"\n\n` +
      `Takwil: ${result.interpretation || ''}\n\n` +
      `Referensi: ${getReferenceTitle()}\n` +
      `Nasehat: ${result.advice || ''}\n\n` +
      `Mari pelajari tafsir mimpi syar'i dan khazanah Islam di Santri AI!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tafsir Mimpi Islami - Santri AI',
          text: shareText,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyFullResult();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-left">
      {/* Top App Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 text-white px-4 py-4 shadow-md sticky top-0 z-30 transition-all relative overflow-hidden flex items-center justify-between">
        <IslamicPattern className="text-white opacity-[0.14]" />
        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            aria-label="Kembali"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-lg font-extrabold flex items-center gap-2 text-white">
              <Brain size={20} className="text-purple-300" />
              Tafsir Mimpi Islami
            </h1>
          </div>
        </div>

        {/* Action Button Riwayat */}
        <button
          onClick={() => {
            loadHistory();
            setShowHistoryModal(true);
          }}
          className="relative z-10 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/45 active:scale-95 text-emerald-100 rounded-xl text-xs font-bold transition-all border border-emerald-400/30 shadow-xs backdrop-blur-xs"
          title="Riwayat Tafsir Mimpi"
        >
          <History size={15} className="text-emerald-300" />
          <span>Riwayat</span>
          {historyList.length > 0 && (
            <span className="w-4 h-4 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
              {historyList.length}
            </span>
          )}
        </button>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        
        {/* Panduan & Dalil Syar'i Mimpi Accordion */}
        <div className="bg-gradient-to-br from-indigo-100/90 via-purple-50/80 to-emerald-100/70 dark:from-indigo-950/70 dark:via-purple-950/60 dark:to-emerald-950/50 rounded-3xl border border-indigo-200/80 dark:border-indigo-800/60 shadow-md overflow-hidden transition-all">
          <button 
            onClick={() => setShowDreamGuide(!showDreamGuide)} 
            className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-indigo-600/15 via-purple-600/10 to-emerald-600/15 dark:from-indigo-900/40 dark:via-purple-900/30 dark:to-emerald-900/30 hover:from-indigo-600/20 hover:via-purple-600/15 hover:to-emerald-600/20 dark:hover:from-indigo-900/50 dark:hover:via-purple-900/40 dark:hover:to-emerald-900/40 transition-all"
          >
            <div className="flex items-center gap-2.5 text-indigo-950 dark:text-indigo-200 font-bold text-sm">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
                <BookOpen size={16} />
              </div>
              <div className="text-left">
                <span className="block font-extrabold text-sm text-indigo-950 dark:text-indigo-100">Panduan Syar'i & Dalil Mimpi (Ru'ya)</span>
                <span className="text-[10px] text-indigo-700/90 dark:text-indigo-300 font-medium">Kaidah penting dari hadits Nabi SAW</span>
              </div>
            </div>
            <ChevronDown size={18} className={`text-indigo-600 dark:text-indigo-400 transition-transform duration-300 ${showDreamGuide ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {showDreamGuide && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 space-y-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-t border-indigo-200/60 dark:border-indigo-800/40">
                  {/* Card 1: Tiga Golongan Mimpi */}
                  <div className="p-4 bg-gradient-to-br from-indigo-50/90 via-purple-50/70 to-indigo-100/60 dark:from-indigo-950/50 dark:via-purple-950/40 dark:to-indigo-900/30 rounded-2xl border border-indigo-200/70 dark:border-indigo-800/50 space-y-2 shadow-2xs">
                    <h4 className="font-extrabold text-indigo-950 dark:text-indigo-100 flex items-center gap-1.5 text-sm">
                      <Sparkles size={15} className="text-amber-500" />
                      Tiga Golongan Mimpi dalam Islam
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300">
                      Berdasarkan hadits shahih riwayat Imam Muslim, mimpi terbagi menjadi tiga golongan:
                    </p>
                    <div className="space-y-2 pl-3 border-l-2 border-indigo-500 dark:border-indigo-400 text-slate-800 dark:text-slate-200 mt-1">
                      <p><strong className="text-indigo-900 dark:text-indigo-200">1. Ru'ya Shadiqah / Shalihah:</strong> Mimpi benar dan baik, merupakan kabar gembira dan petunjuk dari Allah SWT.</p>
                      <p><strong className="text-purple-900 dark:text-purple-200">2. Haditsun Nafs:</strong> Bisikan jiwa, kelelahan pikiran, atau angan-angan diri sendiri sebelum tidur.</p>
                      <p><strong className="text-rose-900 dark:text-rose-200">3. Tahwilu Syaithan:</strong> Mimpi buruk atau menakutkan yang datang dari gangguan setan untuk membuat sedih dan cemas.</p>
                    </div>
                  </div>

                  {/* Card 2: Sabda Rasulullah SAW & Dalil */}
                  <div className="p-4 bg-gradient-to-br from-purple-50/95 via-indigo-50/80 to-emerald-50/80 dark:from-purple-950/50 dark:via-indigo-950/40 dark:to-emerald-950/30 rounded-2xl border border-purple-200/80 dark:border-purple-800/60 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        <ScrollText size={15} className="text-indigo-600 dark:text-indigo-400" />
                        <span>Sabda Rasulullah SAW:</span>
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-200/70 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 rounded-full">
                        Hadits Shahih
                      </span>
                    </div>
                    <p className="font-arabic text-base text-right leading-loose text-slate-800 dark:text-slate-100 bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40" dir="rtl">
                      الرُّؤْيَا الصَّالِحَةُ مِنَ اللَّهِ، وَالْحُلُمُ مِنَ الشَّيْطَانِ، فَإِذَا رَأَى أَحَدُكُمْ مَا يَكْرَهُ فَلْيَبْصُقْ عَنْ يَسَارِهِ ثَلَاثًا وَلْيَتَعَوَّذْ بِاللَّهِ مِنَ الشَّيْطَانِ
                    </p>
                    <p className="italic text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      "Mimpi yang baik itu dari Allah, sedangkan mimpi yang buruk itu dari setan. Maka jika salah seorang di antara kalian melihat mimpi yang dibencinya, hendaklah ia meludah ke sebelah kirinya tiga kali (tiupan halus) dan memohon perlindungan kepada Allah dari kejahatan setan..."
                    </p>
                    <p className="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-400 pt-1 border-t border-purple-100 dark:border-purple-900/30">
                      📚 HR. Bukhari no. 6984 & Muslim no. 2261
                    </p>
                  </div>

                  {/* Card 3: Adab Bangun dari Mimpi */}
                  <div className="p-4 bg-gradient-to-br from-emerald-50/90 via-teal-50/70 to-emerald-100/60 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-emerald-900/30 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/50 space-y-2 shadow-2xs">
                    <h4 className="font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5 text-sm">
                      <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                      Adab Syar'i Ketika Bangun dari Mimpi:
                    </h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
                      <li><strong>Bermimpi Baik:</strong> Mengucap <em>Alhamdulillah</em>, bergembira, dan ceritakan hanya kepada orang yang bijak / penyayang.</li>
                      <li><strong>Bermimpi Buruk:</strong> Membaca ta'awwudz <em>(A'udzubillahi minasy syaithanir rajim)</em>, mengubah posisi tidur, mendirikan shalat sunnah bila resah, dan <strong>dilarang menceritakannya</strong> ke orang lain agar tidak membahayakan.</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Moon size={15} className="text-purple-500" />
              Ceritakan Mimpi Anda
            </label>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              Biaya: 1 Wasilah
            </span>
          </div>

          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Contoh: Saya bermimpi melihat air sungai yang sangat jernih mengalir di dekat masjid, lalu saya berwudhu di sana dengan tenang..."
            rows={4}
            className="w-full bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-sm border border-slate-200 dark:border-slate-700/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none transition-all"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={handleProcess}
              disabled={loading}
              className="flex-1 py-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Menganalisis Mimpi...</span>
                </>
              ) : (
                <>
                  <Brain size={18} />
                  <span>Tafsirkan Mimpi Sekarang</span>
                </>
              )}
            </button>

            {query.trim() && (
              <button
                onClick={() => setQuery('')}
                className="p-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-2xl font-bold transition-all"
                title="Bersihkan teks"
              >
                <RotateCcw size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Result Area - Vertical Top-to-Bottom Layout */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              className="space-y-4"
            >
              {/* Main Card Container */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-purple-100 dark:border-purple-900/40 shadow-xl space-y-6">
                
                {/* Result Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-extrabold text-sm sm:text-base">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    Hasil Analisis & Takwil Mimpi
                  </div>
                  {result.category && (
                    <span className="text-[11px] font-bold px-3 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800">
                      {result.category}
                    </span>
                  )}
                </div>

                {/* Section 1: Tafsir & Makna Simbolik */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                    <Sparkles size={14} className="text-amber-500" />
                    Uraian Takwil Syar'i
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {result.interpretation}
                    </p>
                    {result.symbolism && (
                      <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400">
                        <strong className="text-purple-700 dark:text-purple-300">Makna Simbolik: </strong>
                        {result.symbolism}
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Referensi Kitab & Dalil (CLICKABLE) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={14} className="text-emerald-500" />
                      Referensi Kitab & Dalil
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold lowercase">
                      (klik kartu untuk detail)
                    </span>
                  </div>

                  <button
                    onClick={() => setShowRefModal(true)}
                    className="w-full text-left p-4 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/50 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 transition-all duration-200 group active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                            📖 {getReferenceTitle()}
                          </span>
                          <span className="text-[10px] bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold px-2 py-0.5 rounded-md">
                            Rujukan Sahih
                          </span>
                        </div>
                        <p className="text-xs text-emerald-700/90 dark:text-emerald-400 font-medium">
                          Oleh: {getReferenceAuthor()}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                          {getReferenceDetail()}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-emerald-200/50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                        <ExternalLink size={16} />
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-emerald-200/50 dark:border-emerald-900/30 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                      <span>Buka dalil & konteks ilmiah kitab</span>
                      <span className="group-hover:underline flex items-center gap-1">Lihat Detail ↗</span>
                    </div>
                  </button>
                </div>

                {/* Section 3: Nasehat Spiritual (Full Width) */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider">
                    <HeartHandshake size={14} className="text-amber-500" />
                    Nasehat & Bimbingan Spiritual
                  </div>
                  <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200/70 dark:border-amber-900/40 space-y-2">
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {result.advice || "Tetaplah berprasangka baik kepada Allah SWT, perbanyak bersyukur bila bermimpi baik, dan perbanyak ta'awwudz bila merasa gelisah."}
                    </p>
                  </div>
                </div>

                {/* Section 4: Amalan, Sholawat, & Doa Terkait (Lengkap dengan Arab, Latin, Terjemah, Kaifiyah) */}
                {amalanData && (
                  <div className="space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-purple-500" />
                        Panduan Doa / Sholawat & Amalan
                      </span>
                      <button
                        onClick={handleCopyAmalan}
                        className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                      >
                        {copiedAmalan ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        {copiedAmalan ? 'Tersalin' : 'Salin Amalan'}
                      </button>
                    </div>

                    <div className="p-5 bg-gradient-to-br from-purple-50/90 via-indigo-50/50 to-purple-50/40 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-purple-950/30 rounded-3xl border border-purple-200/80 dark:border-purple-900/50 shadow-sm space-y-4">
                      {/* Amalan Title */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-black shadow-md shadow-purple-500/20">
                          🤲
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-purple-950 dark:text-purple-200">
                            {amalanData.title || 'Amalan Penenang Hati & Doa Perlindungan'}
                          </h4>
                          <p className="text-[10px] text-purple-700/80 dark:text-purple-400 font-medium">
                            Dianjurkan untuk diamalkan secara ikhlas
                          </p>
                        </div>
                      </div>

                      {/* Arabic Text */}
                      {amalanData.arabic && (
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-purple-100 dark:border-slate-800 shadow-inner">
                          <p 
                            className="text-xl sm:text-2xl font-serif text-right leading-loose tracking-wide text-slate-900 dark:text-slate-50 select-text" 
                            dir="rtl"
                            style={{ fontFamily: "'Amiri', 'Scheherazade New', 'Lateef', serif" }}
                          >
                            {amalanData.arabic}
                          </p>
                        </div>
                      )}

                      {/* Latin Transliteration */}
                      {amalanData.latin && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">
                            Transliterasi Latin:
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-purple-100/70 dark:border-slate-800">
                            "{amalanData.latin}"
                          </p>
                        </div>
                      )}

                      {/* Indonesian Translation */}
                      {amalanData.translation && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">
                            Artinya:
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-purple-100/70 dark:border-slate-800">
                            "{amalanData.translation}"
                          </p>
                        </div>
                      )}

                      {/* Kaifiyah / Tata Cara Mengamalkan */}
                      {amalanData.fadhilah && (
                        <div className="p-3 bg-purple-100/70 dark:bg-purple-900/40 rounded-xl flex items-start gap-2.5 text-xs text-purple-900 dark:text-purple-200">
                          <Sparkles size={16} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block text-[11px] font-extrabold uppercase tracking-wider">
                              Tata Cara / Kaifiyah:
                            </strong>
                            <p className="text-xs leading-relaxed mt-0.5">
                              {amalanData.fadhilah}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Section 5: Action Toolbar (Share, Laporkan, Salin, Riwayat) */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Share Button */}
                    <button
                      onClick={handleShare}
                      className="py-2.5 px-3 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-indigo-200/60 dark:border-indigo-900/40 active:scale-95"
                    >
                      <Share2 size={15} />
                      <span>Bagikan</span>
                    </button>

                    {/* Copy All Button */}
                    <button
                      onClick={handleCopyFullResult}
                      className="py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-emerald-200/60 dark:border-emerald-900/40 active:scale-95"
                    >
                      {copiedAll ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                      <span>{copiedAll ? 'Tersalin!' : 'Salin Teks'}</span>
                    </button>

                    {/* Report Button */}
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="py-2.5 px-3 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-rose-200/60 dark:border-rose-900/40 active:scale-95"
                    >
                      <Flag size={15} />
                      <span>Laporkan</span>
                    </button>

                    {/* History Button */}
                    <button
                      onClick={() => {
                        loadHistory();
                        setShowHistoryModal(true);
                      }}
                      className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-200/60 dark:border-slate-700/60 active:scale-95"
                    >
                      <History size={15} />
                      <span>Riwayat ({historyList.length})</span>
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer Information Card */}
        <div className="bg-slate-100/90 dark:bg-slate-900 p-4 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 flex gap-3 items-start border border-slate-200 dark:border-slate-800">
          <AlertCircle size={16} className="shrink-0 text-amber-500 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-700 dark:text-slate-300">Catatan Adab & Syariat:</p>
            <p className="leading-relaxed">
              Tafsir mimpi ini adalah ikhtiar pemaknaan bersumber dari literatur klasik dan bukan ketetapan mutlak takdir. Tetaplah bermunajat dan berprasangka baik kepada Allah SWT dalam setiap keadaan.
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 1. POPUP INDIKATOR LOADING INTERAKTIF */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-purple-100 dark:border-purple-900/50 text-center space-y-5 relative overflow-hidden"
            >
              <IslamicPattern className="text-purple-600 opacity-5" />

              {/* Glowing Celestial Icon */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-purple-500/20 dark:bg-purple-600/30 animate-ping opacity-75" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Moon size={30} className="animate-pulse text-purple-200" />
                </div>
              </div>

              {/* Title & Stage */}
              <div className="space-y-2">
                <h3 className="font-black text-base text-slate-900 dark:text-slate-50 flex items-center justify-center gap-1.5">
                  <Brain size={18} className="text-purple-600 animate-pulse" />
                  Mengkaji Ta'bir Mimpi
                </h3>
                <div className="h-10 flex items-center justify-center">
                  <p className="text-xs text-purple-700 dark:text-purple-300 font-bold px-2 transition-all duration-300">
                    {LOADING_STEPS[loadingStepIndex]}
                  </p>
                </div>
              </div>

              {/* Shimmer Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden relative">
                <div className="bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 h-full rounded-full w-full animate-[shimmer_1.5s_infinite]" />
              </div>

              {/* Hadith Quote */}
              <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl text-[11px] text-slate-600 dark:text-slate-300 space-y-1 border border-purple-100 dark:border-purple-900/30">
                <p className="font-serif text-xs text-slate-800 dark:text-slate-200 text-center font-semibold" dir="rtl">
                  الرُّؤْيَا الصَّالِحَةُ مِنَ اللَّهِ
                </p>
                <p className="italic text-[10px] text-slate-500 dark:text-slate-400 text-center">
                  "Mimpi yang baik itu adalah kabar gembira dari Allah..." (HR. Bukhari & Muslim)
                </p>
              </div>

              <p className="text-[10px] text-slate-400 font-medium">
                Mohon tunggu sejenak, AI sedang menelaah literatur klasik...
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 2. MODAL DETAIL REFERENSI KITAB & DALIL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showRefModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-emerald-100 dark:border-emerald-900/50 space-y-5 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-50">
                      Detail Rujukan Kitab & Sanad Ilmu
                    </h3>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      Khazanah Takwil Ahlam Ahlussunnah
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRefModal(false)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Kitab Main Info */}
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                <div className="flex items-center gap-2">
                  <Bookmark size={16} className="text-emerald-600" />
                  <h4 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-200">
                    {getReferenceTitle()}
                  </h4>
                </div>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Pengarang: {getReferenceAuthor()}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                  {getReferenceDetail()}
                </p>
              </div>

              {/* Kaidah & Sanad Penjelasan */}
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <h5 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  Kaidah Para Ulama dalam Menafsirkan Mimpi:
                </h5>
                <ul className="space-y-2 pl-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-black">1.</span>
                    <span><strong>Mimpi Bergantung pada Siapa yang Bermimpi:</strong> Simbol yang sama bisa memiliki takwil berbeda bagi seorang yang shalih dibanding orang yang fasik.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-black">2.</span>
                    <span><strong>Kaidah Waktu Tidur:</strong> Mimpi menjelang waktu sahur / subuh umumnya memiliki tingkat kejujuran (kebenaran) ru'ya yang lebih kuat dibanding mimpi awal malam.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-black">3.</span>
                    <span><strong>Bukan Landasan Hukum Syariat:</strong> Mimpi tidak dapat membatalkan hukum fiqih halal/haram yang sudah tsabit dalam Al-Qur'an dan As-Sunnah.</span>
                  </li>
                </ul>
              </div>

              {/* Close and Copy Reference buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${getReferenceTitle()} - Karya: ${getReferenceAuthor()}\n${getReferenceDetail()}`);
                    showToast("Referensi berhasil disalin!", "success");
                  }}
                  className="flex-1 py-3 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Copy size={14} />
                  <span>Salin Referensi</span>
                </button>
                <button
                  onClick={() => setShowRefModal(false)}
                  className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 rounded-2xl font-bold text-xs transition-all"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 3. MODAL RIWAYAT TAFSIR MIMPI */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <History size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100">
                      Riwayat Tafsir Mimpi
                    </h3>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      Tersimpan {historyList.length} pencarian sebelumnya
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
                {historyList.length === 0 ? (
                  <div className="py-12 text-center space-y-2 text-slate-400">
                    <Moon size={36} className="mx-auto text-emerald-300 dark:text-emerald-700" />
                    <p className="text-xs font-semibold">Belum ada riwayat tafsir mimpi tersimpan.</p>
                    <p className="text-[10px]">Tafsir mimpi yang Anda lakukan akan otomatis tersimpan di sini.</p>
                  </div>
                ) : (
                  historyList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectHistoryItem(item)}
                      className="p-3.5 bg-gradient-to-r from-emerald-50/40 via-indigo-50/20 to-transparent dark:from-emerald-950/30 dark:via-indigo-950/20 dark:to-transparent hover:from-emerald-50/80 hover:via-indigo-50/40 dark:hover:from-emerald-950/50 dark:hover:via-indigo-950/40 rounded-2xl border border-emerald-100/80 dark:border-emerald-900/40 cursor-pointer transition-all duration-200 group flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            {new Date(item.timestamp).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {item.result?.category && (
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-md">
                              {item.result.category}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          "{item.query}"
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                          {item.result?.interpretation || 'Lihat takwil lengkap...'}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shrink-0"
                        title="Hapus riwayat ini"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Actions */}
              {historyList.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={handleClearAllHistory}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                  >
                    <Trash2 size={14} />
                    <span>Hapus Semua</span>
                  </button>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="py-2 px-5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. MODAL LAPORKAN KONTEN */}
      {/* ========================================================================= */}
      <ContentReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        featureName="Tafsir Mimpi"
        contentSnippet={
          result
            ? `Mimpi: "${query}" | Takwil: ${result.interpretation || ''} | Ref: ${getReferenceTitle()}`
            : query
        }
        onSuccess={(msg) => showToast(msg, 'success')}
      />

    </div>
  );
};

export default ExpertConsultationScreen;
