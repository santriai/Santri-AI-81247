
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useAudio } from '../contexts/AudioContext';
import { PLAYSTORE_LINK } from '../constants';
import { 
  ArrowLeft, 
  Copy, 
  Share2, 
  Check, 
  Book, 
  FileText, 
  GraduationCap, 
  Languages, 
  Feather, 
  Scale, 
  MessageSquareQuote, 
  Library, 
  Sparkles,
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
  Flag,
  ZoomIn
} from 'lucide-react';
import { openExternalLink } from '../utils/linkUtils';
import { ContentReportModal } from '../components/ContentReportModal';

interface ResultDetailProps {
  fontSize: number;
}

const ICONS: Record<string, any> = {
  matan: AlignRight,
  arabGundul: FileType,
  modernTranslation: Book,
  maknaGandul: FileText,
  murab: GitBranch,
  nahwuShorof: GraduationCap,
  lughah: Languages,
  munawwir: BookOpenCheck,
  balaghah: Feather,
  ushulFiqh: Scale,
  ijma: Users,
  qiyas: GitCompare,
  madzhab: LayoutGrid,
  tajwid: Music2,
  syarah: ScrollText,
  asbab: History,
  hikmah: MessageSquareQuote,
  referensi: Library,
  aiExplanation: Sparkles
};

const ResultDetailScreen: React.FC<ResultDetailProps> = ({ fontSize }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { isPlaying, currentTtsInfo, speakTts, prefetchTts, isLoading: isAudioLoading } = useAudio();
  const { id, label, sub, content, className } = location.state || {};

  const [copied, setCopied] = useState(false);
  const [textScaleLevel, setTextScaleLevel] = useState<number>(0);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const isSharing = useRef(false);

  const handleToggleZoom = () => {
    setTextScaleLevel((prev) => (prev + 1) % 3);
  };

  const isArabic = ['matan', 'arabGundul', 'quranRef', 'hadithRef', 'tajwid'].includes(id);

  // Trigger Prefetch for this detail view
  useEffect(() => {
    if (content) {
      prefetchTts(content, isArabic);
    }
  }, [content, isArabic, prefetchTts]);

  const handleSpeak = async () => {
    if (!content) return;
    speakTts(content, isArabic, label || "Detail Santri", id);
  };

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Data tidak ditemukan</p>
          <button onClick={() => navigate(-1)} className="text-santri-green font-bold">Kembali</button>
        </div>
      </div>
    );
  }

  const Icon = ICONS[id] || Book;

  const bgClass = className?.split(' ').find((c: string) => c.startsWith('bg-')) || 'bg-slate-50';
  const textClass = className?.split(' ').find((c: string) => c.startsWith('text-')) || 'text-slate-700';
  const borderClass = className?.split(' ').find((c: string) => c.startsWith('border-')) || 'border-slate-200';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    showToast("Teks disalin ke clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (isSharing.current) return;
    isSharing.current = true;

    const shareContent = `${content}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;

    if (window.AndroidNativeInterface?.shareText) {
      try {
        window.AndroidNativeInterface.shareText(label, shareContent);
      } catch (e) {
        navigator.clipboard.writeText(shareContent);
        showToast('Teks disalin ke clipboard.', 'success');
      } finally {
        isSharing.current = false;
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: label,
          text: shareContent,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
           navigator.clipboard.writeText(shareContent);
           showToast('Teks disalin ke clipboard.', 'success');
        }
      } finally {
        isSharing.current = false;
      }
    } else {
      navigator.clipboard.writeText(shareContent);
      showToast('Teks disalin ke clipboard', 'success');
      isSharing.current = false;
    }
  };

  const handleReferenceClick = (refName: string) => {
    const cleanedName = refName.replace(/^[0-9]+[\.\)]\s*/, '').replace(/^-\s*/, '').trim();
    if (cleanedName) {
        navigate('/book-detail', { state: { query: cleanedName } });
    }
  };

  const renderContent = () => {
    if (id === 'referensi') {
        let refs: string[] = [];
        if (content.includes('\n')) {
             refs = content.split('\n');
        } else {
             refs = content.split(',');
        }
        
        refs = refs.map((s: string) => s.trim()).filter((s: string) => s.length > 2);

        return (
            <div className="space-y-3">
                {refs.map((refItem: string, idx: number) => {
                    const cleanRef = refItem.replace(/^[0-9]+[\.\)]\s*/, '').replace(/^-\s*/, '');
                    return (
                        <button 
                            key={idx}
                            onClick={() => handleReferenceClick(refItem)}
                            className="w-full text-left p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-santri-green dark:hover:border-santri-gold hover:shadow-md transition-all group flex items-center justify-between active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 group-hover:text-santri-green group-hover:bg-green-50 dark:group-hover:bg-green-900/20 transition-colors shrink-0">
                                    <Book size={18} />
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm group-hover:text-santri-green dark:group-hover:text-santri-gold transition-colors leading-snug">
                                    {cleanRef}
                                </span>
                            </div>
                            <ArrowRight size={18} className="text-slate-300 group-hover:text-santri-green dark:group-hover:text-santri-gold transition-colors shrink-0" />
                        </button>
                    );
                })}
                <p className="text-center text-xs text-slate-400 mt-6 bg-slate-50 dark:bg-slate-900 py-2 rounded-full">
                    Ketuk judul kitab untuk melihat detail dan daftar isi.
                </p>
            </div>
        );
    }

    const currentFontSize = (isArabic ? fontSize + 6 : fontSize) * (1 + textScaleLevel * 0.2);

    return (
        <div 
            className={`prose prose-lg max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-justify transition-all ${isArabic ? 'font-arabic text-right' : 'font-serif'}`}
            style={{ 
                fontSize: `${currentFontSize}px`, 
                lineHeight: isArabic ? 2.2 : 1.8 
            }}
            dir={isArabic ? 'rtl' : 'ltr'}
        >
            {content}
        </div>
    );
  };

  const isCurrentTts = currentTtsInfo?.id === id;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans flex flex-col">
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className={`font-bold text-lg ${textClass.replace('700', '600')}`}>
              {label}
            </h2>
        </div>
        <div className="flex gap-1">
            <button 
                onClick={handleToggleZoom}
                className={`p-2 rounded-full transition-colors border ${textScaleLevel > 0 ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80'}`}
                title="Perbesar / Ubah Ukuran Teks"
            >
                <ZoomIn size={18} />
            </button>
            <button 
                onClick={handleSpeak} 
                className={`p-2 rounded-full transition-colors ${isCurrentTts ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
                {isAudioLoading && isCurrentTts ? <Loader2 size={20} className="animate-spin" /> : isCurrentTts && isPlaying ? <StopCircle size={20} /> : <Volume2 size={20} />}
            </button>
            <button onClick={handleCopy} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
            </button>
            <button onClick={handleShare} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <Share2 size={20} />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className={`p-6 pb-8 ${bgClass} ${borderClass} border-b mb-6 transition-colors`}>
           <div className="flex flex-col items-center text-center animate-in slide-in-from-top-4 duration-500">
              <div className={`w-16 h-16 rounded-2xl bg-white dark:bg-slate-900/50 flex items-center justify-center mb-4 shadow-sm ${textClass}`}>
                 <Icon size={32} />
              </div>
              <h1 className={`text-2xl font-bold mb-1 ${textClass}`}>{label}</h1>
              <p className="text-sm font-bold uppercase tracking-wider text-santri-gold">{sub}</p>
           </div>
        </div>

        <div className="px-5 pb-8 max-w-2xl mx-auto animate-in fade-in duration-500 delay-100">
           {renderContent()}

           <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar flex-nowrap w-full">
              <button 
                onClick={handleShare}
                className="flex-1 min-w-0 px-3 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1 shrink-0 whitespace-nowrap cursor-pointer"
                title="Bagikan Teks"
              >
                 <Share2 size={13} className="shrink-0" />
                 <span className="truncate">Share</span>
              </button>
              <button 
                onClick={handleCopy}
                className="flex-1 min-w-0 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs border border-slate-200 dark:border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1 shrink-0 whitespace-nowrap cursor-pointer"
                title="Salin Teks"
              >
                 <Copy size={13} className="shrink-0" />
                 <span className="truncate">Salin</span>
              </button>
               <button 
                onClick={() => setIsReportOpen(true)}
                title="Laporkan Masalah ke Admin"
                className="flex-1 min-w-0 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1 shrink-0 whitespace-nowrap cursor-pointer"
              >
                 <Flag size={13} className="shrink-0" />
                 <span className="truncate">Laporkan</span>
              </button>
           </div>
        </div>
      </div>

      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName={`Detail ${label || 'Santri'}`}
        contentSnippet={content ? content.slice(0, 100) : ''}
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};

export default ResultDetailScreen;
