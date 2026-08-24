
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// NEW: Global function to send native Android notifications & Handle Back Press
declare global {
  interface Window {
    // Defines the function the Android WebView calls when the hardware back button is pressed
    handleAndroidBackPress?: () => boolean; 
    
    // Defines the function Android calls to pass the Google ID Token back to React
    handleAndroidLogin?: (idToken: string) => Promise<void>;

    // Callback called by Android when Rewarded Ad is finished
    onRewardGranted?: () => void;

    // Callback called by Android when Rewarded Interstitial Ad is finished
    onRewardedInterstitialGranted?: () => void;

    // Callback called by Android when Google Play Billing purchase succeeds
    onPurchaseSuccess?: (productId: string) => void;

    // Callback called by Android when Google Play Billing purchase fails or is cancelled
    onPurchaseCancelled?: (error: string) => void;

    AndroidNativeInterface?: {
      // Existing Media Controls
      updateMediaNotification(title: string, subtitle: string, isPlaying: boolean): void;
      cancelMediaNotification(): void;
      
      // NEW: Generic Notification (Adzan, Post-Adzan & Broadcast)
      showNotification(title: string, message: string, type: 'adzan' | 'post_adzan' | 'broadcast'): void;

      // NEW: Schedule Prayer Times
      schedulePrayerTimes(json: string): void;

      // NEW: Set Adhan Audio
      setAdhanAudio(prayerName: string, url: string, coverUrl?: string): void;

      // NEW: Quran Audio Controls (Added for AudioContext)
      playQuranAudio(url: string, title: string, subtitle: string, coverUrl?: string): void;
      pauseQuranAudio(): void;
      resumeQuranAudio(): void;
      stopQuranAudio(): void;

      // NEW: TTS AI Interface
      speak(audioBase64: string, text: string): void;

      // NEW: Native Share
      shareText(title: string, message: string): void;

      // NEW: Native Share Image (Added to fix MutiaraScreen property error)
      shareImage(base64: string, filename: string): void;

      // NEW: Save File to Device Storage
      saveTextToFile(filename: string, content: string): void;

      // NEW: Trigger Google Login
      triggerGoogleLogin(): void;

      // NEW: Show Rewarded Ad
      showRewardedAd(): void;

      // NEW: Show Interstitial Ad
      showInterstitialAd(): void;

      // NEW: Show Rewarded Interstitial Ad
      showRewardedInterstitialAd(): void;

      // NEW: Play Live/IPTV stream natively in Kotlin
      playIptvStream?(url: string, title: string): void;

      // NEW: Launch Google Play Billing Flow for Donations / In-App Purchases
      launchBillingFlow?(productId: string): void;

      // NEW: Open External URL / Deep Link natively outside WebView
      openExternalUrl?(url: string): void;
      openUrl?(url: string): void;

      // NEW: Open Application in Play Store (Cek Update) natively
      openPlayStore?(): void;

      // NEW: Exit App
      exitApp(): void;

      // NEW: Request Battery Optimization Exemption
      requestBatteryOptimizationExemption?(): void;

      // NEW: GPS & Location Settings
      requestGpsEnable?(): void;
      openLocationSettings?(): void;
    };
    
    // Existing Helpers
    sendAdzanNotification?: (prayerName: string, time: string, targetUrl?: string) => void;
    sendPostAdzanNotification?: (prayerName: string, time: string, targetUrl?: string) => void;
    sendNativeShare?: (title: string, text: string, url?: string) => Promise<void>;
    AppMediaControls?: {
      togglePlay: () => void;
      nextAyah: () => void;
      prevAyah: () => void;
    };
  }
}

// Update Helper to use new native method & Browser Notification fallback
window.sendAdzanNotification = (prayerName: string, time: string, targetUrl: string = '/') => {
  const cleanName = prayerName.replace(/^Pasca\s+/i, '').replace(/^10\s*Mnt\s*Pasca\s+/i, '');
  const title = `Waktu ${cleanName}`;
  const message = `Telah masuk waktu ${cleanName} (${time}). Mari tunaikan sholat!`;
  try {
    if (window.AndroidNativeInterface && typeof window.AndroidNativeInterface.showNotification === 'function') {
      window.AndroidNativeInterface.showNotification(title, message, 'adzan');
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body: message, icon: '/icon.png' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { body: message, icon: '/icon.png' });
          }
        });
      }
    }
  } catch (error) {
    console.error("Error sending adzan notification:", error);
  }
};

window.sendPostAdzanNotification = (prayerName: string, time: string, targetUrl: string = '/') => {
  const cleanName = prayerName.replace(/^Pasca\s+/i, '').replace(/^10\s*Mnt\s*Pasca\s+/i, '');
  const isFardhuPrayer = ['Subuh', 'Zuhur', 'Ashar', 'Maghrib', 'Isya'].includes(cleanName);
  const title = `Assalamualaikum Santri AI - ${cleanName}`;
  const message = isFardhuPrayer
    ? `Sudah 10 menit berlalu sejak Adzan ${cleanName} (${time}). Mari bersegera melaksanakan sholat ${cleanName}!`
    : `Sudah 10 menit berlalu sejak waktu ${cleanName} (${time}). Tetap semangat beribadah dan beraktivitas!`;
  try {
    if (window.AndroidNativeInterface && typeof window.AndroidNativeInterface.showNotification === 'function') {
      window.AndroidNativeInterface.showNotification(title, message, 'post_adzan');
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body: message, icon: '/icon.png' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { body: message, icon: '/icon.png' });
          }
        });
      }
    }
  } catch (error) {
    console.error("Error sending post-adzan notification:", error);
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
