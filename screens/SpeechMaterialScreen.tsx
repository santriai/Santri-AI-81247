import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, BookOpen, Clock, Users, Globe, Sparkles, Copy, Share2, 
  ArrowLeft, Play, Pause, Check, RefreshCw, X,
  Maximize2, Minimize2, ZoomIn, ZoomOut, Volume2, HeartHandshake,
  ChevronRight, MessageSquare, Award, ArrowRight, Bookmark, History, Trash2, Eye, Save, Gem,
  Star, Flag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { deductWasilahForAI } from '../services/firebase';
import { generateSpeechMaterialAI, generateSpeech } from '../services/geminiService';
import { PLAYSTORE_LINK } from '../constants';
import { openExternalLink } from '../utils/linkUtils';
import { ContentReportModal } from '../components/ContentReportModal';
import { InsufficientWasilahModal } from '../components/InsufficientWasilahModal';

const stripMarkdown = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
    .replace(/^[\*\-]\s+/gm, '• ')
    .replace(/`/g, '')
    .trim();
};

type MaterialType = 'ceramah' | 'qori' | 'kultum' | 'mc' | 'sambutan' | 'khutbah';

interface TypeOption {
  id: MaterialType;
  title: string;
  badge: string;
  description: string;
  icon: any;
  color: string;
  bgGradient: string;
  borderColor: string;
  iconBg: string;
  badgeBg: string;
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    id: 'ceramah',
    title: 'Ceramah & Pengajian',
    badge: 'Materi Lengkap',
    description: 'Naskah ceramah lengkap dengan muqaddimah Arab, poin materi, dalil Al-Quran/Hadits, dan doa.',
    icon: Mic,
    color: 'text-emerald-700 dark:text-emerald-300',
    bgGradient: 'bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-teal-500/15 dark:from-emerald-950/80 dark:to-teal-950/60',
    borderColor: 'border-emerald-300 dark:border-emerald-800 hover:border-emerald-500',
    iconBg: 'bg-emerald-600 text-white',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200'
  },
  {
    id: 'qori',
    title: 'Qori / Pembaca Quran',
    badge: 'Tilawah & Maqra',
    description: 'Rekomendasi ayat Al-Quran, teks Latin & terjemahan, serta panduan ucapan pembuka & penutup tilawah.',
    icon: BookOpen,
    color: 'text-blue-700 dark:text-blue-300',
    bgGradient: 'bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-indigo-500/15 dark:from-blue-950/80 dark:to-indigo-950/60',
    borderColor: 'border-blue-300 dark:border-blue-800 hover:border-blue-500',
    iconBg: 'bg-blue-600 text-white',
    badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200'
  },
  {
    id: 'kultum',
    title: 'Kultum (7 Menit)',
    badge: 'Singkat Padat',
    description: 'Kuliah tujuh menit ringkas, padat, dan langsung ke poin inti untuk tausiyah singkat selepas sholat.',
    icon: Clock,
    color: 'text-amber-700 dark:text-amber-300',
    bgGradient: 'bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-orange-500/15 dark:from-amber-950/80 dark:to-orange-950/60',
    borderColor: 'border-amber-300 dark:border-amber-800 hover:border-amber-500',
    iconBg: 'bg-amber-600 text-white',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200'
  },
  {
    id: 'mc',
    title: 'MC / Pembawa Acara',
    badge: 'Rundown & Protokol',
    description: 'Naskah pembawa acara lengkap dengan susunan rundown, narasi transisi agenda, dan sapaan tamu.',
    icon: MessageSquare,
    color: 'text-purple-700 dark:text-purple-300',
    bgGradient: 'bg-gradient-to-br from-purple-500/15 via-purple-500/5 to-fuchsia-500/15 dark:from-purple-950/80 dark:to-fuchsia-950/60',
    borderColor: 'border-purple-300 dark:border-purple-800 hover:border-purple-500',
    iconBg: 'bg-purple-600 text-white',
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/80 dark:text-purple-200'
  },
  {
    id: 'sambutan',
    title: 'Sambutan / Pidato',
    badge: 'Resmi & Formal',
    description: 'Pidato sambutan ketua panitia, pimpinan, tokoh, atau perwakilan keluarga untuk acara keagamaan.',
    icon: HeartHandshake,
    color: 'text-rose-700 dark:text-rose-300',
    bgGradient: 'bg-gradient-to-br from-rose-500/15 via-rose-500/5 to-pink-500/15 dark:from-rose-950/80 dark:to-pink-950/60',
    borderColor: 'border-rose-300 dark:border-rose-800 hover:border-rose-500',
    iconBg: 'bg-rose-600 text-white',
    badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200'
  },
  {
    id: 'khutbah',
    title: 'Khutbah Jumat / Hari Raya',
    badge: 'Rukun Syar\'i',
    description: 'Teks Khutbah I dan Khutbah II resmi lengkap dengan rukun khutbah, hamdalah, sholawat, dan doa Arab.',
    icon: Award,
    color: 'text-teal-700 dark:text-teal-300',
    bgGradient: 'bg-gradient-to-br from-teal-500/15 via-teal-500/5 to-cyan-500/15 dark:from-teal-950/80 dark:to-cyan-950/60',
    borderColor: 'border-teal-300 dark:border-teal-800 hover:border-teal-500',
    iconBg: 'bg-teal-600 text-white',
    badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-900/80 dark:text-teal-200'
  }
];

interface CategoryTheme {
  id: string;
  name: string;
  description: string;
}

const CATEGORY_THEMES: CategoryTheme[] = [
  { id: 'Isra Mi\'raj', name: 'Isra Mi\'raj', description: 'Perjalanan Rasulullah SAW & Perintah Sholat 5 Waktu' },
  { id: 'Maulid Nabi', name: 'Maulid Nabi', description: 'Kelahiran & Meneladani Akhlak Mulia Rasulullah SAW' },
  { id: 'Idul Fitri', name: 'Idul Fitri', description: 'Hari Kemenangan, Ketakwaan & Ukhuwah Islamiyah' },
  { id: 'Idul Adha & Kurban', name: 'Idul Adha & Kurban', description: 'Ketaatan Nabi Ibrahim & Makna Pengorbanan' },
  { id: 'Nuzulul Qur\'an', name: 'Nuzulul Qur\'an', description: 'Kemuliaan Turunnya Al-Quran & Petunjuk Hidup' },
  { id: 'Tahun Baru Hijriah', name: '1 Muharram / Tahun Baru', description: 'Semangat Hijrah & Introspeksi Diri Santri/Umat' },
  { id: 'Hari Santri Nasional', name: 'Hari Santri Nasional', description: 'Peran Santri & Ulama Membela Agama & Negara' },
  { id: 'Nisfu Sya\'ban', name: 'Nisfu Sya\'ban', description: 'Malam Pengampunan Dosa & Persiapan Ramadhan' },
  { id: 'Halal Bihalal', name: 'Halal Bihalal', description: 'Mempererat Silaturahmi & Saling Memaafkan' },
  { id: 'Walimatul \'Ursy / Pernikahan', name: 'Pernikahan (Walimah)', description: 'Membina Keluarga Sakinah, Mawaddah, Warahmah' },
  { id: 'Aqiqah / Tasyakuran Anak', name: 'Aqiqah & Syukuran', description: 'Ungkapan Syukur Atas Karunia Anak & Doa Sholeh' },
  { id: 'Takziyah / Haul / Kematian', name: 'Takziyah & Haul', description: 'Mengingat Kematian, Ketabahan & Doa Almarhum' },
  { id: 'Tema Umum (Akhlak & Ilmu)', name: 'Tema Umum / Akhlak', description: 'Menuntut Ilmu, Birrul Walidain, Sabar & Syukur' },
];

export interface DeliveryStyleOption {
  id: string;
  name: string;
  description: string;
}

const DELIVERY_STYLE_OPTIONS: DeliveryStyleOption[] = [
  { id: 'Campur Humoris', name: 'Campur Humoris', description: 'Lelucon/humor santun agar segar & komunikatif' },
  { id: 'Selingan Pantun', name: 'Selingan Pantun', description: 'Pantun Islami pembuka, isi, atau penutup' },
  { id: 'Bait Puisi / Syair', name: 'Bait Puisi / Syair', description: 'Bait puisi atau syair Islami yang puitis & menyentuh' },
  { id: 'Tegas & Berwibawa', name: 'Tegas & Berwibawa', description: 'Penyampaian lantang, lugas, dan berwibawa' },
  { id: 'Sedih & Menyentuh', name: 'Sedih & Menyentuh', description: 'Penyampaian haru, emosional, & menggugah hati' },
  { id: 'Sapaan Interaktif', name: 'Sapaan Interaktif', description: 'Pertanyaan retoris & sapaan hangat ke jamaah' },
  { id: 'Kisah & Hikayah', name: 'Kisah & Hikayah', description: 'Sirah nabawiyah & kisah teladan sahabat/ulama' },
  { id: 'Khusyu & Khidmah', name: 'Sopan & Khusyu', description: 'Bahasa sangat halus, santun, dan khidmah' },
];

export interface QoriMaqamOption {
  id: string;
  name: string;
  description: string;
}

const QORI_MAQAM_OPTIONS: QoriMaqamOption[] = [
  { id: 'Bayati (Dasar & Populer)', name: 'Bayati', description: 'Irama pembuka, halus & populer' },
  { id: 'Hijaz (Sendu & Syahdu)', name: 'Hijaz', description: 'Syahdu, berwibawa & menyentuh' },
  { id: 'Rast (Tegas & Semangat)', name: 'Rast', description: 'Gagah, tegas & bersemangat' },
  { id: 'Nahawand (Sedih & Manis)', name: 'Nahawand', description: 'Indah, manis, halus & menyentuh' },
  { id: 'Sikah (Khas & Syukur)', name: 'Sikah', description: 'Khas Timur Tengah & bersyukur' },
  { id: 'Jiharkah (Lembut & Khusyu)', name: 'Jiharkah', description: 'Lembut, tenang & khusyu' },
  { id: 'Shoba (Haru & Menyentuh)', name: 'Shoba', description: 'Haru, emosional & menggugah hati' },
  { id: 'Variasi Multi-Maqam', name: 'Multi-Maqam', description: 'Kombinasi perpindahan irama (Tansyit)' },
];

const PRESET_PROMPTS = [
  {
    type: 'khutbah' as MaterialType,
    category: 'Idul Fitri',
    title: 'Khutbah Idul Fitri: Menjaga Ketakwaan Pasca Ramadhan',
    notes: 'Sertakan motivasi istiqomah ibadah dan mempererat silaturahmi sesama tetangga.'
  },
  {
    type: 'ceramah' as MaterialType,
    category: 'Isra Mi\'raj',
    title: 'Ceramah Isra Mi\'raj: Sholat Sebagai Tiang Agama & Benteng Jiwa',
    notes: 'Gunakan gaya penyampaian santun yang menyentuh generasi muda.'
  },
  {
    type: 'mc' as MaterialType,
    category: 'Maulid Nabi',
    title: 'Teks MC Peringatan Maulid Nabi di Masjid',
    notes: 'Sebutkan pembacaan Rawi Diba/Barzanji dan santunan anak yatim.'
  },
  {
    type: 'qori' as MaterialType,
    category: 'Nuzulul Qur\'an',
    title: 'Panduan Tilawah Qori Malam Nuzulul Qur\'an',
    notes: 'Rekomendasikan Surah Al-Qadr dan Surah Al-Baqarah ayat 185.'
  },
  {
    type: 'sambutan' as MaterialType,
    category: 'Idul Adha & Kurban',
    title: 'Sambutan Ketua Panitia Qurban Idul Adha',
    notes: 'Ucapkan terima kasih kepada para sohibul qurban dan panitia penyembelihan.'
  },
  {
    type: 'kultum' as MaterialType,
    category: 'Tema Umum (Akhlak & Ilmu)',
    title: 'Kultum 7 Menit: Keutamaan Berbakti Kepada Orang Tua (Birrul Walidain)',
    notes: 'Teks padat berdurasi 5-7 menit dengan 1 hadits populer.'
  }
];

export const SpeechMaterialScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, userData } = useAuth();

  // Page View state: 'selection' or 'result'
  const [currentView, setCurrentView] = useState<'selection' | 'result'>('selection');

  // Modal Popup Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1);

  // Form parameters
  const [selectedType, setSelectedType] = useState<MaterialType>('ceramah');
  const [selectedCategory, setSelectedCategory] = useState<string>('Isra Mi\'raj');
  const [language, setLanguage] = useState<'indonesia' | 'jawa' | 'sunda' | 'arab_indo'>('indonesia');
  const [audience, setAudience] = useState<'umum' | 'pemuda' | 'majelis_taklim' | 'santri' | 'pejabat'>('umum');
  const [duration, setDuration] = useState<'5min' | '10-15min' | '20-30min'>('10-15min');
  
  const [speakerName, setSpeakerName] = useState('');
  const [eventName, setEventName] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['Campur Humoris', 'Selingan Pantun']);

  // Qori-specific state
  const [showLatin, setShowLatin] = useState<boolean>(true);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [qoriMaqam, setQoriMaqam] = useState<string[]>(['Bayati (Dasar & Populer)', 'Hijaz (Sendu & Syahdu)']);
  const [qoriLength, setQoriLength] = useState<string>('Standar (1 Halaman / Maqra Sholat)');
  const [qoriTajwidGuide, setQoriTajwidGuide] = useState<boolean>(true);

  const toggleStyle = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      setSelectedStyles(selectedStyles.filter(s => s !== styleId));
    } else {
      setSelectedStyles([...selectedStyles, styleId]);
    }
  };

  const toggleQoriMaqam = (maqamId: string) => {
    if (qoriMaqam.includes(maqamId)) {
      setQoriMaqam(qoriMaqam.filter(m => m !== maqamId));
    } else {
      setQoriMaqam([...qoriMaqam, maqamId]);
    }
  };

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [showNoWasilahModal, setShowNoWasilahModal] = useState(false);

  // History & Saved state
  const [history, setHistory] = useState<any[]>(() => {
    try {
      const local = localStorage.getItem('santri_ai_dakwah_history');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  const saveToHistory = (newItem: any) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item.id !== newItem.id && item.title !== newItem.title);
      const updated = [newItem, ...filtered];
      try {
        localStorage.setItem('santri_ai_dakwah_history', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleDeleteHistory = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('santri_ai_dakwah_history', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
    showToast('Materi dihapus dari riwayat.', 'info');
  };

  const isCurrentSaved = history.some(item => item.title === result?.title);

  const handleToggleSave = () => {
    if (!result) return;
    if (isCurrentSaved) {
      const found = history.find(item => item.title === result.title);
      if (found) {
        handleDeleteHistory(found.id);
      }
    } else {
      const newItem = {
        id: Date.now().toString(),
        title: result.title || 'Materi Dakwah',
        type: result.type || selectedType,
        category: result.category || selectedCategory,
        savedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        data: result
      };
      saveToHistory(newItem);
      showToast('Materi berhasil disimpan ke Riwayat!', 'success');
    }
  };

  // Reader mode & Font size
  const [readerMode, setReaderMode] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(2);

  // Audio / Speech State
  const [isAudioGenerating, setIsAudioGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [copied, setCopied] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Open modal for a specific material type
  const handleOpenTypeModal = (type: MaterialType) => {
    setSelectedType(type);
    setModalStep(1);
    setIsModalOpen(true);
  };

  // Open modal from preset
  const handleApplyPreset = (preset: typeof PRESET_PROMPTS[0]) => {
    setSelectedType(preset.type);
    setSelectedCategory(preset.category);
    setCustomNotes(preset.notes);
    setModalStep(2);
    setIsModalOpen(true);
    showToast(`Template "${preset.title}" diterapkan!`, 'info');
  };

  const handleGenerate = async () => {
    if (!user) {
      showToast("Silakan masuk/login terlebih dahulu untuk membuat materi.", "info");
      navigate('/settings');
      return;
    }

    if (!selectedType) {
      showToast("Harap pilih salah satu Tipe Materi terlebih dahulu.", "warning");
      return;
    }

    if (!selectedCategory) {
      showToast("Harap pilih Kategori / Tema Acara terlebih dahulu.", "warning");
      setModalStep(1);
      return;
    }

    if (selectedType === 'qori') {
      if (qoriMaqam.length < 1) {
        showToast("Harap pilih minimal 1 Pilihan Nada / Irama Tilawah (Maqam).", "warning");
        return;
      }
    } else {
      if (selectedStyles.length < 1) {
        showToast("Harap pilih minimal 1 Gaya & Nuansa Penyampaian.", "warning");
        return;
      }
    }

    const currentWasilah = Number(userData?.wasilah ?? userData?.wasilahPoints ?? 0);
    if (currentWasilah < 2) {
      setShowNoWasilahModal(true);
      return;
    }

    setLoading(true);

    try {
      const data = await generateSpeechMaterialAI({
        type: selectedType,
        category: selectedCategory,
        language,
        audience,
        duration,
        speakerName: speakerName.trim(),
        eventName: eventName.trim(),
        customNotes: customNotes.trim(),
        deliveryStyles: selectedStyles,
        showLatin,
        showTranslation,
        qoriMaqam,
        qoriLength,
        qoriTajwidGuide
      });

      await deductWasilahForAI(user.uid, 2, `Materi Public Speaking (${selectedType.toUpperCase()})`);
      setResult(data);

      // Auto save to history
      const historyItem = {
        id: Date.now().toString(),
        title: data.title || 'Materi Dakwah',
        type: selectedType,
        category: selectedCategory,
        savedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        data
      };
      saveToHistory(historyItem);

      setIsModalOpen(false);
      setAudioUrl(null);
      setIsPlayingAudio(false);
      setCurrentView('result');
      showToast('Materi berhasil dibuat secara otomatis! (Dipotong 2 Wasilah)', 'success');
    } catch (e: any) {
      showToast(e.message || 'Gagal membuat materi. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    
    let textToCopy = `=== ${result.title || 'Materi Public Speaking'} ===\n`;
    textToCopy += `Tipe: ${result.type?.toUpperCase()} | Kategori: ${result.category}\n\n`;

    if (result.muqaddimah?.arabic) {
      textToCopy += `[MUQADDIMAH]\n${result.muqaddimah.arabic}\n\n${result.muqaddimah.translation || ''}\n\n`;
    }

    if (result.themeOverview) {
      textToCopy += `[RINGKASAN TEMA]\n${result.themeOverview}\n\n`;
    }

    if (result.contentBlocks && Array.isArray(result.contentBlocks)) {
      result.contentBlocks.forEach((block: any, idx: number) => {
        textToCopy += `${idx + 1}. ${block.heading || 'Poin Materi'}\n${block.body || ''}\n`;
        if (block.dalil?.arabic) {
          textToCopy += `Dalil (${block.dalil.source || ''}):\n${block.dalil.arabic}\n${block.dalil.translation || ''}\n`;
        }
        textToCopy += `\n`;
      });
    }

    if (result.khutbahTwo?.arabic) {
      textToCopy += `[KHUTBAH KEDUA]\n${result.khutbahTwo.arabic}\n\n${result.khutbahTwo.translation || ''}\n\nDoa:\n${result.khutbahTwo.duaArabic || ''}\n\n`;
    }

    if (result.mcRundown && Array.isArray(result.mcRundown)) {
      textToCopy += `[RUNDOWN ACARA MC]\n`;
      result.mcRundown.forEach((item: any) => {
        textToCopy += `${item.time || ''} - ${item.title || ''}:\n${item.script || ''}\n\n`;
      });
    }

    if (result.closing?.arabicDua || result.closing?.summary) {
      textToCopy += `[PENUTUP & DOA]\n${result.closing.summary || ''}\n\nDoa:\n${result.closing.arabicDua || ''}\n${result.closing.translation || ''}\n`;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Seluruh materi berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleGenerateAudio = async () => {
    if (!result) return;
    
    let sampleText = `${result.title}. `;
    if (result.contentBlocks && result.contentBlocks[0]) {
      sampleText += `${result.contentBlocks[0].heading}. ${result.contentBlocks[0].body}`;
    } else if (result.themeOverview) {
      sampleText += result.themeOverview;
    }

    setIsAudioGenerating(true);
    try {
      const url = await generateSpeech(sampleText, false);
      setAudioUrl(url);
      showToast('Audio ceramah siap didengarkan!', 'success');
    } catch (e: any) {
      showToast('Gagal memuat audio: ' + e.message, 'error');
    } finally {
      setIsAudioGenerating(false);
    }
  };

  const handleToggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleShare = () => {
    if (!result) return;
    const title = result.title || 'Materi Public Speaking Islami';
    const text = `*${result.title}*\n\n${result.themeOverview || ''}\n\nDibuat dengan Santri AI.`;

    if (window.AndroidNativeInterface?.shareText) {
      try {
        window.AndroidNativeInterface.shareText(title, text);
        return;
      } catch (err) {
        console.warn("Android share failed:", err);
      }
    }

    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const getFontSizeClass = () => {
    switch(fontSizeLevel) {
      case 1: return 'text-sm leading-relaxed';
      case 2: return 'text-base leading-relaxed';
      case 3: return 'text-lg leading-loose';
      case 4: return 'text-xl leading-loose';
      case 5: return 'text-2xl leading-loose font-medium';
      default: return 'text-base leading-relaxed';
    }
  };

  const activeTypeInfo = TYPE_OPTIONS.find(t => t.id === selectedType) || TYPE_OPTIONS[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-28">
      
      {/* HEADER UTAMA DENGAN GRADASI */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 text-white px-4 py-3.5 flex items-center justify-between shadow-lg border-b border-emerald-600/40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (currentView === 'result') {
                setCurrentView('selection');
              } else {
                navigate(-1);
              }
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white backdrop-blur-md"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
              <span>Materi Dakwah</span>
            </h1>
          </div>
        </div>

        {userData && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500/20 backdrop-blur-md border border-cyan-300/40 rounded-full text-cyan-200 font-bold text-xs shadow-xs">
            <Gem size={14} className="fill-cyan-300 text-cyan-300 animate-pulse" />
            <span>{(userData.wasilah || 0).toLocaleString()} Wasilah</span>
          </div>
        )}
      </div>

      {/* VIEW 1: SELECTION MENU (GRID TIPE MATERI & INSPIRASI) */}
      {currentView === 'selection' && (
        <div className="max-w-4xl mx-auto px-4 pt-5 space-y-6">
          
          {/* BANNER INTRO */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 text-white p-6 shadow-xl border border-emerald-600/30">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-emerald-200 tracking-wide uppercase">
                <Mic size={13} />
                <span>Pusat Public Speaking & Acara Islami</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                Pilih Tipe Materi Yang Ingin Dibuat
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl font-medium">
                Klik salah satu kategori di bawah untuk membuka form pengisian serba praktis.
              </p>
            </div>
            <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none text-emerald-300">
              <BookOpen size={220} />
            </div>
          </div>

          {/* RIWAYAT & MATERI TERSIMPAN */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History size={14} className="text-emerald-500" />
                <span>Riwayat & Materi Tersimpan</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                  {history.length}
                </span>
              </span>

              {history.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Hapus semua riwayat materi dakwah?')) {
                      setHistory([]);
                      localStorage.removeItem('santri_ai_dakwah_history');
                      showToast('Riwayat berhasil dibersihkan.', 'info');
                    }
                  }}
                  className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  <span>Bersihkan</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2">
                <Bookmark size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Belum ada materi tersimpan.
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Materi yang Anda buat akan otomatis tersimpan di sini untuk dapat dibuka kembali kapan saja.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setResult(item.data);
                      setCurrentView('result');
                      showToast(`Membuka: ${item.title}`, 'info');
                    }}
                    className="p-4 bg-white dark:bg-slate-900 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 shadow-xs group"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase">
                          {item.type || 'Materi'}
                        </span>
                        {item.category && (
                          <span className="text-[10px] font-semibold text-slate-400">
                            • {item.category}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium ml-auto sm:ml-0">
                          {item.savedAt}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setResult(item.data);
                          setCurrentView('result');
                        }}
                        className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded-xl transition-colors"
                        title="Buka Materi"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteHistory(item.id, e)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GRID TIPE MATERI DENGAN BACKGROUND WARNA BERBEDA */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span>Pilih Tipe Materi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {TYPE_OPTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleOpenTypeModal(item.id)}
                    className={`p-5 rounded-3xl border text-left transition-all relative flex flex-col justify-between group shadow-sm hover:shadow-xl hover:-translate-y-1 ${item.bgGradient} ${item.borderColor}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs ${item.iconBg}`}>
                          <Icon size={22} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-300/40 flex items-center gap-1 shadow-xs">
                            <Gem size={11} className="fill-cyan-500 text-cyan-500" />
                            2 Wasilah
                          </span>
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${item.badgeBg}`}>
                            {item.badge}
                          </span>
                        </div>
                      </div>
                      <h4 className="text-base font-black text-slate-900 dark:text-slate-100 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 font-medium leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 border-t border-slate-200/50 dark:border-slate-800/50 mt-4">
                      <span>Mulai Isi Form</span>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TEMPLATE INSPIRASI (PRESETS) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" />
                Template & Inspirasi Cepat
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_PROMPTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-4 bg-white dark:bg-slate-900 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-left transition-all group flex items-start justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase">
                        {preset.type}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {preset.category}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {preset.title}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: HASIL MATERI (PAGE VIEW KHUSUS) */}
      {currentView === 'result' && result && (
        <div className="max-w-4xl mx-auto px-4 pt-5 pb-12 space-y-6">

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden ${
              readerMode ? 'fixed inset-0 z-[100] rounded-none overflow-y-auto p-6 bg-amber-50/20 dark:bg-slate-950' : 'p-6'
            }`}
          >
            {/* CONTROL BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  HASIL MATERI • {result.type?.toUpperCase() || selectedType.toUpperCase()}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-2 leading-snug">
                  {result.title}
                </h2>
                {result.subtitle && (
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {result.subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Font Size Adjuster */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-slate-600 dark:text-slate-300">
                  <button
                    onClick={() => setFontSizeLevel(prev => Math.max(1, prev - 1))}
                    className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-xs font-bold"
                    title="Kecilkan Teks"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="px-2 text-xs font-bold">A</span>
                  <button
                    onClick={() => setFontSizeLevel(prev => Math.min(5, prev + 1))}
                    className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-xs font-bold"
                    title="Besarkan Teks"
                  >
                    <ZoomIn size={16} />
                  </button>
                </div>

                {/* Fullscreen Reader Mode Toggle */}
                <button
                  onClick={() => setReaderMode(!readerMode)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                    readerMode
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                  title="Mode Podium / Panggung"
                >
                  {readerMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
              </div>
            </div>

            {/* CONTENT BODY */}
            <div className={`space-y-6 ${getFontSizeClass()}`}>
              
              {/* MUQADDIMAH */}
              {result.muqaddimah && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">
                    Muqaddimah Pembuka (Bahasa Arab)
                  </span>
                  {result.muqaddimah.arabic && (
                    <p className="font-arabic text-xl sm:text-2xl leading-loose text-slate-900 dark:text-slate-100 text-right" dir="rtl">
                      {result.muqaddimah.arabic}
                    </p>
                  )}
                  {result.muqaddimah.latin && (
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 italic font-mono">
                      "{result.muqaddimah.latin}"
                    </p>
                  )}
                  {result.muqaddimah.translation && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {result.muqaddimah.translation}
                    </p>
                  )}
                </div>
              )}

              {/* OVERVIEW */}
              {result.themeOverview && (
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 rounded-r-2xl">
                  <p className="text-slate-800 dark:text-slate-200 font-medium italic">
                    {result.themeOverview}
                  </p>
                </div>
              )}

              {/* MC RUNDOWN */}
              {result.mcRundown && Array.isArray(result.mcRundown) && (
                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <MessageSquare size={16} className="text-purple-500" />
                    Susunan Rundown & Naskah MC
                  </h4>
                  <div className="space-y-3">
                    {result.mcRundown.map((item: any, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                          <span>Agenda {idx + 1}: {item.title}</span>
                          <span>{item.time}</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-medium">
                          {item.script}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QORI GUIDE */}
              {result.qoriGuide && (
                <div className="space-y-4 bg-blue-50/40 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <h4 className="font-black text-blue-900 dark:text-blue-300 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <BookOpen size={16} className="text-blue-500" />
                    Panduan & Teks Tilawah Qori
                  </h4>
                  
                  {result.qoriGuide.recommendedSurahs && (
                    <div className="space-y-1">
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Rekomendasi Surah/Ayat Maqra':</span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {result.qoriGuide.recommendedSurahs.map((surah: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 rounded-full font-bold text-xs">
                            {surah}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.qoriGuide.openingScript && (
                    <div className="space-y-1 pt-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Teks Pembuka Qori:</span>
                      <p className="p-3 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium">
                        {result.qoriGuide.openingScript}
                      </p>
                    </div>
                  )}

                  {result.qoriGuide.closingScript && (
                    <div className="space-y-1 pt-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Teks Penutup Tilawah (Shadaqallahul 'Adzim):</span>
                      <p className="p-3 bg-white dark:bg-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium">
                        {result.qoriGuide.closingScript}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* CONTENT BLOCKS */}
              {result.contentBlocks && Array.isArray(result.contentBlocks) && (
                <div className="space-y-6 pt-2">
                  {result.contentBlocks.map((block: any, idx: number) => (
                    <div key={idx} className="space-y-3">
                      <h4 className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-base border-b pb-2 border-slate-200 dark:border-slate-800">
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                          {idx + 1}
                        </span>
                        {stripMarkdown(block.heading)}
                      </h4>

                      <p className="text-slate-800 dark:text-slate-200 font-normal leading-relaxed whitespace-pre-line">
                        {stripMarkdown(block.body)}
                      </p>

                      {/* DALIL */}
                      {block.dalil && (block.dalil.arabic || block.dalil.translation) && (
                        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800 space-y-2 my-3">
                          {block.dalil.source && (
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                              Dalil: {block.dalil.source}
                            </span>
                          )}
                          {block.dalil.arabic && (
                            <p className="font-arabic text-xl sm:text-2xl leading-loose text-slate-900 dark:text-slate-100 text-right" dir="rtl">
                              {block.dalil.arabic}
                            </p>
                          )}
                          {block.dalil.latin && (
                            <p className="text-xs text-emerald-800 dark:text-emerald-300 italic font-mono">
                              "{block.dalil.latin}"
                            </p>
                          )}
                          {block.dalil.translation && (
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                              "{block.dalil.translation}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* KHUTBAH SECOND PART */}
              {result.khutbahTwo && (
                <div className="space-y-4 p-5 bg-teal-50/50 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-800">
                  <h4 className="font-black text-teal-900 dark:text-teal-200 text-sm uppercase tracking-wider">
                    Khutbah Kedua (Jumat / Hari Raya)
                  </h4>
                  
                  {result.khutbahTwo.arabic && (
                    <p className="font-arabic text-xl sm:text-2xl leading-loose text-slate-900 dark:text-slate-100 text-right" dir="rtl">
                      {result.khutbahTwo.arabic}
                    </p>
                  )}

                  {result.khutbahTwo.translation && (
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {result.khutbahTwo.translation}
                    </p>
                  )}

                  {result.khutbahTwo.duaArabic && (
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-teal-200 dark:border-teal-700 space-y-2">
                      <span className="text-[10px] font-black text-teal-700 dark:text-teal-300 uppercase">
                        Doa Khutbah Kedua (Untuk Kaum Muslimin/Muslimat)
                      </span>
                      <p className="font-arabic text-xl leading-loose text-slate-900 dark:text-slate-100 text-right" dir="rtl">
                        {result.khutbahTwo.duaArabic}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* CLOSING & DOA */}
              {result.closing && (
                <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                    Penutup & Doa
                  </span>
                  {result.closing.summary && (
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {result.closing.summary}
                    </p>
                  )}
                  {result.closing.arabicDua && (
                    <p className="font-arabic text-xl sm:text-2xl leading-loose text-amber-300 text-right pt-2" dir="rtl">
                      {result.closing.arabicDua}
                    </p>
                  )}
                  {result.closing.translation && (
                    <p className="text-xs text-slate-300 italic pt-1">
                      "{result.closing.translation}"
                    </p>
                  )}
                </div>
              )}

              {/* TIPS PENYAMPAIAN */}
              {result.deliveryTips && Array.isArray(result.deliveryTips) && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-2 text-xs">
                  <span className="font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider block flex items-center gap-1.5">
                    <Sparkles size={14} />
                    Tips Retorika & Penyampaian
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                    {result.deliveryTips.map((tip: string, idx: number) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ACTION BUTTONS AT THE BOTTOM OF RESULT PAGE */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleOpenTypeModal(selectedType)}
                    className="w-full sm:w-1/3 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                  >
                    <Sparkles size={16} />
                    <span>Buat Variasi Lain</span>
                  </button>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
                    <button
                      onClick={handleCopy}
                      className="w-full px-3 py-3 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
                    >
                      {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                      <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="w-full px-3 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
                    >
                      <Share2 size={15} />
                      <span>Bagikan</span>
                    </button>

                    <button
                      onClick={() => openExternalLink(PLAYSTORE_LINK)}
                      className="w-full px-3 py-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
                    >
                      <Star size={15} className="text-amber-500 fill-amber-500" />
                      <span>Rating</span>
                    </button>

                    <button
                      onClick={() => setIsReportOpen(true)}
                      className="w-full px-3 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800/60 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
                    >
                      <Flag size={15} />
                      <span>Laporkan</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentView('selection')}
                  className="w-full px-4 py-2.5 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <ArrowLeft size={16} />
                  <span>Kembali ke Pilihan Materi</span>
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}

      {/* POPUP MODAL MULTI-STEP SLIDE FORM */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4 pb-20 sm:pb-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              {/* MODAL HEADER */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${activeTypeInfo.iconBg}`}>
                    {React.createElement(activeTypeInfo.icon, { size: 20 })}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-snug">
                      Form Materi: {activeTypeInfo.title}
                    </h3>
                    {/* Step indicator pills */}
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setModalStep(1)}
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full transition-all ${
                          modalStep === 1
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        1. Tema Acara
                      </button>
                      <span className="text-[10px] font-bold text-slate-300">/</span>
                      <button
                        type="button"
                        onClick={() => setModalStep(2)}
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full transition-all ${
                          modalStep === 2
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        2. Detail Teks
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-300 active:scale-95 transition-all disabled:opacity-50 shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* MODAL BODY (STEP SLIDES) */}
              <div className="p-5 overflow-y-auto space-y-5 flex-1">
                
                {/* STEP 1: PILIH KATEGORI / TEMA ACARA */}
                {modalStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                          Pilih Kategori / Tema Acara
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Pilih hari besar atau tema materi yang ingin disampaikan.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[45vh] overflow-y-auto pr-1">
                      {CATEGORY_THEMES.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition-all flex flex-col justify-between gap-1 shadow-xs ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200 dark:shadow-none ring-2 ring-emerald-500'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-black text-xs leading-snug">{cat.name}</span>
                              {isSelected && <Check size={16} className="text-white shrink-0" />}
                            </div>
                            <span className={`text-[10px] font-normal line-clamp-2 mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                              {cat.description}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: DETAIL & PARAMETER PENYESUAIAN */}
                {modalStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                        {selectedType === 'qori' ? 'Detail & Pengaturan Qori / Tilawah' : 'Detail & Pengaturan Teks'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {selectedType === 'qori'
                          ? 'Atur pilihan nada/irama tilawah (maqam), transliterasi latin, terjemah, dan panduan tajwid.'
                          : 'Atur bahasa, target jamaah, durasi, gaya penyampaian, dan catatan khusus.'}
                      </p>
                    </div>

                    {selectedType === 'qori' ? (
                      /* KHUSUS PENYESUAIAN TILAWAH QORI */
                      <>
                        {/* PILIHAN NADA / IRAMA TILAWAH (MAQAM) */}
                        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles size={14} className="text-amber-500 fill-amber-500" />
                              <span>Pilihan Nada / Irama Tilawah (Maqam)</span>
                            </label>
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                              Minimal Pilih 1 Maqam
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Pilih jenis seni lagu tilawah agar AI menyisipkan petunjuk perpindahan irama maqam pada setiap bait naskah Qori.
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            {QORI_MAQAM_OPTIONS.map((maqam) => {
                              const isSelected = qoriMaqam.includes(maqam.id);
                              return (
                                <button
                                  key={maqam.id}
                                  type="button"
                                  onClick={() => toggleQoriMaqam(maqam.id)}
                                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 active:scale-95 ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500 shadow-xs'
                                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-extrabold text-xs leading-tight">{maqam.name}</span>
                                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                                      isSelected ? 'bg-white text-emerald-600 border-white' : 'border-slate-300 dark:border-slate-600 bg-transparent'
                                    }`}>
                                      {isSelected && <Check size={12} strokeWidth={3} />}
                                    </div>
                                  </div>
                                  <span className={`text-[9px] line-clamp-1 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                                    {maqam.description}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* PENGATURAN TAMPILAN TEKS LATIN, TERJEMAH & TAJWID */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* TOGGLE TEKS LATIN */}
                          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex flex-col select-none">
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Teks Latin</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">Transliterasi latin</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowLatin(!showLatin)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                showLatin ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  showLatin ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          {/* TOGGLE TERJEMAHAN */}
                          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex flex-col select-none">
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Terjemahan</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">Terjemah Indonesia</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowTranslation(!showTranslation)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                showTranslation ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  showTranslation ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          {/* TOGGLE PANDUAN TAJWID */}
                          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex flex-col select-none">
                              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Panduan Tajwid</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">Tajwid & Waqaf</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setQoriTajwidGuide(!qoriTajwidGuide)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                qoriTajwidGuide ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  qoriTajwidGuide ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* PANJANG MAQRA & TARGET AUDIENS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Clock size={13} className="text-amber-500" /> Panjang Maqra' / Ayat
                            </label>
                            <select
                              value={qoriLength}
                              onChange={(e) => setQoriLength(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="Singkat (3-5 Ayat / Maqra Ringkas)">Singkat (3-5 Ayat / 1/2 Halaman)</option>
                              <option value="Standar (1 Halaman / Maqra Sholat)">Standar (1 Halaman / Maqra Sholat)</option>
                              <option value="Panjang (2-3 Halaman / Tilawah Lomba MTQ)">Panjang (2-3 Halaman / Tilawah Lomba MTQ)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Users size={13} className="text-blue-500" /> Target Acara / Audiens
                            </label>
                            <select
                              value={audience}
                              onChange={(e: any) => setAudience(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="umum">Jamaah Umum / PHBI</option>
                              <option value="pemuda">Remaja / Pelajar / Santri</option>
                              <option value="majelis_taklim">Majelis Taklim / Ibu-ibu</option>
                              <option value="pejabat">Acara Formal / Perlombaan MTQ</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                              Nama Qori / Pembaca Quran (Opsional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Qori Ust. Ahmad Zaki, S.Ag"
                              value={speakerName}
                              onChange={(e) => setSpeakerName(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                              Nama Acara / Masjid (Opsional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Peringatan Nuzulul Qur'an Masjid Agung"
                              value={eventName}
                              onChange={(e) => setEventName(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                            Request Surat / Ayat Khusus (Opsional)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="e.g. Bacakan Surat Al-Baqarah 183-186 atau Surat Al-Hasyr 21-24..."
                            value={customNotes}
                            onChange={(e) => setCustomNotes(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                          />
                        </div>
                      </>
                    ) : (
                      /* PENGATURAN UMUM CERAMAH, KHUTBAH, KULTUM, MC, SAMBUTAN */
                      <>
                        {/* GAYA & NUANSA PENYAMPAIAN (MULTI SELECT) */}
                        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles size={14} className="text-amber-500 fill-amber-500" />
                              <span>Gaya & Nuansa Penyampaian</span>
                            </label>
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                              Bisa Pilih Lebih dari 1
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Pilih gaya penyampaian agar AI menyisipkan humor, pantun, puisi, ketegasan, atau keharuan ke dalam naskah.
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            {DELIVERY_STYLE_OPTIONS.map((style) => {
                              const isSelected = selectedStyles.includes(style.id);
                              return (
                                <button
                                  key={style.id}
                                  type="button"
                                  onClick={() => toggleStyle(style.id)}
                                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 active:scale-95 ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500 shadow-xs'
                                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-extrabold text-xs leading-tight">{style.name}</span>
                                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                                      isSelected ? 'bg-white text-emerald-600 border-white' : 'border-slate-300 dark:border-slate-600 bg-transparent'
                                    }`}>
                                      {isSelected && <Check size={12} strokeWidth={3} />}
                                    </div>
                                  </div>
                                  <span className={`text-[9px] line-clamp-1 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                                    {style.description}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* BAHASA */}
                          <div className="space-y-1">
                            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Globe size={13} className="text-emerald-500" /> Bahasa
                            </label>
                            <select
                              value={language}
                              onChange={(e: any) => setLanguage(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="indonesia">Bahasa Indonesia</option>
                              <option value="jawa">Bahasa Jawa (Krama)</option>
                              <option value="sunda">Bahasa Sunda (Lemes)</option>
                              <option value="arab_indo">Arab & Indonesia</option>
                            </select>
                          </div>

                          {/* AUDIENS */}
                          <div className="space-y-1">
                            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Users size={13} className="text-blue-500" /> Jamaah
                            </label>
                            <select
                              value={audience}
                              onChange={(e: any) => setAudience(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="umum">Jamaah Umum</option>
                              <option value="pemuda">Pemuda / Remaja</option>
                              <option value="majelis_taklim">Majelis Taklim</option>
                              <option value="santri">Santri / Anak-Anak</option>
                              <option value="pejabat">Acara Resmi / Formal</option>
                            </select>
                          </div>

                          {/* DURASI */}
                          <div className="space-y-1">
                            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Clock size={13} className="text-amber-500" /> Durasi
                            </label>
                            <select
                              value={duration}
                              onChange={(e: any) => setDuration(e.target.value)}
                              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="5min">5-7 Menit (Ringkas)</option>
                              <option value="10-15min">10-15 Menit (Sedang)</option>
                              <option value="20-30min">20-30 Menit (Panjang)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                              Nama Pembicara / MC (Opsional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Ust. Muhammad Farhan, S.Pd.I"
                              value={speakerName}
                              onChange={(e) => setSpeakerName(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                              Nama Acara / Tempat (Opsional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Masjid Al-Barokah / Pesantren"
                              value={eventName}
                              onChange={(e) => setEventName(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
                            Poin Khusus / Pesan Tambahan (Opsional)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Catatan poin ceramah atau pesan khusus..."
                            value={customNotes}
                            onChange={(e) => setCustomNotes(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                          />
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

              </div>

              {/* MODAL FOOTER DENGAN TOMBOL SEBELUMNYA & BERIKUTNYA */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                {modalStep === 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedCategory) {
                          showToast("Harap pilih Kategori / Tema Acara terlebih dahulu.", "warning");
                          return;
                        }
                        setModalStep(2);
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
                    >
                      <span>Berikutnya</span>
                      <ArrowRight size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setModalStep(1)}
                      disabled={loading}
                      className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <ArrowLeft size={16} />
                      <span>Sebelumnya</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-200 dark:shadow-none transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Menyusun AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} className="fill-amber-300 text-amber-300" />
                          <span>Buat Materi</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INDIKATOR LOADING AI SETELAH KLIK BUAT MATERI */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6 relative overflow-hidden flex flex-col items-center">
              {/* Glow Background Effect */}
              <div className="absolute -top-16 -left-16 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

              {/* Animated Icon Container */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/40"
                />
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30"
                >
                  <Sparkles size={32} className="fill-amber-300 text-amber-300 animate-pulse" />
                </motion.div>
              </div>

              {/* Loading Title & Text */}
              <div className="space-y-2">
                <h3 className="text-base font-black text-white leading-snug">
                  Sedang Menyusun Materi AI...
                </h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Mohon tunggu sebentar, AI sedang merangkai naskah, dalil Al-Qur'an & Hadits, serta gaya retorika pilihan Anda.
                </p>
              </div>

              {/* Progress Bar & Badges */}
              <div className="w-full space-y-3 pt-2">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden relative">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="h-full w-1/2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full"
                  />
                </div>

                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60 flex items-center gap-1.5">
                    <RefreshCw size={12} className="animate-spin text-emerald-400" />
                    Memproses 2 Wasilah
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName={`Materi Dakwah (${result?.title || 'Umum'})`}
        contentSnippet={result?.title ? `${result.title}\n\n${result?.body?.slice(0, 300) || ''}` : ''}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      <InsufficientWasilahModal
        isOpen={showNoWasilahModal}
        onClose={() => setShowNoWasilahModal(false)}
        requiredWasilah={2}
        featureName="Generator Materi Dakwah & Public Speaking"
      />

    </div>
  );
};

export default SpeechMaterialScreen;
