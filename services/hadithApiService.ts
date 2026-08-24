import { HadithBook, HadithDetail } from '../types';

const HADITH_API_MIRRORS = [
  "https://gading-hadith-api.vercel.app/books",
  "https://hadis-api-id.pages.dev/books",
  "https://api-hadits.azharimm.dev/books",
  "https://hadith-api-seven.vercel.app/books",
  "https://hadis-api-zhirrr.vercel.app/books",
  "https://hadis-api-id.vercel.app/books"
];

// Fallback to avoid empty errors in UI
const FALLBACK_BOOKS: HadithBook[] = [
  { id: 'bukhari', name: "Shahih Bukhari", available: 7008 },
  { id: 'muslim', name: "Shahih Muslim", available: 5362 },
  { id: 'abu-daud', name: "Sunan Abu Daud", available: 4590 },
  { id: 'tirmidzi', name: "Sunan Tirmidzi", available: 3891 },
  { id: 'nasai', name: "Sunan An-Nasa'i", available: 5614 },
  { id: 'ibnu-majah', name: "Sunan Ibnu Majah", available: 4285 },
  { id: 'ahmad', name: "Musnad Ahmad", available: 4305 },
  { id: 'malik', name: "Muwatha' Malik", available: 1594 },
  { id: 'darimi', name: "Sunan Ad-Darimi", available: 3367 }
];

// Manually mapping descriptions/titles for better UI since API returns simple slugs
const BOOK_METADATA: { [key: string]: { label: string, color: string } } = {
  'bukhari': { label: "Shahih Bukhari", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
  'muslim': { label: "Shahih Muslim", color: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" },
  'abu-daud': { label: "Sunan Abu Daud", color: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" },
  'tirmidzi': { label: "Sunan Tirmidzi", color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" },
  'nasai': { label: "Sunan An-Nasa'i", color: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" },
  'ibnu-majah': { label: "Sunan Ibnu Majah", color: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400" },
  'ahmad': { label: "Musnad Ahmad", color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
  'malik': { label: "Muwatha' Malik", color: "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400" },
  'darimi': { label: "Sunan Ad-Darimi", color: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400" },
};

// Resilient helper to fetch from mirrors with fallback
const fetchFromMirrors = async (path: string = ""): Promise<any> => {
  let lastError: any = null;
  for (const mirror of HADITH_API_MIRRORS) {
    try {
      const url = path ? `${mirror}${path}` : mirror;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      if (json && json.data) {
        return json;
      }
    } catch (e) {
      lastError = e;
      console.warn(`Failed to fetch from ${mirror}:`, e);
    }
  }
  throw lastError || new Error("All mirrors failed");
};

// Fetch from jsDelivr directly as static file
const fetchFromJSDelivr = async (bookId: string, rangeStart: number, rangeEnd: number): Promise<HadithDetail[]> => {
  try {
    const url = `https://cdn.jsdelivr.net/gh/gadingnst/hadith-api@master/books/${bookId}.json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`jsDelivr fetch failed: status ${response.status}`);
    }
    const data = await response.json();
    const hadithsArray = Array.isArray(data) ? data : (data && data.hadiths ? data.hadiths : null);
    
    if (hadithsArray && Array.isArray(hadithsArray)) {
      const sliced = hadithsArray.filter((h: any) => h.number >= rangeStart && h.number <= rangeEnd);
      return sliced.map((item: any) => ({
        number: Number(item.number),
        arab: item.arab || "",
        id: item.id || ""
      }));
    }
    return [];
  } catch (err) {
    console.error(`Failed to fetch book ${bookId} from jsDelivr:`, err);
    throw err;
  }
};

export interface SearchHadithResult {
  bookId: string;
  bookName: string;
  number: number;
  arab: string;
  id: string;
}

// In-memory cache for book hadiths
const bookCache: Map<string, HadithDetail[]> = new Map();

export const getFullBookHadiths = async (bookId: string): Promise<HadithDetail[]> => {
  if (bookCache.has(bookId)) {
    return bookCache.get(bookId)!;
  }

  try {
    const url = `https://cdn.jsdelivr.net/gh/gadingnst/hadith-api@master/books/${bookId}.json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch book ${bookId}`);
    }
    const data = await response.json();
    const hadithsArray = Array.isArray(data) ? data : (data && data.hadiths ? data.hadiths : []);
    const mapped: HadithDetail[] = hadithsArray.map((item: any) => ({
      number: Number(item.number),
      arab: item.arab || "",
      id: item.id || ""
    }));

    bookCache.set(bookId, mapped);
    return mapped;
  } catch (error) {
    console.error(`Error loading all hadiths for ${bookId}:`, error);
    return [];
  }
};

export const searchHadiths = async (
  query: string,
  targetBookId: string = 'all',
  maxResults: number = 40
): Promise<SearchHadithResult[]> => {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const isNumeric = /^\d+$/.test(cleanQuery);
  const targetNumber = isNumeric ? parseInt(cleanQuery, 10) : null;

  // Determine books to search
  const booksToSearch = targetBookId && targetBookId !== 'all'
    ? FALLBACK_BOOKS.filter(b => b.id === targetBookId)
    : FALLBACK_BOOKS;

  const results: SearchHadithResult[] = [];
  const queryWords = isNumeric ? [] : cleanQuery.split(/\s+/).filter(Boolean);

  // Search across books
  await Promise.all(
    booksToSearch.map(async (book) => {
      try {
        const hadiths = await getFullBookHadiths(book.id);
        const bookLabel = BOOK_METADATA[book.id]?.label || book.name;

        for (const hadith of hadiths) {
          if (results.length >= maxResults * 2) break;

          let isMatch = false;
          if (targetNumber !== null) {
            if (hadith.number === targetNumber) {
              isMatch = true;
            }
          } else {
            const indonesianText = hadith.id.toLowerCase();
            const arabText = hadith.arab.toLowerCase();
            
            // Check keyword match (all words must be present)
            const matchesAll = queryWords.every(w => indonesianText.includes(w) || arabText.includes(w));
            if (matchesAll) {
              isMatch = true;
            }
          }

          if (isMatch) {
            results.push({
              bookId: book.id,
              bookName: bookLabel,
              number: hadith.number,
              arab: hadith.arab,
              id: hadith.id
            });
          }
        }
      } catch (err) {
        console.warn(`Error searching in ${book.id}:`, err);
      }
    })
  );

  // Sort: if numeric, sort by book precedence; if text, return matches
  return results.slice(0, maxResults);
};

export const getHadithBooks = async (): Promise<HadithBook[]> => {
  try {
    const json = await fetchFromMirrors();
    if (json && json.data && json.data.length > 0) {
      return json.data.map((item: any) => ({
        name: BOOK_METADATA[item.id]?.label || item.name,
        id: item.id,
        available: item.available
      })).filter((item: any) => item.id !== '');
    }
    return FALLBACK_BOOKS;
  } catch (error) {
    console.error("Error fetching hadith books from mirrors, using local fallback list:", error);
    return FALLBACK_BOOKS;
  }
};

export const getHadithRange = async (bookId: string, rangeStart: number, rangeEnd: number): Promise<HadithDetail[]> => {
  // 1. Try Primary Mirrors
  try {
    const json = await fetchFromMirrors(`/${bookId}?range=${rangeStart}-${rangeEnd}`);
    if (json && json.data && json.data.hadiths) {
      return json.data.hadiths.map((item: any) => ({
        number: item.number,
        arab: item.arab,
        id: item.id
      }));
    }
  } catch (error) {
    console.warn(`Error fetching hadith range for ${bookId} from mirrors, trying jsDelivr:`, error);
  }

  // 2. Try JSDelivr CDN Fallback
  try {
    return await fetchFromJSDelivr(bookId, rangeStart, rangeEnd);
  } catch (error) {
    console.warn(`Error fetching hadith range for ${bookId} from jsDelivr:`, error);
  }

  return [];
};