
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth'; 
import { 
  signInWithGoogle, 
  signInWithAndroidToken, 
  logout, 
  subscribeToAuthChanges,
  loginWithEmail,
  registerWithEmail,
  isFirebaseReady, 
  resetPassword, 
  ensureUserDocument,
  subscribeToUserData,
  sendVerificationEmailToUser,
  deleteUserAuthAccount,
  updateUserData,
  setUserOnlineStatus
} from '../services/firebase';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  signIn: () => Promise<void>; 
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (email: string, pass: string, referralCode?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>; 
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Global Presence Tracker (Real-time Online Status)
  useEffect(() => {
    if (!user || !isFirebaseReady()) return;

    // 1. Immediately set status to Online
    setUserOnlineStatus(user.uid, true);

    // 2. Set up a heartbeat interval every 30 seconds to keep the user online
    const interval = setInterval(() => {
      setUserOnlineStatus(user.uid, true);
    }, 30000);

    // 3. Mark offline when they close/exit the application
    const handleUnload = () => {
      setUserOnlineStatus(user.uid, false);
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('unload', handleUnload);
      // Mark offline on unmount/signout
      setUserOnlineStatus(user.uid, false);
    };
  }, [user]);

  useEffect(() => {
    let unsubscribeUser: () => void = () => {};

    const unsubscribeAuth = subscribeToAuthChanges(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Subscribe to Firestore user doc
        unsubscribeUser = subscribeToUserData(currentUser.uid, async (data) => {
          if (data) {
            const sanitizedWasilah = Math.max(0, Number(data.wasilah ?? data.wasilahPoints ?? 0));
            const sanitizedData = {
              ...data,
              wasilah: sanitizedWasilah,
              wasilahPoints: sanitizedWasilah
            };
            setUserData(sanitizedData);
            
            const updates: any = {};
            if ((data.wasilah !== undefined && data.wasilah < 0) || (data.wasilahPoints !== undefined && data.wasilahPoints < 0)) {
              updates.wasilah = sanitizedWasilah;
              updates.wasilahPoints = sanitizedWasilah;
            }

            if (data.role !== 'admin') {
              // Check verification badge ownership and expiration
              if (data.verificationBadge && data.verificationBadge !== 'none') {
                const activeBadges = data.activeBadges || [];
                const expiryStr = data.badgeUntil || data.badgeExpiry;
                const isExpired = expiryStr ? new Date() > new Date(expiryStr) : false;
                
                if (!activeBadges.includes(data.verificationBadge) || isExpired) {
                  updates.verificationBadge = 'none';
                }
              }
              
              // Check premium frame ownership
              if (data.avatarFrame && data.avatarFrame !== 'none' && data.avatarFrame.startsWith('premium')) {
                if (!data.isPremium) {
                  updates.avatarFrame = 'none';
                }
              }
            }

            if (Object.keys(updates).length > 0) {
              try {
                await updateUserData(currentUser.uid, updates);
                console.log(`[Auto-Sanitizer] Fixed negative balance or invalid items for ${currentUser.uid}:`, updates);
              } catch (err) {
                console.error("[Auto-Sanitizer] Failed to update user document:", err);
              }
            }
          } else {
            setUserData(null);
          }
        });
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    if (!isFirebaseReady()) {
       setLoading(false);
    }

    window.handleAndroidLogin = async (idToken: string) => {
      try {
        setLoading(true);
        showToast("Memverifikasi akun Google...", "info");
        const result = await signInWithAndroidToken(idToken);
        if (result.user) {
            await ensureUserDocument(result.user); 
        }
        showToast("Berhasil masuk dengan Google!", "success");
      } catch (e) {
        console.error("Android login failed in React", e);
        showToast("Gagal login dari Android.", "error");
      } finally {
        setLoading(false);
      }
    };

    return () => {
      unsubscribeAuth();
      unsubscribeUser();
      delete window.handleAndroidLogin;
    };
  }, [showToast]);

  const handleSignIn = async () => {
    if (!isFirebaseReady()) {
        showToast("Firebase belum dikonfigurasi. Cek API Key.", "error");
        return;
    }

    if (window.AndroidNativeInterface && typeof window.AndroidNativeInterface.triggerGoogleLogin === 'function') {
      showToast("Membuka Google Sign-In...", "info");
      window.AndroidNativeInterface.triggerGoogleLogin();
    } else {
      try {
        const result = await signInWithGoogle();
        if (result.user) {
            await ensureUserDocument(result.user); 
        }
        showToast("Berhasil masuk!", "success");
      } catch (error: any) {
        console.error("Login failed", error);
        if (error?.message?.includes("Firebase not initialized")) {
           showToast("Server belum terhubung (Config Missing).", "error");
        } else if (error?.code === 'auth/configuration-not-found') {
           showToast("Google Sign-In belum diaktifkan di Firebase Console.", "error");
        } else if (error?.code === 'auth/popup-closed-by-user') {
           showToast("Login dibatalkan.", "info");
        } else if (error?.code === 'auth/unauthorized-domain') {
           showToast("Domain ini belum diizinkan di Firebase Console. Tambahkan domain ini di Firebase > Authentication > Settings.", "error");
        } else {
           showToast("Gagal masuk. Coba lagi.", "error");
        }
      }
    }
  };

  const handleSignInEmail = async (email: string, pass: string) => {
    try {
      setLoading(true);
      
      if (!isFirebaseReady()) {
         showToast("Error: Database tidak terhubung. Mode Produksi aktif.", "error");
         setLoading(false);
         return;
      }

      const result = await loginWithEmail(email, pass);
      const userEmail = result.user.email || '';
      
      const isWhitelisted = userEmail === 'admin@santrimodern.com' || userEmail === 'demo@santrimodern.com';

      if (!result.user.emailVerified && !isWhitelisted) {
          await logout(); 
          throw new Error('auth/email-not-verified');
      }

      if (result.user) {
          await ensureUserDocument(result.user); 
      }
      showToast("Berhasil masuk!", "success");
    } catch (error: any) {
      console.error("Login Email failed", error);
      let msg = "Email atau sandi salah.";
      
      if (error?.message === 'auth/email-not-verified') {
          msg = "Email belum diverifikasi. Cek inbox email Anda.";
      } else if (error?.message?.includes("Firebase not initialized") || error?.message?.includes("not initialized")) {
         msg = "Sistem Error: Database tidak terhubung.";
      } else if (error?.code === 'auth/invalid-api-key') {
         msg = "Kunci API tidak valid. Hubungi admin.";
      } else if (error.code === 'auth/user-not-found') {
         msg = "Akun tidak ditemukan.";
      } else if (error.code === 'auth/wrong-password') {
         msg = "Sandi salah.";
      } else if (error.code === 'auth/invalid-email') {
         msg = "Format email tidak valid.";
      } else if (error?.code === 'auth/unauthorized-domain') {
         msg = "Domain ini belum diizinkan di Firebase Console.";
      }
      
      showToast(msg, "error");
      throw error; 
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpEmail = async (email: string, pass: string, referralCode?: string) => {
    try {
      setLoading(true);

      if (!isFirebaseReady()) {
         showToast("Error: Database tidak terhubung. Mode Produksi aktif.", "error");
         setLoading(false);
         return;
      }

      const result = await registerWithEmail(email, pass, referralCode);
      
      if (result.user) {
          await ensureUserDocument(result.user); 
          await sendVerificationEmailToUser(result.user);
          await logout();
      } 
    } catch (error: any) {
      console.error("Register Email failed", error);
      let msg = "Gagal mendaftar.";
      
      if (error?.message?.includes("Firebase not initialized")) {
         msg = "Fitur login belum aktif (Server belum dikonfigurasi).";
      } else if (error.code === 'auth/email-already-in-use') {
         msg = "Email sudah digunakan.";
      } else if (error.code === 'auth/weak-password') {
         msg = "Sandi terlalu lemah (min 6 karakter).";
      } else if (error.code === 'auth/invalid-email') {
         msg = "Format email tidak valid.";
      }
      
      showToast(msg, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async (email: string) => {
    try {
      if (!isFirebaseReady()) {
         showToast("Database tidak terhubung.", "error");
         return;
      }
      await resetPassword(email);
      showToast("Link reset kata sandi telah dikirim ke email Anda.", "success");
    } catch (error: any) {
      console.error("Reset Password Failed", error);
      let msg = "Gagal mengirim link reset.";
      if (error.code === 'auth/user-not-found') msg = "Email tidak terdaftar.";
      if (error.code === 'auth/invalid-email') msg = "Format email tidak valid.";
      showToast(msg, "error");
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      if (!isFirebaseReady()) {
          setUser(null);
          return;
      }
      await logout();
      showToast("Berhasil keluar.", "info");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await deleteUserAuthAccount(user);
      showToast("Akun Anda telah dihapus secara permanen.", "info");
    } catch (error: any) {
      console.error("Delete account error", error);
      if (error.code === 'auth/requires-recent-login') {
        showToast("Demi keamanan, silakan login ulang sebelum menghapus akun.", "warning");
      } else {
        showToast("Gagal menghapus akun. Coba lagi nanti.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData,
      loading, 
      signIn: handleSignIn, 
      signInEmail: handleSignInEmail, 
      signUpEmail: handleSignUpEmail, 
      sendPasswordReset: handleSendPasswordReset, 
      signOut: handleSignOut,
      deleteAccount: handleDeleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
