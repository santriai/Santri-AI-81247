
export const APP_NAME = "Santri AI";
export const PLAYSTORE_LINK = "https://play.google.com/store/apps/details?id=com.kitabkuningterjemahlengkap";

export const DEFAULT_SETTINGS = {
  style: 'mixed' as const,
  fontSize: 16,
  theme: 'light' as const,
  arabicFont: 'amiri' as const,
  dailyAttendanceReminderEnabled: true
};

export const GEMINI_MODEL = "gemini-2.5-flash";
export const GEMINI_MODELS_ROTATION = [
  "gemini-2.5-flash",
  "gemini-3.6-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash"
];

export const DEFAULT_AI_CONFIG = {
  temperature: 0.2,
  topP: 0.95,
  maxOutputTokens: 8192,
};

export const SYSTEM_INSTRUCTION = `You are an expert scholar in Classical Arabic Islamic texts (Kitab Kuning/Turath) and a master linguist (like Kamus Al-Munawwir).
All your analysis and explanations MUST strictly adhere to the principles of Ahlusunnah wal Jama'ah (Aswaja).

Your primary task is to Analyze the input comprehensively based on the detected language.

IMPORTANT: Output MUST be valid JSON. Do not include markdown code blocks (e.g., \`\`\`json) or any intro/outro text. Just the raw JSON string.
IMPORTANT REQUIREMENT: Tuliskan seluruh penjelasan dan jawaban secara utuh, rinci, dan tuntas dari awal sampai akhir. Jangan pernah memotong kalimat, melompati poin, atau menghentikan respon sebelum penjelasan selesai secara lengkap.

STRICT LOGIC:
1. DETECT the language of the input text.

CASE A: IF INPUT IS ARABIC
   - "maknaGandul": Translate the Arabic input to Indonesian using strict 'Makna Gandul' style (Javanese-style grammatical markers adapted for Indonesian). Markers: [utawi], [iku], [sopo], [ing], [marang], etc.
   - "modernTranslation": Standard Indonesian translation.
   - "nahwuShorof": Analyze the grammar/morphology of the INPUT Arabic.
   - "lughah": Explain vocabulary of the INPUT.
   - "balaghah": Rhetoric analysis of the INPUT.

CASE B: IF INPUT IS INDONESIAN (or other)
   - "modernTranslation": Translate the input into HIGH CLASSICAL ARABIC (Fusha/Kitab style). Use precise vocabulary.
   - "maknaGandul": Take the ARABIC TRANSLATION you just generated, and provide the 'Makna Gandul' for it.
   - "nahwuShorof": Analyze the grammar/morphology of the ARABIC TRANSLATION you generated.
   - "lughah": Explain the Arabic vocabulary choices you made.
   - "balaghah": Explain any rhetorical features in your Arabic translation.

COMMON FIELDS:
   - "ushulFiqh": Explain implications (if applicable).
   - "hikmah": Wisdom/Lesson.
   - "referensi": Similar references (Kitab/Dalil).
   - "aiExplanation": A detailed explanation/analysis in Indonesian.

JSON SCHEMA:
{
  "maknaGandul": "String...",
  "modernTranslation": "String...",
  "nahwuShorof": "String...",
  "lughah": "String...",
  "balaghah": "String...",
  "ushulFiqh": "String...",
  "hikmah": "String...",
  "referensi": "String...",
  "aiExplanation": "String..."
}
`;

// API Endpoints
export const QURAN_API_BASE = "https://equran.id/api/v2";

// Mapping Juz to Starting Surah and Ayah
export const JUZ_MAPPING: { [key: number]: { surah: number, ayah: number } } = {
  1: { surah: 1, ayah: 1 },
  2: { surah: 2, ayah: 142 },
  3: { surah: 2, ayah: 253 },
  4: { surah: 3, ayah: 93 },
  5: { surah: 4, ayah: 24 },
  6: { surah: 4, ayah: 148 },
  7: { surah: 5, ayah: 82 },
  8: { surah: 6, ayah: 111 },
  9: { surah: 7, ayah: 88 },
  10: { surah: 8, ayah: 41 },
  11: { surah: 9, ayah: 93 },
  12: { surah: 11, ayah: 6 },
  13: { surah: 12, ayah: 53 },
  14: { surah: 15, ayah: 2 },
  15: { surah: 17, ayah: 1 },
  16: { surah: 18, ayah: 75 },
  17: { surah: 21, ayah: 1 },
  18: { surah: 23, ayah: 1 },
  19: { surah: 25, ayah: 21 },
  20: { surah: 27, ayah: 60 },
  21: { surah: 29, ayah: 46 },
  22: { surah: 33, ayah: 31 },
  23: { surah: 36, ayah: 28 },
  24: { surah: 39, ayah: 32 },
  25: { surah: 41, ayah: 47 },
  26: { surah: 46, ayah: 1 },
  27: { surah: 51, ayah: 31 },
  28: { surah: 58, ayah: 1 },
  29: { surah: 67, ayah: 1 },
  30: { surah: 78, ayah: 1 },
};

export const JUZ_INFO = [
  { id: 1, range: "Al-Fatihah 1 - Al-Baqarah 141", start: "بِسْمِ اللَّهِ" },
  { id: 2, range: "Al-Baqarah 142 - Al-Baqarah 252", start: "سَيَقُولُ السُّفَهَاءُ" },
  { id: 3, range: "Al-Baqarah 253 - Ali 'Imran 91", start: "تِلْكَ الرُّسُلُ" },
  { id: 4, range: "Ali 'Imran 92 - An-Nisa' 23", start: "لَنْ تَنَالُوا الْبِرَّ" },
  { id: 5, range: "An-Nisa' 24 - An-Nisa' 147", start: "وَالْمُحْصَنَاتُ" },
  { id: 6, range: "An-Nisa' 148 - Al-Ma'idah 82", start: "لَا يُحِبُw اللَّهُ" },
  { id: 7, range: "Al-Ma'idah 83 - Al-An'am 110", start: "وَإِذَا سَمِعُوا" },
  { id: 8, range: "Al-An'am 111 - Al-A'raf 87", start: "وَلَوْ أَنَّنَا" },
  { id: 9, range: "Al-A'raf 88 - Al-Anfal 40", start: "قَالَ الْمَلَأُ" },
  { id: 10, range: "Al-Anfal 41 - At-Taubah 92", start: "وَاِعْلَمُوْا" },
  { id: 11, range: "At-Taubah 93 - Hud 5", start: "يَعْتَذِرُونَ" },
  { id: 12, range: "Hud 6 - Yusuf 52", start: "وَمَا مِنْ dَابَّةٍ" },
  { id: 13, range: "Yusuf 53 - Ibrahim 52", start: "وَمَا أُبَرِّئُ" },
  { id: 14, range: "Al-Hijr 1 - An-Nahl 128", start: "رُبَمَا يَوَدُّ" },
  { id: 15, range: "Al-Isra' 1 - Al-Kahf 74", start: "سُبْحَانَ الَّذِي" },
  { id: 16, range: "Al-Kahf 75 - Ta-Ha 135", start: "قَالَ أَلَمْ أَقُلْ" },
  { id: 17, range: "Al-Anbiya' 1 - Al-Hajj 78", start: "اقْتَرَبَ لِلنَّاسِ" },
  { id: 18, range: "Al-Mu'minun 1 - Al-Furqan 20", start: "قَدْ أَفْلَحَ" },
  { id: 19, range: "Al-Furqan 21 - An-Naml 55", start: "وَقَالَ الَّذِينَ" },
  { id: 20, range: "An-Naml 56 - Al-Ankabut 45", start: "فَمَا كَانَ جَوَابَ" },
  { id: 21, range: "Al-Ankabut 46 - Al-Ahzab 30", start: "وَلَا تُجَادِلُوا" },
  { id: 22, range: "Al-Ahzab 31 - Ya-Sin 27", start: "وَمَنْ يَقْنُتْ" },
  { id: 23, range: "Ya-Sin 28 - Az-Zumar 31", start: "وَمَا أَنْزَلْنَا" },
  { id: 24, range: "Az-Zumar 32 - Fussilat 46", start: "فَمَنْ أَظْلَمُ" },
  { id: 25, range: "Fussilat 47 - Al-Jasiyah 37", start: "إِلَيْهِ يُرَدُّ" },
  { id: 26, range: "Al-Ahqaf 1 - Az-Zariyat 30", start: " حم" },
  { id: 27, range: "Az-Zariyat 31 - Al-Hadid 29", start: "قَالَ فَمَا خَطْبُكُمْ" },
  { id: 28, range: "Al-Mujadilah 1 - At-Tahrim 12", start: "قَدْ سَمِعَ اللَّهُ" },
  { id: 29, range: "Al-Mulk 1 - Al-Mursalat 50", start: "تَبَارَكَ الَّذِي" },
  { id: 30, range: "An-Naba' 1 - An-Nas 6", start: "عَمَّ يَتَسَاءَلُونَ" },
];
