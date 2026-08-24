
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { translateText, scanImage } from '../services/geminiService';
import { TranslationResult } from '../types';
import { useHistory } from '../contexts/HistoryContext';
import { useToast } from '../contexts/ToastContext'; // Import
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { deductWasilahForAI } from '../services/firebase';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Loader2, Delete as DeleteIcon, CornerDownLeft, Keyboard, Mic, MicOff, SendHorizontal, Camera, BookOpen, Image as ImageIcon, Clipboard, Trash2, Gem, ScanLine } from 'lucide-react';
import CustomLoader from '../components/CustomLoader'; // Import CustomLoader
import { InstantCameraLensModal } from '../components/InstantCameraLensModal';

interface InputScreenProps { fontSize: number; }
const HARAKAT = ['َ', 'ِ', 'ُ', 'ً', 'ٍ', 'ٌ', 'ْ', 'ّ'];
const ROW_1 = ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج'];
const ROW_2 = ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'];
const ROW_3 = ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'];
const NUMBERS = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '٠'];
const SYMBOLS_1 = ['-', '/', ':', '؛', '(', ')', '!', '؟', '"', '\''];
const SYMBOLS_2 = ['[', ']', '{', '}', '#', '%', '*', '+', '=', '_'];

interface KeyBtnProps { label?: string | React.ReactNode; char?: string; type?: 'char' | 'action' | 'space' | 'submit'; width?: string; onClick?: () => void; }
const KeyBtn: React.FC<KeyBtnProps> = ({ label, char, type = 'char', width = 'flex-1', onClick }) => {
  const content = label || char;
  let bgClass = 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-[0_1px_2px_rgba(0,0,0,0.3)] border-b-2 border-slate-200 dark:border-slate-900';
  if (type === 'action') bgClass = 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] border-b-2 border-slate-400 dark:border-slate-800';
  if (type === 'submit') bgClass = 'bg-blue-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] border-b-2 border-blue-800';
  if (type === 'space') bgClass = 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-[0_1px_2px_rgba(0,0,0,0.3)] border-b-2 border-slate-200 dark:border-slate-900';
  return ( <button onClick={onClick} className={`${width} h-11 mx-0.5 rounded-lg font-bold text-xl flex items-center justify-center transition-all active:scale-95 active:bg-opacity-80 ${bgClass} ${char ? 'font-arabic pb-1' : ''}`}>{content}</button> );
};

const InputScreen: React.FC<InputScreenProps> = ({ fontSize }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToHistory } = useHistory();
  const { showToast } = useToast(); 
  const { user, userData, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      showToast("Fitur Terjemahan memerlukan login.", "info");
      navigate('/settings');
    }
  }, [user, authLoading, navigate, showToast]);
  
  const [inputText, setInputText] = useState((location.state as any)?.initialText || '');
  const [loading, setLoading] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'arab' | 'indo'>('arab');
  const [isListening, setIsListening] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState<'letters' | 'numbers'>('letters');
  const [showInstantLens, setShowInstantLens] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (textareaRef.current) textareaRef.current.focus(); }, [activeTab]);
  useEffect(() => { 
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) { 
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition; 
      const recognition = new SpeechRecognition(); 
      recognitionRef.current = recognition;
      recognition.continuous = false; 
      recognition.interimResults = false; 
      
      recognition.onresult = (event: any) => { 
        const transcript = event.results[0][0].transcript; 
        setInputText(prev => prev + (prev ? ' ' : '') + transcript); 
        setIsListening(false); 
      }; 
      
      recognition.onerror = (event: any) => { 
        console.error("Speech recognition error", event.error); 
        setIsListening(false);
        if (event.error === 'network') showToast("Fitur suara membutuhkan internet.", "error");
        else if (event.error === 'not-allowed') showToast("Izin mikrofon ditolak.", "error");
        else if (event.error === 'no-speech') showToast("Tidak ada suara terdeteksi.", "info");
        else showToast("Gagal mendeteksi suara.", "error");
      }; 
      
      recognition.onend = () => { 
        setIsListening(false); 
      }; 
    } 

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) { showToast("Browser tidak mendukung fitur suara.", "error"); return; }
    if (isListening) { 
      try { recognitionRef.current.stop(); } catch(e) {}
      setIsListening(false);
    } else { 
      recognitionRef.current.lang = activeTab === 'arab' ? 'ar-SA' : 'id-ID'; 
      try {
        recognitionRef.current.start(); 
        setIsListening(true); 
      } catch(e) {
        console.error(e);
        showToast("Gagal memulai perekaman suara.", "error");
        setIsListening(false);
      }
    }
  };
  const handleCameraIconClick = () => {
    setShowInstantLens(true);
  };

  const insertChar = (char: string) => { const textarea = textareaRef.current; if (!textarea) { setInputText(prev => prev + char); return; } const start = textarea.selectionStart; const end = textarea.selectionEnd; const text = inputText; const newText = text.substring(0, start) + char + text.substring(end); setInputText(newText); setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + char.length, start + char.length); }, 0); };
  const handleBackspace = () => { const textarea = textareaRef.current; if (!textarea) return; const start = textarea.selectionStart; const end = textarea.selectionEnd; if (start === 0 && end === 0) return; const text = inputText; let newText = ''; let newCursorPos = start; if (start === end) { newText = text.substring(0, start - 1) + text.substring(end); newCursorPos = start - 1; } else { newText = text.substring(0, start) + text.substring(end); newCursorPos = start; } setInputText(newText); setTimeout(() => { textarea.focus(); textarea.setSelectionRange(newCursorPos, newCursorPos); }, 0); };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(prev => prev + text);
      showToast("Teks ditempel!", "success");
    } catch (e) {
      showToast("Gagal menempel teks.", "error");
    }
  };

  const handleClear = () => {
    setInputText('');
    textareaRef.current?.focus();
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    if (!user) {
      showToast("Silakan login terlebih dahulu", "error");
      navigate('/settings');
      return;
    }
    const wasilahCost = 1;
    if ((userData?.wasilah || 0) < wasilahCost) {
      showToast(`Sisa Wasilah Anda tidak cukup (Butuh ${wasilahCost} Wasilah)!`, "warning");
      return;
    }

    setLoading(true);
    try {
      const translation = await translateText(inputText);
      await deductWasilahForAI(user.uid, wasilahCost, `Terjemah - ${inputText.substring(0, 30)}...`);
      showToast(`Berhasil menerjemahkan! (Dipotong ${wasilahCost} Wasilah)`, "success");

      const newResult: TranslationResult = { id: uuidv4(), originalText: inputText, maknaGandul: translation.maknaGandul, modernTranslation: translation.modernTranslation, nahwuShorof: (translation as any).nahwuShorof, lughah: (translation as any).lughah, balaghah: (translation as any).balaghah, ushulFiqh: (translation as any).ushulFiqh, hikmah: (translation as any).hikmah, referensi: (translation as any).referensi, aiExplanation: (translation as any).aiExplanation, createdAt: new Date().toISOString(), synced: false };
      addToHistory({ id: newResult.id, type: 'translation', title: newResult.originalText, subtitle: newResult.modernTranslation, timestamp: newResult.createdAt, path: '/result', data: newResult });
      navigate('/result', { state: { result: newResult } });
    } catch (error) { 
      console.error(error);
      showToast("Gagal menerjemahkan. Periksa koneksi atau saldo Anda.", "error"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleBack = () => navigate(-1);

  return (
    <div className="bg-slate-50 dark:bg-slate-950 flex flex-col h-[100dvh]">
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between gap-4 shadow-sm relative z-20 shrink-0">
          <div className="flex items-center gap-4 flex-1 text-left">
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
              <ArrowLeft size={24} strokeWidth={3} />
            </button>
            <div>
              <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Keyboard size={24} strokeWidth={3} className="text-santri-green" /> 
                Terjemahkan
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                {activeTab === 'indo' && (
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <BookOpen size={12} className="text-santri-gold" />
                    <p className="text-[10px] font-bold">Kamus Al-Munawwir</p>
                  </div>
                )}
                {activeTab === 'indo' && <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>}
                <div className="flex items-center gap-1 text-amber-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <p className="text-[10px] font-bold">Biaya: 1 Wasilah</p>
                </div>
                {user && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
                    <button 
                      onClick={() => navigate('/wasilah-shop')}
                      className="flex items-center gap-1 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/60 px-2 py-0.5 rounded-full border border-cyan-200/60 dark:border-cyan-800/40 transition-all active:scale-95 cursor-pointer"
                      title="Buka Toko Wasilah"
                    >
                      <Gem size={11} className="text-cyan-500 dark:text-cyan-400 fill-cyan-400/20 animate-pulse shrink-0" />
                      <p className="text-[10px] font-black text-cyan-700 dark:text-cyan-300">
                        {((userData?.wasilah) || 0).toLocaleString()} Wasilah
                      </p>
                    </button>
                  </>
                )}
              </div>
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
       
       <div className="flex-1 relative overflow-hidden flex flex-col">
          <textarea ref={textareaRef} value={inputText} onChange={(e) => setInputText(e.target.value)} inputMode={activeTab === 'arab' ? 'none' : 'text'} placeholder={activeTab === 'arab' ? "Ketik teks Arab di sini..." : "Ketik teks Indonesia di sini..."} className={`w-full flex-1 p-4 bg-transparent outline-none resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 ${activeTab === 'arab' ? 'font-arabic text-right' : 'font-sans text-left'}`} style={{ fontSize: `${fontSize + 8}px` }} dir={activeTab === 'arab' ? 'rtl' : 'ltr'} />
          
          {/* Quick Actions Bar */}
          <div className="flex justify-end gap-2 p-2 px-4">
             {inputText && (
               <button onClick={handleClear} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
                 <Trash2 size={18} />
               </button>
             )}
             <button onClick={handlePaste} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                 <Clipboard size={18} />
             </button>
          </div>

          {isListening && (<div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-30 animate-in fade-in"><div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center animate-pulse mb-4"><Mic size={40} className="text-white" /></div><p className="text-white font-bold text-lg">Mendengarkan...</p><p className="text-white/80 text-sm mt-2">Katakan sesuatu dalam bahasa {activeTab === 'arab' ? 'Arab' : 'Indonesia'}</p><button onClick={toggleListening} className="mt-6 px-6 py-2 bg-white/20 rounded-full text-sm">Batal</button></div>)}
          {/* NEW: Use CustomLoader for OCR Processing */}
          {isOcrProcessing && <CustomLoader message="Memindai Gambar..." />}
          {/* NEW: Use CustomLoader for main translation loading */}
          {loading && <CustomLoader message="Sedang Menerjemahkan..." />}
       </div>

       <div className="bg-slate-100 dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-800 z-30 shrink-0 transition-all duration-300 flex flex-col shadow-inner relative">
          <InstantCameraLensModal
            isOpen={showInstantLens}
            onClose={() => setShowInstantLens(false)}
            initialMode={activeTab === 'arab' ? 'ar-id' : 'id-ar'}
            onApplyText={(scannedText) => {
              setInputText(prev => prev ? `${prev}\n${scannedText}` : scannedText);
            }}
          />

          <div className="flex items-center gap-2 p-2 px-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 relative z-30"><button onClick={toggleListening} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 border border-slate-200 dark:border-slate-700 ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{isListening ? <MicOff size={20} strokeWidth={3} /> : <Mic size={20} strokeWidth={3} />}</button><div className="relative"><button onClick={handleCameraIconClick} disabled={isOcrProcessing} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700`} title="Kamera Pemindai & Terjemah Instan"><Camera size={20} strokeWidth={3} /></button></div><div className="flex-1 flex bg-slate-100 dark:bg-slate-800 rounded-full p-1 mx-2 border border-slate-200 dark:border-slate-700"><button onClick={() => setActiveTab('arab')} className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'arab' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>Arab</button><button onClick={() => setActiveTab('indo')} className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'indo' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>Indo</button></div><button onClick={handleTranslate} disabled={loading || !inputText} className="w-28 h-10 bg-santri-green text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 text-sm font-bold">
            {/* MODIFIED: Remove inline loader, CustomLoader now handles full screen */}
            <SendHorizontal size={20} strokeWidth={3} /> Hasil
          </button></div>
          
          {activeTab === 'arab' && (<div className="p-1 pb-4 safe-area-bottom bg-slate-100 dark:bg-slate-900"><div className="flex justify-center mb-1 gap-0.5">{HARAKAT.map((char) => (<KeyBtn key={char} char={char} width="w-[11%]" onClick={() => insertChar(char)} />))}</div><div className="flex justify-center mb-1 gap-0.5">{ROW_1.map((char) => (<KeyBtn key={char} char={char} width="w-[8.5%]" onClick={() => insertChar(char)} />))}</div><div className="flex justify-center mb-1 gap-0.5">{ROW_2.map((char) => (<KeyBtn key={char} char={char} width="w-[8.5%]" onClick={() => insertChar(char)} />))}</div><div className="flex justify-center mb-1 gap-0.5">{ROW_3.map((char) => (<KeyBtn key={char} char={char} width="w-[9%]" onClick={() => insertChar(char)} />))}</div><div className="flex justify-center mt-2 px-1 gap-1"><KeyBtn label={keyboardMode === 'letters' ? '123' : 'ABC'} width="w-[15%]" type="action" onClick={() => setKeyboardMode(keyboardMode === 'letters' ? 'numbers' : 'letters')} /><KeyBtn label="Spasi" type="space" width="flex-1" onClick={() => insertChar(' ')} /><KeyBtn label={<DeleteIcon size={20} />} width="w-[15%]" type="action" onClick={handleBackspace} /></div>{keyboardMode === 'numbers' && (<div className="absolute inset-x-0 bottom-[60px] bg-slate-100 dark:bg-slate-900 p-1 border-t border-slate-200 dark:border-slate-800"><div className="flex justify-center mb-1 gap-0.5">{NUMBERS.map((char) => (<KeyBtn key={char} char={char} width="w-[9%]" onClick={() => insertChar(char)} />))}</div><div className="flex justify-center mb-1 gap-0.5">{SYMBOLS_1.map((char) => (<KeyBtn key={char} char={char} width="w-[9%]" onClick={() => insertChar(char)} />))}</div><div className="flex justify-center mb-1 gap-0.5">{SYMBOLS_2.map((char) => (<KeyBtn key={char} char={char} width="w-[9%]" onClick={() => insertChar(char)} />))}</div></div>)}</div>)}
       </div>
    </div>
  );
};

export default InputScreen;