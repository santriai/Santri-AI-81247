
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserAvatar } from '../components/UserAvatar';
import { ArrowLeft, Map, Navigation, Clock, Info, CheckCircle, XCircle, History, Trash2, BookOpen, ChevronDown, Share2 } from 'lucide-react';
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
          <pattern id="islamic-grid-travel" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" />
            <path d="M12 5 L19 12 L12 19 L5 12 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
            <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#islamic-grid-travel)" />
      </svg>
    </div>
  );
};

const TravelCalculatorScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  const [distance, setDistance] = useState('');

  const handleShareFeature = () => {
    const text = `Saya mengukur jarak jamak qashar perjalanan (safar) di aplikasi Santri AI. Aplikasi kalkulator fiqih ibadah & safar terlengkap!\n\nAyo download aplikasinya di Play Store sekarang:\n${PLAYSTORE_LINK}`;
    if (window.AndroidNativeInterface?.shareText) {
      window.AndroidNativeInterface.shareText('Bagikan Kalkulator Jamak Qashar', text);
    } else if (navigator.share) {
      navigator.share({
        title: 'Kalkulator Jamak Qashar Santri AI',
        text: text
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      showToast("Link berhasil disalin ke clipboard!", "success");
    }
  };
  const [speed, setSpeed] = useState('60');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [showTravelGuide, setShowTravelGuide] = useState(true);
  const [travelHistory, setTravelHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('santriai_travel_history');
    return saved ? JSON.parse(saved) : [];
  });

  const MARHALAH_DISTANCE = 80.64; // Standar km untuk 2 Marhalah

  const handleCalculate = () => {
    const dist = parseFloat(distance);
    const spd = parseFloat(speed);
    if (isNaN(dist) || dist <= 0) return;

    const timeHours = dist / spd;
    const hours = Math.floor(timeHours);
    const minutes = Math.round((timeHours - hours) * 60);

    const isEligible = dist >= MARHALAH_DISTANCE;

    const newHistory = {
      id: Date.now(),
      origin: origin || 'Lokasi Asal',
      destination: destination || 'Tujuan',
      distance: dist,
      eta: `${hours} jam ${minutes} menit`,
      eligible: isEligible,
      date: new Date().toLocaleDateString('id-ID')
    };

    const updatedHistory = [newHistory, ...travelHistory].slice(0, 10);
    setTravelHistory(updatedHistory);
    localStorage.setItem('santriai_travel_history', JSON.stringify(updatedHistory));
    
    setDistance('');
    setOrigin('');
    setDestination('');
  };

  const deleteHistory = () => {
    setTravelHistory([]);
    localStorage.removeItem('santriai_travel_history');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans text-left">
      <div className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md relative overflow-hidden px-4 py-4 flex items-center justify-between gap-3">
        <IslamicPattern className="text-white opacity-[0.14]" />
        <div className="flex items-center gap-3 relative z-10 flex-1">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <Map size={20} className="text-blue-200" />
            Jarak Safar & Shalat Jamak Qashar
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
        
        {/* Panduan Safar & Shalat Jamak Qashar Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <button 
            onClick={() => setShowTravelGuide(!showTravelGuide)} 
            className="w-full p-4 flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/20 border-b border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm">
              <BookOpen size={18} />
              <span>Panduan Syar'i & Dalil Safar (Musafir)</span>
            </div>
            <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${showTravelGuide ? 'rotate-180' : ''}`} />
          </button>
          
          {showTravelGuide && (
            <div className="p-4 space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-950">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Rukhshah (Keringanan) bagi Musafir</h4>
                <p>Syariat Islam memberikan kemudahan (rukhshah) bagi orang yang melakukan bepergian jauh (safar) berupa diperbolehkannya menjamak (menggabungkan) atau mengqashar (meringkas shalat 4 rakaat menjadi 2 rakaat).</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">Dalil Syariat:</p>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-705 dark:text-slate-305">1. Dalil Rukhshah Mengqashar Shalat:</p>
                  <p className="italic">"Dan apabila kamu bepergian di muka bumi, maka tidaklah mengapa kamu men-qashar sembahyang(mu)..."</p>
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">(QS. An-Nisa: 101)</p>
                </div>
                <div className="space-y-1 pt-1 border-t border-slate-205/50 dark:border-slate-707/50">
                  <p className="font-semibold text-slate-705 dark:text-slate-305">2. Syarat Jarak (2 Marhalah):</p>
                  <p className="italic">Para ulama madzhab Syafi'i sepakat batas safar marhalah adalah 16 Farsakh, yaitu setara dengan 48 mil Hasyimiyah atau sekitar ±80,64 km perjalanan searah tanpa maksiat.</p>
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">(Kitab Fathul Qorib Al-Mujib)</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Syarat Sah Shalat Jamak & Qashar</h4>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Keluar melewati batas desa/wilayah tempat tinggal asal.</li>
                  <li>Tujuan safar ditentukan secara jelas (bukan berputar-putar tanpa arah).</li>
                  <li>Bukan bepergian yang berniat melakukan kemaksiatan.</li>
                  <li>Niat melakukan Jamak/Qashar pada takbiratul ihram pertama.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <AiFeatureAssistant 
          featureName="Kalkulator Jarak Safar" 
          contextData={{ travelHistory }} 
          placeholder="Tanyakan hukum jamak qashar, syarat musafir, atau rincian jarak marhalah..." 
        />
        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3 items-start">
          <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed text-justify">
            Batas minimal jarak diperbolehkan Jamak & Qoshor adalah <strong>2 Marhalah (±80.64 km)</strong>. 
            Pastikan perjalanan Anda bukan untuk tujuan maksiat.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Asal</label>
                <input type="text" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Contoh: Jakarta" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-blue-500" />
             </div>
             <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Tujuan</label>
                <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Contoh: Bandung" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-blue-500" />
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Jarak (KM)</label>
                <input type="number" value={distance} onChange={e => setDistance(e.target.value)} placeholder="0" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-blue-500" />
             </div>
             <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Kecepatan Rata-rata (KM/H)</label>
                <input type="number" value={speed} onChange={e => setSpeed(e.target.value)} placeholder="60" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-blue-500" />
             </div>
          </div>

          <button onClick={handleCalculate} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Navigation size={20} /> Hitung & Simpan
          </button>
        </div>

        {/* RIWAYAT */}
        <div>
           <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><History size={18} className="text-slate-400" /> Riwayat Safar</h3>
              <button onClick={deleteHistory} className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors"><Trash2 size={18}/></button>
           </div>
           
           <div className="space-y-3">
              {travelHistory.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs italic bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">Belum ada riwayat perjalanan.</div>
              ) : travelHistory.map(item => (
                <div key={item.id} className={`p-4 rounded-2xl border bg-white dark:bg-slate-900 transition-all ${item.eligible ? 'border-green-100 dark:border-green-900/30' : 'border-red-100 dark:border-red-900/30'}`}>
                   <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.origin} → {item.destination}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">{item.date}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${item.eligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.eligible ? 'Boleh Jamak' : 'Jarak Kurang'}
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-500"><Navigation size={14} /> {item.distance} KM</div>
                      <div className="flex items-center gap-2 text-slate-500"><Clock size={14} /> ETA: {item.eta}</div>
                   </div>
                   {item.eligible && (
                     <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400 italic">
                          <BookOpen size={10} className="inline mr-1"/> "Diperbolehkan meng-qoshor shalat bagi musafir jika jaraknya mencapai 16 Farsakh (±80.64 km)." <strong>(Fathul Qorib)</strong>
                        </p>
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      </div>
        {/* Share Feature Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-indigo-950 dark:to-blue-900 rounded-[2.5rem] p-6 text-white shadow-xl shadow-blue-100 dark:shadow-none relative overflow-hidden mt-6 text-left">
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0">
                <Share2 size={24} />
              </div>
              <div>
                <h3 className="font-black text-sm text-white">Bagikan Fitur Ini 🌸</h3>
                <p className="text-[10px] font-bold text-blue-100 uppercase tracking-tight">Bantu musafir lainnya menghitung kelayakan Shalat Jamak Qashar</p>
              </div>
            </div>
            <button 
              onClick={handleShareFeature}
              className="w-full sm:w-auto px-5 py-3.5 bg-white text-blue-600 hover:bg-blue-50 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 font-bold shrink-0"
            >
              <Share2 size={14} /> Bagikan
            </button>
          </div>
        </div>
    </div>
  );
};

export default TravelCalculatorScreen;
