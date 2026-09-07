import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import MiniPlayer from './components/MiniPlayer';
import { AudioProvider } from './contexts/AudioContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { ToastProvider, useToast } from './contexts/ToastContext'; 
import { useAuth } from './contexts/AuthContext'; 
import { PrayerProvider } from './contexts/PrayerContext';
import { AdzanBanner } from './components/AdzanBanner';
import ConfirmationModal from './components/ConfirmationModal';
import { BookOpen, Star } from 'lucide-react';

// Screens
import HomeScreen from './screens/HomeScreen';
import InputScreen from './screens/InputScreen'; 
import KitabScreen from './screens/KitabScreen';
import QuranScreen from './screens/QuranScreen';
import HadisScreen from './screens/HadisScreen';
import SettingsScreen from './screens/SettingsScreen';
import ResultScreen from './screens/ResultScreen';
import ResultDetailScreen from './screens/ResultDetailScreen'; 
import CalendarScreen from './screens/CalendarScreen';
import ZakatScreen from './screens/ZakatScreen';
import WarisScreen from './screens/WarisScreen';
import TasbihScreen from './screens/TasbihScreen';
import DoaScreen from './screens/DoaScreen';
import CerdasCermatScreen from './screens/CerdasCermatScreen';
import QuizAuthenticatedScreen from './screens/QuizAuthenticatedScreen'; 
import LatihanBacaScreen from './screens/LatihanBacaScreen';
import QiblaScreen from './screens/QiblaScreen';
import PrayerTimesScreen from './screens/PrayerTimesScreen';
import NotificationSelectorScreen from './screens/NotificationSelectorScreen';
import BiographyScreen from './screens/BiographyScreen';
import ScholarTimelineScreen from './screens/ScholarTimelineScreen';
import FatwaScreen from './screens/FatwaScreen';
import CommunityScreen from './screens/CommunityScreen';
import PremiumScreen from './screens/PremiumScreen';
import BadgeShopScreen from './screens/BadgeShopScreen';
import WasilahShopScreen from './screens/WasilahShopScreen';
import PremiumFrameShopScreen from './screens/PremiumFrameShopScreen';
import PrayerRequestScreen from './screens/PrayerRequestScreen';
import MutabaahScreen from './screens/MutabaahScreen';
import MuhasabahScreen from './screens/MuhasabahScreen';
import NearbyPlacesScreen from './screens/NearbyPlacesScreen';
import PesantrenExplorerScreen from './screens/PesantrenExplorerScreen';
import ExplanationScreen from './screens/ExplanationScreen';
import CategoryBooksScreen from './screens/CategoryBooksScreen';
import BookDetailScreen from './screens/BookDetailScreen';
import InfoScreen from './screens/InfoScreen';
import TvMakkahScreen from './screens/TvMakkahScreen';
import IslamicVideosScreen from './screens/IslamicVideosScreen';
import RadioScreen from './screens/RadioScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import ChatAdminScreen from './screens/ChatAdminScreen';
import NotificationScreen from './screens/NotificationScreen';
import NotificationDetailScreen from './screens/NotificationDetailScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import AchievementHistoryScreen from './screens/AchievementHistoryScreen'; 
import AchievementFramesScreen from './screens/AchievementFramesScreen';
import TahfidzScreen from './screens/TahfidzScreen';
import MawdhuiStudyScreen from './screens/MawdhuiStudyScreen'; 
import IslamicCreatorScreen from './screens/IslamicCreatorScreen';
import RedeemPointsScreen from './screens/RedeemPointsScreen'; 
import MutiaraScreen from './screens/MutiaraScreen'; 
import NoInternetScreen from './screens/NoInternetScreen';
import PlaylistScreen from './screens/PlaylistScreen';
import NewsDetailScreen from './screens/NewsDetailScreen';
import NewsScreen from './screens/NewsScreen';
import WriteNewsScreen from './screens/WriteNewsScreen';
import NewsBookmarksScreen from './screens/NewsBookmarksScreen';
import PostBookmarksScreen from './screens/PostBookmarksScreen';
import DeathAnniversaryScreen from './screens/DeathAnniversaryScreen';
import ProfileScreen from './screens/ProfileScreen';
import FeatureBookmarksScreen from './screens/FeatureBookmarksScreen';
import { BookmarksScreen } from './screens/BookmarksScreen';
import BahtsulMasailScreen from './screens/BahtsulMasailScreen';

// Fiqih Calculators
import MenstrualCalculatorScreen from './screens/MenstrualCalculatorScreen';
import TravelCalculatorScreen from './screens/TravelCalculatorScreen';
import WaterCalculatorScreen from './screens/WaterCalculatorScreen';
import NifasCalculatorScreen from './screens/NifasCalculatorScreen';
import IddahCalculatorScreen from './screens/IddahCalculatorScreen';
import DonationScreen from './screens/DonationScreen';
import RukunIslamScreen from './screens/RukunIslamScreen';
import RukunImanScreen from './screens/RukunImanScreen';
import LearningPathScreen from './screens/LearningPathScreen';
import ThaharahScreen from './screens/ThaharahScreen';
import ZiarahScreen from './screens/ZiarahScreen';
import MarriageScreen from './screens/MarriageScreen';
import HajjUmrahScreen from './screens/HajjUmrahScreen';
import QurbanScreen from './screens/QurbanScreen';
import IslamicNamesScreen from './screens/IslamicNamesScreen';
import IslamicHistoryScreen from './screens/IslamicHistoryScreen';
import IslamicHistoryDetailScreen from './screens/IslamicHistoryDetailScreen';
import LearningQuranScreen from './screens/LearningQuranScreen';
import LearningKitabScreen from './screens/LearningKitabScreen';
import ChatAiScreen from './screens/ChatAiScreen';
import AdvancedKitabSearchScreen from './screens/AdvancedKitabSearchScreen';
import RamadhanScreen from './screens/RamadhanScreen';
import IdulAdhaScreen from './screens/IdulAdhaScreen';
import MosqueManagementScreen from './screens/MosqueManagementScreen';
import TahlilScreen from './screens/TahlilScreen';
import NisfuSyabanScreen from './screens/NisfuSyabanScreen';
import DoaNabiYunusScreen from './screens/DoaNabiYunusScreen';
import YasinScreen from './screens/YasinScreen';
import EbookScreen from './screens/EbookScreen';
import EbookReaderScreen from './screens/EbookReaderScreen';
import IslamicGameScreen from './screens/IslamicGameScreen';
import ArcheryGameScreen from './screens/ArcheryGameScreen';
import GameHubScreen from './screens/GameHubScreen';
import TafakurScreen from './screens/TafakurScreen';
import DzikirMeditationScreen from './screens/DzikirMeditationScreen';

import ExpertConsultationScreen from './screens/ExpertConsultationScreen';
import FridaySunnahScreen from './screens/FridaySunnahScreen';
import AvatarSelectionScreen from './screens/AvatarSelectionScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import NotesScreen from './screens/NotesScreen';
import SpeechMaterialScreen from './screens/SpeechMaterialScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import MunawwirScreen from './screens/MunawwirScreen';
import { AppSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { subscribeToUserSettings, updateUserSettings, checkAndAttemptFirebaseNetworkReconnect, db, subscribeToBroadcasts, subscribeToNotifications, subscribeToUpdateConfig, subscribeToAdPopupConfig } from './services/firebase'; 
import { playNotificationSound } from './utils/quizSound';

export const triggerLocalStatusBarNotification = (title: string, message: string, type: 'broadcast' | 'adzan' | 'post_adzan' | 'personal' = 'broadcast') => {
  // Putar efek suara notifikasi jernih jika notifikasi broadcast atau personal
  if (type === 'broadcast' || type === 'personal') {
    playNotificationSound();
  }

  // 1. Android Native Interface (Status Bar Android Native APK)
  if (window.AndroidNativeInterface && typeof window.AndroidNativeInterface.showNotification === 'function') {
    try {
      window.AndroidNativeInterface.showNotification(title, message, type === 'personal' ? 'broadcast' : type);
    } catch (e) {
      console.error('Gagal panggil AndroidNativeInterface.showNotification:', e);
    }
  }

  // 2. Browser / PWA Notification API (Status Bar Browser HP & Desktop)
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          tag: `${type}_${Date.now()}`
        });
      } catch (e) {
        console.warn('Gagal memunculkan Web Notification:', e);
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          try {
            new Notification(title, {
              body: message,
              icon: '/favicon.ico'
            });
          } catch (e) {}
        }
      });
    }
  }
};

const GlobalListener = ({ onOfflineChange, onShowExitConfirm }: { onOfflineChange: (status: boolean) => void, onShowExitConfirm: () => void }) => {
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth(); 
  const showToastRef = useRef(showToast);
  const lastBroadcastIdRef = useRef<string | null>(null);
  const isFirstLoad = useRef(true);
  const knownNotifIdsRef = useRef<Set<string>>(new Set());
  const isFirstNotifLoad = useRef(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Minta izin Notifikasi Browser pada awal boot jika didukung
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  useEffect(() => {
    window.handleAndroidBackPress = () => {
      if (location.pathname !== '/') {
        navigate(-1);
        return true; 
      } else {
        onShowExitConfirm();
        return true; // Return true because we are handling the press by showing a modal
      }
    };
    return () => { delete window.handleAndroidBackPress; };
  }, [location, navigate, onShowExitConfirm]);

  // Handler Notifikasi FCM: Penanganan Aksi Navigasi & Token Perangkat
  useEffect(() => {
    window.handleFcmNavigation = (targetScreen: string, targetUrl?: string) => {
      if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
        window.open(targetUrl, '_blank');
        return;
      }
      if (targetScreen) {
        const routeMap: Record<string, string> = {
          'jadwal-sholat': '/prayer-times',
          'prayer-times': '/prayer-times',
          'quran': '/quran',
          'chat': '/chat-ai',
          'chat-ai': '/chat-ai',
          'doa': '/doa',
          'kitab': '/kitab',
          'hadis': '/hadis',
          'cerdas-cermat': '/cerdas-cermat',
          'toko': '/wasilah-shop',
          'shop': '/wasilah-shop',
          'video': '/islamic-videos',
          'radio': '/radio',
          'tv': '/tv-makkah',
          'notifikasi': '/notifications',
          'settings': '/settings',
        };

        const target = routeMap[targetScreen.toLowerCase()] || (targetScreen.startsWith('/') ? targetScreen : `/${targetScreen}`);
        navigate(target);
      }
    };

    window.onFcmTokenReceived = (token: string) => {
      try {
        localStorage.setItem('santriai_fcm_token', token);
      } catch (e) {}
    };

    // Website memberikan perintah awal ke Android Kotlin
    if (window.AndroidNativeInterface) {
      try {
        // 1. Berlangganan topik siaran massal santri
        window.AndroidNativeInterface.subscribeToTopic?.('semua_santri');
        window.AndroidNativeInterface.subscribeToTopic?.('kajian_harian');
        // 2. Meminta token FCM untuk disimpan di web / user profile
        window.AndroidNativeInterface.getFcmToken?.();
        // 3. Meminta pengecualian optimasi baterai agar adzan & FCM selalu tepat waktu
        window.AndroidNativeInterface.requestBatteryOptimizationExemption?.();
      } catch (e) {
        console.warn('Gagal sinkronisasi awal perintah Android Native Interface:', e);
      }
    }

    return () => {
      delete window.handleFcmNavigation;
      delete window.onFcmTokenReceived;
    };
  }, [navigate]);

  useEffect(() => {
    const handleOffline = async () => {
      onOfflineChange(true);
      if (db) await db.disableNetwork().catch(console.error);
    };
    const handleOnline = async () => {
      onOfflineChange(false);
      showToastRef.current("Koneksi tersambung kembali.", "success");
      await checkAndAttemptFirebaseNetworkReconnect(showToastRef.current);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    if (!navigator.onLine) {
       onOfflineChange(true);
    } else {
       checkAndAttemptFirebaseNetworkReconnect(showToastRef.current);
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [onOfflineChange]);

  // 1. Broadcast Notification Listener
  useEffect(() => {
    if (authLoading) return;
    const unsubscribe = subscribeToBroadcasts((data) => {
        if (data.length > 0) {
            const newest = data[0]; 
            if (isFirstLoad.current) {
                lastBroadcastIdRef.current = newest.id as string;
                isFirstLoad.current = false;
                return;
            }
            if (newest.id !== lastBroadcastIdRef.current) {
                lastBroadcastIdRef.current = newest.id as string;
                triggerLocalStatusBarNotification(
                    newest.title, 
                    newest.message,
                    'broadcast'
                );
                showToastRef.current(`Info Baru: ${newest.title}`, 'info');
            }
        }
    });
    return () => unsubscribe();
  }, [authLoading]);

  // 2. Personal Notification Listener (Sistem Notifikasi Realtime Global)
  useEffect(() => {
    if (authLoading || !user?.uid) return;

    const unsubscribe = subscribeToNotifications(user.uid, (notifs) => {
      if (isFirstNotifLoad.current) {
        // Pada saat muat pertama, catat semua ID agar tidak memunculkan notifikasi usang
        notifs.forEach(n => knownNotifIdsRef.current.add(n.id));
        isFirstNotifLoad.current = false;
        return;
      }

      // Deteksi jika ada notifikasi baru yang masuk
      notifs.forEach((n) => {
        if (!knownNotifIdsRef.current.has(n.id)) {
          knownNotifIdsRef.current.add(n.id);
          // Jika statusnya belum dibaca, langsung munculkan di status bar bawaan HP
          if (!n.isRead) {
            triggerLocalStatusBarNotification(
              n.title || 'Santri AI',
              n.message || (n as any).body || 'Anda memiliki pesan notifikasi baru.',
              'personal'
            );
          }
        }
      });
    });

    return () => unsubscribe();
  }, [authLoading, user?.uid]);

  return null;
};

const AppContent: React.FC = () => {
  const { user } = useAuth(); 
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [updateConfig, setUpdateConfig] = useState<any>(null);
  const [hasDismissedUpdate, setHasDismissedUpdate] = useState(false);

  const [adConfig, setAdConfig] = useState<any>(null);
  const [hasDismissedAd, setHasDismissedAd] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToUpdateConfig((config) => {
      setUpdateConfig(config);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAdPopupConfig((config) => {
      setAdConfig(config);
    });
    return () => unsubscribe();
  }, []);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('santriai_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToUserSettings(user.uid, (cloudSettings) => {
        if (cloudSettings) {
          setSettings(prev => ({ 
            ...DEFAULT_SETTINGS, ...prev, ...cloudSettings
          }));
        }
      });
      return () => unsubscribe();
    } else {
      const saved = localStorage.getItem('santriai_settings');
      setSettings(saved ? JSON.parse(saved) : DEFAULT_SETTINGS);
    }
  }, [user]); 

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (theme: string) => {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // system theme (bawaan perangkat)
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme(settings.theme);

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        if (e.matches) root.classList.add('dark');
        else root.classList.remove('dark');
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  useEffect(() => {
    const body = document.body;
    body.classList.remove('font-style-amiri', 'font-style-scheherazade', 'font-style-noto');
    body.classList.add(`font-style-${settings.arabicFont}`);
  }, [settings.arabicFont]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (user) updateUserSettings(user.uid, newSettings).catch(console.error);
  };

  const handleRetryConnection = () => {
    window.location.reload();
  };

  const handleExitApp = () => {
    if (window.AndroidNativeInterface?.exitApp) {
        window.AndroidNativeInterface.exitApp();
    } else {
        // Fallback for non-native environments
        setShowExitConfirm(false);
    }
  };

  return (
    <HistoryProvider settings={settings}> 
      <PrayerProvider>
        <AdzanBanner />
        <AudioProvider>
            <GlobalListener 
                onOfflineChange={setIsOffline} 
                onShowExitConfirm={() => setShowExitConfirm(true)} 
            />
            
            {isOffline ? (
               <NoInternetScreen onRetry={handleRetryConnection} />
            ) : (
              <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
                <Routes>
                  <Route path="/" element={<HomeScreen fontSize={settings.fontSize} settings={settings} />} />
                  <Route path="/input" element={<InputScreen fontSize={settings.fontSize} />} />
                  <Route path="/result" element={<ResultScreen fontSize={settings.fontSize} />} />
                  <Route path="/result-detail" element={<ResultDetailScreen fontSize={settings.fontSize} />} />
                  <Route path="/kitab" element={<KitabScreen />} />
                  <Route path="/category-books" element={<CategoryBooksScreen />} />
                  <Route path="/book-detail" element={<BookDetailScreen />} />
                  <Route path="/kitab-advanced-search" element={<AdvancedKitabSearchScreen />} />
                  <Route path="/quran" element={<QuranScreen />} />
                  <Route path="/quran/:surahId" element={<QuranScreen />} />
                  <Route path="/hadis" element={<HadisScreen />} />
                  <Route path="/calendar" element={<CalendarScreen />} />
                  <Route path="/zakat" element={<ZakatScreen />} />
                  <Route path="/waris" element={<WarisScreen />} />
                  <Route path="/death-anniversary" element={<DeathAnniversaryScreen />} />
                  <Route path="/profile" element={<ProfileScreen />} />
                  <Route path="/tasbih" element={<TasbihScreen />} />
                  <Route path="/doa" element={<DoaScreen />} />
                  {/* Fixed typo in component name CerdasCermatScreen */}
                  <Route path="/quiz" element={<CerdasCermatScreen />} />
                  <Route path="/quiz-pro" element={<QuizAuthenticatedScreen />} />
                  <Route path="/cerdas-cermat" element={<QuizAuthenticatedScreen />} />
                  <Route path="/achievements" element={<AchievementHistoryScreen />} />
                  <Route path="/achievement-frames" element={<AchievementFramesScreen />} />
                  <Route path="/latihan" element={<LatihanBacaScreen />} />
                  <Route path="/qibla" element={<QiblaScreen />} />
                  <Route path="/prayer-times" element={<PrayerTimesScreen />} />
                  <Route path="/prayer-notification" element={<NotificationSelectorScreen />} />
                  <Route path="/biography" element={<BiographyScreen />} />
                <Route path="/scholars" element={<ScholarTimelineScreen />} />
                <Route path="/fatwa" element={<FatwaScreen />} />
                <Route path="/community" element={<CommunityScreen />} />
                <Route path="/premium" element={<PremiumScreen />} />
                <Route path="/badge-shop" element={<BadgeShopScreen />} />
                <Route path="/wasilah-shop" element={<WasilahShopScreen />} />
                <Route path="/frame-shop" element={<PremiumFrameShopScreen />} />
                <Route path="/prayer-request-create" element={<PrayerRequestScreen />} />
                <Route path="/mutabaah" element={<MutabaahScreen />} />
                <Route path="/muhasabah" element={<MuhasabahScreen />} />
                <Route path="/nearby" element={<NearbyPlacesScreen />} />
                <Route path="/pesantren-explorer" element={<PesantrenExplorerScreen />} />
                <Route path="/explanation" element={<ExplanationScreen />} />
                  <Route path="/tv-mekkah" element={<TvMakkahScreen />} />
                  <Route path="/video-islami" element={<IslamicVideosScreen />} />
                  <Route path="/radio" element={<RadioScreen />} />
                  <Route path="/admin" element={<AdminDashboardScreen />} />
                  <Route path="/notifications" element={<NotificationScreen />} />
                  <Route path="/notification-detail" element={<NotificationDetailScreen />} />
                  <Route path="/leaderboard" element={<LeaderboardScreen />} />
                  <Route path="/tahfidz" element={<TahfidzScreen />} />
                  <Route path="/creator-hub" element={<IslamicCreatorScreen />} />
                  <Route path="/mawdhui-study" element={<MawdhuiStudyScreen />} />
                  <Route path="/redeem" element={<RedeemPointsScreen />} />
                  <Route path="/mutiara" element={<MutiaraScreen />} /> 
                  <Route path="/playlist" element={<PlaylistScreen />} />
                  <Route path="/news-detail" element={<NewsDetailScreen />} /> 
                  <Route path="/news" element={<NewsScreen />} /> 
                  <Route path="/write-news" element={<WriteNewsScreen />} /> 
                  <Route path="/news-bookmarks" element={<NewsBookmarksScreen />} /> 
                  <Route path="/post-bookmarks" element={<PostBookmarksScreen />} /> 
                  <Route path="/info/:slug" element={<InfoScreen />} />
                  <Route path="/settings" element={<SettingsScreen settings={settings} onSaveSettings={handleSaveSettings} />} />
                  <Route path="/bookmarks" element={<BookmarksScreen />} />
                  <Route path="/feature-bookmarks" element={<FeatureBookmarksScreen />} />
                  <Route path="/haid" element={<MenstrualCalculatorScreen />} />
                  <Route path="/travel" element={<TravelCalculatorScreen />} />
                  <Route path="/water" element={<WaterCalculatorScreen />} />
                  <Route path="/nifas" element={<NifasCalculatorScreen />} />
                  <Route path="/iddah" element={<IddahCalculatorScreen />} />
                  <Route path="/donation" element={<DonationScreen />} />
                  <Route path="/rukun-islam" element={<RukunIslamScreen />} />
                  <Route path="/rukun-iman" element={<RukunImanScreen />} />
                  <Route path="/kurikulum" element={<LearningPathScreen />} />
                  <Route path="/thaharah" element={<ThaharahScreen />} />
                  <Route path="/ziarah" element={<ZiarahScreen />} />
                  <Route path="/marriage" element={<MarriageScreen />} />
                  <Route path="/hajj-umrah" element={<HajjUmrahScreen />} />
                  <Route path="/qurban" element={<QurbanScreen />} />
                  <Route path="/islamic-names" element={<IslamicNamesScreen />} />
                  <Route path="/islamic-history" element={<IslamicHistoryScreen />} />
                  <Route path="/islamic-history-detail" element={<IslamicHistoryDetailScreen />} />
                  <Route path="/learning-quran" element={<LearningQuranScreen />} />
                  <Route path="/learning-kitab" element={<LearningKitabScreen />} />
                  <Route path="/chat-ai" element={<ChatAiScreen settings={settings} />} />
                  <Route path="/chat-admin" element={<ChatAdminScreen />} />
                  <Route path="/ramadhan" element={<RamadhanScreen />} />
                  <Route path="/idul-adha" element={<IdulAdhaScreen />} />
                  <Route path="/mosque-management" element={<MosqueManagementScreen />} />
                  <Route path="/tahlil" element={<TahlilScreen />} />
                  <Route path="/nisfu-syaban" element={<NisfuSyabanScreen />} />
                  <Route path="/doa-nabi-yunus" element={<DoaNabiYunusScreen />} />
                  <Route path="/yasin" element={<YasinScreen />} />
                  <Route path="/ebook" element={<EbookScreen />} />
                  <Route path="/ebook-reader" element={<EbookReaderScreen />} />
                  <Route path="/game" element={<GameHubScreen />} />
                  <Route path="/quiz-game" element={<IslamicGameScreen />} />
                  <Route path="/archery" element={<ArcheryGameScreen />} />
                  <Route path="/tafakur" element={<TafakurScreen />} />
                  <Route path="/dzikir-meditation" element={<DzikirMeditationScreen />} />
                  <Route path="/expert-consultation" element={<ExpertConsultationScreen />} />
                  <Route path="/friday-barokah" element={<FridaySunnahScreen />} />
                  <Route path="/bahtsul-masail" element={<BahtsulMasailScreen />} />
                  <Route path="/avatar-selection" element={<AvatarSelectionScreen />} />
                  <Route path="/marketplace" element={<MarketplaceScreen />} />
                  <Route path="/notes" element={<NotesScreen />} />
                  <Route path="/speech-material" element={<SpeechMaterialScreen />} />
                  <Route path="/attendance" element={<AttendanceScreen />} />
                  <Route path="/munawwir" element={<MunawwirScreen />} />
                </Routes>
                {location.pathname !== '/chat-ai' && location.pathname !== '/chat-admin' && location.pathname !== '/ramadhan' && location.pathname !== '/idul-adha' && location.pathname !== '/mosque-management' && location.pathname !== '/tahlil' && location.pathname !== '/nisfu-syaban' && location.pathname !== '/doa-nabi-yunus' && location.pathname !== '/yasin' && location.pathname !== '/ebook' && location.pathname !== '/ebook-reader' && location.pathname !== '/game' && location.pathname !== '/quiz-game' && location.pathname !== '/quiz' && location.pathname !== '/quiz-pro' && location.pathname !== '/cerdas-cermat' && location.pathname !== '/archery' && location.pathname !== '/tafakur' && location.pathname !== '/dzikir-meditation' && location.pathname !== '/tahfidz' && location.pathname !== '/marketplace' && location.pathname !== '/notes' && location.pathname !== '/leaderboard' && !location.pathname.startsWith('/news') && location.pathname !== '/write-news' && <MiniPlayer />}
                {location.pathname !== '/chat-ai' && location.pathname !== '/chat-admin' && location.pathname !== '/ramadhan' && location.pathname !== '/idul-adha' && location.pathname !== '/mosque-management' && location.pathname !== '/tahlil' && location.pathname !== '/nisfu-syaban' && location.pathname !== '/doa-nabi-yunus' && location.pathname !== '/yasin' && location.pathname !== '/ebook' && location.pathname !== '/ebook-reader' && location.pathname !== '/game' && location.pathname !== '/quiz-game' && location.pathname !== '/quiz' && location.pathname !== '/quiz-pro' && location.pathname !== '/cerdas-cermat' && location.pathname !== '/archery' && location.pathname !== '/tafakur' && location.pathname !== '/dzikir-meditation' && location.pathname !== '/tahfidz' && location.pathname !== '/marketplace' && location.pathname !== '/notes' && location.pathname !== '/leaderboard' && !location.pathname.startsWith('/quran') && !location.pathname.startsWith('/learning-quran') && !location.pathname.startsWith('/hadis') && !location.pathname.startsWith('/news') && location.pathname !== '/write-news' && !location.pathname.startsWith('/category-books') && !location.pathname.startsWith('/book-detail') && !location.pathname.startsWith('/result') && <NavBar />}
                {/* Exit Confirmation Modal with Doa Kafaratul Majelis */}
                {showExitConfirm && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 text-center border-t-4 border-santri-green">
                            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BookOpen size={40} className="text-santri-green" />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Selesai Belajar?</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 uppercase tracking-widest font-bold">Kafaratul Majelis</p>
                            
                            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl p-5 border border-emerald-100 dark:border-emerald-900/50 mb-8">
                                <p className="font-arabic text-xl leading-loose text-slate-800 dark:text-slate-100 text-center mb-4" dir="rtl">
                                    سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ
                                </p>
                                <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed italic">
                                    "Maha Suci Engkau Ya Allah, dengan memuji-Mu, aku bersaksi bahwa tidak ada Tuhan selain Engkau, aku memohon ampunan dan bertaubat kepada-Mu."
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={handleExitApp}
                                    className="w-full py-4 bg-santri-green text-white rounded-2xl font-black text-sm shadow-xl shadow-green-100 dark:shadow-none active:scale-95 transition-all"
                                >
                                    Keluar Aplikasi
                                </button>
                                <button 
                                    onClick={() => setShowExitConfirm(false)}
                                    className="w-full py-3 text-slate-400 dark:text-slate-500 font-bold text-xs hover:text-slate-600 transition-colors"
                                >
                                    Lanjut Belajar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Manual App Update and Rating Popup with Android Jembatan support */}
                {updateConfig && updateConfig.showUpdatePopup && !hasDismissedUpdate && (
                  <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-350">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative border-t-8 border-amber-500 animate-in zoom-in-95 duration-300 text-center">
                      <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">
                        {updateConfig.updateTitle || 'Pembaruan Tersedia!'}
                      </h2>

                      {/* 5 Rating Stars */}
                      <div className="flex items-center justify-center gap-1.5 my-3 text-amber-400">
                        <Star size={24} className="fill-amber-400 text-amber-400 drop-shadow-xs" />
                        <Star size={24} className="fill-amber-400 text-amber-400 drop-shadow-xs" />
                        <Star size={24} className="fill-amber-400 text-amber-400 drop-shadow-xs" />
                        <Star size={24} className="fill-amber-400 text-amber-400 drop-shadow-xs" />
                        <Star size={24} className="fill-amber-400 text-amber-400 drop-shadow-xs" />
                      </div>
                      
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
                        {updateConfig.updateMessage || 'Silakan cek pembaruan aplikasi Anda dan berikan rating bintang 5 terbaik Anda.'}
                      </p>

                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={() => {
                            if (window.AndroidNativeInterface?.openPlayStore) {
                              try {
                                window.AndroidNativeInterface.openPlayStore();
                                if (updateConfig.isOptional) {
                                  setHasDismissedUpdate(true);
                                }
                                return;
                              } catch (err) {
                                console.error("Gagal membuka Play Store secara native:", err);
                              }
                            }
                            
                            const url = updateConfig.playStoreUrl || "https://play.google.com/store/apps/details?id=com.kitabkuningterjemahlengkap";
                            let playStoreId = "com.kitabkuningterjemahlengkap";
                            try {
                              const match = url.match(/id=([^&]+)/);
                              if (match && match[1]) {
                                playStoreId = match[1];
                              }
                            } catch (e) {}
                            
                            const marketUri = `market://details?id=${playStoreId}`;

                            if (window.AndroidNativeInterface) {
                              try {
                                window.location.href = marketUri;
                              } catch (e) {
                                window.open(url, '_blank');
                              }
                            } else {
                              window.open(url, '_blank');
                            }
                            
                            if (updateConfig.isOptional) {
                              setHasDismissedUpdate(true);
                            }
                          }}
                          className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-amber-500/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <Star size={16} className="fill-white" /> Cek Update & Beri Rating
                        </button>
                        
                        {updateConfig.isOptional && (
                          <button 
                            onClick={() => setHasDismissedUpdate(true)}
                            className="w-full py-3 text-slate-400 dark:text-slate-500 font-bold text-xs hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          >
                            Nanti Saja
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {/* Pop-up Iklan & Pemberitahuan Promo */}
                {adConfig && adConfig.showAdPopup && !hasDismissedAd && (
                  <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                      {/* Banner Image */}
                      {adConfig.imageUrl && (
                        <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <img src={adConfig.imageUrl} alt="Promo Banner" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          {adConfig.badgeTag && (
                            <span className="absolute top-4 left-4 bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                              {adConfig.badgeTag}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-6 text-center space-y-3">
                        {!adConfig.imageUrl && adConfig.badgeTag && (
                          <span className="inline-block bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-1">
                            {adConfig.badgeTag}
                          </span>
                        )}

                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-snug">
                          {adConfig.adTitle || 'Pemberitahuan Khusus'}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                          {adConfig.adMessage}
                        </p>

                        <div className="pt-2 flex flex-col gap-2">
                          {adConfig.actionUrl && (
                            <button
                              onClick={() => {
                                setHasDismissedAd(true);
                                if (adConfig.actionUrl.startsWith('http')) {
                                  window.open(adConfig.actionUrl, '_blank');
                                } else {
                                  navigate(adConfig.actionUrl);
                                }
                              }}
                              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                              <span>{adConfig.actionText || 'Buka Link'}</span>
                            </button>
                          )}

                          {(adConfig.isDismissible !== false) && (
                            <button
                              onClick={() => setHasDismissedAd(true)}
                              className="w-full py-2.5 text-slate-400 dark:text-slate-500 font-bold text-xs hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                              Tutup Iklan
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
        </AudioProvider>
      </PrayerProvider>
    </HistoryProvider>
  );
};

export default AppContent;