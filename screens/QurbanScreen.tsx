
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  CheckSquare, 
  ShieldCheck, 
  BookOpen, 
  Info,
  CircleArrowRight,
  History,
  Droplets
} from 'lucide-react';

const QURBAN_RULES = [
  {
    id: 'syarat',
    title: 'Syarat Hewan Kurban',
    items: ['Cukup umur (Musinnah)', 'Sehat & tidak cacat', 'Milik sendiri (sah)', 'Jenis hewan ternak'],
    color: 'text-emerald-600'
  },
  {
    id: 'waktu',
    title: 'Waktu Penyembelihan',
    items: ['Setelah sholat Idul Adha', 'Hari Tasyrik (11-13 Dzulhijjah)', 'Sebelum sunset 13 Dzulhijjah'],
    color: 'text-amber-600'
  }
];

const QurbanScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="bg-emerald-600 dark:bg-emerald-900 p-6 rounded-b-[2.5rem] shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white active:scale-90 transition-transform"><ArrowLeft size={20}/></button>
          <div>
            <h1 className="text-xl font-black text-white leading-tight">Panduan Kurban</h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-100">Menyembelih Ego, Meraih Taqwa</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-8 max-w-2xl mx-auto space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {QURBAN_RULES.map((section, idx) => (
             <motion.div 
               key={section.id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.1 }}
               className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm"
             >
                <h3 className={`font-black text-xs uppercase tracking-widest mb-4 ${section.color}`}>{section.title}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {section.items.map((item, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center gap-2">
                       <CheckSquare size={14} className="text-emerald-500 shrink-0" />
                       <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 leading-tight">{item}</span>
                    </div>
                  ))}
                </div>
             </motion.div>
          ))}
        </div>

        <section className="space-y-3">
           <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-widest px-1">Hukum & Literasi</h3>
           
           <button 
             onClick={() => navigate('/explanation', { state: { query: 'Hukum kurban wajib atau sunnah menurut jumhur ulama' } })}
             className="w-full bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group"
           >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Hukum Kurban</h4>
                  <p className="text-[10px] text-slate-500">Wajib bagi yang mampu?</p>
                </div>
              </div>
              <CircleArrowRight size={20} className="text-slate-200 group-hover:text-emerald-500" />
           </button>

           <button 
             onClick={() => navigate('/explanation', { state: { query: 'Pembagian daging kurban yang benar menurut madzhab syafii' } })}
             className="w-full bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group"
           >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-600">
                   <Droplets size={20} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Pembagian Daging</h4>
                  <p className="text-[10px] text-slate-500">Prinsip 1/3 untuk shohibul kurban.</p>
                </div>
              </div>
              <CircleArrowRight size={20} className="text-slate-200 group-hover:text-amber-500" />
           </button>
        </section>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-2 mb-3">
             <History size={16} className="text-emerald-600" />
             <h4 className="text-emerald-800 dark:text-emerald-300 font-black text-xs uppercase italic">Sejarah Kurban</h4>
          </div>
          <p className="text-[11px] text-emerald-900 dark:text-emerald-100 font-medium leading-relaxed">
            Berawal dari ketaatan Nabi Ibrahim AS saat diperintahkan Allah untuk menyembelih putra tercintanya, Ismail AS, yang kemudian diganti dengan seekor domba.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QurbanScreen;
