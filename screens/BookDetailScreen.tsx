import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  generateKitabDetail, 
  generateKitabAnalysis, 
  generateScholarBiography,
  fetchChapterDetail,
  fetchEbookChapters 
} from '../services/geminiService';
import { useHistory } from '../contexts/HistoryContext';
import { useAuth } from '../contexts/AuthContext';
import { useAudio } from '../contexts/AudioContext';
import { useToast } from '../contexts/ToastContext';
import { saveUserBookmark, removeUserBookmark, subscribeUserBookmarks } from '../services/firebase';
import { GEMINI_MODEL, PLAYSTORE_LINK } from '../constants';
import CustomLoader from '../components/CustomLoader';
import { ContentReportModal } from '../components/ContentReportModal';
import { openExternalLink } from '../utils/linkUtils';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  List, 
  Layers,
  BookOpen,
  Globe,
  Tag,
  Volume2, 
  StopCircle,
  Loader2,
  Library,
  Scroll,
  ArrowRight,
  Plus,
  Minus,
  Sparkles,
  Brain,
  Share2,
  Copy,
  Bookmark,
  Check,
  Star,
  Flag
} from 'lucide-react';

interface Chapter {
  title: string;
  titleArabic: string;
  arabic: string;
  translation: string;
}

interface BookProfile {
  name: string;
  originalTitle: string;
  author: string;
  field: string;
  translator?: string;
  about?: string;
  coverImage?: string;
  authorBorn?: string;
  authorDied?: string;
  authorCentury?: string;
}

const BookDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToHistory } = useHistory();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const { isPlaying, currentTtsInfo, speakTts, isLoading: isAudioLoading } = useAudio();
  
  const isAdmin = userData?.role === 'admin' || user?.email === 'admin@santrimodern.com';
  const state = location.state as { book?: any, query?: string, title?: string, author?: string, coverImage?: string };
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ profile: BookProfile, chapters: Chapter[] } | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeUserBookmarks(user.uid, 'kitab', (items) => {
        setBookmarks(items);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const isBookmarked = (chapterTitle: string) => {
    return bookmarks.some(b => b.chapterTitle === chapterTitle && b.bookName === data?.profile.name);
  };

  const handleBookmark = async (chapter: Chapter) => {
    if (!user) {
      showToast("Silakan login untuk menyimpan", "info");
      return;
    }
    if (!data) return;

    const bookmarkId = `kitab-${data.profile.name}-${chapter.title}`.replace(/\s+/g, '-').toLowerCase();
    const existing = bookmarks.find(b => b.id === bookmarkId);

    if (existing) {
       await removeUserBookmark(user.uid, bookmarkId);
       showToast("Dihapus dari simpanan", "info");
    } else {
       await saveUserBookmark(user.uid, 'kitab', bookmarkId, {
          bookName: data.profile.name,
          chapterTitle: chapter.title,
          arabic: chapter.arabic,
          translation: chapter.translation,
          author: data.profile.author
       });
       showToast("Tersimpan", "success");
    }
  };

  const handleCopy = (chapter: Chapter, index: number) => {
    const text = `${chapter.arabic}\n\n${chapter.translation}\n\nSumber: ${data?.profile.name}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast("Salin teks berhasil", "success");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleShare = async (chapter: Chapter) => {
    const text = `${chapter.arabic}\n\n${chapter.translation}\n\nSumber: ${data?.profile.name}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
    const title = `${data?.profile.name} - ${chapter.title}`;
    
    if (window.AndroidNativeInterface?.shareText) {
      try {
        window.AndroidNativeInterface.shareText(title, text);
      } catch (e) {
        handleCopy(chapter, -1);
      }
    } else if (navigator.share) {
      try {
        await navigator.share({ title, text });
      } catch (e) {
        handleCopy(chapter, -1);
      }
    } else {
      handleCopy(chapter, -1);
    }
  };

  useEffect(() => {
    const loadContent = async () => {
      const searchTitle = state?.book?.name || state?.title || state?.query;
      const searchAuthor = state?.book?.author || state?.author || "";
      
      if (!searchTitle) {
        setError("Informasi tidak ditemukan.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await fetchEbookChapters(searchTitle, searchAuthor);
        
        // Validate structure
        if (!result || !result.profile) {
          throw new Error("Struktur data tidak valid.");
        }
        
        setData(result);
        
        // Add to history
        addToHistory({
          id: `book-${result.profile.name}`,
          type: 'kitab',
          title: result.profile.name,
          subtitle: result.profile.author || 'Kitab Kuning',
          timestamp: new Date().toISOString(),
          path: '/book-detail',
          data: { book: result.profile }
        });

      } catch (err: any) {
        console.error("Gagal memuat konten ebook:", err);
        setError("Gagal memuat isi kitab.");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [state, addToHistory]);

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleSpeak = () => {
    if (!data?.profile.about) return;
    speakTts(data.profile.about, false, data.profile.name, 'book-desc');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a252f] flex items-center justify-center p-6">
        <CustomLoader message="Menyiapkan Lembaran Kitab..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#2c3e50] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-white mb-4">{error || "Gagal memuat isi kitab."}</p>
        <button onClick={() => navigate(-1)} className="text-[#f1c40f] font-bold">Kembali</button>
      </div>
    );
  }

  const isCurrentTts = currentTtsInfo?.id === 'book-desc';

  return (
    <div className="min-h-screen bg-[#1a252f] pb-20 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#2c3e50] border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-tight line-clamp-1">{data.profile.name}</h1>
            <p className="text-[10px] text-[#f1c40f] font-bold uppercase tracking-widest leading-none mt-1">{data.profile.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openExternalLink(PLAYSTORE_LINK)}
            className="px-2.5 py-1.5 bg-[#f1c40f]/20 hover:bg-[#f1c40f]/30 text-[#f1c40f] border border-[#f1c40f]/30 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
            title="Beri Rating"
          >
            <Star size={14} className="fill-[#f1c40f]" />
            <span className="hidden xs:inline">Rating</span>
          </button>
          <button
            onClick={() => setIsReportOpen(true)}
            className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
            title="Laporkan"
          >
            <Flag size={14} />
            <span className="hidden xs:inline">Laporkan</span>
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pt-6">
        {/* Book Profile Section */}
        <div className="bg-[#2c3e50] p-6 rounded-2xl border border-white/5 shadow-2xl mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BookOpen size={120} />
          </div>
          
          <div className="relative z-10 space-y-4">
             <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-32 bg-gradient-to-br from-[#f1c40f] to-[#d35400] rounded-lg shadow-2xl flex items-center justify-center mb-4 border-2 border-white/20 overflow-hidden relative">
                   {(data.profile.coverImage || state?.coverImage) ? (
                     <img 
                        src={data.profile.coverImage || state?.coverImage} 
                        alt={data.profile.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                     />
                   ) : (
                     <BookOpen size={40} className="text-[#2c3e50]" />
                   )}
                </div>
                <h2 className="text-xl font-black text-white text-center leading-tight uppercase italic underline decoration-[#f1c40f] underline-offset-4">
                   {data.profile.name}
                </h2>
             </div>

             <div className="space-y-3">
                <ProfileItem label="Nama Kitab" value={data.profile.name} />
                <ProfileItem label="Judul Kitab Asal" value={data.profile.originalTitle} isArabic />
                <ProfileItem 
                  label="Penulis" 
                  value={data.profile.author} 
                  onClick={() => navigate('/biography', { state: { author: data.profile.author, book: data.profile.name } })}
                />
                
                {(data.profile.authorBorn || data.profile.authorDied || data.profile.authorCentury) && (
                  <div className="flex flex-col gap-2 bg-black/20 p-3 rounded-xl border border-white/5">
                    {data.profile.authorBorn && (
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[#f1c40f] opacity-60 uppercase font-bold">Lahir:</span>
                        <span className="text-white font-medium">{data.profile.authorBorn}</span>
                      </div>
                    )}
                    {data.profile.authorDied && (
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[#f1c40f] opacity-60 uppercase font-bold">Wafat:</span>
                        <span className="text-white font-medium">{data.profile.authorDied}</span>
                      </div>
                    )}
                    {data.profile.authorCentury && (
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[#f1c40f] opacity-60 uppercase font-bold">Abad:</span>
                        <span className="text-white font-medium">{data.profile.authorCentury}</span>
                      </div>
                    )}
                  </div>
                )}

                <ProfileItem label="Bidang Studi" value={data.profile.field} onClick={() => navigate('/category-books', { state: { id: data.profile.field.toLowerCase(), label: data.profile.field } })} />
                <ProfileItem label="Penerjemah" value={data.profile.translator || '-'} />
             </div>
          </div>
        </div>

        {/* Tentang Kitab Section */}
        {data.profile.about && (
          <div className="bg-[#2c3e50]/50 p-6 rounded-2xl border border-white/5 shadow-inner mb-8 transition-all hover:bg-[#2c3e50]/80">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[#f1c40f] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <Scroll size={14} /> Tentang Kitab
              </h3>
              <button 
                onClick={handleSpeak} 
                className={`p-1.5 rounded-full transition-colors ${isCurrentTts ? 'bg-[#f1c40f] text-[#2c3e50]' : 'text-[#f1c40f] hover:bg-white/5'}`}
              >
                  {isAudioLoading && isCurrentTts ? <Loader2 size={16} className="animate-spin" /> : isCurrentTts && isPlaying ? <StopCircle size={16} /> : <Volume2 size={16} />}
              </button>
            </div>
            <p className="text-white/80 text-sm leading-relaxed text-justify italic font-medium mb-6">
              {data.profile.about}
            </p>
            
            <button 
              onClick={() => navigate('/biography', { state: { author: data.profile.author, book: data.profile.name } })}
              className="w-full flex items-center justify-center gap-2 bg-[#f1c40f] text-[#2c3e50] py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              <User size={14} /> Pelajari Biografi Lengkap Penulis
            </button>
          </div>
        )}

        {/* Accordion Content */}
        <div className="space-y-4">
          {data.chapters.map((chapter, index) => (
            <div key={index} className="overflow-hidden rounded-xl border border-[#f1c40f]/30">
              {/* Accordion Header */}
              <button 
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between p-4 bg-[#f1c40f] text-[#2c3e50] transition-colors active:bg-[#d4ac0d]"
              >
                <div className="flex items-center gap-3 text-left">
                  <span className="text-[12px] md:text-[14px] font-black uppercase tracking-tight flex items-center gap-2">
                    {chapter.title} <span className="font-serif leading-none mt-1 opacity-80">{chapter.titleArabic}</span>
                  </span>
                </div>
                {expandedIndex === index ? <Minus size={20} /> : <Plus size={20} />}
              </button>

              {/* Accordion Body */}
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#f1c40f]"
                  >
                    <div className="p-6 md:p-8 space-y-8 flex flex-col items-center">
                       {/* Arabic Subtitle Header */}
                       <div className="text-center">
                          <h3 className="text-lg md:text-xl font-black text-[#8b0000] uppercase flex flex-col items-center gap-1">
                             <span className="tracking-tight">{chapter.title}</span>
                             <span className="font-serif leading-loose mt-1">{chapter.titleArabic}</span>
                          </h3>
                       </div>

                       {/* Arabic Content */}
                       <div className="w-full">
                          <p className="font-serif text-2xl md:text-3xl leading-[2.5] md:leading-[3] text-[#2c3e50] text-center antialiased">
                             {chapter.arabic}
                          </p>
                       </div>

                       {/* Translation Divider / Subtitle */}
                       <div className="w-full border-t border-[#2c3e50]/10 pt-4 text-center">
                          <h4 className="text-[#8b0000] font-black text-sm md:text-base mb-4 text-center uppercase tracking-wide">
                             {chapter.title.split(' ').slice(0, 2).join(' ')}
                          </h4>
                          <p className="text-[#2c3e50] text-lg md:text-xl font-medium leading-relaxed px-2 mb-6">
                             {chapter.translation}
                          </p>
                          
                          {/* Bedah AI Button */}
                          <div className="flex justify-center mt-6">
                             <button 
                                onClick={() => {
                                   navigate('/result', { 
                                      state: { 
                                         mode: 'kitab', 
                                         query: chapter.title, 
                                         source: data.profile.name,
                                         originalText: chapter.arabic
                                      } 
                                   });
                                }}
                                className="flex items-center gap-2 bg-[#2c3e50] hover:bg-[#34495e] text-[#f1c40f] px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 group border border-[#f1c40f]/20"
                             >
                                <Brain size={16} className="group-hover:rotate-12 transition-transform" />
                                Bedah AI
                             </button>
                             
                             <div className="flex items-center gap-2 ml-2">
                                <button 
                                   onClick={() => handleShare(chapter)}
                                   className="w-10 h-10 flex items-center justify-center bg-[#2c3e50] hover:bg-[#34495e] text-[#f1c40f] rounded-full border border-[#f1c40f]/20 shadow-xl active:scale-90 transition-all font-bold"
                                   title="Bagikan"
                                >
                                   <Share2 size={18} />
                                </button>
                                <button 
                                   onClick={() => handleCopy(chapter, index)}
                                   className="w-10 h-10 flex items-center justify-center bg-[#2c3e50] hover:bg-[#34495e] text-[#f1c40f] rounded-full border border-[#f1c40f]/20 shadow-xl active:scale-90 transition-all font-bold"
                                   title="Salin"
                                >
                                   {copiedIndex === index ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                                </button>
                                <button 
                                   onClick={() => handleBookmark(chapter)}
                                   className="w-10 h-10 flex items-center justify-center bg-[#2c3e50] hover:bg-[#34495e] text-[#f1c40f] rounded-full border border-[#f1c40f]/20 shadow-xl active:scale-90 transition-all font-bold"
                                   title="Simpan"
                                >
                                   <Bookmark size={18} fill={isBookmarked(chapter.title) ? "currentColor" : "none"} />
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          
          {/* Button Lengkapi Seluruh Bab - Admin Only */}
          {isAdmin && (
            <button 
              onClick={async () => {
                if (!data) return;
                setLoading(true);
                try {
                  const searchTitle = data.profile.name;
                  const searchAuthor = data.profile.author;
                  // Gunakan fetchEbookChapters karena structure-nya yang sesuai (profile & chapters object)
                  const result = await fetchEbookChapters(searchTitle, searchAuthor);
                  
                  if (result && result.profile) {
                    setData(result);
                    showToast("Berhasil melengkapi kitab via AI", "success");
                  } else {
                    throw new Error("Data tidak valid");
                  }
                } catch (e) {
                  showToast("Gagal melengkapi kitab", "error");
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full mt-8 flex items-center justify-center gap-3 bg-gradient-to-r from-[#d35400] to-[#e67e22] text-white py-4 rounded-xl border-2 border-white/20 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <Brain size={18} className="animate-pulse text-[#f1c40f]" />
              <span className="font-black text-xs uppercase tracking-[0.2em]">Lengkapi Isi & Simpan Permanen (AI)</span>
            </button>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center pb-12">
           <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">
              Isi kitab ini bersumber dari kecerdasan buatan <br/> Mohon verifikasi dengan naskah cetak aslinya.
           </p>
        </div>
      </main>

      {/* Content Report Modal */}
      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName="Kajian Kitab Kuning"
        contentSnippet={data?.profile?.name || "Kitab Kuning"}
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};

export default BookDetailScreen;

const ProfileItem: React.FC<{ label: string, value: string, isArabic?: boolean, onClick?: () => void }> = ({ label, value, isArabic, onClick }) => (
  <div 
    className={`flex flex-col gap-1 border-b border-white/5 pb-2 last:border-0 ${onClick ? 'cursor-pointer hover:bg-white/5 -mx-2 px-2 rounded-lg transition-colors' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-[#f1c40f] uppercase tracking-widest opacity-60">{label}:</span>
      {onClick && <ArrowRight size={12} className="text-white/20" />}
    </div>
    <span className={`text-sm text-white font-bold leading-tight ${isArabic ? 'font-serif text-right text-lg mt-1' : ''} ${onClick ? 'text-[#f1c40f]' : ''}`}>
      {value}
    </span>
  </div>
);
