import React, { useState } from 'react';
import { X, Flag, AlertCircle, Check, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createAppContentReport } from '../services/firebase';

interface ContentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  contentSnippet?: string;
  onSuccess?: (msg: string) => void;
}

const REPORT_REASONS = [
  'Kekeliruan Makna / Terjemah',
  'Dalil / Referensi Kurang Tepat',
  'Jawaban Tidak Sesuai Pertanyaan',
  'Bahasa Kurang Pantas / Melanggar Adab',
  'Masalah Teknis / Eror Tampilan',
  'Lainnya'
];

export const ContentReportModal: React.FC<ContentReportModalProps> = ({
  isOpen,
  onClose,
  featureName,
  contentSnippet = '',
  onSuccess,
}) => {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Silakan login terlebih dahulu untuk mengirim laporan.');
      return;
    }

    setLoading(true);
    try {
      await createAppContentReport({
        featureName: featureName || 'Umum',
        contentSnippet: contentSnippet.length > 500 ? contentSnippet.slice(0, 500) + '...' : contentSnippet,
        reason: selectedReason,
        details: details.trim(),
        reportedById: user.uid,
        reportedByName: user.displayName || 'Santri AI',
        reportedByEmail: user.email || '',
      });

      setSubmitted(true);
      if (onSuccess) {
        onSuccess('Laporan Anda telah berhasil diteruskan ke Admin. Jazakallahu khairan atas masukan dan koreksinya!');
      }

      setTimeout(() => {
        setSubmitted(false);
        setDetails('');
        setSelectedReason(REPORT_REASONS[0]);
        onClose();
      }, 1600);
    } catch (err) {
      console.error('Gagal mengirim laporan:', err);
      alert('Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 pb-20 sm:pb-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flag size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Laporkan Konten</h3>
              <p className="text-[10px] text-slate-400 font-medium">Fitur: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{featureName}</span></p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <Check size={28} />
            </div>
            <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-100">Laporan Terkirim!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              Laporan Anda telah diteruskan ke Admin untuk ditinjau. Terima kasih atas kepedulian & koreksinya.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Snippet Preview if present */}
            {contentSnippet && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Kutipan Teks / Konten:</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3 leading-relaxed">
                  "{contentSnippet}"
                </p>
              </div>
            )}

            {/* Reason Selection */}
            <div>
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Pilih Alasan Laporan
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedReason(r)}
                    className={`w-full text-left p-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      selectedReason === r
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <span>{r}</span>
                    {selectedReason === r && <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Note */}
            <div>
              <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Keterangan Tambahan / Koreksi (Opsional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={2}
                placeholder="Tuliskan catatan atau rujukan yang benar agar admin dapat segera memperbaikinya..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs border border-slate-200 dark:border-slate-700 outline-none focus:border-rose-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none leading-relaxed"
              />
            </div>

            {/* Notice */}
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-[10px]">
              <ShieldAlert size={14} className="shrink-0 text-amber-500" />
              <span>Admin akan menerima notifikasi laporan ini dan menindaklanjuti sesegera mungkin.</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200/50 dark:shadow-none flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Flag size={14} />}
                Kirim Laporan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContentReportModal;
