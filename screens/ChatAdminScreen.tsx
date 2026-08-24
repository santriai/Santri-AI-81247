import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare, ShieldAlert, Loader2, Sparkles, Image as ImageIcon, X, Maximize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { subscribeToSupportMessages, sendSupportMessage, SupportChatMessage } from '../services/firebase';
import { motion, AnimatePresence } from 'motion/react';

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = 1000;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error("Gagal memproses gambar"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
};

export default function ChatAdminScreen() {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();
  
  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVerified = userData?.verificationBadge === 'badge_purple' || 
                     userData?.verificationBadge === 'badge_blue' || 
                     userData?.verificationBadge === 'badge_red';

  // Auto Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Subscribe to real-time chat messages
    const unsubscribe = subscribeToSupportMessages(user.uid, (data) => {
      setMessages(data);
      setLoading(false);
      // Wait a frame for DOM rendering
      setTimeout(scrollToBottom, 100);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Keep scrolled on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Silakan pilih file gambar (JPG, PNG, WEBP)", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("Ukuran file gambar maksimal 10MB", "warning");
      return;
    }

    try {
      const compressed = await compressImage(file);
      setSelectedImage(compressed);
    } catch (err) {
      showToast("Gagal memuat gambar", "error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || !user) return;
    
    const textToSend = inputText.trim();
    const imageToSend = selectedImage;

    setInputText('');
    setSelectedImage(null);
    setSending(true);

    try {
      await sendSupportMessage(
        user.uid,
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'Santri',
        textToSend,
        {
          name: user.displayName || user.email?.split('@')[0] || 'Santri',
          photo: user.photoURL || undefined
        },
        imageToSend || undefined
      );
    } catch (err) {
      console.error(err);
      showToast("Gagal mengirim pesan", "error");
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 overflow-hidden relative shadow-xl rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 max-w-sm text-center"
        >
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Akses Terbatas</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Anda harus masuk atau mendaftar terlebih dahulu untuk dapat mengobrol dengan tim Admin aplikasi.
          </p>
          <button 
            onClick={() => navigate('/settings')}
            className="w-full py-4 bg-santri-green text-white font-black text-sm rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            Masuk / Register
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-3 text-slate-400 dark:text-slate-500 font-bold text-xs mt-3 hover:text-slate-600 transition-colors"
          >
            Kembali
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 overflow-hidden relative shadow-xl rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 max-w-sm text-center"
        >
          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600">
            <Sparkles size={36} className="animate-pulse" />
          </div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2">Lencana Verifikasi Diperlukan</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Fitur Hubungi Admin saat ini dinonaktifkan untuk akun umum. Fitur ini eksklusif untuk pengguna dengan <b>Lencana Verifikasi Ungu, Merah, atau Biru</b>.
          </p>
          <button 
            onClick={() => navigate('/premium')}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-purple-100 dark:shadow-none active:scale-95 transition-all"
          >
            Dapatkan Lencana Verifikasi
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-3 text-slate-400 dark:text-slate-500 font-bold text-xs mt-3 hover:text-slate-600 transition-colors"
          >
            Kembali
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-b-[2rem] shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={22} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <MessageSquare size={20} className="text-emerald-300" />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-tight">Hubungi Admin</h1>
                <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"></span>
                  Layanan Bantuan Hub Al-Wasilah
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHAT CONTENT */}
      <div className="flex-grow max-w-4xl w-full mx-auto p-4 flex flex-col h-0">
        <div className="flex-grow overflow-y-auto pr-1 space-y-4 no-scrollbar pb-6">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Loader2 className="animate-spin text-santri-green mb-2" size={32} />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Memuat Pesan...</p>
            </div>
          ) : messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center shadow-sm max-w-md mx-auto my-12"
            >
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl flex items-center justify-center text-santri-green mx-auto mb-4">
                <Sparkles size={24} />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">Assalamualaikum!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Silakan ketik pertanyaan, kendala, atau masukan Anda di bawah ini. Tim Admin kami akan membaca dan membalas obrolan Anda secara langsung.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4 pt-2">
              {messages.map((msg, index) => {
                const isMe = msg.senderId === user.uid;
                return (
                  <motion.div 
                    key={msg.id || index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-[1.5rem] p-4 shadow-sm ${
                      isMe 
                        ? 'bg-santri-green text-white rounded-br-sm' 
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-bl-sm'
                    }`}>
                      {!isMe && (
                        <p className="text-[10px] font-black text-rose-500 tracking-wider uppercase mb-1">
                          {msg.senderName} (Admin)
                        </p>
                      )}
                      
                      {msg.imageUrl && (
                        <div 
                          className="mb-2 rounded-2xl overflow-hidden cursor-pointer group relative border border-black/10 dark:border-white/10"
                          onClick={() => setPreviewModalImage(msg.imageUrl || null)}
                        >
                          <img 
                            src={msg.imageUrl} 
                            alt="Lampiran Gambar" 
                            className="max-h-60 w-full object-cover rounded-2xl group-hover:scale-[1.02] transition-transform duration-200" 
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 size={22} className="drop-shadow-md" />
                          </div>
                        </div>
                      )}

                      {msg.content && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      )}
                      
                      <p className={`text-[9px] text-right mt-1.5 font-medium ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Baru saja'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT FORM */}
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg mb-4">
          
          {/* IMAGE PREVIEW BEFORE SENDING */}
          {selectedImage && (
            <div className="p-2 mb-2 relative inline-block bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <img src={selectedImage} alt="Pratinjau Gambar" className="h-24 w-auto rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors"
                title="Hapus gambar"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-end gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              accept="image/*" 
              className="hidden" 
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-santri-green transition-colors flex items-center justify-center shrink-0 mb-0.5 cursor-pointer"
              title="Kirim Gambar"
            >
              <ImageIcon size={18} />
            </button>

            <textarea 
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              rows={1}
              placeholder="Tulis pesan untuk admin... (Tekan Enter untuk baris baru)"
              disabled={sending}
              className="flex-1 bg-transparent px-2 py-2.5 outline-none text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 resize-none max-h-32 min-h-[42px] no-scrollbar"
            />
            
            <button 
              type="submit"
              disabled={sending || (!inputText.trim() && !selectedImage)}
              className="w-10 h-10 rounded-full bg-santri-green hover:bg-emerald-600 disabled:opacity-40 transition-colors flex items-center justify-center text-white shrink-0 shadow-lg shadow-green-100 dark:shadow-none mb-0.5 cursor-pointer"
            >
              {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            </button>
          </form>
        </div>
      </div>

      {/* LIGHTBOX MODAL FOR FULL-SCREEN IMAGE VIEW */}
      <AnimatePresence>
        {previewModalImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewModalImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <button
              onClick={() => setPreviewModalImage(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={previewModalImage}
              alt="Gambar Penuh"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
