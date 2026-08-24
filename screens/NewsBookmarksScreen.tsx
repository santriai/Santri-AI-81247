
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Newspaper, ArrowRight, ImageIcon, Trash2, Bookmark } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';

const NewsBookmarksScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, newsId: string | null }>({
    isOpen: false,
    newsId: null
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('santri_news_bookmarks') || '[]');
    setBookmarks(saved.reverse()); // Terbaru di atas
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, newsId: id });
  };

  const confirmDelete = () => {
    if (deleteModal.newsId) {
      const updated = bookmarks.filter(n => n.id !== deleteModal.newsId);
      setBookmarks(updated);
      localStorage.setItem('santri_news_bookmarks', JSON.stringify(updated.reverse()));
      showToast("Berita dihapus dari penanda", "info");
    }
    setDeleteModal({ isOpen: false, newsId: null });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center gap-3 transition-colors">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
          <Bookmark size={20} className="text-emerald-500 fill-current" /> Berita Tersimpan
        </h2>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Newspaper size={40} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada berita yang ditandai.</p>
            <button 
              onClick={() => navigate('/news')}
              className="mt-4 text-emerald-600 font-bold text-sm hover:underline"
            >
              Cari Berita Menarik
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {bookmarks.map((item) => (
              <button 
                key={item.id} 
                onClick={() => navigate('/news-detail', { state: { news: item } })}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm flex group text-left transition-all active:scale-[0.98] hover:border-emerald-200 dark:hover:border-emerald-900 relative"
              >
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 relative shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={24}/></div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between min-w-0 pr-12">
                  <div>
                    <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">{item.category}</span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">{item.title}</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Disimpan pada {new Date(item.savedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                </div>
                
                {/* Delete Button Overlay */}
                <button 
                  onClick={(e) => handleDeleteClick(e, item.id)}
                  className="absolute top-2 right-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-100 transition-colors z-10"
                >
                  <Trash2 size={16} />
                </button>
              </button>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        title="Hapus Penanda?"
        message="Berita ini akan dihapus dari daftar simpanan Anda."
        confirmLabel="Hapus"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, newsId: null })}
      />
    </div>
  );
};

export default NewsBookmarksScreen;
