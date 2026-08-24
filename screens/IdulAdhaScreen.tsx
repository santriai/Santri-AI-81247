
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  Calendar, 
  Star, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Zap,
  ShieldCheck,
  Beef,
  Music,
  MapPin
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import AiFeatureAssistant from '../src/components/AiFeatureAssistant';

interface Amalan {
  id: string;
  task: string;
  category: 'wajib' | 'sunnah';
  completed: boolean;
}

const IdulAdhaScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [activeTab, setActiveTab ] = useState<'countdown' | 'amalan' | 'panduan'>('countdown');
  
  const [checklist, setChecklist] = useState<Amalan[]>([
    { id: '1', task: 'Puasa Arafah (9 Dzulhijjah)', category: 'sunnah', completed: false },
    { id: '2', task: 'Shalat Idul Adha', category: 'sunnah', completed: false },
    { id: '3', task: 'Berkurban', category: 'sunnah', completed: false },
    { id: '4', task: 'Memperbanyak Takbir', category: 'sunnah', completed: false },
    { id: '5', task: 'Sedekah Daging Kurban', category: 'sunnah', completed: false },
    { id: '6', task: 'Tahlil & Tahmid', category: 'sunnah', completed: false },
  ]);

  // Target date for Idul Adha 1447 H (approx May 27, 2026)
  const targetDate = new Date('2026-05-27T00:00:00');

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
      <div className="bg-sky-600 dark:bg-sky-900 px-6 pt-8 pb-14 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        {/* Islamic Geometric Pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='white' stroke-width='0.5'%3E%3Cpath d='M40 0l10 30 30 10-30 10-10 30-10-30-30-10 30-10z'/%3E%3Ccircle cx='40' cy='40' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>

        <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-santri-gold/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center justify-between w-full mb-8">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-white/10 backdrop-blur-lg rounded-xl text-white active:scale-95 transition-transform border border-white/20 shadow-lg"><ArrowLeft size={20}/></button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-sm">
               <ShieldCheck size={10} fill="currentColor" className="text-santri-gold" /> Idul Adha Hub
            </div>
          </div>
          
          <h1 className="text-2xl font-black text-white leading-tight mb-2 drop-shadow-md">Hari Raya Qurban</h1>
          <p className="text-sky-100/80 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed drop-shadow-sm">Ibadah Haji & Penyembelihan</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 -mt-8">
        <AiFeatureAssistant 
          featureName="Pakar Idul Adha" 
          placeholder="Tanyakan hukum qurban, tata cara shalat ied, atau amalan dzulhijjah..." 
        />
        {/* Navigation Tabs */}
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 mb-8 sticky top-4 z-[40]">
          {['countdown', 'amalan', 'panduan'].map((tab) => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`flex-1 py-3 text-[10px] font-black rounded-3xl transition-all uppercase tracking-widest ${
                 activeTab === tab 
                   ? 'bg-sky-600 text-white shadow-lg shadow-sky-200 dark:shadow-none' 
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
                   <Sun className="absolute top-4 right-4 text-sky-100 dark:text-sky-900/40" size={80} />
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Idul Adha 1447 H Dimulai Dalam:</h3>
                   <div className="grid grid-cols-4 gap-3">
                      {[
                        { val: timeLeft?.days ?? 0, label: 'Hari' },
                        { val: timeLeft?.hours ?? 0, label: 'Jam' },
                        { val: timeLeft?.minutes ?? 0, label: 'Menit' },
                        { val: timeLeft?.seconds ?? 0, label: 'Detik' },
                      ].map((item, i) => (
                         <div key={i} className="space-y-2">
                            <div className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner">
                               <span className="text-2xl font-black text-sky-600 dark:text-sky-400 tabular-nums">{item.val}</span>
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => navigate('/qurban')}
                     className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30 flex flex-col items-center gap-3 text-center group transition-all active:scale-95"
                   >
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:rotate-6 transition-transform">
                         <Beef size={24} />
                      </div>
                      <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase leading-tight">Panduan Kurban Lengkap</span>
                   </button>
                   <button 
                     onClick={() => navigate('/hajj-umrah')}
                     className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-[2rem] border border-amber-100 dark:border-amber-800/30 flex flex-col items-center gap-3 text-center group transition-all active:scale-95"
                   >
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm group-hover:-rotate-6 transition-transform">
                         <MapPin size={24} />
                      </div>
                      <span className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase leading-tight">Ibadah Haji & Umroh</span>
                   </button>
                </div>
             </motion.div>
          )}

          {activeTab === 'amalan' && (
             <motion.div 
               key="amalan"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="space-y-4"
             >
                <div className="bg-sky-50 dark:bg-sky-900/10 p-5 rounded-3xl border border-sky-100 dark:border-sky-800/20 mb-6">
                   <div className="flex items-center gap-3 mb-2">
                      <Star className="text-santri-gold" size={18} fill="currentColor" />
                      <h4 className="text-sm font-black text-sky-900 dark:text-sky-200 uppercase tracking-tighter">Amalan Dzulhijjah</h4>
                   </div>
                   <p className="text-[10px] text-sky-700 dark:text-sky-400 font-bold">Progress: {checklist.filter(c => c.completed).length} / {checklist.length} Amalan Selesai</p>
                   <div className="w-full bg-sky-200/50 dark:bg-sky-800/30 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-sky-500 h-full transition-all" style={{ width: `${(checklist.filter(c => c.completed).length / checklist.length) * 100}%` }}></div>
                   </div>
                </div>

                <div className="space-y-3">
                   {checklist.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        className={`w-full flex items-center justify-between p-5 rounded-3xl border transition-all text-left group ${
                          item.completed 
                            ? 'bg-sky-600 border-transparent' 
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-sky-200'
                        }`}
                      >
                         <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                              item.completed ? 'bg-white text-sky-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                               <CheckCircle2 size={16} />
                            </div>
                            <div className="flex flex-col">
                               <span className={`text-sm font-bold ${item.completed ? 'text-white line-through opacity-70' : 'text-slate-700 dark:text-slate-200'}`}>{item.task}</span>
                               <span className={`text-[9px] font-black uppercase tracking-widest ${item.completed ? 'text-sky-100' : item.category === 'wajib' ? 'text-rose-500' : 'text-slate-400'}`}>{item.category}</span>
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
                  { title: 'Tuntunan Shalat Idul Adha', icon: BookOpen, path: '/explanation', data: { query: 'Tata cara shalat idul adha lengkap niat dan khutban' } },
                  { title: 'Sunnah-sunnah Idul Adha', icon: Sun, path: '/explanation', data: { query: 'Amalan sunnah sebelum dan sesudah shalat idul adha' } },
                  { title: 'Lafadz Takbiran Merdu', icon: Music, path: '/explanation', data: { query: 'Teks bacaan takbiran idul adha lengkap arab latin dan artinya' } },
                  { title: 'Hukum Berkurban', icon: ShieldCheck, path: '/explanation', data: { query: 'Syarat sah hewan kurban dan siapa yang wajib berkurban' } },
                  { title: 'Keutamaan 10 Dzulhijjah', icon: Star, path: '/explanation', data: { query: 'Fadhilah dan keistimewaan 10 hari pertama bulan dzulhijjah' } },
                  { title: 'Adab Menyembelih', icon: Beef, path: '/explanation', data: { query: 'Tata cara menyembelih hewan kurban sesuai syariat' } },
                ].map((p, i) => (
                   <button 
                     key={i}
                     onClick={() => navigate(p.path, { state: p.data })}
                     className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all active:scale-[0.98]"
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-sky-600 shadow-sm">
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

export default IdulAdhaScreen;
