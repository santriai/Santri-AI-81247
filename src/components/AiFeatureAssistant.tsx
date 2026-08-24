import React, { useState } from 'react';
import { Brain, HelpCircle, Loader2, X, MessageSquare, BookOpen, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { generateFeatureAssistance } from '../../services/geminiService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Markdown from 'react-markdown';

interface AiFeatureAssistantProps {
  featureName: string;
  contextData?: any;
  placeholder?: string;
}

const AiFeatureAssistant: React.FC<AiFeatureAssistantProps> = ({ featureName, contextData, placeholder }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const fullQuery = contextData ? `${query} (Data Konteks: ${JSON.stringify(contextData)})` : query;
      const res = await generateFeatureAssistance(featureName, fullQuery);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => {
          if (!user) {
            showToast("Asisten Pakar AI memerlukan login.", "info");
            navigate('/settings');
            return;
          }
          setIsOpen(true);
        }}
        className="fixed bottom-24 right-5 w-14 h-14 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-all hover:rotate-12"
      >
        <div className="relative">
          <Brain size={24} className="text-white" />
          <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white rounded-full p-0.5 border border-emerald-600 dark:border-emerald-500 shadow-md">
            <HelpCircle size={10} className="stroke-[3]" />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] rounded-b-3xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <Brain size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-slate-100">Asisten Pakar AI</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{featureName} Specialist</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full">
                  <X size={20} />
                </button>
              </div>

              {!result ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-medium mb-3">Apa yang ingin Anda tanyakan terkait fitur ini?</p>
                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={placeholder || "Tanyakan detail hukum, panduan, atau tips..."}
                      className="w-full h-24 bg-transparent outline-none text-sm text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <button
                    onClick={handleAsk}
                    disabled={loading || !query.trim()}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <MessageSquare size={18} />}
                    {loading ? "TUNGGU SEBENTAR..." : "TANYAKAN ASISTEN"}
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-600 mb-2 font-black text-sm">
                       <BookOpen size={16} /> {result.title}
                    </div>
                    <div className="markdown-body">
                       <Markdown>
                         {result.content}
                       </Markdown>
                    </div>
                  </div>

                  {result.tips && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                       <h4 className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                         <Brain size={12} /> Tips Pakar
                       </h4>
                       <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{result.tips}"</p>
                    </div>
                  )}

                  <button
                    onClick={() => setResult(null)}
                    className="w-full flex items-center justify-center gap-2 py-3 text-slate-400 hover:text-emerald-500 text-xs font-bold transition-all"
                  >
                    TANYA LAGI <ChevronRight size={14} />
                  </button>
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-400 text-center italic">
                Jawaban dihasilkan oleh Sistem Pakar AI Santri AI. Selalu verifikasi hukum ke kitab primer atau tanya Kiai.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiFeatureAssistant;
