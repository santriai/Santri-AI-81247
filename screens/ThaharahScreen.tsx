
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { 
  ArrowLeft, 
  Waves, 
  CheckCircle, 
  HelpCircle, 
  BookOpen, 
  Info,
  Droplets,
  Sunrise,
  Sunset,
  History
} from 'lucide-react';

const THAHARAH_GUIDE = [
  {
    id: 'wudhu',
    title: 'Wudhu (Bersuci Ringan)',
    description: 'Panduan bersuci sebelum melaksanakan sholat atau memegang mushaf.',
    steps: [
      'Niat lisan atau dalam hati',
      'Membasuh kedua telapak tangan',
      'Berkumur-kumur (Madmadhah)',
      'Menghirup air ke hidung (Istinsyaq)',
      'Membasuh wajah (Wajib)',
      'Membasuh kedua tangan sampai siku (Wajib)',
      'Mengusap sebagian kepala (Wajib)',
      'Membasuh kedua kaki sampai mata kaki (Wajib)',
      'Tertib & Doa setelah wudhu'
    ],
    path: '/explanation',
    data: { query: 'Dalil dan tata cara wudhu yang benar menurut Madzhab Syafii' }
  },
  {
    id: 'ghusl',
    title: 'Mandi Wajib (Janabat)',
    description: 'Panduan bersuci dari hadats besar.',
    steps: [
      'Niat mandi wajib',
      'Mencuci tangan 3x',
      'Membersihkan kemaluan',
      'Berwudhu sempurna',
      'Mengguyur air ke kepala 3x',
      'Meratakan air ke seluruh tubuh',
      'Tertib'
    ],
    path: '/nifas', // Redirect to related calc if applicable, or explanation
    data: { query: 'Niat dan rukun mandi wajib menurut ulama nusantara' }
  },
  {
    id: 'tayamum',
    title: 'Tayamum',
    description: 'Bersuci dengan debu suci sebagai pengganti wudhu saat darurat.',
    steps: [
      'Niat tayamum',
      'Menepukkan tangan ke debu suci',
      'Mengusap wajah',
      'Mengusap kedua tangan sampai siku',
      'Urut (Tertib)'
    ],
    path: '/explanation',
    data: { query: 'Syarat sah tayamum saat sakit atau tidak ada air' }
  }
];

const ThaharahScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="bg-[#005a2b] dark:bg-emerald-950 pt-5 pb-4 px-4 rounded-b-[1.5rem] shadow-md sticky top-0 z-50 transition-colors">
        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 overflow-hidden">
            <button onClick={() => navigate(-1)} className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white active:scale-90 transition-transform flex-shrink-0">
              <ArrowLeft size={20}/>
            </button>
            <div className="overflow-hidden">
              <h1 className="text-base md:text-lg font-black text-white leading-tight truncate">Materi Thaharah</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-100 truncate">Bersuci Adalah Kunci Sholat</p>
            </div>
          </div>

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

      <div className="px-5 mt-8 max-w-2xl mx-auto space-y-6">
        {THAHARAH_GUIDE.map((section, idx) => (
           <motion.div 
             key={section.id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: idx * 0.1 }}
             className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
           >
              <div className="p-6">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl text-cyan-600">
                       <Droplets size={24} />
                    </div>
                    <h2 className="text-lg font-black text-slate-800 dark:text-white leading-tight">{section.title}</h2>
                 </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{section.description}</p>
                 
                 <div className="space-y-3 mb-8">
                    {section.steps.map((step, sIdx) => (
                       <div key={sIdx} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 flex items-center justify-center text-[10px] font-black shrink-0">{sIdx + 1}</div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{step}</span>
                       </div>
                    ))}
                 </div>

                 <button 
                   onClick={() => navigate(section.path, { state: section.data })}
                   className="w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-cyan-600 dark:text-cyan-400 font-black text-xs flex items-center justify-center gap-2 hover:bg-cyan-50 transition-colors"
                 >
                    Pelajari Analisis Kitab Kuning <BookOpen size={16} />
                 </button>
              </div>
           </motion.div>
        ))}

        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 text-center">
           <h4 className="text-emerald-800 dark:text-emerald-300 font-black text-xs uppercase mb-2">PENTING</h4>
           <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium italic leading-relaxed">
             "Allah tidak menerima sholat salah seorang di antara kalian jika ia berhadats sampai ia berwudhu." (HR. Bukhari)
           </p>
        </div>
      </div>
    </div>
  );
};

export default ThaharahScreen;
