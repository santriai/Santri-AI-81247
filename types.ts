
export interface TranslationResult {
  id: string;
  originalText: string;
  matan?: string;
  arabGundul?: string;
  murab?: string;
  maknaGandul: string;
  modernTranslation: string;
  nahwuShorof?: string;
  lughah?: string;
  munawwir?: string;
  balaghah?: string;
  ushulFiqh?: string;
  bahtsulMasail?: string;
  ijma?: string;
  qiyas?: string;
  madzhab?: string;
  tajwid?: string;
  syarah?: string;
  asbabunNuzul?: string;
  asbabulWurud?: string;
  hikmah?: string;
  referensi?: string;
  quranRef?: string;
  hadithRef?: string;
  aiExplanation?: string;
  createdAt: string;
  synced: boolean;
}

export type HistoryType = 'translation' | 'quran' | 'hadis' | 'kitab' | 'doa' | 'sholat' | 'quiz' | 'mutiara';

export interface HistoryItem {
  id: string;
  type: HistoryType;
  title: string;
  subtitle?: string;
  timestamp: string;
  path: string;
  data?: any;
}

export type TranslationStyle = 'mixed' | 'modern_only' | 'gandul_only';
export type AppTheme = 'light' | 'dark' | 'system';
export type ArabicFont = 'amiri' | 'scheherazade' | 'noto';

export interface AppSettings {
  style: TranslationStyle;
  fontSize: number;
  theme: AppTheme;
  arabicFont: ArabicFont;
  dailyAttendanceReminderEnabled?: boolean;
}

export interface Ayah {
  id: number;
  surahNumber?: number;
  number: number;
  arab: string;
  latin: string;
  text: string;
  audio: string;
  tafsir?: string;
  audioMap?: Record<string, string>;
}

export interface Surah {
  number: number;
  name: string;
  name_latin: string;
  number_of_ayah: number;
  place: string;
  meaning: string;
  description: string;
  ayahs?: Ayah[];
  audioFull?: string;
}

export interface BookmarkItem {
  id: string;
  surahNumber: number;
  surahName: string;
  ayah: Ayah;
  savedAt: string;
}

export interface HadithBook {
  name: string;
  id: string;
  available: number;
}

export interface HadithDetail {
  number: number;
  arab: string;
  id: string;
}

export interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface HijriDate {
  day: string;
  month: {
    en: string;
    ar: string;
  };
  year: string;
}

export interface PrayerData {
  timings: PrayerTimes;
  date: {
    readable: string;
    hijri: HijriDate;
  };
  meta: {
    timezone: string;
  };
}

export interface QuizQuestion {
  id?: string;
  question: string;
  arabicQuestion?: string;
  audioUrl?: string;
  surahRef?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic?: string;
  isTieBreaker?: boolean;
}

export interface EssayQuestion {
  type: string;
  question: string;
  clue?: string;
  answerKey: string;
  explanation: string;
}

export interface RadioStation {
  id: string;
  name: string;
  url: string;
  genre: string;
  location: string;
  logo?: string;
}

// Creator Tools Types
export type CreatorToolType = 'writer' | 'audio' | 'music' | 'visual';

export interface GeneratedContent {
  id: string;
  type: CreatorToolType;
  title: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

// New Audio Item for Library
export interface AudioLibraryItem {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover: string;
  category?: string;
}

export interface NarrativeSection {
  title: string;
  content: string;
}

export interface TimelineEvent {
  year: string;
  event: string;
  icon?: string;
}

export interface BioData {
  fullName: string;
  titles: string;
  birthYear?: string;
  deathYear?: string;
  century?: string;
  birthDeath: string;
  tombLocation?: string;
  googleMapsLink?: string;
  intro: string;
  teachers: string[];
  students: string[];
  works: string[];
  sanad?: string;
  manhaj?: string;
  narrativeSections: NarrativeSection[];
  timeline?: TimelineEvent[];
}

export interface MutiaraData {
  id?: string;
  type: 'quote' | 'video';
  scholar: string;
  role: string;
  content: string; 
  title?: string; 
  url?: string; 
  thumbnail?: string; 
  theme?: string;
  date?: string;
  userId?: string; // NEW: Added userId
}
