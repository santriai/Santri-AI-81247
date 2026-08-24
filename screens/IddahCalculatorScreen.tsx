import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserAvatar } from '../components/UserAvatar';
import { ArrowLeft, Clock, Info, Calendar, BookOpen, Heart, UserMinus, UserX, CheckCircle, ChevronDown, Share2 } from 'lucide-react';
import AiFeatureAssistant from '../src/components/AiFeatureAssistant';
import { PLAYSTORE_LINK } from '../constants';

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
          <pattern id="islamic-grid-iddah" width="24" height="24" patternUnits="userSpaceOnUse">
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
        <rect width="100" height="100" fill="url(#islamic-grid-iddah)" />
      </svg>
    </div>
  );
};

const IddahCalculatorScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const [reason, setReason] = useState<'divorce' | 'death'>('divorce');
  const [condition, setCondition] = useState<'menstruating' | 'menopause' | 'pregnant'>('menstruating');
  const [startDate, setStartDate] = useState('');
  const [result, setResult] = useState<any>(null);
  const [showGuide, setShowGuide] = useState(true);

  const handleShareFeature = () => {
    const text = `Saya menghitung masa iddah di aplikasi Santri AI. Aplikasi kalkulator fiqih ibadah & iddah terlengkap!\n\nAyo download aplikasinya di Play Store sekarang:\n${PLAYSTORE_LINK}`;
    if (window.AndroidNativeInterface?.shareText) {
      window.AndroidNativeInterface.shareText('Bagikan Kalkulator Iddah', text);
    } else if (navigator.share) {
      navigator.share({
        title: 'Kalkulator Iddah Santri AI',
        text: text
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      showToast("Link berhasil disalin ke clipboard!", "success");
    }
  };

  const calculateIddah = () => {
    if (!startDate) return;

    const start = new Date(startDate);
    let durationDesc = '';
    let endDate = new Date(start);
    let detail = '';

    if (condition === 'pregnant') {
      durationDesc = 'Hingga Melahirkan';
      detail = 'Bagi wanita hamil, masa iddahnya berakhir tepat saat bayi dilahirkan, baik karena ditinggal wafat maupun cerai.';
      setResult({ durationDesc, endDate: null, detail });
      return;
    }

    if (reason === 'death') {
      // 4 months 10 days
      durationDesc = '4 Bulan 10 Hari';
      endDate.setMonth(start.getMonth() + 4);
      endDate.setDate(start.getDate() + 10);
      detail = 'Masa iddah karena suami wafat adalah 4 bulan 10 hari qomariyah. Selama masa ini dilarang berhias (Ihdad) dan menerima khitbah.';
    } else {
      if (condition === 'menstruating') {
        durationDesc = '3 Kali Suci (Quru\')';
        detail = 'Bagi wanita yang masih haid, iddahnya adalah 3 kali masa suci. Perkiraan waktu biasanya sekitar 90 hari.';
        endDate.setDate(start.getDate() + 90);
      } else {
        durationDesc = '3 Bulan';
        endDate.setMonth(start.getMonth() + 3);
        detail = 'Bagi wanita yang sudah menopause (tidak haid lagi) atau belum pernah haid, iddahnya adalah 3 bulan penuh.';
      }
    }

    setResult({ durationDesc, endDate, detail });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans text-left">
      <div className="sticky top-0 z-30 bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md relative overflow-hidden px-4 py-4 flex items-center justify-between gap-3">
        <IslamicPattern className="text-white opacity-[0.15]" />
        <div className="flex items-center gap-3 relative z-10 flex-1">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-all">
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <Clock size={20} className="text-violet-200" />
            Masa Iddah & Panduan Syar'i
          </h2>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button 
            onClick={handleShareFeature}
            className="p-2 text-white bg-white/15 hover:bg-white/25 rounded-full transition-all active:scale-90 flex items-center justify-center"
            title="Bagikan Fitur"
          >
            <Share2 size={18} />
          </button>
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

      <div className="p-4 max-w-lg mx-auto space-y-6">
        {/* Panduan & Dalil Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <button 
            onClick={() => setShowGuide(!showGuide)} 
            className="w-full p-4 flex items-center justify-between bg-violet-50/50 dark:bg-violet-900/10 border-b border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400 font-bold text-sm">
              <BookOpen size={18} />
              <span>Panduan & Dalil Masa Iddah</span>
            </div>
            <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${showGuide ? 'rotate-180' : ''}`} />
          </button>
          
          {showGuide && (
            <div className="p-4 space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-950">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Definisi Masa Iddah</h4>
                <p>Iddah berasal dari kata 'Al-Adad' (hitungan). Secara syariat adalah masa menanti bagi seorang wanita yang baru berpisah dari suaminya—baik karena dicerai atau ditinggal meninggal dunia—sebelum ia diperbolehkan menikah dengan laki-laki lain.</p>
              </div>
              
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">Dalil Al-Qur'an:</p>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">1. Bagi Wanita yang Ditalak (Cerai Hidup) & Masih Haid:</p>
                  <p className="italic">"Wanita-wanita yang ditalak handaklah menahan diri (menunggu) tiga kali quru' (suci / haid)."</p>
                  <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400">(QS. Al-Baqarah: 228)</p>
                </div>
                <div className="space-y-1 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">2. Bagi Wanita yang Ditinggal Wafat Suami:</p>
                  <p className="italic">"Orang-orang yang meninggal dunia di antaramu dengan meninggalkan isteri-isteri (hendaklah para isteri itu) menangguhkan dirinya (ber'iddah) empat bulan sepuluh hari."</p>
                  <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400">(QS. Al-Baqarah: 234)</p>
                </div>
                <div className="space-y-1 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">3. Bagi Wanita Hamil (Cerai Hidup maupun Mati):</p>
                  <p className="italic">"Dan perempuan-perempuan yang hamil, waktu iddah mereka itu ialah sampai mereka melahirkan kandungannya."</p>
                  <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400">(QS. At-Talaq: 4)</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Larangan Selama Masa Iddah</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Dilarang menerima lamaran (khitbah) secara terang-terangan maupun menikah.</li>
                  <li>Bagi iddah wafat (ditinggal suami meninggal), wajib melakukan <strong>Ihdad</strong> (berkabung, tidak memakai wewangian, pakaian mencolok, atau perhiasan berlebih).</li>
                  <li>Tetap tinggal di rumah kediaman bersama selama masa iddah raj'i.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="bg-violet-50 dark:bg-violet-900/10 p-4 rounded-xl border border-violet-100 dark:border-violet-900/30 flex gap-3 items-start">
          <Info size={20} className="text-violet-600 shrink-0 mt-0.5" />
          <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">
            Iddah adalah masa tunggu bagi wanita untuk boleh menikah kembali setelah berpisah dari suaminya. Gunakan kalkulator di bawah ini untuk memperkirakan akhir masa iddah berdasarkan sebab perpisahan dan kondisi fisik.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Sebab Berpisah</label>
            <div className="grid grid-cols-2 gap-3">
               <button onClick={() => setReason('divorce')} className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-xs transition-all ${reason === 'divorce' ? 'bg-violet-50 border-violet-500 text-violet-700' : 'bg-slate-50 border-transparent text-slate-400'}`}>
                 <UserMinus size={16} /> Cerai Hidup
               </button>
               <button onClick={() => setReason('death')} className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-xs transition-all ${reason === 'death' ? 'bg-violet-50 border-violet-500 text-violet-700' : 'bg-slate-50 border-transparent text-slate-400'}`}>
                 <UserX size={16} /> Wafat
               </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Kondisi Wanita</label>
            <div className="grid grid-cols-1 gap-2">
               {[
                 { id: 'menstruating', label: 'Masih Haid Aktif' },
                 { id: 'menopause', label: 'Sudah Menopause / Tidak Haid' },
                 { id: 'pregnant', label: 'Sedang Hamil' }
               ].map(item => (
                 <button key={item.id} onClick={() => setCondition(item.id as any)} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${condition === item.id ? 'bg-violet-50 border-violet-500 text-violet-700 font-bold' : 'bg-slate-50 border-transparent text-slate-400'}`}>
                    <span className="text-xs">{item.label}</span>
                    {condition === item.id && <CheckCircle size={16} />}
                 </button>
               ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tanggal Mulai (Cerai/Wafat)</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 transition-all text-sm font-bold"
            />
          </div>

          <button onClick={calculateIddah} disabled={!startDate} className="w-full py-4 bg-violet-600 text-white rounded-xl font-black text-sm shadow-xl active:scale-95 transition-all">Hitung Masa Iddah</button>
        </div>

        {result && (
          <div className="animate-in zoom-in-95 duration-300">
             <div className="p-6 rounded-3xl border-2 bg-violet-50 border-violet-200 text-violet-800 dark:bg-violet-900/20 dark:border-violet-800 dark:text-violet-300">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">Lama Masa Iddah</h3>
                <h2 className="text-2xl font-black mb-4">{result.durationDesc}</h2>
                {result.endDate && (
                   <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl mb-4 border border-violet-100 dark:border-violet-900/50">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Perkiraan Selesai</p>
                      <p className="text-sm font-black">{result.endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                   </div>
                )}
                <p className="text-sm leading-relaxed mb-6">{result.detail}</p>
                
                <div className="pt-4 border-t border-violet-200 dark:border-violet-800">
                   <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-widest">
                      <BookOpen size={14} /> Dasar Fiqih
                   </div>
                   <p className="text-[11px] italic leading-relaxed opacity-90">
                      "Wanita-wanita yang ditalak handaklah menahan diri (menunggu) tiga kali quru'." (QS. Al-Baqarah: 228). 
                      "Dan perempuan-perempuan yang hamil, waktu iddah mereka itu ialah sampai mereka melahirkan kandungannya." (QS. At-Talaq: 4).
                   </p>
                </div>
             </div>
          </div>
        )}

        {/* Share Feature Banner */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 dark:from-purple-950 dark:to-violet-900 rounded-[2.5rem] p-6 text-white shadow-xl shadow-purple-100 dark:shadow-none relative overflow-hidden">
          <IslamicPattern className="text-white opacity-[0.08]" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
                <Share2 size={24} />
              </div>
              <div>
                <h3 className="font-black text-sm text-white">Bagikan Fitur Ini 🌸</h3>
                <p className="text-[10px] font-bold text-violet-100 uppercase tracking-tight">Bantu muslimah lainnya memahami panduan & perhitungan masa Iddah</p>
              </div>
            </div>
            <button 
              onClick={handleShareFeature}
              className="w-full sm:w-auto px-5 py-3.5 bg-white text-violet-600 hover:bg-violet-50 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 font-bold"
            >
              <Share2 size={14} /> Bagikan
            </button>
          </div>
        </div>
      </div>
      <AiFeatureAssistant 
        featureName="Kalkulator Masa Iddah" 
        contextData={result} 
        placeholder="Tanyakan tentang aturan masa iddah, larangan berkabung (ihdad), hak nafkah, atau rujuk..." 
      />
    </div>
  );
};

export default IddahCalculatorScreen;