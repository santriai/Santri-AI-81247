import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  Clock, 
  ChevronRight, 
  MailOpen, 
  Megaphone, 
  Loader2, 
  MessageSquare, 
  Users, 
  CreditCard, 
  UserPlus, 
  Gift, 
  Trash2,
  X,
  Check,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Swords,
  Sparkles
} from 'lucide-react';
import { 
  subscribeToBroadcasts, 
  subscribeToNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  RealtimeNotification 
} from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';

const NotificationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [personalNotifs, setPersonalNotifs] = useState<RealtimeNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotifModal, setSelectedNotifModal] = useState<any | null>(null);

  // Local state to track read broadcast IDs
  const [readBroadcastIds, setReadBroadcastIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('santriai_read_broadcasts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    setLoading(true);
    let broadcastsDone = false;
    let personalDone = false;

    // Safety fallback timer
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    // Realtime Broadcasts Listener
    const unsubBroadcasts = subscribeToBroadcasts((data) => {
      setBroadcasts(data);
      broadcastsDone = true;
      if (broadcastsDone && (!user || personalDone)) {
        setLoading(false);
      }
    });

    // Realtime Personal Notifications Listener
    let unsubPersonal = () => {};
    if (user?.uid) {
      unsubPersonal = subscribeToNotifications(user.uid, (data) => {
        setPersonalNotifs(data);
        personalDone = true;
        if (broadcastsDone && personalDone) {
          setLoading(false);
        }
      });
    } else {
      personalDone = true;
      if (broadcastsDone) {
        setLoading(false);
      }
    }

    return () => {
      clearTimeout(safetyTimer);
      unsubBroadcasts();
      unsubPersonal();
    };
  }, [user]);

  const markBroadcastLocalRead = (id: string) => {
    if (!readBroadcastIds.includes(id)) {
      const updated = [...readBroadcastIds, id];
      setReadBroadcastIds(updated);
      try {
        localStorage.setItem('santriai_read_broadcasts', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleOpenNotificationCard = async (msg: any) => {
    if (msg.isBroadcast) {
      if (msg.id) markBroadcastLocalRead(msg.id);
    } else {
      if (msg.id && !msg.isRead) {
        await markNotificationAsRead(msg.id);
      }
    }
    // Show detail modal preview first
    setSelectedNotifModal(msg);
  };

  const getModalActionDetails = (msg: any) => {
    if (!msg) return { label: 'Buka Menu Terkait', icon: <ExternalLink size={14} />, bg: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20' };
    const notifType = (msg.type || '').toLowerCase();
    const title = (msg.title || '').toLowerCase();
    const targetId = msg.targetId || '';

    // 0. Chat Admin / Pesan Admin
    if (notifType === 'chat' || notifType === 'chat_admin' || targetId === 'chat_admin' || title.includes('admin') || title.includes('chat') || msg.senderId === 'admin') {
      return {
        label: 'Balas Chat Admin',
        icon: <MessageSquare size={16} />,
        bg: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20'
      };
    }

    // 1. Versus Room
    if (notifType.includes('versus') || title.includes('versus') || title.includes('room arena') || (/^\d{6}$/.test(targetId) && !['gift', 'comment', 'follow'].includes(notifType))) {
      return {
        label: 'Masuk ke Room Versus',
        icon: <Swords size={16} />,
        bg: 'from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-600/20'
      };
    }

    // 2. Gift / Menerima Hadiah
    if (notifType === 'gift' || title.includes('hadiah')) {
      return {
        label: 'Buka Silaturahmi',
        icon: <span className="text-base leading-none">🎁</span>,
        bg: 'from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-rose-600/20'
      };
    }

    // 3. Komentar
    if (notifType === 'comment' || title.includes('komentar')) {
      return {
        label: 'Lihat Postingan',
        icon: <MessageSquare size={16} />,
        bg: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/20'
      };
    }

    // 4. Follower
    if (notifType === 'follow' || title.includes('pengikut') || title.includes('mengikuti')) {
      return {
        label: 'Buka Silaturahmi',
        icon: <UserPlus size={16} />,
        bg: 'from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-violet-600/20'
      };
    }

    // 5. Referral
    if (notifType.includes('referral') || title.includes('referral') || title.includes('rujukan')) {
      return {
        label: 'Lihat Profil & Wasilah',
        icon: <Users size={16} />,
        bg: 'from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-600/20'
      };
    }

    // 6. Payment / Topup / Wasilah
    if (['payment', 'subscription', 'topup', 'redemption'].includes(notifType) || title.includes('wasilah') || title.includes('transaksi')) {
      return {
        label: 'Buka Wasilah Shop',
        icon: <CreditCard size={16} />,
        bg: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20'
      };
    }

    // 7. Berita
    if (notifType === 'news' || notifType === 'article' || title.includes('berita')) {
      return {
        label: 'Baca Berita',
        icon: <ExternalLink size={14} />,
        bg: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20'
      };
    }

    // Islamic Holiday / Event
    if (notifType === 'holiday') {
      return {
        label: 'Lihat Amalan Hari Ini',
        icon: <Sparkles size={16} className="text-yellow-300" />,
        bg: 'from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-amber-500/20'
      };
    }

    // 8. Broadcast Admin
    if (msg.isBroadcast) {
      return {
        label: 'Buka Pengumuman',
        icon: <Megaphone size={14} />,
        bg: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20'
      };
    }

    return {
      label: 'Buka Menu Terkait',
      icon: <ExternalLink size={14} />,
      bg: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20'
    };
  };

  const handleNavigateFromModal = (msg: any) => {
    setSelectedNotifModal(null);
    const notifType = (msg.type || '').toLowerCase();
    const title = (msg.title || '').toLowerCase();
    const targetId = msg.targetId || '';

    // Holiday/Event detail
    if (notifType === 'holiday') {
      navigate('/', { state: { openHolidayPopup: true, holidayName: msg.title } });
      return;
    }

    // 0. Chat Admin / Pesan Admin
    if (notifType === 'chat' || notifType === 'chat_admin' || targetId === 'chat_admin' || title.includes('admin') || title.includes('chat') || msg.senderId === 'admin') {
      navigate('/chat-admin');
      return;
    }

    // 1. Versus Room Notifications
    if (notifType.includes('versus') || title.includes('versus') || title.includes('room arena') || (/^\d{6}$/.test(targetId) && !['gift', 'comment', 'follow'].includes(notifType))) {
      if (targetId && /^\d{6}$/.test(targetId)) {
        navigate('/quiz-pro', { state: { initialRoomCode: targetId, initialAction: 'join' } });
      } else {
        navigate('/quiz-pro', { state: { initialAction: 'join' } });
      }
      return;
    }

    // 2. Community Comments & Gifts
    if (notifType === 'comment' || notifType === 'gift' || title.includes('hadiah') || title.includes('komentar')) {
      if (targetId) {
        navigate('/community', { state: { targetId: targetId, highlightPostId: targetId } });
      } else {
        navigate('/community');
      }
      return;
    }

    // 3. Follower notifications
    if (notifType === 'follow' || title.includes('pengikut') || title.includes('mengikuti')) {
      navigate('/community', { state: { tab: 'forum' } });
      return;
    }

    // 4. Referral notifications
    if (notifType.includes('referral') || title.includes('referral') || title.includes('rujukan')) {
      navigate('/profile');
      return;
    }

    // 5. Payment, Subscription, Topup
    if (['payment', 'subscription', 'topup', 'redemption'].includes(notifType) || title.includes('wasilah') || title.includes('transaksi')) {
      navigate('/wasilah-shop');
      return;
    }

    // 6. News & Articles
    if (notifType === 'news' || notifType === 'article' || title.includes('berita')) {
      if (targetId) {
        navigate('/news-detail', { state: { id: targetId } });
      } else {
        navigate('/news');
      }
      return;
    }

    // 7. General Broadcast or Admin announcements
    if (msg.isBroadcast) {
      if (targetId) {
        if (/^\d{6}$/.test(targetId)) {
          navigate('/quiz-pro', { state: { initialRoomCode: targetId, initialAction: 'join' } });
        } else {
          navigate('/community', { state: { targetId: targetId, highlightPostId: targetId } });
        }
      } else {
        navigate('/notification-detail', { state: { message: msg } });
      }
      return;
    }

    // 8. Default fallback with targetId or detail screen
    if (targetId) {
      navigate('/community', { state: { targetId: targetId, highlightPostId: targetId } });
    } else {
      navigate('/notification-detail', { state: { message: msg } });
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (id) {
      await deleteNotification(id);
    }
  };

  const handleMarkAllRead = async () => {
    if (user?.uid) {
      await markAllNotificationsAsRead(user.uid);
    }
    // Mark all broadcasts read locally
    const allBroadcastIds = broadcasts.map(b => b.id).filter(Boolean);
    const combined = Array.from(new Set([...readBroadcastIds, ...allBroadcastIds]));
    setReadBroadcastIds(combined);
    try {
      localStorage.setItem('santriai_read_broadcasts', JSON.stringify(combined));
    } catch (e) {
      console.error(e);
    }
  };

  const formatDisplayDate = (msg: any) => {
    if (msg.date) return msg.date.split(',')[0];
    if (msg.createdAt) {
      const d = msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
      const isToday = new Date().toDateString() === d.toDateString();
      if (isToday) {
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }
    return '--';
  };

  // Combine and sort
  const allNotifications = [
    ...broadcasts.map(b => ({
      ...b,
      isBroadcast: true,
      type: b.type || 'admin'
    })),
    ...personalNotifs.map(n => ({
      ...n,
      isBroadcast: false
    }))
  ].sort((a, b) => {
    const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
    const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
    return timeB - timeA;
  });

  const getIconAndStyle = (type: string) => {
    switch (type) {
      case 'holiday':
        return {
          icon: <span className="text-base">🔔</span>,
          bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'
        };
      case 'chat':
      case 'chat_admin':
        return {
          icon: <MessageSquare size={18} />,
          bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
        };
      case 'versus_created':
      case 'versus':
      case 'versus_reminder':
      case 'versus_started':
        return {
          icon: <Swords size={18} />,
          bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'
        };
      case 'comment':
        return {
          icon: <MessageSquare size={18} />,
          bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40'
        };
      case 'referral':
        return {
          icon: <Users size={18} />,
          bg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40'
        };
      case 'payment':
        return {
          icon: <CreditCard size={18} />,
          bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
        };
      case 'follow':
        return {
          icon: <UserPlus size={18} />,
          bg: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-900/40'
        };
      case 'gift':
        return {
          icon: <Gift size={18} />,
          bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'
        };
      default:
        return {
          icon: <Megaphone size={18} />,
          bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40'
        };
    }
  };

  const unreadCount = personalNotifs.filter(n => !n.isRead).length + broadcasts.filter(b => !readBroadcastIds.includes(b.id)).length;
  const hasUnread = unreadCount > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300 font-sans">
      
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-md px-4 py-3.5 flex items-center justify-between gap-3 backdrop-blur border-b border-emerald-700/50 transition-colors">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-emerald-100 hover:bg-emerald-700/50 rounded-full transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h2 className="font-extrabold text-white text-lg flex items-center gap-2">
            <span className="text-xl leading-none">🔔</span>
            Notifikasi
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {hasUnread && (
            <button 
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-emerald-950 bg-amber-300 hover:bg-amber-400 px-2.5 py-1.5 rounded-xl active:scale-95 transition-all cursor-pointer shadow-sm flex items-center gap-1"
            >
              <MailOpen size={13} />
              Tandai Dibaca
            </button>
          )}

          <button 
            onClick={() => navigate('/notifications')} 
            className="relative p-1.5 text-white bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90 flex items-center justify-center h-8 w-8 border border-white/20"
            title="Notifikasi"
          >
            <span className="text-base leading-none select-none">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 rounded-full border border-white shadow-sm flex items-center justify-center px-1 text-[9px] font-bold text-white animate-pulse">
                {unreadCount}
              </span>
            )}
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

      <div className="p-4 max-w-2xl mx-auto space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 size={36} className="text-santri-green animate-spin mb-4" />
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Memuat notifikasi Anda...</p>
          </div>
        ) : allNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center mb-4 border border-emerald-100/50 dark:border-emerald-900/10">
              <Bell size={32} className="text-santri-green opacity-60" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-base mb-1">Belum ada notifikasi</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
              Semua kabar terbaru dari pertemanan, referral, hadiah, komentar, dan transaksi Anda akan muncul di sini.
            </p>
          </div>
        ) : (
          allNotifications.map((msg) => {
            const { icon, bg } = getIconAndStyle(msg.type);
            const isUnread = msg.isBroadcast 
              ? !readBroadcastIds.includes(msg.id) 
              : !msg.isRead;

            const plainPreviewText = (msg.message || '')
              .replace(/\*\*(.*?)\*\*/g, '$1')
              .replace(/<[^>]*>/g, '');

            return (
              <div
                key={msg.id || Math.random().toString()}
                onClick={() => handleOpenNotificationCard(msg)}
                className={`group relative w-full p-4 rounded-2xl border transition-all text-left flex gap-3.5 cursor-pointer active:scale-[0.99] shadow-sm ${
                  isUnread 
                    ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/70 hover:bg-rose-100/80 dark:hover:bg-rose-900/50' 
                    : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-900/60 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40'
                }`}
              >
                {/* Icon/Avatar */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${bg}`}>
                  {msg.senderPhoto ? (
                    <img 
                      src={msg.senderPhoto} 
                      alt="" 
                      className="w-full h-full object-cover rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    icon
                  )}
                </div>

                {/* Content Banner Preview */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={`text-sm truncate pr-2 ${
                      isUnread 
                        ? 'font-black text-rose-950 dark:text-rose-100' 
                        : 'font-bold text-emerald-950 dark:text-emerald-100'
                    }`}>
                      {msg.title}
                    </h3>

                    {/* Status Badge */}
                    {isUnread ? (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-600 text-white flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Belum Dibaca
                      </span>
                    ) : (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                        <Check size={10} strokeWidth={3} />
                        Sudah Dibaca
                      </span>
                    )}
                  </div>

                  {/* Short Message Preview */}
                  <p className={`text-xs line-clamp-2 leading-relaxed ${
                    isUnread 
                      ? 'text-rose-900/90 dark:text-rose-200/80 font-medium' 
                      : 'text-slate-600 dark:text-slate-300'
                  }`}>
                    {plainPreviewText}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-semibold whitespace-nowrap">
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Clock size={11} /> {formatDisplayDate(msg)}
                    </span>
                    {msg.isBroadcast && (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-md text-[9px] font-extrabold border border-red-200 dark:border-red-900/50">
                        Pengumuman Sistem
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Chevron & Trash */}
                <div className="flex flex-col justify-between items-end shrink-0 pl-1">
                  <div className={`transition-colors ${
                    isUnread ? 'text-rose-400' : 'text-emerald-500'
                  }`}>
                    <ChevronRight size={18} />
                  </div>
                  {!msg.isBroadcast && (
                    <button
                      onClick={(e) => handleDeleteNotification(e, msg.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-lg transition-all cursor-pointer mt-auto"
                      title="Hapus"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Notification Detail Modal Preview */}
      {selectedNotifModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-santri-green border border-emerald-100 dark:border-emerald-900/40">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">Detail Notifikasi</h3>
                  <p className="text-[10px] text-slate-400 font-medium">{formatDisplayDate(selectedNotifModal)}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedNotifModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200 dark:border-emerald-900/50">
                  <CheckCircle2 size={13} /> Sudah Dibaca
                </span>
                {selectedNotifModal.isBroadcast && (
                  <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded-full text-xs font-bold border border-red-200 dark:border-red-900/50">
                    Pengumuman Sistem
                  </span>
                )}
              </div>

              <h2 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                {selectedNotifModal.title}
              </h2>

              {selectedNotifModal.image && (
                <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                  <img src={selectedNotifModal.image} alt="" className="w-full h-auto object-cover" />
                </div>
              )}

              <div 
                className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-words bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800"
                dangerouslySetInnerHTML={{ __html: selectedNotifModal.message ? selectedNotifModal.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') : '' }} 
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <button 
                onClick={() => setSelectedNotifModal(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Tutup
              </button>
              
              {(() => {
                const action = getModalActionDetails(selectedNotifModal);
                return (
                  <button 
                    onClick={() => handleNavigateFromModal(selectedNotifModal)}
                    className={`flex-1 py-3 bg-gradient-to-r ${action.bg} text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer`}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                );
              })()}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default NotificationScreen;

