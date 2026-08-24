import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  SupportedLanguage, 
  LanguageOption, 
  SUPPORTED_LANGUAGES, 
  translations 
} from '../locales/translations';

interface LanguageContextType {
  language: SupportedLanguage;
  isAutoDetect: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  setAutoDetect: (auto: boolean) => void;
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
  availableLanguages: LanguageOption[];
  systemLanguageDetected: SupportedLanguage;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Mendeteksi bahasa bawaan perangkat pengguna dari Android WebView / Browser
 */
export const detectSystemLanguage = (): SupportedLanguage => {
  try {
    // 1. Cek dari jembatan Android Native Interface jika tersedia
    if (typeof window !== 'undefined' && (window as any).AndroidNativeInterface?.getSystemLanguage) {
      const nativeLang = (window as any).AndroidNativeInterface.getSystemLanguage()?.toLowerCase?.() || '';
      if (nativeLang.startsWith('id') || nativeLang.startsWith('in')) return 'id';
      if (nativeLang.startsWith('en')) return 'en';
      if (nativeLang.startsWith('ms')) return 'ms';
      if (nativeLang.startsWith('ar')) return 'ar';
      if (nativeLang.startsWith('tr')) return 'tr';
      if (nativeLang.startsWith('ur')) return 'ur';
    }

    // 2. Cek dari navigator.languages dan navigator.language bawaan browser / WebView
    const browserLanguages = typeof navigator !== 'undefined' 
      ? (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]) 
      : ['id'];

    for (const rawLang of browserLanguages) {
      if (!rawLang) continue;
      const lang = rawLang.toLowerCase();
      if (lang.startsWith('id') || lang.startsWith('in')) return 'id';
      if (lang.startsWith('en')) return 'en';
      if (lang.startsWith('ms')) return 'ms';
      if (lang.startsWith('ar')) return 'ar';
      if (lang.startsWith('tr')) return 'tr';
      if (lang.startsWith('ur')) return 'ur';
    }
  } catch (e) {
    console.warn('Gagal mendeteksi bahasa sistem:', e);
  }

  // Bahasa Default Utama adalah Indonesia
  return 'id';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemLang, setSystemLang] = useState<SupportedLanguage>(detectSystemLanguage);
  
  // Baca konfigurasi tersimpan
  const [isAutoDetect, setIsAutoDetect] = useState<boolean>(() => {
    const savedAuto = localStorage.getItem('santriai_lang_auto');
    return savedAuto === null ? true : savedAuto === 'true';
  });

  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const savedAuto = localStorage.getItem('santriai_lang_auto');
    const isAuto = savedAuto === null ? true : savedAuto === 'true';

    if (isAuto) {
      return detectSystemLanguage();
    }

    const savedLang = localStorage.getItem('santriai_language') as SupportedLanguage;
    if (savedLang && SUPPORTED_LANGUAGES.some(l => l.code === savedLang)) {
      return savedLang;
    }
    return detectSystemLanguage();
  });

  // Pantau perubahan bahasa perangkat jika di mode auto
  useEffect(() => {
    const handleLanguageChange = () => {
      const detected = detectSystemLanguage();
      setSystemLang(detected);
      if (isAutoDetect) {
        setLanguageState(detected);
      }
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, [isAutoDetect]);

  // Set Bahasa Manual
  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    setIsAutoDetect(false);
    setLanguageState(newLang);
    localStorage.setItem('santriai_lang_auto', 'false');
    localStorage.setItem('santriai_language', newLang);
  }, []);

  // Set Mode Deteksi Otomatis
  const setAutoDetect = useCallback((auto: boolean) => {
    setIsAutoDetect(auto);
    localStorage.setItem('santriai_lang_auto', auto ? 'true' : 'false');
    if (auto) {
      const detected = detectSystemLanguage();
      setLanguageState(detected);
    }
  }, []);

  // Fungsi Penerjemah Teks (t)
  const t = useCallback((key: string, fallback?: string, params?: Record<string, string | number>): string => {
    // 1. Coba ambil dari bahasa aktif
    const langDict = translations[language] || translations['id'];
    let text = langDict[key];

    // 2. Jika tidak ada di bahasa aktif, fallback ke bahasa Indonesia (default)
    if (!text && language !== 'id') {
      text = translations['id']?.[key];
    }

    // 3. Jika tetap tidak ada, gunakan fallback eksplisit atau key itu sendiri
    if (!text) {
      text = fallback || key;
    }

    // 4. Ganti parameter dinamis (contoh: {name}, {count})
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }

    return text;
  }, [language]);

  const isRTL = useMemo(() => language === 'ar' || language === 'ur', [language]);

  const contextValue = useMemo(() => ({
    language,
    isAutoDetect,
    setLanguage,
    setAutoDetect,
    t,
    isRTL,
    availableLanguages: SUPPORTED_LANGUAGES,
    systemLanguageDetected: systemLang
  }), [language, isAutoDetect, setLanguage, setAutoDetect, t, isRTL, systemLang]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
