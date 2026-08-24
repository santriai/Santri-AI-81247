import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Search, Pin, Trash2, Edit3, Pencil, Share2, Copy, 
  StickyNote, Bookmark, Sparkles, X, Check, Filter, Tag, Calendar,
  BookOpen, Heart, FileText, CheckCircle2, CloudCheck, CloudOff
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import ConfirmationModal from '../components/ConfirmationModal';
import { motion, AnimatePresence } from 'motion/react';
import { 
  subscribeToUserNotes, 
  saveUserNoteToFirestore, 
  deleteUserNoteFromFirestore 
} from '../services/firebase';

export interface SantriNote {
  id: string;
  title: string;
  content: string;
  arabContent?: string;
  category: 'Kajian' | 'Hafalan' | 'Fiqih' | 'Doa & Dzikir' | 'Harian' | 'Lainnya';
  color: 'emerald' | 'amber' | 'indigo' | 'rose' | 'purple' | 'slate';
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

const CATEGORIES = [
  'Semua',
  'Kajian',
  'Hafalan',
  'Fiqih',
  'Doa & Dzikir',
  'Harian',
  'Lainnya'
] as const;

const COLOR_MAP: Record<SantriNote['color'], { bg: string; border: string; badge: string; dot: string }> = {
  emerald: {
    bg: 'bg-emerald-50/90 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-800/40',
    badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300',
    dot: 'bg-emerald-500'
  },
  amber: {
    bg: 'bg-amber-50/90 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-800/40',
    badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300',
    dot: 'bg-amber-500'
  },
  indigo: {
    bg: 'bg-indigo-50/90 dark:bg-indigo-950/20',
    border: 'border-indigo-200 dark:border-indigo-800/40',
    badge: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300',
    dot: 'bg-indigo-500'
  },
  rose: {
    bg: 'bg-rose-50/90 dark:bg-rose-950/20',
    border: 'border-rose-200 dark:border-rose-800/40',
    badge: 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300',
    dot: 'bg-rose-500'
  },
  purple: {
    bg: 'bg-purple-50/90 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800/40',
    badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
    dot: 'bg-purple-500'
  },
  slate: {
    bg: 'bg-slate-50 dark:bg-slate-900/80',
    border: 'border-slate-200 dark:border-slate-800',
    badge: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    dot: 'bg-slate-500'
  }
};

const DEFAULT_NOTES: SantriNote[] = [
  {
    id: 'sample-1',
    title: 'Catatan Pengajian Hikam',
    content: 'Tanda menuruti hawa nafsu adalah bersegera melakukan amalan sunnah tetapi malas mengerjakan amalan wajib.',
    arabContent: 'مِنْ عَلاَمَاتِ الاِعْتِمَادِ عَلَى الْعَمَلِ نُقْصَانُ الرَّجَاءِ عِنْدَ وُجُودِ الزَّلَلِ',
    category: 'Kajian',
    color: 'emerald',
    isPinned: true,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    tags: ['hikam', 'tasawuf']
  },
  {
    id: 'sample-2',
    title: 'Target Hafalan Juz 30',
    content: 'Target pekan ini: Murojaah Surah An-Naba dan An-Nazi\'at. Menyetor hafalan Surah Abasa hari Jumat setelah Subuh.',
    category: 'Hafalan',
    color: 'indigo',
    isPinned: true,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    tags: ['hafalan', 'juz30']
  },
  {
    id: 'sample-3',
    title: 'Doa Setelah Sholat Dhuha',
    content: 'Ya Allah, jika rezekiku masih di langit maka turunkanlah, jika di bumi maka keluarkanlah, jika sukar maka mudahkanlah.',
    arabContent: 'اللَّهُمَّ إِنَّ الضُّحَاءَ ضُحَاؤُكَ وَالْبَهَاءَ بَهَاؤُكَ وَالْجَمَالَ جَمَالُكَ',
    category: 'Doa & Dzikir',
    color: 'amber',
    isPinned: false,
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5,
    tags: ['dhuha', 'doa']
  }
];

const TEMPLATE_PRESETS = [
  {
    title: 'Catatan Kajian Kitab',
    category: 'Kajian' as const,
    color: 'emerald' as const,
    content: 'Nama Kitab: \nPengajar: \nTanggal: \n\nIbarah / Poin Utama:\n1. \n2. \n\nHikmah & Kesimpulan:\n- '
  },
  {
    title: 'Setoran Hafalan Al-Qur\'an',
    category: 'Hafalan' as const,
    color: 'indigo' as const,
    content: 'Nama Surah / Ayat: \nUstadz / Pengampu: \n\nCatatan Tajwid & Makhorijul Huruf:\n- \n\nTarget Murojaah Berikutnya:\n- '
  },
  {
    title: 'Rincian Doa & Hajat',
    category: 'Doa & Dzikir' as const,
    color: 'amber' as const,
    content: 'Nama Doa / Hajat: \n\nSebab / Niat: \n\nWaktu Pembacaan: (Sesudah Sholat / Sepertiga Malam)\n\nHarapan & Catatan Spiritual:\n- '
  }
];

const NotesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, userData } = useAuth();

  const [notes, setNotes] = useState<SantriNote[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SantriNote | null>(null);
  const [viewNote, setViewNote] = useState<SantriNote | null>(null);
  
  // Delete Modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; noteId: string | null }>({
    isOpen: false,
    noteId: null
  });

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formArab, setFormArab] = useState('');
  const [formCategory, setFormCategory] = useState<SantriNote['category']>('Kajian');
  const [formColor, setFormColor] = useState<SantriNote['color']>('emerald');
  const [formPinned, setFormPinned] = useState(false);
  const [formTags, setFormTags] = useState('');

  // Initial Load & Real-time Firestore Sync
  useEffect(() => {
    // Load local storage first for fast initial rendering
    let localNotes: SantriNote[] = [];
    try {
      const saved = localStorage.getItem('santriai_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localNotes = parsed;
          setNotes(parsed);
        }
      }
      if (localNotes.length === 0) {
        setNotes(DEFAULT_NOTES);
        localStorage.setItem('santriai_notes', JSON.stringify(DEFAULT_NOTES));
        localNotes = DEFAULT_NOTES;
      }
    } catch (e) {
      setNotes(DEFAULT_NOTES);
    }

    // Subscribe to Firestore if user is authenticated
    if (user?.uid) {
      const unsubscribe = subscribeToUserNotes(user.uid, (cloudNotes) => {
        if (cloudNotes && cloudNotes.length > 0) {
          const formatted: SantriNote[] = cloudNotes.map(cn => ({
            id: cn.id,
            title: cn.title || 'Tanpa Judul',
            content: cn.content || '',
            arabContent: cn.arabContent,
            category: cn.category || 'Kajian',
            color: cn.color || 'emerald',
            isPinned: Boolean(cn.isPinned),
            createdAt: cn.createdAt || Date.now(),
            updatedAt: cn.updatedAt || Date.now(),
            tags: cn.tags || []
          }));
          setNotes(formatted);
          try {
            localStorage.setItem('santriai_notes', JSON.stringify(formatted));
          } catch (e) {}
        } else if (localNotes.length > 0) {
          // Sync local notes to Firestore first time user logs in
          localNotes.forEach(note => {
            saveUserNoteToFirestore(user.uid, note);
          });
        }
      });

      return () => unsubscribe();
    }
  }, [user?.uid]);

  // Save to LocalStorage & Firestore helper
  const saveNotesToStorage = (updatedNotes: SantriNote[]) => {
    setNotes(updatedNotes);
    try {
      localStorage.setItem('santriai_notes', JSON.stringify(updatedNotes));
    } catch (e) {
      console.error('Error saving notes locally:', e);
    }
  };

  // Open Form for Creation
  const handleOpenCreateForm = (preset?: typeof TEMPLATE_PRESETS[0]) => {
    setEditingNote(null);
    setFormTitle(preset ? preset.title : '');
    setFormContent(preset ? preset.content : '');
    setFormArab('');
    setFormCategory(preset ? preset.category : 'Kajian');
    setFormColor(preset ? preset.color : 'emerald');
    setFormPinned(false);
    setFormTags('');
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEditForm = (note: SantriNote) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormArab(note.arabContent || '');
    setFormCategory(note.category);
    setFormColor(note.color);
    setFormPinned(note.isPinned);
    setFormTags(note.tags ? note.tags.join(', ') : '');
    setViewNote(null);
    setIsFormOpen(true);
  };

  // Save Note Handler
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Judul catatan tidak boleh kosong', 'warning');
      return;
    }
    if (!formContent.trim() && !formArab.trim()) {
      showToast('Isi catatan tidak boleh kosong', 'warning');
      return;
    }

    const tagArray = formTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const now = Date.now();

    if (editingNote) {
      const updatedNote: SantriNote = {
        ...editingNote,
        title: formTitle.trim(),
        content: formContent.trim(),
        arabContent: formArab.trim() || undefined,
        category: formCategory,
        color: formColor,
        isPinned: formPinned,
        tags: tagArray,
        updatedAt: now
      };

      const updatedList = notes.map(n => n.id === editingNote.id ? updatedNote : n);
      saveNotesToStorage(updatedList);

      if (user?.uid) {
        saveUserNoteToFirestore(user.uid, updatedNote);
      }

      showToast(user?.uid ? 'Catatan disimpan ke Firestore Cloud' : 'Catatan disimpan secara lokal', 'success');
    } else {
      const newNote: SantriNote = {
        id: `note-${now}-${Math.random().toString(36).substring(2, 7)}`,
        title: formTitle.trim(),
        content: formContent.trim(),
        arabContent: formArab.trim() || undefined,
        category: formCategory,
        color: formColor,
        isPinned: formPinned,
        createdAt: now,
        updatedAt: now,
        tags: tagArray
      };

      saveNotesToStorage([newNote, ...notes]);

      if (user?.uid) {
        saveUserNoteToFirestore(user.uid, newNote);
      }

      showToast(user?.uid ? 'Catatan baru tersimpan di Firestore Cloud' : 'Catatan baru tersimpan secara lokal', 'success');
    }

    setIsFormOpen(false);
  };

  // Toggle Pin Status
  const handleTogglePin = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    let targetNote: SantriNote | null = null;
    const updated = notes.map(n => {
      if (n.id === noteId) {
        const nextPinned = !n.isPinned;
        targetNote = { ...n, isPinned: nextPinned };
        showToast(nextPinned ? 'Catatan disematkan' : 'Sematkan dilepas', 'info');
        return targetNote;
      }
      return n;
    });
    saveNotesToStorage(updated);

    if (user?.uid && targetNote) {
      saveUserNoteToFirestore(user.uid, targetNote);
    }
  };

  // Delete Click
  const handleDeleteClick = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, noteId });
  };

  const confirmDelete = () => {
    if (deleteModal.noteId) {
      const updated = notes.filter(n => n.id !== deleteModal.noteId);
      saveNotesToStorage(updated);

      if (user?.uid) {
        deleteUserNoteFromFirestore(user.uid, deleteModal.noteId);
      }

      showToast('Catatan berhasil dihapus', 'info');
      if (viewNote?.id === deleteModal.noteId) {
        setViewNote(null);
      }
    }
    setDeleteModal({ isOpen: false, noteId: null });
  };

  // Copy Note Text
  const handleCopyNote = (note: SantriNote) => {
    let fullText = `${note.title}\n\n`;
    if (note.arabContent) {
      fullText += `${note.arabContent}\n\n`;
    }
    fullText += `${note.content}\n\n— Catatan Santri AI`;

    navigator.clipboard.writeText(fullText);
    showToast('Teks catatan disalin ke papan klip', 'success');
  };

  // Share Note Text
  const handleShareNote = (note: SantriNote) => {
    let fullText = `*${note.title}*\n\n`;
    if (note.arabContent) {
      fullText += `${note.arabContent}\n\n`;
    }
    fullText += `${note.content}\n\n_Catatan Santri AI_`;

    if (window.AndroidNativeInterface?.shareText) {
      window.AndroidNativeInterface.shareText(note.title, fullText);
    } else if (navigator.share) {
      navigator.share({
        title: note.title,
        text: fullText
      }).catch(() => {});
    } else {
      handleCopyNote(note);
    }
  };

  // Filtered & Sorted Notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter(n => {
        const matchesCategory = selectedCategory === 'Semua' || n.category === selectedCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery = !q || 
          n.title.toLowerCase().includes(q) || 
          n.content.toLowerCase().includes(q) ||
          (n.arabContent && n.arabContent.includes(q)) ||
          (n.tags && n.tags.some(t => t.toLowerCase().includes(q)));
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        // Pinned first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Then newest updated
        return b.updatedAt - a.updatedAt;
      });
  }, [notes, selectedCategory, searchQuery]);

  const stats = useMemo(() => {
    const total = notes.length;
    const pinned = notes.filter(n => n.isPinned).length;
    const categoriesCount = new Set(notes.map(n => n.category)).size;
    return { total, pinned, categoriesCount };
  }, [notes]);

  const formatDate = (timeMs: number) => {
    try {
      return new Date(timeMs).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Terbaru';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 text-white shadow-md border-b border-emerald-700/50 px-4 py-3.5">
        <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 -ml-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95"
            >
              <ArrowLeft size={22} />
            </button>
            <h1 className="font-extrabold text-white text-lg flex items-center gap-2 leading-none">
              <StickyNote size={20} className="text-emerald-300" />
              Catatan Santri
            </h1>
          </div>

          <button 
            onClick={() => navigate('/settings')} 
            className="relative active:scale-90 transition-all flex-shrink-0"
            title="Pengaturan Profil"
          >
            <UserAvatar 
              photoURL={userData?.avatarUrl || userData?.photoURL || user?.photoURL}
              displayName={user?.displayName}
              points={userData?.points || 0}
              size="sm"
              avatarFrame={userData?.avatarFrame}
            />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Search Bar - Separate from header */}
        <div className="relative shadow-xs rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 transition-all">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul, kata kunci, atau tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-transparent rounded-xl text-xs font-medium outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={15} />
            </button>
          )}
        </div>
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Quick Template Banner / Suggestions */}
        {notes.length <= 3 && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
            <div className="absolute right-2 bottom-2 opacity-10 pointer-events-none">
              <Sparkles size={90} />
            </div>
            <p className="text-xs font-black uppercase tracking-wider text-emerald-200 mb-1 flex items-center gap-1.5">
              <Sparkles size={14} /> Templat Catatan Cepat
            </p>
            <p className="text-xs text-white/90 mb-3 leading-relaxed">
              Gunakan templat struktur siap pakai untuk mempermudah mencatat kajian kitab atau setoran hafalan:
            </p>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {TEMPLATE_PRESETS.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOpenCreateForm(tmpl)}
                  className="px-3 py-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-xl text-[11px] font-bold text-white whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Plus size={12} />
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-center shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Catatan</p>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-center shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Disematkan</p>
            <p className="text-base font-black text-amber-500 mt-0.5">{stats.pinned}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-center shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori</p>
            <p className="text-base font-black text-indigo-500 mt-0.5">{stats.categoriesCount}</p>
          </div>
        </div>

        {/* Notes Grid List */}
        {filteredNotes.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <FileText size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Belum Ada Catatan {selectedCategory !== 'Semua' ? `kategori ${selectedCategory}` : ''}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Tuliskan faidah kitab, setoran hafalan, atau pengingat ibadah harian Anda sekarang.
              </p>
            </div>
            <button
              onClick={() => handleOpenCreateForm()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <Plus size={16} /> Buat Catatan Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map(note => {
              const colorStyle = COLOR_MAP[note.color] || COLOR_MAP.slate;
              return (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setViewNote(note)}
                  className={`rounded-2xl p-4 border transition-all cursor-pointer relative group hover:shadow-md ${colorStyle.bg} ${colorStyle.border}`}
                >
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${colorStyle.badge}`}>
                        {note.category}
                      </span>
                      {note.isPinned && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Pin size={10} className="fill-amber-500" /> Disematkan
                        </span>
                      )}
                    </div>

                    {/* Quick Action Icons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => handleTogglePin(e, note.id)}
                        title={note.isPinned ? "Lepas Sematan" : "Sematkan di Atas"}
                        className={`p-1.5 rounded-lg transition-colors ${
                          note.isPinned 
                            ? 'text-amber-500 bg-amber-500/10' 
                            : 'text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <Pin size={14} className={note.isPinned ? 'fill-amber-500' : ''} />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleOpenEditForm(note);
                        }}
                        title="Edit Catatan"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={e => handleDeleteClick(e, note.id)}
                        title="Hapus Catatan"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm md:text-base leading-snug mb-1">
                    {note.title}
                  </h3>

                  {/* Arab Content Snippet if available */}
                  {note.arabContent && (
                    <p className="font-arabic text-right text-base text-emerald-800 dark:text-emerald-300 my-2 leading-relaxed line-clamp-2" dir="rtl">
                      {note.arabContent}
                    </p>
                  )}

                  {/* Latin Content Snippet */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 font-normal whitespace-pre-line">
                    {note.content}
                  </p>

                  {/* Footer Meta */}
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <Calendar size={12} />
                      <span>{formatDate(note.updatedAt)}</span>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex items-center gap-1 overflow-hidden ml-2">
                          <Tag size={10} className="text-slate-400 shrink-0" />
                          <span className="truncate">{note.tags.map(t => `#${t}`).join(' ')}</span>
                        </div>
                      )}
                    </div>

                    <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:underline shrink-0">
                      Baca Selengkapnya
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* FLOATING ACTION BUTTON (FAB) FOR NEW NOTE */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.90 }}
        onClick={() => handleOpenCreateForm()}
        className="fixed bottom-6 right-5 z-40 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-emerald-500/30 border border-emerald-400/30 transition-all group"
        title="Buat Catatan Baru"
      >
        <span className="text-2xl" role="img" aria-label="menulis">✍</span>
      </motion.button>

      {/* VIEW NOTE DETAIL MODAL */}
      <AnimatePresence>
        {viewNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={`w-full max-w-lg rounded-3xl border shadow-2xl p-5 overflow-hidden max-h-[85vh] flex flex-col ${
                COLOR_MAP[viewNote.color]?.bg || 'bg-white dark:bg-slate-900'
              } ${COLOR_MAP[viewNote.color]?.border || 'border-slate-200'}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${COLOR_MAP[viewNote.color]?.badge}`}>
                      {viewNote.category}
                    </span>
                    {viewNote.isPinned && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 flex items-center gap-1">
                        <Pin size={10} className="fill-amber-500" /> Disematkan
                      </span>
                    )}
                  </div>
                  <h2 className="font-black text-slate-900 dark:text-white text-base md:text-lg leading-snug">
                    {viewNote.title}
                  </h2>
                </div>

                <button
                  onClick={() => setViewNote(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="overflow-y-auto py-4 space-y-4 pr-1">
                {viewNote.arabContent && (
                  <div className="bg-emerald-500/10 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/20">
                    <p className="font-arabic text-right text-lg md:text-xl text-emerald-900 dark:text-emerald-200 leading-[2.2]" dir="rtl">
                      {viewNote.arabContent}
                    </p>
                  </div>
                )}

                <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal whitespace-pre-wrap break-words">
                  {viewNote.content}
                </div>

                {viewNote.tags && viewNote.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-2">
                    {viewNote.tags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-200/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-slate-400 italic pt-2">
                  Terakhir diperbarui: {formatDate(viewNote.updatedAt)}
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyNote(viewNote)}
                    className="p-2.5 bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Copy size={15} /> Salin
                  </button>
                  <button
                    onClick={() => handleShareNote(viewNote)}
                    className="p-2.5 bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Share2 size={15} /> Bagikan
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditForm(viewNote)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 size={15} /> Edit
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, viewNote.id)}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE / EDIT FORM MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h2 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <StickyNote size={18} className="text-emerald-600 dark:text-emerald-400" />
                  {editingNote ? 'Edit Catatan' : 'Buat Catatan Baru'}
                </h2>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveNote} className="overflow-y-auto py-4 space-y-4 pr-1">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Catatan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Faidah Pengajian Kitab Aqidatul Awam"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Category & Color row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kategori
                    </label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value as SantriNote['category'])}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200"
                    >
                      {CATEGORIES.filter(c => c !== 'Semua').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Warna Kartu
                    </label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {(Object.keys(COLOR_MAP) as SantriNote['color'][]).map(cKey => (
                        <button
                          key={cKey}
                          type="button"
                          onClick={() => setFormColor(cKey)}
                          className={`w-6 h-6 rounded-full ${COLOR_MAP[cKey].dot} flex items-center justify-center transition-transform ${
                            formColor === cKey ? 'scale-125 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          {formColor === cKey && <Check size={12} className="text-white stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Arab Content (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Teks Arab / Ibarah (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    placeholder="Ketik atau tempel ayat, hadits, atau ibarah kitab..."
                    value={formArab}
                    onChange={e => setFormArab(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-arabic text-right outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Isi Catatan *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Tuliskan penjelasan, makna, hikmah, atau tugas hafalan di sini..."
                    value={formContent}
                    onChange={e => setFormContent(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs leading-relaxed outline-none focus:border-emerald-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Tags & Pin */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tag / Label (Dipisah koma)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: hikam, tasawuf, juz30"
                      value={formTags}
                      onChange={e => setFormTags(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formPinned}
                      onChange={e => setFormPinned(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Pin size={12} className="text-amber-500" /> Sematkan Catatan Ini di Atas
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={16} /> Simpan Catatan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Hapus Catatan"
        message="Apakah Anda yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Catatan"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, noteId: null })}
      />
    </div>
  );
};

export default NotesScreen;
