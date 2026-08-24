import { Surah, Ayah } from '../types';
import { QURAN_API_BASE } from '../constants';

export const getAllSurahs = async (): Promise<Surah[]> => {
  try {
    // Attempt local first
    let json;
    try {
      const response = await fetch('./quran/surat.json');
      if (response.ok) {
        json = await response.json();
      } else {
        throw new Error("Local file not available");
      }
    } catch (localErr) {
      console.log("Local fetch failed, falling back to online API for surah list...", localErr);
      const response = await fetch(`${QURAN_API_BASE}/surat`);
      json = await response.json();
    }
    
    if (json.code !== 200) throw new Error("Failed to fetch surahs");

    return json.data.map((item: any) => ({
      number: item.nomor,
      name: item.nama,
      name_latin: item.namaLatin,
      number_of_ayah: item.jumlahAyat,
      place: item.tempatTurun,
      meaning: item.arti,
      description: item.deskripsi,
      audioFull: item.audioFull?.['05'] // Use Misyari Rashid Al-Afasy
    }));
  } catch (error) {
    console.error("Failed to load surah list:", error);
    return [];
  }
};

export const getJuzDetail = async (juzNumber: number): Promise<Ayah[]> => {
  try {
    // Attempt local first
    try {
      const localResponse = await fetch(`./quran/juz/${juzNumber}.json`);
      if (localResponse.ok) {
        const json = await localResponse.json();
        if (json && json.code === 200 && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (localErr) {
      console.log(`Local parse failed for Juz ${juzNumber}, trying live cloud lookup:`, localErr);
    }

    // Fetch Arabic and Indonesian translation separately to increase reliability and avoid 500 errors on combined endpoint
    const [arabRes, indoRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/juz/${juzNumber}/quran-uthmani`),
      fetch(`https://api.alquran.cloud/v1/juz/${juzNumber}/id.indonesian`)
    ]);

    if (!arabRes.ok || !indoRes.ok) {
      throw new Error(`HTTP error! Arab: ${arabRes.status}, Indo: ${indoRes.status}`);
    }

    const [arabJson, indoJson] = await Promise.all([
      arabRes.json(),
      indoRes.json()
    ]);

    if (arabJson.status !== "OK" || !arabJson.data.ayahs) return [];

    const ayahs = arabJson.data.ayahs;
    const translations = indoJson.data?.ayahs || [];

    return ayahs.map((item: any, idx: number) => ({
      id: item.number,
      surahNumber: item.surah.number,
      number: item.numberInSurah,
      arab: item.text,
      latin: "",
      text: translations[idx] ? translations[idx].text : "",
      audio: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${item.number}.mp3`
    }));
  } catch (error) {
    console.error("Fetch Juz Detail Error (Split):", error);
    return [];
  }
};

export const getSurahDetail = async (surahNumber: number): Promise<Surah | null> => {
  try {
    let json;
    // Attempt local first
    try {
      const localResponse = await fetch(`./quran/surat/${surahNumber}.json`);
      if (localResponse.ok) {
        json = await localResponse.json();
      } else {
        throw new Error("Local file not available");
      }
    } catch (localErr) {
      console.log(`Local fetch failed for Surah ${surahNumber}, falling back to online API...`, localErr);
      const response = await fetch(`${QURAN_API_BASE}/surat/${surahNumber}`);
      json = await response.json();
    }

    if (json.code !== 200) throw new Error("Failed to fetch surah detail");

    const data = json.data;

    const ayahs: Ayah[] = data.ayat.map((item: any) => ({
      id: parseInt(`${surahNumber}${item.nomorAyat.toString().padStart(3, '0')}`), // Create Pseudo ID
      surahNumber: surahNumber,
      number: item.nomorAyat,
      arab: item.teksArab,
      latin: item.teksLatin,
      text: item.teksIndonesia,
      // Fallback audio sources if '05' is missing
      audio: item.audio['05'] || item.audio['03'] || item.audio['01'] || '',
      audioMap: item.audio
    }));

    return {
      number: data.nomor,
      name: data.nama,
      name_latin: data.namaLatin,
      number_of_ayah: data.jumlahAyat,
      place: data.tempatTurun,
      meaning: data.arti,
      description: data.deskripsi,
      ayahs: ayahs,
      audioFull: data.audioFull?.['05']
    };
  } catch (error) {
    console.error(`Failed to load Surah ${surahNumber} detail:`, error);
    return null;
  }
};

export interface QuranSearchAyahItem {
  surahNumber: number;
  surahNameLatin: string;
  surahNameArabic: string;
  surahMeaning: string;
  ayahNumber: number;
  arab: string;
  latin: string;
  text: string;
  audio: string;
}

export interface QuranSearchResult {
  surahs: Surah[];
  ayahs: QuranSearchAyahItem[];
  totalMatches: number;
}

// In-memory cache for fast verse search
let quranSearchIndexCache: any[] | null = null;
let isLoadingIndex = false;

export const loadQuranSearchIndex = async (): Promise<any[]> => {
  if (quranSearchIndexCache && quranSearchIndexCache.length > 0) {
    return quranSearchIndexCache;
  }
  if (isLoadingIndex) {
    // Wait a bit if another call is currently fetching
    for (let attempt = 0; attempt < 20; attempt++) {
      await new Promise(r => setTimeout(r, 100));
      if (quranSearchIndexCache && quranSearchIndexCache.length > 0) {
        return quranSearchIndexCache;
      }
    }
  }
  
  isLoadingIndex = true;
  const possiblePaths = [
    './quran/search_index.json',
    '/quran/search_index.json',
    'quran/search_index.json'
  ];

  for (const p of possiblePaths) {
    try {
      const res = await fetch(p);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          quranSearchIndexCache = data;
          isLoadingIndex = false;
          return data;
        }
      }
    } catch (err) {
      // try next path
    }
  }

  // Fallback: If search_index.json cannot be fetched, build index on-demand from surahs
  try {
    const surahs = await getAllSurahs();
    if (surahs && surahs.length > 0) {
      const builtList: any[] = [];
      // Fetch details in small chunks
      for (let i = 1; i <= Math.min(surahs.length, 114); i++) {
        try {
          const sDetail = await getSurahDetail(i);
          if (sDetail && sDetail.ayahs) {
            sDetail.ayahs.forEach(a => {
              builtList.push({
                s: sDetail.number,
                sn: sDetail.name_latin,
                sa: sDetail.name,
                sm: sDetail.meaning,
                a: a.number,
                ar: a.arab,
                lt: a.latin,
                id: a.text,
                aud: a.audio
              });
            });
          }
        } catch (e) {
          // ignore individual error
        }
      }
      if (builtList.length > 0) {
        quranSearchIndexCache = builtList;
        isLoadingIndex = false;
        return builtList;
      }
    }
  } catch (fallbackErr) {
    console.error("Quran index dynamic fallback failed:", fallbackErr);
  } finally {
    isLoadingIndex = false;
  }

  return [];
};

// Clean and normalize text for fuzzy/flexible matching
const normalizeSearchText = (text: string): string => {
  return (text || '')
    .toLowerCase()
    .replace(/[‘'’`"“”]/g, '')
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove arabic tashkeel if any
    .replace(/[\.,:;\(\)\-\–]/g, ' ')
    .replace(/\bsholat\b/g, 'shalat')
    .replace(/\bsolat\b/g, 'shalat')
    .replace(/\bramadhan\b/g, 'ramadan')
    .replace(/\bdzikir\b/g, 'zikir')
    .replace(/\s+/g, ' ')
    .trim();
};

export const searchAllQuran = async (
  query: string,
  allSurahsList?: Surah[],
  surahNumberFilter?: number | 'all'
): Promise<QuranSearchResult> => {
  const cleanQ = query.trim();
  if (!cleanQ) {
    return { surahs: [], ayahs: [], totalMatches: 0 };
  }

  const normQ = normalizeSearchText(cleanQ);
  const qLower = cleanQ.toLowerCase();

  // 1. Search Matching Surahs
  let surahs = allSurahsList || [];
  if (!surahs.length) {
    surahs = await getAllSurahs();
  }

  // Parse if query is a surah number or reference like "2:183" or "36:1" or "Al-Baqarah 183"
  const refMatch = cleanQ.match(/^(\d{1,3})\s*[:\.]\s*(\d{1,3})$/);
  const targetSurahNum = refMatch ? parseInt(refMatch[1]) : (!isNaN(Number(cleanQ)) ? parseInt(cleanQ) : null);
  const targetAyahNum = refMatch ? parseInt(refMatch[2]) : null;

  const matchedSurahs = surahs.filter(s => {
    if (surahNumberFilter && typeof surahNumberFilter === 'number' && s.number !== surahNumberFilter) {
      return false;
    }
    if (targetSurahNum && s.number === targetSurahNum) return true;
    const normSurahName = normalizeSearchText(s.name_latin);
    const normMeaning = normalizeSearchText(s.meaning);
    return (
      normSurahName.includes(normQ) ||
      normMeaning.includes(normQ) ||
      s.name.includes(cleanQ) ||
      s.name_latin.toLowerCase().includes(qLower) ||
      s.meaning.toLowerCase().includes(qLower)
    );
  });

  // 2. Search Matching Verses from Index
  const index = await loadQuranSearchIndex();
  let matchedAyahs: QuranSearchAyahItem[] = [];

  if (index && index.length > 0) {
    // If specific reference like "2:183"
    if (targetSurahNum && targetAyahNum) {
      const exact = index.find(item => item.s === targetSurahNum && item.a === targetAyahNum);
      if (exact) {
        matchedAyahs.push({
          surahNumber: exact.s,
          surahNameLatin: exact.sn,
          surahNameArabic: exact.sa,
          surahMeaning: exact.sm,
          ayahNumber: exact.a,
          arab: exact.ar,
          latin: exact.lt,
          text: exact.id,
          audio: exact.aud
        });
      }
    } else {
      // Split query keywords for multi-word search (e.g. "orang beriman")
      const keywords = normQ.split(' ').filter(k => k.length > 1);

      for (const item of index) {
        if (surahNumberFilter && typeof surahNumberFilter === 'number' && item.s !== surahNumberFilter) {
          continue;
        }

        const itemTextNorm = normalizeSearchText(item.id);
        const itemLatinNorm = normalizeSearchText(item.lt);
        const itemArab = item.ar || '';

        // Check if query matches directly in Indonesian translation, Arabic, or Latin transliteration
        const isMatchIndo = itemTextNorm.includes(normQ) || (keywords.length > 1 && keywords.every(kw => itemTextNorm.includes(kw)));
        const isMatchLatin = itemLatinNorm.includes(normQ) || (keywords.length > 1 && keywords.every(kw => itemLatinNorm.includes(kw)));
        const isMatchArab = itemArab.includes(cleanQ);

        // Also match if user searched for "Surah X ayat Y" e.g. "Al Baqarah 183"
        const isRefBySurahName = normalizeSearchText(item.sn).includes(normQ) && String(item.a) === cleanQ.replace(/\D/g, '');

        if (isMatchIndo || isMatchLatin || isMatchArab || isRefBySurahName) {
          matchedAyahs.push({
            surahNumber: item.s,
            surahNameLatin: item.sn,
            surahNameArabic: item.sa,
            surahMeaning: item.sm,
            ayahNumber: item.a,
            arab: item.ar,
            latin: item.lt,
            text: item.id,
            audio: item.aud
          });
        }
      }
    }
  }

  return {
    surahs: matchedSurahs,
    ayahs: matchedAyahs,
    totalMatches: matchedSurahs.length + matchedAyahs.length
  };
};

export const getTafsir = async (surahNumber: number): Promise<any[]> => {
  try {
    let json;
    // Attempt local first
    try {
      const localResponse = await fetch(`./quran/tafsir/${surahNumber}.json`);
      if (localResponse.ok) {
        json = await localResponse.json();
      } else {
        throw new Error("Local file not available");
      }
    } catch (localErr) {
      console.log(`Local fetch failed for Tafsir ${surahNumber}, falling back to online API...`, localErr);
      const response = await fetch(`${QURAN_API_BASE}/tafsir/${surahNumber}`);
      json = await response.json();
    }

    if (json.code !== 200) throw new Error("Failed to fetch tafsir");

    // The API returns { data: { tafsir: [ { ayat: 1, teks: "..." } ] } }
    return json.data.tafsir || [];
  } catch (error) {
    console.error(`Failed to load Tafsir ${surahNumber}:`, error);
    return [];
  }
};