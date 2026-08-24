import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { 
  ArrowLeft, 
  BookOpen, 
  ChevronRight,
  ChevronDown,
  BookOpenCheck
} from 'lucide-react';
import { KITAB_DATA, PredefinedStory } from './IslamicHistoryData';

const IslamicHistoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [expandedKitab, setExpandedKitab] = useState<string | null>(null);

  const toggleKitab = (id: string) => {
    if (expandedKitab === id) {
      setExpandedKitab(null);
    } else {
      setExpandedKitab(id);
    }
  };

  const handleStoryClick = (item: PredefinedStory) => {
    // If it maps to one of our locally hardcoded static files
    const titleLower = item.title.toLowerCase();
    if (titleLower.includes('isra') && titleLower.includes('mi\'raj')) {
      navigate('/islamic-history-detail', { state: { id: 'isra-miraj' } });
    } else if (titleLower.includes('maulid')) {
      navigate('/islamic-history-detail', { state: { id: 'maulid-nabi' } });
    } else {
      navigate('/islamic-history-detail', { state: { query: item.query } });
    }
  };

  const getStoryLabel = (kitabId: string, sIdx: number) => {
    switch (kitabId) {
      case 'kisah-25-nabi':
        return `Nabi ke-${sIdx + 1}`;
      case 'sirah-nabawiyah':
        return 'Sirah';
      case 'sahabat-khulafaur-rasyidin':
        return 'Sahabat';
      case 'dinasti-kesultanan':
        return 'Dinasti';
      case 'cendekiawan-ilmuwan':
        return 'Ilmuwan';
      case 'perang-pertempuran':
        return 'Perang';
      case 'sejarah-nusantara':
        return 'Nusantara';
      case 'wanita-agung-islam':
        return 'Wanita Agung';
      case 'imam-mazhab-ulama-fiqih':
        return 'Fiqih';
      case 'muhaddatsin-perawi-hadits':
        return 'Hadits';
      case 'peninggalan-kebudayaan-seni':
        return 'Seni & Budaya';
      case 'peradaban-geografi':
        return 'Peradaban';
      case 'gerakan-pembaharuan-modern':
        return 'Pembaharuan';
      case 'teologi-ilmu-kalam':
        return 'Teologi';
      case 'tasawuf-wali-allah':
        return 'Tasawuf';
      case 'qashashul-quran':
        return 'Al-Qur\'an';
      case 'qashash-al-hadits':
        return 'Hadits Nabi';
      case 'hikmah-folklore-lokal':
        return 'Hikmah';
      case 'hari-bersejarah':
        return 'Bersejarah';
      default:
        return 'Riwayat';
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6ef] dark:bg-slate-950 pb-24 font-sans transition-colors duration-300">
      
      {/* Gilded Islamic Top Header */}
      <div className="bg-[#0b3c1d] dark:bg-slate-900 pt-5 pb-5 px-4 rounded-b-[2.2rem] shadow-lg sticky top-0 z-50 border-b-4 border-amber-500/80 transition-colors">
        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2.5 bg-white/10 hover:bg-white/15 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl text-white active:scale-90 transition-all flex-shrink-0"
              id="back-btn"
            >
              <ArrowLeft size={18}/>
            </button>
            <div className="overflow-hidden">
              <h1 className="text-base md:text-lg font-bold text-white leading-tight truncate font-serif tracking-wide flex items-center gap-2">
                <BookOpen className="text-amber-400" size={18} /> Pustaka Tarikh Islam
              </h1>
              <p className="text-[9px] uppercase tracking-widest font-bold text-amber-300/80 truncate">
                Khazanah Kisah, Sirah Nabawiyah & Tarikh Agung
              </p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/settings')} 
            className="relative active:scale-90 transition-all flex-shrink-0"
            id="profile-avatar-btn"
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

      {/* Main Body with Warm Book Ornament Theme */}
      <div className="px-4 mt-6 max-w-2xl mx-auto space-y-6">
        
        {/* Decorative Calligraphic Sub-header */}
        <div className="text-center py-4 border-b border-[#ebd9be] dark:border-slate-800">
          <span className="text-[10px] font-black uppercase text-[#8c672b] dark:text-amber-400 tracking-widest block mb-1">
            MUKADIMAH
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-400 italic max-w-md mx-auto leading-relaxed">
            "Pelajarilah sejarah umat terdahulu untuk mengambil mutiara ibrah, hikmah keimanan, dan teladan akhlak mulia Ahlussunnah wal Jama'ah."
          </p>
          {/* Ornate Divider */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-10 h-[1px] bg-[#d5bc94] dark:bg-slate-800"></div>
            <span className="text-xs text-[#b0915a]">❈</span>
            <div className="w-10 h-[1px] bg-[#d5bc94] dark:bg-slate-800"></div>
          </div>
        </div>

        {/* Kitab Category Selection Section */}
        <div className="space-y-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#8c672b] dark:text-amber-400 px-1 flex items-center gap-2">
            <BookOpenCheck size={14} /> Daftar Kitab Sejarah
          </h3>

          <div className="space-y-5">
            {KITAB_DATA.map((kitab) => {
              const IconComp = kitab.icon;
              const isExpanded = expandedKitab === kitab.id;

              return (
                <div 
                  key={kitab.id}
                  className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-[#ebd9be] dark:border-slate-800/80 shadow-md hover:shadow-lg overflow-hidden transition-all duration-300"
                  id={`kitab-card-${kitab.id}`}
                >
                  {/* Banner Header - Designed like a classic leather/gold-gilded book spine */}
                  <button
                    onClick={() => toggleKitab(kitab.id)}
                    className={`w-full p-6 text-left flex items-start justify-between gap-4 transition-all duration-300 ${kitab.bannerBg}`}
                    id={`kitab-btn-${kitab.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl ${kitab.iconBg} ${kitab.iconColor} ${kitab.glowColor} shrink-0 mt-1`}>
                        <IconComp size={22} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[16px] font-arabic text-amber-300 tracking-wide block leading-none">
                          {kitab.arabicTitle}
                        </span>
                        <h4 className="text-base font-bold text-white font-serif leading-snug">
                          {kitab.title}
                        </h4>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-300/80">
                          {kitab.subtitle} • {kitab.items.length} Kisah
                        </p>
                      </div>
                    </div>

                    <div className="p-2 bg-white/10 dark:bg-slate-800/60 rounded-full text-white mt-1.5 active:scale-90 transition-transform">
                      <ChevronDown 
                        size={16} 
                        strokeWidth={3} 
                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-amber-300' : 'text-white'}`} 
                      />
                    </div>
                  </button>

                  {/* Expandable Stories List with Book-Page Styling */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="bg-[#fdfbf7] dark:bg-slate-900 border-t border-[#ebd9be] dark:border-slate-800/80"
                      >
                        <div className="p-5 space-y-4">
                          {/* Inner Category Intro Description */}
                          <div className="bg-[#f5ebd9]/30 dark:bg-slate-950/40 p-4 rounded-2xl border border-[#ebd9be]/50 dark:border-slate-800/80">
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                              {kitab.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                            {kitab.items.map((story, sIdx) => (
                              <motion.button
                                key={sIdx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: sIdx * 0.03 }}
                                onClick={() => handleStoryClick(story)}
                                className="group p-4 bg-white dark:bg-slate-950 rounded-2xl border border-[#ebd9be]/45 dark:border-slate-800/70 hover:border-amber-500/55 dark:hover:border-amber-500/50 hover:bg-[#faf6ed] dark:hover:bg-slate-900 text-left transition-all duration-300 active:scale-[0.98] flex flex-col justify-between min-h-[120px] relative overflow-hidden"
                                id={`story-btn-${kitab.id}-${sIdx}`}
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/10">
                                      {getStoryLabel(kitab.id, sIdx)}
                                    </span>
                                    <ChevronRight size={13} className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                                  </div>
                                  <h5 className="font-bold text-slate-800 dark:text-white text-xs font-serif leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    {story.title}
                                  </h5>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                    {story.desc}
                                  </p>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Elegant Classical Footer decoration */}
        <div className="text-center py-6 text-[10px] text-[#b0915a] font-serif uppercase tracking-widest mt-8">
          <p>✦ SANTRIPEDIA TARIKH ISLAMIYAH ✦</p>
          <p className="text-[8px] tracking-normal lowercase mt-1 text-slate-400 dark:text-slate-500 font-sans">
            seluruh kisah divalidasi berdasarkan riwayat dan kitab muktabar ahlussunnah wal jama'ah
          </p>
        </div>

      </div>
    </div>
  );
};

export default IslamicHistoryScreen;
