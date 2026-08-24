/**
 * Service for generating Indonesian Text-to-Speech (TTS) for Quran translations.
 * Uses high quality Web Speech API (id-ID) with natural speech rate and punctuation pauses,
 * with fallback to online Indonesian TTS audio streaming.
 */

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

  // Use Web Speech API if supported in browser/Android WebView
  if (speechSynth) {
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
          console.warn('SpeechSynthesis error, trying audio stream fallback:', err);
          currentUtterance = null;
          playViaAudioStream(cleanText, isCancelled, onStart, onEnded, onError);
        }
      };

      // Workaround for Chrome/Android speech synthesis pause bug
      speechSynth.resume();
      speechSynth.speak(utterance);

      // Timeout watchdog in case speech synthesis gets stuck
      const timer = setTimeout(() => {
        if (!hasStarted && !isCancelled && speechSynth) {
          speechSynth.resume();
        }
      }, 500);

      return () => {
        isCancelled = true;
        clearTimeout(timer);
        stopIndonesianTranslationAudio();
      };
    } catch (e) {
      console.warn('Web Speech failed to initialize, fallback to audio stream:', e);
    }
  }

  // Fallback to Google TTS Audio stream
  return playViaAudioStream(cleanText, isCancelled, onStart, onEnded, onError);
};

const playViaAudioStream = (
  text: string,
  isCancelled: boolean,
  onStart?: () => void,
  onEnded?: () => void,
  onError?: (e: any) => void
): (() => void) => {
  try {
    const encoded = encodeURIComponent(text.slice(0, 300));
    const ttsAudioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=${encoded}`;

    const audio = new Audio(ttsAudioUrl);
    currentTranslationAudio = audio;

    audio.onplay = () => {
      if (!isCancelled) onStart?.();
    };

    audio.onended = () => {
      if (!isCancelled) {
        currentTranslationAudio = null;
        onEnded?.();
      }
    };

    audio.onerror = (err) => {
      if (!isCancelled) {
        console.error('TTS Audio Stream error:', err);
        currentTranslationAudio = null;
        onError?.(err);
        onEnded?.();
      }
    };

    audio.play().catch((err) => {
      if (!isCancelled) {
        console.error('Audio play error:', err);
        onEnded?.();
      }
    });

    return () => {
      stopIndonesianTranslationAudio();
    };
  } catch (err) {
    onError?.(err);
    onEnded?.();
    return () => {};
  }
};

export const stopIndonesianTranslationAudio = () => {
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
