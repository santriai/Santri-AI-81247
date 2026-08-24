
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Newspaper, User, Share2, Globe, Bookmark, Calendar, Volume2, StopCircle, Loader2, Flag, Copy, ZoomIn, Edit3, Trash2, PenSquare } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { PLAYSTORE_LINK } from '../constants';
import { ContentReportModal } from '../components/ContentReportModal';
import { fetchFromGitHub, fetchListFromGitHub, saveToGitHub } from '../services/githubDataService';

const NewsDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { user, userData } = useAuth();
  const { isPlaying, currentTtsInfo, speakTts, prefetchTts, stopTts, isLoading: isAudioLoading } = useAudio();
  const { news } = (location.state as any) || {};

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [textScaleLevel, setTextScaleLevel] = useState<number>(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleToggleZoom = () => {
    setTextScaleLevel((prev) => (prev + 1) % 3);
  };

  const handleCopy = () => {
    if (news?.content) {
      navigator.clipboard.writeText(`${news.title}\n\n${news.content}`);
      showToast("Teks berita disalin!", "success");
    }
  };

  // Load bookmark state
  useEffect(() => {
    if (news?.id) {
      const saved = JSON.parse(localStorage.getItem('santri_news_bookmarks') || '[]');
      setIsBookmarked(saved.some((n: any) => n.id === news.id));
    }
  }, [news?.id]);

  // Prefetch TTS audio for the news content on load
  useEffect(() => {
    if (news?.content) {
      prefetchTts(news.content, false);
    }
  }, [news, prefetchTts]);

  if (!news) {
      return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
              <div className="text-center">
                  <p className="text-slate-500 mb-4">Berita tidak ditemukan.</p>
                  <button onClick={() => navigate(-1)} className="text-santri-green font-bold">Kembali</button>
              </div>
          </div>
      );
  }

  const isCurrentViewerAuthor = news?.author && (userData?.displayName || user?.displayName) && news.author.trim().toLowerCase() === (userData?.displayName || user?.displayName).trim().toLowerCase();
  const isAdmin = userData?.role === 'admin' || user?.email === 'devsantriai@gmail.com';
  const canEditOrDelete = isAdmin || isCurrentViewerAuthor || (news?.author_id && news.author_id === user?.uid);

  // Author Photo - NEVER use current reader's photo if reader is not the author!
  const authorPhotoURL = news?.author_photo || (isCurrentViewerAuthor ? (userData?.avatarUrl || userData?.photoURL || user?.photoURL) : null);

  const handleEditNews = () => {
    navigate('/write-news', { state: { editNews: news } });
  };

  const handleDeleteNews = async () => {
    setDeleting(true);
    try {
      const fetched = await fetchFromGitHub('news', 'news_list');
      const currentList: any[] = Array.isArray(fetched) ? fetched : (await fetchListFromGitHub('news'));
      const filtered = currentList.filter((item) => item.id !== news.id);
      await saveToGitHub('news', 'news_list', filtered);
      showToast("Warta Santri berhasil dihapus.", "success");
      navigate('/news', { replace: true });
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus warta.", "error");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isCurrentTts = currentTtsInfo?.id === `news-${news?.id}`;

  const handleToggleTts = () => {
    if (isCurrentTts && isPlaying) {
      stopTts();
    } else {
      speakTts(news.content, false, news.title, `news-${news.id}`);
    }
  };

  const handleToggleBookmark = () => {
    let saved = JSON.parse(localStorage.getItem('santri_news_bookmarks') || '[]');
    if (isBookmarked) {
      saved = saved.filter((n: any) => n.id !== news.id);
      showToast("Berita dihapus dari penanda", "info");
    } else {
      saved.push({
        ...news,
        savedAt: new Date().toISOString()
      });
      showToast("Berita disimpan ke penanda", "success");
    }
    localStorage.setItem('santri_news_bookmarks', JSON.stringify(saved));
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = async () => {
    const text = `*${news.title}*\n\n${news.excerpt}\n\nBaca selengkapnya di aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
    const title = news.title;

    // Prioritaskan Native Android Interface
    if (window.AndroidNativeInterface && typeof window.AndroidNativeInterface.shareText === 'function') {
        try {
            window.AndroidNativeInterface.shareText(title, text);
            return;
        } catch (e) {
            console.error("Native share failed", e);
        }
    }

    // Web Fallback
    if (navigator.share) {
        try {
            await navigator.share({ title, text });
        } catch (e) {
            // User cancelled or error
        }
    } else {
        navigator.clipboard.writeText(text);
        showToast("Link berita disalin!", "success");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 font-sans">
      
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/90 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft size={24} />
            </button>
            <h2 className="font-bold text-white text-base">Warta Santri</h2>
        </div>
        <div className="flex items-center gap-1">
            <button 
                onClick={handleToggleTts} 
                className={`p-2 rounded-full transition-colors ${
                    isCurrentTts 
                        ? 'bg-white text-emerald-700 shadow-xs' 
                        : 'text-white/80 hover:bg-white/10'
                }`}
                title="Dengarkan Berita"
            >
                {isAudioLoading && isCurrentTts ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : isCurrentTts && isPlaying ? (
                    <StopCircle size={20} />
                ) : (
                    <Volume2 size={20} />
                )}
            </button>
            <button 
                onClick={handleShare} 
                className="p-2 text-white/80 hover:bg-white/10 rounded-full transition-colors"
                title="Bagikan"
            >
                <Share2 size={20} />
            </button>
            <button 
                onClick={handleToggleZoom}
                className={`p-2 rounded-full transition-colors ${
                    textScaleLevel > 0 
                        ? 'text-emerald-300 bg-white/20' 
                        : 'text-white/80 hover:bg-white/10'
                }`}
                title="Perbesar / Kecilkan Teks"
            >
                <ZoomIn size={20} />
            </button>
            <button 
                onClick={handleToggleBookmark}
                className={`p-2 rounded-full transition-colors ${
                    isBookmarked 
                        ? 'text-yellow-300 bg-white/20' 
                        : 'text-white/80 hover:bg-white/10'
                }`}
                title="Simpan Berita"
            >
                <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
         {/* Featured Image */}
         <div className="w-full aspect-[16/9] bg-slate-100 relative overflow-hidden md:rounded-b-[2rem]">
            {news.image_url ? (
                <img 
                  src={news.image_url} 
                  alt={news.title} 
                  onError={(e) => {
                    e.currentTarget.src = 'https://i.imgur.com/jSPFx4A.png';
                  }}
                  className="w-full h-full object-cover" 
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-100 dark:bg-slate-900">
                    <Newspaper size={64} className="opacity-20" />
                    <p className="text-xs font-bold mt-2">SANTRI MODERN MEDIA</p>
                </div>
            )}
            <div className="absolute bottom-4 left-4">
                <span className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-black rounded-full shadow-lg uppercase tracking-widest">
                    {news.category}
                </span>
            </div>
         </div>

         <div className="p-6 md:p-10">
            <h1 className="text-2xl md:text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
                {news.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-slate-100 dark:border-slate-800 mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                      <UserAvatar 
                          photoURL={authorPhotoURL} 
                          displayName={news.author || 'Admin SantriAI'}
                          size="sm"
                      />
                      <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{news.author || 'Admin SantriAI'}</p>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Redaksi Warta</p>
                      </div>
                  </div>
                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                  <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={14} />
                      <span className="text-xs font-medium">{new Date(news.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Edit / Delete Buttons for Admin & Author */}
                {canEditOrDelete && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleEditNews}
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-emerald-200 dark:border-emerald-800 cursor-pointer active:scale-95"
                      title="Edit Warta ini"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-rose-200 dark:border-rose-800 cursor-pointer active:scale-95"
                      title="Hapus Warta ini"
                    >
                      <Trash2 size={14} />
                      <span>Hapus</span>
                    </button>
                  </div>
                )}
            </div>

            <div className="prose prose-emerald prose-lg max-w-none dark:prose-invert">
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium italic mb-8 border-l-4 border-emerald-500 pl-6 py-2 leading-relaxed">
                    {news.excerpt}
                </p>
                <div 
                    className="text-slate-700 dark:text-slate-300 leading-relaxed text-justify space-y-6 whitespace-pre-wrap transition-all"
                    style={{ fontSize: `${16 * (1 + textScaleLevel * 0.15)}px` }}
                >
                    {news.content}
                </div>
            </div>

            {/* Source Link at the bottom */}
            {news.source_url && (
                <div className="mt-8 flex justify-start">
                    <a href={news.source_url} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold text-xs flex items-center gap-1.5 hover:underline bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800/50">
                        <Globe size={14} /> Lihat Sumber Berita
                    </a>
                </div>
            )}

            {/* Footer Tag */}
            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left w-full md:w-auto">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Terima kasih telah membaca</h4>
                        <p className="text-xs text-slate-500">Update terus wawasan keislamanmu setiap hari.</p>
                    </div>
                    <div className="flex items-center gap-1.5 w-full md:w-auto justify-between md:justify-end overflow-x-auto no-scrollbar flex-nowrap">
                        <button 
                            onClick={handleShare} 
                            className="flex-1 md:flex-initial px-2.5 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                            title="Bagikan Berita"
                        >
                            <Share2 size={13} className="shrink-0" /> 
                            <span>Share</span>
                        </button>
                        <button 
                            onClick={handleCopy} 
                            className="flex-1 md:flex-initial px-2.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                            title="Salin Teks Berita"
                        >
                            <Copy size={13} className="shrink-0" /> 
                            <span>Salin</span>
                        </button>
                        <button 
                            onClick={() => setIsReportOpen(true)}
                            className="flex-1 md:flex-initial px-2.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                            title="Laporkan Konten Berita"
                        >
                            <Flag size={13} className="shrink-0" />
                            <span>Laporkan</span>
                        </button>
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Hapus Warta Santri?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus warta "<span className="font-semibold text-slate-700 dark:text-slate-300">{news.title}</span>"? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteNews}
                disabled={deleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>{deleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Report Modal */}
      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName="Warta Santri"
        contentSnippet={news?.title || "Berita Santri"}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      {/* Floating Button Tulis Warta */}
      <button
        onClick={() => navigate('/write-news')}
        className="fixed bottom-6 right-5 z-40 px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full shadow-2xl hover:shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center border-2 border-white/20 group cursor-pointer gap-2"
        title="Tulis Warta Santri"
      >
        <PenSquare size={18} />
        <span className="text-xs font-bold">Tulis Warta</span>
      </button>
    </div>
  );
};

export default NewsDetailScreen;
