import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserAvatar } from '../components/UserAvatar';
import { 
  ArrowLeft, 
  MessageSquare, 
  Plus, 
  Send, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  Scale, 
  Brain, 
  Check, 
  Heart, 
  Trash2, 
  Loader2, 
  Clock, 
  Tag, 
  HelpCircle, 
  CornerDownRight, 
  MessageCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Compass,
  ShieldCheck,
  FileText,
  Layers,
  Building2,
  Share2,
  PenSquare,
  Gem,
  Star,
  Flag,
  Copy
} from 'lucide-react';
import { 
  fetchMasailTopics, 
  subscribeToMasailTopics,
  fetchMasailTopicById, 
  createMasailTopic, 
  deleteMasailTopic, 
  toggleLikeMasailTopic, 
  fetchMasailComments, 
  addMasailComment, 
  generateAIDebateResponse,
  BahtsulMasailTopic, 
  BahtsulMasailComment 
} from '../services/bahtsulMasailService';
import { deductWasilahForAI } from '../services/firebase';
import { PLAYSTORE_LINK } from '../constants';
import { openExternalLink } from '../utils/linkUtils';
import { ContentReportModal } from '../components/ContentReportModal';

const BahtsulMasailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'forum' | 'create'>('forum');
  const [topics, setTopics] = useState<BahtsulMasailTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // New topic state
  const [newTitle, setNewTitle] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [creatingTopic, setCreatingTopic] = useState(false);

  // Selected topic detail state
  const [selectedTopic, setSelectedTopic] = useState<BahtsulMasailTopic | null>(null);
  const [comments, setComments] = useState<BahtsulMasailComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Delete modal state
  const [topicToDelete, setTopicToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // AI debate triggers
  const [aiDebateActive, setAiDebateActive] = useState(false);
  const [selectedApproach, setSelectedApproach] = useState<'qauli' | 'ilhaq' | 'manhaji' | 'umum'>('qauli');
  const [generatingAiResponse, setGeneratingAiResponse] = useState<string | null>(null); // commentId being replied to or 'new'
  const [showIbarah, setShowIbarah] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleNavigateToBedahKitab = (ibarahText: string, ibarahTranslation?: string) => {
    if (!selectedTopic) return;
    if ((userData?.wasilah || 0) < 1) {
      showToast("Wasilah Anda tidak cukup untuk Bedah Ibarah AI (Butuh 1 Wasilah)!", "warning");
      return;
    }
    const textToBedah = ibarahText || selectedTopic.title;
    const combinedText = ibarahText ? `${ibarahText}\n\n${ibarahTranslation || ''}` : (ibarahTranslation || selectedTopic.title);
    navigate('/result', {
      state: {
        query: textToBedah,
        originalText: combinedText,
        source: `Kitab Turath - ${selectedTopic.title}`,
        mode: 'kitab'
      }
    });
  };

  const parseIbarahList = (ibarahArabStr?: string, ibarahTransStr?: string) => {
    if (!ibarahArabStr && !ibarahTransStr) return [];

    const rawArab = (ibarahArabStr || '').trim();
    const rawTrans = (ibarahTransStr || '').trim();

    let arabChunks: string[] = [];
    if (rawArab.includes('---')) {
      arabChunks = rawArab.split('---').map(s => s.trim()).filter(Boolean);
    } else if (rawArab.split(/\n\s*\n/).length > 1) {
      arabChunks = rawArab.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
    } else if (rawArab.match(/(?:^|\n)(?:\d+[\.\)]|\[\d+\])\s*/)) {
      arabChunks = rawArab
        .split(/(?=(?:^|\n)(?:\d+[\.\)]|\[\d+\])\s*)/)
        .map(s => s.trim())
        .filter(Boolean);
    } else {
      arabChunks = [rawArab];
    }

    let transChunks: string[] = [];
    if (rawTrans.includes('---')) {
      transChunks = rawTrans.split('---').map(s => s.trim()).filter(Boolean);
    } else if (rawTrans.split(/\n\s*\n/).length > 1) {
      transChunks = rawTrans.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
    } else if (rawTrans.match(/(?:^|\n)(?:\d+[\.\)]|\[\d+\])\s*/)) {
      transChunks = rawTrans
        .split(/(?=(?:^|\n)(?:\d+[\.\)]|\[\d+\])\s*)/)
        .map(s => s.trim())
        .filter(Boolean);
    } else {
      transChunks = [rawTrans];
    }

    const count = Math.max(arabChunks.length, transChunks.length, 1);
    const items = [];
    for (let i = 0; i < count; i++) {
      const a = arabChunks[i] || (i === 0 ? rawArab : '');
      const t = transChunks[i] || (i === 0 ? rawTrans : '');
      if (a || t) {
        items.push({
          arab: a,
          translation: t,
          index: i + 1
        });
      }
    }
    return items;
  };

  const handleRefClick = (refText: string) => {
    navigate('/kitab-advanced-search', {
      state: {
        initialKeyword: refText
      }
    });
  };

  const getStatusBadgeStyle = (status?: string) => {
    const s = (status || 'MUBAH').toUpperCase();
    switch (s) {
      case 'HARAM':
        return {
          bg: 'bg-rose-600 text-white shadow-rose-500/20',
          text: 'text-rose-600 dark:text-rose-400',
          cardBg: 'bg-rose-500/10 dark:bg-rose-950/30 border-rose-500/20 dark:border-rose-900/40'
        };
      case 'WAJIB':
        return {
          bg: 'bg-blue-600 text-white shadow-blue-500/20',
          text: 'text-blue-600 dark:text-blue-400',
          cardBg: 'bg-blue-500/10 dark:bg-blue-950/30 border-blue-500/20 dark:border-blue-900/40'
        };
      case 'SUNNAH':
      case 'HALAL':
        return {
          bg: 'bg-emerald-600 text-white shadow-emerald-500/20',
          text: 'text-emerald-600 dark:text-emerald-400',
          cardBg: 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500/20 dark:border-emerald-900/40'
        };
      case 'MAKRUH':
        return {
          bg: 'bg-amber-600 text-white shadow-amber-500/20',
          text: 'text-amber-600 dark:text-amber-400',
          cardBg: 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/20 dark:border-amber-900/40'
        };
      case 'TAWAQQUF':
        return {
          bg: 'bg-slate-600 text-white shadow-slate-500/20',
          text: 'text-slate-600 dark:text-slate-400',
          cardBg: 'bg-slate-500/10 dark:bg-slate-900/40 border-slate-500/20 dark:border-slate-800/40'
        };
      case 'KHILAF':
        return {
          bg: 'bg-purple-600 text-white shadow-purple-500/20',
          text: 'text-purple-600 dark:text-purple-400',
          cardBg: 'bg-purple-500/10 dark:bg-purple-950/30 border-purple-500/20 dark:border-purple-900/40'
        };
      case 'MUBAH':
      default:
        return {
          bg: 'bg-teal-600 text-white shadow-teal-500/20',
          text: 'text-teal-600 dark:text-teal-400',
          cardBg: 'bg-teal-500/10 dark:bg-teal-950/30 border-teal-500/20 dark:border-teal-900/40'
        };
    }
  };

  useEffect(() => {
    setLoadingTopics(true);
    const unsubscribe = subscribeToMasailTopics(
      (data) => {
        setTopics(data);
        setLoadingTopics(false);
      },
      (err) => {
        console.error("Error subscribing to masail topics:", err);
        setLoadingTopics(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const loadTopics = async () => {
    setLoadingTopics(true);
    try {
      const data = await fetchMasailTopics();
      setTopics(data);
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat forum Bahtsul Masail.", "error");
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleSelectTopic = async (topic: BahtsulMasailTopic) => {
    setSelectedTopic(topic);
    setLoadingComments(true);
    try {
      const c = await fetchMasailComments(topic.id!);
      setComments(c);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newQuestion.trim()) {
      showToast("Judul dan deskripsi masalah harus diisi.", "warning");
      return;
    }
    if (!user) {
      showToast("Silakan login terlebih dahulu.", "error");
      return;
    }

    if ((userData?.wasilah || 0) < 1) {
      showToast("Wasilah Anda tidak cukup untuk kajian hukum AI (Butuh 1 Wasilah)!", "warning");
      return;
    }

    setCreatingTopic(true);
    try {
      showToast("Mengkaji masalah hukum bersama AI Santri... Mohon tunggu.", "info");
      const topicId = await createMasailTopic(
        newTitle.trim(),
        newQuestion.trim(),
        user.uid,
        userData?.displayName || user.displayName || "Santri",
        userData?.avatarUrl || userData?.photoURL || user.photoURL || ""
      );
      
      // Deduct 1 Wasilah
      try {
        await deductWasilahForAI(user.uid, 1, `Bahtsul Masail - ${newTitle}`);
      } catch (deductErr) {
        console.warn("Deduct Wasilah error:", deductErr);
      }

      showToast("Kajian hukum fatwa selesai dirumuskan! (-1 Wasilah)", "success");
      
      // Reset state
      setNewTitle('');
      setNewQuestion('');
      setActiveTab('forum');
      
      // Reload & focus
      await loadTopics();
      const updatedTopics = await fetchMasailTopics();
      const created = updatedTopics.find(t => t.id === topicId);
      if (created) {
        handleSelectTopic(created);
      }
    } catch (err: any) {
      console.error("Error in handleCreateTopic:", err);
      const detailMsg = err?.message && !err.message.includes('{') ? `: ${err.message}` : "";
      showToast(`Gagal merumuskan kajian Bahtsul Masail${detailMsg}`, "error");
    } finally {
      setCreatingTopic(false);
    }
  };

  const handlePromptDeleteTopic = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!topicId) return;
    setTopicToDelete(topicId);
  };

  const confirmDeleteTopic = async () => {
    if (!topicToDelete) return;
    setIsDeleting(true);
    try {
      showToast("Menghapus topik kajian...", "info");
      await deleteMasailTopic(topicToDelete);
      showToast("Topik kajian berhasil dihapus.", "success");
      setTopics(prev => prev.filter(t => t.id !== topicToDelete));
      if (selectedTopic?.id === topicToDelete) {
        setSelectedTopic(null);
      }
      setTopicToDelete(null);
    } catch (err: any) {
      console.error("Gagal menghapus topik:", err);
      const errMsg = err?.message || String(err);
      showToast(`Gagal menghapus topik: ${errMsg}`, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShareTopic = async (topic: BahtsulMasailTopic, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const titleText = topic.title || 'Kajian Bahtsul Masail';
    const statusText = topic.aiResponse?.legalStatus || 'MUBAH';
    const conclusionText = topic.aiResponse?.conclusion || '';
    
    const shareText = `*Bahtsul Masail NU - Santri AI*\n\n📌 *${titleText}*\n⚖️ Status Hukum: *${statusText}*\n\n💡 *Kesimpulan Fatwa:*\n${conclusionText}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK}`;
    const shareTitle = `[Bahtsul Masail] ${titleText}`;
    
    // Check Android native interface first (2 args: title, text)
    const androidInterface = (window as any).AndroidNativeInterface;
    if (androidInterface && typeof androidInterface.shareText === 'function') {
      try {
        androidInterface.shareText(shareTitle, shareText);
        showToast("Membuka menu berbagi...", "success");
        return;
      } catch (err) {
        console.error("AndroidNativeInterface share error:", err);
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.href,
        });
        showToast("Berhasil membagikan kajian.", "success");
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
        console.error("Share error:", err);
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      showToast("Teks kajian berhasil disalin ke clipboard!", "success");
    } catch (err) {
      showToast("Gagal menyalin teks kajian.", "error");
    }
  };

  const getCardBgStyle = (index: number) => {
    const themes = [
      {
        bg: 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/70 dark:border-emerald-800/50 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-emerald-900/[0.03]',
      },
      {
        bg: 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-200/70 dark:border-sky-800/50 hover:border-sky-400 dark:hover:border-sky-600 shadow-sky-900/[0.03]',
      },
      {
        bg: 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/70 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-600 shadow-amber-900/[0.03]',
      },
      {
        bg: 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200/70 dark:border-purple-800/50 hover:border-purple-400 dark:hover:border-purple-600 shadow-purple-900/[0.03]',
      },
      {
        bg: 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/70 dark:border-rose-800/50 hover:border-rose-400 dark:hover:border-rose-600 shadow-rose-900/[0.03]',
      },
      {
        bg: 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-200/70 dark:border-teal-800/50 hover:border-teal-400 dark:hover:border-teal-600 shadow-teal-900/[0.03]',
      },
      {
        bg: 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200/70 dark:border-indigo-800/50 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-indigo-900/[0.03]',
      }
    ];
    return themes[index % themes.length];
  };

  const handleLikeTopic = async (topic: BahtsulMasailTopic, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      showToast("Harap login terlebih dahulu.", "info");
      return;
    }
    const isLiked = topic.likes.includes(user.uid);
    try {
      await toggleLikeMasailTopic(topic.id!, user.uid, !isLiked);
      
      // Update local state
      const updatedLikes = isLiked 
        ? topic.likes.filter(id => id !== user.uid)
        : [...topic.likes, user.uid];
      
      setTopics(topics.map(t => t.id === topic.id ? { ...t, likes: updatedLikes } : t));
      if (selectedTopic?.id === topic.id) {
        setSelectedTopic({ ...selectedTopic, likes: updatedLikes });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTopic) return;
    if (!user) {
      showToast("Silakan login untuk ikut berdiskusi.", "error");
      return;
    }

    if ((userData?.wasilah || 0) < 1) {
      showToast("Wasilah Anda tidak cukup untuk mengirim komentar/sanggahan (Butuh 1 Wasilah)!", "warning");
      return;
    }

    setSubmittingComment(true);
    const textToSend = newComment.trim();
    setNewComment('');
    
    try {
      // 1. Deduct 1 Wasilah for comment/sanggahan
      await deductWasilahForAI(user.uid, 1, `Komentar Bahtsul Masail`);

      // 2. Add user comment
      const commentId = await addMasailComment(
        selectedTopic.id!,
        textToSend,
        user.uid,
        userData?.displayName || user.displayName || "Santri",
        userData?.avatarUrl || userData?.photoURL || user.photoURL || "",
        false
      );

      // Refresh comments
      let currentComments = await fetchMasailComments(selectedTopic.id!);
      setComments(currentComments);
      showToast("Komentar terkirim (-1 Wasilah)", "success");

      // 3. Trigger AI Response if "Debat Langsung Dengan AI" is enabled
      if (aiDebateActive) {
        setGeneratingAiResponse('new');
        showToast("Syekh Santri AI sedang menyusun argumen... Mohon tunggu.", "info");

        const aiReply = await generateAIDebateResponse(
          selectedTopic.title,
          selectedTopic.question,
          currentComments,
          textToSend,
          userData?.displayName || user.displayName || "Santri",
          selectedApproach
        );

        // Post AI comment
        await addMasailComment(
          selectedTopic.id!,
          aiReply.responseText,
          'ai-santri',
          'Syekh Santri AI',
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150', // Scholar-style stock avatar
          true,
          aiReply.approach
        );

        // Refresh comments again
        currentComments = await fetchMasailComments(selectedTopic.id!);
        setComments(currentComments);
        showToast("Syekh Santri AI membalas argumen Anda!", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal mengirim tanggapan.", "error");
    } finally {
      setSubmittingComment(false);
      setGeneratingAiResponse(null);
    }
  };

  const handleRequestAiRebuttal = async (targetComment: BahtsulMasailComment) => {
    if (!user || !selectedTopic) return;
    if ((userData?.wasilah || 0) < 1) {
      showToast("Wasilah Anda tidak cukup untuk memicu argumen debat AI!", "warning");
      return;
    }

    setGeneratingAiResponse(targetComment.id || 'target');
    showToast("Syekh Santri AI bersiap membantah/menanggapi argumen... Mohon tunggu.", "info");

    try {
      const aiReply = await generateAIDebateResponse(
        selectedTopic.title,
        selectedTopic.question,
        comments,
        targetComment.content,
        targetComment.userName,
        selectedApproach
      );

      // Deduct 1 Wasilah
      await deductWasilahForAI(user.uid, 1, `Bahtsul Masail Debate Rebuttal`);

      // Post AI comment
      await addMasailComment(
        selectedTopic.id!,
        aiReply.responseText,
        'ai-santri',
        'Syekh Santri AI',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150',
        true,
        aiReply.approach
      );

      // Refresh comments
      const currentComments = await fetchMasailComments(selectedTopic.id!);
      setComments(currentComments);
      showToast("Syekh Santri AI menanggapi argumen tersebut! (-1 Wasilah)", "success");
    } catch (err) {
      console.error(err);
      showToast("Gagal memanggil tanggapan AI.", "error");
    } finally {
      setGeneratingAiResponse(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header */}
      <div className="bg-[#005a2b] dark:bg-emerald-950 pt-5 pb-4 px-4 rounded-b-[1.5rem] shadow-md sticky top-0 z-50 transition-colors">
        <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 overflow-hidden">
            <button 
              onClick={() => selectedTopic ? setSelectedTopic(null) : navigate(-1)} 
              className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white active:scale-90 transition-transform flex-shrink-0"
            >
              <ArrowLeft size={20}/>
            </button>
            <div className="overflow-hidden">
              <h1 className="text-base md:text-lg font-black text-white leading-tight truncate">
                {selectedTopic ? "Detail Kajian" : "Bahtsul Masail"}
              </h1>
              {selectedTopic && (
                <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-100 truncate">
                  {selectedTopic.title}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Wasilah Badge in Header */}
            <div 
              onClick={() => navigate('/settings')}
              className="flex items-center gap-1.5 bg-emerald-900/90 dark:bg-emerald-950/90 border border-cyan-400/50 px-3 py-1.5 rounded-2xl text-white text-xs font-black shadow-inner cursor-pointer hover:bg-emerald-800 transition-all active:scale-95"
              title="Jumlah Wasilah Anda"
            >
              <Gem size={14} className="text-cyan-300 fill-cyan-400 animate-pulse" />
              <span className="text-cyan-100">{userData?.wasilahCount ?? userData?.wasilah ?? 0}</span>
              <span className="text-[9px] text-cyan-200 font-bold uppercase tracking-wider hidden sm:inline">Wasilah</span>
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
        </div>
      </div>

      <div className="px-4 mt-6 max-w-2xl mx-auto">
        {!selectedTopic ? (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/30">
              <button
                onClick={() => setActiveTab('forum')}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 ${
                  activeTab === 'forum'
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <MessageSquare size={14} />
                Forum Kajian
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-3 text-xs font-black rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2 ${
                  activeTab === 'create'
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Plus size={14} />
                Ajukan Masalah
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'forum' ? (
                <motion.div
                  key="forum-list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {loadingTopics ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <Loader2 size={36} className="animate-spin text-emerald-600 mb-3" />
                      <p className="text-sm font-medium">Memuat daftar bahtsul masail...</p>
                    </div>
                  ) : topics.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 p-8 shadow-sm">
                      <HelpCircle size={48} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Belum Ada Kajian</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto mb-6">
                        Mari jadi yang pertama mengajukan masalah hukum fiqih kontemporer untuk didiskusikan bersama AI dan pengguna lain!
                      </p>
                      <button
                        onClick={() => setActiveTab('create')}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/10 active:scale-95 transition-all flex items-center gap-2 mx-auto"
                      >
                        <Plus size={14} />
                        Ajukan Masalah Baru
                      </button>
                    </div>
                  ) : (
                    topics.map((topic, index) => {
                      const cardTheme = getCardBgStyle(index);
                      const isOwner = user && (
                        topic.userId === user.uid || 
                        userData?.role === 'admin' || 
                        user.email === 'devsantriai@gmail.com' || 
                        user.email === 'admin@santrimodern.com' ||
                        user.email === 'rumahupdate@gmail.com' ||
                        user.email === 'alwasilahid@gmail.com'
                      );
                      const hasLiked = user && topic.likes.includes(user.uid);
                      return (
                        <motion.div
                          key={topic.id}
                          layoutId={`topic-card-${topic.id}`}
                          onClick={() => handleSelectTopic(topic)}
                          className={`rounded-[2rem] border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group ${cardTheme.bg}`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2.5">
                              <img 
                                src={topic.userPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=80"} 
                                alt={topic.userName} 
                                className="w-8 h-8 rounded-full border border-emerald-200 dark:border-emerald-900 object-cover shadow-sm"
                              />
                              <div>
                                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 leading-none mb-1">
                                  {topic.userName}
                                </h4>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-bold">
                                  <Clock size={10} />
                                  {new Date(topic.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                            {/* Masuk Sidang Button */}
                            <div className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-sm transition-all shrink-0">
                              <span>Masuk Sidang</span>
                              <ChevronRight size={15} strokeWidth={3} />
                            </div>
                          </div>

                          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-1.5 leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {topic.title}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-4 font-medium">
                            {topic.question}
                          </p>

                          {/* AI Response Preview Tag */}
                          {(() => {
                            const statusStyle = getStatusBadgeStyle(topic.aiResponse?.legalStatus);
                            return (
                              <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-3 border border-slate-200/60 dark:border-slate-800/60 mb-4 flex items-center justify-between gap-3 shadow-sm">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 bg-emerald-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <Brain size={14} />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-[9px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block mb-0.5">Keputusan Hukum AI</span>
                                    <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-1 font-semibold">
                                      {topic.aiResponse?.conclusion || "Menunggu rumusan komisi syuriah AI..."}
                                    </p>
                                  </div>
                                </div>
                                {topic.aiResponse?.legalStatus && (
                                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex-shrink-0 shadow-sm ${statusStyle.bg}`}>
                                    {topic.aiResponse.legalStatus}
                                  </span>
                                )}
                              </div>
                            );
                          })()}

                          {/* Footer Actions */}
                          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
                            {/* Love / Like Button */}
                            <button
                              type="button"
                              onClick={(e) => handleLikeTopic(topic, e)}
                              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all border ${
                                hasLiked 
                                  ? "bg-rose-100/90 border-rose-300 text-rose-600 font-bold dark:bg-rose-950/70 dark:border-rose-800 dark:text-rose-400 shadow-sm" 
                                  : "bg-white/90 dark:bg-slate-900/90 border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
                              }`}
                            >
                              <Heart size={15} strokeWidth={3} className={hasLiked ? "fill-rose-500 text-rose-500" : "text-rose-500 dark:text-rose-400"} />
                              <span className="text-[11px] font-black">{topic.likes.length}</span>
                            </button>

                            {/* Discussion / Comments Button */}
                            <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-200">
                              <MessageCircle size={15} strokeWidth={3} className="text-emerald-600 dark:text-emerald-400" />
                              <span className="text-[11px] font-black">{topic.commentCount} Diskusi</span>
                            </div>

                            {/* Native Android Share Button */}
                            <button
                              type="button"
                              onClick={(e) => handleShareTopic(topic, e)}
                              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95"
                              title="Bagikan Kajian Ke WhatsApp/Medsos"
                            >
                              <Share2 size={15} strokeWidth={3} className="text-blue-600 dark:text-blue-400" />
                              <span className="text-[11px] font-black">Share</span>
                            </button>

                            {/* Icon Hapus (Hanya Icon, Berdampingan dengan tombol Share) */}
                            {isOwner && (
                              <button
                                type="button"
                                onClick={(e) => handlePromptDeleteTopic(topic.id!, e)}
                                className="flex items-center justify-center p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-rose-200/80 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all active:scale-95"
                                title="Hapus Topik Kajian"
                              >
                                <Trash2 size={15} strokeWidth={3} className="text-rose-600 dark:text-rose-400" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="create-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <form onSubmit={handleCreateTopic} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800/40 p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-50 dark:border-slate-800/30">
                      <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-emerald-600">
                        <Scale size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">Ajukan Masalah Keagamaan</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Kaji Bersama Tiga Pendekatan Fiqih AI</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Judul Kajian</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Hukum Transaksi Aset Virtual Kripto"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        disabled={creatingTopic}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none font-medium text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Kasus / Deskripsi Masalah</label>
                      <textarea 
                        rows={5}
                        placeholder="Uraikan detail kasus, motif, atau pertanyaan hukum secara lengkap agar AI komisi syuriah dapat mengkaji secara akurat dari pendekatan Qauli, Ilhaq, dan Manhaji..."
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        disabled={creatingTopic}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 px-4 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none font-medium text-xs resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={creatingTopic}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-500/10 active:scale-95 disabled:opacity-50 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      {creatingTopic ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Mengkaji Naskah Turath...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          Mulai Kajian Sidang AI
                        </>
                      )}
                    </button>

                    {/* Wasilah Warning Info */}
                    <div className="bg-cyan-50/50 dark:bg-cyan-950/20 rounded-2xl p-4 border border-cyan-100/40 dark:border-cyan-900/20 flex gap-3">
                      <Sparkles size={18} className="text-cyan-500 animate-pulse flex-shrink-0 mt-0.5" />
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        <strong className="text-cyan-800 dark:text-cyan-400 font-bold block mb-0.5">Biaya Sidang AI: 1 Wasilah</strong>
                        Setiap pengajuan masalah baru akan diproses server-side untuk menghasilkan kajian fatwa tiga-metode (Qauli, Ilhaq, Manhaji) berbasis database turath yang sangat mendalam.
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 pb-12"
          >
            {/* Question Details */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.2rem] border border-slate-100 dark:border-slate-800/40 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <img 
                  src={selectedTopic.userPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=80"} 
                  alt={selectedTopic.userName} 
                  className="w-8 h-8 rounded-full border object-cover"
                />
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 leading-none mb-1">
                    {selectedTopic.userName}
                  </h4>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-bold">
                    <Clock size={10} />
                    {new Date(selectedTopic.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <h2 className="text-base font-black text-slate-800 dark:text-slate-100 mb-3 leading-snug">
                {selectedTopic.title}
              </h2>
              <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-100/50 dark:border-slate-800/50 text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {selectedTopic.question}
              </div>

              {/* Action Buttons at bottom of card */}
              <div className="flex items-center justify-end gap-2 pt-3 mt-4 border-t border-slate-100 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={(e) => handleLikeTopic(selectedTopic, e)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl border transition-all ${
                    user && selectedTopic.likes.includes(user.uid)
                      ? "bg-rose-100/90 border-rose-300 text-rose-600 font-bold dark:bg-rose-950/70 dark:border-rose-800 dark:text-rose-400 shadow-sm"
                      : "bg-slate-50 border-slate-200/80 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
                  }`}
                >
                  <Heart size={15} strokeWidth={3} className={user && selectedTopic.likes.includes(user.uid) ? "fill-rose-500 text-rose-500" : "text-rose-500 dark:text-rose-400"} />
                  <span className="text-[11px] font-black">{selectedTopic.likes.length}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleShareTopic(selectedTopic, e)}
                  className="p-1.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-blue-600 dark:text-blue-400 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                  title="Bagikan Kajian Ini"
                >
                  <Share2 size={15} strokeWidth={3} />
                  <span className="text-[11px] font-black">Share</span>
                </button>

                <button
                  type="button"
                  onClick={() => openExternalLink(PLAYSTORE_LINK)}
                  className="p-1.5 px-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-200/80 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                  title="Beri Rating di Play Store"
                >
                  <Star size={15} className="fill-amber-400 text-amber-500" />
                  <span className="text-[11px] font-black">Rating</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                  className="p-1.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200/80 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                  title="Laporkan Masalah ke Admin"
                >
                  <Flag size={15} />
                  <span className="text-[11px] font-black">Laporkan</span>
                </button>

                {(user && (selectedTopic.userId === user.uid || userData?.role === 'admin' || user.email === 'devsantriai@gmail.com' || user.email === 'admin@santrimodern.com' || user.email === 'rumahupdate@gmail.com' || user.email === 'alwasilahid@gmail.com')) && (
                  <button
                    type="button"
                    onClick={(e) => handlePromptDeleteTopic(selectedTopic.id!, e)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200/80 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl transition-all active:scale-95"
                    title="Hapus Topik Kajian"
                  >
                    <Trash2 size={16} strokeWidth={3} />
                  </button>
                )}
              </div>
            </div>

            {/* AI Decision / Fatwa Box */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-emerald-500/20 dark:border-emerald-800/30 p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 text-emerald-500/5 pointer-events-none">
                <Brain size={120} />
              </div>

              <div className="flex items-center justify-between gap-3 mb-5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-md">
                    <Brain size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">Rumusan Fatwa & Metodologi</h3>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-widest">Sullam Al-Istinbath Syuriah LBM-NU</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                {/* 1. PIRAMIDA TERBALIK: STATUS HUKUM & KESIMPULAN DI PALING ATAS */}
                {(() => {
                  const statusStyle = getStatusBadgeStyle(selectedTopic.aiResponse?.legalStatus);
                  return (
                    <div className={`rounded-3xl p-5 border shadow-sm ${statusStyle.cardBg}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider shadow-md ${statusStyle.bg}`}>
                            {selectedTopic.aiResponse?.legalStatus || 'MUBAH'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
                            {selectedTopic.aiResponse?.statusReason || "🟢 Selesai via Sullam al-Istinbath"}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-extrabold text-emerald-800 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                          <Award size={12} /> Keputusan Komisi Fatwa
                        </span>
                      </div>

                      {/* Highlight Kesimpulan Utama & Dasar Hukum */}
                      <div className="space-y-2">
                        <p className="text-xs md:text-sm text-slate-800 dark:text-slate-100 font-bold leading-relaxed">
                          {selectedTopic.aiResponse?.conclusion}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* 2. IBARAH ARAB (TEKS ASLI KITAB KUNING) - INTERAKTIF & MULTI-IBARAH */}
                {(selectedTopic.aiResponse?.ibarahArab || selectedTopic.aiResponse?.ibarahTranslation) && (() => {
                  const ibarahItems = parseIbarahList(selectedTopic.aiResponse?.ibarahArab, selectedTopic.aiResponse?.ibarahTranslation);
                  return (
                    <div className="bg-emerald-900/5 dark:bg-emerald-950/40 border border-emerald-500/20 rounded-3xl overflow-hidden shadow-sm hover:border-emerald-500/40 transition-all">
                      <button
                        type="button"
                        onClick={() => setShowIbarah(!showIbarah)}
                        className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-black text-emerald-900 dark:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen size={15} className="text-emerald-600 dark:text-emerald-400" />
                          <span>Ibarah Arab & Terjemahan Kitab Turath {ibarahItems.length > 1 ? `(${ibarahItems.length} Ibarah)` : ''}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                          <span>{showIbarah ? "Sembunyikan" : "Tampilkan"}</span>
                          {showIbarah ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {showIbarah && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-5 pb-5 pt-1 border-t border-emerald-500/10 space-y-4"
                          >
                            {ibarahItems.map((item, idx) => (
                              <div key={idx} className="space-y-2.5 p-3.5 bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-emerald-500/15 shadow-xs">
                                {ibarahItems.length > 1 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                                      <BookOpen size={10} /> Ibarah Kutipan #{item.index}
                                    </span>
                                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                      <Sparkles size={10} /> Siap Dibedah AI
                                    </span>
                                  </div>
                                )}

                                {item.arab && (
                                  <div 
                                    onClick={() => handleNavigateToBedahKitab(item.arab, item.translation)}
                                    title="Klik untuk Bedah Kitab oleh AI"
                                    className="p-4 bg-emerald-100/40 dark:bg-slate-900/90 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/40 cursor-pointer hover:bg-emerald-100/70 dark:hover:bg-slate-900 transition-all group relative"
                                  >
                                    <div className="absolute top-2 left-2 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 px-2 py-0.5 rounded-md border border-emerald-300 shadow-xs">
                                      <Sparkles size={10} /> Bedah Ibarah Ini dengan AI
                                    </div>
                                    <p className="text-right text-base md:text-lg font-bold leading-loose text-emerald-950 dark:text-emerald-100 font-[Amiri,serif]">
                                      {item.arab}
                                    </p>
                                  </div>
                                )}

                                {item.translation && (
                                  <div 
                                    onClick={() => handleNavigateToBedahKitab(item.arab, item.translation)}
                                    title="Klik untuk Bedah Kitab oleh AI"
                                    className="p-3 bg-white/90 dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-bold text-emerald-700 dark:text-emerald-400 not-italic block">
                                        Terjemahan & Rujukan Kitab {ibarahItems.length > 1 ? `#${item.index}` : ''}:
                                      </span>
                                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 not-italic flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                                        Bedah Ibarah <ChevronRight size={10} />
                                      </span>
                                    </div>
                                    {item.translation}
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleNavigateToBedahKitab(item.arab, item.translation)}
                                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Sparkles size={13} />
                                  <span>Proses Bedah Ibarah {ibarahItems.length > 1 ? `#${item.index}` : ''} dengan AI</span>
                                  <ChevronRight size={13} />
                                </button>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })()}

                {/* 3. DETAIL METODOLOGI BERJENJANG (SULLAM AL-ISTINBATH) */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                      <Layers size={12} /> Argumentasi Metodologis (Rincian Sullam al-Istinbath)
                    </span>
                  </div>

                  {/* Level 1: Qauli (Detail Pendekatan Qauli Syafi'iyyah) */}
                  {selectedTopic.aiResponse?.qauli && (
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                          <BookOpen size={14} className="text-emerald-600 dark:text-emerald-400" />
                          1. Pendekatan Qauli Detail (Nash Kitab & Pendapat Ulama Syafi'iyyah)
                        </h4>
                        <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                          Tahap 1
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {selectedTopic.aiResponse.qauli}
                      </p>
                    </div>
                  )}

                  {/* Level 2: Ilhaq */}
                  {selectedTopic.aiResponse?.ilhaq && (
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                          <Scale size={14} className="text-amber-600 dark:text-amber-400" />
                          2. Analogi Hukum (Ilhaqul Masail & Kesamaan 'Illat)
                        </h4>
                        <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md">
                          Tahap 2
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {selectedTopic.aiResponse.ilhaq}
                      </p>
                    </div>
                  )}

                  {/* Level 3: Manhaji */}
                  {selectedTopic.aiResponse?.manhaji && (
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                          <Brain size={14} className="text-blue-600 dark:text-blue-400" />
                          3. Metodologi Ushuliyyah & Qawa'id Fiqhiyyah (Manhaji)
                        </h4>
                        <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-md">
                          Tahap 3
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {selectedTopic.aiResponse.manhaji}
                      </p>
                    </div>
                  )}

                  {/* Optional: Muqaranatul Madzahib */}
                  {selectedTopic.aiResponse?.muqaranah && (
                    <div className="bg-purple-50/50 dark:bg-purple-950/20 rounded-3xl p-5 border border-purple-200/60 dark:border-purple-900/40 shadow-sm space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-black text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center gap-2">
                          <Compass size={14} className="text-purple-600 dark:text-purple-400" />
                          Muqaranatul Madzahib (Perbandingan 4 Mazhab)
                        </h4>
                        <span className="text-[9px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-md">
                          Ekstra
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {selectedTopic.aiResponse.muqaranah}
                      </p>
                    </div>
                  )}

                  {/* Optional: Siyasah Syar'iyyah / Regulasi */}
                  {selectedTopic.aiResponse?.siyasahSyarIyyah && (
                    <div className="bg-cyan-50/50 dark:bg-cyan-950/20 rounded-3xl p-5 border border-cyan-200/60 dark:border-cyan-900/40 shadow-sm space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-black text-cyan-900 dark:text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                          <Building2 size={14} className="text-cyan-600 dark:text-cyan-400" />
                          Siyasah Syar'iyyah & Fiqh al-Qanun (Aturan & Kemaslahatan Publik)
                        </h4>
                        <span className="text-[9px] font-bold bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300 px-2 py-0.5 rounded-md">
                          Regulasi
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {selectedTopic.aiResponse.siyasahSyarIyyah}
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. KITAB REFERENSI (BISA DIKLIK & MENAMPILKAN NAMA KITAB, BAB, JUZ & HALAMAN) */}
                {selectedTopic.aiResponse?.references && selectedTopic.aiResponse.references.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Tag size={10} /> Kitab Referensi & Rujukan Rinci (Klik untuk Telusuri):
                    </span>
                    <div className="flex flex-wrap gap-2 items-center">
                      {selectedTopic.aiResponse.references.map((ref, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleRefClick(ref)}
                          title="Klik untuk menelusuri kitab referensi ini"
                          className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 border border-emerald-200/60 dark:border-emerald-800/60 px-3 py-1.5 rounded-2xl text-[10px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer group"
                        >
                          <BookOpen size={11} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                          <span>{ref}</span>
                          <ChevronRight size={10} className="text-emerald-500 opacity-60 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Discussion & Debates (Comments) Area */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <MessageSquare size={12} />
                Sidang & Ruang Sanggahan ({comments.length})
              </h3>

              {loadingComments ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-emerald-600" size={24} />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/40 p-6 text-slate-400">
                  <MessageCircle size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-medium">Belum ada tanggapan/sanggahan di sidang ini.</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Berikan argumen atau tanyakan respon AI di bawah!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div 
                      key={comment.id}
                      className={`flex gap-3 p-4 rounded-3xl border transition-all ${
                        comment.isAi 
                          ? "bg-emerald-500/5 border-emerald-500/25 dark:bg-emerald-950/20 dark:border-emerald-900/30 ml-4 shadow-sm" 
                          : "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800"
                      }`}
                    >
                      {/* Left: Avatar */}
                      <div className="flex-shrink-0">
                        {comment.isAi ? (
                          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md relative border border-emerald-500">
                            <Brain size={16} />
                            <div className="absolute -top-1 -right-1 bg-amber-400 text-[8px] p-0.5 rounded-full border border-white text-slate-900 font-black animate-bounce">
                              <Award size={8} />
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={comment.userPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=80"} 
                            alt={comment.userName} 
                            className="w-9 h-9 rounded-full object-cover border"
                          />
                        )}
                      </div>

                      {/* Right: Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                            {comment.userName}
                          </span>
                          
                          {comment.isAi && (
                            <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              Syuriah AI
                            </span>
                          )}

                          {comment.aiApproach && (
                            <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              Metode {comment.aiApproach}
                            </span>
                          )}

                          <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider ml-auto">
                            {new Date(comment.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                          {comment.content}
                        </p>

                        {/* Debates AI Triggers for users comment */}
                        {!comment.isAi && user && (
                          <div className="mt-3 flex items-center justify-end">
                            <button
                              onClick={() => handleRequestAiRebuttal(comment)}
                              disabled={generatingAiResponse !== null}
                              className="text-[9px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 active:scale-95 transition-all disabled:opacity-50"
                            >
                              {generatingAiResponse === comment.id ? (
                                <>
                                  <Loader2 size={10} className="animate-spin" />
                                  AI sedang membantah...
                                </>
                              ) : (
                                <>
                                  <Sparkles size={10} />
                                  Tanya Sanggahan AI
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message/Comment Input Box */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.2rem] border border-slate-100 dark:border-slate-800/40 p-5 shadow-lg relative z-20">
              <div className="flex items-center justify-between mb-3 border-b border-slate-50 dark:border-slate-800/30 pb-3.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="ai-debate-toggle"
                    checked={aiDebateActive}
                    onChange={(e) => setAiDebateActive(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <label htmlFor="ai-debate-toggle" className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5 cursor-pointer selection:bg-transparent">
                    <Sparkles size={11} className="text-amber-500 animate-pulse" />
                    Debat Langsung Dengan AI
                  </label>
                </div>
                
                {aiDebateActive && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Metode:</span>
                    <select
                      value={selectedApproach}
                      onChange={(e: any) => setSelectedApproach(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-xl px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="qauli">Syafi'iyyah (Qauli)</option>
                      <option value="ilhaq">Ilhaq (Analogi)</option>
                      <option value="manhaji">Manhaji (Kaidah)</option>
                      <option value="umum">Aswaja Umum</option>
                    </select>
                  </div>
                )}
              </div>

              <form onSubmit={handleAddComment} className="relative group flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder={aiDebateActive ? `Argumentasikan pendapat Anda (Debat Fiqih)...` : `Kirim tanggapan sidang/pendapat Anda...`}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submittingComment || generatingAiResponse !== null}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-4 pr-12 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none font-medium text-xs"
                />
                <button 
                  type="submit"
                  disabled={submittingComment || generatingAiResponse !== null || !newComment.trim()}
                  className="absolute right-2 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl font-bold shadow-md active:scale-95 transition-all disabled:opacity-50 flex-shrink-0"
                  title="Kirim Komentar"
                >
                  {submittingComment ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                </button>
              </form>

              <div className="mt-2.5 flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 px-1">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Sparkles size={10} /> 1 Komentar / Sanggahan = 1 Wasilah
                </span>
                <span>Saldo Wasilah: {userData?.wasilah || 0}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Action Button (FAB) - Ajukan Masalah */}
      {activeTab !== 'create' && !selectedTopic && (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setSelectedTopic(null);
            setActiveTab('create');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="fixed bottom-20 right-4 md:right-8 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-full shadow-2xl shadow-emerald-950/40 border-2 border-emerald-400/40 flex items-center justify-center transition-all group active:scale-90"
          title="Ajukan Masalah Keagamaan"
        >
          <PenSquare size={22} strokeWidth={2.5} />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 text-xs font-black transition-all duration-300 uppercase tracking-wider">
            Ajukan Masalah
          </span>
        </motion.button>
      )}
      {/* Delete Topic Modal */}
      <AnimatePresence>
        {topicToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200/60 dark:border-rose-900/50 shadow-sm">
                <Trash2 size={24} />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 text-center mb-2">
                Hapus Topik Kajian?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 text-center mb-6 leading-relaxed font-medium">
                Apakah Anda yakin ingin menghapus topik kajian ini secara permanen dari database? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTopicToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteTopic}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    "Ya, Hapus"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ContentReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        featureName={`Bahtsul Masail - ${selectedTopic?.title || 'Kajian Fiqih'}`}
        contentSnippet={selectedTopic ? `${selectedTopic.title}\n\n${selectedTopic.question}\n\n${selectedTopic.aiResponse?.conclusion || ''}` : ''}
        onSuccess={(msg) => showToast(msg, 'success')}
      />
    </div>
  );
};

export default BahtsulMasailScreen;
