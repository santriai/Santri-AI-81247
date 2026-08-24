import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Video, Search, Volume2, Share2, Star, Play, PlayCircle, Clock, 
  Sparkles, Check, Bookmark, BookmarkCheck, Heart, Info, Loader2, RefreshCw, 
  Tv, Eye, HeartHandshake, AlertCircle, Award, ListFilter, ExternalLink, Flag, X
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { PLAYSTORE_LINK } from '../constants';

interface IslamicVideo {
  id: string; // YouTube Video ID
  title: string;
  speaker: string;
  duration: string;
  category: 'ceramah' | 'murottal' | 'kisah' | 'tanya-jawab' | 'sholawat';
  description: string;
  publishedAt: string;
  views: string;
  featured?: boolean;
}

const VIDEO_PLAYLIST: IslamicVideo[] = [
  {
    id: 'tGq6QZ5LjdU',
    title: 'Kunci Ketenangan dan Kebahagiaan Hidup Hakiki',
    speaker: 'Gus Baha (KH. Bahauddin Nur Salim)',
    duration: '15:24',
    category: 'ceramah',
    description: 'Kajian mendalam tentang cara memandang kehidupan dunia dengan sudut pandang tasawuf yang ringan, berakar pada dalil-dalil kuat, memberikan solusi praktis atas keluh kesah kehidupan sehari-hari.',
    publishedAt: '2 minggu lalu',
    views: '124K views',
    featured: true
  },
  {
    id: 'PuJH1WuclWA',
    title: 'Bagaimana Cara Melembutkan Hati yang Mengeras?',
    speaker: 'Buya Yahya',
    duration: '12:45',
    category: 'ceramah',
    description: 'Buya Yahya membagikan nasehat indah bersumber dari akhlak salaf tentang terapi hati, pentingnya menangisi dosa diri, dan menjauhi dengki agar cahaya hidayah mudah merasuk.',
    publishedAt: '1 bulan lalu',
    views: '98K views'
  },
  {
    id: 'QFHRQm5UcgY',
    title: 'Kunci Emas Pembuka Segala Pintu Rezeki yang Berkah',
    speaker: 'Ustadz Adi Hidayat, Lc., M.A.',
    duration: '18:10',
    category: 'ceramah',
    description: 'Penjelasan sistematis tentang konsep rezeki dalam Al-Quran serta amalan-amalan khusus penarik kelimpahan rezeki sesuai petunjuk lahir dan batin Rasulullah SAW.',
    publishedAt: '3 hari lalu',
    views: '250K views'
  },
  {
    id: 'u0AaL4a8-DU',
    title: 'Menghadapi Ujian Berat: Jangan Pernah Berputus Asa',
    speaker: 'Ustadz Hanan Attaki, Lc.',
    duration: '10:15',
    category: 'ceramah',
    description: 'Untaian nasehat penyejuk hati bagi jiwa yang sedang lelah, menghadapi ketidakpastian hidup, serta cara membangun optimisme tinggi melandaskan diri sepenuhnya kepada janji Allah.',
    publishedAt: '5 hari lalu',
    views: '185K views'
  },
  {
    id: 'qMxb_QbnN_8',
    title: 'Cara Menghilangkan Sifat Sombong dan Ujub Dalam Diri',
    speaker: 'Buya Yahya',
    duration: '16:40',
    category: 'ceramah',
    description: 'Penjelasan Buya Yahya mengenai bahaya penyakit hati sombong, ujub, serta bagaimana mendidik diri agar senantiasa tawadhu di hadapan Allah dan sesama makhluk.',
    publishedAt: '3 hari lalu',
    views: '115K views'
  },
  {
    id: 'PuJH1WuclWA',
    title: 'Dahsyatnya Doa Ibu: Kisah Nyata Ridho Orang Tua',
    speaker: 'Ustadz Abdul Somad, Lc., M.A.',
    duration: '21:15',
    category: 'ceramah',
    description: 'Nasihat mendalam mengenai kedudukan mulia seorang ibu dalam Islam, pentingnya berbakti, serta bagaimana ridho orang tua menentukan keberkahan dan kesuksesan hidup anak.',
    publishedAt: '1 minggu lalu',
    views: '450K views'
  },
  {
    id: 'c5ZEXh7feNw',
    title: 'Mengapa Kita Sulit Istiqomah Dalam Beribadah?',
    speaker: 'Gus Baha (KH. Ahmad Bahauddin Nursalim)',
    duration: '19:50',
    category: 'ceramah',
    description: 'Kajian khas Gus Baha yang santai dan penuh hikmat ilmu, membahas alasan psikologis and spiritual di balik naik turunnya iman seseorang serta solusi agar bisa beribadah secara istiqomah.',
    publishedAt: '5 hari lalu',
    views: '320K views'
  },
  {
    id: 'tGq6QZ5LjdU',
    title: 'Pentingnya Menjaga Lisan dan Adab Bertutur Kata',
    speaker: 'KH. M. Zainuddin MZ',
    duration: '31:45',
    category: 'ceramah',
    description: 'Kajian klasik penuh makna dari Almarhum KH. Zainuddin MZ seputar bahaya lisan, ghibah, fitnah, serta pentingnya menjaga akhlakul karimah dalam pergaulan masyarakat sehari-hari.',
    publishedAt: 'Arsip Islami',
    views: '890K views'
  },
  {
    id: 'QFHRQm5UcgY',
    title: 'Konsep Tawakal dan Pasrah yang Benar Dalam Berikhtiar',
    speaker: 'Ustadz Adi Hidayat, Lc., M.A.',
    duration: '23:30',
    category: 'ceramah',
    description: 'Penjelasan mendalam mengenai kaitan antara usaha maksimal (ikhtiar) dan kepasrahan hati kepada takdir Allah (tawakal) agar terhindar dari stres dan kekecewaan hidup.',
    publishedAt: '2 minggu lalu',
    views: '380K views'
  },
  {
    id: 'NtVP4vLQTmA',
    title: 'Murottal Juz Amma Merdu dengan Terjemahan Indonesia Pas',
    speaker: 'Syaikh Mishary Rashid Alafasy',
    duration: '45:30',
    category: 'murottal',
    description: 'Lantunan ayat suci Al-Quran Juz 30 yang sangat syahdu disertai terjemahan teks bahasa Indonesia yang mengalir, sangat baik untuk menemani waktu senggang atau hafalan.',
    publishedAt: '3 bulan lalu',
    views: '1.2M views'
  },
  {
    id: '4UfRsBMLBjU',
    title: 'Surah Al-Kahfi Pembawa Cahaya Penyelamat Hari Kiamat',
    speaker: 'Syaikh Abdul Rahman Al-Sudais',
    duration: '22:15',
    category: 'murottal',
    description: 'Bacaan Surah Al-Kahfi dengan lantunan berwibawa khas Imam Besar Masjidil Haram. Dilengkapi teks terjemah per-ayat untuk tadabbur maknawi yang mendalam.',
    publishedAt: '1 bulan lalu',
    views: '540K views'
  },
  {
    id: 'NtVP4vLQTmA',
    title: 'Murottal Merdu Juz 30 Full Juz Amma Penyejuk Kalbu',
    speaker: 'Syaikh Mishary Rashid Alafasy',
    duration: '52:10',
    category: 'murottal',
    description: 'Lantunan suara emas Syaikh Mishary Rashid Alafasy membaca seluruh surah-surah pendek Juz 30 dengan tartil indah yang menentramkan jiwa saat didengarkan.',
    publishedAt: '1 tahun lalu',
    views: '2.8M views'
  },
  {
    id: 'A2dV7KF8jts',
    title: 'Murottal Surah Al-Waqi\'ah & Ar-Rahman Pembuka Pintu Rezeki',
    speaker: 'Muzammil Hasballah',
    duration: '25:15',
    category: 'murottal',
    description: 'Bacaan surah Ar-Rahman dan Al-Waqi\'ah dengan irama Kurdi yang sangat merdu dan syahdu, dibawakan oleh Muzammil Hasballah.',
    publishedAt: '5 bulan lalu',
    views: '1.4M views'
  },
  {
    id: 'h57J4vFDXZk',
    title: 'Surah Al-Mulk Penyelamat Siksa Kubur (Full Bacaan)',
    speaker: 'Syaikh Yasser Al-Dosari',
    duration: '14:30',
    category: 'murottal',
    description: 'Lantunan indah Surah Al-Mulk oleh Imam Masjidil Haram Syaikh Yasser Al-Dosari untuk dibaca atau didengarkan sebelum tidur sebagai pelindung di alam kubur.',
    publishedAt: '2 bulan lalu',
    views: '950K views'
  },
  {
    id: 'A2dV7KF8jts',
    title: 'Tilawah Quran Surah Maryam Ayat 1-15 Menggetarkan Jiwa',
    speaker: 'Syamsuri Firdaus',
    duration: '12:15',
    category: 'murottal',
    description: 'Lantunan ayat suci Al-Quran dengan lagu Mujawwad yang luar biasa indah oleh Qori Internasional asal Indonesia Syamsuri Firdaus.',
    publishedAt: '4 bulan lalu',
    views: '620K views'
  },
  {
    id: 'qMxb_QbnN_8',
    title: 'Kisah Lengkap Perjalanan Agung Nabi Muhammad SAW',
    speaker: 'Kisah Sejarah Islam',
    duration: '28:40',
    category: 'kisah',
    description: 'Visualisasi naratif dan penjelasan runut mengenai Sirah Nabawiyah, mulai dari peristiwa kelahiran, masa kenabian di Makkah, hijrah bersejarah, hingga kewafatan utusan agung akhir zaman.',
    publishedAt: '6 bulan lalu',
    views: '3.1M views'
  },
  {
    id: 'u0AaL4a8-DU',
    title: 'Salman Al-Farisi: Sang Pencari Kebenaran Sejati',
    speaker: 'Kisah Sahabat Nabi',
    duration: '14:50',
    category: 'kisah',
    description: 'Kisah inspiratif perjalanan spiritual sahabat Salman Al-Farisi dari Persia, melompati benua dan agama demi mencari dan memeluk kebenaran Islam di tangan Rasulullah SAW.',
    publishedAt: '2 minggu lalu',
    views: '85K views'
  },
  {
    id: 'QFHRQm5UcgY',
    title: 'Kezuhudan dan Keadilan Khalifah Abu Bakar Ash-Shiddiq r.a.',
    speaker: 'Kisah Sahabat Nabi',
    duration: '22:40',
    category: 'kisah',
    description: 'Kisah perjalanan kepemimpinan Khalifah pertama umat Islam, keteguhan imannya menemani perjuangan hijrah Rasulullah, serta kelembutan hati yang luar biasa dalam memimpin.',
    publishedAt: '1 bulan lalu',
    views: '340K views'
  },
  {
    id: 'c5ZEXh7feNw',
    title: 'Kisah Heroik Perang Badar: Pertolongan Nyata Pasukan Malaikat',
    speaker: 'Kisah Sejarah Islam',
    duration: '26:15',
    category: 'kisah',
    description: 'Kisah sejarah pertempuran agung pertama umat Islam melawan kaum musyrikin Quraisy, keteguhan hati para syuhada, serta kebesaran mukjizat pertolongan Allah SWT.',
    publishedAt: '3 bulan lalu',
    views: '510K views'
  },
  {
    id: 'tGq6QZ5LjdU',
    title: 'Kisah Cinta Sejati Rasulullah SAW dengan Sayyidah Khadijah Al-Kubra r.a.',
    speaker: 'Kisah Rasulullah',
    duration: '18:50',
    category: 'kisah',
    description: 'Kisah haru pengorbanan luar biasa istri tercinta Rasulullah, pendukung dakwah pertama di masa-masa sulit Makkah, hingga sanjungan abadi Rasulullah kepada Khadijah.',
    publishedAt: '2 minggu lalu',
    views: '420K views'
  },
  {
    id: 'qMxb_QbnN_8',
    title: 'Tanya Jawab Fikih Waris: Hak, Bagian & Batasan Adil',
    speaker: 'Buya Yahya (Q&A Fikih)',
    duration: '16:05',
    category: 'tanya-jawab',
    description: 'Prinsip dasar ilmu waris (Mawaris) sesuai madzhab Syafi\'i. Kupas tuntas pertanyaan jamaah seputar pembagian harta waris agar tidak memicu permusuhan antara ahli waris.',
    publishedAt: '1 bulan lalu',
    views: '43K views'
  },
  {
    id: 'PuJH1WuclWA',
    title: 'Fikih Shalat Khusyuk: Rukun, Syarat, dan Kekuatan Jiwa',
    speaker: 'Ustadz Abdul Somad, Lc., M.A.',
    duration: '19:30',
    category: 'tanya-jawab',
    description: 'Panduan lengkap gerakan dan bacaan shalat yang benar demi mencapai tingkatan khusyuk lahir batin, serta jawaban praktis atas keraguan seputar was-was saat shalat.',
    publishedAt: '3 minggu lalu',
    views: '120K views'
  },
  {
    id: 'c5ZEXh7feNw',
    title: 'Tanya Jawab Seputar Hukum Kredit & Riba Dalam Keseharian',
    speaker: 'Gus Baha',
    duration: '18:25',
    category: 'tanya-jawab',
    description: 'Pembahasan fikih muamalah kontemporer mengenai batasan jual beli, hutang piutang, dan riba agar umat terhindar dari harta haram.',
    publishedAt: '3 minggu lalu',
    views: '210K views'
  },
  {
    id: 'CetzKeyZ5xc',
    title: 'Melodi Sholawat Jibril Merdu Penarik Keberkahan Hidup',
    speaker: 'Kumpulan Sholawat Nabi',
    duration: '32:10',
    category: 'sholawat',
    description: 'Koleksi lantunan sholawat Jibril dan lantunan madah sanjungan kepada Rasulullah SAW dengan irama lembut penyejuk hati, sangat baik diputar pagi dan petang.',
    publishedAt: '4 bulan lalu',
    views: '2.5M views'
  },
  {
    id: '6QcWNtcwtpI',
    title: 'Sholawat Thibil Qulub: Obat Hati dan Penenang Jiwa',
    speaker: 'Sholawat Penenang Jiwa',
    duration: '15:20',
    category: 'sholawat',
    description: 'Lantunan Syahdu Sholawat Thibil Qulub berulang untuk dzikir penenang batin saat cemas, pembersih kegelisahan pikiran, sekaligus sarana cinta agung kepada Rasulullah.',
    publishedAt: '2 bulan lalu',
    views: '890K views'
  },
  {
    id: 'KQQ6A5N4his',
    title: 'Sholawat Al-Busyro Penarik Keberkahan Sehari-Hari',
    speaker: 'Sholawat Penenang Jiwa',
    duration: '12:30',
    category: 'sholawat',
    description: 'Sholawat Al-Busyro yang dilantunkan dengan merdu sebagai sarana memohon perlindungan, keselamatan, serta kemudahan segala hajat.',
    publishedAt: '3 bulan lalu',
    views: '850K views'
  },
  {
    id: 'NtVP4vLQTmA',
    title: 'Tadabbur Surah Yusuf Merdu Penggetar Jiwa Berulang-ulang',
    speaker: 'Syaikh Mishary Rashid Alafasy',
    duration: '28:10',
    category: 'murottal',
    description: 'Lantunan indah Surah Yusuf oleh Syaikh Mishary Rashid Alafasy, merefleksikan ketabahan Nabi Yusuf AS menghadapi cobaan hidup dan fitnah dunia.',
    publishedAt: '1 bulan lalu',
    views: '450K views'
  },
  {
    id: '4UfRsBMLBjU',
    title: 'Surah Yasin Merdu Terjemahan Indonesia Penenteram Hati',
    speaker: 'Syaikh Mishary Rashid Alafasy',
    duration: '22:45',
    category: 'murottal',
    description: 'Bermanfaat tinggi didengarkan setiap pagi atau malam hari, Surah Yasin lengkap dengan terjemahan untuk mendekatkan diri kepada Allah SWT.',
    publishedAt: '2 minggu lalu',
    views: '1.2M views'
  },
  {
    id: 'A2dV7KF8jts',
    title: 'Surah Ar-Rahman: Nikmat Tuhan Manakah yang Kamu Dustakan?',
    speaker: 'Muzammil Hasballah',
    duration: '15:20',
    category: 'murottal',
    description: 'Bait-bait pengingat nikmat yang melimpah dari Surah Ar-Rahman dilantunkan dengan merdu oleh Muzammil Hasballah.',
    publishedAt: '3 bulan lalu',
    views: '920K views'
  },
  {
    id: 'h57J4vFDXZk',
    title: 'Surah Al-Kahfi Merdu Pelindung dari Fitnah Dajjal',
    speaker: 'Muzammil Hasballah',
    duration: '25:40',
    category: 'murottal',
    description: 'Lantunan Surat Al-Kahfi pembawa cahaya dari hari Jum\'at ke Jum\'at berikutnya dengan lantunan lagu merdu khas Muzammil Hasballah.',
    publishedAt: '1 minggu lalu',
    views: '650K views'
  },
  {
    id: 'CetzKeyZ5xc',
    title: 'Sholawat Badar Menyentuh Hati Pengingat Perjuangan',
    speaker: 'Ai Khodijah',
    duration: '06:15',
    category: 'sholawat',
    description: 'Sholawat Badar klasik yang dibawakan secara modern dan syahdu oleh Ai Khodijah untuk mendoakan keselamatan umat muslim.',
    publishedAt: '5 hari lalu',
    views: '3.4M views'
  },
  {
    id: '6QcWNtcwtpI',
    title: 'Kumpulan Sholawat Jibril Pembuka Pintu Rezeki Mengalir Deras',
    speaker: 'Ai Khodijah',
    duration: '45:00',
    category: 'sholawat',
    description: 'Kumpulan lantunan Sholawat Jibril merdu yang berulang-ulang untuk menenteramkan pikiran dan melancarkan hajat sehari-hari.',
    publishedAt: '2 bulan lalu',
    views: '8.9M views'
  },
  {
    id: 'tGq6QZ5LjdU',
    title: 'Rahasia Ibadah di Akhir Zaman & Cara Menyikapinya',
    speaker: 'Gus Baha',
    duration: '20:15',
    category: 'ceramah',
    description: 'Kajian kitab kuning oleh Gus Baha mengenai kelonggaran dan kemudahan syariat Islam bagi umat di akhir zaman agar tidak berputus asa.',
    publishedAt: '3 hari lalu',
    views: '310K views'
  },
  {
    id: 'c5ZEXh7feNw',
    title: 'Ceramah Lucu Tapi Penuh Makna: Mencari Jati Diri Muslim',
    speaker: 'KH. M. Zainuddin MZ',
    duration: '35:40',
    category: 'ceramah',
    description: 'Kajian legendaris Dai Sejuta Umat Almarhum KH. Zainuddin MZ yang mengocok perut namun sarat akan nasehat moral kehidupan yang relevan sepanjang masa.',
    publishedAt: 'Arsip Islami',
    views: '1.5M views'
  },
  {
    id: 'qMxb_QbnN_8',
    title: 'Kisah Ketabahan Nabi Ibrahim AS Menghadapi Ujian Api Raja Namrud',
    speaker: 'Kisah Sejarah Islam',
    duration: '18:50',
    category: 'kisah',
    description: 'Mengungkap hikmah mendalam dari keteguhan tauhid Nabi Ibrahim AS kala dibakar hidup-hidup dan bagaimana pertolongan mukjizat Allah berupa dinginnya api menyelamatkannya.',
    publishedAt: '4 minggu lalu',
    views: '180K views'
  },
  {
    id: 'u0AaL4a8-DU',
    title: 'Kisah Detik-Detik Bersejarah Hijrah Nabi Muhammad SAW ke Madinah',
    speaker: 'Kisah Sejarah Islam',
    duration: '22:30',
    category: 'kisah',
    description: 'Kisah dramatis perjuangan hijrah Rasulullah SAW bersama Abu Bakar Ash-Shiddiq r.a. menghindari kejaran kaum kafir Quraisy hingga tiba di Yatsrib.',
    publishedAt: '1 bulan lalu',
    views: '240K views'
  },
  {
    id: 'PuJH1WuclWA',
    title: 'Hukum Fikih Warisan: Batasan Hak Ahli Waris Menurut Islam',
    speaker: 'Buya Yahya',
    duration: '15:10',
    category: 'tanya-jawab',
    description: 'Nasihat hukum fikih praktis dari Buya Yahya bagi keluarga muslim mengenai pembagian waris secara syariat yang adil dan menjunjung persaudaraan.',
    publishedAt: '2 minggu lalu',
    views: '75K views'
  },
  {
    id: 'QFHRQm5UcgY',
    title: 'Keutamaan Sedekah Subuh: Mukjizat Penolak Bala & Magnet Doa Malaikat',
    speaker: 'Ustadz Abdul Somad',
    duration: '16:50',
    category: 'tanya-jawab',
    description: 'Pentingnya meluangkan sedekah di waktu subuh hari, serta bagaimana dua malaikat mendoakan kebaikan bagi yang bersedekah di pagi hari.',
    publishedAt: '1 minggu lalu',
    views: '190K views'
  },
  {
    id: 'u0AaL4a8-DU',
    title: 'Terapi Sabar dan Syukur Menghadapi Kekecewaan Takdir',
    speaker: 'Ustadz Hanan Attaki',
    duration: '14:20',
    category: 'ceramah',
    description: 'Nasehat sejuk dan menenangkan dari Ustadz Hanan Attaki bagi siapa saja yang sedang berjuang mengikhlaskan hal yang tidak berjalan sesuai ekspektasi.',
    publishedAt: '4 hari lalu',
    views: '280K views'
  }
];

const IslamicVideosScreen: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'semua' | 'ceramah' | 'murottal' | 'kisah' | 'tanya-jawab' | 'sholawat' | 'favorit'>('semua');
  const [selectedVideo, setSelectedVideo] = useState<IslamicVideo | null>(VIDEO_PLAYLIST[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('santri_video_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync favorites to localStorage
  useEffect(() => {
    localStorage.setItem('santri_video_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // States & handlers for reporting videos
  const [reportingVideo, setReportingVideo] = useState<IslamicVideo | null>(null);
  const [reportReason, setReportReason] = useState('video_broken');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleSendVideoReport = () => {
    if (!reportingVideo) return;
    setIsSubmittingReport(true);
    setTimeout(() => {
      showToast("Laporan video berhasil dikirim. Terima kasih atas partisipasi Anda!", "success");
      setIsSubmittingReport(false);
      setReportingVideo(null);
      setReportReason('video_broken');
      setReportDetails('');
    }, 850);
  };

  // Handle active video change or reset play states
  useEffect(() => {
    setIsPlaying(false);
  }, [selectedVideo]);

  const handlePlayVideo = (video: IslamicVideo) => {
    setSelectedVideo(video);
    setIsPlaying(true);
    // Auto scroll to top player in mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(favId => favId !== id));
      showToast("Dihapus dari koleksi video favorit", "info");
    } else {
      setFavorites(prev => [...prev, id]);
      showToast("Disimpan ke video favorit", "success");
    }
  };

  const handleShare = (video: IslamicVideo, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `Yuk saksikan video Islami bermanfaat ini: "${video.title}" oleh ${video.speaker}. Klik link: https://www.youtube.com/watch?v=${video.id}\n\nDownload Aplikasi Santri AI:\n${PLAYSTORE_LINK} #SantriAI`;
    
    if (window.AndroidNativeInterface?.shareText) {
      try {
        window.AndroidNativeInterface.shareText("Santri AI Video", shareText);
      } catch (err) {
        copyToClipboard(shareText);
      }
    } else if (navigator.share) {
      navigator.share({
        title: 'Video Islami - Santri AI',
        text: shareText,
        url: `https://www.youtube.com/watch?v=${video.id}`
      }).catch(() => {
        copyToClipboard(shareText);
      });
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Link video berhasil disalin ke clipboard!", "success");
  };

  // Filter videos based on category and search query
  const filteredVideos = useMemo(() => {
    return VIDEO_PLAYLIST.filter(video => {
      const matchesSearch = 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeCategory === 'semua') {
        return matchesSearch;
      } else if (activeCategory === 'favorit') {
        return favorites.includes(video.id) && matchesSearch;
      } else {
        return video.category === activeCategory && matchesSearch;
      }
    });
  }, [searchQuery, activeCategory, favorites]);

  // Featured / Suggested Videos list excluding current playing video
  const listSuggested = useMemo(() => {
    return VIDEO_PLAYLIST.filter(v => v.id !== selectedVideo?.id).slice(0, 4);
  }, [selectedVideo]);

  const CATEGORIES = [
    { id: 'semua', label: 'Semua Video' },
    { id: 'ceramah', label: 'Ceramah & Kajian' },
    { id: 'murottal', label: 'Murottal Quran' },
    { id: 'kisah', label: 'Kisah & Sejarah' },
    { id: 'tanya-jawab', label: 'Tanya Jawab' },
    { id: 'sholawat', label: 'Sholawat' },
    { id: 'favorit', label: 'Favorit Saya ✨' }
  ];

  // Group videos by category for structured display
  const categorizedVideos = useMemo(() => {
    const groups: { [key in IslamicVideo['category']]?: IslamicVideo[] } = {};
    filteredVideos.forEach(video => {
      if (!groups[video.category]) {
        groups[video.category] = [];
      }
      groups[video.category]?.push(video);
    });
    return groups;
  }, [filteredVideos]);

  const CATEGORY_ORDER: IslamicVideo['category'][] = [
    'murottal',
    'sholawat',
    'ceramah',
    'kisah',
    'tanya-jawab'
  ];

  const getCategoryMeta = (cat: IslamicVideo['category'] | 'favorit') => {
    switch (cat) {
      case 'murottal':
        return {
          label: 'Murottal Al-Qur\'an',
          icon: <Sparkles className="text-emerald-500" size={16} />,
          badgeBg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/60 dark:border-emerald-900/40',
        };
      case 'sholawat':
        return {
          label: 'Sholawat Nabi Syahdu',
          icon: <Heart className="text-rose-500 fill-rose-500/10" size={16} />,
          badgeBg: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100/60 dark:border-rose-900/40',
        };
      case 'ceramah':
        return {
          label: 'Ceramah & Kajian Ilmu',
          icon: <Volume2 className="text-amber-500" size={16} />,
          badgeBg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/40',
        };
      case 'kisah':
        return {
          label: 'Kisah Sahabat & Sejarah Islam',
          icon: <BookmarkCheck className="text-blue-500" size={16} />,
          badgeBg: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100/60 dark:border-blue-900/40',
        };
      case 'tanya-jawab':
        return {
          label: 'Tanya Jawab Syariat',
          icon: <HeartHandshake className="text-purple-500" size={16} />,
          badgeBg: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-100/60 dark:border-purple-900/40',
        };
      case 'favorit':
        return {
          label: 'Koleksi Favorit Saya',
          icon: <Star className="text-amber-500 fill-amber-500/10" size={16} />,
          badgeBg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100/60 dark:border-amber-900/40',
        };
      default:
        return {
          label: 'Kumpulan Kajian Islami',
          icon: <Video className="text-slate-500" size={16} />,
          badgeBg: 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800',
        };
    }
  };

  const renderVideoRow = (video: IslamicVideo) => {
    const isActive = selectedVideo?.id === video.id;
    const isFav = favorites.includes(video.id);

    return (
      <div
        key={video.id}
        onClick={() => handlePlayVideo(video)}
        className={`p-3 bg-slate-50/40 dark:bg-slate-950/20 hover:bg-white dark:hover:bg-slate-900 rounded-2xl border transition-all text-left flex gap-3 relative overflow-hidden group hover:scale-[1.01] hover:shadow-md cursor-pointer ${
          isActive 
            ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20 bg-white dark:bg-slate-900/90' 
            : 'border-slate-100 dark:border-slate-800/40'
        }`}
      >
        {/* Compact Thumbnail Frame */}
        <div className="w-24 sm:w-28 aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl relative overflow-hidden shrink-0 shadow-sm border border-slate-200/50 dark:border-slate-800">
          <img 
            src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} 
            alt={video.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/15 group-hover:bg-black/10 flex items-center justify-center transition-colors">
            <PlayCircle size={22} className={`text-white drop-shadow-md transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} fill="currentColor" />
          </div>
          
          {/* Compact Badge Duration */}
          <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[9px] font-bold text-white leading-none scale-90">
            {video.duration}
          </div>

          {/* Small Active Stream Icon */}
          {isActive && isPlaying && (
            <div className="absolute top-1 left-1 bg-emerald-600 p-0.5 rounded-full z-10">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </span>
            </div>
          )}
        </div>

        {/* Meta Fields Column */}
        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
          <div className="min-w-0">
            <h4 className={`text-xs font-bold leading-snug line-clamp-2 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors ${
              isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
            }`}>
              {video.title}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
              {video.speaker}
            </p>
          </div>

          <div className="flex items-center justify-between mt-1 text-[9px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide uppercase">
            <span>{video.views}</span>
            <div className="flex items-center gap-1.5">
              {/* Favorite action widget */}
              <button 
                onClick={(e) => toggleFavorite(video.id, e)}
                className={`p-1 rounded-md transition-colors ${
                  isFav ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20' : 'text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850'
                }`}
              >
                <Heart size={14} className={isFav ? "fill-rose-500" : ""} />
              </button>
              
              {/* Share widget */}
              <button 
                onClick={(e) => handleShare(video, e)}
                className="p-1 text-slate-350 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-md transition-colors"
              >
                <Share2 size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 dark:from-red-950 dark:via-rose-950 dark:to-slate-900 text-white border-b border-rose-700/40 shadow-md px-4 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 -ml-2 text-white hover:bg-white/15 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="font-extrabold text-white text-lg flex items-center gap-2">
              <Video size={20} className="text-red-200" /> Kumpulan Video Islami
            </h2>
            <p className="text-[10px] text-red-100/90 font-bold uppercase tracking-wider">
              Kajian Pilihan Penyejuk Hati
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Player & Video Info (Span 7) */}
        <div className="lg:col-span-7 flex flex-col">
          {selectedVideo ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-800/60 shadow-xl overflow-hidden transition-all duration-300">
              {/* YouTube Aspect Frame */}
              <div className="w-full aspect-video bg-black relative group overflow-hidden border-b border-slate-100 dark:border-slate-800">
                {!isPlaying ? (
                  <button 
                    onClick={() => setIsPlaying(true)} 
                    className="absolute inset-0 w-full h-full flex flex-col items-center justify-center group overflow-hidden"
                  >
                    <img 
                      src={`https://img.youtube.com/vi/${selectedVideo.id}/hqdefault.jpg`}
                      alt={selectedVideo.title}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 filter brightness-75 group-hover:brightness-[0.65]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="z-10 w-16 h-16 bg-red-600 dark:bg-red-700 rounded-full flex items-center justify-center shadow-2xl scale-95 group-hover:scale-110 active:scale-90 transition-transform duration-300">
                      <Play size={30} className="text-white ml-1 fill-white" />
                    </div>
                    <span className="z-10 text-white font-bold tracking-wide mt-3 text-xs drop-shadow-lg bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                      Ketuk untuk Memutar Video
                    </span>
                    
                    {/* Floating Duration badge */}
                    <div className="absolute bottom-4 right-4 bg-black/75 px-2.5 py-0.5 rounded text-[11px] font-bold text-white tracking-wide">
                      {selectedVideo.duration}
                    </div>
                  </button>
                ) : (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube-nocookie.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-none"
                  ></iframe>
                )}
              </div>

              {/* Video Text Metadata */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300">
                    {selectedVideo.category.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Eye size={12} /> {selectedVideo.views}
                  </span>
                </div>

                <h1 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 leading-snug mb-2">
                  {selectedVideo.title}
                </h1>
                
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {selectedVideo.speaker}
                </p>

                {/* Action Row */}
                <div className="flex flex-wrap items-center gap-3 border-t border-b border-slate-100 dark:border-slate-800 py-3.5 mb-5">
                  <button 
                    onClick={(e) => toggleFavorite(selectedVideo.id, e)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      favorites.includes(selectedVideo.id) 
                        ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border border-rose-100 dark:border-rose-900/40' 
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-150 dark:border-slate-800'
                    }`}
                  >
                    <Heart size={16} className={favorites.includes(selectedVideo.id) ? "fill-rose-500 text-rose-500" : ""} />
                    {favorites.includes(selectedVideo.id) ? 'Tersimpan' : 'Favoritkan'}
                  </button>

                  <button 
                    onClick={(e) => handleShare(selectedVideo, e)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-150 dark:border-slate-800 rounded-2xl text-xs font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Share2 size={16} />
                    Bagikan Video
                  </button>

                  <a 
                    href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 rounded-2xl text-xs font-bold transition-all hover:bg-red-100 dark:hover:bg-red-950/40"
                  >
                    <ExternalLink size={16} />
                    Tonton di YouTube
                  </a>

                  <button 
                    onClick={() => setReportingVideo(selectedVideo)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-150 dark:border-slate-800 rounded-2xl text-xs font-bold transition-all hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-100 dark:hover:border-red-900/40"
                  >
                    <Flag size={16} />
                    Laporkan
                  </button>

                  <div className="hidden sm:block ml-auto text-xs text-slate-400 font-medium">
                    Dipublikasi {selectedVideo.publishedAt}
                  </div>
                </div>

                {/* Detailed Description */}
                <div>
                  <h3 className="font-bold text-xs uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-2 flex items-center gap-1.5">
                    <Info size={14} /> Tentang Kajian Ini
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
                    {selectedVideo.description}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-900/40 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
              <Video className="mx-auto mb-3 text-slate-300 dark:text-slate-700" size={48} />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pilih video dari daftar untuk memutar sekarang.</p>
            </div>
          )}
        </div>

        {/* Right Column: Search, Categories, and Video List Grid (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Card Wrapper for Filtration */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-800/80 shadow-md p-5 flex flex-col gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari tema, pembicara, hadits, surah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400 transition-all text-slate-800 dark:text-slate-100"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-slate-200 hover:bg-slate-350 dark:bg-slate-800 px-1.5 py-0.5 rounded-md"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Scrollable Categories List */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 mask-image">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all relative ${
                    activeCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 dark:shadow-none'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-150 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Videos Scroller/Result List grouped by Category */}
          <div className="flex-1 max-h-[500px] lg:max-h-[60vh] overflow-y-auto no-scrollbar flex flex-col gap-4 pr-1">
            <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest px-1 flex items-center justify-between">
              <span>Daftar Video ({filteredVideos.length})</span>
              <span className="text-[10px] font-bold text-slate-500 lowercase">ketuk untuk memutar</span>
            </h3>

            {filteredVideos.length > 0 ? (
              activeCategory === 'favorit' ? (
                (() => {
                  const meta = getCategoryMeta('favorit');
                  return (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-800/50 p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                        {meta.icon}
                        <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">{meta.label}</h4>
                        <span className={`ml-auto text-[10px] font-bold px-2.5 py-0.5 rounded-full ${meta.badgeBg}`}>
                          {filteredVideos.length} Video
                        </span>
                      </div>
                      <div className="flex flex-col gap-3">
                        {filteredVideos.map(video => renderVideoRow(video))}
                      </div>
                    </div>
                  );
                })()
              ) : activeCategory !== 'semua' ? (
                (() => {
                  const meta = getCategoryMeta(activeCategory);
                  return (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-800/50 p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                        {meta.icon}
                        <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">{meta.label}</h4>
                        <span className={`ml-auto text-[10px] font-bold px-2.5 py-0.5 rounded-full ${meta.badgeBg}`}>
                          {filteredVideos.length} Video
                        </span>
                      </div>
                      <div className="flex flex-col gap-3">
                        {filteredVideos.map(video => renderVideoRow(video))}
                      </div>
                    </div>
                  );
                })()
              ) : (
                CATEGORY_ORDER.map(catId => {
                  const videosInCat = categorizedVideos[catId] || [];
                  if (videosInCat.length === 0) return null;
                  const meta = getCategoryMeta(catId);

                  return (
                    <div key={catId} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-150 dark:border-slate-800/50 p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                        {meta.icon}
                        <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">{meta.label}</h4>
                        <span className={`ml-auto text-[10px] font-bold px-2.5 py-0.5 rounded-full ${meta.badgeBg}`}>
                          {videosInCat.length} Video
                        </span>
                      </div>
                      <div className="flex flex-col gap-3">
                        {videosInCat.map(video => renderVideoRow(video))}
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-150 dark:border-slate-800/80">
                <AlertCircle className="mx-auto mb-2 text-slate-300 dark:text-slate-700" size={36} />
                <p className="text-slate-600 dark:text-slate-400 text-xs font-bold mb-1">Tidak Ada Hasil Ditemukan</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">Kami tidak dapat menemukan video Islami yang cocok dengan kata pencarian Anda.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Report Modal */}
      {reportingVideo && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-150 dark:border-slate-800 shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setReportingVideo(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 text-red-500 mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-950/40 rounded-xl">
                <Flag size={20} className="fill-red-500/10" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide">Laporkan Video</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Laporkan masalah pada konten video ini</p>
              </div>
            </div>

            <div className="mb-4 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 p-3.5 rounded-2xl">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1 mb-0.5">{reportingVideo.title}</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{reportingVideo.speaker}</p>
            </div>

            <div className="space-y-3 mb-5">
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Pilih Alasan Pelaporan</label>
              {[
                { id: 'video_broken', label: 'Video rusak / tidak dapat diputar' },
                { id: 'wrong_content', label: 'Konten bermasalah / kurang akurat' },
                { id: 'bad_quality', label: 'Kualitas gambar atau suara sangat buruk' },
                { id: 'copyright', label: 'Masalah hak cipta / plagiasi' },
                { id: 'other', label: 'Lainnya' }
              ].map(reason => (
                <button
                  key={reason.id}
                  onClick={() => setReportReason(reason.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all text-xs font-semibold
                    ${reportReason === reason.id
                      ? 'border-red-500 bg-red-50/30 dark:bg-red-950/10 text-red-600 dark:text-red-400'
                      : 'border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-950/20'
                    }`}
                >
                  <span>{reason.label}</span>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all
                    ${reportReason === reason.id ? 'border-red-500 bg-red-500' : 'border-slate-300 dark:border-slate-700'}`}
                  >
                    {reportReason === reason.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              ))}

              <div className="mt-3">
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Tambahkan detail laporan Anda di sini (opsional)..."
                  className="w-full h-20 p-3 rounded-2xl border border-slate-150 dark:border-slate-800 bg-transparent text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:border-red-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setReportingVideo(null)}
                className="py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleSendVideoReport}
                disabled={isSubmittingReport}
                className="py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-red-600/10 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSubmittingReport ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim Laporan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IslamicVideosScreen;
