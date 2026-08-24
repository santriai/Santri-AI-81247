
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { 
  ArrowLeft, 
  Map as MapIcon, 
  BookOpen, 
  ShieldCheck, 
  Star, 
  Waves, 
  Heart, 
  CheckCircle2, 
  Lock,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Trophy
} from 'lucide-react';

const LEARNING_STAGES = [
  {
    id: 'stage-1',
    title: 'Tahap 1: Pondasi Dasar (Mubtadi)',
    description: 'Mengenal akar keyakinan dan kewajiban utama seorang Muslim.',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderColor: 'border-emerald-100 dark:border-emerald-900/30',
    icon: ShieldCheck,
    iconColor: 'text-emerald-600',
    steps: [
      { id: 'rukun-iman', title: 'Rukun Iman', label: 'Akidah', path: '/rukun-iman', completed: true },
      { id: 'rukun-islam', title: 'Rukun Islam', label: 'Syariah Dasar', path: '/rukun-islam', completed: true },
      { id: 'thaharah', title: 'Thaharah (Bersuci)', label: 'Fikih Ibadah', path: '/thaharah', completed: false },
      { id: 'sholat', title: 'Panduan Sholat Khusyu', label: 'Fikih Ibadah', path: '/sholat-guide', completed: false },
    ]
  },
  {
    id: 'stage-2',
    title: 'Tahap 2: Literasi Al-Qur\'an & Hadis',
    description: 'Mendekatkan diri dengan wahyu dan sunnah Nabi Muhammad SAW.',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-100 dark:border-blue-900/30',
    icon: BookOpen,
    iconColor: 'text-blue-600',
    steps: [
      { id: 'belajar-quran', title: 'Belajar Tajwid & Makhroj', label: 'Al-Quran', path: '/learning-quran', completed: false },
      { id: 'tahfidz', title: 'Menghafal Juz Amma', label: 'Tahfidz', path: '/tahfidz', completed: false },
      { id: 'hadis-arbain', title: 'Hadis Arba\'in Nawawi', label: 'Hadis', path: '/hadis', data: { book: 'arbain' }, completed: false },
    ]
  },
  {
    id: 'stage-3',
    title: 'Tahap 3: Pendalaman Fikih Alat',
    description: 'Belajar instrumen untuk memahami teks klasik secara mandiri.',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    borderColor: 'border-amber-100 dark:border-amber-900/30',
    icon: GraduationCap,
    iconColor: 'text-amber-600',
    steps: [
      { id: 'belajar-kitab', title: 'Nahwu, Shorof & Balaghah', label: 'Alat', path: '/learning-kitab', completed: false },
      { id: 'nahwu', title: 'Kitab Jurumiyyah', label: 'Bahasa Arab', path: '/kitab', data: { kitab: 'jurumiyyah' }, completed: false },
      { id: 'makna-gandul', title: 'Teknik Makna Gandul', label: 'Metodologi', path: '/input', completed: false },
    ]
  },
  {
    id: 'stage-4',
    title: 'Tahap 4: Fikih Muamalah & Kontemporer',
    description: 'Menerapkan syariat dalam kehidupan ekonomi dan sosial modern.',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-100 dark:border-purple-900/30',
    icon: Sparkles,
    iconColor: 'text-purple-600',
    steps: [
      { id: 'zakat', title: 'Manajemen Zakat', label: 'Ekonomi Islam', path: '/zakat', completed: false },
      { id: 'waris', title: 'Faraid (Hukum Waris)', label: 'Hukum Keluarga', path: '/waris', completed: false },
      { id: 'halal-haram', title: 'Halal Haram Kontemporer', label: 'Fikih AI', path: '/explanation', data: { query: 'Fikih kontemporer dan AI' }, completed: false },
    ]
  }
];

const LearningPathScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header Interaktif */}
      <div className="bg-santri-green dark:bg-santri-green-dark p-8 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 0l5 25h25L40 40l5 25-15-15-15 15 5-25L0 25h25z' fill='white'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="max-w-2xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="w-full flex justify-between items-center mb-6">
             <button onClick={() => navigate(-1)} className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white outline-none active:scale-90 transition-transform"><ArrowLeft size={20}/></button>
             <div className="flex items-center gap-2">
               <div className="flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-[10px] font-black uppercase tracking-widest"><Trophy size={14} className="text-santri-gold"/> Level: Santri Mubtadi</div>
               <button 
                 onClick={() => navigate('/settings')} 
                 className="relative active:scale-90 transition-all flex-shrink-0"
               >
                 <UserAvatar 
                   photoURL={userData?.avatarUrl || userData?.photoURL || user?.photoURL}
                   displayName={user?.displayName}
                   points={userData?.points || 0}
                   size="sm"
                   avatarFrame={userData?.avatarFrame}
                 />
               </button>
             </div>
          </div>
          
          <div className="w-20 h-20 bg-santri-gold rounded-3xl flex items-center justify-center shadow-2xl mb-4 rotate-3">
             <MapIcon size={40} className="text-santri-green-dark" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2 italic">Napak Tilas Ilmu</h1>
          <p className="text-xs text-green-50 font-medium leading-relaxed max-w-xs opacity-90">Kurikulum Belajar Terintegrasi: Dari Awam Hingga Paham Turats.</p>
        </div>
      </div>

      <div className="px-6 -mt-8 max-w-2xl mx-auto relative z-20 space-y-8">
        
        {/* Progress Stats Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Progress</span>
              <div className="flex items-center gap-2">
                 <span className="text-3xl font-black text-slate-800 dark:text-white">15%</span>
                 <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-santri-green w-[15%] rounded-full"></div>
                 </div>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-santri-green uppercase tracking-widest">2/13 Selesai</p>
              <p className="text-[9px] text-slate-400 font-bold">2 Fitur Dipelajari</p>
           </div>
        </div>

        {/* Roadmap Steps */}
        <div className="space-y-12 pb-10">
           {LEARNING_STAGES.map((stage, sIdx) => {
             const Icon = stage.icon;
             return (
                <div key={stage.id} className="relative">
                   {/* Vertical Line Connector */}
                   {sIdx < LEARNING_STAGES.length - 1 && (
                      <div className="absolute left-6 top-16 bottom-0 w-1 border-l-2 border-dashed border-slate-200 dark:border-slate-800 -z-10 h-24"></div>
                   )}
                   
                   <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${stage.bgColor} ${stage.iconColor} flex items-center justify-center shadow-sm border ${stage.borderColor}`}>
                         <Icon size={24} />
                      </div>
                      <div className="flex-1">
                         <h3 className="font-black text-slate-800 dark:text-white text-sm">{stage.title}</h3>
                         <p className="text-[10px] text-slate-400 font-bold leading-tight line-clamp-1">{stage.description}</p>
                      </div>
                   </div>

                   <div className="ml-4 space-y-3">
                      {stage.steps.map((step, idx) => (
                        <motion.button
                          key={step.id}
                          whileHover={{ x: 5 }}
                          onClick={() => navigate(step.path, { state: step.data })}
                          className={`w-full flex items-center gap-4 p-4 rounded-3xl border transition-all ${step.completed ? 'bg-white dark:bg-slate-900 border-santri-green/30 dark:border-santri-green/20' : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-80'}`}
                        >
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step.completed ? 'bg-santri-green text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                              {step.completed ? <CheckCircle2 size={16} /> : <Lock size={14} />}
                           </div>
                           <div className="flex-1 text-left min-w-0">
                              <div className="flex items-center gap-2">
                                 <span className={`text-xs font-black ${step.completed ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{step.title}</span>
                                 <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[8px] font-black uppercase text-slate-400 tracking-tighter">{step.label}</span>
                              </div>
                           </div>
                           <ChevronRight size={16} className={step.completed ? 'text-santri-green' : 'text-slate-300'} />
                        </motion.button>
                      ))}
                   </div>
                </div>
             );
           })}
        </div>

        {/* Ecosystem Connectivity Tip */}
        <div className="bg-gradient-to-br from-santri-green-dark to-emerald-950 p-6 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
           <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                 <Sparkles size={24} className="text-santri-gold" />
              </div>
              <h4 className="text-white font-black text-sm mb-2">Interkoneksi AI Santri</h4>
              <p className="text-[10px] text-green-100 font-medium leading-relaxed opacity-80">
                Aplikasi ini dirancang sebagai ekosistem. Hasil pencarian Kitab Kuning Anda akan secara otomatis terhubung dengan kalkulator Fikih dan kurikulum belajar di atas.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default LearningPathScreen;
