import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Copy, 
  Share2, 
  Check, 
  BookOpen, 
  GraduationCap, 
  Star, 
  Clock, 
  MapPin, 
  Users, 
  Scroll,
  Calendar,
  Download,
  ChevronRight,
  Volume2,
  StopCircle,
  Loader2,
  Flag
} from 'lucide-react';
import { generateScholarBiography } from '../services/geminiService'; 
import { useToast } from '../contexts/ToastContext';
import { useHistory } from '../contexts/HistoryContext'; 
import { useAudio } from '../contexts/AudioContext'; 
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { v4 as uuidv4 } from 'uuid'; 
import CustomLoader from '../components/CustomLoader';
import { BioData, TimelineEvent, NarrativeSection } from '../types';
import { PLAYSTORE_LINK } from '../constants';
import { openExternalLink } from '../utils/linkUtils';
import { ContentReportModal } from '../components/ContentReportModal';

const BiographyScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { addToHistory } = useHistory(); 
  const { isPlaying, currentTtsInfo, speakTts, isLoading: isAudioLoading } = useAudio();
  const { user, userData } = useAuth();
  
  const state = location.state as { author?: string, book?: string } | undefined;
  const author = state?.author || '';
  const book = state?.book || '';

  const [bioData, setBioData] = useState<BioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  const isSharing = useRef(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    hasFetched.current = false;
    setBioData(null);
  }, [author, book]);

  useEffect(() => {
    if (!author && !book) {
      navigate('/kitab');
      return;
    }

    const fetchBiography = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      setLoading(true);
      try {
        const targetSubject = author || `Pengarang kitab "${book}"`;
        const parsed = await generateScholarBiography(targetSubject, book);
        setBioData(parsed);

        addToHistory({
            id: uuidv4(),
            type: 'kitab', 
            title: `Biografi ${parsed.fullName || author || 'Ulama'}`,
            subtitle: parsed.intro || `Sejarah hidup ${author || 'pengarang'}`,
            timestamp: new Date().toISOString(),
            path: '/biography',
            data: { author: parsed.fullName || author, book }
        });

      } catch (error) {
        console.error("Failed to load biography", error);
        setBioData({
            fullName: author || "Informasi Tidak Tersedia",
            titles: "ULAMA",
            birthDeath: "Data tidak tersedia",
            intro: "Maaf, sistem gagal memuat data biografi. Silakan coba lagi nanti.",
            teachers: [],
            students: [],
            works: [],
            narrativeSections: [{ title: "Error", content: "Gagal memuat data." }]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBiography();
  }, [author, book, navigate, addToHistory]);

  const handleSpeak = async (text: string | undefined, id: string) => {
    if (!text) return;
    speakTts(text, false, bioData?.fullName || "Biografi Ulama", id);
  };

  const handleCopy = () => {
    if (!bioData) return;
    const textToCopy = `*${bioData.fullName}*\n${bioData.titles}\n\n${bioData.intro}\n\nKarya: ${bioData.works?.join(', ') || '-'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast("Teks disalin ke clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!bioData) return;
    if (isSharing.current) return;
    isSharing.current = true;

    const textToShare = `*${bioData.fullName}*\n${bioData.titles}\n\n${bioData.intro}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
    const title = `Biografi ${bioData.fullName}`;

    if (window.AndroidNativeInterface?.shareText) {
      try {
        window.AndroidNativeInterface.shareText(title, textToShare);
      } catch (e) {
        handleCopy();
      } finally {
        isSharing.current = false;
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: textToShare,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
           handleCopy();
        }
      } finally {
        isSharing.current = false;
      }
    } else {
      handleCopy();
      isSharing.current = false;
    }
  };

  const handleSaveToFile = () => {
    if (!bioData) return;
    const narrativeText = bioData.narrativeSections
      .map(s => `[${s.title}]\n${s.content}`)
      .join('\n\n');

    const fileContent = `BIOGRAFI ULAMA
(Santri AI App)
---------------------------
Nama: ${bioData.fullName}
Gelar: ${bioData.titles}
Masa Hidup: ${bioData.birthDeath}

[RINGKASAN]
${bioData.intro}

[SANAD KEILMUAN]
Guru: ${bioData.teachers.join(', ') || '-'}
Murid: ${bioData.students.join(', ') || '-'}

[KARYA MONUMENTAL]
${bioData.works.join('\n') || '-'}

---------------------------
${narrativeText}
`;

    const filename = `Biografi_${bioData.fullName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;

    if (window.AndroidNativeInterface?.saveTextToFile) {
        try {
            window.AndroidNativeInterface.saveTextToFile(filename, fileContent);
            showToast("Menyimpan ke file...", "info");
        } catch (e) {
            console.error("Save file error", e);
            showToast("Gagal menyimpan ke perangkat.", "error");
        }
    } else {
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        showToast("File diunduh (Browser Mode)", "success");
    }
  };

  const handlePersonClick = (name: string) => {
    const cleanName = name.replace(/\s*\(.*?\)\s*/g, '').trim();
    if (cleanName) {
        navigate('/biography', { state: { author: cleanName } });
    }
  };

  const handleWorkClick = (workTitle: string) => {
    navigate('/book-detail', { state: { query: workTitle } });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans">
      <div className="sticky top-0 z-30 bg-[#005a2b] dark:bg-emerald-950 text-white pt-5 pb-4 px-4 rounded-b-[1.5rem] shadow-md flex items-center justify-between transition-all mb-4">
        <div className="flex items-center gap-3">
            <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-all flex-shrink-0"
            >
            <ArrowLeft size={24} />
            </button>
            <h2 className="font-bold text-white text-base md:text-lg flex items-center gap-2">
            <User size={20} className="text-emerald-300 dark:text-santri-gold" />
            Biografi Ulama
            </h2>
        </div>
        <div className="flex items-center gap-2">
          {!loading && bioData && (
              <div className="flex gap-1 items-center">
                  <button onClick={handleSaveToFile} className="p-2 text-white/80 hover:bg-white/10 hover:text-white rounded-full transition-colors" title="Download">
                      <Download size={20} />
                  </button>
                  <button onClick={handleCopy} className="p-2 text-white/80 hover:bg-white/10 hover:text-white rounded-full transition-colors" title="Copy">
                      {copied ? <Check size={20} className="text-emerald-300" /> : <Copy size={20} />}
                  </button>
                  <button onClick={handleShare} className="p-2 text-white/80 hover:bg-white/10 hover:text-white rounded-full transition-colors" title="Share">
                      <Share2 size={20} />
                  </button>
                  <button onClick={() => openExternalLink(PLAYSTORE_LINK)} className="p-2 text-amber-300 hover:bg-amber-500/20 rounded-full transition-colors" title="Beri Rating di Play Store">
                      <Star size={20} className="fill-amber-300" />
                  </button>
                  <button onClick={() => setIsReportOpen(true)} className="p-2 text-rose-300 hover:bg-rose-500/20 rounded-full transition-colors" title="Laporkan Masalah ke Admin">
                      <Flag size={20} />
                  </button>
              </div>
          )}
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
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {loading ? (
             <CustomLoader message={`Mencari Biografi ${author || 'Pengarang'}...`} />
        ) : bioData ? (
             <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-green-50 dark:border-green-900/20 shadow-xl overflow-hidden relative">
                    <div className="h-2 w-full bg-gradient-to-r from-santri-green to-santri-gold"></div>
                    <div className="p-8 flex flex-col items-center text-center relative z-10">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 font-serif leading-tight pt-2">
                            {bioData.fullName}
                        </h1>
                        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider mb-6 border border-amber-200 dark:border-amber-800/50 shadow-sm">
                            {bioData.titles}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
                            <Calendar size={14} />
                            {bioData.birthDeath}
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                <MapPin size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Ringkasan</h3>
                        </div>
                        <button
                            onClick={() => handleSpeak(bioData.intro, 'intro')} 
                            className={`p-2 rounded-full transition-colors shrink-0 ${
                                currentTtsInfo?.id === 'intro' 
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                                    : 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                            }`}
                        >
                            {isAudioLoading && currentTtsInfo?.id === 'intro' ? <Loader2 size={18} className="animate-spin" /> : currentTtsInfo?.id === 'intro' && isPlaying ? <StopCircle size={18} /> : <Volume2 size={18} />}
                        </button>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-justify text-sm mb-4">
                        {bioData.intro}
                    </p>

                    {bioData.manhaj && (
                        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                            <h4 className="text-[10px] font-black text-santri-green uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Star size={12} /> Manhaj & Akidah
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                {bioData.manhaj}
                            </p>
                        </div>
                    )}
                    
                    {bioData.sanad && (
                        <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                            <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Users size={12} /> Sanad Keilmuan
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                {bioData.sanad}
                            </p>
                        </div>
                    )}
                </div>

                {bioData.timeline && bioData.timeline.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                                <Clock size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Garis Waktu (Timeline)</h3>
                        </div>
                        <div className="relative pl-8 space-y-8">
                            {/* Vertical Line */}
                            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-200 via-amber-400 to-amber-200 dark:from-amber-900/30 dark:via-amber-800 dark:to-amber-900/30"></div>
                            
                            {bioData.timeline.map((event, idx) => (
                                <div key={idx} className="relative">
                                    {/* Dot */}
                                    <div className="absolute -left-[25px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-4 border-amber-500 shadow-sm z-10"></div>
                                    
                                    <div className="space-y-1">
                                        <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-800/50">
                                            {event.year}
                                        </span>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                                            {event.event}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/30 relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 text-blue-100 dark:text-blue-900/10 rotate-12">
                        <Users size={120} />
                    </div>
                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                           <Users size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Sanad Keilmuan</h3>
                    </div>

                    <div className="space-y-8 relative z-10">
                        {/* Gurus */}
                        <div className="relative">
                            <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <div className="h-px w-8 bg-blue-200 dark:bg-blue-800"></div>
                                Guru-Guru Utama
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                                {bioData.teachers && bioData.teachers.length > 0 ? bioData.teachers.map((teacher, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handlePersonClick(teacher)}
                                        className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-800/50 p-3 rounded-2xl text-slate-700 dark:text-slate-200 text-sm font-bold shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                            <GraduationCap size={16} />
                                        </div>
                                        <span className="flex-1">{teacher}</span>
                                        <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                )) : <span className="text-xs text-slate-400 italic">Data tidak tersedia</span>}
                            </div>
                        </div>

                        {/* Visual Connector */}
                        <div className="flex justify-center py-2">
                            <div className="w-1 h-8 bg-gradient-to-b from-blue-300 to-emerald-300 dark:from-blue-800 dark:to-emerald-800 rounded-full"></div>
                        </div>

                        {/* Students */}
                        <div className="relative">
                            <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <div className="h-px w-8 bg-emerald-200 dark:bg-emerald-800"></div>
                                Murid-Murid Utama
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                                {bioData.students && bioData.students.length > 0 ? bioData.students.map((student, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handlePersonClick(student)}
                                        className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-800/50 p-3 rounded-2xl text-slate-700 dark:text-slate-200 text-sm font-bold shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                            <Users size={16} />
                                        </div>
                                        <span className="flex-1">{student}</span>
                                        <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                )) : <span className="text-xs text-slate-400 italic">Data tidak tersedia</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-santri-green/10 rounded-lg text-santri-green">
                                <Scroll size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Karya Monumental</h3>
                        </div>
                    </div>
                    <div className="p-4">
                        {bioData.works && bioData.works.length > 0 ? (
                            <div className="grid gap-3">
                                {bioData.works.map((work, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleWorkClick(work)}
                                        className="w-full flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 text-left group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <BookOpen size={18} className="text-santri-gold shrink-0 mt-0.5" />
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                                                {work}
                                            </span>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic p-2">Data karya belum tersedia.</p>
                        )}
                    </div>
                </div>

                {bioData.narrativeSections && bioData.narrativeSections.map((section, idx) => {
                    const sectionId = `section-${idx}`;
                    const isCurrentTts = currentTtsInfo?.id === sectionId;
                    return (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                                        {section.title.toLowerCase().includes('wafat') ? <Clock size={20} /> : <Star size={20} />}
                                    </div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                                        {section.title}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => handleSpeak(section.content, sectionId)} 
                                    className={`p-2 rounded-full transition-colors shrink-0 ${
                                        isCurrentTts 
                                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' 
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {isAudioLoading && isCurrentTts ? <Loader2 size={18} className="animate-spin" /> : isCurrentTts && isPlaying ? <StopCircle size={18} /> : <Volume2 size={18} />}
                                </button>
                            </div>
                            <div className="prose prose-sm max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-justify whitespace-pre-line">
                                {section.content}
                            </div>
                        </div>
                    );
                })}

                {bioData.googleMapsLink && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                                <MapPin size={24} />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Lokasi Makam</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                            {bioData.tombLocation || "Lokasi makam beliau dapat dikunjungi di:"}
                        </p>
                        <a 
                            href={bioData.googleMapsLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95"
                        >
                            <MapPin size={18} />
                            Lihat Lokasi di Google Maps
                        </a>
                    </div>
                )}
             </div>
        ) : (
            <div className="text-center py-20 text-slate-400">Gagal memuat data.</div>
        )}
      </div>

      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName={`Biografi Ulama - ${bioData?.fullName || author || 'Tokoh'}`}
        contentSnippet={bioData ? `${bioData.fullName} (${bioData.birthDeath || bioData.titles || ''})\n\n${bioData.intro || ''}` : ''}
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};

export default BiographyScreen;