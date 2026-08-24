import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, Trash2, ChevronRight, Bookmark } from 'lucide-react';
import { 
  getBookmarkedFeatures, 
  toggleBookmarkFeature, 
  subscribeToBookmarkChanges,
  FeatureItem 
} from '../services/bookmarkService';
import { useToast } from '../contexts/ToastContext';

const FeatureBookmarksScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [bookmarks, setBookmarks] = useState<FeatureItem[]>([]);

  useEffect(() => {
    // Initial fetch
    setBookmarks(getBookmarkedFeatures());

    // Subscribe to changes
    const unsubscribe = subscribeToBookmarkChanges(() => {
      setBookmarks(getBookmarkedFeatures());
    });

    return () => unsubscribe();
  }, []);

  const handleRemoveBookmark = (e: React.MouseEvent, label: string) => {
    e.stopPropagation();
    toggleBookmarkFeature(label);
    showToast(`Penanda untuk "${label}" telah dihapus`, "success");
  };

  const handleFeatureClick = (item: FeatureItem) => {
    if (item.path) {
      navigate(item.path, { state: item.state });
    } else {
      showToast('Fitur segera hadir!', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 flex flex-col animate-fade-in pb-24">
      {/* Header */}
      <div 
        className="sticky top-0 z-30 text-white border-b border-emerald-900 px-4 py-4 shadow-md relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to right, #065f46, #022c22), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='%23fcd34d' stroke-opacity='0.15' stroke-width='1'%3E%3Crect x='35' y='35' width='30' height='30'/%3E%3Crect x='35' y='35' width='30' height='30' transform='rotate(45 50 50)'/%3E%3Ccircle cx='50' cy='50' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '100% 100%, 40px 40px',
          backgroundRepeat: 'no-repeat, repeat',
          backgroundBlendMode: 'overlay',
          backgroundColor: '#065f46'
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-3 relative z-10">
          <button 
            onClick={() => navigate('/settings')} 
            className="p-2 -ml-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <h2 className="font-extrabold text-lg text-white flex items-center gap-2">
              <Star size={20} className="text-amber-300 fill-amber-300/25" /> Penanda Fitur
            </h2>
            <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">Akses Cepat Favorit Anda</p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 pt-6 space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            Semua fitur yang Anda tandai akan disematkan di bagian atas menu "Fitur Lainnya" pada halaman Beranda untuk memudahkan akses cepat sehari-hari.
          </p>
        </div>

        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">
          Daftar Fitur Ditandai ({bookmarks.length})
        </h3>

        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {bookmarks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-850 p-12 text-center flex flex-col items-center justify-center gap-4"
              >
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                  <Bookmark size={32} />
                </div>
                <div className="max-w-xs">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum Ada Fitur Ditandai</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">
                    Sentuh ikon bintang <Star size={12} className="inline text-amber-500 fill-amber-500/20" /> di pojok kanan atas tombol fitur pada menu "Fitur Lainnya" atau menu lainnya untuk menandainya sebagai favorit.
                  </p>
                </div>
              </motion.div>
            ) : (
              bookmarks.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    onClick={() => handleFeatureClick(item)}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border border-slate-100 dark:border-slate-800/80 rounded-2xl cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${item.color || 'bg-emerald-600'} flex items-center justify-center shrink-0 shadow-sm`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                          Aplikasi Santri AI • Klik untuk Buka
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={(e) => handleRemoveBookmark(e, item.label)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl transition-all cursor-pointer opacity-80 hover:opacity-100"
                        title="Hapus Penanda"
                      >
                        <Trash2 size={16} />
                      </button>
                      <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FeatureBookmarksScreen;
