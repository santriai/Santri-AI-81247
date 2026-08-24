import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Brain, Loader2, Info, BookOpen, ChevronDown, Share2 } from 'lucide-react';
import { askReligiousQuery } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';
import { useHistory } from '../contexts/HistoryContext'; 
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { v4 as uuidv4 } from 'uuid';
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
          <pattern id="islamic-grid-waris" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" />
            <path d="M12 5 L19 12 L12 19 L5 12 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
            <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#islamic-grid-waris)" />
      </svg>
    </div>
  );
};

const WarisScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const { addToHistory } = useHistory(); // HOOK
  const [totalWealth, setTotalWealth] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showWarisGuide, setShowWarisGuide] = useState(true);

  const handleShareFeature = () => {
    const text = `Saya menghitung pembagian waris secara syar'i di aplikasi Santri AI. Aplikasi kalkulator fiqih ibadah & mawaris/waris terlengkap!\n\nAyo download aplikasinya di Play Store sekarang:\n${PLAYSTORE_LINK}`;
    if (window.AndroidNativeInterface?.shareText) {
      window.AndroidNativeInterface.shareText('Bagikan Kalkulator Waris', text);
    } else if (navigator.share) {
      navigator.share({
        title: 'Kalkulator Waris Santri AI',
        text: text
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      showToast("Link berhasil disalin ke clipboard!", "success");
    }
  };

  // ... (heirs state) ...
  const [heirs, setHeirs] = useState({ husband: false, wife: false, father: false, mother: false, son: 0, daughter: 0, brother: 0, sister: 0 });
  const handleHeirChange = (key: keyof typeof heirs, val: any) => { setHeirs(prev => ({ ...prev, [key]: val })); };

  const handleWealthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) { setTotalWealth(''); return; }
    const formatted = new Intl.NumberFormat('id-ID').format(parseInt(rawValue));
    setTotalWealth(formatted);
  };

  const calculateWaris = async () => {
    if (!totalWealth) {
      showToast("Masukkan total harta warisan", "warning"); 
      return;
    }

    if (!user) {
      showToast("Hitung Waris AI memerlukan login.", "info");
      navigate('/settings');
      return;
    }
    
    setLoading(true);
    setResult('');
    
    // ... construct prompt ...
    const heirList = [];
    if (heirs.husband) heirList.push("Suami");
    if (heirs.wife) heirList.push("Istri");
    if (heirs.father) heirList.push("Ayah");
    if (heirs.mother) heirList.push("Ibu");
    if (heirs.son > 0) heirList.push(`${heirs.son} Anak Laki-laki`);
    if (heirs.daughter > 0) heirList.push(`${heirs.daughter} Anak Perempuan`);
    if (heirs.brother > 0) heirList.push(`${heirs.brother} Saudara Laki-laki`);
    if (heirs.sister > 0) heirList.push(`${heirs.sister} Saudara Perempuan`);

    const prompt = `Bertindaklah sebagai ahli Faraid (Hukum Waris Islam). Hitung pembagian waris secara rinci.
    
    Total Harta: Rp ${totalWealth}
    Ahli Waris: ${heirList.join(', ')}
    
    Berikan hasil dengan format:
    1. Bagian masing-masing (Pecahan & Rupiah)
    2. Sisa harta (jika ada) dan statusnya (Aul/Radd)
    3. Dalil singkat yang mendasari.
    `;

    try {
      const response = await askReligiousQuery('kitab', prompt);
      setResult(response);

      // Fix: Ensure all required properties for HistoryItem are provided
      addToHistory({
        id: uuidv4(), // Generate a unique ID
        type: 'kitab', // This seems like a 'kitab' or 'calculation' type
        title: `Waris: Rp ${totalWealth}`,
        subtitle: `Ahli Waris: ${heirList.join(', ') || 'Tidak ada'}`,
        timestamp: new Date().toISOString(),
        path: '/waris',
        data: {
          totalWealth: totalWealth,
          heirs: heirs,
          result: response
        }
      });
    } catch (e: any) {
      showToast("Gagal menghitung waris: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans text-left">
      <div className="sticky top-0 z-30 bg-gradient-to-r from-rose-600 to-pink-700 text-white shadow-md relative overflow-hidden px-4 py-4 flex items-center justify-between gap-3">
        <IslamicPattern className="text-white opacity-[0.14]" />
        <div className="flex items-center gap-3 relative z-10 flex-1">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/95 hover:text-white rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <Calculator size={20} className="text-pink-200" />
            Kalkulator Waris & Ilmu Faraid
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
        
        {/* Panduan Faraid & Dalil Al-Qur'an Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <button 
            onClick={() => setShowWarisGuide(!showWarisGuide)} 
            className="w-full p-4 flex items-center justify-between bg-pink-50/50 dark:bg-pink-950/20 border-b border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-2 text-pink-700 dark:text-pink-400 font-bold text-sm">
              <BookOpen size={18} />
              <span>Panduan Syar'i & Dalil Hukum Waris (Faraid)</span>
            </div>
            <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${showWarisGuide ? 'rotate-180' : ''}`} />
          </button>
          
          {showWarisGuide && (
            <div className="p-4 space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-950">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Pengantar Ilmu Faraid</h4>
                <p>Ilmu Faraid adalah ilmu yang membahas tentang tata cara pembagian harta warisan peninggalan orang meninggal dunia kepada ahli warisnya yang sah secara matematis dan teologis.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">Dalil Penting Al-Qur'an:</p>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-705 dark:text-slate-305">1. Sifat Wajib Pembagian Waris:</p>
                  <p className="italic">"Bagi laki-laki ada hak bagian dari harta peninggalan ibu-bapak dan kerabatnya, dan bagi wanita ada hak bagian (pula)... ...sebagai ketetapan yang diwajibkan."</p>
                  <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400">(QS. An-Nisa: 7)</p>
                </div>
                <div className="space-y-1 pt-1 border-t border-slate-205/50 dark:border-slate-707/50">
                  <p className="font-semibold text-slate-705 dark:text-slate-305">2. Aturan Bagian Anak & Orang Tua:</p>
                  <p className="italic">"Allah mensyariatkan bagimu tentang (pembagian pusaka untuk) anak-anakmu. Yaitu: bagian seorang anak laki-laki sama dengan bagian dua orang anak perempuan..."</p>
                  <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400">(QS. An-Nisa: 11)</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Rukun Waris & Syaratnya</h4>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li><strong>Muwarrits:</strong> Pewaris yang meninggal dunia secara hakiki atau hukum.</li>
                  <li><strong>Waris:</strong> Ahli waris yang masih hidup ketika pewaris meninggal dunia.</li>
                  <li><strong>Mauruts:</strong> Harta peninggalan setelah dikurangi biaya takziah, hutang, dan wasiat.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <AiFeatureAssistant 
          featureName="Pakar Faraid (Waris)" 
          placeholder="Tanyakan hukum waris, ashabul furud, atau perincian ahli waris..." 
        />
        <div className="bg-pink-50 dark:bg-pink-900/10 p-4 rounded-xl border border-pink-100 dark:border-pink-900/30 flex gap-3 items-start">
          <Info size={20} className="text-pink-600 shrink-0 mt-0.5" />
          <p className="text-xs text-pink-700 dark:text-pink-300 leading-relaxed">
            Kalkulator ini membantu Anda menghitung pembagian harta warisan berdasarkan syariat Islam (Ilmu Faraid).
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Total Harta Warisan (Rp)</label>
            <input
              type="text"
              value={totalWealth}
              onChange={handleWealthChange}
              placeholder="0"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-pink-500 transition-all text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ahli Waris Yang Ada</label>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <input type="checkbox" checked={heirs.husband} onChange={e => handleHeirChange('husband', e.target.checked)} className="form-checkbox h-4 w-4 text-pink-600 rounded" /> Suami
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <input type="checkbox" checked={heirs.wife} onChange={e => handleHeirChange('wife', e.target.checked)} className="form-checkbox h-4 w-4 text-pink-600 rounded" /> Istri
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <input type="checkbox" checked={heirs.father} onChange={e => handleHeirChange('father', e.target.checked)} className="form-checkbox h-4 w-4 text-pink-600 rounded" /> Ayah
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <input type="checkbox" checked={heirs.mother} onChange={e => handleHeirChange('mother', e.target.checked)} className="form-checkbox h-4 w-4 text-pink-600 rounded" /> Ibu
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                Anak Laki-laki:
                <input type="number" min="0" value={heirs.son} onChange={e => handleHeirChange('son', parseInt(e.target.value) || 0)} className="w-16 p-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                Anak Perempuan:
                <input type="number" min="0" value={heirs.daughter} onChange={e => handleHeirChange('daughter', parseInt(e.target.value) || 0)} className="w-16 p-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                Saudara Laki-laki:
                <input type="number" min="0" value={heirs.brother} onChange={e => handleHeirChange('brother', parseInt(e.target.value) || 0)} className="w-16 p-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                Saudari Perempuan:
                <input type="number" min="0" value={heirs.sister} onChange={e => handleHeirChange('sister', parseInt(e.target.value) || 0)} className="w-16 p-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
              </label>
            </div>
          </div>

          <button onClick={calculateWaris} disabled={loading || !totalWealth} className="w-full py-4 bg-pink-600 text-white rounded-xl font-black text-sm shadow-xl shadow-pink-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Brain size={20} />} Hitung Pembagian Waris
          </button>
        </div>

        {result && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-pink-100 dark:border-pink-900/30 shadow-sm animate-in slide-in-from-bottom-4 duration-300">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Brain size={20} className="text-pink-600" /> Hasil Perhitungan AI
            </h3>
            <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {result}
            </div>
          </div>
        )}

        {/* Share Feature Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 dark:from-rose-950 dark:to-pink-900 rounded-[2.5rem] p-6 text-white shadow-xl shadow-pink-100 dark:shadow-none relative overflow-hidden">
          <IslamicPattern className="text-white opacity-[0.08]" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
                <Share2 size={24} />
              </div>
              <div>
                <h3 className="font-black text-sm text-white">Bagikan Fitur Ini 🌸</h3>
                <p className="text-[10px] font-bold text-pink-100 uppercase tracking-tight">Bantu lainnya menghitung waris & pembagian faraid sesuai syariat</p>
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
      </div>
    </div>
  );
};

export default WarisScreen;