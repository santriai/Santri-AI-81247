import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, ImageIcon, Trash2, Bookmark, Clock, User, Heart, Share2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { UserAvatar } from '../components/UserAvatar';
import { motion } from 'motion/react';
import { getRankDetails } from '../services/firebase';

const PostBookmarksScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, postId: string | null }>({
    isOpen: false,
    postId: null
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('santri_post_bookmarks') || '[]');
    // Sort so latest bookmark is at the top
    setBookmarks(saved.reverse());
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, postId: id });
  };

  const confirmDelete = () => {
    if (deleteModal.postId) {
      const updated = bookmarks.filter(p => p.id !== deleteModal.postId);
      setBookmarks(updated);
      // Save it reversed back
      localStorage.setItem('santri_post_bookmarks', JSON.stringify(updated.reverse()));
      showToast("Postingan dihapus dari penanda", "info");
    }
    setDeleteModal({ isOpen: false, postId: null });
  };

  const formatBookmarkTime = (savedAt: string) => {
    try {
      return new Date(savedAt).toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (e) {
      return 'Baru saja';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center gap-3 transition-colors">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base md:text-lg flex items-center gap-2">
          <Bookmark size={20} className="text-indigo-500 fill-current" /> Penanda Postingan
        </h2>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={40} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada postingan yang ditandai.</p>
            <button 
              onClick={() => navigate('/community')}
              className="mt-4 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline"
            >
              Cari Postingan Menarik
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {bookmarks.map((post, idx) => (
              <div 
                key={post.id || idx}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden hover:border-indigo-500/30 transition-all duration-300 relative"
              >
                {/* Delete Button Overlay */}
                <button 
                  onClick={(e) => handleDeleteClick(e, post.id)}
                  className="absolute top-4 right-4 p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-100 transition-colors z-10"
                  title="Hapus Penanda"
                >
                  <Trash2 size={16} />
                </button>

                <div className="p-6">
                  {/* Author Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <UserAvatar 
                      photoURL={post.userPhoto}
                      displayName={post.userName}
                      points={post.userPoints || 0}
                      size="md"
                    />
                    <div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-white leading-tight">{post.userName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                          {getRankDetails(post.userPoints || 0).name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">•</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          Ditandai: {formatBookmarkTime(post.savedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line pr-12">
                    {post.content}
                  </p>

                  {/* Categories Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {post.categories && post.categories.length > 0 ? (
                      post.categories.map((cat: string, ci: number) => (
                        <span 
                          key={ci} 
                          className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/40"
                        >
                          {cat}
                        </span>
                      ))
                    ) : (
                      <span 
                        className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      >
                        {post.type === 'tanya' ? 'Tanya Jawab' : 'Harian'}
                      </span>
                    )}
                  </div>

                  {/* Actions Link back to original */}
                  <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/80 flex justify-end">
                    <button 
                      onClick={() => navigate('/community')}
                      className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 hover:underline"
                    >
                      <span>Menuju Forum Silaturahmi</span>
                      <ArrowLeft size={12} className="rotate-180" strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        title="Hapus Penanda Postingan?"
        message="Postingan ini akan dihapus dari daftar penanda Anda."
        confirmLabel="Hapus"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, postId: null })}
      />
    </div>
  );
};

export default PostBookmarksScreen;
