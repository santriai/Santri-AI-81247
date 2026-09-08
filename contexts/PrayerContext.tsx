
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getPrayerTimes, getCityName, getMonthlyPrayerTimes } from '../services/prayerService';
import { PrayerData } from '../types';
import { useToast } from './ToastContext';

interface PrayerContextType {
  prayerData: PrayerData | null;
  locationName: string;
  loading: boolean;
  nextPrayer: { name: string, time: string } | null;
  countdown: string;
  refreshLocation: () => Promise<void>;
  notifications: Record<string, boolean>;
  toggleNotification: (key: string) => void;
  setNotificationStatus: (key: string, status: boolean) => void;
  date: Date;
  setDate: (d: Date) => void;
  alarmTime: string; 
  setAlarmTime: (time: string) => void; 
  soundSettings: Record<string, string>;
  setSoundSetting: (prayerName: string, soundId: string) => void;
  isAdzanPlaying: boolean;
  activePrayerName: string | null;
  stopAdzan: () => void;
  asharSchool: number; // 0 = Standard (Syafi'i, Maliki, Hanbali), 1 = Hanafi
  setAsharSchool: (school: number) => void;
  calculationMethod: number; // Kemenag, MWL, dst.
  setCalculationMethod: (method: number) => void;
  ihtiyath: { Subuh: number; Zuhur: number; Ashar: number; Maghrib: number; Isya: number };
  setIhtiyath: (i: { Subuh: number; Zuhur: number; Ashar: number; Maghrib: number; Isya: number }) => void;
  coords: { lat: number; lng: number } | null;
  hijriAdjustment: number;
  setHijriAdjustment: (adj: number) => void;
  getHijriDate: (d: Date, ignoreMaghribAdjustment?: boolean) => { day: number; month: number; monthName: string; yearStr: string };
}

const PrayerContext = createContext<PrayerContextType | undefined>(undefined);

// Key untuk localStorage
const CACHE_STORAGE_KEY = 'santriai_prayer_cache';

export const PrayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [date, setDate] = useState(new Date());
  const [rawPrayerData, setRawPrayerData] = useState<PrayerData | null>(null);
  const [locationName, setLocationName] = useState(() => {
    return localStorage.getItem('santriai_last_city') || 'Mencari Lokasi...';
  });
  const [loading, setLoading] = useState(true);
  const coordsRef = useRef<{lat: number, lng: number} | null>(
    localStorage.getItem('santriai_last_lat') && localStorage.getItem('santriai_last_lng')
      ? { 
          lat: parseFloat(localStorage.getItem('santriai_last_lat')!), 
          lng: parseFloat(localStorage.getItem('santriai_last_lng')!) 
        }
      : null
  );

  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(() => {
    const savedLat = localStorage.getItem('santriai_last_lat');
    const savedLng = localStorage.getItem('santriai_last_lng');
    return savedLat && savedLng ? { lat: parseFloat(savedLat), lng: parseFloat(savedLng) } : null;
  });

  const isRefreshingRef = useRef(false);
  const [nextPrayer, setNextPrayer] = useState<{ name: string, time: string } | null>(null);
  const [countdown, setCountdown] = useState('');
  
  const [alarmTime, setAlarmTime] = useState(() => localStorage.getItem('santriai_alarm_time') || "03:00");
  
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('santriai_prayer_notifs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          Imsak: true,
          Subuh: true,
          Terbit: true,
          Dhuha: true,
          Zuhur: true,
          Ashar: true,
          Maghrib: true,
          Isya: true,
          Alarm: false,
          ...parsed
        };
      } catch (e) {}
    }
    return {
      Imsak: true, Subuh: true, Terbit: true, Dhuha: true, Zuhur: true, Ashar: true, Maghrib: true, Isya: true, Alarm: false 
    };
  });

  const [soundSettings, setSoundSettings] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('santriai_sound_settings');
    const defaultSounds: Record<string, string> = {
      Terbit: 'default',
      Dhuha: 'default',
      Imsak: 'default',
    };
    return saved ? { ...defaultSounds, ...JSON.parse(saved) } : defaultSounds;
  });

  const SOUND_AUDIO_MAP: Record<string, string> = useMemo(() => ({
    ass_santri_ai: 'https://ia601600.us.archive.org/1/items/assalamualaikumsantriai/assalamualaikum%2CsantriAI.mp3',
    adzan_mekkah: 'https://ia601304.us.archive.org/21/items/Mp3CollectionAdzan/adzan-makkah1%20-.mp3',
    adzan_madinah: 'https://ia800502.us.archive.org/10/items/adzan_201409/Adzan%20H.%20Muammar%20ZA.mp3',
    adzan_aqsa: 'https://pondokislami.com/wp-content/uploads/2024/02/download-suara-adzan-al-aqsa1.mp3',
    adzan_indonesia: 'https://pondokislami.com/wp-content/uploads/2024/02/download-suara-adzan-indonesia.mp3',
    adzan_subuh: 'https://pondokislami.com/wp-content/uploads/2024/02/download-suara-adzan-subuh.mp3',
    adzan_subuh_madinah: 'https://pondokislami.com/wp-content/uploads/2024/02/download-suara-adzan-subuh-madinah.mp3',
    adzan_subuh_abu_hazim: 'https://pondokislami.com/wp-content/uploads/2024/02/download-suara-adzan-subuh-abu-hazim.mp3',
    adzan_abdul_basit: 'https://pondokislami.com/wp-content/uploads/2024/02/download-suara-adzan-abdul-basset.mp3',
    adzan_anak: 'https://pondokislami.com/wp-content/uploads/2024/02/download-suara-adzan-anak-ahmad-saud.mp3',
  }), []);

  const adzanAudioRef = useRef<HTMLAudioElement | null>(null);
  const triggeredPrayersRef = useRef<Set<string>>(new Set());

  // Pengaturan asharSchool, calculationMethod, ihtiyath
  const [asharSchool, setAsharSchoolState] = useState<number>(() => {
    const saved = localStorage.getItem('santriai_ashar_school');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [calculationMethod, setCalculationMethodState] = useState<number>(() => {
    const saved = localStorage.getItem('santriai_calc_method');
    return saved ? parseInt(saved, 10) : 20; // Default Kemenag
  });

  const [ihtiyath, setIhtiyathState] = useState(() => {
    const saved = localStorage.getItem('santriai_ihtiyath');
    return saved ? JSON.parse(saved) : { Subuh: 2, Zuhur: 2, Ashar: 2, Maghrib: 2, Isya: 2 }; // Default 2 menit pengaman
  });

  const setAsharSchool = (school: number) => {
    setAsharSchoolState(school);
    localStorage.setItem('santriai_ashar_school', school.toString());
  };

  const setCalculationMethod = (method: number) => {
    setCalculationMethodState(method);
    localStorage.setItem('santriai_calc_method', method.toString());
  };

  const setIhtiyath = (i: { Subuh: number; Zuhur: number; Ashar: number; Maghrib: number; Isya: number }) => {
    setIhtiyathState(i);
    localStorage.setItem('santriai_ihtiyath', JSON.stringify(i));
  };

  const [isAdzanPlaying, setIsAdzanPlaying] = useState(false);
  const [activePrayerName, setActivePrayerName] = useState<string | null>(null);

  // Memoized adjusted prayerData
  const prayerData = useMemo(() => {
    if (!rawPrayerData) return null;
    
    try {
      const adjusted = JSON.parse(JSON.stringify(rawPrayerData)) as PrayerData;
      const timings = adjusted.timings;
      
      const applyOffset = (timeStr: string, offset: number) => {
        if (!timeStr) return timeStr;
        const clean = timeStr.split(' ')[0];
        const [h, m] = clean.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m + offset);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      };

      timings.Fajr = applyOffset(timings.Fajr, ihtiyath.Subuh || 0);
      timings.Dhuhr = applyOffset(timings.Dhuhr, ihtiyath.Zuhur || 0);
      timings.Asr = applyOffset(timings.Asr, ihtiyath.Ashar || 0);
      timings.Maghrib = applyOffset(timings.Maghrib, ihtiyath.Maghrib || 0);
      timings.Isha = applyOffset(timings.Isha, ihtiyath.Isya || 0);
      
      return adjusted;
    } catch (e) {
      console.error("Gagal menyesuaikan ihtiyath:", e);
      return rawPrayerData;
    }
  }, [rawPrayerData, ihtiyath]);
  
  useEffect(() => {
    localStorage.setItem('santriai_prayer_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('santriai_alarm_time', alarmTime);
  }, [alarmTime]);

  useEffect(() => {
    localStorage.setItem('santriai_sound_settings', JSON.stringify(soundSettings));
  }, [soundSettings]);

  const setSoundSetting = (prayerName: string, soundId: string) => {
    setSoundSettings(prev => ({
      ...prev,
      [prayerName]: soundId,
    }));
  };

  const stopAdzan = useCallback(() => {
    if (adzanAudioRef.current) {
      try {
        adzanAudioRef.current.pause();
        adzanAudioRef.current.currentTime = 0;
      } catch (e) {}
      adzanAudioRef.current = null;
    }
    if (window.AndroidNativeInterface && typeof (window.AndroidNativeInterface as any).pauseQuranAudio === 'function') {
      try {
        (window.AndroidNativeInterface as any).pauseQuranAudio();
      } catch (e) {}
    }
    setIsAdzanPlaying(false);
    setActivePrayerName(null);
  }, []);

  // Jembatan Komunikasi Notifikasi Android -> Banner Aplikasi Web
  useEffect(() => {
    (window as any).triggerAdzanBanner = (prayerName: string) => {
      setActivePrayerName(prayerName || 'Sholat');
      setIsAdzanPlaying(true);
    };
    (window as any).triggerStopAdzan = () => {
      stopAdzan();
    };
    return () => {
      delete (window as any).triggerAdzanBanner;
      delete (window as any).triggerStopAdzan;
    };
  }, [stopAdzan]);

  const [hijriAdjustment, setHijriAdjustmentState] = useState<number>(() => {
    const saved = localStorage.getItem('santriai_hijri_adjustment');
    return saved ? parseInt(saved, 10) : 0;
  });

  const setHijriAdjustment = (adj: number) => {
    setHijriAdjustmentState(adj);
    localStorage.setItem('santriai_hijri_adjustment', adj.toString());
  };

  const getHijriDate = useCallback((d: Date, ignoreMaghribAdjustment: boolean = false) => {
    try {
      const adjustedDate = new Date(d);
      
      // Pergantian hari Hijriah terjadi pada waktu Maghrib sesuai wilayah masing-masing
      if (!ignoreMaghribAdjustment) {
        const isToday = d.toDateString() === new Date().toDateString();
        if (isToday) {
          let maghribHour = 18;
          let maghribMinute = 0;
          if (prayerData && prayerData.timings && prayerData.timings.Maghrib) {
            const cleanMaghrib = prayerData.timings.Maghrib.replace(/\s*\(.*?\)\s*/g, '').trim();
            const [h, m] = cleanMaghrib.split(':').map(Number);
            if (!isNaN(h) && !isNaN(m)) {
              maghribHour = h;
              maghribMinute = m;
            }
          }
          
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          
          if (currentHour > maghribHour || (currentHour === maghribHour && currentMinute >= maghribMinute)) {
            adjustedDate.setDate(adjustedDate.getDate() + 1);
          }
        }
      }

      if (hijriAdjustment !== 0) {
        adjustedDate.setDate(adjustedDate.getDate() + hijriAdjustment);
      }

      const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
        day: 'numeric', month: 'numeric', year: 'numeric'
      }).formatToParts(adjustedDate);
      
      const day = parts.find(p => p.type === 'day')?.value || '';
      const monthNum = parts.find(p => p.type === 'month')?.value || '';
      const yearStr = parts.find(p => p.type === 'year')?.value || '';
      
      const parseHijriMonth = (mStr: string): number => {
        const clean = mStr.replace(/[^0-9]/g, '');
        if (clean) return parseInt(clean, 10);
        const lower = mStr.toLowerCase();
        if (lower.includes('muh')) return 1;
        if (lower.includes('saf')) return 2;
        if (lower.includes('rab') && (lower.includes('1') || lower.includes('aw'))) return 3;
        if (lower.includes('rab') && (lower.includes('2') || lower.includes('ak') || lower.includes('th'))) return 4;
        if (lower.includes('jum') && (lower.includes('1') || lower.includes('aw') || lower.includes('ul'))) return 5;
        if (lower.includes('jum') && (lower.includes('2') || lower.includes('ak') || lower.includes('th'))) return 6;
        if (lower.includes('raj')) return 7;
        if (lower.includes('sha') || lower.includes('sya')) return 8;
        if (lower.includes('ram')) return 9;
        if (lower.includes('shaw') || lower.includes('syaw')) return 10;
        if (lower.includes('qi') || lower.includes('qad') || lower.includes('kaid')) return 11;
        if (lower.includes('hij') || lower.includes('hijj')) return 12;
        return 1;
      };

      const getIndonesianHijriMonthName = (m: number): string => {
        const names = [
          "Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir",
          "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
          "Ramadhan", "Syawal", "Dzulkaidah", "Dzulhijjah"
        ];
        return names[m - 1] || "Muharram";
      };

      const monthInt = parseHijriMonth(monthNum);
      const monthName = getIndonesianHijriMonthName(monthInt);
      
      return { 
        day: parseInt(day), 
        month: monthInt,
        monthName,
        yearStr
      };
    } catch (e) { 
      return { day: 1, month: 1, monthName: '', yearStr: '' }; 
    }
  }, [prayerData, hijriAdjustment]);

  /**
   * Fungsi untuk mendapatkan cache
   */
  const getCachedData = (key: string): PrayerData | null => {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_STORAGE_KEY) || '{}');
      return cache[key] || null;
    } catch (e) { return null; }
  };

  /**
   * Fungsi untuk menyimpan ke cache
   */
  const saveToCache = (key: string, data: PrayerData) => {
    try {
      const cache = JSON.parse(localStorage.getItem(CACHE_STORAGE_KEY) || '{}');
      
      // Bersihkan cache lama (hapus yang bukan hari ini untuk hemat ruang)
      const todayPrefix = new Date().toISOString().split('T')[0];
      const newCache: any = {};
      Object.keys(cache).forEach(k => {
          if (k.startsWith(todayPrefix)) newCache[k] = cache[k];
      });

      newCache[key] = data;
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(newCache));
    } catch (e) { /* Ignore quota errors */ }
  };

  /**
   * Fungsi untuk mendapatkan cache jadwal bulanan
   */
  const getMonthlyCachedData = (year: number, month: number, lat: number, lng: number): any[] | null => {
    try {
      const roundedLat = Math.round(lat * 100) / 100;
      const roundedLng = Math.round(lng * 100) / 100;
      const key = `santriai_monthly_${year}_${month}_${roundedLat}_${roundedLng}_m${calculationMethod}_s${asharSchool}`;
      const cache = localStorage.getItem(key);
      return cache ? JSON.parse(cache) : null;
    } catch (e) {
      return null;
    }
  };

  /**
   * Fungsi untuk menyimpan cache jadwal bulanan
   */
  const saveMonthlyToCache = (year: number, month: number, lat: number, lng: number, data: any[]) => {
    try {
      const roundedLat = Math.round(lat * 100) / 100;
      const roundedLng = Math.round(lng * 100) / 100;
      const key = `santriai_monthly_${year}_${month}_${roundedLat}_${roundedLng}_m${calculationMethod}_s${asharSchool}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Gagal menyimpan cache bulanan:", e);
    }
  };

  const fetchTimes = async (lat: number, lng: number, targetDate: Date) => {
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;
      const dayStr = targetDate.getDate().toString().padStart(2, '0');
      const roundedLat = Math.round(lat * 100) / 100;
      const roundedLng = Math.round(lng * 100) / 100;

      // 1. Coba ambil dari cache bulanan terlebih dahulu
      const cachedMonth = getMonthlyCachedData(year, month, lat, lng);
      if (cachedMonth) {
        const dayIndex = targetDate.getDate() - 1;
        let dayData = cachedMonth[dayIndex];
        if (!dayData || !dayData.date || dayData.date.gregorian?.day !== dayStr) {
          dayData = cachedMonth.find((item: any) => item.date?.gregorian?.day === dayStr);
        }
        if (dayData) {
          setRawPrayerData(dayData);
          return;
        }
      }

      // 2. Jika tidak ada cache bulanan, ambil dari API Aladhan Calendar
      try {
        const monthlyData = await getMonthlyPrayerTimes(lat, lng, year, month, calculationMethod, asharSchool);
        if (monthlyData && Array.isArray(monthlyData) && monthlyData.length > 0) {
          saveMonthlyToCache(year, month, lat, lng, monthlyData);
          
          const dayIndex = targetDate.getDate() - 1;
          let dayData = monthlyData[dayIndex];
          if (!dayData || !dayData.date || dayData.date.gregorian?.day !== dayStr) {
            dayData = monthlyData.find((item: any) => item.date?.gregorian?.day === dayStr);
          }
          if (dayData) {
            setRawPrayerData(dayData);
            return;
          }
        }
        throw new Error("Gagal mengambil jadwal bulanan dari API");
      } catch (e) {
          console.error("Gagal mengambil jadwal bulanan, menggunakan fallback harian...", e);
          
          // Fallback ke harian
          const dateStr = `${targetDate.getFullYear()}-${(targetDate.getMonth() + 1).toString().padStart(2, '0')}-${targetDate.getDate().toString().padStart(2, '0')}`;
          const dailyCacheKey = `${dateStr}_${roundedLat}_${roundedLng}_m${calculationMethod}_s${asharSchool}`;

          try {
            const data = await getPrayerTimes(lat, lng, targetDate, calculationMethod, asharSchool);
            if (data) {
                setRawPrayerData(data);
                saveToCache(dailyCacheKey, data);
            } else {
                throw new Error("Gagal mengambil data harian");
            }
          } catch(err) { 
              console.error("Gagal mengambil harian, memuat dari cache harian...", err);
              const cached = getCachedData(dailyCacheKey);
              if (cached) {
                  setRawPrayerData(cached);
              } else {
                  showToast("Gagal mengambil data waktu sholat. Silakan periksa koneksi internet Anda.", "error");
              }
          }
      }
  };

  const refreshLocation = async () => {
    if (isRefreshingRef.current) {
      console.log("Pencarian lokasi sudah berjalan.");
      return;
    }

    // Trigger Android Native GPS Dialog jika sedang di dalam aplikasi Android
    if (typeof window !== 'undefined' && window.AndroidNativeInterface?.requestGpsEnable) {
      try {
        window.AndroidNativeInterface.requestGpsEnable();
      } catch (e) {
        console.warn("Error calling requestGpsEnable:", e);
      }
    }

    isRefreshingRef.current = true;
    setLoading(true);

    // Muat lokasi terakhir yang berhasil disimpan dari localStorage sebagai backup utama
    const savedLat = localStorage.getItem('santriai_last_lat');
    const savedLng = localStorage.getItem('santriai_last_lng');
    const savedCity = localStorage.getItem('santriai_last_city');

    let backupLat = savedLat ? parseFloat(savedLat) : -6.2088;
    let backupLng = savedLng ? parseFloat(savedLng) : 106.8456;
    let backupCity = savedCity || "Jakarta (Default)";

    let lat = backupLat;
    let lng = backupLng;
    let success = false;

    if ("geolocation" in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 300000
          });
        });

        lat = position.coords.latitude;
        lng = position.coords.longitude;
        coordsRef.current = { lat, lng };
        setCoords({ lat, lng });

        localStorage.setItem('santriai_last_lat', lat.toString());
        localStorage.setItem('santriai_last_lng', lng.toString());

        const city = await getCityName(lat, lng);
        setLocationName(city);
        localStorage.setItem('santriai_last_city', city);

        success = true;
      } catch (err: any) {
        console.warn("Pencarian lokasi default/tersimpan digunakan:", err);
      }

      if (!success) {
        setLocationName(backupCity);
        coordsRef.current = { lat: backupLat, lng: backupLng };
        setCoords({ lat: backupLat, lng: backupLng });
        lat = backupLat;
        lng = backupLng;
      }
    } else {
      setLocationName(backupCity);
      coordsRef.current = { lat: backupLat, lng: backupLng };
      setCoords({ lat: backupLat, lng: backupLng });
      lat = backupLat;
      lng = backupLng;
    }

    try {
      await fetchTimes(lat, lng, date);
    } catch (e) {
      console.error("Gagal memuat jadwal waktu shalat:", e);
    } finally {
      setLoading(false);
      isRefreshingRef.current = false;
    }
  };

  const initializePrayerData = async () => {
    setLoading(true);
    const savedLat = localStorage.getItem('santriai_last_lat');
    const savedLng = localStorage.getItem('santriai_last_lng');
    const savedCity = localStorage.getItem('santriai_last_city');

    if (savedLat && savedLng) {
      const lat = parseFloat(savedLat);
      const lng = parseFloat(savedLng);
      coordsRef.current = { lat, lng };
      setCoords({ lat, lng });
      if (savedCity) setLocationName(savedCity);
      
      try {
        await fetchTimes(lat, lng, date);
      } catch (e) {
        console.error("Gagal memuat jadwal waktu sholat dari cache/lokasi tersimpan:", e);
      } finally {
        setLoading(false);
      }
    } else {
      // Jika belum ada lokasi sama sekali (pengguna baru pertama kali buka), baru kita panggil refreshLocation untuk GPS
      await refreshLocation();
    }
  };

  useEffect(() => {
    initializePrayerData();
  }, []);

  useEffect(() => {
      if (coordsRef.current) {
          setLoading(true);
          fetchTimes(coordsRef.current.lat, coordsRef.current.lng, date).then(() => setLoading(false));
      }
  }, [date, calculationMethod, asharSchool]);

  // Helper untuk cek & simpan status adzan terdeteksi di localStorage agar tidak pernah re-trigger
  const isPrayerTriggered = (triggerKey: string) => {
    if (triggeredPrayersRef.current.has(triggerKey)) return true;
    try {
      const saved = localStorage.getItem('santriai_triggered_prayers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.includes(triggerKey)) {
          triggeredPrayersRef.current.add(triggerKey);
          return true;
        }
      }
    } catch (e) {}
    return false;
  };

  const markPrayerAsTriggered = (triggerKey: string) => {
    triggeredPrayersRef.current.add(triggerKey);
    try {
      const saved = localStorage.getItem('santriai_triggered_prayers');
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed) && !parsed.includes(triggerKey)) {
        parsed.push(triggerKey);
        // Simpan hanya log hari ini agar storage tidak terus membengkak
        const todayPrefix = triggerKey.split('_')[0];
        const filtered = parsed.filter((k: string) => typeof k === 'string' && k.startsWith(todayPrefix));
        localStorage.setItem('santriai_triggered_prayers', JSON.stringify(filtered));
      }
    } catch (e) {}
  };

  // LOGIKA PENGIRIMAN JADWAL KE ANDROID
  useEffect(() => {
    if (!prayerData || !window.AndroidNativeInterface?.schedulePrayerTimes) {
      return;
    }

    // Format tanggal lokal (YYYY-MM-DD) untuk menghindari perbedaan timezone UTC vs Lokal (WIB/WITA/WIT)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const datePrefix = `${year}-${month}-${day}`;

    const rawSchedule = [
        { key: 'Imsak', time: prayerData.timings.Imsak, type: 'adzan' },
        { key: 'Subuh', time: prayerData.timings.Fajr, type: 'adzan' },
        { key: 'Terbit', time: prayerData.timings.Sunrise, type: 'adzan' },
        { key: 'Zuhur', time: prayerData.timings.Dhuhr, type: 'adzan' },
        { key: 'Ashar', time: prayerData.timings.Asr, type: 'adzan' },
        { key: 'Maghrib', time: prayerData.timings.Maghrib, type: 'adzan' },
        { key: 'Isya', time: prayerData.timings.Isha, type: 'adzan' },
        { key: 'Alarm', time: alarmTime, type: 'alarm' } 
    ];

    const sunriseTime = prayerData.timings.Sunrise.split(' ')[0];
    const [sH, sM] = sunriseTime.split(':').map(Number);
    const dhuhaDate = new Date();
    dhuhaDate.setHours(sH, sM + 20);
    const dhuhaTimeStr = `${dhuhaDate.getHours().toString().padStart(2, '0')}:${dhuhaDate.getMinutes().toString().padStart(2, '0')}`;
    rawSchedule.push({ key: 'Dhuha', time: dhuhaTimeStr, type: 'adzan' });

    const isFriday = date.getDay() === 5;
    
    // Sertakan juga jadwal Pasca-Adzan (+10 menit) untuk Subuh, Zuhur, Ashar, Maghrib, Isya, Imsak, Dhuha, dan Alarm
    const fullSchedule: Array<{ key: string; time: string; type: string; prayerName: string }> = [];
    const POST_ADZAN_ELIGIBLE = ['Subuh', 'Zuhur', 'Ashar', 'Maghrib', 'Isya', 'Imsak', 'Dhuha', 'Alarm'];

    rawSchedule.forEach(p => {
        const isEnabled = notifications[p.key] === true;
        if (!isEnabled) return;

        const cleanT = p.time.replace(/\s*\(.*?\)\s*/g, '').trim();
        fullSchedule.push({ key: p.key, time: cleanT, type: p.type, prayerName: p.key });

        // Tambahkan entri Pasca Adzan (+10 menit)
        if (POST_ADZAN_ELIGIBLE.includes(p.key)) {
          const [pH, pM] = cleanT.split(':').map(Number);
          if (!isNaN(pH) && !isNaN(pM)) {
            const postD = new Date();
            postD.setHours(pH, pM + 10, 0, 0);
            const postTimeStr = `${postD.getHours().toString().padStart(2, '0')}:${postD.getMinutes().toString().padStart(2, '0')}`;
            fullSchedule.push({
              key: `Pasca ${p.key}`,
              time: postTimeStr,
              type: 'post_adzan',
              prayerName: p.key
            });
          }
        }
    });

    // Kirim objek jadwal sholat ke Native Android
    const POST_ADZAN_AUDIO_URL = 'https://ia601600.us.archive.org/1/items/assalamualaikumsantriai/assalamualaikum%2CsantriAI.mp3';

    const prayerListForAndroid = fullSchedule.map(p => {
      const isPost = p.type === 'post_adzan';
      const isFridayZuhur = isFriday && (p.key === 'Zuhur' || p.prayerName === 'Zuhur');
      const soundId = isFridayZuhur ? 'silent' : (soundSettings[p.key] || 'adzan_mekkah');
      const audioUrl = (isFridayZuhur || soundId === 'off' || soundId === 'silent')
        ? ''
        : (isPost ? POST_ADZAN_AUDIO_URL : (SOUND_AUDIO_MAP[soundId] || SOUND_AUDIO_MAP['adzan_mekkah']));

      return {
        name: p.key,
        prayerName: p.key, // Gunakan 'Pasca Subuh', 'Pasca Zuhur', dll agar terpisah dari adzan utama
        originalPrayerName: p.prayerName,
        time: p.time,
        date: datePrefix,
        type: p.type,
        audioUrl: audioUrl,
        soundUrl: audioUrl,
        title: isPost ? `Pengingat Sholat ${p.prayerName}` : (isFridayZuhur ? `Sholat Jum'at (${p.key})` : p.key),
        message: isPost 
          ? `Sudah 10 menit berlalu sejak Adzan ${p.prayerName}` 
          : (isFridayZuhur ? `Waktu Sholat Jum'at telah tiba (Suara Adzan Senyap)` : `Waktu Sholat ${p.key} telah tiba`)
      };
    });

    try {
        if (typeof window.AndroidNativeInterface.requestBatteryOptimizationExemption === 'function') {
            try {
                window.AndroidNativeInterface.requestBatteryOptimizationExemption();
            } catch (e) {}
        }
        window.AndroidNativeInterface.schedulePrayerTimes(JSON.stringify(prayerListForAndroid));

    // Sinkronkan audio adzan & pasca adzan ke native interface HANYA jika URL audio mengalami perubahan
    // agar tidak mendownload ulang setiap kali membuka aplikasi
    if (window.AndroidNativeInterface && typeof window.AndroidNativeInterface.setAdhanAudio === 'function') {
      try {
        let syncedAudioMap: Record<string, string> = {};
        try {
          const stored = localStorage.getItem('santriai_synced_adhan_audios');
          if (stored) syncedAudioMap = JSON.parse(stored);
        } catch (e) {}

        let hasNewSync = false;

        fullSchedule.forEach(p => {
          if (p.type === 'post_adzan') {
            const key = p.key; // "Pasca Subuh", "Pasca Zuhur", dll
            if (syncedAudioMap[key] !== POST_ADZAN_AUDIO_URL) {
              try {
                window.AndroidNativeInterface?.setAdhanAudio(key, POST_ADZAN_AUDIO_URL, '');
                syncedAudioMap[key] = POST_ADZAN_AUDIO_URL;
                hasNewSync = true;
              } catch (e) {}
            }
          } else {
            const soundId = soundSettings[p.key] || 'adzan_mekkah';
            const audioSrc = SOUND_AUDIO_MAP[soundId] || SOUND_AUDIO_MAP['adzan_mekkah'];
            if (audioSrc && soundId !== 'off' && soundId !== 'silent') {
              if (syncedAudioMap[p.key] !== audioSrc) {
                try {
                  window.AndroidNativeInterface?.setAdhanAudio(p.key, audioSrc, '');
                  syncedAudioMap[p.key] = audioSrc;
                  hasNewSync = true;
                } catch (e) {}
              }
            }
          }
        });

        if (hasNewSync) {
          try {
            localStorage.setItem('santriai_synced_adhan_audios', JSON.stringify(syncedAudioMap));
          } catch (e) {}
        }
      } catch (e) {
        console.error("Gagal menyinkronkan audio ke Native Android:", e);
      }
    }
    } catch (e) {
        console.error("Gagal mengirim jadwal sholat ke native Android:", e);
    }

  }, [prayerData, notifications, alarmTime, date, soundSettings, SOUND_AUDIO_MAP]); 

  useEffect(() => {
    if (!prayerData) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const todayIso = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      const isFriday = now.getDay() === 5;
      
      const schedule = [
        { key: 'Imsak', time: prayerData.timings.Imsak },
        { key: 'Subuh', time: prayerData.timings.Fajr },
        { key: 'Terbit', time: prayerData.timings.Sunrise },
        { key: 'Zuhur', time: prayerData.timings.Dhuhr },
        { key: 'Ashar', time: prayerData.timings.Asr },
        { key: 'Maghrib', time: prayerData.timings.Maghrib },
        { key: 'Isya', time: prayerData.timings.Isha },
        { key: 'Alarm', time: alarmTime } 
      ];

      const sunriseTime = prayerData.timings.Sunrise.split(' ')[0];
      const [sH, sM] = sunriseTime.split(':').map(Number);
      const dhuhaDate = new Date();
      dhuhaDate.setHours(sH, sM + 20);
      const dhuhaTimeStr = `${dhuhaDate.getHours().toString().padStart(2, '0')}:${dhuhaDate.getMinutes().toString().padStart(2, '0')}`;
      schedule.push({ key: 'Dhuha', time: dhuhaTimeStr });
      
      schedule.sort((a, b) => a.time.localeCompare(b.time));

      const cleanTime = (t: string) => t.replace(/\s*\(.*?\)\s*/g, '').trim();
      const upcoming = schedule.find(p => cleanTime(p.time) > currentTimeStr) || schedule[0];
      setNextPrayer({ name: upcoming.key, time: cleanTime(upcoming.time) });

      const [hStr, mStr] = cleanTime(upcoming.time).split(':');
      const targetTime = new Date();
      targetTime.setHours(parseInt(hStr), parseInt(mStr), 0, 0);
      if (targetTime <= now) targetTime.setDate(targetTime.getDate() + 1);

      const diffMs = targetTime.getTime() - now.getTime();
      const diffH = Math.floor(diffMs / (1000 * 60 * 60));
      const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffS = Math.floor((diffMs % (1000 * 60)) / 1000);
      setCountdown(`${diffH.toString().padStart(2, '0')}:${diffM.toString().padStart(2, '0')}:${diffS.toString().padStart(2, '0')}`);

      // LOGIKA ADZAN & PASCA-ADZAN REALTIME
      schedule.forEach(p => {
        const timeClean = cleanTime(p.time);
        if (!timeClean || !timeClean.includes(':')) return;

        const [pH, pM] = timeClean.split(':').map(Number);
        if (isNaN(pH) || isNaN(pM)) return;

        const prayerTargetDate = new Date();
        prayerTargetDate.setHours(pH, pM, 0, 0);

        const elapsedMs = now.getTime() - prayerTargetDate.getTime();
        const elapsedMinutes = elapsedMs / (1000 * 60);

        const triggerKey = `${todayIso}_${p.key}`;
        const postTriggerKey = `${todayIso}_${p.key}_post10`;

        const isEnabled = notifications[p.key] !== false;
        const isFridayZuhur = isFriday && p.key === 'Zuhur';
        const isPostEligible = ['Subuh', 'Zuhur', 'Ashar', 'Maghrib', 'Isya', 'Imsak', 'Dhuha', 'Alarm'].includes(p.key);

        // A. JIKA SUDAH LEBIH DARI 15 MENIT DARI WAKTU ADZAN (EXPIRED, MISAL DIBUKA JAM 14:00 UNTUK ZUHUR 12:00)
        if (elapsedMinutes > 15) {
          // Tandai kedua penanda secara diam-diam agar tidak memunculkan notifikasi usang/terlambat
          markPrayerAsTriggered(triggerKey);
          markPrayerAsTriggered(postTriggerKey);
          return;
        }

        // B. WAKTU ADZAN UTAMA (0 s/d 3 MENIT SETELAH ADZAN)
        if (elapsedMinutes >= 0 && elapsedMinutes <= 3) {
          if (!isPrayerTriggered(triggerKey)) {
            markPrayerAsTriggered(triggerKey);

            if (isEnabled) {
              // Panggil pengirim notifikasi Android & Browser
              if (window.sendAdzanNotification) {
                window.sendAdzanNotification(isFridayZuhur ? `Sholat Jum'at (${p.key})` : p.key, timeClean);
              }

              // Putar audio adzan jika opsi suara diaktifkan (dimatikan otomatis jika Dzuhur hari Jumat)
              const soundId = isFridayZuhur ? 'silent' : (soundSettings[p.key] || 'adzan_mekkah');
              if (soundId !== 'off' && soundId !== 'silent' && !isFridayZuhur) {
                const audioSrc = SOUND_AUDIO_MAP[soundId] || SOUND_AUDIO_MAP['adzan_mekkah'];
                if (audioSrc) {
                  if (adzanAudioRef.current) {
                    try { adzanAudioRef.current.pause(); } catch (e) {}
                  }
                  const audio = new Audio(audioSrc);
                  adzanAudioRef.current = audio;
                  setIsAdzanPlaying(true);
                  setActivePrayerName(p.key);

                  if (window.AndroidNativeInterface && typeof window.AndroidNativeInterface.playQuranAudio === 'function') {
                    try {
                      window.AndroidNativeInterface.playQuranAudio(
                        audioSrc,
                        `Waktu Sholat ${p.key}`,
                        `Telah masuk waktu ${p.key}`
                      );
                    } catch (e) {}
                  }

                  audio.play().catch(err => {
                    console.warn("Gagal memutar audio adzan otomatis:", err);
                  });
                  audio.onended = () => {
                    stopAdzan();
                  };
                }
              }
            }
          }
        } 
        // C. WAKTU PASCA-ADZAN ATAU KONDISI UNFREEZE PASCA ADZAN (3 s/d 15 MENIT SETELAH ADZAN)
        else if (elapsedMinutes > 3 && elapsedMinutes <= 15) {
          // Selalu tandai adzan utama sudah lewat/terlewat agar adzan lama tidak pernah terpicu
          markPrayerAsTriggered(triggerKey);

          // Jika jadwal mendukung notifikasi pasca-adzan dan belum terpicu (kecuali Dzuhur Jumat agar tidak mengganggu ibadah Jumat)
          if (isPostEligible && isEnabled && !isFridayZuhur && !isPrayerTriggered(postTriggerKey)) {
            const wasAdzanMissed = !isPrayerTriggered(triggerKey);
            const isPostWindow = elapsedMinutes >= 10 && elapsedMinutes <= 15;

            if (isPostWindow || wasAdzanMissed) {
              markPrayerAsTriggered(postTriggerKey);

              // Kirim Notifikasi Pasca-Adzan
              if (window.sendPostAdzanNotification) {
                window.sendPostAdzanNotification(p.key, timeClean);
              } else if (window.sendAdzanNotification) {
                window.sendAdzanNotification(`Pasca ${p.key}`, timeClean);
              }

              // Putar Audio Pasca-Adzan ("Assalamualaikum Santri AI...")
              const POST_ADZAN_AUDIO_URL = 'https://ia601600.us.archive.org/1/items/assalamualaikumsantriai/assalamualaikum%2CsantriAI.mp3';

              if (adzanAudioRef.current) {
                try { adzanAudioRef.current.pause(); } catch (e) {}
              }
              const postAudio = new Audio(POST_ADZAN_AUDIO_URL);
              adzanAudioRef.current = postAudio;
              setIsAdzanPlaying(true);
              setActivePrayerName(`Pasca ${p.key}`);

              if (window.AndroidNativeInterface && typeof window.AndroidNativeInterface.playQuranAudio === 'function') {
                try {
                  window.AndroidNativeInterface.playQuranAudio(
                    POST_ADZAN_AUDIO_URL,
                    `Pengingat Sholat ${p.key}`,
                    `Sudah 10 menit berlalu sejak Adzan ${p.key}`
                  );
                } catch (e) {}
              }

              postAudio.play().catch(err => {
                console.warn("Gagal memutar audio pasca-adzan otomatis:", err);
              });
              postAudio.onended = () => {
                stopAdzan();
              };
            }
          }
        }
      });
      
    }, 1000);

    return () => clearInterval(interval);
  }, [prayerData, alarmTime, notifications, soundSettings, SOUND_AUDIO_MAP, stopAdzan]); 

  const toggleNotification = (key: string) => {
    setNotifications((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const setNotificationStatus = (key: string, status: boolean) => {
    setNotifications((prev: any) => ({ ...prev, [key]: status }));
  };
  
  return (
    <PrayerContext.Provider value={{ 
        prayerData, locationName, loading, nextPrayer, countdown, 
        refreshLocation, notifications, toggleNotification, setNotificationStatus,
        date, setDate, alarmTime, setAlarmTime, 
        soundSettings,
        setSoundSetting,
        isAdzanPlaying,
        activePrayerName,
        stopAdzan,
        asharSchool,
        setAsharSchool,
        calculationMethod,
        setCalculationMethod,
        ihtiyath,
        setIhtiyath,
        coords,
        hijriAdjustment,
        setHijriAdjustment,
        getHijriDate
    }}>
      {children}
    </PrayerContext.Provider>
  );
};

export const usePrayer = () => {
  const context = useContext(PrayerContext);
  if (context === undefined) {
    throw new Error('usePrayer must be used within a PrayerProvider');
  }
  return context;
};
