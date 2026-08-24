
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { 
  ArrowLeft, 
  Search, 
  Scale, 
  BookOpen, 
  MessageSquare, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  RefreshCw,
  Library,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { generateFatwaAnalysis } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';
import { deductWasilahForAI } from '../services/firebase';

const FATWA_CATEGORIES = [
  { id: 'ibadah', title: 'Ibadah', icon: BookOpen, color: 'bg-emerald-500', queries: ['Hukum Shalat di Kendaraan', 'Qadha Puasa Ramadhan', 'Zakat Penghasilan'] },
  { id: 'muamalah', title: 'Muamalah', icon: Zap, color: 'bg-blue-500', queries: ['Hukum Pinjol dalam Islam', 'Jual Beli Online', 'Crypto menurut Fatwa'] },
  { id: 'nikah', title: 'Nikah & Keluarga', icon: ShieldCheck, color: 'bg-rose-500', queries: ['Hukum Nikah Siri', 'Hak Asuh Anak', 'Nafkah Istri'] },
  { id: 'makanan', title: 'Makanan & Halal', icon: Library, color: 'bg-amber-500', queries: ['Cara Menyembelih Hewan', 'Status Pewarna Cochineal', 'Hukum Produk Syubhat'] }
];

const FatwaScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = async (queryToUse?: string) => {
    const q = queryToUse || searchQuery;
    if (!q.trim()) return;
    
    if (!user) {
      showToast("Silakan login terlebih dahulu", "error");
      return;
    }
    if ((userData?.wasilah || 0) < 1) {
      showToast("Sisa Wasilah Anda tidak cukup (Butuh 1 Wasilah)!", "warning");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const data = await generateFatwaAnalysis(q);
      await deductWasilahForAI(user.uid, 1, `Hukum & Fatwa - ${q}`);
      showToast("Berhasil memproses! (Dipotong 1 Wasilah)", "success");
      setResult(data);
    } catch (e) {
      showToast("Gagal memproses hukum islam.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header */}
      <div className="bg-[#005a2b] dark:bg-emerald-950 pt-5 pb-4 px-4 rounded-b-[1.5rem] shadow-md sticky top-0 z-50 transition-colors">
        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 overflow-hidden">
            <button 
              onClick={() => result ? setResult(null) : navigate(-1)} 
              className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white active:scale-90 transition-transform flex-shrink-0"
            >
              <ArrowLeft size={20}/>
            </button>
            <div className="overflow-hidden">
              <h1 className="text-base md:text-lg font-black text-white leading-tight truncate">Hukum & Fatwa</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-100 truncate">Solusi Fiqih Berdasarkan 4 Madzhab</p>
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

      <div className="px-5 mt-6 max-w-2xl mx-auto">
        {!result && (
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-emerald-100 dark:border-emerald-800/50 shadow-xl shadow-emerald-50/50 dark:shadow-none p-5 mb-6 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                <Search size={12} strokeWidth={3} className="text-emerald-500" />
                Tanya Masalah Hukum
              </h3>
            </div>
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Tanyakan masalah hukum (mis: Hukum Kripto)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-20 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none font-medium"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
              <button 
                onClick={() => handleSearch()}
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1"
              >
                {loading ? <RefreshCw className="animate-spin" size={12} /> : null}
                <span>Tanya</span>
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="categories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
               <section>
                 <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <HelpCircle size={12} /> Sering Ditanyakan
                 </h2>
                 <div className="grid grid-cols-1 gap-3">
                   {FATWA_CATEGORIES.map((cat) => (
                     <div key={cat.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                           <div className={`p-2 rounded-xl ${cat.color} text-white`}>
                              <cat.icon size={18} />
                           </div>
                           <h3 className="font-bold text-slate-800 dark:text-white">{cat.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {cat.queries.map((q, idx) => (
                             <button 
                               key={idx}
                               onClick={() => handleSearch(q)}
                               className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 transition-colors border border-slate-100 dark:border-slate-700"
                             >
                               {q}
                             </button>
                           ))}
                        </div>
                     </div>
                   ))}
                 </div>
               </section>

               <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
                    <Scale size={24} />
                 </div>
                 <div>
                    <h4 className="font-black text-emerald-900 dark:text-emerald-300 text-sm mb-1 uppercase tracking-widest leading-relaxed">Metodologi Fatwa</h4>
                    <p className="text-[11px] text-emerald-700/70 dark:text-emerald-400 leading-relaxed italic pr-4">
                      Sistem ini merujuk pada maraji' (referensi) muktabar dalam Fiqih 4 Madzhab dengan mengutamakan keseimbangan dalil dan realitas zaman.
                    </p>
                 </div>
               </div>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
               {/* Result Summary */}
               <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><Scale size={100} /></div>
                  <div className="flex items-center gap-2 mb-4">
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                       result.lawStatus.toLowerCase().includes('haram') ? 'bg-red-100 text-red-600' : 
                       result.lawStatus.toLowerCase().includes('wajib') ? 'bg-emerald-100 text-emerald-600' : 
                       'bg-indigo-100 text-indigo-600'
                     }`}>
                       {result.lawStatus}
                     </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight mb-4">{result.question}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium border-l-4 border-emerald-500 pl-4 py-1">
                    {result.summary}
                  </p>
               </div>

               {/* Sources/Evidences */}
               <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <FileText size={14} /> Dasar Hukum (Dalil)
                  </h3>
                  {result.evidences.map((ev: any, i: number) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                       <p className="font-arabic text-lg text-slate-800 dark:text-slate-100 text-center mb-4 leading-loose" dir="rtl">{ev.text}</p>
                       <p className="text-[11px] text-slate-500 dark:text-slate-400 italic text-center leading-relaxed">"{ev.meaning}"</p>
                       <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-center">
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Sumber: {ev.source}</span>
                       </div>
                    </div>
                  ))}
               </div>

               {/* Madzhab Expansion */}
               <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Library size={14} /> Pandangan 4 Madzhab
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {result.madzhabComparison.map((m: any, i: number) => (
                       <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                          <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Madzhab {m.madzhab}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{m.opinion}</p>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Final Conclusion */}
               <div className="bg-emerald-600 dark:bg-emerald-900 p-8 rounded-[2.5rem] shadow-lg text-white">
                  <div className="flex items-center gap-3 mb-4">
                     <CheckCircle2 size={24} className="text-emerald-200" />
                     <h3 className="font-black text-lg">Kesimpulan & Nasehat</h3>
                  </div>
                  <p className="text-xs text-emerald-50 leading-relaxed font-medium">
                    {result.conclusion}
                  </p>
               </div>

               <button 
                 onClick={() => setResult(null)}
                 className="w-full py-4 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all mb-8"
               >
                  Tanya Masalah Lain
               </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {loading && (
        <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-[100] flex items-center justify-center p-8">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl flex flex-col items-center text-center gap-4 max-w-xs"
           >
              <div className="relative">
                <RefreshCw size={48} className="text-emerald-500 animate-spin" />
                <Scale className="absolute inset-0 m-auto text-emerald-200" size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm">Menimbang Dalil</h4>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Mohon tunggu, AI sedang merujuk pada maraji' kitab-kitab muktabar...</p>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
};

export default FatwaScreen;
