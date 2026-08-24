
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHistory } from '../contexts/HistoryContext';
import { getAllSurahs } from '../services/quranApiService';
import { getHadithBooks } from '../services/hadithApiService';
import { fetchListFromGitHub } from '../services/githubDataService';
import { 
  ArrowLeft, 
  Search, 
  BookOpen, 
  Book,
  Heart, 
  Scale, 
  Shield, 
  Users, 
  Sparkles, 
  TrendingUp,
  ArrowRight,
  Lightbulb,
  X,
  History as HistoryIcon,
  Library,
  Mic,
  HeartHandshake,
  LayoutGrid,
  Radio,
  GraduationCap,
  Activity,
  Trophy,
  Compass,
  Calendar,
  Coins,
  Calculator,
  Tv,
  Brain,
  Scroll,
  Clock,
  User,
  Settings,
  BookHeart,
  MessageSquare
} from 'lucide-react';

const SEARCHABLE_FEATURES = [ 
  { icon: Library, label: "Studi Mawdhui", color: "bg-indigo-100 text-indigo-600 border-indigo-200", path: "/mawdhui-study" }, 
  { icon: Mic, label: "Tahfidz", color: "bg-emerald-100 text-emerald-600 border-emerald-200", path: "/tahfidz" }, 
  { icon: HeartHandshake, label: "Doa-doa", color: "bg-cyan-100 text-cyan-600 border-cyan-200", path: "/doa" }, 
  { icon: Radio, label: "Radio Islami", color: "bg-teal-100 text-teal-600 border-teal-200", path: "/radio" },
  { icon: Brain, label: "Cerdas Cermat", color: "bg-purple-100 text-purple-600 border-purple-200", path: "/quiz" }, 
  { icon: Book, label: "Kitab Kuning", color: "bg-amber-100 text-amber-600 border-amber-200", path: "/hadis" }, 
  { icon: BookOpen, label: "Al-Quran", color: "bg-emerald-100 text-emerald-600 border-emerald-200", path: "/quran" }, 
  { icon: Scroll, label: "Hadis", color: "bg-blue-100 text-blue-600 border-blue-200", path: "/hadis" }, 
  { icon: Clock, label: "Jadwal Sholat", color: "bg-green-100 text-green-600 border-green-200", path: "/sholat" }, 
  { icon: User, label: "Biografi Ulama", color: "bg-slate-100 text-slate-600 border-slate-200", path: "/biography" }, 
];

// 5 Fitur Paling Populer (Berdasarkan Data Penggunaan Umum)
const POPULAR_FEATURES = [
  { label: "Al-Quran Digital", path: "/quran" },
  { label: "Analisis Kitab", path: "/kitab" },
  { label: "Kumpulan Hadis", path: "/hadis" },
  { label: "Tasbih Digital", path: "/tasbih" },
  { label: "Cerdas Cermat", path: "/quiz" }
];

const CATEGORIES = [
  { id: 'aqidah', label: 'Aqidah & Tauhid', desc: 'Fondasi keimanan', icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-100 dark:border-indigo-900/50', topics: ['Rukun Iman', 'Sifat 20', 'Takdir', 'Alam Barzakh'] },
  { id: 'fiqih', label: 'Fiqih & Ibadah', desc: 'Panduan hukum syariat', icon: Scale, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-900/50', topics: ['Shalat', 'Puasa', 'Zakat', 'Haji', 'Thaharah'] },
  { id: 'akhlak', label: 'Akhlak & Tasawuf', desc: 'Penyucian hati', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-100 dark:border-rose-900/50', topics: ['Sabar', 'Ikhlas', 'Tawadhu', 'Birrul Walidain'] },
  { id: 'muamalah', label: 'Muamalah & Sosial', desc: 'Interaksi manusia', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-100 dark:border-amber-900/50', topics: ['Pernikahan', 'Waris', 'Hutang', 'Riba'] }
];

const DEFAULT_TOPICS = ["Hukum Paylater", "Adab di Masjid", "Sedekah Subuh", "Tanda Kiamat", "Khusyu Shalat"];

const MawdhuiStudyScreen: React.FC = () => {
  const navigate = useNavigate();
  const { history } = useHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Data State for search
  const [surahs, setSurahs] = useState<any[]>([]);
  const [hadiths, setHadiths] = useState<any[]>([]);
  const [doas, setDoas] = useState<any[]>([]);
  const [trendingAiTopics, setTrendingAiTopics] = useState<string[]>(DEFAULT_TOPICS);

  const [searchResults, setSearchResults] = useState<{
    features: any[],
    surahs: any[],
    hadiths: any[],
    doas: any[],
    history: any[]
  }>({ features: [], surahs: [], hadiths: [], doas: [], history: [] });

  // Initial Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surahData, hadithData, trendingData] = await Promise.all([
          getAllSurahs(), 
          getHadithBooks(),
          fetchListFromGitHub('trending-topics')
        ]);
        
        setSurahs(surahData);
        setHadiths(hadithData);
        
        if (trendingData && trendingData.length > 0) {
          setTrendingAiTopics(trendingData);
        }
        
        const doaRes = await fetch('https://raw.githubusercontent.com/Kopeahku/hadisku/main/assets/file/doa-harian.json');
        if (doaRes.ok) {
            const doaData = await doaRes.json();
            setDoas(doaData);
        }
      } catch (e) { console.error("Initial data fetch failed", e); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const q = searchQuery.toLowerCase();
    
    const matchedFeatures = SEARCHABLE_FEATURES.filter(f => f.label.toLowerCase().includes(q)).slice(0, 3);
    const matchedSurahs = surahs.filter(s => s.name_latin.toLowerCase().includes(q)).slice(0, 3);
    const matchedHadiths = hadiths.filter(h => h.name.toLowerCase().includes(q)).slice(0, 2);
    const matchedDoas = doas.filter(d => d.nama.toLowerCase().includes(q)).slice(0, 3);
    const matchedHist = history.filter(h => h.title.toLowerCase().includes(q) || (h.subtitle && h.subtitle.toLowerCase().includes(q))).slice(0, 3);

    setSearchResults({ 
      features: matchedFeatures, 
      surahs: matchedSurahs, 
      hadiths: matchedHadiths, 
      doas: matchedDoas, 
      history: matchedHist 
    });
  }, [searchQuery, history, surahs, hadiths, doas]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    navigate('/explanation', { state: { query: searchQuery } });
    setIsSearching(false);
  };

  const handleTopicClick = (topic: string) => {
    navigate('/explanation', { state: { query: topic } });
  };

  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 flex flex-col font-sans pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FDFBF7]/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><ArrowLeft size={24} /></button>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2"><BookOpen size={20} className="text-santri-green" /> Studi Tematik</h2>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-visible rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-teal-800 p-8 text-white shadow-xl shadow-emerald-200 dark:shadow-none">
           <div className="absolute top-0 right-0 p-4 opacity-10"><BookOpen size={180} /></div>
           <div className="relative z-10">
             <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mb-4 border border-white/20"><Sparkles size={12} className="text-yellow-300" /> Jelajahi Islam Lebih Dalam</div>
             <h1 className="text-3xl font-bold mb-2 leading-tight">Mau belajar apa <br/> hari ini?</h1>
             <p className="text-emerald-100 text-sm mb-6 max-w-xs opacity-90">Temukan jawaban dari Al-Quran, Hadits, dan Kitab Kuning dengan bantuan AI.</p>

             <div className="relative">
                <div className="bg-white p-2 rounded-2xl flex items-center shadow-lg border-2 border-transparent focus-within:border-emerald-300 transition-all">
                    <Search size={20} className="text-slate-400 ml-3" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearching(!!searchQuery)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Cari surat, doa, atau topik..."
                      className="flex-1 bg-transparent px-3 py-2 outline-none text-slate-800 placeholder:text-slate-400 text-sm font-medium"
                    />
                    {searchQuery && (<button onClick={() => { setSearchQuery(''); setIsSearching(false); }} className="p-1 mr-2 text-slate-300 hover:text-slate-500"><X size={16}/></button>)}
                    <button onClick={handleSearch} disabled={!searchQuery.trim()} className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50"><ArrowRight size={18} /></button>
                </div>

                {isSearching && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden max-h-[60vh] overflow-y-auto animate-in fade-in zoom-in-95 z-[100] no-scrollbar">
                    {searchResults.features.length > 0 && (
                      <div className="p-2 border-b border-slate-50 dark:border-slate-800">
                        <h4 className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-widest">Menu</h4>
                        {searchResults.features.map((f, i) => { const Icon = f.icon; return (
                            <button key={i} onClick={() => { navigate(f.path); setSearchQuery(''); setIsSearching(false); }} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${f.color?.split(' ')[0] || ''} bg-opacity-20`}><Icon size={18} className={f.color?.split(' ')[1] || ''} /></div>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{f.label}</span>
                            </button>
                        );})}
                      </div>
                    )}
                    {searchResults.surahs.length > 0 && (
                      <div className="p-2 border-b border-slate-50 dark:border-slate-800">
                        <h4 className="text-[10px] font-bold text-emerald-500 px-2 py-1 uppercase tracking-widest">Al-Quran</h4>
                        {searchResults.surahs.map((s) => (
                            <button key={s.number} onClick={() => { navigate('/quran', { state: { surahNumber: s.number } }); setSearchQuery(''); setIsSearching(false); }} className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left">
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600"><BookOpen size={18} /></div>
                              <div><p className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.name_latin}</p><p className="text-[10px] text-slate-400">Surah ke-{s.number}</p></div>
                            </button>
                        ))}
                      </div>
                    )}
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/50">
                      <button onClick={handleSearch} className="w-full flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all border border-transparent hover:border-emerald-300 shadow-sm group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-sm"><Sparkles size={18} /></div>
                        <div className="flex-1"><span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">Tanya AI (Bedah Tematik)</span><span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">"{searchQuery}"</span></div>
                        <ArrowRight size={18} className="text-slate-400 group-hover:text-emerald-600" />
                      </button>
                    </div>
                  </div>
                )}
             </div>
           </div>
        </div>

        {/* Sedang Hangat - GRID LAYOUT 2 COLUMN */}
        <div>
           <div className="flex items-center gap-2 mb-5 px-1">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600"><TrendingUp size={18} /></div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Sedang Hangat</h3>
              <div className="ml-auto flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Updates</span>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-3">
              {/* 5 ITEM DARI SUPABASE (AI SEARCH) */}
              {trendingAiTopics.map((topic, idx) => (
                <button 
                  key={`ai-${idx}`} 
                  onClick={() => handleTopicClick(topic)} 
                  className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 text-left hover:border-emerald-500 transition-all shadow-sm group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-2">
                     <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                        <MessageSquare size={14} />
                     </div>
                     <span className="text-[10px] font-bold text-emerald-500/50">Diskusi</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-2 leading-relaxed">
                    {topic}
                  </h4>
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-emerald-500 group-hover:w-full transition-all duration-300"></div>
                </button>
              ))}

              {/* 5 ITEM DARI FITUR TERPOPULER */}
              {POPULAR_FEATURES.map((feature, idx) => (
                <button 
                  key={`feat-${idx}`} 
                  onClick={() => handleFeatureClick(feature.path)} 
                  className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 text-left hover:border-indigo-400 transition-all shadow-sm group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-2">
                     <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
                        <Sparkles size={14} />
                     </div>
                     <span className="text-[10px] font-bold text-indigo-500/50">Fitur</span>
                  </div>
                  <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 line-clamp-2 leading-relaxed">
                    {feature.label}
                  </h4>
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-indigo-500 group-hover:w-full transition-all duration-300"></div>
                </button>
              ))}
           </div>
        </div>

        <div>
           <div className="flex items-center gap-2 mb-5 px-1"><div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600"><Lightbulb size={18} /></div><h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Kategori Pilihan</h3></div>
           <div className="grid gap-5">
              {CATEGORIES.map((cat) => { const Icon = cat.icon; return (
                  <div key={cat.id} className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                     <div className={`px-6 py-5 flex items-start gap-4 border-b ${cat.border} ${cat.bg}`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-white dark:bg-slate-800 shadow-sm ${cat.color}`}><Icon size={28} /></div>
                        <div className="flex-1 pt-1"><h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-1 group-hover:text-emerald-600 transition-colors">{cat.label}</h4><p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{cat.desc}</p></div>
                     </div>
                     <div className="p-5 bg-white dark:bg-slate-900"><div className="flex flex-wrap gap-2">{cat.topics.map((topic, i) => (<button key={i} onClick={() => handleTopicClick(topic)} className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all">{topic}</button>))}<button onClick={() => handleTopicClick(cat.label)} className="text-xs font-bold text-slate-400 px-3 py-2 hover:text-emerald-600 transition-colors flex items-center gap-1">Lainnya <ArrowRight size={12} /></button></div></div>
                  </div>
              );})}
           </div>
        </div>
      </div>
    </div>
  );
};

export default MawdhuiStudyScreen;
