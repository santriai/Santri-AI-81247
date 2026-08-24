
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateJson, fetchCategorizedKitab, queueBackgroundTask, getCategoryFolder, getSlug } from '../services/geminiService';
import { saveToGitHub } from '../services/githubDataService';
import { useAuth } from '../contexts/AuthContext';
import { removeUserBookmark, subscribeUserBookmarks } from '../services/firebase';
import { ArrowLeft, Search, Loader2, RefreshCw, Trash2, Book, Save, BookOpen } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal'; 
import { UserAvatar } from '../components/UserAvatar';

import CustomLoader from '../components/CustomLoader';

type BookItem = { id?: string; name: string; desc: string; author?: string; year?: string; longDesc?: string; chapters?: string[]; isAiGenerated?: boolean; firestoreId?: string; category?: string; };

const CategoryBooksScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData } = useAuth();
  const isAdmin = userData?.role === 'admin' || user?.email === 'admin@santrimodern.com';
  const { id, label, books: initialBooks } = (location.state as { id: string, label: string, books?: BookItem[] }) || {};

  const [books, setBooks] = useState<BookItem[]>(initialBooks || []);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [query, setQuery] = useState('');
  
  // Modal State
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, book: BookItem | null}>({ isOpen: false, book: null });

  const fetchBooksAI = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
        let prompt = "";
        const existingNames = books.filter(b => b && b.name).map(b => b.name).join(', ');
        const categoryLower = (label || id || '').toLowerCase();
        let domainConstraint = "";
        
        if (categoryLower.includes('hadits') || categoryLower.includes('hadith')) {
          domainConstraint = "PENTING: Kategori ini adalah HADITS. Kitab yang disebutkan HARUS kitab pengumpulan, periwayatan, atau syarah hadits (seperti Shahih Bukhari, Muwatho, Sunan Tirmidzi, dll). JANGAN masukkan kitab Fiqh (seperti Al-Umm, Fathul Mu'in, Al-Hawi), Nahwu, atau Aqidah.";
        } else if (categoryLower.includes('fiqh') || categoryLower.includes('fikh')) {
          domainConstraint = "PENTING: Kategori ini adalah FIQH. Kitab yang disebutkan HARUS kitab hukum Islam (syariat).";
        } else if (categoryLower.includes('hikmah')) {
          domainConstraint = "PENTING: Kategori ini adalah ILMU HIKMAH (esoterik Islam/doa/wirid/wafaq). Kitab yang disebutkan HARUS kitab bertema doa, wifiq, rajah, rahasia huruf/asma, amalan batiniah, atau pengobatan spiritual (seperti Al-Aufaq, Syamsul Ma'arif Al-Kubro, Mamba' Ushulul Hikmah, Khazinatul Asrar, dll). Jangan masukkan kitab fiqih biasa atau tafsir.";
        } else if (categoryLower.includes('nadhom') || categoryLower.includes('arudh') || categoryLower.includes('syair')) {
          domainConstraint = "PENTING: Kategori ini adalah NADHOM, SYI'IR & ILMU ARUDH. Kitab yang disebutkan HARUS berbentuk bait-bait syi'ir/puisi bermetrum (bahr) atau panduan ilmu arudh (seperti Alfiyah Ibnu Malik, Nazhom Imrithi, Aqidatul Awam, Tuhfatul Athfal, Qasidah Burdah, Al-Arudh wa Al-Qawafi, Syarah Sullamun Munawraq, dll).";
        }
        
        if (id === 'syamilah') {
          prompt = `
            Sebutkan ${isLoadMore ? '50 tambahan' : '50'} Kitab Kuning paling populer dan penting yang ada dalam Maktabah Syamilah.
            Utamakan kitab-kitab induk (Kutubul Ushul) dalam bidang Tafsir, Hadits, Fiqih, dan Sejarah.
            ${isLoadMore ? `JANGAN sebutkan kitab yang sudah ada: ${existingNames}` : ''}
            
            Format JSON (Array of Objects):
            [
              {
                "name": "Nama Kitab",
                "author": "Nama Pengarang",
                "desc": "Deskripsi singkat tentang kitab ini (1 kalimat)."
              }
            ]
          `;
        } else if (id === 'kubro') {
          prompt = `
            Sebutkan ${isLoadMore ? '50 tambahan' : '50'} Kitab Kuning referensi utama yang ada dalam Maktabah Kubro.
            Fokus pada kitab-kitab Syarah dan Hasyiyah yang sering dipelajari di pesantren tingkat lanjut.
            ${isLoadMore ? `JANGAN sebutkan kitab yang sudah ada: ${existingNames}` : ''}
            
            Format JSON (Array of Objects):
            [
              {
                "name": "Nama Kitab",
                "author": "Nama Pengarang",
                "desc": "Deskripsi singkat tentang kitab ini (1 kalimat)."
              }
            ]
          `;
        } else {
          prompt = `
            Sebutkan ${isLoadMore ? '50 tambahan' : '50'} Kitab Kuning referensi utama dan paling populer untuk kategori: "${label || id}".
            ${domainConstraint}
            PENTING: Pastikan kitab yang disebutkan BENAR-BENAR sesuai dengan kategori tersebut. JANGAN mencampuradukkan dengan kategori lain.
            ${isLoadMore ? `JANGAN sebutkan kitab yang sudah ada: ${existingNames}` : ''}
            
            Format JSON (Array of Objects):
            [
              {
                "name": "Nama Kitab (Ar Transliterasi)",
                "author": "Nama Pengarang Lengkap",
                "desc": "Deskripsi singkat isi kitab (max 120 karakter)."
              }
            ]
          `; 
        }
        
        const aiResult = await generateJson(prompt, "Anda adalah pustakawan digital Maktabah Islamiyah yang ahli dalam literatur Arab klasik dan modern. Berikan output JSON valid."); 
        
        const cacheKey = `santriai_cat_${id}`; 
        
        setBooks(prev => {
          const combined = [...prev];
          if (Array.isArray(aiResult)) { 
              aiResult.forEach((b: any) => {
                  if (b && b.name && !combined.some(gb => gb?.name?.toLowerCase() === b.name.toLowerCase())) {
                      combined.push({
                          ...b,
                          id: `ai-list-${b.name.replace(/\s+/g, '-').toLowerCase()}`,
                          isAiGenerated: true,
                          category: id
                      });
                  }
              });
          }
          if (combined.length > 0) {
            sessionStorage.setItem(cacheKey, JSON.stringify(combined));
            
            // Persist newly discovered books to GitHub for community (Background)
            if (id !== 'saved' && Array.isArray(aiResult)) {
              aiResult.forEach((b: any) => {
                if (b && b.name) {
                  queueBackgroundTask(async () => {
                    const catFolder = getCategoryFolder(id || label || '');
                    const bookSlug = getSlug(b.name);
                    await saveToGitHub(`kitab/${catFolder}/${bookSlug}`, 'metadata', {
                      ...b,
                      category: id || label,
                      sourceType: 'AI_DISCOVERY',
                      _generated_at: new Date().toISOString()
                    });
                  });
                }
              });
            }
          }
          return combined;
        });
    } catch (e) {
        console.error("Failed to fetch books", e);
    } finally {
        setLoading(false);
        setLoadingMore(false);
    }
  };

  // 1. Fetch Books List
  useEffect(() => {
    const fetchBooks = async () => {
      if (id === 'saved') {
          if (user) { 
            setLoading(true); 
            const unsubscribe = subscribeUserBookmarks(user.uid, 'kitab', (data) => { 
                const validData = (data as BookItem[] || []).filter(b => b && b.name);
                setBooks(validData); 
                setLoading(false); 
            }); 
            return () => unsubscribe(); 
          } else { 
            const savedRaw = localStorage.getItem('santriai_saved_books'); 
            if (savedRaw) {
               const parsed = JSON.parse(savedRaw);
               setBooks(Array.isArray(parsed) ? parsed.filter(b => b && b.name) : []);
            }
            return; 
          }
      }
      
      const cacheKey = `santriai_cat_${id}`; 
      const cached = sessionStorage.getItem(cacheKey); 
      
      if (initialBooks && initialBooks.length > 0) return; 
      if (cached) { setBooks(JSON.parse(cached)); return; }
      
      setLoading(true);
      try { 
        // Try fetching from GitHub Categorized Storage first
        let githubBooks: BookItem[] = [];
        try {
            const catSlug = label || id;
            githubBooks = await fetchCategorizedKitab(catSlug);
            const validGithubBooks = (githubBooks || []).filter(b => b && b.name);
            if (validGithubBooks.length > 0) {
              setBooks(validGithubBooks);
              setLoading(false);
              return; 
            }
        } catch (err) {
            console.warn("GitHub fetch failed, falling back to AI list");
        }

        await fetchBooksAI(false);
      } catch (e) { 
        console.error("Failed to fetch category books", e); 
        setLoading(false);
      }
    };
    if (id) { fetchBooks(); }
  }, [id, label, initialBooks, user]);

  const handleBookClick = (book: BookItem) => { 
      const bookWithCategory = { 
        ...book, 
        category: book.category || (id !== 'saved' ? id : undefined),
        sourceType: (id === 'syamilah' || id === 'kubro') ? 'PUBLIC_LIBRARY' : 'AI'
      };
      navigate('/book-detail', { state: { book: bookWithCategory } }); 
  };

  const handleDeleteClick = (book: BookItem, e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    setDeleteModal({ isOpen: true, book });
  };

  const confirmDelete = async () => {
    const book = deleteModal.book;
    if (!book) return;
    if (user && book.firestoreId) {
        const targetId = book.firestoreId || book.id;
        if (targetId) await removeUserBookmark(user.uid, targetId);
    } else {
        const newBooks = books.filter(b => b.id !== book.id);
        setBooks(newBooks);
        localStorage.setItem('santriai_saved_books', JSON.stringify(newBooks));
    }
    setDeleteModal({ isOpen: false, book: null });
  };

  const filteredBooks = books.filter(b => {
    if (!b || !b.name) return false; // Skip invalid/empty books
    const name = b.name || '';
    const author = b.author || '';
    const sQuery = query || '';
    return name.toLowerCase().includes(sQuery.toLowerCase()) || 
           author.toLowerCase().includes(sQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans">
      <div className="sticky top-0 z-30 bg-[#005a2b] dark:bg-emerald-950 text-white shadow-md pt-5 pb-4 px-4 rounded-b-[1.5rem] flex items-center justify-between gap-3 transition-colors mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="font-bold text-white text-base md:text-lg leading-tight">{label || 'Daftar Kitab'}</h2>
            <p className="text-[10px] text-emerald-100">Koleksi Kitab</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/settings')} 
          className="relative active:scale-90 transition-all flex-shrink-0"
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
      <div className="px-4 pt-4">
        <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-2 mb-4 sticky top-[70px] z-20">
          <div className="flex-1 flex items-center px-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Search size={18} className="text-slate-400 mr-2" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter judul kitab..." className="flex-1 bg-transparent py-2.5 outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm" />
          </div>
        </div>
        {loading ? (
          <div className="py-12">
            <CustomLoader message="Menyusun Pustaka Digital" />
            <p className="text-slate-400 text-xs leading-relaxed max-w-[280px] mx-auto -mt-10 mb-10 text-center relative z-20">
              Santri AI sedang meriset dan mengumpulkan daftar kitab autentik untuk kategori ini...
            </p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-400 text-sm italic mb-4">Tidak ada kitab ditemukan.</p>
            {id !== 'saved' && (
              <button onClick={() => { sessionStorage.removeItem(`santriai_cat_${id}`); window.location.reload(); }} className="text-santri-green font-bold text-sm flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
                <RefreshCw size={14} /> Coba Muat Ulang
              </button>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-3">
              {filteredBooks.map((book, idx) => (
                <div key={idx} className="relative group">
                  <button 
                    onClick={() => handleBookClick(book)} 
                    className="w-full flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-santri-green/50 dark:hover:border-santri-gold/50 transition-all text-left"
                  >
                    <div className="w-12 h-14 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-900/30">
                      <Book size={24} />
                    </div>
                    <div className="flex-1 pr-6">
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1 leading-snug">{book.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{book.desc}</p>
                      {book.author && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-santri-green bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded">
                          {book.author}
                        </span>
                      )}
                    </div>
                  </button>
                  {id === 'saved' && (
                    <button 
                      onClick={(e) => handleDeleteClick(book, e)} 
                      className="absolute right-2 top-2 p-2.5 z-10 text-red-500 bg-red-50/80 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors border border-red-100 dark:border-red-900/50" 
                      aria-label="Hapus kitab"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {id !== 'saved' && (
              <div className="mt-8 mb-12 flex flex-col items-center gap-4">
                <button
                  disabled={loadingMore || loading}
                  onClick={() => fetchBooksAI(true)}
                  className="w-full max-w-xs flex items-center justify-center gap-2 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-santri-green" />
                      <span>Mengekspansi Pustaka...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      <span>Muat Lebih Banyak Kitab</span>
                    </>
                  )}
                </button>

                {isAdmin && (
                  <button
                    onClick={() => { 
                      sessionStorage.removeItem(`santriai_cat_${id}`); 
                      setBooks([]);
                      fetchBooksAI(false);
                    }}
                    className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center gap-1 uppercase tracking-wider"
                  >
                    <RefreshCw size={12} className={loading ? "animate-spin" : "text-red-600 dark:text-red-400"} />
                    <span>Reset & Segarkan Daftar</span>
                  </button>
                )}

                <p className="text-[10px] text-slate-400 text-center px-6">
                  Ketuk untuk mencari judul kitab tambahan secara otomatis menggunakan Santri AI Engine.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmationModal 
        isOpen={deleteModal.isOpen}
        title="Hapus Kitab?"
        message="Kitab ini akan dihapus dari koleksi tersimpan."
        isDestructive={true}
        confirmLabel="Hapus"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, book: null })}
      />
    </div>
  );
};

export default CategoryBooksScreen;
