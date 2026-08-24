
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Coins, 
  Calculator, 
  Info, 
  Briefcase, 
  Wallet, 
  Users, 
  Store, 
  Sprout, 
  Tractor, 
  Fish, 
  Building2, 
  X,
  CheckCircle,
  XCircle,
  ChevronRight,
  HelpCircle,
  HeartPulse,
  Sparkles,
  Brain,
  Loader2,
  ChevronDown,
  BookOpen,
  Share2
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
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
          <pattern id="islamic-grid-zakat" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" />
            <path d="M12 5 L19 12 L12 19 L5 12 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
            <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#islamic-grid-zakat)" />
      </svg>
    </div>
  );
};

// --- TYPES & MENU CONFIG ---

type ZakatType = 'profesi' | 'maal' | 'perdagangan' | 'pertanian' | 'peternakan' | 'perusahaan' | 'tambak' | 'fitrah' | 'fidyah';

// Custom Icon Components wrapper
function WheatIcon(props: any) {
  return <Sprout {...props} />;
}

interface ZakatMenuItem {
  id: ZakatType;
  title: string;
  icon: any;
  color: string;
  desc: string;
}

const ZAKAT_MENU: ZakatMenuItem[] = [
  { id: 'profesi', title: 'Zakat Profesi', icon: Briefcase, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', desc: 'Gaji, Honor, & Penghasilan' },
  { id: 'maal', title: 'Simpanan & Emas', icon: Wallet, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', desc: 'Tabungan, Emas, Perak' },
  { id: 'perdagangan', title: 'Zakat Perdagangan', icon: Store, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', desc: 'Aset Usaha & Perniagaan' },
  { id: 'pertanian', title: 'Zakat Pertanian', icon: WheatIcon, color: 'text-green-600 bg-green-50 dark:bg-green-900/20', desc: 'Padi, Jagung, & Tanaman Pangan' },
  { id: 'peternakan', title: 'Zakat Peternakan', icon: Tractor, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', desc: 'Sapi, Kambing, Kerbau' },
  { id: 'tambak', title: 'Zakat Tambak', icon: Fish, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20', desc: 'Ikan, Udang, Hasil Laut' },
  { id: 'perusahaan', title: 'Zakat Perusahaan', icon: Building2, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20', desc: 'Saham & Aset Korporasi' },
  { id: 'fitrah', title: 'Zakat Fitrah', icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20', desc: 'Jiwa (Ramadhan)' },
  { id: 'fidyah', title: 'Bayar Fidyah', icon: HeartPulse, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20', desc: 'Ganti Puasa bagi yang Uzur' },
];

// --- ZAKAT RULES DATA ---
const ZAKAT_DETAILS: Record<ZakatType, { nishab: string, kadar: string, haul: string, desc: string }> = {
  profesi: {
    nishab: "85 gram emas (setahun)",
    kadar: "2.5%",
    haul: "Saat menerima (Qiyas Pertanian) / Setahun",
    desc: "Zakat yang dikeluarkan dari penghasilan profesi (gaji, honor, jasa, dll) bila telah mencapai nishab."
  },
  maal: {
    nishab: "85 gram emas murni",
    kadar: "2.5%",
    haul: "1 Tahun (Hijriyah)",
    desc: "Zakat harta simpanan (tabungan, emas, perak, surat berharga) yang telah mengendap satu tahun."
  },
  perdagangan: {
    nishab: "Setara 85 gram emas",
    kadar: "2.5%",
    haul: "1 Tahun",
    desc: "Zakat dari aset perniagaan (modal putar + laba + piutang lancar - hutang jatuh tempo)."
  },
  pertanian: {
    nishab: "5 Wasaq (±653 kg Gabah)",
    kadar: "5% (Biaya) / 10% (Alami)",
    haul: "Setiap Panen",
    desc: "Zakat hasil pertanian tanaman pokok (padi, jagung, gandum, dll) yang dikeluarkan saat panen."
  },
  peternakan: {
    nishab: "40 Ekor (Kambing), 30 (Sapi)",
    kadar: "Sesuai jumlah hewan",
    haul: "1 Tahun",
    desc: "Zakat hewan ternak (Sapi, Kambing, Kerbau) yang digembalakan di padang rumput umum."
  },
  tambak: {
    nishab: "Setara 5 Wasaq / 85gr Emas",
    kadar: "2.5% atau 5-10%",
    haul: "Setiap Panen",
    desc: "Zakat hasil budidaya perikanan. Umumnya diqiyaskan dengan zakat pertanian atau perdagangan."
  },
  perusahaan: {
    nishab: "Setara 85 gram emas",
    kadar: "2.5%",
    haul: "1 Tahun",
    desc: "Zakat atas aset perusahaan (saham/ekuitas) yang dijalankan secara syariah."
  },
  fitrah: {
    nishab: "Kelebihan mak. pokok sehari",
    kadar: "2.5 kg / 3.5 Liter Beras",
    haul: "Bulan Ramadhan",
    desc: "Zakat wajib bagi setiap jiwa muslim (laki-laki/perempuan) yang menemui bulan Ramadhan."
  },
  fidyah: {
    nishab: "Tidak ada (Per hari puasa)",
    kadar: "1 Mud (±675g) Beras",
    haul: "Setiap hari ditinggalkan",
    desc: "Kewajiban memberi makan orang miskin bagi orang yang tidak mampu berpuasa secara permanen (tua renta, sakit menahun)."
  }
};

const ZakatScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const [activeView, setActiveView] = useState<'menu' | ZakatType>('menu');
  const [showZakatGuide, setShowZakatGuide] = useState(true);

  const handleShareFeature = () => {
    const text = `Saya menghitung zakat mal & profesi secara syar'i di aplikasi Santri AI. Aplikasi kalkulator fiqih ibadah & zakat terlengkap!\n\nAyo download aplikasinya di Play Store sekarang:\n${PLAYSTORE_LINK}`;
    if (window.AndroidNativeInterface?.shareText) {
      window.AndroidNativeInterface.shareText('Bagikan Kalkulator Zakat', text);
    } else if (navigator.share) {
      navigator.share({
        title: 'Kalkulator Zakat Santri AI',
        text: text
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      showToast("Link berhasil disalin ke clipboard!", "success");
    }
  };

  useEffect(() => {
    if (location.state && (location.state as any).activeTab) {
      setActiveView((location.state as any).activeTab);
    }
  }, [location]);
  
  // --- GLOBAL SETTINGS ---
  const [goldPrice, setGoldPrice] = useState(1300000); // Rp/gram
  const [ricePrice, setRicePrice] = useState(15000); // Rp/kg (untuk nishab pertanian ~653kg gabah setara beras)
  
  // --- FORM STATES ---
  // Profesi
  const [profesi, setProfesi] = useState({ income: '', bonus: '', debt: '' });
  // Maal
  const [maal, setMaal] = useState({ savings: '', gold: '', other: '', debt: '' });
  // Perdagangan & Perusahaan
  const [trade, setTrade] = useState({ modal: '', profit: '', receivables: '', debt: '' });
  // Pertanian & Tambak
  const [harvest, setHarvest] = useState({ result: '', cost: 'alami' as 'alami' | 'biaya' });
  // Peternakan
  const [livestock, setLivestock] = useState({ type: 'kambing' as 'kambing' | 'sapi', count: '' });
  // Fitrah
  const [fitrah, setFitrah] = useState({ persons: 1, price: 15000 });
  // Fidyah
  const [fidyah, setFidyah] = useState({ days: 1, mealPrice: 15000 });

  // --- RESULT STATE ---
  const [result, setResult] = useState<{ amount: number | string; wajib: boolean; nishab: number | string; note?: string } | null>(null);

  // Helper
  const parseRp = (val: string) => parseFloat(val.replace(/[^0-9]/g, '')) || 0;
  const formatRp = (val: number) => new Intl.NumberFormat('id-ID').format(val);
  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  // Clear result on view change
  useEffect(() => {
    setResult(null);
  }, [activeView]);

  // --- CALCULATION LOGIC ---

  const calcProfesi = () => {
    const total = (parseRp(profesi.income) + parseRp(profesi.bonus)) - parseRp(profesi.debt);
    const nishab = (85 * goldPrice) / 12; // Nishab Emas per tahun dibagi 12 bulan
    const wajib = total >= nishab;
    setResult({ amount: wajib ? total * 0.025 : 0, wajib, nishab });
  };

  const calcMaal = () => {
    const total = (parseRp(maal.savings) + (parseRp(maal.gold) * goldPrice) + parseRp(maal.other)) - parseRp(maal.debt);
    const nishab = 85 * goldPrice;
    const wajib = total >= nishab;
    setResult({ amount: wajib ? total * 0.025 : 0, wajib, nishab });
  };

  const calcTrade = () => {
    // (Modal + Laba + Piutang) - Hutang Jatuh Tempo
    const total = (parseRp(trade.modal) + parseRp(trade.profit) + parseRp(trade.receivables)) - parseRp(trade.debt);
    const nishab = 85 * goldPrice;
    const wajib = total >= nishab;
    setResult({ amount: wajib ? total * 0.025 : 0, wajib, nishab });
  };

  const calcHarvest = () => {
    // Nishab 5 Wasaq setara approx 653kg Gabah Kering Giling.
    // Asumsi harga gabah/beras rata-rata untuk konversi nishab rupiah.
    const totalRp = parseRp(harvest.result);
    const nishabRp = 653 * ricePrice; 
    
    const wajib = totalRp >= nishabRp;
    const rate = harvest.cost === 'alami' ? 0.10 : 0.05; // 10% vs 5%
    
    setResult({ 
      amount: wajib ? totalRp * rate : 0, 
      wajib, 
      nishab: nishabRp,
      note: harvest.cost === 'alami' ? 'Tarif 10% (Tadah Hujan/Alami)' : 'Tarif 5% (Irigasi berbiaya)'
    });
  };

  const calcLivestock = () => {
    const qty = parseInt(livestock.count) || 0;
    let amountText = "";
    let wajib = false;
    let nishabDesc = "";

    if (livestock.type === 'kambing') {
      nishabDesc = "40 Ekor";
      if (qty >= 40 && qty <= 120) { amountText = "1 Ekor Kambing"; wajib = true; }
      else if (qty > 120 && qty <= 200) { amountText = "2 Ekor Kambing"; wajib = true; }
      else if (qty > 200 && qty <= 300) { amountText = "3 Ekor Kambing"; wajib = true; }
      else if (qty > 300) { 
        const hundreds = Math.floor(qty / 100);
        amountText = `${hundreds} Ekor Kambing`; 
        wajib = true; 
      }
    } else { // Sapi
      nishabDesc = "30 Ekor";
      if (qty >= 30 && qty <= 39) { amountText = "1 Ekor Sapi Tabi' (Jantan/Betina 1 th)"; wajib = true; }
      else if (qty >= 40 && qty <= 59) { amountText = "1 Ekor Sapi Musinnah (Betina 2 th)"; wajib = true; }
      else if (qty >= 60 && qty <= 69) { amountText = "2 Ekor Sapi Tabi'"; wajib = true; }
      else if (qty >= 70) { amountText = "1 Tabi' + 1 Musinnah (Rumus: Tiap 30=1 Tabi', Tiap 40=1 Musinnah)"; wajib = true; }
    }

    setResult({ amount: amountText, wajib, nishab: nishabDesc });
  };

  const calcFitrah = () => {
    const zakat = fitrah.persons * fitrah.price * 2.5;
    setResult({ amount: zakat, wajib: true, nishab: 0 });
  };

  const calcFidyah = () => {
    const total = fidyah.days * fidyah.mealPrice;
    setResult({ amount: total, wajib: true, nishab: 0, note: `Setara memberi makan 1 orang miskin selama ${fidyah.days} hari.` });
  };

  const getActiveInputs = () => {
    switch(activeView) {
      case 'profesi': return profesi;
      case 'maal': return maal;
      case 'perdagangan':
      case 'perusahaan': return trade;
      case 'pertanian':
      case 'tambak': return harvest;
      case 'peternakan': return livestock;
      case 'fitrah': return fitrah;
      case 'fidyah': return fidyah;
      default: return {};
    }
  };

  // --- SUB COMPONENT: INFO CARD ---
  const ZakatInfoCard = ({ type }: { type: ZakatType }) => {
    const info = ZAKAT_DETAILS[type];
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/30 mb-6 shadow-sm">
        <div className="flex items-start gap-3">
          <HelpCircle size={20} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
          <div className="space-y-3 w-full">
             <div>
                <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-1">Ketentuan {ZAKAT_MENU.find(i => i.id === type)?.title}</h3>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 leading-relaxed">{info.desc}</p>
             </div>
             
             <div className="grid grid-cols-3 gap-2 border-t border-emerald-200 dark:border-emerald-800/50 pt-3">
                <div className="bg-white/50 dark:bg-slate-900/30 p-2 rounded-lg">
                   <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase block mb-0.5">Nishab</span>
                   <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block leading-tight">{info.nishab}</span>
                </div>
                <div className="bg-white/50 dark:bg-slate-900/30 p-2 rounded-lg">
                   <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase block mb-0.5">Kadar</span>
                   <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block leading-tight">{info.kadar}</span>
                </div>
                <div className="bg-white/50 dark:bg-slate-900/30 p-2 rounded-lg">
                   <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase block mb-0.5">Haul</span>
                   <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block leading-tight">{info.haul}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER COMPONENT ---

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-left">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md relative overflow-hidden px-4 py-4 flex items-center justify-between gap-3">
        <IslamicPattern className="text-white opacity-[0.14]" />
        <div className="flex items-center gap-3 relative z-10 flex-1">
          <button 
            onClick={() => {
              if (activeView === 'menu') navigate(-1);
              else { setActiveView('menu'); setResult(null); }
            }} 
            className="p-2 -ml-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <Coins size={20} className="text-emerald-200" />
            {activeView === 'menu' ? 'Kalkulator Zakat & Fidyah' : ZAKAT_MENU.find(i => i.id === activeView)?.title}
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

      <div className="p-4 max-w-lg mx-auto">

        {/* --- MENU VIEW --- */}
        {activeView === 'menu' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            {/* Panduan & Dalil Syar'i Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <button 
                onClick={() => setShowZakatGuide(!showZakatGuide)} 
                className="w-full p-4 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                  <BookOpen size={18} />
                  <span>Panduan Syar'i & Dalil Zakat / Fidyah</span>
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${showZakatGuide ? 'rotate-180' : ''}`} />
              </button>
              
              {showZakatGuide && (
                <div className="p-4 space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-950">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Kewajiban Zakat (Rukun Islam)</h4>
                    <p>Zakat adalah harta tertentu yang wajib dikeluarkan oleh orang Muslim untuk diserahkan kepada golongan yang berhak menerimanya (8 Asnaf) sesuai ketentuan Syariat.</p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                    <p className="font-bold text-slate-850 dark:text-slate-250">Dalil Al-Qur'an & Hadits:</p>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-705 dark:text-slate-305">1. Perintah Mendasar Zakat:</p>
                      <p className="italic">"Ambil-lah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan mensucikan mereka..."</p>
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">(QS. At-Taubah: 103)</p>
                    </div>
                    <div className="space-y-1 pt-1 border-t border-slate-205/50 dark:border-slate-707/50">
                      <p className="font-semibold text-slate-705 dark:text-slate-305">2. Larangan Menimbun Tanpa Zakat:</p>
                      <p className="italic">"Dan orang-orang yang menyimpan emas dan perak dan tidak menafkahkannya pada jalan Allah, maka beritahukanlah kepada mereka, (bahwa mereka akan mendapat) siksa yang pedih."</p>
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">(QS. At-Taubah: 34)</p>
                    </div>
                    <div className="space-y-1 pt-1 border-t border-slate-205/50 dark:border-slate-707/50">
                      <p className="font-semibold text-slate-705 dark:text-slate-305">3. Dalil Fidyah bagi yang Berat Berpuasa:</p>
                      <p className="italic">"Dan wajib bagi orang-orang yang berat menjalankannya (jika mereka tidak berpuasa) membayar fidyah, (yaitu): memberi makan seorang miskin..."</p>
                      <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400">(QS. Al-Baqarah: 184)</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Ketentuan Utama Fidyah</h4>
                    <p className="mb-1">Fidyah diwajibkan bagi mereka yang tidak mampu puasa karena udzur permanen:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Orang tua renta yang sangat lemah fisiknya.</li>
                      <li>Orang sakit menahun yang tidak ada harapan sembuh.</li>
                      <li>Ibu hamil/menyusui yang khawatir akan keselamatan buah hatinya (menurut sebagian madzhab disertai qadha).</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Config Bar */}
            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-center justify-between shadow-sm">
                <div>
                   <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block mb-1">Harga Emas (per gram)</span>
                   <p className="text-[10px] text-slate-500 dark:text-slate-400">Acuan Nishab Mal</p>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg px-2 py-1.5 border border-amber-200 dark:border-amber-800/50">
                   <span className="text-xs font-medium text-slate-500">Rp</span>
                   <input 
                      type="text" 
                      value={formatRp(goldPrice)}
                      onChange={(e) => setGoldPrice(parseRp(e.target.value))}
                      className="w-24 bg-transparent text-right text-sm font-bold text-slate-800 dark:text-slate-200 outline-none"
                   />
                </div>
            </div>

            {/* Grid Menu */}
            <div className="grid grid-cols-2 gap-3">
              {ZAKAT_MENU.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all text-left flex flex-col items-start gap-3 group relative overflow-hidden"
                  >
                    <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                        {item.desc}
                      </p>
                    </div>
                    <ChevronRight size={16} className="absolute right-3 top-4 text-slate-200 dark:text-slate-700 group-hover:text-emerald-400 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* --- CALCULATOR FORMS --- */}
        {activeView !== 'menu' && (
          <div className="animate-in slide-in-from-right-8 duration-300">
            
            {/* Info Card at Top */}
            <ZakatInfoCard type={activeView} />

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              
              {/* PROFESI FORM */}
              {activeView === 'profesi' && (
                <>
                   <InputMoney label="Pendapatan Bulanan (Total)" value={profesi.income} onChange={v => setProfesi({...profesi, income: v})} />
                   <InputMoney label="Bonus / THR (Opsional)" value={profesi.bonus} onChange={v => setProfesi({...profesi, bonus: v})} />
                   <InputMoney label="Hutang / Cicilan (Pengurang)" value={profesi.debt} onChange={v => setProfesi({...profesi, debt: v})} isDeduction />
                   <CalculateButton onClick={calcProfesi} />
                </>
              )}

              {/* MAAL FORM */}
              {activeView === 'maal' && (
                <>
                   <InputMoney label="Total Tabungan / Deposito" value={maal.savings} onChange={v => setMaal({...maal, savings: v})} />
                   <InputWithUnit label="Berat Emas (Gram)" value={maal.gold} unit="Gram" onChange={v => setMaal({...maal, gold: v})} />
                   <InputMoney label="Aset Lain (Surat Berharga)" value={maal.other} onChange={v => setMaal({...maal, other: v})} />
                   <InputMoney label="Hutang Jatuh Tempo" value={maal.debt} onChange={v => setMaal({...maal, debt: v})} isDeduction />
                   <CalculateButton onClick={calcMaal} />
                </>
              )}

              {/* PERDAGANGAN & PERUSAHAAN FORM */}
              {(activeView === 'perdagangan' || activeView === 'perusahaan') && (
                <>
                   <InputMoney label="Modal / Aset Lancar / Stok" value={trade.modal} onChange={v => setTrade({...trade, modal: v})} />
                   <InputMoney label="Keuntungan (Laba Ditahan)" value={trade.profit} onChange={v => setTrade({...trade, profit: v})} />
                   <InputMoney label="Piutang (Dapat Dicairkan)" value={trade.receivables} onChange={v => setTrade({...trade, receivables: v})} />
                   <InputMoney label="Hutang Jatuh Tempo" value={trade.debt} onChange={v => setTrade({...trade, debt: v})} isDeduction />
                   <CalculateButton onClick={calcTrade} />
                </>
              )}

              {/* PERTANIAN & TAMBAK FORM */}
              {(activeView === 'pertanian' || activeView === 'tambak') && (
                 <>
                   <InputMoney label="Total Nilai Hasil Panen" value={harvest.result} onChange={v => setHarvest({...harvest, result: v})} />
                   
                   <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">Sistem Pengairan / Pemeliharaan</label>
                      <div className="grid grid-cols-2 gap-3">
                         <button 
                           onClick={() => setHarvest({...harvest, cost: 'alami'})}
                           className={`p-3 rounded-xl border text-sm font-semibold transition-all ${harvest.cost === 'alami' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-500'}`}
                         >
                           Alami / Tadah Hujan (10%)
                         </button>
                         <button 
                           onClick={() => setHarvest({...harvest, cost: 'biaya'})}
                           className={`p-3 rounded-xl border text-sm font-semibold transition-all ${harvest.cost === 'biaya' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-500'}`}
                         >
                           Irigasi / Berbiaya (5%)
                         </button>
                      </div>
                   </div>

                   <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <InputMoney label="Acuan Harga Beras/Gabah (Per Kg)" value={formatRp(ricePrice)} onChange={v => setRicePrice(parseRp(v))} />
                   </div>

                   <CalculateButton onClick={calcHarvest} />
                 </>
              )}

              {/* PETERNAKAN FORM */}
              {activeView === 'peternakan' && (
                 <>
                   <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">Jenis Hewan</label>
                      <div className="grid grid-cols-2 gap-3">
                         <button 
                           onClick={() => setLivestock({...livestock, type: 'kambing'})}
                           className={`p-3 rounded-xl border text-sm font-semibold transition-all ${livestock.type === 'kambing' ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-500'}`}
                         >
                           Kambing / Domba
                         </button>
                         <button 
                           onClick={() => setLivestock({...livestock, type: 'sapi'})}
                           className={`p-3 rounded-xl border text-sm font-semibold transition-all ${livestock.type === 'sapi' ? 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-500'}`}
                         >
                           Sapi / Kerbau
                         </button>
                      </div>
                   </div>
                   <InputWithUnit label="Jumlah Hewan" value={livestock.count} unit="Ekor" onChange={v => setLivestock({...livestock, count: v})} />
                   <CalculateButton onClick={calcLivestock} />
                 </>
              )}

              {/* FITRAH FORM */}
              {activeView === 'fitrah' && (
                 <>
                   <InputMoney label="Harga Beras (Per Kg)" value={formatRp(fitrah.price)} onChange={v => setFitrah({...fitrah, price: parseRp(v)})} />
                   <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">Jumlah Orang</label>
                      <div className="flex items-center gap-4">
                          <button onClick={() => setFitrah({...fitrah, persons: Math.max(1, fitrah.persons - 1)})} className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600">-</button>
                          <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{fitrah.persons}</span>
                          <button onClick={() => setFitrah({...fitrah, persons: fitrah.persons + 1})} className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600">+</button>
                      </div>
                   </div>
                   <CalculateButton onClick={calcFitrah} title="Hitung Zakat" />
                 </>
              )}

              {/* FIDYAH FORM */}
              {activeView === 'fidyah' && (
                 <>
                   <InputMoney label="Harga 1 Porsi Makan / 1 Mud" value={formatRp(fidyah.mealPrice)} onChange={v => setFidyah({...fidyah, mealPrice: parseRp(v)})} />
                   <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">Jumlah Hari Ditinggalkan</label>
                      <div className="flex items-center gap-4">
                          <button onClick={() => setFidyah({...fidyah, days: Math.max(1, fidyah.days - 1)})} className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600">-</button>
                          <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{fidyah.days}</span>
                          <button onClick={() => setFidyah({...fidyah, days: fidyah.days + 1})} className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-slate-600">+</button>
                      </div>
                   </div>
                   <CalculateButton onClick={calcFidyah} title="Hitung Fidyah" />
                 </>
              )}

            </div>

            {/* --- RESULT CARD --- */}
            {result && (
              <div className={`mt-6 p-6 rounded-2xl border flex flex-col items-center text-center animate-in zoom-in-95 duration-300 shadow-sm ${
                result.wajib 
                  ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900/30' 
                  : 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
              }`}>
                  <div className="mb-4">
                    {result.wajib ? (
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                              <CheckCircle size={24} />
                          </div>
                          <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">Wajib Zakat</h4>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 mb-2">
                              <XCircle size={24} />
                          </div>
                          <h4 className="font-bold text-slate-600 dark:text-slate-300 text-lg">Belum Wajib Zakat</h4>
                        </div>
                    )}
                  </div>

                  <div className="w-full h-px bg-slate-200 dark:bg-slate-700/50 mb-4"></div>

                  {/* Nishab Info */}
                  {result.nishab !== 0 && (
                     <div className="w-full flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-4 bg-white dark:bg-slate-900/50 p-2 rounded-lg">
                        <span>Nishab (Batas Minimal):</span>
                        <span className="font-bold">{typeof result.nishab === 'number' ? formatCurrency(result.nishab) : result.nishab}</span>
                     </div>
                  )}

                  {/* Note */}
                  {result.note && (
                     <p className="text-xs text-slate-500 mb-4 italic">{result.note}</p>
                  )}

                  {/* Amount Display */}
                  {result.wajib && (
                      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 w-full shadow-sm border border-emerald-100 dark:border-emerald-900/20 mb-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Yang Harus Dikeluarkan</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                           {typeof result.amount === 'number' ? formatCurrency(result.amount) : result.amount}
                        </p>
                      </div>
                  )}

                  <AiZakatAnalyst data={{ type: activeView, inputs: getActiveInputs(), result }} />
              </div>
            )}
          </div>
        )}

        {/* Share Feature Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-teal-950 dark:to-emerald-900 rounded-[2.5rem] p-6 text-white shadow-xl shadow-emerald-100 dark:shadow-none relative overflow-hidden mt-6">
          <IslamicPattern className="text-white opacity-[0.08]" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
                <Share2 size={24} />
              </div>
              <div>
                <h3 className="font-black text-sm text-white">Bagikan Fitur Ini 🌸</h3>
                <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-tight">Bantu muslim lainnya menghitung zakat mal & profesi secara syar'i</p>
              </div>
            </div>
            <button 
              onClick={handleShareFeature}
              className="w-full sm:w-auto px-5 py-3.5 bg-white text-emerald-600 hover:bg-emerald-50 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 font-bold"
            >
              <Share2 size={14} /> Bagikan
            </button>
          </div>
        </div>
      </div>
      <AiFeatureAssistant 
        featureName="Kalkulator Zakat & Fidyah" 
        contextData={result ? { type: activeView, inputs: getActiveInputs(), result } : { type: activeView }} 
        placeholder="Tanyakan tentang zakat mal, zakat fitrah, atau ketentuan menebus fidyah puasa..." 
      />
    </div>
  );
};

// --- AI ANALYST COMPONENT ---
const AiZakatAnalyst = ({ data }: { data: any }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<any>(null);
  const { showToast } = useToast();

  const handleAnalyze = async () => {
    if (!user) {
      showToast("Analisis Pakar AI memerlukan login.", "info");
      navigate('/settings');
      return;
    }
    setLoading(true);
    try {
      const { generateZakatWarisAnalysis } = await import('../services/geminiService');
      const res = await generateZakatWarisAnalysis('zakat', data);
      setAnalysis(res);
    } catch (e) {
      showToast("Gagal memanggil asisten AI.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (analysis) {
    return (
      <div className="mt-4 p-4 bg-emerald-600 text-white rounded-2xl text-left space-y-3 shadow-lg">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Brain size={16} className="text-emerald-300" /> Analisis Pakar AI
        </div>
        <p className="text-xs text-emerald-50 font-medium leading-relaxed">{analysis.summary}</p>
        <div className="bg-white/10 p-3 rounded-xl border border-white/10">
          <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-70">Penjelasan & Referensi</h4>
          <p className="text-[10px] text-emerald-50 leading-relaxed italic">{analysis.details}</p>
        </div>
        <button onClick={() => setAnalysis(null)} className="text-[10px] underline opacity-70">Tutup</button>
      </div>
    );
  }

  return (
    <button 
      onClick={handleAnalyze}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-50 active:scale-95 transition-all"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
      {loading ? "MENGANALISIS..." : "TANYA ANALISIS PAKAR AI"}
    </button>
  );
};

// --- SUB COMPONENTS ---

const InputMoney = ({ label, value, onChange, isDeduction = false }: { label: string, value: string, onChange: (v: string) => void, isDeduction?: boolean }) => {
  const format = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''));
    return isNaN(num) ? '' : new Intl.NumberFormat('id-ID').format(num);
  };

  return (
    <div>
      <label className={`text-xs font-bold block mb-1.5 ${isDeduction ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
        {label}
      </label>
      <div className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border rounded-xl px-3 py-3 transition-colors ${isDeduction ? 'border-red-100 dark:border-red-900/30 focus-within:border-red-500' : 'border-slate-200 dark:border-slate-700 focus-within:border-emerald-500'}`}>
         <span className={`text-sm font-bold ${isDeduction ? 'text-red-500' : 'text-slate-400'}`}>Rp</span>
         <input 
           type="text" 
           value={format(value)}
           onChange={(e) => onChange(e.target.value)}
           placeholder="0"
           className="w-full bg-transparent outline-none font-mono text-slate-800 dark:text-slate-200 text-lg"
         />
      </div>
    </div>
  );
};

const InputWithUnit = ({ label, value, unit, onChange }: { label: string, value: string, unit: string, onChange: (v: string) => void }) => {
   return (
    <div>
      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">{label}</label>
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-3 focus-within:border-emerald-500 transition-colors">
         <input 
           type="number" 
           value={value}
           onChange={(e) => onChange(e.target.value)}
           placeholder="0"
           className="w-full bg-transparent outline-none font-mono text-slate-800 dark:text-slate-200 text-lg"
         />
         <span className="text-xs font-bold text-slate-400 uppercase">{unit}</span>
      </div>
    </div>
   );
};

const CalculateButton = ({ onClick, title = "Hitung Zakat" }: { onClick: () => void, title?: string }) => (
  <button 
    onClick={onClick} 
    className="w-full mt-4 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 active:scale-95"
  >
    <Calculator size={20} /> {title}
  </button>
);

export default ZakatScreen;