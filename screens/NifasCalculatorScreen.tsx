import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Baby,
  Info,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Clock,
  Calendar,
  HeartPulse,
  Sparkles,
  Brain,
  Loader2,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PLAYSTORE_LINK } from "../constants";
import { askReligiousQuery } from "../services/geminiService";
import WizardDatePicker from "../src/components/WizardDatePicker";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { UserAvatar } from "../components/UserAvatar";
import ConfirmationModal from '../components/ConfirmationModal';
import {
  saveMenstrualLog,
  subscribeToMenstrualLogs,
  deleteMenstrualLog,
  MenstrualLog,
  isFirebaseReady,
} from "../services/firebase";
import AiFeatureAssistant from "../src/components/AiFeatureAssistant";

const IslamicPattern: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}
    >
      <svg
        className="w-full h-full fill-current"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="islamic-grid-nifas"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            {/* Rub el Hizb (eight-pointed star) inside each cell */}
            <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" />
            <path
              d="M12 5 L19 12 L12 19 L5 12 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            {/* Accent center circle */}
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            {/* Connecting lines for cross-grid */}
            <line
              x1="0"
              y1="12"
              x2="24"
              y2="12"
              stroke="currentColor"
              strokeWidth="0.25"
              strokeDasharray="1 1"
            />
            <line
              x1="12"
              y1="0"
              x2="12"
              y2="24"
              stroke="currentColor"
              strokeWidth="0.25"
              strokeDasharray="1 1"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#islamic-grid-nifas)" />
      </svg>
    </div>
  );
};

const NifasCalculatorScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const [deliveryDate, setDeliveryDate] = useState("");
  const [stopDate, setStopDate] = useState("");
  const [result, setResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
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
  const [eduTab, setEduTab] = useState<"ketentuan" | "larangan" | "dalil">(
    "ketentuan",
  );

  const handleShareFeature = () => {
    const text = `Saya menghitung masa nifas melahirkan di aplikasi Santri AI. Aplikasi kalkulator fiqih ibadah & nifas terlengkap!\n\nAyo download aplikasinya di Play Store sekarang:\n${PLAYSTORE_LINK}`;
    if (window.AndroidNativeInterface?.shareText) {
      window.AndroidNativeInterface.shareText('Bagikan Kalkulator Nifas', text);
    } else if (navigator.share) {
      navigator.share({
        title: 'Kalkulator Nifas Santri AI',
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
          const stored = localStorage.getItem(`santri_logs_nifas_${user.uid}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            setLogs(parsed);
            const active = parsed.find(
              (l: any) => l.status === "Sedang Berlangsung",
            );
            setActiveLog(active || null);
          }
        } catch (err) {
          console.error("Local storage read error (Nifas):", err);
        }
      };

      const unsubscribe = subscribeToMenstrualLogs(
        user.uid,
        (data) => {
          const nifasLogs = data.filter((l) => l.type === "nifas");
          setLogs(nifasLogs);
          const active = nifasLogs.find(
            (l) => l.status === "Sedang Berlangsung",
          );
          setActiveLog(active || null);
          setUsingLocalFallback(false);
        },
        (err) => {
          console.warn(
            "Falling back to client LocalStorage for nifas logs due to Firestore permission constraints.",
          );
          setUsingLocalFallback(true);
          loadLocalStorageFallback();
        },
      );
      return () => unsubscribe();
    }
  }, [user]);

  const saveLogLocal = (newLog: any) => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(`santri_logs_nifas_${user.uid}`);
      let currentLogs = stored ? JSON.parse(stored) : [];
      const entry = {
        id: newLog.id || `local_${Date.now()}`,
        ...newLog,
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
      };
      currentLogs = [
        entry,
        ...currentLogs.filter((l: any) => l.id !== entry.id),
      ];
      localStorage.setItem(
        `santri_logs_nifas_${user.uid}`,
        JSON.stringify(currentLogs),
      );
      setLogs(currentLogs.filter((l: any) => l.type === "nifas"));
      const active = currentLogs.find(
        (l: any) => l.type === "nifas" && l.status === "Sedang Berlangsung",
      );
      setActiveLog(active || null);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteLogLocal = (logId: string) => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(`santri_logs_nifas_${user.uid}`);
      let currentLogs = stored ? JSON.parse(stored) : [];
      currentLogs = currentLogs.filter((l: any) => l.id !== logId);
      localStorage.setItem(
        `santri_logs_nifas_${user.uid}`,
        JSON.stringify(currentLogs),
      );
      setLogs(currentLogs.filter((l: any) => l.type === "nifas"));
      const active = currentLogs.find(
        (l: any) => l.type === "nifas" && l.status === "Sedang Berlangsung",
      );
      setActiveLog(active || null);
    } catch (e) {
      console.error(e);
    }
  };

  const calculateNifasResult = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null;

    let status = "";
    let category = "";
    let description = "";

    if (diffDays > 60) {
      status = "Darah Penyakit (Istihadhoh)";
      category = "Istihadhoh";
      description =
        "Batas maksimal nifas dalam Fiqih Syafi'i adalah 60 hari. Karena darah keluar lebih dari 60 hari, maka darah setelah hari ke-60 bukan nifas melainkan Istihadhoh. Anda wajib mandi besar di hari ke-61 dan mulai shalat.";
    } else if (diffDays <= 0) {
      status = "Data Tidak Valid";
      category = "Error";
      description = "Tanggal berhenti darah harus setelah tanggal melahirkan.";
    } else {
      status = "Nifas Sah";
      category = "Nifas";
      description = `Darah nifas Anda berlangsung selama ${diffDays} hari. Durasi ini sah sebagai nifas karena masih dalam rentang maksimal 60 hari (Umumnya wanita nifas 40 hari).`;
    }

    return { status, category, description, duration: diffDays };
  };

  const handleManualCalculate = () => {
    if (!deliveryDate || !stopDate) return;
    const res = calculateNifasResult(deliveryDate, stopDate);
    if (res) {
      setResult(res);
      setAiResponse("");
      setShowManual(false);
    } else {
      showToast("Tanggal berhenti harus setelah tanggal melahirkan", "error");
    }
  };

  const calculateNifas = handleManualCalculate;

  const handleStartTracking = async () => {
    if (!user) {
      showToast("Silakan login untuk mulai melacak", "info");
      return;
    }
    const logData = {
      type: "nifas" as const,
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      duration: 0,
      status: "Sedang Berlangsung",
      category: "Active",
    };
    if (usingLocalFallback) {
      saveLogLocal(logData);
      showToast("Pelacakan nifas dimulai secara Lokal!", "success");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      await saveMenstrualLog(user.uid, logData);
      showToast("Pelacakan nifas dimulai!", "success");
    } catch (e: any) {
      console.warn(
        "Firestore error starting tracking (Nifas), using LocalFallback:",
        e,
      );
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
    const res = calculateNifasResult(activeLog.startDate, now);
    if (!res) return;

    const updatedLog = {
      type: "nifas" as const,
      startDate: activeLog.startDate,
      endDate: now,
      duration: res.duration,
      status: res.status,
      category: res.category,
    };

    if (usingLocalFallback || activeLog.id.startsWith("local_")) {
      deleteLogLocal(activeLog.id);
      saveLogLocal(updatedLog);
      setResult(res);
      showToast("Nifas selesai dicatat secara Lokal!", "success");
      return;
    }

    setSaving(true);
    try {
      await deleteMenstrualLog(user.uid, activeLog.id);
      await saveMenstrualLog(user.uid, updatedLog);
      setResult(res);
      showToast("Nifas selesai dicatat", "success");
    } catch (e) {
      console.warn(
        "Firestore error ending tracking (Nifas), fallback to localStorage:",
        e,
      );
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
    if (
      !user ||
      !result ||
      !deliveryDate ||
      !stopDate ||
      result.category === "Error"
    )
      return;
    const logData = {
      type: "nifas" as const,
      startDate: deliveryDate,
      endDate: stopDate,
      duration: result.duration,
      status: result.status,
      category: result.category,
    };

    if (usingLocalFallback) {
      saveLogLocal(logData);
      showToast("Catatan nifas berhasil disimpan secara Lokal!", "success");
      return;
    }

    setSaving(true);
    try {
      await saveMenstrualLog(user.uid, logData);
      showToast("Catatan nifas berhasil disimpan", "success");
    } catch (error) {
      console.warn(
        "Firestore error saving log (Nifas), fallback to localStorage:",
        error,
      );
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
        if (usingLocalFallback || id.startsWith("local_")) {
          deleteLogLocal(id);
          showToast("Catatan dihapus secara Lokal", "success");
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          return;
        }
        try {
          await deleteMenstrualLog(user.uid, id);
          showToast("Catatan dihapus", "success");
        } catch (error) {
          console.warn(
            "Firestore error deleting log (Nifas), deleting locally:",
            error,
          );
          deleteLogLocal(id);
          setUsingLocalFallback(true);
          showToast("Dihapus dari lokal browser.", "info");
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleAiConsult = async () => {
    if (!result) return;
    if (!user) {
      showToast("Tanya Asisten AI memerlukan login.", "info");
      navigate("/settings");
      return;
    }
    setAiLoading(true);
    try {
      const prompt = `Saya melahirkan pada ${deliveryDate} dan darah berhenti pada ${stopDate}. Durasi ${result.duration} hari. Status: ${result.status}. Berikan penjelasan mendalam perspektif Fiqih Syafi'i mengenai hukum ibadah (shalat, puasa), kewajiban mandi besar, dan tips kesehatan. Jawab dengan gaya santri yang ramah.`;
      const response = await askReligiousQuery("Nifas & Kesehatan Ibu", prompt);
      setAiResponse(response);
    } catch (error) {
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans text-left">
      {/* Header - Pink/Rose theme with Sejarah layout */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-pink-700 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 pt-5 pb-5 px-4 rounded-b-[2.2rem] shadow-lg sticky top-0 z-50 border-b-4 border-rose-300/40 dark:border-rose-800/60 transition-colors">
        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white/15 hover:bg-white/25 rounded-2xl text-white active:scale-90 transition-all flex-shrink-0"
              id="back-btn"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="overflow-hidden">
              <h1 className="text-base md:text-lg font-bold text-white leading-tight truncate font-serif tracking-wide flex items-center gap-2">
                <Baby className="text-pink-200" size={18} /> Hitung Nifas
              </h1>
              <p className="text-[9px] uppercase tracking-widest font-bold text-pink-100/90 truncate">
                KALKULATOR FIQIH NIFAS
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

      <div className="p-4 max-w-lg mx-auto space-y-6">
        {/* Active Tracking Status */}
        {user && (
          <>
            {activeLog ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm text-center">
                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <Baby size={32} className="text-pink-600" />
                </div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-1">
                  Masa Nifas Berlangsung
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">
                  Melahirkan pada:{" "}
                  {new Date(activeLog.startDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      navigate("/chat-ai", {
                        state: {
                          query:
                            "Saya sedang dalam masa nifas, apa saja doa dan amalan yang disunnahkan?",
                        },
                      })
                    }
                    className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-bold text-slate-600 border border-slate-100 dark:border-slate-700"
                  >
                    Amalan Nifas
                  </button>
                  <button
                    onClick={handleEndTracking}
                    disabled={saving}
                    className="flex-1 py-3 bg-pink-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-pink-100 dark:shadow-none active:scale-95 transition-all"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin mx-auto" />
                    ) : (
                      "Saya Sudah Selesai"
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 dark:from-rose-900 dark:via-pink-900 dark:to-rose-950 rounded-[2rem] p-5 shadow-lg shadow-rose-200/60 dark:shadow-none flex items-center justify-between gap-4 text-white relative overflow-hidden">
                <IslamicPattern className="text-white opacity-[0.12]" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">
                    <Baby size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">Baru Melahirkan?</h3>
                    <p className="text-[10px] font-bold text-rose-100 uppercase tracking-tighter">Mulai lacak masa nifas Anda hari ini</p>
                  </div>
                </div>
                <button
                  onClick={handleStartTracking}
                  disabled={saving}
                  className="px-6 py-3.5 bg-white hover:bg-rose-50 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md flex items-center gap-2 shrink-0 relative z-10"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Mulai"
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Manual Input Section - Styled with Rose/Pink theme banner */}
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
                <h3 className="text-xs font-black uppercase tracking-widest text-white leading-none mb-1">
                  Hitung Manual
                </h3>
                <p className="text-[10px] font-bold text-rose-100">
                  Pilih tanggal untuk cek status nifas
                </p>
              </div>
            </div>
            <div
              className={`p-2 rounded-xl transition-transform duration-300 ${showManual ? "rotate-180 bg-white/30 text-white" : "bg-white/20 text-white"}`}
            >
              <ChevronDown size={18} />
            </div>
          </button>

          <AnimatePresence>
            {showManual && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6 overflow-hidden relative z-10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 pt-5 rounded-b-[2.2rem]"
              >
                <div className="space-y-4 mb-6">
                  <WizardDatePicker
                    label="Tanggal Melahirkan?"
                    onDateSelect={(d) => setDeliveryDate(d)}
                  />
                  <WizardDatePicker
                    label="Darah Berhenti Kapan?"
                    onDateSelect={(d) => setStopDate(d)}
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-6 text-center border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Rentang Terpilih
                  </p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {deliveryDate
                      ? new Date(deliveryDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Pilih tgl lahir"}{" "}
                    -{" "}
                    {stopDate
                      ? new Date(stopDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Pilih tgl suci"}
                  </p>
                </div>

                <button
                  onClick={handleManualCalculate}
                  disabled={!deliveryDate || !stopDate}
                  className="w-full py-3.5 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-md active:scale-95 transition-all mb-6 disabled:opacity-50"
                >
                  Cek Status Nifas
                </button>

                {/* Calculation Result Area */}
                {result && result.category && (
                  <div className="space-y-4 mb-6">
                    <div
                      className={`p-5 rounded-2xl text-center border ${
                        result.category === "Nifas"
                          ? "bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800/40 text-pink-900 dark:text-pink-100"
                          : result.category === "Istihadhoh" || result.category === "Istihadhah"
                            ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-100"
                            : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-100"
                      }`}
                    >
                      <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 bg-white/60 dark:bg-black/20">
                        Status Fiqih: {result.category}
                      </div>
                      <h4 className="text-xl font-black mb-1">
                        {result.duration} Hari Total
                      </h4>
                      <p className="text-xs leading-relaxed opacity-90">
                        {result.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {user && result.category !== "Error" && (
                        <button
                          onClick={handleSaveLog}
                          disabled={saving}
                          className="flex items-center justify-center gap-2 py-3 bg-pink-600 text-white rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-md active:scale-95 transition-all"
                        >
                          {saving ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Save size={14} />
                          )}
                          Simpan Catatan
                        </button>
                      )}
                      <button
                        onClick={handleAiConsult}
                        disabled={aiLoading}
                        className={`flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-sm hover:shadow-md active:scale-95 transition-all text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-900/30 ${!user || result.category === "Error" ? "col-span-2" : ""}`}
                      >
                        {aiLoading ? (
                          <Loader2 size={14} className="animate-spin text-pink-500" />
                        ) : (
                          <Brain size={14} className="text-pink-500" />
                        )}
                        Tanya AI Santri
                      </button>
                    </div>
                  </div>
                )}

                {aiResponse && (
                  <div className="mb-6 p-4 bg-white/50 dark:bg-slate-950/30 rounded-xl border border-pink-200 dark:border-pink-900/30 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-pink-600 dark:text-pink-400 uppercase tracking-widest">
                      <Brain size={10} /> Penjelasan AI Santri
                    </div>
                    <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line prose prose-sm max-w-none">
                      {aiResponse}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-current border-opacity-10">
                  <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-widest">
                    <BookOpen size={14} /> Dasar Hukum
                  </div>
                  <p className="text-[11px] italic leading-relaxed opacity-90">
                    "Paling sedikit nifas adalah lahzah (sekejap), paling lamanya
                    adalah 60 hari, dan umumnya adalah 40 hari."
                    <br />
                    <strong>(Kitab Matan Ghoyah wat Taqrib)</strong>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History Section if logged in */}
        {user && logs.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                Riwayat Nifas
              </h3>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs font-bold text-pink-600 flex items-center gap-1"
              >
                {showHistory ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
                {showHistory ? "Tutup" : "Lihat Semua"}
              </button>
            </div>

            {showHistory ? (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 text-left">
                {logs
                  .filter((l) => l.status !== "Sedang Berlangsung")
                  .map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 relative group"
                    >
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">
                        Lahir:{" "}
                        {new Date(log.startDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.category === "Nifas" ? "bg-pink-100 text-pink-600" : "bg-amber-100 text-amber-600"}`}
                        >
                          {log.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {log.duration} Hari
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 bg-pink-50 dark:bg-pink-900/10 rounded-xl border border-pink-100 dark:border-pink-900/30">
                  <div className="text-[10px] font-bold text-pink-700 dark:text-pink-400 uppercase mb-1">
                    Terakhir
                  </div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-100">
                    {logs.find((l) => l.status !== "Sedang Berlangsung")
                      ? new Date(
                          logs.find((l) => l.status !== "Sedang Berlangsung")!
                            .startDate,
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })
                      : "-"}
                  </div>
                </div>
                <div className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Durasi
                  </div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-100 text-center">
                    {logs.find((l) => l.status !== "Sedang Berlangsung")
                      ? logs.find((l) => l.status !== "Sedang Berlangsung")!
                          .duration
                      : "0"}{" "}
                    Hari
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-pink-50 dark:bg-pink-900/10 p-4 rounded-xl border border-pink-100 dark:border-pink-900/30 flex gap-3 items-start">
          <Info size={20} className="text-pink-600 shrink-0 mt-0.5" />
          <p className="text-xs text-pink-700 dark:text-pink-300 leading-relaxed text-left">
            Nifas adalah darah yang keluar setelah rahim kosong (melahirkan).
            Minimal: sekejap. Umumnya: 40 hari. Maksimal: 60 hari.
          </p>
        </div>

            {/* Fidyah Referral Card */}
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-[2rem] shadow-xl text-white relative overflow-hidden group mb-8">
              <HeartPulse
                className="absolute -right-4 -bottom-4 opacity-15 rotate-12 transition-transform group-hover:rotate-0"
                size={120}
              />
              <div className="relative z-10 text-left">
                <h4 className="text-sm font-black uppercase tracking-widest mb-2">
                  Tebus Utang Puasa
                </h4>
                <p className="text-[10px] font-medium opacity-90 leading-relaxed mb-6">
                  Jika Anda meninggalkan puasa karena nifas, Anda wajib
                  meng-qada' (mengganti). Bagi ibu menyusui/hamil yang tidak
                  mampu qada' karena khawatir kesehatan diri/bayi, maka wajib
                  membayar <strong>Fidyah</strong>.
                </p>
                <button
                  onClick={() =>
                    navigate("/zakat", { state: { activeTab: "fidyah" } })
                  }
                  className="flex items-center gap-2 px-6 py-3 bg-white text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:shadow-rose-700/20 active:scale-95 transition-all text-left"
                >
                  Kalkulator Fidyah <Clock size={14} />
                </button>
              </div>
            </div>

        {/* Ensiklopedi & Fiqih Nifas */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-black text-slate-800 dark:text-slate-100 text-base flex items-center gap-2 mb-2">
            <BookOpen size={20} className="text-pink-600 animate-pulse" />
            Fiqih & Karakteristik Darah Nifas
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 font-medium">
            Konsultasi fiqih lengkap bagi ibu pasca melahirkan mengenai durasi
            nifas, ciri warna darah terkuat, amalan yang dilarang, serta dalil
            pendukung dalam Madzhab Syafi'i.
          </p>

          {/* Tab Controls */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
            <button
              onClick={() => setEduTab("ketentuan")}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all ${eduTab === "ketentuan" ? "bg-white dark:bg-slate-700 shadow-sm text-pink-600 font-extrabold" : "text-slate-400 hover:text-slate-600"}`}
            >
              Ketentuan & Warna
            </button>
            <button
              onClick={() => setEduTab("larangan")}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all ${eduTab === "larangan" ? "bg-white dark:bg-slate-700 shadow-sm text-pink-600 font-extrabold" : "text-slate-400 hover:text-slate-600"}`}
            >
              Larangan Ibadah
            </button>
            <button
              onClick={() => setEduTab("dalil")}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all ${eduTab === "dalil" ? "bg-white dark:bg-slate-700 shadow-sm text-pink-600 font-extrabold" : "text-slate-400 hover:text-slate-600"}`}
            >
              Dalil Syar'i
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            <AnimatePresence mode="wait">
              {eduTab === "ketentuan" && (
                <motion.div
                  key="ketentuan-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">
                      Karakteristik & Siklus Nifas
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                    Berdasarkan kitab-kitab induk Madzhab Syafi'i, karakteristik
                    darah nifas yang keluar memiliki ketentuan syariat sebagai
                    berikut:
                  </p>

                  <div className="space-y-2">
                    <div className="p-3 bg-pink-50/45 dark:bg-pink-950/10 rounded-2xl border border-pink-100/35">
                      <h5 className="text-xs font-black mb-1 text-pink-850 dark:text-pink-400">
                        ⏱️ Batas Waktu Melahirkan
                      </h5>
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        <strong>Minimal:</strong> Lahzhah (sekejap/sedikit
                        aliran darah).
                        <br />
                        <strong>Umumnya:</strong> 40 hari (berdasarkan kebiasaan
                        wanita).
                        <br />
                        <strong>Maksimal:</strong> 60 hari. Jika darah masih
                        keluar di hari ke-61, maka kelebihannya divonis sebagai{" "}
                        <strong>Istihadhoh</strong> (darah penyakit).
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-3 items-start">
                      <span className="w-5 h-5 bg-slate-950 rounded-full shrink-0 border-2 border-white animate-pulse" />
                      <div>
                        <h5 className="text-xs font-black mb-1 text-slate-800 dark:text-slate-200">
                          🩸 Tingkat Kekuatan Darah (Warna)
                        </h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                          Sifat warna darah nifas sama seperti haid, diurutkan
                          dari yang terkuat hingga yang terlemah untuk
                          memisahkan nifas dari istihadhoh:
                        </p>
                        <ul className="text-[9px] text-slate-600 dark:text-slate-300 space-y-1 list-decimal list-inside mt-1 font-semibold">
                          <li>
                            <span className="text-pink-600 dark:text-pink-400 font-bold">
                              Hitam (Al-Aswad)
                            </span>{" "}
                            — Paling kuat, pekat, kental, dan panas.
                          </li>
                          <li>
                            <span className="text-red-500 font-bold">
                              Merah (Al-Ahmar)
                            </span>{" "}
                            — Lebih lemah dari hitam, seperti warna darah luka.
                          </li>
                          <li>
                            <span className="text-orange-500 font-bold">
                              Syiqroh
                            </span>{" "}
                            — Jingga kemerahan atau pirang kecokelatan.
                          </li>
                          <li>
                            <span className="text-yellow-600 font-bold">
                              Kuning (Al-Asfar)
                            </span>{" "}
                            — Berwarna kekuningan tipis.
                          </li>
                          <li>
                            <span className="text-slate-500 font-bold">
                              Keruh (Al-Akdar)
                            </span>{" "}
                            — Warna abu-abu keruh/kotor (terlemah).
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl border border-amber-100/50">
                      <h5 className="text-xs font-black mb-1 text-amber-850 dark:text-amber-400">
                        ⚠️ Masa Terputus (Fatratun Naqa')
                      </h5>
                      <p className="text-[10px] text-slate-650 dark:text-slate-300 leading-relaxed font-semibold">
                        Apabila darah nifas sempat berhenti sebelum mencapai
                        hari ke-60, lalu keluar kembali: jika jarak berhenti
                        tersebut kurang dari 15 hari, maka seluruhnya (baik saat
                        darah mengalir maupun saat suci di tengah-tengahnya)
                        tetap terhitung sebagai masa nifas.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {eduTab === "larangan" && (
                <motion.div
                  key="larangan-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">
                      Larangan Ibadah & Hak Suami Istri
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Sama halnya dengan orang yang berhadats besar haid, ibu
                    dalam masa postpartum nifas diharamkan melakukan hal-hal
                    berikut secara syariat:
                  </p>

                  <div className="p-4 bg-rose-50/50 dark:bg-rose-950/10 rounded-2xl border border-rose-100/35">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-rose-900 dark:text-rose-300 font-semibold pl-1">
                      <div>🚫 Shalat (Fardu/Sunnah)</div>
                      <div>🚫 Puasa (Wajib qada puasa Ramadan)</div>
                      <div>🚫 Thawaf (Mengelilingi Ka'bah)</div>
                      <div>🚫 Jima' (Berhubungan intim suami istri)</div>
                      <div>🚫 Menyentuh/Membawa Mushaf Al-Quran</div>
                      <div>🚫 Membaca Al-Quran dengan niat tilawah</div>
                      <div>🚫 Berdiam diri (I'tikaf) di dalam Masjid</div>
                      <div>🚫 Istimta' (Bermesraan antara pusar & lutut)</div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-indigo-50/55 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100/35 space-y-1.5">
                    <h5 className="text-xs font-black text-indigo-900 dark:text-indigo-400 flex items-center gap-1">
                      ✨ Amalan Alternatif Mulia Masa Nifas
                    </h5>
                    <p className="text-[10px] text-indigo-850 dark:text-slate-350 leading-relaxed">
                      Meski tidak diperbolehkan shalat dan puasa, ibu nifas
                      tetap dapat meraih pahala besar melalui:
                    </p>
                    <ul className="text-[10px] text-slate-650 dark:text-slate-305 space-y-1 list-disc list-inside">
                      <li>
                        Membaca wirid pagi dan sore (tanpa niat membaca
                        Al-Quran).
                      </li>
                      <li>Mendengarkan lantunan ayat suci Al-Quran.</li>
                      <li>
                        Melakukan dzikir, istighfar, shalawat Nabi, dan doa-doa
                        mustajab.
                      </li>
                      <li>
                        Membaca buku fiqih, sirah nabawiyah, dan ilmu
                        bermanfaat.
                      </li>
                      <li>
                        Pahala besar merawat, memberikan ASI, dan mengasuh bayi
                        dengan penuh cinta kasih.
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {eduTab === "dalil" && (
                <motion.div
                  key="dalil-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">
                      Dalil Sifat & Batas Waktu Nifas
                    </span>
                  </div>

                  {/* Dalil 1: Hadits Ummu Salamah */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-850 dark:text-pink-300 text-[8px] font-black px-2 py-0.5 rounded-full uppercase mb-2 inline-block">
                      Hadits Riwayat Sunan Al-Arba'ah
                    </span>
                    <p
                      className="font-arabic text-right text-sm leading-loose text-slate-800 dark:text-slate-200 mb-2 font-medium"
                      dir="rtl"
                    >
                      عَنْ أُمِّ سَلَمَةَ رَضِيَ اللَّهُ عَنْهَا قَالَتْ كَانَتْ
                      النُّفَسَاءُ تَجْلِسُ عَلَى عَهْدِ رَسُولِ اللَّهِ صَلَّى
                      اللَّهُ عَلَيْهِ وَسَلَّمَ أَرْبَعِينَ يَوْمًا
                    </p>
                    <p className="text-[10px] text-slate-605 dark:text-slate-300 leading-relaxed font-semibold">
                      "Dari Ummu Salamah Ra, ia berkata: Para wanita yang nifas
                      pada masa Rasulullah Shallallahu 'Alaihi wa Sallam menahan
                      diri (tidak beribadah) selama empat puluh hari."
                      <br />
                      <strong className="opacity-70">
                        (HR. Abu Dawud, At-Tirmidzi, & Ibnu Majah)
                      </strong>
                    </p>
                  </div>

                  {/* Dalil 2: Atsar Shahabat & Fathul Qorib */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-850 dark:text-pink-300 text-[8px] font-black px-2 py-0.5 rounded-full uppercase mb-2 inline-block">
                      Referensi Fiqih Syafi'iyyah
                    </span>
                    <p
                      className="font-arabic text-right text-sm leading-loose text-slate-800 dark:text-slate-200 mb-2 font-medium"
                      dir="rtl"
                    >
                      وَأَقَلُّ النِّفَاسِ لَحْظَةٌ وَأَكْثَرُهُ سِتُّونَ
                      يَوْمًا وَغَالِبُهُ أَرْبَعُونَ يَوْمًا
                    </p>
                    <p className="text-[10px] text-slate-605 dark:text-slate-300 leading-relaxed font-semibold">
                      “Batas paling sedikit bagi nifas adalah sekejap (lahzhah),
                      paling lamanya adalah 60 hari, sedangkan umumnya adalah 40
                      hari.”
                      <br />
                      <strong className="opacity-70">
                        (Kitab Syarah Fathul Qorib Al-Mujib)
                      </strong>
                    </p>
                  </div>

                  {/* Dalil 3: Ijma' Ulama & Qiyas */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-150 dark:border-slate-800">
                    <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-850 dark:text-pink-300 text-[8px] font-black px-2 py-0.5 rounded-full uppercase mb-2 inline-block">
                      Konsensus (Ijma') Ulama
                    </span>
                    <p className="text-[10px] text-slate-605 dark:text-slate-300 leading-relaxed font-semibold">
                      Para ulama imam madzhab bersepakat (Ijma') bahwa hukum,
                      larangan ibadah, keharaman bersetubuh, serta kewajiban
                      mandi wajib bagi perempuan nifas adalah sama persis dengan
                      aturan perempuan haid. Segala larangan dari dalil Surah
                      Al-Baqarah ayat 222 juga berlaku padanya.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Share Feature Banner - Moved to Bottom */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 dark:from-rose-950 dark:to-pink-900 rounded-[2.2rem] p-6 text-white shadow-xl shadow-rose-100 dark:shadow-none relative overflow-hidden">
          <IslamicPattern className="text-white opacity-[0.08]" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
                <Share2 size={24} />
              </div>
              <div>
                <h3 className="font-black text-sm text-white">Bagikan Fitur Ini 🌸</h3>
                <p className="text-[10px] font-bold text-rose-100 uppercase tracking-tight">Bantu Ibu lainnya menghitung masa nifas melahirkan</p>
              </div>
            </div>
            <button 
              onClick={handleShareFeature}
              className="w-full sm:w-auto px-5 py-3.5 bg-white text-rose-600 hover:bg-rose-50 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 font-bold shrink-0"
            >
              <Share2 size={14} /> Bagikan
            </button>
          </div>
        </div>
      </div>
      <AiFeatureAssistant 
        featureName="Kalkulator Nifas" 
        contextData={result} 
        placeholder="Tanyakan tentang ketentuan masa nifas, batas waktu suci nifas, atau amalan pasca melahirkan..." 
      />

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

export default NifasCalculatorScreen;
