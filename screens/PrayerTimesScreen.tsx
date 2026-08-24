
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrayer } from '../contexts/PrayerContext';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { 
  ArrowLeft, MapPin, ChevronLeft, ChevronRight, Compass, RefreshCw, Bell, BellOff, VolumeX,
  Sunrise, Sun, Moon, Cloud, Sunset, Settings, Volume2, XCircle, Share2, Info, CloudMoon, CloudSun,
  Loader2, MoonStar
} from 'lucide-react';

const HIJRI_MONTHS_ID: Record<string, string> = {
  "Muharram": "Muharram", "Safar": "Safar", "Rabi' al-Awwal": "Rabiul Awal", "Rabi' al-Thani": "Rabiul Akhir",
  "Jumada al-Ula": "Jumadil Awal", "Jumada al-Akhirah": "Jumadil Akhir", "Rajab": "Rajab", "Sha'ban": "Sya'ban",
  "Ramadan": "Ramadhan", "Shawwal": "Syawal", "Dhu al-Qi'dah": "Dzulkaidah", "Dhu al-Hijjah": "Dzulhijjah",
  "Rabi al-Awwal": "Rabiul Awal", "Rabi al-Thani": "Rabiul Akhir", "Jumada al-Awwal": "Jumadil Awal", 
  "Jumada al-Thani": "Jumadil Akhir", "Dhul Qidah": "Dzulkaidah", "Dhul Hijjah": "Dzulhijjah",
  "Rabiʻ I": "Rabiul Awal", "Rabiʻ II": "Rabiul Akhir"
};

const CALCULATION_METHODS = [
  { id: 20, name: "Kementerian Agama RI (Kemenag)" },
  { id: 3, name: "Muslim World League (MWL)" },
  { id: 2, name: "Islamic Society of North America (ISNA)" },
  { id: 4, name: "Umm Al-Qura University, Makkah" },
  { id: 5, name: "Egyptian General Authority of Survey" },
  { id: 11, name: "Majlis Ugama Islam Singapura (MUIS)" },
  { id: 1, name: "University of Islamic Sciences, Karachi" }
];

const ASHAR_SCHOOLS = [
  { id: 0, name: "Mazhab Syafi'i, Maliki, Hanbali (Standard)" },
  { id: 1, name: "Mazhab Hanafi" }
];

const PrayerTimesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  const { 
    prayerData, locationName, loading, nextPrayer, countdown, 
    refreshLocation, notifications, 
    isAdzanPlaying, activePrayerName, stopAdzan,
    date, setDate, alarmTime, setAlarmTime, 
    soundSettings,
    asharSchool, setAsharSchool,
    calculationMethod, setCalculationMethod,
    ihtiyath, setIhtiyath,
    coords,
    getHijriDate,
    hijriAdjustment,
    setHijriAdjustment
  } = usePrayer();

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  useEffect(() => {
    if (isSettingsOpen) {
      if (window.AndroidNativeInterface && typeof window.AndroidNativeInterface.requestBatteryOptimizationExemption === 'function') {
        try {
          window.AndroidNativeInterface.requestBatteryOptimizationExemption();
        } catch (e) {
          console.error("Failed to request battery exemption:", e);
        }
      }
    }
  }, [isSettingsOpen]);

  const handleIhtiyathChange = (key: 'Subuh' | 'Zuhur' | 'Ashar' | 'Maghrib' | 'Isya', increment: boolean) => {
    const currentVal = ihtiyath[key] || 0;
    const newVal = Math.max(-10, Math.min(20, currentVal + (increment ? 1 : -1)));
    setIhtiyath({
      ...ihtiyath,
      [key]: newVal
    });
  };

  const handlePrevDay = () => { const newDate = new Date(date); newDate.setDate(date.getDate() - 1); setDate(newDate); };
  const handleNextDay = () => { const newDate = new Date(date); newDate.setDate(date.getDate() + 1); setDate(newDate); };
  
  const getDisplayTime = (timeStr: string, offset = 0) => {
    if (!timeStr) return '--:--';
    const clean = timeStr.split(' ')[0];
    if (offset === 0) return clean;
    const [h, m] = clean.split(':').map(Number);
    const d = new Date(); d.setHours(h, m + offset);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const getIndoHijriMonth = (en: string) => HIJRI_MONTHS_ID[en] || en;

  const prayerListConfig = [
    { key: 'Imsak', label: 'Imsak', icon: CloudMoon },
    { key: 'Subuh', label: 'Subuh', icon: CloudSun },
    { key: 'Terbit', label: 'Terbit', icon: Sunrise },
    { key: 'Dhuha', label: 'Dhuha', icon: Sun, offset: 20 },
    { key: 'Zuhur', label: 'Zuhur', icon: Sun },
    { key: 'Ashar', label: 'Ashar', icon: CloudSun },
    { key: 'Maghrib', label: 'Maghrib', icon: Sunset },
    { key: 'Isya', label: 'Isya', icon: Moon },
  ];

  const handleOpenNotificationSettings = (prayerName: string) => {
    navigate('/prayer-notification', { state: { prayerName } });
  };

  const isFriday = date ? date.getDay() === 5 : false;

  const getNotificationIcon = (key: string, isActive: boolean) => {
    if (isFriday && key === 'Zuhur') return <VolumeX size={20} className="text-red-500" />;
    if (!isActive) return <BellOff size={20} />;
    const soundId = soundSettings[key];
    if (soundId === 'silent') return <VolumeX size={20} />;
    return <Bell size={20} fill="currentColor" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 relative font-sans">
      
      {isAdzanPlaying && (
        <div className="fixed inset-0 z-50 bg-santri-green/95 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in duration-500">
           <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6 animate-pulse">
              <Volume2 size={48} />
           </div>
           <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-wide text-center px-4">
             {activePrayerName?.startsWith('Pasca') 
               ? `Pengingat: 10 Menit ${activePrayerName}`
               : (activePrayerName === 'Imsak' || activePrayerName === 'Terbit' || activePrayerName === 'Dhuha' || activePrayerName === 'Alarm'
                   ? `Waktu ${activePrayerName || ''}` 
                   : `Saatnya ${activePrayerName || ''}`)}
           </h2>
           <p className="text-white/80 mb-8">{locationName}</p>
           <button onClick={stopAdzan} className="px-8 py-3 bg-white text-santri-green rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
             <XCircle size={20} /> Matikan Suara
           </button>
        </div>
      )}

      <div className="bg-gradient-to-br from-santri-green to-santri-green-dark dark:from-green-900 dark:to-green-950 text-white pt-2 pb-10 relative overflow-hidden">
         {/* Islamic Pattern Watermark - 8 Pointed Star */}
         <div className="absolute inset-0 opacity-[0.12] pointer-events-none" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z'/%3E%3Cpath d='M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 Z' transform='rotate(45 60 60)'/%3E%3Cpath d='M60 30 L67 53 L90 60 L67 67 L60 90 L53 67 L30 60 L53 53 Z' stroke-width='1' opacity='0.7'/%3E%3Cpath d='M60 30 L67 53 L90 60 L67 67 L60 90 L53 67 L30 60 L53 53 Z' stroke-width='1' opacity='0.7' transform='rotate(45 60 60)'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px'
         }}></div>
         <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent"></div>

         <div className="relative z-10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                  <ArrowLeft size={24} />
               </button>
               <h1 className="text-xl font-bold">Jadwal Shalat</h1>
            </div>
         </div>

         <div className="relative z-10 text-center mt-2 px-4">
            <h2 className="text-3xl font-bold mb-2 drop-shadow-md tracking-tight">
               {nextPrayer ? `${nextPrayer.name} ${(nextPrayer.time || '').split(' ')[0]}` : '--:--'}
            </h2>
            <div className="flex justify-center mb-3">
               <p className="text-base font-bold text-white bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-2xl border border-white/5 font-mono tracking-wide">
                  - {countdown || "00:00:00"}
               </p>
            </div>

            <div className="flex items-center justify-center gap-3 mb-5">
               <div className="flex items-center gap-1.5 text-green-50 font-medium text-sm drop-shadow-sm">
                  <MapPin size={16} className="text-santri-gold fill-santri-gold" />
                  <span>{locationName}</span>
               </div>
               <button 
                 onClick={() => refreshLocation()} 
                 className="text-xs font-black bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border border-white/30 shadow-sm backdrop-blur-md"
               >
                 <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                 Ganti Lokasi
               </button>
            </div>

            <div className="flex justify-center items-center gap-4 px-4 text-xs font-medium">
               <button onClick={() => navigate('/qibla')} className="flex-1 max-w-[160px] flex items-center justify-center gap-2 hover:bg-rose-700/90 hover:text-white transition-all bg-rose-600 px-3 py-2.5 rounded-full text-sm font-bold shadow-lg border border-rose-500/20 text-white">
                  <Compass size={16} /> Arah Kiblat
               </button>
               <button onClick={() => setIsSettingsOpen(true)} className="flex-1 max-w-[160px] flex items-center justify-center gap-2 hover:text-white transition-all bg-white/20 hover:bg-white/30 px-3 py-2.5 rounded-full text-sm font-bold shadow-lg border border-white/10 backdrop-blur-md text-white">
                  <Settings size={16} /> Pengaturan
               </button>
            </div>
         </div>
      </div>

      <div className="px-4 -mt-8 relative z-20">
         <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-4 flex items-center justify-center relative min-h-[80px]">
            <button onClick={handlePrevDay} className="absolute left-2 p-2 text-slate-400 hover:text-santri-green transition-colors z-10">
               <ChevronLeft size={24} />
            </button>
            
            <div className="text-center w-full px-10">
               <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base md:text-lg">
                 {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
               </h3>
               <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {(() => {
                    const h = getHijriDate(date);
                    return h.day ? `${h.day} ${h.monthName} ${h.yearStr} H` : '...';
                  })()}
               </p>
            </div>

            <button onClick={handleNextDay} className="absolute right-2 p-2 text-slate-400 hover:text-santri-green transition-colors z-10">
               <ChevronRight size={24} />
            </button>
         </div>
      </div>

      <div className="px-4 mt-6 mb-2">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900 p-4 shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => handleOpenNotificationSettings('Alarm')}>
              <div className="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg">
                 <MoonStar size={24} />
              </div>
              <div>
                 <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Alarm</h3>
                 <p className="text-xs text-slate-500">Pengingat Manual</p>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <input 
                type="time" 
                value={alarmTime} 
                onChange={(e) => setAlarmTime(e.target.value)} 
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 font-mono"
              />
              <button 
                onClick={() => handleOpenNotificationSettings('Alarm')}
                className={`transition-colors p-1 ${notifications['Alarm'] ? 'text-indigo-500' : 'text-slate-300 dark:text-slate-600'}`}
              >
                 {getNotificationIcon('Alarm', notifications['Alarm'])}
              </button>
           </div>
        </div>
      </div>

      <div className="px-4 mt-2 pb-8 space-y-2">
         {prayerData ? (
            prayerListConfig.map((item, idx) => {
               const Icon = item.icon;
               const apiKeyMap: Record<string, string> = { 'Subuh': 'Fajr', 'Terbit': 'Sunrise', 'Zuhur': 'Dhuhr', 'Ashar': 'Asr', 'Isya': 'Isha' };
               const apiProperty = apiKeyMap[item.key] || item.key;
               const timeRaw = item.key === 'Dhuha' ? prayerData.timings.Sunrise : (prayerData.timings as any)[apiProperty];
               const displayTime = getDisplayTime(timeRaw, item.offset);
               const isActive = notifications[item.key as keyof typeof notifications];
               
               return (
                  <div key={idx} className="flex items-center justify-between py-3.5 px-2 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors group">
                     <div 
                        className="flex items-center gap-4 flex-1 cursor-pointer"
                        onClick={() => handleOpenNotificationSettings(item.key)}
                     >
                        <div className="text-slate-400 dark:text-slate-500 group-hover:text-santri-green dark:group-hover:text-santri-gold transition-colors">
                           <Icon size={22} />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2">
                           {item.label}
                           {isFriday && item.key === 'Zuhur' && (
                              <span className="text-[9px] bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-amber-300/40">
                                 <VolumeX size={11} /> Suara Adzan Matikan Otomatis (Jum'at)
                              </span>
                           )}
                        </span>
                     </div>
                     
                     <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm font-mono">
                           {displayTime}
                        </span>
                        <button 
                          onClick={() => handleOpenNotificationSettings(item.key)}
                          className={`transition-colors p-1 ${isActive ? 'text-santri-green dark:text-santri-gold' : 'text-slate-300 dark:text-slate-600'}`}
                        >
                           {getNotificationIcon(item.key, isActive)}
                        </button>
                     </div>
                  </div>
               );
            })
         ) : (
            <div className="text-center py-10 text-slate-400">Memuat jadwal...</div>
         )}
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[300] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 pb-20 sm:pb-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 relative flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Settings className="text-santri-green dark:text-santri-gold" size={24} />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Pengaturan Waktu Shalat</h3>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 px-2.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-6">
              
              {/* Lokasi Saat Ini */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">📍 Lokasi Perhitungan Saat Ini</h4>
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    {locationName}
                  </p>
                  {coords ? (
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">Koordinat tidak tersedia</p>
                  )}
                </div>
              </div>

              {/* Mazhab Ashar */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">🕌 Metode Perhitungan Ashar (Mazhab)</h4>
                <div className="space-y-2">
                  {ASHAR_SCHOOLS.map(sc => (
                    <label 
                      key={sc.id} 
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <input 
                        type="radio" 
                        name="asharSchool" 
                        value={sc.id}
                        checked={asharSchool === sc.id}
                        onChange={() => setAsharSchool(sc.id)}
                        className="mt-0.5 text-santri-green focus:ring-santri-green dark:text-santri-gold"
                      />
                      <div className="text-xs">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{sc.name}</p>
                        <p className="text-slate-500 mt-1 leading-relaxed">
                          {sc.id === 0 
                            ? "Syafi'i, Maliki, Hanbali: Awal waktu Ashar adalah saat panjang bayangan benda sama dengan tinggi benda tersebut ditambah bayangan ketika tengah hari." 
                            : "Hanafi: Awal waktu Ashar adalah saat panjang bayangan benda dua kali lipat panjang benda tersebut ditambah bayangan ketika tengah hari."}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Metode Standar */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">⚙️ Metode Perhitungan Waktu</h4>
                <select 
                  value={calculationMethod}
                  onChange={(e) => setCalculationMethod(Number(e.target.value))}
                  className="w-full text-sm bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-santri-green dark:focus:ring-santri-gold transition-all"
                >
                  {CALCULATION_METHODS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Ihtiyath (Menit Pengaman) */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                  <span>⏱️ Ihtiyath (Menit Pengaman)</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <strong>Apa itu Ihtiyath?</strong> Ihtiyath adalah tambahan waktu beberapa menit yang dimasukkan ke dalam perhitungan jadwal shalat untuk menjamin waktu shalat telah benar-benar masuk secara pasti dan hati-hati.
                </p>

                <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800">
                  {(['Subuh', 'Zuhur', 'Ashar', 'Maghrib', 'Isya'] as const).map(pKey => {
                    const val = ihtiyath[pKey] || 0;
                    return (
                      <div key={pKey} className="flex items-center justify-between p-3 px-4">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{pKey === 'Subuh' ? 'Subuh' : pKey}</span>
                        <div className="flex items-center gap-3">
                          <button 
                            type="button"
                            onClick={() => handleIhtiyathChange(pKey, false)}
                            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 hover:scale-105 rounded-full text-slate-700 dark:text-slate-200 transition-all font-bold text-sm"
                          >
                            -
                          </button>
                          <span className={`text-sm font-bold font-mono min-w-[50px] text-center ${val > 0 ? 'text-santri-green dark:text-santri-gold' : val < 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                            {val >= 0 ? `+${val}` : val} mnt
                          </span>
                          <button 
                            type="button"
                            onClick={() => handleIhtiyathChange(pKey, true)}
                            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 hover:scale-105 rounded-full text-slate-700 dark:text-slate-200 transition-all font-bold text-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Koreksi Tanggal Hijriah */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                  <span>🌙 Koreksi Tanggal Hijriah</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  Gunakan fitur ini jika tanggal Hijriah di sistem berbeda 1 atau 2 hari dengan ketetapan hilal/pemerintah setempat (Kemenag RI).
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {[-2, -1, 0, 1, 2].map((adj) => (
                    <button
                      key={adj}
                      type="button"
                      onClick={() => setHijriAdjustment(adj)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        hijriAdjustment === adj
                          ? 'bg-santri-green text-white border-santri-green dark:bg-santri-gold dark:text-slate-950 dark:border-santri-gold shadow-sm scale-105'
                          : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                    >
                      {adj > 0 ? `+${adj}` : adj === 0 ? '0' : adj} Hari
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 flex justify-end">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-santri-green text-white hover:bg-santri-green-dark dark:bg-santri-gold dark:text-slate-950 dark:hover:bg-opacity-90 rounded-xl text-sm font-bold shadow-md transition-all"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PrayerTimesScreen;
