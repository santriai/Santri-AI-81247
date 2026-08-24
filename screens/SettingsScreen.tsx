import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppSettings, ArabicFont } from '../types';
import { 
  ArrowLeft, Type as TypeIcon, Moon, Sun, History, Bookmark, Scroll, ChevronRight, ChevronDown, ChevronUp, Monitor,
  Activity as ActivityIcon, Check, 
  Clock, Info, BookOpen, FileText, Shield, AlertTriangle, LogOut, User, 
  Mail, Lock, Edit3, Camera, Copy, Share2, Save, ShieldCheck, Loader2, 
  Coins, Gift, Eye, EyeOff, Trash2, CalendarCheck, Sparkles, HelpCircle, 
  MessageCircle, Heart, BellRing, Bell, UserPlus, Sliders, Palette, HelpCircle as QuestionIcon, Settings as SettingsIcon,
  Video, Newspaper, MessageSquare, Trophy, X as CloseIcon, Crown, RefreshCcw, Star, Globe
} from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { openExternalLink, shareWaGroup } from '../utils/linkUtils';
import { getRankDetails } from '../services/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext'; 
import { useLanguage } from '../contexts/LanguageContext'; 
import { useUnreadCount } from '../hooks/useUnreadCount'; 
import { 
  updateUserData, 
  subscribeToUserData, 
  updateUserProfileAuth,
  updateUserPasswordAuth,
  handleDailyCheckIn,
  handleAdReward
} from '../services/firebase'; 
import ConfirmationModal from '../components/ConfirmationModal';
import { PLAYSTORE_LINK } from '../constants'; // Import link Play Store

// Fix: Moved MenuListItem outside to ensure stable component identity and correct prop typing
const MenuListItem = ({ icon: Icon, label, color, onClick, isDestructive }: { icon: any, label: string, color: string, onClick: () => void, isDestructive?: boolean }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-800 last:border-0 group">
     <div className="flex items-center gap-4">
        <div className={`shrink-0 ${color}`}>
           <Icon size={20} />
        </div>
        <span className={`text-sm font-semibold transition-colors ${isDestructive ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{label}</span>
     </div>
     <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
  </button>
);

interface SettingsScreenProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, onSaveSettings }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signInEmail, signUpEmail, signOut, deleteAccount, sendPasswordReset, loading } = useAuth();
  const { showToast } = useToast();
  const unreadCount = useUnreadCount();
  const { 
    language: currentLang, 
    isAutoDetect, 
    setLanguage: changeAppLanguage, 
    setAutoDetect: changeAppLanguageAuto, 
    availableLanguages,
    systemLanguageDetected,
    t
  } = useLanguage();

  const [fromFeature, setFromFeature] = useState<string | null>(location.state?.from || null);

  // Accordion States for Tampilan Settings
  const [isLangAccordionOpen, setIsLangAccordionOpen] = useState(false);
  const [isFontAccordionOpen, setIsFontAccordionOpen] = useState(false);
  const [isSizeAccordionOpen, setIsSizeAccordionOpen] = useState(false);

  // Auth States
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [regReferralCode, setRegReferralCode] = useState('');

  // Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [userDataPoints, setUserDataPoints] = useState(0);
  const [userDataWasilah, setUserDataWasilah] = useState(0);
  const [userAvatarFrame, setUserAvatarFrame] = useState('none');
  const [userVerificationBadge, setUserVerificationBadge] = useState('none');
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Ad Reward States
  const [showAdOfferModal, setShowAdOfferModal] = useState(false);
  const [isAdProcessing, setIsAdProcessing] = useState(false);

  // AdMob Interstitial handler (Native-only, no custom React UI)
  const triggerInterstitial = (callback: () => void) => {
    if (window.AndroidNativeInterface?.showInterstitialAd) {
      try {
        console.log(`[AdMob] Triggering native interstitial ad`);
        window.AndroidNativeInterface.showInterstitialAd();
      } catch (err) {
        console.error("Gagal memanggil native AdMob Interstitial:", err);
      }
    }
    callback();
  };

  const [editData, setEditData] = useState({
    displayName: '',
    email: '',
    photoURL: '', 
    whatsapp: '',
    referralCode: '',
    newPassword: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = user?.email === 'admin@santrimodern.com';

  const handleCheckUpdate = () => {
    if (window.AndroidNativeInterface?.openPlayStore) {
      try {
        window.AndroidNativeInterface.openPlayStore();
        return;
      } catch (err) {
        console.error("Gagal membuka Play Store secara native:", err);
      }
    }
    
    const playStoreId = "com.kitabkuningterjemahlengkap";
    const marketUri = `market://details?id=${playStoreId}`;

    if (window.AndroidNativeInterface) {
      // Di Android WebView, jalankan market:// uri melalui window.location.href
      // Agar OS Android otomatis menangkap scheme tersebut dan membuka aplikasi Play Store asli.
      // Jika bermasalah, window.open akan menjadi fallback eksternal.
      try {
        window.location.href = marketUri;
      } catch (e) {
        window.open(PLAYSTORE_LINK, '_blank');
      }
    } else {
      window.open(PLAYSTORE_LINK, '_blank');
    }
  };

  // Fix: Define isAlreadyCheckedIn within the component
  const isAlreadyCheckedIn = () => {
    const today = new Date().toISOString().split('T')[0];
    return lastCheckIn === today;
  };

  useEffect(() => {
    let unsubscribeUser: () => void;
    if (user && user.uid) {
      unsubscribeUser = subscribeToUserData(user.uid, (data) => {
        if (data) {
          setUserDataPoints(data.points || 0);
          setUserDataWasilah(data.wasilah || 0);
          setUserAvatarFrame(data.avatarFrame || 'none');
          setUserVerificationBadge(data.verificationBadge || 'none');
          setLastCheckIn(data.lastCheckIn || null);
          setIsUserDataLoaded(true);
          setEditData(prev => ({
            ...prev,
            displayName: data.displayName || user.displayName || prev.displayName,
            email: user.email || prev.email,
            photoURL: data.photoURL || user.photoURL || '',
            whatsapp: data.whatsapp || '',
            referralCode: data.referralCode || `SANTRI-${user.uid.substring(0, 5).toUpperCase()}`,
          }));
        }
      });
      
      window.onRewardGranted = async () => {
        if (user) {
            try {
                await handleAdReward(user.uid);
                showToast("Alhamdulillah! +1 Wasilah & +100 Poin bonus berhasil diterima.", "success");
            } catch (e) {
                //
            } finally {
                setIsAdProcessing(false);
                setShowAdOfferModal(false);
            }
        }
      };

      return () => { 
        if (unsubscribeUser) unsubscribeUser(); 
        delete window.onRewardGranted;
      };
    }
  }, [user, lastCheckIn]); // Added lastCheckIn to dependencies to re-evaluate isAlreadyCheckedIn.

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try { await signInEmail(loginEmail, loginPassword); } catch (error) {} finally { setAuthLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      await signUpEmail(regEmail, regPassword, regReferralCode);
      setIsRegistering(false);
    } catch (error) {} finally { setAuthLoading(false); }
  };

  const handleResetPassword = async () => {
    if (!loginEmail) {
      showToast("Masukkan email Anda di kolom email terlebih dahulu.", "warning");
      return;
    }
    setAuthLoading(true);
    try {
      await sendPasswordReset(loginEmail);
      showToast("Link reset kata sandi telah dikirim ke email Anda.", "success");
    } catch (e) {} finally { setAuthLoading(false); }
  };

  const handleAbsensi = async () => {
    if (!user) return;
    triggerInterstitial(async () => {
      setIsCheckingIn(true);
      try {
          await handleDailyCheckIn(user.uid);
          showToast("Alhamdulillah! +1 Wasilah & +10 XP berhasil diterima.", "success");
          setTimeout(() => setShowAdOfferModal(true), 1500);
      } catch (e: any) {
          console.error("Daily check-in error in SettingsScreen:", e);
          showToast(`Gagal melakukan absensi: ${e.message || e}`, "error");
      } finally {
          setIsCheckingIn(false);
      }
    });
  };

  // Automated Daily Check-In trigger if navigated from ExplanationScreen
  useEffect(() => {
    if (user && isUserDataLoaded && location.state?.triggerCheckIn) {
      const today = new Date().toISOString().split('T')[0];
      if (lastCheckIn !== today) {
        handleAbsensi();
      } else {
        showToast("Anda sudah melakukan absensi harian hari ini.", "info");
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [user, isUserDataLoaded, location.state?.triggerCheckIn, lastCheckIn]);

  const handleWatchAdReward = () => {
    if (!user) return;
    if (window.AndroidNativeInterface?.showRewardedAd) {
        setIsAdProcessing(true);
        window.AndroidNativeInterface.showRewardedAd();
    } else {
        showToast("Fitur bonus video hanya tersedia di aplikasi Android.", "info");
        setShowAdOfferModal(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setAuthLoading(true);
    try {
      if (editData.newPassword && editData.newPassword.length >= 6) await updateUserPasswordAuth(user, editData.newPassword);
      if (user.displayName !== editData.displayName) await updateUserProfileAuth(user, { displayName: editData.displayName });
      await updateUserData(user.uid, { displayName: editData.displayName, whatsapp: editData.whatsapp, photoURL: editData.photoURL });
      showToast("Profil berhasil diperbarui", "success");
      setIsEditing(false);
    } catch (error: any) {
      showToast("Gagal: " + error.message, "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleShareReferral = () => {
    // SEKARANG SUDAH TERMASUK LINK PLAY STORE
    const text = `Ayo ngaji bareng di aplikasi Santri AI! Belajar Kitab Kuning jadi lebih mudah dengan bantuan AI.\n\nGunakan kode referral saya: *${editData.referralCode}*\n\nDownload Aplikasinya di Play Store:\n${PLAYSTORE_LINK}`;
    
    if (window.AndroidNativeInterface?.shareText) {
      window.AndroidNativeInterface.shareText('Undangan Santri AI', text);
    } else if (navigator.share) {
        navigator.share({ title: 'Referral Santri AI', text });
    } else {
        navigator.clipboard.writeText(text);
        showToast("Pesan referral disalin!", "success");
    }
  };

  const handleChangeSetting = (key: keyof AppSettings, value: any) => {
    onSaveSettings({ ...settings, [key]: value });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 flex flex-col animate-fade-in">
      
      {/* Top Header with Beautiful Emerald Gradient Background */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-slate-900 dark:to-slate-950 text-white backdrop-blur-md border-b border-emerald-500/20 dark:border-slate-800 px-4 py-4 shadow-md w-full">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 -ml-2 text-white/95 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="font-extrabold text-lg text-white flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-white/90" /> Pengaturan Aplikasi
            </h2>
          </div>
          <button 
            onClick={() => navigate('/notifications')} 
            className="relative p-2 text-white/90 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800 rounded-full transition-all flex items-center justify-center h-9 w-9"
            title="Notifikasi"
          >
            <span className="text-base leading-none select-none">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-3.5 bg-red-500 rounded-full border border-emerald-600 shadow-sm flex items-center justify-center px-1 text-[8px] font-bold text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="pb-32 pt-6 px-4 space-y-6 max-w-2xl mx-auto w-full">
      
      {/* ACCESS RESTRICTED ALERT */}
      {!user && fromFeature && (
         <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500 rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-xl shadow-emerald-500/20"
         >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                    {fromFeature === 'com' ? <MessageSquare size={24} /> : <Trophy size={24} />}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black leading-tight">Akses Terbatas</h4>
                        <button onClick={() => setFromFeature(null)} className="p-1 hover:bg-white/10 rounded-lg"><CloseIcon size={18} /></button>
                    </div>
                    <p className="text-xs font-bold text-emerald-50 opacity-90 mt-1 leading-relaxed">
                        Anda mencoba mengakses fitur <span className="underline decoration-2 underline-offset-2">{fromFeature === 'com' ? 'Silaturahmi Santri' : 'Papan Peringkat'}</span>. Silakan masuk terlebih dahulu untuk bergabung dengan komunitas.
                    </p>
                </div>
            </div>
         </motion.div>
      )}

      {/* SINKRONISASI AKUN PROMPT FOR LOGGED OUT USER */}
      {!user ? (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-emerald-500/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
              <User size={24} className="text-white" />
            </div>
            <div className="flex-grow text-left">
              <h4 className="text-lg font-black leading-tight mb-1">Masuk Akun Santri</h4>
              <p className="text-xs font-bold text-emerald-50 opacity-90 leading-relaxed">
                Aktivasikan sinkronisasi data belajar, kumpulkan poin prestasi, absensi harian, dan fitur menarik lainnya.
              </p>
              <button 
                onClick={() => navigate('/profile')} 
                className="mt-4 px-6 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl font-black text-xs active:scale-95 transition-all shadow-md"
              >
                Masuk Sekarang
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-650 to-teal-800 dark:from-slate-900 dark:to-slate-950 rounded-3xl p-4 text-white relative overflow-hidden shadow-md shadow-emerald-500/5 border-0 flex flex-col gap-3">
          {/* Geometric arabesque decorative design element */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <UserAvatar 
              photoURL={editData.photoURL || user?.photoURL || ''}
              displayName={editData.displayName || user?.displayName || 'Santri'}
              points={userDataPoints}
              size="lg"
              avatarFrame={userAvatarFrame}
              verificationBadge={userVerificationBadge}
            />
            <div className="text-left">
              <h4 className="font-extrabold text-sm text-white tracking-tight leading-none">{editData.displayName || user?.displayName || 'Santri Modern'}</h4>
              <p className="text-xs text-emerald-100/75 mt-1.5 font-semibold select-none">{editData.email || user?.email}</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/profile')}
            className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl font-extrabold text-xs tracking-wide transition-all active:scale-[0.98] cursor-pointer relative z-10 flex items-center justify-center gap-2 shadow-sm border-0"
          >
            <Edit3 size={13} className="text-slate-950 stroke-[3]" /> Edit Profil
          </button>
        </div>
      )}

      {/* SECTION 2: DATA & AKTIVITAS */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center gap-3 border-b border-orange-600/30 shadow-xs">
              <div className="p-2 bg-white/20 backdrop-blur-xs rounded-xl text-white">
                {/* Fix: Used ActivityIcon to resolve naming conflict */}
                <ActivityIcon size={18} />
              </div>
              <h3 className="font-extrabold text-white text-sm">Data & Aktivitas</h3>
          </div>
          <div className="flex flex-col">
              <MenuListItem icon={BellRing} label="Notifikasi" color="text-rose-500" onClick={() => navigate('/notifications')} />
              
              {/* Daily Attendance Reminder Notification Toggle */}
              <div className="w-full flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-center gap-4">
                      <div className="shrink-0 text-amber-500">
                          <CalendarCheck size={20} />
                      </div>
                      <div className="text-left">
                          <span className="text-sm font-semibold text-slate-705 dark:text-slate-300 block">Pengingat Absen Harian</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-tight mt-0.5">Ingatkan setiap hari untuk klaim Wasilah gratis</span>
                      </div>
                  </div>
                  <button 
                      onClick={() => handleChangeSetting('dailyAttendanceReminderEnabled', settings.dailyAttendanceReminderEnabled === undefined ? false : !settings.dailyAttendanceReminderEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative duration-200 outline-none flex items-center ${
                          (settings.dailyAttendanceReminderEnabled ?? true) ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                  >
                      <span 
                          className={`absolute bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm ${
                              (settings.dailyAttendanceReminderEnabled ?? true) ? 'translate-x-[22px]' : 'translate-x-1'
                          }`}
                      />
                  </button>
              </div>

              <MenuListItem icon={Clock} label="Jadwal Sholat & Notifikasi Adzan" color="text-green-600" onClick={() => navigate('/prayer-times')} />
              <MenuListItem icon={Newspaper} label="Penanda Berita" color="text-emerald-500" onClick={() => navigate('/news-bookmarks')} />
              <MenuListItem icon={MessageSquare} label="Penanda Postingan" color="text-indigo-500" onClick={() => navigate('/post-bookmarks')} />
              <MenuListItem icon={History} label="Riwayat Ngaji" color="text-orange-500" onClick={() => navigate('/', { state: { tab: 'history' } })} />
              <MenuListItem icon={Bookmark} label="Penanda Al-Qur'an" color="text-emerald-500" onClick={() => navigate('/quran', { state: { tab: 'bookmark' } })} />
              <MenuListItem icon={Scroll} label="Penanda Hadis" color="text-blue-500" onClick={() => navigate('/hadis', { state: { tab: 'bookmark' } })} />
              <MenuListItem icon={Heart} label="Penanda Doa" color="text-cyan-500" onClick={() => navigate('/doa', { state: { tab: 'bookmark' } })} />
              <MenuListItem icon={Star} label="Penanda Fitur" color="text-amber-500" onClick={() => navigate('/feature-bookmarks')} />
          </div>
      </div>

      {/* SECTION 3: TAMPILAN */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white flex items-center gap-3 border-b border-indigo-600/30 shadow-xs">
              <div className="p-2 bg-white/20 backdrop-blur-xs rounded-xl text-white"><Palette size={18} /></div>
              <h3 className="font-extrabold text-white text-sm">Tampilan</h3>
          </div>
          <div className="p-5 space-y-6">
              {/* Theme Selector */}
              <div className="space-y-2.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 px-1">
                      <Palette size={14} className="text-indigo-500" /> Mode Warna
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                      <button 
                        type="button"
                        onClick={() => handleChangeSetting('theme', 'light')} 
                        className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 font-bold text-[11px] transition-all duration-200 cursor-pointer ${
                          settings.theme === 'light' 
                            ? 'bg-white border-yellow-500 text-slate-800 shadow-lg ring-4 ring-yellow-400/30 scale-105 z-10' 
                            : 'bg-white border-yellow-450/40 text-slate-500 shadow-sm'
                        }`}
                      >
                          <Sun size={15} className={`transition-transform duration-300 ${settings.theme === 'light' ? 'rotate-12 text-yellow-500 scale-110' : 'text-yellow-500/60'}`} /> 
                          Terang
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleChangeSetting('theme', 'dark')} 
                        className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 font-bold text-[11px] transition-all duration-200 cursor-pointer ${
                          settings.theme === 'dark' 
                            ? 'bg-black border-yellow-500 text-yellow-400 shadow-lg ring-4 ring-yellow-400/30 scale-105 z-10' 
                            : 'bg-black border-yellow-450/40 text-slate-400 shadow-sm'
                        }`}
                      >
                          <Moon size={15} className={`transition-transform duration-350 ${settings.theme === 'dark' ? '-rotate-12 text-yellow-400 scale-110' : 'text-yellow-400/60'}`} /> 
                          Gelap
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleChangeSetting('theme', 'system')} 
                        className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 font-bold text-[11px] transition-all duration-200 cursor-pointer overflow-hidden ${
                          settings.theme === 'system' 
                            ? 'bg-gradient-to-r from-white to-black border-yellow-500 text-yellow-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] shadow-lg ring-4 ring-yellow-400/30 scale-105 z-10' 
                            : 'bg-gradient-to-r from-white to-black border-yellow-450/40 text-yellow-300/80 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.85)] shadow-sm'
                        }`}
                      >
                          <Monitor size={15} className={`transition-transform duration-300 ${settings.theme === 'system' ? 'text-yellow-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] scale-110' : 'text-yellow-300/60 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.85)]'}`} /> 
                          Sistem
                      </button>
                  </div>
              </div>
              
              {/* App Language Selector (Accordion) */}
              <div className="border border-slate-100/80 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-slate-50/30 dark:bg-slate-800/10">
                  <button 
                      type="button"
                      onClick={() => setIsLangAccordionOpen(!isLangAccordionOpen)}
                      className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 transition-colors cursor-pointer"
                  >
                      <div className="flex items-center gap-3">
                          <Globe size={16} className="text-sky-500" />
                          <div className="text-left">
                              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{t('settings.language', 'Bahasa Aplikasi')}</p>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                                  <span>{availableLanguages.find(l => l.code === currentLang)?.flag}</span>
                                  <span>{availableLanguages.find(l => l.code === currentLang)?.name}</span>
                                  {isAutoDetect && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-extrabold ml-1">
                                      Auto
                                    </span>
                                  )}
                              </p>
                          </div>
                      </div>
                      <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400">
                          {isLangAccordionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                  </button>

                  <AnimatePresence>
                      {isLangAccordionOpen && (
                          <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 p-4 border-t border-slate-100 dark:border-slate-800 space-y-3"
                          >
                              {/* Option: Auto Detect */}
                              <div className="space-y-1.5">
                                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 px-1">Deteksi Otomatis</span>
                                  <button
                                      type="button"
                                      onClick={() => {
                                          changeAppLanguageAuto(true);
                                          showToast("Bahasa diatur otomatis mengikuti sistem perangkat.", "success");
                                      }}
                                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                                          isAutoDetect
                                              ? 'bg-sky-50 dark:bg-sky-950/20 border-sky-500/50 text-sky-700 dark:text-sky-300 font-extrabold shadow-sm'
                                              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-200'
                                      }`}
                                  >
                                      <div className="flex items-center gap-2.5">
                                          <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
                                              <Globe size={15} />
                                          </div>
                                          <div>
                                              <p className="text-xs font-bold leading-tight">{t('settings.language_auto', 'Otomatis (Sesuai Sistem Perangkat)')}</p>
                                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                  Terdeteksi: {availableLanguages.find(l => l.code === systemLanguageDetected)?.flag} {availableLanguages.find(l => l.code === systemLanguageDetected)?.name}
                                              </p>
                                          </div>
                                      </div>
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isAutoDetect ? 'bg-sky-500 text-white' : 'border border-slate-300 dark:border-slate-700'}`}>
                                          {isAutoDetect && <Check size={11} strokeWidth={3} />}
                                      </div>
                                  </button>
                              </div>

                              {/* Manual Choices */}
                              <div className="space-y-1.5 pt-1">
                                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 px-1">Pilih Bahasa Manual</span>
                                  <div className="grid grid-cols-1 gap-1.5">
                                      {availableLanguages.map(lang => {
                                          const isSelected = !isAutoDetect && currentLang === lang.code;
                                          return (
                                              <button
                                                  key={lang.code}
                                                  type="button"
                                                  onClick={() => {
                                                      changeAppLanguage(lang.code);
                                                      showToast(`Bahasa diubah ke ${lang.name}`, "success");
                                                  }}
                                                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                                                      isSelected
                                                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-300 font-extrabold shadow-sm'
                                                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-200'
                                                  }`}
                                              >
                                                  <div className="flex items-center gap-2.5">
                                                      <span className="text-lg leading-none">{lang.flag}</span>
                                                      <div>
                                                          <p className="text-xs font-bold leading-tight">{lang.name}</p>
                                                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{lang.nativeName}</p>
                                                      </div>
                                                  </div>
                                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-700'}`}>
                                                      {isSelected && <Check size={11} strokeWidth={3} />}
                                                  </div>
                                              </button>
                                          );
                                      })}
                                  </div>
                              </div>
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>

              {/* Arabic Font Selector (Accordion) */}
              <div className="border border-slate-100/80 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-slate-50/30 dark:bg-slate-800/10">
                  <button 
                      type="button"
                      onClick={() => setIsFontAccordionOpen(!isFontAccordionOpen)}
                      className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 transition-colors cursor-pointer"
                  >
                      <div className="flex items-center gap-3">
                          <TypeIcon size={16} className="text-emerald-500" />
                          <div className="text-left">
                              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Jenis Font Arab</p>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                  {settings.arabicFont === 'amiri' && 'Amiri (Klasik)'}
                                  {settings.arabicFont === 'scheherazade' && 'Scheherazade'}
                                  {settings.arabicFont === 'noto' && 'Noto Naskh'}
                              </p>
                          </div>
                      </div>
                      <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400">
                          {isFontAccordionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                  </button>

                  <AnimatePresence>
                      {isFontAccordionOpen && (
                          <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 p-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5"
                          >
                              {[
                                  { id: 'amiri', name: 'Amiri (Klasik)', tag: 'Resmi', sample: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ' },
                                  { id: 'scheherazade', name: 'Scheherazade', tag: 'Naskh', sample: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ' },
                                  { id: 'noto', name: 'Noto Naskh', tag: 'Modern', sample: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ' },
                              ].map(font => (
                                  <button 
                                      key={font.id} 
                                      type="button"
                                      onClick={() => handleChangeSetting('arabicFont', font.id)} 
                                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group cursor-pointer ${
                                          settings.arabicFont === font.id 
                                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-santri-green/50 dark:border-santri-green/35 text-santri-green shadow-sm' 
                                              : 'bg-white dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700'
                                      }`}
                                  >
                                      {settings.arabicFont === font.id && (
                                          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
                                      )}
                                      
                                      <div className="space-y-1.5 flex-1 pr-3">
                                          <div className="flex items-center gap-2">
                                              <span className={`text-[9px] font-extrabold uppercase tracking-wider ${settings.arabicFont === font.id ? 'text-santri-green' : 'text-slate-400'}`}>
                                                  {font.name}
                                              </span>
                                              <span className={`text-[8px] px-1.5 py-0.2 rounded-full font-extrabold transition-all ${
                                                  settings.arabicFont === font.id 
                                                      ? 'bg-santri-green/10 text-santri-green' 
                                                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400'
                                              }`}>
                                                  {font.tag}
                                              </span>
                                          </div>
                                          <p className="text-xl font-arabic leading-relaxed" dir="rtl" style={{ fontFamily: font.id === 'amiri' ? "'Amiri', serif" : font.id === 'scheherazade' ? "'Scheherazade New', serif" : "'Noto Naskh Arabic', serif" }}>
                                              {font.sample}
                                          </p>
                                      </div>
                                      
                                      <div className="flex items-center justify-center pl-1">
                                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                              settings.arabicFont === font.id 
                                                  ? 'border-santri-green bg-santri-green text-white scale-110' 
                                                  : 'border-slate-300 dark:border-slate-600 bg-transparent'
                                          }`}>
                                              {settings.arabicFont === font.id && <Check size={9} strokeWidth={4} />}
                                          </div>
                                      </div>
                                  </button>
                              ))}
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>

              {/* Font Size Selector (Accordion) */}
              <div className="border border-slate-100/80 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-slate-50/30 dark:bg-slate-800/10">
                  <button 
                      type="button"
                      onClick={() => setIsSizeAccordionOpen(!isSizeAccordionOpen)}
                      className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 transition-colors cursor-pointer"
                  >
                      <div className="flex items-center gap-3">
                          <Sliders size={16} className="text-amber-500" />
                          <div className="text-left">
                              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Ukuran Font Arab</p>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                  {settings.fontSize}px ({settings.fontSize <= 15 ? 'Kecil' : settings.fontSize <= 20 ? 'Sedang' : settings.fontSize <= 26 ? 'Besar' : 'Sangat Besar'})
                              </p>
                          </div>
                      </div>
                      <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400">
                          {isSizeAccordionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                  </button>

                  <AnimatePresence>
                      {isSizeAccordionOpen && (
                          <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden bg-slate-50/50 dark:bg-slate-900/40 p-4 border-t border-slate-100 dark:border-slate-800 space-y-4"
                          >
                              {/* Option Presets (Pilihan Ganda) */}
                              <div className="space-y-1.5">
                                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 px-1">Pilihan Cepat (Preset)</span>
                                  <div className="grid grid-cols-4 gap-1.5">
                                      {[
                                          { name: 'Kecil', size: 14 },
                                          { name: 'Sedang', size: 18 },
                                          { name: 'Besar', size: 24 },
                                          { name: 'Ekstra', size: 30 },
                                      ].map(preset => (
                                          <button
                                              key={preset.size}
                                              type="button"
                                              onClick={() => handleChangeSetting('fontSize', preset.size)}
                                              className={`py-1.5 px-1 rounded-lg border text-center font-bold text-[10px] transition-all cursor-pointer ${
                                                  settings.fontSize === preset.size
                                                      ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-500/40 text-amber-600 dark:text-amber-405 shadow-sm font-extrabold'
                                                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                              }`}
                                          >
                                              {preset.name}
                                          </button>
                                      ))}
                                  </div>
                              </div>

                              {/* Fine Tuning Slider */}
                              <div className="space-y-1.5">
                                  <div className="flex justify-between items-center px-1">
                                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Sesuaikan Manual</span>
                                      <span className="text-[10px] font-bold text-amber-600">{settings.fontSize}px</span>
                                  </div>
                                  <div className="px-1">
                                      <input 
                                        type="range" 
                                        min="12" 
                                        max="32" 
                                        step="1"
                                        value={settings.fontSize} 
                                        onChange={(e) => handleChangeSetting('fontSize', parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-slate-150 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                                      />
                                      <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                                          <span>Kecil (12px)</span>
                                          <span>Besar (32px)</span>
                                      </div>
                                  </div>
                              </div>

                              {/* Preview Box */}
                              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-center flex flex-col justify-center items-center gap-1.5 overflow-hidden shadow-sm transition-all min-h-[96px]">
                                  <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400">Pratinjau Ukuran</span>
                                  <p 
                                    className="font-arabic font-medium leading-relaxed text-slate-800 dark:text-slate-100 transition-all duration-150 animate-in fade-in zoom-in-95 duration-150" 
                                    dir="rtl" 
                                    style={{ 
                                      fontSize: `${settings.fontSize}px`, 
                                      fontFamily: settings.arabicFont === 'amiri' ? "'Amiri', serif" : settings.arabicFont === 'scheherazade' ? "'Scheherazade New', serif" : "'Noto Naskh Arabic', serif" 
                                    }}
                                  >
                                      الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
                                  </p>
                                  <p className="text-slate-500 dark:text-slate-400 font-medium transition-all duration-150" style={{ fontSize: `${Math.max(10, settings.fontSize - 6)}px` }}>
                                      "Segala puji bagi Allah, Tuhan seluruh alam"
                                  </p>
                              </div>
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>
          </div>
      </div>

      {/* SECTION 4: INFORMASI & BANTUAN */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white flex items-center gap-3 border-b border-blue-600/30 shadow-xs">
              <div className="p-2 bg-white/20 backdrop-blur-xs rounded-xl text-white"><Info size={18} /></div>
              <h3 className="font-extrabold text-white text-sm">Informasi & Bantuan</h3>
          </div>
          <div className="flex flex-col">
              <MenuListItem icon={Heart} label="Dukung Dakwah (Infaq)" color="text-rose-500" onClick={() => navigate('/donation')} />
              <MenuListItem icon={RefreshCcw} label="Cek Update Aplikasi" color="text-amber-500" onClick={handleCheckUpdate} />
              <MenuListItem icon={Info} label="Tentang Aplikasi" color="text-sky-500" onClick={() => navigate('/info/about')} />
              <MenuListItem icon={BookOpen} label="Panduan Penggunaan" color="text-indigo-500" onClick={() => navigate('/info/guide')} />
              <MenuListItem icon={FileText} label="Syarat & Ketentuan" color="text-violet-500" onClick={() => navigate('/info/terms')} />
              <MenuListItem icon={Shield} label="Kebijakan Privasi" color="text-teal-500" onClick={() => navigate('/info/privacy')} />
              <MenuListItem icon={AlertTriangle} label="Disclaimer" color="text-orange-500" onClick={() => navigate('/info/disclaimer')} />
              <MenuListItem icon={MessageCircle} label="Hubungi Kami" color="text-pink-500" onClick={() => navigate('/info/contact')} />
              <MenuListItem icon={(props: any) => <WhatsAppIcon size={props.size || 20} colored={true} />} label="Grup WhatsApp Santri AI" color="" onClick={() => shareWaGroup()} />
              <MenuListItem icon={MessageSquare} label="Tanya Admin (Chat Langsung)" color="text-teal-500" onClick={() => navigate('/chat-admin')} />
              
              {user && (
                <MenuListItem 
                  icon={Trash2} 
                  label="Hapus Akun" 
                  color="text-red-400" 
                  isDestructive 
                  onClick={() => setShowDeleteConfirm(true)} 
                />
              )}
          </div>
          <div className="p-6 bg-slate-50/30 dark:bg-slate-800/30 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">VERSI 1.0.0 (PRODUCTION)</p>
          </div>
      </div>

      {/* AD REWARD OFFER MODAL */}
      {showAdOfferModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 text-center border-t-4 border-amber-400">
              <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Gift size={40} className="text-amber-500 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Bonus Reward!</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                Mau tambahan <strong>1 Wasilah & 100 Poin</strong> lagi? Cukup tonton video sebentar!
              </p>
              <div className="space-y-3">
                 <button 
                   onClick={handleWatchAdReward} 
                   disabled={isAdProcessing}
                   className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-amber-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                    {isAdProcessing ? <Loader2 size={18} className="animate-spin" /> : <Video size={18} />} 
                    Ambil Bonus Sekarang
                 </button>
                 <button 
                   onClick={() => setShowAdOfferModal(false)}
                   className="w-full py-3 text-slate-400 dark:text-slate-500 font-bold text-xs hover:text-slate-600 transition-colors"
                 >
                    Nanti Saja
                 </button>
              </div>
           </div>
        </div>
      )}

      <ConfirmationModal isOpen={showDeleteConfirm} title="Hapus Akun?" message="Semua data, poin, dan riwayat belajar anda akan dihapus permanen dari server kami." isDestructive={true} confirmLabel="Hapus Permanen" onConfirm={async () => { await deleteAccount(); setShowDeleteConfirm(false); }} onCancel={() => setShowDeleteConfirm(false)} />
      </div>
    </div>
  );
};

export default SettingsScreen;