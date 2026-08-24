import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { getRotatedGeminiClient, getRotatedGeminiModel } from "./geminiService";
import { fetchFromGitHub, saveToGitHub } from "./githubDataService";

export interface MunawwirWordDetail {
  arabic: string;
  arabicHarokat: string;
  latin: string;
  wordType: 'isim' | 'fiil' | 'harf' | 'tarkib' | string;
  wordTypeIndo: string; // e.g. "Fi'il Tsulatsi Mujarrad (فَعَلَ - يَفْعُلُ)", "Isim Masdar", "Jamak Taksir"
  root: string; // Akar kata / Jadzr (e.g. ع - ل - م)
  wazan?: string; // e.g. فَعَلَ - يَفْعُلُ
  page?: number | string; // Halaman dalam Kamus Al-Munawwir (edisi fisik/archive)
  referenceBook?: string; // Nama kitab rujukan misal "Kamus Al-Munawwir Arab-Indonesia Cetakan 14 / Krapyak"
  referenceUrl?: string; // Link rujukan/baca online jika ada
  tashrifBrief?: {
    madhi?: string;
    mudhari?: string;
    mashdar?: string;
    fail?: string;
    maful?: string;
    amr?: string;
    nahyi?: string;
  };
  singular?: string; // Mufrod jika input jamak
  plural?: string; // Bentuk Jamak Taksir / Muannats (e.g. عُلَمَاءُ)
  gender?: 'mudzakkar' | 'muannats' | 'musytarak';
  transitivity?: 'mutaaddi' | 'lazim' | 'keduanya';
  meanings: string[]; // Definisi lengkap gaya Kamus Al-Munawwir
  contextualMeanings?: Array<{
    preposition?: string; // e.g. "رَغِبَ فِي" vs "رَغِبَ عَنْ"
    arabicPhrase: string;
    meaning: string;
  }>;
  examples: Array<{
    arabic: string;
    latin?: string;
    translation: string;
    context?: string;
  }>;
  synonyms?: string[]; // Muradifat (Kata sepadan)
  antonyms?: string[]; // Dhidd / Lawan kata
  derivedWords?: Array<{
    arabic: string;
    meaning: string;
    type?: string;
  }>;
  notes?: string; // Catatan lughah / shorof penting ala KH. Ahmad Warson Munawwir
}

export interface MunawwirSearchResult {
  query: string;
  mode: 'ar-id' | 'id-ar';
  found: boolean;
  entries: MunawwirWordDetail[];
  totalResults: number;
  source: 'offline' | 'cache' | 'api';
}

// 📚 OFFLINE CURATED VOCABULARY DATABASE (Fallback Cepat & Populer ala Kamus Munawwir)
export const OFFLINE_MUNAWWIR_DATA: Record<string, MunawwirWordDetail> = {
  "علم": {
    arabic: "عَلِمَ",
    arabicHarokat: "عَلِمَ - يَعْلَمُ - عِلْمًا",
    latin: "'alima - ya'lamu - 'ilman",
    wordType: "fiil",
    wordTypeIndo: "Fi'il Tsulatsi Mujarrad (فَعِلَ - يَفْعَلُ)",
    root: "ع - ل - م",
    wazan: "فَعِلَ - يَفْعَلُ",
    tashrifBrief: {
      madhi: "عَلِمَ",
      mudhari: "يَعْلَمُ",
      mashdar: "عِلْمًا",
      fail: "عَالِمٌ",
      maful: "مَعْلُومٌ",
      amr: "اِعْلَمْ",
      nahyi: "لَا تَعْلَمْ"
    },
    plural: "عُلَمَاءُ (untuk Isim Fa'il: Alim)",
    gender: "mudzakkar",
    transitivity: "mutaaddi",
    meanings: [
      "Mengetahui, mengenal, mengerti, memahami sesuatu hakikat perkara",
      "Memiliki pengetahuan mendalam atau ilmu",
      "Meyakini / memastikan suatu kabar kebenaran"
    ],
    contextualMeanings: [
      {
        preposition: "عَلِمَ بِـ",
        arabicPhrase: "عَلِمَ بِالأَمْرِ",
        meaning: "Mengetahui / mendengar perihal urusan tersebut"
      },
      {
        preposition: "عَلَّمَ (Taf'il)",
        arabicPhrase: "عَلَّمَ يُعَلِّمُ تَعْلِيمًا",
        meaning: "Mengajarkan, mendidik, mentransfer ilmu pengetahuan"
      },
      {
        preposition: "تَعَلَّمَ (Tafa''ul)",
        arabicPhrase: "تَعَلَّمَ يَتَعَلَّمُ تَعَلُّمًا",
        meaning: "Belajar, menuntut ilmu, menelaah"
      }
    ],
    examples: [
      {
        arabic: "طَلَبُ الْعِلْمِ فَرِيْضَةٌ عَلَى كُلِّ مُسْلِمٍ",
        latin: "Tholabul 'ilmi fariidhotun 'alaa kulli muslim",
        translation: "Menuntut ilmu itu wajib bagi setiap muslim.",
        context: "Hadits Riwayat Ibnu Majah"
      },
      {
        arabic: "عَلِمَ الطَّالِبُ مَسْأَلَةَ الْفِقْهِ جَيِّدًا",
        latin: "'Alimat thoolibu mas'alatal fiqhi jayyidan",
        translation: "Santri itu memahami permasalahan fiqih dengan baik."
      }
    ],
    synonyms: ["عَرَفَ (Mengenal)", "فَقِهَ (Memahami)", "أَدْرَكَ (Menjangkau hakikat)"],
    antonyms: ["جَهِلَ (Bodoh/Tidak tahu)", "غَفَلَ (Lalai)"],
    derivedWords: [
      { arabic: "عِلْمٌ (جـ عُلُوْمٌ)", meaning: "Ilmu pengetahuan / sains", type: "Isim Mashdar" },
      { arabic: "عَالِمٌ (جـ عُلَمَاءُ)", meaning: "Orang berilmu / Ulama / Pakar", type: "Isim Fa'il" },
      { arabic: "مَعْلُوْمٌ", meaning: "Yang diketahui / maklum", type: "Isim Maf'ul" },
      { arabic: "مُعَلِّمٌ", meaning: "Guru / Pengajar", type: "Isim Fa'il (Bab II)" },
      { arabic: "تَعْلِيْمٌ", meaning: "Pendidikan / Pengajaran", type: "Mashdar (Bab II)" },
      { arabic: "مَعْلَمٌ (جـ مَعَالِمُ)", meaning: "Tanda / Landmark / Ciri khas", type: "Isim Makan" }
    ],
    page: 963,
    referenceBook: "Kamus Al-Munawwir Arab-Indonesia Terlengkap (Krapyak)",
    referenceUrl: "https://archive.org/details/kamus-al-munawwir-arab-indonesia/page/n963/mode/2up",
    notes: "Dalam Kamus Al-Munawwir (hlm. 963), kata 'Alima termasuk Bab IV (Fa'ila - Yaf'alu). Derivasinya sangat luas mencakup lebih dari 20 kata jadian dalam khazanah turath Islam."
  },
  "كتاب": {
    arabic: "كِتَابٌ",
    arabicHarokat: "كِتَابٌ (جـ كُتُبٌ)",
    latin: "Kitaabun (Plural: Kutubun)",
    wordType: "isim",
    wordTypeIndo: "Isim Jamid / Mashdar (فِعَال)",
    root: "ك - ت - ب",
    plural: "كُتُبٌ (Kutub)",
    gender: "mudzakkar",
    page: 1184,
    referenceBook: "Kamus Al-Munawwir Arab-Indonesia Terlengkap (Krapyak)",
    referenceUrl: "https://archive.org/details/kamus-al-munawwir-arab-indonesia/page/n1184/mode/2up",
    meanings: [
      "Buku, kitab, lembaran yang dijilid dan memuat tulisan",
      "Surat, tulisan, risalah, piagam",
      "Ketetapan, hukum, atau takdir Allah (dalam konteks Al-Qur'an)",
      "Wahyu ilahi / Kitab Suci (Al-Qur'an, Taurat, Injil, Zabur)"
    ],
    examples: [
      {
        arabic: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
        latin: "Zaalikal kitaabu laa roiba fiih, hudal lil muttaqiin",
        translation: "Kitab (Al-Qur'an) ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa.",
        context: "QS. Al-Baqarah: 2"
      },
      {
        arabic: "يَقْرَأُ السَّانْتْرِي كِتَابَ فَتْحِ الْقَرِيْبِ فِي الْمَعْهَدِ",
        latin: "Yaqro'us saantrii kitaaba Fathil Qoriib fil ma'had",
        translation: "Santri itu membaca kitab Fathul Qorib di pesantren."
      }
    ],
    synonyms: ["مُصْحَفٌ (Mushaf)", "دَفْتَرٌ (Buku catatan)", "سِفْرٌ (Jilid kitab tebal)"],
    derivedWords: [
      { arabic: "كَتَبَ - يَكْتُبُ - كِتَابَةً", meaning: "Menulis / mencatat", type: "Fi'il Madhi" },
      { arabic: "كَاتِبٌ (جـ كُتَّابٌ)", meaning: "Penulis / sekretaris / panitera", type: "Isim Fa'il" },
      { arabic: "مَكْتَبٌ (جـ مَكَاتِبُ)", meaning: "Meja tulis / kantor", type: "Isim Makan" },
      { arabic: "مَكْتَبَةٌ", meaning: "Perpustakaan / toko buku", type: "Isim Makan" },
      { arabic: "مَكْتُوْبٌ", meaning: "Tertulis / surat / takdir", type: "Isim Maf'ul" }
    ],
    notes: "Rujukan Kamus Al-Munawwir hlm. 1184: Asal makna kataba adalah mengumpulkan huruf atau menjahit/mengikat sesuatu."
  },
  "صلاة": {
    arabic: "صَلَاةٌ",
    arabicHarokat: "صَلَاةٌ (جـ صَلَوَاتٌ)",
    latin: "Sholaatun (Plural: Sholawaatun)",
    wordType: "isim",
    wordTypeIndo: "Isim Mashdar Muannats",
    root: "ص - ل - و",
    plural: "صَلَوَاتٌ (Sholawat)",
    gender: "muannats",
    page: 794,
    referenceBook: "Kamus Al-Munawwir Arab-Indonesia Terlengkap (Krapyak)",
    referenceUrl: "https://archive.org/details/kamus-al-munawwir-arab-indonesia/page/n794/mode/2up",
    meanings: [
      "Secara bahasa (lughatan): Doa permohonan kebaikan dan keberkahan",
      "Secara istilah syar'i: Ibadah khusus yang diawali dengan takbiratul ihram dan diakhiri dengan salam dengan syarat & rukun tertentu",
      "Rahmat dan ampunan dari Allah SWT (jika disandarkan kepada Allah)",
      "Pujian para malaikat (jika disandarkan kepada Malaikat)",
      "Sholawat / sanjungan santri kepada Nabi Muhammad SAW"
    ],
    examples: [
      {
        arabic: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا",
        latin: "Innash sholaata kaanat 'alal mu'miniina kitaabam mawquutaa",
        translation: "Sungguh, shalat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman.",
        context: "QS. An-Nisa: 103"
      }
    ],
    synonyms: ["دُعَاءٌ (Doa)", "عِبَادَةٌ (Ibadah)", "تَبْرِيْكٌ (Permohonan berkah)"],
    derivedWords: [
      { arabic: "صَلَّى - يُصَلِّي - تَصْلِيَةً", meaning: "Melakukan sholat / membaca sholawat / mendoakan", type: "Fi'il Bab II" },
      { arabic: "مُصَلٍّ (الْمُصَلِّي)", meaning: "Orang yang mendirikan sholat", type: "Isim Fa'il" },
      { arabic: "مُصَلًّى", meaning: "Tempat sholat / musholla", type: "Isim Makan" }
    ],
    notes: "Kamus Al-Munawwir hlm. 794. Ditulis dalam Rasm Utsmani dengan huruf Waw (صلوة) dan dibaca Alif tegak."
  },
  "قلb": {
    arabic: "قَلْبٌ",
    arabicHarokat: "قَلْبٌ (جـ قُلُوْبٌ)",
    latin: "Qolbun (Plural: Quluubun)",
    wordType: "isim",
    wordTypeIndo: "Isim Jamid (فَعْل)",
    root: "ق - ل - ب",
    plural: "قُلُوْبٌ (Qulub)",
    gender: "mudzakkar",
    page: 1146,
    referenceBook: "Kamus Al-Munawwir Arab-Indonesia Terlengkap (Krapyak)",
    referenceUrl: "https://archive.org/details/kamus-al-munawwir-arab-indonesia/page/n1146/mode/2up",
    meanings: [
      "Jantung / Hati nurani / Kalbu pusat kesadaran spiritual dan emosional manusia",
      "Inti sari / pusat / bagian terdalam dari sesuatu perkara",
      "Pembalikan / pemutaran arah (makna mashdar)"
    ],
    examples: [
      {
        arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
        latin: "Alaa bizikrillahi tathma'innul quluub",
        translation: "Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.",
        context: "QS. Ar-Ra'd: 28"
      },
      {
        arabic: "يَا مُقَلِّبَ الْقُلُوْبِ ثَبِّتْ قَلْبِي عَلَى دِيْنِكَ",
        latin: "Yaa muqollibal quluubi tsabbit qolbii 'alaa diinik",
        translation: "Wahai Dzat yang membolak-balikkan hati, teguhkanlah hatiku di atas agama-Mu.",
        context: "Doa Nabi SAW"
      }
    ],
    synonyms: ["فُؤَادٌ (Nurani)", "صَدْرٌ (Dada/Kalbu)", "لُبٌّ (Inti akal budi)"],
    derivedWords: [
      { arabic: "قَلَبَ - يَقْلِبُ - قَلْبًا", meaning: "Membalikkan / mengubah", type: "Fi'il Madhi" },
      { arabic: "انْقَلَبَ - يَنْقَلِبُ", meaning: "Berbalik / berubah arah", type: "Fi'il Bab VII" },
      { arabic: "مُنْقَلَبٌ", meaning: "Tempat kembali / kesudahan", type: "Isim Makan" }
    ],
    notes: "Dinamakan Qalb (hati) karena sifatnya yang sering berbolak-balik (taqallub) antara taat dan lalai."
  },
  "قلب": {
    arabic: "قَلْبٌ",
    arabicHarokat: "قَلْبٌ (جـ قُلُوْبٌ)",
    latin: "Qolbun (Plural: Quluubun)",
    wordType: "isim",
    wordTypeIndo: "Isim Jamid (فَعْل)",
    root: "ق - ل - ب",
    plural: "قُلُوْبٌ (Qulub)",
    gender: "mudzakkar",
    page: 1146,
    referenceBook: "Kamus Al-Munawwir Arab-Indonesia Terlengkap (Krapyak)",
    referenceUrl: "https://archive.org/details/kamus-al-munawwir-arab-indonesia/page/n1146/mode/2up",
    meanings: [
      "Jantung / Hati nurani / Kalbu pusat kesadaran spiritual dan emosional manusia",
      "Inti sari / pusat / bagian terdalam dari sesuatu perkara",
      "Pembalikan / pemutaran arah (makna mashdar)"
    ],
    examples: [
      {
        arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
        latin: "Alaa bizikrillahi tathma'innul quluub",
        translation: "Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.",
        context: "QS. Ar-Ra'd: 28"
      },
      {
        arabic: "يَا مُقَلِّبَ الْقُلُوْبِ ثَبِّتْ قَلْبِي عَلَى دِيْنِكَ",
        latin: "Yaa muqollibal quluubi tsabbit qolbii 'alaa diinik",
        translation: "Wahai Dzat yang membolak-balikkan hati, teguhkanlah hatiku di atas agama-Mu.",
        context: "Doa Nabi SAW"
      }
    ],
    synonyms: ["فُؤَادٌ (Nurani)", "صَدْرٌ (Dada/Kalbu)", "لُبٌّ (Inti akal budi)"],
    derivedWords: [
      { arabic: "قَلَبَ - يَقْلِبُ - قَلْبًا", meaning: "Membalikkan / mengubah", type: "Fi'il Madhi" },
      { arabic: "انْقَلَبَ - يَنْقَلِبُ", meaning: "Berbalik / berubah arah", type: "Fi'il Bab VII" },
      { arabic: "مُنْقَلَبٌ", meaning: "Tempat kembali / kesudahan", type: "Isim Makan" }
    ],
    notes: "Dinamakan Qalb (hati) karena sifatnya yang sering berbolak-balik (taqallub) antara taat dan lalai."
  }
};

// System prompt khusus untuk AI leksikografi Kamus Al-Munawwir
const MUNAWWIR_SYSTEM_INSTRUCTION = `Anda adalah API & asisten leksikografi digital ahli bahasa Arab-Indonesia khusus berbasis karya magnum opus "Kamus Al-Munawwir Arab-Indonesia Terlengkap" (karya KH. Ahmad Warson Munawwir, Pondok Pesantren Krapyak Yogyakarta).

Tugas Anda: Memberikan lema dan arti kata secara sangat komprehensif, akurat, mendalam, dan berbobot akademis santri/pesantren.

Instruksi Output:
- Selalu kembalikan respon dalam format JSON MURNI valid tanpa markdown \`\`\`json.
- Skema JSON yang harus dipenuhi:
{
  "arabic": "Bentuk kata berharakat rapi (misal: عَمِلَ atau عَمَلٌ)",
  "arabicHarokat": "Lema lengkap beserta tashrif dasar (misal: عَمِلَ - يَعْمَلُ - عَمَلًا)",
  "latin": "Transliterasi latin resmi",
  "wordType": "isim | fiil | harf | tarkib",
  "wordTypeIndo": "Penjelasan gramatikal (contoh: Fi'il Tsulatsi Mujarrad Bab IV, Isim Masdar, Jamak Taksir, dll)",
  "root": "Akar kata / Jadzr (contoh: ع - م - ل)",
  "wazan": "Wazan timbangan shorof (contoh: فَعِلَ - يَفْعَلُ)",
  "page": "Nomor estimasi halaman fisik Kamus Al-Munawwir (misal: 963 atau angka 1-1634)",
  "referenceBook": "Kamus Al-Munawwir Arab-Indonesia Terlengkap (Krapyak)",
  "referenceUrl": "https://archive.org/details/kamus-al-munawwir-arab-indonesia",
  "tashrifBrief": {
    "madhi": "...",
    "mudhari": "...",
    "mashdar": "...",
    "fail": "...",
    "maful": "...",
    "amr": "...",
    "nahyi": "..."
  },
  "singular": "Bentuk tunggal jika kata input jamak",
  "plural": "Bentuk Jamak Taksir / Jamak Muannats Salim",
  "gender": "mudzakkar | muannats | musytarak",
  "transitivity": "mutaaddi | lazim | keduanya",
  "meanings": [
    "Arti 1 yang jelas dan padat sesuai Kamus Munawwir",
    "Arti 2 dalam konteks syar'i / sastra jika ada",
    "Arti 3 ..."
  ],
  "contextualMeanings": [
    {
      "preposition": "Huruf Jar penyerta (misal: رَغِبَ فِي)",
      "arabicPhrase": "Frasa Arab contoh",
      "meaning": "Artinya jika bertemu huruf jar tersebut"
    }
  ],
  "examples": [
    {
      "arabic": "Contoh kalimat berharakat",
      "latin": "Transliterasi latin",
      "translation": "Terjemahan bahasa Indonesia",
      "context": "Sumber ayat/hadis/qaul ulama jika relevan"
    }
  ],
  "synonyms": ["Sinonim Arab 1", "Sinonim Arab 2"],
  "antonyms": ["Antonim Arab 1", "Antonim Arab 2"],
  "derivedWords": [
    {
      "arabic": "Kata turunan (Musytaqqat)",
      "meaning": "Arti bahasa Indonesianya",
      "type": "Jenis kata (Isim Makan/Fa'il/Taf'il dll)"
    }
  ],
  "notes": "Ulasan singkat kaidah Nahwu/Shorof atau catatan khas Kamus Munawwir"
}

JANGAN potong penjelasan. Buatlah selengkap dan semewah mungkin agar bermanfaat bagi santri.`;

// Normalize query helper
export const normalizeArabicQuery = (text: string): string => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove harakat
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
};

// Check if string contains Arabic characters
export const isArabicText = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicRegex.test(text);
};

export const searchMunawwirDictionary = async (
  query: string,
  mode: 'ar-id' | 'id-ar' = 'ar-id'
): Promise<MunawwirSearchResult> => {
  const cleanQ = query.trim();
  if (!cleanQ) {
    return {
      query: '',
      mode,
      found: false,
      entries: [],
      totalResults: 0,
      source: 'offline'
    };
  }

  const normalized = normalizeArabicQuery(cleanQ);

  // 1. Cek Offline Curated Data terlebih dahulu untuk kecepatan instan
  const offlineMatchKey = Object.keys(OFFLINE_MUNAWWIR_DATA).find(k => {
    if (mode === 'ar-id') {
      return normalizeArabicQuery(k) === normalized || normalizeArabicQuery(OFFLINE_MUNAWWIR_DATA[k].arabic) === normalized;
    } else {
      const qLower = cleanQ.toLowerCase();
      return (
        k.toLowerCase().includes(qLower) ||
        OFFLINE_MUNAWWIR_DATA[k].meanings.some(m => m.toLowerCase().includes(qLower))
      );
    }
  });

  if (offlineMatchKey && OFFLINE_MUNAWWIR_DATA[offlineMatchKey]) {
    return {
      query: cleanQ,
      mode,
      found: true,
      entries: [OFFLINE_MUNAWWIR_DATA[offlineMatchKey]],
      totalResults: 1,
      source: 'offline'
    };
  }

  // 2. Cek GitHub cache
  const cacheKey = `munawwir-${mode}-${normalized || cleanQ.toLowerCase()}`.substring(0, 60);
  try {
    const cachedData = await fetchFromGitHub('cache-munawwir', cacheKey);
    if (cachedData && cachedData.arabic) {
      return {
        query: cleanQ,
        mode,
        found: true,
        entries: [cachedData],
        totalResults: 1,
        source: 'cache'
      };
    }
  } catch (err) {
    // Cache miss
  }

  // 3. Panggil Gemini API Leksikografi Munawwir
  try {
    const prompt = mode === 'ar-id'
      ? `Carikan lema dan arti kata bahasa Arab ini menurut rujukan Kamus Al-Munawwir: "${cleanQ}". Analisis akar kata (jadzr), bentuk jamak/mufrod, wazan shorof, makna kontekstual, dan contoh kalimat.`
      : `Carikan padanan bahasa Arab (Fusha/Kamus Al-Munawwir) untuk kata/frasa bahasa Indonesia: "${cleanQ}". Berikan kata lema utama beserta harakat lengkap, akar kata, jenis kata, contoh kalimat, dan kata-kata turunannya.`;

    const ai = getRotatedGeminiClient();
    const model = getRotatedGeminiModel();

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: MUNAWWIR_SYSTEM_INSTRUCTION,
        temperature: 0.2,
        topP: 0.95,
        maxOutputTokens: 8192,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        responseMimeType: "application/json"
      }
    });

    if (response && response.text) {
      let cleaned = response.text.trim();
      cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '');
      cleaned = cleaned.replace(/```json\s*([\s\S]*?)\s*```/gi, '$1');
      cleaned = cleaned.replace(/```\s*([\s\S]*?)\s*```/gi, '$1');

      const parsed: MunawwirWordDetail = JSON.parse(cleaned);

      // Simpan ke background cache
      saveToGitHub('cache-munawwir', cacheKey, parsed).catch(() => {});

      return {
        query: cleanQ,
        mode,
        found: true,
        entries: [parsed],
        totalResults: 1,
        source: 'api'
      };
    }
  } catch (apiErr) {
    console.error("Gagal memanggil API Kamus Munawwir:", apiErr);
  }

  return {
    query: cleanQ,
    mode,
    found: false,
    entries: [],
    totalResults: 0,
    source: 'api'
  };
};

// Local storage Bookmark & History helpers
const MUNAWWIR_BOOKMARKS_KEY = 'santri_munawwir_bookmarks';
const MUNAWWIR_HISTORY_KEY = 'santri_munawwir_history';

export const getMunawwirBookmarks = (): MunawwirWordDetail[] => {
  try {
    const raw = localStorage.getItem(MUNAWWIR_BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleMunawwirBookmark = (word: MunawwirWordDetail): boolean => {
  const current = getMunawwirBookmarks();
  const existsIndex = current.findIndex(w => w.arabic === word.arabic || w.latin === word.latin);
  
  let updated: MunawwirWordDetail[];
  let isSaved = false;

  if (existsIndex >= 0) {
    updated = current.filter((_, idx) => idx !== existsIndex);
    isSaved = false;
  } else {
    updated = [word, ...current];
    isSaved = true;
  }

  try {
    localStorage.setItem(MUNAWWIR_BOOKMARKS_KEY, JSON.stringify(updated));
  } catch (e) {}

  return isSaved;
};

export const isMunawwirBookmarked = (arabicWord: string): boolean => {
  const current = getMunawwirBookmarks();
  return current.some(w => w.arabic === arabicWord || normalizeArabicQuery(w.arabic) === normalizeArabicQuery(arabicWord));
};

export const saveMunawwirHistory = (query: string, mode: 'ar-id' | 'id-ar') => {
  if (!query.trim()) return;
  try {
    const raw = localStorage.getItem(MUNAWWIR_HISTORY_KEY);
    let list: Array<{ query: string; mode: 'ar-id' | 'id-ar'; timestamp: number }> = raw ? JSON.parse(raw) : [];
    list = list.filter(item => item.query.toLowerCase() !== query.toLowerCase());
    list.unshift({ query, mode, timestamp: Date.now() });
    if (list.length > 30) list = list.slice(0, 30);
    localStorage.setItem(MUNAWWIR_HISTORY_KEY, JSON.stringify(list));
  } catch (e) {}
};

export const getMunawwirHistory = (): Array<{ query: string; mode: 'ar-id' | 'id-ar'; timestamp: number }> => {
  try {
    const raw = localStorage.getItem(MUNAWWIR_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const clearMunawwirHistory = () => {
  try {
    localStorage.removeItem(MUNAWWIR_HISTORY_KEY);
  } catch (e) {}
};
