import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserAvatar } from '../components/UserAvatar';
import { ArrowLeft, Droplets, Info, Ruler, CheckCircle, XCircle, BookOpen, Share2 } from 'lucide-react';
import AiFeatureAssistant from '../src/components/AiFeatureAssistant';
import { PLAYSTORE_LINK } from '../constants';

const WaterCalculatorScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const [shape, setShape] = useState<'cube' | 'cylinder'>('cube');

  const handleShareFeature = () => {
    const text = `Saya mengukur volume bak air bersuci (dua qullah) di aplikasi Santri AI. Aplikasi kalkulator fiqih ibadah & Thaharah terlengkap!\n\nAyo download aplikasinya di Play Store sekarang:\n${PLAYSTORE_LINK}`;
    if (window.AndroidNativeInterface?.shareText) {
      window.AndroidNativeInterface.shareText('Bagikan Kalkulator Dua Qullah', text);
    } else if (navigator.share) {
      navigator.share({
        title: 'Kalkulator Dua Qullah Santri AI',
        text: text
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      showToast("Link berhasil disalin ke clipboard!", "success");
    }
  };
  
  // Cube states
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  
  // Cylinder states
  const [radius, setRadius] = useState('');
  const [depth, setDepth] = useState('');

  const [result, setResult] = useState<any>(null);

  const TWO_QULLAH_LITERS = 216; // Standard umum sekitar 216 liter (60x60x60cm)

  const calculateWater = () => {
    let volumeLiters = 0;
    
    if (shape === 'cube') {
      const l = parseFloat(length) || 0;
      const w = parseFloat(width) || 0;
      const h = parseFloat(height) || 0;
      // cm^3 to Liters (/1000)
      volumeLiters = (l * w * h) / 1000;
    } else {
      const r = parseFloat(radius) || 0;
      const d = parseFloat(depth) || 0;
      // pi * r^2 * d / 1000
      volumeLiters = (Math.PI * Math.pow(r, 2) * d) / 1000;
    }

    const isTwoQullah = volumeLiters >= TWO_QULLAH_LITERS;
    setResult({
      volume: Math.round(volumeLiters * 10) / 10,
      isTwoQullah,
      description: isTwoQullah 
        ? "Air mencukupi batas 2 Qullah. Air ini tidak menjadi najis jika kemasukan najis selama tidak merubah bau, rasa, atau warna."
        : "Air kurang dari 2 Qullah. Air ini langsung menjadi najis (Mutanajis) jika kemasukan najis meskipun tidak berubah sifatnya."
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans animate-in fade-in duration-300">
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 text-left">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
            <Droplets size={20} className="text-cyan-500 animate-pulse" />
            Cek 2 Qullah
          </h2>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button 
            onClick={handleShareFeature}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all active:scale-90 flex items-center justify-center"
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
        <AiFeatureAssistant 
          featureName="Cek 2 Qullah" 
          contextData={result} 
          placeholder="Tanyakan tentang hukum air mutlak, air musta'mal, atau jenis-jenis najis..." 
        />
        <div className="bg-cyan-50 dark:bg-cyan-900/10 p-4 rounded-xl border border-cyan-100 dark:border-cyan-900/30 flex gap-3 items-start">
          <Info size={20} className="text-cyan-600 shrink-0 mt-0.5" />
          <p className="text-xs text-cyan-700 dark:text-cyan-300 leading-relaxed">
            Ukuran <strong>2 Qullah</strong> adalah wadah kubus dengan sisi ±60cm. Volume standar yang digunakan adalah <strong>216 Liter</strong>.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
           <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button onClick={() => setShape('cube')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${shape === 'cube' ? 'bg-white dark:bg-slate-700 shadow-sm text-cyan-600' : 'text-slate-400'}`}>Wadah Kotak</button>
              <button onClick={() => setShape('cylinder')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${shape === 'cylinder' ? 'bg-white dark:bg-slate-700 shadow-sm text-cyan-600' : 'text-slate-400'}`}>Wadah Bulat</button>
           </div>

           {shape === 'cube' ? (
              <div className="grid grid-cols-3 gap-3">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Panjang (cm)</label>
                    <input type="number" value={length} onChange={e => setLength(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-cyan-500 transition-all" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Lebar (cm)</label>
                    <input type="number" value={width} onChange={e => setWidth(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-cyan-500 transition-all" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Tinggi (cm)</label>
                    <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-cyan-500 transition-all" />
                 </div>
              </div>
           ) : (
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Jari-jari (cm)</label>
                    <input type="number" value={radius} onChange={e => setRadius(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-cyan-500 transition-all" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Kedalaman (cm)</label>
                    <input type="number" value={depth} onChange={e => setDepth(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-cyan-500 transition-all" />
                 </div>
              </div>
           )}

           <button onClick={calculateWater} className="w-full py-4 bg-cyan-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-cyan-100 dark:shadow-none hover:bg-cyan-700">
              <Ruler size={20} /> Hitung Volume
           </button>
        </div>

        {result && (
          <div className="animate-in zoom-in-95 duration-300">
             <div className={`p-6 rounded-3xl border-2 flex flex-col items-center text-center ${result.isTwoQullah ? 'bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-900/20' : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20'}`}>
                <div className="mb-4">
                   {result.isTwoQullah ? <CheckCircle size={48} className="text-cyan-600 animate-bounce" /> : <XCircle size={48} className="text-amber-600 animate-bounce" />}
                </div>
                <h3 className="text-2xl font-black mb-1">{result.volume} LITER</h3>
                <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4">{result.isTwoQullah ? 'Mencapai 2 Qullah' : 'Kurang dari 2 Qullah'}</p>
                <p className="text-sm leading-relaxed mb-6 px-4">{result.description}</p>
                
                <div className="w-full pt-4 border-t border-current border-opacity-10 text-left">
                   <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase text-slate-700 dark:text-slate-300">
                      <BookOpen size={14} /> Dalil Syariat (2 Qullah)
                   </div>
                   <p className="text-[11px] italic leading-relaxed opacity-90">
                      "Jika air mencapai dua Qullah, maka air tersebut tidak mengandung najis (tidak menjadi najis selama tidak berubah sifatnya)."
                      <br/><strong>(HR. Abu Dawud, At-Tirmidzi, & an-Nasa'i)</strong>
                   </p>
                </div>
             </div>
          </div>
        )}

        {/* Pendidikan Pembagian Air dlm Fiqih */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
           <h3 className="font-black text-slate-800 dark:text-slate-100 text-base flex items-center gap-2 mb-2">
              <BookOpen size={20} className="text-emerald-600 animate-pulse" />
              Panduan Fiqih Pembagian Air
           </h3>
           <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 font-medium">
              Berdasar Madzhab Syafi'i (seperti dalam kitab fiqih standard <em>Fathul Qorib</em>), golongan air dibagi menjadi 4 jenis hukum utama beserta ketentuannya terhadap volume air:
           </p>

           <div className="space-y-4">
              {/* 1. Air Mutlak */}
              <div className="p-4 bg-emerald-50/45 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20">
                 <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-xs text-emerald-800 dark:text-emerald-400">1. Air Suci & Menyucikan (Mutlak)</span>
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase scale-90 origin-right">Bisa Bersuci</span>
                 </div>
                 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Air murni yang sah dan menyucikan untuk berwudhu, mandi wajib, serta membersihkan najis. Air ini belum berubah sifat aslinya dan tidak tercampur zat lain. Contoh: air sumur, air hujan, sungai, laut, mata air, embun, dan salju.
                 </p>
                 <div className="bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-emerald-50 dark:border-slate-800">
                    <p className="font-arabic text-sm leading-loose text-slate-700 dark:text-slate-200 text-right mb-1" dir="rtl">
                       وَيُنَزِّلُ عَلَيْكُمْ مِنَ السَّمَاءِ مَاءً لِيُطَهِّرَكُمْ بِهِ
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic font-medium">
                       "Dan Allah menurunkan kepadamu hujan dari langit untuk menyucikan kamu dengan hujan itu." <strong>(QS. Al-Anfal: 11)</strong>
                    </p>
                 </div>
              </div>

              {/* 2. Air Musta'mal */}
              <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20">
                 <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-xs text-indigo-800 dark:text-indigo-400">2. Air Suci & Tidak Menyucikan (Musta'mal)</span>
                    <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase scale-90 origin-right">Suci Saja</span>
                 </div>
                 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Air bekas membasuh basuhan wajib wudhu atau mandi jinabah <strong>bila volumenya kurang dari 2 Qullah</strong>, ATAU air yang berubah sifatnya karena tercampur benda suci (seperti air teh, kopi, sabun, pewangi). Air ini suci untuk dikonsumsi, namun tidak sah jika dipakai bersuci kembali.
                 </p>
                 <p className="text-[11px] text-indigo-900 dark:text-indigo-300 font-semibold bg-indigo-50/50 dark:bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-100/30 dark:border-indigo-900/10 leading-relaxed">
                    💡 <strong>Aturan 2 Qullah:</strong> Apabila air musta'mal dikumpulkan kembali hingga volumenya mencapai atau melebihi 2 Qullah (≥ 216 Liter), hukumnya <strong>kembali menjadi suci dan menyucikan</strong>.
                 </p>
              </div>

              {/* 3. Air Mutanajis */}
              <div className="p-4 bg-orange-50/40 dark:bg-orange-950/10 rounded-2xl border border-orange-100/50 dark:border-orange-900/20">
                 <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-xs text-orange-800 dark:text-orange-400">3. Air Mutanajis (Kena Najis)</span>
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase scale-90 origin-right">Najis</span>
                 </div>
                 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Air yang kemasukan benda najis. Status hukum kenajisannya sangat dipengaruhi oleh volume 2 Qullah:
                 </p>
                 <div className="space-y-2 mb-3 text-xs leading-relaxed">
                    <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-orange-50 dark:border-slate-800">
                       🔴 <strong className="text-red-600 dark:text-red-400">Bila kurang dari 2 Qullah (&lt; 216L):</strong> Air otomatis menjadi najis saat kemasukan najis, <strong>meskipun sifat air (bau, rasa, warna) tidak tampak berubah sama sekali.</strong>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-orange-50 dark:border-slate-800">
                       🟢 <strong className="text-emerald-600 dark:text-emerald-400">Bila mencapai/melebih 2 Qullah (≥ 216L):</strong> Air tidak menjadi najis kecuali jika najis tersebut sampai merubah salah satu sifatnya (bau, rasa, atau warna).
                    </div>
                  </div>
                 <div className="bg-white dark:bg-slate-800/50 p-3 rounded-xl border border-orange-50 dark:border-slate-800">
                    <p className="font-arabic text-sm leading-loose text-slate-700 dark:text-slate-200 text-right mb-1" dir="rtl">
                       إِذَا كَانَ الْمَاءُ قُلَّتَيْنِ لَمْ يَحْمِلِ الْخَبَثَ
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic font-medium">
                       "Apabila air telah mencapai dua qullah, maka ia tidak memikul najis." <strong>(HR. Abu Dawud, At-Tirmidzi, & Ibnu Majah)</strong>
                    </p>
                 </div>
              </div>

              {/* 4. Air Musyammas */}
              <div className="p-4 bg-amber-50/40 dark:bg-amber-950/10 rounded-2xl border border-amber-100/50 dark:border-amber-900/20">
                 <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-xs text-amber-800 dark:text-amber-400">4. Air Musyammas</span>
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase scale-90 origin-right">Makruh</span>
                 </div>
                 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Air suci menyucikan yang dipanaskan langsung di bawah panas terik matahari dalam wadah terbuat dari logam yang dapat berkarat (besi/tembaga) selain emas dan perak. Air ini makruh digunakan untuk badan (seperti wudhu) karena dikhawatirkan memicu penyakit kusta (vitiligo).
                 </p>
              </div>
           </div>
        </div>

        {/* Share Feature Banner */}
        <div className="bg-gradient-to-r from-cyan-500 to-indigo-600 dark:from-indigo-950 dark:to-cyan-900 rounded-[2.5rem] p-6 text-white shadow-xl shadow-cyan-100 dark:shadow-none relative overflow-hidden mt-6 text-left">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
                <Share2 size={24} />
              </div>
              <div>
                <h3 className="font-black text-sm text-white">Bagikan Fitur Ini 🌸</h3>
                <p className="text-[10px] font-bold text-cyan-100 uppercase tracking-tight">Bantu muslim lainnya mengukur keabsahan air bersuci thaharah</p>
              </div>
            </div>
            <button 
              onClick={handleShareFeature}
              className="w-full sm:w-auto px-5 py-3.5 bg-white text-cyan-600 hover:bg-cyan-50 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 font-bold shrink-0"
            >
              <Share2 size={14} /> Bagikan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterCalculatorScreen;
