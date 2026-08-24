
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Compass, 
  Search, 
  Star, 
  Phone, 
  ExternalLink, 
  Loader2, 
  Map,
  Home,
  School,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { findNearbyIslamicPlaces } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';
import { usePrayer } from '../contexts/PrayerContext';

const NearbyPlacesScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { locationName } = usePrayer();
  
  const type = searchParams.get('type') === 'pesantren' ? 'pesantren' : 'masjid';
  const label = type === 'pesantren' ? 'Pesantren Terdekat' : 'Masjid Terdekat';
  const icon = type === 'pesantren' ? <School size={24} /> : <Navigation size={24} />;
  
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

  const fetchPlaces = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await findNearbyIslamicPlaces(type, lat, lng, locationName);
      setPlaces(data);
    } catch (err: any) {
      console.error(err);
      setError("Gagal mendapatkan data lokasi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          fetchPlaces(latitude, longitude);
        },
        (err) => {
          console.error(err);
          setError("Izin lokasi ditolak atau tidak tersedia. Mencari berdasarkan lokasi default...");
          // Fallback to locationName if available
          fetchPlaces(-6.2000, 106.8166); // Jakarta as fallback
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation tidak didukung oleh browser ini.");
      fetchPlaces(-6.2000, 106.8166);
    }
  }, [type]);

  const handleRefresh = () => {
    if (coords) {
      fetchPlaces(coords.lat, coords.lng);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 py-4 flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="font-black text-lg text-slate-800 dark:text-white leading-tight">{label}</h1>
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
            <MapPin size={10} /> {locationName || 'Mencari Lokasi...'}
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          className="ml-auto p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
          disabled={loading}
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <div className="max-w-xl mx-auto p-4 space-y-6">
        {/* Banner */}
        <div className={`relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-2xl ${type === 'pesantren' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
          <div className="relative z-10">
            <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
              {icon}
            </div>
            <h2 className="text-2xl font-black mb-2">Temukan {type === 'pesantren' ? 'Pesantren' : 'Masjid'}</h2>
            <p className="text-sm text-white/80 font-medium leading-relaxed max-w-[80%]">
              {type === 'pesantren' 
                ? "Temukan lembaga pendidikan Islam terpercaya di sekitar Anda untuk memperdalam ilmu agama." 
                : "Cari tempat ibadah terdekat untuk menunaikan kewajiban shalat berjamaah."}
            </p>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12">
            {type === 'pesantren' ? <School size={160} /> : <Navigation size={160} />}
          </div>
        </div>

        {/* List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {loading ? 'Mencari Lokasi...' : `${places.length} Tempat Ditemukan`}
            </h3>
            {!loading && coords && (
               <span className="text-[10px] font-bold text-slate-300 italic">Berdasarkan GPS Aktif</span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-20 flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <div className={`w-16 h-16 border-4 border-slate-200 rounded-full ${type === 'pesantren' ? 'border-t-indigo-500' : 'border-t-emerald-500'} animate-spin`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Compass className="text-slate-200 animate-pulse" size={24} />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-800 dark:text-white">Mencari {type}...</p>
                  <p className="text-xs text-slate-400 font-medium">Menyesuaikan dengan titik koordinat Anda</p>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 bg-rose-50 dark:bg-rose-900/10 rounded-[2rem] border border-rose-100 dark:border-rose-900/20 text-center space-y-4"
              >
                <AlertCircle size={40} className="text-rose-500 mx-auto" />
                <div>
                  <h4 className="font-black text-rose-800 dark:text-rose-400">Oops! Terjadi Masalah</h4>
                  <p className="text-xs text-rose-600/70 font-medium">{error}</p>
                </div>
                <button 
                  onClick={handleRefresh}
                  className="px-6 py-2 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest"
                >
                  Coba Lagi
                </button>
              </motion.div>
            ) : places.length > 0 ? (
              <div className="space-y-4">
                {places.map((place, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${type === 'pesantren' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'}`}>
                        {type === 'pesantren' ? <School size={22} /> : <Navigation size={22} />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-slate-800 dark:text-white group-hover:text-emerald-500 transition-colors leading-tight">
                            {place.name}
                          </h4>
                          <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-lg">
                            <Star size={10} className="text-amber-500 fill-amber-500" />
                            <span className="text-[10px] font-black text-amber-600">{place.rating || '4.5'}</span>
                          </div>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                          <MapPin size={10} /> {place.distance || 'Sekitar Anda'} — {place.address}
                        </p>
                        {place.desc && (
                           <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg italic">
                              "{place.desc}"
                           </p>
                        )}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                          <a 
                            href={place.mapsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-emerald-500 hover:text-white transition-all"
                          >
                            <ExternalLink size={12} /> Buka Maps
                          </a>
                          {place.phone && (
                            <a 
                              href={`tel:${place.phone}`}
                              className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all"
                            >
                              <Phone size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-slate-400 font-bold italic">Tidak ada data ditemukan untuk wilayah ini.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Tip Card */}
        <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/20 flex gap-4 items-center">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center shrink-0">
             <Star className="text-indigo-600 dark:text-indigo-400" size={18} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Tips Pencarian</h4>
            <p className="text-[11px] text-indigo-900/60 dark:text-indigo-300 font-medium leading-relaxed">
              Pastikan GPS aktif untuk hasil yang lebih akurat sesuai dengan posisi Anda saat ini.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyPlacesScreen;
