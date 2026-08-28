
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  MessageSquare, 
  Heart, 
  Share2, 
  Plus, 
  Send, 
  User, 
  Clock, 
  MoreVertical, 
  Image as ImageIcon,
  HelpCircle,
  Hash,
  X,
  Loader2,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Sparkles,
  Search,
  Bookmark,
  AlertCircle,
  Ban,
  ChevronDown,
  ChevronUp,
  HelpingHand,
  Gift,
  Gem,
  MessageCircle,
  ExternalLink,
  Swords,
  Globe,
  Trophy,
  Users,
  Eye,
  Flame,
  Check,
  Zap,
  Pencil
} from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { openExternalLink, shareWaGroup } from '../utils/linkUtils';
import { useUnreadCount } from '../hooks/useUnreadCount';
import ConfirmationModal from '../components/ConfirmationModal';
import { LevelInfoModal } from '../components/LevelInfoModal';
import { subscribeToPublicQuizRooms, QuizRoom } from '../services/multiplayerQuizService';
import { 
  db,
  subscribeToCommunityPosts, 
  createCommunityPost, 
  togglePostLike, 
  CommunityPost, 
  addCommunityComment,
  subscribeToPostComments,
  CommunityComment,
  deleteCommunityPost,
  updateCommunityPost,
  PrayerRequest,
  subscribeToPrayerRequests,
  prayForRequest,
  togglePrayerLike,
  addPrayerComment,
  subscribeToPrayerComments,
  getRankDetails,
  updateUserStatus,
  sendSupportMessage,
  createPostReport,
  createPrayerRequest,
  followUser,
  unfollowUser,
  subscribeToFollowing,
  sendGiftToPost,
  subscribeToPostGifts,
  PostGift,
  subscribeToNotifications,
  createNotification,
  subscribeToOnlineUsersCount,
  subscribeToAllUsers,
  deductWasilahForAI,
  deleteCommunityComment,
  updateCommunityComment,
  deletePrayerComment,
  updatePrayerComment,
  subscribeToDailyAttendanceStats,
  handleNudgeUser,
  subscribeToUsersToNudge,
  getStableNudgeCandidates
} from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { PLAYSTORE_LINK } from '../constants';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { generateJson, generateAIComment } from '../services/geminiService';

const AVAILABLE_CATEGORIES = ["Harian", "Tanya Jawab", "Bantu Doa", "Fiqih", "Hadist", "Kata Mutiara", "Motivasi", "Kisah Ulama", "Biografi Ulama"];

const GIFTS = [
  { id: 'peci', name: 'Peci', icon: '👳', price: 10, xp: 10, color: 'from-amber-100 to-amber-200 dark:from-amber-950 dark:to-amber-900 border-amber-300' },
  { id: 'tasbih', name: 'Tasbih', icon: '📿', price: 25, xp: 25, color: 'from-sky-100 to-sky-200 dark:from-sky-950 dark:to-sky-900 border-sky-300' },
  { id: 'sejadah', name: 'Sajadah', icon: '🕌', price: 50, xp: 50, color: 'from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900 border-purple-300' },
  { id: 'kurma', name: 'Kurma Ajwa', icon: '🧆', price: 100, xp: 100, color: 'from-orange-100 to-orange-200 dark:from-orange-950 dark:to-orange-900 border-orange-300' },
  { id: 'koko', name: 'Baju Koko', icon: '🥋', price: 250, xp: 250, color: 'from-emerald-100 to-emerald-200 dark:from-emerald-950 dark:to-emerald-900 border-emerald-300' },
  { id: 'mukena', name: 'Mukena', icon: '🧕', price: 1000, xp: 1000, color: 'from-yellow-100 to-yellow-200 dark:from-yellow-950 dark:to-yellow-905 border-yellow-300' },
];

const HAJAT_CATEGORIES = [
  {
    id: 'kelahiran',
    title: 'Kelahiran Bayi',
    emoji: '👶',
    color: 'from-blue-500/10 to-blue-600/5 hover:border-blue-300 dark:hover:border-blue-900',
    iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/40',
    titleFull: 'Syukuran Kelahiran Anak (Tasmiyah)',
    hadith: '“Setiap bayi digadaikan dengan aqiqahnya, disembelihkan untuknya pada hari ketujuh, dicukur rambutnya, dan diberi nama.” (HR. Abu Dawud no. 2838, dinilai shahih)',
    arab: 'بَارَكَ اللهُ لَكَ فِي المَوْهُوبِ لَكَ، وَشَكَرْتَ الوَاهِبَ، وَبَلَغَ أَشُدَّهُ، وَرُزِقْتَ بِرَّهُ',
    latin: 'Bârakallâhu laka fil mawhûbi laka, wa syakartal-wâhiba, wa balagha asyuddahu, wa ruziqta birrahu',
    arti: 'Semoga Allah memberkahimu dalam anak yang dianugerahkan kepadamu, semoga kamu bersyukur kepada Sang Pemberi, semoga dia tumbuh dewasa, dan kamu dianugerahi baktinya.',
    adab: 'Disunnahkan membaca adzan di telinga kanan bayi yang baru lahir, membaca Iqamah di telinga kiri, memberi nama yang baik pada hari ketujuh, serta melakukan prosesi Aqiqah.',
    defaultDraft: 'Assalamualaikum Wr. Wb. Bismillah Alhamdulillah, telah lahir dengan sehat anak kami yang bernama [NAMA] pada [TANGGAL]. Kami memohon keikhlasan doa para kiai & rekan santri sekalian, semoga ia diridhoi Allah menjadi anak yang shholeh/shholehah, berbakti kepada orang tua, dianugerahi akal yang cerdas dan ilmu yang barokah dunia akhirat. Matur nuwun.'
  },
  {
    id: 'studi',
    title: 'Kelancaran Studi',
    emoji: '🎓',
    color: 'from-emerald-500/10 to-emerald-600/5 hover:border-emerald-300 dark:hover:border-emerald-900',
    iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40',
    titleFull: 'Kelancaran Studi & Kelulusan Ujian',
    hadith: '“Barangsiapa menempuh suatu jalan dalam rangka mencari ilmu, maka Allah akan memudahkan baginya jalan menuju surga.” (HR. Muslim no. 2699)',
    arab: 'رَبِّ زِدْنِي عِلْمًا وَارْزُقْنِي فَهْمًا وَاجْعَلْنِي مِنَ الصَّالِحِينَ',
    latin: 'Rabbi zidnî ‘ilmâ, warzuqnî fahmâ, waj‘alnî minash-shâlihîn',
    arti: 'Ya Tuhanku, tambahkanlah ilmu kepadaku, berilah aku karunia kepahaman, dan jadikanlah aku termasuk golongan orang-orang yang sholeh.',
    adab: 'Berwudhu sebelum belajar, menghadap kiblat, selalu berbakti dan takzim kepada guru/ustadz, serta menghindari maksiat agar cahaya ilmu mudah masuk ke qolbu.',
    defaultDraft: 'Assalamualaikum warahmatullahi wabarakatuh. Mohon barokah doa dan fatihahnya untuk kelancaran ujian kelayakan kitab kami/studi hafalan Al-Quran kami. Semoga diberikan keteguhan ingatan, kelapangan pikiran, kemanfaatan ilmu yang barokah, serta kelulusan dengan nilai yang diridhoi para guru kami. Amin.'
  },
  {
    id: 'kesehatan',
    title: 'Kesembuhan Sakit',
    emoji: '🏥',
    color: 'from-rose-500/10 to-rose-600/5 hover:border-rose-300 dark:hover:border-rose-900',
    iconColor: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/40',
    titleFull: 'Memohon Kesembuhan (Syafahullah)',
    hadith: '“Tidaklah seorang muslim tertimpa suatu penyakit berupa duri atau yang lebih dari itu, melainkan Allah akan menghapus dengannya kesalahan-kesalahannya.” (HR. Bukhari)',
    arab: 'اللّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا',
    latin: 'Allahumma Rabban-nâs adzhibil ba’sa isyfi Antas-Syâfî lâ syifâ’a illâ syifâ’uka syifâ’an lâ yughâdiru saqamâ',
    arti: 'Ya Allah, Tuhan segenap manusia, hilangkanlah rasa sakit, sembuhkanlah karena Engkaulah Yang Menyembuhkan, tiada kesembuhan selain kesembuhan-Mu, kesembuhan yang tidak menyisakan penyakit.',
    adab: 'Menaruh tangan pada tempat yang sakit lalu membaca Bismillah (3x) diikuti doa mohon perlindungan (7x), optimis akan takdir Allah, serta ikhtiar secara medis.',
    defaultDraft: 'Assalamualaikum kiai & santri nusantara. Dengan segala kerendahan hati kami mohon keikhlasan doanya untuk anggota keluarga kami yang sedang diuji sakit. Semoga berkat jemaah doa santri, Allah segera angkat sakitnya, lekas sembuhkan tanpa baki, dan menjadikannya penggugur dosa. Syukron jashilan.'
  },
  {
    id: 'pernikahan',
    title: 'Sakinah Mawaddah',
    emoji: '💍',
    color: 'from-purple-500/10 to-purple-600/5 hover:border-purple-300 dark:hover:border-purple-900',
    iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/40',
    titleFull: 'Pernikahan & Keluarga Sakinah',
    hadith: '“Bila seorang hamba menikah, maka sungguh ia telah menyempurnakan setengah agamanya; maka hendaklah ia bertakwa kepada Allah dalam setengah yang tersisa.” (HR. Baihaqi)',
    arab: 'بَارَكَ اللهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
    latin: 'Bârakallâhu laka wa bâraka ‘alaika wa jama‘a bainakumâ fî khair',
    arti: 'Semoga Allah memberikan keberkahan kepadamu dan melimpahkan keberkahan atasmu, serta menyatukan kalian berdua dalam kebaikan.',
    adab: 'Niat membangun baiti jannati demi ketaatan, menjaga hak dan kewajiban suami istri dengan sabar, serta mengedepankan musyawarah yang santun dilandasi kasih sayang.',
    defaultDraft: 'Bismillahirahmanirahim. Alhamdulilah kami berencana melangsungkan pernikahan suci kami. Mohon kelapangan doanya agar biduk rumah tangga yang kami bina berjalan penuh keharmonisan, sakinah mawaddah warahmah, dilimpahi keturunan sholeh-sholehah, setia dan berkah hingga husnul khotimah.'
  },
  {
    id: 'rezeki',
    title: 'Keberkahan Usaha',
    emoji: '🌾',
    color: 'from-amber-500/10 to-amber-600/5 hover:border-amber-300 dark:hover:border-amber-900',
    iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40',
    titleFull: 'Kelancaran Rezeki & Usaha Berkah',
    hadith: '“Mencari rizki yang halal adalah kewajiban setelah menunaikan kewajiban-kewajiban yang fardhu.” (HR. Thabrani)',
    arab: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
    latin: 'Allahummak-finii bi-halaalika \'an haraamika wa aghninii bi-fadhlika \'amman siwaaka',
    arti: 'Ya Allah, cukupkanlah aku dengan barang halal-Mu sehingga terhindar dari yang haram, dan kayakanlah aku dengan karunia-Mu dari selain-Mu.',
    adab: 'Mengutamakan kejujuran dalam berdagang/bekerja, menjauhi riba dan kecurangan, selalu mengeluarkan zakat/sedekah sebagai pensuci harta pengundang rizki.',
    defaultDraft: 'Assalamualaikum. Kami memohon doa barokah dari rekan-rekan santri untuk kelancaran usaha/pekerjaan yang kami jalani saat ini. Semoga Allah limpahkan rezeki yang halal, meluas, berkah, tiada putus-putus, serta dapat kami gunakan untuk kemaslahatan ibadah dakwah Islam.'
  },
  {
    id: 'kesulitan',
    title: 'Keluar Kesulitan',
    emoji: '⚓',
    color: 'from-indigo-500/10 to-indigo-600/5 hover:border-indigo-300 dark:hover:border-indigo-900',
    iconColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/40',
    titleFull: 'Menghadapi Cobaan & Kesulitan Hidup',
    hadith: '“Sesungguhnya pertolongan Allah itu datang bersama dengan kesabaran, dan kelapangan itu datang bersama kesulitan.” (HR. Ahmad)',
    arab: 'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
    latin: 'Lâ ilâha illâ anta subhânaka innî kuntu minadh-dhâlimîn',
    arti: 'Tiada Tuhan selain Engkau, Maha Suci Engkau, sesungguhnya aku termasuk orang-orang yang zhalim.',
    adab: 'Berdzikir mengulang kalimat istighfar, bertawakal mutlak, berprasangka baik (husnudzon) kepada ketentuan takdir Allah, serta mendirikan shalat sunnah Hajat.',
    defaultDraft: 'Bismillah, kami sedang menghadapi cobaan berat yang sangat menguras pikiran. Mohon limpahan doa ikhlas para santri sekalian agar kiranya Allah melunakkan hati kami dengan kesabaran, meluaskan jalan keluar tercepat, serta menggantikan kesedihan ini dengan rahmat kedamaian-Mu.'
  }
];

const CommunityScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData, signIn } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'forum' | 'doa'>('forum');
  
  // Follower and Gift state variables
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [giftingPost, setGiftingPost] = useState<CommunityPost | null>(null);
  const [selectedGift, setSelectedGift] = useState<string>('peci');
  const [giftMessage, setGiftMessage] = useState<string>('');
  const [sendingGift, setSendingGift] = useState(false);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState<'status' | 'tanya'>('status');
  const [submitting, setSubmitting] = useState(false);
  
  // Selected post for comments
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerRequest | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [generatingAIComment, setGeneratingAIComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState<string>('');
  
  // Post Edit state
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editingPostContent, setEditingPostContent] = useState<string>('');
  const [editingPostCategories, setEditingPostCategories] = useState<string[]>([]);
  const [savingEditPost, setSavingEditPost] = useState(false);

  const [postMenuId, setPostMenuId] = useState<string | null>(null);
  const [reportingPost, setReportingPost] = useState<CommunityPost | null>(null);
  const [reportReason, setReportReason] = useState<string>('Spam atau Mengganggu');
  const [customReason, setCustomReason] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [postStep, setPostStep] = useState<'content' | 'category'>('content');
  const [selectedPostCategories, setSelectedPostCategories] = useState<string[]>([]);

  const [errorSync, setErrorSync] = useState<string | null>(null);
  const unreadCount = useUnreadCount();
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [selectedLevelPoints, setSelectedLevelPoints] = useState(0);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  const [allUsersList, setAllUsersList] = useState<any[]>([]);
  const [nudgingIds, setNudgingIds] = useState<string[]>([]);
  const [dailyCheckInCount, setDailyCheckInCount] = useState(0);

  const todayStr = new Date().toISOString().split('T')[0];
  const effectiveDailyNudgeCount = userData?.lastNudgeDate === todayStr ? Math.min(userData?.dailyNudgeCount || 0, 4) : 0;

  const nudgeCandidates = React.useMemo(() => {
    if (!user || !allUsersList || allUsersList.length === 0) return [];
    return getStableNudgeCandidates(allUsersList, user.uid);
  }, [allUsersList, user]);

  const handleNudge = async (targetUser: any) => {
    if (!user) {
      showToast("Silakan login terlebih dahulu untuk menyenggol.", "info");
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const alreadyNudged = userData?.nudgedUserIds?.includes(targetUser.id) && userData?.lastNudgeDate === todayStr;
    if (alreadyNudged) {
      showToast(`Anda sudah menyenggol ${targetUser.displayName || 'santri ini'} hari ini.`, "info");
      return;
    }

    setNudgingIds((prev) => [...prev, targetUser.id]);
    try {
      const res = await handleNudgeUser(user.uid, targetUser.id);
      showToast(res.message, res.rewardEarned ? "success" : "info");

      if (res.rewardEarned || res.dailyNudgeCount === 4) {
        if (window.AndroidNativeInterface?.showInterstitialAd) {
          try {
            console.log("[AdMob] Triggering native interstitial ad for Senggol 4 Santri");
            window.AndroidNativeInterface.showInterstitialAd();
          } catch (e) {
            console.error("Gagal memanggil native AdMob Interstitial:", e);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Gagal mengirim senggolan.", "error");
    } finally {
      setNudgingIds((prev) => prev.filter((id) => id !== targetUser.id));
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAllUsers((users) => {
      setAllUsersList(users);
      const profileMap: Record<string, any> = {};
      users.forEach((u) => {
        profileMap[u.id] = {
          displayName: u.displayName || u.name || 'Santri',
          photoURL: u.avatarUrl || u.photoURL || '',
          points: u.points || 0,
          avatarFrame: u.avatarFrame || 'none',
          verificationBadge: u.verificationBadge || 'none',
          role: u.role || 'user'
        };
      });
      setUserProfiles(profileMap);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Online Users count subscription
  useEffect(() => {
    const unsubscribe = subscribeToOnlineUsersCount((count) => {
      setOnlineCount(count);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Daily Attendance Stats subscription for Nusantara progress
  useEffect(() => {
    const unsubscribe = subscribeToDailyAttendanceStats((data) => {
      setDailyCheckInCount(data.count);
    });
    return () => unsubscribe();
  }, []);

  // Real-time subscription to users who haven't checked-in today for Senggol Absen
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUsersToNudge(user.uid, (data) => {
      setAllUsersList(data);
    });
    return () => unsubscribe();
  }, [user]);

  // Real-time Public Cerdas Cermat Rooms subscription
  const [quizRooms, setQuizRooms] = useState<QuizRoom[]>([]);
  useEffect(() => {
    const unsubscribe = subscribeToPublicQuizRooms(
      (rooms) => setQuizRooms(rooms),
      (err) => console.error('Error fetching Cerdas Cermat rooms in Silaturahmi:', err)
    );
    return () => unsubscribe();
  }, []);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    if (!isModalOpen) {
      setPostStep('content');
      setSelectedPostCategories([]);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!user) {
      setFollowingList([]);
      return;
    }
    const unsubscribe = subscribeToFollowing(user.uid, (data) => {
      setFollowingList(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleFollowToggle = async (targetUserId: string) => {
    if (!user) {
      showToast("Silakan login terlebih dahulu untuk mengikuti.", "info");
      return;
    }
    if (targetUserId === user.uid) {
      showToast("Anda tidak dapat mengikuti diri sendiri.", "warning");
      return;
    }
    const isFollowing = followingList.includes(targetUserId);
    try {
      if (isFollowing) {
        await unfollowUser(user.uid, targetUserId);
        showToast("Batal mengikuti.", "success");
      } else {
        await followUser(user.uid, targetUserId);
        showToast("Berhasil mengikuti!", "success");
      }
    } catch (error) {
      console.error("Error toggle follow:", error);
      showToast("Gagal mengubah status ikuti.", "error");
    }
  };

  const handleSendGift = async (postId: string, postAuthorId: string, postAuthorName: string) => {
    if (!user) {
      showToast("Silakan login terlebih dahulu untuk mengirim kado.", "info");
      return;
    }
    if (postAuthorId === user.uid) {
      showToast("Anda tidak dapat mengirim kado ke postingan Anda sendiri.", "warning");
      return;
    }
    
    const giftConfig = GIFTS.find(g => g.id === selectedGift);
    if (!giftConfig) return;

    const userWasilah = userData?.wasilah || 0;
    if (userWasilah < giftConfig.price) {
      showToast(`Saldo Wasilah Anda tidak cukup (${userWasilah} Wasilah). Silakan top-up di menu Premium.`, "error");
      return;
    }

    setSendingGift(true);
    try {
      await sendGiftToPost(
        postId,
        postAuthorId,
        postAuthorName,
        user.uid,
        userData?.displayName || user.displayName || 'Santri',
        giftConfig.id,
        giftConfig.name,
        giftConfig.icon,
        giftConfig.price,
        giftConfig.xp || 0,
        giftMessage,
        userData
      );
      showToast(`Berhasil mendonasikan ${giftConfig.name}! Semoga menjadi amal jariyah.`, "success");
      setGiftMessage('');
      setGiftingPost(null);
    } catch (error: any) {
      console.error("Gifting error:", error);
      showToast(error.message || "Gagal mendonasikan kado.", "error");
    } finally {
      setSendingGift(false);
    }
  };

  const getTimestampMillis = (ts: any) => {
    if (!ts) return 0;
    if (ts.seconds) return ts.seconds * 1000;
    if (ts.toMillis) return ts.toMillis();
    if (typeof ts === 'number') return ts;
    const parsed = Date.parse(ts);
    return isNaN(parsed) ? 0 : parsed;
  };

  const getPrayerCategoryLabel = (categoryKey: string) => {
    const mapping: Record<string, string> = {
      'meninggal': 'Meninggal',
      'tahlil_haul': 'Tahlil/Haul',
      'kelahiran': 'Kelahiran',
      'khitanan': 'Khitanan',
      'dapat_jodoh': 'Dapat Jodoh',
      'pernikahan': 'Pernikahan',
      'rumah_baru': 'Rumah Baru',
      'lunas_hutang': 'Lunas Hutang',
      'syukuran': 'Syukuran',
      'musibah': 'Musibah',
      'usaha': 'Usaha',
      'kesembuhan': 'Kesembuhan',
      'dapat_kerja': 'Dapat Kerja',
    };
    return mapping[categoryKey] || categoryKey;
  };

  type FeedItem = 
    | ({ isPrayerRequest: false } & CommunityPost)
    | ({ isPrayerRequest: true } & PrayerRequest);

  useEffect(() => {
    setLoading(true);
    let postsLoaded = false;
    let prayersLoaded = false;

    const checkFinished = () => {
      if (postsLoaded && prayersLoaded) {
        setLoading(false);
      }
    };

    const unsubscribePosts = subscribeToCommunityPosts(
      (data) => {
        setPosts(data);
        postsLoaded = true;
        checkFinished();
        setErrorSync(null);
      },
      (error: any) => {
        console.error("Posts Subscription error", error);
        setErrorSync(error?.message || "Gagal memuat data. Silakan hubungi admin untuk aktivasi.");
        postsLoaded = true;
        checkFinished();
      }
    );

    const unsubscribePrayers = subscribeToPrayerRequests(
      (data) => {
        setPrayers(data);
        prayersLoaded = true;
        checkFinished();
        setErrorSync(null);
      },
      (error: any) => {
        console.error("Prayers Subscription error", error);
        setErrorSync(error?.message || "Gagal memuat data. Silakan hubungi admin untuk aktivasi.");
        prayersLoaded = true;
        checkFinished();
      }
    );

    return () => {
      unsubscribePosts();
      unsubscribePrayers();
    };
  }, []);

  // Auto open post or prayer request when navigated from notifications
  useEffect(() => {
    const targetId = location.state?.targetId || location.state?.highlightPostId || location.state?.highlightPrayerId;
    if (!targetId) return;

    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }

    // 1. Match in loaded posts
    const matchedPost = posts.find(p => p.id === targetId);
    if (matchedPost) {
      setSelectedPost(matchedPost);
      setTimeout(() => {
        const el = document.getElementById(`post-${targetId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      return;
    }

    // 2. Match in loaded prayers
    const matchedPrayer = prayers.find(p => p.id === targetId);
    if (matchedPrayer) {
      setActiveTab('doa');
      setSelectedPrayer(matchedPrayer);
      setTimeout(() => {
        const el = document.getElementById(`prayer-${targetId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      return;
    }

    // 3. Fallback: fetch directly from Firestore if not yet in list
    let isCancelled = false;
    const fetchTarget = async () => {
      try {
        const postSnap = await getDoc(doc(db, 'posts', targetId));
        if (postSnap.exists() && !isCancelled) {
          setSelectedPost({ id: postSnap.id, ...postSnap.data() } as CommunityPost);
          return;
        }

        const prayerSnap = await getDoc(doc(db, 'prayer_requests', targetId));
        if (prayerSnap.exists() && !isCancelled) {
          setActiveTab('doa');
          setSelectedPrayer({ id: prayerSnap.id, ...prayerSnap.data() } as PrayerRequest);
        }
      } catch (err) {
        console.error("Error fetching notification target in CommunityScreen:", err);
      }
    };

    fetchTarget();
    return () => { isCancelled = true; };
  }, [location.state, posts, prayers]);

  const displayPosts = (() => {
    const postItems = posts.map(p => ({ ...p, isPrayerRequest: false as const }));
    const prayerItems = prayers.map(p => ({ ...p, isPrayerRequest: true as const }));

    const filteredPosts = postItems.filter(post => {
      const matchesSearch = !searchQuery.trim() ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.userName.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      if (selectedCategory === 'Semua') return true;
      if (post.categories?.includes(selectedCategory)) return true;
      if (selectedCategory === 'Tanya Jawab' && post.type === 'tanya') return true;
      if (selectedCategory === 'Harian' && post.type === 'status' && (!post.categories || post.categories.length === 0)) return true;
      
      return false;
    });

    const filteredPrayers = prayerItems.filter(p => {
      const matchesSearch = !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.userName.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      if (selectedCategory === 'Semua' || selectedCategory === 'Minta Doa' || selectedCategory === 'Bantu Doa') return true;
      
      return false;
    });

    const combined: FeedItem[] = [...filteredPosts, ...filteredPrayers];
    return combined.sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
  })();

  const displayPrayers = prayers.filter(p => 
    !searchQuery.trim() ||
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );


  useEffect(() => {
    if (selectedPost) {
      const unsubscribe = subscribeToPostComments(selectedPost.id!, (data) => {
        setComments(data);
      });
      return () => unsubscribe();
    }
    if (selectedPrayer) {
      const unsubscribe = subscribeToPrayerComments(selectedPrayer.id!, (data) => {
        setComments(data);
      });
      return () => unsubscribe();
    }
  }, [selectedPost, selectedPrayer]);

  const openCreatePostModal = () => {
    if (userData?.status === 'Banned') {
      showToast("Akun Anda ditangguhkan! Anda tidak dapat membagikan status karena melanggar ketentuan komunitas.", "error");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCreatePost = async () => {
    if (!user) {
      showToast("Gagal mengirim. Mohon login kembali.", "error");
      return;
    }
    if (userData?.status === 'Banned') {
      showToast("Akun Anda ditangguhkan! Anda tidak dapat membagikan status karena melanggar ketentuan komunitas.", "error");
      return;
    }
    if (!newPostContent.trim()) return;
    if (selectedPostCategories.length === 0) {
      showToast("Pilih minimal 1 kategori.", "error");
      return;
    }
    if (selectedPostCategories.length > 3) {
      showToast("Pilih maksimal 3 kategori.", "error");
      return;
    }
    
    setSubmitting(true);
    try {
      await createCommunityPost(user, newPostContent, postType, userData, selectedPostCategories);
      setNewPostContent('');
      setSelectedPostCategories([]);
      setPostStep('content');
      setIsModalOpen(false);
      showToast("Postingan berhasil dibagikan!", "success");
    } catch (e) {
      showToast("Gagal membagikan status.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEditPost = async () => {
    if (!editingPost || !editingPostContent.trim()) {
      showToast("Isi postingan tidak boleh kosong.", "error");
      return;
    }
    setSavingEditPost(true);
    try {
      await updateCommunityPost(editingPost.id!, editingPostContent.trim(), editingPostCategories);
      setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, content: editingPostContent.trim(), categories: editingPostCategories } : p));
      showToast("Postingan berhasil diperbarui!", "success");
      setEditingPost(null);
    } catch (err) {
      console.error("Error updating post:", err);
      showToast("Gagal memperbarui postingan.", "error");
    } finally {
      setSavingEditPost(false);
    }
  };

  const togglePostCategorySelection = (cat: string) => {
    setSelectedPostCategories(prev => {
      if (prev.includes(cat)) {
        return prev.filter(c => c !== cat);
      } else {
        if (prev.length >= 3) {
          showToast("Maksimal memilih 3 kategori.", "info");
          return prev;
        }
        return [...prev, cat];
      }
    });
  };

  const handleLike = async (id: string, likes: string[] | undefined, type: 'post' | 'prayer') => {
    if (!user) return;
    const safeLikes = likes || [];
    const isLiked = safeLikes.includes(user.uid);
    try {
      if (type === 'post') {
        await togglePostLike(id, user.uid, isLiked);
      } else {
        await togglePrayerLike(id, user.uid, isLiked);
      }
    } catch (e) {
      console.error("Like error", e);
    }
  };

  const handleCommentClick = (prayer: PrayerRequest) => {
    if (!user) {
      showToast("Silakan login terlebih dahulu untuk mendoakan.", "info");
      return;
    }
    
    const isVerified = userData?.verificationBadge === 'badge_purple' || 
                       userData?.verificationBadge === 'badge_blue' || 
                       userData?.verificationBadge === 'badge_red';
                       
    if (!isVerified) {
      showToast("Mendoakan lewat komentar eksklusif untuk Anggota Terverifikasi. Silakan aktifkan paket verifikasi terlebih dahulu.", "warning");
      navigate('/badge-shop');
      return;
    }

    setSelectedPrayer(prayer);
    if (!prayer.prayers.includes(user.uid) && prayer.status !== 'completed') {
      showToast("Silakan tulis doa terbaik Anda pada komentar untuk mendoakan & meraih Wasilah!", "info");
    }
  };

  const handleGenerateAIComment = async () => {
    if (!user) {
      showToast("Silakan login terlebih dahulu untuk menggunakan fitur ini.", "info");
      return;
    }
    const userWasilah = userData?.wasilah || 0;
    if (userWasilah < 1) {
      showToast("Saldo Wasilah Anda tidak cukup (butuh 1 Wasilah). Silakan top-up di menu Premium.", "error");
      return;
    }

    const postContent = selectedPost?.content || selectedPrayer?.title || "";
    if (!postContent.trim()) {
      showToast("Gagal membaca konten postingan.", "error");
      return;
    }

    setGeneratingAIComment(true);
    try {
      // Deduct Wasilah
      await deductWasilahForAI(user.uid, 1, "Komentar Otomatis AI");
      // Generate comment
      const aiResponse = await generateAIComment(postContent, !!selectedPrayer);
      setNewComment(aiResponse);
      showToast("Komentar AI berhasil dibuat! (1 Wasilah telah digunakan)", "success");
    } catch (e: any) {
      console.error("Gagal membuat komentar AI:", e);
      showToast("Gagal membuat komentar AI. Silakan coba lagi.", "error");
    } finally {
      setGeneratingAIComment(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || (!selectedPost && !selectedPrayer) || !newComment.trim()) return;
    setSubmittingComment(true);
    try {
      if (selectedPost) {
        await addCommunityComment(selectedPost.id!, user, newComment, userData);
        showToast("Komentar berhasil dikirim.", "success");
      } else {
        await addPrayerComment(selectedPrayer!.id!, user, newComment, userData);
        
        // Periksa apakah pengguna belum mendoakan
        const activePrayer = prayers.find(p => p.id === selectedPrayer!.id) || selectedPrayer!;
        if (!activePrayer.prayers.includes(user.uid) && activePrayer.status !== 'completed') {
          const isVerified = userData?.verificationBadge === 'badge_purple' || 
                             userData?.verificationBadge === 'badge_blue' || 
                             userData?.verificationBadge === 'badge_red';
          if (isVerified) {
            await prayForRequest(activePrayer.id!, user.uid, user.displayName || 'Santri', activePrayer.rewardAmount);
            showToast(`Aamiin! Komentar Anda terkirim. Anda berhasil mendoakan dan mendapatkan ${activePrayer.rewardAmount} Wasilah.`, "success");
          } else {
            showToast("Komentar berhasil dikirim.", "success");
          }
        } else {
          showToast("Komentar berhasil dikirim.", "success");
        }
      }
      setNewComment('');
    } catch (e) {
      showToast("Gagal mengirim komentar.", "error");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (!user) {
      showToast("Silakan login terlebih dahulu.", "info");
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: "Hapus Komentar",
      message: "Apakah Anda yakin ingin menghapus komentar ini?",
      onConfirm: async () => {
        try {
          if (selectedPost) {
            await deleteCommunityComment(selectedPost.id!, commentId);
          } else if (selectedPrayer) {
            await deletePrayerComment(selectedPrayer.id!, commentId);
          }
          showToast("Komentar berhasil dihapus.", "success");
        } catch (err) {
          console.error("Gagal menghapus komentar:", err);
          showToast("Gagal menghapus komentar.", "error");
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingCommentText.trim()) {
      showToast("Komentar tidak boleh kosong.", "warning");
      return;
    }
    try {
      if (selectedPost) {
        await updateCommunityComment(selectedPost.id!, commentId, editingCommentText);
      } else if (selectedPrayer) {
        await updatePrayerComment(selectedPrayer.id!, commentId, editingCommentText);
      }
      setEditingCommentId(null);
      setEditingCommentText('');
      showToast("Komentar berhasil diperbarui.", "success");
    } catch (err) {
      console.error("Gagal memperbarui komentar:", err);
      showToast("Gagal memperbarui komentar.", "error");
    }
  };

  const handleDelete = async (postId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Postingan",
      message: "Apakah Anda yakin ingin menghapus postingan ini?",
      onConfirm: async () => {
        try {
          await deleteCommunityPost(postId);
          showToast("Postingan dihapus.", "success");
        } catch (e) {
          showToast("Gagal menghapus.", "error");
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSaveBookmark = (post: CommunityPost) => {
    try {
      const savedStr = localStorage.getItem('santri_post_bookmarks') || '[]';
      const saved = JSON.parse(savedStr) as CommunityPost[];
      const isSaved = saved.some(item => item.id === post.id);
      
      let updated: any[] = [];
      if (isSaved) {
        updated = saved.filter(item => item.id !== post.id);
        showToast("Postingan dihapus dari Penanda.", "info");
      } else {
        const postWithTime = {
          ...post,
          savedAt: new Date().toISOString()
        };
        updated = [...saved, postWithTime];
        showToast("Postingan disimpan ke Penanda!", "success");
      }
      localStorage.setItem('santri_post_bookmarks', JSON.stringify(updated));
      setPostMenuId(null);
    } catch (e) {
      showToast("Gagal menyimpan penanda.", "error");
    }
  };

  const handleReportPostSubmit = async () => {
    if (!user || !reportingPost) return;
    const finalReason = reportReason === 'Lainnya' ? customReason : reportReason;
    if (!finalReason.trim()) {
      showToast("Tulis alasan pelaporan Anda.", "warning");
      return;
    }

    try {
      await createPostReport({
        postId: reportingPost.id!,
        postContent: reportingPost.content,
        postUserId: reportingPost.userId,
        postUserName: reportingPost.userName,
        reportedById: user.uid,
        reportedByName: user?.displayName || 'Santri',
        reason: finalReason
      });
      showToast("Laporan terkirim! Admin kami akan meninjau dalam 24 jam.", "success");
      setReportingPost(null);
      setReportReason('Spam atau Mengganggu');
      setCustomReason('');
    } catch (err) {
      showToast("Gagal mengirim laporan.", "error");
    }
  };

  const formatTime = (ts: any) => {
    if (!ts) return '1 m';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
    if (diffSecs < 60) return 'Baru saja';
    
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} m`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} j`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} H`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} bln`;
    
    return `${Math.floor(diffDays / 365)} thn`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 text-center font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl max-w-sm w-full"
        >
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white mb-3 leading-tight">Akses Terbatas</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
            Silakan masuk untuk bergabung dengan forum Silaturahmi Santri dan menebar manfaat.
          </p>
          <button 
            onClick={() => signIn()}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all mb-4"
          >
            Masuk Sekarang
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
          >
            Kembali
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans">
      {/* Unified Elegant Islamic Header - Consistent with Pusat Maktabah header but with navigation */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#005a2b] to-teal-900 dark:from-emerald-950 dark:via-emerald-900 dark:to-slate-950 text-white pt-3.5 pb-3 px-3.5 sm:px-5 rounded-b-[1.75rem] shadow-lg border-b border-emerald-500/20 sticky top-0 z-50 flex items-center justify-between gap-2.5 transition-all mb-4 backdrop-blur-md">
        {/* Left Side: Back Navigation & Title Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1.5 -ml-1 text-white/90 hover:text-white rounded-xl hover:bg-white/10 active:scale-95 transition-all shrink-0"
            title="Kembali"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-black tracking-tight leading-none text-white whitespace-nowrap">Silaturahmi</h1>
              <span className="bg-gradient-to-r from-amber-300 to-amber-400 text-amber-950 text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs border border-amber-200 shrink-0">SANTRI</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-emerald-100/90 uppercase tracking-wider font-bold mt-1 leading-none flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="whitespace-nowrap">{onlineCount} SANTRI ONLINE</span>
            </p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Wasilah Display */}
          <div className="flex items-center gap-1 bg-white/15 dark:bg-emerald-900/60 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-white/20 shadow-xs">
            <Gem size={13} className="text-cyan-300 fill-cyan-400/20 animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-black text-white font-mono">
              {(userData?.wasilah || 0).toLocaleString()}
            </span>
          </div>

          <button 
            onClick={() => navigate('/notifications')} 
            className="relative p-2 text-white/90 hover:text-white hover:bg-white/10 active:scale-95 rounded-xl transition-all"
            title="Notifikasi"
          >
             <span className="text-lg leading-none select-none">🔔</span>
             {unreadCount > 0 && (
               <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-3.5 bg-red-500 rounded-full border border-emerald-900 shadow-sm flex items-center justify-center px-1 text-[8px] font-bold text-white animate-pulse">
                 {unreadCount}
               </span>
             )}
          </button>
          <button 
            onClick={() => navigate('/settings')} 
            className="active:scale-95 transition-all p-0.5 text-white bg-white/15 rounded-full hover:bg-white/25 border border-white/20 shadow-xs shrink-0"
            title="Profil Pengguna"
          >
            <UserAvatar 
              photoURL={userData?.avatarUrl || userData?.photoURL || user?.photoURL}
              displayName={user?.displayName}
              points={userData?.points || 0}
              size="md"
              avatarFrame={userData?.avatarFrame}
              verificationBadge={userData?.verificationBadge}
            />
          </button>
        </div>
      </div>

      {/* Modern Search & Tabs Section - Styled like clean cards to look extremely tidy and consistent */}
      <div className="max-w-2xl mx-auto px-5 mt-4">
        {/* WhatsApp Group Santri AI Banner */}
        <motion.a
          href="https://chat.whatsapp.com/Jr6Aq0VrJgxItOyoBwnSrs?s=sh&p=a&mlu=4"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => shareWaGroup(e)}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-between p-3.5 mb-2.5 bg-gradient-to-r from-emerald-700 via-[#005a2b] to-teal-800 text-white rounded-[1.5rem] shadow-md shadow-emerald-900/10 hover:shadow-lg transition-all group border border-emerald-500/30"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 border border-white/25">
              <WhatsAppIcon size={22} colored={true} />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-white truncate">Grup WhatsApp Santri AI</h4>
                <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 text-[8px] font-black rounded uppercase shrink-0">Komunitas</span>
              </div>
              <p className="text-[9.5px] text-emerald-100/90 font-medium leading-tight truncate">Silaturahmi & Diskusi</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 bg-white text-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-wider group-hover:bg-amber-300 group-hover:text-amber-950 transition-colors shadow-xs shrink-0">
            Gabung <ExternalLink size={11} />
          </div>
        </motion.a>

        {/* Banner Room Cerdas Cermat Versus Online di Fitur Silaturahmi */}
        <motion.div
          whileHover={{ y: -1 }}
          className="mb-3 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white rounded-[1.5rem] p-3.5 sm:p-4 shadow-lg shadow-purple-900/10 border border-purple-500/30 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 bg-purple-600/80 rounded-xl flex items-center justify-center text-base border border-purple-400/40 shrink-0 select-none">
                ⚔️
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">Room Cerdas Cermat</h4>
                  <span className="px-1.5 py-0.2 bg-purple-500/50 text-purple-200 text-[8px] font-black rounded border border-purple-400/30 shrink-0">
                    VERSUS ONLINE ⚔️
                  </span>
                </div>
                <p className="text-[9.5px] text-purple-200/90 font-medium leading-tight truncate">
                  Adu wawasan syariat & daya ingat secara real-time
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/quiz-pro')}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1 shrink-0 active:scale-95"
            >
              <span className="text-xs">🏆</span>
              <span>Main Versus</span>
            </button>
          </div>

          {/* List Arena Aktif */}
          {quizRooms.filter(r => r.status !== 'finished').length > 0 ? (
            <div className="space-y-2 pt-2 border-t border-purple-700/50">
              <div className="flex items-center justify-between text-[10px] font-bold text-purple-200">
                <span className="flex items-center gap-1 font-black">
                  <Globe size={12} className="text-purple-300 animate-spin-slow" /> Arena Aktif Silaturahmi:
                </span>
                <span className="bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-400/30 font-black">
                  {quizRooms.filter(r => r.status !== 'finished').length} Room Live
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quizRooms.filter(r => r.status !== 'finished').slice(0, 2).map((room) => {
                  const playerCount = Object.keys(room.players || {}).length;
                  const isLive = room.status === 'playing' || room.status === 'question_result';
                  return (
                    <div
                      key={room.roomCode}
                      onClick={() => navigate('/quiz-pro', { state: { initialRoomCode: room.roomCode, initialAction: isLive ? 'spectate' : 'join' } })}
                      className="p-2.5 bg-white/10 dark:bg-slate-900/60 rounded-xl border border-white/15 hover:border-purple-400/60 transition-all flex items-center justify-between gap-2 cursor-pointer active:scale-95"
                    >
                      <div className="min-w-0 pointer-events-none">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-extrabold text-xs text-white truncate">
                            {room.roomName || 'Majlis Ilmi'}
                          </span>
                          {isLive ? (
                            <span className="bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-md animate-pulse shrink-0">
                              LIVE
                            </span>
                          ) : (
                            <span className="bg-amber-400/30 text-amber-200 text-[8px] font-black px-1.5 py-0.2 rounded-md shrink-0">
                              Lobby
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-purple-200/80 font-medium mt-0.5 pointer-events-none">
                          <span className="truncate">Host: {room.hostName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 shrink-0"><Users size={10} /> {playerCount}/{room.maxPlayers || 100}</span>
                        </div>
                      </div>

                      <button
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9.5px] font-black transition-all shrink-0 flex items-center gap-1 shadow-xs pointer-events-none"
                      >
                        {isLive ? <Eye size={11} /> : <span className="text-[10px]">⚔️</span>}
                        <span>{isLive ? 'Lihat' : 'Masuk'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-center flex items-center justify-between gap-2">
              <span className="text-[10px] text-purple-200/90 font-semibold pl-1">
                Belum ada arena aktif saat ini. Buat arena pertama!
              </span>
              <button
                onClick={() => navigate('/quiz-pro', { state: { initialAction: 'create' } })}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[9.5px] font-black rounded-lg cursor-pointer transition-all shrink-0 active:scale-95 flex items-center gap-1"
              >
                <span>⚔️</span>
                <span>+ Buat Room</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Fitur Absen Berjamaah (Komunitas Santri) */}
        <motion.div
          whileHover={{ y: -1 }}
          className="mb-4 bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-950 text-white border-0 rounded-[2rem] p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-4"
        >
          {/* Decorative background glow lights */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5 relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/20 shrink-0">
                <Flame size={20} className="fill-white/20 animate-pulse text-amber-300" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black uppercase tracking-wider text-white">
                  Pengingat Absensi
                </h4>
                <p className="text-[11px] text-emerald-100 font-bold leading-none mt-0.5">
                  Saling dukung istiqomah dengan santri lainnya se-Indonesia
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* Daily Nudge Counter Badge */}
              <span className="text-[10px] font-black text-amber-300 px-3 py-1 bg-white/10 rounded-full border border-white/15 whitespace-nowrap">
                Senggolan Hari Ini: {effectiveDailyNudgeCount}/4
              </span>
              <span className="bg-amber-400 text-slate-900 text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md tracking-wider">
                ⚡ LIVE
              </span>
            </div>
          </div>

          {/* Progress Bar & Stat */}
          <div className="bg-white/10 dark:bg-black/20 rounded-2xl p-4 border border-white/10 space-y-3 relative z-10">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-emerald-50 flex items-center gap-1.5">
                📊 Tingkat Absensi Komunitas Hari Ini
              </span>
              <span className="font-black text-amber-300 bg-white/10 px-2.5 py-1 rounded-xl text-xs sm:text-sm">
                {Math.min(100, dailyCheckInCount)}% Santri
              </span>
            </div>
            
            {/* Elegant Custom Progress Bar */}
            <div className="w-full h-3.5 bg-black/20 rounded-full overflow-hidden p-[2px] shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-teal-400 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-1.5 text-[8.5px] font-black text-slate-900"
                style={{ width: `${Math.min(100, dailyCheckInCount)}%` }}
              >
                {Math.round(Math.min(100, dailyCheckInCount)) > 8 && `${Math.round(Math.min(100, dailyCheckInCount))}%`}
              </div>
            </div>
            
            <p className="text-[10.5px] sm:text-xs text-emerald-100 font-medium leading-relaxed italic text-center">
              "Alhamdulillah, {Math.min(100, dailyCheckInCount)}% Santri se-Indonesia sudah absen istiqomah hari ini! Tetap pertahankan barisan jamaah."
            </p>
          </div>

          {/* Nudge Friends Grid (Responsive Deck Layout) */}
          {effectiveDailyNudgeCount >= 4 ? (
            <div className="text-center py-7 bg-white/10 border border-white/15 rounded-2xl p-5 space-y-2.5 animate-in fade-in duration-300">
              <span className="text-2xl">🎉</span>
              <h4 className="text-xs sm:text-sm font-black text-amber-300">Misi Senggol Absen Hari Ini Selesai!</h4>
              <p className="text-[10.5px] sm:text-xs text-emerald-100 font-bold max-w-md mx-auto leading-relaxed">
                Alhamdulillah! Anda telah menyenggol 4 santri hari ini dan mengklaim bonus +100 XP & +1 Wasilah. Teruskan jalin silaturahmi berkah ini esok hari!
              </p>
            </div>
          ) : nudgeCandidates.length > 0 && (
            <div className="pt-2 space-y-3 relative z-10">
              <div className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 pl-1">
                <Zap size={12} className="text-amber-300 fill-amber-300/20" /> Santri yang Belum Absen Hari Ini
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {nudgeCandidates.map((candidateUser) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isNudged = userData?.nudgedUserIds?.includes(candidateUser.id) && userData?.lastNudgeDate === todayStr;
                  const isNudging = nudgingIds.includes(candidateUser.id);
                  const candidateStreak = candidateUser.loginStreak || 0;
                  
                  return (
                    <div 
                      key={candidateUser.id}
                      className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-white/10 dark:border-slate-800/80 flex flex-col items-center text-center space-y-3 relative group transition-all hover:shadow-md hover:border-amber-300 dark:hover:border-emerald-750"
                    >
                      {/* Avatar container */}
                      <div className="relative">
                        <UserAvatar 
                          photoURL={candidateUser.avatarUrl || candidateUser.photoURL}
                          displayName={candidateUser.displayName || candidateUser.name}
                          points={candidateUser.points}
                          size="md"
                          avatarFrame={candidateUser.avatarFrame}
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" title="Belum Absen" />
                      </div>

                      {/* Display Info */}
                      <div className="space-y-0.5 w-full">
                        <h5 className="text-xs font-black text-slate-800 dark:text-slate-100 truncate pl-1 pr-1">
                          {candidateUser.displayName || candidateUser.name || 'Santri'}
                        </h5>
                        <div className="flex items-center justify-center gap-1 text-[9.5px] text-slate-500 dark:text-slate-400 font-bold">
                          <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-450 font-extrabold">
                            <Flame size={10} className="fill-rose-500/10 animate-pulse" />
                            {candidateStreak} Hari Streak
                          </span>
                        </div>
                      </div>

                      {/* Nudge Action Button */}
                      <button
                        onClick={() => handleNudge(candidateUser)}
                        disabled={isNudged || isNudging}
                        className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1 active:scale-95 shrink-0 ${
                          isNudged 
                            ? 'bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm shadow-emerald-200/50 dark:shadow-none'
                        }`}
                      >
                        {isNudging ? (
                          <Loader2 size={11} className="animate-spin text-emerald-600" />
                        ) : isNudged ? (
                          <>
                            <Check size={11} className="stroke-[3]" /> Senggol Terkirim
                          </>
                        ) : (
                          <>
                            <Zap size={11} className="fill-current animate-pulse text-amber-300" /> Senggol Absen
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-emerald-100 dark:border-emerald-800/50 shadow-xl shadow-emerald-50/50 dark:shadow-none p-5 mb-2 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
           {/* Enhanced Search Bar */}
           <div className="relative mb-4 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Cari topik, pertanyaan, atau doa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-emerald-500 dark:border-emerald-600 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/80 transition-colors"
              />
           </div>

           {/* Small Banner to toggle and discover Minta Doa AI & Spiritual Center */}
           {activeTab === 'forum' ? (
             <motion.div 
               whileHover={{ y: -1 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => { setActiveTab('doa'); setSearchQuery(''); }}
               className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/[0.04] to-amber-600/[0.01] dark:from-amber-900/35 dark:to-slate-900/40 border-2 border-amber-200/50 dark:border-amber-900/40 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
             >
               <div className="flex items-center gap-3">
                 <div className="w-9 h-9 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl flex items-center justify-center text-sm shadow-sm transition-colors">
                   <span className="text-xl animate-pulse" role="img" aria-label="doa">🤲</span>
                 </div>
                 <div>
                   <h4 className="text-[10px] font-black tracking-wider text-amber-600 dark:text-amber-400 uppercase">Bantu Doa Santri & AI Doa</h4>
                   <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">Racik untaian doa spiritual & dukung hajat santri</p>
                 </div>
               </div>
               <div className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white dark:text-amber-950 dark:bg-amber-400 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-sm">
                 Buka <Sparkles size={10} className="ml-1" />
               </div>
             </motion.div>
           ) : (
             <motion.div 
               whileHover={{ y: -1 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => { setActiveTab('forum'); setSearchQuery(''); }}
               className="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/[0.04] to-emerald-600/[0.01] dark:from-emerald-900/35 dark:to-slate-900/40 border-2 border-emerald-250 dark:border-emerald-900/40 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
             >
               <div className="flex items-center gap-3">
                 <div className="w-9 h-9 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-sm shadow-sm transition-colors">
                   <MessageSquare size={16} />
                 </div>
                 <div>
                   <h4 className="text-[10px] font-black tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">Kembali ke Forum Santri</h4>
                   <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">Diskusi harian & tanya jawab seputar pesantren</p>
                 </div>
               </div>
               <div className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-sm">
                 Kembali
               </div>
             </motion.div>
           )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 pt-4 space-y-8">
        {/* Active Contributors / Stories Concept */}
        {!loading && activeTab === 'forum' && displayPosts.length > 0 && (
          <section className="mb-2">
            <div className="flex items-center justify-between mb-4 px-2">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kontributor Aktif</h3>
               <button className="text-[10px] font-bold text-emerald-600 hover:underline">Lihat Semua</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
              {[...new Set(displayPosts.map(p => p.userId))].slice(0, 8).map((userId, i) => {
                const post = displayPosts.find(p => p.userId === userId);
                const profile = userProfiles[userId] || {
                  displayName: post?.userName || 'Santri',
                  photoURL: post?.userPhoto || '',
                  points: post?.userPoints || 0,
                  avatarFrame: post?.avatarFrame || 'none',
                  verificationBadge: post?.verificationBadge || 'none'
                };
                return (
                  <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                    <UserAvatar 
                      photoURL={profile.photoURL}
                      displayName={profile.displayName}
                      points={profile.points}
                      size="lg"
                      avatarFrame={profile.avatarFrame}
                      verificationBadge={profile.verificationBadge}
                    />
                    <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 max-w-[60px] truncate">{profile.displayName}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}


        {/* Categories Chips */}
        {!loading && activeTab === 'forum' && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['Semua', ...AVAILABLE_CATEGORIES].map((cat, i) => (
              <button 
                key={i}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${selectedCategory === cat ? 'bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-500 shadow-md shadow-emerald-600/20' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-xs font-bold uppercase tracking-widest">Memuat Silaturahmi...</p>
          </div>
        ) : errorSync ? (
          <div className="text-center py-20 px-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/20 shadow-xl">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
              <ShieldCheck size={32} />
            </div>
            <h3 className="font-black text-slate-800 dark:text-white mb-2 text-lg">Database Belum Siap</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{errorSync}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-sm active:scale-95 transition-transform">Coba Lagi</button>
          </div>
        ) : activeTab === 'forum' ? (
          displayPosts.length === 0 ? (
            <div className="text-center py-20 px-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6">
                <MessageSquare size={32} />
              </div>
              <h3 className="font-black text-slate-800 dark:text-white mb-2 text-lg">Mulai Silaturahmi</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">Belum ada yang berbagi hari ini. Jadilah yang pertama menebar inspirasi!</p>
              <button onClick={openCreatePostModal} className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm active:scale-95 transition-transform shadow-lg shadow-emerald-500/10">Posting Sekarang</button>
            </div>
          ) : (
            <div className="space-y-6">
              {displayPosts.map((item, idx) => {
                if (item.isPrayerRequest) {
                  const prayer = item;
                  const profile = userProfiles[prayer.userId] || {
                    displayName: prayer.userName,
                    photoURL: prayer.userPhoto,
                    points: prayer.userPoints || 0,
                    avatarFrame: prayer.avatarFrame || 'none',
                    verificationBadge: prayer.verificationBadge || 'none'
                  };
                  return (
                    <motion.div 
                      key={prayer.id || idx}
                      id={`prayer-${prayer.id}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative group text-left"
                    >
                      {/* Visual Accent */}
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-400 group-hover:w-2 transition-all" />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-900/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                      <div className="p-8">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-100/60 dark:border-slate-800/40">
                            <div className="flex items-center gap-3">
                              <div className="relative group/avatar shrink-0">
                                <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-0 group-hover/avatar:opacity-20 transition-opacity" />
                                <UserAvatar 
                                  photoURL={profile.photoURL}
                                  displayName={profile.displayName}
                                  points={profile.points}
                                  size="md"
                                  avatarFrame={profile.avatarFrame}
                                  verificationBadge={profile.verificationBadge}
                                />
                              </div>
                              <div className="min-w-0">
                                 <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                   <span className="text-sm font-black text-slate-800 dark:text-white leading-none truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none hover:text-amber-500 transition-colors">{profile.displayName}</span>
                                   <div 
                                     className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 shrink-0"
                                   >
                                     {getRankDetails(profile.points).name}
                                   </div>
                                 </div>
                                 <span className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1.5 font-bold uppercase tracking-wider">
                                    <Clock size={10} className="text-slate-300" /> {formatTime(prayer.createdAt)}
                                 </span>
                              </div>
                            </div>
                            <span className="self-start sm:self-center bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-[0.14em] px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-800/50 shadow-sm shrink-0 whitespace-nowrap">
                               {getPrayerCategoryLabel(prayer.category)}
                            </span>
                          </div>

                         <h3 className="font-serif text-xl font-black text-slate-900 dark:text-white mb-3 leading-tight italic">
                            {prayer.title}
                         </h3>
                         <div className="relative mb-8">
                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-amber-200 dark:bg-amber-900/30 rounded-full" />
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line font-medium italic pl-2 pr-4">
                              "{prayer.description}"
                            </p>
                         </div>

                         {/* Progress Section */}
                         <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] mb-8 border border-slate-100 dark:border-slate-800 shadow-inner">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">KEIKHLASAN SANTRI</span>
                              <div className="flex items-center gap-1.5">
                                 <span className="text-xs font-black text-amber-600">{prayer.currentPrayers}</span>
                                 <span className="text-[10px] font-bold text-slate-300">/</span>
                                 <span className="text-[10px] font-bold text-slate-400">{prayer.targetPrayers}</span>
                              </div>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner font-medium">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (prayer.currentPrayers / prayer.targetPrayers) * 100)}%` }}
                                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-lg animate-none"
                              />
                            </div>
                            {prayer.status === 'completed' && (
                              <motion.p 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black mt-3 flex items-center justify-center gap-1.5 uppercase tracking-widest"
                              >
                                <CheckCircle2 size={12} strokeWidth={3} /> Alhamdulillah Target Tercapai
                              </motion.p>
                            )}
                         </div>

                         <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-6">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => handleLike(prayer.id!, prayer.likes, 'prayer')}
                                className={`p-3 rounded-2xl transition-all border ${prayer.likes?.includes(user?.uid || '') ? 'bg-amber-50 border-amber-100 text-amber-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 border-slate-100/50 hover:text-amber-500 hover:bg-amber-50 shadow-sm'}`}
                              >
                                <Heart size={18} fill={prayer.likes?.includes(user?.uid || '') ? "currentColor" : "none"} className={prayer.likes?.includes(user?.uid || '') ? "text-amber-500" : "text-slate-300 dark:text-slate-500"} />
                              </button>
                            </div>

                            <button 
                              onClick={() => handleCommentClick(prayer)}
                              className={`flex items-center gap-2.5 px-6 py-3 rounded-[1.5rem] font-sans font-black text-[10px] uppercase tracking-[0.15em] transition-all border shadow-sm hover:scale-[1.02] active:scale-[0.98] ${
                                prayer.prayers.includes(user?.uid || '') 
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-amber-400 text-amber-950 border-amber-300 hover:bg-amber-500'
                              }`}
                            >
                              <MessageSquare size={14} className="stroke-[3]" />
                              {prayer.prayers.includes(user?.uid || '') ? "Doa Terkirim (Lihat)" : `Tulis Doa (+${prayer.rewardAmount} W)`}
                            </button>
                         </div>
                      </div>
                    </motion.div>
                  );
                }
                const post = item as CommunityPost;
                const profile = userProfiles[post.userId] || {
                  displayName: post.userName,
                  photoURL: post.userPhoto,
                  points: post.userPoints || 0,
                  avatarFrame: post.avatarFrame || 'none',
                  verificationBadge: post.verificationBadge || 'none',
                  role: post.userRole || 'user'
                };
                return (
                  <motion.div 
                    key={post.id || idx}
                    id={`post-${post.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/10 dark:hover:border-emerald-500/30 transition-all duration-500 relative"
                  >
                    {/* Subtle top decoration for specific types */}
                    {post.type === 'tanya' && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500/50" />
                    )}
                    
                    <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative group/avatar">
                          <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-0 group-hover/avatar:opacity-20 transition-opacity" />
                          <UserAvatar 
                            photoURL={profile.photoURL}
                            displayName={profile.displayName}
                            points={profile.points}
                            size="md"
                            avatarFrame={profile.avatarFrame}
                            verificationBadge={profile.verificationBadge}
                          />
                        </div>
                        <div>
                          <div className="flex flex-col mb-1">
                            <div className="flex items-center flex-wrap gap-1.5">
                               <h4 className="text-sm font-black text-slate-800 dark:text-white tracking-tight hover:text-emerald-600 transition-colors cursor-pointer">{profile.displayName}</h4>
                               {profile.role === 'admin' && (
                                 <span className="flex items-center gap-1 bg-emerald-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                                   <ShieldCheck size={8} /> Verified
                                 </span>
                               )}
                            </div>
                            
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <div 
                                onClick={() => {
                                  setSelectedLevelPoints(profile.points);
                                  setLevelModalOpen(true);
                                }}
                                className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg w-fit shadow-xs border border-emerald-500/10 dark:border-white/10 opacity-80 cursor-pointer hover:opacity-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-1 select-none"
                                style={{ 
                                  backgroundColor: (() => {
                                    const c = getRankDetails(profile.points).color;
                                    if (c === 'emerald') return '#10b98125';
                                    if (c === 'amber') return '#f59e0b25';
                                    if (c === 'cyan') return '#06b6d425';
                                    if (c === 'orange') return '#f9731625';
                                    return '#64748b25'; // slate
                                  })(),
                                  color: (() => {
                                    const c = getRankDetails(profile.points).color;
                                    if (c === 'emerald') return '#059669';
                                    if (c === 'amber') return '#d97706';
                                    if (c === 'cyan') return '#0891b2';
                                    if (c === 'orange') return '#ea580c';
                                    return '#475569'; // slate
                                  })()
                                }}
                                title="Klik untuk lihat rincian Tingkat & progress XP"
                              >
                                <span className="text-[8.5px] leading-none mb-0.5">{getRankDetails(profile.points).icon}</span>
                                <span>{getRankDetails(profile.points).name}</span>
                              </div>

                              {post.userId !== user?.uid && (
                                <button
                                  onClick={() => handleFollowToggle(post.userId)}
                                  className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full transition-all duration-300 flex items-center gap-0.5 shadow-xs shrink-0 cursor-pointer ${
                                    followingList.includes(post.userId)
                                      ? 'bg-slate-150 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10'
                                  }`}
                                >
                                  {followingList.includes(post.userId) ? 'Mengikuti' : '+ Ikuti'}
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                               <Clock size={10} /> {formatTime(post.createdAt)}
                            </span>

                          </div>
                        </div>
                      </div>
                      <div className="relative flex gap-1.5">
                        {/* 3-dots Trigger Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setPostMenuId(postMenuId === post.id ? null : post.id!);
                          }}
                          className="p-2.5 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-90 shadow-sm border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900"
                          title="Menu Postingan"
                        >
                          <MoreVertical size={18} strokeWidth={3} />
                        </button>

                        {/* Dropdown Popup Menu */}
                        <AnimatePresence>
                          {postMenuId === post.id && (
                            <>
                              {/* Backdrop to dismiss on click */}
                              <div 
                                className="fixed inset-0 z-[10]" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPostMenuId(null);
                                }} 
                              />
                              
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 mt-12 w-52 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl py-2.5 z-[20] overflow-hidden text-left"
                              >
                                {/* Option 1: Bookmark / Simpan Postingan */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveBookmark(post);
                                  }}
                                  className="w-full px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-2.5"
                                >
                                  <Bookmark size={15} className="text-indigo-500" />
                                  <span>Simpan Postingan</span>
                                </button>

                                {/* Option 2: Hubungi Admin */}
                                {post.userId !== user?.uid && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPostMenuId(null);
                                      // Start chat
                                      navigate('/chat-admin', { state: { targetUserId: post.userId, targetUserName: post.userName } });
                                    }}
                                    className="w-full px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-2.5"
                                  >
                                    <MessageSquare size={15} className="text-emerald-500" />
                                    <span>Hubungi Admin</span>
                                  </button>
                                )}

                                {/* Option 3: Minta Doanya */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPostMenuId(null);
                                    navigate('/prayer-request-create', { 
                                      state: { 
                                        prefilledTitle: `Kabar Santri: mohon doanya ya`, 
                                        prefilledDescription: post.content 
                                      } 
                                    });
                                  }}
                                  className="w-full px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-805 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors flex items-center gap-2.5 border-t border-slate-50 dark:border-slate-800/80"
                                >
                                  <Heart size={15} className="text-amber-500 fill-current animate-pulse" />
                                  <span>Bantu Doa</span>
                                </button>

                                {/* Option 4: Laporkan Postingan */}
                                {post.userId !== user?.uid && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPostMenuId(null);
                                      setReportingPost(post);
                                    }}
                                    className="w-full px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-2.5 border-t border-slate-50 dark:border-slate-800/80"
                                  >
                                    <AlertCircle size={15} />
                                    <span>Laporkan Postingan</span>
                                  </button>
                                )}

                                {/* Option: Edit Postingan (Sistem Admin atau Pemilik Post) */}
                                {(post.userId === user?.uid || userData?.role === 'admin' || user?.email === 'admin@santrimodern.com') && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPostMenuId(null);
                                      setEditingPost(post);
                                      setEditingPostContent(post.content);
                                      setEditingPostCategories(post.categories || []);
                                    }}
                                    className="w-full px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors flex items-center gap-2.5 border-t border-slate-50 dark:border-slate-800/80"
                                  >
                                    <Pencil size={15} />
                                    <span>Edit Postingan</span>
                                  </button>
                                )}

                                {/* Option 4: Hapus Postingan (Sistem Admin atau Pemilik Post) */}
                                {(post.userId === user?.uid || userData?.role === 'admin' || user?.email === 'admin@santrimodern.com') && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPostMenuId(null);
                                      handleDelete(post.id!);
                                    }}
                                    className="w-full px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-red-500 hover:text-red-100 transition-colors flex items-center gap-2.5 border-t border-slate-50 dark:border-slate-800/80"
                                  >
                                    <Trash2 size={15} />
                                    <span>Hapus Postingan</span>
                                  </button>
                                )}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="mt-5 relative">
                      {post.type === 'tanya' && (
                        <div className="absolute -left-6 top-0 bottom-0 w-1 bg-indigo-500/20 rounded-full hidden sm:block" />
                      )}
                      <p className="text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                        {post.content}
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {post.categories && post.categories.length > 0 ? (
                          post.categories.map((cat, ci) => (
                            <button 
                              key={ci} 
                              onClick={() => {
                                setSelectedCategory(cat);
                                showToast(`Menampilkan kategori: ${cat}`, "success");
                              }}
                              className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/45 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/40 cursor-pointer active:scale-95 transition-all"
                            >
                              {cat}
                            </button>
                          ))
                        ) : (
                          <button 
                            onClick={() => {
                              const cat = post.type === 'tanya' ? 'Tanya Jawab' : 'Harian';
                              setSelectedCategory(cat);
                              showToast(`Menampilkan kategori: ${cat}`, "success");
                            }}
                            className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/45 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/40 cursor-pointer active:scale-95 transition-all"
                          >
                            {post.type === 'tanya' ? 'Tanya Jawab' : 'Harian'}
                          </button>
                        )}
                      </div>
                      
                      {/* Received Gifts Ticker */}
                      <PostGiftsTicker postId={post.id!} />
                    </div>

                    <div className="mt-8 pt-5 border-t border-slate-50 dark:border-slate-800/80 flex items-center justify-between">
                       <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 w-full justify-between sm:justify-start">
                         <button 
                           onClick={() => handleLike(post.id!, post.likes, 'post')}
                           className={`flex items-center gap-1.5 group px-2.5 py-1.5 xs:px-3 sm:px-4 sm:py-2 rounded-2xl transition-all border text-[11px] sm:text-xs ${post.likes?.includes(user?.uid || '') ? 'bg-rose-50' : 'bg-slate-50'}`.substring(0, 150) === '' ? '' : `flex items-center gap-1.5 group px-2.5 py-1.5 xs:px-3 sm:px-4 sm:py-2 rounded-2xl transition-all border text-[11px] sm:text-xs ${post.likes?.includes(user?.uid || '') ? 'bg-rose-50 border-rose-100 text-rose-500 dark:bg-rose-950/20 dark:border-rose-900/40' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
                         >
                           <Heart size={16} fill={post.likes?.includes(user?.uid || '') ? "currentColor" : "none"} className="group-active:scale-125 transition-transform shrink-0" />
                           <span className="font-extrabold tracking-wider">{post.likes?.length || 0}</span>
                         </button>

                         {/* Gift (Kado) Button */}
                         {post.userId !== user?.uid && (
                           <button 
                             onClick={() => {
                               if (!user) {
                                 showToast("Silakan login terlebih dahulu untuk memberi hadiah.", "info");
                                 return;
                               }
                               setGiftingPost(post);
                             }}
                             className="flex items-center gap-1.5 group px-2.5 py-1.5 xs:px-3 sm:px-4 sm:py-2 rounded-2xl transition-all bg-amber-50 hover:bg-amber-500 dark:bg-amber-950/20 dark:hover:bg-amber-500 text-amber-600 hover:text-white dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 text-[11px] sm:text-xs"
                           >
                             <span className="text-sm group-hover:scale-125 transition-transform shrink-0 leading-none">🎁</span>
                             <span className="font-extrabold tracking-wider hidden xs:inline">Kado</span>
                           </button>
                         )}
                        
                        <button 
                          onClick={() => setSelectedPost(post)}
                          className="flex items-center gap-1.5 group px-2.5 py-1.5 xs:px-3 sm:px-4 sm:py-2 rounded-2xl transition-all bg-white dark:bg-slate-900 border-2 border-slate-305 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-400 dark:hover:border-emerald-500/60 shadow-sm text-[11px] sm:text-xs"
                        >
                          <MessageSquare size={16} className="stroke-2 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="font-extrabold tracking-wider">{post.commentCount}</span>
                        </button>

                        <button 
                          onClick={() => {
                            const title = `Kabar Santri - ${post.userName}`;
                            const text = `"${post.content}"\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
                            
                            if (window.AndroidNativeInterface?.shareText) {
                              try {
                                window.AndroidNativeInterface.shareText(title, text);
                              } catch (err) {
                                navigator.clipboard.writeText(`${post.userName}: "${post.content}"\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`);
                                showToast("Postingan berhasil disalin!", "success");
                              }
                            } else if (navigator.share) {
                              navigator.share({
                                title: title,
                                text: text,
                                url: window.location.href,
                              }).catch(() => {});
                            } else {
                              navigator.clipboard.writeText(`${post.userName}: "${post.content}"\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`);
                              showToast("Postingan berhasil disalin!", "success");
                            }
                          }}
                          className="flex items-center gap-1.5 group px-2.5 py-1.5 xs:px-3 sm:px-4 sm:py-2 rounded-2xl transition-all bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-[11px] sm:text-xs"
                        >
                          <Share2 size={16} className="group-active:scale-110 transition-transform shrink-0" />
                        </button>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ); })}
            </div>
          )
        ) : (
          /* Minta Doa View */
          <div className="space-y-6">
            {/* FEED SECTION */}
            <div className="pt-3 font-medium">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                <h3 className="font-serif font-black text-slate-800 dark:text-white text-base">Permohonan Doa Aktif Santri</h3>
              </div>

              {displayPrayers.length === 0 ? (
                <div className="text-center py-16 px-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                  <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-4">
                    <span className="text-3xl" role="img" aria-label="doa">🤲</span>
                  </div>
                  <h3 className="font-black text-slate-800 dark:text-white mb-1.5 text-base">Belum Ada Hajat</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4">Semua santri sedang dalam kelapangan. Ketuk tombol Bantu Doa untuk mengunggah kebutuhan spiritual Anda.</p>
                  <button 
                    onClick={() => navigate('/prayer-request-create')}
                    className="px-5 py-2.5 bg-amber-400 text-amber-950 rounded-xl font-black text-[11px] active:scale-95 transition-transform shadow-lg shadow-amber-400/10"
                  >
                    Bantu Doa Sekarang
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayPrayers.map((prayer, idx) => (
                    <motion.div 
                      key={prayer.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative group"
                    >
                      {/* Visual Accent */}
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-400 group-hover:w-2 transition-all" />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-900/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                      <div className="p-8">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-100/60 dark:border-slate-800/40">
                            <div className="flex items-center gap-3">
                              <div className="relative group/avatar shrink-0">
                                <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-0 group-hover/avatar:opacity-20 transition-opacity" />
                                <UserAvatar 
                                  photoURL={prayer.userPhoto}
                                  displayName={prayer.userName}
                                  points={prayer.userPoints || 0}
                                  size="md"
                                  avatarFrame={prayer.avatarFrame}
                                  verificationBadge={prayer.verificationBadge}
                                />
                              </div>
                              <div className="min-w-0">
                                 <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                   <h4 className="text-sm font-black text-slate-800 dark:text-white leading-none truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">{prayer.userName}</h4>
                                   <div 
                                     className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border border-amber-250 dark:border-amber-800/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 shrink-0"
                                   >
                                     {getRankDetails(prayer.userPoints || 0).name}
                                   </div>
                                 </div>
                                 <span className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1.5 font-bold uppercase tracking-wider">
                                    <Clock size={10} className="text-slate-300" /> {formatTime(prayer.createdAt)}
                                 </span>
                              </div>
                            </div>
                            <span className="self-start sm:self-center bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-[0.14em] px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-800/50 shadow-sm shrink-0 whitespace-nowrap">
                               {getPrayerCategoryLabel(prayer.category)}
                            </span>
                          </div>

                         <h3 className="font-serif text-xl font-black text-slate-900 dark:text-white mb-3 leading-tight italic">
                            {prayer.title}
                         </h3>
                         <div className="relative mb-8">
                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-amber-200 dark:bg-amber-900/30 rounded-full" />
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line font-medium italic pl-2 pr-4">
                              "{prayer.description}"
                            </p>
                         </div>

                         {/* Progress Section */}
                         <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] mb-8 border border-slate-100 dark:border-slate-800 shadow-inner">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">KEIKHLASAN SANTRI</span>
                              <div className="flex items-center gap-1.5">
                                 <span className="text-xs font-black text-amber-600">{prayer.currentPrayers}</span>
                                 <span className="text-[10px] font-bold text-slate-300">/</span>
                                 <span className="text-[10px] font-bold text-slate-400">{prayer.targetPrayers}</span>
                              </div>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (prayer.currentPrayers / prayer.targetPrayers) * 100)}%` }}
                                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-lg"
                              />
                            </div>
                            {prayer.status === 'completed' && (
                              <motion.p 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black mt-3 flex items-center justify-center gap-1.5 uppercase tracking-widest"
                              >
                                <CheckCircle2 size={12} strokeWidth={3} /> Alhamdulillah Target Tercapai
                              </motion.p>
                            )}
                         </div>

                         <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-6">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => handleLike(prayer.id!, prayer.likes, 'prayer')}
                                className={`p-3 rounded-2xl transition-all border ${prayer.likes?.includes(user?.uid || '') ? 'bg-amber-50 border-amber-100 text-amber-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 border-slate-100/50 hover:text-amber-500 hover:bg-amber-50 shadow-sm'}`}
                              >
                                <Heart size={18} fill={prayer.likes?.includes(user?.uid || '') ? "currentColor" : "none"} />
                              </button>
                            </div>

                            <button 
                              onClick={() => handleCommentClick(prayer)}
                              className={`flex items-center gap-2.5 px-6 py-3 rounded-[1.5rem] font-sans font-black text-[10px] uppercase tracking-[0.15em] transition-all border shadow-sm hover:scale-[1.02] active:scale-[0.98] ${
                                prayer.prayers.includes(user?.uid || '') 
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-amber-400 text-amber-105 border-amber-300 hover:bg-amber-500'
                              }`}
                            >
                              <MessageSquare size={14} className="stroke-[3]" />
                              {prayer.prayers.includes(user?.uid || '') ? "Doa Terkirim (Lihat)" : `Tulis Doa (+${prayer.rewardAmount} W)`}
                            </button>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-6 z-40 flex flex-col gap-3">
        {activeTab === 'doa' && (
          <motion.button 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/prayer-request-create')}
            className="w-14 h-14 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-emerald-500/25 transition-all group"
          >
            <div className="relative">
              <span className="text-2xl" role="img" aria-label="bantu doa">🤲</span>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
            <div className="absolute right-full mr-3 px-3 py-1.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
              Bantu Doa
            </div>
          </motion.button>
        )}
        {activeTab === 'forum' && (
          <motion.button 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={openCreatePostModal}
            className="w-14 h-14 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-emerald-500/30 transition-all group"
          >
            <span className="text-2xl animate-bounce" role="img" aria-label="menulis">✍</span>
            <div className="absolute right-full mr-3 px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
              Tambah Status
            </div>
          </motion.button>
        )}
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[3rem] sm:rounded-[3rem] p-8 relative overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

              <div className="flex items-center justify-between mb-6">
                <div>
                   <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">Buat Postingan</h3>
                   <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Bagikan Manfaat Hari Ini</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all active:scale-90 shadow-sm"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              {postStep === 'content' ? (
                <>
                  <div className="relative group/input mb-6">
                    <textarea 
                      placeholder="Bagikan gagasan, ilmu, motivasi, atau kabar bermanfaat untuk santri lainnya..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      rows={6}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500/30 transition-all resize-none dark:text-white shadow-inner placeholder:text-slate-400"
                    />
                    <div className="absolute bottom-4 right-4 opacity-10 pointer-events-none group-focus-within/input:opacity-35 transition-opacity">
                       <Sparkles size={36} className="text-emerald-500" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-inner">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                       <span>{newPostContent.length.toLocaleString('id-ID')} Karakter</span>
                    </div>
                    <button 
                      onClick={() => setPostStep('category')}
                      disabled={!newPostContent.trim()}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-150 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/10 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <span>Pilih Kategori</span>
                      <ArrowLeft size={12} className="rotate-180" strokeWidth={3} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in duration-300">
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/25 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl p-4 mb-6">
                    <h4 className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles size={12} />
                      Kategori Postingan
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Pilih <span className="font-bold text-emerald-600 dark:text-emerald-400">1 hingga 3 kategori</span> yang paling sesuai agar mempermudah santri menemukan status Anda.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 mb-8">
                    {AVAILABLE_CATEGORIES.map((cat) => {
                      const isSelected = selectedPostCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => togglePostCategorySelection(cat)}
                          className={`py-3 px-4 rounded-2xl flex items-center justify-between text-left text-xs font-bold border transition-all active:scale-[0.97] ${
                            isSelected
                              ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-650 dark:text-emerald-400 border-emerald-500/80 dark:border-emerald-500 shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100/70 dark:bg-slate-950 dark:hover:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span className="truncate">{cat}</span>
                          {isSelected && (
                            <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0 ml-1" strokeWidth={3} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button 
                      onClick={() => setPostStep('content')}
                      className="px-5 py-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-[1.2rem] font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all text-center"
                    >
                      Kembali
                    </button>
                    
                    <button 
                      onClick={handleCreatePost}
                      disabled={submitting || selectedPostCategories.length < 1 || selectedPostCategories.length > 3}
                      className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-100 disabled:to-slate-100 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-400 text-white rounded-[1.2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/15 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                    >
                      {submitting ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <>
                          <Send size={12} />
                          <span>Terbitkan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comment Sidebar/Drawer */}
      <AnimatePresence>
        {(selectedPost || selectedPrayer) && (
          <div className="fixed inset-0 z-[70] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedPost(null); setSelectedPrayer(null); }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-full max-w-md bg-white dark:bg-slate-900 h-full relative border-l border-slate-100 dark:border-slate-800 flex flex-col"
            >
               <div className="p-6 bg-emerald-500/[0.08] dark:bg-emerald-500/[0.15] border-b border-emerald-100 dark:border-emerald-800/60 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <button onClick={() => { setSelectedPost(null); setSelectedPrayer(null); }} className="p-2 bg-white/80 dark:bg-slate-800/80 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white border border-slate-150 dark:border-slate-750 shadow-sm active:scale-90 flex items-center justify-center"><X size={16} strokeWidth={3} /></button>
                   <h3 className="font-black text-slate-800 dark:text-white text-base tracking-tight flex items-center gap-2">
                     <MessageSquare size={18} className="text-emerald-600 dark:text-emerald-400" />
                     Komentar Santri
                   </h3>
                 </div>
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                  {/* Original Post Recap */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic">{selectedPost?.content || selectedPrayer?.title}</p>
                  </div>

                  {selectedPrayer && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-3xl flex items-start gap-2.5">
                      <Sparkles className="text-amber-500 shrink-0 mt-0.5" size={16} />
                      <div>
                        <h4 className="text-[11px] font-black uppercase text-amber-800 dark:text-amber-400 tracking-wider">Ayo Mendoakan lewat Komentar!</h4>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-normal mt-1">
                          Tulis doa terbaik Anda untuk pendoa di bawah ini. Setelah Anda mengirimkan komentar, Anda akan otomatis terhitung mendoakan & berhak meraih <span className="text-amber-600 dark:text-amber-400 font-extrabold">+{selectedPrayer.rewardAmount} Wasilah</span>!
                        </p>
                      </div>
                    </div>
                  )}

                  {comments.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Belum ada komentar</p>
                    </div>
                  ) : (
                    comments.map((comment, ci) => {
                      const profile = userProfiles[comment.userId] || {
                        displayName: comment.userName,
                        photoURL: comment.userPhoto,
                        points: comment.userPoints || 0,
                        avatarFrame: comment.avatarFrame || 'none',
                        verificationBadge: comment.verificationBadge || 'none'
                      };
                      return (
                        <div key={comment.id || ci} className="flex gap-3 items-start">
                          <UserAvatar 
                            photoURL={profile.photoURL}
                            displayName={profile.displayName}
                            points={profile.points}
                            size="xs"
                            avatarFrame={profile.avatarFrame}
                            verificationBadge={profile.verificationBadge}
                          />
                          <div className="bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl flex-1 shadow-xs">
                             <div className="flex items-center justify-between mb-1">
                               <h5 className="text-[11px] font-black text-slate-800 dark:text-white">{profile.displayName}</h5>
                               <span className="text-[9px] text-slate-400">{formatTime(comment.createdAt)}</span>
                             </div>

                             {editingCommentId === comment.id ? (
                               <div className="flex flex-col gap-2 mt-2">
                                 <textarea
                                   rows={2}
                                   value={editingCommentText}
                                   onChange={(e) => setEditingCommentText(e.target.value)}
                                   placeholder="Tulis komentar..."
                                   className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs outline-none text-slate-800 dark:text-white resize-none"
                                 />
                                 <div className="flex gap-2 justify-end">
                                   <button
                                     onClick={() => setEditingCommentId(null)}
                                     className="px-2 py-1 text-[9px] font-black uppercase text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                   >
                                     Batal
                                   </button>
                                   <button
                                     onClick={() => handleUpdateComment(comment.id!)}
                                     className="px-2.5 py-1 text-[9px] font-black uppercase bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-xs"
                                   >
                                     Simpan
                                   </button>
                                 </div>
                               </div>
                             ) : (
                               <>
                                 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                 {comment.userId === user?.uid && (
                                   <div className="flex gap-3 mt-2.5 pt-1.5 border-t border-slate-100/50 dark:border-slate-800/30">
                                     <button
                                       onClick={() => {
                                         setEditingCommentId(comment.id!);
                                         setEditingCommentText(comment.content);
                                       }}
                                       className="text-[9px] font-black text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors uppercase tracking-wider"
                                     >
                                       Edit
                                     </button>
                                     <button
                                       onClick={() => handleDeleteComment(comment.id!)}
                                       className="text-[9px] font-black text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors uppercase tracking-wider"
                                     >
                                       Hapus
                                     </button>
                                   </div>
                                 )}
                               </>
                             )}
                          </div>
                        </div>
                      );
                    })
                  )}
               </div>

               <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex flex-col gap-3">
                    {/* Input & Send Button Row */}
                    <div className="flex gap-2 items-end">
                      <textarea 
                        rows={2} 
                        placeholder={selectedPrayer ? "Tulis doa terbaik Anda di sini untuk mendoakan..." : "Balas komentar..."}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl px-4 py-2.5 text-xs outline-none transition-all dark:text-white resize-none"
                      />
                      <button 
                        onClick={handleAddComment}
                        disabled={submittingComment || generatingAIComment || !newComment.trim()}
                        className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform disabled:opacity-50 shrink-0 self-end mb-0.5"
                      >
                        {submittingComment ? <Loader2 className="animate-spin" size={18}/> : <Send size={18} />}
                      </button>
                    </div>

                    {/* AI Button & Wasilah Info Row */}
                    <div className="flex flex-col xs:flex-row gap-2.5 items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/60 p-3 rounded-2xl">
                      <button 
                        onClick={handleGenerateAIComment}
                        disabled={generatingAIComment || submittingComment}
                        className="w-full xs:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl flex items-center justify-center gap-2 shadow-md hover:from-amber-600 hover:to-amber-700 active:scale-95 transition-all text-xs font-black disabled:opacity-50 select-none border border-amber-400/20"
                        title="Buat komentar otomatis dengan bantuan AI (1 Wasilah)"
                      >
                        {generatingAIComment ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <Sparkles size={14} className="text-amber-200 animate-pulse" />
                        )}
                        <span>Komentar dengan AI</span>
                      </button>

                      <div className="flex items-center justify-between w-full xs:w-auto gap-4">
                        <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles size={10} className="text-amber-500 animate-pulse" /> 1 Wasilah / penggunaan
                        </span>
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-lg border border-amber-100 dark:border-amber-900/30">
                          💰 {userData?.wasilah || 0} Wasilah
                        </span>
                      </div>
                    </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gift Sending Modal Dialog */}
      <AnimatePresence>
        {giftingPost && (
          <div className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGiftingPost(null)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.25rem] sm:rounded-[2.5rem] p-5 xs:p-6 sm:p-7 relative overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 z-[100] max-h-[92dvh] sm:max-h-[88vh] flex flex-col"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

              {/* Header Modal */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/30 flex items-center justify-center text-xl shrink-0">
                    🎁
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white leading-tight">Berikan Kado Berkah</h3>
                    <p className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Dukung postingan {giftingPost.userName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setGiftingPost(null)} 
                  className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all active:scale-90 shadow-xs cursor-pointer"
                  title="Tutup"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Scrollable Body Modal */}
              <div className="overflow-y-auto flex-1 py-3 sm:py-4 space-y-4 pr-1">
                {/* Saldo Bar */}
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:to-slate-900 border border-amber-200/60 dark:border-amber-900/40 px-4 py-3 rounded-2xl flex items-center justify-between">
                  <span className="text-[10.5px] font-extrabold uppercase text-amber-800 dark:text-amber-400 tracking-wider">Saldo Wasilah:</span>
                  <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    💰 {(userData?.wasilah || 0).toLocaleString()} Wasilah
                  </span>
                </div>

                {/* Gift Selection Grid */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-2">
                    Pilih Kado Istimewa:
                  </label>
                  <div className="grid grid-cols-3 gap-2 xs:gap-3">
                    {GIFTS.map((gift) => (
                      <button
                        key={gift.id}
                        type="button"
                        onClick={() => setSelectedGift(gift.id)}
                        className={`p-2.5 sm:p-3 rounded-2xl border flex flex-col items-center justify-center transition-all bg-gradient-to-b relative hover:scale-105 active:scale-95 cursor-pointer ${
                          selectedGift === gift.id
                            ? `${gift.color} border-amber-500 shadow-md ring-2 ring-amber-500/20`
                            : 'bg-slate-50/80 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl sm:text-3xl mb-1 select-none">{gift.icon}</span>
                        <span className="text-[10.5px] sm:text-[11px] font-extrabold text-slate-800 dark:text-white text-center truncate w-full">{gift.name}</span>
                        <span className="text-[8.5px] sm:text-[9px] font-black text-amber-600 dark:text-amber-400 mt-0.5 uppercase tracking-wide">
                          {gift.price} Wasilah
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kolom Tulis Pesan untuk Kado Berkah */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider mb-1.5">
                    Tulis Pesan (Otomatis Masuk ke Komentar):
                  </label>
                  <textarea
                    rows={2}
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Tulis ucapan terima kasih, doa berkah, atau apresiasi..."
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-2xl p-3 text-xs outline-none text-slate-800 dark:text-white placeholder:text-slate-400 resize-none transition-all"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
                <button
                  disabled={sendingGift}
                  onClick={() => handleSendGift(giftingPost.id!, giftingPost.userId, giftingPost.userName)}
                  className="w-full py-3.5 sm:py-4 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-amber-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {sendingGift ? (
                    <Loader2 className="animate-spin text-white" size={16} />
                  ) : (
                    <>
                      <span className="text-base leading-none">🎁</span>
                      <span>Kirim Kado Sekarang</span>
                    </>
                  )}
                </button>
                
                <div className="text-center">
                  <button
                    onClick={() => {
                      setGiftingPost(null);
                      navigate('/premium');
                    }}
                    className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 hover:text-emerald-500 tracking-wider hover:underline cursor-pointer"
                  >
                    Butuh wasilah tambahan? Top-up di Tab Premium
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Post Modal Dialog */}
      <AnimatePresence>
        {reportingPost && (
          <div className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReportingPost(null)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[3rem] sm:rounded-[3rem] p-8 relative overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 z-[100]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">Laporkan Postingan</h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Bantu menjaga kebersihan forum</p>
                </div>
                <button 
                  onClick={() => setReportingPost(null)} 
                  className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all active:scale-90 shadow-sm"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              <div className="space-y-4 text-left">
                <div className="p-4 bg-rose-50/10 dark:bg-rose-950/5 border border-dashed border-rose-100 dark:border-rose-900/30 rounded-2xl">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider mb-1">Postingan yang dilaporkan</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium italic line-clamp-3">
                    "{reportingPost.content}"
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">Pilih Alasan Utama</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      'Spam atau Mengganggu',
                      'Pelecehan atau Kebencian',
                      'Hoaks atau Misinformasi',
                      'Konten Tidak Layak / Vulgar',
                      'Lainnya'
                    ].map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setReportReason(reason)}
                        className={`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left flex items-center justify-between border ${
                          reportReason === reason 
                            ? 'bg-rose-50 border-rose-250 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400' 
                            : 'bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 border-transparent text-slate-700 dark:text-slate-350'
                        }`}
                      >
                        <span>{reason}</span>
                        {reportReason === reason && <div className="w-2 h-2 rounded-full bg-rose-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                {reportReason === 'Lainnya' && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5">Deskripsi Alasan</label>
                    <textarea
                      placeholder="Tuliskan alasan pelaporan Anda secara detail..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-xs font-bold outline-none border-none focus:ring-1 focus:ring-rose-500 transition-all text-slate-805 dark:text-white"
                    />
                  </div>
                )}

                <button
                  onClick={handleReportPostSubmit}
                  className="w-full py-4 mt-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-600/10 active:scale-95 transition-all"
                >
                  Kirim Laporan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT POST MODAL */}
      <AnimatePresence>
        {editingPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Pencil size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Edit Postingan Komunitas</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Perbarui isi tulisan atau kategori postingan Anda</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingPost(null)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">
                    Isi Tulisan
                  </label>
                  <textarea
                    value={editingPostContent}
                    onChange={(e) => setEditingPostContent(e.target.value)}
                    rows={5}
                    placeholder="Tuliskan pembaruan postingan..."
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl text-xs font-medium border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 block">
                    Kategori Postingan (Opsional)
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30">
                    {AVAILABLE_CATEGORIES.map((cat) => {
                      const isSelected = editingPostCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setEditingPostCategories(prev => prev.filter(c => c !== cat));
                            } else {
                              setEditingPostCategories(prev => [...prev, cat]);
                            }
                          }}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
                          }`}
                        >
                          {cat} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setEditingPost(null)}
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEditPost}
                  disabled={savingEditPost || !editingPostContent.trim()}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center gap-2 active:scale-95"
                >
                  {savingEditPost ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={true}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      <LevelInfoModal
        isOpen={levelModalOpen}
        onClose={() => setLevelModalOpen(false)}
        currentPoints={selectedLevelPoints}
      />
    </div>
  );
};

// --- SUBKOMPONEN TICKER HADIAH (POST GIFTS TICKER) ---
const PostGiftsTicker: React.FC<{ postId: string }> = ({ postId }) => {
  const [gifts, setGifts] = useState<PostGift[]>([]);

  useEffect(() => {
    const unsub = subscribeToPostGifts(postId, (data) => {
      setGifts(data);
    });
    return () => unsub();
  }, [postId]);

  if (gifts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4 px-3 py-2 rounded-2xl bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/30 dark:border-amber-900/10 items-center">
      <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider flex items-center gap-1">
         🎁 Hadiah Berkah ({gifts.length}):
      </span>
      <div className="flex flex-wrap gap-1.5 items-center">
        {gifts.slice(0, 5).map((gift) => {
          const rank = getRankDetails(gift.giftPrice * 100);
          return (
            <div 
              key={gift.id} 
              className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl shadow-xs border border-amber-100/40 dark:border-slate-700/80 text-[10px] font-bold text-slate-700 dark:text-slate-350"
            >
              <span className="text-sm">{gift.giftIcon}</span>
              <span className="font-extrabold">{gift.giftName}</span>
              <span className="text-[8px] text-slate-400 font-medium font-bold uppercase transition">dari</span>
              <span className="font-black text-slate-800 dark:text-white flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-1.5 py-0.5 rounded-md">
                {gift.senderName}
                <span className="text-[8px] font-extrabold" style={{ color: rank.color === 'emerald' ? '#059669' : rank.color }} title={`Tingkat Pemberi: ${rank.name}`}>
                  {rank.icon} {rank.name}
                </span>
              </span>
            </div>
          );
        })}
        {gifts.length > 5 && (
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-black px-1.5 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-lg border border-amber-100/20">
            +{gifts.length - 5} lainnya
          </span>
        )}
      </div>
    </div>
  );
};

export default CommunityScreen;
