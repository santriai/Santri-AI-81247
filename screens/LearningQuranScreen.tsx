
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Mic2, 
  Music, 
  Volume2,
  RefreshCw,
  Sparkles,
  Play
} from 'lucide-react';
import { generateEducationalContent } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';

const QURAN_MODULES = [
  { id: 'makhraj', title: 'Makhorijul Huruf', icon: Mic2, desc: 'Tempat keluarnya huruf hijaiyah.' },
  { id: 'tajwid', title: 'Ilmu Tajwid', icon: Sparkles, desc: 'Hukum nun sukun, idgham, mad, dll.' },
  { id: 'naghom', title: 'Naghom (Irama)', icon: Music, desc: 'Mengenal irama Bayati, Shoba, dll.' },
  { id: 'tahsin', title: 'Tahsin Tilawah', icon: CheckCircle2, desc: 'Memperbaiki kualitas bacaan.' }
];

const LearningQuranScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [activeStepTab, setActiveStepTab] = useState<number | 'ALL'>('ALL');
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const handleSelectModule = async (mod: any, forceRefresh: boolean = false) => {
    setSelectedModule(mod);
    setLoading(true);
    if (forceRefresh) {
      setContent(null);
    }
    try {
      const data = await generateEducationalContent("Belajar Alquran", mod.title, forceRefresh);
      setContent(data);
      if (forceRefresh) {
        showToast("Modul Al-Qur'an AI berhasil diperbarui!", "success");
      }
    } catch (e) {
      showToast("Gagal memuat materi.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleStepComplete = (stepNum: number) => {
    setCompletedSteps(prev => {
      const next = { ...prev, [stepNum]: !prev[stepNum] };
      if (next[stepNum]) {
        showToast(`Langkah ${stepNum} selesai! Alhamdulillāh`, "success");
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <div className="bg-[#005a2b] dark:bg-emerald-950 pt-5 pb-4 px-4 rounded-b-[1.5rem] shadow-md sticky top-0 z-50 transition-colors">
        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 overflow-hidden">
            <button onClick={() => selectedModule ? setSelectedModule(null) : navigate(-1)} className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white active:scale-90 transition-transform flex-shrink-0">
              <ArrowLeft size={20}/>
            </button>
            <div className="overflow-hidden">
              <h1 className="text-base md:text-lg font-black text-white leading-tight truncate">{selectedModule ? selectedModule.title : 'Belajar Al-Quran'}</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-100 truncate">Modul Step-by-Step Pemula s/d Mahir</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedModule && (
              <button 
                onClick={() => handleSelectModule(selectedModule, true)}
                disabled={loading}
                className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                title="Muat Ulang AI"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh AI</span>
              </button>
            )}

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
      </div>

      <div className="px-5 mt-8 max-w-2xl mx-auto">
        {!selectedModule ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
              <Sparkles className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={18} />
              <div>
                <strong className="font-extrabold block mb-0.5 text-emerald-950 dark:text-emerald-100">Modul Belajar Al-Qur'an Bertahap</strong>
                Pilih topik di bawah ini untuk belajar membaca Al-Qur'an secara tepat dari makhraj, tajwid, hingga seni tilawah dan tahsin.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {QURAN_MODULES.map((mod, idx) => {
                const Icon = mod.icon;
                return (
                  <motion.button 
                    key={mod.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleSelectModule(mod)}
                    className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                         <Icon size={28} />
                      </div>
                      <div>
                         <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{mod.title}</h3>
                         <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{mod.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-200 group-hover:text-emerald-500 transition-colors" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                 <RefreshCw size={32} className="text-emerald-500 animate-spin" />
                 <p className="text-xs font-bold text-slate-400 italic">Mempersiapkan Modul Al-Qur'an AI...</p>
              </div>
            ) : content && (
              <>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                   <div className="flex items-center justify-between gap-2 mb-2">
                     <h2 className="text-lg font-black text-slate-800 dark:text-white">{content.title}</h2>
                     <button 
                       onClick={() => handleSelectModule(selectedModule, true)}
                       className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200/50 flex items-center gap-1 active:scale-95 transition-transform"
                     >
                       <RefreshCw size={12} /> Perbarui Modul
                     </button>
                   </div>
                   <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic border-l-4 border-emerald-500 pl-4 py-1">{content.intro}</p>
                </div>

                {/* Render Step-by-Step Modules if available */}
                {content.steps && Array.isArray(content.steps) && content.steps.length > 0 && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-2 px-1">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        <Sparkles size={16} />
                        <span>Modul Langkah demi Langkah ({content.steps.length} Step)</span>
                      </div>
                    </div>

                    {/* Step Tabs Filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                      <button
                        onClick={() => setActiveStepTab('ALL')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                          activeStepTab === 'ALL'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        Semua Langkah
                      </button>
                      {content.steps.map((st: any, idx: number) => {
                        const num = st.stepNumber || idx + 1;
                        const isDone = completedSteps[num];
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveStepTab(num)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                              activeStepTab === num
                                ? 'bg-emerald-600 text-white shadow-md'
                                : isDone
                                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-300'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            {isDone && <CheckCircle2 size={12} className="text-emerald-600" />}
                            <span>Langkah {num}</span>
                          </button>
                        );
                      })}
                    </div>

                    {content.steps
                      .filter((step: any, sIdx: number) => activeStepTab === 'ALL' || activeStepTab === (step.stepNumber || sIdx + 1))
                      .map((step: any, sIdx: number) => {
                        const num = step.stepNumber || sIdx + 1;
                        const isDone = completedSteps[num];
                        return (
                          <div key={sIdx} className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border shadow-sm space-y-4 transition-all ${
                            isDone ? 'border-emerald-400 dark:border-emerald-800 bg-emerald-50/10' : 'border-slate-100 dark:border-slate-800'
                          }`}>
                            <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                              <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                                  isDone ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white'
                                }`}>
                                  {num}
                                </span>
                                <h3 className="font-bold text-slate-800 dark:text-white text-base">
                                  {step.title}
                                </h3>
                              </div>

                              <button
                                onClick={() => toggleStepComplete(num)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                                  isDone 
                                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                              >
                                <CheckCircle2 size={14} className={isDone ? 'text-emerald-600' : 'text-slate-400'} />
                                <span>{isDone ? 'Selesai' : 'Tandai Selesai'}</span>
                              </button>
                            </div>

                            {step.explanation && (
                              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                                {step.explanation}
                              </p>
                            )}

                            {/* Examples */}
                            {step.examples && Array.isArray(step.examples) && step.examples.length > 0 && (
                              <div className="space-y-2.5 pt-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Contoh Bacaan & Hukum:</span>
                                <div className="grid grid-cols-1 gap-2.5">
                                  {step.examples.map((ex: any, eIdx: number) => (
                                    <div key={eIdx} className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-1.5">
                                      {ex.arabic && (
                                        <div className="font-arabic text-xl text-emerald-950 dark:text-emerald-100 font-bold text-right dir-rtl leading-loose">
                                          {ex.arabic}
                                        </div>
                                      )}
                                      <div className="flex items-center justify-between gap-2 text-xs">
                                        <span className="font-bold text-emerald-800 dark:text-emerald-300">{ex.read}</span>
                                        <span className="text-slate-600 dark:text-slate-400 text-[11px] italic">{ex.meaning}</span>
                                      </div>
                                      {ex.note && (
                                        <div className="text-[10px] text-emerald-900/80 dark:text-emerald-300/80 bg-emerald-100/60 dark:bg-emerald-900/40 p-2 rounded-xl">
                                          💡 <strong className="font-semibold">Cara Baca & Hukum:</strong> {ex.note}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {step.actionTip && (
                              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2">
                                <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">🎯 Latihan Suara:</span>
                                <span>{step.actionTip}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Additional Sections */}
                {content.sections && Array.isArray(content.sections) && content.sections.map((section: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mb-4 uppercase tracking-widest">{section.title}</h3>
                    <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                ))}

                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800/20">
                   <h4 className="text-emerald-800 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest mb-3">Tips Berlatih</h4>
                   <ul className="space-y-2">
                     {content.tips && Array.isArray(content.tips) && content.tips.map((tip: string, tIdx: number) => (
                       <li key={tIdx} className="flex gap-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 size={12} className="shrink-0 mt-0.5" /> {tip}
                       </li>
                     ))}
                   </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningQuranScreen;
