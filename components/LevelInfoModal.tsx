import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, Zap, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { getRankDetails } from '../services/firebase';

interface LevelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints: number;
}

export const LevelInfoModal: React.FC<LevelInfoModalProps> = ({ isOpen, onClose, currentPoints }) => {
  const currentRank = getRankDetails(currentPoints);

  const levels = [
    { 
      name: 'Ibtidaiyah', 
      min: 0, 
      max: 99999, 
      icon: '🌱', 
      color: 'slate',
      bgClass: 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-850',
      textClass: 'text-slate-600 dark:text-slate-350',
      borderClass: 'border-slate-200 dark:border-slate-800',
      badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      description: 'Tingkat dasar bagi santri yang memulai perjalanan menuntut ilmu di dunia modern. Fokus pada pembentukan adab, penguatan akidah, mempelajari tuntunan ibadah dasar, serta pembiasaan amalan harian sederhana.' 
    },
    { 
      name: 'Tsanawiyah', 
      min: 100000, 
      max: 299999, 
      icon: '⭐️', 
      color: 'orange',
      bgClass: 'from-orange-50/50 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10',
      textClass: 'text-orange-600 dark:text-orange-400',
      borderClass: 'border-orange-150 dark:border-orange-900/30',
      badgeClass: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-350',
      description: 'Tingkat menengah awal, melambangkan santri yang giat dan tekun mendalami kitab keislaman. Menunjukkan keaktifan tinggi dalam mencatat mutiara hikmah, mengikuti kuis keagamaan, serta berdiskusi sehat di komunitas.' 
    },
    { 
      name: 'Aliyah', 
      min: 300000, 
      max: 699999, 
      icon: '🏆', 
      color: 'emerald',
      bgClass: 'from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-150 dark:border-emerald-900/30',
      badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-350',
      description: 'Tingkat menengah atas, bagi santri dengan pemahaman materi keagamaan yang matang. Senantiasa istiqomah mengamalkan sunnah harian, aktif menginisiasi permohonan doa, serta menjadi rujukan ilmu bagi santri lainnya.' 
    },
    { 
      name: 'Istiqomah', 
      min: 700000, 
      max: 999999, 
      icon: '✨', 
      color: 'cyan',
      bgClass: 'from-cyan-50/50 to-cyan-100/30 dark:from-cyan-950/20 dark:to-cyan-900/10',
      textClass: 'text-cyan-600 dark:text-cyan-400',
      borderClass: 'border-cyan-155 dark:border-cyan-900/30',
      badgeClass: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-350',
      description: 'Tingkat istimewa yang menandakan keteguhan iman dan kontribusi luar biasa. Karakter santri yang konsisten dalam ibadah, gemar berbagi hadiah keberkahan dengan sesama, dan menginspirasi kebaikan tanpa pamrih.' 
    },
    { 
      name: 'Sultan', 
      min: 1000000, 
      max: Infinity, 
      icon: '👑', 
      color: 'amber',
      bgClass: 'from-amber-50 to-amber-100/40 dark:from-amber-950/30 dark:to-amber-900/20',
      textClass: 'text-amber-600 dark:text-amber-400',
      borderClass: 'border-amber-200 dark:border-amber-900/30',
      badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      description: 'Tingkat tertinggi kehormatan. Diperoleh oleh santri teladan utama yang memiliki keberkahan ilmu yang luas, keaktifan luar biasa, keluhuran budi pekerti yang mulia, serta menjadi pilar pengayom utama di ekosistem Santri Modern.' 
    },
  ];

  // Calculate progress details
  const getProgressDetails = () => {
    if (currentPoints < 100000) {
      const nextRank = levels[1];
      const remainingXp = 100000 - currentPoints;
      const pct = (currentPoints / 100000) * 100;
      return { remainingXp, nextRankName: nextRank.name, pct };
    } else if (currentPoints < 300000) {
      const nextRank = levels[2];
      const xpInCurrentRange = currentPoints - 100000;
      const totalRangeXp = 300000 - 100000;
      const remainingXp = 300000 - currentPoints;
      const pct = (xpInCurrentRange / totalRangeXp) * 100;
      return { remainingXp, nextRankName: nextRank.name, pct };
    } else if (currentPoints < 700000) {
      const nextRank = levels[3];
      const xpInCurrentRange = currentPoints - 300000;
      const totalRangeXp = 700000 - 300000;
      const remainingXp = 700000 - currentPoints;
      const pct = (xpInCurrentRange / totalRangeXp) * 100;
      return { remainingXp, nextRankName: nextRank.name, pct };
    } else if (currentPoints < 1000000) {
      const nextRank = levels[4];
      const xpInCurrentRange = currentPoints - 700000;
      const totalRangeXp = 1000000 - 700000;
      const remainingXp = 1000000 - currentPoints;
      const pct = (xpInCurrentRange / totalRangeXp) * 100;
      return { remainingXp, nextRankName: nextRank.name, pct };
    } else {
      return { remainingXp: 0, nextRankName: '', pct: 100 };
    }
  };

  const { remainingXp, nextRankName, pct } = getProgressDetails();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden z-10 focus:outline-none flex flex-col max-h-[85vh] transition-colors"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Award size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight">Tingkat Keistiqomahan</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Sistem Tingkat & XP Santri Modern</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              
              {/* CURRENT PROGRESS SECTION */}
              <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-600/[0.02] to-transparent p-5 rounded-2xl border border-emerald-500/10 relative overflow-hidden">
                <div className="absolute top-3 right-3 text-emerald-500/20">
                  <Sparkles size={24} />
                </div>
                
                <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-black uppercase tracking-wider mb-1">XP Anda Saat Ini</p>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-black text-slate-800 dark:text-white">{currentPoints.toLocaleString('id-ID')}</span>
                  <span className="text-xs font-bold text-emerald-600/90 dark:text-emerald-400/90">XP</span>
                </div>

                {remainingXp > 0 ? (
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                      <span>Tingkat Saat Ini: <strong className="text-emerald-600 dark:text-emerald-400">{currentRank.name}</strong></span>
                      <span>Menuju <strong className="text-slate-700 dark:text-slate-300">{nextRankName}</strong></span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 text-[10.5px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      <Zap size={12} className="text-amber-500 animate-pulse shrink-0" />
                      <span>
                        Membutuhkan <strong className="font-extrabold text-slate-700 dark:text-slate-200">{(remainingXp).toLocaleString('id-ID')} XP</strong> lagi untuk naik ke tingkat <strong className="font-extrabold text-emerald-600 dark:text-emerald-400">{nextRankName}</strong>.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    <CheckCircle2 size={16} className="text-amber-500 shrink-0" />
                    <span>Selamat! Anda telah mencapai tingkat tertinggi 👑 Sultan. Jadilah teladan mulia bagi sesama santri!</span>
                  </div>
                )}
              </div>

              {/* DETAILS OF LEVELS */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Daftar Tingkat Keistiqomahan</h4>
                
                <div className="space-y-3">
                  {levels.map((lvl) => {
                    const isUserCurrent = currentRank.name === lvl.name;
                    return (
                      <div 
                        key={lvl.name}
                        className={`p-4 rounded-2xl border transition-all flex flex-col gap-2 relative bg-gradient-to-br ${lvl.bgClass} ${lvl.borderClass} ${
                          isUserCurrent ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 scale-[1.01]' : 'opacity-85 hover:opacity-100'
                        }`}
                      >
                        {isUserCurrent && (
                          <span className="absolute top-3.5 right-4 px-2 py-0.5 bg-emerald-600 text-white text-[8px] font-black uppercase rounded-full shadow-sm tracking-wider flex items-center gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-white animate-ping" /> Tingkat Anda
                          </span>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="text-xl leading-none select-none">{lvl.icon}</span>
                          <span className="font-extrabold text-slate-800 dark:text-white text-sm">{lvl.name}</span>
                          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ml-1 ${lvl.badgeClass}`}>
                            {lvl.min === 0 ? '< 100k' : lvl.max === Infinity ? '≥ 1.000k' : `${(lvl.min/1000).toFixed(0)}k - ${((lvl.max+1)/1000).toFixed(0)}k`} XP
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                          {lvl.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Note / Call to Action */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
              <span>Bagikan ilmu & amalan harian Anda untuk meraih XP</span>
              <button 
                onClick={onClose}
                className="font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                Tutup <ChevronRight size={12} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
