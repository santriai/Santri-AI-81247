import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Info, Calendar, AlertTriangle, BookOpen, Clock, HeartPulse, Save, Trash2, ChevronDown, ChevronUp, Sparkles, LayoutDashboard, History, CheckCircle2, Loader2, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PLAYSTORE_LINK } from '../constants';
import AiFeatureAssistant from '../src/components/AiFeatureAssistant';
import WizardDatePicker from '../src/components/WizardDatePicker';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserAvatar } from '../components/UserAvatar';
import ConfirmationModal from '../components/ConfirmationModal';
import { saveMenstrualLog, subscribeToMenstrualLogs, deleteMenstrualLog, MenstrualLog, isFirebaseReady } from '../services/firebase';

const IslamicPattern: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}>
      <svg 
        className="w-full h-full fill-current"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="islamic-grid-menstrual" width="24" height="24" patternUnits="userSpaceOnUse">
            {/* Rub el Hizb (eight-pointed star) inside each cell */}
            <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" />
            <path d="M12 5 L19 12 L12 19 L5 12 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            {/* Accent center circle */}
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            {/* Connecting lines for cross-grid */}
            <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
            <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#islamic-grid-menstrual)" />
      </svg>
    </div>
  );
};

const MenstrualCalculatorScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<MenstrualLog[]>([]);
  const [activeLog, setActiveLog] = useState<MenstrualLog | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showManual, setShowManual] = useState(false);

  const [usingLocalFallback, setUsingLocalFallback] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [eduTab, setEduTab] = useState<'warna' | 'hukum' | 'dalil'>('warna');

  const handleShareFeature = () => {
    const text = `Saya menghitung haid di aplikasi Santri AI. Aplikasi kalkulator fiqih haid & ibadah terlengkap!\n\nAyo download aplikasinya di Play Store sekarang:\n${PLAYSTORE_LINK}`;
    if (window.AndroidNativeInterface?.shareText) {
      window.AndroidNativeInterface.shareText('Bagikan Kalkulator Haid', text);
    } else if (navigator.share) {
      navigator.share({
        title: 'Kalkulator Haid Santri AI',
        text: text
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      showToast("Link berhasil disalin ke clipboard!", "success");
    }
  };

  useEffect(() => {
    if (user) {
      const loadLocalStorageFallback = () => {
        try {
          const stored = localStorage.getItem(`santri_logs_haid_${user.uid}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            setLogs(parsed);
            const active = parsed.find((l: any) => l.status === 'Sedang Berlangsung');
            setActiveLog(active || null);
          }
        } catch (err) {
          console.error("Local storage read error:", err);
        }
      };

      const unsubscribe = subscribeToMenstrualLogs(user.uid, (data) => {
        const haidLogs = data.filter(l => l.type === 'haid');
        setLogs(haidLogs);
        const active = haidLogs.find(l => l.status === 'Sedang Berlangsung');
        setActiveLog(active || null);
        setUsingLocalFallback(false);
      }, (err) => {
        console.warn("Falling back to client LocalStorage for menstrual logs due to Firestore permission constraints.");
        setUsingLocalFallback(true);
        loadLocalStorageFallback();
      });
      return () => unsubscribe();
    }
  }, [user]);

  const saveLogLocal = (newLog: any) => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(`santri_logs_haid_${user.uid}`);
      let currentLogs = stored ? JSON.parse(stored) : [];
      const entry = {
        id: newLog.id || `local_${Date.now()}`,
        ...newLog,
        createdAt: { seconds: Math.floor(Date.now() / 1000) }
      };
      currentLogs = [entry, ...currentLogs.filter((l: any) => l.id !== entry.id)];
      localStorage.setItem(`santri_logs_haid_${user.uid}`, JSON.stringify(currentLogs));
      setLogs(currentLogs.filter((l: any) => l.type === 'haid'));
      const active = currentLogs.find((l: any) => l.type === 'haid' && l.status === 'Sedang Berlangsung');
      setActiveLog(active || null);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteLogLocal = (logId: string) => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(`santri_logs_haid_${user.uid}`);
      let currentLogs = stored ? JSON.parse(stored) : [];
      currentLogs = currentLogs.filter((l: any) => l.id !== logId);
      localStorage.setItem(`santri_logs_haid_${user.uid}`, JSON.stringify(currentLogs));
      setLogs(currentLogs.filter((l: any) => l.type === 'haid'));
      const active = currentLogs.find((l: any) => l.type === 'haid' && l.status === 'Sedang Berlangsung');
      setActiveLog(active || null);
    } catch (e) {
      console.error(e);
    }
  };

  const calculateHaid = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return null;
    
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    let status = '';
    let category = '';
    let description = '';
    let healthInsight = '';

    if (diffHours < 24) {
      status = 'Bukan Haid (Istihadhoh)';
      category = 'Istihadhoh';
      description = 'Batas minimal haid adalah 24 jam menurut madzhab Syafi\'i. Darah yang keluar dalam waktu kurang dari 24 jam (secara akumulatif dalam 15 hari) dihukumi Istihadhoh.';
    } else if (diffDays > 15) {
      status = 'Melebihi Batas (Istihadhoh)';
      category = 'Istihadhoh';
      description = 'Batas maksimal haid adalah 15 hari 15 malam. Darah yang keluar setelah hari ke-15 dihukumi Istihadhoh. Anda wajib mandi besar & mulai shalat kembali.';
    } else {
      status = 'Haid Normal';
      category = 'Haid';
      description = 'Darah memenuhi kriteria haid (24 jam - 15 hari). Dilarang shalat, puasa, dan jima\'. Wajib mandi besar setelah darah benar-benar berhenti.';
      
      const nextCycle = new Date(start);
      nextCycle.setDate(start.getDate() + 28);
      const masaSuburStart = new Date(start);
      masaSuburStart.setDate(start.getDate() + 12);
      const masaSuburEnd = new Date(start);
      masaSuburEnd.setDate(start.getDate() + 16);

      healthInsight = `Masa Subur: ${masaSuburStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${masaSuburEnd.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}.`;
    }

    return { status, category, description, duration: Math.floor(diffDays * 10) / 10, healthInsight };
  };

  const handleManualCalculate = () => {
    if (!startDate || !endDate) return;
    const res = calculateHaid(startDate, endDate);
    if (res) {
      setResult(res);
      setShowManual(false); // Close accordion on success
    } else {
      showToast("Tanggal selesai tidak valid", "error");
    }
  };

  const handleStartTracking = async () => {
    if (!user) {
      showToast("Silakan login untuk mulai melacak", "info");
      return;
    }
    const logData = {
      type: 'haid' as const,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      duration: 0,
      status: 'Sedang Berlangsung',
      category: 'Active'
    };
    if (usingLocalFallback) {
      saveLogLocal(logData);
      showToast("Pelacakan haid dimulai secara Lokal!", "success");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      await saveMenstrualLog(user.uid, logData);
      showToast("Pelacakan haid dimulai!", "success");
    } catch (e: any) {
      console.warn("Firestore error starting tracking, using LocalFallback:", e);
      saveLogLocal(logData);
      setUsingLocalFallback(true);
      showToast("Menggunakan penyimpanan lokal sementara.", "info");
    } finally {
      setSaving(false);
    }
  };

  const handleEndTracking = async () => {
    if (!user || !activeLog || !activeLog.id) return;
    const now = new Date().toISOString();
    const res = calculateHaid(activeLog.startDate, now);
    if (!res) return;

    const updatedLog = {
      type: 'haid' as const,
      startDate: activeLog.startDate,
      endDate: now,
      duration: res.duration,
      status: res.status,
      category: res.category
    };

    if (usingLocalFallback || activeLog.id.startsWith('local_')) {
      deleteLogLocal(activeLog.id);
      saveLogLocal(updatedLog);
      setResult(res);
      showToast("Haid selesai dicatat secara Lokal!", "success");
      return;
    }

    setSaving(true);
    try {
      await deleteMenstrualLog(user.uid, activeLog.id);
      await saveMenstrualLog(user.uid, updatedLog);
      setResult(res);
      showToast("Haid selesai dicatat", "success");
    } catch (e) {
      console.warn("Firestore error ending tracking, fallback to localStorage:", e);
      deleteLogLocal(activeLog.id);
      saveLogLocal(updatedLog);
      setResult(res);
      setUsingLocalFallback(true);
      showToast("Gagal mengubah data awan, disimpan di lokal browser.", "info");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLog = async () => {
    if (!user || !result || !startDate || !endDate) return;
    const logData = {
      type: 'haid' as const,
      startDate,
      endDate,
      duration: result.duration,
      status: result.status,
      category: result.category
    };

    if (usingLocalFallback) {
      saveLogLocal(logData);
      showToast("Tersimpan di catatan secara Lokal!", "success");
      return;
    }

    setSaving(true);
    try {
      await saveMenstrualLog(user.uid, logData);
      showToast("Tersimpan di catatan", "success");
    } catch (error) {
      console.warn("Firestore error saving log, fallback to localStorage:", error);
      saveLogLocal(logData);
      setUsingLocalFallback(true);
      showToast("Disimpan di lokal browser.", "info");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLog = async (id: string | undefined) => {
    if (!user || !id) return;
    setConfirmModal({
      isOpen: true,
      title: "Hapus Catatan",
      message: "Apakah Anda yakin ingin menghapus catatan ini?",
      onConfirm: async () => {
        if (usingLocalFallback || id.startsWith('local_')) {
          deleteLogLocal(id);
          showToast("Catatan dihapus secara Lokal", "success");
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          return;
        }
        try {
          await deleteMenstrualLog(user.uid, id);
          showToast("Catatan dihapus", "success");
        } catch (error) {
          console.warn("Firestore error deleting log, deleting locally:", error);
          deleteLogLocal(id);
          setUsingLocalFallback(true);
          showToast("Dihapus dari lokal browser.", "info");
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const stats = {
    avg: logs.length > 0 ? (logs.reduce((acc, curr) => acc + curr.duration, 0) / logs.length).toFixed(1) : '0',
    last: logs.find(l => l.status !== 'Sedang Berlangsung') || null
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans text-slate-900 dark:text-slate-100">
      {/* Header - Pink/Red theme with Sejarah layout */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-pink-700 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 pt-5 pb-5 px-4 rounded-b-[2.2rem] shadow-lg sticky top-0 z-50 border-b-4 border-rose-300/40 dark:border-rose-800/60 transition-colors">
        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2.5 bg-white/15 hover:bg-white/25 rounded-2xl text-white active:scale-90 transition-all flex-shrink-0"
              id="back-btn"
            >
              <ArrowLeft size={18}/>
            </button>
            <div className="overflow-hidden">
              <h1 className="text-base md:text-lg font-bold text-white leading-tight truncate font-serif tracking-wide flex items-center gap-2">
                <HeartPulse className="text-rose-200" size={18} /> Hitung Haid
              </h1>
              <p className="text-[9px] uppercase tracking-widest font-bold text-rose-100/90 truncate">
                KALKULATOR FIQIH WANITA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={handleShareFeature}
              className="p-2.5 bg-white/15 hover:bg-white/25 rounded-2xl text-white active:scale-90 transition-all flex-shrink-0"
              title="Bagikan Fitur"
            >
              <Share2 size={18} />
            </button>
            <button 
              onClick={() => navigate('/settings')} 
              className="relative active:scale-90 transition-all flex-shrink-0"
              id="profile-avatar-btn"
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

      <div className="p-4 max-w-lg mx-auto space-y-5">
        <AiFeatureAssistant 
          featureName="Kalkulator Haid" 
          contextData={result} 
          placeholder="Tanyakan status haid, apakah boleh shalat, atau tentang darah istihadhoh..." 
        />
        
        {/* Active Session OR Summary Dashboard */}
        <AnimatePresence mode="wait">
          {activeLog ? (
            <motion.div 
              key="active-log"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-rose-600 to-pink-600 rounded-3xl p-6 shadow-xl shadow-rose-200 dark:shadow-none text-white relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center animate-bounce">
                    <Moon size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Sesi Aktif</span>
                </div>
                <h3 className="text-xl font-black mb-1">Sedang Haid</h3>
                <p className="text-xs font-medium opacity-80 mb-6 font-mono tracking-tighter">
                  Dimulai: {new Date(activeLog.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate('/chat-ai', { state: { query: "Saya sedang haid, apa doa dan amalan yang bisa saya lakukan?" } })}
                    className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-2xl text-[10px] font-black uppercase tracking-tighter backdrop-blur-md transition-all active:scale-95"
                  >
                    Tips Ibadah
                  </button>
                  <button 
                    onClick={handleEndTracking}
                    disabled={saving}
                    className="flex-1 py-3 bg-white text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                  >
                    {saving ? <Clock size={16} className="animate-spin mx-auto" /> : "Selesai Hari Ini"}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : user && (
            <motion.div 
              key="start-tracking"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 dark:from-rose-900 dark:via-rose-800 dark:to-pink-900 rounded-[2rem] p-5 shadow-lg shadow-rose-200/60 dark:shadow-none flex items-center justify-between gap-4 text-white relative overflow-hidden"
            >
              <IslamicPattern className="text-white opacity-[0.12]" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">Mulai Lacak?</h3>
                  <p className="text-[10px] font-bold text-rose-100 uppercase tracking-tighter">Klik jika haid mulai hari ini</p>
                </div>
              </div>
              <button 
                onClick={handleStartTracking}
                disabled={saving}
                className="px-6 py-3.5 bg-white hover:bg-rose-50 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md flex items-center gap-2 shrink-0 relative z-10"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : "Mulai"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Dashboard */}
        {user && logs.length > 0 && !activeLog && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-rose-500">
                <LayoutDashboard size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Rata-rata</span>
              </div>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.avg} <span className="text-sm text-slate-400">Hari</span></p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <History size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest font-sans">Terakhir</span>
              </div>
              <p className="text-lg font-black text-slate-800 dark:text-slate-100 truncate">
                {stats.last ? new Date(stats.last.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
              </p>
            </div>
          </div>
        )}

        {/* Manual Input Section - Banner styled with Rose theme */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 text-white overflow-hidden rounded-[2.2rem] shadow-lg shadow-rose-200/50 dark:shadow-none transition-all relative border border-rose-400/30 dark:border-rose-800/40">
          <IslamicPattern className="text-white opacity-[0.12]" />
          
          <button 
             onClick={() => setShowManual(!showManual)}
             className="w-full p-5 flex items-center justify-between text-left relative z-10"
           >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl text-white shadow-inner">
                  <Calendar size={20} />
                </div>
                <div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-white leading-none mb-1">Hitung Manual</h3>
                   <p className="text-[10px] font-bold text-rose-100">Pilih tanggal untuk cek status darah</p>
                </div>
              </div>
              <div className={`p-2 rounded-xl transition-transform duration-300 ${showManual ? 'rotate-180 bg-white/30 text-white' : 'bg-white/20 text-white'}`}>
                <ChevronDown size={18} />
              </div>
           </button>
           
           <AnimatePresence>
             {showManual && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }} 
                 animate={{ height: 'auto', opacity: 1 }} 
                 exit={{ height: 0, opacity: 0 }}
                 className="px-6 pb-6 overflow-hidden relative z-10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 pt-5 rounded-b-[2.2rem]"
               >
                 <div className="space-y-4 mb-6">
                    <WizardDatePicker 
                      label="Kapan Haid/Suci Mulai?" 
                      onDateSelect={(d) => setStartDate(d)} 
                    />
                    <WizardDatePicker 
                      label="Kapan Darah Berhenti?" 
                      onDateSelect={(d) => setEndDate(d)} 
                    />
                 </div>

                 <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-6 text-center border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rentang Terpilih</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {startDate ? new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '...'} — {endDate ? new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '...'}
                    </p>
                 </div>

                 <button 
                   onClick={handleManualCalculate}
                   disabled={!startDate || !endDate}
                   className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 dark:shadow-none active:scale-95 disabled:opacity-30 transition-all"
                 >
                   Cek Status Darah
                 </button>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Info Box */}
        <div className="bg-rose-50/50 dark:bg-rose-900/10 p-5 rounded-3xl border border-rose-100/50 dark:border-rose-900/20 flex gap-4 items-start">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600 shrink-0">
            <Info size={18} />
          </div>
          <p className="text-[11px] font-medium text-rose-700 dark:text-rose-300 leading-relaxed">
            Status darah ditentukan berdasarkan <strong>Fiqih Syafi'i</strong> (Minimal 24 jam, Maksimal 15 hari). Pastikan input akurat untuk hasil terbaik.
          </p>
        </div>

        {/* Results Card */}
        <AnimatePresence>
          {result && (
            <motion.div 
              key="result-card"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 pt-2"
            >
              <div className={`p-8 rounded-[2.5rem] border-2 shadow-2xl ${result.category === 'Haid' ? 'bg-white border-rose-100 dark:bg-slate-900 dark:border-rose-900/30' : 'bg-white border-amber-100 dark:bg-slate-900 dark:border-amber-900/30 shadow-amber-100'}`}>
                <div className="flex flex-col items-center text-center mb-8">
                   <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-4 ${result.category === 'Haid' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                      {result.category === 'Haid' ? <CheckCircle2 size={40} /> : <AlertTriangle size={40} />}
                   </div>
                   <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-2 ${result.category === 'Haid' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                     {result.status}
                   </span>
                   <h4 className="text-3xl font-black text-slate-800 dark:text-slate-100">{result.duration} <span className="text-sm font-bold text-slate-400">Hari</span></h4>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl mb-6">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed text-center">
                    {result.description}
                  </p>
                </div>

                {result.healthInsight && (
                  <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-5 rounded-3xl border border-emerald-100/50 dark:border-emerald-900/20 mb-6 text-center">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                       <Sparkles size={12} /> Insight Masa Subur
                    </p>
                    <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 leading-relaxed">
                      {result.healthInsight}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col gap-3">
                  {user && (
                    <button 
                      onClick={handleSaveLog}
                      disabled={saving}
                      className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {saving ? <Clock size={16} className="animate-spin" /> : <Save size={16} />}
                      Simpan Catatan
                    </button>
                  )}
                  <button 
                    onClick={() => navigate('/zakat', { state: { activeTab: 'fidyah' } })}
                    className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
                  >
                    Cek Fidyah Puasa
                  </button>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <BookOpen size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rujukan Fiqih</span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 italic leading-relaxed">
                    "Paling sedikit haid 24 jam, paling lama 15 hari. Suci minimal 15 hari." — Safinatun Najah.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ensiklopedi & Fiqih Wanita */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
           <h3 className="font-black text-slate-800 dark:text-slate-100 text-base flex items-center gap-2 mb-2">
              <BookOpen size={20} className="text-rose-600 animate-pulse" />
              Fiqih & Karakteristik Darah Haid
           </h3>
           <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 font-medium">
              Panduan lengkap fiqih wanita mengenai jenis warna darah haid (berdasarkan kebiasaan dan warna terkuat), karakteristik masa haid, serta landasan dalil syariat dalam madzhab Syafi'i.
           </p>

           {/* Tab Controls */}
           <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
             <button 
               onClick={() => setEduTab('warna')} 
               className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all ${eduTab === 'warna' ? 'bg-white dark:bg-slate-705 shadow-sm text-rose-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
             >
               Warna Darah
             </button>
             <button 
               onClick={() => setEduTab('hukum')} 
               className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all ${eduTab === 'hukum' ? 'bg-white dark:bg-slate-705 shadow-sm text-rose-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
             >
               Sifat & Hukum
             </button>
             <button 
               onClick={() => setEduTab('dalil')} 
               className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all ${eduTab === 'dalil' ? 'bg-white dark:bg-slate-705 shadow-sm text-rose-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'}`}
             >
               Dalil Syar'i
             </button>
           </div>

           {/* Tab Content */}
           <div className="pt-2">
             <AnimatePresence mode="wait">
               {eduTab === 'warna' && (
                 <motion.div
                   key="warna-tab"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.2 }}
                   className="space-y-3"
                 >
                   <div className="flex items-center gap-2 mb-2">
                     <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Kekuatan Warna (Tamayyiz)</span>
                   </div>
                   <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                     Dalam madzhab Syafi'i, warna darah haid diurutkan berdasarkan tingkat kekuatan zatnya untuk membedakan haid dan istihadhoh (bagi wanita <em>Mustahadoh Mumayyizah</em>). Darah terkuat dihukumi haid, sedangkan darah terlemah dihukumi istihadhoh:
                   </p>

                   <div className="space-y-2">
                     {/* 1. Hitam */}
                     <div className="p-3 bg-slate-950 text-white rounded-2xl border border-slate-800 flex gap-3 items-start">
                       <span className="w-5 h-5 bg-red-650 rounded-full shrink-0 border-2 border-white animate-pulse" />
                       <div>
                         <h5 className="text-xs font-black mb-1 text-rose-450">1. Hitam (Al-Aswad) – Paling Kuat</h5>
                         <p className="text-[10px] text-slate-300 leading-relaxed">
                           Darah haid berwarna sangat gelap/hitam pekat, sifatnya tebal (kental), dan biasanya diiringi aroma tidak sedap yang khas.
                         </p>
                       </div>
                     </div>

                     {/* 2. Merah */}
                     <div className="p-3 bg-red-50 dark:bg-red-950/20 text-slate-900 dark:text-slate-100 rounded-2xl border border-red-100 dark:border-red-950/30 flex gap-3 items-start">
                       <span className="w-5 h-5 bg-red-500 rounded-full shrink-0 border-2 border-white" />
                       <div>
                         <h5 className="text-xs font-black mb-1 text-red-750 dark:text-red-400">2. Merah (Al-Ahmar) – Kuat</h5>
                         <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                           Darah merah segar menyala sebagaimana darah luka pada tubuh, berkekuatan sedang di bawah warna hitam.
                         </p>
                       </div>
                     </div>

                     {/* 3. Semburat Merah (Syiqroh) */}
                     <div className="p-3 bg-orange-50/50 dark:bg-orange-950/10 text-slate-900 dark:text-slate-100 rounded-2xl border border-orange-100/50 dark:border-orange-950/20 flex gap-3 items-start">
                       <span className="w-5 h-5 bg-orange-400 rounded-full shrink-0 border-2 border-white" />
                       <div>
                         <h5 className="text-xs font-black mb-1 text-orange-750 dark:text-orange-400">3. Semburat Merah-Kuning (Syiqroh) – Sedang</h5>
                         <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                           Darah kemerahan yang condong ke arah pirang atau jingga kecokelatan. Berada tepat di tengah-tengah herarki warna darah.
                         </p>
                       </div>
                     </div>

                     {/* 4. Kuning */}
                     <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 text-slate-900 dark:text-slate-100 rounded-2xl border border-amber-100/50 dark:border-amber-950/20 flex gap-3 items-start">
                       <span className="w-5 h-5 bg-yellow-400 rounded-full shrink-0 border-2 border-white" />
                       <div>
                         <h5 className="text-xs font-black mb-1 text-amber-750 dark:text-amber-400">4. Kuning (Al-Asfar) – Lemah</h5>
                         <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                           Zat cair berwarna kekuningan seperti getah atau nanah tipis yang keluar dari kemaluan wanita pada masa haid.
                         </p>
                       </div>
                     </div>

                     {/* 5. Keruh */}
                     <div className="p-3 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-3 items-start">
                       <span className="w-5 h-5 bg-slate-450 dark:bg-slate-500 rounded-full shrink-0 border-2 border-white" />
                       <div>
                         <h5 className="text-xs font-black mb-1 text-slate-700 dark:text-slate-300">5. Keruh (Al-Akdar) – Paling Lemah</h5>
                         <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                           Cairan berwarna sepucat air cucian daging (keruh, keabu-abuan/kecokelatan kotor) bukan warna putih bersih.
                         </p>
                       </div>
                     </div>
                   </div>

                   <p className="text-[10px] italic text-slate-400 leading-relaxed mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                     💡 <strong>Aturan Kekentalan & Bau:</strong> Jika warnanya sama, darah yang lebih kental (Thakhin) dihukumi lebih kuat dibandingkan darah encer (Raqiq). Begitu pula darah yang baunya menyengat (Karih) dihukumi lebih kuat.
                   </p>
                 </motion.div>
               )}

               {eduTab === 'hukum' && (
                 <motion.div
                   key="hukum-tab"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.2 }}
                   className="space-y-4"
                 >
                   <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Ketentuan Masa Haid & Suci</span>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                     <div className="p-3 bg-rose-50/50 dark:bg-rose-950/10 rounded-2xl border border-rose-100/30">
                       <h6 className="text-[10px] font-black text-rose-800 dark:text-rose-450 uppercase tracking-thin mb-1">Durasi Haid</h6>
                       <ul className="text-[10px] text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                         <li>Minimal: 24 jam</li>
                         <li>Maksimal: 15 hari</li>
                         <li>Ghalib: 6-7 hari</li>
                       </ul>
                     </div>
                     <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/30">
                       <h6 className="text-[10px] font-black text-emerald-800 dark:text-emerald-450 uppercase tracking-thin mb-1">Masa Suci</h6>
                       <ul className="text-[10px] text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                         <li>Minimal: 15 hari</li>
                         <li>Maksimal: Tiada batas</li>
                         <li>Umur Min: 9 tahun H</li>
                       </ul>
                     </div>
                   </div>

                   <div className="p-3.5 bg-indigo-50/55 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100/35">
                     <h5 className="text-xs font-black text-indigo-900 dark:text-indigo-400 mb-1.5 flex items-center gap-1">
                       🚫 Larangan Selama Masa Haid
                     </h5>
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
                       Berdasarkan ijmak para ulama, wanita yang sedang haid diharamkan melakukan beberapa amalan ibadah tertentu hingga ia suci dan mandi wajib:
                     </p>
                     <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] text-slate-700 dark:text-slate-300 font-semibold pl-1">
                       <div>• Shalat (Fardhu & Sunnah)</div>
                       <div>• Puasa (Wajib qadha Ramadan)</div>
                       <div>• Thawaf di Ka'bah</div>
                       <div>• Menyetubuhi / Jima'</div>
                       <div>• Menyentuh/Membawa Al-Quran</div>
                       <div>• Berdiam di dalam Masjid</div>
                     </div>
                   </div>

                   <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl border border-amber-100/50 dark:border-amber-950/20">
                     <h6 className="text-[11px] font-black text-amber-800 dark:text-amber-400 mb-1">Bagaimana Jika Istihadhoh?</h6>
                     <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                       Istihadhoh adalah darah penyakit yang keluar bukan di masa haid atau nifas (misal keluar setelah hari ke-15). Wanita istihadhoh <strong>tetap wajib shalat, puasa, dan suci hukumnya</strong>. Cukup basuh kemaluan, pakai pembalut, lalu berwudhu setiap masuk waktu shalat wajib (setelah azan berkumandang).
                     </p>
                   </div>
                 </motion.div>
               )}

               {eduTab === 'dalil' && (
                 <motion.div
                   key="dalil-tab"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.2 }}
                   className="space-y-3"
                 >
                   <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Dalil Naqli Al-Quran & As-Sunnah</span>
                   </div>

                   {/* Dalil 1 */}
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-850">
                     <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 text-[8px] font-black px-2 py-0.5 rounded-full uppercase mb-2 inline-block">Al-Quran (QS. Al-Baqarah: 222)</span>
                     <p className="font-arabic text-right text-base leading-loose text-slate-800 dark:text-slate-200 mb-2 font-medium" dir="rtl">
                       وَيَسْأَلُونَكَ عَنِ الْمَحِيضِ ۖ قُلْ هُوَ أَذًى فَاعْتَزِلُوا النِّسَاءَ فِي الْمَحِيضِ
                     </p>
                     <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                       "Mereka bertanya kepadamu tentang haidh. Katakanlah: 'Haidh itu adalah suatu kotoran/gangguan'. Oleh sebab itu hendaklah kamu menjauhkan diri dari wanita (tidak bersetubuh) di waktu haidh..."
                     </p>
                   </div>

                   {/* Dalil 2 */}
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-850">
                     <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 text-[8px] font-black px-2 py-0.5 rounded-full uppercase mb-2 inline-block">Hadits Mengenai Warna Darah</span>
                     <p className="font-arabic text-right text-[13px] leading-loose text-slate-700 dark:text-slate-300 mb-2" dir="rtl">
                       إِذَا كَانَ دَمُ الْحَيْضَةِ فَإِنَّهُ دَمٌ أَسْوَدُ يُعْرَفُ فَإِذَا كَانَ ذَلِكَ فَأَمْسِكِي عَنِ الصَّلَاةِ
                     </p>
                     <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                       "Jika darah haid, ia adalah darah hitam yang dikenal. Bila itu yang keluar, tinggalkanlah shalat..." <strong>(HR. Abu Dawud, An-Nasa'i, dishahihkan oleh Ibnu Hibban)</strong>
                     </p>
                   </div>

                   {/* Dalil 3 */}
                   <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-850">
                     <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 text-[8px] font-black px-2 py-0.5 rounded-full uppercase mb-2 inline-block">Hadits Kewajiban Mandi Bersuci</span>
                     <p className="font-arabic text-right text-[13px] leading-loose text-slate-700 dark:text-slate-300 mb-2" dir="rtl">
                       إِذَا أَقْبَلَتِ الْحَيْضَةُ فَدَعِي الصَّLَاةَ، وَإِذَا أَدْبَرَ فَاغْسِلِي عَنْكِ الدَّمَ وَصَلِّي
                     </p>
                     <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                       "Bila haidmu datang tinggalkan shalat. Dan bila haid itu telah berlalu, basuhlah/bersihkanlah darah darimu (mandi besar) lalu shalatlah." <strong>(HR. Bukhari & Muslim)</strong>
                     </p>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>

        {/* Share Feature Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 dark:from-rose-950 dark:to-pink-900 rounded-[2.5rem] p-6 text-white shadow-xl shadow-rose-100 dark:shadow-none relative overflow-hidden">
          <IslamicPattern className="text-white opacity-[0.08]" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
                <Share2 size={24} />
              </div>
              <div>
                <h3 className="font-black text-sm text-white">Bagikan Fitur Ini 🌸</h3>
                <p className="text-[10px] font-bold text-rose-100 uppercase tracking-tight">Bantu muslimah lainnya menghitung masa suci & haid</p>
              </div>
            </div>
            <button 
              onClick={handleShareFeature}
              className="w-full sm:w-auto px-5 py-3.5 bg-white text-rose-600 hover:bg-rose-50 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 font-bold"
            >
              <Share2 size={14} /> Bagikan
            </button>
          </div>
        </div>

        {/* Collapsible History Section */}
        {user && logs.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="w-full p-6 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                   <History size={18} />
                </div>
                <div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 leading-none mb-1">Riwayat Catatan</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{logs.length} Data Tersimpan</p>
                </div>
              </div>
              <div className={`p-2 rounded-lg transition-transform duration-300 ${showHistory ? 'rotate-180 bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>
                <ChevronDown size={18} />
              </div>
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6"
                >
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {logs.filter(l => l.status !== 'Sedang Berlangsung').map((log) => (
                      <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 relative group animate-in fade-in slide-in-from-right-4">
                        <button 
                          onClick={() => handleDeleteLog(log.id)}
                          className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="flex items-center gap-2 mb-2">
                           <div className={`w-2 h-2 rounded-full ${log.category === 'Haid' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                             {new Date(log.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} — {new Date(log.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                           </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{log.status}</span>
                          <span className="text-[11px] font-black text-rose-600">{log.duration} Hari</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={true}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default MenstrualCalculatorScreen;
