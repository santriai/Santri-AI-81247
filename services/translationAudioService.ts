/**
 * Service for generating Indonesian Text-to-Speech (TTS) for Quran translations.
 * Prioritizes:
 * 1. Android Native TextToSpeech via AndroidNativeInterface (reliable in WebView)
 * 2. Web Speech API (id-ID) for modern desktop/mobile browsers
 * 3. Gemini High-Quality Indonesian AI Voice fallback
 */

import { generateSpeech } from './geminiService';

let speechSynth: SpeechSynthesis | null = null;
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  speechSynth = window.speechSynthesis;
}

// Global reference for currently playing translation audio/speech
let currentTranslationAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

export const playIndonesianTranslationAudio = (
  text: string, 
  onStart?: () => void, 
  onEnded?: () => void, 
  onError?: (e: any) => void
): (() => void) => {
  // Stop any previous speech or audio
  stopIndonesianTranslationAudio();

  const cleanText = text
    .replace(/\(.*?\)/g, '') // remove parenthesized footnotes / references
    .replace(/\[.*?\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    onEnded?.();
    return () => {};
  }

  let isCancelled = false;

  // 1. Android Native TextToSpeech (Khusus Android WebView)
  if (typeof window !== 'undefined' && window.AndroidNativeInterface) {
    try {
      if (typeof window.AndroidNativeInterface.speakTranslation === 'function') {
        window.onNativeTranslationStarted = () => {
          if (!isCancelled) onStart?.();
        };
        window.onNativeTranslationEnded = () => {
          if (!isCancelled) onEnded?.();
        };
        window.AndroidNativeInterface.speakTranslation(cleanText);
        return () => {
          isCancelled = true;
          stopIndonesianTranslationAudio();
        };
      } else if (typeof window.AndroidNativeInterface.speak === 'function') {
        // Fallback untuk versi Android lama: speak via native TTS dengan perkiraan durasi
        if (!isCancelled) onStart?.();
        window.AndroidNativeInterface.speak('', cleanText);
        const durationMs = Math.max(2500, Math.min(25000, (cleanText.length / 12) * 1000));
        const timer = setTimeout(() => {
          if (!isCancelled) onEnded?.();
        }, durationMs);
        return () => {
          isCancelled = true;
          clearTimeout(timer);
          stopIndonesianTranslationAudio();
        };
      }
    } catch (androidErr) {
      console.warn('Gagal memutar TTS Android native:', androidErr);
    }
  }

  // 2. Web Speech API (Untuk Browser Web standar)
  // Periksa apakah bukan Android WebView dan speechSynth memiliki suara atau didukung
  const isAndroidWebView = typeof window !== 'undefined' && (
    !!window.AndroidNativeInterface || 
    /wv|Android.*Version\/[\d.]+/i.test(navigator.userAgent)
  );

  if (speechSynth && !isAndroidWebView) {
    try {
      speechSynth.cancel(); // ensure clear queue

      const utterance = new SpeechSynthesisUtterance(cleanText);
      currentUtterance = utterance;
      utterance.lang = 'id-ID';
      utterance.rate = 0.95; // comfortable natural reading speed
      utterance.pitch = 1.0;

      // Select natural Indonesian voice if available
      const voices = speechSynth.getVoices();
      const idVoice = voices.find(v => v.lang.toLowerCase().includes('id') || v.lang.toLowerCase().includes('indonesia'));
      if (idVoice) {
        utterance.voice = idVoice;
      }

      let hasStarted = false;

      utterance.onstart = () => {
        if (!isCancelled) {
          hasStarted = true;
          onStart?.();
        }
      };

      utterance.onend = () => {
        if (!isCancelled) {
          currentUtterance = null;
          onEnded?.();
        }
      };

      utterance.onerror = (err) => {
        if (!isCancelled) {
          console.warn('SpeechSynthesis error, mencoba fallback Gemini AI Voice:', err);
          currentUtterance = null;
          playViaAiVoice(cleanText, () => isCancelled, onStart, onEnded, onError);
        }
      };

      speechSynth.resume();
      speechSynth.speak(utterance);

      // Watchdog jika speech synthesis macet
      const timer = setTimeout(() => {
        if (!hasStarted && !isCancelled && speechSynth) {
          speechSynth.resume();
        }
      }, 600);

      return () => {
        isCancelled = true;
        clearTimeout(timer);
        stopIndonesianTranslationAudio();
      };
    } catch (e) {
      console.warn('Web Speech gagal, fallback ke AI Voice:', e);
    }
  }

  // 3. Fallback AI Voice (Gemini TTS Bahasa Indonesia)
  playViaAiVoice(cleanText, () => isCancelled, onStart, onEnded, onError);

  return () => {
    isCancelled = true;
    stopIndonesianTranslationAudio();
  };
};

const playViaAiVoice = (
  text: string,
  getIsCancelled: () => boolean,
  onStart?: () => void,
  onEnded?: () => void,
  onError?: (e: any) => void
) => {
  generateSpeech(text, false)
    .then((audioUrl) => {
      if (getIsCancelled() || !audioUrl) {
        if (!getIsCancelled()) onEnded?.();
        return;
      }

      const audio = new Audio(audioUrl);
      currentTranslationAudio = audio;

      audio.onplay = () => {
        if (!getIsCancelled()) onStart?.();
      };

      audio.onended = () => {
        if (!getIsCancelled()) {
          currentTranslationAudio = null;
          onEnded?.();
        }
      };

      audio.onerror = (err) => {
        if (!getIsCancelled()) {
          console.error('AI Voice audio error:', err);
          currentTranslationAudio = null;
          onError?.(err);
          onEnded?.();
        }
      };

      audio.play().catch((err) => {
        if (!getIsCancelled()) {
          console.warn('AI Voice play error:', err);
          onEnded?.();
        }
      });
    })
    .catch((err) => {
      if (!getIsCancelled()) {
        console.warn('Gagal generate AI speech untuk terjemahan:', err);
        onError?.(err);
        onEnded?.();
      }
    });
};

export const stopIndonesianTranslationAudio = () => {
  // Hentikan Android Native TTS
  if (typeof window !== 'undefined' && window.AndroidNativeInterface) {
    try {
      window.AndroidNativeInterface.stopTranslationSpeech?.();
    } catch (e) {}
  }

  delete (window as any).onNativeTranslationStarted;
  delete (window as any).onNativeTranslationEnded;

  if (currentTranslationAudio) {
    currentTranslationAudio.pause();
    currentTranslationAudio.src = '';
    currentTranslationAudio = null;
  }

  if (speechSynth) {
    try {
      speechSynth.cancel();
    } catch (e) {}
  }
  currentUtterance = null;
};
