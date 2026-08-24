import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Wand2, Loader2, Upload, ImagePlus, FileText, Tag, Send, Sparkles, Newspaper, Image as LucideImage
} from 'lucide-react';
import { fetchFromGitHub, fetchListFromGitHub, saveToGitHub } from '../services/githubDataService';
import { generateNewsAI, generateNewsImageByContextAI } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_NEWS_IMAGE = 'https://i.imgur.com/jSPFx4A.png';

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

/**
 * Menerapkan watermark permanen "Aplikasi Santri AI" ke dalam gambar menggunakan Canvas HTML5
 */
const applyWatermarkToImage = async (
  imageUrl: string,
  watermarkText: string = "Aplikasi Santri AI"
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    const timeout = setTimeout(() => {
      // Fallback jika proses muat gambar terhambat
      resolve(imageUrl);
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        // Resolusi standar editorial 16:9
        const targetWidth = 1200;
        const targetHeight = 675;
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Cover crop
        const imgRatio = img.width / img.height;
        const targetRatio = targetWidth / targetHeight;
        let renderWidth = targetWidth;
        let renderHeight = targetHeight;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > targetRatio) {
          renderHeight = targetHeight;
          renderWidth = targetHeight * imgRatio;
          offsetX = (targetWidth - renderWidth) / 2;
        } else {
          renderWidth = targetWidth;
          renderHeight = targetWidth / imgRatio;
          offsetY = (targetHeight - renderHeight) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);

        // Gradient vignette halus di bagian bawah untuk keterbacaan watermark
        const gradient = ctx.createLinearGradient(0, targetHeight - 140, 0, targetHeight);
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.75)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, targetHeight - 140, targetWidth, 140);

        // Watermark Pill Badge (Pojok Kanan Bawah)
        const text = watermarkText;
        ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;

        const badgePaddingX = 20;
        const badgeHeight = 46;
        const badgeWidth = textWidth + badgePaddingX * 2 + 26;
        const badgeX = targetWidth - badgeWidth - 28;
        const badgeY = targetHeight - badgeHeight - 24;
        const radius = 23;

        // Render Background Kaca / Pill Gelap
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(badgeX + radius, badgeY);
        ctx.lineTo(badgeX + badgeWidth - radius, badgeY);
        ctx.arcTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + radius, radius);
        ctx.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - radius);
        ctx.arcTo(badgeX + badgeWidth, badgeY + badgeHeight, badgeX + badgeWidth - radius, badgeY + badgeHeight, radius);
        ctx.lineTo(badgeX + radius, badgeY + badgeHeight);
        ctx.arcTo(badgeX, badgeY + badgeHeight, badgeX, badgeY + badgeHeight - radius, radius);
        ctx.lineTo(badgeX, badgeY + radius);
        ctx.arcTo(badgeX, badgeY, badgeX + radius, badgeY, radius);
        ctx.closePath();

        ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 4;
        ctx.fill();

        // 1.5px subtle border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Glowing Emerald Indicator Dot
        const dotX = badgeX + badgePaddingX + 4;
        const dotY = badgeY + badgeHeight / 2;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#10b981"; // emerald-500
        ctx.fill();

        // Teks Watermark
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillText(text, dotX + 16, dotY);

        resolve(canvas.toDataURL("image/jpeg", 0.9));
      } catch (err) {
        console.warn("Watermark canvas generation failed:", err);
        resolve(imageUrl);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(imageUrl);
    };

    img.src = imageUrl;
  });
};

interface PopupLoadingInfo {
  isOpen: boolean;
  type: 'text' | 'image';
  title: string;
  subtitle: string;
  step: string;
}

export const WriteNewsScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { user, userData } = useAuth();

  const editNews = location.state?.editNews || null;

  const [title, setTitle] = useState(editNews?.title || '');
  const [content, setContent] = useState(editNews?.content || '');
  const [category, setCategory] = useState(editNews?.category || 'Warta');
  const [imageUrl, setImageUrl] = useState(editNews?.image_url || '');
  const [aiTopicInput, setAiTopicInput] = useState('');
  
  const [categories] = useState<string[]>(['Warta', 'Pesantren', 'Hikmah', 'Tekno-Islam', 'Internasional']);
  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [loadingImageAI, setLoadingImageAI] = useState(false);

  // Popup Loading Indicator State
  const [loadingPopup, setLoadingPopup] = useState<PopupLoadingInfo>({
    isOpen: false,
    type: 'text',
    title: '',
    subtitle: '',
    step: ''
  });

  // Auto pick image fallback if empty on start
  useEffect(() => {
    if (!imageUrl && !editNews) {
      setImageUrl(getDefaultCategoryCover(category));
    }
  }, []);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    if (!imageUrl || Object.values(DEFAULT_CATEGORY_IMAGES).flat().includes(imageUrl)) {
      setImageUrl(getDefaultCategoryCover(cat));
    }
  };

  /**
   * TULIS DENGAN AI:
   * Mendukung input berupa Topik teks, Link Berita Web, ataupun URL Video YouTube.
   * Menghasilkan Judul, Tag Kategori, dan Isi Berita yang komprehensif.
   */
  const handleGenerateAI = async () => {
    const input = aiTopicInput.trim();
    if (!input) {
      showToast("Ketikkan topik warta atau tempelkan tautan Web / YouTube.", "error");
      return;
    }

    const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(input);
    const isUrl = /^https?:\/\//i.test(input);

    setAiGenerating(true);
    setLoadingPopup({
      isOpen: true,
      type: 'text',
      title: isYouTube 
        ? 'Merangkum Video YouTube...' 
        : (isUrl ? 'Membaca Tautan Web...' : 'Menulis Warta Santri...'),
      subtitle: isYouTube
        ? 'AI sedang mengekstrak poin penting kajian / video YouTube menjadi warta berita Islami...'
        : (isUrl 
            ? 'AI sedang menganalisis isi tautan web dan menyusun artikel berita orisinal...' 
            : 'AI sedang merumuskan judul, kategori, dan artikel berita Islami...'),
      step: 'Menganalisis konteks • Menyesuaikan kaidah jurnalistik • Menutup aurat & kesantunan'
    });

    try {
      const res = await generateNewsAI(input);
      if (res && (res.title || res.content)) {
        if (res.title) setTitle(res.title);
        if (res.content) setContent(res.content);
        if (res.category && categories.includes(res.category)) {
          setCategory(res.category);
        }

        // Jika dari YouTube dan ada thumbnail resmi, otomatis pasang cover dengan watermark
        if (res.suggestedImageUrl) {
          try {
            const watermarked = await applyWatermarkToImage(res.suggestedImageUrl, "Aplikasi Santri AI");
            setImageUrl(watermarked);
            showToast("Warta & sampul video YouTube berhasil dipasang!", "success");
          } catch (e) {
            setImageUrl(res.suggestedImageUrl);
            showToast("Judul, kategori, dan isi warta berhasil dibuat AI!", "success");
          }
        } else {
          showToast("Judul, kategori, dan isi warta berhasil dibuat AI!", "success");
        }
      } else {
        showToast("Gagal membangkitkan berita AI. Pastikan topik atau tautan valid.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat memproses AI.", "error");
    } finally {
      setAiGenerating(false);
      setLoadingPopup(prev => ({ ...prev, isOpen: false }));
    }
  };

  /**
   * GAMBAR AI / AUTO:
   * AI menganalisis Judul dan Isi Berita yang ada agar gambarnya SANGAT AKURAT (tanpa halusinasi),
   * lalu membubuhkan watermark "Aplikasi Santri AI".
   */
  const handleAutoPickImage = async () => {
    if (!title.trim() && !content.trim()) {
      showToast("Isi judul atau isi warta terlebih dahulu agar ilustrasi gambar sesuai dengan berita.", "error");
      return;
    }

    setLoadingImageAI(true);
    setLoadingPopup({
      isOpen: true,
      type: 'image',
      title: 'Membuat Gambar Ilustrasi AI...',
      subtitle: 'Membaca konteks judul & isi warta untuk menghasilkan ilustrasi akurat...',
      step: 'Menganalisis isi berita • Merender foto • Membubuhkan watermark Aplikasi Santri AI'
    });

    try {
      // 1. Dapatkan gambar dari AI yang membaca konteks judul dan isi
      const rawAiImg = await generateNewsImageByContextAI(title, content, category);
      const targetSource = rawAiImg || getDefaultCategoryCover(category);

      // 2. Terapkan watermark "Aplikasi Santri AI"
      const watermarkedImg = await applyWatermarkToImage(targetSource, "Aplikasi Santri AI");
      setImageUrl(watermarkedImg);
      showToast("Gambar ilustrasi AI berhasil dibuat dengan watermark Aplikasi Santri AI!", "success");
    } catch (err) {
      console.error("AI image gen error:", err);
      const cover = getDefaultCategoryCover(category);
      setImageUrl(cover);
      showToast("Gambar ilustrasi kategori dipasang.", "info");
    } finally {
      setLoadingImageAI(false);
      setLoadingPopup(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast("Ukuran foto maksimal 3MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (reader.result) {
        // Terapkan watermark juga pada foto unggahan pengguna agar seragam
        const watermarked = await applyWatermarkToImage(reader.result.toString(), "Aplikasi Santri AI");
        setImageUrl(watermarked);
        showToast("Foto berhasil diunggah dengan watermark Aplikasi Santri AI!", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  /**
   * TERBITKAN WARTA SANTRI:
   * Otomatis menyimpan berita (GitHub & localStorage) dan langsung ditampilkan di /news.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast("Mohon isi judul dan isi warta.", "error");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Ambil data berita yang sudah ada dari GitHub dan LocalStorage
      const fetched = await fetchFromGitHub('news', 'news_list');
      let baseList: any[] = [];
      if (Array.isArray(fetched)) {
        baseList = fetched;
      } else {
        const rawDir = await fetchListFromGitHub('news');
        if (Array.isArray(rawDir)) baseList = rawDir;
      }

      // Ambil juga dari local storage
      const local = localStorage.getItem('santri_news_list');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed)) {
            baseList = [...parsed, ...baseList];
          }
        } catch (e) {}
      }

      // Hilangkan duplikasi berdasarkan ID
      const map = new Map<string, any>();
      for (const item of baseList.flat(Infinity)) {
        if (item && item.id) {
          map.set(item.id, item);
        }
      }
      let currentList = Array.from(map.values());

      const timestamp = Date.now();
      const finalImage = imageUrl.trim() || getDefaultCategoryCover(category || 'Warta');
      const currentAuthor = userData?.displayName || user?.displayName || 'Santri AI';
      const currentAuthorPhoto = userData?.avatarUrl || userData?.photoURL || user?.photoURL || '';
      const currentAuthorId = user?.uid || '';

      let updatedList = [...currentList];

      if (editNews?.id) {
        // Editing existing news
        updatedList = updatedList.map((item) => {
          if (item.id === editNews.id) {
            return {
              ...item,
              title: title.trim(),
              excerpt: content.trim().slice(0, 160) + (content.length > 160 ? '...' : ''),
              content: content.trim(),
              image_url: finalImage,
              category: category || 'Warta',
              updated_at: new Date().toISOString()
            };
          }
          return item;
        });
        showToast("Warta Santri berhasil diperbarui!", "success");
      } else {
        // Creating new news
        const newsWithId = {
          id: `news-${timestamp}`,
          title: title.trim(),
          excerpt: content.trim().slice(0, 160) + (content.length > 160 ? '...' : ''),
          content: content.trim(),
          image_url: finalImage,
          category: category || 'Warta',
          author: currentAuthor,
          author_photo: currentAuthorPhoto,
          author_id: currentAuthorId,
          created_at: new Date().toISOString(),
          source: 'Warta Santri'
        };
        updatedList.unshift(newsWithId);
        showToast("Warta Santri berhasil diterbitkan!", "success");
      }

      // 2. Simpan ke LocalStorage agar langsung tampil secara instan tanpa delay
      try {
        localStorage.setItem('santri_news_list', JSON.stringify(updatedList));
      } catch (lsErr) {
        console.warn("LocalStorage save error:", lsErr);
      }

      // 3. Simpan ke GitHub repository
      await saveToGitHub('news', 'news_list', updatedList);

      // 4. Arahkan kembali ke /news agar langsung tampil di daftar
      navigate('/news', { replace: true });
    } catch (err) {
      console.error("Gagal menerbitkan warta:", err);
      showToast("Gagal menyimpan warta. Coba lagi.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-12">
      {/* Loading Popup Modal */}
      {loadingPopup.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Glowing Pulsing Icon */}
            <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl animate-ping opacity-25"></div>
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                {loadingPopup.type === 'text' ? (
                  <Sparkles size={32} className="animate-pulse text-amber-200" />
                ) : (
                  <ImagePlus size={32} className="animate-pulse text-emerald-100" />
                )}
              </div>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {loadingPopup.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
              {loadingPopup.subtitle}
            </p>

            {/* Animated Progress Bar */}
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4 relative">
              <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 rounded-full animate-pulse w-full"></div>
            </div>

            {/* Step Message */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-full text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
              <Loader2 size={13} className="animate-spin text-emerald-600 dark:text-emerald-400" />
              <span>{loadingPopup.step}</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 text-white/90 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h2 className="font-bold text-white text-base leading-tight">
              {editNews ? 'Edit Warta Santri' : 'Tulis Warta Santri'}
            </h2>
            <p className="text-[11px] text-emerald-100/80">Bagikan kabar & wawasan jurnalistik pesantren</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* AI Assistant Banner */}
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-4 md:p-5 shadow-lg border border-emerald-500/30 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles size={16} className="text-amber-300 animate-pulse" />
            <span>Asisten Penulis AI Warta</span>
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Tulis Warta dari Topik, Link Web, atau YouTube
          </h3>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            Ketik topik warta santri, atau tempel tautan artikel web (misal: <i>nu.or.id</i>) maupun link video YouTube. AI akan merumuskan artikel jurnalistik berbobot yang sesuai syariat Islam.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={aiTopicInput}
              onChange={(e) => setAiTopicInput(e.target.value)}
              placeholder="Ketik topik atau tempel link Web / YouTube (https://...)"
              disabled={aiGenerating || submitting}
              className="flex-1 px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition-all"
            />
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={aiGenerating || submitting}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {aiGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span>Memproses AI...</span>
                </>
              ) : (
                <>
                  <Wand2 size={16} className="text-amber-200" />
                  <span>Tulis dengan AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Article Writing Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-7 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-5">
          
          {/* Judul Berita */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <FileText size={15} className="text-emerald-600 dark:text-emerald-400" />
              <span>Judul Warta</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul berita yang menarik..."
              disabled={aiGenerating || submitting}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>

          {/* Kategori Tag */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Tag size={15} className="text-emerald-600 dark:text-emerald-400" />
              <span>Kategori Berita</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  disabled={aiGenerating || submitting}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-emerald-600 text-white shadow-xs scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Foto Sampul / Ilustrasi Gambar */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LucideImage size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span>Foto Sampul / Ilustrasi</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Watermark "Aplikasi Santri AI"</span>
            </label>

            {/* Preview Box */}
            <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative mb-3 border border-slate-200 dark:border-slate-700 group">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Preview Sampul"
                  onError={(e) => {
                    e.currentTarget.src = getDefaultCategoryCover(category || 'Warta');
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <Newspaper size={40} className="opacity-30 mb-1" />
                  <span className="text-xs">Belum ada gambar</span>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-full font-medium">
                {category}
              </div>
            </div>

            {/* Option Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <label className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer transition-colors text-xs font-bold text-slate-600 dark:text-slate-300">
                <Upload size={15} className="text-emerald-500 shrink-0" />
                <span className="truncate">Upload Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={aiGenerating || submitting}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleAutoPickImage}
                disabled={loadingImageAI || aiGenerating || submitting}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-xl border border-emerald-300 dark:border-emerald-700 text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {loadingImageAI ? (
                  <Loader2 size={15} className="text-emerald-600 dark:text-emerald-400 animate-spin shrink-0" />
                ) : (
                  <ImagePlus size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                <span className="truncate">{loadingImageAI ? 'Menganalisis...' : 'Gambar AI / Auto'}</span>
              </button>
            </div>

            {/* Direct URL Input */}
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Atau tempelkan URL Gambar (https://...)"
              disabled={aiGenerating || submitting}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Isi Berita */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <FileText size={15} className="text-emerald-600 dark:text-emerald-400" />
              <span>Isi Lengkap Warta</span>
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan berita lengkap di sini secara santun & informatif..."
              disabled={aiGenerating || submitting}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm leading-relaxed text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || aiGenerating}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Menerbitkan Warta...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>{editNews ? 'Simpan Perubahan Warta' : 'Terbitkan Warta Santri'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default WriteNewsScreen;
