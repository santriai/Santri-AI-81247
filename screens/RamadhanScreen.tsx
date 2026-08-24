
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Calendar, 
  Star, 
  HeartPulse, 
  BookOpen, 
  Utensils, 
  Clock, 
  CheckCircle2, 
  Coins,
  ChevronRight,
  Flame,
  Droplets,
  Zap,
  Sparkles,
  Fingerprint
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import AiFeatureAssistant from '../src/components/AiFeatureAssistant';

interface Amalan {
  id: string;
  task: string;
  category: 'wajib' | 'sunnah';
  completed: boolean;
}

const RamadhanScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'countdown' | 'amalan' | 'panduan'>('countdown');
  const [checklist, setChecklist] = useState<Amalan[]>([
    { id: '1', task: 'Puasa Ramadhan', category: 'wajib', completed: false },
    { id: '2', task: 'Shalat Tarawih', category: 'sunnah', completed: false },
    { id: '3', task: 'Tadarus Al-Quran', category: 'sunnah', completed: false },
    { id: '4', task: 'Shalat Rawatib', category: 'sunnah', completed: false },
    { id: '5', task: 'Sedekah/Infaq', category: 'sunnah', completed: false },
    { id: '6', task: 'Dzikir Pagi & Petang', category: 'sunnah', completed: false },
    { id: '7', task: 'Witir', category: 'sunnah', completed: false },
  ]);

  // Target date for Ramadhan 1448 H (approx. March 1, 2027)
  const targetDate = new Date('2027-03-01T00:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const toggleCheck = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
    const item = checklist.find(i => i.id === id);
    if (item && !item.completed) {
      showToast(`Maa syaa Allah! ${item.task} selesai.`, 'success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans">
      {/* Dynamic Header */}
      <div className="bg-emerald-600 dark:bg-emerald-900 px-6 pt-8 pb-14 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        {/* Elegant Islamic Rub el Hizb Pattern Background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='white' stroke-width='0.5'%3E%3Cpath d='M40 0l10 30 30 10-30 10-10 30-10-30-30-10 30-10z'/%3E%3Ccircle cx='40' cy='40' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>

        {/* 8-Pointed Star Ornaments (Refined Placement) */}
        <div className="absolute top-4 left-6 text-white/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
          </svg>
        </div>
        <div className="absolute top-4 right-6 text-white/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
          </svg>
        </div>
        <div className="absolute top-24 right-10 text-santri-gold/10 rotate-12 scale-150">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" />
          </svg>
        </div>

        <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-santri-gold/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center justify-between w-full mb-8">
            <button onClick={() => navigate('/')} className="p-2.5 bg-white/10 backdrop-blur-lg rounded-xl text-white active:scale-95 transition-transform border border-white/20 shadow-lg"><ArrowLeft size={20}/></button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-sm">
               <Zap size={10} fill="currentColor" className="text-santri-gold" /> Hub Ramadhan
            </div>
          </div>
          
          <h1 className="text-2xl font-black text-white leading-tight mb-2 drop-shadow-md">Marhaban Ya Ramadhan</h1>
          <p className="text-emerald-100/80 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed drop-shadow-sm">Pusat Ibadah & Persiapan</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 -mt-8">
        <AiFeatureAssistant 
          featureName="Spesialis Ramadhan" 
          placeholder="Tanyakan fiqih puasa, fadhilah tarawih, amalan lailatul qadar..." 
        />
        {/* Navigation Tabs */}
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 mb-8 sticky top-4 z-[40]">
          {['countdown', 'amalan', 'panduan'].map((tab) => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`flex-1 py-3 text-[10px] font-black rounded-3xl transition-all uppercase tracking-widest ${
                 activeTab === tab 
                   ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none' 
                   : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
               }`}
             >
                {tab}
             </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'countdown' && (
             <motion.div 
               key="countdown"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="space-y-6"
             >
                {/* Timer Card */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center relative overflow-hidden">
                   <Moon className="absolute top-4 right-4 text-emerald-100 dark:text-emerald-900/40" size={80} />
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Ramadhan 1446 H Dimulai Dalam:</h3>
                   <div className="grid grid-cols-4 gap-3">
                      {[
                        { val: timeLeft?.days ?? 0, label: 'Hari' },
                        { val: timeLeft?.hours ?? 0, label: 'Jam' },
                        { val: timeLeft?.minutes ?? 0, label: 'Menit' },
                        { val: timeLeft?.seconds ?? 0, label: 'Detik' },
                      ].map((item, i) => (
                         <div key={i} className="space-y-2">
                            <div className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner">
                               <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{item.val}</span>
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Nisfu Syaban Highlight */}
                <button 
                  onClick={() => navigate('/nisfu-syaban')}
                  className="w-full bg-indigo-600 dark:bg-indigo-700 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-between group active:scale-95 transition-all text-white overflow-hidden relative"
                >
                   <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l2 6 6 2-6 2-2 6-2-6-6-2 6-2z' fill='white'/%3E%3C/svg%3E")` }}></div>
                   <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 group-hover:rotate-6 transition-transform">
                         <Sparkles size={24} />
                      </div>
                      <div className="text-left">
                         <h3 className="font-black text-sm uppercase tracking-widest leading-none mb-1">Amalan Nisfu Syaban</h3>
                         <p className="text-[10px] font-bold text-indigo-100 opacity-80">Persiapan menyambut Ramadhan</p>
                      </div>
                   </div>
                   <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ChevronRight size={18} />
                   </div>
                </button>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => navigate('/zakat', { state: { activeTab: 'fitrah' } })}
                     className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30 flex flex-col items-center gap-3 text-center group transition-all active:scale-95"
                   >
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:rotate-6 transition-transform">
                         <Coins size={24} />
                      </div>
                      <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase leading-tight">Membayar Zakat Fitrah</span>
                   </button>
                   <button 
                     onClick={() => navigate('/zakat', { state: { activeTab: 'fidyah' } })}
                     className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-[2rem] border border-rose-100 dark:border-rose-800/30 flex flex-col items-center gap-3 text-center group transition-all active:scale-95"
                   >
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm group-hover:-rotate-6 transition-transform">
                         <HeartPulse size={24} />
                      </div>
                      <span className="text-xs font-black text-rose-800 dark:text-rose-300 uppercase leading-tight">Menebus Utang Fidyah</span>
                   </button>
                </div>

                {/* Doa Nabi Yunus Secondary Highlight */}
                <button 
                  onClick={() => navigate('/doa-nabi-yunus')}
                  className="w-full p-6 rounded-[2.5rem] border flex items-center justify-between group active:scale-95 transition-all overflow-hidden relative bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm"
                >
                   <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                         <Fingerprint size={24} />
                      </div>
                      <div className="text-left">
                         <h3 className="font-black text-sm uppercase tracking-widest leading-none mb-1 text-slate-800 dark:text-white">Doa Nabi Yunus</h3>
                         <p className="text-[10px] font-bold text-slate-400">Dzikir Tasbih Digital</p>
                      </div>
                   </div>
                   <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform bg-slate-50 dark:bg-slate-800">
                      <ChevronRight size={18} className="text-slate-400" />
                   </div>
                </button>
             </motion.div>
          )}

          {activeTab === 'amalan' && (
             <motion.div 
               key="amalan"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="space-y-4"
             >
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-800/20 mb-6">
                   <div className="flex items-center gap-3 mb-2">
                      <Star className="text-santri-gold" size={18} fill="currentColor" />
                      <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-tighter">Target Harian Saya</h4>
                   </div>
                   <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Progress: {checklist.filter(c => c.completed).length} / {checklist.length} Amalan Selesai</p>
                   <div className="w-full bg-emerald-200/50 dark:bg-emerald-800/30 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(checklist.filter(c => c.completed).length / checklist.length) * 100}%` }}></div>
                   </div>
                </div>

                <div className="space-y-3">
                   {checklist.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all text-left group ${
                          item.completed 
                            ? 'bg-emerald-600 border-transparent' 
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-emerald-200'
                        }`}
                      >
                         <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                              item.completed ? 'bg-white text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                               <CheckCircle2 size={16} />
                            </div>
                            <div className="flex flex-col">
                               <span className={`text-sm font-bold ${item.completed ? 'text-white line-through opacity-70' : 'text-slate-700 dark:text-slate-200'}`}>{item.task}</span>
                               <span className={`text-[9px] font-black uppercase tracking-widest ${item.completed ? 'text-emerald-100' : item.category === 'wajib' ? 'text-rose-500' : 'text-slate-400'}`}>{item.category}</span>
                            </div>
                         </div>
                      </button>
                   ))}
                </div>
             </motion.div>
          )}

          {activeTab === 'panduan' && (
             <motion.div 
               key="panduan"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="space-y-4"
             >
                {[
                  { title: 'Niat Puasa Ramadhan', icon: Moon, path: '/explanation', data: { query: 'Bacaan niat puasa ramadhan dan artinya lengkap' } },
                  { title: 'Doa Berbuka Puasa', icon: Sun, path: '/explanation', data: { query: 'Doa buka puasa yang shahih sesuai sunnah dan artinya' } },
                  { title: 'Tata Cara Tarawih', icon: Utensils, path: '/explanation', data: { query: 'Panduan tata cara shalat tarawih dan witir di rumah' } },
                  { title: 'Syarat & Rukun Puasa', icon: BookOpen, path: '/explanation', data: { query: 'Penjelasan syarat rukun dan hal yang membatalkan puasa' } },
                  { title: 'Lailatul Qadar', icon: Star, path: '/explanation', data: { query: 'Tanda-tanda malam lailatul qadar dan amalan yang dianjurkan' } },
                  { title: 'Fidyah & Qada', icon: Flame, path: '/explanation', data: { query: 'Siapa saja yang wajib bayar fidyah dan cara menghitungnya' } },
                ].map((p, i) => (
                   <button 
                     key={i}
                     onClick={() => navigate(p.path, { state: p.data })}
                     className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all active:scale-[0.98]"
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                            <p.icon size={20} />
                         </div>
                         <span className="text-sm font-black text-slate-700 dark:text-slate-100 uppercase tracking-tighter">{p.title}</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                   </button>
                ))}
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RamadhanScreen;
