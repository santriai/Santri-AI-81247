import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  onSnapshot, 
  deleteDoc, 
  serverTimestamp,
  deleteField,
  collection,
  query,
  where
} from 'firebase/firestore';
import { db, createNotification, sendBroadcast } from './firebase';
import { DEFAULT_QUIZ_BANK } from '../constants/defaultQuizBank';
import { QuizQuestion } from '../types';

export const ISLAMIC_ROOM_NAMES = [
  "Majlis Ilmi",
  "Halaqah Santri",
  "Raudhatul Jannah",
  "Baitul Hikmah",
  "Darul Ulum",
  "Bustanul Arifin",
  "Riyadhus Shalihin",
  "Halaqah Qur'ani",
  "Majlis Fiqih",
  "Baitul Ma'rifah",
  "Majlis Hadits",
  "Darut Taqwa",
  "Thalabul 'Ilmi",
  "Majlis Dzikir",
  "Darul Quran",
  "Halaqah Sunnah",
  "Baitur Rahmah",
  "Raudhatus Shalihin",
  "Majlis Adab",
  "Halaqah Tafsir",
  "Darul Hikmah",
  "Baitus Salam",
  "Majlis Mu'allim",
  "Darul Musthofa",
  "Halaqah Sholawat",
  "Baitul Izzah",
  "Majlis Nahdliyin",
  "Bustanul Qur'an",
  "Riyadhul Ulum",
  "Darul Hidayah",
  "Halaqah Ulama",
  "Baitul Barakah",
  "Majlis Nurul Ilmi"
];

export interface RoomPlayer {
  uid: string;
  displayName: string;
  photoURL?: string;
  isReady: boolean;
  score: number;
  streak: number;
  isForfeited?: boolean;
  status?: string;
  answers: {
    [qIndex: number]: {
      answerIndex: number;
      isCorrect: boolean;
      points: number;
      timeTaken?: number;
      answeredAt: number;
    };
  };
}

export interface QuizRoom {
  id: string; // Room Code (e.g., "739218")
  roomCode: string;
  roomName: string; // Islamic or custom room name
  hostId: string;
  hostName: string;
  hostPhoto?: string;
  topic: string;
  questionCount: number;
  timePerQuestion: number; // in seconds (15, 30, 60)
  maxPlayers?: number; // Maximum allowed players (2 to 100, default 100)
  isPublic?: boolean; // Always true for Versus mode
  startTimeOption?: string; // "Sekarang", "5 Menit Lagi", ... "1 Jam Lagi"
  scheduledStartTime?: number; // Timestamp in ms
  status: 'waiting' | 'playing' | 'question_result' | 'finished' | 'cancelled';
  currentQuestionIndex: number;
  currentQuestionStartedAt: number;
  questions: QuizQuestion[];
  players: { [uid: string]: RoomPlayer };
  notified5MinBeforeUsers?: { [uid: string]: boolean };
  createdAt: any;
  updatedAt: any;
}

// Calculate reward based on question count
export const calculateMultiplayerReward = (questionCount: number) => {
  const wasilahEarned = Math.floor(questionCount / 2);
  const xpEarned = questionCount * 5;
  return { wasilahEarned, xpEarned };
};

// Verification Badge Bonus calculation
export const getVerificationBonus = (badge?: string): number => {
  if (!badge || badge === 'none') return 0;
  const b = badge.toLowerCase();
  if (b.includes('purple') || b.includes('ungu')) return 1;
  if (b.includes('blue') || b.includes('biru')) return 2;
  if (b.includes('red') || b.includes('merah')) return 3;
  if (b.includes('green') || b.includes('hijau')) return 4;
  if (b.includes('gold') || b.includes('emas')) return 5;
  return 0;
};

// Check user's daily quota for multiplayer versus
export const checkMultiplayerQuota = async (uid: string, verificationBadge?: string): Promise<{
  canPlay: boolean;
  playsUsed: number;
  maxPlays: number;
  basePlays: number;
  verificationBonus: number;
  adsWatched: number;
  maxAds: number;
  remainingPlays: number;
}> => {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    const todayStr = new Date().toISOString().split('T')[0];

    let playsUsed = 0;
    let adsWatched = 0;
    let badgeFromDoc = verificationBadge;

    if (snap.exists()) {
      const data = snap.data();
      if (data.lastMultiplayerDate === todayStr) {
        playsUsed = data.multiplayerPlaysToday || 0;
        adsWatched = data.multiplayerAdsWatchedToday || 0;
      }
      if (!badgeFromDoc) {
        badgeFromDoc = data.verificationBadge || data.badge || 'none';
      }
    }

    const basePlays = 3;
    const vBonus = getVerificationBonus(badgeFromDoc);
    const maxAds = 5;
    const currentAdsBonus = Math.min(adsWatched, maxAds);
    const maxPlays = basePlays + vBonus + currentAdsBonus;
    const remainingPlays = Math.max(0, maxPlays - playsUsed);
    const canPlay = remainingPlays > 0;

    return {
      canPlay,
      playsUsed,
      maxPlays,
      basePlays,
      verificationBonus: vBonus,
      adsWatched,
      maxAds,
      remainingPlays
    };
  } catch (err) {
    console.error('Error checking multiplayer quota:', err);
    return {
      canPlay: true,
      playsUsed: 0,
      maxPlays: 3,
      basePlays: 3,
      verificationBonus: 0,
      adsWatched: 0,
      maxAds: 5,
      remainingPlays: 3
    };
  }
};

// Backward compatible check
export const checkCanPlayMultiplayer = async (uid: string, verificationBadge?: string): Promise<{ canPlay: boolean; remainingPlays: number; maxPlays: number }> => {
  const quota = await checkMultiplayerQuota(uid, verificationBadge);
  return {
    canPlay: quota.canPlay,
    remainingPlays: quota.remainingPlays,
    maxPlays: quota.maxPlays
  };
};

// Record user's daily multiplayer play
export const recordMultiplayerPlay = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const todayStr = new Date().toISOString().split('T')[0];
    const snap = await getDoc(userRef);
    let currentPlays = 0;
    let currentAds = 0;

    if (snap.exists()) {
      const data = snap.data();
      if (data.lastMultiplayerDate === todayStr) {
        currentPlays = data.multiplayerPlaysToday || 0;
        currentAds = data.multiplayerAdsWatchedToday || 0;
      }
    }

    await updateDoc(userRef, {
      lastMultiplayerDate: todayStr,
      multiplayerPlaysToday: currentPlays + 1,
      multiplayerAdsWatchedToday: currentAds,
      updatedAt: serverTimestamp()
    }).catch(async () => {
      await setDoc(userRef, {
        lastMultiplayerDate: todayStr,
        multiplayerPlaysToday: 1,
        multiplayerAdsWatchedToday: 0
      }, { merge: true });
    });
  } catch (err) {
    console.error('Error recording multiplayer play:', err);
  }
};

// Refund user's daily multiplayer play if room canceled/deleted due to single player
export const refundMultiplayerPlay = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const todayStr = new Date().toISOString().split('T')[0];
    const snap = await getDoc(userRef);
    if (snap.exists() && snap.data().lastMultiplayerDate === todayStr) {
      const currentPlays = snap.data().multiplayerPlaysToday || 0;
      const newPlays = Math.max(0, currentPlays - 1);
      await updateDoc(userRef, {
        multiplayerPlaysToday: newPlays,
        updatedAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.error('Error refunding multiplayer play:', err);
  }
};

// Watch ad to get +1 multiplayer play (max 5 ads per day)
export const watchAdForMultiplayer = async (uid: string): Promise<{ success: boolean; newAdsWatched: number; message?: string }> => {
  try {
    const userRef = doc(db, 'users', uid);
    const todayStr = new Date().toISOString().split('T')[0];
    const snap = await getDoc(userRef);
    let adsWatched = 0;
    let currentPlays = 0;

    if (snap.exists()) {
      const data = snap.data();
      if (data.lastMultiplayerDate === todayStr) {
        adsWatched = data.multiplayerAdsWatchedToday || 0;
        currentPlays = data.multiplayerPlaysToday || 0;
      }
    }

    if (adsWatched >= 5) {
      return { success: false, newAdsWatched: 5, message: 'Anda telah mencapai batas maksimal 5x tonton iklan hari ini!' };
    }

    const newAds = adsWatched + 1;
    await updateDoc(userRef, {
      lastMultiplayerDate: todayStr,
      multiplayerAdsWatchedToday: newAds,
      updatedAt: serverTimestamp()
    }).catch(async () => {
      await setDoc(userRef, {
        lastMultiplayerDate: todayStr,
        multiplayerPlaysToday: currentPlays,
        multiplayerAdsWatchedToday: newAds
      }, { merge: true });
    });

    return { success: true, newAdsWatched: newAds };
  } catch (err: any) {
    console.error('Error watching ad for multiplayer:', err);
    return { success: false, newAdsWatched: 0, message: err?.message || 'Gagal klaim kuota dari iklan.' };
  }
};

// Generate 6-digit PIN code
export const generateRoomCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create a new multiplayer room
export const createQuizRoom = async (
  user: { uid: string; displayName?: string | null; photoURL?: string | null },
  roomName: string = 'Majlis Ilmi',
  topic: string = 'Random',
  questionCount: number = 10,
  timePerQuestion: number = 30,
  isPublic: boolean = true,
  startTimeOption: string = '5 Menit Lagi',
  verificationBadge?: string,
  maxPlayers: number = 100
): Promise<string> => {
  // Check daily limit first
  const quota = await checkMultiplayerQuota(user.uid, verificationBadge);
  if (!quota.canPlay) {
    throw new Error(`Anda sudah menggunakan kuota ${quota.maxPlays}x bermain multiplayer hari ini. Tonton iklan (+1) atau coba lagi besok!`);
  }

  const roomCode = generateRoomCode();
  const roomRef = doc(db, 'quiz_rooms', roomCode);

  // 1. Fetch admin questions from Firestore 'quizzes' collection
  let adminBank: any[] = [];
  try {
    const snap = await getDocs(collection(db, 'quizzes'));
    if (!snap.empty) {
      adminBank = snap.docs.map(docSnap => {
        const d = docSnap.data();
        const options = Array.isArray(d.options) 
          ? d.options 
          : [d.optionA, d.optionB, d.optionC, d.optionD].filter(Boolean);
        return {
          id: docSnap.id,
          question: d.question || '',
          arabicQuestion: d.arabicQuestion || '',
          audioUrl: d.audioUrl || '',
          surahRef: d.surahRef || '',
          options: options,
          correctIndex: typeof d.correctIndex === 'number' ? d.correctIndex : (typeof d.answerIndex === 'number' ? d.answerIndex : 0),
          explanation: d.explanation || '',
          topic: d.topic || d.category || 'Umum'
        };
      }).filter(q => q.question && Array.isArray(q.options) && q.options.length >= 2);
    }
  } catch (err) {
    console.warn("Gagal mengambil data soal dari admin, menggunakan default bank:", err);
  }

  // Combine Admin Bank (prioritized) + Default Bank
  const fullBank = [...adminBank, ...DEFAULT_QUIZ_BANK];

  // Filter bank soal based on topic
  let filtered = [...fullBank];
  const isRandom = !topic || topic.includes('Random') || topic.includes('Acak');

  if (!isRandom) {
    const topicFiltered = fullBank.filter(
      (item) => item.topic && item.topic.toLowerCase() === topic.toLowerCase()
    );
    if (topicFiltered.length > 0) {
      filtered = topicFiltered;
    }
    if (filtered.length < questionCount) {
      const remainder = fullBank.filter(
        (item) => !item.topic || item.topic.toLowerCase() !== topic.toLowerCase()
      );
      filtered = [...filtered, ...remainder];
    }
  }

  // Shuffle & pick questions
  const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, questionCount);

  const formattedQuestions: QuizQuestion[] = shuffled.map((q, idx) => ({
    id: q.id || `q-${idx}`,
    question: q.question,
    arabicQuestion: q.arabicQuestion,
    audioUrl: q.audioUrl,
    surahRef: q.surahRef,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation || '',
    topic: q.topic
  }));

  const initialHostPlayer: RoomPlayer = {
    uid: user.uid,
    displayName: user.displayName || 'Santri',
    photoURL: user.photoURL || '',
    isReady: true,
    score: 0,
    streak: 0,
    answers: {}
  };

  // Calculate scheduled start time
  let scheduledMs = Date.now();
  if (startTimeOption === '1 Menit Lagi') scheduledMs += 1 * 60 * 1000;
  else if (startTimeOption === '3 Menit Lagi') scheduledMs += 3 * 60 * 1000;
  else if (startTimeOption === '5 Menit Lagi') scheduledMs += 5 * 60 * 1000;
  else if (startTimeOption === '10 Menit Lagi') scheduledMs += 10 * 60 * 1000;
  else if (startTimeOption === '15 Menit Lagi') scheduledMs += 15 * 60 * 1000;
  else if (startTimeOption === '30 Menit Lagi') scheduledMs += 30 * 60 * 1000;
  else if (startTimeOption.includes('Jam')) {
    const hours = parseInt(startTimeOption.replace(/[^0-9]/g, '')) || 1;
    scheduledMs += hours * 60 * 60 * 1000;
  }

  const roomData: QuizRoom = {
    id: roomCode,
    roomCode,
    roomName: roomName || 'Majlis Ilmi',
    hostId: user.uid,
    hostName: user.displayName || 'Santri',
    hostPhoto: user.photoURL || '',
    topic: isRandom ? 'Random' : topic,
    questionCount,
    timePerQuestion,
    maxPlayers: Math.min(100, Math.max(2, maxPlayers)),
    isPublic: true,
    startTimeOption,
    scheduledStartTime: scheduledMs,
    status: 'waiting',
    currentQuestionIndex: 0,
    currentQuestionStartedAt: 0,
    questions: formattedQuestions,
    players: {
      [user.uid]: initialHostPlayer
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await setDoc(roomRef, roomData);
  // Record that user created room today
  await recordMultiplayerPlay(user.uid);

  // Send Broadcast & Realtime Notifications for all users
  try {
    const hostName = user.displayName || 'Santri';
    const displayRoomName = roomName || 'Majlis Ilmi';
    const displayTopic = isRandom ? 'Random' : topic;
    const notifTitle = `⚔️ Arena Versus Baru: ${displayRoomName}`;
    const notifMsg = `${hostName} baru saja membuat Room Cerdas Cermat Versus "${displayRoomName}" (Topik: ${displayTopic}). Klik untuk bergabung dan bertanding sekarang!`;

    await sendBroadcast({
      title: notifTitle,
      message: notifMsg,
      type: 'versus_created',
      targetId: roomCode,
      senderName: hostName,
      senderPhoto: user.photoURL || ''
    });

    if ((window as any).AndroidNativeInterface && typeof (window as any).AndroidNativeInterface.showNotification === 'function') {
      (window as any).AndroidNativeInterface.showNotification(notifTitle, notifMsg, 'versus');
    }
  } catch (e) {
    console.warn("Gagal mengirim notifikasi broadcast room versus baru:", e);
  }

  return roomCode;
};

// Join an existing room
export const joinQuizRoom = async (
  user: { uid: string; displayName?: string | null; photoURL?: string | null },
  roomCode: string,
  verificationBadge?: string
): Promise<boolean> => {
  const roomRef = doc(db, 'quiz_rooms', roomCode);
  const snap = await getDoc(roomRef);

  if (!snap.exists()) {
    throw new Error('Kode Room tidak ditemukan! Periksa kembali kode room.');
  }

  const room = snap.data() as QuizRoom;

  // Check if player is already inside the room
  const isAlreadyIn = room.players && room.players[user.uid];

  if (!isAlreadyIn) {
    // Check daily limit for new joins
    const quota = await checkMultiplayerQuota(user.uid, verificationBadge);
    if (!quota.canPlay) {
      throw new Error(`Anda sudah menggunakan kuota ${quota.maxPlays}x bermain multiplayer hari ini. Tonton iklan (+1) atau coba lagi besok!`);
    }
  }

  if (room.status !== 'waiting') {
    throw new Error('Permainan di room ini sudah berlangsung atau selesai.');
  }

  // Max capacity check (2 to 100 players)
  const maxCapacity = room.maxPlayers || 100;
  if (Object.keys(room.players || {}).length >= maxCapacity) {
    throw new Error(`Room sudah penuh (Maksimal ${maxCapacity} Pemain).`);
  }

  const newPlayer: RoomPlayer = {
    uid: user.uid,
    displayName: user.displayName || 'Santri',
    photoURL: user.photoURL || '',
    isReady: true, // Auto ready for versus
    score: 0,
    streak: 0,
    answers: {}
  };

  await updateDoc(roomRef, {
    [`players.${user.uid}`]: newPlayer,
    updatedAt: Date.now()
  });

  if (!isAlreadyIn) {
    await recordMultiplayerPlay(user.uid);
  }

  return true;
};

// Toggle player ready status
export const togglePlayerReady = async (roomCode: string, uid: string, currentReadyState: boolean) => {
  const roomRef = doc(db, 'quiz_rooms', roomCode);
  await updateDoc(roomRef, {
    [`players.${uid}.isReady`]: !currentReadyState,
    updatedAt: Date.now()
  });
};

// Start the game (Host or Auto start)
export const startQuizRoom = async (roomCode: string) => {
  const roomRef = doc(db, 'quiz_rooms', roomCode);
  await updateDoc(roomRef, {
    status: 'playing',
    currentQuestionIndex: 0,
    currentQuestionStartedAt: Date.now(),
    updatedAt: Date.now()
  });
};

// Helper to trigger device notification (Android Native status bar or HTML5 Web notification)
export const triggerDeviceNotification = (title: string, message: string) => {
  if (typeof window === 'undefined') return;
  
  // 1. Android Native WebView Interface
  if ((window as any).AndroidNativeInterface && typeof (window as any).AndroidNativeInterface.showNotification === 'function') {
    try {
      (window as any).AndroidNativeInterface.showNotification(title, message, 'scheduled_quiz');
    } catch (e) {
      console.error('Gagal memicu notifikasi Android native:', e);
    }
  } else if (typeof Notification !== 'undefined') {
    // 2. Browser HTML5 Notification
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, { body: message });
      } catch (e) {}
    } else if (Notification.permission !== 'denied') {
      try {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(title, { body: message });
          }
        });
      } catch (e) {}
    }
  }
};

// Cancel room without refunding host (host play quota remains deducted per user rule)
export const cancelScheduledRoomNoRefund = async (roomCode: string, roomName: string, playerUids: string[]) => {
  try {
    const roomRef = doc(db, 'quiz_rooms', roomCode);
    await updateDoc(roomRef, {
      status: 'cancelled',
      updatedAt: Date.now()
    });

    // Send notifications to all joined players
    const title = 'Arena Versus Dibatalkan ⚠️';
    const message = `Arena Versus "${roomName || 'Majlis Ilmi'}" (#${roomCode}) dibatalkan otomatis karena peserta kurang dari 2 orang saat waktu mulai. Jatah bermain tetap terhitung.`;

    for (const uid of playerUids) {
      await createNotification(uid, 'versus_cancelled', title, message, { targetId: roomCode });
    }
  } catch (err) {
    console.error('Error canceling room no refund:', err);
  }
};

// Process scheduled room logic (5 min reminder & scheduled start / auto cancel / host transfer)
export const processScheduledRoomLogic = async (room: QuizRoom, currentUserId?: string) => {
  if (!room || room.status !== 'waiting') return;

  const nowTime = Date.now();
  const scheduledMs = room.scheduledStartTime || room.createdAt;
  const diffMs = scheduledMs - nowTime;
  const playerUids = Object.keys(room.players || {});
  const roomCode = room.roomCode;

  // 1. 5-Minute Reminder Notification (0 < diffMs <= 5 minutes)
  if (diffMs > 0 && diffMs <= 5 * 60 * 1000) {
    if (currentUserId && playerUids.includes(currentUserId)) {
      const notifiedMap = room.notified5MinBeforeUsers || {};
      if (!notifiedMap[currentUserId]) {
        const title = 'Pertandingan Versus 5 Menit Lagi! ⏰';
        const message = `Arena Versus "${room.roomName}" (#${roomCode}) akan segera dimulai dalam 5 menit. Siapkan diri Anda!`;

        // Trigger Android WebView status bar or HTML5 notification
        triggerDeviceNotification(title, message);

        // Create Notification in Firestore (for Notifications screen)
        createNotification(currentUserId, 'versus_reminder', title, message, { targetId: roomCode }).catch(console.error);

        // Mark user as notified in Firestore
        const roomRef = doc(db, 'quiz_rooms', roomCode);
        updateDoc(roomRef, {
          [`notified5MinBeforeUsers.${currentUserId}`]: true,
          updatedAt: Date.now()
        }).catch(console.error);
      }
    }
  }

  // 2. Scheduled Start Time Reached (nowTime >= scheduledMs)
  if (nowTime >= scheduledMs) {
    // If 0-1 players present -> Auto Cancel (No refund for host, play quota stays deducted)
    if (playerUids.length <= 1) {
      await cancelScheduledRoomNoRefund(roomCode, room.roomName, playerUids);
      if (currentUserId && playerUids.includes(currentUserId)) {
        triggerDeviceNotification(
          'Arena Versus Dibatalkan ⚠️',
          `Arena Versus "${room.roomName}" (#${roomCode}) dibatalkan otomatis karena kurang dari 2 orang pemain.`
        );
      }
      return;
    }

    // If >= 2 players present -> Auto Start & Host Transfer if original Host is missing
    if (playerUids.length >= 2) {
      const roomRef = doc(db, 'quiz_rooms', roomCode);
      const updateData: any = {
        status: 'playing',
        currentQuestionIndex: 0,
        currentQuestionStartedAt: Date.now(),
        updatedAt: Date.now()
      };

      // Check if original host is present in the player list
      // If original host is absent, reassign host role to the first present player (B/C)
      const hostPresent = playerUids.includes(room.hostId);
      if (!hostPresent) {
        const newHostUid = playerUids[0];
        const newHostPlayer = room.players[newHostUid];
        updateData.hostId = newHostUid;
        updateData.hostName = newHostPlayer?.displayName || 'Santri';
        updateData.hostPhoto = newHostPlayer?.photoURL || '';
      }

      await updateDoc(roomRef, updateData);

      // Send start notifications to joined players
      const startTitle = 'Pertandingan Versus Dimulai! 🚀';
      const startMessage = `Arena Versus "${room.roomName}" (#${roomCode}) telah dimulai! Ayo masuk dan jawab soal sekarang!`;

      for (const uid of playerUids) {
        createNotification(uid, 'versus_started', startTitle, startMessage, { targetId: roomCode }).catch(console.error);
      }
      if (currentUserId && playerUids.includes(currentUserId)) {
        triggerDeviceNotification(startTitle, startMessage);
      }
    }
  }
};

// Delete room & refund host when scheduled time arrives with single player
export const cancelAndRefundRoom = async (roomCode: string, hostUid: string) => {
  try {
    const roomRef = doc(db, 'quiz_rooms', roomCode);
    const snap = await getDoc(roomRef);
    if (snap.exists()) {
      await deleteDoc(roomRef);
    }
    if (hostUid) {
      await refundMultiplayerPlay(hostUid);
    }
  } catch (err) {
    console.error('Error canceling and refunding room:', err);
  }
};

// Submit answer for current question
export const submitRoomAnswer = async (
  roomCode: string,
  uid: string,
  questionIndex: number,
  answerIndex: number,
  timeTakenSec: number,
  timePerQuestion: number,
  correctAnswerIndex: number
) => {
  const roomRef = doc(db, 'quiz_rooms', roomCode);
  const snap = await getDoc(roomRef);

  if (!snap.exists()) return;
  const room = snap.data() as QuizRoom;
  const player = room.players?.[uid];
  if (!player) return;

  // Check if answer already submitted
  if (player.answers && player.answers[questionIndex]) return;

  const isCorrect = answerIndex === correctAnswerIndex;
  const now = Date.now();

  let updateData: any = {};
  let currentPoints = 0;
  let newStreak = player.streak || 0;

  if (isCorrect) {
    newStreak += 1;
    // Check if anyone else already answered correctly for this questionIndex
    let previousFastestUid: string | null = null;
    let previousFastestTime = Infinity;

    Object.entries(room.players || {}).forEach(([pUid, pData]) => {
      const ans = pData.answers?.[questionIndex];
      if (ans && ans.isCorrect) {
        const pTime = ans.timeTaken !== undefined ? ans.timeTaken : Infinity;
        if (pTime < previousFastestTime) {
          previousFastestTime = pTime;
          previousFastestUid = pUid;
        }
      }
    });

    if (!previousFastestUid || timeTakenSec < previousFastestTime) {
      // Current player is the fastest correct answer (100 base + 50 speed bonus = 150 points)
      currentPoints = 150;

      if (previousFastestUid && previousFastestUid !== uid) {
        // Revoke the 50 speed bonus from previous fastest player (they keep 100 base points)
        const prevPlayer = room.players[previousFastestUid];
        const prevNewScore = Math.max(0, (prevPlayer.score || 0) - 50);
        updateData[`players.${previousFastestUid}.score`] = prevNewScore;
        updateData[`players.${previousFastestUid}.answers.${questionIndex}.points`] = 100;
      }
    } else {
      // Current player answered correctly but was not the fastest -> 100 base points
      currentPoints = 100;
    }
  } else {
    newStreak = 0;
  }

  const newScore = (player.score || 0) + currentPoints;

  updateData[`players.${uid}.score`] = newScore;
  updateData[`players.${uid}.streak`] = newStreak;
  updateData[`players.${uid}.answers.${questionIndex}`] = {
    answerIndex,
    isCorrect,
    points: currentPoints,
    timeTaken: timeTakenSec,
    answeredAt: now
  };
  updateData.updatedAt = now;

  await updateDoc(roomRef, updateData);
};

// Move to next question or set to question_result / finished
export const advanceQuizRoom = async (roomCode: string, targetStatus: 'playing' | 'question_result' | 'finished', nextIndex?: number) => {
  const roomRef = doc(db, 'quiz_rooms', roomCode);
  const updateData: any = {
    status: targetStatus,
    updatedAt: Date.now()
  };

  if (targetStatus === 'playing' && typeof nextIndex === 'number') {
    updateData.currentQuestionIndex = nextIndex;
    updateData.currentQuestionStartedAt = Date.now();
  }

  await updateDoc(roomRef, updateData);
};

// Add a tie-breaker question and advance room to 'playing'
export const addTieBreakerQuestionAndAdvance = async (
  roomCode: string,
  existingQuestions: QuizQuestion[],
  topic?: string
) => {
  const roomRef = doc(db, 'quiz_rooms', roomCode);

  // 1. Fetch questions from Firestore 'quizzes' collection
  let adminBank: any[] = [];
  try {
    const snap = await getDocs(collection(db, 'quizzes'));
    if (!snap.empty) {
      adminBank = snap.docs.map(docSnap => {
        const d = docSnap.data();
        const options = Array.isArray(d.options) 
          ? d.options 
          : [d.optionA, d.optionB, d.optionC, d.optionD].filter(Boolean);
        return {
          id: docSnap.id,
          question: d.question || '',
          arabicQuestion: d.arabicQuestion || '',
          audioUrl: d.audioUrl || '',
          surahRef: d.surahRef || '',
          options,
          correctIndex: typeof d.correctIndex === 'number' ? d.correctIndex : (typeof d.answerIndex === 'number' ? d.answerIndex : 0),
          explanation: d.explanation || '',
          topic: d.topic || d.category || 'Umum'
        };
      }).filter(q => q.question && Array.isArray(q.options) && q.options.length >= 2);
    }
  } catch (err) {
    console.warn("Gagal mengambil data soal dari admin untuk tie breaker:", err);
  }

  const fullBank = [...adminBank, ...DEFAULT_QUIZ_BANK];

  // Filter out questions already in existingQuestions
  const usedTexts = new Set((existingQuestions || []).map(q => q.question.trim().toLowerCase()));
  let pool = fullBank.filter(q => !usedTexts.has(q.question.trim().toLowerCase()));

  if (pool.length === 0) {
    // If all questions are used, fallback to full bank
    pool = fullBank;
  }

  // Filter pool by topic if possible
  const isRandom = !topic || topic.includes('Random') || topic.includes('Acak');
  if (!isRandom) {
    const topicFiltered = pool.filter(q => q.topic && q.topic.toLowerCase() === topic.toLowerCase());
    if (topicFiltered.length > 0) {
      pool = topicFiltered;
    }
  }

  // Pick 1 question
  const picked = pool[Math.floor(Math.random() * pool.length)];

  const tieBreakerQ: QuizQuestion = {
    id: picked.id ? `tb-${picked.id}-${Date.now()}` : `tb-${Date.now()}`,
    question: picked.question,
    arabicQuestion: picked.arabicQuestion,
    audioUrl: picked.audioUrl,
    surahRef: picked.surahRef,
    options: picked.options,
    correctIndex: picked.correctIndex,
    explanation: picked.explanation || '',
    topic: picked.topic,
    isTieBreaker: true
  };

  const updatedQuestions = [...(existingQuestions || []), tieBreakerQ];
  const nextIndex = (existingQuestions || []).length;

  await updateDoc(roomRef, {
    questions: updatedQuestions,
    currentQuestionIndex: nextIndex,
    currentQuestionStartedAt: Date.now(),
    status: 'playing',
    updatedAt: Date.now()
  });
};

// Leave room
export const leaveQuizRoom = async (roomCode: string, uid: string) => {
  const roomRef = doc(db, 'quiz_rooms', roomCode);
  const snap = await getDoc(roomRef);

  if (!snap.exists()) return;
  const room = snap.data() as QuizRoom;

  if (room.status === 'finished') {
    // Do not delete player records or alter the scoreboard once the game is finished.
    // This allows all players and spectators to view the complete final scoreboard.
    return;
  }

  const isGameActive = room.status === 'playing' || room.status === 'question_result';
  const remainingPlayerUids = Object.keys(room.players || {}).filter((id) => id !== uid);

  if (remainingPlayerUids.length === 0) {
    // Only delete room document if it was in 'waiting' lobby status and empty.
    // If room is finished or active game, keep room alive for history/records.
    if (room.status === 'waiting') {
      await deleteDoc(roomRef);
    }
  } else {
    let updateData: any = {
      updatedAt: Date.now()
    };

    if (isGameActive) {
      // Mark player as forfeited/kalah during active match
      updateData[`players.${uid}.isForfeited`] = true;
      updateData[`players.${uid}.status`] = 'kalah';

      const activeRemainingUids = remainingPlayerUids.filter((id) => !room.players[id]?.isForfeited);

      if (activeRemainingUids.length === 0) {
        // All remaining players forfeited/left -> finish game
        updateData.status = 'finished';
      } else if (room.hostId === uid) {
        // Reassign host to first remaining active player
        updateData.hostId = activeRemainingUids[0];
        updateData.hostName = room.players[activeRemainingUids[0]]?.displayName || 'Santri';
      }
    } else {
      // Lobby mode: remove player record completely
      updateData[`players.${uid}`] = deleteField();
      if (room.hostId === uid) {
        updateData.hostId = remainingPlayerUids[0];
        updateData.hostName = room.players[remainingPlayerUids[0]]?.displayName || 'Santri';
        updateData[`players.${remainingPlayerUids[0]}.isReady`] = true;
      }
    }

    await updateDoc(roomRef, updateData);
  }
};

// Reassign host of a room in active game due to inactivity
export const reassignHostInGame = async (roomCode: string, currentQuestionIndex: number, expectedHostId: string): Promise<{ success: boolean; newHostId?: string }> => {
  const roomRef = doc(db, 'quiz_rooms', roomCode);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return { success: false };
  const room = roomSnap.data() as QuizRoom;
  if (room.status !== 'playing' && room.status !== 'question_result') return { success: false };

  // Ensure host hasn't already been changed
  if (room.hostId !== expectedHostId) return { success: false };

  // Check if host did not answer (missing answer or answered -1)
  const hostPlayer = room.players[room.hostId];
  const hostAnswer = hostPlayer?.answers?.[currentQuestionIndex];
  const hostDidNotAnswer = !hostAnswer || hostAnswer.answerIndex === -1;

  if (!hostDidNotAnswer) {
    // Host actually answered, no need to reassign
    return { success: false };
  }

  const playerUids = Object.keys(room.players || {});
  const activeRemainingUids = playerUids.filter((id) => id !== room.hostId && !room.players[id]?.isForfeited);

  if (activeRemainingUids.length > 0) {
    const newHostId = activeRemainingUids[0];
    const newHostPlayer = room.players[newHostId];
    
    await updateDoc(roomRef, {
      hostId: newHostId,
      hostName: newHostPlayer.displayName || 'Santri',
      hostPhoto: newHostPlayer.photoURL || '',
    });
    return { success: true, newHostId };
  }
  return { success: false };
};

// Delete room completely (Host action)
export const deleteQuizRoom = async (roomCode: string) => {
  const roomRef = doc(db, 'quiz_rooms', roomCode);
  await deleteDoc(roomRef);
};

// Subscribe to room updates real-time
export const subscribeToQuizRoom = (
  roomCode: string,
  onUpdate: (room: QuizRoom | null) => void,
  onError?: (err: any) => void
) => {
  const roomRef = doc(db, 'quiz_rooms', roomCode);
  return onSnapshot(
    roomRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as QuizRoom);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error('Quiz room snapshot error:', err);
      if (onError) onError(err);
    }
  );
};

// Subscribe to public/versus rooms real-time (All active & history rooms)
export const subscribeToPublicQuizRooms = (
  onUpdate: (rooms: QuizRoom[]) => void,
  onError?: (err: any) => void
) => {
  const roomsRef = collection(db, 'quiz_rooms');
  const q = query(
    roomsRef,
    where('isPublic', '==', true)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const rooms: QuizRoom[] = [];
      snapshot.forEach((doc) => {
        rooms.push(doc.data() as QuizRoom);
      });
      // Sort newest first
      rooms.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onUpdate(rooms);
    },
    (err) => {
      console.error('Public quiz rooms snapshot error:', err);
      if (onError) onError(err);
    }
  );
};
