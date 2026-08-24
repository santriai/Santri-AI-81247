import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToNotifications, subscribeToBroadcasts } from '../services/firebase';

export function useUnreadCount() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setUnreadCount(0);
      return;
    }

    let personalNotifs: any[] = [];
    let broadcasts: any[] = [];

    const calculateTotal = () => {
      let readBroadcastIds: string[] = [];
      try {
        const saved = localStorage.getItem('santriai_read_broadcasts');
        readBroadcastIds = saved ? JSON.parse(saved) : [];
      } catch (e) {}

      const personalUnread = personalNotifs.filter(n => !n.isRead).length;
      const broadcastUnread = broadcasts.filter(b => !readBroadcastIds.includes(b.id)).length;
      setUnreadCount(personalUnread + broadcastUnread);
    };

    const unsubscribeNotifs = subscribeToNotifications(user.uid, (notifs) => {
      personalNotifs = notifs;
      calculateTotal();
    });

    const unsubscribeBroadcasts = subscribeToBroadcasts((bcasts) => {
      broadcasts = bcasts;
      calculateTotal();
    });

    // Listen to local storage changes to keep read status in sync instantly across tabs/pages
    const handleStorageChange = () => {
      calculateTotal();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribeNotifs();
      unsubscribeBroadcasts();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  return unreadCount;
}
