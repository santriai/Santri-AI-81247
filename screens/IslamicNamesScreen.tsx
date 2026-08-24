
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Baby, 
  Star, 
  Heart, 
  Sparkles,
  RefreshCw,
  X,
  Copy,
  Share2,
  BookOpen,
  ChevronDown,
  Send,
  Gem
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { generateIslamicNameMeanings } from '../services/geminiService';
import { deductWasilahForAI } from '../services/firebase';
import CustomLoader from '../components/CustomLoader';
import { InsufficientWasilahModal } from '../components/InsufficientWasilahModal';
import { PLAYSTORE_LINK } from '../constants';

const SUGGESTIONS = ['Ahmad', 'Fatimah', 'Zaid', 'Aisyah', 'Hasan', 'Husain'];

const IslamicPattern: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}>
      <svg 
        className="w-full h-full fill-current"
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="islamic-grid-names" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z" />
            <path d="M12 5 L19 12 L12 19 L5 12 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
            <line x1="12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#islamic-grid-names)" />
      </svg>
    </div>
  );
};

const IslamicNamesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, userData } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any[]>([]);
  const [showNameGuide, setShowNameGuide] = useState(true);
  const [showWasilahModal, setShowWasilahModal] = useState(false);

  const handleSearch = async (nameToSearch?: string) => {
    const target = nameToSearch || query;
    if (!target.trim() || loading) return;
    
    const wasilahCost = 2;
    const isProUser = userData?.isPro || userData?.isLifetimePro;
    const currentWasilah = Math.max(0, Number(userData?.wasilah ?? userData?.wasilahPoints ?? 0));

    if (user?.uid && !isProUser && currentWasilah < wasilahCost) {
      setShowWasilahModal(true);
      return;
    }

    setLoading(true);
    setResult([]);
    try {
      if (user?.uid && !isProUser) {
        await deductWasilahForAI(user.uid, wasilahCost, `Cari Nama Islami - ${target}`);
      }
      const data = await generateIslamicNameMeanings(target);
      setResult(data || []);
      if (!isProUser && user?.uid) {
        showToast("Berhasil mencari nama! (-2 Wasilah)", "success");
      }
    } catch (e: any) {
      console.error("Error searching islamic names:", e);
      const errMsg = e?.message || "";
      if (errMsg.includes("Wasilah") || errMsg.includes("tidak cukup")) {
        setShowWasilahModal(true);
      } else {
        showToast("Gagal mencari nama. Silakan coba lagi.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (item: any) => {
     const text = `${item.name} (${item.meaning}) - ${item.origin}`;
     navigator.clipboard.writeText(text);
     showToast("Nama disalin!", "success");
  };

  const handleShare = async (item: any) => {
     const shareText = `✨ *Nama Islami: ${item.name}* ✨\n\n📖 *Arti:* "${item.meaning}"\n🏷️ *Kategori:* ${item.gender} | ${item.origin}${item.suggestion ? `\n💡 *Catatan:* ${item.suggestion}` : ''}\n\nDisajikan oleh *Santri AI*\n\n📲 *Unduh Aplikasi Santri AI:* ${PLAYSTORE_LINK}`;
     
     if ((window as any).AndroidNativeInterface?.shareText) {
       try {
         (window as any).AndroidNativeInterface.shareText(`Nama Islami: ${item.name}`, shareText);
         return;
       } catch (e) {
         console.warn("Android native share failed:", e);
       }
     }

     if (navigator.share) {
       try {
         await navigator.share({
           title: `Nama Islami: ${item.name}`,
           text: shareText,
         });
       } catch (e) {
         // User cancelled or share failed
       }
     } else {
       await navigator.clipboard.writeText(shareText);
       showToast("Teks nama disalin untuk dibagikan!", "success");
     }
  };

  const handleShareAll = async () => {
    if (!result || result.length === 0) return;
    
    let shareText = `✨ *Rekomendasi Nama Islami - Santri AI* ✨\n\n`;
    result.forEach((item, idx) => {
      shareText += `${idx + 1}. *${item.name}*\n   Arti: "${item.meaning}" (${item.gender} - ${item.origin})\n\n`;
    });
    shareText += `Temukan nama islami penuh berkah di aplikasi Santri AI.\n\n📲 *Unduh Aplikasi Santri AI:* ${PLAYSTORE_LINK}`;

    if ((window as any).AndroidNativeInterface?.shareText) {
      try {
        (window as any).AndroidNativeInterface.shareText('Daftar Nama Islami - Santri AI', shareText);
        return;
      } catch (e) {
        console.warn("Android native share failed:", e);
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daftar Nama Islami - Santri AI',
          text: shareText,
        });
      } catch (e) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      showToast("Daftar nama berhasil disalin!", "success");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 text-left">
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 text-white p-6 rounded-b-[2.5rem] shadow-lg sticky top-0 z-50 relative overflow-hidden">
        <IslamicPattern className="text-white opacity-[0.14]" />
        <div className="flex items-center justify-between max-w-2xl mx-auto relative z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl active:scale-90 transition-transform"><ArrowLeft size={20}/></button>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">Nama Islami</h1>
              <p className="text-[10px] uppercase tracking-widest font-black text-indigo-200 mt-1">Temukan Nama Berkah Syar'i</p>
            </div>
          </div>
          {result.length > 0 && (
            <button 
              onClick={handleShareAll}
              className="p-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl active:scale-90 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs"
              title="Bagikan Hasil"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Bagikan</span>
            </button>
          )}
        </div>
      </div>

      <div className="px-5 mt-8 max-w-2xl mx-auto space-y-6">
        
        {/* Panduan Memilih Nama & Dalil Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <button 
            onClick={() => setShowNameGuide(!showNameGuide)} 
            className="w-full p-4 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
              <BookOpen size={18} />
              <span>Panduan Syar'i & Dalil Keutamaan Nama</span>
            </div>
            <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${showNameGuide ? 'rotate-180' : ''}`} />
          </button>
          
          {showNameGuide && (
            <div className="p-4 space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-950">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Nama adalah Doa & Hak Anak</h4>
                <p>Memberikan nama yang baik (tasmiyah) merupakan kewajiban pertama orang tua kepada anak sebagai identitas syar'i sekaligus optimisme doa yang mengiringinya seumur hidup.</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">Dalil Syariat:</p>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-705 dark:text-slate-305">1. Panggilan di Hari Kiamat:</p>
                  <p className="italic">"Sesungguhnya kalian akan dipanggil pada Hari Kiamat dengan nama-nama kalian dan nama ayah-ayah kalian, maka perbaikilah nama kalian."</p>
                  <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">(HR. Abu Daud)</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Kriteria Nama Terbaik & Terlarang</h4>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li><strong>Paling dicintai Allah:</strong> Abdullah (Hamba Allah) & Abdurrahman (Hamba Maha Pengasih).</li>
                  <li><strong>Mulia & Dianjurkan:</strong> Nama para nabi (Muhammad, Ibrahim, Musa), asmaul husna yang bersandingan dengan "Abdu", serta nama orang-orang shalih.</li>
                  <li><strong>Diharamkan:</strong> Nama yang berkononasi syirik atau menyaingi kekuasaan Allah (seperti Malikul Amlak - Raja Diraja).</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        {/* Search Bar with Send Icon & Wasilah badge */}
        <div className="space-y-2">
          <div className="relative flex items-center">
            <Search size={20} className="absolute left-4 text-indigo-400 pointer-events-none shrink-0" />
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Cari nama atau arti (misal: Zaid, cerdas, pemuda)..."
              className="w-full pl-12 pr-28 py-4 bg-white dark:bg-slate-900 rounded-3xl border-2 border-indigo-100 dark:border-indigo-900/30 focus:border-indigo-500 outline-none shadow-sm transition-all text-sm font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <div className="absolute right-2.5 flex items-center gap-1.5">
              {query && (
                <button 
                  onClick={() => setQuery('')} 
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full"
                  title="Hapus"
                >
                  <X size={16}/>
                </button>
              )}
              <button
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                className="px-3.5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-95 disabled:opacity-50 text-white rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                title="Kirim Pencarian"
              >
                <span>Cari</span>
                <Send size={14} className="fill-current shrink-0" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 text-[10px] font-bold">
            <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Sparkles size={12} className="text-indigo-500" />
              Pencarian Berbasis AI
            </span>
            <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Gem size={10} className="fill-current text-amber-500" />
              2 Wasilah / pencarian
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
           {SUGGESTIONS.map(s => (
             <button 
               key={s} 
               onClick={() => { setQuery(s); handleSearch(s); }}
               disabled={loading}
               className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-full border border-indigo-100 dark:border-indigo-800/50 transition-colors active:scale-95 disabled:opacity-50"
             >
               {s}
             </button>
           ))}
        </div>

        {/* Popup Overlay Loading Modal to prevent double clicks */}
        {loading && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-indigo-100 dark:border-indigo-900/50 text-center max-w-sm w-full space-y-3 relative"
            >
              <CustomLoader message="Menganalisis Makna Islami..." />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Mohon tunggu sebentar, AI sedang meracik referensi nama islami penuh berkah...
              </p>
            </motion.div>
          </div>
        )}

        {result.length > 0 ? (
          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
               <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                 Rekomendasi Nama ({result.length})
               </span>
               <button
                 onClick={handleShareAll}
                 className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold active:scale-95 transition-all border border-indigo-100 dark:border-indigo-900/50"
               >
                 <Share2 size={14} />
                 <span>Bagikan Semua</span>
               </button>
             </div>

             {result.map((item, idx) => (
               <motion.div 
                 key={idx}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl"
               >
                 <div className="flex justify-between items-start mb-3">
                   <div>
                     <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400">{item.name}</h3>
                     <div className="flex gap-2 mt-1">
                        <span className="text-[9px] font-black bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded text-indigo-500 uppercase">{item.gender}</span>
                        <span className="text-[9px] font-black bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded text-emerald-500 uppercase">{item.origin}</span>
                     </div>
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => handleCopy(item)} 
                        title="Salin Nama"
                        className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        <Copy size={16}/>
                      </button>
                      <button 
                        onClick={() => handleShare(item)} 
                        title="Bagikan Nama"
                        className="p-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl text-indigo-600 dark:text-indigo-400 active:scale-95 transition-all"
                      >
                        <Share2 size={16}/>
                      </button>
                   </div>
                 </div>
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border-l-4 border-indigo-500">
                    <p className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed">"{item.meaning}"</p>
                    {item.suggestion && (
                       <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 italic font-medium">{item.suggestion}</p>
                    )}
                 </div>
               </motion.div>
             ))}
          </div>
        ) : !loading && (
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center space-y-4">
             <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950 rounded-full flex items-center justify-center mx-auto text-indigo-400">
                <Baby size={32} />
             </div>
             <div>
                <h4 className="font-bold text-slate-800 dark:text-white">Cari Nama Berkah</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Gunakan AI untuk menemukan ribuan nama islami beserta maknanya.</p>
             </div>
          </div>
        )}

        <div className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-[2rem] border border-amber-100 dark:border-amber-900/30">
           <h4 className="text-amber-800 dark:text-amber-300 font-black text-xs uppercase mb-3 flex items-center gap-2">
             <Sparkles size={14} /> Tip Memilih Nama
           </h4>
           <ul className="text-[10px] text-amber-700 dark:text-amber-400 font-medium space-y-2">
              <li className="flex gap-2"><Star size={10} className="shrink-0 mt-0.5" /> Pilih nama yang bermakna baik karena nama adalah doa.</li>
              <li className="flex gap-2"><Star size={10} className="shrink-0 mt-0.5" /> Nama yang paling dicintai Allah adalah Abdullah dan Abdurrahman.</li>
              <li className="flex gap-2"><Star size={10} className="shrink-0 mt-0.5" /> Boleh menggunakan nama para Nabi dan orang-orang shalih.</li>
           </ul>
        </div>
      </div>

      <InsufficientWasilahModal 
        isOpen={showWasilahModal}
        onClose={() => setShowWasilahModal(false)}
        requiredWasilah={2}
        featureName="Pencarian Nama Islami AI"
      />
    </div>
  );
};

export default IslamicNamesScreen;
