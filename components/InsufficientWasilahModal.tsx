import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gem, Crown, Gamepad2, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface InsufficientWasilahModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredWasilah?: number;
  featureName?: string;
}

export const InsufficientWasilahModal: React.FC<InsufficientWasilahModalProps> = ({
  isOpen,
  onClose,
  requiredWasilah = 2,
  featureName = 'Fitur AI'
}) => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const currentWasilah = Math.max(0, Number(userData?.wasilah ?? userData?.wasilahPoints ?? 0));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl relative border-t-8 border-amber-500 text-center space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar"
        >
          <button 
            onClick={onClose} 
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
              Fitur <span className="font-bold text-slate-800 dark:text-slate-200">{featureName}</span> memerlukan minimal <span className="font-bold text-amber-600 dark:text-amber-500">{requiredWasilah} Wasilah</span>. Saldo Wasilah tidak dapat bernilai minus.
            </p>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-bold inline-block">
              💰 Sisa Wasilah Anda: <span className="text-base font-black ml-1 text-amber-600 dark:text-amber-400">{currentWasilah}</span> Wasilah
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 text-left">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Pilih Solusi Tambah Wasilah / Akses PRO:</p>

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
                onClick={() => { onClose(); navigate('/premium'); }}
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
                  onClick={() => { onClose(); navigate('/quiz'); }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-2.5 py-2 rounded-xl shadow-xs active:scale-95 transition-all whitespace-nowrap"
                >
                  Kuis
                </button>
                <button 
                  onClick={() => { onClose(); navigate('/quiz-game'); }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] px-2.5 py-2 rounded-xl shadow-xs active:scale-95 transition-all whitespace-nowrap"
                >
                  Miliarder
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
