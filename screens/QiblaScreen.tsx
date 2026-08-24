
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { ArrowLeft, Compass, MapPin, Navigation, RefreshCw, Smartphone, CheckCircle, Info, BookOpen, ChevronDown } from 'lucide-react';

const KAABA_COORDS = { lat: 21.422487, lng: 39.826206 };

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
          <pattern id="islamic-grid-qibla" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" />
            <path d="M12 5 L19 12 L12 19 L5 12 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
            <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#islamic-grid-qibla)" />
      </svg>
    </div>
  );
};

const QiblaScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [showQiblaGuide, setShowQiblaGuide] = useState(true);
  
  // State
  const [heading, setHeading] = useState<number>(0); // Arah hadap HP (0 = Utara)
  const [qiblaBearing, setQiblaBearing] = useState<number>(0); // Sudut Ka'bah dari Utara
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // --- 1. CALCULATE QIBLA ANGLE (Great Circle) ---
  const calculateQibla = (lat: number, lng: number) => {
    const PI = Math.PI;
    const lat1 = (lat * PI) / 180;
    const lng1 = (lng * PI) / 180;
    const lat2 = (KAABA_COORDS.lat * PI) / 180;
    const lng2 = (KAABA_COORDS.lng * PI) / 180;

    const dLng = lng2 - lng1;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    
    let brng = Math.atan2(y, x);
    brng = (brng * 180) / PI;
    brng = (brng + 360) % 360; // Normalize to 0-360

    return brng;
  };

  // --- 2. GET LOCATION ---
  useEffect(() => {
    // Detect iOS
    const isIOSDevice = [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    setIsIOS(isIOSDevice);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          const bearing = calculateQibla(latitude, longitude);
          setQiblaBearing(bearing);
        },
        (err) => {
          console.error(err);
          setError("Izin lokasi diperlukan untuk menghitung arah Ka'bah.");
          // Fallback Jakarta default if denied
          setQiblaBearing(295.15); 
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setError("Perangkat tidak mendukung Geolocation.");
    }
  }, []);

  // --- 3. HANDLE DEVICE ORIENTATION (COMPASS) ---
  const handleOrientation = useCallback((event: any) => {
    let compass = 0;
    
    // iOS (WebKit) Specific - Uses Magnetic North usually
    if (event.webkitCompassHeading) {
      // iOS is clockwise, 0 is North. Exactly what we need.
      compass = event.webkitCompassHeading;
    } 
    // Android / Standard - Absolute
    else if (event.absolute && event.alpha !== null) {
      // event.alpha is counter-clockwise, 0 is North.
      // Convert to Clockwise Compass Heading: 360 - alpha
      compass = 360 - event.alpha;
    }
    // Fallback for non-absolute events (might point to initial direction instead of North)
    else if (event.alpha !== null) {
       compass = 360 - event.alpha;
    }

    // Normalize to 0-360
    compass = (compass + 360) % 360;

    // Smoothing/Damping could be added here, but CSS transition usually handles it well enough for basic use.
    setHeading(compass);
  }, []);

  const requestAccess = async () => {
    // iOS 13+ requires permission request
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setError("Izin akses sensor kompas ditolak.");
        }
      } catch (e) {
        setError("Gagal meminta izin sensor.");
      }
    } else {
      // Non-iOS or older devices
      setPermissionGranted(true);
      // Android often splits relative vs absolute. Absolute is better for Compass.
      // Cast window to any to check for 'ondeviceorientationabsolute' to avoid TS narrowing window to never
      if ('ondeviceorientationabsolute' in (window as any)) {
        (window as any).addEventListener('deviceorientationabsolute', handleOrientation);
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }
  };

  useEffect(() => {
    // Auto-start for Android/Non-iOS 13+
    if (!permissionGranted && !(typeof (DeviceOrientationEvent as any).requestPermission === 'function')) {
        setPermissionGranted(true);
        // Cast window to any to check for 'ondeviceorientationabsolute'
        if ('ondeviceorientationabsolute' in (window as any)) {
            (window as any).addEventListener('deviceorientationabsolute', handleOrientation);
        } else {
            window.addEventListener('deviceorientation', handleOrientation);
        }
    }
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      // Cast window to any to check for 'ondeviceorientationabsolute'
      if ('ondeviceorientationabsolute' in (window as any)) {
        (window as any).removeEventListener('deviceorientationabsolute', handleOrientation);
      }
    };
  }, []);

  // --- VISUAL CALCULATION ---
  
  // Logic:
  // We rotate the Compass Dial opposite to Heading so North stays North visually.
  // The Qibla Needle rotates relative to the Dial.
  
  // isAligned: Threshold 3 degrees
  const angleDiff = Math.abs(heading - qiblaBearing);
  const isAligned = angleDiff < 3 || Math.abs(angleDiff - 360) < 3;

  // Haptic Feedback when aligned (Throttle to prevent spamming)
  useEffect(() => {
    if (isAligned && navigator.vibrate) {
        navigator.vibrate(20); 
    }
  }, [isAligned]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 flex flex-col text-left">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#005a2b] dark:bg-emerald-950 text-white shadow-md relative overflow-hidden pt-5 pb-4 px-4 rounded-b-[1.5rem] flex items-center justify-between gap-3 mb-4">
        <IslamicPattern className="text-white opacity-[0.14]" />
        <div className="flex items-center gap-3 relative z-10 overflow-hidden">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-bold text-white text-base md:text-lg flex items-center gap-2 truncate">
            <Compass size={20} className="text-emerald-300 dark:text-santri-gold flex-shrink-0" />
            <span className="truncate">Kompas Kiblat</span>
          </h2>
        </div>

        <button 
          onClick={() => navigate('/settings')} 
          className="relative active:scale-90 transition-all flex-shrink-0 z-10"
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

      <div className="p-4 max-w-lg mx-auto w-full space-y-4">
        {/* Panduan Kiblat & Dalil Al-Qur'an Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <button 
            onClick={() => setShowQiblaGuide(!showQiblaGuide)} 
            className="w-full p-4 flex items-center justify-between bg-teal-50/50 dark:bg-teal-950/20 border-b border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm">
              <BookOpen size={18} />
              <span>Panduan Syar'i & Dalil Kiblat</span>
            </div>
            <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${showQiblaGuide ? 'rotate-180' : ''}`} />
          </button>
          
          {showQiblaGuide && (
            <div className="p-4 space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-950">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Kewajiban Menghadap Kiblat</h4>
                <p>Menghadap Ka’bah Baitullah di Makkah adalah salah satu syarat sah shalat yang wajib dipenuhi oleh setiap Muslim, baik secara yakin (fisik) bagi yang dekat, maupun secara dugaan kuat (arah kompas) bagi yang berjauhan.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">Dalil Penting Al-Qur'an:</p>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-705 dark:text-slate-305">1. Perintah Memalingkan Wajah ke Masjidil Haram:</p>
                  <p className="italic">"Maka palingkanlah mukamu ke arah Masjidil Haram. Dan di mana saja kamu berada, palingkanlah mukamu ke arahnya."</p>
                  <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400">(QS. Al-Baqarah: 149)</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Ketentuan Istihadah (Ijtihad Kiblat)</h4>
                <p>Umat Islam yang berada jauh dari Ka'bah dihukumi sah shalatnya dengan menghadap "arah" (jihat) Ka'bah, didukung oleh tanda-tanda alam sekeliling, bayangan matahari, rasi bintang, atau alat bantu kompas digital.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center p-6 relative overflow-hidden justify-between">
        
        {/* Permission Request (iOS mostly) */}
        {!permissionGranted && isIOS && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                <Smartphone size={48} className="text-white mb-4 animate-pulse" />
                <h3 className="text-xl font-bold text-white mb-2">Izin Kompas Diperlukan</h3>
                <p className="text-slate-300 text-sm mb-6">Izinkan akses sensor gerak agar kompas dapat bekerja dengan akurat di perangkat Anda.</p>
                <button 
                  onClick={requestAccess}
                  className="px-6 py-3 bg-santri-green text-white rounded-full font-bold shadow-lg active:scale-95 transition-transform"
                >
                    Izinkan Sensor
                </button>
            </div>
        )}

        {/* Location Info & Status */}
        <div className="w-full flex justify-between items-start mb-4 z-10 flex-shrink-0">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                    <MapPin size={14} className="text-red-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Lokasi</span>
                </div>
                <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                    {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Mencari..."}
                </p>
            </div>
            
            <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-3 rounded-2xl border shadow-sm text-right transition-colors ${isAligned ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-200 dark:border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-1 justify-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Target</span>
                    <Navigation size={14} className={isAligned ? "text-green-600" : "text-santri-green"} />
                </div>
                <p className={`text-xs font-mono font-bold ${isAligned ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {qiblaBearing.toFixed(1)}°
                </p>
            </div>
        </div>

        {/* COMPASS CONTAINER */}
        <div className="relative flex-1 w-full flex items-center justify-center">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex-shrink-0">
                {/* Outer Ring & Indicator */}
                <div className={`absolute -inset-4 rounded-full border-4 transition-all duration-300 ${isAligned ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)] scale-105' : 'border-slate-200 dark:border-slate-700'}`}></div>
                
                {/* Top Triangle Indicator (Your Phone) */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <div className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[16px] transition-colors ${isAligned ? 'border-b-green-500' : 'border-b-red-500'}`}></div>
                </div>

                {/* ROTATING DIAL (The Compass Plate) */}
                <div 
                    className="w-full h-full rounded-full relative transition-transform duration-300 ease-out will-change-transform bg-white dark:bg-slate-800 shadow-2xl border border-slate-100 dark:border-slate-700"
                    style={{ transform: `rotate(${-heading}deg)` }}
                >
                    {/* Cardinal Points */}
                    <span className="absolute top-3 left-1/2 -translate-x-1/2 font-bold text-red-500 text-lg">N</span>
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-bold text-slate-400 text-lg">S</span>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">E</span>
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">W</span>

                    {/* Degree Ticks */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                        <div 
                            key={deg}
                            className="absolute w-full h-full left-0 top-0 pointer-events-none"
                            style={{ transform: `rotate(${deg}deg)` }}
                        >
                            <div className={`mx-auto mt-1 ${deg % 90 === 0 ? 'w-1 h-3 bg-slate-400 dark:bg-slate-500' : 'w-0.5 h-2 bg-slate-200 dark:bg-slate-700'}`}></div>
                        </div>
                    ))}

                    {/* QIBLA POINTER (Fixed relative to North on the dial) */}
                    <div 
                        className="absolute w-full h-full left-0 top-0 transition-opacity duration-500"
                        style={{ transform: `rotate(${qiblaBearing}deg)` }}
                    >
                        <div className="flex flex-col items-center pt-10 h-full">
                            {/* Kaaba Icon Container */}
                            <div className={`relative transition-all duration-300 ${isAligned ? 'scale-125' : 'scale-100'}`}>
                                {/* The Arrow */}
                                <div className="flex flex-col items-center">
                                    {/* Pointer Head */}
                                    <div className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[24px] ${isAligned ? 'border-b-green-600 drop-shadow-[0_0_10px_rgba(22,163,74,0.8)]' : 'border-b-santri-gold'}`}></div>
                                    {/* Kaaba Icon */}
                                    <div className="mt-1 w-10 h-10 bg-black border-2 border-amber-400 rounded-md relative shadow-md flex items-center justify-center">
                                    <div className="w-full h-[2px] bg-amber-400 absolute top-2.5"></div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Guideline from center to Kaaba */}
                            <div className={`w-0.5 h-[35%] mt-1 rounded-full ${isAligned ? 'bg-green-500/50' : 'bg-amber-400/30'}`}></div>
                        </div>
                    </div>

                </div>

                {/* Center Pivot */}
                <div className="absolute w-3 h-3 bg-slate-300 dark:bg-slate-600 rounded-full border-2 border-white dark:border-slate-800 z-20 shadow-sm top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            </div>
        </div>

        {/* BOTTOM SECTION: Status & Controls (Grouped to prevent overlap) */}
        <div className="w-full flex-shrink-0 flex flex-col items-center gap-3 z-10 mt-4 pb-2">
            
            {/* Status Text & Guidance */}
            <div className="text-center px-4 w-full">
                {isAligned ? (
                    <div className="animate-in zoom-in duration-300 py-3 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
                        <h2 className="text-xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-2 mb-1">
                            <CheckCircle size={24} className="fill-current" />
                            ARAH KIBLAT TEPAT
                        </h2>
                        <p className="text-green-700/70 dark:text-green-300/70 text-sm">Sholatlah menghadap arah ini.</p>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-100 mb-2">
                            {Math.round(heading)}°
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm bg-slate-100 dark:bg-slate-800 py-2 px-4 rounded-full w-fit mx-auto shadow-sm">
                            <Smartphone size={16} className="animate-pulse" />
                            <span>Putar badan mencari ikon Ka'bah</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="px-4 py-2 bg-red-50 text-red-600 text-xs rounded-xl text-center max-w-[90%] border border-red-100 shadow-sm flex items-center justify-center gap-2">
                    <Info size={16} /> {error}
                </div>
            )}

            {/* Calibration Button */}
            <button 
               onClick={() => setCalibrationMode(!calibrationMode)}
               className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-santri-green transition-colors py-2"
            >
               <RefreshCw size={14} /> 
               {calibrationMode ? "Tutup Tips" : "Kompas Tidak Akurat?"}
            </button>
        </div>

        {/* Calibration Modal */}
        {calibrationMode && (
            <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 z-40 flex flex-col items-center justify-center p-8 text-center animate-in fade-in backdrop-blur-sm">
                <RefreshCw size={64} className="text-santri-green mb-6 animate-spin-slow opacity-80" />
                <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 mb-3">Kalibrasi Kompas</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-8 leading-relaxed max-w-xs">
                    Gerakkan HP Anda membentuk angka <strong>8</strong> (delapan) di udara beberapa kali untuk mengkalibrasi sensor.
                    <br/><br/>
                    Pastikan jauh dari benda logam, magnet, atau casing HP bermagnet.
                </p>
                <button 
                   onClick={() => setCalibrationMode(false)}
                   className="px-8 py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-transform"
                >
                   Saya Mengerti
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default QiblaScreen;
