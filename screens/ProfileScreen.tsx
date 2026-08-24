import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Coins, User, CalendarCheck, Sparkles, Loader2, Check, Gem,
  Settings, LogOut, Crown, BarChart, Gift, ShoppingBag, Eye, EyeOff, Mail, Lock,
  Edit3, Camera, Copy, Share2, Save, ShieldCheck, Palette, Video, ChevronRight,
  Users, UserPlus, BadgeCheck, Bell, Store, MessageCircle, ExternalLink
} from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { openExternalLink, shareWaGroup } from '../utils/linkUtils';
import { useUnreadCount } from '../hooks/useUnreadCount';
// DailyAttendanceModal replaced with AttendanceScreen
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useHistory } from '../contexts/HistoryContext';
import { 
  subscribeToUserData, 
  updateUserData, 
  subscribeToLeaderboard, 
  handleDailyCheckIn, 
  handleAdReward,
  subscribeToRewards,
  requestRedemption,
  updateUserProfileAuth,
  updateUserPasswordAuth,
  getRankDetails,
  RewardData,
  subscribeToMyReferrals,
  applyReferralCode,
  subscribeToFollowers,
  subscribeToFollowing
} from '../services/firebase';
import ConfirmationModal from '../components/ConfirmationModal';
import { LevelInfoModal } from '../components/LevelInfoModal';
import { PLAYSTORE_LINK } from '../constants';
import { ISLAMIC_PRESETS } from '../constants/avatarPresets';
import { motion } from 'motion/react';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signInEmail, signUpEmail, signOut, sendPasswordReset } = useAuth();
  const { showToast } = useToast();
  const { addToHistory } = useHistory();
  const unreadCount = useUnreadCount();

  const [levelModalOpen, setLevelModalOpen] = useState(false);

  // Profile data states from subscription
  const [userDataPoints, setUserDataPoints] = useState(0);
  const [userDataWasilah, setUserDataWasilah] = useState(0);
  const [userAvatarFrame, setUserAvatarFrame] = useState('none');
  const [userVerificationBadge, setUserVerificationBadge] = useState('none');
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [followersList, setFollowersList] = useState<string[]>([]);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [userRank, setUserRank] = useState<string | number>('-');

  // Referral states
  const [myReferrals, setMyReferrals] = useState<any[]>([]);
  const [referredByNameState, setReferredByNameState] = useState<string | null>(null);
  const [referredByState, setReferredByState] = useState<string | null>(null);
  const [friendReferralInput, setFriendReferralInput] = useState('');
  const [isApplyingReferral, setIsApplyingReferral] = useState(false);

  // General States
  const [userData, setUserData] = useState<any>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isAdProcessing, setIsAdProcessing] = useState(false);
  const [showAdOfferModal, setShowAdOfferModal] = useState(false);

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

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [editData, setEditData] = useState({
    displayName: '',
    email: '',
    photoURL: '', 
    whatsapp: '',
    referralCode: '',
    newPassword: ''
  });

  // Auth States (when unauthenticated)
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Rewards catalog
  const [rewards, setRewards] = useState<RewardData[]>([]);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({ isOpen: false, title: '', message: '', action: () => {} });

  const isAdmin = user?.email === 'admin@santrimodern.com';

  // Load rewards catalog and leaderboard rankings
  useEffect(() => {
    const unsubscribeRewards = subscribeToRewards((data) => {
      setRewards(data);
    });

    let unsubscribeLeaderboard = () => {};
    if (user) {
      unsubscribeLeaderboard = subscribeToLeaderboard((users) => {
        const rankIndex = users.findIndex(u => u.id === user.uid);
        if (rankIndex !== -1) {
          setUserRank(rankIndex + 1);
        }
      });
    }

    return () => {
      unsubscribeRewards();
      unsubscribeLeaderboard();
    };
  }, [user]);

  // Subscribe to follow/following updates in real time
  useEffect(() => {
    if (!user?.uid) {
      setFollowersList([]);
      setFollowingList([]);
      return;
    }
    const unsubFollowers = subscribeToFollowers(user.uid, (data) => {
      setFollowersList(data);
    });
    const unsubFollowing = subscribeToFollowing(user.uid, (data) => {
      setFollowingList(data);
    });
    return () => {
      unsubFollowers();
      unsubFollowing();
    };
  }, [user]);

  // Subscribe to real-time firestore details of the user
  useEffect(() => {
    let unsubscribeUser = () => {};
    let unsubscribeMyReferrals = () => {};

    if (user && user.uid) {
      unsubscribeUser = subscribeToUserData(user.uid, (data) => {
        if (data) {
          setUserData(data);
          setUserDataPoints(data.points || 0);
          setUserDataWasilah(data.wasilah || 0);
          setUserAvatarFrame(data.avatarFrame || 'none');
          setUserVerificationBadge(data.verificationBadge || 'none');
          setLastCheckIn(data.lastCheckIn || null);
          setReferredByState(data.referredBy || null);
          setReferredByNameState(data.referredByName || null);
          setEditData(prev => ({
            ...prev,
            displayName: data.displayName || user.displayName || prev.displayName,
            email: user.email || prev.email,
            photoURL: data.avatarUrl || data.photoURL || user.photoURL || '',
            whatsapp: data.whatsapp || '',
            referralCode: data.referralCode || `SANTRI-${user.uid.substring(0, 5).toUpperCase()}`,
          }));
        }
      });

      unsubscribeMyReferrals = subscribeToMyReferrals(user.uid, (data) => {
        setMyReferrals(data);
      });

      window.onRewardGranted = async () => {
        if (user) {
          try {
            await handleAdReward(user.uid);
            showToast("Alhamdulillah! +1 Wasilah & +100 Poin bonus berhasil diterima.", "success");
          } catch (e) {
            console.error("Failed to sync ad reward", e);
          } finally {
            setIsAdProcessing(false);
            setShowAdOfferModal(false);
          }
        }
      };
    }

    return () => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeMyReferrals) unsubscribeMyReferrals();
      delete window.onRewardGranted;
    };
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValue || !passwordValue) {
      showToast("Harap isi email dan kata sandi.", "warning");
      return;
    }
    setAuthLoading(true);
    try {
      await signInEmail(emailValue, passwordValue);
    } catch (err) {
      // errors handled by context toasts
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValue || !passwordValue) {
      showToast("Harap isi email dan kata sandi.", "warning");
      return;
    }
    setAuthLoading(true);
    try {
      await signUpEmail(emailValue, passwordValue, referralCodeInput);
      setIsRegistering(false);
    } catch (err) {
      // errors handled by context toasts
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!emailValue) {
      showToast("Masukkan email Anda di kolom email terlebih dahulu.", "warning");
      return;
    }
    setAuthLoading(true);
    try {
      await sendPasswordReset(emailValue);
    } catch (e) {
      //
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAbsensi = async () => {
    if (!user) return;
    navigate('/attendance');
  };

  const handleWatchAdReward = () => {
    if (!user) return;
    if (window.AndroidNativeInterface?.showRewardedAd) {
      setIsAdProcessing(true);
      window.AndroidNativeInterface.showRewardedAd();
    } else {
      showToast("Fitur bonus video hanya tersedia di aplikasi Android resmi.", "info");
      setShowAdOfferModal(false);
    }
  };

  const isAlreadyCheckedIn = () => {
    const today = new Date().toISOString().split('T')[0];
    return lastCheckIn === today;
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setAuthLoading(true);
    try {
      if (editData.newPassword && editData.newPassword.length >= 6) {
        await updateUserPasswordAuth(user, editData.newPassword);
      }
      await updateUserProfileAuth(user, { 
        displayName: editData.displayName,
        photoURL: editData.photoURL 
      });
      await updateUserData(user.uid, { 
        displayName: editData.displayName, 
        whatsapp: editData.whatsapp, 
        photoURL: editData.photoURL,
        avatarUrl: editData.photoURL
      });
      showToast("Profil berhasil diperbarui", "success");
      setIsEditing(false);
    } catch (error: any) {
      showToast("Gagal: " + (error.message || "Gagal menyimpan profil"), "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran foto maksimal adalah 2MB', 'warning');
      return;
    }

    setAuthLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setEditData(prev => ({ ...prev, photoURL: base64String }));
      setAuthLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (dataUrl: string) => {
    setEditData(prev => ({ ...prev, photoURL: dataUrl }));
  };

  const handleShareReferral = () => {
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

  const handleApplyReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!friendReferralInput.trim()) {
      showToast("Harap masukkan kode referral teman Anda.", "warning");
      return;
    }
    setIsApplyingReferral(true);
    try {
      const result = await applyReferralCode(user.uid, friendReferralInput.toUpperCase().trim());
      showToast(`Alhamdulillah! Pengajuan rujukan berhasil dikirim dan menunggu persetujuan admin. Diundang oleh: ${result.referrerName}`, "success");
      setFriendReferralInput('');
    } catch (err: any) {
      showToast(err.message || "Gagal menerapkan kode referral.", "error");
    } finally {
      setIsApplyingReferral(false);
    }
  };

  const handleRedeemReward = async (reward: RewardData) => {
    if (!user) return;
    if (userDataWasilah < reward.points) {
      showToast(`Wasilah tidak cukup. Kurang ${reward.points - userDataWasilah} wasilah lagi.`, "warning");
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: "Tukar Wasilah?",
      message: `Tukar ${reward.points} wasilah untuk hadiah "${reward.name}"?`,
      action: async () => {
        setRedeemingId(reward.id || null);
        try {
          await requestRedemption(user, reward);
          showToast("Permintaan terkirim! Admin akan memprosesnya.", "success");
        } catch (e) {
          showToast("Gagal menukar wasilah. Coba lagi.", "error");
        } finally {
          setRedeemingId(null);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 pb-32 flex flex-col animate-fade-in">
      {/* Top Header with Beautiful Emerald Gradient Background */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-slate-900 dark:to-slate-950 text-white backdrop-blur-md border-b border-emerald-500/20 dark:border-slate-800 px-4 py-4 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="p-2 -ml-2 text-white/90 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="font-semibold text-lg text-white flex items-center gap-2">
              <User className="w-5 h-5 text-white/90" /> Profil Santri
            </h2>
          </div>
          <div className="flex items-center gap-2">
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
            <button 
              onClick={() => navigate('/settings')} 
              className="p-2 text-white/90 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800 rounded-full transition-all"
              title="Pengaturan"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full flex-grow flex flex-col">
        {!user ? (
          /* Authentication Screen nested inside ProfileScreen when not logged in */
          <div className="flex-grow flex flex-col justify-center max-w-sm mx-auto w-full py-8 px-4 text-center">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-full mx-auto mb-4">
              <User size={48} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">
              {isRegistering ? "Daftar Akun Santri" : "Masuk Akun"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {isRegistering 
                ? 'Daftar sekarang untuk sinkronisasi data belajar Anda di semua perangkat.' 
                : 'Masuk kembali untuk melanjutkan riwayat belajar dan kumpulkan poin prestasi Anda.'}
            </p>

            <button 
              onClick={signIn} 
              className="w-full mb-6 h-12 bg-[#4285F4] hover:bg-[#357ae8] text-white rounded-2xl flex items-center justify-center gap-3 font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] cursor-pointer border-0"
            >
              <div className="w-6 h-6 bg-white rounded-[6px] flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.16-3.16C17.47 1.69 14.93 1 12 1 7.37 1 3.42 3.66 1.5 7.54l3.77 2.92C6.18 7.51 8.87 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.86c2.16-1.99 3.74-4.92 3.74-8.54z" />
                  <path fill="#FBBC05" d="M5.27 14.54c-.24-.71-.38-1.48-.38-2.27s.14-1.56.38-2.27L1.5 7.08C.54 9.02 0 11.19 0 13.5s.54 4.48 1.5 6.42l3.77-2.92c-.24-.71-.38-1.48-.38-2.27z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.96-1.08 7.95-2.92l-3.69-2.86c-1.12.75-2.54 1.21-4.26 1.21-3.13 0-5.82-2.47-6.77-5.42L1.5 15.93C3.42 19.81 7.37 22.46 12 23z" />
                </svg>
              </div>
              Masuk dengan Akun Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-[#FDFBF7] dark:bg-slate-950 px-2">atau dengan email</span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-grow" />
            </div>

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-3 mb-4 text-left">
              <div>
                <div className="relative">
                  <input 
                    type="email" 
                    value={emailValue} 
                    onChange={e => setEmailValue(e.target.value)} 
                    className="w-full h-12 px-4 py-3 pl-11 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400" 
                    placeholder="Alamat Email" 
                    required 
                  />
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={passwordValue} 
                    onChange={e => setPasswordValue(e.target.value)} 
                    className="w-full h-12 px-4 py-3 pl-11 pr-11 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-slate-700 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400" 
                    placeholder="Kata Sandi" 
                    required 
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {isRegistering && (
                <div>
                  <input 
                    type="text" 
                    value={referralCodeInput} 
                    onChange={e => setReferralCodeInput(e.target.value.toUpperCase())} 
                    className="w-full h-12 px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400" 
                    placeholder="Kode Referral (Opsional)" 
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={authLoading} 
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {authLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <span>{isRegistering ? "Buat Akun Baru" : "Masuk"}</span>
                )}
              </button>
            </form>

            <div className="flex flex-col gap-3">
              {!isRegistering && (
                <button 
                  onClick={handleResetPassword} 
                  className="text-xs text-slate-400 hover:text-emerald-600 transition-colors pointer shadow-none border-0 mt-3"
                >
                  Lupa Kata Sandi?
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Profile Details Screen once authenticated - CIRCLED LAYOUT MIGRATED HERE PERFECTLY */
          <div className="space-y-6 animate-slide-up w-full">
            {/* Beautiful Profile Card matching settings design perfectly - stretches edge-to-edge */}
            <div className="bg-white dark:bg-slate-900 rounded-t-none rounded-b-[2.5rem] border-b border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all w-full">
                {/* Taller background cover with integrated geometric arabesque and star-burst elements */}
                <div className="h-16 bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
                    
                    {/* Glowing decorative Rub el Hizb elements floating behind */}
                    <div className="absolute -right-4 -top-4 w-20 h-20 opacity-15 pointer-events-none">
                         <div className="absolute inset-0 bg-amber-400 rotate-45 rounded-xl"></div>
                         <div className="absolute inset-0 bg-amber-400 rounded-xl"></div>
                    </div>
                    <div className="absolute -left-6 -bottom-6 w-16 h-16 opacity-10 pointer-events-none">
                         <div className="absolute inset-0 bg-amber-300 rotate-12 rounded-lg"></div>
                    </div>
                </div>
                
                <div className="px-5 pb-5 -mt-10 relative z-10 flex flex-col items-center text-center">
                    {/* Floating Avatar block with micro-motion */}
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className="relative mb-2.5"
                    >
                        <UserAvatar 
                          photoURL={editData.photoURL}
                          displayName={editData.displayName}
                          points={userDataPoints}
                          size="lg"
                          avatarFrame={userAvatarFrame}
                          verificationBadge={userVerificationBadge}
                        />
                        {isEditing && (
                            <>
                                <button 
                                    onClick={() => document.getElementById('profile-file-input')?.click()}
                                    className="absolute inset-0 z-30 bg-black/40 rounded-full flex items-center justify-center text-white scale-[1.05] cursor-pointer animate-pulse"
                                    title="Unggah Foto Profil"
                                >
                                    <Camera size={24} />
                                </button>
                                <input
                                    type="file"
                                    id="profile-file-input"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </>
                        )}
                    </motion.div>

                    {!isEditing ? (
                        <>
                            {/* User Name & Level Badge */}
                            <div className="mb-0.5 mt-1">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-white inline-block tracking-tight">{editData.displayName || "Santri Modern"}</h2>
                                <button 
                                  onClick={() => setLevelModalOpen(true)}
                                  className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 border border-emerald-100/50 dark:border-emerald-800/40 transition-all cursor-pointer hover:scale-105 active:scale-95 leading-none"
                                  title="Klik untuk rincian Tingkat & XP"
                                >
                                    <span className="text-[10px] leading-none mb-0.5">{getRankDetails(userDataPoints).icon}</span>
                                    <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider leading-none">{getRankDetails(userDataPoints).name}</span>
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3.5">{editData.email}</p>
                             
                             {/* Follower & Following Stats */}
                             <div className="flex items-center gap-3 mb-4 justify-center self-center mx-auto w-fit">
                               <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/30 px-3 py-1.5 rounded-xl shadow-xs">
                                 <Users size={13} className="text-emerald-600 dark:text-emerald-400" />
                                 <span className="text-[12px] font-black text-emerald-800 dark:text-emerald-300">{followersList.length}</span>
                                 <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400">Pengikut</span>
                               </div>
                               <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/30 px-3 py-1.5 rounded-xl shadow-xs">
                                 <UserPlus size={13} className="text-indigo-600 dark:text-indigo-400" />
                                 <span className="text-[12px] font-black text-indigo-800 dark:text-indigo-300">{followingList.length}</span>
                                 <span className="text-[10px] uppercase font-black tracking-wider text-indigo-600 dark:text-indigo-400">Mengikuti</span>
                               </div>
                             </div>

                             {/* 3 Clickable Stats Cards matching the requested visual layout precisely (MOVED UNDER STATS) */}
                             <div className="grid grid-cols-3 gap-2 w-full mb-5 px-1">
                               {/* Card 1: Ranking */}
                               <motion.button 
                                 whileHover={{ scale: 1.02 }}
                                 whileTap={{ scale: 0.97 }}
                                 onClick={() => navigate('/leaderboard')}
                                 className="bg-gradient-to-br from-blue-200 via-indigo-100 to-violet-200 dark:from-blue-900/90 dark:via-indigo-950/90 dark:to-violet-900/80 rounded-[1.25rem] p-3 border border-blue-300 dark:border-blue-800/60 shadow-[0_4px_16px_rgba(30,41,59,0.05)] flex items-center justify-start gap-2 text-left cursor-pointer transition-all duration-300"
                               >
                                 <div className="p-1.5 rounded-xl bg-white/80 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shadow-sm shrink-0">
                                   <BarChart size={18} />
                                 </div>
                                 <div className="overflow-hidden min-w-0 leading-tight">
                                   <span className="block text-[8px] sm:text-[9.5px] font-medium text-indigo-950/70 dark:text-indigo-300 uppercase tracking-wider mb-0.5 sm:mb-1">RANKING</span>
                                   <span className="block text-xs sm:text-xs md:text-sm font-semibold text-indigo-950 dark:text-white truncate">
                                     #{userRank || '-'}
                                   </span>
                                 </div>
                               </motion.button>

                               {/* Card 2: Wasilah */}
                               <motion.button 
                                 whileHover={{ scale: 1.02 }}
                                 whileTap={{ scale: 0.97 }}
                                 onClick={() => navigate('/redeem')}
                                 className="bg-gradient-to-br from-emerald-200 via-teal-100 to-cyan-200 dark:from-emerald-900/90 dark:via-teal-950/90 dark:to-cyan-900/80 rounded-[1.25rem] p-3 border border-emerald-300 dark:border-emerald-800/60 shadow-[0_4px_16px_rgba(30,41,59,0.05)] flex items-center justify-start gap-2 text-left cursor-pointer transition-all duration-300"
                               >
                                 <div className="p-1.5 rounded-xl bg-white/80 dark:bg-emerald-900/60 text-emerald-750 dark:text-emerald-300 shadow-sm shrink-0">
                                   <Gem size={18} className="text-cyan-500 dark:text-cyan-400 fill-cyan-400/20 animate-pulse" />
                                 </div>
                                 <div className="overflow-hidden min-w-0 leading-tight">
                                   <span className="block text-[8px] sm:text-[9.5px] font-medium text-teal-950/75 dark:text-teal-350 uppercase tracking-wider mb-0.5 sm:mb-1">WASILAH</span>
                                   <span className="block text-xs sm:text-xs md:text-sm font-semibold text-emerald-950 dark:text-emerald-400 truncate">
                                     {userDataWasilah}
                                   </span>
                                 </div>
                               </motion.button>

                               {/* Card 3: Poin */}
                               <motion.button 
                                 whileHover={{ scale: 1.02 }}
                                 whileTap={{ scale: 0.97 }}
                                 onClick={() => navigate('/achievements')}
                                 className="bg-gradient-to-br from-amber-200 via-orange-100 to-yellow-250 dark:from-amber-900/90 dark:via-orange-950/90 dark:to-yellow-900/80 rounded-[1.25rem] p-3 border border-amber-300/65 dark:border-amber-800/60 shadow-[0_4px_16px_rgba(30,41,59,0.05)] flex items-center justify-start gap-2 text-left cursor-pointer transition-all duration-300"
                               >
                                 <div className="p-1.5 rounded-xl bg-white/80 dark:bg-amber-955/40 text-amber-700 dark:text-amber-300 shadow-sm shrink-0">
                                   <Coins size={18} />
                                 </div>
                                 <div className="overflow-hidden min-w-0 leading-tight">
                                   <span className="block text-[8px] sm:text-[9.5px] font-medium text-amber-955/75 dark:text-amber-300 uppercase tracking-wider mb-0.5 sm:mb-1">POIN</span>
                                   <span className="block text-xs sm:text-xs md:text-sm font-semibold text-amber-955 dark:text-amber-405 truncate">
                                     {userDataPoints.toLocaleString('id-ID')}
                                   </span>
                                 </div>
                               </motion.button>
                             </div>
                            
                            {/* CORE CONTROL HUB COMMAND GALAXY - MOVED UNDER EMAIL */}
                            <div className="flex flex-col gap-3 w-full px-1 mb-5">
                                <div className="flex gap-3 w-full">
                                    <motion.button 
                                      whileHover={{ y: -1 }}
                                      whileTap={{ scale: 0.97 }}
                                      onClick={() => setIsEditing(true)} 
                                      className="flex-1 py-3 px-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 border border-emerald-400/20 shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
                                    >
                                        <Edit3 size={14} className="text-white" /> Profil
                                    </motion.button>
                                    <motion.button 
                                      whileHover={{ y: -1 }}
                                      whileTap={{ scale: 0.97 }}
                                      onClick={() => navigate('/avatar-selection')} 
                                      className="flex-1 py-3 px-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold flex items-center justify-center gap-2 border border-indigo-400/20 shadow-md shadow-indigo-500/10 transition-all cursor-pointer"
                                    >
                                        <Palette size={14} className="text-white" /> Bingkai
                                    </motion.button>
                                </div>
                                
                                {/* Refined Interactive Daily Check-in Button */}
                                <motion.button 
                                  whileTap={{ scale: 0.98 }}
                                  onClick={handleAbsensi} 
                                  disabled={isAlreadyCheckedIn() || isCheckingIn} 
                                  className={`w-full py-3.5 rounded-2xl font-extrabold text-xs transition-transform flex items-center justify-center gap-2.5 cursor-pointer shadow-sm ${
                                    isAlreadyCheckedIn() 
                                    ? 'bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-500 border border-slate-100/80 dark:border-slate-800/80 shadow-none' 
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/10 active:scale-[0.99]'
                                  }`}
                                >
                                    {isCheckingIn ? (
                                      <Loader2 size={15} className="animate-spin" />
                                    ) : isAlreadyCheckedIn() ? (
                                      <Check size={15} className="text-emerald-500 stroke-[3]" />
                                    ) : (
                                      <CalendarCheck size={15} className="animate-bounce" />
                                    )} 
                                    {isAlreadyCheckedIn() ? "Alhamdulillah, Absen Selesai" : "Absensi Harian (+1 Wasilah, +100 XP)"}
                                </motion.button>
                            </div>
                            

                            {/* Toko Santri AI Banner */}
                            <div 
                              onClick={() => navigate('/marketplace')}
                              className="w-full mb-4 relative overflow-hidden bg-gradient-to-r from-orange-500 via-amber-600 to-red-600 rounded-3xl p-4 text-white shadow-lg cursor-pointer group active:scale-[0.98] transition-all border border-orange-400/30"
                            >
                              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l4 16 16 4-16 4-4 16-4-16-16-4 16-4z' fill='white'/%3E%3C/svg%3E")`,
                                backgroundSize: '20px 20px'
                              }}></div>

                              <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/25 shadow-md group-hover:scale-110 transition-transform shrink-0">
                                    <Store size={22} className="text-yellow-200" />
                                  </div>
                                  <div className="text-left">
                                    <div className="flex items-center gap-1.5">
                                      <h3 className="text-xs font-black uppercase tracking-wider text-white">TOKO SANTRI AI</h3>
                                      <span className="px-1.5 py-0.5 bg-yellow-400 text-slate-900 text-[8px] font-black rounded uppercase">Katalog</span>
                                    </div>
                                    <p className="text-white/90 text-[10px] font-medium leading-tight">Miliki & Jual Kitab, Busana, & Karya Santri</p>
                                  </div>
                                </div>
                                <div className="bg-white text-orange-600 px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider shadow-md group-hover:bg-yellow-300 group-hover:text-slate-950 transition-colors flex items-center gap-1 shrink-0">
                                  KUNJUNGI <ChevronRight size={12} />
                                </div>
                              </div>
                            </div>

                            {/* 3 Specialty Shops */}
                            <div className="w-full mb-4 px-1 space-y-2">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left pl-3 mb-1">Toko Fitur Spesial</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {/* Shop 1: Toko Lencana */}
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => navigate('/badge-shop')}
                                        className="w-full p-4 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white rounded-2xl border border-transparent hover:brightness-105 flex items-center justify-between text-left shadow-md shadow-purple-500/10 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center shrink-0">
                                                <BadgeCheck size={20} className="fill-white/10" />
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-black text-white uppercase leading-none mb-1">Toko Lencana</h5>
                                                <p className="text-[10px] text-purple-100 font-semibold leading-none"> Checklist verifikasi ungu, biru, & merah </p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-white" />
                                    </motion.button>

                                    {/* Shop 2: Top-Up Wasilah */}
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => navigate('/wasilah-shop')}
                                        className="w-full p-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl border border-transparent hover:brightness-105 flex items-center justify-between text-left shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center shrink-0">
                                                <Gem size={20} className="fill-current text-white/90" />
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-black text-white uppercase leading-none mb-1">Top-Up Wasilah</h5>
                                                <p className="text-[10px] text-emerald-50/90 font-semibold leading-none"> Pengisian ulang koin kebaikan terjangkau </p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-white" />
                                    </motion.button>

                                    {/* Shop 3: Bingkai Premium */}
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => navigate('/frame-shop')}
                                        className="w-full p-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white rounded-2xl border border-transparent hover:brightness-105 flex items-center justify-between text-left shadow-md shadow-amber-500/10 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center shrink-0">
                                                <Crown size={20} className="text-white fill-white/10" />
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-black text-white uppercase leading-none mb-1">Bingkai Premium</h5>
                                                <p className="text-[10px] text-amber-50/90 font-semibold leading-none"> Hiasi avatar dengan bingkai elite selamanya </p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-white" />
                                    </motion.button>
                                </div>
                            </div>

                            {/* WhatsApp Group Banner */}
                            <div className="w-full px-1 mb-4">
                              <motion.a
                                href="https://chat.whatsapp.com/Jr6Aq0VrJgxItOyoBwnSrs?s=sh&p=a&mlu=4"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => shareWaGroup(e, showToast)}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="w-full p-4 bg-gradient-to-r from-emerald-600 via-[#005a2b] to-teal-700 text-white rounded-2xl border border-emerald-400/30 flex items-center justify-between text-left shadow-md shadow-emerald-900/10 hover:brightness-105 transition-all cursor-pointer group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center shrink-0 border border-white/25">
                                    <WhatsAppIcon size={24} colored={true} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <h5 className="text-xs font-black text-white uppercase leading-none truncate">Grup WhatsApp Santri AI</h5>
                                      <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 text-[8px] font-black rounded uppercase shrink-0">Resmi</span>
                                    </div>
                                    <p className="text-[10px] text-emerald-100 font-medium leading-tight mt-1 truncate">
                                      Silaturahmi & Diskusi
                                    </p>
                                  </div>
                                </div>
                                <div className="bg-white text-emerald-800 p-2 rounded-xl group-hover:bg-amber-300 group-hover:text-amber-950 transition-colors shrink-0 shadow-xs">
                                  <ExternalLink size={14} />
                                </div>
                              </motion.a>
                            </div>

                             {/* REFERRAL CONTAINER - Boarding pass voucher style representation */}
                             <div className="w-full px-1 mb-4">
                              <div className="w-full p-4 bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-100 dark:from-emerald-950/40 dark:via-teal-900/30 dark:to-emerald-950/40 rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-800/80 flex items-center justify-between relative shadow-sm overflow-hidden">
                                  {/* Side ticket punches */}
                                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FDFBF7] dark:bg-slate-950 rounded-full border border-emerald-300 dark:border-emerald-800/80"></div>
                                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FDFBF7] dark:bg-slate-950 rounded-full border border-emerald-300 dark:border-emerald-800/80"></div>
                                  
                                  <div className="text-left pl-2 flex-1 mr-4">
                                      <p className="text-[9px] font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-0.5">Kode Referral Saya</p>
                                      <div className="inline-block bg-white/90 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-700/80 shadow-xs mb-1">
                                        <span className="text-xs font-mono font-black text-emerald-950 dark:text-amber-300 tracking-wider">{editData.referralCode}</span>
                                      </div>
                                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300 leading-tight">Dapatkan <span className="font-bold text-emerald-800 dark:text-emerald-200">30 Wasilah</span> untuk setiap teman yang berhasil diajak bergabung.</p>
                                  </div>
                                  <div className="flex gap-2">
                                      <motion.button 
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => { navigator.clipboard.writeText(editData.referralCode); showToast("Kode disalin!", "success"); }} 
                                        className="p-2.5 bg-white/70 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl shadow-sm border border-emerald-250 dark:border-emerald-850/60 cursor-pointer text-center"
                                      >
                                        <Copy size={15}/>
                                      </motion.button>
                                      <motion.button 
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleShareReferral} 
                                        className="p-2.5 bg-white/70 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl shadow-sm border border-emerald-250 dark:border-emerald-850/60 cursor-pointer text-center"
                                      >
                                        <Share2 size={15}/>
                                      </motion.button>
                                  </div>
                              </div>
                            </div>

                            {/* ENTER REFERRAL CODE COMPONENT */}
                            {!referredByState ? (
                              <div className="w-full px-1 mb-4">
                                <div className="w-full p-4 bg-gradient-to-br from-indigo-50 via-blue-50/50 to-violet-50 dark:from-indigo-950/60 dark:via-slate-900/80 dark:to-violet-950/60 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 shadow-sm animate-fade-in">
                                  <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 mb-2 flex items-center gap-1.5 text-left">
                                    <Gift size={14} className="text-indigo-600 dark:text-indigo-400" /> Gunakan Kode Referral Teman
                                  </h4>
                                  <p className="text-[10px] text-indigo-900/80 dark:text-slate-300 mb-3 leading-relaxed text-left">
                                    Dapatkan bonus <span className="font-bold text-emerald-700 dark:text-emerald-400">+10 Wasilah</span> instan dengan memasukkan kode referral pengundang Anda.
                                  </p>
                                  <form onSubmit={handleApplyReferral} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={friendReferralInput}
                                      onChange={(e) => setFriendReferralInput(e.target.value.toUpperCase())}
                                      placeholder="CONTOH: SANTRI-XXXXX"
                                      className="flex-1 h-11 px-3.5 py-2 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-700/80 outline-none text-xs font-bold font-mono tracking-wider placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white"
                                    />
                                    <button
                                      type="submit"
                                      disabled={isApplyingReferral}
                                      className="px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center cursor-pointer"
                                    >
                                      {isApplyingReferral ? <Loader2 size={14} className="animate-spin" /> : 'Gunakan'}
                                    </button>
                                  </form>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full px-1 mb-4">
                                <div className="w-full p-3.5 bg-emerald-100/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-300 dark:border-emerald-900/50 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-emerald-900/30 flex items-center justify-center shadow-sm">
                                    <Check size={16} className="text-emerald-700 dark:text-emerald-450 stroke-[3]" />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-550 uppercase tracking-widest">Diundang Oleh</p>
                                    <p className="text-xs font-black text-emerald-950 dark:text-emerald-300">{referredByNameState || 'Teman Santri'}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* MY REFERS LIST COMPONENT */}
                            <div className="w-full px-1 mb-4">
                              <div className="w-full p-4 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-950/40 dark:via-teal-905/30 dark:to-cyan-950/40 rounded-2xl border border-emerald-250 dark:border-emerald-800/65 shadow-sm text-left animate-fade-in">
                                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center justify-between">
                                  <span className="flex items-center gap-1.5">
                                    <User size={14} className="text-emerald-500" /> Teman yang Diundang
                                  </span>
                                  <span className="text-[10px] bg-emerald-100/60 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full text-emerald-700 dark:text-emerald-300 font-medium">
                                    {myReferrals.length} Pengguna
                                  </span>
                                </h4>
                                
                                {myReferrals.length === 0 ? (
                                  <div className="py-2 text-center">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Anda belum mengundang teman.</p>
                                    <button 
                                      onClick={handleShareReferral}
                                      className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 mt-1 dark:hover:text-emerald-450 bg-transparent border-0 outline-none cursor-pointer"
                                    >
                                      Mulai Undang Sekarang &rarr;
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                                    {myReferrals.map((item, index) => (
                                      <div key={item.id || index} className="flex items-center justify-between p-2.5 bg-white/70 dark:bg-slate-850/60 rounded-xl border border-emerald-100/30 dark:border-emerald-900/20">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div className="w-7 h-7 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/30 flex items-center justify-center">
                                            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-350">{(index + 1)}</span>
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{item.newUserName || item.newUserEmail?.split('@')[0] || 'User Santri'}</p>
                                            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">{item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : ''}</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <span className="inline-block text-[9px] font-semibold bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-750 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                                            +30 Wasilah
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* PANEL ADMIN (IS ADMIN USER) */}
                            {isAdmin && (
                                <button onClick={() => navigate('/admin')} className="w-full py-4 mb-4 bg-purple-600 text-white rounded-2xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
                                    <ShieldCheck size={18} /> PANEL ADMIN
                                </button>
                            )}

                            {/* KELUAR AKUN BUTTON */}
                            <div className="w-full pt-4 px-1 border-t border-slate-100 dark:border-slate-800">
                                <button onClick={async () => { await signOut(); navigate('/'); }} className="w-full py-3.5 bg-red-50/60 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-100/60 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer">
                                    <LogOut size={16} /> Keluar Akun
                                </button>
                            </div>
                        </>
                    ) : (
                        /* INLINE PROFILE EDITING */
                        <div className="w-full text-left space-y-5 pt-4 animate-in fade-in">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                <input type="text" value={editData.displayName} onChange={e => setEditData({...editData, displayName: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 outline-none focus:ring-2 focus:ring-santri-green text-sm font-bold text-slate-800 dark:text-white" />
                            </div>

                            {/* Preset Islamic Avatars */}
                            <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                              <h3 className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mb-3 text-center">
                                Pilih Karakter Avatar Islami
                              </h3>
                              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 justify-items-center">
                                {ISLAMIC_PRESETS.map((preset, idx) => {
                                  const isSelected = editData.photoURL === preset.dataUrl;
                                  return (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => handleSelectPreset(preset.dataUrl)}
                                      className={`relative p-1 rounded-full border-2 transition-all active:scale-95 flex items-center justify-center ${
                                        isSelected 
                                          ? 'border-emerald-500 scale-105 shadow-md bg-emerald-50 dark:bg-emerald-950/20' 
                                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                      }`}
                                    >
                                      <img 
                                        src={preset.dataUrl} 
                                        alt={preset.name}
                                        className="w-12 h-12 rounded-full object-cover shadow-sm bg-slate-50 dark:bg-slate-800"
                                      />
                                      {isSelected && (
                                        <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-sm">
                                          <Check size={8} strokeWidth={4} />
                                        </div>
                                      )}
                                      <span className="sr-only">{preset.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              <p className="text-[9px] text-slate-400 dark:text-slate-500 text-center uppercase tracking-wide mt-3 font-semibold leading-relaxed">
                                Ketuk salah satu karakter Islami di atas atau ketuk ikon kamera di foto profil Anda untuk mengganti foto Anda
                              </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-slate-500 text-xs">Batal</button>
                                <button onClick={handleSaveProfile} disabled={authLoading} className="flex-1 py-4 bg-santri-green text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg">{authLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Simpan</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

             {/* WASILAH REDEEM SHOP - Placed in a beautiful card below */}
            <div className="px-4 pb-6 w-full">
              <div className="bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-105 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/40 rounded-[2.5rem] p-6 border border-amber-250 dark:border-amber-900/50 shadow-sm text-left animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <h3 className="font-semibold text-amber-950 dark:text-slate-100">Katalog Hadiah Santri</h3>
                  </div>
                  <button 
                    onClick={() => navigate('/redeem')} 
                    className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    Semua Hadiah
                  </button>
                </div>
                {rewards.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">Belum ada katalog hadiah.</div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {rewards.slice(0, 4).map((reward) => (
                      <div key={reward.id} className="bg-gradient-to-br from-white/95 via-amber-50/80 to-orange-50/80 dark:from-slate-800/60 dark:to-slate-800/30 p-3 rounded-2xl border border-amber-200/60 dark:border-slate-800 relative group overflow-hidden">
                        <div className="h-20 w-full mb-2 flex items-center justify-center bg-white/70 dark:bg-slate-800 rounded-xl overflow-hidden shadow-inner">
                          {(reward.icon.startsWith('data:') || reward.icon.startsWith('http')) ? (
                            <img src={reward.icon} alt={reward.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl">{reward.icon}</span>
                          )}
                        </div>
                        <h4 className="font-medium text-slate-800 dark:text-slate-200 text-xs mb-1 line-clamp-1">{reward.name}</h4>
                        <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 mb-2">
                          <Gem size={10} className="fill-current text-cyan-400" />
                          <span className="text-xs font-semibold">{reward.points.toLocaleString()}</span>
                        </div>
                        <button 
                          onClick={() => handleRedeemReward(reward)} 
                          disabled={redeemingId === reward.id || userDataWasilah < reward.points} 
                          className={`w-full mt-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${userDataWasilah >= reward.points ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm' : 'bg-slate-200 text-slate-400 dark:bg-slate-850 dark:text-slate-500 cursor-not-allowed'}`}
                        >
                          {redeemingId === reward.id ? <Loader2 size={12} className="animate-spin" /> : <ShoppingBag size={12} />}
                          {redeemingId === reward.id ? 'Memproses...' : 'Tukar'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AD OFFER MODAL */}
      {showAdOfferModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative border-t-8 border-green-600 animate-in zoom-in-95 duration-300 text-center">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Sparkles size={36} className="text-green-600 fill-green-600/20" />
            </div>
            
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Ambil Bonus Wasilah!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
              Mau dapat tambahan bonus +1 Wasilah & +100 Poin lagi secara gratis? Tonton video singkat berikut untuk mendukung aplikasi ini.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleWatchAdReward}
                disabled={isAdProcessing}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 text-white rounded-2xl font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isAdProcessing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="fill-white" />}
                Dapatkan Wasilah Bonus
              </button>
              <button 
                onClick={() => setShowAdOfferModal(false)}
                className="w-full py-3 text-slate-400 dark:text-slate-500 font-bold text-xs hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal 
        isOpen={confirmModal.isOpen} 
        title={confirmModal.title} 
        message={confirmModal.message} 
        onConfirm={confirmModal.action} 
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
        isDestructive={false} 
      />

      {/* LEVEL INFO MODAL */}
      <LevelInfoModal 
        isOpen={levelModalOpen}
        onClose={() => setLevelModalOpen(false)}
        currentPoints={userDataPoints}
      />

      {/* Attendance is now a dedicated page at /attendance */}
    </div>
  );
};

export default ProfileScreen;
