/**
 * Utility untuk mensintesis efek suara permainan secara dinamis menggunakan Web Audio API,
 * diintegrasikan dengan Jembatan Getar Android (Vibration API) dan Deteksi Jembatan Native
 * untuk kompatibilitas 100% sempurna pada perangkat Android WebView maupun Browser.
 */

// Interface untuk deteksi jembatan native Android kustom jika tersedia di masa depan
interface AndroidNativeBridge {
  playSound?: (soundType: string) => void;
  vibrate?: (ms: number) => void;
}

declare global {
  interface Window {
    Android?: AndroidNativeBridge;
    AndroidBridge?: AndroidNativeBridge;
    webkitAudioContext?: typeof AudioContext;
  }
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch((err) => console.log('Gagal resume AudioContext:', err));
  }
  
  return audioCtx;
}

/**
 * Fungsi pembantu untuk memicu getaran di perangkat Android via WebView
 */
const triggerAndroidVibration = (pattern: number | number[]) => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Vibration API tidak didukung atau diblokir:', e);
    }
  }
};

/**
 * Fungsi pembantu untuk memanggil jembatan native kustom Android jika ada
 */
const callAndroidNativeSound = (soundType: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const win = window as any;
  const bridge = win.AndroidNativeInterface || win.Android || win.AndroidBridge;
  if (bridge) {
    if (typeof bridge.playSound === 'function') {
      try {
        bridge.playSound(soundType);
        return true; // Berhasil dimainkan via native Android
      } catch (e) {
        console.error('Gagal memanggil playSound Native Android:', e);
      }
    }
    if (typeof bridge.playAudio === 'function') {
      try {
        bridge.playAudio(soundType);
        return true;
      } catch (e) {}
    }
  }
  return false; // Tidak ada jembatan native, lanjut ke Web Audio API
};

/**
 * Memainkan suara "Ting" (Detak Hitung Mundur Standar - NYARING & TAJAM)
 */
export const playCountdownTick = () => {
  if (callAndroidNativeSound('countdown_tick')) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Menggunakan triangle wave agar terdengar jauh lebih nyaring dan tajam di speaker HP kecil
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // Pitch A5 (Lebih nyaring dari 600Hz)

    // Menaikkan volume dari 0.08 ke 0.45 agar suaranya lantang (nyaring)
    gainNode.gain.setValueAtTime(0.45, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    console.warn('Gagal memutar audio tick:', e);
  }
};

/**
 * Memainkan suara "Peringatan Waktu Sekarat" (Makin Cepat/Tegang - NYARING + DOUBLE BEAT)
 * Dipanggil setiap detik, dan meluncurkan 2 ketukan cepat terpisah 500ms (Tempo Ganda)
 */
export const playCountdownHurry = () => {
  if (callAndroidNativeSound('countdown_hurry')) {
    triggerAndroidVibration(50);
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // --- KETUKAN PERTAMA ---
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth'; // Sawtooth sangat nyaring dan menusuk, cocok untuk ketegangan
    osc1.frequency.setValueAtTime(1200, now); // Pitch tinggi nyaring
    gain1.gain.setValueAtTime(0.48, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.1);
    triggerAndroidVibration(35);

    // --- KETUKAN KEDUA (Menjadikan tempo terdengar 2x lebih cepat pada sisa waktu kritis) ---
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(1400, ctx.currentTime); // Lebih tinggi lagi
        gain2.gain.setValueAtTime(0.48, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.1);
        triggerAndroidVibration(35);
      } catch (innerErr) {}
    }, 500); // Dijeda 500ms untuk membuat ketukan cepat beruntun

  } catch (e) {
    console.warn('Gagal memutar audio hurry:', e);
  }
};

/**
 * Memainkan suara "Benar!" (Melodi riang gembira, sangat nyaring & berkilau - DURASI 5 DETIK)
 */
export const playSoundCorrect = () => {
  if (callAndroidNativeSound('correct')) {
    triggerAndroidVibration([60, 40, 60, 40, 100, 50, 120]);
    return;
  }

  triggerAndroidVibration([60, 40, 60, 40, 100, 50, 120]);

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    const playBellChime = (freq: number, startTime: number, duration: number, vol = 0.35) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      // Menggunakan triangle + sine overtone agar terdengar sangat nyaring, jernih dan manis
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      const oscOvertone = ctx.createOscillator();
      const gainOvertone = ctx.createGain();
      oscOvertone.type = 'sine';
      oscOvertone.frequency.setValueAtTime(freq * 2.76, startTime); // Bell chime inharmonic overtone

      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      gainOvertone.gain.setValueAtTime(vol * 0.25, startTime);
      gainOvertone.gain.exponentialRampToValueAtTime(0.0001, startTime + (duration * 0.6));

      osc.connect(gain);
      oscOvertone.connect(gainOvertone);
      gain.connect(ctx.destination);
      gainOvertone.connect(ctx.destination);

      osc.start(startTime);
      oscOvertone.start(startTime);
      osc.stop(startTime + duration);
      oscOvertone.stop(startTime + duration);
    };

    const playSparkle = (freq: number, startTime: number, vol = 0.22) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    };

    // --- BAGIAN 1 (0.0s - 1.2s): Arpeggio Ceria Naik Cepat & Nyaring ---
    playBellChime(523.25,  now + 0.00, 0.8, 0.40); // C5
    playBellChime(659.25,  now + 0.12, 0.8, 0.40); // E5
    playBellChime(783.99,  now + 0.24, 0.9, 0.42); // G5
    playBellChime(1046.50, now + 0.36, 1.0, 0.45); // C6
    playBellChime(1318.51, now + 0.48, 1.0, 0.42); // E6
    playBellChime(1567.98, now + 0.60, 1.2, 0.45); // G6
    playBellChime(2093.00, now + 0.72, 1.5, 0.48); // C7

    playSparkle(2637.02, now + 0.80, 0.25); // E7
    playSparkle(3135.96, now + 0.92, 0.22); // G7
    playSparkle(4186.01, now + 1.04, 0.20); // C8

    // --- BAGIAN 2 (1.2s - 2.8s): Melodi Kemenangan Ceria Berkelanjutan ---
    playBellChime(1567.98, now + 1.25, 0.7, 0.38); // G6
    playBellChime(1760.00, now + 1.45, 0.7, 0.38); // A6
    playBellChime(1975.53, now + 1.65, 0.7, 0.40); // B6
    playBellChime(2093.00, now + 1.85, 1.1, 0.45); // C7 (High Peak)
    playBellChime(1567.98, now + 2.15, 0.7, 0.36); // G6
    playBellChime(2093.00, now + 2.40, 1.4, 0.46); // C7

    // --- BAGIAN 3 (2.8s - 5.0s): Harmoni Akor Crystalline Sustained Fading ~5 Detik ---
    const chordTime = now + 2.80;
    const chordDuration = 2.20; // Mengisi hingga 5.0 detik penuh

    [1046.50, 1318.51, 1567.98, 2093.00].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, chordTime);
      gain.gain.setValueAtTime(0.26, chordTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, chordTime + chordDuration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(chordTime);
      osc.stop(chordTime + chordDuration);
    });

    // Sparkles penutup di detik ke-3 & ke-4
    playSparkle(3135.96, now + 3.20, 0.18);
    playSparkle(4186.01, now + 3.70, 0.15);
    playSparkle(5274.04, now + 4.20, 0.12);

  } catch (e) {
    console.warn('Gagal memutar audio correct:', e);
  }
};

/**
 * Memainkan suara "Salah!" (Disonan tegas - 3X PENGULANGAN BERUNTUN, DURASI ~5 DETIK)
 */
export const playSoundIncorrect = () => {
  if (callAndroidNativeSound('incorrect')) {
    triggerAndroidVibration([200, 150, 200, 150, 300]);
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const playSingleIncorrectBuzzer = (startTime: number, isLast = false) => {
      triggerAndroidVibration(isLast ? 280 : 180);

      // Osc 1: Nada disonan 1 meluncur turun
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth'; // Sangat nyaring dan tegas
      osc1.frequency.setValueAtTime(290.00, startTime);
      osc1.frequency.linearRampToValueAtTime(110.00, startTime + 0.55);
      gain1.gain.setValueAtTime(0.46, startTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, startTime + 0.60);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(startTime);
      osc1.stop(startTime + 0.60);

      // Osc 2: Nada disonan 2 (frekuensi beradu menciptakan efek tegang/salah)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(308.00, startTime);
      osc2.frequency.linearRampToValueAtTime(120.00, startTime + 0.55);
      gain2.gain.setValueAtTime(0.46, startTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + 0.60);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(startTime);
      osc2.stop(startTime + 0.60);

      // Osc 3: Square wave sub-thud penegas
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'square';
      osc3.frequency.setValueAtTime(140.00, startTime);
      osc3.frequency.linearRampToValueAtTime(70.00, startTime + 0.50);
      gain3.gain.setValueAtTime(0.25, startTime);
      gain3.gain.exponentialRampToValueAtTime(0.001, startTime + 0.55);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(startTime);
      osc3.stop(startTime + 0.55);
    };

    const now = ctx.currentTime;

    // --- PENGULANGAN 1 (t = 0.0s) ---
    playSingleIncorrectBuzzer(now + 0.00, false);

    // --- PENGULANGAN 2 (t = 1.6s) ---
    setTimeout(() => {
      try {
        const currentCtx = getAudioContext();
        if (currentCtx) playSingleIncorrectBuzzer(currentCtx.currentTime, false);
      } catch (e) {}
    }, 1600);

    // --- PENGULANGAN 3 (t = 3.2s) - Berakhir hingga detik ke-5 ---
    setTimeout(() => {
      try {
        const currentCtx = getAudioContext();
        if (currentCtx) playSingleIncorrectBuzzer(currentCtx.currentTime, true);
      } catch (e) {}
    }, 3200);

  } catch (e) {
    console.warn('Gagal memutar audio incorrect:', e);
  }
};

let cancelledSoundIntervalId: any = null;

export const stopSoundCancelled = () => {
  if (cancelledSoundIntervalId) {
    clearInterval(cancelledSoundIntervalId);
    cancelledSoundIntervalId = null;
  }
};

/**
 * Memulai pengulangan efek suara "Permainan Dibatalkan" terus menerus
 * sampai user menutup halaman, berpindah halaman, atau menutup aplikasi.
 */
export const startSoundCancelledLoop = () => {
  stopSoundCancelled();

  const playAlertCycle = () => {
    if (callAndroidNativeSound('cancelled')) {
      triggerAndroidVibration([150, 100, 150, 100, 300]);
      return;
    }

    triggerAndroidVibration([120, 80, 120, 80, 250]);

    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      const playAlertTone = (freq: number, startTime: number, duration = 0.22, vol = 0.40, type: OscillatorType = 'triangle') => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // Nada Peringatan Berulang Khas: High Beep Beep -> Minor Drop -> Sub Alert
      playAlertTone(740.00, now + 0.00, 0.16, 0.45, 'triangle'); // F#5 Beep 1
      playAlertTone(740.00, now + 0.20, 0.16, 0.45, 'triangle'); // F#5 Beep 2
      playAlertTone(587.33, now + 0.45, 0.22, 0.40, 'triangle'); // D5
      playAlertTone(466.16, now + 0.75, 0.35, 0.42, 'sawtooth'); // A#4 Warning Buzz
      playAlertTone(349.23, now + 1.15, 0.70, 0.38, 'triangle'); // F4 Deep Resolving Warning

    } catch (e) {
      console.warn('Gagal memutar audio cancelled cycle:', e);
    }
  };

  playAlertCycle();
  cancelledSoundIntervalId = setInterval(playAlertCycle, 2400);
};

/**
 * Memainkan suara khusus "Permainan Dibatalkan" (Secara berulang-ulang sampai keluar)
 */
export const playSoundCancelled = () => {
  startSoundCancelledLoop();
};

let winnerSoundIntervalId: any = null;

export const stopSoundWinner = () => {
  if (winnerSoundIntervalId) {
    clearInterval(winnerSoundIntervalId);
    winnerSoundIntervalId = null;
  }
};

export const startSoundWinnerLoop = () => {
  stopSoundWinner();

  const playCycle = () => {
    if (callAndroidNativeSound('winner')) {
      triggerAndroidVibration([100, 50, 100, 50, 200, 50, 300]);
      return;
    }

    triggerAndroidVibration([80, 40, 80, 40, 150, 40, 200]);

    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Helper 1: Pluck / Marimba ceria
      const playPluck = (freq: number, startTime: number, duration: number, vol = 0.35) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2, startTime);

        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        gain2.gain.setValueAtTime(vol * 0.2, startTime);
        gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + (duration * 0.7));

        osc.connect(gain);
        osc2.connect(gain2);
        gain.connect(ctx.destination);
        gain2.connect(ctx.destination);

        osc.start(startTime);
        osc2.start(startTime);
        osc.stop(startTime + duration);
        osc2.stop(startTime + duration);
      };

      // Helper 2: Sparkle / Glissando Chime
      const playSparkle = (freq: number, startTime: number, vol = 0.18) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.18);
      };

      // Helper 3: Pop / Party Popper
      const playPop = (startTime: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, startTime);
        osc.frequency.exponentialRampToValueAtTime(200, startTime + 0.07);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.07);
      };

      // Helper 4: Cheerful Stabs / Chords
      const playStab = (freqs: number[], startTime: number, duration: number, vol = 0.22) => {
        freqs.forEach(f => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, startTime);
          gain.gain.setValueAtTime(vol, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
        });
      };

      const t = now;

      // --- FX Pembuka: Pop Party Popper & Sparkles Arpeggio ---
      playPop(t + 0.00);
      playSparkle(1046.50, t + 0.02); // C6
      playSparkle(1318.51, t + 0.07); // E6
      playSparkle(1567.98, t + 0.12); // G6
      playSparkle(2093.00, t + 0.17); // C7

      // --- Moti1: Melodi Ceria Bouncy Marimba ---
      playPluck(523.25, t + 0.22, 0.18, 0.38); // C5
      playPluck(659.25, t + 0.34, 0.18, 0.38); // E5
      playPluck(783.99, t + 0.46, 0.18, 0.40); // G5
      playPluck(880.00, t + 0.58, 0.18, 0.40); // A5
      playPluck(783.99, t + 0.70, 0.25, 0.42); // G5
      playStab([261.63, 329.63, 392.00], t + 0.22, 0.45, 0.20); // Bass Chord C

      // --- Motif 2: Melodi Naik Lincah ---
      playPop(t + 0.85);
      playPluck(1046.50, t + 0.88, 0.16, 0.42); // C6
      playPluck(987.77,  t + 1.00, 0.16, 0.38); // B5
      playPluck(880.00,  t + 1.12, 0.16, 0.38); // A5
      playPluck(783.99,  t + 1.24, 0.16, 0.40); // G5
      playPluck(659.25,  t + 1.36, 0.16, 0.38); // E5
      playPluck(698.46,  t + 1.48, 0.16, 0.38); // F5
      playPluck(783.99,  t + 1.60, 0.28, 0.42); // G5
      playStab([349.23, 440.00, 523.25], t + 0.88, 0.45, 0.20); // Bass Chord F

      // --- Motif 3: Puncak Selebrasi Meriah (Rapid Chime Run & Grand Chords) ---
      playSparkle(1318.51, t + 1.75); // E6
      playSparkle(1567.98, t + 1.83); // G6
      playSparkle(1760.00, t + 1.91); // A6
      playSparkle(2093.00, t + 1.99); // C7

      // Stabs Selebrasi Beruntun Ceria: C -> F -> G -> C Grand Finale
      playStab([523.25, 659.25, 783.99],          t + 2.08, 0.22, 0.32); // C Major
      playStab([587.33, 698.46, 880.00],          t + 2.32, 0.22, 0.32); // Dm/F Major
      playStab([783.99, 987.77, 1174.66],         t + 2.56, 0.24, 0.35); // G Major
      playStab([1046.50, 1318.51, 1567.98, 2093], t + 2.82, 0.85, 0.42); // C6 Grand Victory

      // Sparkles Akhir
      playSparkle(2637.02, t + 2.85, 0.15); // E7
      playSparkle(3135.96, t + 2.95, 0.15); // G7
      playSparkle(4186.01, t + 3.05, 0.15); // C8
    } catch (e) {
      console.warn('Gagal memutar audio winner:', e);
    }
  };

  playCycle();
  winnerSoundIntervalId = setInterval(playCycle, 3800);
};

export const playSoundWinner = () => {
  startSoundWinnerLoop();
};

let waitingSoundIntervalId: any = null;

export const stopSoundWaiting = () => {
  if (waitingSoundIntervalId) {
    clearInterval(waitingSoundIntervalId);
    waitingSoundIntervalId = null;
  }
};

export const startSoundWaitingLoop = () => {
  stopSoundWaiting();

  const playCycle = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const t = now;

      // 1. Bass Pulse (Tegang / Rhythmic)
      const playBass = (freq: number, startTime: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, startTime);
        filter.frequency.exponentialRampToValueAtTime(100, startTime + 0.3);

        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      };

      // 2. Chime/Marimba (Ceria / Meriah)
      const playChime = (freq: number, startTime: number, vol = 0.12) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.6);
      };

      // 3. Tension Sweep (Meriah / Nyaring)
      const playSweep = (startFreq: number, endFreq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(startFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
        
        gain.gain.setValueAtTime(0.04, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // 4. Tick (Waktu / Urgency)
      const playTick = (startTime: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1000, startTime);
        osc.frequency.exponentialRampToValueAtTime(100, startTime + 0.05);
        
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.05);
      };

      // --- SEQUENCE (4 seconds loop) ---
      // Bass pulsing every beat (0.5s intervals)
      for(let i=0; i<8; i++) {
         const beat = t + (i * 0.5);
         // Chord progression: C Major -> D Major for an uplifting, suspenseful feel
         playBass(i < 4 ? 130.81 : 146.83, beat); 
         // Ticking on off-beats for tension
         if(i % 2 !== 0) playTick(beat - 0.25);
      }

      // Melody 1: C Major Arpeggio (Ceria)
      playChime(523.25, t + 0.0); // C5
      playChime(659.25, t + 0.5); // E5
      playChime(783.99, t + 1.0); // G5
      playChime(1046.50, t + 1.5); // C6

      // Melody 2: D Major Arpeggio (Meriah/Naik tensi)
      playChime(587.33, t + 2.0); // D5
      playChime(739.99, t + 2.5); // F#5
      playChime(880.00, t + 3.0); // A5
      playChime(1174.66, t + 3.5); // D6

      // Sweep effects at the end of each bar
      playSweep(800, 1200, t + 1.5, 0.4);
      playSweep(1200, 2000, t + 3.5, 0.4);

    } catch (e) {
      console.warn('Gagal memutar audio waiting:', e);
    }
  };

  playCycle();
  waitingSoundIntervalId = setInterval(playCycle, 4000); // Repeat every 4 seconds
};

// --- SANTRI MILIARDER (WHO WANTS TO BE A MILLIONAIRE INDONESIA STYLE) EFEK SUARA ---

let miliarderLobbyIntervalId: any = null;
let miliarderSuspenseIntervalId: any = null;
let miliarderGameOverIntervalId: any = null;

export const stopMiliarderLobbyLoop = () => {
  if (miliarderLobbyIntervalId) {
    clearInterval(miliarderLobbyIntervalId);
    miliarderLobbyIntervalId = null;
  }
};

export const stopMiliarderGameOverLoop = () => {
  if (miliarderGameOverIntervalId) {
    clearInterval(miliarderGameOverIntervalId);
    miliarderGameOverIntervalId = null;
  }
};

/**
 * Memutar musik latar belakang Halaman Utama (Main Theme/Lobby Loop) khas Who Wants to Be a Millionaire Indonesia
 */
export const startMiliarderLobbyLoop = () => {
  stopMiliarderLobbyLoop();
  stopMiliarderSuspenseLoop();
  stopMiliarderGameOverLoop();

  const playLobbyBeat = () => {
    if (callAndroidNativeSound('miliarder_lobby')) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const volume = 0.50; // Increased volume for main lobby theme

      // 1. Epic Millionaire Chord Progression (Eb minor -> Ab minor -> Bb major)
      const chordNotes = [
        [155.56, 185.00, 233.08, 311.13], // Eb minor (Eb3, Gb3, Bb3, Eb4)
        [164.81, 207.65, 246.94, 329.63], // E/Ab minor
        [116.54, 146.83, 174.61, 233.08]  // Bb major
      ];

      chordNotes.forEach((chord, chordIdx) => {
        const timeOffset = chordIdx * 1.2;
        chord.forEach((freq, noteIdx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + timeOffset);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(500, now + timeOffset);
          filter.frequency.exponentialRampToValueAtTime(1800, now + timeOffset + 0.6);
          filter.frequency.exponentialRampToValueAtTime(400, now + timeOffset + 1.1);

          gain.gain.setValueAtTime(0.001, now + timeOffset);
          gain.gain.linearRampToValueAtTime(volume * 0.45, now + timeOffset + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 1.15);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + timeOffset);
          osc.stop(now + timeOffset + 1.15);
        });

        // Bass thud for each chord
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'square';
        bassOsc.frequency.setValueAtTime(chord[0] * 0.5, now + timeOffset);
        bassOsc.frequency.exponentialRampToValueAtTime(chord[0] * 0.25, now + timeOffset + 0.4);

        bassGain.gain.setValueAtTime(volume * 0.6, now + timeOffset);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.5);

        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start(now + timeOffset);
        bassOsc.stop(now + timeOffset + 0.5);
      });

      // 2. High Arpeggiated Chime Sweep (Who Wants to Be a Millionaire signature bell)
      const arpeggio = [622.25, 739.99, 932.33, 1244.51, 1479.98, 1864.66];
      arpeggio.forEach((freq, idx) => {
        const startTime = now + (idx * 0.12);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(volume * 0.5, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });

    } catch (e) {
      console.warn('Gagal memutar lobby loop:', e);
    }
  };

  playLobbyBeat();
  miliarderLobbyIntervalId = setInterval(playLobbyBeat, 3600);
};

export const stopMiliarderSuspenseLoop = () => {
  if (miliarderSuspenseIntervalId) {
    clearInterval(miliarderSuspenseIntervalId);
    miliarderSuspenseIntervalId = null;
  }
};

/**
 * Memutar musik latar belakang tegang (Suspense Loop) khas Who Wants to Be a Millionaire
 */
export const startMiliarderSuspenseLoop = (level: number = 1) => {
  stopMiliarderSuspenseLoop();

  const playSuspenseBeat = () => {
    if (callAndroidNativeSound('miliarder_suspense')) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Pitch & tempo adjust based on level tier
      const baseFreq = level <= 10 ? 110 : (level <= 50 ? 130.81 : 146.83); // A2, C3, D3
      const volume = level <= 10 ? 0.18 : (level <= 50 ? 0.22 : 0.26);

      // 1. Low Thumping Heartbeat Bass (Dum... Dum...)
      const playBassBeat = (timeOffset: number, freq: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + timeOffset);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + timeOffset + 0.35);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, now + timeOffset);
        filter.frequency.exponentialRampToValueAtTime(60, now + timeOffset + 0.35);

        gain.gain.setValueAtTime(volume * 0.8, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.35);
      };

      // Heartbeat pulse: beat at t=0 and t=0.28
      playBassBeat(0.0, baseFreq);
      playBassBeat(0.28, baseFreq * 0.9);

      // 2. Eerie Ambient Synth Drone Pad (Fifth interval hold)
      const playPadTone = (freq: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      };

      playPadTone(baseFreq * 2, 1.8);
      playPadTone(baseFreq * 3, 1.8); // Fifth interval

      // 3. Subtle Ticking Clock Overlay
      const tickOsc = ctx.createOscillator();
      const tickGain = ctx.createGain();
      tickOsc.type = 'triangle';
      tickOsc.frequency.setValueAtTime(1200, now + 0.9);
      tickGain.gain.setValueAtTime(volume * 0.15, now + 0.9);
      tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.98);
      tickOsc.connect(tickGain);
      tickGain.connect(ctx.destination);
      tickOsc.start(now + 0.9);
      tickOsc.stop(now + 0.98);

    } catch (e) {
      console.warn('Gagal memutar suspense loop:', e);
    }
  };

  playSuspenseBeat();
  miliarderSuspenseIntervalId = setInterval(playSuspenseBeat, 1800);
};

/**
 * Efek Kunci Jawaban / "Final Answer" Lock Sound (Millionaire Style)
 * Dimainkan saat user memilih jawaban
 */
export const playMiliarderLockAnswer = () => {
  stopMiliarderSuspenseLoop();
  if (callAndroidNativeSound('miliarder_lock')) {
    triggerAndroidVibration(120);
    return;
  }

  triggerAndroidVibration(120);

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // 1. Heavy Lock Thud / Metallic Impact
    const oscThud = ctx.createOscillator();
    const gainThud = ctx.createGain();
    oscThud.type = 'square';
    oscThud.frequency.setValueAtTime(220, now);
    oscThud.frequency.exponentialRampToValueAtTime(55, now + 0.3);

    gainThud.gain.setValueAtTime(0.45, now);
    gainThud.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    oscThud.connect(gainThud);
    gainThud.connect(ctx.destination);
    oscThud.start(now);
    oscThud.stop(now + 0.35);

    // 2. High Lock Brass / Bell Lock Chime
    const oscLock = ctx.createOscillator();
    const gainLock = ctx.createGain();
    oscLock.type = 'triangle';
    oscLock.frequency.setValueAtTime(880, now);
    oscLock.frequency.exponentialRampToValueAtTime(1760, now + 0.15);

    gainLock.gain.setValueAtTime(0.35, now);
    gainLock.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    oscLock.connect(gainLock);
    gainLock.connect(ctx.destination);
    oscLock.start(now);
    oscLock.stop(now + 0.25);

    // 3. Escalating Tension Swell (Building anticipation before answer reveal)
    const oscSwell = ctx.createOscillator();
    const gainSwell = ctx.createGain();
    const filterSwell = ctx.createBiquadFilter();

    oscSwell.type = 'sawtooth';
    oscSwell.frequency.setValueAtTime(110, now + 0.2);
    oscSwell.frequency.linearRampToValueAtTime(220, now + 1.3);

    filterSwell.type = 'lowpass';
    filterSwell.frequency.setValueAtTime(150, now + 0.2);
    filterSwell.frequency.exponentialRampToValueAtTime(1200, now + 1.3);

    gainSwell.gain.setValueAtTime(0.05, now + 0.2);
    gainSwell.gain.linearRampToValueAtTime(0.30, now + 1.2);
    gainSwell.gain.exponentialRampToValueAtTime(0.001, now + 1.35);

    oscSwell.connect(filterSwell);
    filterSwell.connect(gainSwell);
    gainSwell.connect(ctx.destination);

    oscSwell.start(now + 0.2);
    oscSwell.stop(now + 1.35);

  } catch (e) {
    console.warn('Gagal memutar miliarder lock answer:', e);
  }
};

/**
 * Efek Tepuk Tangan Penonton Meriah (Crowd Applause)
 */
export const playMiliarderApplause = (durationSec = 2.4) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * durationSec);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(0.8, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.32, now + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseNode.start(now);
    noiseNode.stop(now + durationSec);

    // Add extra randomized clap bursts for realism
    for (let i = 0; i < 30; i++) {
      const clapTime = now + 0.05 + Math.random() * (durationSec - 0.3);
      const osc = ctx.createOscillator();
      const clapGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500 + Math.random() * 900, clapTime);

      clapGain.gain.setValueAtTime(0.18, clapTime);
      clapGain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.04);

      osc.connect(clapGain);
      clapGain.connect(ctx.destination);

      osc.start(clapTime);
      osc.stop(clapTime + 0.04);
    }
  } catch (e) {
    console.warn('Gagal memutar applause:', e);
  }
};

/**
 * Efek Jawaban Benar Khas Who Wants to Be a Millionaire
 */
export const playMiliarderCorrect = (level: number = 1) => {
  stopMiliarderSuspenseLoop();
  
  // Play crowd applause
  playMiliarderApplause(level % 10 === 0 || level === 100 ? 3.5 : 2.2);

  if (callAndroidNativeSound('miliarder_correct')) {
    triggerAndroidVibration([80, 50, 100, 50, 150]);
    return;
  }

  triggerAndroidVibration([80, 50, 100, 50, 150]);

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const isMilestone = level % 10 === 0 || level === 100;

    // Helper: Play Orchestral Brass / Synth Stabs
    const playStab = (freqs: number[], startTime: number, duration: number, vol = 0.35) => {
      freqs.forEach(f => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, startTime);

        gain.gain.setValueAtTime(vol, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    };

    // Helper: Bell Glissando
    const playChime = (freq: number, startTime: number, duration: number, vol = 0.25) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // --- Millionaire Iconic Reveal Sting ---
    // Part 1: Sudden Resolution Stab (C Major / G Major)
    playStab([261.63, 329.63, 392.00, 523.25], now + 0.0, 0.4, 0.38); // Low C Major
    playChime(1046.50, now + 0.0, 0.6, 0.30); // C6 chime

    // Part 2: Upward Rapid Chime Scale (Millionaire Win Flourish)
    const scale = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
    scale.forEach((freq, idx) => {
      playChime(freq, now + 0.15 + (idx * 0.06), 0.5, 0.28);
    });

    // Part 3: Grand Triumph Sustained Chord
    const chordTime = now + 0.65;
    const chordDuration = isMilestone ? 2.5 : 1.6;

    playStab([523.25, 659.25, 783.99, 1046.50, 1318.51], chordTime, chordDuration, isMilestone ? 0.45 : 0.35);

    if (isMilestone) {
      // Extra celebratory fanfare for Titik Aman / Level 100!
      playChime(2637.02, chordTime + 0.2, 1.2, 0.30); // E7
      playChime(3135.96, chordTime + 0.4, 1.5, 0.30); // G7
      playChime(4186.01, chordTime + 0.6, 1.8, 0.35); // C8
    }

  } catch (e) {
    console.warn('Gagal memutar miliarder correct:', e);
  }
};

/**
 * Efek Jawaban Salah Khas Who Wants to Be a Millionaire (Crash Disonan Bawah)
 */
export const playMiliarderWrong = () => {
  stopMiliarderSuspenseLoop();
  if (callAndroidNativeSound('miliarder_wrong')) {
    triggerAndroidVibration([250, 100, 300]);
    return;
  }

  triggerAndroidVibration([250, 100, 300]);

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // 1. Heavy Low Brass Dissonant Crash (Low Eb Diminished / Minor Stinger)
    const freqs = [116.54, 138.59, 164.81, 233.08]; // Bb2, C#3, E3, Bb3
    freqs.forEach(f => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.linearRampToValueAtTime(f * 0.7, now + 1.2); // Sliding down into darkness

      gain.gain.setValueAtTime(0.42, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.4);
    });

    // 2. Sub-bass Crash Thud
    const oscSub = ctx.createOscillator();
    const gainSub = ctx.createGain();
    oscSub.type = 'square';
    oscSub.frequency.setValueAtTime(80, now);
    oscSub.frequency.exponentialRampToValueAtTime(30, now + 0.8);

    gainSub.gain.setValueAtTime(0.50, now);
    gainSub.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    oscSub.connect(gainSub);
    gainSub.connect(ctx.destination);

    oscSub.start(now);
    oscSub.stop(now + 0.9);

  } catch (e) {
    console.warn('Gagal memutar miliarder wrong:', e);
  }
};

/**
 * Bantuan 50:50 Sound (Dual Zap/Swoosh)
 */
export const playMiliarderLifeline5050 = () => {
  if (callAndroidNativeSound('miliarder_5050')) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    const playSwoosh = (timeOffset: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(200, now + timeOffset + 0.25);

      gain.gain.setValueAtTime(0.35, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.25);
    };

    playSwoosh(0.0);
    playSwoosh(0.2);

  } catch (e) {
    console.warn('Gagal memutar 5050 sound:', e);
  }
};

/**
 * Bantuan Tanya Ustadz / Ahli Sound (Phone Dial & Ringing)
 */
export const playMiliarderLifelinePhone = () => {
  if (callAndroidNativeSound('miliarder_phone')) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // DTMF Phone Beeps
    const dtmfFreqs = [[697, 1209], [770, 1336], [852, 1477]];
    dtmfFreqs.forEach((pair, idx) => {
      const startTime = now + (idx * 0.12);
      pair.forEach(f => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, startTime);

        gain.gain.setValueAtTime(0.20, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.08);
      });
    });

    // Telephone Ringing tone (t = 0.5s to 1.2s)
    const ringTime = now + 0.5;
    [440, 480].forEach(f => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ringTime);

      gain.gain.setValueAtTime(0.25, ringTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ringTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ringTime);
      osc.stop(ringTime + 0.7);
    });

  } catch (e) {
    console.warn('Gagal memutar phone sound:', e);
  }
};

/**
 * Bantuan Tanya Santri / Audience Sound (Ascending Chime Sweep)
 */
export const playMiliarderLifelineAudience = () => {
  if (callAndroidNativeSound('miliarder_audience')) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];

    notes.forEach((freq, idx) => {
      const startTime = now + (idx * 0.08);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });

  } catch (e) {
    console.warn('Gagal memutar audience sound:', e);
  }
};

/**
 * Bantuan Tambahan Waktu Sound (Time Extension Chime)
 */
export const playMiliarderLifelineTime = () => {
  if (callAndroidNativeSound('miliarder_time')) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      const startTime = now + (idx * 0.1);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.30, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });

  } catch (e) {
    console.warn('Gagal memutar time sound:', e);
  }
};

/**
 * Cash Out / Walkaway Sound
 */
export const playMiliarderCashout = () => {
  stopMiliarderSuspenseLoop();
  if (callAndroidNativeSound('miliarder_cashout')) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [659.25, 587.33, 523.25, 392.00, 523.25]; // E5, D5, C5, G4, C5

    notes.forEach((freq, idx) => {
      const startTime = now + (idx * 0.18);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.32, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });

  } catch (e) {
    console.warn('Gagal memutar cashout sound:', e);
  }
};

/**
 * Efek Suara Loop Halaman Game Over / Kalah (Sayang Sekali, jawaban kurang tepat atau waktu habis)
 */
export const startMiliarderGameOverLoop = () => {
  stopMiliarderGameOverLoop();
  stopMiliarderLobbyLoop();
  stopMiliarderSuspenseLoop();

  const playGameOverBeat = () => {
    if (callAndroidNativeSound('miliarder_gameover_loop')) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const volume = 0.40;

      // 1. Dissonant Melancholic Minor Melody (Eb4 -> Db4 -> C4 -> B3 -> Bb3)
      const melody = [311.13, 277.18, 261.63, 246.94, 233.08];
      melody.forEach((freq, idx) => {
        const startTime = now + (idx * 0.35);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.98, startTime + 0.5);

        gain.gain.setValueAtTime(volume * 0.8, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.55);
      });

      // 2. Heavy Sub-Bass Defeat Gong / Drone Pad (t = 1.6s)
      const gongTime = now + 1.6;
      const oscGong = ctx.createOscillator();
      const gainGong = ctx.createGain();
      const filterGong = ctx.createBiquadFilter();

      oscGong.type = 'sawtooth';
      oscGong.frequency.setValueAtTime(116.54, gongTime); // Low Bb2
      oscGong.frequency.exponentialRampToValueAtTime(58.27, gongTime + 2.4);

      filterGong.type = 'lowpass';
      filterGong.frequency.setValueAtTime(300, gongTime);
      filterGong.frequency.exponentialRampToValueAtTime(60, gongTime + 2.4);

      gainGong.gain.setValueAtTime(volume, gongTime);
      gainGong.gain.exponentialRampToValueAtTime(0.001, gongTime + 2.4);

      oscGong.connect(filterGong);
      filterGong.connect(gainGong);
      gainGong.connect(ctx.destination);

      oscGong.start(gongTime);
      oscGong.stop(gongTime + 2.4);

    } catch (e) {
      console.warn('Gagal memutar gameover loop:', e);
    }
  };

  playGameOverBeat();
  miliarderGameOverIntervalId = setInterval(playGameOverBeat, 4200);
};

/**
 * Single-shot Efek Suara Halaman Game Over / Kalah
 */
export const playMiliarderGameOver = () => {
  stopMiliarderLobbyLoop();
  stopMiliarderSuspenseLoop();

  if (callAndroidNativeSound('miliarder_gameover')) {
    triggerAndroidVibration([300, 150, 400]);
    return;
  }

  triggerAndroidVibration([300, 150, 400]);

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // 1. Dissonant Melancholic Minor Melody (Eb4 -> Db4 -> C4 -> B3 -> Bb3)
    const melody = [311.13, 277.18, 261.63, 246.94, 233.08];
    melody.forEach((freq, idx) => {
      const startTime = now + (idx * 0.35);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, startTime + 0.5);

      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.55);
    });

    // 2. Heavy Sub-Bass Defeat Gong (t = 1.6s)
    const gongTime = now + 1.6;
    const oscGong = ctx.createOscillator();
    const gainGong = ctx.createGain();
    const filterGong = ctx.createBiquadFilter();

    oscGong.type = 'sawtooth';
    oscGong.frequency.setValueAtTime(116.54, gongTime); // Low Bb2
    oscGong.frequency.exponentialRampToValueAtTime(58.27, gongTime + 2.5);

    filterGong.type = 'lowpass';
    filterGong.frequency.setValueAtTime(300, gongTime);
    filterGong.frequency.exponentialRampToValueAtTime(60, gongTime + 2.5);

    gainGong.gain.setValueAtTime(0.50, gongTime);
    gainGong.gain.exponentialRampToValueAtTime(0.001, gongTime + 2.5);

    oscGong.connect(filterGong);
    filterGong.connect(gainGong);
    gainGong.connect(ctx.destination);

    oscGong.start(gongTime);
    oscGong.stop(gongTime + 2.5);

  } catch (e) {
    console.warn('Gagal memutar miliarder gameover:', e);
  }
};

export const stopAllQuizLoops = () => {
  stopSoundWinner();
  stopSoundCancelled();
  stopSoundWaiting();
  stopMiliarderLobbyLoop();
  stopMiliarderSuspenseLoop();
  stopMiliarderGameOverLoop();
};

// Global reference array to prevent V8 garbage collection of SpeechSynthesisUtterance in Chrome / Android WebView
if (typeof window !== 'undefined') {
  (window as any)._activeUtterances = (window as any)._activeUtterances || [];

  window.addEventListener('beforeunload', stopAllQuizLoops);
  window.addEventListener('pagehide', stopAllQuizLoops);
  window.addEventListener('popstate', stopAllQuizLoops);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAllQuizLoops();
    }
  });
}

/**
 * Efek Suara Notifikasi Baru (Crystal Bell Chime)
 * Menghasilkan nada lonceng jernih dan manis dua tingkat (A5 -> E6) dengan harmonik lembut
 */
export const playNotificationSound = () => {
  triggerAndroidVibration([50, 40, 70]);

  if (callAndroidNativeSound('notification')) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Helper untuk membuat nada lonceng sintetis jernih
    const createChimeTone = (freq: number, startTime: number, duration: number, peakGain: number) => {
      // Fundamental oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Soft attack to avoid clicks, then natural exponential decay
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);

      // Harmonic overtone (2x frequency) for crystal shimmer
      const overtoneOsc = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtoneOsc.type = 'sine';
      overtoneOsc.frequency.setValueAtTime(freq * 2, startTime);

      overtoneGain.gain.setValueAtTime(0.0001, startTime);
      overtoneGain.gain.linearRampToValueAtTime(peakGain * 0.35, startTime + 0.01);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.6);

      overtoneOsc.connect(overtoneGain);
      overtoneGain.connect(ctx.destination);
      overtoneOsc.start(startTime);
      overtoneOsc.stop(startTime + duration * 0.6);
    };

    // Nada pertama: A5 (880 Hz)
    createChimeTone(880, now, 0.45, 0.40);
    // Nada kedua: E6 (1318.5 Hz) 120ms setelah nada pertama
    createChimeTone(1318.5, now + 0.12, 0.65, 0.45);

  } catch (e) {
    console.warn('Gagal memutar suara notifikasi:', e);
  }
};

/**
 * Sistem Sintesis Suara Text-to-Speech (TTS) - Diberhentikan/Nonaktif sesuai permintaan pengguna.
 */
export const speakAndroidText = (_text: string, _isMuted: boolean = false) => {
  // TTS dinonaktifkan sepenuhnya
  return;
};
