
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Brain, Search, Quote, Share2, Loader2, RefreshCw, Wand2, Video } from 'lucide-react';
import { fetchListFromGitHub, saveToGitHub } from '../services/githubDataService';
import { MutiaraData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { QUOTE_THEMES, generateMutiaraUlama } from '../services/geminiService'; 
import { useToast } from '../contexts/ToastContext'; 
import { useHistory } from '../contexts/HistoryContext'; 
import { PLAYSTORE_LINK } from '../constants';
import { v4 as uuidv4 } from 'uuid'; 

const MutiaraScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast(); 
  const { addToHistory } = useHistory(); 
  const { user, userData } = useAuth();
  
  const [items, setItems] = useState<MutiaraData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); 
  const [aiGenerating, setAiGenerating] = useState(false);
  const [isSharingImage, setIsSharingImage] = useState<string | null>(null);
  const isSharingRef = useRef(false);

  useEffect(() => {
    setLoading(true);
    const loadMutiara = async () => {
        try {
            const data = await fetchListFromGitHub('mutiara');
            // Sort by date, handle undefined dates
            const sorted = [...data].sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateB - dateA;
            });
            setItems(sorted); 
        } catch (e) {
            showToast("Gagal memuat mutiara.", "error");
            setItems([]);
        } finally {
            setLoading(false); 
        }
    };
    loadMutiara();
  }, [refreshKey, showToast]); 

  const filteredItems = items.filter(item => {
    const term = (searchQuery || '').toLowerCase();
    const scholar = (item.scholar || '').toLowerCase();
    const content = (item.content || '').toLowerCase();
    return scholar.includes(term) || content.includes(term);
  });

  const getThemeClass = (themeId: string | undefined) => {
    if (!themeId) return QUOTE_THEMES[0].class;
    
    // Exact match
    const exact = QUOTE_THEMES.find(t => t.id === themeId);
    if (exact) return exact.class;

    // Fuzzy match for AI mapping (e.g. "emerald" -> "grad-emerald-gold")
    const fuzzy = QUOTE_THEMES.find(t => t.id.toLowerCase().includes(themeId.toLowerCase()));
    if (fuzzy) return fuzzy.class;

    return QUOTE_THEMES[0].class;
  };

  const handleShareAsImage = async (item: MutiaraData, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSharingRef.current) return;
    
    const cardId = `mutiara-card-${item.id}`;
    const element = document.getElementById(cardId);
    if (!element) return;

    setIsSharingImage(item.id || null);
    isSharingRef.current = true;
    showToast('Menyiapkan gambar...', 'info');

    try {
        const html2canvas = (window as any).html2canvas;
        if (!html2canvas) throw new Error('html2canvas not loaded');

        const canvas = await html2canvas(element, {
            scale: 3, 
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false,
            onclone: (clonedDoc: Document) => {
                const el = clonedDoc.getElementById(cardId);
                if (el) {
                    // 1. Sembunyikan tombol share
                    const btn = el.querySelector('.share-btn-capture');
                    if (btn) (btn as HTMLElement).style.display = 'none';

                    // 2. Rapikan Teks agar tidak terpotong
                    const textElems = el.querySelectorAll('.text-content-capture');
                    textElems.forEach(t => { 
                        (t as HTMLElement).style.whiteSpace = 'normal'; 
                        (t as HTMLElement).style.overflow = 'visible'; 
                    });

                    // 3. GESER KONTEN KE ATAS: Hilangkan margin atas ikon yang dihapus
                    const contentArea = el.querySelector('.quote-content-area');
                    if (contentArea) {
                        (contentArea as HTMLElement).style.marginTop = '0px';
                        (contentArea as HTMLElement).style.paddingTop = '10px';
                    }

                    // 4. WATERMARK LEBIH SEIMBANG
                    el.style.paddingBottom = '70px'; 
                    
                    const watermark = clonedDoc.createElement('div');
                    watermark.innerText = 'APLIKASI SANTRI AI';
                    watermark.style.cssText = `
                        position: absolute; 
                        bottom: 25px; 
                        left: 0; 
                        width: 100%; 
                        text-align: center; 
                        font-size: 10px; 
                        font-weight: 900; 
                        color: rgba(255,255,255,0.7); 
                        text-transform: uppercase; 
                        letter-spacing: 5px;
                    `;
                    el.appendChild(watermark);
                }
            }
        });

        const scholarName = (item.scholar || 'Ulama').replace(/\s+/g, '_');

        if (window.AndroidNativeInterface?.shareImage) {
            const base64Image = canvas.toDataURL("image/png");
            window.AndroidNativeInterface.shareImage(base64Image, `Mutiara_${scholarName}.png`);
        } else {
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const file = new File([blob], `Mutiara_${scholarName}.png`, { type: 'image/png' });
                
                if (navigator.share) {
                    try {
                        await navigator.share({ 
                            files: [file], 
                            title: 'Mutiara Ulama', 
                            text: `"${item.content}"\n\nNasehat dari ${item.scholar}\n\nDownload Santri AI:\n${PLAYSTORE_LINK}` 
                        });
                    } catch (e) {
                        // User likely cancelled or unsupported
                        downloadImage(canvas, scholarName);
                    }
                } else {
                    downloadImage(canvas, scholarName);
                }
            }, 'image/png');
        }
    } catch (err) { 
        showToast('Gagal memproses gambar.', 'error'); 
    } finally { 
        setIsSharingImage(null); 
        isSharingRef.current = false; 
    }
  };

  const downloadImage = (canvas: HTMLCanvasElement, scholarName: string) => {
    const url = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mutiara_${scholarName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Gambar diunduh ke perangkat", "success");
  };

  const processQuoteGeneration = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setAiGenerating(true); 
    try {
        const res = await generateMutiaraUlama(searchQuery);
        
        if (res.scholar && res.content) {
            const newItem: MutiaraData = {
                id: uuidv4(),
                type: 'quote',
                scholar: res.scholar,
                role: res.role || 'Ulama',
                content: res.content,
                theme: res.theme || QUOTE_THEMES[Math.floor(Math.random() * QUOTE_THEMES.length)].id,
                date: new Date().toISOString()
            };
            
            const saved = await saveToGitHub('mutiara', newItem.scholar + '-' + newItem.id, newItem);
            addToHistory({ id: newItem.id!, type: 'mutiara', title: newItem.scholar, subtitle: `Nasehat tentang ${searchQuery}`, timestamp: newItem.date!, path: '/mutiara', data: newItem });

            if (saved) {
                showToast("Hikmah baru berhasil terbit!", "success");
            } else {
                showToast("Hikmah dibuat (Hanya tersimpan di histori lokal)", "warning");
            }
            setSearchQuery(''); 
            setRefreshKey(prev => prev + 1); 

            if (window.AndroidNativeInterface?.showInterstitialAd) {
                window.AndroidNativeInterface.showInterstitialAd();
            }
        }
    } catch (e) { 
        showToast("Gagal memanggil AI.", "error"); 
    } finally { 
        setAiGenerating(false); 
    }
  }, [searchQuery, showToast, user?.uid, addToHistory, setRefreshKey]);

  const initiateQuoteRequest = async () => {
    if (!searchQuery.trim()) {
        showToast("Masukkan topik nasehat", "warning");
        return;
    }
    processQuoteGeneration();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans">
      <div className="sticky top-0 z-30 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white border-b border-teal-500/20 shadow-md px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors"><ArrowLeft size={24} /></button>
          <h2 className="font-bold text-white text-lg flex items-center gap-2"><Sparkles size={20} className="text-amber-300 fill-amber-300" /> Mutiara Ulama</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setRefreshKey(prev => prev + 1)} className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"><RefreshCw size={20} className={loading ? 'animate-spin' : ''} /></button>
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
        
        {/* PANEL AI */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-3 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400"><Wand2 size={16} /></div>
                <div><h3 className="font-black text-slate-800 dark:text-slate-100 text-xs uppercase tracking-tight">Minta Nasehat AI</h3><p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">Topik Pilihan</p></div>
            </div>
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Sabar, Rezeki, Syukur..." className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border-2 border-transparent focus:border-teal-500 transition-all text-xs font-medium" onKeyDown={(e) => e.key === 'Enter' && initiateQuoteRequest()} />
            </div>
            <button onClick={initiateQuoteRequest} disabled={aiGenerating || !searchQuery.trim()} className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-black text-[10px] shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-widest">
                {aiGenerating ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
                {aiGenerating ? 'MERANGKAI HIKMAH...' : 'BUAT KUTIPAN BARU'}
            </button>
        </div>

        {/* LIST CARDS */}
        <div className="grid grid-cols-1 gap-3">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <Loader2 size={32} className="text-teal-500 animate-spin" />
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Memuat database hikmah...</p>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-10 bg-slate-100 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800"><p className="text-slate-400 text-xs italic">Belum ada kutipan.</p></div>
            ) : (
                filteredItems.map((item, index) => (
                    item.type === 'video' ? (
                      <div 
                        key={item.id || `video-${index}`}
                        onClick={() => window.open(item.url, '_blank')}
                        className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm relative group cursor-pointer"
                      >
                        <div className="aspect-video relative overflow-hidden bg-slate-200 dark:bg-slate-800">
                           {item.thumbnail ? (
                             <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-400"><Video size={32} /></div>
                           )}
                           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                             <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-teal-600 shadow-lg scale-90 group-hover:scale-100 transition-all">
                               <Video size={18} fill="currentColor" />
                             </div>
                           </div>
                        </div>
                        <div className="p-3">
                           <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[11px] line-clamp-1 mb-0.5">{item.title}</h4>
                           <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{item.scholar}</p>
                        </div>
                      </div>
                    ) : (
                      <div 
                        key={item.id || `quote-${index}`} 
                        id={`mutiara-card-${item.id}`} 
                        className={`p-3.5 rounded-2xl border flex flex-col relative overflow-hidden transition-all hover:shadow-md group ${getThemeClass(item.theme)}`}
                      >
                          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none"></div>
                          
                          <div className="quote-content-area mb-2 relative z-10 flex flex-col items-center text-center justify-center px-1">
                              <p className="text-sm md:text-base font-serif italic leading-relaxed drop-shadow-md py-1.5 px-2">
                                  "{item.content}"
                              </p>
                          </div>
  
                          <div className="flex items-end justify-between mt-auto pt-2 border-t border-white/20 relative z-10">
                              <div className="flex-1 pr-3">
                                  <p className="text-content-capture text-[11px] font-black leading-tight drop-shadow-sm">{(item.scholar || 'Ulama').toUpperCase()}</p>
                                  <p className="text-content-capture text-[7px] uppercase font-bold tracking-widest opacity-80 mt-0.5">{item.role || 'Ulama'}</p>
                              </div>
                              <button 
                                  onClick={(e) => handleShareAsImage(item, e)} 
                                  disabled={isSharingImage === item.id} 
                                  className="share-btn-capture p-2 rounded-lg bg-white/20 backdrop-blur-md border border-white/30 text-white shrink-0 active:scale-90 transition-all hover:bg-white/30"
                              >
                                  {isSharingImage === item.id ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
                              </button>
                          </div>
                      </div>
                    )
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default MutiaraScreen;
