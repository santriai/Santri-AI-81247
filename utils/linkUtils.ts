import { PLAYSTORE_LINK } from '../constants';

export const WA_GROUP_SHARE_TEXT = "Buka tautan ini untuk bergabung ke grup Aplikasi Santri AI: https://chat.whatsapp.com/Jr6Aq0VrJgxItOyoBwnSrs?s=sh&p=a&mlu=4";

/**
 * Shares the WhatsApp group link via Android Native interface, Web Share API, or clipboard fallback.
 */
export const shareWaGroup = async (e?: React.SyntheticEvent, onShowToast?: (msg: string, type?: 'success' | 'info' | 'error') => void) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const title = 'Grup WhatsApp Santri AI';
  const text = WA_GROUP_SHARE_TEXT;

  // 1. Try Android Native Interface shareText
  const androidInterface = (window as any).AndroidNativeInterface;
  if (androidInterface && typeof androidInterface.shareText === 'function') {
    try {
      androidInterface.shareText(title, text);
      return;
    } catch (err) {
      console.warn("Android native share failed:", err);
    }
  }

  // 2. Try Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: text,
      });
      if (onShowToast) onShowToast("Berhasil membagikan link grup!", "success");
      return;
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        console.warn("Web share failed:", err);
      } else {
        return;
      }
    }
  }

  // 3. Fallback: Copy to clipboard
  try {
    await navigator.clipboard.writeText(text);
    if (onShowToast) {
      onShowToast("Tautan grup WhatsApp berhasil disalin!", "success");
    } else {
      alert("Tautan grup WhatsApp berhasil disalin!");
    }
  } catch (err) {
    console.error("Clipboard copy failed:", err);
  }
};

/**
 * Shares any custom text via Android Native interface, Web Share API, or clipboard fallback.
 */
export const shareText = async (title: string, text: string, onShowToast?: (msg: string, type?: 'success' | 'info' | 'error') => void) => {
  let finalText = text || '';
  if (!finalText.includes('play.google.com') && !finalText.includes('http')) {
    finalText = `${finalText}\n\n📲 Unduh Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
  }

  // 1. Try Android Native Interface shareText
  const androidInterface = (window as any).AndroidNativeInterface;
  if (androidInterface && typeof androidInterface.shareText === 'function') {
    try {
      androidInterface.shareText(title, finalText);
      return;
    } catch (err) {
      console.warn("Android native share failed:", err);
    }
  }

  // 2. Try Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: finalText,
      });
      if (onShowToast) onShowToast("Berhasil membagikan!", "success");
      return;
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        console.warn("Web share failed:", err);
      } else {
        return;
      }
    }
  }

  // 3. Fallback: Copy to clipboard
  try {
    await navigator.clipboard.writeText(finalText);
    if (onShowToast) {
      onShowToast("Berhasil disalin ke papan klip!", "success");
    }
  } catch (err) {
    console.error("Clipboard copy failed:", err);
  }
};

/**
 * Utility to safely open external URLs in Web, PWA, and Android WebView environments.
 * Handles AndroidNativeInterface native bridging when running inside native Android app.
 */
export const openExternalLink = (url: string, e?: React.SyntheticEvent) => {
  if (e) {
    try {
      e.preventDefault();
      e.stopPropagation();
    } catch (_) {}
  }

  if (!url) return;

  const win = window as any;
  const isPlayStoreUrl = url.includes('play.google.com/store') || url.startsWith('market://');
  let appId = 'com.kitabkuningterjemahlengkap';
  if (url.includes('id=')) {
    const extracted = url.split('id=')[1]?.split('&')[0];
    if (extracted) appId = extracted;
  }
  const marketUrl = `market://details?id=${appId}`;

  // 1. Try native Android interface bridges
  const bridges = [win.AndroidNativeInterface, win.Android, win.AndroidBridge, win.JSBridge];

  for (const bridge of bridges) {
    if (!bridge) continue;

    // Check specific Play Store / rating methods
    if (isPlayStoreUrl) {
      if (typeof bridge.openPlayStore === 'function') {
        try { bridge.openPlayStore(url); return; } catch (err) { console.warn("bridge.openPlayStore failed:", err); }
      }
      if (typeof bridge.rateApp === 'function') {
        try { bridge.rateApp(); return; } catch (err) { console.warn("bridge.rateApp failed:", err); }
      }
      if (typeof bridge.openAppRating === 'function') {
        try { bridge.openAppRating(); return; } catch (err) { console.warn("bridge.openAppRating failed:", err); }
      }
    }

    // Check general open URL methods
    if (typeof bridge.openExternalUrl === 'function') {
      try { bridge.openExternalUrl(url); return; } catch (err) { console.warn("bridge.openExternalUrl failed:", err); }
    }
    if (typeof bridge.openUrl === 'function') {
      try { bridge.openUrl(url); return; } catch (err) { console.warn("bridge.openUrl failed:", err); }
    }
    if (typeof bridge.openInBrowser === 'function') {
      try { bridge.openInBrowser(url); return; } catch (err) { console.warn("bridge.openInBrowser failed:", err); }
    }
    if (typeof bridge.openBrowser === 'function') {
      try { bridge.openBrowser(url); return; } catch (err) { console.warn("bridge.openBrowser failed:", err); }
    }
    if (typeof bridge.launchUrl === 'function') {
      try { bridge.launchUrl(url); return; } catch (err) { console.warn("bridge.launchUrl failed:", err); }
    }
  }

  // 2. Programmatic Anchor Tag Click (Triggers Intent Filter on Android WebView)
  try {
    const a = document.createElement('a');
    a.href = isPlayStoreUrl && /Android/i.test(navigator.userAgent) ? marketUrl : url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try { document.body.removeChild(a); } catch (_) {}
    }, 100);
  } catch (err) {
    console.warn("Programmatic anchor click failed:", err);
  }

  // 3. Browser Fallback
  try {
    const opened = window.open(url, '_system') || window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened || opened.closed || typeof opened.closed === 'undefined') {
      if (isPlayStoreUrl) {
        window.location.href = marketUrl;
      } else {
        if (window.top && window.top !== window) {
          window.top.location.href = url;
        } else {
          window.location.href = url;
        }
      }
    }
  } catch (err) {
    console.warn("window.open failed, falling back to location.href:", err);
    if (isPlayStoreUrl) {
      window.location.href = marketUrl;
    } else {
      window.location.href = url;
    }
  }
};

/**
 * Dedicated helper function to trigger rating / opening Play Store in Android Native or Web.
 */
export const openRatingApp = (e?: React.SyntheticEvent) => {
  if (e) {
    try {
      e.preventDefault();
      e.stopPropagation();
    } catch (_) {}
  }

  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.kitabkuningterjemahlengkap';
  const win = window as any;

  // Direct check for AndroidNativeInterface method
  if (win.AndroidNativeInterface) {
    if (typeof win.AndroidNativeInterface.openPlayStore === 'function') {
      try {
        win.AndroidNativeInterface.openPlayStore();
        return;
      } catch (err) {
        console.warn('win.AndroidNativeInterface.openPlayStore failed:', err);
      }
    }
    if (typeof win.AndroidNativeInterface.rateApp === 'function') {
      try {
        win.AndroidNativeInterface.rateApp();
        return;
      } catch (err) {
        console.warn('win.AndroidNativeInterface.rateApp failed:', err);
      }
    }
    if (typeof win.AndroidNativeInterface.openAppRating === 'function') {
      try {
        win.AndroidNativeInterface.openAppRating();
        return;
      } catch (err) {
        console.warn('win.AndroidNativeInterface.openAppRating failed:', err);
      }
    }
  }

  // Fall back to robust openExternalLink
  openExternalLink(playStoreUrl, e);
};
