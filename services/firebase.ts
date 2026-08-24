import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithCredential, 
  signOut, 
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  addDoc, 
  deleteDoc, 
  where, 
  limit, 
  serverTimestamp, 
  increment,
  enableNetwork,
  disableNetwork,
  arrayUnion,
  arrayRemove,
  writeBatch
} from 'firebase/firestore';

import firebaseAppletConfig from '../firebase-applet-config.json';

// Konfigurasi Firebase
const firebaseConfig = firebaseAppletConfig;

// Cek apakah konfigurasi adalah placeholder (Remixed)
const isPlaceholder = 
  firebaseConfig.apiKey === "remixed-api-key" || 
  firebaseConfig.projectId === "remixed-project-id" ||
  !firebaseConfig.apiKey;

let app: any;
export let auth: any;
export let db: any;
export let analytics: any;

try {
  if (!isPlaceholder) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Menggunakan default database Firestore untuk mencegah data pengguna kembali ke awal (reset)
    db = getFirestore(app);
    
    // Analytics hanya berjalan jika di lingkungan browser
    if (typeof window !== "undefined" && firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
    console.log("Firebase initialized successfully");
  } else {
    console.warn("Firebase menggunakan placeholder (Remixed). Beberapa fitur cloud mungkin tidak berjalan.");
  }
} catch (e) {
  console.error("Firebase Init Error", e);
}

export const isFirebaseReady = () => !!db && !isPlaceholder;

export const getRankDetails = (points: number = 0) => {
  if (points >= 1000000) return { name: 'Sultan', color: 'amber', border: 'border-amber-500 shadow-amber-500/50', bg: 'from-amber-500 to-amber-700', text: 'text-white', icon: '👑' };
  if (points >= 700000) return { name: 'Istiqomah', color: 'cyan', border: 'border-cyan-400 shadow-cyan-400/40', bg: 'from-cyan-400 to-cyan-600', text: 'text-white', icon: '✨' };
  if (points >= 300000) return { name: 'Aliyah', color: 'emerald', border: 'border-emerald-500 shadow-emerald-500/40', bg: 'from-emerald-400 to-emerald-600', text: 'text-white', icon: '🏆' };
  if (points >= 100000) return { name: 'Tsanawiyah', color: 'orange', border: 'border-orange-500 shadow-orange-500/30', bg: 'from-orange-400 to-orange-600', text: 'text-white', icon: '⭐️' };
  return { name: 'Ibtidaiyah', color: 'slate', border: 'border-slate-200', bg: 'from-slate-400 to-slate-500', text: 'text-white', icon: '🌱' };
};

// --- INTERFACES ---

export interface QuizData {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
  explanation?: string;
}

export interface RewardData {
  id?: string;
  name: string;
  points: number;
  icon: string;
}

export interface RedemptionData {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  rewardId: string;
  rewardName: string;
  pointsCost: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: any;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string | null;
    email: string | null;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: any[];
  }
}

export const handleFirestoreError = (error: any, operationType: any, path: string | null = null) => {
  if (error?.code === 'permission-denied') {
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: auth?.currentUser?.uid || null,
        email: auth?.currentUser?.email || null,
        emailVerified: auth?.currentUser?.emailVerified || false,
        isAnonymous: auth?.currentUser?.isAnonymous || false,
        providerInfo: auth?.currentUser?.providerData || []
      }
    };
    console.error("Firestore Permission Denied:", errorInfo);
    throw new Error("Akses database tidak diizinkan. Silakan muat ulang atau login kembali.");
  }
  throw error;
};

// --- USER DOCUMENT ENSURANCE ---

export const ensureUserDocument = async (user: User) => {
  if (!db) return;
  const userRef = doc(db, 'users', user.uid);
  
  try {
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        displayName: user.displayName || 'Santri Baru',
        email: user.email || '',
        photoURL: user.photoURL || '',
        points: 0,
        wasilah: 10, 
        wasilahPoints: 10,
        lastCheckIn: null, 
        correctAnswers: 0,
        level: 'Ibtidaiyah',
        role: 'user',
        status: 'Active',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        referralCode: `SANTRI-${user.uid.substring(0,5).toUpperCase()}`,
        referredBy: null,
        referredByName: null
      });

      try {
        await addDoc(collection(db, 'transactions'), {
          userId: user.uid,
          userName: user.displayName || 'Santri Baru',
          userEmail: user.email || '',
          type: 'bonus',
          item: 'Bonus Pengguna Baru (10 Wasilah)',
          amount: 10,
          status: 'success',
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Failed to log welcome wasilah transaction:", err);
      }
    } else {
      await updateDoc(userRef, { 
        lastLogin: serverTimestamp(),
        email: user.email,
        displayName: user.displayName || snap.data().displayName,
        photoURL: snap.data().photoURL || user.photoURL || ''
      });
    }
  } catch (e) {
    console.error("Error ensuring user document:", e);
  }
};

// --- AUTH FUNCTIONS ---
export const signInWithGoogle = async () => {
  if (!auth) throw new Error("Firebase not initialized");
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const signInWithAndroidToken = async (idToken: string) => {
  if (!auth) throw new Error("Firebase not initialized");
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
};

export const loginWithEmail = async (email: string, pass: string) => {
  if (!auth) throw new Error("Firebase not initialized");
  return signInWithEmailAndPassword(auth, email, pass);
};

export const registerWithEmail = async (email: string, pass: string, referralCode?: string) => {
  if (!auth) throw new Error("Firebase not initialized");
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  
  if (referralCode && result.user) {
    const q = query(collection(db, 'users'), where('referralCode', '==', referralCode), limit(1));
    const snap = await getDocs(q);
    
    let referrerId = 'unknown';
    let referrerName = 'Unknown User';
    
    if (!snap.empty) {
      referrerId = snap.docs[0].id;
      referrerName = snap.docs[0].data().displayName || 'Anonymous';
    }

    await addDoc(collection(db, 'referral_requests'), {
      newUserId: result.user.uid,
      newUserName: result.user.displayName || email.split('@')[0],
      newUserEmail: result.user.email,
      referrerCode: referralCode,
      referrerId: referrerId,
      referrerName: referrerName,
      status: 'Pending',
      createdAt: serverTimestamp()
    });
  }
  return result;
};

export const logout = async () => {
  if (!auth) return;
  return signOut(auth);
};

export const deleteUserAuthAccount = async (user: User) => {
  if (db) {
    await deleteDoc(doc(db, 'users', user.uid));
  }
  return deleteUser(user);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const resetPassword = async (email: string) => {
  if (!auth) throw new Error("Firebase not initialized");
  return sendPasswordResetEmail(auth, email);
};

// FIX: Menambahkan photoURL ke parameter update profil secara aman
export const updateUserProfileAuth = async (user: User, profile: { displayName?: string, photoURL?: string }) => {
  const payload: { displayName?: string; photoURL?: string } = {};
  if (profile.displayName !== undefined) {
    payload.displayName = profile.displayName;
  }
  if (profile.photoURL !== undefined && profile.photoURL.length <= 2000 && !profile.photoURL.startsWith('data:')) {
    payload.photoURL = profile.photoURL;
  }

  if (Object.keys(payload).length > 0) {
    try {
      await updateProfile(user, payload);
    } catch (err: any) {
      console.warn("Firebase Auth updateProfile warning:", err);
      if (payload.photoURL && payload.displayName) {
        try {
          await updateProfile(user, { displayName: payload.displayName });
        } catch (e) {
          console.warn("Fallback updateProfile failed:", e);
        }
      }
    }
  }
};

export const updateUserEmailAuth = async (user: User, email: string) => {
  return updateEmail(user, email);
};

export const updateUserPasswordAuth = async (user: User, pass: string) => {
  return updatePassword(user, pass);
};

export const sendVerificationEmailToUser = async (user: User) => {
  return sendEmailVerification(user);
};

// --- USER DATA FUNCTIONS ---

export const getUserData = async (userId: string) => {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? snap.data() : null;
};

export const subscribeToUserData = (userId: string, callback: (data: any) => void) => {
  if (!db) return () => {};
  return onSnapshot(doc(db, 'users', userId), (doc) => {
    callback(doc.exists() ? doc.data() : null);
  }, (error) => {
    try {
      handleFirestoreError(error, 'get', `users/${userId}`);
    } catch (e) {
      callback(null);
    }
  });
};

export const updateUserData = async (userId: string, data: any) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

export const incrementUserPoints = async (userId: string, points: number) => {
  if (!db) return;
  await updateDoc(doc(db, 'users', userId), { 
    points: increment(points),
    updatedAt: serverTimestamp()
  });
};

export const incrementUserXp = async (userId: string, xp: number) => {
  if (!db) return;
  await updateDoc(doc(db, 'users', userId), { 
    totalXp: increment(xp),
    updatedAt: serverTimestamp()
  });
};

export interface DailyCheckInResult {
  streakDays: number;
  dayInCycle: number; // 1 to 7
  xpEarned: number;
  wasilahEarned: number;
  extraChanceEarned: number;
  isGrandDay: boolean;
  message: string;
}

export const handleDailyCheckIn = async (userId: string): Promise<DailyCheckInResult> => {
    if (!db) throw new Error("Database tidak tersedia.");
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) throw new Error("Pengguna tidak ditemukan.");

    const userData = snap.data();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const lastCheckIn = userData.lastCheckIn || null;

    if (lastCheckIn === today) {
        throw new Error("Anda sudah melakukan absensi harian hari ini.");
    }

    let currentStreak = userData.loginStreak || 0;
    let newStreak = 1;

    // Check if streak was maintained from yesterday
    if (lastCheckIn === yesterday) {
        newStreak = currentStreak + 1;
    } else {
        // Missed yesterday - streak breaks unless saved prior
        newStreak = 1;
    }

    // Day in 7-day cycle (1 to 7)
    const dayInCycle = ((newStreak - 1) % 7) + 1;
    const isGrandDay = dayInCycle === 7;

    let xpEarned = 10;
    let wasilahEarned = 1;

    if (dayInCycle === 1) {
        xpEarned = 0;
        wasilahEarned = 1;
    } else if (dayInCycle === 2) {
        xpEarned = 10;
        wasilahEarned = 1;
    } else if (dayInCycle === 3) {
        xpEarned = 30;
        wasilahEarned = 3;
    } else if (dayInCycle === 4) {
        xpEarned = 10;
        wasilahEarned = 1;
    } else if (dayInCycle === 5) {
        xpEarned = 20;
        wasilahEarned = 1;
    } else if (dayInCycle === 6) {
        xpEarned = 20;
        wasilahEarned = 2;
    } else if (dayInCycle === 7) {
        xpEarned = 50;
        wasilahEarned = 5;
    }

    const extraChanceEarned = isGrandDay ? 1 : 0;

    const maxStreak = Math.max(newStreak, userData.maxLoginStreak || 0);

    const updates: any = {
        points: increment(xpEarned),
        wasilah: increment(wasilahEarned),
        lastCheckIn: today,
        loginStreak: newStreak,
        maxLoginStreak: maxStreak,
        updatedAt: serverTimestamp()
    };

    if (extraChanceEarned > 0) {
        updates.extraChances = increment(extraChanceEarned);
    }

    // Check if daily community target of 100 check-ins is reached or will be reached
    let gotCommunityTargetBonus = false;
    try {
        const statsRef = doc(db, 'daily_attendance_stats', today);
        const statsSnap = await getDoc(statsRef);
        const currentCount = statsSnap.exists() ? (statsSnap.data().count || 0) : 0;
        if (currentCount + 1 >= 100 && userData.lastCommunityTargetRewardClaimed !== today) {
            gotCommunityTargetBonus = true;
            xpEarned += 100;
            wasilahEarned += 10;
            updates.lastCommunityTargetRewardClaimed = today;
        }
    } catch (err) {
        console.error("Gagal memeriksa target 100 absensi:", err);
    }

    await updateDoc(userRef, updates);

    // Increment daily check-in counter for collective check-in progress
    try {
        const statsRef = doc(db, 'daily_attendance_stats', today);
        await setDoc(statsRef, { count: increment(1) }, { merge: true });
    } catch (err) {
        console.error("Gagal mengupdate statistik absensi harian berjamaah:", err);
    }

    const bonusSuffix = gotCommunityTargetBonus ? " 🎉 Termasuk Bonus Target 100 Absen (+10 Wasilah & +100 XP)!" : "";

    return {
        streakDays: newStreak,
        dayInCycle,
        xpEarned,
        wasilahEarned,
        extraChanceEarned,
        isGrandDay,
        message: isGrandDay 
            ? `Puncak Istiqomah Hari ke-7! 🎉 Bonus +${xpEarned} XP, +${wasilahEarned} Wasilah, & +1 Tiket Ekstra Kuis!${bonusSuffix}` 
            : `Alhamdulillah! Absensi Hari ke-${dayInCycle} (+${xpEarned} XP, +${wasilahEarned} Wasilah)${bonusSuffix}`
    };
};

export const handleClaimCommunityTargetReward = async (userId: string): Promise<{ success: boolean; message: string }> => {
    if (!db) throw new Error("Database tidak tersedia.");
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) throw new Error("Pengguna tidak ditemukan.");

    const userData = snap.data();
    const today = new Date().toISOString().split('T')[0];

    if (userData.lastCheckIn !== today) {
        throw new Error("Anda harus melakukan absensi harian hari ini terlebih dahulu.");
    }

    if (userData.lastCommunityTargetRewardClaimed === today) {
        throw new Error("Anda sudah mengklaim bonus target 100 absensi hari ini.");
    }

    const statsRef = doc(db, 'daily_attendance_stats', today);
    const statsSnap = await getDoc(statsRef);
    const count = statsSnap.exists() ? (statsSnap.data().count || 0) : 0;

    if (count < 100) {
        throw new Error("Target 100 absensi hari ini belum tercapai.");
    }

    await updateDoc(userRef, {
        points: increment(100),
        wasilah: increment(10),
        lastCommunityTargetRewardClaimed: today,
        updatedAt: serverTimestamp()
    });

    return {
        success: true,
        message: "Barakallah! Bonus +10 Wasilah & +100 XP (Bonus Target 100 Absen) berhasil diklaim!"
    };
};

export const handleSaveStreak = async (userId: string, method: 'wasilah' | 'ad' | 'combined'): Promise<{ success: boolean; message: string }> => {
    if (!db) throw new Error("Database tidak tersedia.");
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) throw new Error("Pengguna tidak ditemukan.");

    const userData = snap.data();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (method === 'combined') {
        const currentWasilah = userData.wasilah || 0;
        if (currentWasilah < 2) {
            throw new Error("Wasilah Anda tidak cukup untuk Penyelamat Streak (butuh 2 Wasilah).");
        }
        await updateDoc(userRef, {
            wasilah: increment(-2),
            lastCheckIn: yesterday,
            streakSavedDate: new Date().toISOString().split('T')[0],
            updatedAt: serverTimestamp()
        });
    } else if (method === 'wasilah') {
        const currentWasilah = userData.wasilah || 0;
        if (currentWasilah < 3) {
            throw new Error("Wasilah Anda tidak cukup untuk Penyelamat Streak (butuh 3 Wasilah).");
        }
        await updateDoc(userRef, {
            wasilah: increment(-3),
            lastCheckIn: yesterday,
            streakSavedDate: new Date().toISOString().split('T')[0],
            updatedAt: serverTimestamp()
        });
    } else if (method === 'ad') {
        await updateDoc(userRef, {
            lastCheckIn: yesterday,
            streakSavedDate: new Date().toISOString().split('T')[0],
            updatedAt: serverTimestamp()
        });
    }

    return {
        success: true,
        message: "Rantai Istiqomah berhasil diselamatkan! Anda kini dapat melanjutkan absensi hari ini."
    };
};

export const handleAdReward = async (userId: string) => {
    if (!db) throw new Error("Database tidak tersedia.");
    const userRef = doc(db, 'users', userId);
    return await updateDoc(userRef, {
        points: increment(100),
        wasilah: increment(1),
        updatedAt: serverTimestamp()
    });
};

export const handleAttendanceAdReward = async (userId: string): Promise<{ success: boolean; message: string }> => {
    if (!db) throw new Error("Database tidak tersedia.");
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) throw new Error("Pengguna tidak ditemukan.");

    const userData = snap.data();
    const today = new Date().toISOString().split('T')[0];

    // Ensure they have checked in today first
    if (userData.lastCheckIn !== today) {
        throw new Error("Anda harus melakukan absensi harian terlebih dahulu.");
    }

    // Check if they already claimed the ad reward today
    if (userData.lastAttendanceAdRewardClaimed === today) {
        throw new Error("Anda sudah mengambil bonus Wasilah iklan hari ini.");
    }

    await updateDoc(userRef, {
        wasilah: increment(1),
        lastAttendanceAdRewardClaimed: today,
        updatedAt: serverTimestamp()
    });

    return {
        success: true,
        message: "Barakallah! Tambahan +1 Wasilah berhasil diklaim lewat iklan reward."
    };
};

export const subscribeToDailyAttendanceStats = (callback: (data: { count: number }) => void) => {
    if (!db) return () => {};
    const today = new Date().toISOString().split('T')[0];
    const statsRef = doc(db, 'daily_attendance_stats', today);
    return onSnapshot(statsRef, (snapshot) => {
        if (snapshot.exists()) {
            callback({ count: snapshot.data().count || 0 });
        } else {
            callback({ count: 0 });
        }
    }, (error) => {
        console.error("Stats subscribe error:", error);
        callback({ count: 0 });
    });
};

export const getStableNudgeCandidates = (users: any[], currentUserId: string): any[] => {
    if (!users || users.length === 0 || !currentUserId) return [];
    
    // Sort by id to ensure a stable baseline
    const sorted = [...users].sort((a, b) => a.id.localeCompare(b.id));
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Create a simple deterministic numeric seed from currentUserId and todayStr
    const seedString = `${currentUserId}_${todayStr}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
        hash = (hash << 5) - hash + seedString.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    hash = Math.abs(hash);

    const result: any[] = [];
    const listToSelect = [...sorted];
    
    // Deterministically select up to 4 users
    const countToSelect = Math.min(4, listToSelect.length);
    for (let i = 0; i < countToSelect; i++) {
        const index = (hash + i * 31) % listToSelect.length;
        if (listToSelect[index]) {
            result.push(listToSelect[index]);
            listToSelect.splice(index, 1);
        }
    }
    return result;
};

export const subscribeToUsersToNudge = (currentUserId: string, callback: (users: any[]) => void) => {
    if (!db) return () => {};
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, 'users'), where('lastCheckIn', '!=', today), limit(45));
    return onSnapshot(q, (snapshot) => {
        let list = snapshot.docs
            .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
            .filter(u => u.id !== currentUserId);
        
        if (list.length === 0) {
            // Fallback: fetch general users if nobody hasn't checked-in yet
            const fallbackQuery = query(collection(db, 'users'), limit(15));
            getDocs(fallbackQuery).then(fbSnap => {
                const fbList = fbSnap.docs
                    .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
                    .filter(u => u.id !== currentUserId);
                callback(fbList);
            }).catch(() => {
                callback([]);
            });
        } else {
            callback(list);
        }
    }, (error) => {
        console.error("Users to nudge subscribe error:", error);
        callback([]);
    });
};

export const handleNudgeUser = async (currentUserId: string, targetUserId: string): Promise<{ success: boolean; message: string; dailyNudgeCount: number; rewardEarned: boolean }> => {
    if (!db) throw new Error("Database tidak tersedia.");
    const today = new Date().toISOString().split('T')[0];

    const userRef = doc(db, 'users', currentUserId);
    const targetRef = doc(db, 'users', targetUserId);

    const userSnap = await getDoc(userRef);
    const targetSnap = await getDoc(targetRef);

    if (!userSnap.exists()) throw new Error("Pengguna tidak ditemukan.");
    if (!targetSnap.exists()) throw new Error("Target pengguna tidak ditemukan.");

    const userData = userSnap.data();
    const targetData = targetSnap.data();

    const lastNudgeDate = userData.lastNudgeDate || '';
    let nudgedUserIds = userData.nudgedUserIds || [];
    let dailyNudgeCount = userData.dailyNudgeCount || 0;

    // Reset daily stats if it is a new day
    if (lastNudgeDate !== today) {
        nudgedUserIds = [];
        dailyNudgeCount = 0;
    } else {
        dailyNudgeCount = Math.min(dailyNudgeCount, 4);
    }

    if (dailyNudgeCount >= 4) {
        throw new Error("Misi senggol absen hari ini sudah selesai (4/4).");
    }

    if (nudgedUserIds.includes(targetUserId)) {
        throw new Error(`Anda sudah menyenggol ${targetData.displayName || 'santri ini'} hari ini.`);
    }

    const newNudgedUserIds = [...nudgedUserIds, targetUserId];
    const newNudgeCount = Math.min(4, dailyNudgeCount + 1);
    const rewardEarned = newNudgeCount === 4 && dailyNudgeCount < 4;

    // Update current user
    const updates: any = {
        lastNudgeDate: today,
        nudgedUserIds: newNudgedUserIds,
        dailyNudgeCount: newNudgeCount,
        updatedAt: serverTimestamp()
    };

    if (rewardEarned) {
        updates.points = increment(100);
        updates.wasilah = increment(1);
    }

    await updateDoc(userRef, updates);

    // Write nudge event to target user's received_nudges subcollection
    const targetNudgeRef = doc(db, 'users', targetUserId, 'received_nudges', currentUserId);
    await setDoc(targetNudgeRef, {
        fromId: currentUserId,
        fromName: userData.displayName || 'Santri AI',
        fromPhoto: userData.photoURL || '',
        createdAt: serverTimestamp()
    }, { merge: true });

    let successMessage = `Sukses menyenggol ${targetData.displayName || 'santri'}!`;
    if (rewardEarned) {
        successMessage = `Masya Allah! Anda telah menyenggol 4 santri hari ini. Bonus +100 XP & +1 Wasilah berhasil diklaim! 🎉`;
    } else {
        successMessage = `Sukses menyenggol ${targetData.displayName || 'santri'}. Senggol ${4 - newNudgeCount} santri lagi untuk bonus!`;
    }

    return {
        success: true,
        message: successMessage,
        dailyNudgeCount: newNudgeCount,
        rewardEarned
    };
};

export const subscribeToReceivedNudges = (userId: string, callback: (nudges: any[]) => void) => {
    if (!db) return () => {};
    const q = query(
        collection(db, 'users', userId, 'received_nudges'),
        orderBy('createdAt', 'desc'),
        limit(10)
    );
    return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        callback(list);
    }, (error) => {
        console.error("Received nudges subscribe error:", error);
        callback([]);
    });
};

export const incrementUserGameStats = async (userId: string, points: number, correctCount: number, wasilahEarned: number = 0) => {
  if (!db) return;
  const updates: any = { 
    points: increment(points), 
    correctAnswers: increment(correctCount),
    updatedAt: serverTimestamp()
  };
  if (wasilahEarned > 0) {
    updates.wasilah = increment(wasilahEarned);
  }
  await updateDoc(doc(db, 'users', userId), updates);
};

export const subscribeToLeaderboard = (callback: (data: any[]) => void) => {
  if (!db) return () => {};
  // Leaderboard is based on Points (Rank Prestige), not Wasilah (Spendable Currency)
  const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((docSnap, idx) => {
      const data = docSnap.data();
      let frame = data.avatarFrame || 'none';
      if (idx < 10) {
        // Automatically assign rank_1 .. rank_10 corresponding to exact rank position
        if (!frame || frame === 'none' || frame.startsWith('rank_')) {
          frame = `rank_${idx + 1}`;
        }
      }
      return { id: docSnap.id, ...data, avatarFrame: frame, rankIndex: idx };
    });
    callback(items);
  }, (error) => {
    console.error("Leaderboard subscribe error:", error);
    callback([]);
  });
};

export const subscribeToStreakLeaderboard = (callback: (data: any[]) => void) => {
  if (!db) return () => {};
  // Leaderboard khusus Top Istiqomah, diurutkan berdasarkan loginStreak
  const q = query(collection(db, 'users'), orderBy('loginStreak', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((docSnap, idx) => {
      const data = docSnap.data();
      let frame = data.avatarFrame || 'none';
      if (idx < 10) {
        if (!frame || frame === 'none' || frame.startsWith('rank_')) {
          frame = `rank_${idx + 1}`;
        }
      }
      return { id: docSnap.id, ...data, avatarFrame: frame, rankIndex: idx };
    });
    callback(items);
  }, (error) => {
    console.error("Streak leaderboard subscribe error:", error);
    callback([]);
  });
};

export const subscribeToMiliarderLeaderboard = (callback: (data: any[]) => void) => {
  if (!db) return () => {};
  // Leaderboard khusus Santri Miliarder, diurutkan berdasarkan miliarderXp
  const q = query(collection(db, 'users'), orderBy('miliarderXp', 'desc'), limit(10));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  }, (error) => {
    console.error("Miliarder leaderboard subscribe error:", error);
    callback([]);
  });
};

// --- BOOKMARKS ---
export const saveUserBookmark = async (userId: string, type: string, id: string, data: any) => {
  if (!db) return;
  const ref = doc(db, 'users', userId, 'bookmarks', id);
  await setDoc(ref, { ...data, type, createdAt: serverTimestamp() });
};

export const removeUserBookmark = async (userId: string, id: string) => {
  if (!db) return;
  const ref = doc(db, 'users', userId, 'bookmarks', id);
  await deleteDoc(ref);
};

export const subscribeUserBookmarks = (userId: string, type: string, callback: (data: any[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'users', userId, 'bookmarks'), where('type', '==', type));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    items.sort((a: any, b: any) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
    callback(items);
  }, (error) => {
    try {
      handleFirestoreError(error, 'list', `users/${userId}/bookmarks`);
    } catch (e) {
      callback([]);
      throw e;
    }
  });
};

// --- TASBIH LOGS ---

export const saveTasbihLog = async (userId: string, log: any) => {
  if (!db) return;
  return addDoc(collection(db, 'users', userId, 'tasbih_logs'), {
    ...log,
    createdAt: serverTimestamp()
  });
};

export const subscribeToTasbihLogs = (userId: string, callback: (data: any[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'users', userId, 'tasbih_logs'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, 'list', `users/${userId}/tasbih_logs`);
  });
};

// --- QUIZZES ---

export const subscribeToQuizzes = (callback: (data: any[]) => void) => {
  if (!db) return () => {};
  return onSnapshot(collection(db, 'quizzes'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, 'list', 'quizzes');
  });
};

export const addQuiz = async (quiz: any) => {
  if (!db) return;
  return addDoc(collection(db, 'quizzes'), { ...quiz, createdAt: serverTimestamp() });
};

export const deleteQuiz = async (id: string) => {
  if (!db) return;
  return deleteDoc(doc(db, 'quizzes', id));
};

export const updateQuiz = async (id: string, quiz: any) => {
  if (!db) return;
  return updateDoc(doc(db, 'quizzes', id), { ...quiz, updatedAt: serverTimestamp() });
};

// --- REWARDS ---

export const subscribeToRewards = (callback: (data: any[]) => void) => {
  if (!db) return () => {};
  return onSnapshot(collection(db, 'rewards'), (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  }, (error) => {
    handleFirestoreError(error, 'list', 'rewards');
  });
};

export const addReward = async (data: any) => {
  if (!db) return;
  return addDoc(collection(db, 'rewards'), { ...data, createdAt: serverTimestamp() });
};

export const deleteReward = async (id: string) => {
  if (!db) return;
  return deleteDoc(doc(db, 'rewards', id));
};

export const subscribeToUserRedemptions = (userId: string, callback: (data: any[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'redemptions'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    items.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(items);
  }, (error) => {
    try {
      handleFirestoreError(error, 'list', 'redemptions');
    } catch (e) {
      callback([]);
      throw e;
    }
  });
};

export const subscribeToRedemptions = (callback: (data: any[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'redemptions'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, 'list', 'redemptions');
  });
};

export const requestRedemption = async (user: User, reward: any) => {
  if (!db) return;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("Pengguna tidak ditemukan.");
  const currentWasilah = Number(snap.data()?.wasilah ?? snap.data()?.wasilahPoints ?? 0);
  const cost = Number(reward.points || 0);
  if (currentWasilah < cost) {
    throw new Error(`Poin Wasilah Anda tidak cukup (Sisa: ${currentWasilah}, Butuh: ${cost} Wasilah).`);
  }
  const remainingWasilah = Math.max(0, currentWasilah - cost);

  // Redemptions now use Wasilah as exchange tool, points are for ranking only
  await updateDoc(userRef, { 
    wasilah: remainingWasilah,
    wasilahPoints: remainingWasilah,
    updatedAt: serverTimestamp()
  });
  
  return addDoc(collection(db, 'redemptions'), {
    userId: user.uid,
    userName: user.displayName || user.email?.split('@')[0] || 'Santri',
    userEmail: user.email || '',
    rewardId: reward.id,
    rewardName: reward.name,
    pointsCost: reward.points, // Keep name but it means wasilah cost now
    status: 'Pending',
    createdAt: serverTimestamp()
  });
};

export const approveRedemption = async (id: string) => {
  if (!db) return;
  await updateDoc(doc(db, 'redemptions', id), { status: 'Approved', updatedAt: serverTimestamp() });
};

export const rejectRedemption = async (id: string) => {
  if (!db) return;
  const redRef = doc(db, 'redemptions', id);
  const snap = await getDoc(redRef);
  if (snap.exists()) {
    const data = snap.data();
    const userRef = doc(db, 'users', data.userId);
    // Refund points
    await updateDoc(userRef, { status: 'Rejected', updatedAt: serverTimestamp() });
  }
};

// --- REFERRALS ---

export const subscribeToMyReferrals = (userId: string, callback: (data: any[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'referral_requests'), where('referrerId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    items.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    callback(items);
  }, (error) => {
    try {
      handleFirestoreError(error, 'list', 'referral_requests');
    } catch (e) {
      callback([]);
      throw e;
    }
  });
};

export const applyReferralCode = async (userId: string, referralCode: string) => {
  if (!db) throw new Error("Database tidak diinisialisasi");
  
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    throw new Error("Pengguna tidak ditemukan.");
  }
  
  const userData = userSnap.data();
  if (userData.referredBy) {
    throw new Error("Anda sudah pernah menggunakan kode referral.");
  }

  // Prevent using own referral code
  if (userData.referralCode === referralCode) {
    throw new Error("Anda tidak dapat menggunakan kode referral Anda sendiri.");
  }

  // Check if they have already submitted/registered a referral request
  const checkQ = query(collection(db, 'referral_requests'), where('newUserId', '==', userId), limit(1));
  const checkSnap = await getDocs(checkQ);
  if (!checkSnap.empty) {
    throw new Error("Anda sudah pernah mengajukan kode referral (sedang menunggu persetujuan atau sudah disetujui).");
  }

  // Find user with this referral code
  const q = query(collection(db, 'users'), where('referralCode', '==', referralCode), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) {
    throw new Error("Kode referral tidak valid atau tidak ditemukan.");
  }

  const referrerDoc = snap.docs[0];
  const referrerId = referrerDoc.id;
  const referrerData = referrerDoc.data();
  
  // Just create a Pending referral request! Do not grant points yet.
  await addDoc(collection(db, 'referral_requests'), {
    newUserId: userId,
    newUserName: userData.displayName || 'User Baru',
    newUserEmail: userData.email || '',
    referrerCode: referralCode,
    referrerId: referrerId,
    referrerName: referrerData.displayName || 'Seseorang',
    status: 'Pending',
    createdAt: serverTimestamp()
  });

  // Notify referrer
  try {
    await createNotification(
      referrerId,
      'referral',
      'Kode Referral Digunakan',
      `**${userData.displayName || 'Seseorang'}** telah bergabung menggunakan kode referral Anda. Permintaan sedang menunggu persetujuan admin agar Anda mendapatkan bonus Wasilah!`,
      {
        senderId: userId,
        senderName: userData.displayName || 'User Baru',
        senderPhoto: userData.avatarUrl || userData.photoURL || ''
      }
    );
  } catch (err) {
    console.error("Error creating referral notification:", err);
  }

  return { referrerName: referrerData.displayName || 'Seseorang', approved: false };
};

export const approveReferralRequest = async (requestId: string) => {
  if (!db) throw new Error("Database tidak diinisialisasi");
  
  const reqRef = doc(db, 'referral_requests', requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) {
    throw new Error("Permintaan rujukan tidak ditemukan.");
  }
  
  const reqData = reqSnap.data();
  if (reqData.status && reqData.status !== 'Pending') {
    throw new Error(`Permintaan rujukan sudah diproses (Status: ${reqData.status}).`);
  }
  
  let { newUserId, referrerId, newUserName, referrerName, referrerCode, newUserEmail } = reqData;

  // Resolve Referrer ID if missing/unknown
  let finalReferrerId = referrerId;
  let finalReferrerName = referrerName || 'Pengundang';

  if (!finalReferrerId || finalReferrerId === 'unknown' || finalReferrerId === 'null') {
    if (referrerCode) {
      const q = query(collection(db, 'users'), where('referralCode', '==', referrerCode));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        finalReferrerId = qSnap.docs[0].id;
        finalReferrerName = qSnap.docs[0].data().displayName || finalReferrerName;
      }
    }
  }

  // Resolve New User ID if missing
  let finalNewUserId = newUserId;
  let finalNewUserName = newUserName || 'User Baru';

  if (!finalNewUserId && newUserEmail) {
    const qUser = query(collection(db, 'users'), where('email', '==', newUserEmail));
    const qUserSnap = await getDocs(qUser);
    if (!qUserSnap.empty) {
      finalNewUserId = qUserSnap.docs[0].id;
      finalNewUserName = qUserSnap.docs[0].data().displayName || finalNewUserName;
    }
  }
  
  // 1. Update request status to Success
  await setDoc(reqRef, {
    status: 'Success',
    referrerId: finalReferrerId || referrerId || '',
    referrerName: finalReferrerName,
    newUserId: finalNewUserId || newUserId || '',
    updatedAt: serverTimestamp()
  }, { merge: true });
  
  // 2. Add +10 Wasilah to new user and set referredBy info
  if (finalNewUserId) {
    const userRef = doc(db, 'users', finalNewUserId);
    await setDoc(userRef, {
      wasilah: increment(10),
      referredBy: finalReferrerId || null,
      referredByName: finalReferrerName,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    await createTransaction({
      userId: finalNewUserId,
      amount: 10,
      currency: 'WASILAH',
      type: 'referral_bonus',
      status: 'success',
      item: `Bonus rujukan dari pengundang ${finalReferrerName}`
    });

    // Notify new user
    try {
      await createNotification(
        finalNewUserId,
        'referral',
        'Bonus Referral Disetujui',
        `Selamat! Permintaan rujukan Anda dari **${finalReferrerName}** telah disetujui. Anda memperoleh **+10 Wasilah** gratis!`,
        {
          senderId: finalReferrerId || '',
          senderName: finalReferrerName
        }
      );
    } catch (err) {
      console.error("Error creating referral approval notification:", err);
    }
  }
  
  // 3. Add +30 Wasilah to referrer
  if (finalReferrerId && finalReferrerId !== 'unknown') {
    const referrerRef = doc(db, 'users', finalReferrerId);
    await setDoc(referrerRef, {
      wasilah: increment(30),
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    await createTransaction({
      userId: finalReferrerId,
      amount: 30,
      currency: 'WASILAH',
      type: 'referral_bonus',
      status: 'success',
      item: `Bonus rujukan mengundang ${finalNewUserName}`
    });

    // Notify referrer
    try {
      await createNotification(
        finalReferrerId,
        'referral',
        'Undangan Referral Sukses',
        `Selamat! Permintaan rujukan untuk **${finalNewUserName}** telah disetujui oleh admin. Anda memperoleh bonus **+30 Wasilah**!`,
        {
          senderId: finalNewUserId || '',
          senderName: finalNewUserName
        }
      );
    } catch (err) {
      console.error("Error creating referral approval notification:", err);
    }
  }
  
  return { success: true };
};

export const rejectReferralRequest = async (requestId: string) => {
  if (!db) throw new Error("Database tidak diinisialisasi");
  
  const reqRef = doc(db, 'referral_requests', requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) {
    throw new Error("Permintaan rujukan tidak ditemukan.");
  }
  
  const reqData = reqSnap.data();
  if (reqData.status !== 'Pending') {
    throw new Error(`Permintaan rujukan sudah diproses (Status: ${reqData.status}).`);
  }
  
  await updateDoc(reqRef, {
    status: 'Rejected',
    updatedAt: serverTimestamp()
  });

  // Notify new user & referrer about rejection
  try {
    if (reqData.newUserId) {
      await createNotification(
        reqData.newUserId,
        'referral',
        'Permintaan Referral Ditolak',
        `Maaf, permintaan rujukan Anda menggunakan kode dari **${reqData.referrerName || 'Seseorang'}** ditolak oleh admin.`,
        {
          senderId: reqData.referrerId || '',
          senderName: reqData.referrerName || 'Seseorang'
        }
      );
    }
    if (reqData.referrerId && reqData.referrerId !== 'unknown') {
      await createNotification(
        reqData.referrerId,
        'referral',
        'Permintaan Referral Ditolak',
        `Maaf, permintaan rujukan untuk **${reqData.newUserName || 'User Baru'}** ditolak oleh admin.`,
        {
          senderId: reqData.newUserId || '',
          senderName: reqData.newUserName || 'User Baru'
        }
      );
    }
  } catch (err) {
    console.error("Error creating referral rejection notification:", err);
  }
  
  return { success: true };
};

export const subscribeToReferralRequests = (callback: (data: any[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'referral_requests'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleFirestoreError(error, 'list', 'referral_requests');
  });
};

// --- BROADCASTS ---

export const subscribeToBroadcasts = (callback: (data: any[]) => void) => {
  if (!db) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, 'broadcasts'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  }, (error) => {
    console.error("Error in subscribeToBroadcasts:", error);
    callback([]);
    try {
      handleFirestoreError(error, 'list', 'broadcasts');
    } catch (e) {
      // ignore
    }
  });
};

export const sendBroadcast = async (data: any) => {
  if (!db) return;
  return addDoc(collection(db, 'broadcasts'), { ...data, createdAt: serverTimestamp() });
};

export const deleteBroadcast = async (id: string) => {
  if (!db) return;
  return deleteDoc(doc(db, 'broadcasts', id));
};

// --- SETTINGS ---

export const subscribeToUserSettings = (userId: string, callback: (settings: any) => void) => {
  if (!db) return () => {};
  return onSnapshot(doc(db, 'users', userId, 'settings', 'app'), (doc) => {
    callback(doc.exists() ? doc.data() : null);
  }, (error) => {
    handleFirestoreError(error, 'get', `users/${userId}/settings/app`);
  });
};

export const updateUserSettings = async (userId: string, settings: any) => {
  if (!db) return;
  await setDoc(doc(db, 'users', userId, 'settings', 'app'), settings, { merge: true });
};

// --- TAHFIDZ ---

export const subscribeToTahfidz = (userId: string, surahNumber: number, callback: (data: number[]) => void) => {
  if (!db) return () => {};
  return onSnapshot(doc(db, 'users', userId, 'tahfidz', surahNumber.toString()), (doc) => {
    if (doc.exists()) {
      callback(doc.data().ayahs || []);
    } else {
      callback([]);
    }
  }, (error) => {
    handleFirestoreError(error, 'get', `users/${userId}/tahfidz/${surahNumber}`);
  });
};

export const updateTahfidzProgress = async (userId: string, surahNumber: number, surahName: string, ayahNumber: number, isMemorized: boolean, totalAyahs: number) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'tahfidz', surahNumber.toString());
  const snap = await getDoc(docRef);
  let ayahs = [];
  if (snap.exists()) {
    ayahs = snap.data().ayahs || [];
  }
  
  if (isMemorized && !ayahs.includes(ayahNumber)) {
    ayahs.push(ayahNumber);
  } else if (!isMemorized) {
    ayahs = ayahs.filter((a: number) => a !== ayahNumber);
  }

  await setDoc(docRef, {
    surahNumber,
    surahName,
    ayahs,
    updatedAt: serverTimestamp()
  }, { merge: true });

  if (ayahs.length === totalAyahs) {
    await updateUserData(userId, { lastCompletedSurah: surahNumber });
  }
};

// --- ADMIN USERS ---

export const subscribeToAllUsers = (callback: (data: any[]) => void) => {
  if (!db) return () => {};
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    list.sort((a: any, b: any) => {
      const getVal = (item: any) => {
        const raw = item.lastActive || item.updatedAt || item.createdAt || 0;
        if (!raw) return 0;
        if (typeof raw === 'number') return raw;
        if (raw.seconds) return raw.seconds * 1000;
        if (typeof raw === 'string') return new Date(raw).getTime() || 0;
        if (raw instanceof Date) return raw.getTime();
        return 0;
      };
      return getVal(b) - getVal(a);
    });
    callback(list);
  }, (error) => {
    handleFirestoreError(error, 'list', 'users');
  });
};

export const updateUserStatus = async (userId: string, status: string) => {
  if (!db) return;
  await updateDoc(doc(db, 'users', userId), { status, updatedAt: serverTimestamp() });
};

// --- NETWORK ---

export const checkAndAttemptFirebaseNetworkReconnect = async (toastFn?: (msg: string, type?: any) => void) => {
  if (!db) return;
  try {
    await enableNetwork(db);
  } catch (e) {
    console.error("Firebase Network Reconnect Failed", e);
    if (toastFn) toastFn("Gagal menyambungkan database.", "error");
  }
};

// --- PREMIUM & TRANSACTIONS ---

export interface TransactionData {
  id?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  currency: string; // 'IDR' or 'WASILAH'
  type: 'topup' | 'subscription' | 'referral_bonus' | 'redemption';
  status: 'pending' | 'success' | 'failed';
  item: string;
  createdAt: any;
}

export const createTransaction = async (data: Omit<TransactionData, 'id' | 'createdAt'>) => {
  if (!db) return;
  let userName = data.userName || "Santri User";
  let userEmail = data.userEmail || "";
  try {
    const userDocRef = doc(db, 'users', data.userId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const uData = userSnap.data();
      userName = uData.displayName || userName;
      userEmail = uData.email || userEmail;
    }
  } catch (e) {
    console.error("Error fetching user stats for transaction details:", e);
  }

  try {
    return await addDoc(collection(db, 'transactions'), {
      ...data,
      userName,
      userEmail,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Failed to create transaction log:", error, data);
  }
};

export const subscribeToTransactions = (userId: string, callback: (data: TransactionData[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'transactions'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const rawData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransactionData));
    const sortedData = rawData.sort((a, b) => {
      const getMs = (val: any) => {
        if (!val) return Date.now();
        if (typeof val.toDate === 'function') return val.toDate().getTime();
        if (val.seconds) return val.seconds * 1000;
        if (val instanceof Date) return val.getTime();
        return new Date(val).getTime() || 0;
      };
      return getMs(b.createdAt) - getMs(a.createdAt);
    });
    callback(sortedData);
  }, (error) => {
    handleFirestoreError(error, 'list', 'transactions');
  });
};

export const subscribeToAllTransactions = (callback: (data: TransactionData[]) => void, onError?: (err: any) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'transactions'), limit(150));
  return onSnapshot(q, (snapshot) => {
    const rawData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransactionData));
    const sortedData = rawData.sort((a, b) => {
      const getMs = (val: any) => {
        if (!val) return Date.now();
        if (typeof val.toDate === 'function') return val.toDate().getTime();
        if (val.seconds) return val.seconds * 1000;
        if (val instanceof Date) return val.getTime();
        return new Date(val).getTime() || 0;
      };
      return getMs(b.createdAt) - getMs(a.createdAt);
    });
    callback(sortedData);
  }, (error) => {
    if (onError) onError(error);
  });
};

export const updatePremiumStatus = async (userId: string, isPremium: boolean, type?: 'monthly' | 'yearly' | 'lifetime') => {
  if (!db) return;
  const userRef = doc(db, 'users', userId);
  const now = new Date();
  let expiryDate: Date | null = null;

  if (isPremium && type) {
    expiryDate = new Date();
    if (type === 'monthly') expiryDate.setMonth(now.getMonth() + 1);
    else if (type === 'yearly') expiryDate.setFullYear(now.getFullYear() + 1);
    else if (type === 'lifetime') expiryDate.setFullYear(now.getFullYear() + 100);
  }

  return updateDoc(userRef, {
    isPremium,
    premiumUntil: expiryDate ? expiryDate.toISOString() : null,
    subscriptionType: type || null,
    updatedAt: serverTimestamp()
  });
};

export const adminUpdateUserData = async (userId: string, data: {
  wasilah?: number;
  points?: number;
  role?: 'user' | 'admin';
  status?: 'Active' | 'Banned';
  isVerified?: boolean;
  isPremium?: boolean;
  displayName?: string;
}) => {
  if (!db) return;
  const userRef = doc(db, 'users', userId);
  const updates: any = {
    updatedAt: serverTimestamp()
  };
  if (typeof data.wasilah === 'number') {
    const clampedWasilah = Math.max(0, Math.round(data.wasilah));
    updates.wasilah = clampedWasilah;
    updates.wasilahPoints = clampedWasilah;
  }
  if (typeof data.points === 'number') {
    updates.points = Math.max(0, Math.round(data.points));
  }
  if (data.role) updates.role = data.role;
  if (data.status) updates.status = data.status;
  if (typeof data.isVerified === 'boolean') updates.isVerified = data.isVerified;
  if (typeof data.isPremium === 'boolean') updates.isPremium = data.isPremium;
  if (data.displayName) updates.displayName = data.displayName;

  await updateDoc(userRef, updates);
};

export const buyPremiumWithWasilah = async (userId: string, wasilahCost: number, type: 'monthly' | 'yearly' | 'lifetime') => {
  if (!db) return;
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("Pengguna tidak ditemukan.");
  const currentWasilah = Number(snap.data()?.wasilah ?? snap.data()?.wasilahPoints ?? 0);
  if (currentWasilah < wasilahCost) {
    throw new Error(`Wasilah Anda tidak cukup (Sisa: ${currentWasilah}, Butuh: ${wasilahCost} Wasilah).`);
  }
  const remainingWasilah = Math.max(0, currentWasilah - wasilahCost);
  
  // Create transaction log
  await createTransaction({
    userId,
    amount: wasilahCost,
    currency: 'WASILAH',
    type: 'subscription',
    status: 'success',
    item: `Premium ${type} subscription`
  });

  // Deduct Wasilah safely (min 0)
  await updateDoc(userRef, {
    wasilah: remainingWasilah,
    wasilahPoints: remainingWasilah,
    updatedAt: serverTimestamp()
  });

  // Update status
  return updatePremiumStatus(userId, true, type);
};

export const deductWasilahForAI = async (userId: string, wasilahCost: number, aiFeatureName: string) => {
  if (!db) return;
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    throw new Error("Pengguna tidak ditemukan.");
  }
  const currentWasilah = Number(snap.data()?.wasilah ?? snap.data()?.wasilahPoints ?? 0);
  
  if (currentWasilah < wasilahCost) {
    throw new Error(`Poin Wasilah Anda tidak cukup (Sisa: ${currentWasilah}, Butuh: ${wasilahCost} Wasilah). Silakan main Game Islami atau Upgrade PRO untuk menambah Wasilah!`);
  }

  const remainingWasilah = Math.max(0, currentWasilah - wasilahCost);
  
  await createTransaction({
    userId,
    amount: wasilahCost,
    currency: "WASILAH",
    type: "subscription",
    status: "success",
    item: `AI - ${aiFeatureName}`
  });
  
  await updateDoc(userRef, {
    wasilah: remainingWasilah,
    wasilahPoints: remainingWasilah,
    updatedAt: serverTimestamp()
  });
};

export const topUpWasilah = async (userId: string, amountIdr: number, wasilahReceived: number) => {
  if (!db) return;
  const userRef = doc(db, 'users', userId);

  // In a real app, this would be triggered by a payment gateway callback.
  // For this app, we simulate success for demonstration.
  
  await createTransaction({
    userId,
    amount: amountIdr,
    currency: 'IDR',
    type: 'topup',
    status: 'success',
    item: `${wasilahReceived} Wasilah Top-up`
  });

  await updateDoc(userRef, {
    wasilah: increment(wasilahReceived),
    updatedAt: serverTimestamp()
  });

  // Notify user
  try {
    await createNotification(
      userId,
      'payment',
      'Top Up Berhasil',
      `Selamat! Pembayaran top-up sebesar **${wasilahReceived} Wasilah** telah sukses diterima. Terima kasih atas partisipasi Anda!`
    );
  } catch (err) {
    console.error("Error creating topup notification:", err);
  }
};

export const purchasePremiumPackageViaGooglePlay = async (
  userId: string, 
  packageId: string, 
  packageName: string, 
  priceIdr: number,
  wasilahReward: number = 0,
  xpReward: number = 0
) => {
  if (!db) return;
  const userRef = doc(db, 'users', userId);

  await createTransaction({
    userId,
    amount: priceIdr,
    currency: 'IDR',
    type: 'topup',
    status: 'success',
    item: `Google Play: ${packageName} (Sekali Beli)`
  });

  const updates: any = {
    isPremium: true,
    premiumPackageId: packageId,
    premiumPackageName: packageName,
    subscriptionType: 'lifetime',
    premiumUntil: null,
    updatedAt: serverTimestamp()
  };

  if (wasilahReward > 0) {
    updates.wasilah = increment(wasilahReward);
  }
  if (xpReward > 0) {
    updates.points = increment(xpReward);
  }

  await updateDoc(userRef, updates);

  // Notify user
  try {
    await createNotification(
      userId,
      'payment',
      'Pembelian Premium Sukses',
      `Selamat! Pembelian paket premium **${packageName}** telah berhasil diproses. Status akun Anda sekarang aktif sebagai **PREMIUM**.`
    );
  } catch (err) {
    console.error("Error creating premium purchase notification:", err);
  }
};

export const subscribeVerificationBadgeViaGooglePlay = async (
  userId: string, 
  badgeId: string, 
  badgeName: string, 
  priceIdr: number
) => {
  if (!db) return;
  const userRef = doc(db, 'users', userId);
  
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1);

  await createTransaction({
    userId,
    amount: priceIdr,
    currency: 'IDR',
    type: 'subscription',
    status: 'success',
    item: `Google Play: Langganan ${badgeName}`
  });

  await updateDoc(userRef, {
    verificationBadge: badgeId,
    activeBadges: arrayUnion(badgeId),
    badgeUntil: expiryDate.toISOString(),
    updatedAt: serverTimestamp()
  });

  // Notify user
  try {
    await createNotification(
      userId,
      'payment',
      'Langganan Lencana Berhasil',
      `Lencana verifikasi **${badgeName}** Anda telah aktif. Terima kasih atas kontribusi Anda mendukung pengembangan komunitas Santri!`
    );
  } catch (err) {
    console.error("Error creating badge subscription notification:", err);
  }
};

export const buyBadgeWithWasilah = async (
  userId: string, 
  badgeId: string, 
  badgeName: string, 
  wasilahCost: number
) => {
  if (!db) return;
  const userRef = doc(db, 'users', userId);
  
  // Fetch current user document to check current badge expiration
  const userSnap = await getDoc(userRef);
  let baseDate = new Date();
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    const currentBadgeUntil = data.badgeUntil || data.badgeExpiry;
    if (currentBadgeUntil) {
      const currentExpiry = new Date(currentBadgeUntil);
      if (currentExpiry > new Date()) {
        // If they already have an active badge, stack the new duration
        baseDate = currentExpiry;
      }
    }
  }
  
  const expiryDate = new Date(baseDate.getTime());
  expiryDate.setDate(expiryDate.getDate() + 30); // Extend by 30 days

  const currentWasilah = Number(userSnap.data()?.wasilah ?? userSnap.data()?.wasilahPoints ?? 0);
  if (currentWasilah < wasilahCost) {
    throw new Error(`Wasilah Anda tidak cukup (Sisa: ${currentWasilah}, Butuh: ${wasilahCost} Wasilah).`);
  }
  const remainingWasilah = Math.max(0, currentWasilah - wasilahCost);

  await createTransaction({
    userId,
    amount: wasilahCost,
    currency: 'WASILAH',
    type: 'subscription',
    status: 'success',
    item: `Tukar Wasilah: Langganan ${badgeName}`
  });

  await updateDoc(userRef, {
    verificationBadge: badgeId,
    activeBadges: arrayUnion(badgeId),
    badgeUntil: expiryDate.toISOString(),
    badgeExpiry: expiryDate.toISOString(),
    wasilah: remainingWasilah,
    wasilahPoints: remainingWasilah,
    updatedAt: serverTimestamp()
  });

  // Notify user
  try {
    await createNotification(
      userId,
      'payment',
      'Tukar Wasilah Berhasil',
      `Lencana verifikasi **${badgeName}** Anda telah aktif via penukaran **${wasilahCost} Wasilah** selama 30 hari. Terima kasih!`
    );
  } catch (err) {
    console.error("Error creating badge subscription notification:", err);
  }
};

export const topUpWasilahViaGooglePlay = async (
  userId: string, 
  pkgId: string, 
  amountWasilah: number, 
  priceIdr: number, 
  pkgLabel: string
) => {
  if (!db) return;
  const userRef = doc(db, 'users', userId);

  await createTransaction({
    userId,
    amount: priceIdr,
    currency: 'IDR',
    type: 'topup',
    status: 'success',
    item: `Google Play: ${amountWasilah} Wasilah (${pkgLabel})`
  });

  await updateDoc(userRef, {
    wasilah: increment(amountWasilah),
    updatedAt: serverTimestamp()
  });

  // Notify user
  try {
    await createNotification(
      userId,
      'payment',
      'Top Up Google Play Sukses',
      `Top-up sebesar **${amountWasilah} Wasilah** via Google Play Billing berhasil diproses ke akun Anda.`
    );
  } catch (err) {
    console.error("Error creating google play topup notification:", err);
  }
};

// --- COMMUNITY / SILATURAHMI ---

export interface CommunityPost {
  id?: string;
  userId: string;
  userName: string;
  userPhoto: string;
  userRole: string;
  userPoints?: number;
  avatarFrame?: string;
  verificationBadge?: string;
  content: string;
  type: 'status' | 'tanya';
  categories?: string[];
  likes: string[]; // List of user IDs
  commentCount: number;
  createdAt: any;
}

export interface CommunityComment {
  id?: string;
  userId: string;
  userName: string;
  userPhoto: string;
  userPoints?: number;
  avatarFrame?: string;
  verificationBadge?: string;
  content: string;
  createdAt: any;
}

export interface PrayerRequest {
  id?: string;
  userId: string;
  userName: string;
  userPhoto: string;
  userPoints?: number;
  avatarFrame?: string;
  verificationBadge?: string;
  category: 'death' | 'circumcision' | 'calamity' | 'marriage' | 'offspring' | 'birth' | 'partner' | 'new_home' | 'thanksgiving' | 'other';
  title: string;
  description: string;
  aiPrayerContent: string;
  targetPrayers: number;
  currentPrayers: number;
  rewardAmount: number;
  costAmount: number;
  likes: string[];
  commentCount: number;
  prayers: string[]; // List of user IDs who prayed
  status: 'active' | 'completed';
  createdAt: any;
}

export interface WorshipLog {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completed: Record<string, boolean>;
  updatedAt: any;
}

export const updateWorshipLog = async (userId: string, date: string, worshipId: string, value: boolean) => {
  if (!db) return;
  const logRef = doc(db, 'users', userId, 'worship_logs', date);
  try {
    const logDoc = await getDoc(logRef);
    if (!logDoc.exists()) {
      await setDoc(logRef, {
        userId,
        date,
        completed: { [worshipId]: value },
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(logRef, {
        [`completed.${worshipId}`]: value,
        updatedAt: serverTimestamp()
      });
    }
  } catch (e) {
    handleFirestoreError(e, 'update', `users/${userId}/worship_logs/${date}`);
    throw e;
  }
};

export const subscribeToWorshipLog = (userId: string, date: string, callback: (data: WorshipLog | null) => void) => {
  if (!db) return () => {};
  const logRef = doc(db, 'users', userId, 'worship_logs', date);
  return onSnapshot(logRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as WorshipLog);
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, 'get', `users/${userId}/worship_logs/${date}`);
  });
};

export const createPrayerRequest = async (user: User, data: Omit<PrayerRequest, 'id' | 'userId' | 'userName' | 'userPhoto' | 'currentPrayers' | 'likes' | 'commentCount' | 'prayers' | 'status' | 'createdAt'>, userData: any) => {
  if (!db) return;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("Pengguna tidak ditemukan.");
  const currentWasilah = Number(snap.data()?.wasilah ?? snap.data()?.wasilahPoints ?? 0);
  const cost = Number(data.costAmount || 0);
  if (currentWasilah < cost) {
    throw new Error(`Wasilah Anda tidak cukup (Sisa: ${currentWasilah}, Butuh: ${cost} Wasilah).`);
  }
  const remainingWasilah = Math.max(0, currentWasilah - cost);
  
  // Deduct Wasilah safely
  await updateDoc(userRef, {
    wasilah: remainingWasilah,
    wasilahPoints: remainingWasilah,
    updatedAt: serverTimestamp()
  });

  // Create Transaction
  await createTransaction({
    userId: user.uid,
    amount: data.costAmount,
    currency: 'WASILAH',
    type: 'subscription', // Reusing subscription for paid features
    status: 'success',
    item: `Minta Doa: ${data.title}`
  });

  // Add Prayer Request
  return addDoc(collection(db, 'prayer_requests'), {
    userId: user.uid,
    userName: userData?.displayName || user.displayName || 'Santri',
    userPhoto: userData?.avatarUrl || userData?.photoURL || user.photoURL || '',
    userPoints: userData?.points || 0,
    avatarFrame: userData?.avatarFrame || 'none',
    verificationBadge: userData?.verificationBadge || 'none',
    ...data,
    currentPrayers: 0,
    likes: [],
    commentCount: 0,
    prayers: [],
    status: 'active',
    createdAt: serverTimestamp()
  });
};

export const subscribeToPrayerRequests = (callback: (data: PrayerRequest[]) => void, onError?: (error: any) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'prayer_requests'), orderBy('createdAt', 'desc'), limit(30));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrayerRequest)));
  }, (error) => {
    if (onError) onError(error);
    handleFirestoreError(error, 'list', 'prayer_requests');
  });
};

export const prayForRequest = async (requestId: string, userId: string, userName: string, reward: number) => {
  if (!db) return;
  const requestRef = doc(db, 'prayer_requests', requestId);
  const userRef = doc(db, 'users', userId);

  const requestSnap = await getDoc(requestRef);
  if (!requestSnap.exists()) return;
  
  const requestData = requestSnap.data() as PrayerRequest;
  if (requestData.prayers.includes(userId)) throw new Error("Anda sudah mendoakan request ini.");
  if (requestData.currentPrayers >= requestData.targetPrayers) throw new Error("Slot doa sudah penuh.");

  // Update Request
  const newCount = requestData.currentPrayers + 1;
  await updateDoc(requestRef, {
    currentPrayers: increment(1),
    prayers: arrayUnion(userId),
    status: newCount >= requestData.targetPrayers ? 'completed' : 'active'
  });

  // Award Wasilah to user
  await updateDoc(userRef, {
    wasilah: increment(reward)
  });

  // Create Transaction for user
  return createTransaction({
    userId,
    amount: reward,
    currency: 'WASILAH',
    type: 'topup', // Earning is like a topup
    status: 'success',
    item: `Reward mendoakan: ${requestData.title}`
  });
};

export const togglePrayerLike = async (requestId: string, userId: string, isLiked: boolean) => {
  if (!db) return;
  const ref = doc(db, 'prayer_requests', requestId);
  return updateDoc(ref, {
    likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
  });
};

export const addPrayerComment = async (requestId: string, user: User, content: string, userData: any) => {
  if (!db) return;
  const ref = doc(db, 'prayer_requests', requestId);
  
  await addDoc(collection(db, 'prayer_requests', requestId, 'comments'), {
    userId: user.uid,
    userName: userData?.displayName || user.displayName || 'Santri',
    userPhoto: userData?.avatarUrl || userData?.photoURL || user.photoURL || '',
    userPoints: userData?.points || 0,
    avatarFrame: userData?.avatarFrame || 'none',
    verificationBadge: userData?.verificationBadge || 'none',
    content,
    createdAt: serverTimestamp()
  });

  await updateDoc(ref, {
    commentCount: increment(1)
  });

  // Send real-time notification to prayer request author
  try {
    const requestSnap = await getDoc(ref);
    if (requestSnap.exists()) {
      const requestData = requestSnap.data();
      if (requestData.userId && requestData.userId !== user.uid) {
        const commenterName = userData?.displayName || user.displayName || 'Santri';
        await createNotification(
          requestData.userId,
          'comment',
          'Komentar Doa Baru',
          `**${commenterName}** mengomentari permohonan doa Anda: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
          {
            senderId: user.uid,
            senderName: commenterName,
            senderPhoto: userData?.avatarUrl || userData?.photoURL || user.photoURL || '',
            targetId: requestId
          }
        );
      }
    }
  } catch (err) {
    console.error("Error triggering prayer comment notification:", err);
  }
};

export const subscribeToPrayerComments = (requestId: string, callback: (data: CommunityComment[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'prayer_requests', requestId, 'comments'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityComment)));
  }, (error) => {
    handleFirestoreError(error, 'list', `prayer_requests/${requestId}/comments`);
  });
};

export const createCommunityPost = async (user: User, content: string, type: 'status' | 'tanya', userData: any, categories?: string[]) => {
  if (!db) return;
  return addDoc(collection(db, 'posts'), {
    userId: user.uid,
    userName: userData?.displayName || user.displayName || 'Santri',
    userPhoto: userData?.avatarUrl || userData?.photoURL || user.photoURL || '',
    userRole: userData?.role || 'user',
    userPoints: userData?.points || 0,
    avatarFrame: userData?.avatarFrame || 'none',
    verificationBadge: userData?.verificationBadge || 'none',
    content,
    type,
    categories: categories || [],
    likes: [],
    commentCount: 0,
    createdAt: serverTimestamp()
  });
};

export const subscribeToCommunityPosts = (callback: (data: CommunityPost[]) => void, onError?: (error: any) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityPost)));
  }, (error) => {
    if (onError) onError(error);
    handleFirestoreError(error, 'list', 'posts');
  });
};

export const togglePostLike = async (postId: string, userId: string, isLiked: boolean) => {
  if (!db) return;
  const ref = doc(db, 'posts', postId);
  return updateDoc(ref, {
    likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
  });
};

export const addCommunityComment = async (postId: string, user: User, content: string, userData: any) => {
  if (!db) return;
  const postRef = doc(db, 'posts', postId);
  
  // Add comment
  await addDoc(collection(db, 'posts', postId, 'comments'), {
    userId: user.uid,
    userName: userData?.displayName || user.displayName || 'Santri',
    userPhoto: userData?.avatarUrl || userData?.photoURL || user.photoURL || '',
    userPoints: userData?.points || 0,
    avatarFrame: userData?.avatarFrame || 'none',
    verificationBadge: userData?.verificationBadge || 'none',
    content,
    createdAt: serverTimestamp()
  });

  // Increment comment count
  await updateDoc(postRef, {
    commentCount: increment(1)
  });

  // Send real-time notification to post author
  try {
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data();
      if (postData.userId && postData.userId !== user.uid) {
        const commenterName = userData?.displayName || user.displayName || 'Santri';
        await createNotification(
          postData.userId,
          'comment',
          'Komentar Baru',
          `**${commenterName}** mengomentari kiriman Anda: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
          {
            senderId: user.uid,
            senderName: commenterName,
            senderPhoto: userData?.avatarUrl || userData?.photoURL || user.photoURL || '',
            targetId: postId
          }
        );
      }
    }
  } catch (err) {
    console.error("Error triggering comment notification:", err);
  }
};

export const subscribeToPostComments = (postId: string, callback: (data: CommunityComment[]) => void, onError?: (error: any) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityComment)));
  }, (error) => {
    if (onError) onError(error);
    handleFirestoreError(error, 'list', `posts/${postId}/comments`);
  });
};

export const deleteCommunityComment = async (postId: string, commentId: string) => {
  if (!db) return;
  const postRef = doc(db, 'posts', postId);
  const commentRef = doc(db, 'posts', postId, 'comments', commentId);
  await deleteDoc(commentRef);
  await updateDoc(postRef, {
    commentCount: increment(-1)
  });
};

export const updateCommunityComment = async (postId: string, commentId: string, content: string) => {
  if (!db) return;
  const commentRef = doc(db, 'posts', postId, 'comments', commentId);
  await updateDoc(commentRef, {
    content,
    updatedAt: serverTimestamp()
  });
};

export const deletePrayerComment = async (requestId: string, commentId: string) => {
  if (!db) return;
  const reqRef = doc(db, 'prayer_requests', requestId);
  const commentRef = doc(db, 'prayer_requests', requestId, 'comments', commentId);
  await deleteDoc(commentRef);
  await updateDoc(reqRef, {
    commentCount: increment(-1)
  });
};

export const updatePrayerComment = async (requestId: string, commentId: string, content: string) => {
  if (!db) return;
  const commentRef = doc(db, 'prayer_requests', requestId, 'comments', commentId);
  await updateDoc(commentRef, {
    content,
    updatedAt: serverTimestamp()
  });
};

export const deleteCommunityPost = async (postId: string) => {
  if (!db) return;
  return deleteDoc(doc(db, 'posts', postId));
};

export const updateCommunityPost = async (postId: string, content: string, categories?: string[]) => {
  if (!db) return;
  const updates: any = {
    content,
    updatedAt: serverTimestamp()
  };
  if (categories) {
    updates.categories = categories;
  }
  return updateDoc(doc(db, 'posts', postId), updates);
};

// --- FOLLOW SYSTEM (Fitur Ikuti) ---
export const followUser = async (followerId: string, followedId: string) => {
  if (!db) return;
  const followRef = doc(db, 'follows', `${followerId}_${followedId}`);
  try {
    await setDoc(followRef, {
      followerId,
      followedId,
      createdAt: serverTimestamp()
    });

    // Notify followed user about new follower
    try {
      const followerSnap = await getDoc(doc(db, 'users', followerId));
      let followerName = 'Sesama Santri';
      let followerPhoto = '';
      if (followerSnap.exists()) {
        const followerData = followerSnap.data();
        followerName = followerData.displayName || followerName;
        followerPhoto = followerData.photoURL || followerData.avatarUrl || '';
      }
      await createNotification(
        followedId,
        'follow',
        'Pengikut Baru',
        `**${followerName}** sekarang mengikuti Anda.`,
        {
          senderId: followerId,
          senderName: followerName,
          senderPhoto: followerPhoto
        }
      );
    } catch (err) {
      console.error("Error creating follow notification:", err);
    }
  } catch (error) {
    handleFirestoreError(error, 'create', `follows/${followerId}_${followedId}`);
    throw error;
  }
};

export const unfollowUser = async (followerId: string, followedId: string) => {
  if (!db) return;
  const followRef = doc(db, 'follows', `${followerId}_${followedId}`);
  try {
    await deleteDoc(followRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', `follows/${followerId}_${followedId}`);
    throw error;
  }
};

export const subscribeToFollowing = (followerId: string, callback: (followedList: string[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'follows'), where('followerId', '==', followerId));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data().followedId || '');
    callback(list);
  }, (error) => {
    handleFirestoreError(error, 'list', 'follows');
  });
};

export const subscribeToFollowers = (followedId: string, callback: (followersList: string[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'follows'), where('followedId', '==', followedId));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => doc.data().followerId || '');
    callback(list);
  }, (error) => {
    handleFirestoreError(error, 'list', 'follows');
  });
};

// --- GIFTING SYSTEM (Fitur Kirim Hadiah) ---
export interface PostGift {
  id?: string;
  senderId: string;
  senderName: string;
  giftId: string;
  giftName: string;
  giftIcon: string;
  giftPrice: number;
  giftXp?: number;
  message?: string;
  createdAt: any;
}

export const sendGiftToPost = async (
  postId: string,
  postAuthorId: string,
  postAuthorName: string,
  senderId: string,
  senderName: string,
  giftId: string,
  giftName: string,
  giftIcon: string,
  giftPrice: number,
  giftXp: number = 0,
  message: string = '',
  senderUserData: any = null
) => {
  if (!db) return;
  const senderRef = doc(db, 'users', senderId);
  const recipientRef = doc(db, 'users', postAuthorId);
  const postRef = doc(db, 'posts', postId);

  // Check sender balance
  const senderSnap = await getDoc(senderRef);
  if (!senderSnap.exists()) throw new Error("Pengirim tidak ditemukan.");
  const senderWasilah = senderSnap.data().wasilah || 0;
  if (senderWasilah < giftPrice) {
    throw new Error("Saldo Wasilah tidak cukup untuk mendonasikan kado ini.");
  }

  // Deduct from sender and award XP/points safely (min 0)
  const newSenderWasilah = Math.max(0, senderWasilah - giftPrice);
  await updateDoc(senderRef, {
    wasilah: newSenderWasilah,
    wasilahPoints: newSenderWasilah,
    points: increment(giftXp),
    updatedAt: serverTimestamp()
  });

  // Pay recipient
  await updateDoc(recipientRef, {
    wasilah: increment(giftPrice),
    wasilahPoints: increment(giftPrice),
    updatedAt: serverTimestamp()
  });

  const trimmedMessage = (message || '').trim();

  // Save gift log in post's subcollection
  await addDoc(collection(db, 'posts', postId, 'gifts'), {
    senderId,
    senderName,
    giftId,
    giftName,
    giftIcon,
    giftPrice,
    giftXp,
    message: trimmedMessage,
    createdAt: serverTimestamp()
  });

  // Automatically insert comment for the gift on the post
  try {
    const commentContent = trimmedMessage
      ? `🎁 Mengirimkan kado ${giftName} ${giftIcon} (+${giftPrice} Wasilah)\n"${trimmedMessage}"`
      : `🎁 Mengirimkan kado ${giftName} ${giftIcon} (+${giftPrice} Wasilah)`;

    const senderPhoto = senderUserData?.avatarUrl || senderUserData?.photoURL || '';
    const senderPoints = senderUserData?.points || 0;
    const avatarFrame = senderUserData?.avatarFrame || 'none';
    const verificationBadge = senderUserData?.verificationBadge || 'none';

    await addDoc(collection(db, 'posts', postId, 'comments'), {
      userId: senderId,
      userName: senderName,
      userPhoto: senderPhoto,
      userPoints: senderPoints,
      avatarFrame,
      verificationBadge,
      content: commentContent,
      createdAt: serverTimestamp()
    });

    await updateDoc(postRef, {
      commentCount: increment(1)
    });
  } catch (commentErr) {
    console.error("Error adding automatic gift comment:", commentErr);
  }

  // Record transactions
  await createTransaction({
    userId: senderId,
    amount: giftPrice,
    currency: 'Wasilah',
    type: 'redemption',
    status: 'success',
    item: `Kirim Hadiah ${giftName} ke ${postAuthorName} (+${giftXp} XP)`
  });

  await createTransaction({
    userId: postAuthorId,
    amount: giftPrice,
    currency: 'Wasilah',
    type: 'topup',
    status: 'success',
    item: `Menerima Hadiah ${giftName} dari ${senderName}`
  });

  // Notify recipient about the gift
  try {
    const notifBody = trimmedMessage
      ? `**${senderName}** mengirimi Anda hadiah **${giftName}** ${giftIcon} (+${giftPrice} Wasilah):\n"${trimmedMessage}"`
      : `**${senderName}** mengirimi Anda hadiah **${giftName}** ${giftIcon} (+${giftPrice} Wasilah).`;

    await createNotification(
      postAuthorId,
      'gift',
      'Menerima Hadiah',
      notifBody,
      {
        senderId,
        senderName,
        targetId: postId
      }
    );
  } catch (err) {
    console.error("Error creating gift notification:", err);
  }
};

export const subscribeToPostGifts = (postId: string, callback: (gifts: PostGift[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'posts', postId, 'gifts'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostGift)));
  }, (error) => {
    handleFirestoreError(error, 'list', `posts/${postId}/gifts`);
  });
};

// --- POST REPORTS (Laporan Postingan) ---

export interface PostReport {
  id?: string;
  postId: string;
  postContent: string;
  postUserId: string;
  postUserName: string;
  reportedById: string;
  reportedByName: string;
  reason: string;
  createdAt: any;
  status: 'Pending' | 'Actioned' | 'Ignored';
}

export const createPostReport = async (report: Omit<PostReport, 'createdAt' | 'status'>) => {
  if (!db) return;
  return addDoc(collection(db, 'post_reports'), {
    ...report,
    status: 'Pending',
    createdAt: serverTimestamp()
  });
};

export const subscribeToPostReports = (callback: (data: PostReport[]) => void, onError?: (err: any) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'post_reports'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostReport)));
  }, (error) => {
    if (onError) onError(error);
    handleFirestoreError(error, 'list', 'post_reports');
  });
};

export const updatePostReportStatus = async (reportId: string, status: 'Pending' | 'Actioned' | 'Ignored') => {
  if (!db) return;
  return updateDoc(doc(db, 'post_reports', reportId), { status });
};

// --- GENERAL CONTENT & FEATURE REPORTS (Laporan Fitur / Konten) ---

export interface AppContentReport {
  id?: string;
  featureName: string;
  contentSnippet?: string;
  reason: string;
  details?: string;
  reportedById: string;
  reportedByName: string;
  reportedByEmail?: string;
  createdAt: any;
  status: 'Pending' | 'Actioned' | 'Ignored';
}

export const createAppContentReport = async (report: Omit<AppContentReport, 'createdAt' | 'status'>) => {
  if (!db) return;
  return addDoc(collection(db, 'content_reports'), {
    ...report,
    status: 'Pending',
    createdAt: serverTimestamp()
  });
};

export const subscribeToContentReports = (callback: (data: AppContentReport[]) => void, onError?: (err: any) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'content_reports'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppContentReport)));
  }, (error) => {
    if (onError) onError(error);
    handleFirestoreError(error, 'list', 'content_reports');
  });
};

export const updateContentReportStatus = async (reportId: string, status: 'Pending' | 'Actioned' | 'Ignored') => {
  if (!db) return;
  return updateDoc(doc(db, 'content_reports', reportId), { status });
};

export const deleteContentReport = async (reportId: string) => {
  if (!db) return;
  return deleteDoc(doc(db, 'content_reports', reportId));
};

// --- KHATAM TRACKER ---

export const updateKhatamProgress = async (userId: string, type: 'surah' | 'juz', id: number, value: boolean) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'khatam', type);
  try {
    if (value) {
      await setDoc(docRef, {
        completed: arrayUnion(id),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } else {
      await setDoc(docRef, {
        completed: arrayRemove(id),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (e) {
    handleFirestoreError(e, 'update', `users/${userId}/khatam/${type}`);
  }
};

export const subscribeToKhatam = (userId: string, type: 'surah' | 'juz', callback: (data: number[]) => void) => {
  if (!db) return () => {};
  return onSnapshot(doc(db, 'users', userId, 'khatam', type), (doc) => {
    if (doc.exists()) {
      callback(doc.data().completed || []);
    } else {
      callback([]);
    }
  }, (error) => {
      handleFirestoreError(error, 'get', `users/${userId}/khatam/${type}`);
  });
};

// --- MENSTRUAL & NIFAS LOGS ---

export interface MenstrualLog {
  id?: string;
  userId: string;
  type: 'haid' | 'nifas';
  startDate: string;
  endDate: string;
  duration: number;
  status: string;
  category: string;
  createdAt: any;
}

export const saveMenstrualLog = async (userId: string, data: Omit<MenstrualLog, 'id' | 'userId' | 'createdAt'>) => {
  if (!db) return;
  return addDoc(collection(db, 'users', userId, 'menstrual_logs'), {
    ...data,
    userId,
    createdAt: serverTimestamp()
  });
};

export const deleteMenstrualLog = async (userId: string, logId: string) => {
  if (!db) return;
  return deleteDoc(doc(db, 'users', userId, 'menstrual_logs', logId));
};

export const subscribeToMenstrualLogs = (userId: string, callback: (data: MenstrualLog[]) => void, onError?: (err: any) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'users', userId, 'menstrual_logs'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenstrualLog)));
  }, (error) => {
    console.error(`Error subscribing to menstrual logs of ${userId}:`, error);
    if (onError) onError(error);
    try {
      handleFirestoreError(error, 'list', `users/${userId}/menstrual_logs`);
    } catch (e) {
      callback([]);
      throw e;
    }
  });
};

// --- SUPPORT CHAT SERVICES ---

export interface SupportChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  content: string;
  imageUrl?: string;
  timestamp: any;
}

export interface SupportChat {
  id?: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  lastMessage?: string;
  lastMessageTime?: any;
  lastSenderId?: string;
  createdAt: any;
}

export const subscribeToSupportMessages = (userId: string, callback: (data: SupportChatMessage[]) => void, onError?: (err: any) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'support_chats', userId, 'messages'), orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportChatMessage)));
  }, (error) => {
    console.error("Error subscribing to support messages:", error);
    if (onError) onError(error);
    try {
      handleFirestoreError(error, 'list', `support_chats/${userId}/messages`);
    } catch (e) {
      callback([]);
      throw e;
    }
  });
};

export const sendSupportMessage = async (
  userId: string, 
  senderId: string, 
  senderName: string, 
  content: string, 
  userDetails?: { name: string; photo?: string },
  imageUrl?: string
) => {
  if (!db) return;
  
  const trimmedContent = content ? content.trim() : '';
  const previewText = trimmedContent ? trimmedContent : (imageUrl ? '📷 [Gambar]' : '');

  // 1. Send the message first
  await addDoc(collection(db, 'support_chats', userId, 'messages'), {
    senderId,
    senderName,
    content: trimmedContent,
    imageUrl: imageUrl || '',
    timestamp: serverTimestamp()
  });

  // 2. Set/update the support chat room state
  const chatRef = doc(db, 'support_chats', userId);
  const chatSnap = await getDoc(chatRef);
  
  if (!chatSnap.exists()) {
    // Brand new chat thread
    await setDoc(chatRef, {
      userId,
      userName: userDetails?.name || senderName,
      userPhoto: userDetails?.photo || '',
      lastMessage: previewText,
      lastMessageTime: serverTimestamp(),
      lastSenderId: senderId,
      createdAt: serverTimestamp()
    });
  } else {
    // Existing chat, only update message details to keep original createdAt safe
    await updateDoc(chatRef, {
      lastMessage: previewText,
      lastMessageTime: serverTimestamp(),
      lastSenderId: senderId
    });
  }

  // 3. Trigger notification to the user if sender is Admin (or not the user)
  if (senderId !== userId) {
    try {
      const notifBody = imageUrl && !trimmedContent 
        ? '**Admin Hub Al-Wasilah**: Mengirimkan gambar'
        : `**Admin Hub Al-Wasilah**: "${trimmedContent.substring(0, 70)}${trimmedContent.length > 70 ? '...' : ''}"`;

      await createNotification(
        userId,
        'chat',
        'Pesan Baru dari Admin',
        notifBody,
        {
          senderId: 'admin',
          senderName: 'Admin Hub Al-Wasilah',
          targetId: 'chat_admin'
        }
      );
    } catch (err) {
      console.error("Error creating chat notification for user:", err);
    }
  }
};

export const subscribeToAllSupportChats = (callback: (data: SupportChat[]) => void, onError?: (err: any) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'support_chats'), orderBy('lastMessageTime', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportChat)));
  }, (error) => {
    console.error("Error subscribing to all support chats:", error);
    if (onError) onError(error);
    try {
      handleFirestoreError(error, 'list', 'support_chats');
    } catch (e) {
      callback([]);
      throw e;
    }
  });
};

export interface DonationRecord {
  id?: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  avatarFrame?: string;
  points?: number;
  verificationBadge?: string;
  productId: string;
  label: string;
  amount: string;
  value: number;
  paymentMethod: string;
  message?: string;
  campaignId?: string;
  campaignTitle?: string;
  likes?: number;
  status: 'Pending' | 'Completed' | 'Failed';
  createdAt: any;
}

export interface CampaignStat {
  campaignId: string;
  currentAmount: number;
  donorsCount: number;
  updatedAt?: any;
}

export const addDonationRecord = async (
  userId: string | null,
  userName: string,
  userEmail: string,
  productId: string,
  label: string,
  amount: string,
  value: number,
  paymentMethod: string = 'Google Play Billing',
  message?: string,
  campaignId?: string,
  campaignTitle?: string,
  userPhoto?: string,
  avatarFrame?: string,
  points?: number,
  verificationBadge?: string
) => {
  if (!db) return null;
  try {
    const docRef = await addDoc(collection(db, 'donations'), {
      userId,
      userName: userName || 'Hamba Allah',
      userEmail: userEmail || 'anonim@santrimodern.com',
      userPhoto: userPhoto || '',
      avatarFrame: avatarFrame || 'none',
      points: points || 0,
      verificationBadge: verificationBadge || 'none',
      productId,
      label,
      amount,
      value,
      paymentMethod,
      message: message || '',
      campaignId: campaignId || 'ai_research',
      campaignTitle: campaignTitle || '',
      likes: 1,
      status: 'Completed',
      createdAt: serverTimestamp()
    });

    // Update real-time cumulative campaign stats in Firestore
    if (campaignId) {
      const statRef = doc(db, 'campaign_stats', campaignId);
      // For Wasilah, 1 Wasilah = Rp 10 contribution value
      const addedContribution = paymentMethod === 'Koin Wasilah' ? (value * 10) : value;
      await setDoc(statRef, {
        campaignId,
        currentAmount: increment(addedContribution),
        donorsCount: increment(1),
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    return docRef;
  } catch (error) {
    console.error("Error adding donation record:", error);
    try {
      handleFirestoreError(error, 'write', 'donations');
    } catch (e) {
      throw e;
    }
    return null;
  }
};

export const likeDonationPrayer = async (donationId: string, diff: number = 1) => {
  if (!db || !donationId) return;
  try {
    const donRef = doc(db, 'donations', donationId);
    await updateDoc(donRef, {
      likes: increment(diff)
    });
  } catch (error) {
    console.error("Error liking donation prayer:", error);
  }
};

export const subscribeToCampaignStats = (callback: (data: Record<string, { currentAmount: number; donorsCount: number }>) => void) => {
  if (!db) return () => {};
  const statsCol = collection(db, 'campaign_stats');
  return onSnapshot(statsCol, (snapshot) => {
    const map: Record<string, { currentAmount: number; donorsCount: number }> = {};
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      map[docSnap.id] = {
        currentAmount: data.currentAmount || 0,
        donorsCount: data.donorsCount || 0
      };
    });
    callback(map);
  }, (error) => {
    console.error("Error subscribing to campaign stats:", error);
    callback({});
  });
};

export const subscribeToDonations = (callback: (data: DonationRecord[]) => void, onError?: (err: any) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, 'donations'), orderBy('createdAt', 'desc'), limit(30));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DonationRecord)));
  }, (error) => {
    console.error("Error subscribing to donations:", error);
    if (onError) onError(error);
    try {
      handleFirestoreError(error, 'list', 'donations');
    } catch (e) {
      callback([]);
      throw e;
    }
  });
};

// --- APP UPDATE CONFIG COUPLING ---

export interface AppUpdateConfig {
  showUpdatePopup: boolean;
  updateTitle: string;
  updateMessage: string;
  playStoreUrl: string;
  isOptional: boolean;
  updatedAt?: any;
}

export const subscribeToUpdateConfig = (callback: (config: AppUpdateConfig | null) => void) => {
  if (!db) {
    callback(null);
    return () => {};
  }
  return onSnapshot(doc(db, 'app_config', 'update_config'), (doc) => {
    callback(doc.exists() ? (doc.data() as AppUpdateConfig) : null);
  }, (error) => {
    console.error("Error subscribing to update config:", error);
    callback(null);
  });
};

export const updateUpdateConfig = async (config: AppUpdateConfig) => {
  if (!db) return;
  const docRef = doc(db, 'app_config', 'update_config');
  await setDoc(docRef, {
    ...config,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export interface NewsCategoriesConfig {
  categories: string[];
  updatedAt?: any;
}

export const subscribeToNewsCategories = (callback: (config: NewsCategoriesConfig | null) => void) => {
  if (!db) {
    callback(null);
    return () => {};
  }
  return onSnapshot(doc(db, 'app_config', 'news_categories'), (doc) => {
    callback(doc.exists() ? (doc.data() as NewsCategoriesConfig) : null);
  }, (error) => {
    console.error("Error subscribing to news categories config:", error);
    callback(null);
  });
};

export const updateNewsCategories = async (categories: string[]) => {
  if (!db) return;
  const docRef = doc(db, 'app_config', 'news_categories');
  await setDoc(docRef, {
    categories,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export interface AdPopupConfig {
  showAdPopup: boolean;
  adTitle: string;
  adMessage: string;
  imageUrl?: string;
  actionText?: string;
  actionUrl?: string;
  badgeTag?: string;
  isDismissible?: boolean;
  updatedAt?: any;
}

export const subscribeToAdPopupConfig = (callback: (config: AdPopupConfig | null) => void) => {
  if (!db) {
    callback(null);
    return () => {};
  }
  return onSnapshot(doc(db, 'app_config', 'ad_popup_config'), (doc) => {
    callback(doc.exists() ? (doc.data() as AdPopupConfig) : null);
  }, (error) => {
    console.error("Error subscribing to ad popup config:", error);
    callback(null);
  });
};

export const updateAdPopupConfig = async (config: AdPopupConfig) => {
  if (!db) return;
  const docRef = doc(db, 'app_config', 'ad_popup_config');
  await setDoc(docRef, {
    ...config,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

// --- REALTIME NOTIFICATIONS ---

export interface RealtimeNotification {
  id?: string;
  userId: string; // recipient
  senderId?: string;
  senderName?: string;
  senderPhoto?: string;
  type: 'comment' | 'referral' | 'payment' | 'follow' | 'admin' | 'gift' | string;
  title: string;
  message: string;
  isRead: boolean;
  targetId?: string;
  createdAt: any;
}

export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  extraData: { senderId?: string; senderName?: string; senderPhoto?: string; targetId?: string } = {}
) => {
  if (!db) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title,
      message,
      isRead: false,
      senderId: extraData.senderId || '',
      senderName: extraData.senderName || '',
      senderPhoto: extraData.senderPhoto || '',
      targetId: extraData.targetId || '',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, 'create', 'notifications');
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  if (!db) return;
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, 'update', `notifications/${notificationId}`);
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  if (!db) return;
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, 'update', 'notifications');
  }
};

export const deleteNotification = async (notificationId: string) => {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    handleFirestoreError(error, 'delete', `notifications/${notificationId}`);
  }
};

export const subscribeToNotifications = (userId: string, callback: (data: RealtimeNotification[]) => void) => {
  if (!db || !userId) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RealtimeNotification));
    // Sort client-side by createdAt desc
    list.sort((a, b) => {
      const getMs = (val: any) => {
        if (!val) return 0;
        if (typeof val.toDate === 'function') return val.toDate().getTime();
        if (val.seconds) return val.seconds * 1000;
        if (val instanceof Date) return val.getTime();
        return new Date(val).getTime() || 0;
      };
      return getMs(b.createdAt) - getMs(a.createdAt);
    });
    callback(list);
  }, (error) => {
    console.error("Error in subscribeToNotifications:", error);
    callback([]);
    try {
      handleFirestoreError(error, 'list', 'notifications');
    } catch (e) {
      // ignore
    }
  });
};

// --- PRESENCE / ONLINE SYSTEM ---

export const setUserOnlineStatus = async (userId: string, isOnline: boolean) => {
  if (!db) return;
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, {
      isOnline,
      lastActive: serverTimestamp()
    });
  } catch (e) {
    try {
      await setDoc(userRef, {
        isOnline,
        lastActive: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Error setting user online status:", err);
    }
  }
};

export const subscribeToOnlineUsersCount = (callback: (count: number) => void) => {
  if (!db) {
    callback(1);
    return () => {};
  }
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const nowMs = Date.now();
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
    const onlineCount = snapshot.docs.filter((doc) => {
      const data = doc.data();
      // Jika user bertanda isOnline === false, anggap offline
      if (data.isOnline === false) return false;
      if (!data.lastActive) return Boolean(data.isOnline);
      const lastActiveMs = data.lastActive.toDate ? data.lastActive.toDate().getTime() : new Date(data.lastActive).getTime();
      // Tampilkan online jika aktivitas terakhir kurang dari 3 jam lalu
      return (nowMs - lastActiveMs < THREE_HOURS_MS);
    }).length;
    const count = onlineCount > 0 ? onlineCount : 1;
    callback(Number(`1${count}`));
  }, (error) => {
    console.error("Error subscribing to online users:", error);
    callback(1);
  });
};

// --- KHATAM LAST AYAH SAVER ---

export const updateKhatamLastAyah = async (userId: string, type: 'surah' | 'juz', id: number, ayahIndex: number) => {
  if (!db) return;
  const docRef = doc(db, 'users', userId, 'khatam_last_ayah', `${type}_${id}`);
  try {
    await setDoc(docRef, {
      type,
      id,
      ayahIndex,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    handleFirestoreError(e, 'update', `users/${userId}/khatam_last_ayah/${type}_${id}`);
  }
};

export const subscribeToKhatamLastAyah = (userId: string, type: 'surah' | 'juz', id: number, callback: (ayahIndex: number) => void) => {
  if (!db) return () => {};
  return onSnapshot(doc(db, 'users', userId, 'khatam_last_ayah', `${type}_${id}`), (doc) => {
    if (doc.exists()) {
      callback(doc.data().ayahIndex || 0);
    } else {
      callback(0);
    }
  }, (error) => {
      handleFirestoreError(error, 'get', `users/${userId}/khatam_last_ayah/${type}_${id}`);
  });
};

// --- TOKO SANTRI MARKETPLACE ---

export const subscribeToMarketplaceProducts = (callback: (products: any[]) => void, onError?: (err: any) => void) => {
  if (!db) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, 'marketplace_products'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(products);
  }, (error) => {
    console.error("Error subscribing to marketplace products:", error);
    if (onError) onError(error);
    callback([]);
  });
};

export const addMarketplaceProduct = async (productData: any, user: any) => {
  if (!db) throw new Error("Database tidak tersedia");
  const cleanData: Record<string, any> = {};
  Object.keys(productData).forEach(key => {
    if (productData[key] !== undefined) {
      cleanData[key] = productData[key];
    }
  });
  return addDoc(collection(db, 'marketplace_products'), {
    ...cleanData,
    sellerId: user.uid,
    sellerName: cleanData.sellerName || user.displayName || 'Toko Santri Mandiri',
    sellerAvatarUrl: cleanData.sellerAvatarUrl || user.photoURL || '',
    createdAt: serverTimestamp()
  });
};

export const deleteMarketplaceProduct = async (productId: string) => {
  if (!db) return;
  return deleteDoc(doc(db, 'marketplace_products', productId));
};

export const reportMarketplaceProduct = async (product: any, reason: string, note: string, user: any) => {
  if (!db) throw new Error("Database tidak tersedia");
  return addDoc(collection(db, 'marketplace_reports'), {
    productId: product.id,
    productName: product.name,
    productPrice: product.price,
    productImage: product.imageUrl || (product.imageUrls && product.imageUrls[0]) || '',
    sellerName: product.sellerName || 'Penjual Santri',
    sellerId: product.sellerId || '',
    reporterId: user?.uid || 'anonymous',
    reporterName: user?.displayName || 'Pengguna Santri',
    reason,
    note,
    status: 'pending',
    createdAt: serverTimestamp()
  });
};

export const subscribeToMarketplaceReports = (callback: (reports: any[]) => void) => {
  if (!db) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, 'marketplace_reports'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(reports);
  }, (error) => {
    console.error("Error subscribing to marketplace reports:", error);
    callback([]);
  });
};

export const deleteMarketplaceReport = async (reportId: string) => {
  if (!db) return;
  return deleteDoc(doc(db, 'marketplace_reports', reportId));
};

export const resolveMarketplaceReport = async (reportId: string) => {
  if (!db) return;
  return updateDoc(doc(db, 'marketplace_reports', reportId), {
    status: 'resolved'
  });
};

// --- CATATAN SANTRI (SANTRI NOTES) FIRESTORE SERVICES ---

export const subscribeToUserNotes = (userId: string, callback: (notes: any[]) => void) => {
  if (!db || !userId) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, 'users', userId, 'santri_notes')
  );
  return onSnapshot(q, (snapshot) => {
    const notesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(notesList);
  }, (error) => {
    handleFirestoreError(error, 'get', `users/${userId}/santri_notes`);
    callback([]);
  });
};

export const saveUserNoteToFirestore = async (userId: string, note: any) => {
  if (!db || !userId) return;
  const docRef = doc(db, 'users', userId, 'santri_notes', note.id);
  const cleanData: Record<string, any> = {};
  Object.keys(note).forEach(key => {
    if (note[key] !== undefined) {
      cleanData[key] = note[key];
    }
  });

  try {
    await setDoc(docRef, {
      ...cleanData,
      updatedAt: note.updatedAt || Date.now()
    }, { merge: true });
  } catch (e) {
    handleFirestoreError(e, 'write', `users/${userId}/santri_notes/${note.id}`);
  }
};

export const deleteUserNoteFromFirestore = async (userId: string, noteId: string) => {
  if (!db || !userId) return;
  const docRef = doc(db, 'users', userId, 'santri_notes', noteId);
  try {
    await deleteDoc(docRef);
  } catch (e) {
    handleFirestoreError(e, 'delete', `users/${userId}/santri_notes/${noteId}`);
  }
};




