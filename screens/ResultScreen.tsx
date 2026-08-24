
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TranslationResult } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useHistory } from '../contexts/HistoryContext';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/AuthContext';
import { deductWasilahForAI } from '../services/firebase';
import { UserAvatar } from '../components/UserAvatar';
import { v4 as uuidv4 } from 'uuid';
import { 
  Book, 
  GraduationCap, 
  Languages, 
  Feather, 
  Scale, 
  MessageSquareQuote, 
  Library,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  Share2,
  Quote,
  FileText,
  Download,
  AlignRight,
  GitBranch,
  BookOpenCheck,
  History,
  Music2,
  ScrollText,
  FileType,
  Users,
  GitCompare,
  LayoutGrid,
  ArrowRight,
  Volume2,     
  StopCircle,
  Loader2,
  Link,
  ChevronDown,
  ChevronUp,
  User,
  BookOpen,
  Flag,
  ZoomIn
} from 'lucide-react';
import { generateKitabAnalysis } from '../services/geminiService'; 
import { PLAYSTORE_LINK } from '../constants';
import { openExternalLink } from '../utils/linkUtils';
import CustomLoader from '../components/CustomLoader';
import { ContentReportModal } from '../components/ContentReportModal';
import { InsufficientWasilahModal } from '../components/InsufficientWasilahModal';
import { motion, AnimatePresence } from 'motion/react';

interface ResultScreenProps {
  fontSize: number;
}

// Unified Data Structure for UI
interface AnalysisData {
  originalText: string;
  matan?: string;
  arabGundul?: string;
  modernTranslation: string;
  maknaGandul: string;
  murab?: string;
  nahwuShorof?: string;
  lughah?: string;
  munawwir?: string;
  balaghah?: string;
  ushulFiqh?: string;
  bahtsulMasail?: string; // NEW
  ijma?: string;
  qiyas?: string;
  madzhab?: string;
  tajwid?: string;
  syarah?: string;
  munasabah?: string; // NEW
  asbabunNuzul?: string;
  asbabulWurud?: string;
  hikmah?: string;
  referensi?: string;
  quranRef?: string;
  hadithRef?: string;
  aiExplanation?: string;
}

const RESULT_CARDS = [
  { id: 'matan', label: 'Matan Berharakat', sub: 'Teks Arab Fusha', icon: AlignRight, 
    className: 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30' },
  { id: 'arabGundul', label: 'Arab Gundul', sub: 'Teks Kitab Kuning', icon: FileType, 
    className: 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30' },
  { id: 'modernTranslation', label: 'Terjemahan', sub: 'Bahasa Indonesia', icon: Book, 
    className: 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30' },
  { id: 'maknaGandul', label: 'Makna Gandul', sub: 'Makna Pesantren', icon: FileText, 
    className: 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30' },
  { id: 'murab', label: "Mu'rab", sub: "Analisis I'rab", icon: GitBranch, 
    className: 'bg-indigo-50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30' },
  { id: 'munasabah', label: 'Munasabah', sub: 'Korelasi Ayat', icon: Link, 
    className: 'bg-teal-50 dark:bg-teal-900/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900/30' },
  { id: 'madzhab', label: '4 Madzhab', sub: 'Perbandingan Fiqih', icon: LayoutGrid, 
    className: 'bg-purple-50 dark:bg-purple-900/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/30' },
  { id: 'ijma', label: 'Ijma Ulama', sub: 'Kesepakatan Hukum', icon: Users, 
    className: 'bg-cyan-50 dark:bg-cyan-900/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/30' },
  { id: 'qiyas', label: 'Qiyas', sub: 'Analogi Hukum', icon: GitCompare, 
    className: 'bg-lime-50 dark:bg-lime-900/10 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-900/30' },
  { id: 'syarah', label: 'Syarah & Tafsir', sub: 'Penjelasan Rinci', icon: ScrollText, 
    className: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  { id: 'munawwir', label: 'Kamus Munawwir', sub: 'Mufradat & Arti', icon: BookOpenCheck, 
    className: 'bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/30' },
  { id: 'nahwuShorof', label: 'Nahwu & Shorof', sub: 'Gramatika', icon: GraduationCap, 
    className: 'bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30' },
  { id: 'tajwid', label: 'Ilmu Tajwid', sub: 'Hukum Bacaan', icon: Music2, 
    className: 'bg-teal-50 dark:bg-teal-900/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900/30' },
  { id: 'asbab', label: 'Asbabun Nuzul/Wurud', sub: 'Sejarah Turun', icon: History, 
    className: 'bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/30' },
  { id: 'balaghah', label: 'Balaghah', sub: 'Keindahan Bahasa', icon: Feather, 
    className: 'bg-pink-50 dark:bg-pink-900/10 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-900/30' },
  { id: 'ushulFiqh', label: 'Ushul Fiqih', sub: 'Istinbath Hukum', icon: Scale, 
    className: 'bg-violet-50 dark:bg-violet-900/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-900/30' },
  { id: 'hikmah', label: 'Hikmah', sub: 'Kesimpulan', icon: MessageSquareQuote, 
    className: 'bg-sky-50 dark:bg-sky-900/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/30' },
  { id: 'bahtsulMasail', label: 'Bahtsul Masail', sub: 'Tanya Jawab Pesantren', icon: MessageSquareQuote, 
    className: 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30' },
  { id: 'referensi', label: 'Referensi', sub: 'Kitab Serupa', icon: Library, 
    className: 'bg-stone-50 dark:bg-stone-900/10 text-stone-700 dark:text-stone-400 border-stone-200 dark:border-stone-900/30' },
];

const ensureString = (value: any): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? "Ya" : "Tidak";
  
  if (Array.isArray(value)) {
    return value.map(v => ensureString(v)).join('\n');
  }
  
  if (typeof value === 'object') {
    return Object.entries(value)
      .map(([k, v]) => {
         if (!isNaN(Number(k))) return ensureString(v);
         return `${k}: ${ensureString(v)}`;
      })
      .join('\n');
  }
  
  return String(value);
};

const parseReferences = (text: string): string[] => {
  if (!text) return [];
  const result: string[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  for (const line of lines) {
    const inlineNumbered = line.split(/(?=\b\d+[\.\)]\s+)/);
    if (inlineNumbered.length > 1) {
      for (const item of inlineNumbered) {
        const cleaned = item.replace(/^[-*•\d+[\.\)]\s*/, '').trim();
        if (cleaned.length > 1) {
          result.push(cleaned);
        }
      }
    } else {
      const cleanLine = line.replace(/^[-*•\d+[\.\)]\s*/, '').trim();
      if (cleanLine.length === 0) continue;
      
      if (cleanLine.includes(';')) {
        const parts = cleanLine.split(';').map(p => p.trim()).filter(p => p.length > 1);
        result.push(...parts);
      } else {
        const parts: string[] = [];
        let current = "";
        let parenDepth = 0;
        
        for (let i = 0; i < cleanLine.length; i++) {
          const char = cleanLine[i];
          if (char === '(' || char === '[' || char === '{') {
            parenDepth++;
            current += char;
          } else if (char === ')' || char === ']' || char === '}') {
            if (parenDepth > 0) parenDepth--;
            current += char;
          } else if (parenDepth === 0 && char === ',') {
            if (current.trim().length > 1) {
              parts.push(current.trim());
            }
            current = "";
          } else {
            current += char;
          }
        }
        if (current.trim().length > 1) {
          parts.push(current.trim());
        }

        const finalParts: string[] = [];
        for (const part of parts) {
          const subParts: string[] = [];
          let subCurrent = "";
          let subParenDepth = 0;
          
          for (let i = 0; i < part.length; i++) {
            const char = part[i];
            if (char === '(' || char === '[' || char === '{') {
              subParenDepth++;
              subCurrent += char;
            } else if (char === ')' || char === ']' || char === '}') {
              if (subParenDepth > 0) subParenDepth--;
              subCurrent += char;
            } else if (subParenDepth === 0 && 
                       (part.substring(i, i + 5).toLowerCase() === ' dan ' || 
                        part.substring(i, i + 5).toUpperCase() === ' AND ' ||
                        part.substring(i, i + 3) === ' & ')) {
              if (subCurrent.trim().length > 1) {
                subParts.push(subCurrent.trim());
              }
              const skipLen = part.substring(i, i + 5).toLowerCase() === ' dan ' || part.substring(i, i + 5).toUpperCase() === ' AND ' ? 5 : 3;
              i += skipLen - 1;
              subCurrent = "";
            } else {
              subCurrent += char;
            }
          }
          if (subCurrent.trim().length > 1) {
            subParts.push(subCurrent.trim());
          }
          
          finalParts.push(...subParts);
        }

        for (const p of finalParts) {
          const cleanedP = p.replace(/^[-*•\d+[\.\)]\s*/, '').trim();
          if (cleanedP.length > 1) {
            result.push(cleanedP);
          }
        }
      }
    }
  }
  
  return Array.from(new Set(result.map(r => r.trim()).filter(r => r.length > 1)));
};

const ResultScreen: React.FC<ResultScreenProps> = ({ fontSize }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { addToHistory } = useHistory();
  const { isPlaying, currentTtsInfo, speakTts, prefetchTts, isLoading: isAudioLoading } = useAudio();
  const { user, userData } = useAuth();
  
  const state = location.state || {};
  const { result, mode, query, source, originalText, focus } = state;

  const toggleAccordion = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const sanitizeAnalysisData = (raw: any): AnalysisData => {
    if (!raw) return raw;
    const res: any = {};
    Object.keys(raw).forEach(key => {
      res[key] = ensureString(raw[key]);
    });

    const isPlaceholder = (str: string) => {
      if (!str) return true;
      const s = str.trim();
      return s === '...' || s === '..' || s === '.' || s.includes('Teks asli input/matan Arab') || s === 'null' || s === 'undefined';
    };

    if (isPlaceholder(res.originalText)) {
      if (!isPlaceholder(res.matan)) {
        res.originalText = res.matan;
      } else {
        res.originalText = ensureString(raw.query || raw.title || "Menganalisis Teks...");
      }
    }
    if (isPlaceholder(res.matan)) {
      res.matan = res.originalText;
    }

    if (res.aiExplanation && res.aiExplanation.length > 5) {
      if (!res.syarah || res.syarah.length < 5) {
        res.syarah = res.aiExplanation;
      }
      if (!res.modernTranslation || res.modernTranslation.length < 5) {
        res.modernTranslation = res.aiExplanation;
      }
    }

    if (!res.modernTranslation && res.syarah) {
      res.modernTranslation = res.syarah;
    }
    if (!res.syarah && res.modernTranslation) {
      res.syarah = res.modernTranslation;
    }

    return res as AnalysisData;
  };

  const [data, setData] = useState<AnalysisData | null>(() => {
    if (state.data) return sanitizeAnalysisData(state.data);
    if (result) {
        return sanitizeAnalysisData({
            originalText: ensureString(result.originalText),
            matan: ensureString(result.matan),
            arabGundul: ensureString(result.arabGundul),
            modernTranslation: ensureString(result.modernTranslation),
            maknaGandul: ensureString(result.maknaGandul),
            murab: ensureString(result.murab),
            nahwuShorof: ensureString(result.nahwuShorof),
            lughah: ensureString(result.lughah),
            munawwir: ensureString(result.munawwir),
            balaghah: ensureString(result.balaghah),
            ushulFiqh: ensureString(result.ushulFiqh),
            ijma: ensureString(result.ijma),
            qiyas: ensureString(result.qiyas),
            madzhab: ensureString(result.madzhab),
            tajwid: ensureString(result.tajwid),
            syarah: ensureString(result.syarah),
            munasabah: ensureString(result.munasabah),
            asbabunNuzul: ensureString(result.asbabunNuzul),
            asbabulWurud: ensureString(result.asbabulWurud),
            bahtsulMasail: ensureString(result.bahtsulMasail),
            hikmah: ensureString(result.hikmah),
            referensi: ensureString(result.referensi),
            quranRef: ensureString(result.quranRef),
            hadithRef: ensureString(result.hadithRef),
            aiExplanation: ensureString(result.aiExplanation)
        });
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textCopied, setTextCopied] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reportData, setReportData] = useState<{ featureName: string; snippet: string } | null>(null);
  const [showNoWasilahModal, setShowNoWasilahModal] = useState(false);
  const [textScaleLevel, setTextScaleLevel] = useState<number>(0);

  const handleToggleZoom = () => {
    setTextScaleLevel((prev) => (prev + 1) % 3);
  };
  
  const isSharing = useRef(false);
  const autoFocusTriggered = useRef(false);

  // Trigger Prefetch for original text when data is loaded
  useEffect(() => {
    if (data?.originalText) {
      prefetchTts(data.originalText, true);
    }
  }, [data, prefetchTts]);

  // --- 1. INITIALIZE DATA ---
  useEffect(() => {
    if (data) {
        // If we have data and there's a focus request that hasn't been triggered yet
        if (focus && !autoFocusTriggered.current) {
            const card = RESULT_CARDS.find(c => c.id === focus);
            if (card) {
                autoFocusTriggered.current = true;
                setExpandedId(card.id);
            }
        }
        return;
    }

    if ((mode === 'kitab' || mode === 'bedah_kitab') && query) {
      const runAnalysis = async () => {
        if (!user) {
          setError("Silakan login terlebih dahulu untuk menggunakan fitur Bedah AI.");
          return;
        }

        const currentWasilah = Math.max(0, Number(userData?.wasilah ?? userData?.wasilahPoints ?? 0));
        if (currentWasilah < 1) {
          setShowNoWasilahModal(true);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        
        const contextText = originalText || query;

        try {
          const parsed = await generateKitabAnalysis(query, source || 'Umum', originalText, focus);
          
          if (parsed?.sourceType === 'AI_FRESH' || !parsed?.sourceType) {
            try {
              await deductWasilahForAI(user.uid, 1, `Bedah Kitab - ${query.substring(0, 30)}...`);
            } catch (dErr) {
              console.warn("Deduct Wasilah error in ResultScreen:", dErr);
            }
          }

          showToast("Berhasil membedah kitab! (-1 Wasilah)", "success");
          
          const sanitizedData = sanitizeAnalysisData(parsed);
          setData(sanitizedData);
          
          const newResult: TranslationResult = {
            id: uuidv4(),
            originalText: sanitizedData.originalText || query,
            matan: sanitizedData.matan,
            arabGundul: sanitizedData.arabGundul,
            maknaGandul: sanitizedData.maknaGandul,
            modernTranslation: sanitizedData.modernTranslation,
            murab: sanitizedData.murab,
            nahwuShorof: sanitizedData.nahwuShorof,
            lughah: sanitizedData.lughah,
            munawwir: sanitizedData.munawwir,
            balaghah: sanitizedData.balaghah,
            ushulFiqh: sanitizedData.ushulFiqh,
            ijma: sanitizedData.ijma,
            qiyas: sanitizedData.qiyas,
            madzhab: sanitizedData.madzhab,
            tajwid: sanitizedData.tajwid,
            syarah: sanitizedData.syarah,
            asbabunNuzul: sanitizedData.asbabunNuzul,
            asbabulWurud: sanitizedData.asbabulWurud,
            bahtsulMasail: sanitizedData.bahtsulMasail,
            hikmah: sanitizedData.hikmah,
            referensi: sanitizedData.referensi,
            quranRef: sanitizedData.quranRef,
            hadithRef: sanitizedData.hadithRef,
            aiExplanation: sanitizedData.syarah || sanitizedData.aiExplanation, 
            createdAt: new Date().toISOString(),
            synced: false
          };

          addToHistory({
            id: newResult.id,
            type: 'translation',
            title: source ? `${query} (${source})` : query,
            subtitle: "Bedah Kitab Lengkap",
            timestamp: newResult.createdAt,
            path: '/result',
            data: { result: newResult }
          });
          
          navigate('.', { replace: true, state: { ...state, data: sanitizedData } });

        } catch (error: any) {
          let friendlyError = "Gagal menganalisis teks. Silakan coba lagi.";
          if (error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
             friendlyError = "Server sedang sibuk (Quota Exceeded). Mohon tunggu beberapa saat lagi.";
          }

          setError(friendlyError);
          const fallback = {
             originalText: ensureString(originalText || query || "Teks tidak tersedia"),
             modernTranslation: friendlyError,
             maknaGandul: "Gagal memuat.",
             nahwuShorof: "Periksa koneksi internet Anda.",
          };
          setData(fallback as any);
        } finally {
          setLoading(false);
        }
      };
      runAnalysis();
    }
  }, [result, mode, query, source, originalText, data, navigate, state, addToHistory, focus]);

  const openDetail = (card: typeof RESULT_CARDS[0], customData?: AnalysisData) => {
    let content = "";
    const activeData = customData || data;
    if (activeData) {
        if (card.id === 'asbab') {
            content = (activeData.asbabunNuzul && activeData.asbabunNuzul !== 'null' && activeData.asbabunNuzul.length > 10) 
                ? `[ASBABUN NUZUL]\n${activeData.asbabunNuzul}` 
                : (activeData.asbabulWurud && activeData.asbabulWurud !== 'null' && activeData.asbabulWurud.length > 10)
                    ? `[ASBABUL WURUD]\n${activeData.asbabulWurud}`
                    : "Tidak ada data Asbabun Nuzul/Wurud untuk teks ini.";
        } else {
            content = (activeData as any)[card.id];
        }
    }

    if (!content || content === 'null' || content.length < 3) {
        if (!customData) showToast("Data tidak tersedia untuk bagian ini.", "info");
        return;
    }

    navigate('/result-detail', { 
        state: { 
            id: card.id,
            label: card.label, 
            sub: card.sub, 
            content: ensureString(content),
            className: card.className 
        } 
    });
  };

  const handleShare = async (title: string, text: string) => {
    if (isSharing.current) return;
    isSharing.current = true;

    const safeText = `${ensureString(text)}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;

    if (window.AndroidNativeInterface?.shareText) {
      try {
        window.AndroidNativeInterface.shareText(title, safeText);
      } catch (e) {
        navigator.clipboard.writeText(safeText);
        showToast('Teks disalin ke clipboard.', 'success'); 
      } finally {
        isSharing.current = false;
      }
    } else if (navigator.share) {
      try {
        await navigator.share({ title: title, text: safeText });
      } catch (err: any) { 
        if (err.name !== 'AbortError') {
            navigator.clipboard.writeText(safeText);
            showToast('Teks disalin ke clipboard.', 'success'); 
        }
      } finally {
        isSharing.current = false;
      }
    } else {
      navigator.clipboard.writeText(safeText);
      showToast('Teks disalin ke clipboard', 'success');
      isSharing.current = false;
    }
  };

  const handleSaveToFile = () => {
    if (!data) return;
    
    const fileContent = `HASIL BEDAH KITAB & ANALISIS
(Santri AI App)
---------------------------------
Waktu: ${new Date().toLocaleString('id-ID')}
Topik: ${source ? `${query} (${source})` : query || 'Terjemahan Teks'}

[TEKS ASLI]
${data.originalText}

[MATAN BERHARAKAT]
${data.matan || '-'}

[ARAB GUNDUL]
${data.arabGundul || '-'}

[TERJEMAHAN]
${data.modernTranslation}

[MAKNA GANDUL]
${data.maknaGandul}

[ANALISIS I'RAB (MU'RAB)]
${data.murab || '-'}

[SYARAH & TAFSIR]
${data.syarah || '-'}

[MUNASABAH]
${data.munasabah || '-'}

[IJMA ULAMA]
${data.ijma || '-'}

[QIYAS]
${data.qiyas || '-'}

[4 MADZHAB]
${data.madzhab || '-'}

[ANALISIS MUNAWWIR]
${data.munawwir || '-'}

[NAHWU & SHOROF]
${data.nahwuShorof || '-'}

[BAHTSUL MASAIL]
${data.bahtsulMasail || '-'}

Download Aplikasi: ${PLAYSTORE_LINK}
`;

    const filename = `BedahKitab_${Date.now()}.txt`;

    if (window.AndroidNativeInterface?.saveTextToFile) {
        try {
            window.AndroidNativeInterface.saveTextToFile(filename, fileContent);
            showToast("Menyimpan ke file...", "info");
        } catch (e) {
            showToast("Gagal menyimpan ke perangkat.", "error");
        }
    } else {
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        showToast("File diunduh (Browser Mode)", "success");
    }
  };

  const handleBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleReferenceClick = (query: string, type?: 'quran' | 'hadis') => {
    const cleanQuery = query.replace(/^\d+[\.\)]\s*/, '').trim();
    if (type === 'quran') {
      navigate('/quran', { state: { autoSearch: cleanQuery } });
    } else if (type === 'hadis') {
      navigate('/hadis', { state: { autoSearch: cleanQuery } });
    } else {
      navigate('/kitab', { state: { autoSearch: cleanQuery } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans">
        <div className="sticky top-0 z-50 bg-[#005a2b] dark:bg-emerald-950 text-white pt-5 pb-4 px-4 rounded-b-[1.5rem] shadow-md flex items-center justify-between gap-3 transition-colors mb-4">
             <div className="flex items-center gap-3 overflow-hidden">
                  <button 
                    type="button"
                    onClick={handleBack} 
                    className="p-2 -ml-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all flex-shrink-0"
                  >
                     <ArrowLeft size={24} />
                  </button>
                  <h2 className="font-bold text-white text-base md:text-lg flex items-center gap-2 truncate">
                     <Sparkles size={18} className="text-emerald-300 dark:text-santri-gold flex-shrink-0 animate-pulse" />
                     <span className="truncate">Hasil Bedah Kitab</span>
                     {loading && <Loader2 size={16} className="animate-spin text-emerald-200 ml-1 flex-shrink-0" />}
                  </h2>
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

        <div className="px-0 pt-0 space-y-0 animate-in fade-in transition-all duration-500">
              {loading ? (
                 <div className="px-4 pt-10">
                    <CustomLoader message="Sedang Menerjemahkan & Menganalisis..." />
                 </div>
              ) : (
                <>
                  {/* Hero Header Section - More Compact with Background */}
                  <div className="bg-gradient-to-b from-emerald-50/90 via-emerald-50/40 to-emerald-100/20 dark:from-emerald-950/60 dark:via-emerald-950/30 dark:to-slate-950 px-4 pt-6 pb-5 text-center border-b border-emerald-100/80 dark:border-emerald-900/50 relative overflow-hidden">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center relative z-10"
                      >
                          <div className="w-14 h-16 mb-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 flex items-center justify-center shadow-xs transform -rotate-2">
                              <BookOpen size={28} className="text-emerald-700 dark:text-emerald-300" />
                          </div>

                          <h1 className="font-serif text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 leading-tight px-4 text-center italic">
                             {query || source || "Bedah Kitab"}
                          </h1>

                          {source && (
                             <motion.button 
                               whileHover={{ scale: 1.02 }}
                               whileTap={{ scale: 0.98 }}
                               onClick={() => navigate('/kitab', { state: { autoSearch: source } })}
                               className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[9.5px] font-black uppercase tracking-widest rounded-full border border-emerald-200 dark:border-emerald-800 mb-2 hover:bg-emerald-200 transition-colors shadow-2xs"
                             >
                                <Book size={12} /> {source}
                             </motion.button>
                          )}

                          <div className="flex items-center gap-2 text-emerald-700/70 dark:text-emerald-400/60 text-[8.5px] font-bold uppercase tracking-[0.25em]">
                             <Sparkles size={10} className="text-amber-500 fill-amber-400" />
                             Santri AI Analysis Results
                          </div>
                      </motion.div>
                  </div>

                  <div className="p-3 space-y-3">
                    {/* Teks Asli Section - Compact */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-slate-200 dark:border-slate-800 shadow-lg transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none group-hover:bg-emerald-100 transition-colors opacity-50" />
                        
                        <div className="flex justify-between items-center mb-4 p-2.5 px-3.5 bg-emerald-50/90 dark:bg-emerald-950/50 rounded-2xl border border-emerald-100/80 dark:border-emerald-900/40 relative z-10">
                           <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                               <BookOpen size={13} className="text-emerald-600 dark:text-emerald-400" />
                               TEKS ASLI / MATAN
                           </p>
                           <div className="flex gap-1.5">
                              <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleZoom();
                                }}
                                className={`p-2 rounded-xl transition-all shadow-2xs border ${
                                    textScaleLevel > 0 
                                        ? 'bg-emerald-600 text-white border-emerald-600' 
                                        : 'bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-200 dark:hover:bg-emerald-800'
                                }`}
                                title="Perbesar / Ubah Ukuran Teks"
                              >
                                 <ZoomIn size={15} className="shrink-0" />
                              </button>
                              <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    speakTts(data?.originalText || '', true, "Teks Asli", 'original');
                                }}
                                className={`p-2 rounded-xl transition-all shadow-2xs ${currentTtsInfo?.id === 'original' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-slate-800'}`}
                              >
                                 {isAudioLoading && currentTtsInfo?.id === 'original' ? <Loader2 size={15} className="animate-spin" /> : currentTtsInfo?.id === 'original' && isPlaying ? <StopCircle size={15} /> : <Volume2 size={15} />}
                              </button>
                              <button 
                                onClick={() => {
                                   if(data?.originalText) {
                                      navigator.clipboard.writeText(ensureString(data.originalText));
                                      setTextCopied(true);
                                      showToast("Teks disalin", "success");
                                      setTimeout(() => setTextCopied(false), 2000);
                                   }
                                }}
                                className="p-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-slate-800 rounded-xl shadow-2xs transition-all"
                              >
                                 {textCopied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                              </button>
                           </div>
                        </div>
                        
                        {error ? (
                           <div className="py-3 text-center text-red-500 text-xs bg-red-50 dark:bg-red-900/10 rounded-lg">{error}</div>
                        ) : (
                          <div className="relative z-10">
                              <p 
                                  className="font-arabic text-2xl md:text-3xl text-center leading-[2.2] text-slate-800 dark:text-slate-200 drop-shadow-sm whitespace-pre-line transition-all" 
                                  style={{ fontSize: `${26 * (1 + textScaleLevel * 0.2)}px` }}
                                  dir="auto"
                              >
                                  {ensureString(data?.originalText || "...")}
                              </p>
                              
                              <div className="mt-4 flex flex-wrap justify-center gap-2 relative z-10">
                                 {(data?.quranRef && data.quranRef !== 'null') && parseReferences(ensureString(data.quranRef)).map((ref, idx) => (
                                      <button 
                                        key={`quran-${idx}`}
                                        onClick={() => handleReferenceClick(ref, 'quran')}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[9.5px] font-normal rounded-xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm uppercase tracking-wider active:scale-95 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                                      >
                                          <BookOpenCheck size={11} /> {ref}
                                      </button>
                                  ))}
                                  {(data?.hadithRef && data.hadithRef !== 'null') && parseReferences(ensureString(data.hadithRef)).map((ref, idx) => (
                                      <button 
                                        key={`hadith-${idx}`}
                                        onClick={() => handleReferenceClick(ref, 'hadis')}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[9.5px] font-normal rounded-xl border border-blue-100 dark:border-blue-800/50 shadow-sm uppercase tracking-wider active:scale-95 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/60"
                                      >
                                          <Quote size={11} /> {ref}
                                      </button>
                                  ))}
                              </div>
                          </div>
                        )}
                    </div>

                    {/* Accordion Results List - Dense */}
                    <div className="space-y-3.5 pb-20">
                          {RESULT_CARDS.map((card) => {
                              const content = card.id === 'asbab' 
                                  ? (data?.asbabunNuzul || data?.asbabulWurud) 
                                  : (data as any)?.[card.id];
                              
                              const hasData = content && content !== 'null' && content.length > 3;
                              const isArabicContent = ['matan', 'arabGundul', 'tajwid'].includes(card.id);
                              const isExpanded = expandedId === card.id;

                              if (!hasData && ['tajwid', 'asbab', 'munawwir', 'arabGundul', 'ijma', 'qiyas', 'madzhab', 'munasabah', 'referensi'].includes(card.id)) return null;

                              return (
                                  <div 
                                    key={card.id}
                                    className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-emerald-500/20 shadow-md scale-[1.01]' : 'hover:shadow-md'}`}
                                  >
                                      <div
                                          onClick={() => toggleAccordion(card.id)}
                                          className={`w-full flex items-center justify-between p-3.5 px-4 text-left transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800/80 ${
                                              isExpanded 
                                                  ? 'bg-emerald-50/80 dark:bg-emerald-950/50' 
                                                  : 'bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800'
                                          }`}
                                      >
                                          <div className="flex items-center gap-3">
                                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 ${card.className}`}>
                                                  <card.icon size={18} strokeWidth={2.5} />
                                              </div>
                                              <div>
                                                  <h4 className="font-extrabold text-[12px] md:text-sm text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-tight mb-0.5">
                                                      {card.label}
                                                  </h4>
                                                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest leading-none mt-0 opacity-85">
                                                      {card.sub}
                                                  </p>
                                              </div>
                                          </div>

                                          <div className="flex items-center gap-2">
                                              <button 
                                                  onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleToggleZoom();
                                                  }}
                                                  className={`p-1.5 rounded-lg border transition-all ${
                                                      textScaleLevel > 0 
                                                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' 
                                                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80'
                                                  }`}
                                                  title="Perbesar / Ubah Ukuran Teks"
                                              >
                                                  <ZoomIn size={14} className="shrink-0" />
                                              </button>
                                              {hasData && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        speakTts(ensureString(content), isArabicContent, card.label, card.id);
                                                    }}
                                                    className={`p-1.5 rounded-lg border transition-colors ${currentTtsInfo?.id === card.id ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-slate-800'}`}
                                                >
                                                    {isAudioLoading && currentTtsInfo?.id === card.id ? <Loader2 size={14} className="animate-spin" /> : currentTtsInfo?.id === card.id && isPlaying ? <StopCircle size={14} /> : <Volume2 size={14} />}
                                                </button>
                                              )}
                                              {isExpanded ? <ChevronUp size={16} className="text-slate-400 dark:text-slate-500" /> : <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />}
                                          </div>
                                      </div>

                                      <AnimatePresence>
                                          {isExpanded && (
                                            <motion.div
                                               initial={{ height: 0, opacity: 0 }}
                                               animate={{ height: 'auto', opacity: 1 }}
                                               exit={{ height: 0, opacity: 0 }}
                                               className="overflow-hidden"
                                            >
                                               <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-800/30">
                                                  <div 
                                                    className={`p-4 rounded-xl mt-3 transition-all ${isArabicContent ? 'bg-slate-50 dark:bg-slate-950 font-arabic text-right leading-[1.8]' : 'prose prose-sm max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-left whitespace-pre-line text-xs font-semibold'}`} 
                                                    style={{ fontSize: `${(isArabicContent ? 22 : 13) * (1 + textScaleLevel * 0.2)}px` }}
                                                    dir={isArabicContent ? 'rtl' : 'ltr'}
                                                  >
                                                      {card.id === 'referensi' ? (
                                                        <div className="flex flex-col gap-2 my-1.5">
                                                          {parseReferences(ensureString(content)).map((ref, idx) => {
                                                            const cleanLine = ref.replace(/^\d+[\.\)]\s*/, '').trim();
                                                            return (
                                                              <button
                                                                key={idx}
                                                                onClick={() => handleReferenceClick(ref)}
                                                                className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-slate-950/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-2xl transition-all text-left border border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 group shadow-sm active:scale-[0.98]"
                                                              >
                                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors shadow-inner shrink-0">
                                                                  <Book size={18} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <span className="text-xs font-normal text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 block leading-tight">{cleanLine}</span>
                                                                    <span className="text-[8px] font-normal text-slate-400 uppercase tracking-widest block mt-0.5">Detail Kitab & Referensi</span>
                                                                </div>
                                                                <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-all group-hover:translate-x-0.5 shrink-0" />
                                                              </button>
                                                            );
                                                          })}
                                                        </div>
                                                      ) : card.id === 'madzhab' ? (
                                                        <div className="space-y-3.5">
                                                          <div className="p-3.5 bg-amber-50/90 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/60 text-[11px] leading-relaxed text-amber-900 dark:text-amber-200 shadow-xs">
                                                            <div className="flex items-center gap-2 font-black text-amber-800 dark:text-amber-300 mb-2 text-xs border-b border-amber-200/60 dark:border-amber-800/50 pb-1.5">
                                                              <Scale size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                                                              <span>Pedoman Fiqih: Memahami & Bertaqlid 4 Madzhab</span>
                                                            </div>
                                                            <ul className="space-y-2 font-medium opacity-90 list-disc pl-4">
                                                              <li>
                                                                <strong className="font-extrabold text-amber-950 dark:text-amber-100">Tujuan Perbandingan:</strong> Perbandingan 4 madzhab ini disajikan semata-mata untuk menambah wawasan ilmu pengetahuan (khazanah fikih) dan kelapangan dada.
                                                              </li>
                                                              <li>
                                                                <strong className="font-extrabold text-amber-950 dark:text-amber-100">Pegangan Utama Awam:</strong> Bagi orang awam atau pemula, dianjurkan konsisten mengikuti 1 madzhab utama yang dianut mayoritas masyarakat dan ulama di wilayahnya (seperti Madzhab Syafi'i di Indonesia) agar ibadahnya teratur dan sah secara sistematis.
                                                              </li>
                                                              <li>
                                                                <strong className="font-extrabold text-amber-950 dark:text-amber-100">Larangan Talfiq:</strong> Dilarang mencampuradukkan hukum (talfiq) beberapa madzhab dalam satu rangkaian ibadah yang sama hingga membatalkan ibadah menurut semua madzhab tersebut. <em>Contoh: Berwudhu mengusap sebagian kecil kepala ala Madzhab Syafi'i, lalu bersentuhan kulit lawan jenis non-mahram tapi menganggap tidak batal ikut Madzhab Hanafi — wudhu & shalat ini menjadi tidak sah.</em>
                                                              </li>
                                                              <li>
                                                                <strong className="font-extrabold text-amber-950 dark:text-amber-100">Ketentuan Pindah Madzhab:</strong> Bertaqlid ke madzhab lain diperbolehkan bila ada hajat/kondisi darurat khusus (seperti saat Tawaf di Masjidil Haram yang padat), dengan syarat mengikuti seluruh aturan & syarat sahnya ibadah tersebut secara utuh sesuai madzhab yang dituju.
                                                              </li>
                                                            </ul>
                                                          </div>
                                                          <div className="whitespace-pre-line leading-relaxed pt-1">
                                                            {ensureString(content)}
                                                          </div>
                                                        </div>
                                                      ) : (
                                                        ensureString(content)
                                                      )}
                                                  </div>
                                                  
                                                  <div className="mt-3 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar flex-nowrap w-full pt-2 border-t border-slate-100 dark:border-slate-800/50">
                                                      <button 
                                                        onClick={() => handleShare(card.label, content)}
                                                        className="flex-1 min-w-0 px-2 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-[10px] font-black text-slate-700 dark:text-slate-300 rounded-xl tracking-tight transition-all border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center gap-1 shrink-0 whitespace-nowrap active:scale-95 cursor-pointer"
                                                        title="Bagikan Teks"
                                                      >
                                                         <Share2 size={11} className="shrink-0" />
                                                         <span className="truncate">Share</span>
                                                      </button>
                                                      <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(ensureString(content));
                                                            showToast(`${card.label} disalin`, "success");
                                                        }}
                                                        className="flex-1 min-w-0 px-2 py-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-[10px] font-black text-slate-700 dark:text-slate-300 rounded-xl tracking-tight transition-all border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center gap-1 shrink-0 whitespace-nowrap active:scale-95 cursor-pointer"
                                                        title="Salin Teks"
                                                      >
                                                         <Copy size={11} className="shrink-0" />
                                                         <span className="truncate">Salin</span>
                                                      </button>
                                                      <button 
                                                        onClick={() => setReportData({ featureName: `Bedah Kitab - ${card.label}`, snippet: ensureString(content) })}
                                                        title="Laporkan Masalah / Koreksi ke Admin"
                                                        className="flex-1 min-w-0 px-2 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-[10px] font-black text-rose-700 dark:text-rose-300 rounded-xl tracking-tight transition-all border border-rose-200/80 dark:border-rose-800/60 flex items-center justify-center gap-1 shrink-0 whitespace-nowrap active:scale-95 cursor-pointer"
                                                      >
                                                         <Flag size={11} className="shrink-0" />
                                                         <span className="truncate">Laporkan</span>
                                                      </button>
                                                  </div>
                                               </div>
                                            </motion.div>
                                          )}
                                      </AnimatePresence>
                                  </div>
                              );
                          })}
                    </div>
                  </div>
                </>
              )}
        </div>

        <ContentReportModal
          isOpen={!!reportData}
          onClose={() => setReportData(null)}
          featureName={reportData?.featureName || 'Bedah Kitab'}
          contentSnippet={reportData?.snippet || ''}
          onSuccess={(msg) => showToast(msg, 'success')}
        />

        <InsufficientWasilahModal
          isOpen={showNoWasilahModal}
          onClose={() => setShowNoWasilahModal(false)}
          requiredWasilah={1}
          featureName="Bedah Kitab Kuning AI"
        />
    </div>
  );
};

export default ResultScreen;
