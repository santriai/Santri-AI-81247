import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Newspaper, Loader2, ArrowRight, ImageIcon, RefreshCw, Search, Star, Flag, PenSquare
} from 'lucide-react';
import { fetchListFromGitHub, fetchFromGitHub } from '../services/githubDataService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { subscribeToNewsCategories } from '../services/firebase';
import { ContentReportModal } from '../components/ContentReportModal';
import { openExternalLink } from '../utils/linkUtils';
import { PLAYSTORE_LINK } from '../constants';
import { HighlightText } from '../components/HighlightText';

const DEFAULT_NEWS_IMAGE = 'https://i.imgur.com/jSPFx4A.png';

export const INITIAL_NEWS_ITEMS = [
  {
    id: 'news-fitur-hitung-haid',
    title: 'Fitur Hitung Haid Santri AI: Solusi Digital Fiqih Wanita Membedakan Darah Haid, Nifas, dan Istihadhah',
    excerpt: 'Santri AI menghadirkan kalkulator pintar fiqih kewanitaan berbasis rujukan kitab klasik mazhab Syafi\'i untuk membantu muslimah mencatat dan menghitung masa suci serta ibadah dengan tepat.',
    content: `Memahami persoalan darah kewanitaan (dima'ul mar'ah) seperti haid, nifas, dan istihadhah merupakan salah satu kewajiban penting (fardhu 'ain) bagi setiap muslimah. Berangkat dari kebutuhan ini, Aplikasi Santri AI meluncurkan Fitur Hitung Haid yang dirancang khusus untuk mempermudah perhitungan siklus biologis wanita sesuai kaidah fiqih mazhab Syafi'i.

Fitur ini dilengkapi dengan kalkulator otomatis yang menghitung masa minimal haid (24 jam), masa maksimal haid (15 hari 15 malam), hingga batas masa suci antar dua haid (minimal 15 hari). Muslimah dan santriwati cukup mencatat tanggal mulai dan selesainya keluarnya darah, dan sistem kecerdasan buatan akan mengkategorikan secara tepat apakah darah tersebut termasuk haid atau istihadhah.

Selain perhitungan akurat, fitur ini juga memberikan panduan hukum ibadah secara otomatis: kapan waktu wajib mengqadha shalat atau puasa, tata cara bersuci/mandi wajib (ghusl), serta dalil-dalil fiqih pendukung dari kitab Fathul Qorib dan Safinatun Naja. Inovasi ini menjadi bukti nyata bagaimana teknologi digital dapat bersinergi dengan khazanah keilmuan pesantren untuk mempermudah ibadah umat sehari-hari.`,
    category: 'Tekno-Islam',
    image_url: 'https://image.pollinations.ai/prompt/photorealistic%20editorial%20photo%20of%20indonesian%20muslim%20santriwati%20wearing%20modest%20hijab%20studying%20islamic%20books%20with%20tablet%20in%20pesantren%20library%2C%20fully%20covered%20aurat%2C%20natural%20lighting%2C%208k?width=1200&height=675&nologo=true&seed=101',
    author: 'Redaksi Santri AI',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    source: 'Warta Santri'
  },
  {
    id: 'news-fitur-jadwal-sholat',
    title: 'Akurat & Tepat Waktu: Fitur Jadwal Sholat dan Kompas Arah Kiblat Santri AI Berbasis Geolocation',
    excerpt: 'Memadukan algoritma hisab falak kontemporer dan GPS presisi tinggi, Santri AI memastikan pengingat adzan lima waktu dan kompas kiblat hadir akurat di manapun santri berada.',
    content: `Kedisiplinan waktu sholat fardhu adalah cerminan utama integritas dan ketakwaan seorang santri. Aplikasi Santri AI menghadirkan Fitur Jadwal Sholat dan Penunjuk Arah Kiblat yang terintegrasi dengan sensor geolocation presisi tinggi untuk memudahkan pelaksanaan ibadah di seluruh penjuru Nusantara.

Sistem hisab waktu sholat di Santri AI dihitung berdasarkan metode hisab standar Kementerian Agama RI dan kaidah ilmu falak terpercaya. Fitur ini secara dinamis menghitung waktu Imsak, Subuh, Terbit, Dhuha, Dzuhur, Ashar, Maghrib, hingga Isya sesuai koordinat lintang dan bujur pengguna secara otomatis tanpa memerlukan pengaturan manual yang rumit.

Tidak hanya pengingat waktu sholat, fitur ini juga dilengkapi dengan Kompas Arah Kiblat interaktif bersensor giroskop yang langsung memandu pengguna menghadap ke Ka'bah di Masjidil Haram dengan akurasi tinggi. Tampilan yang bersih, bebas gangguan iklan, dan hemat daya membuat fitur ini menjadi sahabat setia ibadah harian para santri, ustadz, dan masyarakat luas di mana pun berada.`,
    category: 'Warta',
    image_url: 'https://image.pollinations.ai/prompt/photorealistic%20editorial%20photo%20of%20indonesian%20santri%20wearing%20black%20peci%20songkok%20and%20koko%20shirt%20praying%20in%20majestic%20mosque%2C%20peaceful%20islamic%20atmosphere%2C%20natural%20lighting%2C%208k?width=1200&height=675&nologo=true&seed=202',
    author: 'Redaksi Santri AI',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    source: 'Warta Santri'
  },
  {
    id: 'news-fitur-warta-santri',
    title: 'Warta Santri AI: Wadah Jurnalisme Positif & Kolaborasi Literasi Digital Pesantren Nusantara',
    excerpt: 'Portal Warta Santri membuka ruang bagi santri untuk menulis kabar, hikmah, dan kajian pesantren dengan bantuan asisten redaksi AI serta ilustrasi foto jurnalistik yang syar\'i.',
    content: `Dunia pesantren kaya akan gagasan luhur, khazanah keilmuan, dan aktivitas sosial keagamaan yang patut disebarluaskan kepada masyarakat luas. Fitur Warta Santri di Aplikasi Santri AI lahir sebagai wadah jurnalisme positif santri untuk menyuarakan kabar pesantren ke panggung peradaban digital.

Fitur Warta Santri dibekali teknologi AI Redaktur yang mampu membantu santri menyusun artikel berita dari topik singkat, tautan website (seperti nu.or.id atau kemenag.go.id), maupun ringkasan video kajian YouTube secara cerdas. Setiap warta yang dibuat langsung diformat secara terstruktur mengikuti kaidah jurnalistik 5W+1H dengan gaya bahasa santun khas pesantren.

Selain itu, sistem ilustrasi visual otomatis menjamin foto yang dihasilkan senantiasa mematuhi syariat Islam (menutup aurat dengan peci untuk santri putra dan jilbab syar'i untuk santri putri) serta dibubuhi watermark resmi "Aplikasi Santri AI". Melalui fitur ini, para santri tidak hanya menjadi konsumen teknologi, tetapi juga motor penggerak literasi dan dakwah digital yang mencerahkan bangsa.`,
    category: 'Pesantren',
    image_url: 'https://image.pollinations.ai/prompt/photorealistic%20editorial%20photo%20of%20indonesian%20santri%20students%20collaborating%20writing%20articles%20in%20pesantren%2C%20wearing%20black%20peci%20songkok%20and%20modest%20hijab%2C%208k?width=1200&height=675&nologo=true&seed=303',
    author: 'Redaksi Santri AI',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    source: 'Warta Santri'
  }
];

const DEFAULT_CATEGORY_IMAGES: Record<string, string[]> = {
  'Warta': [DEFAULT_NEWS_IMAGE],
  'Pesantren': [DEFAULT_NEWS_IMAGE],
  'Hikmah': [DEFAULT_NEWS_IMAGE],
  'Tekno-Islam': [DEFAULT_NEWS_IMAGE],
  'Internasional': [DEFAULT_NEWS_IMAGE]
};

const getDefaultCategoryCover = (category?: string) => {
  return DEFAULT_NEWS_IMAGE;
};

export const NewsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, userData } = useAuth();
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>(['Warta', 'Pesantren', 'Hikmah', 'Tekno-Islam', 'Internasional']);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isReportOpen, setIsReportOpen] = useState(false);

  const loadNews = async () => {
    setLoading(true);
    try {
      // 1. Ambil dari local cache untuk kecepatan instan
      let localItems: any[] = [];
      const local = localStorage.getItem('santri_news_list');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            localItems = parsed.flat(Infinity).filter((item: any) => item && typeof item === 'object' && item.title);
            if (localItems.length > 0) {
              setNewsList(localItems);
            }
          }
        } catch (e) {}
      }

      // 2. Ambil dari GitHub (baik dari file news_list.json maupun direktori news/)
      const singleList = await fetchFromGitHub('news', 'news_list');
      const dirList = await fetchListFromGitHub('news');
      
      const rawCombined = [
        ...(Array.isArray(singleList) ? singleList : [singleList]),
        ...(Array.isArray(dirList) ? dirList : [dirList]),
        ...localItems,
        ...INITIAL_NEWS_ITEMS
      ];

      // Flatten dan hilangkan duplikasi berdasarkan ID
      const flatList = rawCombined.flat(Infinity).filter((item: any) => item && typeof item === 'object' && (item.title || item.id));
      const mapById = new Map();
      for (const item of flatList) {
        if (!item || !item.id) continue;
        if (!mapById.has(item.id)) {
          mapById.set(item.id, item);
        }
      }

      const mergedList = Array.from(mapById.values());
      if (mergedList.length > 0) {
        mergedList.sort((a: any, b: any) => {
          const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return timeB - timeA;
        });
        setNewsList(mergedList);
        localStorage.setItem('santri_news_list', JSON.stringify(mergedList));
      }
    } catch (e) {
      console.error("Gagal memuat berita:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();

    const unsubscribe = subscribeToNewsCategories((config) => {
      if (config && config.categories && config.categories.length > 0) {
        setCategories(config.categories);
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredNews = newsList.filter(item => {
    if (!item || typeof item !== 'object' || !item.title) return false;
    const title = String(item.title || '').toLowerCase();
    const excerpt = String(item.excerpt || '').toLowerCase();
    const cat = String(item.category || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = title.includes(query) || excerpt.includes(query) || cat.includes(query);
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/90 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
            <ArrowLeft size={22} />
          </button>
          <h2 className="font-bold text-white text-base flex items-center gap-2">
            <Newspaper size={20} className="text-emerald-200" /> Warta Santri
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/settings')} 
            className="relative active:scale-90 transition-all shrink-0 cursor-pointer"
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

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center px-4 transition-colors">
          <Search size={18} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari warta atau berita..." 
            className="bg-transparent border-none outline-none text-sm w-full py-2 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        {/* News Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
          <button 
            onClick={() => setSelectedCategory('Semua')}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
              selectedCategory === 'Semua' 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10' 
              : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10' 
                : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List News */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 size={32} className="text-emerald-500 animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Memuat warta santri...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Newspaper size={48} className="mx-auto mb-4 opacity-20 text-slate-400" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Tidak ada warta ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredNews.map((item) => {
              const currentUserName = userData?.displayName || user?.displayName || '';
              const isAuthor = item.author && currentUserName && item.author.trim().toLowerCase() === currentUserName.trim().toLowerCase();
              const cardAuthorPhoto = item.author_photo || (isAuthor ? (userData?.avatarUrl || userData?.photoURL || user?.photoURL) : null);

              return (
                <button 
                  key={item.id} 
                  onClick={() => navigate('/news-detail', { state: { news: item } })}
                  className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xs flex group text-left transition-all active:scale-[0.98] hover:border-emerald-300 dark:hover:border-emerald-800 cursor-pointer"
                >
                  <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 relative shrink-0">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        onError={(e) => {
                          e.currentTarget.src = getDefaultCategoryCover(item.category || 'Warta');
                        }}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon size={24}/>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                          <HighlightText text={item.category} query={searchQuery} highlightClassName="bg-amber-200 text-amber-950 dark:bg-amber-400/35 dark:text-amber-200 px-1 py-0.5 rounded font-black shadow-xs" />
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
                        <HighlightText text={item.title} query={searchQuery} highlightClassName="bg-amber-200 text-amber-950 dark:bg-amber-400/35 dark:text-amber-200 px-1 py-0.5 rounded font-bold shadow-xs" />
                      </h4>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        <UserAvatar 
                          photoURL={cardAuthorPhoto} 
                          displayName={item.author || 'Admin'}
                          size="xs"
                        />
                        <p className="text-[10px] text-slate-500 font-bold truncate uppercase tracking-tighter">Oleh {item.author || 'Admin'}</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content Report Modal */}
      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName="Warta Santri"
        contentSnippet="Berita & Artikel Warta Santri"
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      {/* Floating Newspaper Icon / Button for Writing News */}
      <button
        onClick={() => navigate('/write-news')}
        className="fixed bottom-6 right-5 z-40 px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full shadow-2xl hover:shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center border-2 border-white/20 group cursor-pointer gap-2"
        title="Tulis Warta Santri"
      >
        <PenSquare size={18} />
        <span className="text-xs font-bold">Tulis Warta</span>
      </button>
    </div>
  );
};

export default NewsScreen;
