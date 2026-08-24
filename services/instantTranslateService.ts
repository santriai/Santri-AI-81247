import { createWorker } from 'tesseract.js';

let tesseractWorker: any = null;
let currentWorkerLang: string = '';

/**
 * Get or initialize Tesseract worker with specific language.
 * Uses 'ara' for Arabic, 'ind' or 'eng' for Latin/Indonesian.
 */
async function getTesseractWorker(lang: 'ara' | 'ind' | 'ara+ind'): Promise<any> {
  if (tesseractWorker && currentWorkerLang === lang) {
    return tesseractWorker;
  }

  if (tesseractWorker) {
    try {
      await tesseractWorker.terminate();
    } catch (e) {
      console.warn('Error terminating previous worker:', e);
    }
    tesseractWorker = null;
  }

  const worker = await createWorker(lang);
  tesseractWorker = worker;
  currentWorkerLang = lang;
  return worker;
}

/**
 * Preprocess image on canvas (increase contrast and grayscale) to improve OCR recognition on Arabic/Kitab text
 */
export function preprocessImageForOcr(imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const width = (imageElement as HTMLVideoElement).videoWidth || imageElement.width || 800;
  const height = (imageElement as HTMLVideoElement).videoHeight || imageElement.height || 600;

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(imageElement, 0, 0, width, height);

  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Apply high-contrast grayscale binarization filter
    for (let i = 0; i < data.length; i += 4) {
      const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      // Contrast stretch
      const adjusted = avg < 140 ? avg * 0.7 : Math.min(255, avg * 1.25);
      data[i] = adjusted;
      data[i + 1] = adjusted;
      data[i + 2] = adjusted;
    }
    ctx.putImageData(imageData, 0, 0);
  } catch (e) {
    console.warn('Canvas image filtering error:', e);
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Perform local optical character recognition (OCR) on client device without AI
 */
export async function performClientOCR(
  imageSource: string | HTMLCanvasElement | File | Blob,
  lang: 'ara' | 'ind' | 'ara+ind' = 'ara'
): Promise<string> {
  const worker = await getTesseractWorker(lang);
  const result = await worker.recognize(imageSource);
  const text = (result.data?.text || '').trim();
  return text;
}

/**
 * Instant Translation without AI (using direct translation service)
 */
export async function instantTranslateText(
  text: string,
  from: 'ar' | 'id' = 'ar',
  to: 'id' | 'ar' = 'id'
): Promise<string> {
  if (!text || !text.trim()) return '';

  const cleanText = text.trim();

  // Try Google Translate public client endpoint first
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(cleanText)}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedSegments = data[0].map((item: any) => item[0]).filter(Boolean);
        const combined = translatedSegments.join('');
        if (combined.trim()) {
          return combined.trim();
        }
      }
    }
  } catch (e) {
    console.warn('Google public translate error, trying fallback:', e);
  }

  // Fallback: MyMemory Translation API (Free tier)
  try {
    const pair = `${from}|${to}`;
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=${pair}`;
    const mmRes = await fetch(myMemoryUrl);
    if (mmRes.ok) {
      const mmData = await mmRes.json();
      if (mmData.responseData?.translatedText) {
        return mmData.responseData.translatedText;
      }
    }
  } catch (e) {
    console.warn('MyMemory translate error:', e);
  }

  return 'Gagal memuat terjemahan otomatis. Silakan coba kembali atau gunakan tombol Terjemah AI.';
}

/**
 * Combined Live Scan and Instant Translation
 */
export async function instantScanAndTranslate(
  imageSource: string | HTMLCanvasElement | File | Blob,
  mode: 'ar-id' | 'id-ar' = 'ar-id',
  onProgress?: (step: string) => void
): Promise<{ originalText: string; translatedText: string }> {
  onProgress?.('Membaca teks dari gambar (OCR lokal)...');
  const ocrLang = mode === 'ar-id' ? 'ara' : 'ind';
  const originalText = await performClientOCR(imageSource, ocrLang);

  if (!originalText) {
    throw new Error('Tidak ada teks yang berhasil dibaca. Pastikan tulisan terlihat jelas dan tidak buram.');
  }

  onProgress?.('Menerjemahkan secara instan (tanpa AI)...');
  const fromLang = mode === 'ar-id' ? 'ar' : 'id';
  const toLang = mode === 'ar-id' ? 'id' : 'ar';
  const translatedText = await instantTranslateText(originalText, fromLang, toLang);

  return {
    originalText,
    translatedText
  };
}
