import { GoogleGenAI, Modality, ThinkingLevel } from "@google/genai";
import { GEMINI_MODEL, GEMINI_MODELS_ROTATION, SYSTEM_INSTRUCTION, DEFAULT_AI_CONFIG } from "../constants";
import { QuizQuestion, EssayQuestion } from "../types";
import { fetchFromGitHub, saveToGitHub, fetchListFromGitHub, fetchSimilarFromGitHub } from "./githubDataService";

// Helper to log public activities for the social feed
const logToPublicFeed = (featureName: string, query: string, result: any, type: string) => {
    queueBackgroundTask(async () => {
        // Redirecting activity log to GitHub for now (as a summary file or per-activity file)
        const summary = { featureName, query, type, timestamp: new Date().toISOString() };
        await saveToGitHub('activities', `activity-${Date.now()}`, summary);
    });
};

// --- QUEUE SYSTEM FOR BACKGROUND TASKS ---
const requestQueue: (() => Promise<void>)[] = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const task = requestQueue.shift();
    if (task) {
      try {
        await task();
      } catch (e) {
        console.warn("[Background] Task failed/skipped:", e);
      }
      // Delay 4 detik antar request background agar tidak kena Rate Limit
      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  }
  isProcessingQueue = false;
};

export const queueBackgroundTask = (task: () => Promise<void>) => {
  requestQueue.push(task);
  processQueue();
};

// --- GITHUB CACHE WRAPPERS ---
const fetchGlobalCache = async (key: string, category: string) => {
  return fetchFromGitHub(`cache-${category}`, key);
};

const saveGlobalCache = async (key: string, data: any, category: string, model?: string) => {
  return saveToGitHub(`cache-${category}`, key, { ...data, _cached_at: new Date().toISOString(), _model: model });
};

// --- CORE UTILS ---

const cleanJson = (text: string) => {
  if (!text) return "{}";
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '');
  cleaned = cleaned.replace(/```json\s*([\s\S]*?)\s*```/gi, '$1');
  cleaned = cleaned.replace(/```\s*([\s\S]*?)\s*```/gi, '$1');

  cleaned = cleaned.replace(/[“”]/g, '"');

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');

  let start = -1;
  let end = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      start = firstBrace;
      end = lastBrace;
  } else if (firstBracket !== -1) {
      start = firstBracket;
      end = lastBracket;
  }

  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  } else if (start !== -1 && end === -1) {
    cleaned = cleaned.substring(start);
  }
  
  return cleaned.trim();
};

const parseJsonSafely = (rawText: string) => {
  if (!rawText) return {};
  const cleaned = cleanJson(rawText);

  // 1. Direct parse
  try {
    return JSON.parse(cleaned);
  } catch (e1) {}

  // 2. Remove trailing commas
  try {
    const fixedCommas = cleaned.replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(fixedCommas);
  } catch (e2) {}

  // 3. Remove comments and trailing commas
  try {
    const noComments = cleaned
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
      .replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(noComments);
  } catch (e3) {}

  // 4. Fix truncated JSON (unclosed strings, braces, brackets)
  try {
    let repaired = cleaned.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '').replace(/,\s*([}\]])/g, '$1');
    let inString = false;
    let escaped = false;
    for (let i = 0; i < repaired.length; i++) {
      const ch = repaired[i];
      if (ch === '\\' && !escaped) {
        escaped = true;
      } else {
        if (ch === '"' && !escaped) {
          inString = !inString;
        }
        escaped = false;
      }
    }
    if (inString) {
      repaired += '"';
    }
    repaired = repaired.trim().replace(/,\s*$/, '');

    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;

    for (let i = 0; i < (openBrackets - closeBrackets); i++) repaired += ']';
    for (let i = 0; i < (openBraces - closeBraces); i++) repaired += '}';

    return JSON.parse(repaired);
  } catch (e4) {}

  // 5. Safe structured fallback
  console.warn("JSON Parse Failed completely, returning structured fallback object.");
  const cleanBody = rawText.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/```[\s\S]*?```/g, '').trim();
  return {
    syarah: cleanBody || rawText,
    modernTranslation: cleanBody || rawText,
    maknaGandul: "Makna gandul otomatis belum dapat dimuat secara rinci.",
    nahwuShorof: "Periksa kitab syarah untuk analisis i'rab mendalam.",
    aiExplanation: cleanBody || rawText
  };
};

export const getRotatedGeminiClient = (attempt = 0): GoogleGenAI => {
  const rawKey = process.env.GEMINI_API_KEY || "";
  const keys = rawKey.split(',').map(k => k.trim()).filter(Boolean);
  
  let apiKey = rawKey;
  if (keys.length > 0) {
    const startIndex = attempt === 0 ? Math.floor(Math.random() * keys.length) : attempt;
    apiKey = keys[startIndex % keys.length];
  }
  return new GoogleGenAI({ apiKey });
};

export const getRotatedGeminiModel = (attempt = 0): string => {
  if (!GEMINI_MODELS_ROTATION || GEMINI_MODELS_ROTATION.length === 0) return GEMINI_MODEL;
  return GEMINI_MODELS_ROTATION[attempt % GEMINI_MODELS_ROTATION.length];
};

const callWithRetry = async <T>(fn: (ai: GoogleGenAI, model: string) => Promise<T>, retries = 3, attempt = 0): Promise<T> => {
  const ai = getRotatedGeminiClient(attempt);
  const model = getRotatedGeminiModel(attempt);

  try {
    return await fn(ai, model);
  } catch (error: any) {
    const errorMsg = String(error?.message || error || "");
    const isQuotaExceeded = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || error?.status === 429;
    const isPermissionDenied = errorMsg.includes('PERMISSION_DENIED') || errorMsg.includes('403') || errorMsg.includes('API key not valid') || errorMsg.includes('Forbidden') || errorMsg.includes('izin ditolak') || error?.status === 403;
    const isNotFound = errorMsg.includes('404') || errorMsg.includes('NOT_FOUND');

    if (retries > 0 && (isQuotaExceeded || isPermissionDenied || isNotFound)) {
      console.warn(`[Gemini API] Switching key and model (${model}) on attempt ${attempt + 1}. Retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return callWithRetry(fn, retries - 1, attempt + 1);
    }
    
    if (isQuotaExceeded) {
      throw new Error("Maaf, kuota harian API habis atau limit tercapai. Mohon coba beberapa saat lagi.");
    }

    if (isPermissionDenied) {
      throw new Error("Akses API Gemini sedang diperbarui. Silakan coba beberapa saat lagi.");
    }
    
    throw error;
  }
};

export const translateText = async (text: string): Promise<any> => {
  const searchKey = text.trim().toLowerCase().substring(0, 50);
  
  // 1. Cek GitHub
  try {
    const githubData = await fetchFromGitHub('translations', searchKey);
    if (githubData) return githubData;
  } catch (e) {}

  // 2. Cek Cache AI via GitHub (Categorized)
  const cached = await fetchFromGitHub('cache-trans', searchKey);
  if (cached) return cached;

  const result = await callWithRetry(async (ai, model) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: DEFAULT_AI_CONFIG.temperature,
        topP: DEFAULT_AI_CONFIG.topP,
        maxOutputTokens: 8192,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }, 
        responseMimeType: "application/json"
      }
    });
    if (response.text === undefined) throw new Error("Gagal mendapatkan respon dari AI.");
    return parseJsonSafely(cleanJson(response.text));
  });

  // 3. Save to GitHub Cache (Categorized)
  queueBackgroundTask(async () => {
    await saveToGitHub('cache-trans', searchKey, result);
    await saveToGitHub('translations', searchKey, result);
  });
  
  return result;
};

// --- SPECIALIZED KITAB & BIOGRAPHY FUNCTIONS ---

// Helper to get normalized folder name for a category based on user request
export const getCategoryFolder = (category: string = '') => {
    const raw = (category || '').toLowerCase().trim();
    if (!raw) return 'umum';
    
    // 1. Pemetaan Langsung yang Presisi berdasarkan ID Aplikasi
    if (raw === 'tafsir' || raw === 'tafsir-alquran' || raw === 'tafsir_alquran') return 'tafsir-alquran';
    if (raw === 'hadits' || raw === 'hadit' || raw === 'hadis' || raw === 'hadith') return 'hadits';
    if (raw === 'akidah' || raw === 'aqidah') return 'akidah';
    if (raw === 'fiqh' || raw === 'fiqih') return 'fiqih';
    if (raw === 'ushul_fiqh' || raw === 'ushul-fiqh') return 'ushul-fiqh';
    if (raw === 'nahwu' || raw === 'nahwu-shorof' || raw === 'nahwu_shorof') return 'nahwu-shorof';
    if (raw === 'mantiq') return 'mantiq';
    if (raw === 'tasawuf' || raw === 'akhlak-tasawuf' || raw === 'akhlak_tasawuf') return 'akhlak-tasawuf';
    if (raw === 'tarikh') return 'tarikh';
    if (raw === 'sholawat') return 'sholawat';
    if (raw === 'maulid') return 'maulid';
    if (raw === 'ratib') return 'ratib';
    if (raw === 'manaqib') return 'manaqib';
    if (raw === 'hikmah' || raw === 'ilmu-hikmah' || raw === 'ilmu_hikmah') return 'hikmah';
    if (raw === 'tajwid') return 'tajwid';
    if (raw === 'nadhom' || raw === 'nadhom-arudh') return 'nadhom';

    // 2. Pencocokan Kata Kunci Cadangan (Fallback Wildcard)
    if (raw.includes('tafsir') || raw.includes('quran') || raw.includes('alquran')) return 'tafsir-alquran';
    if (raw.includes('hadis') || raw.includes('hadits') || raw.includes('hadith')) return 'hadits';
    if (raw.includes('fiqih') || raw.includes('fiqh') || raw.includes('fikh') || raw.includes('hukum')) {
        if (raw.includes('ushul')) return 'ushul-fiqh';
        return 'fiqih';
    }
    if (raw.includes('ushul')) return 'ushul-fiqh';
    if (raw.includes('akidah') || raw.includes('aqidah') || raw.includes('tauhid') || raw.includes('teologi')) return 'akidah';
    if (raw.includes('tasawuf') || raw.includes('akhlak') || raw.includes('ihsan') || raw.includes('etik')) return 'akhlak-tasawuf';
    if (raw.includes('hikmah') || raw.includes('wafaq') || raw.includes('rajah') || raw.includes('ruqyah')) return 'hikmah';
    if (raw.includes('nahwu') || raw.includes('shorof') || raw.includes('sorof') || raw.includes('bahasa') || raw.includes('balaghah') || raw.includes('arudh') || raw.includes('nadhom')) {
        if (raw.includes('nadhom') || raw.includes('arudh')) return 'nadhom';
        return 'nahwu-shorof';
    }
    if (raw.includes('mantiq') || raw.includes('logika')) return 'mantiq';
    if (raw.includes('sejarah') || raw.includes('tarikh') || raw.includes('sirah') || raw.includes('biografi')) return 'tarikh';
    if (raw.includes('sholawat')) return 'sholawat';
    if (raw.includes('maulid')) return 'maulid';
    if (raw.includes('ratib')) return 'ratib';
    if (raw.includes('manaqib')) return 'manaqib';
    if (raw.includes('tajwid')) return 'tajwid';
    if (raw.includes('syamilah')) return 'maktabah-syamilah';
    if (raw.includes('kubro')) return 'maktabah-kubro';
    return 'umum';
};

// Helper to get slug for folder naming
export const getSlug = (text: string = '') => {
  const safeText = String(text || '').trim();
  const latinSlug = safeText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  let hash = 0;
  for (let i = 0; i < safeText.length; i++) {
    hash = ((hash << 5) - hash) + safeText.charCodeAt(i);
    hash |= 0;
  }
  const hashStr = Math.abs(hash).toString(36);

  if (!latinSlug) return `slug-${hashStr}`;
  if (/[^\x00-\x7F]/.test(safeText)) {
    return `${latinSlug}-${hashStr}`;
  }
  return latinSlug;
};

export const generateKitabDetail = async (bookName: string, authorName: string = '', categoryHint?: string): Promise<any> => {
    const searchName = bookName.trim();
    const bookSlug = getSlug(searchName);

    // 1. Prioritize Deep Fetch if category hint is provided
    if (categoryHint) {
        const catFolder = getCategoryFolder(categoryHint);
        try {
            const deepData = await fetchFromGitHub(`kitab/${catFolder}/${bookSlug}`, 'metadata');
            if (deepData) return { ...deepData, sourceType: 'GITHUB_STORAGE' };
        } catch (e) {}
    }

    // 2. Fallback to flat Storage (Legacy)
    try {
        const githubData = await fetchFromGitHub('kitab', searchName);
        if (githubData) return { ...githubData, sourceType: 'GITHUB_STORAGE' };
    } catch (e) {}

    // 3. Cek Cache AI via GitHub (Index)
    const cacheKey = `book_detail:${searchName}`;
    const cached = await fetchFromGitHub('cache-kitab', cacheKey);
    if (cached) return { ...cached, sourceType: 'AI_CACHE' };

    // 4. Generate AI
    const prompt = `
    Bertindaklah sebagai ahli bedah Kitab Kuning dan pustakawan Islam (Maktabah) yang sangat teliti.
    Berikan informasi detail, SANGAT LENGKAP, dan mendalam untuk kitab: "${searchName}" ${authorName ? `karya ${authorName}` : ''}.
    Pastikan informasi yang diberikan akurat sesuai dengan naskah aslinya.
    
    Output JSON (Wajib):
    {
        "name": "${searchName}",
        "originalTitle": "Judul asli kitab dalam bahasa Arab (dengan harakat)",
        "desc": "Deskripsi singkat yang merangkum inti kitab (1-2 kalimat)",
        "author": "Nama Lengkap Pengarang & Gelar (Lahir-Wafat, misal: Imam Abu Zakaria Yahya bin Syaraf an-Nawawi)",
        "year": "Tahun/Abad Lahir dan Wafat (Hijriyah & Masehi)",
        "volumes": "Jumlah Jilid (misal: 1 Jilid, 10 Jilid, dll)",
        "category": "Kategori Utama (pilih satu: Tafsir Al-Quran, Hadits, Fiqih, Ushul Fiqih, Akidah, Akhlak Tasawuf, Nahwu Shorof, Mantiq, Tarikh, Sholawat, Maulid, Ratib, Manaqib, Tajwid, Maktabah Syamilah, Maktabah Kubro, Lainnya)",
        "longDesc": "Analisis mendalam tentang isi kitab. Jelaskan latar belakang penulisan, metode (manhaj) yang digunakan pengarang, kaitan dengan mazhab tertentu, keistimewaan naskah, dan kedudukan kitab ini dalam literatur Islam. Buatlah minimal 4-5 paragraf yang sangat informatif.",
        "tableOfContentsNarrative": "Penjelasan naratif mengenai struktur pembagian kitab (misal: Terdiri dari 10 juz, 5 bagian besar, dll)",
        "chapters": [
        "Muqaddimah",
        "Bab 1: [Judul Bab Asli]",
        "Bab 2: [Judul Bab Asli]",
        "Bab 3: [Judul Bab Asli]",
        ...
        "Khatimah"
        ],
        "manhaj": "Penjelasan mengenai manhaj atau metodologi penulisan kitab ini.",
        "authorBorn": "Tempat dan Tanggal Lahir Pengarang (Hijriyah & Masehi)",
        "authorDied": "Tempat dan Tanggal Wafat Pengarang (Hijriyah & Masehi)",
        "authorCentury": "Abad Hidup Pengarang (Contoh: Abad ke-13 H / 19 M)",
        "famousCommentaries": ["Daftar kitab Syarah/Hasyiyah yang terkenal untuk kitab ini"]
    }
    `;

    const detail = await generateJson(prompt, "Anda adalah ahli bedah kitab kuning dan pustakawan Islam.");
    
    // 5. Save to GitHub with DEEP Structure: kitab/KATEGORI/NAMA-KITAB/
    queueBackgroundTask(async () => {
      const categoryFolder = getCategoryFolder(detail.category || categoryHint || 'Umum');
      const basePath = `kitab/${categoryFolder}/${bookSlug}`;

      // Save Metadata (detail)
      await saveToGitHub(basePath, 'metadata', detail);
      
      // Save specific chapters list for easy access
      if (detail.chapters) {
          await saveToGitHub(basePath, 'daftar-isi', { chapters: detail.chapters });
      }

      // Save intro separate (Tentang Kitab)
      await saveToGitHub(basePath, 'tentang-kitab', { name: detail.name, desc: detail.desc, longDesc: detail.longDesc });

      // Legacy support/Index
      await saveToGitHub('cache-kitab', cacheKey, detail);
    });

    return { ...detail, sourceType: 'AI_FRESH' };
};

export const advancedKitabSearch = async (params: { keyword?: string; kitab?: string; chapter?: string; page?: string }): Promise<any[]> => {
    const { keyword, kitab, chapter, page } = params;
    const cacheKey = `advanced_search:${keyword || ''}:${kitab || ''}:${chapter || ''}:${page || ''}`;
    
    // 1. Check Global Cache
    const cached = await fetchFromGitHub('cache-search', cacheKey);
    if (cached && Array.isArray(cached)) return cached;

    // 2. Generate Search Prompt
    const prompt = `
        Lakukan pencarian mendalam dalam database Maktabah Islamiyah (Kitab Kuning) untuk parameter berikut:
        ${keyword ? `- Kata Kunci: "${keyword}"` : ''}
        ${kitab ? `- Nama Kitab: "${kitab}"` : ''}
        ${chapter ? `- Bab: "${chapter}"` : ''}
        ${page ? `- Halaman: "${page}"` : ''}

        Tugas: Berikan 3-5 kutipan (Ibarah) yang paling relevan. 
        Jika halaman/bab spesifik diminta, berikan kutipan dari bagian tersebut.
        
        Output JSON (Array of Objects):
        [
          {
            "kitab": "Nama Lengkap Kitab",
            "bab": "Nama Bab yang Relevan",
            "halaman": "Nomor Halaman (Angka)",
            "ibarah": "Teks Arab (Matan) asli dari kitab tersebut.",
            "modernTranslation": "Terjemahan Indonesia",
            "maknaGandul": "Terjemahan Makna Gandul Pesantren",
            "syarah": "Penjelasan singkat isi kutipan ini."
          }
        ]
        Pastikan kutipan Arab SANGAT AKURAT sesuai kitabnya.
    `;

    const results = await generateJson(prompt, "Anda adalah ahli indeks Kitab Kuning dan pustakawan Maktabah Syamilah.");

    // 3. Save to Cache
    if (Array.isArray(results) && results.length > 0) {
        queueBackgroundTask(async () => {
            await saveToGitHub('cache-search', cacheKey, results);
        });
    }

    return results;
};

export const fetchCategorizedKitab = async (category: string): Promise<any[]> => {
    const searchSlug = getCategoryFolder(category);
    // Since each book is now a FOLDER, listing results may vary based on implementation
    return await fetchListFromGitHub(`kitab/${searchSlug}`);
};

export const generateKitabAnalysis = async (query: string, source: string, originalTextContext?: string, featureHint?: string): Promise<any> => {
    // If context is provided, use it as the primary text to analyze. 
    // If not, use the query itself.
    const contextText = originalTextContext && originalTextContext.trim().length > 3 ? originalTextContext : query;
    const promptKey = `kitab_analysis_${getSlug(source)}_${getSlug(query)}_${getSlug(contextText.substring(0, 80))}_${featureHint || 'full'}`;
    
    // 1. Prioritize Deep Fetch if source (book) is known
    if (source && source !== 'Umum') {
        const bookNameSlug = getSlug(source);
        const categoryFolder = getCategoryFolder(source);
        const chapterSlug = getSlug(query || contextText);
        
        let deepPath = `kitab/${categoryFolder}/${bookNameSlug}/bedah`;
        
        // Special deep path for Al-Quran features
        if (categoryFolder === 'tafsir-alquran') {
            if (featureHint === 'asbab') deepPath = `alquran/asbabun-nuzul`;
            else if (featureHint === 'munasabah') deepPath = `alquran/munasabah`;
            else deepPath = `alquran/bedah-ai`;
        }
        
        // Special deep path for Hadits features
        if (categoryFolder === 'hadits') {
            if (featureHint === 'asbab') deepPath = `hadits/asbabun-wurud`;
            else deepPath = `hadits/bedah-ai`;
        }

        try {
            const githubData = await fetchFromGitHub(deepPath, chapterSlug);
            if (githubData) return { ...githubData, sourceType: 'GITHUB_STORAGE' };
        } catch (e) {}
    }

    // 2. Fallback to flat Storage (Legacy) if contextText is available
    if (contextText && contextText.trim().length > 5) {
      try {
        const githubData = await fetchFromGitHub('analysis', contextText);
        if (githubData) return githubData;
      } catch (e) {}
    }

    // 3. Cek Cache AI via GitHub (Index)
    const cached = await fetchFromGitHub('cache-analysis', promptKey);
    if (cached) return cached;

    // 4. Generate AI
    const systemInstruction = `
      Anda adalah Al-Allamah, ahli Turath/Kitab Kuning senior, Pakar Tafsir, Hadits, Fiqih 4 Madzhab dan Bahasa Arab dari kalangan Aswaja.
      Tugas Anda: Analisis permintaan user secara mendalam DAN SANGAT SPESIFIK sesuai bab/isi kitab yang diminta (Salaf).
      
      PENTING & WAJIB: 
      1. Anda WAJIB membedah BAB / FASAL / TEKS SPESIFIK yang diminta, BUKAN memberikan deskripsi/rangkuman umum kitab secara keseluruhan.
      2. Jika input menyertakan teks Arab (Matan/Ibarah), bedahlah teks Arab tersebut kata demi kata dan kalimat demi kalimat.
      3. Jika input adalah judul bab atau topik, Anda WAJIB membuatkan kutipan teks Arab (Matan/Ibarah) yang SANGAT AKURAT dan representatif dari kitab rujukan yang disebutkan. JANGAN DIBIARKAN KOSONG.
      4. Gunakan gaya penulisan Makna Gandul Pesantren yang otentik (utawi, iku, ing, dhumateng, dll).
      5. Sertakan selalu analisis I'rab (Mu'rab/Tarkib) secara SANGAT MENDETAIL, EDUKATIF, dan KOMPREHENSIF untuk pemula/orang awam:
         a) Jelaskan ALASAN/MENGAPA suatu kata dibaca dengan harakat tertentu (misal: kenapa dibaca Rofa'/Dhammah, Nasab/Fathah, Jarr/Kasrah).
         b) Sertakan variasi kemungkinan bacaan lain dan alasannya secara nahwu (CONTOH KELAS DARI ULAMA: Pada kata "فَصْلٌ" (Faslun), jelaskan apakah bisa dibaca Faslan atau Faslin? Dibaca Faslun (Rofa') karena menjadi Khabar dari Mubtada' yang dibuang/mahdzuf "هَذَا فَصْلٌ" atau Mubtada' yang khabar-nya dibuang. Bisa dibaca Faslan (Nasab) jika dianggap Maf'ul bih dari fi'il mahdzuf "اقْرَأْ فَصْلاً". Bisa dibaca Faslin (Jarr) jika didahului Mudhaf "هَذَا بَابُ فَصْلٍ").
         c) Sertakan BAIT/SYI'IR KITAB ALFIYAH IBNU MALIK yang relevan (lengkap teks Arab baitnya, terjemahan, dan kaidah nahwunya) agar pembaca dapat merujuk langsung ke dalil Alfiyah.
      6. Sertakan selalu analisis Nahwu dan Shorof (Sharaf) yang SANGAT DETAIL, RUNTUT, dan EDUKATIF agar orang awam/pemula bisa cepat faham:
         a) PISAHKAN SECARA TEGAS & JELAS: Mana bagian yang merupakan **ILMU NAHWU** (fokus pada hubungan antar-kata, posisi dalam kalimat, amil, dan harakat akhir) dan mana bagian yang merupakan **ILMU SHOROF / SHARAF** (fokus pada bentuk internal kata, wazan/pola, perubahan dari akar kata, fi'il madhi/mudhari'/masdar/isim fa'il/isim maf'ul, bina', i'lal/ibdal, dan makna penambahan huruf).
         b) KETERANGAN & ALASAN LENGKAP: Berikan keterangan alasan pada setiap kata/kalimat secara eksplisit (misal: kenapa disebut Fi'il Mudhari' Marfu', kenapa ikut Wazan tertentu, apa akar kata/masdar-nya, dan apa perbedaan makna yang dihasilkan).
      7. JANGAN PERNAH memberikan string kosong "" atau "null" pada field JSON.
      8. Pastikan field "originalText" berisi teks Arab matan/ibarah bab yang sedang dibahas.
    `;

    const prompt = `
      Kitab / Sumber Rujukan: "${source || 'Kitab Turath'}"
      Judul Bab / Fasal / Topik: "${query}"
      Teks Ibarah / Matan Arab yang Dibedah:
      "${contextText}"
      
      TUGAS UTAMA:
      Berikan "Bedah Kitab" (Analisis Kuning) yang SANGAT SPESIFIK UNTUK BAB DAN TEKS DI ATAS.
      Dilarang keras memberikan ulasan umum kitab! Setiap penjelasan (terjemahan, makna gandul, syarah, nahwu shorof, i'rab, hukum fiqih, dll) HARUS fokus 100% membedah isi bab "${query}" dan teks di atas.
      
      Format JSON Wajib (JANGAN GUNAKAN MARKDOWN di luar string, pastikan valid JSON):
      {
        "originalText": "Teks Arab matan/ibarah asli berharakat lengkap untuk bab ini (WAJIB Tulis Teks Arab Asli, Dilarang Menggunakan Titik-titik/Placeholder)",
        "matan": "Teks Arab (Ibarah) lengkap dengan Harakat/Syakal yang benar, indah, dan presisi sesuai kitab asalnya.",
        "arabGundul": "Teks Arab tanpa harakat untuk latihan (Gundul).",
        "modernTranslation": "Terjemahan Bahasa Indonesia yang luwes, akurat secara gramatis, dan mudah dipahami.",
        "maknaGandul": "Terjemahan perkata/lafadz ala Pesantren Jawa/Sunda yang otentik (Contoh: Utawi iki iku bab...).",
        "murab": "Analisis I'rab (Mu'rab/Tarkib) kata demi kata secara mendetail, runtut, dan mudah dipahami pemula/orang awam. Untuk setiap kata/frasa kunci (termasuk kata pembuka seperti 'فَصْلٌ'): 1) Kedudukan tata bahasa (Mubtada', Khabar, Fa'il, Maf'ul, Mudhaf Ilaih, dll), 2) ALASAN/SEBAB kenapa dibaca demikian (misal: kenapa dibaca Rofa'/Faslun, apakah bisa dibaca Nasab/Faslan atau Jarr/Faslin, dan apa konsekuensi struktur kalimatnya), 3) Amil (pengaruh) & Tanda I'rab-nya (Dhammah, Fathah, Kasrah, dll), dan 4) Kutipkan Bait/Syi'ir Kitab ALFIYAH IBNU MALIK yang relevan (teks Arab bait, terjemahan, dan artinya) sebagai rujukan kaidah nahwu resmi.",
        "syarah": "Penjelasan mendalam (minimal 4-6 paragraf) khusus mengenai isi bab dan kutipan tersebut. Bedah dari sisi hukum, aqidah, atau tasawuf sesuai konteks kitabnya.",
        "munawwir": "Bedah kosakata sulit (Wazan, Istiqoq/Akar Kata, Makna Kamus Al-Munawwir/Lisanul Arab).",
        "nahwuShorof": "Analisis Nahwu & Shorof (Sharaf) yang SANGAT DETAIL, RUNTUT, dan EDUKATIF untuk pemula/orang awam. WAJIB dibagi menjadi 2 bagian utama dengan penjelasan lengkap:\n1) 📘 **ANALISIS ILMU NAHWU (Sebab & Kedudukan Kata dalam Kalimat)**: Bedah tata bahasa, struktur kalimat, amil (pengaruh kata lain), posisi kata (Fi'il, Fa'il, Mubtada', Khabar, Maf'ul, Mudhaf Ilaih, dll), dan ALASAN/KETERANGAN kenapa harakat akhirnya dibaca demikian (Rofa'/Nasab/Jarr/Jazm) pada kata-kata kunci.\n2) 📙 **ANALISIS ILMU SHOROF / SHARAF (Perubahan Bentuk & Morfologi Kata)**: Bedah bentuk internal kata dari akar kata (Tsulatsi Mujarrad/Mazid), Wazan/Pola kata, jenis Shighat (Fi'il Madhi, Mudhari', Masdar, Isim Fa'il, Isim Maf'ul, Isim Alat, dll), Bina' (Shohih, Bina' Ajwaf, Naqish, dll), Tashrif (Lughawi/Istilahi), serta ALASAN & MAKNA dari penambahan huruf/perubahan wazan tersebut agar pemula cepat faham.",
        "ijma": "Kesepakatan ulama atau konsensus hukum terkait topik ini.",
        "qiyas": "Analogi hukum atau relevansi kontekstual amaliyah yang bisa ditarik.",
        "madzhab": "Perbandingan pandangan 4 madzhab (Syafi'i, Hanafi, Maliki, Hambali) secara detail terkait topik ini. WAJIB diawali atau dilengkapi dengan penjelasan wawasan fiqih bagi awam bahwa perbandingan ini bertujuan menambah wawasan, serta pentingnya memilih 1 madzhab utama di wilayahnya, larangan mencampuradukkan hukum (talfiq yang membatalkan ibadah), serta aturan bertaqlid/pindah madzhab bila ada hajat/kondisi khusus.",
        "tajwid": "Analisis hukum tajwid dan makharijul huruf (Wajib jika teks Quran/Hadits).",
        "asbabunNuzul": "Latar belakang turunnya ayat (jika kutipan Al-Quran).",
        "asbabulWurud": "Latar belakang munculnya hadits (jika kutipan Hadits).",
        "balaghah": "Analisis keindahan sastra Arab (Bayan, Ma'ani, Badi') pada teks tersebut.",
        "ushulFiqh": "Kaidah Ushuliyyah atau Qawaid Fiqhiyyah yang diterapkan dalam teks ini.",
        "bahtsulMasail": "Simulasi diskusi Bahtsul Masail (Munashih, Mushohih, Jawaban Ibarat) yang mensimulasikan forum ilmiah pesantren.",
        "hikmah": "Pesan spiritual, moral, dan rahasia batin (isyrarat) yang bisa dipetik.",
        "referensi": "Daftar kitab-kitab syarah, hasyiyah, atau referensi pendukung lainnya.",
        "quranRef": "Informasi Nama Surat & Ayat (jika relevan).",
        "hadithRef": "Informasi Perawi & Nomor Hadits (jika relevan)."
      }
    `;

    let result: any;
    try {
      result = await generateJson(prompt, systemInstruction);
    } catch (analysisErr) {
      console.warn("Bedah Kitab AI call failed, generating graceful fallback:", analysisErr);
      result = {
        originalText: contextText,
        matan: contextText,
        modernTranslation: `Hasil analisis Bedah Kitab untuk teks "${query.substring(0, 100)}...": Teks di atas merupakan petikan dari ${source || 'Kitab Turath'}. Silakan periksa rujukan kitab kuning terkait untuk pendalaman khazanah fiqih.`,
        maknaGandul: "Makna gandul otomatis belum dapat dimuat saat ini.",
        nahwuShorof: "I'rab dan Nahwu Shorof dapat dirujuk pada kitab Syarah dan Hasyiyah terkait.",
        syarah: "Syarah dan kajian hukum fiqih berdasarkan pandangan Ulama Mazhab Syafi'i.",
        referensi: source ? [source] : ["Kitab Kuning Turath / Salaf"]
      };
    }
    
    // 3. Save to GitHub with DEEP Structure: kitab/KATEGORI/NAMA-KITAB/bedah/BAB-SLUG.json
    queueBackgroundTask(async () => {
      let categoryFolder = 'umum';
      let bookNameSlug = 'general-items';

      if (source && source !== 'Umum') {
          bookNameSlug = getSlug(source);
          categoryFolder = getCategoryFolder(source);
      }

      const chapterSlug = getSlug(query);
      let storagePath = `kitab/${categoryFolder}/${bookNameSlug}/bedah`;

      // Special folder structure for Al-Quran as requested
      // Force Al-Quran features into alquran/ folder even if source is general
      const isQuranFeature = ['asbab', 'munasabah', 'quran'].includes(featureHint || '');
      const isHadithFeature = ['asbab', 'hadits', 'wurud'].includes(featureHint || '');
      
      if (categoryFolder === 'tafsir-alquran' || isQuranFeature) {
          if (featureHint === 'asbab') storagePath = `alquran/asbabun-nuzul`;
          else if (featureHint === 'munasabah') storagePath = `alquran/munasabah`;
          else storagePath = `alquran/bedah-ai`;
      } else if (categoryFolder === 'hadits' || isHadithFeature) {
          if (featureHint === 'asbab') storagePath = `hadits/asbabun-wurud`;
          else storagePath = `hadits/bedah-ai`;
      }

      await saveToGitHub(storagePath, chapterSlug, result);
      
      // Secondary Cache
      await saveToGitHub('cache-analysis', promptKey, result);
      await saveToGitHub('analysis', contextText, result);
    });
    
    return result;
};

export const generateScholarBiography = async (name: string, contextBook: string = ''): Promise<any> => {
    const keyName = name.trim();
    const cacheKey = `bio:${keyName.toLowerCase()}`;
    
    // 1. Cek GitHub
    try {
      const githubData = await fetchFromGitHub('biography', keyName);
      if (githubData) return githubData;
    } catch (e) {}

    // 2. Cek Cache AI via GitHub (Categorized)
    const cached = await fetchFromGitHub('cache-bio', cacheKey);
    if (cached) return cached;

    // 2. Generate AI
    const prompt = `
        Bertindaklah sebagai sejarawan Islam ahli Turath dan pakar biografi Ulama. 
        Buatlah profil biografi yang SANGAT DETAIL, AKURAT, DAN KOMPREHENSIF untuk: ${keyName} ${contextBook ? `(Pengarang kitab: ${contextBook})` : ''}.
        
        PENTING: Fokus mendalam pada Sanad Keilmuan (Guru & Murid), Manhaj (Metodologi), dan Kontribusi bagi umat.
        
        Format JSON (Wajib):
        {
          "fullName": "Nama lengkap dengan gelar kehormatan (Arab & Latin)",
          "titles": "Gelar kehormatan kharismatik (contoh: Hujjatul Islam, Mujaddid, Syaikhul Islam, dll)",
          "birthYear": "Tahun Lahir (Hijriyah & Masehi)",
          "deathYear": "Tahun Wafat (Hijriyah & Masehi)",
          "century": "Abad ke-X Hijriyah",
          "birthDeath": "Lahir - Wafat (Lahir di mana, Wafat di mana)",
          "tombLocation": "Informasi lokasi makam beliau (misal: Makam Luar Batang, Jakarta)",
          "googleMapsLink": "URL Google Maps ke lokasi makam (jika tersedia)",
          "intro": "Ringkasan profil biografi beliau yang inspiratif (3-4 kalimat).",
          "teachers": ["Daftar Guru-Guru Utama (minimal 5 jika ada)"],
          "students": ["Daftar Murid-Murid Terkenal (minimal 5 jika ada)"],
          "works": ["Daftar Karya-Karya Monumental (minimal 5 jika ada)"],
          "sanad": "Penjelasan mengenai mata rantai keilmuan (sanad) beliau.",
          "manhaj": "Penjelasan mengenai metodologi pemikiran dan amaliyah beliau (misal: Syafi'iyyah dalam Fiqih, Asy'ariyah dalam Akidah).",
          "timeline": [
            { "year": "Tahun", "event": "Peristiwa penting dalam hidup beliau" }
          ],
          "narrativeSections": [
            { "title": "Nasab & Kelahiran", "content": "Silsilah keturunan dan latar belakang keluarga..." },
            { "title": "Masa Menuntut Ilmu (Rihlah)", "content": "Perjalanan beliau berpindah kota untuk berguru..." },
            { "title": "Masa Pengabdian & Karya", "content": "Bagaimana beliau mengajar dan menulis kitab-kitabnya..." },
            { "title": "Karakter & Keteladanan", "content": "Sisi spiritual (Zuhud, Wara') yang bisa diteladani..." },
            { "title": "Wafat & Warisan Keilmuan", "content": "Momen wafatnya beliau dan pengaruhnya hingga saat ini..." }
          ]
        }
    `;

    const result = await generateJson(prompt, "Anda adalah Ahli Sejarah Islam dan Biografi Ulama.");
    
    // 3. Save to GitHub with Structured Path: biography/nama-ulama.json
    queueBackgroundTask(async () => {
      await saveToGitHub('biography', keyName, result);
      await saveToGitHub('cache-bio', cacheKey, result);
    });

    return result;
};

export const analyzeSinAndRepentance = async (query: string): Promise<any> => {
    const searchKey = query.trim().toLowerCase();
    const cacheKey = `sin_analysis:${searchKey}`;
    
    // 1. Cek GitHub
    try {
      const githubData = await fetchFromGitHub('repentance', searchKey);
      if (githubData) return githubData;
    } catch (e) {}

    // 2. Cek Cache AI via GitHub (Categorized)
    const cached = await fetchFromGitHub('cache-repent', cacheKey);
    if (cached) return cached;

    // 2. Generate AI
    const prompt = `
        Analisis kesalahan atau dosa berikut: "${query}".
        Berikan bimbingan yang bijaksana, edukatif, dan penuh rahmah sesuai ajaran Islam (Aswaja).
        
        Output JSON (Wajib):
        {
            "sinName": "Nama Kesalahan/Dosa",
            "category": "Kecil / Besar",
            "consequences": "Penjelasan mengenai hukuman atau dampak buruk dosa ini di dunia dan akhirat berdasarkan dalil.",
            "dalilPunishment": "Dalil spesifik tentang ancaman/hukuman (Quran/Hadis).",
            "repentanceMethod": "Langkah-langkah praktis dan syarat bertaubat (Taubat Nasuha) dari dosa ini.",
            "dalilMercy": "Dalil spesifik tentang luasnya ampunan Allah terkait hal ini.",
            "isFound": true
        }
        Jika input tidak relevan dengan konsep dosa/kesalahan dalam Islam, set "isFound": false.
    `;

    const result = await generateJson(prompt, "Anda adalah ulama ahli Fiqih Jinayah dan Tasawuf (Pembersihan Jiwa) yang bijak dan penuh kasih sayang. Fokus pada pintu taubat yang selalu terbuka.");
    
    // Save to GitHub Cache (Categorized)
    queueBackgroundTask(async () => {
      await saveToGitHub('cache-repent', cacheKey, result);
      await saveToGitHub('repentance', searchKey, result);
    });

    return result;
};

export const generateScholarsByCentury = async (century: number): Promise<any[]> => {
    const cacheKey = `scholars_century:${century}`;
    
    // 1. Cek GitHub
    try {
      const githubData = await fetchFromGitHub('scholars_list', `century-${century}`);
      if (githubData) return githubData;
    } catch (e) {}

    // 2. Cek Cache AI via GitHub (Categorized)
    const cached = await fetchFromGitHub('cache-scholars', cacheKey);
    if (cached) return cached;

    // 2. Generate AI
    const prompt = `
        Berikan daftar 10 ulama paling berpengaruh yang hidup pada abad ke-${century} Hijriyah.
        Sertakan deskripsi singkat mengenai bidang keilmuan dan karya utamanya.
        
        Output dalam JSON array:
        [
          {
            "name": "Nama Lengkap Ulama",
            "birthDeath": "Tahun (H/M)",
            "specialty": "Bidang Keahlian (misal: Fiqih, Tafsir, Tasawuf)",
            "summary": "Ringkasan kontribusi beliau dalam 1 kalimat.",
            "famousWork": "Karya yang paling terkenal"
          }
        ]
    `;

    const result = await generateJson(prompt, "Anda adalah sejarawan pakar biografi ulama terdahulu.");
    
    // Save to GitHub Cache (Categorized)
    queueBackgroundTask(async () => {
      await saveToGitHub('cache-scholars', cacheKey, result);
      await saveToGitHub('scholars_list', `century-${century}`, result);
    });

    return result;
};

export const generateFatwaAnalysis = async (query: string): Promise<any> => {
    const searchKey = query.trim().toLowerCase();
    const cacheKey = `fatwa:${searchKey}`;
    
    // 1. Cek GitHub
    try {
      const githubData = await fetchFromGitHub('fatwa', searchKey);
      if (githubData) return githubData;
    } catch (e) {}

    // 2. Cek Cache AI via GitHub (Categorized)
    const cached = await fetchFromGitHub('cache-fatwa', cacheKey);
    if (cached) return cached;

    // 2. Generate AI
    const prompt = `
        Berikan jawaban hukum Islam (Fatwa) yang mendalam dan komprehensif untuk pertanyaan: "${query}".
        PENTING: Gunakan pendekatan Bahtsul Masail (metode pesantren) dan sertakan perbandingan 4 Madzhab.
        
        Format JSON (Wajib):
        {
          "question": "${query}",
          "summary": "Jawaban singkat dan padat.",
          "lawStatus": "Status Hukum (misal: Wajib, Haram, Sunnah, Makruh, Mubah)",
          "madzhabComparison": [
            { "madzhab": "Syafi'i", "opinion": "..." },
            { "madzhab": "Hanafi", "opinion": "..." },
            { "madzhab": "Maliki", "opinion": "..." },
            { "madzhab": "Hambali", "opinion": "..." }
          ],
          "evidences": [
            { "source": "Al-Quran/Hadis", "text": "Teks Arab atau referensi", "meaning": "Terjemahan/Makna" }
          ],
          "conclusion": "Kesimpulan akhir dan saran praktis bagi penanya."
        }
    `;

    const result = await generateJson(prompt, "Anda adalah Mufti dan Ahli Fiqih 4 Madzhab dari kalangan Aswaja.");
    
    // Save to GitHub Cache (Categorized)
    queueBackgroundTask(async () => {
      await saveToGitHub('cache-fatwa', cacheKey, result);
      await saveToGitHub('fatwa', searchKey, result);
    });

    return result;
};

export const generateIslamicNameMeanings = async (query: string): Promise<any[]> => {
  const searchKey = query.trim().toLowerCase();
  
  // 1. Cek GitHub
  try {
    const githubData = await fetchFromGitHub('names', searchKey);
    if (githubData) return githubData;
  } catch (e) {}

  const prompt = `
    Berikan daftar nama islami (minimal 3-5 nama) yang relevan dengan keyword: "${query}".
    Jika keyword adalah nama, berikan makna mendalam dan filosofinya.
    Jika keyword adalah kriteria (misal: "anak laki-laki pemberani"), berikan rekomendasi nama.

    Output dalam JSON array:
    [
      {
        "name": "Nama Arab",
        "meaning": "Arti nama secara mendalam",
        "gender": "Laki-laki / Perempuan",
        "origin": "Asal bahasa (Arab, Persia, dll)",
        "suggestion": "Deskripsi singkat filosofi nama"
      }
    ]
  `;

  const result = await generateJson(prompt, "Anda adalah ahli onomastika Islam dan bahasa Arab.");

  // 2. Save dynamic (No Global Cache in this fn but let's save to GitHub)
  queueBackgroundTask(async () => {
    await saveToGitHub('names', searchKey, result);
  });

  return result;
};

export const generateMutiaraUlama = async (topic: string = 'umum'): Promise<any> => {
    const cacheKey = `mutiara:${topic}`;
    
    // 1. Cek GitHub
    try {
      const githubData = await fetchFromGitHub('mutiara', topic);
      if (githubData) return githubData;
    } catch (e) {}

    // 2. Cek Cache AI via GitHub (Categorized)
    const cached = await fetchFromGitHub('cache-mutiara', cacheKey);
    if (cached) return cached;

    const prompt = `Pakar nasehat Islami. Buat 1 mutiara hikmah unik Ulama Aswaja tentang: "${topic}". 
    Berikan dalam format JSON:
    {"scholar": "Nama Ulama", "role": "Gelar/Jabatan", "content": "Teks nasehat", "theme": "ID_THEME"}
    Pilih secara acak ID_THEME dari daftar ini: ${QUOTE_THEMES.map(t => t.id).join(', ')}.`;

    const result = await generateJson(prompt, "Ahli Hikmah.");
    
    // Ensure theme is valid or pick random if AI hallucinates
    if (!QUOTE_THEMES.some(t => t.id === result.theme)) {
      result.theme = QUOTE_THEMES[Math.floor(Math.random() * QUOTE_THEMES.length)].id;
    }
    
    // Save to GitHub Structured: mutiara/topic-slug.json
    queueBackgroundTask(async () => {
      await saveToGitHub('mutiara', getSlug(topic), result);
      await saveToGitHub('cache-mutiara', cacheKey, result);
    });

    return result;
};

export const generateIslamicNews = async (category: string = 'nasional'): Promise<any> => {
    const dateStr = new Date().toISOString().split('T')[0];
    const cacheKey = `news:${category}:${dateStr}`;

    // 1. Cek GitHub
    try {
      const githubData = await fetchFromGitHub('news', `${category}-${dateStr}`);
      if (githubData) return githubData;
    } catch (e) {}

    // 2. Cek Cache AI via GitHub (Categorized)
    const cached = await fetchFromGitHub('cache-news', cacheKey);
    if (cached) return cached;

    const prompt = `Tuliskan satu berita Islami (Warta Santri) terbaru untuk kategori: ${category}.
    Berikan dalam format JSON:
    { "title": "Judul Berita", "content": "Isi berita dalam Markdown", "author": "Santri AI", "category": "${category}", "date": "${dateStr}" }`;

    const result = await generateJson(prompt, "Jurnalis Muslim Syariah.");

    // Save to GitHub Structured: news/category/date.json
    queueBackgroundTask(async () => {
      const dateStr = new Date().toISOString().split('T')[0];
      await saveToGitHub(`news/${category}`, dateStr, result);
      await saveToGitHub('cache-news', cacheKey, result);
    });

    return result;
};

export const searchWorshipAct = async (query: string): Promise<any> => {
    const searchKey = query.trim().toLowerCase();
    const cacheKey = `worship_search:${searchKey}`;
    
    // 1. Cek GitHub
    try {
      const githubData = await fetchFromGitHub('worship', searchKey);
      if (githubData) return githubData;
    } catch (e) {}

    // 2. Cek Cache AI
    const cached = await fetchGlobalCache(cacheKey, 'worship_search');
    if (cached) return cached;

    // 2. Generate AI
    const prompt = `
        Berikan informasi detail untuk ibadah: "${query}".
        Ibadah ini bisa berupa shalat sunnah, dzikir spesifik, puasa sunnah, atau amalan harian lainnya yang mungkin tidak masuk dalam list standar.
        
        Output JSON (Wajib):
        {
            "name": "Nama Ibadah",
            "category": "wajib" atau "sunnah",
            "fadilah": "Keutamaan/manfaat ibadah ini berdasarkan dalil.",
            "source": "Sumber dalil (HR. Bukhari, Muslim, dll atau ayat Quran).",
            "points": [Angka estimasi pahala virtual, misal 100-300],
            "howTo": "Cara singkat melakukannya (step-by-step jika perlu).",
            "isFound": true
        }
        Jika ibadah tidak ditemukan atau tidak dikenal dalam khazanah Islam, set "isFound": false.
    `;

    const result = await generateJson(prompt, "Anda adalah ahli ibadah, fiqih, and hadits yang sangat luas pengetahuannya.");
    
    // 3. Save to Cache
    await saveGlobalCache(cacheKey, result, 'worship_search', GEMINI_MODEL);

    // 4. Save to GitHub (Background)
    queueBackgroundTask(async () => {
      await saveToGitHub('worship', searchKey, result);
    });

    return result;
};

export const generateEducationalContent = async (topic: string, subTopic: string, forceRefresh: boolean = false): Promise<any> => {
    const searchKey = `${topic}-${subTopic}`.trim().toLowerCase();
    
    // 1. Cek GitHub jika bukan forceRefresh
    if (!forceRefresh) {
      try {
        const githubData = await fetchFromGitHub('education', searchKey);
        if (githubData && githubData.steps && Array.isArray(githubData.steps) && githubData.steps.length > 0) {
          return githubData;
        }
      } catch (e) {}
    }

    const prompt = `
      Buatlah MODUL PEMBELAJARAN STEP-BY-STEP (Langkah demi Langkah) yang SANGAT DETAIL, LENGKAP, dan EDUKATIF tentang: ${topic} - ${subTopic}.
      Materi dirancang khusus agar ORANG AWAM atau PEMULA dari tingkat NOL dapat CEPAT PAHAM dan LANGSUNG BISA MEMPRAKTEKKANNYA (Bisa membaca Kitab Kuning / Membaca Al-Qur'an dengan lancar dan benar).
      
      Aturan Penulisan Modul:
      1. Buatkan minimal 4 sampai 5 Langkah Bertahap dari Tingkat Dasar/Nol sampai Tingkat Praktek Mandiri.
      2. Gunakan bahasa yang sangat komunikatif, ramah pemula, hindari istilah rumit tanpa penjelasan.
      3. Berikan contoh teks Arab lengkap dengan harakat, artinya, dan cara bacanya kata demi kata.
      4. Sertakan "Rumus Cepat / Tips Praktis" untuk mengingat hukum/aturan dengan mudah.

      Output JSON (Wajib & Sesuai Format):
      {
        "title": "Judul Modul Pembelajaran",
        "intro": "Pengenalan singkat modul dan target yang akan dicapai pemula setelah membaca ini.",
        "steps": [
          { 
            "stepNumber": 1,
            "title": "Langkah 1: Nama Langkah", 
            "explanation": "Penjelasan konsep dasar yang sangat mudah dipahami...",
            "examples": [
              { "arabic": "تَكْتُبُ", "read": "Taktubu", "meaning": "Kamu sedang menulis", "note": "Keterangan detail kenapa dibaca demikian" }
            ],
            "actionTip": "Praktek atau hal yang harus dicoba pemula pada langkah ini"
          }
        ],
        "sections": [
          { "title": "Ringkasan Kaidah Penting", "content": "Rangkuman poin kunci yang wajib dihafal..." }
        ],
        "tips": ["Tips Praktis 1 untuk Pemula", "Tips Praktis 2 untuk Pemula"],
        "summary": "Pesan motivasi & kesimpulan belajar"
      }
    `;

    try {
      const result = await generateJson(prompt, "Anda adalah guru pakar Nahwu, Shorof, dan Tajwid Al-Qur'an yang sangat berpengalaman membimbing santri/masyarakat awam dari nol sampai mahir.");
      
      if (result && result.steps && Array.isArray(result.steps) && result.steps.length > 0) {
        queueBackgroundTask(async () => {
          await saveToGitHub('education', searchKey, result);
        });
        return result;
      }
      throw new Error("Formatting error");
    } catch (err) {
      console.warn("AI generation error, returning default structured step module", err);
      // Fallback data step-by-step jika terjadi error/offline
      return {
        title: `Modul Step-by-Step: ${subTopic}`,
        intro: `Panduan belajar ${subTopic} langkah demi langkah untuk pemula dan masyarakat awam agar cepat paham dan langsung bisa membaca.`,
        steps: [
          {
            stepNumber: 1,
            title: "Langkah 1: Mengenal Fondasi Dasar",
            explanation: `Memahami konsep utama ${subTopic} dari tingkat nol dengan bahasa sederhana tanpa istilah yang membingungkan.`,
            examples: [
              { arabic: "بِسْمِ اللَّهِ", read: "Bismillāh", meaning: "Dengan menyebut nama Allah", note: "Perhatikan harakat kasrah di bawah huruf Ba (بِ)" }
            ],
            actionTip: "Ulangi bacaan contoh di atas sebanyak 3 kali sampai fasih dan terbiasa."
          },
          {
            stepNumber: 2,
            title: "Langkah 2: Mengidentifikasi Kaidah & Tanda Khusus",
            explanation: "Mengenali rumus cepat dan ciri-ciri fisik huruf atau kata yang harus dibaca sesuai aturan.",
            examples: [
              { arabic: "اَلْحَمْدُ لِلَّهِ", read: "Al-ḥamdu lillāh", meaning: "Segala puji bagi Allah", note: "Gunakan rumus alif lam qamariyah (dibaca jelas)" }
            ],
            actionTip: "Cari 2 contoh serupa dalam lembaran kitab atau mushaf Al-Qur'an Anda."
          },
          {
            stepNumber: 3,
            title: "Langkah 3: Panduan Praktek Membaca Kata demi Kata",
            explanation: "Menerapkan ilmu yang telah dipelajari dengan membedah bacaan kalimat demi kalimat secara rinci.",
            examples: [
              { arabic: "رَبِّ الْعَالَمِينَ", read: "Rabbil 'ālamīn", meaning: "Tuhan semesta alam", note: "Perhatikan tajwid/i'rab pada kata terakhir" }
            ],
            actionTip: "Bacalah dengan suara perlahan dan resapi artinya."
          },
          {
            stepNumber: 4,
            title: "Langkah 4: Latihan Mandiri & Evaluasi Pemahaman",
            explanation: "Menguji sejauh mana Anda dapat mengenali hukum dan cara baca tanpa bantuan harakat atau panduan penuh.",
            examples: [
              { arabic: "إِيَّاكَ نَعْبُدُ", read: "Iyyāka na'budu", meaning: "Hanya kepada-Mulah kami menyembah", note: "Praktekkan penekanan (tasydid) pada huruf Ya" }
            ],
            actionTip: "Tes ingatan Anda dengan membaca kalimat ini tanpa melihat latinnya."
          }
        ],
        sections: [
          { title: "Rangkuman Kaidah Utama", content: "Kunci utama keberhasilan belajar adalah konsistensi (istiqamah) latihan membaca minimal 10 menit setiap hari." }
        ],
        tips: [
          "Jangan terburu-buru, utamakan ketepatan tajwid/i'rab dibanding kecepatan.",
          "Gunakan buku catatan kecil untuk merangkum contoh-contoh kata yang sering ditemui."
        ],
        summary: "Selamat! Anda telah mempelajari modul ini secara bertahap. Teruskan ke modul berikutnya."
      };
    }
};

// --- GENERIC FUNCTIONS ---

export const generateDreamInterpretation = async (dream: string): Promise<any> => {
    const searchKey = dream.trim().toLowerCase().substring(0, 50); // Limit key length
    const cacheKey = `dream:${searchKey}`;
    
    // 1. Cek GitHub
    try {
      const githubData = await fetchFromGitHub('dreams', searchKey);
      if (githubData) return githubData;
    } catch (e) {}

    // 2. Cek Cache
    const cached = await fetchGlobalCache(cacheKey, 'dream_interpretation');
    if (cached) return cached;

    const prompt = `Anda adalah seorang pakar ta'bir dan tafsir mimpi Islami terkemuka berdasarkan literatur klasik Ahlussunnah wal Jama'ah (seperti Kitab "Muntakhabul Kalam fi Tafsiril Ahlam" karya Imam Muhammad bin Sirin, "Ta'thirul Anam fi Tafsiril Manam" karya Syaikh Abdul Ghani An-Nabulsi, serta kaidah Al-Qur'an dan Sunnah).
    Tafsirkan mimpi berikut dengan bijak, santun, ilmiah, dan menenangkan: "${dream}".

    Wajib berikan jawaban dalam format JSON terstruktur persis seperti ini:
    {
      "category": "Kategori Mimpi (misal: Mimpi Baik / Kabar Gembira / Peringatan Hikmah / Bunga Tidur / Gangguan Syaitan)",
      "symbolism": "Analisis ringkas makna simbol atau unsur kunci dalam mimpi",
      "interpretation": "Penjelasan detail, komprehensif, dan menenangkan mengenai arti mimpi ini dalam tinjauan syariat dan kearifan para ulama salaf",
      "reference": {
        "title": "Nama Kitab / Sumber Rujukan Utama (Contoh: Tafsirul Ahlam karya Ibnu Sirin / Ta'thirul Anam fi Tafsiril Manam karya Abdul Ghani An-Nabulsi / Shahih Bukhari & Muslim / Ayat Al-Quran)",
        "author": "Nama Pengarang / Ulama / Perawi",
        "detail": "Penjelasan rinci konteks rujukan kitab klasik atau dalil hadits yang mendasari penafsiran simbol mimpi ini beserta kaidahnya."
      },
      "advice": "Nasehat spiritual, hikmah, dan bimbingan adab praktis yang patut dilakukan oleh yang bermimpi",
      "amalan": {
        "hasAmalan": true,
        "title": "Nama Doa / Sholawat / Amalan yang dianjurkan (Contoh: Sholawat Thibbil Qulub / Doa Tolak Bala & Perlindungan Mimpi Buruk / Dzikir Istighfar & Ayat Kursi / Sholawat Nariyah / Doa Istikharah)",
        "arabic": "Teks Arab amalan/doa/sholawat berharakat lengkap dan jelas",
        "latin": "Transliterasi Latin",
        "translation": "Arti / terjemahan dalam Bahasa Indonesia",
        "fadhilah": "Keutamaan dan tata cara mengamalkannya (kaifiyah: misal dibaca 3x atau 7x setelah sholat fardhu atau sebelum tidur)"
      }
    }`;

    const result = await generateJson(prompt, "Ahli Tafsir Mimpi Islami.");
    
    // Save
    await saveGlobalCache(cacheKey, result, 'dream_interpretation', GEMINI_MODEL);
    logToPublicFeed("Tafsir Mimpi", dream, result, "dream");
    queueBackgroundTask(async () => {
      await saveToGitHub('dreams', searchKey, result);
    });

    return result;
};

export const validateIslamicQuote = async (quote: string): Promise<any> => {
    const searchKey = quote.trim().toLowerCase().substring(0, 50);
    
    // 1. Cek GitHub
    try {
      const githubData = await fetchFromGitHub('quote_validation', searchKey);
      if (githubData) return githubData;
    } catch (e) {}

    const prompt = `Periksa kesahihan kutipan/hadits berikut: "${quote}". 
    Tentukan apakah ini Hadits Shahih, Perkataan Ulama (Maqolah), atau berpotensi Palsu/Tidak berdasar.
    Berikan dalam JSON:
    { "status": "Shahih/Dhaif/Maqolah/Palsu", "explanation": "Penjelasan ilmiah", "source": "Kitab referensi", "isAuthorized": boolean }`;

    const result = await generateJson(prompt, "Pakar Takhrij Hadits dan Atsar.");
    
    // Save
    queueBackgroundTask(async () => {
      await saveToGitHub('hadits/cek-kutipan', searchKey, result);
      await saveToGitHub('quote_validation', searchKey, result);
    });

    return result;
};

export const analyzeHadith = async (query: string): Promise<any> => {
    const searchKey = query.trim().toLowerCase().substring(0, 50);
    const cacheKey = `hadith_analysis:${searchKey}`;
    
    // 1. Cek GitHub
    try {
      const githubData = await fetchFromGitHub('hadith', searchKey);
      if (githubData) return githubData;
    } catch (e) {}

    // 2. Cek Cache AI
    const cached = await fetchGlobalCache(cacheKey, 'hadith_analysis');
    if (cached) return cached;

    const prompt = `Cari dan jelaskan hadits yang berkaitan dengan: "${query}". 
    Berikan teks Arab, terjemahan, dan status (Shahih/Hasan/Dhaif) serta perawinya.
    Berikan dalam format JSON:
    { "arabic": "...", "translation": "...", "source": "...", "status": "...", "explanation": "..." }`;

    const result = await generateJson(prompt, "Ahli Hadits dan Sanad.");
    
    // Save
    await saveGlobalCache(cacheKey, result, 'hadith_analysis', GEMINI_MODEL);
    queueBackgroundTask(async () => {
      await saveToGitHub('hadits/cari-hadits', searchKey, result);
      await saveToGitHub('hadith', searchKey, result);
    });

    return result;
};

export const generateFeatureAssistance = async (featureName: string, query: string): Promise<any> => {
    const searchKey = `${featureName}-${query}`.trim().toLowerCase().substring(0, 50);
    const cacheKey = `assist:${searchKey}`;

    // 1. Cek GitHub
    try {
      const githubData = await fetchFromGitHub('assistance', searchKey);
      if (githubData) return githubData;
    } catch (e) {}

    // 2. Cek Cache
    const cached = await fetchGlobalCache(cacheKey, 'feature_assistance');
    if (cached) return cached;

    const prompt = `Anda adalah asisten ahli untuk fitur "${featureName}" di aplikasi Santri AI. 
    Berikan penjelasan, panduan, atau jawaban hukum terkait: "${query}".
    Gunakan gaya bahasa santri yang sopan, jelas, dan berbasis dalil jika diperlukan.
    Berikan dalam format JSON:
    { "title": "Judul Panduan", "content": "Penjelasan detail dalam Markdown", "tips": "Tips praktis", "isDetailed": true }`;

    const result = await generateJson(prompt, "Pakar Literasi dan Fiqih Islam.");

    // Save
    await saveGlobalCache(cacheKey, result, 'feature_assistance', GEMINI_MODEL);
    queueBackgroundTask(async () => {
      await saveToGitHub('assistance', searchKey, result);
    });

    return result;
};

export const generateCreatorContent = async (type: string, topic: string): Promise<any> => {
    const searchKey = `${type}-${topic}`.trim().toLowerCase().substring(0, 50);
    
    // Cek GitHub
    try {
      const githubData = await fetchFromGitHub('creator_content', searchKey);
      if (githubData) return githubData;
    } catch (e) {}

    const prompt = `Anda adalah Content Creator Islami Kreatif. Buatlah ${type} tentang: "${topic}".
    Berikan ide konten, caption, dan struktur materinya.
    Berikan dalam JSON:
    { "title": "Judul Konten", "hook": "Kalimat pembuka menarik", "structure": ["step 1", "step 2"], "caption": "Teks caption sosmed", "hashtags": "#santri #islam" }`;

    const result = await generateJson(prompt, "Digital Islamic Creator.");

    queueBackgroundTask(async () => {
      await saveToGitHub('creator_content', searchKey, result);
    });

    return result;
};

export const generateZakatWarisAnalysis = async (type: 'zakat' | 'waris', data: any): Promise<any> => {
    const dataStr = JSON.stringify(data);
    const searchKey = `${type}-${dataStr.substring(0, 40)}`.replace(/[^a-z0-9]/gi, '_');

    // Cek GitHub
    try {
      const githubData = await fetchFromGitHub('calculator_analysis', searchKey);
      if (githubData) return githubData;
    } catch (e) {}

    const prompt = `Analisis perhitungan ${type} berikut: ${dataStr}. 
    Berikan penjelasan langkah demi langkah mengapa hasilnya demikian menurut hukum Fiqih.
    Berikan dalam JSON:
    { "summary": "Ringkasan hasil", "details": "Penjelasan rinci Markdown", "references": "Rujukan kitab" }`;

    const result = await generateJson(prompt, "Pakar Faraid dan Zakat.");

    queueBackgroundTask(async () => {
      await saveToGitHub('calculator_analysis', searchKey, result);
    });

    return result;
};

export const generateFullEbook = async (bookName: string): Promise<any> => {
    const searchName = bookName.trim();
    const prompt = `
    Anda adalah ahli manuskrip Kitab Kuning (Turath).
    Buatlah isi lengkap untuk kitab: "${searchName}".
    
    Output JSON (Wajib): 
    {
      "profile": {
        "name": "${searchName}",
        "originalTitle": "Judul Arab lengkap dengan harakat",
        "author": "Nama Pengarang",
        "category": "Kategori Fiqih/Akidah/dll"
      },
      "chapters": [
        {
          "title": "Muqaddimah",
          "arabic": "Teks Arab Muqaddimah asli yang lengkap...",
          "translation": "Terjemahan Indonesia muqaddimah..."
        },
        {
          "title": "Bab ... (sesuaikan dengan bab asli kitab)",
          "arabic": "Teks Arab bab ini...",
          "translation": "Terjemahan bab ini..."
        },
        ... (Berikan minimal 10-15 bab/poin utama jika kitabnya ringkas, atau bab-bab awal yang paling krusial jika kitabnya tebal)
      ]
    }
    Pastikan teks Arab SANGAT AKURAT sesuai naskah aslinya.
    `;

    const result = await generateJson(prompt, "Pakar Manuskrip Kitab Kuning.");
    
    queueBackgroundTask(async () => {
        const bookSlug = getSlug(searchName);
        await saveToGitHub('ebooks', bookSlug, result);
    });

    return result;
};

export const generateJson = async (prompt: string, systemInstruction?: string, skipCacheRead: boolean = false): Promise<any> => {
  const cacheKey = getSlug(prompt.substring(0, 100));
  if (!skipCacheRead) {
    const cached = await fetchGlobalCache(cacheKey, 'json_gen');
    if (cached && (cached.syarah || cached.modernTranslation || cached.matan || (typeof cached === 'object' && Object.keys(cached).length > 2))) {
      return cached;
    }
  }

  const result = await callWithRetry(async (ai, model) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: (systemInstruction || "You are a helpful assistant. Output strictly JSON.") + " IMPORTANT: Tuliskan respon hingga tuntas dan lengkap dari awal sampai akhir, jangan memotong penjelasan.",
        temperature: DEFAULT_AI_CONFIG.temperature,
        topP: DEFAULT_AI_CONFIG.topP,
        maxOutputTokens: 16384,
        responseMimeType: "application/json"
      }
    });
    if (response.text === undefined) throw new Error("Gagal mendapatkan respon dari AI.");
    return parseJsonSafely(response.text);
  });

  queueBackgroundTask(async () => {
    await saveToGitHub('cache', `json_gen:${cacheKey}`, result);
  });
  return result;
};

export const askReligiousQuery = async (topic: string, query: string): Promise<string> => {
  const searchKey = `${topic}-${query}`.trim().toLowerCase().substring(0, 255);
  const uniqueKey = `${topic}:${query.trim().toLowerCase()}`;
  
  // 1. Cek GitHub
  try {
    const githubData = await fetchFromGitHub('religious_inquiries', searchKey);
    if (githubData && githubData.content) return githubData.content;
  } catch (e) {}

  // 2. Cek Cache AI via GitHub
  const cached = await fetchFromGitHub('cache', searchKey);
  if (cached && cached.content) return cached.content; 

  const resultText = await callWithRetry(async (ai, model) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: query,
      config: {
        systemInstruction: `You are an expert Islamic scholar in ${topic}. Provide accurate, respectful, complete, and exhaustive answers based on Quran, Hadith, and Kitab Kuning (Aswaja). Language: Indonesian. Tuliskan jawaban secara utuh dan lengkap tanpa terpotong.`,
        temperature: DEFAULT_AI_CONFIG.temperature,
        topP: DEFAULT_AI_CONFIG.topP,
        maxOutputTokens: 8192,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });
    return response.text || "Maaf, tidak ada jawaban dari sistem.";
  });

  // 3. Save to GitHub Cache
  queueBackgroundTask(async () => {
    await saveToGitHub('cache', searchKey, { content: resultText, topic, query });
    await saveToGitHub('religious_inquiries', searchKey, { content: resultText, topic, query });
  });

  return resultText;
};

export const generateAIComment = async (postContent: string, isPrayerRequest: boolean): Promise<string> => {
  const resultText = await callWithRetry(async (ai, model) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Buatlah satu komentar atau jawaban Islami singkat yang sangat relevan, sopan, dan santun dalam Bahasa Indonesia untuk postingan berikut.
      
      Konten Postingan: "${postContent}"
      
      Tipe Postingan: ${isPrayerRequest ? "Permintaan Doa (Prayer Request)" : "Postingan Komunitas Umum"}
      
      Aturan Penulisan:
      1. SANGAT PENTING: Periksa apakah postingan berisi pertanyaan atau keraguan (baik eksplisit dengan tanda tanya maupun implisit seperti meminta penjelasan/saran/masukan). Jika ya, maka AI HARUS MENJAWAB/MENERANGKAN pertanyaan tersebut dengan bijak, ramah, padat, dan didasarkan pada nilai-nilai keislaman Aswaja khas santri yang teduh. Jawab langsung secara ringkas dalam 1-2 kalimat.
      2. Jika postingan adalah Permintaan Doa, buatlah doa yang tulus, menyentuh hati, dan tulus ikhlas (misal diawali dengan "Aamiin ya Rabbal 'Alamin..." atau doa keberkahan, kesembuhan, kelancaran, dll yang spesifik sesuai isi permintaan doa).
      3. Jika postingan adalah Postingan Komunitas Umum dan tidak ada pertanyaan, buatlah komentar yang mendukung, memotivasi, memberi salam, atau memberikan pandangan Islami yang positif dan ramah khas santri.
      4. Jangan terlalu panjang, buatlah cukup dalam 1 atau 2 kalimat saja agar padat, sopan, dan santun.
      5. Jangan gunakan bahasa yang kaku, gunakan bahasa Indonesia yang hangat, akrab, sopan, dan bersahabat.`,
      config: {
        systemInstruction: "Anda adalah seorang santri cerdas yang bijak, sopan, ramah, berwawasan keilmuan Islam yang luas (kitab kuning), dan selalu mendoakan kebaikan serta menjawab pertanyaan sesama dengan tutur kata yang sangat santun di media sosial.",
        temperature: 0.7,
        maxOutputTokens: 4096,
      }
    });
    return response.text || "Masya Allah, semoga barokah.";
  });
  return resultText.trim();
};

export const scanImage = async (base64Data: string, mimeType: string): Promise<string> => {
  return await callWithRetry(async (ai, model) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Extract all text from this image. If it is Arabic, maintain the script." }
        ]
      },
      config: {
        maxOutputTokens: 4096
      }
    });
    return response.text || "";
  });
};

export const generateQuizQuestion = async (topic: string, difficulty: string): Promise<QuizQuestion> => {
  const prompt = `
    Buatlah 1 soal kuis pilihan ganda Islam yang UNIK dan BERVARIASI. 
    Topik: ${topic}. 
    Kesulitan: ${difficulty}.
    
    INSTRUKSI KHUSUS: 
    - Jangan membuat soal yang terlalu umum (seperti rukun Islam/Iman). 
    - Pilih sub-topik yang spesifik dari ilmu ${topic}. 
    - Berikan pilihan jawaban yang menantang dan masuk akal.
    - Sertakan penjelasan (syarah) ringkas mengapa jawaban tersebut benar.
    
    JSON format: { "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "..." }
  `;
  return generateJson(prompt, "Pakar pendidikan Islam and ahli Kitab Kuning.", true);
};

export const verifyRecitation = async (targetText: string, userSpeech: string): Promise<{ isCorrect: boolean; feedback: string }> => {
  const prompt = `Bandingkan teks target dengan hasil transkripsi suara (speech-to-text). Teks Target: "${targetText}" Hasil Suara: "${userSpeech}" Output JSON: { "isCorrect": boolean, "feedback": "string" }`;
  return generateJson(prompt, "Pakar Tajwid and Al-Quran.", true);
};

export const generateEssayQuestion = async (topic: string, difficulty: string): Promise<EssayQuestion> => {
  const prompt = `Buatlah 1 soal esai Islam. Topik: ${topic}. JSON: { "type": "Tantangan", "question": "...", "clue": "...", "answerKey": "...", "explanation": "..." }`;
  return generateJson(prompt, "Pakar pendidikan Islam.", true);
};

export const checkEssayAnswer = async (question: string, answerKey: string, userEntry: string): Promise<{ isCorrect: boolean; feedback: string }> => {
  const prompt = `Koreksi jawaban. Q: "${question}" Key: "${answerKey}" User: "${userEntry}" Output JSON: { "isCorrect": boolean, "feedback": "string" }`;
  return generateJson(prompt, "Pakar pendidikan Islam.", true);
};

export const findNearbyIslamicPlaces = async (type: 'masjid' | 'pesantren', lat: number, lng: number, address?: string): Promise<any[]> => {
  const query = address ? `${type} terdekat di ${address}` : `${type} terdekat koordinat ${lat}, ${lng}`;
  const cacheKey = `nearby:${type}:${lat.toFixed(3)}:${lng.toFixed(3)}`;
  
  const cached = await fetchFromGitHub('cache', cacheKey);
  if (cached && Array.isArray(cached)) return cached;

  const prompt = `
    Cari daftar 5 ${type} terdekat dari lokasi: ${query}.
    Gunakan Google Search untuk mendapatkan data akurat (nama, alamat, jarak kira-kira, dan rating jika ada).
    
    Output JSON array:
    [
      {
        "name": "Nama ${type}",
        "address": "Alamat Lengkap",
        "distance": "Jarak (misal: 1.2 km)",
        "rating": number (1-5),
        "mapsUrl": "URL Google Maps",
        "phone": "Nomor Telepon (jika ada)",
        "desc": "Deskripsi singkat keunggulan/ciri khas"
      }
    ]
  `;

  const result = await callWithRetry(async (ai, model) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah asisten pencari lokasi fasilitas Islami yang akurat. Gunakan Google Search grounding.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });
    
    if (response.text === undefined) throw new Error("Gagal mendapatkan respon lokasi.");
    return parseJsonSafely(cleanJson(response.text));
  });

  queueBackgroundTask(async () => {
    await saveToGitHub('cache', cacheKey, result);
  });
  return result;
};

export const recommendPesantrenAI = async (query: string, criteria: { type?: string, focus?: string, region?: string, isAswaja?: boolean }): Promise<any[]> => {
  const cacheKey = `pesantren_rec:${query.trim().toLowerCase()}:${JSON.stringify(criteria)}`;
  
  const cached = await fetchFromGitHub('cache', cacheKey);
  if (cached && Array.isArray(cached)) return cached;

  const prompt = `
    Rekomendasikan daftar 7-10 Pondok Pesantren atau Lembaga Pendidikan Islam (seperti Madrasah/Darul Uloom) baik di Indonesia maupun di Dunia berdasarkan pencarian: "${query}".
    Kriteria tambahan: 
    - Tipe: ${criteria.type || 'Semua'}
    - Fokus: ${criteria.focus || 'Semua'}
    - Wilayah: ${criteria.region || 'Seluruh Dunia'}
    - Khusus Ahlussunnah wal Jama'ah (Aswaja): ${criteria.isAswaja ? 'YA (Prioritaskan yang berakidah Aswaja/Madzhab 4/Asy\'ariyah/Maturidiyah)' : 'Tidak Dibatasi'}
    
    Cari lembaga yang valid, memiliki reputasi baik. Jika di Indonesia, pastikan akurasinya tinggi. Jika luar negeri, sertakan nama internasionalnya.
    Gunakan Google Search untuk memastikan data (alamat, ciri khas, program unggulan, dan link/info kontak).
    
    Output JSON array:
    [
      {
        "name": "Nama Pesantren / Institution Name",
        "location": "Kota, Negara (Country)",
        "type": "Salaf / Modern / Darul Uloom / International",
        "focus": "Tahfidz / Kitab Kuning / Bahasa / Sharia / Academic",
        "curriculum": "Kurikulum yang digunakan",
        "description": "Deskripsi singkat profil, akidah (jika relevan), dan keunggulan",
        "mapsUrl": "URL Google Maps",
        "website": "URL Website jika ada",
        "phone": "Nomor Telepon/Kontak"
      }
    ]
  `;

  const result = await callWithRetry(async (ai, model) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah konsultan pendidikan Islam (Pesantren) global. Rekomendasi Anda harus akurat, inklusif (fokus pada kualitas), and mengutamakan rujukan valid.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });
    
    if (response.text === undefined) throw new Error("Gagal mendapatkan rekomendasi pesantren.");
    return parseJsonSafely(cleanJson(response.text));
  });

  queueBackgroundTask(async () => {
    await saveToGitHub('cache', cacheKey, result);
  });
  return result;
};

export const generateNewsAI = async (sourceOrTopic: string): Promise<{ 
  title: string; 
  excerpt: string; 
  content: string; 
  category: string; 
  youtubeId?: string;
  suggestedImageUrl?: string;
  grounding_source?: string;
}> => {
  // Cek apakah input berupa link YouTube
  let youtubeId: string | undefined;
  const ytMatch = sourceOrTopic.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    youtubeId = ytMatch[1];
  }

  const isUrl = sourceOrTopic.trim().startsWith('http://') || sourceOrTopic.trim().startsWith('https://');

  const prompt = `
    Anda adalah jurnalis dan redaktur senior khusus dunia Islam, Pendidikan, Pesantren, dan Warta Nusantara.
    ${isUrl ? `
    Pengguna memberikan tautan/URL berikut: "${sourceOrTopic}".
    ${youtubeId ? `Ini adalah tautan Video YouTube (ID: ${youtubeId}). Rangkum dan kembangkan topik, kajian, atau warta video ini menjadi artikel berita jurnalistik yang komprehensif, informatif, dan mendalam.` : `Ini adalah tautan Berita / Web. Analisis topik inti dari tautan ini dan susun ulang menjadi artikel berita orisinal dengan bahasa jurnalistik yang mengalir dan santun.`}
    ` : `
    Buatlah berita mendalam dan informatif berdasarkan input topik/judul berikut: "${sourceOrTopic}".
    `}
    
    Output JSON Wajib:
    {
      "title": "Judul Berita yang Menarik, Lugas & Sesuai Kaidah Jurnalistik",
      "excerpt": "Ringkasan berita dalam 1-2 kalimat (Lead/Teras Berita).",
      "content": "Isi berita lengkap minimal 3-5 paragraf yang mengalir, mendalam, kaya informasi, dan menggunakan gaya bahasa jurnalistik santun.",
      "category": "Warta"
    }
    
    Pilihan Kategori wajib salah satu dari: "Warta", "Pesantren", "Hikmah", "Tekno-Islam", "Internasional".
  `;

  const result = await callWithRetry(async (ai, model) => {
    let parsed: any = null;
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: "Anda adalah redaktur berita Islami dan pesantren profesional.",
          responseMimeType: "application/json"
        }
      });
      
      if (response.text) {
        parsed = parseJsonSafely(cleanJson(response.text));
      }
    } catch (e) {
      console.warn("[NewsAI] Primary JSON request failed, trying fallback...", e);
    }

    if (!parsed || (!parsed.title && !parsed.content)) {
      const fallbackResp = await ai.models.generateContent({
        model: model,
        contents: prompt + "\n\nSampaikan HANYA dalam format JSON valid tanpa teks lain.",
        config: {
          systemInstruction: "Anda adalah redaktur berita Islami dan pesantren profesional."
        }
      });

      if (!fallbackResp.text) throw new Error("Gagal mendapatkan respon berita dari AI.");
      parsed = parseJsonSafely(cleanJson(fallbackResp.text));
    }

    if (!parsed || (!parsed.title && !parsed.content)) {
      throw new Error("Gagal menguraikan jawaban berita AI.");
    }

    let suggestedImageUrl: string | undefined;
    if (youtubeId) {
      suggestedImageUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }

    return {
      title: parsed.title || '',
      excerpt: parsed.excerpt || '',
      content: parsed.content || '',
      category: parsed.category || 'Warta',
      youtubeId,
      suggestedImageUrl
    };
  });

  return result;
};

/**
 * Generates a contextual editorial image URL based strictly on news title and content.
 * Menjamin kesesuaian syariat Islam (tutup aurat, peci hitam/kopiah untuk pria, jilbab syar'i untuk wanita).
 */
export const generateNewsImageByContextAI = async (title: string, content: string, category: string = 'Warta'): Promise<string> => {
  if (!title.trim() && !content.trim()) return '';

  const prompt = `
    Analisis judul, kategori, dan isi artikel warta berita Islami berikut secara cermat:
    Judul Berita: "${title}"
    Kategori: "${category}"
    Isi Berita: "${content.slice(0, 1200)}"

    Tugas Anda:
    Buat deskripsi visual foto jurnalistik (editorial photo prompt) dalam Bahasa Inggris yang SANGAT AKURAT, NYATA, dan RELEVAN dengan konteks berita di atas.

    ATURAN MUTLAK SYARIAT ISLAM & KESOPANAN (WAJIB DIIKUTI):
    1. Jika ada figur/tokoh/santri manusia dalam gambar:
       - WAJIB MENUTUP AURAT SEMPURNA secara Islami dan santun.
       - Pria / Santri Putra: WAJIB mengenakan Peci hitam (Indonesian black peci songkok cap) atau kopiah/sorban putih rapi, memakai baju koko santun berkerah atau pakaian muslim rapi.
       - Wanita / Santri Putri: WAJIB mengenakan Jilbab / Hijab / Kerudung syar'i rapi yang menutup kepala, rambut, dan leher secara sempurna serta pakaian gamis longgar sopan.
       - DILARANG KERAS menampilkan aurat terbuka, pakaian minim, atau wanita tanpa hijab.
    2. Nuansa khas Pesantren Nusantara, arsitektur Islami megah, kegiatan literasi/kajian kitab, atau musyawarah beradab.
    3. Gaya visual: Realistic documentary photojournalism, natural soft daylight, professional news photography, 8k resolution.

    Output JSON Wajib:
    {
      "image_prompt_en": "photorealistic editorial photo of Indonesian santri wearing traditional black peci songkok caps and modest koko shirts in pesantren aula..."
    }
  `;

  try {
    const result = await callWithRetry(async (ai, model) => {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: "Anda adalah photo director dan kurator foto jurnalistik Islam terkemuka yang menjunjung tinggi etika dan syariat Islam.",
          responseMimeType: "application/json"
        }
      });
      if (response.text) {
        const parsed = parseJsonSafely(cleanJson(response.text));
        if (parsed && parsed.image_prompt_en) {
          let cleanPrompt = parsed.image_prompt_en.replace(/["\n\r]/g, ' ').trim();
          
          // Pastikan penguat syariat selalu tersertifikasi di prompt akhir
          cleanPrompt += ", indonesian muslim santri with black peci songkok cap, women in modest islamic hijab headscarf, fully covered aurat, respectful islamic clothing, pesantren atmosphere, documentary editorial news photo, high quality 8k";

          const seed = Math.floor(Math.random() * 900000) + 100000;
          const generatedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1200&height=675&nologo=true&seed=${seed}`;
          return generatedUrl;
        }
      }
      return null;
    });
    if (result) return result;
  } catch (err) {
    console.warn("Context image AI generation failed, using category fallback:", err);
  }

  // Fallback to high quality category image if network/AI is busy
  const categoryPools: Record<string, string[]> = {
    'Pesantren': [
      'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop'
    ],
    'Hikmah': [
      'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590076175571-4b5459efb08c?q=80&w=1200&auto=format&fit=crop'
    ],
    'Tekno-Islam': [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop'
    ],
    'Internasional': [
      'https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590076175571-4b5459efb08c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1200&auto=format&fit=crop'
    ],
    'Warta': [
      'https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1200&auto=format&fit=crop'
    ]
  };
  const pool = categoryPools[category] || categoryPools['Warta'];
  return pool[Math.floor(Math.random() * pool.length)];
};

/**
 * Generates Islamic Nasheed/Poetry lyrics.
 */
export const generateNasheedLyrics = async (topic: string, style: string): Promise<any> => {
  const prompt = `
    Bertindaklah sebagai penyair Muslim dan pencipta nasyid kontemporer.
    Buatlah lirik nasyid yang syahdu dan bermakna tentang tema: "${topic}".
    Gaya nasyid: "${style}".
    
    Format JSON:
    {
      "title": "Judul Nasyid",
      "lyrics": "Lirik lengkap (Bentuk bait, sertakan reff/chorus)",
      "meaning": "Pesan moral dari lirik ini",
      "rhythm_tip": "Saran tempo dan alat musik (misal: rebana, perkusi, atau orkestra simfoni)"
    }
  `;
  return generateJson(prompt, "Penyair Islami dan Komposer Nasyid Modern.");
};

/**
 * Generates a music backing track using Lyria models.
 */
export const generateMusicAI = async (prompt: string, duration: 'clip' | 'pro' = 'clip'): Promise<{ audioUrl: string; lyrics?: string }> => {
  const model = duration === 'clip' ? "lyria-3-clip-preview" : "lyria-3-pro-preview";
  
  return await callWithRetry(async (ai) => {
    const responseStream = await ai.models.generateContentStream({
      model,
      contents: `Generate an Islamic-themed track: ${prompt}. ${duration === 'pro' ? 'Make it a full-length high quality production.' : '30-second high quality clip.'}`,
      config: {
        responseModalities: [Modality.AUDIO]
      }
    });

    let audioBase64 = "";
    let lyrics = "";
    let mimeType = "audio/wav";

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (!audioBase64) throw new Error("Gagal menghasilkan musik.");

    const binary = atob(audioBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    const audioUrl = URL.createObjectURL(blob);
    
    return { audioUrl, lyrics };
  });
};

/**
 * Generates an Islamic-themed image for content backgrounds.
 */
export const generateImageAI = async (prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1"): Promise<string> => {
  return await callWithRetry(async (ai) => {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          {
            text: `High-quality Islamic themed visualization, spiritual atmosphere, premium aesthetic, suitable for background: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio,
        },
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Gagal menghasilkan gambar.");
  });
};

/**
 * Enhanced TTS with sample rate 24000 support and latest model.
 */
export const generateSpeech = async (text: string, isArabic: boolean): Promise<string> => {
  const cacheType = isArabic ? 'tts_ar' : 'tts_id';
  const cached = await fetchFromGitHub('cache', text);
  if (cached && cached.audioUrl) return cached.audioUrl;

  const audioBase64 = await callWithRetry(async (ai) => {
    const voiceName = isArabic ? 'Charon' : 'Puck'; 
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `${isArabic ? 'Read accurately with tajweed:' : 'Baca dengan nada inspiratif:'} ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!data) throw new Error("Gagal menghasilkan suara AI.");
    return data;
  });

  const binary = atob(audioBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'audio/mpeg' });
  const audioUrl = URL.createObjectURL(blob);

  // Caching specifically for audio URLs is disabled as Supabase storage is removed.
  // We only return the local Object URL for now.

  return audioUrl;
};

export const QUOTE_THEMES = [
  { id: 'grad-emerald-gold', name: 'Emerald Gold', class: 'bg-gradient-to-br from-emerald-600 via-emerald-500 to-amber-400 text-white border-transparent' },
  { id: 'grad-indigo-purple', name: 'Indigo Purple', class: 'bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white border-transparent' },
  { id: 'grad-rose-amber', name: 'Sunset', class: 'bg-gradient-to-br from-rose-600 via-orange-500 to-amber-400 text-white border-transparent' },
  { id: 'grad-blue-cyan', name: 'Ocean', class: 'bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-400 text-white border-transparent' },
  { id: 'grad-slate-zinc', name: 'Midnight', class: 'bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-600 text-white border-transparent' },
  { id: 'grad-teal-lime', name: 'Forest', class: 'bg-gradient-to-br from-teal-700 via-teal-600 to-lime-500 text-white border-transparent' },
  { id: 'grad-violet-fuchsia', name: 'Magic', class: 'bg-gradient-to-br from-violet-700 via-fuchsia-600 to-purple-500 text-white border-transparent' },
  { id: 'grad-deep-green', name: 'Deep Moss', class: 'bg-gradient-to-br from-green-900 via-emerald-800 to-teal-700 text-white border-transparent' },
  { id: 'grad-royal-gold', name: 'Royal Gold', class: 'bg-gradient-to-br from-amber-700 via-amber-600 to-yellow-400 text-white border-transparent' },
  { id: 'grad-midnight-lavender', name: 'Midnight Lavender', class: 'bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-800 text-white border-transparent' },
  { id: 'grad-ocean-breeze', name: 'Ocean Breeze', class: 'bg-gradient-to-br from-cyan-600 via-teal-500 to-emerald-400 text-white border-transparent' },
  { id: 'grad-ruby-wine', name: 'Ruby Wine', class: 'bg-gradient-to-br from-rose-900 via-red-800 to-pink-700 text-white border-transparent' },
  { id: 'grad-copper-rust', name: 'Copper Rust', class: 'bg-gradient-to-br from-orange-900 via-orange-800 to-amber-700 text-white border-transparent' },
  { id: 'grad-cyber-neon', name: 'Cyber Neon', class: 'bg-gradient-to-br from-fuchsia-700 via-blue-600 to-cyan-500 text-white border-transparent' },
  { id: 'grad-morning-zen', name: 'Morning Zen', class: 'bg-gradient-to-br from-teal-400 via-emerald-400 to-lime-300 text-slate-900 border-transparent' },
  { id: 'grad-earth-clay', name: 'Earth Clay', class: 'bg-gradient-to-br from-yellow-900 via-orange-900 to-stone-800 text-white border-transparent' },
];

export async function fetchChapterDetail(bookName: string, author: string, chapterTitle: string): Promise<{ arabic: string, translation: string, titleArabic: string }> {
  const prompt = `
    Tolong berikan teks Arab asli dan terjemahan bahasa Indonesia untuk bab/fasal berikut:
    KITAB: ${bookName}
    PENULIS: ${author}
    BAB/FASAL: ${chapterTitle}

    Ketentuan:
    1. Berikan teks Arab dengan harakat lengkap dan rapi.
    2. Berikan terjemahan bahasa Indonesia yang akurat dan mudah dipahami (sesuai gaya santri).
    3. Berikan judul bab dalam bahasa Arab (titleArabic).

    OUTPUT HARUS DALAM FORMAT JSON BERSIH (HANYA JSON):
    {
      "arabic": "...",
      "translation": "...",
      "titleArabic": "..."
    }
  `;

  return generateJson(prompt, "Anda adalah ahli bedah kitab kuning yang membantu memberikan teks asli dan terjemahannya.");
}

export async function fetchEbookChapters(bookName: string, author?: string): Promise<{ 
  profile: { 
    name: string, 
    originalTitle: string, 
    author: string, 
    field: string, 
    translator?: string, 
    about?: string,
    coverImage?: string,
    authorBorn?: string,
    authorDied?: string,
    authorCentury?: string
  },
  chapters: { title: string, titleArabic: string, arabic: string, translation: string }[] 
}> {
  const slug = getSlug(bookName);
  
  // 1. Cek Local Curated Data di public folder (Runtime fetch)
  const localTargets = [slug, slug.replace('terjemah-', ''), slug.replace('kitab-', '')];
  for (const target of localTargets) {
    try {
      const response = await fetch(`/data/ebooks/${target}.json`);
      if (response.ok) {
          const data = await response.json();
          if (data && data.chapters) {
            // Auto-save to GitHub so others can use it
            queueBackgroundTask(async () => {
              await saveToGitHub('ebooks', slug, data);
            });
            return data;
          }
      }
    } catch (e) {}
  }

  // 2. Cek GitHub/Storage Curated (Dynamic)
  try {
    const curatedData = await fetchFromGitHub('ebooks', slug);
    if (curatedData && curatedData.chapters) {
      return curatedData;
    }
  } catch (e) {}

  const prompt = `
    Bertindaklah sebagai Ahli Manuskrip Kitab Kuning (Turath) senior dan Pustakawan Digital Maktabah.
    
    TUGAS ANDA: Hasilkan isi LENGKAP DAN SISTEMATIS dari kitab: "${bookName}" (${author || 'Karya Ulama'}).
    
    KRITERIA WAJIB BERDASARKAN STANDAR AKADEMIK PESANTREN:
    1. JANGAN MERINGKAS. Jika kitab memiliki daftar bab standar (bahkan poin-poin terkecil), Anda HARUS menyertakan SEMUANYA.
    2. STRUKTUR: Ikuti alur muallif asli (Muqaddimah -> Seluruh Bab/Fasl standar -> Khatimah).
    3. TEKS ARAB: Harus teks matan asli, LENGKAP dengan harakat/syakal yang akurat.
    4. TERJEMAHAN: Bahasa Indonesia yang akurat dan menjaga nuansa turath.
    5. JUMLAH BAB: Berikan sebanyak mungkin bab (minimal 50-70 bab untuk kitab menengah, atau seluruh sub-bab kecil untuk kitab ringkas). 
       CONTOH: Untuk Safinatun Najah, sertakan mulai dari Muqaddimah, Rukun Islam/Iman, hingga pembahasan detail Shalat, Jenazah, Zakat, dan Puasa (Khatimah). Pengguna menginginkan detail hingga ke poin-poin terkecil seperti "Tasydid Al-Fatihah", "Anggota Sujud", dll.

    STRUKTUR OUTPUT JSON:
    {
      "profile": {
        "name": "${bookName}",
        "originalTitle": "Judul asli Arab dengan harakat",
        "author": "Nama Lengkap Pengarang & Gelar",
        "field": "Bidang Ilmu (Fiqih, Tauhid, dll)",
        "about": "Deskripsi mendalam 5-6 kalimat tentang kitab ini.",
        "authorBorn": "Info Kelahiran",
        "authorDied": "Info Wafat",
        "authorCentury": "Abad/Masa Hidup"
      },
      "chapters": [
        {
          "title": "Judul Bab (Indonesia)",
          "titleArabic": "Judul Bab (Arab ber-harakat)",
          "arabic": "Teks Arab matan bab ini (LENGKAP)",
          "translation": "Terjemahan lengkap bab ini"
        },
        ... (Daftar bab lengkap tanpa terpotong)
      ]
    }
  `;

  const result = await callWithRetry(async (ai, model) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });

    if (response.text === undefined) throw new Error("Gagal mendapatkan isi kitab.");
    return parseJsonSafely(cleanJson(response.text));
  });

  // 3. Auto-save AI Generated result to GitHub
  if (result && result.chapters) {
    queueBackgroundTask(async () => {
      await saveToGitHub('ebooks', slug, result);
    });
  }

  return result;
}

// --- GENERATOR MATERI PUBLIC SPEAKING ISLAMI (CERAMAH, QORI, KULTUM, MC, SAMBUTAN, KHUTBAH) ---
export interface SpeechMaterialParams {
  type: 'ceramah' | 'qori' | 'kultum' | 'mc' | 'sambutan' | 'khutbah';
  category: string;
  language?: 'indonesia' | 'jawa' | 'sunda' | 'arab_indo';
  audience?: 'umum' | 'pemuda' | 'majelis_taklim' | 'santri' | 'pejabat';
  duration?: '5min' | '10-15min' | '20-30min';
  speakerName?: string;
  eventName?: string;
  customNotes?: string;
  deliveryStyles?: string[];
  // Qori specific options
  showLatin?: boolean;
  showTranslation?: boolean;
  qoriMaqam?: string[];
  qoriLength?: string;
  qoriTajwidGuide?: boolean;
}

export const generateSpeechMaterialAI = async (params: SpeechMaterialParams) => {
  const {
    type,
    category,
    language = 'indonesia',
    audience = 'umum',
    duration = '10-15min',
    speakerName = '',
    eventName = '',
    customNotes = '',
    deliveryStyles = [],
    showLatin = true,
    showTranslation = true,
    qoriMaqam = [],
    qoriLength = 'Standar (1 Halaman / Maqra Sholat)',
    qoriTajwidGuide = true
  } = params;

  const prompt = `
    Bertindaklah sebagai Pakar Retorika Dakwah Islami, Dai Senior Pesantren, Khathib, dan Master Of Qori / Tilawah Al-Quran Berpengalaman (Qori Internasional & Dewan Hakim MTQ).

    TUGAS: Hasilkan materi public speaking Islami / panduan tilawah Qori berkualitas tinggi, autentik, berbobot ilmiah-spiritual, dan tertata sangat rapi untuk kebutuhan berikut:

    - Tipe Materi: ${type.toUpperCase()} (${type === 'ceramah' ? 'Ceramah/Pengajian Umum' : type === 'qori' ? 'Panduan & Teks Qori/Pembaca Al-Quran' : type === 'kultum' ? 'Kultum / Kuliah Tujuh Menit' : type === 'mc' ? 'Teks Pembawa Acara / MC' : type === 'sambutan' ? 'Pidato Sambutan' : 'Khutbah Jumat / Hari Raya'})
    - Kategori / Tema Hari Besar Islam: ${category}
    - Bahasa: ${language === 'jawa' ? 'Bahasa Jawa (Krama Alus / Inggil Islami)' : language === 'sunda' ? 'Bahasa Sunda (Lemes / Halus)' : language === 'arab_indo' ? 'Kombinasi Bahasa Arab-Indonesia' : 'Bahasa Indonesia yang santun, indah, dan inspiratif'}
    - Target Audiens: ${audience === 'pemuda' ? 'Remaja / Pemuda Masjid' : audience === 'majelis_taklim' ? 'Ibu-ibu / Bapak-bapak Majelis Taklim' : audience === 'santri' ? 'Santri / Anak-Anak Pesantren' : audience === 'pejabat' ? 'Acara Formal / Instansi / Pejabat' : 'Jamaah Umum'}
    - Estimasi Durasi: ${duration === '5min' ? 'Singkat Padat (5-7 Menit)' : duration === '20-30min' ? 'Mendalam dan Panjang (20-30 Menit)' : 'Sedang (10-15 Menit)'}
    ${type !== 'qori' && deliveryStyles && deliveryStyles.length > 0 ? `- Gaya / Nuansa Penyampaian WAJIB: ${deliveryStyles.join(', ')} (Sangat Penting: Masukkan elemen seperti humor santun, pantun, puisi, ketegasan, atau keharuan sesuai pilihan ini ke dalam isi naskah!)` : ''}
    ${type === 'qori' ? `
    [PENGATURAN KHUSUS QORI / TILAWAH]:
    - Nada / Irama Tilawah (Maqam) WAJIB: ${qoriMaqam && qoriMaqam.length > 0 ? qoriMaqam.join(', ') : 'Bayati, Hijaz, Rast'} (Sajikan catatan petunjuk tingkatan nada/maqam pada setiap bait/ayat!)
    - Tampilkan Transliterasi Teks Latin: ${showLatin ? 'Ya (Sertakan transliterasi latin presisi)' : 'Tidak (Hanya Teks Arab berharakat & Terjemahan)'}
    - Tampilkan Terjemahan Bahasa Indonesia: ${showTranslation ? 'Ya (Sertakan terjemahan)' : 'Tidak'}
    - Panjang Rangkaian Ayat (Maqra'): ${qoriLength}
    - Panduan Tajwid & Tanda Berhenti/Waqaf: ${qoriTajwidGuide ? 'Ya (Berikan catatan hukum tajwid penting & saran waqaf/ibtida)' : 'Tidak'}
    ` : ''}
    ${speakerName ? `- Nama Pembicara/MC/Khathib/Qori: ${speakerName}` : ''}
    ${eventName ? `- Nama Acara/Masjid/Pesantren: ${eventName}` : ''}
    ${customNotes ? `- Poin/Catatan Khusus dari Pengguna: ${customNotes}` : ''}

    PETUNJUK SPESIFIK TIPE:
    - KHUTBAH: HARUS memuat Khutbah Pertama (Muqaddimah Arab lengkap dengan Hamdalah, Syahadat, Sholawat, Wasiat Taqwa, Ayat Quran, Isi Pesan, Penutup Ayat) dan Khutbah Kedua (Hamdalah, Sholawat, Wasiat Taqwa, Doa Arab untuk Muslimin/Muslimat, Rabbaniyyah & Penutup).
    - MC: HARUS memuat Rundown/Susunan Acara lengkap, Teks Pembukaan, Teks Transisi Antar Agenda, Pengenalan Pembicara/Qori, dan Teks Penutup.
    - QORI: HARUS memuat Ta'awudz & Basmalah, Teks Muqaddimah Pembuka Qori (Arab + Terjemah), Rangkaian Ayat/Surah Al-Quran berharakat yang sangat relevan dengan tema "${category}", ${showLatin ? 'Teks Latin,' : ''} ${showTranslation ? 'Terjemahan,' : ''} Catatan Maqam/Irama (${qoriMaqam.join(', ')}), ${qoriTajwidGuide ? 'Panduan Tajwid & Waqaf,' : ''} serta Teks Penutup Pembacaan Quran (Shadaqallahul 'Adzim).
    - CERAMAH / KULTUM / SAMBUTAN: HARUS memuat Muqaddimah Arab (Puji Syukur, Sholawat, Sapaan Hormat), Poin-Poin Utama Berisi Dalil Al-Quran & Hadits (Arab berharakat + Terjemahan), Pesan Moral Praktis, serta Penutup & Doa.

    OUTPUT FORMAT JSON (Strictly Output Single JSON Object):
    {
      "title": "Judul Materi yang Menarik dan Berkesan",
      "subtitle": "Subjudul / Tema Spesifik",
      "type": "${type}",
      "category": "${category}",
      "muqaddimah": {
        "arabic": "Teks Muqaddimah Arab lengkap dengan harakat",
        "latin": "Transliterasi Latin muqaddimah",
        "translation": "Terjemahan muqaddimah"
      },
      "themeOverview": "Ringkasan latar belakang & keutamaan tema ini...",
      "contentBlocks": [
        {
          "heading": "Judul Poin / Bagian",
          "body": "Penjelasan rinci dan narasi penyampaian...",
          "dalil": {
            "arabic": "Ayat / Hadits Arab berharakat (jika ada)",
            "latin": "Transliterasi Latin dalil",
            "translation": "Terjemahan dalil",
            "source": "Nama Surah/Ayat atau Perawi Hadits (e.g. HR. Bukhari)"
          }
        }
      ],
      "khutbahTwo": {
        "arabic": "Teks Khutbah Kedua Arab lengkap (jika khutbah)",
        "translation": "Terjemahan khutbah kedua",
        "duaArabic": "Doa khutbah kedua Arab berharakat"
      },
      "mcRundown": [
        {
          "step": 1,
          "time": "08.00 - 08.15",
          "title": "Pembukaan oleh MC",
          "script": "Naskah ucapan MC..."
        }
      ],
      "qoriGuide": {
        "recommendedSurahs": ["QS. Al-Isra': 1-12", "QS. Al-Anbiya': 107"],
        "openingScript": "Naskah ucapan qori sebelum tilawah...",
        "closingScript": "Naskah ucapan qori sesudah tilawah (Shadaqallahul 'Adzim)..."
      },
      "closing": {
        "summary": "Kesimpulan akhir materi...",
        "arabicDua": "Teks Doa Arab Penutup",
        "translation": "Terjemahan doa penutup"
      },
      "deliveryTips": [
        "Tips intonasi, ekspresi, dan tempo penyampaian 1...",
        "Tips intonasi 2..."
      ]
    }
  `;

  return callWithRetry(async (ai, model) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });

    if (!response.text) throw new Error("Gagal membuat materi public speaking.");
    return parseJsonSafely(cleanJson(response.text));
  });
};

